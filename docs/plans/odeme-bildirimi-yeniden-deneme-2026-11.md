# Ödeme bildirimi yeniden deneme — tasarım (karne 2026-11 §4 P7)

**Durum:** TASLAK, yalnız tasarım (kod ve migration yok). Uygulama ayrı iş; dilimler §6.
**Kanban:** OPS-225 · **Kaynak:** `docs/audits/guvenlik-karnesi-2026-11.md` §4 satır P7 ("yazılamaz: önce `failed` kayıtlarını süpüren iş tasarlanmalı").
**KAYNAK/CETVEL:** `docs/standards/notification-standard.md` (§B3 mükerrerlik, §B4 sessizlik yasağı, §B5 kiracı kapsamı),
`docs/standards/edge-function-security-standard.md` §3.5 (webhook HMAC + replay guard, fail-closed), CLAUDE.md kural 11, 12, 13, 14.
Bu belge cetvelleri değiştirmez. Yeni cetvel gerekmiyor; uygulama dilimi notification-standard §B8'e kapı ekler (§6 dilim 2).
**Şema tabanı:** `supabase/baselines/2026-11-03_public_schema.sql` (aşağıda "baseline"). Kod referansları `master @ 8b73c70`.
**ÖNCEKİ ÇALIŞMA:** `docs/plans/rec368-eposta-defter-plani-2026-09-30.md` (defter `attempt/sent/failed` modeli, M0 canlı),
`supabase/migrations/20260820140000_order_paid_notification.sql` (T137-VH: tetik + uç), `20261031230000_webhook_imzali_gonderim.sql`
(DB→rota imzalı gönderim deseni). Paralel açık PR'lar: [#2271](https://github.com/peckop/venthub-hvac-esite/pull/2271)
(callback, P1/P3/P5; `paid` geçişini tek seferlik yapar — bu belgenin tetik varsayımını güçlendirir) ve
[#2273](https://github.com/peckop/venthub-hvac-esite/pull/2273) (P2/P11; eşleşmeyen ödemeli sipariş iptal edilmez). İkisi de
`order-paid-webhook`'a ve `notify_order_paid`'e dokunmuyor (dosya listeleri okundu). Kanban ve sage bu oturumda bağlanamadı:
oradaki önceki kayıt **ölçülmedi**.

## 0. Tek cümle

Ödeme onayı e-postası `paid_at` ilk kez yazılınca **tek bir** `net.http_post` ile istenir; istek düşerse ya da uç hata dönerse
kimse tekrar istemez. Uçtaki yorumlar "pg_net tekrar dener" diyor, ama pg_net tekrar denemez.

## 1. Bugünkü akış (dosya:satır)

| Adım | Ne olur | Yer |
|---|---|---|
| 1 | Callback siparişi `payment_status='paid'` yapar | `supabase/functions/iyzico-callback/index.ts:417` |
| 2 | BEFORE UPDATE tetiği `paid_at := now()` damgalar (yalnız `paid`'e geçişte ve `paid_at` boşsa) | baseline `:3777-3789` (`stamp_order_paid_at`), tetik `:7482` |
| 3 | AFTER UPDATE tetiği yalnız `old.paid_at IS NULL AND new.paid_at IS NOT NULL` iken ateşlenir | baseline `:7450` (`trg_notify_order_paid`) |
| 4 | `notify_order_paid` Vault'tan sır ve URL okur; biri yoksa `RAISE WARNING` ile **atlar** | baseline `:2949-2973` |
| 5 | `net.http_post(url, body={order_id, tenant_id}, headers={x-webhook-secret, x-timestamp}, timeout 5000 ms)`; dönen `req_id` hiçbir yere yazılmaz | baseline `:2977-2986` |
| 6 | Uç: sır (HMAC `x-signature` ya da düz `x-webhook-secret`) → zorunlu `x-timestamp` (±5 dk) → sonra DB | `order-paid-webhook/index.ts:107-122` |
| 7 | Siparişi `id` ile okur; okuma hatası 503, yok 404, `paid` değil 409 | `index.ts:139-152` |
| 8 | `paid_email_sent_at` doluysa 200 `already_sent` (Katman 2 idempotans) | `index.ts:158-160` |
| 9 | Deftere `attempt` satırı (alıcı boşsa satır yok, Sentry) | `index.ts:174-199` |
| 10 | Gönderimi `order-confirmation`'a devreder; o da Resend'e **`Idempotency-Key` olmadan** gönderir | `index.ts:205-213`; `order-confirmation/index.ts:196-199` |
| 11 | Hata: defter `failed` + **500** döner, yorum "pg_net tekrar dener" | `index.ts:225-252` |
| 12 | Başarı: `paid_email_sent_at` koşullu damga (`is null`), defter `sent` | `index.ts:259-296`; tekil dizin `uq_order_email_events_sent_once` baseline `:7206` |

Ek gözlemler:

- `order-confirmation` başarıdan sonra deftere **ikinci** bir satır yazar: `kind` ve `status` boş, `try {} catch {}` içinde
  (`order-confirmation/index.ts:236-242`). Bir başarılı gönderim bugün iki satır bırakır. Süpürücü sorguları bu yüzden
  `kind = 'order_paid'` süzmelidir.
- `order_email_events`'te `tenant_id` yok (baseline `:5095-5107`); kiracı yalnız `order_id → venthub_orders` FK'siyle bulunur
  (notification-standard §B5 bu boşluğu zaten yazıyor).
- Uçtaki HMAC yolu yalnız ham gövdeyi imzalar (`index.ts:75-88`); `x-timestamp` imzanın içinde değil. Tetik bugün HMAC yolunu
  hiç kullanmıyor, düz sır başlığı gönderiyor (baseline `:2981`). Yani yakalanan bir istek 5 dakika içinde aynen tekrarlanabilir;
  zararı idempotans damgası sınırlar (§3 replay satırları).
- pg_net isteği `net.http_request_queue`'ya yazılır ve işlemle birlikte commit olur (pg_net belgesine göre; canlıda **ölçülmedi**).
  Callback işlemi geri alınırsa istek de gitmez. Bu doğru davranış.
- pg_net yanıtları `net._http_response`'ta tutulur ve süre dolunca silinir; varsayılan süre pg_net belgesine göre 6 saat. Canlıdaki
  `pg_net.ttl` ayarı **ölçülmedi**.

## 2. Hata senaryoları ve bugünkü sonuçları

"Sonuç" sütunu bugün müşterinin ne yaşadığıdır. Hiçbir satırda yeniden deneme yok.

| # | Senaryo | Uç ne döner | İz | Müşteri sonucu |
|---|---|---|---|---|
| H1 | Vault'ta `order_paid_webhook_secret`/`_url` yok | istek hiç gitmez | yalnız Postgres log'unda WARNING (`:2971`) | e-posta yok, defter satırı yok |
| H2 | pg_net bağlantı/DNS hatası | — | `net._http_response.error_msg`, 6 saat sonra silinir | e-posta yok, defter satırı yok |
| H3 | pg_net kuyruğu 5 dk'dan fazla gecikir | 401 `stale_timestamp` (`index.ts:122`) | `_http_response` 401 | e-posta yok, defter satırı yok |
| H4 | Uç soğuk başlar ya da `order-confirmation` + Resend 5 sn'yi aşar | pg_net 5 sn'de **zaman aşımı** yazar; uç çalışmaya devam eder | `_http_response` timeout; defter büyük olasılıkla `sent` | e-posta **muhtemelen gitti**. Yanıt tablosu bunu "başarısız" gösterir (seçenek B'nin tuzağı) |
| H5 | Sipariş okuması düşer | 503 (`:145`) | defter satırı yok | e-posta yok |
| H6 | `order-confirmation` ya da Resend hata verir | 500 `send_failed` (`:252`) | defter `failed` + `error` | e-posta yok, **tekrar yok** (karne P7'nin tam kendisi) |
| H7 | Uç gönderimle damga arasında ölür | — | defter `attempt` takılı kalır | e-posta gitmiş olabilir; damga boş |
| H8 | E-posta gitti, damga yazılamadı (`:266-271`) | 200 | defter `sent`, `paid_email_sent_at` boş | doğru; ama damgaya bakan bir süpürücü **ikinci e-posta** yollar |
| H9 | `customer_email` boş (`:174-177`) | `order-confirmation` kendi alıcısını bulur ya da düşer | Sentry; defter satırı yok | duruma göre |
| H10 | Bildirim gelmeden sipariş iade edildi | 409 `order_not_paid` (`:150-152`) | defter satırı yok | e-posta yok: **doğru** davranış, tekrar edilmemeli |
| H11 | Sır yanlış/rotasyon yarım | 401 (`:115`) | `_http_response` 401 | e-posta yok, defter satırı yok |

Sonuç: hatalı satırların yarısından fazlası (H1, H2, H3, H5, H11) **defterde hiç iz bırakmıyor**. Yalnız `failed` satırına bakan
bir çözüm bunları göremez. Canlıda bu senaryoların kaç kez yaşandığı **ölçülmedi** (canlı DB'ye bu oturumdan bağlanılmadı;
REC-368 09-30 ölçümünde `order_email_events` 0 satırdı).

## 3. Seçenekler

Ortak kurallar her seçenek için geçerli:

- **İdempotans iki katmanlı kalır** (notification-standard §B3.1): Katman 2 `paid_email_sent_at` + `uq_order_email_events_sent_once`;
  Katman 1 bugün eksik, Resend `Idempotency-Key: siparis-onay/<order_id>` eklenmeli (§B3.2 anahtar biçimi). H7'yi ancak
  Katman 1 kapatır (24 saat içinde).
- **Yeniden deneme yalnız `payment_status='paid'` iken** yapılır; H10'da uç zaten 409 döner.
- **Tekrar sayısı sınırlı** olur ve sınır aşılınca Sentry alarmı düşer (§B4: sessiz kayıp yasak).

### A — `failed` defter satırlarını süpüren zamanlı iş

pg_cron her N dakikada `order_email_events` içinde `kind='order_paid' AND status='failed'` olan ve aynı sipariş için `sent`
satırı bulunmayan siparişleri seçer, ucu yeniden çağırır.

- **İdempotans:** uç damgaya ve tekil dizine bakar, yeterli. Aynı sipariş için birden çok `failed` satırı birikir; süpürücü
  `order_id`'ye göre tekilleştirmeli.
- **Replay (kural 11):** süpürücü taze `x-timestamp` ile çağırır; uçtaki 5 dk penceresi değişmez.
- **Tenant (kural 12):** defterde `tenant_id` yok; kiracı FK join ile alınır. Faz 2'de bu join her sorguda zorunlu olur.
- **Kapsam:** yalnız H6. H1-H3, H5, H11 satır bırakmadığı için **görünmez**; H7 (`attempt`) de seçilmez.
- **Maliyet:** küçük; tek sorgu + nadir HTTP.
- **Test:** `failed` satırı olan sipariş için süpürücü bir çağrı kuyruğa yazar; `sent` satırı olan için yazmaz.
- **Hüküm:** eksik. Karnenin önerdiği biçim bu, ama §2'deki çoğu yolu kaçırır.

### B — pg_net yanıt tablosunu (`net._http_response`) okuyan süpürücü

Tetik `req_id`'yi bir eşleme tablosuna yazar; süpürücü 2xx olmayan yanıtları bulup tekrar eder.

- **İdempotans:** A ile aynı.
- **Replay / tenant:** A ile aynı; eşleme tablosuna `tenant_id` konabilir.
- **Kapsam sorunları:** (1) H4'te yanıt "timeout" der ama e-posta gitmiştir, yani yanlış pozitif üretir (damga Katman 2 onu durdurur,
  ama sayaç ve alarm yanlış olur). (2) H1'de istek hiç yoktur, satır da yoktur. (3) Yanıtlar TTL ile silinir; süpürücü 6 saatten
  uzun durursa kanıt kaybolur. (4) `_http_response` pg_net'in iç tablosudur; sürüm yükseltmesinde biçimi değişebilir.
- **Ek bedel:** tetiğe yazma ekler (ödeme commit yolu) + yeni tablo.
- **Test:** sahte `net` şemasında yanıt satırı üretip süpürücüyü koşmak; TTL davranışı testte taklit edilemez.
- **Hüküm:** reddedildi. Taşıma katmanının sonucunu ölçer, iş sonucunu değil.

### C — Kuyruk (outbox) tablosu

Tetik HTTP yerine `odeme_bildirim_kuyrugu(order_id PK, tenant_id, deneme, sonraki_deneme_at, son_hata, durum)` satırı yazar;
pg_cron işçisi satırları boşaltır, geri çekilmeyle (backoff) tekrar eder, uç sonucu satıra işler.

- **İdempotans:** `order_id` PK kuyruğa ikinci girişi engeller; uç damgası ve tekil dizin değişmez.
- **Replay:** işçi her çağrıda taze zaman damgasıyla imzalar.
- **Tenant:** kuyrukta `tenant_id NOT NULL`; kural 12 açısından en temiz seçenek.
- **Kapsam:** H1'de satır yine yazılır (Vault sonra düzelir, kuyruk boşalır); H2-H6, H11 kapsanır. H7/H8 için uç tarafı aynı kalır.
- **Bedel:** yeni tablo + RLS + iki fonksiyon + cron; **tetik değişir** (ödeme commit yolunda yazma). İki "doğru kaynak" doğar:
  kuyruk `durum`'u ile `paid_email_sent_at` ayrışabilir. Kuyruk satırının yaşam döngüsü (silme/saklama) ayrıca yazılmalı.
- **Test:** gerçek Postgres testinde tetik → kuyruk satırı; işçi → sahte `net.http_post` çağrısı; başarı → satır kapanır.
- **Hüküm:** sağlam ama bugünkü sorun için büyük; ödeme yoluna yeni bir yazma ekliyor.

### D — Durum tabanlı süpürücü (siparişin kendisine bakan)

Doğru kaynak zaten var: `venthub_orders` satırında `paid_at` dolu ve `paid_email_sent_at` boş = "e-posta borçlu". pg_cron her
10 dakikada bir şu siparişleri seçer ve ucu yeniden çağırır:

```
payment_status = 'paid'
AND paid_at IS NOT NULL
AND paid_email_sent_at IS NULL
AND paid_at <  now() - interval '10 minutes'   -- ilk denemeye yer bırak
AND paid_at >  now() - interval '72 hours'     -- pencere; dışı alarm
AND NOT EXISTS (sent satırı: order_email_events kind='order_paid' status='sent')   -- H8
AND (son order_paid defter satırı yok VEYA 10 dk'dan eski)                        -- iç içe denemeyi önler
LIMIT 50
```

- **İdempotans:** uç değişmeden Katman 2'yi uygular; `NOT EXISTS sent` H8'deki ikinci e-postayı engeller. Katman 1
  (`Idempotency-Key`) H7'yi 24 saat içinde kapatır; 24 saati geçen H7'de at-least-once kabul edilir (uçtaki gerekçe:
  eksik onay mükerrer onaydan pahalı, `index.ts:162-168`).
- **Replay (kural 11):** süpürücü HMAC ile imzalar ve imza zamanı da kapsar (`<ts>.<ham gövde>`, `handle_supabase_webhook`
  deseni, baseline `:2570-2577`). Uç yalnız bu biçimi kabul eder; düz `x-webhook-secret` yolu kaldırılır (§3.5: geçiş modu yok,
  tetik ve süpürücü aynı migration'da birlikte geçer).
- **Tenant (kural 12):** süpürücü global çalışır ama her çağrı tek siparişe aittir ve gövde o satırın `tenant_id`'sini taşır;
  iki kiracının verisi aynı istekte birleşmez. Uç siparişi bugün yalnız `id` ile okuyor (`index.ts:139-143`); dilim 1'de
  `tenant_id` gövdeden alınıp filtreye eklenir (`order-confirmation` zaten böyle okuyor, `order-confirmation/index.ts:125`).
  Faz 2 PARK'ta; global cron bugün kabul, Faz 2'de kiracı başına sınır (karne Y2) ayrıca ölçülür.
- **Deneme sınırı:** ayrı sayaç kolonu yok. Pencere (72 saat) ve aralık (10 dk) üst sınırı verir; H6 gibi satır bırakan
  hatalarda deneme sayısı defterden sayılır ve 5'i geçince o sipariş atlanıp alarm düşer. Satır bırakmayan hatalar (H1-H3, H11)
  bütün siparişleri birlikte etkiler (yapılandırma hatası); bunlar için süpürücü her koşumda "borçlu sipariş sayısı"nı tek alarmda
  raporlar, sipariş başına alarm üretmez.
- **Kapsam:** H1 (Vault düzelince), H2, H3, H5, H6, H11 kapsanır. H4 doğru sonuçlanır (damga dolu, seçilmez). H8 korunur. H10
  seçilmez (`payment_status='paid'` şartı).
- **Maliyet:** tek kısmi dizin (`WHERE paid_at IS NOT NULL AND paid_email_sent_at IS NULL`), 10 dk'da bir küçük sorgu, yalnız borçlu
  sipariş başına HTTP. Sipariş hacmi ve borçlu sayısı **ölçülmedi**; yük, borçlu sayısıyla sınırlıdır (`LIMIT 50`).
- **Test:** §5.
- **Ek bedel:** migration (fonksiyon + dizin + cron + tetik imzası) → kural 13, Recep onayı.

## 4. Öneri: D

Gerekçe:

1. **Doğru kaynağa bakıyor.** "Ödendi ama e-posta gitmedi" bilgisi sipariş satırında zaten var. A ve B, kaydı olan hatalara bakar;
   §2'deki 11 senaryonun 5'i kayıt bırakmıyor. D bu beşini görür.
2. **Ödeme commit yoluna yeni yazma eklemiyor.** C'nin tetiği değiştirmesi, P1-P5 düzeltmelerinin ([#2271](https://github.com/peckop/venthub-hvac-esite/pull/2271))
   yeni sağlamlaştırdığı yola yeni bir başarısızlık noktası ekler. D'de tetik yalnız imza biçimini değiştirir.
3. **Tek doğru kaynak.** C'deki kuyruk `durum`'u ile `paid_email_sent_at` ayrışma riski D'de yok.
4. Kural 14 açısından: A ile D arasındaki fark satır sayısı değil kapsam (5 senaryo); D tam olanı. C ile D arasındaki fark ise
   kapsam değil mimari bedel (yeni tablo, iki doğru kaynak, tetik değişikliği); D yeterli.

C'ye geçiş şartı: bildirim türleri çoğalır (teslim, kargo, iade de aynı süpürücüye bağlanmak isterse) ya da Faz 2'de kiracı başına
deneme sınırı gerekir. O gün ortak kuyruk mantıklı olur; D'nin sorgusu kuyruğun ilk doldurucusu olarak kalabilir.

## 5. Kilit testi

**Ad:** `P7: başarısız ödeme bildirimi süpürücüyle yeniden istenir, başarıdan sonra bir daha istenmez`
**Yer:** `src/__tests__/conformance/odeme-bildirimi-supurucu-pg.test.ts`. Gerçek Postgres'te koşar; desen
[#2271](https://github.com/peckop/venthub-hvac-esite/pull/2271)'deki `siparis-monoton-tetik-pg.test.ts` (migration boş Postgres'e
uygulanır, `VENTHUB_TEST_PG_ZORUNLU=1` iken adres yoksa kırmızı). `net.http_post` sahte bir `net` şemasıyla çağrıları kaydeden
fonksiyona bağlanır; `cron` çağrılmaz, süpürücü fonksiyonu doğrudan koşulur.

Kollar (hepsi zorunlu):

1. `paid`, `paid_at` 30 dk önce, damga boş, defterde `failed` → süpürücü **tam 1** çağrı kaydeder; gövdede doğru `order_id` ve `tenant_id`;
   başlıkta imza `<ts>.<gövde>` üzerinden doğrulanır.
2. Aynı sipariş, defter satırı **hiç yok** (H1/H3 benzeri) → yine **tam 1** çağrı.
3. Damga dolu → **0** çağrı.
4. Damga boş ama `sent` satırı var (H8) → **0** çağrı.
5. `paid_at` 2 dk önce → **0** (ilk denemeye yer).
6. `paid_at` 73 saat önce → **0** çağrı, alarm sayısında görünür.
7. `payment_status='refunded'` (H10) → **0**.
8. Aynı sipariş için 5 `failed` satırı → **0** çağrı, alarm.
9. Son defter satırı 3 dk önce → **0** (iç içe deneme yok).
10. Ard arda iki koşum, arada uç damgayı basmış → ikinci koşum **0**.

**Ayırt edicilik (sabotaj):** süpürücü sorgusundan `NOT EXISTS sent` şartı çıkarılmış kopyada kol 4 kırmızı; `paid_email_sent_at IS NULL`
şartı çıkarılmış kopyada kol 3 kırmızı; imzadan zaman çıkarılmış kopyada kol 1 kırmızı. Sabotaj kolları testin içinde durur.

Uç tarafı ek test (Deno/Vitest, mevcut `order-paid-webhook` test deseniyle): `order-confirmation` 500 → uç 500 ve defter `failed`;
aynı istek ikinci kez başarıyla → tek `sent`, damga dolu; `order-confirmation` çağrısı `Idempotency-Key: siparis-onay/<id>` taşır.

Karnedeki P7 satırının "Kilit" sütunu bu test adıyla güncellenir (dilim 2'nin parçası).

## 6. Uygulama dilimleri

Her dilim ayrı PR, ayrı Kanban kartı.

1. **Uç ve sağlayıcı katmanı (migration yok).**
   `order-confirmation/index.ts:196-199` Resend çağrısına `Idempotency-Key: siparis-onay/<order_id>`; uçta yanlış yorumların
   düzeltilmesi (`index.ts:144`, `:251` "pg_net tekrar dener"); sipariş okumasına `tenant_id` filtresi (`:139-143`); uç HMAC'i
   `<ts>.<ham gövde>` biçimini de kabul eder. Düz sır yolu bu dilimde **kalır**, çünkü tetik onu kullanıyor; kaldırılması dilim 2'de
   tetikle aynı anda olur (geçiş modu açılmaz, iki biçim yalnız tetik değişene kadar birlikte durur ve dilim 2 bunu bitirir).
   Kilit: uç ek testi (§5).
2. **Süpürücü + tetik imzası (migration, kural 13, Recep onayı).**
   `YYYYMMDDHHMMSS_odeme_bildirimi_supurucu.sql`: kısmi dizin; `odeme_bildirimi_supur()` SECURITY DEFINER, `search_path` sabit,
   `REVOKE ALL ... FROM public, anon, authenticated`, yalnız `service_role`; `cron.schedule('odeme-bildirimi-supur', '*/10 * * * *', ...)`
   (`20261101160000_rec294_rate_limits_saklama_suresi.sql:56-70` deseni, pg_cron yoksa WARNING); `notify_order_paid` HMAC imzasına
   geçer; uçtan düz sır yolu kaldırılır. Kilit: §5 testi + iş akışı (Postgres servisi). Karne P7 satırı güncellenir;
   notification-standard §B8'e kapı satırı eklenir.
3. **Gözlem.** Süpürücünün koşum özeti (seçilen, çağrılan, pencere dışı, sınır aşan) Sentry'ye; borçlu sipariş sayısı 0'dan büyükse
   tek alarm. `order-confirmation`'ın kind/status'suz ikinci defter satırının kaldırılması (H dışı ama sayımı bozuyor;
   notification-standard §B4 maddesi 3) bu dilimde ya da ayrı kartta.
4. **Canlı doğrulama (birleşme sonrası).** `cron.job` kaydı, ilk koşumların `cron.job_run_details` sonucu, borçlu sipariş sayısı ölçülür
   ve karneye yazılır.

## 7. Ölçülmedi

- Canlıda borçlu sipariş (paid, damga boş) sayısı ve H1-H11'in gerçek sıklığı.
- Canlı `pg_net.ttl` ayarı ve pg_net kuyruk gecikmesi (H3'ün olasılığı).
- Uç + `order-confirmation` + Resend süresinin 5 sn'yi aşma sıklığı (H4).
- Canlıda `order-housekeeping` ve `release-expired-reservations` cron kayıtları (migration'larda zamanlama yok; süpürücü takvimi
  onlarla çakışmasın diye bakılmalı).
- Resend `Idempotency-Key` davranışı bu depoda hiç denenmedi; bilgi notification-standard §B3.1 ve §B10-1 kaynağına dayanıyor.
