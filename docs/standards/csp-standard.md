# CSP Standardı (Content-Security-Policy)

> **Durum:** v1.0 · 2026-08-17 · Şerit: LEGAL-SEO
> **Bekçi:** `INV-CSP-1` → `src/__tests__/conformance/csp-origin-coverage.test.ts`
> **Kardeş bekçi:** `INV-3D-5` → `src/__tests__/conformance/3d-csp.test.ts` (yalnız `connect-src` + 3D CDN'leri)
> **SSOT:** politika metni `next.config.mjs` `headers()` içinde, TEK yerde.

## 0. Bu cetvel niçin var

`docs/standards/analytics-standard.md` (satır 86-92) şu tuzağı adıyla yazmıştı:

> CSP **uygulanır hâle getirildiği an GA sessizce ölür** — konsolda blok, panelde veri yok,
> sebep görünmez. İkisi farklı zamanlarda farklı kişilerce yapılırsa bağlantı kurulamaz.

Doğru teşhis, ama yanlış araç: bir **kontrol listesi maddesi** zaman farkına dayanmaz. Kodu
yazan kişi altı ay önce gitmiş olur, CSP'yi enforce'a alan kişi o maddeyi hiç görmez. Bu cetvel
aynı bilgiyi **çalışan bir bekçiye** çevirir.

Ölçüm bunu doğruladı: 2026-08-17'de kaynak tarandığında GA/GTM dışında **dört origin daha**
CSP'de eksikti (§6). Hiçbiri bugün görünmüyordu, çünkü politika Report-Only.

## 1. Bugünkü mod: Report-Only (hiçbir şeyi engellemez)

`next.config.mjs` başlığı `Content-Security-Policy-Report-Only`. Tarayıcı ihlalleri **raporlar,
engellemez**. Sonuç: eksik bir origin bugün **hiçbir belirti üretmez**. Bu, CSP'nin en tehlikeli
hâlidir — güvenlik hissi verir, koruma vermez ve eksiklerini gizler.

Buradan çıkan tek kural: **CSP'nin doğruluğu tarayıcıdan değil, bekçiden öğrenilir.**

## 2. Düşmemesi gereken sertleştirme direktifleri (stale-guard)

Aşağıdakiler politikadan **çıkarılamaz** (`INV-CSP-1` kilitler):

| Direktif | Değer | Neyi engeller |
|---|---|---|
| `object-src` | `'none'` | Eski eklenti tabanlı enjeksiyon yüzeyi |
| `frame-ancestors` | `'none'` | Clickjacking (`X-Frame-Options`'ın CSP karşılığı) |
| `base-uri` | `'self'` | `<base>` enjeksiyonuyla tüm göreli URL'lerin kaçırılması |
| `form-action` | `'self'` | Form gönderiminin yabancı sunucuya yönlendirilmesi |

Ayrıca CLAUDE.md #9 gereği 3D asset CDN'leri (`raw.githubusercontent.com`, `raw.githack.com`)
`connect-src`'ten **kaldırılamaz** — bunu `INV-3D-5` kilitler.

## 3. Yeni bir dış origin eklerken (tek kural)

> **Bir dış origin'e bağımlı hâle gelen kod ile o origin'in CSP kaydı AYNI PR'da girer.**

Kullanım sınıfı → direktif eşlemesi:

| Kod'da ne yapıyorsun | Direktif |
|---|---|
| `<Script src="https://…">` / `<script src>` | `script-src` |
| `<iframe src="https://…">` | `frame-src` |
| `fetch('https://…')`, XHR, WebSocket, `sendBeacon` | `connect-src` |
| CSS `@import url('https://…')`, uzak stylesheet | `style-src` |
| Uzak görsel | `img-src` (bugün `https:` geneli açık) |
| Uzak font dosyası | `font-src` (bugün `https:` geneli açık) |

**Geri-düşme (fallback) tuzağı — en pahalısı:** bir direktif politikada **hiç yoksa** tarayıcı
`default-src`'e düşer. `default-src 'self'` altında bu, "yazmayı unutmak" ile "açıkça yasaklamak"ın
**aynı şey** olması demektir. Bu repoda `frame-src` tam olarak böyle eksikti: YouTube ve Cloudflare
Stream gömüleri enforce'a geçildiği gün sessizce boş çerçeveye dönecekti. Bir direktifi
"yazmadım çünkü kısıtlamak istemedim" diye atlamak **tam tersini** yapar.

## 4. Bekçinin kapsamı — ölçmediği sınıflar ADIYLA

`INV-CSP-1` kaynak tarar. Neyi **görmediğini** bilerek yazıyoruz; yoksa "ihlal yok" sonucu
ölçümden değil körlükten gelir:

**Görür:** `src/**` altında literal URL taşıyan `<Script src>` / `<script src>` / `<iframe src>` /
`fetch(...)` / `@import url(...)`.

**Görmez:**
- **Host'u çalışma anında kurulan** çağrılar (`https://${process.env.X}/...`). Bunlar statik
  çözülemez → testteki `DYNAMIC_HOST_DECLARATIONS` listesine **elle** kaydedilir. Liste bir
  muafiyet değil **ratchet'tir**: kayıtsız yeni bir dinamik-host kullanımı testi KIRMIZI yakar,
  kayıtlı host CSP'de aranır, kullanımı kalkan kayıt "ölü kayıt" diye KIRMIZI yakar.
- **Üçüncü-parti script'in kendi alt-istekleri.** GTM yüklendikten sonra
  `*.google-analytics.com`'a olay gönderir; bu istek **kaynakta hiç görünmez**. Bu tür
  origin'ler §6 tablosuna elle girilir.
- `next/image` uzak host'ları — `images.remotePatterns` ile ayrı yönetilir (`img-src` zaten `https:`).
- `supabase/functions/**` — Deno, sunucu tarafı. CSP tarayıcıya bakar.

**Dedektörün kendi körlükleri (ikisi de bu bekçiyi yazarken CANLI yakalandı, ikisi de sabotajla kilitlendi):**
1. **Yorum sıyırıcı URL'i yer.** Naif bir `//`-sıyırıcısı `https://host` içindeki `//`'ı yorum
   başlangıcı sanar ve URL'i `https:`e indirger — yani dedektörün **aradığı şeyi yok eder**. İlk
   sürümde tam olarak bu oldu: tarama SIFIR kullanım buldu. Çözüm `(?<!:)`.
2. **CRLF.** Repo dosyaları CRLF; JS'te `.` satır sonlandırıcı `\r` ile eşleşmez, `/\/\/.*$/`
   hiçbir şey sıyırmaz. Çözüm `[^\r\n]`.

## 5. Enforce'a geçiş — AYRI VE BÜYÜK karar (Recep kapısı)

`Content-Security-Policy-Report-Only` → `Content-Security-Policy` geçişi bir yapılandırma
düzeltmesi **değildir**; koruma modunu değiştirir ve yanlışsa vitrini kırar. Ön koşullar:

1. §6 tablosundaki her origin politikada, `INV-CSP-1` yeşil.
2. Report-Only raporlarında **sıfır ihlal** kanıtlanmış (canlı trafikle, bir sürüm boyu).
3. `'unsafe-inline'` / `'unsafe-eval'` kararı verilmiş. Bugün ikisi de `script-src`'te açık ve
   XSS korumasının çoğunu boşa çıkarır. Bunları kaldırmak nonce/hash altyapısı ister — **ayrı iş**.
4. **Recep onayı.** (CLAUDE.md: geri alınamaz / dışa dönük etkisi olan kararlar.)

`INV-CSP-1` bu geçişi **yasaklamaz**, sessizce olmasını yasaklar: header anahtarı değişirse test
KIRMIZI yanar ve geçişi yapanı bu bölüme bakmaya zorlar.

## 6. Origin sicili (2026-08-17 ölçümü)

| Origin | Direktif | Nereden | Kaynakta görünür mü |
|---|---|---|---|
| `*.supabase.co`, `wss://*.supabase.co` | `connect-src` | Supabase istemcisi | evet |
| `*.vercel-insights.com` | `connect-src` | Vercel Analytics | hayır (SDK) |
| `raw.githubusercontent.com`, `raw.githack.com` | `connect-src` | 3D GLB/GLTF — CLAUDE.md #9 | evet |
| `www.googletagmanager.com` | `script-src` | `ConsentGatedAnalytics.tsx` (GA4 etiketi) | evet |
| `*.google-analytics.com` | `connect-src` | GTM'in olay ucu | **hayır** — elle |
| `api.pwnedpasswords.com` | `connect-src` | `passwordSecurity.ts` sızmış-parola kontrolü | evet |
| `www.youtube.com` | `frame-src` | `VideoAuthority.tsx` YouTube gömüsü | evet |
| `*.cloudflarestream.com` | `frame-src` | `VideoAuthority.tsx` Cloudflare Stream | **dinamik** — kayıtlı |
| `fonts.googleapis.com` | `style-src` | `InventoryQrLabel.tsx` yazdırma etiketi `@import` | evet |
| `*.iyzipay.com` | `script-src`, `frame-src`, `form-action`, `connect-src` | İyzico gömülü ödeme formu (T080) | **hayır** — secret + Edge |

**Bilinen açık kalem (bu cetvelin işi değil, sahibi ADMIN):** `InventoryQrLabel.tsx` bir admin
yazdırma etiketi için Google Fonts'tan `@import` yapıyor. CSP'ye eklendi (çalışsın diye), ama
doğru çözüm muhtemelen etiketi yerel fontla basmak — dış bağımlılık ne kadar azsa CSP o kadar dar
olur. Sahibine bırakıldı.

### 6.1 İyzico — gömülü form (2026-08-18, T080-P2)

Bu cetvelin ilk sürümü İyzico'yu sicile ALMAMIŞTI ve gerekçesi doğruydu: ödeme tam sayfa
yönlendirmeyle gidiyordu, CSP'yi hiç ilgilendirmiyordu. Recep **A = gömülü form** kararını
verince kapı açıldı ve dört yüzey birden doğdu — script yüklenir, iframe açılır, form POST
edilir, XHR atılır. Dördü de politikaya girdi.

**Niçin joker (`*.iyzipay.com`), tek tek host değil:** gerçek taban adres `IYZICO_BASE_URL`
secret'inde yaşıyor (kodda yalnız `sandbox-api.iyzipay.com` yedeği görünür) ve sağlayıcı
sandbox ile prod için ayrı alt alanlar kullanıyor (`sandbox-api`, `api`, `sandbox-static`,
`static`). Tek tek yazmak **yanlış host'a demirlemek** riski taşır ve hata ancak enforce
gününde ödeme yolunda görünür. Joker iki aileyi de kapsar; apex `iyzipay.com`'i **kapsamaz**,
yani hâlâ dar.

**Kilit:** INV-CSP-1 içinde "ödeme sağlayıcı origin dört direktifte de izinli" iddiası. Bu host
taramayla bulunamaz (secret'ten kurulur + Edge fonksiyonunda yaşar — §4'ün iki kör sınıfı),
o yüzden ADIYLA kilitlendi. Dört direktiften biri düşerse kapı, düşen direktifi adıyla
söyleyerek kırmızı yanar; bilerek bozularak kanıtlandı.

**AÇIK RİSK — ölçülmedi (sahibi PRICING):** 3D Secure adımında bankanın ACS sayfası İyzico'nun
kendi iframe'i içinde açılıyorsa bizim `frame-src`'imize yalnız iyzipay yeter. Bazı akışlarda
banka sayfası üst çerçeveye ya da bizim iframe'imize düşebiliyor; o durumda **banka alan
adları** da gerekir — bu sınırsız bir listedir ve CSP ile yönetilemez. PRICING gerçek sandbox
ödemesiyle ölçecek. **Enforce kararı bu ölçüm gelmeden verilmemeli** (§5 ön koşullarına ek).

**Rapor ucu YOK (ölçüm, 2026-08-18):** yapılandırmada ne `report-uri` ne `report-to` var.
Report-Only raporları hiçbir yere gitmiyor, yalnız ziyaretçinin konsoluna düşüyor. Bu doğrudan
§5'in 2. ön koşulunu **ölçülemez** kılar: "sıfır ihlal kanıtlandı" denemez, çünkü ihlalleri
toplayan bir yer yok. Bugün sahip olduğumuz şey koruma değil **sessizlik**. Rapor ucu açmak
koruma modunu DEĞİŞTİRMEZ (risksiz) ve enforce gününe kör gitmeyi önler — Recep kararına
"ENFORCE-GÜNÜ" kaleminin yanına ayrı bir ön adım olarak yazıldı.

## 7. İlgili cetveller

- `docs/standards/analytics-standard.md` — GA/GTM rıza kapısı ve ölçüm; CSP maddesi buraya devreder.
- `CLAUDE.md` #9 (3D CDN whitelist), #11 (güvenlik/webhook), #12 (multi-tenant).
- `docs/standards/storefront-design-standard.md` — vitrin yüzeyleri.
