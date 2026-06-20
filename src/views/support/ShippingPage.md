---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\support\ShippingPage.tsx
skeleton_hash: 3d36f2d960a8c9ee
entity_hashes:
  func:ShippingPage: 321c885e2ea88a49
  overview: 2fb078273ffdbcdc
  style_tokens: f66481541679296a
generated_at: 2026-06-19T20:51:03Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun destek bölümünde yer alan kargo işlemleri sayfasını uygulayan React tabanlı bir görünüm modülüdür. Platform kullanıcılarının destek süreçleri kapsamındaki kargo ile ilgili işlemleri görüntülemesi ve yönetmesi için gereken kullanıcı arayüzünü tek bir ana bileşen üzerinden sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün temel sorumluluğu olan kargo yönetimi sayfasının tüm görünüm ve mantığını üstlenen tek ana React bileşenidir. Tüm sayfa içeriğini ve gerekli kullanıcı etkileşimlerini yöneterek hedeflenen arayüzü ziyaretçilere sunar.
- ShippingPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi, parametre veya sabit değeri verilmediğinden dolayı, modüle özgü mimari aksiyom çıkarılamamıştır.

**Not:** `ShippingPage()` fonksiyon imzası parametresizdir ve modül sabitleri tanımlı değildir. Fonksiyon gövdesi paylaşılmadığı için çalışması için gerekli koşullar belirlenememiştir.

---

## FONKSİYON DETAYLARI

### ShippingPage
**Ne yapar**: `ShippingPage`, projenin destek/yardım bölümünde yer alan kargo ve gönderim süreciyle ilgili bilgilerin sunulduğu bir React bileşenidir. Kullanıcılara sevk bilgileri, teslimat süreleri, kargo şirketleriyle ilgili politikalar gibi konularda yardımcı olmak amacıyla tasarlanmış bir sayfa yapısı sunar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak, JSX (JavaScript XML) kullanarak bir sayfa düzeni (layout) oluşturur. Bu düzen muhtemelen başlık, açıklama metinleri, olası bir iletişim formu veya bilgi kartları gibi bileşenleri içerebilir. Bileşen kendi içinde durum (state) yönetimi veya yan etkiler (side effects) kullanmayan, saf bir sunum (presentational) bileşeni olarak karşımıza çıkmaktadır.

**Parametreler**:
- Bu bileşen herhangi bir props (özellik) almaz.

**Dönüş**: JSX elementini (`JSX.Element`) döndürür. Sayfa yapısını temsil eden bir React bileşeni ağacı (React component tree)返回 eder.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::ArrowLeft
- import: next/navigation::useRouter
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/views/support/ShippingPage.tsx`::ShippingPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — useRouter() hook'undan dönen router nesnesi, sayfa navigasyonu için kullanılır (örn: `router.back()`)
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, çok dilli metinleri getirmek için kullanılır (örn: `t('auth.back')`)
- **Dönüş**: JSX element (React bileşeni) — destek sayfası için nakliye bilgilerini gösteren React bileşeni

---

## NODE ID STANDARD

  file: src\views\support\ShippingPage.tsx
  function: src\views\support\ShippingPage.tsx::ShippingPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ShippingPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-white`, `border-light-gray`, `hover:text-primary-navy`, `text-3xl`, `text-industrial-gray`, `text-sm`, `text-steel-gray`
- **Layout:** `inline-flex`, `items-center`, `max-w-4xl`, `p-6`
- **Varyant/Responsive:** `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `lg:px-8`, `mb-4`, `mb-6`, `mr-1`, `mx-auto`, `px-4`, `py-10`, `rounded-xl`, `sm:px-6`, `space-y-4`, `transition-colors`