#!/usr/bin/env python3
"""
Registry V9 — Triage Engine (F2)
===================================
Skorlama, promote, discard, bagimlilik ve stratejik brifing.
"""

import sqlite3, sys, os, json
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ORION_HOME = Path(os.environ.get("ORION_HOME", Path.home() / ".orion"))
DB_PATH = str(ORION_HOME / "registry.db")
REGISTRY_DIR = Path(__file__).parent.absolute()

# Skor sabitleri
PRIORITY_WEIGHT = 3.0
STALE_WEIGHT = 0.5
BLOCKER_WEIGHT = 2.0
CVE_WEIGHT = 10.0
TEMP_WEIGHT = 0.2

PRIORITY_MAP = {"urgent": 4, "high": 3, "medium": 2, "low": 1, "none": 0}


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ═══════════════════════════════════════════════════
# BAGIMLILIK YONETIMi
# ═══════════════════════════════════════════════════

def add_dependency(blocker_project: str, blocker_task: str,
                   blocked_project: str, blocked_task: str,
                   relation_type: str = "blocks") -> str:
    """Gorev bagimlilik iliskisi ekler: blocker BLOCKS blocked."""
    conn = _get_db()
    try:
        conn.execute(
            """INSERT OR IGNORE INTO task_dependencies
               (blocker_project, blocker_task, blocked_project, blocked_task, relation_type)
               VALUES (?, ?, ?, ?, ?)""",
            (blocker_project, blocker_task, blocked_project, blocked_task, relation_type)
        )
        conn.commit()
        return (f"[BAGIMLILIK] {blocker_project}/{blocker_task} "
                f"--{relation_type}--> {blocked_project}/{blocked_task}")
    finally:
        conn.close()


def list_blockers(project_id: str, task_id: str) -> list[dict]:
    """Bir gorevi bloklayan gorevleri listeler."""
    conn = _get_db()
    try:
        cursor = conn.execute(
            """SELECT blocker_project, blocker_task, relation_type
               FROM task_dependencies
               WHERE blocked_project = ? AND blocked_task = ?""",
            (project_id, task_id)
        )
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# PROMOTE / DISCARD
# ═══════════════════════════════════════════════════

def promote_idea(idea_id: str, target_project: str, target_task: str = None) -> str:
    """Fikri projeye atar (inbox -> proje). Fikir silinmez, status='promoted'."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, status FROM ideas WHERE idea_id = ?", (idea_id,))
        row = cursor.fetchone()
        if not row:
            return f"[HATA] Fikir bulunamadi: {idea_id}"
        if row["status"] == "promoted":
            return f"[UYARI] Fikir zaten promote edilmis: {idea_id} -> {row['title'][:40]}"

        cursor.execute(
            """UPDATE ideas
               SET status = 'promoted',
                   promoted_to_project = ?,
                   promoted_to_task = ?,
                   reviewed_at = CURRENT_TIMESTAMP,
                   temperature = temperature + 10.0
               WHERE idea_id = ?""",
            (target_project, target_task, idea_id)
        )
        conn.commit()
        return (f"[PROMOTE] {idea_id} -> {target_project}"
                + (f"/{target_task}" if target_task else "")
                + f"  '{row['title'][:40]}'")
    finally:
        conn.close()


def discard_idea(idea_id: str, reason: str = "Artik gecerli degil") -> str:
    """Fikri arsivler (silinmez, status='discarded')."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, status FROM ideas WHERE idea_id = ?", (idea_id,))
        row = cursor.fetchone()
        if not row:
            return f"[HATA] Fikir bulunamadi: {idea_id}"

        # Reason'i tags'e ekle
        cursor.execute("SELECT tags FROM ideas WHERE idea_id = ?", (idea_id,))
        existing_tags = cursor.fetchone()["tags"]
        tags = json.loads(existing_tags) if existing_tags else []
        tags.append(f"discard_reason:{reason}")

        cursor.execute(
            """UPDATE ideas
               SET status = 'discarded',
                   tags = ?,
                   reviewed_at = CURRENT_TIMESTAMP,
                   temperature = 0
               WHERE idea_id = ?""",
            (json.dumps(tags), idea_id)
        )
        conn.commit()
        return f"[DISCARD] {idea_id} arsivlendi. Sebep: {reason}"
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# SKORLAMA MOTORU
# ═══════════════════════════════════════════════════

def _calculate_task_score(task: dict, blocker_count: int) -> float:
    """Tek bir gorev icin triyaj skoru hesaplar.

    Formul: Priority*3 + StaleDays*0.5 + BlockerCount*2 + CVEFlag*10 + Temperature*0.2
    """
    priority_val = PRIORITY_MAP.get(str(task.get("priority", "medium")).lower(), 2)
    priority_score = priority_val * PRIORITY_WEIGHT

    # Stale days — gorev olusturulma tarihinden bu yana (tahmini)
    stale_days = 0  # Gorevlerde created_at yok, sabit varsayim

    blocker_score = blocker_count * BLOCKER_WEIGHT

    # CVE flag — title'da cve/security varsa
    title = (task.get("title") or "").lower()
    cve_flag = 1 if any(kw in title for kw in ["cve", "security", "vulnerability", "rls"]) else 0
    cve_score = cve_flag * CVE_WEIGHT

    # Temperature — gorevlerde yok, idea'lardan gelecek
    temp_score = 0

    total = priority_score + stale_days * STALE_WEIGHT + blocker_score + cve_score + temp_score
    return round(total, 1)


def triage(project_id: str = None) -> str:
    """Tum gorevleri skorlanmis sirada listeler."""
    conn = _get_db()
    try:
        cursor = conn.cursor()

        # Proje belirleme
        if not project_id:
            cursor.execute("SELECT project_id FROM project_config LIMIT 1")
            row = cursor.fetchone()
            project_id = row["project_id"] if row else None

        if not project_id:
            return "[HATA] Proje bulunamadi."

        # Gorevleri al
        cursor.execute(
            "SELECT * FROM tasks WHERE global_project_id = ? AND LOWER(status) != 'completed'",
            (project_id,)
        )
        tasks = [dict(r) for r in cursor.fetchall()]

        if not tasks:
            return f"[TRIAGE] {project_id}: Acik gorev yok."

        # Her gorev icin blocker sayisi ve skor hesapla
        scored = []
        for task in tasks:
            blockers = list_blockers(project_id, task["id"])
            score = _calculate_task_score(task, len(blockers))
            scored.append({
                **task,
                "score": score,
                "blocker_count": len(blockers),
            })

        # Skora gore sirala (yuksekten dusuge)
        scored.sort(key=lambda x: x["score"], reverse=True)

        lines = [f"TRIAGE RAPORU: {project_id} ({len(scored)} acik gorev)"]
        lines.append("-" * 70)
        lines.append(f"  {'Skor':>6s}  {'ID':8s}  {'Oncelik':8s}  {'Blk':>3s}  Baslik")
        lines.append("-" * 70)

        for t in scored:
            pri = (t.get("priority") or "?")[:8]
            lines.append(
                f"  {t['score']:6.1f}  {t['id']:8s}  {pri:8s}  "
                f"{t['blocker_count']:>3d}  {(t.get('title') or '?')[:42]}"
            )

        lines.append("-" * 70)
        if scored:
            top = scored[0]
            lines.append(f"\n  >> ONERI: En acil gorev -> [{top['id']}] {top.get('title','')[:50]}")
            lines.append(f"     Skor: {top['score']:.1f} | Blocker: {top['blocker_count']}")

        return "\n".join(lines)
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# STRATEJIK BRIFING
# ═══════════════════════════════════════════════════

def strategic_briefing(project_id: str = None) -> str:
    """Oturum baslangici icin stratejik brifing olusturur.

    Icerik:
      1. Inbox durumu (ham/sIcak fikirler)
      2. Acil gorevler (triage top-5)
      3. Bayatlik uyarilari
      4. Paralel is imkani
    """
    conn = _get_db()
    try:
        cursor = conn.cursor()

        # Proje
        if not project_id:
            cursor.execute("SELECT project_id FROM project_config LIMIT 1")
            row = cursor.fetchone()
            project_id = row["project_id"] if row else "unknown"

        lines = ["=" * 60]
        lines.append("  STRATEJIK BRIFING")
        lines.append("=" * 60)

        # 1. INBOX
        cursor.execute(
            "SELECT COUNT(*) as cnt FROM ideas WHERE status = 'raw'"
        )
        raw_count = cursor.fetchone()["cnt"]
        cursor.execute(
            "SELECT idea_id, title, temperature, domain FROM ideas "
            "WHERE status = 'raw' ORDER BY temperature DESC LIMIT 3"
        )
        hot_ideas = cursor.fetchall()

        lines.append(f"\n  [INBOX] {raw_count} ham fikir bekliyor")
        if hot_ideas:
            for idea in hot_ideas:
                lines.append(
                    f"    > {idea['idea_id']:16s} {idea['temperature']:5.1f}C "
                    f"{idea['domain']:5s} {idea['title'][:35]}"
                )

        # 2. ACIL GOREVLER (top-5)
        cursor.execute(
            "SELECT id, title, priority, status FROM tasks "
            "WHERE global_project_id = ? AND LOWER(status) != 'completed' "
            "LIMIT 5",
            (project_id,)
        )
        urgent_tasks = cursor.fetchall()
        lines.append(f"\n  [GOREVLER] {len(urgent_tasks)} acik gorev")
        for t in urgent_tasks:
            pri = (t["priority"] or "?")[:6]
            lines.append(f"    > [{t['id']:8s}] {pri:6s} {t['title'][:40]}")

        # 3. BAYATLIK
        now = datetime.now()
        cursor.execute(
            "SELECT idea_id, title, created_at FROM ideas "
            "WHERE status = 'raw' ORDER BY created_at ASC LIMIT 3"
        )
        oldest = cursor.fetchall()
        stale_count = 0
        for o in oldest:
            try:
                created = datetime.strptime(o["created_at"][:19], "%Y-%m-%d %H:%M:%S")
                age = (now - created).days
                if age > 14:
                    stale_count += 1
            except (ValueError, TypeError):
                pass

        if stale_count > 0:
            lines.append(f"\n  [!!! BAYATLIK] {stale_count} fikir 14+ gundur incelenmedi!")
        else:
            lines.append(f"\n  [BAYATLIK] Tum fikirler taze")

        # 4. PARALEL IS
        cursor.execute(
            "SELECT COUNT(*) as cnt FROM tasks "
            "WHERE global_project_id = ? AND LOWER(status) = 'backlog'",
            (project_id,)
        )
        backlog_count = cursor.fetchone()["cnt"]
        if backlog_count > 3:
            lines.append(f"\n  [PARALEL] {backlog_count} backlog gorev var — paralel ajan atamasina uygun")

        lines.append(f"\n{'='*60}")
        return "\n".join(lines)
    finally:
        conn.close()


# ── CLI ──
if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"

    if cmd == "triage":
        proj = sys.argv[2] if len(sys.argv) > 2 else None
        print(triage(proj))

    elif cmd == "promote":
        if len(sys.argv) < 4:
            print("Kullanim: promote <idea_id> <project> [task_id]")
            sys.exit(1)
        idea_id = sys.argv[2]
        project = sys.argv[3]
        task = sys.argv[4] if len(sys.argv) > 4 else None
        print(promote_idea(idea_id, project, task))

    elif cmd == "discard":
        if len(sys.argv) < 3:
            print("Kullanim: discard <idea_id> [reason]")
            sys.exit(1)
        idea_id = sys.argv[2]
        reason = " ".join(sys.argv[3:]) if len(sys.argv) > 3 else "Artik gecerli degil"
        print(discard_idea(idea_id, reason))

    elif cmd == "dep":
        if len(sys.argv) < 6:
            print("Kullanim: dep <blocker_proj> <blocker_task> <blocked_proj> <blocked_task>")
            sys.exit(1)
        print(add_dependency(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]))

    elif cmd == "briefing":
        proj = sys.argv[2] if len(sys.argv) > 2 else None
        print(strategic_briefing(proj))

    elif cmd == "test":
        print("=== F2 Triage Engine Test ===\n")

        # 1. Bagimlilik ekle
        print("--- Bagimlilik ---")
        print(add_dependency("venthub-hvac-esite", "T010", "venthub-hvac-esite", "T009"))
        print()

        # 2. Promote testi
        print("--- Promote ---")
        conn = _get_db()
        first_idea = conn.execute("SELECT idea_id FROM ideas WHERE status='raw' LIMIT 1").fetchone()
        conn.close()
        if first_idea:
            print(promote_idea(first_idea["idea_id"], "P02", "T040"))
        print()

        # 3. Discard testi
        print("--- Discard ---")
        conn = _get_db()
        second_idea = conn.execute("SELECT idea_id FROM ideas WHERE status='raw' LIMIT 1 OFFSET 1").fetchone()
        conn.close()
        if second_idea:
            print(discard_idea(second_idea["idea_id"], "Artik gecerli degil"))
        print()

        # 4. Triage
        print("--- Triage ---")
        print(triage("venthub-hvac-esite"))
        print()

        # 5. Briefing
        print("--- Stratejik Brifing ---")
        print(strategic_briefing("venthub-hvac-esite"))

    else:
        print("Kullanim:")
        print("  python triage_engine.py triage [project]")
        print("  python triage_engine.py promote <idea_id> <project> [task]")
        print("  python triage_engine.py discard <idea_id> [reason]")
        print("  python triage_engine.py dep <blk_proj> <blk_task> <blkd_proj> <blkd_task>")
        print("  python triage_engine.py briefing [project]")
        print("  python triage_engine.py test")
