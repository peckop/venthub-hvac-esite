import os
import sys
import argparse
import re
import datetime
import shutil
import json
from typing import List, Tuple, Dict, Any, Optional, Union, cast

# Konfigürasyon
REGISTRY_DIR: str = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT: str = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
SNAPSHOT_DIR: str = os.path.join(REGISTRY_DIR, ".snapshots")
INDEX_FILE: str = os.path.join(REGISTRY_DIR, "index.json")

def get_now() -> str:
    return str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

def safe_truncate(text: str, length: int) -> str:
    """Type-safe string truncation using regex (No slicing)."""
    if not text: return ""
    st: str = str(text).replace('\n', ' ')
    match = re.match(rf'^(.{{0,{length}}})', st)
    if match: return str(match.group(1))
    return str(st)

def parse_metadata(content: Optional[str]) -> Dict[str, str]:
    """Strictly typed YAML metadata parser."""
    meta: Dict[str, str] = {}
    if not content: return meta
    match = re.search(r'^---\s*\n(.*?)\n---', str(content), re.DOTALL | re.MULTILINE)
    if not match: return meta
    for line in str(match.group(1)).split('\n'):
        if ':' in line:
            parts = line.split(':', 1)
            meta[str(parts[0]).strip()] = str(parts[1]).strip().strip('"').strip("'")
    return meta

def safe_calc_percent(comp: int, total: int) -> int:
    """Type-safe percentage calculation."""
    c, t = int(comp), int(total)
    if t <= 0: return 0
    return int((float(c) / float(t)) * 100.0)

def reindex() -> None:
    """Rebuild the search index with strict path safety."""
    tasks: Dict[str, Any] = {}
    projects = [d for d in os.listdir(REGISTRY_DIR) if str(d).startswith("P") and os.path.isdir(os.path.join(REGISTRY_DIR, d))]
    for p in projects:
        for s in ["backlog", "active", "completed"]:
            # Path Guard: Ensure everything is string
            path = os.path.join(REGISTRY_DIR, str(p), str(s))
            if os.path.exists(path):
                for f in os.listdir(path):
                    d_path = os.path.join(path, f)
                    if os.path.isdir(d_path):
                        tf_str = str(f)
                        md = os.path.join(d_path, f"{tf_str}.md")
                        if os.path.exists(md):
                            with open(md, 'r', encoding='utf-8') as fle:
                                raw = fle.read()
                                meta = parse_metadata(raw)
                                tid = tf_str.split("-")[0]
                                tasks[tid] = {"id": tid, "title": str(meta.get("title", f)), "project": str(p), "state": str(s), "progress": str(meta.get("progress", "0%")), "content_summary": safe_truncate(raw, 200)}
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump({"generated_at": get_now(), "tasks": tasks}, f, indent=2, ensure_ascii=False)

def sync_pulse() -> None:
    """Regenerates PULSE.md securely."""
    t_comp: int = 0
    t_all: int = 0
    data: Dict[str, Any] = {}
    for p in os.listdir(REGISTRY_DIR):
        if str(p).startswith("P") and os.path.isdir(os.path.join(REGISTRY_DIR, p)):
            data[p] = {"active": [], "backlog": [], "completed": []}
            for s in ["active", "backlog", "completed"]:
                spath = os.path.join(REGISTRY_DIR, str(p), str(s))
                if os.path.exists(spath):
                    for tf in os.listdir(spath):
                        if os.path.isdir(os.path.join(spath, tf)):
                            tid = str(tf).split("-")[0]
                            cast(Dict[str, List[str]], data[p])[str(s)].append(tid)
                            t_all += 1
                            if str(s) == "completed": t_comp += 1
    pct = safe_calc_percent(t_comp, t_all)
    content = f"# 🛰️ PULSE | %{pct}\n> Updated: {get_now()}\n\n"
    for p, st in sorted(data.items()):
        content += f"### {p}\n- A: {len(st['active'])} | B: {len(st['backlog'])} | D: {len(st['completed'])}\n"
    with open(os.path.join(REGISTRY_DIR, "PULSE.md"), 'w', encoding='utf-8') as f:
        f.write(content)

def move_task(sp: str, tid: str, tp: str, ts: str) -> None:
    """Moves a task while neutralizing Optional[str] path issues."""
    f_folder: Optional[str] = None
    f_state: Optional[str] = None
    clean_tid = str(tid).zfill(3)
    
    for s in ["active", "backlog", "completed"]:
        path = os.path.join(REGISTRY_DIR, str(sp), str(s))
        if os.path.exists(path):
            cands = [f for f in os.listdir(path) if str(f).startswith(f"{clean_tid}-")]
            if cands:
                f_folder, f_state = str(cands[0]), str(s)
                break
                
    # Final Guard: pyre narrow path to str only
    if f_folder and f_state:
        # Narrowing by casting to str inside join to kill str|None error in pyre
        src = os.path.join(REGISTRY_DIR, str(sp), str(f_state), str(f_folder))
        dst = os.path.join(REGISTRY_DIR, str(tp), str(ts), str(f_folder))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)
        reindex()
        sync_pulse()

def repair_all() -> None:
    """Repairs registry state directories."""
    for p in os.listdir(REGISTRY_DIR):
        p_str = str(p)
        if p_str.startswith("P") and os.path.isdir(os.path.join(REGISTRY_DIR, p_str)):
            for sd in ["active", "backlog", "completed"]:
                os.makedirs(os.path.join(REGISTRY_DIR, p_str, str(sd)), exist_ok=True)
    reindex()
    sync_pulse()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub Registry Manager")
    parser.add_argument("action", choices=["repair", "activate", "move", "search"])
    parser.add_argument("id", nargs="?"); parser.add_argument("task", nargs="?")
    parser.add_argument("target_id", nargs="?"); parser.add_argument("target_state", nargs="?")
    args = parser.parse_args()
    a_id, t_id, tar_id, tar_st = str(args.id or ""), str(args.task or ""), str(args.target_id or ""), str(args.target_state or "")
    if args.action == "repair": repair_all()
    elif args.action == "move": move_task(a_id, t_id, tar_id, tar_st)
    elif args.action == "activate": move_task(a_id, t_id, a_id, "active")
