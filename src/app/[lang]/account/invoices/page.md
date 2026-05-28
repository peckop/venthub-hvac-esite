---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\account\invoices\page.tsx
skeleton_hash: 0ad86876ec50ba32
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 3abd4459140e249f
  style_tokens: 9144ece4bffe7964
generated_at: 2026-05-28T22:34:48Z
---

## Genel Bakış
Bu dosya, kullanıcı hesabı altındaki fatura listesi sayfasının kök bileşenini tanımlar. Tek bir `Page` fonksiyonu, dinamik olarak yüklenen `AccountInvoicesPage` bileşenini döndürerek sayfanın veri çekme, yetkilendirme ve kullanıcı arayüzü düzenlemesini yönetir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Hesap faturaları sayfasının kök bileşenini oluşturur. Dinamik içe aktarma (dynamic import) yoluyla ilgili görünümü yükler ve render eder.
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: React bileşeni `Page` fonksiyonu, JSX içinde `<PageComponent />` öğesini döndürerek bir sayfa görünümü oluşturur.  

**Nasıl yapar**: Fonksiyon, doğrudan bir JSX ifadesi olan `<PageComponent />`'i return eder; ek bir mantık, durum yönetimi veya yan etki yoktur.  

**Parametreler**:
- (hiç parametre almaz)

**Dönüş**: JSX.Element — `<PageComponent />` bileşenini temsil eden React öğesi.

---

## SABİTLER
- **PageComponent** (call) — `dynamic(() => import('../../../../views/account/AccountInvoicesPage'), {
  s...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\account\invoices\page.tsx::anonymous_arrow_function
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: React JSX elementi (merkezlenmiş yükleme spinner bileşeni)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\app\account\invoices\page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: `<PageComponent />` React bileşeni

---

## NODE ID STANDARD

  file: src\app\[lang]\account\invoices\page.tsx
  function: src\app\[lang]\account\invoices\page.tsx::Page

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