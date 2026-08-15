---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\pricing\CostRefreshModal.tsx
skeleton_hash: d5581159a8130481
entity_hashes:
  func:CostRefreshModal: 6d78cfeb2c873bb6
  overview: 21a4586912b6831f
  style_tokens: bd81234d13a2dffa
generated_at: 2026-08-15T03:54:29Z
---

## Genel Bakış
CostRefreshModal, administratif fiyatlandırma modülünde maliyet verilerinin yenilenmesi için kullanılan bir bileşendir. Kullanıcıya maliyetleri yenileme işlemini onaylaması için bir modal pencere sunar ve başarılı bir operasyon sonrasında üst bileşeni bilgilendirir.

## Fonksiyon Grupları
### Maliyet Yenileme İşlemi
Bu grup, maliyet verilerinin yenilenmesiyle ilgili kullanıcı etkileşimini ve işlemin tetiklenmesini yönetir.
- CostRefreshModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden çıkarılabilecek mimari varsayım bulunmamaktadır.

---

## FONKSİYON DETAYLARI

### CostRefreshModal
**Ne yapar**: Admin pricing modülünde maliyet yenileme işlemlerini başlatmak için bir modal (pencere) bileşenini oluşturur ve yönetir. Bileşen, dışarıdan kontrol edilen bir açılır pencere olarak davranır ve onSuccess callback'i ile yenileme işleminin başarısını üst bileşene iletir.

**Nasıl yapar**: `React.FC<CostRefreshModalProps>` türünde bir fonksiyonel bileşendir. `open` prop'unu kullanarak modalın görünürlüğünü kontrol eder. Bileşen, iç durumunu (yükleniyor durumu, hata durumu gibi) yönetmek için React hook'larını (örn. `useState`, `useEffect`) kullanır. Modalın kapatılma eylemini `onClose` prop'u ile tetikler. Maliyet yenileme işlemi başarıyla tamamlandığında `onSuccess` prop'unu çağırarak üst bileşene bilgi verir. Bileşen, iç mantığında bir API çağrısı (örn. maliyet verilerini yenileme) gerçekleştirir ve bu işlemin durumunu kullanıcıya gösterir (örn. loading spinner, başarı/hata mesajları).

**Parametreler**:
- `open` : `boolean` — Modalın açık olup olmadığını belirten bayrak. `true` olduğunda modal görüntülenir, `false` olduğunda gizlenir.
- `onClose` : `() => void` — Modalın kapatılması istendiğinde çağrılacak geri çağırma fonksiyonu. Bu fonksiyon, modalı kapatmak için gerekli eylemleri (örn. durumu sıfırlama, animasyonları yönetme) tetikler.
- `onSuccess` : `() => void` — Maliyet yenileme işleminin başarıyla tamamlandığında çağrılacak geri çağırma fonksiyonu. Bu fonksiyon, üst bileşenin（örn. CostRefreshModal'ı çağıran bileşen）veri listesini yenilemesini veya başka başarılı eylemleri gerçekleştirmesini sağlar.

**Dönüş**: `React.FC<CostRefreshModalProps>` — Modalın JSX yapısını (React Element) döndüren bir React fonksiyonel bileşeni. Bileşen, `CostRefreshModalProps` arayüzüne uygun prop'ları alır ve koşullu render mantığıyla（`open` prop'una bağlı olarak）modalı DOM'a ekler veya kaldırır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminButtonPrimaryClass
- import: ../../../utils/adminUi::adminModalScrollAreaClass
- import: @/hooks/useRole::useRole
- import: @/i18n/I18nProvider::useI18n
- import: @/i18n/format::formatNumber
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @radix-ui/react-dialog
- import: lucide-react::AlertTriangle
- import: lucide-react::Loader2
- import: lucide-react::RefreshCw
- import: lucide-react::Save
- import: lucide-react::X
- import: react::React
- import: react::useCallback
- import: react::useEffect
- import: react::useRef
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### CostRefreshModalProps
"Maliyetleri tazele" modalı. NEDEN AYRI BİR ADIM: `purchase_price` EUR cinsinden LİSTE fiyatıdır; `cost_in_base` ise onun TL karşılığının DONMUŞ hâlidir. Kur her gün değişir, dolayısıyla tazeleyen bir adım olmadan bütün vitrin, maliyetin en son yazıldığı günün kurunda kalır — cetvel §2·A'nın "liste 
- `open: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CostRefreshModal.tsx::CostRefreshModal
- **params**: `{ open, onClose, onSuccess }`
  - `open` — boolean, modalın açık olup olmadığını kontrol eder
  - `onClose` — fonksiyon, modalı kapatmak için çağrılır
  - `onSuccess` — fonksiyon, başarılı işlem sonrası çağrılır
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `lang` — useI18n hook'undan gelen mevcut dil kodu ('en' veya 'tr')
  - `locale` — lang'a göre türetilen locale string, formatNumber'e passedılır
  - `canWrite` — useRole hook'undan gelen rol bazlı yazma izni kontrol fonksiyonu
  - `hasWriteAccess` — canWrite('pricing') çağrısıyla elde edilen boolean, pricing bölümünde yazma izni olup olmadığını gösterir
  - `previewLoading` / `setPreviewLoading` — useState: önizleme verisi yüklenirken true olur
  - `preview` / `setPreview` — useState<CostRefreshSummary | null>: Önizleme özetini tutar (taranan, güncellenen, atlanan ürünler ve kullanılan kurlar listesi)
  - `loadFailed` / `setLoadFailed` — useState: Önizleme yükleme hatası durumunu tutar
  - `applying` / `setApplying` — useState: Güncelleme (apply) işleminin devam edip etmediğini tutar
  - `loadPreview` — useCallback: refreshCostInBase'i dryRun:true ile çağırarak önizleme verisini yükler, iptal fonksiyonu döner
  - `cancelPreviewRef` — useRef<(() => void) | null>: Önceki önizleme iptal fonksiyonunu saklar, yarış durumlarını önler
  - `startPreview` — useCallback: Mevcut iptal fonksiyonunu çağırıp yeni bir önizleme başlatır
  - `handleClose` — useCallback: applying=true iken kapanmayı engeller, onClose'u çağırır
  - `applyRefresh` — useCallback async: mutateWithAudit ile products.cost_in_base tablosunu günceller, toast bildirimleri gösterir
  - `adminModalScrollAreaClass` — import edilmiş CSS class sabiti, modal scroll alanına uygulanır (JSX'te)
  - `adminButtonPrimaryClass` — import edilmiş CSS class sabiti, primary buton stilini tanımlar (JSX'te)
  - `formatNumber` — import edilmiş sayı formatlama fonksiyonu, locale ile birlikte kullanılır
  - `preview.scanned` — taranan toplam ürün sayısı (JSX'te gösterilir)
  - `preview.updated` — güncellenen ürün sayısı (JSX'te gösterilir)
  - `preview.skippedNoRate` — kur olmadığı için atlanan ürün sayısı (JSX'te gösterilir)
  - `preview.skippedNoPurchasePrice` — alış fiyatı olmadığı için atlanan ürün sayısı (JSX'te gösterilir)
  - `preview.ratesUsed` — kullanılan kurların listesi, map ile iterasyon yapılır
  - `r` — preview.ratesUsed.map callback parametresi, tek bir kur kaydını temsil eder
  - `r.currency` — kur para birimi (ör: USD, EUR)
  - `r.rate` — kur değeri (TRY karşılığı)
  - `r.effectiveDate` — kurun geçerlilik tarihi
- **Dönüş**: JSX (React.FC<CostRefreshModalProps>), Radix Dialog içeren modal UI

---

## NODE ID STANDARD

  file: src\components\admin\pricing\CostRefreshModal.tsx
  function: src\components\admin\pricing\CostRefreshModal.tsx::CostRefreshModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: CostRefreshModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/60`, `bg-surface-deep`, `bg-white/2`, `border-b`, `border-t`, `border-white/10`, `border-white/5`, `hover:bg-white/10`, `hover:bg-white/5`, `hover:text-white`, `last:border-0`, `text-amber-400`, `text-cyan-400`, `text-lg`, `text-rose-400`
- **Layout:** `backdrop-blur-sm`, `fixed`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-2`, `h-10`, `h-9`, `inline-flex`, `items-center`, `justify-between`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `last:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminButtonPrimaryClass`, `${adminModalScrollAreaClass`, `-translate-x-1/2`, `-translate-y-1/2`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-40`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/40`, `font-black`, `font-bold`, `glass`, `inset-0`, `last:pb-0`