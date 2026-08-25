---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\lib\services\pricingAdmin.service.ts
skeleton_hash: 8ac5cab7bd200c1c
entity_hashes:
  func:ScopeFilterableQuery:eq: b0d4a7d1d095dcbd
  func:activeProductsQuery: 8b70307de3dcf767
  func:brandNameById: 257e1a32aea3906c
  func:categoryIdsWithDescendants: 242a635b5c7fa466
  func:coefficientToMarginPct: 3f32b97c3198a2da
  func:countProductsInScope: a1838271ad4fab0f
  func:createPricingRule: 949918a25d15ea17
  func:deletePricingRule: 313310a598f7445b
  func:deletePricingRules: 14cee9d782a3ce92
  func:distinctPurchaseCurrenciesInScope: 23d97df3afca6249
  func:listPricingRules: 30ef9ef5c0a10bdb
  func:loadBrandIdByName: a28b2b8a1c198edc
  func:marginPctToCoefficient: cdf1ad6eff43c2ec
  func:resolveScopeFilter: 13422f05acbddf2f
  func:sampleProductsInScope: 5907dabf4500b02e
  func:toPricingProductInput: d38e577c142cfed8
  func:updatePricingRule: 5601b347117ac443
  func:withScopeFilter: 2b3e8009205fb17a
  overview: f4cde8561230f2aa
generated_at: 2026-08-25T07:28:49Z
---

## Genel Bakış
Bu modül, fiyatlandırma kurallarının (pricing rules) oluşturulması, güncellenmesi, listelenmesi ve silinmesi gibi temel CRUD işlemlerini yönetir. Ayrıca kuralların hangi ürün kapsamına (scope) uygulanacağını belirleyen filtreleme ve sorgulama altyapısını sağlar. Modül, kapsam bazlı ürün sayımı, örnek ürün getirme ve para birimi çözümleme gibi destekleyici sorguları da içerir.

## Fonksiyon Grupları

### Fiyatlandırma Kuralı CRUD İşlemleri
Fiyatlandırma kurallarının yaşam döngüsünü yönetir: listeleme, oluşturma, güncelleme ve tekli/çoklu silme işlemlerini gerçekleştirir.
- listPricingRules, createPricingRule, updatePricingRule, deletePricingRule, deletePricingRules

### Kapsam (Scope) Çözümleme ve Filtreleme
Bir fiyatlandırma kuralının hangi ürünler üzerinde geçerli olacağını belirleyen kapsam bilgisini çözer ve sorgulara uygulanabilir filtrelere dönüştürür. Kategori bazlı kapsamlarda alt kategorileri de dahil eder.
- resolveScopeFilter, withScopeFilter, categoryIdsWithDescendants

### Kapsam Bazlı Ürün Sorguları
Belirli bir kapsam içindeki ürünleri sayar, örnekler ve satın alma para birimlerini listeler. Bu fonksiyonlar kapsam çözümleme ve filtreleme fonksiyonlarını kullanarak çalışır.
- activeProductsQuery, countProductsInScope, sampleProductsInScope, distinctPurchaseCurrenciesInScope

### Marka (Brand) Yardımcıları
Marka adı ile marka ID'si arasında dönüşüm sağlar. Ürün kapsamından fiyatlandırma girdisi üretirken marka bilgisinin çözümlenmesinde kullanılır.
- loadBrandIdByName, brandNameById

### Veri Dönüşüm ve Matematik Yardımcıları
Ham ürün kapsamı verisini fiyatlandırma ürününe dönüştürür ve marj yüzdesi ile katsayı arasında çift yönlü dönüşüm sağlar.
- toPricingProductInput, marginPctToCoefficient, coefficientToMarginPct

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `SupabaseClient<Database>` nesnesi sağlanmazsa, hiçbir async fonksiyon (`listPricingRules`, `createPricingRule`, `updatePricingRule`, `deletePricingRule`, `deletePricingRules`, `loadBrandIdByName`, `brandNameById`, `categoryIdsWithDescendants`, `resolveScopeFilter`, `countProductsInScope`, `sampleProductsInScope`, `distinctPurchaseCurrenciesInScope

---

## FONKSİYON DETAYLARI

### listPricingRules
**Ne yapar**: Fiyatlandırma kurallarını merdiven sırasıyla listeler. Sıralama kuralı olarak `scope` alanını artan (ASC), `priority` alanını azalan (DESC) olacak şekilde sıralar. RLS (Row Level Security) nedeniyle yetkisiz kullanıcı hata almaz, boş liste görür; bu nedenle çağıran tarafın rol kontrolünü ayrıca uygulaması gerekir.

**Nasıl yapar**: Supabase istemcisi üzerinden `pricing_rule` tablosundan tüm sütunları (`*`) seçer. İki katmanlı sıralama uygular: önce `scope` artan, ardından `priority` azalan. Sonuç sayısı `PRICING_RULE_LIST_LIMIT` sabiti ile sınırlandırılır. Sorgu hatası fırlatılır, veri yoksa boş dizi döner.

**Parametreler**:
- supabase: SupabaseClient\<Database\> — Veritabanı bağlantısını sağlayan Supabase istemcisi

**Dönüş**: Promise\<PricingRuleRow\[\]\> — Fiyatlandırma kuralı satırlarından oluşan dizi. Veri bulunamazsa boş dizi döner.

### createPricingRule
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### updatePricingRule
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### deletePricingRule
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### deletePricingRules
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### loadBrandIdByName
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### toPricingProductInput
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### brandNameById
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### categoryIdsWithDescendants
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### resolveScopeFilter
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### withScopeFilter
**Ne yapar**: Çözülmüş kapsam filtresini bir PostgREST sorgusuna uygular. Filtrenin `empty` çağrılmadan önce elenmiş olması gerekir; aksi takdirde varsayılan dal çalışır ve sorgu filtresiz döner.

**Nasıl yapar**: `filter.kind` değerine göre `switch` ile dallanır. `'id'` durumunda sorguya `.eq('id', filter.value)` ekler; `'brand'` durumunda `.eq('brand', filter.value)` ekler; `'categories'` durumunda `.in('category_id', filter.values)` ile çoklu kategori filtresi uygular. Hiçbir case eşleşmezse sorguyu değiştirmez olarak döndürür.

**Parametreler**:
- query: Q (extends `ScopeFilterableQuery<Q>`) — Filtrenin uygulanacağı PostgREST sorgu nesnesi. Jenerik tip kısıtı sayesinde zincirleme metot çağrısına uyum sağlar.
- filter: ScopeFilter — Kapsam filtresi nesnesi. `kind` alanı `'id'`, `'brand'` veya `'categories'` değerlerinden birini alır.

**Dönüş**: Q — Filtre uygulanmış sorgu nesnesi. Aynı jenerik tip ile döner, böylece zincirleme kullanım sürdürülür.

### activeProductsQuery
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### countProductsInScope
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### sampleProductsInScope
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### distinctPurchaseCurrenciesInScope
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### marginPctToCoefficient
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### coefficientToMarginPct
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### eq
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: ./pricing.service::type { PricingProductInput, PricingRuleRow }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## INTERFACES

### ProductScopeRow
Kapsam örneklemesi için gerekli minimum ürün alanları.
- `id: string`
- `name: string`
- `sku: string`
- `brand: string`
- `category_id: string | null`
- `cost_in_base: number | null`

### ScopeFilterableQuery
- `eq(column: 'id' | 'brand', value: string): Q`

---

## TYPE ALIASES

### PricingRuleInsert
W3 · Admin marj kuralı servis katmanı (T001-VH). DI ZORUNLU (CLAUDE.md kural 2): her fonksiyonun İLK parametresi `supabase`. Modül düzeyinde statik client importu YOK — ESLint `no-restricted-imports` + AST testi zorlar. Sınır: bu dosya SADECE veri erişimi + saf çevrimler yapar. `mutateWithAudit` sar
```typescript
type PricingRuleInsert = Database['public']['Tables']['pricing_rule']['Insert']
```

### PricingRuleUpdate
```typescript
type PricingRuleUpdate = Database['public']['Tables']['pricing_rule']['Update']
```

### PricingRuleCreateInput
Yazma payload'ı: `tenant_id` TİP DÜZEYİNDE dışlanır. DB kolonu `default public.jwt_tenant_id()` taşır; panelden gönderilen tenant (yanlış/eski değer) çapraz-tenant sızıntısı riskidir (CLAUDE.md §12). Yapı > talimat: göndermeyi imkânsız kılıyoruz.
```typescript
type PricingRuleCreateInput = Omit<PricingRuleInsert, 'tenant_id'>
```

### PricingRuleUpdateInput
```typescript
type PricingRuleUpdateInput = Omit<PricingRuleUpdate, 'tenant_id' | 'id'>
```

### SampleProduct
Örnek ürün = fiyat motoru girdisi + panelde gösterilecek kimlik alanları.
```typescript
type SampleProduct = PricingProductInput & { name: string; sku: string }
```

### ScopeFilter
Kapsam çözümünün SSOT'u: `(scope, targetId)` → ürün filtresi tarifi. NİÇİN AYRI BİR ADIM: kapsam semantiği önemsiz değil — scope 2 markayı **adıyla** eşler (`products.brand` metin kolonu, FK değil), scope 3 kategori **alt-ağacını** gezer (`resolvePrice` §11 ata-cascade'iyle aynı küme). Bu mantık her
```typescript
type ScopeFilter = | { kind: 'empty' }
  | { kind: 'all' }
  | { kind: 'id'; value: string }
  | { kind: 'brand'; value: string }
  | { kind: 'categories'; values: string[] }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: pricingAdmin.service.ts::listPricingRules
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı
- **ic_degiskenler**:
  - `data` — sorgudan dönen satırlar dizisi (PricingRuleRow[])
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: `data ?? []` — PricingRuleRow[] dizisi; data null ise boş dizi döner

### [N2_NASIL] AST Pointer: pricingAdmin.service.ts::createPricingRule
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `input` — PricingRuleCreateInput tipinde, eklenecek kural verisi
- **ic_degiskenler**:
  - `data` — insert sonrası dönen tek satır (PricingRuleRow)
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: `data` — PricingRuleRow

### [N3_NASIL] AST Pointer: pricingAdmin.service.ts::updatePricingRule
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `id` — string, güncellenecek kuralın kimliği; `patch` — PricingRuleUpdateInput tipinde, güncellenecek alanlar; `updatedBy` — string | null, güncellemeyi yapan kişi
- **ic_degiskenler**:
  - `payload` — PricingRuleUpdateInput tipinde, patch alanlarını `updated_at` (ISO tarih) ve `updated_by` ile birleştirerek oluşturulan güncelleme verisi
  - `data` — güncelleme sonrası dönen tek satır (PricingRuleRow)
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: `data` — PricingRuleRow

### [N4_NASIL] AST Pointer: pricingAdmin.service.ts::deletePricingRule
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `id` — string, silinecek kuralın kimliği
- **ic_degiskenler**:
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: yok (void)

### [N5_NASIL] AST Pointer: pricingAdmin.service.ts::deletePricingRules
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `ids` — string[], silinecek kural kimlikleri dizisi
- **ic_degiskenler**:
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: yok (void); `ids` boşsa erken dönüş yapılır

### [N6_NASIL] AST Pointer: pricingAdmin.service.ts::loadBrandIdByName
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı
- **ic_degiskenler**:
  - `data` — brands tablosundan dönen satırlar dizisi (id, name alanları)
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
  - `map` — Map<string, string> tipinde, marka adını anahtar olarak marka kimliğine eşleyen harita
- **Dönüş**: `map` — Map<string, string>

### [N7_NASIL] AST Pointer: pricingAdmin.service.ts::toPricingProductInput
- **params**: `row` — ProductScopeRow tipinde, ürün satırı; `brandIdByName` — Map<string, string> tipinde, marka adından marka kimliğine eşleme haritası
- **ic_degiskenler**: yok (doğrudan return objesi oluşturulur)
- **Dönüş**: SampleProduct nesnesi — `id`, `brandId` (brandIdByName.get(row.brand) ?? brandIdByName.get(row.brand.trim()) ?? null), `categoryId` (row.category_id ?? null), `costInBase` (row.cost_in_base ?? null), `name`, `sku` alanlarını içerir

### [N8_NASIL] AST Pointer: pricingAdmin.service.ts::brandNameById
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `brandId` — string, aranacak marka kimliği
- **ic_degiskenler**:
  - `data` — sorgudan dönen tek satır (name alanı); bulunamazsa null
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: `data?.name ?? null` — string | null

### [N9_NASIL] AST Pointer: pricingAdmin.service.ts::categoryIdsWithDescendants
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `rootId` — string, kök kategori kimliği
- **ic_degiskenler**:
  - `data` — categories tablosundan dönen satırlar dizisi (id, parent_id alanları)
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
  - `childrenOf` — Map<string, string[]> tipinde, her parent_id'ye ait çocuk kimliklerini tutan harita
  - `collected` — Set<string> tipinde, BFS ile toplanan tüm kategori kimliklerini tutan küme; başlangıçta rootId içerir
  - `queue` — string[] tipinde, BFS kuyruğu; başlangıçta rootId içerir
  - `current` — BFS döngüsünde işlenen mevcut kategori kimliği
- **Dönüş**: `[...collected]` — string[] dizisi; rootId ve tüm alt kategori kimliklerini içerir

### [N10_NASIL] AST Pointer: pricingAdmin.service.ts::resolveScopeFilter
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `scope` — number, kapsam türü (0, 1, 2, 3 veya diğer); `targetId` — string | null, hedef kimlik
- **ic_degiskenler**:
  - `name` — brandNameById çağrısından dönen marka adı (scope === 2 durumunda)
- **Dönüş**: ScopeFilter nesnesi — scope ve targetId değerlerine göre: `{ kind: 'id', value: targetId }`, `{ kind: 'empty' }`, `{ kind: 'brand', value: name }`, `{ kind: 'categories', values: [...] }` veya `{ kind: 'all' }`

### [N11_NASIL] AST Pointer: pricingAdmin.service.ts::withScopeFilter
- **params**: `query` — ScopeFilterableQuery<Q> tipinde, Supabase sorgu nesnesi; `filter` — ScopeFilter tipinde, kapsam filtresi
- **ic_degiskenler**: yok (switch-case ile doğrudan sorgu zincirleme yapılır)
- **Dönüş**: `query` — Q tipinde; filter.kind değerine göre `.eq('id', filter.value)`, `.eq('brand', filter.value)`, `.in('category_id', filter.values)` uygulanmış veya filtresiz sorgu

### [N12_NASIL] AST Pointer: pricingAdmin.service.ts::activeProductsQuery
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı
- **ic_degiskenler**: yok (doğrudan sorgu zincirleme döndürülür)
- **Dönüş**: Supabase sorgu nesnesi — products tablosundan PRODUCT_SCOPE_COLUMNS seçer, deleted_at null olan ve status 'active' olan kayıtları filtreler

### [N13_NASIL] AST Pointer: pricingAdmin.service.ts::countProductsInScope
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `scope` — number, kapsam türü; `targetId` — string | null, hedef kimlik
- **ic_degiskenler**:
  - `filter` — resolveScopeFilter çağrısından dönen ScopeFilter nesnesi
  - `countQuery` — products tablosundan id seçen, deleted_at null ve status 'active' filtreli sayım sorgusu
  - `count` — sorgudan dönen toplam kayıt sayısı
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
- **Dönüş**: `count ?? 0` — number; filter.kind 'empty' ise 0 döner

### [N14_NASIL] AST Pointer: pricingAdmin.service.ts::sampleProductsInScope
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `scope` — number, kapsam türü; `targetId` — string | null, hedef kimlik; `n` — number (varsayılan 3), örnek ürün sayısı
- **ic_degiskenler**:
  - `filter` — resolveScopeFilter çağrısından dönen ScopeFilter nesnesi
  - `data` — sorgudan dönen satırlar dizisi
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
  - `rows` — ProductScopeRow[] tipinde, data ?? [] ataması
  - `brandIdByName` — loadBrandIdByName çağrısından dönen Map<string, string>
- **Dönüş**: `rows.map((row) => toPricingProductInput(row, brandIdByName))` — SampleProduct[] dizisi; filter.kind 'empty' ise boş dizi döner

### [N15_NASIL] AST Pointer: pricingAdmin.service.ts::distinctPurchaseCurrenciesInScope
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `scope` — number, kapsam türü; `targetId` — string | null, hedef kimlik
- **ic_degiskenler**:
  - `filter` — resolveScopeFilter çağrısından dönen ScopeFilter nesnesi
  - `found` — Set<string> tipinde, bulunan benzersiz para birimlerini tutan küme
  - `page` — number, döngü sayaç değişkeni (0'dan SCOPE_SCAN_MAX_PAGES'e kadar)
  - `from` — number, sayfalama başlangıç indeksi (page * SCOPE_SCAN_PAGE)
  - `baseQuery` — products tablosundan purchase_currency seçen, deleted_at null ve status 'active' filtreli sorgu
  - `data` — sorgudan dönen satırlar dizisi
  - `error` — sorgu hatası varsa fırlatılacak hata nesnesi
  - `rows` — data ?? [] ataması
  - `row` — rows dizisindeki her bir satır (purchase_currency alanı okunur)
  - `currency` — row.purchase_currency ?? '' değerinin trim().toUpperCase() işleminden geçmiş hali
- **Dönüş**: `[...found].sort()` — string[] dizisi (sıralı benzersiz para birimleri); sayfa boyutundan az satır dönerse erken dönüş; SCOPE_SCAN_MAX_PAGES aşılırsa hata fırlatılır

### [N16_NASIL] AST Pointer: pricingAdmin.service.ts::marginPctToCoefficient
- **params**: `marginPct` — number, yüzde olarak kâr marjı
- **ic_degiskenler**: yok
- **Dönüş**: `Number((1 + marginPct / 100).toFixed(4))` — number; marginPct sonlu değilse `Number.NaN` döner

### [N17_NASIL] AST Pointer: pricingAdmin.service.ts::coefficientToMarginPct
- **params**: `coefficient` — number, katsayı
- **ic_degiskenler**: yok
- **Dönüş**: `Number(((coefficient - 1) * 100).toFixed(4))` — number; coefficient sonlu değilse `Number.NaN` döner

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    pricingAdmin_service_ts__activeProductsQuery["activeProductsQuery"]
    pricingAdmin_service_ts__brandNameById["brandNameById"]
    pricingAdmin_service_ts__categoryIdsWithDescendants["categoryIdsWithDescendants"]
    pricingAdmin_service_ts__coefficientToMarginPct["coefficientToMarginPct"]
    pricingAdmin_service_ts__countProductsInScope["countProductsInScope"]
    pricingAdmin_service_ts__createPricingRule["createPricingRule"]
    pricingAdmin_service_ts__deletePricingRule["deletePricingRule"]
    pricingAdmin_service_ts__deletePricingRules["deletePricingRules"]
    pricingAdmin_service_ts__distinctPurchaseCurrenciesInScope["distinctPurchaseCurrenciesInScope"]
    pricingAdmin_service_ts__listPricingRules["listPricingRules"]
    pricingAdmin_service_ts__loadBrandIdByName["loadBrandIdByName"]
    pricingAdmin_service_ts__marginPctToCoefficient["marginPctToCoefficient"]
    pricingAdmin_service_ts__resolveScopeFilter["resolveScopeFilter"]
    pricingAdmin_service_ts__sampleProductsInScope["sampleProductsInScope"]
    pricingAdmin_service_ts__toPricingProductInput["toPricingProductInput"]
    pricingAdmin_service_ts__updatePricingRule["updatePricingRule"]
    pricingAdmin_service_ts__withScopeFilter["withScopeFilter"]
    pricingAdmin_service_ts__countProductsInScope --> pricingAdmin_service_ts__resolveScopeFilter
    pricingAdmin_service_ts__distinctPurchaseCurrenciesInScope --> pricingAdmin_service_ts__resolveScopeFilter
    pricingAdmin_service_ts__resolveScopeFilter --> pricingAdmin_service_ts__categoryIdsWithDescendants
    pricingAdmin_service_ts__sampleProductsInScope --> pricingAdmin_service_ts__withScopeFilter
    pricingAdmin_service_ts__countProductsInScope --> pricingAdmin_service_ts__withScopeFilter
    pricingAdmin_service_ts__sampleProductsInScope --> pricingAdmin_service_ts__toPricingProductInput
    pricingAdmin_service_ts__distinctPurchaseCurrenciesInScope --> pricingAdmin_service_ts__withScopeFilter
    pricingAdmin_service_ts__sampleProductsInScope --> pricingAdmin_service_ts__activeProductsQuery
    pricingAdmin_service_ts__sampleProductsInScope --> pricingAdmin_service_ts__loadBrandIdByName
    pricingAdmin_service_ts__resolveScopeFilter --> pricingAdmin_service_ts__brandNameById
    pricingAdmin_service_ts__sampleProductsInScope --> pricingAdmin_service_ts__resolveScopeFilter
```

## NODE ID STANDARD

  file: pricingAdmin.service.ts
  function: pricingAdmin.service.ts::listPricingRules
  function: pricingAdmin.service.ts::createPricingRule
  function: pricingAdmin.service.ts::updatePricingRule
  function: pricingAdmin.service.ts::deletePricingRule
  function: pricingAdmin.service.ts::deletePricingRules
  function: pricingAdmin.service.ts::loadBrandIdByName
  function: pricingAdmin.service.ts::toPricingProductInput
  function: pricingAdmin.service.ts::brandNameById
  function: pricingAdmin.service.ts::categoryIdsWithDescendants
  function: pricingAdmin.service.ts::resolveScopeFilter
  function: pricingAdmin.service.ts::withScopeFilter
  function: pricingAdmin.service.ts::activeProductsQuery
  function: pricingAdmin.service.ts::countProductsInScope
  function: pricingAdmin.service.ts::sampleProductsInScope
  function: pricingAdmin.service.ts::distinctPurchaseCurrenciesInScope
  function: pricingAdmin.service.ts::marginPctToCoefficient
  function: pricingAdmin.service.ts::coefficientToMarginPct

---

## DISA AKTARILANLAR (EXPORTS)
  export: PricingRuleCreateInput
  export: PricingRuleUpdateInput
  export: ProductScopeRow
  export: SampleProduct
  export: activeProductsQuery
  export: brandNameById
  export: categoryIdsWithDescendants
  export: coefficientToMarginPct
  export: countProductsInScope
  export: createPricingRule
  export: deletePricingRule
  export: deletePricingRules
  export: distinctPurchaseCurrenciesInScope
  export: listPricingRules
  export: loadBrandIdByName
  export: marginPctToCoefficient
  export: resolveScopeFilter
  export: sampleProductsInScope
  export: toPricingProductInput
  export: updatePricingRule
  export: withScopeFilter