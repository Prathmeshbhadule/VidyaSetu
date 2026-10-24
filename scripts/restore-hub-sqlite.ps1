param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$TargetPath = "./apps/hub/data/hub.sqlite"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Vidya Setu: School Hub SQLite Restore ===" -ForegroundColor Cyan

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found at: $BackupFile"
    exit 1
}

$TargetDir = Split-Path $TargetPath -Parent
if ($TargetDir -and -not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

# If existing target exists, take safety snapshot before replacing
if (Test-Path $TargetPath) {
    $PreRestoreBackup = "$TargetPath.pre_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host "Safely preserving current database at: $PreRestoreBackup" -ForegroundColor Yellow
    Copy-Item $TargetPath $PreRestoreBackup
}

Write-Host "Restoring $BackupFile to $TargetPath..." -ForegroundColor Green
Copy-Item -Path $BackupFile -Destination $TargetPath -Force

# Clean up stale WAL / SHM files if present
$WalFile = "$TargetPath-wal"
$ShmFile = "$TargetPath-shm"
if (Test-Path $WalFile) { Remove-Item $WalFile -Force }
if (Test-Path $ShmFile) { Remove-Item $ShmFile -Force }

Write-Host "Database successfully restored. Run migrations/checks to verify schema." -ForegroundColor Green
