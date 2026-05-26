---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\products\ProductHealthBadge.tsx
skeleton_hash: 86fcda867d26a586
generated_at: 2026-05-23T21:53:30Z
---

## Genel Bakış
`ProductHealthBadge` bileşeni, bir ürünün stok miktarı, eşik değeri, mevcut durumu ve öne çıkarma bayrağını alarak bu bilgileri yönetim panelinde görsel bir rozet olarak gösterir. Stok seviyesine ve ürün durumuna göre farklı renk, ikon ve metin kombinasyonları üreterek kullanıcıya ürünün sağlık durumunu hızlıca iletir.

## Fonksiyon Grupları
### UI Render ve Durum Değerlendirme
Bu grup, gelen props değerlerine göre rozetin görünümünü, stilini ve içeriğini belirleyerek tek bir JSX çıktısı üretir. Stok durumu, eşik karşılaştırması ve öne çıkarma durumu gibi koşullara göre uygun renk, ikon ve metni seçerek ürünün sağlık bilgisini görselleştirir.  
- ProductHealthBadge

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSIYON DETAYLARI

### ProductHealthBadge
**Ne yapar**: ProductHealthBadge, bir ürünün stok durumu, eşik değeri, genel durumu ve öne çıkanlık durumu gibi özelliklere dayalı olarak ürünün sağlık durumunu gösteren bir rozet (badge) bileşeni render eder.

**Nasıl yapar**: Fonksiyon, alınan `stockQty`, `threshold`, `status` ve `isFeatured` props'larını kullanarak iç mantıkta ürünün sağlık durumunu belirler (örneğin düşük stok, tükenmiş, öne çıkan vb.) ve bu duruma uygun stil ve metni olan bir JSX elementi döndürür. Bu süreçte koşullu renderlama ve stil uygulama yapılır; ancak özel mantık detayları verilen snippet içinde bulunmadığından burada sadece genel akış açıklanmıştır.

**Parametreler**:
- stockQty: as defined in ProductHealthProps — Ürünün mevcut stok miktarını temsil eder.
- threshold: as defined in ProductHealthProps — Stok seviyesinin düşük kabul edilecek sınır değerini belirtir.
- status: as defined in ProductHealthProps — Ürünün genel durumu (örneğin "available", "out of stock", "discontinued") hakkında bilgi taşır.
- isFeatured: as defined in ProductHealthProps — Ürünün öne çıkan ürün olarak işaretlenip işaretlenmediğini gösteren bir bayraktır.

**Dönüş**: React.FC<ProductHealthProps> — Bir React fonksiyonel bileşeni döndürür; bu bileşen, verilen props'lara göre ürün sağlık rozetini render eder.

---

## INTERFACES

### ProductHealthProps
- `stockQty: number`
- `threshold: number`
- `status: string`
- `isFeatured: boolean`

---

## TYPE ALIASES

### HealthScore
```typescript
type HealthScore = 'A' | 'B' | 'C' | 'D' | 'N/A'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/products/ProductHealthBadge.tsx::ProductHealthBadge
- **params**: stockQty, threshold, status, isFeatured
- **ic_degiskenler**: 
  - `score` — sağlık skoru değerini tutar; 'A', 'B', 'C', 'D' veya 'N/A' olabilir ve stockQty, threshold, status ve isFeatured koşullarına göre belirlenir
  - `colors` — skor değerlerine karşılık gelen Tailwind CSS sınıfı stringlerini içeren nesne; badge'nin arka plan, metin, border ve ring stillerini sağlar
  - `descriptions` — skor değerlerine karşılık gelen Türkçe açıklama metinlerini içeren nesne; badge'nin title özelliğinde gösterilen açıklamayı sağlar
- **Dönüş**: React.FC<ProductHealthProps> (JSX elementi)

---

## NODE ID STANDARD

  file: src\components\admin\products\ProductHealthBadge.tsx
  function: src\components\admin\products\ProductHealthBadge.tsx::ProductHealthBadge

---

## DISA AKTARILANLAR (EXPORTS)
  export: HealthScore
  export: ProductHealthBadge

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-xs`
- **Layout:** `h-6`, `inline-flex`, `items-center`, `justify-center`, `shadow-sm`, `w-6`
- **Responsive:** (yok)
