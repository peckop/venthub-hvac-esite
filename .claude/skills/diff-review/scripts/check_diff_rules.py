#!/usr/bin/env python3
"""
VentHub Diff-Review Rules Engine
Purpose: Statically analyze the diff against the merge-base of the branch (committed + staged + unstaged
changes in ONE pass) to detect anti-patterns and dangerous code changes.
Usage:   check_diff_rules.py [--taban <ref>]
         Base order: --taban argument -> origin/master -> master. If none resolves, falls back to
         'git diff HEAD' (uncommitted changes only) and says so with a [UYARI] line - never a silent green.
Exit Code: 1 if blocker found (blocks /bitir), 2 if the scan could not run, 0 otherwise.
"""

import argparse
import re
import subprocess
import sys

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

# --taban verilmezse sırayla denenir.
DEFAULT_BASES = ("origin/master", "master")


def configure_output() -> None:
    """Windows'un eski kod sayfalarinda (cp1254 vb.) ASCII disi karakter basmak UnicodeEncodeError verir
    ve ihlal raporu yerine traceback cikar. Cikti UTF-8'e alinir; olmazsa 'replace' ile bozulur ama CRASH olmaz."""
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except (ValueError, OSError):
                pass


def git(args: list):
    """Calistirir; (cikis_kodu, stdout) doner. git yoksa (127, '')."""
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True, text=True, check=False, encoding='utf-8', errors='replace'
        )
        return result.returncode, result.stdout
    except OSError:
        return 127, ""


def resolve_base(ref: str):
    """ref -> (ref, merge_base_sha) ya da None. merge-base HEAD ile alinir: dal ana hattan ayrildigi nokta."""
    code, _ = git(["rev-parse", "--verify", "--quiet", ref + "^{commit}"])
    if code != 0:
        return None
    code, out = git(["merge-base", ref, "HEAD"])
    sha = out.strip()
    if code != 0 or not sha:
        return None
    return ref, sha


def get_diff(cli_base):
    """(diff_metni, taban_aciklamasi, uyari_listesi, hata) doner. hata None degilse tarama CALISAMADI."""
    warnings = []
    candidates = (cli_base,) if cli_base else DEFAULT_BASES
    for ref in candidates:
        base = resolve_base(ref)
        if base:
            code, out = git(["diff", base[1]])
            if code != 0:
                return "", None, warnings, f"git diff {base[1][:7]} basarisiz (cikis {code})"
            return out, f"{base[0]} (merge-base {base[1][:7]})", warnings, None

    if cli_base:
        return "", None, warnings, f"--taban '{cli_base}' cozulemedi: dal/commit bulunamadi"

    # Taban yok (ilk commit oncesi, master/origin yok): eski davranis, AMA sessiz degil.
    warnings.append(
        "[UYARI] taban bulunamadi (origin/master, master): yalniz commitlenmemis degisiklik "
        "(git diff HEAD) tarandi; commitli dal icerigi TARANMADI. --taban <dal> ile taban verin."
    )
    code, out = git(["diff", "HEAD"])
    if code != 0:
        code, out = git(["diff", "--cached"])
        if code != 0:
            return "", None, warnings, "git diff calistirilamadi (git deposu mu? HEAD var mi?)"
    return out, "yok (git diff HEAD)", warnings, None


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
    configure_output()
    parser = argparse.ArgumentParser(description="VentHub diff-review kural motoru")
    parser.add_argument("--taban", default=None, help="taban dal/commit (varsayilan: origin/master, sonra master)")
    args = parser.parse_args()

    print("[INFO] VentHub Diff-Review Integrity Checker baslatiliyor...")
    diff_output, base_label, warnings, error = get_diff(args.taban)

    if error:
        print(f"[HATA] Tarama calistirilamadi: {error}")
        sys.exit(2)

    print(f"[INFO] Taban: {base_label}")
    for w in warnings:
        print(w)

    if not diff_output.strip():
        print("[OK] Degisiklik bulunamadi veya diff temiz.")
        sys.exit(0)

    violations = analyze_diff(diff_output)

    if not violations:
        print("[OK] Kod degisiklikleri otonom analizden basariyla gecti. Yikici anti-pattern tespit edilmedi.")
        sys.exit(0)

    has_blocker = False
    print("\n[WARNING] DIKKAT: ASAGIDAKI TEHLIKELI KALIPLAR TESPIT EDILDI:")
    print("="*60)
    for v in violations:
        print(f"[{v['severity']}] Dosya: {v['file']}")
        print(f"  - Kural    : {v['description']}")
        print(f"  - Satir    : {v['line']}")
        print("  - Cozum/Pass: Ilerlemek zorunluysa ilgili satira '// diff-ignore' yorumu ekleyin.\n")

        if v['severity'] == "BLOCKER":
            has_blocker = True

    print("="*60)

    if has_blocker:
        print("[FAIL] [BLOCKER] tespit edildi. Islem (/bitir veya Execute) reddedildi.")
        print("Lutfen hatalari duzeltin veya '// diff-ignore' ekleyip tekrar deneyin.")
        sys.exit(1)
    else:
        print("[WARNING] Uyarilar var ama [BLOCKER] bulunamadi. Lutfen degisikliklerinizi manuel gozden gecirin.")
        sys.exit(0) # MAJOR and MINOR are just warnings


if __name__ == "__main__":
    main()
