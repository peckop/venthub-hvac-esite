---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\media\build-olcek-manifest.mjs
skeleton_hash: 228e58d49090080a
entity_hashes:
  func:arg: 909e9f6fe6691a5f
  overview: 23b700eb723a1ecb
generated_at: 2026-08-27T12:46:21Z
---

## Genel Bakış

`build-olcek-manifest.mjs` modülü, medya alanında ölçek manifest dosyası oluşturmaya yönelik bir betik dosyasıdır. ES modül formatında (.mjs) yazılmıştır. Modül, komut satırı argümanlarını işlemek için bir yardımcı fonksiyon içerir.

## Fonksiyon Grupları

### Komut Satırı Argüman İşleme
Komut satırından alınan argümanları çözümlemek ve betiğin çalışması için gerekli parametreleri elde etmekle sorumludur.
- arg

---

**Not:** Modülde yalnızca tek bir fonksiyon (`arg`) tanımlı olarak verilmiştir. Modülün manifest oluşturma sürecine ilişkin diğer sorumluluklar ve dış bağımlılıklar hakkında kaynakta ek bilgi bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### arg
**Ne yapar**: Fonksiyonun görevi kaynak dokümanda belirtilmemiştir. Dosya adı (`build-olcek-manifest.mjs`) bir ölçek manifest dosyası oluşturma işlemiyle ilişkili olabileceğini ima etse de, `arg` fonksiyonunun bu süreçteki kesin rolü bilinmiyor.

**Nasıl yapar**: Fonksiyonun iç mantığı hakkında verilen bilgide herhangi bir açıklama, docstring veya uygulama detayı bulunmamaktadır. Dolayısıyla nasıl çalıştığı bilinmiyor.

**Parametreler**:
- `n`: tip bilgisi belirtilmemiş — Fonksiyona aktarılan tek parametredir. Ne tür bir değer beklediği (sayı, dize, nesne vb.) kaynakta tanımlanmamıştır.

**Dönüş**: Dönüş tipi bilinmiyor. Kaynakta "void veya bilinmiyor" ifadesi yer almakta olup, kesin dönüş değeri veya tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: node:fs::fs

---

## SABİTLER
- **map** (call) — `JSON.parse(fs.readFileSync(arg('map'), 'utf8'))`
- **outPath** (call) — `arg('out')`
- **codes** (call) — `Object.keys(map.found)`
- **res** (await_expression) — `await fetch(`${url}/rest/v1/products?select=id,name,model_code,tenant_id&bran...`
- **rows** (await_expression) — `await res.json()`
- **tenants** (new_expression) — `new Set(rows.map(r => r.tenant_id))`
- **pilots** (call) — `rows.map(r => ({
  model_code: r.model_code,
  product_id: r.id,
  name: r...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: build-olcek-manifest.mjs::(anonymous arrow function)
- **params**: `r`
- **ic_degiskenler**:
  - `r` — fonksiyona giren tek parametre; bir nesne beklenir
  - `r.model_code` — model kodu; hem `model_code` alanına hem de `map.found` içinde anahtar olarak kullanılır
  - `r.id` — ürün kimliği; `product_id` alanına atanır
  - `r.name` — ürün adı; `name` alanına atanır
  - `map.found` — `map` sabitinden erişilen alt nesne; `r.model_code` anahtarıyla sayfa URL'si alınır
  - `map.found[r.model_code]` — modele karşılık gelen sayfa URL'si; `page_url` alanına atanır
- **Dönüş**: `{ model_code, product_id, name, page_url }` alanlarını içeren nesne

### [N2_NASIL] AST Pointer: build-olcek-manifest.mjs::arg
- **params**: `n`
- **ic_degiskenler**: (gövde verilmemiş — bilinmiyor)
- **Dönüş**: yok (gövde verilmemiş — bilinmiyor)

---

## NODE ID STANDARD

  file: scripts\media\build-olcek-manifest.mjs
  function: scripts\media\build-olcek-manifest.mjs::arg

---

## DISA AKTARILANLAR (EXPORTS)
  export: arg