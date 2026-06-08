---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\sections\TrustSignals.tsx
skeleton_hash: 442496b377e8fd6e
entity_hashes:
  func:TrustSignals: 91fe7d8aaf9157d4
  overview: a098e608084837ec
  style_tokens: d8ec8f7dddeaa270
generated_at: 2026-06-08T10:08:48Z
---

## Genel Bakış
TrustSignals bileşeni, kategori sayfasında kullanıcılara markanın güvenilirliğini görsel olarak iletmek için tasarlanmış bir React bileşenidir. Sertifika logoları, garanti bilgileri ve müşteri yorumları gibi statik güven işaretlerini düzenli bir grid yapısında sunar.

## Fonksiyon Grupları
### Güven İşaretleri Bileşeni
Kullanıcı arayüzünde güven sinyallerini içeren bölümü render eden statik bir bileşendir.
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

## AST POINTERS

### [N1_NASIL] AST Pointer: src\components\category\sections\TrustSignals.tsx::TrustSignals
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `signals` — Vortice products için güven sinyallerini (özellikleri) tutan dizi. Her eleman icon, title ve description özellikleri içerir
- **Dönüş**: `section` elementi (React JSX). TrustSignals bileşeninin rendered çıktısı.

### [N2_NASIL] AST Pointer: src\components\category\sections\TrustSignals.tsx::signal_callback (signals.map içindeki arrow fonksiyon)
- **params**: (signal, index)
- **ic_degiskenler**:
  - `Icon` — signal objesinden alınan icon bileşeni (Award, Shield vb.). JSX'te <Icon> olarak render edilir
- **Dönüş**: `div` elementi (React JSX). Her güven sinyalinin rendered kart görünümü.

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