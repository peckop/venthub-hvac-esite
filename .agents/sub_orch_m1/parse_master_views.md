---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_master_views.js
skeleton_hash: 99d9ab7e5a5c2d1c
entity_hashes:
  overview: 32f58eb9a232f8d5
generated_at: 2026-05-30T20:21:38Z
---

## Genel Bakış
Bu modül, HVAC projesindeki ana视图 (master views) tanımlarını içeren bir YAML dosyasını okuyup işleyerek sistem tarafından kullanılabilecek yapılandırılmış bir veri yapısına dönüştürür. Modül, dosya okuma işlemlerini yürütür ve elde edilen verileri `views` sabitinde saklayarak uygulamanın başka kısımlarının erişimine sunar.

## Fonksiyon Grupları
Bu dosyada tanımlanmış herhangi bir fonksiyon bulunmamaktadır; yalnızca modül düzeyinde (üst seviye) kod yer almaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca modül sabitlerine dayalı temel mimari varsayımlar tanımlanmıştır. Fonksiyon imzası bilgisi verilmediğinden, parametrelerle ilgili aksiyomlar oluşturulamamıştır.

---

**[Aksiyom 1]:** Eğer `content` değişkeni mevcut değilse veya erişilebilir değilse, modül `content` çağrısında (`content (call)`) hata oluşur.

**[Aksiyom 2]:** Eğer `lines` değişkeni mevcut değilse veya erişilebilir değilse, modül `lines` çağrısında (`lines (call)`) hata oluşur.

**[Aksiyom 3]:** Eğer `views` nesnesini oluşturmak için kullanılan constructor/factory fonksiyon tanımlı değilse, `views (new_expression)` oluşturulamaz ve modül çalışması durur.

**[Aksiyom 4]:** Eğer `content` boş, null veya geçersiz bir yapıda ise, `lines` ve `views` başarıyla üretilmeyebilir (içerik-bağımlılık).

**[Aksiyom 5]:** Eğer `lines` üretimi başarısız olursa, `views` ifadesinin doğru çalışması garanti edilemez (sıralı bağımlılık varsayımı).

---

**Not:** Fonksiyon imza bilgisi (`(yok)`) verilmediğinden, modülün hangi parametreleri aldığına, hangi dönüş tipine sahip olduğuna veya hangi eşik değerlerine sahip olduğuna ilişkin aksiyomlar oluşturulamamıştır. Daha detaylı aksiyon üretimi için fonksiyon gövdesi veya imza bilgisi gereklidir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **content** (call) — `fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_sch...`
- **lines** (call) — `content.split('\n')`
- **views** (new_expression) — `new Set()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `parse_master_views.js` (modül-seviyesi)
> ⚠️ Bu dosyada tanımlanmış **hiçbir fonksiyon yoktur**. Dosya tamamen modül-seviyesi (top-level) kodlardan oluşmaktadır.

- **params**: (yok — modül-seviyesi script, parametre almaz)
- **ic_degiskenler**:
  - `content` — `fs` modülünden bir dosya okuma çağrısıyla elde edilen dosya içeriği (muhtemelen `fs.readFileSync(...)`)
  - `lines` — `content` değerinin bir split/aralık çağrısıyla satırlara ayrılmış hali (muhtemelen `content.split(...)`)
  - `views` — `new` ifadesiyle oluşturulmuş bir nesne örneği (muhtemelen `new Map()` veya benzeri bir koleksiyon yapısı)
- **Dönüş**: (yok — script dosyasıdır, dönüş değeri üretmez; yan etki olarak `views` yapısını doldurması beklenir)

---

> **Not**: Fonksiyon gövdesi verisi `(yok)` olarak belirtildiğinden, değişkenlerin tam kullanım bağlamı (hangi döngüde, hangi koşulla) mevcut AST verisiyle doğrulanamamaktadır. Yukarıdaki bilgiler yalnızca **sabitler**, **import** ve **new_expression** bölümlerinden çıkarılmıştır.

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_master_views.js