---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx
skeleton_hash: b97e5d93501ef882
entity_hashes:
  func:ProductFormModal: 6997b37c35b0ebef
  func:onSubmit: 56cec6a550e2cc75
  overview: 12f9cde3f23a5605
  style_tokens: 553a7b8fa0cd3c86
generated_at: 2026-05-27T18:10:54Z
---

## Genel Bakış
Bu modül, yönetici paneli ürün yönetimi için ürün ekleme ve düzenleme işlemlerini gerçekleştiren bir form modal bileşenidir. Modalın açık/kapalı durumunu, form verilerini ve işlem sonuçlarını dışarıdan gelen prop'lar aracılığıyla yönetir.

## Fonksiyon Grupları
### Modal Ana Bileşeni
Modalın temel yapısını, görünürlük durumunu ve formun çalışma modunu (yeni ürün ekleme / mevcut ürünü düzenleme) yönetir. Dışarıdan gelen prop'ları işleyerek formun doğru şekilde çalışmasını sağlar.
- ProductFormModal

### Form Gönderim İşleyicisi
Formdan alınan verileri işleyerek ürün ekleme veya düzenleme işlemini gerçekleştirir. İşlem başarılı olduğunda ilgili geri çağırmaları tetikleyerek modalın kapanmasını ve ana bileşenin bilgilendirilmesini sağlar.
- onSubmit

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `productSchema` tanımlı değilse, form değerlerinin doğrulaması yapılamaz ve `onSubmit` her zaman hata döndürür.  

**Aksiyom 2**: Eğer `open` prop’u `true` değilse, modal bileşeni DOM’da render edilmez ve kullanıcı hiçbir etkileşimde bulunamaz.  

**Aksiyom 3**: Eğer `onClose` callback’i sağlanmazsa, modal kapatılmak istendiğinde (ör. kullanıcı “İptal” butonuna tıkladığında) hiçbir işlem gerçekleşmez; modal açık kalır.  

**Aksiyom 4**: Eğer `onSuccess` callback’i tanımlı değilse, form başarılı bir şekilde gönderildiğinde (doğrulama ve API çağrısı başarılı) uygulama başka bir yan etki (örn. bildirim, yönlendirme) gerçekleştirmez.  

**Aksiyom 5**: Eğer `_productId` prop’u sağlanmazsa, modal “yeni ürün ekle” modunda çalışır; sağlanırsa “ürün düzenle” modunda çalışır ve `productSchema`/form başlangıç değerleri bu kimliğe göre doldurulur.  

**Aksiyom 6**: Eğer `onSubmit` fonksiyonuna geçirilen `values` nesnesi `productSchema` ile uyumlu değilse, gönderim sırasında doğrulama hatası fırlatılır ve `onSuccess` çağrılmaz.  

**Aksiyom 7**: Eğer `ProductFormValues` tipindeki zorunlu alanlar eksik ya da `null`/`undefined` ise, `onSubmit` içinde bu eksiklikler tespit edilir ve form gönderimi reddedilir. (Bu alanların tam listesi **bilinmiyor**; tip tanımından çıkarılamamıştır.)

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
- **params**: `_productId, open, onClose, onSuccess`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook’den gelen çeviri fonksiyonu.
  - `loading` — form ve veri işlemleri sırasında gösterilen yükleme durumu (boolean).
  - `setLoading` — `loading` değerini güncelleyen state setter.
  - `categories` — veritabanından çekilen kategori listesi (DbCategory[]).
  - `setCategories` — `categories` değerini güncelleyen state setter.
  - `register` — form alanlarını `react-hook-form` ile bağlamak için kullanılan fonksiyon.
  - `handleSubmit` — form submit olayını `react-hook-form` ile sarmalayan fonksiyon.
  - `reset` — form alanlarını varsayılan ya da çekilen değerlerle sıfırlayan fonksiyon.
  - `errors` — form doğrulama hatalarını içeren nesne (`formState.errors`).
  - `loadProduct` — ürün detaylarını id’ye göre çeken `useCallback` fonksiyonu (aşağıda ayrı olarak tanımlanmıştır).
  - `onSubmit` — form gönderildiğinde çalıştırılan async fonksiyon (aşağıda ayrı olarak tanımlanmıştır).
- **Dönüş**: JSX element (React component output). Fonksiyon yan etkileri: state güncellemeleri, veri çekme, toast bildirimleri.

### [N2_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::loadProduct
- **params**: `id`
- **ic_degiskenler**:
  - `setLoading` — dışarıdaki `loading` state’ini `true` yapar.
  - `product` — `supabase.from('products').select(...).eq('id', id).single()` sorgusundan dönen ürün verisi.
  - `error` — aynı sorgudan dönen olası hata nesnesi.
  - `reset` — form alanlarını `product` verisiyle doldurur.
- **Dönüş**: yok (void). Yan etkileri: `loading` state’i, form `reset`, hata durumunda toast gösterimi.

### [N3_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::fetchCategories (inner function of useEffect)
- **params**: (yok)
- **ic_degiskenler**:
  - `setCategories` — dışarıdaki `categories` state’ini günceller.
  - `data` — `supabase.from('categories').select(...).order('name').returns<DbCategory[]>()` sorgusundan dönen kategori dizisi.
- **Dönüş**: yok (void). Yan etkileri: `categories` state’ini doldurur.

### [N4_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::openEffect (second useEffect)
- **params**: (yok)
- **ic_degiskenler**:
  - `open` — modalın açık/kapalı durumu.
  - `_productId` — düzenleme modunda mevcut ürün id’si.
  - `loadProduct` — `_productId` mevcutsa ürün detaylarını çeken fonksiyon.
  - `reset` — yeni ürün ekleme modunda formu varsayılan değerlere sıfırlar.
- **Dönüş**: yok (void). Yan etkileri: koşula bağlı olarak `loadProduct` çağrısı veya `reset`.

### [N5_NASIL] AST Pointer: src/components/admin/products/ProductFormModal.tsx::onSubmit
- **params**: `values`
- **ic_degiskenler**:
  - `setLoading` — işlem başlangıcında `true`, sonunda `false` yapar.
  - `payload` — gönderilecek veri nesnesi; `values` içeriğini yayar ve `technical_specs` alanını `DbJson` tipine dönüştürür. Tipi `_productId` var ise `DbProductUpdate`, yok ise `DbProductInsert`.
  - `error` — `supabase` insert/update işlemlerinden dönen olası hata.
  - `toast` — işlem sonucuna göre başarı veya hata mesajı gösterir.
  - `onSuccess` — dışarıdan gelen, işlem başarılı olduğunda çalıştırılan callback.
  - `onClose` — modalı kapatan dışarıdan gelen callback.
  - `t` — hata mesajı çevirisi için kullanılan i18n fonksiyonu.
- **Dönüş**: yok (void). Yan etkileri: veri tabanı güncellemesi/eklemesi, toast bildirimleri, `onSuccess` ve `onClose` callback’lerinin tetiklenmesi.

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