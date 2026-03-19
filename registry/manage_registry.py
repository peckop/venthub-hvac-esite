import os
import sys
import argparse
import re
import datetime
import shutil
import json
from typing import List, Dict, Any, Optional

# Konfigürasyon
REGISTRY_DIR: str = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT: str = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
INDEX_FILE: str = os.path.join(REGISTRY_DIR, "index.json")
CHANGELOG_FILE: str = os.path.join(PROJECT_ROOT, "docs", "CHANGELOG.md")

# In-memory Cache (Watchdog Simulation)
_INDEX_CACHE: Optional[Dict[str, Any]] = None

def get_now() -> str:
    return str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

def parse_metadata(content: str) -> Dict[str, str]:
    """Strictly typed YAML metadata parser."""
    meta: Dict[str, str] = {}
    match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL | re.MULTILINE)
    if not match: return meta
    for line in match.group(1).split('\n'):
        if ':' in line:
            parts = line.split(':', 1)
            key = parts[0].strip()
            val = parts[1].strip().strip('"').strip("'")
            meta[key] = val
    return meta

def load_index(force_refresh: bool = False) -> Dict[str, Any]:
    """Loads index from JSON with in-memory caching."""
    global _INDEX_CACHE
    if _INDEX_CACHE is None or force_refresh:
        if not os.path.exists(INDEX_FILE) or force_refresh:
            reindex()
        with open(INDEX_FILE, 'r', encoding='utf-8') as f:
            _INDEX_CACHE = json.load(f)
    return _INDEX_CACHE or {"tasks": {}}

def reindex() -> None:
    """Rebuilds the entire index from filesystem (I/O Heavy - Run only on repair/init)."""
    print("🔄 Veritabanı (Index) yeniden inşa ediliyor...")
    tasks: Dict[str, Any] = {}
    projects = [d for d in os.listdir(REGISTRY_DIR) if d.startswith("P") and os.path.isdir(os.path.join(REGISTRY_DIR, d))]
    
    for p in projects:
        for s in ["backlog", "active", "completed"]:
            path = os.path.join(REGISTRY_DIR, p, s)
            if os.path.exists(path):
                for f in os.listdir(path):
                    d_path = os.path.join(path, f)
                    if os.path.isdir(d_path):
                        md = os.path.join(d_path, f"{f}.md")
                        if os.path.exists(md):
                            with open(md, 'r', encoding='utf-8') as fle:
                                raw = fle.read()
                                meta = parse_metadata(raw)
                                tid = f.split("-")[0]
                                tasks[tid] = {
                                    "id": tid,
                                    "title": meta.get("title", f),
                                    "project": p,
                                    "state": s,
                                    "status": meta.get("status", "TODO"),
                                    "priority": meta.get("priority", "MED"),
                                    "progress": meta.get("progress", "0%"),
                                    "depends_on": meta.get("depends_on", "[]"),
                                    "path": os.path.relpath(md, PROJECT_ROOT),
                                    "updated_at": meta.get("updated_at", get_now())
                                }
    
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump({"generated_at": get_now(), "tasks": tasks}, f, indent=2, ensure_ascii=False)
    print(f"✅ {len(tasks)} görev indekse işlendi.")

def sync_pulse() -> None:
    """Regenerates PULSE.md using ONLY index.json (High Performance)."""
    data = load_index()
    tasks = data.get("tasks", {})
    
    projects_stats: Dict[str, Dict[str, int]] = {}
    total_comp = 0
    total_all = len(tasks)
    
    for tid, t in tasks.items():
        proj = t["project"]
        state = t["state"]
        if proj not in projects_stats:
            projects_stats[proj] = {"active": 0, "backlog": 0, "completed": 0}
        projects_stats[proj][state] += 1
        if state == "completed":
            total_comp += 1
            
    pct = int((total_comp / total_all * 100)) if total_all > 0 else 0
    content = f"# 🛰️ PULSE | %{pct}\n> Updated: {get_now()} (Index-driven)\n\n"
    
    for p in sorted(projects_stats.keys()):
        st = projects_stats[p]
        content += f"### {p}\n- A: {st['active']} | B: {st['backlog']} | D: {st['completed']}\n"
    
    with open(os.path.join(REGISTRY_DIR, "PULSE.md"), 'w', encoding='utf-8') as f:
        f.write(content)

def search_tasks(query: str) -> None:
    """Search engine using in-memory index."""
    data = load_index()
    query = query.lower()
    results = [t for tid, t in data["tasks"].items() if query in tid.lower() or query in t["title"].lower()]
    
    if not results:
        print(f"❌ '{query}' bulunamadı.")
        return
        
    print(f"🔍 '{query}' için {len(results)} sonuç (Index):")
    for r in results:
        icon = "✅" if r["state"] == "completed" else "⚡" if r["state"] == "active" else "📝"
        print(f"{icon} [{r['id']}] {r['title']} ({r['project']})")

def generate_graph() -> None:
    """Generates Mermaid.js graph using ONLY index.json (High Performance)."""
    print("🕸️ Bağımlılık Haritası Üretiliyor (Index-driven)...")
    data = load_index()
    tasks = data.get("tasks", {})
    
    mermaid = ["graph TD"]
    styles = []
    
    for tid, t in tasks.items():
        # Node definition
        mermaid.append(f"    T{tid}[{tid}: {t['title']}]")
        
        # Dependencies
        deps_raw = t["depends_on"]
        deps = str(deps_raw).strip("[]").replace("'", "").replace('"', "").split(",")
        for d in deps:
            d = d.strip()
            if d and d in tasks:
                mermaid.append(f"    T{d} --> T{tid}")
        
        # Styling
        if t["state"] == "completed":
            styles.append(f"    style T{tid} fill:#d4edda,stroke:#155724")
        elif t["state"] == "active":
            styles.append(f"    style T{tid} fill:#fff3cd,stroke:#856404")
            
    output = "\n".join(mermaid + styles)
    with open(os.path.join(REGISTRY_DIR, "DEPENDENCIES.md"), 'w', encoding='utf-8') as f:
        f.write(f"# 🕸️ Bağımlılık Haritası\n\n```mermaid\n{output}\n```\n")

def move_task(sp: str, tid: str, tp: str, ts: str) -> None:
    """Moves a task and triggers Atomic Index Update."""
    clean_tid = str(tid).zfill(3)
    data = load_index()
    task_info = data["tasks"].get(clean_tid)
    
    if not task_info:
        print(f"❌ Görev {tid} bulunamadı.")
        return

    # Physical move
    src_folder = os.path.dirname(os.path.join(PROJECT_ROOT, task_info["path"]))
    folder_name = os.path.basename(src_folder)
    dst_dir = os.path.join(REGISTRY_DIR, tp, ts, folder_name)
    
    os.makedirs(os.path.dirname(dst_dir), exist_ok=True)
    shutil.move(src_folder, dst_dir)
    
    # Atomic Sync: Rebuild index after physical move
    print(f"⚡ Atomic Sync: {tid} güncelleniyor...")
    reindex()
    sync_pulse()
    generate_graph()
    print(f"✅ Görev {tid} başarıyla {ts} statüsüne taşındı.")

def repair_all() -> None:
    """Full system repair: Disk Scan + Index Rebuild + Report Sync."""
    print("🛠️ Sistem Geniş Kapsamlı Onarılıyor...")
    # Ensure state folders exist for each project
    for p in [d for d in os.listdir(REGISTRY_DIR) if d.startswith("P") and os.path.isdir(os.path.join(REGISTRY_DIR, d))]:
        for s in ["active", "backlog", "completed"]:
            os.makedirs(os.path.join(REGISTRY_DIR, p, s), exist_ok=True)
    
    reindex() # Disk scan
    sync_pulse() # Index-driven
    generate_graph() # Index-driven
    print("✨ Tüm sistem senkronize edildi.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub Registry Engine 2.0")
    parser.add_argument("action", choices=["repair", "activate", "move", "search", "graph", "reindex"])
    parser.add_argument("id", nargs="?"); parser.add_argument("task", nargs="?")
    parser.add_argument("target_id", nargs="?"); parser.add_argument("target_state", nargs="?")
    
    args = parser.parse_args()
    if args.action == "repair": repair_all()
    elif args.action == "reindex": reindex()
    elif args.action == "graph": generate_graph()
    elif args.action == "search": search_tasks(args.id or "")
    elif args.action == "move": move_task(args.id or "", args.task or "", args.target_id or "", args.target_state or "")
    elif args.action == "activate": move_task(args.id or "", args.task or "", args.id or "", "active")
