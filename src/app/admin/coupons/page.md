---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\coupons\page.tsx
skeleton_hash: f0cb795416035c48
entity_hashes:
  func:Page: 556d56b0dab8a0be
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-12T10:18:30Z
---

## Genel Bakış
Bu modül, admin panelinin kupon yönetim sayfasını sunan basit bir Next.js sayfa yönlendiricisidir. Tek bir `Page` bileşeni içermekte olup, asıl kupon yönetim arayüzünü dinamik olarak yükleyerek render eder.

## Fonksiyon Grupları
### Sayfa Yönlendirici
Modülün tek sorumluluğu, admin kupon sayfasının tarayıcıda görüntülenmesini sağlamaktır. Dinamik import ile asıl bileşeni yükleyerek sayfayı sunar.
- `Page`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, basit bir Next.js sayfa yönlendiricisi olduğundan minimal sayıda aksiyom bulunmaktadır.

**[Aksiyom 1]**: Eğer `AdminCouponsPage` bileşeni mevcut değilse veya import edilemiyorsa, `Page` bileşeni render edilemez ve sayfa hata verir.

**[Aksiyom 2]**: Eğer bu dosya Next.js App Router'ın beklediği dizin yapısında (`app/admin/coupons/page.tsx`) değilse, ilgili URL rota olarak eşleştirilmez.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Page fonksiyonu, admin kupon sayfasını oluşturan `AdminCouponsPage` bileşenini render eder. Bu, Next.js sayfa dosyasının varsayılan dışa aktarımı olarak görev yapar ve admin panelindeki kupon yönetim arayüzünü temsil eder.

**Nasıl yapar**: Fonksiyon, herhangi bir mantık veya durum yönetimi içermez; doğrudan `<AdminCouponsPage />` JSX öğesini döndürerek çalışır. Sarmalayıcı (wrapper) görevi görerek asıl bileşenin sayfaya eklenmesini sağlar.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: JSX.Element türünde `AdminCouponsPage` bileşenini döndürür.

---

## SABİTLER
- **AdminCouponsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminCouponsPage'),
  { s...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/coupons/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Kullanilan Bilesenler**:
  - `AdminCouponsPage` — import edilmiş React bileşeni, JSX içinde `<AdminCouponsPage />` olarak render edilir
- **Dönüş**: JSX element — `<AdminCouponsPage />` bileşeninin render ettiği React node'u döner

---

## NODE ID STANDARD

  file: src\app\admin\coupons\page.tsx
  function: src\app\admin\coupons\page.tsx::Page

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
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`