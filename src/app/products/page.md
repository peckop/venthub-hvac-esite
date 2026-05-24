---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\products\page.tsx
skeleton_hash: 625c4d8800e7e709
generated_at: 2026-05-23T21:49:50Z
---

## Genel Bakış
`src/app/products/page.tsx` modülü, ürün listesi sayfasının sunucu tarafı işlevselliğini sağlayan tek bir asenkron `Page` fonksiyonunu içerir. Bu fonksiyon, Supabase'den zenginleştirilmiş ürün verilerini çeker, otomatik olarak “Discovery” moduna geçerek tüm ürünlerin keşfedilmesine olanak tanır ve `CategoryMasterView` bileşenini kullanarak sayfayı oluşturur.

## Fonksiyon Grupları
### Sayfa Oluşturma ve Render
Bu grup, ürün sayfasının bütünlüğünü oluşturup tarayıcıya sunmaktan sorumludur. Veri çekme, işleme ve React bileşen ağacını döndürme işlemlerini kapsar.  
- Page

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### Page
**Ne yapar**: `/products` sayfasının ana bileşenini tanımlar. Kullanıcıya Global Discovery giriş noktası sunar; kategori seçilmediği için sistem otomatik olarak 'Discovery' moduna geçer.
**Nasıl yapar**: Merkezi `CategoryMasterView` bileşenini omurga olarak kullanır. Sayfa yüklendiğinde herhangi bir kategori parametresi almadığından, alt bileşenler Discovery modunda çalışacak şekilde yapılandırılır.
**Parametreler**: Yok. Fonksiyon hiçbir argüman almaz (props veya state destructuring yapılmaz).
**Dönüş**: JSX çıktısı (render edilmiş React bileşeni). Dokümantasyonda kesin dönüş tipi belirtilmemiştir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/products/page.tsx::Page
- **params**: yok
- **ic_degiskenler**:
  - `products` — `getProductsEnriched({ limit: 100 })` async çağrısının döndürdüğü `DomainProduct[]` türündeki ürün listesi. Bu veri, `CategoryMasterView` bileşenine `initialProducts` prop’u olarak aktarılır.
- **Dönüş**: JSX (ReactFragment) — `CategoryMasterView` bileşeni `initialCategory={null}` ve `initialProducts={products}` prop’larıyla render edilir. `initialCategory`’nin `null` olması bileşenin bu durumu “Discovery” olarak işlemesini sağlar.

---

## NODE ID STANDARD

  file: src\app\products\page.tsx
  function: src\app\products\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page