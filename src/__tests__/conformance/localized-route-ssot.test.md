---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\localized-route-ssot.test.ts
skeleton_hash: 5f632b805c00b271
entity_hashes:
  func:stripComments: 93ad94a6946c3886
  func:toRelPath: 5935533af5852617
  overview: 856c01d5ddeac4b0
generated_at: 2026-06-15T17:01:08Z
---

## Genel Bakış
Bu modül, lokalize edilmiş rotaların tutarlılığını doğrulayan konformance testleri için yardımcı fonksiyonlar içerir. İki basit yardımcı işlev, test senaryolarında kullanılan kaynak kod analizi ve dosya yolu dönüştürme işlemlerini gerçekleştirir.

## Fonksiyon Grupları
### Yardımcı Fonksiyonlar (Test Utilities)
Test senaryolarında veri hazırlama ve dönüştürme işlemleri için kullanılan iki yardımcı fonksiyondan oluşur.
- stripComments, toRelPath

---

## AXIOMS – Mimari Varsayımlar

Bu modül, yerelleştirilmiş rotaların kaynak doğruluğunu (SSoT) test eden yardımcı fonksiyonlar ve sabitler içerir. Aşağıdaki mimari varsayımlar yalnızca fonksiyon imzaları ve modül sabitlerinden çıkarılmıştır:

---

**[Aksiyom 1]:** Eğer `stripComments`'e verilen `source` parametresi geçerli bir metin içermiyorsa, fonksiyon tanımsız davranış gösterir.

**[Aksiyom 2]:** Eğer `toRelPath`'e verilen `globKey` parametresi beklenen glob anahtar formatına uymuyorsa (örn. geçerli bir path deseni içermiyorsa), dönüş değeri anlamsız veya boş bir yol olur.

**[Aksiyom 3]:** Eğer `SOURCES` bir çağrı (call) olarak tanımlıysa, modülün çalışması için bu kaynağın erişilebilir ve döndürdüğü verinin işlenebilir formatta olması gerekir; aksi halde kaynak analizi başarısız olur.

**[Aksiyom 4]:** Eğer `MANUAL_LANG_PREFIX` regex'i dil ön eklerini eşleştirecek şekilde tanımlıysa, test edilen dosya yollarının bu deseni destekleyen yapıda olması gerekir; aksi halde manuel dil önekleri tespit edilemez.

**[Aksiyom 5]:** Eğer `HARDCODED_APP_PATH` regex'i sabit uygulama yollarını eşleştirecek şekilde tanımlıysa, test edilen kaynaklarda bu desenle uyuşmayan hardcoded yollar tespit edilemez.

**[Aksiyom 6]:** Eğer `stripComments` işlevi tek kaynak doğruluğu (SSoT) testi için kullanılıyorsa, fonksiyonun yorum satırlarını tutarlı ve eksiksiz olarak kaldırması gerekir; aksi halde yorum içeren kod blokları yanlış pozitif/negatif sonuçlara yol açar.

---

> **Not:** Bu aksiyomlar yalnızca fonksiyon imzaları ve sabit bildirimlerinden türetilmiştir. Fonksiyon gövdelerinin içeriği bilinmediğinden, içsel algoritma varsayımları dahil edilmemiştir.

---

## FONKSİYON DETAYLARI

### stripComments

**Ne yapar**: TypeScript/JavaScript kaynak kodu içindeki blok ve satır yorumlarını kaldırarak temiz bir metin elde eder. Bu işlev, test senaryolarında açıklayıcı yorumlardaki örnek desenlerin bekçi (guard) mekanizmasını yanlış tetiklemesini önlemek için kullanılır.

**Nasıl yapar**: İki aşamalı regex dönüşümü uygular. Önce `/\*[\s\S]*?\*\//` kalıbı ile çok satırlı blok yorumlarını (`/* ... */`)贪婪 olmayan (non-greedy) eşleşme ile bulup kaldırır. Ardından `/(^|[^:])\/\/.*$/gm` kalıbı ile tek satır yorumlarını silerken, `[^:]` negatif karakter sınıfı sayesinde `http://` gibi protokol belirtecini ve benzeri URL yapılarını koruma altına alır.

**Parametreler**:
- `source` : `string` — Yorumları kaldırılacak ham kaynak kodu metni

**Dönüş**: `string` — Yorumlardan arındırılmış, temiz kaynak kodu metni

### toRelPath
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SOURCES** (call) — `import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default'...`
- **MANUAL_LANG_PREFIX** (regex) — `/\/\$\{\s*(?:lang|locale)\s*\}/`
- **HARDCODED_APP_PATH** (regex) — `/\b(?:href|to)\s*[:=]\s*\{?\s*['"`]\/(?:category|products|account|legal|brand...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/conformance/localized-route-ssot.test.ts`::stripComments
- **params**: `(source: string)`
- **ic_degiskenler**:
  - `source` — Fonksiyona giren ham kaynak kodu metni.
- **Dönüş**: `string` — Yorumlardan arındırılmış kaynak kodu.

### [N2_NASIL] AST Pointer: `__tests__/conformance/localized-route-ssot.test.ts`::toRelPath
- **params**: `(globKey: string)`
- **ic_degiskenler**:
  - `globKey` — Tam dosya yolu veya glob anahtarı.
  - `marker` — `'/src/'` literal'i; yolunreedaksiyonu için başlangıç noktasını belirtir.
  - `idx` — `globKey` içinde `marker`'ın ilk geçtiği indeks, bulunamazsa `-1`.
- **Dönüş**: `string` — `marker`'dan itibaren `/src/` önekli, ters eğik çizgileri (`\`) düz eğik çizgiye (`/`) dönüştürülmüş göreli yol.

### [N3_NASIL] AST Pointer: `__tests__/conformance/localized-route-ssot.test.ts`::() (ilk test bloğu)
- **params**: `(yok)`
- **ic_degiskenler**:
  - `manualPrefix` — Elle eklenen dil öneki bulunan dosya yollarını toplayan dizi.
  - `hardcodedPath` — Sabit app-yolu içeren dosya yollarını toplayan dizi.
  - `key` — Döngüdeki mevcut `SOURCES` sözlük anahtarı (tam dosya yolu).
  - `source` — Döngüdeki mevcut `SOURCES` sözlük değeri (kaynak kodu metni).
  - `rel` — `toRelPath(key)` ile hesaplanmış göreli yol.
  - `clean` — `stripComments(source)` ile yorumlar temizlenmiş kaynak kodu.
- **Dönüş**: `void` — Yan etki: `expect` ile test doğrulaması yapar; `manualPrefix` ve `hardcodedPath` dizilerini doldurarak hata mesajı üretir.

### [N4_NASIL] AST Pointer: `__tests__/conformance/localized-route-ssot.test.ts`::() (ikinci test bloğu)
- **params**: `(yok)`
- **ic_degiskenler**:
  - `manualPrefix` — Elle eklenen dil öneki bulunan dosya yollarını toplayan dizi.
  - `hardcodedPath` — Sabit app-yolu içeren dosya yollarını toplayan dizi.
  - `key` — Döngüdeki mevcut `SOURCES` sözlük anahtarı (tam dosya yolu).
  - `source` — Döngüdeki mevcut `SOURCES` sözlük değeri (kaynak kodu metni).
  - `rel` — `toRelPath(key)` ile hesaplanmış göreli yol.
  - `clean` — `stripComments(source)` ile yorumlar temizlenmiş kaynak kodu.
- **Dönüş**: `void` — Yan etki: `expect` ile test doğrulaması yapar; `manualPrefix` ve `hardcodedPath` dizilerini doldurarak hata mesajı üretir.

---

## NODE ID STANDARD

  file: src\__tests__\conformance\localized-route-ssot.test.ts
  function: src\__tests__\conformance\localized-route-ssot.test.ts::stripComments
  function: src\__tests__\conformance\localized-route-ssot.test.ts::toRelPath

---

## DISA AKTARILANLAR (EXPORTS)
  export: stripComments
  export: toRelPath