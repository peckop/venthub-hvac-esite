---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\expand-all-evals.py
skeleton_hash: c8bfe3a372dd492b
entity_hashes:
  func:get_repo_root: 98565d319ef8b635
  func:main: deda33a887dec1c8
  overview: c6404f45a65ae61f
generated_at: 2026-06-08T13:28:22Z
---

## Genel Bakış
Bu modül, HVAC deposundaki değerlendirme (eval) dosyalarını toplu olarak genişletmek için kullanılan bir betiktir. Modül, öncelikle deponun kök dizinini otomatik olarak tespit eder ve ardından belirli bir iş akışını başlatarak eval dosyalarının genişletilmesi işlemini yürütür.

## Fonksiyon Grupları
### Konum Belirleme ve Hazırlık
Bu grup, modülün çalışması için gerekli olan temel ortam bilgisini sağlar ve deponun kök dizinini belirler.
- get_repo_root

### Ana İşlem Akışı
Bu grup, modülün temel amacını gerçekleştiren ana kontrol ve iş mantığını içerir.
- main

---



---

## FONKSİYON DETAYLARI

### get_repo_root
**Ne yapar**: Git repozituarının kök dizinini bulur. Bu fonksiyon, çalıştırıldığı dizinden yukarı doğru giderek projenin en üst düzey (root) dizinini tespit etmek için kullanılır.
**Nasıl yapar**: `git rev-parse --show-toplevel` komutunu `subprocess` modülüyle çalıştırarak Git'in kök dizin yolunu elde eder. Komut başarısız olursa (örneğin bir Git repo’sunda değilse), `__file__` (mevcut betik dosyası) üzerinden iki üst dizine giderek bir yol nesnesi döndürür. Bu, betiğin bir proje dizininin içinde olduğunu varsayar.
**Parametreler**: Yok
**Dönüş**: `Path` — Git repozituarının kök dizini, veya hata durumunda mevcut betik dosyasının iki üst dizini.

### main
**Ne yapar**: `.agent` dizinindeki tüm becerilerin (skills) değerlendirme (eval) dosyalarını genişletir. Her bir beceri için `should_trigger` listesini en az 12, `should_not_trigger` listesini ise en az 8 sorgu olacak şekilde otomatik olarak günceller ve doldurur.
**Nasıl yapar**: 
1. `get_repo_root` ile proje kökünü bulur ve `.agent/plugins/venthub-core/manifest.yaml` dosyasını okuyarak kayıtlı becerilerin listesini alır.
2. Her bir beceri için `.agent/skills/{skill_name}/evals/evals.json` dosyasını mevcutsa okur, yoksa boş bir yapı oluşturur.
3. `should_trigger` listesini, becerinin tetikleyicileri (`triggers_on`) ve türetilmiş varyasyonlar (örneğin "run ...", "execute ...") ile genişletir. Liste 12’den kısa ise generic sorgularla tamamlar.
4. `should_not_trigger` listesine, dış sorguları (`generic_negatives`) ekler, becerinin kendi tetikleyicilerini içeren sorguları filtreler ve 8’den kısa ise generic sorgularla tamamlar.
5. Güncellenmiş listeleri JSON formatında dosyaya yazar ve ilerlemeyi konsola yazdırır.
**Parametreler**: Yok
**Dönüş**: Yok (None/void). Sonuçlar dosya sistemine yazılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/expand-all-evals.py::get_repo_root
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `output` — `git rev-parse --show-toplevel` komutunun çıktısını tutan string, repo kök dizinini temsil eder
- **Dönüş**: Path — repository kök dizinini Path nesnesi olarak döndürür

### [N2_NASIL] AST Pointer: scripts/expand-all-evals.py::main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `repo_root` — `get_repo_root()` çağrısı ile alınan repository kök dizini (Path)
  - `skills_dir` — yeteneklerin bulunduğu dizin yolu: `repo_root / ".agent" / "skills"` (Path)
  - `manifest_path` — manifest dosyasının tam yolu: `repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"` (Path)
  - `f` — manifest dosyasını okumak için açılan dosya nesnesi
  - `manifest_data` — YAML formatındaki manifest verisi olarak yüklenen sözlük
  - `skills_section` — manifest_data'dan alınan "skills" anahtarının değeri (sözlük)
  - `generic_negatives` — generic out-of-scope sorguların listesi (8 elemanlı string listesi)
  - `category` — skills_section sözlüğündeki kategori adı (for döngüsünde)
  - `skill` — kategori içindeki her bir yetenek sözlüğü (for döngüsünde)
  - `name` — yeteneğin adı: `skill.get("name")` (string)
  - `triggers` — yeteneğin tetikleme sorguları: `skill.get("triggers_on", [])` (string listesi)
  - `skill_dir` — yeteneğin dizin yolu: `skills_dir / name` (Path)
  - `evals_file` — evals.json dosyasının yolu: `skill_dir / "evals" / "evals.json"` (Path)
  - `evals_file.parent` — evals dosyasının bulunduğu dizin (Path)
  - `evals_data` — evals.json dosyasından yüklenen JSON verisi (sözlük)
  - `current_should` — mevcut "should_trigger" sorguları listesi
  - `current_should_not` — mevcut "should_not_trigger" sorguları listesi
  - `st_queries` — genişletilecek "should_trigger" sorguları listesi
  - `t` — triggers listesindeki her bir tetikleme sorgusu (string, for döngüsünde)
  - `snt_queries` — genişletilecek "should_not_trigger" sorguları listesi
  - `q` — snt_queries listesindeki her bir sorgu (list comprehension içinde)
- **Dönüş**: yok — fonksiyon disk dosyalarını değiştirir ve konsola çıktı basar

---

## NODE ID STANDARD

  file: scripts\expand-all-evals.py
  function: scripts\expand-all-evals.py::get_repo_root
  function: scripts\expand-all-evals.py::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: get_repo_root
  export: main