---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\PrivacyPolicyPage.tsx
skeleton_hash: 236dec3edf614633
entity_hashes:
  func:PrivacyPolicyPage: 40c3e34ff307a7eb
  overview: f7094466668600a6
  style_tokens: d97b122360d0289d
generated_at: 2026-05-27T11:57:10Z
---

## Genel Bakış
Bu modül, web uygulamasının gizlilik politikası sayfasını temsil eden tek bir React bileşeni içerir. Sayfa, kullanıcıya gizlilik politikası metnini sunmak için gerekli görsel ve metinsel öğeleri barındırır.

## Fonksiyon Grupları
### Gizlilik Politikası Sayfası
Bu grup, gizlilik politikası içeriğini görüntülemek ve sayfanın temel yapısını oluşturmakla sorumludur.
- PrivacyPolicyPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### PrivacyPolicyPage
**Ne yapar**: Bu fonksiyon, bir React fonksiyonel bileşeni (React.FC) döndürür. Fonksiyonun spesifik işlevi ve içeriği kod içinde açıklanmadığı için yalnızca bir bileşen üretmekle sınırlı olduğu söylenebilir.  

**Nasıl yapar**: Fonksiyon, içinde tanımlı bir React bileşenini oluşturur ve bu bileşeni geri döndürür. İç mantığı ve render edilen JSX yapısı kodda belirtilmediği için detaylandırılamaz.  

**Parametreler**:
- (Parametre yok) — Fonksiyon hiçbir girdi almaz.

**Dönüş**: React.FC — Fonksiyon, bir React fonksiyonel bileşeni tipinde değer döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\views\legal\PrivacyPolicyPage.tsx::PrivacyPolicyPage
- **params**: (none)
- **ic_degiskenler**:
  - `legalConfig` — Imported configuration object containing legal information such as seller details, retention periods, and contact emails.
  - `Routes` — Imported routing utility used to generate the URL for the cookie policy page via `Routes.legal.cerez()`.
  - `Link` — Imported Next.js component used to render a hyperlink to the cookie policy page.
- **Dönüş**: JSX element tree representing the privacy policy page.

---

## NODE ID STANDARD

  file: src\views\legal\PrivacyPolicyPage.tsx
  function: src\views\legal\PrivacyPolicyPage.tsx::PrivacyPolicyPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: PrivacyPolicyPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `bg-yellow-50`, `border-light-gray`, `border-yellow-200`, `text-3xl`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-xl`, `text-yellow-800`
- **Layout:** `bg-yellow-50`, `border-yellow-200`, `max-w-4xl`, `max-w-prose`, `p-4`, `p-6`, `shadow-sm`, `text-yellow-800`
- **Responsive:** `lg:`, `sm:` prefix kullanımları