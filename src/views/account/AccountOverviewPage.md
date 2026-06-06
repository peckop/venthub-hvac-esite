---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: c6b06ca12f994aa7
entity_hashes:
  func:AccountOverviewPage: 5d6b23de15a52581
  overview: 666ec0a2df1ce43b
  style_tokens: 98f0536966ac7e31
generated_at: 2026-06-06T21:56:45Z
---

## Genel Bakış
AccountOverviewPage modülü, VentHub HVAC uygulamasında kullanıcıların kendi hesap özetlerine eriştiği ana dashboard sayfasıdır. Bu bileşen, kullanıcının profil bilgilerini, sipariş geçmişini, kargo durumlarını ve adreslerini tek bir merkezi arayüzde birleştirerek sunar. Hesap yönetimine dair temel bilgileri görselleştiren bu sayfa, kullanıcı deneyiminin odak noktalarından biridir.

## Fonksiyon Grupları
### Sayfa Bileşeni
Kullanıcının tüm hesap özetini oluşturup render eden ana React bileşenidir. Verileri (siparişler, adresler, istatistikler) sunucudan çeker, işler ve düzenli bir dashboard aracılığıyla kullanıcıya sunar.
- AccountOverviewPage

---



---

## FONKSİYON DETAYLARI

### AccountOverviewPage

**Ne yapar**: Kullanıcının hesap özet sayfasını渲染 eden ana React bileşenidir. Kullanıcının sipariş geçmişi, aktif kargo durumu, adres bilgileri ve istatistiklerini tek bir dashboard görünümünde sunar.

**Nasıl yapar**: Bileşen, `useAuth` hook'u ile oturum açmış kullanıcı bilgisini alır. `useEffect` içinde asenkron olarak kullanıcının adreslerini `listAddresses` fonksiyonu ile ve siparişlerini Supabase veritabanından `venthub_orders` tablosundan çeker. Sipariş çekerken hata durumunda fallback bir sorgu ile daha az alan döndürecek şekilde güvenli bir mekanizma uygular. Veriler yüklendiğinde istatistik hesaplamaları yaparak aktif sipariş sayısını, tamamlanan sipariş sayısını ve toplam hacmi hesaplar.

**Parametreler**:
- Parametre almaz (React fonksiyonel bileşeni)

**Dönüş**: JSX element döndürür — Loading durumunda spinner animasyonu, yükleme tamamlandığında dashboard kartları, kargo takip widget'ı, son siparişler listesi, adres kartı, güvenlik kartı ve destek kartı içeren tam bir sayfa düzeni döndürür.

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

### [N1_NASIL] AST Pointer: AccountOverviewPage.tsx::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — boolean flag, fonksiyon bileşenin mounted olup olmadığını takip eder, async işlemler için cleanup’ta kullanılır
  - `load` — async fonksiyon, verileri yüklemek için tanımlanır
- **Dönüş**: Cleanup fonksiyonu döner → `() => { mounted = false }`

### [N2_NASIL] AST Pointer: AccountOverviewPage.tsx::load
- **params**: (parametre yok, dış kapsamdan `user` değişkenini kullanır)
- **ic_degiskenler**:
  - `addrData` — `listAddresses()` çağrısından dönen adres verisi
  - `orderData` — `ShipmentRecord[]` tipinde sipariş verisi dizisi, başlangıçta boş dizi
  - `data` — supabase sorgusundan dönen ilk veri seti
  - `error` — supabase sorgusundan dönen hata nesnesi
  - `fallback` — hata durumunda alternatif supabase sorgusunun sonucu
- **Dönüş**: yok (state’leri günceller: `setLoading`, `setAddresses`, `setOrders`)

### [N3_NASIL] AST Pointer: AccountOverviewPage.tsx::mapFallbackOrder
- **params**: `d` — `Record<string, unknown>` tipinde tek bir sipariş satırı
- **ic_degiskenler**:
  - `...d` — spread operator ile tüm mevcut alanlar kopyalanır
  - `carrier` — null olarak atanır (fallback veri setinde yok)
  - `tracking_number` — null olarak atanır (fallback veri setinde yok)
  - `shipped_at` — null olarak atanır (fallback veri setinde yok)
  - `delivered_at` — null olarak atanır (fallback veri setinde yok)
- **Dönüş**: `ShipmentRecord` objesi

### [N4_NASIL] AST Pointer: AccountOverviewPage.tsx::getShipStatus
- **params**: `row` — `ShipmentRecord` tipinde (opsiyonel, undefined olabilir)
- **ic_degiskenler**:
  - `row.delivered_at` — teslim tarihi alanı, truthy ise `delivered` döner
  - `row.status` — sipariş durumu stringi, küçük harfe çevrilip karşılaştırılır
  - `row.shipped_at` — kargoya verilme tarihi, truthy ise `shipped` döner
  - `row.tracking_number` — kargo takip numarası, truthy ise `shipped` döner
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` string’i

### [N5_NASIL] AST Pointer: AccountOverviewPage.tsx::activeShipStatusBadge
- **params**: `status` — `'delivered' | 'shipped' | 'preparing'` union tipi
- **ic_degiskenler**:
  - `status` parametresi switch-case ile kontrol edilir
- **Dönüş**: JSX elementi (duruma göre renkli badge)

### [N6_NASIL] AST Pointer: AccountOverviewPage.tsx::stepToIdx
- **params**: `status` — `'delivered' | 'shipped' | 'preparing'` union tipi
- **ic_degiskenler**:
  - yok (sadece parametre kullanılır)
- **Dönüş**: `number` (0, 1 veya 2)

### [N7_NASIL] AST Pointer: AccountOverviewPage.tsx::renderShipStep
- **params**: `step` — tek bir adım objesi (icon, label, key alanları var), `idx` — adımın indeksi (number)
- **ic_degiskenler**:
  - `active` — `idx <= activeStepIdx` karşılaştırması ile hesaplanan boolean, adımın aktif olup olmadığını belirler
  - `StepIcon` — `step.icon` JSX bileşeni, adım ikonu
- **Dönüş**: JSX fragment’i (adım ikonu, etiketi ve bağlantı çizgisi)

### [N8_NASIL] AST Pointer: AccountOverviewPage.tsx::renderOrderItem
- **params**: `o` — tek bir sipariş objesi (`ShipmentRecord`)
- **ic_degiskenler**:
  - `isDelivered` — `o.status.toLowerCase() === 'delivered'` karşılaştırması ile hesaplanan boolean
  - `code` — sipariş kodu, `o.order_number` varsa `#${o.order_number.split('-')[1]}` formatında, yoksa `#${o.id.slice(-8).toUpperCase()}` formatında oluşturulur
  - `o.total_amount` — sipariş toplam tutarı, `Number()` ile number tipine dönüştürülür
  - `o.created_at` — sipariş oluşturma tarihi, `formatDate()` ile formatlanır
- **Dönüş**: JSX elementi (sipariş kartı)

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