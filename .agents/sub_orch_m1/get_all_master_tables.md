---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\get_all_master_tables.js
skeleton_hash: b0751fafc5c5d84a
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:19:43Z
---

## Genel Bakış

Bu modül, HVAC sistem yapılandırmasında kullanılan ana tabloları (master tables) merkezi bir kaynaktan okur ve işler. Dosya sistemi üzerinden bir yapılandırma dosyasını okuyarak içeriği satırlara böler, ardından farklı bölümlerden (Section 1, Section 2, Section 6) tabloları çıkarır ve tek bir `allTables` yapısında birleştirir. Bu sayede sistem genelinde referans tablolarına tek noktadan erişim sağlanır.

## Modül Yapısı

Bu dosyada tanımlı fonksiyon bulunmamaktadır; tüm işlem modül seviyesinde (top-level) yürütülür. Önce `fs` modülü ile kaynak dosya okunur, ardından `content` değişkeninde tutulan ham metin satırlara ayrılır. Her bir "tablesSection" değişkeni, dosyanın belirli bir bölgesinden çıkarılan tablo verilerini tutar. Son olarak tüm bu bölümler `allTables` dizisinde birleştirilerek modülün temel çıktısı oluşturulur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir YAML kaynak dosyasından tablo bölümlerini ayrıştırarak birleştiren bir veri toplama modülüdür.

---

**[Aksiyom 1]**: Eğer `content` değişkeni boş string veya null/undefined ise, `lines` ve tablo bölüm değişkenleri (`tablesSection1`, `tablesSection2`, `tablesSection6`) boş dizi veya boş string değer döndürür.

**[Aksiyom 2]**: Eğer kaynak dosya içeriğinde `tablesSection1`, `tablesSection2` veya `tablesSection6` bölümleri için tanımlayıcı (header) bulunamazsa, ilgili sections değişkenleri boş değer ile döner.

**[Aksiyom 3]**: Eğer `allTables` oluşturulacaksa, `tablesSection1`, `tablesSection2` ve `tablesSection6` değerlerinin birleşiminden oluşmalıdır — eksik bölümler varsa dahi birleştirme devam eder.

**[Aksiyom 4]**: Eğer kaynak dosya (`source_path`) okunamaz veya erişilemez ise, tüm değişkenler (`content`, `lines`, tüm tablolar) boş değerler ile başlatılır.

**[Aksiyom 5]**: `tablesSection1`, `tablesSection2` ve `tablesSection6` bölümleri birbirinden bağımsız olarak ayrıştırılır — bir bölümün ayrıştırılamaması diğer bölümlerin ayrıştırılmasını engellemez.

---

**Not:** Bu modülün fonksiyon gövdesi detayları verilmediği için, ayrıştırma mantığına (regex pattern, delimiter vb.) dair aksiyomlar tanımlanamamıştır. Sadece sabit isimlerinden ve tiplerinden çıkarılabilen yapısal varsayımlar yukarıda listelenmiştir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_sch...`
- **lines** (call) — `content.split('\n')`
- **tablesSection1** (new_expression) — `new Set()`
- **tablesSection2** (new_expression) — `new Set()`
- **tablesSection6** (new_expression) — `new Set()`
- **allTables** (new_expression) — `new Set([...tablesSection1, ...tablesSection2, ...tablesSection6])`

---

## AST POINTERS

Bu dosyada **fonksiyon tanımları bulunmamaktadır**. Dosya yalnızca üst seviye (top-level) kod içermektedir.

---

### [N1_NASIL] AST Pointer: get_all_master_tables.js::(üst-seviye-kod)
- **params**: (fonksiyon yok — üst seviye script)
- **ic_degiskenler**: 
  - `content` — `fs` modülü ile bir dosyanın okunan ham string içeriği
  - `lines` — `content`'in satırlara bölünmüş hali (array)
  - `tablesSection1` — `lines` içinden çıkarılan birinci tablo bölümünün işlenmiş verisi
  - `tablesSection2` — `lines` içinden çıkarılan ikinci tablo bölümünün işlenmiş verisi
  - `tablesSection6` — `lines` içinden çıkarılan altıncı tablo bölümünün işlenmiş verisi
  - `allTables` — `tablesSection1`, `tablesSection2`, `tablesSection6` birleştirilerek oluşturulan tüm tabloların toplu listesi
- **Dönüş**: yok (üst seviye script; dosya yan etkileriyle çalışır)

---

### IMPORTLAR
| Değişken | Kaynak |
|----------|--------|
| `fs` | `'fs'` — Node.js dosya sistemi modülü, dosya okuma/yazma işlemleri için kullanılır |

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\get_all_master_tables.js