---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\pricing\MaterializePricesModal.tsx
skeleton_hash: 4d94a8781a959b7b
entity_hashes:
  func:MaterializePricesModal: a9f17a6079aab68c
  func:segmentLabel: 86ac48424a89d196
  overview: 6b9b41040cb03897
  style_tokens: cead584dfbc0b2e2
generated_at: 2026-08-27T08:13:51Z
---

## Genel Bakış
Bu modül, fiyatlandırma yönetim arayüzünde fiyatları "nesneleştirmek" (materialize) amacıyla kullanılan bir modal bileşeni içerir. Kullanıcı türüne göre segment etiketlerini dinamik olarak oluşturarak modal içeriğini özelleştirir. Modalın açılıp kapanması ile başarı durumunda üst bileşene geri bildirim gönderilmesini yönetir.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Kullanıcı tipine ve çeviri fonksiyonuna bağlı olarak arayüzde gösterilecek segment etiketlerini dinamik olarak üretir. Bilinen bir segment için çevrilmiş metni, aksi halde orijinal kullanıcı tipi değerini döndürür.
- segmentLabel

### Bileşenler
Ana modal bileşenini ve içindeki temel mantığı tanımlar. Modalın açma/kapama durumunu, başarı durumunda çağrılacak geri bildirim fonksiyonunu ve modal içindeki olası form/aksiyon akışını yönetir.
- MaterializePricesModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan ve sabit tanımlarından çıkarım yapılabilir.

[Aksiyom 1]: Eğer `userType` parametresi verilmezse, `segmentLabel` fonksiyonu uygun bir segment etiketi üretemez.

[Aksiyom 2]: Eğer `t` çeviri fonksiyonu verilmezse, `segmentLabel` uluslararasılaştırma anahtarlarını çözümleyemez ve etiket metni gösterilemez.

[Aksiyom 3]: Eğer `SEGMENT_I18N_KEYS` sabiti tanımlı değilse, `segmentLabel` fonksiyonu kullanıcı türüne karşılık gelen i18n anahtarını bulamaz.

[Aksiyom 4]: Eğer `open` prop'u sağlanmazsa, `MaterializePricesModal` bileşeninin görünürlük durumu belirlenemez.

[Aksiyom 5]: Eğer `onClose` prop'u sağlanmazsa, modal kapatma işlemi gerçekleştirilemez.

[Aksiyom 6]: Eğer `onSuccess` prop'u sağlanmazsa, fiyat nesneleştirme işlemi başarılı olduğunda üst bileşene geri bildirim gönderilemez.

---

## FONKSİYON DETAYLARI

### segmentLabel
**Ne yapar**: Kullanıcı tipine (userType) karşılık gelen yerelleştirilmiş (i18n) segment etiketini döndürür. Eğer verilen kullanıcı tipi için önceden tanımlanmış bir çeviri anahtarı mevcutsa, o anahtarın çevirisini üretir; aksi takdirde ham kullanıcı tipi değerini olduğu gibi geri verir.

**Nasıl yapar**: Fonksiyon, önceden tanımlı `SEGMENT_I18N_KEYS` adlı bir eşleme nesnesinde (map/dictionary) verilen `userType` parametresini arar. Bu eşleme, kullanıcı tiplerini uluslararasılaştırma (i18n) anahtarlarına dönüştürür. Bulunan anahtar varsa, `t` fonksiyonu aracılığıyla `admin.pricing.common.segment.${key}` yolundaki çeviri metni çekilir ve döndürür. Eğer eşlemede karşılık gelen bir anahtar bulunamazsa (truthy değilse), `userType` değeri doğrudan, herhangi bir çeviri işlemi uygulanmadan döndürülür. Bu sayede bilinmeyen veya tanımsız kullanıcı tipleri için bile anlamlı bir çıktı elde edilir.

**Parametreler**:
- `userType`: `string` — Segment etiketi istenen kullanıcının tipini belirten dize değeridir (örneğin "bireysel", "kurumsal" gibi). Bu değer `SEGMENT_I18N_KEYS` eşleme nesnesinde aranır.
- `t`: `(key: string) => string` — Uluslararasılaştırma (i18n) sisteminin çeviri fonksiyonudur. Verilen anahtar dizesine karşılık gelen yerelleştirilmiş metni döndürmesi beklenir.

**Dönüş**: `string` — Kullanıcı tipine karşılık gelen yerelleştirilmiş segment etiketi dizesi ya da eşleme bulunamadığında ham `userType` değerinin kendisi.

### MaterializePricesModal
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminButtonPrimaryClass
- import: ../../../utils/adminUi::adminModalScrollAreaClass
- import: @/hooks/useRole::useRole
- import: @/i18n/I18nProvider::useI18n
- import: @/i18n/format::formatCurrency
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

### MaterializePricesModalProps
- `open: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

---

## SABİTLER
- **SEGMENT_I18N_KEYS** (object) — `{
  individual: 'individual',
  dealer: 'dealer',
  corporate: 'corporate'...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::segmentLabel
- **params**: `userType` — segment kullanıcı tipi anahtarı, `t` — i18n çeviri fonksiyonu
- **ic_degiskenler**:
  - `key` — `SEGMENT_I18N_KEYS[userType]` ile elde edilen i18n anahtarı; bulunamazsa `userType` doğrudan döner
- **Dönüş**: `string` — çevrilmiş segment etiketi veya ham `userType`

### [N2_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::MaterializePricesModal
- **params**: `open` — modal açık/kapalı durumu, `onClose` — kapatma callback'i, `onSuccess` — başarılı uygulama sonrası callback'i
- **ic_degiskenler**:
  - `alive` — bileşen mount durumunu takip eden boolean; cleanup'ta `false` yapılır, async işlemlerden önce kontrol edilir
  - `previewLoading` — önizleme yükleniyor durumu; `setPreviewLoading(true/false)` ile yönetilir
  - `loadFailed` — yükleme hatası durumu; `setLoadFailed(true/false)` ile yönetilir
  - `preview` — `materializePrices` dry-run sonucu; `setPreview(summary)` ile atanır, hata durumunda `null` yapılır
  - `staleCosts` — `refreshCostInBase` dry-run sonucundaki güncellenen maliyet sayısı; `costCheck.updated` değeri veya `null`/`0`
  - `applying` — uygulama işlemi devam durumu; `setApplying(true/false)` ile yönetilir
  - `cancelPreviewRef` — `useRef` ile tutulan iptal fonksiyonu referansı; `loadPreview()` dönüş cleanup fonksiyonunu saklar
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu
  - `locale` — `useI18n()` hook'undan gelen locale değeri
  - `hasWriteAccess` — `useRole()` hook'undan gelen yazma yetkisi boolean'ı
  - `supabase` — `supabaseBrowserClient` import'u; `materializePrices` ve `refreshCostInBase` çağrılarında birinci argüman olarak kullanılır
  - `summary` — `materializePrices(supabase, { dryRun: true })` sonucu; destructuring ile alınır
  - `costCheck` — `refreshCostInBase(supabase, { dryRun: true }).catch(() => null)` sonucu; hata durumunda `null`
  - `result` — `mutateWithAudit` dönüşü; `result.rowsUpserted` toast mesajında kullanılır
  - `e` — catch bloğundaki hata; `AdminPermissionError` instance kontrolü yapılır
  - `seg` — JSX `.map()` callback parametresi; `seg.priceListId`, `seg.userType`, `seg.priced`, `seg.quoteOnly` alanlarına erişilir
  - `row` — JSX `.map()` callback parametresi; `row.sku`, `row.ruleId`, `row.name`, `row.userType`, `row.net`, `row.gross` alanlarına erişilir
- **Dönüş**: `JSX.Element` — Radix Dialog yapısı içinde önizleme ve uygulama arayüzü

### [N3_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::loadPreview (useEffect cleanup-returning async)
- **params**: yok
- **ic_degiskenler**:
  - `alive` — bileşen yaşam döngüsü flag'i; cleanup'ta `false` yapılır
  - `summary` — `materializePrices(supabase, { dryRun: true })` sonucu; `setPreview(summary)` ile state'e yazılır
  - `costCheck` — `refreshCostInBase(supabase, { dryRun: true }).catch(() => null)` sonucu; `costCheck ? costCheck.updated : null` ile `setStaleCosts`'a yazılır
- **Dönüş**: `() => void` — cleanup fonksiyonu (`alive = false`)

### [N4_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::startPreview
- **params**: yok
- **ic_degiskenler**:
  - `cancelPreviewRef.current` — önceki yükleme iptal fonksiyonu; çağrılır, ardından `loadPreview()` yeni değer olarak atanır
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::handleClose
- **params**: yok
- **ic_degiskenler**:
  - `applying` — uygulama devam durumu; `true` ise kapatma engellenir
- **Dönüş**: yok; `onClose()` çağrısı yapar

### [N6_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::handleApply
- **params**: yok
- **ic_degiskenler**:
  - `preview` — önizleme verisi; yoksa fonksiyon erken döner
  - `result` — `mutateWithAudit` dönüşü; `result.rowsUpserted` toast'ta kullanılır
  - `e` — catch bloğu hatası; `AdminPermissionError` kontrolü ile uygun hata mesajı seçilir
- **Dönüş**: yok; yan etkileri: `setApplying`, `toast.success`/`toast.error`, `onSuccess()`, `onClose()`

### [N7_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::mutateWithAudit fn callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `Promise` — `materializePrices(supabase, { dryRun: false })` sonucu

### [N8_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::segmentListRender (seg callback)
- **params**: `seg` — segment veri objesi
- **ic_degiskenler**:
  - `seg.priceListId` — fiyat listesi kimliği; JSX key'inde kullanılır
  - `seg.userType` — kullanıcı tipi; `segmentLabel(seg.userType, t)` ile etiketlenir, JSX key'inde kullanılır
  - `seg.priced` — fiyatlandırılmış ürün sayısı; `formatNumber(seg.priced, locale)` ile gösterilir
  - `seg.quoteOnly` — sadece teklif ürün sayısı; `formatNumber(seg.quoteOnly, locale)` ile gösterilir
- **Dönüş**: `JSX.Element` — `<li>` öğesi

### [N9_NASIL] AST Pointer: src/components/admin/pricing/MaterializePricesModal.tsx::priceRowRender (row callback)
- **params**: `row` — fiyat satırı veri objesi
- **ic_degiskenler**:
  - `row.sku` — stok kodu; JSX key'inde ve `<span>` içinde gösterilir
  - `row.ruleId` — kural kimliği; JSX key'inde kullanılır
  - `row.name` — ürün adı; `<span>` içinde gösterilir
  - `row.userType` — kullanıcı tipi; `segmentLabel(row.userType, t)` ile etiketlenir
  - `row.net` — net fiyat; `formatCurrency(row.net, locale, { currency: 'TRY' })` ile gösterilir
  - `row.gross` — brüt fiyat; `formatCurrency(row.gross, locale, { currency: 'TRY' })` ile gösterilir
- **Dönüş**: `JSX.Element` — `<li>` öğesi

---

## NODE ID STANDARD

  file: src\components\admin\pricing\MaterializePricesModal.tsx
  function: src\components\admin\pricing\MaterializePricesModal.tsx::segmentLabel
  function: src\components\admin\pricing\MaterializePricesModal.tsx::MaterializePricesModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: MaterializePricesModal
  export: segmentLabel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-bg`, `bg-admin-surface`, `bg-admin-surface-2`, `bg-admin-warning-weak`, `bg-black/60`, `border-admin-accent/30`, `border-admin-border`, `border-admin-warning/30`, `border-b`, `border-t`, `hover:bg-admin-surface-2`, `hover:bg-admin-surface-3`, `hover:text-admin-fg`, `text-admin-accent`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-2`, `h-9`, `inline-flex`, `items-center`, `items-start`, `justify-between`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminButtonPrimaryClass`, `${adminModalScrollAreaClass`, `-translate-x-1/2`, `-translate-y-1/2`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-40`, `focus-visible:ring-2`, `focus-visible:ring-admin-accent/30`, `font-bold`, `font-mono`, `font-semibold`, `inset-0`, `ml-auto`