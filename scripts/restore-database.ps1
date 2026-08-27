[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$BackupPath,
    [Parameter(Mandatory)]
    [switch]$ConfirmRestore,
    [switch]$LeaveStopped
)

$ErrorActionPreference = "Stop"
if (-not $ConfirmRestore) { throw "La restauración reemplaza los datos actuales. Vuelve a ejecutar con -ConfirmRestore." }
$resolvedBackup = (Resolve-Path -LiteralPath $BackupPath).Path
if (-not (Test-Path -LiteralPath $resolvedBackup -PathType Container)) { throw "BackupPath debe ser la carpeta generada por backup-database.ps1." }

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composePath = Join-Path $repositoryRoot "compose.yaml"
$environmentPath = Join-Path $repositoryRoot ".env"
if (-not (Test-Path -LiteralPath $environmentPath -PathType Leaf)) { throw "Falta .env." }

$environmentValues = @{}
Get-Content -LiteralPath $environmentPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { $environmentValues[$matches[1].Trim()] = $matches[2].Trim() }
}
$identityDatabase = if ($environmentValues["IDENTITY_DATABASE"]) { $environmentValues["IDENTITY_DATABASE"] } else { "sprint_identity" }
$commerceDatabase = if ($environmentValues["COMMERCE_DATABASE"]) { $environmentValues["COMMERCE_DATABASE"] } else { "sprint_commerce" }
$databases = @($identityDatabase, $commerceDatabase)
$databases | ForEach-Object {
    if ($_ -notmatch '^[a-zA-Z][a-zA-Z0-9_]{2,62}$') { throw "Nombre de base de datos no permitido: $_" }
    $dumpPath = Join-Path $resolvedBackup "$_.dump"
    if (-not (Test-Path -LiteralPath $dumpPath -PathType Leaf)) { throw "Falta el respaldo requerido: $dumpPath" }
}

Push-Location $repositoryRoot
try {
    $containerId = (docker compose --env-file $environmentPath -f $composePath ps -q postgres | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw "No se pudo consultar PostgreSQL." }
    if ($containerId -notmatch '^[a-f0-9]{12,64}$') { throw "PostgreSQL no está iniciado o no se pudo resolver su contenedor." }

    foreach ($database in $databases) {
        $dumpPath = Join-Path $resolvedBackup "$database.dump"
        $containerBackup = "/tmp/$database-restore.backup"
        docker cp $dumpPath "${containerId}:${containerBackup}"
        if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar el respaldo de $database." }
        docker compose --env-file $environmentPath -f $composePath exec -T postgres pg_restore --list $containerBackup | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "El respaldo de $database no es valido; no se detuvo la aplicacion." }
    }
    docker compose --env-file $environmentPath -f $composePath stop frontend backend | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "No se pudo detener la aplicacion; no se restauraron datos." }
    foreach ($database in $databases) {
        $containerBackup = "/tmp/$database-restore.backup"
        docker compose --env-file $environmentPath -f $composePath exec -T -e "RESTORE_DATABASE=$database" postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$RESTORE_DATABASE" --clean --if-exists --no-owner --exit-on-error --single-transaction "/tmp/$RESTORE_DATABASE-restore.backup"'
        if ($LASTEXITCODE -ne 0) { throw "La restauración de $database falló." }
        docker compose --env-file $environmentPath -f $composePath exec -T postgres rm -f -- $containerBackup | Out-Null
    }
    if (-not $LeaveStopped) {
        docker compose --env-file $environmentPath -f $composePath start backend frontend | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Datos restaurados, pero no se pudo reiniciar la aplicacion." }
    }
    Write-Host "Bases de identidad y comercio restauradas correctamente desde $resolvedBackup" -ForegroundColor Green
} catch {
    Write-Warning "No se reinicio automaticamente la aplicacion. Revisa el error antes de continuar con datos parcialmente restaurados."
    throw
} finally {
    Pop-Location
}
