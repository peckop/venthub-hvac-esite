---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountOverviewPage.tsx
skeleton_hash: bd8655db740d4e93
entity_hashes:
  func:AccountOverviewPage: 5d6b23de15a52581
  overview: 9631e42766ab0678
  style_tokens: 98f0536966ac7e31
generated_at: 2026-05-28T22:39:29Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasındaki kullanıcı hesap özet sayfasını oluşturan temel React bileşenidir. Kullanıcının hesap bilgilerini görüntülediği ana arayüz sayfası olarak görev yapar ve hesap yönetimi işlevlerinin giriş noktasıdır.

## Fonksiyon Grupları
### Sayfa Bileşeni
Hesap özet sayfasının tamamını oluşturan ve kullanıcıya sunan ana React bileşenidir. Sayfa düzenini, içeriğini ve hesap verilerinin gösterimini yönetir.
- AccountOverviewPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmemiştir; dolayısıyla güvenilir mimari varsayımlar üretilemez.

---

**Not:** Verilen `AccountOverviewPage()` fonksiyonu için sadece imza (parametresiz) mevcut olup, fonksiyon gövdesi paylaşılmamıştır. AXIOMS'lar yalnızca fonksiyon gövdesinden üretilen kabul edildiğinden, bu durumda çıkarım yapılamamaktadır.

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

### [N1_NASIL] AST Pointer: AccountOverviewPage::useEffect
- **params**: ()
- **ic_degiskenler**:
  - `mounted` — Boolean bayrak, bileşenin monte edilip edilmediğini takip eder, async işlemler için güvenlik kontrolü sağlar
- **Dönüş**: Cleanup fonksiyonu döndürür (mounted=false yapar)

### [N2_NASIL] AST Pointer: AccountOverviewPage::load
- **params**: ()
- **ic_degiskenler**:
  - `orderData` — ShipmentRecord[] tipinde boş dizi, tüm sipariş verilerini tutar, fallback senaryosunda yeniden doldurulur
  - `addrData` — `listAddresses()` çağrısından dönen adres verisi, kullanıcı adreslerini temsil eder
  - `data` — Supabase'den dönen sipariş verisi (başarılı senaryo)
  - `error` — Supabase hata nesnesi, PGRST100 kodu kontrol edilir
  - `fallback` — Ana sorgu hata verdiğinde alternatif sorgu sonucu
  - `d` — Record<string, unknown> tipinde her bir fallback satırı, map işleminde kullanılır
- **Dönüş**: yok (async void)

### [N3_NASIL] AST Pointer: AccountOverviewPage::renderOrderItem
- **params**: `(o: ShipmentRecord)`
- **ic_degiskenler**:
  - `isDelivered` — Boolean, siparişin teslim edilip edilmediğini status alanına bakarak kontrol eder
  - `code` — String, sipariş numarasını formatlar: order_number varsa `#${order_number.split('-')[1]}`, yoksa `#${id.slice(-8).toUpperCase()}`
  - `activeShipStatusBadge` — JSX elementi döndüren fonksiyon çağrısı, sipariş durumuna göre badge gösterir
- **Dönüş**: JSX elementi (React.ReactNode)

### [N4_NASIL] AST Pointer: AccountOverviewPage::getShipStatus
- **params**: `(row?: ShipmentRecord)`
- **ic_degiskenler**: yok
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` (siparişin kargo durumunu belirten string)

### [N5_NASIL] AST Pointer: AccountOverviewPage::getStatusBadge
- **params**: `(status: 'delivered' | 'shipped' | 'preparing')`
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi (React.ReactNode - duruma göre renkli badge)

### [N6_NASIL] AST Pointer: AccountOverviewPage::getStepIndex
- **params**: `(status: 'delivered' | 'shipped' | 'preparing')`
- **ic_degiskenler**: yok
- **Dönüş**: number (0, 1 veya 2 - duruma göre adım indeksi)

### [N7_NASIL] AST Pointer: AccountOverviewPage::renderStepItem
- **params**: `(step: {key: string, icon: React.ComponentType, label: string}, idx: number)`
- **ic_degiskenler**:
  - `active` — Boolean, idx'in activeStepIdx'den küçük olup olmadığını kontrol eder, adımın aktif/pasif durumunu belirler
  - `StepIcon` — React bileşeni, step.icon'dan alınan ikon bileşeni, JSX içinde render edilir
- **Dönüş**: JSX elementi (React.ReactNode - adım gösterge bileşeni)

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