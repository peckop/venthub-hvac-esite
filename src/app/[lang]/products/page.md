---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\products\page.tsx
skeleton_hash: e541aa272b442b08
entity_hashes:
  func:Page: c96e4d8c93f660fc
  func:getCachedProducts: 13bd3816d5356001
  overview: a4d00c564c02f39c
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-05-30T20:23:29Z
---

## Genel Bakış
Bu modül, Next.js uygulamasında dil bazlı dinamik bir ürün listesi sayfasını sunucu tarafında yönetir. Temel işlevi, istenen dile göre önbellekten ürün verileri çekmek ve bu verileri kullanarak sayfanın HTML çıktısını oluşturmaktır.

## Fonksiyon Grupları
### Dil-Bazlı Veri Sağlama
Bu grup, belirli bir dil parametresine karşılık gelen ürün verilerini almak ve sunucu tarafında performans için önbellekten sunmakla sorumludur.
- getCachedProducts

### Sayfa Oluşturma ve Bileşen Birleştirme
Bu grup, isteği işleyerek dil parametresini çıkarır, gerekli verileri getirir ve sayfanın tüm React bileşenlerini birleştirip son HTML çıktısını üretir.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modülün doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `getCachedProducts` fonksiyonuna geçerli bir `tenantId` parametresi sağlanmazsa, ilgili kiracıya ait ürün verisi alınamaz ve sayfa hatalı veya eksik veri ile render edilir.

[Aksiyom 2]: Eğer `getCachedProducts` fonksiyonu çağrıldığında `lang` parametresi geçerli bir dil kodu içermiyorsa, önbellek anahtarı tutarsız olur ve yanlış dilde ürün verisi döndürülebilir veya önbellek_isi bozulur.

[Aksiyom 3]: Eğer `Page` bileşeninde `params.lang` Promise'i çözülmezse veya geçersiz bir değer içerirse, sayfa doğru dilde oluşturulamaz ve istemci tarafı bir hata oluşur.

[Aksiyom 4]: Eğer `getCachedProducts` fonksiyonunda kullanılan önbellek mekanizması (örn: `unstable_cache`) doğru yapılandırılmamışsa veya erişilebilir değilse, her istek veri kaynağına doğrudan gider ve performans önemli ölçüde düşer.

---

## FONKSİYON DETAYLARI

### getCachedProducts
**Ne yapar**: Belirtilen dil ve kiracı ID'si için önbelleğe alınmış ürünleri getirir.
**Nasıl yapar**: Fonksiyon, verilen `lang` ve `tenantId` parametrelerini kullanarak önbellekteki ürünleri alır. İç mantığı tam olarak bilinmiyor ancak adından da anlaşılacağı üzere bir önbellekleme mekanizması kullanarak ürün verilerini hızlıca erişilebilir hale getirir.
**Parametreler**:
- lang: string — Ürünlerin getirileceği dil kodu.
- tenantId: string — Kiracının benzersiz tanımlayıcısı.
**Dönüş**: Bilinmiyor. Fonksiyonun return tipi açıkça belirtilmemiş.

### Page
**Ne yapar**: `/products` rotasındaki sayfa bileşenidir ve Global Discovery giriş noktası olarak görev yapar. Kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçer.
**Nasıl yapar**: Async bir React sayfa bileşenidir. İlk olarak `params` içindeki `lang` parametresini `await` ile çözer. Ardından `getTenantConfig()` ile kiracı yapılandırmasını alır ve `tenantId`'yi çıkarır. `getCachedProducts` fonksiyonunu kullanarak belirtilen dil ve kiracı ID'si için ürünleri getirir. Son olarak `React.Suspense` ile sarılmış bir `CategoryMasterView` bileşeni döner. `initialCategory` `null` olarak ayarlandığı için `MasterView` bu durumu Discovery olarak işler. Ayrıca `TenantProvider` ile kiracı yapılandırmasını alt bileşenlere sağlar.
**Parametreler**:
- params: Promise<{ lang: string }> — Sayfa parametreleri, içinde `lang` dizisi bulunan bir Promise.
**Dönüş**: JSX Elemanı. Sayfa bileşeni, `CategoryMasterView`'ı içeren bir React bileşeni döner.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `[lang]/products/page.tsx`::getCachedProducts
- **params**: `lang: string`, `tenantId: string`
- **ic_degiskenler**:
  - Fonksiyon gövdesi tek bir zincirli çağrıdır, ayrı iç değişken yoktur
  - `unstable_cache(...)` — Next.js'in cache mekanizmasını oluşturur; bir cache factory döner ve hemen çağrılır `()`
  - **Cache key**: `['products-discovery', lang, tenantId]` — lang ve tenantId parametreleri cache key bileşeni olarak kullanılır
  - **Cache options**: `{ tags: ['products-discovery', \`products-discovery-${tenantId}\`], revalidate: false }` — tag tabanlı invalidation için tenantId'li tag eklenir, revalidation kapatılmıştır
  - `getProductsEnriched({ limit: 100 })` — cache içindeki async callable; Supabase'den en fazla 100 ürün getirir
- **Dönüş**: `Promise<DomainProduct[]>` (getProductsEnriched'in dönüş değeri, cachelenmiş)

---

### [N2_NASIL] AST Pointer: `[lang]/products/page.tsx`::Page
- **params**: `{ params: Promise<{ lang: string }> }` — Next.js App Router params prop'u (Promise olarak resolve edilir)
- **ic_degiskenler**:
  - `lang` — `await params` ile çözümlenmiş dil kodu (ör. "en", "tr"); getCachedProducts çağrısına传递 edilir
  - `tenantConfig` — `await getTenantConfig()` ile elde edilen tenant yapılandırma nesnesi; `.id` alanı tenantId olarak kullanılır, ayrıca `TenantProvider`'a value olarak verilir
  - `tenantId` — `tenantConfig.id`'den türetilen tenant tanımlayıcısı; getCachedProducts çağrısına传递 edilir
  - `products: DomainProduct[]` — `await getCachedProducts(lang, tenantId)` çağrısıyla elde edilen enriched ürün listesi; `CategoryMasterView`'a `initialProducts` prop'u olarak verilir
- **Dönüş**: JSX (React.Suspense > TenantProvider > CategoryMasterView) — `initialCategory={null}` ve `initialProducts={products}` ile render edilen sayfa. `initialCategory` null olduğu için MasterView bunu Discovery modu olarak işleyecektir.

---

## NODE ID STANDARD

  file: src\app\[lang]\products\page.tsx
  function: src\app\[lang]\products\page.tsx::getCachedProducts
  function: src\app\[lang]\products\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page
  export: getCachedProducts

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-500`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `container`, `mx-auto`, `px-4`, `py-12`