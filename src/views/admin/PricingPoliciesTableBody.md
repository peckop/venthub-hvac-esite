---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\PricingPoliciesTableBody.tsx
skeleton_hash: 6dc08285098d673f
entity_hashes:
  func:EffectiveLockPanel: f5eb59505e91e68f
  func:PricingPoliciesTableBody: 242122ccd79025dd
  func:policiesFetcher: 3dc61bf26c95820a
  overview: 0735c2f1aad88d41
  style_tokens: 406c48a0ed4c398b
generated_at: 2026-08-25T08:46:05Z
---

## Genel Bakış
Bu modül, admin panelinde fiyatlandırma politikalarının listelendiği tablonun gövde kısmını oluşturur. Supabase üzerinden politika verilerini çeker, tablo satırlarını render eder ve etkin kilitleme durumunu gösteren bir panel sunar. Üç ana bileşenden oluşur: veri çekme yardımcısı, kilitleme paneli ve ana tablo gövdesi.

## Fonksiyon Grupları

### Veri Erişim
Politika satırlarını Supabase veritabanından asenkron olarak çeker ve tablo bileşeninin tüketebileceği formatta döndürür.
- policiesFetcher

### Kullanıcı Arayüzü Bileşenleri
Fiyatlandırma politikalarının tablo görünümünü ve ilgili alt bileşenleri render eder. EffectiveLockPanel, belirli bir politikanın kilitleme durumunu kullanıcıya gösterir; PricingPoliciesTableBody ise tüm tablo gövdesini bir araya getirir.
- EffectiveLockPanel, PricingPoliciesTableBody

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri verilmediğinden, yalnızca fonksiyon imzalarından ve modül sabitinden çıkarılabilecek varsayımlar belirlenmiştir.

[Aksiyom 1]: Eğer `supabase` parametresi olarak geçerli bir `SupabaseClient<Database>` nesnesi sağlanmazsa, `policiesFetcher` fonksiyonu veritabanı bağlantısı kuramaz ve veri çekme işlemi gerçekleştirilemez.

[Aksiyom 2]: Eğer `SCOPE_KEYS` sabiti tanımlı değilse, politika kapsam anahtarlarına erişim sağlanamaz ve bileşenler bu anahtarlara dayalı işlemleri gerçekleştiremez.

[Aksiyom 3]: Eğer `Effective

---

## FONKSİYON DETAYLARI

### policiesFetcher
**Ne yapar**: Yönetim arayüzünde gösterilecek fiyatlandırma politikalarını Supabase veritabanından çeker. Pasif politikaları DAHİL eder; çünkü yönetim yüzeyi kapatılmış bir politikayı bile listelemek ZORUNLUDUR — aksi hâlde pasif politika "hiç yok" ile ayırt edilemez hâle gelir. Bu, `fetchActivePolicies` fonksiyonundan farklı bir davranıştır; o yalnızca motorun ihtiyaç duyduğu aktif politikaları getirir.

**Nasıl yapar**: Önce `ensureSessionFresh()` çağırarak oturumun güncel olduğunu doğrular. Ardından `pricing_policy` tablosundan tüm kayıtları çeker; `scope` alanına göre artan, `priority` alanına göre azalan sırayla sıralar. Paralel olarak `brands` ve `categories` tablolarından `id` ve `name` alanlarını çeker. Politikalardaki benzersiz `product_id` değerlerini toplar ve varsa `products` tablosundan `id`, `name`, `sku` bilgilerini getirir. Çekilen marka, kategori ve ürün verilerini `Map` yapılarına dönüştürerek isim eşleştirmesi yapar. Her politika kaydını `PolicyRow` formatına dönüştürürken `scope` değerine göre ilgili hedef adını (`targetName`) belirler: scope 2 ise marka adı, scope 3 ise kategori adı, scope 0 veya 1 ise ürün adı ve SKU bilgisini kullanır. Sonuç olarak `{ rows, totalMatched }` biçiminde bir nesne döndürür.

**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase istemci nesnesi; veritabanı sorguları bu nesne üzerinden yapılır
- _params: FetchParams — Çekme parametreleri; alt çizgi önekiyle tanımlandığından fonksiyon gövdesinde KULLANILMAZ

**Dönüş**: Promise<FetchResult<PolicyRow>> — `rows` alanını PolicyRow dizisi ve `totalMatched` alanını toplam satır sayısı içeren bir nesneye resolve olan Promise.

### EffectiveLockPanel
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### PricingPoliciesTableBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../components/admin/AdminEmptyState::AdminEmptyState
- import: ../../components/admin/data-table/DataTableKit::DataTableKit
- import: ../../components/admin/data-table/types::type { AdminColumn }
- import: ../../hooks/useAdminTable::type FetchParams
- import: ../../hooks/useAdminTable::type FetchResult
- import: ../../hooks/useAdminTable::useAdminTable
- import: ../../hooks/useRole::useRole
- import: ../../i18n/I18nProvider::useI18n
- import: ../../i18n/datetime::formatDateTime
- import: ../../lib/ensureSessionFresh::ensureSessionFresh
- import: ../../types/database.types::type { Database }
- import: ../../utils/adminQueryFilters::orIlikeContains
- import: @/lib/services/pricingAdmin.service::loadBrandIdByName
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @supabase/supabase-js::type { SupabaseClient }
- import: lucide-react::Lock
- import: lucide-react::LockOpen
- import: lucide-react::SearchX
- import: lucide-react::ShieldCheck
- import: react::React
- import: react::useCallback
- import: react::useMemo
- import: react::useState

---

## INTERFACES

### PolicyRow
- `id: string`
- `scope: number`
- `scopeKey: ScopeKey`
- `targetId: string | null`
- `targetName: string`
- `fxLock: boolean`
- `frozenRate: number | null`
- `frozenAt: string`
- `note: string | null`
- `isActive: boolean`
- `priority: number`

---

## TYPE ALIASES

### ScopeKey
Kur kilidi (`pricing_policy.fx_lock`) yönetim yüzeyi — okuma yarısı. NİÇİN VAR: tablo ve onu okuyan motor W5'te geldi ama HİÇBİR arayüzü yoktu — kilit görülemiyor, konulmuş bir kilidin hangi ürünü etkilediği anlaşılamıyordu. Ölçüm (2026-08-17, prod): `pricing_policy` 0 satır, yani bu yüzey ilk okuyu
```typescript
type ScopeKey = 'variant' | 'product' | 'brand' | 'category' | 'global'
```

---

## SABİTLER
- **SCOPE_KEYS** (object) — `{
  0: 'variant',
  1: 'product',
  2: 'brand',
  3: 'category',
  4: 'g...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: PricingPoliciesTableBody.tsx::policiesFetcher
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `_params` — FetchParams tipinde, kullanılmıyor (fonksiyon gövdesinde `_params` adıyla tanımlı ama erişilmiyor)
- **ic_degiskenler**:
  - `data` — supabase sorgusu sonucu dönen pricing_policy satırları (destructuring ile alınır)
  - `error` — supabase sorgusu sonucu oluşan hata nesnesi; varsa throw ile fırlatılır
  - `policies` — `data ?? []` ifadesiyle null-safe hale getirilmiş PricingPolicyRow[] dizisi
  - `brands` — Promise.all içindeki ilk sorgudan dönen brands tablosu satırları (id, name alanları)
  - `categories` — Promise.all içindeki ikinci sorgudan dönen categories tablosu satırları (id, name alanları)
  - `productIds` — policies dizisinden çıkarılan benzersiz, null olmayan product_id değerleri (Set ile tekrarsızlaştırılır)
  - `products` — productIds boş değilse products tablosundan çekilen (id, name, sku) satırları; boşsa boş dizi
  - `brandName` — brands dizisinden oluşturulan Map<id, name>; marka ID'sinden isim çözümlemesi için kullanılır
  - `categoryName` — categories dizisinden oluşturulan Map<id, name>; kategori ID'sinden isim çözümlemesi için kullanılır
  - `productName` — products dizisinden oluşturulan Map<id, "name (sku)">; ürün ID'sinden isim+SKU çözümlemesi için kullanılır
  - `rows` — policies.map ile dönüştürülmüş PolicyRow[] dizisi; her satırda scope, scopeKey, targetId, targetName, fxLock, frozenRate, frozenAt, note, isActive, priority alanları taşınır
  - `p` — map callback'indeki her bir PricingPolicyRow öğesi
- **Dönüş**: `{ rows: PolicyRow[], totalMatched: number }` — FetchResult<PolicyRow> tipinde; rows dizisi ve toplam eşleşen satır sayısı

### [N2_NASIL] AST Pointer: PricingPoliciesTableBody.tsx::EffectiveLockPanel
- **params**: yok
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `term` — useState('') ile tutulan arama terimi (string)
  - `setTerm` — term state'ini güncelleyen setter fonksiyonu
  - `busy` — useState(false) ile tutulan meşgul durumu (boolean); arama sırasında true olur
  - `setBusy` — busy state'ini güncelleyen setter fonksiyonu
  - `result` — useState(null) ile tutulan arama sonucu; `{ kind: 'notFound' }` | `{ kind: 'found'; label: string; decision: FxLockDecision; winnerScope: ScopeKey | null }` | `{ kind: 'failed' }` | null tiplerinden biri
  - `setResult` — result state'ini güncelleyen setter fonksiyonu
  - `lookup` — useCallback ile sarılmış async arama fonksiyonu; term bağımlılığıyla memoize edilir
  - `q` — lookup içinde `term.trim()` ile elde edilen temizlenmiş arama metni; boşsa fonksiyon erken döner
  - `products` — supabaseBrowserClient ile products tablosundan çekilen (id, name, sku, brand, category_id) satırları; destructuring ile `data` olarak alınır
  - `searchError` — products sorgusunun hata nesnesi; varsa `result` 'failed' olarak ayarlanır ve erken dönülür
  - `product` — products dizisinin ilk elemanı veya null; ürün bulunamazsa `result` 'notFound' olarak ayarlanır
  - `brandIdByName` — loadBrandIdByName(supabaseBrowserClient) çağrısı sonucu dönen Map; marka adından ID çözümlemesi yapar
  - `brandId` — brandIdByName Map'inden product.brand (trim'li ve trim'siz) ile aranan marka ID'si; bulunamazsa null
  - `decisions` — resolveFxLocks(supabaseBrowserClient, [...]) çağrısı sonucu dönen Map; ürün ID'sinden FxLockDecision çözümlemesi yapar
  - `decision` — decisions Map'inden product.id ile alınan FxLockDecision; bulunamazsa `{ locked: false, policyId: null, frozenRate: null, scope: null }` varsayılanı kullanılır
  - `e` — onKeyDown handler'ındaki klavye olayı nesnesi; Enter tuşunda lookup() çağrılır
- **Dönüş**: JSX — section etiketi içinde arama formu ve sonuç gösterimi (notFound, failed, found durumlarına göre farklı UI)

### [N3_NASIL] AST Pointer: PricingPoliciesTableBody.tsx::PricingPoliciesTableBody
- **params**: yok
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan gelen çeviri fonksiyonu
  - `lang` — useI18n() hook'undan gelen dil kodu; formatDateTime çağrılarında kullanılır
  - `canAccess` — useRole() hook'undan gelen erişim kontrol fonksiyonu; '/admin/pricing' yolu için okuma erişimi kontrol eder
  - `canWrite` — useRole() hook'undan gelen yazma erişim kontrol fonksiyonu; 'pricing' kaynağı için yazma erişimi kontrol eder
  - `table` — useAdminTable<PolicyRow>({...}) çağrısı sonucu dönen tablo nesnesi; resource: 'pricing_policies', rowId: (r) => r.id, fetcher: policiesFetcher, initialSort: { key: 'scope', dir: 'asc' }, syncUrl: true yapılandırmasıyla oluşturulur
  - `formOpen` — useState(false) ile tutulan form modal açık/kapalı durumu (boolean)
  - `setFormOpen` — formOpen state'ini güncelleyen setter fonksiyonu
  - `editing` — useState<PolicyFormValue | null>(null) ile tutulan düzenlenen politika verisi; null ise yeni kayıt modu
  - `setEditing` — editing state'ini güncelleyen setter fonksiyonu
  - `openNew` — useCallback ile sarılmış fonksiyon; editing'i null yapar ve formOpen'u true yapar (yeni kayıt açma)
  - `openEdit` — useCallback ile sarılmış fonksiyon; PolicyRow parametresi alır, row verilerini PolicyFormValue formatına dönüştürüp editing state'ine atar ve formOpen'u true yapar
  - `row` — openEdit callback'indeki PolicyRow parametresi; id, scope, targetId, fxLock, note, priority, isActive, frozenRate alanları taşınır
  - `columns` — useMemo ile memoize edilmiş AdminColumn<PolicyRow>[] dizisi; scope, target, fxLock, frozenRate, frozenAt, note, isActive, actions sütunlarını içerir; t, lang, openEdit bağımlılıklarıyla yeniden hesaplanır
  - `r` — columns içindeki cell callback'lerindeki PolicyRow parametresi; her sütunun render mantığında kullanılır
- **Dönüş**: JSX — div etiketi içinde EffectiveLockPanel, yeni kayıt butonu, DataTableKit tablosu ve PricingPolicyFormModal bileşenlerini içerir

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    PricingPoliciesTableBody_tsx__EffectiveLockPanel["EffectiveLockPanel"]
    PricingPoliciesTableBody_tsx__PricingPoliciesTableBody["PricingPoliciesTableBody"]
    PricingPoliciesTableBody_tsx__policiesFetcher["policiesFetcher"]
```

## NODE ID STANDARD

  file: src\views\admin\PricingPoliciesTableBody.tsx
  function: src\views\admin\PricingPoliciesTableBody.tsx::policiesFetcher
  function: src\views\admin\PricingPoliciesTableBody.tsx::EffectiveLockPanel
  function: src\views\admin\PricingPoliciesTableBody.tsx::PricingPoliciesTableBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: EffectiveLockPanel
  export: PricingPoliciesTableBody
  export: policiesFetcher

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-accent-weak`, `bg-admin-surface-2`, `text-admin-accent`, `text-admin-danger`, `text-admin-fg`, `text-admin-fg-muted`, `text-admin-success`, `text-admin-warning`, `text-sm`, `text-xs`
- **Layout:** `flex`, `flex-col`, `gap-1.5`, `gap-2`, `gap-3`, `inline-flex`, `items-center`, `justify-end`, `sm:flex-row`
- **Varyant/Responsive:** `:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `$`, `:`, `mb-4`, `mt-1`, `mt-4`, `pb-20`, `px-2`, `py-0.5`, `r.fxLock`, `ring-1`, `ring-admin-accent/30`, `ring-admin-border`, `rounded-full`, `space-y-2`, `space-y-6`