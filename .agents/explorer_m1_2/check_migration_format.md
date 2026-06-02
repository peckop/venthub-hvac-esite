---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\explorer_m1_2\check_migration_format.js
skeleton_hash: 1746c1469d2d0b56
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-06-02T07:44:21Z
---

## Genel Bakış

Bu modül, proje içindeki migrasyon dosyalarının formatını doğrulayan bağımsız bir betiktir. Dosya adlandırma kurallarını, tarih tabanlı yapıları ve uygulama (applied) durumlarını kontrol ederek migrasyon dosyalarının tutarlı olmasını sağlar. Modül, Node.js ortamında `fs` kütüphanesini kullanarak dosya sistemi erişimi gerçekleştirir.

## Modül Yapısı

Bu dosyada tanımlı fonksiyon bulunmamaktadır; tüm mantık modül seviyesinde (top-level statements) çalışır.

**Kullanılan Importlar:**
- `fs` — Dosya sistemi işlemleri için

**Tanımlı Değişkenler/Sabitler:**
- `applied` — Uygulanmış migrasyonları temsil eder
- `dateBased` — Tarih tabanlı migrasyon yapısını belirtir
- `search` — Arama/isimlendirme kalıplarını tutar

**Amacı:**
Migrasyon dosyalarının doğru formatta olup olmadığını kontrol ederek, veritabanı migrasyon sürecinin güvenilirliğini garanti altına alır. Bu bağımsız bir denetim betiğidir ve sürekli entegrasyon süreçlerinde veya geliştirme aşamasında çalıştırılabilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi bilgisi verilmemiştir, bu nedenle detaylı aksiyom üretilememektedir.

**Tespit edilen yapısal bağımlılıklar (modül sabitlerinden):**

[Aksiyom 1]: Eğer `applied` çağrılacak işlevi tanımlı değilse, migrasyon uygulama kontrolü yapılamaz.

[Aksiyom 2]: Eğer `dateBased` çağrılacak işlevi tanımlı değilse, tarih bazlı migrasyon kontrolü yapılamaz.

[Aksiyom 3]: Eğer `search` çağrılacak işlevi tanımlı değilse, migrasyon arama işlevi çalışmaz.

---

**Not:** Bu modülün (`check_migration_format`) gerçek mimari varsayımlarının üretilmesi için fonksiyon gövdesi koduna erişim gerekmektedir. Mevcut bilgiler sadece üç adet callable referans (applied, dateBased, search) içermektedir; bu durum modülün bir migrasyon sistemi ile etkileşimde olduğunu ima etmekte, ancak kesin koşullar (eşik değerleri, kabul kriterleri, bağımlılıklar) kod gövdesi olmadan belirlenememektedir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **applied** (call) — `JSON.parse(fs.readFileSync('c:\\Users\\alize\\venthub-hvac\\.agents\\explorer...`
- **dateBased** (call) — `applied.filter(v => v.length === 8 || v.includes('_') || !/^\d{14}$/.test(v))`
- **search** (call) — `applied.filter(v => v.includes('20250909') || v.includes('20250909_debug'))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: check_migration_format.js::(modül_seviyesi)
- **params**: (fonksiyon yok)
- **ic_degiskenler**: (fonksiyon gövdesi yok)
- **Dönüş**: yok
- **Not**: Dosya sadece `fs` modülünü import eder ve `applied`, `dateBased`, `search` sabitlerini (muhtemelen dışarıdan çağrılmış fonksiyonlar) referans alır. Fonksiyon gövdesi tanımlı olmadığı için değişken analizi yapılamaz.

---

## NODE ID STANDARD

  file: .agents\explorer_m1_2\check_migration_format.js