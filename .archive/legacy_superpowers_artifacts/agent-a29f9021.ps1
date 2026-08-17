$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] a29f90"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: a29f90" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-a29f9021.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-214108-a29f9021.log" -Append
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-214108-a29f9021.log" -Value ""
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-214108-a29f9021.log" -Value "##VH_RESULT_END##"
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin ENTER." -ForegroundColor Green
Read-Host