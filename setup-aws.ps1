# Setup AWS credentials for AWS CLI and SDK
param(
    [string]$Region = "us-east-1"
)

$envFile = Join-Path $PSScriptRoot ".env.aws"

if (Test-Path $envFile) {
    $creds = @{}
    Get-Content $envFile | Where-Object { $_ -match '^\s*([^#=]+)\s*=\s*(.*)$' } | ForEach-Object {
        $creds[$matches[1].Trim()] = $matches[2].Trim()
    }
    
    if ($creds["AWS_ACCESS_KEY_ID"]) {
        aws configure set aws_access_key_id $creds["AWS_ACCESS_KEY_ID"]
        aws configure set aws_secret_access_key $creds["AWS_SECRET_ACCESS_KEY"]
        if ($creds["AWS_SESSION_TOKEN"]) {
            aws configure set aws_session_token $creds["AWS_SESSION_TOKEN"]
        }
        aws configure set default.region $(if ($creds["AWS_REGION"]) { $creds["AWS_REGION"] } else { $Region })
        
        Write-Host "AWS CLI configured successfully with active credentials." -ForegroundColor Green
        aws sts get-caller-identity
    }
} else {
    Write-Host ".env.aws file not found. Copy .env.aws.example to .env.aws and populate credentials." -ForegroundColor Yellow
}
