param (
    [string]$ContainerName = "vidya_postgres",
    [string]$Database = "vidya_cloud",
    [string]$Username = "vidya_user",
    [string]$BackupDir = "./backups/postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Vidya Setu: Cloud PostgreSQL Backup ===" -ForegroundColor Cyan

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "cloud_backup_$Timestamp.dump"

Write-Host "Creating pg_dump of $Database from container $ContainerName..." -ForegroundColor Green

docker exec -t $ContainerName pg_dump -U $Username -d $Database -F c -b -v -f /tmp/backup.dump
docker cp "${ContainerName}:/tmp/backup.dump" $BackupFile
docker exec -t $ContainerName rm -f /tmp/backup.dump

if (Test-Path $BackupFile) {
    Write-Host "PostgreSQL backup created successfully: $BackupFile" -ForegroundColor Green
    $Size = (Get-Item $BackupFile).Length / 1MB
    Write-Host ("Backup size: {0:N2} MB" -f $Size) -ForegroundColor Gray
} else {
    Write-Error "PostgreSQL backup failed."
    exit 1
}
