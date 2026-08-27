---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\account\AccountOverviewPage.tsx
skeleton_hash: d560ac129dbe4210
entity_hashes:
  func:AccountOverviewPage: 4e9482fa9ca4867b
  overview: c522b04767bd3545
  style_tokens: 98f0536966ac7e31
generated_at: 2026-08-27T07:10:07Z
---

## Genel Bakış
Bu modül, kullanıcının hesap bilgilerinin genel bir özetini sunan bir sayfa bileşenidir. Uygulamanın görünüm katmanında yer alır ve tek bir bileşen fonksiyonundan oluşur.

## Fonksiyon Grupları
### Sayfa Bileşeni
Hesap genel bakış sayfasının kullanıcı arayüzünü oluşturur ve render eder. Modülde yalnızca bu tek bileşen yer alır.
- AccountOverviewPage

## Bağımlılıklar ve Mimari Notlar
- Modülde yalnızca bir fonksiyon bulunduğu için iç fonksiyon çağrı ilişkisi bulunmuyor.
- Dış bağımlılıklar, dinamik veya lazy yüklenen alt modüller verilen kaynak bilgiden tespit edilemiyor.
- Bu bileşen, muhtemelen bir React sayfa rotası tarafından çağrılarak kullanıcıya sunulmaktadır; ancak kesin rota yapısı kaynakta belirtilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** `AccountOverviewPage` fonksiyonunun gövdesi verilmemiştir. Aksiyomlar yalnızca fonksiyon gövdesinden üretilebilir; gövde bilinmediğinden bu bileşenin doğru çalışması için hangi koşulların gerekli olduğu belirlenememektedir.

---

## FONKSİYON DETAYLARI

### AccountOverviewPage
**Ne yapar**: Kullanıcının hesap özetini gösteren bir React fonksiyonel bileşenidir. Kullanıcının adres bilgilerini, sipariş geçmişini, aktif kargo durumunu ve temel istatistikleri (toplam harcama, aktif sipariş sayısı, tamamlanan sipariş sayısı) yükleyerek bir dashboard görünümü sunar.

**Nasıl yapar**: Bileşen, `useAuth` hook'u ile kimlik doğrulaması yapılmış kullanıcıyı, `useI18n` ile uluslararasılaştırma fonksiyonlarını, `useRouter` ile sayfa yönlendirme nesnesini ve `useLocalizedRoutes` ile lokalize edilmiş rota tanımlarını alır. `useState` ile `addresses` (UserAddress dizisi), `orders` (ShipmentRecord dizisi) ve `loading` (boolean) durumlarını yönetir. `useEffect` içinde asenkron bir `load` fonksiyonu tanımlanmıştır; bu fonksiyon kullanıcı oturum açmışsa önce `listAddresses` fonksiyonuyla Supabase üzerinden adresleri çeker, ardından `venthub_orders` tablosundan en fazla 50 adet siparişi `created_at` alanına göre azalan sırada sorgular. İlk sorguda `PGRST100` hatası alınırsa, daha az alan seçen bir fallback sorgu çalıştırılır ve eksik alanlar (`carrier`, `tracking_number`, `shipped_at`, `delivered_at`) `null` olarak doldurulur. `mounted` değişkeniyle bileşen unmount edildikten sonra state güncellemesi engellenir. Yüklenme tamamlandığında `loading` false yapılır. Veriler yüklendikten sonra `totalVolume` (tüm siparişlerin toplam tutarı), `activeOrders` (durumu 'delivered', 'cancelled', 'refunded', 'rejected' olmayan siparişler), `completedOrdersCount` (durumu 'delivered' olan sipariş sayısı) ve `activeShipment` (aktif siparişlerin ilki, yani en yenisi) hesaplanır. `getShipStatus` fonksiyonu bir siparişin kargo durumunu 'delivered', 'shipped' veya 'preparing' olarak belirler; `delivered_at` alanı varsa veya durum 'delivered' ise 'delivered', `shipped_at` veya `tracking_number` varsa ya da durum 'shipped' ise 'shipped', diğer durumlarda 'preparing' döndürür. `formatAddress` fonksiyonu bir adresin `full_address` alanını kullanır; bu alan yoksa `address_line`, `district` ve `city` alanlarını virgülle birleştirir. `activeShipStatusBadge` fonksiyonu kargo durumuna göre renkli ve ikonlu bir badge JSX'i döndürür. `getStepIndex` fonksiyonu kargo durumunu sayısal indekse çevirer (preparing=0, shipped=1, delivered=2). `loading` true iken bir spinner gösterilir; false olduğunda hoşgeldin kutusu, metrik kartları (aktif sipariş sayısı, tamamlanan sipariş sayısı, toplam harcama), kargo takibi widget'ı (aktif sipariş varsa adım göstergesi, yoksa katalog yönlendirmesi), son siparişler listesi (en fazla 4 adet), varsayılan gönderim/fatura adresi kartı, güvenlik merkezi kartı ve destek kartı render edilir.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz; bir React fonksiyonel bileşeni olup props tanımlanmamıştır.

**Dönüş**: JSX elementi döndürür. `loading` true iken spinner içeren bir `div`, false olduğunda ise dashboard yapısını oluşturan kapsamlı bir JSX ağacı döndürür. Dönüş tipi açıkça belirtilmemiştir (React bileşeni olarak `JSX.Element` veya `React.ReactElement` olması beklenir ancak kaynakta tip ipucu yoktur).

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/currency::SYSTEM_CURRENCY
- import: ../../i18n/datetime::formatDate
- import: ../../i18n/format::formatCurrency
- import: @/lib/services/address.service::listAddresses
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/types/ui-models::type { UserAddress }
- import: next/link::Link
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState

---

## INTERFACES

### OrderRecord
- `id: string`
- `created_at: string`
- `total_amount: number | string`
- `status: string`
- `order_number: string`

### ShipmentRecord extends OrderRecord
- `carrier: string | null`
- `tracking_number: string | null`
- `shipped_at: string | null`
- `delivered_at: string | null`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::AccountOverviewPage (useEffect arrow function)
- **params**: yok
- **ic_degiskenler**:
  - `mounted` — bileşenin hâlâ mount durumunda olup olmadığını takip eden boolean; unmount anında `false` yapılır, böylece asenkron yüklemeler setState çağırmaz
- **Dönüş**: cleanup fonksiyonu (`() => { mounted = false }`)

### [N2_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::load
- **params**: yok
- **ic_degiskenler**:
  - `addrData` — `listAddresses(supabase)` çağrısından dönen kullanıcı adresleri dizisi; `mounted` true ise `setAddresses` ile state'e yazılır
  - `orderData` — `ShipmentRecord[]` tipinde sipariş kayıtları dizisi; başlangıçta boş dizi, veritabanı sorgusuyla doldurulur
  - `data` — supabase `venthub_orders` sorgusundan dönen satırlar; `error` yoksa `orderData`'ya atanır
  - `error` — supabase sorgusundan dönen hata nesnesi; kodu `PGRST100` ise fırlatılır, aksi halde fallback'e geçilir
  - `fallback` — hata durumunda yapılan alternatif supabase sorgusunun sonucu; daha az alan (`id, created_at, total_amount, status, order_number`) seçilir
  - `e` — dış `catch` bloğunda yakalanan genel hata; `console.error` ile loglanır
- **Dönüş**: yok (async void; yan etkileri: `setLoading`, `setAddresses`, `setOrders` state güncellemeleri)

### [N3_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::map callback (d => ...)
- **params**:
  - `d` — `Record<string, unknown>` tipinde tek bir sipariş satırı
- **ic_degiskenler**: yok (spread operatörü ile yeni nesne oluşturulur)
- **Dönüş**: `ShipmentRecord` — `d`'nin tüm alanlarını korur, üzerine `carrier: null`, `tracking_number: null`, `shipped_at: null`, `delivered_at: null` ekler

### [N4_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::getShipStatus
- **params**:
  - `row` — opsiyonel `ShipmentRecord`; verilmezse `'preparing'` döner
- **ic_degiskenler**: yok
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` — `row.delivered_at` varsa veya `row.status`'un küçük harf karşılığı `'delivered'` ise `'delivered'`; `row.shipped_at` veya `row.tracking_number` varsa ya da `row.status` `'shipped'` ise `'shipped'`; diğer durumda `'preparing'`

### [N5_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::activeShipStatusBadge
- **params**:
  - `status` — `'delivered' | 'shipped' | 'preparing'` tipinde kargo durumu
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (`<span>`) — duruma göre farklı renk, ikon (`CheckCircle`, `Truck`, `Clock`) ve çeviri anahtarı ile rozet render eder

### [N6_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::step index hesaplama
- **params**:
  - `status` — `'delivered' | 'shipped' | 'preparing'` tipinde kargo durumu
- **ic_degiskenler**: yok
- **Dönüş**: `number` — `'delivered'` ise `2`, `'shipped'` ise `1`, diğer durumda `0`

### [N7_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::step render callback
- **params**:
  - `step` — adım verisi nesnesi (`step.icon`, `step.key`, `step.label` alanlarına sahip)
  - `idx` — adımın dizideki sıfır tabanlı indeksi
- **ic_degiskenler**:
  - `active` — `idx <= activeStepIdx` koşuluyla hesaplanan boolean; adımın aktif (tamamlanmış veya mevcut) olup olmadığını belirler
  - `StepIcon` — `step.icon`'dan alınan ikon bileşeni; `<StepIcon size={20} />` ile render edilir
- **Dönüş**: JSX element (`<React.Fragment>`) — adım ikonu, etiketi ve sonraki adım arasında bağlantı çizgisi render eder

### [N8_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::sipariş kartı render callback
- **params**:
  - `o` — `ShipmentRecord` tipinde tek bir sipariş kaydı
- **ic_degiskenler**:
  - `isDelivered` — `o.status.toLowerCase() === 'delivered'` koşuluyla hesaplanan boolean; ikon kutusunun stilini belirler
  - `code` — sipariş gösterim kodu; `o.order_number` varsa `#` ve tire sonrasındaki kısım, yoksa `o.id`'nin son 8 karakteri büyük harfle
- **Dönüş**: JSX element (`<div>`) — sipariş ikonu, sipariş numarası linki, tutar, tarih, kargo durumu rozeti ve detay yönlendirme butonu render eder

---

## NODE ID STANDARD

  file: src\views\account\AccountOverviewPage.tsx
  function: src\views\account\AccountOverviewPage.tsx::AccountOverviewPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountOverviewPage

---

## BILEŞIM (CONTAINS)
  contains: OrderRecord

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-amber-500/10`, `bg-blue-400/5`, `bg-blue-50`, `bg-blue-500/10`, `bg-emerald-50`, `bg-emerald-500/10`, `bg-gradient-to-br`, `bg-green-500/10`, `bg-orange-50`, `bg-orange-500/10`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-purple-500/10`, `bg-slate-200`
- **Layout:** `-bottom-4`, `-left-10%`, `-right-10%`, `-right-20%`, `-right-4`, `-right-6`, `-top-1/2`, `-top-20%`, `-top-6`, `-z-10`, `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `bottom-0`, `flex`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:`, `sm:`, `xl:` önekleri
- **Yardımcı Sınıflar:** `${active`, `${activeStepIdx`, `${isDelivered`, `-translate-x-1/4`, `-translate-y-1/2`, `1`, `:`, `>=`, `animate-pulse`, `animate-spin`, `blur-2xl`, `blur-3xl`, `border`, `divide-slate-100`, `divide-y`