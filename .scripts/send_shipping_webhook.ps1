param(
  [Parameter(Mandatory=$true)][string]$ProjectRef,
  [Parameter(Mandatory=$true)][string]$Secret,
  [Parameter(Mandatory=$true)][string]$BodyJson,
  [string]$Carrier = "mock",
  [string]$EventId = $(New-Guid).ToString(),
  [Nullable[Int64]]$Timestamp = $null
)

# Compute HMAC-SHA256 (base64) over raw body
$utf8 = [System.Text.Encoding]::UTF8
$hmac = New-Object System.Security.Cryptography.HMACSHA256 ($utf8.GetBytes($Secret))
$hashBytes = $hmac.ComputeHash($utf8.GetBytes($BodyJson))
$signature = [Convert]::ToBase64String($hashBytes)

if (-not $Timestamp) {
  $Timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
}

$uri = "https://$ProjectRef.functions.supabase.co/shipping-webhook"

$headers = @{
  "Content-Type" = "application/json"
  "X-Signature"  = $signature
  "X-Carrier"    = $Carrier
  "X-Id"         = $EventId
  "X-Timestamp"  = "$Timestamp"
}

Write-Host "POST" $uri -ForegroundColor Cyan
Write-Host "Headers:" ($headers | Out-String)
Write-Host "Body:" $BodyJson

$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $BodyJson -UseBasicParsing
$resp.StatusCode
$resp.Content

