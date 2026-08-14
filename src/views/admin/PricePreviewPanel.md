---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\PricePreviewPanel.tsx
skeleton_hash: 3a91ec75cdd0a005
entity_hashes:
  func:PricePreviewPanel: b4f46de0b63b53f0
  func:parseQty: ff99e0938af43376
  overview: a10b8ee64f63f73a
  style_tokens: 56dc4a15f9495626
generated_at: 2026-08-14T09:19:24Z
---

## Genel Bakış
Bu modül, admin arayüzünde fiyatlandırma süreçlerinin görsel olarak önizlenmesini sağlayan bir React bileşenidir. Kullanıcılara, fiyatlandırma kurallarının ve hesaplamaların dinamik bir panel üzerinde nasıl sonuçlanacağını göstererek karar destek mekanizması sunar.

## Fonksiyon Grupları
### Miktar Dönüştürme Yardımcıları
Bu grup, kullanıcıdan gelen ham metin tabanlı miktar değerlerini, fiyat hesaplamalarında kullanılacak tutarlı sayısal formata dönüştürmekten sorumludur.
- parseQty

### Ana Bileşen
Bu grup, modülün temel arayüzünü ve iş mantığını oluşturan, fiyatlandırma verilerini alıp kullanıcıya düzenli bir şekilde sunan ana React bileşenini kapsar.
- PricePreviewPanel

---

## AXIOMS – Mimari Varsayımlar

Bu modül, HVAC fiyat önizleme paneli sunan bir React bileşen modülüdür. Aşağıdaki mimari varsayımlar, yalnızca fonksiyon imzaları ve modül sabitlerinden çıkarılmıştır.

**[Aksiyom 1 – parseQty Girdi Biçimi]:** `parseQty` fonksiyonuna verilen `raw` parametrası, sayısal bir değere dönüştürülebilir bir dize (string) olmalıdır. Eğer `raw` geçerli bir sayısal temsili içermiyorsa, fonksiyonun dönüş değeri `NaN` (Not a Number) olur ve fiyat hesaplamaları bozulur.

**[Aksiyom 2 – SCOPE_KEYS Yapısı]:** `SCOPE_KEYS` nesnesi, bileşenin fiyat önizlemesini hangi kapsam (scope) boyutlarında göstereceğini belirleyen anahtarlar içermelidir. Eğer `SCOPE_KEYS` tanımlı veya boş bir nesne ise, bileşen geçerli bir kapsam gösteremez ve fiyat önizlemesi anlamsız veya eksik olur.

**[Aksiyom 3 – SEGMENT_LABEL_KEYS Yapısı]:** `SEGMENT_LABEL_KEYS` nesnesi, segment bazlı fiyat gösteriminde kullanılacak etiket (label) anahtarlarını tanımlamalıdır. Eğer `SEGMENT_LABEL_KEYS` tanımsız veya uygun yapıda değilse, segment etiketleri düzgün eşleştirilemez ve bileşen üzerinde hatalı veya boş etiketler görüntülenir.

**[Aksiyom 4 – PRODUCT_SELECT Sabiti]:** `PRODUCT_SELECT` dizgesi, bileşenin ürün seçim arayüzünde kullanacağı tanımlayıcı (identifier) değer olmalıdır. Eğer `PRODUCT_SELECT` boş dize veya tanımsız ise, ürün seçimi işlevi çalışmayabilir veya yanlış bir urun referansı kullanılabilir.

**[Aksiyom 5 – React Çalışma Ortamı]:** `PricePreviewPanel`, `React.FC` döndüren bir fonksiyon bileşendir. Eğer React render bağlamı (Provider/Context) mevcut değilse bileşen DOM'a bağlanamaz ve fiyat önizleme paneli görüntülenemez.

---

## FONKSİYON DETAYLARI

### parseQty
**Ne yapar**: Ham bir metin (string) değerini alır, içinden sayısal bir değer çıkarır ve geçerli bir pozitif tam sayı döndürür. Metin içeriği numerik olmadığında veya geçersiz olduğunda varsayılan olarak 1 değerini döndürür.

**Nasıl yapar**: Gelen raw parametresi üzerindeki tüm rakam olmayan karakterleri (`[^\d]` regex deseniyle) boşluk ile değiştirir, ardından `parseInt` fonksiyonu ile tam sayıya dönüştürür. Oluşan sayının `Number.isFinite()` ile sonlu (finite) olup olmadığını ve `0`'dan büyük olup olmadığını kontrol eder; her iki koşul da sağlanıyorsa bu sayıyı, aksi halde `1` değerini döndürür.

**Parametreler**:
- `raw`: string — Dönüştürülecek ham metin değeri. İçerisinde rakam ve rakam dışı karakterler barındırabilir.

**Dönüş**: number — İşlem sonucu elde edilen pozitif tam sayı. Geçerli bir sayı elde edilemediğinde veya sayı sıfırdan küçük/eşit olduğunda `1` döner.

### PricePreviewPanel
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AccessDenied::AccessDenied
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminSkeleton::AdminSkeleton
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/format::formatCurrency
- import: ../../i18n/format::formatNumber
- import: ../../lib/services/pricing.service::resolvePrice
- import: ../../lib/services/pricing.service::type PriceResolution
- import: ../../lib/services/pricingAdmin.service::loadBrandIdByName
- import: ../../lib/services/pricingAdmin.service::toPricingProductInput
- import: ../../lib/supabase/client::supabaseBrowserClient
- import: lucide-react::ExternalLink
- import: lucide-react::Loader2
- import: lucide-react::Percent
- import: lucide-react::Search
- import: lucide-react::X
- import: next/link::Link
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: next::type { Route }
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useRef
- import: react::useState

---

## INTERFACES

### ProductSearchRow
- `id: string`
- `name: string`
- `sku: string`
- `brand: string`
- `category_id: string | null`
- `purchase_price: number`
- `purchase_currency: string`
- `purchase_rate_to_base: number | null`
- `cost_in_base: number | null`

### PriceListOption
- `id: string`
- `name: string`
- `user_type: string | null`

---

## TYPE ALIASES

### ScopeKey
Fiyat önizleme paneli (W3-T3) — `resolvePrice` motorunu TEK ürün için TEK çağrıyla koşturup maliyet/sonuç/hesaplama izini gösterir. `/admin/pricing/rules` sayfasındaki "Önizle" linki `?productId=` ile buraya derin bağ atar; segment/ para birimi/adet de URL'e yazılır (sayfalar arası paylaşılabilir ba
```typescript
type ScopeKey = 'variant' | 'product' | 'brand' | 'category' | 'global'
```

---

## SABİTLER
- **SCOPE_KEYS** (object) — `{
  0: 'variant',
  1: 'product',
  2: 'brand',
  3: 'category',
  4: 'g...`
- **SEGMENT_LABEL_KEYS** (object) — `{
  individual: 'admin.pricing.common.segment.individual',
  dealer: 'admin...`
- **PRODUCT_SELECT** (str) — `'id,name,sku,brand,category_id,purchase_price,purchase_currency,purchase_rate...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: PricePreviewPanel.tsx::parseQty
- **params**: (raw: string)
- **ic_degiskenler**:
  - `n` — parsed integer value from raw string after removing non-digit characters
- **Dönüş**: number (parsed positive integer or 1 if invalid/zero)

### [N2_NASIL] AST Pointer: PricePreviewPanel.tsx::updateUrlParams
- **params**: ()
- **ic_degiskenler**:
  - `params` — URLSearchParams object constructed from current filter state
  - `qs` — serialized query string from params
- **Dönüş**: void (side effect: updates browser URL via router.replace)

### [N3_NASIL] AST Pointer: PricePreviewPanel.tsx::loadInitialData
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle (prevents state updates after unmount)
  - `lists` — price lists data from Supabase query
  - `listsErr` — error from price lists query
  - `settingsRow` — site settings data from Supabase query
  - `settingsErr` — error from site settings query
  - `settingsValue` — parsed settings object containing enabled currencies
  - `raw` — raw enabled currencies array from settings
  - `currencies` — validated string array of enabled currencies or fallback
  - `e` — caught error during async operation
- **Dönüş**: cleanup function (sets alive to false)

### [N4_NASIL] AST Pointer: PricePreviewPanel.tsx::reloadInitialData
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `lists` — price lists data from Supabase query
  - `listsErr` — error from price lists query
  - `settingsRow` — site settings data from Supabase query
  - `settingsErr` — error from site settings query
  - `settingsValue` — parsed settings object containing enabled currencies
  - `raw` — raw enabled currencies array from settings
  - `currencies` — validated string array of enabled currencies or fallback
  - `e` — caught error during async operation
- **Dönüş**: void (async function)

### [N5_NASIL] AST Pointer: PricePreviewPanel.tsx::resetAliveFlag
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N6_NASIL] AST Pointer: PricePreviewPanel.tsx::setDefaultSegment
- **params**: ()
- **ic_degiskenler**:
  - `individual` — found price list with user_type 'individual'
- **Dönüş**: void (side effect: sets segment state)

### [N7_NASIL] AST Pointer: PricePreviewPanel.tsx::setDefaultCurrency
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void (side effect: sets currency state)

### [N8_NASIL] AST Pointer: PricePreviewPanel.tsx::loadSelectedProduct
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `data` — product data from Supabase query
  - `error` — error from product query
  - `e` — caught error during async operation
- **Dönüş**: cleanup function (sets alive to false)

### [N9_NASIL] AST Pointer: PricePreviewPanel.tsx::fetchProductById
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `data` — product data from Supabase query
  - `error` — error from product query
- **Dönüş**: void (async function)

### [N10_NASIL] AST Pointer: PricePreviewPanel.tsx::cleanupProductLoad
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N11_NASIL] AST Pointer: PricePreviewPanel.tsx::searchProducts
- **params**: ()
- **ic_degiskenler**:
  - `needle` — trimmed search term
  - `alive` — flag for async operation lifecycle
  - `timer` — debounce timer ID
  - `pattern` — SQL LIKE pattern for product search
  - `data` — search results from Supabase query
  - `e` — caught error during async operation
- **Dönüş**: cleanup function (clears timer and sets alive to false)

### [N12_NASIL] AST Pointer: PricePreviewPanel.tsx::executeProductSearch
- **params**: ()
- **ic_degiskenler**:
  - `pattern` — SQL LIKE pattern for product search
  - `data` — search results from Supabase query
- **Dönüş**: void (async function)

### [N13_NASIL] AST Pointer: PricePreviewPanel.tsx::executeProductSearchInner
- **params**: ()
- **ic_degiskenler**:
  - `pattern` — SQL LIKE pattern for product search
  - `data` — search results from Supabase query
- **Dönüş**: void (async function)

### [N14_NASIL] AST Pointer: PricePreviewPanel.tsx::cleanupSearchTimer
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N15_NASIL] AST Pointer: PricePreviewPanel.tsx::pickProduct
- **params**: (p: ProductSearchRow)
- **ic_degiskenler**: (yok)
- **Dönüş**: void (side effect: sets selectedProduct, productId, clears term and results)

### [N16_NASIL] AST Pointer: PricePreviewPanel.tsx::clearProductSelection
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void (side effect: clears selectedProduct, productId, term, results)

### [N17_NASIL] AST Pointer: PricePreviewPanel.tsx::loadBrandMap
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `map` — brand ID mapping from loadBrandIdByName
  - `e` — caught error during async operation
- **Dönüş**: cleanup function (sets alive to false)

### [N18_NASIL] AST Pointer: PricePreviewPanel.tsx::fetchBrandMap
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `map` — brand ID mapping from loadBrandIdByName
  - `e` — caught error during async operation
- **Dönüş**: void (async function)

### [N19_NASIL] AST Pointer: PricePreviewPanel.tsx::cleanupBrandMapLoad
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N20_NASIL] AST Pointer: PricePreviewPanel.tsx::resolveProductPrice
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `input` — pricing product input converted from selected product
  - `result` — price resolution result from resolvePrice
  - `e` — caught error during async operation
- **Dönüş**: cleanup function (sets alive to false)

### [N21_NASIL] AST Pointer: PricePreviewPanel.tsx::executePriceResolution
- **params**: ()
- **ic_degiskenler**:
  - `alive` — flag for async operation lifecycle
  - `input` — pricing product input converted from selected product
  - `result` — price resolution result from resolvePrice
  - `e` — caught error during async operation
- **Dönüş**: void (async function)

### [N22_NASIL] AST Pointer: PricePreviewPanel.tsx::cleanupPriceResolution
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: void

### [N23_NASIL] AST Pointer: PricePreviewPanel.tsx::renderSearchResultItem
- **params**: (p: ProductSearchRow)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (product list item with name and SKU)

### [N24_NASIL] AST Pointer: PricePreviewPanel.tsx::renderSegmentOption
- **params**: (p: PriceList)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (option with translated user type label or name)

### [N25_NASIL] AST Pointer: PricePreviewPanel.tsx::renderCurrencyOption
- **params**: (c: string)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (option with currency code)

### [N26_NASIL] AST Pointer: PricePreviewPanel.tsx::renderResolutionLine
- **params**: (line: string, i: number)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX element (styled list item with line number and content)

---

## NODE ID STANDARD

  file: src\views\admin\PricePreviewPanel.tsx
  function: src\views\admin\PricePreviewPanel.tsx::parseQty
  function: src\views\admin\PricePreviewPanel.tsx::PricePreviewPanel

---

## DISA AKTARILANLAR (EXPORTS)
  export: PricePreviewPanel
  export: parseQty

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-500/10`, `bg-cyan-400/10`, `bg-cyan-400/5`, `bg-cyan-500/10`, `bg-rose-500/10`, `bg-white/3`, `border-amber-500/20`, `border-cyan-400/20`, `border-cyan-500/20`, `border-rose-500/20`, `border-t`, `border-white/10`, `border-white/5`, `focus-visible:bg-white/5`, `hover:bg-white/10`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `flex`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `inline-flex`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminCardPaddedClass`, `-translate-y-1/2`, `:`, `KAZANAN`, `animate-spin`, `border`, `break-all`, `divide-white/5`, `divide-y`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/40`, `font-black`, `font-bold`