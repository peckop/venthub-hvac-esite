---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\purchasing\CreatePurchaseOrderPanel.tsx
skeleton_hash: cfe6fe92941c9136
entity_hashes:
  func:CreatePurchaseOrderPanel: a078f5162fb3a710
  overview: 750dd9416d29924d
  style_tokens: 967bed87e53566b5
generated_at: 2026-08-27T08:22:57Z
---

## Genel Bakış
Bu modül, admin panelinde satın alma siparişi (Purchase Order) oluşturma işlemini gerçekleştiren bir React bileşenidir. Bileşen, sipariş başarıyla oluşturulduğunda ve kullanıcı işlemi iptal ettiğinde üst bileşene bildirimde bulunmak üzere iki geri çağırma (callback) prop'u alır. Modül tek bir bileşen fonksiyonundan oluşur ve satın alma sürecinin oluşturulma adımını temsil eder.

## Fonksiyon Grupları

### Satın Alma Siparişi Oluşturma Paneli
Satın alma siparişi oluşturma formunu kullanıcıya sunar; sipariş başarılı şekilde oluşturulduğunda `onCreated` geri çağırmasıyla, kullanıcı iptal ettiğinde ise `onCancel` geri çağırmasıyla üst bileşeni bilgilendirir.
- CreatePurchaseOrderPanel

### Dış Bağımlılıklar ve Mimari Notlar
- Bileşen, `onCreated` ve `onCancel` prop'ları aracılığıyla üst bileşenle iletişim kurar; bu prop'ların türleri ve içerdikleri bilgi kaynakta belirtilmemiştir (bilinmiyor).
- Bileşenin içerdiği alt bileşenler, form alanları, durum yönetimi ve API çağrılarına ilişkin ayrıntılar kaynakta yer almamaktadır (bilinmiyor).
- Dosya yolu `src\components\admin\purchasing\` altında konumlandığından, admin panelinin satın alma (purchasing) modülüne ait bir alt bileşen olarak mimari yapıda yer alır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi verilmemiştir. Aksiyomlar yalnızca fonksiyon gövdesinden türetilir; imza, sabitler veya dosya adından bilgi çıkarılmaz.

---

## FONKSİYON DETAYLARI

### CreatePurchaseOrderPanel
**Ne yapar**: Satın alma siparişi oluşturma panelini sunan bir React fonksiyonel bileşenidir. `admin/purchasing` modülü altında konumlanan bu bileşen, yeni bir satın alma siparişi oluşturulması için kullanıcı arayüzü sağlar.

**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanmıştır. Bileşen, aldığı `onCreated` ve `onCancel` callback fonksiyonlarını kullanarak bileşen yaşam döngüsündeki olayları üst bileşene bildirir. Bileşenin iç mantığı ve render ettiği UI elemanları hakkında kaynakta ek bilgi verilmemiştir.

**Parametreler**:
- onCreated: (tip bilgisi Props tipinde tanımlı, kaynakta belirtilmemiş) — Sipariş başarıyla oluşturulduktan sonra çağrılan callback fonksiyonu. Bileşen dışından gelen bir işlevdir.
- onCancel: (tip bilgisi Props tipinde tanımlı, kaynakta belirtilmemiş) — Sipariş oluşturma işleminin iptal edilmesi durumunda çağrılan callback fonksiyonu. Bileşen dışından gelen bir işlevdir.

**Dönüş**: `React.FC<Props>` — React fonksiyonel bileşeni döndürür. `Props` tipi kaynak dosyada tanımlı olup, `onCreated` ve `onCancel` alanlarını içerir.

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

### [N1_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::CreatePurchaseOrderPanel
- **params**: `onCreated` — sipariş başarıyla oluşturulduktan sonra çağrılacak geri çağırma fonksiyonu; `onCancel` — kullanıcı iptal ettiğinde çağrılacak geri çağırma fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; metinleri yerelleştirmek için kullanılır
  - `suppliers` — `useState<SupplierRow[]>([])` ile tutulan tedarikçi listesi; select kutusunda seçenek olarak gösterilir
  - `setSuppliers` — `suppliers` state setter'ı; tedarikçi listesi yüklendiğinde güncellenir
  - `supplierId` — `useState('')` ile tutulan seçili tedarikçi kimliği; form gönderiminde `supplier_id` olarak kullanılır
  - `setSupplierId` — `supplierId` state setter'ı; select onChange olayında ve yeni tedarikçi oluşturulunca güncellenir
  - `showNewSupplier` — `useState(false)` ile tutulan boolean; yeni tedarikçi formunun görünürlüğünü kontrol eder
  - `setShowNewSupplier` — `showNewSupplier` state setter'ı
  - `newSupplierName` — `useState('')` ile tutulan yeni tedarikçi adı input değeri
  - `setNewSupplierName` — `newSupplierName` state setter'ı
  - `currency` — `useState('TRY')` ile tutulan para birimi; varsayılan 'TRY'; input'ta büyük harfe dönüştürülerek ayarlanır
  - `setCurrency` — `currency` state setter'ı
  - `expectedAt` — `useState('')` ile tutulan beklenen teslim tarihi; date input ile seçilir
  - `setExpectedAt` — `expectedAt` state setter'ı
  - `note` — `useState('')` ile tutulan sipariş notu
  - `setNote` — `note` state setter'ı
  - `productTerm` — `useState('')` ile tutulan ürün arama terimi; input'ta yazılan metin
  - `setProductTerm` — `productTerm` state setter'ı
  - `productOptions` — `useState<ProductOption[]>([])` ile tutulan ürün arama sonuçları; dropdown'da listelenir
  - `setProductOptions` — `productOptions` state setter'ı
  - `lines` — `useState<DraftLine[]>([])` ile tutulan sipariş satırları dizisi; her satırda `product`, `qty`, `unitCost` alanları bulunur
  - `setLines` — `lines` state setter'ı; satır ekleme, silme, miktar/birim fiyat güncelleme işlemlerinde kullanılır
  - `submitting` — `useState(false)` ile tutulan boolean; form gönderilirken butonları devre dışı bırakır
  - `setSubmitting` — `submitting` state setter'ı
  - `reloadSuppliers` — `useCallback` ile tanımlanmış async fonksiyon; `listSuppliers(supabaseBrowserClient)` çağırarak tedarikçi listesini yeniden yükler ve `setSuppliers` ile günceller
  - `addLine` — `useCallback` ile tanımlanmış fonksiyon; parametre olarak `product: ProductOption` alır; aynı ürün zaten `lines` içinde yoksa yeni satır ekler (`qty: '1', unitCost: ''`), ardından `productTerm` ve `productOptions` sıfırlar
  - `saveNewSupplier` — `useCallback` ile tanımlanmış async fonksiyon; `newSupplierName` trimlenmiş halini `createSupplier(supabaseBrowserClient, { name, currency })` ile kaydeder, başarılı olursa toast gösterir, formu sıfırlar, tedarikçileri yeniden yükler ve yeni tedarikçiyi seçili yapar
  - `submit` — `useCallback` ile tanımlanmış async fonksiyon; `supplierId` yoksa hata gösterir, `lines` dizisini `product_id`, `qty_ordered`, `unit_cost` alanlarına dönüştürür, geçersiz satırları filtreler, `createPurchaseOrder(supabaseBrowserClient, {...})` çağırır, başarılı olursa `onCreated()` çağırır
- **Dönüş**: JSX (React element) — section etiketi içinde tedarikçi seçimi, para birimi, tarih, yeni tedarikçi formu, ürün arama, sipariş satırları, not ve iptal/gönder butonları

### [N2_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::reloadSuppliers
- **params**: yok
- **ic_degiskenler**:
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.warn` ile konsola yazdırılır
- **Dönüş**: yok (Promise<void>) — yan etki olarak `setSuppliers` ile tedarikçi listesini günceller

### [N3_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::useEffect_reloadSuppliers
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak bileşen mount edildiğinde `reloadSuppliers()` çağırır

### [N4_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::useEffect_productSearch
- **params**: yok
- **ic_degiskenler**:
  - `term` — `productTerm.trim()` sonucu; arama teriminin boşluksuz hali
  - `handle` — `setTimeout` tarafından döndürülen zamanlayıcı kimliği; cleanup fonksiyonunda `clearTimeout` ile temizlenir
- **Dönüş**: cleanup fonksiyonu — `clearTimeout(handle)` çağırarak zamanlayıcıyı iptal eder. Yan etki olarak `term.length >= 2` ise 250ms gecikmeyle ürün arama sorgusu başlatır

### [N5_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::setTimeout_callback
- **params**: yok
- **ic_degiskenler**: yok — içinde async IIFE tanımlanır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::async_IIFE_productQuery
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabaseBrowserClient.from('products').select('id, name, sku').is('deleted_at', null).or(...)` sorgusundan dönen ürün verisi; `error` yoksa `setProductOptions(data ?? [])` ile güncellenir
  - `error` — Supabase sorgusundan dönen hata nesnesi; falsy ise `data` kullanılır
- **Dönüş**: yok (Promise<void>) — yan etki olarak `setProductOptions` ile ürün arama sonuçlarını günceller

### [N7_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::addLine
- **params**: `product` — ProductOption tipinde; eklenmek istenen ürün nesnesi (`id`, `name`, `sku` alanları içerir)
- **ic_degiskenler**:
  - `prev` — `setLines` callback'indeki mevcut `lines` dizisi; `some` ile aynı ürünün zaten ekli olup olmadığı kontrol edilir
- **Dönüş**: yok — yan etki olarak `setLines` ile satır ekler (veya mevcut diziyi korur), `setProductTerm('')` ve `setProductOptions([])` ile arama alanını sıfırlar

### [N8_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::saveNewSupplier
- **params**: yok
- **ic_degiskenler**:
  - `name` — `newSupplierName.trim()` sonucu; boşsa fonksiyon erken döner
  - `created` — `createSupplier(supabaseBrowserClient, { name, currency })` çağırısından dönen oluşturulan tedarikçi nesnesi; `created.id` ile yeni tedarikçi kimliği alınır
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.warn` ile konsola yazdırılır
- **Dönüş**: yok (Promise<void>) — yan etki olarak tedarikçi oluşturur, toast gösterir, formu sıfırlar, tedarikçi listesini yeniden yükler ve yeni tedarikçiyi seçili yapar

### [N9_NASIL] AST Pointer: src/components/admin/purchasing/CreatePurchaseOrderPanel.tsx::submit
- **params**: yok
- **ic_degiskenler**:
  - `parsed` — `lines` dizisinin `map` ile dönüştürülmüş ve `filter` ile doğrulanmış hali; her elemanda `product_id` (string), `qty_ordered` (Number ile dönüştürülmüş, pozitif tam sayı), `unit_cost` (Number ile dönüştürülmüş, sıfır veya pozitif sonlu sayı) alanları bulunur
  - `l` — `map` ve `filter` callback'lerindeki her DraftLine nesnesi; `l.product.id`, `l.qty`, `l.unitCost` erişimleri yapılır
  - `err` — `catch` bloğunda yakalanan hata nesnesi; `console.warn` ile konsola yazdırılır
- **Dönüş**: yok (Promise<void>) — yan etki olarak `setSubmitting(true/false)` ile yükleme durumunu yönetir, `createPurchaseOrder(supabaseBrowserClient, {...})` çağırır, başarılı olursa toast gösterir ve `onCreated()` çağırır, hata olursa toast.error gösterir

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