---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\account\addresses\page.tsx
skeleton_hash: 46e74f8e737d3adb
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: c697ddf7c92cfa4f
  style_tokens: 9144ece4bffe7964
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, kullanıcının hesabındaki adresleri yönetmesine olanak tanıyan Next.js sayfa giriş noktasıdır. Tek bir `Page` fonksiyonu ile dinamik olarak yüklenen `AccountAddressesPage` bileşenini render ederek dil duyarlı adres yönetim arayüzünü sunar.

## Fonksiyon Grupları
### Sayfa Giriş Noktası
Modülün tek bileşeni olan `Page`, adres yönetim sayfasının içerik bölümünü dinamik import yoluyla yükler ve sayfayı kullanıcıya sunar.
- Page

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: `Page` fonksiyonu, React bileşeni olarak tanımlanmış bir fonksiyondur ve `<PageComponent />` JSX elemanını döndürerek ilgili sayfanın içeriğini render eder.  

**Nasıl yapar**: Fonksiyon, doğrudan bir JSX ifadesi olan `<PageComponent />`'i return eder; ek bir mantık, durum yönetimi veya yan etki (side‑effect) içermez.  

**Parametreler**:  
- *Yok* — Fonksiyon herhangi bir argüman almaz.

**Dönüş**:  
- `JSX.Element` — `<PageComponent />` bileşenini temsil eden JSX elemanı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **PageComponent** (call) — `nextDynamic(() => import('../../../../views/account/AccountAddressesPage'), {...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: [lang]/account/addresses/page.tsx::anonim_arrow_function
- **params**: (parametre yok)
- **ic_degiskenler**:
  (değişken yok — doğrudan JSX döndürür)
- **Dönüş**: JSX — `min-h-screen` flex container içinde `animate-spin` sınıfına sahip dönen spinner div'i; loading durumu için kullanıluyor (nextDynamic loading bileşeni olarak)

---

## NODE ID STANDARD

  file: src\app\[lang]\account\addresses\page.tsx
  function: src\app\[lang]\account\addresses\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `border-b-2`, `border-primary-navy`
- **Layout:** `flex`, `h-12`, `items-center`, `justify-center`, `min-h-screen`, `w-12`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-spin`, `rounded-full`