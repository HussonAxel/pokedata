#!/usr/bin/env bash
# Installed on the server, outside the development checkout. Only deploys a
# successful push CI run for the current master commit; never a pull request.
set -euo pipefail
umask 077

repo="HussonAxel/pokedata"
state="${POKEDATA_DEPLOY_DIR:-${HOME}/.local/share/pokedata-deploy}"
mkdir -p "$state"
exec 9>"$state/deploy.lock"
flock -n 9 || exit 0

sha="$(gh api "repos/$repo/commits/master" --jq .sha)"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 1; }
if [[ -f "$state/deployed-sha" ]] && [[ "$(cat "$state/deployed-sha")" == "$sha" ]]; then
  exit 0
fi

# Query the workflow by filename and filter by both event and exact SHA.
# Select the latest attempt, including a pending/failed rerun of a previous run.
conclusion="$(gh api "repos/$repo/actions/workflows/ci.yml/runs?branch=master&event=push&head_sha=$sha&per_page=1" \
  --jq '.workflow_runs[0].conclusion // "pending"')"
if [[ "$conclusion" != success ]]; then
  echo "Waiting for successful push CI: $sha ($conclusion)"
  exit 0
fi
[[ -s "$state/production.env" ]] || { echo 'Missing production.env' >&2; exit 1; }

if [[ ! -d "$state/source.git" ]]; then
  git init --bare "$state/source.git"
fi
git --git-dir="$state/source.git" fetch --depth=1 "https://github.com/$repo.git" refs/heads/master
# A newer push arrived during the CI check: wait for its own validation.
[[ "$(git --git-dir="$state/source.git" rev-parse FETCH_HEAD)" == "$sha" ]] || exit 0
release="$state/releases/$sha"
mkdir -p "$release"
git --git-dir="$state/source.git" archive "$sha" | tar -x -C "$release"
compose=(docker compose --project-name pokedata --env-file "$state/production.env" -f "$release/docker-compose.prod.yml")
"${compose[@]}" config --quiet

echo "Building production commit $sha"
"${compose[@]}" build web migrate
[[ "$(gh api "repos/$repo/commits/master" --jq .sha)" == "$sha" ]] || exit 0

# Build failure leaves the running site untouched. Save the complete database
# before migrations. A failed migration prevents replacement of the web service.
mkdir -p "$state/backups"
backup="$state/backups/$(date -u +%Y%m%dT%H%M%SZ)-$sha.sql.gz"
"${compose[@]}" exec -T postgres pg_dump -U postgres --clean --if-exists pokedata | gzip > "$backup.tmp"
mv "$backup.tmp" "$backup"
"${compose[@]}" up -d --no-deps --force-recreate migrate
migration_id="$("${compose[@]}" ps -aq migrate)"
[[ -n "$migration_id" ]] || exit 1
migration_exit="$(docker wait "$migration_id")"
if [[ "$migration_exit" != 0 ]]; then
  echo "Migration failed; web container left running. Backup: $backup" >&2
  exit 1
fi
"${compose[@]}" up -d --no-deps --wait --wait-timeout 180 web
"${compose[@]}" --profile tunnel up -d --no-deps cloudflared
curl --fail --silent --show-error --max-time 20 http://127.0.0.1:3001/ -o /dev/null
printf '%s\n' "$sha" > "$state/deployed-sha.tmp"
mv "$state/deployed-sha.tmp" "$state/deployed-sha"
echo "Deployed and healthy: $sha"
