---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutPayment.ts
skeleton_hash: 0a385ab6e790d39a
generated_at: 2026-05-23T22:29:39Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme adımı için geliştirilmiş özel bir React hook'udur. Sepet içeriği, kullanıcı bilgileri, sepet hesaplama ve temizleme metotları gibi gerekli tüm bağımlılıkları alarak ödeme akışının temel mantığını yönetir. Sunucu tarafı fiyatlandırma ayarlarını da sürece entegre ederek tutarlı ve güncel bir ödeme deneyimi sunar.

## Fonksiyon Grupları
### Ana Ödeme Yönetim Hook'u
Modülün tek ana bileşeni olarak tüm ödeme sürecini tek merkezden yönetir, aldığı tüm bağımlılıkları birleştirerek kullanıcıların sepetten ödemeyi sorunsuz şekilde tamamlamasını sağlar.
- useCheckoutPayment

### Entegre Yardımcı Metotlar ve Veri Kaynakları
Ana ödeme hook'u tarafından kullanılan, sepet işlemleri, fiyat hesaplamaları ve kullanıcı/ürün verilerini yöneten bileşenleri içerir, ödeme süreci için gerekli tüm destekleyici işlevleri karşılar.
- getCartTotal, clearCart, applyServerPricing, items, user

---

## AXIOMS – Mimari Varsayımlar
Bu ödeme akışı yönetim hook'u useCheckoutPayment, kendisine iletilen tüm zorunlu veri prop'ları ve callback fonksiyonların eksiksiz ve geçerli olarak sağlanmasına bağlıdır; herhangi bir zorunlu bağımlılığın eksikliği ödeme sürecinin başlamasını engeller veya yanlış çalışmasına neden olur.

[Aksiyom 1]: Eğer sepetteki ürünleri içeren items prop'u yoksa, ödeme için gereken ürün listesi oluşturulamadığından toplam tutar hesaplanamaz ve ödeme süreci başlatılamaz.
[Aksiyom 2]: Eğer sepet toplamını hesaplayan getCartTotal callback fonksiyonu yoksa, ödeme için gereken nihai tutar hesaplanamayacağından ödeme adımları ilerletilemez.
[Aksiyom 3]: Eğer giriş yapmış kullanıcının verilerini içeren user prop'u yoksa, kullanıcı kimliği doğrulanamadığından ödeme yetkilendirmesi başarısız olur.
[Aksiyom 4]: Eğer ödeme sonrası sepeti sıfırlayan clearCart callback fonksiyonu yoksa, başarılı ödemenin ardında sepet içeriği temizlenemediği için kullanıcı tekrarlanan ödeme ekranında yanlış ürün listesiyle karşılaşır.
[Aksiyom 5]: Eğer sunucu tarafı fiyatlandırma düzenlemelerini uygulayan applyServerPricing callback fonksiyonu yoksa, yerel olarak hesaplanan sepet toplamı gerçek ödeme tutarıyla eşleşmeyeceğinden ödeme işleminde tutarsızlık oluşur.
[Aksiyom 6]: Eğer para birimi ve bölgesel ayarları içeren cu prop'u yoksa, ödeme tutarının gösterimi ve bölgesel ödeme kurallarına uygun işlem yapılamadığından ödeme süreci başarısız olur.

---

## FONKSIYON DETAYLARI

### useCheckoutPayment
**Ne yapar**: Ödeme akışını uçtan uca yöneten, sunucu tarafı doğrulama ve Iyzico ödeme geçidi ile entegre çalışan özel bir React hook'udur. Sepet doğrulama, ödeme isteği oluşturma, Iyzico ödeme formunun başlatılması ve başarılı ödeme durumunun sorgulanması gibi tüm ödeme süreci adımlarını yerine getirir. Tüm ödeme durumu ve tetikleyicilerini dışarıya açarak, bileşenlerde ödeme sürecinin kolayca yönetilmesini sağlar.
**Nasıl yapar**: Önce sunucu tarafı fiyat doğrulamasını çalıştırarak sepet fiyatlarının güncelliğini kontrol eder, ardından geçerli sepet ve kullanıcı bilgileriyle Iyzico entegrasyonu için gerekli ödeme token ve form URL'sini oluşturur. Ödeme süreci boyunca yükleme durumu gibi tüm state değişikliklerini takip eder, periyodik sorgulama (polling) mekanizması ile ödeme sonucunu anlık olarak izler. Başarılı bir ödeme alındığında tanımlı `clearCart` fonksiyonunu çağırarak sepeti boşaltır.
**Parametreler**:
- props: UseCheckoutPaymentProps — Ödeme süreci için gerekli tüm konfigürasyon, yardımcı fonksiyon ve state nesnelerini içeren ana parametre
- props.items: Array — Alışveriş sepetindeki mevcut ürünleri içeren dizi
- props.getCartTotal: Function — Sepetin toplam değerini hesaplayarak döndüren yardımcı fonksiyon
- props.user: Object | null — Oturum açılmışsa kimliği doğrulanmış mevcut Supabase kullanıcı nesnesi, oturum açılmamışsa null değerini alır
- props.clearCart: Function — Başarılı ödeme sonrası alışveriş sepetini tamamen boşaltmak için kullanılan fonksiyon
- props.applyServerPricing: Function — Sunucu tarafı doğrulama sonucuna göre sepet içindeki ürün fiyatlarını güncellemek için kullanılan fonksiyon
**Dönüş**: İçerisinde ödeme sürecinin anlık durumunu tutan `loading`, `token` ve `URL` alanları, ödeme sürecini yapılandırmak için gereken yardımcı konfigürasyon fonksiyonları ve ödeme akışını başlatan `initiatePayment` tetikleyicisini içeren bir nesne döndürür.

---

## INTERFACES

### UseCheckoutPaymentProps
- `items: CartItem[]`
- `getCartTotal: () => number`
- `user: User | null`
- `clearCart: (options?: { silent: boolean }) => void`
- `applyServerPricing: (items: { product_id: string, unit_price: number }[]) => void`
- `customerInfo: CheckoutCustomerInfo`
- `shippingAddress: CheckoutAddressInfo`
- `billingAddress: CheckoutAddressInfo`
- `sameAsShipping: boolean`
- `invoiceType: 'individual' | 'corporate'`
- `invoiceInfo: CheckoutInvoiceInfo`
- `legalConsents: CheckoutLegalConsents`
- `shippingMethod: string`
- `couponCode: string | null`
- `t: (key: string) => string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\hooks\useCheckoutPayment.ts::useCheckoutPayment
- **params**: items, getCartTotal, user, clearCart, applyServerPricing, customerInfo, shippingAddress, billingAddress, sameAsShipping, invoiceType, invoiceInfo, legalConsents, shippingMethod, couponCode, t
- **ic_degiskenler**:
  - `router` — Next.js yönlendirme işlemleri için kullanılan useRouter hook'undan dönen nesne
  - `loading` — Ödeme işleminin aktif olup olmadığını takip eden state değişkeni
  - `setLoading` — loading state'ini güncellemek için kullanılan setter fonksiyonu
  - `iyzToken` — Iyzico ödeme sistemi için alınan token'ı tutan state
  - `setIyzToken` — iyzToken state'ini güncelleyen setter
  - `paymentUrl` — Iyzico ödeme sayfası URL'sini tutan state
  - `setPaymentUrl` — paymentUrl state'ini güncelleyen setter
  - `orderId` — Oluşturulan siparişin benzersiz kimliğini tutan state
  - `setOrderId` — orderId state'ini güncelleyen setter
  - `convId` — Ödeme sürecinin konuşma kimliğini tutan state
  - `setConvId` — convId state'ini güncelleyen setter
  - `iyzScriptLoaded` — Iyzico script'inin yüklenme durumunu tutan sabit state
  - `formReady` — Ödeme formunun hazır olup olmadığını belirten state
  - `setFormReady` — formReady state'ini güncelleyen setter
  - `progressPct` — Ödeme süreci ilerleme yüzdesini tutan state
  - `setProgressPct` — progressPct state'ini güncelleyen setter
  - `paymentFrameContent` — Ödeme frame içeriğini tutan sabit state
  - `isTest` - globalThis nesnesinde 'vi' anahtarı varlığıyla test ortamı olduğunu belirten boolean flag
  - `initiatePayment` — Ödeme akışını başlatan iç asenkron fonksiyon
- **Dönüş**: Tüm state değerleri, setter fonksiyonları ve initiatePayment fonksiyonunu içeren obje

### [N2_NASIL] AST Pointer: src\hooks\useCheckoutPayment.ts::useCheckoutPayment::initiatePayment
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `authoritativeTotal` - Kullanılacak nihai sepet toplamı, önce yerel sonra sunucu doğrulamasıyla güncellenir
  - `validation` - validateServerCart fonksiyonundan dönen sunucu tarafı sepet doğrulama verisi
  - `localHash` - Yerel sepet fiyatlarından üretilen hash değeri
  - `serverHash` - Sunucudan gelen sepet verilerinden üretilen hash değeri
  - `buildPaymentRequest` - Dinamik olarak import edilen ödeme isteği oluşturma fonksiyonu
  - `requestData` - buildPaymentRequest ile oluşturulan, ödeme servisine gönderilecek istek verisi
  - `data` - Supabase fonksiyon çağrısından dönen başarı cevabı verisi
  - `error` - Supabase fonksiyon çağrısından dönen hata nesnesi
  - `d` - data.data nesnesinin kısaltması, Iyzico'dan dönen cevap detayları
  - `err` - Try bloğunda yakalanan genel hata nesnesi
  - `msg` - Hata nesnesinden çıkarılan kullanıcıya gösterilecek hata mesajı
- **Dönüş**: Başarılıysa true, hatalıysa false; ödeme sayfası yönlendirmesi durumunda erken return

### [N3_NASIL] AST Pointer: src\hooks\useCheckoutPayment.ts::useCheckoutPayment::<useEffect>_setup_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `timer` - 3 saniyede bir çalışan sipariş durumu sorgulama interval ID'si
  - `data` - Supabase'den sipariş durumu sorgusu sonucu dönen veri
- **Dönüş**: Interval'ı temizleyen temizleme fonksiyonu

### [N4_NASIL] AST Pointer: src\hooks\useCheckoutPayment.ts::useCheckoutPayment::<setInterval>_polling_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` - venthub_orders tablosundan seçilen siparişin durumunu içeren supabase cevap verisi
- **Dönüş**: yok; yan etkileri: interval temizleme, sepeti temizleme, ödeme başarı sayfasına yönlendirme

### [N5_NASIL] AST Pointer: src\hooks\useCheckoutPayment.ts::useCheckoutPayment::<son_polling_callback>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` - Supabase'den venthub_orders tablosundan alınan sipariş durumu verisi
- **Dönüş**: yok; yan etkileri: interval temizleme, sepet sıfırlama, başarı sayfasına yönlendirme

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutPayment.ts
  function: src\hooks\useCheckoutPayment.ts::useCheckoutPayment

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutPayment