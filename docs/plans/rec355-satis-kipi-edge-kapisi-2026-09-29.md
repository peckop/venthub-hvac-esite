# REC-355 alt işi — ödeme edge fonksiyonunda sunucu tarafı satış kipi kapısı (plan v2, 2026-09-29)

**Durum: PLAN v2 (plan-challenger sonrası, hüküm KOŞULLU → K1-K9 işlendi). Kod yok; OPS onayı olmadan koda başlanmaz.**

## Cetvel (bu planı yöneten)
- `docs/standards/satis-kipi-gecis-standard.md` (URUN; §3 arayüz, §7.1 önizleme provası, §8 satır 9, §11 fail-closed).
- URUN planı `docs/plans/rec168-satis-kipi-db-plani-2026-09-29.md` (PR #1522): veritabanı tarafı ve RPC. **Bu plan yalnız EDGE OKUMASINI kapsar.**
- `docs/standards/execution-method-standard.md`; emsal desenler: `_shared/revenue_alarm.ts` (gelir yolunu kesen dallar alarm yazar), `_shared/config_audit.ts` (`resolveIyzicoBase().ortam`), `payment-edge-integrity.test.ts`.
- Cetvel eksiği: "hangi edge yolu satış kipine bağlı" kararı yazılı değildi; §3 yazar, cetvele işlenir (iş kapsamında).

## 1. Ölçülen (2026-09-29, salt okuma; challenger ile doğrulandı)
| Bulgu | Kanıt |
|---|---|
| Edge'de satış kipi kontrolü YOK | `supabase/functions/` altında `satis_kipi`/`site_settings`/`sales_mode` sıfır eşleşme |
| Tek kapı istemci tarafı | `checkout/page.tsx` RSC'si `satisKipiOku()` (fail-closed) |
| Sipariş yazan ve ödeme oturumu açan tek dosya `iyzico-payment` | `venthub_orders` POST satır ~496; `checkoutFormInitialize` yalnız burada |
| `order-validate` salt okur, hiçbir tabloya yazmaz | fiyatlar zaten anon okunuyor; tek istemci çağıranı `useCheckoutPayment.ts:169`; içeriden `iyzico-payment` çağırıyor (satır ~330) |
| Canlı `payment` satırı edge'i bağlamıyor | yalnız yönetici arayüzü okuyor |

**Ölçülmedi (probe planı §5):** oturumlu doğrudan POST bugün ne dönüyor; canlı `IYZICO_BASE_URL` sandbox mı; PostgREST'in RPC'ye fazladan anahtarda tepkisi (canlıda RPC yok).

## 2. Sözleşme ve bağımlılıklar
`public.satis_kipi_oku()` → **jsonb** `{"acik": boolean, "damga": timestamptz|null}`; yalnız gerçek JSON boolean `true` açar. SECURITY DEFINER, STABLE, `search_path=''`, parametresiz; EXECUTE anon+authenticated+service_role. **Edge, service_role ile çağırır.**
- **Bağımlılık 1 (K5):** "string `true` açmaz" iddiası URUN v2 SQL'inin `jsonb_typeof(...)='boolean'` kontrolüne dayanır (v1 taslağı `(value->>'acik')::boolean` kullanıyordu: `"t"`, `"yes"`, `"1"` açardı). v2 birleşmeden bu iddia doğru değildir. Canlı doğrulama betiği `{"acik":"true"}` → `false` kolunu ROLLBACK'li sınamalı (URUN'un işi; edge güvencesi buna bağlı).
- **Bağımlılık 2 (§7 challenger):** `site_settings`'e moderator dahil yönetici rolleri yazabiliyor (`20260617000000_site_settings_admin_rls.sql`); edge kapısının bütünlüğü URUN'un RESTRICTIVE politikasına bağlı. O politika inmeden anahtarı açmak güvenli değildir.

## 3. Kapsam: HANGİ YOLLAR BAĞLANIR (K3: order-validate ÇIKARILDI)
| Fonksiyon | Kapı | Gerekçe |
|---|---|---|
| `iyzico-payment` | **VAR** (kimlikten sonra, `order-validate` çağrısından ve sipariş yazısından ÖNCE) | Yeni ödeme oturumu açan ve sipariş yazan TEK yol |
| `order-validate` | **YOK** | 0 yazma yolu; ikinci kapı hiçbir koruma katmaz, `iyzico-payment` içindeki çağrı iki kapı arasında kapanırsa YANLIŞ ETİKETLİ gelir alarmı (`VALIDATION_UNAVAILABLE`) ve "fiyat doğrulanamadı" mesajı üretir; ayrıca iki fonksiyonun dağıtımı atomik değil |
| `iyzico-callback`, `order-paid-webhook`, `iyzico-refund`, `admin-iyzico-reconcile`, `refund-order-mock` | **YOK** | Uçuştaki ödeme/iade; kapatmak parası çekilmiş müşteriyi siparişsiz bırakır. Kapı "yeni ödeme oturumu sayacı"dır, koruma perdesi değil |
| `quote-request-guest` | **YOK** | Teklif kipi satıştan bağımsız |

## 4. Tasarım (K4, K7, K8 işlendi)
1. **Saf karar fonksiyonu** `supabase/functions/_shared/satis_kipi.ts`: `satisKipiKarari({supabaseUrl, serviceRoleKey, tenantId, fetchImpl, zamanAsimiMs, requestId, corsHeaders}) → Promise<{engel: Response|null, neden}>`. Vitest'ten gerçek `Response` nesneleriyle sınanır (handler'a gömülmez). RPC fetch'i BU dosyada kalır; çağrı yerinde yalnız argüman geçilir (T041 testinin `order-validate` çevresindeki −600/+400 karakter penceresi `Authorization…serviceRoleKey` arıyor: çağrı yerinde o desen yazılmaz).
2. **Nedenler ve yanıtlar (K4):**
   - `KAPALI` (RPC `acik===true` döndürmedi, bozuk değil): **403** `SALES_CLOSED`, alarm YOK, sipariş/rezervasyon oluşmaz.
   - `RPC_YOK` (404), `YETKI` (401/403), `HATA` (5xx), `ZAMAN_ASIMI`, `BOZUK_CEVAP` (dizi, `{acik:1}`, `null`, JSON olmayan gövde): **503** `SALES_STATE_UNAVAILABLE` + `Retry-After` + `raiseRevenueAlarm({code:'SALES_MODE_UNREADABLE', extra:{neden}})` (satış AÇIKKEN geçici DB dalgalanması sessiz "kapalı" olmasın; açılış sonrası `RPC_YOK` tüm satışı sessizce durdurmasın).
   - Zaman aşımı kolunda **tek yeniden deneme** (okuma idempotent), toplam ≤3 sn; `AbortController` + kendi `Promise.race` zamanlayıcısı (sahte fetch sinyali yok sayarsa test asılmasın); gövde okuması da süre kapsamında.
   - Tüm yanıtlara `corsHeaders` + `X-Request-Id` (yoksa tarayıcı saydam olmayan ağ hatası gösterir).
3. **Kapının yeri:** sunucu yapılandırma kontrolü (satır ~286) SONRASI, `order-validate` çağrısı ve sipariş yazısından ÖNCE; kimlik doğrulamadan SONRA (gerekçe düzeltildi, K9: anahtar sır değil, URUN sözleşmesi RPC'yi anon'a açık tutar; sebep anonim isteklerin zaten 401 alması ve gereksiz RPC harcanmaması).
4. **tenantId (K7):** yardımcı imzası `tenantId` alır, bugün RPC'ye GİTMEZ (Faz 2 PARK, REC-88: RPC parametresiz; ileride parametre alır); çağıran `caller.tenantId` geçer, konformans bunu yoklar. Gövdeye tenant konmaz (PostgREST'in parametresiz fonksiyona fazladan anahtarı büyük olasılıkla 404 `PGRST202` ile reddedip tüm satışı kapatması ÖLÇÜLMEDİ, tuzak).
5. **Deploy (K1):** `deploy-functions.yml` `push: master` + `supabase/functions/**` ile tetiklenir: **merge = prod edge dakikalar içinde canlı**; "edge deploy ayrı kapı" YANLIŞTI. PR gövdesinde yazılı olacak; merge onayı Recep'ten. `_shared/**` değişince `edge-shared-input-drift.yml` prod token'ıyla çalışır.

## 5. Kanıt planı (K2, K8)
- **Yazmasız ÖNCE/SONRA probe (K2, planın "ölçülmedi"sini kapatır):** test kullanıcısı JWT'siyle, boş sepet + geçerli e-posta/adres ile `iyzico-payment`'a POST. ÖNCE beklenen: 409 `VALIDATION_EMPTY_CART` (akışın kapıya kadar geldiğini kanıtlar; sipariş yazısına varmaz). SONRA (kapı canlı): 403 `SALES_CLOSED`. Rate-limit satırı dışında yazma yok. Cetvel §8 satır 9'a "edge kapısı canlı ölçüldü (403 probe)" ön koşulu eklenir; `--uygula`dan ÖNCE koşulur. Ayrıca kimlikli `healthz` ile `odemeOrtami` okunur (yazmadan).
- **Konformans `INV-SATIS-KIPI-EDGE-1`:** (a) kapı kararı SAF fonksiyon, gerçek `Response` ile: `true`, `false`, string `"true"`, dizi, `{acik:1}`, `null`, JSON olmayan gövde, HTTP 401/404/500, zaman aşımı (sahte fetch sinyali yok sayar) → yalnız gerçek `true` açar, doğru kod/gövde/başlık; (b) **evren tabanlı** kural: içinde `checkoutFormInitialize` geçen ya da `venthub_orders`'a POST atan HER edge fonksiyonu kapıyı içe aktarmalı (bugün tek dosya: `iyzico-payment`; yarın `iyzico-payment-v2` sessizce kapısız kalamaz); ayrıca kapısızlığı BİLİNÇLİ olanlar (callback/webhook/refund) ilan listesinde gerekçeli; (c) sıra: kapı çağrısı `order-validate` çağrısından ve sipariş POST'undan ÖNCE (metin, tek kol); (d) boş koşum kapısı: kaç çağrı yeri bulduğunu doğrulamadan "geçti" demez; (e) sabotaj: kapı satırını silince (a-c) kırmızı.
- Envanter satırı; PR gövdesinde "merge = prod edge canlı".

## 6. Canlıya çıkış sırası (K2)
Kapı tek yönlü (yalnız gerçek `true` açar) ve fail-closed: edge PR'ı migration'dan ÖNCE, AYNI ANDA ya da SONRA inebilir. **Ama "bugünkü davranış" cümlesi edge için yanlıştı:** bugün edge'de kapı yok, yetkili bir istemci doğrudan POST ile ödeme oturumu üretebilir (ölçülmedi); kapı edge'de davranışı SIKILAŞTIRIR. En iyisi edge PR'ının önce inmesi (olası açığı erken kapatır). RPC yokken her yetkili doğrudan POST bir `SALES_MODE_UNREADABLE` alarm satırı yazar; bu gerçek durumu gösterdiği için kabul edilebilir, ama OPS bilmeli. **Tek tehlikeli geçiş `satis_kipi.acik=true` yazımıdır:** edge kapısı canlıda ölçülmeden (probe) yapılmaz; çevirme yalnız betikle (`satis-kipine-gec.mjs`), panelden ya da elle yazım TUTARSIZ hâl üretir.

## 7. AÇIK KARAR (OPS/Recep): sandbox uçtan uca deneme ile çelişki (K6)
Edge tek dağıtım, prod DB'yi okur. Kapı canlıya girince önizlemedeki `SATIS_KIPI_ONIZLEME` zorlaması yanıltıcı olur (önizleme ödemeyi açık gösterir, edge 403 döner; cetvel §7.1 provası yarım kalır).
| Seçenek | Değerlendirme |
|---|---|
| A: DB'de kısa açık pencere | Tüm ziyaretçiler için fiyat+ödeme yüzeyi prod'da açılır; elle yazım tutarsız hâl üretir. Önerilmez |
| B: DB sözleşmesine test kullanıcısı | URUN sözleşmesini değiştirir, ödeme yoluna kalıcı atlama koyar |
| **B′: edge'e özgü deneme izni (önerim)** | Kullanıcı listesi bir edge secret'ı (`SATIS_KIPI_DENEME_KULLANICILARI`), DB/sözleşme DEĞİŞMEZ; yalnız `resolveIyzicoBase(env).ortam === 'sandbox'` iken geçerli (canlı anahtarlar konunca izin kendiliğinden ölür); eşleşme doğrulanmış JWT'den `caller.user.id` ile, gövdeyle değil; her kullanım günlüğe; kollar: prod+listedeki→kapalı, sandbox+listede olmayan→kapalı, sandbox+listedeki→açık, secret boş→yok, sabotaj: ortam kontrolünü silince kırmızı |
**Uyarı:** sandbox deneme siparişi bile prod DB'ye yazar (sipariş, stok hareketi, e-posta): test hesabı + temizlik planı gerekir; canlı `IYZICO_BASE_URL`'in sandbox olduğu ÖLÇÜLMEDİ (kimlikli `healthz`, yazmadan). B′ için AYRI kayıt (numarasını OPS verir).

## 8. Kapsam dışı
- `site_settings` yazma daraltması + `satis_kipi` RESTRICTIVE politikası → URUN'un satış kipi migration'ı (tek yerde).
- Toplu `anon` revoke (50/60 tablo) → ayrı plan, satıştan önce.
- Gerçek oturumlu ödeme → İyzico sandbox uçtan uca planı.
