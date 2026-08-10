---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\admin\inboxCounts.ts
skeleton_hash: 0b8c5ffe627e5061
entity_hashes:
  func:fetchInboxCounts: 87c45c5352b61223
  overview: 4445631b0879c94f
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
Bu modül, admin panelinin gelen kutusu bileşenleri için gerekli sayısal verileri (okunmamış mesaj, toplam mesaj vb.) tek bir asenkron çağrı ile Supabase veritabanından çeken veri erişim katmanıdır. Modül tek bir fonksiyondan oluşur ve bağımlılığını (Supabase client) doğrudan parametre olarak alarak test edilebilirlik ve esneklik sağlar.

## Fonksiyon Grupları
### Inbox Verisi Çekme
Bu grup, admin panelinin gelen kutusu durumu hakkında istatistiksel bilgi sağlayan tek bir fonksiyonu içerir.
- `fetchInboxCounts`: Verilen Supabase istemcisi kullanarak ilgili inbox sayılarını veritabanından sorgular ve yapılandırılmış bir sayısal nesne olarak döndürür.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için imza tabanlı mimari varsayımlar aşağıdadır:

---

**[Aksiyom 1]:** Eğer `supabase` parametresi `SupabaseClient<Database>` tipinde geçerli bir Supabase istemcisi değilse veya veritabanı bağlantısı kopuksa, fonksiyon hata ile reject eden bir Promise döner.

**[Aksiyom 2]:** Eğer Supabase bağlantısı başarılı ancak inbox ile ilgili tablolar (örn: inbox, notifications, messages vb.) veritabanında mevcut değilse veya RLS (Row Level Security) politikaları erişimi engelliyorsa, fonksiyon varsayılan sıfır değerlerle dolu bir `InboxCounts` nesnesi döner.

**[Aksiyom 3]:** Eğer `InboxCounts` tipi tanımlı değilse veya beklenen alanları içermiyorsa (örn: `total`, `unread`, `urgent` vb. — bilinmiyor), TypeScript derleme zamanı hatası oluşur.

**[Aksiyom 4]:** Fonksiyon `async` olarak tanımlıdır; bu nedenle herhangi bir hata durumunda Promise reject edilebilir ve调用 tarafının bu Promise'i `try/catch` veya `.catch()` ile ele alması gerekir. Eğer hata yakalanmazsa,Promise rejection handle edilmemiş olur (unhandled promise rejection).

**[Aksiyom 5]:** Fonksiyonun `Database` generic parametresi, Supabase şemasının doğru tip karşılıklarını içermelidir; aksi halde tip uyumsuzluğu hatası oluşur.

---

> **Not:** Fonksiyon gövdesi (implementasyon) paylaşılmadığı için, veritabanı sorgu detayları, filtreleme mantığı, dönüş nesnesinin alanı ve iş kuralları (eşik değerleri vb.) hakkında kesin aksiyom üretilememektedir. Yukarıdaki varsayımlar yalnızca fonksiyon imzasından çıkarılabilecek mimari zorunlulukları yansıtmaktadır.

---

## FONKSİYON DETAYLARI

### fetchInboxCounts
**Ne yapar**: Yönetici panelinde "dikkat gerektiren" başlıkları için gerekli olan sayısal verileri paralel olarak hesaplar ve bir nesne içinde döndürür. Bu başlıklar; bekleyen iadeler, gönderilmemiş siparişler, düşük stoklu ürünler ve çözülmemiş hata gruplarıdır.

**Nasıl yapar**: Fonksiyon, dependency injection deseniyle bir Supabase istemcisi alır. Dört adet bağımsız veritabanı sorgusunu `Promise.allSettled` ile eşzamanlı olarak çalıştırır. Bu sayede bir sorgu başarısız olsa bile diğerleri tamamlanabilir. Sorguların sonuçları üzerinde `status === 'fulfilled'` kontrolü yapılarak hata durumları yönetilir ve her bir sayaç sıfırlanmamışsa sonuç değeri alınır. Ürünler tablosundaki düşük stok kontrolü, her bir ürün satırı için `stock_qty` değerinin `low_stock_threshold` değerine eşit veya daha küçük olup olmadığı döngü ile kontrol edilerek sayılır.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Veritabanı işlemlerini yürütmek için kullanılmak üzere enjekte edilmiş, `Database` tipiyle genelleştirilmiş bir Supabase istemcisi örneği. Modül seviyesinde statik bir import yerine bu parametre ile bağımlılık enjeksiyonu yapılmıştır.

**Dönüş**: `Promise<InboxCounts>` — Dört adet sayaç alanını içeren bir nesne döndürür:
- `pendingReturnsCount: number` — Durumu 'requested' veya 'approved' olan iade taleplerinin toplam sayısı.
- `pendingShipmentsCount: number` — Durumu 'confirmed' veya 'processing' olan ve henüz gönderilmemiş (`shipped_at` null) siparişlerin sayısı.
- `lowStockAlarmsCount: number` — `stock_qty` değerinin `low_stock_threshold` değerine eşit veya daha küçük olduğu ürünlerin sayısı.
- `unresolvedErrorsCount: number` — Durumu 'resolved' olmayan hata gruplarının sayısı.

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
- **params**: `(supabase: SupabaseClient<Database>)` — Supabase istemcisi, veritabanı sorguları için kullanılır
- **ic_degiskenler**:
  - `returnsRes` — Promise.allSettled'den dönen birinci sonuç, venthub_returns tablosundaki bekleyen iade isteklerinin sayısını tutar
  - `shipRes` — Promise.allSettled'den dönen ikinci sonuç, venthub_orders tablosundaki bekleyen kargoların sayısını tutar
  - `productsRes` — Promise.allSettled'den dönen üçüncü sonuç, products tablosundaki ürün verisini tutar
  - `errorsRes` — Promise.allSettled'den dönen dördüncü sonuç, error_groups tablosundaki çözülmemiş hata gruplarını tutar
  - `pendingReturnsCount` — `returnsRes.status === 'fulfilled' && !returnsRes.value.error ? (returnsRes.value.count ?? 0) : 0` hesaplamasından elde edilen bekleyen iade isteklerinin toplam sayısı
  - `pendingShipmentsCount` — `shipRes.status === 'fulfilled' && !shipRes.value.error ? (shipRes.value.count ?? 0) : 0` hesaplamasından elde edilen bekleyen kargoların toplam sayısı
  - `lowStockAlarmsCount` — Düşük stok alarmı olan ürünlerin sayacı, başlangıçta 0 olarak tanımlanır
  - `rawProducts` — `productsRes.value.data` değerinden gelen ham ürün listesi dizisi
  - `i` — for döngüsü için sayaç indeksi, 0'dan rawProducts uzunluğuna kadar iterasyon yapar
  - `p` — `rawProducts[i]` erişimiyle döngüdeki mevcut ürün nesnesi
  - `stockQty` — `typeof p.stock_qty === 'number' ? p.stock_qty : 0` hesaplamasından elde edilen ürünün stok miktarı
  - `lowStockThreshold` — `typeof p.low_stock_threshold === 'number' ? p.low_stock_threshold : 5` hesaplamasından elde edilen ürünün düşük stok eşiği (varsayılan 5)
  - `unresolvedErrorsCount` — `errorsRes.status === 'fulfilled' && !errorsRes.value.error ? (errorsRes.value.count ?? 0) : 0` hesaplamasından elde edilen çözülmemiş hata gruplarının toplam sayısı
- **Dict Erisimleri**:
  - `returnsRes.status`, `returnsRes.value.error`, `returnsRes.value.count` — iade sorgusu sonucu kontrolleri
  - `shipRes.status`, `shipRes.value.error`, `shipRes.value.count` — kargo sorgusu sonucu kontrolleri
  - `productsRes.status`, `productsRes.value.error`, `productsRes.value.data` — ürün sorgusu sonucu kontrolleri ve veri erişimi
  - `errorsRes.status`, `errorsRes.value.error`, `errorsRes.value.count` — hata sorgusu sonucu kontrolleri
  - `p.stock_qty`, `p.low_stock_threshold` — ürün nesnesi özellik erişimleri
- **Subscript Erisimleri**:
  - `rawProducts[i]` — döngüde dizinin i. indeksindeki ürün nesnesine erişim
- **Dönüş**: `Promise<InboxCounts>` — `{ pendingReturnsCount, pendingShipmentsCount, lowStockAlarmsCount, unresolvedErrorsCount }` özelliklerini içeren nesne; 4 adet paralel Supabase sorgusunu çalıştırarak inbox sayaç bilgilerini toplar

---

## NODE ID STANDARD

  file: src\lib\admin\inboxCounts.ts
  function: src\lib\admin\inboxCounts.ts::fetchInboxCounts

---

## DISA AKTARILANLAR (EXPORTS)
  export: InboxCounts
  export: fetchInboxCounts