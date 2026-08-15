---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\coupons\page.tsx
skeleton_hash: 20e286efb838025b
entity_hashes:
  func:Loading: 657ee72781ec51d8
  func:Page: 556d56b0dab8a0be
  overview: 5b1a16aab3aba293
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-19T20:46:27Z
---

## Genel Bakış
Bu modül, admin panelinin kupon yönetim sayfasını sunan minimal bir Next.js sayfa yönlendiricisidir. Dinamik import ile asıl kupon yönetim arayüzünü (AdminCouponsPage) yükler ve sayfa yüklenme süresinde uygun bir loading ekranı gösterir.

## Fonksiyon Grupları

### Sayfa Yönlendirici
Modülün temel sorumluluğu, `/admin/coupons` rotasını sunarak tarayıcıya kupon yönetim arayüzünü ulaştırmaktır. Asıl bileşeni dinamik olarak yükleyerek performansı optimize eder.
- `Page`

### Yükleniyor Durumu
Sayfa içeriği hazırlanırken kullanıcıya görsel geri bildirim sağlamakla yükümlüdür. Kullanıcı deneyimini iyileştirmek için basit bir loading göstergesi sunar.
- `Loading`

---

**Dış Bağımlılıklar**: Modül, `AdminCouponsPage` bileşenini dinamik import ile (`next/dynamic`) yükler; bu sayede ana sayfa yüklenirken kupon arayüzü ayrı bir chunk olarak indirilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin panelinin kupon yönetim sayfasını sunan basit bir Next.js sayfa yönlendiricisidir.

[Aksiyom 1]: Eğer `AdminCouponsPage` bileşeni mevcut değilse veya dinamik import başarısız olursa, `Page` bileşeni ana sayfa içeriğini render edemez.

[Aksiyom 2]: Eğer Next.js dinamik import mekanizması çalışmıyorsa, kupon yönetim arayüzü kullanıcıya sunulamaz.

[Aksiyom 3]: Eğer `Loading` bileşeni render edilmezse, dinamik yükleme sırasında kullanıcıya geçici bir UI gösterilemez.

---

## FONKSİYON DETAYLARI

### Loading

**Ne yapar**: Bu fonksiyon, bir loading (yüklenme) durumunu temsil eden UI bileşenini render etmekle sorumludur. Next.js uygulamalarında sayfa yüklenirken kullanıcıya beklediğini göstermek amacıyla kullanılır.

**Nasıl yapar**: Fonksiyonun dahili mantığı docstring'de belirtilmemiştir. Next.js'in `loading.tsx` convention'ına göre, bu fonksiyon sayfa içeriği yüklenirken geçici bir gösterge (spinner, skeleton vb.) sunar. Fonksiyon bir React bileşeni olarak tanımlanmış olup, JSX/TSX dönüş değeri beklenir.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Return tipi docstring'de void veya bilinmiyor olarak belirtilmiştir. Ancak React bileşeni yapısı gereği JSX elementi (React.JSX.Element) döndürmesi beklenir.

### Page
**Ne yapar**: Page fonksiyonu, admin kupon sayfasını oluşturan `AdminCouponsPage` bileşenini render eder. Bu, Next.js sayfa dosyasının varsayılan dışa aktarımı olarak görev yapar ve admin panelindeki kupon yönetim arayüzünü temsil eder.

**Nasıl yapar**: Fonksiyon, herhangi bir mantık veya durum yönetimi içermez; doğrudan `<AdminCouponsPage />` JSX öğesini döndürerek çalışır. Sarmalayıcı (wrapper) görevi görerek asıl bileşenin sayfaya eklenmesini sağlar.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: JSX.Element türünde `AdminCouponsPage` bileşenini döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **AdminCouponsPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminCouponsPage'),
  { s...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: admin/coupons/page.tsx::Loading
- **params**: (parametre yok — anonim arrow function)
- **ic_degiskenler**:
  - `t` — `useI18n()` hookundan destructure edilen çeviri fonksiyonu; `t('admin.common.loading')` çağrısıyla Türkçe/İngilizce loading metnini döndürür
- **Dönüş**: JSX — `div` elementi içinde animasyonlu pulse efektli "Yükleniyor..." metni render eder

### [N2_NASIL] AST Pointer: admin/coupons/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `AdminCouponsPage` bileşenini doğrudan render eder; sayfa yüklenene kadar `next/dynamic` ile lazy-loaded olarak dinamik import edilen `AdminCouponsPage`'i çağırır (sayfa üstünde `nextDynamic` import'u mevcut)

---

## NODE ID STANDARD

  file: src\app\admin\coupons\page.tsx
  function: src\app\admin\coupons\page.tsx::Loading
  function: src\app\admin\coupons\page.tsx::Page

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
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`