[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-408bd597.txt" -Raw | gemini --yolo
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-230901-408bd597.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-230901-408bd597.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\superpowers-plan-20260405-230901-408bd597.log" -Value "##VH_RESULT_END##" -Encoding UTF8