import os
import sys
import argparse
import re
import datetime
import shutil
from typing import List, Tuple, Dict, Any, Optional

# Konfigürasyon
REGISTRY_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
SNAPSHOT_DIR = os.path.join(REGISTRY_DIR, ".snapshots")

def get_now() -> str:
    """Şu anki zamanı standart formatta döner."""
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def get_next_id(project_folder: str, is_test: bool = False) -> str:
    """Proje içindeki bir sonraki müsait görev ID'sini döner."""
    project_path = os.path.join(REGISTRY_DIR, project_folder)
    ids = []
    
    # Tüm durum klasörlerini tara
    for state in ["backlog", "active", "completed"]:
        state_path = os.path.join(project_path, state)
        if os.path.exists(state_path):
            for item in os.listdir(state_path):
                # item'ın bir string olduğundan eminiz (os.listdir)
                folder_str = str(item)
                match = re.match(r'^(\d{3})-', folder_str)
                if match:
                    ids.append(int(match.group(1)))
    
    if is_test:
        # Test ID'leri 900'den başlar
        test_ids = [i for i in ids if i >= 900]
        next_id = max(test_ids) + 1 if test_ids else 900
        if next_id > 999: next_id = 900 # Başa dön
    else:
        # Normal ID'ler 1'den başlar, 899'a kadar
        normal_ids = [i for i in ids if i < 900]
        next_id = max(normal_ids) + 1 if normal_ids else 1
        if next_id > 899:
            print("[!] Uyarı: Normal ID havuzu doldu (899)! Lütfen manuel ID belirleyin.")
    
    return str(next_id).zfill(3)

def create_gitkeep(path: str) -> None:
    """Verilen yolda .gitkeep dosyası oluşturur."""
    gitkeep_path = os.path.join(path, ".gitkeep")
    if not os.path.exists(gitkeep_path):
        with open(gitkeep_path, 'w') as f:
            pass
        print(f"    [+] Bariyer oluşturuldu: {gitkeep_path}")

def create_snapshot(project_folder: str, task_folder: str, state: str) -> None:
    """Görevin o anki durumunun klasör olarak tam bir yedeğini alır."""
    try:
        if not os.path.exists(SNAPSHOT_DIR):
            os.makedirs(SNAPSHOT_DIR)
            create_gitkeep(SNAPSHOT_DIR)

        task_dir_path = os.path.join(REGISTRY_DIR, project_folder, state, task_folder)
        
        if not os.path.exists(task_dir_path):
            return

        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_proj_dir = os.path.join(SNAPSHOT_DIR, project_folder)
        
        folder_parts = task_folder.split('-')
        task_id_part = folder_parts[0] if folder_parts else "unknown"
        
        # Snapshot artık bir KLASÖR
        snapshot_task_root = os.path.join(snapshot_proj_dir, task_id_part)
        snapshot_target_dir = os.path.join(snapshot_task_root, f"{timestamp}_{state}")
        
        if not os.path.exists(snapshot_task_root):
            os.makedirs(snapshot_task_root)

        # Tüm klasörü kopyala
        shutil.copytree(task_dir_path, snapshot_target_dir)
        print(f"    [📸 SNAPSHOT] Görev klasörü yedeklendi: {timestamp}_{state}")
    except Exception as e:
        print(f"    [!] Snapshot hatası: {str(e)}")

def parse_metadata(content: str) -> Dict[str, Any]:
    """Markdown dosyasındaki YAML bloklarını basitçe parse eder."""
    # CRLF uyumlu regex
    match = re.search(r'^---\s*\r?\n(.*?)\r?\n---', content, re.DOTALL | re.MULTILINE)
    if not match:
        # Fallback for plain \n
        match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL | re.MULTILINE)
    if not match:
        return {}
    
    yaml_text = match.group(1)
    metadata: Dict[str, Any] = {}
    for line in yaml_text.split('\n'):
        if ':' in line:
            parts = line.split(':', 1)
            key = parts[0].strip()
            val = parts[1].strip().strip('"').strip("'")
            if val.lower() == 'null' or val == '':
                metadata[key] = None
            elif val.startswith('[') and val.endswith(']'):
                metadata[key] = [v.strip().strip('"').strip("'") for v in val[1:-1].split(',') if v.strip()]
            else:
                metadata[key] = val
    return metadata

def is_task_completed(task_id: str) -> bool:
    """Verilen görev ID'sinin herhangi bir projede 'completed' olup olmadığını kontrol eder."""
    tid_pattern = f"{task_id.zfill(3)}-"
    for proj in os.listdir(REGISTRY_DIR):
        proj_path = os.path.join(REGISTRY_DIR, proj)
        if not os.path.isdir(proj_path) or not proj.startswith("P"):
            continue
        
        comp_dir = os.path.join(proj_path, "completed")
        if os.path.exists(comp_dir):
            for task in os.listdir(comp_dir):
                if task.startswith(tid_pattern):
                    return True
    return False

def check_dependencies(task_md_path: str) -> Tuple[bool, List[str]]:
    """Görevin bağımlılıklarını kontrol eder."""
    if not os.path.exists(task_md_path):
        return True, []
        
    with open(task_md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    meta = parse_metadata(content)
    deps = meta.get('depends_on')
    
    if not deps:
        return True, []
    
    deps_list: List[str] = []
    if isinstance(deps, str):
        deps_list = [deps]
    elif isinstance(deps, list):
        deps_list = deps
        
    missing = []
    for dep_id in deps_list:
        if not is_task_completed(dep_id):
            missing.append(dep_id)
            
    return len(missing) == 0, missing

def validate_task_content(file_path: str, target_state: str) -> Tuple[bool, str]:
    """Görevin içeriğini semantik olarak kontrol eder. Boş veya placeholder içerikleri reddeder."""
    if not os.path.exists(file_path):
        return False, "Görev dosyası bulunamadı."
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Placeholder kontrolü (Hedef kısmı)
    if '## 🎯 Hedef' in content:
        match = re.search(r'## 🎯 Hedef\s*\r?\n(.*?)(?=\r?\n##|$)', content, re.DOTALL)
        if match:
            hedef_text = match.group(1).strip()
            if hedef_text == '...' or not hedef_text:
                return False, "HEDEF EKSİK: Görev hedefini yazmadan işleme devam edemezsiniz."

    # Alt görev kontrolü
    if '## ✅ Alt Görevler' in content:
        match = re.search(r'## ✅ Alt Görevler\s*\r?\n(.*?)(?=\r?\n##|$)', content, re.DOTALL)
        if match:
            tasks_text = match.group(1).strip()
            if tasks_text == '- [ ] ...' or not tasks_text:
                return False, "PLAN EKSİK: Alt görevleri (checklist) planlamadan işleme devam edemezsiniz."
            
            # Tamamlanma kontrolü
            if target_state == "completed" and '- [x]' not in tasks_text:
                return False, "İLERLEME EKSİK: En az bir alt görevi bitirmeden (...) dosyayı 'completed' yapamazsınız."

    # Superpowers Brainstorm & Plan Kontrolü (Sadece Aktivasyon ve Completion için)
    if target_state in ["active", "completed"]:
        task_dir = os.path.dirname(file_path)
        brainstorm_file = os.path.join(task_dir, "brainstorm.md")
        plan_file = os.path.join(task_dir, "plan.md")

        if os.path.exists(brainstorm_file):
            with open(brainstorm_file, 'r', encoding='utf-8') as bf:
                bf_content = bf.read()
                if '...' in bf_content or len(bf_content) < 100:
                    return False, "SUPERPOWERS BRAINSTORM EKSİK: Lütfen /superpowers-brainstorm çalıştırın veya içeriği doldurun."
        else:
            return False, "BRAINSTORM DOSYASI YOK: Registry protokolü gereği brainstorm.md zorunludur."

        if os.path.exists(plan_file):
            with open(plan_file, 'r', encoding='utf-8') as pf:
                pf_content = pf.read()
                if '...' in pf_content or len(pf_content) < 100:
                    return False, "SUPERPOWERS PLAN EKSİK: Lütfen /superpowers-write-plan çalıştırın veya içeriği doldurun."
        else:
            return False, "PLAN DOSYASI YOK: Registry protokolü gereği plan.md zorunludur."

    # 'completed' için özel Review kontrolü
    if target_state == "completed":
        task_dir = os.path.dirname(file_path)
        review_file = os.path.join(task_dir, "review.md")
        if os.path.exists(review_file):
            with open(review_file, 'r', encoding='utf-8') as rf:
                rf_content = rf.read()
                if '...' in rf_content or len(rf_content) < 50:
                    return False, "REVIEW EKSİK: Görevi bitirmeden (completed) önce lütfen /superpowers-review yapın."
        else:
            return False, "REVIEW DOSYASI YOK: Görevi bitirmeden (completed) önce review.md doldurulmalıdır."

    return True, ""

def repair_project(project_path: str) -> None:
    """Bir projenin hiyerarşik yapısını kontrol eder ve eksikleri tamamlar."""
    project_name = os.path.basename(project_path)
    print(f"  [*] Proje onarılıyor: {project_name}")
    
    subdirs = ["active", "backlog", "completed"]
    for sd in subdirs:
        path = os.path.join(project_path, sd)
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"    [+] Eksik dizin oluşturuldu: {path}")
        
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isfile(item_path) and item.endswith(".md") and item != ".gitkeep":
                # Orphaned file found
                task_name = item.replace(".md", "")
                create_snapshot(project_name, task_name, sd) 
                
                task_dir = os.path.join(path, task_name)
                if not os.path.exists(task_dir):
                    os.makedirs(task_dir)
                
                new_path = os.path.join(task_dir, item)
                os.rename(item_path, new_path)
                print(f"    [⛑️ OTONOM ONARIM] Görev dosyası klasörüne taşındı: {item}")

        # Task klasörlerini tara ve eksik md dosyalarını tamamla
        for task_folder in os.listdir(path):
            task_path = os.path.join(path, task_folder)
            if os.path.isdir(task_path) and sd in ["active", "backlog"]:
                for doc in ["brainstorm.md", "plan.md", "review.md"]:
                    doc_path = os.path.join(task_path, doc)
                    if not os.path.exists(doc_path):
                        with open(doc_path, 'w', encoding='utf-8') as f:
                            if doc == "brainstorm.md":
                                f.write(f"# Brainstorm: {task_folder}\n\n## 🎯 Goal\n...\n\n## 🛡️ Constraints & Risks\n...\n\n## 💡 Options & Recommendation\n...\n\n## ✅ Acceptance Criteria\n...\n")
                            elif doc == "review.md":
                                f.write(f"# Review: {task_folder}\n\n## 🔍 Checklist\n- [ ] Correctness\n- [ ] Edge cases\n- [ ] Security\n- [ ] Performance\n\n## 📝 Findings\n- Blocker: ...\n- Minor: ...\n")
                            else:
                                f.write(f"# Plan: {task_folder}\n\n## 🎯 Goal\n...\n\n## 🏗️ Steps\n1. Step 1\n   - Files: ...\n   - Change: ...\n   - Verify: ...\n")
                        print(f"    [⛑️ OTONOM ONARIM] Eksik şablon oluşturuldu: {doc} ({task_folder})")
                
                # Artifact yollarını senkronize et
                task_md = os.path.join(task_path, f"{task_folder}.md")
                if os.path.exists(task_md):
                    sync_artifacts(task_md)

        create_gitkeep(path)
    
    strategy_path = os.path.join(project_path, "strategy.md")
    if not os.path.exists(strategy_path):
        with open(strategy_path, 'w', encoding='utf-8') as f:
            f.write(f"# Strategy: {project_name}\n\n## 1. Vizyon\n...\n\n## 2. Hedefler\n...\n")
        print(f"    [!] Eksik strateji belgesi oluşturuldu.")

def repair_all() -> None:
    """Tüm registry yapısını tarar."""
    print("[*] Tüm Registry yapısı taranıyor...")
    for item in os.listdir(REGISTRY_DIR):
        item_path = os.path.join(REGISTRY_DIR, item)
        if os.path.isdir(item_path) and item.startswith("P"):
            repair_project(item_path)
    print("[+] Tüm yapılar protokol uyumlu.")

def create_project(project_id: str, project_name: str) -> None:
    """Yeni bir proje hiyerarşisi oluşturur."""
    full_name = f"P{project_id.zfill(2)}-{project_name.replace(' ', '-')}"
    project_path = os.path.join(REGISTRY_DIR, full_name)
    
    if os.path.exists(project_path):
        print(f"  [!] Hata: {full_name} zaten mevcut!")
        return

    print(f"[*] Yeni proje inşa ediliyor: {full_name}")
    os.makedirs(project_path)
    repair_project(project_path)
    print(f"[+] Proje başarıyla oluşturuldu: {full_name}")

def add_task(project_id: str, task_id: str, task_name: str, priority: str = "Medium") -> None:
    """Yeni bir görevi backlogda oluşturur."""
    project_folder: Optional[str] = None
    target_pattern = f"P{project_id.zfill(2)}-"
    
    for item in os.listdir(REGISTRY_DIR):
        if item.startswith(target_pattern) and os.path.isdir(os.path.join(REGISTRY_DIR, item)):
            project_folder = item
            break
            
    if not project_folder:
        print(f"  [!] Hata: {target_pattern} projesi bulunamadı!")
        return

    if task_id.lower() == "next":
        task_id = get_next_id(str(project_folder), is_test=False)
    elif task_id.lower() == "test":
        task_id = get_next_id(str(project_folder), is_test=True)

    task_folder_name = f"{task_id.zfill(3)}-{task_name.lower().replace(' ', '-')}"
    task_path = os.path.join(REGISTRY_DIR, str(project_folder), "backlog", task_folder_name)
    
    if os.path.exists(task_path):
        print(f"  [!] Hata: Görev zaten mevcut: {task_folder_name}")
        return

    os.makedirs(task_path)
    task_file = os.path.join(task_path, f"{task_folder_name}.md")
    
    template = f"""---
id: {task_id.zfill(3)}
title: "{task_name}"
status: "Pending"
progress: "0%"
priority: "{priority}"
created_at: "{get_now()}"
updated_at: "{get_now()}"
started_at: null
completed_at: null
depends_on: null
artifacts:
  brainstorm: null
  plan: null
  review: null
---

# {task_id.zfill(3)} - {task_name}

## 🎯 Hedef
...

## ✅ Alt Görevler
- [ ] ...
"""
    with open(task_file, 'w', encoding='utf-8') as f:
        f.write(template)
    
    print(f"[*] Yeni görev oluşturuldu: {task_folder_name}")
    repair_project(os.path.join(REGISTRY_DIR, project_folder))

def sync_artifacts(task_md_path: str) -> None:
    """Görevin metadata kısmındaki artifact yollarını dosya sistemindeki durumuna göre günceller."""
    if not os.path.exists(task_md_path):
        return

    task_dir = os.path.dirname(task_md_path)
    
    with open(task_md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    brainstorm_file = os.path.join(task_dir, "brainstorm.md")
    plan_file = os.path.join(task_dir, "plan.md")
    review_file = os.path.join(task_dir, "review.md")

    updates = {}
    if os.path.exists(brainstorm_file):
        updates['brainstorm'] = os.path.relpath(brainstorm_file, PROJECT_ROOT).replace('\\', '/')
    else:
        updates['brainstorm'] = 'null'

    if os.path.exists(plan_file):
        updates['plan'] = os.path.relpath(plan_file, PROJECT_ROOT).replace('\\', '/')
    else:
        updates['plan'] = 'null'

    if os.path.exists(review_file):
        updates['review'] = os.path.relpath(review_file, PROJECT_ROOT).replace('\\', '/')
    else:
        updates['review'] = 'null'

    # Metadata güncelleme
    for art, path in updates.items():
        pattern = rf'({art}:\s*)(".*?"|null)'
        if path != 'null':
            content = re.sub(pattern, rf'\1"{path}"', content)
        else:
            content = re.sub(pattern, r'\1null', content)

    # updated_at güncelle
    if 'updated_at:' in content:
        content = re.sub(r'updated_at:\s*".*?"', f'updated_at: "{get_now()}"', content)
    else:
        content = re.sub(r'---', f'---\nupdated_at: "{get_now()}"', content, count=1)

    with open(task_md_path, 'w', encoding='utf-8') as f:
        f.write(content)

def activate_task(project_id: str, task_id: str) -> None:
    """Bir görevi aktive eder. Bağımlılıkları kontrol eder."""
    project_folder: Optional[str] = None
    target_pattern = f"P{project_id.zfill(2)}-"
    
    for item in os.listdir(REGISTRY_DIR):
        if item.startswith(target_pattern) and os.path.isdir(os.path.join(REGISTRY_DIR, item)):
            project_folder = item
            break
            
    if not project_folder:
        print(f"  [!] Hata: {target_pattern} projesi bulunamadı!")
        return

    project_path = os.path.join(REGISTRY_DIR, project_folder)
    backlog_dir = os.path.join(project_path, "backlog")
    active_dir = os.path.join(project_path, "active")
    
    task_folder: Optional[str] = None
    task_pattern = f"{task_id.zfill(3)}-"
    for item in os.listdir(backlog_dir):
        if item.startswith(task_pattern):
            task_folder = item
            break
            
    if not task_folder:
        print(f"  [!] Hata: {task_id} nolu görev backlogda bulunamadı!")
        return

    src_dir = os.path.join(backlog_dir, task_folder)
    task_file_name = f"{task_folder}.md"
    src_file = os.path.join(src_dir, task_file_name)

    # 🛡️ GATEKEEPER 1: Bağımlılık Kontrolü
    ok, missing = check_dependencies(src_file)
    if not ok:
        print(f"  [❌ GATEKEEPER] Aktivasyon reddedildi! Eksik bağımlılıklar: {', '.join(missing)}")
        return

    # 🛡️ GATEKEEPER 2: İçerik Kalite Kontrolü
    valid, error_msg = validate_task_content(src_file, "active")
    if not valid:
        print(f"  [❌ GATEKEEPER] Aktivasyon reddedildi! {error_msg}")
        return

    print(f"[*] Görev verileri senkronize ediliyor...")
    sync_artifacts(src_file)

    if project_folder and task_folder:
        create_snapshot(str(project_folder), str(task_folder), "backlog")

    print(f"[*] Görev aktive ediliyor: {task_folder}")
    dst_dir = os.path.join(active_dir, str(task_folder))
    os.rename(src_dir, dst_dir)
    
    active_task_file = os.path.join(dst_dir, task_file_name)
    if os.path.exists(active_task_file):
        with open(active_task_file, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r'status:\s*".*?"', 'status: "Executing"', content)
        if 'started_at: null' in content:
            content = content.replace('started_at: null', f'started_at: "{get_now()}"')
        
        with open(active_task_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        sync_artifacts(active_task_file)
        print(f"    [+] Meta veri ve lokasyon bilgileri güncellendi.")

def move_task(source_proj_id: str, task_id: str, target_proj_id: str, target_state: str) -> None:
    """Görevi taşır."""
    def get_proj_folder(pid: str) -> Optional[str]:
        for item in os.listdir(REGISTRY_DIR):
            if item.startswith(f"P{pid.zfill(2)}-") and os.path.isdir(os.path.join(REGISTRY_DIR, item)):
                return item
        return None

    src_proj = get_proj_folder(source_proj_id)
    dst_proj = get_proj_folder(target_proj_id)

    if not src_proj or not dst_proj:
        print(f"  [!] Hata: Projeler bulunamadı!")
        return

    task_folder: Optional[str] = None
    src_state: Optional[str] = None
    for state in ["active", "backlog", "completed"]:
        state_path = os.path.join(REGISTRY_DIR, src_proj, state)
        if not os.path.exists(state_path): continue
        for item in os.listdir(state_path):
            if item.startswith(f"{task_id.zfill(3)}-") and os.path.isdir(os.path.join(state_path, item)):
                task_folder = item
                src_state = state
                break
        if task_folder: break

    if not src_proj or not task_folder or not src_state:
        print(f"  [!] Hata: Görev bulunamadı!")
        return

    src_path = os.path.join(REGISTRY_DIR, str(src_proj), str(src_state), str(task_folder))
    task_file = os.path.join(src_path, f"{task_folder}.md")

    # 🛡️ GATEKEEPER: İçerik Kalite Kontrolü
    valid, error_msg = validate_task_content(task_file, target_state)
    if not valid:
        print(f"  [❌ GATEKEEPER] Taşıma reddedildi! {error_msg}")
        return

    create_snapshot(str(src_proj), str(task_folder), str(src_state))
    dst_path = os.path.join(REGISTRY_DIR, str(dst_proj), target_state, str(task_folder))

    print(f"[*] Görev taşınıyor: {src_proj}/{src_state} -> {dst_proj}/{target_state}")
    if os.path.exists(dst_path):
        print(f"  [!] Hata: Hedefte çakışma mevcut!")
        return
    
    os.rename(src_path, dst_path)

    task_file_new = os.path.join(dst_path, f"{task_folder}.md")
    if os.path.exists(task_file_new):
        with open(task_file_new, 'r', encoding='utf-8') as f:
            content = f.read()

        if target_state == "completed":
            content = re.sub(r'status:\s*".*?"', 'status: "Completed"', content)
            content = re.sub(r'progress:\s*".*?"', 'progress: "100%"', content)
            if 'completed_at: null' in content:
                content = content.replace('completed_at: null', f'completed_at: "{get_now()}"')
        
        with open(task_file_new, 'w', encoding='utf-8') as f:
            f.write(content)
        
        sync_artifacts(task_file_new)
        print(f"    [+] Meta veriler ve zaman damgaları güncellendi.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub Registry Otonom Yönetici")
    parser.add_argument("action", choices=["repair", "create", "activate", "move", "task"], help="Yapılacak işlem")
    parser.add_argument("id", nargs="?", help="Proje ID")
    parser.add_argument("task", nargs="?", help="Görev ID")
    parser.add_argument("target_id", nargs="?", help="Hedef Proje ID (move için) veya Task İsmi (task için)")
    parser.add_argument("target_state", nargs="?", help="Hedef Statü")
    parser.add_argument("--name", help="Proje İsmi")

    args = parser.parse_args()

    if args.action == "repair":
        repair_all()
    elif args.action == "create":
        if args.id and args.name:
            create_project(args.id, args.name)
        else:
            print("  [!] Hata: ID ve --name gereklidir.")
    elif args.action == "activate":
        if args.id and args.task:
            activate_task(args.id, args.task)
        else:
            print("  [!] Hata: Proje ID ve Görev ID gereklidir.")
    elif args.action == "task":
        if args.id and args.task and args.target_id:
            priority = args.target_state if args.target_state else "Medium"
            add_task(args.id, args.task, args.target_id, priority)
        else:
            print("  [!] Hata: Proje ID, Görev ID ve Görev İsmi gereklidir.")
    elif args.action == "move":
        if args.id and args.task and args.target_id and args.target_state:
            move_task(args.id, args.task, args.target_id, args.target_state)
        else:
            print("  [!] Hata: Tüm argümanlar gereklidir.")
