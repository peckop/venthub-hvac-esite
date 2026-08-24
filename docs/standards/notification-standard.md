# Bildirim Cetveli — Notification Standard v1.0

> **KAYNAK/CETVEL**
> - **Bu belge bir CETVELDİR.** Yazılma sebebi: T118-VH (teslim e-postası müşteriye iki kez
>   gitti, PR #706) kapatılırken sorulan "bu sınıf başka nerede yaşıyor" sorusunun cevabı
>   ölçüldü ve **cetvel yoktu**. CLAUDE.md Mutlak Kural 1 gereği cetveli yazmak işin kapsamına
>   dahildir.
> - **Üst cetveller:** `docs/standards/edge-function-security-standard.md` (uç güvenliği),
>   `docs/standards/rendering-cache-standard.md` (veri değişince ne tazelenir),
>   `docs/standards/i18n-localization-standard.md` (kullanıcıya görünen metin).
>   Bu belge onların yerine geçmez; **bildirim gönderimi** eksenini ekler.
> - **Ölçüm tabanı:** `origin/master` = `57e82a4d` (2026-08-20) + canlı Postgres
>   (`information_schema.columns`, aynı gün sorgulandı). Ana çalışma dizini ÖLÇÜM KAYNAĞI
>   DEĞİLDİR — bugün `2df35323`'te bayat kaldığı görüldü.
> - **Dış kaynaklar:** aşağıda §B10.

## Kapsam

Bu cetvel, **VentHub'ın müşteriye veya operasyona kendiliğinden gönderdiği her mesajı**
yönetir: e-posta, SMS, WhatsApp, panoya düşen operasyon uyarısı. Kanal fark etmez;
kural gönderimin **tetiklenme ve tekrarlanma** biçimi üzerinedir.

Kapsam dışı: kullanıcının kendi bastığı butonla anında aldığı yanıt (ör. form gönderimi
sonrası ekranda çıkan onay), ve `console`/Sentry kayıtları.

## B1 — Bildirim, "yan etki"dir; en az sipariş kadar ciddiye alınır

Bir bildirim gönderildikten sonra **geri alınamaz**. Müşterinin gelen kutusuna düşen ikinci
"siparişiniz teslim edildi" e-postası, veritabanındaki bir satırı düzeltir gibi düzeltilemez.
Bu yüzden bildirim, sipariş durumu gibi **monoton** ve **tekil** olmak zorundadır:

- **Monoton:** aynı olay için bildirim yalnız ileri yönde üretilir; geri sarılmaz.
- **Tekil:** aynı (sipariş, olay) çifti için müşteriye **bir** mesaj gider.

Bu iki şart, aşağıdaki B3'ün tamamının gerekçesidir.

## B2 — Bugünkü yüzey (ÖLÇÜLDÜ, tahmin değil)

### B2.1 — Uçlar ve ÇAĞRI BİÇİMLERİ

`supabase/functions/` altında bildirim üreten yedi uç var. Kritik nokta: **hepsi aynı biçimde
çağrılmıyor**, ve envanteri tek biçime kurmak yanlış hükme yol açar (bugün yaşandı: yalnız
`functions.invoke(` taranınca `order-confirmation` görünmedi ve "ödeme onay e-postası yok"
diye yanlış hüküm kuruldu).

| Uç | Çağıran | Çağrı biçimi |
|---|---|---|
| `order-confirmation` | `iyzico-callback/index.ts:327` | sunucu→sunucu düz `fetch` |
| `delivery-notification` | `src/lib/orderStatusService.ts:193`, `shipping-webhook` | istemci `invoke` + uç |
| `shipping-notification` | `admin-update-shipping/index.ts` | sunucu→sunucu |
| `return-status-notification` | `src/views/admin/ReturnsTableBody.tsx:518,694`, `returns-webhook` | istemci `invoke` + uç |
| `notification-service` | `src/views/admin/quotes/QuotesTableBody.tsx:346`, `stock-alert` | istemci `invoke` + uç |
| `quote-notification-webhook` | DB tetiği (`20260817200000_quote_request_notification.sql`) | veritabanı tetiği |
| `stock-alert` | `.github/workflows/stock-alert-cron.yml` | cron |

**Kural B2.1:** bir bildirim yeteneğinin var olup olmadığı sorulduğunda, envanter **beş çağrı
biçiminin beşini de** taramak zorundadır: istemci `invoke` · sunucu→sunucu `fetch` ·
veritabanı tetiği · webhook · cron. Tek biçimli taramanın sıfırı, yokluğun kanıtı değildir.

#### B2.1.b — DEVREDEN UÇLAR (ikinci sınıf)

Yukarıdaki tablo **e-postayı kendisi gönderen** uçları sayar. Ama gönderimi başka bir uca
**devreden** uçlar da vardır: kullanıcının gözünden bildirimi başlatan şey onlardır, ve
sağlayıcı adına (`api.resend.com`) bakan bir ölçü onları **göremez**.

Ölçüm (2026-08-23, 28 ucun tamamı okundu): **6 doğrudan gönderici + 6 devreden.**

| Devreden uç | Tetiklediği gönderici | Nasıl |
|---|---|---|
| `admin-update-shipping` | `shipping-notification` | sunucu→sunucu `fetch` |
| `iyzico-callback` | `order-confirmation` | sunucu→sunucu `fetch` |
| `order-paid-webhook` | `order-confirmation` | sunucu→sunucu `fetch` |
| `returns-webhook` | `return-status-notification` | sunucu→sunucu `fetch` |
| `shipping-webhook` | `delivery-notification` | sunucu→sunucu `fetch` |
| `stock-alert` | `notification-service` | sunucu→sunucu `fetch` |

`iyzico-payment` de `functions/v1` çağırır ama hedefi `order-validate`'tir — bildirim akışı
değildir, **kapsam dışıdır**.

> **Zincir vardır, tek adım varsaymayın.** `stock-alert` hem devreden hem hedeftir:
> `iyzico-callback` → `stock-alert` → `notification-service`. Bu yüzden kural ve kapı
> **geçişli** çalışır — bir gönderici uca kaç adımda ulaşıldığı fark etmez.

**Kural B2.1.b:** bir gönderici ucu — doğrudan ya da zincirleme — tetikleyen her uç, bu
cetvelde **adıyla** geçmek zorundadır. Kapsam sağlayıcı adına değil **davranışa** bağlıdır:
ölçü "Resend'i çağırıyor mu" değil, "bir bildirim akışını başlatıyor mu" sorusudur.

> **Bilinen sınır (dürüstçe):** bu kural çağrı grafiğini **kaynak metinden** okur ve hedef
> adının sabit metin olmasına dayanır. Bugün 28 ucun hepsinde öyledir
> (`` `${supabaseUrl}/functions/v1/order-confirmation` `` — birleşen kısım yalnız önek).
> Hedef adı değişkenden üretilirse tarama körleşir; bu yüzden `INV-NOTIFY-1` böyle bir
> çağrıyı **kırmızı** sayar (§B8.1). Körlüğü sessizce yaşamak seçenek değildir.

### B2.2 — Defterler: üç tane var, ÜÇÜ AYNI SORUYU CEVAPLAMIYOR

| Defter | Başarısızlık satır bırakır mı | `tenant_id` | Gönderimden ÖNCE okunuyor mu |
|---|---|---|---|
| `order_email_events` | **EVET** (v1.1: `status` + `error`) | **YOK** (canlı DB, 08-20 · v1.1'de de yok) | uç HAYIR · **tetik EVET** |
| `shipping_email_events` | **HAYIR** (yalnız başarı) | VAR | **HAYIR** |
| `quote_email_events` | **EVET** (`status in ('sent','failed')` + `error`) | ölçülmedi | **EVET** (damga üzerinden) |

Uç bazında ölçüm (`origin/master` = `57e82a4d`):

| Uç | Deftere yazar | Göndermeden önce OKUR |
|---|---|---|
| `order-confirmation` | `order_email_events` (satır 208) | **hayır** |
| `shipping-notification` | `shipping_email_events` (satır 393) | **hayır** |
| `delivery-notification` | `shipping_email_events` (satır 162) | **hayır** |
| `quote-notification-webhook` | `quote_email_events` | **evet** (satır 107 + 118) |

İki ayrı kusur sınıfı çıkıyor:

1. **Defter yazılıyor ama okunmuyor.** Dört uçtan üçünde "bunu zaten yolladık mı" sorusunu
   soran kimse yok. Defterin varlığı korumanın varlığı DEĞİLDİR.
2. **Defter sınırları bildirim türüyle uyuşmuyor.** `delivery-notification` (teslim) kendi
   kaydını **kargo** defterine yazıyor. Yani "teslim e-postası kaç kez gitti" sorusu bugün
   ancak `subject` metnine bakarak cevaplanabiliyor — tür kolonu yok.

### B2.3 — Sipariş durumu × bildirim kapsamı

Otorite `venthub_orders_status_check` (altı değer; `paid`/`refunded` **sipariş durumu değildir**,
bkz. `docs/standards/pricing-standard.md` ve ilgili ölçüm).

| `status` | Bildirim | Uç |
|---|---|---|
| `pending` | yok | — |
| `confirmed` | **var** | `order-confirmation` (`iyzico-callback:327`, yalnız `if (paid)` dalı) |
| `processing` | yok | — |
| `shipped` | **var** | `shipping-notification` (`admin-update-shipping`) |
| `delivered` | **var** | `delivery-notification` (`orderStatusService.ts:193`) |
| `cancelled` | yok | — |

Altı durumun üçünde bildirim var. **Boşluk bir kusur değil, bir KARARDIR** — ve karar
verilmemiştir. Kural: yeni bir sipariş durumu eklendiğinde bu tabloya satır eklemek ve
"bildirim yok" seçeneğini **açıkça yazmak** zorunludur (§B8 kapısı bunu ölçer).

## B3 — MÜKERRERLİK KORUMASI (bu cetvelin çekirdeği)

### B3.1 — İki katman ZORUNLU, biri diğerinin yerine geçmez

Her bildirim gönderimi **iki** bağımsız korumaya sahip olmalıdır:

**Katman 1 — Sağlayıcı anahtarı (ucuz, anlık).**
Resend, `Idempotency-Key` başlığını destekler; aynı anahtarla gelen ikinci istek yeni e-posta
üretmez. **Sınırı:** anahtar **24 saat** sonra düşer, en fazla 256 karakter olabilir; aynı
anahtar farklı gövdeyle gelirse `409 invalid_idempotent_request`, eşzamanlı ikinci istek
gelirse `409 concurrent_idempotent_requests` döner (kaynak §B10-1).

**Katman 2 — Kendi damgamız (kalıcı).**
24 saat, bir siparişin ömrü için kısadır: kargo webhook'u iki gün sonra yeniden "delivered"
gönderirse Katman 1 artık koruma vermez. Bu yüzden **veritabanında** kalıcı bir damga
şarttır ve **gönderimden önce OKUNMALIDIR**.

**Referans uygulama proje içinde zaten var:** `quote-notification-webhook`. Damga kolonu
`venthub_quotes.request_email_sent_at`; uç satır 107'de okur, 118'de doluysa **gönderimden
vazgeçer**, 172'de başarıdan sonra damgayı basar. Yeni bildirim yazan herkes bu üçlüyü
kopyalar.

> **Katman 1 tek başına yeterli DEĞİLDİR** (24 saat), **Katman 2 tek başına yeterli
> DEĞİLDİR** (uç iki kez eşzamanlı çağrılırsa ikisi de damgayı boş görür ve ikisi de gönderir).
> İkisi birlikte hem yarışı hem gecikmiş tekrarı kapatır.

### B3.2 — Anahtar biçimi

Anahtar **olayın kimliğidir**, isteğin değil:

```
<bildirim-turu>/<varlik-id>[/<ayirt-edici>]
```

- `siparis-onay/9f2c…` — sipariş başına bir kez
- `teslim/9f2c…` — sipariş başına bir kez
- `kargo/9f2c…/TR12345` — takip numarası değişirse yeni bildirim MEŞRUDUR, anahtar da değişir

Yasak: zaman damgası, rastgele değer, `crypto.randomUUID()` — bunlar her çağrıda değişir ve
anahtarı **hiçbir şeyi korumayan** bir süse çevirir.

### B3.3 — Damga başarıdan SONRA, defter her iki hâlde de yazılır

- **Damga** yalnız gönderim başarılı olduktan sonra basılır (başarısızlıkta basılırsa müşteri
  hiç e-posta almaz ve tekrar denenmez — sessiz kayıp).
- **Defter** hem başarıda hem başarısızlıkta satır bırakır. `quote_email_events`'in
  `status`/`error` kolonları doğru modeldir; `order_email_events` ve `shipping_email_events`
  bugün yalnız başarıyı yazdığı için **"gitmedi" sorusunu cevaplayamıyor** (bu tespit projenin
  kendi migration yorumunda da yazılı: `20260817200000_quote_request_notification.sql:28-32`).

## B4 — Sessizlik yasağı

Bildirim gönderimi **best-effort** olabilir — statüyü geri almaz, siparişi iptal etmez. Ama
**görünmez olamaz**. Bugün ölçülen üç sessizlik noktası:

1. `iyzico-callback:337` — `catch { /* ignore */ }`. Ödeme onay e-postası hiç gitmese kimse
   bilmez.
2. `orderStatusService.ts` — `catch {}` (yorum: "yutulur — bildirim hatası statüyü geri almaz").
   Gerekçe doğru, **sonucu eksik**: yutulan hata hiçbir yere yazılmıyor.
3. `order-confirmation:207` — defter yazımı da `try/catch` içinde ve gönderimden SONRA.
   Yani gönderim başarılı, defter yazımı başarısız olursa kayıt hiç doğmaz.

**Kural:** yutulan her bildirim hatası **en az bir** kalıcı ize dönüşür — defter satırı
(`status='failed'` + `error`) ya da Sentry. "Yutuldu ve kayboldu" kabul edilmez.
İlgili: `docs/standards/edge-function-security-standard.md` (fail-closed dikiş yerleri).

## B5 — Kiracı kapsamı

CLAUDE.md Mutlak Kural 12: her okuma/yazma tenant-scoped. Bildirim defterleri buna dahildir.

**ÖLÇÜLDÜ (canlı DB, 2026-08-20):** `shipping_email_events`'te `tenant_id` **VAR**;
`order_email_events`'te **YOK**. Üstelik `iyzico-callback:329` çağrı gövdesinde `tenant_id`
gönderiyor, `order-confirmation` ise deftere yazarken bu alanı **düşürüyor** (satır 211'deki
gövdede yok). Yani bilgi elde var, kaydedilmiyor.

**Kural:** her bildirim defteri `tenant_id` taşır ve gönderen uç onu yazar. Kiracı sınırı
olmayan bir defter, çok-kiracılı kurulumda "bu müşteriye ne gönderdik" sorusunu cevaplayamaz.

## B6 — Dil ve içerik

- Müşteriye giden her metin **sözlükten** gelir; uç içinde gömülü Türkçe/İngilizce dize
  yazılmaz (CLAUDE.md Kural 7). Bugün `order-confirmation` konu ve gövdeyi **gömülü Türkçe**
  üretiyor (satır 167 ve 176-183) — cetvele göre ihlal, onarımı ayrı iş.
- Bildirim dili **siparişin dilinden** türetilir, gönderim anındaki arayüz dilinden değil.
- Para birimi asla dilden türetilmez (INV-CURRENCY-1, `src/i18n/format.ts`).

## B7 — ÇELİŞEN-MEVCUT

Bu cetvel yazılırken bulunan, **cetvelle çelişen mevcut durum** — hiçbiri bu PR'da
onarılmıyor, hepsi ayrı iş emri ister:

| # | Çelişki | Yer | Sahip şerit |
|---|---|---|---|
| 1 | ~~`order-confirmation` mükerrerlik koruması olmadan gönderiyor~~ → **`#711` ile çözüldü** (DB damgası + UNIQUE); uç hâlâ kendi başına çağrılırsa korumasız | `order-confirmation/index.ts` | EDGE |
| 2 | `shipping-notification` ve `delivery-notification` de deftere yazıp okumuyor | aynı klasör | EDGE |
| 3 | `shipping_idempotency` tablosu **yalnız yazılıyor, hiç okunmuyor** — adı "idempotency" olan tablo sıfır idempotency veriyor (`admin-update-shipping:287-298`, dosyada başka geçiş yok) | EDGE | EDGE |
| 4 | `order_email_events`'te `tenant_id` yok | canlı DB + migration | EDGE/ALTYAPI |
| 5 | ~~`order_email_events` başarısızlığı yazmıyor~~ → **`#711` ile çözüldü** (`status`/`error`/`kind`). `shipping_email_events` için **hâlâ geçerli** | canlı DB | EDGE |
| 6 | `order-confirmation` metinleri gömülü Türkçe | satır 167, 176-183 | kural I18N · **dosya EDGE** |
| 7 | `delivery-notification` kaydını kargo defterine yazıyor | satır 162 | EDGE |

**Sahiplik notu:** 6 numaralı kalemin *kuralı* I18N'e (sözlük + CLAUDE.md Kural 7), *dosyası*
EDGE'e aittir (`supabase/functions/**` EDGE'in şerit talebinde). Onarım tek şeritte bitmez;
sözlük anahtarlarını I18N verir, uca EDGE işler. Bunu ayrı yazıyorum çünkü tabloda tek bir
şerit adı yazmak işi yanlış adrese yollar.

**Not:** 3 numaralı bulgu bu cetvelin kapsamının dışında (kargo yazma işlemi, bildirim değil)
ama **aynı sınıfın** en keskin örneği olduğu için buraya yazıldı: defterin adı korumayı
kanıtlamaz, **okunduğu yer** kanıtlar.

## B8 — Kapılar

**Kapı ilkesi (CLAUDE.md + `docs/standards/collaboration-protocol.md`):** yeni kapı mevcut
ihlalle AÇILMAZ. §B7'deki yedi çelişki bugün canlıdır; bu yüzden bu sürümde **mükerrerlik
kapısı yazılmıyor** — kapı, EDGE onarımı indikten sonra gelecek (§B9-3). Bugün açılan iki
kapı, bugün YEŞİL olan ve gelecekteki sessiz genişlemeyi durduran kapılardır.

### B8.1 — INV-NOTIFY-1 · envanter bütünlüğü

`supabase/functions/**` altında e-posta sağlayıcısına gönderim yapan (`api.resend.com`) her uç,
bu cetvelin **§B2.1 tablosunda** adıyla geçmek zorundadır.

**Yakaladığı kusur:** yeni bir bildirim ucu eklenir, cetvele işlenmez, ve "bildirimlerimiz
neler" sorusunun cevabı sessizce eksilir. Bugünkü kusur bunun ta kendisiydi:
`order-confirmation` hiçbir cetvelde yazılı olmadığı için var olduğu hâlde "yok" sanıldı.

**İkinci kol — DEVREDEN uçlar (2026-08-23 eklendi).** Kapının ilk sürümü kapsamı
**sağlayıcı adına** bağlıyordu; gönderimi başka bir uca devreden bir uç bu ölçüye görünmez
oluyordu. Kapı haklı olarak susuyordu ama cetvel "hepsi burada" diyordu — ve değildi.
Ölçüldüğünde boşluk tek vaka değil, **sistemin yarısı** çıktı (6 gönderici, 6 devreden).
İkinci kol §B2.1.b kuralını zorlar: bir gönderici ucu **geçişli olarak** tetikleyen her uç
cetvelde adıyla geçmelidir. Bulgu EDGE'den geldi (`order-paid-webhook`), ölçüm I18N'de.

**Üçüncü kol — körlüğün alarmı.** İkinci kol hedef adını kaynak metinden okur. Hedef
değişkenden üretilirse tarama **sessizce** körleşir; o yüzden dinamik `functions/v1` çağrısı
kapıyı **kırmızı** yapar. Bugün böyle bir çağrı yok (28 ucun tamamı ölçüldü) — kol, ileriye
dönük bir alarmdır: kural kör kalacaksa bunu haber vererek kalsın.

**İki taraflı kanarya:** ikinci kol, devreden uç sayısı **sıfıra düşerse de** kırmızı olur.
Sıfır, "devreden kalmadı" değil "tarama bozuldu" demektir (geçişli kapanış çöktü ya da çağrı
biçimi değişti). Kanaryasız bir tarama, hiçbir şey bulamadığı için değil **hiçbir yere
bakmadığı** için yeşil olabilir.

### B8.2 — INV-NOTIFY-2 · durum kapsam tablosu tam olmalı

`venthub_orders.status` CHECK sözlüğündeki **her değer** §B2.3 tablosunda bir satıra sahip
olmalıdır ("yok" yazmak geçerli cevaptır, satırın olmaması değildir).

**Yakaladığı kusur:** yeni sipariş durumu eklenir, bildirim kararı hiç verilmez; kimse fark
etmez çünkü "karar verilmedi" ile "bildirim yok" ayırt edilemez hâle gelir.

### B8.3 — Kapsam kanaryası

Her iki kapı da, taramasının gerçekten dosya gördüğünü kanıtlayan bir kanarya taşır (ölçülen
uç sayısı > 0, ölçülen durum sayısı >= 6). Kanarya olmadan bir tarama, hiçbir şey bulamadığı
için değil **hiçbir yere bakmadığı** için yeşil olabilir.

## B9 — ÖLÇÜLEMEDİ (dürüst boşluklar)

1. **`quote_email_events`'te `tenant_id` var mı** — canlı sorguya bu tablo dahil edilmedi;
   şema dosyasında da yok. **Ölçülmedi**, varsayılmadı.
2. **Gerçek mükerrer gönderim vakası yaşandı mı** — Resend tarafındaki gönderim geçmişi bu
   oturumdan sorgulanamadı. Kusur **yapısal olarak** kanıtlı (koruma yok), **vaka olarak**
   ölçülmedi.
3. **SMS/WhatsApp kanalı** — `src/utils/whatsapp.ts` kullanıcıyı WhatsApp'a yönlendiren bir
   bağlantı üretir; bu bir **bildirim gönderimi değildir**. Twilio üzerinden kendiliğinden
   giden bir mesaj bu taramada bulunamadı; kanalın canlı olup olmadığı **ölçülmedi**.

## B10 — Kaynaklar

1. **Resend — Idempotency Keys.** `Idempotency-Key` başlığı, 24 saat ömür, 256 karakter
   sınırı, `409 invalid_idempotent_request` / `409 concurrent_idempotent_requests` davranışı.
   <https://resend.com/docs/dashboard/emails/idempotency-keys> ·
   <https://resend.com/docs/api-reference/emails/send-email>
2. **Medusa — Notification modülü veri modeli** (kod düzeyinde okundu):
   `idempotency_key: model.text().unique().nullable()`, `status` (varsayılan `PENDING`),
   `original_notification_id`, `trigger_type`. Yani olgun bir e-ticaret çekirdeği
   idempotency anahtarını **modelin kendisine** koyuyor, çağıran koda bırakmıyor.
   `medusajs/medusa` · `packages/modules/notification/src/models/notification.ts`
3. **Proje içi referans uygulama:** `supabase/migrations/20260817200000_quote_request_notification.sql`
   (damga + başarısızlık yazan defter) ve `supabase/functions/quote-notification-webhook/index.ts`
   (satır 107 oku · 118 vazgeç · 172 damgala).

## B11 — v1.1 kaydı: cetvel kendi konusunda BİR COMMIT BAYAT doğdu

v1.0'ın ölçüm tabanı `57e82a4d` idi. Cetvel `d61f5295` olarak master'a indi — ve **bir önceki
commit** `d542a1d2` (`#711`, EDGE) tam da bu cetvelin çekirdek konusunu değiştirmişti.
Yani belge, yayımlandığı anda kendi ana iddiasında güncelliğini yitirmişti.

**`#711` ne getirdi** (canlı DB'den doğrulandı, migration prod'a inmiş):

| Ne | Nerede |
|---|---|
| `venthub_orders.paid_at` — **olgu** damgası | `20260820140000_order_paid_notification.sql:52` |
| `venthub_orders.paid_email_sent_at` — **idempotans** damgası | aynı dosya, satır 55 |
| `order_email_events.status` · `.error` · `.kind` | satır 88-94 |
| `uq_order_email_events_sent_once` — kalıcı UNIQUE | satır 150 |
| `trg_stamp_order_paid_at` · `trg_notify_order_paid` (pg_net) | satır 172, 238 |

Bu, §B3'ün **ilk uygulamasıdır**: veriye bağlı tetik + göndermeden önce okunan kalıcı damga.
EDGE'in getirdiği ve v1.0'da yalnız ima edilen ayrım şudur ve buraya adıyla alınıyor:

> **Olgu damgası ile idempotans damgası AYNI ŞEY DEĞİLDİR.** `paid_at` "bu sipariş ödendi"
> der; `paid_email_sent_at` "bunun e-postası gitti" der. Tek kolona ikisini birden yükleyen
> tasarım, e-posta başarısız olduğunda ya olguyu yalanlar ya da tekrarı açar.

### Bundan çıkan cetvel kuralı

**Bir cetvelin ölçüm tabanı, yayımlandığı andaki master OLMAK ZORUNDA DEĞİLDİR — ama tabanı
YAZILI olmak ve yayımdan önce SON KEZ kontrol edilmek zorundadır.** Bu belge tabanını yazmıştı
(§KAYNAK/CETVEL), o yüzden bayatlık *görünür* oldu ve bir saat içinde düzeltilebildi. Tabanı
yazmayan bir cetvel aynı durumda sessizce yanlış kalırdı.

**Hâlâ geçerli olanlar** (v1.1'de yeniden ölçüldü): `order_email_events`'te `tenant_id` **yok**
(§B5) · `shipping_idempotency` yalnız yazılıyor, hiç okunmuyor (§B7-3) · `delivery-notification`
kaydını kargo defterine yazıyor (§B7-7) · `shipping_email_events` başarısızlığı yazmıyor.

---

**Sürüm:** v1.1 · 2026-08-20, **iddiaları 2026-08-22'de yeniden ölçüldü** ·
ölçüm tabanı `origin/master` = `ea316814` + canlı Postgres.

> **Niçin yeniden ölçüldü:** bu düzeltme iki gün gönderilmeden bekledi. "İki gün önce
> doğruydu" bugün doğru olduğunu göstermez — belgenin kendi §B11'i tam da bunu anlatıyor.
> Canlı DB'den 08-22'de doğrulandı: `order_email_events` → `status`/`error`/`kind` **var**,
> `tenant_id` **hâlâ yok**; `uq_order_email_events_sent_once` **var**; `venthub_orders` →
> `paid_at` ve `paid_email_sent_at` **var**. §B5'teki kiracı boşluğu ve §B7'deki kalemler
> **aynen geçerli**.
(v1.0 tabanı `57e82a4d` idi ve **kendi konusunda bir commit bayat doğdu** — bkz. §B11.)
