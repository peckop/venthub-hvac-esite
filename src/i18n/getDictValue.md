---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\i18n\getDictValue.ts
skeleton_hash: 5dd3501554501d6b
entity_hashes:
  func:getDictValue: 8458c9d7ff2daa26
  overview: 3ad66d5b97f51555
generated_at: 2026-06-15T11:41:12Z
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

**Ne yapar**: Verilen bir nesne (`obj`) içerisinde, nokta ile ayrılmış yollardan (ör. `"common.categoryList.ac"`) oluşan bir anahtarı (`path`) güvenli bir şekilde çözer. Anahtar yolu geçerli bir değere ulaşamazsa, çözülen değer yerine orijinal `path` dizesinin kendisini döndürür. Bu davranış, i18n sistemlerinde "ham anahtar" semantiğinin temelini oluşturur; çağrı yapan taraf `sonuç === path` karşılaştırması ile değerin çözülüp çözülmediğini anlayabilir.

**Nasıl yapar**: Fonksiyon bir `try-catch` bloğu içinde çalışır. Öncelikle `path` dizesi nokta (`.`) karakteri kullanılarak bir dizi anahtara (`keys`) bölünür. Ardından `obj` nesnesi üzerinde bir döngü başlatılır; her bir alt anahtar (`k`) için mevcut nesnenin (`current`) bir nesne olup olmadığı ve ilgili anahtarın bu nesnenin içinde bulunup bulunmadığı kontrol edilir. Eğer herhangi bir aşamada anahtar bulunamazsa veya mevcut değer beklenen türde (nesne) değilse, döngü kırılır ve orijinal `path` döndürülür. Döngü başarıyla tamamlanırsa, elde edilen son değerin türü kontrol edilir: `string` ise doğrudan, `number` veya `boolean` ise `String()` ile string'e dönüştürülerek döndürülür. Herhangi bir hata oluşursa (`catch` bloğu), fonksiyon yine `path` değerini döndürerek kırılgan bir davranış sergilemez. Fonksiyon saf (pure) bir yapıdadır ve `'use client'` direktifi içermez; bu nedenle hem Server Component'lerde hem de istemci taraflı kodda kullanılabilir.

**Parametreler**:
- `obj`: `unknown` — Nokta yolu ile erişilecek olan sözlük (nesne) yapısı. Türü bilinmediği için `unknown` olarak belirtilmiştir; fonksiyon içinde her bir seviyede `typeof current === 'object'` kontrolü yapılarak güvenli bir şekilde işlenir.
- `path`: `string` — Nokta ile ayrılmış anahtar yolu (ör. `"common.categoryList.ac"`). Fonksiyon bu yolu `.` karakterine göre bölerek her bir bileşeni sırasıyla nesne hiyerarşisinde aşağı doğru takip eder.

**Dönüş**: `string` — Çözümleme başarılıysa ilgili sözlük değeri (string, number veya boolean ise string'e dönüştürülmüş hali) döndürülür. Çözümleme başarısız olursa veya herhangi bir hata yakalanırsa, orijinal `path` parametresinin kendisi döndürülür. Bu sayede çağrı yapan kod, dönüş değeri ile orijinal yolu karşılaştırarak i18n anahtarının çözülüp çözülmediğini anlayabilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/getDictValue.ts::getDictValue
- **params**: (obj: unknown, path: string)
- **ic_degiskenler**:
  - `keys` — path string'ini nokta charakteri ile split ederek elde edilen string dizisi; obje içinde derinlemesine erişim için adım adım kullanılır
  - `current` — döngü içerisinde her seviyede güncellenen o anki erişilen değer; başlangıçta fonksiyona gelen obj parametresidir
  - `k` — döngü iterasyonunda mevcut anahtar; keys dizisinden sırayla alınan her bir yol parçası
- **Dönüş**: string — path ile erişilen değer string ise doğrudan o değer, number veya boolean ise String() ile stringify edilmiş hali, erişim başarısızsa veya hata oluşursa orijinal path döner

---

## NODE ID STANDARD

  file: src\i18n\getDictValue.ts
  function: src\i18n\getDictValue.ts::getDictValue

---

## DISA AKTARILANLAR (EXPORTS)
  export: getDictValue