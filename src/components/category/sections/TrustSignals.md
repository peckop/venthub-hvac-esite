---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\TrustSignals.tsx
skeleton_hash: 19301e7b73166cb6
entity_hashes:
  func:TrustSignals: 91fe7d8aaf9157d4
  overview: bc5a93987b260832
  style_tokens: d8ec8f7dddeaa270
generated_at: 2026-06-14T21:00:26Z
---

## Genel Bakış
TrustSignals bileşeni, kategori sayfalarında markanın güvenilirliğini görsel olarak iletmek için tasarlanmış statik bir React bileşenidir. Sertifika logoları, garanti bilgileri ve müşteri yorumları gibi güven sinyallerini düzenli bir grid yapısında sunarak kullanıcıların markaya olan güvenini artırır.

## Fonksiyon Grupları
### Güven İşaretleri Bileşeni
Kullanıcı arayüzünde güven sinyallerini içeren bölümü render eden statik bir bileşendir. Herhangi bir state yönetimi veya dinamik mantık içermez; yalnızca JSX ile düzenlenmiş statik içerik sunar.
- TrustSignals

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### TrustSignals
**Ne yapar**: TrustSignals bileşeni, Vortice markasının güven sinyallerini gösteren bir bölüm render eder. Yeni site için şirketin itibarını ön plana çıkararak kullanıcı gücünü artırır.  
**Nasıl yapar**: Bileşen, iç içe geçmiş JSX elemanlarıyla güven rozetleri, müşteri yorumları, sertifika logoları gibi öğeleri düzenler ve bu öğeleri döndürür. Ekstra mantık veya state yönetimi içermez; sadece statik içerik sunar.  
**Parametreler**: yok  
**Dönüş**: React.FC türünde bir fonksiyon; çağrıldığında güven sinyalleri bölümünü temsil eden JSX döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: lucide-react::Award
- import: lucide-react::CreditCard
- import: lucide-react::Lock
- import: lucide-react::Phone
- import: lucide-react::Shield
- import: lucide-react::Truck
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/sections/TrustSignals.tsx::TrustSignals
- **params**: ()
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, metinleri yerelleştirmek için kullanılır
  - `signals` — Güven sinyallerini (ikon, başlık, açıklama) tutan dizi, 6 elemanlı
- **Dönüş**: JSX yapısı (React bileşeni)

### [N2_NASIL] AST Pointer: src/components/category/sections/TrustSignals.tsx::map_callback
- **params**: `(signal, index)`
- **ic_degiskenler**:
  - `Icon` — `signal.icon` değerini alan değişken, React bileşeni olarak kullanılır
- **Dönüş**: JSX yapısı (her güven sinyali için bir div)

---

## NODE ID STANDARD

  file: src\components\category\sections\TrustSignals.tsx
  function: src\components\category\sections\TrustSignals.tsx::TrustSignals

---

## DISA AKTARILANLAR (EXPORTS)
  export: TrustSignals

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-300`, `bg-gray-50`, `bg-white`, `border-gray-200`, `border-t`, `border-y`, `text-blue-600`, `text-center`, `text-gray-400`, `text-gray-500`, `text-gray-900`, `text-sm`, `text-xs`
- **Layout:** `flex`, `flex-wrap`, `gap-2`, `gap-6`, `grid`, `grid-cols-2`, `h-12`, `h-4`, `items-center`, `justify-center`, `lg:grid-cols-6`, `max-w-7xl`, `md:grid-cols-3`, `shadow-sm`, `w-12`
- **Varyant/Responsive:** `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-semibold`, `lg:px-8`, `mb-3`, `mt-1`, `mt-8`, `mx-auto`, `opacity-60`, `pt-8`, `px-4`, `py-12`, `rounded-full`, `sm:px-6`