# Güvenlik karnesi — satış öncesi (2026-11-03)

> **Kart:** OPS-209 · **Yöntem:** `.claude/skills/venthub-20-eksen-denetimi/SKILL.md` (Faz 0–3), yalnız güvenlik
> eksenleri · **Kapsam:** depo `master` @ `40cdb71` + prod şema dökümü `supabase/baselines/2026-11-01_public_schema.sql`
> · **Tür:** SALT OKUMA. Bu belge hiçbir kodu, migration'ı ya da edge function'ı değiştirmez; düzeltme ayrı iştir.
>
> **Koşu:** altı eksen ajanı paralel (1 girdi, 2 kimlik + `app_metadata`, 3 yetki/RLS/tenant, 4 sır, 12+13 webhook ve
> İyzico, 14 CSP/başlıklar), ardından tek elde eksen 20 çürütme pası. Birleşik liste 43 bulgu → 42 kimlik:
> **34 CONFIRMED (1 HIGH · 5 MEDIUM · 28 LOW) · 4 UNVERIFIED · 4 REJECTED.** CRITICAL yok.
>
> ⚠ **CONFIRMED = "depoda kod böyle".** Prod'a deploy edilmiş edge kaynağı bu koşuda indirilmedi (repo ≠ prod, son
> sapma ölçümü 2026-08-15). DB hükümleri 2026-11-01 dökümüne göredir; sonrasındaki iki migration
> (`20261101150000_alt73…`, `20261101160000_rec294…`) incelenen fonksiyonlara dokunmuyor.

## 1 · Şiddet çerçevesi — önce bunu oku

| Sınıf | Anlamı | Bulgular |
|---|---|---|
| **Satış engeli** | Kimliksiz bir çağıran para/sipariş kaydını bozabiliyor | **P1** |
| **Satıştan önce kapatılması önerilen** | Müşteri parası, kişisel veri ya da yetki zinciri; somut senaryo var, ön koşul dar | P2 · P11 · Y4 · Y5 · G1 |
| **Hijyen** | Ön koşulu ağır (sır, admin yetkisi, Faz 2) ya da etkisi sınırlı | kalan 28 LOW |
| **Faz 2 açılınca ağırlaşır** | Bugün tek tenant canlı; ikinci kiracıda veri sızıntısı olur | Y2 · Y3 · K3 · Y8 (+ Y4'ün tenant yönü) |

Bugün canlıda "anonim saldırgan veri okur" sınıfında bulgu **yok**: 60 tablonun 60'ında RLS açık, rol ve tenant
kararları `app_metadata` / `user_profiles` üzerinden veriliyor (kural 12 taraması temiz, §5 eksen 2), depoda
yeni canlı sır yok.

## 2 · Kök nedenler — 34 bulgunun çoğu üç kökten

1. **Sipariş durum makinesi DB'de değil, her uçta elle.** `venthub_orders` üzerinde yedi tetik var
   (`baselines/2026-11-01_public_schema.sql:7283-7415`); hiçbiri durum geçişini denetlemiyor. Monoton geçiş tetiği
   yalnız `venthub_quotes`'ta var. Her yazan uç (callback, admin, kargo, cron) kendi kuralını taşıyor ya da taşımıyor;
   kupon, stok ve e-posta yan etkileri "geçiş başına" değil "çağrı başına" tetikleniyor.
   **Kapsar:** P1, P2, P3, P4, P5, P6, P9, P11. → Tek iş: `enforce_order_status_transition` tetiği + yan etkileri
   geçişe bağlamak. Bu bir migration işidir (kural 13: Recep onayı).
2. **Edge'de service_role + elle yazılmış sahiplik/rol/tenant kapısı; arkasında RLS yok.** Kapı her uçta yeniden ve
   tutarsız yazılıyor (kardeş uçlar filtreli, bazıları değil). DB tarafındaki karşılığı `authenticated`'a açık
   SECURITY DEFINER RPC'ler.
   **Kapsar:** Y1, Y2, Y6, Y7, P1'in kimliksiz yazım kolu, K4; DB'de Y3, Y4, Y5, K5.
3. **Güvenilmeyen metin ortak bir kodlama/maskeleme yardımcısından geçmeden çıktıya gidiyor.** Kaçış fonksiyonu
   (`quote-notification-webhook/ic_bildirim.ts:30` `kacir`) ve maskeleme yalnız tek tük yerde var, `_shared`'de değil.
   **Kapsar:** G1 (HTML e-posta), S1, S2, S6 (log/Slack), S4, S5 (hata gövdeleri).

## 3 · KARNE — güvenlik eksenleri

| Eksen | Konu | Hüküm | Baş kanıt |
|---|---|---|---|
| 1 | Girdi doğrulama | **PARTIAL** | G1: e-posta HTML'ine müşteri adı kaçışsız (`order-confirmation/index.ts:44-47`). JSON-LD, `dangerouslySetInnerHTML`, açık yönlendirme, PostgREST `.or()` (INV-FILTER-1 borcu dışında) temiz. |
| 2 | Kimlik + `app_metadata` (kural 12) | **PARTIAL** | Rol/tenant kararı DB, edge ve Next'te `app_metadata`/`user_profiles`'tan — temiz. Açık: K1 claims çerezi süresiz (`src/utils/router.ts:107-112`), K3 signup tenant'ı metadata'dan (Faz 2). |
| 3 | Yetki, IDOR, RLS, tenant izolasyonu | **PARTIAL** | RLS 60/60 açık, `unstable_cache` anahtarları ve Realtime kanalları tenant'lı. Açık: Y4 moderator tüm kullanıcı PII'sini okur, Y5 admin super_admin'i düşürür, Y1 başkasının sepeti; Faz 2 için Y2/Y3. |
| 4 | Sır sızıntısı | **PASS** (sır) / log hijyeni açık | Ağaçta yeni canlı sır yok; izli SQLite dosyaları temiz (orkestratör ölçümü, §8). Hijyen: S1 istemciden açılan debug bayrağı, S2 PII log, S3 döküm artefaktı taranmıyor. |
| 12+13 | Webhook imza/replay, İyzico ödeme akışı, tutarlılık | **FAIL** | **P1** (HIGH): anonim callback ödenmiş/teslim edilmiş siparişin ödeme kaydını ön koşulsuz yazar. P2 parası çekilmiş sipariş iptal, P11 admin izsiz "ödendi". Tutar sunucuda hesaplanıyor (`iyzico-payment:356-427`), tam iade anahtarlı — temiz. |
| 14 | CSP, başlıklar, yapılandırma | **PARTIAL** | HSTS/XFO/nosniff/Referrer-Policy doğru ve testle kilitli. CSP yalnız `Report-Only`, `'unsafe-inline' 'unsafe-eval'`, rapor ucu yok (`next.config.mjs:255-256`, bilinen borç `csp-standard.md`). |
| 20 | Çürütme pası | koştu | 4 REJECTED, 4 UNVERIFIED (§6, §7). |

## 4 · CONFIRMED — şiddete göre

Her satır: **kanıt** · **neden bu şiddet** · **ne zaman** · **bunu geri gelmekten alıkoyacak test**.

### HIGH

**P1 · `iyzico-callback` siparişin ödeme kaydını ön koşulsuz, geri sarılabilir biçimde yazıyor**
- Kanıt: uç anonim (`supabase/config.toml:14-15` `verify_jwt = false`); token gelmezse DB'deki `payment_token`
  kullanılıyor (`supabase/functions/iyzico-callback/index.ts:154-156`); `patchOrder` filtresi yalnız `id` ya da
  `conversation_id`, mevcut durumu sormuyor ve `payment_debug`'ı tümüyle değiştiriyor (`:335-349`); başarısızlık dalı
  eşleşme kapısından geçmeden `payment_status:'failed'` yazıyor (`:595-597`); eşleşme kapısı `payment_status`'u
  okuyor ama kullanmıyor (`_shared/odeme_eslesme.ts:138-188`). `venthub_orders` tetiklerinin hiçbiri geçişi
  engellemiyor: `istemci_yazma_bekcisi` service_role'ü geçiriyor (baseline `:2772-2784`), CHECK'ler yalnız sözlük
  (`:1904-1905`).
- Senaryo (kod yolundan): saldırgan kendi siparişinde reddedilen kartla bir token alır, `{token:<kendi>, orderId:<kurban>}`
  POST eder → kurbanın ödenmiş siparişine `payment_status='failed'` yazılır, `payment_debug` (iade defterindeki
  `refunded_total` dahil, `iyzico-refund:204` bunu okur) silinir. Başarı dalı: `{orderId}` tek başına `delivered`
  siparişi `confirmed`'a döndürebilir — bu kol İyzico'nun eski token'a SUCCESS vermeyi sürdürmesine bağlı (§6).
- Şiddet: HIGH — kimliksiz çağıran ödeme kaydını yazıyor. CRITICAL değil: kurbanın sipariş kimliği (UUID) gerekli,
  doğrudan para hareketi yok. `conversationId=CONV-<epoch-ms>` kolu tahmin edilebilir bir değer (PLAUSIBLE).
- Ne zaman: **bugün.**
- Kilit: (a) callback birim testi — satır `delivered` ya da `payment_status=refunded` iken retrieve SUCCESS + eşleşme
  verilir, PATCH çağrılmaz ya da filtrede `status=eq.pending` bulunur; (b) satır `paid` iken retrieve FAILURE →
  PATCH yok; (c) DB tetik testi — service_role ile `delivered → confirmed` UPDATE hata verir (kök 1).

### MEDIUM

**P2 · Parası çekilmiş ama eşleşmeyen (needs_review) sipariş 24 saat sonra iptal ediliyor**
- Kanıt: eşleşmeyen ödemede satıra hiçbir şey yazılmıyor, sipariş `pending/pending` kalıyor
  (`iyzico-callback/index.ts:580-594`); `release-expired-reservations/index.ts:91-97` yalnız sipariş durumu ve
  `created_at < now-24h` ile seçiyor, needs_review işareti yok (böyle bir işaret yok); `:114-121` yalnız `id`
  filtresiyle `cancelled + failed` yazıyor; iş `expired-reservations-cron.yml` ile zamanlı. Kardeşi
  `order-housekeeping:167-174`: callback retrieve'de ağ hatası alıp `pending` dönerse (`iyzico-callback:622`)
  sipariş 15 dakikada iptal.
- Şiddet: MEDIUM — müşteri ödemiş, sipariş "başarısız", iade tetiklenmiyor. Tetik seyrek (P10 ya da biçim değişikliği);
  `PAYMENT_NEEDS_REVIEW_BEKLIYOR` alarmı 24 saat boyunca çalıyor. Stok tarafı zarar görmüyor.
- Ne zaman: bugün.
- Kilit: pending sipariş + aynı `order_id` için `PAYMENT_ORDER_MISMATCH` kaydı → release koşar, sipariş pending kalır;
  housekeeping'de callback `pending` dönünce sipariş sonlandırılmaz.

**P11 · `admin-update-order`: durum izin listesi, monotonluk ve denetim kaydı yok**
- Kanıt: `supabase/functions/admin-update-order/index.ts:111` varsayılan `'paid'` (sözlük dışı); `:113-123` koşulsuz
  PATCH; dosyada `admin_audit_log` 0 kez geçiyor. pending siparişe `confirmed` yazılınca
  `sync_payment_status_with_status` (baseline `:3896`) `paid` yapar → `paid_at` damgası, ödeme e-postası, stok kapısı.
- Şiddet: MEDIUM — ödenmemiş sipariş admin eliyle ve izsiz "ödendi" olur; kural 11 (admin işlemleri audit) ihlali.
- Ne zaman: bugün.
- Kilit: `status` yokken 400; pending→confirmed 409 ya da gerekçe ister; her çağrı tam 1 `admin_audit_log` satırı.

**Y5 · `enforce_role_change` admin'in super_admin'i düşürmesine izin veriyor, oturumlu rol değişikliği denetime düşmüyor**
- Kanıt: baseline `:1845-1857` yalnız iki kural (kendi rolünü değiştirme, super_admin'e yükseltme); denetim yazımı
  yalnız oturumsuz service_role dalında (`:1825-1839`); `user_profiles_update_policy` (`:8910`) admin claim'li
  herkese başka satırı güncelletiyor; `authenticated`'a GRANT (`:10506`).
- Şiddet: MEDIUM — içeriden yetki istismarı, izsiz.
- Ne zaman: bugün.
- Kilit: migration guard davranış kolu — admin claim'iyle super_admin hedefe `role='user'` yazımı exception; başarılı
  her rol değişikliği `admin_audit_log`'a 1 satır.

**Y4 · `admin_list_all_users` moderator'e açık: tüm kullanıcıların e-posta ve telefonu**
- Kanıt: baseline `:296-302` rol listesinde `moderator`; `:9783` `authenticated`'a GRANT; arayüzde `/admin/users`
  yalnız super_admin (`src/lib/rbac.ts:189`). Fonksiyonda tenant filtresi de yok (`:304-314`).
- Şiddet: MEDIUM — kişisel veri (KVKK); prod'da moderator kullanıcısı olup olmadığı ölçülmedi.
- Ne zaman: bugün; Faz 2'de kiracılar arası sızıntıya döner.
- Kilit: moderator claim'iyle çağrı `not authorized`; fonksiyonun rol listesi `('admin','super_admin')` metin testi.

**G1 · Sipariş e-postalarında müşteri adı kaçışsız HTML'e giriyor**
- Kanıt: `supabase/functions/order-confirmation/index.ts:44-47` (`String(v)`), `:186-194`, `:200`; Resend'e `html`
  alanıyla gidiyor (`:214`); ad `venthub_orders.customer_name`'den doğrudan (`:149`). Kaynak:
  `iyzico-payment/index.ts:255`, `:506-507` — `customerInfo` şemasız, `customer_email` da istemciden. Kardeşler:
  `shipping-notification:48,290`, `delivery-notification:126,237`, `return-status-notification` (`:112`, `:160`).
- Senaryo: saldırgan `name:"<a href=…>…"` ve kurbanın e-postasıyla gerçek bir ödeme yapar; kurbana ve BCC
  operatörlerine VentHub göndericisinden (SPF/DKIM geçerli) oltalama HTML'i gider.
- Şiddet: MEDIUM — engel, saldırganın gerçek ödeme yapması.
- Ne zaman: bugün.
- Kilit: `_shared`'e taşınan `renderTemplate(tpl,{customer_name:'<b>x</b>'})` çıktısı `&lt;b&gt;` içerir; edge
  `html` şablonlarında ham `${customer_name|reason|description}` interpolasyonunu yasaklayan grep testi (taban boş).

### LOW (28)

| Kimlik | Bulgu | Kanıt | Ne zaman | Kilit |
|---|---|---|---|---|
| P3 | `increment_coupon_usage` idempotent değil; her paid callback tekrarında +1 (limit aşılmaz, kupon erken tükenir) | baseline `:2614-2618`, `iyzico-callback:383-430` | bugün | aynı sipariş için iki paid callback'te RPC tek kez; sipariş başına tekil kayıt |
| P4 | `shipping-webhook` RANK'te `cancelled`/`processing` yok → iptal sipariş `delivered` olabilir; bilinmeyen durum CHECK'e çarpıp 500; geçersiz tarih RangeError | `shipping-webhook/index.ts:43-47,86,227-232` | bugün (entegre kargo firması yok, `:125`) | cur=cancelled + gelen=delivered → patch yok; bilinmeyen durum 200 + `unchanged` |
| P5 | Kısmi stok düşümü ikinci çağrıda "already reduced" ile `stock_processed:true` damgalanıyor | baseline `:3249-3258`, `iyzico-callback:462,481` | bugün | 2 kalem, 1'i yetersiz → ikinci çağrı da `success:false` |
| P6 | `returns-webhook` aynı durumdan aynı duruma geçişe izin; ikinci e-posta; `event_id` yan etkiden sonra yazılıyor | `_shared/return_transitions.ts:84`, `returns-webhook/index.ts:176-205` | bugün | aynı durumla gelen istekte bildirim çağrılmaz |
| P7 | `order-paid-webhook` hata durumunda yeniden deneme bekliyor, yeniden deneme yolu yok (`net.http_post` tek seferlik) | `order-paid-webhook/index.ts:251-252`, baseline `:2957-2966` | bugün | yazılamaz: önce `failed` kayıtlarını süpüren iş tasarlanmalı |
| P8 | Next revalidate webhook'unun imzasız düz sır yolunda replay guard yok; `includes` sabit zamanlı değil; tekrar önbelleği bellek içi | `src/app/api/webhook/supabase/route.ts:363`, `src/lib/webhook/imza.ts:61` | bugün (ALT-76 geçiş borcu) | imza geçişi bitince imzasız istek 401 (INV-WEBHOOK-1) |
| P9 | Eşzamanlı iki kısmi iadede `refunded_total` kaybolabilir | `iyzico-refund/index.ts:204,392-396`, baseline `:6426` | bugün (yalnız admin; UI kısmi iade çağırmıyor) | PATCH önceki `refunded_total`'a koşullu; değilse 409 |
| P10 | `basketId` ve `conversationId` ayrı `Date.now()` çağrılarından | `iyzico-payment/index.ts:472-473`, `odeme_eslesme.ts:33-35` | bugün (seyrek; P2 zincirini başlatır) | `Date.now` t, t+1 sahtesiyle iki kimliğin epoch'u eşit |
| Y1 | `order-validate` istemcinin `cart_id`'siyle başkasının sepetini okuyor (UUID bilinmeli) | `order-validate/index.ts:67,80,88` | bugün | A, B'nin `cart_id`'siyle 403/404 (`tests/e2e/adversarial.test.ts`) |
| Y2 (kısmi) | service_role uçlarında tenant filtresi yok | doğrulanan: `release-expired-reservations:91-97`, `order-housekeeping:57,83`, `admin_list_all_users` `:304-314` | **Faz 2** | `edge-security.test.ts`'e R kuralı: service_role ile `venthub_orders`/`coupons`/`cart_items`/`price_lists` URL'sinde `tenant_id=eq.` zorunlu, bugünküler adıyla taban |
| Y3 (kısmi) | `authenticated`'a açık SECURITY DEFINER RPC'lerde tenant kapısı yok | §6'da kalan kalemler | **Faz 2** | `anon-definer-yetki.test.ts` deseninde: `authenticated` EXECUTE'lu her DEFINER gövdesinde `jwt_tenant_id()` |
| Y6 | `iyzico-refund` yetkiden önce sipariş yüklüyor; 404/403 farkı varlık sızdırıyor | `iyzico-refund/index.ts:172` vs `:200` | bugün | admin olmayana her iki durumda 403 |
| Y7 | `healthz` rol kontrolü yok; ödeme ortamı ve eksik env hükmü dönüyor | `healthz/index.ts:43-103` | bugün (anon key ile erişim PLAUSIBLE) | müşteri JWT'siyle 403; R8 kapsamına `healthz` |
| K1 | `sb-claims-cache` çerezinde `exp`/`sub` denetimi yok; rolü düşürülen admin `/admin` kabuğuna süresiz girer (veri RLS ile korunuyor) | `src/utils/router.ts:107-112,126` | bugün | `claims.exp < now` olan çerez önbellekten kabul edilmez, akış `getClaims`'e düşer (`auth-session-security.test.ts`) |
| K3 | Signup tetiği tenant'ı `raw_user_meta_data`'dan `app_metadata`'ya kopyalıyor; `auth-account-standard.md` A10 tersini yazıyor | baseline `:2418-2423,2443-2447,2484` | **Faz 2** | `handle_new_user_metadata` gövdesi `raw_user_meta_data ->> 'tenant_id'` içermez |
| K4 | Sır/HMAC karşılaştırmaları sabit zamanlı değil | `shipping-webhook:33,114`, `returns-webhook:26,82`, `release-expired-reservations:40`, `order-housekeeping:27` | bugün | bu kalıpları yasaklayan grep; doğrusu `_shared/caller.ts:105-115` |
| K5 | `admin_audit_log` INSERT politikası `actor = auth.uid()` zorlamıyor | baseline `:8069` | bugün | başka `actor` ile insert reddedilir |
| K6 | Supabase env yoksa admin kapısından önce erken dönüş | `src/middleware.ts:180-182` | hijyen | env boşken `/admin` yönlendirilir |
| S1 | `iyzico-payment` debug bayrağı istemciden (`?debug=1`, `x-debug: 1`) açılıyor; açıkken API/SECRET anahtarının ilk 6 + son 4 karakteri ve ad/soyad maskesiz loglanıyor | `iyzico-payment/index.ts:81-83,463-469,119-124,863` | bugün (loglar yalnız proje üyelerine açık) | `IYZICO_DEBUG` tanımsızken `x-debug:1` gelse de `debugEnabled === false`; R kuralı: `headers.get('x-debug')`/`searchParams.get('debug')` yasak |
| S2 | Müşteri e-posta/telefonu koşulsuz loglanıyor | `shipping-notification:429`, `return-status-notification:339`, `notification-service:157`, `stock-alert:425` | bugün | `console.*` içinde alıcı değişkenini yakalayan grep |
| S3 | Prod şema dökümü sır taraması olmadan public depo artefaktı | `.github/workflows/sema-tabani-uret.yml:99,129-136` | süreç açığı (bugünkü döküm temiz) | iş akışında upload'dan önce `secret-scan`/`depo-dokum-kapisi` adımı (sıra testi) |
| S4 | Kimliksiz uçlar iç hata metnini dönüyor | `tcmb-rates-sync/index.ts:85,105,123,132`, `iyzico-callback:665-666` | bugün | `verify_jwt=false` uçlarda yanıt gövdesinde `.message` yok |
| S5 | Oturumlu müşteriye `error.message` dönüyor | `iyzico-payment:979,166`, `log-client-error:161,195` | bugün | S4 kuralının ikinci kademesi |
| S6 (kısmi) | `log-client-error` `extra` alanı DB'ye, `msg`/`url` Slack'e maskesiz | `log-client-error/index.ts:151,172,177` | bugün | Slack'e giden alanlarda `mask(` çağrısı |
| C1 (+C2) | CSP yalnız `Report-Only`, `'unsafe-inline' 'unsafe-eval'`, rapor ucu yok; `connect-src https://*.supabase.co` paylaşılan son ek (enforce'ta anlam kazanır) | `next.config.mjs:255-256` | bilinen borç (`csp-standard.md` §1, §5, §6.1) | önce `report-to` ucu varlık testi; enforce'ta `unsafe-eval` yok ve `connect-src`'de paylaşılan son ek jokeri yok (INV-CSP-1 genişlemesi) |
| C4 | `poweredByHeader` kapatılmamış; COOP/CORP yok | `next.config.mjs` | hijyen | `poweredByHeader: false` assert |
| C5 | CORS üretimde `http://localhost:*` ve `venthub-hvac-esite*.vercel.app` kabul ediyor (ikincisini Vercel'de herkes açabilir — orkestratör ölçümü) | `supabase/functions/_shared/cors.ts:40,44` | bugün (credentials yok, kimlik bearer token) | prod'da localhost yansıtılmaz; önizleme kalıbı ekip kapsamına (`-peckops-projects`) çivilenir |
| C7 | `pull_request` işleri PR dalının betiklerini prod DB URL'si ve Supabase yönetim token'ıyla koşuyor (fork'a sır geçmez; risk aynı depodaki dallar) | `.github/workflows/db-advisor.yml:13,235-244,362-383`, `edge-shared-input-drift.yml:40,58,79` | bugün | yönetim token'ı yalnız `push: master`; PR kipinde salt okuma DB rolü |
| C8 | Beş iş akışında `permissions:` yok | `db-advisor.yml`, `db-advisor-fix.yml`, `e2e-smoke.yml`, `edge-shared-input-drift.yml`, `supabase-migrate.yml` | hijyen | blok yoksa kırmızı veren iş akışı lint kuralı |
| C9 | `JWT_CLAIMS_COOKIE_SECRET`, `SUPABASE_WEBHOOK_SECRET` hiçbir `.env*.example`'da yok (kod fail-closed) | `.env*.example` | hijyen | kodda okunan her gizli env'in örnek dosyada adı geçer |
| C10 | Betiklerde `ssl: { rejectUnauthorized: false }` | `scripts/setup_webhooks.js:135`, `scripts/db/migrations/*` | hijyen | `scripts/**` genelinde grep |

## 5 · Eksen 2 ayrıntısı — kural 12 taraması (temiz alan, kayda geçsin)

- **DB:** `is_admin_user` (baseline `:2697-2730`) ve `is_admin_claim` (`:2659-2691`) yalnız `claims.user_role` ve
  `app_metadata.user_role` okuyor; `custom_access_token_hook` (`:1143-1186`) rol ve tenant'ı `user_profiles`'tan alıyor;
  signup rolü `'user'`a zorluyor (`:2435-2440`, `:2488-2493`). `20251212_fix_rls_performance.sql`'deki
  `raw_user_meta_data->>'role'` politikaları güncel dökümde yok.
- **Edge:** `_shared/caller.ts:184` `auth.getUser(token)`, rol/tenant `user_profiles`'tan (`:200-204`). `user_metadata`
  yalnız e-postadaki görünen ad için okunuyor.
- **Next:** `src/` içinde service_role yok; sunucu `getClaims()` kullanıyor; `getSession()` yalnız tarayıcıda.
  `jwt-decode`/`decodeJwt` yok; `atob` yalnız AES-GCM şifreli metinde.

## 6 · UNVERIFIED — ölçülmesi gereken

| Kimlik | Ne ölçülmeli | Nasıl |
|---|---|---|
| P1 başarı kolu | İyzico `checkoutForm.retrieve` eski/tamamlanmış token'a SUCCESS döndürmeyi sürdürüyor mu; reddedilen kartta yanıt biçimi | sandbox'ta 1 saat ve 1 gün sonra retrieve; reddedilen kart retrieve yanıtı |
| Y2/Y3 kalanı | `iyzico-refund:162-200`, `admin-orders-latest:108`, `admin-order-inspect:55-56` + `fn_admin_get_orders` (`:1936`), `admin-iyzico-reconcile:68-70`, `apply-coupon:97-101`; RPC'ler `adjust_stock` `:223`, `set_stock` `:3623`, `process_order_stock_restore` `:3306`, `process_goods_receipt` `:3037`, `set_user_admin_role` `:3714`, `anonymize_user_personal_data` `:583`; `data_subject_requests` politikası (`20260816120000_kvkk…:68-71`) | satır satır okuma; hepsi Faz 2 notuyla |
| Y8 | `tenants_select USING(true)` (`:8850`) ile anon'un okuduğu `tenants.config`/`features` içeriğinde sır ya da işletme bilgisi var mı | prod'da `select config, features from tenants` (salt okuma) |
| K2 + C6 | Supabase Auth panel ayarları: "Secure password change", sızmış parola koruması, MFA, JWT süresi, refresh rotasyonu; `ResetPasswordPage.tsx:35-37` recovery oturum türünü kontrol ediyor mu | panel okuması; `config.toml`'da `[auth]` olmaması prod hakkında hüküm vermez |
| S6 Sentry | `beforeSend` temizleyicisi gerçekten yok mu | `sentry.*.config.ts`, `instrumentation*.ts` |

## 7 · REJECTED

| Kimlik | Sebep |
|---|---|
| G2 (`iyzico-callback:496` kodlanmamış `orderId`) | `:129-139` kodlu sorguda kötü biçimli değer satır bulamaz → `:276` eşleşme kapısı `paid=false` → `:496` hiç çalışmaz. |
| K7 (dev kipinde `Host: localhost` atlaması) | `src/middleware.ts:229-233` `NODE_ENV==='development'` şartına bağlı; Vercel derlemesinde dal ölü. |
| C3 (başlıklar bekçisiz) | `src/__tests__/conformance/rota-dili-kapali-sifir-fark.test.ts:84,111` `headers()` çıktısını HSTS/XFO/nosniff içeren fikstürle (`fikstur/master-9ea04a55d-next-config.json:233`) birebir karşılaştırıyor. |
| C2 (ayrı bulgu olarak) | C1'in alt maddesi: Report-Only CSP hiçbir şeyi uygulamadığı için bugün ek risk yok; C1 içinde tutuldu. |
| S1'in TCKN kolu | `iyzico-payment/index.ts:837` `identityNumber` sabit sahte numara; bulgunun geri kalanı CONFIRMED. |

## 8 · Orkestratörün kendi ölçümleri (eksen 4 ajanının ölçemedikleri)

- **İzli SQLite dosyaları:** `git ls-files` → `memory.db`, `registry/registry.db`, `registry/_legacy/registry.db`.
  Salt okuma ile açıldı: `memory.db` boş (tablo yok); `registry*.db` görev kaydı (11 proje, 77 görev, 4 `agent_memory`).
  JWT, API anahtarı, `postgres://`, e-posta ve 11 haneli kimlik deseni: **0**.
- **Geçmiş taraması:** `python scripts/security/secret-scan.py` koştu, ama bu oturumun klonu sığ (51 commit) — **tam
  geçmiş ölçülemedi.** Tek "açık" kayıt `src/__tests__/conformance/depo-dokum-kapisi-uctan-uca.test.ts:692,750`'deki
  sahte PEM fikstürü (`SAHTE_PEM`, `birlestir(...)` ile bölünmüş); gerçek anahtar değil, ama
  `scripts/security/secret-scan-kapatildi.json`'da olmadığı için betik kırmızı verir. Tam klonda yeniden koşulmalı.
- **CORS önizleme kalıbı:** `_shared/cors.ts:40` `^https://venthub-hvac-esite[a-z0-9-]*\.vercel\.app$` — Vercel'de
  bu önekle başkasının açacağı projeyi de kapsar. C5'e eklendi.
- **Bağımlılık:** aynı gün PR #2200 (OPS-209 parça 1) üç orta Dependabot kaydını kapattı; `pnpm audit`'te tek kayıt
  `zod` yüksek (`GHSA-mrhx-c7xc-m3w5`, `docs/standards/bagimlilik-kararlari.md` §7, ALT-100).

## 9 · KİLİT ÖNERİSİ — öncelik sırası

Her CONFIRMED için kilit testi §4'te yazılı. Yazılamayan tek kalem P7 (önce yeniden deneme tasarımı). Kök nedene göre
gruplanırsa üç iş yeter:

1. **Sipariş durum makinesi DB'ye (kök 1).** `enforce_order_status_transition` tetiği + callback PATCH'ine
   `status=eq.pending` ön koşulu + başarısızlık dalını eşleşme kapısından geçirmek + kupon/stok yan etkisini `paid_at`
   geçişine bağlamak. Kapatır: P1, P2 (needs_review işaretiyle), P3, P4, P5, P6, P11. Kilit: P1 (a)(b)(c) testleri.
   ⚠ Migration içerir → kural 13, Recep onayı.
2. **Edge yetki/tenant kapısını ortaklaştır (kök 2).** `edge-security.test.ts`'e iki R kuralı (service_role URL'de
   `tenant_id=eq.` zorunlu; sır karşılaştırmasında `===` yasak) + DB'de Y4 rol listesi, Y5 eski-rol kontrolü ve
   audit, K5 `actor` zorlaması. Kapatır: Y1, Y4, Y5, Y6, Y7, K4, K5; Faz 2 için Y2/Y3 tabanı.
3. **`_shared` kodlama ve maskeleme yardımcısı (kök 3).** `kacir` ve `mask` `_shared`'e taşınır, e-posta şablonları ve
   loglar ondan geçer; debug bayrağı yalnız env'den. Kapatır: G1, S1, S2, S4, S5, S6.

Ayrıca ucuz ve risksiz: CSP'ye `report-to` ucu (C1'in "sıfır ihlal" ön koşulunu ölçülebilir yapar), `poweredByHeader:
false` (C4), iş akışlarına `permissions: contents: read` (C8), şema döküm iş akışına tarama adımı (S3).

## 10 · Ratchet — `kapanmis-bulgular.md` bayat satırlar (bu PR'da düzeltilmedi, not)

- `_shared/tenant_config.ts` "Hâlâ AÇIK" satırı bayat: `resolveTenantId` ve `atob` silinmiş
  (`supabase/functions/_shared/tenant_config.ts:33-46`), R6 ve R11 tabanları boş (`edge-security.test.ts:111,188`).
  Kapanmış tablosuna taşınmalı.
- "statik kilit E9 HENÜZ YOK" notu bayat: R8 canlı (`edge-security.test.ts:136-139,858-894`), yalnız `admin-` önekli
  uçları tarıyor (`iyzico-refund`, `order-housekeeping`, `release-expired-reservations`, `healthz` dışarıda).
- `shipping-status` 410 ile emekli (`shipping-status/index.ts:33-48`); R5 tabanında hâlâ duruyor.
- Hâlâ açık borçlar: `iyzico-callback` HMAC yok (R5, `edge-security.test.ts:101-104` — P1'in zeminidir); `apply-coupon`
  kendi `buildCors`'u (R3).
- `venthub-haritasi.md` §1'deki `iyzico-payment:302,366,421,568` satırları bayat; dosyadaki tek interpolasyonlar
  `:641` ve `:910`, ikisi kodlu.

## 11 · İş eşlemesi

Bu koşu kart açmadı (salt okuma emri, OPS-209). Öneri: kök başına bir kart — (1) durum makinesi + P1 (satış engeli,
migration'lı), (2) edge yetki/tenant + DB rol RPC'leri, (3) `_shared` kodlama/maskeleme; LOW hijyen kalemleri tek
toplu kart. Kartları OPS açar.

DURUM: CEKINCELI
- SEBEP: Hükümler repo koduna ve 2026-11-01 şema dökümüne dayanıyor; deploy edilmiş edge kaynağı, İyzico sandbox
  davranışı, Supabase Auth panel ayarları ve tam git geçmişi bu koşuda ölçülemedi.
- DENENEN: 6 eksen ajanı + çürütme pası; P1 orkestratörce koddan ayrıca doğrulandı (config.toml, `patchOrder`,
  `venthub_orders` tetik listesi); SQLite dosyaları açılıp tarandı; `secret-scan.py` sığ klonda koştu.
- ÖNERİ: §6'daki beş ölçüm (OPS ya da EDGE; İyzico sandbox ve panel okuması depo dışı) ve P1'in kartı önce.
