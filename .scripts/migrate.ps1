param(
  [string]$DbUrl = $env:SUPABASE_DB_URL,
  [switch]$WhatIf
)

Write-Host "=== Venthub: Local DB Migration (psql) ===" -ForegroundColor Cyan

# Ensure we're running from repo root (script works from anywhere)
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

if (-not (Test-Path "supabase/migrations")) {
  Write-Error "supabase/migrations klasörü bulunamadı. Bu scripti repo kökünde çalıştırın."
  exit 1
}

# Ask for DB URL if not provided
if (-not $DbUrl -or [string]::IsNullOrWhiteSpace($DbUrl)) {
  Write-Host "SUPABASE_DB_URL bulunamadı. Lütfen bağlantı URI'sini girin:" -ForegroundColor Yellow
  $DbUrl = Read-Host "postgresql://postgres:PAROLA@db.<ref>.supabase.co:5432/postgres"
}

# Quick validation
if ($DbUrl -notmatch "^postgres(ql)?://.+@db\.[a-z0-9]+\.supabase\.co:5432/.+") {
  Write-Warning "DB URL beklenen formata benzemiyor. Devam ediliyor..."
}

# Resolve psql (native or docker fallback)
$useDockerPsql = $false
$psqlExe = (Get-Command psql -ErrorAction SilentlyContinue).Source
if ($psqlExe) {
  $psqlVersion = & $psqlExe --version
  Write-Host "psql bulundu: $psqlVersion" -ForegroundColor Green
} else {
  # Docker fallback (uses official postgres image)
  if ((Get-Command docker -ErrorAction SilentlyContinue)) {
    $useDockerPsql = $true
    $psqlVersion = (& docker run --rm postgres:17 psql --version) 2>$null
    if (-not $psqlVersion) {
      Write-Error "Ne yerel psql ne de Docker ile psql çalıştırılabildi."
      exit 1
    }
    Write-Host "Docker ile psql kullanılacak: $psqlVersion" -ForegroundColor Green
  } else {
    Write-Error "psql bulunamadı ve Docker da yok. Lütfen PostgreSQL client kurun veya Docker yükleyin."
    exit 1
  }
}

# Collect migrations
$files = Get-ChildItem -Path "supabase/migrations" -Filter *.sql -File | Sort-Object Name
if (-not $files -or $files.Count -eq 0) {
  Write-Host "Uygulanacak migration yok." -ForegroundColor Yellow
  exit 0
}

Write-Host "Hedef host: $(("$DbUrl") -replace '.*@([^:/]+).*','$1')" -ForegroundColor DarkCyan
if ($WhatIf) { Write-Host 'Dry-run modunda çalışıyor (WhatIf) - SQL uygulanmayacak.' -ForegroundColor Yellow }

$ErrorActionPreference = 'Stop'
try {
  foreach ($f in $files) {
    Write-Host ("Applying {0}" -f $f.Name) -ForegroundColor Magenta
    if (-not $WhatIf) {
      if (-not $useDockerPsql) {
        & $psqlExe "$DbUrl" -v ON_ERROR_STOP=1 -f "$($f.FullName)"
      } else {
        $migrationsPath = (Resolve-Path "supabase/migrations").Path
        & docker run --rm -i -v "$($migrationsPath):/migrations:ro" postgres:17 psql "$DbUrl" -v ON_ERROR_STOP=1 -f "/migrations/$($f.Name)"
      }
      if ($LASTEXITCODE -ne 0) { throw "psql exited with code $LASTEXITCODE for $($f.Name)" }
    }
  }
  Write-Host 'Migration(lar) başarıyla uygulandı.' -ForegroundColor Green
  exit 0
} catch {
  Write-Error $_
  exit 1
}
