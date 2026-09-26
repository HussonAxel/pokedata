"""Exercise the deployment gates without touching Docker, GitHub or production."""

import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("deploy-production.sh").resolve()
SHA = "a" * 40


class DeploymentGates(unittest.TestCase):
    def run_case(self, conclusion="success", deployed=False, changed=False, fail=""):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            state = root / "state"
            state.mkdir()
            (state / "production.env").write_text("TEST=1\n")
            if deployed:
                (state / "deployed-sha").write_text(SHA + "\n")
            binary = root / "bin"
            binary.mkdir()
            # Real tar consumes a genuine empty tar archive from the mock git.
            mock = binary / "mock"
            mock.write_text('''#!/usr/bin/env python3
import io, os, pathlib, sys, tarfile
name = pathlib.Path(sys.argv[0]).name
args = " ".join(sys.argv[1:])
with open(os.environ["CALLS"], "a") as log:
    log.write(name + " " + args + "\\n")
sha = "a" * 40
if name == "gh":
    print(os.environ["CONCLUSION"] if "actions/workflows" in args else sha)
elif name == "git":
    if "rev-parse" in args:
        print("b" * 40 if os.environ["CHANGED"] == "1" else sha)
    elif "archive" in args:
        with tarfile.open(fileobj=sys.stdout.buffer, mode="w|"):
            pass
elif name == "docker":
    fail = os.environ["FAIL"]
    if fail and fail in args:
        if args.startswith("wait"):
            print("1")
        else:
            sys.exit(1)
    elif "ps -aq migrate" in args:
        print("migration-container")
    elif args.startswith("wait"):
        print("0")
''')
            mock.chmod(0o700)
            for name in ("gh", "git", "docker", "curl"):
                (binary / name).symlink_to(mock)
            calls = root / "calls"
            environment = dict(os.environ, PATH=f"{binary}:{os.environ['PATH']}",
                               POKEDATA_DEPLOY_DIR=str(state), CALLS=str(calls),
                               CONCLUSION=conclusion, CHANGED=str(int(changed)), FAIL=fail)
            result = subprocess.run(["bash", str(SCRIPT)], env=environment,
                                    capture_output=True, text=True)
            log = calls.read_text()
            marker = state / "deployed-sha"
            return result.returncode, log, marker.read_text().strip() if marker.exists() else None

    def test_pending_or_failed_ci_never_touches_docker(self):
        for conclusion in ("pending", "failure", "cancelled"):
            code, log, marker = self.run_case(conclusion=conclusion)
            self.assertEqual(code, 0)
            self.assertNotIn("docker ", log)
            self.assertIsNone(marker)
            self.assertIn("event=push&head_sha=" + SHA, log)

    def test_already_deployed_is_noop(self):
        code, log, marker = self.run_case(deployed=True)
        self.assertEqual(code, 0)
        self.assertNotIn("docker ", log)
        self.assertEqual(marker, SHA)

    def test_newer_master_skips_old_commit(self):
        code, log, marker = self.run_case(changed=True)
        self.assertEqual(code, 0)
        self.assertNotIn("docker ", log)
        self.assertIsNone(marker)

    def test_failed_build_or_backup_does_not_run_migrations(self):
        for failure in ("build web migrate", "pg_dump"):
            code, log, marker = self.run_case(fail=failure)
            self.assertNotEqual(code, 0)
            self.assertNotIn("--force-recreate migrate", log)
            self.assertIsNone(marker)

    def test_failed_migration_does_not_replace_web(self):
        code, log, marker = self.run_case(fail="wait migration-container")
        self.assertNotEqual(code, 0)
        self.assertNotIn("--wait --wait-timeout", log)
        self.assertIsNone(marker)

    def test_unhealthy_web_is_not_marked_deployed(self):
        code, log, marker = self.run_case(fail="--wait --wait-timeout")
        self.assertNotEqual(code, 0)
        self.assertIsNone(marker)

    def test_success_records_commit_after_health_check(self):
        code, log, marker = self.run_case()
        self.assertEqual(code, 0)
        self.assertEqual(marker, SHA)
        self.assertLess(log.index("pg_dump"), log.index("--force-recreate migrate"))
        self.assertLess(log.index("wait migration-container"), log.index("--wait --wait-timeout"))
        self.assertIn("curl --fail", log)


if __name__ == "__main__":
    unittest.main()
