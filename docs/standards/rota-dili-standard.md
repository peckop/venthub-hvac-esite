# Rota Dili Standardı (statik sayfa adresleri: TR Türkçe, EN İngilizce)

> **Sahibi:** ALTYAPI
> **Son doğrulama:** 2026-10-04 (PR-A…C2 kapıları yeşil, her PR bağımsız doğrulayıcıdan geçti; PR-D: tablo verisi + açık kip kapıları)
> **Durum:** v0.2 · 2026-10-04 · Şerit: ALTYAPI · Kart: OPS-52 · **Anahtar kapalı (CANLI)**: bugün canlıda hiçbir adres değişmez; tablo ve
> açık kip yayın günü (11 Ekim) açılır, önizlemede (Preview=1) denenir. Hepsi "HEDEF" diye işaretlidir.
> **Kararlar:** 267 (hakkımızda), 269 (iletişim), 270 (iki aşama: 11 Ekim vitrin, hesap/sepet/ödeme sonra); Recep ilkesi 10-03:
> *TR'de Türkçe, EN'de İngilizce adres* (OPS-36).
> **Bağlı cetveller:** `adres-semasi-standard.md` (A5 tek kanonik, A6 sağlayıcıya özgü özellik yok, A9 sıçrama bütçesi, A11 308 önbelleği) ·
> `canonical-url-standard.md` (kanonik = sitemap = yönlendirmesiz tek adres) · `rendering-cache-standard.md` ·
> `slug-localization-2026-08-10.md`. **Plan:** `docs/plans/ops52-adres-dili-mekanizma-plani-2026-10-04.md`.

## 0. Kapsam: bu cetvel neyi yönetir, neyi yönetmez

| Yönetir (Aşama 1) | Yönetmez |
|---|---|
| Veriden bağımsız **statik sayfalar**, yalnız **bugün sayfası (`page.tsx`) olan klasörler** (§4: Design listesinden 27 sayfanın 8'i; kalanı neden girmediğiyle §4'te) | Kategori / dal / aile / marka / model adresleri: **K3B hattı** (`adres-semasi-standard.md`, `adresUret`) |
| | **Aşama 2** yüzeyleri: `account/*`, `cart`, `checkout`, `auth/*`, `payment-success` (karar 270; Supabase auth dönüş adresleri, İyzico callback ve e-posta bağlantıları birlikte taşınır, ayrı iş) |
| | **Bilgi merkezi** (`bilgi-merkezi` ↔ `knowledge-hub`): kendi mekanizması (`bilgiMerkeziYonlendirmeleri.mjs`, karar 92, `EN_YAYIN`) |

## 1. Kurallar

**R1 — Tek tablo.** Adres dilinin tek kaynağı `src/config/rotaDili.veri.json`. Satır: `{ id, klasor, tr, en, altYollar? }`. `klasor` bugünkü
(iki dilde ortak) klasör yoludur; `tr`/`en` o dilde görünecek yeni yoldur. Tablo **veridir**; mekanizma veriden bağımsızdır ve üç dosyadır:
`src/config/rotaDiliCekirdek.mjs` (saf çekirdek: tüm kurallar burada; `node:fs`, `process`, `require`, `import` YOK, tablo her fonksiyonda parametre, çünkü
Edge middleware'i ve istemci paketi de yükler), `src/config/rotaDili.mjs` (tabloyu diskten okuyan ince kabuk; yalnız `next.config` içindir) ve
`src/lib/adres/rotaDiliTablo.ts` (TS erişimcisi: JSON'u içe aktarır, anahtarı `process.env.NEXT_PUBLIC_ADRES_DILI` literaliyle okur; `localizedHref`,
site haritası ve `dilDegistirYolu` bundan geçer). Aynı tablodan üç çıktı: eski → yeni 308, yeni → klasör yeniden yazım (rewrite), adres üretimi (iç bağlantı, kanonik, hreflang, sitemap).
Klasör adı değiştirilmez, sayfa kopyalanmaz.

**R2 — Anahtar.** `NEXT_PUBLIC_ADRES_DILI`, derleme anında okunur. **Yalnız tam `1` açar**; yok, boş, `true`, `0` ya da bozuk değer **kapalıdır**
(güvenli yön). Vercel'de Preview=1, Production=0. Açma: Production=1 + yeniden dağıtım (yayın günü). **Geri alma: değişkeni `0` yap + yeniden dağıt;
kod değişikliği gerekmez** (ya da Vercel'in önceki yayına anında dönüşü). `ADRES_SEMASI_K3B` ve `EN_YAYIN` **ayrı** anahtarlardır; kodda birbirine
bağlanmaz (biri tek başına geri alınabilmeli). Yayın günü aynı listede açılırlar.

**R3 — Anahtar kapalı = sıfır fark.** Kapalıyken `rotaDili` çıktıları boş listedir; `next.config` yönlendirme ve başlık listesi ile site haritası
adresleri master 9ea04a55d fikstürüyle **derin eşit** kalır. Bu bir iddia değil ölçümdür: yönlendirme + başlık listesi §2 Kapı 1 (INV-ROTA-DILI-KAPALI-1,
`next.config` fikstürü), iç bağlantılar + `dilDegistirYolu` + site haritası (EN_YAYIN kapalı ve açık iki kip) §2 INV-ROTA-DILI-KAPALI-2
(`rota-dili-adres-uretimi.test.ts`, kod değişmeden ÖNCE üretilmiş fikstür). Kapalıyken `rewrites()` `{ beforeFiles: [] }` döndürür (master'da bu anahtar
yoktu); bu fark `next build` routes-manifest'iyle karşılaştırılmadı, CI build yeşil ve davranış farkı beklenmiyor (bilinen, ölçülmedi).

**R4 — Tek sıçrama.** Eski adres tek 308 ile yeni adrese gider; hedef hiçbir kuralla yeniden eşleşmez (zincir, döngü yok). Mevcut kuralların
hedefleri (ör. karar 92, `/destek/hesaplayicilar` → `urun-secici`) yeni adrese tabloyla yeniden yazılır (`rotaDiliHedefleriniYenile`; kapalıyken dizi aynen döner). Dilsiz eski adres (`/about`) için A9 bütçesi 1:
config tek başına 307 + 308 = 2 sıçrama üretir; bu yüzden middleware'de, `ADRES_SEMASI_K3B` kolunun yanında saf tablo aramasıyla çalışan
dilsiz kol kullanılır (DB yok, kural 12). **Karar (PR-C2, OPS onaylı, A9 ana hükmü):** dil `detectLocale` ile seçilir ve **307** verilir;
deterministik TR 308 yalnız içeriği YALNIZ Türkçe olan adresler içindir (kategori slug'ı `fanlar` gibi). Statik sayfaların iki dilde içeriği vardır ve
`/about` dilden bağımsız bir addır: 308, İngilizce ziyaretçiyi tarayıcıda kalıcı olarak Türkçeye çiviler.

**Açık yönlendirme güvenliği.** `rotaDiliYolu` / `rotaDiliCevir`, `//evil.com` gibi tablo dışı girdiyi aynen döndürür (açık yönlendirme üretmez); çıktıları
doğrudan bir `Location` başlığına yazılmaz, middleware `nextUrl.clone()` ile origin'i korur. **İstek yolu işlemede düzenli ifade ile "sondaki `/`" kırpılmaz**
(kare büyüyen desen; doğrusal döngü kullanılır, INV-ROTA-DILI-CEKIRDEK-1 zorlar).

**R5 — Aşama 2 tabloya giremez.** `account`, `cart`, `checkout`, `auth`, `payment-success` önekleri doğrulayıcıda hata verir; sessiz yutulmaz.

**R6 — Kanonik, hreflang, sitemap tek üreticiden.** İç bağlantılar `useLocalizedRoutes` / `yuzeyAdresleri` üzerinden (CLAUDE.md kural 7);
elle `/tr/…` yazmak yasak. Kanonik adres sitemap'in bildirdiği adresle birebir aynıdır. **EN adresleri** `EN_YAYIN=false` iken çalışır ama
site haritasında ve hreflang'da yoktur; `EN_YAYIN` ayrı eksendir ve 11 Ekim'de kapalı kalır (OPS kararı, EN makale metni yok). Testler iki kipte yazılır.

**R7 — Veriye bağlı eski adres config'e girmez** (A §3). `rotaDili` yalnız statik sayfaları kapsar; kategori/ürün/marka eski adresleri K3B'nin
middleware haritasındadır.

**R8 — Satır, sayfası olan klasöre yazılır.** Her satırın `klasor`ü `src/app/[lang]/<klasor>/page.tsx` olarak diskte bulunur; sayfası olmayan klasöre
satır yazılırsa eski adres ölü bir hedefe 308 verir ve yeni adres 404 olur. Design yeni bir sayfa adı verse bile satır, sayfa yazılınca eklenir
(§4 "girmeyenler"). Kapı: INV-ROTA-DILI-ACIK-1 tablo ↔ disk denetimi. Yeni görünen yolun ilk segmenti, kendi satırının klasörü dışında,
başka bir `src/app/[lang]/` üst klasörüyle çakışamaz.

**R9 — Cetvel dışı adres eklenmez.** Tabloya Design'ın teslim ettiği listenin (OPS-48) dışında ad yazılmaz; ad değişikliği Design'dan gelir, ALTYAPI uydurmaz.
İşaretli öneri (GEO-SEO onayı beklenen) adlar veriye işaretli girer; şu an tabloda öneri-işaretli statik sayfa yoktur (öneriler yalnız K3B dal adlarıdır).

## 2. Kapılar

| Kapı | Ne ölçer | Durum |
|---|---|---|
| INV-ROTA-DILI-KAPALI-1 (`src/__tests__/conformance/rota-dili-kapali-sifir-fark.test.ts`) | env yok / `0` / `true` iken `next.config` redirects + headers master fikstürüyle derin eşit, rewrites boş; env `1` iken fark var (duyarlılık kanıtı) | PR-A (HEDEF) |
| `src/lib/adres/__tests__/rotaDili.test.ts` | kapalı=boş, açık kip tam değerler, `altYollar`, zincir/döngü, Aşama 2 reddi, tablo doğrulayıcı | PR-A (HEDEF) |
| INV-ROTA-DILI-CEKIRDEK-1 (`src/lib/adres/__tests__/rotaDiliCekirdek.test.ts`) | çekirdek Edge/istemcide yüklenir: yorum dışı kodda `node:`/`process`/`require`/`import` yok (kabuk aynı taramadan KIRMIZI çıkar, ayırt eder); kabuk ↔ çekirdek aynı çıktı; istek yolu işlemede ikinci dereceden yavaşlama yok (64.000 `/` < 250 ms, kaynakta kırpma regex'i yok) | PR-C0/C2 (HEDEF) |
| INV-ROTA-DILI-KAPALI-2 (`src/__tests__/conformance/rota-dili-adres-uretimi.test.ts` + `fikstur/rota-dili-kapali-2-oncesi.json`) | kapalıyken `localizedHref` × tüm `Routes` × 2 dil, `dilDegistirYolu` ve site haritası (EN_YAYIN kapalı/açık) değişiklikten ÖNCEKİ çıktıyla derin eşit; env `1` iken fark var (duyarlılık) | PR-C1 (HEDEF) |
| Dil değiştirici + middleware dilsiz kol (`rota-dili-dil-degistirici.test.tsx`, `src/lib/adres/__tests__/middleware-rota-dili-{kapali,acik,zincir}.test.ts`) | TR↔EN çeviri, sorgu/parça taşınır, Bilgi Merkezi 404 yok (ALT-14); dilsiz adres TEK sıçrama (307, gerçek `middleware` + gerçek `next.config`), kapalıyken middleware aynı, Aşama 2 / admin / api dokunulmaz, kol K3B'den SONRA ve yalnız anahtar açıkken | PR-C1/C2 (HEDEF) |
| Kapı 2 — HTTP matrisi (`scripts/adres/matris.cjs`, yerel derleme, anahtar=0, master'la fark ∅) | 54 şablon × {tr,en} + sabit örnekler + bilinen eski adresler: durum + Location + cache-control | PR-B (master'da, c454d2e61; tam koşum yayın öncesi) |
| Kapı 3 — CANLI salt-okuma matrisi (birleşmeden önce/sonra; yayın günü açık matris) | canlıda tek adres değişmedi / yayın günü beklenen değişim | PR-B/yayın (taban `docs/audits/adres-matrisi-canli-2026-10-04-oncesi.json`) |
| Açık kip kapıları (önizleme) | tek hop, hedef 200, hreflang karşılıklı, kanonik = sitemap, eski adrese `href` 0, Aşama 2 önekleri eski adreste 200 | PR-D (HEDEF) |
| INV-ROTA-DILI-ACIK-1 (`src/__tests__/conformance/rota-dili-acik-kip.test.ts`) | tablo ↔ disk (R8); gerçek `next.config` ile zincir 0, eski dilli adres TEK 308, yeni adres rewrite; mevcut kural hedefleri yenilenir; adres üretimi/site haritası/kanonik/hreflang yeni adreste, eski adrese `href` 0; Aşama 2 dokunulmaz; dilsiz adres tek sıçrama | PR-D (HEDEF) |

## 3. Yayın günü kontrol listesi

1. Production'da `NEXT_PUBLIC_ADRES_DILI=1` + yeniden dağıtım (K3B ve `EN_YAYIN` kararları ayrıca, aynı listede).
2. Kapı 3 canlı matrisi **açık** beklenen matrisle eşleşir (açmayı unutma / yanlış açma kapanır).
3. Search Console'a yeni site haritası bildirilir; birkaç örnek adres için indeksleme istenir (`canonical-url-standard.md`).
4. Geri alma hazır: değişkeni `0` yap + yeniden dağıt; sonra Kapı 3 kapalı matrisle fark ∅.
5. `public/llms.txt` statik adresleri (`/tr/contact`, `/tr/about`) yayın günü yeni adreslere elle güncellenir (ÜRÜN / GEO-SEO kalemi; eski adres 308 verir, kırık değildir).
6. Yayın günü ayrıca: `EN_YAYIN` kapalı kalır (hreflang ve site haritasında EN yok); `ADRES_SEMASI_K3B` kendi kararıyla ayrı açılır. Üçü birbirine bağlı DEĞİLDİR.

## 4. Tablo: Design listesi (OPS-48, 2026-10-04) ↔ bugünkü klasör

Kaynak: Linear belgesi "Adres hedef listesi 2026-10-04 (OPS-48)" (Design). Listedeki 27 sayfa dört gruba ayrılır:

**Tabloya girenler (8): bugün sayfası olan klasörler.**

| id | klasör (bugünkü, iki dilde ortak) | TR | EN | Design durumu |
|---|---|---|---|---|
| hakkimizda | `about` | `hakkimizda` | `about` | karar 267 |
| iletisim | `contact` | `iletisim` | `contact` | karar 269 |
| secici | `urun-secici` | `secici` | `selector` | v3 |
| sss | `destek/sss` | `sss` | `faq` | kabul OPS #24 |
| yasal-kvkk | `legal/kvkk` | `yasal/kvkk-aydinlatma-metni` | `legal/privacy-notice-kvkk` | kabul OPS #24 |
| yasal-gizlilik | `legal/gizlilik-politikasi` | `yasal/gizlilik-politikasi` | `legal/privacy-policy` | kabul OPS #24 |
| yasal-cerez | `legal/cerez-politikasi` | `yasal/cerez-politikasi` | `legal/cookie-policy` | kabul OPS #24 |
| yasal-mesafeli | `legal/mesafeli-satis-sozlesmesi` | `yasal/mesafeli-satis-sozlesmesi` | `legal/distance-sales-contract` | kabul OPS #24 · satış kipi |
| yasal-kullanim-kosullari | `legal/kullanim-kosullari` | `yasal/kullanim-kosullari` | `legal/terms-of-use` | **karar 293 A** (ALT-33, 10-05) · EN ad kıyas önerisi, Design teyidi bekliyor |
| yasal-on-bilgilendirme | `legal/on-bilgilendirme-formu` | `yasal/on-bilgilendirme-formu` | `legal/pre-contract-information` | **karar 293 A** · EN ad aynı |
| yasal-iptal-iade | `destek/iade-degisim` | `yasal/iptal-ve-iade` | `legal/cancellation-and-returns` | **karar 293 A** · sayfa klasörü AYNI kalır (yeniden yazım), metin ve "satış kapalı" notu aynı; Footer iç bağlantısı `localizedHref` ile kendiliğinden döner |

**Girmeyenler, nedeniyle (R8, R7):**

| Design satırı | Neden tabloda yok | Ne zaman |
|---|---|---|
| teklif-listesi, teklif-iste (+ teşekkürler), onay-dosyası, nasıl-teklif-alınır, mühendislik, belgeler, belge/doğrula, site-haritası, yasal/iptal-ve-iade, destek (kök) | bugün sayfası (`page.tsx`) yok; satır eklenirse eski adres ölü hedefe gider | sayfa yazılınca satır eklenir (R8 kapısı zorlar) |
| ana, ürünler, markalar (+ kategori / dal / aile / model, asit dalı dahil) | K3B hattı (`adresUret`, `ADRES_SEMASI_K3B`); veriye bağlı (R7) | K3B kendi açılışıyla |
| bilgi merkezi çatısı | kendi mekanizması (`bilgiMerkeziYonlendirmeleri.mjs`, karar 92, `EN_YAYIN`) | — |
| giriş, hesap, ödeme, sipariş | Aşama 2 (karar 270, R5) | sonraki aşama |

**Karar 293 = A (Recep, 2026-10-05, ALT-33):** `legal/kullanim-kosullari`, `legal/on-bilgilendirme-formu` ve `destek/iade-degisim` tabloya GİRDİ (yukarıdaki üç satır): açık kipte eski adres tek 308,
yeni adres 200 (yeniden yazım, klasör aynı). İade metni ve "satış kapalı" notu değişmez; hukuk onayı ön koşulu kaldırıldı. `destek/garanti-servis` ve `destek/teslimat-kargo` destek altında KALIR (308 yok, Design 9a324708).
EN adlar Design CSV hedefiyle teyit edildi (2026-10-05): `terms-of-use` ve `cancellation-and-returns` aynı, ön bilgilendirme `pre-contract-information` (kıyas önerisi `pre-information-form` idi, değişti). Ad yeniden değişirse tek satır + literal test değeri güncellenir.
Kalan sınır: `/en/destek/garanti-servis`, `/en/destek/teslimat-kargo` hâlâ Türkçe alt ad taşıyor (EN'de İngilizce karşılığı yoktur).
