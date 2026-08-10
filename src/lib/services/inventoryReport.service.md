---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\services\inventoryReport.service.ts
skeleton_hash: 4171272a6310e53d
entity_hashes:
  func:getInventoryMovements: 83ca042894e9a1fe
  overview: d0f434ef60ccbc24
generated_at: 2026-06-19T20:48:28Z
---

## Genel Bakış
Stok hareketlerini tarih aralığına göre sorgulamak ve raporlama amaçlı veri sağlamakla sorumludur. Modül, depo/havuz bazlı stok hareket kayıtlarını dış kaynak (Supabase) üzerinden çekerek raporlama ve izleme süreçlerine temel veri besler. Mimari olarak veri erişim katmanında, servis katmanının en alt halkasında konumlanır.

## Fonksiyon Grupları

### Stok Hareket Sorgulama
Belirtilen tarih aralığındaki tüm stok hareketlerini (giriş, çıkış, transfer vb.) dış veri tabanından çekerek raporlama için ham veri sağlar.
- `getInventoryMovements`

---

## AXIOMS – Mimari Varsayımlar

Bu fonksiyon imzasından çıkarılabilecek mimari varsayımlar:

[Aksiyom 1]: Eğer `supabase` parametresi geçerli bir SupabaseClient<Database> bağlantısı değilse, fonksiyon çağrı hatası ile karşılaşır.

[Aksiyom 2]: Eğer `params.from` ve `params.to` değerleri hiç verilmezse, fonksiyonun varsayılan davranışının ne olacağı **bilinmiyor** (tüm hareketleri mi döner, belirli bir varsayılan aralık mı kullanır — fonksiyon gövdesi olmadan belirlenemez).

[Aksiyom 3]: Eğer `params.from` > `params.to` şeklinde geçerli olmayan bir tarih aralığı verilirse, fonksiyonun davranışı **bilinmiyor** (boş dizi mi döner, hata mı fırlatır — fonksiyon gövdesi olmadan belirlenemez).

[Aksiyom 4]: Eğer veritabanında `inventory_movements` tablosu veya ilgili view'ı mevcut değilse, fonksiyon Supabase tarafında sorgu hatası ile karşılaşır.

---

**Not:** Fonksiyon gövdesi (gövde kodu) paylaşılmadığı için, iç mantık, filtreleme koşulları, sıralama ve hata yönetimiyle ilgili aksiyomlar üretilememiştir.

---

## FONKSİYON DETAYLARI

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
- import: @supabase/supabase-js::type { SupabaseClient }

---

## INTERFACES

### InventoryMovementRow
- `id: string`
- `delta: number`
- `reason: string`
- `created_at: string`
- `product_id: string`
- `products: {`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\services\inventoryReport.service.ts::getInventoryMovements
- **params**: (supabase: SupabaseClient<Database>, params: { from?: Date; to?: Date })
- **ic_degiskenler**:
  - `query` — Supabase sorgu oluşturucu nesnesi; inventory_movements tablosundan belirli sütunları seçen ve created_at'e göre azalan sırayla sıralayan başlangıç sorgusu, ardından params.from ve params.to değerlerine göre tarih aralığı filtresi eklenerek güncellenir
  - `data` — Sorgudan dönen_successful verilerin tutulduğu değişken (InventoryMovementRow[] dizisi veya null)
  - `error` — Sorgu sırasında oluşabilecek hata nesnesi; varsa fırlatılır
- **Dönüş**: Promise<InventoryMovementRow[]> — inventory_movements tablosundaki hareket kayıtlarını (product bilgileriyle birlikte) tarih aralığına göre filtrelenmiş şekilde döndürür; hata oluşursa exception fırlatır, veri yoksa boş dizi döner

---

## NODE ID STANDARD

  file: src\lib\services\inventoryReport.service.ts
  function: src\lib\services\inventoryReport.service.ts::getInventoryMovements

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryMovementRow
  export: getInventoryMovements