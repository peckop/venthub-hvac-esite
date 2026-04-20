#!/usr/bin/env python3
"""
Registry V9 — F2 Migration: Dependencies, Relations, Scoring
==============================================================
task_dependencies, project_relations tablolari + project_config uzantilari.
"""
import sqlite3, sys, os
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ORION_HOME = Path(os.environ.get("ORION_HOME", Path.home() / ".orion"))
DB_PATH = str(ORION_HOME / "registry.db")

SCHEMA_SQL = """
-- ═══════════════════════════════════════════════════
-- Registry V9 — F2: Bagimlilik & Iliskiler & Skorlama
-- ═══════════════════════════════════════════════════

-- Gorev bagimliliklari (hangi gorev hangisini blokluyor)
CREATE TABLE IF NOT EXISTS task_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_project TEXT NOT NULL,
    blocker_task TEXT NOT NULL,
    blocked_project TEXT NOT NULL,
    blocked_task TEXT NOT NULL,
    relation_type TEXT DEFAULT 'blocks',   -- blocks | related | duplicates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_project, blocker_task, blocked_project, blocked_task)
);

-- Proje iliskileri (proje-proje haritasi)
CREATE TABLE IF NOT EXISTS project_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_project TEXT NOT NULL,
    target_project TEXT NOT NULL,
    relation_type TEXT DEFAULT 'depends_on', -- depends_on | feeds | mirrors
    weight REAL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_project, target_project, relation_type)
);
"""

# project_config uzantilari (ALTER TABLE — IF NOT EXISTS benzeri mantik)
ALTER_COLUMNS = [
    ("tree_path", "TEXT"),
    ("tree_parent", "TEXT"),
    ("display_name", "TEXT"),
]


def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Yeni tablolar
    cursor.executescript(SCHEMA_SQL)
    print("[OK] Tablolar olusturuldu: task_dependencies, project_relations")

    # project_config uzantilari
    cursor.execute("PRAGMA table_info(project_config)")
    existing_cols = {row[1] for row in cursor.fetchall()}

    added = 0
    for col_name, col_type in ALTER_COLUMNS:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE project_config ADD COLUMN {col_name} {col_type}")
            print(f"  [+] project_config.{col_name} ({col_type}) eklendi")
            added += 1

    # Mevcut projelere tree_path seed
    cursor.execute("SELECT project_id FROM project_config WHERE tree_path IS NULL")
    null_projects = cursor.fetchall()
    for row in null_projects:
        pid = row[0]
        # Varsayilan tree_path olustur
        tree = f"PROJ.{pid.upper().replace('-', '_')[:8]}"
        cursor.execute(
            "UPDATE project_config SET tree_path = ?, display_name = ? WHERE project_id = ?",
            (tree, pid, pid)
        )
        print(f"  [SEED] {pid} -> tree_path: {tree}")

    conn.commit()

    # Dogrulama
    tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    print(f"\n[OK] DB tablolari: {sorted(tables)}")
    print(f"[OK] {added} yeni sutun eklendi")

    conn.close()
    print("\n[TAMAM] F2 Migration basariyla tamamlandi.")


if __name__ == "__main__":
    migrate()
