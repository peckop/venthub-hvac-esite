import sys
import subprocess
from pathlib import Path

# VENTHUB REGISTRY GUARD (V3 - Full Domain Map Edition)
# Giriş: git diff --cached ile stage edilmiş dosyalar
# İşlem: Hangi kod domaininin hangi registry projesine bağlı olduğunu denetler
# Çıktı: 0 (temiz) veya 1 (ihlal var), commit'i bloklar

# --- ALAN HARİTASI (DOMAIN MAP) ---
# Her "Kaynak Dizin (src)" bir "Registry Projesi" ile eşleşmelidir.
# Kod değişince, ilgili görev dökümantasyonu da değişmek zorundadır.
DOMAIN_MAPPINGS: dict[str, str] = {
    # P01: Görsel Sayfa İnşaatçısı
    "src/app/(public)":                     "registry/P01-Visual-Page-Builder/active/",
    "src/views/home":                        "registry/P01-Visual-Page-Builder/active/",
    "src/views/product":                     "registry/P01-Visual-Page-Builder/active/",
    "src/views/brand":                       "registry/P01-Visual-Page-Builder/active/",
    "src/components/products":               "registry/P01-Visual-Page-Builder/active/",
    "src/app/_components":                   "registry/P01-Visual-Page-Builder/active/",

    # P02: Kalite Koruyucuları
    "src/views/admin":                       "registry/P02-Core-Quality-Guardians/active/",
    "src/app/(admin)":                       "registry/P02-Core-Quality-Guardians/active/",
    "src/lib/supabase":                      "registry/P02-Core-Quality-Guardians/active/",
    "src/i18n":                              "registry/P02-Core-Quality-Guardians/active/",
    "src/lib/type-converters":               "registry/P02-Core-Quality-Guardians/active/",

    # P03: 3D Deneyim
    "src/components/products/visual-models": "registry/P03-NextGen-3D-Experience/active/",

    # P04: Kategori Mimarisi
    "src/views/category":                    "registry/P04-Category-Architecture/active/",
    "src/config/categoryRegistry":           "registry/P04-Category-Architecture/active/",
    "src/components/navigation":             "registry/P04-Category-Architecture/active/",
    "src/app/(public)/[category]":           "registry/P04-Category-Architecture/active/",

    # P05: Next.js 15 Modernizasyonu
    "src/app/layout":                        "registry/P05-Next15-Modernization/active/",
    "src/app/page":                          "registry/P05-Next15-Modernization/active/",
    "src/app/error":                         "registry/P05-Next15-Modernization/active/",
    "src/app/not-found":                     "registry/P05-Next15-Modernization/active/",

    # P06: Sistem Zekası
    "registry/":                             "registry/P06-System-Intelligence-Registry/active/",
}

# Mimari değişiklik tetikleyicileri — Bunlar değişince MUTLAKA bir task dosyası güncellenmeli
MANDATORY_TRIGGERS: list[str] = [
    'package.json',
    'tsconfig.json',
    'tsconfig.build.json',
    'tailwind.config.ts',
    'next.config.ts',
    'next.config.mjs',
    'supabase/migrations',
    '.env.example',
    'eslint.config.mjs',
    'pnpm-lock.yaml',
]


def get_staged_files() -> list[str]:
    """
    Giriş: git index (stage area)
    İşlem: git diff --cached --name-only çalıştırır
    Çıktı: Stage edilmiş dosyaların yollarını string listesi olarak döndürür
    """
    try:
        output = subprocess.check_output(
            ['git', 'diff', '--cached', '--name-only'], text=True
        )
        return output.splitlines()
    except Exception as e:
        print(f"[Registry Guard] Git erişim hatası: {e}")
        return []


def classify_files(staged: list[str]) -> tuple[list[str], list[str], list[str]]:
    """
    Giriş: Stage edilmiş dosyalar listesi
    İşlem: Kod, registry ve tetikleyici dosyaları sınıflandırır
    Çıktı: (code_files, registry_files, mandatory_triggers) tuple'ı
    """
    code_files = [
        f for f in staged
        if (f.startswith('src/') or f.startswith('supabase/'))
        and any(f.endswith(ext) for ext in ['.tsx', '.ts', '.sql', '.css'])
        and not f.startswith('src/types/database.types')  # Tip dosyaları ayrı incelenir
    ]
    registry_files = [
        f for f in staged
        if (f.startswith('registry/') and f.endswith('.md'))
        or f in ['registry/PULSE.md', 'docs/CHANGELOG.md']
    ]
    triggered = [
        f for f in staged
        if any(trigger in f for trigger in MANDATORY_TRIGGERS)
    ]
    return code_files, registry_files, triggered


def check_domain_violations(
    code_files: list[str],
    registry_files: list[str]
) -> list[str]:
    """
    Giriş: Kod dosyaları ve registry dosyaları listesi
    İşlem: Her kod dosyasının ilgili domain'indeki registry kaydını denetler
    Çıktı: İhlal mesajları listesi
    """
    violations: list[str] = []
    # Stage edilmiş registry domain'lerini bir kümede topla
    covered_domains = {
        domain for domain in DOMAIN_MAPPINGS.values()
        if any(rf.startswith(domain) for rf in registry_files)
    }

    for cf in code_files:
        matched_domain: str | None = None
        required_registry: str | None = None

        for src_prefix, reg_dir in DOMAIN_MAPPINGS.items():
            if cf.startswith(src_prefix):
                matched_domain = src_prefix
                required_registry = reg_dir
                break

        if matched_domain and required_registry:
            if required_registry not in covered_domains:
                violations.append(
                    f"🚨 [DOMAIN İHLALİ] '{cf}'\n"
                    f"   → '{required_registry}' altındaki görev dosyası (Task .md) güncellenmemiş."
                )
    return violations


def main() -> int:
    staged = get_staged_files()
    if not staged:
        return 0  # Stage yoksa, commit boştur, geçer

    code_files, registry_files, mandatory_triggered = classify_files(staged)
    project_task_files = [f for f in registry_files if '/active/' in f or '/completed/' in f]

    violations: list[str] = []

    # --- A: Mimari Değişiklik Denetimi ---
    if mandatory_triggered and not project_task_files:
        for t in mandatory_triggered:
            violations.append(
                f"🚨 [MİMARİ DEĞİŞİKLİK] '{t}' değişti.\n"
                f"   → Sadece PULSE.md GÜNCELLENMESİ YETERSİZDİR.\n"
                f"   → Lütfen ilgili './registry/PXX.../active/*.md' görev dosyasını güncelleyin."
            )

    # --- B: Domain Eşleşme Denetimi ---
    violations.extend(check_domain_violations(code_files, registry_files))

    # --- C: Granülarite Denetimi ---
    # 5'ten fazla kod, sadece PULSE.md güncel → Şüpheli!
    only_pulse = registry_files == ['registry/PULSE.md'] or registry_files == ['docs/CHANGELOG.md']
    if len(code_files) > 5 and only_pulse:
        violations.append(
            f"🚨 [GRANÜLARİTE İHLALİ] {len(code_files)} kod dosyası değişti ama\n"
            f"   sadece PULSE.md/CHANGELOG.md güncellenmiş.\n"
            f"   → Bu hacimde bir iş için spesifik Task .md dökümantasyonu zorunludur."
        )

    # --- D: Genel Denetim (kod var, hiç registry yok) ---
    if code_files and not registry_files:
        violations.append(
            f"🚨 [GENEL İHLAL] {len(code_files)} kod dosyası değişti ama\n"
            f"   hiçbir registry/dökümantasyon dosyası stage edilmemiş.\n"
            f"   → 'Plansız Kod Yasağı' (No-Plan-No-Code) ihlal edildi."
        )

    # --- RAPOR ---
    if violations:
        print("\n" + "=" * 70)
        print("🛡️  VENTHUB REGISTRY GUARD V3 — OTONOM DİSİPLİN KORUYUCUSU")
        print("=" * 70)
        for v in violations:
            print(f"\n{v}")
        print("\n" + "!" * 70)
        print("Bu commit DÖKÜMANİŞ EKSİKLİĞİ nedeniyle REDDEDİLDİ.")
        print("Gerçek mühendislik: Her aksiyonun izi ve kaydı olmalıdır.")
        print("!" * 70 + "\n")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
