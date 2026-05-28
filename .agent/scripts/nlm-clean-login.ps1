# NLM Login Fix v3 — Kesin calisan yontem
# Kullanim: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-clean-login.ps1

Write-Host ""
Write-Host "=== NLM Login Fix v3 ===" -ForegroundColor Cyan

# 1. Zombie Chrome temizle
Write-Host "1. CDP portlari taraniyor..." -ForegroundColor Gray
foreach ($port in 9222..9231) {
    $match = netstat -ano | Select-String ":$port\s+.*LISTENING"
    if ($match) {
        $pid = ($match -split '\s+')[-1]
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -eq "chrome") {
            Write-Host "   Zombie Chrome PID $pid port $port - olduruluyor" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 1

# 2. Chrome'u kendimiz aciyoruz
Write-Host "2. Chrome aciliyor (port 9222)..." -ForegroundColor Gray
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
}
Start-Process $chromePath -ArgumentList "--remote-debugging-port=9222","--no-first-run","--no-default-browser-check","--user-data-dir=$env:TEMP\nlm-chrome-login","https://notebooklm.google.com"
Start-Sleep -Seconds 5

# 3. NLM'i --force --cdp-url ile bagliyoruz
Write-Host "3. NLM login baslatiyor (--force --cdp-url)..." -ForegroundColor Gray
Write-Host "   Google hesabinizla giris yapin..." -ForegroundColor Yellow
Write-Host ""
nlm login --force --cdp-url http://127.0.0.1:9222
