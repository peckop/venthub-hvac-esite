#!/usr/bin/env python3
"""
setup_autodream.py — Windows Task Scheduler Kurulum Scripti

Tek seferlik çalıştır. 'VentHub-autoDream' görevini zamanlayıcıya kaydeder.

Kullanım:
  python scripts/setup_autodream.py              # Kur (07:00'de çalışır)
  python scripts/setup_autodream.py --saat 08:30 # Farklı saat
  python scripts/setup_autodream.py --kaldir     # Görevi sil
  python scripts/setup_autodream.py --durum      # Mevcut durumu göster
"""

import argparse
import subprocess
import sys
from pathlib import Path

GOREV_ADI   = "VentHub-autoDream"
PYTHON_EXE  = sys.executable                  # Bu scripti çalıştıran Python
REPO_ROOT   = Path(__file__).parent.parent    # venthub-hvac/
DREAM_SCRIPT = REPO_ROOT / "scripts" / "auto_dream.py"


def _schtask_calistir(args: list[str]) -> tuple[bool, str]:
    """schtasks komutunu çalıştırır. (başarı, çıktı) döner."""
    result = subprocess.run(
        ["schtasks"] + args,
        capture_output=True, text=True, encoding="utf-8", shell=False
    )
    cikti = ((result.stdout or "") + (result.stderr or "")).strip()
    return result.returncode == 0, cikti


def kur(saat: str = "07:00") -> None:
    """Task Scheduler'a günlük görevi kaydeder."""
    # 1. Eski varsa sil (idempotent kurulum)
    _schtask_calistir(["/Delete", "/TN", GOREV_ADI, "/F"])

    # 2. Komutu oluştur
    # "kaçırıldıysa hemen çalıştır" için /RL HIGHEST değil, /RU mevcut kullanıcı
    # schtasks /Create argümanları:
    #   /SC DAILY    → her gün
    #   /ST 07:00    → saat
    #   /RL HIGHEST  → yüksek öncelik
    #   /F           → varsa üzerine yaz
    cmd_str = f'"{PYTHON_EXE}" "{DREAM_SCRIPT}"'

    basari, cikti = _schtask_calistir([
        "/Create",
        "/TN", GOREV_ADI,
        "/TR", cmd_str,
        "/SC", "DAILY",
        "/ST", saat,
        "/F",                # Varsa üzerine yaz
    ])

    if basari:
        print(f"✅ '{GOREV_ADI}' görevi başarıyla kaydedildi!")
        print(f"   Çalışma saati : Her gün {saat}")
        print(f"   Script        : {DREAM_SCRIPT}")
        print(f"   Python        : {PYTHON_EXE}")
        print()
        print("💡 Bilgisayar o saatte kapalıysa brifing oluşmaz.")
        print("   Açık kalmasını sağla veya uyandıktan sonra manüel çalıştır:")
        print(f"   python scripts/auto_dream.py")

        # 3. Tetikleyiciyi "kaçırıldıysa en kısa zamanda çalıştır" olarak ayarla
        _kacirilmis_ayarla()
    else:
        print(f"❌ Kayıt başarısız:\n{cikti}")
        print()
        print("💡 Yönetici olarak çalıştırmayı dene:")
        print("   (Powershell'i Yönetici olarak aç)")
        print("   python scripts/setup_autodream.py")


def _kacirilmis_ayarla() -> None:
    """
    PowerShell ile 'RunMissed' özelliğini etkinleştirir.
    schtasks CLI bu özelliği desteklemez, COM objesi gerektirir.
    """
    ps_kodu = f"""
$task = Get-ScheduledTask -TaskName '{GOREV_ADI}' -ErrorAction SilentlyContinue
if ($task) {{
    $settings = $task.Settings
    $settings.StartWhenAvailable = $true
    $settings.ExecutionTimeLimit = 'PT10M'
    Set-ScheduledTask -TaskName '{GOREV_ADI}' -Settings $settings | Out-Null
    Write-Host "✅ RunMissed aktif: Bilgisayar kapalıysa açılınca çalışır."
}} else {{
    Write-Host "⚠️ Görev bulunamadı, RunMissed ayarlanamadı."
}}
"""
    result = subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps_kodu],
        capture_output=True, text=True, encoding="utf-8", errors="replace"
    )
    out = (result.stdout or "").strip() or (result.stderr or "").strip()
    if out:
        print(out)


def kaldir() -> None:
    """Görevi zamanlayıcıdan siler."""
    basari, cikti = _schtask_calistir(["/Delete", "/TN", GOREV_ADI, "/F"])
    if basari:
        print(f"✅ '{GOREV_ADI}' görevi silindi.")
    else:
        print(f"⚠️  Görev bulunamadı veya silinemedi:\n{cikti}")


def durum() -> None:
    """Görevin mevcut durumunu gösterir."""
    basari, cikti = _schtask_calistir(["/Query", "/TN", GOREV_ADI, "/FO", "LIST"])
    if basari:
        print(cikti)
    else:
        print(f"❌ '{GOREV_ADI}' görevi bulunamadı. Kurmak için:")
        print("   python scripts/setup_autodream.py")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub autoDream — Task Scheduler Kurulumu")
    parser.add_argument("--saat",   default="07:00", help="Çalışma saati (HH:MM, varsayılan: 07:00)")
    parser.add_argument("--kaldir", action="store_true", help="Görevi zamanlayıcıdan kaldır")
    parser.add_argument("--durum",  action="store_true", help="Görevin durumunu göster")
    args = parser.parse_args()

    if args.kaldir:
        kaldir()
    elif args.durum:
        durum()
    else:
        kur(saat=args.saat)
