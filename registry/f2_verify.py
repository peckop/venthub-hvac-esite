#!/usr/bin/env python3
"""F2 Cikis Dogrulamasi — Bagimlilik, skorlama, promote, discard, brifing."""
import sqlite3, sys, os
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent))
from triage_engine import triage, promote_idea, discard_idea, add_dependency, strategic_briefing

DB_PATH = str(Path.home() / ".orion" / "registry.db")

passed = 0
failed = 0

def check(condition, msg):
    global passed, failed
    if condition:
        print(f"  [PASS] {msg}")
        passed += 1
    else:
        print(f"  [FAIL] {msg}")
        failed += 1

print("=== F2 CIKIS KOSULLARI DOGRULAMA ===\n")
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

# 1. task_dependencies tablosu var mi?
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
check("task_dependencies" in tables, "task_dependencies tablosu mevcut")
check("project_relations" in tables, "project_relations tablosu mevcut")

# 2. project_config'e tree_path eklenmis mi?
cols = [r[1] for r in conn.execute("PRAGMA table_info(project_config)").fetchall()]
check("tree_path" in cols, "project_config.tree_path sutunu mevcut")
check("tree_parent" in cols, "project_config.tree_parent sutunu mevcut")
check("display_name" in cols, "project_config.display_name sutunu mevcut")

# 3. tree_path dolu mu?
null_paths = conn.execute("SELECT COUNT(*) FROM project_config WHERE tree_path IS NULL").fetchone()[0]
total_prj = conn.execute("SELECT COUNT(*) FROM project_config").fetchone()[0]
check(null_paths == 0 and total_prj > 0, f"Tum projeler tree_path'e sahip ({total_prj} proje, {null_paths} null)")

# 4. Bagimlilik kaydi var mi?
dep_count = conn.execute("SELECT COUNT(*) FROM task_dependencies").fetchone()[0]
check(dep_count >= 1, f"task_dependencies {dep_count} kayit iceriyor (beklenen: >= 1)")

# 5. Promote edilmis fikir var mi?
promoted = conn.execute("SELECT COUNT(*) FROM ideas WHERE status='promoted'").fetchone()[0]
check(promoted >= 1, f"{promoted} fikir promote edilmis")

# 6. Discard edilmis fikir var mi?
discarded = conn.execute("SELECT COUNT(*) FROM ideas WHERE status='discarded'").fetchone()[0]
check(discarded >= 1, f"{discarded} fikir discard edilmis")

# 7. Triage skor ciktisi calisiyor mu?
triage_output = triage("venthub-hvac-esite")
check("TRIAGE RAPORU" in triage_output, "Triage raporu uretiliyor")
check("Skor" in triage_output, "Triage skoru hesaplaniyor")

# 8. Blocker skora etkisi
# T009'un blocker'i var (T010 onu blokluyor) — skoru 8.0 olmali (basePriority 6 + blocker 2)
check("8.0  T009" in triage_output, "Blocker skora yansiyor (T009: 6.0 + 2.0 blocker = 8.0)")

# 9. Stratejik brifing
briefing_output = strategic_briefing("venthub-hvac-esite")
check("STRATEJIK BRIFING" in briefing_output, "Stratejik brifing uretiliyor")
check("[INBOX]" in briefing_output, "Brifingde inbox durumu var")
check("[GOREVLER]" in briefing_output, "Brifingde gorev listesi var")
check("[PARALEL]" in briefing_output or "[BAYATLIK]" in briefing_output, "Brifingde paralel/bayatlik analizi var")

conn.close()

# Sonuc
print(f"\n{'='*40}")
print(f"SONUC: {passed} PASS / {failed} FAIL")
if failed == 0:
    print("F2 CIKIS KOSULLARI: TAMAMLANDI")
else:
    print("F2 CIKIS KOSULLARI: EKSIK")
