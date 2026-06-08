---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\support\WarrantyPage.tsx
skeleton_hash: 78c857c6989a2419
entity_hashes:
  func:WarrantyPage: 10b812b014f5f78b
  overview: 24646a95fed0395f
  style_tokens: f66481541679296a
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun destek bölümünde yer alan garanti sayfasını sunan React tabanlı bir kullanıcı arayüzü bileşenidir. Kullanıcılara garanti süreçleri, kapsamları ve ilgili bilgilere erişim sağlayan tek bileşenli bir sayfa modülüdür. Tüm sayfa arayüzü ve işlevselliği tek bir fonksiyonel bileşen tarafından yönetilir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve temel bileşeni olup, garanti sayfasının tüm arayüzünü ve gösterim mantığını içeren ana React fonksiyonel bileşenini barındırır.
- WarrantyPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### WarrantyPage

**Ne yapar**: WarrantyPage, uygulamanın garanti bilgilendirme sayfasını render eden React fonksiyonel bileşenidir. Kullanıcılara garanti politikaları, kapsam detayları ve ilgili destek bilgilerini sunar.

**Nasıl yapar**: Fonksiyonel React bileşeni (React.FC) olarak tanımlanmıştır. Bileşen, JSX döndürerek garanti sayfasının arayüzünü oluşturur. Sayfa yapısı, destek/yardım bölümleri altında konumlandırılmıştır (source_path: `src/views/support/`).

**Parametreler**:
- Prop parametresi almaz (React.FC olarak tanımlıdır)

**Dönüş**: `React.JSX.Element` — Garanti sayfasının tamamını içeren JSX yapısı döndürür. Sayfa, uygulamanın destek bölümünde yer alan garanti bilgilendirme içeriğini sergiler.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/support/WarrantyPage.tsx::WarrantyPage
- **params**: (yok)
- **ic_degiskenler**:
  - `router` — useRouter() hook'undan alınan Next.js router nesnesi, sayfa yönlendirme işlemleri için kullanılır (router.back() ile önceki sayfaya geri dönme)
  - `{ t }` — useI18n() hook'undan alınan çeviri fonksiyonu, UI metinlerinin çoklu dil desteğiyle render edilmesini sağlar
- **Kullanılan API/Component cagrilari**:
  - `useRouter()` — Next.js navigasyon router'ını döndürür
  - `useI18n()` — Mevcut dil ayarına göre çeviri fonksiyonunu döndürür
  - `t('auth.back')` — Geri butonu için çeviri metni
  - `t('support.links.warranty')` — Sayfa başlığı için çeviri metni
  - `t('support.warranty.desc1')` — Garanti açıklama metni 1
  - `t('support.warranty.desc2')` — Garanti açıklama metni 2
  - `router.back()` — Bir önceki sayfaya navigasyon
- **Dönüş**: React.FC — Garanti sayfasını JSX olarak render eden fonksiyonel bileşen

---

## NODE ID STANDARD

  file: src\views\support\WarrantyPage.tsx
  function: src\views\support\WarrantyPage.tsx::WarrantyPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: WarrantyPage

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