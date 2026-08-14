---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\pricing\MaterializePricesModal.tsx
skeleton_hash: 94367fbb069166ae
entity_hashes:
  func:MaterializePricesModal: a9f17a6079aab68c
  func:segmentLabel: 4ca4ae3bc0bc7b4f
  overview: 1c693ac72f8cfeb1
  style_tokens: 2b5b8b8bb44e326b
generated_at: 2026-08-14T22:24:48Z
---

## Genel Bakış
Bu modül, bir fiyatlandırma yönetim arayüzünde fiyatları "nesneleştirmek" (materialize) için kullanılan bir modal (dialog) bileşenidir. Kullanıcı türüne göre segment etiketlerini dinamik olarak oluşturarak modal içindeki içeriği özelleştirir, modalın açılıp kapanmasını ve başarı durumunda üst bileşene geri bildirim gönderilmesini yönetir.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar
Kullanıcı türüne ve çeviri fonksiyonuna bağlı olarak arayüzde gösterilecek segment etiketlerini dinamik olarak üretir.
- segmentLabel

### Bileşenler
Ana modal bileşenini ve içindeki temel mantığı tanımlar. Modalın açma/kapama durumunu, başarı durumunda çağrılacak geri bildirim fonksiyonunu ve modal içindeki olası form/aksiyon akışını yönetir.
- MaterializePricesModal

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### segmentLabel
**Ne yapar**: Kullanıcı tipine karşılık gelen segment etiketini uluslararasılaştırma (i18n) anahtarı üzerinden çevirerek döndüren yardımcı fonksiyondur. Kullanıcı tipi bilinen bir segment ise çevrilmiş metni, aksi halde orijinal userType değerini olduğu gibi döndürür.

**Nasıl yapar**: Fonksiyon, tanımlı bir `SEGMENT_I18N_KEYS` haritasını kullanarak verilen `userType` değerinin i18n anahtar eşlemesini bulur. Bulunan anahtar `t()` fonksiyonuna `admin.pricing.common.segment.{key}` formatında bir çeviri yolu olarak geçirilir. Eğer userType haritada eşleşmiyorsa, çeviri yapılmadan ham userType değeri doğrudan döndürülür.

**Parametreler**:
- `userType`: `string` — Segment/kullanıcı tipini belirten string değeri. Bu değer, `SEGMENT_I18N_KEYS` haritasında bir karşılık bulabilir veya bulunmayabilir.
- `t`: `(key: string) => string` —Uluslararasılaştırma fonksiyonu. Verilen i18n anahtarı için çevrilmiş metni döndüren bir callback'tir. Genellikle useTranslation veya benzeri bir hook'tan elde edilir.

**Dönüş**: `string` — Çevrilmiş segment etiket metni veya bilinmeyen bir userType durumunda ham userType değeri.

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
  corporate: 'corporate',
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: MaterializePricesModal.tsx::segmentLabel
- **params**: `(userType: string, t: (key: string) => string)`
- **ic_degiskenler**:
  - `key` — `SEGMENT_I18N_KEYS[userType]` dictionary erişimiyle elde edilen i18n anahtarı; userType'a karşılık gelen çeviri anahtarını tutar
- **Dönüş**: `string` — i18n key mevcutsa `t('admin.pricing.common.segment.${key}')` çağrısının sonucu, değilse ham `userType` değeri

---

### [N2_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal
- **params**: `({ open, onClose, onSuccess })`
- **ic_degiskenler**:
  - `open` — props'tan gelen modalın açık/kapalı durumu; true olduğunda preview yüklemeye başlanır
  - `onClose` — props'tan gelen modal kapatma callback'i
  - `onSuccess` — props'tan gelen başarılı uygulama sonrası bildirim callback'i
  - `previewLoading` / `setPreviewLoading` — useState: fiyat önizleme verisinin yüklenme durumunu tutar
  - `loadFailed` / `setLoadFailed` — useState: önizleme yükleme işleminin başarısız olup olmadığını tutar
  - `preview` / `setPreview` — useState: `materializePrices` dry-run sonucu olan fiyat önizleme özeti nesnesi
  - `staleCosts` / `setStaleCosts` — useState: `refreshCostInBase` sonucundan gelen eski(mükerrer) maliyet sayısı
  - `applying` / `setApplying` — useState: fiyatların gerçekten uygulanma (mutate) işleminin devam edip etmediğini tutar
  - `cancelPreviewRef` — useRef: `loadPreview`'in döndürdüğü cleanup fonksiyonunu saklar; preview iptal edilmek istendiğinde çağrılır
  - `hasWriteAccess` — `useRole` hook'undan gelen; `mutateWithAudit`'e `canWrite` olarak iletilen boolean yetki bayrağı
  - `t` — `useI18n` hook'undan gelen çeviri fonksiyonu
  - `locale` — `useI18n` hook'undan gelen yerel ayar (number/currency formatlama için)
  - `startPreview` — inner: `cancelPreviewRef`'i temizleyip yeni `loadPreview()` çağırarak preview'i yeniden başlatır
  - `handleCancel` — inner: `applying` true değilse `onClose()` çağırarak modalı kapatır
  - `handleApply` — inner async: `preview` varsa `mutateWithAudit` ile fiyatları gerçekten uygular, toast bildirimi yapar
- **Dönüş**: JSX (React.FC) — modal dialog JSX'i, preview yükleme/hata durumlarını ve uygulama akışını render eder

---

### [N3_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → loadPreview (effect IIFE)
- **params**: yok (arrow fonksiyon)
- **ic_degiskenler**:
  - `alive` — boolean flag: cleanup çalıştırıldığında false yapılır; async işlemin devam edip state güncellemesini engeller
  - `summary` — `Promise.all`[0] sonucu: `materializePrices(supabase, { dryRun: true })` çağrısından dönen fiyat önizleme özeti
  - `costCheck` — `Promise.all`[1] sonucu: `refreshCostInBase(supabase, { dryRun: true }).catch(() => null)` çağrısından dönen m bayatlığı kontrol nesnesi; başarısız olursa `null`
  - `costCheck.updated` — costCheck null değilse içindeki eski maliyet sayısını tutan alan; `setStaleCosts`'e iletilir
- **Dönüş**: cleanup fonksiyonu `() => { alive = false }` — useEffect cleanup'ta çağrılarak askerda kalan async güncellemeleri engeller

---

### [N4_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → useEffect (open watcher)
- **params**: yok (arrow fonksiyon, useEffect callback)
- **ic_degiskenler**:
  - `open` — modalın açık/kapalı durumu; false ise fonksiyon hemen return eder, true ise preview yükleme akışı başlatılır
- **Dönüş**: cleanup fonksiyonu — `cancelPreviewRef.current?.()` ve `cancelPreviewRef.current = null` yaparak devam eden preview isteğini iptal eder

---

### [N5_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → startPreview
- **params**: yok (arrow fonksiyon)
- **ic_degiskenler**:
  - `cancelPreviewRef` — useRef: mevcut preview promise'inin cleanup fonksiyonunu saklar; önce `cancelPreviewRef.current?.()` ile iptal edilir, ardından yeni `loadPreview()` sonucu tekrar ref'e yazılır
- **Dönüş**: yok

---

### [N6_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → handleCancel
- **params**: yok (arrow fonksiyon)
- **ic_degiskenler**:
  - `applying` — boolean: fiyat uygulama işlemi devam ediyorsa true; true ise fonksiyon hemen return eder, false ise `onClose()` çağrılır
- **Dönüş**: yok — yan etki: `onClose()` callback'ini çağırarak modalı kapatır

---

### [N7_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → handleApply
- **params**: yok (async arrow fonksiyon)
- **ic_degiskenler**:
  - `preview` — mevcut fiyat önizleme özeti; null ise fonksiyon hemen return eder
  - `result` — `mutateWithAudit` çağrısının dönüş değeri; `result.rowsUpserted` alanı toast mesajında kullanılır
  - `e` — catch bloğu yakaladığı hata nesnesi; `AdminPermissionError` instance kontrolü yapılır
  - `preview` (before) — `mutateWithAudit` options.before alanına `{ ...preview }` spread ile iletilir
  - `result` (afterFrom) — `mutateWithAudit` afterFrom callback'inde `(result) => ({ ...result })` ile gerçekleşme sonucu dinamik olarak hesaplanır
- **Dönüş**: yok — yan etkiler: `mutateWithAudit` ile `product_prices` tablosuna yazar, `toast.success`/`toast.error` gösterir, `onSuccess()` ve `onClose()` çağırır

---

### [N8_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → mutateWithAudit fn callback
- **params**: yok (async arrow fonksiyon, `mutateWithAudit` options.fn içinde)
- **ic_degiskenler**: yok
- **Dönüş**: `materializePrices(supabase, { dryRun: false })` çağrısının dönüş değeri — `Promise<{ rowsUpserted: number }>` (mutateWithAudit sonucunu döndürür)

---

### [N9_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → seg renderer
- **params**: `(seg)` — segment nesnesi (map callback)
- **ic_degiskenler**:
  - `seg.priceListId` — segmentin fiyat listesi ID'si; key oluşturmak için kullanılır (`${seg.priceListId}:${seg.userType}`)
  - `seg.userType` — segmentin kullanıcı tipi; `segmentLabel(seg.userType, t)` çağrısına parametre olarak iletilir
  - `seg.priced` — fiyat uygulanmış kalem sayısı; `formatNumber(seg.priced, locale)` ile formatlanır
  - `seg.quoteOnly` — sadece teklif olan kalem sayısı; `formatNumber(seg.quoteOnly, locale)` ile formatlanır
- **Dönüş**: JSX `<li>` — segment bilgilerini gösteren liste öğesi

---

### [N10_NASIL] AST Pointer: MaterializePricesModal.tsx::MaterializePricesModal → row renderer
- **params**: `(row)` —_satır nesnesi (map callback)
- **ic_degiskenler**:
  - `row.sku` — ürün SKU kodu; hem key (`${row.sku}:${row.ruleId}`) hem degoruntüleme için kullanılır
  - `row.ruleId` — fiyat kuralı ID'si; key oluşturmak için kullanılır
  - `row.name` — ürün adı; `truncate` class'ı ile gösterilir
  - `row.userType` — kullanıcı tipi; `segmentLabel(row.userType, t)` çağrısına parametre olarak iletilir
  - `row.net` — net fiyat; `formatCurrency(row.net, locale, { currency: 'TRY' })` ile formatlanır
  - `row.gross` — brüt fiyat; `formatCurrency(row.gross, locale, { currency: 'TRY' })` ile formatlanır
- **Dönüş**: JSX `<li>` — satır ürün bilgilerini (ad, sku, segment, net→gross fiyat) gösteren liste öğesi

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
- **Renkler:** `bg-amber-400/10`, `bg-black/60`, `bg-cyan-500/10`, `bg-surface-deep`, `bg-white/2`, `bg-white/3`, `bg-white/5`, `border-amber-400/30`, `border-b`, `border-cyan-500/20`, `border-t`, `border-white/10`, `border-white/5`, `hover:bg-white/10`, `hover:bg-white/5`
- **Layout:** `backdrop-blur-sm`, `fixed`, `flex`, `flex-1`, `flex-col`, `flex-wrap`, `gap-2`, `gap-3`, `gap-4`, `grid`, `grid-cols-2`, `h-9`, `inline-flex`, `items-center`, `items-start`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminButtonPrimaryClass`, `${adminModalScrollAreaClass`, `-translate-x-1/2`, `-translate-y-1/2`, `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-40`, `focus-visible:ring-2`, `focus-visible:ring-cyan-400/40`, `font-black`, `font-bold`, `font-mono`, `glass`, `inset-0`