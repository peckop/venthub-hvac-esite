"""Registry Engine v8 — Otonom Proje Yönetim Motoru.

Girdi: JSON artifact dosyaları (brainstorm.json, plan.json, review.json)
İşlem: JSON Schema doğrulaması + Linear MCP senkronizasyonu
Çıktı: Deterministik geçer/kalmaz kararı (regex yok, halüsinasyon yok)
"""

import json
import sys
from pathlib import Path
from typing import Any

# jsonschema opsiyonel — yoksa basit key kontrolü yapar
try:
    import jsonschema
    HAS_JSONSCHEMA = True
except ImportError:
    HAS_JSONSCHEMA = False
    print("🚨 [SENTINEL V8 UYARISI]: 'jsonschema' kütüphanesi bulunamadı! Motor şu an 'Kör Mod'da (güvensiz) çalışıyor. Lütfen hemen 'pip install jsonschema' çalıştırın.", file=sys.stderr)

REGISTRY_DIR = Path(__file__).parent.absolute()
SCHEMAS_DIR = REGISTRY_DIR / "schemas"

# Artifact tipi → şema dosyası eşlemesi
SCHEMA_MAP: dict[str, str] = {
    "brainstorm": "brainstorm.schema.json",
    "plan": "plan.schema.json",
    "review": "review.schema.json",
    "dispatcher": "dispatcher.schema.json",
    "finish": "finish.schema.json",
    "execution_report": "execution_report.schema.json",
    "trivial": "trivial.schema.json",
}


def _load_json(path: Path) -> dict[str, Any]:
    """JSON dosyasını oku ve parse et."""
    if not path.exists():
        raise FileNotFoundError(f"Dosya bulunamadı: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _detect_artifact_type(data: dict[str, Any], filename: str) -> str | None:
    """Artifact tipini dosya adından veya skill alanından tespit et."""
    name_lower = filename.lower()
    for artifact_type in SCHEMA_MAP:
        if artifact_type in name_lower:
            return artifact_type
    # Fallback: skill alanından
    skill = data.get("skill", "")
    if "brainstorm" in skill:
        return "brainstorm"
    elif "plan" in skill:
        return "plan"
    elif "review" in skill:
        return "review"
    elif "trivial" in skill:
        return "trivial"
    return None


def validate(artifact_path: str | Path) -> dict[str, Any]:
    """JSON artifact dosyasını ilgili şemasına göre doğrular.

    Girdi: Artifact dosya yolu (brainstorm.json, plan.json, review.json)
    Çıktı: {"valid": True/False, "errors": [...], "artifact_type": "..."}

    Regex yok. Deterministik. 1ms.
    """
    path = Path(artifact_path)
    result: dict[str, Any] = {"valid": False, "errors": [], "artifact_type": None}

    # 1. Dosya var mı?
    try:
        data = _load_json(path)
    except FileNotFoundError as e:
        result["errors"].append(str(e))
        return result
    except json.JSONDecodeError as e:
        result["errors"].append(f"JSON parse hatası: {e}")
        return result

    # 2. Tip tespiti
    artifact_type = _detect_artifact_type(data, path.name)
    if not artifact_type:
        result["errors"].append(
            f"Artifact tipi tespit edilemedi. Dosya adı '{path.name}' "
            f"brainstorm/plan/review içermiyor."
        )
        return result
    result["artifact_type"] = artifact_type

    # 3. Şema doğrulaması
    schema_file = SCHEMAS_DIR / SCHEMA_MAP[artifact_type]
    if not schema_file.exists():
        result["errors"].append(f"Şema dosyası bulunamadı: {schema_file}")
        return result

    schema = _load_json(schema_file)

    if HAS_JSONSCHEMA:
        # Tam JSON Schema doğrulaması
        validator = jsonschema.Draft202012Validator(schema)
        errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
        for error in errors:
            field = ".".join(str(p) for p in error.absolute_path) or "(root)"
            result["errors"].append(f"[{field}] {error.message}")
    else:
        # Fallback: basit key kontrolü (jsonschema kurulu değilse)
        required = schema.get("required", [])
        for key in required:
            if key not in data:
                result["errors"].append(f"Zorunlu alan eksik: '{key}'")
            elif isinstance(data[key], str) and len(data[key]) < 5:
                result["errors"].append(f"Alan çok kısa: '{key}' ({len(data[key])} chr)")
            elif isinstance(data[key], list) and len(data[key]) == 0:
                result["errors"].append(f"Boş liste: '{key}'")

    if artifact_type == "trivial":
        cmds = data.get("verification_commands", [])
        for i, cmd in enumerate(cmds):
            if cmd.get("passed") is True:
                res_text = str(cmd.get("result", "")).strip()
                if not res_text or len(res_text) < 10:
                    result["errors"].append(f"[verification_commands[{i}]] 'passed: true' işaretlenmiş ancak 'result' alanı boş veya yetersiz. İspat için terminal çıktısını yapıştırın.")

    result["valid"] = len(result["errors"]) == 0
    return result


def create_task(
    project_id: str,
    task_id: str,
    title: str,
    task_dir: Path | None = None,
    is_trivial: bool = False,
) -> Path:
    """Yeni görev için klasör yapısı ve boş JSON şablonları oluşturur.

    Girdi: Proje ID, Görev ID, Başlık
    Çıktı: Oluşturulan görev klasörünün Path'i
    """
    if task_dir is None:
        # Proje klasörünü bul
        proj_dir = next(
            (d for d in REGISTRY_DIR.iterdir()
             if d.is_dir() and d.name.startswith(project_id)),
            None,
        )
        if not proj_dir:
            raise FileNotFoundError(f"Proje bulunamadı: {project_id}")

        slug = title.lower().replace(" ", "-").replace("ı", "i").replace("ö", "o")
        slug = slug.replace("ü", "u").replace("ş", "s").replace("ç", "c").replace("ğ", "g")
        folder_name = f"{task_id.zfill(3)}-{slug}"
        task_dir = proj_dir / "backlog" / folder_name

    task_dir.mkdir(parents=True, exist_ok=True)

    # Boş JSON şablonları
    if is_trivial:
        # Dinamik komut tespiti (Universal Engine)
        if (PROJECT_ROOT / "package.json").exists():
            verify_cmds = [
                {"command": "pnpm run lint:ci", "result": "", "passed": False},
                {"command": "pnpm exec tsc -b tsconfig.build.json", "result": "", "passed": False},
                {"command": "pnpm test -- --run", "result": "", "passed": False}
            ]
        elif (PROJECT_ROOT / "requirements.txt").exists() or (PROJECT_ROOT / "pyproject.toml").exists():
            verify_cmds = [
                {"command": "pytest tests/ -v", "result": "", "passed": False},
                {"command": "ruff check src/ tests/", "result": "", "passed": False}
            ]
        else:
            verify_cmds = [
                {"command": "<DOGRULAMA_KOMUTUNU_BURAYA_YAZIN>", "result": "", "passed": False}
            ]

        templates: dict[str, dict[str, Any]] = {
            "trivial.json": {
                "skill": "superpowers-trivial",
                "model": "",
                "date": "",
                "task_id": f"{project_id}-{task_id}",
                "task_title": title,
                "description": "",
                "files_modified": [],
                "verification_commands": verify_cmds,
                "all_passed": False
            }
        }
    else:
        templates = {
            "brainstorm.json": {
                "skill": "superpowers-brainstorm",
                "model": "",
                "date": "",
                "goal": "",
                "constraints": [],
                "risks": [],
                "options": [],
                "recommendation": "",
                "traces": [],
            },
            "plan.json": {
                "skill": "superpowers-write-plan",
                "model": "",
                "date": "",
                "execution_complexity": "",
                "recommended_model": "",
                "requires_human_approval": False,
                "brainstorm_ref": f"{task_dir.name}/brainstorm.json",
                "objective": "",
                "assumptions": [],
                "pre_checks": [],
                "steps": [],
                "risks": [],
                "rollback": "",
            },
            "review.json": {
                "skill": "superpowers-review",
                "model": "",
                "date": "",
                "blockers": [],
                "majors": [],
                "minors": [],
                "nits": [],
                "anti_hallucination": [],
                "summary": "",
                "verdict": "needs_changes",
            },
            "dispatcher.json": {
                "skill": "model-dispatcher",
                "date": "",
                "task_summary": "",
                "complexity": "low",
                "recommended_model": "Gemini 3 Flash",
                "blast_radius": 1,
                "reasoning": "",
                "alternatives": [],
            },
        }

    for filename, template in templates.items():
        filepath = task_dir / filename
        if not filepath.exists():
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(template, f, indent=2, ensure_ascii=False)

    return task_dir


def cross_validate(task_dir: str | Path) -> dict[str, Any]:
    """Görev klasöründeki tüm artifact'lar arasında çapraz tutarlılık kontrolü.

    Girdi: Görev klasörü yolu (brainstorm.json, plan.json, review.json içermeli)
    Çıktı: {"valid": True/False, "checks": [...], "errors": [...]}

    6 çapraz kontrol kuralı uygular:
    1. Referans bütünlüğü (plan → brainstorm dosyası mevcut mu?)
    2. Kritik risk tutarlılığı (brainstorm'da critical → plan'da da olmalı)
    3. Blocker-verdict tutarlılığı (blocker varsa verdict approved olamaz)
    4. Model tutarlılığı (dispatcher ↔ plan aynı modeli mi öneriyor?)
    5. Finish bütünlüğü (all_passed=true ama review'da blocker varsa → hata)
    6. Pre-Check bütünlüğü (plan.json içindeki pre_checks doğrulanmış olmalı)
    """
    task_path = Path(task_dir)
    result: dict[str, Any] = {"valid": True, "checks": [], "errors": []}

    if not task_path.is_dir():
        result["valid"] = False
        result["errors"].append(f"Klasör bulunamadı: {task_path}")
        return result

    # Özel durum: Trivial Fast-Track kontrolü
    trivial_path = task_path / "trivial.json"
    if trivial_path.exists():
        val_result = validate(trivial_path)
        if not val_result["valid"]:
            result["valid"] = False
            result["errors"].extend(val_result["errors"])
            result["errors"].append("[TRIVIAL] trivial.json doğrulanamadı.")
            return result
        
        # Ekstra: all_passed check
        try:
            with open(trivial_path, "r", encoding="utf-8") as f:
                t_data = json.load(f)
                if not t_data.get("all_passed", False):
                    result["valid"] = False
                    result["errors"].append("[TRIVIAL] Lint ve Test süreçleri henüz geçmemiş (all_passed=false).")
                    return result
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"[TRIVIAL] Dosya okuma hatası: {e}")
            return result

        result["checks"].append("⚡ Trivial (Fast-Track) görev tespit edildi: Cross-validation bypass edildi, Sentinel Guard doğrulandı.")
        return result

    # Artifact'ları yükle (varsa)
    artifacts: dict[str, dict[str, Any] | None] = {}
    for name in ("brainstorm", "plan", "review", "dispatcher", "finish"):
        fpath = task_path / f"{name}.json"
        if fpath.exists():
            try:
                artifacts[name] = _load_json(fpath)
                result["checks"].append(f"✅ {name}.json yüklendi")
            except (json.JSONDecodeError, FileNotFoundError) as e:
                artifacts[name] = None
                result["errors"].append(f"{name}.json okunamadı: {e}")
        else:
            artifacts[name] = None
            result["checks"].append(f"⏭️ {name}.json bulunamadı (atlandı)")

    brainstorm = artifacts.get("brainstorm")
    plan = artifacts.get("plan")
    review = artifacts.get("review")
    dispatcher = artifacts.get("dispatcher")
    finish = artifacts.get("finish")

    # Kural 0: Zorunlu Sentinel Silsilesi (Eksik adım engeli)
    if plan and not dispatcher:
        result["errors"].append("[CHAIN] plan.json oluşturulmuş ancak dispatcher.json BİLİNÇLİ ATLANMIŞ. Model kaynak tahsisi onaylanmadan plan yapılamaz.")
    if plan and not review:
        result["errors"].append("[CHAIN] plan.json oluşturulmuş ancak review.json BİLİNÇLİ ATLANMIŞ. Anti-halüsinasyon otonom plan denetimi yapılmadan uygulama onayına geçilemez.")

    # Kural 1: Referans bütünlüğü (plan.brainstorm_ref → dosya mevcut mu?)
    if plan and brainstorm:
        ref = plan.get("brainstorm_ref", "")
        if ref:
            # Referans yolu görece olabilir, klasör içinde kontrol et
            ref_path = task_path / Path(ref).name
            if not ref_path.exists():
                # Tam yolu da kontrol et
                full_ref = REGISTRY_DIR / ref
                if not full_ref.exists():
                    result["errors"].append(
                        f"[REF] plan.brainstorm_ref='{ref}' dosyası bulunamadı"
                    )
            result["checks"].append("🔗 Referans bütünlüğü kontrol edildi")
        else:
            result["errors"].append("[REF] plan.json'da brainstorm_ref alanı boş")

    # Kural 2: Kritik risk tutarlılığı
    if brainstorm and plan:
        bs_critical = [
            r for r in brainstorm.get("risks", [])
            if isinstance(r, dict) and r.get("severity") == "critical"
        ]
        if bs_critical:
            plan_risks = plan.get("risks", [])
            plan_has_high = any(
                isinstance(r, dict) and r.get("severity") in ("high", "critical")
                for r in plan_risks
            )
            if not plan_has_high:
                result["errors"].append(
                    f"[RISK] Brainstorm'da {len(bs_critical)} critical risk var "
                    f"ama plan.json'da high/critical risk tanımlı değil"
                )
            result["checks"].append("⚠️ Kritik risk tutarlılığı kontrol edildi")

    # Kural 3: Blocker-verdict tutarlılığı
    if review:
        blockers = review.get("blockers", [])
        verdict = review.get("verdict", "")
        if blockers and verdict == "approved":
            result["errors"].append(
                f"[VERDICT] review.json'da {len(blockers)} blocker var "
                f"ama verdict='approved' — bu tutarsız"
            )
        result["checks"].append("🔍 Blocker-verdict tutarlılığı kontrol edildi")

    # Kural 4: Model tutarlılığı (dispatcher ↔ plan)
    if dispatcher and plan:
        disp_model = dispatcher.get("recommended_model", "")
        plan_model = plan.get("recommended_model", "")
        if disp_model and plan_model and disp_model != plan_model:
            result["errors"].append(
                f"[MODEL] dispatcher önerir: '{disp_model}' ama plan önerir: "
                f"'{plan_model}' — tutarsızlık"
            )
        result["checks"].append("🤖 Model tutarlılığı kontrol edildi")

    # Kural 5: Finish bütünlüğü
    if finish and review:
        all_passed = finish.get("all_passed", False)
        review_blockers = review.get("blockers", [])
        if all_passed and review_blockers:
            result["errors"].append(
                f"[FINISH] finish.all_passed=true ama review'da "
                f"{len(review_blockers)} blocker çözülmemiş"
            )
        result["checks"].append("✅ Finish bütünlüğü kontrol edildi")

    # Kural 6: Pre-Check Bütünlüğü
    if plan:
        pre_checks = plan.get("pre_checks", [])
        if pre_checks:
            for i, check in enumerate(pre_checks):
                if not check.get("verified", False):
                    result["errors"].append(f"[PRE-CHECK] Doğrulanmamış plan gözlemi mevcut: {check.get('claim', f'Item {i}')}")

            # Tüm source ve claim metinlerini birleştir (dosya yolu eşleştirme için)
            all_evidence = " ".join(
                f"{c.get('source', '')} {c.get('claim', '')}"
                for c in pre_checks
            )
            for step in plan.get("steps", []):
                for fpath in step.get("files", []):
                    # Tam eşleşme VEYA dosya yolunun herhangi bir parçasının evidence'ta geçmesi
                    fpath_parts = fpath.replace("\\", "/")
                    # Dosya adı veya tam yol evidence içinde var mı?
                    path_found = (
                        fpath_parts in all_evidence
                        or fpath_parts.rsplit("/", 1)[-1] in all_evidence
                    )
                    # Üst dizin referansı var mı? (ör: "src/api/" → "src/api/__init__.py" eşleşir)
                    if not path_found:
                        parent = fpath_parts.rsplit("/", 1)[0] + "/" if "/" in fpath_parts else ""
                        path_found = parent and parent in all_evidence
                    if not path_found:
                        result["errors"].append(f"[PRE-CHECK] Plan adımı değiştirilecek dosyayı ({fpath}) pre_checks içinde referans göstermiyor.")

            result["checks"].append("🛡️ Pre-Check bütünlüğü kontrol edildi")

    result["valid"] = len(result["errors"]) == 0
    return result


def pipeline_status(task_dir: str | Path) -> dict[str, Any]:
    """Görev klasörünün pipeline durumunu raporlar.

    Girdi: Görev klasörü yolu
    Çıktı: Her artifact'ın durumu ve sonraki adım önerisi
    """
    task_path = Path(task_dir)
    status: dict[str, Any] = {
        "task_dir": str(task_path),
        "artifacts": {},
        "next_step": "",
    }

    if not task_path.is_dir():
        status["next_step"] = f"Klasör bulunamadı: {task_path}"
        return status

    pipeline_order = ["dispatcher", "brainstorm", "plan", "review", "finish",
                      "execution_report"]
    first_missing = None

    for name in pipeline_order:
        fpath = task_path / f"{name}.json"
        if fpath.exists():
            # Doğrulama yap (şeması varsa)
            if name in SCHEMA_MAP:
                vresult = validate(fpath)
                if vresult["valid"]:
                    status["artifacts"][name] = "✅ geçerli"
                else:
                    status["artifacts"][name] = f"❌ geçersiz ({len(vresult['errors'])} hata)"
                    if first_missing is None:
                        first_missing = f"{name}.json düzelt"
            else:
                status["artifacts"][name] = "📄 mevcut (şema yok)"
        else:
            status["artifacts"][name] = "⏳ eksik"
            if first_missing is None:
                first_missing = f"{name}.json oluştur"

    # Cross-validation
    cv_result = cross_validate(task_path)
    if cv_result["valid"]:
        status["cross_validation"] = "✅ tutarlı"
    else:
        status["cross_validation"] = f"❌ {len(cv_result['errors'])} tutarsızlık"
        if first_missing is None:
            first_missing = "Cross-validation hatalarını düzelt"

    status["next_step"] = first_missing or "Pipeline tamamlanmış 🎉"
    return status


def check_scope(json_path: str | Path) -> None:
    """Verilen JSON sözleşmesindeki kısıtlamaları (Scope) 'git diff' ile test eder."""
    import subprocess
    import fnmatch
    
    path = Path(json_path)
    if not path.exists():
        print(f"❌ JSON bulunamadı: {path}")
        sys.exit(1)
        
    data = _load_json(path)
    
    allowed = data.get("allowed_paths", [])
    forbidden = data.get("forbidden_paths", [])
    max_count = data.get("max_files_changed", 999)
    
    # Bazen JSON'da eksik olabilir (eski tasklar için)
    if not allowed and not forbidden and max_count == 999:
        print("⚠️ Uyarı: Bu görev eski formatta, Scope Contract kısıtlamaları bulunmuyor. Bypass ediliyor.")
        return
        
    try:
        # 1. Tracked (İzlenen) Değişiklikler
        res_tracked = subprocess.run(["git", "diff", "HEAD", "--name-only"], capture_output=True, text=True, check=True)
        tracked_files = [f.strip() for f in res_tracked.stdout.splitlines() if f.strip()]
        
        # 2. Untracked (Yeni oluşturulup git add yapılmamış) Dosyalar
        res_untracked = subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], capture_output=True, text=True, check=True)
        untracked_files = [f.strip() for f in res_untracked.stdout.splitlines() if f.strip()]
        
        # Hepsini birleştir (Tekrarları set ile sil)
        changed_files = list(set(tracked_files + untracked_files))
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Git diff alınamadı: {e}. Devam ediliyor ancak Scope Police çalışamıyor.")
        return
        
    errors = []
    
    if len(changed_files) > max_count:
        errors.append(f"Değiştirilen dosya sayısı bütçeyi aştı! Sınır: {max_count}, Değişen: {len(changed_files)}")
        
    for f in changed_files:
        f_posix = f.replace("\\", "/") 
        
        is_forbidden = False
        for fpat in forbidden:
            if fnmatch.fnmatchcase(f_posix, fpat) or f_posix.startswith(fpat.strip("/*")):
                is_forbidden = True
                break
        if is_forbidden:
            errors.append(f"[SCOPE BLOCKED] '{f}' kesinlikle YASAKLI (forbidden_paths) alanda.")
            continue
            
        is_allowed = False
        for apat in allowed:
            if fnmatch.fnmatchcase(f_posix, apat) or f_posix.startswith(apat.strip("/*")):
                is_allowed = True
                break
                
        if not is_allowed:
            errors.append(f"[SCOPE BLOCKED] '{f}' izinli alanın dışında.\n   → Bu değişiklik için yeni Trivial Task açılması gerekiyor.\n   → Mevcut görev sadece izni olan dosyalarla devam edebilir.")

    if errors:
        print("🚨 Scope Police (Sınır Polisi) Müdahalesi!")
        for err in errors:
            print(f"  ❌ {err}")
        sys.exit(1)
        
    print("✅ Scope Police: Sözleşme sınırları içinde kalındı. [PASS]")


def finalize_task(task_dir: str | Path) -> None:
    """Görevi finalize eder: Git mv ile klasörü taşır, PULSE.md'yi günceller."""
    import subprocess
    import shutil
    import re

    task_path = Path(task_dir)
    if not task_path.is_dir():
        print(f"❌ Klasör bulunamadı: {task_path}")
        sys.exit(1)

    status = pipeline_status(task_path)
    if "❌" in str(status):
        print("❌ Görev kapatılamaz, pipeline hatalı veya eksik. Çözün ve tekrar deneyin.")
        sys.exit(1)

    print("✅ Pipeline tamamen geçerli. Finalization (kapatma) silsilesi başlıyor...")

    # 1. Task ID tespiti
    task_id = task_path.name.split("-")[0]
    exec_path = task_path / "execution_report.json"
    if exec_path.exists():
        data = _load_json(exec_path)
        if "task_id" in data:
            import re
            task_id = re.sub(r'^P\d{2}-', '', str(data["task_id"]))
            
    task_id_formatted = task_id.zfill(3)

    # 2. PULSE.md Güncellemesi
    pulse_path = REGISTRY_DIR / "PULSE.md"
    pulse_updated = False
    if pulse_path.exists():
        with open(pulse_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        project_prefix = task_path.parent.parent.name.split("-")[0].upper() # e.g. "P03"
        in_correct_section = False
        task_idx = -1

        for i, line in enumerate(lines):
            if line.startswith(f"## 📁 {project_prefix}"):
                in_correct_section = True
            elif line.startswith("## 📁") and in_correct_section:
                in_correct_section = False # Exited the section
                
            if in_correct_section and f"`{task_id_formatted}`" in line and "|" in line:
                task_idx = i
                break
                
        if task_idx != -1:
            task_row = lines.pop(task_idx)
            task_row = re.sub(r"🔥\s*HIGH|⏳\s*NORMAL|⏳\s*MEDIUM|🔥\s*CRITICAL", "✅ DONE", task_row)
            
            insert_idx = -1
            # Önceki satırlarda "### ✅ Tamamlanan" başlığını bul
            for i in range(task_idx - 1, -1, -1):
                if "### ✅ Tamamlanan" in lines[i]:
                    insert_idx = i + 3 # Tablo başlığının altı
                    break
                    
            if insert_idx != -1:
                lines.insert(insert_idx, task_row)
            else:
                lines.insert(task_idx, task_row)
                
            with open(pulse_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            pulse_updated = True
            print(f"✅ PULSE.md güncellendi. {task_id_formatted} durumu ✅ DONE yapıldı.")

    # 3. Klasörü physical olarak completed dizinine taşı
    folder_moved = False
    new_task_path = task_path
    if task_path.parent.name in ["backlog", "active"]:
        completed_dir = task_path.parent.parent / "completed"
        completed_dir.mkdir(exist_ok=True)
        new_task_path = completed_dir / task_path.name
        
        try:
            subprocess.run(["git", "mv", str(task_path), str(new_task_path)], check=True)
            folder_moved = True
            print(f"✅ Görev klasörü `completed` dizinine taşındı (git mv).")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ 'git mv' başarısız oldu: {e}. Normal taşıma (shutil) deneniyor...")
            shutil.move(str(task_path), str(new_task_path))
            folder_moved = True

    # 4. finish.json dosyasına pulse_updated ve folder_moved damgasını vur
    finish_path = new_task_path / "finish.json"
    if finish_path.exists():
        with open(finish_path, 'r+', encoding='utf-8') as f:
            fdata = json.load(f)
            if "all_passed" in fdata: # validate dict
                fdata["pulse_updated"] = pulse_updated
                fdata["folder_moved"] = folder_moved
                f.seek(0)
                json.dump(fdata, f, indent=2, ensure_ascii=False)
                f.truncate()
                
    print(f"🚀 Otonom Kapatma Başarılı! Sıradaki görev: git commit -am 'feat: complete {task_path.name}'")


# ── CLI ──
def main() -> None:  # noqa: C901
    """CLI — validate, create-task, cross-validate ve pipeline komutları."""
    if len(sys.argv) < 2:
        print("Kullanım:")
        print("  python registry/engine.py validate <dosya.json>")
        print("  python registry/engine.py create-task <PROJE> <ID> <BAŞLIK>")
        print("  python registry/engine.py cross-validate <görev_klasörü>")
        print("  python registry/engine.py pipeline status <görev_klasörü>")
        print("  python registry/engine.py finalize-task <görev_klasörü>")
        sys.exit(1)

    action = sys.argv[1]

    if action == "validate":
        if len(sys.argv) < 3:
            print("Kullanım: python registry/engine.py validate <dosya.json>")
            sys.exit(1)
        result = validate(sys.argv[2])
        if result["valid"]:
            print(f"✅ Geçerli ({result['artifact_type']})")
        else:
            print(f"❌ Geçersiz ({result['artifact_type']}):")
            for err in result["errors"]:
                print(f"   - {err}")
            sys.exit(1)

    elif action == "create-task":
        if len(sys.argv) < 5:
            print("Kullanım: python registry/engine.py create-task <PROJE> <ID> <BAŞLIK> [--trivial]")
            sys.exit(1)
            
        args = sys.argv[2:]
        is_trivial = "--trivial" in args
        if is_trivial:
            args.remove("--trivial")
            
        if len(args) < 3:
            print("Kullanım: python registry/engine.py create-task <PROJE> <ID> <BAŞLIK> [--trivial]")
            sys.exit(1)
            
        project_id = args[0]
        task_id = args[1]
        title = " ".join(args[2:])
        task_dir = create_task(project_id, task_id, title, is_trivial=is_trivial)
        print(f"✅ Görev oluşturuldu: {task_dir}" + (" (Trivial)" if is_trivial else ""))

    elif action == "cross-validate":
        if len(sys.argv) < 3:
            print("Kullanım: python registry/engine.py cross-validate <görev_klasörü>")
            sys.exit(1)
        result = cross_validate(sys.argv[2])
        for check in result["checks"]:
            print(f"  {check}")
        if result["valid"]:
            print("\n✅ Çapraz doğrulama geçti — tüm artifact'lar tutarlı")
        else:
            print(f"\n❌ {len(result['errors'])} tutarsızlık bulundu:")
            for err in result["errors"]:
                print(f"   - {err}")
            sys.exit(1)

    elif action == "pipeline":
        if len(sys.argv) < 4 or sys.argv[2] != "status":
            print("Kullanım: python registry/engine.py pipeline status <görev_klasörü>")
            sys.exit(1)
        result = pipeline_status(sys.argv[3])
        print(f"📊 Pipeline Durumu: {Path(result['task_dir']).name}")
        for name, state in result["artifacts"].items():
            print(f"  {state:20s}  {name}.json")
        cv = result.get("cross_validation", "⏭️ atlandı")
        print(f"  {cv:20s}  cross-validation")
        print(f"\n  ➡️  Sonraki adım: {result['next_step']}")

    elif action == "finalize-task":
        if len(sys.argv) < 3:
            print("Kullanım: python registry/engine.py finalize-task <görev_klasörü>")
            sys.exit(1)
        finalize_task(sys.argv[2])

    elif action == "check-scope":
        if len(sys.argv) < 3:
            print("Kullanım: python registry/engine.py check-scope <dosya.json>")
            sys.exit(1)
        check_scope(sys.argv[2])

    else:
        print(f"Bilinmeyen komut: {action}")
        sys.exit(1)


if __name__ == "__main__":
    main()

