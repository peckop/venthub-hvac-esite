---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx
skeleton_hash: dd3fa6b546bc96f0
entity_hashes:
  func:ProductFormModal: 6997b37c35b0ebef
  func:onSubmit: 56cec6a550e2cc75
  overview: bdc9be85385803dd
  style_tokens: 553a7b8fa0cd3c86
generated_at: 2026-06-08T10:08:37Z
---

## Genel Bakış
Bu modül, yönetici panelinde ürün ekleme ve düzenleme işlemlerini gerçekleştiren bir form modalı bileşenidir. Kullanıcıya form gösterimi, veri doldurma ve gönderim sonrası iş akışlarını (başarı/hata durumlarını) yöneten bir arayüz sağlar.

## Fonksiyon Grupları
### Modal Bileşeni ve Görünüm Yönetimi
Bileşenin açılıp kapanmasını, veri modunu (yeni ürün veya düzenleme) ve form alanlarının başlangıç değerlerini dış prop'lar aracılığıyla kontrol eder.
- ProductFormModal

### Form İşlemleri ve Gönderim Akışı
Kullanıcının doldurduğu form verilerini sunucuya gönderen ve sürecin sonucuna göre (başarılı kaydetme, hata) ilgili geri bildirimleri tetikleyen iş mantığını yürütür.
- onSubmit

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ürün ekleme/düzenleme formunu yöneten bir React modal bileşenidir. Doğru çalışması için aşağıdaki varsayımlar geçerlidir.

**[Aksiyom 1]**: Eğer `onClose` callback'i sağlanmamışsa, modal kapatma işlemi（tuş tıklaması, backdrop tıklaması, ESC tuşu）sonucunda uygulama hata verir veya modal kapanamaz.

**[Aksiyom 2]**: Eğer `onSuccess` callback'i sağlanmamışsa, form gönderimi başarılı olduğunda üst bileşen bilgilendirilemez; başarı durumu UI'da görünmesine rağmen üst seviye akış（örn: liste yenileme）çalışmaz.

**[Aksiyom 3]**: Eğer `productSchema` geçerli bir Zod/joi gibi bir validation şeması olarak çağrılamıyorsa, form alanları doğrulanamaz ve hatalı veriler `onSubmit` fonksiyonuna ulaşır.

**[Aksiyom 4]**: Eğer `_productId` parametresi `undefined` veya `null` olarak verilmişse, form "yeni ürün ekleme" modunda açılmalıdır；değer verilmişse, ilgili ürün verisiyle "düzenleme" modunda açılmalıdır.

**[Aksiyom 5]**: Eğer `open` parametresi `false` ise ve modal iç bileşen buna rağmen render edilmeye devam ediyorsa, gereksiz API çağrıları veya form state bozulmaları oluşur.

**[Aksiyom 6]**: Eğer `_productId` düzenleme modunda verilmiş ancak ilgili ürün ID'si backend'de mevcut değilse, form verilerinin yüklenemesi durumunda kullanıcıya hata bildirimi yapılmalıdır；aksi halde boş form ile sessiz düzenleme yapılır.

**[Aksiyom 7]**: Eğer `onSubmit` fonksiyonu `ProductFormValues` tipinde geçerli bir değer almıyorsa（örn: validation başarısız olduğunda form yine de submit edilirse），beklenmeyen veri yapısı hatası oluşur.

---

## FONKSİYON DETAYLARI

### ProductFormModal
**Ne yapar**: Bu fonksiyon, ürün ekleme veya düzenleme işlemleri için kullanılan bir modal form bileşenini tanımlar. Belirtilen ürün ID'sine göre yeni ürün oluşturma veya mevcut ürünü düzenleme amacı taşır.

**Nasıl yapar**: Bileşen, açık/kapalı durumu `open` prop'u ile kontrol edilen bir modal yapısı içerir. Form alanları ve geçerlilik kontrolleri bileşen içinde yönetilir; form gönderimi `onSubmit` fonksiyonu ile gerçekleştirilir.

**Parametreler**:
- `_productId: any` — Düzenlenecek ürünün benzersiz kimliği. Yeni ürün oluştururken `null` veya `undefined` olabilir.
- `open: boolean` — Modalın görünür olup olmadığını belirleyen kontrol değişkeni.
- `onClose: () => void` — Modal kapatıldığında çağrılan geri çağırma fonksiyonu.
- `onSuccess: () => void` — Form başarıyla gönderildikten sonra çağrılan başarı bildirim fonksiyonu.

**Dönüş**: `JSX.Element` — Render edilen modal bileşenini döndürür.

### onSubmit
**Ne yapar**: `ProductFormModal` bileşeni içinde formun gönderilmesiyle tetiklenen işleyici fonksiyondur. Form değerlerini alarak gerekli doğrulama ve API çağrılarını başlatır.

**Nasıl yapar**: Parametre olarak gelen `ProductFormValues` nesnesini işler; genellikle bir API servisine POST veya PUT isteği yapar ve başarılı sonuçta `onSuccess` prop'unu çağırarak üst bileşene bildirim gönderir.

**Parametreler**:
- `values: ProductFormValues` — Formdaki tüm alan değerlerini içeren veri nesnesi.

**Dönüş**: Kod parçasında dönüş tipi belirtilmemiştir; yaygın kullanımda `void` veya `Promise<void>` döndürebilir.

---

## INTERFACES

### ProductFormModalProps
- `_productId?: string | null`
- `open: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

---

## TYPE ALIASES

### ProductFormValues
```typescript
type ProductFormValues = z.infer<typeof productSchema>
```

---

## SABİTLER
- **productSchema** (call) — `z.object({
    name: z.string().min(3, 'İsim en az 3 karakter olmalı'),
   ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `components/admin/products/ProductFormModal.tsx`::ProductFormModal
- **params**: `(_productId, open, onClose, onSuccess)` — ürün ID, modal açık/kapalı durumu, kapatma callback'i, başarılı kayıt sonrası callback'i
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, UI metinleri için kullanılır
  - `loading` — `useState(false)` ile tanımlı, form submission ve veri yükleme sırasında spinner kontrolü yapar
  - `setLoading` — `loading` state setter'ı, `loadProduct` ve `onSubmit` içinde true/false ayarlanır
  - `categories` — `useState<DbCategory[]>([])` ile tanımlı, supabase'den çekilen kategori listesini tutar
  - `setCategories` — `categories` state setter'ı, `fetchCategories` içinde doldurulur
  - `register` — `react-hook-form`'dan gelen register fonksiyonu, form input'larına bağlanır (`register('name')`, `register('sku')` vs.)
  - `handleSubmit` — `react-hook-form`'dan gelen submit handler sarmalayıcısı, form onSubmit'e `handleSubmit(onSubmit)` olarak bağlanır
  - `reset` — `react-hook-form`'dan gelen form reset fonksiyonu, `loadProduct` içinde ürün verisiyle, open effect içinde varsayılan değerlerle çağrılır
  - `errors` — `formState.errors` destructured, form validasyon hatalarını tutar (`errors.name`, `errors.sku`)
  - `loadProduct` — `useCallback` ile tanımlı, `_productId` olduğunda supabase'den ürün çeker ve formu doldurur
  - `onSubmit` — form gönderim handler'ı, ürün oluşturur veya günceller
- **Dönüş**: JSX — `Dialog.Root` ile sarılmış modal UI, `!open` ise `null`

### [N2_NASIL] AST Pointer: `components/admin/products/ProductFormModal.tsx`::loadProduct
- **params**: `(id: string)` — yüklenecek ürünün UUID'si
- **ic_degiskenler**:
  - `product` — `supabase.from('products').select(...).eq('id', id).single()` sonucu `data` field'ından destructured, tüm ürün alanlarını (name, sku, brand, price, category_id, technical_specs vs.) içerir
  - `error` — aynı supabase sorgusundan destructured hata nesnesi, `if (error) throw error` ile yukarı fırlatılır
- **Dönüş**: yok — `reset()` ile form state'ini doldurur, `setLoading(true/false)` ile loading durumunu yönetir, hata olursa `toast.error('Ürün yüklenemedi')` gösterir

### [N3_NASIL] AST Pointer: `components/admin/products/ProductFormModal.tsx`::useEffect[fetchCategories]
- **params**: yok
- **ic_degiskenler**:
  - `fetchCategories` — iç içe tanımlı asenkron fonksiyon, supabase'den tüm kategorileri çeker
  - `data` — `supabase.from('categories').select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, ...').order('name').returns<DbCategory[]>()` sonucundan destructured kategori dizisi, `setCategories(data || [])` ile state'e yazılır
- **Dönüş**: yok — `[]` bağımlılık dizisi ile component mount'ta bir kez çalışır

### [N4_NASIL] AST Pointer: `components/admin/products/ProductFormModal.tsx`::fetchCategories
- **params**: yok
- **ic_degiskenler**:
  - `data` — `supabase.from('categories').select('id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content').order('name').returns<DbCategory[]>()` sonucundan destructured kategori dizisi, `setCategories(data || [])` ile state'e atanır
- **Dönüş**: yok — parent scope'taki `setCategories` ile side-effect üretir

### [N5_NASIL] AST Pointer: `components/admin/products/ProductFormModal.tsx`::useEffect[openState]
- **params**: yok
- **ic_degiskenler**:
  - (ekstra iç değişken yok — doğrudan `open`, `_productId`, `loadProduct`, `reset` kullanılır)
- **Dönüş**: yok — `open && _productId` olduğunda `loadProduct(_productId)` çağırır, `open && !_productId` olduğunda `reset()` ile formu varsayılan değerlere sıfırlar (`status: 'active', stock_qty: 0, low_stock_threshold: 5, price: 0`)

### [N6_NASIL] AST Pointer: `components/admin/products/ProductFormModal.tsx`::onSubmit
- **params**: `(values: ProductFormValues)` — formdan gelen doğrulanmış form değerleri (name, sku, brand, price, category_id, status, technical_specs vs.)
- **ic_degiskenler**:
  - `payload` — `DbProductUpdate` veya `DbProductInsert` türünde, `values` spread edilip `technical_specs` alanının `DbJson` tipine cast edildiği nesne; `_productId` varsa update, yoksa insert için kullanılır
  - `error` — `supabase.from('products').update(payload).eq('id', _productId)` veya `supabase.from('products').insert([payload])` sonucundan destructured hata nesnesi, `if (error) throw error` ile yakalanır
- **Dönüş**: yok — başarılıysa `toast.success(...)`, `onSuccess()`, `onClose()` çağırır; hata olursa `toast.error(t('admin.common.error'))` gösterir; her iki durumda da `setLoading(false)` ile loading'i kapatır

---

## NODE ID STANDARD

  file: src\components\admin\products\ProductFormModal.tsx
  function: src\components\admin\products\ProductFormModal.tsx::ProductFormModal
  function: src\components\admin\products\ProductFormModal.tsx::onSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductFormModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/50`, `bg-primary-navy`, `bg-white`, `hover:bg-blue-700`, `hover:bg-slate-100`, `hover:bg-slate-50`, `text-industrial-gray`, `text-red-500`, `text-slate-500`, `text-white`, `text-xl`, `text-xs`
- **Layout:** `backdrop-blur-sm`, `fixed`, `flex`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `items-center`, `justify-between`, `justify-end`, `left-1/2`, `max-h-90vh`, `max-w-2xl`, `md:grid-cols-2`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `-translate-x-1/2`, `-translate-y-1/2`, `animate-spin`, `border`, `focus-visible:outline-none`, `font-bold`, `inset-0`, `mb-6`, `mt-8`, `px-4`, `px-6`, `py-2`, `rounded-2xl`, `rounded-full`, `rounded-lg`