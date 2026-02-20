# fix_literal_newlines.ps1
# Projedeki tum .tsx ve .ts dosyalarini tara
# Icerisinde literal "\n" karakteri barindiranlari bul ve gercek newline'a donustur

$files = Get-ChildItem -Path (Join-Path $PSScriptRoot ".." "src") -Recurse -Include "*.tsx","*.ts"
$fixedFiles = @()

foreach ($file in $files) {
    $rawBytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $raw = [System.Text.Encoding]::UTF8.GetString($rawBytes)
    
    # Literal \n karakteri var mi? (backslash + n, gercek newline degil)
    if ($raw -match '\\n') {
        # Tum literal \n -> gercek newline
        $fixed = $raw -replace '(?<!\\)\\n', "`n"
        # Cift bos satir olustuysa biri kirp (isteğe bağlı, guvenli)
        # $fixed = $fixed -replace "`n`n`n+", "`n`n"
        [System.IO.File]::WriteAllText($file.FullName, $fixed, [System.Text.Encoding]::UTF8)
        $fixedFiles += $file.FullName
        Write-Host "DUZELTILDI: $($file.FullName)"
    }
}

Write-Host ""
Write-Host "TOPLAM DUZELTILEN DOSYA: $($fixedFiles.Count)"
