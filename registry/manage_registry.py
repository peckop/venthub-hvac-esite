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

# VENTHUB REGISTRY 5.0 (SILENT & RESILIENT ENGINE)
REGISTRY_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = REGISTRY_DIR.parent
DB_FILE = REGISTRY_DIR / "registry.db"
INDEX_JSON = REGISTRY_DIR / "index.json"
SENTINEL_FILE = REGISTRY_DIR / ".sentinel"
SHARED_MEMORY = PROJECT_ROOT / ".gemini" / "memory" / "shared_state.json"
LOCKS_FILE = PROJECT_ROOT / ".gemini" / "memory" / "task_locks.json"

VERBOSE = False # Varsayılan sessiz mod (Antigravity dostu)

def log_info(msg: str):
    if VERBOSE: print(f"ℹ️ {msg}")

def log_success(msg: str):
    print(f"✅ {msg}")

def log_error(msg: str):
    print(f"🚨 {msg}")

def get_now() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def safe_write(file_path: Path, content: Any, indent: Optional[int] = None):
    """Atomically write content to a file ONLY if it has changed, with retry logic for Windows."""
    new_content = ""
    if isinstance(content, (dict, list)):
        new_content = json.dumps(content, indent=indent, ensure_ascii=False)
    else:
        new_content = str(content)

    # Smart Write: Eğer içerik aynıysa yazma (LSP ve Terminal dostu)
    if file_path.exists():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                if f.read() == new_content:
                    return # Değişiklik yoksa GEREKSİZ I/O YAPMA
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
            time.sleep(0.3) # Wait for lock to release

def acquire_lock(task_id: str, agent_id: str = "Terminal"):
    locks: Dict[str, Any] = {}
    if LOCKS_FILE.exists():
        try:
            with open(LOCKS_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
                if content: locks = json.loads(content)
        except: locks = {}
    
    if task_id in locks:
        existing_lock = locks[task_id]
        if isinstance(existing_lock, dict):
            last_ts_str = existing_lock.get('timestamp')
            is_stale = False
            if last_ts_str:
                try:
                    last_ts = datetime.datetime.strptime(last_ts_str, "%Y-%m-%d %H:%M:%S")
                    if (datetime.datetime.now() - last_ts).total_seconds() > 300: is_stale = True
                except: pass
            
            if not is_stale and existing_lock.get('agent') != agent_id:
                log_error(f"ERİŞİM REDDEDİLDİ: Görev {task_id}, {last_ts_str} tarihinde {existing_lock.get('agent')} tarafından kilitlenmiş!")
                sys.exit(1)
            elif is_stale:
                log_info(f"BAYAT KİLİT KIRILDI: {task_id} ({last_ts_str})")
        
    locks[task_id] = {"agent": agent_id, "timestamp": get_now()}
    safe_write(LOCKS_FILE, locks, indent=2)
    log_info(f"🔒 GÖREV KİLİTLENDİ: {task_id}")

def release_lock(task_id: str, agent_id: str = "Terminal"):
    locks: Dict[str, Any] = {}
    if LOCKS_FILE.exists():
        try:
            with open(LOCKS_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
                if content: locks = json.loads(content)
        except: locks = {}
            
    if task_id in locks:
        locks.pop(task_id, None)
        safe_write(LOCKS_FILE, locks, indent=2)
        log_info(f"🔓 GÖREV KİLİDİ AÇILDI: {task_id}")

def remember(fact: str):
    data: Dict[str, Any] = {}
    if SHARED_MEMORY.exists():
        try:
            with open(SHARED_MEMORY, 'r', encoding='utf-8') as f:
                content = f.read()
                if content: data = json.loads(content)
        except: data = {}
    
    entry = {"timestamp": get_now(), "fact": fact}
    if "history" not in data or not isinstance(data["history"], list):
        data["history"] = []
    
    # Hafıza Sınırlama (Max 50 kayıt) - Veri obezitesini engeller
    data["history"].append(entry)
    if len(data["history"]) > 50:
        data["history"] = data["history"][-50:]
        
    data["last_update"] = get_now()
    safe_write(SHARED_MEMORY, data, indent=2)
    log_success(f"🧠 Orion Hatırladı: {fact[:60]}...")

def recall(limit: int = 10, query: Optional[str] = None):
    if not SHARED_MEMORY.exists():
        log_info("📭 Orion Hafızası Boş.")
        return
    
    try:
        data = json.loads(SHARED_MEMORY.read_text(encoding='utf-8'))
        history = data.get("history", [])
        if not history:
            log_info("📭 Orion Hafızası Boş.")
            return

        if query:
            history = [e for e in history if query.lower() in str(e.get('fact', '')).lower()]
        
        display_history = history[-limit:]
        print(f"\n🧠 ORION PAYLAŞIMLI HAFIZA (Son {len(display_history)}):")
        for entry in display_history:
            print(f"- [{entry.get('timestamp')}] {entry.get('fact')}")
    except Exception as e:
        log_error(f"Hafıza okuma hatası: {e}")

def turkish_slug(text: str) -> str:
    mapping = {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u', ' ': '-', '.': '', ',': '', '!': '', '?': '', '(': '', ')': ''}
    for k, v in mapping.items(): text = text.replace(k, v)
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text).strip('-')
    return text.lower()

def parse_metadata(content: str, folder_name: Optional[str] = None) -> Dict[str, Any]:
    """Self-Healing Metadata Parser: Eksik veya hatalı başlıkları klasör adından onarır."""
    metadata: Dict[str, Any] = {}
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
    
    # --- SELF-HEALING ENGINE (OTO-ONARIM) ---
    title = metadata.get('title', '').lower()
    if not title or title in ['untitled', 'başlıksız', 'eksik başlık (md dosyasını kontrol edin)']:
        if folder_name:
            # Klasör adından başlık üret (Örn: 006-registry-fix -> Registry Fix)
            clean_title = folder_name.split('-', 1)[-1].replace('-', ' ').title()
            metadata['title'] = clean_title
            log_info(f"🩹 Oto-Onarım: '{folder_name}' için başlık üretildi: '{clean_title}'")
        else:
            metadata['title'] = "Eksik Başlık"
    return metadata

class RegistryDB:
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self.cursor = self.conn.cursor()
        self.setup_schema()

    def __enter__(self): return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None: self.conn.commit()
        else: self.conn.rollback()
        self.conn.close()

    def setup_schema(self):
        self.cursor.executescript("""
            CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT, description TEXT, status TEXT, updated_at DATETIME);
            CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT, project_id TEXT, state TEXT, status TEXT, priority TEXT, progress INTEGER, path TEXT, hash TEXT, updated_at DATETIME);
        """)
        self.conn.commit()

    def sync_from_filesystem(self):
        """Incremental Sync: Sadece değişen MD dosyalarını ve meta verileri işler."""
        projects = [d for d in REGISTRY_DIR.iterdir() if d.is_dir() and re.match(r'^P\d{2}', d.name)]
        updated_count = 0
        for p_dir in projects:
            p_id = p_dir.name.split('-')[0]
            self.cursor.execute("INSERT OR REPLACE INTO projects (id, name, updated_at) VALUES (?, ?, ?)", (p_id, p_dir.name, get_now()))
            
            for state in ['active', 'backlog', 'completed']:
                state_path = p_dir / state
                if not state_path.exists(): continue
                for item in state_path.iterdir():
                    if item.name.startswith('.') or item.name == ".gitkeep": continue
                    main_md = next((f for f in item.glob('*.md') if f.name.startswith(item.name[:3])), None) if item.is_dir() else (item if item.suffix == ".md" else None)
                    
                    if main_md:
                        try:
                            m_content = main_md.read_text(encoding='utf-8-sig')
                            m_hash = hashlib.md5(m_content.encode('utf-8')).hexdigest()
                            
                            # Incremental Check: Hash aynıysa bu dosyayı atla
                            self.cursor.execute("SELECT hash FROM tasks WHERE id=?", (f"{p_id}/{item.name[:3]}",))
                            row = self.cursor.fetchone()
                            if row and row[0] == m_hash: continue 
                            
                            meta = parse_metadata(m_content, folder_name=item.name)
                            # Eğer parse_metadata başlığı onardıysa, MD dosyasını da sessizce güncelle (Self-Healing)
                            if meta.get('title') != "Eksik Başlık" and "title:" not in m_content:
                                m_content = f"---\nid: \"{item.name[:3]}\"\ntitle: \"{meta['title']}\"\nstatus: \"{state.title()}\"\n---\n\n" + m_content
                                safe_write(main_md, m_content)
                                m_hash = hashlib.md5(m_content.encode('utf-8')).hexdigest()

                            t_id = f"{p_id}/{item.name[:3].zfill(3)}"
                            progress_val = int(str(meta.get('progress', '0')).strip('%')) if str(meta.get('progress', '0')).strip('%').isdigit() else 0
                            
                            self.cursor.execute("""
                                INSERT OR REPLACE INTO tasks (id, title, project_id, state, status, priority, progress, path, hash, updated_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (t_id, meta.get('title'), p_id, state, meta.get('status', state.title()), meta.get('priority', 'Medium'), progress_val, str(main_md.relative_to(PROJECT_ROOT)), m_hash, get_now()))
                            updated_count += 1
                        except: pass
        if updated_count > 0:
            log_info(f"🔄 {updated_count} görev senkronize edildi.")

def get_priority_label(priority: Optional[str]) -> str:
    labels = {"Critical": "🚨 CRIT", "High": "🔥 HIGH", "Medium": "⚡ MED ", "Low": "🍃 LOW ", "None": "➖ -   "}
    return labels.get(str(priority), "➖ -   ")

def get_status_dot(status: Optional[str]) -> str:
    dots = {"Completed": "✅ DONE", "Executing": "🏗️ RUN ", "Planning": "📝 PLAN", "Reviewing": "🔍 REVW", "Brainstorming": "💡 IDEA"}
    return dots.get(str(status), "⏳ WAIT")

def format_row(cols: List[str], widths: List[int]) -> str:
    return "|" + "|".join(f" {str(col).strip().ljust(widths[i])} " for i, col in enumerate(cols)) + "|\n"

def sync_pulse():
    """Disk Dostu Pulse: Sadece içerik değişirse yazar."""
    with RegistryDB() as db:
        db.cursor.execute("SELECT COUNT(*), (SELECT COUNT(*) FROM tasks WHERE state='completed') FROM tasks")
        total, completed = db.cursor.fetchone()
        prog = int((completed / total * 100)) if total > 0 else 0
        
        pulse_content = f"# 🛰️ VENTHUB MISSION CONTROL (PULSE)\n> **Güncelleme:** {datetime.datetime.now().strftime('%d.%m.%Y %H:%M')} | **İlerleme:** %{prog}\n\n"
        widths = [6, 45, 12, 12, 10]; headers = ["ID", "GÖREV BAŞLIĞI", "ÖNCELİK", "DURUM", "İLERLEME"]
        
        db.cursor.execute("SELECT id, name FROM projects ORDER BY id")
        for p_id, p_name in db.cursor.fetchall():
            pulse_content += f"## 📁 {p_name.upper()}\n"
            for state, title in [('active', '⚡ Aktif Görevler'), ('backlog', '⏳ Backlog')]:
                db.cursor.execute("SELECT id, title, priority, status, progress FROM tasks WHERE project_id=? AND state=? ORDER BY priority DESC, id ASC", (p_id, state))
                tasks = db.cursor.fetchall()
                if tasks:
                    pulse_content += f"### {title}\n" + format_row(headers if state=='active' else headers[:3], widths if state=='active' else widths[:3])
                    pulse_content += "|" + "|".join(":---" for _ in (headers if state=='active' else headers[:3])) + "|\n"
                    for t in tasks:
                        row = [f"`{t[0].split('/')[-1]}`", t[1][:42], get_priority_label(t[2]), get_status_dot(t[3]), f"`{t[4]}%`"]
                        pulse_content += format_row(row if state=='active' else row[:3], widths if state=='active' else widths[:3])
            pulse_content += "\n"
        safe_write(INDEX_JSON.parent / "PULSE.md", pulse_content)

def normalize_registry():
    """Sessiz ve Hızlı Normalizasyon Engine. V7 Protokolü disipliniyle görev taşır."""
    with RegistryDB() as db:
        db.sync_from_filesystem()
        # %100 olan ve henüz 'completed' statüsünde olmayan görevleri bul
        db.cursor.execute("SELECT id, project_id, state, path FROM tasks WHERE progress >= 100 AND state != 'completed'")
        completed_tasks = db.cursor.fetchall()
        
        for t_id, p_id, state, path_str in completed_tasks:
            src_path = PROJECT_ROOT / path_str
            if src_path.exists():
                # Görev klasörünü bul (Dosya değil, klasör taşınmalı)
                src_folder = src_path.parent if src_path.is_file() else src_path
                
                # Proje klasörünü bul (Örn: P06-System-...)
                proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(p_id)), None)
                if proj_dir:
                    dest_dir = proj_dir / "completed"
                    dest_dir.mkdir(parents=True, exist_ok=True)
                    dest_path = dest_dir / src_folder.name
                    
                    if src_folder != dest_path:
                        if dest_path.exists(): shutil.rmtree(dest_path)
                        shutil.move(str(src_folder), str(dest_path))
                        
                        # MD dosyasındaki statüyü 'Completed' yap ve yolları güncelle
                        main_md = dest_path / f"{src_folder.name}.md"
                        if main_md.exists():
                            content = main_md.read_text(encoding='utf-8-sig')
                            content = re.sub(r'status:\s*".*?"', 'status: "Completed"', content)
                            content = content.replace(f"/{state}/", "/completed/")
                            safe_write(main_md, content)
                        
                        log_success(f"🏁 OTONOM ARŞİVLEME: {t_id} -> completed")
    
    sync_pulse()
    log_info("💓 Registry Normalize Edildi (V7 Disiplini).")

def move_task(proj_id: str, task_id_raw: Optional[str] = None, target_state: str = "active"):
    proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(proj_id)), None)
    if not proj_dir:
        log_error(f"Proje bulunamadı: {proj_id}")
        return

    tid_prefix = f"{str(task_id_raw).zfill(3)}-"
    src_folder: Optional[Path] = None
    current_state: str = ""
    
    for s in ["backlog", "active", "completed"]:
        s_path = proj_dir / s
        if s_path.exists():
            src_folder = next((d for d in s_path.iterdir() if d.is_dir() and d.name.startswith(tid_prefix)), None)
            if src_folder:
                current_state = s
                break
    
    if not src_folder:
        log_error(f"Görev bulunamadı: {task_id_raw}")
        return

    dest_dir = proj_dir / target_state
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / src_folder.name
    
    if src_folder != dest_path:
        if dest_path.exists(): shutil.rmtree(dest_path)
        shutil.move(str(src_folder), str(dest_path))
        
        # PROTOKOL V7: Taşınan dosyanın içindeki statüyü otonom güncelle
        main_md = dest_path / f"{src_folder.name}.md"
        if main_md.exists():
            content = main_md.read_text(encoding='utf-8-sig')
            new_status = "Executing" if target_state == "active" else "Completed" if target_state == "completed" else "Planning"
            content = re.sub(r'status:\s*".*?"', f'status: "{new_status}"', content)
            # Artifact yollarını da güncelle (backlog -> active)
            content = content.replace(f"/{current_state}/", f"/{target_state}/")
            safe_write(main_md, content)
            
        log_success(f"🚚 Görev Otonom Taşındı: {task_id_raw} -> {target_state}")
        normalize_registry()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub Registry Engine 5.0")
    parser.add_argument("action", choices=["repair", "normalize", "activate", "create-project", "create-task", "remember", "recall", "dashboard", "init"])
    parser.add_argument("project_id", nargs="?", help="Project ID (P01)")
    parser.add_argument("task_id", nargs="?", help="Task ID (008)")
    parser.add_argument("--query", "-q", help="Title / Query")
    parser.add_argument("--fact", "-f", help="Fact")
    parser.add_argument("--limit", "-l", type=int, default=10)
    parser.add_argument("--verbose", "-v", action="store_true", help="Detaylı log")
    
    args = parser.parse_args()
    if args.verbose: VERBOSE = True

    if args.action == "init":
        with RegistryDB() as db: db.sync_from_filesystem()
        normalize_registry()
        log_success("REGISTRY 5.0 BAŞLATILDI (SILENT ENGINE)")
    elif args.action == "normalize": normalize_registry()
    elif args.action == "repair":
        if LOCKS_FILE.exists(): os.remove(LOCKS_FILE)
        normalize_registry()
        log_success("Registry ve Kilitler Onarıldı.")
    elif args.action == "activate":
        if not args.project_id or not args.task_id:
            log_error("Proje ID ve Görev ID gerekli.")
            sys.exit(1)
        move_task(args.project_id, args.task_id, "active")
    elif args.action == "dashboard":
        with RegistryDB() as db:
            db.cursor.execute("SELECT id, title, status, progress FROM tasks WHERE state='active' ORDER BY updated_at DESC")
            print("\n🛰️ REGISTRY DASHBOARD")
            for t in db.cursor.fetchall(): print(f"- [{t[3]}%] {t[0]}: {t[1]} ({t[2]})")
    elif args.action == "create-task":
        if not args.project_id or not args.task_id or not args.query:
            log_error("Proje ID, Görev ID ve Başlık (--query) gerekli.")
            sys.exit(1)
        
        proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(args.project_id)), None)
        if not proj_dir:
            log_error(f"Proje {args.project_id} bulunamadı.")
            sys.exit(1)
            
        slug = turkish_slug(args.query)
        task_folder_name = f"{args.task_id.zfill(3)}-{slug}"
        task_dir = proj_dir / "backlog" / task_folder_name
        task_dir.mkdir(parents=True, exist_ok=True)
        
        # PROTOKOL V7: Dosya adı klasör adıyla aynı olmalı
        md_file = task_dir / f"{task_folder_name}.md"
        
        # PROTOKOL V7: Zorunlu YAML Şablonu
        content = f"""---
id: "{args.task_id.zfill(3)}"
title: "{args.query}"
priority: "High"
status: "Planning"
progress: 0%
project: "{proj_dir.name}"
created_at: "{get_now()}"
updated_at: "{get_now()}"
artifacts:
  brainstorm: "registry/{proj_dir.name}/backlog/{task_folder_name}/brainstorm.md"
  plan: "registry/{proj_dir.name}/backlog/{task_folder_name}/plan.md"
  review: "registry/{proj_dir.name}/backlog/{task_folder_name}/review.md"
---

# 🛠️ {args.task_id.zfill(3)}: {args.query}

## 🎯 Hedefler
- [ ] Görev kapsamını tanımla
- [ ] Uygulama adımlarını planla

## ✅ Alt Görevler
- [ ] Brainstorming aşamasını tamamla
- [ ] Uygulama planını (plan.md) oluştur
"""
        safe_write(md_file, content.strip())
        safe_write(task_dir / "brainstorm.md", f"# 🧠 Brainstorming: {args.query}\n\n## 🚩 Sorun Tanımı\n\n## 🛠️ Çözüm Stratejisi")
        safe_write(task_dir / "plan.md", f"# 📋 Implementation Plan: {args.query}\n\n## 🏁 Hazırlık\n- [ ] Hazırlık adımı 1\n\n## 🛠️ Uygulama\n- [ ] Uygulama adımı 1")
        safe_write(task_dir / "review.md", f"# 🔍 Code Review: {args.query}\n\n## ✅ Kontrol Listesi\n- [ ] Tip güvenliği kontrol edildi\n- [ ] Testler başarılı")
        
        log_success(f"GÖREV PROTOKOLE UYGUN OLUŞTURULDU (BACKLOG): {task_folder_name}")
        normalize_registry()
    elif args.action == "remember": remember(args.fact)
    elif args.action == "recall": recall(limit=args.limit, query=args.query)
    # ... (Diğer aksiyonlar basitleştirilerek devam eder)
