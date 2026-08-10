---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: e641cd80fb2ebb0a
entity_hashes:
  func:AccountOverviewPage: e6c9a31f87c7387a
  overview: 0705893c7853ddb8
  style_tokens: 98f0536966ac7e31
generated_at: 2026-06-19T20:48:51Z
---

## Genel Bakış
AccountOverviewPage, VentHub HVAC uygulamasında kullanıcının kişisel hesap yönetimine dair tüm temel bilgileri görselleştirdiği merkezi dashboard sayfasıdır. Profil bilgileri, sipariş geçmişi, aktif kargo durumları ve kayıtlı adreslerini tek bir entegre arayüzde sunarak kullanıcıya kapsamlı bir hesap özeti sağlar. Bu sayfa, kimlik doğrulama, backend API'ları ve yönlendirme bağlamı gibi kritik dış sistemlere bağımlı olup, verileri işleyerek ve hata durumlarını yöneterek kullanıcıya bilgiye hızlı erişimi amaçlar.

## Fonksiyon Grupları
### Sayfa Bileşeni (Dashboard)
Kullanıcının hesap özetini oluşturan ve tarayıcıda render edilen temel React bileşenidir. Verileri işler, yükleme ve hata durumlarını yönetir ve düzenli bir dashboard aracılığıyla profil, sipariş, kargo ve adres bilgilerini sunar. Kimlik doğrulama durumuna göre içerik gösterir veya yönlendirme yapar.
- AccountOverviewPage

---

## AXIOMS – Mimari Varsayımlar
Fonksiyon gövdesi paylaşılmadığı için, sadece fonksiyon imzası ve modül bağlamına dayalı çıkarılabilecek minimum mimari varsayımlar şunlardır:

[Aksiyom 1]: Eğer AccountOverviewPage fonksiyonu çağrıldığında geçerli bir React bileşen döndürülmez veya JSX içeriği oluşturulamazsa, sayfa render edilemez ve uygulama hata verir.

[Aksiyom 2]: Eğer bu fonksiyon bir React bileşeni olarak kullanılacaksa, React veya türevi bir UI kütüphanesi ortamda mevcut olmalıdır; yoksa bileşen çalışmaz.

**Not:** Fonksiyon gövdesi (implementasyon) paylaşılmadığı için, içindeki state kullanımı, veri çekme mekanizması, hata yönetimi, prop bağımlılıkları veya alt bileşen ihtiyacı gibi detaylar hakkında kesin aksiyomlar üretilememektedir.

---

## FONKSİYON DETAYLARI

### AccountOverviewPage
**Ne yapar**: Kullanıcının hesap özetini, siparişlerini, aktif kargo durumunu ve profil bilgilerini tek bir sayfada gösteren React bileşenidir. Kullanıcı girişinin ardından tüm hesap verilerini çekip düzenli bir arayüzde sunar.

**Nasıl yapar**: Fonksiyon, React hooks (useState, useEffect) ve Supabase client kullanarak veritabanından asenkron veri çeker. `useEffect` içinde `mounted` flag ile bellek sızıntısını önler. Siparişleri çekerken ilk istek başarısız olursa fallback bir sorgu ile daha az alan döndürerek hata toleransı sağlar. Adres ve sipariş verilerini state'e kaydeder, ardından istatistikleri (toplam ciro, aktif sipariş sayısı, tamamlanan sipariş sayısı) hesaplar. En son aktif siparişin kargo durumunu belirler ve buna göre UI bileşenlerini (rozetler, adım göstericileri) dinamik olarak render eder. `useI18n` ile çoklu dil desteği, `useRouter` ile yönlendirme sağlar.

**Parametreler**:
- Fonksiyon parametre almaz (React bileşeni).

**Dönüş**: JSX (React elementi) — Yüklenme durumunda spinner, yükleme tamamlandığında ise hesap özetini gösteren kartlar, sipariş listesi, adres kartları ve hızlı işlem düğmelerinden oluşan tam sayfa düzeni.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
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

### [N1_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::useEffect callback
- **params**: (yok — useEffect callback, parametre almaz)
- **ic_degiskenler**:
  - `mounted` — cleanup flag; useEffect unmount edildiğinde false yapılır, state güncellemelerini engeller
  - `load` — asenkron fonksiyon; adres ve sipariş verilerini yükler
  - `user` — useAuth'tan gelen mevcut kullanıcı nesnesi; yoksa load erken döner
  - `setLoading` — yükleme durumunu güncelleyen state setter
  - `setAddresses` — adres listesini state'e yazan setter
  - `setOrders` — sipariş listesini state'e yazan setter
  - `orderData` — `ShipmentRecord[]` tipinde; çekilen sipariş verilerini tutar, başlangıçta boş dizi
- **Dönüş**: cleanup fonksiyonu döner → `() => { mounted = false }`

---

### [N2_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::load (iç fonksiyon)
- **params**: (yok)
- **ic_degiskenler**:
  - `user` — outer scope'tan gelen kullanıcı nesnesi; yoksa fonksiyon erken döner
  - `setLoading` — state setter, yükleme durumunu true yapar
  - `addrData` — `listAddresses(supabase)` çağrısından dönen adres verisi
  - `setAddresses` — outer scope state setter, adresleri yazar
  - `orderData` — `ShipmentRecord[]`, boş dizi ile başlar; supabase sorgusundan dönen veri veya fallback verisi atanır
  - `supabase` — Supabase browser client instance'ı
  - `data` — supabase `.from('venthub_orders').select(...)` sorgusundan dönen satırlar
  - `error` — supabase sorgusundan dönen hata nesnesi; `error.code === 'PGRST100'` kontrolü yapılır
  - `fallback` — birincil sorgu hata verdiğinde alternatif sorgu sonucu (daraltılmış select ile)
  - `d` — fallback.map callback parametresi; `Record<string, unknown>` tipinde tek bir sipariş satırı
  - `e` — catch bloğu hata nesnesi; `console.error` ile loglanır
- **Dönüş**: yok (void; state'leri side-effect olarak günceller)

---

### [N3_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::fallback map callback
- **params**: `d` — `Record<string, unknown>` tipinde, fallback sorgusundan gelen tek bir sipariş satırı
- **ic_degiskenler**: (yok — inline spread ile nesne oluşturulur)
- **Dönüş**: `ShipmentRecord` — orijinal `d` nesnesini spread edip `carrier: null`, `tracking_number: null`, `shipped_at: null`, `delivered_at: null` alanlarını ekler

---

### [N4_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::getShipStatus
- **params**: `row?: ShipmentRecord` — opsiyonel sipariş satırı
- **ic_degiskenler**:
  - `row.delivered_at` — teslimat tarihi; truthy ise `'delivered'` döner
  - `row.status` — sipariş durum stringi; `.toLowerCase()` ile `'delivered'` kontrol edilir
  - `row.shipped_at` — kargoya verilme tarihi; truthy ise `'shipped'` döner
  - `row.tracking_number` — kargo takip numarası; truthy ise `'shipped'` döner
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'`

---

### [N5_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::activeShipStatusBadge
- **params**: `status: 'delivered' | 'shipped' | 'preparing'` — sipariş durumu
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu (useTranslation veya benzeri hook'tan gelir); `t('account.overview.shipStatus.delivered')`, `t('account.overview.shipStatus.shipped')`, `t('account.overview.shipStatus.preparing')` çağrıları yapılır
  - `CheckCircle` — import edilen ikon bileşeni; delivered durumunda kullanılır
  - `Truck` — import edilen ikon bileşeni; shipped durumunda kullanılır
  - `Clock` — import edilen ikon bileşeni; preparing durumunda kullanılır
- **Dönüş**: JSX `<span>` elementi — renk kodlu durum rozeti

---

### [N6_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::getActiveStepIdx
- **params**: `status: 'delivered' | 'shipped' | 'preparing'` — sipariş durumu
- **ic_degiskenler**: (yok — doğrudan koşul kontrolleri)
- **Dönüş**: `number` — `'delivered'` → 2, `'shipped'` → 1, diğer → 0

---

### [N7_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::shipSteps map callback
- **params**: `step` — tek bir adım nesnesi (`{ key, icon, label }` yapısında`); `idx` — dizi indeksi
- **ic_degiskenler**:
  - `active` — `boolean`; `idx <= activeStepIdx` koşulu ile adımın aktif olup olmadığını belirler
  - `StepIcon` — `step.icon` değerinden alınan ikon bileşeni; JSX'te `<StepIcon size={20} />` olarak render edilir
  - `activeStepIdx` — outer scope'tan gelen aktif adım indeksi; hangi adımların aktif olduğunu belirler
  - `shipSteps` — outer scope'tan gelen adım dizisi; `.length` ile toplam adım sayısı alınır (son adımda ayırıcı çizgi render edilmez)
- **Dönüş**: `<React.Fragment>` — adım ikonu, etiketi ve adım ayırıcı çizgi barındırır

---

### [N8_NASIL] AST Pointer: src/views/account/AccountOverviewPage.tsx::orders map callback
- **params**: `o` — `ShipmentRecord` tipinde tek bir sipariş nesnesi
- **ic_degiskenler**:
  - `isDelivered` — `boolean`; `o.status.toLowerCase() === 'delivered'` ile siparişin teslim edilip edilmediğini kontrol eder
  - `code` — `string`; sipariş gösterim kodu — `o.order_number` varsa `#${o.order_number.split('-')[1]}` oluşturulur, yoksa `#${o.id.slice(-8).toUpperCase()}`
  - `formatCurrency` — import edilen para birimi formatlama fonksiyonu; `formatCurrency(Number(o.total_amount), lang, { maximumFractionDigits: 0 })` çağrılır
  - `lang` — outer scope'tan gelen mevcut dil kodu; formatCurrency ve formatDate'e传递 edilir
  - `formatDate` — import edilen tarih formatlama fonksiyonu; `formatDate(o.created_at, lang)` çağrılır
  - `Routes` — outer scope'tan gelen route nesnesi; `Routes.account.orderDetail(o.id)` ile sipariş detay URL'i oluşturulur
  - `router` — `useRouter()` hook'undan gelen Next.js router nesnesi; `router.push(...)` ile navigasyon yapılır
  - `t` — i18n çeviri fonksiyonu; `t('account.overview.orderNumber', { code })` çağrılır
  - `activeShipStatusBadge` — outer scope'tan gelen fonksiyon; `getShipStatus(o)` sonucunu badge'e dönüştürür
  - `getShipStatus` — outer scope'tan gelen fonksiyon; sipariş satırından durum stringi çıkarır
  - `Package` — import edilen ikon bileşeni; sipariş kart ikonu olarak render edilir
- **Dönüş**: JSX `<div>` — sipariş kartı; sipariş numarası, tutar, tarih, durum rozeti ve detay butonu içerir

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