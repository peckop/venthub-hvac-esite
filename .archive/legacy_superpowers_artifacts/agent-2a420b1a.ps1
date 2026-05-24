$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] 2a420b"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: 2a420b" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-2a420b1a.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-204708-2a420b1a.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "Cikmak icin Enter"