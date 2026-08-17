import subprocess
from pathlib import Path

def main():
    repo_root = Path(__file__).resolve().parents[3]
    notebook_id = "235043eb-970f-4a52-9f39-1d02b2621e9c"
    
    uploads = [
        {"file": "docs/database_schema_master.md", "title": "Database Schema Master"},
        {"file": "docs/supabase_functions_master.md", "title": "Supabase Functions Master"},
        {"file": "docs/system_tree.md", "title": "System Tree (Proje Yapisi)"},
        {"file": "docs/venthub_hvac_master.md", "title": "VentHub HVAC Master"},
        {"file": "README.md", "title": "README.md"},
        {"file": "CHANGELOG.md", "title": "CHANGELOG.md"},
        {"file": "CONTEXT.md", "title": "CONTEXT.md (SaaS Güncel)"}
    ]
    
    total = len(uploads)
    print(f"Starting selective upload of {total} files to notebook {notebook_id}...")
    
    for idx, item in enumerate(uploads, 1):
        filepath = repo_root / item["file"]
        title = item["title"]
        
        if not filepath.exists():
            print(f"[{idx}/{total}] SKIP: File not found -> {item['file']}")
            continue
            
        print(f"[{idx}/{total}] Uploading: {item['file']} as '{title}'...")
        # 2026-08-17: ürün değişti (jacob-bd `nlm` -> teng-lin `notebooklm`). Eski komut
        # makinede YOK, yani bu betik sessizce her dosyada FAILED veriyordu.
        # Yeni CLI'da dosya yolu POZİSYONEL, defter -n ile, ve `--wait` bayrağı YOK
        # (beklemek ayrı bir `source wait` komutu).
        cmd = [
            "notebooklm", "source", "add", str(filepath),
            "-n", notebook_id,
            "--type", "file",
            "--title", title,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(repo_root))

        if result.returncode != 0:
            print(f"[{idx}/{total}] FAILED: {item['file']}\nError: {result.stderr or result.stdout}")
        else:
            # UYARI: yükleme asenkron döner. "SUCCESS" = kabul edildi, İNDEKSLENDİ demek DEĞİL.
            # Hemen sorgulanabilir olmasını istiyorsan: notebooklm source wait <id> -n <nb>
            print(f"[{idx}/{total}] SUCCESS (kuyruğa alındı): {item['file']}")
            
    print("Selective upload complete!")

if __name__ == '__main__':
    main()
