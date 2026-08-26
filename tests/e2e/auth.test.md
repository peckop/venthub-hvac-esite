---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\tests\e2e\auth.test.ts
skeleton_hash: fc316514361075bb
entity_hashes:
  func:mockUserResolver: 8f21d196d928fe6d
  overview: 14a9be75ba3e74c1
generated_at: 2026-08-25T07:35:56Z
---

## Genel Bakış

`auth.test.ts`, `tests/e2e` dizininde yer alan kimlik doğrulama (authentication) ile ilgili uçtan uca test dosyasıdır. Modül, test ortamında kullanıcı çözücü (user resolver) davranışını taklit etmek için bir yardımcı fonksiyon içerir.

## Fonksiyon Grupları

### Test Yardımcıları (Mock Fonksiyonlar)

Test senaryolarında bağımlılıkları taklit etmek için kullanılan fabrika fonksiyonlarını tanımlar. Bu fonksiyon, kullanıcı çözme mantığının kontrollü bir şekilde test edilmesini sağlar.

- mockUserResolver

## Bağımlılıklar ve Mimari Notlar

- Modülde tanımlı tek fonksiyon `mockUserResolver` olup, çağrılan başka fonksiyon bilgisi verilmemiştir.
- Dış bağımlılıklar ve dinamik yüklenen modüller hakkında kaynakta bilgi bulunmamaktadır.
- Bu dosya yalnızca test amaçlıdır; üretim koduna dahil değildir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir; yalnızca `mockUserResolver` fonksiyonunun imzası mevcuttur. Kurallar gereği aksiyomlar yalnızca fonksiyon gövdesinden türetilir. Gövde olmadan bu modülün doğru çalışması için hangi koşulların gerekli olduğunu belirlemek mümkün değildir.

---

## FONKSİYON DETAYLARI

### mockUserResolver
**Ne yapar**: Kimlik doğrulama middleware'inin geçersiz token durumunda kullanıcıyı doğru şekilde login sayfasına yönlendirip yönlendirmediğini test eden bir test fonksiyonudur. Geçersiz token imzası senaryosunu simüle ederek middleware davranışını doğrular.

**Nasıl yapar**: Fonksiyon önce kendisini yeniden tanımlayarak `user: null` ve `error: { message: 'Invalid token signature' }` döndürecek hale getirir. Bu sayede sonraki çağrılarda geçersiz token senaryosu simüle edilmiş olur. Ardından `createMockRequest` ile `engineering.venthub.local/admin/billing` adresine yönelik sahte bir istek oluşturur ve `host` header'ını ayarlar. Bu sahte isteği `middleware` fonksiyonuna geçirerek yanıtı alır. Son olarak yanıtın HTTP 302 durum kodu döndürdüğünü ve `location` header'ının `/auth/login` içerdiğini doğrular.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: `() => { user: any; error: any }` — Fonksiyon çağrıldığında, `user` ve `error` alanlarını içeren bir nesne döndüren bir fonksiyon üretir. `user` alanı null olduğunda kullanıcı oturum açmamış sayılır; `error` alanı ise hata mesajını içerir.

---

## İTHALATLAR (IMPORTS)
- import: ./helpers/mockRequest::MockNextResponse
- import: ./helpers/mockRequest::createMockRequest
- import: @/middleware::middleware
- import: next/server::NextRequest
- import: next/server::NextResponse
- import: vitest::afterEach
- import: vitest::beforeEach
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/auth.test.ts::beforeEach callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok
- **Açıklama**: Vitest beforeEach kancası. `vi.stubEnv` ile `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NODE_ENV` ve `JWT_CLAIMS_COOKIE_SECRET` ortam değişkenlerini test öncesi tanımlar.

### [N2_NASIL] AST Pointer: tests/e2e/auth.test.ts::afterEach callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok
- **Açıklama**: Vitest afterEach kancası. `vi.unstubAllEnvs()` ile ortam değişkeni taklitlerini, `vi.restoreAllMocks()` ile mock'ları sıfırlar.

### [N3_NASIL] AST Pointer: tests/e2e/auth.test.ts::mockUserResolver default
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: string, user_metadata: { role: string }, app_metadata: { tenant_id: string } }, error: null }`
- **Açıklama**: `mockUserResolver` değişkenine atanan varsayılan ok fonksiyonu. Varsayılan admin kullanıcı nesnesi ve null hata döndürür.

### [N4_NASIL] AST Pointer: tests/e2e/auth.test.ts::createServerClient factory
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ createServerClient: () => { auth: { getUser, getClaims, getSession } } }`
- **Açıklama**: `@supabase/ssr` modülünü taklit eder. `createServerClient` fonksiyonu döndüren bir fabrika fonksiyonudur. Dönen nesne `auth` altında `getUser`, `getClaims`, `getSession` asenkron metodlarını içerir.

### [N5_NASIL] AST Pointer: tests/e2e/auth.test.ts::Auth object factory
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ auth: { getUser: async Function, getClaims: async Function, getSession: async Function } }`
- **Açıklama**: Supabase istemci `auth` nesnesini taklit eder. `getUser`, `getClaims` ve `getSession` asenkron metodlarını içerir; her biri `mockUserResolver()` çağrısının sonucuna göre yanıt üretir.

### [N6_NASIL] AST Pointer: tests/e2e/auth.test.ts::getUser (mock)
- **params**: yok
- **ic_degiskenler**:
  - `res` — `mockUserResolver()` çağrısının döndürdüğü `{ user, error }` nesnesi; hata varsa `{ data: { user: null }, error: res.error }`, yoksa `{ data: { user: res.user }, error: null }` döndürülür
- **Dönüş**: `{ data: { user: any }, error: any }`
- **Açıklama**: Supabase `auth.getUser` metodunu taklit eder. `mockUserResolver()` sonucuna göre kullanıcı veya hata döndürür.

### [N7_NASIL] AST Pointer: tests/e2e/auth.test.ts::getClaims (mock)
- **params**: yok
- **ic_degiskenler**:
  - `res` — `mockUserResolver()` çağrısının döndürdüğü `{ user, error }` nesnesi
- **Dönüş**: `{ data: { claims: { user_role: string, app_metadata: object, user_metadata: object } }, error: null }` veya `{ data: null, error: any }`
- **Açıklama**: Supabase `auth.getClaims` metodunu taklit eder. Hata varsa hata döndürür, kullanıcı yoksa null döndürür, aksi halde `user.user_metadata.role`, `user.app_metadata` ve `user.user_metadata` alanlarından oluşan claims nesnesi döndürür.

### [N8_NASIL] AST Pointer: tests/e2e/auth.test.ts::getSession (mock)
- **params**: yok
- **ic_degiskenler**:
  - `res` — `mockUserResolver()` çağrısının döndürdüğü `{ user, error }` nesnesi
  - `payload` — `user_role`, `app_metadata`, `user_metadata` alanlarından oluşan JWT payload nesnesi
  - `base64` — `JSON.stringify(payload)` sonucunun base64 kodlanmış hali; `=`, `+`, `/` karakterleri URL-safe hale getirilir
  - `token` — `header.${base64}.signature` formatında oluşturulmuş sahte JWT token string'i
- **Dönüş**: `{ data: { session: { access_token: string, user: any } }, error: null }` veya `{ data: { session: null }, error: any }`
- **Açıklama**: Supabase `auth.getSession` metodunu taklit eder. Kullanıcı varsa, claims bilgisini base64 kodlayarak sahte bir JWT access_token üretir ve session nesnesiyle birlikte döndürür.

### [N9_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 0 callback (fail-closed)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/orders`, host header `engineering.venthub.local`, cookie `sb_access_token: 'valid-jwt'`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: `JWT_CLAIMS_COOKIE_SECRET` boş string olarak ayarlandıktan sonra, geçerli admin oturumu olsa bile middleware'in 302 durum koduyla `auth_error=server_misconfigured` içeren bir yere yönlendirmesi gerektiğini doğrular. FAIL-CLOSED güvenlik davranışını test eder.

### [N10_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 0 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: 'user-admin-1', user_metadata: { role: 'admin' }, app_metadata: { tenant_id: 'tenant-eng-123' } }, error: null }`
- **Açıklama**: Test 0 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Admin rolüne sahip kullanıcı nesnesi döndürür.

### [N11_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 1 callback (admin access grant)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/orders`, host header `engineering.venthub.local`, cookie `sb_access_token: 'valid-jwt'`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: Geçerli JWT, admin rolü ve doğru tenant claim'ine sahip kullanıcının admin rotasına erişiminin 200 durum koduyla ve yönlendirme olmadan onaylanması gerektiğini doğrular.

### [N12_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 1 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: 'user-admin-1', user_metadata: { role: 'admin' }, app_metadata: { tenant_id: 'tenant-eng-123' } }, error: null }`
- **Açıklama**: Test 1 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Admin rolüne sahip kullanıcı nesnesi döndürür.

### [N13_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 2 callback (RBAC roles)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/inventory`, host header `engineering.venthub.local`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: sales, warehouse, viewer gibi yetkili RBAC rollerine sahip kullanıcıların admin rotalarına erişiminin 200 durum koduyla onaylanması gerektiğini doğrular.

### [N14_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 2 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: 'user-sales-1', user_metadata: { role: 'sales' }, app_metadata: { tenant_id: 'tenant-eng-123' } }, error: null }`
- **Açıklama**: Test 2 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Sales rolüne sahip kullanıcı nesnesi döndürür.

### [N15_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 3 callback (unauthenticated redirect)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/settings`, host header `engineering.venthub.local`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: Kimliği doğrulanmamış isteklerin 302 durum koduyla `/auth/login` sayfasına, `from` parametresi orijinal URL'i içerecek şekilde yönlendirilmesi gerektiğini doğrular.

### [N16_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 3 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: null, error: { message: 'No active session' } }`
- **Açıklama**: Test 3 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Aktif oturum olmadığını belirten hata döndürür.

### [N17_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 4 callback (expired session)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/dashboard`, host header `engineering.venthub.local`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: Oturum var ancak süresi dolmuşsa, login yönlendirmesine `reason=expired` parametresinin eklenmesi gerektiğini doğrular.

### [N18_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 4 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: null, error: { message: 'JWT expired', status: 401 } }`
- **Açıklama**: Test 4 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. JWT süresinin dolduğunu belirten 401 hata nesnesi döndürür.

### [N19_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 5 callback (signup flow)
- **params**: yok
- **ic_degiskenler**:
  - `secureMetadata` — `handleUserSignup` fonksiyonunun dönüşünden gelen güvenli metadata nesnesi; `tenant_id` ve `role` alanlarını içerir
  - `userProfile` — `handleUserSignup` fonksiyonunun dönüşünden gelen kullanıcı profili nesnesi; `id`, `email`, `tenant_id`, `role`, `created_at` alanlarını içerir
- **Dönüş**: yok
- **Açıklama**: Kayıt akışında `app_metadata` claims senkronizasyonunu ve tenant bağlı kullanıcı profili oluşturulmasını test eder. `handleUserSignup` fonksiyonunu çağırarak `secureMetadata.tenant_id`, `userProfile.role` ve `userProfile.tenant_id` değerlerini doğrular.

### [N20_NASIL] AST Pointer: tests/e2e/auth.test.ts::handleUserSignup
- **params**: `email` (string), `targetTenantId` (string), `requestedRole` (string)
- **ic_degiskenler**:
  - `secureMetadata` — `tenant_id` olarak `targetTenantId`, `role` olarak `requestedRole`'u (eğer `super_admin` ise `customer`'a düşürülür) içeren nesne
  - `userProfile` — `id: 'new-uid-999'`, `email`, `tenant_id: secureMetadata.tenant_id`, `role: secureMetadata.role`, `created_at: new Date().toISOString()` alanlarını içeren kullanıcı profili nesnesi
- **Dönüş**: `{ secureMetadata: { tenant_id: string, role: string }, userProfile: { id: string, email: string, tenant_id: string, role: string, created_at: string } }`
- **Açıklama**: Kayıt servisi davranışını simüle eder. `requestedRole` `super_admin` ise `customer`'a düşürerek self-elevation saldırısını engeller. RLS kontrolü ve profil ilişkilendirmesi zorlar.

### [N21_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 6 callback (customer rejection)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/settings`, host header `engineering.venthub.local`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: Rolü `customer` olan kullanıcının admin rotalarına erişiminin reddedilip 302 durum koduyla `https://engineering.venthub.local/?auth_error=unauthorized` adresine yönlendirilmesi gerektiğini doğrular.

### [N22_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 6 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: 'user-customer-1', user_metadata: { role: 'customer' }, app_metadata: { tenant_id: 'tenant-eng-123' } }, error: null }`
- **Açıklama**: Test 6 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Customer rolüne sahip kullanıcı nesnesi döndürür.

### [N23_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 7 callback (missing role)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/logs`, host header `engineering.venthub.local`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: JWT geçerli ancak role claim'i tamamen eksikse, 302 durum koduyla `https://engineering.venthub.local/?auth_error=unauthorized` adresine yönlendirilmesi gerektiğini doğrular.

### [N24_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 7 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: 'user-no-role', user_metadata: {}, app_metadata: { tenant_id: 'tenant-eng-123' } }, error: null }`
- **Açıklama**: Test 7 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. `user_metadata` içinde `role` alanı olmayan kullanıcı nesnesi döndürür.

### [N25_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 8 callback (malformed JWT)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/billing`, host header `engineering.venthub.local`
  - `res` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: JWT imzası sözdizimsel olarak bozuksa, kimlik doğrulamanın başarısız olup 302 durum koduyla `/auth/login` sayfasına yönlendirilmesi gerektiğini doğrular.

### [N26_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 8 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: null, error: { message: 'Invalid token signature' } }`
- **Açıklama**: Test 8 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Geçersiz token imzası hatası döndürür.

### [N27_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 9 callback (tampering protection)
- **params**: yok
- **ic_degiskenler**:
  - `currentClaims` — mevcut JWT claims nesnesi; `id: 'user-123'`, `app_metadata: { tenant_id: 'tenant-eng-123', role: 'admin' }`, `user_metadata: { displayName: 'John' }`
  - `maliciousUpdate` — kötü niyetli güncelleme denemesi; `app_metadata: { tenant_id: 'tenant-attacker', role: 'super_admin' }`, `user_metadata: { displayName: 'Hacked', role: 'super_admin' }`
  - `updatedClaims` — `secureProfileUpdate('user-123', maliciousUpdate, currentClaims)` çağrısının dönüşü
- **Dönüş**: yok
- **Açıklama**: İstemci tarafından gelen ham profil güncellemelerinin `app_metadata` alanını değiştirememesi gerektiğini doğrular. `app_metadata` değişmez kalırken `user_metadata` güncellenebilir.

### [N28_NASIL] AST Pointer: tests/e2e/auth.test.ts::secureProfileUpdate
- **params**: `userId` (string), `requestedProfilePatch` (any), `currentUserJwtClaims` (any)
- **ic_degiskenler**:
  - `finalClaims` — `currentUserJwtClaims`'ın spread edilmiş hali; `app_metadata` orijinal `currentUserJwtClaims.app_metadata`'dan korunur (değiştirilmez), `user_metadata` ise `currentUserJwtClaims.user_metadata` ile `requestedProfilePatch.user_metadata` birleştirilerek güncellenir
- **Dönüş**: `{ app_metadata: object, user_metadata: object, ...currentUserJwtClaims }` (object)
- **Açıklama**: Dinamik profil güncellemesi güvenlik korumasını simüle eder. `app_metadata` istemci/profil güncellemelerinden korunur (immutable), yalnızca `user_metadata` güncellenmesine izin verilir.

### [N29_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 10 callback (cross-tenant hijacking)
- **params**: yok
- **ic_degiskenler**:
  - `req` — `createMockRequest` ile oluşturulan `NextRequest` nesnesi; URL `https://engineering.venthub.local/admin/settings`, host header `engineering.venthub.local`
  - `res` — `await secureMiddleware(req)` çağrısının döndürdüğü yanıt nesnesi
- **Dönüş**: yok
- **Açıklama**: Tenant A'nın geçerli kullanıcısının Tenant B'nin admin sayfalarına erişmeye çalışması durumunda, middleware'in `user.app_metadata.tenant_id` ile çözümlenen tenant'ı eşleştirerek oturum kaçırma saldırısını engellemesi gerektiğini doğrular. 302 durum koduyla `auth_error=unauthorized` parametresi beklenir.

### [N30_NASIL] AST Pointer: tests/e2e/auth.test.ts::Test 10 mockUserResolver assignment
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: `{ user: { id: 'user-tenant-a', user_metadata: { role: 'admin' }, app_metadata: { tenant_id: 'tenant-a-123' } }, error: null }`
- **Açıklama**: Test 10 sırasında `mockUserResolver` değişkenine atanan ok fonksiyonu. Tenant A'ya ait admin kullanıcısı döndürür.

### [N31_NASIL] AST Pointer: tests/e2e/auth.test.ts::secureMiddleware
- **params**: `req` (NextRequest)
- **ic_degiskenler**:
  - `baseRes` — `await middleware(req)` çağrısının döndürdüğü yanıt nesnesi
  - `resolvedTenantId` — `'tenant-b-456'` sabit string; test senaryosunda `engineering.venthub.local` host'undan çözümlenen tenant ID'yi temsil eder
  - `claims` — `mockUserResolver().user?.app_metadata` ifadesi; kullanıcının `app_metadata` nesnesi
  - `redirectUrl` — `req.nextUrl.clone()` ile oluşturulan klonlanmış URL nesnesi; `pathname` `'/'` olarak ayarlanır, `auth_error` search parametresi `'unauthorized'` olarak eklenir
- **Dönüş**: NextResponse
- **Açıklama**: Çapraz tenant oturum kaçırma doğrul

---

## NODE ID STANDARD

  file: auth.test.ts
  function: auth.test.ts::mockUserResolver

---

## DISA AKTARILANLAR (EXPORTS)
  export: mockUserResolver