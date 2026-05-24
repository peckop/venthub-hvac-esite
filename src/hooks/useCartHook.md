---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCartHook.ts
skeleton_hash: 65924fd41c1d17d7
generated_at: 2026-05-23T22:29:22Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun frontend altyapısında yer alan, alışveriş sepeti işlevlerini merkezileştiren özel React hook modülüdür. Uygulama içindeki tüm bileşenlerin sepet verilerine ve işlemlerine tutarlı bir şekilde erişmesini sağlamak için tasarlanmıştır. Modülün tek ana dışa aktarımı olan useCart hook'u, sepet işlevselliğini tüm proje genelinde kullanılabilir kılar.

## Fonksiyon Grupları
### Merkezi Sepet Yönetimi Hook'u
Alışveriş sepetinin durum yönetimini ve ilgili tüm işlem erişimini tek bir noktada toplayarak, uygulamanın her bölümünden sepet işlemlerinin basit ve tutarlı bir şekilde kullanılmasını sağlar.
- useCart

---

## AXIOMS – Mimari Varsayımlar
Bu React alışveriş sepeti yönetim hook'u, projenin kullanıcı oturum yönetimi, global state yönetimi, istemci tarafı depolama ve backend iletişim altyapılarının sorunsuz çalışmasına bağlı olarak tüm sepet yönetimi işlevlerini yerine getirebilir.

[Aksiyom 1]: Eğer hook'un erişmesi gereken SepetContext global React context'i uygulama geneline sağlanmamışsa, hook sepet verilerine erişemez ve hiçbir sepet işlemi gerçekleştirilemez.
[Aksiyom 2]: Eğer kullanıcı oturum yönetimi modülü tarafından geçerli, tanımlı kullanıcı kimliği hook'a iletilmiyorsa, sepetin kullanıcı özelinde backend ile senkronize edilmesi işlemleri yapılamaz.
[Aksiyom 3]: Eğer istemci tarafı yerel depolama (localStorage) hook tarafından erişilebilir değilse, kullanıcı oturumları arasında sepet verisi korunamaz, sayfa yenilendiğinde sepet içeriği sıfırlanır.
[Aksiyom 4]: Eğer sepet verilerini backend ile senkronize etmek için kullanılan API istekleri başarısız olursa, yerel sepet verisi ile uzaktan kayıtlı sepet verisi arasında kalıcı tutarsızlık oluşur.

---

## FONKSIYON DETAYLARI

### useCart
**Ne yapar**: Alışveriş sepeti durumunu ve tüm sepet ile ilgili aksiyonları güvenli bir şekilde tüketmek için tasarlanmış özel React hook'udur. CartContext'i kullanarak sepet verilerini tüm uygulama bileşenlerine erişime açar, özellikle CartProvider bileşeninin kapsamı dışında kullanıldığında çalışma zamanı hatalarını tamamen engellemek için hiçbir işlem yapmayan güvenli bir geri dönüş nesnesi sunar. Hem üretim ortamında hem de izole testler, statik derlemeler gibi özel senaryolarda sorunsuz çalışacak şekilde tasarlanmıştır.
**Nasıl yapar**: React'in yerleşik useContext hook'u ile proje içinde tanımlı CartContext nesnesini çeker, öncelikle bağlamın geçerli olup olmadığını kontrol eder. Eğer CartProvider bileşeni altında kullanılmadığı için bağlam nesnesi geçersiz veya boş çıkarsa, orijinal context ile aynı arayüze sahip ama tüm modifikasyon fonksiyonları herhangi bir değişiklik yapmayan (no-op) bir geri dönüş nesnesi döndürür. Bu sayede uygulamanın çökmesine neden olacak referans hatalarını önceden engeller, her senaryoda stabil çalışmayı garanti eder.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: CartContext türünde bir nesne döndürür. Bu nesne içerisinde sepetin içindeki ürünleri listeleyen `items` verisi, sepetin toplam tutarlarını içeren `totals` nesnesi ve sepete ürün ekleme, çıkarma, güncelleme gibi tüm işlemleri gerçekleştiren modifikasyon fonksiyonları barındırır. Eğer CartProvider dışında kullanılırsa aynı arayüze sahip, hiçbir işlem yapmayan güvenli bir geri dönüş nesnesi döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useCartHook.ts::useCart
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — useContext hook'u ile CartContext'ten alınan sepet durumunu ve işlevlerini içeren bağlam nesnesi, null olup olmadığı kontrol edilerek işlenir
- **Dönüş**: Koşullu olarak ya CartContext'ten gelen orijinal bağlam nesnesi, ya da izole/statik ortamlar için güvenli varsayılan değerlere sahip geri dönüş nesnesi (boş sepet öğeleri listesi, false senkronizasyon durumu, boş callback fonksiyonları, 0 döndüren toplam/adet hesaplama fonksiyonları içerir)

---

## NODE ID STANDARD

  file: src\hooks\useCartHook.ts
  function: src\hooks\useCartHook.ts::useCart

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCart