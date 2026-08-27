---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\app\admin\categories\[id]\builder\page.tsx
skeleton_hash: 7ca3842d2ac818fe
entity_hashes:
  func:CategoryBuilderPage: 605172f14c98cbc0
  func:Loading: 657ee72781ec51d8
  overview: dae47e8499e6084c
  style_tokens: 9e2a0862230ce35c
generated_at: 2026-08-27T06:54:31Z
---

## Genel Bakış
Bu modül, yönetim panelinde belirli bir kategorinin yapısal düzenlemelerini yapmak için kullanılan bir sayfa oluşturucu (page builder) arayüzü sunar. URL'den gelen asenkron kategori kimliğini çözerek ana düzenleyici bileşenini render eder ve yükleme durumunu yönetir.

## Fonksiyon Grupları
### Sayfa Bileşeni ve Yükleme Durumu
Bu grup, sayfanın ana yapısını oluşturur, asenkron URL parametrelerini çözer ve yükleme esnasında gösterilecek geçici arayüzü sağlar. Kullanıcıya kategori bazlı içerik düzenleme arayüzü sunar.
- Loading, CategoryBuilderPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir üst bileşen tarafından sağlanan `params` prop'unun varlığını ve yapısını temel alır.

[Aksiyom 1]: Eğer `params` prop'u sağlanmazsa, `CategoryBuilderPage` bileşeni `id` değerine erişemez ve sayfa doğru şekilde oluşturulamaz.
[Aksiyom 2]: Eğer `params` içinde `id` alanı yoksa veya bu alan bir string değilse, bileşen beklenen kategori kimliğini alamaz ve alt bileşenlere geçersiz veri iletir.
[Aksiyom 3]: Eğer `params` bir Promise olarak çözümlenmezse (örneğin, doğrudan bir nesne olarak gelirse), bileşen asenkron veri akışını işleyemez.

---

## FONKSİYON DETAYLARI

### Loading
**Ne yapar**: Next.js App Router yapısında sayfa yüklenirken gösterilen yükleme durumu bileşenidir. Bu fonksiyon, CategoryBuilderPage yüklenene kadar kullanıcıya bir yükleme ekranı göstermek amacıyla kullanılır.

**Nasıl yapar**: Fonksiyonun gövdesi verilmemiştir. Sadece fonksiyon tanımı ve `void` veya bilinmeyen dönüş tipi belirtilmiştir. Next.js'in özel yükleme dosyası (loading.tsx) olarak çalışması beklenir.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Dönüş tipi verilmemiştir. `void` veya bilinmiyor.

### CategoryBuilderPage

**Ne yapar**: Next.js App Router'da dinamik bir sayfa rotası olarak görev yapan bu bileşen, verilen kategori ID'sine karşılık gelen tam ekran sayfa düzenleyicisi (Page Builder) görünümünü render eder. Kullanıcıya kategori bazlı bir otorite editörü sunar ve geçersiz ID durumunda hata gösterir.

**Nasıl yapar**: Fonksiyon, Next.js'in `params` prop'unu `Promise` tabanlı yapıdan `use` hook'u ile çözerek `id` değerini çıkarır. Eğer `id` boş veya tanımsız ise merkezi bir hata mesajı içeren tam ekran bir `div` döndürür. Aksi halde `CategoryBuilderView` bileşenini `categoryId` prop'u ile birlikte çağırarak ana düzenleyici arayüzünü render eder.

**Parametreler**:
- `params`: `Promise<{ id: string }>` — Next.js App Router tarafından otomatik olarak enjekte edilen dinamik rota parametreleri nesnesi. İçerisinde `id` alanı bulunur ve bu alan kategorinin benzersiz tanımlayıcısıdır. Promise tabanlı yapıda olduğu için `use` hook'u ile çözümlenmesi gerekir.

**Dönüş**: `JSX.Element` — Geçerli bir `id` mevcutsa `CategoryBuilderView` bileşeninin sarmalanmış hali; aksi takdirde hata durumu için merkezi bir `div` bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: next/dynamic::nextDynamic
- import: react::React
- import: react::use

---

## SABİTLER
- **CategoryBuilderView** (call) — `nextDynamic(
  () => import('@/views/admin/CategoryBuilderView'),
  { ssr: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/categories/[id]/builder/page.tsx::Loading
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `admin.common.loading` anahtarını çözümlemek için kullanılır
- **Dönüş**: JSX element — `div` içinde yükleme mesajı (`t('admin.common.loading')`) gösterir

### [N2_NASIL] AST Pointer: src/app/admin/categories/[id]/builder/page.tsx::CategoryBuilderPage
- **params**: `{ params }: { params: Promise<{ id: string }> }` — Next.js dinamik rota parametrelerini taşıyan Promise nesnesi
- **ic_degiskenler**:
  - `id` — `use(params)` ile Promise'den çözümlenen kategori kimliği (`string`); yoksa geçersiz mesajı gösterilir, varsa `CategoryBuilderView` bileşenine iletilir
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `admin.common.invalidCategory` anahtarını çözümlemek için kullanılır
- **Dönüş**: JSX element — `id` yoksa geçersiz kategori uyarısı (`t('admin.common.invalidCategory')`) içeren `div`, varsa `<CategoryBuilderView categoryId={id} />` bileşeni döner

---

## NODE ID STANDARD

  file: src\app\admin\categories\[id]\builder\page.tsx
  function: src\app\admin\categories\[id]\builder\page.tsx::Loading
  function: src\app\admin\categories\[id]\builder\page.tsx::CategoryBuilderPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryBuilderPage
  export: Loading

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-bg`, `text-admin-fg-muted`, `text-xs`
- **Layout:** `flex`, `h-screen`, `items-center`, `justify-center`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-mono`