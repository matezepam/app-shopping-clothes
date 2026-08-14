[CmdletBinding()]
param(
    [string]$Region = "us-east-1",
    [string]$StackName = "sprint-cognito",
    [string]$ProjectName = "sprint-clothes",
    [Parameter(Mandatory = $true)]
    [SecureString]$DemoPassword
)

$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$templatePath = Join-Path $repositoryRoot "infra\aws\cognito.yml"

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw "AWS CLI no está instalado. Instálalo y ejecuta 'aws configure' antes de continuar."
}

aws sts get-caller-identity --region $Region | Out-Null
if ($LASTEXITCODE -ne 0) { throw "AWS CLI no tiene una sesión válida." }

aws cloudformation deploy `
    --region $Region `
    --stack-name $StackName `
    --template-file $templatePath `
    --parameter-overrides "ProjectName=$ProjectName" `
    --no-fail-on-empty-changeset | Out-Host
if ($LASTEXITCODE -ne 0) { throw "CloudFormation no pudo crear o actualizar Cognito." }

$outputsJson = aws cloudformation describe-stacks --region $Region --stack-name $StackName --query "Stacks[0].Outputs" --output json
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($outputsJson)) { throw "No se pudieron leer las salidas de CloudFormation." }
$outputs = $outputsJson | ConvertFrom-Json
$poolId = ($outputs | Where-Object OutputKey -eq "UserPoolId").OutputValue
$clientId = ($outputs | Where-Object OutputKey -eq "UserPoolClientId").OutputValue
if ([string]::IsNullOrWhiteSpace($poolId) -or [string]::IsNullOrWhiteSpace($clientId)) { throw "CloudFormation no devolvió User Pool o App Client." }

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DemoPassword)
try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $users = @(
        @{ Email = "admin.sprint@example.com"; First = "Ana"; Last = "Administradora"; Group = "ADMIN" },
        @{ Email = "moderador.sprint@example.com"; First = "Mario"; Last = "Moderador"; Group = "MODERATOR" },
        @{ Email = "vendedor.sprint@example.com"; First = "Valeria"; Last = "Vendedora"; Group = "VENDOR" },
        @{ Email = "cliente.sprint@example.com"; First = "Carlos"; Last = "Cliente"; Group = "USER" }
    )

    foreach ($demoUser in $users) {
        aws cognito-idp admin-get-user --region $Region --user-pool-id $poolId --username $demoUser.Email 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            aws cognito-idp admin-create-user `
                --region $Region `
                --user-pool-id $poolId `
                --username $demoUser.Email `
                --message-action SUPPRESS `
                --user-attributes `
                    "Name=email,Value=$($demoUser.Email)" `
                    "Name=email_verified,Value=true" `
                    "Name=given_name,Value=$($demoUser.First)" `
                    "Name=family_name,Value=$($demoUser.Last)" | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "No se pudo crear $($demoUser.Email)." }
        }

        aws cognito-idp admin-set-user-password --region $Region --user-pool-id $poolId --username $demoUser.Email --password $plainPassword --permanent | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "No se pudo establecer la contraseña de $($demoUser.Email)." }
        aws cognito-idp admin-add-user-to-group --region $Region --user-pool-id $poolId --username $demoUser.Email --group-name $demoUser.Group | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "No se pudo asignar $($demoUser.Group) a $($demoUser.Email)." }
    }

    $backendEnvironment = @"
AWS_COGNITO_REGION=$Region
AWS_COGNITO_USER_POOL_ID=$poolId
AWS_COGNITO_CLIENT_ID=$clientId
AWS_COGNITO_CLIENT_SECRET=
"@
    $backendEnvironmentPath = Join-Path $repositoryRoot "backend\.env.cognito.generated"
    Set-Content -LiteralPath $backendEnvironmentPath -Value $backendEnvironment -Encoding utf8

    Write-Host "Cognito listo. User Pool: $poolId" -ForegroundColor Green
    Write-Host "Variables backend: $backendEnvironmentPath"
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer) }
    $plainPassword = $null
}
