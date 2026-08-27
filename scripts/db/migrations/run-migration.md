---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run-migration.ts
skeleton_hash: 8c0b1521c3a74190
entity_hashes:
  func:runMigration: 2517b96bdb1c891d
  overview: 0208dcf65afc643a
generated_at: 2026-08-27T12:31:14Z
---

## Genel Bakış

Bu modül, veritabanı migrasyonlarının çalıştırılmasını tek bir asenkron fonksiyon aracılığıyla yönetir. Modülün tek bir dışa açık fonksiyonu bulunur ve veritabanı şema değişikliklerinin uygulanması sorumluluğunu üstlenir.

## Fonksiyon Grupları

### Migrasyon Çalıştırma

Veritabanı migrasyonlarının yürütülmesinden sorumludur. Modülün dış dünyaya açılan tek noktasıdır.

- runMigration

## Bağımlılıklar

Modül hakkında verilen bilgiden iç veya dış bağımlılıklara, dinamik yüklenen modüllere ya da mimari ayrıntılara ilişkin kesin bir bilgi çıkarılamaz. Kaynakta bu konularda açık bir ifade yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Supabase veritabanına bağlanarak migration çalıştırmayı amaçlayan bir modüldür. Fonksiyon gövdesi verilmediğinden, yalnızca modül sabitlerinin türlerinden ve fonksiyon imzasından çıkarım yapılabilmektedir.

[Aksiyom 1]: Eğer `supabaseUrl` yoksa (null veya tanımsız ise), `supabase` istemcisi oluşturulamaz ve veritabanı bağlantısı kurulamaz.

[Aksiyom 2]: Eğer `supabaseKey` yoksa (null veya tanımsız ise), `supabase` istemcisi oluşturulamaz ve veritabanı bağlantısı kurulamaz.

[Aksiyom 3]: Eğer `supabase` istemcisi (bir çağrı ile üretilen nesne) düzgün oluşturulamazsa, `runMigration` fonksiyonu migration işlemini gerçekleştiremez.

[Aksiyom 4]: Fonksiyon `async` olarak tanımlıdır; eğer çalıştırıldığı ortamda bir `async` çalıştırıcı (event loop) yoksa, fonksiyon çağrılamaz.

[Aksiyom 5]: Fonksiyon herhangi bir parametre almamaktadır; tüm yapılandırma (`supabaseUrl`, `supabaseKey`) modül sabitlerinden sağlanmalıdır. Eğer bu sabitler ortamdan (örneğin çevre değişkenlerinden) okunuyorsa ve ortamda tanımlı değillerse, modül düzgün başlatılamaz.

---

## FONKSİYON DETAYLARI

### runMigration
**Ne yapar**: Supabase veritabanı için bir SQL migration dosyasını okur, içindeki SQL ifadelerini ayrıştırarak sırayla çalıştırır ve ardından eklenen verilerin doğrulamasını gerçekleştirir. Bu fonksiyon, `20260209_add_model_type_mapping.sql` adlı migration dosyasındaki model_type_mapping eklemelerini veritabanına uygular.

**Nasıl yapar**: Fonksiyon önce `_path.join` kullanarak çalıştırma ortamının dizinine göre migration dosyasının tam yolunu oluşturur. Ardından `_fs.readFileSync` ile bu SQL dosyasını UTF-8 formatında okur. Okunan SQL metni noktalı virgül (`;`) karakterine göre satırlara bölünür, her satır `trim()` ile temizlenir ve boş satırlar ile `--` ile başlayan yorum satırları filtrelenir. Oluşturulan SQL ifadeleri bir döngüyle tek tek işlenir; `BEGIN` veya `COMMIT` ile başlayan transaction kontrol komutları regex eşleşmesiyle atlanır. Her geçerli SQL ifadesi `supabase.rpc('exec_sql')` yardımıyla veritabanında çalıştırılır. Hata durumunda konsola hata mesajı yazdırılır ancak işlem durdurulmaz — bazı hataların (örneğin bir kolonun zaten var olması) normal kabul edildiği belirtilmiştir. Tüm ifadeler çalıştıktan sonra, `categories` tablosundan `metadata->model_type` alanı null olmayan kayıtlar sorgulanarak doğrulama yapılır ve eklenen kategorilerin slug ile model_type değerleri konsola yazdırılır.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: Fonksiyonun dönüş tipi belirtilmemiştir. Async bir fonksiyon olduğu için bir `Promise` döndürür, ancak resolve edilen değer bilinmiyor.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::createClient
- import: _fs
- import: _path

---

## SABİTLER
- **supabaseUrl** [env-backed] (non_null_expression) — `process.env.VITE_SUPABASE_URL!`
- **supabaseKey** [env-backed] (non_null_expression) — `process.env.VITE_SUPABASE_ANON_KEY!`
- **supabase** (call) — `createClient(supabaseUrl, supabaseKey)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/run-migration.ts::runMigration
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `migrationPath` — `_path.join(__dirname, '../../../supabase/migrations/20260209_add_model_type_mapping.sql')` ile oluşturulan SQL migration dosyasının tam dosya yolu
  - `migrationSQL` — `_fs.readFileSync(migrationPath, 'utf-8')` ile okunan migration dosyasının UTF-8 metin içeriği
  - `statements` — `migrationSQL` metninin `;` karakteriyle bölünmesi, her parçanın `s.trim()` ile boşluklardan arındırılması ve `s.length > 0 && !s.startsWith('--')` koşuluyla boş satırlar ile yorum satırlarının filtrelenmesi sonucu oluşan SQL ifade dizisi
  - `i` — `for` döngüsünde `statements` dizisi üzerinde gezinmek için kullanılan sayaç indeksi (0'dan `statements.length`'e kadar)
  - `statement` — `statements[i]` ile erişilen, o anki döngü adımında işlenecek tekil SQL ifadesi
  - `_data` — `supabase.rpc('exec_sql', { sql_query: statement + ';' })` çağrısından destructure edilen yanıt verisi; ilk kullanımda atlanır (işlenmez)
  - `error` — `supabase.rpc('exec_sql', { sql_query: statement + ';' })` çağrısından destructure edilen hata nesnesi; hata varsa `console.error` ile yazdırılır, yoksa başarılı mesajı basılır
  - `err` — `try/catch` bloğunda yakalanan exception nesnesi; `console.error` ile yazdırılır
  - `_data` (ikinci kullanım) — doğrulama aşamasında `supabase.from('categories').select('slug, metadata').not('metadata->model_type', 'is', null)` sorgusundan destructure edilen yanıt verisi; `cat.slug` ve `cat.metadata?.model_type` alanlarıyla birlikte `console.warn` ile yazdırılır
  - `error` (ikinci kullanım) — doğrulama sorgusundan destructure edilen hata nesnesi; hata varsa `console.error` ile yazdırılır
  - `cat` — `_data?.forEach(cat => ...)` callback parametresi; her bir kategori nesnesinden `cat.slug` ve `cat.metadata?.model_type` alanlarına erişilir
- **Dönüş**: yok (async void; tüm çıktılar `console.warn` ve `console.error` üzerinden konsola yazdırılır)

---

## NODE ID STANDARD

  file: scripts\db\migrations\run-migration.ts
  function: scripts\db\migrations\run-migration.ts::runMigration

---

## DISA AKTARILANLAR (EXPORTS)
  export: runMigration