---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\__tests__\conformance\lang-metadata-locale.test.ts
skeleton_hash: 656175ce4e41682d
entity_hashes:
  func:sayfalariBul: 64ee0d32245b2100
  overview: cce1db67a0f81e92
generated_at: 2026-08-24T11:46:01Z
---

## Genel Bakış
Bu modül, dil metadata ve locale yapılandırmasına ilişkin uyumluluk (conformance) testlerini içerir. Proje genelindeki sayfa dosyalarını bularak dil ve locale ayak izlerinin doğru olup olmadığını denetler. Test kapsamındaki tek yardımcı fonksiyon, verilen kök dizin altındaki sayfa dosyalarını listelemekle sorumludur.

## Fonksiyon Grupları

### Sayfa Keşfi
Test senaryolarının çalışabilmesi için proje dizin ağacından sayfa dosyalarının yol listesini üretir. Kök dizin parametresi olarak alır ve bulduğu dosya yollarını dizi olarak döndürür.
- sayfalariBul

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan çıkarılabilecek varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `sayfalariBul` fonksiyonuna geçerli bir `kok` parametresi verilmezse, fonksiyonun davranışı bilinmiyor (gövde mevcut değil).

[Aksiyom 2]: Eğer `LANG_KOK` sabiti tanımlı değilse, bu sabiti kullanan çağrılar hata verir.

---

**Not:** Fonksiyon gövdesi sağlanmadığı için, `sayfalariBol` fonksiyonunun hangi koşullarda çalıştığı, hangi hata durumlarını ürettiği veya hangi bağımlılıklara ihtiyaç duyduğu belirlenememektedir. Daha kesin aksiyomlar için fonksiyon gövdesi gereklidir.

---

## FONKSİYON DETAYLARI

### sayfalariBul
**Ne yapar**: Verilen kök dizin altında bulunan tüm `page.tsx` dosyalarının tam dosya yollarını bir dizi olarak döndürür. Docstring'e göre bu fonksiyon `[lang]` altındaki sayfa yollarını keşfetmek için kullanılır ve glob deseni yerine gerçek dizin yürüyüşü (directory traversal) yöntemini tercih eder.

**Nasıl yapar**: Fonksiyon, `fs.readdirSync` ile senkron biçimde dizin içeriğini okuyan özyinelemeli (recursive) bir `yuru` yardımcısı tanımlar. Her dizin girdisi için: eğer girdi bir dizinse kendini çağırarak alt dallara iner; eğer dosya adı tam olarak `page.tsx` ise o dosyanın tam yolunu `bulunan` dizisine ekler. `path.join` kullanılarak platforma uygun tam yollar oluşturulur. `withFileTypes: true` seçeneği sayesinde girdilerin dizin mi dosya mı olduğu doğrudan `Dirent` nesnesi üzerinden `isDirectory()` ile sorgulanır, böylece ek bir `stat` çağrısına gerek kalmaz. Yürüyüş tamamlandığında biriktirilen tüm yollar döndürülür.

**Parametreler**:
- `kok`: `string` — Taramaya başlanacak kök dizinin tam yolu. Bu dizin altındaki tüm alt dizinler özyinelemeli olarak taranır.

**Dönüş**: `string[]` — Bulunan tüm `page.tsx` dosyalarının tam dosya yollarını içeren bir dizi. Kök dizinde veya alt dizinlerinde hiç `page.tsx` yoksa boş dizi döner.

---

## İTHALATLAR (IMPORTS)
- import: ../../app/[lang]/layout::generateMetadata
- import: ../../i18n/dictionaries/en::en
- import: ../../i18n/dictionaries/tr::tr
- import: node:fs::fs
- import: node:path::path
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **LANG_KOK** (call) — `path.resolve(__dirname, '../../app/[lang]')`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::sayfalariBul
- **params**: `kok: string` — taramaya başlanacak kök dizin yolu
- **ic_degiskenler**:
  - `bulunan` — `string[]` tipinde, bulunan `page.tsx` dosyalarının tam yollarını toplar
  - `yuru` — `(dizin: string) => void` tipinde iç fonksiyon; `fs.readdirSync` ile dizin girdilerini okur, alt dizinlerde özyinelemeli yürür, `page.tsx` dosyalarını `bulunan` dizisine ekler
  - `giris` — `fs.readdirSync` çağrısından dönen `Dirent` nesnesi; `giris.isDirectory()` ile dizin olup olmadığı, `giris.name` ile dosya adı kontrol edilir
  - `tam` — `path.join(dizin, giris.name)` ile oluşturulan tam dosya yolu
- **Dönüş**: `string[]` — bulunan tüm `page.tsx` dosyalarının tam yolları

### [N2_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::yuru (sayfalariBul içindeki iç fonksiyon)
- **params**: `dizin: string` — yürümeye başlanacak dizin yolu
- **ic_degiskenler**:
  - `giris` — `fs.readdirSync(dizin, { withFileTypes: true })` ile okunan dizin girdisi (Dirent nesnesi)
  - `tam` — `path.join(dizin, giris.name)` ile oluşturulan tam dosya yolu; alt dizinse özyinelemeye, `page.tsx` ise `bulunan` dizisine eklenir
- **Dönüş**: `void` — yan etki olarak dış kapsamındaki `bulunan` dizisini değiştirir

### [N3_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::describe callback (ana test grubu)
- **params**: yok (anonim arrow function)
- **ic_degiskenler**: yok (yalnızca `it` çağrıları içerir)
- **Dönüş**: `void`

### [N4_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::it callback — generateMetadata tanımlı mı
- **params**: yok (anonim arrow function)
- **ic_degiskenler**: yok
- **Dönüş**: `void` — `expect(typeof generateMetadata).toBe('function')` ile generateMetadata'nın fonksiyon olduğunu doğrular

### [N5_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::it callback — OG yereli dile göre değişir
- **params**: yok (anonim async arrow function)
- **ic_degiskenler**:
  - `enMeta` — `await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })` ile üretilen İngilizce metadata nesnesi
  - `trMeta` — `await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })` ile üretilen Türkçe metadata nesnesi
- **Dönüş**: `void` — `enMeta.openGraph?.locale` değerinin `'en_US'`, `trMeta.openGraph?.locale` değerinin `'tr_TR'` olduğunu doğrular

### [N6_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::it callback — dönen başlık/açıklama sözlükteki anahtara eşit
- **params**: yok (anonim async arrow function)
- **ic_degiskenler**:
  - `enMeta` — `await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })` ile üretilen İngilizce metadata nesnesi
  - `trMeta` — `await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })` ile üretilen Türkçe metadata nesnesi
- **Dönüş**: `void` — `enMeta.title` değerinin `en.meta.siteTitle`'a, `enMeta.description` değerinin `en.meta.siteDesc`'e, `trMeta.title` değerinin `tr.meta.siteTitle`'a, `trMeta.description` değerinin `tr.meta.siteDesc`'e eşit olduğunu doğrular

### [N7_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::it callback — iki dil farklı üretir
- **params**: yok (anonim async arrow function)
- **ic_degiskenler**:
  - `enMeta` — `await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })` ile üretilen İngilizce metadata nesnesi
  - `trMeta` — `await generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })` ile üretilen Türkçe metadata nesnesi
- **Dönüş**: `void` — `enMeta.title` ile `trMeta.title`'ın, `enMeta.description` ile `trMeta.description`'ın farklı olduğunu doğrular

### [N8_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::it callback — kök varsayılana düşmüyor
- **params**: yok (anonim async arrow function)
- **ic_degiskenler**:
  - `lang` — `['en', 'tr']` dizisi üzerinde dönen döngü değişkeni
  - `meta` — `await generateMetadata({ params: Promise.resolve({ lang }) })` ile üretilen metadata nesnesi
- **Dönüş**: `void` — her dil için `meta.title` ve `meta.description`'ın boş olmadığını, `meta.openGraph?.title`'ın truthy olduğunu doğrular

### [N9_NASIL] AST Pointer: src/__tests__/conformance/lang-metadata-locale.test.ts::it callback — kapsam kanaryası
- **params**: yok (anonim arrow function)
- **ic_degiskenler**:
  - `sayfalar` — `sayfalariBul(LANG_KOK)` çağrısından dönen `string[]`; `[lang]` altında bulunan tüm `page.tsx` dosyalarının tam yolları
  - `kendiMetadatasi` — `sayfalar.filter(y => fs.readFileSync(y, 'utf8').includes('generateMetadata'))` ile filtrelenmiş dizi; kendi `generateMetadata`'sını tanımlayan sayfalar
  - `mirasAlan` — `sayfalar.length - kendiMetadatasi.length` ile hesaplanan sayı; kendi metadata'sını tanımlamayıp kök layout'un varsayılanını miras alan sayfa sayısı
  - `y` — `filter` callback'indeki döngü değişkeni; her bir sayfa dosyasının tam yolu
- **Dönüş**: `void` — `sayfalar.length`'in 20'den büyük olduğunu, `mirasAlan`'ın 0'dan büyük olduğunu doğrular

---

## NODE ID STANDARD

  file: src\__tests__\conformance\lang-metadata-locale.test.ts
  function: src\__tests__\conformance\lang-metadata-locale.test.ts::sayfalariBul

---

## DISA AKTARILANLAR (EXPORTS)
  export: sayfalariBul