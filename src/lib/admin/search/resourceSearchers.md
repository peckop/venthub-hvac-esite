---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\admin\search\resourceSearchers.ts
skeleton_hash: d8f538a61314b672
entity_hashes:
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
  overview: 9cd2e836272eaa71
generated_at: 2026-06-19T20:48:46Z
---

## Genel Bakış

Bu modül, admin panelinde farklı kaynak türleri üzerinde arama yapılması için gerekli fonksiyonları içerir. Her fonksiyon belirli bir kaynak türüne (ürün, sipariş, kullanıcı vb.) optimize edilmiş sorgulama mantığını barındırır ve tutarlı bir arama sonucu formatı (AdminSearcher) döndürür. Modül, Supabase veritabanı bağlantısı üzerinden çalışarak merkezi bir arama altyapısı sunar.

## Fonksiyon Grupları

### Ticari Varlık Aramaları
Ürün kataloğu ve satış süreçleriyle ilişkili temel ticari verilerin aranmasını sağlar.
- searchProducts, searchOrders, searchReturns, searchCategories, searchInventory

### Kullanıcı ve Promosyon Aramaları
Sistem kullanıcıları ve pazarlama araçlarıyla ilgili arama işlevlerini yönetir.
- searchUsers, searchCoupons

### Sistem ve İzleme Aramaları
Operasyonel takip, hata yönetimi ve denetim amaçlı verilerin sorgulanmasını sağlar.
- searchMovements, searchErrorGroups, searchAudit

## Mimari Notlar

Modül, **Adapter/Strategy pattern** benimseyerek farklı kaynak türleri için tutarlı bir arama arayüzü sunar. Tüm fonksiyonlar aynı parametre yapısına (supabase bağlantısı, sorgu metni, sonuç limiti) sahiptir, bu da üst seviye arama koordinatörünün kaynak bağımlı olmadan çalışmasını mümkün kılar. Fonksiyonlar arasında doğrudan çağrı ilişkisi yoktur; her biri bağımsız olarak ilgili veritabanı tablosuna yönelir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin panelinde farklı kaynak türleri (ürünler, siparişler, iadeler, vb.) üzerinde arama yapan fonksiyonlar koleksiyonudur. Fonksiyon gövdeleri verilmediğinden, sadece fonksiyon imzalarından çıkarılabilecek yapısal varsayımlar tanımlanmıştır.

**[Aksiyom 1]:** Eğer `supabase` istemcisi geçerli, bağlanmış ve ilgili kaynak tablolarına erişim izni varsa, arama sorgusu çalıştırılabilir. Aksi takdirde veritabanı sorgusu başarısız olur.

**[Aksiyom 2]:** Eğer `query` parametresi arama yapılabilecek uygun bir metin değeriyse, ilgili kaynak tablosunda eşleşen kayıtlar bulunabilir. Aksi takdirde boş veya hatalı sonuç döner.

**[Aksiyom 3]:** Eğer `limit` parametresi pozitif bir tamsayıysa, sonuç kümesi o kadar veya daha az kayıt ile sınırlanır. Aksi takdirde beklenmeyen davranış oluşur.

**[Aksiyom 4]:** Her bir `search*` fonksiyonunun arama yaptığı tablonun, `query` parametresi ile filtrelenmeye uygun bir metin/sütuna sahip olması gerekir. Aksi takdirde arama anlamasız sonuçlar üretir.

**[Aksiyom 5]:** Tüm `search*` fonksiyonları `async` olarak tanımlıdır; bu nedenle `await` ile çağrılmazsa fonksiyon sonucu awaited bir coroutine nesnesi olarak döner ve arama çalışmaz.

---

## FONKSİYON DETAYLARI

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
- import: @supabase/supabase-js::SupabaseClient

---

## INTERFACES

### CommandResult
- `resourceKey: string`
- `id: string`
- `title: string`
- `subtitle?: string`
- `route: string`

### VenthubReturnJoinedRow
- `id: string`
- `reason: string`
- `status: string`
- `venthub_orders: { order_number: string | null; customer_name: string | null } | { order_number: string | null; customer_`

### InventoryMovementJoinedRow
- `id: string`
- `reason: string`
- `delta: number`
- `products: { name: string; sku: string } | { name: string; sku: string }[] | null`

### InventoryVelocityRow
- `product_id: string`
- `name: string | null`
- `physical_stock: number | null`
- `available_stock: number | null`
- `warehouse_location: string | null`
- `supplier_name: string | null`

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

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchProducts
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — `adminSearchProducts` API çağrısından dönen ürün verisi dizisi
  - `p` — map callback parametresi, her bir ürün nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'products', id, title, subtitle, route)

### [N2_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchOrders
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen sipariş verisi dizisi (view_admin_orders tablosundan)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `o` — map callback parametresi, her bir sipariş nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'orders', id, title, subtitle, route)

### [N3_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchReturns
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen iade verisi dizisi (venthub_returns tablosu ile inner join)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `rows` — `data` dizisinin VenthubReturnJoinedRow[] tipine cast edilmiş hali
  - `r` — map callback parametresi, her bir iade satırını temsil eder
  - `order` — `r.venthub_orders` alanından çıkarılan sipariş nesnesi (dizi ise ilk eleman)
  - `orderNum` — sipariş numarası stringi, boş ise '' alınır
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'returns', id, title, subtitle, route)

### [N4_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchCategories
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen kategori verisi dizisi (categories tablosundan)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `c` — map callback parametresi, her bir kategori nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'categories', id, title, subtitle, route)

### [N5_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchUsers
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen kullanıcı profili verisi dizisi (user_profiles tablosundan)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `u` — map callback parametresi, her bir kullanıcı profil nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'users', id, title, subtitle, route)

### [N6_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchCoupons
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen kupon verisi dizisi (coupons tablosundan)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `c` — map callback parametresi, her bir kupon nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'coupons', id, title, subtitle, route)

### [N7_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchMovements
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen stok hareket verisi dizisi (inventory_movements tablosu ile inner join)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `rows` — `data` dizisinin InventoryMovementJoinedRow[] tipine cast edilmiş hali
  - `m` — map callback parametresi, her bir stok hareket satırını temsil eder
  - `prod` — `m.products` alanından çıkarılan ürün nesnesi (dizi ise ilk eleman)
  - `prodName` — ürün adı stringi, boş ise '' alınır
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'movements', id, title, subtitle, route)

### [N8_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchErrorGroups
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen hata grubu verisi dizisi (error_groups tablosundan)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `eg` — map callback parametresi, her bir hata grubu nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'error_groups', id, title, subtitle, route)

### [N9_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchAudit
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen denetim kaydı verisi dizisi (admin_audit_log tablosundan)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `a` — map callback parametresi, her bir denetim kaydı nesnesini temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'audit', id, title, subtitle, route)

### [N10_NASIL] AST Pointer: src/lib/admin/search/resourceSearchers.ts::searchInventory
- **params**: `supabase` (SupabaseClient instance), `query` (search string), `limit` (maximum results)
- **ic_degiskenler**:
  - `data` — Supabase sorgusundan dönen envanter hız verisi dizisi (inventory_velocity tablosundan, 'as never' ile tip bypass)
  - `error` — Supabase sorgusundaki olası hata nesnesi
  - `rows` — `data` dizisinin InventoryVelocityRow[] tipine cast edilmiş hali
  - `i` — map callback parametresi, her bir envanter satırını temsil eder
- **Dönüş**: AdminSearcher dizisi (resourceKey: 'inventory', id, title, subtitle, route)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
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
```

## NODE ID STANDARD

  file: src\lib\admin\search\resourceSearchers.ts
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