#!/usr/bin/env python3
"""
session_manager.py — VentHub Session (Oturum) Yöneticisi

Görevleri UUID'ler ile eşleştirir ve `registry/PXX/session_mapped.json` içinde kalıcı saklar.
- Token şişmesi olmaması için "Proje" bazlı değil, "Project + Task Group" bazlı eşleme yapar.
- 5 günü geçen oturumları canlandırmak yerine sıfırdan başlatmayı önerir.
"""

import json
import argparse
import datetime
from datetime import timezone
from pathlib import Path
from typing import Optional
import tempfile
import os

# Aynı dizindeki spawn_subagent modülünden kök bulucuyu çek
from spawn_subagent import find_repo_root

REPO_ROOT = find_repo_root(Path.cwd())
REGISTRY_DIR = REPO_ROOT / "registry"
EXPIRY_DAYS = 5   # get_or_create: bu kaç gün geçince UUID geçersiz sayılır
CLEAN_DAYS  = 7   # clean_expired: bu kaç gün geçince kayıt silinir

def _get_mapped_file(project_id: str) -> Path:
    project_dir = REGISTRY_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    return project_dir / "session_mapped.json"

def _load_mapped(project_id: str) -> dict:
    f = _get_mapped_file(project_id)
    if f.exists():
        try:
            return json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def _save_mapped(project_id: str, data: dict) -> None:
    f = _get_mapped_file(project_id)
    # Atomic yazma: geçici dosyaya yaz → rename (yarım yazma riski elimine edilir)
    payload = json.dumps(data, indent=2, ensure_ascii=False)
    fd, tmp_path = tempfile.mkstemp(dir=f.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(payload)
        os.replace(tmp_path, f)   # atomic replace
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise

def get_or_create(project_id: str, task_group: str) -> Optional[str]:
    """
    Kayıtlı bir oturum varsa ve taze ise UUID'sini döner.
    Yoksa veya süresi dolmuşsa None (sıfırdan başla) döner.
    """
    mapped = _load_mapped(project_id)
    session_data = mapped.get(task_group)

    if not session_data:
        return None

    # Tarihi kontrol et
    last_updated_str = session_data.get("last_updated")
    uuid_str = session_data.get("uuid")

    if not uuid_str or not last_updated_str:
        return None

    try:
        last_updated = datetime.datetime.fromisoformat(last_updated_str)
        # Timezone-aware karşılaştırma (UTC)
        if last_updated.tzinfo is None:
            last_updated = last_updated.replace(tzinfo=timezone.utc)
        now = datetime.datetime.now(timezone.utc)
        elapsed_days = (now - last_updated).days
        
        if elapsed_days > EXPIRY_DAYS:
            print(f"⚠️ [session_manager] Oturum süresi dolmuş ({elapsed_days} gün). Sıfırdan başlanacak.")
            return None
        
        return uuid_str
    except Exception:
        return None

def save(project_id: str, task_group: str, session_uuid: str) -> None:
    """
    Yeni oluşan bir oturum UUID'sini ilgili görev grubuna kaydeder.
    """
    if not session_uuid:
        return
        
    mapped = _load_mapped(project_id)
    mapped[task_group] = {
        "uuid": session_uuid,
        "last_updated": datetime.datetime.now(timezone.utc).isoformat()
    }
    _save_mapped(project_id, mapped)
    print(f"📥 [session_manager] {project_id}/{task_group} -> {session_uuid[:8]} kaydedildi.")

def clean_expired(project_id: str) -> None:
    """7 günden eski oturumları temizler (ileride gemini --delete-session eklenecek)."""
    mapped = _load_mapped(project_id)
    to_delete = []
    now = datetime.datetime.now()
    
    for tg, data in mapped.items():
        last_updated_str = data.get("last_updated")
        if last_updated_str:
            last_updated = datetime.datetime.fromisoformat(last_updated_str)
            if last_updated.tzinfo is None:
                last_updated = last_updated.replace(tzinfo=timezone.utc)
            now = datetime.datetime.now(timezone.utc)
            if (now - last_updated).days > CLEAN_DAYS:
                to_delete.append(tg)
                
    for tg in to_delete:
        del mapped[tg]
        
    if to_delete:
        _save_mapped(project_id, mapped)
        print(f"🧹 [session_manager] {project_id} içindeki süresi dolan {len(to_delete)} oturum silindi.")

def clean_all_projects() -> None:
    """Tüm PXX klasörlerindeki expired oturumları temizler."""
    print("🧹 [session_manager] Tüm projelerdeki süresi dolmuş oturumlar temizleniyor...")
    for item in REGISTRY_DIR.iterdir():
        if item.is_dir() and len(item.name) >= 3 and item.name[0] == 'P' and item.name[1:3].isdigit():
            clean_expired(item.name)

def main():
    parser = argparse.ArgumentParser(description="VentHub Session Manager")
    parser.add_argument("--project-id", help="Örn: P01_Auth")
    parser.add_argument("--task-group", help="Örn: db_schema")
    parser.add_argument("--clean-all", action="store_true", help="Tüm projelerdeki süresi dolmuş oturumları temizler")
    parser.add_argument("--dry-run", action="store_true", help="Sadece test okuması yapar")
    
    args = parser.parse_args()
    
    if args.clean_all:
        clean_all_projects()
        return

    if not args.project_id or not args.task_group:
        parser.error("--project-id ve --task-group, --clean-all kullanılmıyorsa zorunludur.")
        
    uuid = get_or_create(args.project_id, args.task_group)
    if uuid:
        print(f"✅ {args.project_id}/{args.task_group} için aktif oturum bulundu: {uuid}")
    else:
        print(f"🆕 {args.project_id}/{args.task_group} için yeni oturum başlatılacak.")

if __name__ == "__main__":
    main()
