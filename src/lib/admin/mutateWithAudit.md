---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\admin\mutateWithAudit.ts
skeleton_hash: 4d7787902789d7fe
entity_hashes:
  func:AdminPermissionError:constructor: f2c82c82a313c617
  func:mutateWithAudit: 6fd7e78effa72486
  overview: f4a791bb090e6115
generated_at: 2026-06-19T20:47:59Z
---

## Genel Bakış
Bu modül, admin işlemleri için veritabanı yazma (mutasyon) operasyonlarını sarmalar ve her değişikliği denetim kaydı (audit) ile birlikte gerçekleştirir. Supabase istemcisini alarak yetkilendirme kontrolü yapar, işlemi yürütür ve eğer izin yoksa özel bir hata fırlatır.

## Fonksiyon Grupları
### Mutasyon ve Denetim İşlemleri
Veritabanı yazma işlemlerini denetim bilgileriyle zenginleştirerek yürütür ve sürecin bütünlüğünü sağlar.
- `mutateWithAudit`

### Hata ve İzin Yönetimi
Yönetici yetki hatalarını temsil eden özel durum sınıfını tanımlar.
- `AdminPermissionError` (sınıf)

---

## AXIOMS – Mimari Varsayımlar

Bu modül veritabanı mutation işlemlerini audit (denetim) kaydıyla birlikte yürütür. Aşağıdaki varsayımlar fonksiyon imzalarına dayanarak çıkarılmıştır.

---

## FONKSİYON DETAYLARI

### mutateWithAudit
**Ne yapar**: Admin arayüzünden yapılan tüm yazma操作larının (oluşturma, güncelleme, silme) merkeziyetçi olarak geçmek zorunda olduğu asenkron fonksiyondur. Bu fonksiyon, yetkilendirme doğrulaması, iş mantığının yürütülmesi ve denetim kaydı tutma süreçlerini tek bir kapıda (single gate) orkestra ederek tutarlılık ve güvenlik sağlar.

**Nasıl yapar**: Fonksiyon, öncelikle `canWrite` argümanı aracılığıyla bir RBAC kontrolü yapar; eğer yazma izni yoksa `AdminPermissionError` fırlatır. İzin varsa, `args.fn()` callback'ini çalıştırarak asıl veritabanı işlemini (örn: insert, update) yürütür. İşlem başarıyla tamamlandıktan sonra, `auditedByEdge` flag'i `true` değilse, `logAdminAction` fonksiyonunu çağırarak bu eylemi denetim günlüğüne kaydeder. Denetim günlüğü yazma işlemi hata verse bile bu, ana işlemin sonucunu **engellemez**; hata sadece `console.error`'a yazılır ve "en iyi çabayı göster" (best-effort) prensibiyle hareket edilir.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı işlemleri için kullanılan Supabase istemcisi nesnesi. `Database` generic parametresi ile şema tipi güvence altına alınmıştır.
- `args`: `MutateWithAuditArgs<R>` — Fonksiyonun tüm parametrelerini ve iş mantığını içeren nesne. Bu nesne içinde `canWrite` (izin bayrağı), `fn` (gerçekleşecek veritabanı işlemini döndüren fonksiyon), `auditedByEdge` (denetimin başka bir katmanda yapılıp yapılmadığını belirten flag), `resource` (işlem yapılan kaynak tablo adı), `rowPk` (satır birincil anahtarı), `action` (eylem türü), `before` (işlem öncesi veri), `after` (işlem sonrası veri) ve `comment` (yorum) gibi bilgiler bulunur. Generic `R` tipi, `fn()` fonksiyonunun dönüş tipini temsil eder.

**Dönüş**: `Promise<R>` — `args.fn()` fonksiyonunun başarıyla çalışması durumunda döndürdüğü değeri `Promise` içinde sararak geri döner.

### AdminPermissionError.constructor
**Ne yapar**: `AdminPermissionError` özel hata sınıfının kurucu (constructor) metodudur. Görevi, bir yetkilendirme hatası oluştuğunda anlamlı ve standart bir hata nesnesi oluşturmaktır.

**Nasıl yapar**: JavaScript'in `Error` sınıfını `super()` çağrısıyla genişleterek (extend ederek) temel hata yapısını kurar. Kendisine parametre olarak gelen `resource` dizgesini, kullanıcıya anlamlı bir hata mesajı oluşturmak için bir dizeye gömer. Ek olarak, hata nesnesinin `name` özelliğini 'AdminPermissionError' olarak ayarlar, böylece hata yakalandığında hata türü kolayca tanımlanabilir.

**Parametreler**:
- `resource`: `string` — Yazma yetkisi olmayan kaydın (örn: tablonun) adı. Bu bilgi, hata mesajında kullanıcıya hangi kaynakta yetki problemi olduğu açıkça belirtilmesini sağlar.

**Dönüş**: Yok (yapısal bir sınıftır, doğrudan değer döndürmez).

---

## İTHALATLAR (IMPORTS)
- import: @/lib/audit::logAdminAction
- import: @/types/database.types::type { Database }
- import: @supabase/supabase-js::type { SupabaseClient }

---

## INTERFACES

### MutateWithAuditArgs
- `resource: string`
- `canWrite: boolean`
- `action: AuditAction`
- `rowPk: string | null`
- `before: Record<string, unknown> | null`
- `after: Record<string, unknown> | null`
- `comment?: string`
- `auditedByEdge?: boolean`
- `fn: () => Promise<R>`

---

## TYPE ALIASES

### AuditAction
Admin mutasyon eylemi — audit `action` alanına maplenir. (audit.ts `AdminAuditAction`'ın yazma alt-kümesi; 'CUSTOM' mutasyon değildir.)
```typescript
type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/mutateWithAudit.ts::AdminPermissionError.constructor
- **params**: `(resource: string)` — hata ile ilgili kaynağın adı
- **ic_degiskenler**:
  - *(yok — sadece super çağrısı ve this.name ataması var)*
- **Dönüş**: yok *(constructor — instance döndürür)*

---

## NODE ID STANDARD

  file: src\lib\admin\mutateWithAudit.ts
  function: src\lib\admin\mutateWithAudit.ts::mutateWithAudit
  class: src\lib\admin\mutateWithAudit.ts::AdminPermissionError

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPermissionError
  export: AuditAction
  export: MutateWithAuditArgs
  export: mutateWithAudit