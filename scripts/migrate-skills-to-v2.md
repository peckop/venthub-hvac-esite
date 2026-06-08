---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\migrate-skills-to-v2.py
skeleton_hash: a3863df52b483f1c
entity_hashes:
  func:get_repo_root: a4fd1e02a3bcff94
  func:migrate_skills: 6dc288ddaa83cb93
  overview: 86518686f79e8229
generated_at: 2026-06-08T13:28:41Z
---

## Genel Bakış
Bu modül, projedeki "becerileri" (skills) eski sürümden v2 sürümüne taşımak için kullanılan bir migrasyon betiğidir. Temel olarak gerekli dosya yollarını bulur ve migrasyon işlemini gerçekleştirir.

## Fonksiyon Grupları
### Altyapı ve Yol Yardımcıları
Bu fonksiyon, projenin kök dizinini bulmak gibi temel altyapı işlemlerini yapar. Bu yol bilgisi, diğer fonksiyonların doğru dosyalara erişmesini sağlar.
- get_repo_root

### Migrasyon Mantığı
Beceri dosyalarını yeni sürüme dönüştürme işlemini yöneten ana fonksiyondur. Bu fonksiyon, muhtemelen repo kök dizinini alıp ilgili dosyaları okur, dönüştürür ve kaydeder.
- migrate_skills

---

## AXIOMS – Mimari Varsayımlar

Bu modül için imza tabanlı özel aksiyom tanımlanamamıştır.

**Gerekçe:** Sunulan iki fonksiyon (`get_repo_root()` ve `migrate_skills()`) parametrik bir giriş almamaktadır; dolayısıyla fonksiyon imzasından çıkarılabilecek koşul/zorunluluk (eşik değer, geçerlilik aralığı, zorunlu bağımlılık vb.) bulunmamaktadır. Bu fonksiyonların doğru çalışması için gerekli koşullar —ör. geçerli bir Git deposu kök dizininin mevcudiyeti, migrate edilecek skill dosyalarının varlığı— fonksiyon gövdelerindeki uygulama detaylarına bağlıdır ve **fonksiyon imzalarında veya modül sabitlerinde** açıkça tanımlı değildir.

---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git repozituarının en üst dizinini (kökünü) bulur. Fonksiyon, bir Git komutu kullanarak projenin en üst düzey Git dizin yolunu döndürmeye çalışır. Başarısız olursa, kendi dosya yolunu temel alarak alternatif bir yol hesaplar.

**Nasıl yapar**: `subprocess` modülünü kullanarak `git rev-parse --show-toplevel` komutunu çalıştırır. Komutun çıktısını alır ve `Path` nesnesine dönüştürerek döndürür. Eğer komut herhangi bir sebeple (Git kurulu değilse veya bir Git repozituvarında değilsek) bir istisna fırlatırsa, `__file__` değişkeninin yolunu iki seviye yukarı (repolaroot olması beklenen konuma) çıkarak hesaplar ve bu yolu döndürür.

**Parametreler**: Bu fonksiyon hiçbir parametre almaz.

**Dönüş**: `Path` — Bulunan Git kök dizininin yolu. Hata durumunda, alternatif bir dizin yolu.

### migrate_skills
**Ne yapar**: Tüm yeteneklerin (skills) tanımlarını, bir V2 formatına günceller. Bu süreç, her bir yeteneğin `SKILL.md` dosyasındaki YAML frontmatter'ını manifest dosyasındaki meta verilerle zenginleştirir ve her yetenek için bir değerlendirme (evals) dosyası oluşturur.

**Nasıl yapar**: Fonksiyon, öncelikle repo kökünü bulur ve `.agent/plugins/venthub-core/manifest.yaml` dosyasını okur. Ardından, manifest'teki her bir yetenek kategorisi ve yetenek listesini iteratif olarak işler. Her yetenek için:
1.  İlgili `SKILL.md` dosyasını okur ve mevcut YAML frontmatter'ını ayrıştırır.
2.  Manifest'ten gelen `name`, `category`, `description`, `triggers_on`, `inputs`, `outputs`, `recovery` ve `prerequisites` bilgilerini frontmatter'a ve bir `metadata` bloğuna ekler.
3.  Güncellenmiş frontmatter ve orijinal gövde metni ile dosyayı yeniden yazar.
4.  Yetenek dizininin yanında bir `evals` klasörü oluşturur ve içinde `evals.json` dosyası oluşturur. Bu dosya, yeteneğin tetiklenmesi ve tetiklenmemesi gereken örnek sorguları (prompt) içerir. Tetiklenme sorguları, manifest'teki tetikleyicilerden türetilir.
5.  İşlenen yetenek sayısını tutar ve işlem sonunda toplam sayıyı yazdırır.

**Parametreler**: Bu fonksiyon hiçbir parametre almaz.

**Dönüş**: Fonksiyonun dönüş değeri yoktur (void). İşlem durumu ve sonuçları `print` ifadeleriyle standart çıktıya yazdırılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/migrate-skills-to-v2.py::get_repo_root
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `output` — `subprocess.check_output` çağrısının döndürdüğü string; git repo kök dizinini tutar
- **Dönüş**: `Path` — git repo kök dizini Path objesi; hata durumunda __file__'ın iki üst dizini



### [N2_NASIL] AST Pointer: scripts/migrate-skills-to-v2.py::migrate_skills
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `get_repo_root()` çağrısıyla elde edilen repo kök dizini Path objesi
  - `manifest_path` — repo_root altındaki `.agent/plugins/venthub-core/manifest.yaml` dosya yolu
  - `f` — manifest.yaml dosyası için açılan file handle
  - `manifest_data` — `yaml.safe_load(f)` ile parse edilen manifest sözlüğü
  - `skills_section` — `manifest_data` içinden alınan "skills" anahtarının değeri (dict: kategori -> skill listesi)
  - `total_migrated` — başarıyla göç ettirilen skill sayacı (int)
  - `standard_negative_queries` — should_not_trigger için sabit negatif sorgu listesi (list[str])
  - `category` — `skills_section.items()` döngüsündeki kategori adı (str)
  - `skills_list` — ilgili kategorideki skill entry listesi (list[dict])
  - `name` — `skill_entry.get("name")` ile alınan skill adı (str)
  - `rel_path` — `skill_entry.get("path")` ile alınan SKILL.md göreli dosya yolu (str)
  - `skill_md_path` — SKILL.md dosyasının mutlak yolu (Path objesi)
  - `content` — SKILL.md dosyasının ham string içeriği (str)
  - `parts` — `content.split("---")` ile oluşan parçalar listesi (list[str])
  - `frontmatter_text` — YAML frontmatter portion metni (parts[1])
  - `body_text` — SKILL.md dosyasının frontmatter sonrası gövde metni (str)
  - `frontmatter_data` — `yaml.safe_load(frontmatter_text)` ile parse edilen frontmatter sözlüğü (dict)
  - `e` — frontmatter parse hatası yakalandığında Exception nesnesi
  - `metadata` — `frontmatter_data` içinden alınan "metadata" sözlüğü (dict)
  - `triggers` — `skill_entry.get("triggers_on", [])` ile alınan tetikleme sorguları listesi (list[str])
  - `should_trigger_queries` — evals için oluşturulan tetiklenmeli sorgu listesi (list[str])
  - `t` — triggers döngüsündeki tek bir tetikleme sorgusu (str)
  - `new_frontmatter` — `yaml.dump(frontmatter_data, ...)` ile serialize edilmiş yeni YAML frontmatter stringi
  - `new_content` — yeniden oluşturulmuş SKILL.md dosya içeriği (str)
  - `f` — SKILL.md yazma dosyası için açılan file handle
  - `skill_dir` — SKILL.md dosyasının bulunduğu dizin (Path objesi)
  - `evals_dir` — SKILL.md yanına oluşturulan "evals" dizini (Path objesi)
  - `evals_data` — `evals.json` içine yazılacak sözlük; "should_trigger" ve "should_not_trigger" anahtarlarını barındırır (dict)
  - `evals_json_path` — `evals/evals.json` dosyasının tam yolu (Path objesi)
  - `json` — `json.dump` çağrısı için dosya içinde import edilen json modülü
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: scripts\migrate-skills-to-v2.py
  function: scripts\migrate-skills-to-v2.py::get_repo_root
  function: scripts\migrate-skills-to-v2.py::migrate_skills

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: migrate_skills