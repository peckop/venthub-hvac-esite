---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\__tests__\conformance\auth-session-security.test.ts
skeleton_hash: 867aff26355206b8
entity_hashes:
  func:source: d72269fa90043467
  func:stripComments: 6954b16483553ae0
  overview: b18e1c2b26680d6b
generated_at: 2026-08-16T11:17:38Z
---

## Genel Bakış

Bu modül, Kimlik Doğrulama Oturumu Güvenliği konusunda uyumluluk (conformance) testleri içeren bir test dosyasıdır. Projenin güvenlik standartlarına uygunluğunu doğrulamak için kaynak kod analizleri yapar.

## Fonksiyon Grupları

### Kaynak Kod Yardımcı Fonksiyonlar
Testlerin çalıştırılabilmesi için gerekli olan kaynak kod okuma ve işleme yardımcı fonksiyonlarını barındırır.
- `stripComments` – Kaynak kod metnindeki yorum satırlarını kaldırarak temiz bir analiz povasatı sağlar
- `source` – Belirtilen dosya yolundan kaynak kod içeriğini okuyarak testlerin erişimine sunar

---

**Not:** Bu modül bir test dosyası olduğundan üretim (production) kodunda yer almaz. Amacı, projenin oturum yönetimi ve kimlik doğrulama mekanizmalarının güvenlik gerekliliklerine uygunluğunu doğrulamaktır. `stripComments` ve `source` fonksiyonları, test senaryoları içinde kaynak kod analizi yapmak için kullanılan iç yardımcı araçlardır; harici bağımlılıkları bulunmamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimal aksiyom tanımlanmıştır; fonksiyon imzalarında belirtilenparametre türleri ve dönüş tipleri esas alınmıştır.

**[Aksiyom 1 - stripComments geçerlilik girişi]:** Eğer `src` parametresi geçerli bir `string` değilse (null, undefined veya non-string türde ise), fonksiyonun çalışma davranışı tanımsızdır.

**[Aksiyom 2 - source geçerlilik girişi]:** Eğer `path` parametresi geçerli bir `string` ise, `source` fonksiyonu bir `string` döndürmelidir; dönüşün boş string (`""`) olması durumu bilinmemektedir (dosya içeriğine bağlı).

**[Aksiyom 3 - kaynak erişilebilirliği]:** Eğer `source(path)` fonksiyonu çağrılıyorsa, verilen `path` değerinin erişilebilir bir dosyayı (veya kaynağı) işaret etmesi gerekir; aksi halde davranış bilinmiyordur (hata fırlatma, boş string dönme veya other).

**[Aksiyom 4 - SOURCES ve STANDARDS çağrılabilirlik]:** Eğer `SOURCES` veya `STANDARDS` sabitleri kullanılıyorsa, bu çağrıların invoker olarak kullanılabilecek (`call` ile çağrılabilir) nesneler olması gerekir; değilse `TypeError` oluşur.

---

**Not:** Bu modül, bir test yardımcı/utility modülü olup fonksiyon imzaları son derece basittir. Fonksiyon gövdeleri verilmediği için, yorum/içerik çıkarma mantığı, eşik değerleri veya kabul kriterleri hakkında aksiyom türetilmemiştir.

---

## FONKSİYON DETAYLARI

### stripComments
**Ne yapar**: Verilen kaynak kod dizesindeki tek satırlık (`//`) ve çok satırlık (`/* ... */`) yorumları kaldırarak temiz bir kod dizesi döndürür.
**Nasıl yapar**: İki aşamalı bir regex (düzenli ifade) operasyonu uygular. Önce `/* ... */` ile belirlenen çok satırlık yorumları, ardından `//` ile başlayan tek satırlık yorumları eşleme ve kaldırma işlemi yapar. Özellikle CRLF satır sonu ('\r\n') karakterleriyle çalışan sistemlerde, noktanın ('\r') karakteriyle eşleşmeyen standart davranışını aşacak şekilde, `[^\n]` kullanarak satır sonunu doğru algılar.
**Parametreler**:
- src: string — Temizlenecek yorumları içeren kaynak kod dizesi.
**Dönüş**: string — Yorumları kaldırılmış, sadece çalışan kodun bulunduğu dize.

### source
**Ne yapar**: Belirtilen dosya yoluna karşılık gelen kaynak kodu, önceden tanımlı bir sözlükten (`SOURCES`) getirir ve içindeki yorumları temizleyerek döndürür.
**Nasıl yapar**: Fonksiyon, `SOURCES` adlı bir harita/nesneden (dışarıdan erişilebilir bir sabit veya modül düzeyinde değişken varsayılmaktadır) verilen `path` anahtarına karşılık gelen kaynak kod dizesini arar. Eğer bu yol sözlükte tanımlı değilse, bir `Error` fırlatır ve test dosyasının güncellenmesi gerektiğini belirten bir hata mesajı verir. Bulunan kaynak kodu doğrudan `stripComments` fonksiyonuna iletilerek yorumlardan arındırılmış hali döndürülür.
**Parametreler**:
- path: string — `SOURCES` sözlüğünde aranacak kaynak kodun dosya yolu veya tanımlayıcı anahtarı.
**Dönüş**: string — Yorumları temizlenmiş, belirtilen yola ait kaynak kod dizesi.

---

## İTHALATLAR (IMPORTS)
- import: vitest::describe
- import: vitest::expect
- import: vitest::it

---

## SABİTLER
- **SOURCES** (call) — `import.meta.glob(
  '/src/{contexts,utils,app}/**/*.{ts,tsx}',
  { query: '...`
- **STANDARDS** (call) — `import.meta.glob(
  '/docs/standards/auth-account-standard.md',
  { query: ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `auth-session-security.test.ts`::stripComments
- **params**: `src: string` — işlenecek ham kaynak kod metni
- **ic_degiskenler**: (dahili değişken yok — zincirleme `.replace()` doğrudan `src` üzerinde çalışır)
  - `src` — input olarak giren kaynak kod stringi; önce `/* ... */` çok satırlı yorumları, sonra `// ...` tek satırlı yorumları temizlemek için kullanılır
- **Dönüş**: `string` — yorumları kaldırılmış saf kaynak kod metni; regex ile iki aşamalı temizlik uygulanır (çok satırlı yorumlar → tek satırlı yorumlar)

---

### [N2_NASIL] AST Pointer: `auth-session-security.test.ts`::source
- **params**: `path: string` — okunmak istenen kaynak dosyanın proje içi yolu (ör. `/src/contexts/AuthContext.tsx`)
- **ic_degiskenler**:
  - `src` — `SOURCES[path]` sözlük erişiminden elde edilen ham kaynak kod metni; `undefined` ise hata fırlatılır, değilse `stripComments()` ile yorumları temizlenerek döndürülür
- **Dönüş**: `string` — yorumları strip edilmiş kaynak kod; `SOURCES` sözlüğünden `path` anahtarıyla erişilen değer `undefined` ise `throw new Error(...)` ile异常 fırlatılır, aksi halde `stripComments(src)` çağrısının dönüşüdür

---

### [N3_NASIL] AST Pointer: `auth-session-security.test.ts`::describe_callback (R1: AuthContext.signOut POST çağrısı)
- **params**: (yok — anonim arrow function)
- **ic_degiskenler**:
  - `src` — `source('/src/contexts/AuthContext.tsx')` çağrısından dönen yorumları temizlenmiş kaynak kod; `AuthContext.tsx` dosyasının içeriğini temsil eder
- **Dönüş**: yok — `expect(src).toMatch(...)` ile `fetch('/auth/signout', { method: 'POST'`) kalıbı doğrulanır

---

### [N4_NASIL] AST Pointer: `auth-session-security.test.ts`::describe_callback (R2: clearClaimsCacheCookie çağrısı)
- **params**: (yok — anonim arrow function)
- **ic_degiskenler**:
  - `src` — `source('/src/app/auth/signout/route.ts')` çağrısından dönen yorumları temizlenmiş kaynak kod; signout route'unun içeriğini temsil eder
- **Dönüş**: yok — `expect(src).toMatch(...)` ile `clearClaimsCacheCookie(` çağrısının varlığı doğrulanır

---

### [N5_NASIL] AST Pointer: `auth-session-security.test.ts`::describe_callback (R3: claims cache httpOnly ve TTL)
- **params**: (yok — anonim arrow function)
- **ic_degiskenler**:
  - `src` — `source('/src/utils/router.ts')` çağrısından dönen yorumları temizlenmiş kaynak kod; router util dosyasının içeriğini temsil eder
  - `setterStart` — `src.indexOf('function setClaimsCacheCookie')` ifadesiyle bulunan, `setClaimsCacheCookie` fonksiyon tanımının `src` içindeki başlangıç indeksi; fonksiyonun varlığını ve konumunu belirlemek için kullanılır
  - `setterBody` — `src.slice(setterStart, src.indexOf('}', src.indexOf('cookies.set', setterStart)))` ifadesiyle elde edilen alt string; `setClaimsCacheCookie` fonksiyonunun `cookies.set` çağrısına kadar olan gövdesini kapsar; `httpOnly: true` doğrulaması bu parça üzerinde yapılır
  - `ttlMatch` — `src.match(/maxAgeSeconds:\s*number\s*=\s*(\d+)/)` ifadesiyle elde edilen regex eşleşme sonucu (veya `null`); `maxAgeSeconds` parametresinin varsayılan sayısal değerini grupta `[1]` olarak taşır
- **Dönüş**: yok — üç `expect` doğrulaması yürütülür: (`setSetterStart > -1`), (`setterBody` içinde `httpOnly: true`), ve (`Number(ttlMatch![1]) <= 900`)

---

### [N6_NASIL] AST Pointer: `auth-session-security.test.ts`::describe_callback (R4: Rate-limit ve CAPTCHA standardı)
- **params**: (yok — anonim arrow function)
- **ic_degiskenler**:
  - `cetvel` — `Object.values(STANDARDS)[0] ?? ''` ifadesiyle elde edilen ilk standard metni (veya boş string); `STANDARDS` sözlüğünün ilk değerini alır, `undefined/null` ise boş string'e fallback eder; auth-account-standard.md içeriğini temsil eder
- **Dönüş**: yok — üç `expect` doğrulaması yürütülür: (`cetvel` truthy), (`cetvel` içinde `'Rate limit'` ve `'CAPTCHA'` dizesi bulunması), ve (`cetvel` üzerinde `middleware.*geçmez` veya `geçmez.*middleware` regex eşleşmesi)

---

## NODE ID STANDARD

  file: src\__tests__\conformance\auth-session-security.test.ts
  function: src\__tests__\conformance\auth-session-security.test.ts::stripComments
  function: src\__tests__\conformance\auth-session-security.test.ts::source

---

## DISA AKTARILANLAR (EXPORTS)
  export: source
  export: stripComments