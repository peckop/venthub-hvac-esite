$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] 555821"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: 555821" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-55582129.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-204711-55582129.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "Cikmak icin Enter"