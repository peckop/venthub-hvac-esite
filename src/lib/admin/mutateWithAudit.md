---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\admin\mutateWithAudit.ts
skeleton_hash: 03e86d09225587ae
entity_hashes:
  func:AdminPermissionError:constructor: 6bdb0294b4ca977f
  func:mutateWithAudit: e6e4bf4f5f88c365
  overview: f4a791bb090e6115
generated_at: 2026-08-27T06:57:14Z
---

## Genel Bakış

Bu modül, veritabanı mutasyon işlemlerini denetim (audit) kaydı eşliğinde gerçekleştiren bir yardımcı fonksiyon ve bu süreçte oluşabilecek yetkilendirme hataları için özel bir hata sınıfı içerir. Supabase istemcisi üzerinden çalışan modül, mutasyon argümanlarını alıp sonuç döndüren genel bir yapı sunar.

## Fonksiyon Grupları

### Veritabanı Mutasyon İşlemleri
Veritabanında değişiklik (mutasyon) gerçekleştirirken denetim kaydı tutulmasını sağlayan ana işlevsellik.
- mutateWithAudit

### Hata Yönetimi
Yönetici (admin) yetkilendirme hatalarını temsil eden özel hata sınıfını tanımlar. Sınıf, etkilenen kaynağı belirten bir parametre alır.
- AdminPermissionError (constructor)

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imzalardan çıkarım yapılabilmektedir. Gövde bilgisi olmadan kesin aksiyom üretilemez.

[Aksiyom 1]: Eğer `supabase` parametresi olarak geçerli bir `SupabaseClient<Database>` nesnesi yoksa, `mutateWithAudit` fonksiyonu çalışamaz.

[Aksiyom 2]: Eğer `args` parametresi olarak `MutateWithAuditArgs<R>` tipinde bir değer yoksa, `mutateWithAudit` fonksiyonu çalışamaz.

[Aksiyom 3]: Eğer `resource` parametresi verilmezse, `AdminPermissionError` örneği oluşturulamaz.

**Not:** Fonksiyon gövdeleri (iç implementasyon) sağlanmadığından, audit (denetim) işleminin nasıl yapıldığı, hangi koşullarda `AdminPermissionError` fırlatıldığı, hata yönetimi ve transaction davranışları gibi kritik mimari detaylar bilinmemektedir. Daha kesin aksiyomlar için fonksiyon gövdesinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### mutateWithAudit
**Ne yapar**: Admin yazma işlemleri için yetki kontrolü ve audit loglama sağlayan merkezi fonksiyondur. K3 (yetki) ve K4 (audit) katmanları için tek kapı işlevi görür; tüm admin yazma yollarının bu fonksiyondan geçmesi gereklidir.

**Nasıl yapar**: Fonksiyon üç aşamalı bir süreç izler. İlk olarak `args.canWrite` değeri kontrol edilir; eğer `false` ise `AdminPermissionError` fırlatılarak işlem durdurulur. Yetki kontrolü geçildikten sonra `args.fn()` çalıştırılarak asıl yazma işlemi gerçekleştirilir. Son olarak `args.auditedByEdge` değeri `false` ise audit loglama yapılır; bu aşamada `args.afterFrom` fonksiyonu varsa `result` parametresiyle çağrılarak `after` değeri elde edilir, başarısız olursa `args.after` değerine geri dönülür ve hata `console.error`'a yazılır. Audit loglama işlemi `logAdminAction` fonksiyonu aracılığıyla gerçekleştirilir ve bu işlemde oluşan hatalar `fn()` sonucunu **bloklamaz**; yalnızca `console.error`'a yazılır (best-effort yaklaşımı). Docstring'e göre asıl yetki kapısı sunucudaki **RLS**'tir.

**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase veritabanı istemcisi
- args: MutateWithAuditArgs<R> — İşlem parametrelerini içeren nesne; şu alanları içerir:
  - canWrite: boolean — Yazma yetkisi olup olmadığını belirten değer
  - resource: string — Kaynak adı (hata mesajında kullanılır)
  - fn: () => Promise<R> — Gerçekleştirilecek asenkron yazma fonksiyonu
  - auditedByEdge: boolean — Edge tarafından audit loglanıp loglanmayacağını belirten değer
  - afterFrom: ((result: R) => unknown) | undefined — Sonuçtan `after` değerini çıkaran fonksiyon (opsiyonel)
  - after: unknown — `afterFrom` yoksa veya başarısız olursa kullanılacak değer
  - rowPk: string — Satır birincil anahtarı
  - action: string — Gerçekleştirilen işlem türü
  - before: unknown — İşlem öncesi durum
  - comment: string | undefined — Opsiyonel yorum

**Dönüş**: Promise<R> — `args.fn()` fonksiyonunun dönüş değeri

### constructor
**Ne yapar**: `AdminPermissionError` sınıfının yapıcı metodudur. RBAC (Role-Based Access Control) sisteminde belirli bir kaynak üzerinde yazma yetkisi bulunmadığında fırlatılacak özel bir hata nesnesi oluşturur.

**Nasıl yapar**: Üst sınıfın (muhtemelen `Error`) `super()` metodunu çağırarak hata mesajını iletir. Mesajda, yetkisiz erişim denemesinin yapıldığı kaynak adı string interpolasyonu ile yerleştirilir. Ardından `this.name` özelliği `'AdminPermissionError'` olarak ayarlanarak hatanın türü tanımlanır.

**Parametreler**:
- resource: string — Yetkisiz erişim denemesinin yapıldığı kaynak adını temsil eder. Hata mesajında bu değer kullanıcıya gösterilir.

**Dönüş**: Belirtilmemiş. Constructor'lar tipik olarak sınıf örneğini döndürür ancak kaynak kodda açık bir dönüş tipi tanımlanmamıştır.

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
- `afterFrom?: (result: R) => Record<string, unknown> | null`
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
- **params**: `resource: string`
- **ic_degiskenler**:
  - `resource` — `super()` çağrısında hata mesajında kaynak adı olarak kullanılır; mesaj formatı: `RBAC: '${resource}' kaynağında yazma yetkisi yok`
- **Dönüş**: yok (constructor; `this.name` alanını `'AdminPermissionError'` olarak ayarlar)

### [N2_NASIL] AST Pointer: src/lib/admin/mutateWithAudit.ts::mutateWithAudit
- **params**: `supabase: SupabaseClient<Database>`, `args: MutateWithAuditArgs<R>`
- **ic_degiskenler**:
  - `args.canWrite` — yazma yetkisi olup olmadığını belirten boolean; `false` ise `AdminPermissionError` fırlatılır
  - `args.resource` — yetki hatası durumunda `AdminPermissionError`'a kaynak adı olarak geçilir, audit log'da `table_name` olarak kullanılır
  - `result` — `args.fn()` çağrısının dönüş değeri; fonksiyonun asıl mutasyon sonucunu tutar
  - `args.auditedByEdge` — audit log'un edge tarafında yapılıp yapılmadığını gösteren boolean; `true` ise audit log bloğu atlanır
  - `after` — audit log'a gönderilecek "sonrası" durumu; başlangıçta `args.after` değerini alır
  - `args.afterFrom` — varsa `result`'ı alıp `after` değerini dönüştüren fonksiyon; başarısız olursa `args.after`'a düşülür
  - `e` — `catch` bloklarında yakalanan hata nesnesi; `console.error` ile loglanır
  - `args.rowPk` — audit log'da satır birincil anahtarı olarak kullanılır
  - `args.action` — audit log'da gerçekleştirilen işlem türünü belirtir
  - `args.before` — audit log'da işlem öncesi durumu belirtir
  - `args.comment` — audit log'da işlem açıklaması olarak kullanılır
- **Dönüş**: `Promise<R>` — mutasyon sonucu olan `result` değerini döndürür

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