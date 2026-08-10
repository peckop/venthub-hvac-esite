---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: 2d09cdf9752740aa
entity_hashes:
  func:AccountShipmentsPage: 1db7c37db50f9af1
  overview: b5a4627ef1ed88f1
  style_tokens: 0076231c43efae4d
generated_at: 2026-06-19T20:49:10Z
---

## Genel Bakış
VentHub HVAC projesinin hesap yönetimi modülü bünyesinde yer alan bu bileşen, kullanıcının kendi sevkiyat ve kargo bilgilerini görüntüleyebildiği tek sayfalık bir arayüz sağlar. Supabase veritabanından sipariş verilerini çekerek kargo durumlarına göre filtreleme ve görsel gösterim yapar. Bileşen, kullanıcının oturum durumunu ve dil tercihini bağımlılıklarından alarak sayfayı buna göre yapılandırır.

## Fonksiyon Grupları

### Sayfa Yapısı ve Yönlendirme
Sayfanın temel altyapısını ve rota yapısını oluşturarak, kullanıcının hesap section'u altında doğru konumda render edilmesini sağlar. Oturum kontrolü ve sayfa yönlendirme mantığını barındırır.

- AccountShipmentsPage

### Veri Yönetimi ve İş Mantığı
Supabase bağlantısı üzerinden kullanıcının siparişlerini çeker, kargo durumuna göre filtreleme ve veri işleme adımlarını yönetir.

- AccountShipmentsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, fonksiyon imzası ve sabitler incelenerek çıkarılabilecek mimari varsayımlar açısından sınırlı bilgi içermektedir.

**[Aksiyom 1]:** Fonksiyon imzasında parametre tanımı yoksa, bileşen props aracılığıyla dış veri almaz veya veri kaynakları tamamen iç bileşen hiyerarşisi/state yönetiminden beslenir.

---

**Not:** Fonksiyon gövdesi kodu sağlanmadığı için, veri çekme mekanizması, state yönetimi, hata yönetimi veya bağımlılıklar hakkında somut aksiyom üretilememektedir. Mevcut bilgi (fonksiyon imzası + modül sabitleri) yalnızca yukarıdaki çıkarımı desteklemektedir.

---

## FONKSİYON DETAYLARI

### AccountShipmentsPage

**Ne yapar**: Kullanıcının siparişlerine ait kargo bilgilerini ve takip süreçlerini gösteren React bileşenidir. Kullanıcı oturum açmış hesabındaki tüm kargolanmış siparişleri listeler, filtreleme imkanı sunar ve her sipariş için kargo durumu, takip numarası, takip bağlantısı gibi bilgileri görsel olarak sunar.

**Nasıl yapar**: Bileşen ilk olarak useAuth hook'uyla mevcut kullanıcıyı alır ve Supabase veritabanından `venthub_orders` tablosunu sorgular. Sorguda shipping kolonları bulunamadığında (400 hatası) fallback bir sorgu ile temel alanları çeker ve eksik alanları null olarak doldurur. Gelen verileri `ShipmentRow` tipine dönüştürür ve herhangi bir kargo bilgisi içerenleri filtreler. Bileşen duruma göre üç ana görünüm sunar: yükleniyor spinner'ı, boş durum kartı veya kargo listesi. Her kargo kartı içinde stepler (hazırlanıyor → kargoda → teslim edildi) ve detay bilgileri gösterilir.

**Parametreler**:

Bu bileşen parametre almaz — tüm verileri iç state ve Supabase sorgularından sağlar.

**Dönüş**: `JSX.Element` — Kullanıcının kargo bilgilerini gösteren tam sayfa düzenle

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: ../../i18n/format::formatCurrency
- import: @/lib/supabase/client::supabaseBrowserClient
- import: lucide-react::CheckCircle
- import: lucide-react::Clock
- import: lucide-react::Copy
- import: lucide-react::ExternalLink
- import: lucide-react::MapPin
- import: lucide-react::Package
- import: lucide-react::Truck
- import: next/navigation::useRouter
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### ShipmentRow
- `id: string`
- `created_at: string`
- `order_number: string`
- `total_amount: number | string`
- `status: string`
- `carrier: string | null`
- `tracking_number: string | null`
- `tracking_url: string | null`
- `shipped_at: string | null`
- `delivered_at: string | null`

### SupabaseError
- `code?: string`
- `status?: number`
- `message?: string`

---

## TYPE ALIASES

### ShipFilter
```typescript
type ShipFilter = 'all' | 'shipped' | 'delivered'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AccountShipmentsPage.tsx::AccountShipmentsPage
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — Asenkron operasyonların bileşen mounted iken çalışıp çalışmadığını takip eder, temizleme fonksiyonunda false yapılır
- **Dönüş**: Cleanup fonksiyonu döndürür (mounted'ı false yapar)

### [N2_NASIL] AST Pointer: AccountShipmentsPage.tsx::load
- **params**: ()
- **ic_degiskenler**:
  - `baseSelect` — Supabase sorgusunda seçilecek kolonların listesi (string)
  - `data` — Supabase'den gelen ham sipariş verisi (ShipmentRow[] veya null)
  - `error` — Supabase sorgusu hata dönerse hata nesnesi
  - `fallback` — Ana sorgu 400/PGRST100 hatası verdiğinde kullanılan yedek sorgu sonucu
  - `items` — Sipariş verisi, order_number yoksa id ile doldurulmuş hali
  - `filtered` — Kargo bilgisi olan (carrier, tracking_number, tracking_url, shipped_at, delivered_at alanlarından en az biri dolu) siparişler
- **Dönüş**: yok (state setter'ları çağırarak UI'ı günceller)

### [N3_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatDate
- **params**: (d?: string | null)
- **ic_degiskenler**: (yok)
- **Dönüş**: Formatlanmış tarih stringi veya '-'

### [N4_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatPrice
- **params**: (price: number | string)
- **ic_degiskenler**:
  - `n` — price değerinin number karşılığı, dönüşemezse 0
- **Dönüş**: Formatlanmış para birimi stringi

### [N5_NASIL] AST Pointer: AccountShipmentsPage.tsx::handleCopy
- **params**: (text?: string | null)
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void> (clipboard.writeText ile asenkron)

### [N6_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatus
- **params**: (row: ShipmentRow)
- **ic_degiskenler**: (yok)
- **Dönüş**: 'delivered' | 'shipped' | 'preparing'

### [N7_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatusBadge
- **params**: (status: 'delivered' | 'shipped' | 'preparing')
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX span elementi (badge)

### [N8_NASIL] AST Pointer: AccountShipmentsPage.tsx::getStepIndex
- **params**: (status: 'delivered' | 'shipped' | 'preparing')
- **ic_degiskenler**: (yok)
- **Dönüş**: number (0, 1 veya 2)

### [N9_NASIL] AST Pointer: AccountShipmentsPage.tsx::filterOrders
- **params**: (r: ShipmentRow)
- **ic_degiskenler**:
  - `s` — Satırın kargo durumu ('delivered', 'shipped' veya 'preparing')
- **Dönüş**: boolean (filtreye uygunsa true)

### [N10_NASIL] AST Pointer: AccountShipmentsPage.tsx::renderFilterButton
- **params**: (opt: {value: string, label: string})
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX button elementi

### [N11_NASIL] AST Pointer: AccountShipmentsPage.tsx::renderOrderCard
- **params**: (o: ShipmentRow)
- **ic_degiskenler**:
  - `shipStatus` — Siparişin kargo durumu (getShipStatus çağrısıyla)
  - `activeStepIdx` — Aktif adım indeksi (getStepIndex çağrısıyla)
  - `orderCode` — Görüntülenecek sipariş kodu (o.order_number son parçası veya o.id'nin son 8 karakteri)
- **Dönüş**: JSX div elementi (sipariş kartı)

### [N12_NASIL] AST Pointer: AccountShipmentsPage.tsx::renderStep
- **params**: (step: {key: string, icon: Component, label: string}, idx: number)
- **ic_degiskenler**:
  - `active` — Bu adımın aktif olup olmadığı (idx <= activeStepIdx)
  - `StepIcon` — Adımın ikonu (step.icon)
- **Dönüş**: JSX fragment (adım göstergesi)

---

## NODE ID STANDARD

  file: src\views\account\AccountShipmentsPage.tsx
  function: src\views\account\AccountShipmentsPage.tsx::AccountShipmentsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountShipmentsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-amber-50`, `bg-green-50`, `bg-primary-navy`, `bg-primary-navy/5`, `bg-purple-50`, `bg-slate-200`, `bg-slate-50`, `bg-slate-50/50`, `bg-slate-50/80`, `bg-white`, `border-amber-200`, `border-b`, `border-b-2`, `border-green-200`, `border-primary-navy`
- **Layout:** `block`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1.5`, `gap-2`, `gap-3`, `grid`, `grid-cols-1`, `h-1`, `h-10`, `h-11`, `h-16`, `h-3.5`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${active`, `${activeStepIdx`, `${filter`, `1`, `:`, `===`, `>=`, `animate-spin`, `border`, `break-all`, `font-bold`, `font-medium`, `hover:scale-102`, `hover:underline`, `idx`