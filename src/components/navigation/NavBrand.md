---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\navigation\NavBrand.tsx
skeleton_hash: e4402e7b42c69016
entity_hashes:
  overview: 8f1b73db672da6d9
  style_tokens: f2b8e78bf7817c52
generated_at: 2026-08-27T13:31:14Z
---

## Genel Bakış

NavBrand.tsx, uygulamanın üst navigasyon çubuğunda marka adını gösteren bir React bileşenidir. Bileşen, Next.js'in `Link` bileşenini kullanarak ana sayfaya yönlendirme sağlar ve bu yönlendirme için `useLocalizedRoutes` hook'undan yararlanır. Modül herhangi bir harici API çağrısı yapmaz, ortam değişkeni kullanmaz ve yalnızca bir kullanıcı arayüzü parçası sunar.

## Fonksiyon Grupları

Dosya içinde çağrılabilecek veya yeniden kullanılabilecek herhangi bir fonksiyon veya method bulunmamaktadır. Kod, doğrudan bir React bileşeni (`NavBrand`) olarak modül seviyesinde tanımlanmıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon imzaları verilmemiştir; fonksiyon gövdesi kaynak olarak sağlanmamıştır. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir.

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
- **params**: `brandName` — bileşen prop'u olarak alınan marka adı; JSX içinde `{brandName}` ile doğrudan render edilir
- **ic_degiskenler**:
  - `Routes` — `useLocalizedRoutes()` hook çağırısının dönüş değeri; `Routes.home()` metodu çağrılarak ana sayfa URL'si `<Link>` bileşeninin `href` prop'una atanır
- **Dönüş**: JSX elementi — `<Link>` bileşeni; içinde iki `<div>` çocuğu barındırır: birincisi "VH" yazan gradient arka planlı logo kutusu, ikincisi `brandName` prop'unu gösteren metin alanı. `<Link>` bileşeni `next/link` modülünden gelir ve `Routes.home()` ile elde edilen href değerine yönlendirme yapar.

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