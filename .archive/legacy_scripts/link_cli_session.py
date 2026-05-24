#!/usr/bin/env python3
"""
link_cli_session.py — Gemini CLI Session ID'yi Registry görevine bağlar.

Kullanım:
  python scripts/link_cli_session.py <SESSION_ID> <GOREV_KLASORU>
  python scripts/link_cli_session.py 49fe6ca2-b892-4a45-9b6b-dfda1037e1aa registry/P00-Standalone/active/017-visual-page

Girdi:  Session UUID + Görev klasör yolu
İşlem:  Klasördeki tüm JSON artifact'lara cli_session_ids listesine ekler (append, duplicate yok)
Çıktı:  Hangi dosyalara yazıldığı bilgisi
"""

import json
import sys
from pathlib import Path

def link_session(session_id: str, task_dir: str) -> None:
    task_path = Path(task_dir)
    if not task_path.is_dir():
        print(f"❌ Klasör bulunamadı: {task_path}")
        sys.exit(1)

    # UUID format kontrolü (basit)
    if len(session_id) < 20:
        print(f"❌ Geçersiz session ID: '{session_id}' (çok kısa)")
        sys.exit(1)

    linked_files = []
    for json_file in task_path.glob("*.json"):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if not isinstance(data, dict):
                continue

            # cli_session_ids alanı yoksa oluştur
            if "cli_session_ids" not in data:
                data["cli_session_ids"] = []

            # Duplicate yoksa ekle
            if session_id not in data["cli_session_ids"]:
                data["cli_session_ids"].append(session_id)

                with open(json_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

                linked_files.append(json_file.name)

        except (json.JSONDecodeError, OSError):
            continue

    if linked_files:
        print(f"🔗 Session bağlandı: {session_id[:12]}...")
        for f in linked_files:
            print(f"   ✅ {f}")
    else:
        print(f"⚠️ Hiçbir JSON dosyasına yazılamadı (zaten bağlı veya dosya yok)")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Kullanım: python scripts/link_cli_session.py <SESSION_ID> <GOREV_KLASORU>")
        print("Örnek:    python scripts/link_cli_session.py 49fe6ca2-... registry/P00-Standalone/active/017-xxx")
        sys.exit(1)

    link_session(sys.argv[1], sys.argv[2])
