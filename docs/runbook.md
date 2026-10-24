# Vidya Setu - Operational Runbook

This guide covers deployment, daily operations, backup & disaster recovery, and offline content distribution for Vidya Setu.

---

## 1. School Hub Setup & Operations (Tier 2)

The School Hub is an autonomous Node.js service that runs locally in the classroom to coordinate synchronization and host cached videos without internet.

### Option A: Running on a Spare PC or Laptop (Windows / Linux / macOS)

**Prerequisites:**
- Node.js 20 LTS installed.
- Machine connected to the school's local Wi-Fi router (no internet required).

**Installation Steps:**
```bash
# 1. Clone or copy the release bundle
cd /opt/vidya-setu # or C:\vidya-setu on Windows

# 2. Configure environment
cp apps/hub/.env.example apps/hub/.env

# 3. Install and run database migrations
pnpm --filter @vidya-setu/hub run build
node apps/hub/dist/server.js
```

The School Hub API will start on `http://0.0.0.0:3002`.

### Option B: Running on an Android Tablet / Phone via Termux

Rural schools with no desktop computer can run the School Hub directly on any teacher's Android phone (Android 7.0+) using Termux.

**Installation Steps in Termux:**
```bash
# 1. Update Termux packages and install Node.js and build tools
pkg update -y
pkg install -y nodejs-lts git python make clang

# 2. Navigate to storage and clone repository
cd ~/
git clone https://github.com/vidyasetu/vidya-setu.git
cd vidya-setu

# 3. Install dependencies and build
npm install -g pnpm
pnpm install
pnpm --filter @vidya-setu/shared run build
pnpm --filter @vidya-setu/hub run build

# 4. Launch Hub service in background with wake-lock
termux-wake-lock
cd apps/hub && node dist/server.js
```

To find the Hub's IP address on the classroom Wi-Fi network:
```bash
ifconfig wlan0 | grep "inet "
```
Point classroom tablets to `http://<hub-ip>:3002`.

---

## 2. Cloud Infrastructure Deployment (Tier 3)

The cloud backend is containerized and managed via Docker Compose.

### Starting the Cloud Stack

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Launch PostgreSQL, Redis, MinIO, Cloud API, Hub, and Web PWA
docker compose up -d

# 3. Check service health
docker compose ps
curl http://localhost:3001/healthz
```

### Services and Port Map:
- **Web PWA (Nginx)**: `http://localhost:8080`
- **Cloud API**: `http://localhost:3001`
- **School Hub**: `http://localhost:3002`
- **PostgreSQL 16**: `localhost:5432`
- **Redis 7**: `localhost:6379`
- **MinIO Console**: `http://localhost:9001` (Credentials: `minioadmin` / `minioadmin123`)

---

## 3. Backup and Disaster Recovery Procedures

### 3.1. School Hub SQLite Backup

Because the School Hub uses SQLite with Write-Ahead Logging (`WAL`), simply copying `hub.sqlite` while the process is active can result in a corrupted backup if a write is in flight. Use SQLite's online backup API or the provided backup script.

**Using PowerShell (Windows):**
```powershell
./scripts/backup-hub-sqlite.ps1 -DatabasePath "./apps/hub/data/hub.sqlite" -BackupDir "./backups/hub"
```

**Using Bash (Linux / Termux):**
```bash
./scripts/backup-hub-sqlite.sh ./apps/hub/data/hub.sqlite ./backups/hub
```

**Restoring Hub Database:**
```powershell
./scripts/restore-hub-sqlite.ps1 -BackupFile "./backups/hub/hub_backup_YYYYMMDD.sqlite" -TargetPath "./apps/hub/data/hub.sqlite"
```

### 3.2. Cloud PostgreSQL Backup & Restore

**Automated Backup:**
```powershell
./scripts/backup-postgres.ps1 -ContainerName "vidya_postgres" -Database "vidya_cloud" -BackupDir "./backups/postgres"
```

**Manual pg_dump:**
```bash
docker exec -t vidya_postgres pg_dump -U vidya_user -d vidya_cloud -F c -b -v -f /tmp/backup.dump
docker cp vidya_postgres:/tmp/backup.dump ./backups/cloud_backup_$(date +%Y%m%d).dump
```

**Restoring PostgreSQL:**
```bash
docker exec -i vidya_postgres pg_restore -U vidya_user -d vidya_cloud --clean --if-exists -v < ./backups/cloud_backup.dump
```

---

## 4. Offline Content Pack "Sneakernet" Distribution

When rural schools have zero internet access for months, new video lessons and schemes are transferred via physical USB flash drives or micro-SD cards ("sneakernet"):

1. **At District Office (Online)**:
   - Export new versioned Content Pack from Cloud API:
     ```bash
     curl -O http://localhost:3001/api/v1/content/packs/export?version=2.0.0
     ```
   - Copy `content-pack-v2.0.0.zip` and `manifest.json` with SHA-256 checksums to USB thumb drives.
2. **At Rural School (Offline)**:
   - Insert USB drive into the School Hub PC.
   - Run the import command:
     ```bash
     pnpm --filter @vidya-setu/hub import-pack /mnt/usb/content-pack-v2.0.0.zip
     ```
   - The Hub unpacks media files into its local cache and increments `content_pack_version` in SQLite.
   - Classroom tablets automatically discover the updated pack when connected to the classroom Wi-Fi.

---

## 5. Troubleshooting & Health Monitoring

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **Tablet shows "Hub Unreachable"** | Tablet connected to wrong Wi-Fi or Hub IP changed | Ensure tablet is connected to classroom Wi-Fi router. Check Hub IP via `ipconfig` or `ifconfig` and re-pair tablet in Hub Settings. |
| **Pending Outbox count not decreasing** | Hub is offline or cloud connection failed | In local Wi-Fi mode, tablet syncs to Hub instantly. If syncing directly to cloud, verify internet link. Check `apps/hub` log for HTTP errors. |
| **Database is locked error in Hub** | Concurrent writes in SQLite without busy handler | Ensure `WAL` mode is enabled: `PRAGMA journal_mode=WAL;`. The Hub migrator sets `busy_timeout = 5000` automatically. |
| **Web Speech voice not speaking in Marathi/Hindi** | Device lacks offline regional voice engine | The PWA gracefully falls back to pre-recorded MP3/OGG audio files bundled in the lesson pack. |
