---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\distribute_products_smart.ts
skeleton_hash: b12777891595e2a6
entity_hashes:
  func:distribute: a5581abac8405dcb
  overview: 6665b5495e96a3e8
generated_at: 2026-08-27T12:26:47Z
---

## Genel Bakış
Bu modül, veritabanı migrasyonu amaçlı bir script dosyasıdır. Modül, ürünlerin akıllı dağıtımını gerçekleştiren tek bir asenkron fonksiyon içerir.

## Fonksiyon Grupları

### Ürün Dağıtım İşlemi
Veritabanında ürün kayıtlarının dağıtımını gerçekleştiren ana migrasyon fonksiyonunu barındırır.
- `distribute`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca mevcut sabit ve imza bilgisinden aksiyom üretilebilir.

[Aksiyom 1]: Eğer `supabaseUrl` ve `supabaseServiceKey` değerleri tanımlı değilse, `supabase` istemcisi oluşturulamaz ve veritabanı işlemleri gerçekleştirilemez.

[Aksiyom 2]: Eğer `RULES` dizisi boş veya tanımsız ise, ürün dağıtım kuralları uygulanamaz.

[Aksiyom 3]: Eğer `env` çağrısı başarısız olursa, ortam değişkenlerine erişilemez ve `supabaseUrl`/`supabaseServiceKey` değerleri alınamaz.

---

**Not:** Fonksiyon gövdesi verilmediği için `distribute()` fonksiyonunun iç mantığı, hata yönetimi, veri akışı ve iş kuralları hakkında aksiyom üretilememiştir. Daha kapsamlı aksiyomlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### distribute
**Ne yapar**: Veritabanında `category_id` veya `subcategory_id` alanlarından biri eksik olan "yetim" ürünleri, önceden tanımlanmış anahtar kelime kurallarına göre uygun kategorilere otomatik olarak atar. Enterprise düzeyinde ürün dağıtım işlemi gerçekleştirir.

**Nasıl yapar**: Fonksiyon üç aşamalı bir süreç izler. İlk olarak Supabase üzerinden tüm kategorileri (`id`, `name`, `slug`, `parent_id` alanlarıyla) ve tüm ürünleri (`id`, `name`, `category_id`, `subcategory_id` alanlarıyla) çeker. Ürünler arasından `category_id` veya `subcategory_id` değerlerinden biri eksik olanları filtreleyerek yetim ürün havuzu oluşturur. Ardından dışarıdan sağlanan `RULES` dizisindeki her kural için: kuralın `slug` değeriyle eşleşen kategoriyi bulur, kategorinin `parent_id` alanına bakarak ana/alt kategori hiyerarşisini belirler (eğer `parent_id` varsa ana kategori olarak `parent_id`'yi, alt kategori olarak kendi `id`'sini kullanır; `parent_id` yoksa ana kategori olarak kendi `id`'sini, alt kategori olarak `null` atar). Ürün isimlerini büyük harfe çevirerek kuralın `keywords` dizisindeki anahtar kelimelerle eşleştirir ve opsiyonel `excludeKeywords` dizisindeki hariç tutma kelimelerini kontrol eder. Eşleşen ve mevcut kategori ataması hedef değerden farklı olan ürünleri tek tek günceler. Başarıyla güncellenen ürünler yetim havuzdan çıkarılarak birden fazla kural tarafından eşleşmesi engellenir. Her adımda hata ve ilerleme durumlarını konsola yazar.

**Parametreler**:
- Bu fonksiyon parametre almaz. Ancak fonksiyon gövdesinde kullanılan `supabase` istemcisi ve `RULES` dizisi dışarıdan (modül kapsamından) sağlanır. `RULES` dizisinin her elemanında `slug` (string), `keywords` (string dizisi) ve opsiyonel olarak `excludeKeywords` (string dizisi) alanlarının bulunduğu varsayılır; ancak bu yapının kesin tanımı verilen kaynak kodda mevcut değildir.

**Dönüş**: Dönüş tipi kaynak kodda açıkça belirtilmemiştir. Fonksiyon `return` ifadeleriyle erken çıkış yapabilir (hata durumlarında) ancak değer döndürmez; dolayısıyla `void` veya `undefined` döndüğü değerlendirilir. Kesin dönüş tipi bilinmiyor.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::createClient
- import: fs::fs
- import: path::path

---

## SABİTLER
- **env** (call) — `fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    .split('\n')
...`
- **supabaseUrl** (binary_expression) — `env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL`
- **supabaseServiceKey** (member_expression) — `env.SUPABASE_SERVICE_ROLE_KEY`
- **supabase** (call) — `createClient(supabaseUrl, supabaseServiceKey)`
- **RULES** (array) — `[
    // Subcategories under Industrial Ventilation
    { slug: 'jet-fans',...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: db\migrations\distribute_products_smart.ts::(acc, line) =>
- **params**: `acc` (Record<string, string>), `line` (string)
- **ic_degiskenler**:
  - `key` — `line.split('=')` sonucu oluşan dizinin ilk elemanı; satırdaki anahtar adını tutar
  - `val` — `line.split('=')` sonucu oluşan dizinin ikinci elemanı; satırdaki değeri tutar
  - `acc[key.trim()]` — key ve val ikisi de varsa, key'in boşluksuz haliyle acc nesnesine val atanır; val'deki `\r` karakterleri boş string ile değiştirilir
- **Dönüş**: `acc` (Record<string, string>) — güncellenmiş birikimli nesne

### [N2_NASIL] AST Pointer: db\migrations\distribute_products_smart.ts::distribute
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `allCategories` — `supabase.from('categories').select('id, name, slug, parent_id')` sorgusundan dönen `data`; tüm aktif kategorileri tutar
  - `cErr` — kategori sorgusu sırasında oluşan hata nesnesi; varsa fonksiyon erken döner
  - `products` — `supabase.from('products').select('id, name, category_id, subcategory_id')` sorgusundan dönen `data`; tüm ürünleri tutar
  - `pErr` — ürün sorgusu sırasında oluşan hata nesnesi; varsa fonksiyon erken döner
  - `orphanProducts` — `products` dizisinden filtrelenmiş, `category_id` veya `subcategory_id` değerlerinden biri eksik olan ürünler
  - `totalUpdated` — başarıyla güncellenen ürün sayısını tutan sayaç; başlangıç değeri `0`
  - `rule` — `RULES` dizisindeki her bir kural nesnesi; `slug`, `keywords`, `excludeKeywords` alanlarına erişilir
  - `catNode` — `allCategories` içinde `c.slug === rule.slug` koşulunu sağlayan kategori nesnesi; bulunamazsa döngü `continue` ile atlanır
  - `matchedMainCategory` — `catNode.parent_id` varsa `catNode.parent_id`, yoksa `catNode.id` olarak belirlenen ana kategori ID'si
  - `matchedSubCategory` — `catNode.parent_id` varsa `catNode.id`, yoksa `null` olarak belirlenen alt kategori ID'si
  - `matchingProducts` — `orphanProducts` dizisinden filtrelenmiş ürünler; `rule.keywords` ile eşleşen, `rule.excludeKeywords` ile eşleşmeyen ve mevcut kategori ID'leri hedeften farklı olan ürünler
  - `nameUpper` — `p.name.toUpperCase()` sonucu; ürün adının büyük harf karşılığı, anahtar kelime karşılaştırması için kullanılır
  - `matchesKeyword` — `rule.keywords.some(kw => nameUpper.includes(kw.toUpperCase()))` sonucu boolean; ürünün herhangi bir anahtar kelimeyle eşleşip eşleşmediğini gösterir
  - `excludedByKeyword` — `rule.excludeKeywords?.some(kw => nameUpper.includes(kw.toUpperCase()))` sonucu boolean; ürünün hariç tutulan anahtar kelimelerden biriyle eşleşip eşleşmediğini gösterir
  - `prod` — `matchingProducts` dizisindeki her bir ürün nesnesi; `id` ve `name` alanlarına erişilir
  - `uErr` — `supabase.from('products').update(...).eq('id', prod.id)` sorgusu sırasında oluşan hata nesnesi
  - `idx` — `orphanProducts.findIndex(o => o.id === prod.id)` sonucu; güncellenen ürünün orphanProducts dizisindeki indeksi; `-1` ise bulunamamıştır
  - `orphanProducts.splice(idx, 1)` — başarılı güncelleme sonrası ürün orphanProducts dizisinden çıkarılır; böylece aynı ürün birden fazla kurala eşleşmez
- **Dönüş**: yok — yan etki olarak `products` tablosundaki `category_id` ve `subcategory_id` alanlarını günceller, konsola ilerleme ve sonuç bilgisi yazar

### [N3_NASIL] AST Pointer: db\migrations\distribute_products_smart.ts::(p) =>
- **params**: `p` (ürün nesnesi; `name`, `category_id`, `subcategory_id` alanlarına erişilir)
- **ic_degiskenler**:
  - `nameUpper` — `p.name.toUpperCase()` sonucu; ürün adının büyük harf karşılığı
  - `matchesKeyword` — `rule.keywords.some(kw => nameUpper.includes(kw.toUpperCase()))` sonucu boolean; ürünün anahtar kelimelerden biriyle eşleşip eşleşmediğini gösterir
  - `excludedByKeyword` — `rule.excludeKeywords?.some(kw => nameUpper.includes(kw.toUpperCase()))` sonucu boolean; ürünün hariç tutulan kelimelerden biriyle eşleşip eşleşmediğini gösterir
- **Dönüş**: boolean — `matchesKeyword` true ise VE `excludedByKeyword` false ise VE (`p.category_id !== matchedMainCategory` VEYA `p.subcategory_id !== matchedSubCategory`) ise true döner; aksi halde false

---

## NODE ID STANDARD

  file: scripts\db\migrations\distribute_products_smart.ts
  function: scripts\db\migrations\distribute_products_smart.ts::distribute

---

## DISA AKTARILANLAR (EXPORTS)
  export: distribute