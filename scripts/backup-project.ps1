[CmdletBinding()]
param([string]$Destination)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$environmentPath = Join-Path $repositoryRoot '.env'
$composePath = Join-Path $repositoryRoot 'compose.yaml'
if (-not (Test-Path -LiteralPath $environmentPath -PathType Leaf)) { throw 'Falta .env.' }
$destinationRoot = if ($Destination) { [IO.Path]::GetFullPath($Destination) } else { Join-Path $repositoryRoot 'backups' }
New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null
$backupName = 'sprint-recovery-{0}-{1}' -f (Get-Date -Format 'yyyyMMdd-HHmmss'), [Guid]::NewGuid().ToString('N').Substring(0, 8)
$bundlePath = Join-Path $destinationRoot $backupName
New-Item -ItemType Directory -Path $bundlePath -ErrorAction Stop | Out-Null
$previouslyRunning = @()

function Copy-PrivateFile([string]$Source, [string]$Target) {
    $item = Get-Item -LiteralPath $Source -Force -ErrorAction Stop
    if ($item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Solo se respaldan archivos regulares: $Source"
    }
    New-Item -ItemType Directory -Path (Split-Path -Parent $Target) -Force | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Target -ErrorAction Stop
}

Push-Location $repositoryRoot
try {
    $running = @(docker compose --env-file $environmentPath -f $composePath ps --services --status running)
    if ($LASTEXITCODE -ne 0 -or 'postgres' -notin $running) { throw 'PostgreSQL debe estar iniciado para respaldar.' }
    $previouslyRunning = @($running | Where-Object { $_ -in @('frontend', 'backend') })
    if ($previouslyRunning.Count -gt 0) {
        Write-Host 'Pausando la aplicacion para obtener una copia consistente de datos e imagenes.'
        docker compose --env-file $environmentPath -f $composePath stop @previouslyRunning | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'No se pudieron pausar las escrituras.' }
    }

    $databasePath = & (Join-Path $PSScriptRoot 'backup-database.ps1') -Destination $bundlePath
    if (-not ($databasePath -is [string]) -or -not (Test-Path -LiteralPath $databasePath -PathType Container)) {
        throw 'El respaldo de bases no devolvio una carpeta valida.'
    }
    & (Join-Path $PSScriptRoot 'verify-backup.ps1') -BackupPath $databasePath

    $uploadRoot = Join-Path $repositoryRoot 'runtime/uploads/products'
    $uploadTarget = Join-Path $bundlePath 'uploads/products'
    New-Item -ItemType Directory -Path $uploadTarget -Force | Out-Null
    $uploadItem = Get-Item -LiteralPath $uploadRoot -Force -ErrorAction Stop
    if ($uploadItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'La carpeta de imagenes no puede ser un enlace.' }
    foreach ($file in Get-ChildItem -LiteralPath $uploadRoot -Force) {
        if ($file.Name -ne '.gitignore') {
            Copy-PrivateFile $file.FullName (Join-Path $uploadTarget $file.Name)
        }
    }
    foreach ($relative in @('.env', 'backend/.env.cognito.generated', 'frontend/.env.local', 'frontend/.vercel/project.json')) {
        $source = Join-Path $repositoryRoot $relative
        if (Test-Path -LiteralPath $source -PathType Leaf) {
            Copy-PrivateFile $source (Join-Path (Join-Path $bundlePath 'configuration') $relative)
        }
    }
    $gitBundle = Join-Path $bundlePath 'repository.bundle'
    git bundle create $gitBundle --all
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo guardar el historial Git.' }
    git bundle verify $gitBundle | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'El respaldo Git no paso la verificacion.' }
    Copy-PrivateFile (Join-Path $repositoryRoot 'docs/RECOVERY.md') (Join-Path $bundlePath 'RECOVERY.md')

    $files = @(Get-ChildItem -LiteralPath $bundlePath -Recurse -Force -File | ForEach-Object {
        [ordered]@{
            path = $_.FullName.Substring($bundlePath.Length + 1).Replace('\', '/')
            bytes = $_.Length
            sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
        }
    })
    $manifest = [ordered]@{
        version = 1
        createdAt = (Get-Date).ToUniversalTime().ToString('o')
        sourceCommit = (git rev-parse HEAD | Out-String).Trim()
        databaseFolder = Split-Path -Leaf $databasePath
        databaseRestoreVerified = $true
        includesSecrets = $true
        files = $files
    }
    $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $bundlePath 'manifest.json') -Encoding UTF8
    & (Join-Path $PSScriptRoot 'verify-project-backup.ps1') -BackupPath $bundlePath
} finally {
    if ($previouslyRunning.Count -gt 0) {
        docker compose --env-file $environmentPath -f $composePath start @previouslyRunning | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Inicia backend y frontend manualmente: docker compose start backend frontend.' }
    }
    Pop-Location
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archivePath = "$bundlePath.zip"
[IO.Compression.ZipFile]::CreateFromDirectory($bundlePath, $archivePath)
$archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
"$archiveHash  $backupName.zip" | Set-Content -LiteralPath "$archivePath.sha256" -Encoding ASCII
Write-Warning 'COPIA PRIVADA: contiene credenciales y datos personales sin cifrar. No subir a GitHub ni compartir publicamente. Guardar en almacenamiento externo protegido antes de restaurar el dispositivo.'
Write-Host "Carpeta verificada: $bundlePath" -ForegroundColor Green
Write-Host "Archivo transportable: $archivePath" -ForegroundColor Green
Write-Output $archivePath
