import os
import sys
import json
import argparse
import subprocess
import yaml
from pathlib import Path

def get_repo_root() -> Path:
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return Path(output.strip())
    except Exception:
        return Path(__file__).resolve().parent.parent

def run_command(cmd: str, cwd: Path) -> int:
    try:
        res = subprocess.run(cmd, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"      [Command Output] Stderr: {res.stderr.strip()}", file=sys.stderr)
            print(f"      [Command Output] Stdout: {res.stdout.strip()}", file=sys.stderr)
        return res.returncode
    except Exception as e:
        print(f"      [Exception] Failed to run command '{cmd}': {e}", file=sys.stderr)
        return -1

def main():
    parser = argparse.ArgumentParser(description="Autonomous Skills Orchestrator Runner.")
    parser.add_argument("--query", required=True, help="User request query to route and execute")
    args = parser.parse_args()
    
    repo_root = get_repo_root()
    manifest_path = repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"
    router_script = repo_root / "scripts" / "skills-router.py"
    
    print("\n==================================================")
    print("VentHub Otonom Ajan Orkestratör Motoru (Orchestrator)")
    print("==================================================\n")
    
    # 1. Run router to get the path
    print(f"[Orchestrator] Yönlendirici çalıştırılıyor, sorgu: '{args.query}'...")
    try:
        res = subprocess.run(
            [sys.executable, str(router_script), "--query", args.query],
            cwd=repo_root,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if res.returncode != 0:
            print(f"[ERROR] Yönlendirici başarısız oldu: {res.stderr.strip()}", file=sys.stderr)
            sys.exit(1)
        router_output = json.loads(res.stdout.strip())
    except Exception as e:
        print(f"[ERROR] Yönlendirici çalıştırılamadı: {e}", file=sys.stderr)
        sys.exit(1)
        
    status = router_output.get("status")
    if status == "CONVERSATIONAL":
        print("[Orchestrator] Bilgi: Sorgu genel sohbet (conversational) olarak etiketlendi.")
        print("[Orchestrator] Herhangi bir yetenek zinciri tetiklenmedi.")
        return
        
    path = router_output.get("path", [])
    print(f"[Orchestrator] Yönlendirme başarıyla tamamlandı. Rota: {path}\n")
    
    # 2. Load manifest
    if not manifest_path.exists():
        print(f"[ERROR] Eklenti manifestosu bulunamadı: {manifest_path}", file=sys.stderr)
        sys.exit(1)
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_data = yaml.safe_load(f)
        
    # Map skill name to its manifest details
    skills_map = {}
    for category, skills_list in manifest_data.get("skills", {}).items():
        for s in skills_list:
            skills_map[s["name"]] = s
            
    # 3. Execute path sequentially
    for step_idx, skill_name in enumerate(path, 1):
        print(f"[{step_idx}/{len(path)}] Adım: {skill_name} çalıştırılıyor...")
        
        skill_info = skills_map.get(skill_name)
        if not skill_info:
            print(f"  [Warning] Yetenek '{skill_name}' manifestoda bulunamadı, atlanıyor.")
            continue
            
        commands = skill_info.get("commands", {})
        validate_cmd = commands.get("validate")
        
        if not validate_cmd:
            print(f"  [OK] Yetenek '{skill_name}' için çalıştırılabilir kod/doğrulama komutu bulunmuyor. Başarıyla geçildi.")
            continue
            
        print(f"  Komut koşturuluyor: {validate_cmd}")
        ret_code = run_command(validate_cmd, repo_root)
        
        if ret_code == 0:
            print(f"  [OK] Yetenek '{skill_name}' adımından başarıyla geçildi.\n")
        else:
            print(f"  [FAIL] Yetenek '{skill_name}' başarısız oldu (Hata Kodu: {ret_code}).")
            
            # Check for auto-recovery rule
            # manifest_entry contains recovery key (e.g. recovery dict)
            recovery = skill_info.get("recovery", {})
            if recovery:
                print(f"  [Orchestrator] Hata giderici (auto-recovery) kuralları tespit edildi: {recovery}")
                for pattern, rec_cmd in recovery.items():
                    print(f"  [Orchestrator] Hata giderici komut çalıştırılıyor: {rec_cmd}")
                    run_command(rec_cmd, repo_root)
                
                # Retry validation after recovery
                print(f"  [Orchestrator] Adım '{skill_name}' yeniden deneniyor...")
                retry_code = run_command(validate_cmd, repo_root)
                if retry_code == 0:
                    print(f"  [OK] Yeniden deneme başarılı! Yetenek '{skill_name}' adımından geçildi.\n")
                    continue
            
            # Abort pipeline on failure
            print(f"\n[ERROR] Otonom iş akışı yarıda kesildi: '{skill_name}' adımında başarısız olundu.", file=sys.stderr)
            sys.exit(1)
            
    print("[Orchestrator] Tebrikler! Tüm otonom iş akışı adımları başarıyla tamamlandı!")

if __name__ == "__main__":
    main()
