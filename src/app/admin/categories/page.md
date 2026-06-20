---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\categories\page.tsx
skeleton_hash: 57546cc709dd80c0
entity_hashes:
  func:Loading: 657ee72781ec51d8
  func:Page: 3494fba1713b6485
  overview: 5b1a16aab3aba293
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-19T20:46:32Z
---

## Genel Bakış
Bu modül, venthub-hvac projesinin admin panelindeki kategori yönetim sayfasının giriş noktasıdır. Next.js App Router yapısında yer alır ve hem ana sayfa bileşenini hem de sayfa yüklenirken gösterilecek durum bileşenini tanımlar.

## Fonksiyon Grupları
### Sayfa Tanımlama ve Yükleme
Bu grup, modülün temel amacını yerine getiren ve Next.js rotalandırma sistemine entegre olan ana bileşenleri içerir.
- Page, Loading

### Dinamik Yükleme ve Durum Yönetimi
Bu grup, sayfanın yükleme sırasındaki geçici durumunu yöneterek kullanıcı deneyimini iyileştirir ve uygulama performansını optimize eder.
- Loading

---

## AXIOMS – Mimari Varsayımlar
Bu modül, admin kategorileri sayfasının üst düzey bir giriş bileşenini içerir ve sadece alt bileşenleri birleştirerek render eder.

[Aksiyom 1]: Eğer `AdminCategoriesPage` bileşeni (veya ilgili import) yoksa, `Page()` fonksiyonu çalıştığında hata oluşur veya boş bir sayfa render edilir.

[Aksiyom 2]: Eğer uygulama Suspense (asenkron yükleme) mekanizması kullanıyorsa ve `Loading()` bileşeni bir fallback olarak tanımlanmışsa, ana sayfa (`Page`) bileşeni henüz yüklenmemişken bu bileşen render edilmez.

---

## FONKSİYON DETAYLARI

### Loading
**Ne yapar**: Next.js App Router yapısında, admin paneli kategoriler sayfasının yüklenme durumu sırasında kullanıcıya gösterilen geçici arayüz (skeleton/loading) bileşenini render eder. Sayfa verileri yüklenirken kullanıcıya görsel geri bildirim sağlar.

**Nasıl yapar**: Next.js App Router'ın klasör tabanlı rotalama sisteminde, bir sayfa dizininde `loading.tsx` olarak tanımlanan veya `page.tsx` içinde export edilen `Loading` bileşeni, o sayfanın asıl içeriği yüklenirken otomatik olarak tetiklenir. React Suspense sınırının altında çalışarak, veri çekme işlemleri tamamlanana kadar bir loading UI'ı sunar. Bu mekanizma, `page.tsx` dosyasındaki asıl sayfa bileşeninin render edilmesini beklemeden kullanıcıya anında bir yükleme göstergesi sunar.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: Return tipi dosya içeriğinde açıkça belirtilmemiştir. Next.js App Router standartlarına göre, React JSX/TSX elemanı (ReactElement veya React.ReactNode) döndürmesi beklenir. Bu, tipik olarak bir spinner, skeleton loader veya "Yükleniyor..." gibi bir arayüz bileşenidir.

### Page
**Ne yapar**: Bu basit React fonksiyonu, venthub-hvac projesinin admin kategoriler yönetim sayfasının ana giriş bileşenidir. Sadece önceden tanımlanmış AdminCategoriesPage bileşenini döndürerek sayfanın içeriklerini sunar.
**Nasıl yapar**: Herhangi bir ek işlem, veri çekme veya dönüşüm adımı içermez. Sadece tanımlı AdminCategoriesPage bileşenini doğrudan return ifadesi ile döndürür, bu sayede uygulama bu fonksiyonu sayfa bileşeni olarak yükler.
**Parametreler**:
- Yok: Bu fonksiyon herhangi bir dış parametre almaz
**Dönüş**: <AdminCategoriesPage /> — AdminCategoriesPage bileşenini döndürür, bu bileşen admin panelindeki HVAC kategorilerini yönetmek için gerekli kullanıcı arayüzünü içerir.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic

---

## SABİTLER
- **AdminCategoriesPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminCategoriesPage'),
  ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/categories/page.tsx::Loading
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'unun döndürdüğü çeviri fonksiyonu; `t('admin.common.loading')` çağrısıyla admin loading mesajını uluslararasılaştırılmış biçimde render eder
- **Dönüş**: JSX — pulse animasyonlu loading göstergesi div'i

### [N2_NASIL] AST Pointer: src/app/admin/categories/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<AdminCategoriesPage />` bileşeninin render sonucu

---

## NODE ID STANDARD

  file: src\app\admin\categories\page.tsx
  function: src\app\admin\categories\page.tsx::Loading
  function: src\app\admin\categories\page.tsx::Page

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