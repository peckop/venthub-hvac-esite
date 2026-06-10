---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\compile_skills.py
skeleton_hash: ee68b11595139c99
entity_hashes:
  func:get_repo_root: a4fd1e02a3bcff94
  func:main: 0487b5aaacb0d73d
  overview: f55ad6ea283369d2
generated_at: 2026-06-10T09:36:00Z
---

## Genel Bakış
Bu modül, proje dizin yapısını analiz ederek 'skills' (beceri) dosyalarını derlemek ve işlemek üzere tasarlanmış bir komut satarı (CLI) aracıdır. Ana işlevi, repository kök dizinini tespit edip gerekli derleme veya işleme adımlarını başlatmaktır.

## Fonksiyon Grupları
### Dizin ve Yol Yönetimi
Proje dosya sistemiyle ilgili temel konum bilgilerini sağlayan yardımcı fonksiyonlar.
- `get_repo_root`, `main`

### Ana İş Akışı ve CLI Noktası
Aracın giriş noktası olan ve tüm derleme sürecini başlatan ana fonksiyon.
- `main`

---

## AXIOMS – Mimari Varsayımlar
Bu modül, derleme süreçlerini başlatan bir betik olduğu için aşağıdaki mimari varsayımlar geçerlidir:

[A

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git version kontrol sistemi tarafından yönetilen bir projenin en üst düzey (kök) dizin yolunu döndürür. Fonksiyon, bir Git deposunun içinde olup olmadığınızı belirlemek için kullanılır.

**Nasıl yapar**: `subprocess` modülünü kullanarak `git rev-parse --show-toplevel` komutunu çalıştırır ve çıktısının temizlenmiş (strip) halini bir `Path` nesnesine dönüştürerek döndürür. Eğer bir hata oluşursa (örneğin dizin bir Git deposu değilse), kendi dosya konumunu referans alarak yukarı çıkarak proje kök dizinini tahmin eder.

**Parametreler**:
- Parametre almaz.

**Dönüş**: `Path` — Git repositoriesinin kök dizinini temsil eden bir nesne. Hata durumunda, fonksiyonun bulunduğu dosyanın iki üst dizinine karşılık gelen yolu döndürür.

### main
**Ne yapar**: Yetenek (skill) derleyicisinin ana işlevini yürütür. Belirli bir dizindeki tüm yetenek modüllerini tarar, YAML frontmatter bilgilerini ayrıştırır, standart bir `manifest.yaml` dosyası ve kapsamlı bir master markdown belgesi oluşturur.

**Nasıl yapar**: İlk olarak `get_repo_root()` fonksiyonunu çağırarak proje dizinini belirler. Ardından `.agent/skills` dizinindeki her bir alt klasörü sırayla gezer. Her yetenek için bir `SKILL.md` dosyası arar, varsa YAML ön bilgisini ve gövde metnini ayırır. Bu bilgileri kullanarak belirli bir şablona göre bir `manifest` sözlüğü oluşturur ve kategorilere (orchestration, intelligence, guards, audit, utils) yerleştirir. Son olarak bu sözlüğü `venthub-core/manifest.yaml` dosyasına yazar. Ek olarak, tüm yetenekleri birleştirerek bir Mermaid bağımlılık grafiği ve yetenek açıklamalarından oluşan `venthub_skills_master.md` adlı bir master markdown dosyası üretir.

**Parametreler**:
- Parametre almaz.

**Dönüş**: Belirtilmemiş (void). Fonksiyon doğrudan dosya sistemine yazar (manifest.yaml ve venthub_skills_master.md) ve konsola durum mesajları basar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\scripts\compile_skills.py::get_repo_root
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `output` — `subprocess.check_output()` çağrısının döndürdüğü ham string çıktısı, repo kök dizininin yolu
  - `e` — Exception nesnesi, hata durumunda yakalanan异常 (sadece except bloğu içinde)
- **Dönüş**: `Path` — Git repo kök dizinini temsil eden Path nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\scripts\compile_skills.py::main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `get_repo_root()` çağrısıyla elde edilen repository kök dizini Path nesnesi
  - `skills_dir` — `.agent/skills` dizininin tam yolu, skill dosyalarının aranacağı dizin
  - `manifest_path` — Oluşturulacak `venthub-core/manifest.yaml` dosyasının tam yolu
  - `output_file` — Oluşturulacak master markdown dosyasının tam yolu
  - `compiled_skills` — Derlenmiş skill nesnelerinin listesi, her biri skill metadata ve body içeriğini tutar
  - `manifest` — Ana manifest sözlüğü, tüm skillleri kategorilerine göre organize eder
  - `skill_path` — Döngü içindeki mevcut skill dizini
  - `skill_md_path` — Mevcut skill dizinindeki `SKILL.md` dosyasının yolu
  - `f` — `skill_md_path` dosyasını okumak için açılan dosya nesnesi (UTF-8 encoding)
  - `content` — `SKILL.md` dosyasınınham string içeriği
  - `parts` — `content`'in `"---"` ile bölünmüş parçaları listesi
  - `frontmatter_text` — YAML frontmatter section'ın ham metni
  - `body_text` — Markdown body section'ın metni
  - `metadata_yaml` — `frontmatter_text`'ten parse edilmiş YAML sözlüğü
  - `name` — Skill'in adı, frontmatter'dan alınır veya dizin adı varsayılır
  - `description` — Skill'in açıklaması, frontmatter'dan alınır
  - `category` — Skill'in kategorisi (`orchestration`, `intelligence`, `guards`, `audit`, `utils`), frontmatter'dan alınır
  - `metadata` — Metadata alt sözlüğü (triggers, inputs, outputs, commands vb. içerir)
  - `depends_on` — Bu skill'in bağımlı olduğu diğer skill'lerin listesi
  - `next_steps` — Bu skill çalıştırıldıktan sonra çalıştırılacak skill'lerin listesi
  - `run_last` — Skill'in en sonda mı çalıştırılacağı boolean flag
  - `exclusions` — Bu skill ile aynı anda çalışamayacak skill'lerin listesi
  - `skill_rel_path` — `skill_md_path`'in repo root'a göre göreceli yolu (backslash'leri slash ile değiştirilmiş)
  - `manifest_entry` — Bu skill için manifest sözlüğündeki giriş
  - `idx` — `compiled_skills` listesi üzerindeki döngü sayacı (1'den başlar)
  - `skill` — Mevcut döngü adımındaki skill sözlüğü
  - `master_content` — Oluşturulacak master markdown dosyasının satırlarını tutan liste
- **Dönüş**: yok (yan etki: `manifest_path` ve `output_file` dosyalarını oluşturur/overwrite eder)

---

## NODE ID STANDARD

  file: scripts\compile_skills.py
  function: scripts\compile_skills.py::get_repo_root
  function: scripts\compile_skills.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: main