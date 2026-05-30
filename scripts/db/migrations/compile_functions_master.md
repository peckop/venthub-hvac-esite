---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\compile_functions_master.py
skeleton_hash: 43c9ea08e051eba1
entity_hashes:
  func:compile_functions: 0644a58a5ea19196
  overview: 83592a62aaf35fe9
generated_at: 2026-05-30T21:22:20Z
---

## Genel Bakış

Veritabanı migrasyon süreçlerinde kullanılan fonksiyonları derleyen ve merkezi bir konumda toplayan tek amaçlı bir script modülüdür. Proje genelindeki fonksiyon tanımlarını bir araya getirerek veritabanına uygulanacak yapıyı hazırlar.

## Fonksiyon Grupları

### Fonksiyon Derleme
Modüldeki tek sorumluluk olan bu grup, projedeki fonksiyon tanımlarını derler ve tek bir kaynak dosyada birleştirerek veritabanı migrasyonları için hazır hale getirir.
- compile_functions

---

## AXIOMS – Mimari Varsayımlar
Fonksiyon gövdesi veya modül içeriği verilmediği için bu modül için mimari varsayımlar çıkarılamaz.

**Not:** Modülün kaynak kodu (fonksiyon gövdesi) veya detaylı kullanım bağlamı sağlanmadan, bu modülün doğru çalışması için gerekli olan koşullar (örneğin, hangi dosyaların okunması gerektiği, hangi veritabanı bağlantılarının aktif olması gerektiği, bağımlı olduğu diğer modüller vb.) belirlenemez. Aksiyomlar, yalnızca verilen fonksiyon imzası (`compile_functions()`) kullanılarak üretilemez.

---

## FONKSİYON DETAYLARI

### compile_functions

**Ne yapar**: `supabase/functions` dizinindeki tüm markdown dokümantasyon dosyalarını recursive olarak tarar, sıralı bir şekilde okur ve tek bir master markdown belgesi (`docs/supabase_functions_master.md`) içinde birleştirir.

**Nasıl yapar**: Fonksiyon önce `glob.glob` ile belirtilen dizindeki tüm `.md` dosyalarını keşfeder. Ardından `master.md` ile biten dosyaları hariç tutarak kendisini tekrar dahil etmeyi önler. Dosyalar alfabetik olarak sıralanarak tutarlı (deterministic) bir çıktı garantisi sağlanır. Her dosya okunarak YAML frontmatter başlıklı bir blok içine yerleştirilir ve tüm bloklar bir header ile birlikte tek bir çıkış dosyasına yazılır.

**Parametreler**: Bu fonksiyon parametre almaz.

**Dönüş**: Fonksiyon herhangi bir değer döndürmez (None / void). Yan etki olarak `docs/supabase_functions_master.md` dosyasını oluşturur veya üzerine yazar.

---

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/compile_functions_master.py::compile_functions
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `functions_dir` — Tarama yapılacak kaynak dizin yolu ('supabase/functions'), glob aramasının başlangıç noktasını belirler
  - `output_file` — Oluşturulacak derlenmiş master belge dosya yolu ('docs/supabase_functions_master.md'), sonuç bu dosyaya yazılır
  - `md_files` — glob.glob ile functions_dir altından recursive olarak bulunan tüm .md dosya yollarının listesi; ardından 'master.md' ile bitenler filtrelenir ve alfabetik sıralanır
  - `header` — Master belgenin başına yazılacak YAML frontmatter ve başlık bloğu f-string'i; datetime.utcnow().isoformat() ile derleme zamanını ve len(md_files) ile toplam dosya sayısını içerir
  - `content_blocks` — Her bir markdown dosyasının formatlanmış halini (dosya başlığı + içerik) tutan liste, tüm dosya blokları burada birikir
  - `filepath` — for döngüsünde işlenen mevcut dosya yolu, md_files listesinin her elemanını sırayla alır
  - `normalized_path` — filepath üzerinde replace('/', '\\') ile Windows standardına uygun path separator dönüşümü uygulanmış hali, master belgede okunabilir gösterim için kullanılır
  - `file_content` — open() ile okunan mevcut markdown dosyasının tam metin içeriği (encoding='utf-8'), block formatında master belgeye yerleştirilir
  - `block` — Tek bir dosyanın master belgeye eklenecek formatlanmış markdown bloğu; dosya ayırıcı başlık (FILE: normalized_path) ve file_content birleşiminden oluşur
- **Dönüş**: yok — fonksiyon dosya yan etkisi ile çalışır; output_file'a derlenmiş master belgeyi yazar ve konsola durum mesajları basar (print)

---

## NODE ID STANDARD

  file: scripts\db\migrations\compile_functions_master.py
  function: scripts\db\migrations\compile_functions_master.py::compile_functions

---

## DISA AKTARILANLAR (EXPORTS)
  export: compile_functions