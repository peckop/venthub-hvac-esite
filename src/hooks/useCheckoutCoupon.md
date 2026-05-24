---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts
skeleton_hash: 0ddc8afaae2a88ab
generated_at: 2026-05-23T22:29:51Z
---

## Genel Bakış
Venthub HVAC projesinin ödeme süreci için geliştirilen bu React özel hook modülü, sipariş toplam tutarına bağlı olarak ödeme adımındaki kupon yönetimi işlemlerini gerçekleştirmek üzere tasarlanmıştır. Modül, kullanıcıların ödeme aşamasında girdikleri kupon kodlarıyla ilgili tüm işlemleri tek bir noktadan yöneterek, ödeme akışında kupon kullanımıyla ilgili ihtiyaçları karşılar.

## Fonksiyon Grupları
### Ana Kupon Yönetimi Hook'u
Modülün tüm işlevselliğini kapsayan tek ana bileşen olarak, ödeme sayfasında kupon doğrulama, indirim hesaplama ve kupon uygulamasıyla ilgili tüm işlemleri yürütür.
- useCheckoutCoupon

---

## AXIOMS – Mimari Varsayımlar
Bu React hook'u, ödeme (checkout) adımında kullanıcı kuponunu uygulamak için tasarlanmıştır, doğru çalışması için geçerli bir sipariş toplamı ve kupon doğrulama altyapısının erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer useCheckoutCoupon fonksiyonuna aktarılan totalAmount parametresi sayısal veri türünde değilse, kupon tutarı hesaplama ve geçerlilik kontrolü işlemleri çöker veya hatalı sonuç üretir.
[Aksiyom 2]: Eğer hook'un bağlı olduğu dahili/harici kupon doğrulama servisi yoksa, hiçbir kuponun geçerliliği kontrol edilemez, kullanıcı siparişine indirim uygulayamaz.
[Aksiyom 3]: Eğer totalAmount parametresi 0'dan küçük negatif bir değer olarak aktarılıyorsa, kupon hesaplamaları mantıksız sonuçlar (negatif indirim, sıfırdan küçük nihai sipariş tutarı vb.) üretir.
[Aksiyom 4]: Eğer hook'un projenin genel state yönetimi altyapısıyla entegrasyonu sağlanmamışsa, uygulanan kuponun indirim tutarı genel sipariş toplamına yansıtılamaz.

---

## FONKSIYON DETAYLARI

### useCheckoutCoupon
**Ne yapar**: Ödeme sürecinde kupon yönetimi için geliştirilmiş özel React hook'udur. Kupon kodu giriş durumunu yönetir, girilen kodu doğrular, Sepetin mevcut ara toplamı üzerinden indirim uygulamak için gerekli tüm işlevleri sunar. Kupon uygulamak ve kaldırmak gibi temel işlemleri tek bir merkezden yöneterek ödeme sayfası bileşenlerinin kod karmaşıklığını azaltır.
**Nasıl yapar**: İçerisinde yerel state yönetimi kullanarak kupon kodu, uygulanan indirim miktarı ve olası doğrulama hatalarını takip eder. Girilen kupon kodunu öncelikle temel yerel kontrollerden geçirir, ardından Supabase tabanlı Edge Fonksiyonu üzerinden güvenli bir şekilde sunucu tarafında doğrulamasını ve indirim hesaplamasını gerçekleştirir. Kuponun kaldırılması durumunda tüm state değerlerini sıfırlayarak orijinal sepet tutarına dönülmesini sağlar.
**Parametreler**:
- name: totalAmount — type: number — Sepetin kupon uygulanmadan önceki mevcut ara toplam tutarıdır. Değer Türk Lirası (TRY) cinsinden hesaplanmıştır, kuponun geçerlilik şartlarını (örneğin minimum sepet tutarı) kontrol etmek için kullanılır.
**Dönüş**: İçerisinde kuponun mevcut durumunu, state değerlerini güncellemek için kullanılan setter fonksiyonları, kuponu uygulamak için tetiklenen işlevi ve kuponu kaldırmak için kullanılan metodu barındıran bir nesne döndürür. Dönen nesne, ödeme sayfası bileşeninin tüm kupon işlemlerini yönetmesini sağlayacak tüm gerekli araçları sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon
- **params**: [totalAmount: number]
- **ic_degiskenler**:
  - `couponCode` — Kullanıcının girdiği kupon kodunu tutan React state değişkeni, başlangıç değeri boş string
  - `setCouponCode` — couponCode state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `couponApplied` — Geçerli uygulanmış kuponun kod ve indirim bilgilerini tutan state değişkeni, null veya {code: string, discount: number} tipinde
  - `setCouponApplied` — couponApplied state değerini güncellemek için kullanılan React state setter fonksiyonu
  - `applyCoupon` — Kupon kodunu sunucuya gönderip doğrulamak için tanımlanan async iç fonksiyon
  - `removeCoupon` — Uygulanmış kuponu iptal etmek ve kupon alanını sıfırlamak için tanımlanan iç fonksiyon
- **Dönüş**: { couponCode, setCouponCode, couponApplied, applyCoupon, removeCoupon } içeren state ve fonksiyonlar nesnesi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon/applyCoupon
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `code` — Girilen kupon kodunun baştaki/sondaki boşlukları temizlenmiş hali, uzunluk kontrolü için kullanılır
  - `base` — Supabase proje URL'sini ortam değişkeninden alan değişken, boş string varsayılan değeri
  - `anon` — Supabase anon erişim anahtarını ortam değişkeninden alan değişken, boş string varsayılan değeri
  - `resp` — apply-coupon edge fonksiyonuna yapılan POST fetch isteğinin cevap nesnesi
  - `json` — Fetch cevabından ayrıştırılan JSON verisi, ayrıştırma hatasında boş nesne varsayılır
  - `e` — Try bloğunda yakalanan hata nesnesi, konsola yazdırılır
- **Dönüş**: Promise<void>

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon/removeCoupon
- **params**: (parametre yok)
- **ic_degiskenler**: (kendi içerisinde tanımlı yerel değişken yok, üst kapsam state setter'larını kullanır)
- **Dönüş**: void

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts::anon_async_apply_coupon
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `code` — Girilen kupon kodunun baştaki/sondaki boşlukları temizlenmiş hali, uzunluk kontrolü için kullanılır
  - `base` — Supabase proje URL'sini ortam değişkeninden alan değişken, boş string varsayılan değeri
  - `anon` — Supabase anon erişim anahtarını ortam değişkeninden alan değişken, boş string varsayılan değeri
  - `resp` — apply-coupon edge fonksiyonuna yapılan POST fetch isteğinin cevap nesnesi
  - `json` — Fetch cevabından ayrıştırılan JSON verisi, ayrıştırma hatasında boş nesne varsayılır
  - `e` — Try bloğunda yakalanan hata nesnesi, konsola yazdırılır
- **Dönüş**: Promise<void>

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCheckoutCoupon.ts::anon_remove_coupon
- **params**: (parametre yok)
- **ic_degiskenler**: (kendi içerisinde tanımlı yerel değişken yok, üst kapsam state setter'larını kullanır)
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\hooks\useCheckoutCoupon.ts
  function: src\hooks\useCheckoutCoupon.ts::useCheckoutCoupon

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCheckoutCoupon