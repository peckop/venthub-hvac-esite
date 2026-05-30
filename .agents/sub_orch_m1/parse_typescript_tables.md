---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_typescript_tables.js
skeleton_hash: 7fad44e4fb91aeb7
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:22:37Z
---

## Genel Bakış

Bu modül, bir TypeScript dosyasının içeriğini okuyarak içindeki tablo tanımlarını RegExp tabanlı bir parsing ile çıkaran bağımsız bir script'tir. Dosya, fs modülü ile kaynak bir TypeScript dosyasını okur, `public` erişimli tablo bloklarını tespit eder ve bu bloklardaki tablo verilerini düzenli bir şekilde parse eder. Modül herhangi bir function veya class tanımlamaz; doğrudan çalıştırılabilen üst seviye (top-level) kodlardan oluşur.

---

**Not:** Bu dosyada fonksiyon veya metod bulunmamaktadır. Tüm kod, script seviyesinde doğrudan yürütülen lệnhlerden oluşmaktadır. Fonksiyon Grupları bölümü bu nedenle üretilmemiştir.

---



---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync(tsFilePath, 'utf-8')`
- **publicMatch** (call) — `content.match(/public:\s*\{\s*Tables:\s*\{([\s\S]*?)\n\s*\}\s*Views:/)`
- **tablesBlock** (subscript_expression) — `publicMatch[1]`
- **tableRegex** (regex) — `/^\s*([a-zA-Z0-9_]+):\s*\{/gm`
- **match** (unknown)

---

## AST POINTERS

Dosyada tanımlı fonksiyon bulunmamaktadır. Dosya modül düzeyinde kod içermektedir.

### [N1_NASIL] AST Pointer: parse_typescript_tables.js::(module-level code)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fs` — fs modülünün import'u, dosya okuma/yazma işlemleri için kullanılır
  - `content` — `fs.readFileSync()` çağrısı ile okunan dosya içeriği (ham string)
  - `publicMatch` — regex eşleşmesi sonucu dönen match nesnesi (public API bloğunu bulmak için)
  - `tablesBlock` — subscript erişimi ile elde edilen belirli bir blok/segment
  - `tableRegex` — tabloları eşleştirmek için tanımlanan regex patterni
  - `match` — bir regex eşleşme sonucu (türü belirsiz)
- **Dönüş**: Yok (modül dosyası, dışa bir şey döndürmez — yan etkilerle çalışır; muhtemelen parse edilmiş tabloları dosyaya yazar)

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_typescript_tables.js