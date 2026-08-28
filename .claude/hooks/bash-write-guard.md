---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-851\.claude\hooks\bash-write-guard.cjs
skeleton_hash: 10670a173c1db9ec
entity_hashes:
  func:depoIcindeMi: cdd89d9feee7f817
  func:stdinOku: 387e432c5dd5e85f
  overview: 6a1bbf0938fd5afd
generated_at: 2026-08-27T17:53:02Z
---

## Genel Bakış

Bu modül, Claude hook mekanizması kapsamında çalışan bir yazma koruma (write guard) bileşenidir. Bash komutlarıyla gerçekleştirilen dosya yazma hedeflerinin, çalışılan depo sınırları içinde kalıp kalmadığını denetler. Depo dışına yazma girişimlerini tespit ederek bu işlemleri engellemeyi amaçlar.

## Fonksiyon Grupları

### Girdi Okuma ve Konum Doğrulama

Bu iki fonksiyon birlikte çalışarak hook'a iletilen yazma hedefinin güvenli olup olmadığını belirler. `stdinOku` fonksiyonu standart girdiden hedef yol bilgisini okur; ardından `depoIcindeMi` fonksiyonu bu hedefin geçerli depo dizini içinde yer alıp almadığını kontrol eder.

- `stdinOku`, `depoIcindeMi`

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### stdinOku
**Ne yapar**: Standart girdi (stdin) akışından UTF-8 biçiminde veri okur. Okuma başarısız olursa boş bir karakter dizesi döndürür; programın çökmesini engelleyen bir güvenlik ağı işlevi görür.

**Nasıl yapar**: Node.js'in `fs` modülündeki `readFileSync` fonksiyonunu dosya tanımlayıcısı `0` (stdin) ile çağırır ve kodlama olarak `'utf8'` belirtir. `try` bloğu içinde çalıştırılan bu çağrı, herhangi bir hata fırlatırsa `catch` bloğu devreye girer ve boş karakter dizesi (`''`) döndürülür. Bu sayede stdin mevcut değilse ya da okunamaz durumdaysa bile fonksiyon güvenli bir şekilde sonlanır.

**Parametreler**:
- Bu fonksiyon parametre almaz.

**Dönüş**: Fonksiyon, başarılı okuma durumunda stdin'den okunan UTF-8 biçimli karakter dizesini; hata durumunda boş karakter dizesi (`''`) döndürür. Kaynak kodda açık bir dönüş tipi bildirimi bulunmamaktadır.

### depoIcindeMi
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## SABİTLER
- **fs** (call) — `require('fs')`
- **path** (call) — `require('path')`
- **komut** (binary_expression) — `(girdi.tool_input && girdi.tool_input.command) || ''`
- **sid** (binary_expression) — `girdi.session_id || ''`
- **cikarici** (unknown)
- **sonuc** (call) — `cikarici.yazmaHedefleri(komut)`
- **kok** (call) — `path.resolve(girdi.cwd || process.cwd())`
- **depoHedefleri** (call) — `sonuc.hedefler.map(depoIcindeMi).filter(Boolean)`
- **KORUNAN** (new_expression) — `new Set(['eslint.config.cjs', '.lintstagedrc.json'])`
- **pano** (unknown)

---

## AST POINTERS

### [N1_NASIL] AST Pointer: bash-write-guard.cjs::stdinOku
- **params**: (parametre yok)
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: string — `fs.readFileSync(0, 'utf8')` ile stdin'den okunan UTF-8 metin; okuma başarısız olursa boş string (`''`)

### [N2_NASIL] AST Pointer: bash-write-guard.cjs::depoIcindeMi
- **params**: `hedef` — kontrol edilecek dosya/dizin yolu (göreceli veya mutlak)
- **ic_degiskenler**:
  - `mutlak` — `hedef` mutlak yol ise `path.resolve(hedef)`, değilse `path.resolve(kok, hedef)` ile hesaplanan tam mutlak yol
  - `bagil` — `path.relative(kok, mutlak)` ile hesaplanan, `kok` dizinine göreli yol
- **Dönüş**: string veya null — `bagil` boş değilse, `..` ile başlamıyorsa ve mutlak yol değilse `mutlak` değerini döndürür; aksi halde `null`

---

## NODE ID STANDARD

  file: .claude\hooks\bash-write-guard.cjs
  function: .claude\hooks\bash-write-guard.cjs::stdinOku
  function: .claude\hooks\bash-write-guard.cjs::depoIcindeMi

---

## DISA AKTARILANLAR (EXPORTS)
  export: depoIcindeMi
  export: stdinOku