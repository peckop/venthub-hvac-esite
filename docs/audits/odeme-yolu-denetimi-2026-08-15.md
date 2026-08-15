# Ödeme Yolu Denetimi — "Sepete Ekle"den Sipariş Satırına — 2026-08-15

> **Şerit:** LAUNCH (oturum `eda80084`) · **Kapsam:** salt-okuma. Hiçbir kod değiştirilmedi,
> prod'a hiçbir şey yazılmadı. Yapılan tek dış çağrı: `products` tablosuna anon anahtarla **GET**
> ve `order-validate`'e **POST** (bu uç yalnız `select` yapar, yazmaz).
> **Neden bu denetim:** `canliya-alma-hazirlik-2026-08-15.md` §S5 — `venthub_orders = 0`.
> Bugüne kadar tek bir gerçek satın alma denenmedi. Site açıldığında ilk parayı ödeyen kişi
> aynı zamanda ilk test edici olacak. Bu belge o yolu **okuyarak** izler.
> **Yöntem:** iddia yok. Her madde ya dosya/satır referansı ya da kontrol gruplu bir ölçüm taşır.

## 📌 SONRAKİ DURUM — aynı gün, denetimden birkaç saat sonra

Recep `SUPABASE_ACCESS_TOKEN`'ı yeniledi (`T030-VH` kapandı), böylece §7'de "ölçülemedi" diye
kaydettiğim iki şeyden biri **kesinleşti**:

- **CHECK kısıtı prod'dan doğrulandı.** `venthub_orders_status_check` =
  `pending·confirmed·processing·shipped·delivered·cancelled`. `paid`/`failed` gerçekten yok;
  `payment_status` ayrı kısıtta bu ikisini kabul ediyor. **Ö2 ve Ö3 artık çıkarım değil, ölçüm.**
- **Hâlâ ölçülemedi:** `iyzico-payment`'ın service_role ile yaptığı çağrının 401 aldığı. Bunun için
  service_role anahtarı gerekiyor; ajanın eline geçmemeli. Sandbox'ta tek bir gerçek ödeme turu
  bunu da kapatır.

**Ne onarıldı (ön-yüz yarısı, bu PR):**

| Bulgu | Durum |
|---|---|
| Ö1 · `validateServerCart` anon anahtarla çağrılıyordu | ✅ `supabase.functions.invoke` → oturum JWT'si |
| Ö1 · hata yutuluyordu (`console.warn` + devam) | ✅ **fail-closed** — doğrulama yoksa ödeme başlamaz |
| Ö1 · `iyzico-payment` içindeki service_role çağrısı ve `catch {}` fallback'i | ❌ **açık** — EDGE şeridi (`T041-VH`) |
| Ö2 · yoklayıcılar `status === 'paid'` bekliyordu | ✅ ikisi de `payment_status` okuyor |
| Ö2 · `vh_pending_order`'ı kimse yazmıyordu | ✅ ödeme başlarken yazılıyor, anahtar tek kaynaktan |
| Ö3 · başarısız ödeme `pending` donuyor | ❌ **açık** — callback'te, EDGE şeridi (`T042-VH`) |
| Ö4 · `ALLOWED_ORIGINS` fail-open | ❌ **açık** — EDGE şeridi (`T043-VH`) |
| Ö5 · `if (isTest) return true` | ✅ kaldırıldı |

Kalıcı bekçi: `src/__tests__/conformance/payment-integrity.test.ts` (**INV-PAY-1**, 6 kural) —
beş sabotajla kırmızı görüldü. Ayrıca `src/lib/__tests__/order.test.ts` yeniden yazıldı: eski hâli
`Authorization: 'Bearer test-anon-key'` bekleyerek **hatanın kendisini kilitliyordu**.

---

## 0. Tek cümlelik cevap

**Mutlu yol büyük ihtimalle çalışır; ama sunucunun fiyat otoritesi tamamen ölü ve iki kurtarma
mekanizmasının ikisi de hiç çalışmıyor.** Yani müşteri normal akışta ürünü alır, fakat (a) ödenecek
tutarı belirleyen tek yetkili taraf tarayıcıdır, (b) 3D-Secure penceresinden dönemeyen müşteri
için tasarlanmış telafi düzeneği kâğıt üstünde vardır, kodda yoktur.

---

## 1. Yolun haritası (ölçülmüş, tahmin değil)

```
[tarayıcı] sepet
   │
   ├─ useCheckoutOrchestrator     adım 1 müşteri · 2 adres+onaylar · 3 ödeme
   │     └─ validateLegalConsents()  ✅ hem 2→3 geçişinde hem ödemeden önce (INV-LEGAL-1)
   │
   ├─ useCheckoutPayment.initiatePayment()
   │     ├─ validateServerCart()  ──► order-validate   ❌ HER ZAMAN 401 (Ö1)
   │     │      └─ hata YUTULUYOR (console.warn) → yerel toplamla devam
   │     └─ buildPaymentRequest() ✅ fiyatsız kalem/eksik tahsilat korumaları var (testli)
   │
   ├─ supabase.functions.invoke('iyzico-payment')
   │     ├─ kimlik kapısı ✅ JWT'den user_id
   │     ├─ order-validate (service_role ile) ❌ aynı sebeple başarısız (Ö1)
   │     │      └─ catch{} → İSTEMCİNİN gönderdiği fiyatlara düşer
   │     ├─ venthub_orders INSERT  status='pending'  total_amount = istemci toplamı
   │     └─ İyzico'ya checkout-form; callbackUrl = iyzico-callback
   │
   └─ [banka 3DS] ──► iyzico-callback
         ├─ paid  → patchStatus('paid') ❌ CHECK reddeder → patchStatus('confirmed') ✅
         │            └─ order-confirmation e-postası + stok RPC (idempotent) ✅
         ├─ fail  → patchStatus('failed') ❌ CHECK reddeder, GERİ DÖNÜŞ YOK → 'pending' kalır (Ö3)
         └─ tarayıcıyı {origin}/payment-success?status=success|failure adresine yollar
                └─ PaymentSuccessPage ✅ sepeti temizler, özet gösterir
```

Paralel iki "telafi" düzeneği vardır ve **ikisi de hiç ateşlenmez** (Ö2).

---

## 2. KIRMIZI

### Ö1 · Sunucunun fiyat otoritesi TAMAMEN ölü — tutarı tarayıcı belirliyor

`order-validate` gerçek bir **kullanıcı JWT**'si ister (`auth.getUser`, `index.ts:54-57`) ve
kimliği gövdedeki `user_id`'den değil token'dan alır (`:66`). Oysa onu çağıran iki yerin **ikisi de
kullanıcı JWT'si göndermiyor**:

| Çağıran | Gönderdiği token | Sonuç |
|---|---|---|
| `src/lib/order.ts:34` (tarayıcı) | **anon anahtar** | **401 — ölçüldü** |
| `supabase/functions/iyzico-payment/index.ts:270` | **service_role anahtarı** | aynı sınıf token (`sub` claim'i yok) → aynı 401 |

**Ölçüm (kontrol gruplu, 2026-08-15):** frontend'in birebir yaptığı çağrı tekrarlandı.

```
A · frontend gibi (anon)      → 401 {"error":"unauthorized","message":"Invalid or expired token"}
B · KONTROL: Authorization yok → 401 {"code":"UNAUTHORIZED_NO_AUTH_HEADER"}
C · KONTROL: çöp token         → 401 {"code":"UNAUTHORIZED_INVALID_JWT_FORMAT"}
```

Üç farklı cevap geldi; yani araç **ölçüyor**. A'daki mesaj fonksiyonun **kendi** gövdesinden
(`index.ts:56`) — istek geçidi geçip fonksiyona ulaşıyor ve fonksiyon anon anahtarı reddediyor.

**İki tarafta da hata yutuluyor:**

- Tarayıcı: `useCheckoutPayment.ts:101-103` → `console.warn` → **yerel toplamla devam**.
- Sunucu: `iyzico-payment/index.ts:301-303` `catch {}` → `authoritativeItems` boş kalır →
  `:304-308` **istemcinin `cartItems`'ındaki fiyatlara düşer** ve toplamı onlardan hesaplar.

Kodun kendi yorumu bunu açıkça söylüyor (`:241`): *"amount/cartItems optional; we derive
authoritative items/total below"*. Tasarımın tamamı `order-validate`'in çalışmasına dayanıyor —
çalışmıyor.

**Sonuç:** `venthub_orders.total_amount` ve İyzico'dan çekilen tutar, **tarayıcının bildirdiği
fiyatlardan** hesaplanıyor. Değiştirilmiş bir istemci gerçek ürünler için istediği tutarı
gönderebilir. `buildPaymentRequest`'teki "eksik tahsilat" koruması da istemci tarafında olduğu için
aynı istemci tarafından atlanabilir.

> **Ne KANITLANMADI:** service_role çağrısının 401 aldığını doğrudan ölçemedim (anahtar bende yok
> ve olmamalı). Ölçülen anon anahtar ile service_role anahtarı **aynı sınıf** proje JWT'sidir:
> ikisinde de `role` claim'i vardır, `sub` claim'i yoktur; `auth.getUser` her ikisinde de kullanıcı
> döndüremez. Bu yapısal bir çıkarımdır — SUPABASE_ACCESS_TOKEN yenilenince tek çağrıyla
> kesinleştirilmeli.

**Kapatan test yok.** `useCheckoutPayment` için kapsayan test bulunamadı (CodeGraph),
`e2e/checkout-smoke.e2e.ts:28` `describe.skip` ile karantinada.

---

### Ö2 · İki kurtarma mekanizması da hiç ateşlenmiyor

Ödeme sonrası müşteriyi kurtarmak için iki bağımsız düzenek yazılmış. İkisi de **imkânsız bir
durum sözcüğünü** bekliyor.

`venthub_orders_status_check` yalnız şunlara izin veriyor
(`supabase/baselines/2026-06-12_public_schema.sql:469`; sonraki migration'larda bu kısıt
değiştirilmemiş — `ALTER TABLE ... venthub_orders` taraması yalnız kolon eklemeleri gösteriyor):

```
pending · confirmed · processing · shipped · delivered · cancelled
```

`'paid'` **yok** — o ayrı bir kolonun (`payment_status`) değeri.

| Düzenek | Beklediği | Gerçekleşebilir mi |
|---|---|---|
| `useCheckoutPayment.ts:169` (3 sn'lik yoklama) | `status === 'paid'` | ❌ asla |
| `PaymentWatcher.tsx:30,33` | `status === 'paid'` / `'failed'` | ❌ asla |

`PaymentWatcher`'ın ayrıca **ikinci** bir ölü noktası var: tetikleyicisi `localStorage`'daki
`vh_pending_order` anahtarı, ama **kodun hiçbir yeri bu anahtarı YAZMIYOR** — dokuz kullanımın
hepsi `getItem`/`removeItem`. Yani `MainLayout:107` ile her sayfaya monte edilen bu bileşen
hiçbir koşulda çalışmaya başlamıyor.

**Bugün neden felaket değil:** mutlu yol bu düzeneklere bağlı değil. `iyzico-callback` tarayıcıyı
`?status=success` ile `payment-success`'e yolluyor ve `PaymentSuccessPage.tsx:57-70` sepeti orada
temizliyor.

**Ne zaman ısırır:** müşteri o yönlendirmeye ulaşamazsa — 3DS penceresini kapatırsa, banka
uygulamasına geçip geri dönmezse, mobilde sekme düşerse. Tam da bu düzeneklerin var olma sebebi.
O müşteri parayı ödemiş, sepeti hâlâ dolu, ekranında onay yok; sistemin onu geri alma yolu yok.

---

### Ö3 · Başarısız ödeme `pending` olarak donuyor

`iyzico-callback/index.ts:453` başarısızlıkta `patchStatus('failed')` çağırıyor. `'failed'` de
CHECK listesinde yok → PATCH reddedilir. Başarılı dalda (`:251-253`) `'paid'` reddedilince
`'confirmed'`e düşen bir geri-dönüş var; **başarısız dalda böyle bir geri-dönüş yok**.

Sonuç: ödemesi reddedilen sipariş satırı `status='pending'`, `payment_status='pending'` kalır —
yani *"müşteri ödemeyi yarıda bıraktı"* ile *"banka reddetti"* veri tabanında **ayırt edilemez**.
`payment_debug` da yazılamaz (aynı PATCH içinde). Admin ekranı ve `order-housekeeping` bu ikisini
aynı görür.

---

## 3. SARI

### Ö4 · `ALLOWED_ORIGINS` boşsa her origin kabul (fail-open)

`iyzico-payment/index.ts:38` → `const okOrigin = allowed.length === 0 || ...`. Değişken tanımlı
değilse köken denetimi **tamamen kapanır**. Bu, ödeme sonrası dönülecek adresi de etkiler:
`successUrl`, isteğin `Origin`/`Referer` başlığından türetiliyor (`:338-348`) ve İyzico'ya
gönderiliyor (`:552`). Köken denetimi kapalıyken bu başlık saldırganın kontrolündedir.

Prod'da değişkenin dolu olup olmadığını **ölçemedim** (Supabase erişimi kapalı — `T.GEN.SIS.1508261705A.VH`).
Kural olarak: yeni bir kapıya "değer yoksa geç" davranışı koymak fail-open'dır
(bkz. `no-grace-mode-for-new-gates` dersi).

### Ö5 · Ödeme yolu yapı gereği test edilemez halde

`useCheckoutPayment.ts:83-84`:

```ts
const initiatePayment = async () => {
  if (isTest) return true      // ← test ortamında akış HİÇ çalışmaz, hep "başarılı"
```

Yani bu fonksiyonu test etmek isteyen her test, kodu değil bu kısayolu ölçer. Buna e2e
karantinası da eklenince (`e2e/checkout-smoke.e2e.ts:28` `describe.skip`) ödeme hunisinin
**hiçbir katmanında** çalışan bir kapı kalmıyor. Ö1, Ö2 ve Ö3'ün üçünün de fark edilmeden
yaşayabilmesinin sebebi budur.

---

## 4. ⚠️ ÖNCEKİ BULGUMDA DÜZELTME — `select=* &` zararsızmış

Bugün erken saatte `order-validate/index.ts:95`'teki `select=* &` kalıntısını (URL şablon
dizesinde boşluk) bulmuş, `T040-VH`'yi **HIGH** açmış ve "ürün çekimini bozabilir" demiştim.
**Ölçtüm, bozmuyor.** PostgREST boşluğu tolere ediyor:

```
KONTROL sağlıklı   /products?select=id&limit=1                → 200, satır döndü
BOZUK              /products?select=* &id=in.(<gerçek uuid>)  → 200, TAM satır döndü
DÜZELTİLMİŞ        /products?select=*&id=in.(<gerçek uuid>)   → 200, aynı satır
```

Bozuk ve düzeltilmiş biçim **birebir aynı** sonucu veriyor. Kalıntı gerçek — otomatik
`_`-rename bozulmasından arta kalmış bir kozmetik iz — ama **işlevsel etkisi yok**. `T040-VH`
LOW'a çekildi ve açıklaması düzeltildi; EDGE'e panodan bildirildi.

**Ders (yine aynı ders):** "bozulma imzası taşıyor" ≠ "bozuk". İşlev iddiası, tek bir HTTP
çağrısıyla ölçülebiliyorsa **iddia edilmeden önce ölçülmeli**. Bu turda önce iddia ettim,
sonra ölçtüm; sırası yanlıştı.

---

## 5. YEŞİL — bakıp geçilmesin diye yazıldı

- **Yasal onay kapısı sağlam.** `useCheckoutOrchestrator:189-213` onayları hem 2→3 geçişinde
  (kutuların göründüğü yer) hem de `initiatePayment` öncesinde zorluyor; `INV-LEGAL-1` kilitliyor.
- **`buildPaymentRequest` gerçek korumalar taşıyor ve testli:** fiyatsız kalem varsa ödeme hiç
  kurulmuyor (`CartItemPriceMissingError`), tahsil edilecek tutar kalem toplamının altına inemiyor
  (`PaymentAmountMismatchError`). *(İstemci tarafında oldukları için Ö1'i telafi etmezler — ama
  dürüst kod.)*
- **Dil öneki korkusu yersiz.** Callback `{origin}/payment-success` üretiyor (dilsiz), rota ise
  `src/app/[lang]/payment-success`. `src/middleware.ts:83-87` `nextUrl.clone()` ile yalnız
  `pathname`'i değiştirip 307 veriyor → **sorgu dizesi korunuyor**, `?status=success&orderId=`
  hedefe sağlam ulaşıyor. Fazladan bir hop, hata değil.
- **Sipariş satırı ödemeden ÖNCE yazılıyor** (`status='pending'`), böylece callback kaybolsa bile
  ödemenin karşılığı bir kayıt duruyor.
- **Stok düşümü idempotent RPC ile** (`process_order_stock_reduction`) ve yalnız ödeme başarılıysa.
- **Kimlik kapısı doğru:** sipariş sahibi gövdeden değil doğrulanmış JWT'den alınıyor; gövdedeki
  `user_id` yalnız tutarlılık kontrolü (uyuşmazlıkta 403).

---

## 6. Önerilen sıra ve sahiplik

| # | İş | Neden bu sıra | Şerit |
|---|---|---|---|
| 1 | `order-validate` çağrılarını gerçek kullanıcı JWT'si ile yap **veya** fonksiyonu servis-içi çağrı için ayrı bir kimlik yoluyla aç | Ö1 diğer her şeyin altında; fiyat otoritesi olmadan tutar güvenilir değil | EDGE (+ `src/lib/order.ts` LAUNCH) |
| 2 | İki çağırandaki **sessiz yutmayı** kaldır: doğrulama başarısızsa ödeme başlamasın | Fail-open'ı fail-closed yap; 1 gecikirse bile bu tek başına korur | EDGE + LAUNCH |
| 3 | Durum sözcüğünü tek kaynağa indir: yoklayıcılar `payment_status`'a baksın **veya** CHECK listesine `paid`/`failed` eklensin (migration → Recep onayı) | Ö2 ve Ö3'ün ortak kökü | PRICING/EDGE + Recep |
| 4 | `patchStatus('failed')` için geri-dönüş (`cancelled`?) + `vh_pending_order`'ı yazan taraf | Ö2/Ö3'ün kalan ayakları | EDGE |
| 5 | `if (isTest) return true` kaldırılıp bağımlılıklar enjekte edilsin; `checkout-smoke` karantinadan çıksın | Kapı olmadan 1-4 tekrar çürür | LAUNCH |

**Migration uyarısı:** 3. madde `venthub_orders_status_check`'i değiştirirse **migration**'dır ve
master'a merge = prod'a otomatik uygulama demektir (CLAUDE.md kural 13). Recep onayı olmadan
merge edilmez.

---

## 7. Bu denetimin sınırları (dürüst kapsam)

- **Prod DB'ye ve deploy edilmiş fonksiyon kaynağına bakılamadı** — `SUPABASE_ACCESS_TOKEN` ölü
  (`T.GEN.SIS.1508261705A.VH`). Yani bulgular **repo'daki master** sürümüne aittir; prod'da daha
  eski/farklı bir sürüm koşuyor olabilir (`T.GEN.SIS.1408261346A.VH` deploy sapması hâlâ açık).
- **CHECK kısıtı prod'dan doğrulanmadı**; kanıt zinciri: baseline şeması + kısıtı değiştiren
  migration bulunmaması + callback'in *"constraint nedeniyle reddedilirse"* diye yazılmış geri-dönüşü
  + 08-13 denetiminin canlı DB ölçümü. Dördü aynı yöne işaret ediyor ama bu, tek bir doğrudan
  sorgunun yerini tutmaz.
- **Gerçek bir ödeme yapılmadı.** İyzico sandbox'ta uçtan uca bir tur atılmadı; bu belge kodu
  okur, davranışı değil. Ö1 ve Ö3 sandbox'ta tek turda kesinleşir.
- **İade/iptal yolu (`iyzico-refund`), kupon ve kargo entegrasyonu kapsam dışı.**
