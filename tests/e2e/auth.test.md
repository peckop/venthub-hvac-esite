---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\auth.test.ts
skeleton_hash: 1e2441e18601709c
entity_hashes:
  func:mockUserResolver: 8f21d196d928fe6d
  overview: 14a9be75ba3e74c1
generated_at: 2026-05-30T20:34:11Z
---

## Genel Bakış
Bu modül, kimlik doğrulama (authentication) süreçlerini test etmek için kullanılan bir uçtan uca (e2e) test dosyasıdır. Test senaryolarında gerçek kullanıcı çözücü (user resolver) fonksiyonlarını taklit ederek test ortamını hazırlamaya yardımcı olan mock fonksiyonları sağlar.

## Fonksiyon Grupları
### Mock Fonksiyonları ve Test Altyapısı
Test senaryoları sırasında gerçek kimlik doğrulama bağımlılıklarını (örn. kullanıcı bilgisi çeken servisler) taklit etmek için kullanılır. Bu, testlerin izole ve öngörülebilir olmasını sağlar.
- mockUserResolver

---

## AXIOMS – Mimari Varsayımlar

Bu modül için tanımlanmış fonksiyon gövdesi mevcut değildir; dolayısıyla mimari varsayımlar çıkarılamamıştır.

---

**Neden:**

Verilen kaynak (`auth.test.ts`) bir test dosyası olup, `mockUserResolver()` fonksiyonunun **gövdesi** paylaşılmamıştır. Sadece fonksiyon imzası (`mockUserResolver()`) mevcuttur ve bu imza:

| Bilgi | Durum |
|-------|-------|
| Parametre | Yok (boş imza) |
| Return tipi | Bilinmiyor |
| İç bağımlılıklar | Bilinmiyor |
| Atılan istisnalar | Bilinmiyor |
| Eşik değerleri | Bilinmiyor |

**Sonuç:** `mockUserResolver()` fonksiyonunun gövdesi sağlandığında, şu alanlarda aksiyom üretilebilir:

1. **Giriş koşulları** – Hangi parametreler/veriler zorunlu
2. **Çıkış garantisi** – Ne döndürüyor (mock user objesi, Promise mi, vs.)
3. **Bağımlılıklar** – Hangi servisleri/mockları tüketiyor
4. **Hata koşulları** – Hangi durumlarda hata/failure üretiyor

---

> ⚠️ **Not:** Fonksiyon gövdesi paylaşıldığında aksiyomlar üretilebilir. Mevcut bilgiyle **uydurma yapılmamıştır**.

---

## FONKSİYON DETAYLARI

### mockUserResolver
**Ne yapar**: Bu fonksiyon, test ortamında kimlik doğrulama (auth) akışını test etmek için kullanılan bir sahte (mock) kullanıcı çözümleyicisidir (resolver). Temel amacı, belirli bir hata senaryosunu simüle ederek ilgili middleware'lerin bu duruma verdiği tepkiyi doğrulamaktır.

**Nasıl yapar**: Fonksiyon, herhangi bir girdiye bakmaksızın her zaman sabit bir hata nesnesi içeren bir yanıt döndürür. Bu sabit yanıt, "geçersiz token imzası" hatasını temsil eder ve testlerde bu spesifik hata durumunun ele alınıp alınmadığını kontrol etmek için kullanılır.

**Parametreler**:
Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: `{ user: null; error: { message: string } }` nesnesi döndürür. `user` alanı `null` olarak sabitlenmiştir, `error` alanı ise içinde `message` anahtarı bulunan bir nesnedir. Bu yapı, tipik bir kullanıcı çözümleyicisinin başarısız olduğu durumu simüle eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: tests/e2e/auth.test.ts::beforeEach_setup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `vi` — vitest global mock/spy kontrol nesnesi, stubbedEnvs ve restoreAllMocks çağrıları için kullanılır
- **Dönüş**: yok (yan etki: ortam değişkenlerini stub eder)

### [N2_NASIL] AST Pointer: tests/e2e/auth.test.ts::afterEach_teardown
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `vi` — vitest global mock nesnesi, unstubAllEnvs ve restoreAllMocks çağrıları için kullanılır
- **Dönüş**: yok (yan etki: tüm stub'ları ve mock'ları temizler)

### [N3_NASIL] AST Pointer: tests/e2e/auth.test.ts::mockUserResolver_default
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — inline literal döndürür)
- **Dönüş**: `{ user: { id: string, user_metadata: { role: string }, app_metadata: { tenant_id: string } }, error: null }` — varsayılan mock kullanıcı nesnesi

### [N4_NASIL] AST Pointer: tests/e2e/auth.test.ts::createMockSupabaseClient
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `createServerClient` — inner fonksiyon, döndürülen objenin bir parçası; Supabase createServerClient'ın mock'u olarak tanımlanır
  - `auth` — nested obje, getUser metodunu barındırır
  - `getUser` — async fonksiyon, mockUserResolver'ı çağırıp user/error sonucunu döndürür
  - `res` — mockUserResolver() çağrısının dönüş değeri, `{ user, error }` yapısını tutar
- **Dönüş**: `{ createServerClient: () => { auth: { getUser: async () => ... } } }` — Supabase client mock yapısı

### [N5_NASIL] AST Pointer: tests/e2e/auth.test.ts::createServerClient_inner
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `auth` — nested obje, getUser metodunu barındırır
  - `getUser` — async fonksiyon, mockUserResolver'ı çağırıp sonucu şekillendirir
  - `res` — mockUserResolver() çağrısının dönüşü, `{ user, error }` tutar
- **Dönüş**: `{ auth: { getUser: async () => ... } }` — Supabase client auth mock'u

### [N6_NASIL] AST Pointer: tests/e2e/auth.test.ts::getUser_mock
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `res` — mockUserResolver() çağrısının dönüş değeri; user ve error alanlarını tutar
- **Dönüş**: `{ data: { user: User | null }, error: Error | null }` — Supabase auth.getUser uyumlu yanıt yapısı

### [N7_NASIL] AST Pointer: tests/e2e/auth.test.ts::describe_auth_main
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — her test case içinde yeniden atanarak middleware'e farklı kullanıcı senaryoları sunar
  - `it` — vitest test tanımı fonksiyonu, her bir senaryoyu tanımlar
  - `expect` — vitest assertion fonksiyonu, sonuçları doğrular
  - `createMockRequest` — helpers/mockRequest'ten import edilen, NextRequest oluşturma yardımcı fonksiyonu
  - `middleware` — @/middleware'den import edilen ana middleware fonksiyonu
  - `MockNextResponse` — helpers/mockRequest'ten import edilen mock response sınıfı
- **Dönüş**: yok (yan etki: test senaryolarını tanımlar ve çalıştırır)

### [N8_NASIL] AST Pointer: tests/e2e/auth.test.ts::test1_admin_access
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — admin rolüne sahip kullanıcı döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/orders URL'si, host header'ı ve sb_access_token cookie'si içerir
  - `res` — await middleware(req) çağrısının dönüş değeri; yanıt status ve header'ları tutar
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion'lar ile 200 status ve location header'ın null olduğunu doğrular)

### [N9_NASIL] AST Pointer: tests/e2e/auth.test.ts::test2_other_roles
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — sales rolüne sahip kullanıcı döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/inventory URL'si ve host header'ı
  - `res` — await middleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion: status 200 doğrulanır)

### [N10_NASIL] AST Pointer: tests/e2e/auth.test.ts::test3_unauthenticated_redirect
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — user: null ve error döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/settings URL'si ve host header'ı
  - `res` — await middleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion: 302 redirect, location içinde /auth/login ve from parametresi doğrulanır)

### [N11_NASIL] AST Pointer: tests/e2e/auth.test.ts::test4_expired_session
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — user: null ve JWT expired hatası döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/dashboard URL'si ve host header'ı
  - `res` — await middleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion: 302 redirect, location içinde reason=expired parametresi doğrulanır)

### [N12_NASIL] AST Pointer: tests/e2e/auth.test.ts::test5_signup_flow
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleUserSignup` — inner fonksiyon, kullanıcı kayıt senaryosunu simüle eder; parametre olarak email, targetTenantId, requestedRole alır
  - `secureMetadata` — handleUserSignup içinde oluşturulan obje; tenant_id ve role alanlarını tutar, super_admin自举ını engeller
  - `userProfile` — handleUserSignup içinde oluşturulan kullanıcı profil objesi; id, email, tenant_id, role, created_at alanlarını tutar
  - `email` — handleUserSignup parametresi, test çağrısında 'new@hvac.com' değeri
  - `targetTenantId` — handleUserSignup parametresi, test çağrısında 'tenant-sales-456' değeri
  - `requestedRole` — handleUserSignup parametresi, test çağrısında 'admin' değeri
- **Dönüş**: `{ secureMetadata, userProfile }` — handleUserSignup dönüşü destructured olarak alınır ve assert edilir

### [N13_NASIL] AST Pointer: tests/e2e/auth.test.ts::test6_customer_rejection
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — customer rolüne sahip kullanıcı döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/settings URL'si ve host header'ı
  - `res` — await middleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion: 302 redirect, location = ana sayfa + auth_error=unauthorized)

### [N14_NASIL] AST Pointer: tests/e2e/auth.test.ts::test7_missing_role
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — user_metadata'sı boş olan kullanıcı döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/logs URL'si ve host header'ı
  - `res` — await middleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion: 302 redirect, location = ana sayfa + auth_error=unauthorized)

### [N15_NASIL] AST Pointer: tests/e2e/auth.test.ts::test8_malformed_jwt
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — user: null ve Invalid token signature hatası döndürecek şekilde yeniden atanır
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/billing URL'si ve host header'ı
  - `res` — await middleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — test edilen ana middleware fonksiyonu
- **Dönüş**: yok (assertion: 302 redirect, location içinde /auth/login)

### [N16_NASIL] AST Pointer: tests/e2e/auth.test.ts::test9_profile_update_security
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `secureProfileUpdate` — inner fonksiyon, app_metadata korumasını simüle eder; userId, requestedProfilePatch, currentUserJwtClaims parametreleri alır
  - `currentClaims` — test verisi, mevcut kullanıcının JWT claim'lerini temsil eder; id, app_metadata, user_metadata alanlarını tutar
  - `maliciousUpdate` — test verisi, kötü niyetli profil güncelleme isteğini temsil eder; app_metadata ve user_metadata alanlarını tutar
  - `finalClaims` — secureProfileUpdate içinde oluşturulan, korunmuş claim'lerin birleşimi
  - `userId` — secureProfileUpdate parametresi, test çağrısında 'user-123' değeri
  - `requestedProfilePatch` — secureProfileUpdate parametresi, maliciousUpdate objesi
  - `currentUserJwtClaims` — secureProfileUpdate parametresi, currentClaims objesi
  - `updatedClaims` — secureProfileUpdate dönüş değeri, destructured olarak alınan son claim durumu
- **Dönüş**: `{ updatedClaims }` — güncellenmiş claim objesi; app_metadata korunmuş, user_metadata güncellenmiş

### [N17_NASIL] AST Pointer: tests/e2e/auth.test.ts::test10_cross_tenant_hijacking
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `mockUserResolver` — tenant-a kullanıcısı döndürecek şekilde yeniden atanır
  - `secureMiddleware` — inner async fonksiyon, middleware'i sarar ve cross-tenant doğrulama ekler; req parametresi alır
  - `baseRes` — secureMiddleware içinde, await middleware(req) çağrısının dönüş değeri
  - `resolvedTenantId` — secureMiddleware içinde sabit string, 'tenant-b-456' olarak tanımlanır (test senaryosu)
  - `claims` — secureMiddleware içinde, mockUserResolver().user?.app_metadata erişimi ile elde edilen app_metadata objesi
  - `redirectUrl` — secureMiddleware içinde, req.nextUrl.clone() ile oluşturulan ve üzerine pathname/searchParams eklenen URL nesnesi
  - `req` — createMockRequest ile oluşturulan mock HTTP isteği; admin/settings URL'si ve host header'ı
  - `res` — await secureMiddleware(req) çağrısının dönüş değeri
  - `createMockRequest` — mock NextRequest oluşturmak için kullanılır
  - `middleware` — secureMiddleware içinde çağrılan ana middleware fonksiyonu
  - `MockNextResponse` — cross-tenant ihlali durumunda redirect yanıtı oluşturmak için kullanılır
  - `NextRequest` — TypeScript tip import'u, req parametresinin tipi
  - `NextResponse` — TypeScript tip import'u, return tipi
- **Dönüş**: yok (assertion: 302 redirect, location içinde auth_error=unauthorized)

### [N18_NASIL] AST Pointer: tests/e2e/auth.test.ts::handleUserSignup
- **params**: `email` — string, kullanıcının e-posta adresi; `targetTenantId` — string, hedef tenant kimliği; `requestedRole` — string, istenen rol
- **ic_degiskenler**:
  - `secureMetadata` — obje; tenant_id olarak targetTenantId, role olarak requestedRole atanır (super_admin ise 'customer' olarak düşürülür)
  - `userProfile` — obje; id ('new-uid-999'), email, tenant_id (secureMetadata.tenant_id'den), role (secureMetadata.role'den), created_at (new Date().toISOString()) alanlarını tutar
- **Dönüş**: `{ secureMetadata, userProfile }` — güvenli metadata ve kullanıcı profil yapısı

### [N19_NASIL] AST Pointer: tests/e2e/auth.test.ts::secureProfileUpdate
- **params**: `userId` — string, kullanıcı kimliği; `requestedProfilePatch` — any, istenen profil güncelleme yaması; `currentUserJwtClaims` — any, mevcut kullanıcının JWT claim'leri
- **ic_degiskenler**:
  - `finalClaims` — obje; currentUserJwtClaims spread edilir, app_metadata orijinal olarak korunur, user_metadata ise requestedPatch.user_metadata ile birleştirilir
- **Dönüş**: `finalClaims` — korunmuş ve kısmen güncellenmiş JWT claim yapısı

### [N20_NASIL] AST Pointer: tests/e2e/auth.test.ts::secureMiddleware
- **params**: `req` — NextRequest, test isteği
- **ic_degiskenler**:
  - `baseRes` — await middleware(req) çağrısının dönüş değeri, temel middleware yanıtını tutar
  - `resolvedTenantId` — string sabit, 'tenant-b-456'; test senaryosunda resolved edilen tenant ID
  - `claims` — mockUserResolver().user?.app_metadata erişiminden elde edilen app_metadata objesi; tenant_id alanını içerir
  - `redirectUrl` — req.nextUrl.clone() ile oluşturulan URL nesnesi; pathname '/' olarak ayarlanır ve auth_error=searchParams eklenir
  - `middleware` — @/middleware'den import edilen ana middleware fonksiyonu
  - `mockUserResolver` — kullanıcı verilerini sağlayan mock fonksiyon
  - `MockNextResponse` — redirect yanıtı oluşturmak için kullanılır
- **Dönüş**: `NextResponse` — baseRes (200 durumunda cross-tenant kontrolü ile) veya MockNextResponse.redirect (ihlal durumunda)

---

## NODE ID STANDARD

  file: tests\e2e\auth.test.ts
  function: tests\e2e\auth.test.ts::mockUserResolver

---

## DISA AKTARILANLAR (EXPORTS)
  export: mockUserResolver