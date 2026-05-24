$host.UI.RawUI.WindowTitle = "VentHub Ajan [paralel-review] c516a1"
Write-Host "=== VentHub Ajan: paralel-review ===" -ForegroundColor Cyan
Write-Host "ID: c516a1" -ForegroundColor Gray
Write-Host ""
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-c516a1b9.txt" -Raw | gemini --yolo
Write-Host $agentOutput
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-220044-c516a1b9.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-220044-c516a1b9.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-220044-c516a1b9.log" -Value "##VH_RESULT_END##" -Encoding UTF8
Write-Host ""
Write-Host "Tamamlandi." -ForegroundColor Green