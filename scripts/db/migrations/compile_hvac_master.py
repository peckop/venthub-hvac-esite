import os
from pathlib import Path
from datetime import datetime

def main():
    repo_root = Path(__file__).resolve().parents[3]
    src_dir = repo_root / "src"
    output_file = repo_root / "docs" / "venthub_hvac_master.md"
    
    print(f"Scanning for markdown files in {src_dir}...")
    
    # Collect all markdown files under src/
    md_files = []
    for root, _, files in os.walk(src_dir):
        for f in files:
            if f.endswith('.md') and not f.endswith('master.md') and not f.endswith('system_tree.md'):
                md_files.append(Path(root) / f)
                
    # Sort files for deterministic output
    md_files.sort()
    
    print(f"Found {len(md_files)} documentation markdown files under src/.")
    
    now = datetime.utcnow().isoformat()
    header = f"""# VENTHUB HVAC MASTER

---
project_name: venthub-hvac
compiled_at: {now}+00:00
total_compiled_files: {len(md_files)}
source: src
---

"""

    content_blocks = []
    for filepath in md_files:
        rel_path = filepath.relative_to(repo_root)
        normalized_path = str(rel_path).replace('/', '\\')
        
        with open(filepath, 'r', encoding='utf-8') as f:
            file_content = f.read()
            
        block = f"""
---
# FILE: {normalized_path}
---

{file_content}
"""
        content_blocks.append(block)
        
    with open(output_file, 'w', encoding='utf-8') as out:
        out.write(header)
        out.write('\n'.join(content_blocks))
        
    print(f"Successfully compiled HVAC master doc to {output_file}!")

if __name__ == '__main__':
    main()
