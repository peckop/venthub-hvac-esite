# Operasyon Döngüsü Denetimi — 2026-08-15

> **Şerit:** OPS-AUDIT (oturum `cb0467f1`) · **Kapsam:** salt-okuma; hiçbir kod değiştirilmedi.
> **Soru (Recep):** *"Ürün satacak bir siteyi aktif ettiğimde alış, satış, kargo, müşteri yönetimi,
> kullanıcı girişi gibi kalemlerin tam eksiksiz çalışması gerekmiyor mu?"*
> **Yöntem:** 5 paralel salt-okuma ajanı (sipariş+stok · kargo · iade · üyelik/hesap ·
> bildirim/fatura/satınalma), her bulgu dosya:satır kanıtıyla. `canliya-alma-hazirlik-2026-08-15.md`'nin
> bilerek dışarıda bıraktığı ekseni ölçer (o denetim kendi sınırlarında yazmıştı: *"uçtan uca gerçek
> satın alma hiç denenmedi, e-posta/SMS teslimi test edilmedi"*).
> **İş emirleri:** her bulgu kümesi registry'de `T052-VH`…`T062-VH` (SSOT = registry; bu belge anlatı+kanıt).

## 0. Tek cümlelik cevap

**Hayır — operasyonel döngü bugün eksiksiz çalışmıyor.** Görünen katman (vitrin → sepet → ödeme →
"siparişim nerede" ekranı) sağlam; ama arka ofis döngüsü beş ayrı yerde kırık ve kırıkların en
tehlikelileri **"sessiz sahte-başarı"** tipinde: sistem "yapıldı" diyor (stok düşüldü damgası,
"iadeniz tamamlandı" maili), gerçekte yapmıyor. Bu belge önceki LAUNCH denetiminin
"kritik yol içerikte, kodda değil" hükmünü **düzeltir**: kritik yol içerikte VE koddadır.

## 1. Eksen karnesi

| Eksen | Hüküm | İş emri |
|---|---|---|
| Satış (ödeme→sipariş yazımı) | ✅ SAĞLAM — sunucu fiyat otoritesi + snapshot'lı sipariş | — |
| Stok (satışta düşüm / iadede artış) | ❌ KIRIK — düşmüyor, ama tek yönlü şişiyor | `T052-VH` |
| İade / para iadesi | ❌ KIRIK — para iadesi hiç yapılmıyor (mock) | `T053-VH` `T057-VH` |
| Kargo ücreti | ❌ YOK — sabit "Ücretsiz", maliyet satıcıya | `T054-VH` |
| Fatura (e-arşiv) | ❌ YOK — hukuki bloklayıcı | `T055-VH` |
| Üyelik (şifre sıfırlama / OAuth) | ❌ KIRIK — kalıcı hesap kilidi | `T056-VH` |
| Kargo operasyonu (teslim zinciri) | 🟡 YARIM — kargolama çalışır, teslim asla kapanmaz | `T058-VH` |
| Hesap yüzeyi + admin müşteri desteği | 🟡 YARIM — favoriler 404, e-postasız müşteri listesi | `T059-VH` |
| Auth güvenlik (captcha/rate-limit/logout) | 🟡 YARIM | `T060-VH` |
| Stok alarmı + KVKK operasyonu | 🟡 YARIM / YOK | `T061-VH` |
| Bildirimler (e-posta zinciri) | 🟡 ÇALIŞIR ama TR-only, admin kopyası kapalı | `T061-VH` |
| Satınalma / tedarik (alış tarafı) | ❌ YOK — bloklayıcı değil, backlog | `T062-VH` |

## 2. Stok: satışta düşmüyor, iptalde şişiyor — `T052-VH` (CRITICAL)

Mekanizma kurulu ama kapı kapalı: callback başarılı ödemede `rpc/process_order_stock_reduction`
çağırıyor (`supabase/functions/iyzico-callback/index.ts:387-395`), RPC'nin ilk kapısı
`status IN ('paid','processing')` (`supabase/migrations/20260524_idempotent_stock_reduction.sql:32-44`),
ama callback siparişi `'confirmed'` yazıyor (`index.ts:301`) ve `'paid'` sipariş-statü sözlüğünde yok.
RPC her seferinde `Order not found or not in processed state` dönüyor; callback yalnız HTTP 200'e
bakıp `payment_debug.stock_processed=true` damgası basıyor (`:397-403`) → **sahte-başarı, log'dan
görünmez**. `venthub_order_items` üzerinde stok düşüren trigger yok; tek yol bu RPC.

Karşı yönde üç yol **koşulsuz** stok geri ekliyor (düşülmüş mü diye bakmadan):
`src/lib/orderStatusService.ts:212-256` (`restoreStockForOrder`, ayrıca read-then-write yarışı) ·
`supabase/functions/iyzico-refund/index.ts:178-199` (idempotency yorumda iddia, kodda flag yok) ·
`supabase/functions/release-expired-reservations/index.ts:144-160` (ödemesi hiç alınmamış `pending`
için `+quantity` = doğrudan hayali stok). `stock_reservations` tablosuna yazan kod yok.

Yan bulgular: sepete ekleme/ürün kartı/checkout sayfasında stok kontrolü hiç yok (tek kapı
`order-validate`'in `stock_issues`'u ve o hata müşteriye anlamsız "ödeme başlatılamadı" olarak düşüyor);
`order-validate:163-166` yetersiz stokta miktarı sessizce `available`'a indiriyor;
`order-housekeeping/index.ts:88,97` sözlükte olmayan `status='failed'` yazmaya çalışıp sessiz no-op oluyor.

> **Düzeltme sırası kritik:** önce geri-ekleme yolları `inventory_movements` `order_sale` kanıtına
> bağlanır, SONRA RPC kapısı `'confirmed'` kabul eder — ters sıra stoğu çift yönlü saptırır.

## 3. İade: para hiç dönmüyor, admin reddedemiyor — `T053-VH` + `T057-VH`

**Para iadesi (CRITICAL):** Admin `refunded` dediğinde çağrılan şey `refund-order-mock`
(`src/views/admin/ReturnsTableBody.tsx:340-348, 436-444`) — fonksiyonun kendi başlığı: *"no real PSP
call, only DB state updates"* (`supabase/functions/refund-order-mock/index.ts:5`). Gerçek
`iyzico-refund`'u çağıran **tek satır repoda yok**. Buna rağmen `payment_status='refunded'` yazılıyor,
audit düşülüyor ve müşteriye "iadeniz tamamlandı" e-postası gidiyor. `catch{}` yutması yüzünden mock
500 dönse bile statü geri alınmıyor. Mock'un stok-iade payload'ı da bozuk: `index.ts:111` PostgREST'e
geçersiz `{stock_qty:{increment:N}}` yazıyor (400, yutulur) → iade stoğu da artmıyor.

**Akış (HIGH):** `returnStatusMachine.ts:21`'de `requested→rejected` geçişi tanımsız — Reddet butonu
hiç render edilmiyor, toplu işlemdeki "Reddet" seçeneği her zaman 0 hedef bulup hata veriyor. Üç
çelişen durum makinesi var: istemci makinesi ↔ `returns-webhook/index.ts:147-152` rank haritası
(terminal `rejected`'i ileri taşıyabiliyor) ↔ DB'de geçiş trigger'ı hiç yok (admin PostgREST'ten
`refunded→requested` dahil her geçişi yapabilir). **RLS regresyonu:** orijinal
`returns_insert_own_order` (`202508271900_venthub_returns.sql:41-50`) sipariş sahipliğini şart
koşuyordu; canlı `returns_insert_policy` yalnız tenant+user kontrol ediyor → UUID bilen kullanıcı
başkasının siparişine iade kaydı açabilir. `syncOrderFromReturn` sipariş statüsünü **geriye** itiyor
(`rejected→delivered`, `approved→processing`; `received` anında para hareketi olmadan
`payment_status='refunded'`). 14 günlük cayma süresi hiçbir yerde zorlanmıyor; kısmi (kalem bazlı)
iade yok; `refund_amount`/`admin_notes`/`approved_at` kolonları var ama hiçbir kod yazmıyor.

## 4. Kargo: ücret sabit "Ücretsiz", teslim zinciri hiç kapanmıyor — `T054-VH` + `T058-VH`

**Ücret (CRITICAL, ticari):** `src/views/checkout/OrderSummarySidebar.tsx:98-101` ve
`CartPage.tsx:183-186` kargo satırı hardcoded "Ücretsiz"; `CheckoutPage.tsx:137-139` toplam = ürün −
kupon; sunucu tarafında da `shipping_cost` diye bir alan yok (repo genelinde sıfır eşleşme).
`shippingMethod` seçimi fiyata etki etmiyor. HVAC'ta 50-500 desi gerçeğinde nakliye maliyeti tamamen
satıcıya yazılır; sözleşme "özette gösterilir" dediği ve özet "Ücretsiz" gösterdiği için sonradan
tahsil hukuken kapalı. Desi altyapısı hazır ama kullanılmıyor (`products.weight_kg/*_mm`,
`database.types.ts:1585-1612`). `legal.ts:97-98` kargo placeholder'ları boş (MSY m.12/1: boşsa iade
kargosu satıcıya). **Önce Recep kararı: ücret politikası.**

**Operasyon (MEDIUM):** Taşıyıcı entegrasyonu yok — süreç %100 manuel (tek "entegrasyon" takip-linki
URL üretici, `AdminLogisticsTableBody.tsx:48-55`). Admin kargolama kuyruğu + toplu sevk + "kargoya
verildi" e-postası **çalışıyor** (tek gerçekten kapanan halka). Ama: `shipping-webhook` teknik olarak
sağlam (HMAC+timestamp+idempotency) ve **çağıranı yok** → `delivered` statüsü ve teslim maili hiçbir
yoldan oluşmuyor (kanban `delivered` sürüklemesi `delivered_at` yazmıyor, bildirim tetiklemiyor).
Veri bozan hata: `OrdersTableBody.tsx:783-795` toplu kargolamada **aynı takip no N siparişe**
yazılıyor. Ek: UPS seçeneği var ama takip linki üretilmiyor; `shipping-notification/index.ts:297`
koda gömülü kişisel BCC; `SHIP_EMAIL_BCC` default boş → admin'e sipariş kopyası gitmiyor;
`admin-update-order/index.ts:111` default `'paid'` (DB kısıtında olmayan değer); kanban'da statü
geçiş guard'ı yok (`delivered→pending` sürüklenebilir).

## 5. Fatura + bildirim + satınalma — `T055-VH` + `T061-VH` + `T062-VH`

**Fatura (CRITICAL, hukuki):** hiçbir fatura belgesi üretilmiyor — entegratör grep'i
(Paraşüt/BizimHesap/GİB/uyumsoft/Logo…) sıfır kod eşleşmesi, `invoices` tablosu yok,
`AccountInvoicesPage` fatura değil profil defteri. Toplama tarafı sağlam (bireysel/kurumsal +
TCKN/VKN + e-mükellef işareti siparişe yazılıyor) ama TCKN/VKN'de checksum yok ("11111111111" geçer).
Sözleşme "e-arşiv/e-fatura iletilir" taahhüt ediyor (`DistanceSalesAgreementContent.tsx:42`) →
faturasız ilk satış VUK + tüketici mevzuatı ihlali ve sözleşme aleyhte delil. **Önce Recep kararı:
entegratör seçimi (veya geçici "harici manuel kesim" + sözleşme ifadesinin düzeltilmesi).**

**Bildirimler (çalışır, eksikli):** sipariş onayı → kargo → teslim → iade e-posta zinciri Resend
üzerinden gerçekten bağlı (5 edge fn, gerçek tetikleyicilerle). Ama: hepsi TR-only
(`venthub_orders.locale` kolonu var, hiçbiri okumuyor); şifre-sıfırlama/kayıt maili markasız Supabase
varsayılanı; Twilio SMS/WhatsApp ölü kod (alıcı listesinde `sms:false` hardcoded, telefonlar boş
string); admin'e yeni-sipariş e-postası yok (realtime panel bildirimi yalnız açık sekmede).

**Stok alarmı (MEDIUM):** `stock-alert`'in tam-tarama yolu hiç tetiklenmiyor (repoda tek cron
`tcmb-rates-sync`); ön-filtre sabit `lte 10` → eşiği 10'un üstündeki ürün **asla** uyarı üretmez;
alıcı fallback'i muhtemelen olmayan `stok@venthub.com`.

**Satınalma (YOK, backlog):** purchase order / tedarikçi / mal kabul / maliyet belgesi yok; stok
girişi manuel CSV/RPC; `inventory_movements`'ta maliyet/belge/lot alanı yok → COGS hesaplanamaz.
Tek depo + düşük hacimde manuel taşınır; ölçekte veya Avens bayi kanalı öncesi kurulmalı (T010 zinciri).

## 6. Üyelik + hesap + auth güvenlik — `T056-VH` + `T059-VH` + `T060-VH`

**Şifre sıfırlama zinciri kopuk (HIGH):** `AuthContext.tsx:126` `resetPasswordForEmail`'de
`redirectTo` yok; **"yeni şifre belirle" sayfası repoda hiç yok** (`auth/reset-password` route'u
tanımsız); `AuthCallbackPage` `type=recovery`'yi ayırt etmiyor; tek şifre-değiştirme ekranı mevcut
şifreyi zorunlu tutuyor → şifresini unutan kullanıcı **kalıcı kilitli**. **Google OAuth 404 riski:**
`Routes.auth.callback()` = `/auth/callback`, sayfa yalnız `/[lang]/auth/callback`'te, middleware bu
yolu locale'den muaf tutuyor — canlıda uçtan uca doğrulanmalı. Middleware `?from=` yazıyor, LoginPage
`?redirect=` okuyor → dönüş yolu kaybolur; `?error=` parametresini kimse okumuyor.

**Hesap yüzeyi (MEDIUM):** header'daki favori kalbi **garantili 404** (`/account/favorites` sayfası
yok); ürün detayındaki kalp yalnız local state; proje listeleri servis+modal tam ama görüntüleme
sayfası yok ("ekler, bir daha göremez"); hesap özetindeki varsayılan adres kutusu boş görünür
(`full_address` hiç yazılmıyor); `/account/*` middleware'de korunmuyor (client guard dev'de kapalı).
**Admin müşteri desteği fiilen imkânsız:** "tümü" sekmesinde e-posta `undefined`, müşteri detay
sayfası yok, "bu müşterinin siparişleri" görünümü yok, sayfalama yok (1000-satır sessiz tavan).
Hesap silme / KVKK veri talebi mekanizması yok (`applicationEmail` placeholder) — LAUNCH'ın hukuk
işiyle birleşmeli (`T061-VH`).

**Auth güvenlik (MEDIUM):** CAPTCHA ve auth rate-limit yok (bot kayıt + credential stuffing açık);
**logout claims cache'i temizlemiyor** → admin çıkıştan sonra 15 dk `/admin` kapısından geçebilir
(`clearClaimsCacheCookie`'nin tek çağıranı hiç kullanılmayan signout route'u); signup `tenant_id`'yi
`user_metadata`'ya yazıyor, RLS `app_metadata` okuyor (T047 ailesi, kural 12 teması); forgot-password
kullanıcı enumerasyonu yapıyor. İyi taraf: şifre politikası + HIBP k-anonymity + re-auth gerçekten iyi.

## 7. Ne SAĞLAM (hakkını teslim)

- Ödeme→sipariş yazımı: sunucu fiyat otoritesi (`order-validate`), `AMOUNT_MISMATCH` kapısı,
  iki kolonlu fiyat snapshot'ı, kalemsiz sipariş oluşamıyor (#536/#539 sonrası).
- Müşteri sipariş görünümü: liste+detay+kargo takip+RLS doğru.
- Adres defteri, profil, şifre-değiştirme (bilinen şifreyle) tam CRUD.
- `shipping-webhook`'un iç güvenliği (HMAC + zorunlu timestamp + idempotency + tenant satırdan) örnek nitelikte.
- Admin kargolama kuyruğu (`confirmed/processing` + `shipped_at is null`) doğru tanımlı, sevk e-postası çalışıyor.

## 8. Şerit yönlendirme tablosu

| İş emri | Şiddet | Dokunduğu mülk | Önerilen sahip |
|---|---|---|---|
| `T052-VH` stok düşümü | CRITICAL | `iyzico-callback` + migrations | **PRICING/EDGE** (dosyalar zaten PRICING claim'inde) |
| `T053-VH` para iadesi | CRITICAL | `ReturnsTableBody` (UI) + `iyzico-refund` (fn) | **ADMIN-UX + EDGE** ortak |
| `T054-VH` kargo ücreti | CRITICAL-ticari | checkout + pricing | **RECEP kararı → PRICING** |
| `T055-VH` fatura | CRITICAL-hukuki | yeni modül | **RECEP kararı → sahipsiz** |
| `T056-VH` şifre sıfırlama/OAuth | HIGH | `src/app/[lang]/auth`, `AuthContext` | sahipsiz — **ALTYAPI alabilir** |
| `T057-VH` iade akışı | HIGH | admin UI + webhook + RLS | **ADMIN-UX + EDGE** |
| `T058-VH` kargo ops | MEDIUM | admin UI + edge fn | **ADMIN-UX + EDGE** |
| `T059-VH` hesap yüzeyi | MEDIUM | storefront + admin | **ADMIN-UX** + sahipsiz |
| `T060-VH` auth güvenlik | MEDIUM | middleware + auth | **EDGE + ALTYAPI** |
| `T061-VH` stok alarm + KVKK ops | MEDIUM | edge + legal | **EDGE + LAUNCH** |
| `T062-VH` satınalma modülü | BACKLOG | yeni modül | ölçek gelince |

## 9. Canlıya çıkış sırasına etkisi

`canliya-alma-hazirlik-2026-08-15.md §4` sırası geçerli kalır (fiyat seed ✅ oldu; şirket bilgileri,
görseller, alan adı, İyzico prod Recep'te) — ama araya **operasyonel minimum** girer. Kendine
soft-launch için bile satış öncesi kapanması gerekenler: `T052` (stok), `T053` (para iadesi),
`T054` (kargo ücreti kararı), `T055` (fatura kararı), `T056` (şifre sıfırlama + OAuth canlı testi).
Gerekçe: bunların dördü sessiz sahte-başarı — canlıda ilk hafta fark edilmeden zarar yazar.
Avens aşaması = ayrı bayi kanalı inşası (R0→B2, pano tablosu) + görseller + satınalma; bu denetimin
kapsamı dışında.

## 10. Sınırlar

- Salt statik ölçüm: canlı tarayıcıda uçtan uca satın alma yine **denenmedi** (S5 hâlâ açık);
  Google OAuth 404 riski canlıda doğrulanmalı.
- Prod DB'ye bakılamadı (`SUPABASE_ACCESS_TOKEN` ölü, `T030-VH`) — RLS regresyonu bulgusu
  iade ajanının canlı-şema okumasına dayanır, token gelince yeniden teyit edilmeli.
- Ajan raporları CodeGraph/diske karşı nokta doğrulaması yapılmadan derlendi; her iş emri
  uygulanmadan önce sahibi kendi mülkünde kanıtı yeniden üretmeli (kural: ajan raporu ≠ disk).
