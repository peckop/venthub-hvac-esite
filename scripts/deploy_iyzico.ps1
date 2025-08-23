#requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }

try {
  Write-Info "[1/6] Supabase CLI kontrol ediliyor..."
  if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    throw "Supabase CLI bulunamadı. Lütfen Supabase CLI kurulumunu tamamlayın."
  }
  supabase --version | Out-Host

  Write-Info "[2/6] Supabase login (token gizli tutulacak)..."
  if (-not $env:SUPABASE_ACCESS_TOKEN -or [string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) {
    $sec = Read-Host "Supabase Access Token" -AsSecureString
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
    $env:SUPABASE_ACCESS_TOKEN = $plain
    # Değeri asla ekrana yazdırmıyoruz
  }
  supabase login --token $env:SUPABASE_ACCESS_TOKEN | Out-Host

  $projectRef = 'tnofewwkwlyjsqgwjjga'
  Write-Info "[3/6] Proje linkleniyor ($projectRef)..."
  supabase link --project-ref $projectRef | Out-Host

  Write-Info "[4/6] iyzico-payment fonksiyonu deploy ediliyor..."
  supabase functions deploy iyzico-payment | Out-Host
  Write-Ok   "Deploy tamamlandı."

  Write-Info "[5/6] Test isteği hazırlanıyor..."
  $headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg1MzIsImV4cCI6MjA3MTIxNDUzMn0.pqgvGZQS4x9WcIo7TqqobK_1PiUSbuCyw_mORBea4g4";
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2Zld3drd2x5anNxZ3dqamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Mzg1MzIsImV4cCI6MjA3MTIxNDUzMn0.pqgvGZQS4x9WcIo7TqqobK_1PiUSbuCyw_mORBea4g4"
  }
  $body = @'
{
  "amount": 123.45,
  "cartItems": [
    { "product_id": "p1", "product_name": "Test Ürün", "price": 123.45, "quantity": 1 }
  ],
  "customerInfo": { "name": "Test User", "email": "test@example.com", "phone": "+905555555555" },
  "shippingAddress": { "fullAddress": "Test Adres", "city": "İstanbul", "postalCode": "34000" },
  "billingAddress": { "fullAddress": "Test Adres", "city": "İstanbul", "postalCode": "34000" },
  "user_id": "test-user"
}
'@

  Write-Info "[6/6] Canlı test isteği gönderiliyor..."
  $uri = "https://$projectRef.functions.supabase.co/iyzico-payment"
  try {
    $resp = Invoke-WebRequest -Method Post -Uri $uri -Headers $headers -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Ok   ("STATUS=" + $resp.StatusCode)
    Write-Host $resp.Content
  } catch {
    $wex = $_.Exception
    if ($wex.Response -ne $null) {
      $resp = $wex.Response
      $status = [int]$resp.StatusCode
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $content = $reader.ReadToEnd(); $reader.Close()
      Write-Warn ("STATUS=" + $status)
      Write-Host $content
    } else {
      Write-Err ("ERROR=" + $wex.Message)
    }
  }

} catch {
  Write-Err $_.Exception.Message
  exit 1
}

