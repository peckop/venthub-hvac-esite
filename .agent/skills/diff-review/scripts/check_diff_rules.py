#!/usr/bin/env python3
"""
VentHub Diff-Review Rules Engine
Purpose: Statically analyze 'git diff HEAD' to detect anti-patterns and dangerous code changes.
Exit Code: 1 if violations found (blocks /bitir), 0 if clean.
"""

import sys
import subprocess
import re
from pathlib import Path

# V7 Protocol Risk Eşik Değerleri ve Regex'ler
RULES = {
    "TYPE_ANY": {
        "description": "Zorunlu tip güvenliği ihlali ('any' veya 'as any' kullanımı)",
        "pattern": re.compile(r'^\+.*(:|as)\s+any\b'),
        "severity": "BLOCKER"
    },
    "DB_DROP": {
        "description": "Yıkıcı DB Operasyonu (DROP TABLE / DROP COLUMN)",
        "pattern": re.compile(r'^\+.*\bDROP\s+(TABLE|COLUMN)\b', re.IGNORECASE),
        "severity": "BLOCKER"
    },
    "DELETE_EXPORT": {
        "description": "Kritik Modül Dışa Aktarımı (%export%) Silinmesi",
        "pattern": re.compile(r'^\-.*export\s+(const|function|class|interface|type)\s+'),
        "severity": "MAJOR"
    },
    "CONSOLE_LOG": {
        "description": "Geliştirme çöpü (console.log kalıntısı)",
        "pattern": re.compile(r'^\+.*\bconsole\.log\s*\('),
        "severity": "MINOR"
    },
    "HARDCODED_URL": {
        "description": "Hardcoded dev URL sızıntısı (localhost)",
        "pattern": re.compile(r'^\+.*\blocalhost[:\d]*'),
        "severity": "MAJOR"
    },
    "SECRET_LEAK": {
        "description": "Supabase service_role anahtarı client koda sızıyor",
        "pattern": re.compile(r'^\+.*\b(service_role|SUPABASE_SERVICE_ROLE_KEY)\b'),
        "severity": "BLOCKER"
    },
    "MOCK_DATA": {
        "description": "Mock/test verisi production koda sızıyor",
        "pattern": re.compile(r'^\+.*\[\s*\{\s*(id|name|title)\s*:'),
        "severity": "MAJOR"
    }
}

IGNORE_FLAG = "diff-ignore"

# Taramadan hariç tutulan dosya uzantıları ve yollar
EXCLUDED_EXTENSIONS = (".md", ".json", ".yml", ".yaml")
EXCLUDED_PATHS = (".agent/",)

def run_git_diff() -> str:
    """Gets the combined diff of staged and unstaged changes."""
    try:
        # Get HEAD diff. If no commits yet, this might fail, but usually fine.
        result = subprocess.run(
            ["git", "diff", "HEAD"], 
            capture_output=True, text=True, check=True, encoding='utf-8', errors='replace'
        )
        return result.stdout
    except subprocess.CalledProcessError:
        # Fallback if no commits or other errors
        try:
            result = subprocess.run(
                ["git", "diff", "--cached"], 
                capture_output=True, text=True, check=False, encoding='utf-8', errors='replace'
            )
            return result.stdout
        except:
            return ""

def analyze_diff(diff_output: str) -> list:
    violations = []
    current_file = None
    skip_file = False
    
    for line in diff_output.splitlines():
        if line.startswith("diff --git"):
            current_file = line.split(" b/")[-1] if " b/" in line else "Bilinmeyen Dosya"
            # Dosya yolunu veya uzantısını kontrol et — skip flag'i ayarla
            skip_file = False
            if current_file:
                for ep in EXCLUDED_PATHS:
                    if current_file.startswith(ep):
                        skip_file = True
                        break
                for ext in EXCLUDED_EXTENSIONS:
                    if current_file.endswith(ext):
                        skip_file = True
                        break
            continue

        # Hariç tutulan dosyayı atla
        if skip_file:
            continue
            
        if IGNORE_FLAG in line:
            # Satırda diff-ignore varsa kural işletilmez
            continue
            
        for rule_id, rule_data in RULES.items():
            if rule_data["pattern"].search(line):
                violations.append({
                    "file": current_file,
                    "rule": rule_id,
                    "description": rule_data["description"],
                    "severity": rule_data["severity"],
                    "line": line.strip()
                })
    return violations

def main():
    print("🛡️ VentHub Diff-Review Integrity Checker başlatılıyor...")
    diff_output = run_git_diff()
    
    if not diff_output.strip():
        print("✅ Değişiklik bulunamadı veya diff temiz.")
        sys.exit(0)
        
    violations = analyze_diff(diff_output)
    
    if not violations:
        print("✅ Kod değişiklikleri otonom analizden başarıyla geçti. Yıkıcı anti-pattern tespit edilmedi.")
        sys.exit(0)
        
    has_blocker = False
    print("\n🚨 DİKKAT: AŞAĞIDAKİ TEHLİKELİ KALIPLAR TESPİT EDİLDİ:")
    print("="*60)
    for v in violations:
        print(f"[{v['severity']}] Dosya: {v['file']}")
        print(f"  └─ Kural    : {v['description']}")
        print(f"  └─ Satır    : {v['line']}")
        print(f"  └─ Çözüm/Pass: İlerlemek zorunluysa ilgili satıra '// diff-ignore' yorumu ekleyin.\n")
        
        if v['severity'] == "BLOCKER":
            has_blocker = True
            
    print("="*60)
    
    if has_blocker:
        print("❌ [BLOCKER] tespit edildi. İşlem (`/bitir` veya Execute) reddedildi.")
        print("Lütfen hataları düzeltin veya '// diff-ignore' ekleyip tekrar deneyin.")
        sys.exit(1)
    else:
        print("⚠️ Uyarılar var ama [BLOCKER] bulunamadı. Lütfen değişikliklerinizi manuel gözden geçirin.")
        sys.exit(0) # MAJOR and MINOR are just warnings

if __name__ == "__main__":
    main()
