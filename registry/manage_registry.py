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

# Windows PowerShell UTF-8 uyumu
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# REGISTRY ENGINE 7.0 (SENTINEL + NAVIGATOR)
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

def real_content_length(text: str) -> int:
    """Gerçek içerik ölçer: Başlıklar, HTML yorumlar, boş satırlar,
    placeholder'lar ve checkbox işaretleri çıkarıldıktan sonra kalan
    anlamlı metin uzunluğunu döner. Şablon içeriğini '0' olarak ölçer."""
    # HTML comment'leri kaldır (<!-- ... -->)
    cleaned = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    lines = cleaned.split('\n')
    real_lines = []
    for line in lines:
        stripped = line.strip()
        # Boş satırları atla
        if not stripped: continue
        # Markdown başlıklarını atla (# ## ### vs.)
        if stripped.startswith('#'): continue
        # YAML frontmatter satırlarını atla (> **Skill:** vs.)
        if stripped.startswith('>'): continue
        # Checkbox placeholder'larını atla (- [ ] Kriter 1)
        if re.match(r'^-\s*\[[ x]\]\s*(Kriter|Hazırlık adımı|Uygulama adımı)\s*\d*$', stripped, re.IGNORECASE): continue
        # YAML key-value (key: value) satırlarını atla
        if re.match(r'^\w+:', stripped) and len(stripped) < 80: continue
        # Kalan gerçek içeriği topla
        real_lines.append(stripped)
    return len(' '.join(real_lines))

# ── YAPISAL DOĞRULAMA (Structural Validation) ──
# Brainstorm ve Plan dosyalarının "senin istediğin formatta" olup olmadığını denetler.

BRAINSTORM_REQUIRED_SECTIONS = [
    ("goal", [r"#{2,5}\s*(?:🎯\s*)?goal", r"#{2,5}\s*(?:🎯\s*)?hedef"]),
    ("constraints", [r"#{2,5}\s*(?:🚧\s*)?constraints", r"#{2,5}\s*(?:🚧\s*)?kısıtlar", r"#{2,5}\s*(?:🚧\s*)?kısıtlamalar"]),
    ("risks", [r"#{2,5}\s*(?:⚠️\s*)?risks", r"#{2,5}\s*(?:⚠️\s*)?riskler", r"#{2,5}\s*(?:⚠️\s*)?risk"]),
    ("options", [r"#{2,5}\s*(?:🔀\s*)?options", r"#{2,5}\s*(?:🔀\s*)?seçenekler", r"#{2,5}\s*(?:🔀\s*)?alternatifler"]),
    ("recommendation", [r"#{2,5}\s*(?:✅\s*)?recommendation", r"#{2,5}\s*(?:✅\s*)?öneri", r"#{2,5}\s*(?:✅\s*)?tavsiye"]),
]

PLAN_REQUIRED_PATTERNS = [
    ("numbered_steps", r'(?:^|\n)\s*(?:#{1,3}\s*(?:Adım|Step)\s*\d|(?:\d+[\.\)]\s))'),
    ("verify_lines", r'(?i)(?:verify|doğrula|kontrol|test):'),
    ("v2_harmonization", r'(?i)(?:##\s*(?:harmanlama|fine.?state|v2|brainstorm.?kararlar))'),
]

REVIEW_REQUIRED_SECTIONS = [
    ("workflow_signature", [r">\s*\*\*skill:\*\*\s*superpowers-review"]),
    ("summary", [r"#{2,5}\s*(?:✅\s*)?(?:overall\s+)?summary", r"#{2,5}\s*(?:✅\s*)?özet"]),
]

SENTINEL_SALT = "v7_sEnTiNeL_gUaRd_anti_forge_xk9"

def verify_artifact_signature(content: str) -> bool:
    """Artifact içindeki şifreli imzayı çözer ve doğrular."""
    match = re.search(r'<!-- ARTIFACT_SIGNATURE:(\d+):([a-f0-9]+) -->', content)
    if not match: return False
    
    timestamp, provided_sig = match.group(1), match.group(2)
    signature_line = match.group(0)
    original_content = content.replace(signature_line, "").strip()
    
    raw_data = f"{original_content}|{SENTINEL_SALT}|{timestamp}"
    expected_sig = hashlib.sha256(raw_data.encode("utf-8")).hexdigest()
    
    return provided_sig == expected_sig

def sign_artifact(file_path: Path) -> bool:
    """Artifact dosyasına kriptografik ARTIFACT_SIGNATURE basar.
    Girdi: Dosya yolu. Çıktı: True (başarılı) / False (dosya yok).
    Mevcut imza varsa kaldırıp yenisini üretir."""
    if not file_path.exists():
        return False
    content = file_path.read_text(encoding='utf-8-sig').strip()
    # Eski imzayı sil (varsa)
    content = re.sub(r'\n*<!-- ARTIFACT_SIGNATURE:.*? -->', '', content).strip()
    ts = str(int(datetime.datetime.now().timestamp()))
    raw_data = f"{content}|{SENTINEL_SALT}|{ts}"
    sig = hashlib.sha256(raw_data.encode('utf-8')).hexdigest()
    signed_content = f"{content}\n\n<!-- ARTIFACT_SIGNATURE:{ts}:{sig} -->"
    safe_write(file_path, signed_content)
    return True

def auto_sign_task(proj_id: str, task_id_raw: str):
    """Görev klasöründeki brainstorm.md, plan.md, review.md dosyalarını
    tespit eder ve hepsini tek seferde imzalar."""
    proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(proj_id)), None)
    if not proj_dir:
        log_error(f"Proje bulunamadı: {proj_id}")
        sys.exit(1)
    
    tid_prefix = f"{str(task_id_raw).zfill(3)}-"
    src_folder: Optional[Path] = None
    for s in ["backlog", "active", "completed"]:
        s_path = proj_dir / s
        if s_path.exists():
            src_folder = next((d for d in s_path.iterdir() if d.is_dir() and d.name.startswith(tid_prefix)), None)
            if src_folder: break
    
    if not src_folder:
        log_error(f"Görev bulunamadı: {task_id_raw}")
        sys.exit(1)
    
    signed_count = 0
    for artifact_name in ["brainstorm.md", "plan.md", "review.md"]:
        artifact_path = src_folder / artifact_name
        if sign_artifact(artifact_path):
            signed_count += 1
            log_info(f"🔏 İmzalandı: {artifact_name}")
    
    log_success(f"🔏 {signed_count} artifact imzalandı ({src_folder.name})")

def validate_artifact_structure(content: str, artifact_type: str) -> List[str]:
    """Artifact dosyasının yapısal bütünlüğünü ve Kriptografik İmzasını denetler."""
    content_lower = content.lower()
    missing: List[str] = []

    # Zorunlu Otonom Skill İmza Doğrulaması (Tüm artifactler için)
    if not verify_artifact_signature(content):
        missing.append("anti_forgery_signature_failed (Dosya manuel oluşturulmuş! `write_artifact.py` kullanılmalı)")

    if artifact_type == "brainstorm":
        # İmza kontrolü: Workflow üzerinden üretildiğinin kanıtı
        if "superpowers-brainstorm" not in content_lower:
            missing.append("workflow_signature (> **Skill:** superpowers-brainstorm ...)")
        for section_name, variants in BRAINSTORM_REQUIRED_SECTIONS:
            found = any(re.search(v, content, re.IGNORECASE) for v in variants)
            if not found:
                missing.append(f"{section_name} (Format esnekliği sağlandı, beklenen regex kalıplarından biri: {variants[0]})")
        
        # ── OTONOM İZ KORUMASI (TERMINAL TRACES / PROOF OF WORK) ──
        # Ajanın sistemde gerçekten araştırma yaptığını fiziksel olarak ispatlamasını zorunlu kılar
        trace_section = re.search(r'##\s*(?:🕵️\s*)?(?:terminal izleri|execution traces|terminal traces|proof of work)(.*?)(?=##|$)', content, re.IGNORECASE | re.DOTALL)
        if not trace_section:
            missing.append("terminal_traces (## 🕵️ Terminal İzleri bölümü eksik. Projeyi incelediğini kanıtla!)")
        else:
            trace_content = trace_section.group(1).lower()
            if not any(tool in trace_content for tool in ['view_file', 'grep_search', 'list_dir', 'run_command', 'ls', 'dir', 'cat']):
                missing.append("terminal_traces_invalid (İz bölümünde geçerli bir keşif aracı 'view_file', 'grep_search' vb. geçmiyor)")

    elif artifact_type == "plan":
        # İmza kontrolü: Brainstorm referansı olmalı
        if "brainstorm" not in content_lower:
            missing.append("brainstorm_reference (> **Brainstorm:** ...)")
        for pattern_name, regex in PLAN_REQUIRED_PATTERNS:
            if not re.search(regex, content):
                missing.append(pattern_name)

    elif artifact_type == "review":
        for section_name, variants in REVIEW_REQUIRED_SECTIONS:
            found = any(re.search(v, content, re.IGNORECASE) for v in variants)
            if not found:
                missing.append(f"{section_name} (Format esnekliği sağlandı, beklenen regex kalıplarından biri: {variants[0]})")

    return missing

# ── REÇETELİ YÖNLENDİRME (Remediation Guide) ──
# Sentinel ajana hata verdiğinde ne yapması gerektiğini adım adım söyler.
REMEDIATION = {
    "brainstorm_content": """
🚦 YAPILMASI GEREKEN:
   1. Workflow dosyasını oku: .agent/workflows/superpowers-brainstorm.md
   2. brainstorm.md dosyasını aç ve şu bölümleri doldur:
      - ## Goal (Tek cümlelik hedef)
      - ## Constraints (Teknik kısıtlar)
      - ## Risks (Risk seviyesi ve açıklaması)
      - ## Options (En az 2 alternatif çözüm)
      - ## Recommendation (Önerilen çözüm)
      - ## 🕵️ Terminal İzleri (Kullandığın view_file, grep komutlarının ispatı)
   3. Tekrar dene: python registry/manage_registry.py activate <PROJE> <GOREV>""",

    "brainstorm_structure": """
🚦 YAPILMASI GEREKEN:
   1. Workflow dosyasını oku: .agent/workflows/superpowers-brainstorm.md
   2. brainstorm.md dosyasında eksik olan bölümleri ekle.
      Zorunlu bölümler: Goal, Constraints, Risks, Options, Recommendation
   3. Her bölümün altına en az 1-2 cümle anlamlı içerik yaz.
   4. Tekrar dene: python registry/manage_registry.py activate <PROJE> <GOREV>""",

    "plan_content": """
🚦 YAPILMASI GEREKEN:
   1. Workflow dosyasını oku: .agent/workflows/superpowers-write-plan.md
   2. plan.md dosyasını aç ve şu formatta yaz:
      - Numaralı adımlar (Adım 1, Adım 2... veya 1. 2. 3.)
      - Her adımda hangi dosyaların değişeceği
      - Her adımda Verify: doğrulama komutu
   3. Tüm adımlar tiklenmiş [x] olmalı (eğer plan onaylanmışsa)
   4. Tekrar dene: python registry/manage_registry.py progress <PROJE> <GOREV> <DEGER>""",

    "plan_structure": """
🚦 YAPILMASI GEREKEN:
   1. Workflow dosyasını oku: .agent/workflows/superpowers-write-plan.md
   2. plan.md dosyasında şunlar eksik:
      - Numaralı adımlar: '## Adım 1: ...' veya '1. ...' formatında yaz
      - Doğrulama satırları: Her adım sonunda 'Verify: <komut>' ekle
   3. Tekrar dene: python registry/manage_registry.py progress <PROJE> <GOREV> <DEGER>""",

    "plan_review_gate": """
\U0001f6a6 YAPILMASI GEREKEN (Fine-State v2 Kapisi):
   1. Kodlamaya baslamadan ONCE planin review'dan gecmesi gerekir.
   2. review.md dosyasina plan-review bolumu ekle:
      - '## Plan Review' veya '## Plan Degerlendirmesi' basligi
      - superpowers-review skill ciktisi (Blocker/Major/Minor/Nit)
   3. Tekrar dene: python registry/manage_registry.py progress <PROJE> <GOREV> <DEGER>""",

    "review_content": """
🚦 YAPILMASI GEREKEN:
   1. Workflow dosyasını oku: .agent/workflows/superpowers-review.md
   2. review.md dosyasını aç ve şunları yaz:
      - Mimari analiz (Yapılan değişikliklerin teknik değerlendirmesi)
      - Kontrol listesi (tüm maddeler [x] tiklenmiş)
   3. Tekrar dene: python registry/manage_registry.py complete <PROJE> <GOREV>""",
}

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
                
                # PROTOCOL V7: Semantic Review Guard (Otonom Taşıma Koruması)
                review_file = src_folder / "review.md"
                allow_complete = True
                if review_file.exists():
                    rev_content = review_file.read_text(encoding='utf-8-sig').strip()
                    rev_real = real_content_length(rev_content)
                    missing_rev = validate_artifact_structure(rev_content, "review")
                    if "- [ ]" in rev_content or rev_real < 100 or missing_rev: 
                        allow_complete = False
                else: allow_complete = False
                    
                if not allow_complete:
                    missing_str = ", ".join(missing_rev) if 'missing_rev' in locals() and missing_rev else "içerik yetersiz/boş"
                    log_error(f"🚨 [SENTINEL] {t_id} %100 yapıldı ama 'review.md' hatalı (Eksik: {missing_str}). Progress %99'a düşürülüyor.")
                    main_md = src_folder / f"{src_folder.name}.md"
                    if main_md.exists():
                        content = main_md.read_text(encoding='utf-8-sig')
                        content = re.sub(r'progress:\s*100%?', 'progress: 99%', content)
                        content = re.sub(r'status:\s*".*?"', 'status: "Reviewing"', content)
                        safe_write(main_md, content)
                    continue
                
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

def update_progress(proj_id: str, task_id_raw: str, value: int):
    proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(proj_id)), None)
    if not proj_dir:
        log_error(f"Proje bulunamadı: {proj_id}")
        return
    tid_prefix = f"{str(task_id_raw).zfill(3)}-"
    src_folder: Optional[Path] = None
    for s in ["backlog", "active", "completed"]:
        s_path = proj_dir / s
        if s_path.exists():
            src_folder = next((d for d in s_path.iterdir() if d.is_dir() and d.name.startswith(tid_prefix)), None)
            if src_folder: break
    
    if not src_folder:
        log_error(f"Görev bulunamadı: {task_id_raw}")
        return

    # ── LIFECYCLE GUARD: İşe Giriş Kapısı (progress > 0) ──
    # Ajan plan yazmadan VE plan review'dan geçmeden ilerleme kaydedemez!
    if value > 0:
        plan_file = src_folder / "plan.md"
        if plan_file.exists():
            plan_content = plan_file.read_text(encoding='utf-8-sig').strip()
            plan_real = real_content_length(plan_content)
            if "- [ ]" in plan_content:
                log_error(f"🚨 [SENTINEL] {task_id_raw} ilerleyemez! 'plan.md' içinde tiklenmemiş adım var.{REMEDIATION['plan_content']}")
                sys.exit(1)
            if plan_real < 150:
                log_error(f"🚨 [SENTINEL] {task_id_raw} ilerleyemez! 'plan.md' şablon halinde (gerçek içerik: {plan_real} chr, min: 150).{REMEDIATION['plan_content']}")
                sys.exit(1)
            # Yapısal Doğrulama: Adım numaraları, Verify satırları ve v2 Harmanlama var mı?
            plan_missing = validate_artifact_structure(plan_content, "plan")
            if plan_missing:
                missing_labels = {
                    'numbered_steps': 'Numaralı adımlar (Adım 1, Step 1, 1.)',
                    'verify_lines': 'Doğrulama satırları (Verify:)',
                    'v2_harmonization': 'v2 Harmanlama bölümü (## Harmanlama / ## Fine-State)',
                }
                readable = [missing_labels.get(m, m) for m in plan_missing]
                log_error(f"🚨 [SENTINEL] {task_id_raw} ilerleyemez! 'plan.md' formatı eksik. Eksik: {', '.join(readable)}.{REMEDIATION['plan_structure']}")
                sys.exit(1)
        else:
            log_error(f"🚨 [SENTINEL] {task_id_raw} ilerleyemez! 'plan.md' dosyası bulunamadı. Plansız kod yazamazsın.")
            sys.exit(1)
        
        # ── FINE-STATE v2 KAPISI: Plan Review Guard ──
        # Kodlamaya başlamadan ÖNCE plan superpowers-review'dan geçmiş olmalı
        review_file = src_folder / "review.md"
        if review_file.exists():
            rev_content = review_file.read_text(encoding='utf-8-sig').lower()
            has_plan_review = any(marker in rev_content for marker in [
                '## plan review', '## plan değerlendirmesi', '## plan-review',
                '## plan onay', '## fine-state review'
            ])
            if not has_plan_review:
                log_error(f"🚨 [SENTINEL v2] {task_id_raw} ilerleyemez! Fine-State v2 gereği: Plan, kodlamadan ÖNCE review'dan geçmeli.{REMEDIATION['plan_review_gate']}")
                sys.exit(1)
        else:
            log_error(f"🚨 [SENTINEL v2] {task_id_raw} ilerleyemez! review.md bulunamadı. Plan review olmadan kod yazamazsın.{REMEDIATION['plan_review_gate']}")
            sys.exit(1)

    main_md = src_folder / f"{src_folder.name}.md"
    if main_md.exists():
        content = main_md.read_text(encoding='utf-8-sig')
        content = re.sub(r'progress:\s*\d+%?', f'progress: {value}%', content)
        content = re.sub(r'updated_at:\s*".*?"', f'updated_at: "{get_now()}"', content)
        safe_write(main_md, content)
        log_success(f"📊 İlerleme Güncellendi: {task_id_raw} -> {value}%")
        normalize_registry()

def complete_task(proj_id: str, task_id_raw: str):
    update_progress(proj_id, task_id_raw, 100)
    move_task(proj_id, task_id_raw, "completed")
    try:
        import subprocess
        log_info("🧠 corpus-callosum Indexer tetikleniyor...")
        env_python = PROJECT_ROOT / ".gemini" / "antigravity" / "memory" / "memory-env" / "Scripts" / "python.exe"
        indexer_script = PROJECT_ROOT / "memory-engine" / "memory_indexer.py"
        if env_python.exists() and indexer_script.exists():
            # FIX #2: Biten gorev klasorundeki plan.md dosyasini delta olarak indexle
            # (eski kod: bos kanca - sadece print yapiyordu)
            proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(proj_id)), None)
            if proj_dir:
                tid_prefix = f"{str(task_id_raw).zfill(3)}-"
                task_folder = next(
                    (d for d in (proj_dir / "completed").iterdir() if d.is_dir() and d.name.startswith(tid_prefix)),
                    None
                )
                if task_folder:
                    plan_file = task_folder / "plan.md"
                    if plan_file.exists():
                        subprocess.Popen(
                            [str(env_python), str(indexer_script), "--file", str(plan_file)],
                            cwd=str(PROJECT_ROOT)
                        )
                        log_info(f"🧠 {plan_file.name} hafızaya alınıyor...")
    except Exception as e:
        log_error(f"Hafıza motoru tetiklenemedi: {e}")

def auto_lifecycle(proj_id: str, task_id_raw: str, target: str):
    """Zincirleme Otomasyon: Doğrula → İmzala → Geçir.
    
    Kullanım:
      auto-lifecycle P02 004 activate  → brainstorm doğrula + imzala + aktifleştir
      auto-lifecycle P02 004 complete  → plan+review doğrula + imzala + tamamla
    
    Neden hata vermez: İmzayı kendisi bastığı için imza eksikliği hatası ortadan kalkar.
    Tek hata kaynağı: İçerik yetersizliği (meşru Sentinel koruması).
    """
    # 1. Görev klasörünü bul
    proj_dir = next((d for d in REGISTRY_DIR.iterdir() if d.is_dir() and d.name.startswith(proj_id)), None)
    if not proj_dir:
        log_error(f"Proje bulunamadı: {proj_id}")
        sys.exit(1)
    
    tid_prefix = f"{str(task_id_raw).zfill(3)}-"
    src_folder: Optional[Path] = None
    for s in ["backlog", "active", "completed"]:
        s_path = proj_dir / s
        if s_path.exists():
            src_folder = next((d for d in s_path.iterdir() if d.is_dir() and d.name.startswith(tid_prefix)), None)
            if src_folder: break
    
    if not src_folder:
        log_error(f"Görev bulunamadı: {task_id_raw}")
        sys.exit(1)
    
    # 2. Hedef duruma göre doğrulama (İMZA HARİÇ — onu biz basacağız)
    if target == "activate":
        bs_file = src_folder / "brainstorm.md"
        if not bs_file.exists():
            log_error(f"brainstorm.md bulunamadı. Önce brainstorm yaz.")
            sys.exit(1)
        bs_content = bs_file.read_text(encoding='utf-8-sig').strip()
        bs_real = real_content_length(bs_content)
        if bs_real < 100:
            log_error(f"brainstorm.md içeriği yetersiz ({bs_real} chr, min: 100).{REMEDIATION['brainstorm_content']}")
            sys.exit(1)
        # Yapısal doğrulama (İMZA HARİÇ — anti_forgery_signature kontrolünü atla)
        bs_missing = validate_artifact_structure(bs_content, "brainstorm")
        bs_missing = [m for m in bs_missing if "anti_forgery" not in m]
        if bs_missing:
            log_error(f"brainstorm.md yapısı eksik: {', '.join(bs_missing)}.{REMEDIATION['brainstorm_structure']}")
            sys.exit(1)
    
    elif target == "complete":
        plan_file = src_folder / "plan.md"
        review_file = src_folder / "review.md"
        # Plan kontrolü
        if plan_file.exists():
            plan_content = plan_file.read_text(encoding='utf-8-sig').strip()
            if real_content_length(plan_content) < 150:
                log_error(f"plan.md içeriği yetersiz.{REMEDIATION['plan_content']}")
                sys.exit(1)
            plan_missing = validate_artifact_structure(plan_content, "plan")
            plan_missing = [m for m in plan_missing if "anti_forgery" not in m]
            if plan_missing:
                missing_labels = {'numbered_steps': 'Numaralı adımlar', 'verify_lines': 'Doğrulama satırları (Verify:)'}
                readable = [missing_labels.get(m, m) for m in plan_missing]
                log_error(f"plan.md formatı eksik: {', '.join(readable)}.{REMEDIATION['plan_structure']}")
                sys.exit(1)
        # Review kontrolü
        if review_file.exists():
            rev_content = review_file.read_text(encoding='utf-8-sig').strip()
            rev_missing = validate_artifact_structure(rev_content, "review")
            rev_missing = [m for m in rev_missing if "anti_forgery" not in m]
            if rev_missing:
                log_error(f"review.md yapısı eksik: {', '.join(rev_missing)}.{REMEDIATION['review_content']}")
                sys.exit(1)
    else:
        log_error(f"Geçersiz hedef: '{target}'. Kullanım: activate veya complete")
        sys.exit(1)
    
    # 3. Doğrulama geçti → Tüm artifact'ları otomatik imzala
    auto_sign_task(proj_id, task_id_raw)
    
    # 4. Durum geçişini yap (artık imza tamam, Sentinel geçer)
    if target == "activate":
        move_task(proj_id, task_id_raw, "active")
    elif target == "complete":
        complete_task(proj_id, task_id_raw)

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

    # ── LIFECYCLE GUARD: Backlog → Active ──
    if target_state == "active":
        # Guard 1: brainstorm.md gerçekten doldurulmuş mu?
        bs_file = src_folder / "brainstorm.md"
        if bs_file.exists():
            bs_content = bs_file.read_text(encoding='utf-8-sig').strip()
            bs_real = real_content_length(bs_content)
            if bs_real < 100:
                log_error(f"🚨 [SENTINEL] {task_id_raw} aktifleştirilemez! 'brainstorm.md' şablon halinde (gerçek içerik: {bs_real} chr, min: 100).{REMEDIATION['brainstorm_content']}")
                sys.exit(1)
            # Yapısal Doğrulama: Zorunlu bölümler var mı?
            bs_missing = validate_artifact_structure(bs_content, "brainstorm")
            if bs_missing:
                log_error(f"🚨 [SENTINEL] {task_id_raw} aktifleştirilemez! 'brainstorm.md' formatı eksik. Eksik bölümler: {', '.join(bs_missing)}.{REMEDIATION['brainstorm_structure']}")
                sys.exit(1)
        else:
            log_error(f"🚨 [SENTINEL] {task_id_raw} aktifleştirilemez! 'brainstorm.md' dosyası bulunamadı.")
            sys.exit(1)

        # Guard 2: Bağımlılık kontrolü
        main_md = src_folder / f"{src_folder.name}.md"
        if main_md.exists():
            content_for_meta = main_md.read_text(encoding='utf-8-sig')
            meta = parse_metadata(content_for_meta)
            depends_on = meta.get('depends_on', [])
            if isinstance(depends_on, list):
                with RegistryDB() as db:
                    for dep in depends_on:
                        dep_id = f"{proj_id}/{str(dep).zfill(3)}"
                        db.cursor.execute("SELECT state FROM tasks WHERE id=?", (dep_id,))
                        row = db.cursor.fetchone()
                        if row and row[0] != 'completed':
                            log_error(f"⚠️ BAĞIMLILIK UYARISI: {dep_id} henüz tamamlanmadı!")

    # ── LIFECYCLE GUARD: Active → Completed ──
    if target_state == "completed":
        # Guard: review.md dolu mu? (plan.md zaten giriş kapısında denetlendi)
        review_file = src_folder / "review.md"
        allow_complete = True
        missing_rev = []
        if review_file.exists():
            rev_content = review_file.read_text(encoding='utf-8-sig').strip()
            rev_real = real_content_length(rev_content)
            missing_rev = validate_artifact_structure(rev_content, "review")
            if "- [ ]" in rev_content or rev_real < 100 or missing_rev:
                allow_complete = False
        else: allow_complete = False
        
        if not allow_complete:
            missing_str = ", ".join(missing_rev) if missing_rev else "içerik eksik/boş veya şablon (- [ ]) düzeltilmemiş"
            log_error(f"🚨 [SENTINEL GUARD] {task_id_raw} kapatılamaz! 'review.md' hatalı. Eksik: {missing_str}. {REMEDIATION['review_content']}")
            sys.exit(1)

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
            # Backlog'a geri çekilirken progress sıfırla
            if target_state == "backlog":
                content = re.sub(r'progress:\s*\d+%?', 'progress: 0%', content)
            # Artifact yollarını da güncelle (backlog -> active)
            content = content.replace(f"/{current_state}/", f"/{target_state}/")
            safe_write(main_md, content)
            
        log_success(f"🚚 Görev Otonom Taşındı: {task_id_raw} -> {target_state}")
        normalize_registry()

def list_all():
    """Tüm projeleri ve görevleri durumlarıyla listeler."""
    with RegistryDB() as db:
        db.sync_from_filesystem()
        db.cursor.execute("SELECT id, name FROM projects ORDER BY id")
        projects = db.cursor.fetchall()
        if not projects:
            print("⚠️ Hiç proje bulunamadı. Önce 'init' çalıştır.")
            return
        for p_id, p_name in projects:
            print(f"\n📁 {p_name}")
            for state_label, state in [("⚡ Aktif", "active"), ("⏳ Backlog", "backlog"), ("✅ Tamamlanan", "completed")]:
                db.cursor.execute("SELECT id, title, status, progress FROM tasks WHERE project_id=? AND state=? ORDER BY id", (p_id, state))
                tasks = db.cursor.fetchall()
                if tasks:
                    print(f"  {state_label}:")
                    for t in tasks:
                        print(f"    - [{t[3]}%] {t[0]}: {t[1]} ({t[2]})")

def next_action():
    """OTONOM NAVİGATÖR: Ajanın bir sonraki adımını tespit eder ve reçeteyle söyler."""
    with RegistryDB() as db:
        db.sync_from_filesystem()

        # 1. Öncelik: Aktif görev var mı?
        db.cursor.execute("SELECT id, title, project_id, status, progress, path FROM tasks WHERE state='active' ORDER BY updated_at DESC LIMIT 1")
        active = db.cursor.fetchone()

        if active:
            t_id, title, proj_id, status, progress, path_str = active
            task_num = t_id.split('/')[-1]
            # Proje ismi
            db.cursor.execute("SELECT name FROM projects WHERE id=?", (proj_id,))
            proj_row = db.cursor.fetchone()
            proj_name = proj_row[0] if proj_row else proj_id

            # Görev klasörünü bul
            src_path = PROJECT_ROOT / path_str if path_str else None
            src_folder = src_path.parent if src_path and src_path.is_file() else src_path

            print(f"\n🎯 AKTİF GÖREV: {t_id} - {title}")
            print(f"   Proje: {proj_name} | Durum: {status} | İlerleme: {progress}%")

            if src_folder and src_folder.exists():
                # Yaşam döngüsü tespiti
                bs_file = src_folder / "brainstorm.md"
                plan_file = src_folder / "plan.md"
                review_file = src_folder / "review.md"

                bs_ok = bs_file.exists() and real_content_length(bs_file.read_text(encoding='utf-8-sig')) >= 100 and not validate_artifact_structure(bs_file.read_text(encoding='utf-8-sig'), 'brainstorm')
                plan_ok = plan_file.exists() and real_content_length(plan_file.read_text(encoding='utf-8-sig')) >= 150 and '- [ ]' not in plan_file.read_text(encoding='utf-8-sig') and not validate_artifact_structure(plan_file.read_text(encoding='utf-8-sig'), 'plan')
                review_ok = review_file.exists() and real_content_length(review_file.read_text(encoding='utf-8-sig')) >= 100 and '- [ ]' not in review_file.read_text(encoding='utf-8-sig')

                if not bs_ok:
                    print(f"\n🚦 SIRADAKİ ADIM: Brainstorm yaz")
                    print(f"   Dosya: {bs_file.relative_to(PROJECT_ROOT)}")
                    print(f"   Format: .agent/workflows/superpowers-brainstorm.md")
                    print(f"   Sonra: python registry/manage_registry.py activate {proj_name} {task_num}")
                elif not plan_ok:
                    print(f"\n🚦 SIRADAKİ ADIM: Plan yaz")
                    print(f"   Dosya: {plan_file.relative_to(PROJECT_ROOT)}")
                    print(f"   Format: .agent/workflows/superpowers-write-plan.md")
                    print(f"   Sonra: python registry/manage_registry.py progress {proj_name} {task_num} 10")
                elif progress < 100 and not review_ok:
                    print(f"\n🚦 SIRADAKİ ADIM: Kodu uygula ve ilerlemeyi güncelle")
                    print(f"   plan.md dosyasındaki adımları sırayla uygula.")
                    print(f"   Her adımdan sonra: python registry/manage_registry.py progress {proj_name} {task_num} <YUZDE>")
                elif not review_ok:
                    print(f"\n🚦 SIRADAKİ ADIM: Review yaz")
                    print(f"   Dosya: {review_file.relative_to(PROJECT_ROOT)}")
                    print(f"   Format: .agent/workflows/superpowers-review.md")
                    print(f"   Sonra: python registry/manage_registry.py complete {proj_name} {task_num}")
                else:
                    print(f"\n✅ Tüm adımlar tamam! Görevi kapat:")
                    print(f"   python registry/manage_registry.py complete {proj_name} {task_num}")
            return

        # 2. Aktif görev yok: Backlog'dan en yüksek öncelikli görevi öner
        db.cursor.execute("SELECT id, title, project_id, path FROM tasks WHERE state='backlog' ORDER BY priority DESC, id ASC LIMIT 1")
        backlog = db.cursor.fetchone()

        if backlog:
            t_id, title, proj_id, path_str = backlog
            task_num = t_id.split('/')[-1]
            db.cursor.execute("SELECT name FROM projects WHERE id=?", (proj_id,))
            proj_row = db.cursor.fetchone()
            proj_name = proj_row[0] if proj_row else proj_id

            print(f"\n⏳ SIRADAKİ GÖREV (Backlog): {t_id} - {title}")
            print(f"   Proje: {proj_name}")
            print(f"\n🚦 YAPILMASI GEREKEN:")
            print(f"   1. Brainstorm yaz: {path_str.replace(path_str.split('/')[-1], 'brainstorm.md') if path_str else 'brainstorm.md'}")
            print(f"      Format: .agent/workflows/superpowers-brainstorm.md")
            print(f"   2. Aktifleştir: python registry/manage_registry.py activate {proj_name} {task_num}")
        else:
            print("\n✅ Tüm görevler tamamlandı! Yeni görev oluşturmak için:")
            print("   python registry/manage_registry.py create-task <PROJE> <ID> --query \"Görev Başlığı\"")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Registry Engine 7.0 (Sentinel + Navigator)")
    parser.add_argument("action", choices=["repair", "normalize", "reindex", "activate", "backlog", "complete", "progress", "create-project", "create-task", "remember", "recall", "dashboard", "list", "next", "init", "auto-sign", "auto-lifecycle", "rag"])
    parser.add_argument("project_id", nargs="?", help="Project ID (P01)")
    parser.add_argument("task_id", nargs="?", help="Task ID (008)")
    parser.add_argument("value", nargs="?", help="Progress value or lifecycle target (activate/complete)")
    parser.add_argument("--query", "-q", help="Title / Query")
    parser.add_argument("--fact", "-f", help="Fact")
    parser.add_argument("--description", "-d", help="Task Description")
    parser.add_argument("--complexity", "-c", choices=["trivial", "low", "medium", "high", "expert"], default="medium", help="Task complexity model routing")
    parser.add_argument("--limit", "-l", type=int, default=10)
    parser.add_argument("--verbose", "-v", action="store_true", help="Detaylı log")
    
    args = parser.parse_args()
    if args.verbose: VERBOSE = True

    if args.action in ("init", "reindex"):
        with RegistryDB() as db: db.sync_from_filesystem()
        normalize_registry()
        if args.action == "init":
            log_success("REGISTRY 5.0 BAŞLATILDI (SILENT ENGINE)")
        else:
            log_success("REGISTRY YENİDEN İNDEKSLENDİ (REINDEXED)")
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
    elif args.action == "backlog":
        if not args.project_id or not args.task_id:
            log_error("Proje ID ve Görev ID gerekli.")
            sys.exit(1)
        move_task(args.project_id, args.task_id, "backlog")
    elif args.action == "complete":
        if not args.project_id or not args.task_id:
            log_error("Proje ID ve Görev ID gerekli.")
            sys.exit(1)
        complete_task(args.project_id, args.task_id)
    elif args.action == "progress":
        if not args.project_id or not args.task_id or args.value is None:
            log_error("Proje ID, Görev ID ve Value gerekli.")
            sys.exit(1)
        try:
            progress_val = int(args.value)
        except ValueError:
            log_error(f"Progress değeri sayı olmalı: '{args.value}'")
            sys.exit(1)
        update_progress(args.project_id, args.task_id, progress_val)
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
        
        model_map = {
            "trivial": "Gemini 3 Flash",
            "low": "Gemini 3.1 Pro (Low)",
            "medium": "Gemini 3.1 Pro (High)",
            "high": "Claude 4.6 Sonnet",
            "expert": "Claude 4.6 Opus"
        }
        model_name = model_map.get(args.complexity, "Gemini 3.1 Pro (High)")
        
        # PROTOKOL V7: Zorunlu YAML Şablonu
        desc_text = args.description if args.description else "Görev kapsamını tanımla"
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

> **Önerilen Model:** {model_name} *(Kategori: {args.complexity.capitalize()})*

# 🛠️ {args.task_id.zfill(3)}: {args.query}

## 🎯 Hedefler
- [ ] {desc_text}
- [ ] Uygulama adımlarını planla

## ✅ Alt Görevler
- [ ] Brainstorming aşamasını tamamla (brainstorm.md)
- [ ] Uygulama planını oluştur (plan.md)
- [ ] Kod uygulamasını tamamla
- [ ] Code Review yap (review.md)
- [ ] Görevi kapat (complete)
"""
        safe_write(md_file, content.strip())
        safe_write(task_dir / "brainstorm.md", f"# 🧠 Brainstorming: {args.query}\n\n## 🚩 Sorun Tanımı\n\n## 🛠️ Çözüm Stratejisi")
        safe_write(task_dir / "plan.md", f"# 📋 Implementation Plan: {args.query}\n\n## 🏁 Hazırlık\n- [ ] Hazırlık adımı 1\n\n## 🛠️ Uygulama\n- [ ] Uygulama adımı 1")
        safe_write(task_dir / "review.md", f"# 🔍 Code Review: {args.query}\n\n## ✅ Kontrol Listesi\n- [ ] Tip güvenliği kontrol edildi\n- [ ] Testler başarılı")
        
        log_success(f"GÖREV PROTOKOLE UYGUN OLUŞTURULDU (BACKLOG): {task_folder_name}")
        normalize_registry()
    elif args.action == "auto-sign":
        if not args.project_id or not args.task_id:
            log_error("Proje ID ve Görev ID gerekli.")
            sys.exit(1)
        auto_sign_task(args.project_id, args.task_id)
    elif args.action == "auto-lifecycle":
        if not args.project_id or not args.task_id or not args.value:
            log_error("Kullanım: auto-lifecycle <PROJE> <GÖREV> <activate|complete>")
            log_error("  Örnek: auto-lifecycle P02 004 activate")
            sys.exit(1)
        target = str(args.value).lower()
        if target not in ("activate", "complete"):
            log_error(f"Geçersiz hedef: '{target}'. 'activate' veya 'complete' olmalı.")
            sys.exit(1)
        auto_lifecycle(args.project_id, args.task_id, target)
    elif args.action == "remember": remember(args.fact)
    elif args.action == "recall": recall(limit=args.limit, query=args.query)
    elif args.action == "rag":
        if not args.query:
            log_error("RAG sorgusu için --query gerekli.")
            sys.exit(1)
        try:
            import subprocess
            env_python = PROJECT_ROOT / ".gemini" / "antigravity" / "memory" / "memory-env" / "Scripts" / "python.exe"
            retriever_script = PROJECT_ROOT / "memory-engine" / "memory_retriever.py"
            if env_python.exists() and retriever_script.exists():
                subprocess.run([str(env_python), str(retriever_script), args.query], cwd=str(PROJECT_ROOT))
            else:
                log_error("RAG Altyapısı (memory-engine) bulunamadı.")
        except Exception as e:
            log_error(f"RAG Hatası: {e}")
    elif args.action == "list": list_all()
    elif args.action == "next": next_action()
