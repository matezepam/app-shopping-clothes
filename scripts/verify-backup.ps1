[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$BackupPath
)

$ErrorActionPreference = "Stop"
$resolvedBackup = (Resolve-Path -LiteralPath $BackupPath).Path
if (-not (Test-Path -LiteralPath $resolvedBackup -PathType Container)) {
    throw "BackupPath debe ser la carpeta generada por backup-database.ps1."
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composePath = Join-Path $repositoryRoot "compose.yaml"
$environmentPath = Join-Path $repositoryRoot ".env"
if (-not (Test-Path -LiteralPath $environmentPath -PathType Leaf)) { throw "Falta .env." }

$values = @{}
Get-Content -LiteralPath $environmentPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { $values[$matches[1].Trim()] = $matches[2].Trim() }
}
$identityDatabase = if ($values['IDENTITY_DATABASE']) { $values['IDENTITY_DATABASE'] } else { 'sprint_identity' }
$commerceDatabase = if ($values['COMMERCE_DATABASE']) { $values['COMMERCE_DATABASE'] } else { 'sprint_commerce' }
$suffix = [Guid]::NewGuid().ToString('N').Substring(0, 12)

$verificationTargets = @(
    [pscustomobject]@{
        Source = $identityDatabase
        Verification = "sprint_identity_verify_$suffix"
        Schema = "identity"
        MinimumTables = 2
    },
    [pscustomobject]@{
        Source = $commerceDatabase
        Verification = "sprint_commerce_verify_$suffix"
        Schema = "commerce,audit"
        MinimumTables = 12
    }
)

$createdDatabases = [System.Collections.Generic.List[string]]::new()

Push-Location $repositoryRoot
try {
    $containerId = (docker compose --env-file $environmentPath -f $composePath ps -q postgres | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw "No se pudo consultar PostgreSQL." }
    if ($containerId -notmatch '^[a-f0-9]{12,64}$') { throw "PostgreSQL no está iniciado o no se pudo resolver su contenedor." }

    foreach ($target in $verificationTargets) {
        if ($target.Source -notmatch '^[a-zA-Z][a-zA-Z0-9_]{2,62}$') { throw "Nombre de base de datos no permitido." }
        $dumpPath = Join-Path $resolvedBackup "$($target.Source).dump"
        if (-not (Test-Path -LiteralPath $dumpPath -PathType Leaf)) { throw "Falta el respaldo requerido: $dumpPath" }

        $existing = docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$($target.Verification)" postgres sh -c 'psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = ''$VERIFY_DB_NAME''"'
        if ($LASTEXITCODE -ne 0) { throw "No se pudo comprobar la base aislada." }
        if (($existing | Out-String).Trim() -eq "1") {
            throw "La base aislada $($target.Verification) ya existe; no se modificó."
        }

        docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$($target.Verification)" postgres sh -c 'createdb -U "$POSTGRES_USER" "$VERIFY_DB_NAME"'
        if ($LASTEXITCODE -ne 0) { throw "No se pudo crear $($target.Verification)." }
        [void]$createdDatabases.Add($target.Verification)

        $containerBackup = "/tmp/$($target.Source)-verify.backup"
        docker cp $dumpPath "${containerId}:${containerBackup}"
        if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar $($target.Source).dump." }
        docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$($target.Verification)" -e "BACKUP_FILE=$containerBackup" postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$VERIFY_DB_NAME" --no-owner --exit-on-error "$BACKUP_FILE"'
        if ($LASTEXITCODE -ne 0) { throw "El respaldo de $($target.Source) no pudo restaurarse." }

        $schemas = $target.Schema.Split(',') | ForEach-Object { "'$_'" }
        $schemaList = $schemas -join ','
        $tableCount = docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$($target.Verification)" -e "SCHEMA_LIST=$schemaList" postgres sh -c 'psql -U "$POSTGRES_USER" -d "$VERIFY_DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema IN ($SCHEMA_LIST)"'
        if ($LASTEXITCODE -ne 0) { throw "No se pudo verificar la estructura restaurada." }
        $tables = [int](($tableCount | Out-String).Trim())
        if ($tables -lt $target.MinimumTables) { throw "Restauración incompleta de $($target.Source): $tables tablas." }

        docker compose --env-file $environmentPath -f $composePath exec -T postgres rm -f -- $containerBackup | Out-Null
        Write-Host "$($target.Source): restauración aislada aprobada con $tables tablas." -ForegroundColor Green
    }
} finally {
    foreach ($database in $createdDatabases) {
        if ($database -notmatch '^sprint_(identity|commerce)_verify_[a-f0-9]{12}$') { throw "Se rechazo limpiar una base no temporal." }
        docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$database" postgres sh -c 'dropdb -U "$POSTGRES_USER" --if-exists "$VERIFY_DB_NAME"' | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "No se pudo retirar la base temporal $database." }
    }
    Pop-Location
}
