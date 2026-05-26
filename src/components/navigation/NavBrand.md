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

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `shadow-[0_18px_35px_-20px_rgba(37,99,235,0.7)]`
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]`, `group-hover:shadow-[0_22px_40px_-18px_rgba(37,99,235,0.75)]`, `tracking-[0.08em]`, `tracking-[0.22em]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `border-r`, `border-slate-200/80`, `from-primary-navy`, `text-lg`, `text-slate-900`, `text-white`, `text-xs`, `to-secondary-blue`, `via-primary-navy`
- **Layout:** `absolute`, `block`, `flex`, `from-primary-navy`, `gap-3`, `group-hover:-translate-y-0.5`, `group-hover:text-primary-navy`, `items-center`, `min-w-0`, `overflow-hidden`, `relative`, `w-auto`
- **Responsive:** `lg:`, `sm:` prefix kullanımları
