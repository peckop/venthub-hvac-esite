---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavPrimaryRail.tsx
skeleton_hash: be27047d81aba124
generated_at: 2026-05-23T22:19:16Z
---

## Genel Bakış
NavPrimaryRail.tsx modülü, uygulamanın ana gezinti çubuğunu (navigation rail) render eden bir React bileşenidir. Next.js'nin Link ve useRouter hooks'ını kullanarak istemci tarafı yönlendirme sağlar ve @/lib/utils üzerinden cn yardımcı işleviyle sınıf isimlerini birleştirir. Modül, veri çekme veya API sorgusu yapmadan sadece sunum katmanı işlevini yerine getirir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



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
- **params**: items, isCategoriesLoading, isCategoryHubOpen, onCategoryClick, onItemHover
- **ic_degiskenler**: 
  - `router` — `useRouter()` hookundan elde edilen Next.js router nesnesi; sayfa geçişleri ve `/products` yolunun önceden getirilmesi (prefetch) için kullanılır.
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/navigation/NavPrimaryRail.tsx::items.map callback
- **params**: item
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element (button, div veya Link elementi döndürür)

### [N3_NASIL] AST Pointer: src/components/navigation/NavPrimaryRail.tsx::onMouseEnter handler
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (fonksiyon sadece yan etkiler yapar: `onItemHover` çağrısı ve gerekirse `router.prefetch`)

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
- **Layout:** `flex-1`, `gap-2`, `group-hover:rotate-180`, `h-4`, `hidden`, `items-center`, `lg:flex`, `min-w-0`, `w-4`
- **Responsive:** `lg:`, `xl:` prefix kullanımları
