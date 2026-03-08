#requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host $msg -ForegroundColor Green }
function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host $msg -ForegroundColor Red }

try {
  Write-Info "[1/5] Supabase CLI kontrol ediliyor..."
  if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    throw "Supabase CLI bulunamadı. Yüklemek için: npm i -g supabase"
  }
  supabase --version | Out-Host

  Write-Info "[2/5] Supabase login (token gizli tutulacak)..."
  if (-not $env:SUPABASE_ACCESS_TOKEN -or [string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) {
    $sec = Read-Host "Supabase Access Token" -AsSecureString
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
    $env:SUPABASE_ACCESS_TOKEN = $plain
  }
  supabase login --token $env:SUPABASE_ACCESS_TOKEN | Out-Host

  $projectRef = if ($env:SUPABASE_PROJECT_REF -and -not [string]::IsNullOrWhiteSpace($env:SUPABASE_PROJECT_REF)) { $env:SUPABASE_PROJECT_REF } else { 'tnofewwkwlyjsqgwjjga' }
  Write-Info "[3/5] Proje linkleniyor ($projectRef)..."
  supabase link --project-ref $projectRef | Out-Host

  Write-Info "[4/5] Fonksiyonlar deploy ediliyor (order-validate, iyzico-payment)..."
  supabase functions deploy order-validate | Out-Host
  supabase functions deploy iyzico-payment | Out-Host
  Write-Ok   "Deploy tamamlandı."

  Write-Info "[5/5] Fonksiyon listesi:" 
  supabase functions list | Out-Host

} catch {
  Write-Err $_.Exception.Message
  exit 1
}

