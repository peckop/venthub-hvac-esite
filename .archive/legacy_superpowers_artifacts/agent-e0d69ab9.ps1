[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-e0d69ab9.txt" -Raw | gemini --yolo
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260406-005024-e0d69ab9.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260406-005024-e0d69ab9.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260406-005024-e0d69ab9.log" -Value "##VH_RESULT_END##" -Encoding UTF8