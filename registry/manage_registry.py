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
    clean_tid = task_id.zfill(3)
    tid_pattern = f"{clean_tid}-"
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

    # Placeholder kontrolü (Hedef kısmı) - Hedef veya Hedefler kelimesini destekle
    if '## 🎯 Hedef' in content:
        match = re.search(r'## 🎯 Hedef(ler)?\s*\r?\n(.*?)(?=\r?\n##|$)', content, re.DOTALL)
        if match:
            hedef_text = match.group(2).strip()
            if hedef_text == '...' or not hedef_text:
                return False, "HEDEF EKSİK: Görev hedefini (🎯 Hedef) yazmadan işleme devam edemezsiniz."

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
    
    backlog_ids = {}
    backlog_path = os.path.join(project_path, "backlog")
    if os.path.exists(backlog_path):
        for item in os.listdir(backlog_path):
            if os.path.isdir(os.path.join(backlog_path, item)) and "-" in item:
                bid = item.split("-")[0]
                backlog_ids[bid] = item

    subdirs = ["active", "backlog", "completed"]
    for sd in subdirs:
        path = os.path.join(project_path, sd)
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"    [+] Eksik dizin oluşturuldu: {path}")
        
        # 🛡️ SENTINEL: Active vs Backlog Çakışma Kontrolü
        if sd == "active":
            for item in os.listdir(path):
                if os.path.isdir(os.path.join(path, item)) and "-" in item:
                    aid = item.split("-")[0]
                    if aid in backlog_ids:
                        print(f"    [🚨 SENTINEL] Illegal görev tespiti: {aid} ID'si zaten backlogda!")
                        print(f"    [!] Protokol dışı oluşturulan {item} temizleniyor...")
                        shutil.rmtree(os.path.join(path, item))
                        continue

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
                
                # 🛡️ SKILL ENFORCEMENT SENTINEL: Brainstorm & Plan Kalite Kontrolü
                task_md = os.path.join(task_path, f"{task_folder}.md")
                if sd == "active" and os.path.exists(task_md):
                    with open(task_md, 'r', encoding='utf-8') as f:
                        task_content = f.read()
                    
                    # Eğer statü Executing ise ama plan/brainstorm boşsa statüyü Planning'e çek
                    if 'status: "Executing"' in task_content or 'status: "RUN"' in task_content:
                        missing_planning = False
                        for doc in ["brainstorm.md", "plan.md"]:
                            doc_path = os.path.join(task_path, doc)
                            if os.path.exists(doc_path):
                                with open(doc_path, 'r', encoding='utf-8') as f:
                                    d_content = f.read()
                                if "..." in d_content or len(d_content) < 50:
                                    missing_planning = True
                                    break
                        
                        if missing_planning:
                            print(f"    [🚨 PROTOKOL İHLALİ] {task_folder} için brainstorm/plan eksik veya placeholder içeriyor!")
                            print(f"    [!] Statü zorla 'Planning'e çekiliyor. Lütfen skilleri kullanın.")
                            task_content = re.sub(r'status:\s*".*?"', 'status: "Planning"', task_content)
                            with open(task_md, 'w', encoding='utf-8') as f:
                                f.write(task_content)
                
                # Artifact yollarını senkronize et
                if os.path.exists(task_md):
                    sync_artifacts(task_md)

        create_gitkeep(path)
    
    strategy_path = os.path.join(project_path, "strategy.md")
    if not os.path.exists(strategy_path):
        with open(strategy_path, 'w', encoding='utf-8') as f:
            f.write(f"# Strategy: {project_name}\n\n## 1. Vizyon\n...\n\n## 2. Hedefler\n...\n")
        print(f"    [!] Eksik strateji belgesi oluşturuldu.")

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

    # Metadata güncelleme veya ekleme (Sadece Frontmatter alanı içinde)
    parts = content.split('---', 2)
    if len(parts) >= 3:
        frontmatter = parts[1]
        body = parts[2]
        
        # Artifacts bloğunu tamamen temizle ve yeniden oluştur (Mükerrerliği önler)
        frontmatter = re.sub(r'artifacts:\s*\n(\s+.*\n?)*', '', frontmatter)
        
        # Yeni artifacts bloğunu ekle
        art_block = "artifacts:\n"
        for art, path in updates.items():
            path_val = f'"{path}"' if path != 'null' else 'null'
            art_block += f"  {art}: {path_val}\n"
        
        frontmatter = frontmatter.strip() + f"\n{art_block}"
        content = f'---\n{frontmatter.strip()}\n---\n{body}'
    
    with open(task_md_path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_metadata(task_md_path: str, metadata: Dict[str, str]) -> None:
    """Görevin metadata bilgilerini (YAML frontmatter) günceller."""
    with open(task_md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    parts = content.split('---', 2)
    if len(parts) >= 3:
        frontmatter = parts[1]
        body = parts[2]
        
        for skey, sval in metadata.items():
            frontmatter = re.sub(rf'^{skey}:.*?\n', '', frontmatter, flags=re.MULTILINE)
            frontmatter = frontmatter.strip() + f'\n{skey}: {sval}\n'
        
        frontmatter = re.sub(r'^updated_at:.*?\n', '', frontmatter, flags=re.MULTILINE)
        frontmatter = frontmatter.strip() + f'\nupdated_at: "{get_now()}"\n'
            
        new_content = f'---\n{frontmatter.strip()}\n---\n{body}'
        with open(task_md_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

def sync_pulse() -> None:
    """Fiziksel klasör yapısını tarar ve PULSE.md dosyasını otomatik olarak yeniden oluşturur."""
    pulse_path = os.path.join(REGISTRY_DIR, "PULSE.md")
    now = get_now()
    
    projects_data = {}
    total_completed = 0
    total_tasks = 0
    
    for item in os.listdir(REGISTRY_DIR):
        item_path = os.path.join(REGISTRY_DIR, item)
        if os.path.isdir(item_path) and item.startswith("P"):
            projects_data[item] = {"active": [], "backlog": [], "completed": []}
            for state in ["active", "backlog", "completed"]:
                state_path = os.path.join(item_path, state)
                if os.path.exists(state_path):
                    for task_folder in os.listdir(state_path):
                        if os.path.isdir(os.path.join(state_path, task_folder)):
                            task_md = os.path.join(state_path, task_folder, f"{task_folder}.md")
                            title, priority, progress = task_folder, "Medium", "0%"
                            if os.path.exists(task_md):
                                with open(task_md, 'r', encoding='utf-8') as f:
                                    meta = parse_metadata(f.read())
                                title = meta.get('title', task_folder)
                                priority = meta.get('priority', 'Medium')
                                progress = str(meta.get('progress', '0%'))
                            
                            projects_data[item][state].append({
                                "id": task_folder.split("-")[0],
                                "title": title,
                                "priority": priority,
                                "progress": progress
                            })
                            total_tasks += 1
                            if state == "completed": total_completed += 1

    progress_pct = int((total_completed / total_tasks * 100)) if total_tasks > 0 else 0
    content = f"# 🛰️ VENTHUB MISSION CONTROL (PULSE)\n> **Güncelleme:** {now} | **Sistem:** `OPERATIONAL` | **Sürüm:** `v8.0 (Otonom Sync)` \n\n## 📊 GLOBAL PROJE ÖZETİ\n| İSTATİSTİK | DEĞER |\n| :--- | :--- |\n| 🎯 Global İlerleme | **%{progress_pct}** |\n| 📂 Toplam Proje | **{len(projects_data)}** |\n| ✅ Tamamlanan Görev | **{total_completed}** |\n| 🏗️ Aktif Operasyon | **{sum(len(p['active']) for p in projects_data.values())}** |\n\n"

    for proj, states in sorted(projects_data.items()):
        content += f"## 📁 {proj}\n> 🎯 [Strateji Belgesi]({proj}/strategy.md)\n\n### ⚡ Aktif Görevler\n| ID     | GÖREV BAŞLIĞI | ÖNCELİK | DURUM | İLERLEME |\n|:---|:---|:---|:---|:---|\n"
        for t in sorted(states['active'], key=lambda x: x['id']):
            content += f"| `{t['id']}` | {t['title']} | {t['priority']} | 🏗️ RUN | `{t['progress']}` |\n"
        if not states['active']: content += "| - | Hiç aktif görev yok. | - | - | - |\n"
        
        content += f"\n### ⏳ Backlog\n| ID     | GÖREV BAŞLIĞI | ÖNCELİK |\n|:---|:---|:---|\n"
        for t in sorted(states['backlog'], key=lambda x: x['id']):
            content += f"| `{t['id']}` | {t['title']} | {t['priority']} |\n"
        if not states['backlog']: content += "| - | Backlog temiz. | - |\n"
        
        content += f"\n### ✅ Tamamlananlar\n| ID     | GÖREV BAŞLIĞI | ÖNCELİK | DURUM | İLERLEME |\n|:---|:---|:---|:---|:---|\n"
        for t in sorted(states['completed'], key=lambda x: x['id']):
            content += f"| `{t['id']}` | {t['title']} | {t['priority']} | ✅ DONE | `100%` |\n"
        content += "\n"

    with open(pulse_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"    [🛰️ PULSE] {pulse_path} fiziksel yapıya göre güncellendi.")

def activate_task(project_id: str, task_id: str) -> None:
    """Bir görevi aktive eder. Bağımlılıkları ve Superpowers içeriklerini kontrol eder."""
    project_folder: Optional[str] = None
    if os.path.isdir(os.path.join(REGISTRY_DIR, project_id)):
        project_folder = project_id
    else:
        pid_base = project_id.upper().replace("P", "")
        clean_pid = pid_base.split("-")[0].split(" ")[0].zfill(2)
        target_pattern = f"P{clean_pid}-"
        for item in os.listdir(REGISTRY_DIR):
            if item.upper().startswith(target_pattern) and os.path.isdir(os.path.join(REGISTRY_DIR, item)):
                project_folder = item
                break
    
    if not project_folder:
        print(f"  [!] Hata: '{project_id}' projesi bulunamadı!")
        return
    
    clean_tid = task_id.zfill(3)
    project_path = os.path.join(REGISTRY_DIR, project_folder)
    backlog_dir = os.path.join(project_path, "backlog")
    active_dir = os.path.join(project_path, "active")
    
    task_folder = next((i for i in os.listdir(backlog_dir) if i.startswith(f"{clean_tid}-")), None)
    if not task_folder:
        print(f"  [!] Hata: {task_id} nolu görev backlogda bulunamadı!")
        return

    src_file = os.path.join(backlog_dir, task_folder, f"{task_folder}.md")
    valid, error_msg = validate_task_content(src_file, "active")
    if not valid:
        print(f"  [❌ GATEKEEPER] Aktivasyon reddedildi! {error_msg}\n  [💡 İPUCU] Lütfen /superpowers-brainstorm ve /superpowers-plan yeteneklerini kullanın.")
        return

    create_snapshot(project_folder, task_folder, "backlog")
    os.rename(os.path.join(backlog_dir, task_folder), os.path.join(active_dir, task_folder))
    update_metadata(os.path.join(active_dir, task_folder, f"{task_folder}.md"), {"status": "Planning", "started_at": f'"{get_now()}"'})
    sync_pulse()
    print(f"    [+] Görev 'Active' klasörüne taşındı ve PULSE güncellendi.")

def move_task(source_proj_id: str, task_id: str, target_proj_id: str, target_state: str) -> None:
    """Görevi taşır ve statüsünü günceller."""
    def get_proj_folder(pid: str) -> Optional[str]:
        if os.path.isdir(os.path.join(REGISTRY_DIR, pid)): return pid
        clean_p = pid.upper().replace("P", "").split("-")[0].zfill(2)
        return next((i for i in os.listdir(REGISTRY_DIR) if i.upper().startswith(f"P{clean_p}-") and os.path.isdir(os.path.join(REGISTRY_DIR, i))), None)

    src_proj, dst_proj = get_proj_folder(source_proj_id), get_proj_folder(target_proj_id)
    if not src_proj or not dst_proj:
        print(f"  [!] Hata: Projeler bulunamadı!")
        return

    clean_tid = task_id.zfill(3)
    task_folder, src_state = None, None
    for state in ["active", "backlog", "completed"]:
        state_path = os.path.join(REGISTRY_DIR, src_proj, state)
        if os.path.exists(state_path):
            task_folder = next((i for i in os.listdir(state_path) if i.startswith(f"{clean_tid}-")), None)
            if task_folder:
                src_state = state
                break

    if not task_folder:
        print(f"  [!] Hata: Görev bulunamadı!")
        return

    src_path = os.path.join(REGISTRY_DIR, src_proj, src_state, task_folder)
    valid, error_msg = validate_task_content(os.path.join(src_path, f"{task_folder}.md"), target_state)
    if not valid:
        print(f"  [❌ GATEKEEPER] Taşıma reddedildi! {error_msg}")
        return

    create_snapshot(src_proj, task_folder, src_state)
    dst_dir = os.path.join(REGISTRY_DIR, dst_proj, target_state)
    if not os.path.exists(dst_dir): os.makedirs(dst_dir)
    
    target_path = os.path.join(dst_dir, task_folder)
    if os.path.exists(target_path): shutil.rmtree(target_path)
    
    shutil.move(src_path, target_path)
    
    if target_state == "completed":
        update_metadata(os.path.join(target_path, f"{task_folder}.md"), {"status": "Completed", "progress": "100%", "completed_at": f'"{get_now()}"'})
    
    sync_pulse()
    print(f"    [+] Görev {target_state} klasörüne taşındı ve PULSE güncellendi.")

def repair_all() -> None:
    """Tüm registry yapısını tarar ve onarır."""
    print("[*] Tüm Registry yapısı taranıyor...")
    for item in os.listdir(REGISTRY_DIR):
        item_path = os.path.join(REGISTRY_DIR, item)
        if os.path.isdir(item_path) and item.startswith("P"):
            repair_project(item_path)
    sync_pulse()
    print("[+] Tüm yapılar protokol uyumlu.")

def search_task(task_id: str) -> None:
    """ID'ye göre görev arar."""
    print(f"[*] Görev aranıyor: {task_id}")
    tid = task_id.zfill(3)
    found = False
    for proj in [d for d in os.listdir(REGISTRY_DIR) if d.startswith("P")]:
        for state in ["backlog", "active", "completed"]:
            state_path = os.path.join(REGISTRY_DIR, proj, state)
            if os.path.exists(state_path):
                task = next((i for i in os.listdir(state_path) if i.startswith(f"{tid}-")), None)
                if task:
                    print(f"    [+] BULDUM: {tid} | Proje: {proj} | Statü: {state} | Yol: {os.path.join(state_path, task)}")
                    found = True
    if not found: print(f"    [!] {task_id} bulunamadı.")

def list_registry(verbose: bool = False) -> None:
    """Açık görevleri listeler."""
    print("\n🛰️  VENTHUB REGISTRY OVERVIEW\n" + "="*40)
    for proj in sorted([d for d in os.listdir(REGISTRY_DIR) if d.startswith("P")]):
        active = os.listdir(os.path.join(REGISTRY_DIR, proj, "active")) if os.path.exists(os.path.join(REGISTRY_DIR, proj, "active")) else []
        backlog = os.listdir(os.path.join(REGISTRY_DIR, proj, "backlog")) if os.path.exists(os.path.join(REGISTRY_DIR, proj, "backlog")) else []
        if active or backlog or verbose:
            print(f"\n📂 {proj}")
            if active: 
                print("  🏗️  AKTİF:")
                for t in sorted(active): print(f"    - {t}")
            if backlog:
                print("  ⏳ BACKLOG:")
                for t in sorted(backlog): print(f"    - {t}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VentHub Registry Otonom Yönetici")
    parser.add_argument("action", choices=["repair", "activate", "move", "search", "list"], help="İşlem")
    parser.add_argument("id", nargs="?", help="Proje/Görev ID")
    parser.add_argument("task", nargs="?", help="Görev ID")
    parser.add_argument("target_id", nargs="?", help="Hedef Proje")
    parser.add_argument("target_state", nargs="?", help="Hedef Statü")
    args = parser.parse_args()

    if args.action == "repair": repair_all()
    elif args.action == "search": search_task(args.id) if args.id else print("ID gerekli.")
    elif args.action == "list": list_registry()
    elif args.action == "activate": activate_task(args.id, args.task) if args.id and args.task else print("Eksik argüman.")
    elif args.action == "move": move_task(args.id, args.task, args.target_id, args.target_state) if args.id and args.task and args.target_id and args.target_state else print("Eksik argüman.")
