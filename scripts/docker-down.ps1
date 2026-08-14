[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composePath = Join-Path $repositoryRoot "compose.yaml"
$environmentPath = Join-Path $repositoryRoot ".env"

Push-Location $repositoryRoot
try {
    if (Test-Path -LiteralPath $environmentPath -PathType Leaf) {
        docker compose --env-file $environmentPath -f $composePath down --remove-orphans
    } else {
        docker compose -f $composePath down --remove-orphans
    }
    if ($LASTEXITCODE -ne 0) { throw "No se pudo detener la plataforma." }
    Write-Host "Contenedores detenidos. El volumen de PostgreSQL se conservó." -ForegroundColor Green
} finally {
    Pop-Location
}
