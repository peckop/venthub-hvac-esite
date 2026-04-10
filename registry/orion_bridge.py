"""Orion Bridge v1.0 — manage_registry.py ↔ Orion MCP Köprüsü.

Girdi  : manage_registry.py komutları (normalize, dashboard, list, create-task)
İşlem  : İlgili komutu Orion MCP sunucusunun registry_core modülüne yönlendirir.
Çıktı  : Orion'dan alınan sonucu Terminal'e standart formatta basar.

Neden bu dosya var?
  - manage_registry.py 1100+ satırlık sentinel guard ve lifecycle mantığıyla doludur.
  - Bu mantığı silmek yerine, sadece "veri okuma/yazma" operasyonlarını Orion'a devrederiz.
  - ORION_IS_MASTER.lock dosyası varsa köprü aktif olur; yoksa sessizce eski yolu kullanır.

Mimari:
  manage_registry.py  ──[bridge_call()]──▶  registry_core.py (Orion)
                       (fallback: kendi DB)
"""

import sys
import os
import json
from pathlib import Path

# Windows PowerShell UTF-8 uyumu (emojili çıktılar için)
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass
if sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8', 'utf8'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

# ── KÖPRÜ KONFİGÜRASYONU ──
REGISTRY_DIR = Path(__file__).parent.absolute()
LOCK_FILE = REGISTRY_DIR / "ORION_IS_MASTER.lock"

# Orion engine'e path ekle
ORION_ENGINE_DIR = Path(r"C:\Users\alize\orion-registry\engine")

def _is_orion_active() -> bool:
    """ORION_IS_MASTER.lock dosyası varsa Orion köprüsü aktiftir."""
    return LOCK_FILE.exists()

def _get_orion_core():
    """Orion registry_core modülünü dinamik olarak yükler."""
    if not ORION_ENGINE_DIR.exists():
        raise ImportError(f"Orion engine dizini bulunamadı: {ORION_ENGINE_DIR}")

    if str(ORION_ENGINE_DIR) not in sys.path:
        sys.path.insert(0, str(ORION_ENGINE_DIR))

    import importlib
    # Önceki import cache'ini atla (hot-reload güvenliği)
    if "registry_core" in sys.modules:
        return sys.modules["registry_core"]
    return importlib.import_module("registry_core")


def bridge_dashboard() -> str:
    """or_dashboard() → Orion'dan cross-project PULSE verisi çeker.

    Girdi  : Yok
    İşlem  : Orion registry_core.dashboard() çağrısı yapar.
    Çıktı  : Formatlanmış PULSE metni.
    """
    if not _is_orion_active():
        return None  # Fallback: manage_registry kendi DB'sini kullanır

    try:
        core = _get_orion_core()
        pulses = core.dashboard()
        if not pulses:
            return "⚠️ Orion: Gösterilecek PULSE verisi bulunamadı."

        lines = ["🛰️ ORION REGISTRY — CROSS-PROJECT PULSE"]
        lines.append("─" * 55)
        for p in pulses:
            health = p.get("health_score", 0)
            health_icon = "🟢" if health >= 80 else "🟡" if health >= 50 else "🔴"
            lines.append(
                f"{health_icon} [{p.get('project_id', '?')}]  "
                f"Aktif: {p.get('active_count', 0)}  "
                f"Backlog: {p.get('backlog_count', 0)}  "
                f"Tamam: {p.get('completed_count', 0)}  "
                f"Sağlık: %{health:.1f}"
            )
        lines.append("─" * 55)
        return "\n".join(lines)

    except Exception as e:
        return f"🚨 Orion Bridge Hatası (dashboard): {e}"


def bridge_list_tasks(status: str = None, project_id: str = None) -> str:
    """or_list_tasks() → Orion'dan görev listesi çeker.

    Girdi  : status (opsiyonel filtre), project_id (opsiyonel)
    İşlem  : Orion registry_core.list_tasks() çağrısı yapar.
    Çıktı  : Formatlanmış görev listesi.
    """
    if not _is_orion_active():
        return None  # Fallback

    try:
        core = _get_orion_core()
        tasks = core.list_tasks(status=status, project_id=project_id)
        if not tasks:
            return f"⚠️ Orion: {'Görev bulunamadı.' if not status else f'{status} durumunda görev yok.'}"

        active_proj = core.get_active_project() or "?"
        lines = [f"📋 ORION GÖREV LİSTESİ  [Proje: {active_proj}]"]
        lines.append("─" * 55)

        state_map = {
            "active": "🏗️ AKTİF", "executing": "🏗️ AKTİF",
            "backlog": "⏳ BEKLEYEN", "planning": "📝 PLANLANMIŞ",
            "completed": "✅ TAMAM",
        }
        for t in tasks:
            t_status = t.get("status", "unknown").lower()
            icon = state_map.get(t_status, "❓")
            progress = t.get("progress", 0)
            lines.append(
                f"  {icon}  [{t.get('id', '?')}]  {t.get('title', 'Başlıksız')}  "
                f"(İlerleme: {progress}%)"
            )
        lines.append("─" * 55)
        return "\n".join(lines)

    except Exception as e:
        return f"🚨 Orion Bridge Hatası (list_tasks): {e}"


def bridge_create_task(title: str, priority: str = "MEDIUM", project_id: str = None) -> str:
    """or_create_task() → Orion'da yeni görev oluşturur.

    Girdi  : title, priority (MEDIUM/HIGH/LOW/CRITICAL), project_id
    İşlem  : Orion registry_core.create_task() çağrısı yapar.
    Çıktı  : Oluşturulan görev ID'si.
    """
    if not _is_orion_active():
        return None  # Fallback

    try:
        core = _get_orion_core()
        task_id = core.create_task(title, priority=priority, project_id=project_id)
        return f"✅ Orion: Görev oluşturuldu  [ID: {task_id}]  Başlık: {title}"

    except Exception as e:
        return f"🚨 Orion Bridge Hatası (create_task): {e}"


def bridge_update_task(task_id: str, status: str = None, progress: int = None, project_id: str = None) -> str:
    """or_update_task() → Orion'da görev durumunu günceller.

    Girdi  : task_id, status (opsiyonel), progress (opsiyonel), project_id
    İşlem  : Orion registry_core.update_task() çağrısı yapar.
    Çıktı  : Güncelleme sonucu.
    """
    if not _is_orion_active():
        return None  # Fallback

    try:
        core = _get_orion_core()
        result = core.update_task(task_id, status=status, progress=progress, project_id=project_id)
        return f"✅ Orion: {result}"

    except Exception as e:
        return f"🚨 Orion Bridge Hatası (update_task): {e}"


def bridge_normalize() -> str:
    """Orion normalize — DB ile MD dosyalarını senkronize eder.

    Girdi  : Yok
    İşlem  : Orion registry_core.refresh_pulse() çağrısı yaparak tüm projelerin
             pulse verilerini yeniler. Gerçek MD-sync manage_registry'nin kendi
             sync_from_filesystem() mekanizmasıyla yapılmaya devam eder.
    Çıktı  : Normalize sonucu.

    NOT: or_normalize() MCP tool henüz placeholder. Bu fonksiyon aktif projenin
         pulse verisini manuel olarak yeniler.
    """
    if not _is_orion_active():
        return None  # Fallback

    try:
        core = _get_orion_core()
        projects_data = core.load_projects()
        projects = projects_data.get("projects", {})

        if not projects:
            return "⚠️ Orion: Kayıtlı proje bulunamadı. Önce or_register_project çalıştırın."

        refreshed = []
        for proj_id in projects:
            try:
                core.refresh_pulse(proj_id)
                refreshed.append(proj_id)
            except Exception as e:
                pass  # Sessizce geç — manage_registry kendi normalize'ını çalıştıracak

        if refreshed:
            return f"✅ Orion: {len(refreshed)} projenin pulse verisi yenilendi ({', '.join(refreshed)})"
        return "⚠️ Orion: Hiçbir proje pulse'u yenilenemedi."

    except Exception as e:
        return f"🚨 Orion Bridge Hatası (normalize): {e}"


def bridge_set_project(project_name: str) -> str:
    """Orion'da aktif projeyi değiştirir.

    Girdi  : project_name
    İşlem  : Orion registry_core.set_active_project() çağrısı yapar.
    Çıktı  : Sonuç mesajı.
    """
    if not _is_orion_active():
        return None  # Fallback

    try:
        core = _get_orion_core()
        core.set_active_project(project_name)
        return f"✅ Orion: Aktif proje → '{project_name}'"
    except ValueError as e:
        return f"🚨 Orion: {e}. Kayıtlı projeler için or_list_tasks kullanın."
    except Exception as e:
        return f"🚨 Orion Bridge Hatası (set_project): {e}"


# ── DURUM KONTROLÜ ──
def orion_status() -> dict:
    """Orion köprüsünün mevcut durumunu döner."""
    active = _is_orion_active()
    engine_ok = ORION_ENGINE_DIR.exists()
    db_path = ORION_ENGINE_DIR.parent / "data" / "registry.db"

    return {
        "orion_active": active,
        "lock_file": str(LOCK_FILE),
        "engine_dir_exists": engine_ok,
        "db_exists": db_path.exists(),
        "db_path": str(db_path),
    }


if __name__ == "__main__":
    # Entegrasyon testi: python registry/orion_bridge.py
    print("=== Orion Bridge Entegrasyon Testi ===")
    status = orion_status()
    print(f"Orion Aktif   : {status['orion_active']}")
    print(f"Lock Dosyası  : {status['lock_file']}")
    print(f"Engine Dir    : {status['engine_dir_exists']}")
    print(f"DB Mevcut     : {status['db_exists']}")
    print()

    if status["orion_active"] and status["engine_dir_exists"]:
        print("--- Dashboard Testi ---")
        print(bridge_dashboard())
        print()
        print("--- Görev Listesi Testi ---")
        print(bridge_list_tasks())
    else:
        print("⚠️ Orion köprüsü aktif değil veya engine bulunamadı.")
        print("   Kontrol: ORION_IS_MASTER.lock ve C:\\Users\\alize\\orion-registry\\engine\\ varlığı")
