"""
gate_check.py — Registry Normalize Kapı Kontrolü
=================================================
Gate-First Scheduler pattern (Claude Code sızıntısından ilham alındı).

Mantık: "Kapıyı kontrol et, gerekmedikçe içeri girme."
   1. .last_normalize_check dosyasına bak → son kontrolden bu yana N dakika geçmiş mi?
   2. PXX klasörlerinden herhangi biri değişmiş mi? (mtime karşılaştırma)
   3. İkisi de olumsuzsa → normalize YAPMA, çık.

Çıkış kodu:
   0 → Normalize yapılmalı   (değişiklik var veya ilk çalışma)
   1 → Normalize atlanabilir (değişiklik yok, çok kısa süre geçmiş)

Kullanım (GEMINI.md Pre-flight içinde):
   python registry/gate_check.py && python registry/manage_registry.py normalize
"""

import sys
import os
import datetime
import subprocess
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent.absolute()
GATE_FILE = REGISTRY_DIR / ".last_normalize_check"

# Eşikler (Zaman Kapısı)
MIN_MINUTES_BETWEEN_FULL_SCAN = 30        # 30 dakika geçmemişse zaman kapısı kapalı
MIN_MINUTES_FORCE_NORMALIZE   = 60 * 4   # 4 saatten uzun süre geçmişse her zaman normalize et

# Eşikler (Bütçe Kapısı - Otonom Ajan Sınırları)
MAX_AGENT_TOKENS = 500000                 # Ototnom ajanların harcayabileceği max token
MAX_FILE_EDITS = 15                       # Otonom ajanlar için tek oturuşta max dosya değişim sınırı


def run_garbage_collection():
    """Tüm projelerdeki otonom session çöplerini temizler (clean_expired)."""
    repo_root = REGISTRY_DIR.parent
    session_manager = repo_root / ".agent" / "skills" / "superpowers-workflow" / "scripts" / "session_manager.py"
    if session_manager.exists():
        try:
            # Arka planda sessizce çalıştır
            subprocess.run([sys.executable, str(session_manager), "--clean-all"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

def gate_check() -> int:
    """
    Dönüş: 0 = normalize gerekli, 1 = atlanabilir
    """
    now = datetime.datetime.now()
    
    # ── Kapı 1: Zaman Kapısı ──────────────────────────────────────────────
    # .last_normalize_check dosyası yoksa ilk çalışma → normalize et
    if not GATE_FILE.exists():
        _stamp(now)
        run_garbage_collection()
        return 0  # normalize yap
    
    last_check_time = datetime.datetime.fromtimestamp(GATE_FILE.stat().st_mtime)
    elapsed_minutes = (now - last_check_time).total_seconds() / 60
    
    # 30 dakika geçmemişse hiç bakmadan çık
    if elapsed_minutes < MIN_MINUTES_BETWEEN_FULL_SCAN:
        print(f"[gate_check] ⏭️  Atlandı — son normalizeden {elapsed_minutes:.0f} dk geçti (<{MIN_MINUTES_BETWEEN_FULL_SCAN}dk)")
        return 1  # atla
    
    # 4 saatten uzun geçmişse, değişiklik bak olmadan normalize et
    if elapsed_minutes > MIN_MINUTES_FORCE_NORMALIZE:
        print(f"[gate_check] 🔄 Zorunlu — {elapsed_minutes:.0f} dk geçti, tam normalize başlıyor")
        _stamp(now)
        run_garbage_collection()
        return 0  # normalize yap

    # ── Kapı 2: Değişiklik Kapısı ────────────────────────────────────────
    # PXX klasörlerinden herhangi biri son kontrol zamanından sonra değişmiş mi?
    last_check_ts = GATE_FILE.stat().st_mtime
    changed = _any_pxx_changed_since(last_check_ts)
    
    if changed:
        print(f"[gate_check] 🔄 Değişiklik algılandı — normalize başlıyor")
        _stamp(now)
        return 0  # normalize yap
    else:
        print(f"[gate_check] ✅ Değişiklik yok — normalize atlandı")
        _stamp(now)  # Zaman damgasını güncelle (bir sonraki pencere için)
        return 1  # atla


def _any_pxx_changed_since(since_ts: float) -> bool:
    """
    REGISTRY_DIR altındaki PXX klasörlerinin herhangi bir dosyası
    since_ts'den sonra değişmiş mi?
    """
    for item in REGISTRY_DIR.iterdir():
        # Sadece PXX formatındaki proje klasörlerine bak (P00, P01, P02 ...)
        # P00, P01, P00-Standalone, P01-Visual-Page-Builder gibi formatları yakala
        if not (item.is_dir() and len(item.name) >= 3 and item.name[0] == 'P' and item.name[1:3].isdigit()):
            continue
        # Klasörün kendisi ve içindeki dosyalar
        for f in item.rglob("*"):
            if f.is_file() and f.stat().st_mtime > since_ts:
                return True
    return False


def _stamp(dt: datetime.datetime):
    """Zaman damgasını gate dosyasına yaz."""
    GATE_FILE.touch()
    os.utime(GATE_FILE, (dt.timestamp(), dt.timestamp()))


if __name__ == "__main__":
    sys.exit(gate_check())
