---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\lib\__tests__\errorReporter.test.ts
skeleton_hash: 360123e14fdd4eb2
entity_hashes:
  func:loadReporter: 8ac6c92a2734a0ad
  func:parseBody: 1d57c32ed40332c2
  overview: 790af11e0a6b5928
generated_at: 2026-08-25T07:29:10Z
---

## Genel Bakış
Bu modül, errorReporter bileşeninin test dosyasıdır. Test ortamında errorReporter modülünün yüklenmesi ve test senaryolarında kullanılan verilerin ayrıştırılması için yardımcı fonksiyonlar içerir.

## Fonksiyon Grupları

### Test Yardımcı Fonksiyonları
Test süreçlerinde errorReporter'ın yüklenmesi ve test verilerinin yapılandırılması için kullanılan yardımcı fonksiyonlardır.
- loadReporter, parseBody

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### loadReporter
**Ne yapar**: Her test çalıştırılmasında modül düzeyindeki de-dup (tekrar engelleme) durumunu sıfırlayarak taze bir `errorReporter` modülü import eder ve bu modülün `reportError` fonksiyonunu döndürür. Test izolasyonunu sağlamak amacıyla kullanılır.

**Nasıl yapar**: Asenkron bir fonksiyondur. Önce `vi.resetModules()` çağrısı yaparak Vitest'in modül önbelleğini sıfırlar. Ardından `'../errorReporter'` modülünü dinamik olarak `import()` ile yükler. Yüklenen modül nesnesinin `reportError` özelliğini döndürür. Bu sayede her test çağrısında modülün başlangıç durumu korunmuş olur.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `Promise<typeof mod.reportError>` — Asenkron olarak yüklenen `errorReporter` modülündeki `reportError` fonksiyonunu döndürür. Dönüş tipi, modülün dışa aktardığı `reportError` fonksiyonunun tipidir.

### parseBody
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::afterEach
- import: vitest::beforeEach
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## SABİTLER
- **ENDPOINT** (template) — ``${SUPABASE_URL}/functions/v1/log-client-error``

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::loadReporter
- **params**: yok
- **ic_degiskenler**:
  - `mod` — `../errorReporter` modülünün dinamik import sonucu elde edilen nesne; `vi.resetModules()` çağrısından sonra `await import('../errorReporter')` ile yüklenir
- **Dönüş**: `mod.reportError` — errorReporter modülündeki `reportError` fonksiyonu

### [N2_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::parseBody
- **params**: `call` — `unknown[]` tipinde, `fetchMock.mock.calls[0]` gibi bir fetch çağrı dizisi
- **ic_degiskenler**:
  - `init` — `call[1]` değerinin `RequestInit` tipine cast edilmiş hali; fetch çağrısının ikinci argümanı (istek yapılandırması)
- **Dönüş**: `Record<string, unknown>` — `init.body` string değerinin `JSON.parse` ile ayrıştırılması sonucu oluşan nesne

### [N3_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim arrow — supabaseBrowserClient mock factory)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `supabaseBrowserClient` nesnesi — `auth.getSession` metodu `vi.fn(async () => ...)` ile mocklanmış, `{ data: { session: { access_token: 'user-access-token' } }, error: null }` döndüren bir yapı

### [N4_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — getSession mock)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ data: { session: { access_token: 'user-access-token' } }, error: null }` — Supabase oturum yanıtını simüle eden nesne

### [N5_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim arrow — beforeEach callback, dış kapsam)
- **params**: yok
- **ic_degiskenler**:
  - `consoleWarnMock` — `vi.spyOn(console, 'warn').mockImplementation(() => {})` ile oluşturulan, `console.warn` çağrılarını yakalayan mock
  - `fetchMock` — `vi.fn(async () => new Response('ok', { status: 200 }))` ile oluşturulan, fetch API'sini simüle eden mock fonksiyon
- **Dönüş**: yok — yan etki olarak `vi.stubGlobal('fetch', fetchMock)`, `vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)`, `vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ANON_KEY)` çağrılarını yapar

### [N6_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim arrow — afterEach callback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak `vi.restoreAllMocks()`, `vi.unstubAllEnvs()`, `vi.unstubAllGlobals()` çağrılarını yapar

### [N7_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim arrow — "development davranışı" describe callback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — üç `it` bloğu tanımlar: "window tanımlıysa uyarır ve ağa hiçbir şey göndermez", "window tanımsızsa (SSR/RSC) hiçbir şey yapmaz", "Error olmayan değerleri throw etmeden işler"

### [N8_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "window tanımlıysa uyarır ve ağa hiçbir şey göndermez" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
  - `error` — `new Error('Test error')` ile oluşturulan hata nesnesi
  - `context` — `{ context: 'unit test' }` nesnesi, hata bağlamı olarak kullanılır
- **Dönüş**: yok — `consoleWarnMock`'ın `'[errorReporter]'`, `error`, `context` ile çağrıldığını ve `fetchMock`'ın çağrılmadığını doğrular

### [N9_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "window tanımsızsa (SSR/RSC) hiçbir şey yapmaz" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
- **Dönüş**: yok — `consoleWarnMock` ve `fetchMock`'ın çağrılmadığını doğrular

### [N10_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "Error olmayan değerleri throw etmeden işler" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
- **Dönüş**: yok — `reportError('Just a string', { id: 1 })` çağrısının throw etmediğini ve `consoleWarnMock`'ın doğru argümanlarla çağrıldığını doğrular

### [N11_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim arrow — "production davranışı" beforeEach callback)
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — yan etki olarak `vi.stubEnv('NODE_ENV', 'production')` ve `vi.stubGlobal('window', { location: { origin: 'https://venthub.example', pathname: '/tr/odeme/basarili' } })` çağrılarını yapar

### [N12_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "log-client-error uç noktasına sözleşmeye uygun POST atar" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
  - `call` — `fetchMock.mock.calls[0]`, fetch mock'unun ilk çağrısının argüman dizisi
  - `init` — `call[1]` değerinin `RequestInit` tipine cast edilmiş hali; istek yapılandırması
  - `body` — `parseBody(call)` sonucu, POST isteğinin JSON gövdesi; `env`, `extra`, `level`, `msg`, `release`, `stack`, `ua`, `url` alanlarını içerir
- **Dönüş**: yok — `call[0]`'ın `ENDPOINT` olduğunu, `init.method`'ın `'POST'` olduğunu, `init.keepalive`'ın `true` olduğunu, `init.headers`'ın doğru `Content-Type`, `apikey`, `Authorization` içerdiğini, `body` alanlarının zod şemasına uygun olduğunu doğrular

### [N13_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "URL query/hash göndermez, hassas context anahtarlarını eler" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
  - `body` — `parseBody(fetchMock.mock.calls[0])` sonucu, POST isteğinin JSON gövdesi
- **Dönüş**: yok — `body.url`'ın `'https://venthub.example/tr/hesabim'` (query ve hash olmadan) olduğunu, `'super-secret'`, `'a@b.com'`, `'4111111111111111'` değerlerinin body içinde bulunmadığını, `body.extra`'nın `{ source: 'unit-test', attempt: 2 }` olduğunu doğrular

### [N14_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "gönderim patlarsa çağıran etkilenmez (throw etmez)" test)
- **params**: yok
- **ic_degiskenler**:
  - `unhandled` — `vi.fn()` ile oluşturulan, `process.on('unhandledRejection', unhandled)` ile yakalanan reddedilmemiş promise'leri izleyen mock fonksiyon
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
- **Dönüş**: yok — `fetchMock`'ın `new Error('network down')` ile reddedildiğinde bile `reportError`'ın throw etmediğini ve `unhandled`'ın çağrılmadığını doğrular; test sonunda `process.off('unhandledRejection', unhandled)` ile temizlik yapar

### [N15_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "aynı hata tekrar edilirse yalnız bir kez gönderilir (de-dup), farklı hata gönderilir" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
  - `error` — `new Error('Loop error')` ile oluşturulan hata nesnesi; aynı referansla üç kez `reportError`'a gönderilir
- **Dönüş**: yok — aynı hata üç kez gönderildiğinde `fetchMock`'ın yalnızca bir kez çağrıldığını, farklı bir hata (`new Error('Different error')`) gönderildiğinde toplam çağrının ikiye çıktığını doğrular

### [N16_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "sayfa başına gönderim üst sınırını aşmaz" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
  - `i` — `for` döngü sayacı, 0'dan 49'a kadar değer alır; her iterasyonda benzersiz hata oluşturulur
- **Dönüş**: yok — 50 benzersiz hata gönderildiğinde `fetchMock`'ın en fazla 20 kez çağrıldığını doğrular

### [N17_NASIL] AST Pointer: src/lib/__tests__/errorReporter.test.ts::(anonim async arrow — "Supabase env değişkenleri yoksa sessizce vazgeçer" test)
- **params**: yok
- **ic_degiskenler**:
  - `reportError` — `await loadReporter()` sonucu, errorReporter modülündeki `reportError` fonksiyonu
- **Dönüş**: yok — `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` boş string olduğunda `reportError`'ın throw etmediğini ve `fetchMock`'ın çağrılmadığını doğrular

---

## NODE ID STANDARD

  file: errorReporter.test.ts
  function: errorReporter.test.ts::loadReporter
  function: errorReporter.test.ts::parseBody

---

## DISA AKTARILANLAR (EXPORTS)
  export: loadReporter
  export: parseBody