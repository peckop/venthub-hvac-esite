---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CartPage.tsx
skeleton_hash: 01b5e10d140ded8a
entity_hashes:
  func:CartPage: 47b501309afc6903
  overview: 9ff04da92205cbab
  style_tokens: 0ec1062a71699875
generated_at: 2026-05-28T22:39:49Z
---

## Genel Bakış
VentHub HVAC projesinin sepet sayfasını oluşturan React modülüdür. Kullanıcıların sepet içeriklerini görüntüleyebileceği, miktar güncelleyebileceği ve sipariş akışına geçebileceği ana sayfa görünümünü tanımlar.

## Fonksiyon Grupları
### Ana Sepet Sayfası Bileşeni
Modülün tek bileşeni olan CartPage, sepet sayfasının tüm içeriğini, etkileşimlerini ve alt bileşenlerini bir araya getiren kök React bileşenidir.
- CartPage

---

## AXIOMS – Mimari Varsayımlar
CartPage, parametresiz bir React fonksiyonel bileşenidir; bu nedenle dışarıdan prop alımı beklenmez, bağımlılıklarını iç bağımlılık enjeksiyonu (hook) veya global bağlam yoluyla sağlamak zorundadır.

[Aksiyom 1]: Eğer React Çalışma Zamanı (React Runtime) mevcut değilse, bileşen çağrılamaz ve render işlemi başarısız olur.

[Aksiyom 2]: Eğer bileşen bir React Ağaç (Tree) içine yerleştirilmemişse, DOM'a herhangi bir çıktı üretmez.

[Aksiyom 3]: Eğer bileşen çağrı.getParam('id') gibi bir erişim içeriyorsa ve bu bağlam (Context/Router) sağlanmamışsa, çalışma zamanı hatası oluşur.

[Aksiyom 4]: Bileşen parametresiz olduğundan, işlevsellik tamamen iç hook'lara veya dış global state'e bağımlıdır; eğer bu state kaynağa erişilebilir değilse bileşen boş/bozuk render eder.

---

## FONKSİYON DETAYLARI

### CartPage

**Ne yapar**: Sepet sayfasını görüntüleyen React bileşenidir. Kullanıcıların alışveriş sepetlerini görüntülemesini ve yönetmesini sağlayan ana sayfa görünümüdür.

**Nasıl yapar**: Bu bileşen, React functional component olarak tanımlanmıştır. Kaynak dosya yolundan (src/views/CartPage.tsx) anlaşılacağı üzere, uygulamanın "views" katmanında yer alan ve.sepetime ait sayfa görünümünü render eden bir bileşendir.

**Parametreler**:
Bu bileşen için belgelenmiş parametre bulunmamaktadır.

**Dönüş**: 
- React.FC — React Functional Component türünde bir bileşen döndürür. Sepet sayfasının tüm görünüm yapısını içeren JSX elementini render eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CartPage.tsx::CartPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `items` — useCart hook'undan gelen, sepetteki ürünleri tutan dizi
  - `updateQuantity` — useCart hook'undan gelen, ürün miktarını güncellemek için kullanılan fonksiyon
  - `removeFromCart` — useCart hook'undan gelen, ürünü sepetten kaldırmak için kullanılan fonksiyon
  - `clearCart` — useCart hook'undan gelen, sepeti tamamen temizlemek için kullanılan fonksiyon
  - `getCartTotal` — useCart hook'undan gelen, sepetin toplam tutarını hesaplayan fonksiyon
  - `getCartCount` — useCart hook'undan gelen, sepetteki toplam ürün sayısını döndüren fonksiyon
  - `t` — useI18n hook'undan gelen, çeviri metinlerini döndüren fonksiyon
  - `lang` — useI18n hook'undan gelen, mevcut dil kodunu tutan değişken
- **Dönüş**: JSX bileşeni — Sepet sayfasını render eder. Boş sepet durumunda boş sepet mesajı, dolu sepet durumunda ürün listesi ve sipariş özeti gösterir.

### [N2_NASIL] AST Pointer: CartPage.tsx::items.map callback
- **params**: (item — sepetteki her bir ürünü temsil eden nesne)
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX bileşeni — Sepet içindeki bir ürünü gösteren kart bileşeni.

---

## NODE ID STANDARD

  file: src\views\CartPage.tsx
  function: src\views\CartPage.tsx::CartPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue`, `bg-gradient-to-br`, `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-2`, `border-light-gray`, `border-primary-navy`, `from-air-blue`, `hover:bg-light-gray`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-primary-navy`, `hover:text-red-500`, `hover:text-white`
- **Layout:** `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `from-air-blue`, `gap-8`, `grid`, `grid-cols-1`, `h-20`, `h-24`, `inline-flex`, `items-center`, `items-start`, `justify-between`
- **Varyant/Responsive:** `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mb-8`, `mr-2`, `mt-3`, `mt-4`, `mt-6`, `mx-auto`