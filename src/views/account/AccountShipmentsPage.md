---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: 91f51cdff870d9a1
entity_hashes:
  func:AccountShipmentsPage: 6c41daabba3ddc39
  overview: ca709958064b6e53
  style_tokens: 0076231c43efae4d
generated_at: 2026-06-08T10:10:59Z
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

### [N1_NASIL] AST Pointer: AccountShipmentsPage.tsx::AccountShipmentsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — useEffect cleanup flag, component unmount olduğunda false yapılır
  - `load` — async fonksiyon, sipariş verilerini Supabase'den yükler
  - `baseSelect` — string, Supabase select sorgusu için alan listesi
  - `data` — supabase yanıtından gelen sipariş verileri
  - `error` — supabase sorgu hatası
  - `fallback` — hata durumunda alternatif sorgu sonucu
  - `items` — ham verinin maplenmiş hali, order_number düzeltmeleri yapılır
  - `filtered` — sadece kargo bilgisi olan siparişler
- **Dönüş**: JSX (sayfa bileşeni)

### [N2_NASIL] AST Pointer: AccountShipmentsPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `baseSelect` — string, Supabase select sorgusu için alan listesi
  - `data` — supabase yanıtından gelen sipariş verileri
  - `error` — supabase sorgu hatası
  - `fallback` — hata durumunda alternatif sorgu sonucu
  - `items` — ham verinin maplenmiş hali, order_number düzeltmeleri yapılır
  - `filtered` — sadece kargo bilgisi olan siparişler
- **Dönüş**: yok (state set eder)

### [N3_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatDate
- **params**: `(d?: string | null)`
- **ic_degiskenler**:
  - `d` — formatlanacak tarih stringi veya null
- **Dönüş**: string (formatlanmış tarih veya "-")

### [N4_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatPrice
- **params**: `(price: number | string)`
- **ic_degiskenler**:
  - `n` — price'ın number karşılığı, 0 ise fallback
- **Dönüş**: string (formatlanmış para birimi)

### [N5_NASIL] AST Pointer: AccountShipmentsPage.tsx::handleCopy
- **params**: `(text?: string | null)`
- **ic_degiskenler**:
  - `text` — kopyalanacak metin
- **Dönüş**: yok (clipboard'a yazar, toast gösterir)

### [N6_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatus
- **params**: `(row: ShipmentRow)`
- **ic_degiskenler**:
  - `row` — kargo durumu hesaplanacak sipariş satırı
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'` (kargo durumu)

### [N7_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatusBadge
- **params**: `(status: 'delivered' | 'shipped' | 'preparing')`
- **ic_degiskenler**:
  - `status` — gösterilecek kargo durumu
- **Dönüş**: JSX (renkli durum badge'i)

### [N8_NASIL] AST Pointer: AccountShipmentsPage.tsx::getStepIndex
- **params**: `(status: 'delivered' | 'shipped' | 'preparing')`
- **ic_degiskenler**:
  - `status` — adım indeksi hesaplanacak kargo durumu
- **Dönüş**: number (0, 1 veya 2)

### [N9_NASIL] AST Pointer: AccountShipmentsPage.tsx::filteredOrdersFilter
- **params**: `(r)` (ShipmentRow tipinde)
- **ic_degiskenler**:
  - `r` — filtrelenecek sipariş satırı
  - `s` — getShipStatus(r) ile hesaplanan kargo durumu
- **Dönüş**: boolean (filtre kriterine uyuyorsa true)

### [N10_NASIL] AST Pointer: AccountShipmentsPage.tsx::shipStepsMap
- **params**: `(step, idx)`
- **ic_degiskenler**:
  - `step` — shipSteps dizisindeki adım nesnesi
  - `idx` — adım indeksi
  - `active` — bu adımın aktif olup olmadığı (idx <= activeStepIdx)
  - `StepIcon` — step.icon, adımın ikonu
- **Dönüş**: JSX (React.Fragment içinde adım bileşeni)

### [N11_NASIL] AST Pointer: AccountShipmentsPage.tsx::orderCardMap
- **params**: `(o)` (ShipmentRow tipinde)
- **ic_degiskenler**:
  - `o` — render edilecek sipariş satırı
  - `shipStatus` — o için hesaplanan kargo durumu
  - `activeStepIdx` — aktif adım indeksi
  - `orderCode` — sipariş kodu (id'den türetilmiş)
- **Dönüş**: JSX (sipariş kartı)

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