---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: e34a62b9fc709adb
entity_hashes:
  func:AccountShipmentsPage: 6c41daabba3ddc39
  overview: dd1d8e3596e0316c
  style_tokens: 0076231c43efae4d
generated_at: 2026-05-29T18:53:28Z
---

## Genel Bakış
VentHub HVAC projesinin kullanıcı hesapları bölümüne ait olan bu modül, kullanıcıların kendi hesapları altındaki gönderi ve kargo bilgilerini görüntüleyebileceği ve yönetebileceği tek sayfalık bir arayüz bileşenidir. Bu modül, React tabanlı ön yüz mimarisinde, hesap ile ilgili kargo takip sayfasının ana ve tek giriş noktasını temsil eder.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tüm sorumluluğunu üstlenen ana ve tek React bileşenidir. Hesap gönderileri sayfasının arayüzünü oluşturur ve gerekli verileri gösterir.
- AccountShipmentsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametre almayan bir React fonksiyonel bileşenidir.

[Aksiyom 1]: Eğer React çalışma ortamı (Provider'lar, Router vb.) yoksa, bileşen düzgün render edilemez.

[Aksiyom 2]: Eğer bileşen çağrılmadan önce React DOM bağlamı (root element) oluşturulmamışsa, sayfada hiçbir içerik görüntülenemez.

---

**Not:** Fonksiyon gövdesi paylaşılmadığı için, bileşenin iç bağımlılıkları (API çağrıları, context kullanımı, state yönetimi vb.) hakkında kesin aksiyom üretilememektedir. Fonksiyon gövdesi available olduğunda kapsamlı mimari varsayımlar eklenebilir.

---

## FONKSİYON DETAYLARI

### AccountShipmentsPage
**Ne yapar**: VentHub HVAC projesinin hesap yönetimi modülündeki sevkiyatlar sayfasını oluşturan ana bileşendir. Kullanıcıların kendi hesaplarıyla ilişkili tüm sevkiyat kayıtlarını görüntülemesine olanak tanıyan ilgili sayfanın temel giriş noktasıdır.
**Nasıl yapar**: TypeScript tabanlı React bileşeni olarak projenin `src/views/account` dizininde tanımlanmıştır, hesaplar alanı altındaki sevkiyatlar alt sayfasının tüm arayüz ve işlevsel altyapısını oluşturmak üzere çalışır. Söz konusu sayfanın tüm içeriklerini, temel kullanıcı etkileşimlerini yöneten ana bileşen olarak görev alır.
**Parametreler**: Bu fonksiyon herhangi bir dış parametre almamaktadır.
**Dönüş**: Tanımında return tipi olarak void veya bilinmiyor olarak belirtilmiştir. Bir React sayfa bileşeni olması gereği, tarayıcıda görüntülenecek kullanıcı arayüzünü temsil eden JSX yapısını döndürür.

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

### [N1_NASIL] AccountShipmentsPage AST Pointer: AccountShipmentsPage.tsx::AccountShipmentsPage
- **params**: (parametre yok)
- **ic_degiskenler**: Component gövdesinde useState/useAuth hook'larından gelen değişkenler (user, loading, rows, setRows, setLoading, t, lang, router, filter, setFilter, shipSteps, formatDate, formatPrice, handleCopy, getShipStatus, getShipStatusBadge, getStepIndex) — hook'lardan ve üst scope'tan gelen değişkenler, fonksiyon gövdesinde doğrudan atanmaz
- **Dönüş**: JSX elementi (return ile render edilen JSX)

### [N2_NASIL] AccountShipmentsPage.tsx::load (useEffect icindeki async fonksiyon)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — cleanup flag; component unmount olduysa state güncellemesini engeller
  - `baseSelect` — Supabase select sorgusu için seçilecek kolonların virgülle ayrılmış string listesi
  - `data` — Supabase'den dönen sipariş verisi dizisi (başlangıçta let ile tanımlı, fallback'te yeniden atanabilir)
  - `error` — Supabase sorgusundan dönen hata nesnesi (let ile tanımlı, fallback'te yeniden atanabilir)
  - `fallback` — birincil sorgu 400/PGRST100 hatası verdiğinde yapılan yedek Supabase sorgusunun sonucu
  - `items` — data dizisinin map ile dönüştürülmüş hali; order_number eksikse id ile doldurulur
  - `filtered` — items içinden herhangi bir shipping bilgisi olan (carrier, tracking_number, tracking_url, shipped_at, delivered_at) siparişlerin filtrelenmiş hali
- **Dönüş**: yok (cleanup fonksiyonu döner: `() => { mounted = false }`)

### [N3_NASIL] AccountShipmentsPage.tsx::fallback map callback (item => ({...}))
- **params**: `item` — fallback sorgusundan tek bir sipariş satırı nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: object — item'in tüm alanlarını spread edip shipping kolonlarını null olarak atayan nesne (`{...item, carrier: null, tracking_number: null, tracking_url: null, shipped_at: null, delivered_at: null}`)

### [N4_NASIL] AccountShipmentsPage.tsx::items map callback (item => ({...}))
- **params**: `item` — data dizisindeki tek bir sipariş satırı nesnesi
- **ic_degiskenler**: yok
- **Dönüş**: object — item'in tüm alanlarını spread edip order_number eksikse item.id ile dolduran nesne (`{...item, order_number: item.order_number || item.id}`)

### [N5_NASIL] AccountShipmentsPage.tsx::formatDate (arrow fonksiyon)
- **params**: `d?: string | null` — formatlanacak tarih string'i (isteğe bağlı)
- **ic_degiskenler**: yok
- **Dönüş**: string — d null/boşsa `'-'` döner, değilse `formatOnlyDate(d, lang)` sonucunu döner

### [N6_NASIL] AccountShipmentsPage.tsx::formatPrice (arrow fonksiyon)
- **params**: `price: number | string` — formatlanacak fiyat değeri
- **ic_degiskenler**:
  - `n` — price'ın number'a çevrilmiş hali; Number dönüşümü başarısız olursa 0 kullanılır
- **Dönüş**: string — `formatCurrency(n, lang, { maximumFractionDigits: 0 })` sonucu

### [N7_NASIL] AccountShipmentsPage.tsx::handleCopy (async arrow fonksiyon)
- **params**: `text?: string | null` — clipboard'a kopyalanacak metin (isteğe bağlı)
- **ic_degiskenler**: yok
- **Dönüş**: Promise<void> — navigator.clipboard.writeText ile metni panoya kopyalar; başarıyla kopyalanırsa `toast.success`, hata olursa `toast.error` gösterir; text boşsa hiçbir şey yapmaz

### [N8_NASIL] AccountShipmentsPage.tsx::getShipStatus (arrow fonksiyon)
- **params**: `row: ShipmentRow` — kargo durumu belirlenecek sipariş satırı
- **ic_degiskenler**: yok
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` — row.delivered_at varsa `'delivered'`, row.shipped_at veya row.tracking_number varsa `'shipped'`, aksi halde `'preparing'`

### [N9_NASIL] AccountShipmentsPage.tsx::getShipStatusBadge (arrow fonksiyon)
- **params**: `status: 'delivered' | 'shipped' | 'preparing'` — badge gösterilecek kargo durumu
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi — duruma göre renkli badge ( Teslim Edildi / Kargoda / Hazırlanıyor ) span elementi

### [N10_NASIL] AccountShipmentsPage.tsx::getStepIndex (arrow fonksiyon)
- **params**: `status: 'delivered' | 'shipped' | 'preparing'` — adım indeksi hesaplanacak kargo durumu
- **ic_degiskenler**: yok
- **Dönüş**: number — `'delivered'` ise 2, `'shipped'` ise 1, `'preparing'` ise 0

### [N11_NASIL] AccountShipmentsPage.tsx::filter callback (r => {})
- **params**: `r` — filtreleme yapılan tek bir ShipmentRow satırı
- **ic_degiskenler**:
  - `s` — `getShipStatus(r)` çağrısının döndüğü kargo durumu string'i
- **Dönüş**: boolean — filter `'all'` ise her zaman true; değilse s === filter kontrolü

### [N12_NASIL] AccountShipmentsPage.tsx::filter button render callback (opt => button)
- **params**: `opt` — filtre seçeneği nesnesi; `{ value: string, label: string }` yapısında
- **ic_degiskenler**: yok
- **Dönüş**: JSX elementi — filtre seçeneğine ait `<button>` elementi; seçili olup olmadığına göre farklı stil uygulanır

### [N13_NASIL] AccountShipmentsPage.tsx::order card render callback (o => div)
- **params**: `o` — tek bir sipariş satırı (ShipmentRow tipinde)
- **ic_degiskenler**:
  - `shipStatus` — `getShipStatus(o)` çağrısıyla elde edilen kargo durumu string'i
  - `activeStepIdx` — `getStepIndex(shipStatus)` çağrısıyla elde edilen aktif adım indeksi (0, 1 veya 2)
  - `orderCode` — sipariş kodu; o.order_number varsa son '-' sonrasını alıp '#' ekler, yoksa o.id'nin son 8 karakterini büyük harfe çevirerek '#XXXXXX' formatında üretir
- **Dönüş**: JSX elementi — sipariş kartı (`<div>`); kart başlığı, kargo progress stepper, kargo detay bilgileri (kargo firması, takip numarası, takip linki, kargoya verilme tarihi, teslim tarihi) içerir

### [N14_NASIL] AccountShipmentsPage.tsx::stepper render callback (step, idx => Fragment)
- **params**: `step` — shipSteps dizisindeki tek bir adım nesnesi (`{ key: string, icon: Component, label: string }` yapısında), `idx` — adımın dizideki indeksi
- **ic_degiskenler**:
  - `active` — bu adımın aktif olup olmadığı; `idx <= activeStepIdx` koşulu ile belirlenir
  - `StepIcon` — step.icon değerinin React bileşeni referansı
- **Dönüş**: JSX elementi (React.Fragment) — adım göstergesi (daire + ikon) ve adım arası bağlantı çizgisi; aktif adımlar primary-navy renginde, pasif olanlar slate-400 renginde

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