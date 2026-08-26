---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\lib\admin\mutateWithAudit.ts
skeleton_hash: 1bbef8d128a791ff
entity_hashes:
  func:AdminPermissionError:constructor: 6bdb0294b4ca977f
  func:mutateWithAudit: e6e4bf4f5f88c365
  overview: f4a791bb090e6115
generated_at: 2026-08-25T07:27:53Z
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
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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
  - `resource` — Hata mesajında kullanılacak kaynak adı. `super` çağrısına `'${resource}'` olarak iletilir.
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/lib/admin/mutateWithAudit.ts::mutateWithAudit
- **params**: `supabase: SupabaseClient<Database>`, `args: MutateWithAuditArgs<R>`
- **ic_degiskenler**:
  - `args.canWrite` — Yazma izni olup olmadığını kontrol eden boolean değer. `false` ise `AdminPermissionError` fırlatılır.
  - `args.resource` — Hata fırlatma ve denetim günlüğü için kullanılan kaynak adı.
  - `args.fn` — Çağrılacak ve sonucu döndürülecek mutasyon fonksiyonu.
  - `args.auditedByEdge` — Denetim günlüğünün kenar (edge) tarafından yazılıp yazılmadığını gösteren boolean. `true` ise denetim günlüğü atlanır.
  - `args.after` — Denetim günlüğü için mutasyon sonrası durumu temsil eden veri.
  - `args.afterFrom` — Mutasyon sonucundan (`result`) denetim günlüğü için sonrası durumu çıkaran fonksiyon. Varsa kullanılır, başarısız olursa `args.after` kullanılır.
  - `args.rowPk` — Denetim günlüğü için satır birincil anahtarı.
  - `args.action` — Denetim günlüğü için gerçekleştirilen eylem.
  - `args.before` — Denetim günlüğü için mutasyon öncesi durumu temsil eden veri.
  - `args.comment` — Denetim günlüğü için yorum.
  - `result` — `args.fn()` çağrısının döndürdüğü mutasyon sonucu.
  - `after` — Denetim günlüğüne yazılacak nihai sonrası durum verisi. Önce `args.afterFrom` ile hesaplanır, başarısız olursa `args.after` kullanılır.
  - `e` — `args.afterFrom` veya `logAdminAction` çağrılarındaki hataları yakalamak için kullanılan hata nesnesi.
- **Dönüş**: `Promise<R>` — Mutasyon fonksiyonunun (`args.fn`) döndürdüğü sonuç.

---

## NODE ID STANDARD

  file: mutateWithAudit.ts
  function: mutateWithAudit.ts::mutateWithAudit
  class: mutateWithAudit.ts::AdminPermissionError

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminPermissionError
  export: AuditAction
  export: MutateWithAuditArgs
  export: mutateWithAudit