#!/usr/bin/env python3
"""
approve_dream.py — Sabah brifingi oku, görev seç, engine'e ilet.
"""
import sys
import subprocess
from pathlib import Path

REPO_ROOT    = Path(__file__).parent.parent
BRIFING_DIR  = REPO_ROOT / "registry" / "sabah_brifing"
PULSE_FILE   = REPO_ROOT / "registry" / "PULSE.md"
ENGINE_PY    = REPO_ROOT / "registry" / "engine.py"


def en_guncel_brifing():
    dosyalar = sorted(BRIFING_DIR.glob("*.md"), key=lambda x: x.name, reverse=True)
    return dosyalar[0] if dosyalar else None


def brifing_goster(dosya):
    icerik = dosya.read_text(encoding="utf-8")
    print("\n" + "═" * 60)
    print(icerik)
    print("═" * 60)


def gorev_sec():
    brifing = en_guncel_brifing()
    if not brifing:
        print("❌ Brifing dosyası bulunamadı!")
        return

    # Brifing içeriğini ekrana bas
    brifing_goster(brifing)

    # Kullanıcıdan görev ID'si iste
    print("\nYukarıdaki brifingde belirtilen görev ID'lerinden birini gir.")
    print("Örnek: 017  veya  020  veya  031")
    print("Çıkmak için: Q")
    print()

    gorev_id = input("Görev ID: ").strip().upper()

    if gorev_id == "Q" or gorev_id == "":
        print("İptal edildi.")
        return

    # Başlık sor
    baslik = input(f"#{gorev_id} için kısa başlık (Enter = 'Görev {gorev_id}'): ").strip()
    if not baslik:
        baslik = f"Görev {gorev_id}"

    # Proje ID'sini PULSE'dan bul
    p_id = "P01"  # varsayılan
    if PULSE_FILE.exists():
        icerik = PULSE_FILE.read_text(encoding="utf-8")
        current = "P01"
        for line in icerik.splitlines():
            import re
            m = re.search(r"(P\d{2})", line[:20])
            if m:
                current = m.group(1)
            if gorev_id in line:
                p_id = current
                break

    print(f"\n⚙️  Görev başlatılıyor: {p_id} | #{gorev_id} | {baslik}")

    if not ENGINE_PY.exists():
        print(f"❌ engine.py bulunamadı: {ENGINE_PY}")
        return

    res = subprocess.run(
        [sys.executable, str(ENGINE_PY), "create-task", p_id, gorev_id, baslik],
        capture_output=True, text=True, encoding="utf-8"
    )

    if res.returncode == 0:
        print(f"\n✅ Başarılı!\n{res.stdout.strip()}")
    else:
        print(f"\n❌ Hata:\n{res.stderr.strip()}")


if __name__ == "__main__":
    gorev_sec()
