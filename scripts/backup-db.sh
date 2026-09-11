#!/usr/bin/env bash
# Sauvegarde de la base de production, compressée et horodatée.
#
#   ./scripts/backup-db.sh [répertoire]
#
# Une sauvegarde qui reste sur la même machine ne protège de rien : copier
# ensuite le fichier produit vers un stockage distant.

set -euo pipefail

destination="${1:-./backups}"
compose_file="${COMPOSE_FILE:-docker-compose.prod.yml}"
stamp="$(date +%Y%m%d-%H%M%S)"
archive="${destination}/pokedata-${stamp}.sql.gz"

mkdir -p "${destination}"

# Le schéma `staging` est exclu : c'est un miroir des CSV PokéAPI, reconstruit
# par `pnpm ingest:fetch && pnpm ingest:stage`. Le sauvegarder chaque jour
# reviendrait à archiver une copie d'un dépôt public.
docker compose -f "${compose_file}" exec -T postgres \
  pg_dump -U postgres --clean --if-exists --exclude-schema=staging pokedata \
  | gzip -9 > "${archive}"

echo "sauvegarde : ${archive} ($(du -h "${archive}" | cut -f1))"

# Conserve les 14 dernières.
ls -1t "${destination}"/pokedata-*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --
