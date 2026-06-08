---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryPage.tsx
skeleton_hash: 2ed2b5bd5353eb20
entity_hashes:
  func:AdminInventoryPage: 66c4abfcbc4634eb
  func:fetchData: 3334aa9b134a3cd8
  overview: 2e6508db8807146a
  style_tokens: 6c71c306ec3450e6
generated_at: 2026-06-08T10:11:00Z
---

## Genel Bakış
Bu modül, yönetici panelindeki envanter yönetim sayfasını oluşturan bir React bileşenidir. Temel olarak, sayfanın kullanıcı arayüzünü sunar ve sayfada görüntülenecek envanter verilerini asenkron olarak sunucudan çeker.

## Fonksiyon Grupları
### Sayfa Bileşeni
Yönetici paneli envanter sayfasının genel yapısını ve arayüzünü tanımlar. Bileşen, sayfa düzenini ve içerik alanlarını oluşturur.
- AdminInventoryPage

### Veri Çekme İşlemleri
Sayfanın ihtiyaç duyduğu envanter verilerini harici bir kaynaktan (ör. API) asenkron olarak alan işlevi yönetir.
- fetchData

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon imzaları ve sabitler sınırlı bilgi içerdiğinden, çıkarılabilecek mimari varsayımlar kısıtlıdır.

[Aksiyom 1]: Eğer `fetchData()` fonksiyonu çağrıldığında ağ bağlantısı veya API erişilebilirliği yoksa, envanter verileri alınamaz ve bileşen veri gösteremez.

[Aksiyom 2]: Eğer `AdminInventoryPage` bileşeni render edildiğinde `fetchData()` sonucu başarısız olursa (null/undefined/hata dönüyorsa), sayfa eksik veya hatalı veri ile görüntülenir.

[Aksiyom 3]: Eğer `fetchData()` fonksiyonu parametresiz tanımlanmışsa, API endpoint adresi veya filtre parametreleri fonksiyon dışından (dış bağımlılık/global state/proptype) sağlanmalıdır; yoksa veri kaynağı belirsizdir.

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

### [N1_NASIL] AST Pointer: src/views/admin/AdminInventoryPage.tsx::AdminInventoryPage
- **params**: (yok)
- **ic_degiskenler**:
  - `_t` — i18n çeviri fonksiyonu (useI18n'den alınan `t`, `_t` ile aliaslanmış, JSX içinde doğrudan kullanılmıyor)
  - `loading` — boolean state, verilerin yüklenip yüklenmediğini tutar, true iken spinner gösterilir
  - `setLoading` — loading state setter, fetchData içinde true/false olarak ayarlanır
  - `data` — `InventorySummaryRow[]` tipinde state, envanter özet satırlarını tutar
  - `setData` — data state setter, fetchData ile supabase sonucu buraya yazılır
  - `categories` — `Category[]` tipinde state, kategori listesini tutar
  - `setCategories` — categories state setter, fetchData ile supabase sonucu buraya yazılır
  - `searchTerm` — string state, ürün adına göre arama filtresi değerini tutar
  - `setSearchTerm` — searchTerm state setter, input onChange ile güncellenir
  - `filterCategory` — `string | null` state, seçili kategori filtresini tutar
  - `setFilterCategory` — filterCategory state setter, select onChange ile güncellenir
  - `filterStockStatus` — `'all' | 'low' | 'out'` state, stok durumu filtresini tutar (sadece 'all' olarak başlatılmış, değiştirilmiyor)
  - `fetchData` — async fonksiyon, envanter ve kategori verilerini paralel olarak yükler
  - `filteredData` — useMemo ile hesaplanan, searchTerm/filterCategory/filterStockStatus'e göre filtrelenmiş ve formatlanmış envanter satır dizisi
- **Dönüş**: JSX (React functional component)

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