#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${1:-./apps/hub/data/hub.sqlite}"
BACKUP_DIR="${2:-./backups/hub}"

echo "=== Vidya Setu: School Hub SQLite Backup ==="

if [ ! -f "$DB_PATH" ]; then
    if [ -f "apps/hub/hub.sqlite" ]; then
        DB_PATH="apps/hub/hub.sqlite"
    else
        echo "Error: Database file not found at $DB_PATH" >&2
        exit 1
    fi
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/hub_backup_${TIMESTAMP}.sqlite"

echo "Creating online backup to $BACKUP_FILE..."

node -e "
const Database = require('better-sqlite3');
const db = new Database('$DB_PATH', { readonly: true });
db.backup('$BACKUP_FILE')
  .then(() => {
    console.log('Online WAL backup completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Backup failed:', err);
    process.exit(1);
  });
"

echo "Backup completed successfully: $BACKUP_FILE"
ls -lh "$BACKUP_FILE"
