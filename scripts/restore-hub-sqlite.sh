#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:-}"
TARGET_PATH="${2:-./apps/hub/data/hub.sqlite}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "Usage: ./scripts/restore-hub-sqlite.sh <path-to-backup-file> [target-db-path]" >&2
    exit 1
fi

echo "=== Vidya Setu: School Hub SQLite Restore ==="

TARGET_DIR=$(dirname "$TARGET_PATH")
mkdir -p "$TARGET_DIR"

if [ -f "$TARGET_PATH" ]; then
    PRE_RESTORE="${TARGET_PATH}.pre_restore_$(date +%Y%m%d_%H%M%S)"
    echo "Preserving existing database to: $PRE_RESTORE"
    cp "$TARGET_PATH" "$PRE_RESTORE"
fi

echo "Restoring $BACKUP_FILE to $TARGET_PATH..."
cp "$BACKUP_FILE" "$TARGET_PATH"

rm -f "${TARGET_PATH}-wal" "${TARGET_PATH}-shm"

echo "Database restored successfully."
