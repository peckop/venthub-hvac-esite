# -*- coding: utf-8 -*-
import re
import sys
import itertools
from typing import List, Optional
from pathlib import Path

# VENTHUB INTEGRITY CHECKER (V5 - Anti-Robot Discipline Edition)
# Mantik: Ajanin type kacaklarina basvurmasini, i18n sizintisina goz yummasini
# ve baglamdan kopuk console.log birakmasini tespit eder.
# Her kontrol [BLOCKER] veya [WARNING] olarak raporlanir.

sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # type: ignore[union-attr]

CRITICAL_PATHS = ["src/components", "src/views", "src/app", "src/hooks", "src/lib"]
ERROR_THRESHOLD = 20

# --- BLOCKER Kontrolleri (0 tolerans, commit'i durdurur) ---

def check_type_escape(content: str, file_path: Path) -> list[str]:
    """
    Kontrol: Tip Kaçağı (Type Escape) — BLOCKER
    Giriş: .ts / .tsx dosyası içeriği
    İşlem: Yasaklı ifadeleri (as any, @ts-ignore vb.) regex ile arar
    Çıktı: Her bulgu için hata mesajı listesi
    """
    issues = []
    forbidden_patterns = [
        (r'\bas\s+any\b',           "as any"),
        (r'@ts-ignore',             "@ts-ignore"),
        (r'@ts-expect-error(?!\s+.+REASON:)', "@ts-expect-error (gerekçesiz)"),
        (r'\bas\s+unknown\s+as\b',  "as unknown as"),
        (r'//\s*eslint-disable(?!-next-line react-hooks)', "eslint-disable (geniş kapsam)"),
        (r'Record<string,\s*any>',  "Record<string, any>"),
    ]
    for pattern, label in forbidden_patterns:
        if re.search(pattern, content):
            issues.append(
                f"[BLOCKER] Tip Kacagi: '{label}' kullanimi yasaktir -> {file_path}"
            )
    return issues


def check_hydration_risk(content: str, file_path: Path) -> list[str]:
    """
    Kontrol: Hydration Risk — BLOCKER
    Giriş: .ts / .tsx dosyası içeriği
    İşlem: window/localStorage kullanımının useEffect veya typeof window ile sarmalanıp sarmalanmadığını denetler
    Çıktı: Hata mesajı listesi
    """
    issues = []
    if re.search(r'\bwindow\.\b|\blocalStorage\.\b', content):
        if "useEffect" not in content and "typeof window" not in content:
            issues.append(
                f"[BLOCKER] Hydration Riski: window/localStorage, useEffect veya typeof guard olmadan kullanilmis -> {file_path}"
            )
    return issues


def check_property_mismatch(content: str, file_path: Path) -> list[str]:
    """
    Kontrol: Özellik Uyumsuzluğu (_id vs .id) — BLOCKER
    Giriş: .ts / .tsx dosyası içeriği
    İşlem: _id tanımı olan dosyada .id kullanımını arar (Anti-Robot kanca)
    Çıktı: Hata mesajı listesi
    """
    issues = []
    if re.search(r'[\{,]\s*_id\s*:', content) and re.search(r'\.id\b', content):
        issues.append(
            f"[BLOCKER] Ozellik Uyumsuzlugu: '_id' tanimli ama '.id' kullaniliyor -> {file_path}"
        )
    return issues


# --- WARNING Kontrolleri (kod kalite uyarısı, CI'da bloklayabilir) ---

def check_i18n_leakage(content: str, file_path: Path) -> list[str]:
    """
    Kontrol: i18n Sızıntısı — WARNING
    Giriş: .tsx dosyası içeriği
    İşlem: JSX içinde iki veya daha fazla kelimeden oluşan Türkçe hardcoded string arar
    Çıktı: Uyarı mesajı listesi
    """
    if file_path.suffix != '.tsx':
        return []
    issues = []
    # JSX içinde çift tırnaklı veya süslü parantez içi string literal arar
    # Türkçeye özgü karakterleri (ş, ı, ğ, ü, ö, ç) içeren 2+ kelimelik metinler
    turkish_pattern = re.compile(r'["\'>]([A-Za-zÇçĞğİıÖöŞşÜü]+ [A-Za-zÇçĞğİıÖöŞşÜü]+)["\']')
    matches = turkish_pattern.findall(content)
    typed_strings = [m for m in matches if any(c in m for c in 'çğışüöÇĞİŞÜÖ')]
    if typed_strings:
        for s in itertools.islice(typed_strings, 3):  # Ilk 3 ornegi goster
            issues.append(
                f"[WARNING] i18n Sizintisi: '{s}' hardcoded metin bulundu -> {file_path}"
            )
    return issues


def check_console_leakage(content: str, file_path: Path) -> list[str]:
    """
    Kontrol: Console Kaçağı — WARNING
    Giriş: .ts / .tsx dosyası içeriği
    İşlem: Üretim kodunda kalmaması gereken console.log ifadelerini arar
    Not: console.warn ve console.error izinlidir (kasıtlı hata yönetimi)
    Çıktı: Uyarı mesajı listesi
    """
    issues = []
    # console.log ifadelerini yakala ama yorum satırındakileri atla
    log_pattern = re.compile(r'(?<!//\s)\bconsole\.log\b')
    if log_pattern.search(content):
        count = len(log_pattern.findall(content))
        issues.append(
            f"[WARNING] Console Kacagi: {count} adet console.log uretim kodunda birakilmis -> {file_path}"
        )
    return issues


def check_naming_violation(content: str, file_path: Path) -> list[str]:
    """
    Kontrol: İsimlendirme İhlali (PascalCase) — WARNING
    Giriş: .tsx dosyası içeriği
    İşlem: '_' öneki ile susturulmuş bileşen tanımlarını arar
    Çıktı: Uyarı mesajı listesi
    """
    issues = []
    if re.search(r'const\s+_([A-Z])', content):
        issues.append(
            f"[WARNING] Isimlendirme Ihlali: '_' onekiyle susturulmus bilesen ismi -> {file_path}"
        )
    return issues


# --- ANA DENETİM MOTORU ---

def check_file(file_path: Path) -> tuple[list[str], list[str]]:
    """
    Giriş: Tek bir dosya yolu
    İşlem: Tüm kontrolleri sırayla çalıştırır
    Çıktı: (blocker_listesi, warning_listesi) tuple'ı
    """
    if file_path.suffix not in ['.tsx', '.ts']:
        return [], []

    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return [], []

    blockers: list[str] = []
    warnings: list[str] = []

    # BLOCKER kontrolleri
    blockers.extend(check_type_escape(content, file_path))
    blockers.extend(check_hydration_risk(content, file_path))
    blockers.extend(check_property_mismatch(content, file_path))

    # WARNING kontrolleri
    warnings.extend(check_i18n_leakage(content, file_path))
    warnings.extend(check_console_leakage(content, file_path))
    warnings.extend(check_naming_violation(content, file_path))

    return blockers, warnings


def run_audit(target_paths: Optional[List[str]] = None) -> int:
    """
    Giriş: İsteğe bağlı hedef yollar listesi (None = CRITICAL_PATHS tümü)
    İşlem: Belirtilen dizinlerdeki tüm .ts/.tsx dosyalarını tarar
    Çıktı: 0 (temiz) veya 1 (sorun var), çıkış kodu
    """
    print("=" * 70)
    print("🔬 VentHub Integrity Checker V5 — Anti-Robot Discipline Edition")
    print("=" * 70)

    scan_paths = target_paths if target_paths else CRITICAL_PATHS

    all_blockers: list[str] = []
    all_warnings: list[str] = []

    for root in scan_paths:
        root_path = Path(root)
        if not root_path.exists():
            print(f"[SKIP] Atlandi (dizin yok): {root}")
            continue
        for p in root_path.rglob('*'):
            if p.is_file():
                b, w = check_file(p)
                all_blockers.extend(b)
                all_warnings.extend(w)

    total_blockers = len(all_blockers)
    total_warnings = len(all_warnings)

    # Raporlama
    if all_warnings:
        print(f"\n[WARNINGS] ({total_warnings} adet) - Duzeltilmesi onerilir:")
        for w in all_warnings:
            print(f"  {w}")

    if all_blockers:
        print(f"\n{'!'*70}")
        print(f"[BLOCKERS] ({total_blockers} adet) - GOREV KAPATILAMAZ:")
        for b in all_blockers:
            print(f"  {b}")
        print(f"{'!'*70}")

    total = total_blockers + total_warnings

    if total == 0:
        print("\n[OK] MUKEMMEL: Sifir hata, sifir uyari. Mimari butunluk onaylandi.")
        return 0

    if total_blockers == 0 and total_warnings > 0:
        print(f"\n[INFO] Uyarilar mevcut ({total_warnings}) ancak commit engellenmiyor.")
        print("   Bir sonraki PR'dan once temizlenmesi onerilir.")
        return 0

    if total_blockers < ERROR_THRESHOLD:
        impact = (1 / total_blockers) * 100
        print(f"\n[SURGICAL] Cerrahi Mod: {total_blockers} blocker kaldi.")
        print(f"   Her duzeltme toplam kalitenin %{impact:.1f}'ini temsil ediyor.")

    print(f"\n[FAIL] Toplam {total_blockers} BLOCKER. Dortlu Muhur uygulanamaz. Commit reddedilecek.")
    return 1


if __name__ == "__main__":
    # Istege bagli: python check_integrity.py src/components/ui gibi spesifik dizin taramasi
    _argv: List[str] = list(sys.argv)
    target: Optional[List[str]] = list(itertools.islice(_argv, 1, len(_argv))) if len(_argv) > 1 else None
    sys.exit(run_audit(target))
