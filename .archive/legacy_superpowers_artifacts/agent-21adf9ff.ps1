$host.UI.RawUI.WindowTitle = "VentHub Ajan [plan] 21adf9"
Write-Host "=== VentHub Ajan: plan ===" -ForegroundColor Cyan
Write-Host "ID: 21adf9" -ForegroundColor Gray
Write-Host ""
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-21adf9ff.txt" -Raw | gemini --yolo
Write-Host $agentOutput
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-215208-21adf9ff.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-215208-21adf9ff.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-215208-21adf9ff.log" -Value "##VH_RESULT_END##" -Encoding UTF8
Write-Host ""
Write-Host "Tamamlandi." -ForegroundColor Green