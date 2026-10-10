# REC-368 — E-posta defteri: her gönderim başarıda da başarısızlıkta da iz bırakır

**Durum:** PLAN (kod yok). Bağımsız çürütme (plan-challenger) sonucu §9'a işlenir; OPS onayı olmadan kod başlamaz.
**Yöneten cetvel:** `docs/standards/notification-standard.md` v1.1 — §B3.3 (defter her iki hâlde satır bırakır),
§B4 (sessizlik yasağı), §B5 (kiracı kapsamı), §B8 (kapılar). Migration için `create-migration` skill'i
(damga 14 hane, geri alma satırı, INV-MIGRATION-3 SQL kalitesi). Bu plan cetveli DEĞİŞTİRMEZ; §B8'e bir kapı ekler (§6).
**Kayıt:** REC-368 altında alt iş (Linear ücretsiz sınırı dolu: yeni kayıt açılamaz, yorum olarak yazılır).

## 1. Sorun (Recep dili)

Satış açıldığında "müşteriye e-posta gitti mi" sorusunun kanıtı bugün yalnız üç e-posta türünde var. İade
bildirimi, sipariş onayı ve sistem (iç) bildirimleri ya hiç iz bırakmıyor ya da yalnız başarıyı, hatayı yutarak yazıyor.
Ayrıca iade bildirimi iki ayrı yerden tetiklendiği için müşteriye aynı e-posta iki kez gidebilir ve bunu ne durduruyor ne kaydediyor.

## 2. Ölçüm (canlı katalog + `origin/master` a5024b097, salt okuma, 09-30)

| Uç | Deftere yazar | Hata görünür mü | Göndermeden önce okur mu | Çağıranlar |
|---|---|---|---|---|
| `order-paid-webhook` | `order_email_events` (`attempt`→`sent`/`failed`, kind `order_paid`) | evet | evet (tetik + damga) | DB tetiği |
| `delivery-notification` | `order_email_events` (`attempt`, kind var) | evet | hayır | sunucu |
| `quote-notification-webhook` | `quote_email_events` (`sent`/`failed`) | evet | evet | sunucu + istemci |
| `shipping-notification` | `shipping_email_events` (yalnız başarı); hata `admin_audit_log`'a | evet (audit) | hayır | `admin-update-shipping` |
| `order-confirmation` | `order_email_events`, **kind ve status YOK**, gönderimden SONRA, `try {} catch {}` içinde | **hayır** | hayır | `order-paid-webhook`, `iyzico-callback` |
| `return-status-notification` | **HİÇBİR deftere yazmaz** | **hayır** (hata 500 döner, çağıran `catch {}` ile yutar) | hayır | `returns-webhook` (sunucu) **ve** `ReturnsTableBody.tsx:518,694` (yönetici ekranı) |
| `notification-service` | **HİÇBİR deftere yazmaz** (e-posta, SMS, WhatsApp) | **hayır** | hayır | `stock-alert`, `QuotesTableBody.tsx:346` |

Tablo yapısı (canlı):

- `order_email_events`: 0 satır. `order_id NOT NULL` → `venthub_orders(id) ON DELETE CASCADE`; `status` CHECK (`attempt|sent|failed|NULL`);
  tekil dizin `uq_order_email_events_sent_once (order_id, kind) WHERE status='sent'`; RLS yalnız `service_role`; `tenant_id` YOK.
- `venthub_returns`: bir siparişe **birden fazla iade açılabilir** (`order_id` üzerinde tekil kısıt YOK; yalnız `id` PK).
  Durumlar: `requested|approved|rejected|in_transit|received|refunded|cancelled`. `order_id NOT NULL`, `tenant_id NOT NULL`.
- `stock-alert` bu hafta susuyor ama **kusur değil**: REC-376 teklif kipindeki ürünleri bilerek süzüyor (cron her gün 200, işlenen uyarı 0; 09-30 ölçüldü).

## 3. Neden `(sipariş, tür)` anahtarı iade için YETMEZ

Mevcut tekil dizin `(order_id, kind)` ve `kind = 'return_approved'` yazılırsa: aynı siparişin İKİNCİ iadesinin "onaylandı"
e-postası ya dizin tarafından reddedilir ya da göndermeden-önce-oku adımı onu "zaten gitti" sanıp atlar. Yani meşru bir
e-posta sessizce kaybolur — §B4'ün yasakladığı sınıfın tam kendisi.

Seçenekler:

| Seçenek | Ne yapar | Migration | Karar |
|---|---|---|---|
| A | `kind='return_<durum>'`, anahtar `(sipariş, tür)` | yok | **REDDEDİLDİ** — ikinci iade e-postasını kaybettirir |
| B | `kind='return_<durum>:<return_id>'` (kimlik tür adının içinde) | yok | yedek — çalışır ama tür adı kimlik taşır, sorgu `LIKE` ister |
| C | `order_email_events.ref_id uuid` (nullable) + tekil dizini `(order_id, kind, coalesce(ref_id, sıfır-uuid)) WHERE status='sent'` olarak DEĞİŞTİR | **var** | **ÖNERİ (kök çözüm)** — tablo boş, dizin değişimi risksiz |

## 4. Tasarım (Öneri C)

**M1 — tek migration PR'ı (Recep kapısı, migration = prod):**

1. `alter table order_email_events add column if not exists ref_id uuid;` (iade için `return_id`; diğer türlerde NULL).
2. Tekil dizini değiştir: eski `uq_order_email_events_sent_once` düşer, yenisi `(order_id, kind, coalesce(ref_id, '00000000-0000-0000-0000-000000000000'::uuid)) WHERE status='sent'`.
   Mevcut davranış korunur: `ref_id` NULL olan türler (sipariş ödendi, teslim) eskisi gibi sipariş başına bir kez.
3. Yeni tablo `system_email_events` (siparişe bağlı olmayan iç bildirimler: stok uyarısı, teklif yönetici bildirimi):
   `id, tenant_id NOT NULL (FK tenants, kural 12), kind, email_to, subject, provider, provider_message_id, status CHECK, error, ref_type, ref_id, created_at`;
   RLS: **yalnız `service_role`** (diğer defterlerle aynı; yetkiyi `user_profiles.role`'den okuyan politika YAZILMAZ — REC-442 bulgusu).
4. Geri alma satırı migration'ın başında yorum olarak; iki nesne de boş olduğu için geri alma veri kaybettirmez.
5. `CASCADE` KALIR: sipariş silinirse defter satırı da gider. Gerekçe: KVKK silme talebinde e-posta adresi (kişisel veri) de silinmeli; defter delil
   ihtiyacı sipariş yaşadığı sürece vardır. `system_email_events` siparişe bağlı olmadığı için etkilenmez.

**A — kod PR'ı (M1 birleşip canlıya uygulandıktan SONRA; edge yayını = Recep'in kendi sözü):**

1. `return-status-notification`: `attempt` satırı (kind `return_<durum>`, `ref_id=return_id`) → gönder → `sent`/`failed` + `error`;
   göndermeden ÖNCE `(order_id, kind, ref_id)` için `sent` satırı varsa gönderme, `{ skipped: 'already_sent' }` dön (§B3.1 katman 2).
   Bu, iki çağıranın (webhook + yönetici ekranı) çift e-posta sorununu çözer.
2. `returns-webhook`: `catch {}` ve `customerEmail && customerName` sessiz atlama → atlanırsa deftere `failed` satırı (`error: 'alici_eksik'` / `'cagri_hatasi'`).
   Ürün sorusu (bu planın dışında): adı boş müşteriye e-posta hiç gitmemeli mi, "Merhaba" ile gitmeli mi.
3. `order-confirmation`: eski satır `kind='order_confirmation'`, `status` ile yazılır, hata yutulmaz (`console.error` + Sentry, §B4).
4. `notification-service`: her gönderim `system_email_events`'e `attempt`→`sent`/`failed`; SMS ve WhatsApp de aynı deftere (`kind` ve kanal alanıyla) — kapsam kararı §7.
5. `ReturnsTableBody.tsx` DEĞİŞMEZ (URUN/ADMIN alanı); tekrar koruması uçta olduğu için gerekmez.

## 5. Ne değişir, ne değişmez

- Müşterinin aldığı e-posta metni, konu, gönderici: DEĞİŞMEZ. Yalnız kayıt ve tekrar koruması eklenir.
- Mevcut tetikler (`order_paid`), `paid_at` damgası, sipariş durum akışı: dokunulmaz.
- Kendiliğinden yeni e-posta üretilmez; tekrar koruması yalnız ikinciyi engeller.

## 6. Kapı (§B8'e INV-NOTIFY-3)

Evren tabanlı konformans testi: `supabase/functions/**` altında `api.resend.com` çağıran HER dosya, bir defter yazımı (`order_email_events`,
`shipping_email_events`, `quote_email_events`, `system_email_events`) içermek ya da gerekçesiyle birlikte açık bir muaf listesinde durmak zorundadır.
Evren: `api.resend.com` içeren dosyalar (elle liste DEĞİL). Sabotaj kolları: (a) defter yazımı silinirse kırmızı, (b) muaf listesine gerekçesiz dosya girerse kırmızı,
(c) yeni bir dosya `api.resend.com` çağırıp deftere yazmazsa kırmızı.

## 7. Açık kararlar ve ölçülecekler (kod öncesi)

1. **ÖLÇÜLDÜ (09-30):** `ReturnsTableBody.tsx:518` tekli, `:694` toplu durum değişimi; ikisi de "durum değişti" olayı, "yeniden gönder" düğmesi YOK.
   Yönetici ekranı iade satırını doğrudan yazıyor ve ayrıca uç çağırıyor; `returns-webhook` aynı değişiklik için ikinci kez çağırıyorsa çift e-posta oluşur.
   İkisinin aynı değişiklik için ARDIŞIK çalışıp çalışmadığı ölçülmedi — tekrar koruması bunu bilmeden de güvenli kılar. Yeniden gönderme ihtiyacı doğarsa ayrı iş.
2. **ÖLÇÜLDÜ (09-30):** `order-confirmation`'ın tek canlı çağıranı `order-paid-webhook` (satır 158); `iyzico-callback:368` yalnız "eski hal" yorumu. Yani
   bir e-posta için şu an İKİ satır doğuyor: `order-paid-webhook`'un `attempt/sent` satırı (kind `order_paid`) ve `order-confirmation`'ın eski, kind/status'suz satırı.
   §4/3'teki karar çürütmede sorulacak: eski satırı düzeltmek mi, yoksa `order-confirmation` deftere yazmayı bırakıp tek sahibin `order-paid-webhook` olması mı
   (bu durumda INV-NOTIFY-3 muaf listesine gerekçeyle girer). Doğrudan HTTP ile çağrılırsa iz kalmaması riski çürütücüye açık soru.
3. **Karar (OPS):** SMS/WhatsApp `system_email_events`'e mi yazılsın, yoksa bu plan yalnız e-postayla mı sınırlı kalsın (öneri: tablo adı `system_notification_events`, kanal kolonuyla). Bu plan e-posta odaklı; ad kararı çürütmeden sonra.
4. **Karar (Recep, ticari):** KVKK saklama süresi — defter `email_to` (kişisel veri) tutar; süre sınırı bugün yok. Kapsam dışı, ayrı kayıt önerilir.

## 8. Sıra ve kapılar

1. Bu plan → plan-challenger → OPS.
2. M1 PR (migration, `Kayitsiz:` satırı ile) → CI yeşil → **Recep sözü** ("M1'i birleştir") → canlıda ölç (dizin, kolon, tablo, RLS, geri alma denemesi kopyada).
3. A PR (kod, migration yok, edge yayını) → CI yeşil → **Recep sözü** → canlıda yazmasız ölçüm.
4. Şema tabanı M1'den sonra tazelenir (ADMIN/ARAÇ ile koordinasyon; ikinci taban PR'ı açılmaz).

## 9. Bağımsız çürütme sonucu (plan-challenger, 09-30) ve planın REVİZYONU (v2)

**Hüküm: KOŞULLU.** Yön doğru; ama plan §2'de "order-paid-webhook deftere yazar" diye ÖLÇÜLMEMİŞ bir varsayım taşıyordu. Aşağıdaki maddeler §4'ün yerine geçer; çelişen yerde bu bölüm kazanır.

### 9.1 KRİTİK — bugün defter yazımları hiç çalışmıyor (yeni ön adım M0)

`order_email_events.email_to` ve `subject` NOT NULL ve varsayılansız; `order-paid-webhook` satır 149/184/219'daki insert'ler bunları vermiyor.
supabase-js hata FIRLATMAZ, `{ error }` döner; `try {} catch {}` hiçbir şey yakalamaz, `denemeId` sessizce `null` kalır. Tablo 0 satır, ödenmiş sipariş 0: yol hiç koşmadı, o yüzden bugüne dek görünmedi.

- **M0 (ön adım, M1'den ÖNCE ve AYRI PR):** yazıcıları düzelt: her insert NOT NULL kolonları doldurur (`email_to`, `subject`), her yazımda `.error` kontrol edilir → `console.error` + Sentry; gönderimin sonucunu DEĞİŞTİRMEZ (defter hatası 5xx döndürmez: pg_net tekrarlar, müşteriye ikinci e-posta gider).
  Bu, migration değil; edge yayını = Recep sözü.
- M1'e `email_to` için nullable yapma EKLENMEZ (yazıcıyı düzeltmek doğru yol; alıcısı bilinmeyen satır `system_email_events`/audit'e gider). `A-2 alici_eksik` satırı için `email_to = ''` DEĞİL: alıcı yoksa `admin_audit_log`'a yazılır (§B4 "defter ya da Sentry" şartını karşılar).
- **Kapı kolu (d):** yazıcının insert anahtar kümesi ⊇ baseline'daki NOT NULL varsayılansız kolonlar (şemaya aykırı yazım kırmızı).

### 9.2 YÜKSEK — çift e-posta: iki katman birlikte (cetvel §B3.1)

- **Katman 1 (yarış):** Resend `Idempotency-Key = return_<durum>/<return_id>` (cetvel §B3.1/§B10-1'de belgeli: 24 saat, 256 karakter, farklı gövdeyle 409). İki eşzamanlı çağrı ikinci e-postayı ÜRETMEZ.
- **Katman 2 (gecikmiş tekrar):** göndermeden önce `(order_id, kind, ref_id)` için `sent` satırı okunur; varsa `{ skipped: 'already_sent' }`. İade türlerinde `ref_id=eq.<return_id>` filtresi ZORUNLU (yoksa §3 Seçenek A hatası geri gelir).
- `attempt` tekilliği ve bayat-attempt devralma EKLENMEZ (`order_paid` yolunun davranışını değiştirirdi; Katman 1 yarışı zaten kapatır).
- Cümle düzeltmesi: §7.1'deki "tekrar koruması güvenli kılar" yalnız KAYDI değil e-postayı da kapsar, ama ancak Katman 1 + 2 birlikteyse.

### 9.3 YÜKSEK — dizin değişimi (M1)

- YENİ AD (`uq_order_email_events_sent_once_ref`); `create unique index if not exists` aynı adı sessizce atlar ve eskiyi bırakırdı. Öz-denetim `indexdef`'i sınar (yalnız adı değil).
- Sıra ve kilit: `lock_timeout`/`statement_timeout` `BEGIN`'den önce (emsal migration'lar gibi); tek transaction'da ÖNCE yenisi kurulur, SONRA eskisi düşer (koruma açığı doğmaz).
- `coalesce(ref_id, sıfır-uuid)` KALIR (her PG sürümünde çalışır; `NULLS NOT DISTINCT` PG15+ ister, yerel/CI PG sürümü ölçülmedi, riske girilmez). Bilinen sınır: PostgREST `on_conflict` ifadeli dizini hedefleyemez → yazıcılar insert + PATCH kalıbında kalır (bugünkü gibi), upsert kullanılmaz.
- `notification-standard.md` §B3 dizin tanımı (satır 333/362) M1 ile aynı PR'da güncellenir.

### 9.4 YÜKSEK — `order-confirmation` (tek sahip ilkesi)

Webhook çağırdığında `order-confirmation` deftere YAZMAZ; tek sahip `order-paid-webhook`. Yalnız yönetici doğrudan çağırırsa (uç `verify_jwt=true`) ayrı türle (`order_confirmation_manual`) yazar. Gönderim SONRASI defter hatası 5xx dönmez: `console.error` + Sentry, cevap 200; `src/test/eposta-sessiz-dusus-yok.test.ts` hata yolu kolu (b) korunur. (Bu, §4/3'ün yerine geçer.)

### 9.5 ORTA — RLS, kural 12, tenant

- `system_email_events`: `ENABLE ROW LEVEL SECURITY` AÇIKÇA + `REVOKE ALL FROM anon, authenticated` + yalnız `service_role` politikası (canlıda `order_email_events` anon'a INSERT/UPDATE/DELETE/TRUNCATE hibesi taşıyor, tek koruma RLS'tir; aynı boşluk yeni tabloda OLMAYACAK). `order_email_events` için de `REVOKE` aynı migration'da yazılır (kural 14: fark yalnız satır sayısı).
- `tenant_id` (cetvel §B5, "her defter taşır"): `order_email_events`'e eklenir (tablo boş → NOT NULL mümkün), değeri `order_id → venthub_orders.tenant_id` ile dolduran BEFORE INSERT tetiği tüm yazıcıları kapsar. `system_email_events.tenant_id` gövdeden gelmezse (stock-alert tenant göndermiyor) DEFAULT tenant'a düşer; çok kiracılı mod PARK'ta olduğu için kabul edilir, bu satırla KAYITLIDIR.
- Yönetici okuması ileride gerekirse `shipping_email_events_admin_select` kalıbı (`jwt_tenant_id()` + `is_admin_user()`); `user_profiles.role` okuyan YENİ politika yazılmaz.
- SMS/WhatsApp: bu plandan ÇIKARILDI (ayrı kayıt; tablo adı `system_email_events` e-posta odaklı kalır, kanal kararı orada).

### 9.6 ORTA — INV-NOTIFY-3 yanlış-negatif sınıfları ve kapsamı

Yeni kapı (A PR'ı ile BİRLİKTE iner; M1'de inmez, mevcut ihlalle açılan kapı kırmızı doğar): tablo adı yorumda geçiyorsa sayılmaz (yorumlar düşürülür); yalnız OKUYAN dosya (GET) yazıcı sayılmaz; `.error` yok sayan yazım kırmızı; `api.resend.com` dışındaki gönderim (SDK, değişken URL) kırmızı; evren kanaryası ≥ 7 dosya; muaf listesi gerekçesi boş olmayan dize DEĞİL kayıt numarası ya da süre taşır; `shipping-notification` (yalnız başarı defterde, hata audit'te) muafiyetinin gerekçesi B4'ün geri kalanını yazar.
Sabotaj kolları: (a) defter yazımı silinirse, (b) muaf listesine gerekçesiz dosya girerse, (c) yeni dosya `api.resend.com` çağırıp yazmazsa, (d) NOT NULL kolonları atlanırsa, (e) `failed` dalı hiç yoksa, (f) evren sayısı 7'nin altına düşerse: hepsi kırmızı.

### 9.7 Güncel sıra (v2)

1. **M0** (kod, migration yok): yazıcı düzeltmesi (+ kapı kolu d). Edge yayını → Recep sözü.
2. **M1** (migration, Recep kapısı): `ref_id`, tenant_id + tetik, yeni dizin (yeni ad, tek transaction), `system_email_events`, RLS/REVOKE, geri alma; `notification-standard.md` dizin tarifi.
3. **A** (kod + INV-NOTIFY-3): iade ucu (Katman 1+2), `returns-webhook` sessiz atlamaları, `order-confirmation` tek sahip, `notification-service` e-posta yolu. Edge yayını → Recep sözü.
4. Şema tabanı M1'den sonra tazelenir (ikinci taban PR'ı açılmaz; ADMIN/ARAÇ koordinasyonu).

**Ölçülemedi (açık):** yerel/CI PG sürümü (kararı etkilemiyor: sentinel seçildi); `canCarrierTransition`'ın `received→received`'a izin verip vermediği (webhook ile yönetici ekranı gerçekten çakışır mı; Katman 1+2 bunu bilmeden de güvenli kılar); canlıdaki 2 aktif oturumun içeriği.

## OKUNANLAR

`docs/standards/notification-standard.md` (§B2–B5, B8), `supabase/functions/{return-status-notification,returns-webhook,order-confirmation,order-paid-webhook,quote-notification-webhook,notification-service,delivery-notification}/index.ts`,
`supabase/migrations/20260820140000_order_paid_notification.sql`, canlı katalog (`information_schema`, `pg_constraint`, `pg_policies`, `pg_indexes`, satır sayıları).
