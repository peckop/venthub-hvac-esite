$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] 0c4113"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: 0c4113" -ForegroundColor Gray
Write-Host ""
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-0c411318.txt" -Raw | gemini --yolo
Write-Host $agentOutput
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-214749-0c411318.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-214749-0c411318.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-214749-0c411318.log" -Value "##VH_RESULT_END##" -Encoding UTF8
Write-Host ""
Write-Host "Tamamlandi. Kapatmak icin ENTER." -ForegroundColor Green
Read-Host