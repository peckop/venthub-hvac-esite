---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartContext.tsx
skeleton_hash: bcf8fdf88a2f5de4
entity_hashes:
  overview: 5c2e2a3fcb9d0dde
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:55:00Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının alışveriş sepeti durumunu uygulama genelinde yönetmek ve paylaşmak için tasarlanmış bir React Context yapısını tanımlar. Modül, temel olarak React'in `createContext` fonksiyonunu kullanarak `CartContext` adlı bir context nesnesi oluşturur. Sepet verilerinin tip güvenliğini sağlamak için uygulamanın tipler dosyasından içe aktarılan `Product` ve `CartItem` tiplerini referans alır.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon, metod veya özel hook bulunmamaktadır. Modülün içeriği yalnızca bir React Context tanımı ve ilgili tiplerin import edilmesinden ibarettir. Kod yapısı itibarıyla modül, bir durum yönetimi (`state`) veya mantık (`logic`) katmanı içermeyip, doğrudan bir paylaşımlı bağlam (`shared context`) sağlama amacına yöneliktir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yalnızca bir React Context tanımı içererek alışveriş sepeti durumunu paylaşıma açar. Fonksiyon gövdesi içermediğinden, çıkarılacak mimari varsayımlar modülün yapısal bağımlılıklarıyla sınırlıdır.

[Aksiyom 1]: Eğer `Product` tipi Supabase yapılandırmasından içe aktarılamıyorsa, `CartContext` tipi tanımsız olur ve TypeScript derleme hatası oluşur.

[Aksiyom 2]: Eğer `createContext` çağrılmadan önce bir sağlayıcı (Provider) bileşeni tanımlanmamışsa, `CartContext`'i tüketen tüm bileşenler varsayılan değer (`undefined`) alır ve runtime hataları meydana gelir.

[Aksiyom 3]: Eğer bu modül bir `Provider` sarmalayıcısı (wrapper) içermiyorsa, sepet durumunun yönetimi ve paylaşımı bu dosya dışında, farklı bir modülde sağlanmalıdır; aksi halde sepet verisi tüm uygulama arasında paylaşılamaz.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### CartContextType
- `items: CartItem[]`
- `syncing: boolean`
- `addToCart: (product: Product, quantity?: number) => void`
- `removeFromCart: (_productId: string) => void`
- `updateQuantity: (_productId: string, quantity: number) => void`
- `clearCart: (opts?: { silent?: boolean }) => void`
- `getCartTotal: () => number`
- `getCartCount: () => number`
- `applyServerPricing: (items: { product_id: string, unit_price: number }[]) => void`

---

## SABİTLER
- **CartContext** (call) — `createContext<CartContextType | undefined>(undefined)`

---

## AST POINTERS

Dosya içinde herhangi bir **fonksiyon gövdesi** bulunmamaktadır. Dosya yalnızca bir React Context tanımı ve tip importlarından oluşmaktadır.

---

Dosya yapısı:

| Öğe | Açıklama |
|-----|----------|
| `import { createContext } from 'react'` | React Context oluşturucu import edilmiş |
| `import type { Product }` | Ürün tipi import edilmiş (kullanım alanı belirsiz — muhtemelen Context interface'inde kullanılıyor) |
| `import type { CartItem }` | Sepet öğesi tipi import edilmiş (kullanım alanı belirsiz — muhtemelen Context interface'inde kullanılıyor) |
| `CartContext (call)` | `createContext(...)` çağrısı ile bir Context nesnesi oluşturulmuş — **bu bir fonksiyon gövdesi değil, üst seviye bir ifadedir** |

---

> **Not:** Bu dosyada analiz edilecek bir fonksiyon gövdesi mevcut değildir. `CartContext (call)` ifadesi, `createContext` fonksiyonunun **çağrısı** olup, kendi içinde bir gövde içermez. Bu nedenleParams, iç değişken ve dönüş analizi yapılamamaktadır.

---

## NODE ID STANDARD

  file: src\contexts\CartContext.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartContext
  export: CartContextType

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)