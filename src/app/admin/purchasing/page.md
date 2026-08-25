---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\purchasing\page.tsx
skeleton_hash: 210395eb415a8a77
entity_hashes:
  func:Loading: 657ee72781ec51d8
  func:Page: 84ffa19e59af0ad3
  overview: 5b1a16aab3aba293
  style_tokens: 08b1938b3f3a81d8
generated_at: 2026-08-25T08:43:06Z
---

## Genel Bakış
Bu modül, admin panelindeki satın alma (purchasing) sayfasını oluşturan bir Next.js sayfa bileşenidir. Modül, sayfanın ana içeriğini ve yükleme durumunu yöneten iki temel bileşen içerir.

## Fonksiyon Grupları
### Sayfa Bileşenleri
Bu grup, satın alma sayfasının kullanıcı arayüzünü oluşturan temel bileşenleri içerir.
- Loading, Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modüle ait fonksiyon gövdeleri (`Loading`, `Page`) sağlanmamıştır. Aksiyomlar yalnızca fonksiyon gövdelerinden üretilebilir; imza, sabit adı veya dosya yolundan çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### Loading
**Ne yapar**: Bu fonksiyonun görevi hakkında verilen kaynakta bilgi bulunmamaktadır. Yalnızca fonksiyon adı belirtilmiştir.
**Nasıl yapar**: İç mantığı hakkında verilen kaynakta bilgi bulunmamaktadır.
**Parametreler**: Parametre bilgisi verilmemiştir.
**Dönüş**: Dönüş tipi hakkında verilen kaynakta kesin bilgi bulunmamaktadır.

### Page
**Ne yapar**: Admin satın alma sayfasını render eden bir React bileşenidir. Sayfa bileşeni olarak `AdminPurchasingPage` bileşenini doğrudan döndürerek admin panelindeki satın alma bölümünü görüntüler.
**Nasıl yapar**: Fonksiyon, herhangi bir ek işlem yapmadan doğrudan `AdminPurchasingPage` bileşenini JSX olarak döndürür. Bu, Next.js'in dosya tabanlı yönlendirme sisteminde bir sayfa bileşeni olarak kullanılan yaygın bir pattern'dir; dosya yolu `admin/purchasing/page.tsx` olduğundan, bu bileşen `/admin/purchasing` rotasına karşılık gelir.
**Parametreler**: Bu fonksiyon herhangi bir parametre almamaktadır.
**Dönüş**: `<AdminPurchasingPage />` JSX bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **AdminPurchasingPage** (call) — `nextDynamic(
  () => import('../../../views/admin/purchasing/AdminPurchasing...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/purchasing/page.tsx::Loading
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructuring ile alınan çeviri fonksiyonu; `t('admin.common.loading')` çağrısıyla yükleme mesajını yerelleştirir
- **Dönüş**: JSX element — `className="p-8 text-center text-admin-fg-muted animate-pulse"` özellikli bir `<div>`; içinde `t('admin.common.loading')` sonucu metin olarak yerleştirilir

### [N2_NASIL] AST Pointer: src/app/admin/purchasing/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (gövdede değişken tanımlanmamış)
- **Dönüş**: JSX element — `<AdminPurchasingPage />` bileşeni doğrudan döndürülür

---

## NODE ID STANDARD

  file: src\app\admin\purchasing\page.tsx
  function: src\app\admin\purchasing\page.tsx::Loading
  function: src\app\admin\purchasing\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Loading
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-admin-fg-muted`, `text-center`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`