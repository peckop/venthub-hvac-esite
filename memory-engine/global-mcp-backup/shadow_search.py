import os
import re
import json
import sqlite3
import argparse
from pathlib import Path
from datetime import datetime, timedelta

# Antigravity Brain Path
BRAIN_DIR = Path(os.getenv("ANTIGRAVITY_BRAIN_DIR", r"C:\Users\alize\.gemini\antigravity\brain"))
REGISTRY_PATH = Path(r"C:\Users\alize\.gemini\antigravity\memory-engine\data\registry.json")

# Federation'a erişim (cleanup ve promote için SQLite DB path tespiti)
import sys
sys.path.append(os.path.dirname(__file__))
try:
    from federation import MemoryFederation
except ImportError:
    MemoryFederation = None

def init_session_meta(session_id, workspace_path):
    """Her session'ın hangi projeye ait olduğunu etiketler."""
    if not session_id:
        print("[SHADOW] Error: --session-id gerekli.")
        return
        
    session_dir = BRAIN_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    
    meta_path = session_dir / ".session_meta.json"
    
    project_name = "unknown"
    if MemoryFederation:
        fed = MemoryFederation(REGISTRY_PATH)
        project_name = fed.detect_project_by_path(workspace_path) or "unknown"
        
    meta_data = {
        "project": project_name,
        "workspace": str(workspace_path),
        "created": datetime.utcnow().isoformat()
    }
    
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta_data, f, indent=2)
        
    print(f"[SHADOW] Meta yazıldı: {meta_path} -> Proje: {project_name}")

def search_in_session(session_id, query):
    """Tek bir session'ın overview.txt dosyasında grep benzeri arama yapar."""
    overview_path = BRAIN_DIR / session_id / ".system_generated" / "logs" / "overview.txt"
    if not overview_path.exists():
        print(f"[SHADOW] overview.txt bulunamadı: {session_id}")
        return []
        
    results = []
    try:
        with open(overview_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
            
        compiled_query = re.compile(query, re.IGNORECASE)
        for i, line in enumerate(lines):
            if compiled_query.search(line):
                start = max(0, i - 2)
                end = min(len(lines), i + 3)
                
                context = []
                for j in range(start, end):
                    prefix = ">> " if j == i else "   "
                    context.append(f"{prefix} L{j+1}: {lines[j].rstrip()}")
                    
                results.append({
                    "session_id": session_id,
                    "line": i + 1,
                    "context": "\n".join(context)
                })
    except Exception as e:
        print(f"[SHADOW] Okuma hatası ({session_id}): {e}")
        
    return results

def get_project_db_path(project_name):
    if not MemoryFederation:
        return None
    fed = MemoryFederation(REGISTRY_PATH)
    proj_data = fed.registry.get("projects", {}).get(project_name)
    if proj_data:
        return proj_data.get("db_path")
    return None

def cleanup_shadows(project_name, older_than_days):
    """7 günden eski session_shadow düğümlerini arşivler."""
    db_path = get_project_db_path(project_name)
    if not db_path or not os.path.exists(db_path):
        print(f"[SHADOW] {project_name} DB bulunamadı.")
        return
        
    cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)
    
    conn = sqlite3.connect(db_path, isolation_level=None)
    try:
        cursor = conn.execute(
            "UPDATE memory_nodes SET status = 'archived', is_valid = 0 "
            "WHERE domain = 'session_shadow' AND status = 'active' AND created_at < ?",
            (cutoff_date.strftime("%Y-%m-%d %H:%M:%S"),)
        )
        updated = cursor.rowcount
        print(f"[SHADOW] Cleanup tamam. {updated} node arşivlendi ({project_name}).")
    except Exception as e:
        print(f"[SHADOW] Cleanup hata: {e}")
    finally:
        conn.close()

def promote_shadow(project_name, node_id):
    """Bir node'u session_shadow -> planning statüsüne dönüştürür."""
    db_path = get_project_db_path(project_name)
    if not db_path or not os.path.exists(db_path):
        print(f"[SHADOW] {project_name} DB bulunamadı.")
        return
        
    conn = sqlite3.connect(db_path, isolation_level=None)
    try:
        cursor = conn.execute(
            "UPDATE memory_nodes SET domain = 'planning' "
            "WHERE id = ? AND domain = 'session_shadow'",
            (node_id,)
        )
        if cursor.rowcount > 0:
            print(f"[SHADOW] Node {node_id} kalıcı planning domain'ine promote edildi.")
        else:
            print(f"[SHADOW] Node {node_id} bulunamadı veya session_shadow değil.")
    except Exception as e:
        print(f"[SHADOW] Promote hata: {e}")
    finally:
        conn.close()

def main():
    parser = argparse.ArgumentParser(description="Session Shadow Memory CLI - Katman 1")
    parser.add_argument("--query", help="Aranacak metin")
    parser.add_argument("--session-id", help="Belirli bir session ID")
    parser.add_argument("--project", help="Spesifik bir projeye ait tüm sessionları tarar veya cleanup/promote için project context")
    parser.add_argument("--init", action="store_true", help="Session meta dosyasını oluşturur")
    parser.add_argument("--workspace", help="Init komutu için workspace yolu")
    parser.add_argument("--cleanup", action="store_true", help="Eski session_shadow kayıtlarını siler")
    parser.add_argument("--older-than", type=int, default=7, help="Kaç günden eski kayıtlar (örn: 7)")
    parser.add_argument("--promote", type=int, help="Bu ID'li bir session_shadow nodunu planning yapar")
    
    args = parser.parse_args()
    
    # 1. Cleanup
    if args.cleanup:
        if not args.project:
            print("[SHADOW] --cleanup işlemi için --project belirtmelisiniz.")
            return
        cleanup_shadows(args.project, args.older_than)
        return
        
    # 2. Promote
    if args.promote is not None:
        if not args.project:
            print("[SHADOW] --promote işlemi için --project belirtmelisiniz.")
            return
        promote_shadow(args.project, args.promote)
        return
        
    # 3. Init
    if args.init:
        init_session_meta(args.session_id, args.workspace)
        return
        
    # 4. Search
    if args.query:
        sessions_to_search = []
        if args.session_id:
            sessions_to_search.append(args.session_id)
        elif args.project:
            # Proje bazlı glob
            for d in BRAIN_DIR.iterdir():
                if d.is_dir():
                    meta_file = d / ".session_meta.json"
                    if meta_file.exists():
                        try:
                            with open(meta_file, "r") as f:
                                meta = json.load(f)
                                if meta.get("project") == args.project:
                                    sessions_to_search.append(d.name)
                        except Exception:
                            pass
        else:
            print("[SHADOW] Arama işlemi için --session-id veya --project belirtmelisiniz.")
            return
            
        print(f"[SHADOW] Arama başlatılıyor ('{args.query}') -> {len(sessions_to_search)} session")
        total_found = 0
        for s_id in sessions_to_search:
            res = search_in_session(s_id, args.query)
            for r in res:
                print(f"--- Session: {r['session_id']} ---")
                print(r["context"])
                print()
                total_found += 1
                if total_found >= 10:
                    print("[SHADOW] Maksimum 10 eşleşmeye ulaşıldı.")
                    return
        
        if total_found == 0:
            print("[SHADOW] Sonuç bulunamadı.")
            
if __name__ == "__main__":
    main()
