---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\services\category.service.ts
skeleton_hash: 5d85c4595663b3c1
entity_hashes:
  func:getCategories: 8f639a551cb88029
  overview: 094095f1defe0e5b
generated_at: 2026-08-27T06:59:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetim platformunda kategori verilerine erişim için merkezi bir servis sağlar. Tek sorumluluğu, veritabanından güncel ve tutarlı kategori listesini çekerek uygulamanın farklı bölümlerine sunmaktır.

## Fonksiyon Grupları
### Kategori Listeleme
Uygulamadaki filtreleme menüleri, navigasyon ve raporlama araçları gibi bileşenler için gerekli olan tüm aktif kategorileri tek bir fonksiyon aracılığıyla sunar.
- getCategories

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyomlar, yalnızca fonksiyon imzasından çıkarılabilen koşullara dayanır.

---

## FONKSİYON DETAYLARI

### getCategories
**Ne yapar**: Supabase veritabanındaki `categories` tablosundan yalnızca aktif (`is_active` değeri `true` olan) kategorileri çeker ve UI katmanında kullanılmak üzere `Category[]` tipine dönüştürerek döndürür. Kategorileri önce seviye (`level`) ardından isim (`name`) sırasına göre sıralı biçimde getirir.

**Nasıl yapar**: Fonksiyon, parametre olarak aldığı `supabase` istemcisi üzerinden `categories` tablosuna bir sorgu gönderir. Sorguda belirli alanlar (`id`, `parent_id`, `name`, `slug`, `image_url`, `level`, `is_active`, `metadata`, `created_at`, `updated_at`, `menu_label`, `marketing_title`, `translation_key`, `description`, `authority_content`, `display_mode`, `is_featured`, `seo_desc`, `seo_title`, `sort_order`) seçilir. `.eq('is_active', true)` filtresiyle yalnızca aktif kayıtlar getirilir. `.order('level', { ascending: true })` ile önce seviyeye göre artan, ardından `.order('name', { ascending: true })` ile isme göre artan sıralama uygulanır. Sorgu sonucunda bir hata oluşursa bu hata fırlatılır (`throw error`). Hata yoksa, gelen veri önce `DbCategory[]` tipine cast edilir ve ardından `toUICategoryList` yardımcı fonksiyonu aracılığıyla UI katmanının beklediği `Category[]` biçimine dönüştürülerek döndürülür. Veri `null` veya `undefined` ise boş dizi (`[]`) kullanılır.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Supabase veritabanı istemcisi örneği. `Database` genel tip parametresi, veritabanı şemasının TypeScript tip tanımlarını belirtir. Fonksiyon bu istemci üzerinden tablo sorgularını yürütür.

**Dönüş**: `Promise<Category[]>` — Asenkron bir yapıda, aktif kategorilerin UI katmanında kullanılan `Category` tipinde bir dizi olarak çözümlenen Promise döner. Her bir `Category` nesnesi, veritabanından çekilen ham verinin `toUICategoryList` fonksiyonu aracılığıyla dönüştürülmüş halidir.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: ../../types/db-rows::type { DbCategory }
- import: ../../types/ui-models::type { Category }
- import: ../type-converters::toUICategoryList
- import: @supabase/supabase-js::type { SupabaseClient }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/category.service.ts::getCategories
- **params**:
  - `supabase` — `SupabaseClient<Database>` tipinde, Supabase veritabanı istemcisi
- **ic_degiskenler**:
  - `data` — `supabase.from('categories').select(...).eq(...).order(...).order(...)` sorgusundan dönen satırlar; destructuring ile elde edilir; hata yoksa `toUICategoryList` fonksiyonuna aktarılır
  - `error` — aynı sorgudan dönen hata nesnesi; truthy ise `throw error` ile fırlatılır
- **Dönüş**: `Promise<Category[]>` — `toUICategoryList` fonksiyonuna `(data as DbCategory[]) || []` argümanı verilerek üretilen UI kategori listesi

---

## NODE ID STANDARD

  file: src\lib\services\category.service.ts
  function: src\lib\services\category.service.ts::getCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategories