---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_all_tables_master.js
skeleton_hash: b06ed6315d87df7c
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:20:00Z
---

## Genel Bakış

Bu modül, HVAC veritabanı şemasını analiz eden bağımsız bir scripttir. Veritabanı yapılandırma dosyasını okuyarak tabloları ve sütunlarını tespit eder, ardından bu yapıları okunabilir bir markdown belgesine dönüştürerek çıktı üretir.

## Modül Yapısı

Dosyada tanımlı fonksiyon bulunmamaktadır; tüm işlem üst düzey kod bloklarıyla yürütülür.  
- `fs` modülü kullanarak belirtilen dosya yolundaki veritabanı yapılandırma dosyasını okur.  
- Okunan içeriği satır satır işleyerek `CREATE TABLE` ifadelerini ve sütun başlıklarını algılar.  
- Algılanan tablo listesini ve sütun yapısını markdown formatında düzenleyerek `table_list.md` dosyasına yazar.  
- Modül, dosya yolları için mutlak yollar kullanır ve bağımsız bir script olarak çalıştırılır.

---



---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_sch...`
- **lines** (call) — `content.split('\n')`
- **headings** (new_expression) — `new Set()`

---

## AST POINTERS

> **Not**: Bu dosyada fonksiyon gövdesi bulunamadı. Sadece üst düzey (top-level) sabitler mevcuttur.

### Top-Level Sabitler (fonksiyon dışı)

| Sabit | Tür | Açıklama |
|-------|-----|----------|
| `content` | call | `fs` ile okunan dosya içeriği |
| `lines` | call | `content`'in satırlara bölünmüş hali |
| `headings` | new_expression | Başlık yapısını tutan dizi/nesne |

---

**Sonuç**: Bu dosyada (`parse_all_tables_master.js`) herhangi bir fonksiyon tanımı bulunmamaktadır. Dosya muhtemelen üst düzey script olarak çalışmakta, sadece `content`, `lines` ve `headings` sabitleri tanımlanmaktadır. Fonksiyon gövdesi sağlandığında AST Pointers üretilebilir.

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_all_tables_master.js