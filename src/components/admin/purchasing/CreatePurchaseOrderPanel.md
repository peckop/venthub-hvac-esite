---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\components\admin\purchasing\CreatePurchaseOrderPanel.tsx
skeleton_hash: e6b9c593d257982a
entity_hashes:
  func:CreatePurchaseOrderPanel: a078f5162fb3a710
  overview: 750dd9416d29924d
  style_tokens: 967bed87e53566b5
generated_at: 2026-08-17T11:03:13Z
---

## Genel Bakış
CreatePurchaseOrderPanel, yönetici panelinde satın alma siparişi oluşturma işlemini gerçekleştiren bir React bileşenidir. Kullanıcının tedarikçi, ürün, miktar ve fiyat gibi bilgileri girerek yeni bir satın alma siparihi oluşturmasını sağlar. Oluşturma işlemi başarılı olduğunda üst bileşene bildirim gönderir veya kullanıcı iptal işlemi gerçekleştirebilir.

## Fonksiyon Grupları
### Sipariş Oluşturma Formu
Kullanıcı arayüzü üzerinden satın alma siparihi verilerinin toplanması ve form state yönetimi ile ilgilenir.
- CreatePurchaseOrderPanel

### İşlem Geri Bildirimi
Oluşturma veya iptal işlemlerinin üst bileşene iletilmesinden sorumludur.
- onCreated callback fonksiyonu ile yeni sipariş başarıyla oluşturulduğunda tetiklenir
- onCancel callback fonksiyonu ile kullanıcı paneli kapatmak istediğinde devreye girer

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, yalnızca mevcut fonksiyon imzası ve modül sabitlerine dayanarak çıkarılmıştır. Fonksiyon gövdesi erişilebilir olmadığından, sınırlı bilgiyle üretilmiştir.

**[Aksiyom 1]:** Eğer `onCreated` callback prop'u sağlanmazsa, satın alma siparişi başarıyla oluşturulduğunda üst bileşene bildirim gönderilemez ve bileşen içi durum yönetimi tutarsız hale gelebilir.

**[Aksiyom 2]:** Eğer `onCancel` callback prop'u sağlanmazsa, kullanıcı iptal işlemi gerçekleştirdiğinde üst bileşene bildirim gönderilemez ve navigasyon/panel kapatma akışı bozulabilir.

**[Aksiyom 3]:** Eğer `inputClass` sabiti tanımlı bir string değer içermiyorsa, form elemanlarının stil uygulaması başarısız olur veya görünümü tutarsız hale gelir.

---

> **Not:** Fonksiyon gövdesine erişim sağlanamadığından, bileşen içi state yönetimi, form validasyonu, API çağrıları veya eşik değerleri hakkında aksiyom üretilememiştir. Tam aksiyon üretimi için fonksiyon gövdesinin sağlanması gereklidir.

---

## FONKSİYON DETAYLARI

### CreatePurchaseOrderPanel
**Ne yapar**: Admin paneli üzerinde satın alma siparişi oluşturma işlemini gerçekleştiren bir React bileşenidir. Kullanıcının yeni bir satın alma siparişi oluşturmasını sağlar ve bu işlem tamamlandığında veya iptal edildiğinde üst bileşene bildirim gönderir.

**Nasıl yapar**: Fonksiyon bir React fonksiyonel bileşeni (Functional Component) olarak tanımlanmıştır. Bileşen, Props aracılığıyla iki callback fonksiyonu alır: başarılı oluşum sonrası tetiklenen `onCreated` ve kullanıcı iptal işlemi gerçekleştirdiğinde çağrılan `onCancel`. Bu callback'ler bileşenin üst düzey ebeveynine durum bildirimi yapmak için kullanılır. Bileşen muhtemelen bir form yapısı içerir ve satın alma siparişi verilerinin girilmesi/submit edilmesi için bir panel arayüzü sunar.

**Parametreler**:
- `onCreated`: `() => void` — Satın alma siparişi başarıyla oluşturulduğunda çağrılan callback fonksiyonu. Üst bileşeni başarısızlık durumunda bileşenin kapanmasını veya liste yenilenmesini tetiklemek için kullanılır.
- `onCancel`: `() => void` — Kullanıcı sipariş oluşturma işlemini iptal ettiğinde veya paneli kapatmak istediğinde çağrılan callback fonksiyonu.

**Dönüş**: `React.FC<Props>` — React fonksiyonel bileşeni olarak tip tanımlı bir JSX yapısı döndürür. Props tipi, yukarıdaki `onCreated` ve `onCancel` callback'lerini içeren bir arayüzdür.

---

## İTHALATLAR (IMPORTS)
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/utils/adminUi::adminTableActionPrimaryClass
- import: lucide-react::Plus
- import: lucide-react::Trash2
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### ProductOption
Yeni PO paneli (T062 D4, cetvel §8). Satır maliyet SNAPSHOT'ları burada girilir ve sipariş anında donar (§5.1). Katalog fiyat alanlarına DOKUNULMAZ (§5.2 / R3): ürün arama yalnız id/name/sku çeker.
- `id: string`
- `name: string`
- `sku: string`

### DraftLine
- `product: ProductOption`
- `qty: string`
- `unitCost: string`

### Props
- `onCreated: () => void`
- `onCancel: () => void`

---

## SABİTLER
- **inputClass** (str) — `'h-9 rounded-admin-md bg-admin-surface border border-admin-border px-3 text-s...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CreatePurchaseOrderPanel.tsx::CreatePurchaseOrderPanel
- **params**: (onCreated, onCancel)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, bileşen içindeki metinleri çevirir
  - `suppliers` — state: mevcut tedarikçi listesi (SupplierRow[]), select dropdown'ını doldurur
  - `supplierId` — state: seçilen tedarikçi ID'si (string), form gönderiminde kullanılır
  - `showNewSupplier` — state: yeni tedarikçi formunun görünürlüğü (boolean), UI koşullu render kontrolü
  - `newSupplierName` — state: yeni tedarikçi adı input değeri (string), createSupplier API'sine gönderilir
  - `currency` — state: para birimi kodu (string, varsayılan 'TRY'), sipariş para birimini belirler
  - `expectedAt` — state: beklenen teslim tarihi (string, YYYY-MM-DD formatı), createPurchaseOrder API'sine gönderilir
  - `note` — state: sipariş notu (string), createPurchaseOrder API'sine gönderilir
  - `productTerm` — state: ürün arama terimi (string), Supabase'de name/SKU araması yapar
  - `productOptions` — state: ürün arama sonuçları (ProductOption[]), dropdown listesini doldurur
  - `lines` — state: sipariş kalemleri dizisi (DraftLine[]), her kalem product, qty, unitCost içerir
  - `submitting` — state: form gönderim durumu (boolean), buton disabled kontrolü ve çoklu tıklama engeli
  - `reloadSuppliers` — useCallback ile tanımlanmış: tedarikçi listesini supabaseBrowserClient üzerinden yeniden yükler
  - `addLine` — useCallback ile tanımlanmış: seçilen ürünü lines dizisine ekler, duplicate kontrolü yapar
  - `saveNewSupplier` — useCallback ile tanımlanmış: yeni tedarikçiyi createSupplier API ile oluşturur
  - `submit` — useCallback ile tanımlanmış: form verilerini doğrulayıp createPurchaseOrder API'sine gönderir
- **Dönüş**: JSX element (React.FC)

### [N2_NASIL] AST Pointer: CreatePurchaseOrderPanel.tsx::reloadSuppliers
- **params**: ()
- **ic_degiskenler**:
  - `err` — catch bloğunda yakalanan hata (Error), konsola warning olarak yazdırılır
- **Dönüş**: Promise<void> (async fonksiyon, sadece state günceller)

### [N3_NASIL] AST Pointer: CreatePurchaseOrderPanel.tsx::addLine
- **params**: (product: ProductOption)
- **ic_degiskenler**:
  - `product` — parametre: eklenecek ürün bilgisi (ProductOption), lines dizisine eklenir
- **Dönüş**: void (setLines, setProductTerm, setProductOptions çağırır)

### [N4_NASIL] AST Pointer: CreatePurchaseOrderPanel.tsx::saveNewSupplier
- **params**: ()
- **ic_degiskenler**:
  - `name` — newSupplierName state'inin trimlenmiş hali (string), boşsa fonksiyon erken döner
  - `created` — createSupplier API dönüşü (supplier objesi), created.id ile supplierId state'i güncellenir
  - `err` — catch bloğunda yakalanan hata (Error), toast error gösterir
- **Dönüş**: Promise<void> (async fonksiyon, state güncellemeleri ve API çağrısı yapar)

### [N5_NASIL] AST Pointer: CreatePurchaseOrderPanel.tsx::submit
- **params**: ()
- **ic_degiskenler**:
  - `parsed` — lines dizisinin dönüştürülmüş ve filtrelenmiş hali (dizi), product_id, qty_ordered, unit_cost alanlarını içerir
  - `err` — catch bloğunda yakalanan hata (Error), toast error gösterir
- **Dönüş**: Promise<void> (async fonksiyon, createPurchaseOrder API'sini çağırır ve toast bildirimleri gösterir)

---

## NODE ID STANDARD

  file: src\components\admin\purchasing\CreatePurchaseOrderPanel.tsx
  function: src\components\admin\purchasing\CreatePurchaseOrderPanel.tsx::CreatePurchaseOrderPanel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CreatePurchaseOrderPanel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `bg-admin-surface-2`, `border-admin-border`, `focus-visible:bg-admin-surface-3`, `hover:bg-admin-danger-weak`, `hover:bg-admin-surface-3`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-left`, `text-sm`, `text-xs`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-1`, `gap-1.5`, `gap-2`, `gap-3`, `grid`, `grid-cols-1`, `h-9`, `items-end`, `justify-end`, `max-h-56`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `!px-3`, `!px-4`, `${adminTableActionPrimaryClass`, `${inputClass`, `border`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/40`, `focus-visible:ring-admin-danger/40`, `font-bold`, `font-semibold`, `ml-2`, `mt-1`, `px-2`