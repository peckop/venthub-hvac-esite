# departman-ac.ps1 - bir departmani (Arac, Harita, Ops, Yetenek, Urun...) Windows Terminal'de YENI SEKMEDE acar.
#
# Kullanim:   departman-ac.cmd <Rol> [--taze] [--kuru]      (bu dosyayi cmd sarmalar; dogrudan da calistirilabilir)
#   --taze  : --resume YOK; yeni oturum, ilk mesaj "durum dosyani oku, devam et".
#   --kuru  : HICBIR surec baslatmaz; yapilacak komut satirini yazar (testler yalniz bununla kosar).
#
# KARAR (rol -> son sid -> zaten acik mi -> tavan -> komut) scripts/board/departman-ac.cjs'tedir ve --json ile buraya
# gelir; burasi yalniz BASLATIR. Yontem olculmustur (bu makinede dogrulandi): Start-Process -FilePath claude.exe
# -WorkingDirectory <kok> -WindowStyle Normal -> Windows Terminal yeni sekme.
#
# ORTAM TEMIZLIGI: Claude Code'un icinden (ya da onun kabugundan) baslatilan claude, ust surecin CLAUDE* ortam
# degiskenlerini (CLAUDECODE, CLAUDE_CODE_SESSION_ID, CLAUDE_PROJECT_DIR...) MIRAS ALIR ve yeni pencere kendini
# "ic ice" sanip yanlis oturum kimligi/proje dizini tasir. Bu yuzden baslatmadan ONCE bu surecteki HEPSI silinir
# (yalniz bu PowerShell sureci; kullanicinin kalici ortamina dokunulmaz).
#
# Bu dosya ASCII tutulur (Windows PowerShell 5.1 BOM'suz UTF-8'i ANSI okur); Turkce ad JSON'daki \uXXXX ile gelir.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$kuru = $false
$rol = @()
$node_args = @()
foreach ($a in $args) {
  if ($a -eq '--kuru') { $kuru = $true }
  elseif ($a -eq '--taze') { $node_args += '--taze' }
  else { $rol += $a }
}

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host 'HATA: node bulunamadi (PATH icinde node yok).'
  exit 1
}

$cikti = & $node.Source (Join-Path $here 'departman-ac.cjs') @rol @node_args --json
$kod = $LASTEXITCODE
$ham = ($cikti | Out-String).Trim()
try {
  $plan = $ham | ConvertFrom-Json
} catch {
  Write-Host ('HATA: departman-ac.cjs ciktisi okunamadi (cikis kodu ' + $kod + '): ' + $ham)
  exit 1
}

foreach ($u in @($plan.uyarilar)) {
  if ($u) { Write-Host ('uyari: ' + $u) }
}

if ($plan.karar -eq 'hata') {
  Write-Host ('HATA: ' + $plan.sebep)
  exit 1
}
if ($plan.karar -eq 'zaten-acik') {
  Write-Host $plan.mesaj
  exit 0
}
if ($plan.karar -eq 'tavan') {
  Write-Host ('UYARI: ' + $plan.mesaj)
  exit 1
}
if ($plan.karar -ne 'ac') {
  Write-Host ('HATA: bilinmeyen karar: ' + $plan.karar)
  exit 1
}

if ($kuru) {
  Write-Host ('KURU: ' + $plan.komut)
  Write-Host ('calisma dizini: ' + $plan.cwd)
  exit 0
}

# CLAUDE* ortam degiskenlerinin HEPSINI bu surecten temizle (bkz. dosya basi), sonra baslat.
Get-ChildItem Env: | Where-Object Name -like 'CLAUDE*' | Remove-Item

try {
  $surec = Start-Process -FilePath $plan.exe -WorkingDirectory $plan.cwd -ArgumentList $plan.argumentList -WindowStyle Normal -PassThru -ErrorAction Stop
} catch {
  Write-Host ('HATA: claude baslatilamadi: ' + $_.Exception.Message)
  exit 1
}
if ($plan.sid) {
  Write-Host ('acildi: ' + $plan.ad + ' sid=' + $plan.sid + ' pid=' + $surec.Id + ' (--resume)')
} else {
  Write-Host ('acildi: ' + $plan.ad + ' sid=(yeni oturum; claude atayacak - pano who ile gorunur) pid=' + $surec.Id)
}
exit 0
