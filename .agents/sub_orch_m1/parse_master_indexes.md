---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_master_indexes.js
skeleton_hash: a89694b225196eb8
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:21:09Z
---

## Genel Bakış

Bu modül, HVAC sistemindeki veritabanı yapılandırmasını analiz eden bir betik dosyasıdır. Dosya sisteminden okunan bir kaynaktan tablo tanımlarını ayrıştırarak hangi tablolarda indeks bulunduğunu tespit eder ve `tablesWithIndexes` değişkeninde depolar. Modül, bir fonksiyon içermez; doğrudan çalışan üst düzey (top-level) kodlardan oluşur.

---

**Not:** Bu dosyada tanımlanmış herhangi bir fonksiyon bulunmamaktadır. Modül, salt okunur bir betik (script) yapısındadır ve doğrudan çalıştırıldığında tablo indekslerini ayrıştırma işlemini gerçekleştirir.

---



---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_sch...`
- **lines** (call) — `content.split('\n')`
- **tablesWithIndexes** (call) — `Array.from(new Set(indexes.map(i => i.table))).sort()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_master_indexes.js::(modül_seviyesi)
- **params**: (yok — modül seviyesi)
- **ic_degiskenler**:
  - `content` — fs.readFileSync ile okunan dosya içeriği (call)
  - `lines` — content.split ile satırlara ayrılmış dizi (call)
  - `tablesWithIndexes` — satırlardan çıkarılan tablo ve indeks verileri (call)
- **Dönüş**: yok

---

**Not:** Bu dosyada imza tanımlı ve gövdesi verilmiş herhangi bir fonksiyon bulunmamaktadır. Yukarıdaki değişkenler modül seviyesinde hesaplanan (top-level script) değişkenlerdir; `fs` import'uyla dosya okunup `content`, `lines` ve `tablesWithIndexes` sırasıyla türetilmektedir.

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_master_indexes.js