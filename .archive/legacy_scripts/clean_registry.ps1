$root = 'c:\Users\alize\venthub-hvac\registry'

# 1. P06 Register -> Registry'ye taşı
$src = "$root\P06-System-Intelligence-Register\completed\999-refactor-3d-vacuum-animation"
$dst = "$root\P06-System-Intelligence-Registry\completed\999-refactor-3d-vacuum-animation"
if (Test-Path $src) {
    if (-not (Test-Path $dst)) {
        Copy-Item $src $dst -Recurse -Force
        Write-Host "Tasindi: 999-refactor -> P06-Registry/completed"
    } else {
        Write-Host "Zaten mevcut, atlandi: $dst"
    }
}

# 2. P06-Register'i sil
Remove-Item "$root\P06-System-Intelligence-Register" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Silindi: P06-System-Intelligence-Register"

# 3. P01_Auth sil (bos)
Remove-Item "$root\P01_Auth" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Silindi: P01_Auth"

# 4. P02_Sepet sil (bos diyalog)
Remove-Item "$root\P02_Sepet" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Silindi: P02_Sepet"

Write-Host ""
Write-Host "==== TAMAMLANDI ===="
Write-Host "Registry klasoru temiz. Kalan P klasorleri:"
Get-ChildItem $root -Directory | Where-Object { $_.Name -match '^P\d' } | Select-Object -ExpandProperty Name
