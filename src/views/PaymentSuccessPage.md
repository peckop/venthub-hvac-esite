---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx
skeleton_hash: cc90da8797868667
generated_at: 2026-05-23T22:41:43Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ödeme sürecinin sonunda kullanıcıları yönlendiren ödeme başarısı sayfasını oluşturan React tabanlı bir görünüm modülüdür. Ödeme işleminin tamamlandığını kullanıcıya ileten bu sayfa bileşenini tek başına barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Bu grup, ödeme sonrası kullanıcıya başarı bildirimi sunan ve gerekli yönlendirme seçeneklerini sağlayan ana React bileşenini barındırır. Tüm sayfa işlevselliğini tek bir bileşen üzerinden sunar.
- PaymentSuccessPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı PaymentSuccessPage bileşeni, VentHub HVAC platformunda kullanıcıların ödeme işlemini başarıyla tamamlamasından sonra görüntülenen sonuç sayfasıdır, doğru çalışması için uygulamanın rota yönetimi, gerekli veri aktarımı ve UI bağımlılıklarının sorunsuz çalışması zorunludur.

[Aksiyom 1]: Eğer uygulamanın rota yönetimi altyapısı bu bileşeni tanımlamıyor ve uygun rotada çağırmıyorsa, kullanıcılar ödeme başarılı sonuc ekranına hiç erişemez.
[Aksiyom 2]: Eğer bu bileşene kullanıcı oturum bilgisi ve tamamlanan ödemenin detay verisi iletilmiyorsa, sayfada kullanıcıya özel sipariş ve ödeme özetleri görüntülenemez, boş içerikli ekran oluşur.
[Aksiyom 3]: Eğer sayfanın import ettiği ortak UI bileşenleri (üst bilgi, alt bilgi, navigasyon elemanları vb.) uygulama içinde erişilebilir değilse, PaymentSuccessPage tam olarak render edilemez, görsel ve işlevsel kesinti meydana gelir.
[Aksiyom 4]: Eğer ödeme işlemini tamamlayan önceki servis veya adım, başarılı ödeme sonrası bu sayfaya yönlendirme yapmıyorsa, kullanıcılar ödeme sonrası uygulama içinde takılır ve işlem sonucunu göremez.

---

## FONKSIYON DETAYLARI

### PaymentSuccessPage
**Ne yapar**: Venthub HVAC projesinin ödeme işlemi sonrası kullanıcının karşılaştığı başarılı ödeme sayfasını oluşturan React bileşenidir. Kullanıcının ödemesinin sorunsuz şekilde tamamlandığını teyit eden, gerekli bilgilendirme veya yönlendirme elemanlarını barındıran sayfa arayüzünü render eder. Projenin view katmanında yer alan bu sayfa bileşeni, uygulama içindeki ödeme akışının son adımını kullanıcıya sunar.
**Nasıl yapar**: TypeScript ile tiplendirilmiş, React standartlarına uygun bir fonksiyonel bileşen olarak tanımlanmıştır. Projenin src/views dizininde konumlanarak sayfa bileşenleri mimarisine uyum sağlar, herhangi bir dış girdi almadan kendi yapısı gereği sayfa içeriğini ekrana sunar, uygulamanın yönlendirme sistemi tarafından çağrılarak yüklenir.
**Parametreler**: Bu fonksiyon herhangi bir parametre almamaktadır.
**Dönüş**: React.FC tipi, yani React uygulaması içinde sorunsuz şekilde kullanılabilecek, ödeme başarısı sayfasının tüm kullanıcı arayüzü elemanlarını barındıran bir React fonksiyonel bileşeni döndürür. Bu dönüş değeri, uygulamanın rota yapısı üzerinde sayfa olarak atanabilir ve çalıştırılabilir.

---

## TYPE ALIASES

### PaymentInfo
```typescript
type PaymentInfo = { conversationId?: string; token?: string; errorMessage?: string }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx::PaymentSuccessPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `searchParams` — useSearchParams hook'u ile alınan URL arama parametrelerini okuyan nesne
  - `t` — useI18n hook'undan gelen çeviri metinleri getiren fonksiyon
  - `lang` — useI18n hook'undan gelen mevcut aktif dil kodu
  - `clearCart` — useCart hook'undan gelen kullanıcı sepetini temizleyen fonksiyon
  - `status` — Ödeme doğrulama sürecinin durumunu tutan state değişkeni (loading/success/error)
  - `setStatus` — status state'ini güncellemek için kullanılan setter fonksiyonu
  - `paymentInfo` — Ödeme ve sipariş kimlikleri, hata mesajları gibi detayları tutan state nesnesi
  - `setPaymentInfo` — paymentInfo state'ini güncelleyen setter fonksiyonu
  - `orderSummary` — Siparişin toplam tutarı, ürün sayısı, oluşturulma tarihi gibi özet bilgileri tutan state nesnesi
  - `setOrderSummary` — orderSummary state'ini güncelleyen setter fonksiyonu
- **Dönüş**: JSX React elementi (duruma göre yükleme, hata veya başarı sayfası)

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx::useEffectEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `conversationId` — URL searchParams'tan alınan ödeme konuşma kimliği
  - `token` — URL searchParams'tan alınan ödeme doğrulama token'i
  - `errorMessage` — URL searchParams'tan alınan varsa hata mesajı
  - `orderId` — URL searchParams'tan alınan sipariş kimliği
  - `statusParam` — URL searchParams'tan alınan ödeme durumu parametresi
  - `fetchOrderDetails` — İçinde tanımlanan sipariş detaylarını veritabanından çeken async iç fonksiyon
  - `verify` — Ödeme durumunu tüm senaryolarda doğrulayan ana async iç fonksiyon
- **Dönüş**: yok

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx::fetchOrderDetails
- **params**: oid?: string (detayları çekilecek siparişin opsiyonel kimliği)
- **ic_degiskenler**:
  - `data` — Supabase veritabanı sorgusundan dönen sipariş verisi nesnesi
  - `error` — Supabase sorgusu sırasında oluşabilecek hata nesnesi
  - `items` — Siparişe ait tüm ürün kalemlerini içeren dizi
  - `count` — Siparişteki toplam ürün adedini hesaplayan sayısal değer
- **Dönüş**: void (sadece orderSummary state'ini günceller, değer döndürmez)

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\PaymentSuccessPage.tsx::verify
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `data` — Supabase Edge Function veya veritabanı sorgularından dönen yanıt verisi
  - `error` — Supabase işlemleri sırasında oluşan hata nesnesi
  - `msg` — Hata durumunda kullanıcıya gösterilecek birleştirilmiş hata mesajı
  - `e` — Genel yakalanan bilinmeyen türde hata nesnesi
  - `err` — Yakalanan hatanın mesaj alanına erişmek için tip dönüşümü yapılmış hata nesnesi
  - `localStorage` — Tarayıcı local storage nesnesi, sepet ve sipariş verilerini yönetmek için kullanılır
  - `supabase.functions.invoke` — İyzico ödeme callback'ini tetikleyen Supabase Edge Function çağrısı
  - `reportError` — Merkezi hata takip sistemine hata bildiren fonksiyon
  - `toast.success` / `toast.error` — Kullanıcıya bildirim göstermek için kullanılan toast fonksiyonları
- **Dönüş**: void (tüm koşullarda erken return ile çıkar, herhangi bir değer döndürmez)

---

## NODE ID STANDARD

  file: src\views\PaymentSuccessPage.tsx
  function: src\views\PaymentSuccessPage.tsx::PaymentSuccessPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: PaymentSuccessPage