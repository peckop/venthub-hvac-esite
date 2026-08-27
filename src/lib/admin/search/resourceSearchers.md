---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\admin\search\resourceSearchers.ts
skeleton_hash: 36e28e38ee943b94
entity_hashes:
  func:_movementQueryFn: a6e6ecbab9529862
  func:_velocityQueryFn: 42a2402d1f1ce214
  func:searchAudit: d2a9963a87a7f43a
  func:searchCategories: 0826bda8c886e580
  func:searchCoupons: 5b41f23b1919c12b
  func:searchErrorGroups: 1a79b5ada9ecd6c2
  func:searchInventory: 42c505ed83f71608
  func:searchMovements: 04d4b01edd0a929e
  func:searchOrders: f02712724722b31e
  func:searchProducts: ecaf9e1bd8dbe30b
  func:searchReturns: 821955f70c7c4d56
  func:searchUsers: be44fc325c9a7016
  overview: 2c3ae4e9b1596f22
generated_at: 2026-08-27T06:57:21Z
---

## Genel Bakış

Bu modül, admin panelinde farklı kaynak türleri (ürün, sipariş, kullanıcı vb.) için optimize edilmiş arama fonksiyonlarını içerir. Her fonksiyon, belirli bir veri kaynağına yönelik sorgulama mantığını barındırır ve tutarlı bir arama sonucu formatı (`AdminSearcher`) döndürür. Modül, Supabase veritabanı bağlantısı üzerinden çalışarak merkezi bir arama altyapısı sunar ve üst seviye bir arama koordinatörünün kaynak bağımsız çalışmasına olanak tanır.

## Fonksiyon Grupları

### Ticari Varlık Aramaları
Ürün kataloğu, satış işlemleri ve stok yönetimiyle ilgili temel ticari verilerin aranmasını sağlar.
- searchProducts, searchOrders, searchReturns, searchCategories, searchInventory

### Kullanıcı ve Promosyon Aramaları
Sistem kullanıcılarını ve pazarlama amaçlı kuponları sorgulama işlevlerini yönetir.
- searchUsers, searchCoupons

### Sistem ve İzleme Aramaları
Operasyonel hareketler, hata kümeleri ve denetim kayıtları gibi sistem izleme verilerinin sorgulanmasını sağlar.
- searchMovements, searchErrorGroups, searchAudit

### Yardımcı Sorgu Fonksiyonları
Belirli arama fonksiyonları tarafından kullanılan, daha spesifik sorgu mantıklarını barındıran yardımcı fonksiyonlardır.
- _movementQueryFn, _velocityQueryFn

## Mimari Notlar

Modül, **Adapter/Strategy pattern** benimseyerek farklı kaynak türleri için tutarlı bir arama arayüzü sunar. Tüm dışa açık arama fonksiyonları aynı parametre yapısına (supabase bağlantısı, sorgu metni, sonuç limiti) sahiptir. Fonksiyonlar arasında doğrudan bir çağrı ilişkisi belirtilmemiştir; her biri bağımsız bir arama stratejisi olarak çalışır. Modül, `SupabaseClient` ve `Database` tipi gibi dış bağımlılıklara sahiptir. Dinamik veya lazy yüklenen bir modül olduğuna dair bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### _movementQueryFn
**Ne yapar**: Supabase istemcisini alıp, hareket (movement) kayıtlarında ürün adına veya SKU'ya göre arama yapan asenkron bir sorgu fonksiyonu döndüren üst düzey bir fonksiyondur (currying/artial application). Arama sonuçlarını, admin panelindeki hareketler sayfasında kullanılmak üzere standart bir formata dönüştürür.

**Nasıl yapar**: İlk çağrıda `supabase` parametresini yakalayan bir fonksiyon döndürür. Bu dönen fonksiyon çağrıldığında, öncelikle sorgu metninin boş olup olmadığını ve en az 2 karakter uzunluğunda olup olmadığını kontrol eder; koşul sağlanmazsa boş dizi döner. Sorgu oluşturulurken `orIlikeContains` yardımcı fonksiyonu ile `name` ve `sku` alanlarında arama yapılır; bu arama `foreignTable: 'products'` seçeneğiyle gömülü `products` tablosuna yönelik gerçekleştirilir. Kaynak kodundaki açıklamaya göre, üst düzey `or` içinde doğrudan `products.name` yazmak PostgREST'te 400 hatasına neden oluyordu; bu nedenle `foreignTable` yaklaşımı kullanılmıştır. Ayrıca `reason` alanı bilinçli olarak arama dışı tutulmuştur, çünkü hem ana tabloyu hem gömülü kaynağı tek sorguda OR'lamak PostgREST'te ifade edilemez ve ilgili sayfa zaten yalnızca ürün adı/SKU araması yapmaktadır. Sonuçlar `limit` parametresiyle sınırlandırılır. Gelen veri üzerinde `map` işlemi uygulanarak her kayıt için `resourceKey`, `id`, `title`, `subtitle` ve `route` alanlarından oluşan bir nesne üretilir. `products` ilişkisi dizi veya tekil nesne olabilir; dizi ise ilk eleman alınır.

**Parametreler**:
- supabase: `SupabaseClient<Database>` — Supabase veritabanı istemcisi nesnesi. Sorguların yürütülmesi için kullanılır.

**Dönüş**: Bilinmiyor. Kaynak kodunda açık bir dönüş tipi belirtilmemiştir. Dönen fonksiyonun kendisi `(supabase, query, limit) => {...}` şeklinde asenkron bir fonksiyondur ve bu iç fonksiyon, her biri `resourceKey`, `id`, `title`, `subtitle`, `route` alanlarını içeren nesnelerden oluşan bir dizi döndürür.

### _velocityQueryFn
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### searchProducts
**Ne yapar**: Verilen sorgu dizesine göre ürün veritabanında asenkron bir arama gerçekleştirir ve sonuçları `AdminSearcher` yapısında döndürür. Bu fonksiyon, admin panelinde ürünleri hızlıca bulmak için kullanılır.
**Nasıl yapar**: Fonksiyon, `supabase` istemcisini kullanarak ürünler tablosunda `query` parametresine eşleşen bir `ilike` (büyük/küçük harf duyarsız eşleşme) araması yapar. Arama, ürün adı, SKU veya açıklaması gibi alanları kapsayabilir. Sonuçlar, `limit` parametresiyle belirlenen sayıda kayda kısıtlanır.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı işlemleri için kullanılan Supabase istemcisi nesnesi.
- `query`: `string` — Aranacak anahtar kelime veya metin dizesi.
- `limit`: `number` — Döndürülecek maksimum sonuç sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Arama sonuçlarını içeren, `data` ve `count` alanlarına sahip bir nesne.

### searchOrders
**Ne yapar**: Sipariş kayıtları içinde asenkron bir arama yaparak ilgili siparişleri bulur ve standart bir `AdminSearcher` formatında sunar. Genellikle sipariş numarası veya müşteri adıyla arama yapılır.
**Nasıl yapar**: `supabase` istemcisi aracılığıyla siparişler tablosunda `query` ile eşleşen kayıtları arar. Arama, sipariş numarası, müşteri e-postası veya durum gibi alanlarda yapılabilir. Sonuçlar `limit` parametresi ile sınırlandırılır.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı bağlantısı ve sorguları için kullanılan istemci.
- `query`: `string` — Sipariş numarası, müşteri bilgisi vb. için arama terimi.
- `limit`: `number` — Tek seferde döndürülecek maksimum sipariş sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Bulunan siparişlerin listesini ve toplam sayısını içeren nesne.

### searchReturns
**Ne yapar**: İade (return) talepleri arasında asenkron bir arama gerçekleştirerek ilgili iade kayıtlarını bulur ve listeler.
**Nasıl yapar**: Fonksiyon, iade kayıtları tablosunda `query` parametresine göre bir arama sorgusu oluşturur. Bu arama, iade numarası, sipariş bağlantısı veya müşteri notları gibi alanlarda olabilir. `limit` ile sonuç sayısı kontrol edilir.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Arama yapılacak iade ile ilgili anahtar kelime.
- `limit`: `number` — Maksimum sonuç sayısı.
**Dönüş**: `Promise<AdminSearcher>` — İade kayıtlarını ve sayısını barındıran sonuç nesnesi.

### searchCategories
**Ne yapar**: Ürün kategorileri içinde asenkron bir arama yaparak ilgili kategorileri bulur ve sunar.
**Nasıl yapar**: `supabase` istemcisi ile kategoriler tablosunda `query` değerine eşleşen (örneğin kategori adı veya açıklaması) kayıtları arar. Sonuçlar `limit` ile sınırlanır.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi nesnesi.
- `query`: `string` — Aranacak kategori adı veya parçası.
- `limit`: `number` — Döndürülecek maksimum kategori sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Bulunan kategorileri ve toplam sayısını içeren nesne.

### searchUsers
**Ne yapar**: Sistem kullanıcıları (admin veya müşteri) arasında asenkron bir arama gerçekleştirerek ilgili kullanıcıları bulur.
**Nasıl yapar**: Kullanıcılar tablosunda `query` parametresine göre (e-posta, kullanıcı adı veya telefon) `ilike` araması yapar. `limit` parametresi ile sonuç sayısı kontrol edilir.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Aranacak kullanıcı ile ilgili terim (e-posta, ad vb.).
- `limit`: `number` — Maksimum kullanıcı sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Kullanıcı listesi ve sayısını içeren sonuç.

### searchCoupons
**Ne yapar**: Kupon kodları ve ilgili promosyonlar arasında asenkron bir arama yaparak bulur.
**Nasıl yapar**: Kuponlar tablosunda `query` parametresine göre (kupon kodu, açıklama veya durum) arama sorgusu oluşturur. `limit` ile sonuç sayısı sınırlandırılır.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Aranacak kupon kodu veya terimi.
- `limit`: `number` — Maksimum kupon sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Bulunan kuponları ve sayısını içeren nesne.

### searchMovements
**Ne yapar**: Stok hareketleri (giriş, çıkış, transfer) arasında asenkron bir arama gerçekleştirerek ilgili hareket kayıtlarını bulur.
**Nasıl yapar**: Stok hareketleri tablosunda `query` parametresine göre (ürün adı, hareket tipi veya tarih) arama yapar. Sonuçlar `limit` ile sınırlanır.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Aranacak hareket ile ilgili terim.
- `limit`: `number` — Maksimum hareket kaydı sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Stok hareketleri listesi ve sayısını içeren sonuç.

### searchErrorGroups
**Ne yapar**: Hata kayıtları ve hata grupları arasında asenkron bir arama yaparak ilgili hata demetlerini (gruplarını) bulur.
**Nasıl yapar**: Hata grupları tablosunda `query` parametresine göre (hata tipi, mesaj veya kaynak) arama sorgusu oluşturur. `limit` ile sonuç sayısı kontrol edilir.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Aranacak hata ile ilgili terim.
- `limit`: `number` — Maksimum hata grubu sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Hata grupları listesi ve toplam sayısını içeren nesne.

### searchAudit
**Ne yapar**: Denetim (audit) günlükleri arasında asenkron bir arama gerçekleştirerek ilgili kayıt değişikliklerini bulur.
**Nasıl yapar**: Denetim tablosunda `query` parametresine göre (yapan kullanıcı, işlem türü veya açıklamada) arama yapar. Sonuçlar `limit` ile sınırlandırılır.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Aranacak denetim kaydı ile ilgili terim.
- `limit`: `number` — Maksimum denetim kaydı sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Denetim günlükleri listesi ve sayısını içeren sonuç.

### searchInventory
**Ne yapar**: Envanter (stok) kayıtları arasında asenkron bir arama yaparak ilgili ürün stok bilgilerini bulur.
**Nasıl yapar**: Envanter tablosunda `query` parametresine göre (ürün adı, SKU veya depo konumu) arama sorgusu oluşturur. `limit` parametresi ile sonuç sayısı kontrol edilir.
**Parametreler**:
- `supabase`: `SupabaseClient` — Veritabanı istemcisi.
- `query`: `string` — Aranacak envanter kaydı ile ilgili terim.
- `limit`: `number` — Maksimum envanter kaydı sayısı.
**Dönüş**: `Promise<AdminSearcher>` — Envanter kayıtları listesi ve toplam sayısını içeren nesne.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/services/product.service::adminSearchProducts
- import: @/types/database.types::type { Database }
- import: @/utils/adminQueryFilters::orIlikeContains
- import: @supabase/supabase-js::SupabaseClient
- import: @supabase/supabase-js::type QueryData

---

## INTERFACES

### CommandResult
- `resourceKey: string`
- `id: string`
- `title: string`
- `subtitle?: string`
- `route: string`

---

## TYPE ALIASES

### AdminSearcher
```typescript
type AdminSearcher = (
  supabase: SupabaseClient<Database>,
  query: string,
  limit: number
) => Promise<CommandResult[]>
```

### InventoryMovementJoinedRow
```typescript
type InventoryMovementJoinedRow = QueryData<ReturnType<typeof _movementQueryFn>>[number]
```

### InventoryVelocityRow
```typescript
type InventoryVelocityRow = QueryData<ReturnType<typeof _velocityQueryFn>>[number]
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::_movementQueryFn
- **params**: `supabase` — SupabaseClient<Database> türünde, veritabanı bağlantısı
- **ic_degiskenler**: yok
- **Dönüş**: yok (fonksiyon gövdesinde return ifadesi yok)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::_velocityQueryFn
- **params**: `supabase` — SupabaseClient<Database> türünde, veritabanı bağlantısı
- **ic_degiskenler**: yok
- **Dönüş**: yok (fonksiyon gövdesinde return ifadesi yok)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchProducts
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `adminSearchProducts` fonksiyonundan dönen ürün verisi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchOrders
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `view_admin_orders` tablosundan çekilen sipariş verisi
  - `error` — Supabase sorgu hatası
  - `o` — map içindeki her sipariş nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchReturns
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `view_admin_returns` tablosundan çekilen iade verisi
  - `error` — Supabase sorgu hatası
  - `r` — map içindeki her iade nesnesi
  - `orderNum` — `r.order_number` değeri, sipariş numarası
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchCategories
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `categories` tablosundan çekilen kategori verisi
  - `error` — Supabase sorgu hatası
  - `c` — map içindeki her kategori nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchUsers
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `user_profiles` tablosundan çekilen kullanıcı verisi
  - `error` — Supabase sorgu hatası
  - `u` — map içindeki her kullanıcı nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N8_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchCoupons
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `coupons` tablosundan çekilen kupon verisi
  - `error` — Supabase sorgu hatası
  - `c` — map içindeki her kupon nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N9_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchMovements
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `q` — `_movementQueryFn` fonksiyonundan dönen sorgu nesnesi
  - `data` — sorgu sonucu çekilen hareket verisi
  - `error` — Supabase sorgu hatası
  - `rows` — `data` veya boş dizi
  - `m` — map içindeki her hareket nesnesi
  - `prod` — `m.products` değeri, ürün ilişkisi (dizi veya tek nesne)
  - `prodName` — `prod?.name` değeri, ürün adı
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N10_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchErrorGroups
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `error_groups` tablosundan çekilen hata grubu verisi
  - `error` — Supabase sorgu hatası
  - `eg` — map içindeki her hata grubu nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N11_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchAudit
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `admin_audit_log` tablosundan çekilen denetim kaydı verisi
  - `error` — Supabase sorgu hatası
  - `a` — map içindeki her denetim kaydı nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

### [N12_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts::searchInventory
- **params**: `supabase`, `query`, `limit`
- **ic_degiskenler**:
  - `data` — `_velocityQueryFn` fonksiyonundan dönen sorgu sonucu envanter verisi
  - `error` — Supabase sorgu hatası
  - `rows` — `data` veya boş dizi
  - `i` — map içindeki her envanter nesnesi
- **Dönüş**: AdminSearcher[] (resourceKey, id, title, subtitle, route alanlarından oluşan nesne dizisi)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    resourceSearchers_ts___movementQueryFn["_movementQueryFn"]
    resourceSearchers_ts___velocityQueryFn["_velocityQueryFn"]
    resourceSearchers_ts__searchAudit["searchAudit"]
    resourceSearchers_ts__searchCategories["searchCategories"]
    resourceSearchers_ts__searchCoupons["searchCoupons"]
    resourceSearchers_ts__searchErrorGroups["searchErrorGroups"]
    resourceSearchers_ts__searchInventory["searchInventory"]
    resourceSearchers_ts__searchMovements["searchMovements"]
    resourceSearchers_ts__searchOrders["searchOrders"]
    resourceSearchers_ts__searchProducts["searchProducts"]
    resourceSearchers_ts__searchReturns["searchReturns"]
    resourceSearchers_ts__searchUsers["searchUsers"]
    resourceSearchers_ts__searchMovements --> resourceSearchers_ts___movementQueryFn
    resourceSearchers_ts__searchInventory --> resourceSearchers_ts___velocityQueryFn
```

## NODE ID STANDARD

  file: src\lib\admin\search\resourceSearchers.ts
  function: src\lib\admin\search\resourceSearchers.ts::_movementQueryFn
  function: src\lib\admin\search\resourceSearchers.ts::_velocityQueryFn
  function: src\lib\admin\search\resourceSearchers.ts::searchProducts
  function: src\lib\admin\search\resourceSearchers.ts::searchOrders
  function: src\lib\admin\search\resourceSearchers.ts::searchReturns
  function: src\lib\admin\search\resourceSearchers.ts::searchCategories
  function: src\lib\admin\search\resourceSearchers.ts::searchUsers
  function: src\lib\admin\search\resourceSearchers.ts::searchCoupons
  function: src\lib\admin\search\resourceSearchers.ts::searchMovements
  function: src\lib\admin\search\resourceSearchers.ts::searchErrorGroups
  function: src\lib\admin\search\resourceSearchers.ts::searchAudit
  function: src\lib\admin\search\resourceSearchers.ts::searchInventory

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSearcher
  export: CommandResult
  export: InventoryMovementJoinedRow
  export: InventoryVelocityRow
  export: searchAudit
  export: searchCategories
  export: searchCoupons
  export: searchErrorGroups
  export: searchInventory
  export: searchMovements
  export: searchOrders
  export: searchProducts
  export: searchReturns
  export: searchUsers