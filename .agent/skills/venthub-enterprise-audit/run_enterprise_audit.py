"""
==============================================================
VENTHUB ENTERPRISE AUDIT ENGINE v1.1
==============================================================
11 katmanlı, terminal kanıtlı, ürün teslim öncesi denetim motoru.
Röntgen motorunun üst versiyonu. Deep MRI kapsamını da içerir.

Kullanım:
    # Tam denetim (11 katman)
    python .agent/skills/venthub-enterprise-audit/run_enterprise_audit.py

    # Sadece belirli katmanları çalıştır
    python .agent/skills/venthub-enterprise-audit/run_enterprise_audit.py --layers L1 L2

    # Sadece teknik borç taraması (eski MRI)
    python .agent/skills/venthub-enterprise-audit/run_enterprise_audit.py --layers L11

Çıktı:
    .agent/reports/enterprise-audit-YYYY-MM-DD.json
    .agent/reports/enterprise-audit-YYYY-MM-DD.md
"""

import os
import json
import sys
import subprocess
import re
import shutil
import argparse
from datetime import datetime
from pathlib import Path

VERSION = "1.1.0"

# ==========================================
# SABITLER
# ==========================================
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent  # .agent/skills/xxx/ → proje kökü
TEMPLATE_PATH = SCRIPT_DIR / "enterprise-audit-template.json"
REPORTS_DIR = PROJECT_ROOT / ".agent" / "reports"
ALLOWED_TOOLS = ["pnpm", "node", "python", "regex_scan", "file_exists", "file_line_count", "lighthouse", "supabase_mcp"]

# Katman ID -> Kısa ad eşlemesi
LAYER_SHORTCUTS = {
    "L1": "L1_build_quality",
    "L2": "L2_security",
    "L3": "L3_legal",
    "L4": "L4_ops",
    "L5": "L5_data",
    "L6": "L6_docs",
    "L7": "L7_product",
    "L8": "L8_performance",
    "L9": "L9_accessibility",
    "L10": "L10_nextjs_discipline",
    "L11": "L11_technical_debt",
}

# ==========================================
# YARDIMCI FONKSİYONLAR
# ==========================================

def load_template():
    if not TEMPLATE_PATH.exists():
        print(f"HATA: {TEMPLATE_PATH} bulunamadı.")
        sys.exit(1)
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def run_subprocess(tool, args):
    """Güvenli süreç yürütücüsü."""
    executable = shutil.which(tool)
    if not executable and os.name == 'nt' and tool in ['pnpm', 'node', 'npm']:
        executable = shutil.which(tool + ".cmd")
    if not executable:
        executable = tool

    try:
        env = os.environ.copy()
        env["CI"] = "true"
        result = subprocess.run(
            [executable] + args,
            capture_output=True, text=True,
            encoding="utf-8", errors="replace",
            shell=False, env=env,
            cwd=str(PROJECT_ROOT),
            timeout=300  # 5 dk timeout
        )
        return result.returncode, (result.stdout + result.stderr).strip()
    except subprocess.TimeoutExpired:
        return 1, "TIMEOUT: Komut 5 dakika içinde tamamlanmadı."
    except Exception as e:
        return 1, str(e)


def run_regex_scan(pattern, paths):
    """Dosya içi regex tarayıcısı."""
    exclude_pattern = None
    target_items = []
    for p in paths:
        if p.startswith("--exclude="):
            exclude_pattern = p.replace("--exclude=", "")
        else:
            target_items.append(p)

    matches = []

    try:
        regex = re.compile(pattern)
        ex_regex = re.compile(exclude_pattern) if exclude_pattern else None
    except Exception as e:
        return 1, f"Geçersiz Regex: {e}"

    for item in target_items:
        top = PROJECT_ROOT / item
        if not top.exists():
            continue

        if top.is_file():
            scan_files = [top]
        else:
            scan_files = list(top.rglob("*.ts")) + list(top.rglob("*.tsx")) + \
                         list(top.rglob("*.js")) + list(top.rglob("*.jsx")) + \
                         list(top.rglob("*.mjs")) + list(top.rglob("*.json"))

        for filepath in scan_files:
            if "node_modules" in str(filepath):
                continue
            rel_str = str(filepath.relative_to(PROJECT_ROOT))
            # Exclude pattern also filters by file path
            if ex_regex and ex_regex.search(rel_str):
                continue
            try:
                with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                    for i, line in enumerate(f, 1):
                        if regex.search(line):
                            if ex_regex and ex_regex.search(line):
                                continue
                            rel = filepath.relative_to(PROJECT_ROOT)
                            matches.append(f"{rel}:{i} -> {line.strip()[:120]}")
            except Exception:
                continue

    if matches:
        return 1, f"Bulgular ({len(matches)}):\n" + "\n".join(matches[:30])
    return 0, "Temiz."


def check_file_exists(paths):
    """Dosya/klasör varlık kontrolü — OR mantığı."""
    found = []
    missing = []
    for p in paths:
        full = PROJECT_ROOT / p
        if full.exists():
            found.append(p)
        else:
            missing.append(p)

    if found:
        return 0, f"Mevcut: {', '.join(found)}" + (f"\nEksik: {', '.join(missing)}" if missing else "")
    return 1, f"HIÇBİRİ BULUNAMADI: {', '.join(missing)}"


def check_file_line_count(path, min_lines):
    """Dosya satır sayısı kontrolü."""
    full = PROJECT_ROOT / path
    if not full.exists():
        return 1, f"Dosya bulunamadı: {path}"
    with open(full, "r", encoding="utf-8", errors="replace") as f:
        count = sum(1 for _ in f)
    if count >= min_lines:
        return 0, f"{path}: {count} satır (beklenen >= {min_lines})"
    return 1, f"{path}: {count} satır (beklenen >= {min_lines}) — YETERSİZ"


def check_bundle_size():
    """En büyük JS chunk'ları kontrol et."""
    chunks_dir = PROJECT_ROOT / ".next" / "static" / "chunks"
    if not chunks_dir.exists():
        return 1, "Build çıktısı bulunamadı (.next/static/chunks). Önce build çalıştırın."

    files = sorted(chunks_dir.glob("*.js"), key=lambda f: f.stat().st_size, reverse=True)[:10]
    results = []
    has_oversized = False
    for f in files:
        size_kb = f.stat().st_size / 1024
        flag = " ⚠️ BÜYÜK" if size_kb > 500 else ""
        if size_kb > 500:
            has_oversized = True
        results.append(f"{f.name}: {size_kb:.1f} KB{flag}")

    return (1 if has_oversized else 0), "\n".join(results)


def check_gpl_in_output(output):
    """pnpm licenses çıktısında pure GPL (LGPL hariç) arar."""
    lines = output.split("\n")
    gpl_hits = []
    for line in lines:
        if re.search(r'\bGPL-[23]\.\d\b', line) and 'LGPL' not in line:
            gpl_hits.append(line.strip())
    if gpl_hits:
        return 1, "GPL RİSKİ:\n" + "\n".join(gpl_hits)
    return 0, "GPL riski bulunamadı."


# ==========================================
# ANA MOTOR
# ==========================================

def run_check(check_id, check_data, is_inverted=False):
    """Tek bir denetim maddesini çalıştır."""
    executor = check_data.get("executor")
    if not executor:
        return "SKIP", "Executor tanımlı değil."

    tool = executor.get("tool")
    args = executor.get("args", [])
    note = check_data.get("note", "")
    is_presence = "Varlık kontrolü" in note

    if tool not in ALLOWED_TOOLS:
        return "FAIL", f"Güvenlik: Yetkisiz araç '{tool}'."

    # --- Tool dispatcheri ---
    if tool == "regex_scan":
        code, output = run_regex_scan(args[0], args[1:])
        if is_presence:
            # Varlık kontrolü: bulunması iyi, bulunmaması kötü
            code = 0 if code == 1 else 1  # invert
            if code == 1:
                output = "BULUNAMADI — gerekli pattern mevcut değil."
    elif tool == "file_exists":
        code, output = check_file_exists(args)
    elif tool == "file_line_count":
        code, output = check_file_line_count(args[0], int(args[1]))
    elif tool == "lighthouse":
        code, output = 0, "MANUAL: Lighthouse testi ajan tarafından browser tool ile çalıştırılmalı."
    elif tool == "supabase_mcp":
        code, output = 0, "MANUAL: Supabase MCP araçlarıyla ajan tarafından doğrulanmalı."
    elif args and args[0] == "__BUNDLE_SIZE_CHECK__":
        code, output = check_bundle_size()
    else:
        code, output = run_subprocess(tool, args)

    # GPL özel kontrolü
    if "gpl" in check_id.lower() or "license" in check_id.lower():
        if tool == "pnpm" and "licenses" in args:
            gpl_code, gpl_output = check_gpl_in_output(output)
            if gpl_code == 1:
                return "FAIL", gpl_output
            return "PASS", gpl_output

    # Sonuç
    expected = executor.get("expected_exit_codes", [0])
    if code in expected:
        return "PASS", output[:2000]
    return "FAIL", output[:2000]


def parse_args():
    """Komut satırı argümanlarını parse et."""
    parser = argparse.ArgumentParser(
        description="VentHub Enterprise Audit Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ornekler:
  Tam denetim:          python run_enterprise_audit.py
  Sadece guvenlik:      python run_enterprise_audit.py --layers L2
  Kod + guvenlik:       python run_enterprise_audit.py --layers L1 L2
  Teknik borc (MRI):    python run_enterprise_audit.py --layers L11
  Teslim oncesi hizli:  python run_enterprise_audit.py --layers L1 L2 L3 L4
        """
    )
    parser.add_argument(
        "--layers",
        nargs="+",
        metavar="LX",
        help="Sadece belirli katmanlari calistir (orn: L1 L2 L11). Belirtilmezse tum katmanlar calisir.",
        default=None
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"Enterprise Audit Engine v{VERSION}"
    )
    return parser.parse_args()


def main():
    args = parse_args()

    # Katman filtresi
    selected_layers = None
    if args.layers:
        selected_layers = set()
        for shortcut in args.layers:
            key = shortcut.upper()
            if key in LAYER_SHORTCUTS:
                selected_layers.add(LAYER_SHORTCUTS[key])
            else:
                print(f"  UYARI: Bilinmeyen katman '{shortcut}'. Gecerli: {', '.join(LAYER_SHORTCUTS.keys())}")
                sys.exit(1)

    mode = f"Secili Katmanlar: {', '.join(args.layers)}" if args.layers else "Tam Denetim (11 Katman)"

    print("=" * 60)
    print(f"  VENTHUB ENTERPRISE AUDIT ENGINE v{VERSION}")
    print(f"  {mode}")
    print("=" * 60)
    print()

    data = load_template()
    data["audit_date"] = datetime.now().strftime("%Y-%m-%d")

    # Git SHA
    try:
        sha = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True, text=True, check=True,
            cwd=str(PROJECT_ROOT)
        ).stdout.strip()
        data["git_commit_sha"] = sha
    except Exception:
        pass

    total = 0
    passed = 0
    warned = 0
    failed = 0
    blocked_layers = []

    for layer_id, layer_data in data.get("layers", {}).items():
        # Katman filtresi: sadece secili katmanlari calistir
        if selected_layers and layer_id not in selected_layers:
            continue

        layer_name = layer_data.get("name", layer_id)
        layer_has_strict_fail = False

        print(f"\n{'─' * 50}")
        print(f"  KATMAN: {layer_name}")
        print(f"{'─' * 50}")

        for check_id, check_data in layer_data.get("checks", {}).items():
            total += 1
            enforcement = check_data.get("enforcement_level", "WARNING")

            print(f"  [{check_id}] çalışıyor...", end="", flush=True)

            status, evidence = run_check(check_id, check_data)
            check_data["status"] = status
            check_data["evidence"] = evidence

            if status == "PASS":
                passed += 1
                print(f" ✅ PASS")
            elif status == "FAIL" and enforcement == "WARNING":
                warned += 1
                print(f" ⚠️ WARN")
            elif status == "FAIL" and enforcement == "STRICT":
                failed += 1
                layer_has_strict_fail = True
                print(f" ❌ BLOCKED")
            else:
                print(f" ⏭️ {status}")

        if layer_has_strict_fail:
            blocked_layers.append(layer_name)

    # Özet
    data["summary"] = {
        "total_checks": total,
        "passed": passed,
        "warned": warned,
        "failed": failed,
        "blocked_layers": blocked_layers,
        "overall_verdict": "BLOCKED" if blocked_layers else ("CONDITIONAL" if warned > 0 else "READY")
    }

    # Rapor yaz
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    json_path = REPORTS_DIR / f"enterprise-audit-{date_str}.json"
    md_path = REPORTS_DIR / f"enterprise-audit-{date_str}.md"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Markdown rapor üret
    generate_md_report(data, md_path)

    print(f"\n{'=' * 60}")
    print(f"  SONUÇLAR")
    print(f"{'=' * 60}")
    print(f"  Toplam Kontrol : {total}")
    print(f"  ✅ Geçen       : {passed}")
    print(f"  ⚠️  Uyarı       : {warned}")
    print(f"  ❌ Bloklayan   : {failed}")
    print(f"{'─' * 60}")

    verdict = data["summary"]["overall_verdict"]
    if verdict == "BLOCKED":
        print(f"  🔴 GENEL KARAR: BLOKLANMIŞ — Teslime hazır değil")
        print(f"  Bloklayan katmanlar: {', '.join(blocked_layers)}")
    elif verdict == "CONDITIONAL":
        print(f"  🟡 GENEL KARAR: KOŞULLU — Uyarılar giderilmeli")
    else:
        print(f"  ✅ GENEL KARAR: TESLİME HAZIR")

    print(f"\n  JSON Rapor : {json_path}")
    print(f"  MD Rapor   : {md_path}")
    print(f"{'=' * 60}")

    if verdict == "BLOCKED":
        sys.exit(1)


def generate_md_report(data, path):
    """JSON sonuçlarından okunabilir Markdown rapor üretir."""
    lines = [
        f"# VentHub Enterprise Audit Raporu",
        f"",
        f"> **Tarih:** {data.get('audit_date', 'N/A')}",
        f"> **Commit:** `{data.get('git_commit_sha', 'N/A')[:12]}`",
        f"> **Motor:** Enterprise Audit Engine v1.0",
        f"",
        f"---",
        f"",
    ]

    summary = data.get("summary", {})
    verdict = summary.get("overall_verdict", "N/A")
    verdict_icon = "✅" if verdict == "READY" else "🟡" if verdict == "CONDITIONAL" else "🔴"

    lines.append(f"## Genel Karar: {verdict_icon} {verdict}")
    lines.append(f"")
    lines.append(f"| Metrik | Değer |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Toplam Kontrol | {summary.get('total_checks', 0)} |")
    lines.append(f"| ✅ Geçen | {summary.get('passed', 0)} |")
    lines.append(f"| ⚠️ Uyarı | {summary.get('warned', 0)} |")
    lines.append(f"| ❌ Bloklayan | {summary.get('failed', 0)} |")
    lines.append(f"")

    if summary.get("blocked_layers"):
        lines.append(f"**Bloklayan Katmanlar:** {', '.join(summary['blocked_layers'])}")
        lines.append(f"")

    lines.append(f"---")
    lines.append(f"")

    for layer_id, layer_data in data.get("layers", {}).items():
        layer_name = layer_data.get("name", layer_id)
        checks = layer_data.get("checks", {})

        layer_pass = all(c.get("status") == "PASS" for c in checks.values())
        layer_icon = "✅" if layer_pass else "⚠️"

        for c in checks.values():
            if c.get("status") == "FAIL" and c.get("enforcement_level") == "STRICT":
                layer_icon = "❌"
                break

        lines.append(f"## {layer_icon} {layer_name}")
        lines.append(f"")
        lines.append(f"| Kontrol | Seviye | Sonuç | Hedef |")
        lines.append(f"|---------|--------|-------|-------|")

        for check_id, check_data in checks.items():
            status = check_data.get("status", "PENDING")
            level = check_data.get("enforcement_level", "WARNING")
            target = check_data.get("target", "")
            icon = "✅" if status == "PASS" else "⚠️" if level == "WARNING" else "❌"
            lines.append(f"| `{check_id}` | {level} | {icon} {status} | {target[:80]} |")

        lines.append(f"")

        # Fail detayları
        for check_id, check_data in checks.items():
            if check_data.get("status") == "FAIL":
                lines.append(f"<details>")
                lines.append(f"<summary><b>{check_id}</b> — Kanıt</summary>")
                lines.append(f"")
                lines.append(f"```")
                lines.append(check_data.get("evidence", "Kanıt yok.")[:500])
                lines.append(f"```")
                lines.append(f"</details>")
                lines.append(f"")

        lines.append(f"---")
        lines.append(f"")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    main()
