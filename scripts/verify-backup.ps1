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

$verificationTargets = @(
    [pscustomobject]@{
        Source = "sprint_identity"
        Verification = "sprint_identity_restore_verification"
        Schema = "identity"
        MinimumTables = 2
    },
    [pscustomobject]@{
        Source = "sprint_commerce"
        Verification = "sprint_commerce_restore_verification"
        Schema = "commerce,audit"
        MinimumTables = 12
    }
)

$createdDatabases = [System.Collections.Generic.List[string]]::new()

Push-Location $repositoryRoot
try {
    $containerId = (docker compose --env-file $environmentPath -f $composePath ps -q postgres).Trim()
    if ($containerId -notmatch '^[a-f0-9]{12,64}$') { throw "PostgreSQL no está iniciado o no se pudo resolver su contenedor." }

    foreach ($target in $verificationTargets) {
        $dumpPath = Join-Path $resolvedBackup "$($target.Source).dump"
        if (-not (Test-Path -LiteralPath $dumpPath -PathType Leaf)) { throw "Falta el respaldo requerido: $dumpPath" }

        $existing = docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$($target.Verification)" postgres sh -c 'psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = ''$VERIFY_DB_NAME''"'
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
        $tables = [int](($tableCount | Out-String).Trim())
        if ($tables -lt $target.MinimumTables) { throw "Restauración incompleta de $($target.Source): $tables tablas." }

        docker compose --env-file $environmentPath -f $composePath exec -T postgres rm -f -- $containerBackup | Out-Null
        Write-Host "$($target.Source): restauración aislada aprobada con $tables tablas." -ForegroundColor Green
    }
} finally {
    foreach ($database in $createdDatabases) {
        docker compose --env-file $environmentPath -f $composePath exec -T -e "VERIFY_DB_NAME=$database" postgres sh -c 'dropdb -U "$POSTGRES_USER" --if-exists "$VERIFY_DB_NAME"' | Out-Null
    }
    Pop-Location
}
