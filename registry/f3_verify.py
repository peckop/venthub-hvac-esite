#!/usr/bin/env python3
"""F3 Cikis Dogrulamasi — Otonomi, dispatcher, tozlasma, sureklilik, SYS gozlem."""
import sqlite3, sys, os, json
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent))
from autonomy_engine import (
    check_level_promotion, recommend_model, cross_pollinate,
    load_last_contract, record_decision
)

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

print("=== F3 CIKIS KOSULLARI DOGRULAMA ===\n")
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

# 1. autonomy_levels tablosu var ve Seviye 1 aktif mi?
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
check("autonomy_levels" in tables, "autonomy_levels tablosu mevcut")
check("model_performance" in tables, "model_performance tablosu mevcut")
check("continuity_contracts" in tables, "continuity_contracts tablosu mevcut")

# Tum domain'ler Seviye 1 mi?
levels = conn.execute("SELECT domain, current_level FROM autonomy_levels").fetchall()
check(len(levels) == 8, f"8 domain kayitli (gercek: {len(levels)})")
all_level1 = all(r["current_level"] == 1 for r in levels)
check(all_level1, "Tum domain'ler Seviye 1 (Asistan)")

# 2. Model performans verisi var mi?
perf_count = conn.execute("SELECT COUNT(*) FROM model_performance").fetchone()[0]
check(perf_count >= 1, f"Model performans karnesi {perf_count} kayit iceriyor (beklenen: >= 1)")

# 3. Dispatcher onerisi calisiyor mu?
rec = recommend_model("SEC", "review")
check(rec["model"] in ("OPU", "SON", "GEM", "FLA"), f"Dispatcher SEC/review -> {rec['model']}")
check(rec["confidence"] > 0, f"Dispatcher guven skoru: {rec['confidence']:.0%}")

# 4. SYS otonom gozlem fikri olusmus mu?
sys_ideas = conn.execute("SELECT COUNT(*) FROM ideas WHERE author_model = 'SYS'").fetchone()[0]
check(sys_ideas >= 1, f"SYS {sys_ideas} otonom gozlem fikri uretmis (beklenen: >= 1)")

# 5. Sureklilik sozlesmesi var mi?
contract_count = conn.execute("SELECT COUNT(*) FROM continuity_contracts").fetchone()[0]
check(contract_count >= 1, f"Sureklilik sozlesmesi {contract_count} kayit (beklenen: >= 1)")

# 6. Sozlesme yukleniyor mu?
contract_output = load_last_contract()
check("SUREKLILIK" in contract_output, "Sureklilik sozlesmesi yuklenebiliyor")

# 7. Otonomi raporu dogru formatta mi?
autonomy_report = check_level_promotion()
check("OTONOMI DURUM RAPORU" in autonomy_report, "Otonomi raporu uretiliyor")
check("Asistan" in autonomy_report, "Seviye 1 (Asistan) gorunuyor")

# 8. Capraz tozlasma fonksiyonu calisiyor mu?
pollinate_output = cross_pollinate()
check("TOZLASMA" in pollinate_output, "Capraz tozlasma fonksiyonu calisiyor")

conn.close()

# Sonuc
print(f"\n{'='*40}")
print(f"SONUC: {passed} PASS / {failed} FAIL")
if failed == 0:
    print("F3 CIKIS KOSULLARI: TAMAMLANDI")
else:
    print("F3 CIKIS KOSULLARI: EKSIK")
