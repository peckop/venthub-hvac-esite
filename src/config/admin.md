---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\config\admin.ts
skeleton_hash: 7935dad8af4131d7
entity_hashes:
  func:getUserRole: 2c200fb867d424aa
  func:listAdminUsers: d933c96b85d7b147
  func:setUserAdminRole: 8d3b86f7b7baaf3b
  overview: 5893087b4e779eea
generated_at: 2026-08-27T04:31:52Z
---

## Genel Bakış
Bu modül, kullanıcı rollerinin sorgulanması, atanması ve yönetici kullanıcıların listelenmesi işlemlerini merkezi olarak yönetir. Tüm fonksiyonlar asenkron yapıda olup dış bir veri kaynağına erişerek yönetici rol bilgilerini okur ve günceller.

## Fonksiyon Grupları
### Kullanıcı Rol Yönetimi
Belirli bir kullanıcının mevcut rolünü sorgulama, kullanıcıya yönetici rolü atama ve sistemdeki tüm yönetici kullanıcıları listeleme gibi temel rol yönetim işlemlerini gerçekleştirir.
- getUserRole, setUserAdminRole, listAdminUsers

## Bağımlılıklar ve Mimari Notlar
- Tüm fonksiyonlar asenkron (async) yapıdadır ve Promise döndürür; bu durum modülün dış bir veri deposu veya servise bağlı olduğunu gösterir.
- Fonksiyonlar arasında doğrudan bir çağrı ilişkisi belirlenmemiştir; her biri bağımsız olarak dış sisteme erişir.
- `setUserAdminRole` fonksiyonu boolean değer döndürerek işlemin başarılı olup olmadığını bildirir.
- `listAdminUsers` fonksiyonu `AdminUser` tipinde bir dizi döndürür; bu tipin tanımı modül dışındadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarılabilecek varsayımlar belirlenmiştir.

[Aksiyom 1]: Eğer `userId` parametresi geçerli bir kullanıcı kimliği içermiyorsa, `getUserRole` ve `setUserAdminRole` fonksiyonları beklenen sonucu üretemez.

[Aksiyom 2]: Eğer `setUserAdminRole` fonksiyonunda verilen `role` değeri sistem tarafından tanınan geçerli bir rol değilse, fonksiyon `false` döndürür.

[Aksiyom 3]: Eğer sistemde kayıtlı yönetici kullanıcısı yoksa, `listAdminUsers` fonksiyonu boş bir dizi (`[]`) döndürür.

[Aksiyom 4]: Eğer `getUserRole` fonksiyonuna verilen `userId` sistemde kayıtlı değilse, fonksiyon hata fırlatır veya boş/varsayılan bir string değer döndürür — hangi davranışın uygulandığı fonksiyon gövdesinden bilinmiyor.

---

## FONKSİYON DETAYLARI

### getUserRole
**Ne yapar**: Veritabanından belirtilen kullanıcının rol bilgisini getirir. Rol bilgisinin tek yetkili kaynağı `user_profiles` tablosundaki `role` alanıdır. Fonksiyon, hata durumunda veya profil satırı bulunamadığında varsayılan olarak `'user'` döndürür.

**Nasıl yapar**: Fonksiyon öncelikle çalışma ortamını tespit eder; `window` tanımlıysa tarayıcı ortamında olduğunu anlar ve `supabaseBrowserClient` istemcisini, aksi halde sunucu/statik ortamda olduğunu anlar ve `supabaseStaticClient` istemcisini dinamik olarak (`await import`) içe aktarır. Seçilen Supabase istemcisi üzerinden `user_profiles` tablosuna gidilir, `role` alanı seçilir ve `id` alanı `userId` parametresiyle eşleşen satır `maybeSingle()` ile sorgulanır. Sorgu sonucunda hata oluşursa konsola uyarı yazdırılır ve `'user'` döndürülür. Veri başarıyla gelirse `data.role` değeri döndürülür. Profil satırı hiç yoksa (veri null ise) yine `'user'` döndürülür. Dokümanda belirtildiği üzere, eski sürümde profil satırı olmayan kullanıcılar için e-posta listesi üzerinden `'admin'` döndüren bir yol varmış; ancak bu yol kaldırılmıştır çünkü profili olmayan birine yetki vermek yerine doğru akışın önce profil satırını oluşturmak olduğu belirtilmiştir. Fonksiyonun kendisi bir `try-catch` bloğu ile sarılıdır; yakalanan herhangi bir exception durumunda konsola uyarı yazdırılır ve `'user'` döndürülür.

**Parametreler**:
- `userId`: `string` — Kullanıcının benzersiz kimlik numarası. Bu değer `user_profiles` tablosundaki `id` alanı ile eşleştirilerek sorgulama yapılır.

**Dönüş**: `Promise<string>` — Asenkron olarak çözülen bir Promise döndürür. Çözüldüğünde kullanıcının rol bilgisini içeren bir string değer verir. Başarılı sorgularda veritabanındaki `role` değeri (örneğin `'admin'`), hata veya bulunamama durumlarında ise `'user'` döndürülür.

### setUserAdminRole
**Ne yapar**: Sadece istemci tarafında kullanılmak üzere belirtilen kullanıcıya admin rolü atar, bu işlem sadece yerel istemci verilerini günceller, kalıcı bir veritabanı değişikliği yapmaz. Gerçek veritabanı güncellemesi için ayrı bir admin paneli işlemi yapılması zorunludur.
**Nasıl yapar**: Parametre olarak aldığı kullanıcı ID'si ile istemci tarafındaki yerel kullanıcı listesinde eşleşme yapar, eşleşen kullanıcıya girilen rolü atar. İşlem sadece yerel oturum boyunca geçerlidir, kullanıcı oturumu kapatıp açtığında veya sayfayı yenilediğinde kalıcı olmaz.
**Parametreler**:
- userId: string - Rolü atanacak kullanıcının benzersiz sistem kimliği, zorunlu parametredir
- role: string - Kullanıcıya atanacak olan rol, zorunlu parametredir
**Dönüş**: Promise<boolean> — Rol atama işleminin başarıyla tamamlandığını belirten boolean değer içeren bir promise döndürür, işlem başarılıysa true, aksi halde false döndürür

### listAdminUsers
**Ne yapar**: Sisteme kayıtlı tüm admin kullanıcılarının listesini getirir, bu fonksiyona sadece admin yetkisine sahip kullanıcılar erişebilir, yetkisiz kullanıcıların erişimi engellenir. Admin panelinde yetkili kullanıcıları listelemek için kullanılır.
**Nasıl yapar**: İlk olarak fonksiyonu çağıran kullanıcının admin yetkisini doğrular, yetki doğrulaması başarılı olursa veritabanından tüm admin kullanıcılarının verilerini çeker, yapılandırılmış AdminUser tipinde liste olarak döndürür. Yetki doğrulaması başarısız olursa erişim hatası fırlatır.
**Parametreler**: Herhangi bir parametre almaz
**Dönüş**: Promise<AdminUser[]> — Asenkron olarak gerçekleşen işlem sonucunda tüm admin kullanıcılarının verilerini içeren AdminUser tipinde dizi barındıran bir promise döndürür

---

## INTERFACES

### AdminUser
Admin user interface for type safety
- `id: string`
- `email: string`
- `full_name?: string`
- `phone?: string`
- `role: string`
- `created_at: string`
- `updated_at: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/config/admin.ts::getUserRole
- **params**: `userId` — string, kullanıcının benzersiz kimliği
- **ic_degiskenler**:
  - `supabaseBrowserClient` — tarayıcı ortamı için Supabase istemcisi, dinamik import ile `../lib/supabase/client` modülünden alınır
  - `supabaseStaticClient` — statik/sunucu ortamı için Supabase istemcisi, dinamik import ile `../lib/supabase/static` modülünden alınır
  - `supabase` — ortam tespitiyle seçilen Supabase istemcisi; `typeof window !== 'undefined'` koşulu sağlanırsa `supabaseBrowserClient`, sağlanmazsa `supabaseStaticClient` atanır
  - `data` — `user_profiles` tablosundan `role` alanını seçen sorgunun sonucu; `.maybeSingle()` ile tek satır veya null döner
  - `error` — Supabase sorgusunda oluşan hata nesnesi; varsa `console.warn` ile loglanır ve `'user'` döndürülür
  - `error` (catch bloğu) — `try` bloğu içinde yakalanan genel istisna; `console.warn` ile loglanır ve `'user'` döndürülür
- **Dönüş**: `Promise<string>` — kullanıcının rolü; `data?.role` varsa o değer, hata durumunda veya profil satırı yoksa `'user'`

### [N2_NASIL] AST Pointer: src/config/admin.ts::setUserAdminRole
- **params**:
  - `userId` — string, rolü değiştirilecek kullanıcının benzersiz kimliği
  - `role` — string, atanacak yeni rol değeri
- **ic_degiskenler**:
  - `supabaseBrowserClient` — tarayıcı ortamı için Supabase istemcisi, dinamik import ile `../lib/supabase/client` modülünden alınır
  - `supabaseStaticClient` — statik/sunucu ortamı için Supabase istemcisi, dinamik import ile `../lib/supabase/static` modülünden alınır
  - `supabase` — ortam tespitiyle seçilen Supabase istemcisi; `typeof window !== 'undefined'` koşulu sağlanırsa `supabaseBrowserClient`, sağlanmazsa `supabaseStaticClient` atanır
  - `data` — `set_user_admin_role` RPC çağrısının dönüş değeri; `true` ise rol atama başarılı
  - `error` — RPC çağrısında oluşan hata nesnesi; varsa `console.error` ile loglanır ve `false` döndürülür
  - `error` (catch bloğu) — `try` bloğu içinde yakalanan genel istisna; `console.error` ile loglanır ve `false` döndürülür
- **Dönüş**: `Promise<boolean>` — rol atama başarılıysa `true`, hata durumunda `false`

### [N3_NASIL] AST Pointer: src/config/admin.ts::listAdminUsers
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ensureSessionFresh` — oturum tazeliğini sağlayan fonksiyon, dinamik import ile `../lib/ensureSessionFresh` modülünden alınır; RPC çağrısından önce `await` ile çalıştırılır
  - `supabaseBrowserClient` — tarayıcı ortamı için Supabase istemcisi, dinamik import ile `../lib/supabase/client` modülünden alınır
  - `supabaseStaticClient` — statik/sunucu ortamı için Supabase istemcisi, dinamik import ile `../lib/supabase/static` modülünden alınır
  - `supabase` — ortam tespitiyle seçilen Supabase istemcisi; `typeof window !== 'undefined'` koşulu sağlanırsa `supabaseBrowserClient`, sağlanmazsa `supabaseStaticClient` atanır
  - `rpcRes` — `admin_list_users` RPC çağrısının ham sonucu; `error` ve `data` alanlarını içerir
  - `rpcErr` — `rpcRes` nesnesinden çıkarılan hata değeri; varsa `console.error` ile loglanır ve boş dizi döndürülür
  - `rpcData` — `rpcRes` nesnesinden çıkarılan veri dizisi; null veya undefined ise boş diziye düşülür, `AdminUser[]` tipine cast edilir
  - `error` (catch bloğu) — `try` bloğu içinde yakalanan genel istisna; `console.error` ile loglanır ve boş dizi döndürülür
- **Dönüş**: `Promise<AdminUser[]>` — admin kullanıcı listesi; hata durumunda boş dizi `[]`

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    admin_ts__getUserRole["getUserRole"]
    admin_ts__listAdminUsers["listAdminUsers"]
    admin_ts__setUserAdminRole["setUserAdminRole"]
```

## NODE ID STANDARD

  file: src\config\admin.ts
  function: src\config\admin.ts::getUserRole
  function: src\config\admin.ts::setUserAdminRole
  function: src\config\admin.ts::listAdminUsers

---

## DISA AKTARILANLAR (EXPORTS)
  export: getUserRole
  export: listAdminUsers
  export: setUserAdminRole