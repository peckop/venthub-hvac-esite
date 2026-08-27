---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\admin\PricePreviewPanel.tsx
skeleton_hash: 157c80149d827f00
entity_hashes:
  func:PricePreviewPanel: b4f46de0b63b53f0
  func:parseQty: ff99e0938af43376
  overview: 700305af35439775
  style_tokens: 81908022c66bd3df
generated_at: 2026-08-27T07:56:05Z
---

## Genel Bakış
Bu modül, admin panelinde fiyatlandırma önizleme işlevi sunan bir React bileşenidir. Kullanıcıların fiyatlandırma kurallarının ve hesaplamaların sonuçlarını dinamik bir panel üzerinde görsel olarak incelemesine olanak tanır.

## Fonksiyon Grupları
### Miktar Dönüştürme Yardımcıları
Bu grup, kullanıcıdan alınan ham metin tabanlı miktar bilgisini, fiyat hesaplamalarında kullanılabilir sayısal bir değere dönüştürmekten sorumludur.
- parseQty

### Ana Bileşen
Bu grup, modülün temel arayüzünü oluşturan ve fiyatlandırma verilerini kullanıcıya sunan ana React bileşenini kapsar.
- PricePreviewPanel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığından (yalnızca imzalar ve sabitler mevcut), mimari varsayımlar yalnızca fonksiyon gövdesinden üretilebilir kuralı uyarınca aksiyom türetilememektedir.

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
- import: lucide-react::AlertTriangle
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
- **params**: `raw` (string)
- **ic_degiskenler**:
  - `n` — `raw` stringinden rakam olmayan karakterler temizlenip `parseInt` ile 10 tabanında sayıya dönüştürülen değer
- **Dönüş**: number — `n` sonlu ve 0'dan büyükse `n`, değilse `1`

### [N2_NASIL] AST Pointer: PricePreviewPanel.tsx::URL güncelleme arrow fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `params` — `new URLSearchParams()` ile oluşturulan boş URL parametre nesnesi
  - `productId` — dışarıdan erişilen ürün kimliği; tanımlıysa `params`'a `'productId'` anahtarıyla eklenir
  - `segment` — dışarıdan erişilen segment; tanımlıysa `params`'a `'segment'` anahtarıyla eklenir
  - `currency` — dışarıdan erişilen para birimi; tanımlıysa `params`'a `'currency'` anahtarıyla eklenir
  - `quantity` — dışarıdan erişilen miktar; `1`'e eşit değilse `params`'a `'qty'` anahtarıyla string olarak eklenir
  - `qs` — `params.toString()` sonucu oluşan sorgu stringi
  - `pathname` — dışarıdan erişilen mevcut URL yolu
  - `router` — dışarıdan erişilen Next.js router nesnesi
- **Dönüş**: yok — `router.replace` çağırarak URL'i günceller, `{ scroll: false }` seçeneğiyle

### [N3_NASIL] AST Pointer: PricePreviewPanel.tsx::init useEffect (cleanup'lı)
- **params**: yok
- **ic_degiskenler**:
  - `alive` — bileşen monte edilmiş mi kontrolü; cleanup'ta `false` yapılır
  - `lists` — `supabase.from('price_lists')` sorgusundan dönen `data` (aktif fiyat listeleri)
  - `listsErr` — `price_lists` sorgusundan dönen `error`
  - `settingsRow` — `supabase.from('site_settings')` sorgusundan dönen `data` (key='pricing' ayarı)
  - `settingsErr` — `site_settings` sorgusundan dönen `error`
  - `settingsValue` — `settingsRow?.value` objesi; `{ enabled_currencies?: unknown }` tipine cast edilir
  - `raw` — `settingsValue.enabled_currencies` ham değeri
  - `currencies` — `raw` dizi ise ve her elemanı string ise `raw`, değilse `FALLBACK_CURRENCIES`
  - `e` — `catch` bloğunda yakalanan hata; `Error` instance'ıysa `e.message`, değilse `String(e)` olarak `setInitError`'a aktarılır
- **Dönüş**: cleanup fonksiyonu — `alive = false` yapar

### [N4_NASIL] AST Pointer: PricePreviewPanel.tsx::async init fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `lists` — `supabase.from('price_lists')` sorgusundan dönen `data`
  - `listsErr` — `price_lists` sorgusundan dönen `error`
  - `settingsRow` — `supabase.from('site_settings')` sorgusundan dönen `data`
  - `settingsErr` — `site_settings` sorgusundan dönen `error`
  - `settingsValue` — `settingsRow?.value` objesi
  - `raw` — `settingsValue.enabled_currencies` ham değeri
  - `currencies` — doğrulanmış para birimleri dizisi veya `FALLBACK_CURRENCIES`
  - `e` — yakalanan hata
- **Dönüş**: yok (async)

### [N5_NASIL] AST Pointer: PricePreviewPanel.tsx::init cleanup fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `alive` — `false` yapılır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: PricePreviewPanel.tsx::segment default useEffect
- **params**: yok
- **ic_degiskenler**:
  - `individual` — `priceLists` dizisinde `user_type === 'individual'` olan elemanı bulan `find` sonucu
- **Dönüş**: yok — `individual` varsa `setSegment(individual.id)`, yoksa `setSegment(BASE_BOOK_VALUE)` çağırır

### [N7_NASIL] AST Pointer: PricePreviewPanel.tsx::currency default useEffect
- **params**: yok
- **ic_degiskenler**: yok (dışarıdan erişim: `initLoading`, `currency`, `enabledCurrencies`)
- **Dönüş**: yok — `enabledCurrencies[0]` varsa onu, yoksa `'TRY'` değerini `setCurrency` ile atar

### [N8_NASIL] AST Pointer: PricePreviewPanel.tsx::product load useEffect (cleanup'lı)
- **params**: yok
- **ic_degiskenler**:
  - `alive` — bileşen monte edilmiş mi kontrolü
  - `data` — `supabase.from('products').select(PRODUCT_SELECT).eq('id', productId).is('deleted_at', null).maybeSingle()` sorgusundan dönen veri
  - `error` — ürün sorgusundan dönen hata
  - `e` — yakalanan hata (kullanılmıyor, sadece cleanup'ta `alive` kontrolü var)
- **Dönüş**: cleanup fonksiyonu — `alive = false` yapar

### [N9_NASIL] AST Pointer: PricePreviewPanel.tsx::async product load fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabase.from('products')` sorgusundan dönen ürün verisi
  - `error` — sorgu hatası
- **Dönüş**: yok (async)

### [N10_NASIL] AST Pointer: PricePreviewPanel.tsx::product load cleanup
- **params**: yok
- **ic_degiskenler**:
  - `alive` — `false` yapılır
- **Dönüş**: yok

### [N11_NASIL] AST Pointer: PricePreviewPanel.tsx::search useEffect (cleanup'lı)
- **params**: yok
- **ic_degiskenler**:
  - `needle` — `term.trim()` sonucu; arama terimi
  - `isBrowse` — `needle.length < 2` kontrolü; `true` ise tarama modu (sıralı liste), `false` ise arama modu
  - `alive` — bileşen monte edilmiş mi kontrolü
  - `timer` — `setTimeout` ile oluşturulan debounce zamanlayıcısı (`SEARCH_DEBOUNCE_MS` ms)
  - `pattern` — `needle`'dan `%,` karakterleri temizlenip `%` ile sarılarak oluşturulan SQL LIKE pattern
  - `query` — `supabase.from('products').select(PRODUCT_SELECT).is('deleted_at', null)` sorgu nesnesi; `isBrowse` ise `.order('name')`, değilse `.or(...)` eklenir
  - `data` — sorgu sonucu dönen ürünler dizisi
  - `error` — sorgu hatası
- **Dönüş**: cleanup fonksiyonu — `alive = false` ve `clearTimeout(timer)` çağırır

### [N12_NASIL] AST Pointer: PricePreviewPanel.tsx::async search fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `pattern` — SQL LIKE pattern
  - `query` — Supabase sorgu nesnesi
  - `data` — sorgu sonucu
  - `error` — sorgu hatası
- **Dönüş**: yok (async)

### [N13_NASIL] AST Pointer: PricePreviewPanel.tsx::search cleanup
- **params**: yok
- **ic_degiskenler**:
  - `alive` — `false` yapılır
  - `timer` — `clearTimeout` ile temizlenir
- **Dönüş**: yok

### [N14_NASIL] AST Pointer: PricePreviewPanel.tsx::pickProduct
- **params**: `p` (ProductSearchRow)
- **ic_degiskenler**: yok
- **Dönüş**: yok — `setSelectedProduct(p)`, `setProductId(p.id)`, `setTerm('')`, `setResults([])` çağırır

### [N15_NASIL] AST Pointer: PricePreviewPanel.tsx::clear selection fonksiyonu
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `setSelectedProduct(null)`, `setProductId(null)`, `setTerm('')`, `setResults([])` çağırır

### [N16_NASIL] AST Pointer: PricePreviewPanel.tsx::brand map load useEffect (cleanup'lı)
- **params**: yok
- **ic_degiskenler**:
  - `alive` — bileşen monte edilmiş mi kontrolü
  - `map` — `loadBrandIdByName(supabase)` sonucu dönen marka kimliği haritası
  - `e` — yakalanan hata; `console.error` ile loglanır ve `setInitError` ile kullanıcıya gösterilir
- **Dönüş**: cleanup fonksiyonu — `alive = false` yapar

### [N17_NASIL] AST Pointer: PricePreviewPanel.tsx::async brand map load fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `map` — `loadBrandIdByName(supabase)` sonucu
  - `e` — yakalanan hata
- **Dönüş**: yok (async)

### [N18_NASIL] AST Pointer: PricePreviewPanel.tsx::brand map cleanup
- **params**: yok
- **ic_degiskenler**:
  - `alive` — `false` yapılır
- **Dönüş**: yok

### [N19_NASIL] AST Pointer: PricePreviewPanel.tsx::price resolution useEffect (cleanup'lı)
- **params**: yok
- **ic_degiskenler**:
  - `alive` — bileşen monte edilmiş mi kontrolü
  - `input` — `toPricingProductInput(selectedProduct, brandMapRef.current!)` sonucu; fiyatlandırma için ürün girdisi
  - `result` — `resolvePrice(supabase, input, { priceBookId, currency, quantity })` sonucu; fiyat çözümleme sonucu
  - `e` — yakalanan hata; `Error` instance'ıysa `e.message`, değilse `String(e)` olarak `setResolveError`'a aktarılır
- **Dönüş**: cleanup fonksiyonu — `alive = false` yapar

### [N20_NASIL] AST Pointer: PricePreviewPanel.tsx::async price resolution fonksiyonu
- **params**: yok
- **ic_degiskenler**:
  - `input` — fiyatlandırma ürün girdisi
  - `result` — fiyat çözümleme sonucu
  - `e` — yakalanan hata
- **Dönüş**: yok (async)

### [N21_NASIL] AST Pointer: PricePreviewPanel.tsx::price resolution cleanup
- **params**: yok
- **ic_degiskenler**:
  - `alive` — `false` yapılır
- **Dönüş**: yok

### [N22_NASIL] AST Pointer: PricePreviewPanel.tsx::product list render fonksiyonu
- **params**: `p` (ProductSearchRow)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — `<li>` içinde ürün adı (`p.name`) ve SKU (`p.sku`) gösteren buton

### [N23_NASIL] AST Pointer: PricePreviewPanel.tsx::segment option render fonksiyonu
- **params**: `p` (PriceList)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — `<option>`; `p.user_type` varsa ve `SEGMENT_LABEL_KEYS[p.user_type]` tanımlıysa çevrilmiş etiket, yoksa `p.name` gösterilir

### [N24_NASIL] AST Pointer: PricePreviewPanel.tsx::currency option render fonksiyonu
- **params**: `c` (string)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — `<option>`; para birimi kodunu (`c`) gösterir

### [N25_NASIL] AST Pointer: PricePreviewPanel.tsx::resolution line render fonksiyonu
- **params**: `line` (string), `i` (number)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element — `<li>`; `line` `'KAZANAN'` ile başlıyorsa vurgulu stil uygulanır, satır numarası (`i + 1`) ve satır içeriği (`line`) gösterilir

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
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-danger-weak`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-admin-warning-weak`, `border-admin-accent/30`, `border-admin-border`, `border-admin-danger/30`, `border-admin-warning/30`, `border-t`, `focus-visible:bg-admin-surface-2`, `hover:bg-admin-surface-2`, `hover:bg-admin-surface-3`, `hover:text-admin-accent`, `hover:text-admin-fg`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `flex`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-3`, `gap-4`, `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `grid-cols-2`, `inline-flex`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminCardPaddedClass`, `-translate-y-1/2`, `:`, `KAZANAN`, `animate-spin`, `border`, `break-all`, `divide-admin-border`, `divide-y`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `font-bold`, `font-mono`