[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$promptText = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-ee3122d3.txt" -Raw
$agentOutput = gemini --yolo -p $promptText
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260406-210853-ee3122d3.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260406-210853-ee3122d3.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260406-210853-ee3122d3.log" -Value "##VH_RESULT_END##" -Encoding UTF8