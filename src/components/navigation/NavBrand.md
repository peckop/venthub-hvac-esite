---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavBrand.tsx
skeleton_hash: 763b9381e9c28a6a
generated_at: 2026-05-23T22:15:41Z
---

## Genel Bakış
NavBrand.tsx, uygulamanın üst navigasyon çubuğunda marka veya logoyu gösteren bir React bileşenidir. Next.js’nin `Link` bileşeniyle sayfa içi gezinmeyi sağlar ve yönlendirme hedefi olarak `utils/routes` modülünden gelen `Routes` sabitini kullanır. Bu modül harici bir API çağrısı yapmaz, ortam değişkenine bağımlı değildir ve sadece statik kullanıcı arayüzü öğesi sunar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---



---

## INTERFACES

### NavBrandProps
- `brandName: string`

---

## SABİTLER
- **NavBrand** (call) — `React.memo(({ brandName }) => {
    return (
        <Link
            hre...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavBrand.tsx::NavBrand
- **params**: brandName
- **ic_degiskenler**: 
  - `Routes` — imported utility object that provides route path helpers; used to obtain the home page URL via `Routes.home()`
- **Dönüş**: JSX element (a `<Link>` component wrapping the brand logo and name)

---

## NODE ID STANDARD

  file: src\components\navigation\NavBrand.tsx