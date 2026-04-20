#!/usr/bin/env python3
"""
Registry V9 — Idea Engine (F0 + F1)
======================================
Fikir kaydetme, listeleme, DNA-ID, sicaklik ve bayatlik islemleri.
Orion merkez DB (~/.orion/registry.db) uzerinden calisir.

F0: save_idea, list_ideas (temel CRUD)
F1: DNA-ID encode/decode, sicaklik, bayatlik, soy agaci
"""

import sqlite3
import sys
import os
import json
from datetime import datetime, timedelta
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── KONFIGURASYON ──
ORION_HOME = Path(os.environ.get("ORION_HOME", Path.home() / ".orion"))
DB_PATH = str(ORION_HOME / "registry.db")
REGISTRY_DIR = Path(__file__).parent.absolute()
INBOX_DIR = REGISTRY_DIR / "inbox"

# ── SICAKLIK SABITLERI ──
TEMP_REFERENCE = 2.0      # Baska bir fikir referans gosterdiginde
TEMP_SPAWN = 5.0           # Yeni bir fikir dogurdugunda
TEMP_READ = 3.0            # Mimar okudugunda
TEMP_TASK_LINK = 10.0      # Bir gorevle iliskilendirildiginde
TEMP_DAILY_DECAY = 0.1     # Gunluk soguma


def _get_db():
    """DB baglantisi acar, ideas tablosunu dogrular."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            idea_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            domain TEXT NOT NULL DEFAULT 'ARC',
            author_model TEXT NOT NULL DEFAULT 'MIM',
            author_role TEXT,
            scope TEXT NOT NULL DEFAULT 'GL',
            status TEXT DEFAULT 'raw',
            temperature REAL DEFAULT 10.0,
            parent_idea TEXT,
            promoted_to_project TEXT,
            promoted_to_task TEXT,
            tags TEXT,
            content_path TEXT,
            cc_node_id INTEGER,
            global_project_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS idea_codebook (
            segment_type TEXT NOT NULL,
            code TEXT NOT NULL,
            full_name TEXT NOT NULL,
            description TEXT,
            metadata TEXT,
            PRIMARY KEY (segment_type, code)
        )
    """)
    conn.commit()
    return conn


# ═══════════════════════════════════════════════════
# F1: DNA-ID SISTEMI
# ═══════════════════════════════════════════════════

def _encode_dna_id(domain: str, author: str, scope: str, conn) -> str:
    """DNA-ID uretir: {NE}.{KIM}.{NEZAMAN}{SIRA}.{NEREDE}

    Ornek: SEC.OPU.0420A.VH
    - NE     = domain kodu (SEC)
    - KIM    = yazar kodu (OPU)
    - NEZAMAN = MMDD formati (0420)
    - SIRA   = gunluk sira (A, B, C, ..., Z, AA, AB, ...)
    - NEREDE  = kapsam kodu (VH)
    """
    now = datetime.now()
    date_part = now.strftime("%m%d")  # MMDD

    # Bugunun tarih prefixini hesapla
    prefix = f"{domain.upper()}.{author.upper()}.{date_part}"

    # Ayni gun + ayni domain + ayni author icin mevcut kayitlari say
    cursor = conn.cursor()
    cursor.execute(
        "SELECT idea_id FROM ideas WHERE idea_id LIKE ? ORDER BY idea_id",
        (f"{prefix}%",)
    )
    existing = cursor.fetchall()

    # Sira hesapla: A, B, C, ..., Z, AA, AB, ...
    seq_index = len(existing)
    if seq_index < 26:
        seq = chr(65 + seq_index)  # A-Z
    else:
        # 26+ icin: AA, AB, AC, ...
        first = chr(65 + (seq_index // 26) - 1)
        second = chr(65 + (seq_index % 26))
        seq = f"{first}{second}"

    return f"{prefix}{seq}.{scope.upper()}"


def decode_dna_id(dna_id: str) -> dict:
    """DNA-ID'yi parse eder ve segmentlere ayirir.

    Girdi : 'SEC.OPU.0420A.VH'
    Cikti : {
        'domain': 'SEC',
        'author': 'OPU',
        'date': '0420',
        'sequence': 'A',
        'scope': 'VH',
        'valid': True
    }
    """
    parts = dna_id.split(".")
    if len(parts) != 4:
        return {"valid": False, "error": f"4 segment bekleniyor, {len(parts)} bulundu", "raw": dna_id}

    domain = parts[0]
    author = parts[1]
    date_seq = parts[2]
    scope = parts[3]

    # Tarih ve sirayi ayir: '0420A' -> date='0420', seq='A'
    # Tarih her zaman 4 karakter (MMDD), geri kalan sira
    if len(date_seq) < 5:
        return {"valid": False, "error": f"Tarih+sira en az 5 karakter olmali: '{date_seq}'", "raw": dna_id}

    date_part = date_seq[:4]
    seq_part = date_seq[4:]

    return {
        "domain": domain,
        "author": author,
        "date": date_part,
        "sequence": seq_part,
        "scope": scope,
        "valid": True,
        "raw": dna_id,
    }


# ═══════════════════════════════════════════════════
# F1: SICAKLIK MOTORU
# ═══════════════════════════════════════════════════

def heat_idea(idea_id: str, reason: str, amount: float = None) -> str:
    """Bir fikrin sicakligini arttirir.

    Args:
        idea_id: Fikir ID'si (DNA-ID veya eski basit ID)
        reason: Isitma nedeni (reference, spawn, read, task_link)
        amount: Opsiyonel miktar (verilmezse neden'e gore otomatik)
    """
    heat_map = {
        "reference": TEMP_REFERENCE,
        "spawn": TEMP_SPAWN,
        "read": TEMP_READ,
        "task_link": TEMP_TASK_LINK,
    }

    if amount is None:
        amount = heat_map.get(reason, 1.0)

    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE ideas SET temperature = temperature + ? WHERE idea_id = ?",
            (amount, idea_id)
        )
        if cursor.rowcount == 0:
            return f"[UYARI] Fikir bulunamadi: {idea_id}"
        conn.commit()

        # Guncel sicakligi oku
        cursor.execute("SELECT temperature, title FROM ideas WHERE idea_id = ?", (idea_id,))
        row = cursor.fetchone()
        return f"[SICAKLIK] {idea_id}: +{amount}C ({reason}) -> {row['temperature']:.1f}C  '{row['title'][:40]}'"
    finally:
        conn.close()


def apply_daily_decay() -> str:
    """Tum fikirlerin sicakligini gunluk -0.1C dusurur (minimum 0)."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE ideas SET temperature = MAX(0, temperature - ?) WHERE status NOT IN ('promoted', 'discarded')",
            (TEMP_DAILY_DECAY,)
        )
        affected = cursor.rowcount
        conn.commit()
        return f"[SOGUMA] {affected} fikir -{TEMP_DAILY_DECAY}C sogutuldu"
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# F1: BAYATLIK HESAPLAMA
# ═══════════════════════════════════════════════════

def calculate_staleness() -> str:
    """Tum fikirlerin bayatlik durumunu hesaplar ve raporlar.

    Kurallar:
      0-7 gun  : TAZE
      7-14 gun : ILIK
      14-30 gun: BAYAT
      30+ gun  : MUDAHALE
    """
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT idea_id, title, domain, temperature, created_at, status "
            "FROM ideas WHERE status NOT IN ('promoted', 'discarded') "
            "ORDER BY created_at ASC"
        )
        rows = cursor.fetchall()
        if not rows:
            return "[BAYATLIK] Kontrol edilecek fikir yok."

        now = datetime.now()
        categories = {"TAZE": [], "ILIK": [], "BAYAT": [], "MUDAHALE": []}

        for row in rows:
            created = datetime.strptime(row["created_at"][:19], "%Y-%m-%d %H:%M:%S") if row["created_at"] else now
            age_days = (now - created).days

            if age_days <= 7:
                cat = "TAZE"
                icon = "[TAZE]"
            elif age_days <= 14:
                cat = "ILIK"
                icon = "[ILIK]"
            elif age_days <= 30:
                cat = "BAYAT"
                icon = "[BAYAT]"
            else:
                cat = "MUDAHALE"
                icon = "[!!!]"

            categories[cat].append({
                "id": row["idea_id"],
                "title": row["title"][:40],
                "age": age_days,
                "temp": row["temperature"],
                "icon": icon,
            })

        lines = ["BAYATLIK RAPORU"]
        lines.append("-" * 55)

        for cat, items in categories.items():
            if items:
                lines.append(f"\n  {cat} ({len(items)} fikir):")
                for item in items:
                    lines.append(
                        f"    {item['icon']:8s} [{item['id']:>12s}] "
                        f"{item['age']:>3d}g {item['temp']:5.1f}C  {item['title']}"
                    )

        total = sum(len(v) for v in categories.values())
        lines.append(f"\n{'-'*55}")
        lines.append(
            f"Toplam: {total} | "
            f"Taze: {len(categories['TAZE'])} | "
            f"Ilik: {len(categories['ILIK'])} | "
            f"Bayat: {len(categories['BAYAT'])} | "
            f"Mudahale: {len(categories['MUDAHALE'])}"
        )

        return "\n".join(lines)
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# F1: SOY AGACI (PROVENANCE)
# ═══════════════════════════════════════════════════

def get_lineage(idea_id: str) -> str:
    """Bir fikrin soy agacini (parent → child zinciri) gosterir."""
    conn = _get_db()
    try:
        cursor = conn.cursor()

        # Yukari git (bu fikrin atalari)
        chain = []
        current = idea_id
        visited = set()
        while current and current not in visited:
            visited.add(current)
            cursor.execute(
                "SELECT idea_id, title, parent_idea, domain FROM ideas WHERE idea_id = ?",
                (current,)
            )
            row = cursor.fetchone()
            if not row:
                break
            chain.append({"id": row["idea_id"], "title": row["title"][:40], "domain": row["domain"]})
            current = row["parent_idea"]

        chain.reverse()  # En eski ata basta

        # Asagi git (bu fikrin cocuklari)
        cursor.execute(
            "SELECT idea_id, title, domain FROM ideas WHERE parent_idea = ?",
            (idea_id,)
        )
        children = [{"id": r["idea_id"], "title": r["title"][:40], "domain": r["domain"]} for r in cursor.fetchall()]

        if not chain and not children:
            return f"[SOY AGACI] {idea_id}: Bagimsiz fikir (ata/cocuk yok)"

        lines = [f"SOY AGACI: {idea_id}"]
        lines.append("-" * 45)

        for i, node in enumerate(chain):
            indent = "  " * i
            marker = ">>" if node["id"] == idea_id else "  "
            lines.append(f"  {indent}{marker} [{node['id']}] {node['domain']} - {node['title']}")

        if children:
            lines.append(f"  {'  ' * len(chain)}  Cocuklar:")
            for child in children:
                lines.append(f"  {'  ' * (len(chain)+1)} [{child['id']}] {child['domain']} - {child['title']}")

        return "\n".join(lines)
    finally:
        conn.close()


# ═══════════════════════════════════════════════════
# ANA FONKSIYONLAR (F0 guncellenmis)
# ═══════════════════════════════════════════════════

def _write_inbox_md(idea_id: str, title: str, domain: str, author: str,
                    scope: str, content: str = None) -> str:
    """Inbox klasorune MD dosyasi yazar."""
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{idea_id.replace('.', '_')}.md"  # DNA-ID'deki noktalar dosya adida _ olur
    filepath = INBOX_DIR / filename
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    md_content = f"""---
idea_id: "{idea_id}"
domain: {domain}
author: {author}
scope: {scope}
status: raw
temperature: 10.0
created_at: {now}
---

# {title}

{content or '_(Detay henuz eklenmedi)_'}
"""
    filepath.write_text(md_content, encoding="utf-8")
    return str(filepath)


def save_idea(
    title: str,
    domain: str = "ARC",
    scope: str = "GL",
    author: str = "MIM",
    author_role: str = None,
    content: str = None,
    tags: list = None,
    parent_idea: str = None,
    global_project_id: str = None,
) -> str:
    """Yeni fikri DNA-ID ile DB'ye ve inbox/ klasorune kaydeder."""
    conn = _get_db()
    try:
        # DNA-ID uret
        idea_id = _encode_dna_id(domain, author, scope, conn)

        # MD dosyasi
        content_path = _write_inbox_md(idea_id, title, domain, author, scope, content)

        # DB'ye kaydet
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO ideas
            (idea_id, title, content, domain, author_model, author_role,
             scope, status, temperature, parent_idea, tags, content_path,
             global_project_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'raw', 10.0, ?, ?, ?, ?)
            """,
            (
                idea_id, title, content, domain.upper(), author.upper(),
                author_role, scope.upper(), parent_idea,
                json.dumps(tags) if tags else None, content_path,
                global_project_id,
            ),
        )
        conn.commit()

        # Eger parent varsa, parent'in sicakligini artir
        if parent_idea:
            heat_idea(parent_idea, "spawn")

        return (
            f"[FIKIR KAYDEDILDI]\n"
            f"  DNA-ID  : {idea_id}\n"
            f"  Baslik  : {title}\n"
            f"  Domain  : {domain}\n"
            f"  Yazar   : {author}\n"
            f"  Kapsam  : {scope}\n"
            f"  Dosya   : {content_path}\n"
            f"  Durum   : raw (ham fikir)"
            + (f"\n  Ata     : {parent_idea} (+5C isindi)" if parent_idea else "")
        )
    except Exception as e:
        return f"[HATA] Fikir kaydedilemedi: {e}"
    finally:
        conn.close()


def list_ideas(status_filter: str = None, limit: int = 50) -> str:
    """Kayitli fikirleri DNA-ID ile listeler."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        if status_filter:
            cursor.execute(
                "SELECT * FROM ideas WHERE LOWER(status) = LOWER(?) ORDER BY temperature DESC, created_at DESC LIMIT ?",
                (status_filter, limit),
            )
        else:
            cursor.execute(
                "SELECT * FROM ideas ORDER BY temperature DESC, created_at DESC LIMIT ?",
                (limit,),
            )

        rows = cursor.fetchall()
        if not rows:
            return "[INBOX] Henuz kayitli fikir yok."

        status_icons = {
            "raw": "[HAM]", "enriched": "[ZEN]", "clustered": "[KUM]",
            "promoted": "[TER]", "discarded": "[ARS]",
        }

        lines = [f"INBOX ({len(rows)} fikir | siralama: sicaklik)"]
        lines.append("-" * 65)

        for row in rows:
            status = row["status"] or "raw"
            icon = status_icons.get(status, "[?]")
            temp = row["temperature"] or 10.0
            domain = row["domain"] or "?"

            # Sicaklik gosterimi
            if temp >= 50:
                temp_bar = ">>>"
            elif temp >= 20:
                temp_bar = ">> "
            elif temp >= 10:
                temp_bar = ">  "
            else:
                temp_bar = ".  "

            lines.append(
                f"  {icon} [{row['idea_id']:>16s}] {domain:5s} "
                f"{temp_bar}{temp:5.1f}C  {row['title'][:40]}"
            )

        lines.append("-" * 65)
        return "\n".join(lines)
    except Exception as e:
        return f"[HATA] Inbox listelenemedi: {e}"
    finally:
        conn.close()


def migrate_old_ids() -> str:
    """F0'dan kalan eski basit ID'leri (001, 002) DNA-ID'ye donusturur."""
    conn = _get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, idea_id, domain, author_model, scope, created_at FROM ideas WHERE LENGTH(idea_id) <= 3")
        old_rows = cursor.fetchall()

        if not old_rows:
            return "[MIGRASYON] Eski formatta fikir bulunamadi. Tumu zaten DNA-ID."

        migrated = 0
        for row in old_rows:
            # Eski tarihi parse et
            created = row["created_at"][:10] if row["created_at"] else datetime.now().strftime("%Y-%m-%d")
            try:
                dt = datetime.strptime(created, "%Y-%m-%d")
            except ValueError:
                dt = datetime.now()

            date_part = dt.strftime("%m%d")
            domain = row["domain"] or "ARC"
            author = row["author_model"] or "MIM"
            scope = row["scope"] or "GL"

            # Sira: eski ID'yi sira olarak kullan (001 -> A, 002 -> B, etc.)
            old_num = int(row["idea_id"]) if row["idea_id"].isdigit() else 0
            seq = chr(64 + old_num) if 1 <= old_num <= 26 else f"X{old_num}"

            new_id = f"{domain}.{author}.{date_part}{seq}.{scope}"

            # Eski MD dosyasini yeniden adlandir
            old_md = INBOX_DIR / f"{row['idea_id']}.md"
            new_md = INBOX_DIR / f"{new_id.replace('.', '_')}.md"
            if old_md.exists():
                # Icerigindeki idea_id'yi de guncelle
                content = old_md.read_text(encoding="utf-8")
                content = content.replace(f'idea_id: "{row["idea_id"]}"', f'idea_id: "{new_id}"')
                new_md.write_text(content, encoding="utf-8")
                old_md.unlink()

            # DB guncelle
            cursor.execute(
                "UPDATE ideas SET idea_id = ?, content_path = ? WHERE id = ?",
                (new_id, str(new_md), row["id"])
            )
            migrated += 1

        conn.commit()
        return f"[MIGRASYON] {migrated} fikir DNA-ID'ye donusturuldu."
    except Exception as e:
        return f"[HATA] Migrasyon basarisiz: {e}"
    finally:
        conn.close()


# ── CLI TESTI ──
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        print("=== F1 Idea Engine Test ===\n")

        # 1. Migrasyon
        print("--- Eski ID Migrasyonu ---")
        print(migrate_old_ids())
        print()

        # 2. DNA-ID ile yeni fikir
        print("--- DNA-ID ile Yeni Fikir ---")
        print(save_idea(
            title="Supabase RLS policy audit otomasyonu",
            domain="SEC",
            scope="VH",
            author="OPU",
        ))
        print()

        # 3. Cocuk fikir (parent ile)
        print("--- Cocuk Fikir (Soy Agaci) ---")
        # Parent olarak ilk fikri kullan
        conn = _get_db()
        first = conn.execute("SELECT idea_id FROM ideas ORDER BY id LIMIT 1").fetchone()
        conn.close()
        if first:
            print(save_idea(
                title="RLS testi icin Vitest mock yazilmali",
                domain="SEC",
                scope="VH",
                author="SON",
                parent_idea=first["idea_id"],
            ))
        print()

        # 4. Sicaklik testi
        print("--- Sicaklik Testi ---")
        if first:
            print(heat_idea(first["idea_id"], "read"))
        print()

        # 5. Bayatlik
        print("--- Bayatlik Raporu ---")
        print(calculate_staleness())
        print()

        # 6. Soy agaci
        print("--- Soy Agaci ---")
        if first:
            print(get_lineage(first["idea_id"]))
        print()

        # 7. parse testi
        print("--- DNA-ID Parse Testi ---")
        test_id = "SEC.OPU.0420A.VH"
        parsed = decode_dna_id(test_id)
        print(f"  Girdi : {test_id}")
        print(f"  Cikti : {json.dumps(parsed, indent=2)}")
        print()

        # 8. Inbox listesi
        print("--- Guncel Inbox ---")
        print(list_ideas())

    elif len(sys.argv) > 1 and sys.argv[1] == "migrate":
        print(migrate_old_ids())

    elif len(sys.argv) > 1 and sys.argv[1] == "staleness":
        print(calculate_staleness())

    elif len(sys.argv) > 1 and sys.argv[1] == "decay":
        print(apply_daily_decay())

    else:
        print("Kullanim:")
        print("  python idea_engine.py test        # Tam test paketi")
        print("  python idea_engine.py migrate     # Eski ID'leri DNA-ID'ye cevir")
        print("  python idea_engine.py staleness   # Bayatlik raporu")
        print("  python idea_engine.py decay       # Gunluk soguma uygula")
