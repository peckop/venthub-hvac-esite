$garbage = @(
"Category3DIcon_temp.tsx", "active.txt", "active_out.txt", "active_tasks.txt", 
"active_tasks_utf8.txt", "branches.txt", "build2.log", "build3.log", 
"build_output.log", "check_output.txt", "check_output3.txt", "current_status.txt", 
"diff.txt", "error.log", "errors.txt", "final.json", "final2.json", 
"find_buttons.js", "find_buttons_write.js", "fix_encoding.ps1", "git_commits.txt", 
"help2.txt", "last_commit.txt", "lint-output.json", "lint.log", "lint_output.txt", 
"log.txt", "log_antigravity.txt", "mcp_files.txt", "my_git_status.txt", 
"onayla.bat", "patcher.py", "recents.txt", "recents_utf8.txt", "registry_list.txt", 
"registry_list_utf8.txt", "replace_script.py", "scan_results.json", "scope_out.txt", 
"status.txt", "status_out.txt", "task_dump.xml", "temp.txt", "temp_diff.txt", 
"tmp_gitlog.txt", "tmp_gitlog_engine.txt", "tmp_gitlog_utf8.txt", "tmp_out.txt", 
"tmp_scan.py", "ts_errors.txt", "ts_errors_final.txt", "ts_errors_final_2.txt", 
"ts_errors_final_2_utf8.txt", "ts_errors_final_utf8.txt", "ts_errors_utf8.txt", 
".tmp2.txt", ".tmp_status.txt"
)

# Kök, betiğin KENDİ konumundan türetilir (scripts/ -> repo kökü).
# NİÇİN: burada kullanıcı ev dizini SABİT yazılıydı (REC-102). İki zararı vardı — depo
# 2026-08-15'ten beri PUBLIC olduğu için kullanıcı adı açıktaydı, VE bu betik yıkıcı
# (Remove-Item) olduğu halde hangi ağaçtan çağrıldığına bakmaksızın DAİMA ana dizini
# siliyordu. Şerit ağacından koşan biri "kendi kökünü temizliyorum" sanıp ANA dizinden
# dosya silerdi. Repo-göreli kök, betiği hem taşınabilir hem DAHA GÜVENLİ yapar.
$repoRoot = Split-Path -Parent $PSScriptRoot

foreach ($f in $garbage) {
    $tam = Join-Path $repoRoot $f
    if (Test-Path $tam) {
        Remove-Item $tam -Force
    }
}

Write-Host "==== ÇÖPLÜK TAMAMEN TEMİZLENDİ ===="
