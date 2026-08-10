---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\passwordSecurity.ts
skeleton_hash: 4dea2a5498ffe35e
entity_hashes:
  func:hibpPwnedCount: 710f4dd1fd996690
  func:sha1Hex: 0a8c8ae40a0afcf2
  overview: ff989043abdda4b6
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunda kullanıcı şifrelerinin güvenlik kontrollerini gerçekleştirmek amacıyla geliştirilmiş bir yardımcı modüldür. Şifrelerden güvenli hash üretme ve şifrelerin geçmiş veri ihlallerinde yer alıp almadığını kontrol etme işlevlerini sunarak, güvenli olmayan şifrelerin sistemde kullanılmasını engellemek için gereken temel altyapıyı sağlar.

## Fonksiyon Grupları
### Hash Üretim İşlevleri
Giriş olarak aldığı metinlerden standart SHA1 hash değerleri üretir, üçüncü taraf güvenlik servisleriyle veri paylaşılırken orijinal şifrenin gizliliğini korur. İhlal kontrol sürecinde de hash üretimi için bu gruptaki fonksiyon kullanılır.
- sha1Hex

### Şifre İhlali Kontrol İşlevleri
Kullanıcının girdiği şifrenin daha önce herhangi bir veri ihlalinde yer alıp almadığını HIBP (Have I Been Pwned) servisi üzerinden sorgular, şifrenin kaç farklı ihlalde kayıtlı olduğunun sayısını döndürür. İşlem sırasında gerekli hash değerini üretmek için modül içindeki hash üretim fonksiyonunu çağırır.
- hibpPwnedCount

---

## AXIOMS – Mimari Varsayımlar
Bu modül, şifre hashleme ve harici servis üzerinden şifre ihlal geçmişini sorgulama işlemlerini gerçekleştirmek için girdi doğruluğu ve harici servis erişilebilirliği gibi zorunlu koşullara bağlıdır.

[Aksiyom 1]: Eğer sha1Hex fonksiyonuna girdi olarak geçerli bir string türünde değer sağlanmazsa, SHA-1 hash üretimi başarısız olur veya hatalı hash değeri üretilir.
[Aksiyom 2]: Eğer hibpPwnedCount fonksiyonunun çalıştığı ortamdan Have I Been Pwned (HIBP) public API'sine network erişimi sağlanmazsa, şifrenin ihlal geçmişi sorgulanamaz ve fonksiyon hata döndürür.
[Aksiyom 3]: Eğer SHA-1 hash işlemi herhangi bir nedenle doğru şekilde tamamlanamazsa, HIBP servisi sorgusu için gereken hash parçaları hatalı üretilir, bu da yanlış veya eksik ihlal sayısı sonucuna neden olur.

---

## FONKSİYON DETAYLARI

### sha1Hex
**Ne yapar**: Verilen girdi stringini SHA-1 kriptografik algoritmasıyla hashler, elde edilen sonucun büyük harfli onaltılık (hexadecimal) gösterimini döndürür. Temel kullanım amacı, düz metin parolaların HaveIBeenPwned (HIBP) k-Anonimlik kontrolleri için gerekli formata dönüştürülmesidir, parolaların güvenli şekilde işlenmesini sağlar.
**Nasıl yapar**: Asenkron olarak çalışan SHA-1 hash fonksiyonunu tetikleyerek girdi stringinden sabit uzunlukta benzersiz bir özet üretir, üretilen bu ham hash değerini standart hexadecimal formata çevirirken tüm karakterleri otomatik olarak büyük harfe dönüştürür. Asenkron yapı tercih edilerek tarayıcı veya sunucu ortamlarında hash işleminin ana threadi bloklaması engellenir, HIBP entegrasyonu için gereken format standartlarına tam olarak uyulur.
**Parametreler**:
- name: input, type: string — Hashlenmesi gereken ham metin, genellikle işlenecek düz metin parola olarak kullanılır
**Dönüş**: Promise<string> — Hash işlemi başarıyla tamamlandığında çözümlenen, büyük harfli SHA-1 hex stringini içeren promise. Hash işlemi sırasında herhangi bir hata oluşması durumunda promise reddedilir.

### hibpPwnedCount
**Ne yapar**: Girdi olarak alınan düz metin parolanın daha önce herhangi bir kamuya açık veri sızıntısında yer alıp almadığını HaveIBeenPwned (HIBP) servisinin k-Anonimlik protokolüne uygun olarak kontrol eder. Parolanın kaç farklı veri sızıntısında geçtiğini sayı olarak döndürür, oluşabilecek ağ erişimi, CORS veya servis kaynaklı hatalarda hata kodu olarak -1 değerini döndürür.
**Nasıl yapar**: Öncelikle girilen parolayı yerel olarak sha1Hex fonksiyonuyla SHA-1 hashine dönüştürür, hashin sadece ilk 5 karakterini HIBP servisine göndererek tam parola hashinin üçüncü taraflarca erişilmesini tamamen engeller. HIBP servisinden dönen eşleşme listesini tarayarak kendi hesapladığı hashin listedeki kayıtlarla eşleştiği durumların sayısını sayar, ağ isteği sırasında herhangi bir istisnai durumla karşılaşılırsa -1 değeri döndürerek uygulama tarafında hatanın kolayca yönetilmesini sağlar.
**Parametreler**:
- name: password, type: string — Veri sızıntısı kontrolü yapılacak düz metin parola, HIBP servisine hiçbir zaman tam olarak gönderilmez, sadece paroladan üretilen hashin ilk 5 karakteri paylaşılır
**Dönüş**: Promise<number> — Kontrol işlemi başarıyla tamamlandığında çözümlenen, parolanın bulunduğu toplam veri sızıntısı sayısını ifade eden 0 veya daha büyük tam sayı. Ağ, CORS veya HIBP servisine erişim hatalarında -1 değerini içeren promise döndürülür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\passwordSecurity.ts::sha1Hex
- **params**: (input: string)
- **ic_degiskenler**:
  - `enc` — Giriş stringini UTF-8 byte dizisine dönüştürmek için kullanılan TextEncoder sınıfı örneği
  - `data` — TextEncoder ile input stringinden üretilen UTF-8 byte dizisi
  - `hashBuf` — Web Crypto API'nin SHA-1 özetleme işlevinden dönen ham hash buffer'ı
  - `hashArray` — Ham hash buffer'ından Uint8Array kullanılarak oluşturulan standart sayı dizisi
  - `hashHex` — Hash dizisindeki her byte'ı 16'lık sisteme çevirip birleştirilerek oluşturulan ham hash stringi
- **Dönüş**: Promise<string> — Büyük harflere çevrilmiş standart SHA-1 hash stringi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\passwordSecurity.ts::hibpPwnedCount
- **params**: (password: string)
- **ic_degiskenler**:
  - `hash` — Giriş parolasından sha1Hex fonksiyonu ile üretilen SHA-1 hash stringi
  - `prefix` — Hash stringinden alınan ilk 5 karakter, HIBP API'sine gönderilmek üzere hazırlanır
  - `suffix` — Hash stringinden 5. indeksten sonra kalan kısmı, API cevabında eşleşme aramak için kullanılır
  - `rangeRequest` — İstek atma, zaman aşımı ve iptal işlemlerini yöneten iç içe tanımlı async fonksiyon
  - `resp` — rangeRequest'ten dönen fetch API cevap nesnesi, ilk istek ve tekrar deneme sırasında kullanılır
  - `text` — Başarılı API cevabının ham metin içeriği
  - `lines` — Cevap metninin yeni satır karakterine göre bölünerek oluşturulan satır dizisi
  - `line` — Satır dizisi üzerindeki döngüde her bir eleman, her hash-sayı çifti içeren satır
  - `suf` — Satırın ':' karakterine göre bölünmesiyle çıkarılan ilk kısım, hash suffix'i
  - `countStr` — Satırdan çıkarılan ikinci kısım, parolanın ihlal edildiği sayısını içeren string
  - `n` — countStr'in 10'luk sayıya dönüştürülmüş geçerli sayı değeri
- **Dönüş**: Promise<number> — Eşleşen suffix varsa ihlal sayısı, hiç eşleşmezse 0, tüm istek hatalarında -1

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\passwordSecurity.ts::hibpPwnedCount::rangeRequest
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ctrl` — Fetch isteğini zaman aşımında iptal etmek için kullanılan AbortController sınıfı örneği
  - `t` — 4 saniye sonra abort işlemini tetikleyen zamanlayıcının ID'si, finally bloğunda temizlenir
  - `resp` — HIBP API'sine atılan fetch isteğinden dönen cevap nesnesi
  - `prefix` — Üst hibpPwnedCount fonksiyonundan erişilen SHA-1 hashinin ilk 5 karakterini içeren değişken, fetch URL'sinde kullanılır
- **Dönüş**: Promise<Response> — HIBP API'sinden dönen standart fetch cevap nesnesi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\passwordSecurity.ts::rangeRequest
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ctrl` — Fetch isteğini zaman aşımında iptal etmek için kullanılan AbortController sınıfı örneği
  - `t` — 4 saniye sonra abort işlemini tetikleyen zamanlayıcının ID'si, finally bloğunda temizlenir
  - `resp` — HIBP API'sine atılan fetch isteğinden dönen cevap nesnesi
  - `prefix` — Fetch URL'sinde kullanılan, SHA-1 hashinin ilk 5 karakterini içeren kapsam dışı değişken
- **Dönüş**: Promise<Response> — HIBP API'sinden dönen standart fetch cevap nesnesi

---

## NODE ID STANDARD

  file: src\utils\passwordSecurity.ts
  function: src\utils\passwordSecurity.ts::sha1Hex
  function: src\utils\passwordSecurity.ts::hibpPwnedCount

---

## DISA AKTARILANLAR (EXPORTS)
  export: hibpPwnedCount
  export: sha1Hex