[CmdletBinding()]
param([Parameter(Mandatory)][string]$BackupPath)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $BackupPath).Path
$rootItem = Get-Item -LiteralPath $root -Force
if (-not $rootItem.PSIsContainer -or ($rootItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    throw 'BackupPath debe ser una carpeta regular, no un enlace.'
}
$manifest = Get-Content -LiteralPath (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
if ($manifest.version -ne 1 -or $manifest.files.Count -lt 4) { throw 'Formato de respaldo no reconocido.' }
$seen = @{}
foreach ($file in $manifest.files) {
    $relative = [string]$file.path
    if ([IO.Path]::IsPathRooted($relative) -or $relative -match '(^|[/\\])\.\.([/\\]|$)' -or $relative.Contains(':')) {
        throw 'El manifiesto contiene una ruta no permitida.'
    }
    $path = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $path.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or $seen.ContainsKey($path)) {
        throw 'Ruta duplicada o fuera del respaldo.'
    }
    $seen[$path] = $true
    $cursor = $path
    while ($cursor -ne $root) {
        $item = Get-Item -LiteralPath $cursor -Force -ErrorAction Stop
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'No se admiten enlaces dentro del respaldo.' }
        $cursor = Split-Path -Parent $cursor
    }
    $item = Get-Item -LiteralPath $path -Force
    if ($item.PSIsContainer -or $item.Length -ne $file.bytes -or (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $file.sha256) {
        throw "Archivo incompleto o modificado: $relative"
    }
}
if ($manifest.databaseFolder -notmatch '^sprint-databases-[0-9-]+$') { throw 'Carpeta de bases no valida.' }
foreach ($required in @('configuration/.env', 'repository.bundle', 'RECOVERY.md')) {
    if (-not $seen.ContainsKey([IO.Path]::GetFullPath((Join-Path $root $required)))) { throw "Falta $required en el manifiesto." }
}
$dumpEntries = @($manifest.files | Where-Object { $_.path -like "$($manifest.databaseFolder)/*.dump" })
if ($dumpEntries.Count -ne 2) { throw 'Se requieren los dos respaldos de identidad y comercio.' }
Write-Host "Integridad SHA-256 aprobada: $($manifest.files.Count) archivos. Esto comprueba integridad, no autenticidad del origen." -ForegroundColor Green
