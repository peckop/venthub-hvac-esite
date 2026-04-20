#!/usr/bin/env python3
"""
Registry V9 — F3 Migration: Autonomy, Performance, Continuity
================================================================
autonomy_levels, model_performance tablolari.
"""
import sqlite3, sys, os
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ORION_HOME = Path(os.environ.get("ORION_HOME", Path.home() / ".orion"))
DB_PATH = str(ORION_HOME / "registry.db")

SCHEMA_SQL = """
-- ═══════════════════════════════════════════════════
-- Registry V9 — F3: Otonomi & Dispatcher & Performans
-- ═══════════════════════════════════════════════════

-- Otonomi seviyeleri (domain bazli guven)
CREATE TABLE IF NOT EXISTS autonomy_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,                    -- SEC, ARC, PERF, UX, DATA, INFRA, DX, BIZ
    current_level INTEGER DEFAULT 1,         -- 1=Asistan, 2=Yari-Otonom, 3=Tam-Otonom
    accuracy_rate REAL DEFAULT 0.0,          -- Basari orani (0.0 - 1.0)
    total_decisions INTEGER DEFAULT 0,       -- Toplam karar sayisi
    correct_decisions INTEGER DEFAULT 0,     -- Dogru karar sayisi
    last_promoted_at TIMESTAMP,              -- Son seviye yukseltme tarihi
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(domain)
);

-- Model performans karnesi (domain x model x basari)
CREATE TABLE IF NOT EXISTS model_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_code TEXT NOT NULL,                -- OPU, SON, GEM, FLA
    domain TEXT NOT NULL,                    -- SEC, ARC, PERF...
    task_type TEXT DEFAULT 'general',        -- plan, execute, review, triage
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_duration_ms REAL DEFAULT 0,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_code, domain, task_type)
);

-- Sureklilik sozlesmesi (session log)
CREATE TABLE IF NOT EXISTS continuity_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    agent_id TEXT,
    project_id TEXT,
    summary TEXT NOT NULL,
    next_action TEXT NOT NULL,
    open_tasks TEXT,                          -- JSON: acik gorev ID listesi
    hot_ideas TEXT,                           -- JSON: sicak fikir ID listesi
    triage_snapshot TEXT,                     -- JSON: triage skor ozeti
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

# Otonomi baslangic degerleri — tum domain'ler Seviye 1
AUTONOMY_SEED = [
    ("SEC", 1), ("ARC", 1), ("PERF", 1), ("UX", 1),
    ("DATA", 1), ("INFRA", 1), ("DX", 1), ("BIZ", 1),
]


def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript(SCHEMA_SQL)
    print("[OK] Tablolar: autonomy_levels, model_performance, continuity_contracts")

    # Autonomy seed
    inserted = 0
    for domain, level in AUTONOMY_SEED:
        try:
            cursor.execute(
                "INSERT INTO autonomy_levels (domain, current_level) VALUES (?, ?)",
                (domain, level)
            )
            inserted += 1
        except sqlite3.IntegrityError:
            pass

    conn.commit()
    print(f"[OK] Otonomi seed: {inserted} domain Seviye 1 olarak baslatildi")

    # Dogrulama
    tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    print(f"\n[OK] Toplam {len(tables)} tablo: {sorted(tables)}")

    conn.close()
    print("\n[TAMAM] F3 Migration basariyla tamamlandi.")


if __name__ == "__main__":
    migrate()
