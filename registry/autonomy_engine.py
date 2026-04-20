#!/usr/bin/env python3
"""
Registry V9 — Autonomy Engine (F3)
=====================================
Otonomi gradyani, ogrenen dispatcher, capraz tozlasma, sureklilik sozlesmesi.
"""

import sqlite3, sys, os, json
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ORION_HOME = Path(os.environ.get("ORION_HOME", Path.home() / ".orion"))
DB_PATH = str(ORION_HOME / "registry.db")

# Seviye 2'ye gecis icin minimum metrikler
LEVEL2_THRESHOLD = {"min_decisions": 10, "min_accuracy": 0.8}
LEVEL3_THRESHOLD = {"min_decisions": 50, "min_accuracy": 0.95}


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ═══════════════════════════════════════════════════
# OTONOMI GRADYANI
# ═══════════════════════════════════════════════════

def get_autonomy_level(domain: str) -> dict:
    """Belirli bir domain icin otonomi seviyesini doner."""
    conn = _get_db()
    try:
        row = conn.execute(
            "SELECT * FROM autonomy_levels WHERE domain = ?", (domain.upper(),)
        ).fetchone()
        if not row:
            return {"domain": domain, "level": 1, "accuracy": 0.0, "message": "Kayitsiz domain, varsayilan Seviye 1"}
        return dict(row)
    finally:
        conn.close()


def record_decision(domain: str, model_code: str, was_correct: bool,
                    task_type: str = "general", duration_ms: float = 0) -> str:
    """Bir AI karar sonucunu kaydeder — otonomi ve performans icin veri biriktirir."""
    conn = _get_db()
    try:
        cursor = conn.cursor()

        # Otonomi guncelle
        if was_correct:
            cursor.execute(
                """UPDATE autonomy_levels
                   SET correct_decisions = correct_decisions + 1,
                       total_decisions = total_decisions + 1,
                       accuracy_rate = CAST(correct_decisions + 1 AS REAL) / (total_decisions + 1),
                       updated_at = CURRENT_TIMESTAMP
                   WHERE domain = ?""",
                (domain.upper(),)
            )
        else:
            cursor.execute(
                """UPDATE autonomy_levels
                   SET total_decisions = total_decisions + 1,
                       accuracy_rate = CAST(correct_decisions AS REAL) / (total_decisions + 1),
                       updated_at = CURRENT_TIMESTAMP
                   WHERE domain = ?""",
                (domain.upper(),)
            )

        # Model performans guncelle
        if was_correct:
            cursor.execute(
                """INSERT INTO model_performance (model_code, domain, task_type, success_count, avg_duration_ms)
                   VALUES (?, ?, ?, 1, ?)
                   ON CONFLICT(model_code, domain, task_type) DO UPDATE SET
                     success_count = success_count + 1,
                     avg_duration_ms = (avg_duration_ms * (success_count + failure_count - 1) + ?) / (success_count + failure_count),
                     last_used_at = CURRENT_TIMESTAMP""",
                (model_code.upper(), domain.upper(), task_type, duration_ms, duration_ms)
            )
        else:
            cursor.execute(
                """INSERT INTO model_performance (model_code, domain, task_type, failure_count, avg_duration_ms)
                   VALUES (?, ?, ?, 1, ?)
                   ON CONFLICT(model_code, domain, task_type) DO UPDATE SET
                     failure_count = failure_count + 1,
                     last_used_at = CURRENT_TIMESTAMP""",
                (model_code.upper(), domain.upper(), task_type, duration_ms)
            )

        conn.commit()
        return f"[KARAR] {domain}/{model_code}: {'DOGRU' if was_correct else 'YANLIS'} ({task_type})"
    finally:
        conn.close()


def check_level_promotion() -> str:
    """Tum domain'lerde seviye yukseltme kosullarini kontrol eder."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM autonomy_levels ORDER BY domain")
        rows = cursor.fetchall()

        lines = ["OTONOMI DURUM RAPORU"]
        lines.append("-" * 55)

        for row in rows:
            level = row["current_level"]
            total = row["total_decisions"]
            accuracy = row["accuracy_rate"]

            # Seviye yukseltme kontrolu
            eligible = False
            if level == 1 and total >= LEVEL2_THRESHOLD["min_decisions"] and accuracy >= LEVEL2_THRESHOLD["min_accuracy"]:
                eligible = True
                next_level = 2
            elif level == 2 and total >= LEVEL3_THRESHOLD["min_decisions"] and accuracy >= LEVEL3_THRESHOLD["min_accuracy"]:
                eligible = True
                next_level = 3

            level_name = {1: "Asistan", 2: "Yari-Otonom", 3: "Tam-Otonom"}.get(level, "?")
            promo_mark = " [YUKSELTME UYGUN!]" if eligible else ""

            lines.append(
                f"  {row['domain']:6s} Sev.{level} ({level_name:12s}) "
                f"| {total:3d} karar | %{accuracy*100:5.1f} basari{promo_mark}"
            )

        lines.append("-" * 55)
        return "\n".join(lines)
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# OGRENEN DISPATCHER
# ═══════════════════════════════════════════════════

def recommend_model(domain: str, task_type: str = "general") -> dict:
    """Domain ve gorev tipi icin en uygun modeli onerir."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT model_code,
                      success_count, failure_count,
                      CASE WHEN (success_count + failure_count) > 0
                           THEN CAST(success_count AS REAL) / (success_count + failure_count)
                           ELSE 0.5 END as win_rate,
                      avg_duration_ms
               FROM model_performance
               WHERE domain = ? AND task_type = ?
               ORDER BY win_rate DESC, avg_duration_ms ASC""",
            (domain.upper(), task_type)
        )
        rows = cursor.fetchall()

        if not rows:
            # Veri yok — varsayilan oneri
            defaults = {
                "SEC": "OPU", "ARC": "OPU", "PERF": "SON",
                "UX": "GEM", "DATA": "SON", "INFRA": "FLA",
                "DX": "FLA", "BIZ": "GEM",
            }
            model = defaults.get(domain.upper(), "SON")
            return {
                "model": model,
                "reason": "Varsayilan oneri (henuz performans verisi yok)",
                "confidence": 0.5,
                "data_points": 0,
            }

        best = rows[0]
        total = best["success_count"] + best["failure_count"]
        return {
            "model": best["model_code"],
            "reason": f"En yuksek basari orani (%{best['win_rate']*100:.0f}, {total} karar)",
            "confidence": best["win_rate"],
            "data_points": total,
            "avg_duration_ms": best["avg_duration_ms"],
        }
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# CAPRAZ TOZLASMA (Cross-Pollination)
# ═══════════════════════════════════════════════════

def cross_pollinate() -> str:
    """Ideas tablosundaki fikirleri baslik benzerligi ile eslestirir.

    Not: Bu basit bir keyword-match versiyonu.
    Ileri seviyede CC vektör arama ile zenginlestirilecek.
    """
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT idea_id, title, domain, status FROM ideas WHERE status IN ('raw', 'enriched')"
        )
        ideas = cursor.fetchall()

        if len(ideas) < 2:
            return "[TOZLASMA] Yeterli fikir yok (en az 2 gerekli)."

        # Basit kelime oerlap analizi
        matches = []
        for i, a in enumerate(ideas):
            words_a = set(a["title"].lower().split())
            for b in ideas[i+1:]:
                words_b = set(b["title"].lower().split())
                overlap = words_a & words_b - {"ve", "ile", "icin", "bir", "bu", "de", "da"}
                if len(overlap) >= 2:
                    matches.append({
                        "a": a["idea_id"],
                        "b": b["idea_id"],
                        "overlap": sorted(overlap),
                        "a_title": a["title"][:30],
                        "b_title": b["title"][:30],
                    })

        if not matches:
            return "[TOZLASMA] Benzer fikir cifti bulunamadi."

        lines = [f"CAPRAZ TOZLASMA ({len(matches)} eslesme)"]
        lines.append("-" * 55)
        for m in matches[:10]:
            lines.append(f"  {m['a']:>16s} <-> {m['b']:<16s}")
            lines.append(f"    Ortak: {', '.join(m['overlap'])}")
            lines.append(f"    A: {m['a_title']}")
            lines.append(f"    B: {m['b_title']}")
            lines.append("")

        return "\n".join(lines)
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# SYS OTONOM GOZLEM
# ═══════════════════════════════════════════════════

def sys_observe(project_id: str = "venthub-hvac-esite") -> str:
    """Sistem gozlem bazli otonom fikir uretir.

    Kaynak: mevcut gorevler, bayatlik, blocker pattern'leri
    Yazar: SYS (otonom)
    """
    sys.path.insert(0, str(Path(__file__).parent))
    from idea_engine import save_idea

    conn = _get_db()
    try:
        cursor = conn.cursor()

        observations = []

        # 1. Cok sayida backlog varsa
        cursor.execute(
            "SELECT COUNT(*) FROM tasks WHERE global_project_id = ? AND LOWER(status) = 'backlog'",
            (project_id,)
        )
        backlog = cursor.fetchone()[0]
        if backlog > 10:
            observations.append({
                "title": f"Backlog yuku kritik: {backlog} gorev birikti, once inceleme ve triaj yapilmali",
                "domain": "DX",
            })

        # 2. Blocker zinciri varsa
        cursor.execute("SELECT COUNT(*) FROM task_dependencies")
        deps = cursor.fetchone()[0]
        if deps > 0:
            cursor.execute(
                """SELECT blocked_task, COUNT(*) as cnt
                   FROM task_dependencies GROUP BY blocked_project, blocked_task
                   HAVING cnt > 1"""
            )
            multi_blocked = cursor.fetchall()
            if multi_blocked:
                for mb in multi_blocked:
                    observations.append({
                        "title": f"Gorev {mb['blocked_task']} birden fazla blocker'a sahip — oncelik cekmeli",
                        "domain": "ARC",
                    })

        # 3. Sicak fikirler incelenmemis mi?
        cursor.execute(
            "SELECT COUNT(*) FROM ideas WHERE temperature > 15 AND status = 'raw' AND reviewed_at IS NULL"
        )
        hot_unreviewed = cursor.fetchone()[0]
        if hot_unreviewed > 0:
            observations.append({
                "title": f"{hot_unreviewed} sicak fikir henuz incelenmedi — Mimar'in dikkatine sunulmali",
                "domain": "BIZ",
            })

        conn.close()

        if not observations:
            return "[SYS GOZLEM] Anomali tespit edilmedi. Sistem saglIkli."

        results = []
        for obs in observations:
            result = save_idea(
                title=obs["title"],
                domain=obs["domain"],
                scope="GL",
                author="SYS",
                author_role="observer",
            )
            results.append(result)

        return "\n\n".join(results)
    except Exception as e:
        return f"[HATA] SYS gozlem basarisiz: {e}"


# ═══════════════════════════════════════════════════
# SUREKLILIK SOZLESMESI
# ═══════════════════════════════════════════════════

def save_continuity_contract(session_id: str, agent_id: str,
                             project_id: str, summary: str,
                             next_action: str) -> str:
    """Session sonunda sureklilik sozlesmesi olusturur."""
    conn = _get_db()
    try:
        cursor = conn.cursor()

        # Acik gorevler
        cursor.execute(
            "SELECT id FROM tasks WHERE global_project_id = ? AND LOWER(status) != 'completed'",
            (project_id,)
        )
        open_tasks = [r["id"] for r in cursor.fetchall()]

        # Sicak fikirler
        cursor.execute(
            "SELECT idea_id FROM ideas WHERE status = 'raw' ORDER BY temperature DESC LIMIT 5"
        )
        hot_ideas = [r["idea_id"] for r in cursor.fetchall()]

        # Triage ozeti
        cursor.execute(
            "SELECT id, priority FROM tasks WHERE global_project_id = ? AND LOWER(status) != 'completed' LIMIT 5",
            (project_id,)
        )
        triage_snap = [{"id": r["id"], "priority": r["priority"]} for r in cursor.fetchall()]

        cursor.execute(
            """INSERT INTO continuity_contracts
               (session_id, agent_id, project_id, summary, next_action,
                open_tasks, hot_ideas, triage_snapshot)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                session_id, agent_id, project_id, summary, next_action,
                json.dumps(open_tasks), json.dumps(hot_ideas), json.dumps(triage_snap)
            )
        )
        conn.commit()

        return (
            f"[SUREKLILIK SOZLESMESI]\n"
            f"  Session : {session_id}\n"
            f"  Ajan    : {agent_id}\n"
            f"  Proje   : {project_id}\n"
            f"  Acik    : {len(open_tasks)} gorev\n"
            f"  Sicak   : {len(hot_ideas)} fikir\n"
            f"  Sonraki : {next_action[:60]}"
        )
    finally:
        conn.close()


def load_last_contract(project_id: str = None) -> str:
    """Son sureklilik sozlesmesini yukler (recall icin)."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        if project_id:
            cursor.execute(
                "SELECT * FROM continuity_contracts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
                (project_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM continuity_contracts ORDER BY created_at DESC LIMIT 1"
            )

        row = cursor.fetchone()
        if not row:
            return "[SUREKLILIK] Henuz sozlesme bulunamadi."

        open_tasks = json.loads(row["open_tasks"]) if row["open_tasks"] else []
        hot_ideas = json.loads(row["hot_ideas"]) if row["hot_ideas"] else []

        lines = ["SON SUREKLILIK SOZLESMESI"]
        lines.append("-" * 50)
        lines.append(f"  Tarih   : {row['created_at']}")
        lines.append(f"  Ajan    : {row['agent_id']}")
        lines.append(f"  Proje   : {row['project_id']}")
        lines.append(f"  Ozet    : {row['summary'][:100]}")
        lines.append(f"  Sonraki : {row['next_action'][:80]}")
        lines.append(f"  Acik    : {len(open_tasks)} gorev {open_tasks[:5]}")
        lines.append(f"  Sicak   : {len(hot_ideas)} fikir {hot_ideas[:3]}")
        lines.append("-" * 50)
        return "\n".join(lines)
    finally:
        conn.close()


# ── CLI ──
if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"

    if cmd == "test":
        print("=== F3 Autonomy Engine Test ===\n")

        # 1. Otonomi durumu
        print("--- Otonomi ---")
        print(check_level_promotion())
        print()

        # 2. Karar kaydi
        print("--- Karar Kaydi ---")
        print(record_decision("SEC", "OPU", True, "review", 1200))
        print(record_decision("SEC", "OPU", True, "review", 800))
        print(record_decision("ARC", "SON", True, "plan", 2000))
        print(record_decision("ARC", "SON", False, "plan", 3000))
        print()

        # 3. Dispatcher onerisi
        print("--- Dispatcher ---")
        rec = recommend_model("SEC", "review")
        print(f"  SEC/review -> {rec['model']} ({rec['reason']}, guven: {rec['confidence']:.0%})")
        rec2 = recommend_model("PERF", "execute")
        print(f"  PERF/execute -> {rec2['model']} ({rec2['reason']})")
        print()

        # 4. Capraz tozlasma
        print("--- Capraz Tozlasma ---")
        print(cross_pollinate())
        print()

        # 5. SYS gozlem
        print("--- SYS Otonom Gozlem ---")
        print(sys_observe())
        print()

        # 6. Sureklilik sozlesmesi
        print("--- Sureklilik Sozlesmesi ---")
        print(save_continuity_contract(
            session_id="test-session-001",
            agent_id="opus",
            project_id="venthub-hvac-esite",
            summary="F3 otonomi motoru test edildi",
            next_action="Dashboard zoom bilesenlerini olustur"
        ))
        print()
        print(load_last_contract())

        # 7. Guncellenmis otonomi
        print("\n--- Guncel Otonomi (karar sonrasi) ---")
        print(check_level_promotion())

    elif cmd == "autonomy":
        print(check_level_promotion())
    elif cmd == "dispatcher":
        domain = sys.argv[2] if len(sys.argv) > 2 else "ARC"
        task_type = sys.argv[3] if len(sys.argv) > 3 else "general"
        rec = recommend_model(domain, task_type)
        print(json.dumps(rec, indent=2))
    elif cmd == "pollinate":
        print(cross_pollinate())
    elif cmd == "observe":
        print(sys_observe())
    elif cmd == "contract":
        print(load_last_contract())
    else:
        print("Kullanim: autonomy | dispatcher <domain> [type] | pollinate | observe | contract | test")
