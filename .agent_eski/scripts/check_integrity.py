import os
import re
import sys
from pathlib import Path

# VENTHUB LAST-MILE INTEGRITY CHECKER (V4)
# Mantık: Hata sayısı azaldıkça, her hatanın ağırlığı artar.
# Yeni: Property Mismatch tespiti eklendi.

CRITICAL_PATHS = ["src/components", "src/views", "src/app"]
ERROR_THRESHOLD = 20

def check_file_quality(file_path: Path):
    if not file_path.suffix in ['.tsx', '.ts']: return []
    
    content = file_path.read_text(encoding='utf-8')
    issues = []
    
    # 1. Hydration & Window Safety
    if "window." in content or "localStorage." in content:
        if "useEffect" not in content and "typeof window" not in content:
            issues.append(f"🚨 Hydration Risk: {file_path.name}")

    # 2. Naming Standards (PascalCase for Components)
    if re.search(r'const\s+_([A-Z])', content):
        issues.append(f"❌ Naming Violation: {file_path.name}")

    # 3. Property Mismatch (Anti-Robot Hook)
    # Eğer dosyada '_id:' tanımlanmış ama '.id' olarak okunuyorsa bu bir hatadır.
    if re.search(r'[\{,]\s*_id\s*:', content) and re.search(r'\.id\b', content):
        issues.append(f"🚨 Property Mismatch: {file_path.name} ('_id' vs '.id')")

    return issues

def run_audit():
    print("🔬 VentHub Last-Mile & Integrity Audit Başlatılıyor...")
    all_issues = []
    
    for root in CRITICAL_PATHS:
        for p in Path(root).rglob('*'):
            if p.is_file() and p.suffix in ['.tsx', '.ts']:
                all_issues.extend(check_file_quality(p))
            
    total = len(all_issues)
    
    if total == 0:
        print("✅ MÜKEMMEL: Sıfır hata ve tam bütünlük onaylandı.")
        return 0
    
    if total < ERROR_THRESHOLD:
        impact = (1 / total) * 100
        print(f"⚠️ KRİTİK EŞİK: Sadece {total} sorun kaldı.")
        print(f"🎯 Her bir düzeltme toplam kalitenin %{impact:.1f} kadarını temsil ediyor.")
    
    for issue in all_issues:
        print(issue)
        
    print(f"\n🚨 Toplam {total} adet kalite/bütünlük engeli mevcut. Görev kapatılamaz.")
    return 1

if __name__ == "__main__":
    sys.exit(run_audit())
