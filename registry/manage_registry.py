import os
import sys
import argparse
import re
import datetime
import shutil
import sqlite3
import json
from typing import List, Dict, Any, Optional

# VENTHUB REGISTRY 3.5 (V7 PERFECT SEALER)
# Bu sürüm, mükerrer ID'leri temizler, Türkçe karakterleri ASCII'ye çevirir 
# ve leaf-folder yapısını fiziksel olarak doğrular.

REGISTRY_DIR: str = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT: str = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
DB_FILE: str = os.path.join(REGISTRY_DIR, "registry.db")
INDEX_JSON: str = os.path.join(REGISTRY_DIR, "index.json")

def get_now() -> str:
    return str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

def turkish_slug(text: str) -> str:
    """İsimden tüm ID ve kirli karakterleri temizleyip saf ASCII slug üretir."""
    # 1. Başlıktaki tüm ID varyasyonlarını temizle (033:, 033-, 033_, 033 )
    text = re.sub(r'^\d{3}[:\-_\s]*', '', text)
    # 2. Eğer hala ID kalmışsa (mükerrer ID durumu) bir kez daha temizle
    text = re.sub(r'^\d{3}[:\-_\s]*', '', text)
    
    # 3. Türkçe karakter eşleme
    mapping = str.maketrans("çğışıöüÇĞİŞIÖÜ", "cgisiouCGISIOU")
    text = text.translate(mapping).lower()
    
    # 4. Saf ASCII slug
    text = re.sub(r'[^a-z0-9-]', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text[:40] # Çok uzun isimleri kısıtla

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

def update_file_internal_links(file_path: str, new_proj: str, new_state: str, slug: str):
    """Metadata ve artifact yollarını fiziksel konuma mühürler."""
    if not os.path.exists(file_path): return
    with open(file_path, 'r', encoding='utf-8') as f: content = f.read()

    new_status = "Executing" if new_state == "active" else "Completed" if new_state == "completed" else "Planning"
    content = re.sub(r'status:\s*".*?"', f'status: "{new_status}"', content)
    content = re.sub(r'project:\s*".*?"', f'project: "{new_proj}"', content)
    
    def fix_path(match):
        prefix = match.group(1)
        filename = match.group(2).split('/')[-1]
        new_path = f"registry/{new_proj}/{new_state}/{slug}/{filename}"
        return f'{prefix}"{new_path}"'

    content = re.sub(r'(\w+:\s*)"(registry/.*?)"', fix_path, content)
    content = re.sub(r'updated_at:\s*".*?"', f'updated_at: "{get_now()}"', content)

    with open(file_path, 'w', encoding='utf-8') as f: f.write(content)

class RegistryDB:
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self.init_db()

    def get_conn(self): return sqlite3.connect(self.db_path)

    def init_db(self):
        with self.get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('CREATE TABLE IF NOT EXISTS tasks (id TEXT, title TEXT, project_id TEXT, state TEXT, status TEXT, path TEXT, PRIMARY KEY (id, project_id))')
            conn.commit()
        self.sync()

    def sync(self):
        projects = sorted([d for d in os.listdir(REGISTRY_DIR) if d.startswith("P") and os.path.isdir(os.path.join(REGISTRY_DIR, d))])
        index_data: Dict[str, Any] = {"generated_at": get_now(), "tasks": {}}
        with self.get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM tasks')
            for p in projects:
                for s in ["backlog", "active", "completed"]:
                    s_path = os.path.join(REGISTRY_DIR, p, s)
                    if os.path.exists(s_path):
                        for slug in os.listdir(s_path):
                            if os.path.isdir(os.path.join(s_path, slug)):
                                md_file = os.path.join(s_path, slug, f"{slug}.md")
                                if os.path.exists(md_file):
                                    tid = slug.split("-")[0].zfill(3)
                                    rel_path = os.path.relpath(md_file, PROJECT_ROOT).replace('\\', '/')
                                    index_data["tasks"][f"{p}/{tid}"] = {"id": tid, "project": p, "state": s, "path": rel_path}
            conn.commit()
        with open(INDEX_JSON, 'w', encoding='utf-8') as jf: json.dump(index_data, jf, indent=2, ensure_ascii=False)

def normalize_registry(db: RegistryDB):
    """V7 Pure Hierarchy - Deep Sealer (Cleanup IDs and Typos)"""
    print("\n🛠️ Registry V7 Derin Onarım ve Mühürleme Başlatıldı...")
    protocol_keywords = ["brainstorm", "plan", "review", "strategy"]
    
    projects = [d for d in os.listdir(REGISTRY_DIR) if re.match(r'^P\d{2}', d) and os.path.isdir(os.path.join(REGISTRY_DIR, d))]
    
    for p_dir in projects:
        p_path = os.path.join(REGISTRY_DIR, p_dir)
        for state in ['active', 'backlog', 'completed']:
            state_path = os.path.join(p_path, state)
            if not os.path.exists(state_path): os.makedirs(state_path, exist_ok=True); continue
            
            # 1. Sızıntıları (Loose Files) ve Mükerrerleri Onar
            for item in os.listdir(state_path):
                i_path = os.path.join(state_path, item)
                if item.startswith('.') or item == ".gitkeep": continue
                
                # Metadata üzerinden Source of Truth bul
                tid = "000"; title = item
                if os.path.isfile(i_path) and item.endswith('.md'):
                    with open(i_path, 'r', encoding='utf-8') as f: meta = parse_metadata(f.read())
                    tid = str(meta.get('id', '000')).zfill(3)
                    title = meta.get('title', item.replace('.md', ''))
                elif os.path.isdir(i_path):
                    md_files = [f for f in os.listdir(i_path) if f.endswith('.md')]
                    if md_files:
                        main_md_name = next((f for f in md_files if not any(k in f.lower() for k in protocol_keywords)), md_files[0])
                        with open(os.path.join(i_path, main_md_name), 'r', encoding='utf-8') as f: meta = parse_metadata(f.read())
                        tid = str(meta.get('id', '000')).zfill(3)
                        title = meta.get('title', item)

                # TEMİZ VE TEKİL SLUG OLUŞTUR
                final_slug = f"{tid}-{turkish_slug(title)}"
                target_dir = os.path.join(state_path, final_slug)
                
                if i_path != target_dir:
                    os.makedirs(target_dir, exist_ok=True)
                    if os.path.isfile(i_path):
                        shutil.move(i_path, os.path.join(target_dir, f"{final_slug}.md"))
                    elif os.path.isdir(i_path):
                        for f in os.listdir(i_path):
                            src_f = os.path.join(i_path, f); dst_f = os.path.join(target_dir, f)
                            if not os.path.exists(dst_f): shutil.move(src_f, dst_f)
                        shutil.rmtree(i_path)
                    i_path = target_dir; item = final_slug
                    print(f"  ✅ Onarıldı: {final_slug}")

                # 2. İÇERİK MÜHÜRLEME (Folder Name == File Name)
                main_md = f"{item}.md"
                main_md_path = os.path.join(i_path, main_md)
                
                # Ana dosyayı fiziksel olarak düzelt (Overkill Protection)
                for f in os.listdir(i_path):
                    f_path = os.path.join(i_path, f)
                    if f.endswith('.md') and f != main_md and not any(k in f.lower() for k in protocol_keywords):
                        if not os.path.exists(main_md_path):
                            os.rename(f_path, main_md_path)
                        else:
                            os.remove(f_path) # Gereksiz mükerrer dosyayı temizle
                
                # Metadata Linklerini Mühürle
                if os.path.exists(main_md_path):
                    update_file_internal_links(main_md_path, p_dir, state, item)
                    for art in os.listdir(i_path):
                        if art.endswith('.md'): update_file_internal_links(os.path.join(i_path, art), p_dir, state, item)
    db.sync()
    print("🚀 Registry V7 Saf Hiyerarşi Kusursuz Olarak Mühürlendi.")

if __name__ == "__main__":
    db = RegistryDB()
    parser = argparse.ArgumentParser(description="VentHub Registry 3.5 Perfect Sealer")
    parser.add_argument("action", choices=["repair", "reindex", "normalize"])
    args = parser.parse_args()
    try:
        if args.action in ["normalize", "repair"]: normalize_registry(db)
        elif args.action == "reindex": db.sync()
    except Exception as e: print(f"\n[🚨 KAZA] {e}")
