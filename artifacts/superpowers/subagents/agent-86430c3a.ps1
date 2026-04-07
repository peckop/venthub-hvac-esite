$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] 86430c"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: 86430c" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-86430c3a.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-213331-86430c3a.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin herhangi bir tusa basin." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")