---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-hotfix\supabase\functions\tcmb-rates-sync\index.ts
skeleton_hash: 154a8f6d9cd8d94f
entity_hashes:
  func:parseBulletin: 22e4e4d4e126232a
  func:tcmb-rates-sync_handler: 091085454d214b21
  overview: 79862a3904613170
generated_at: 2026-08-15T07:33:55Z
---

## Genel Bakış
Bu modül, Türkiye Cumhuriyet Merkez Bankası (TCMB) tarafından yayımlanan döviz kuru ve faiz oranları bültenlerini otomatik olarak senkronize etmek için tasarlanmış bir Supabase Edge Function'dır. Dışarıdan bir HTTP isteği ile tetiklenen modül, gelen XML bültenini analiz ederek yapılandırılmış bir veriye dönüştürür ve işlenen verilerin veritabanına kaydedilmesini koordine eder.

## Fonksiyon Grupları
### HTTP İstek Koordinasyonu
Modülün dış etkileşim noktasıdır; isteği doğrular, XML bültenini alır ve iş akışını başlatarak parse etme, veritabanı güncelleme gibi tüm adımları yönetir.
- tcmb-rates-sync_handler

### XML Bülten Analizi
Ham TCMB XML verisini alıp, doğrudan kullanılabilecek yapılandırılmış bir JavaScript nesnesine (döviz kurları, faiz oranları) dönüştürmekten sorumludur.
- parseBulletin

---

## AXIOMS – Mimari Varsayımlar

Bu modül, TCMB döviz kuru XML bültenlerini işleyerek veritabanını güncelleyen bir veri senkronizasyon modülüdür.

[Aksiyom 1]: Eğer `parseBulletin` fonksiyonuna geçersiz veya beklenen TCMB XML formatında olmayan bir string girilirse, `ParsedBulletin | null` dönüş tanımı gereği `null` döner.

[Aksiyom 2]: Eğer `parseBulletin` başarılı bir şekilde XML'yi parse ederse, yapılandırılmış bir `ParsedBulletin` nesnesi döner.

[Aksiyom 3]: Eğer `tcmb-rates-sync_handler` fonksiyonu bir hata ile karşılaşırsa bile, fonksiyon imzası gereği her zaman geçerli bir `Response` nesnesi dönmelidir.

[Aksiyom 4]: Eğer `tcmb-rates-sync_handler` fonksiyonu `async` olarak tanımlanmamışsa, içeresindeki I/O işlemleri (HTTP istekleri, veritabanı yazma) bloklanarak hata oluşur.

[Aksiyom 5]: Eğer handler'a geçersiz bir `Request` nesnesi girilse bile, fonksiyon response döndürme zorunluluğundadır (hata response'u dahil).

[Aksiyom 6]: Modül, TCMB XML bültenlerinin belirli bir şemaya sahip olduğunu varsayar; bu şema değişirse `ParsedBulletin` yapısı da güncellenmelidir.

---

## FONKSİYON DETAYLARI

### parseBulletin
**Ne yapar**: Bu fonksiyon, Türkiye Cumhuriyet Merkez Bankası'ndan gelen bir XML dizesini (muhtemelen döviz kurları bülteni) alır, bu XML'den etkin kur tarihini ve belirli para birimleri için döviz kurlarını çıkararak yapılandırılmış bir nesne olarak döndürür.

**Nasıl yapar**: Fonksiyon öncelikle verilen XML string'i üzerinde bir regular expression (regex) kullanarak `Tarih_Date` elemanındaki `Date` özniteliğini arar ve tarih bilgisini (ay, gün, yıl) çıkarır. Tarih bulunamazsa `null` döner. Ardından, önceden tanımlı `QUOTE_CURRENCIES` dizisindeki her bir para birimi kodu için XML'de ilgili `<Currency>` bloğunu regex ile bulur. Her blok içinde `BanknoteSelling` etiketinden (kağıt para satış fiyatı) kuru almaya çalışır; bu değer geçerli ve sıfırdan büyük değilse `ForexSelling` etiketinden (döviz kuru) kuru almaya çalışır. Geçerli bir kur elde edildiğinde bu kuru `rates` nesnesine ekler. Tüm para birimleri işlendikten sonra, eğer hiçbir geçerli kur bulunamamışsa (`rates` nesnesinin anahtarları boşsa) `null` döner; aksi halde etkin tarih (YYYY-AA-GG formatında) ve kurlar nesnesini içeren `ParsedBulletin` nesnesini döndürür.

**Parametreler**:
- `xml`: `string` — TCMB'den alınan döviz kurları bültenini içeren ham XML verisi. Fonksiyon bu string'i doğrudan düzenli ifadelerle ayrıştırır.

**Dönüş**: `ParsedBulletin | null` — İşleme başarılıysa, `effectiveDate` (string, YYYY-AA-GG formatında) ve `rates` (döviz kodlarını anahtar, kur değerlerini sayı olarak tutan nesne) alanlarını içeren bir nesne döner. Tarih bilgisi XML'de bulunamazsa veya hiçbir para birimi için geçerli bir kur extracts edilemezse `null` döner. `ParsedBulletin` tipinin yapısı `{ effectiveDate: string; rates: Record<string, number> }` şeklindedir.

### tcmb-rates-sync_handler
**Ne yapar**: Bu fonksiyon, HTTP isteklerini karşılayan asenkron bir sunucu işleyicisidir. TCMB döviz kurlarının senkronizasyonunu tetikleyen veya bu işlemle ilgili bir API endpoint'ini temsil eder.

**Nasıl yapar**: Fonksiyon, `@serve(serve)` dekoratörü ile işaretlenmiştir. Bu dekoratör, fonksiyonu bir HTTP sunucusu işlevine dönüştürür; belirli bir rotaya (URL yoluna) bağlanmasını sağlar ve gelen istekleri otomatik olarak işlevin `req` parametresine iletir. İşlevin asenkron (`async`) yapısı, potansiyel olarak uzun sürebilecek ağ tabanlı bir senkronizasyon işlemini engellemeden gerçekleştirmesine olanak tanır. Fonksiyonun gövdesi verilmediğinden, iş mantığı bilinmemektedir; ancak imzası ve dekoratörü, bunun bir tetikleyici veya senkronizasyon endpoint'i olduğunu gösterir.

**Parametreler**:
- req: Request — HTTP isteği nesnesi. İstekle ilgili header, body ve URL bilgilerini içerir.

**Dönüş**: Response — HTTP yanıt nesnesi. İşlem sonucuna göre bir durum kodu ve muhtemelen bir yanıt gövdesi (örn: başarı/hata mesajı, senkronize edilen veriler) içerir.

---

## İTHALATLAR (IMPORTS)
- import: https://deno.land/std@0.177.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.45.4::createClient

---

## INTERFACES

### ParsedBulletin
- `effectiveDate: string`
- `rates: Record<string, number>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: supabase/functions/tcmb-rates-sync/index.ts::parseBulletin
- **params**: `(xml: string)`
- **ic_degiskenler**:
  - `dateMatch` — xml içinden Tarih_Date etiketinin Date özniteliğini eşleştiren regex sonucu (tarih bilgisi)
  - `month` — dateMatch[1] erişimi ile elde edilen ay bilgisi (2 haneli string)
  - `day` — dateMatch[2] erişimi ile elde edilen gün bilgisi (2 haneli string)
  - `year` — dateMatch[3] erişimi ile elde edilen yıl bilgisi (4 haneli string)
  - `rates` — para birimi kodlarına karşılık gelen kurları tutan nesne
  - `code` — QUOTE_CURRENCIES dizisindeki her bir para birimi kodu
  - `block` — xml içinde belirli bir para birimi bloğunu eşleştiren regex sonucu
  - `pick` — Belirli bir XML etiketinin (BanknoteSelling/ForexSelling) içeriğini çıkaran iç fonksiyon
  - `m` — pick fonksiyonu içindeki regex eşleşme sonucu
  - `banknote` — BanknoteSelling değerini pick ile çıkaran değişken (sayısal)
  - `forex` — ForexSelling değerini pick ile çıkaran değişken (sayısal)
  - `rate` — banknote veya forex'ten uygun olanı seçip hesaplanan kur
- **Dönüş**: `ParsedBulletin | null` (tarih ve kurlar nesnesi veya parse başarısızsa null)

### [N2_NASIL] AST Pointer: supabase/functions/tcmb-rates-sync/index.ts::tcmb-rates-sync_handler
- **params**: `(req: Request)`
- **ic_degiskenler**:
  - `supabaseUrl` — Deno ortam değişkeninden alınan SUPABASE_URL
  - `serviceKey` — Deno ortam değişkeninden alınan SUPABASE_SERVICE_ROLE_KEY
  - `supabase` — createClient ile oluşturulan Supabase istemcisi
  - `xml` — TCMB API'sinden çekilen XML verisi (başlangıçta boş string)
  - `res` — TCMB_URL adresine yapılan fetch isteği sonucu
  - `bulletin` — parseBulletin ile işlenmiş TCMB bülteni (tarih ve kurlar)
  - `tenants` — 'tenants' tablosundan çekilen tüm kiracılar
  - `tenantsError` — tenants sorgusu hatası
  - `inserted` — başarıyla eklenen kur sayısı
  - `skipped` — atlanan (mevcut veya hata nedeniyle eklenmeyen) kur sayısı
  - `errors` — hata mesajlarını tutan dizi
  - `tenant` — tenants dizisindeki her bir kiracı nesnesi (id alanı)
  - `code` — bulletin.rates nesnesindeki her bir para birimi kodu
  - `rate` — bulletin.rates[code] erişimi ile elde edilen kur değeri
  - `existing` — 'currency_rates' tablosunda aynı kiracı/kur/tarih/kaynak kombinasyonu olup olmadığını kontrol eden sorgu sonucu
  - `readError` — existing sorgusundaki hata
  - `insertError` — currency_rates tablosuna insert işlemindeki hata
- **Dönüş**: `Response` (JSON formatında sonuç: tarih, eklenen/atlanan kur sayıları ve hatalar)

---

## NODE ID STANDARD

  file: supabase\functions\tcmb-rates-sync\index.ts
  function: supabase\functions\tcmb-rates-sync\index.ts::parseBulletin
  function: supabase\functions\tcmb-rates-sync\index.ts::tcmb-rates-sync_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: parseBulletin
  export: tcmb-rates-sync_handler