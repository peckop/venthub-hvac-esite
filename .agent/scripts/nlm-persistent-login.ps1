# NLM Persistent-Profile Login — KALICI COZUM denemesi
# Fark: Orijinal clean-login %TEMP% profiline giriyordu (ucucu) -> headless yenileme bir daha calismiyordu.
# Bu varyant MCP'nin KENDI kalici profiline giris yapar ki headless oto-yenileme calissin.
# Orijinal .agent/scripts/nlm-clean-login.ps1 yedek olarak duruyor.
# Kullanim: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-persistent-login.ps1

Write-Host ""
Write-Host "=== NLM Persistent Login (kalici cozum) ===" -ForegroundColor Cyan

# MCP'nin kalici Chrome profili (nlm headless yenileme bunu kullanir)
$ProfileDir = "$env:USERPROFILE\.notebooklm-mcp-cli\chrome-profiles\default"
Write-Host "Profil: $ProfileDir" -ForegroundColor Gray

# 1. Zombie Chrome temizle (debug portlari)
Write-Host "1. CDP portlari taraniyor..." -ForegroundColor Gray
foreach ($port in 9222..9231) {
    $match = netstat -ano | Select-String ":$port\s+.*LISTENING"
    if ($match) {
        $procId = ($match -split '\s+')[-1]
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -eq "chrome") {
            Write-Host "   Zombie Chrome PID $procId port $port - olduruluyor" -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 1

# 2. Bayat chrome-port-map temizle (olu pid kayitlari MCP'yi sasirtmasin)
$PortMap = "$env:USERPROFILE\.notebooklm-mcp-cli\chrome-port-map.json"
if (Test-Path $PortMap) {
    Write-Host "2. Bayat chrome-port-map.json temizleniyor..." -ForegroundColor Gray
    Remove-Item $PortMap -Force -ErrorAction SilentlyContinue
}

# 3. Chrome'u KALICI profille ac (orijinal script'in calisan flag'leri ile)
Write-Host "3. Chrome aciliyor (kalici profil, port 9222)..." -ForegroundColor Gray
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
}
Start-Process $chromePath -ArgumentList "--remote-debugging-port=9222","--no-first-run","--no-default-browser-check","--user-data-dir=$ProfileDir","https://notebooklm.google.com"
Start-Sleep -Seconds 5

# 4. NLM login --force --cdp-url ile bagla
Write-Host "4. NLM login baslatiyor (--force --cdp-url)..." -ForegroundColor Gray
Write-Host "   Google hesabinizla giris yapin (gerekiyorsa)..." -ForegroundColor Yellow
Write-Host ""
nlm login --force --cdp-url http://127.0.0.1:9222
