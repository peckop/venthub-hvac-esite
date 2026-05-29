---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx
skeleton_hash: b97e5d93501ef882
entity_hashes:
  func:ProductFormModal: 6997b37c35b0ebef
  func:onSubmit: 56cec6a550e2cc75
  overview: 2b203263d8652482
  style_tokens: 553a7b8fa0cd3c86
generated_at: 2026-05-29T18:45:50Z
---

## Genel Bakış
Bu modül, yönetici panelinde ürün ekleme ve düzenleme işlevselliğini sunan bir React form modal bileşenidir. Modül, modalın görünürlüğünü, formun çalışma modunu (yeni kayıt veya mevcut kaydı düzenleme) ve form gönderim sonrasındaki akışı yöneterek kullanıcı arayüzündeki ürün Yönetim sürecini merkezileştirir.

## Fonksiyon Grupları
### Modal Bileşeni ve Yönetimi
Bileşenin temel yapısını, dışarıdan kontrol edilen görünürlük durumunu ve formun başlangıç değerlerini (yeni ürün veya mevcut ürün verileriyle doldurma) yönetir. Prop'lar aracılığıyla modunun açılıp kapanmasını ve üst bileşenle olan etkileşim kurallarını belirler.
- ProductFormModal

### Form Gönderim ve Veri İşleme
Kullanıcı formu doldurup gönderdiğinde tetiklenen asenkron işlemcidir. Doğrulanmış form verilerini alır, bir API isteği gönderir ve işlemin başarısına veya başarısızlığına göre ilgili geri çağırma fonksiyonlarını (onSuccess, onClose) tetikleyerek uygulamanın durumunu günceller.
- onSubmit

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `productSchema` tanımlı değilse, form değerlerinin doğrulaması yapılamaz ve `onSubmit` her zaman hata döndürür.  

**Aksiyom 2**: Eğer `open` prop’u `true` değilse, modal bileşeni DOM’da render edilmez ve kullanıcı hiçbir etkileşimde bulunamaz.  

**Aksiyom 3**: Eğer `onClose` callback’i sağlanmazsa, modal kapatılmak istendiğinde (ör. kullanıcı “İptal” butonuna tıkladığında) hiçbir işlem gerçekleşmez; modal açık kalır.  

**Aksiyom 4**: Eğer `onSuccess` callback’i tanımlı değilse, form başarılı bir şekilde gönderildiğinde (doğrulama ve API çağrısı başarılı) uygulama başka bir yan etki (örn. bildirim, yönlendirme) gerçekleştirmez.  

**Aksiyom 5**: Eğer `_productId` prop’u sağlanmazsa, modal “yeni ürün ekle” modunda çalışır; sağlanırsa “ürün düzenleme” modunda çalışır ve form alanı mevcut ürün bilgileriyle başlangıç değerleri olarak doldurulur.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir ürün ekleme/düzenleme formunu yöneten bir React modal bileşenidir. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `open` prop'u truthy (true veya_truthy bir değer) değilse, modalın görünür olmaması ve formun render edilmemesi gerekir. Aksi takdirde form kullanıcıya hata vermeden gösterilebilir.

[Aksiyom 2]: Eğer `_productId` prop'u sağlanmamışsa (undefined), modülün "yeni ürün ekleme" modunda çalışması ve submit işlemi sırasında bir oluşturma (create) isteği yapması gerekir.

[Aksiyom 3]: Eğer `_productId` prop'u sağlanmışsa (undefined değil), modülün "ürün düzenleme" modunda çalışması, mevcut ürün verilerini form alanlarına doldurması ve submit işlemi sırasında bir güncelleme (update) isteği yapması gerekir.

[Aksiyom 4]: Form alanları `productSchema` ile doğrulanmalıdır. Eğer girilen değerler şemaya uymuyorsa, form submit edilmeli ve kullanıcıya hata gösterilmelidir.

[Aksiyom 5]: Form submit edildiğinde (submit işlemi başarılı olduğunda), `onSuccess` callback'inin çağrılması zorunludur. Çağrılmazsa, dış bileşenler (örn. ürün listesi) güncellenemez.

[Aksiyom 6]: `onClose` callback'inin, modal kapatma isteği (başarılı bir işlem sonrası veya iptal durumunda) oluştuğunda çağrılması beklenir. Çağrılmazsa, modalın açık kalması dışarıdan yönetilemez.

[Aksiyom 7]: Submit işlemi (form verilerinin işlenmesi) asenkron bir süreçtir. İşlem devam ederken formun tekrar tekrar submit edilmesi (çift tıklama vb.) engellenmelidir; aksi halde birden fazla istek gönderilebilir.

[Aksiyom 8`: Modül, `open` prop'unun değişkenliğine (true/false geçişlerine) tepki vererek form durumunu (dolu/boş alanlar, hata durumları) resetlemelidir. Aksi halde önceki form verileri yeni bir açılışta kalabilir.

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

### [N1_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::ProductFormModal
- **params**: `_productId` — düzenlenecek ürünün ID'si (yeni ürün ise undefined), `open` — modalın açık olup olmadığı boolean, `onClose` — modalı kapatma callback fonksiyonu, `onSuccess` — başarılı işlem sonrası çağrılan callback fonksiyonu
- **ic_degiskenler**:
  - `t` — useI18n hookundan dönen çeviri fonksiyonu, UI metinlerini lokalize etmek için kullanılır
  - `loading` — form gönderimi veya veri yükleme sırasında true olan boolean durum değişkeni
  - `setLoading` — loading durumunu güncelleyen state setter
  - `categories` — DbCategory dizisi, Supabase'den çekilen kategori listesi, formdaki kategori select dropdown'ını doldurur
  - `setCategories` — categories durumunu güncelleyen state setter
  - `register` — react-hook-form register fonksiyonu, form inputlarını form state'e bağlar
  - `handleSubmit` — react-hook-form'un submit wrapper'ı, validasyon sonrası onSubmit callback'ini çağırır
  - `reset` — form alanlarını sıfırlayan veya varsayılan/fetch edilen değerlerle dolduran react-hook-form fonksiyonu
  - `errors` — formState içinden alınan validasyon hataları nesnesi, her alan için hata mesajı içerir
  - `loadProduct` — useCallback ile sarılı async fonksiyon, verilen ID ile Supabase'den ürün çekip form alanlarını doldurur
  - `onSubmit` — form gönderiminde çalışan async fonksiyon, ürün oluşturma veya güncelleme işlemini yürütür
- **Dönüş**: JSX element (Dialog bileşeni) veya `null` (modal kapalıyken)

### [N2_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::loadProduct
- **params**: `id` — string, yüklenecek ürünün benzersiz ID'si
- **ic_degiskenler**:
  - `product` — Supabase'den dönen `data` alanının alias'ı, tüm ürün alanlarını (name, sku, brand, price, vb.) içeren DbProduct nesnesi; `reset` ile form alanlarına dağıtılır
  - `error` — Supabase `.single()` sorgusundan dönen hata nesnesi, varsa `throw` edilir
- **Dönüş**: yok (yan etki: `setLoading` ile loading durumunu değiştirir, `reset` ile formu doldurur, hata olursa `toast.error` gösterir)

### [N3_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::fetchCategoriesEffect
- **params**: yok
- **ic_degiskenler**:
  - `fetchCategories` — useEffect içinde tanımlı async inner fonksiyon, Supabase'den tüm kategorileri çeker ve `setCategories` ile state'e yazar
- **Dönüş**: yok (yan etki: bileşen mount edildiğinde kategorileri yükler)

### [N4_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::fetchCategories
- **params**: yok
- **ic_degiskenler**:
  - `data` — Supabase categories tablosundan dönen DbCategory dizisi, `order('name')` ile alfabetik sıralanmış; `setCategories(data || [])` ile state'e atanır
- **Dönüş**: yok (yan etki: `setCategories` çağrısı ile state güncellenir)

### [N5_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::useEffectOpenHandler
- **params**: yok
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: modal açıldığında `_productId` varsa `loadProduct(_productId)` çağırır, yoksa formu varsayılan değerlerle `reset` eder)

### [N6_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::onSubmit
- **params**: `values` — ProductFormValues, react-hook-form tarafından doğrulanmış form değerleri (name, sku, brand, category_id, status, price, vb.)
- **ic_degiskenler**:
  - `payload` (if dalı) — DbProductUpdate türünde güncelleme yükü, `values` spread edilir ve `technical_specs` DbJson'a cast edilir
  - `error` (if dalı) — Supabase `.update()` sorgusundan dönen hata nesnesi, varsa `throw` edilir
  - `payload` (else dalı) — DbProductInsert türünde oluşturma yükü, `values` spread edilir ve `technical_specs` DbJson'a cast edilir
  - `error` (else dalı) — Supabase `.insert()` sorgusundan dönen hata nesnesi, varsa `throw` edilir
- **Dönüş**: yok (yan etki: `setLoading` ile loading durumunu değiştirir, `toast.success` gösterir, `onSuccess()` ve `onClose()` callback'lerini çağırır, hata olursa `toast.error` gösterir)

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