#!/usr/bin/env bash
# Run as the account owning the Docker deployment, with an authenticated gh CLI.
# Usage: bash scripts/install-auto-deploy.sh /absolute/path/to/production.env
set -euo pipefail
umask 077
env_file="${1:?Usage: install-auto-deploy.sh /path/to/production.env}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
state="$HOME/.local/share/pokedata-deploy"
units="$HOME/.config/systemd/user"
for dependency in gh git docker curl flock python3; do
  command -v "$dependency" >/dev/null
done
gh auth status >/dev/null 2>&1
docker info >/dev/null
[[ -s "$env_file" ]]
mkdir -p "$state" "$units"
chmod 700 "$state"
install -m 600 "$env_file" "$state/production.env"
install -m 700 "$script_dir/deploy-production.sh" "$state/deploy-production.sh"
cat > "$units/pokedata-deploy.service" <<'EOF'
[Unit]
Description=Deploy Pokedata master after successful GitHub CI

[Service]
Type=oneshot
ExecStart=/bin/bash %h/.local/share/pokedata-deploy/deploy-production.sh
TimeoutStartSec=30min
UMask=0077
EOF
cat > "$units/pokedata-deploy.timer" <<'EOF'
[Unit]
Description=Check Pokedata deployment every minute

[Timer]
OnBootSec=2min
OnUnitInactiveSec=60s

[Install]
WantedBy=timers.target
EOF
systemctl --user daemon-reload
systemctl --user enable --now pokedata-deploy.timer
if [[ "$(loginctl show-user "$USER" -p Linger --value)" != yes ]]; then
  echo "Enable startup without login: sudo loginctl enable-linger $USER" >&2
fi
echo 'Automatic deployment enabled. Logs: journalctl --user -u pokedata-deploy.service'
