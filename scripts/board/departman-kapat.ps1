# departman-kapat.ps1 - bir departman penceresi KAYIPSIZ kapatilabilir mi diye KARAR verir; pencereyi KENDISI KAPATMAZ.
#
# Kullanim:   departman-kapat.cmd <Rol> [--kuru] [--istek-atla] [--bekle-sn N]      (bu dosyayi cmd sarmalar)
#   --kuru        : posta gondermez, beklemez; kapinin bugunku hukmunu yazar.
#   --istek-atla  : "durum dosyani yaz" istegi zaten SendMessage ile atildi; yalniz olc ve karara bak.
#   --bekle-sn N  : istek atildiktan sonra durum dosyasinin taze olmasini en cok N sn bekle (varsayilan 90).
#
# KARAR (rol -> acik pencere -> istek -> durum dosyasi taze mi -> bosta mi) scripts/board/departman-kapat.cjs'tedir
# ve --json ile buraya gelir; burasi yalniz hukmu ve INSANA verilecek talimati YAZAR.
#
# KARAR-ONLY (Ops karari 2026-09-30): bu betik HICBIR sureci sonlandirmaz - ne tek pid, ne toplu, ne zorla.
# Sebep: izin denetimi baska bir oturumun surecini oldurmeyi reddediyor (tasarim siniri) ve Windows'ta konsol
# surecini "nazikce" kapatmanin guvenilir yolu yok. Kapatma INSAN EYLEMIDIR: cikti "KAPATILABILIR" derse
# pencereyi/sekmeyi Recep elle kapatir. Surec sonlandiran herhangi bir komut bu dosyaya girerse kapi testi
# (INV-DEPARTMAN-KAPAT-4) kirmizi verir.
#
# CIKIS: 0 = kapatilabilir / zaten kapali - 1 = kapatilamaz / hata.
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
  Write-Host ('KAPATILAMAZ: ' + $plan.mesaj)
  exit 1
}
if ($plan.karar -ne 'kapat') {
  Write-Host ('HATA: bilinmeyen karar: ' + $plan.karar)
  exit 1
}

# Kuru kip insana EMIR vermez ("SIMDI ... ELLE kapat" yaniltici olur) ve ayni mesaji iki kez basmaz.
# JSON'daki talimat alani kuru kipte de durur; burada yalniz basilmaz.
if ($kuru) {
  Write-Host $plan.mesaj
  Write-Host ('hedef: ' + $plan.ad + ' sid=' + $plan.sid + ' pid=' + $plan.pid)
  Write-Host '(kuru: talimat verilmedi)'
  exit 0
}
Write-Host ('KAPATILABILIR: ' + $plan.ad + ' sid=' + $plan.sid + ' pid=' + $plan.pid + ' (' + $plan.mesaj + ')')
Write-Host $plan.talimat
exit 0
