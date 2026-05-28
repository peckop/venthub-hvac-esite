---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx
skeleton_hash: e34a62b9fc709adb
entity_hashes:
  func:AccountShipmentsPage: 6c41daabba3ddc39
  overview: 3b6888fa00b79a10
  style_tokens: 0076231c43efae4d
generated_at: 2026-05-28T22:38:52Z
---

## Genel Bakış
VentHub HVAC sisteminin kullanıcı hesapları bölümünde yer alan bu modül, kullanıcıların kendi hesaplarına ait gönderileri görüntüleyip yönetebileceği özel bir arayüz sunar. Projenin görünüm katmanında konumlanan bu modül, hesap altındaki gönderiler sayfasını oluşturan ana React bileşenini barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Modülün tek ve ana işlevini yerine getiren, hesap gönderileri sayfasının tüm kullanıcı arayüzü ve temel iş akışlarını yöneten ana bileşendir.
- AccountShipmentsPage

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinin kullanıcı hesap bölümünde yer alan kargo takip sayfasını oluşturan React tabanlı bir ön yüz bileşenidir, çalışması için projenin ön yüz çalışma zamanı, yönlendirme altyapısı ve tüm bağımlılıklarının bütünlüğü zorunludur.

[Aksiyom 1]: Eğer projeye entegre edilmiş React ve TypeScript çalışma zamanı ortamı mevcut değilse, bu TSX bileşeni derlenemez ve işlenemez, kullanıcı arayüzünde çalışma zamanı hatası oluşur.
[Aksiyom 2]: Eğer projenin ön yüz yönlendirme (routing) sistemi bu AccountShipmentsPage bileşenini ilgili hesap rotası ile ilişkilendirmemişse, kullanıcı hesap kargoları sayfasına hiçbir şekilde erişim sağlayamaz.
[Aksiyom 3]: Eğer bu sayfa bileşeninin bağımlı olduğu tüm alt React bileşenleri, yardımcı modüller ve stil dosyaları proje içinde erişilebilir konumda değilse, sayfa tam olarak işlenmez, görsel veya işlevsel kusurlar oluşur.
[Aksiyom 4]: Eğer bu sayfanın kargo verilerini çektiği arka uç API uç noktaları erişilemez durumdaysa, kullanıcı hiçbir kargo bilgisini görüntüleyemez, sayfada veri eksikliği hatası oluşur.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::AccountShipmentsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mounted` — Bileşenin mount durumunu takip eden bayrak, state güncellemelerinde memory leak oluşmasını engeller, cleanup'ta false yapılır
  - `user` — useAuth hook'undan alınan oturum açmış kullanıcı objesi, gönderi yükleme fonksiyonunu tetiklemek için kullanılır
  - `setLoading` — Yükleme durumunu yöneten state setter fonksiyonu
  - `setRows` — Gönderi listesini state'te tutmak için kullanılan state setter fonksiyonu
  - `load` — Kullanıcının gönderi verilerini Supabase'den çeken async iç fonksiyon
- **Dönüş**: React cleanup fonksiyonu (bileşen unmount olduğunda çalışır)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::load
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setLoading` — Yükleme durumunu açıp kapatan state setter
  - `baseSelect` — İlk Supabase sorgusunda seçilecek tüm sütunları içeren string
  - `data` — Supabase'den dönen sipariş verilerini tutan değişken
  - `error` — Sorgu sırasında oluşan hataları tutan değişken
  - `supabase` — Veritabanı sorguları için kullanılan Supabase istemcisi
  - `user?.id` — Oturumlu kullanıcının ID'si, sadece kendi siparişlerini çekmek için sorguda filtre olarak kullanılır
  - `fallback` — İlk sorgu hata verdiğinde çalışan yedek Supabase sorgusunun sonucu, daha az sütun içeren sorgu
  - `items` — Ham veriyi ShipmentRow tipine dönüştürülmüş işlenmiş sipariş listesi
  - `filtered` — Sadece herhangi bir kargo bilgisi içeren siparişleri filtreleyen liste
  - `mounted` — Bileşenin mount durumunu kontrol eden bayrak, sadece mount ise state güncellenir
  - `setRows` — Filtrelenmiş gönderi listesini state'e kaydeden setter
  - `console` — Hata loglamak için kullanılan tarayıcı konsol nesnesi
  - `toast` — Kullanıcıya hata bildirimi göstermek için react-hot-toast fonksiyonu
  - `t` — Çeviri fonksiyonu, hata mesajını yerelleştirmek için kullanılır
- **Dönüş**: yok (async void)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::fallbackItemMap
- **params**: item (yedek sorgudan dönen ham sipariş objesi)
- **ic_degiskenler**:
  - `...item` — Mevcut siparişin tüm özelliklerini kopyalayan spread operatörü
  - `carrier` — Yedek sorguda eksik olan kargo firması alanına null atanır
  - `tracking_number` — Eksik takip numarası alanına null atanır
  - `tracking_url` — Eksik takip linki alanına null atanır
  - `shipped_at` — Eksik kargoya verilme tarihi alanına null atanır
  - `delivered_at` — Eksik teslimat tarihi alanına null atanır
- **Dönüş**: standartlaştırılmış sipariş objesi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::itemToShipmentRowMap
- **params**: item (veritabanından dönen ham sipariş objesi)
- **ic_degiskenler**:
  - `...item` — Mevcut siparişin tüm özelliklerini kopyalayan spread operatörü
  - `order_number` — Sipariş numarası mevcut değilse yedek olarak sipariş ID'si atanır
- **Dönüş**: ShipmentRow tipinde standartlaştırılmış gönderi objesi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::formatDate
- **params**: d (string | null | undefined, formatlanacak ham tarih değeri)
- **ic_degiskenler**:
  - `formatOnlyDate` — Projenin dahili tarih formatlama utility fonksiyonu
  - `lang` — Kullanıcının mevcut dili, tarih formatlamada kullanılır
- **Dönüş**: Formatlanmış tarih stringi, geçersiz/null tarihse '-' döndürür

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::formatPrice
- **params**: price (number | string, formatlanacak para değeri)
- **ic_degiskenler**:
  - `n` — Fiyatın sayıya dönüştürülmüş hali, geçersizse 0 atanır
  - `formatCurrency` — Projenin dahili para formatlama utility fonksiyonu
  - `lang` — Kullanıcının mevcut dili, para formatlamada kullanılır
- **Dönüş**: Kullanıcı diline göre formatlanmış para stringi

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::handleCopy
- **params**: text (string | null | undefined, panoya kopyalanacak metin)
- **ic_degiskenler**:
  - `navigator.clipboard` — Tarayıcının panoya yazma API'si
  - `toast` — Kullanıcıya işlem sonucu bildirimi göstermek için react-hot-toast
  - `t` — Çeviri fonksiyonu, bildirim metinlerini yerelleştirmek için kullanılır
- **Dönüş**: yok (async void)

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::getShipStatus
- **params**: row (ShipmentRow, durumu hesaplanacak gönderi objesi)
- **ic_degiskenler**:
  - `row.delivered_at` — Gönderinin teslimat tarihi, ilk kontrol edilen alan
  - `row.shipped_at` — Gönderinin kargoya verilme tarihi
  - `row.tracking_number` — Gönderinin takip numarası
- **Dönüş**: Gönderinin durumu: 'delivered' | 'shipped' | 'preparing'

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::getShipStatusBadge
- **params**: status ('delivered' | 'shipped' | 'preparing', badge'i oluşturulacak gönderi durumu)
- **ic_degiskenler**:
  - `CheckCircle` — Lucide ikonu, teslim edildi durumunda kullanılır
  - `Truck` — Lucide ikonu, kargoda durumunda kullanılır
  - `Clock` — Lucide ikonu, hazırlanıyor durumunda kullanılır
- **Dönüş**: Duruma göre stillendirilmiş React JSX badge elementi

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::getStepIndex
- **params**: status ('delivered' | 'shipped' | 'preparing', adım indeksi hesaplanacak gönderi durumu)
- **ic_degiskenler**: yok (sadece durum kontrolleri yapılır)
- **Dönüş**: İlerleme çubuğu için kullanılacak adım indeksi: 0 (hazırlanıyor), 1 (kargoda), 2 (teslim edildi)

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::shipmentFilterCallback
- **params**: r (ShipmentRow, filtrelenecek gönderi objesi)
- **ic_degiskenler**:
  - `filter` — Mevcut seçili filtre değeri ('all', 'delivered', 'shipped', 'preparing')
  - `getShipStatus` — Gönderinin durumunu hesaplayan fonksiyon
- **Dönüş**: Boolean, gönderinin listede kalıp kalmayacağını belirtir

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::filterOptionButtonCallback
- **params**: opt (filtre seçeneği objesi, value ve label özellikleri içeren)
- **ic_degiskenler**:
  - `setFilter` — Filtre değerini güncelleyen state setter fonksiyonu
  - `filter` — Mevcut aktif filtre, butonun stillendirilmesi için kullanılır
- **Dönüş**: Filtre değiştirme butonu React JSX elementi

### [N13_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::orderCardRenderCallback
- **params**: o (ShipmentRow, kartı oluşturulacak sipariş objesi)
- **ic_degiskenler**:
  - `shipStatus` — Siparişin hesaplanmış gönderi durumu
  - `activeStepIdx` — İlerleme adımları için son aktif adımın indeksi
  - `orderCode` — Kullanıcı arayüzünde gösterilecek kısaltılmış sipariş kodu
  - `router` — Next.js useRouter hook'u, sipariş detay sayfasına yönlendirmek için kullanılır
  - `formatDate` — Tarih formatlama fonksiyonu
  - `formatPrice` — Para formatlama fonksiyonu
  - `getShipStatusBadge` — Durum badge'i oluşturan fonksiyon
  - `Package` — Lucide ikonu, sipariş kartı başlığında kullanılır
  - `Copy` — Lucide ikonu, takip numarasını kopyalamak için kullanılır
  - `ExternalLink` — Lucide ikonu, takip linkinde kullanılır
  - `shipSteps` — İlerleme çubuğunun adım tanımları listesi
- **Dönüş**: Sipariş kartı React JSX elementi

### [N14_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountShipmentsPage.tsx::progressStepRenderCallback
- **params**: step (ilerleme adımı objesi), idx (adımın sıralı indeksi)
- **ic_degiskenler**:
  - `active` — Adımın aktif olup olmadığını belirten bayrak
  - `StepIcon` - Adımda gösterilecek Lucide ikonu
  - `activeStepIdx` — Mevcut son aktif adımın indeksi, ilerleme çizgisi ve stillendirme için kullanılır
- **Dönüş**: İlerleme adımı React Fragment elementi

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