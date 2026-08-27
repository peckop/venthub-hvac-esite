---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\supabase\functions\_shared\revenue_alarm.ts
skeleton_hash: 45e6b9644b93d093
entity_hashes:
  func:raiseRevenueAlarm: 583400307b182d35
  overview: ed4be68d95228a99
generated_at: 2026-08-27T07:09:20Z
---

## Genel Bakış
Bu modül, gelir ile ilgili durumlarda alarm tetiklemekten sorumludur. Supabase bağlantısı için gerekli kimlik bilgilerini ve alarm verisini alarak bir gelir alarmı oluşturur. Modül `_shared` altında yer aldığından, Supabase Edge Functions arasında ortak kullanılan paylaşımlı bir yardımcı niteliğindedir.

## Fonksiyon Grupları

### Gelir Alarmı Yönetimi
Supabase ortamında tanımlı bir gelir alarmını tetikler. Fonksiyon, verilen Supabase URL ve servis rol anahtarıyla bağlantı kurarak sağlanan `RevenueAlarmInput` verisine dayalı alarm işlemini başlatır; herhangi bir değer döndürmez.
- raiseRevenueAlarm

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi verilmediğinden, çalışma mantığı hakkında kesin hüküm verilemez. Ancak imzadan çıkarılabilecek temel varsayımlar aşağıdadır:

**[Aksiyom 1]**: Eğer `supabaseUrl` parametresi yoksa (boş veya tanımsız), fonksiyonun Supabase'e bağlanması mümkün olmaz; sonuç bilinmiyor (fonksiyon gövdesi verilmediği için hata fırlatıp fırlatmadığı belirlenemez).

**[Aksiyom 2]**: Eğer `serviceRoleKey` parametresi yoksa (boş veya tanımsız), yetkili bir Supabase istemcisi oluşturulamaz; sonuç bilinmiyor.

**[Aksiyom 3]**: Eğer `input` parametresi `RevenueAlarmInput` tipine uymuyorsa, fonksiyonun beklediği veri yapısı sağlanmamış olur; sonuç bilinmiyor.

**[Aksiyom 4]**: Bu fonksiyon `async` olarak tanımlıdır. Eğer çağrılan ortam `async` işlevleri desteklemiyorsa (veya `await` ile çağrılmıyorsa), `Promise<void>` döndürüldüğünden sonuç beklenen şekilde alınamaz.

**Not**: `RevenueAlarmInput` tipinin yapısı ve eşik değerleri hakkında bilgi verilmediğinden, domain-specific kurallar belirlenememiştir.

---

## FONKSİYON DETAYLARI

### raiseRevenueAlarm
**Ne yapar**: Gelir yolunu kesen bir arızayı kalıcı ve görünür bir yere yazar. Fonksiyon, hem konsola hata logu düşer hem de Supabase veritabanındaki `client_errors` tablosuna kaydeder. Bu sayede arıza hem platform loglarında hem de veritabanında izlenebilir hale gelir.

**Nasıl yapar**: Fonksiyon önce `SOURCE` sabiti ile birlikte bir hata mesajı oluşturur ve `console.error` ile platform loguna yazar; bu sayede veritabanı yazımı başarısız olsa bile bir iz kalır. Ardından `supabaseUrl` ve `serviceRoleKey` parametrelerinin varlığını kontrol eder; eksikse hata loglayıp erken dönüş yapar. Parametreler mevcutsa Supabase REST API'sine `client_errors` tablosuna POST isteği gönderir. Mesaj, `error_groups` mekanizmasının aynı arızayı tek grupta toplayabilmesi için sabit bir `[GELIR-YOLU]` öneki taşır. İstek başarısız olursa veya bir istisna fırlatılırsa, hata detayları `console.error` ile loglanır ve fonksiyon sessizce sonlanır.

**Parametreler**:
- supabaseUrl: string — Supabase projesinin REST API URL'i. Boş veya tanımsız ise fonksiyon veritabanı yazımı yapmaz, yalnızca konsola hata logu düşer.
- serviceRoleKey: string — Supabase servis rol anahtarı. Hem `Authorization` başlığında `Bearer` token olarak hem de `apikey` başlığında kullanılır. Boş veya tanımsız ise fonksiyon veritabanı yazımı yapmaz.
- input: RevenueAlarmInput — Arıza bilgilerini taşıyan nesne. Aşağıdaki alanları içerir:
  - input.fn: string — Arızanın gerçekleştiği fonksiyon adı. Hata mesajında ve `url` alanında (`edge://<fn>` formatında) kullanılır.
  - input.code: string — Arıza kodu. Hata mesajında ve `extra` alanında yer alır.
  - input.message: string — Arıza açıklaması. Hata mesajının ana metnini oluşturur.
  - input.extra: Record<string, unknown> | undefined — Ek bağlam bilgileri. `console.error` çağrısında ve veritabanı kaydının `extra` alanına eklenir. Tanımsızsa boş nesne olarak işlenir.

**Dönüş**: Promise<void> — Fonksiyon asenkron çalışır ancak anlamlı bir değer döndürmez. Başarılı veya başarısız tüm senaryolarda `undefined` ile çözümlenir; hata fırlatmaz.

---

## TYPE ALIASES

### RevenueAlarmInput
```typescript
type RevenueAlarmInput = {
  /** Kesintiye uğrayan işlev, ör. `iyzico-payment`. */
  fn: string
  /** Makine-okunur sebep, ör. `VALIDATION_UNAVAILABLE`. Gruplama bunun üzerinden yapılır. */
  code: string
  /** İnsan içi
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: _shared/revenue_alarm.ts::raiseRevenueAlarm
- **params**:
  - `supabaseUrl` — Supabase projesinin REST API taban URL'si
  - `serviceRoleKey` — Supabase service_role anahtarı (yetkili erişim)
  - `input` — `RevenueAlarmInput` tipinde alarm verisi; `fn`, `code`, `message` ve opsiyonel `extra` alanlarını taşır
- **ic_degiskenler**:
  - `line` — Konsol çıktısı için biçimlendirilmiş alarm satırı; `[SOURCE]` öneki, `input.fn`, `input.code` ve `input.message` değerlerini birleştirir
  - `input.fn` — Alarmı tetikleyen fonksiyon adı; hem `line` içinde hem de `body` içinde `url` ve `extra` alanlarında kullanılır
  - `input.code` — Hata kodu; `line` içinde ve `body` içinde `message` ile `extra` alanlarında kullanılır
  - `input.message` — Hata mesajı; `line` içinde ve `body` içinde `message` alanının parçası olarak kullanılır
  - `input.extra` — Opsiyonel ek veri; `line` konsol çıktısında ve `body` içinde `extra` alanına yayılır (`?? {}` ile varsayılan boş nesne)
  - `resp` — `fetch` çağrısının döndürdüğü `Response` nesnesi; `resp.ok` ile başarısızlık kontrolü, `resp.status` ile durum kodu okunur
  - `detail` — Başarısız yanıt durumunda `resp.text()` ile elde edilen hata detay metni; `.catch(() => '')` ile sessiz fallback, `.slice(0, 200)` ile kırpılır
  - `e` — `catch` bloğunda yakalanan istisna nesnesi; konsola yazdırılır
- **Dönüş**: `Promise<void>` — yan etki tabanlı fonksiyon, değer döndürmez

**Yan etkiler**:
1. `console.error(line, input.extra ?? {})` — platform logu olarak konsola yazar (DB yazımı başarısız olsa bile iz kalır)
2. `supabaseUrl` veya `serviceRoleKey` boşsa `console.error` ile uyarı yazdırır ve erken döner
3. `fetch` ile `supabaseUrl/rest/v1/client_errors` adresine POST isteği gönderir; gövde `message` (sabit `[GELIR-YOLU]` önekli), `level: 'error'`, `url: edge://...`, `env: 'edge'`, `extra` alanlarını içerir
4. Yanıt başarısızsa (`!resp.ok`) `console.error` ile durum kodu ve detay yazar
5. `fetch` istisna fırlatırsa `catch` bloğunda `console.error` ile hata yazar

---

## NODE ID STANDARD

  file: supabase\functions\_shared\revenue_alarm.ts
  function: supabase\functions\_shared\revenue_alarm.ts::raiseRevenueAlarm

---

## DISA AKTARILANLAR (EXPORTS)
  export: RevenueAlarmInput
  export: raiseRevenueAlarm

## Tasarım Gerekçeleri (kaynaktan BİREBİR)

> Bu bölüm LLM tarafından **yazılmadı**; kaynaktaki işaretli bloklardan
> birebir kopyalandı. Özetlenmesi veya yeniden ifade edilmesi YASAKTIR —
> gerekçenin değeri tam olarak kelimelerindedir.


```text
NİÇİN VAR (T045-VH · 2026-08-15)

Ödeme akışının iki yarısı da bağımsız olarak **fail-closed** yapıldı:
• ön yüz (`useCheckoutPayment`) — `validateServerCart` düşerse ödeme başlatmaz (#536)
• sunucu (`iyzico-payment`)     — `order-validate` düşerse ödeme başlatmaz (T041-VH)

Her iki karar da tek başına DOĞRU: alternatifi, tahsil edilecek tutarı tarayıcının
belirlemesiydi. Ama ikisi birleşince yeni bir sınıf doğdu — bir eş-Controller panodan
tam olarak bunu işaret etti: **`order-validate` düşerse kimse satın alamaz ve kimse
fark etmez.** İki taraf da ayrı ayrı doğru, dikiş yeri sessizce kopuyor.

Sessizliğin sebebi, arızanın "hata" gibi görünmemesidir: kullanıcı bir uyarı görür ve
vazgeçer, sunucu 502 döner ve unutur. Ortada patlayan bir şey yok, yalnız ciro yok.
Sıfır sipariş, "bugün kimse almadı"dan ayırt edilemez.

BU YÜZDEN ALARM, SENTRY'YE BAĞLI DEĞİL. `_shared/sentry.ts` `SENTRY_DSN` yoksa
SESSİZCE hiçbir şey yapmaz ve bu projede DSN hiçbir `.env*.example` dosyasında YOK
(`T014-VH`). Sentry'ye yaslanan bir alarm, kapatılmış bir alarmdır. Kayıt bu yüzden
`client_errors` tablosuna yazılır: admin panelindeki **Hata Grupları** ekranı zaten
oraya bakar, yani insanın gözünün değdiği bir yüzey.

Yazma BEST-EFFORT'tur ve ASLA fırlatmaz: alarm mekanizması, alarmı kuran işlemi
düşürmemelidir. Ama sessizce yutulmaz da — başarısız olursa `console.error` ile
platform loglarına düşer.
```
