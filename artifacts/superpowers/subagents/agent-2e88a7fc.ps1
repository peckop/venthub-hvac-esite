$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] 2e88a7"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: 2e88a7" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-2e88a7fc.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-204705-2e88a7fc.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "Cikmak icin Enter"