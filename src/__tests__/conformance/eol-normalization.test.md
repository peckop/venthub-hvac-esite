---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\eol-normalization.test.ts
skeleton_hash: ce23cf2fa7f2ffa0
entity_hashes:
  func:eolKayitlari: 9debdcf9edf7d97e
  overview: 1db1afc4106b6aab
generated_at: 2026-08-17T10:57:57Z
---

## Genel Bakış
Bu modül, bir TypeScript projesinin satır sonu (EOL) normalizasyonu davranışını test etmek için kullanılan bir test yardimci (test fixture) modülüdür. Amacı, testlerde tutarlı ve kontrol edilebilir bir dizi test verisi (satır sonu kayıtları) oluşturmaktır.

## Fonksiyon Grupları
### Test Verisi Oluşturma (Test Fixture)
Bu grup, test senaryolarında kullanılacak ham verileri üretmekten sorumludur. Fonksiyon, farklı satır sonu karakterleri (LF, CRLF, CR) içeren veya içermeyen örnek satırları barındıran bir dizi nesne döndürür; böylece normalizasyon mantığının çeşitli girdiler üzerinde doğru çalıştığı doğrulanabilir.
- eolKayitlari

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Verilen fonksiyon imzası (`eolKayitlari() -> EolKaydi[]`) yalnızca parametresiz bir fonksiyonun array döndürdüğünü göstermektedir. Fonksiyon gövdesi, parametreler, sabitler veya return edilen `EolKaydi` yapısı hakkında detaylı bilgi bulunmadığı için mimari varsayım türetilememektedir.

---

## FONKSİYON DETAYLARI

### eolKayitlari
**Ne yapar**: Bu fonksiyon, Git deposundaki tüm izlenen dosyaların son satır sonu (EOL) normalization bilgilerini getirir. Her dosya için indeks ve çalışma ağacı (worktree) düzeyindeki EOL ayarlarını (örn: lf, crlf) ve dosya yolunu içeren bir kayıt listesi oluşturur.

**Nasıl yapar**: Fonksiyon, `execFileSync` kullanarak `git ls-files --eol` komutunu çalıştırır ve çıktıyı `utf8` ile kodlanmış bir string olarak alır. Bu çıktıyı satırlara böler ve her satırı işler. Boş satırlar atlanır. Her satır, tab karakteri (`\t`) ile ikiye ayrılır: Sol taraftaki EOL bilgisi ve sağ taraftaki dosya yolu. Sol taraf, boşluklarla ayrılmış parçalara bölünerek `i/` ile başlayan indeks bilgisi ve `w/` ile başlayan çalışma ağacı bilgisi aranır. Bu bilgiler ve dosya yolu, bir `EolKaydi` nesnesine dönüştürülerek bir diziye eklenir.

**Parametreler**: Bu fonksiyon parametre almaz.

**Dönüş**: `EolKaydi[]` tipinde bir dizi döner. Her bir `EolKaydi` nesnesi, `index` (string, dosyanın indeks durumu, örn: "i/lf"), `worktree` (string, çalışma ağacındaki durum, örn: "w/crlf") ve `yol` (string, dosyanın göreli yolu) alanlarını içerir.

---

## İTHALATLAR (IMPORTS)
- import: node:child_process::execFileSync
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## INTERFACES

### EolKaydi
- `index: string`
- `worktree: string`
- `yol: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\eol-normalization.test.ts::eolKayitlari
- **params**: ()
- **ic_degiskenler**:
  - `ham` — `git ls-files --eol` komutunun utf8 encoding ile çalıştırılıp elde edilen ham çıktısı
  - `kayitlar` — `EolKaydi[]` türünde, döndürülecek olan kayıt dizisi
  - `satir` — `ham.split('\n')` ile elde edilen her bir satır
  - `solTaraf` — `satır.split('\t')[0]` ifadesinden gelen tab işareti öncesi kısım (i/w alanlarını içerir)
  - `yol` — `satır.split('\t')[1]` ifadesinden gelen tab işareti sonrası dosya yolu
  - `parcalar` — `solTaraf.trim().split(/\s+/)` ile oluşturulmuş, boşluklara göre ayrıştırılmış kelime dizisi
  - `index` — `parcalar.find(p => p.startsWith('i/'))` ile bulunan index EOL değeri (örn: 'i/lf', 'i/crlf')
  - `worktree` — `parcalar.find(p => p.startsWith('w/'))` ile bulunan worktree EOL değeri (örn: 'w/crlf', 'w/-text')
- **Dönüş**: `EolKaydi[]` — `{ index, worktree, yol }` nesnelerinden oluşan dizi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\eol-normalization.test.ts::test_body_1 (it callback)
- **params**: ()
- **ic_degiskenler**:
  - `kayitlar` — `eolKayitlari()` fonksiyonundan dönen `EolKaydi[]` dizisi
  - `kirli` — `kayitlar` dizisi üzerinde zincirleme `.filter().filter().filter().map()` ile oluşturulmuş, index'i CRLF olan ve worktree'si binary olmayan ve muaf listede olmayan dosya yollarının (`k.yol`) dizisi
- **Dönüş**: yok (test fonksiyonu, doğrudan `expect` ile doğrulama yapar)

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\eol-normalization.test.ts::test_body_2 (it callback)
- **params**: ()
- **ic_degiskenler**:
  - `betikler` — `eolKayitlari().filter()` ile oluşturulan, `.ps1`, `.bat` veya `.cmd` uzantılı ve muaf listede olmayan dosyalardan oluşan `EolKaydi[]` dizisi
  - `yanlisEol` — `betikler.filter(k => k.worktree === 'w/lf').map(k => k.yol)` ile oluşturulmuş, çalışma kopyasında LF olan Windows betiklerinin dosya yollarının dizisi
- **Dönüş**: yok (test fonksiyonu, doğrudan `expect` ile doğrulama yapar)

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\eol-normalization.test.ts::test_body_3 (it callback)
- **params**: ()
- **ic_degiskenler**:
  - `kayitlar` — `eolKayitlari()` fonksiyonundan dönen `EolKaydi[]` dizisi
- **Dönüş**: yok (test fonksiyonu, doğrudan `expect` ile doğrulama yapar)

---

## NODE ID STANDARD

  file: src\__tests__\conformance\eol-normalization.test.ts
  function: src\__tests__\conformance\eol-normalization.test.ts::eolKayitlari

---

## DISA AKTARILANLAR (EXPORTS)
  export: eolKayitlari