---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\products\page.tsx
skeleton_hash: c0c8d0ef408bbbda
entity_hashes:
  func:Page: 8980e2eb29ae94ff
  func:getCachedProducts: 9f2e775a760594c5
  overview: 303b6aac33c1708d
  style_tokens: e37a0cb8a67ff36f
generated_at: 2026-05-28T22:34:48Z
---

## Genel Bakış
`src/app/[lang]/products/page.tsx` modülü, çoklu dil destekli ürün listesi sayfasının sunucu tarafı işlevselliğini yönetir. Modül, dil bazlı önbellekli ürün verisi sağlama veDiscovery modunda çalışan ana sayfa bileşenini oluşturma sorumluluklarını birleştirir.

## Fonksiyon Grupları
### Veri Yönetimi ve Önbellekleme
Bu grup, dil parametresine göre ürün verilerini çekip önbelleğe almaktan ve sayfa için başlangıç veri setini sağlamaktan sorumludur. Performans için veri erişimini optimize eder.
- getCachedProducts

### Sayfa Oluşturma ve Render
Bu grup, dil parametresini alıp işleyerek sayfanın React bileşen ağacını oluşturur ve tarayıcıya sunulacak çıktıyı üretir. Tüm bileşenleri Discovery modunda başlangıç konfigürasyonuyla birleştirir.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modülün doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir:

[Aksiyom 1]: Eğer `getCachedProducts` çağrısında `lang` parametresi sağlanmazsa, fonksiyon doğru çalışamaz (parametre zorunludur, default değer tanımlanmamıştır).

[Aksiyom 2]: Eğer `Page` bileşenine `params` argumanı olarak Promise<{ lang: string }> yapısı geçilmezse, sayfa oluşturulamaz.

[Aksiyom 3]: Eğer `params` içindeki `lang` alanı sağlanmazsa (Promise çözümlendikten sonra), dil belirsiz kalır ve modülün dil-bağımlı işlemleri bilinmiyor duruma düşer.

[Aksiyom 4]: Eğer `params` bir Promise olarak çözümlenmeden önce erişilmeye çalışılırsa (await edilmeden), `lang` değeri alınamaz.

---

## FONKSİYON DETAYLARI

### getCachedProducts
**Ne yapar**: Belirli bir dil için ürün listesini önbellekten getirir. Ürün verilerinin sunucu tarafında cached olarak çekilmesini sağlayarak istemciye hızlı bir deneyim sunar.

**Nasıl yapar**: Fonksiyon bir `lang` parametresi alır ve ilgili dil için `DomainProduct[]` tipinde bir ürün dizisi döndürür. Next.js'in cache mekanizmasını kullanarak aynı dil için yapılan tekrarlı isteklerde veritabanına veya API'ye tekrar gitmeden önbellekten veri servis eder. Bu sayede sayfa yenilemelerinde ve navigasyonlarda performans artışı sağlanır.

**Parametreler**:
- `lang`: string — Ürünlerin hangi dilde getirileceğini belirten dil kodu parametresidir (örn: 'tr', 'en')

**Dönüş**: `DomainProduct[]` — Verilen dile ait ürün nesnelerinden oluşan bir dizi. Her bir DomainProduct nesnesi ürünün detaylı bilgilerini içerir.

### Page
**Ne yapar**: `/products` sayfasının ana bileşenini tanımlar. Kullanıcıya Global Discovery giriş noktası sunar; kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçer.
**Nasıl yapar**: Merkezi `CategoryMasterView` bileşenini omurga olarak kullanır. Sayfa yüklendiğinde herhangi bir kategori parametresi almadığından, alt bileşenler Discovery modunda çalışacak şekilde yapılandırılır.
**Parametreler**: Yok. Fonksiyon hiçbir argüman almaz (props veya state destructuring yapılmaz).
**Dönüş**: JSX çıktısı (render edilmiş React bileşeni). Dokümantasyonda kesin dönüş tipi belirtilmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/products/page.tsx::getCachedProducts
- **params**: `(lang: string)` — dil kodu, cache key'inde ve tag'lerinde kullanılır
- **ic_degiskenler**: (yok — tüm değerler inline ifadelerde hesaplanır)
- **Dönüş**: `Promise<DomainProduct[]>` — `unstable_cache` ile sarılmış `getProductsEnriched` çağrısının sonucu; `limit: 100` ile zenginleştirilmiş ürün listesi döner
- **Notlar**:
  - `unstable_cache(async () => getProductsEnriched({ limit: 100 }), ['products-discovery', lang], { tags: ['products-discovery', \`products-discovery-${lang}\`], revalidate: false })()` — cachelenmiş fonksiyon oluşturulup hemen invocation `()` ile çağrılır
  - Cache key: `['products-discovery', lang]`
  - Cache tag'leri: `'products-discovery'` ve `` `products-discovery-${lang}` ``
  - `revalidate: false` — stale-while-revalidate yok, sadece manuel purge ile yenilenir

### [N2_NASIL] AST Pointer: src/app/[lang]/products/page.tsx::Page
- **params**: `{ params }: { params: Promise<{ lang: string }> }` — Next.js 15+ async params, `{ lang: string }` promise olarak gelir
- **ic_degiskenler**:
  - `lang` — `await params` ile açılan dil kodu string'i, `getCachedProducts` çağrısına argument olarak verilir
  - `products` — `DomainProduct[]` tipinde, `getCachedProducts(lang)` çağrısından dönen zenginleştirilmiş ürün dizisi, `CategoryMasterView` componentine `initialProducts` prop'u olarak iletilir
- **Dönüş**: JSX — `<React.Suspense>` sarmalı içinde `<CategoryMasterView initialCategory={null} initialProducts={products} />` render edilir
- **Notlar**:
  - `initialCategory={null}` — MasterView bunu "Discovery" modu olarak işler
  - `React.Suspense` fallback'i: `<div className="container mx-auto py-12 px-4 text-center text-slate-500">Yükleniyor...</div>`

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