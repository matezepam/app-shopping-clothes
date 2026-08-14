[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8088
)

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:$Port"
$client = [System.Net.Http.HttpClient]::new()
$client.Timeout = [TimeSpan]::FromSeconds(10)

function Invoke-Check {
    param(
        [string]$Name,
        [string]$Path,
        [int]$ExpectedStatus,
        [string]$BearerToken
    )

    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Get, "$baseUrl$Path")
    if ($BearerToken) {
        $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $BearerToken)
    }
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    $requestId = $null
    [void]$response.Headers.TryGetValues("X-Request-ID", [ref]$requestId)
    $result = [pscustomobject]@{
        Prueba = $Name
        Esperado = $ExpectedStatus
        Obtenido = [int]$response.StatusCode
        RequestId = ($requestId | Select-Object -First 1)
        Aprobado = ([int]$response.StatusCode -eq $ExpectedStatus)
        Body = $body
        Headers = $response.Headers
    }
    $response.Dispose()
    $request.Dispose()
    return $result
}

try {
    $results = @(
        Invoke-Check -Name "Nginx" -Path "/healthz" -ExpectedStatus 200
        Invoke-Check -Name "Backend y PostgreSQL" -Path "/api/health" -ExpectedStatus 200
        Invoke-Check -Name "Catálogo público" -Path "/api/products" -ExpectedStatus 200
        Invoke-Check -Name "Protección sin token" -Path "/api/admin/stats" -ExpectedStatus 401
        Invoke-Check -Name "Token inválido" -Path "/api/admin/stats" -ExpectedStatus 401 -BearerToken "not-a-jwt"
        Invoke-Check -Name "Fallback SPA" -Path "/admin/operations" -ExpectedStatus 200
    )

    $results | Select-Object Prueba, Esperado, Obtenido, RequestId, Aprobado | Format-Table -AutoSize

    $health = $results | Where-Object Prueba -eq "Backend y PostgreSQL"
    if ($health.Body -notmatch '"status"\s*:\s*"UP"') { throw "El endpoint de salud no reportó UP." }
    $catalog = $results | Where-Object Prueba -eq "Catálogo público"
    if ($catalog.Body -notmatch '"products"') { throw "El catálogo no devolvió la colección de productos." }
    $unauthorized = $results | Where-Object Prueba -eq "Protección sin token"
    if ($unauthorized.Body -notmatch '"code"\s*:\s*"UNAUTHORIZED"') { throw "El contrato 401 no contiene el código esperado." }
    $spa = $results | Where-Object Prueba -eq "Fallback SPA"
    if ($spa.Body -notmatch '<div id="root"></div>') { throw "Nginx no aplicó el fallback de la SPA." }
    if ($results.Where({ [string]::IsNullOrWhiteSpace($_.RequestId) }).Count -gt 0) { throw "Una o más respuestas no incluyeron X-Request-ID." }
    $nginx = $results | Where-Object Prueba -eq "Nginx"
    if (-not $nginx.Headers.Contains("Content-Security-Policy")) { throw "Nginx no publicó Content-Security-Policy." }
    if (-not $nginx.Headers.Contains("X-Frame-Options")) { throw "Nginx no publicó X-Frame-Options." }
    if ($results.Where({ -not $_.Aprobado }).Count -gt 0) { throw "Una o más pruebas de humo fallaron." }

    Write-Host "Pruebas de humo aprobadas: $($results.Count)/$($results.Count)." -ForegroundColor Green
} finally {
    $client.Dispose()
}
