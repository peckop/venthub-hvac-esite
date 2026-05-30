---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parse_migrations.js
skeleton_hash: 32c1db73afe3e17d
entity_hashes:
  func:clean: e23e49530b54fbea
  overview: 78c06687658c0987
generated_at: 2026-05-30T20:21:48Z
---

## Genel Bakış
Bu modül, veritabanı migrasyon dosyalarını işlerken oluşabilecek düzensizlikleri gidermek ve verileri standart bir forma sokmak için yardımcı fonksiyonlar sunar. Temel olarak, metin tabanlı migrasyon içeriklerini temizleyen ve düzenleyen bir yardımcı işlevi içerir.

## Fonksiyon Grupları
### Metin Temizleme Yardımcıları
Bu grup, ham metin verilerini (özellikle migrasyon içeriklerini) standart bir forma getirmek için temizleme ve Normalleştirme işlemleri yapar.
- clean

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:**  
Modülde tanımlı `clean(str)` fonksiyonunun gövdesi, fonksiyonun內部 yapısı ve modül sabitlerinin (`files`, `tables`, `output`) nasıl kullanıldığına dair somut bir bilgi verilmemiştir. Mimari varsayımlar, yalnızca fonksiyon gövdesindeki kodlamadan türetilebilir; mevcut bilgilerle (yalnızca fonksiyon imzası ve sabit isimleri)可靠的 varsayımlarda bulunulamaz. Dolayısıyla, modül için geçerli bir aksiyom çıkarılamamaktadır.

---

## FONKSİYON DETAYLARI

### clean

**Ne yapar**: Verilen string girdisi üzerinde temizleme işlemi gerçekleştirerek tutarlı ve normalize edilmiş bir çıktı üretir. Bu fonksiyon, farklı tırnak işaretlerinden arınmış, başlangıç ve bitiş boşlukları temizlenmiş ve küçük harflere dönüştürülmüş bir string döndürür.

**Nasıl yapar**: Fonksiyon, önce girdi değerinin varlığını kontrol eder; eğer boş veya tanımsız ise doğrudan boş bir string döndürür. Geçerli bir string alırsa, bir正则 ifadesi (regular expression) kullanarak tüm tek tırnak (`'`), çift tırnak (`"`) ve backtick (`) karakterlerini kaldırır. Ardından `trim()` metodu ile stringin başındaki ve sonundaki tüm boşlukları temizler ve son olarak `toLowerCase()` metodu ile tüm karakterleri küçük harfe dönüştürür.

**Parametreler**:
- `str`: string — Temizlenecek ve normalize edilecek girdi stringi. Tanımsız veya boş olabilir.

**Dönüş**: string — Tırnak işaretlerinden arınmış, boşlukları temizlenmiş ve küçük harfe dönüştürülmüş temiz bir string döndürür. Girdi tanımsız veya boş ise boş bir string (`''`) döndürür.

---

## SABİTLER
- **files** (call) — `fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()`
- **tables** (new_expression) — `new Set()`
- **output** (object) — `{
  tables: Array.from(tables).sort(),
  policies: {}
}`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: parse_migrations.js::clean
- **params**:
  - `str` — temizlenecek ve normalize edilecek ham metin dizesi
- **ic_degiskenler**: (yok)
- **Dönüş**: `string` — boşluk/aksan/noktalama işaretleri (`'`, `"`, `` ` ``) temizlenmiş,trimmed ve küçük harf'e çevrilmiş metin; boş/undefined/falsy girişler için boş string (`''`) döner

---

## NODE ID STANDARD

  file: .agents\sub_orch_m1\parse_migrations.js
  function: .agents\sub_orch_m1\parse_migrations.js::clean

---

## DISA AKTARILANLAR (EXPORTS)
  export: clean