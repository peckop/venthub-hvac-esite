import sys
import subprocess
import os

def get_staged_files():
    try:
        # Get both staged files and their status (Added, Modified, Deleted, etc.)
        output = subprocess.check_output(['git', 'diff', '--cached', '--name-only'], text=True)
        return output.splitlines()
    except Exception as e:
        print(f"DEBUG: Git error: {e}")
        return []

def main():
    staged_files = get_staged_files()
    if not staged_files:
        return 0

    # 1. KRİTİK DOSYA KORUMASI (Hiçbir şekilde atlatılamaz)
    mandatory_registry_triggers = [
        'package.json', 'tsconfig.json', 'vite.config.ts', 'tailwind.config.ts', 
        'supabase/migrations', '.env.example'
    ]
    
    triggered_mandatory = [f for f in staged_files if any(m in f for m in mandatory_registry_triggers)]
    
    # 2. İŞ MANTIĞI KORUMASI
    # Testleri de artık dahil ediyoruz, çünkü test yazmak da dökümante edilmeli.
    code_files = [
        f for f in staged_files 
        if (f.startswith('src/') or f.startswith('supabase/'))
        and (f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.sql') or f.endswith('.css'))
    ]
    
    registry_files = [
        f for f in staged_files 
        if (f.startswith('registry/') and f.endswith('.md')) or f == 'PULSE.md' or f == 'docs/PROJECT_STATUS_2026.md'
    ]

    # ALAN BAZLI DENETİM (DOMAINS)
    domain_mappings = {
        'src/views/admin': 'registry/P02-Core-Quality-Guardians/active/',
        'src/lib/supabase': 'registry/P02-Core-Quality-Guardians/active/',
        'src/i18n': 'registry/P02-Core-Quality-Guardians/active/',
        'src/app/_components': 'registry/P01-Visual-Page-Builder/active/'
    }

    # DİSİPLİNLİ REGISTRY TANIMI (PULSE geneldir, proje spesifik değildir)
    project_task_files = [f for f in registry_files if 'active/' in f or 'completed/' in f]
    
    violation_found = False
    
    # A. Mandatory check (PULSE yetmez!)
    if triggered_mandatory and not project_task_files:
        print(f"🚨 KRİTİK SİSTEM DEĞİŞİKLİĞİ: {', '.join(triggered_mandatory[:2])}")
        print("HATA: Bağımlılık/Yapılandırma değişti. Sadece 'PULSE.md' yeterli DEĞİLDİR.")
        print("Lütfen projenin ilgili '.md' görev dosyasını (Task) güncelleyin.")
        violation_found = True

    # B. Domain-specific check (PULSE yetmez!)
    for code_dir, registry_dir in domain_mappings.items():
        domain_code_changes = [f for f in code_files if f.startswith(code_dir)]
        domain_project_changes = [f for f in registry_files if f.startswith(registry_dir)]
        
        if domain_code_changes and not domain_project_changes:
            print(f"🚨 DOMAIN İHLALİ: '{code_dir}' altında değişiklik var.")
            print(f"HATA: '{registry_dir}' altındaki Task dosyası güncellenmelidir.")
            violation_found = True

    # C. Granularity Check (Sayısal Denge)
    # Eğer 5'ten fazla kod dosyası değiştiyse ama sadece 1 registry dosyası değiştiyse (PULSE gibi) şüphelen
    if len(code_files) > 5 and len(registry_files) < 2 and 'PULSE.md' in registry_files:
        print("🚨 ŞÜPHELİ COMMIT: Çok fazla kod değişikliği var ama sadece 'PULSE.md' güncellenmiş.")
        print("HATA: Bu hacimdeki bir iş için detaylı bir Görev (Task) dökümantasyonu gereklidir.")
        violation_found = True

    if violation_found:
        print("\n" + "!" * 64)
        print("OTONOM DİSİPLİN KORUYUCUSU: Bu commit dökümantasyon eksikliği nedeniyle reddedildi.")
        print("Gerçek otonom yapı, yapılan her işin izlenebilir olmasını gerektirir.")
        print("!" * 64 + "\n")
        return 1

    # Genellik Denetimi
    if len(code_files) > 0 and len(registry_files) == 0:
        print("🚨 GENEL İHLAL: Kod değişti ama döküman değişmedi.")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
