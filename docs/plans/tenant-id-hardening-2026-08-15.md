# `tenant_id` Sertleştirme Planı (T026-VH) — 2026-08-15

> **Durum: PLAN. Kod değişmedi.** Cetvel §3.9'daki borcun nasıl kapatılacağı.
> Envanter salt-okuma taramasıyla çıkarıldı; **uygulama anında her `dosya:satır` yeniden doğrulanmalı**
> (dosyalar bu tarihten sonra değişmiş olabilir). Kilit: `edge-security.test.ts` R6 + R11.

## 1. Sorun

`supabase/functions/_shared/tenant_config.ts` → `resolveTenantId(req, parsedBody)`:

1. `?tenant_id=` query parametresi **her şeyden önce** okunuyor → doğrulanmış kimliği ezer
2. JWT payload'ı `atob()` ile **imzasız** çözülüyor → sahte payload kabul edilir
3. gövdeden `tenant_id` / `tenantId`

Tenant sınırının **her kaynağı istekten geliyor.** Fonksiyonlar bu değeri PostgREST filtresine
(`&tenant_id=eq.${tenantId}`) koyuyor → etki "başka tenant'ın satırını oku/yaz"a kadar gider.
Tek tenant canlıyken sınırlı; **Faz 2 açılır açılmaz data-bleeding** (CLAUDE.md §12).

**Sırayı çevirmek YETMEZ:** `atob` kaldıkça saldırı query'den sahte-JWT'ye taşınır. İmzayı yalnız
`auth.getUser(jwt)` doğrular; o **async**'tir, `resolveTenantId` **sync** — imza değişikliği tüm
çağıranlara yayılır. Bu yüzden bu iş kendi turunu hak ediyor.

## 2. Ölçümün düzelttiği üç varsayım

| # | Sanılan | Ölçülen |
|---|---|---|
| D1 | `iyzico-callback` tenant'ı bizim ürettiğimiz `callbackUrl` query'sinden alıyor (meşru) | **YANLIŞ.** `iyzico-payment/index.ts:469` callback URL'ini `?orderId=…&conversationId=…&successUrl=…` ile kuruyor; `tenant_id` **yok**. Yani query dalının **meşru tek bir üretim çağıranı yok** → silmek sıfır-regresyon |
| D2 | `order-validate` sıcak yolu etkilenir | **YANLIŞ.** `order-validate` `resolveTenantId` çağırmıyor. Gerçek sıcak yol `iyzico-payment` |
| D3 | E12 kuralı yazılacak | **ZATEN YAZILDI** — `edge-security.test.ts` **R11** (aynı gün, T027-VH). İş artık "kuralı yaz" değil, "düzeltme sonrası baseline'ı boşalt" |

## 3. Çağıran envanteri (12 çağrı — hepsi `await` edilebilir bağlamda)

| Dosya | Sınıf | `verify_jwt` | Dosyada `getUser` | Sıra |
|---|---|---|---|---|
| `admin-create-coupon` | a | true | var | getUser ÖNCE ✔ |
| `admin-update-shipping` | a | true | var | getUser ÖNCE ✔ |
| `admin-update-order` | a | true | var | getUser ÖNCE ✔ |
| `order-confirmation` | a+b | **false** | var | tenant ÖNCE ✖ |
| `delivery-notification` | a+b | true | var | tenant ÖNCE ✖ |
| `return-status-notification` | a+b | **false** | var | tenant ÖNCE ✖ |
| `notification-service` | a+b | true | var | tenant ÖNCE ✖ |
| `shipping-notification` | a+b | **false** | var | tenant ÖNCE ✖ |
| `iyzico-payment` | a | true | **YOK** | — |
| `iyzico-callback` | c+a | **false** | **YOK** | — |
| `returns-webhook` | c | **false** | YOK (HMAC) | — |
| `shipping-webhook` | c | **false** | YOK (HMAC) | — |

**Bugün tenant'ın gerçek üretim kaynağı yalnız ikisi:** sınıf-b gövdesi ve `DEFAULT_TENANT_ID`.
Hiçbir tarayıcı çağıranı `tenant_id` göndermiyor; `?tenant_id=` üreten üretim kodu **yok**.
Query dalı ve `atob` dalı **yalnız saldırgan için** var.

**Bugünkü pencere dar ama bir yerde tam açık.** Sınıf (a) uçlarında rol sorgusu tenant'la filtreli
(`user_profiles?id=eq.…&tenant_id=eq.${tenantId}`) → yanlış tenant verilirse satır bulunamaz, 403.
*Tesadüfi* fail-closed. **Korumasız:** `iyzico-payment` (rol kontrolü yok), `iyzico-callback`, iki webhook.

## 4. Hedef hiyerarşi — sınıfa göre AYRI ("JWT kazanır" tek başına yetmez)

| Sınıf | Tenant kaynağı | Gerekçe |
|---|---|---|
| **a** | `user_profiles.tenant_id` — **rol ile aynı sorguda** (`select=role,tenant_id`, filtre yalnız `id=eq.<getUser'dan gelen id>`); `user.app_metadata.tenant_id` ile çapraz kontrol | Ek ağ çağrısı **sıfır**. Bugünkü "tenant'ı önce çöz ki profili filtreleyeyim" döngüsünü kırar |
| **b** | service_role doğrulandıktan **sonra** gövdedeki `tenant_id`; yoksa `DEFAULT_TENANT_ID` | Anahtarı bilen zaten her tenant'a yazabilir. Fallback **zorunlu** — yoksa `stock-alert → notification-service` kırılır (o çağrı gövdede tenant göndermiyor) |
| **c** | İmza doğrulandıktan **sonra kaynağın kendi satırından** (`venthub_orders.tenant_id` / `venthub_returns.tenant_id`). İstekten **hiçbir** alan | Kargo firması bizim tenant UUID'lerimizi bilmez; `order_id`/`tracking_number` bilir. `shipping-webhook` bunu yarı yarıya zaten yapıyor (satırı çekip karşılaştırıyor) — oku **türetmeye** çevir |
| **d** | `DEFAULT_TENANT_ID` | Bugün sınıf-d çağıranı yok; kural yeni uçlar için |
| **c+a** (`iyzico-callback`) | Her iki durumda da sipariş satırından | Tarayıcıdan gelen `Authorization` **anon key** olabilir; JWT'ye bel bağlamak burayı kırar |

### Kritik karar: `resolveTenantId` JWT'yi HİÇ çözmemeli

12 çağırandan **8'i zaten `getUser(jwt)` çağırıyor** → modül kendi `getUser`'ını çağırsa 8 uçta
**ikinci bir Auth round-trip'i** doğar (regresyon). Kalan 4'ün 3'ü sınıf (c) — JWT yok, anlamsız.
**Doğrusu: çağıran, zaten doğrulamış olduğu `user` nesnesini geçer.**

Tek gerçek yeni maliyet **`iyzico-payment`**: orada `getUser` hiç yok, eklenmeli. O uç zaten
6+ ağ çağrısı yapıyor; bir Auth RTT marjinal. Yerel JWT imza doğrulama önerilmiyor (secret/JWKS
yönetimi + R6 yasağıyla çatışır).

Önerilen: `_shared/tenant.ts` (saf, `Request` görmez) + `_shared/caller.ts` (`resolveCaller(req, body)`
→ `{kind, user, role, tenantId, source}`; `getUser` **en fazla bir kez**). `resolveTenantId` **kaldırılır** —
adı korumak "Request'ten tenant okunur" zihniyetini yaşatır.

## 5. Göç planı — 7 adım

> **Blast radius:** `scripts/edge/select-functions.mjs` `_shared/<dosya>` referanslarını izleyip onu
> import eden **tüm** fonksiyonları deploy'a sokar. Paylaşılan modül **Adım 1'de bir kez** yazılır,
> sonra dokunulmaz.

| Adım | İş | Tek başına deploy? |
|---|---|---|
| **0** | **Ölçüm, kod yok:** repo↔prod sapması (`drift-check`) · `auth.users` içinde `app_metadata.tenant_id` boş hesap var mı · `select distinct tenant_id from user_profiles` ("tek tenant" iddiasını **doğrula**) · **misafir (guest) ödeme akışı canlı mı** | — |
| **1** | `_shared/tenant.ts` + `_shared/caller.ts` ekle (saf ekleme, import eden yok) | evet, etkisiz |
| **2** | Sınıf (a) saf uçlar: `admin-create-coupon`, `admin-update-order`, `admin-update-shipping` — rol sorgusuna `tenant_id` ekle, filtreden tenant'ı çıkar | evet, dosya başına |
| **3** | Karma (a+b) 5 bildirim ucu → `resolveCaller`; `getTenantBranding` çağrısını **yetki kapısının arkasına** taşı | evet, uç başına |
| **4** | `iyzico-payment`: `getUser(jwt)` ekle, tenant'ı §4 sınıf-(a) kuralıyla al, **`user_id`'yi gövde yerine `user.id`'den al** | evet — runtime doğrulaması ZORUNLU |
| **5** | Sınıf (c) 3 uç: karşılaştırmayı **türetmeye** çevir (`shipping-webhook`, `returns-webhook`, `iyzico-callback`) | evet, uç başına |
| **6** | `resolveTenantId`'yi **SİL**; `edge-security.test.ts` R6 + R11 baseline satırlarını sil (stale-guard zaten zorlar) | evet — ama YALNIZ 2–5 bittikten sonra |
| **7** | Cetvel §3.9'u borçtan çıkar, `kapanmis-bulgular.md`'ye kilitle işle | kod deploy'u yok |

Sıralama: 1 → (2 ‖ 3 ‖ 4 ‖ 5 paralel) → 6 → 7.

## 6. Riskler (adıyla)

| # | Risk | Şiddet |
|---|---|---|
| R1 | `iyzico-payment` — **misafir ödeme** akışı varsa `getUser` zorunluluğu onu kırar (`'guest_' + Date.now()` dalı) | **yüksek** — Adım 0'da ölç |
| R2 | `iyzico-callback` — tarayıcıdan gelen `Authorization` anon key olabilir; "JWT kazanır" dersek kırılır | **yüksek** — çözüm: bu uçta JWT hiç kullanma |
| R3 | `shipping-webhook` e2e testleri `isMockEnv` ile tenant karşılaştırmasını atlıyor; türetmeye geçince mock tenant değerleri akışa girer | orta |
| R4 | `stock-alert → notification-service` gövdesinde tenant **yok**; sınıf-b fallback'i kaldırılırsa bildirimler tenant'sız kalır | orta |
| R5 | `app_metadata` ↔ `user_profiles` uyuşmazlığında 403 kuralı, trigger öncesi açılmış hesapları kilitleyebilir. Kural: `app_metadata` **yoksa** profil kazanır, **ikisi de varsa** eşit olmalı | orta |
| R6 | Adım 6 tüm import edenleri yeniden deploy eder; repo↔prod sapması varsa **regresyon deploy'u** olur (cetvel §3.8) | orta — Adım 0 şart |
| R7 | Bildirim uçlarında branding'i kapı arkasına taşırken `let emailFrom`/`brandName` bildirim sırası bozulabilir | düşük — derlemede yakalanır |
| R8 | `getTenantBranding` bilinmeyen tenant için sessizce env fallback'ine düşüyor (yalnız `console.warn`) | düşük — Faz 2'de "bilinmeyen tenant → 400" olmalı |

## 7. R11'in düzeltme sonrası hâli (dört parça)

Bugünkü R11 **dosya-yerel sıralamaya** bakıyor. Düzeltmeden sonra `tenant_config.ts` eşleşmeyeceği
için stale-guard baseline'ı boşaltmaya zorlar — ama mevcut dedektör **dolaylı** ihlali (modül okur,
çağıran sadece çağırır) göremez; **bugünkü asıl açık tam olarak oydu.** Evrim:

- **A · genişletilmiş desen, baseline BOŞ** — `searchParams.get('tenant_id'|'tenantId')` her yazımı, `formJson/requestData/parsed.tenant_id`, `['tenant_id']` indekslemesi.
- **B · yapısal kilit (EN GÜÇLÜ)** — `_shared/tenant*.ts` dosyaları `Request`'e **dokunamaz**: `Request`, `req.`, `headers.get`, `searchParams`, `atob(` geçerse FAIL. Kök sebep "tenant modülünün istek nesnesine erişebilmesi"ydi; bu kural o yeteneği dosya düzeyinde yok eder.
- **C · sıralama, dolaylı çağrıyı da yakalar** — bir `index.ts` hem `getUser` hem tenant çözümleyicisi içeriyorsa tenant satırı `getUser`'dan **sonra** olmalı. Bugün 5 bildirim ucunda ihlal → Adım 3'te yeşile döner.
- **D · sınıf-(b) kapısı** — gövdeden `tenant_id` okuyan `index.ts`, aynı dosyada service_role karşılaştırması içermelidir.

## 8. Doğrulanmamış varsayımlar (uygulamadan önce ölç)

1. `getUser(jwt)`'in döndürdüğü `app_metadata` token claim'i mi, DB'deki `raw_app_meta_data` mı? *(Plan buna bağımlı değil: otorite `user_profiles.tenant_id`, `app_metadata` yalnız çapraz kontrol.)*
2. Supabase Edge, `verify_jwt=true` iken doğrulanmış claim'leri bir başlıkla iletiyor mu? İletiyorsa `iyzico-payment` için RTT'siz kaynak olabilir.
3. Prod'daki gerçek fonksiyon sürümleri — Adım 0'da ölç.
4. Misafir ödeme akışı canlı mı? R1'in şiddeti buna bağlı.
5. `tenants` tablosunda per-tenant webhook secret'ı var mı? Faz 2'de sınıf (c) için gerekebilir.
6. e2e `denoRuntime` helper'ı yalnız `tenant_config.ts`'i adıyla derliyor; yeni bir `_shared` dosyası eklenince **genelleştirilmeli** — Adım 1'in gizli bağımlılığı.
