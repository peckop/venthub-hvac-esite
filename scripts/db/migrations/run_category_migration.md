---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\db\migrations\run_category_migration.ts
skeleton_hash: a2f15eea6675e689
entity_hashes:
  func:runMigration: 4cde6d12b5576925
  overview: 13b4b9a7c6ab7c46
generated_at: 2026-08-27T12:31:42Z
---

## Genel Bakış
Bu modül, veritabanında kategori ile ilgili değişiklikleri uygulamak amacıyla yazılmış bir migration betiğidir. Modül tek bir asenkron fonksiyondan oluşur ve çalıştırıldığında kategori tablosu veya kategori verileri üzerinde yapısal değişiklikleri gerçekleştirir.

## Fonksiyon Grupları

### Migration İşlemi
Kategori ile ilgili veritabanı migration'ını çalıştırmaktan sorumludur. Modülün tek fonksiyonu olan `runMigration`, çağrıldığında kategori verilerine yönelik veritabanı değişikliklerini uygular.

- `runMigration`

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imza ve sabit bilgisinden çıkarım yapılabilmektedir.

[Aksiyom 1]: Eğer `supabase` sabiti çağrılabilir (callable) değilse, `runMigration` fonksiyonu çalışamaz.

[Aksiyom 2]: Eğer bir async runtime (event loop) mevcut değilse, `runMigration` fonksiyonu çalıştırılamaz çünkü fonksiyon `async` olarak tanımlıdır.

---

## FONKSİYON DETAYLARI

### runMigration
**Ne yapar**: Kategori-ürün tutarlılığını sağlamak için iki aşamalı bir veritabanı migration işlemi gerçekleştirir. İlk aşamada belirli ürünleri doğru kategorilere taşır, ikinci aşamada ise boş kategorileri siler ve son olarak doğrulama kontrolü yapar.

**Nasıl yapar**: Fonksiyon, Supabase istemcisi üzerinden `products` ve `categories` tablolarına erişir. AŞAMA 1'de, `products` tablosundaki belirli ürün isimlerini (ilike ile eşleştirerek) hedef `category_id` değerine günceller; ancak zaten doğru kategoride olan ürünleri tekrar güncellememek için `.neq('category_id', ...)` filtresi uygular. Üç ürün grubu için ayrı ayrı güncelleme yapılır: "Plastik Kelepç_e", "Alüminyum Folyo Bant" ve "Hız Anahtarı". AŞAMA 2'de, önceden tanımlanmış 12 kategorinin her biri için `categories` tablosundan `.delete()` işlemi gerçekleştirilir. DOĞRULAMA aşamasında ise kalan kategoriler listelenir ve `get_empty_subcategories` RPC fonksiyonu çağrılarak boş alt kategori kalıp kalmadığı kontrol edilir. Tüm aşamalarda `console.warn` ile durum mesajları ve hata bilgileri yazdırılır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Dönüş tipi kaynak kodda açıkça belirtilmemiştir. Async fonksiyon olduğundan bir Promise döndürür; ancak bu Promise'in çözüm değeri (resolve value) tanımlı değildir.

---

## İTHALATLAR (IMPORTS)
- import: @supabase/supabase-js::createClient
- import: dotenv

---

## SABİTLER
- **supabase** [env-backed] (call) — `createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/db/migrations/run_category_migration.ts::runMigration
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `plasticResult` — "Plastik Kelepç_e" ürünlerinin `category_id` alanını güncelleyen Supabase sorgusunun sonucu; hata durumunda `plasticResult.error.message` ile hata mesajı yazdırılır
  - `aluResult` — "Alüminyum Folyo Bant" ürünlerinin `category_id` alanını güncelleyen Supabase sorgusunun sonucu; hata durumunda `aluResult.error.message` ile hata mesajı yazdırılır
  - `hizResult` — "Hız Anahtarı" ürünlerinin `category_id` alanını güncelleyen Supabase sorgusunun sonucu; hata durumunda `hizResult.error.message` ile hata mesajı yazdırılır
  - `categoriesToDelete` — silinecek kategorilerin listesi; her eleman `id` (UUID) ve `name` (kategori adı) alanlarına sahip nesnelerden oluşur
  - `cat` — `categoriesToDelete` dizisi üzerindeki `for` döngüsünde kullanılan mevcut kategori nesnesi; `cat.id` ile silme işlemi, `cat.name` ile konsol çıktısı için kullanılır
  - `result` — her bir kategori silme işleminin Supabase sonucu; hata durumunda `result.error.message` ile hata mesajı yazdırılır
  - `remainingCats` — silme işleminden sonra kalan kategorilerin listesi; `id`, `name`, `level` alanlarını içerir, `level` ve `name` sırasıyla sıralanmış olarak seçilir
  - `emptySubs` — `get_empty_subcategories` RPC çağrısından dönen boş alt kategorilerin listesi; varsa uzunluğu konsola yazdırılır
- **Dönüş**: yok (fonksiyon veritabanı güncellemeleri, silmeler ve konsola çıktı üretir)

---

## NODE ID STANDARD

  file: scripts\db\migrations\run_category_migration.ts
  function: scripts\db\migrations\run_category_migration.ts::runMigration

---

## DISA AKTARILANLAR (EXPORTS)
  export: runMigration