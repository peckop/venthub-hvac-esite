# departman-kapat.ps1 - bir departman penceresini KAYIPSIZ kapatir: durum dosyasi TAZE degilse KAPATMAZ.
#
# Kullanim:   departman-kapat.cmd <Rol> [--kuru] [--istek-atla] [--bekle-sn N]      (bu dosyayi cmd sarmalar)
#   --kuru        : HICBIR surec sonlandirmaz, posta gondermez, beklemez; kapinin bugunku hukmunu yazar.
#   --istek-atla  : "durum dosyani yaz" istegi zaten SendMessage ile atildi; yalniz olc ve karara bak.
#   --bekle-sn N  : istek atildiktan sonra durum dosyasinin taze olmasini en cok N sn bekle (varsayilan 90).
#
# KARAR (rol -> son sid -> acik mi -> istek -> durum dosyasi taze mi -> bosta mi) scripts/board/departman-kapat.cjs'tedir
# ve --json ile buraya gelir; burasi yalniz SONLANDIRIR ve yalniz karar 'kapat' iken.
#
# ZORLA KAPATMA YOK: -Force, taskkill /F, surec agaci oldurme ve toplu (Get-Process claude | Stop-Process) YOKTUR.
# Yalniz TEK pid (sessions kaydindan, sid ile eslesen) ve o pidin adi 'claude*' degilse HICBIR SEY yapilmaz.
# Uyari: Windows'ta konsol surecini "nazikce" kapatmanin guvenilir yolu yoktur (Stop-Process fiilen TerminateProcess'tir);
# guvence surecin kendisinde degil KAPIDADIR: taze durum dosyasi + bosta + dogru pid.
#
# Bu dosya ASCII tutulur (Windows PowerShell 5.1 BOM'suz UTF-8'i ANSI okur).

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$kuru = $false
$rol = @()
$node_args = @()
for ($i = 0; $i -lt $args.Count; $i++) {
  $a = $args[$i]
  if ($a -eq '--kuru') { $kuru = $true; $node_args += '--kuru' }
  elseif ($a -eq '--istek-atla') { $node_args += '--istek-atla' }
  elseif ($a -eq '--bekle-sn') { $node_args += '--bekle-sn'; $i++; if ($i -lt $args.Count) { $node_args += $args[$i] } }
  else { $rol += $a }
}

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host 'HATA: node bulunamadi (PATH icinde node yok).'
  exit 1
}

$cikti = & $node.Source (Join-Path $here 'departman-kapat.cjs') @rol @node_args --json
$kod = $LASTEXITCODE
$ham = ($cikti | Out-String).Trim()
try {
  $plan = $ham | ConvertFrom-Json
} catch {
  Write-Host ('HATA: departman-kapat.cjs ciktisi okunamadi (cikis kodu ' + $kod + '): ' + $ham)
  exit 1
}

foreach ($u in @($plan.uyarilar)) {
  if ($u) { Write-Host ('uyari: ' + $u) }
}

if ($plan.karar -eq 'hata') {
  Write-Host ('HATA: ' + $plan.sebep)
  exit 1
}
if ($plan.karar -eq 'zaten-kapali') {
  Write-Host $plan.mesaj
  exit 0
}
if ($plan.karar -eq 'kapatma') {
  Write-Host ('KAPATILMADI: ' + $plan.mesaj)
  exit 1
}
if ($plan.karar -ne 'kapat') {
  Write-Host ('HATA: bilinmeyen karar: ' + $plan.karar)
  exit 1
}

if ($kuru) {
  Write-Host $plan.mesaj
  Write-Host ('KURU: kapatilacak hedef: ' + $plan.ad + ' sid=' + $plan.sid + ' pid=' + $plan.pid + ' (tek pid, zorla kapatma YOK)')
  exit 0
}

# Hedef pid'i son kez dogrula: canli mi ve gercekten claude mu? Degilse HICBIR SEY yapma.
$hedef = Get-Process -Id $plan.pid -ErrorAction SilentlyContinue
if (-not $hedef) {
  Write-Host ('zaten kapali: ' + $plan.ad + ' pid=' + $plan.pid)
  exit 0
}
if ($hedef.ProcessName -notlike 'claude*') {
  Write-Host ('HATA: pid ' + $plan.pid + ' bir claude sureci degil (' + $hedef.ProcessName + ') - KAPATILMADI')
  exit 1
}

try {
  Stop-Process -Id $plan.pid -ErrorAction Stop
} catch {
  Write-Host ('HATA: kapatilamadi: ' + $_.Exception.Message)
  exit 1
}
if ($hedef.WaitForExit(10000)) {
  Write-Host ('kapatildi: ' + $plan.ad + ' sid=' + $plan.sid + ' pid=' + $plan.pid + ' (' + $plan.mesaj + ')')
  exit 0
}
Write-Host ('UYARI: ' + $plan.ad + ' pid=' + $plan.pid + ' 10 sn icinde kapanmadi - ZORLANMADI')
exit 1
