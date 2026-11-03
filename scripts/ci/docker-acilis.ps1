# docker-acilis.ps1 — Docker Desktop'ı bayat AF_UNIX soket kalıntısı temizlendikten SONRA başlatır (ALT-130).
#
# SORUN (ölçüldü, 5 tekrar: run.bozuk-2026-10-11, -10-12, -10-12b, run.bayat-20261102-222328, -20261103-091642):
#   Makine Docker açıkken kapanınca %LOCALAPPDATA%\Docker\run altında AF_UNIX soketleri kalır
#   (dockerInference, userAnalyticsOtlpHttp.sock). Docker açılışta bunları silemez
#   ("The file cannot be accessed by the system", Error 1920) ve arka uç çöker.
#   Remove-Item / del / fsutil aynı hatayı verir; Test-Path YANLIŞ NEGATİF verir (dosya "yok" görünür).
#   Çalışan yol: wsl --shutdown + run klasörünü [IO.Directory]::Move ile kenara taşı + boş run aç.
#
# NE YAPAR (oturum açılışında, HKCU Run kaydından):
#   1. Docker Desktop zaten çalışıyorsa HİÇBİR ŞEYE dokunmaz (açık kapsayıcıları korur), çıkar.
#   2. run içinde öğe varsa (kanıt: GetFileSystemEntries, Test-Path değil): wsl --shutdown, run → run.bayat-<zaman>, boş run.
#   3. 7 günden eski run.bayat-* / run.bozuk-* klasörlerini günlüğe YAZAR, SİLMEZ.
#   4. Docker Desktop'ı başlatır (taşıma başarısızsa başlatmaz: çökeceği belli, günlüğe yazar).
#   Günlük: %LOCALAPPDATA%\Docker\docker-acilis.log
#
# PARAMETRELER (sınama içindir; görev parametresiz koşar):
#   -DockerKok <yol>   run klasörünün üst dizini (varsayılan %LOCALAPPDATA%\Docker)
#   -Kuru              hiçbir şeyi değiştirmez, yapacağını yazar
#   -WslAtla           wsl --shutdown atlanır
#   -BaslatmaAtla      Docker başlatılmaz
#   -SurecDenetimiAtla "Docker çalışıyor mu" denetimi atlanır (yalnız sahte dizinde sınama için)
param(
  [string]$DockerKok = (Join-Path $env:LOCALAPPDATA 'Docker'),
  [switch]$Kuru,
  [switch]$WslAtla,
  [switch]$BaslatmaAtla,
  [switch]$SurecDenetimiAtla
)
$WslKapatma = -not $WslAtla
$DockerBaslatma = -not $BaslatmaAtla
$SurecDenetimi = -not $SurecDenetimiAtla

$ErrorActionPreference = 'Stop'
$gunluk = Join-Path $DockerKok 'docker-acilis.log'
function Yaz([string]$m) {
  $satir = "{0} {1}{2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), ($(if ($Kuru) { '[KURU] ' } else { '' })), $m
  Write-Output $satir
  try { Add-Content -LiteralPath $gunluk -Value $satir -Encoding UTF8 } catch { }
}

$exe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
$run = Join-Path $DockerKok 'run'

if ($SurecDenetimi -and (Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue)) {
  Yaz 'Docker Desktop zaten calisiyor; dokunulmadi.'
  exit 0
}

# Kalıntı ölçümü: Test-Path AF_UNIX soketinde yanlış negatif verir, dizin listesi verir.
$ogeler = @()
if ([IO.Directory]::Exists($run)) { $ogeler = [IO.Directory]::GetFileSystemEntries($run) }
$tasimaTamam = $true

if ($ogeler.Count -gt 0) {
  Yaz ("run icinde {0} oge: {1}" -f $ogeler.Count, (($ogeler | ForEach-Object { Split-Path $_ -Leaf }) -join ', '))
  if ($Kuru) {
    Yaz 'wsl --shutdown + run tasima + bos run YAPILACAKTI.'
  } else {
    if ($WslKapatma) { & wsl.exe --shutdown 2>&1 | Out-Null; Yaz 'wsl --shutdown koştu.' }
    $hedef = Join-Path $DockerKok ('run.bayat-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
    try {
      [IO.Directory]::Move($run, $hedef)
      [IO.Directory]::CreateDirectory($run) | Out-Null
      $kalan = [IO.Directory]::GetFileSystemEntries($run).Count
      if ($kalan -ne 0) { throw "yeni run bos degil ($kalan oge)" }
      Yaz "run tasindi: $hedef ; bos run acildi."
    } catch {
      $tasimaTamam = $false
      Yaz "HATA: run tasinamadi: $($_.Exception.Message)"
    }
  }
} else {
  Yaz 'run temiz (0 oge).'
}

# Eski kenar klasörleri: bildir, silme.
$sinir = (Get-Date).AddDays(-7)
Get-ChildItem -LiteralPath $DockerKok -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^run\.(bayat|bozuk)-' -and $_.CreationTime -lt $sinir } |
  ForEach-Object { Yaz "ESKI KENAR KLASORU (7 gunden eski, silinmedi): $($_.Name)" }

if (-not $DockerBaslatma) { Yaz 'Docker baslatma atlandi (parametre).'; exit $(if ($tasimaTamam) { 0 } else { 1 }) }
if (-not $tasimaTamam) { Yaz 'Docker BASLATILMADI: kalinti temizlenemedi, acilista cokecekti.'; exit 1 }
if ($Kuru) { Yaz "Docker baslatilacakti: $exe"; exit 0 }
if (-not (Test-Path -LiteralPath $exe)) { Yaz "HATA: Docker Desktop bulunamadi: $exe"; exit 1 }
Start-Process -FilePath $exe
Yaz 'Docker Desktop baslatildi.'
exit 0
