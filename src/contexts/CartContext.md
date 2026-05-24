---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\CartContext.tsx
skeleton_hash: 72b86346b922fcd4
generated_at: 2026-05-23T22:28:49Z
---

## Genel Bakış
Bu React modülü, VentHub HVAC projesinin alışveriş sepeti (cart) durumunu tüm uygulama bileşenleri arasında paylaşılabilir hale getirmek için tasarlanmış bir context yapısıdır. React'in yerel createContext fonksiyonu kullanılarak oluşturulan CartContext, sepet içeriği ve işlemlerinin uygulama genelinde erişilebilmesini sağlayan temel yapıdır. Modül, Supabase entegrasyonundan alınan Product tipini kullanarak sepet öğelerinin tip güvenliğini sağlar, herhangi bir harici API sorgulaması veya ortam değişkeni kullanmaz, yalnızca uygulama içi durum yönetimi altyapısı sunar. Dosyada tanımlı herhangi bir özel fonksiyon bulunmadığından ek fonksiyon grubu listelenmemektedir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, proje içerisinde alışveriş sepeti durumunu tüm alt bileşenlerle paylaşmak üzere React Context API'si ile oluşturulmuş CartContext nesnesini barındırır, çalışması için React altyapısının projeye entegre olması ve context kullanımına uygun Provider sarmalaması yapılması zorunludur.

[Aksiyom 1]: Eğer projeye React kütüphanesi dahil edilmemişse, CartContext nesnesi tanımlanamaz, modül çalışma zamanı hatası alır.
[Aksiyom 2]: Eğer CartContext.Provider, context'i tüketen tüm bileşenlerin üst ağacında sarmalama işlemi için kullanılmamışsa, sepet verilerine erişim sağlanamaz, tüketim yapan tüm bileşenler çalışma zamanı hatası alır.
[Aksiyom 3]: Eğer modülün içe aktarıldığı dosyalarda TypeScript tarafından CartContext'in tip tanımları çözümlenemiyorsa, uygulama derleme aşamasında hata verir ve çalıştırılamaz.

---



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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\CartContext.tsx::createContext çağrısı
- **params**: (çağrıya ait varsayılan context değeri ve tip parametreleri dosya içeriğinde belirtilmemiştir)
- **ic_degiskenler**:
  - `CartContext` — React createContext API'si ile oluşturulan, alışveriş sepeti durumunu uygulama genelinde paylaşmak için tanımlanan context nesnesi
  - `createContext` — React kütüphanesinden import edilen, React context oluşturmaya yarayan yerleşik API fonksiyonu
  - `Product` — ../lib/supabase modülünden import edilen, ürün verilerinin tip tanımını içeren TypeScript tipi
- **Dönüş**: Oluşturulan React context nesnesi, CartContext sabitine atanmıştır

---

## NODE ID STANDARD

  file: src\contexts\CartContext.tsx

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartContext
  export: CartContextType
  export: CartItem