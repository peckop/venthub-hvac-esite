$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] e2b56f"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: e2b56f" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-e2b56f8c.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-200857-e2b56f8c.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "Cikmak icin Enter"