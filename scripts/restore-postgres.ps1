param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$ContainerName = "vidya_postgres",
    [string]$Database = "vidya_cloud",
    [string]$Username = "vidya_user"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Vidya Setu: Cloud PostgreSQL Restore ===" -ForegroundColor Cyan

if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found at: $BackupFile"
    exit 1
}

Write-Host "Copying $BackupFile into container $ContainerName..." -ForegroundColor Green
docker cp $BackupFile "${ContainerName}:/tmp/restore.dump"

Write-Host "Restoring database $Database with pg_restore..." -ForegroundColor Green
docker exec -t $ContainerName pg_restore -U $Username -d $Database --clean --if-exists -v /tmp/restore.dump
docker exec -t $ContainerName rm -f /tmp/restore.dump

Write-Host "PostgreSQL restore completed successfully." -ForegroundColor Green
