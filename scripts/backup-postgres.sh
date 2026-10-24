#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${1:-vidya_postgres}"
DB="${2:-vidya_cloud}"
USER="${3:-vidya_user}"
BACKUP_DIR="${4:-./backups/postgres}"

echo "=== Vidya Setu: Cloud PostgreSQL Backup ==="
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cloud_backup_${TIMESTAMP}.dump"

echo "Running pg_dump in container $CONTAINER..."
docker exec -t "$CONTAINER" pg_dump -U "$USER" -d "$DB" -F c -b -v -f /tmp/backup.dump
docker cp "${CONTAINER}:/tmp/backup.dump" "$BACKUP_FILE"
docker exec -t "$CONTAINER" rm -f /tmp/backup.dump

echo "Backup created successfully: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"
