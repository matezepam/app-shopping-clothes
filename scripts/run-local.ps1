[CmdletBinding()]
param(
    [string]$WhatsAppNumber = "593939051525"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendPath = Join-Path $repositoryRoot "backend"
$frontendPath = Join-Path $repositoryRoot "frontend"
$cognitoEnvironmentPath = Join-Path $backendPath ".env.cognito.generated"
$runPath = Join-Path $repositoryRoot ".run"

if (-not (Test-Path -LiteralPath $cognitoEnvironmentPath -PathType Leaf)) {
    throw "Falta backend\.env.cognito.generated. Ejecuta primero scripts\provision-cognito-demo.ps1."
}
foreach ($command in @("docker", "java", "npm")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "No se encontró '$command' en PATH." }
}

Get-Content -LiteralPath $cognitoEnvironmentPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

$env:IDENTITY_DATABASE = "sprint_identity"
$env:COMMERCE_DATABASE = "sprint_commerce"
$env:POSTGRES_DB = $env:IDENTITY_DATABASE
$env:POSTGRES_USER = "sprint_app"
$env:POSTGRES_PASSWORD = "SprintLocal#2026"
$env:IDENTITY_DATASOURCE_URL = "jdbc:postgresql://localhost:5433/$($env:IDENTITY_DATABASE)"
$env:COMMERCE_DATASOURCE_URL = "jdbc:postgresql://localhost:5433/$($env:COMMERCE_DATABASE)"
$env:DATABASE_USERNAME = $env:POSTGRES_USER
$env:DATABASE_PASSWORD = $env:POSTGRES_PASSWORD
$env:APP_CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
$env:APP_WHATSAPP_BUSINESS_NUMBER = $WhatsAppNumber
$env:VITE_API_URL = "http://localhost:8080"

docker info | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Docker Desktop no está iniciado." }
docker compose -f (Join-Path $backendPath "docker-compose.yml") up -d
if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar PostgreSQL." }

$databaseReady = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    docker exec `
        -e "PGPASSWORD=$($env:POSTGRES_PASSWORD)" `
        -e "PGUSER=$($env:POSTGRES_USER)" `
        -e "PGDATABASE=$($env:POSTGRES_DB)" `
        sprint-postgres `
        sh -c 'psql -h 127.0.0.1 -tAc "SELECT 1" >/dev/null 2>&1' | Out-Null
    if ($LASTEXITCODE -eq 0) { $databaseReady = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $databaseReady) { throw "PostgreSQL no aceptó las credenciales configuradas después de 30 segundos." }

$commerceExists = docker exec `
    -e "PGPASSWORD=$($env:POSTGRES_PASSWORD)" `
    sprint-postgres `
    psql -U $env:POSTGRES_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$($env:COMMERCE_DATABASE)'"
if (($commerceExists | Out-String).Trim() -ne "1") {
    docker exec `
        -e "PGPASSWORD=$($env:POSTGRES_PASSWORD)" `
        sprint-postgres `
        createdb -U $env:POSTGRES_USER $env:COMMERCE_DATABASE
    if ($LASTEXITCODE -ne 0) { throw "No se pudo crear la base comercial local." }
}

New-Item -ItemType Directory -Force -Path $runPath | Out-Null
$backendProcess = Start-Process `
    -FilePath (Join-Path $backendPath "gradlew.bat") `
    -ArgumentList "bootRun", "--no-daemon" `
    -WorkingDirectory $backendPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $runPath "backend.out.log") `
    -RedirectStandardError (Join-Path $runPath "backend.err.log") `
    -PassThru
Set-Content -LiteralPath (Join-Path $runPath "backend.pid") -Value $backendProcess.Id

$backendReady = $false
for ($attempt = 0; $attempt -lt 90; $attempt++) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -TimeoutSec 2
        if ($health.status -eq "UP") { $backendReady = $true; break }
    } catch { }
    if ($backendProcess.HasExited) { throw "El backend terminó. Revisa .run\backend.err.log y .run\backend.out.log." }
    Start-Sleep -Seconds 1
}
if (-not $backendReady) { throw "El backend no quedó listo en 90 segundos." }

$frontendProcess = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run", "dev", "--", "--host", "127.0.0.1" `
    -WorkingDirectory $frontendPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $runPath "frontend.out.log") `
    -RedirectStandardError (Join-Path $runPath "frontend.err.log") `
    -PassThru
Set-Content -LiteralPath (Join-Path $runPath "frontend.pid") -Value $frontendProcess.Id

Write-Host "Aplicación lista" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8080"
Start-Process "http://localhost:5173"
