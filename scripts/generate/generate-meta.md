---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\generate\generate-meta.mjs
skeleton_hash: 455b6b7994befe8e
entity_hashes:
  overview: 85e5163f5bea67d1
generated_at: 2026-08-27T12:41:20Z
---

## Genel Bakış

Bu modül, site meta verilerini (robots.txt, sitemap gibi) üretmek için kullanılan bir betiktir. Modül-seviyesinde çalışır; dışa aktarılan fonksiyon içermez.

Dosya, `node:fs` ve `node:path` modüllerini içe aktarır. `root`, `publicDir`, `rawSiteUrl`, `siteUrl`, `isPreview`, `robotsTxt`, `sitemapPath`, `sitemap` gibi sabitler ve değişkenler tanımlanmıştır. Değişken isimlerinden, public dizinine robots.txt ve sitemap dosyaları yazdığı anlaşılmaktadır; `isPreview` değişkeni ise önizleme ortamı ayrımı için kullanılıyor olabilir.

Hangi ortam değişkenlerinin okunduğu veya harici bir API'ye istek yapılıp yapılmadığı bu kaynak listesinden belirlenememektedir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Modül sabitlerinin yalnızca türleri (`call`, `binary_expression`, `unknown`) belirtilmiştir; fonksiyon gövdesi verilmediğinden bu sabitlerin hangi koşullara bağlı olduğu, hangi değerleri ürettiği veya hangi hata durumlarını tetiklediği bilinmemektedir. Kaynak kodu olmadan aksiyom üretmek, kural 0d gereği çıkarım yapmak anlamına gelir ve bu belgeyi okuyanları yanıltabilir.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: node:fs::fs
- import: node:path::path

---

## SABİTLER
- **root** (call) — `process.cwd()`
- **publicDir** (call) — `path.join(root, 'public')`
- **rawSiteUrl** [env-backed] (binary_expression) — `process.env.VITE_SITE_URL || 'https://venthub-hvac-esite.pages.dev'`
- **siteUrl** (unknown)
- **isPreview** [env-backed] (call) — `(() => {
  if (process.env.VITE_NOINDEX === 'true') return true
  try {
  ...`
- **robotsTxt** (binary_expression) — `robotsLines.join('\n') + '\n'`
- **sitemapPath** (call) — `path.join(publicDir, 'sitemap.xml')`
- **sitemap** (unknown)

---

## AST POINTERS

### [N1_NASIL] AST Pointer: generate-meta.mjs::isPreview
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `host` — `new URL(siteUrl).hostname` ile `siteUrl`'den çıkarılan hostname değeri; `.pages.dev` ile bitip bitmediğini test etmek için kullanılır
- **Dönüş**: boolean — `process.env.VITE_NOINDEX === 'true'` ise `true`; `siteUrl` hostname'i `.pages.dev` ile bitiyorsa `true`; URL ayrıştırma hatası olursa `false`

---

## NODE ID STANDARD

  file: scripts\generate\generate-meta.mjs