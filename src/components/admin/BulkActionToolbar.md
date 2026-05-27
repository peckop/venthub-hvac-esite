---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\BulkActionToolbar.tsx
skeleton_hash: 7bf65b45d538cf54
entity_hashes:
  func:BulkActionToolbar: ba39222c0aa88e73
  overview: e440025fef007b62
  style_tokens: 812207303bb8adc3
generated_at: 2026-05-27T18:10:35Z
---

## Genel Bakış
`BulkActionToolbar` bileşeni, yönetim panelinde birden fazla öğe seçildiğinde toplu işlemler (durum güncelleme, özellik değiştirme, silme) yapabilmek için kullanılan bir araç çubuğu sağlar. Seçili öğe sayısını gösterir ve ilgili eylemlerin tetiklenmesi için dışarıdan gelen callback fonksiyonlarını yönetir.

## Fonksiyon Grupları
### UI Render ve Görsel Düzen
Bu grup, seçili öğe sayısını gösteren etiket, eylem butonları ve araç çubuğunun genel görünümünü oluşturur.  
- BulkActionToolbar

### Eylem Tetikleme ve Callback Yönetimi
Bu grup, buton tıklamalarıyla gelen kullanıcı etkileşimlerini alır, ilgili parametreleri (ör. yeni durum, özellik anahtarı) hazırlayarak dışarıdan sağlanan `onStatusChange`, `onFeatureToggle` ve `onDelete` callback’lerini çağırır.  
- BulkActionToolbar (içindeki event handler mantığı)

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### BulkActionToolbar
**Ne yapar**: Seçili öğe sayısını gösteren ve toplu eylemler (durum değişikliği, özellik geçişi, silme) için tetikleyiciler sağlayan bir React bileşenini tanımlar.  

**Nasıl yapar**: Props olarak aldığı `selectedCount`, `onStatusChange`, `onFeatureToggle` ve `onDelete` fonksiyonlarını UI elemanlarına bağlayarak, kullanıcı etkileşimlerine göre ilgili geri çağırma fonksiyonlarını çalıştırır. Bileşen, `BulkActionToolbarProps` tipinde bir fonksiyonel bileşen (`React.FC`) olarak döndürülür.  

**Parametreler**:
- `selectedCount`: number — Kullanıcı tarafından seçilen öğelerin toplam sayısı.
- `onStatusChange`: (newStatus: string) => void — Seçili öğelerin durumunu güncellemek için çağrılan geri çağırma fonksiyonu.
- `onFeatureToggle`: (featureName: string, enabled: boolean) => void — Belirli bir özelliğin etkinleştirilip devre dışı bırakılmasını yönetmek için kullanılan geri çağırma fonksiyonu.
- `onDelete`: () => void — Seçili öğelerin toplu silinmesini tetikleyen geri çağırma fonksiyonu.

**Dönüş**: React.FC<BulkActionToolbarProps> — Tanımlanan props tipine uygun bir fonksiyonel React bileşeni.

---

## INTERFACES

### BulkActionToolbarProps
- `selectedCount: number`
- `onStatusChange: (status: string) => void`
- `onFeatureToggle: (featured: boolean) => void`
- `onDelete: () => void`
- `onPriceAdjust: (mode: 'percent' | 'fixed', value: number) => void`
- `onClearSelection: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\components\admin\BulkActionToolbar.tsx::BulkActionToolbar
- **params**: selectedCount, onStatusChange, onFeatureToggle, onDelete, onPriceAdjust, onClearSelection
- **ic_degiskenler**:
  - `showPricePanel` — Fiyat güncelleme panelinin görünürlüğünü kontrol eden boolean React state değeri
  - `setShowPricePanel` — showPricePanel state'ini güncellemek için kullanılan setState fonksiyonu
  - `priceMode` — Fiyat güncelleme modunu tutan state, 'percent' (yüzde) veya 'fixed' (sabit) değerlerini alır
  - `setPriceMode` — priceMode state'ini güncelleyen setState fonksiyonu
  - `priceValue` — Kullanıcının girdiği fiyat değerini string olarak tutan React state değeri
  - `setPriceValue` — priceValue state'ini güncelleyen setState fonksiyonu
  - `adminButtonPrimaryClass` — Import edilen, butonlara stil vermek için kullanılan CSS sınıfı
- **Dönüş**: null | JSX.Element; seçili ürün sayısı 0 ise null, aksi halde toolbar JSX yapısını döndürür

### [N2_NASIL] AST Pointer: src\components\admin\BulkActionToolbar.tsx::fiyatGuncelleUygulaOnClick
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `v` — Kullanıcının girdiği string tipindeki priceValue'nin float'a dönüştürülmüş sayısal hali
  - `priceValue` — Üst kapsamdan erişilen, kullanıcının girdiği fiyat değerini tutan state
  - `priceMode` — Üst kapsamdan erişilen, seçili fiyat güncelleme modunu tutan state
  - `onPriceAdjust` — Üst parametrelerden alınan, toplu fiyat güncelleme işlemini tetikleyen callback fonksiyonu
  - `setShowPricePanel` — Fiyat panelini kapatmak için kullanılan üst kapsamdaki setState fonksiyonu
  - `setPriceValue` - İşlem sonrası fiyat girişini sıfırlamak için kullanılan üst kapsamdaki setState fonksiyonu
  - `alert` — Tarayıcının yerleşik uyarı fonksiyonu, geçersiz sayısal giriş durumunda çağrılır
- **Dönüş**: void | number; geçersiz giriş durumunda alert() dönüş değerini döndürür, başarılı işlemde hiçbir değer döndürmez

---

## NODE ID STANDARD

  file: src\components\admin\BulkActionToolbar.tsx
  function: src\components\admin\BulkActionToolbar.tsx::BulkActionToolbar

---

## DISA AKTARILANLAR (EXPORTS)
  export: BulkActionToolbar

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-400/80`, `bg-emerald-500/80`, `bg-gray-400/80`, `bg-gray-50`, `bg-primary-navy`, `bg-red-500/80`, `bg-white`, `bg-white/20`, `bg-yellow-500/80`, `border-gray-200`, `border-primary-navy`, `hover:bg-blue-400`, `hover:bg-emerald-500`, `hover:bg-gray-400`, `hover:bg-red-500`
- **Layout:** `absolute`, `bg-yellow-500/80`, `bottom-4`, `bottom-full`, `fixed`, `flex`, `flex-1`, `flex-wrap`, `gap-2`, `gap-3`, `h-6`, `h-8`, `hover:bg-yellow-500`, `items-center`, `justify-center`
- **Varyant/Responsive:** `:`, `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `!py-2`, `!text-xs`, `${adminButtonPrimaryClass`, `${priceMode`, `:`, `===`, `animate-slide-up`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/30`, `font-bold`, `font-medium`, `font-semibold`, `mb-2`