import os
import sys
import argparse
import re
import datetime
import shutil
import sqlite3
import json
import hashlib
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

# VENTHUB REGISTRY 4.2 (RESILIENT ENGINE PRO)
REGISTRY_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = REGISTRY_DIR.parent
DB_FILE = REGISTRY_DIR / "registry.db"
INDEX_JSON = REGISTRY_DIR / "index.json"
SENTINEL_FILE = REGISTRY_DIR / ".sentinel"
SHARED_MEMORY = PROJECT_ROOT / ".gemini" / "memory" / "shared_state.json"
LOCKS_FILE = PROJECT_ROOT / ".gemini" / "memory" / "task_locks.json"

def get_now() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def safe_write(file_path: Path, content: Any, indent: Optional[int] = None):
    """Atomically write content to a file ONLY if it has changed, with retry logic for Windows."""
    new_content = ""
    if isinstance(content, (dict, list)):
        new_content = json.dumps(content, indent=indent, ensure_ascii=False)
    else:
        new_content = str(content)

    # Smart Write: Eğer içerik aynıysa yazma (LSP dostu)
    if file_path.exists():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                if f.read() == new_content:
                    return # Değişiklik yoksa çık
        except: pass

    temp_file = file_path.with_suffix('.tmp')
    for i in range(5): # 5 attempts
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(temp_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            if file_path.exists():
                os.replace(str(temp_file), str(file_path))
            else:
                temp_file.rename(file_path)
            return
        except (PermissionError, OSError) as e:
            if i == 4: raise e
            time.sleep(0.5) # Wait for lock to release


def acquire_lock(task_id: str, agent_id: str = "Terminal"):
    locks: Dict[str, Any] = {}
    if LOCKS_FILE.exists():
        try:
            with open(LOCKS_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
                if content:
                    locks = json.loads(content)
        except: locks = {}
    
    if task_id in locks:
        existing_lock = locks[task_id]
        if isinstance(existing_lock, dict):
            # 5 Dakikalık Stale Lock (Bayat Kilit) Kontrolü
            last_ts_str = existing_lock.get('timestamp')
            is_stale = False
            if last_ts_str:
                try:
                    last_ts = datetime.datetime.strptime(last_ts_str, "%Y-%m-%d %H:%M:%S")
                    if (datetime.datetime.now() - last_ts).total_seconds() > 300: # 5 Dakika
                        is_stale = True
                except: pass
            
            if not is_stale and existing_lock.get('agent') != agent_id:
                print(f"🚨 ERİŞİM REDDEDİLDİ: Görev {task_id}, {last_ts_str} tarihinde {existing_lock.get('agent')} tarafından kilitlenmiş!")
                sys.exit(1)
            elif is_stale:
                print(f"⚠️ BAYAT KİLİT KIRILDI: {task_id} ({last_ts_str} tarihli kilit zaman aşımına uğradı)")
        
    locks[task_id] = {"agent": agent_id, "timestamp": get_now()}
    safe_write(LOCKS_FILE, locks, indent=2)
    print(f"🔒 GÖREV KİLİTLENDİ: {task_id} ({agent_id} adına)")



def release_lock(task_id: str, agent_id: str = "Terminal"):
    locks: Dict[str, Any] = {}
    if LOCKS_FILE.exists():
        try:
            with open(LOCKS_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
                if content:
                    locks = json.loads(content)
        except: locks = {}
            
    if task_id in locks:
        locks.pop(task_id, None)
        safe_write(LOCKS_FILE, locks, indent=2)
        print(f"🔓 GÖREV KİLİDİ AÇILDI: {task_id}")

    else:
        print(f"ℹ️ Görev {task_id} için aktif bir kilit bulunamadı.")

def remember(fact: str):
    data: Dict[str, Any] = {}
    if SHARED_MEMORY.exists():
        try:
            with open(SHARED_MEMORY, 'r', encoding='utf-8') as f:
                content = f.read()
                if content:
                    data = json.loads(content)
        except: data = {}
    
    entry = {"timestamp": get_now(), "fact": fact}
    if "history" not in data or not isinstance(data["history"], list):
        data["history"] = []
    
    history_list: List[Any] = data["history"]
    history_list.append(entry)
    data["last_update"] = get_now()
    
    safe_write(SHARED_MEMORY, data, indent=2)
    print(f"🧠 Orion Hatırladı: {fact}")



def recall(limit: int = 10, query: Optional[str] = None):
    if not SHARED_MEMORY.exists():
        print("📭 Orion Hafızası Boş.")
        return
    
    try:
        data = json.loads(SHARED_MEMORY.read_text(encoding='utf-8'))
        history = data.get("history", [])
        if not history:
            print("📭 Orion Hafızası Boş.")
            return

        if query:
            history = [e for e in history if query.lower() in str(e.get('fact', '')).lower()]
        
        display_history = history[-limit:]
        
        print(f"\n🧠 ORION PAYLAŞIMLI HAFIZA (Görünüm: Son {len(display_history)}, Kriter: '{query or 'Hepsi'}'):")
        for entry in display_history:
            print(f"- [{entry.get('timestamp')}] {entry.get('fact')}")
    except Exception as e:
        print(f"🚨 Hafıza okuma hatası: {e}")

def turkish_slug(text: str) -> str:
    mapping = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
        ' ': '-', '.': '', ',': '', '!': '', '?': '', '(': '', ')': ''
    }
    for k, v in mapping.items():
        text = text.replace(k, v)
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text).strip('-')
    return text.lower()[:40]

def parse_metadata(content: str) -> Dict[str, Any]:
    """Robust YAML metadata parser with BOM and multi-line support."""
    metadata: Dict[str, Any] = {}
    # BOM ve whitespace temizliği
    content = content.replace('\ufeff', '').strip()
    match = re.search(r'^---\s*\r?\n(.*?)\r?\n---', content, re.DOTALL)
    if match:
        yaml_content = match.group(1)
        for line in yaml_content.split('\n'):
            line = line.strip()
            if not line or ':' not in line: continue
            parts = line.split(':', 1)
            key = parts[0].strip()
            val = parts[1].strip().strip('"').strip("'")
            
            if val.startswith('[') and val.endswith(']'):
                metadata[key] = [x.strip().strip('"').strip("'") for x in val[1:-1].split(',') if x.strip()]
            else:
                metadata[key] = val
    
    # Zorunlu alan kontrolü (Untitled 000 engelleme)
    if not metadata.get('title') or metadata.get('title').lower() in ['untitled', 'başlıksız']:
        metadata['title'] = "Eksik Başlık (MD dosyasını kontrol edin)"
    return metadata

def calculate_integrity_hash() -> str:
    """Memory-safe integrity hash using database and shallow structure check."""
    # Sadece veritabanı dosyası ve ana projelerin varlığını kontrol eder (Hızlı ve bellek dostu)
    try:
        db_hash = ""
        if DB_FILE.exists():
            with open(DB_FILE, "rb") as f:
                db_hash = hashlib.sha256(f.read()).hexdigest()
        
        # Sadece ilk 2 seviyeyi kontrol et (Project/State) - Devasa string oluşturmaktan kaçın
        structure = []
        for root, dirs, files in os.walk(str(REGISTRY_DIR)):
            depth = root.replace(str(REGISTRY_DIR), '').count(os.sep)
            if depth > 2: continue # Derinliği sınırla (LSP'yi yorma)
            if any(x in root for x in [".snapshots", "__pycache__", ".git"]): continue
            rel_path = os.path.relpath(root, str(REGISTRY_DIR)).replace('\\', '/')
            structure.append(f"{rel_path}:{sorted(dirs)}")
        
        full_str = f"{db_hash}\n" + "\n".join(sorted(structure))
        return hashlib.sha256(full_str.encode('utf-8')).hexdigest()
    except:
        return "integrity_fallback_hash"

def check_sentinel() -> bool:
    if not SENTINEL_FILE.exists(): return True
    try:
        with open(SENTINEL_FILE, 'r') as f: saved_hash = f.read().strip()
        return saved_hash == calculate_integrity_hash()
    except: return False

def update_sentinel():
    safe_write(SENTINEL_FILE, calculate_integrity_hash())


class RegistryDB:
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self.cursor = self.conn.cursor()
        self.setup_schema()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        else:
            self.conn.rollback()
        self.conn.close()

    def setup_schema(self):
        self.cursor.executescript("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT,
                status TEXT,
                updated_at DATETIME
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT,
                project_id TEXT,
                state TEXT,
                status TEXT,
                priority TEXT,
                progress INTEGER,
                path TEXT,
                updated_at DATETIME,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            );
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT,
                action TEXT,
                details TEXT,
                timestamp DATETIME
            );
        """)
        self.conn.commit()

    def get_all_projects(self) -> List[tuple]:
        self.cursor.execute("SELECT id, name FROM projects ORDER BY id ASC")
        return self.cursor.fetchall()

    def get_tasks_by_project(self, project_id: str) -> Dict[str, List[Dict[str, Any]]]:
        states = ['active', 'backlog', 'completed']
        data = {s: [] for s in states}
        self.cursor.execute("""
            SELECT id, title, state, status, priority, progress 
            FROM tasks WHERE project_id=? 
            ORDER BY state ASC, priority DESC, id ASC
        """, (project_id,))
        for row in self.cursor.fetchall():
            task = {
                "id": row[0].split('/')[-1],
                "title": row[1],
                "state": row[2],
                "status": row[3],
                "priority": row[4],
                "progress": f"{row[5]}%"
            }
            if row[2] in data:
                data[row[2]].append(task)
        return data

    def log(self, task_id: str, action: str, details: str = ""):
        self.cursor.execute("INSERT INTO audit_log (task_id, action, details, timestamp) VALUES (?, ?, ?, ?)",
                         (task_id, action, details, get_now()))
        self.conn.commit()

    def sync_from_filesystem(self):
        print("🔄 DOSYA SİSTEMİNDEN SQL'E GÖÇ (MIGRATION) BAŞLADI...")
        projects = [d for d in REGISTRY_DIR.iterdir() if d.is_dir() and re.match(r'^P\d{2}', d.name)]
        for p_dir in projects:
            p_id = p_dir.name.split('-')[0]
            self.cursor.execute("INSERT OR REPLACE INTO projects (id, name, updated_at) VALUES (?, ?, ?)",
                             (p_id, p_dir.name, get_now()))
            
            for state in ['active', 'backlog', 'completed']:
                state_path = p_dir / state
                if not state_path.exists(): continue
                for item in state_path.iterdir():
                    if item.name.startswith('.') or item.name == ".gitkeep": continue
                    
                    main_md: Optional[Path] = None
                    if item.is_dir():
                        md_files = list(item.glob('*.md'))
                        if md_files:
                            main_md = next((f for f in md_files if f.name.startswith(item.name[:3])), md_files[0])
                    elif item.suffix == ".md":
                        main_md = item
                    
                    if main_md:
                        try:
                            m_content = main_md.read_text(encoding='utf-8-sig')
                            meta = parse_metadata(m_content)
                            t_id_raw = str(meta.get('id', item.name[:3])).zfill(3)
                            t_id = f"{p_id}/{t_id_raw}"
                            
                            progress = str(meta.get('progress', '0')).strip('%')
                            try: progress_val = int(progress)
                            except: progress_val = 0
                            
                            self.cursor.execute("""
                                INSERT OR REPLACE INTO tasks 
                                (id, title, project_id, state, status, priority, progress, path, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (t_id, meta.get('title', 'Başlıksız'), p_id, state, meta.get('status', 'Planning'), 
                                  meta.get('priority', 'Medium'), progress_val, str(main_md.relative_to(PROJECT_ROOT)), get_now()))
                        except Exception as e:
                            print(f"  [!] Hata ({item.name}): {e}")
        self.conn.commit()
        print("✅ SQL MOTORU SENKRONİZE EDİLDİ.")

    def close(self):
        self.conn.close()

def get_priority_label(priority: Optional[str]) -> str:
    labels = {"Critical": "🚨 CRIT", "High": "🔥 HIGH", "Medium": "⚡ MED ", "Low": "🍃 LOW ", "None": "➖ -   ", "null": "➖ -   "}
    return labels.get(str(priority), "➖ -   ")

def get_status_dot(status: Optional[str]) -> str:
    dots = {"Completed": "✅ DONE", "Done": "✅ DONE", "Executing": "🏗️ RUN ", "Active": "🏗️ RUN ", "Planning": "📝 PLAN", "Reviewing": "🔍 REVW", "Brainstorming": "💡 IDEA"}
    return dots.get(str(status), "⏳ WAIT")

def format_row(cols: List[str], widths: List[int]) -> str:
    row = "|"
    for i, col in enumerate(cols):
        row += f" {str(col).strip().ljust(widths[i])} |"
    return row + "\n"

def sync_pulse():
    """Generates PULSE.md directly from SQL Database."""
    with RegistryDB() as db:
        projects = db.get_all_projects()
        
        db.cursor.execute("SELECT COUNT(*) FROM tasks")
        total_tasks = db.cursor.fetchone()[0]
        db.cursor.execute("SELECT COUNT(*) FROM tasks WHERE state='completed'")
        completed_tasks = db.cursor.fetchone()[0]
        
        global_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
        pulse_content = f"# 🛰️ VENTHUB MISSION CONTROL (PULSE)\n> **Güncelleme:** {datetime.datetime.now().strftime('%d.%m.%Y %H:%M')} | **İlerleme:** %{global_progress}\n\n"
        
        widths = [6, 45, 12, 12, 10]
        headers = ["ID", "GÖREV BAŞLIĞI", "ÖNCELİK", "DURUM", "İLERLEME"]
        
        for p_id, p_name in projects:
            data = db.get_tasks_by_project(p_id)
            pulse_content += f"## 📁 {p_name.upper()}\n"
            
            if data["active"]:
                pulse_content += "### ⚡ Aktif Görevler\n" + format_row(headers, widths) + "|:---|:---|:---|:---|:---|\n"
                for t in data["active"]:
                    row = [f"`{t['id']}`", t['title'][:42], get_priority_label(t['priority']), get_status_dot(t['status']), f"`{t['progress']}`"]
                    pulse_content += format_row(row, widths)
            
            if data["backlog"]:
                pulse_content += "\n### ⏳ Backlog\n" + format_row(headers[:3], [6, 45, 12]) + "|:---|:---|:---|\n"
                for t in data["backlog"]:
                    row = [f"`{t['id']}`", t['title'][:42], get_priority_label(t['priority'])]
                    pulse_content += format_row(row, [6, 45, 12])
            pulse_content += "\n"

        safe_write(INDEX_JSON.parent / "PULSE.md", pulse_content)
        print(f"💓 NABIZ GÜNCELLENDİ (PULSE.md) - [Veritabanı Kaynaklı]")

def normalize_registry():
    with RegistryDB() as db:
        db.sync_from_filesystem()
    
    # ... (Rest of normalize_registry updated to use logic without explicit db close issues)
    # Actually, the original normalize_registry was using 'db = RegistryDB()' local.
    # Let's clean it up to use sync_pulse at the end.
    
    projects = [d for d in REGISTRY_DIR.iterdir() if d.is_dir() and re.match(r'^P\d{2}', d.name)]
    # ... (Kalan normalize mantığı devam eder, ama SQL entegre edilmiş şekilde)
    for p_dir in projects:
        for state in ['active', 'backlog', 'completed']:
            state_path = p_dir / state
            if not state_path.exists(): continue
            for item_dir in state_path.iterdir():
                if item_dir.name.startswith('.') or item_dir.name == ".gitkeep" or not item_dir.is_dir():
                    continue
                
                md_files = list(item_dir.glob('*.md'))
                if md_files:
                    main_md = next((f for f in md_files if f.name.startswith(item_dir.name[:3])), md_files[0])
                    m_content = main_md.read_text(encoding='utf-8-sig')
                    
                    # --- PROGRESS & STATE SYNC ENGINE ---
                    meta = parse_metadata(m_content)
                    progress = meta.get('progress', '0').strip('%')
                    try: progress_val = int(progress)
                    except: progress_val = 0
                    
                    current_path = item_dir
                    current_main_md = main_md
                    
                    if progress_val >= 100 and state != 'completed':
                        print(f"🏁 GÖREV TAMAMLANDI: {item_dir.name} (%100). Completed klasörüne taşınıyor...")
                        dest_path = p_dir / 'completed' / item_dir.name
                        if dest_path.exists(): shutil.rmtree(dest_path)
                        shutil.move(str(item_dir), str(dest_path))
                        current_path = dest_path
                        current_main_md = dest_path / main_md.name
                    
                    # --- CONTENT SYNC ENGINE (Plan -> Main) ---
                    plan_file = current_path / "plan.md"
                    if plan_file.exists():
                        p_content = plan_file.read_text(encoding='utf-8-sig')
                        tasks = re.findall(r'- \[[ x]\] .*', p_content)
                        if tasks:
                            new_block = "## ✅ Alt Görevler\n" + "\n".join(tasks)
                            if "## ✅ Alt Görevler" in m_content:
                                # Önceki tüm boşlukları yut ve sabit 2 boşluk bırak (Boşluk sızıntısını engeller)
                                m_content = re.sub(r'\n*## ✅ Alt Görevler.*', '\n\n' + new_block, m_content, flags=re.DOTALL)
                            else:
                                m_content += '\n\n' + new_block

                    # --- METADATA MÜHÜRLEME & FINAL WRITE ---
                    for md_file in current_path.glob('*.md'):
                        is_main = (md_file == current_main_md)
                        old_content = md_file.read_text(encoding='utf-8-sig')
                        working_content = m_content if is_main else old_content
                        
                        if working_content.startswith('---'):
                            new_status = "Executing" if state == "active" else "Completed" if state == "completed" else "Planning"
                            working_content = re.sub(r'status:\s*".*?"', f'status: "{new_status}"', working_content)
                            working_content = re.sub(r'project:\s*".*?"', f'project: "{p_dir.name}"', working_content)
                            
                            def fix_p(match):
                                pfx = match.group(1); fn = match.group(2).split('/')[-1]
                                return f'{pfx}"registry/{p_dir.name}/{state}/{item_dir.name}/{fn}"'
                            
                            working_content = re.sub(r'(\w+:\s*)"(registry/.*?)"', fix_p, working_content)
                            
                            # FINAL DIFF CHECK (Tarih ve Satır Sonu hariç değişim var mı?)
                            # Satır sonlarını (\r\n -> \n) ve boşlukları normalize et
                            def normalize_for_diff(text):
                                text = re.sub(r'updated_at:\s*".*?"', '', text)
                                return text.replace('\r\n', '\n').strip()
                            
                            if normalize_for_diff(old_content) != normalize_for_diff(working_content):
                                final_content = re.sub(r'updated_at:\s*".*?"', f'updated_at: "{get_now()}"', working_content)
                                safe_write(md_file, final_content)
                                if is_main:
                                    print(f"  📝 Güncellendi: {item_dir.name}")
    
    sync_pulse()
    update_sentinel()


def create_project(proj_id: str, name: str):
    slug = turkish_slug(name)
    proj_dir = REGISTRY_DIR / f"{proj_id}-{slug}"
    for s in ["active", "backlog", "completed"]:
        path = proj_dir / s
        path.mkdir(parents=True, exist_ok=True)
        (path / ".gitkeep").touch()
    print(f"🚀 Proje Otonom Başlatıldı: {proj_id}-{slug}")
    db = RegistryDB()
    db.cursor.execute("INSERT OR REPLACE INTO projects (id, name, updated_at) VALUES (?, ?, ?)", (proj_id, f"{proj_id}-{slug}", get_now()))
    db.conn.commit()
    update_sentinel()

def move_task(proj_id: str, task_id_raw: Optional[str] = None, target_state: str = "active"):
    proj_dir: Optional[Path] = None
    task_id: str = task_id_raw or ""

    if not task_id and proj_id and proj_id.isdigit():
        task_id = proj_id

        for p in REGISTRY_DIR.iterdir():
            if not p.is_dir() or not p.name.startswith("P"): continue
            for s in ["backlog", "active", "completed"]:
                s_path = p / s
                if s_path.exists():
                    folder = next((d for d in s_path.iterdir() if d.is_dir() and d.name.startswith(f"{task_id.zfill(3)}-")), None)
                    if folder:
                        proj_dir = p
                        break
            if proj_dir: break
        if not proj_dir:
            print(f"❌ Görev bulunamadı: {task_id}")
            return
    else:
        proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(proj_id)), None)
        task_id = task_id_raw or ""
    
    if not proj_dir:
        print(f"❌ Proje bulunamadı: {proj_id}")
        return

    tid_prefix = f"{task_id.zfill(3)}-"
    p_id_short = proj_dir.name.split('-')[0]
    for s in ["backlog", "active", "completed"]:
        s_path = proj_dir / s
        if s_path.exists():
            folder = next((d for d in s_path.iterdir() if d.is_dir() and d.name.startswith(tid_prefix)), None)
            if folder:
                src = folder
                dest = proj_dir / target_state / folder.name
                if src != dest:
                    if dest.exists(): shutil.rmtree(dest)
                    shutil.move(str(src), str(dest))
                    print(f"🚚 Görev Otonom Taşındı: {task_id} -> {target_state}")
                    
                    db = RegistryDB()
                    full_t_id = f"{p_id_short}/{task_id.zfill(3)}"
                    db.cursor.execute("UPDATE tasks SET state=?, updated_at=? WHERE id=?", (target_state, get_now(), full_t_id))
                    db.log(full_t_id, "MOVE", f"Moved from {s} to {target_state}")
                    db.conn.commit()
                
                normalize_registry()
                return

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub Registry Engine CLI")
    parser.add_argument("action", choices=["repair", "reindex", "normalize", "activate", "task", "create-project", "create-task", "remember", "recall", "lock", "unlock", "init", "dashboard"])
    parser.add_argument("project_id", nargs="?", help="Project ID (e.g., P01)")
    parser.add_argument("task_id", nargs="?", help="Task ID (e.g., 008)")
    parser.add_argument("--query", "-q", help="Search query for recall")
    parser.add_argument("--fact", "-f", help="Fact to remember")
    parser.add_argument("--limit", "-l", type=int, default=10, help="Recall limit")
    
    args = parser.parse_args()
    
    if args.action == "init":
        db = RegistryDB()
        db.sync_from_filesystem()
        normalize_registry()
        print("✨ REGISTRY 4.5 BAŞLATILDI (SQL + FS SYNC OK)")
        sys.exit(0)
    
    if args.action == "repair":
        print("🛠️ KAYIT DEFTERİ ONARILIYOR (REPAIR)...")
        if LOCKS_FILE.exists():
            os.remove(LOCKS_FILE) # Tüm kilitleri temizle
            print("🔓 Tüm görev kilitleri (Task Locks) temizlendi.")
        normalize_registry()
        print("✅ ONARIM TAMAMLANDI.")
        sys.exit(0)
    
    if args.action == "dashboard":
        db = RegistryDB()
        db.cursor.execute("SELECT id, title, status, progress FROM tasks WHERE state='active' ORDER BY updated_at DESC")
        active_tasks = db.cursor.fetchall()
        print("\n🛰️ REGISTRY CANLI DASHBOARD (SQL)")
        for t in active_tasks:
            progress = t[3] if t[3] is not None else 0
            print(f"- [{progress}%] {t[0]}: {t[1]} ({t[2]})")
        sys.exit(0)

    if args.action == "normalize":
        normalize_registry()
        sys.exit(0)

    if args.action == "activate":
        if not args.project_id:
            print("❌ HATA: Proje ID (P01) gerekli.")
            sys.exit(1)
        move_task(args.project_id, args.task_id, "active")
        sys.exit(0)

    if args.action == "create-task":
        if not args.project_id or not args.task_id or not args.query:
            print("❌ HATA: Proje ID, Görev ID ve Başlık (--query) gerekli.")
            sys.exit(1)
        
        proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(args.project_id)), None)
        if not proj_dir:
            print(f"❌ HATA: Proje {args.project_id} bulunamadı.")
            sys.exit(1)
            
        task_slug = args.query.lower().replace(' ', '-').replace('(', '').replace(')', '').replace('ı', 'i').replace('ü', 'u').replace('ö', 'o').replace('ç', 'c').replace('ş', 's').replace('ğ', 'g')
        task_dir = proj_dir / "backlog" / f"{args.task_id.zfill(3)}-{task_slug}"
        task_dir.mkdir(parents=True, exist_ok=True)
        
        md_file = task_dir / f"{args.task_id.zfill(3)}.md"
        content = f"---\nid: \"{args.task_id.zfill(3)}\"\ntitle: \"{args.query}\"\nstatus: \"Backlog\"\npriority: \"High\"\n---\n\n# {args.query}\n\n## 🎯 Hedef\n\n## 📝 Notlar\n"
        safe_write(md_file, content)
        
        # Otonom dosya oluşturma
        safe_write(task_dir / "brainstorm.md", "# 🧠 Brainstorming: " + args.query)
        safe_write(task_dir / "plan.md", "# 📋 Implementation Plan: " + args.query)
        
        print(f"✅ GÖREV OLUŞTURULDU (BACKLOG): {task_dir}")
        normalize_registry()
        sys.exit(0)

    if args.action == "task":
        if not args.project_id:
            print("❌ HATA: Proje ID (P01) gerekli.")
            sys.exit(1)
        target = args.task_id if args.task_id in ["backlog", "active", "completed"] else "active"
        # Eğer task_id bir durum değilse, muhtemelen task_id_raw olarak gelmiştir.
        # move_task(proj_id, task_id_raw, target_state)
        # Ama burada argparse yapısı biraz karışık. Basitleştirelim.
        # Kullanım: python manage_registry.py task P01 008 completed
        # Ancak biz activate komutunu zaten yazdık.
        print("⚠️ Not: 'activate' komutunu kullanmanız önerilir. 'task' mantığı henüz tam uyarlanmadı.")
        sys.exit(1)

    if args.action == "remember":
        if not args.fact:
            print("❌ HATA: Hatırlanacak bir gerçek (--fact) gerekli.")
            sys.exit(1)
        remember(args.fact)
        sys.exit(0)

    if args.action == "recall":
        recall(limit=args.limit, query=args.query)
        sys.exit(0)

    if args.action == "lock":
        if not args.task_id:
            print("❌ HATA: Kilitlenecek görev ID gerekli.")
            sys.exit(1)
        acquire_lock(args.task_id)
        sys.exit(0)

    if args.action == "unlock":
        if not args.task_id:
            print("❌ HATA: Kilidi açılacak görev ID gerekli.")
            sys.exit(1)
        release_lock(args.task_id)
        sys.exit(0)
