$ErrorActionPreference = "Stop"
$TaskName = "\VentHub-autoDream"
$Time = (Get-Date).AddMinutes(1)

$Action = New-ScheduledTaskAction -Execute "c:\Users\alize\venthub-hvac\scripts\run_autodream.bat"
$Trigger = New-ScheduledTaskTrigger -Once -At $Time
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -Action $Action -Trigger $Trigger -TaskName $TaskName -Settings $Settings -Force | Out-Null

Write-Host "Zamanlayici Kuruldu."
Write-Host "Hedef Tetiklenme Zamani: $Time"
Write-Host "(Ben bekliyorum, sistem kendiliginden uyanacak)..."

whiLe ((Get-Date) -lt $Time) {
    Start-Sleep -Seconds 2
}

# Windows'un baslatmasi ve yazmasi icin ufak tolerans beklemesi
Write-Host "Zaman Geldi! Windows uyandiriliyor..."
Start-Sleep -Seconds 15

Write-Host "====== LOG TARIHCESI ======"
if (Test-Path "c:\Users\alize\venthub-hvac\scripts\task.log") {
    Get-Content "c:\Users\alize\venthub-hvac\scripts\task.log"
} else {
    Write-Host "Log dosyasi bulunamadi. Zamanlayici calistirilmadi."
}

# Görevi gerçek saatine (her gün 07:00) kur ve bırak
$DailyTrigger = New-ScheduledTaskTrigger -Daily -At "07:00"
Register-ScheduledTask -Action $Action -Trigger $DailyTrigger -TaskName $TaskName -Settings $Settings -Force | Out-Null
Write-Host "====== TEST BITTI, GOREV 07:00 ICIN KALICI YAPILDI ======"
