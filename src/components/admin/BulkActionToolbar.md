---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\BulkActionToolbar.tsx
skeleton_hash: 7bf65b45d538cf54
generated_at: 2026-05-23T21:51:23Z
---

## Genel Bakış
`BulkActionToolbar` bileşeni, yönetim panelinde birden fazla öğe seçildiğinde toplu işlem seçeneklerini sunan bir araç çubuğudur. Seçili öğe sayısını görsel olarak belirtir ve durum değiştirme, özellik açma/kapama ve silme gibi eylemleri dışarıdan sağlanan çağrı fonksiyonları aracılığıyla üst bileşene iletir.

## Fonksiyon Grupları
### UI Render ve Görsel Düzen
Bu grup, araç çubuğunun görsel yapısını oluşturur; seçili öğe sayısını gösteren etiket, eylem butonları ve olası menü öğelerinin düzenlenmesinden sorumludur.  
- BulkActionToolbar

### Eylem Tetikleme ve Callback Yönetimi
Kullanıcı bir butona tıkladığında veya bir seçim yaptığında, ilgili dış çağrı fonksiyonlarını (`onStatusChange`, `onFeatureToggle`, `onDelete`) çalıştırarak iş mantığını üst katmana aktarır.  
- BulkActionToolbar

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### BulkActionToolbar
**Ne yapar**: Seçili öğeler üzerinde toplu işlemler yapmak için bir araç çubuğu bileşenidir. Seçili öğe sayısını gösterir ve durum değiştirme, özellik açma/kapama ve silme gibi eylemler için butonlar sunar.

**Nasıl yapar**: Bileşen, props olarak aldığı `selectedCount`, `onStatusChange`, `onFeatureToggle` ve `onDelete` değerlerini kullanarak bir araç çubuğu arayüzü oluşturur. Seçili sayı bir metin olarak render edilir, her işlem butonu kendi callback fonksiyonuna bağlanır. Butonlara tıklandığında ilgili callback tetiklenerek üst bileşene bildirim gönderilir.

**Parametreler**:
- selectedCount: number — Araç çubuğunda görüntülenecek olan seçili öğe sayısı.
- onStatusChange: function — Toplu durum değişikliği butonuna tıklandığında çağrılır.
- onFeatureToggle: function — Toplu özellik açma/kapama butonuna tıklandığında çağrılır.
- onDelete: function — Toplu silme butonuna tıklandığında çağrılır.

**Dönüş**: `React.FC<BulkActionToolbarProps>` tipinde bir fonksiyonel React bileşeni döndürür. Bileşen, içerdiği JSX elemanlarını kullanıcıya render eder.

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

### [N1_NASIL] AST Pointer: admin/BulkActionToolbar.tsx::BulkActionToolbar
- **params**: `selectedCount`, `onStatusChange`, `onFeatureToggle`, `onDelete`, `onPriceAdjust`, `onClearSelection`
- **ic_degiskenler**:
  - `showPricePanel` — fiyat güncelleme panelinin açılıp kapanmasını kontrol eden boolean state
  - `setShowPricePanel` — `showPricePanel` state'ini güncelleyen fonksiyon
  - `priceMode` — fiyat modunu (`'percent'` veya `'fixed'`) tutan state
  - `setPriceMode` — `priceMode` state'ini güncelleyen fonksiyon
  - `priceValue` — fiyat güncelleme inputunun değerini tutan state
  - `setPriceValue` — `priceValue` state'ini güncelleyen fonksiyon
  - `adminButtonPrimaryClass` — UI için import edilen CSS sınıfı (buton className'inde kullanılır)
- **Dönüş**: JSX.Element | null (seçili ürün sayısı 0 ise `null`, değilse toplu işlem çubuğu JSX'i)

### [N2_NASIL] AST Pointer: admin/BulkActionToolbar.tsx::BulkActionToolbar.onClickUygula
- **params**: yok
- **ic_degiskenler**:
  - `v` — `parseFloat(priceValue)` ile elde edilen sayısal değer
  - `priceValue` — dış kapsamdaki fiyat input state'i (sayıya çevirmek için okunur)
  - `priceMode` — dış kapsamdaki fiyat modu state'i (`'percent'` veya `'fixed'`)
  - `onPriceAdjust` — dış kapsamdaki toplu fiyat güncelleme fonksiyonu (state güncelleme ve kapatma işlemi)
  - `setShowPricePanel` — dış kapsamdaki panel görünürlük state'ini güncelleyen fonksiyon
  - `setPriceValue` — dış kapsamdaki `priceValue` state'ini sıfırlayan fonksiyon
- **Dönüş**: void (geriye değer döndürmez; yan etkiler: `alert`, `onPriceAdjust` çağrısı, state güncellemeleri)

---

## NODE ID STANDARD

  file: src\components\admin\BulkActionToolbar.tsx
  function: src\components\admin\BulkActionToolbar.tsx::BulkActionToolbar

---

## DISA AKTARILANLAR (EXPORTS)
  export: BulkActionToolbar