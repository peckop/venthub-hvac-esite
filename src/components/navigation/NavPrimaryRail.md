---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavPrimaryRail.tsx
skeleton_hash: be27047d81aba124
entity_hashes:
  overview: 4d24cdf1272dfd45
  style_tokens: ab3a3305965e5539
generated_at: 2026-05-27T18:29:37Z
---

## Genel Bakış
NavPrimaryRail.tsx modülü, uygulamanın ana gezinti çubuğunu (navigation rail) oluşturan bir React bileşenidir. Next.js'in Link ve useRouter hookları ile sayfa yönlendirme sağlar; @/lib/utils üzerinden cn yardımcısını kullanarak koşullu sınıf birleştirme yapar. Herhangi bir ortam değişkenine başvurmaz ve arka uç API'sine ya da veritabanına sorgu göndermez; tüm işlevini props aracılığıyla alınan verilere dayanarak yerine getirir.

---



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