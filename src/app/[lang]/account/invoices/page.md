---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\account\invoices\page.tsx
skeleton_hash: 0cb1a9f445e42d79
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: c697ddf7c92cfa4f
  style_tokens: 9144ece4bffe7964
generated_at: 2026-06-19T20:46:14Z
---

## Genel Bakış
Bu modül, kullanıcının hesap panelindeki fatura listesi sayfasını temsil eden kök React bileşenini içerir. Sayfa, dinamik bir yükleme stratejisi kullanarak asıl görünüm bileşenini yükler ve böylece performansı artırırken ilgili arayüzü sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Hesap faturaları sayfasının giriş noktasını ve temel yapısını oluşturur. Dinamik içe aktarma yoluyla asıl görünüm bileşenini yükleyerek sayfayı render eder.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, minimal bir React sarmalayıcı (wrapper) bileşenidir; fonksiyon gövdesi yalnızca `<PageComponent />` öğesini döndürür. Dolayısıyla mimari varsayımlar sınırlıdır.

---

## FONKSİYON DETAYLARI

### Page
**Ne yapar**: React bileşeni `Page` fonksiyonu, JSX içinde `<PageComponent />` öğesini döndürerek bir sayfa görünümü oluşturur.  

**Nasıl yapar**: Fonksiyon, doğrudan bir JSX ifadesi olan `<PageComponent />`'i return eder; ek bir mantık, durum yönetimi veya yan etki yoktur.  

**Parametreler**:
- (hiç parametre almaz)

**Dönüş**: JSX.Element — `<PageComponent />` bileşenini temsil eden React öğesi.

---

## İTHALATLAR (IMPORTS)
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **PageComponent** (call) — `nextDynamic(() => import('../../../../views/account/AccountInvoicesPage'), {...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `[lang]/account/invoices/page.tsx`::(anonim.loading)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `div` içinde `animate-spin` class'lı spinner loading göstergesi döndürür; `min-h-screen`, `flex`, `items-center`, `justify-center` ile ekran ortasında dönen bir yükleme animasyonu sunar

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