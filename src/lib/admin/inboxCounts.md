---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\admin\inboxCounts.ts
skeleton_hash: 7b4b1e16c5b89dcc
entity_hashes:
  func:fetchInboxCounts: 87c45c5352b61223
  overview: 4445631b0879c94f
generated_at: 2026-08-27T06:56:48Z
---

## Genel Bakış

Bu modül, Supabase veritabanından gelen kutusu sayılarını (inbox counts) çekmeye yarayan tek bir asenkron fonksiyon içerir. Modülün sorumluluğu dar ve nettir: bir Supabase istemcisi alıp ilgili tablolardan sayısal verileri sorgulayarak `InboxCounts` tipinde bir sonuç döndürmek.

## Fonksiyon Grupları

### Gelen Kutusu Sayılarını Getirme

Supabase veritabanına bağlanarak kullanıcının gelen kutusundaki öğe sayılarını sorgular ve yapılandırılmış bir InboxCounts nesnesi olarak döndürür.

- fetchInboxCounts

## Bağımlılıklar

- **Dış bağımlılık:** Supabase istemcisi (`SupabaseClient<Database>`) parametre olarak alınır; bu modül kendi başına bir bağlantı kurmaz.
- **Dinamik/lazy yükleme:** Modülde böyle bir yapı bulunmamaktadır.
- **Mimari önem:** Tek bir sorumluluğa sahip ince bir veri erişim katmanıdır; üst katmanlar tarafından gelen kutusu bilgisi gerektiğinde çağrılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesinden türetilen aksiyom tanımlanamaz.

---

## FONKSİYON DETAYLARI

### fetchInboxCounts
**Ne yapar**: Admin panelinde "dikkat gerektiren" öğelerin sayılarını toplayan paralel aggregation sorgusu çalıştırır. Dört farklı veritabanı tablosundan gerekli sayıları eş zamanlı olarak çeker ve bir InboxCounts nesnesi olarak döndürür.

**Nasıl yapar**: Fonksiyon, bağımlılık enjeksiyonu (dependency injection) prensibiyle çalışır; modül seviyesinde statik bir Supabase istemcisi import etmez, bunun yerine istemciyi parametre olarak alır. `Promise.allSettled` kullanarak dört bağımsız sorguyu paralel olarak yürütür. Bu yöntem, herhangi bir sorgu başarısız olsa bile diğerlerinin çalışmasını engellemez ve sonuçları güvenli bir şekilde işler. Her sorgu sonucu için `status === 'fulfilled'` ve `!value.error` kontrolleri yapılır; hata durumunda ilgili sayaç varsayılan olarak 0 değerini alır. Düşük stoklu ürünleri belirlemek için, products tablosundan alınan ham veriler üzerinde bir döngü ile `stock_qty <= low_stock_threshold` koşulu kontrol edilir ve eşleşen ürün sayısı hesaplanır.

**Parametreler**:
- supabase: SupabaseClient<Database> — Veritabanı işlemlerini gerçekleştirmek için kullanılan Supabase istemci nesnesi. Dependency injection ile sağlanır, böylece fonksiyon modül seviyesinde bir istemciye bağlı kalmaz.

**Dönüş**: Promise<InboxCounts> — Asenkron olarak döndürülen InboxCounts tipinde bir Promise nesnesi. Bu nesne şu alanları içerir:
- `pendingReturnsCount`: Durumu 'requested' veya 'approved' olan iade taleplerinin sayısı (sayı).
- `pendingShipmentsCount`: Durumu 'confirmed' veya 'processing' olan ve henüz kargoya verilmemiş (shipped_at null) siparişlerin sayısı (sayı).
- `lowStockAlarmsCount`: Stok miktarı (stock_qty) düşük stok eşiğine (low_stock_threshold) eşit veya altında olan ürünlerin sayısı (sayı). Eşik değeri null veya sayısal değilse varsayılan olarak 5 kullanılır.
- `unresolvedErrorsCount`: Durumu 'resolved' olmayan hata gruplarının sayısı (sayı).

---

## İTHALATLAR (IMPORTS)
- import: @/types/database.types::Database
- import: @supabase/supabase-js::SupabaseClient

---

## INTERFACES

### InboxCounts
- `pendingReturnsCount: number`
- `pendingShipmentsCount: number`
- `lowStockAlarmsCount: number`
- `unresolvedErrorsCount: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/inboxCounts.ts::fetchInboxCounts
- **params**: `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
- **ic_degiskenler**:
  - `returnsRes` — Promise.allSettled'dan dönen ilk sonuç; venthub_returns tablosundan status'u 'requested' veya 'approved' olan kayıtların sayısını sorgular
  - `shipRes` — Promise.allSettled'dan dönen ikinci sonuç; venthub_orders tablosundan shipped_at null olan ve status'u 'confirmed' veya 'processing' olan kayıtların sayısını sorgular
  - `productsRes` — Promise.allSettled'dan dönen üçüncü sonuç; products tablosundan stock_qty ve low_stock_threshold alanlarını seçer
  - `errorsRes` — Promise.allSettled'dan dönen dördüncü sonuç; error_groups tablosundan status'u 'resolved' olmayan kayıtların sayısını sorgular
  - `pendingReturnsCount` — returnsRes başarılı ve hatasız ise value.count değeri, aksi halde 0
  - `pendingShipmentsCount` — shipRes başarılı ve hatasız ise value.count değeri, aksi halde 0
  - `lowStockAlarmsCount` — düşük stoklu ürün sayacı, başlangıçta 0; döngüde koşulu sağlayan her ürün için artırılır
  - `rawProducts` — productsRes.value.data, products tablosundan gelen ham ürün dizisi
  - `i` — for döngüsü sayacı, 0'dan rawProducts.length'e kadar iterasyon yapar
  - `p` — döngüdeki mevcut ürün nesnesi, rawProducts[i]
  - `stockQty` — p.stock_qty değeri; number değilse 0 olarak kullanılır
  - `lowStockThreshold` — p.low_stock_threshold değeri; number değilse 5 olarak kullanılır
  - `unresolvedErrorsCount` — errorsRes başarılı ve hatasız ise value.count değeri, aksi halde 0
- **Dönüş**: InboxCounts — `{ pendingReturnsCount, pendingShipmentsCount, lowStockAlarmsCount, unresolvedErrorsCount }` alanlarını içeren nesne

---

## NODE ID STANDARD

  file: src\lib\admin\inboxCounts.ts
  function: src\lib\admin\inboxCounts.ts::fetchInboxCounts

---

## DISA AKTARILANLAR (EXPORTS)
  export: InboxCounts
  export: fetchInboxCounts