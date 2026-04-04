import sys
import glob
import json
import subprocess
from pathlib import Path

# Engine modülünü çağırabilmek için python path'ine ekle
sys.path.append(str(Path(__file__).parent))
import engine

def main():
    print("\n🔍 [AI Scope Police] Pre-Commit Denetimi Başlıyor...")
    
    # 1. Staged değişiklikleri al
    try:
        res = subprocess.run(["git", "diff", "--cached", "--name-only"], capture_output=True, text=True, check=True)
        staged_files = [f.strip() for f in res.stdout.splitlines() if f.strip()]
    except Exception as e:
        print(f"⚠️ Git diff alınamadı: {e}")
        return

    if not staged_files:
        return

    # 2. Executing durumundaki JSON görevlerini bul
    registry_dir = Path(__file__).parent
    active_jsons = glob.glob(str(registry_dir / '**/active/**/*.json'), recursive=True)
    
    executing_tasks = []
    for fp in active_jsons:
        try:
            with open(fp, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # V8 pipeline taskları plan.json veya trivial.json'dır.
                if data.get('skill') in ['superpowers-write-plan', 'superpowers-trivial']:
                    executing_tasks.append(fp)
        except Exception:
            continue

    if not executing_tasks:
        has_src = any(f.startswith("src/") for f in staged_files)
        if has_src:
            print("🚨 [NO-PLAN-NO-CODE] DİKKAT: 'Executing' durumunda aktif bir görev bulunamadı!")
            print("   ↳ Kurallar gereği, aktif bir görev (plan.json veya trivial.json) olmadan 'src/' dizinine commit atılamaz.")
            print("   ↳ Lütfen önce görevinizi oluşturun: python registry/engine.py create-task ...")
            print("   ↳ Bu işlemi bypass etmek manuel müdahale gerektirir (--no-verify).")
            sys.exit(1)
        else:
            print("✅ Scope Police: Kaynak kod (src/) değişikliği yok, görev aranmadan devam ediliyor.")
            sys.exit(0)

    # İşletilen görev(ler) üzerinden Scope kontrolü
    if len(executing_tasks) > 1:
        print(f"⚠️ Uyarı: {len(executing_tasks)} adet aktif (Executing) görev bulundu. İlk görev baz alınarak Scope doğrulanacak.")

    target_task = executing_tasks[0]
    print(f"🔍 Denetlenen Görev Kontratı: {Path(target_task).name}")
    
    try:
        engine.check_scope(target_task, staged_only=True)
    except SystemExit as e:
        if e.code != 0:
            print("🚨 Scope Police Sözleşme İhlali Nedeniyle Commit'i Bloke Etti!")
            sys.exit(e.code)
    except Exception as e:
        print(f"❌ Scope check işlemi başarısız: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
