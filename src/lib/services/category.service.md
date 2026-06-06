---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\category.service.ts
skeleton_hash: 2173865ffb5588c1
entity_hashes:
  func:getCategories: 18fd7379721b8cc8
  overview: a755f289ed542fff
generated_at: 2026-06-06T21:55:39Z
---

## Genel Bakış
VentHub HVAC yönetim platformunda kategori verilerinin merkezi erişim noktasını oluşturan servis modülüdür. Uygulamanın çeşitli bileşenlerine (filtreleme ekranları, navigasyon menüleri, raporlama araçları vb.) kategori listesini tek bir tutarlı API üzerinden sunarak veri tekilliğini ve erişim standardizasyonunu sağlar. TypeScript ile yazılmış asenkron yapısı, veri çekme sürecinin ana uygulama akışını engellemeden güvenli bir şekilde gerçekleştirilmesini garanti eder.

## Fonksiyon Grupları
### Kategori Listesi Sağlama
Sistemde tanımlı tüm kategorilerin dışarıya sunulmasını sağlayan tek işlevsel birimdir. Bu grup, modülün tek ve temel sorumluluğunu — tutarlı, güncel kategori verisi sağlamak — yerine getirir.
- getCategories

---

## AXIOMS – Mimari Varsayımlar

Bu modül, supabase istemcisine bağımlı bir kategori listeleme servisidir.

[Aksiyom 1]: Eğer `supabase` parametresi geçerli bir veritabanı istemcisi değilse, `getCategories` fonksiyonu kategori verisini無法 çekemez ve hata/fail sonucu oluşur.

[Aksiyom 2]: Eğer `defaultClient` sabiti tanımlı bir supabase istemcisi içermiyorsa, varsayılan istemci mekanizması çalışamaz ve fonksiyon alternatif bir istemci kaynağı bulamazsa başarısız olur.

[Aksiyom 3]: Eğer supabase bağlantısı kesilirse veya veritabanına erişim engellenirse, `getCategories` sonucu boş/null olur veya istisna fırlatır.

---

## FONKSİYON DETAYLARI

### getCategories

**Ne yapar**: Veritabanındaki tüm aktif kategorileri getirir. Supabase istemcisi aracılığıyla `categories` tablosuna sorgu yapar ve yalnızca `is_active` değeri `true` olan kayıtları çekerek UI katmanında kullanılabilecek formata dönüştürülmüş bir Category listesi döndürür. Fonksiyon, kategorileri seviye (`level`) ve isim (`name`) sırasına göre sıralanmış şekilde teslim eder.

**Nasıl yapar**: Fonksiyon önce varsayılan Supabase istemcisini (`defaultClient`) kullanarak `categories` tablosuna bir SELECT sorgusu gönderir. Sorguda `id`, `parent_id`, `name`, `slug`, `image_url`, `level`, `is_active`, `metadata`, `created_at`, `updated_at`, `menu_label`, `marketing_title`, `translation_key`, `description`, `authority_content`, `display_mode`, `is_featured`, `seo_desc`, `seo_title`, `sort_order` alanları açıkça listelenir. Ardından `.eq('is_active', true)` filtresi uygulanarak sadece aktif kategoriler filtrelenir. Sonuçlar önce `level` alanına göre artan, sonra `name` alanına göre artan şekilde sıralanır. Sorgu sonucunda hata oluşursa `throw error` ile fırlatılır, aksi takdirde ham veri `toUICategoryList` fonksiyonuyla UI katmanına uygun `Category[]` formatına dönüştürülerek döndürülür.

**Parametreler**:
- `supabase`: `SupabaseClient` (varsayılan: `defaultClient`) — Supabase veritabanı bağlantısını sağlayan istemci nesnesi. Opsiyonel olarak geçirilebilir; belirtilmezse modül seviyesinde tanımlı `defaultClient` kullanılır.

**Dönüş**: `Promise<Category[]>` — Aktif kategorilerin UI formatına dönüştürülmüş listesi. Her `Category` nesnesi `id`, `parent_id`, `name`, `slug`, `image_url`, `level`, `is_active`, `metadata`, `created_at`, `updated_at`, `menu_label`, `marketing_title`, `translation_key`, `description`, `authority_content`, `display_mode`, `is_featured`, `seo_desc`, `seo_title`, `sort_order` alanlarını içerir. Liste, üst seviyeden alt seviyeye ve alfabetik sıraya göre dizilmiştir.

---

## SABİTLER
- **defaultClient** (ternary_expression) — `typeof window !== 'undefined' ? supabaseBrowserClient : supabaseStaticClient`

---

## NODE ID STANDARD

  file: src\lib\services\category.service.ts
  function: src\lib\services\category.service.ts::getCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategories