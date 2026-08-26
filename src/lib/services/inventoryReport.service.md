---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\inventoryReport.service.ts
skeleton_hash: fb9f50ae8dd5b2a8
entity_hashes:
  func:getInventoryMovements: 07db97961f2a156e
  func:movementQueryFn: 2f48e11557ce3e37
  overview: 100075d17225ac3b
generated_at: 2026-08-24T12:50:12Z
---

## Genel Bakış
Stok hareketlerini tarih aralığına göre sorgulamak ve raporlama amaçlı veri sağlamakla sorumlu bir servis modülüdür. Depo/havuz bazlı stok hareket kayıtlarını dış veri kaynağı (Supabase) üzerinden çekerek raporlama ve izleme süreçlerine ham veri besler. Mimari olarak veri erişim katmanında, servis katmanının en alt halkasında konumlanır.

## Fonksiyon Grupları

### Stok Hareket Sorgulama
Belirtilen tarih aralığındaki stok hareketlerini dış veri tabanından çekerek raporlama için ham veri sağlar. Sorgu oluşturma ve veri çekme işlevlerini içerir.
- movementQueryFn, getInventoryMovements

---

## AXIOMS – Mimari Varsayımlar

[Aksiyom 1]: Eğer `supabase` parametresi verilmezse, fonksiyon çağrılamaz; bu parametre zorunludur ve default değeri yoktur.

[Aksiyom 2]: Eğer `params` nesnesinde `from` ve `to` alanları verilmezse, sorgunun hangi tarih aralığını kapsayacağı bilinmiyor; fonksiyon gövdesindeki davranış görülmedi.

[Aksiyom 3]: Eğer `supabase` parametresi `SupabaseClient<Database>` tipinde değilse, derleme zamanında tip uyumsuzluğu hatası oluşur.

[Aksiyom 4]: Eğer veritabanında `InventoryMovementRow` yapısına karşılık gelen tablo veya görünüm mevcut değilse, sorgu çalışma zamanında hata döndürür.

[Aksiyom 5]: Eğer `movementQueryFn` fonksiyonu `supabase` parametresi olmadan çağrılırsa, çalıştırılamaz; bu fonksiyon da zorunlu parametre alır ve default değeri yoktur.

---

## FONKSİYON DETAYLARI

### movementQueryFn
**Ne yapar**: Veritabanı sorgu nesnesi oluşturur ve döndürür. Envanter hareketlerini sorgulamak için temel sorgu yapılandırmasını hazırlayan yardımcı fonksiyondur.

**Nasıl yapar**: Parametre olarak aldığı Supabase istemcisi üzerinden bir sorgu nesnesi oluşturur ve bu nesneyi döndürür. Fonksiyonun iç yapısı bu kaynak dosyada yer almamaktadır; muhtemelen başka bir modülde tanımlıdır ve buraya import edilmiştir.

**Parametreler**:
- supabase: SupabaseClient<Database> — Supabase veritabanı istemcisi nesnesi. Generic parametre olarak `Database` tipini alır ve tip güvenli sorgular yapılmasını sağlar.

**Dönüş**: Bilinmiyor. Kaynakta dönüş tipi açıkça belirtilmemiştir.

### getInventoryMovements
**Ne yapar**: Bu fonksiyon, veritabanındaki envanter hareketlerini (stok giriş/çıkış kayıtlarını) belirli bir tarih aralığına göre sorgulayarak döndürür. Her bir hareket kaydı, ilgili ürünün adını da içerecek şekilde zenginleştirilmiş (joined) olarak getirilir. Fonksiyon, hareketlerin ne zaman gerçekleştiğine göre azalan sırada sıralanmış bir liste sunar.

**Nasıl yapar**: Fonksiyon öncelikle Supabase istemcisi aracılığıyla `inventory_movements` tablosuna bir sorgu başlatır ve `products` tablosu ile ilişkilendirerek ürün adını (`name`) dahil eder. Ardından, `created_at` alanına göre azalan (en yeniden en eskiye) sıralama uygular. Eğer `params.from` parametresi sağlanmışsa, sorguya `gte` (greater than or equal) koşulu ekleyerek belirtilen tarihten itibaren olan kayıtları filtreler. Benzer şekilde, `params.to` parametresi varsa `lte` (less than or equal) koşulu ekleyerek belirtilen tarihe kadar olan kayıtları dahil eder. Sorgu çalıştırıldıktan hemen sonra bir hata oluşursa fonksiyon bu hatayı fırlatır; aksi halde elde edilen veriyi `InventoryMovementRow` tipine dönüştürerek döndürür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı işlemleri için kullanılan yetkilendirilmiş Supabase istemci nesnesi. Bu istemci,.tip güvenliği sağlayacak şekilde `Database` generic tipi ile tanımlanmıştır.
- `params`: `{ from?: Date; to?: Date }` — Sorgu için kullanılacak opsiyonel tarih aralığı filtresini içeren nesne. `from` alanı sorgulanacak kayıtların başlangıç tarihini, `to` alanı ise bitiş tarihini belirtir. Her iki alan da opsiyoneldir ve sağlanmadığında tüm tarihlerdeki kayıtlar getirilir.

**Dönüş**: `Promise<InventoryMovementRow[]>` — Asenkron olarak çözülen ve envanter hareket satırlarını içeren bir dizi (array) döndürür. Her bir satır; hareketin ID'si, miktar değişimi (`delta`), hareket nedeni (`reason`), oluşturulma tarihi, ürün ID'si ve ilişkili ürünün adını içerir. Sorgu sonucunda veri bulunamazsa boş bir dizi döner.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: @supabase/supabase-js::type { QueryData, SupabaseClient }

---

## TYPE ALIASES

### InventoryMovementRow
```typescript
type InventoryMovementRow = QueryData<ReturnType<typeof movementQueryFn>>[number]
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: inventoryReport.service.ts::movementQueryFn
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı
- **ic_degiskenler**: yok
- **Dönüş**: Supabase query builder — `inventory_movements` tablosundan `id`, `delta`, `reason`, `created_at`, `product_id` ve `products(name)` alanlarını seçer, `created_at` alanına göre azalan sıralar

### [N2_NASIL] AST Pointer: inventoryReport.service.ts::getInventoryMovements
- **params**: `supabase` — SupabaseClient<Database> tipinde, veritabanı bağlantısı; `params` — `{ from?: Date; to?: Date }` tipinde, tarih aralığı filtresi
- **ic_degiskenler**:
  - `query` — `movementQueryFn(supabase)` çağrısının döndürdüğü sorgu nesnesi, filtreleme işlemleri bunun üzerinde zincirleme yapılır
  - `params.from` — opsiyonel başlangıç tarihi, varsa `created_at` alanına `gte` (büyük veya eşit) filtresi uygulanır; `toISOString()` ile string'e dönüştürülür
  - `params.to` — opsiyonel bitiş tarihi, varsa `created_at` alanına `lte` (küçük veya eşit) filtresi uygulanır; `toISOString()` ile string'e dönüştürülür
  - `data` — sorgu sonucu dönen satırlar, hata yoksa döndürülen veri
  - `error` — sorgu sırasında oluşan hata nesnesi, varsa `throw` ile fırlatılır
- **Dönüş**: `Promise<InventoryMovementRow[]>` — hareket kayıtlarını içeren dizi; hata durumunda hata fırlatılır, veri yoksa boş dizi döner

---

## NODE ID STANDARD

  file: src\lib\services\inventoryReport.service.ts
  function: src\lib\services\inventoryReport.service.ts::movementQueryFn
  function: src\lib\services\inventoryReport.service.ts::getInventoryMovements

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryMovementRow
  export: getInventoryMovements
  export: movementQueryFn