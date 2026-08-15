---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\__tests__\pricingAdmin.service.test.ts
skeleton_hash: 1fede8c0f298d4b3
entity_hashes:
  func:readField: e927400a64da6d8f
  func:stubClient: bbb22df8f0944217
  overview: 19a92951e8cc85f2
generated_at: 2026-08-14T09:16:25Z
---

## Genel Bakış
Bu modül, pricingAdmin servisi için yazılan testlerde kullanılan yardımcı fonksiyonları içerir. Temel amacı, test senaryolarında gerçek API çağrıları yerine kontrol edilebilir sahte (stub) veriler sağlamak ve test edilen nesnelerden alan değerlerini güvenli bir şekilde okumaktır.

## Fonksiyon Grupları

### Test Verisi Oluşturma
Test senaryolarında gerçek veritabanı bağlantısı olmadan, belirli tablo verilerini ve toplam kayıt sayılarını simüle eden stub istemci fonksiyonu yer alır. Bu sayede testler dış bağımlılıktan yalıtılmış çalışır.
- stubClient

### Veri Okuma Yardımcıları
Test edilen nesne veya veri yapılarından, belirli bir anahtar değerinin güvenli bir şekilde okunmasını sağlayan yardımcı fonksiyonu kapsar. Olası undefined durumlarını yöneterek testlerin daha temiz yazılmasını kolaylaştırır.
- readField

---

## AXIOMS – Mimari Varsayımlar
Bu modül için test stub ve veri okuma yardımcı fonksiyonları tanımlanmıştır.

[Aksiyom 1]: Eğer `stubClient` fonksiyonuna geçirilen `tables` parametresi bir object (`Record<string, unknown[]>`) yapısında değilse, fonksiyon geçerli bir `StubResult` nesnesi döndüremez.

[Aksiyom 2]: Eğer `stubClient` fonksiyonuna geçirilen `totalCount` parametresi sayısal bir değer değilse (örn: `undefined`, `null`, veya string), fonksiyon doğru toplam kayıt sayısını yansıtamaz.

[Aksiyom 3]: Eğer `tables` parametresindeki herhangi bir key'in değeri bir dizi (`unknown[]`) değilse, stub istemcisi o tablodaki satırları doğru bir şekilde simüle edemez.

[Aksiyom 4]: Eğer `readField` fonksiyonuna geçirilen `key` parametresi string türünde değilse, kaynaktan alan okuma işlemi başarısız olur.

[Aksiyom 5]: Eğer `readField` fonksiyonuna geçirilen `source` parametresi `null` veya `undefined` ise, verilen `key` ile alan okunamaz ve fonksiyon `undefined` döndürür.

[Aksiyom 6]: Eğer `PRODUCT_ROW` sabiti bir object olarak tanımlanmamışsa, bu sabiti referans alan test senaryoları veya veri yapıları eksik kalır.

---

## FONKSİYON DETAYLARI

### stubClient
**Ne yapar**: Test ortamında gerçek Supabase istemcisi yerine kullanılacak sahte (stub) bir istemci oluşturur. Verilen tablo verilerine göre HTTP isteklerini yakalar ve tanımlı mock yanıtları döndürür. Yakalanan tüm istekleri bir diziye kaydederek testlerde doğrulama yapılmasını sağlar.

**Nasıl yapar**: İçeride tanımlanan `fakeFetch` fonksiyonu, gerçek `fetch` API'sinin yerine geçer. Her gelen istekte URL'den tablo adını çıkarır, `tables` sözlüğünden ilgili satırları bulur. `Accept` başlığında `pgrst.object` içeriği varsa tek bir nesne, yoksa dizi döndürür. HEAD isteklerinde gövde boş döner. Tüm istekler `calls` dizisine method, URL, body ve header bilgileriyle birlikte kaydedilir. Son olarak `createClient` ile `'http://stub.local'` adresine bağlanan sahte bir Supabase istemcisi oluşturulur. `persistSession` ve `autoRefreshToken` devre dışı bırakılarak oturum yönetimi engellenir. Döndürülen `StubResult` nesnesi hem istemciyi hem de yakalanan istekleri içerir.

**Parametreler**:
- `tables`: `Record<string, unknown[]>` — Tablo adlarını (anahtar) ve her tablonun satırlarını (değer olarak nesne dizisi) eşleştiren sözlük yapısı. URL'den çıkarılan tablo adına göre ilgili veri dizisi buradan okunur.
- `totalCount`: `number` (varsayılan: `0`) — Stub'un `content-range` yanıt başlığında toplam kayıt sayısı olarak bildireceği değer. Tek bir sayfalık veri döndürse bile, bu değer ile daha büyük bir veri kümesinin varmış gibi davranmasını sağlar.

**Dönüş**: `StubResult` — `{ supabase: SupabaseClient<Database>, calls: CapturedRequest[] }`形状inde bir nesne döndürür. `supabase`, testlerde kullanılacak sahte Supabase istemcisidir. `calls`, test süresince yapılan tüm isteklerin method, url, body ve headers bilgilerini tutan yakalama dizisidir.

### readField
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../../types/database.types::type { Database }
- import: @supabase/supabase-js::createClient
- import: @supabase/supabase-js::type { SupabaseClient }
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## INTERFACES

### CapturedRequest
- `method: string`
- `url: string`
- `body: unknown`
- `headers: Record<string, string>`

### StubResult
- `supabase: SupabaseClient<Database>`
- `calls: CapturedRequest[]`

---

## SABİTLER
- **PRODUCT_ROW** (object) — `{
  id: 'p1',
  name: 'Vort Quadro Micro 100',
  sku: 'VQM-100',
  brand:...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::stubClient
- **params**: `(tables: Record<string, unknown[]>, totalCount = 0)` — `tables` sahte tablo verilerini (tablo adı → satır dizisi) tutar; `totalCount` content-range header'ındaki toplam satır sayısını belirtir (varsayılan 0)
- **ic_degiskenler**:
  - `calls` — yakalanan tüm isteklerin dizisi (method, url, body, headers); testlerde asserting için kullanılır
  - `fakeFetch` — Supabase client'ın global fetch'ini ikame eden sahte fetch fonksiyonu; her çağrıyı `calls`'a kaydeder ve `tables`'dan uygun veriyi döner
  - `href` — input'un string, URL veya Request objesinden çıkarılan ham URL dizesi
  - `method` — HTTP methodu (GET, POST, PATCH, HEAD vb.), `init?.method`'dan alınır, yoksa 'GET'
  - `headers` — küçük harfe çevrilmiş header键值çiftlerini tutan sözlük; accept header'ı ile `pgrst.object` algılanır
  - `rawBody` — request body'sinin string hali; JSON.parse ile parse edilerek `calls`'a kaydedilir
  - `table` — URL pathname'den çıkarılan tablo adı (son path segment); `tables[table]` ile satırlar getirilir
  - `rows` — `tables` sözlüğünden tablo adına karşılık gelen satır dizisi; yoksa boş dizi
  - `wantsSingleObject` — accept header'ı `pgrst.object` içeriyorsa true; tek obje dönülüp dönülmeyeceğini belirler
  - `payload` — `wantsSingleObject` ise ilk satır (null olabilir), değilse tüm satırlar
  - `supabase` — `createClient` ile oluşturulan sahte Supabase client'ı; `fakeFetch` ile donatılmış, `stub.local` adresine bağlanır
- **Dönüş**: `{ supabase, calls }` — stub Supabase client'ı ve yakalanan isteklerin dizisi

---

### [N2_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::readField
- **params**: `(source: unknown, key: string)` — `source` okunacak obje; `key` erişilecek alan adı
- **ic_degiskenler**:
  - `record` — `source`'un spread ile shallow-copy'su; `Record<string, unknown>` olarak cast edilmiş ve `record[key]` ile alan değeri okunur
- **Dönüş**: `record[key]` (alan mevcutsa) veya `undefined` (source nesne değilse veya key yoksa)

---

### [N3_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (fakeFetch gövdesi)
- **params**: `(input, init)` — fetch API'sine gelen URL/request ve options
- **ic_degiskenler**: (stubClient içindekifakeFetch ile aynı yapı)
  - `href`, `method`, `headers`, `rawBody`, `table`, `rows`, `wantsSingleObject`, `payload` — stubClient açıklamasıyla aynı
- **Dönüş**: `Promise<Response>` — JSON payload ile 200 status, content-range header'ı dahil

---

### [N4_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (Headers.forEach callback)
- **params**: `(value, key)` — header değerini ve adını alır
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — `headers[key.toLowerCase()] = value` ile yan etki

---

### [N5_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (describe/coefficientToMarginPct testleri)
- **params**: (yok)
- **ic_degiskenler**: (yok — doğrudan expect çağrılır)
- **Dönüş**: yok — `coefficientToMarginPct` ve `marginPctToCoefficient` fonksiyonlarının doğru sonuç ürettiğini doğrular

---

### [N6_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (toPricingProductInput testleri)
- **params**: (yok)
- **ic_degiskenler**:
  - `map` — `Map<['Vortice', 'brand-vortice']>` marka adından brandId'ye eşleme; `toPricingProductInput`'a brand köprüsü olarak verilir
  - `out` — `toPricingProductInput`'ın dönüş değeri; pricing motoruna gönderilecek ürüne dönüştürülmüş nesne
- **Dönüş**: yok — `out`'un brandId, costInBase, id, sku, name alanlarını doğrular

---

### [N7_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (countProductsInScope testleri)
- **params**: (yok — async arrow fonksiyon)
- **ic_degiskenler**:
  - `supabase` — `stubClient`'tan dönen sahte Supabase client'ı; `countProductsInScope`'a bağlanır
  - `calls` — yakalanan istekler dizisi; URL'lerin content-range ve filtre parametrelerini doğrulamak için kullanılır
  - `count` — `countProductsInScope`'ın döndüğü ürün sayısı; beklenen değerle karşılaştırılır
  - `url` — `calls[0].url`'in `decodeURIComponent` ile çözülmüş hali; `deleted_at=is.null`, `status=eq.active` gibi filtreler kontrol edilir
  - `productsUrl` — `calls[calls.length - 1].url`'in çözülmüş hali; `category_id=in.` içeriğini doğrular
- **Dönüş**: yok — `count` değerinin beklenen sayıya eşitliğini ve URL parametrelerinin doğruluğunu assert eder

---

### [N8_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (sampleProductsInScope testi)
- **params**: (yok — async arrow fonksiyon)
- **ic_degiskenler**:
  - `supabase` — stub Supabase client'ı
  - `calls` — yakalanan istekler
  - `samples` — `sampleProductsInScope`'ın döndüğü fiyat motoru girdisi dizisi; `id`, `sku`, `brandId`, `costInBase` alanlarını içerir
  - `url` — ilk isteğin çözülmüş URL'si; `limit=3` ve `cost_in_base` parametrelerini doğrular
- **Dönüş**: yok — `samples` dizisinin uzunluğunu ve `toMatchObject` ile yapısını assert eder

---

### [N9_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::anonymous (createPricingRule / updatePricingRule testleri)
- **params**: (yok — async arrow fonksiyon)
- **ic_degiskenler**:
  - `supabase` — stub Supabase client'ı
  - `calls` — yakalanan istekler
  - `insert` — `calls.find(c => c.method === 'POST')` ile bulunan INSERT isteği; `body`'sinde `tenant_id` olmaması doğrulanır
  - `body` — `insert?.body` veya `patch?.body`; isArray kontrolü ile unwrap edilir; `scope`, `brand_id`, `margin_pct`, `updated_by`, `updated_at` alanları assert edilir
  - `patch` — `calls.find(c => c.method === 'PATCH')` ile bulunan UPDATE isteği; URL'sinde `id=eq.r1` filtresi kontrol edilir
- **Dönüş**: yok — `body`'nin `toMatchObject` ile içeriğini, `tenant_id` absence'ini ve `updated_at`'in string tipini assert eder

---

## NODE ID STANDARD

  file: src\lib\services\__tests__\pricingAdmin.service.test.ts
  function: src\lib\services\__tests__\pricingAdmin.service.test.ts::stubClient
  function: src\lib\services\__tests__\pricingAdmin.service.test.ts::readField

---

## DISA AKTARILANLAR (EXPORTS)
  export: readField
  export: stubClient