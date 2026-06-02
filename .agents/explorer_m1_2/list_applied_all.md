---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\list_applied_all.js
skeleton_hash: 7dee0b3a86488050
entity_hashes:
  func:main: e23f6fbf3496456a
  func:parseEnv: 407358888558b46a
  overview: 22751f37d697448e
generated_at: 2026-06-02T07:45:52Z
---

## Genel Bakış
Bu modül, belirli bir .env dosyasını okuyarak içeriğindeki çevre değişkenlerini ayrıştırır ve programın temel iş akışını yönetir. Amaç, yapılandırma bilgilerini okunabilir bir liste formatına dönüştürmektir.

## Fonksiyon Grupları
### Dosya Ayrıştırma
Bu grup, ham dosya içeriğinden yapılandırılmış veri elde etmekle sorumludur.
- parseEnv

### Ana İş Akışı Yönetimi
Bu grup, programın başlangıç noktasını temsil eder ve diğer fonksiyonları koordine ederek genel iş akışını başlatır.
- main

---

## AXIOMS – Mimari Varsayımlar

Bu modül, YAML formatındaki env dosyalarını parser'layarak applied (uygulanmış) yapılandırma/pigration listelerini çıkaran bir yardımcı modüldür.

**[Aksiyom 1]:** Eğer `parseEnv(filePath)` parametresi olarak geçilen dosya yolu geçerli (mevcut ve okunabilir) bir dosyayı göstermiyorsa, fonksiyon hata ile karşılaşır.

**[Aksiyom 2]:** Eğer `parseEnv(filePath)` ile okunan dosya geçerli YAML formatında değilse, parse işlemi başarısız olur.

**[Aksiyom 3]:** Eğer `pg` (object_pattern) sabiti tanımlı ve geçerli bir pattern nesnesi değilse, nesne eşleme (pattern matching) işlemleri doğru çalışamaz.

**[Aksiyom 4]:** Eğer `main()` fonksiyonu çağrıldığında kullanılmak üzere varsayılan bir dosya yolu veya ortam değişkeni (env variable) tanımlı değilse, fonksiyon hangi dosyayı işleyeceğini bilemez.

**[Aksiyom 5]:** Eğer `parseEnv` tarafından döndürülen parsed veri yapısı, `pg` object_pattern ile eşleşemiyorsa (örneğin beklenen alanlar eksikse), listing/listeleme işlemi eksik veya hatalı sonuç üretir.

---

## FONKSİYON DETAYLARI

### parseEnv
**Ne yapar**: Belirtilen dosya yolunda bir `.env` dosyası varsa, içindeki ortam değişkenlerini okuyup bir JavaScript nesnesine dönüştürür. Dosya mevcut değilse boş bir nesne döner.

**Nasıl yapar**: Fonksiyon, `fs.existsSync` ile dosyanın varlığını kontrol eder. Dosya varsa `fs.readFileSync` ile içeriği UTF-8 olarak okur. Satır satır işlenen içerikte, boş satırları ve yorum satırlarını (`#` ile başlayanları) atlar. Her satırı `=` karakterine göre böler, anahtar ve değeri temizler. Değerin çift tırnak (`"`) veya tek tırnak (`'`) ile sarılıysa bu tırnakları kaldırarak temizler. Oluşturulan anahtar-değer çiftlerini bir nesneye ekler ve bu nesneyi döner.

**Parametreler**:
- filePath: string — Okunacak `.env` dosyasının mutlak veya göreli dosya yolu.

**Dönüş**: Object — `{ [key: string]: string }` formatında, okunan ortam değişkenlerini içeren bir nesne. Dosya bulunamazsa boş bir nesne `{}` döner.

### main
**Ne yapar**: Önceden tanımlı Supabase veritabanı bilgileri ve ortam değişkenlerinden elde edilen şifreler ile farklı port kombinasyonlarında bir PostgreSQL bağlantısı kurmaya çalışır. Başarılı bir bağlantı sağladığında, veritabanındaki tüm uygulanmış veritabanı migrasyonlarının versiyonlarını sorgular ve bu bilgileri bir JSON dosyasına yazar.

**Nasıl yapar**: Fonksiyon, çalışma dizinindeki `.env` ve `.env.local` dosyalarını `parseEnv` yardımıyla okur ve elde ettiği değerleri birleştirir. Sabit bir kullanıcı adı, host, veritabanı adı ile bu dosyalardan (`SUPABASE_DB_PASSWORD`) ve `DATABASE_URL` değişkeninden (`postgresql://...` formatından) şifreleri çıkarır. Tekrarlanan şifreleri `Set` kullanarak eler. 5432 ve 6543 olmak üzere iki port ile her şifre için bir bağlantı dener. İlk başarılı bağlantıda döngüyü kırar. Bağlantı sağlanamazsa hata mesajı yazdırıp programı sonlandırır. Bağlantı kurulursa `supabase_migrations.schema_migrations` tablosundaki tüm migrasyon versiyonlarını sorgular ve sonuçları `all_applied_migrations.json` dosyasına formatlanmış olarak yazar.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: void — Fonksiyon bir değer dönmez. İşlem sonucu konsola çıktı yazar ve bir JSON dosyası oluşturur.

---

## SABİTLER
- **pg** (object_pattern) — `{ Client }`

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\list_applied_all.js
  function: .agents\explorer_m1_2\list_applied_all.js::parseEnv
  function: .agents\explorer_m1_2\list_applied_all.js::main

---

## DISA AKTARILANLAR (EXPORTS)
  export: main
  export: parseEnv