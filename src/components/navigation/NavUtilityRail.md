---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavUtilityRail.tsx
skeleton_hash: 2f076781cad9a1e6
entity_hashes:
  func:NavUtilityRail: efe2f36f82cc6787
  overview: 25d3844473822124
  style_tokens: 66d394971c83165e
generated_at: 2026-06-19T20:47:10Z
---

## Genel Bakış
NavUtilityRail, navigasyon araç çubuğunun yanında ekstra işlevsellik sağlayan, içeriği sarmalayarak stil ve düzen uygulayan bir React sarmalayıcı bileşenidir. Modül, yalnızca children prop'unu alıp uygun bir konteyner içinde render ederek UI yapısını oluşturmaktadır.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve temel bileşeni, children prop'unu alarak utility rail alanını oluşturur.
- NavUtilityRail

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sadece `children` prop'unu alarak render eden basit bir sarmalayıcı (wrapper) bileşendir. Hiçbir modül sabit tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### NavUtilityRail

**Ne yapar**: `NavUtilityRail`, navigasyon sisteminde yardımcı araç çubuğunu (utility rail) temsil eden bir React bileşenidir. Bu bileşen, genellikle yan tarafta yer alan ve kullanıcılara ek navigasyon seçenekleri veya yardımcı işlevler sunan bir konteyner görevi görür.

**Nasıl yapar**: Fonksiyon, React functional component yapısıyla tanımlanmıştır. `children` prop'unu alarak, bileşen içine yerleştirilecek其他 alt bileşenleri veya içerikleri dinamik olarak render eder. Bu sayede farklı sayfa veya durumlarda farklı yardımcı araçlar gösterilebilir.

**Parametreler**:
- `children`: `React.ReactNode` — Bileşen içinde render edilecek olan alt bileşen veya içerikler. Bu prop, utility rail içerisinde gösterilecek yardımcı navigasyon elemanlarını veya araçları barındırır.

**Dönüş**: `React.FC<NavUtilityRailProps>` — Tanımlı NavUtilityRailProps arayüzüne uygun bir React fonksiyonel bileşeni döner. Bileşen, children prop'u ile gelen içeriği renders eden bir yapıya sahiptir.

---

## İTHALATLAR (IMPORTS)
- import: react::React

---

## INTERFACES

### NavUtilityRailProps
- `children: React.ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavUtilityRail.tsx::NavUtilityRail
- **params**: `{ children }` — Bileşenin alt bileşenlerini/child'larını temsil eder, JSX olarak render edilir
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX elemanı (`<div>` containing `{children}`) — children'ı ml-auto hizalı, bulanık arka planlı, yuvarlatılmış köşeli bir konteynır içine render eder

---

## NODE ID STANDARD

  file: src\components\navigation\NavUtilityRail.tsx
  function: src\components\navigation\NavUtilityRail.tsx::NavUtilityRail

---

## DISA AKTARILANLAR (EXPORTS)
  export: NavUtilityRail

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-lg`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white/80`, `border-slate-200/80`
- **Layout:** `backdrop-blur-md`, `flex`, `gap-1`, `items-center`, `justify-end`, `p-1`, `shadow-hvac-nav-rail`, `sm:gap-1.5`, `sm:p-1.5`
- **Varyant/Responsive:** `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-500`, `ease-in-out`, `ml-auto`, `transition-colors`