---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\skills-orchestrator.py
skeleton_hash: 52715abf766c2be9
entity_hashes:
  func:get_repo_root: e0c063a17efd6a0b
  func:main: 60436502ca36cf4c
  func:run_command: 2f1c15df7358f095
  overview: 8ab984f70dd5acb5
generated_at: 2026-08-25T07:23:06Z
---

## Genel Bakış
Bu modül, bir projenin kök dizinini bulmak ve belirli komutları çalıştırarak temel orkestrasyon görevlerini yerine getirmek için tasarlanmış bir betik (script) yapısına sahiptir. Modül, yardımcı fonksiyonlar aracılığıyla temel sistem etkileşimlerini sağlar ve ana fonksiyon üzerinden çalıştırılabilir bir iş akışı sunar.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Projenin kök dizinini tespit etmek ve harici komutları belirli bir çalışma dizininde çalıştırarak temel sistem ve dosya sistemi işlemlerini gerçekleştirir.
- get_repo_root, run_command

### Ana Fonksiyon
Modülün çalıştırılabilir giriş noktasıdır ve diğer fonksiyonları kullanarak ana orkestrasyon akışını koordine eder.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan (isim, parametre adı, dönüş tipi) mimari varsayım üretmek kural dışıdır. Aksiyomlar sadece fonksiyon gövdesindeki mantıktan türetilir.

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git deposunun kök dizin yolunu `Path` nesnesi olarak döndürür. Eğer mevcut çalışma dizini bir Git deposu içindeyse, `git rev-parse --show-toplevel` komutuyla kök dizini tespit eder; aksi halde betiğin bulunduğu dizinden iki üst dizine çıkarak bir fallback (yedek) yol üretir.

**Nasıl yapar**: `subprocess.check_output` ile `git rev-parse --show-toplevel` komutunu çalıştırır ve elde edilen çıktıyı boşluklardan arındırıp `Path` nesnesine dönüştürür. Herhangi bir istisna (exception) oluşursa, `__file__` değişkeninden yola çıkarak betiğin bulunduğu dizini (`resolve().parent`) ve bir üst dizini (`parent`) hesaplayıp bu yolu döndürür. Bu sayede Git ortamı bulunamadığında bile çalışabilir bir yol sağlanır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `Path` — Git deposunun kök dizinini veya betiğin üst dizinlerinden hesaplanmış fallback yolu temsil eden `Path` nesnesi.

### run_command
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: argparse
- import: json
- import: os
- import: pathlib::Path
- import: subprocess
- import: sys
- import: yaml

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/skills-orchestrator.py::get_repo_root
- **params**: yok
- **ic_degiskenler**:
  - `output` — `subprocess.check_output` ile `git rev-parse --show-toplevel` komutunun çalıştırılmasından dönen metin çıktısı; `.strip()` ile baştaki/sondaki boşluklar temizlenip `Path`'e dönüştürülür
- **Dönüş**: `Path` — git kök dizini; hata durumunda betik dosyasının iki üst klasörü (`__file__`'ın parent.parent'ı)

### [N2_NASIL] AST Pointer: scripts/skills-orchestrator.py::run_command
- **params**: `cmd` (str) — çalıştırılacak kabuk komutu; `cwd` (Path) — komutun çalıştırılacağı çalışma dizini
- **ic_degiskenler**:
  - `res` — `subprocess.run` sonucu nesne; `shell=True`, `stdout=subprocess.PIPE`, `stderr=subprocess.PIPE`, `text=True` ile çalıştırılır; `res.returncode`, `res.stderr`, `res.stdout` alanları kullanılır
  - `e` — yakalanan `Exception` nesnesi; hata mesajında `cmd` ile birlikte yazdırılır
- **Dönüş**: `int` — başarılıysa `res.returncode`, hata durumunda `-1`; stderr ve stdout hata durumunda `sys.stderr`'e yazdırılır

### [N3_NASIL] AST Pointer: scripts/skills-orchestrator.py::main
- **params**: yok
- **ic_degiskenler**:
  - `parser` — `argparse.ArgumentParser` nesnesi; `"Autonomous Skills Orchestrator Runner."` açıklamasıyla oluşturulur
  - `args` — `parser.parse_args()` sonucu; `args.query` alanı kullanılır (zorunlu `--query` argümanı)
  - `repo_root` — `get_repo_root()` dönüşü; tüm yol hesaplamalarının temel dizini
  - `manifest_path` — `repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"` yolu; `.exists()` ile kontrol edilir, `open` ile okunur
  - `router_script` — `repo_root / "scripts" / "skills-router.py"` yolu; yönlendirici betik olarak `subprocess.run` ile çalıştırılır
  - `res` — yönlendirici betiğin `subprocess.run` sonucu; `sys.executable` ile çalıştırılır, `res.returncode`, `res.stderr`, `res.stdout` kullanılır
  - `router_output` — `json.loads(res.stdout.strip())` ile çözümlenmiş sözlük; `"status"` ve `"path"` anahtarları okunur
  - `status` — `router_output.get("status")`; `"CONVERSATIONAL"` ise erken dönüş yapılır
  - `path` — `router_output.get("path", [])` listesi; her eleman bir yetenek adı, `enumerate` ile indekslenir
  - `manifest_data` — `yaml.safe_load(f)` ile yüklenen manifesto sözlüğü; `"skills"` anahtarı okunur
  - `skills_map` — yetenek adlarını manifesto detaylarına eşleyen sözlük; `s["name"]` anahtar olarak kullanılır
  - `category` — `manifest_data.get("skills", {})` sözlüğünde dolaşılırken kullanılan kategori anahtarı
  - `skills_list` — her kategorideki yetenek listesi; `s` değişkeniyle dolaşılır
  - `s` — listedeki tekil yetenek sözlüğü; `s["name"]` ile ad alınır
  - `step_idx` — `enumerate(path, 1)` ile elde edilen adım indeksi (1'den başlar)
  - `skill_name` — `path` listesindeki mevcut yetenek adı
  - `skill_info` — `skills_map.get(skill_name)` sonucu; bulunamazsa `None`, adım atlanır
  - `commands` — `skill_info.get("commands", {})` sözlüğü; `"validate"` anahtarı okunur
  - `validate_cmd` — `commands.get("validate")` sonucu; yoksa yetenek başarıyla geçilmiş sayılır
  - `ret_code` — `run_command(validate_cmd, repo_root)` dönüşü; `0` ise başarılı
  - `recovery` — `skill_info.get("recovery", {})` sözlüğü; hata giderme kurallarını içerir
  - `pattern` — `recovery` sözlüğünde dolaşılırken kullanılan desen anahtarı
  - `rec_cmd` — `recovery` sözlüğündeki iyileştirme komutu; `run_command(rec_cmd, repo_root)` ile çalıştırılır
  - `retry_code` — iyileştirme sonrası `run_command(validate_cmd, repo_root)` dönüşü; `0` ise yeniden deneme başarılı
- **Dönüş**: yok — yan etkiler: konsola bilgi mesajları yazdırır, yönlendirici betiği çalıştırır, manifesto yükler, yetenek adımlarını sırayla çalıştırır, hata durumunda `sys.exit(1)` ile çıkar

---

## NODE ID STANDARD

  file: skills-orchestrator.py
  function: skills-orchestrator.py::get_repo_root
  function: skills-orchestrator.py::run_command
  function: skills-orchestrator.py::main

---

## MERMAID CALL GRAPH
```mermaid
graph TD
    skills-orchestrator_py__get_repo_root
    skills-orchestrator_py__run_command
    skills-orchestrator_py__main
    skills-orchestrator_py__get_repo_root --> skills-orchestrator_py__check_output
    skills-orchestrator_py__get_repo_root --> skills-orchestrator_py__Path
    skills-orchestrator_py__get_repo_root --> skills-orchestrator_py__resolve
    skills-orchestrator_py__run_command --> skills-orchestrator_py__run
    skills-orchestrator_py__main --> skills-orchestrator_py__ArgumentParser
    skills-orchestrator_py__main --> skills-orchestrator_py__add_argument
    skills-orchestrator_py__main --> skills-orchestrator_py__parse_args
    skills-orchestrator_py__main --> skills-orchestrator_py__get_repo_root
    skills-orchestrator_py__main --> skills-orchestrator_py__run
    skills-orchestrator_py__main --> skills-orchestrator_py__exit
    skills-orchestrator_py__main --> skills-orchestrator_py__loads
    skills-orchestrator_py__main --> skills-orchestrator_py__exists
    skills-orchestrator_py__main --> skills-orchestrator_py__safe_load
    skills-orchestrator_py__main --> skills-orchestrator_py__run_command
    orion_cli_docs_migrator_lite_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_analyze_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_audit_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_diagnose_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_docs_tree_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_health_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_main_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_need_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_reset_py____toplevel__ --> skills-orchestrator_py__main
    orion_cli_stats_py____toplevel__ --> skills-orchestrator_py__main
    orion_mcp_server_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_graphrag_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_jobs_maintenance_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_jobs_retroactive_heal_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_shadow_catalog_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_shadow_mirror_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_shadow_rebuild_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_shadow_recall_py____toplevel__ --> skills-orchestrator_py__main
    orion_memory_shadow_search_py____toplevel__ --> skills-orchestrator_py__main
    scratch_check_venthub_embedding_dims_py____toplevel__ --> skills-orchestrator_py__main
    scratch_test_intent_resolution_py____toplevel__ --> skills-orchestrator_py__main
    scratch_test_venthub_query_py____toplevel__ --> skills-orchestrator_py__main
    scripts_compile_skills_py____toplevel__ --> skills-orchestrator_py__main
    scripts_skills-creator_py____toplevel__ --> skills-orchestrator_py__main
    scripts_skills-router_py____toplevel__ --> skills-orchestrator_py__main
    _agent_skills_ensemble_optimizer_py____toplevel__ --> skills-orchestrator_py__main
    _agent_skills_reflective_optimizer_v2_py____toplevel__ --> skills-orchestrator_py__main
    scripts_migrate_contaminated_data_py____toplevel__ --> skills-orchestrator_py__main
    orion_scripts_gocur_kirli_gorev_sozlugu_py____toplevel__ --> skills-orchestrator_py__main
    scripts_compile_skills_py__main --> skills-orchestrator_py__get_repo_root
    scripts_skills-creator_py__main --> skills-orchestrator_py__get_repo_root
    scripts_skills-evaluator_py__evaluate_skills --> skills-orchestrator_py__get_repo_root
    scripts_skills-router_py__main --> skills-orchestrator_py__get_repo_root
```

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: main
  export: run_command