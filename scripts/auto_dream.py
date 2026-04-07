#!/usr/bin/env python3
"""
auto_dream.py — VentHub Gece Özet Ajanı

Her çalıştığında:
  1. git log (son 24 saat) → ne değişti?
  2. PULSE.md → proje nabzı
  3. toplanti_kayitlari/ → son kararlar
  4. spawn_subagent → LLM ile Sabah Brifing üret
  5. registry/sabah_brifing/YYYY-MM-DD.md yaz

Kullanım:
  python scripts/auto_dream.py            # Tam çalıştırma
  python scripts/auto_dream.py --dry-run  # LLM çağrısı yok, sadece yaptığı veriyi göster
"""

import sys
import os
import argparse
import datetime
import subprocess
from pathlib import Path

# Zamanlayıcı (Headless) UTF-8 Kalkanı
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Yalnızca find_repo_root için spawn_subagent'a ihtiyacımız var
_AGENT_SCRIPTS = Path(__file__).parent.parent / ".agent" / "skills" / "superpowers-workflow" / "scripts"
sys.path.insert(0, str(_AGENT_SCRIPTS))

from spawn_subagent import find_repo_root  # type: ignore

REPO_ROOT    = find_repo_root(Path(__file__).resolve().parent)
os.chdir(REPO_ROOT)  # Çalışma dizinini garantiye al
REGISTRY_DIR = REPO_ROOT / "registry"
BRIFING_DIR  = REGISTRY_DIR / "sabah_brifing"
PULSE_FILE   = REGISTRY_DIR / "PULSE.md"
MAX_BRIFING_DAYS = 30   # Bu kadar günden eski brifing dosyaları silinir
LLM_TIMEOUT_S    = 300  # 5 dakika — tek bir metin üretimi için yeterli


# ─────────────────────────────────────────────
# Doğrudan gemini CLI çağrısı (pipe)
# Spawn_subagent'ın PowerShell katmanı yerine
# direkt subprocess.run ile stdin → stdout pipe
# ─────────────────────────────────────────────


def _bul_gemini() -> str:
    """
    Windows servisleri (schtasks) altında çalışırken PATH eksik olabilir.
    Bu yüzden bilinen global npm yolunu ve %APPDATA% dizinini kontrol ederiz.
    """
    import shutil
    import os

    # 1. PATH'te varsa al
    yol = shutil.which("gemini") or shutil.which("gemini.cmd")
    if yol: return yol

    # 2. %APPDATA% veya bilinen kullanıcı yollarını dene
    kullanici_yolu = Path.home() / "AppData" / "Roaming" / "npm" / "gemini.cmd"
    if kullanici_yolu.exists():
        return str(kullanici_yolu)
    
    # 3. Klasik Windows npm prefix yolu (Yönetici yetkili kurulumlar için)
    program_files_npm = Path("C:/Program Files/nodejs/gemini.cmd")
    if program_files_npm.exists():
        return str(program_files_npm)

    return "gemini"  # Son çare: sadece isim (PATH'e güvenir)


GEMINI_CMD = _bul_gemini()


def _llm_cagir(prompt: str) -> str:
    """
    Girdi (prompt) → gemini CLI → Çıktı (metin).
    Tıpkı boru hattı gibi: su (prompt) giriyor, brifing (metin) çıkıyor.
    """
    try:
        result = subprocess.run(
            [GEMINI_CMD, "--yolo"],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            cwd=str(REPO_ROOT),
            timeout=LLM_TIMEOUT_S,
            shell=False,
        )
        cikti = result.stdout.strip()
        if not cikti and result.stderr:
            return f"HATA: {result.stderr[:300]}"
        return cikti
    except subprocess.TimeoutExpired:
        return f"HATA: gemini CLI {LLM_TIMEOUT_S}s içinde yanıt vermedi."
    except FileNotFoundError:
        return f"HATA: 'gemini' komutu bulunamadı. Aranan: {GEMINI_CMD}"
    except Exception as e:
        return f"HATA: {e}"


# ─────────────────────────────────────────────
# Veri Toplayıcılar
# ─────────────────────────────────────────────

def _git_ozet(saat: int = 24) -> str:
    """Son N saatteki git geçmişini özetler."""
    try:
        result = subprocess.run(
            ["git", "log", f"--since={saat} hours ago",
             "--pretty=format:- %s (%an, %ar)",
             "--name-only", "--diff-filter=AM"],
            capture_output=True, text=True, encoding="utf-8",
            cwd=str(REPO_ROOT), timeout=15
        )
        raw = result.stdout.strip()
        if not raw:
            return "_(Son 24 saatte commit bulunamadı)_"

        # İlk 40 satırla sınırla (token tasarrufu)
        satirlar = raw.splitlines()[:40]
        return "\n".join(satirlar)
    except Exception as e:
        return f"_(git log alınamadı: {e})_"


def _degisen_dosyalar(saat: int = 24) -> str:
    """Son N saatte değişen dosyaların listesi."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", f"HEAD@{{{saat} hours ago}}", "HEAD"],
            capture_output=True, text=True, encoding="utf-8",
            cwd=str(REPO_ROOT), timeout=15
        )
        dosyalar = [d for d in result.stdout.strip().splitlines() if d]
        if not dosyalar:
            return "_(Değişen dosya yok)_"
        return "\n".join(f"- `{d}`" for d in dosyalar[:20])
    except Exception:
        return "_(Değişen dosya listesi alınamadı)_"


def _pulse_ozet() -> str:
    """PULSE.md içeriğini token-verimli kısar."""
    if not PULSE_FILE.exists():
        return "_(PULSE.md bulunamadı)_"
    icerik = PULSE_FILE.read_text(encoding="utf-8")
    # Sadece aktif görevler bölümünü çek, ilk 50 satır
    satirlar = icerik.splitlines()[:50]
    return "\n".join(satirlar)


def _son_kararlar(n: int = 3) -> str:
    """Tüm PXX klasörlerindeki toplanti_kayitlari/ içinden en son N .md dosyasını okur."""
    tum_dosyalar = []
    for pxx in REGISTRY_DIR.iterdir():
        if not (pxx.is_dir() and len(pxx.name) >= 3 and pxx.name[0] == 'P' and pxx.name[1:3].isdigit()):
            continue
        toplanti_dir = pxx / "toplanti_kayitlari"
        if toplanti_dir.exists():
            tum_dosyalar.extend(toplanti_dir.glob("*.md"))

    if not tum_dosyalar:
        return "_(Henüz arşivlenmiş toplantı kararı yok)_"

    # En yeniden başla
    tum_dosyalar.sort(key=lambda f: f.stat().st_mtime, reverse=True)
    parcalar = []
    for dosya in tum_dosyalar[:n]:
        icerik = dosya.read_text(encoding="utf-8")
        ozet   = "\n".join(icerik.splitlines()[:15])   # Her dosyadan 15 satır
        parcalar.append(f"### {dosya.parent.parent.name} / {dosya.name}\n{ozet}")

    return "\n\n".join(parcalar)


# ─────────────────────────────────────────────
# Rotasyon: 30 günden eski brifingleri sil
# ─────────────────────────────────────────────

def _temizle_eski_brifing() -> None:
    if not BRIFING_DIR.exists():
        return
    sinir = datetime.datetime.now() - datetime.timedelta(days=MAX_BRIFING_DAYS)
    for f in BRIFING_DIR.glob("*.md"):
        try:
            if datetime.datetime.fromtimestamp(f.stat().st_mtime) < sinir:
                f.unlink()
                print(f"🗑️  Eski brifing silindi: {f.name}")
        except OSError:
            pass


# ─────────────────────────────────────────────
# Ana Akış
# ─────────────────────────────────────────────

def dream(dry_run: bool = False) -> None:
    bugun     = datetime.datetime.now().strftime("%Y-%m-%d")
    saat_str  = datetime.datetime.now().strftime("%H:%M")

    print(f"\n🌙 autoDream başlıyor — {bugun} {saat_str}")
    print("─" * 50)

    # 1. Veri topla
    print("📊 Veri toplanıyor...")
    git_log      = _git_ozet()
    degisen      = _degisen_dosyalar()
    pulse        = _pulse_ozet()
    son_kararlar = _son_kararlar()

    # 2. Görev prompt'u oluştur
    gorev = f"""Sen VentHub projesinin gece nöbetçi analistisin.
Aşağıdaki verileri inceleyip sabah ekibin okuyacağı kısa ve eyleme dönük bir brifing yaz.

━━━ SON 24 SAAT GIT GEÇMİŞİ ━━━
{git_log}

━━━ DEĞİŞEN DOSYALAR ━━━
{degisen}

━━━ PROJE NABZI (PULSE) ━━━
{pulse}

━━━ SON TOPLANTI KARARLARI ━━━
{son_kararlar}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Görevin: Aşağıdaki 4 bölümden oluşan kısa bir Türkçe Markdown raporu üret:

**Bölüm 1 — Dün Ne Oldu (maks 5 madde)**
Git geçmişine bakarak gerçekten ne yapıldığını özetle. Tahmin yürütme.

**Bölüm 2 — Bugün Önerilen Öncelikler (maks 3 madde)**
PULSE'daki aktif görevleri teknik ve anlaşılır bir dille öne çıkar. Açıklamalar mecaz olmasın, teknik olsun.
Lütfen her maddeyi KESİNLİKLE şu formatta yaz:
* **[1] Görev Başlığı** (Görev ID: 017): Teknik ve net açıklama...
* **[2] Görev Başlığı** (Görev ID: 020): Teknik ve net açıklama...

**Bölüm 3 — Açık Riskler (varsa)**
Yarım kalan işler, son kararlardan çözümsüz kalanlar, dikkat edilmesi gereken teknik borç.

**Bölüm 4 — Hatırlatma**
Bir sonraki adım olarak tek cümlelik net eylem önerisi.

Format: Türkçe Markdown. Kısa. Net. Tekrar yok."""

    if dry_run:
        print("\n" + "═" * 50)
        print("🔍 DRY-RUN: LLM'e gönderilecek veri şu (gerçek çağrı yapılmıyor):")
        print("═" * 50)
        print(f"\n[GIT ÖZET]\n{git_log[:300]}...")
        print(f"\n[PULSE]\n{pulse[:300]}...")
        print(f"\n[SON KARARLAR]\n{son_kararlar[:300]}...")
        print("\n✅ Dry-run tamamlandı. Gerçek çalıştırma için --dry-run olmadan çalıştır.")
        return

    # 3. LLM çağrısı
    print("🤖 Brifing ajanı çağrılıyor (direkt pipe)...")
    cikti = _llm_cagir(gorev)

    if not cikti or cikti.startswith("HATA:"):
        hata_dosya = BRIFING_DIR / f"ERROR_{bugun}.txt"
        BRIFING_DIR.mkdir(parents=True, exist_ok=True)
        hata_dosya.write_text(
            f"autoDream HATASI — {bugun} {saat_str}\n{cikti or 'Boş çıktı'}",
            encoding="utf-8"
        )
        print(f"⚠️  Brifing üretilemedi: {cikti[:120]}")
        print(f"📄 Hata log: {hata_dosya}")
        return

    # 4. Brifing yaz
    brifing_icerik = (
        f"# 🌅 Sabah Brifing — {bugun}\n\n"
        f"**Oluşturulma:** {saat_str}  \n"
        f"**Model:** autoDream v1  \n\n"
        f"---\n\n"
        f"{cikti}"
    )

    BRIFING_DIR.mkdir(parents=True, exist_ok=True)
    brifing_yolu = BRIFING_DIR / f"{bugun}.md"
    brifing_yolu.write_text(brifing_icerik, encoding="utf-8")

    _temizle_eski_brifing()

    print(f"\n{'═' * 50}")
    print(f"✅ Brifing hazır")
    print(f"📄 Dosya: registry/sabah_brifing/{bugun}.md")
    print(f"{'═' * 50}")
    print(f"\n{brifing_icerik[:400]}...")


# ─────────────────────────────────────────────
# Giriş Noktası
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub autoDream — Gece Özet Ajanı")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="LLM çağrısı yapmadan toplanacak veriyi ekranda gösterir"
    )
    args = parser.parse_args()
    dream(dry_run=args.dry_run)
