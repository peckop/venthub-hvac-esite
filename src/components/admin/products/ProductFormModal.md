---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx
skeleton_hash: 6434b7045931a363
entity_hashes:
  func:ProductFormModal: 6997b37c35b0ebef
  func:onSubmit: 56cec6a550e2cc75
  overview: d2db197943752315
  style_tokens: 553a7b8fa0cd3c86
generated_at: 2026-06-06T21:54:55Z
---

## Genel Bakış
Bu modül, yönetici panelinde yeni ürün ekleme veya mevcut ürünü düzenleme işlevini sunan bir form modalı bileşenidir. Kullanıcı arayüzündeki formun görünür olmasını, ilgili verilerle doldurulmasını ve gönderim sonrasındaki iş akışını (başarı/hata durumunda yapılacaklar) yönetir.

## Fonksiyon Grupları
### Modal Bileşeni ve Görünüm Yönetimi
Bileşenin temel yapısını ve dışarıdan kontrol edilen durumunu (açık/kapalı, veri modu) yönetir. Kullanıcı etkileşimi için gerekli arayüzü oluşturur ve formun hangi verilerle başlayacağına karar verir.
- ProductFormModal

### Form İşlemleri ve Gönderim Akışı
Kullanıcının doldurduğu form verilerini doğrulayıp sunucuya gönderen asenkron işlemciyi barındırır. İşlemin sonucuna göre bir sonraki adımı (başarılı kayıt sonrası kapatma veya hata gösterimi) tetikler.
- onSubmit

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca fonksiyon imzası ve modül sabitlerinden çıkarılabilen temel mimari varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer `open` prop'u `true` değerini almazsa, modal bileşeni render edilmez ve form kullanıcıya gösterilmez.

[Aksiyom 2]: Eğer `onClose` callback'i sağlanmazsa, modalın kapanması tetiklendiğinde üst bileşen durumdan haberdar olamaz ve modal kapanma akışı bozulur.

[Aksiyom 3]: Eğer `onSuccess` callback'i sağlanmazsa, form başarıyla gönderildikten sonra üst bileşen (örn: ürün listesi tablosu) yenilenemez veya kullanıcıya başarı bildirimi gösterilemez.

[Aksiyom 4]: Eğer `_productId` prop'u `undefined` (veya geçersiz bir değer) olarak verilirse, form "yeni ürün ekleme" modunda çalışır; aksi halde mevcut ürün verileriyle doldurularak "düzenleme" modunda çalışır.

[Aksiyom 5]: Eğer `productSchema` (validasyon şeması) çağrılamazsa veya tanımlı değilse, form alanları için geçerlik doğrulaması (zorunlu alan, veri tipi, eşik değerleri vb.) çalıştırılamaz ve geçersiz veriler gönderilebilir.

[Aksiyom 6]: Eğer `onSubmit` fonksiyonu çağrıldığında `ProductFormValues` tipli `values` parametresi sağlam bir nesne (tüm zorunlu alanları içerecek şekilde) değilse, form verileri işlenemez veya API isteği başarısız olur.

[Aksiyom 7]: Eğer `onSubmit` fonksiyonu成功le (Promise resolve) dönmezse, modal kapanmaz ve kullanıcıya başarı bildirimi gösterilmez.

[Aksiyom 8]: Eğer `open` prop'u `true` iken `_productId` değişirse, form mevcut değerleri temizleyip yeni ürün verileriyle (veya sıfır değerlerle) yeniden başlatılmalıdır; aksi halde önceki ürün verileri form alanlarında kalır.

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

### [N1_NASIL] AST Pointer: ProductFormModal.tsx::ProductFormModal
- **params**: ({ _productId, open, onClose, onSuccess })
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `loading` — asenkron işlemler için yükleme durumunu tutan state değişkeni
  - `categories` — DbCategory dizisi tutan state değişkeni, kategori listesini tutar
  - `register` — react-hook-form'dan gelen input kayıt fonksiyonu
  - `handleSubmit` — react-hook-form'dan gelen form gönderim fonksiyonu
  - `reset` — react-hook-form'dan gelen form sıfırlama fonksiyonu
  - `errors` — formState içinden alınan form hata nesnesi
  - `loadProduct` — useCallback ile tanımlanan, verilen ID ile ürün yükleyen asenkron fonksiyon
  - `fetchCategories` — useEffect içinde tanımlanan, kategorileri yükleyen asenkron fonksiyon
- **Dönüş**: JSX elementi (Dialog bileşeni) veya null (open=false ise)

### [N2_NASIL] AST Pointer: ProductFormModal.tsx::onSubmit
- **params**: (values: ProductFormValues)
- **ic_degiskenler**:
  - `payload` — DbProductUpdate veya DbProductInsert türünde, form değerlerinden oluşturulmuş güncelleme/ekleme verisi
  - `_productId` — üst kapsamdan gelen, ürünün ID'si (güncelleme durumunda kullanılır)
- **Dönüş**: yok (yan etkiler: veritabanı güncelleme/ekleme, toast bildirimleri, onSuccess/onClose çağrıları)

### [N3_NASIL] AST Pointer: ProductFormModal.tsx::loadProduct
- **params**: (id: string)
- **ic_degiskenler**:
  - `id` — yüklenen ürünün ID'si
  - `product` — supabase'den gelen ürün verisi (select sorgusundan)
  - `error` — supabase sorgu hatası (varsa)
- **Dönüş**: yok (yan etkiler: formu ürün verisiyle doldurur, loading durumunu yönetir, hata gösterir)

### [N4_NASIL] AST Pointer: ProductFormModal.tsx::fetchCategories
- **params**: ()
- **ic_degiskenler**:
  - `data` — supabase'den gelen kategori verisi (DbCategory[] dizisi)
- **Dönüş**: yok (yan etkiler: categories state'ini günceller)

### [N5_NASIL] AST Pointer: ProductFormModal.tsx::useEffect (kategoriler için)
- **params**: ()
- **ic_degiskenler**:
  - `fetchCategories` — yukarıdaki fetchCategories fonksiyonu
- **Dönüş**: yok (yan etkiler: bileşen yüklendiğinde kategorileri çeker)

### [N6_NASIL] AST Pointer: ProductFormModal.tsx::useEffect (ürün yükleme için)
- **params**: ()
- **ic_degiskenler**:
  - `open` — dialog'ın açık olup olmadığını belirten prop
  - `_productId` — yüklenen ürünün ID'si (yeni ürün ekleniyorsa undefined)
  - `loadProduct` — yukarıdaki loadProduct fonksiyonu
  - `reset` — form sıfırlama fonksiyonu
- **Dönüş**: yok (yan etkiler: dialog açıldığında ürün yükler veya formu sıfırlar)

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