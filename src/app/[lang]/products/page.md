---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\products\page.tsx
skeleton_hash: 10116529f29d415c
entity_hashes:
  func:Page: c96e4d8c93f660fc
  func:getCachedProducts: 13bd3816d5356001
  overview: 14adfddc5d7160bf
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-06-06T21:54:02Z
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

Bu modül, bir Next.js dil bazlı dinamik ürün listesi sayfasıdır. Aşağıdaki varsayımlar fonksiyon imzalarından türetilmiştir.

**[Aksiyom 1]:** Eğer `getCachedProducts` çağrısında geçerli bir `tenantId` değeri yoksa, ürün verileri doğru tenant bağlamında alınamaz ve yanlış veya boş sonuç döner.

**[Aksiyom 2]:** Eğer `lang` parametresi (hem `getCachedProducts` hem `Page` için) sağlanmamışsa veya geçerli bir dil kodu içermiyorsa, dil-bazlı ürün verisi Retrieved edilemez ve sayfa varsayılan/boş dil içerikli render edilir.

**[Aksiyom 3]:** Eğer `params` Promise'i `Page` bileşeni içinde `await` edilmeden kullanılırsa, `lang` parametresi erişilemez olur ve sayfa oluşturulamaz (Next.js 15+ async params davranışı).

**[Aksiyom 4]:** Eğer `getCachedProducts` fonksiyonu için önbellek (cache) mekanizması çalışmıyorsa veya önbellek anahtarı geçersizse, her istekte kaynak veri kaynağına doğrudan istek atılır ve performans düşer.

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
- **ic_degiskenler**: (yok — parametreler doğrudan kullanılır)
- **Parametre Kullanımları**:
  - `lang` — önbellek anahtar listesine (`['products-discovery', lang, tenantId]`) ve tag追加ına (`products-discovery-${tenantId}`) dahil edilir
  - `tenantId` — önbellek anahtar listesine ve tag追加ına dahil edilir; tag olarak `` `products-discovery-${tenantId}` `` oluşturulur
- **Çağrılar**:
  - `unstable_cache(async () => getProductsEnriched({ limit: 100 }), [...], {...})` — Next.js unstable_cache ile 100 ürünlü sorguyu önbelleğe alır
  - `getProductsEnriched({ limit: 100 })` — servis katmanından zenginleştirilmiş ürün listesini çeker
  - `unstable_cache(...)( ... )()` — dönen cache fonksiyonu hemen invok edilir
- **Dönüş**: `DomainProduct[]` (getProductsEnriched sonucu)

---

### [N2_NASIL] AST Pointer: `[lang]/products/page.tsx`::Page
- **params**: `{ params: Promise<{ lang: string }> }` — Next.js 15+ async params
- **ic_degiskenler**:
  - `lang` — `await params` destructuring'inden elde edilen dil kodu; `getCachedProducts` çağrısına argüman olarak verilir
  - `tenantConfig` — `await getTenantConfig()` ile alınan kiracı yapılandırma nesnesi; `id` alanı ve `TenantProvider`'a value olarak kullanılır
  - `tenantId` — `tenantConfig.id` erişiminden elde edilen kiracı tanımlayıcısı; `getCachedProducts` çağrısına argüman olarak verilir
  - `products` — `DomainProduct[]` türünde, `getCachedProducts(lang, tenantId)` çağrısının sonucu; `CategoryMasterView` bileşenine `initialProducts` prop'u olarak iletilir
- **Çağrılar**:
  - `await params` — async parametre çözümleme
  - `getTenantConfig()` — sunucu tarafında kiracı yapılandırmasını getirir
  - `getCachedProducts(lang, tenantId)` — önbellekli ürün listesini çeker
- **JSX Yapısı**:
  - `React.Suspense` — fallback olarak "Yükleniyor..." spinner'ı sunar
  - `TenantProvider` — `tenantConfig` değerini `value` prop'u ile alt bileşenlere sağlar
  - `CategoryMasterView` — `initialCategory={null}` (Discovery modu), `initialProducts={products}` prop'ları ile render edilir
- **Dönüş**: JSX (React bileşen ağacı) — sayfa HTML çıktısı

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