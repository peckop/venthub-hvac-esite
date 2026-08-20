$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] b022b5"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: b022b5" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-b022b5e5.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-200854-b022b5e5.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Pencereyi kapatabilirsiniz." -ForegroundColor Green
Read-Host "Cikmak icin Enter"