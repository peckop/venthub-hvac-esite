---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavPrimaryRail.tsx
skeleton_hash: be27047d81aba124
entity_hashes:
  overview: 4d24cdf1272dfd45
  style_tokens: ab3a3305965e5539
generated_at: 2026-05-28T22:36:31Z
---

## Genel Bakış
NavPrimaryRail.tsx modülü, uygulamanın ana gezinti çubuğunu (navigation rail) oluşturan bir React bileşenidir. Next.js'in Link ve useRouter hookları ile sayfa yönlendirme sağlar; @/lib/utils üzerinden cn yardımcısını kullanarak koşullu sınıf birleştirme yapar. Herhangi bir ortam değişkenine başvurmaz ve arka uç API'sine ya da veritabanına sorgu göndermez; tüm işlevini props aracılığıyla alınan verilere dayanarak yerine getirir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, props tabanlı bir React bileşenidir; girdilerin interface tanımlarına uygunluğu ve bağımlılıkların mevcudiyeti üzerine mimari varsayımlar içerir.

---

**[Aksiyom 1]:** Eğer `NavPrimaryRailProps.items` dizisi boş (`[]`) olarak verilirse, bileşen herhangi bir gezinti öğesi göstermez (boş rail render edilir).

**[Aksiyom 2]:** Eğer `ResolvedNavigationItem.id` alanı bir string değilse veya benzersiz değilse, React'in `key` prop'u düzgün çalışmaz ve render hataları veya beklenmeyen davranışlar oluşur.

**[Aksiyom 3]:** Eğer `ResolvedNavigationItem.href` alanı sağlanmamışsa (undefined/optional), ilgili öğeye tıklanabilir bir yönlendirme linki atanmaz; bileşenin `href` yokluğunu nasıl ele aldığına bağlı olarak öğe pasif veya devre dışı kalır.

**[Aksiyom 4]:** Eğer `isCategoriesLoading` değeri `true` ise, bileşen kategori verilerinin henüz hazır olmadığını belirtir ve muhtemelen yükleme durumu gösterimi yapar; bu sırada kategoriye bağlı menü öğeleri kullanıma sunulmaz.

**[Aksiyom 5]:** Eğer `isCategoryHubOpen` değeri `true` ise, kategori hub paneli/açılır menü açık durumdadır; `isCategoriesLoading` aynı anda `true` ise, açık panel içinde yükleme durumu gösterilir.

**[Aksiyom 6]:** Eğer `@/lib/utils` modülündeki `cn` yardımcı fonksiyonu mevcut değilse veya çalışmazsa, bileşenin koşullu CSS sınıf birleştirme mantığı bozulur ve stil hataları oluşur.

**[Aksiyom 7]:** Eğer Next.js `Link` bileşeni veya `useRouter` hook'u mevcut değilse/yüklenemezse, sayfa yönlendirme (navigation) işlevi çalışmaz.

**[Aksiyom 8]:** Eğer `items` prop'u `null` veya `undefined` olarak verilirse (React'ta zorunlu prop olduğu için `NavPrimaryRailProps` tanımına göre), bileşen çalışma zamanı hatası verir.

---

**Domain-Specific Kurallar:**
- `ResolvedNavigationItem.id` alanı React `key` prop'u olarak kullanıldığından, aynı `items` dizisi içinde `id` değerlerinin benzersiz olması zorunludur.
- `href` opsiyonel olduğundan, bileşenin `href` içermeyen öğeler için tıklama davranışı (ör. sadece açılır menü tetikleme) modül içi bir karardır.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### ResolvedNavigationItem
- `id: string`
- `label: string`
- `href?: string`

### NavPrimaryRailProps
- `items: ResolvedNavigationItem[]`
- `isCategoriesLoading: boolean`
- `isCategoryHubOpen: boolean`
- `onCategoryClick: () => void`
- `onItemHover?: (itemId: string) => void`

---

## SABİTLER
- **itemBaseClass** (str) — `'group relative inline-flex items-center justify-center gap-2 rounded-2xl bor...`
- **NavPrimaryRail** (call) — `React.memo(({
    items,
    isCategoriesLoading,
    isCategoryHubOpen,
...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavPrimaryRail.tsx::NavPrimaryRail
- **params**: `({ items, isCategoriesLoading, isCategoryHubOpen, onCategoryClick, onItemHover })`
- **ic_degiskenler**:
  - `router` — `useRouter()` hook sonucu; `router.prefetch` ile sayfa ön‑yüklemesi yapılır.
- **Dönüş**: JSX `<div>` elementi döner; yan etkisi yoktur (sadece render).

### [N2_NASIL] AST Pointer: src/components/navigation/NavPrimaryRail.tsx::itemMapper
- **params**: `(item)`
- **ic_degiskenler**:
  - `item.id` — öğenin benzersiz kimliği; koşullara göre farklı JSX döndürülür.
  - `item.label` — menü öğesinin gösterilecek metni.
  - `item.href` — öğenin yönlendirme hedefi; var ise `<Link>` oluşturulur.
  - `onCategoryClick` — “categories” öğesi tıklandığında çağrılan callback.
  - `isCategoryHubOpen` — kategori hubının açık/kapalı durumu; `aria-expanded` ve stil sınıflarında kullanılır.
  - `itemBaseClass` — dışarıdan gelen temel CSS sınıfı; `cn` ile birleştirilir.
  - `cn` — sınıf isimlerini birleştiren yardımcı fonksiyon.
  - `isCategoriesLoading` — kategori verisi yükleniyorsa dönen spinner SVG.
  - `onItemHover` — öğe üzerine gelindiğinde isteğe bağlı olarak çalıştırılan callback (`onItemHover?.(item.id)`).
  - `router` — dış fonksiyondan alınan `useRouter()`; `router.prefetch('/products')` ile ürün sayfası ön‑yüklenir.
- **Dönüş**: JSX öğesi (`<button>`, `<div>` veya `<Link>`) döner; render amacıyla kullanılır.

### [N3_NASIL] AST Pointer: src/components/navigation/NavPrimaryRail.tsx::onMouseEnterHandler
- **params**: `()`
- **ic_degiskenler**:
  - `onItemHover` — isteğe bağlı callback; `onItemHover?.(item.id)` ile çağrılır.
  - `item.id` — mevcut öğenin kimliği; hover callback’e argüman.
  - `item.href` — mevcut öğenin hedef URL; `/products` kontrolü için kullanılır.
  - `router` — `useRouter()` sonucu; `router.prefetch('/products')` ile ürün sayfası ön‑yüklenir.
- **Dönüş**: `void` (yan etki: hover callback ve olası sayfa ön‑yüklemesi).

---

## NODE ID STANDARD

  file: src\components\navigation\NavPrimaryRail.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue/40`, `border-primary-navy/15`, `text-primary-navy`
- **Layout:** `flex-1`, `gap-2`, `h-4`, `hidden`, `items-center`, `lg:flex`, `min-w-0`, `w-4`
- **Varyant/Responsive:** `group-hover:`, `lg:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `cursor-default`, `duration-300`, `group-hover:rotate-180`, `opacity-25`, `opacity-75`, `opacity-80`, `pl-2`, `transition-transform`, `whitespace-nowrap`, `xl:pl-4`