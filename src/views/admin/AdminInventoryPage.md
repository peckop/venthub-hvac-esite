---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryPage.tsx
skeleton_hash: 9d18d8e3717d7917
entity_hashes:
  func:AdminInventoryPage: 66c4abfcbc4634eb
  func:fetchData: 3334aa9b134a3cd8
  overview: 69a8090469d0bd88
  style_tokens: 6c71c306ec3450e6
generated_at: 2026-06-06T21:57:20Z
---

## Genel Bakış

Bu modül, yönetici panelindeki envanter yönetim sayfasını sunan bir React bileşenidir. Envante ait verileri sunucudan çekerek kullanıcıya sunar ve sayfa yapısını oluşturur.

## Fonksiyon Grupları

### Sayfa Bileşeni
Yönetici paneli envanter sayfasının kullanıcı arayüzünü ve sayfa düzenini tanımlar. Bileşen, sayfa içeriğini ve etkileşim alanlarını render eder.
- AdminInventoryPage

### Veri Yonetimi
Sayfada görüntülenecek envanter bilgilerini asenkron olarak sunucudan çeker. Bileşenin ihtiyaç duyduğu verileri sağlamakla görevlidir.
- fetchData

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### AdminInventoryPage
**Ne yapar**: React uygulamasında yönetim paneli için envanter sayfasını tanımlayan bir fonksiyon bileşeni döndürür.  
**Nasıl yapar**: Fonksiyon, tipik bir React fonksiyon bileşeni (`React.FC`) olarak tanımlanır ve JSX içinde envanterle ilgili UI öğelerini render eder.  
**Parametreler**:  
- *yok* — Bu bileşen dışarıdan parametre almaz.  
**Dönüş**: `React.FC` — Bileşen tipinde bir fonksiyon, React element ağacını üretir.

### fetchData
**Ne yapar**: Sunucudan veya başka bir veri kaynağından envanter verilerini asenkron olarak almayı amaçlayan bir yardımcı fonksiyondur.  
**Nasıl yapar**: Fonksiyon gövdesi içinde kendisini çağıran bir ok fonksiyonu (`() => { fetchData(); }`) bulunur; bu, veri çekme işlemini tetiklemek için bir callback olarak kullanılabilir. Gerçek veri çekme mantığı kodda belirtilmemiştir.  
**Parametreler**:  
- *yok* — Fonksiyon herhangi bir argüman kabul etmez.  
**Dönüş**: Belirtilmemiş (void veya bilinmeyen).

---

## TYPE ALIASES

### InventorySummaryRow
```typescript
type InventorySummaryRow = Database['public']['Views']['inventory_summary']['Row'] & { category_id?: string | null }
```

### Category
```typescript
type Category = Database['public']['Tables']['categories']['Row']
```

---

## AST POINTERS

### [N1_NASIL] AdminInventoryPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `_t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `[loading, setLoading]` — sayfa yüklenme durumu state'i
  - `[data, setData]` — inventory_summary tablosundan çekilen envanter verisi dizisi
  - `[categories, setCategories]` — categories tablosundan çekilen kategori listesi dizisi
  - `[searchTerm, setSearchTerm]` — ürün arama metni state'i
  - `[filterCategory, setFilterCategory]` — seçili kategori filtresi (string veya null)
  - `[filterStockStatus]` — stok durumu filtresi: 'all', 'low' veya 'out'
  - `filteredData` — useMemo ile hesaplanmış, filtrelenmiş ve dönüştürülmüş envanter verisi
- **Dönüş**: JSX (React bileşeni)

---

### [N2_NASIL] fetchData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `invRes` — Promise.all ile supabase.inventory_summary tablosundan gelen yanıt (product_id, name, supplier_name, warehouse_location, physical_stock, reserved_stock, available_stock alanları)
  - `catRes` — Promise.all ile supabase.categories tablosundan gelen yanıt (id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content alanları)
  - `err` — catch bloğundaki hata nesnesi (unknown tipi)
- **Yan etkiler**: setLoading(true/false), setData(invRes.data), setCategories(catRes.data), toast.error(), console.error()
- **Dönüş**: yok (undefined)

---

### [N3_NASIL] useEffect Callback (fetchData çağırıcı)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (yok — doğrudan fetchData() çağırılıyor)
- **Yan etkiler**: fetchData() fonksiyonunu çalıştırır
- **Dönüş**: yok

---

### [N4_NASIL] useMemo Callback (filteredData hesaplayıcı)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `item` — data dizisindeki her bir envanter satırı (filter ve map callback'inde kullanılır)
  - `matchesSearch` — searchTerm boş veya item.name içeriğinde arama metni varsa true
  - `matchesCategory` — filterCategory null veya item.category_id eşleşiyorsa true
  - `stock` — item.physical_stock değeri, 0 ise 0 olarak alınır
  - `threshold` — düşük stok eşiği sabiti (5)
  - `matchesStock` — filterStockStatus 'all', 'low' veya 'out' durumuna göre stok eşleşme durumu
- **Bağımlılıklar**: [data, searchTerm, filterCategory, filterStockStatus]
- **Dönüş**: filtrelenmiş ve dönüştürülmüş envanter satırı dizisi (product_id, name, physical_stock, reserved_stock, available_stock, warehouse_location, supplier_name)

---

### [N5_NASIL] Filter Callback (item => boolean)
- **params**: `item` — data dizisinden gelen tek bir envanter satırı
- **ic_degiskenler**:
  - `matchesSearch` — searchTerm boşsa true, değilse item.name küçük harfe çevrilip searchTerm içeriğinde aranır
  - `matchesCategory` — filterCategory null ise true, değilse item.category_id === filterCategory kontrolü
  - `stock` — item.physical_stock değeri, null/undefined ise 0 olarak alınır
  - `threshold` — düşük stok eşiği sabiti (5)
  - `matchesStock` — 'all' ise true; 'low' ise stock <= 5 && stock > 0; 'out' ise stock <= 0
- **Dönüş**: boolean (matchesSearch && matchesCategory && matchesStock)

---

### [N6_NASIL] Map Callback (item => object)
- **params**: `item` — filter'dan geçmiş tek bir envanter satırı
- **ic_degiskenler**:
  - (yok — doğrudan nesne döndürülür)
- **Dönüş**: `{ product_id, name, physical_stock, reserved_stock, available_stock, warehouse_location, supplier_name }` — product_id boş string, name boşsa 'İsimsiz Ürün', stok alanları 0 fallback ile

---

## NODE ID STANDARD

  file: src\views\admin\AdminInventoryPage.tsx
  function: src\views\admin\AdminInventoryPage.tsx::AdminInventoryPage
  function: src\views\admin\AdminInventoryPage.tsx::fetchData

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminInventoryPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-50`, `bg-primary-navy`, `bg-white`, `border-gray-200`, `border-light-gray`, `hover:text-primary-navy`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-white`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `items-center`, `justify-between`, `left-3`, `md:flex-row`, `md:items-center`, `p-2`, `p-4`, `relative`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `-translate-y-1/2`, `animate-fadeIn`, `animate-spin`, `border`, `focus-visible:outline-none`, `font-bold`, `mb-4`, `mx-auto`, `pl-10`, `pr-4`, `px-3`, `px-4`, `py-2`, `py-20`, `rounded-lg`