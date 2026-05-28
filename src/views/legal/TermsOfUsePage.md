---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\TermsOfUsePage.tsx
skeleton_hash: 4ce5312f302597e2
entity_hashes:
  func:TermsOfUsePage: 107aaa4df0cf13a7
  overview: e378e8b50990e5c0
  style_tokens: a770e5a7f64844ff
generated_at: 2026-05-28T22:40:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun yasal alanındaki Kullanım Şartları sayfasını oluşturan tek React bileşenini barındırır. Modül içinde birden fazla fonksiyon bulunmadığından, hiçbir fonksiyon birbirini çağırmaz ve tüm sorumluluk tek bileşene aittir. Ziyaretçilerin platformun kullanım kurallarını okuyabileceği resmi bir metin sayfası sunmak üzere tasarlanmıştır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek sorumluluğunu yerine getirir, Kullanım Şartları sayfasının tüm içeriğini render eder ve platformun yasal sayfaları kapsamında yer alır.
- TermsOfUsePage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TermsOfUsePage
**Ne yapar**: Bu fonksiyon, uygulamanın "Kullanım Koşulları" (Terms of Use) sayfasını temsil eden bir React bileşenidir. Kullanıcıya uygulamanın kullanımına dair yasal şartları ve kuralları sunan arayüzü oluşturur.
**Nasıl yapar**: React fonksiyonel bileşeni (Functional Component) yapısında tanımlanmıştır. Verilen imzada herhangi bir giriş parametresi bulunmamaktadır ve muhtemelen sayfa içeriğini içeren JSX yapısını döndürerek ekranda yasal metni gösterir.
**Parametreler**:
- Yok — Fonksiyon tanımında parametre belirtilmemiştir.
**Dönüş**: React.FC — React bileşen tipinde bir dönüş değeri sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/TermsOfUsePage.tsx::TermsOfUsePage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `legalConfig` - Projeden import edilmiş, hukuki sayfalarda kullanılacak site ve satıcı bilgilerini içeren yapılandırma nesnesi
  - `legalConfig.websiteUrl` - Kullanım koşulları metninde belirtilen sitenin alan adresini tutan config alanı
  - `legalConfig.sellerTitle` - Siteden sorumlu satıcı kurumun resmi unvanını tutan config alanı
  - `legalConfig.lastUpdated` - Kullanım koşullarının en son güncellendiği tarihi tutan config alanı
- **Dönüş**: React JSX elementi (Kullanım Koşulları sayfasının kullanıcı arayüzü bileşeni)

---

## NODE ID STANDARD

  file: src\views\legal\TermsOfUsePage.tsx
  function: src\views\legal\TermsOfUsePage.tsx::TermsOfUsePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: TermsOfUsePage

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