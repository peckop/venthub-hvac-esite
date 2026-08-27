---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\assert-node-major.mjs
skeleton_hash: fd7f3b80cc9c710e
entity_hashes:
  func:beklenenMajor: 0688e06dc6839b3b
  overview: 90fadb8386f19198
generated_at: 2026-08-27T12:14:36Z
---

## Genel Bakış
Bu modül, Node.js major sürüm doğrulaması yapan bir script'tir. Modül, beklenen sürüm bilgisini sağlayan tek bir fonksiyon içerir.

## Fonksiyon Grupları
### Sürüm Doğrulama
Beklenen Node.js major sürüm numarasını tanımlar ve sağlar.
- beklenenMajor

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### beklenenMajor
**Ne yapar**: `package.json` dosyasındaki `engines.node` alanından hedef Node.js ana sürüm (major) numarasını türeten yardımcı fonksiyondur. Tek doğruluk kaynağı (SSOT) prensibiyle çalışır; major sürüm elle kodda sabitlenmez, dosyadan okunarak türetilir.

**Nasıl yapar**: `readFileSync` ile `package.json` dosyasını eşzamanlı olarak okur ve `JSON.parse` ile ayrıştırır. Ardından `engines.node` alanını kontrol eder; bu alan string değilse hata nesnesi döndürür. String ise `^(\d+)\.` regex deseniyle ana sürüm numarasını yakalamaya çalışır. Eşleşme başarısız olursa yine hata nesnesi döndürür. Başarılı eşleşmede yakalanan grup `Number()` ile sayıya dönüştürülerek `major` ve orijinal ham değer birlikte döndürülür.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: Fonksiyon iki farklı yapıda nesne döndürebilir:
- Başarılı durumda: `{ major: Number, ham: string }` — `major` yakalanan ana sürüm sayısını, `ham` ise `engines.node` alanındaki orijinal string değeri içerir.
- Hata durumunda: `{ hata: string }` — `engines.node` alanı bulunamadığında veya beklenen biçime uymadığında açıklayıcı hata mesajı içeren nesne döndürür.

---

## İTHALATLAR (IMPORTS)
- import: node:fs::readFileSync

---

## SABİTLER
- **KATI** [env-backed] (call) — `Boolean(process.env.VERCEL || process.env.CI)`
- **ortam** [env-backed] (ternary_expression) — `process.env.VERCEL ? 'vercel' : process.env.CI ? 'ci' : 'lokal'`
- **hedef** (call) — `beklenenMajor()`
- **gercek** (call) — `Number(process.versions.node.split('.')[0])`
- **mesaj** (binary_expression) — `'Node ana sürümü AYRIŞTI: koşan ' +
  String(gercek) +
  ', beklenen ' +
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: assert-node-major.mjs::beklenenMajor
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `pkg` — `readFileSync('package.json', 'utf8')` ile okunan dosya içeriğinin `JSON.parse` ile çözümlenmiş JavaScript nesnesi
  - `ham` — `pkg?.engines?.node` zincir erişimiyle elde edilen `engines.node` değeri; opsiyonel zincirleme kullanıldığından alan yoksa `undefined` olur
  - `m` — `ham.match(/^(\d+)\./)` ifadesinin döndürdüğü RegExp eşleşme dizisi; eşleşme yoksa `null` olur
- **Dönüş**: Nesne (`object`). Üç olası durum:
  - `ham` bir string değilse → `{ hata: 'package.json > engines.node YOK — hedef ana sürüm türetilemiyor' }`
  - `ham` regex ile eşleşmiyorsa → `{ hata: 'engines.node = "' + ham + '" — beklenen biçim "<MAJOR>.x"' }`
  - Eşleşme başarılıysa → `{ major: Number(m[1]), ham }` — burada `major` ana sürüm numarasının sayısal karşılığı, `ham` ise orijinal ham değerdir

---

## NODE ID STANDARD

  file: scripts\assert-node-major.mjs
  function: scripts\assert-node-major.mjs::beklenenMajor

---

## DISA AKTARILANLAR (EXPORTS)
  export: beklenenMajor