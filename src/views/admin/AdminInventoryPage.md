---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryPage.tsx
skeleton_hash: 301cb4887a0dcdea
entity_hashes:
  func:AdminInventoryPage: 66c4abfcbc4634eb
  func:fetchData: 3334aa9b134a3cd8
  overview: 2651cee931ba15f0
  style_tokens: 162ca5315152734a
generated_at: 2026-05-27T11:55:43Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yönetici paneli envanter sayfasını temsil eden bir React bileşenidir. Sayfanın kullanıcı arayüzünü render etme ve gösterilecek envanter verilerini çekme sorumluluklarına sahiptir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Yönetici paneli envanter sayfasının temel yapısını ve kullanıcı arayüzünü render eder, sayfa içindeki işlemlerin koordinasyonunu sağlar.
- AdminInventoryPage

### Veri Çekme İşlemleri
Sayfada görüntülenecek envanterle ilgili verileri eşzamansız olarak kaynaktan çekmekle sorumludur, ana sayfa bileşeni tarafından kullanılır.
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

### [N1_NASIL] AST Pointer: src\views\admin\AdminInventoryPage.tsx::AdminInventoryPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `_t` — `useI18n` hook’undan gelen çeviri fonksiyonu (alias)
  - `loading` — veri yükleniyor mu bilgisini tutan boolean state
  - `setLoading` — `loading` state’ini güncelleyen setter fonksiyonu
  - `data` — `inventory_summary` tablosundan gelen satırların listesi (`InventorySummaryRow[]`)
  - `setData` — `data` state’ini güncelleyen setter fonksiyonu
  - `categories` — `categories` tablosundan gelen kategori listesi (`Category[]`)
  - `setCategories` — `categories` state’ini güncelleyen setter fonksiyonu
  - `searchTerm` — arama kutusuna girilen metin
  - `setSearchTerm` — `searchTerm` state’ini güncelleyen setter fonksiyonu
  - `filterCategory` — seçili kategori id’si veya `null`
  - `setFilterCategory` — `filterCategory` state’ini güncelleyen setter fonksiyonu
  - `filterStockStatus` — stok filtresi; `'all' | 'low' | 'out'` değerlerinden biri
  - `fetchData` — API’dan envanter ve kategori verilerini çeken async fonksiyon (aşağıda tanımlı)
  - `filteredData` — `data` üzerinde arama, kategori ve stok filtresi uygulanıp dönüştürülmüş satır listesi
- **Dönüş**: JSX element – komponentin render çıktısı (HTML/React element ağacı)

### [N2_NASIL] AST Pointer: src\views\admin\AdminInventoryPage.tsx::fetchData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `invRes` — `supabase.from('inventory_summary')` sorgusunun sonucu (`{ data?, error? }`)
  - `catRes` — `supabase.from('categories')` sorgusunun sonucu (`{ data?, error? }`)
  - `err` — `catch` bloğunda yakalanan hata nesnesi (`unknown`)
- **Dönüş**: yok (fonksiyon yan etkilerle `loading`, `data`, `categories` state’lerini günceller)

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
- **Renkler:** `bg-gray-50`, `bg-primary-navy`, `bg-white`, `border-gray-200`, `border-light-gray`, `text-2xl`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-white`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `items-center`, `justify-between`, `left-3`, `md:flex-row`, `md:items-center`, `p-2`, `p-4`, `relative`
- **Responsive:** `md:` prefix kullanımları