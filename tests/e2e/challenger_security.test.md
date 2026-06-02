---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\challenger_security.test.ts
skeleton_hash: d43188bc1965e551
entity_hashes:
  overview: ef4015787eee6563
generated_at: 2026-06-02T07:52:32Z
---

## Genel Bakış
Bu dosya, challenger security (meydan okuma güvenliği) senaryolarını test eden uçtan uca (e2e) testleri içerir. Mock bir veritabanı motoru kullanarak izole ortamda hassas API'leri çağırır ve beklenen güvenlik davranışlarını (örneğin hata kodları, başarı mesajları) doğrular. Testler, bir kullanıcının şifre sıfırlama veya e-posta doğrulama gibi kritik süreçlerdeki akışını ve olası güvenlik açıklarını hedefler.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon yoktur; tüm test senaryoları modül üst seviyesinde `describe` ve `it` blokları ile tanımlanmıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### UserProfile
- `id: string`
- `tenant_id: string`
- `role: string`
- `full_name?: string`
- `created_at?: string`
- `updated_at?: string`

### Tenant
- `id: string`
- `name: string`
- `is_active: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: challenger_security.test.ts::evaluateUserProfilesSelectRLS
- **params**: (row: UserProfile, sessionContext: { tenantId: string | null; userId: string | null; role: string | null; userProfiles: UserProfile[] })
- **ic_degiskenler**:
  - `jwt_tenant_id` — Anonim fonksiyon; sessionContext.tenantId değerini döndürür, tanımlı değilse varsayılan UUID ('d3b07384-d113-495f-a558-8c38634e0000') döndürür.
  - `is_admin_user` — Anonim fonksiyon; kullanıcının admin rolüne sahip olup olmadığını kontrol eder. sessionContext.role 'service_role' ise true, değilse userProfiles dizisinde kullanıcının id'si eşleşen ve rolü ['admin', 'superadmin', 'super_admin'] listesinde olan bir profil varsa true döndürür.
  - `tenantMatch` — Boolean; row.tenant_id değerinin jwt_tenant_id() çağrısı ile eşleşip eşleşmediğini tutar.
  - `identityOrAdminMatch` — Boolean; row.id ile sessionContext.userId eşleşir veya is_admin_user() true ise true olan değer.
- **Dönüş**: boolean (RLS politika sonucu)

### [N2_NASIL] AST Pointer: challenger_security.test.ts::is_admin_user
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (Dahili değişken yok; sadece outer scope'taki sessionContext değişkenine erişir.)
- **Dönüş**: boolean (kullanıcının admin olup olmadığı)

### [N3_NASIL] AST Pointer: challenger_security.test.ts::simulateCustomAccessTokenHook
- **params**: (event: { user_id: string; claims: any }, callerRole: string, userProfiles: UserProfile[])
- **ic_degiskenler**:
  - `userProfile` — userProfiles dizisi içinde event.user_id ile eşleşen kullanıcı profilini bulur (find metodu).
  - `user_role` — userProfile varsa role özelliğini, yoksa 'user' döndürür.
  - `tenant_id_val` — userProfile varsa tenant_id özelliğini, yoksa varsayılan UUID döndürür.
  - `claims` — event.claims nesnesinin shallow copy'si; app_metadata alanı yoksa eklenir, ardından user_role ve tenant_id değerleri hem claims hem de claims.app_metadata içine yazılır.
- **Dönüş**: { ...event, claims } (genişletilmiş event nesnesi)

### [N4_NASIL] AST Pointer: challenger_security.test.ts::simulateHandleNewUserMetadataTrigger
- **params**: (newUserMetadata: { role?: string; tenant_id?: string; [key: string]: any }, callerContext: { authRole: string; isCallerAdmin: boolean })
- **ic_degiskenler**:
  - `role_val` — newUserMetadata.role değerini alır, tanımlı değilse 'user' kullanır. Eğer callerContext.authRole 'service_role' veya callerContext.isCallerAdmin true değilse, role_val 'user' olarak düşürülür.
  - `tenant_id_raw` — newUserMetadata.tenant_id değerini tutar.
  - `resolved_tenant_id` — tenant_id_raw tanımlıysa onu, değilse varsayılan UUID'yi tutar.
  - `raw_app_meta_data` — { tenant_id: resolved_tenant_id, user_role: role_val } nesnesi.
  - `raw_user_meta_data` — newUserMetadata nesnesini genişletip tenant_id ve role alanlarını resolved değerlerle güncellemiş nesne.
- **Dönüş**: { raw_app_meta_data, raw_user_meta_data }

### [N5_NASIL] AST Pointer: challenger_security.test.ts::simulateHandleNewUserProfileTrigger
- **params**: (newRecord: { id: string; raw_app_meta_data: any; raw_user_meta_data: any }, callerContext: { authRole: string; isCallerAdmin: boolean })
- **ic_degiskenler**:
  - `resolved_tenant_id` — newRecord.raw_app_meta_data.tenant_id değerini tutar.
  - `full_name_val` — newRecord.raw_user_meta_data.full_name değerini tutar.
  - `role_val` — newRecord.raw_user_meta_data.role değerini alır, tanımlı değilse 'user' kullanır. Eğer callerContext.authRole 'service_role' veya callerContext.isCallerAdmin true değilse, role_val 'user' olarak düşürülür.
- **Dönüş**: { id, tenant_id, full_name, role, created_at, updated_at } (yeni profil nesnesi)

### [N6_NASIL] AST Pointer: challenger_security.test.ts::checkAdminRpcAuth
- **params**: (callerContext: { authRole: string | null | undefined; userId: string | null | undefined; userProfiles: UserProfile[] })
- **ic_degiskenler**:
  - `isServiceRole` — Boolean; callerContext.authRole 'service_role' ise true.
  - `isAdminInDb` — Boolean; callerContext.userId tanımlıysa, userProfiles dizisi içinde bu userId ile eşleşen ve rolü ['super_admin', 'admin', 'warehouse', 'moderator', 'superadmin', 'moderater'] listesinde olan bir profil varsa true, değilse false.
- **Dönüş**: yok (hata fırlatır veya sessizce başarılı olur)

### [N7_NASIL] AST Pointer: challenger_security.test.ts::beforeEach_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (db değişkenine atama yapılır; db outer scope'tan gelir.)
- **Dönüş**: yok (yan etki: db değişkenini MockDatabaseEngine örneği ile başlatır)

---

## NODE ID STANDARD

  file: tests\e2e\challenger_security.test.ts