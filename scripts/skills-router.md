---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\scripts\skills-router.py
skeleton_hash: c2a02a6a2da6893f
entity_hashes:
  func:get_repo_root: 5ea9c5aa06e9d251
  func:load_skills: 45f00957f8eeef30
  func:main: 4f696b9a3f758a56
  overview: 189370cdcb7f1882
generated_at: 2026-08-25T07:23:52Z
---

## Genel Bakış
Bu modül, bir projedeki beceri (skill) dosyalarını yüklemekten ve yönlendirmekten sorumludur. Repo kök dizinini belirleyerek beceri dosyalarının bulunduğu dizine erişir ve bu dosyaları sisteme dahil eder. Ana iş akışı, gerekli dizinleri bulup becerileri yükleyecek şekilde kurgulanmıştır.

## Fonksiyon Grupları

### Dizin ve Yol İşlemleri
Projenin kök dizinini belirleyerek diğer fonksiyonlara referans noktası sağlar.
- get_repo_root

### Beceri Yükleme
Belirtilen dizindeki beceri dosyalarını okuyarak sisteme kazandırır.
- load_skills

### Ana İş Akışı
Programın giriş noktasıdır; kök dizin tespiti ve beceri yükleme adımlarını sırayla çalıştırarak tüm süreci koordine eder.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan (`get_repo_root`, `load_skills`, `main`) anlamlı mimari varsayımlar üretilememektedir. Aksiyomlar yalnızca fonksiyon gövdelerinden türetilir; imza bilgisi tek başına modülün çalışma koşullarını belirlemek için yeterli değildir.

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git deposunun kök dizin yolunu `Path` nesnesi olarak döndürür. Fonksiyon, çalışılan projenin en üst düzey dizinini tespit etmek amacıyla kullanılır.

**Nasıl yapar**: İlk olarak `subprocess` modülünü içe aktarır ve `git rev-parse --show-toplevel` komutunu çalıştırarak Git'in deposunun kök dizinini standart çıktıdan alır. Çıktıdaki boşlukları temizleyip `Path` nesnesine dönüştürerek döndürür. Eğer bu işlem herhangi bir exception ile başarısız olursa (örneğin ortamda Git yüklü değilse veya dosya bir Git deposunda değilse), yedek olarak betiğin kendisinin iki üst dizinini (`__file__`'ın çözümlenmiş yolunun parent.parent'ı) döndürür.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `Path` — Git deposunun kök dizinini temsil eden bir `Path` nesnesi. Hata durumunda betiğin iki üst dizinine karşılık gelen `Path` nesnesi döner.

### load_skills
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### main
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: argparse
- import: json
- import: numpy
- import: onnxruntime
- import: os
- import: pathlib::Path
- import: re
- import: sys
- import: tokenizers
- import: yaml

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/skills-router.py::get_repo_root
- **params**: yok
- **ic_degiskenler**:
  - `subprocess` — fonksiyon içinde lazy import edilen modül; `check_output` ile git komutu çalıştırmak için kullanılır
  - `output` — `subprocess.check_output` dönüşü, `git rev-parse --show-toplevel` komutunun metin çıktısı
- **Dönüş**: `Path` — ya git kök dizini ya da `__file__`'ın iki üst klasörü

### [N2_NASIL] AST Pointer: scripts/skills-router.py::load_skills
- **params**: `skills_dir` — skill dizinlerinin bulunduğu kök dizin (Path)
- **ic_degiskenler**:
  - `skills_list` — boş liste olarak başlatılır, bulunan her skill'in sözlüğünü toplar; fonksiyon dönüşüdür
  - `skill_path` — `skills_dir.iterdir()` ile dönen her alt dizin yolu
  - `skill_md_path` — `skill_path / "SKILL.md"` hesaplanan dosya yolu
  - `f` — `open(skill_md_path, ...)` ile açılan dosya nesnesi
  - `content` — `f.read()` ile okunan SKILL.md dosyasının tam metin içeriği
  - `parts` — `content.split("---")` ile elde edilen metin parçaları listesi
  - `frontmatter_text` — `parts[1]`, YAML ön bilgi bloğunun ham metni
  - `frontmatter` — `yaml.safe_load(frontmatter_text)` ile parse edilen sözlük; hata durumunda `continue` ile atlanır
  - `e` — `yaml.safe_load` yakalanan istisna nesnesi; hata mesajında kullanılır
  - `name` — `frontmatter.get("name", skill_path.name)`, skill adı
  - `description` — `frontmatter.get("description", "")`, skill açıklaması
  - `depends_on` — `frontmatter.get("depends_on", [])`, bağımlı skill listesi
  - `next_steps` — `frontmatter.get("next_steps", [])`, sonraki adım listesi
  - `run_last` — `frontmatter.get("run_last", False)` , son çalıştırma bayrağı
  - `exclusions` — `frontmatter.get("exclusions", [])`, hariç tutulan skill listesi
  - `metadata` — `frontmatter.get("metadata", {})`, metadata alt sözlüğü
  - `triggers` — `metadata.get("triggers", [])` veya `frontmatter.get("triggers", [])`, tetikleyici liste; metadata içinde yoksa frontmatter üst seviyesinden alınır
- **Dönüş**: `skills_list` — her elemanı `name`, `description`, `depends_on`, `next_steps`, `run_last`, `exclusions`, `triggers` anahtarlarını içeren sözlük listesi

### [N3_NASIL] AST Pointer: scripts/skills-router.py::main
- **params**: yok
- **ic_degiskenler**:
  - `parser` — `argparse.ArgumentParser` nesnesi, açıklama: "Route query to modular agent skills."
  - `args` — `parser.parse_args()` dönüşü; `args.query` kullanıcı sorgu metni
  - `repo_root` — `get_repo_root()` dönüşü, proje kök dizini
  - `skills_dir` — `repo_root / ".agent" / "skills"`, skill dizini yolu
  - `model_path` — `repo_root / ".agent" / "cache" / "onnx" / "model.onnx"`, ONNX model dosya yolu
  - `tokenizer_path` — `repo_root / ".agent" / "cache" / "onnx" / "tokenizer.json"`, tokenizer dosya yolu
  - `skills` — `load_skills(skills_dir)` dönüşü, skill sözlükleri listesi; boşsa `CONVERSATIONAL` durumu basılır ve çıkılır
  - `tokenizer` — `tokenizers.Tokenizer.from_file(str(tokenizer_path))` ile yüklenen tokenizer nesnesi
  - `texts` — `[args.query] + [s["description"] for s in skills]`, sorgu ve tüm skill açıklamalarından oluşan liste
  - `encodings` — `tokenizer.encode_batch(texts)` dönüşü, her metin için encoding nesneleri
  - `input_ids` — `np.array([e.ids for e in encodings], dtype=np.int64)`, token ID'leri dizisi
  - `attention_mask` — `np.array([e.attention_mask for e in encodings], dtype=np.int64)`, dikkat maskesi dizisi
  - `token_type_ids` — `np.array([e.type_ids for e in encodings], dtype=np.int64)`, token tipi ID'leri dizisi
  - `session` — `ort.InferenceSession(str(model_path))`, ONNX çıkarım oturumu
  - `ort_inputs` — `{"input_ids": input_ids, "attention_mask": attention_mask, "token_type_ids": token_type_ids}` sözlüğü, modele verilen girdiler
  - `ort_outputs` — `session.run(["last_hidden_state"], ort_inputs)` dönüşü, model çıktıları listesi
  - `token_embeddings` — `ort_outputs[0]`, shape `(batch_size, seq_len, 384)` olan token gömme tensörü
  - `input_mask_expanded` — `np.expand_dims(attention_mask, axis=-1)`, maske tensörüne son boyut eklenmiş hali
  - `sum_embeddings` — `np.sum(token_embeddings * input_mask_expanded, axis=1)`, maske uygulanmış gömmelerin toplamı
  - `sum_mask` — `np.sum(input_mask_expanded, axis=1)` ardından `np.clip(sum_mask, a_min=1e-9, a_max=None)`, normalize etmek için kullanılan maske toplamı
  - `sentence_embeddings` — `sum_embeddings / sum_mask`, shape `(batch_size, 384)` olan cümle gömme tensörü
  - `norms` — `np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)` ardından `np.clip(norms, a_min=1e-9, a_max=None)`, L2 norm değerleri
  - `normalized_embeddings` — `sentence_embeddings / norms`, normalize edilmiş gömme tensörü
  - `query_embedding` — `normalized_embeddings[0]`, sorgu vektörü
  - `skill_embeddings` — `normalized_embeddings[1:]`, skill açıklamaları vektörleri
  - `similarities` — `np.dot(skill_embeddings, query_embedding)`, shape `(28,)` olan kosinüs benzerlik skorları dizisi
  - `DEV_KEYWORDS` — Türkçe ve İngilizce geliştirme anahtar kelimeleri kümesi; sorgunun teknik olup olmadığını belirlemek için kullanılır
  - `query_lower` — `args.query.lower().strip()`, küçük harfe çevrilmiş ve boşlukları temizlenmiş sorgu
  - `SYNONYMS` — Türkçe-İngilizce eş anlamlı kelimeler sözlüğü; `query_lower` içindeki Türkçe terimleri İngilizce karşılıklarıyla değiştirir
  - `tr` — `SYNONYMS` sözlüğündeki Türkçe anahtar
  - `eng` — `SYNONYMS` sözlüğündeki İngilizce karşılık
  - `query_tokens` — `set(re.findall(r'\w+', query_lower))`, sorgunun tokenize edilmiş kelimeler kümesi
  - `any_trigger_match` — herhangi bir skill'in tetikleyicisiyle eşleşme olup olmadığını gösteren boolean
  - `has_dev_keyword` — `len(query_tokens.intersection(DEV_KEYWORDS)) > 0`, sorguda geliştirme anahtar kelimesi olup olmadığını gösteren boolean
  - `idx` — `enumerate(skills)` ile döngüdeki skill indeksi
  - `s` — döngüdeki skill sözlüğü; `s["score"]` ve `s["raw_score"]` alanları atanır
  - `cosine_sim` — `float(similarities[idx])`, mevcut skill'in kosinüs benzerlik skoru
  - `boost` — tetikleyici eşleşmesi varsa `0.45` eklenen skor artışı
  - `trigger_matched` — mevcut skill için tetikleyici eşleşmesi olup olmadığını gösteren boolean
  - `trigger` — `s.get("triggers", [])` listesindeki her tetikleyici metin
  - `trig_lower` — `trigger.lower().strip()`, küçük harfe çevrilmiş tetikleyici
  - `trig_words` — `re.findall(r'\w+', trig_lower)` ile elde edilen tetikleyici kelimeleri listesi (uzunluk >= 1)
  - `matched_words` — `trig_words` içinde `query_lower`'da bulunan kelimeler listesi
  - `max_score` — `float(np.max([s["score"] for s in skills]))`, tüm skill'ler arasındaki en yüksek skor; `0.25` altındaysa `CONVERSATIONAL` basılır
  - `candidates` — filtrelenmiş aday skill listesi; tetikleyici eşleşmesi olan veya `raw_score >= 0.50` olan skill'ler
  - `has_trigger` — `s["score"] > s["raw_score"]`, tetikleyici boost'u uygulanmış mı kontrolü
  - `candidates_sorted` — `sorted(candidates, key=lambda x: x["score"], reverse=True)`, skora göre azalan sıralanmış adaylar
  - `excluded_names` — `set()`, hariç tutulan skill isimlerini toplar
  - `c` — `candidates_sorted` döngüsündeki aday sözlüğü
  - `directly_matched` — hariç tutulmamış adayların isim listesi; boşsa `CONVERSATIONAL` basılır
  - `final_active_set` — `set()`, bağımlılıklarıyla birlikte aktif olan skill isimlerinin kümesi
  - `add_with_dependencies` — iç fonksiyon; bir skill'i ve bağımlılıklarını `final_active_set`'e ekler
  - `name` — `directly_matched` listesindeki her skill adı
  - `active_candidates` — `final_active_set` içindeki isimlere sahip skill sözlükleri listesi
  - `nodes` — `active_candidates` içindeki skill isimleri listesi
  - `adj` — `{node: [] for node in nodes}`, topolojik sıralama için komşuluk listesi sözlüğü
  - `in_degree` — `{node: 0 for node in nodes}`, topolojik sıralama için iç derece sözlüğü
  - `u` — `active_candidates` döngüsündeki mevcut skill adı
  - `dep` — `c["depends_on"]` listesindeki bağımlılık adı; `dep in adj` kontrolüyle graf içinde varlığı doğrulanır
  - `v` — `other_c["name"]`, `run_last` kontrolünde karşılaştırılan diğer skill adı
  - `other_c` — `active_candidates` içindeki diğer skill sözlüğü; `run_last` bayrağı `False` olanlarla `u` arasında kenar oluşturulur
  - `queue` — Kahn algoritması kuyruğu; `in_degree[node] == 0` olan düğümlerle başlatılır ve skora göre sıralanır
  - `ordered` — topolojik sıralama sonucu skill isimleri listesi
  - `curr` — `queue.pop(0)` ile çıkarılan mevcut düğüm adı
  - `neighbor` — `adj[curr]` listesindeki komşu düğüm adı; `in_degree[neighbor]` azaltılır
  - `missing` — döngü tespit edildiğinde `ordered`'da olmayan düğümler listesi; `ordered.extend(missing)` ile eklenir
- **Dönüş**: yok — `print(json.dumps(...))` ile `CONVERSATIONAL` veya `MATCHED` durumu ve `path` listesi çıktı verir

### [N4_NASIL] AST Pointer: scripts/skills-router.py::add_with_dependencies
- **params**: `skill_name` — eklenmek istenen skill'in adı
- **ic_degiskenler**:
  - `final_active_set` — dış scope'dan (main fonksiyonu) erişilen küme; skill isimlerini toplar; `skill_name` zaten kümedeyse çıkılır
  - `s_obj` — `next((s for s in skills if s["name"] == skill_name), None)` ile bulunan skill sözlüğü; bulunamazsa `None`
  - `dep` — `s_obj.get("depends_on", [])` listesindeki her bağımlılık adı; `add_with_dependencies(dep)` ile özyinelemeli olarak eklenir
- **Dönüş**: yok — yan etki olarak `final_active_set` kümesini bağımlılıklarıyla birlikte günceller

---

## NODE ID STANDARD

  file: skills-router.py
  function: skills-router.py::get_repo_root
  function: skills-router.py::load_skills
  function: skills-router.py::main

---

## MERMAID CALL GRAPH
```mermaid
graph TD
    skills-router_py__get_repo_root
    skills-router_py__load_skills
    skills-router_py__main
    skills-router_py__add_with_dependencies
    skills-router_py__get_repo_root --> skills-router_py__check_output
    skills-router_py__get_repo_root --> skills-router_py__Path
    skills-router_py__get_repo_root --> skills-router_py__resolve
    skills-router_py__load_skills --> skills-router_py__exists
    skills-router_py__load_skills --> skills-router_py__iterdir
    skills-router_py__load_skills --> skills-router_py__is_dir
    skills-router_py__load_skills --> skills-router_py__safe_load
    skills-router_py__main --> skills-router_py__ArgumentParser
    skills-router_py__main --> skills-router_py__add_argument
    skills-router_py__main --> skills-router_py__parse_args
    skills-router_py__main --> skills-router_py__get_repo_root
    skills-router_py__main --> skills-router_py__load_skills
    skills-router_py__main --> skills-router_py__dumps
    skills-router_py__main --> skills-router_py__from_file
    skills-router_py__main --> skills-router_py__enable_padding
    skills-router_py__main --> skills-router_py__enable_truncation
    skills-router_py__main --> skills-router_py__encode_batch
    skills-router_py__main --> skills-router_py__array
    skills-router_py__main --> skills-router_py__InferenceSession
    skills-router_py__main --> skills-router_py__run
    skills-router_py__main --> skills-router_py__expand_dims
    skills-router_py__main --> skills-router_py__clip
    skills-router_py__main --> skills-router_py__norm
    skills-router_py__main --> skills-router_py__dot
    skills-router_py__main --> skills-router_py__findall
    skills-router_py__main --> skills-router_py__intersection
    skills-router_py__main --> skills-router_py__add
    skills-router_py__main --> skills-router_py__add_with_dependencies
    skills-router_py__main --> skills-router_py__sort
    skills-router_py__main --> skills-router_py__fromkeys
    skills-router_py__add_with_dependencies --> skills-router_py__add
    skills-router_py__add_with_dependencies --> skills-router_py__add_with_dependencies
    orion_cli_docs_migrator_lite_py____toplevel__ --> skills-router_py__main
    orion_cli_analyze_py____toplevel__ --> skills-router_py__main
    orion_cli_audit_py____toplevel__ --> skills-router_py__main
    orion_cli_diagnose_py____toplevel__ --> skills-router_py__main
    orion_cli_docs_tree_py____toplevel__ --> skills-router_py__main
    orion_cli_health_py____toplevel__ --> skills-router_py__main
    orion_cli_main_py____toplevel__ --> skills-router_py__main
    orion_cli_need_py____toplevel__ --> skills-router_py__main
    orion_cli_reset_py____toplevel__ --> skills-router_py__main
    orion_cli_stats_py____toplevel__ --> skills-router_py__main
    orion_mcp_server_py____toplevel__ --> skills-router_py__main
    orion_memory_graphrag_py____toplevel__ --> skills-router_py__main
    orion_memory_jobs_maintenance_py____toplevel__ --> skills-router_py__main
    orion_memory_jobs_retroactive_heal_py____toplevel__ --> skills-router_py__main
    orion_memory_shadow_catalog_py____toplevel__ --> skills-router_py__main
    orion_memory_shadow_mirror_py____toplevel__ --> skills-router_py__main
    orion_memory_shadow_rebuild_py____toplevel__ --> skills-router_py__main
    orion_memory_shadow_recall_py____toplevel__ --> skills-router_py__main
    orion_memory_shadow_search_py____toplevel__ --> skills-router_py__main
    scratch_check_venthub_embedding_dims_py____toplevel__ --> skills-router_py__main
    scratch_test_intent_resolution_py____toplevel__ --> skills-router_py__main
    scratch_test_venthub_query_py____toplevel__ --> skills-router_py__main
    scripts_compile_skills_py____toplevel__ --> skills-router_py__main
    scripts_skills-creator_py____toplevel__ --> skills-router_py__main
    scripts_skills-orchestrator_py____toplevel__ --> skills-router_py__main
    _agent_skills_ensemble_optimizer_py____toplevel__ --> skills-router_py__main
    _agent_skills_reflective_optimizer_v2_py____toplevel__ --> skills-router_py__main
    scripts_migrate_contaminated_data_py____toplevel__ --> skills-router_py__main
    orion_scripts_gocur_kirli_gorev_sozlugu_py____toplevel__ --> skills-router_py__main
    scripts_compile_skills_py__main --> skills-router_py__get_repo_root
    scripts_skills-creator_py__main --> skills-router_py__get_repo_root
    scripts_skills-evaluator_py__evaluate_skills --> skills-router_py__get_repo_root
    scripts_skills-orchestrator_py__main --> skills-router_py__get_repo_root
```

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: load_skills
  export: main