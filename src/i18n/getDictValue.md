---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\i18n\getDictValue.ts
skeleton_hash: fb78e2266fb5a28f
entity_hashes:
  func:getDictValue: 93fb357a5c54bf54
  overview: 3ad66d5b97f51555
generated_at: 2026-08-27T06:51:14Z
---

## Genel Bakış
Bu modül, i18n (uluslararasılaştırma) süreçlerinde kullanılan sözlük nesnelerinden değerleri almak için temel bir yardımcı fonksiyon sunar. Fonksiyon, noktalı yollarla belirtilen iç içe geçmiş alanlara güvenli bir şekilde erişerek kodun daha temiz ve okunabilir olmasını sağlar.

## Fonksiyon Grupları
### Sözlük Değeri Erişimi
Bu grup, bir sözlük nesnesi içinde hiyerarşik yollarla değerleri güvenli bir şekilde almak için gerekli yardımcı fonksiyonu içerir.
- `getDictValue`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, iç içe geçmiş nesne yapılarından nokta notasyonuyla (dot notation) değer çıkarmak için kullanılır.

[Aksiyom 1]: Eğer `obj` parametresi null veya undefined ise ve fonksiyon bunu ele almıyorsa, TypeError fırlatma veya beklenmeyen davranış oluşur.

[Aksiyom 2]: Eğer `path` parametresi boş string (`""`) ise, fonksiyonun dönüş davranışı tanımsızdır (bu durum için özel eleme gerekir).

[Aksiyom 3]: Eğer `path` parametresi `obj` yapısında var olmayan bir yolu referans alıyorsa, fonksiyon hata fırlatmalı veya fallback değer döndürmelidir — aksi halde `undefined` dönüşü, `string` return contrato uymaz.

[Aksiyom 4]: Eğer `path` parametresi beklenen formatın (ör. nokta notasyonu) dışında bir formattaysa (ör. array index notasyonu `[0]`), fonksiyon yolu doğru ayrıştıramaz ve istenilen değere ulaşamaz.

[Aksiyom 5]: Eğer `obj` yapısının intermediate (ara) seviyelerinden biri `null` veya `undefined` ise ve yolu takip ederken erişilmeye çalışılıyorsa, TypeError fırlatma oluşur (null property access).

[Aksiyom 6]: Eğer `path` ile erişilen değer bir `string` değilse (ör. number, boolean, object), fonksiyonun dönüş davranışı tanımsızdır — `string` dönüş contract'ı ihlal edilir.

[Aksiyom 7]: Fonksiyonun `string` dönüş garantisi verdiği varsayıldığında, tüm olası yol ve değer durumları için fallback mekanizması tanımlı olmalıdır — aksi halde `undefined` veya `null` dönüşü contract ihlali oluşturur.

---

## FONKSİYON DETAYLARI

### getDictValue
**Ne yapar**: Sözlük yapısındaki bir obje üzerinde nokta-yolu (dot-path) ile güvenli bir şekilde değer çözümlemesi yapar. İstenen anahtar bulunamazsa, verilen `path` değerinin kendisini döndürür. Bu davranış, i18n (uluslararasılaştırma) bağlamlarında "ham anahtar" (raw key) semantiği sağlar; çağıran taraf, dönen değerin `path` ile aynı olup olmadığını kontrol ederek çözümlemenin başarısız olduğunu anlayabilir. Saf (pure) bir fonksiyondur ve `'use client'` direktifi içermez; bu sayede hem Server Component'larda hem de Client Component'larda kullanılabilir.

**Nasıl yapar**: Fonksiyon, verilen `path` string'ini nokta (`.`) karakterinden parçalara ayırarak bir anahtar dizisi oluşturur. Ardından bu anahtarları sırayla takip ederek obje üzerinde gezinir. Her adımda, mevcut değerin bir obje olup olmadığı ve istenen anahtarı içerip içermediği kontrol edilir. Eğer bir adımda anahtar bulunamazsa, döngüden çıkılarak orijinal `path` değeri geri döndürülür. Tüm anahtarlar başarıyla çözümlendiyse, elde edilen son değer kontrol edilir: eğer `string` türündeyse doğrudan, `number` veya `boolean` türündeyse `String()` ile string'e dönüştürülerek döndürülür. Diğer tüm durumlarda (örneğin değer bir obje veya `undefined` ise) yine `path` döndürülür. Tüm işlem bir `try-catch` bloğu içinde sarılıdır; herhangi bir istisna oluşursa güvenli bir şekilde `path` döndürülür.

**Parametreler**:
- `obj`: `unknown` — Nokta-yolu ile değer aranacak sözlük yapısındaki kaynak obje. Türü `unknown` olarak belirtilmiştir; fonksiyon çalışma zamanında objenin yapısını kontrol ederek güvenli erişim sağlar.
- `path`: `string` — Nokta ile ayrılmış anahtar yolu (ör. `"common.categoryList.ac"`). Her nokta, bir iç içe geçmiş obje seviyesini temsil eder.

**Dönüş**: `string` — Çözümlenen değerin string karşılığıdır. Değer bulunamazsa, bulunamama durumunu işaret etmek amacıyla verilen `path` parametresinin kendisi döndürülür. `number` ve `boolean` türündeki değerler otomatik olarak string'e dönüştürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/getDictValue.ts::getDictValue
- **params**:
  - `obj: unknown` — içinden değer aranacak sözlük/nesne
  - `path: string` — nokta (`.`) ile ayrılmış erişim yolu (ör. `"menu.title"`)
- **ic_degiskenler**:
  - `keys` — `path.split('.')` ile elde edilen anahtar dizisi; yol her noktadan bölünerek parçalara ayrılır
  - `current` — nesne içinde gezinirken mevcut düğümü tutan değişken; başlangıçta `obj` değerine eşitlenir, her döngü adımında bir alt seviyeye iner
  - `k` — `keys` dizisi üzerinde `for...of` döngüsüyle dolaşılan her bir anahtar
- **Dönüş**: `string` — bulunan değer; `current` string ise doğrudan, number veya boolean ise `String(current)` ile dönüştürülerek döndürülür. Herhangi bir adımda anahtar bulunamazsa, `current` nesne değilse, değer string/number/boolean değilse ya da bir hata fırlarsa orijinal `path` değeri döndürülür.

---

## NODE ID STANDARD

  file: src\i18n\getDictValue.ts
  function: src\i18n\getDictValue.ts::getDictValue

---

## DISA AKTARILANLAR (EXPORTS)
  export: getDictValue