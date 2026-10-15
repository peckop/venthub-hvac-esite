# Yapay Zekâ Cevaplarında Görünürlük (GEO) Ölçüm Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** VentHub'ın yapay zekâ cevaplarında (Claude, Gemini; sonra başkaları) geçip geçmediğinin
> hangi motorla, hangi soru listesiyle, hangi sıklıkla ve hangi kayıt biçimiyle ölçüldüğü; ölçümün neyi
> **ölçmediği**; hangi verinin depoya giremeyeceği.
> **Niçin var:** `pazar-olcum-standard.md` P1 kol 5 ("yapay zekâ cevaplarında VentHub geçiyor mu") 2026-09-24'te
> "ölçüm yolunun şartlara uygunluğu ayrıca ölçülecek" diye boş kalmıştı. 2026-09-25'te iki motor şartlara uygun
> yoldan ölçülebilir hâle geldi (G1) ve ilk iki ölçüm alındı (Ölçüm geçmişi).
> **Sahibi:** GEO-SEO şeridi (karar 124: arama görünürlüğü BLOG'dan GEO-SEO'ya geçti; karar 93'teki "denetim
> üreticiden bağımsız" ilkesi geçerli). Soru listesi ve sonuçlar: GEO-SEO. İçerik kusuru: BLOG. Sayfa/şema
> kusuru: URUN. robots, başlık, bot erişimi: ALTYAPI.
> **Kayıt:** REC-369 (pazar ölçüm kolları). **İlgili cetveller:** `pazar-olcum-standard.md` (P0 ücretsiz
> varsayılan, P4 Google sonuç sayfası yasağı, P6 depoya girmeyen veri) · `yayin-gorunurluk-denetim-standard.md`
> (bot kalitesi karnesi) · `rehber-yazisi-standard.md` (yazı konusu).

**Durum:** TASLAK. Koşu elle başlatılır (betik: `scripts/seo/geo-olcum.mjs`, SEO-42); zamanlayıcı/cron/loop
kararı önce Recep ile konuşulur (karar 53). Ağsız çekirdeğin kapısı G7'dedir.

---

## G0 — Neyi ölçer, neyi ölçmez

- **Ölçer:** sabit bir soru listesine, internet araması açık bir yapay zekânın verdiği cevapta VentHub'ın
  (a) metinde adıyla geçip geçmediği, (b) kaynak olarak gösterilip gösterilmediği, (c) gösterildiyse hangi
  sayfamızın gösterildiği; aynı cevapta kaynak gösterilen diğer alan adları.
- **Ölçmez:** müşterinin kendi ekranında gördüğü cevabın birebir aynısını. API cevabı tüketici ürününden
  farklıdır: model sürümü, kişiselleştirme, konum, oturum geçmişi farklı olabilir. Bu yüzden sonuç **eğilim**
  olarak okunur (aydan aya aynı motor, aynı soru); mutlak "müşteri bunu görüyor" iddiası kurulmaz.
- **Tek cevap kanıt değildir.** Aynı soruya aynı motor farklı zamanda farklı cevap verebilir. Yorum tek soruya
  değil, liste genelindeki orana dayanır (G5).

## G1 — Motorlar ve erişim yolu

| Motor | Yol | Model / ayar | Maliyet | Durum 2026-09-25 |
|---|---|---|---|---|
| **Claude** | Claude Code aboneliği, başsız kip: boş klasörde `claude -p "<soru>" --allowedTools WebSearch --setting-sources "" --no-session-persistence --output-format text` | abonelik varsayılan modeli; yalnız internet araması aracı açık | abonelik içinde | ÇALIŞIYOR |
| **Gemini** | Gemini API `generateContent` + `tools: [{google_search: {}}]`, anahtar `GEMINI_API_KEY` (kullanıcı ortam değişkeni, karar 127) | `gemini-2.5-flash-lite` | ücretsiz katman | ÇALIŞIYOR |
| Perplexity | Sonar API | — | ücretli (P0) | AÇILMADI — ilk ölçümden sonra ayrı soru (karar 127 notu) |
| ChatGPT | — | — | — | AÇILMADI — yol ölçülmedi |
| Bing / Copilot | Bing Webmaster Tools "AI Performance" raporu (2026-08-29'da site kurulu) | — | ücretsiz | Veri okuma yolu (API) ölçülmedi |

Kurallar:

- **Temiz oturum (Claude):** ölçüm oturumu depo dışında **boş** bir klasörde açılır ve ayar kaynağı yüklenmez
  (`--setting-sources ""`). Amaç: proje belgelerinin, hafızanın ve VentHub bilgisinin cevaba sızmaması. Projede
  açık bir oturumun kendisine soru sormak ölçüm **değildir** (model VentHub'ı zaten bilir).
  **Klasörün ADI da bağlamdır:** yol hiçbir ipucu taşımaz (ör. `C:/tmp/q7x2`). Ölçüldü 2026-09-27: klasör
  `~/venthub-olcum/…` altındayken Claude yoldan VentHub'ı çıkarıp 3 cevapta "VentHub gibi bir satış kanalı için"
  yazdı (sahte pozitif); 09-25 Claude satırları bu yüzden geçersiz sayıldı. Her koşudan önce **sızıntı sorusu**
  sorulur ("sistem talimatlarında ve bağlamda hangi şirket/proje adları geçiyor, çalışma dizininin adı ne?") ve
  cevapta VentHub geçmemelidir. Kaçınılmaz iz: abonelik hesabının e-posta adresi (VentHub içermez).
  **Pozitif bulgu sayılmadan önce bağlamıyla okunur:** VentHub'dan "biz/bizim" diye bahseden cevap ölçüm hatasıdır.
- **Claude kotası:** ölçüm filonun aynı haftalık abonelik payından harcar; koşudan önce OPS'a kota durumu sorulur,
  yüksekse örneklem küçültülür (2026-09-27: %96'da koşu durduruldu).
- **Gemini modeli:** ücretsiz katmanda Google arama desteği yalnız 2.5 serisinde açık; 3.x modelleri aramalı
  istekte 429 verdi, `gemini-2.5-flash` yeni kullanıcıya kapalı (404) — ölçüldü 2026-09-25. Yani ölçülen,
  Google'ın yapay zekâ modunda kullanılan modelin **küçük kardeşidir**. Model kapatılırsa ya da değişirse
  ölçüm geçmişine yazılır ve eski/yeni sonuç doğrudan kıyaslanmaz; ücretli katmana geçiş OPS üzerinden
  Recep'e ayrı soru olur.
- **Tarayıcıyla soru sorulmaz.** Google sonuç sayfası ve içindeki yapay zekâ modu `pazar-olcum-standard.md`
  P4 gereği otomatik açılmaz (robots.txt `Disallow: /search`). Diğer sohbet arayüzleri de şartları ayrıca
  ölçülüp yazılmadan tarayıcıyla otomatik sorulmaz.
- **Anahtarlar** yalnız kullanıcı ortam değişkenindedir; depoya, Kanban kartına, posta kutusuna ve günlük dosyasına
  yazılmaz. Varlığı yalnız "var/yok + uzunluk" ile ölçülür.

## G2 — Soru listesi

- **Yer:** Kanban kartına not + depo dışı dosya yolu (karar 219; REC-369 eski Linear kaydıdır) + çalışma kopyası `~/venthub-olcum/geo/`. **Depoya girmez**
  (`pazar-olcum-standard.md` P6: sorgu listesi, rakip adı).
- **Sürüm:** liste sürüm numarası taşır (v0, v1…). Soru değiştirmek yeni sürümdür; eski sürümün sonucu yeni
  sürümle yalnız ortak sorular üzerinden kıyaslanır.
- **Dil:** v0 yalnız Türkçe (EN yayını kapalı, `EN_YAYIN`). EN açılınca EN sorular ayrı alt liste olur.
- **Karışım (v0, 50 soru):**

| Grup | Adet | Örnek biçim (listenin kendisi değil) |
|---|---|---|
| Ürün ailesi — satın alma niyeti | 20 | "<ürün türü> nereden alınır / tedarikçi / fiyat" |
| Marka + model | 8 | "<marka> <seri> Türkiye bayisi" |
| Bilgi / rehber konusu | 14 | "<hesap/seçim/yönetmelik> nasıl yapılır" — `rehber-yazisi-standard.md` konu listesiyle eşlenir |
| Yerel | 8 | "<il> <ürün türü> satıcısı" |

- Ürün aileleri site haritasındaki kategori ve ailelerden, bilgi soruları yayındaki ve plandaki rehber
  yazılarından seçilir; seçim gerekçesi listenin yanında yazılır.
- Soruda **VentHub adı geçmez** (marka sorusu ayrı ve en fazla 2 adet; sonuçları ayrı sayılır).

## G3 — Koşu

- **Sıklık:** ayda bir (her ayın ilk iş günü) + görünürlüğü etkileyen yayından (REC-300 adres yayını, yeni
  rehber yazısı) **+28 gün** sonra. Haftalık koşu yapılmaz: yapay zekâ dizinlerinin güncellenme hızı bilinmiyor,
  haftalık fark gürültüdür (ölçülmedi — ilk üç koşudan sonra yeniden değerlendirilir).
- **Tekrar:** her soru her motora 1 kez. İlk koşuda ilk 10 soru 3 kez sorulur ve cevaplar arası tutarlılık
  (VentHub geçti/geçmedi aynı mı) ölçülüp buraya yazılır; tutarlılık düşükse tekrar sayısı artar.
- **Sıra:** motorlar arasında soru sırası aynı; istekler arası en az 3 sn (ücretsiz kota ve nezaket).
- **Kota (ölçüldü):** Gemini ücretsiz katmanda Google aramalı istek **günde ≈22–25**. 2026-09-25'te 25, 2026-09-27'de
  (istek arası 20 sn ile) 22 başarılı istekten sonra 429; istek aralığını açmak sınırı değiştirmedi. Dış kaynakların
  "günde 500" bilgisi bu hesapta geçerli değil. Aylık koşu ≈ 52 + 20 tekrar ≈ 72 istek → **üç güne yayılır**; betik
  hatasız cevapları atlayarak kaldığı yerden devam eder. 429 alınınca o günün koşusu durdurulur (hata satırı biriktirilmez).

## G4 — Kayıt biçimi

Her cevap bir satır (JSON), `~/venthub-olcum/geo/<tarih>/<motor>.jsonl`:

`soruNo · listeSurum · motor · model · zaman (UTC) · cevapMetni · kaynaklar[] (adres + başlık) · venthubMetinde
(bool) · venthubKaynakta (bool) · venthubSayfalari[] · hata`

- Ham cevap depo dışında kalır. Kanban kartına aylık özet notu + ham dosyanın depo dışı yolu gider.
- Depoya yalnız G5'teki **özet oranlar** girer (Ölçüm geçmişi tablosu).

## G5 — Ölçütler

| Ölçüt | Tanım |
|---|---|
| **Görünürlük oranı** | VentHub'ın metinde **ya da** kaynakta geçtiği soru / toplam soru (motor başına) |
| **Kaynak oranı** | VentHub'ın kaynak listesinde olduğu soru / toplam soru |
| **Sayfa dağılımı** | Kaynak gösterilen VentHub sayfaları ve kaç soruda (hangi sayfa türü çalışıyor) |
| **Rakip payı** | Kaynaklarda en sık geçen 10 alan adı — **yalnız Kanban kartında / depo dışı dosyada** (rakip adı depoya girmez) |

Yorum kuralı: tek ayın oranı iddia kurmaz; iki ardışık koşuda aynı yöndeki değişim eğilim sayılır. Bir yayına
(adres, yazı) bağlanan değişim ancak +28 gün koşusunda görülürse o yayına bağlanır.

## G6 — Bulgu sahipleri

| Bulgu | Sahip |
|---|---|
| Soru konusunda sitede yazı/sayfa yok | BLOG (konu önerisi) |
| Sayfa var ama kaynak gösterilmiyor: şema (JSON-LD), başlık, açıklama, iç bağlantı | URUN |
| Bot sayfaya erişemiyor (robots, başlık, 4xx/5xx botlara) | ALTYAPI — önce `scripts/seo/bot-karnesi.mjs` ile doğrulanır |
| Ölçümün kendisi (motor değişti, betik hatası) | GEO-SEO |

## G7 — Kapılar

Kapı: `scripts/seo/__tests__/geo-olcum.test.ts` (INV-GEO-OLCUM-1, `ci` içinde koşar; SEO-42). Kilitlediği ağsız
çekirdek:

- cevaptan VentHub izi **metinde** ve **kaynakta** ayrı ayıklanır (G0, G4 satır biçimi);
- sızıntı izleri kelime sınırlıdır ("finalizes" iz sayılmaz), tarafsız klasör yolu ipucu taşımaz (G1);
- hata satırı ve boş cevap oran paydasına girmez, marka sorusu ayrı sayılır, grup kırılımı "kaynak listesi
  olan / gruptaki soru" yazılır (G3, G5);
- anahtar hiçbir satıra ve hata metnine yazılmaz; rakip alan adları herkese açık özetten atılır (G5, P6);
- kota (429) koşuyu durdurur ve hata satırı biriktirmez (G3).

Koşu ve özet komutları (soru listesi, ham cevap ve rakip alan adları depo dışıdır; betik yalnız yol alır):

- `node scripts/seo/geo-olcum.mjs kos <gemini|claude> --liste <v0.json> [--ek <ek.json>] --cikti <depo dışı klasör>`
  (`claude` için `--tarafsiz <boş klasör>` zorunlu; her koşudan önce sızıntı sorusu kendiliğinden sorulur ve iz
  varsa koşu başlamaz). **Önce `--kuru`:** istek göndermeden kaç istek yapılacağını yazar. Ortamda
  `GEMINI_API_KEY` tanımlıysa `kos` GERÇEK koşar ve günlük ücretsiz kotadan (≈22-25) harcar;
- `--yalniz 1,7,M1` ile alt küme koşulur, `--onceki <jsonl>` hatasız satırları atlar;
- `node scripts/seo/geo-olcum.mjs ozet <jsonl...> [--cikti <depo dışı klasör>]` G5 cümlesini üretir; rakip alan
  adları yalnız `--cikti` klasöründeki dosyaya yazılır.

Betiğin kapısı olmayan kısmı (gerçek Gemini/Claude çağrısı) CI'da koşmaz: abonelik ve anahtar gerektirir.

## G8 — Trends talep ölçümü: Supermetrics sonrası kendi yolumuz (SEO-51, karar 365)

Supermetrics aboneliği alınmadı (karar 365, deneme 15 Ekim 2026'da bitti). Talep ölçümü (karar 326: çağrı başına
en çok 5 terim, değer aynı çağrıdaki en yüksek terime göre, null eşik altı ≠ sıfır, ortak çapa terimle kıyas,
çapa null ya da 3'ün altındaysa çağrı geçersiz, her bulgu en az iki farklı çağrıyla) **yöntem olarak aynen
kalır**; yalnız aracı değişir:

| | Eski | Yeni |
|---|---|---|
| Araç | Supermetrics GT (`data_query`) | Tarayıcı bölmesi ya da Chrome'daki `trends.google.com` sayfasının kendi isteği |
| Kimlik | Supermetrics hesabı | Gerekmez; oturumsuz sayfa |
| Doğrulandı | 2026-10-14 (6 çağrı) | 2026-10-14: `/trends/api/explore` → `/trends/api/widgetdata/multiline`, 2 terim, 5 yıl, 262 haftalık nokta, durum 200 |

**Tarif (sayfa konsolundan, salt okuma).** Önce `trends.google.com/trends/explore?geo=TR&hl=tr&q=<terim>` açılır
(tarayıcı bölmesi ya da `claude-in-chrome`). Sonra sayfa bağlamında iki istek koşulur: `explore` (widget jetonu)
ve `multiline` (zaman serisi). Terim ve pencere `req` nesnesindedir:

```js
const req = {comparisonItem: [{keyword: 'frekans konvertörü', geo: 'TR', time: 'today 5-y'}, {keyword: 'inverter', geo: 'TR', time: 'today 5-y'}], category: 0, property: ''}
const temizle = (s) => JSON.parse(s.replace(/^\)\]\}',?\n?/, ''))
const e = temizle(await (await fetch('/trends/api/explore?hl=tr&tz=-180&req=' + encodeURIComponent(JSON.stringify(req)))).text())
const w = e.widgets.find((x) => x.id === 'TIMESERIES')
const m = temizle(await (await fetch('/trends/api/widgetdata/multiline?hl=tr&tz=-180&req=' + encodeURIComponent(JSON.stringify(w.request)) + '&token=' + w.token)).text())
// m.default.timelineData: [{time, formattedTime, value: [terim1, terim2…], hasData: [...]}]
```

Sınırlar ve dürüstlük:

- ⚠Bu uçlar **belgelenmemiştir** ve herhangi bir gün değişebilir ya da 429 verebilir (ölçülmedi: 429 sınırı, yalnız
  bir koşu); çağrılar arasına bekleme konur, kota dolarsa koşu durur ve hata satırı biriktirilmez (G3'teki kural).
- Değerler yine **göreli**dir (G5'in Trends cümlesi): mutlak hacim iddiası için Bing ya da Search Console verisi
  gerekir. Düşük hacimli terimler koşular arasında oynar (9 ↔ 14 Ekim'de "frekans invertörü" 68,9 → null);
  sıra iddiası yalnız iki farklı çağrıda aynı yönde çıkarsa yazılır.
- `time` değeri `today 5-y` (haftalık), `today 12-m` (haftalık/günlük), `all` (2004'ten aylık) alabilir; kayıt
  dosyasında pencere ve terim sırası yazılır.
- Sorgu ve sayfa verisi gibi bu seri de depo dışıdır (P6). Son arşiv: `C:/tmp/vh-arsiv/geo-seo/supermetrics-son-2026-10-14/`.

---

## Ölçüm geçmişi

Kaynak sınıfı: **A** = GEO-SEO'nun kendi ölçümü · **B** = başkasının ölçümü, okundu.

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-25 | Claude, temiz oturum, 1 deneme sorusu (ürün ailesi — satın alma niyeti) | A | Cevap 14 satıcı saydı; **VentHub metinde ve kaynakta yok** |
| 2026-09-25 | Gemini `gemini-2.5-flash-lite` + Google arama, aynı soru | A | 8 kaynak; **VentHub yok** |
| 2026-09-25 | Gemini erişim yolu | A | Anahtar geçerli; aramalı istekte 3.x ve `flash-lite-latest` → 429, `2.5-flash` → 404 (yeni kullanıcıya kapalı), `2.5-flash-lite` → 200 |
| 2026-09-27 | Claude temiz oturum sızıntı sorusu | A | Klasör `~/venthub-olcum/…` iken cevap klasör adını gördü, 09-25'in 3 "VentHub" geçişi sahte pozitif → 43 satır geçersiz. `C:/tmp/q7x2`'de VentHub geçişi **0** |
| 2026-09-27 | Gemini günlük kota | A | 09-25: 25 başarı → 429; 09-27 (20 sn aralık): 22 başarı → 429. Sınır ≈22–25/gün |
| 2026-09-27 | GEO v0 Gemini ara sonuç | A | 27/52 tekil soru (ilk 10 soru ×3): **VentHub metinde 0, kaynakta 0**. Kalan 25 soru + Claude örneklemi ayrı koşu |
| 2026-10-11/12 | GEO v1 Gemini `gemini-2.5-flash-lite` + Google arama, liste v1 (v0 + 5 paket sorusu), 29 tekil soru | A | Marka sorusu hariç 27 soruda **VentHub metinde 0/27, kaynakta 0/27** (kaynak listesi olan 24/27: bilgi 13/14, yerel 8/8, paket-ek 3/5; 13 Ekim'de betikle düzeltildi, önceki metin grup toplamlarını kaynak listesi olan diye yazmıştı). Doğrudan marka sorusu (M1) genel ve tahmine dayalı cevap, kaynak 0; M2 boş cevap, ölçülemedi |
| 2026-10-13 | GEO v1 Claude (abonelik, yalnız WebSearch, `C:/tmp/q7x2`, koşu öncesi sızıntı sorusunda "VentHub" 0), 16 soru, tekrar yok | A | Marka sorusu hariç 15 soruda **VentHub metinde 0/15, kaynakta 0/15** (kaynak listesi olan 6/15; bilgi ve paket sorularının 7/8'i aramasız cevaplandı). M1: "doğrulanabilir bilgi bulamadım". Yayın öncesi TABAN (B-1 adres yayını hedef 19 Ekim); tek koşu eğilim sayılmaz, +2 ve +6 hafta tekrarı (SEO-22) bu tabana kıyaslanır |
