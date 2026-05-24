---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx
skeleton_hash: b97e5d93501ef882
generated_at: 2026-05-23T21:54:34Z
---

## Genel Bakış
`ProductFormModal` bileşeni, ürün ekleme veya düzenleme işlemlerini bir modal pencerede sunar. Kullanıcı formu doldurup gönderdiğinde, `onSubmit` fonksiyonu tetiklenerek veriler doğrulanır ve sunucuya iletilir; işlem sonucuna göre geri bildirim verilir ve modal kapatılır.

## Fonksiyon Grupları
### UI & Etkileşim
Bu grup, modalın görünümünü, kullanıcıyla etkileşimini ve formun temel yapısını yönetir.  
- ProductFormModal

### İş Mantığı & Veri İşleme
Bu grup, form verilerinin alınması, doğrulanması, sunucuya gönderilmesi ve sonuçların işlenmesini sorumlular.  
- onSubmit (form gönderildiğinde ProductFormModal içinde çağrılır)

---

## AXIOMS – Mimari Varsayımlar
ProductFormModal bileşenin doğru çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `_productId` prop’u verilmezse, modal yeni ürün oluşturma (create) modunda çalışır; verilirse mevcut ürünü düzenleme (edit) modunda çalışır.  
[Aksiyom 2]: Eğer `open` prop’u `false` ise, modal ekranda render edilmez; `true` ise modal görünür hale gelir.  
[Aksiyom 3]: Eğer `onClose` prop’u tanımsız (undefined) ise, kullanıcı modalı kapatmaya çalıştığında hiçbir işlem yapılmaz (noop).  
[Aksiyom 4]: Eğer `onSuccess` prop’u tanımsız ise, form başarıyla gönderildikten sonra herhangi bir başarı geri bildirimi çağrılmaz.  
[Aksiyom 5]: Eğer `productSchema` sabiti tanımlı değil veya geçersiz bir şema içeriyorsa, form doğrulama işlemi başarısız olur veya hata fırlatır.  
[Aksiyom 6]: Eğer `onSubmit` fonksiyonuna `ProductFormValues` tipine uymayan bir değer geçirilirse, form gönderimi reddedilir veya hata oluşur.

---

## FONKSIYON DETAYLARI

### ProductFormModal
**Ne yapar**: Ürün ekleme veya düzenleme işlemi için bir modal pencere gösterir ve form üzerinden kullanıcı girdilerini toplar.  
**Nasıl yapar**: `React.FC` türünde bir bileşen olarak tanımlanır; props üzerinden `_productId`, `open`, `onClose` ve `onSuccess` değerlerini alır. `open` doğru olduğunda modal görünür, form gönderildiğinde `onSubmit` fonksiyonu çağrılır ve işlem sonucuna göre `onSuccess` veya `onClose` tetiklenir.  
**Parametreler**:  
- _productId: type not specified — Düzenlenecek ürünün kimliği; yeni ürün için boş veya undefined olabilir.  
- open: type not specified — Modalın açık olup olmadığını belirten bayrak değeri.  
- onClose: type not specified — Modalı kapatmak için çağrılacak fonksiyon.  
- onSuccess: type not specified — Form başarıyla gönderildikten sonra çalışacak fonksiyon.  
**Dönüş**: React.FC<ProductFormModalProps> — JSX elementi döndüren bir React bileşeni.

### onSubmit
**Ne yapar**: Formdan gelen ürün verilerini alır, sunucuya kaydetme veya güncelleme isteği gönderir ve işlem sonucunu yönetir.  
**Nasıl yapar**: `values: ProductFormValues` parametresini alır; bu nesne form alanlarının değerlerini içerir. Fonksiyon içeriğinde genellikle bir API çağrısı (örneğin `axios.post` veya `put`) yapılır, başarılı yanıt alındığında `onSuccess` props’u çağrılır, hata durumunda ise hata yönetimi gerçekleştirilir.  
**Parametreler**:  
- values: type not specified — Formdaki tüm giriş alanlarının değerlerini içeren nesne (örneğin isim, fiyat, stok gibi ürün özellikleri).  
**Dönüş**: dönüş tipi belirtilmemiş; genellikle `void` olarak kabul edilir (işlem sonucu props üzerinden iletilir).

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx::ProductFormModal
- **params**: _productId, open, onClose, onSuccess
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, useI18n'den elde edilen t nesnesi
  - `loading` — yükleme durumu tutan boolean state
  - `setLoading` — loading state'ini güncelleyen setter fonksiyonu
  - `categories` — veritabanından çekilen kategori listesi (DbCategory[])
  - `setCategories` — categories state'ini güncelleyen setter
  - `register` — react-hook-form register fonksiyonu, form inputlarını bağlamak için
  - `handleSubmit` — form gönderimini yöneten useForm'dan gelen handler
  - `reset` — form değerlerini sıfırlamak veya başlangıç değerlerini ayarlamak için kullanılan fonksiyon
  - `errors` — form validation hatalarını içeren nesne
  - `loadProduct` — ürün ID'sine göre ürün verisini getiren useCallback ile memoize edilmiş async fonksiyon
  - `onSubmit` — form gönderildiğinde çalışan async submit handler
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx::loadProduct
- **params**: id: string
- **ic_degiskenler**:
  - `product` — supabase'den çekilen ürün kaydının data kısmı
  - `error` — supabase sorgusundan dönen hata nesnesi
- **Dönüş**: Promise<void>

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx::useEffect_fetchCategories
- **params**: (yok)
- **ic_degiskenler**:
  - `fetchCategories` — kategorileri supabase'den çekip state'i güncelleyen async fonksiyon
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx::useEffect_openHandler
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductFormModal.tsx::onSubmit
- **params**: values: ProductFormValues
- **ic_degiskenler**:
  - `payload` — form değerleriyle technical_specs alanını DbJson olarak cast edilmiş güncelleme/ekleme nesnesi
  - `error` — supabase update/insert işlemindeki hata nesnesi
- **Dönüş**: Promise<void>

---

## NODE ID STANDARD

  file: src\components\admin\products\ProductFormModal.tsx
  function: src\components\admin\products\ProductFormModal.tsx::ProductFormModal
  function: src\components\admin\products\ProductFormModal.tsx::onSubmit

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductFormModal