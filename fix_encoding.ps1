$filePath = "c:\Users\alize\venthub-hvac\src\i18n\dictionaries\tr.ts"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Define the replacements
# Note: Since the file was saved as UTF-8 but with double-encoded characters, 
# we need to replace the specific byte-sequences that got turned into characters.
# However, Get-Content with -Encoding UTF8 might have already "fixed" some things or made them worse.
# Let's try to replace the literal "Ã¼" etc. strings.

$replacements = @{
    "Ã¼" = "ü";
    "Ãœ" = "Ü";
    "Ä±" = "ı";
    "Ä°" = "İ";
    "ÅŸ" = "ş";
    "Åž" = "Ş";
    "Ã§" = "ç";
    "Ã‡" = "Ç";
    "ÄŸ" = "ğ";
    "Äž" = "Ğ";
    "Ã¶" = "ö";
    "Ã–" = "Ö";
    "â€“" = "–";
    "â€”" = "—";
    "Â" = ""; # Often appears before NBSP or similar
    "Ã¢" = "â";
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

Set-Content $filePath $content -Encoding UTF8 -NoNewline
Write-Host "Fixed encoding in tr.ts"
