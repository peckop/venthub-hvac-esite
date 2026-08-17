$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] 053e28"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: 053e28" -ForegroundColor Gray
Write-Host ""
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-053e2886.txt" -Raw | gemini --yolo
Write-Host $agentOutput
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-215932-053e2886.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-215932-053e2886.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-215932-053e2886.log" -Value "##VH_RESULT_END##" -Encoding UTF8
Write-Host ""
Write-Host "Tamamlandi." -ForegroundColor Green