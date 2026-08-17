$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] 43cdb3"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: 43cdb3" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-43cdb373.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-211238-43cdb373.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin herhangi bir tusa basin." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")