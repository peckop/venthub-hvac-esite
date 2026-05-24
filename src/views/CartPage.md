---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CartPage.tsx
skeleton_hash: 01b5e10d140ded8a
generated_at: 2026-05-23T22:39:26Z
---

## Genel Bakış
VentHub HVAC projesinin kullanıcı arayüzünde yer alan sepet sayfasını oluşturan React modülüdür. Uygulamanın sepet ekranının temel kök yapısını sunarak, kullanıcıların sepet içerikleriyle etkileşim kuracağı ana görünüm katmanını oluşturur.

## Fonksiyon Grupları
### Ana Sepet Sayfası Kök Bileşeni
Modülün tek sorumluluğu olan sepet sayfasını render eden ana React bileşenidir, tüm sepet ekranının işleyiş ve görünümünün başlangıç noktası olarak çalışır.
- CartPage

---

## AXIOMS – Mimari Varsayımlar
Bu HVAC platformu React tabanlı sepet sayfası görünüm modülünün sorunsuz çalışması için uygulamanın frontend yönlendirme, durum yönetimi ve bağımlı UI bileşeni mimarisinin tam olarak yapılandırılmış ve erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer uygulama yönlendirme (router) yapılandırmasında CartPage'e ait erişim rotası tanımlanmamışsa, kullanıcılar sepet sayfasına hiçbir şekilde ulaşamaz olur.
[Aksiyom 2]: Eğer sepet içerik verilerini barındıran global durum yönetimi katmanı CartPage bileşeninin kapsamında erişilebilir değilse, sepet içeriği ekranda gösterilemez ve hiçbir sepet işlemi (ürün silme, miktar güncelleme vb.) gerçekleştirilemez olur.
[Aksiyom 3]: Eğer CartPage tarafından kullanılan temel UI bileşenleri (buton, ürün listeleme kartı, fiyat etiketi bileşeni gibi) modül tarafından erişilemez durumdaysa, sepet sayfası düzgün şekilde render edilemez ve kullanıcı deneyimi kesintiye uğrar.
[Aksiyom 4]: Eğer sipariş akışını başlatan üst seviye sipariş yönetimi servisi CartPage tarafından tüketilemiyorsa, kullanıcılar sepetten ödeme/sipariş onay adımına geçemez olur.
[Aksiyom 5]: Eğer oturum açmış kullanıcı doğrulaması CartPage rota veya bileşen seviyesinde tanımlanmamışsa, yetkisiz kullanıcılar sepet verilerine erişebilir veya yetkisiz işlem yapabilir olur.

---

## FONKSIYON DETAYLARI

### CartPage
**Ne yapar**: VentHub HVAC projesinin alışveriş sepeti sayfasını oluşturan ana React fonksiyonel bileşenidir. Kullanıcının sepetindeki ürünleri görüntülemesi, sepet içeriğini yönetmesi ve sipariş sürecine geçmesi için gereken temel arayüz yapısını sunar. Projenin genel kullanıcı deneyimi akışına entegre olarak çalışan, genel domain kapsamında yer alan görünüm katmanı bileşenidir.
**Nasıl yapar**: C:\Users\alize\venthub-hvac\src\views\CartPage.tsx dosyasında TypeScript ile tanımlanmış bir React bileşeni olarak çalışır. React'in state ve context yapılarını kullanarak sepet verilerini yönetir, kullanıcı etkileşimlerini algılar ve dinamik olarak sayfa içeriğini günceller. Görünüm katmanında yer alan diğer bileşenlerle birlikte işlev görerek sepet sayfasının tamamını tek bir bileşen olarak sunar.
**Parametreler**:
- Bu bileşene aktarılan herhangi bir parametre tanımlanmamıştır, React bileşeni standartlarına uygun olarak kendi içindeki ve proje genelindeki context verileriyle çalışır.
**Dönüş**: React.FC türünde bir değer döndürür. Bu dönüş değeri, alışveriş sepeti sayfasının tüm görsel ve işlevsel yapısını içeren JSX formatında bir React öğesidir, projenin yönlendirme sistemi tarafından ilgili rota tetiklendiğinde render edilmek üzere kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/CartPage.tsx::CartPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` — useCart hook'undan alınan sepetteki ürünleri içeren liste, boşluk kontrolü ve ürünlerin listelenmesi için kullanılır
  - `updateQuantity` — useCart'tan alınan sepet ürünlerinin miktarını güncelleyen fonksiyon, miktar arttırma/azaltma butonlarında çağrılır
  - `removeFromCart` — useCart'tan alınan sepetten ürün silen fonksiyon, ürün silme butonunda çağrılır
  - `clearCart` — useCart'tan alınan tüm sepeti tek seferde temizleyen fonksiyon, sepeti temizle butonunda kullanılır
  - `getCartTotal` — useCart'tan alınan sepetin toplam tutarını hesaplayan fonksiyon, sipariş özeti bölümünde kullanılır
  - `getCartCount` — useCart'tan alınan sepetteki toplam ürün adedini döndüren fonksiyon, sayfa başlığında ürün sayısını göstermek için kullanılır
  - `t` — useI18n hook'undan alınan çok dilli çeviri fonksiyonu, tüm metinlerin çevrilmesi için kullanılır
  - `lang` — useI18n hook'undan alınan mevcut aktif dil kodu, para birimi formatlamasında kullanılır
  - `formatCurrency` — para tutarlarını yerel ayarlara göre formatlayan fonksiyon, tüm fiyat gösterimlerinde kullanılır
  - `Routes` — uygulama rota tanımları nesnesi, tüm sayfa içi yönlendirme linklerinin oluşturulması için kullanılır
  - `ShoppingBag, ArrowLeft, Minus, Plus, Trash2` — Lucide ikon kütüphanesinden alınan arayüz ikonları
  - `Link` — Next.js Link bileşeni, istemci tarafı yönlendirmeler için kullanılır
  - `BrandIcon` — Projeye özel marka ikonu bileşeni, ürün kartlarında marka görseli olarak kullanılır
  - `SecurityRibbon` — Projeye özel güvenlik bilgilendirme bileşeni, sayfa üstünde gösterilir
- **Dönüş**: React.ReactNode (boş veya dolu sepet arayüzünü içeren JSX elementi)

### [N2_NASIL] AST Pointer: src/views/CartPage.tsx::CartPage.items.map_callback
- **params**: (item: sepet ürünü nesnesi)
- **ic_degiskenler**:
  - `item` — map fonksiyonuna parametre olarak gelen tekil sepet ürünü, ürünün tüm detaylarını barındırır
  - `item.id` — Sepet ürününün benzersiz kimliği, JSX anahtarı olarak kullanılır
  - `item.product.brand` — Ürünün marka adı, BrandIcon bileşenine parametre olarak geçirilir
  - `item.product.slug` — Ürünün URL dostu kimliği, ürün detay sayfası linkinde kullanılır
  - `item.product.name` — Ürünün görünen adı, ürün kartında başlık olarak gösterilir
  - `item.product.sku` — Ürünün stok takip kodu, ürün bilgilerinde gösterilir
  - `item.unitPrice` — Ürünün sepete eklendiğindeki birim fiyatı, varsa öncelikli olarak kullanılır
  - `item.product.price` — Ürünün orijinal taban fiyatı, unitPrice mevcut değilse kullanılır
  - `item.quantity` — Sepetteki üründen alınan adet, miktar kontrolünde ve satır toplamı hesaplamasında kullanılır
  - `item.product.id` — Ürünün benzersiz kimliği, miktar güncelleme ve silme fonksiyonlarına parametre olarak geçirilir
  - `updateQuantity` — Üst kapsamdan alınan ürün miktarını güncelleyen fonksiyon, miktar butonlarında çağrılır
  - `removeFromCart` — Üst kapsamdan alınan sepetten ürün silen fonksiyon, silme butonunda çağrılır
  - `t` — Üst kapsamdan alınan çeviri fonksiyonu, metinlerin çevrilmesi için kullanılır
  - `lang` — Üst kapsamdan alınan aktif dil kodu, para formatlamasında kullanılır
  - `formatCurrency` — Para tutarlarını formatlayan fonksiyon, fiyat gösterimlerinde kullanılır
  - `Routes` — Rota tanımları nesnesi, ürün detay sayfası linkinin oluşturulması için kullanılır
  - `BrandIcon, Minus, Plus, Trash2, Link` — Arayüzde kullanılan ikon ve yönlendirme bileşenleri
- **Dönüş**: Tekil sepet ürününü temsil eden JSX elementi

---

## NODE ID STANDARD

  file: src\views\CartPage.tsx
  function: src\views\CartPage.tsx::CartPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartPage