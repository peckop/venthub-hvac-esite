---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCartHook.ts
skeleton_hash: 65924fd41c1d17d7
entity_hashes:
  func:useCart: 24a780c5d0077b33
  overview: a6bb925fcf63c562
generated_at: 2026-05-28T22:37:41Z
---

## Genel Bakış
Bu modül, uygulama genelinde alışveriş sepeti işlevselliğini yönetmek ve merkezileştirmek için tasarlanmış bir React hook'udur. Sepetin durumunu, öğelerini ve ilgili tüm işlemleri (ekleme, kaldırma, güncelleme) kontrol ederek tutarlı bir kullanıcı deneyimi sağlar.

## Fonksiyon Grupları
### Merkezi Sepet Yönetimi Hook'u
Uygulamanın tüm bölümlerinden erişilebilen, sepet verisiyle ilgili tüm durum ve işlemleri tek bir接口 üzerinden sunar.
- useCart

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi (function body) sağlanmadığından, bu modüle özgü somut mimari varsayımlar çıkarılamamıştır. Aşağıda yalnızca fonksiyon imzasından türetilen minimal aksiyomlar yer almaktadır:

**[Aksiyom 1]:** Eğer `useCart()` bir React hook olarak çağrılmıyorsa (React bileşen içi veya başka bir hook içinde değilse), React Hook kuralları ihlal edilir ve beklenmeyen davranış oluşur.

---

> ⚠️ **Not:** Gerçek fonksiyon gövdesi (içerik, state tanımlamaları, return yapısı, bağımlılıklar) paylaşılmadığı için, bu modülün hangi state management aracını kullandığı, ne döndürdüğü, hangi API'leri çağırdığı veya hangi dış bağımlılıklara sahip olduğu **bilinmiyor** olarak değerlendirilmiştir. Somut aksiyon üretmek için fonksiyon gövdesinin tamamı gereklidir.

---

## FONKSİYON DETAYLARI

### useCart
**Ne yapar**: React uygulamasında alışveriş sepeti bağlamını (context) güvenli bir şekilde tüketerek sepetteki ürünler, toplamlar ve sepet üzerinde yapılabilecek işlemleri sağlar. Fonksiyon, CartProvider dışında (örneğin statik build'lerde veya izole test ortamlarında) kullanıldığında runtime hatalarını önlemek için güvenli, boş (no-op) fallback nesnesi döndürür.

**Nasıl yapar**: React'in `useContext` hook'unu kullanarak `CartContext` değerini alır. Eğer context değeri `null` veya `undefined` ise (yani bileşen bir CartProvider içinden render edilmiyorsa), sepet işlevselliğini taklit eden ancak hiçbir yan etkisi olmayan boş fonksiyonlar içeren bir nesne döndürür. Bu sayede uygulama bütünlüğü korunur ve.sepetsiz ortamlarda bile hata fırlatılmaz.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: 
- Type: `CartContext` veya `FallbackCartObject`
- Dönüş değeri, `items` (ürün dizisi), `syncing` (senkronizasyon durumu), `addToCart` (ürün ekleme), `removeFromCart` (ürün kaldırma), `updateQuantity` (miktar güncelleme), `clearCart` (sepeti temizleme), `getCartTotal` (toplam tutarı hesaplama), `getCartCount` (ürün sayısını hesaplama) ve `applyServerPricing` (sunucu fiyatlandırmasını uygulama) içerir. CartProvider mevcut değilse tüm fonksiyonlar no-op olarak çalışır ve sayısal değerler sıfır döner.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCartHook.ts::useCart
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — `useContext(CartContext)` çağrısıyla elde edilen sepet context değeri; CartContext provider içindeyse gerçek seket state ve metodlarını, değilse `null/undefined` döner
- **Dönüş**: CartContext nesnesi veya fallback nesne — `context` truthy ise doğrudan `context` döner; falsy ise `{ items: [], syncing: false, addToCart: () => {}, removeFromCart: () => {}, updateQuantity: () => {}, clearCart: () => {}, getCartTotal: () => 0, getCartCount: () => 0, applyServerPricing: () => {} }` yapısı döner (statik build/izole ortam güvenli fallback)

---

## NODE ID STANDARD

  file: src\hooks\useCartHook.ts
  function: src\hooks\useCartHook.ts::useCart

---

## DISA AKTARILANLAR (EXPORTS)
  export: useCart