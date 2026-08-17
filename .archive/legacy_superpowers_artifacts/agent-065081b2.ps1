$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] 065081"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: 065081" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-065081b2.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-212239-065081b2.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin herhangi bir tusa basin." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")