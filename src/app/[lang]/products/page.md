---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\products\page.tsx
skeleton_hash: 27c4d552fa855011
entity_hashes:
  func:Page: c96e4d8c93f660fc
  func:getCachedProducts: 13bd3816d5356001
  overview: 9e731c9de7837ec1
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-06-07T12:01:19Z
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

### [N1_NASIL] AST Pointer: src/app/[lang]/products/page.tsx::getCachedProducts
- **params**: `(lang: string, tenantId: string)`
- **ic_degiskenler**:
  - *(fonksiyon gövdesinde tanımlı yerel değişken yok — tüm değerler doğrudan ifade içinde kullanılır)*
- **İfade-içi kullanım**:
  - `unstable_cache(...)` — cache sarmalayıcı çağrısı
  - `getProductsEnriched(supabaseStaticClient, { limit: 100 })` — asenkron ürün getirme çağrısı; `supabaseStaticClient` statik supabase istemcisi, `{ limit: 100 }` sorgu filtresi
  - `['products-discovery', lang, tenantId]` — cache key dizisi; `lang` ve `tenantId` parametreleri burada kullanılır
  - `tags: ['products-discovery', \`products-discovery-${tenantId}\`]` — cache etiketleri; template literal içinde `tenantId` kullanılır
  - `revalidate: false` — cache süresiz sabit demektir
  - `()` — cache sonucu hemen invoke edilir (immediate invocation)
- **Dönüş**: `DomainProduct[]` (getProductsEnriched sonucu, cache sarmalayıcısı üzerinden)

---

### [N2_NASIL] AST Pointer: src/app/[lang]/products/page.tsx::Page
- **params**: `{ params }: { params: Promise<{ lang: string }> }`
- **ic_degiskenler**:
  - `lang` — URL'den gelen dil kodu; `await params` ile destructured
  - `tenantConfig` — tenant yapılandırma nesnesi; `getTenantConfig()` çağrısının dönüşü
  - `tenantId` — tenant tanımlayıcısı; `tenantConfig.id` erişimi ile elde edilir
  - `products: DomainProduct[]` — zenginleştirilmiş ürün listesi; `getCachedProducts(lang, tenantId)` çağrısının dönüşü
- **JSX içindeki kullanım**:
  - `params` — `await params` ile çözümlenir (Promise<{ lang: string }>)
  - `tenantConfig` — `getTenantConfig()` sonucu; `TenantProvider` component'ine `value` olarak verilir
  - `tenantId` — `tenantConfig.id` erişimi; `getCachedProducts`'a argüman olarak iletilir
  - `products` — `getCachedProducts` sonucu; `CategoryMasterView` component'ine `initialProducts` prop'u olarak verilir
  - `null` — `initialCategory` prop'u; MasterView'ın bunu Discovery olarak işleyeceği belirtilmiş
- **Dönüş**: JSX (`React.Suspense` > `TenantProvider` > `CategoryMasterView` sarmalaması)

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