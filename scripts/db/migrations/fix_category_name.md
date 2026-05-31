---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\scripts\db\migrations\fix_category_name.ts
skeleton_hash: 4d17e17dddeb32a7
entity_hashes:
  func:fixCategory: 733f456c409077a0
  overview: 8747c66488cb03d8
generated_at: 2026-05-31T07:18:35Z
---

## Genel Bakış
Bu modül, veritabanındaki kategori isimlerini düzeltme amacıyla yazılmış tek seferlik bir veritabanı migrasyon scriptidir. Veritabanı bağlantısı kurarak kategori tablosundaki bozuk veya eksik isim kayıtlarını normalize eder.

## Fonksiyon Grupları
### Veritabanı Düzeltme
Tek bir migrasyon işlemini yürütür: veritabanına bağlanır, kategori isimlerindeki tutarsızlıkları tespit eder ve gerekli düzeltmeleri uygular.
- fixCategory

---



---

## FONKSİYON DETAYLARI

### fixCategory
**Ne yapar**: Veritabanındaki belirli bir kategoriyi bulup adını ve meta verilerini günceller.
**Nasıl yapar**: Supabase istemcisi kullanarak categories tablosunda slug'ı 'endustriyel-fanlar' olan kaydı arar. Bulursa, name alanını 'Exproof Fanlar' olarak, metadata alanını ise mevcut değerleri koruyarak model_type, hero_title ve display_mode ekleyecek şekilde günceller. Hata durumunda, isim ile ('%Exproof%') alternatif arama yaparak kategoriyi bulmaya çalışır.
**Parametreler**:
- Yok
**Dönüş**: void

---

## SABİTLER
- **supabaseUrl** [env-backed] (binary_expression) — `process.env.SUPABASE_URL || 'https://tnofewwkwlyjsqgwjjga.supabase.co'`
- **supabaseKey** [env-backed] (binary_expression) — `process.env.SUPABASE_SERVICE_ROLE_KEY || '[SERVICE_ROLE_KEY]'`
- **supabase** (call) — `createClient(supabaseUrl, supabaseKey)`

---

## NODE ID STANDARD

  file: scripts\db\migrations\fix_category_name.ts
  function: scripts\db\migrations\fix_category_name.ts::fixCategory

---

## DISA AKTARILANLAR (EXPORTS)
  export: fixCategory