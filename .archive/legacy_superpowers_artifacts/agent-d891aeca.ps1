$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] d891ae"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: d891ae" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-d891aeca.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-213239-d891aeca.log" -Append
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin herhangi bir tusa basin." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")