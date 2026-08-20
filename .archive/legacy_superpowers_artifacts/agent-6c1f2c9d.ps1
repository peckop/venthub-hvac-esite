[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-6c1f2c9d.txt" -Raw | gemini --yolo
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260405-224308-6c1f2c9d.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260405-224308-6c1f2c9d.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\kod-kaynagi-dalisi-20260405-224308-6c1f2c9d.log" -Value "##VH_RESULT_END##" -Encoding UTF8