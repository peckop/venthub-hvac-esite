# Edge Function Güvenlik Cetveli (Edge Function Security Standard) — v1.0

> **SSOT.** `supabase/functions/**` altındaki her Deno fonksiyonunun **kimlik doğrulama, yetkilendirme,
> CORS ve deploy** duruşunu sabitler. Fonksiyon *ne yaptığı* burada değil — bu cetvel **kime cevap
> verdiğini** ve **neyi kanıtlaması gerektiğini** tanımlar.
> **Kapsam:** `supabase/functions/**` + `supabase/config.toml` + `.github/workflows/deploy-functions.yml`.
> Sınır: DB tarafı yetki → RLS/`supabase-security` · şema yıkımı → `migration-safety-standard.md`.
> v1.0 · 2026-08-14 — 26 fonksiyonun uçtan uca denetimi ve **4 canlı anonim açığın** kapatılması sonrası ilk sürüm.

---

## 1. Niçin: 26 fonksiyon, 26 farklı güvenlik duruşu

`docs/standards/` altında 19 cetvel vardı; **edge katmanı için hiçbiri yoktu.** Sonuç: her fonksiyon
kendi güvenlik modelini icat etti. 2026-08-14 ölçümü:

| Bulgu | Ölçülen |
|---|---|
| **Canlı anonim açık** (`verify_jwt=false` + gövdede sıfır kontrol) | **4** |
| **Yatay yetki açığı** (`verify_jwt=true` ama rol kontrolü yok) | **2** |
| **`auth.getUser()` argümansız** (edge'de daima 401) | **16** |
| **Elle yazılmış, `Access-Control-Allow-Origin`'i olmayan CORS objesi** | **9** |
| **Yanıltıcı per-fonksiyon `supabase.toml`** (CLI okumaz, no-op) | **6** |
| **`config.toml` ↔ prod çelişkisi** | **3** |
| **Prod'da donmuş sürüm** (CI yalnız 7/26 deploy ediyordu) | **19** |

Dört canlı açığın somut hâli — hepsi kimliksiz `curl` ile erişilebilirdi:

- `admin-order-inspect` v17 → `service_role` ile **tam sipariş satırı** (ad, e-posta, telefon, adres) döndürüyordu.
- `admin-iyzico-reconcile` v20 → bekleyen siparişleri sayıyor **ve ödeme callback'i tetikliyordu** (YAZMA).
- `refund-order-mock` v8 → imzasız `atob(jwt.split('.')[1])` ile **sahte `sub` kabul** → iade + stok iadesi.
- `stock-alert` v13 → toplu **e-posta/SMS** tetiklenebiliyordu.

Sorun tek tek fonksiyonların "dikkatsizliği" değil; **hangi çağıranın hangi kanıtı sunması gerektiği
hiçbir yerde yazılı değildi.** Bu cetvel onu yazar.

---

## 2. Çağıran sınıfları — her kuralın çıkış noktası

Bir fonksiyonun güvenlik duruşu, **kimin çağırdığından** türetilir. Dört sınıf vardır, başka yoktur:

| # | Çağıran | Taşıdığı kanıt | `verify_jwt` | Gövdede zorunlu |
|---|---|---|---|---|
| **a** | Tarayıcı + oturumlu kullanıcı | Kullanıcı JWT'si (`Authorization: Bearer <user jwt>`) | **true** | `getUser(jwt)` + **rol/sahiplik** kontrolü |
| **b** | Sunucu→sunucu (bizim altyapımız) | `Authorization: Bearer <service_role>` | **true** | Anahtarın service_role olduğunun doğrulanması |
| **c** | Harici sistem (ödeme/kargo/iade) | JWT **gönderemez** → HMAC imzası + timestamp | **false** (meşru) | **HMAC + replay guard, fail-closed** |
| **d** | `pg_cron` (DB içi zamanlayıcı) | Hiçbir auth header'ı yok | **false** (meşru) | Yan etkisi idempotent + dışa veri sızdırmaz |

**Fonksiyonun dosya başında, `Deno.serve`'den önce hangi sınıfa ait olduğu yorumla yazılır.**
Sınıfı yazılmamış yeni fonksiyon review'da reddedilir — çünkü sınıf belirlenmeden §3–§6 uygulanamaz.

**Kanonik biçim** (E11/R10 bunu birebir dayatıyor — serbest metin KABUL EDİLMEZ):

```ts
// Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
```

Kural: satır dosyanın **ilk 15 satırı içinde** ve `serve(`/`Deno.serve(` çağrısından **önce** olmalı;
parantez içi tam olarak `a`, `b`, `c` veya `d`. Ardından serbest açıklama gelebilir.
Bugün **26/26 fonksiyonda beyan YOK** — hepsi R10 baseline'ında borç olarak duruyor; yeni fonksiyon
beyansız eklenemez.

---

## 3. Değişmezler (İHLAL ETME)

### 3.1 `verify_jwt` varsayılanı **true** — false yalnız "çağıran JWT gönderemiyorsa"

**KURAL.** Yeni her fonksiyon `verify_jwt = true` ile başlar. `false` yalnız çağıran sınıfı **(c)** veya
**(d)** ise, yani çağıranın teknik olarak JWT üretme imkânı yoksa meşrudur. "Kolay olsun", "test
edemedim", "storefront'tan auth'suz çağrılıyor" gerekçeleri **geçersizdir**.

**Bugün meşru olan tam liste** (bunun dışına çıkmak PR'da gerekçe ister):

| Fonksiyon | Sınıf | Meşruiyet |
|---|---|---|
| `iyzico-callback` | c | Ödeme sağlayıcısı çağırıyor, JWT gönderemez |
| `returns-webhook` | c | Harici kargo/iade sistemi — gövdede HMAC + 5dk replay guard **var** |
| `shipping-webhook`, `shipping-status` | c | Harici kargo sistemi |
| `tcmb-rates-sync` | d | `pg_cron` çağırıyor, hiç auth header'ı yok |

**NEDEN.** `admin-order-inspect`, `admin-iyzico-reconcile`, `refund-order-mock`, `stock-alert` —
dördü de sınıf (a) çağıranı olan uçlardı ama `verify_jwt=false` ile prod'da duruyordu. Gövdede de
kontrol olmadığı için **kimliksiz istek doğrudan `service_role` verisine ulaştı.**

❌ **İHLAL** — sınıf (a) ucunda:
```toml
[functions."admin-order-inspect"]
verify_jwt = false          # "admin paneli kendi kontrol ediyor"
```
✅ **DOĞRU**:
```toml
[functions."admin-order-inspect"]
verify_jwt = true           # sınıf (a) — oturumlu admin tarayıcısı
```

### 3.2 Gövde yetkisi **ZORUNLU** — kimlik ≠ yetki

**KURAL.** `verify_jwt = true` bir yetkilendirme değildir. Admin/ayrıcalıklı her uçta gövde içinde
**rol kontrolü** (veya kaynak sahipliği kontrolü) yapılır ve başarısızlıkta **403** dönülür.

**NEDEN.** `admin-orders-latest` ve `admin-update-shipping` `verify_jwt=true` idi ama gövdede rol
kontrolü yoktu: **oturum açmış herhangi bir müşteri** tüm siparişleri sayfalayabiliyor, hatta herhangi
bir siparişin kargo bilgisini **yazabiliyordu**. `verify_jwt=true` yalnız "geçerli BİR JWT var" der,
"bu kişi YETKİLİ" demez.

❌ **İHLAL**:
```ts
const { data: userRes } = await supabaseUser.auth.getUser(jwt)
if (!userRes?.user) return json({ error: 'unauthorized' }, 401)
// ...ve doğrudan service_role ile TÜM siparişler
```
✅ **DOĞRU** (kanonik desen — `admin-order-inspect` düzeltilmiş hâli):
```ts
const { data: userRes, error: userErr } = await supabaseUser.auth.getUser(jwt)
if (userErr || !userRes?.user) return json({ error: 'unauthorized' }, 401)

const { data: profile, error: profErr } = await supabaseAdmin
  .from('user_profiles').select('role').eq('id', userRes.user.id).maybeSingle()
const userRole = profile?.role as string | undefined
if (profErr || !userRole || !['admin', 'superadmin'].includes(userRole)) {
  return json({ error: 'forbidden' }, 403)
}
```
- Rol okuması **`supabaseAdmin` (service_role)** ile yapılır — kullanıcı client'ı RLS altında kendi
  profilini görmeyebilir; ama **okunan `id` daima doğrulanmış JWT'den gelir**, istekten değil.
- İstek gövdesinden gelen `user_id` / `role` / `is_admin` alanları **asla** yetki kaynağı olamaz.

### 3.3 `getUser(jwt)` — argümansız çağrı **YASAK**

**KURAL.** `auth.getUser()` daima **token açıkça geçirilerek** çağrılır: `auth.getUser(jwt)`.

**NEDEN.** supabase-js v2'de argümansız `getUser()` önce **oturum deposuna** bakar. Edge runtime'da
oturum deposu **yoktur** → `Auth session missing` → istek 401 alır. Global `Authorization` başlığı bu
yolda kullanılmaz. 16 fonksiyonda bu hata vardı; `order-validate`'de sonucu şuydu: **oturum açmış
kullanıcının checkout doğrulaması prod'da 401 alıyordu** — yani hata sadece güvenlik değil, işlevsel.

❌ **İHLAL**:
```ts
const supabaseUser = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
const { data } = await supabaseUser.auth.getUser()      // edge'de DAİMA "Auth session missing"
```
✅ **DOĞRU**:
```ts
const authHeader = req.headers.get('Authorization')
if (!authHeader) return json({ error: 'unauthenticated' }, 401)
const jwt = authHeader.replace(/^Bearer\s+/i, '')
const { data, error } = await supabaseUser.auth.getUser(jwt)
```

**Ek yasak:** JWT'yi **elle çözmek**. `atob(jwt.split('.')[1])` imzayı doğrulamaz — `refund-order-mock`
bu yolla **sahte `sub`** kabul ediyor, iade + stok iadesi yapıyordu. Token doğrulaması yalnız
`auth.getUser(jwt)` ile yapılır.

### 3.4 CORS tek kaynak — elle `cors` objesi **YASAK**

**KURAL.** CORS başlıkları yalnız `_shared/cors.ts` → `getCorsHeaders(req)` ile üretilir.
`OPTIONS` isteği bu başlıklarla 200 döner. Hata cevapları dâhil **her** `Response` bu başlıkları taşır.

**NEDEN.** Bir codemod 9 fonksiyonda `getCorsHeaders` import'unu bırakıp **çağrıyı sildi** ve yerine
elle yazılmış, içinde `Access-Control-Allow-Origin` **bulunmayan** bir obje koydu. Tarayıcıdan çağrılan
her fonksiyon bu hâliyle tamamen kırıktı — ve hiçbir statik kapı bunu görmedi.

❌ **İHLAL**:
```ts
import { getCorsHeaders } from '../_shared/cors.ts'   // import var, çağrı yok
const cors = { 'Access-Control-Allow-Headers': 'authorization, content-type' }  // ACAO YOK
```
✅ **DOĞRU**:
```ts
import { getCorsHeaders } from '../_shared/cors.ts'
Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  ...
})
```

### 3.5 Webhook kuralı — HMAC + replay guard, **fail-CLOSED**

**KURAL.** Sınıf (c) fonksiyonlarında `verify_jwt=false` olduğu için **tek kimlik kanıtı gövdededir**:
1. Ham gövde üzerinden **HMAC-SHA256** imza doğrulaması (`x-signature`, sabit-zamanlı karşılaştırma),
2. **Zorunlu** timestamp header'ı + dar pencere (≤5 dk) replay guard,
3. Sır **yoksa** veya imza **yoksa** → **401**. Fonksiyon açılmaz.

**NEDEN.** Sırrın tanımsız olduğu durumda isteği geçiren "değer yoksa uyar-geç" geçiş modu,
`verify_jwt=false` ile birleştiğinde ucu **tam anonim** yapar — bugün kapattığımız 4 açığın mekanik
eşdeğeri. Bu bilinçli bir yasaktır: **yeni bir güvenlik kapısına asla "geçiş modu" konmaz.**

❌ **İHLAL**:
```ts
const secret = Deno.env.get('RETURNS_WEBHOOK_SECRET') || ''
if (!secret) { console.warn('secret yok, atlanıyor'); /* devam */ }   // fail-OPEN
```
✅ **DOĞRU** (`returns-webhook` deseni):
```ts
const secret = Deno.env.get('RETURNS_WEBHOOK_SECRET') || ''
const sign   = req.headers.get('x-signature') || ''
if (!secret || !sign || !(await hmacValid(secret, raw, sign))) {
  return json({ error: 'Invalid signature' }, { status: 401 })
}
const ts = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''
if (!ts) return json({ error: 'Missing timestamp header' }, { status: 401 })
if (Math.abs(Date.now() - Date.parse(ts)) > 5 * 60_000) {
  return json({ error: 'Stale or invalid timestamp' }, { status: 401 })
}
```

**Uygulanma durumu (2026-08-15, T025-VH).** `shipping-webhook` aylarca *"başlık varsa uygula"*
ile duruyordu — yani başlığı göndermeyen çağıran için replay guard hiç çalışmıyordu (**fail-OPEN**),
kardeşi `returns-webhook` ise başlığı zaten zorunlu tutuyordu. Asimetri kapatıldı, ikisi de zorunlu.
Kapıyı sıkı kurmanın en ucuz anı buydu: entegre bir kargo sağlayıcısı henüz **yok**, kıracak canlı
çağıran da yok. → **Sağlayıcı bağlanırken `x-timestamp` (veya `x-event-time`) göndermesi
ENTEGRASYON ÖN KOŞULUDUR**; bu, sağlayıcıya iletilecek teknik gerekliliktir, sonradan gevşetilecek
bir kural değil.

Kilit: `tests/e2e/adversarial.test.ts` test 7 — *geçerli imzalı ama timestamp'siz* istek 401 almalı.
Mevcut 5 ve 6 numaralı testler bu hâli **göremiyordu** (5'te imza hiç yok, 6'da timestamp var ama
bayat), fail-open ay boyunca yeşil kaldı. Kilit bilerek-bozularak kanıtlandı: guard geri alınınca
test 7 FAIL etti.

**Adlandırılmış istisna — `SHIPPING_WEBHOOK_TOKEN` (legacy).** `shipping-webhook`, HMAC'e ek olarak
statik bir `x-webhook-token` yolunu da kabul ediyor. Bu yol da **fail-closed**'dır (env tanımlı
değilse hiç açılmaz) ve artık zorunlu replay guard'ın arkasındadır. Yine de HMAC'ten zayıftır:
sır dönmez, gövdeye bağlı değildir. **Gerçek sağlayıcı bağlanınca kaldırılacaktır**; o güne kadar
sandbox/test yolu olarak adıyla kayıtlıdır (`tests/e2e/adversarial.test.ts` bu yolu sınıyor).

### 3.6 `service_role` kuralı

**KURAL.**
- `service_role` anahtarı **istemciye asla** dönmez (cevap gövdesinde, hata mesajında, log'da).
- `service_role` client'ı **kimliği doğrulanmamış bir isteğe cevap üretmekte asla** kullanılmaz.
- Sıra sabittir: **önce kimlik (§3.3) → sonra yetki (§3.2) → ancak sonra `supabaseAdmin`.**

**NEDEN.** `admin-order-inspect` kimlik kontrolünden **önce** `service_role` ile RPC çağırıyordu;
tam sipariş satırı (ad/e-posta/telefon/adres) anonim isteğe döndü. RLS'in bütün koruması `service_role`
ile atlanır — bu yüzden o client'a geçiş noktası, fonksiyonun **güvenlik kapısının çıkışı** olmalıdır.

❌ **İHLAL**: `const admin = createClient(url, serviceRoleKey)` → hemen sorgu → sonuç dön.
✅ **DOĞRU**: 401/403 kapıları geçildikten sonra `supabaseAdmin` kullanılır; hata cevaplarında
anahtar veya ham `resp.text()` içeriği sızdırılmaz.

### 3.7 `config.toml` **tek kaynaktır**

**KURAL.**
- `verify_jwt` yalnız `supabase/config.toml` içinde tanımlanır. **Per-fonksiyon
  `supabase/functions/<ad>/supabase.toml` OLUŞTURMA** — Supabase CLI bu dosyaları **okumaz**.
- Her `[functions."<ad>"]` bloğu **tek satırlık gerekçe yorumu** taşır (çağıran sınıfı + kanıtı).
- Bir değeri değiştirmeden önce **prod'daki gerçek değer doğrulanır**
  (`mcp__supabase__list_edge_functions`). Repo değeri prod'dan **daha gevşekse** deploy **koruma düşürür**.

**NEDEN.** 6 adet per-fonksiyon `supabase.toml` vardı; hepsi no-op ve **yanıltıcıydı**:
`order-housekeeping`'te `false` yazıyordu, prod `true` idi; `shipping-notification`'daki
*"storefront'tan auth'suz çağrılıyor"* yorumu **yanlıştı** (uç sunucu-sunucu çağrılıyor). Hepsi silindi.
Ayrıca `config.toml` ↔ prod arasında **3 çelişki** vardı: `admin-orders-latest` prod'da `true`,
config'te `false` — o hâliyle yapılacak deploy **canlı korumayı kaldıracaktı**.

### 3.8 Deploy disiplini — donmuş sürüm = donmuş açık

**KURAL.**
- `deploy-functions.yml` **`supabase/functions/*` altındaki her fonksiyonu** kapsar; elle tutulan
  kısmi liste yasaktır (kapsam dizin taramasından türetilir).
- Yeni fonksiyon eklendiğinde deploy kapsamına girmesi **otomatik** olmalıdır.
- Fonksiyon değişikliği içeren PR merge edilmeden önce §4 doğrulaması yapılır.

**NEDEN.** CI bugüne dek **26 fonksiyondan yalnız 7'sini** deploy ediyordu; kalan **19'u** prod'da
2025-09 / 2026-03 sürümlerinde donmuştu. "Deploy etmiyoruz, o yüzden güvendeyiz" **yanlıştır**:
donmuş sürüm o günün açığını da dondurur — 4 canlı açığın hepsi donmuş sürümlerdeydi. Repo ≠ prod
sapması hem denetimi yanıltır (kaynağa bakan "düzelmiş" sanır) hem düzeltmeyi engeller.

> **Ters yön aynı derecede tehlikelidir:** repo'daki kod prod'dan **fakirse** (codemod hasarı, §3.4)
> deploy bir **regresyon**dur. Bu yüzden §3.7'nin "önce prod'u doğrula" kuralı deploy için de geçerlidir.

### 3.9 `tenant_id` **doğrulanmış** kimlikten türetilir — AÇIK BORÇ

**KURAL.** Bir isteğin hangi tenant'a ait olduğu, **imzası doğrulanmış** JWT'nin
`app_metadata.tenant_id` alanından okunur. Query string / gövde alanı **yalnız** çağıranın JWT
üretemediği sınıf (c)/(d) uçlarında, ve **yalnız** o ucun kendi imza kontrolünden **sonra** kabul edilir.

**BUGÜNKÜ DURUM: bu kural İHLAL EDİLİYOR** — `_shared/tenant_config.ts:16-39` (`resolveTenantId`):

1. `?tenant_id=` query parametresi **her şeyden önce** okunuyor (satır 19-21) → JWT'yi **ezer**;
2. JWT dalı da payload'ı `atob()` ile **imzasız** çözüyor (satır 29) → sahte payload kabul edilir.

Yani tenant sınırı ikisi de **istekten** geliyor. Tek tenant (`DEFAULT_TENANT_ID`) canlıyken sömürü
etkisi sınırlıdır; **Faz 2 (multi-tenant) açılır açılmaz bu doğrudan data-bleeding'dir** —
CLAUDE.md §12'nin ihlali. Fonksiyonlar `tenant_id`'yi PostgREST filtresine koyduğu için etki
"başka tenant'ın satırını oku/yaz"a kadar gider.

**Neden bu PR'da düzeltilmedi:** doğru düzeltme sırayı çevirmek DEĞİL — `atob` kaldıkça saldırı
query-param'dan sahte-JWT'ye taşınır, kapanmaz. Gerçek çözüm `resolveTenantId`'yi **async** yapıp
`auth.getUser(jwt)` ile doğrulanmış `app_metadata`'dan okumaktır; bu 26 fonksiyonun çağrı yerini
etkiler ve kendi doğrulama turunu hak eder. Yarım düzeltme "kapandı" yanılsaması üretirdi.

**Ratchet durumu:** iki kural da CANLI ve ikisinin de baseline'ında bu dosya adıyla duruyor —
`atob` için **R6**, sıralama için **R11** (`_shared/tenant_config.ts:20`). Yeni bir ihlal FAIL eder;
düzeltme yapılınca **iki baseline satırı da silinmelidir** (stale-guard zaten zorlar).
Göç planı: `docs/plans/tenant-id-hardening-2026-08-15.md` (7 adım, ölçülmüş çağıran envanteriyle).

---

## 4. Doğrulama — kaynağa bakarak değil, **ÇAĞIRARAK**

**KURAL.** Bir fonksiyonun güvenli olduğu, kodunu okuyarak değil **prod'a istek atarak** kanıtlanır.
Deploy sonrası her fonksiyon için üç çağrı:

```bash
# 1) Kimliksiz istek reddediliyor mu?  Beklenen: 401 (sınıf a/b) · 401 (sınıf c — imza yok)
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$FN_URL" -H 'Content-Type: application/json' -d '{}'

# 2) Geçerli ama YETKİSİZ kullanıcı reddediliyor mu?  Beklenen: 403  (§3.2 yatay yetki)
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$FN_URL" -H "Authorization: Bearer $CUSTOMER_JWT" -d '{}'

# 3) CORS preflight ACAO dönüyor mu?  Beklenen: 200 + Access-Control-Allow-Origin
curl -s -D - -o /dev/null -X OPTIONS "$FN_URL" \
  -H 'Origin: https://venthub-hvac-esite.vercel.app' | grep -i 'access-control-allow-origin'
```

- **200 dönen kimliksiz istek = açık.** Cevabın "boş" olması savunma değildir — `stock-alert` boş
  cevap dönerken e-posta/SMS gönderiyordu; **yan etki cevapta görünmez.**
- Sınıf (d) fonksiyonlarında (1) 200 dönebilir; bu durumda kanıt yükü **idempotentlik + veri
  sızdırmamak**tır ve PR açıklamasında yazılır.
- Statik kapılar bu sınıfı **göremez**: `deno check` tip hatasını yakalar, `verify_jwt=false` +
  boş gövdeyi yakalamaz. Runtime çağrısı zorunludur.

---

## 5. Makine ile denetlenebilir maddeler (conformance testi için liste)

Aşağıdakiler `src/__tests__/conformance/` altında **statik** INV testine dönüşebilir. Testi yazacak
ajan için net kapsam (statik-tarama gotcha'ları → `conformance-test-static-scan-gotchas`:
`import.meta.glob`, tam-literal kök glob, ratchet + stale-guard):

**Durum sütunu = kapı GERÇEKTEN var mı.** Cetvelin master'da olması işin yapıldığı anlamına gelmez;
`CANLI` olanlar `src/__tests__/conformance/edge-security.test.ts` içinde **bilerek-boz-kırmızı-gör**
yöntemiyle kanıtlandı. 2026-08-15: R1/R4/R6 kasten bozuldu (üçü de dosya:satır ile FAIL);
sonra R7/R8/R9/R10/R11 de tek tek bozuldu — R10 hem **yeni-ihlal** hem **bayat-baseline** yönünde
(baseline'dan çıkan bir adı silmeyi de zorluyor). Kanıtsız hiçbir kural CANLI sayılmadı.

| # | Kural | Taranan | FAIL koşulu | Durum |
|---|---|---|---|---|
| **E1** | §3.3 argümansız `getUser()` yasak | `supabase/functions/**/*.ts` | `\.auth\.getUser\(\s*\)` eşleşmesi > 0 | **CANLI — R1** |
| **E2** | §3.3 elle JWT çözme yasak | aynı | `atob(` geçiyor | **CANLI — R6** (baseline: `tenant_config.ts:29`) |
| **E3** | §3.4 CORS tek kaynak | aynı | `getCorsHeaders` **import ediliyor** ama **çağrılmıyor** | **CANLI — R2** |
| **E4** | §3.4 elle cors objesi yasak | aynı | `Access-Control-Allow-` literali `_shared/cors.ts` **dışında** geçiyor | **CANLI — R3** (baseline: `apply-coupon`) |
| **E5** | §3.7 per-fonksiyon toml yasak | `supabase/functions/*/supabase.toml` | dosya sayısı > 0 | **CANLI — R4** |
| **E6** | §3.1 `verify_jwt=false` allow-list | `supabase/config.toml` | `false` olan uçta gövdede kimlik/imza sinyali yok | **CANLI — R5** (baseline: `iyzico-callback`, `shipping-status`; muaf: `tcmb-rates-sync`) |
| **E7** | §3.7 config kapsamı | `config.toml` ↔ `functions/*/` dizinleri | dizini olup `[functions."x"]` bloğu olmayan fonksiyon | **CANLI — R7** (baseline: 26'nın 13'ünde blok yok) |
| **E8** | §3.8 deploy kapsamı | `.github/workflows/deploy-functions.yml` | elle sabit fonksiyon listesi içeriyor (dizin taraması değil) | **karşılandı** — liste `scripts/edge/select-functions.mjs` ile türetiliyor; ayrıca `scripts/edge/drift-check.mjs` repo↔prod sapmasını CI'da ölçüyor |
| **E9** | §3.2 admin ucu rol kontrolü | `functions/admin-*/index.ts` | dosyada `'admin'`/`'superadmin'` rol kontrolü yok | **CANLI — R8** (baseline BOŞ — 6/6 admin ucu geçiyor) |
| **E10** | §3.5 webhook fail-closed | `functions/*webhook*/index.ts` | HMAC imza doğrulaması **veya** ZORUNLU timestamp guard'ı yok | **CANLI — R9** (baseline BOŞ — `shipping-webhook` T025-VH ile uyumlu hâle geldi) |
| **E11** | §2 çağıran sınıfı beyanı | `functions/*/index.ts` | ilk 15 satırda ve `serve()`'den önce geçerli beyan yok | **CANLI — R10** (baseline: 26/26 — hiçbirinde beyan yok) |
| **E12** | §3.9 `tenant_id` önceliği | tüm edge kaynakları | doğrulanmamış `tenant_id` okuması `getUser()`'dan **önce** (ya da `getUser` hiç yok) | **CANLI — R11** (baseline: `_shared/tenant_config.ts:20` — §3.9 borcu) |

**Makine ile denetlenemeyenler** (insan/runtime kapısı, §4'e bağlıdır):
`config.toml` ↔ **prod** sürüm çelişkisi (canlı sorgu gerektirir) · gerçek 401/403 davranışı ·
sınıf (d) fonksiyonlarının idempotentliği · CORS'un tarayıcıda gerçekten çalışması.

---

## 6. Karar kayıtları (kısa gerekçe)

- **Varsayılan `true`, istisna adla listelenir (§3.1):** "gerekçesi olan false" serbest bırakılsaydı
  bugünkü 4 açığın hepsi gerekçeli görünüyordu (`# admin paneli kontrol ediyor`). İstisna **isimle**
  sayılabilir olmalı ki E6 testi denetleyebilsin.
- **Gövde yetkisi, `verify_jwt`'ye rağmen zorunlu (§3.2):** platform kapısı kimliği doğrular, yetkiyi
  bilmez — `admin-orders-latest` ve `admin-update-shipping` bunun canlı kanıtıdır.
- **"Geçiş modu" yasağı (§3.5):** eksik sırda uyarıp geçmek kapıyı fail-open yapar; kapı ya vardır
  ya yoktur. Karşı taraf uyamıyorsa bypass değil, guard onun şemasına uyarlanır.
- **`config.toml` tek kaynak, per-fonksiyon toml silindi (§3.7):** okunmayan dosya yalnız yanlış
  bilgi üretir; 6 dosyanın bir kısmı prod'la **ters** değer ve **yanlış** çağıran açıklaması taşıyordu.
- **Doğrulama = çağırmak (§4):** bu turda hiçbir statik kapı (tsc, lint, `deno check`) 4 açığın
  birini bile görmedi; hepsi ilk kimliksiz `curl` ile ortaya çıktı.
