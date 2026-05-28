---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\admin.ts
skeleton_hash: 18e39c650595c52a
entity_hashes:
  func:checkAdminAccess: 0195cef58edf96a2
  func:getUserRole: dc4585911f66490b
  func:isAdminByEmail: 97d57e6b9c4cf9a2
  func:isDevAdmin: 527f404e6ee96806
  func:listAdminUsers: 808d0c796a469da9
  func:setUserAdminRole: 34515a99f07fc282
  overview: 3d7af3e502cf1294
generated_at: 2026-05-28T22:37:31Z
---

## Genel Bakış
Bu modül, HVAC yönetim platformu VentHub'un konfigürasyon katmanında yer alarak yönetici erişim ve rol yönetimi süreçlerini tek merkezde toplar. Kullanıcı kimlik bilgilerine göre yönetici yetkilerini doğrular, kullanıcı rolleri üzerinde düzenleme ve sorgulama işlemleri yapar, sistemdeki tüm yönetici kullanıcılarını listeleme imkanı sunar.

## Fonksiyon Grupları
### Kullanıcı Rol Yönetimi
Kullanıcı rollerini getirme, yeni yönetici rolü atama ve sistemdeki kayıtlı tüm yönetici kullanıcılarının listesini alma gibi temel rol yönetimi işlemlerini gerçekleştirir.
- getUserRole, setUserAdminRole, listAdminUsers

### Yönetici Erişim Doğrulama
Farklı senaryolara göre kullanıcıların yönetici erişimine sahip olup olmadığını kontrol eden güvenlik kontrollerini sunar, yerel geliştirici statüsünden e-posta ve kullanıcı meta verilerine kadar birçok kriteri baz alır.
- isAdminByEmail, isDevAdmin, checkAdminAccess

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC sisteminin yönetici erişim kontrolünü ve rol yönetimini gerçekleştirmek üzere tasarlanmıştır, tüm fonksiyonların doğru çalışması için giriş parametrelerinin, sabit tanımlı yönetici listelerinin ve kullanıcı meta verilerinin eksiksiz ve güvenilir olması zorunludur.

[Aksiyom 1]: Eğer FALLBACK_ADMIN_EMAILS sabiti tanımsız veya boş bir dizi ise, e-posta tabanlı temel yönetici erişim kontrolleri çalışmaz, tanımlı yedek yönetici hesapları sisteme erişemez.
[Aksiyom 2]: Eğer checkAdminAccess fonksiyonuna iletilen kullanıcı nesnesi (user) hem email hem de user_metadata.role alanlarından yoksun ise, hiçbir kullanıcıya yönetici erişimi tanımlanamaz, tüm yönetici paneli erişim istekleri reddedilir.
[Aksiyom 3]: Eğer getUserRole veya setUserAdminRole fonksiyonlarına iletilen userId parametresi boş veya geçersiz string ise, kullanıcı rolü ne sorgulanabilir ne de atanabilir, rol tabanlı tüm erişim kontrolleri başarısız olur.
[Aksiyom 4]: Eğer setUserAdminRole fonksiyonuna iletilen role parametresi sistemde tanımsız bir string ise, rol veri tabanına kaydedilse dahi erişim kontrolleri tarafından tanınmaz, ilgili kullanıcıya yönetici erişimi sağlanamaz.
[Aksiyom 5]: Eğer isDevAdmin() fonksiyonunun çalışması için gereken ortam spesifik işaretçi tanımsız ise, geliştirici yönetici erişimi gerektiren tüm işlemler devre dışı kalır.
[Aksiyom 6]: Eğer listAdminUsers fonksiyonunun eriştiği sistemdeki tüm kullanıcı verisi erişilemez ise, fonksiyon eksik veya hatalı yönetici listesi döndürür, yetkisiz hesapların tespiti yapılamaz.

---

## FONKSİYON DETAYLARI

### getUserRole

**Ne yapar**: Belirli bir kullanıcının rolünü (super_admin, admin, user vb.) belirler. Fonksiyon, veritabanından rol bilgisini çekerken aynı zamanda e-posta tabanlı bir güvenlik ağı sunar. Bu sayede veritabanı erişiminin olmadığı veya hata oluştuğu durumlarda bile admin kullanıcıların doğru şekilde tanımlanmasını sağlar.

**Nasıl yapar**: Fonksiyon öncelikle opsiyonel olarak gelen e-posta adresini kontrol eder. Eğer e-posta adresi `isAdminByEmail` fonksiyonu tarafından onaylanırsa, özel super_admin e-postaları (`recep.varlik@gmail.com`, `recepvarlk@gmail.com`) için `'super_admin'`, diğer onaylı e-postalar için `'admin'` döner. E-posta kontrolü başarısız olursa veya sağlanmamışsa, Supabase veritabanından `user_profiles` tablosunda ilgili kullanıcının `role` alanını sorgular. Sorgu sonucunda hata oluşursa veya veri bulunamazsa varsayılan olarak `'user'` rolü döner. Tüm işlemler sırasında异常 durumları yakalanır ve konsola uyarı yazdırılarak `'user'` rolüyle devam edilir.

**Parametreler**:
- `userId`: `string` — Kimliği doğrulanmış kullanıcının benzersiz tanımlayıcısı. Veritabanında `user_profiles` tablosundaki `id` alanıyla eşleşir.
- `userEmail`: `string` (opsiyonel) — Kullanıcının e-posta adresi. Veritabanı sorgusu başarısız olduğunda veya kullanıcı kaydı henüz oluşturulmamışken devreye giren fallback mekanizması için kullanılır.

**Dönüş**: `Promise<string>` — Kullanıcının rolü olarak bir string döner. Olası değerler: `'super_admin'`, `'admin'`, `'user'`. Herhangi bir hata veya belirsizlik durumunda `'user'` döner.

### isAdminByEmail
**Ne yapar**: E-posta adresi bazlı olarak kullanıcının admin yetkisine sahip olup olmadığını kontrol eden senkron fallback kontrol fonksiyonudur. Genellikle ana rol sorgusu çalışmadığında veya önbellekte rol bilgisi bulunamadığında yetki doğrulamak için kullanılır.
**Nasıl yapar**: Sistemde önceden tanımlanmış yetkili admin e-postaları listesi ile girilen e-posta adresini karşılaştırır. Eğer eşleşme tespit edilirse kullanıcının admin olduğu kabul edilir, eğer hiç e-posta adresi sağlanmazsa otomatik olarak yetkisiz olarak değerlendirilir.
**Parametreler**:
- email?: string — Admin yetkisi kontrol edilmek istenen kullanıcının opsiyonel e-posta adresi
**Dönüş**: boolean — Kullanıcının admin olup olmadığını belirten boolean değer, admin ise true, aksi halde false döndürür

### isDevAdmin
**Ne yapar**: Sadece uygulamanın geliştirme ortamında çalıştığı durumlarda kullanılmak üzere kullanıcının geliştirici statüsündeki admin olup olmadığını kontrol eder, üretim ortamında hiçbir şekilde çalışmaz. Yerel geliştirme süreçlerinde test amaçlı yetki vermek için kullanılır.
**Nasıl yapar**: Uygulamanın çalıştığı ortamı tanımlayan ortam değişkenlerini kontrol eder, eğer ortam geliştirme olarak tanımlıysa sisteme kayıtlı geliştirici kullanıcı bilgileriyle eşleştirme yapar, herhangi bir ortamda eşleşme sağlanmazsa false döndürür.
**Parametreler**: Herhangi bir parametre almaz
**Dönüş**: boolean — Geliştirme ortamında yetki doğrulanırsa true, tüm diğer durumlarda (üretim ortamı, yetkisiz kullanıcı vb.) false döndürür

### checkAdminAccess
**Ne yapar**: Önbellekte tutulan önceki kimlik doğrulama durumu verilerini kullanarak senkron şekilde kullanıcının admin erişimine sahip olup olmadığını kontrol eder, anlık yetki sorguları için optimize edilmiş cache tabanlı bir kontroldür.
**Nasıl yapar**: Öncelikle girdi olarak aldığı kullanıcı nesnesinin user_metadata alanında yer alan rol bilgisini kontrol eder, eğer geçerli bir rol bilgisi varsa bu bilgiye göre yetkiyi belirler. Eğer kullanıcı nesnesinde rol bilgisi bulunamazsa fallback olarak kullanıcının e-posta adresiyle admin kontrolü gerçekleştirir. Eğer kullanıcı nesnesi null olarak gelirse otomatik olarak yetkisiz olarak değerlendirir.
**Parametreler**:
- user: { email?: string; user_metadata?: { role?: string } } | null — Admin erişimi kontrol edilmek istenen kullanıcı nesnesi, null olabilir, içeriğinde opsiyonel e-posta ve yine opsiyonel olarak kullanıcı meta verilerinde rol bilgisini barındırır
**Dönüş**: boolean — Kullanıcının admin erişimine sahip olması durumunda true, aksi halde false döndürür

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

## SABİTLER
- **FALLBACK_ADMIN_EMAILS** (array) — `[

  'admin@venthub.com',

  'info@venthub.com',

  'alize@venthub.com',

  '...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/config/admin.ts::getUserRole
- **params**: `userId` (string), `userEmail` (optional string)
- **ic_degiskenler**:
  - `data` — supabase'den `user_profiles` tablosundan sorgulanan kullanıcının `role` alanını tutar
  - `error` — supabase sorgusundan dönen hata nesnesi; varsa hata yönetimi yapılır
- **Dönüş**: `Promise<string>` — `'super_admin'`, `'admin'` veya `'user'`

### [N2_NASIL] AST Pointer: src/config/admin.ts::isAdminByEmail
- **params**: `email` (optional string)
- **ic_degiskenler**: yok
- **Dönüş**: `boolean` — email `FALLBACK_ADMIN_EMAILS` listesinde yer alıyorsa `true`

### [N3_NASIL] AST Pointer: src/config/admin.ts::isDevAdmin
- **params**: parametre yok
- **ic_degiskenler**:
  - `isDev` — `process.env.NODE_ENV` değerinin `'development'` olup olmadığını kontrol eder
  - `isLocalhost` — tarayıcı ortamında `window.location.hostname` değerinin `'localhost'` olup olmadığını kontrol eder
- **Dönüş**: `boolean` — hem development modu hem localhost ortamı aynı anda aktifse `true`

### [N4_NASIL] AST Pointer: src/config/admin.ts::checkAdminAccess
- **params**: `user` — `{ email?: string; user_metadata?: { role?: string } } | null` türünde nesne veya null
- **ic_degiskenler**:
  - `lowerEmail` — `user.email` değerinin küçük harfe dönüştürülmüş hali; email karşılaştırmalarında kullanılır
  - `metadataRole` — `user.user_metadata?.role` erişiminden elde edilen Supabase metadata rolü; izin verilen roller listesiyle kontrol edilir
- **Dönüş**: `boolean` — kullanıcı admin erişimine sahipse `true`

### [N5_NASIL] AST Pointer: src/config/admin.ts::setUserAdminRole
- **params**: `userId` (string), `role` (string)
- **ic_degiskenler**:
  - `data` — `supabase.rpc('set_user_admin_role')` çağrısının başarılı sonucu; `true` ise atama başarılı demektir
  - `error` — rpc çağrısından dönen hata nesnesi; varsa `false` döner
- **Dönüş**: `Promise<boolean>` — rol ataması başarılıysa `true`, değilse `false`

### [N6_NASIL] AST Pointer: src/config/admin.ts::listAdminUsers
- **params**: parametre yok
- **ic_degiskenler**:
  - `rpcRes` — `supabase.rpc('admin_list_users')` çağrısının ham sonucu; hata ve data alanları barındırır
  - `rpcErr` — `rpcRes` objesinden çıkarılan `error` alanı; varsa hata yönetimi yapılır
  - `rpcData` — `rpcRes.data` alanından elde edilen `AdminUser[]` dizisi; RPC verisi boşsa boş dizi fallback'i kullanılır
- **Dönüş**: `Promise<AdminUser[]>` — admin kullanıcıların listesi; hata durumunda boş dizi

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    admin_ts__checkAdminAccess["checkAdminAccess"]
    admin_ts__getUserRole["getUserRole"]
    admin_ts__isAdminByEmail["isAdminByEmail"]
    admin_ts__isDevAdmin["isDevAdmin"]
    admin_ts__listAdminUsers["listAdminUsers"]
    admin_ts__setUserAdminRole["setUserAdminRole"]
    admin_ts__checkAdminAccess --> admin_ts__isDevAdmin
    admin_ts__getUserRole --> admin_ts__isAdminByEmail
    admin_ts__checkAdminAccess --> admin_ts__isAdminByEmail
```

## NODE ID STANDARD

  file: src\config\admin.ts
  function: src\config\admin.ts::getUserRole
  function: src\config\admin.ts::isAdminByEmail
  function: src\config\admin.ts::isDevAdmin
  function: src\config\admin.ts::checkAdminAccess
  function: src\config\admin.ts::setUserAdminRole
  function: src\config\admin.ts::listAdminUsers

---

## DISA AKTARILANLAR (EXPORTS)
  export: checkAdminAccess
  export: getUserRole
  export: isAdminByEmail
  export: isDevAdmin
  export: listAdminUsers
  export: setUserAdminRole