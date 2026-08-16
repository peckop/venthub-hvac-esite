---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\lib\rbac.ts
skeleton_hash: e1581e665a2b1d85
entity_hashes:
  func:canAccessPage: 8cf66bde9646819e
  func:canWrite: 289f50aba94e238a
  func:isReadOnly: 4b13d0168f4b164b
  overview: e7f0da41b26e494f
generated_at: 2026-08-16T10:21:25Z
---

## Genel Bakış
VentHub HVAC platformunun kaynak kodunda yer alan bu RBAC (Rol Tabanlı Erişim Kontrolü) modülü, uygulamadaki tüm erişim yetkisi kontrollerini tek merkezden yönetmek üzere tasarlanmıştır. Kullanıcının sahip olduğu role göre sayfa gezintisi, sistem varlıklarını düzenleme gibi farklı platform işlevlerine erişim hakkını doğrulayan yardımcı fonksiyonlar barındırır. Tüm yetki kontrollerini merkezi hale getirerek platform genelinde güvenlik tutarlılığı sağlar.

## Fonksiyon Grupları
### Rol Bazlı Yetki Doğrulama Fonksiyonları
Kullanıcının mevcut rolü bazında farklı platform kaynaklarına erişim hakkı, yazma izni ve salt okunur durumunu kontrol eden temel erişim denetimi işlemlerini gerçekleştirir.
- canAccessPage, canWrite, isReadOnly

---

## AXIOMS – Mimari Varsayımlar
Bu rol tabanlı erişim kontrolü (RBAC) modülünün doğru ve güvenli çalışması için, erişim kurallarını tutan sabit nesnelerin tanımlı, bütünlüğünün korunmuş ve tüm giriş parametrelerinin beklenen formatta olması zorunludur.

[Aksiyom 1]: Eğer ROLE_PAGE_ACCESS sabit nesnesi tanımlı değilse veya tüm roller için geçerli sayfa erişim izinlerini içermiyorsa, canAccessPage fonksiyonu doğru erişim kontrolü yapamaz, yetkisiz sayfa erişimi veya yetkili kullanıcıların erişememesi sorunu oluşur.
[Aksiyom 2]: Eğer ROLE_WRITE_ACCESS sabit nesnesi tanımlı değilse veya tüm roller için geçerli varlık yazma izinlerini içermiyorsa, canWrite ve isReadOnly fonksiyonları hatalı izin kontrolleri üretir, güvenlik zaafleri ortaya çıkar.
[Aksiyom 3]: Eğer tüm erişim kontrolü fonksiyonlarına giriş olarak verilen role parametresi, tanımlı UserRole değerlerinden, null veya undefined dışında bir değer alırsa, hiçbir fonksiyon güvenilir izin sonucu üretemez, erişim kontrolleri tamamen devre dışı kalır.
[Aksiyom 4]: Eğer canAccessPage fonksiyonuna iletilen path parametresi geçerli bir string değeri değilse, ROLE_PAGE_ACCESS içindeki sayfa eşleşme kuralları çalışmaz, sayfa erişim kontrolü başarısız olur.
[Aksiyom 5]: Eğer canWrite fonksiyonuna iletilen entity parametresi, ROLE_WRITE_ACCESS nesnesinde tanımlı varlık isimleriyle eşleşmeyen bir değer alırsa, yazma izni kontrolü yapılamaz, yetkisiz yazma erişimi veya yetkili kullanıcıların yazamaması sorunu oluşur.

---

## FONKSİYON DETAYLARI

### canAccessPage
**Ne yapar**: Verilen kullanıcı rolünün, belirtilen sayfa yoluna erişim yetkisine sahip olup olmadığını kontrol eder. Kullanıcının ilgili sayfaya girme izninin olup olmadığını net bir boolean sonuçla döndürür, sistemdeki erişim güvenliğinin temel kontrol adımlarından birini oluşturur.
**Nasıl yapar**: Sistemde önceden tanımlanmış rol bazlı sayfa erişim yetkileri haritasını referans alarak, gelen rol ve path değerlerini bu yetki listesiyle karşılaştırır. Oturum açmamış yani rolü null veya undefined olan misafir kullanıcılar için varsayılan genel izinleri uygular, yetki eşleşmesi durumunda true, aksi halde false döndürür.
**Parametreler**:
- role: UserRole | null | undefined — Yetkisi kontrol edilecek kullanıcının rolü, oturum açmamış misafir kullanıcılar için null veya undefined değeri alabilir
- path: string — Erişilmek istenen sayfanın yolunu tutan string ifade, sistemdeki sayfa erişim kontrollerinde kullanılan benzersiz tanımlayıcıdır
**Dönüş**: boolean — Kullanıcının ilgili sayfaya erişim yetkisi tam olarak mevcutsa true, herhangi bir nedenle erişim izni yoksa false değerini döndürür

### canWrite
**Ne yapar**: Verilen kullanıcı rolünün, belirtilen sistem varlığında (entity) yazma, düzenleme, silme gibi tüm değişiklik işlemlerini yapıp yapamayacağını kontrol eder. Varlık bazlı yazma izinlerini doğrulayarak yetkisiz değişikliklerin önüne geçilmesini sağlar.
**Nasıl yapar**: Sistemdeki her varlık için ayrı ayrı tanımlanmış yazma izinleri sözlüğünü kullanarak, gelen rolün ilgili entity için değişiklik yapma yetkisi olup olmadığını sorgular. Oturumsuz yani rolü tanımlı olmayan kullanıcılar için hiçbir varlıkta yazma izni tanımlayarak temel güvenlik önlemini uygular, yetki varsa true aksi halde false döndürür.
**Parametreler**:
- role: UserRole | null | undefined — Yetkisi kontrol edilecek kullanıcının rolü, oturum açmamış kullanıcılar için null veya undefined değeri alabilir
- entity: string — Yazma işlemi yapılmak istenen sistem varlığının benzersiz tanımlayıcısıdır, sistemdeki tüm kayıtlı varlıklar için ayrılmış özel bir isim tutar
**Dönüş**: boolean — Kullanıcının ilgili varlık üzerinde tüm yazma ve düzenleme işlemlerini yapma yetkisi varsa true, yetkisi eksik veya hiç yoksa false döndürür

### isReadOnly
**Ne yapar**: İlgili kullanıcının sistemdeki tüm erişim haklarının salt okunur olup olmadığını, yani hiçbir varlık veya sayfada değişiklik yapma yetkisine sahip olup olmadığını tek bir sorguyla kontrol eder. Tüm sistem genelinde kullanıcının yetki seviyesini özetleyen bir sonuç döndürür.
**Nasıl yapar**: Kullanıcının rolüyle sistemde önceden tanımlanmış salt okunur roller listesini karşılaştırır. Eğer kullanıcının rolü bu listede yer alıyorsa ya da rolü tanımlı değilse (misafir kullanıcı) tüm sistem erişimini salt okunur olarak işaretler, herhangi bir alanda yazma yetkisi olan roller için false döndürür.
**Parametreler**:
- role: UserRole | null | undefined — Salt okunur durumu kontrol edilecek kullanıcının rolü, oturum açmamış kullanıcılar için null veya undefined değeri alabilir
**Dönüş**: boolean — Kullanıcı sistemdeki hiçbir varlık veya sayfada değişiklik yapamıyor, sadece tüm içerikleri okuyabiliyorsa true, herhangi bir alanda yazma yetkisine sahipse false döndürür

---

## TYPE ALIASES

### UserRole
```typescript
type UserRole = 'super_admin' | 'admin' | 'moderator' | 'warehouse' | 'sales' | 'viewer' | 'user'
```

---

## SABİTLER
- **ROLE_PAGE_ACCESS** (object) — `{
    super_admin: ['*'], // Her seye erişim
    admin: ['*'], // Her seye ...`
- **ROLE_WRITE_ACCESS** (object) — `{
    super_admin: ['*'],
    admin: ['orders', 'logistics', 'returns', 'qu...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\lib\rbac.ts::canAccessPage
- **params**: role: UserRole | null | undefined, path: string
- **ic_degiskenler**:
  - `ROLE_PAGE_ACCESS` — global tanımlı, rollerin sayfa erişim izinlerini saklayan nesne, ilgili role ait izinli path listesini çekmek için kullanılır
  - `allowedPaths` — ROLE_PAGE_ACCESS'ten mevcut role için alınan izinli path'lerin listesi, role için kayıt yoksa varsayılan boş dizi atanır
  - `p` — allowedPaths dizisi üzerinde some metodu çalışırken kullanılan iterasyon öğesi, mevcut kontroldeki path değeri
- **Dönüş**: boolean

### [N2_NASIL] AST Pointer: src\lib\rbac.ts::canWrite
- **params**: role: UserRole | null | undefined, entity: string
- **ic_degiskenler**:
  - `ROLE_WRITE_ACCESS` — global tanımlı, rollerin yazma erişim izinlerini saklayan nesne, ilgili role ait izinli varlık listesini çekmek için kullanılır
  - `allowedEntities` — ROLE_WRITE_ACCESS'ten mevcut role için alınan yazma izni verilen varlıkların listesi, role için kayıt yoksa varsayılan boş dizi atanır
- **Dönüş**: boolean

### [N3_NASIL] AST Pointer: src\lib\rbac.ts::isReadOnly
- **params**: role: UserRole | null | undefined
- **ic_degiskenler**: (yok)
- **Dönüş**: boolean

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    rbac_ts__canAccessPage["canAccessPage"]
    rbac_ts__canWrite["canWrite"]
    rbac_ts__isReadOnly["isReadOnly"]
```

## NODE ID STANDARD

  file: src\lib\rbac.ts
  function: src\lib\rbac.ts::canAccessPage
  function: src\lib\rbac.ts::canWrite
  function: src\lib\rbac.ts::isReadOnly

---

## DISA AKTARILANLAR (EXPORTS)
  export: UserRole
  export: canAccessPage
  export: canWrite
  export: isReadOnly