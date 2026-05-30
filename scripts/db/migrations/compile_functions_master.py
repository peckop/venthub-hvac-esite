import os
import glob
from datetime import datetime

def compile_functions():
    functions_dir = 'supabase/functions'
    output_file = 'docs/supabase_functions_master.md'
    
    print(f"Scanning for markdown files in {functions_dir}...")
    md_files = glob.glob(os.path.join(functions_dir, '**', '*.md'), recursive=True)
    
    # Exclude the master file itself and any other unwanted files
    md_files = [f for f in md_files if not f.endswith('master.md')]
    
    # Sort files for deterministic output
    md_files.sort()
    
    print(f"Found {len(md_files)} documentation markdown files.")
    
    header = f"""# SUPABASE FUNCTIONS MASTER

---
project_name: venthub-hvac
compiled_at: {datetime.utcnow().isoformat()}+00:00
total_compiled_files: {len(md_files)}
source: supabase/functions
---

"""

    content_blocks = []
    for filepath in md_files:
        print(f"Reading: {filepath}")
        # Normalize path separators to backslashes as in standard extra masters
        normalized_path = filepath.replace('/', '\\')
        
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
        
    print(f"Successfully compiled extra master doc to {output_file}!")

if __name__ == '__main__':
    compile_functions()
