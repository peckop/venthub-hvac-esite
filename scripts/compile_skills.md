---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\compile_skills.py
skeleton_hash: 6a00c7f38d1f3a98
entity_hashes:
  func:get_repo_root: 7f27eff11a6cee54
  func:main: f9b94b507371aa61
  overview: f55ad6ea283369d2
generated_at: 2026-08-25T07:23:09Z
---

## Genel Bakış
Bu modül, beceri dosyalarının derlenmesiyle ilgili işlemleri yürütür. Modül adından (`compile_skills`) anlaşıldığı üzere, beceri tanımlarını derleme sürecini yönetir. Modülde yalnızca iki fonksiyon bulunur ve dış bağımlılıklar hakkında bilgi verilmemiştir.

## Fonksiyon Grupları

### Ana İşlem ve Yardımcı Fonksiyonlar
Modülün temel çalışma akışını ve gerekli yardımcı hesaplamaları içerir. `get_repo_root` fonksiyonu projenin kök dizin yolunu belirlerken, `main` fonksiyonu modülün ana yürütme noktasıdır.

- `get_repo_root`, `main`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Modülün fonksiyon gövdeleri sağlanmamıştır. Yalnızca `get_repo_root()` ve `main()` fonksiyon imzaları mevcuttur. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir; imzalar tek başına modülün çalışma koşulları hakkında güvenilir bilgi vermez.

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git deposunun kök dizin yolunu döndüren bir yardımcı fonksiyondur. Projenin en üst seviye dizinini bulmak için kullanılır.

**Nasıl yapar**: Fonksiyon içinde `subprocess` modülünü dinamik olarak içe aktarır. `git rev-parse --show-toplevel` komutunu çalıştırarak geçerli çalışma dizininin üstündeki en üst Git deposu dizinini bulur. Komutun çıktısındaki boşlukları temizleyerek bir `Path` nesnesine dönüştürür. Eğer herhangi bir istisna oluşursa (örneğin geçerli dizin bir Git deposu değilse), betiğin bulunduğu dizinin bir üst dizinini (`parent.parent`) güvenli bir geri dönüş değeri olarak döndürür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `Path` — Git deposunun kök dizin yolunu temsil eden bir `Path` nesnesi döndürür. İstisna durumunda betik dosyasının iki üst dizin yolunu döndürür.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: os
- import: pathlib::Path
- import: yaml

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/compile_skills.py::get_repo_root
- **params**: yok
- **ic_degiskenler**:
  - `subprocess` — fonksiyon içinde dinamik olarak import edilen subprocess modülü
  - `output` — `subprocess.check_output` ile çalıştırılan `git rev-parse --show-toplevel` komutunun text formatındaki çıktısı
- **Dönüş**: `Path` nesnesi — başarılıysa git kök dizini (output.strip()), exception durumunda dosyanın iki üst klasörü (`Path(__file__).resolve().parent.parent`)

### [N2_NASIL] AST Pointer: scripts/compile_skills.py::main
- **params**: yok
- **ic_degiskenler**:
  - `repo_root` — `get_repo_root()` çağrısının dönüşü, repository kök dizini
  - `skills_dir` — `repo_root / ".agent" / "skills"` yolu, yeteneklerin bulunduğu dizin
  - `manifest_path` — `repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"` yolu, manifest dosyası
  - `output_file` — `repo_root / "docs" / "venthub_skills_master.md"` yolu, master doküman dosyası
  - `compiled_skills` — derlenen tüm yeteneklerin sözlük listesi (name, description, body, dir_name, depends_on, next_steps, run_last, exclusions alanları)
  - `manifest` — temel manifest yapısı sözlüğü (name, version, description, rules, skills alanları; skills altında orchestration, intelligence, guards, audit, utils listeleri)
  - `skill_path` — `skills_dir.iterdir()` ile döngüdeki her bir alt dizin yolu
  - `skill_md_path` — `skill_path / "SKILL.md"` yolu, her yetenek dizinindeki markdown dosyası
  - `content` — `open(skill_md_path)` ile okunan SKILL.md dosyasının tam metin içeriği
  - `parts` — `content.split("---")` ile "---" ayracına göre bölünmüş metin parçaları listesi
  - `frontmatter_text` — `parts[1]`, YAML ön bilgi metni
  - `body_text` — `"---".join(parts[2:]).strip()`, SKILL.md'nin YAML sonrası gövde metni; frontmatter yoksa `content.strip()`
  - `metadata_yaml` — `yaml.safe_load(frontmatter_text)` ile yüklenen YAML sözlüğü; parse hatasında `{}` boş sözlük
  - `name` — `metadata_yaml.get("name", skill_path.name)`, yetenek adı; YAML'da yoksa dizin adı
  - `description` — `metadata_yaml.get("description", "")`, yetenek açıklaması
  - `category` — `metadata_yaml.get("category", "utils")`, yetenek kategorisi; geçersizse "utils" olarak düzeltilir
  - `metadata` — `metadata_yaml.get("metadata", {})`, ek metadata sözlüğü
  - `depends_on` — `metadata_yaml.get("depends_on", [])`, bağımlılık listesi
  - `next_steps` — `metadata_yaml.get("next_steps", [])`, sonraki adımlar listesi
  - `run_last` — `metadata_yaml.get("run_last", False)`, son çalıştırma bayrağı
  - `exclusions` — `metadata_yaml.get("exclusions", [])`, hariç tutmalar listesi
  - `skill_rel_path` — `str(skill_md_path.relative_to(repo_root)).replace("\\", "/")`, yeteneğin repository'ye göreli yolu (ters eğik çizgiler düzeltildi)
  - `manifest_entry` — manifest'e eklenecek tekil yetenek sözlüğü (name, path, description, triggers_on, inputs, outputs, depends_on, next_steps, run_last, exclusions, commands; opsiyonel recovery, prerequisites)
  - `category` (döngü) — `manifest["skills"]` sözlüğündeki her bir kategori anahtarı (sıralama döngüsü)
  - `master_content` — master markdown dosyasının satırlarını tutan liste
  - `idx` — `enumerate(compiled_skills, 1)` ile 1'den başlayan indeks numarası
  - `skill` — `compiled_skills` listesindeki her bir yetenek sözlüğü (master markdown oluşturma döngüsü)
  - `name` (mermaid döngüsü) — `skill["name"]`, mermaid grafikte kullanılan yetenek adı
  - `dep` — `skill.get("depends_on", [])` listesindeki her bir bağımlılık adı
- **Dönüş**: yok — yan etkiler: `manifest_path` konumuna YAML manifest dosyası yazar, `output_file` konumuna master markdown dosyası yazar

---

## NODE ID STANDARD

  file: compile_skills.py
  function: compile_skills.py::get_repo_root
  function: compile_skills.py::main

---

## MERMAID CALL GRAPH
```mermaid
graph TD
    compile_skills_py__get_repo_root
    compile_skills_py__main
    compile_skills_py__get_repo_root --> compile_skills_py__check_output
    compile_skills_py__get_repo_root --> compile_skills_py__Path
    compile_skills_py__get_repo_root --> compile_skills_py__resolve
    compile_skills_py__main --> compile_skills_py__get_repo_root
    compile_skills_py__main --> compile_skills_py__exists
    compile_skills_py__main --> compile_skills_py__iterdir
    compile_skills_py__main --> compile_skills_py__is_dir
    compile_skills_py__main --> compile_skills_py__relative_to
    compile_skills_py__main --> compile_skills_py__safe_load
    compile_skills_py__main --> compile_skills_py__sort
    compile_skills_py__main --> compile_skills_py__mkdir
    compile_skills_py__main --> compile_skills_py__dump
    orion_cli_docs_migrator_lite_py____toplevel__ --> compile_skills_py__main
    orion_cli_analyze_py____toplevel__ --> compile_skills_py__main
    orion_cli_audit_py____toplevel__ --> compile_skills_py__main
    orion_cli_diagnose_py____toplevel__ --> compile_skills_py__main
    orion_cli_docs_tree_py____toplevel__ --> compile_skills_py__main
    orion_cli_health_py____toplevel__ --> compile_skills_py__main
    orion_cli_main_py____toplevel__ --> compile_skills_py__main
    orion_cli_need_py____toplevel__ --> compile_skills_py__main
    orion_cli_reset_py____toplevel__ --> compile_skills_py__main
    orion_cli_stats_py____toplevel__ --> compile_skills_py__main
    orion_mcp_server_py____toplevel__ --> compile_skills_py__main
    orion_memory_graphrag_py____toplevel__ --> compile_skills_py__main
    orion_memory_jobs_maintenance_py____toplevel__ --> compile_skills_py__main
    orion_memory_jobs_retroactive_heal_py____toplevel__ --> compile_skills_py__main
    orion_memory_shadow_catalog_py____toplevel__ --> compile_skills_py__main
    orion_memory_shadow_mirror_py____toplevel__ --> compile_skills_py__main
    orion_memory_shadow_rebuild_py____toplevel__ --> compile_skills_py__main
    orion_memory_shadow_recall_py____toplevel__ --> compile_skills_py__main
    orion_memory_shadow_search_py____toplevel__ --> compile_skills_py__main
    scratch_check_venthub_embedding_dims_py____toplevel__ --> compile_skills_py__main
    scratch_test_intent_resolution_py____toplevel__ --> compile_skills_py__main
    scratch_test_venthub_query_py____toplevel__ --> compile_skills_py__main
    scripts_skills-creator_py____toplevel__ --> compile_skills_py__main
    scripts_skills-orchestrator_py____toplevel__ --> compile_skills_py__main
    scripts_skills-router_py____toplevel__ --> compile_skills_py__main
    _agent_skills_ensemble_optimizer_py____toplevel__ --> compile_skills_py__main
    _agent_skills_reflective_optimizer_v2_py____toplevel__ --> compile_skills_py__main
    scripts_migrate_contaminated_data_py____toplevel__ --> compile_skills_py__main
    orion_scripts_gocur_kirli_gorev_sozlugu_py____toplevel__ --> compile_skills_py__main
    scripts_skills-creator_py__main --> compile_skills_py__get_repo_root
    scripts_skills-evaluator_py__evaluate_skills --> compile_skills_py__get_repo_root
    scripts_skills-orchestrator_py__main --> compile_skills_py__get_repo_root
    scripts_skills-router_py__main --> compile_skills_py__get_repo_root
```

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: main