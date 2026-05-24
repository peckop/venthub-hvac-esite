---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\audit.ts
skeleton_hash: 7826bc787cad34e3
generated_at: 2026-05-23T22:30:55Z
---

## Genel Bakış
VentHub HVAC platformunun denetim modülü, sistemdeki yönetici hesapları tarafından gerçekleştirilen tüm önemli eylemlerin kaydını tutmak için tasarlanmıştır. Supabase veritabanı entegrasyonu üzerinden bu kayıtları güvenli bir şekilde saklayarak, sorumluluk takibi ve sistem denetimi için altyapı sağlar.

## Fonksiyon Grupları
### Yönetici Eylemi Kaydetme İşlevleri
Tekli veya toplu halde gelen yönetici eylemi verilerini alır, Supabase istemcisi ile entegre çalışarak kalıcı denetim kayıtlarına dönüştürüp saklar.
- logAdminAction

---

## AXIOMS – Mimari Varsayımlar
Bu modül, sistem yöneticilerinin gerçekleştirdiği işlemlerin denetim kaydını oluşturmak üzere tasarlanmıştır, çalışması için fonksiyonuna iletilen zorunlu parametrelerin tam ve geçerli olarak sağlanması şarttır.

[Aksiyom 1]: Eğer yetkili ve çalışır durumda bir SupabaseClient nesnesi sağlanmazsa, hiçbir denetim kaydı kalıcı olarak saklanamaz ve tüm loglama işlemleri başarısız olur.
[Aksiyom 2]: Eğer AdminAuditLogInput tipinde tekil veya bu tipin dizisi formatında geçerli bir girdi nesnesi sağlanmazsa, logAdminAction fonksiyonu çalışamaz ve hiçbir log kaydı oluşturulamaz.
[Aksiyom 3]: Eğer girdi olarak sağlanan dizi içindeki herhangi bir eleman AdminAuditLogInput tip uyumsuzluğu taşıyorsa, toplu loglama işlemi başarıyla tamamlanamaz.

---

## FONKSIYON DETAYLARI

### logAdminAction
**Ne yapar**: Yönetici (admin) paneli üzerinden gerçekleştirilen tüm işlemleri sistemin denetim günlüğüne (audit log) kaydetmekle sorumludur. Tek bir işlem kaydını veya aynı anda birden fazla işlem koleksiyonunu kaydedebilir, tüm yönetici kaynaklı değişiklik ve erişim hareketlerinin merkezi, izlenebilir bir yerde toplanmasını sağlar. Tüm denetim kayıtlarının güvenli bir şekilde saklanması sayesinde sistemdeki yetkisiz veya hatalı işlemlerin sonradan tespit edilmesine olanak tanır.
**Nasıl yapar**: Aldığı girdi verisini tekil veya çoklu yapısına bakmaksızın standart bir formata dönüştürür, ardından Supabase istemcisinin veritabanı yazım metodlarını kullanarak denetim kayıtlarını ilgili veritabanı tablosuna ekler. İşlem asenkron olarak yürütülür, kayıt işlemi sırasında oluşabilecek tüm hataları yakalayıp ilgili hata akışına yönlendirir, kaydedilen tüm girdilerin eksiksiz bir şekilde veritabanına işlenmesini garanti eder.
**Parametreler**:
- name: client — type: SupabaseClient — Sistemin Supabase ile olan yetkilendirilmiş veritabanı bağlantısını yöneten istemci nesnesi; kayıt işlemlerinin güvenli bir şekilde veritabanına iletilmesini sağlar
- name: input — type: AdminAuditLogInput | AdminAuditLogInput[] — Kaydedilecek yönetici işleminin tüm detaylarını içeren, tekil veya birden fazla olabilen girdi nesnesi; her bir girdi işlem tarihi, yönetici kimliği, işlem türü ve ilgili veri detaylarını barındırır
**Dönüş**: Promise<void> — Hiçbir doğrudan değer döndürmeyen, işlemin başarıyla tamamlanmasını veya bir hatayla karşılaşmasını işaret eden asenkron promise nesnesi; await ile beklenerek kayıt işleminin tamamlanması sağlanabilir.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\audit.ts::logAdminAction
- **params**: client: SupabaseClient, input: AdminAuditLogInput | AdminAuditLogInput[]
- **ic_degiskenler**:
  - `rows` — Girdi olarak alınan log verisini tek tip diziye standartlaştıran, tüm log girişlerini tutan dizi değişkeni
  - `userId` — Oturum açmış mevcut kullanıcının ID'sini tutan, loglarda eksikse actor olarak atanacak null olabilen string değişken
  - `sessData` — `client.auth.getSession()` çağrısından dönen oturum verisi, oturum içindeki kullanıcı ID'sini almak için kullanılır
  - `data` — `client.auth.getUser()` çağrısından dönen kullanıcı verisi, getSession'dan ID alınamazsa kullanıcı ID'sini almak için kullanılır
  - `prepared` — Orijinal log dizisi (rows) üzerinden işlenerek eksikse actor alanı eklenmiş, veritabanı eklemesine hazır log dizisi
  - `r` — Log dizisini işleyen map fonksiyonunda sırasıyla işlenen her tekil AdminAuditLogInput türündeki log girdisi
  - `hasActor` — İşlenen log girdisinde `actor` özelliğinin tanımlı ve null olmadığını kontrol eden boolean değer
  - `error` - Supabase `admin_audit_log` tablosuna ekleme işlemi sırasında oluşabilecek hata nesnesi
  - `e` — Ana try bloğu içinde oluşan yakalanan genel istisna nesnesi
- **Dönüş**: Promise<void>

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\audit.ts::rows.map callback
- **params**: r: AdminAuditLogInput
- **ic_degiskenler**:
  - `hasActor` — İşlenen log girdisinde `actor` özelliğinin nesnede tanımlı ve null olmadığını kontrol eden boolean değer
- **Dönüş**: Orijinal log girdisi veya actor alanı eklenmiş genişletilmiş log girdisi (AdminAuditLogInput & { actor: string | null })

---

## NODE ID STANDARD

  file: src\lib\audit.ts
  function: src\lib\audit.ts::logAdminAction

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminAuditAction
  export: AdminAuditLogInput
  export: logAdminAction