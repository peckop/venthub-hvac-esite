---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: 258017575fcc5a61
entity_hashes:
  func:AccountShipmentsPage: 6c41daabba3ddc39
  overview: 2396779c9e104706
  style_tokens: 0076231c43efae4d
generated_at: 2026-06-06T21:56:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı hesapları bölümünde yer alan ve kullanıcıların kendi gönderi/kargo bilgilerini görüntüleyebileceği tek sayfalık bir arayüz bileşenidir. Bileşen, hesap yönetimi alanı altındaki sevkiyatlar sayfasının ana giriş noktasını oluşturur.

## Fonksiyon Grupları
### Sayfa Bileşeni
Modülün tek ve ana bileşeni olarak, ilgili hesap gönderileri sayfasının tüm arayüzünü ve temel yapıyı oluşturur.
- AccountShipmentsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametre almayan bir React fonksiyonel bileşen olup, hesap gönderileri sayfasının tek giriş noktasıdır.

[Aksiyom 1]: Eğer bileşen bir React uygulama bağlamı (Provider ağacı) dışında render edilirse, gerekli context'ler (oturum, tema vb.) sağlanamaz ve bileşen hata verir.

[Aksiyom 2]: Eğer bileşen, hesap section dışı bir rota tarafından çağrılarsa, beklenen kullanıcı oturum durumu veya hesap verisi mevcut olmayabilir ve bileşen tutarsız durum sergiler.

[Aksiyom 3]: Eğer bileşen props almadığı halde iç bağımlılıklarından biri (API servisi, context, hook) değiştirilirse veya kaldırılırsa, bileşenin çalışma zamanı davranışı bozulur.

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

### [N1_NASIL] AST Pointer: AccountShipmentsPage.tsx::useEffectCallback (mounted closure)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — cleanup flag; component unmount oldugunda false olur, state guncellemeleri engellenir
  - `load` — async fonksiyon; siparisleri Supabase'den cekip filtreler
- **Dönüş**: cleanup fonksiyonu `() => { mounted = false }` doner

---

### [N2_NASIL] AST Pointer: AccountShipmentsPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `baseSelect` — string; Supabase select sorgusu icin secilecek kolon listesi (`'id, created_at, total_amount, status, order_number, carrier, tracking_number, tracking_url, shipped_at, delivered_at'`)
  - `data` — Supabase'den donen siparis satirlarinin ham verisi
  - `error` — Supabase sorgusundan donen hata nesnesi
  - `fallback` — fallback sorgu sonucu; shipping kolonlari yoksa daraltilmis select ile gelen data/error
  - `items` — `(data || []).map(...)` ile `order_number` fallback'i uygulanmis ShipmentRow dizisi; `item.order_number || item.id` ile order_number garanti altina alinir
  - `filtered` — items icinden herhangi bir shipping bilgisi olan (carrier, tracking_number, tracking_url, shipped_at, delivered_at) kayitlar
  - `e` — try-catch yakalanan hata nesnesi
- **Dönüş**: yok (state gunceller: `setRows(filtered)`, `setLoading`)

---

### [N3_NASIL] AST Pointer: AccountShipmentsPage.tsx::fallbackMapCallback
- **params**: `item` — supabase fallback sorgusundan donen tekil siparis kaydi (sadece id, created_at, total_amount, status, order_number icerir)
- **ic_degiskenler**: (yok)
- **Dönüş**: `item` uzerine shipping kolonlarini null olarak eklenmis genisletilmis nesne doner

---

### [N4_NASIL] AST Pointer: AccountShipmentsPage.tsx::itemsMapCallback
- **params**: `item` — supabase'den donen tekil siparis kaydi (tum kolonlar)
- **ic_degiskenler**: (yok)
- **Dönüş**: `item` uzerine `order_number` fallback'i uygulanmis nesne doner; `item.order_number || item.id`

---

### [N5_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatDate
- **params**: `d` — `string | null | undefined`; formatlanacak tarih stringi
- **ic_degiskenler**: (yok)
- **Dönüş**: `string`; d bos/null ise `'-'`, degilse `formatOnlyDate(d, lang)` cagrisinin donusu

---

### [N6_NASIL] AST Pointer: AccountShipmentsPage.tsx::formatPrice
- **params**: `price` — `number | string`; formatlanacak fiyat degeri
- **ic_degiskenler**:
  - `n` — number; `Number(price) || 0` ile numeric'e donusturulmus fiyat, parse edilemezse 0
- **Dönüş**: `string`; `formatCurrency(n, lang, { maximumFractionDigits: 0 })` ile formatlanmis para birimi stringi

---

### [N7_NASIL] AST Pointer: AccountShipmentsPage.tsx::handleCopy
- **params**: `text` — `string | null | undefined`; panoya kopyalanacak takip numarasi/metin
- **ic_degiskenler**: (yok)
- **Dönüş**: `Promise<void>`; `navigator.clipboard.writeText(text)` ile panoya yazar, basari/hata toast gosterir

---

### [N8_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatus
- **params**: `row` — `ShipmentRow`; kargo durumu belirlenecek siparis satiri
- **ic_degiskenler**: (yok)
- **Dönüş**: `'delivered' | 'shipped' | 'preparing'`; `row.delivered_at` varsa delivered, `row.shipped_at || row.tracking_number` varsa shipped, diger durumda preparing

---

### [N9_NASIL] AST Pointer: AccountShipmentsPage.tsx::getShipStatusBadge
- **params**: `status` — `'delivered' | 'shipped' | 'preparing'`; durum degeri
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element`; duruma gore renkli badge JSX'i doner — delivered: yesil CheckCircle, shipped: mor Truck, prepared: sari Clock

---

### [N10_NASIL] AST Pointer: AccountShipmentsPage.tsx::getStepIndex
- **params**: `status` — `'delivered' | 'shipped' | 'preparing'`; kargo durumu
- **ic_degiskenler**: (yok)
- **Dönüş**: `number`; delivered ise 2, shipped ise 1, prepared ise 0

---

### [N11_NASIL] AST Pointer: AccountShipmentsPage.tsx::filterCallback
- **params**: `r` — `ShipmentRow`; filtrelenen siparis satiri
- **ic_degiskenler**:
  - `s` — string; `getShipStatus(r)` cagrisiyla elde edilen kargo durumu
- **Dönüş**: `boolean`; `filter === 'all'` ise true, degilse satirin durumu filter eslesiyorsa true

---

### [N12_NASIL] AST Pointer: AccountShipmentsPage.tsx::filterButtonRenderCallback
- **params**: `opt` — `{ value: string, label: string }`; filtre secenek nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: `JSX.Element`; secili filtre ile eslesen buton render eder; secili ise primary-navy arka planli, degilse beyaz arka planli

---

### [N13_NASIL] AST Pointer: AccountShipmentsPage.tsx::orderCardRenderCallback
- **params**: `o` — `ShipmentRow`; render edilecek siparis satiri
- **ic_degiskenler**:
  - `shipStatus` — string; `getShipStatus(o)` ile elde edilen kargo durumu
  - `activeStepIdx` — number; `getStepIndex(shipStatus)` ile elde edilen aktif stepper indeksi
  - `orderCode` — string; `o.order_number` varsa son parcasi, yoksa `o.id.slice(-8).toUpperCase()` ile olusturulan siparis kodu (ornek: `#ABC12345`)
- **Dönüş**: `JSX.Element`; siparis karti JSX'i — header, shipping progress stepper, kargo detaylari (firma, takip no, takip linki, kargoya verilme tarihi, teslim tarihi)

---

### [N14_NASIL] AST Pointer: AccountShipmentsPage.tsx::stepperRenderCallback
- **params**: `step` — `{ key: string, label: string, icon: ComponentType }`; stepper adimi; `idx` — number; adimin dizideki indeksi
- **ic_degiskenler**:
  - `active` — boolean; `idx <= activeStepIdx` ile bu adamin aktif olup olmadigi
  - `StepIcon` — ComponentType; `step.icon`'dan alinan ikon bileseni
- **Dönüş**: `JSX.Element`; tekil stepper adimi ve baglanti cizgisi JSX'i; aktif ise primary-navy, degilse slate-400/slate-200 renkleri

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