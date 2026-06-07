---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: c6b06ca12f994aa7
entity_hashes:
  func:AccountOverviewPage: 6b4bb347d1256607
  overview: 666ec0a2df1ce43b
  style_tokens: 98f0536966ac7e31
generated_at: 2026-06-07T12:13:56Z
---

## Genel Bakış
AccountOverviewPage modülü, VentHub HVAC uygulamasında kullanıcıların kendi hesap özetlerine eriştiği ana dashboard sayfasıdır. Bu bileşen, kullanıcının profil bilgilerini, sipariş geçmişini, kargo durumlarını ve adreslerini tek bir merkezi arayüzde birleştirerek sunar. Hesap yönetimine dair temel bilgileri görselleştiren bu sayfa, kullanıcı deneyiminin odak noktalarından biridir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcının tüm hesap özetini oluşturup render eden ana React bileşenidir. Verileri (siparişler, adresler, istatistikler) sunucudan çeker, işler ve düzenli bir dashboard aracılığıyla kullanıcıya sunar.
- AccountOverviewPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi ve modül sabitleri sağlanmadığından, sadece fonksiyon imzası ve modül sabitlerinden türetilebilecek mimari varsayımlar sınırlıdır.

[Aksiyom 1]: Eğer React runtime ortamı (JSX/TSX render contexts) yoksa, bileşen render edilemez ve sayfa görüntülenemez olur.

[Aksiyom 2]: Eğer AccountOverviewPage bileşeni çağrıldığında üst bileşen zincirinde gerekli context provider'lar (oturum kimliği, tema, vb.) sağlanmıyorsa, bileşen içeresindeki hook çağrıları hata fırlatır ve bileşen çöker olur.

[Aksiyom 3]: Eğer hesap özet verilerini çeken taraf (API servisleri veya veri kaynakları) erişilebilir değilse, bileşen boş/yükleniyor durumunda kalır veya hata durumu gösterir olur.

---

**Not:** Bu modül için:
- Parametre yok (fonksiyon imzası: `AccountOverviewPage()`)
- Modül sabiti tanımlanmamış
- Fonksiyon gövdesi sağlanmadığı için iç mantık varsayımları üretilememektedir

Gerekli mimari varsayımların tamamı için **fonksiyon gövdesinin** incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### AccountOverviewPage
**Ne yapar**: Üye hesap özetini gösteren ana React bileşenidir. Kullanıcının kişisel bilgilerini, adreslerini, sipariş istatistiklerini ve aktif kargo durumunu çekerek interaktif bir kontrol paneli oluşturur.
**Nasıl yapar**: `useEffect` hook'u ile asenkron veri yükleme yapar. `supabase` üzerinden kullanıcının adreslerini ve siparişlerini çeker. Sipariş verileri ile toplam hacim, aktif sipariş sayısı ve teslim edilen sipariş sayısı gibi istatistikleri hesaplar. Aktif siparişin kargo durumunu belirleyerek dinamik bir arayüz ve ilerleme çubuğu sunar. Tüm bu verileri kullanarak selamlaşma kutusu, metrik kartları, kargo takibi widget'ı, son siparişler listesi ve adres/güvenlik kartlarından oluşan bir "bento grid" layout'u render eder.
**Parametreler**: Parametre almaz (React fonksiyonel bileşeni).
**Dönüş**: `JSX.Element` - Üyenin hesap özetini gösteren tam sayfa yapısı.

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

### [N1_NASIL] AST Pointer: `AccountOverviewPage.tsx`::useEffectCallback
- **params**: () — React useEffect callback parametresiz
- **ic_degiskenler**:
  - `mounted` — boolean bayrak, bileşen hâlâ takılıysa state güncellemelerine izin verir; temizleme fonksiyonunda `false` yapılır
  - `load` — asenkron veri yükleme fonksiyonu tanımı, içinde adres ve sipariş verilerini çeker
  - Return temizleme fonksiyonu `() => { mounted = false }` — bileşen unmount edildiğinde mounted'i false yapar
- **Dönüş**: Temizleme fonksiyonu `() => void` (unmount cleanup)

### [N2_NASIL] AST Pointer: `AccountOverviewPage.tsx`::load
- **params**: () — parametresiz async fonksiyon
- **ic_degiskenler**:
  - `user` — useAuth hook'tan gelen kullanıcı nesnesi; `user.id` ile sipariş filtrelemesi yapılır, `user` null ise fonksiyon erken döner
  - `setLoading` — React state setter, yükleme durumunutrue/false yapar
  - `setAddresses` — React state setter, adres listesini günceller
  - `setOrders` — React state setter, sipariş listesini günceller
  - `addrData` — `listAddresses(supabase)` çağrısının dönüş değeri, `UserAddress[]` dizisi; başarılı sorgulama sonrası adresleri tutar
  - `orderData` — `ShipmentRecord[]` tipinde dizi, sipariş verilerini biriktirir; başlangıçta boş dizi
  - `data` — Supabase sorgusunun success durumundaki ham veri (`venthub_orders` tablosu satırları)
  - `error` — Supabase sorgusunun hata nesnesi; `(error as { code: string }).code` ile `PGRST100` kontrolü yapılır
  - `supabase.from('venthub_orders').select('id, created_at, total_amount, status, order_number, carrier, tracking_number, shipped_at, delivered_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)` — birincil sipariş sorgusu, tüm alanları çeker
  - `fallback` — birincil sorgu hata verdiğinde alternatif sorgu sonucu; daha az alanla (`id, created_at, total_amount, status, order_number`) çalışır
  - `fallback.data` — fallback sorgusunun ham verisi, `Record<string, unknown>[]` olarak gelir
  - `d` — fallback.data map içindeki her bir satır kaydı; spread edilip eksik alanlar (`carrier`, `tracking_number`, `shipped_at`, `delivered_at`) `null` ile doldurulur
  - `e` — dış try-catch'te yakalanan hata, `console.error('Overview load error', e)` ile loglanır
- **Dönüş**: void (yan etki: state'leri günceller — `setAddresses`, `setOrders`, `setLoading`)

### [N3_NASIL] AST Pointer: `AccountOverviewPage.tsx`::fallbackMapCallback
- **params**: (`d` — `Record<string, unknown>`, fallback sorgusundan gelen tek bir sipariş satırı)
- **ic_degiskenler**:
  - `d` — Ham ham veri nesnesi; `...d` spread edilerek mevcut alanlar korunur ve eksik alanlar `null` ile eklenir
- **Dönüş**: `ShipmentRecord` — orijinal alanlara ek olarak `carrier: null`, `tracking_number: null`, `shipped_at: null`, `delivered_at: null` eklenmiş nesne

### [N4_NASIL] AST Pointer: `AccountOverviewPage.tsx`::getShipStatus
- **params**: (`row?: ShipmentRecord` — opsiyonel sipariş kaydı)
- **ic_degiskenler**:
  - `row` — opsiyonel ShipmentRecord parametresi; null/undefined ise `'preparing'` döner
- **Mantıksal Akış**:
  - `row.delivered_at` truthy veya `row.status.toLowerCase() === 'delivered'` → `'delivered'`
  - `row.shipped_at` truthy veya `row.tracking_number` truthy veya `row.status.toLowerCase() === 'shipped'` → `'shipped'`
  - Hiçbiri eşleşmezse → `'preparing'`
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'`

### [N5_NASIL] AST Pointer: `AccountOverviewPage.tsx`::activeShipStatusBadge
- **params**: (`status` — `'delivered' | 'shipped' | 'preparing'`, sipariş durumu)
- **ic_degiskenler**:
  - Yok; doğrudan switch ile JSX döner
- **Kullanılan Import Bileşenleri**:
  - `CheckCircle` — teslim edildi ikonu (green badge içinde)
  - `Truck` — kargoda ikonu (purple badge içinde)
  - `Clock` — hazırlanıyor ikonu (amber badge içinde)
- **Dönüş**: JSX `<span>` elementi — duruma göre renkli badge (bg-green-500/10, bg-purple-500/10, bg-amber-500/10)

### [N6_NASIL] AST Pointer: `AccountOverviewPage.tsx`::getShipIndex
- **params**: (`status` — `'delivered' | 'shipped' | 'preparing'`, sipariş durumu)
- **ic_degiskenler**:
  - Yok; doğrudan koşullu return
- **Dönüş**: `number` — `'delivered'` → 2, `'shipped'` → 1, diğer → 0

### [N7_NASIL] AST Pointer: `AccountOverviewPage.tsx`::shipStepMapCallback
- **params**: (`step` — adım nesnesi `{ key, icon, label }`, `idx` — dizin indeksi)
- **ic_degiskenler**:
  - `active` — `boolean`, `idx <= activeStepIdx` ile hesaplanır; bu adımın aktif/pasif durumunu belirler
  - `StepIcon` — `step.icon` referansı, adımın ikon bileşeni; `<StepIcon size={20} />` olarak render edilir
- **Kullanılan Dış Değişkenler**:
  - `activeStepIdx` — componente ait state, hangi adıma kadar ilerlendiğini tutar
  - `shipSteps` — adım dizisi, `.length - 1` ile son adım kontrolü yapılır
- **Dönüş**: `JSX.Element` — `<React.Fragment>` içinde adım ikonu + bağlantı çizgisi (adım arası progress bar)

### [N8_NASIL] AST Pointer: `AccountOverviewPage.tsx`::orderItemMapCallback
- **params**: (`o` — `ShipmentRecord`, tek bir sipariş kaydı)
- **ic_degiskenler**:
  - `isDelivered` — `boolean`, `o.status.toLowerCase() === 'delivered'` kontrolü; ikon ve kart rengini belirler
  - `code` — `string`, sipariş kodu formatı; `o.order_number` varsa `#${o.order_number.split('-')[1]}`, yoksa `#${o.id.slice(-8).toUpperCase()}`
- **Kullanılan Dış Değişkenler**:
  - `formatCurrency` — import edilen para birimi formatlama fonksiyonu; `formatCurrency(Number(o.total_amount), lang, { maximumFractionDigits: 0 })` çağrılır
  - `formatDate` — import edilen tarih formatlama fonksiyonu; `formatDate(o.created_at, lang)` çağrılır
  - `lang` — dil ayarı, format fonksiyonlarına parametre olarak verilir
  - `Routes.account.orderDetail(o.id)` — sipariş detay sayfası URL'si; hem `<Link href>` hem `router.push()` içinde kullanılır
  - `router` — Next.js router, `router.push()` ile navigasyon yapılır
  - `activeShipStatusBadge` — durum badge'ini render eden fonksiyon; `activeShipStatusBadge(getShipStatus(o))` çağrılır
  - `getShipStatus` — sipariş durumunu belirleyen fonksiyon; `getShipStatus(o)` çağrılır
- **Kullanılan Import Bileşenleri**:
  - `Package` — sipariş ikonu; `isDelivered` durumuna göre renk değişir
  - `Calendar` — tarih ikonu, sipariş tarihi yanında gösterilir
  - `Link` — Next.js link bileşeni, sipariş detayına tıklanabilir başlık oluşturur
  - `ArrowRight` — sağ ok ikonu, buton içinde navigasyon tetikler
- **Dönüş**: `JSX.Element` — sipariş kartı `<div>`, içinde ikon + sipariş kodu + tutar + tarih + durum badge'i + navigasyon butonu

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