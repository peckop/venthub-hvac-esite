---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\fix_product_categories_client.ts
skeleton_hash: 30f455133c773284
entity_hashes:
  func:cleanEnv: 794c2ef046c64a04
  func:run: efcd80c0c8f4e657
  overview: 1af6a0d16660aab5
generated_at: 2026-08-27T12:27:28Z
---

## Genel Bakış
Bu modül, ürün kategorileriyle ilgili bir veritabanı düzeltme migrasyonunu tanımlar. Ortam değişkenlerini temizleyen yardımcı bir fonksiyon ve ana migrasyon işlemini yürüten asenkron bir fonksiyon içerir. Modül, veritabanındaki ürün kategorileri verisindeki bir tutarsızlığı düzeltmek amacıyla tasarlanmıştır.

## Fonksiyon Grupları

### Ortam Yönetimi
Migrasyon çalıştırılmadan önce ortam değişkenlerinin temizlenmesinden sorumludur. Verilen anahtarla ilişkili ortam değişkenini kaldırır.
- cleanEnv

### Migrasyon İşlemi
Modülün ana iş mantığını barındırır. Ürün kategorileri tablosundaki düzeltme işlemini asenkron olarak yürütür.
- run

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır. Fonksiyon gövdeleri sağlanmadığından, modülün doğru çalışması için gerekli koşullar belirlenememektedir.

---

## FONKSİYON DETAYLARI

### cleanEnv
**Ne yapar**: Verilen `key` parametresiyle ilişkili bir ortam değişkeni temizleme işlemi gerçekleştirdiği düşünülmektedir ancak fonksiyon gövdesi verilmediği için kesin görevi bilinmiyor.
**Nasıl yapar**: Fonksiyon gövdesi sağlanmadığı için iç mantığı bilinmiyor.
**Parametreler**:
- key: string — Temizleneceği düşünülen ortam değişkeninin anahtar adı. Ancak kesin işlevi gövde olmadığından doğrulanamıyor.
**Dönüş**: Dönüş tipi belirtilmemiş. Fonksiyon gövdesi olmadığından dönüş değeri bilinmiyor.

### run
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::createClient
- import: _fs::_fs
- import: _path::_path

---

## SABİTLER
- **env** (call) — `_fs.readFileSync(_path.join(process.cwd(), '.env'), 'utf8')
    .split('\n')...`
- **supabaseUrl** (call) — `cleanEnv('VITE_SUPABASE_URL')`
- **supabaseAnonKey** (call) — `cleanEnv('VITE_SUPABASE_ANON_KEY')`
- **supabase** (call) — `createClient(supabaseUrl, supabaseAnonKey)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/fix_product_categories_client.ts::cleanEnv
- **params**: `acc`, `line`
- **ic_degiskenler**:
  - `key` — `line.split('=')` sonucu oluşan dizinin ilk elemanı; ortam değişkeninin adını tutar
  - `val` — `line.split('=')` sonucu oluşan dizinin ikinci elemanı; ortam değişkeninin değerini tutar
  - `acc` — birikimli nesne; her geçerli key=val çifti `acc[key.trim()] = val.trim()` ile eklenir
  - `line` — `.env` dosyasından okunan tek satır; '=' karakteriyle bölünür
- **Dönüş**: `acc` nesnesi (parsed ortam değişkenlerini içeren obje)

### [N2_NASIL] AST Pointer: scripts/db/migrations/fix_product_categories_client.ts::run
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `updateCategory` — iç async fonksiyon; kategori anahtar kelimesine göre kategori bulur, eşleşen ürünleri o kategoriye taşır. Parametreleri: `catKeyword` (string), `productKeyword` (string), `excludeCriterias` (string[], varsayılan `[]`)
  - `catKeyword` — (updateCategory içinde) `categories` tablosunda `ilike` ile aranacak kategori adı anahtar kelimesi
  - `productKeyword` — (updateCategory içinde) `products` tablosunda `ilike` ile aranacak ürün adı anahtar kelimesi
  - `excludeCriterias` — (updateCategory içinde) ürünlerden hariç tutulacak anahtar kelime dizisi; her eleman için `query.not('name', 'ilike', ...)` eklenir
  - `cats` — (updateCategory içinde) `categories` tablosundan dönen `_data`; `id` ve `name` alanlarını içerir
  - `cErr` — (updateCategory içinde) kategori sorgusunda oluşabilecek hata
  - `cat` — (updateCategory içinde) `cats[0]`; bulunan kategori nesnesi, `cat.id` ve `cat.name` erişimi yapılır
  - `query` — (updateCategory içinde) `products` tablosu sorgu nesnesi; `ilike`, `neq`, `not` zincirleriyle filtrelenir
  - `ex` — (updateCategory içinde) `excludeCriterias` dizisinin her elemanı; `query.not('name', 'ilike', ...)` çağrısında kullanılır
  - `products` — (updateCategory içinde) filtrelenmiş ürünler dizisi; her eleman `p` olarak iterate edilir
  - `pErr` — (updateCategory içinde) ürün sorgusunda oluşabilecek hata
  - `p` — (updateCategory içinde) ürünler dizisindeki tekil ürün; `p.id` ve `p.name` erişimi yapılır
  - `uErr` — (updateCategory içinde) `products.update` işleminde oluşabilecek hata
- **Dönüş**: yok (void). Yan etkileri: `console.warn` ile ilerleme mesajları yazar; `supabase` üzerinden `products` tablosundaki ürünlerin `category_id` alanını günceller. Sırasıyla şu çağrıları yapar: `updateCategory('Aksiyal Fan', 'Aksiyal')`, `updateCategory('Radyal Fan', 'Radyal')`, `updateCategory('Kanal Tipi', 'Kanal Tipi')`, `updateCategory('Çatı Tipi', 'Çatı Tipi')`, `updateCategory('Jet Fan', 'Jet Fan')`, `updateCategory('Duman', 'Duman', ['Jet'])`, `updateCategory('Isıtıcılı', 'Isıtıcılı')`, `updateCategory('Isıtıcısız', 'Isıtıcısız')`

---

## NODE ID STANDARD

  file: scripts\db\migrations\fix_product_categories_client.ts
  function: scripts\db\migrations\fix_product_categories_client.ts::cleanEnv
  function: scripts\db\migrations\fix_product_categories_client.ts::run

---

## DISA AKTARILANLAR (EXPORTS)
  export: cleanEnv
  export: run