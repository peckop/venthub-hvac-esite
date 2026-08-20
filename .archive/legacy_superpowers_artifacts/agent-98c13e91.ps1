[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-98c13e91.txt" -Raw | gemini --yolo
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260406-205750-98c13e91.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260406-205750-98c13e91.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260406-205750-98c13e91.log" -Value "##VH_RESULT_END##" -Encoding UTF8