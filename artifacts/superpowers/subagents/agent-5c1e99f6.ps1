[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$agentOutput = Get-Content "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\prompt-5c1e99f6.txt" -Raw | gemini --yolo --resume "f2473368-f5c7-4e68-b421-d799ff81e76b"
Out-File -FilePath "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-230952-5c1e99f6.log" -Append -Encoding UTF8 -InputObject $agentOutput
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-230952-5c1e99f6.log" -Value "" -Encoding UTF8
Add-Content -Path "C:\Users\alize\venthub-hvac\artifacts\superpowers\subagents\paralel-review-20260405-230952-5c1e99f6.log" -Value "##VH_RESULT_END##" -Encoding UTF8