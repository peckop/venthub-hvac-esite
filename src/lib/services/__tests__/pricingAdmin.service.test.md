---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-altyapi\src\lib\services\__tests__\pricingAdmin.service.test.ts
skeleton_hash: 9e07364cadbe3e67
entity_hashes:
  func:readField: e927400a64da6d8f
  func:stubClient: e7872c073ace7457
  overview: 7f63248beb061ae0
generated_at: 2026-08-18T06:49:02Z
---

## Genel Bakış
Bu modül, pricingAdmin servisi için yazılan testlerde kullanılan yardımcı fonksiyonları içerir. Temel amacı, test senaryolarında gerçek API çağrıları yerine kontrol edilebilir sahte veriler sağlamak ve test edilen nesnelerden alan değerlerini güvenli bir şekilde okumaktır.

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

---

## Bağımlılıklar ve Mimari Bağlam
Bu modül test altyapısına ait yardımcı fonksiyonlar içerdiğinden, production koduna doğrudan bağımlılığı yoktur. Ancak, `stubClient` fonksiyonunun döndürdüğü `StubResult` yapısının, test edilen pricingAdmin servisinin beklediği istemci arayüzüyle (örn. Supabase veya başka bir veri erişim katmanı) uyumlu olması gerekmektedir. `readField` fonksiyonu ise genel bir yardımcı olup, herhangi bir nesne veya alan derinliği için kullanılabilir. Bu fonksiyonlar dinamik veya lazy yüklenen modüllere bağlı değildir; doğrudan test dosyası içinde tanımlı ve izoledir. Mimari açıdan, test süresince dış servis bağımlılıklarının soyutlanması ve test edilen birimlerin yalıtılması prensibine hizmet eder.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, test yardımcı fonksiyonları içerir. Aşağıdaki varsayımlar fonksiyon imzalarından çıkarılmıştır.

[Aksiyom 1]: Eğer `stubClient` çağrısında `tables` parametresi geçilmezse veya `Record<string, unknown[]>` yapısına uymazsa, stub istemci tablo verilerini doğru şekilde simüle edemez.

[Aksiyom 2]: Eğer `stubClient` çağrısında `totalCount` parametresi geçilmezse, stub istemcinin toplam kayıt sayısı bilinmez ve sayfalama/sayı hesaplama testleri tutarsız çalışır.

[Aksiyom 3]: Eğer `stubClient`'e `pages` parametresi geçilmezse (opsiyonel parametre), modül varsayılan bir sayfalama davranışıyla çalışmalıdır; bu durumun sonucu implementasyona bağlıdır (bilinmiyor).

[Aksiyom 4]: Eğer `readField` fonksiyonunda `source` parametresi `null` veya `undefined` ise ve `key` geçerli bir alan adı ise, fonksiyon `undefined` veya hata döndürür.

[Aksiyom 5]: Eğer `readField` fonksiyonunda `key` boş string (`""`) olarak geçilirse, okunacak alan belirsiz olur ve sonucu belirsizdir.

[Aksiyom 6]: `PRODUCT_ROW` sabiti bir nesne (object) olarak tanımlıdır; bu sabitin testlerde beklenen ürün verisi yapısını temsil ettiği varsayılır.

---

**Not:** Aksiyom 5'te belirtildiği gibi `readField`'in empty string `key` durumundaki davranışı fonksiyon imzasından anlaşılamamaktadır (bilinmiyor). Benzer şekilde `totalCount`'ın veri tipi imzada belirtilmemiştir (bilinmiyor).

---

## FONKSİYON DETAYLARI

### stubClient
**Ne yapar**: Bu fonksiyon, Supabase ile yapılan veritabanı işlemlerini test edebilmek için sahte (mock) bir istemci oluşturur. Gerçek bir ağ isteği yapmak yerine, önceden tanımlanmış test verilerini döndüren bir fetch fonksiyonu sağlayarak_Unit test_lerin deterministik ve izole olmasını sağlar.

**Nasıl yapar**: Fonksiyon, bir `fakeFetch` fonksiyonu tanımlar. Bu sahte fetch, her gelen isteği yakalayarak (`calls` dizisine kaydeder) ve URL'deki tablo adını analiz ederek, `tables` nesnesinden veya `pages` parametresinden ilgili verileri döndürür. `pages` parametresi verildiğinde, her istek için bir sonraki sayfayı otomatik olarak sunarak sayfalama senaryolarını test etmeye olanak tanır. Son olarak, `@supabase/supabase-js`'in `createClient` metodunu çağırarak, bu `fakeFetch`'i `global.fetch` olarak enjekte eden ve oturum yönetimini devre dışı bırakan bir Supabase istemcisi oluşturur.

**Parametreler**:
- `tables`: `Record<string, unknown[]>` — Tablo adlarını (anahtar) ve her tablodaki satırların bir dizisini (değer) eşleştiren nesne. Her istek için `fakeFetch`, URL'den çıkan tablo adına karşılık gelen satırları döndürür.
- `totalCount`: `number` — `content-range` yanıt başlığında kullanılacak toplam kayıt sayısını belirtir. Varsayılan değer `0`'dır.
- `pages`: `Record<string, unknown[][]>` (opsiyonel) — Belirli bir tablo için ardışık sayfalı yanıtları tutan nesnenin yerleşik bir sürümü. Bir tablonun bu listede olması durumunda, `fakeFetch` her istek için sırasıyla bir sonraki sayfa dizisini (satır grubunu) döndürerek gerçekçi sayfalama akışını simüle eder.

**Dönüş**: `StubResult` nesnesi döndürür. Bu nesne iki alan içerir: `supabase`, sahte fetch ile yapılandırılmış `SupabaseClient` instance'ı; `calls`, test süresince `fakeFetch` tarafından yakalanan tüm isteklerin bir dizisi (`CapturedRequest[]` tipinde). Bu sayede testler hem veri alışverişini doğrulayabilir hem de hangi isteklerin atıldığını analiz edebilir.

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
- **params**: `tables: Record<string, unknown[]>` (tablo adı → satır dizisi), `totalCount = 0` (content-range toplam satır sayısı), `pages?: Record<string, unknown[][]>` (çoklu sayfalama senaryosu için tablo → sayfa listesi)
- **ic_degiskenler**:
  - `calls` — yakalanan tüm HTTP isteklerinin dizisi; her eleman method, url, body, headers içerir
  - `pageCursor` — her tablo için sayaç; sayfalı testlerde sıradaki sayfaya geçmek için kullanılır
  - `fakeFetch` — Supabase client'a enjekte edilen sahte fetch fonksiyonu; gerçek HTTP çağrısı yapmaz
  - `href` — input'tan (string | URL | Request).href) normalize edilmiş URL stringi
  - `method` — HTTP methodu, tanımsızsa `'GET'` varsayılır
  - `headers` — istek header'larını küçük harfe normalize ederek tutan nesne
  - `rawBody` — request body'si; string ise JSON.parse ile çözümlenir, değilse null
  - `table` — URL path'inin son segmentinden çıkarılan tablo adı (ör. `products`, `brands`)
  - `pageList` — `pages` map'inden tablo adına karşılık gelen sayfalı veri listesi (varsa)
  - `index` — `pageCursor[table]` değerinden okunan mevcut sayfa indeksi
  - `rows` — tablonun actual satırları; sayfalama varsa `pageList[index]`, yoksa `tables[table]`
  - `wantsSingleObject` — `accept` header'da `pgrst.object` içerip içermediği (tek kayıt bekleyen sorgular için)
  - `payload` — stub'un döndürüceği veri; `wantsSingleObject` ise `rows[0] ?? null`, değilse tüm `rows` dizisi
  - `supabase` — `createClient<Database>` ile oluşturulan stub Supabase client; `fakeFetch` enjekte edilir
- **Dönüş**: `{ supabase, calls }` — stub client ve yakalanan istekler dizisi

---

### [N2_NASIL] AST Pointer: `__tests__/pricingAdmin.service.test.ts`::readField
- **params**: `source: unknown` (okunacak nesne), `key: string` (alan adı)
- **ic_degiskenler**:
  - `record` — source'un shallow copy'si (`{ ...source }`) olarak `Record<string, unknown>` türüne düzeltilir
- **Dönüş**: `record[key]` (source nesne ve key mevcutsa) veya `undefined`

---

## NODE ID STANDARD

  file: src\lib\services\__tests__\pricingAdmin.service.test.ts
  function: src\lib\services\__tests__\pricingAdmin.service.test.ts::stubClient
  function: src\lib\services\__tests__\pricingAdmin.service.test.ts::readField

---

## DISA AKTARILANLAR (EXPORTS)
  export: readField
  export: stubClient