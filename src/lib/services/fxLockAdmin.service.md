---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\fxLockAdmin.service.ts
skeleton_hash: 842677c912721fd8
entity_hashes:
  func:resolveFxLockFreeze: 1ce8633abb6e16a1
  overview: 094880244f3a70bb
generated_at: 2026-08-25T08:44:36Z
---

## Genel Bakış

Bu modül, döviz kuru kilitleme (fx lock) dondurma (freeze) işleminin gerçekleştirilip gerçekleştirilmeyeceğine ilişkin kararı çözümleyen bir servistir. Supabase veritabanı üzerinden belirli bir kapsam ve hedef kimliğe göre dondurma durumunu değerlendirip bir karar nesnesi döndürür. Modül tek bir dışa açık fonksiyondan oluşur.

## Fonksiyon Grupları

### Döviz Kuru Kilitleme Dondurma Kararı

Bu grup, bir döviz kuru kilitleme kaydının dondurulup dondurulmayacağını belirleyen çözümleme mantığını içerir. Verilen kapsam (scope), hedef kimlik (targetId) ve tarih (today) bilgisine dayanarak Supabase veritabanından gerekli sorguları yapar ve bir `FxLockFreezeDecision` sonucu üretir.

- `resolveFxLockFreeze`

## Bağımlılıklar

- **Dış bağımlılıklar:** `SupabaseClient` ve `Database` tipleri (Supabase istemcisi), `FxLockFreezeDecision` dönüş tipi
- **İç bağımlılıklar:** Belirtilmemiş; modül kendi içinde başka modül çağırmıyor görünmektedir
- **Dinamik/lazy yükleme:** Kaynakta böyle bir bilgi yer almıyor

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanamamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir. Aksiyomlar yalnızca fonksiyon gövdesinden türetilir; imza, docstring veya yorumlardan bilgi çıkarılmaz. Gövde sağlandığında aksiyomlar üretilebilir.

---

## FONKSİYON DETAYLARI

### resolveFxLockFreeze
**Ne yapar**: Verilen kapsam için kilit dondurma işleminde kullanılacak döviz kurunu çözer. Kapsamdaki ürünlerin para birimlerini analiz ederek tek para birimi varsa güncel kur bilgisini döndürür; birden fazla para birimi varsa veya kur bulunamazsa uygun durum koduyla birlikte sonucu bildirir.

**Nasıl yapar**: Önce `distinctPurchaseCurrenciesInScope` yardımcısını çağırarak kapsam içindeki benzersiz satın alma para birimlerini sorgular. Dönen dizi boşsa, bu durum kapsamda aktif ürün olmadığı anlamına gelir (çünkü `purchase_currency` alanı NOT NULL kısıtlamasına sahiptir; "ürün var ama para birimi boş" senaryosu oluşamaz). Yardımcı fonksiyon sayfa sınırını aşarsa eksik küme döndürmek yerine hata atar; aksi takdirde "tek para birimi" yanılsaması üretilebilirdi. Dizi uzunluğu birden büyükse çoklu para birimi durumu bildirilir. Tek para birimi varsa `resolveFxRate` fonksiyonu ile belirtilen tarih için kur bilgisi çözümlenir; kur bulunamazsa uygun hata durumu, bulunursa kur değeri ve geçerlilik tarihiyle birlikte başarılı sonuç döndürülür. `today` parametresi dışarıdan geçirilir; böylece karar saf kalır ve test ortamında sabit bir tarihe bağlanabilir — içeride `new Date()` çağrısı yapılmaz, çünkü bu testi takvime bağımlı kılardı.

**Parametreler**:
- supabase: SupabaseClient\<Database\> — Veritabanı sorguları için kullanılan Supabase istemci nesnesi
- scope: number — Kilit kapsamını tanımlayan sayısal değer
- targetId: string | null — Hedef kimliği; kapsam belirli bir hedefe daraltılıyorsa kullanılır, aksi takdirde null
- today: string — Kararın verildiği tarih; çağrının kendi saatini temsil eder ve testlerde sabitlenebilmesi için dışarıdan geçirilir

**Dönüş**: Promise\<FxLockFreezeDecision\> — Dört farklı durumdan birini içeren birleşim tipi: `noProducts` (kapsamda aktif ürün yok), `multiCurrency` (birden fazla para birimi mevcut, currencies dizisiyle birlikte), `rateUnavailable` (kur bilgisi bulunamadı, currency ile birlikte) veya `ok` (başarlı çözümleme, currency, rate ve effectiveDate alanlarıyla birlikte).

---

## İTHALATLAR (IMPORTS)
- import: @/lib/services/fxRate.service::resolveFxRate
- import: @/lib/services/pricingAdmin.service::distinctPurchaseCurrenciesInScope
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## TYPE ALIASES

### FxLockFreezeDecision
KUR KİLİDİ KAYDEDİLİRKEN VERİLEN KARAR (FX-LOCK 2/2b · pricing-standard §8). Cetvel kararı [D]: bir kilit, kapsamın kurunu DONDURUR. Ama "kapsamın kuru" ancak kapsamda TEK bir alış para birimi varsa anlamlıdır. İki farklı para birimi içeren bir kapsama tek bir kur yazmak, ürünlerin yarısını YANLIŞ k
```typescript
type FxLockFreezeDecision = /** Kapsamda aktif ürün yok — kilitlenecek bir şey yok. */
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/fxLockAdmin.service.ts::resolveFxLockFreeze
- **params**:
  - `supabase` — Supabase istemcisi (SupabaseClient<Database> tipinde)
  - `scope` — Kapsam numarası (number)
  - `targetId` — Hedef kimliği, null olabilir (string | null)
  - `today` — Bugünün tarihi, döviz kuru çözümlemesinde kullanılır (string)
- **ic_degiskenler**:
  - `currencies` — `distinctPurchaseCurrenciesInScope(supabase, scope, targetId)` çağrısından dönen dizi. Kapsamdaki benzersiz satın alma para birimlerini içerir. Boş dizi = aktif ürün yok; birden fazla eleman = çoklu para birimi durumu.
  - `currency` — `currencies[0]` subscript erişimi. Dizi tek elemanlı olduğunda o para birimi kodunu tutar.
  - `resolved` — `resolveFxRate(supabase, currency, today)` çağrısından dönen sonuç. Döviz kuru çözümleme sonucu; null ise kur bulunamamıştır.
  - `resolved.rate` — Çözümlenen döviz kuru değeri. `resolved` null değilse erişilir.
  - `resolved.effectiveDate` — Kurun geçerli olduğu tarih. `resolved` null değilse erişilir.
- **Dönüş**: `Promise<FxLockFreezeDecision>` — Aşağıdaki durum nesnelerinden birini döndürür:
  - `{ kind: 'noProducts' }` — `currencies.length === 0` olduğunda (kapsamda aktif ürün yok)
  - `{ kind: 'multiCurrency', currencies }` — `currencies.length > 1` olduğunda (birden fazla para birimi var)
  - `{ kind: 'rateUnavailable', currency }` — `resolved` falsy olduğunda (döviz kuru bulunamadı)
  - `{ kind: 'ok', currency, rate: resolved.rate, effectiveDate: resolved.effectiveDate }` — başarılı çözümleme durumu

---

## NODE ID STANDARD

  file: src\lib\services\fxLockAdmin.service.ts
  function: src\lib\services\fxLockAdmin.service.ts::resolveFxLockFreeze

---

## DISA AKTARILANLAR (EXPORTS)
  export: FxLockFreezeDecision
  export: resolveFxLockFreeze