param()
$ErrorActionPreference = 'Stop'
# Read repo supabase client file
$tsPath = Join-Path $PSScriptRoot '..\src\lib\supabase.ts'
$content = Get-Content -Raw $tsPath
# Try to read from environment first; if missing, try .env.local; fallback to repo defaults
if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_SERVICE_ROLE_KEY) {
  $dotenvCandidates = @(
    (Join-Path $PSScriptRoot '..\.env.local'),
    (Join-Path (Split-Path $PSScriptRoot -Parent) '.env.local')
  )
  foreach ($p in $dotenvCandidates) {
    if (Test-Path $p) {
      $lines = Get-Content -Raw $p -ErrorAction SilentlyContinue
      if ($lines) {
        $mUrl = [regex]::Match($lines, "(?m)^SUPABASE_URL=(.+)$")
        $mKey = [regex]::Match($lines, "(?m)^SUPABASE_SERVICE_ROLE_KEY=(.+)$")
        if ($mUrl.Success -and -not $env:SUPABASE_URL) { $env:SUPABASE_URL = $mUrl.Groups[1].Value.Trim().Trim('"') }
        if ($mKey.Success -and -not $env:SUPABASE_SERVICE_ROLE_KEY) { $env:SUPABASE_SERVICE_ROLE_KEY = $mKey.Groups[1].Value.Trim().Trim('"') }
      }
    }
  }
}

# If still missing, extract fallback URL and anon key (read-only) from repo client
$u = if ($env:SUPABASE_URL) { $env:SUPABASE_URL } else { [regex]::Match($content, "VITE_SUPABASE_URL \|\| '([^']+)'").Groups[1].Value }
$k = if ($env:SUPABASE_SERVICE_ROLE_KEY) { $env:SUPABASE_SERVICE_ROLE_KEY } else { [regex]::Match($content, "VITE_SUPABASE_ANON_KEY \|\| '([^']+)'").Groups[1].Value }
if (-not $u -or -not $k) {
  Write-Output 'ERR=missing_supabase_config'
  exit 1
}
$qs = 'select=id,cart_id,product_id,quantity,unit_price,price_list_id&limit=10'.Replace('|','&')
$uri = "$u/rest/v1/cart_items?$qs"
$headers = @{ apikey = $k; Authorization = "Bearer $k" }
try {
  $resp = Invoke-RestMethod -Headers $headers -Uri $uri -Method GET
  if ($null -eq $resp) { Write-Output 'COUNT=0'; return }
  $cnt = ($resp | Measure-Object).Count
  Write-Output ('COUNT=' + $cnt)
  # Print a compact table-like JSON for quick check
  $resp | ForEach-Object { [PSCustomObject]@{ id=$_.id; cart_id=$_.cart_id; product_id=$_.product_id; qty=$_.quantity; unit_price=$_.unit_price; price_list_id=$_.price_list_id } } | ConvertTo-Json -Depth 4
} catch {
  Write-Output ('ERR=' + $_.Exception.Message)
  if ($_.Exception.Response -and $_.Exception.Response.ContentLength -gt 0) {
    try { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $body = $sr.ReadToEnd(); Write-Output ('BODY=' + $body) } catch {}
  }
  exit 1
}

