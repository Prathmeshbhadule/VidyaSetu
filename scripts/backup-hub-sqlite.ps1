param (
    [string]$DatabasePath = "./apps/hub/data/hub.sqlite",
    [string]$BackupDir = "./backups/hub"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Vidya Setu: School Hub SQLite Backup ===" -ForegroundColor Cyan

if (-not (Test-Path $DatabasePath)) {
    Write-Warning "Database file not found at $DatabasePath. Checking default location..."
    if (Test-Path "apps/hub/hub.sqlite") {
        $DatabasePath = "apps/hub/hub.sqlite"
    } else {
        Write-Error "SQLite database not found. Ensure the School Hub has run migrations."
        exit 1
    }
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "hub_backup_$Timestamp.sqlite"

Write-Host "Creating backup of $DatabasePath to $BackupFile..." -ForegroundColor Green

# Use node with better-sqlite3 backup API to ensure clean point-in-time snapshot during WAL mode
$BackupScript = @"
const Database = require('better-sqlite3');
const db = new Database('$($DatabasePath.Replace('\', '/'))', { readonly: true });
db.backup('$($BackupFile.Replace('\', '/'))')
  .then(() => {
    console.log('Online WAL backup completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Backup failed:', err);
    process.exit(1);
  });
"@

node -e $BackupScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed successfully: $BackupFile" -ForegroundColor Green
    $Size = (Get-Item $BackupFile).Length / 1KB
    Write-Host ("Backup size: {0:N2} KB" -f $Size) -ForegroundColor Gray
} else {
    Write-Error "SQLite backup failed."
    exit 1
}
