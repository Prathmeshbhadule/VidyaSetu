#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:-}"
CONTAINER="${2:-vidya_postgres}"
DB="${3:-vidya_cloud}"
USER="${4:-vidya_user}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "Usage: ./scripts/restore-postgres.sh <backup-file.dump> [container] [db] [user]" >&2
    exit 1
fi

echo "=== Vidya Setu: Cloud PostgreSQL Restore ==="
docker cp "$BACKUP_FILE" "${CONTAINER}:/tmp/restore.dump"
docker exec -t "$CONTAINER" pg_restore -U "$USER" -d "$DB" --clean --if-exists -v /tmp/restore.dump
docker exec -t "$CONTAINER" rm -f /tmp/restore.dump
echo "PostgreSQL restore completed successfully."
