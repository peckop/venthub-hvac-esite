$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] 12e35c"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: 12e35c" -ForegroundColor Gray
Write-Host ""
Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-12e35cdd.txt" -Raw | gemini --yolo | Tee-Object -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-214217-12e35cdd.log" -Append
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-214217-12e35cdd.log" -Value ""
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-214217-12e35cdd.log" -Value "##VH_RESULT_END##"
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin ENTER." -ForegroundColor Green
Read-Host