import os
import sys
import argparse
import re
import datetime
import shutil
import sqlite3
import json
import hashlib
from typing import List, Dict, Any, Optional

# VENTHUB REGISTRY 4.1 (SYNC ENGINE PRO)
REGISTRY_DIR: str = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT: str = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
DB_FILE: str = os.path.join(REGISTRY_DIR, "registry.db")
INDEX_JSON: str = os.path.join(REGISTRY_DIR, "index.json")
SENTINEL_FILE: str = os.path.join(REGISTRY_DIR, ".sentinel")
SHARED_MEMORY: str = os.path.abspath(os.path.join(PROJECT_ROOT, ".gemini", "memory", "shared_state.json"))
LOCKS_FILE: str = os.path.abspath(os.path.join(PROJECT_ROOT, ".gemini", "memory", "task_locks.json"))

def get_now() -> str:
    return str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

def acquire_lock(task_id: str, agent_id: str = "Terminal"):
    locks = {}
    if os.path.exists(LOCKS_FILE):
        with open(LOCKS_FILE, 'r', encoding='utf-8') as f:
            try: locks = json.load(f)
            except: locks = {}
    
    if task_id in locks and locks[task_id]['agent'] != agent_id:
        print(f"🚨 ERİŞİM REDDEDİLDİ: Görev {task_id}, {locks[task_id]['timestamp']} tarihinde {locks[task_id]['agent']} tarafından kilitlenmiş!")
        sys.exit(1)
        
    locks[task_id] = {"agent": agent_id, "timestamp": get_now()}
    with open(LOCKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(locks, f, indent=2, ensure_ascii=False)
    print(f"🔒 GÖREV KİLİTLENDİ: {task_id} ({agent_id} adına)")

def release_lock(task_id: str, agent_id: str = "Terminal"):
    locks = {}
    if os.path.exists(LOCKS_FILE):
        with open(LOCKS_FILE, 'r', encoding='utf-8') as f:
            try: locks = json.load(f)
            except: locks = {}
            
    if task_id in locks:
        del locks[task_id]
        with open(LOCKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(locks, f, indent=2, ensure_ascii=False)
        print(f"🔓 GÖREV KİLİDİ AÇILDI: {task_id}")
    else:
        print(f"ℹ️ Görev {task_id} için aktif bir kilit bulunamadı.")

def remember(fact: str):
    data = {}
    if os.path.exists(SHARED_MEMORY):
        with open(SHARED_MEMORY, 'r', encoding='utf-8') as f:
            try: data = json.load(f)
            except: data = {}
    
    entry = {"timestamp": get_now(), "fact": fact}
    if "history" not in data: data["history"] = []
    data["history"].append(entry)
    data["last_update"] = get_now()
    
    with open(SHARED_MEMORY, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"🧠 Orion Hatırladı: {fact}")

def recall():
    if not os.path.exists(SHARED_MEMORY):
        print("📭 Orion Hafızası Boş.")
        return
    with open(SHARED_MEMORY, 'r', encoding='utf-8') as f:
        data = json.load(f)
        print(f"\n🧠 ORION SHARED MEMORY (Son Güncelleme: {data.get('last_update', '???')})")
        for item in data.get("history", [])[-5:]: # Son 5 kayıt
            print(f"  [{item['timestamp']}] {item['fact']}")

def turkish_slug(text: str) -> str:
    mapping = str.maketrans("çğışıöüÇĞİŞIÖÜ", "cgisiouCGISIOU")
    text = text.translate(mapping).lower()
    text = re.sub(r'^\d{3}[:\-_\s]*', '', text)
    text = re.sub(r'[^a-z0-9-]', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text[:40]

def parse_metadata(content: str) -> Dict[str, Any]:
    meta: Dict[str, Any] = {}
    match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL | re.MULTILINE)
    if not match: return meta
    for line in match.group(1).split('\n'):
        if ':' in line:
            parts = line.split(':', 1)
            key = parts[0].strip(); val = parts[1].strip().strip('"').strip("'")
            meta[key] = val
    return meta

def calculate_integrity_hash():
    structure = []
    for root, dirs, files in os.walk(REGISTRY_DIR):
        if any(x in root for x in [".snapshots", "__pycache__", ".git"]): continue
        rel_path = os.path.relpath(root, REGISTRY_DIR).replace('\\', '/')
        structure.append(f"{rel_path}:{sorted(dirs)}:{sorted(files)}")
    full_str = "\n".join(sorted(structure))
    return hashlib.sha256(full_str.encode('utf-8')).hexdigest()

def check_sentinel():
    if not os.path.exists(SENTINEL_FILE): return True
    with open(SENTINEL_FILE, 'r') as f: saved_hash = f.read().strip()
    return saved_hash == calculate_integrity_hash()

def update_sentinel():
    with open(SENTINEL_FILE, 'w') as f: f.write(calculate_integrity_hash())

def create_project(proj_id: str, name: str):
    slug = turkish_slug(name)
    proj_dir = os.path.join(REGISTRY_DIR, f"{proj_id}-{slug}")
    for s in ["active", "backlog", "completed"]:
        path = os.path.join(proj_dir, s); os.makedirs(path, exist_ok=True)
        with open(os.path.join(path, ".gitkeep"), 'w') as f: pass
    print(f"🚀 Proje Otonom Başlatıldı: {proj_id}-{slug}")
    update_sentinel()

def create_task(proj_id: str, task_id: str, title: str):
    proj_dir = next((d for d in os.listdir(REGISTRY_DIR) if d.startswith(proj_id)), None)
    slug = f"{task_id.zfill(3)}-{turkish_slug(title)}"
    task_path = os.path.join(REGISTRY_DIR, proj_dir, "backlog", slug); os.makedirs(task_path, exist_ok=True)
    main_md = os.path.join(task_path, f"{slug}.md")
    template = f"---\nid: {task_id.zfill(3)}\ntitle: \"{title}\"\npriority: \"MED\"\nstatus: \"Planning\"\nproject: \"{proj_dir}\"\ncreated_at: \"{get_now()}\"\nupdated_at: \"{get_now()}\"\nartifacts:\n  brainstorm: \"registry/{proj_dir}/backlog/{slug}/brainstorm.md\"\n  plan: \"registry/{proj_dir}/backlog/{slug}/plan.md\"\n  review: \"registry/{proj_dir}/backlog/{slug}/review.md\"\n---\n# 🏗️ {task_id.zfill(3)}: {title}\nGörev içeriği buraya gelecek.\n"
    with open(main_md, 'w', encoding='utf-8') as f: f.write(template)
    for art in ["brainstorm.md", "plan.md", "review.md"]:
        with open(os.path.join(task_path, art), 'w', encoding='utf-8') as f:
            f.write(f"# {art.split('.')[0].capitalize()}: {title}\nBu dosya otonom olarak mühürlenmiştir.\n")
    print(f"📄 Görev Otonom Yaratıldı: {slug}")
    update_sentinel()

def normalize_registry():
    projects = [d for d in os.listdir(REGISTRY_DIR) if re.match(r'^P\d{2}', d) and os.path.isdir(os.path.join(REGISTRY_DIR, d))]
    for p_dir in projects:
        p_path = os.path.join(REGISTRY_DIR, p_dir)
        for state in ['active', 'backlog', 'completed']:
            state_path = os.path.join(p_path, state)
            if not os.path.exists(state_path): continue
            for item in os.listdir(state_path):
                i_path = os.path.join(state_path, item)
                if item.startswith('.') or item == ".gitkeep" or not os.path.isdir(i_path): continue
                md_files = [f for f in os.listdir(i_path) if f.endswith('.md')]
                if md_files:
                    main_md_name = next((f for f in md_files if f.startswith(item[:3])), md_files[0])
                    main_md_path = os.path.join(i_path, main_md_name)
                    
                    with open(main_md_path, 'r', encoding='utf-8') as f: m_content = f.read()
                    
                    # --- CONTENT SYNC ENGINE (Plan -> Main) ---
                    plan_path = os.path.join(i_path, "plan.md")
                    if os.path.exists(plan_path):
                        with open(plan_path, 'r', encoding='utf-8') as pf: p_content = pf.read()
                        tasks = re.findall(r'- \[[ x]\] .*', p_content)
                        if tasks:
                            new_block = "\n\n## ✅ Alt Görevler\n" + "\n".join(tasks)
                            if "## ✅ Alt Görevler" in m_content:
                                m_content = re.sub(r'## ✅ Alt Görevler.*', new_block, m_content, flags=re.DOTALL)
                            else:
                                m_content += new_block
                            with open(main_md_path, 'w', encoding='utf-8') as mf: mf.write(m_content)
                            print(f"  🔄 İçerik Senkronize Edildi: {item}")

                    # --- METADATA MÜHÜRLEME ---
                    for f_name in os.listdir(i_path):
                        if f_name.endswith('.md'):
                            f_path = os.path.join(i_path, f_name)
                            with open(f_path, 'r', encoding='utf-8') as f: content = f.read()
                            if content.startswith('---'):
                                new_status = "Executing" if state == "active" else "Completed" if state == "completed" else "Planning"
                                content = re.sub(r'status:\s*".*?"', f'status: "{new_status}"', content)
                                content = re.sub(r'project:\s*".*?"', f'project: "{p_dir}"', content)
                                content = re.sub(r'updated_at:\s*".*?"', f'updated_at: "{get_now()}"', content)
                                def fix_p(match):
                                    pfx = match.group(1); fn = match.group(2).split('/')[-1]
                                    return f'{pfx}"registry/{p_dir}/{state}/{item}/{fn}"'
                                content = re.sub(r'(\w+:\s*)"(registry/.*?)"', fix_p, content)
                                with open(f_path, 'w', encoding='utf-8') as f: f.write(content)
    update_sentinel()

def move_task(proj_id: str, task_id: str, target_state: str):
    proj_dir = next((d for d in os.listdir(REGISTRY_DIR) if d.startswith(proj_id)), None)
    tid_prefix = f"{task_id.zfill(3)}-"
    for s in ["backlog", "active", "completed"]:
        s_path = os.path.join(REGISTRY_DIR, proj_dir, s)
        if os.path.exists(s_path):
            folder = next((d for d in os.listdir(s_path) if d.startswith(tid_prefix)), None)
            if folder:
                src = os.path.join(s_path, folder)
                dest = os.path.join(REGISTRY_DIR, proj_dir, target_state, folder)
                if os.path.exists(dest): shutil.rmtree(dest)
                shutil.move(src, dest)
                print(f"🚚 Görev Otonom Taşındı: {task_id} -> {target_state}")
                normalize_registry()
                break

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["repair", "reindex", "normalize", "activate", "task", "create-project", "create-task", "remember", "recall", "lock", "unlock"])
    parser.add_argument("proj", nargs="?"); parser.add_argument("task", nargs="?"); parser.add_argument("title", nargs="?")
    args = parser.parse_args()
    if args.action == "repair": normalize_registry(); print("🛡️ Mühür Tazelendi."); sys.exit(0)
    if args.action == "recall": recall(); sys.exit(0)
    if args.action == "remember": remember(args.proj); sys.exit(0)
    if args.action == "lock": acquire_lock(args.proj, args.task or "Terminal"); sys.exit(0)
    if args.action == "unlock": release_lock(args.proj, args.task or "Terminal"); sys.exit(0)
    if not check_sentinel(): print("\n[🚨 SENTINEL] İHLAL! Repair çalıştırın."); sys.exit(1)
    try:
        if args.action == "create-project": create_project(args.proj, args.task)
        elif args.action == "create-task": create_task(args.proj, args.task, args.title)
        elif args.action == "normalize": normalize_registry()
        elif args.action == "activate": move_task(args.proj, args.task, "active")
        elif args.action == "task": move_task(args.proj, args.task, args.title)
        elif args.action == "reindex": RegistryDB().sync(); update_sentinel(); print("🔄 İndeks Güncellendi.")
    except Exception as e: print(f"[🚨 KAZA] {e}")
