# NLM Headless Refresh — PENCERE AÇMADAN token yenileme (kalıcı çözüm denemesi)
# Mantık: Chrome'u --headless=new ile kalıcı profilde aç (görünmez, ESET kaçıramaz),
# profil zaten girişli olduğundan nlm CDP'den taze cookie'yi sessizce çeker.
# Kullanım: powershell -ExecutionPolicy Bypass -File .agent/scripts/nlm-headless-refresh.ps1

Write-Host ""
Write-Host "=== NLM Headless Refresh (penceresiz) ===" -ForegroundColor Cyan
$ProfileDir = "$env:USERPROFILE\.notebooklm-mcp-cli\chrome-profiles\default"

# 1. Debug portlarindaki zombi Chrome'lari temizle
foreach ($port in 9222..9231) {
    $match = netstat -ano | Select-String ":$port\s+.*LISTENING"
    if ($match) {
        $procId = ($match -split '\s+')[-1]
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        if ($proc -and $proc.ProcessName -eq "chrome") {
            Write-Host "  Zombi Chrome PID $procId (port $port) olduruluyor" -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
    }
}
# Bayat port-map temizle
$PortMap = "$env:USERPROFILE\.notebooklm-mcp-cli\chrome-port-map.json"
if (Test-Path $PortMap) { Remove-Item $PortMap -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1

# 2. Chrome'u HEADLESS (gorunmez) ac
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) { $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe" }
Write-Host "1. Chrome headless aciliyor (port 9222, gorunmez)..." -ForegroundColor Gray
$chrome = Start-Process $chromePath -PassThru -ArgumentList `
    "--headless=new","--remote-debugging-port=9222","--no-first-run","--no-default-browser-check",`
    "--disable-gpu","--user-data-dir=$ProfileDir","https://notebooklm.google.com"
Start-Sleep -Seconds 14

# 3. CDP uzerinden token yenile
Write-Host "2. nlm login --force --cdp-url (sessiz)..." -ForegroundColor Gray
nlm login --force --cdp-url http://127.0.0.1:9222
$loginExit = $LASTEXITCODE

# 4. Headless Chrome'u kapat
if ($chrome -and -not $chrome.HasExited) {
    Stop-Process -Id $chrome.Id -Force -ErrorAction SilentlyContinue
}

# 5. Dogrula
Write-Host ""
Write-Host "3. Dogrulama (nlm login --check)..." -ForegroundColor Gray
nlm login --check
Write-Host ""
Write-Host "Bitti. (loginExit=$loginExit)" -ForegroundColor Green
