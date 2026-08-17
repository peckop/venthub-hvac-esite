[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-7ae3ff8c.txt" -Raw | gemini --yolo
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\venthub-architecture-20260405-224451-7ae3ff8c.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\venthub-architecture-20260405-224451-7ae3ff8c.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\venthub-architecture-20260405-224451-7ae3ff8c.log" -Value "##VH_RESULT_END##" -Encoding UTF8