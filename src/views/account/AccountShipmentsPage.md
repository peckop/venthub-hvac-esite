---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: a6b2836a33d1d2f3
entity_hashes:
  func:AccountShipmentsPage: 5e27d6f09820cccd
  overview: ed808775e9bb96cf
  style_tokens: 0076231c43efae4d
generated_at: 2026-08-26T07:15:55Z
---

## Genel Bakış
VentHub HVAC projesinin hesap yönetimi modülü bünyesinde yer alan bu bileşen, kullanıcının sevkiyat ve kargo bilgilerini görüntüleyebildiği tek sayfalık bir arayüz sağlar. Supabase veritabanından sipariş verilerini çekerek kargo durumlarına göre filtreleme ve görsel gösterim yapar. Bileşen, kullanıcının oturum durumunu ve dil tercihini bağımlılıklarından alarak sayfayı buna göre yapılandırır.

## Fonksiyon Grupları

### Sayfa Yapısı ve Veri Yönetimi
Kullanıcının siparişlerine ait kargo bilgilerini ve takip süreçlerini gösteren ana React bileşenidir. Sayfanın render edilmesi, veri çekilmesi ve kullanıcı etkileşimlerinin yönetilmesi bu tek bileşen tarafından gerçekleştirilir.

- AccountShipmentsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir; yalnızca `def AccountShipmentsPage()` imzası mevcuttur. Aksiyom üretimi yalnızca fonksiyon gövdesinden yapılır. Docstring'lerden, yorumlardan veya değişken isimlerinden bilgi çıkarılmaz.

---

## FONKSİYON DETAYLARI

### AccountShipmentsPage
**Ne yapar**: Kullanıcının siparişlerine ait kargo takip bilgilerini listeleyen, filtreleyen ve görsel olarak adım adım (stepper) sunan bir React sayfa bileşenidir. Kullanıcının tüm kargolanmış siparişlerini durumlarına göre filtreleyebilmesini, kargo firması, takip numarası, takip bağlantısı, kargoya verilme tarihi ve teslim tarihi gibi detayları görüntülemesini sağlar.

**Nasıl yapar**: Bileşen, `useAuth` hook'u ile giriş yapmış kullanıcıyı, `useI18n` ile uluslararasılaştırma fonksiyonlarını ve dil bilgisini, `useRouter` ile yönlendirme işlevselliğini, `useLocalizedRoutes` ile lokalize edilmiş rotaları alır. Üç state yönetir: `rows` (kargo satırları), `loading` (yükleniyor durumu) ve `filter` (aktif filtre: 'all', 'shipped', 'delivered'). `useEffect` içinde asenkron `load` fonksiyonu tanımlanmıştır; bu fonksiyon Supabase'den `venthub_orders` tablosundan kargo ile ilgili kolonları (`carrier`, `tracking_number`, `tracking_url`, `shipped_at`, `delivered_at` dahil) çeker. Eğer sorgu `PGRST100` hata kodu veya 400 durum kodu dönerse (üretim veritabanında henüz kargo kolonları bulunmaması durumunda), daha az kolon seçen bir fallback sorgu çalıştırılır ve eksik kargo alanları `null` olarak eklenir. Yüklenen veriler, yalnızca kargo bilgisi bulunan siparişlerle filtrelenir. `mounted` değişkeni ile bileşen unmount edildikten sonra state güncellemesi engellenir. `formatDate` fonksiyonu tarih dizelerini `formatOnlyDate` ile biçimlendirir; `formatPrice` fonksiyonu fiyatı `formatCurrency` ile para birimi formatına çevirir. `handleCopy` fonksiyonu panoya metin kopyalar. `getShipStatus` fonksiyonu bir siparişin kargo durumunu (`delivered`, `shipped`, `preparing`) belirler. `getShipStatusBadge` fonksiyonu duruma göre renkli ve ikonlu bir badge JSX'i döndürür. `shipSteps` dizisi üç aşamalı (hazırlanıyor, kargoya verildi, teslim edildi) stepper'ın adımlarını tanımlar. `getStepIndex` fonksiyonu duruma göre aktif adım indeksini döndürür. `displayed` dizisi aktif filtreye uygun satırları içerir. Yükleniyor durumunda spinner gösterilir. Sipariş yoksa boş durum ekranı, filtre eşleşmesi yoksa bilgi mesajı, aksi halde her sipariş için kart yapısında kargo detayları (firma, takip numarası, takip linki, kargoya verilme tarihi, teslim tarihi) ve adım göstergesi render edilir.

**Parametreler**:
- Bu fonksiyon parametre almaz; React fonksiyonel bileşeni olarak tanımlanmıştır.

**Dönüş**: Return tipi kaynak kodda açıkça belirtilmemiştir; bilinmiyor. Bileşen, yükleniyor durumunda bir spinner, boş durumda bilgilendirme kartı, filtre eşleşmesi yoksa mesaj, aksi halde kargo kartlarının listesini içeren JSX yapısı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/currency::SYSTEM_CURRENCY
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
- **params**: yok
- **ic_degiskenler**:
  - `mounted` — bileşen hâlâ DOM'da mı bilgisini tutan boolean; cleanup fonksiyonu kapatıldığında `false` yapılır
- **Dönüş**: cleanup fonksiyonu (`mounted = false` yapan)

---

### [N2_NASIL] AST Pointer: AccountShipmentsPage.tsx::load
- **params**: yok (closure değişkenleri kullanır)
- **ic_degiskenler**:
  - `baseSelect` — Supabase sorgusunda kullanılacak kolon listesi string'i (`id, created_at, total_amount, status, order_number, carrier, tracking_number, tracking_url, shipped_at, delivered_at`)
  - `data` — Supabase `.select()` sorgusundan dönen sipariş dizisi; hata durumunda fallback ile üzerine yazılır
  - `error` — Supabase sorgusundan dönen hata nesnesi; `PGRST100` veya `status === 400` ise fallback tetiklenir
  - `fallback` — prod DB'de shipping kolonları yoksa yapılan alternatif Supabase sorgusu sonucu (`data` ve `error` alanları)
  - `items` — `data` dizisinin her elemanına `order_number` fallback (`item.order_number || item.id`) uygulanmış hali, `ShipmentRow[]` tipinde
  - `filtered` — `items` dizisinde `carrier`, `tracking_number`, `tracking_url`, `shipped_at` veya `delivered_at` alanlarından en az birine sahip siparişlerin filtelenmiş hali
  - `e` — catch bloğunda yakalanan hata nesnesi; konsola yazılır ve kullanıcıya toast gösterilir
- **closure_degiskenler**: `setLoading`, `user`, `supabase`, `t`, `setRows`, `mounted`
- **Dönüş**: yok (yan etki: `setRows(filtered)` çağrısı ile state güncellenir, `setLoading` ile yükleme durumu yönetilir)

---

### [N3_NASIL] AST Pointer: AccountShipmentsPage.tsx::(fallback mapping)
- **params**: `item` — Supabase'den gelen tek sipariş nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `item` nesnesinin spread edilmiş hali artı `carrier`, `tracking_number`, `tracking_url`, `shipped_at`, `delivered_at` alanları `null` olarak atanmış yeni nesne

---

### [N4_NASIL] AST Pointer: AccountShipmentsPage.tsx::(order_number mapping)
- **params**: `item` — sipariş nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `item` nesnesinin spread edilmiş hali artı `order_number` alanı; mevcut `item.order_number` falsy ise `item.id` değeri kullanılır

---

### [N5_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatDate
- **params**: `d` — tarih string'i (`string | null | undefined`)
- **ic_degiskenler**: yok
- **closure_degiskenler**: `formatOnlyDate` (i18n/datetime'dan gelen formatDate), `lang` (mevcut dil)
- **Dönüş**: string — `d` falsy ise `'-'`, aksi halde `formatOnlyDate(d, lang)` sonucu

---

### [N6_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatPrice
- **params**: `price` — fiyat değeri (`number | string`)
- **ic_degiskenler**:
  - `n` — `Number(price)` sonucu; dönüşüm başarısızsa `0` kullanılır
- **closure_degiskenler**: `formatCurrency` (i18n/format), `lang` (mevcut dil), `SYSTEM_CURRENCY` (para birimi sabiti)
- **Dönüş**: string — `formatCurrency(n, lang, { currency: SYSTEM_CURRENCY, maximumFractionDigits: 0 })` sonucu

---

### [N7_NASIL] AST Pointer: AccountShipmentsPage.tsx::handleCopy
- **params**: `text` — kopyalanacak metin (`string | null | undefined`)
- **ic_degiskenler**: yok
- **closure_degiskenler**: `t` (çeviri fonksiyonu), `toast` (sonner bildirim)
- **Dönüş**: yok (yan etki: `navigator.clipboard.writeText(text)` ile panoya kopyalama; başarılıysa `toast.success`, başarısızsa `toast.error`)

---

### [N8_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatus
- **params**: `row` — `ShipmentRow` tipinde sipariş nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` — `row.delivered_at` varsa `'delivered'`, `row.shipped_at` veya `row.tracking_number` varsa `'shipped'`, diğer durumda `'preparing'`

---

### [N9_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatusBadge
- **params**: `status` — kargo durumu (`'delivered' | 'shipped' | 'preparing'`)
- **ic_degiskenler**: yok
- **closure_degiskenler**: `t` (çeviri fonksiyonu)
- **Dönüş**: JSX — duruma göre renkli ve ikonlu `<span>` elementi; `'delivered'` için yeşil `CheckCircle`, `'shipped'` için mor `Truck`, `'preparing'` için amber `Clock` ikonu

---

### [N10_NASIL] AST Pointer: AccountShipmentsPage.tsx::getStepIndex
- **params**: `status` — kargo durumu (`'delivered' | 'shipped' | 'preparing'`)
- **ic_degiskenler**: yok
- **Dönüş**: `number` — `'delivered'` ise `2`, `'shipped'` ise `1`, `'preparing'` ise `0`

---

### [N11_NASIL] AST Pointer: AccountShipmentsPage.tsx::(filter fonksiyonu)
- **params**: `r` — satır nesnesi (ShipmentRow)
- **ic_degiskenler**:
  - `s` — `getShipStatus(r)` sonucu; siparişin kargo durumunu belirler
- **closure_degiskenler**: `filter` (aktif filtre durumu), `getShipStatus`
- **Dönüş**: `boolean` — `filter === 'all'` ise her zaman `true`, aksi halde `s === filter` sonucu

---

### [N12_NASIL] AST Pointer: AccountShipmentsPage.tsx::(filter button render)
- **params**: `opt` — filtre seçeneği nesnesi (`value` ve `label` alanları)
- **ic_degiskenler**: yok
- **closure_degiskenler**: `filter` (aktif filtre durumu), `setFilter` (filtre state setter)
- **Dönüş**: JSX — `<button>` elementi; `filter === opt.value` ise aktif stil (navy arka plan, beyaz metin), değilse pasif stil (beyaz arka plan, slate metin)

---

### [N13_NASIL] AST Pointer: AccountShipmentsPage.tsx::(sipariş kartı render)
- **params**: `o` — `ShipmentRow` tipinde sipariş nesnesi
- **ic_degiskenler**:
  - `shipStatus` — `getShipStatus(o)` sonucu; siparişin kargo durumu
  - `activeStepIdx` — `getStepIndex(shipStatus)` sonucu; stepper'da aktif adım indeksi
  - `orderCode` — sipariş kodu string'i; `o.order_number` varsa son parçası `#` ile, yoksa `o.id`'nin son 8 karakteri büyük harfle
- **closure_degiskenler**: `getShipStatus`, `getStepIndex`, `router` (Next.js router), `Routes` (yol sabitleri), `t` (çeviri), `formatDate`, `formatPrice`, `getShipStatusBadge`, `handleCopy`, `shipSteps` (stepper adım dizisi)
- **Dönüş**: JSX — sipariş kartı; üstte başlık ve durum badge'i, ortada kargo ilerleme stepper'ı, altta kargo firması, takip numarası (kopyalama butonu ile), takip linki, kargoya verilme tarihi ve teslim tarihi bilgileri

---

### [N14_NASIL] AST Pointer: AccountShipmentsPage.tsx::(stepper adım render)
- **params**: `step` — adım nesnesi (`key`, `icon`, `label` alanları), `idx` — adım indeks numarası
- **ic_degiskenler**:
  - `active` — `idx <= activeStepIdx` sonucu; adımın aktif olup olmadığını belirler
  - `StepIcon` — `step.icon` bileşeni; adımın ikonu
- **closure_degiskenler**: `activeStepIdx` (aktif adım indeksi), `shipSteps` (adım dizisi, `length` kontrolü için), `React` (Fragment için)
- **Dönüş**: JSX — `<React.Fragment>` içinde yuvarlak ikon kutusu ve adım etiketi; son adım değilse araya renkli/beyaz çizgi; aktif adımlar navy renkte, pasif adımlar slate renkte

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