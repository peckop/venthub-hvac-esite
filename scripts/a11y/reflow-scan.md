---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\scripts\a11y\reflow-scan.mjs
skeleton_hash: 41a2495c7e391633
entity_hashes:
  overview: 48f5bc4b4132096b
generated_at: 2026-08-27T12:18:37Z
---

## Genel Bakış

Bu modül, farklı ekran genişliklerinde sayfaların reflow davranışını test eden bir erişilebilirlik tarama scriptidir. Playwright kütüphanesinin `chromium` modülü kullanılarak tarayıcı üzerinden sayfalar yüklenir ve çeşitli genişliklerde ölçümler yapılır.

Modül, `baseUrl` değişkeniyle belirtilen temel URL altında tanımlı `routes` rotalarını, `widths` dizisindeki farklı genişliklerde tarar. Tarama sonucunda elde edilen ölçümler `measured` değişkeninde toplanır. `browser` değişkeni Playwright tarayıcı örneğini tutar.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: @playwright/test::chromium

---

## SABİTLER
- **baseUrl** (subscript_expression) — `process.argv[2]`
- **routes** (call) — `(
  process.argv[3] ??
  '/tr,/tr/products,/tr/cart,/tr/support,/tr/hakkimi...`
- **widths** (call) — `(process.argv[4] ?? DEFAULT_WIDTHS.join(','))
  .split(',')
  .map((w) => N...`
- **browser** (await_expression) — `await chromium.launch()`
- **measured** (binary_expression) — `results.length - errored`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: scripts/a11y/reflow-scan.mjs::(tol) =>
- **params**: `tol` — yatay taşma toleransı (piksel); bu değerin altındaki taşma ihmal edilir
- **ic_degiskenler**:
  - `doc` — `document.scrollingElement ?? document.documentElement` atanır; `scrollWidth` ölçümü için kullanılan kaynak düğüm
  - `viewportWidth` — `window.innerWidth` atanır; tarayıcı görünür alan genişliği
  - `htmlOverflowX` — `getComputedStyle(document.documentElement).overflowX` atanır; `<html>` elementinin hesaplanmış `overflow-x` değeri
  - `bodyOverflowX` — `getComputedStyle(document.body).overflowX` atanır; `<body>` elementinin hesaplanmış `overflow-x` değeri
  - `domNodes` — `document.querySelectorAll('body *').length` atanır; `<body>` altındaki toplam DOM düğüm sayısı; koruma/hata sayfası tespiti için kullanılır
  - `invalidReasons` — boş dizi (`[]`); ölçüm geçersizlik nedenleri toplanır (`overflow-x:clip` varsa veya `domNodes < 30` ise doldurulur)
  - `prevHtml` — `document.documentElement.style.overflowX` atanır; ölçüm öncesi `<html>` inline `overflow-x` değeri; ölçüm sonrası geri yüklenir
  - `prevBody` — `document.body.style.overflowX` atanır; ölçüm öncesi `<body>` inline `overflow-x` değeri; ölçüm sonrası geri yüklenir
  - `overflowPx` — `doc.scrollWidth - viewportWidth` atanır; sayfadaki yatay taşma miktarı (piksel)
  - `scrollWidthUnclamped` — `doc.scrollWidth` atanır; `overflow-x:visible` yapıldıktan sonra ölçülen kısıtlanmamış scroll genişliği
  - `unique` — boş dizi (`[]`); taşmaya neden olan element zincirinin son altı halkası burada toplanır
  - `node` — `document.body` atanır; ağaçta aşağı inme döngüsünde mevcut düğümü temsil eder
  - `depth` — `0` atanır; ağaçta inme döngüsündeki mevcut derinlik seviyesi; `25` üst sınırı ile sınırlıdır
  - `chain` — boş dizi (`[]`); suçlu elementlerin zincir bilgilerini tutar (her halka: `tag`, `overPx`, `widthPx`, `cls`, `depth`, opsiyonel `self`)
  - `children` — `Array.from(node.children)` atanır; mevcut `node`'un doğrudan çocuk elementleri
  - `culprit` — `null` atanır; döngüde `display:none` yapıldığında taşmayı kapatan çocuk element; bulunamazsa `null` kalır
  - `prevDisplay` — `child.style.display` atanır; çocuğun `display` değeri geçici olarak `none` yapılmadan önce saklanır
  - `closed` — `doc.scrollWidth - viewportWidth <= tol` atanır; çocuğun gizlenmesiyle taşmanın tolerans altına düşüp düşmediğini gösterir
  - `rect` — `node.getBoundingClientRect()` veya `culprit.getBoundingClientRect()` atanır; suçlu elementin boyut ve konum bilgisi
  - `cls` — `typeof node.className === 'string' ? node.className : ''` atanır; elementin sınıf adı (maksimum 120 karaktere kesilir)
- **Dönüş**: Obje — şu alanları içerir: `viewportWidth` (sayı), `scrollWidth` (sayı), `overflowPx` (sayı), `htmlOverflowX` (dize), `bodyOverflowX` (dize), `domNodes` (sayı), `invalidReasons` (dizi), `offenders` (dizi — her eleman: `tag`, `overPx`, `widthPx`, `cls`, `depth`, opsiyonel `self`)

---

## NODE ID STANDARD

  file: scripts\a11y\reflow-scan.mjs