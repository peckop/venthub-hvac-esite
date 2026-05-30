---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_ts_keys.js
skeleton_hash: e2cf5d34ff1c5bf1
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:22:18Z
---

## Genel Bakış

Bu modül, TypeScript dosyalarını okuyarak içindeki anahtar (key) tanımlarını çıkaran bir komut dosyasıdır. Dosya sistemi üzerinden `.ts` dosyalarının içeriğini satır satır tarar ve belirli kalıplara uyan anahtar değerleri ayrıştırır. Modül seviyesinde çalışan bir script olup herhangi bir dış bağımlılık veya ortam değişkeni kullanmamaktadır.

---

> **Not:** Bu dosyada tanımlı herhangi bir fonksiyon bulunmamaktadır. Kod, doğrudan modül seviyesinde çalışan üst düzey (top-level) ifadelerden oluşmaktadır. Bu nedenle "Fonksiyon Grupları" bölümü üretilmemiştir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, TypeScript dosya içeriklerinden anahtar (key) tanımlarını çıkarmak üzere tasarlanmıştır.

**[Aksiyom 1 - İçerik Geçerliliği]:** Eğer `content` parametresi geçerli bir metin (string) değilse veya boşsa, parsing işlemi anlamlı sonuç üretmez.

**[Aksiyom 2 - Başlangıç İndeks Sınırı]:** Eğer `startIdx` değeri `content` uzunluğundan büyük veya negatif ise, okuma işleminde indexOutOfBounds hatası oluşur veya boş sonuç döner.

**[Aksiyom 3 - Satır Yapısı]:** Eğer `content` satırlara ayrılamıyorsa (örn: binary/non-text veri), `lines` dizisi beklenen formatta oluşmaz ve key çıkarma başarısız olur.

**[Aksiyom 4 - Binary Expression Parsing]:** `index` (binary_expression) değişkeninin geçerli bir token pozisyonunu göstermesi gerekir; eğer `lines` dizisinde ilgili satır yoksa veya token yapısı bozuksa, parsing sonucu tutarsız olur.

**[Aksiyom 5 - TypeScript Kaynak Dosya Yapısı]:** Bu modülün çalışması için `content`'in TypeScript sözdizimi kurallarına uygun (en azından kısmi) bir kaynak kod yapısı içermesi varsayılır. Tamamen geçersiz sözdizimi içeriği verilirse sonuç tanımsızdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync(tsFilePath, 'utf-8')`
- **startIdx** (call) — `content.indexOf('Tables: {')`
- **index** (binary_expression) — `startIdx + 'Tables: {'.length`
- **lines** (call) — `currentWord.split('\n')`

---

## AST POINTERS

Bu dosyada (`parse_ts_keys.js`) tanımlı herhangi bir **fonksiyon gövdesi bulunmamaktadır**.

Dosya, modül seviyesinde çalışan bir **script** yapısındadır:

- **IMPORTLAR**: `fs` modülü import edilmiş (dosya okuma/yazma işlemleri için)
- **SABİTLER** (modül seviyesi değişkenler):
  - `content` — `fs` ile okunan bir dosya içeriği (call expression; muhtemelen `fs.readFileSync` benzeri bir çağrı)
  - `startIdx` — bir call expression sonucu hesaplanan başlangıç indeksi
  - `index` — binary expression ile türetilen indeks değeri
  - `lines` — call expression sonucu oluşan satır dizisi (muhtemelen `content.split(...)` benzeri)

> **Sonuç**: Bu dosya için AST Pointer üretilemez — `FONKSIYON IMZALARI` ve `FONKSIYON GÖVDELERI` bölümleri boş olup, herhangi bir fonksiyon tanımı içermemektedir. Kod doğrudan modül üst düzeyde çalışmaktadır.

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_ts_keys.js