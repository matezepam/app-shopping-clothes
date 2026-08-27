[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8088,
    [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composePath = Join-Path $repositoryRoot "compose.yaml"
$environmentPath = Join-Path $repositoryRoot ".env"
$environmentExamplePath = Join-Path $repositoryRoot ".env.example"
$cognitoPath = Join-Path $repositoryRoot "backend\.env.cognito.generated"
$pgAdminDirectory = Join-Path $repositoryRoot "infra\pgadmin"
$pgPassPath = Join-Path $pgAdminDirectory "pgpass.generated"

function Set-DotEnvValue {
    param([string]$Path, [string]$Name, [string]$Value)

    $lines = [System.Collections.Generic.List[string]]::new()
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Get-Content -LiteralPath $Path | ForEach-Object { [void]$lines.Add($_) }
    }

    $updated = $false
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^$([regex]::Escape($Name))=") {
            $lines[$index] = "$Name=$Value"
            $updated = $true
            break
        }
    }
    if (-not $updated) { [void]$lines.Add("$Name=$Value") }
    [System.IO.File]::WriteAllLines($Path, $lines, [System.Text.UTF8Encoding]::new($false))
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no está instalado o no está disponible en PATH."
}
docker info | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Docker Desktop no está iniciado." }

if (-not (Test-Path -LiteralPath $environmentPath -PathType Leaf)) {
    Copy-Item -LiteralPath $environmentExamplePath -Destination $environmentPath
    Write-Host "Se creó .env a partir de .env.example." -ForegroundColor Cyan
}

if (Test-Path -LiteralPath $cognitoPath -PathType Leaf) {
    Get-Content -LiteralPath $cognitoPath | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            if ($name -in @("AWS_COGNITO_REGION", "AWS_COGNITO_USER_POOL_ID", "AWS_COGNITO_CLIENT_ID", "AWS_COGNITO_CLIENT_SECRET")) {
                Set-DotEnvValue -Path $environmentPath -Name $name -Value $matches[2].Trim()
            }
        }
    }
}

$environmentValues = @{}
Get-Content -LiteralPath $environmentPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        $environmentValues[$matches[1].Trim()] = $matches[2].Trim()
    }
}
foreach ($required in @("POSTGRES_PASSWORD", "PGADMIN_EMAIL", "PGADMIN_PASSWORD", "AWS_COGNITO_REGION", "AWS_COGNITO_USER_POOL_ID", "AWS_COGNITO_CLIENT_ID")) {
    if ([string]::IsNullOrWhiteSpace($environmentValues[$required]) -or $environmentValues[$required] -match '^(use-a-|example)|_example$') {
        throw "Completa $required en .env antes de iniciar. Para recuperar tu equipo, usa la configuracion del respaldo privado; no subas .env a Git."
    }
}
if (-not $PSBoundParameters.ContainsKey('Port') -and $environmentValues['APP_HTTP_PORT']) {
    $Port = [int]$environmentValues['APP_HTTP_PORT']
}
if ($Port -lt 1024 -or $Port -gt 65535) { throw "APP_HTTP_PORT debe estar entre 1024 y 65535." }
Set-DotEnvValue -Path $environmentPath -Name "APP_HTTP_PORT" -Value $Port
Set-DotEnvValue -Path $environmentPath -Name "APP_CORS_ALLOWED_ORIGINS" -Value "http://localhost:$Port,http://127.0.0.1:$Port"
$postgresVolume = if ($environmentValues['SPRINT_POSTGRES_VOLUME']) { $environmentValues['SPRINT_POSTGRES_VOLUME'] } else { 'sprint_clothes_postgres_data' }
if ($postgresVolume -notmatch '^[a-zA-Z0-9][a-zA-Z0-9_.-]+$') { throw "Nombre de volumen PostgreSQL no valido." }
docker volume inspect $postgresVolume *> $null
if ($LASTEXITCODE -ne 0) {
    docker volume create $postgresVolume | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el volumen persistente de PostgreSQL." }
}
$identityDatabase = if ($environmentValues["IDENTITY_DATABASE"]) { $environmentValues["IDENTITY_DATABASE"] } else { "sprint_identity" }
$commerceDatabase = if ($environmentValues["COMMERCE_DATABASE"]) { $environmentValues["COMMERCE_DATABASE"] } else { "sprint_commerce" }
$postgresUser = if ($environmentValues["POSTGRES_USER"]) { $environmentValues["POSTGRES_USER"] } else { "sprint_app" }
$postgresPassword = $environmentValues["POSTGRES_PASSWORD"]
$escapedPgPassword = $postgresPassword.Replace('\', '\\').Replace(':', '\:')
[System.IO.Directory]::CreateDirectory($pgAdminDirectory) | Out-Null
[System.IO.File]::WriteAllText(
    $pgPassPath,
    "postgres:5432:${identityDatabase}:${postgresUser}:${escapedPgPassword}`npostgres:5432:${commerceDatabase}:${postgresUser}:${escapedPgPassword}`npostgres:5432:postgres:${postgresUser}:${escapedPgPassword}`n",
    [System.Text.UTF8Encoding]::new($false)
)

Push-Location $repositoryRoot
try {
    docker compose --env-file $environmentPath -f $composePath config --quiet
    if ($LASTEXITCODE -ne 0) { throw "La configuración de Docker Compose no es válida." }

    docker compose --env-file $environmentPath -f $composePath up -d --build --remove-orphans
    if ($LASTEXITCODE -ne 0) { throw "No se pudo construir o iniciar la plataforma." }

    $ready = $false
    $healthUrl = "http://localhost:$Port/api/health"
    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        try {
            $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 3
            if ($health.status -eq "UP") { $ready = $true; break }
        } catch { }
        Start-Sleep -Seconds 2
    }
    if (-not $ready) {
        docker compose --env-file $environmentPath -f $composePath ps
        throw "La aplicación no quedó saludable dentro del tiempo esperado. Revisa: docker compose logs backend frontend"
    }

    $pgAdminPort = if ($environmentValues["PGADMIN_PORT"]) { $environmentValues["PGADMIN_PORT"] } else { "5050" }
    $pgAdminReady = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $pgAdminPing = Invoke-WebRequest -Uri "http://localhost:$pgAdminPort/misc/ping" -UseBasicParsing -TimeoutSec 3
            if ($pgAdminPing.StatusCode -eq 200 -and $pgAdminPing.Content -eq "PING") { $pgAdminReady = $true; break }
        } catch { }
        Start-Sleep -Seconds 2
    }
    if (-not $pgAdminReady) {
        docker compose --env-file $environmentPath -f $composePath ps
        throw "pgAdmin no quedó disponible dentro del tiempo esperado. Revisa: docker compose logs pgadmin"
    }

    docker compose --env-file $environmentPath -f $composePath ps
    Write-Host ""
    Write-Host "Sprint está lista y saludable." -ForegroundColor Green
    Write-Host "Aplicación: http://localhost:$Port"
    Write-Host "Salud API: http://localhost:$Port/api/health"
    Write-Host "pgAdmin / ERD: http://localhost:$pgAdminPort"
    Write-Host "Ejecuta: .\scripts\smoke-test.ps1 -Port $Port"
    if ($OpenBrowser) { Start-Process "http://localhost:$Port" }
} finally {
    Pop-Location
}
