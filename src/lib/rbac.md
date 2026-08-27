---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\lib\rbac.ts
skeleton_hash: 2b942251bb35c0ea
entity_hashes:
  func:canAccessPage: 502373e4fa126e0a
  func:canWrite: 289f50aba94e238a
  func:isReadOnly: 4b13d0168f4b164b
  overview: f1352d33dc973192
generated_at: 2026-08-27T06:49:05Z
---

## Genel Bakış
VentHub HVAC platformunun RBAC (Rol Tabanlı Erişim Kontrolü) modülü, kullanıcı rollerine göre erişim yetkilerini merkezi olarak doğrulayan yardımcı fonksiyonlar sunar. Sayfa gezintisi izni, varlık düzenleme hakkı ve salt okunur durum kontrolü gibi temel güvenlik denetimlerini tek noktadan yöneterek platform genelinde tutarlı erişim kontrolü sağlar.

## Fonksiyon Grupları
### Rol Bazlı Yetki Doğrulama Fonksiyonları
Kullanıcının sahip olduğu role göre sayfa erişimi, varlık yazma izni ve salt okunur durumunu kontrol eden temel erişim denetimi işlemlerini gerçekleştirir. Tüm fonksiyonlar UserRole tipinde role parametresi alır ve boolean değer döndürür.
- canAccessPage, canWrite, isReadOnly

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### canAccessPage
**Ne yapar**: Verilen kullanıcı rolünün belirtilen sayfa yoluna (path) erişim izni olup olmadığını kontrol eder. Rol-tabanlı erişim kontrolü (RBAC) sisteminin temel kapı fonksiyonudur; sayfa navigasyonunda ve rota korumasında kullanılır.

**Nasıl yapar**: Fonksiyon çok katmanlı bir erişim kontrolü uygular. İlk olarak rol tanımsızsa veya `'user'` ise doğrudan `false` döner — anonim ve normal kullanıcılar admin paneline erişemez. Ardından üç özel yol için katı kontroller uygulanır: `/admin/users` yolu yalnızca `'super_admin'` rolüne açıktır; `/admin/data-requests` ve `/admin/invoices` yolları ise yalnızca `'admin'` ve `'super_admin'` rollerine açıktır — bu kontroller, ilgili RLS politikalarının `is_admin_user()` fonksiyonuna bağlı olması nedeniyle eklenmiştir ve yorumlarda belirtildiği üzere kemer-askı (belt-and-suspenders) yaklaşımı olarak bilerek korunmaktadır. Özel kontrolleri geçen roller için `ROLE_PAGE_ACCESS` sabitinden rolün izinli yolları alınır; eğer listede `'*'` varsa erişim doğrudan onaylanır. Son aşamada yol eşleştirmesi yapılır: tam eşleşme kontrolü ve alt yol kontrolü uygulanır. T134 düzeltmesiyle birlikte `ADMIN_ROOT` sabiti artık ön ek eşleştirmesinden hariç tutulur — eski mantıkta `/admin` listede ön ek olarak yer aldığından tüm alt yollar erişilebilir hale geliyordu ve bu bir güvenlik açığıydı.

**Parametreler**:
- role: `UserRole | null | undefined` — Erişim kontrolü yapılacak kullanıcının rolü. `null` veya `undefined` değerleri anonim/oturum açmamış kullanıcıyı temsil eder ve erişim reddedilir.
- path: `string` — Erişimi kontrol edilecek sayfanın URL yolu (örneğin `/admin/users`, `/admin/invoices`).

**Dönüş**: `boolean` — Rolün belirtilen yola erişim izni varsa `true`, yoksa `false` döner.

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
- **ENTITY_TO_RESOURCE** (object) — `{
    orders: 'orders',
    logistics: 'logistics',
    returns: 'returns'...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/rbac.ts::canAccessPage
- **params**: `role` — UserRole tipinde kullanıcı rolü (null veya undefined olabilir); `path` — erişilmek istenen sayfanın URL yolu
- **ic_degiskenler**:
  - `role` — fonksiyonun başında null/undefined kontrolü yapılır; ardından `'user'` rolü için doğrudan false dönülür. `'super_admin'` dışındaki rollerin `/admin/users` yolu engellenir. `'admin'` ve `'super_admin'` dışındaki rollerin `/admin/data-requests` ve `/admin/invoices` yolları engellenir. Son olarak `ROLE_PAGE_ACCESS[role as UserRole]` ile eşleştirilir.
  - `path` — üst üste gelen `startsWith` kontrolleriyle belirli admin alt yollarına erişim kısıtlanır; son `some` kapanışında her bir `p` ile karşılaştırılır.
  - `allowedPaths` — `ROLE_PAGE_ACCESS[role as UserRole]` erişimi sonucu elde edilen dizi; rol bulunamazsa boş dizi atanır. `'*'` içeriyorsa doğrudan true dönülür.
  - `p` — `allowedPaths.some()` callback'indeki her bir izinli yol elemanı. `path === p` ise tam eşleşme sağlanır; `p === ADMIN_ROOT` ise false dönülür (admin kök yolu tek başına eşleşmez); aksi halde `path.startsWith(p + '/')` ile alt yol kontrolü yapılır.
- **Dönüş**: boolean — kullanıcının belirtilen sayfaya erişim izni varsa `true`, yoksa `false`

### [N2_NASIL] AST Pointer: src/lib/rbac.ts::canWrite
- **params**: `role` — UserRole tipinde kullanıcı rolü (null veya undefined olabilir); `entity` — yazma işlemi yapılmak istenen varlık adı
- **ic_degiskenler**:
  - `role` — fonksiyonun başında null/undefined kontrolü yapılır. `'admin'` rolü ve `entity === 'users'` kombinasyonunda false dönülür (admin kullanıcı varlığını değiştiremez). Son olarak `ROLE_WRITE_ACCESS[role]` ile eşleştirilir.
  - `entity` — admin-users kısıtı kontrolünde ve `allowedEntities.includes(entity)` son eşleştirmesinde kullanılır.
  - `allowedEntities` — `ROLE_WRITE_ACCESS[role]` erişimi sonucu elde edilen dizi; rol bulunamazsa boş dizi atanır. `'*'` içeriyorsa doğrudan true dönülür.
- **Dönüş**: boolean — kullanıcının belirtilen varlık üzerinde yazma izni varsa `true`, yoksa `false`

### [N3_NASIL] AST Pointer: src/lib/rbac.ts::isReadOnly
- **params**: `role` — UserRole tipinde kullanıcı rolü (null veya undefined olabilir)
- **ic_degiskenler**:
  - `role` — null veya undefined ise doğrudan `true` dönülür. `'viewer'` veya `'user'` ise `true`, diğer roller için `false` dönülür.
- **Dönüş**: boolean — rol salt-okunur ise `true`, değilse `false`

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
  export: ENTITY_TO_RESOURCE
  export: UserRole
  export: canAccessPage
  export: canWrite
  export: isReadOnly

## Tasarım Gerekçeleri (kaynaktan BİREBİR)

> Bu bölüm LLM tarafından **yazılmadı**; kaynaktaki işaretli bloklardan
> birebir kopyalandı. Özetlenmesi veya yeniden ifade edilmesi YASAKTIR —
> gerekçenin değeri tam olarak kelimelerindedir.


```text
ekledi ve cümle yanlış oldu. KARAR değişmedi (yeni politika da `is_admin_user()`
istiyor, moderator'ü kabul etmiyor) ama GEREKÇE bayatladı. O yüzden burada artık
dayanağın ADI var, anlık ölçüm değeri yok. Kaynak: canlı `pg_policies` (migration
dosyası değil), 2026-08-20.

⚠ AÇIK KARAR (Recep): bu ölçüm moderator'ün DB düzeyinde neredeyse yetkisiz olduğunu
söylüyor — viewer ile aynı sınıf. Rol ya DB'de açılmalı (politikalara moderator
eklenerek) ya da vaat edilmediği kabul edilmeli. UI'yi geniş tutmak üçüncü bir seçenek
DEĞİL: sessiz-boş ekran üretir. Ölçemediğim rota FAIL-CLOSED bırakıldı (listede yok).
```

```text
AÇIK KARAR (Recep): viewer vaat edilmiş bir yetenek mi, yoksa kaldırılacak mı?
Cevap "vaat" ise açılacak sayfalar RLS ölçümüyle tek tek eklenir.
```
