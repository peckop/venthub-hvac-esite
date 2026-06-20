---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\audit.ts
skeleton_hash: 9ad955496d105f1f
entity_hashes:
  func:logAdminAction: 83ab9f1273deee6a
  overview: beb3974c7555e069
generated_at: 2026-06-19T20:48:09Z
---

## Genel Bakış
VentHub HVAC platformunun denetim modülü, yönetici hesapları tarafından gerçekleştirilen tüm önemli işlemlerin izlenebilirliğini sağlamak amacıyla tasarlanmıştır. Supabase veritabanı üzerinden tekli veya toplu olarak gelen eylem kayıtlarını kalıcı olarak depolar. Bu sayede sistemdeki değişikliklerin sorumluluk takibi ve denetim Traili tek bir merkezi noktadan yürütülebilir.

## Fonksiyon Grupları
### Yönetici Eylemi Kaydetme
Yönetici panelinde gerçekleştirilen tüm işlemleri denetim günlüğüne aktarmaktan sorumludur. Tek bir eylem veya birden fazla eylem koleksiyonu alarak Supabase istemcisi aracılığıyla güvenli bir şekilde saklar.
- logAdminAction

---

## AXIOMS – Mimari Varsayımlar
Bu modül, yönetici eylemlerinin denetim kaydını oluşturmak ve saklamak için tasarlanmıştır; temel işlevsellik için geçerli bir Supabase istemcisi ve en az bir geçerli eylem kaydı verisi zorunludur.

[Aksiyom 1]: Eğer `client` parametresi, Veritabanı ile güvenli bir bağlantıyı temsil eden geçerli bir `SupabaseClient` instance'ı değilse, eylem kaydı veritabanına yazılamaz ve fonksiyon başarısız olur.

[Aksiyom 2]: Eğer `input` parametresi `AdminAuditLogInput` veya `AdminAuditLogInput[]` türünde geçerli bir veri içermiyorsa (örneğin `null`, `undefined` veya boş bir dizi `[]` ise), veritabanına hiçbir kayıt eklenmez ve fonksiyon sessizce tamamlanır.

[Aksiyom 3]: Eğer `input` tekil bir `AdminAuditLogInput` nesnesi olarak verilmişse, bu nesnenin `AdminAuditLogInput` arayüzünün tanımladığı tüm zorunlu alanları içermesi gerekir; aksi halde veritabanı INSERT işlemi başarısız olur.

[Aksiyom 4]: Eğer `input` bir dizi (`AdminAuditLogInput[]`) olarak verilmişse, dizideki her bir eleman için ayrı ayrı denetim kaydı oluşturulması beklenir; toplu ekleme işleminde bir elemanın hatalı olması durumunda, diğer elemanların akıbeti fonksiyonun iç uygulamasına bağlıdır (bilinmiyor).

---

## FONKSİYON DETAYLARI

### logAdminAction
**Ne yapar**: Admin panelinde gerçekleştirilen işlemleri ve yapılan değişiklikleri denetim amacıyla Supabase veritabanındaki `admin_audit_log` tablosuna kaydeder. Tek bir işlem veya birden fazla işlem toplu olarak bu fonksiyonla loglanabilir.

**Nasıl yapar**: Fonksiyon, girdi olarak verilen veya girdi dizisine dönüştürülen her bir `AdminAuditLogInput` nesnesini işler. Mevcut oturumdaki kullanıcının kimliğini (actor) belirlemek için öncelikle `getSession` metodunu, başarısız olursa `getUser` metodunu dener. Eğer girdi nesnesinde `actor` alanı açıkça belirtilmemişse, bu bilgiyi otomatik olarak tespit edilen kullanıcı kimliği ile doldurur. Hazırlanan satırları `insert` metodunu kullanarak veritabanına ekler ve `.select('id')` zinciriyle isteğin hemen gerçekleştirilmesini sağlar. Tüm sürecin hata yönetimi `try-catch` blokları ile sarılmıştır; hatalar yalnızca konsola uyarı olarak yazdırılır ve ana iş akşı durdurulmaz.

**Parametreler**:
- `client`: SupabaseClient — Veritabanı ve kimlik doğrulama işlemleri için kullanılacak Supabase istemcisi
- `input`: AdminAuditLogInput | AdminAuditLogInput[] — Tek bir denetim kaydı nesnesi veya birden fazla kaydı içeren dizi

**Dönüş**: Promise<void — Fonksiyon herhangi bir değer döndürmez; işlemi arka planda sessizce tamamlar.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::type { SupabaseClient }

---

## INTERFACES

### AdminAuditLogInput
- `table_name: string`
- `row_pk?: string | null`
- `action: AdminAuditAction`
- `before?: unknown`
- `after?: unknown`
- `comment?: string | null`
- `actor?: string | null`

---

## TYPE ALIASES

### AdminAuditAction
```typescript
type AdminAuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'CUSTOM'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/audit.ts::logAdminAction
- **params**: `(client: SupabaseClient, input: AdminAuditLogInput | AdminAuditLogInput[])`
- **ic_degiskenler**:
  - `rows` — input'un array olup olmadığını kontrol eder; array değilse tek elemanlı array'e sarar. Supabase insert işlemi için her zaman array Formatında hazırlanır
  - `userId` — mevcut oturum açmış kullanıcının ID'si; input içinde `actor` alanı belirtilmemişse `actor` olarak kullanılacak fallback değer. `null` ile başlatılır, auth çağrılarıyla doldurulmaya çalışılır
  - `sessData` — `client.auth.getSession()` çağrısının sonucu; oturum verisi ve session user ID bilgisini içerir
  - `prepared` — `rows` dizisinin her elemanına map işlemi uygulanmış hali. Her satırda `actor` alanı mevcutsa dokunulmaz, yoksa `userId` değeri ile `actor` alanı eklenerek yeni bir obje oluşturulur
  - `hasActor` — map callback'i içinde her bir satır `r` için, `r.actor` alanının var olup olmadığını ve `null` olmadığını kontrol eden boolean ifade
  - `r` — `rows.map()` callback'indeki her bir `AdminAuditLogInput` elemanı; tek tek işlenerek `prepared` dizisine dönüştürülür
  - `error` — `client.from('admin_audit_log').insert(prepared).select('id')` çağrısının döndürdüğü hata nesnesi; `null` değilse insert başarısız olmuştur ve `console.warn` ile loglanır
- **Dönüş**: `Promise<void>` — fonksiyon değer döndürmez; yan etki olarak `admin_audit_log` tablosuna insert işlemi yapar ve hata durumunda `console.warn` ile konsola uyarı basar. Outer `try-catch` ile auth çağrıları ve insert işlemi exception'ları yakalanır, fonksiyon asla throw etmez

---

## NODE ID STANDARD

  file: src\lib\audit.ts
  function: src\lib\audit.ts::logAdminAction

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAuditAction
  export: AdminAuditLogInput
  export: logAdminAction