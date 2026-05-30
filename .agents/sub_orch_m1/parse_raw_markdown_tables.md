---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_raw_markdown_tables.js
skeleton_hash: 5c211cad68b7baf5
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:22:06Z
---

## Genel Bakış

Bu modül, agent orchestrator sisteminin bir parçası olarak raw markdown tablolarını okuyup parse eden bir script modülüdür. Dosya sisteminden ham markdown içeriğini çekerek satırlara böler ve yapılandırılmış veriye dönüştürmeye hazırlar. `.agents/sub_orch_m1/` dizininde konumlandığı için, alt orchestrator'ın pipeline'ında hammadde veri işleme sorumluluğunu üstlenir.

## Modül Yapısı

Dosya, fonksiyon içermeyen üst seviye (top-level) ifadelerden oluşmaktadır. `fs` modülünü import ederek dosya sistemi erişimi sağlar, `content` ve `lines` değişkenleri aracılığıyla okunan markdown dosyasının ham içeriğini ve satır bazlı ayrıştırmasını tutar. Script olarak doğrudan çalıştırıldığında belirli bir markdown dosyasını okuyarak parse edilmemiş tablo verilerini ortam değişkenlerinden aldığı yollardan işler.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Verilen modül, fonksiyon imzası veya implementasyon detayı içermemektedir. Sadece modül adı (`parse_raw_markdown_tables`) ve iki parametre (`content`, `lines`) belirtilmiştir. Mimari varsayımlar, fonksiyon gövdesindeki mantıksal bağımlılıklar ve ön koşullar üretildiği için, bu modül için somut bir varsayımda bulunmak mümkün değildir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_sch...`
- **lines** (call) — `content.split('\n')`

---

## AST POINTERS

Bu dosya için **hiçbir fonksiyon gövdesi veya imzası** sağlanmamıştır.

### Özet

| Özellik | Durum |
|---------|-------|
| Import | `fs` modülü |
| Tanımlı sabit/değişken | `content` (fs çağrısından elde edilen), `lines` (satırlara bölünmüş hal) |
| Fonksiyon tanımları | — |
| Class tanımları | — |

Dosya, muhtemelen bir **top-level script** yapısındadır — fonksiyon veya sınıf içermemekte, doğrudan `fs` import'u ile dosya okuma ve `content` / `lines` değişkenleri üzerinde çalışmaktadır.

---

*Fonksiyon gövdeleri sağlandığında AST Pointers yeniden üretilecektir.*

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_raw_markdown_tables.js