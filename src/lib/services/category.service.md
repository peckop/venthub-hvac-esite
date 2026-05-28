---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\category.service.ts
skeleton_hash: aee4457659e06e6e
entity_hashes:
  func:getCategories: 864d377205f3c2e8
  overview: 57425652e662ba47
generated_at: 2026-05-28T22:38:19Z
---

## Genel Bakış
VentHub HVAC yönetim platformunda kategori verilerinin merkezi erişim noktasını oluşturan servis modülüdür. Uygulamanın çeşitli bileşenlerine (filtreleme ekranları, navigasyon menüleri, raporlama araçları vb.) kategori listesini tek bir tutarlı API üzerinden sunarak veri tekilliğini ve erişim standardizasyonunu sağlar. TypeScript ile yazılmış asenkron yapısı, veri çekme sürecinin ana uygulama akışını engellemeden güvenli bir şekilde gerçekleştirilmesini garanti eder.

## Fonksiyon Grupları

### Kategori Listesi Sağlama
Sistemde tanımlı tüm kategorilerin dışarıya sunulmasını sağlayan tek işlevsel birimdir. Bu grup, modülün tek ve temel sorumluluğunu — tutarlı, güncel kategori verisi sağlamak — yerine getirir.
- getCategories

---



---

## FONKSİYON DETAYLARI

### getCategories

**Ne yapar**: Veritabanından yalnızca aktif olan tüm kategorileri çekerek, UI katmanında kullanılabilecek şekilde dönüştürülmüş bir kategori listesi döndürür. Kategoriler hiyerarşik yapıyı temsil eden `level` ve alfabetik sıralama için `name` alanlarına göre sıralanır.

**Nasıl yapar**: Supabase istemcisi aracılığıyla `categories` tablosuna sorgu gönderir. Sorguda `is_active` alanı `true` olan kayıtlar filtrelenir, ardından sonuçlar önce `level` (artan), sonra `name` (artan) alanlarına göre sıralanır. Ham veritabanı satırları `toUICategoryList` yardımcı fonksiyonu kullanılarak UI katmanına uygun `Category[]` tipine dönüştürülür. Sorgu sırasında bir hata oluşursa bu hata fırlatılarak çağrıya propagate edilir.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `Promise<Category[]>` — Aktif kategorilerin UI formatında dönüştürülmüş listesini döndürür. Her bir `Category` nesnesi; `id`, `parent_id`, `name`, `slug`, `image_url`, `level`, `is_active`, `metadata`, `created_at`, `updated_at`, `menu_label`, `marketing_title`, `translation_key`, `description`, `authority_content`, `display_mode`, `is_featured`, `seo_desc`, `seo_title` ve `sort_order` alanlarını içerir. Supabase sorgusu boş bir sonuç döndürdüğünde boş bir dizi ile sonuçlanır. Veritabanı hatası durumunda bir istisna fırlatılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/category.service.ts::getCategories
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase'den dönen kategori satırları (DbCategory[] veya null); `toUICategoryList` ile UI formatına dönüştürülür
  - `error` — Supabase sorgusu sırasında oluşabilecek hata nesnesi; truthy ise `throw` ile fırlatılır
- **Dönüş**: `Promise<Category[]>` — `toUICategoryList` tarafından DbCategory[] -> Category[] formatına dönüştürülmüş, sadece aktif (`is_active=true`) kategorilerin seviyeye (`level`) ve ada (`name`) göre sıralanmış listesi

---

## NODE ID STANDARD

  file: src\lib\services\category.service.ts
  function: src\lib\services\category.service.ts::getCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategories