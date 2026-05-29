---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminInventoryPage.tsx
skeleton_hash: 0e1fc965c11933ba
entity_hashes:
  func:AdminInventoryPage: 66c4abfcbc4634eb
  func:fetchData: 3334aa9b134a3cd8
  overview: 41fe2e512a59d859
  style_tokens: 6c71c306ec3450e6
generated_at: 2026-05-29T18:57:05Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yönetici panelindeki envanter yönetim sayfasını oluşturan bir React bileşenidir. Temel olarak, envanter verilerini sunucudan çekerek sayfada görüntülemekten ve kullanıcı arayüzünü sunmaktan sorumludur.

## Fonksiyon Grupları
### Sayfa Bileşeni
Yönetici paneli envanter sayfasının tüm kullanıcı arayüzünü ve sayfa yapısını oluşturarak, veri gösterimini ve etkileşimi yönetir.
- AdminInventoryPage

### Veri Yonetimi
Sayfada gösterilecek envanter verilerini asenkron olarak çekerek bileşenin ihtiyaç duyduğu verileri sağlar.
- fetchData

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi bilgisi verilmediğinden, güvenilir mimari varsayımlar çıkarılamamıştır.

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

### [N1_NASIL] AST Pointer: `src/views/admin/AdminInventoryPage.tsx`::AdminInventoryPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `_t` — `useI18n()` hookundan dönen çeviri fonksiyonu, `_t` olarak yeniden adlandırılmış (kullanılmıyor ama import edilmiş)
  - `loading` — `useState(true)` ile oluşturulan state, veri yükleme durumunu tutar, `setLoading` ile güncellenir
  - `data` — `useState<InventorySummaryRow[]>([])` ile oluşturulan state, inventory_summary tablosundan çekilen satır verilerini tutar
  - `categories` — `useState<Category[]>([])` ile oluşturulan state, categories tablosundan çekilen kategori listesini tutar
  - `searchTerm` — `useState('')` ile oluşturulan state, ürün arama filtresinin metnini tutar
  - `filterCategory` — `useState<string | null>(null)` ile oluşturulan state, seçili kategori filtresini tutar
  - `filterStockStatus` — `useState<'all' | 'low' | 'out'>('all')` ile oluşturulan state, stok durumu filtresini tutar (sadece okunur, set edilmez)
  - `fetchData` — inner async fonksiyon, supabase'den inventory ve kategori verilerini çeker
  - `filteredData` — `useMemo` ile hesaplanan, arama/kategori/stok filtrelerine göre süzülmüş ve normalize edilmiş ürün listesi
- **Dönüş**: JSX — Envanter yönetimi sayfasının tamamını render eden React bileşeni JSX'i

---

### [N2_NASIL] AST Pointer: `src/views/admin/AdminInventoryPage.tsx`::fetchData
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `invRes` — `Promise.all` ile eş zamanlı olarak `supabase.from('inventory_summary').select(...)` çağrısının sonucu, inventory verilerini ve `.error` özelliğini tutar
  - `catRes` — `Promise.all` ile eş zamanlı olarak `supabase.from('categories').select(...)` çağrısının sonucu, kategori verilerini ve `.error` özelliğini tutar
  - `err` — `catch` bloğunda yakalanan hata nesnesi, `unknown` tipinde, `console.error` ile loglanır
- **Dönüş**: yok (yan etki: `loading`, `data`, `categories` state'lerini günceller; hata olursa `toast.error` gösterir)

---

### [N3_NASIL] AST Pointer: `src/views/admin/AdminInventoryPage.tsx`::useEffectCallback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (yok — doğrudan `fetchData()` çağrısı yapar)
- **Dönüş**: yok (yan etki: bileşen mount edildiğinde `fetchData`'yı çağırır)

---

### [N4_NASIL] AST Pointer: `src/views/admin/AdminInventoryPage.tsx`::useMemoCallback (filteredData hesaplama)
- **params**: (parametre yok — `useMemo` callback'i)
- **ic_degiskenler**:
  - `item` — `data.filter` callback'inin parametresi, `InventorySummaryRow` tipinde tek bir envanter satırı
  - `matchesSearch` — boolean, `searchTerm` boşsa true,否则 `item.name` küçük harfe çevrilip `searchTerm` ile karşılaştırılır
  - `matchesCategory` — boolean, `filterCategory` null ise true,否则 `item.category_id === filterCategory` kontrolü yapılır
  - `stock` — `item.physical_stock || 0` ifadesinden hesaplanan fiziksel stok miktarı, default 0
  - `threshold` — sabit `5` değeri, düşük stok eşik değeri olarak kullanılır
  - `matchesStock` — boolean, `filterStockStatus` değerine göre (`'all'`/`'low'`/`'out'`) stok durumu eşleşmesini kontrol eder
- **Dönüş**: filtrelenmiş ve normalize edilmiş `{ product_id, name, physical_stock, reserved_stock, available_stock, warehouse_location, supplier_name }` objesi dizisi

---

### [N5_NASIL] AST Pointer: `src/views/admin/AdminInventoryPage.tsx`::filterCallback (item => ...)
- **params**: `item` — `InventorySummaryRow` tipinde, `data` dizisindeki tek bir satır
- **ic_degiskenler**:
  - `matchesSearch` — boolean, ürün adının `searchTerm` ile eşleşip eşleşmediğini tutar
  - `matchesCategory` — boolean, `item.category_id` ile `filterCategory`'in eşleşip eşleşmediğini tutar
  - `stock` — `item.physical_stock || 0` hesaplaması ile elde edilen sayısal stok değeri
  - `threshold` — sabit `5` değeri, düşük stok eşiği
  - `matchesStock` — boolean, `filterStockStatus` filtresine göre stok durumu eşleşmesini tutar
- **Dönüş**: boolean — item filtre kriterlerini karşılıyorsa `true`, karşılamıyorsa `false`

---

### [N6_NASIL] AST Pointer: `src/views/admin/AdminInventoryPage.tsx`::mapCallback (item => {...})
- **params**: `item` — `InventorySummaryRow` tipinde, filtrelenmiş `data` dizisindeki tek bir satır
- **ic_degiskenler**:
  - (yok — doğrudan obje döner)
- **Dönüş**: `{ product_id: string, name: string, physical_stock: number, reserved_stock: number, available_stock: number, warehouse_location: string|undefined, supplier_name: string|undefined }` — normalize edilmiş envanter satırı objesi, `item.product_id || ''`, `item.name || 'İsimsiz Ürün'` gibi fallback değerlerle

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