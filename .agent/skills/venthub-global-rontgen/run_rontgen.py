import os
import json
import sys
import subprocess
import re
from datetime import datetime

# ==========================================
# VENTHUB ENTERPRISE RÖNTGEN ENGINE (V8)
# ==========================================

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "rontgen-template.json")
REPORT_PATH = "venthub_global_rontgen_report.json"
ALLOWED_TOOLS = ["pnpm", "node", "python", "regex_scan"]

def load_template():
    if not os.path.exists(TEMPLATE_PATH):
        print(f"HATA: {TEMPLATE_PATH} bulunamadı.")
        sys.exit(1)
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def run_subprocess(tool, args):
    """Güvenli süreç yürütücüsü (Shell=False)"""
    # Windows'ta npm/pnpm çalıştırmak için shell=True gerekebilir ancak güvenlik için
    # .cmd uzantısını tam bularak shell=False ile çalıştırabiliriz veya shutil.which kullanırız.
    import shutil
    executable = shutil.which(tool)
    if not executable and os.name == 'nt' and tool in ['pnpm', 'node', 'npm']:
        executable = shutil.which(tool + ".cmd")
        
    if not executable:
        executable = tool  # Fallback

    try:
        env = os.environ.copy()
        env["CI"] = "true"
        
        result = subprocess.run(
            [executable] + args,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=False, # Kesinlikle güvenli
            env=env
        )
        return result.returncode, result.stdout + result.stderr
    except Exception as e:
        return 1, str(e)

def run_regex_scan(pattern, paths):
    """
    Dahili regex tarayıcı: Gelen pattern'i belirtilen yollarda arar.
    paths dizisinin son elemanı --exclude=... olabilir.
    """
    exclude_pattern = None
    target_dirs = []
    for p in paths:
        if p.startswith("--exclude="):
            exclude_pattern = p.replace("--exclude=", "")
        else:
            target_dirs.append(p)
    
    matches = []
    
    try:
        regex = re.compile(pattern)
        ex_regex = re.compile(exclude_pattern) if exclude_pattern else None
    except Exception as e:
        return 1, f"Geçersiz Regex: {e}"

    for d in target_dirs:
        top = os.path.abspath(d)
        if not os.path.exists(top):
            continue
        for root, _, files in os.walk(top):
            for file in files:
                if file.endswith((".ts", ".tsx", ".js", ".jsx")):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        for i, line in enumerate(lines):
                            if regex.search(line):
                                if ex_regex and ex_regex.search(line):
                                    continue
                                matches.append(f"{os.path.relpath(filepath)}:{i+1} -> {line.strip()}")
    
    if matches:
        return 1, "Bulgular:\n" + "\n".join(matches)
    return 0, "Temiz."

def main():
    print(f"[VENTHUB SURGICAL RÖNTGEN ENGINE] Başlatılıyor...")
    data = load_template()
    data["rontgen_date"] = datetime.now().isoformat()
    
    # Git SHA loglamasi
    try:
        sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
        data["git_commit_sha"] = sha
    except:
        pass

    has_strict_failure = False

    for check_id, check_data in data.get("checks", {}).items():
        executor = check_data.get("executor")
        enforcement_level = check_data.get("enforcement_level", "WARNING")
        
        if not executor:
            check_data["status"] = "PENDING"
            continue
            
        tool = executor.get("tool")
        args = executor.get("args", [])
        expected_codes = executor.get("expected_exit_codes", [0])

        if tool not in ALLOWED_TOOLS:
            check_data["status"] = "FAIL"
            check_data["evidence"] = f"Güvenlik İhlali: Kuralsız araç kullanımı engellendi '{tool}'."
            has_strict_failure = True
            print(f"[{check_id}] BLOCKED - Unauthorized tool: {tool}")
            continue

        print(f"[{check_id}] -> Çalışıyor...", flush=True)
        
        if tool == "regex_scan":
            code, output = run_regex_scan(args[0], args[1:])
        else:
            code, output = run_subprocess(tool, args)

        # NEXT.JS BUNDLE SIZE PARSER (Özel kural)
        if check_id == "5_build_and_bundle_size_guard" and tool == "pnpm" and "build" in args:
            # Build ciktisinda boyut uyarisini (Large chunks) tespit et
            warnings = []
            for line in output.split('\n'):
                if "Warning: data for page" in line or "large page" in line.lower() or "first load js" in line.lower():
                    warnings.append(line.strip())
            
            if warnings:
                output += "\n--- BUNDLE SIZE OLANAKLI UYARILARI ---\n" + "\n".join(warnings)
                if enforcement_level == "STRICT":
                    code = 1 # Eger strict ise patlat

        check_data["evidence"] = output[:2000] # Makul boyut
        
        if code in expected_codes:
            check_data["status"] = "PASS"
            print(f"[{check_id}] PASS")
        else:
            check_data["status"] = "FAIL"
            print(f"[{check_id}] FAIL (Code: {code})")
            if enforcement_level == "STRICT":
                has_strict_failure = True

    if has_strict_failure:
        data["overall_ship_status"] = "BLOCKED"
        print("\n[VERDICT] BLOCKED: Katı (STRICT) denetimlerde hatalar bulundu.")
    else:
        # Warning'ler olabilir ama strict fail yok
        data["overall_ship_status"] = "READY"
        print("\n[VERDICT] READY: Tüm STRICT denetimler başarıyla geçildi.")

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"[VENTHUB] Rapor oluşturuldu: {REPORT_PATH}")
    
    if has_strict_failure:
        sys.exit(1)

if __name__ == "__main__":
    main()
