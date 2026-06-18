---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\vh-invreport\src\lib\services\inventoryReport.service.ts
skeleton_hash: 8a74039b409a0477
entity_hashes:
  func:getInventoryMovements: c6d416d24ab4488f
  overview: d0f434ef60ccbc24
generated_at: 2026-06-18T16:20:51Z
---

## Genel Bakış
Bu modül, envanter hareketlerinin raporlanmasını sağlayan servis katmanı bileşenidir. Belirli bir tarih aralığındaki envanter giriş-çıkış hareketlerini sorgulayarak raporlama için veri sağlar. Supabase veritabanı üzerinden çalışır ve tarih filtresi desteği sunar.

## Fonksiyon Grupları

### Envarter Hareket Raporlama
Envanter hareketlerinin tarih bazlı sorgulanmasını ve listelenmesini sağlar. Raporlama akışları için gerekli olan hareket verilerini getirir.
- getInventoryMovements

---

## AXIOMS – Mimari Varsayımlar

Bu modül için **yalnızca fonksiyon imzasından çıkarılabilecek** mimari varsayımlar aşağıdadır:

---

**[Aksiyom 1]:** Eğer geçerli ve aktif bir Supabase bağlantısı (`supabase`) yoksa, veritabanı sorgusu başarısız olur ve fonksiyon bir hata fırlatır.

**[Aksiyom 2]:** Eğer `params.from` ve `params.to` parametreleri hiçbiri sağlanmamışsa, fonksiyonun hangi tarih aralığına göre filtreleme yaptığı **bilinmiyor** — bu iş mantığı fonksiyon gövdesinde tanımlıdır (örn: tüm kayıtları döndürme, belirli bir varsayılan aralık kullanma vb.).

**[Aksiyom 3]:** Eğer `params.from` `params.to`'dan daha sonraki bir tarih ise, sonuç kümesinin boş döndüğü veya hata fırlatıldığı **bilinmiyor** — tarih sıralaması kontrolünün varlığı fonksiyon gövdesinde doğrulanmalıdır.

**[Aksiyom 4]:** Fonksiyonun döndürdüğü `InventoryMovementRow[]` yapısının, veritabanındaki ilgili tablonun satır yapısıyla (şema) uyumlu olması gerekir; aksi halde tip dönüşüm hataları oluşur.

**[Aksiyom 5]:** Fonksiyon asenkron (`async`) olduğundan, çağrıcının `await` kullanarak sonucu beklemesi gerekir; aksi halde `Promise` nesnesi döner ve gerçek veriye ulaşılamaz.

---

> **Not:** Fonksiyon gövdesi (implementasyon) paylaşılmadığından, iş mantığına ilişkin varsayımlar (varsayılan tarih aralığı, filtreleme kuralları, sıralama vb.) burada belirlenememiştir.

---

## FONKSİYON DETAYLARI

### getInventoryMovements

**Ne yapar**: Envanter hareketlerini veritabanından çeker ve opsiyonel olarak belirli bir tarih aralığına göre filtreleme yapar. Her bir hareket kaydının yanında ilgili ürünün adını da (products tablosundan join ile) birlikte döndürür.

**Nasıl yapar**: Supabase client üzerinden `inventory_movements` tablosuna bir sorgu başlatır. Başlangıçta `id`, `delta`, `reason`, `created_at`, `product_id` alanlarını ve ilişkili `products(name)` alanını seçer. Sonuçları `created_at` alanına göre azalan sırada (en yeniden en eskiye) düzenler. Ardından `params` içinde tanımlanan `from` ve `to` değerleri varsa sırasıyla `gte` (büyük veya eşit) ve `lte` (küçük veya eşit) operatörleri ile `created_at` alanı üzerinde tarih filtresi uygular. Sorguyu `await` ile çalıştırır, hata oluşursa bu hatayı fırlatır, başarı durumunda ise boş bir dizi yerine veri varsa o veriyi `InventoryMovementRow[]` tipine dönüştürerek döndürür.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı iletişimi için kullanılan Supabase istemci nesnesi. `Database`generic tipi ile veritabanı şeması tanımlı olarak gelir ve tablo/alan tip güvenliğini sağlar.
- `params`: `{ from?: Date; to?: Date }` — Tarih aralığı filtresi parametreleri. `from` alanı belirtilirse, `created_at` alanı bu tarihten itibaren (bu tarih dahil) olan kayıtları kapsar. `to` alanı belirtilirse, `created_at` alanı bu tarihe kadar (bu tarih dahil) olan kayıtları kapsar. Her iki alan da opsiyoneldir; belirtilmezse tarih filtresi uygulanmaz.

**Dönüş**: `Promise<InventoryMovementRow[]>` — Asenkron olarak çalışır ve `InventoryMovementRow` tipinde bir dizi döndürür. Her bir satır, envanter hareketinin kimliğini, miktar değişimini (`delta`), nedenini, oluşum tarihini, ilişkili ürün ID'sini ve ürün adını içerir. Sorgu sonucunda veri yoksa boş bir dizi (`[]`) döndürülür.

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
- `products: {`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/inventoryReport.service.ts::getInventoryMovements
- **params**: (supabase: SupabaseClient<Database>, params: { from?: Date; to?: Date })
- **ic_degiskenler**:
  - `query` — Supabase sorgu oluşturucusu, başlangıçta `inventory_movements` tablosundan belirli alanları seçip `created_at` alanına göre azalan sıralama uygulanmış sorgu nesnesi; parametrelerle filtre eklemek için başlatılır
  - `data` — Sorgunun成功 sonucu olan ham veri dizisi, Supabase yanıtından çıkarılır
  - `error` — Sorgu sırasında oluşan hata nesnesi, varsa fonksiyonun fırlatacağı hata
- **Dönüş**: Promise<InventoryMovementRow[]> — Stok hareket satırları dizisi, filtrelenmiş ve sıralanmış; hata oluşursa throw edilir

---

## NODE ID STANDARD

  file: src\lib\services\inventoryReport.service.ts
  function: src\lib\services\inventoryReport.service.ts::getInventoryMovements

---

## DISA AKTARILANLAR (EXPORTS)
  export: InventoryMovementRow
  export: getInventoryMovements