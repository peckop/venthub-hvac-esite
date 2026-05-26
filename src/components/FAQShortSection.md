---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\FAQShortSection.tsx
skeleton_hash: ff1b91887f689998
generated_at: 2026-05-23T22:03:07Z
---

## Genel Bakış
Bu modül, kısa bir SSS (Sık Sorulan Sorular) bölümü gösteren bir React bileşeni tanımlar. Bileşen, soru‑cevap kartlarını düzenli bir şekilde düzenleyerek kullanıcıya sık sorulan sorulara hızlı erişim sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, modülün tek dışa açık işlevini içerir ve UI oluşturmayı sorumlular.
- FAQShortSection

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### FAQShortSection
**Ne yapar**: FAQShortSection işlevi, bir FAQ (Sık Sorulan Sorular) bölümünün kompakt versiyonunu render eden bir React fonksiyonel bileşenidir. Bu bileşen, sayfada sık sorulan sorular ve cevapların listesini göstererek kullanıcıya hızlı bilgi sağlar.

**Nasıl yapar**: Bileşen, iç içe geçmiş JSX elemanları kullanarak başlık, soru-cevap kartları ve stil tanımlarını döndürür. Dışarıdan prop almadığı için içeriği sabit veya başka bir veri kaynağından (örneğin, bir veri dosyası veya context) çekerek oluşturur; bu durumda işlev mantığı genellikle veriyi haritalayarak her soru-cevap çifti için bir `<div>` veya `<section>` elementi üretir.

**Parametreler**: Yok  
- (Bu bileşen hiçbir prop kabul etmez; dolayısıyla parametre listesi boştur.)

**Dönüş**: `React.FC` türü, yani bir fonksiyonel bileşen olarak `JSX.Element` döndürür. Bu dönüş değeri, React tarafından DOM’a eklenerek görsel FAQShortSection bölümünü oluşturur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/FAQShortSection.tsx::FAQShortSection
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — localization function returned by `useI18n()`, used to retrieve translated strings for titles, subtitles, questions, answers and the “Read more” link.
  - `items` — constant array of FAQ objects; each object contains `q` (translated question), `a` (translated answer) and `href` (URL to the full FAQ page) generated via `t()` and `Routes.destek.sss()`.
- **Dönüş**: JSX.Element (the component returns a `<section>` containing the FAQ list)

### [N2_NASIL] AST Pointer: src/components/FAQShortSection.tsx::FAQShortSection.mapCallback
- **params**: `it` — the current FAQ item object from the `items` array.
- **ic_degiskenler**:
  - `(yok)`
- **Dönüş**: JSX.Element (returns a `<div>` that renders a single FAQ card with question, answer and a “Read more” link)

---

## NODE ID STANDARD

  file: src\components\FAQShortSection.tsx
  function: src\components\FAQShortSection.tsx::FAQShortSection

---

## DISA AKTARILANLAR (EXPORTS)
  export: FAQShortSection

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-white`, `border-light-gray`, `from-gray-50`, `md:text-3xl`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `to-white`
- **Layout:** `flex`, `from-gray-50`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `items-start`, `max-w-7xl`, `md:grid-cols-3`, `p-5`
- **Responsive:** `lg:`, `md:`, `sm:` prefix kullanımları
