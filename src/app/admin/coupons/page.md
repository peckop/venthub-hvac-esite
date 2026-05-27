---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\coupons\page.tsx
skeleton_hash: b5364a7dcacd7105
entity_hashes:
  func:Page: 556d56b0dab8a0be
  overview: 3abd4459140e249f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-05-27T17:58:51Z
---



---



---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: Page fonksiyonu, admin kupon sayfasını oluşturan `AdminCouponsPage` bileşenini render eder. Bu, Next.js sayfa dosyasının varsayılan dışa aktarımı olarak görev yapar ve admin panelindeki kupon yönetim arayüzünü temsil eder.

**Nasıl yapar**: Fonksiyon, herhangi bir mantık veya durum yönetimi içermez; doğrudan `<AdminCouponsPage />` JSX öğesini döndürerek çalışır. Sarmalayıcı (wrapper) görevi görerek asıl bileşenin sayfaya eklenmesini sağlar.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: JSX.Element türünde `AdminCouponsPage` bileşenini döndürür.

---

## SABİTLER
- **AdminCouponsPage** (call) — `dynamic(
  () => import('../../../views/admin/AdminCouponsPage'),
  { ssr: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\admin\coupons\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<AdminCouponsPage />`) – React bileşeni olarak render edilen bir eleman.

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