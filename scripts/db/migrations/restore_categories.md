---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\restore_categories.ts
skeleton_hash: 3b74b63ba590128d
entity_hashes:
  func:restoreCategories: 7eb663b8b58f810a
  overview: 10ca18b255379b98
generated_at: 2026-08-27T12:28:26Z
---

## Genel Bakış

Bu modül, veritabanı kategorilerini geri yüklemeye yönelik bir migration betiğidir. Modül, `restoreCategories` fonksiyonundan oluşur ve veritabanı şemasındaki kategori verilerinin yeniden oluşturulması veya düzeltilmesi işlemini gerçekleştirir.

## Fonksiyon Grupları

### Kategori Geri Yükleme İşlemi

Veritabanındaki kategori kayıtlarını sıfırdan oluşturmak veya mevcut bozuk kayımları düzeltmekle sorumludur. Bu grup, modülün tek fonksiyonunu içerir.

- restoreCategories

## Dış Bağımlılıklar

Modülün dış bağımlılıkları verilen kaynak kodda belirtilmemiştir; bu nedenle hangi kütüphane veya modüllere bağlı olduğu bilinmiyor. Ancak dosya yolu (`scripts\db\migrations`) ve fonksiyonun `async` oluşu, bir veritabanı istemcisiyle asenkron iletişim kurduğunu gösterir.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### restoreCategories
**Ne yapar**: Yanlış silinen kategorileri Supabase veritabanına geri yükler ve yükleme işleminin doğrulamasını gerçekleştirir. Fonksiyon, belirli bir kategori listesini tek tek veritabanına upsert eder, ardından yükleme sonuçlarını konsola raporlar.

**Nasıl yapar**: Fonksiyon öncelikle bir başlık mesajını konsola yazar. Ardından `categoriesToRestore` dizisi üzerinde bir `for...of` döngüsüyle her bir kategori nesnesini iterasyona alır. Her kategori için Supabase istemcisi üzerinden `categories` tablosuna bir `upsert` işlemi gerçekleştirilir; bu işlemde `id`, `name`, `slug`, `parent_id`, `level` alanları ve `is_active` değeri `true` olarak gönderilir. `onConflict: 'id'` seçeneği sayesinde `id` alanındaki çakışma durumunda mevcut kayıt güncellenir. Upsert sonucunda oluşan hata varsa hata mesajı, başarılıysa geri yüklendi mesajı konsola yazdırılır. Döngü tamamlandıktan sonra doğrulama aşamasına geçilir; bu aşamada `parent_id` değeri `'4bc54533-7323-4eac-a02d-4498ffde00eb'` olan alt kategoriler `name` alanına göre sıralanarak sorgulanır ve sayısıyla birlikte listelenir. Son olarak tüm kategorilerin `id` alanları seçilerek toplam kategori sayısı raporlanır. Fonksiyon, dışarıda tanımlı olan `supabase` istemcisini ve `categoriesToRestore` dizisini kullanır; bu değişkenler fonksiyon parametresi olarak gelmez.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: Fonksiyonun dönüş tipi belirtilmemiştir; `async` anahtar kelimesiyle tanımlı olduğundan bir `Promise` döndürür ancak `return` ifadesi içermez.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::createClient
- import: _fs
- import: dotenv

---

## SABİTLER
- **supabase** [env-backed] (call) — `createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_...`
- **categoriesToRestore** (array) — `[
    // Fanlar altındaki silinenler (4 adet)
    { id: 'f1023011-4390-42d3...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/restore_categories.ts::restoreCategories
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `cat` — `categoriesToRestore` dizisi üzerindeki for-of döngüsü değişkeni; her bir geri yüklenecek kategori nesnesini temsil eder. `cat.id`, `cat.name`, `cat.slug`, `cat.parent_id`, `cat.level` alanlarına erişilir
  - `error` — `supabase.from('categories').upsert(...)` çağrısından destructuring ile ayrılan hata nesnesi; upsert işlemi başarısız olursa `error.message` ile hata mesajı yazdırılır
  - `fanlarSubs` — `supabase.from('categories').select('name').eq('parent_id', '4bc54533-7323-4eac-a02d-4498ffde00eb').order('name')` sorgusundan dönen `_data` destructuring değişkeni; `'4bc54533-7323-4eac-a02d-4498ffde00eb'` parent_id'ye sahip alt kategorilerin `name` alanlarını içerir. `fanlarSubs?.length` ile eleman sayısı, `c.name` ile her elemanın adı yazdırılır
  - `c` — `fanlarSubs?.forEach(c => ...)` callback parametresi; doğrulama sorgusundan dönen her bir kategori kaydını temsil eder, `c.name` alanına erişilir
  - `allCats` — `supabase.from('categories').select('id')` sorgusundan dönen `_data` destructuring değişkeni; tüm kategorilerin `id` alanlarını içerir. `allCats?.length` ile toplam kategori sayısı yazdırılır
- **Dönüş**: yok (async void). Yan etkileri: `console.warn` ile konsola durum mesajları basar; `categoriesToRestore` dizisindeki her kategoriyi `supabase` üzerinden `upsert` ile geri yükler (`onConflict: 'id'`); ardından iki doğrulama sorgusu çalıştırarak alt kategori sayısını ve toplam kategori sayısını raporlar

---

## NODE ID STANDARD

  file: scripts\db\migrations\restore_categories.ts
  function: scripts\db\migrations\restore_categories.ts::restoreCategories

---

## DISA AKTARILANLAR (EXPORTS)
  export: restoreCategories