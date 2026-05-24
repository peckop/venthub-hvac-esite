$TaskName = "\VentHub-autoDream"
$Action = New-ScheduledTaskAction -Execute "c:\Users\alize\venthub-hvac\scripts\run_autodream.bat"
$Trigger = New-ScheduledTaskTrigger -Once -At "19:09"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

Register-ScheduledTask -Action $Action -Trigger $Trigger -TaskName $TaskName -Settings $Settings -Force
Write-Host "Zamanlayici Kuruldu. Pilde bile calisacak."
