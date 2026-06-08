---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\products\page.tsx
skeleton_hash: 25247ca60bdf661a
entity_hashes:
  func:Page: 92a39fc420a9c185
  func:getCachedProducts: 13bd3816d5356001
  overview: 21dc1b0e4ca1a720
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-06-08T10:08:11Z
---

## Genel Bakış

Bu modül, Next.js uygulamasında dil bazlı dinamik bir ürün listesi sayfasını sunucu tarafında yönetir. Temel işlevi, istenen dile göre önbellekten ürün verileri çekerek sayfanın HTML çıktısını oluşturmaktır.

## Fonksiyon Grupları

### Dil-Bazlı Veri Sağlama
Belirli bir dil parametresine karşılık gelen ürün verilerini sunucu tarafında önbellekten almak ve performans sağlamakla sorumludur.
- getCachedProducts

### Sayfa Oluşturma ve Bileşen Birleştirme
İsteği işleyerek dil parametresini çıkarır, gerekli verileri getirir ve sayfanın tüm React bileşenlerini birleştirip son HTML çıktısını üretir.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js dil bazlı ürün listesi sayfasını sunucu tarafında yönetmek üzere tasarlanmıştır. Aşağıdaki mimari varsayımlar fonksiyon imzalarından türetilmiştir.

**[Aksiyom 1]:** Eğer `getCachedProducts` çağrısında `lang` parametresi sağlanmazsa, ürün verileri ilgili dil için önbellekten retrieve edilemez ve çağrı başarısız olur.

**[Aksiyom 2]:** Eğer `getCachedProducts` çağrısında `tenantId` parametresi sağlanmazsa, hangi kiracıya (tenant) ait ürünlerin getirileceği belirsizleşir ve çağrı başarısız olur.

**[Aksiyom 3]:** Eğer `Page` bileşeninin `params` argümanı bir `Promise<{ lang: string }>` olarak resolve olmazsa, sayfa hangi dilde render edileceğini bilemez ve HTML çıktısı oluşturulamaz.

**[Aksiyom 4]:** Eğer `Page` bileşeninin `params` Promise'i içindeki `lang` alanı eksik veya `string` tipinde değilse, dil parametresi `getCachedProducts` fonksiyonuna geçersiz aktarılır ve sayfa hatalı çalışır.

**[Aksiyom 5]:** Eğer `getCachedProducts` fonksiyonuna geçerli `lang` ve `tenantId` değerleri sağlanmazsa, sayfa oluşturma sürecinde ürün verisi bulunamaz ve bileşen birleştirme (component composition) aşamasında veri eksikliği oluşur.

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

**Ne yapar**: /products rotasının ana sayfa bileşenidir. Tenant yapılandırmasını, önbellekten ürünleri ve dil sözlüğünü yükleyerek CategoryMasterView bileşenini render eder. Kategori seçilmediği için sistem otomatik olarak "Discovery" modunda açılır.

**Nasıl yapar**: Fonksiyon asenktron çalışır. Önce params içinden lang değerini çıkarır, ardından getTenantConfig() ile tenant yapılandırmasını, getCachedProducts() ile önbellekten ürün listesini çeker. Dil seçimine göre sözlük (dict) nesnesini belirler. Son olarak TenantProvider sarmalayıcısı içinde initialCategory null olarak CategoryMasterView bileşenini Suspense ile sarmalayarak render eder.

**Parametreler**:
- `params`: `Promise<{ lang: string }>` — URL parametrelerini içeren asenktron nesne. Resolve edildiğinde lang (dil kodu) değerini döndürür.

**Dönüş**: `React.JSX.Element` — CategoryMasterView bileşenini içeren Suspense sarmalı JSX yapısı döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `[lang]/products/page.tsx`::getCachedProducts
- **params**: `(lang: string, tenantId: string)`
- **ic_degiskenler**: (govde tek bir ifade — explicit değişken yok)
  - `unstable_cache`'e verilen **cache key**: `['products-discovery', lang, tenantId]` — cache lookup'ta kullanılan benzersiz anahtar
  - `unstable_cache`'e verilen **options.tags**: `['products-discovery', `products-discovery-${tenantId}`]` — revalidation/purge için tag dizisi
  - `unstable_cache`'e verilen **options.revalidate**: `false` — cache'in otomatik yenilenmemesi gerektiğini belirtir
  - `getProductsEnriched(supabaseStaticClient, { limit: 100 })` — asıl veri sağlayan servis çağrısı, supabaseStaticClient üzerinden max 100 ürün döner
- **Dönüş**: `getProductsEnriched`'in DomainProduct[] sonucu (unstable_cache ile sarılmış)

### [N2_NASIL] AST Pointer: `[lang]/products/page.tsx`::Page
- **params**: `{ params: Promise<{ lang: string }> }`
- **ic_degiskenler**:
  - `lang` — `await params`'dan destructured dil kodu (`"en"` veya `"tr"`), sözlük seçimi ve cache key için kullanılır
  - `tenantConfig` — `await getTenantConfig()` çağrısının sonucu; kiracı yapılandırma nesnesi, `id` ve `TenantProvider`'a verilen value olarak kullanılır
  - `tenantId` — `tenantConfig.id`'den çıkarılan kiracı tanımlayıcısı stringi, `getCachedProducts` çağrısına ve cache tag'ine parametre olarak verilir
  - `products` — `DomainProduct[]` türünde, `await getCachedProducts(lang, tenantId)` ile getirilen zenginleştirilmiş ürün listesi, `CategoryMasterView`'a `initialProducts` olarak aktarılır
  - `dict` — `lang === 'en' ? en : tr` koşuluyla seçilen sözlük nesnesi; JSX içinde `dict.common.loading` erişimi ile loading fallback metni sağlanır
- **Dönüş**: JSX — `<React.Suspense>` içeren `CategoryMasterView` bileşeni (`initialCategory={null}`, `initialProducts={products}`) ile `TenantProvider` sarmalı

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