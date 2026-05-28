---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartContext.tsx
skeleton_hash: 72b86346b922fcd4
entity_hashes:
  overview: ac63949f1a90f53c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:37:26Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulamasının alışveriş sepeti durumunu yönetmek ve tüm bileşenler arasında paylaşmak için oluşturulmuş bir React Context yapısıdır. Modül, React'in standart `createContext` fonksiyonunu kullanarak `CartContext` nesnesini tanımlar ve sepet verilerinin tip güvenliğini sağlamak için Supabase projesinden içe aktarılan `Product` tipini kullanır. Bu dosya yalnızca bir context tanımı içerir; herhangi bir API sorgulaması, ortam değişkeni veya özel fonksiyon barındırmaz.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon bulunmamaktadır. Modül yalnızca bir React Context nesnesi ve ilgili arayüzlerden oluşmaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, React context yapısı kullanarak alışveriş sepeti durumunu uygulama genelinde paylaşılabilir hale getiren bir modüldür.

**[Aksiyom 1]:** Eğer `CartContext` modül sabiti çağrılmazsa (export edilmezse), uygulama bileşenleri sepet durumuna erişemez olur.

**[Aksiyom 2]:** Eğer `CartContext` bir React Provider ile sarmalanmazsa, alt bileşenlerde sepet verisi `undefined` veya varsayılan başlangıç değeri olarak döner.

**[Aksiyom 3]:** Eğer `Product` tipi (Supabase kaynağından) modül tarafından import edilmezse, sepet öğelerinin tip güvenliği sağlanamaz ve derleme hatası oluşur.

---

**Not:** Bu modülde tanımlı herhangi bir fonksiyon gövdesi (implementasyon) bulunmadığından, daha detaylı aksiyom üretimi için modülün içindeki `createContext` çağrı parametrelerinin ve Provider bileşeninin kod yapısının incelenmesi gerekir. Mevcut bilgiler sadece modül sabiti (`CartContext call`) seviyesindedir.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### CartItem
- `id: string`
- `product: Product`
- `quantity: number`
- `unitPrice?: number`

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

Bu dosyada fonksiyon gövdesi bulunmamaktadır. Dosya yalnızca bir React Context sabiti tanımı içermektedir.

### [N1_NASIL] AST Pointer: `CartContext.tsx`::CartContext
- **Tür**: `createContext()` çağrısı ile oluşturulan React Context nesnesi (sabit tanımı)
- **Params**: Yok — bir fonksiyon değil, `createContext` çağrısı sonucu oluşan sabit
- **ic_degiskenler**:
  - `CartContext` — `createContext()` ile oluşturulan React Context nesnesi; `Product` tipinde bir alışveriş sepeti bağlamı sağlamak üzere tanımlanmıştır; bileşen ağacı içinde `CartProvider` ve `useCart` hook'u aracılığıyla sepet verisi paylaşılmak için kullanılır
- **Dönüş**: Yok — bu bir fonksiyon değil, modül seviyesinde Evaluate edilen bir sabittir
- **Yan Etkiler**: Dosya import edildiğinde `CartContext` modül scope'una yerleştirilir; `Product` tipi `'../lib/supabase'` modülünden import edilerek context'in generic tipi olarak kullanılır

---

> **Not**: Bu dosyada analiz edilecek herhangi bir fonksiyon gövdesi (`useCart`, `CartProvider`, vb.) bulunmamaktadır. Fonksiyon gövdeleri muhtemelen farklı bir dosyada (ör. `CartContext.tsx` içinde ayrı bir dosya veya aynı dosyanın farklı bir versiyonunda) yer almaktadır.

---

## NODE ID STANDARD

  file: src\contexts\CartContext.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartContext
  export: CartContextType
  export: CartItem

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