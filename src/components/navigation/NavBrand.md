---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\NavBrand.tsx
skeleton_hash: 98ccd7153feff405
entity_hashes:
  overview: c6785379bea85d87
  style_tokens: f2b8e78bf7817c52
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
NavBrand.tsx, uygulamanın üst navigasyon çubuğunda marka logosunu ve adını gösteren statik bir React bileşenidir. Bu modül, Next.js'in Link bileşenini kullanarak ana sayfaya yönlendirme yapar ve bu bağlantı için `utils/routes` modülündeki `Routes` sabitinden yararlanır. Modül herhangi bir harici API çağrısı yapmaz, ortam değişkeni kullanmaz ve yalnızca bir kullanıcı arayüzü parçası sunar.

## Fonksiyon Grupları
Dosya içinde çağrılabilecek veya yeniden kullanılabilecek herhangi bir fonksiyon veya method bulunmamaktadır. Kod, doğrudan bir React bileşeni (`NavBrand`) olarak modül seviyesinde tanımlanmıştır.

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `brandName` prop'u sağlanmıyorsa, bileşen tip tanımlaması (`NavBrandProps`) gereği bileşen hatalı çalışır veya `undefined` bir değer render edilir.

[Aksiyom 2]: Eğer `utils/routes` modülünden import edilen `Routes` sabiti tanımlı değilse veya geçerli bir rota içermiyorsa, `Link` bileşeninin `href` değeri tanımsız olur ve navigasyon çalışması bozulur.

[Aksiyom 3]: Eğer bileşen Next.js `Link` component'ini kullanıyorsa, bu bileşenin bir Next.js (`next/link`) ortamında render edilmesi gerekir; aksi takdirde `Link` çalışmaz veya hata fırlatır.

---

## FONKSİYON DETAYLARI

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

### [N1_NASIL] AST Pointer: components/navigation/NavBrand.tsx::NavBrand
- **params**: `{ brandName }` — marka adını tutan prop, JSX içinde `{brandName}` olarak render edilir
- **ic_degiskenler**: (yok — fonksiyon gövdesinde bağımsız değişken tanımlanmamış)
- **Dönüş**: JSX — `<Link>` bileşeni; `Routes.home()` href'ine sahip, içinde "VH" logosu div'i ve `{brandName}` metnini barındıran anchor elementi döner

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