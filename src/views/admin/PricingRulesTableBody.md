---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\views\admin\PricingRulesTableBody.tsx
skeleton_hash: 1fe3d8c902971a7f
entity_hashes:
  func:PricingRulesTableBody: 812c9bf97543d2da
  func:deriveStatus: 4a2473aac1292e82
  func:methodLabel: 5641ed46bb40bec9
  func:pricingRulesFetcher: ee3ea2c96d78ae7c
  overview: 422e93914eecac4d
  style_tokens: a7db7d920cdcbe94
generated_at: 2026-08-25T07:30:58Z
---

<!-- ORION-DONDURULMUS: gercek-sembol=4 · kaynak=f7b1ebfd · sebep=uretec-sembol-kaybi · kayit=REC-83 -->

## Genel Bakış

Bu modül, yönetim panelindeki fiyatlandırma kuralları tablosunun gövdesini oluşturan React bileşenini ve yardımcı fonksiyonlarını içerir. Supabase veritabanından fiyatlandırma kurallarını çeker, her kuralın geçerlilik durumunu hesaplar ve ödeme yöntemlerini kullanıcıya gösterilebilir etiketlere dönüştürür.

## Fonksiyon Grupları

### Veri Çekme
Supabase istemcisi üzerinden fiyatlandırma kurallarını asenkron olarak sorgular ve tablo bileşeninin tüketebileceği formatta sonuç döndürür.
- pricingRulesFetcher

### Veri Dönüştürme ve Durum Hesaplama
Ham kural verisini kullanıcı arayüzüne uygun hale getirir. Bir kuralın bugün için geçerli, geçmişte kalmış veya gelecekte başlayacak olup olmadığını belirler; ödeme yöntemlerini ise i18n desteğiyle insan tarafından okunabilir etiketlere çevirir.
- deriveStatus, methodLabel

### Bileşen
Fiyatlandırma kuralları tablosunun gövdesini render eden ana bileşendir. Üst gruplardaki fonksiyonları kullanarak veriyi çeker, durum ve etiket bilgilerini hesaplar ve satırları oluşturur.
- PricingRulesTableBody

## Bağımlılıklar

**Dış Bağımlılıklar:**
- SupabaseClient: Veritabanı bağlantısı ve sorguları için
- i18n fonksiyonu (t parametresi): Çoklu dil desteği ve etiket çevirileri için
- React: Bileşen yapısı ve yaşam döngüsü için

**İç İlişkiler:**
- PricingRulesTableBody bileşeni, veri çekmek için pricingRulesFetcher fonksiyonunu çağırır
- Tablo satırlarının durumunu belirlemek için deriveStatus kullanılır
- Ödeme yöntemi sütununda okunabilir metin göstermek için methodLabel kullanılır

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### methodLabel
**Ne yapar**: Verilen fiyatlandırma yöntemini (method) kullanıcı arayüzünde gösterilecek çevrilmiş bir etiket string'ine dönüştürür. Uluslararasılaştırma (i18n) desteği sağlar; yöntem için tanımlı bir çeviri anahtarı varsa çeviriyi döndürür, yoksa orijinal method string'ini olduğu gibi geri verir.

**Nasıl yapar**: Öncelikle `METHOD_I18N_KEYS` sözlüğünde verilen `method` parametresine karşılık gelen bir i18n anahtarı arar. Eğer bu anahtar mevcutsa, `t` fonksiyonu aracılığıyla `admin.pricing.common.method.${key}` yolundaki çeviri metni çözümlenir ve döndürülür. Anahtar bulunamazsa, ham `method` değeri aynen döndürülür.

**Parametreler**:
- method: string — Fiyatlandırma yöntemini temsil eden kod adı (örneğin `'cost_plus'`, `'fixed'` gibi değerler).
- t: (key: string) => string — Uluslararasılaştırma fonksiyonu; verilen çeviri anahtarına karşılık gelen yerelleştirilmiş metni döndürür.

**Dönüş**: string — Yöntemin çevrilmiş etiketi ya da çeviri bulunamadığında orijinal `method` değeri.

### deriveStatus
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### pricingRulesFetcher
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### PricingRulesTableBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AccessDenied::AccessDenied
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/AdminToolbar::AdminToolbar
- import: ../../components/admin/ExportMenu::ExportMenu
- import: ../../components/admin/data-table/BulkBar::BulkBar
- import: ../../components/admin/data-table/BulkBar::type BulkAction
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/FacetedFilter::FacetedFilter
- import: ../../components/admin/data-table/types::type { AdminColumn, DataTableFacet }
- import: ../../components/admin/overlay/ConfirmProvider::useConfirm
- import: ../../components/admin/pricing/CostRefreshModal::CostRefreshModal
- import: ../../components/admin/pricing/MaterializePricesModal::MaterializePricesModal
- import: ../../components/admin/pricing/PricingRuleFormModal::PricingRuleFormModal
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDate
- import: ../../i18n/format::formatCurrency
- import: ../../i18n/format::formatNumber
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: ../../lib/services/pricing.service::type { PricingRuleRow }
- import: ../../types/database.types::type { Database }
- import: @/lib/admin/mutateWithAudit::AdminPermissionError
- import: @/lib/admin/mutateWithAudit::mutateWithAudit
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::Coins
- import: lucide-react::Percent
- import: lucide-react::Plus
- import: lucide-react::RefreshCw
- import: lucide-react::SearchX
- import: next/link::Link
- import: next::type { Route }
- import: react::React
- import: react::useCallback
- import: react::useMemo
- import: react::useState
- import: sonner::toast

---

## INTERFACES

### RuleRow
- `id: string`
- `scope: number`
- `scopeKey: ScopeKey`
- `targetName: string`
- `method: string`
- `supported: boolean`
- `marginPct: number | null`
- `fixedPrice: number | null`
- `vatInclusive: boolean`
- `priority: number`
- `validFrom: string | null`
- `validTo: string | null`
- `status: RuleStatus`
- `productId: string | null`
- `raw: PricingRuleRow`

---

## TYPE ALIASES

### ScopeKey
Marj kuralları tablosu (W3-T2). Kural = fiyatın SSOT'u: burada yapılan her değişiklik vitrin fiyatını türetir. Bu yüzden tablo "hangi kural neyi kapsıyor + hangi oranla" sorusunu tek bakışta cevaplar; kanonik `margin_pct` yanında katsayı karşılığı (×1,40) da gösterilir — saha dili katsayıdır, veri d
```typescript
type ScopeKey = 'variant' | 'product' | 'brand' | 'category' | 'global'
```

### RuleStatus
```typescript
type RuleStatus = 'active' | 'scheduled' | 'expired'
```

---

## SABİTLER
- **SCOPE_KEYS** (object) — `{
  0: 'variant',
  1: 'product',
  2: 'brand',
  3: 'category',
  4: 'g...`
- **METHOD_I18N_KEYS** (object) — `{
  cost_plus: 'costPlus',
  fixed: 'fixed',
  percent_off_list: 'percentO...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: PricingRulesTableBody.tsx::methodLabel
- **params**: `method` (string) — fiyatlandırma yöntemi anahtarı, `t` ((key: string) => string) — çeviri fonksiyonu
- **ic_degiskenler**:
  - `key` — `METHOD_I18N_KEYS[method]` ile elde edilen i18n çeviri anahtarı; tanımlı değilse undefined olur
- **Dönüş**: string — `key` varsa `t('admin.pricing.common.method.${key}')` sonucu, yoksa ham `method` değeri

---

### [N2_NASIL] AST Pointer: PricingRulesTableBody.tsx::deriveStatus
- **params**: `rule` (PricingRuleRow) — fiyat kuralı satırı, `today` (string) — YYYY-MMAA-DD formatında günün tarihi
- **ic_degiskenler**: yok
- **Dönüş**: RuleStatus — `rule.valid_to` null değil ve `today`'den küçükse `'expired'`; `rule.valid_from` null değil ve `today`'den büyükse `'scheduled'`; aksi halde `'active'`

---

### [N3_NASIL] AST Pointer: PricingRulesTableBody.tsx::pricingRulesFetcher
- **params**: `supabase` (SupabaseClient<Database>) — Supabase istemcisi, `_params` (FetchParams) — kullanılmayan sayfalama/arama parametreleri
- **ic_degiskenler**:
  - `rules` — `listPricingRules(supabase)` ile çekilen ham fiyat kuralı dizisi
  - `brands` — `supabase.from('brands').select('id, name')` sorgusundan dönen `data` alanı; marka listesi
  - `categories` — `supabase.from('categories').select('id, name')` sorgusundan dönen `data` alanı; kategori listesi
  - `productIds` — `rules` dizisindeki `product_id` alanlarından null olmayan benzersiz değerlerin Set'ten diziye dönüştürülmüş hali
  - `products` — `productIds` boş değilse `supabase.from('products').select('id, name, sku').in('id', productIds)` sorgusunun `data`'sı, boşsa boş dizi
  - `brandName` — `brands` dizisinden `[b.id, b.name]` çiftleriyle oluşturulan Map; marka ID → marka adı eşlemesi
  - `categoryName` — `categories` dizisinden `[c.id, c.name]` çiftleriyle oluşturulan Map; kategori ID → kategori adı eşlemesi
  - `productName` — `products` dizisinden `[p.id, '${p.name} (${p.sku})']` çiftleriyle oluşturulan Map; ürün ID → "ürün adı (SKU)" eşlemesi
  - `today` — `new Date().toISOString().slice(0, 10)` ile elde edilen YYYY-MM-DD formatındaki günün tarihi
  - `rows` — `rules.map((rule) => { ... })` ile her kuraldan türetilen RuleRow dizisi; her satırda `scopeKey` (SCOPE_KEYS[rule.scope] ?? 'global'), `targetName` (scope'a göre brandName/categoryName/productName'den çekilen hedef ad), `method`, `supported` (method 'cost_plus' veya 'fixed' ise true), `marginPct` (rule.margin_pct), `fixedPrice` (rule.fixed_price), `vatInclusive` (rule.price_is_vat_inclusive), `priority`, `validFrom` (rule.valid_from), `validTo` (rule.valid_to), `status` (deriveStatus(rule, today) sonucu), `productId` (rule.product_id), `raw` (ham rule nesnesi) alanları bulunur
- **Dönüş**: Promise<FetchResult<RuleRow>> — `{ rows, totalMatched: rows.length }` nesnesi

---

### [N4_NASIL] AST Pointer: PricingRulesTableBody.tsx::PricingRulesTableBody
- **params**: yok
- **ic_degiskenler**:
  - `scopeCount` — Map<string, number>; `table.allRows` üzerinde döngüyle her satırın `scopeKey`'ine göre sayaç tutar
  - `methodCount` — Map<string, number>; `table.allRows` üzerinde döngüyle her satırın `method`'una göre sayaç tutar
  - `statusCount` — Map<string, number>; `table.allRows` üzerinde döngüyle her satırın `status`'una göre sayaç tutar
  - `scopeOptions` — ScopeKey[] sabiti: `['variant', 'product', 'brand', 'category', 'global']`
  - `methodOptions` — string[] sabiti: `['cost_plus', 'fixed', 'percent_off_list']`
  - `statusOptions` — RuleStatus[] sabiti: `['active', 'scheduled', 'expired']`
  - `openCreate` — useCallback; `setEditing(null)` ve `setModalOpen(true)` çağırarak yeni kural oluşturma modalını açar
  - `openEdit` — useCallback; parametre olarak `row` (RuleRow) alır, `setEditing(row.raw)` ve `setModalOpen(true)` çağırarak düzenleme modalını açar
  - `removeRule` — useCallback(async); parametre olarak `row` (RuleRow) alır; `confirm()` ile silme onayı ister, onaylanırsa `mutateWithAudit(supabaseBrowserClient, ...)` ile `deletePricingRule(supabaseBrowserClient, row.id)` çağırır, başarılıysa `toast.success` ve `table.reload()`, hata olursa `AdminPermissionError` kontrolüyle `toast.error` gösterir
  - `bulkDelete` — useCallback(async); `table.selection.selectedIds`'i alır, boşsa döner; `confirm()` ile toplu silme onayı ister, onaylanırsa `mutateWithAudit(supabaseBrowserClient, ...)` ile `deletePricingRules(supabaseBrowserClient, ids)` çağırır, başarılıysa `table.selection.clear()`, `toast.success` ve `table.reload()`, hata olursa `toast.error` gösterir
  - `columns` — useCallback; tablo sütun tanımlarını döndüren fonksiyon; her sütun için `key`, `header`, `sortable`, `align`, `hideable`, `cell` özellikleri tanımlar; `cell` render fonksiyonları `methodLabel`, `formatNumber`, `marginPctToCoefficient`, `formatCurrency`, `formatDate` yardımcılarını ve `t` çeviri fonksiyonunu kullanır
  - `facets` — useCallback; filtre facet tanımlarını döndüren fonksiyon; `scopeKey`, `method`, `status` için facet nesneleri oluşturur, her birinde `options` dizisi (value, label, count) bulunur
  - `bulkActions` — useCallback; toplu işlem tanımlarını döndüren fonksiyon; `delete` anahtarıyla `bulkDelete`'i çağıran `onRun`'lı bir nesne döndürür
  - `exportToCsv` — useCallback(async); `table.fetchAllForExport()` ile tüm satırları çeker, CSV sütun başlıkları (`id`, `scope`, `target`, `method`, `margin_pct`, `fixed_price`, `priority`, `valid_from`, `valid_to`) ve satır verilerini oluşturur, BOM ekleyerek Blob oluşturur, `URL.createObjectURL` ile indirme bağlantısı yaratır, `<a>` elementiyle `pricing-rules.csv` dosyasını indirir, ardından URL'yi temizler
- **Dönüş**: React.FC — fiyatlandırma kuralları tablosu bileşeni

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    PricingRulesTableBody_tsx__PricingRulesTableBody["PricingRulesTableBody"]
    PricingRulesTableBody_tsx__deriveStatus["deriveStatus"]
    PricingRulesTableBody_tsx__methodLabel["methodLabel"]
    PricingRulesTableBody_tsx__pricingRulesFetcher["pricingRulesFetcher"]
    PricingRulesTableBody_tsx__pricingRulesFetcher --> PricingRulesTableBody_tsx__deriveStatus
    PricingRulesTableBody_tsx__PricingRulesTableBody --> PricingRulesTableBody_tsx__methodLabel
```

## NODE ID STANDARD

  file: PricingRulesTableBody.tsx
  function: PricingRulesTableBody.tsx::methodLabel
  function: PricingRulesTableBody.tsx::deriveStatus
  function: PricingRulesTableBody.tsx::pricingRulesFetcher
  function: PricingRulesTableBody.tsx::PricingRulesTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: PricingRulesTableBody
  export: deriveStatus
  export: methodLabel
  export: pricingRulesFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-success-weak`, `bg-admin-surface-3`, `bg-admin-warning-weak`, `border-admin-accent/30`, `border-admin-border`, `border-admin-success/30`, `border-admin-warning/30`, `text-admin-accent`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-fg-subtle`, `text-admin-success`, `text-admin-warning`, `text-sm`
- **Layout:** `flex`, `flex-col`, `flex-wrap`, `gap-0.5`, `gap-1`, `gap-2`, `inline-flex`, `items-center`, `items-end`, `justify-end`, `w-fit`
- **Varyant/Responsive:** `:`, `disabled:` önekleri
- **Yardımcı Sınıflar:** `$`, `${adminTableActionClass`, `${adminTableActionDangerClass`, `:`, `===`, `active`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-40`, `expired`, `font-bold`, `font-semibold`, `opacity-50`, `px-2`, `px-2.5`