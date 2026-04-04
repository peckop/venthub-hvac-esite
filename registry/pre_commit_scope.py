import sys
import glob
import json
import fnmatch
import subprocess
from pathlib import Path

# Engine modülünü çağırabilmek için python path'ine ekle
sys.path.append(str(Path(__file__).parent))
import engine


def main():
    print("\n🔍 [AI Scope Police] Pre-Commit Denetimi Başlıyor...")

    # 1. Staged değişiklikleri al
    try:
        res = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            capture_output=True, text=True, check=True
        )
        staged_files = [f.strip() for f in res.stdout.splitlines() if f.strip()]
    except Exception as e:
        print(f"⚠️ Git diff alınamadı: {e}")
        return

    if not staged_files:
        return

    # 2. Active klasöründeki geçerli görev JSON'larını bul
    registry_dir = Path(__file__).parent
    active_jsons = glob.glob(str(registry_dir / "**/active/**/*.json"), recursive=True)

    executing_tasks = []
    for fp in active_jsons:
        try:
            with open(fp, "r", encoding="utf-8") as f:
                data = json.load(f)
            # V8 pipeline: plan.json veya trivial.json
            if data.get("skill") in ["superpowers-write-plan", "superpowers-trivial"]:
                executing_tasks.append(fp)
        except Exception:
            continue

    # 3. Aktif görev yoksa → NO-PLAN-NO-CODE uyarısı
    if not executing_tasks:
        has_src = any(f.startswith("src/") for f in staged_files)
        needs_task = has_src or any(
            f.endswith((".js", ".mjs", ".ts", ".json", ".md")) for f in staged_files
        )
        if needs_task:
            try:
                proj_dirs = [
                    d.name.split("-")[0].upper()
                    for d in registry_dir.iterdir()
                    if d.is_dir() and d.name.startswith("P0")
                ]
                proj_id = proj_dirs[0] if proj_dirs else "P0X"
            except Exception:
                proj_id = "P0X"

            files_str = " ".join(f for f in staged_files if " " not in f) or "src/**"
            print("🚨 [NO-PLAN-NO-CODE] DİKKAT: Aktif bir görev (trivial.json/plan.json) bulunamadı!")
            print("   ↳ Trivial bir değişiklik için şu komutu çalıştırın:\n")
            print(f'      python registry/engine.py create-task {proj_id} 999 "Trivial Update" --trivial --paths {files_str}\n')
            print("   ↳ Görev oluşturulduktan sonra tekrar commit alın. (--no-verify kullanmaktan kaçının!)")
            sys.exit(1)
        else:
            print("✅ Scope Police: Kod dışı dosya, görev gerekmeden devam ediliyor.")
            sys.exit(0)

    # 4. Birden fazla aktif görev varsa uyar, ilkini kullan
    if len(executing_tasks) > 1:
        print(f"⚠️ Uyarı: {len(executing_tasks)} aktif görev bulundu. İlki baz alınıyor.")

    target_task = executing_tasks[0]
    print(f"🔍 Denetlenen Görev Kontratı: {Path(target_task).name}")

    # 5. JSON şema doğrulaması (engine.validate)
    validation = engine.validate(target_task)
    if not validation.get("valid"):
        errors = validation.get("errors", [])
        print(f"🚨 Görev JSON geçersiz ({Path(target_task).name}):")
        for err in errors:
            print(f"   ↳ {err}")
        sys.exit(1)

    # 6. Kontrat kurallarını oku
    with open(target_task, "r", encoding="utf-8") as f:
        task_data = json.load(f)

    allowed_paths: list[str] = task_data.get("allowed_paths", [])
    forbidden_paths: list[str] = task_data.get("forbidden_paths", [])
    max_files: int = task_data.get("max_files_changed", 10)

    # 6a. Yasak yol kontrolü (tüm staged dosyalar)
    for sf in staged_files:
        for fp in forbidden_paths:
            pattern = fp.rstrip("/*")
            if fnmatch.fnmatch(sf, fp) or sf == pattern or sf.startswith(pattern + "/"):
                print("🚨 Scope Police: Yasak yola erişim!")
                print(f"   ↳ '{sf}'  →  forbidden_paths kural: '{fp}'")
                sys.exit(1)

    # 6b. Sadece src/ dosyaları için bütçe ve kapsam kontrolü
    src_staged = [f for f in staged_files if not f.startswith("registry/")]

    if len(src_staged) > max_files:
        print(f"🚨 Scope Police: Dosya bütçesi aşıldı! ({len(src_staged)} > max {max_files})")
        print(f"   ↳ Değiştirilen dosyalar: {src_staged}")
        sys.exit(1)

    if allowed_paths:
        for sf in src_staged:
            is_allowed = any(
                fnmatch.fnmatch(sf, ap) or sf == ap or sf.startswith(ap.rstrip("/*") + "/")
                for ap in allowed_paths
            )
            if not is_allowed:
                print("🚨 Scope Police: İzinsiz dosya değişikliği!")
                print(f"   ↳ '{sf}' allowed_paths kapsamı dışında.")
                print(f"   ↳ İzin verilen yollar: {allowed_paths}")
                sys.exit(1)

    print(f"✅ Scope Police: {len(src_staged)} dosya, görev kontratıyla uyumlu. Commit serbest. ✓")


if __name__ == "__main__":
    main()
