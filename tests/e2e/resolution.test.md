---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\tests\e2e\resolution.test.ts
skeleton_hash: 8c3b22aa84b4ed2b
entity_hashes:
  func:resolutionMiddleware: c73c86b904ae0f2c
  func:resolveTenant: 4cfdd29908363a4f
  overview: 4384ea4c05f2d639
generated_at: 2026-08-25T07:34:31Z
---

## Genel Bakış
Bu modül, tenant (kiracı) çözümleme sürecinin uçtan uca testlerini içeren bir test dosyasıdır. Modülde, bir HTTP isteğinden tenant bilgisini çıkaran `resolveTenant` fonksiyonu ve bu çözümlemeyi ara katman (middleware) olarak sunan `resolutionMiddleware` fonksiyonu yer almaktadır.

## Fonksiyon Grupları

### Tenant Çözümleme
Gelen HTTP isteklerinden tenant kimliğini çıkarmakla sorumludur. `resolveTenant` fonksiyonu istek nesnesini alır ve tenant kimliğini ya da bir hata bilgisini döndürür; `resolutionMiddleware` ise bu çözümlemeyi Next.js ortamına uygun bir ara katman olarak paketler ve yanıt üretir.
- resolveTenant, resolutionMiddleware

---

## AXIOMS – Mimari Varsayımlar

Bu modül, gelen isteklerdeki kiracı (tenant) bilgisini çözümleyen bir middleware içerir.

[Aksiyom 1]: Eğer `TENANT_REGISTRY` sabiti tanımlı veya erişilebilir değilse, `resolveTenant` fonksiyonu kiracıyı çözümleyemez ve muhtemelen hata döndürür.

[Aksiyom 2]: Eğer gelen `NextRequest` nesnesinde kiracıyı tanımlayacak bilgi yoksa, `resolveTenant` fonksiyonu `{ tenantId: null }` döndürür.

[Aksiyom 3]: Eğer `resolveTenant` fonksiyonu bir hata durumu döndürürse, `resolutionMiddleware` bu hatayı işleyerek uygun bir `NextResponse` üretir.

---

## FONKSİYON DETAYLARI

### resolveTenant
**Ne yapar**: Gelen HTTP isteğinin `host` başlığını analiz ederek hangi kiracıya (tenant) ait olduğunu belirler. Geliştirme modunda localhost erişimlerinde varsayılan kiracıya yönlendirir, özel alan adı eşleştirmesi yapar, alt alan adından kiracı kimliği çıkarır ve hiçbir eşleşme bulunamazsa varsayılan kiracıya düşer.

**Nasıl yapar**: Fonksiyon öncelikle isteğin `host` başlığını alır. Geliştirme ortamında (`NODE_ENV === 'development'`) ve localhost adresinden geliniyorsa doğrudan `'default'` kiracı kimliğini döndürerek statik fallback bypass uygular. Host başlığı boşsa hata döndürür. Ardından host değerini küçük harfe çevirip boşlukları temizleyerek normalize eder. İlk olarak `TENANT_REGISTRY` dizisi içinde özel alan adı (`customDomain`) eşleşmesi arar; eşleşen kiracının durumu `'suspended'` ise hata, değilse kiracı kimliğini döndürür. Özel alan adı bulunamazsa, host'tan port bilgisini ayırır ve hostname'i nokta ile parçalayarak alt alan adı çıkarımı yapar. Birden fazla seviyeli alan adlarında (örneğin `engineering.venthub.local`) ilk parçayı alt alan adı olarak kabul eder. Alt alan adında harf, rakam ve tire dışında karakter varsa `'Malformed Subdomain'` hatası döndürür. Geçerli alt alan adı için `TENANT_REGISTRY` içinde eşleşme arar; askıya alınmış kiracılar için hata, diğerleri için kiracı kimliği döndürür. Hiçbir eşleşme bulunamazsa `'default'` kiracı kimliğini döndürür.

**Parametreler**:
- req: NextRequest — Kiracı çözümlemesi yapılacak gelen HTTP isteği nesnesi. İsteğin `host` başlığına erişim sağlar.

**Dönüş**: `{ tenantId: string | null; error?: string }` — Kiracı kimliğini (`tenantId`) ve opsiyonel hata mesajını (`error`) içeren nesne. Başarılı çözümlemede `tenantId` bir string değer alır ve `error` tanımsız kalır. Hata durumunda `tenantId` null olur ve `error` alanına ilgili hata mesajı yazılır (`'Empty Host Header'`, `'Tenant Suspended'`, `'Malformed Subdomain'`).

### resolutionMiddleware
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ./helpers/mockRequest::MockNextResponse
- import: ./helpers/mockRequest::createMockRequest
- import: next/server::NextRequest
- import: next/server::NextResponse
- import: vitest::afterEach
- import: vitest::beforeEach
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## INTERFACES

### TenantConfig
- `id: string`
- `subdomain: string`
- `customDomain?: string`
- `status: 'active' | 'suspended'`

---

## SABİTLER
- **TENANT_REGISTRY** (array) — `[
  { id: 'tenant-eng-123', subdomain: 'engineering', status: 'active' },
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/resolution.test.ts::resolveTenant
- **params**: `req: NextRequest`
- **ic_degiskenler**:
  - `host` — `req.headers.get('host')` sonucu; tanımsızsa boş string atanır
  - `isDev` — `process.env.NODE_ENV` değerinin `'development'` olup olmadığını kontrol eden boolean
  - `isLocalhost` — `host` değişkeninin `localhost` veya `127.0.0.1` ile başlayıp başlamadığını kontrol eden boolean
  - `cleanHost` — `host` değerinin `toLowerCase()` ve `trim()` uygulanmış hali; büyük/küçük harf duyarsızlaştırma ve boşluk temizleme için kullanılır
  - `customMatch` — `TENANT_REGISTRY` dizisi üzerinde `t.customDomain` alanının `cleanHost` ile eşleştiği ilk öğe; bulunamazsa `undefined`
  - `parts` — `cleanHost` değerinin `:` karakteriyle split edilmiş dizisi; port numarasını kaldırmak için kullanılır
  - `hostname` — `parts[0]`; port kaldırılmış ana bilgisayar adı
  - `domainParts` — `hostname` değerinin `.` karakteriyle split edilmiş dizisi; seviye sayısını belirlemek için kullanılır
  - `subdomain` — `domainParts[0]`; çok seviyeli domain yapısında ilk parça olarak alt alan adı
  - `subMatch` — `TENANT_REGISTRY` dizisi üzerinde `t.subdomain` alanının `subdomain` ile eşleştiği ilk öğe; bulunamazsa `undefined`
- **Dönüş**: `{ tenantId: string | null; error?: string }` — `tenantId` çözümlenmiş kiracı kimliği (bulunamazsa `'default'`), `error` ise hata durumunda açıklayıcı mesaj

### [N2_NASIL] AST Pointer: tests/e2e/resolution.test.ts::resolutionMiddleware
- **params**: `req: NextRequest`
- **ic_degiskenler**:
  - `tenantId` — `resolveTenant(req)` çağrısından destructure edilen kiracı kimliği; `null` olabilir
  - `error` — `resolveTenant(req)` çağrısından destructure edilen hata mesajı; tanımsız olabilir
  - `headers` — `req.headers` kopyasıyla oluşturulan yeni `Headers` nesnesi; `tenantId` varsa `x-tenant-id` header'ı eklenir
  - `res` — `MockNextResponse.next({ request: { headers } })` ile oluşturulan yanıt nesnesi; `tenantId` varsa `tenant_id` cookie'si ayarlanır
- **Dönüş**: `Promise<NextResponse>` — hata durumunda JSON hata yanıtı (403 veya 400 durum koduyla), başarılı durumda `x-tenant-id` header'ı ve `tenant_id` cookie'si eklenmiş yanıt

---

## NODE ID STANDARD

  file: resolution.test.ts
  function: resolution.test.ts::resolveTenant
  function: resolution.test.ts::resolutionMiddleware

---

## DISA AKTARILANLAR (EXPORTS)
  export: resolutionMiddleware
  export: resolveTenant