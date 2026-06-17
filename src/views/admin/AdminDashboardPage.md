---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\vh-dashboard\src\views\admin\AdminDashboardPage.tsx
skeleton_hash: 07b6c09fe51f81e0
entity_hashes:
  func:AdminDashboardPage: d9f200a1ae3a63e1
  overview: 98a75f3d9ee8aa18
  style_tokens: 12dd6d905c26f46b
generated_at: 2026-06-17T18:45:20Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetici panelinin ana giriş sayfasını render eden tek bir React bileşeni içermektedir. Yöneticilerin sistem genelindeki verileri görüntülediği ve yönetim işlevlerine eriştiği ilk arayüz noktası olarak görev yapar.

## Fonksiyon Grupları
### Yönetici Paneli Ana Sayfa Bileşeni
Yönetici paneline ait tüm içerikleri, durum özetlerini ve gezinme bileşenlerini bir araya getirerek kullanıcıya tek bir sayfa üzerinden sunar.
- AdminDashboardPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesine erişilemediği için, sadece fonksiyon imzasından çıkarılabilecek minimum mimari varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer kullanıcı oturumu (auth context) yoksa, bileşen yönetici verilerini gösteremez ve muhtemelen hata verir veya yönlendirilir.

[Aksiyom 2]: Eğer React Router bağlamı (router context) yoksa, bileşen sayfa yönlendirmeleri ve gezinme bağlantıları düzgün çalışmaz.

[Aksiyom 3]: Eğer modülün bağımlı olduğu alt bileşenler (örn: dashboard kartları, grafikler, tablolar) component library'de mevcut değilse, render hatası oluşur.

---

## FONKSİYON DETAYLARI

### AdminDashboardPage
**Ne yapar**: VentHub HVAC sisteminin yönetici paneline ait ana gösterim sayfası bileşenidir. Sadece yetkilendirilmiş yönetici hesaplarına açık olan bu sayfa, sistemdeki tüm HVAC cihazlarının genel durumunu, işlem istatistiklerini, son kullanıcı hareketlerini ve yöneticiye özel erişim modüllerini tek bir konsolide arayüzde sunar. Yetkisiz erişim girişimlerini engelleyerek kullanıcıları doğru rotalara yönlendiren güvenlikli bir rota bileşeni olarak görev görür.
**Nasıl yapar**: React tabanlı fonksiyonel bileşen mimarisi ile geliştirilmiştir. Sayfa ilk yüklendiğinde yerel kimlik doğrulama servisi üzerinden kullanıcının yönetici yetkisine sahip olup olmadığını kontrol eder, yetkisiz tespit edildiğinde otomatik olarak giriş sayfasına yönlendirme tetikler. Sistem genelindeki verileri ilgili API servisleri üzerinden çekerek, sayfa içinde kullandığı alt bileşenlere (istatistik kartları, aktif cihaz listesi, işlem kaydı arayüzü vb.) iletir. Responsive tasarım prensiplerine uygun olarak farklı ekran boyutlarında arayüz düzenini dinamik olarak ayarlar.
**Parametreler**: Bu fonksiyonel bileşen herhangi bir harici parametre almaz, tüm ihtiyaç duyduğu verileri React Context API ve yerel state yapıları üzerinden yönetir.
**Dönüş**: React.FC tipi React fonksiyonel bileşeni döndürür. Bu dönüş değeri, uygulamanın yönlendirme sistemi tarafından yönetici paneli için tanımlanan rota eşleştiğinde ekrana render edilmek üzere kullanılır.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/dashboard/RecentOrdersTable::RecentOrdersTable
- import: ../../components/admin/dashboard/SalesChart::SalesChart
- import: ../../components/admin/dashboard/StatCard::StatCard
- import: ../../i18n/I18nProvider::useI18n
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: ../../types/db-rows::type { DbOrder }
- import: ../../utils/adminUi::adminSectionTitleClass
- import: ../../utils/adminUi::adminSubtitleClass
- import: @/lib/supabase/client::supabaseBrowserClient
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### DashboardChartData
- `date: string`
- `orders: number`
- `returns: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::AdminDashboardPage
- **params**: ()
- **ic_degiskenler**:
  - `t` — useI18n hook'unun döndürdüğü çeviri fonksiyonu
  - `ordersCount` — toplam sipariş sayısını tutan state
  - `salesTotal` — toplam satış tutarını tutan state
  - `pendingReturns` — bekleyen iade sayısını tutan state
  - `pendingShipments` — bekleyen sevkiyat sayısını tutan state
  - `loading` — yükleme durumunu tutan boolean state
  - `error` — hata mesajını tutan state
  - `recentOrders` — son siparişleri tutan DbOrder dizisi state
  - `chartData` — grafik verisini tutan DashboardChartData dizisi state
  - `tiedCapital` — bağlı sermaye (stok değeri) tutan state
  - `alarmCount` — stok alarm sayısını tutan state
  - `loadKPIs` — KPI verilerini yükleyen useCallback fonksiyonu
- **Dönüş**: React JSX (admin dashboard sayfasını render eder)

### [N2_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::loadKPIs
- **params**: ()
- **ic_degiskenler**:
  - `ordersData` — supabase'den çekilen sipariş verileri (data alanı)
  - `oCount` — supabase'den çekilen sipariş sayısı
  - `oErr` — sipariş çekme işlemindeki hata
  - `returnsRes` — iade sayısını çeken supabase sonucu
  - `shipRes` — sevkiyat sayısını çeken supabase sonucu
  - `productsRes` — ürünler verisini çeken supabase sonucu
  - `rawProducts` — productsRes.data'yı DbProduct[] tipine cast eden değişken
  - `capital` — döngü içinde toplam sermaye hesaplayan accumulator
  - `alarms` — döngü içinde alarm sayısını hesaplayan accumulator
  - `p` — döngüdeki mevcut ürün nesnesi
  - `stockQty` — ürünün stok miktarı
  - `purchasePrice` — ürünün alış fiyatı
  - `lowStockThreshold` — ürünün düşük stok eşiği
  - `err` — catch bloğunda yakalanan hata nesnesi
- **Dönüş**: Promise<void> (async fonksiyon, state'leri günceller)

### [N3_NASIL] AST Pointer: src/views/admin/AdminDashboardPage.tsx::useEffectCallback
- **params**: ()
- **ic_degiskenler**:
  - (yok — sadece loadKPIs() çağrısı yapıyor)
- **Dönüş**: void (useEffect callback'i)

---

## NODE ID STANDARD

  file: src\views\admin\AdminDashboardPage.tsx
  function: src\views\admin\AdminDashboardPage.tsx::AdminDashboardPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminDashboardPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `rounded-hvac-2xl`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-red-50`, `bg-surface-deep/40`, `border-white/5`, `text-red-500`, `text-slate-500`, `text-sm`
- **Layout:** `gap-6`, `gap-8`, `grid`, `grid-cols-1`, `lg:grid-cols-2`, `lg:grid-cols-4`, `md:grid-cols-2`, `md:grid-cols-3`, `p-4`, `p-8`
- **Varyant/Responsive:** `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-black`, `glass-card`, `mb-8`, `rounded-xl`, `space-y-10`, `tracking-widest`, `uppercase`