import os
import re
import sys

# Audit Kriterleri (Regex)
AUDIT_RULES = [
    {
        "id": "I18N_HARDCODED",
        "name": "Hardcoded Turkish Text",
        "pattern": r'([\'"])(?:(?!\bt\().)*?[şğüöçıŞĞÜÖÇİ].*?\1',
        "severity": "CRITICAL"
    },
    {
        "id": "TS_ANY",
        "name": "Unsafe 'any' Casting",
        "pattern": r'\bas any\b',
        "severity": "MAJOR"
    },
    {
        "id": "PERF_IMG",
        "name": "Standard <img> Tag",
        "pattern": r'<img\b',
        "severity": "MEDIUM"
    },
    {
        "id": "A11Y_ARIA",
        "name": "Missing aria-label on Button",
        "pattern": r'<button(?![^>]*aria-label)[^>]*>',
        "severity": "MAJOR"
    }
]

def run_audit(target_dir="src"):
    print(f"🚀 VentHub Technical Debt Audit Starting: {target_dir}\n")
    results = []
    
    for root, _, files in os.walk(target_dir):
        for file in files:
            if not file.endswith((".tsx", ".ts")):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.splitlines()
                    
                    for rule in AUDIT_RULES:
                        matches = re.finditer(rule["pattern"], content)
                        for match in matches:
                            # Satır numarasını bul
                            line_no = content.count('\n', 0, match.start()) + 1
                            snippet = lines[line_no - 1].strip()
                            results.append({
                                "file": file_path,
                                "line": line_no,
                                "rule": rule["name"],
                                "severity": rule["severity"],
                                "snippet": snippet
                            })
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

    # Sonuçları Raporla
    if not results:
        print("✅ No issues found! Codebase is Grade A.")
    else:
        print(f"Found {len(results)} issues:\n")
        # Severity'e göre sırala
        results.sort(key=lambda x: x["severity"], reverse=True)
        
        current_file = ""
        for r in results:
            if current_file != r["file"]:
                print(f"\n📂 File: {r['file']}")
                current_file = r["file"]
            print(f"  [{r['severity']}] Line {r['line']}: {r['rule']} -> {r['snippet'][:80]}...")

    print("\n🏁 Audit Completed.")

if __name__ == "__main__":
    run_audit()
