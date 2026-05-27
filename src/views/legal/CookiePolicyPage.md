---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\CookiePolicyPage.tsx
skeleton_hash: af47b1c0134c0866
entity_hashes:
  func:CookiePolicyPage: b3e779c99eb43367
  overview: 07640220d73eceb5
  style_tokens: a770e5a7f64844ff
generated_at: 2026-05-27T17:46:40Z
---

## Genel Bakış
Bu modül, uygulamanın çerez politikası sayfasını oluşturan tek bir React bileşeni içerir. Kullanıcılara çerez kullanımı hakkında yasal bilgilendirme sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tüm görsel ve yapısal öğelerini kapsar, çerez politikasını görüntülemekten sorumludur.
- CookiePolicyPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### CookiePolicyPage
**Ne yapar**: VentHub HVAC projesinin yasal içerikli sayfalarından biri olan Çerez Politikası sayfasını kullanıcılara sunan React fonksiyonel bileşenidir. Platformun çerez kullanımına ilişkin yasal olarak gerekli tüm bilgileri kullanıcıların erişebilmesini sağlayarak, sitenin yasal yükümlülüklerini yerine getirmesine katkıda bulunur.
**Nasıl yapar**: Projenin `src/views/legal` dizininde tutulan yasal görünüm bileşenleri ailesinden bir eleman olarak yapılandırılmıştır. React.FC tipinde tanımlanan bu statik görünüm bileşeni, herhangi bir karmaşık iş mantığı barındırmadan sadece Çerez Politikası içeriğini kullanıcı arayüzünde render etme görevini üstlenir, projenin genel React tabanlı mimarisine uyumlu şekilde çalışır.
**Parametreler**:
- Bu fonksiyonel bileşene aktarılmak üzere tanımlanmış herhangi bir giriş parametresi bulunmamaktadır.
**Dönüş**: React.FC (React Fonksiyonel Bileşen) türünde bir değer döndürür. Döndürdüğü değer, Çerez Politikası sayfasının tüm içeriğini içeren React elementleri olup, tarayıcı DOM'ına bu içeriğin işlenmesini sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\CookiePolicyPage.tsx::CookiePolicyPage
- **params**: yok
- **ic_degiskenler**:
  - `legalConfig` — dışarıdan import edilen yapılandırma nesnesi; JSX içinde `legalConfig.sellerEmail` ve `legalConfig.lastUpdated` değerlerine erişilerek Çerez Politikası sayfasında e-posta ve güncelleme tarihi gösterilir.
- **Dönüş**: JSX elementi (bileşen `React.FC` türünde)

---

## NODE ID STANDARD

  file: src\views\legal\CookiePolicyPage.tsx
  function: src\views\legal\CookiePolicyPage.tsx::CookiePolicyPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CookiePolicyPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`, `text-xl`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Varyant/Responsive:** `dark:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `dark:prose-invert`, `font-bold`, `font-semibold`, `lg:px-8`, `list-disc`, `mb-3`, `mb-6`, `mx-auto`, `pl-6`, `prose`, `px-4`, `py-10`, `rounded-lg`, `rounded-xl`