---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\bash-write-gate.test.ts
skeleton_hash: 7359e41ae238e3fe
entity_hashes:
  func:reddedilirMi: 205a545162391b8f
  overview: 9bec73bec791621e
generated_at: 2026-08-24T11:45:03Z
---

## Genel Bakış

Bu modül, bash yazma işlemlerine ilişkin uyumluluk kurallarını test eden bir test dosyasıdır. Modülün tek bir yardımcı fonksiyonu vardır ve belirli bir anahtarın yazma işlemi için reddedilip edilmediğini kontrol eder.

## Fonksiyon Grupları

### Yazma Erişim Kontrolü
Bash yazma kapısı (write gate) kapsamında hangi anahtarların reddedildiğini belirleyen mantığı test eder.
- reddedilirMi

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Verilen kaynak yalnızca fonksiyon imzasını (`reddedilirMi(k: string) -> boolean`) ve modül sabitlerini (`require_`, `MODUL`) içermektedir. Fonksiyon gövdesi sağlanmadığı için:

- `k` parametresinin hangi koşulları temsil ettiği bilinmiyor
- Hangi durumda `true` (reddedilir) hangi durumda `false` (reddedilmez) döndürüldüğü bilinmiyor
- `require_` ve `MODUL` sabitlerinin bu fonksiyonla nasıl etkileşime girdiği bilinmiyor

Aksiyom yazabilmek için fonksiyon gövdesindeki mantıksal koşulların (if/else dalları, eşik değerleri, karşılaştırmalar) görülmesi gerekmektedir.

---

## FONKSİYON DETAYLARI

### reddedilirMi
**Ne yapar**: Kapının fiilî kararını veren fonksiyondur. Verilen bir kabuk (shell) komutu içinde çözülemeyen yazma işlemi tespit edilirse REDDET (true), aksi halde hedefleri şerit kapısına geçirir (false) döndürür. Yol değişkeni veya ifade olarak verildiğinde statik çıkarım yapılamayacağı için doğru davranışın tahmin değil REDDİR olduğu belirtilmiştir.

**Nasıl yapar**: Parametre olarak aldığı komut dizgesini analiz ederek yazma işlemi içerip içermediğini denetler. Test beklentilerinden anlaşıldığı üzere, `node -e` ile çalışan `require('fs').writeFileSync(hedef, veri)` gibi Node.js tabanlı dosya yazma çağrılarını ve `python -c` ile çalışan `open(yol, 'w').write(x)` gibi Python tabanlı dosya yazma çağrılarını tespit ettiğinde true (reddet) kararı verir. Bu komutlarda dosya yolu bir değişken (hedef, yol) olarak belirtildiğinden statik çıkarım yapılamaz ve güvenlik gerekçesiyle reddetme yoluna gidilir.

**Parametreler**:
- k: string — Analiz edilecek kabuk (shell) komutunu içeren dizge. Bu komut içinde yazma işlemi olup olmadığı denetlenir.

**Dönüş**: boolean — Komut çözülemeyen yazma işlemi içeriyorsa true (reddet), içermiyorsa false (izin ver) döndürür.

---

## İTHALATLAR (IMPORTS)
- import: node:module::createRequire
- import: node:path::path
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## INTERFACES

### Cikti
- `yazmaVar: boolean`
- `hedefler: string[]`
- `cozulemeyen: string[]`
- `sebepler: string[]`

---

## SABİTLER
- **require_** (call) — `createRequire(import.meta.url)`
- **MODUL** (call) — `path.resolve(__dirname, '../../../.claude/hooks/bash-write-targets.cjs')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::describe_callback
- **params**: yok
- **ic_degiskenler**: yok (yalnızca `it` çağrıları içerir)
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_YANLIS_POZITIF_KOLU
- **params**: yok
- **ic_degiskenler**:
  - `masum` — masum okuma komutlarının string dizisi; her elemanı bir kabuk komutu
  - `k` — `for (const k of masum)` döngüsü değişkeni; her yinelemede bir masum komut stringi
  - `r` — `yazmaHedefleri(k)` çağrısının dönüş nesnesi; `r.cozulemeyen` ve `r.hedefler` alanlarına erişilir
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_AKIS_BIRLESTIRME_devnull
- **params**: yok
- **ic_degiskenler**: yok (yalnızca `expect` çağrıları içerir)
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_YONLENDIRME_HEDEF
- **params**: yok
- **ic_degiskenler**: yok (yalnızca `expect` çağrıları içerir)
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_sed_tee_cp_mv_dd_truncate_rm
- **params**: yok
- **ic_degiskenler**: yok (yalnızca `expect` çağrıları içerir)
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_git_checkout_restore
- **params**: yok
- **ic_degiskenler**: yok (yalnızca `expect` çağrıları içerir)
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_KOMPOZIT_KOMUTTA_HEDEF
- **params**: yok
- **ic_degiskenler**:
  - `r` — `yazmaHedefleri("cd C:/repo && sed -i 's/a/b/' src/lib/rbac.ts && echo bitti")` çağrısının dönüş nesnesi; `r.hedefler` alanına erişilir
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_FAIL_CLOSED_yorumlayici
- **params**: yok
- **ic_degiskenler**: yok (yalnızca `expect` ve `reddedilirMi` çağrıları içerir)
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_FAIL_CLOSED_heredoc
- **params**: yok
- **ic_degiskenler**:
  - `komut` — `['node <<JS', "require('fs').writeFileSync(p, s)", 'JS'].join('\n')` ile oluşturulan heredoc kabuk komutu stringi
- **Dönüş**: yok

### [N10_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_HEREDOC_BOLUNMEZ
- **params**: yok
- **ic_degiskenler**:
  - `komut` — `['cat <<TXT > notlar.md', 'a; b | c', 'TXT'].join('\n')` ile oluşturulan heredoc kabuk komutu stringi
- **Dönüş**: yok

### [N11_NASIL] AST Pointer: src/__tests__/conformance/bash-write-gate.test.ts::it_KAPI_AYIRT_EDICI
- **params**: yok
- **ic_degiskenler**:
  - `yol` — `'src/lib/rbac.ts'` string sabiti; hem okuma hem yazma testlerinde kullanılan dosya yolu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\__tests__\conformance\bash-write-gate.test.ts
  function: src\__tests__\conformance\bash-write-gate.test.ts::reddedilirMi

---

## DISA AKTARILANLAR (EXPORTS)
  export: reddedilirMi