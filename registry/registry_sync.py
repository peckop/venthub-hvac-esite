import os
import re
import yaml
from datetime import datetime

# Konfigürasyon
REGISTRY_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
PULSE_FILE = os.path.join(REGISTRY_DIR, "PULSE.md")

def get_priority_label(priority):
    labels = {
        "Critical": "🚨 CRIT",
        "High":     "🔥 HIGH",
        "Medium":   "⚡ MED ",
        "Low":      "🍃 LOW ",
        "null":     "➖ -   "
    }
    return labels.get(priority, "➖ -   ")

def get_status_dot(status):
    dots = {
        "Completed":     "✅ DONE",
        "Executing":     "🏗️ RUN ",
        "Active":        "🏗️ RUN ",
        "RUN":           "🏗️ RUN ",
        "START":         "🏗️ RUN ",
        "Planning":      "📝 PLAN",
        "Reviewing":     "🔍 REVW",
        "Brainstorming": "💡 IDEA",
        "Pending":       "⏳ WAIT",
    }
    return dots.get(status, "⏳ WAIT")

def calculate_progress(content, meta):
    # Checkboxes sayımı (Atomic Progress)
    total_boxes = len(re.findall(r'- \[[ x]\]', content))
    checked_boxes = len(re.findall(r'- \[x\]', content))
    
    if total_boxes > 0:
        return f"{int((checked_boxes / total_boxes) * 100)}%"
    
    # Checkbox yoksa YAML'daki progress'i kullan
    return str(meta.get('progress', '0%'))

def get_metadata(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            content = f.read()
        # Windows CRLF uyumlu regex
        match = re.match(r'^---\s*\r?\n(.*?)\r?\n---', content, re.DOTALL)
        if match:
            raw_yaml = match.group(1)
            # Fix octal issue for IDs starting with '0'
            processed_yaml = re.sub(r'(id:\s*)([0-9]+)', r'\1"\2"', raw_yaml)
            meta = yaml.safe_load(processed_yaml)
            
            # Atomic Progress hesapla ve meta'ya yaz
            meta['progress'] = calculate_progress(content, meta)
            return meta
    except Exception as e:
        print(f"  [!] Metadata hatası ({file_path}): {e}")
    return None

def format_row(cols, widths):
    row = "|"
    for i, col in enumerate(cols):
        clean_col = str(col).replace("|", " ").strip()
        row += f" {clean_col.ljust(widths[i])} |"
    return row + "\n"

def scan_tasks(directory):
    tasks = []
    if not os.path.exists(directory): return tasks
    for entry in sorted(os.listdir(directory)):
        full_path = os.path.join(directory, entry)
        meta = None
        if os.path.isfile(full_path) and entry.endswith(".md"):
            meta = get_metadata(full_path)
        elif os.path.isdir(full_path):
            # Klasör adıyla aynı olan .md dosyasını ara
            task_file = os.path.join(full_path, f"{entry}.md")
            if os.path.exists(task_file):
                meta = get_metadata(task_file)
        if meta: tasks.append(meta)
    return tasks

def sync_all():
    all_projects = {}
    total_tasks = 0
    completed_tasks = 0

    # registry/ dizinindeki PXX- ile başlayan tüm klasörleri proje olarak tara
    for item in sorted(os.listdir(REGISTRY_DIR)):
        project_path = os.path.join(REGISTRY_DIR, item)
        if os.path.isdir(project_path) and re.match(r'^P\d{2}-', item):
            active_tasks = scan_tasks(os.path.join(project_path, "active"))
            completed_tasks_list = scan_tasks(os.path.join(project_path, "completed"))
            backlog_tasks = scan_tasks(os.path.join(project_path, "backlog"))
            
            all_projects[item] = {
                "active": active_tasks,
                "completed": completed_tasks_list,
                "backlog": backlog_tasks,
                "strategy": os.path.join(project_path, "strategy.md") if os.path.exists(os.path.join(project_path, "strategy.md")) else None
            }
            total_tasks += len(active_tasks) + len(completed_tasks_list)
            completed_tasks += len(completed_tasks_list)

    # PULSE.md Üretimi
    now = datetime.now().strftime("%d.%m.%Y %H:%M")
    global_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0

    pulse_content = f"# 🛰️ VENTHUB MISSION CONTROL (PULSE)\n"
    pulse_content += f"> **Güncelleme:** {now} | **Sistem:** `OPERATIONAL` | **Sürüm:** `v7.0 (Pure Hiyerarşi)` \n\n"
    
    pulse_content += "## 📊 GLOBAL PROJE ÖZETİ\n"
    pulse_content += f"| İSTATİSTİK | DEĞER |\n"
    pulse_content += f"| :--- | :--- |\n"
    pulse_content += f"| 🎯 Global İlerleme | **%{global_progress}** |\n"
    pulse_content += f"| 📂 Toplam Proje | **{len(all_projects)}** |\n"
    pulse_content += f"| ✅ Tamamlanan Görev | **{completed_tasks}** |\n"
    pulse_content += f"| 🏗️ Aktif Operasyon | **{total_tasks - completed_tasks}** |\n\n"

    widths = [6, 45, 12, 12, 10]
    headers = ["ID", "GÖREV BAŞLIĞI", "ÖNCELİK", "DURUM", "İLERLEME"]

    for proj_name, data in all_projects.items():
        pulse_content += f"## 📁 {proj_name.upper()}\n"
        if data["strategy"]:
            strat_link = os.path.join(proj_name, "strategy.md").replace('\\', '/')
            pulse_content += f"> 🎯 [Strateji Belgesi]({strat_link})\n\n"
        
        if data["active"]:
            pulse_content += "### ⚡ Aktif Görevler\n"
            pulse_content += format_row(headers, widths)
            pulse_content += "|:---|:---|:---|:---|:---|\n"
            for t in sorted(data["active"], key=lambda x: str(x.get('id', '000'))):
                item_id = f"`{str(t.get('id', '000')).zfill(3)}`"
                title = t.get('title', 'Untitled')[:42]
                priority = get_priority_label(t.get('priority'))
                status = get_status_dot(t.get('status'))
                progress = f"`{t.get('progress', '0%')}`"
                pulse_content += format_row([item_id, title, priority, status, progress], widths)
            pulse_content += "\n"

        if data["backlog"]:
            pulse_content += "### ⏳ Backlog\n"
            pulse_content += format_row(headers[:3], [6, 45, 12])
            pulse_content += "|:---|:---|:---|\n"
            for t in sorted(data["backlog"], key=lambda x: str(x.get('id', '000'))):
                item_id = f"`{str(t.get('id', '000')).zfill(3)}`"
                title = t.get('title', 'Untitled')[:42]
                priority = get_priority_label(t.get('priority'))
                pulse_content += format_row([item_id, title, priority], [6, 45, 12])
            pulse_content += "\n"

        if data["completed"]:
            pulse_content += "### ✅ Tamamlananlar\n"
            pulse_content += format_row(headers, widths)
            pulse_content += "|:---|:---|:---|:---|:---|\n"
            for t in sorted(data["completed"], key=lambda x: str(x.get('id', '000')), reverse=True):
                item_id = f"`{str(t.get('id', '000')).zfill(3)}`"
                title = t.get('title', 'Untitled')[:42]
                priority = get_priority_label(t.get('priority'))
                status = "✅ DONE"
                progress = "`%100`"
                pulse_content += format_row([item_id, title, priority, status, progress], widths)
            pulse_content += "\n"

    pulse_content += "\n---\n*VentHub Autonomous Registry Sync - v7.0*"

    with open(PULSE_FILE, 'w', encoding='utf-8-sig') as f:
        f.write(pulse_content)
    print(f"  [+] DASHBOARD GÜNCELLENDİ (v7.0): {PULSE_FILE}")

if __name__ == "__main__":
    sync_all()
