---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\media\seat-atex-manifest.mjs
skeleton_hash: 674be591235a18ae
entity_hashes:
  func:arg: 909e9f6fe6691a5f
  func:norm: 8b0c085b486921b8
  overview: 3c39b00ddbaebd93
generated_at: 2026-08-27T12:56:05Z
---

## Genel Bakış

Bu modül, `scripts\media` dizininde yer alan ve adında "seat-atex-manifest" geçen bir manifest işleme modülüdür. Modülde yalnızca iki yardımcı fonksiyon tanımlıdır.

## Fonksiyon Grupları

### Yardımcı Fonksiyonlar
Modüldeki fonksiyonlar temel yardımcı işlemler için kullanılır. `arg` fonksiyonu bir argüman değerine erişim sağlar, `norm` fonksiyonu ise bir girdi değerini normalize eder.
- arg, norm

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdeleri sağlanmadığından, yalnızca imza ve sabit bilgilerinden çıkarım yapılabilmektedir. Ancak fonksiyon gövdesi olmadan kesin aksiyom üretmek mümkün değildir.

[Aksiyom 1]: Eğer `res` ve `rows` await expression'ları başarılı şekilde sonuçlanmazsa, modül beklenen veriyi elde edemez.

[Aksiyom 2]: Eğer `dbKey`, `seatState` ve `atex` çağrıları tanımlı ve erişilebilir değilse, modül çalışamaz.

[Aksiyom 3]: Eğer `bySku` new expression'ı ile oluşturulan yapı (muhtemelen bir Map veya koleksiyon) düzgün oluşturulmazsa, SKU bazlı veri gruplaması yapılamaz.

[Aksiyom 4]: Eğer `arg(n)` fonksiyonu gerekli argümanı alamazsa, modül çalışması için gerekli parametre eksik kalır.

[Aksiyom 5]: Eğer `norm(s)` fonksiyonu düzgün çalışmazsa, string normalizasyonu yapılamaz ve veri tutarsızlıkları oluşabilir.

**Not**: Yukarıdaki aksiyomlar, fonksiyon gövdeleri görülmeden yalnızca imza ve sabit isimlerinden üretilen sınırlı çıkarımlardır. Daha kesin aksiyomlar için fonksiyon gövdelerinin incelenmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### arg
**Ne yapar**: Bilinmiyor. Kaynakta bu fonksiyonun görevine dair bir açıklama (docstring) bulunmamaktadır.
**Nasıl yapar**: Bilinmiyor. Fonksiyonun iç mantığı veya çalışma prensibi hakkında verilen kaynakta bilgi yoktur.
**Parametreler**:
- n: bilinmiyor — Parametrenin türü ve amacı hakkında verilen kaynakta bilgi yoktur.
**Dönüş**: Bilinmiyor. Fonksiyonun dönüş tipi hakkında verilen kaynakta kesin bir bilgi yoktur.

### norm
**Ne yapar**: Bilinmiyor. Kaynakta bu fonksiyonun görevine dair bir açıklama (docstring) bulunmamaktadır.
**Nasıl yapar**: Bilinmiyor. Fonksiyonun iç mantığı veya çalışma prensibi hakkında verilen kaynakta bilgi yoktur.
**Parametreler**:
- s: bilinmiyor — Parametrenin türü ve amacı hakkında verilen kaynakta bilgi yoktur.
**Dönüş**: Bilinmiyor. Fonksiyonun dönüş tipi hakkında verilen kaynakta kesin bir bilgi yoktur.

---

## İTHALATLAR (IMPORTS)
- import: node:fs::fs
- import: node:path::path

---

## SABİTLER
- **dbKey** (call) — `arg('key')`
- **seatState** (call) — `JSON.parse(fs.readFileSync(path.join(seatOut, 't139-manifest.json'), 'utf8'))`
- **atex** (call) — `seatState.unmatched.filter(u => / ATEX$/i.test(u.name.trim()))`
- **res** (await_expression) — `await fetch(`${dbUrl}/rest/v1/products?select=id,name,sku,tenant_id&brand=eq....`
- **rows** (await_expression) — `await res.json()`
- **bySku** (new_expression) — `new Map(rows.map(r => [r.sku, r]))`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: seat-atex-manifest.mjs::(anonim arrow fonksiyon)
- **params**: `f`, `i`
- **ic_degiskenler**:
  - `f` — dosya adı; `path.join` ve `storage_path` template literal'inde kullanılır
  - `i` — dizi indeksi; `sort_order` alanına doğrudan atanır, `alt` ve `storage_path` alanlarında da kullanılır (`i + 1` ve `String(i).padStart(2, '0')`)
  - `baseName` — dış kapsam değişkeni; `source_url` template literal'inde `baz-model:${baseName}` olarak kullanılır
  - `modelDir` — dış kapsam değişkeni; `path.join(modelDir, f)` çağrısında birinci argüman olarak kullanılır
  - `r` — dış kapsam değişkeni; `r.name`, `r.sku`, `r.id` alanlarına erişilir (`alt` ve `storage_path` template literal'lerinde)
  - `state` — dış kapsam değişkeni; `state.tenant_id` alanına erişilir (`storage_path` template literal'inde)
  - `path` — `import path from 'node:path'` ile alınan modül; `path.join` çağrısında kullanılır
- **Dönüş**: Object — şu alanları içeren nesne:
  - `sort_order` — `i` değerine eşit
  - `kind` — sabit `'gallery'` string'i
  - `source_url` — `baseName` ve sabit metin içeren template literal
  - `webp_file` — `path.join(modelDir, f)` sonucu
  - `alt` — `r.name`, `r.sku`, `i + 1` içeren template literal
  - `storage_path` — `state.tenant_id`, `r.id`, `String(i).padStart(2, '0')` içeren template literal

---

## NODE ID STANDARD

  file: scripts\media\seat-atex-manifest.mjs
  function: scripts\media\seat-atex-manifest.mjs::arg
  function: scripts\media\seat-atex-manifest.mjs::norm

---

## DISA AKTARILANLAR (EXPORTS)
  export: arg
  export: norm