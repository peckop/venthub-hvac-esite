---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\supabase\functions\tcmb-rates-sync\index.ts
skeleton_hash: 6210aa5ad92f37e2
entity_hashes:
  func:parseBulletin: bb903b4819589f60
  func:tcmb-rates-sync_handler: 091085454d214b21
  overview: 4605344897640e28
generated_at: 2026-08-13T18:23:43Z
---

## Genel Bakış
Bu modül, Türkiye Cumhuriyet Merkez Bankası'nın (TCMB) döviz kuru ve faiz oranlarını içeren XML bültenlerini işleyerek veritabanını güncellemekten sorumludur. Temel olarak harici bir HTTP isteği alır, gelen XML verisini analiz eder ve işlenmiş verileri veritabanına kaydeder.

## Fonksiyon Grupları
### HTTP İşleyici ve Koordinasyon
Modülün dış dünyayla tek etkileşim noktasıdır; gelen istekleri doğrular, XML bültenini alır ve işlemenin tüm akışını koordine eder.
- tcmb-rates-sync_handler
### XML Veri Analizi
Ham XML bültenini alıp yapılandırılmış ve kullanıma hazır bir veri nesnesine dönüştürmekten sorumludur.
- parseBulletin

---

## AXIOMS – Mimari Varsayımlar

Bu modül TCMB (Türkiye Cumhuriyet Merkez Bankası) döviz kuru verilerini XML formatından parse eden ve senkronize eden bir Supabase Edge Function'dır. Aşağıdaki varsayımlar fonksiyon imzalarından türetilmiştir:

---

**[Aksiyom 1]:** Eğer `xml` parametresi geçerli/biyar XML formatında değilse veya beklenen TCMB bülten yapısını içermiyorsa, `parseBulletin` fonksiyonu `null` döner ve senkronizasyon verisi üretilemez.

> *Gerekçe:* `parseBulletin`'in dönüş tipi `ParsedBulletin | null` olarak tanımlıdır — bu, parse işleminin başarısız olabileceğini ve `null` ile bildirileceğini gösterir.

---

**[Aksiyom 2]:** Eğer `req` (Request) parametresi geçerli bir HTTP Request nesnesi değilse, handler fonksiyonu beklenmeyen bir hata fırlatır veya geçersiz bir Response döner.

> *Gerekçe:* `tcmb-rates-sync_handler`'ın `req: Request` parametresi ile çağrılması zorunludur; request nesnesi olmadan endpoint çalışamaz.

---

**[Aksiyom 3]:** Eğer `parseBulletin` sonucu `null` ise, handler fonksiyonu successfully (200) bir senkronizasyon yanıtı döndüremez — hata durumu veya boş veri yanıtı döndürmelidir.

> *Gerekçe:* Parse başarısız olduğunda işlenecek geçerliParsedBulletin verisi olmadığından, handler'ın senkronizasyon işlemini tamamlaması yapısal olarak mümkün değildir.

---

**Not:** Bu modül için fonksiyon gövdesine erişim olmadığından, parse edilen XML şeması (hangi elemanların beklenildiği), API endpoint URL'i, kimlik doğrulama mekanizması ve döviz kuru eşik değerleri gibi detaylar **bilinmiyor** olarak işaretlenmiştir.

---

## FONKSİYON DETAYLARI

### parseBulletin
**Ne yapar**: Bu fonksiyon, Türkiye Cumhuriyet Merkez Bankası (TCMB) döviz kurları XML verisini ayrıştırarak belirli para birimleri için efektif satış kurunu ve tarihi yapılandırılmış bir nesne olarak döndürür. Fonksiyon, geçerli bir veri bulunamadığında `null` döner.

**Nasıl yapar**: Fonksiyon, gelen XML string'inde `Tarih_Date` etiketindeki `Date` özelliğini regex kullanarak bulur ve ay, gün, yıl bileşenlerini çıkarır. Ardından, dışarıdan tanımlı `QUOTE_CURRENCIES` dizisindeki her para birimi kodu için, XML içinde ilgili `<Currency>` bloğunu regex ile tarar. Her blok içinde `BanknoteSelling` ve `ForexSelling` etiketlerinden değerleri çeker; `BanknoteSelling` geçerli ve pozitifse onu, değilse `ForexSelling` kurunu kullanarak bir kur oranı oluşturur. Toplanan geçerli kur oranlarını bir `rates` nesnesinde depolar. Hiçbir geçerli kur bulunamazsa `null`, aksi takdirde tarih ve kurları içeren bir nesne döner.

**Parametreler**:
- xml: string — TCMB dövim kurlarını içeren ham XML verisi.

**Dönüş**: `ParsedBulletin | null` — Ayrıştırılmış bulletin nesnesi veya ayrıştırma başarısız olursa `null`. `ParsedBulletin` tipi `{ effectiveDate: string; rates: Record<string, number> }` yapısındadır; `effectiveDate` YYYY-AA-GG formatında tarih, `rates` ise para birimi kodlarını (örn: "USD", "EUR") kurlarına eşleyen bir nesnedir.

### tcmb-rates-sync_handler
**Ne yapar**: Bu fonksiyon, HTTP isteklerini karşılayan asenkron bir sunucu işleyicisidir. TCMB döviz kurlarının senkronizasyonunu tetikleyen veya bu işlemle ilgili bir API endpoint'ini temsil eder.

**Nasıl yapar**: Fonksiyon, `@serve(serve)` dekoratörü ile işaretlenmiştir. Bu dekoratör, fonksiyonu bir HTTP sunucusu işlevine dönüştürür; belirli bir rotaya (URL yoluna) bağlanmasını sağlar ve gelen istekleri otomatik olarak işlevin `req` parametresine iletir. İşlevin asenkron (`async`) yapısı, potansiyel olarak uzun sürebilecek ağ tabanlı bir senkronizasyon işlemini engellemeden gerçekleştirmesine olanak tanır. Fonksiyonun gövdesi verilmediğinden, iş mantığı bilinmemektedir; ancak imzası ve dekoratörü, bunun bir tetikleyici veya senkronizasyon endpoint'i olduğunu gösterir.

**Parametreler**:
- req: Request — HTTP isteği nesnesi. İstekle ilgili header, body ve URL bilgilerini içerir.

**Dönüş**: Response — HTTP yanıt nesnesi. İşlem sonucuna göre bir durum kodu ve muhtemelen bir yanıt gövdesi (örn: başarı/hata mesajı, senkronize edilen veriler) içerir.

---

## İTHALATLAR (IMPORTS)
- import: https://deno.land/std@0.177.0/http/server.ts::serve
- import: https://esm.sh/@supabase/supabase-js@2.39.3::createClient

---

## INTERFACES

### ParsedBulletin
- `effectiveDate: string`
- `rates: Record<string, number>`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\tcmb-rates-sync\index.ts::parseBulletin
- **params**: (xml: string)
- **ic_degiskenler**:
  - `dateMatch` — Tarih_Date XML bloğundaki Date niteliğinden ay, gün, yıl bilgilerini çıkaran regex eşleşme sonucu (RegExp match array veya null)
  - `month` — dateMatch dizisinden destructuring ile alınan ay bilgisi (2 haneli string, ör. "03")
  - `day` — dateMatch dizisinden destructuring ile alınan gün bilgisi (2 haneli string, ör. "15")
  - `year` — dateMatch dizisinden destructuring ile alınan yıl bilgisi (4 haneli string, ör. "2024")
  - `rates` — Para birimi kodlarını anahtar, döviz kurunu sayı olarak tutan sözlük (Record<string, number>), her geçerli kurla doldurulur
  - `code` — QUOTE_CURRENCIES dizisi üzerindeki for döngüsündeki mevcut para birimi kodu (ör. "USD", "EUR")
  - `block` — Belirli bir para birimi koduna ait tüm Currency XML bloğunu eşleştiren regex sonucu (RegExp match array veya null)
  - `pick` — Bir XML etiketinin (BanknoteSelling/ForexSelling) içeriğini sayıya dönüştüren inner fonksiyon; tag parametresi alır, number döndürür
  - `m` — pick inner fonksiyonu içindeki regex eşleşme sonucu (belirli tag değerini yakalar)
  - `banknote` — pick('BanknoteSelling') çağrısı ile elde edilen banknot satış kuru (number, geçerli değilse NaN)
  - `forex` — pick('ForexSelling') çağrısı ile elde edilen döviz satış kuru (number, geçerli değilse NaN)
  - `rate` — banknote geçerli ve pozitifse banknote, aksi takdirde forex değeri; tercih edilen nihai kuru temsil eder
- **Dönüş**: { effectiveDate: `${year}-${month}-${day}`, rates } veya null — effectiveDate YYYY-MM-DD formatında tarih stringi, rates_para birimi-kuru sözlüğü; bulletin parse edilemezse null

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\supabase\functions\tcmb-rates-sync\index.ts::tcmb-rates-sync_handler
- **params**: (req: Request)
- **ic_degiskenler**:
  - `supabaseUrl` — Deno.env.get('SUPABASE_URL') ile okunan Supabase proje URL'si (string veya undefined)
  - `serviceKey` — Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ile okunan Supabase servis rol anahtarı (string veya undefined)
  - `supabase` — createClient(supabaseUrl, serviceKey) ile oluşturulan Supabase istemcisi
  - `xml` — TCMB web servisinden çekilen ham XML verisi (başlangıçta boş string, fetch sonrası doldurulur)
  - `res` — TCMB_URL üzerine yapılan fetch çağrısının Response sonucu; res.ok kontrolü ile HTTP durumu değerlendirilir
  - `_err` — catch bloğunda yakalanan hata nesnesi (TCMB erişilemez durumlarda); fonksiyonda kullanılmaz, sadece varlık bildirimi
  - `bulletin` — parseBulletin(xml) çağrısının dönüşü (ParsedBulletin nesnesi veya null); effectiveDate ve rates alanlarını içerir
  - `tenants` — supabase.from('tenants').select('id') sorgusundan dönen kiracı listesi (dizi, her eleman { id: string })
  - `tenantsError` — tenants sorgusundaki olası hata nesnesi (error veya null)
  - `inserted` — Başarıyla veritabanına inserted edilen kur kayıtlarının sayacı (başlangıçta 0)
  - `skipped` — Atlanan kur kayıtlarının sayacı; mevcut kayıt bulunduğu veya yarış durumunda unique ihlali olduğunda artırılır (başlangıçta 0)
  - `errors` — Oluşan hata mesajlarını toplayan dizi (her eleman "paraBirimKodu: hataMesaji" formatında string)
  - `tenant` — tenants dizisi üzerindeki dış for döngüsündeki mevcut kiracı nesnesi ({ id: string })
  - `code` — bulletin.rates sözlüğü üzerindeki iç for döngüsündeki para birimi kodu (ör. "USD", "EUR")
  - `rate` — bulletin.rates sözlüğünden alınan döviz kuru değeri (number)
  - `existing` — currency_rates tablosundan aynı tenant_id, quote_ccy, effective_date ve source='tcmb' koşuluyla okunan mevcut kayıt listesi (dizi veya null)
  - `readError` — currency_rates okuma sorgusundaki olası hata nesnesi
  - `insertError` — currency_rates.insert() çağrısındaki olası hata nesnesi; insertError.code === '23505' ise unique ihlali sayılır
- **Dönüş**: Response nesnesi — JSON gövdesinde { ok: boolean, bulletinDate?: string, rates?: Record<string, number>, inserted: number, skipped: number, errors: string[], carried?: boolean, reason?: string, error?: string } ; OPTIONS isteklerinde basit 'ok' yanıtı, Supabase yapılandırma eksikliğinde 500, TCMB erişilemezse 200 + carried:true, parse başarısızlığında 502, normal tamamlanmada 200 (hata varsa 500)

---

## NODE ID STANDARD

  file: supabase\functions\tcmb-rates-sync\index.ts
  function: supabase\functions\tcmb-rates-sync\index.ts::parseBulletin
  function: supabase\functions\tcmb-rates-sync\index.ts::tcmb-rates-sync_handler

---

## DISA AKTARILANLAR (EXPORTS)
  export: parseBulletin
  export: tcmb-rates-sync_handler