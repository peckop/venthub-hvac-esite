import os
import re
import yaml
from datetime import datetime

# VENTHUB REGISTRY SYNC v7.2 (PROJECT ORION READY)
REGISTRY_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(REGISTRY_DIR, '..'))
PULSE_FILE = os.path.join(REGISTRY_DIR, "PULSE.md")

def get_priority_label(priority):
    labels = {"Critical": "🚨 CRIT", "High": "🔥 HIGH", "Medium": "⚡ MED ", "Low": "🍃 LOW ", "null": "➖ -   "}
    return labels.get(priority, "➖ -   ")

def get_status_dot(status):
    dots = {"Completed": "✅ DONE", "Done": "✅ DONE", "Executing": "🏗️ RUN ", "Active": "🏗️ RUN ", "Planning": "📝 PLAN", "Reviewing": "🔍 REVW", "Brainstorming": "💡 IDEA"}
    return dots.get(status, "⏳ WAIT")

def calculate_progress(content, meta):
    total = len(re.findall(r'- \[[ x]\]', content))
    checked = len(re.findall(r'- \[x\]', content))
    return f"{int((checked / total) * 100)}%" if total > 0 else str(meta.get('progress', '0%'))

def get_metadata(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f: content = f.read()
        match = re.match(r'^---\s*\r?\n(.*?)\r?\n---', content, re.DOTALL)
        if match:
            meta = yaml.safe_load(re.sub(r'(id:\s*)([0-9]+)', r'\1"\2"', match.group(1)))
            meta['progress'] = calculate_progress(content, meta)
            return meta
    except: return None
    return None

def format_row(cols, widths):
    row = "|"
    for i, col in enumerate(cols): row += f" {str(col).strip().ljust(widths[i])} |"
    return row + "\n"

def scan_tasks(directory):
    tasks = []
    if not os.path.exists(directory): return tasks
    for entry in sorted(os.listdir(directory)):
        full_path = os.path.join(directory, entry)
        task_file = os.path.join(full_path, f"{entry}.md") if os.path.isdir(full_path) else full_path
        if os.path.exists(task_file) and task_file.endswith(".md"):
            meta = get_metadata(task_file)
            if meta: tasks.append(meta)
    return tasks

def sync_all():
    all_projects = {}
    total_tasks = 0; completed_tasks = 0

    for item in sorted(os.listdir(REGISTRY_DIR)):
        p_path = os.path.join(REGISTRY_DIR, item)
        if os.path.isdir(p_path) and re.match(r'^P\d{2}-', item):
            active = scan_tasks(os.path.join(p_path, "active"))
            completed = scan_tasks(os.path.join(p_path, "completed"))
            backlog = scan_tasks(os.path.join(p_path, "backlog"))
            all_projects[item] = {"active": active, "completed": completed, "backlog": backlog}
            total_tasks += len(active) + len(completed); completed_tasks += len(completed)

    global_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    pulse_content = f"# 🛰️ VENTHUB MISSION CONTROL (PULSE)\n> **Güncelleme:** {datetime.now().strftime('%d.%m.%Y %H:%M')} | **İlerleme:** %{global_progress}\n\n"
    
    widths = [6, 45, 12, 12, 10]; headers = ["ID", "GÖREV BAŞLIĞI", "ÖNCELİK", "DURUM", "İLERLEME"]
    for proj, data in all_projects.items():
        pulse_content += f"## 📁 {proj.upper()}\n"
        if data["active"]:
            pulse_content += "### ⚡ Aktif Görevler\n" + format_row(headers, widths) + "|:---|:---|:---|:---|:---|\n"
            for t in data["active"]:
                pulse_content += format_row([f"`{str(t.get('id','000')).zfill(3)}`", t.get('title','Untitled')[:42], get_priority_label(t.get('priority')), get_status_dot(t.get('status')), f"`{t.get('progress','0%')}`"], widths)
        if data["backlog"]:
            pulse_content += "\n### ⏳ Backlog\n" + format_row(headers[:3], [6, 45, 12]) + "|:---|:---|:---|\n"
            for t in data["backlog"]:
                pulse_content += format_row([f"`{str(t.get('id','000')).zfill(3)}`", t.get('title','Untitled')[:42], get_priority_label(t.get('priority'))], [6, 45, 12])
        pulse_content += "\n"

    with open(PULSE_FILE, 'w', encoding='utf-8-sig') as f: f.write(pulse_content)
    print(f"  [+] DASHBOARD GÜNCELLENDİ (v7.2): {PULSE_FILE}")

    # --- PROJECT ORION: DYNAMIC HOOK GENERATION ---
    hook_dir = os.path.join(PROJECT_ROOT, '.gemini', 'hooks')
    if os.path.exists(hook_dir):
        hook_file = os.path.join(hook_dir, 'current_pulse.md')
        summary = f"# 🛰️ DYNAMIC PROJECT PULSE (Hook)\n> **Sync:** {datetime.now().strftime('%H:%M')} | **Progress:** %{global_progress}\n\n## ⚡ ACTIVE TASKS\n"
        for p_id, p_data in all_projects.items():
            for t in p_data.get("active", []):
                summary += f"- {p_id}/{t.get('id', '???')}: {t.get('title', 'Untitled')[:40]} (%{t.get('progress', '0%')})\n"
        with open(hook_file, 'w', encoding='utf-8') as hf: hf.write(summary)
        print(f"  [⚡] DİNAMİK HOOK SENKRONİZE EDİLDİ: {hook_file}")

if __name__ == "__main__":
    sync_all()
