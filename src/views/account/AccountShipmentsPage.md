---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: 764fc176dff7e29a
entity_hashes:
  func:AccountShipmentsPage: bc07b3dabd4c38e0
  overview: ca709958064b6e53
  style_tokens: 0076231c43efae4d
generated_at: 2026-06-14T17:24:38Z
---

## Genel Bakış
VentHub HVAC projesinin hesap yönetimi modülüne ait, kullanıcıların kendi sevkiyat ve kargo bilgilerini görüntüleyebildiği tek sayfalık bir arayüz bileşenidir. Modül, hesap section altında yer alan sevkiyatlar sayfasının ana giriş noktasını oluşturarak kullanıcıya ilgili verileri sunar.

## Fonksiyon Grupları
### Sayfa Bileşeni
Hesap gönderileri sayfasının tüm arayüz yapısını ve temel altyapısını oluşturan ana bileşendir.
- AccountShipmentsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hesap yönetimi altındaki sevkiyatlar sayfasını oluşturan bir React fonksiyonel bileşenidir. Fonksiyon gövdesi kodu sağlanmadığından, mimari varsayımlar yalnızca fonksiyon imzası ve yapısal bağlam temelinde çıkarılmıştır.

**[Aksiyom 1]:** Eğer React çalışma ortamı (React context/provider zinciri) mevcut değilse, bileşen挂钩 (hooks) kullanamaz ve hata fırlatır.

**[Aksiyom 2]:** Eğer bileşen bir hesap (account) route yapısı altında render edilmiyorsa, ilgili layout ve navigasyon bileşenleri tarafından sarmalanmamış olur ve sayfa yapısı tutarsız çalışır.

**[Aksiyom 3]:** Eğer kullanıcı oturum açmamış (authenticated) değilse, bileşen sevkiyat verilerini getiremez veya boş/uygunsuz durum gösterir.

---

## FONKSİYON DETAYLARI

### AccountShipmentsPage

**Ne yapar**: Kullanıcının kargo takibi yapabileceği sipariş gönderim sayfasını render eden React fonksiyonel bileşenidir. Supabase veritabanından kullanıcının siparişlerini çeker, kargo durumuna göre filtreleme ve görsel gösterim sağlar.

**Nasıl yapar**: `useAuth` hook'u ile mevcut kullanıcıyı, `useI18n` hook'u ile çeviri fonksiyonunu ve dil bilgisini, `useRouter` hook'u ile yönlendirme nesnesini alır. `useState` ile satır verileri, yükleme durumu ve filtre seçimi için state'ler tutar. `useEffect` içinde asenkron bir `load` fonksiyonu çalıştırarak Supabase'den `venthub_orders` tablosundan kullanıcının siparişlerini çeker. Veritabanında kargo kolonları henüz yoksa (PGRST100/400 hatası) fallback bir sorgu ile temel alanları getirip eksik kargo alanlarını null olarak doldurur. Sadece kargo bilgisi olan siparişleri filtreler. Sayfa, yükleme durumuna göre spinner, boş duruma göre bilgilendirme kartı veya dolu duruma göre kart listesi ile render olur. Her sipariş kartında kargo durum badge'i, ilerleme adımları (preparing/shipped/delivered), kargo firması, takip numarası, takip linki, kargoya verilme ve teslim tarihi detayları gösterilir.

**Parametreler**:
Bu bileşen parametre almaz — props'suz bir React fonksiyonel bileşenidir.

**Dönüş**: `JSX.Element` — Kullanıcının kargo takibi yapabileceği tam sayfa görünümü.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: ../../i18n/format::formatCurrency
- import: ../../utils/routes::Routes
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

### [N1_NASIL] AccountShipmentsPage::AccountShipmentsPage
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `mounted` — component unmount kontrolü için bayrak
  - `setLoading` — loading state güncelleme fonksiyonu
  - `user` — useAuth hook'undan gelen kullanıcı bilgisi
  - `setRows` — sipariş satırlarını state'e yazan fonksiyon
  - `supabase` — Supabase istemci nesnesi
  - `toast` — bildirim gösterme fonksiyonu
  - `t` — çeviri fonksiyonu
  - `formatOnlyDate` — tarih formatlama fonksiyonu
  - `formatCurrency` — para birimi formatlama fonksiyonu
  - `router` — Next.js yönlendirme nesnesi
- **Dönüş**: React bileşeni (JSX)

### [N1_NASIL] AccountShipmentsPage::load
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `setLoading` — loading state güncelleme fonksiyonu
  - `baseSelect` — Supabase select sorgusu için kolon listesi
  - `user?.id` — mevcut kullanıcının ID'si
  - `data` — Supabase'den dönen veri dizisi
  - `error` — Supabase hatası
  - `fallback` — hata durumunda yapılan yedek sorgu sonucu
  - `items` — ham veriyi işlenmiş ShipmentRow formatına dönüştüren dizi
  - `filtered` — kargo bilgisi olan siparişleri filtreleyen dizi
  - `e` — yakalanan hata nesnesi
- **Dönüş**: void (yan etki: setRows ile rows state'ini günceller)

### [N2_NASIL] AccountShipmentsPage::formatDate
- **params**: (d?: string | null)
- **ic_degiskenler**: (yok)
- **Dönüş**: string — formatlanmış tarih veya '-' karakteri

### [N3_NASIL] AccountShipmentsPage::formatPrice
- **params**: (price: number | string)
- **ic_degiskenler**:
  - `n` — price değerini sayıya dönüştüren değişken
- **Dönüş**: string — formatlanmış para birimi

### [N4_NASIL] AccountShipmentsPage::handleCopy
- **params**: (text?: string | null)
- **ic_degiskenler**: (yok)
- **Dönüş**: Promise<void> (yan etki: clipboard'a yazar ve toast bildirimi gösterir)

### [N5_NASIL] AccountShipmentsPage::getShipStatus
- **params**: (row: ShipmentRow)
- **ic_degiskenler**: (yok)
- **Dönüş**: 'delivered' | 'shipped' | 'preparing'

### [N6_NASIL] AccountShipmentsPage::getShipStatusBadge
- **params**: (status: 'delivered' | 'shipped' | 'preparing')
- **ic_degiskenler**:
  - `CheckCircle` — lucide-react'ten gelen teslim edildi ikonu
  - `Truck` — lucide-react'ten gelen kargoya verildi ikonu
  - `Clock` — lucide-react'ten gelen hazırlanıyor ikonu
  - `t` — çeviri fonksiyonu
- **Dönüş**: JSX.Element — duruma göre renkli badge

### [N7_NASIL] AccountShipmentsPage::getStepIndex
- **params**: (status: 'delivered' | 'shipped' | 'preparing')
- **ic_degiskenler**: (yok)
- **Dönüş**: number — adım indeksi (2, 1 veya 0)

### [N8_NASIL] AccountShipmentsPage::filteredOrders
- **params**: (r) — ShipmentRow tipinde parametre
- **ic_degiskenler**:
  - `filter` — mevcut filtre durumu (state)
  - `getShipStatus` — sipariş durumunu döndüren fonksiyon
- **Dönüş**: boolean — sipariş filtreleniyorsa true

### [N9_NASIL] AccountShipmentsPage::renderFilterButton
- **params**: (opt) — filtre seçeneği nesnesi (value ve label içerir)
- **ic_degiskenler**:
  - `filter` — mevcut filtre durumu (state)
  - `setFilter` — filtre durumunu güncelleyen fonksiyon
  - `t` — çeviri fonksiyonu
- **Dönüş**: JSX.Element — filtre butonu

### [N10_NASIL] AccountShipmentsPage::renderOrderCard
- **params**: (o) — ShipmentRow tipinde sipariş nesnesi
- **ic_degiskenler**:
  - `getShipStatus` — sipariş durumunu döndüren fonksiyon
  - `getStepIndex` — adım indeksini döndüren fonksiyon
  - `orderCode` — sipariş kodu (formatlanmış)
  - `router` — Next.js yönlendirme nesnesi
  - `Routes` — rota sabitleri nesnesi
  - `formatDate` — tarih formatlama fonksiyonu
  - `formatPrice` — para birimi formatlama fonksiyonu
  - `shipSteps` — kargo adımları dizisi
  - `handleCopy` — kopyalama fonksiyonu
  - `t` — çeviri fonksiyonu
  - `activeStepIdx` — aktif adım indeksi
- **Dönüş**: JSX.Element — sipariş kartı

### [N11_NASIL] AccountShipmentsPage::renderStep
- **params**: (step, idx) — adım nesnesi ve indeks
- **ic_degiskenler**:
  - `activeStepIdx` — aktif adım indeksi (state)
  - `active` — adımın aktif olup olmadığı boolean
  - `StepIcon` — adım ikonu bileşeni
- **Dönüş**: JSX.Fragment — kargo adımı göstergesi

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