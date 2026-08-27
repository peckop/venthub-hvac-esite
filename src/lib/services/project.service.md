---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\services\project.service.ts
skeleton_hash: 2db603f5c5f4f76e
entity_hashes:
  func:addProductToProject: 0a7b669c584f15fe
  func:createProject: 2c6fc31720f34b89
  func:deleteProject: 805372ee0e272024
  func:listProjectItems: a458c44a64678a6e
  func:listUserProjects: 2732617049348a3f
  func:removeProductFromProject: 88aa7b89f1aa4ac9
  overview: 82cdf1fb2dbcb93a
generated_at: 2026-08-27T07:05:22Z
---

## Genel Bakış
VentHub HVAC platformunda kullanıcıların projelerini ve bu projelerin içeriklerini yönetmesini sağlayan servis modülüdür. Supabase veritabanı üzerinde proje oluşturma, listeleme ve silme işlemlerinin yanı sıra, projelere ürün ekleme/çıkarma ve proje içeriğini sorgulama gibi operasyonları merkezi bir noktadan yürütür.

## Fonksiyon Grupları
### Proje Yaşam Döngüsü
Kullanıcının projeleri üzerindeki temel yönetimsel işlemlerini (oluşturma, listeleme, silme) kapsar. Bu fonksiyonlar bir projenin varoluş süresince geçirdiği tüm durumları yönetir.
- listUserProjects, createProject, deleteProject

### Proje Ürün Yönetimi
Oluşturulmuş bir projenin içeriğine ilişkin işlemleri yürütür; ürün ekleme, çıkarma ve projedeki mevcut ürünlerin listelenmesini sağlar. Bu grup, projelerin teknik içeriğini ve malzeme listelerini yönetmekten sorumludur.
- addProductToProject, removeProductFromProject, listProjectItems

---

## AXIOMS – Mimari Varsayımlar
Bu modül, Supabase veritabanı üzerinden proje ve proje-ürün ilişkilerini yöneten bir servis katmanıdır. Aşağıda, modülün doğru çalışması için gerekli olan temel mimari varsayımlar listelenmektedir.

[Aksiyom 1]: Eğer `supabase` parametresi ile verilen `SupabaseClient` nesnesi, `Database` tipiyle tutarlı ve geçerli bir veritabanı şemasına sahip değilse, tüm veritabanı işlemleri başarısız olur.

[Aksiyom 2]: Eğer `user_projects` tablosu (veya bu tabloya karşılık gelen veritabanı tablosu) veritabanında mevcut değilse, `createProject` fonksiyonu hata ile sonuçlanır.

[Aksiyom 3]: Eğer `addProductToProject` fonksiyonunda verilen `quantity` parametresi, pozitif bir tamsayı değilse, bu eylem iş mantığı açısından geçersizdir (not: fonksiyon imzasında pozitiflik zorunluluğu açıkça belirtilmemiştir, bu bir iş kuralı varsayımıdır).

[Aksiyom 4]: Eğer `projectId` parametresi ile belirtilen proje, `user_projects` tablosunda mevcut değilse veya oturumdaki kullanıcıya ait değilse (eğer iş kuralları buna izin vermiyorsa), `deleteProject`, `addProductToProject`, `removeProductFromProject` ve `listProjectItems` fonksiyonları başarısız olur.

[Aksiyom 5]: Eğer `productId` parametresi ile belirtilen ürün, ürünlere ait tabloda (ürün tablosu adı fonksiyon imzasından çıkarılamamaktadır) mevcut değilse, `addProductToProject` fonksiyonu başarısız olur.

[Aksiyom 6]: Eğer `listUserProjects` fonksiyonu çağrıldığında, `supabase` client'ındaki oturumda kimliği doğrulanmış bir kullanıcı (auth.uid()) yoksa, fonksiyon kullanıcıya ait projeleri filtreleyemez ve boş bir liste dönme riski veya hata oluşur.

[Aksiyom 7]: Eğer `project` parametresi, `TablesInsert<'user_projects'>` tipine uygun (zorunlu alanları içeren) bir nesne değilse, `createProject` fonksiyonu başarısız olur.

[Aksiyom 8]: Eğer `projectId` ve `productId` kombinasyonu, proje-ürün ilişki tablosunda (örn: `project_items` veya benzeri bir tablo, adı fonksiyon imzasından bilinmemektedir) zaten mevcut değilse, `removeProductFromProject` fonksiyonu hiçbir satırı etkilemez (sessizce başarısız olabilir veya hata dönebilir).

---

## FONKSİYON DETAYLARI

### listUserProjects
**Ne yapar**: Kimliği doğrulanmış kullanıcıya ait tüm projeleri getirir. Projeler, son güncellenme tarihine göre azalan sırayla döndürülür. Veritabanı sorgusu başarısız olursa hata fırlatır.

**Nasıl yapar**: Supabase istemcisi üzerinden `user_projects` tablosundan tüm sütunları (`*`) seçer ve `updated_at` alanına göre azalan sıralama uygular. Gelen veri, hata kontrolünden geçirildikten sonra `DbUserProject` tipine dönüştürülerek döndürülür. Veri yoksa boş dizi döner.

**Parametreler**:
- `supabase`: `SupabaseClient<Database>` — Aktif Supabase istemci örneği. Veritabanı bağlantısını temsil eder.

**Dönüş**: `Promise<DbUserProject[]>` — Kullanıcı proje kayıtlarından oluşan bir dizi. Hiç proje yoksa boş dizi döner.

### createProject
**Ne yapar**: Kimliği doğrulanmış kullanıcı için yeni bir proje oluşturur.
**Nasıl yapar**: Verilen proje detaylarını kullanarak 'user_projects' tablosuna yeni bir satır ekler, eklenen kaydı (`select().single()`) döndürür. İşlem başarısız olursa bir hata fırlatır.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Etkin Supabase istemci örneği.
- `project`: TablesInsert<'user_projects'> — Veritabanı şemasıyla eşleşen eklenecek proje detayları.
**Dönüş**: `Promise<DbUserProject>` — Yeni oluşturulan kullanıcı projesi kaydı.

### deleteProject
**Ne yapar**: Belirtilen projeyi ve ilişkili tüm öğelerini siler (kaskad silme genellikle veritabanı tarafından işlenir).
**Nasıl yapar**: Verilen `id` ile eşleşen kaydı 'user_projects' tablosundan siler. İşlem başarılı olursa `true` döner, aksi takdirde hata fırlatır.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Etkin Supabase istemci örneği.
- `id`: string — Silineceğin projenin benzersiz tanımlayıcısı.
**Dönüş**: `Promise<boolean>` — Silme işlemi başarılı olursa `true`.

### addProductToProject
**Ne yapar**: Belirli bir ürünü, belirtilen miktarda (varsayılan olarak 1) bir kullanıcı projesine ekler.
**Nasıl yapar**: 'project_items' tablosuna `project_id`, `product_id` ve `quantity` alanlarını içeren yeni bir satır ekler ve eklenen kaydı döndürür.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Etkin Supabase istemci örneği.
- `projectId`: string — Hedef projenin benzersiz tanımlayıcısı.
- `productId`: string — Eklenen ürünün benzersiz tanımlayıcısı.
- `quantity`: number — Eklenecek birim sayısı (varsayılan 1).
**Dönüş**: `Promise<DbProjectItem>` — Yeni oluşturulan proje öğesi kaydı.

### removeProductFromProject
**Ne yapar**: Belirli bir ürünü belirtilen bir kullanıcı projesinden kaldırır.
**Nasıl yapar**: 'project_items' tablosunda, hem `project_id` hem de `product_id` alanları eşleşen kaydı siler. İşlem başarılı olursa `true` döner.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Etkin Supabase istemci örneği.
- `projectId`: string — Hedef projenin benzersiz tanımlayıcısı.
- `productId`: string — Kaldırılacak ürünün benzersiz tanımlayıcısı.
**Dönüş**: `Promise<boolean>` — Kaldırma işlemi başarılı olursa `true`.

### listProjectItems
**Ne yapar**: Belirli bir projedeki tüm öğeleri, karşılık gelen alan ürün verileriyle birlikte getirir.
**Nasıl yapar**: 'project_items' tablosunu 'products' tablosu ile birleştirerek (join) belirtilen `project_id` ile eşleşen tüm satırları çeker. Elde edilen her bir öğe, `mapDatabaseProductToDomain` yardımıyla zenginleştirilerek `product` alanı eklenmiş halde döndürülür.
**Parametreler**:
- `supabase`: SupabaseClient<Database> — Etkin Supabase istemci örneği.
- `projectId`: string — Hedef projenin benzersiz tanımlayıcısı.
**Dönüş**: `Promise<ProjectItem[]>` — Her biri tam ürün detaylarıyla zenginleştirilmiş proje öğelerinin bir dizisi.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/database.types::type { Database }
- import: ../../types/database.types::type { TablesInsert }
- import: ../../types/db-rows::type { DbProduct,DbProjectItem, DbUserProject }
- import: ../../types/ui-models::type { ProjectItem }
- import: ../type-converters::mapDatabaseProductToDomain
- import: @supabase/supabase-js::type { SupabaseClient }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/services/project.service.ts::listUserProjects
- **params**: `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
- **ic_degiskenler**:
  - `data` — user_projects tablosundan çekilen satırları tutar; `select('*')` ile tüm sütunlar alınır, `updated_at` alanına göre azalan sırayla (`ascending: false`) sıralanır
  - `error` — sorgu sırasında oluşan hata varsa bu değişkende tutulur; hata varsa `Error` olarak fırlatılır
- **Dönüş**: `DbUserProject[]` — hata fırlatılmazsa `data` döndürülür; `data` null ise boş dizi (`[]`) döndürülür

### [N2_NASIL] AST Pointer: src/lib/services/project.service.ts::createProject
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
  - `project` — TablesInsert<'user_projects'> tipinde, eklenecek proje verisi
- **ic_degiskenler**:
  - `data` — insert işlemi sonrası dönen tek satır veriyi tutar; `.insert(project).select().single()` zinciriyle eklenen kayıt geri alınır
  - `error` — insert sırasında oluşan hata varsa bu değişkende tutulur; hata varsa `Error` olarak fırlatılır
- **Dönüş**: `DbUserProject` — hata fırlatılmazsa eklenen kayıt (`data`) döndürülür

### [N3_NASIL] AST Pointer: src/lib/services/project.service.ts::deleteProject
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
  - `id` — string tipinde, silinecek projenin kimliği
- **ic_degiskenler**:
  - `error` — delete sırasında oluşan hata varsa bu değişkende tutulur; hata varsa `Error` olarak fırlatılır
- **Dönüş**: `boolean` — hata fırlatılmazsa `true` döndürülür

### [N4_NASIL] AST Pointer: src/lib/services/project.service.ts::addProductToProject
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
  - `projectId` — string tipinde, ürünün ekleneceği projenin kimliği
  - `productId` — string tipinde, eklenecek ürünün kimliği
  - `quantity` — number tipinde (varsayılan değer: `1`), eklenecek miktar
- **ic_degiskenler**:
  - `data` — insert işlemi sonrası dönen tek satır veriyi tutar; `.insert({ project_id: projectId, product_id: productId, quantity }).select().single()` zinciriyle eklenen kayıt geri alınır
  - `error` — insert sırasında oluşan hata varsa bu değişkende tutulur; hata varsa `Error` olarak fırlatılır
- **Dönüş**: `DbProjectItem` — hata fırlatılmazsa eklenen kayıt (`data`) döndürülür

### [N5_NASIL] AST Pointer: src/lib/services/project.service.ts::removeProductFromProject
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
  - `projectId` — string tipinde, ürünün çıkarılacağı projenin kimliği
  - `productId` — string tipinde, çıkarılacak ürünün kimliği
- **ic_degiskenler**:
  - `error` — delete sırasında oluşan hata varsa bu değişkende tutulur; hata varsa `Error` olarak fırlatılır
- **Dönüş**: `boolean` — hata fırlatılmazsa `true` döndürülür

### [N6_NASIL] AST Pointer: src/lib/services/project.service.ts::listProjectItems
- **params**:
  - `supabase` — SupabaseClient<Database> tipinde, Supabase istemcisi
  - `projectId` — string tipinde, ürünleri listelenecek projenin kimliği
- **ic_degiskenler**:
  - `data` — project_items tablosundan çekilen satırları tutar; `select('*, product:products(*)')` ile ilişkili ürün bilgisiyle birlikte getirilir, `project_id` alanına göre filtrelenir (`.eq('project_id', projectId)`)
  - `error` — sorgu sırasında oluşan hata varsa bu değişkende tutulur; hata varsa `Error` olarak fırlatılır
  - `items` — `data`'nın `(DbProjectItem & { product: DbProduct | null })[]` tipindeki hali; `data` null ise boş dizi (`[]`) atanır
  - `item` — `items` dizisinin her bir elemanı; `map` fonksiyonunda kullanılır
  - `product` — `item.product` alanıdır; ürün bilgisini tutar, null olabilir
  - `rest` — `product` hariç `item`'ın geri kalan tüm özellikleri (destructuring ile ayrılır: `const { product, ...rest } = item`)
- **Dönüş**: `ProjectItem[]` — hata fırlatılmazsa `items` dizisi `map` ile dönüştürülerek döndürülür; her elemanda `product` null değilse `mapDatabaseProductToDomain(product)` ile domaine dönüştürülüp `{ ...rest, product: ... }` olarak birleştirilir, null ise sadece `rest` döndürülür

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    project_service_ts__addProductToProject["addProductToProject"]
    project_service_ts__createProject["createProject"]
    project_service_ts__deleteProject["deleteProject"]
    project_service_ts__listProjectItems["listProjectItems"]
    project_service_ts__listUserProjects["listUserProjects"]
    project_service_ts__removeProductFromProject["removeProductFromProject"]
```

## NODE ID STANDARD

  file: src\lib\services\project.service.ts
  function: src\lib\services\project.service.ts::listUserProjects
  function: src\lib\services\project.service.ts::createProject
  function: src\lib\services\project.service.ts::deleteProject
  function: src\lib\services\project.service.ts::addProductToProject
  function: src\lib\services\project.service.ts::removeProductFromProject
  function: src\lib\services\project.service.ts::listProjectItems

---

## DISA AKTARILANLAR (EXPORTS)
  export: addProductToProject
  export: createProject
  export: deleteProject
  export: listProjectItems
  export: listUserProjects
  export: removeProductFromProject