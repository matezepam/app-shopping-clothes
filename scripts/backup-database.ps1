[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composePath = Join-Path $repositoryRoot "compose.yaml"
$environmentPath = Join-Path $repositoryRoot ".env"
$backupDirectory = Join-Path $repositoryRoot "backups"

if (-not (Test-Path -LiteralPath $environmentPath -PathType Leaf)) { throw "Falta .env. Ejecuta primero scripts\docker-up.ps1." }
New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
$backupSetPath = Join-Path $backupDirectory ("sprint-databases-{0}" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $backupSetPath -Force | Out-Null

$environmentValues = @{}
Get-Content -LiteralPath $environmentPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { $environmentValues[$matches[1].Trim()] = $matches[2].Trim() }
}
$identityDatabase = if ($environmentValues["IDENTITY_DATABASE"]) { $environmentValues["IDENTITY_DATABASE"] } else { "sprint_identity" }
$commerceDatabase = if ($environmentValues["COMMERCE_DATABASE"]) { $environmentValues["COMMERCE_DATABASE"] } else { "sprint_commerce" }
$databases = @($identityDatabase, $commerceDatabase)
$databases | ForEach-Object {
    if ($_ -notmatch '^[a-zA-Z][a-zA-Z0-9_]{2,62}$') { throw "Nombre de base de datos no permitido: $_" }
}

Push-Location $repositoryRoot
try {
    $containerId = (docker compose --env-file $environmentPath -f $composePath ps -q postgres).Trim()
    if ($containerId -notmatch '^[a-f0-9]{12,64}$') { throw "PostgreSQL no está iniciado o no se pudo resolver su contenedor." }

    foreach ($database in $databases) {
        $containerBackup = "/tmp/$database.backup"
        $backupPath = Join-Path $backupSetPath "$database.dump"
        docker compose --env-file $environmentPath -f $composePath exec -T -e "BACKUP_DATABASE=$database" postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$BACKUP_DATABASE" --format=custom --file="/tmp/$BACKUP_DATABASE.backup"'
        if ($LASTEXITCODE -ne 0) { throw "pg_dump no pudo respaldar $database." }
        docker cp "${containerId}:${containerBackup}" $backupPath
        if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar el respaldo de $database." }
        docker compose --env-file $environmentPath -f $composePath exec -T postgres rm -f -- $containerBackup | Out-Null
        if ((Get-Item -LiteralPath $backupPath).Length -le 0) { throw "El respaldo de $database está vacío." }
    }

    Write-Host "Respaldo verificado de identidad y comercio: $backupSetPath" -ForegroundColor Green
} finally {
    Pop-Location
}
