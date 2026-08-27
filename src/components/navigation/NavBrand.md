---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\navigation\NavBrand.tsx
skeleton_hash: 233dc20a42cb3f74
entity_hashes:
  overview: 8f1b73db672da6d9
  style_tokens: f2b8e78bf7817c52
generated_at: 2026-08-27T08:33:28Z
---

## Genel Bakış

NavBrand.tsx, uygulamanın üst navigasyon çubuğunda marka logosunu ve adını gösteren bir React bileşenidir. Bileşen, `React.memo` ile sarmalanmış olup `brandName` prop'u alır ve Next.js'in `Link` bileşenini kullanarak ana sayfaya yönlendirme sağlar. Yönlendirme URL'i için `useLocalizedRoutes` hook'undan yararlanır; bu hook, çoklu dil desteğiyle birlikte lokalize edilmiş rotaları sunar. Modül herhangi bir harici API çağrısı yapmaz ve ortam değişkeni kullanmaz; yalnızca bir kullanıcı arayüzü parçası olarak çalışır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon imzası verilmediğinden ve modül sabitleri yalnızca `NavBrand` (call) olarak belirtildiğinden, fonksiyon gövdesinden türetilebilecek kesin aksiyom üretilememektedir.

Eski dokümanda bahsedilen `Routes` sabiti ve `brandName` prop'u, verilen kaynak kodda doğrulanamadığından (fonksiyon imzaları boş) aksiyom olarak yazılmaz.

**Bilinen bağımlılıklar (eski dokümana göre, doğrulanmamış):**
- Eski dokümana göre modül, `utils/routes` modülündeki `Routes` sabitini kullanır ve Next.js `Link` bileşeniyle ana sayfaya yönlendirme yapar. Ancak bu bilgiler fonksiyon gövdesinden değil eski dokümandan geldiğinden aksiyom statüsü verilmez.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: next/link::Link
- import: react::React

---

## INTERFACES

### NavBrandProps
- `brandName: string`

---

## SABİTLER
- **NavBrand** (call) — `React.memo(({ brandName }) => {
    const Routes = useLocalizedRoutes()
   ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/NavBrand.tsx::NavBrand
- **params**: `brandName` — bileşene dışarıdan aktarılan marka adı; JSX içinde doğrudan metin olarak render edilir
- **ic_degiskenler**:
  - `Routes` — `useLocalizedRoutes()` hook çağrısının dönüş değeri; lokalize edilmiş rota fonksiyonlarını barındırır
  - `Routes.home()` — `Routes` nesnesi üzerinden erişilen ana sayfa rota fonksiyonu; `Link` bileşeninin `href` prop'una atanır
- **Dönüş**: JSX — `<Link>` bileşeni; içinde VH logosu (gradient arka planlı `div` + `span`) ve `brandName` metnini gösteren iki alt `div` barındırır. `Link` bileşeni `next/link` modülünden gelir ve `Routes.home()` adresine yönlendirir.

---

## NODE ID STANDARD

  file: src\components\navigation\NavBrand.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-08`, `tracking-hvac-22`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-nav-brand-radial`, `border-r`, `border-slate-200/80`, `from-primary-navy`, `group-hover:text-primary-navy`, `text-lg`, `text-slate-900`, `text-white`, `text-xs`, `to-secondary-blue`, `via-primary-navy`
- **Layout:** `absolute`, `block`, `flex`, `from-primary-navy`, `gap-3`, `group-hover:shadow-elevation-4`, `items-center`, `min-w-0`, `overflow-hidden`, `relative`, `shadow-elevation-3`, `w-auto`
- **Varyant/Responsive:** `group-hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `duration-300`, `font-bold`, `font-semibold`, `group`, `group-hover:-translate-y-0.5`, `inset-0`, `lg:pr-5`, `opacity-80`, `pr-3`, `px-3`, `py-2`, `rounded-2xl`, `shrink-0`, `sm:pr-4`, `transition-colors`