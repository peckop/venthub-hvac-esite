# AVenS PDF Katalog İndirici
# Tüm 22 PDF'i indirir

Add-Type -AssemblyName System.Web

$pdfs = @"
https://avensair.com/uploads/avens_fiyat_listesi_2025.pdf|Fiyat
https://avensair.com/uploads/Doc%20Pubblicita%20Residential%20ventilation%20Punto%20Evo%20Flexo_2.pdf|Konut
https://avensair.com/uploads/ResidentialVentilation.pdf|Konut
https://avensair.com/uploads/2022-11-en-ca-rm-es-radon.pdf|Konut
https://avensair.com/uploads/Doc%20Pubblicita%20Residential%20ventilation%20vort%20quadro%20evo_4.pdf|Konut
https://avensair.com/uploads/vortice_vort_mono_range_new.pdf|Konut
https://avensair.com/uploads/vortice-bravo-s.pdf|Konut
https://avensair.com/uploads/vortice-brochure-mev.pdf|Konut
https://avensair.com/uploads/vortice-brochure-radon-en.pdf|Konut
https://avensair.com/uploads/Commercial%20Ventilation%20in%20Line_1.pdf|Ticari
https://avensair.com/uploads/Air%20Conditioning%20Air%20Door_2.pdf|Ticari
https://avensair.com/uploads/Doc_Pubblicita_Industrial_ventilation_vort_jet_fan_system_1.pdf|Ticari
https://avensair.com/uploads/Doc_Pubblicita_Commercial_ventilation_in_line_fans_1.pdf|Ticari
https://avensair.com/uploads/qbk-sal-kc-evo-en-yeni-2025.pdf|Ticari
https://avensair.com/uploads/LINEO%20QUITE%20KATALOG.pdf|Ticari
https://avensair.com/uploads/E_ATEX_Range_yeni%202025.pdf|Endustriyel
https://avensair.com/uploads/industrial_Ventilation.pdf|Endustriyel
https://avensair.com/uploads/heat-master-slimroof-cati-fanlari-yeni.pdf|Endustriyel
https://avensair.com/uploads/nordik-hvls-industrial-ceiling-fans-181471.pdf|Endustriyel
https://avensair.com/uploads/nrg-range-175696-isi-geri-kazanim.pdf|IsiGeriKazanim
https://avensair.com/uploads/vort-hr-w-all-100-df.pdf|IsiGeriKazanim
https://avensair.com/uploads/Doc_Pubblicita_Air_treatment_Deumido_Range_1.pdf|HavaTemizleyici
"@

$downloadDir = "C:\Users\alize\venthub-hvac\avens-integration\pdfs"
if (!(Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

Write-Host "🚀 AVenS PDF İndirici Başlatılıyor..." -ForegroundColor Green
Write-Host "📁 İndirme klasörü: $downloadDir" -ForegroundColor Cyan
Write-Host ""

$lines = $pdfs -split "`n" | Where-Object { $_.Trim() -ne "" }
$total = $lines.Count
$success = 0
$failed = 0

foreach ($line in $lines) {
    $parts = $line.Split("|")
    $url = $parts[0].Trim()
    $category = $parts[1].Trim()
    
    $fileName = [System.IO.Path]::GetFileName($url)
    $fileName = [System.Web.HttpUtility]::UrlDecode($fileName)
    $fileName = "$category`_$fileName"
    
    $filePath = Join-Path $downloadDir $fileName
    
    Write-Host "📥 [$($success + $failed + 1)/$total] $fileName" -NoNewline
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing
        Write-Host " ✅" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        $failed++
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Yellow
Write-Host "✅ İndirme Tamamlandı!" -ForegroundColor Green
Write-Host "📊 Başarılı: $success PDF" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "❌ Başarısız: $failed PDF" -ForegroundColor Red
}
Write-Host "📁 Konum: $downloadDir" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Yellow
