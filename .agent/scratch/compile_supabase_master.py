import os
import datetime
from pathlib import Path

def main():
    # Dynamically find the repository root to respect Axiom A5
    current_dir = Path(__file__).resolve()
    # Go up from .agent/scratch/compile_supabase_master.py (3 levels up to venthub-hvac)
    repo_root = current_dir.parents[2]
    
    source_dir = repo_root / "supabase" / "functions"
    output_path = repo_root / "docs" / "supabase_functions_master.md"
    
    # Collect all markdown files under supabase/functions
    collected = []
    for root, _, files in os.walk(source_dir):
        for file in sorted(files):
            if file.endswith('.md') and not file.endswith('master.md'):
                collected.append(Path(root) / file)
                
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    print(f"Found {len(collected)} documentation files under {source_dir}")
    
    with open(output_path, 'w', encoding='utf-8', newline='\n') as f_out:
        # Write clean header with proper system-independent newlines
        f_out.write("# SUPABASE FUNCTIONS MASTER\n\n")
        f_out.write("---\n")
        f_out.write(f"compiled_at: {now}\n")
        f_out.write(f"total_compiled_files: {len(collected)}\n")
        f_out.write("---\n\n\n")
        
        for p in collected:
            rel_path = os.path.relpath(p, repo_root)
            print(f"Compiling: {rel_path}")
            
            f_out.write("\n\n---\n")
            f_out.write(f"# FILE: {rel_path}\n\n")
            
            with open(p, 'r', encoding='utf-8') as f_in:
                f_out.write(f_in.read())
                
    print(f"Successfully compiled extra master to {output_path}!")

if __name__ == '__main__':
    main()
