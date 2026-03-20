import re
import difflib
from pathlib import Path

def test_sync_loop():
    dir_path = Path('registry/P00-Standalone/completed/020-global-i18n-hardcoded-metin-temizligi-ad')
    main_md = dir_path / '020-global-i18n-hardcoded-metin-temizligi-ad.md'
    plan_md = dir_path / 'plan.md'
    
    if not main_md.exists():
        print(f"File not found: {main_md}")
        return

    m_content = main_md.read_text(encoding='utf-8-sig')
    old_content = m_content

    # Mimic Plan -> Main sync
    if plan_md.exists():
        p_content = plan_md.read_text(encoding='utf-8-sig')
        tasks = re.findall(r'- \[[ x]\] .*', p_content)
        if tasks:
            new_block = "\n\n## ✅ Alt Görevler\n" + "\n".join(tasks)
            if "## ✅ Alt Görevler" in m_content:
                m_content = re.sub(r'## ✅ Alt Görevler.*', new_block, m_content, flags=re.DOTALL)
            else:
                m_content += new_block

    # Mimic Metadata sync
    working_content = m_content
    working_content = re.sub(r'status:\s*".*?"', 'status: "Completed"', working_content)
    working_content = re.sub(r'project:\s*".*?"', 'project: "P00-Standalone"', working_content)

    def fix_p(match):
        pfx = match.group(1); fn = match.group(2).split('/')[-1]
        return f'{pfx}"registry/P00-Standalone/completed/020-global-i18n-hardcoded-metin-temizligi-ad/{fn}"'
    
    working_content = re.sub(r'(\w+:\s*)"(registry/.*?)"', fix_p, working_content)

    # Normalize
    def normalize_for_diff(text):
        text = re.sub(r'updated_at:\s*".*?"', '', text)
        return text.replace('\r\n', '\n').strip()

    old_norm = normalize_for_diff(old_content)
    new_norm = normalize_for_diff(working_content)

    if old_norm != new_norm:
        print("FARK BULUNDU! İşte sebep:")
        diff = difflib.unified_diff(old_norm.splitlines(), new_norm.splitlines(), lineterm='')
        for d in diff:
            print(d)
    else:
        print("FARK YOK! Hata başka bir yerde.")

if __name__ == '__main__':
    test_sync_loop()
