# Dizin Sistemleri Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** "VentHub arama motorlarında ve yapay zekâ ürünlerinde görünüyor mu?" sorusunun
> **hangi dizine, hangi bota, hangi koşula** bağlandığı; bizim sitemizin her dizin için karşılaması gereken
> asgari koşullar; bu konuda ölçümün **nasıl** yapılacağı ve nerede **kör** olduğu.
> **Niçin var:** 2026-09-30'da Recep bir yapay zekâ ürününden "VentHub web'de yok" cevabı aldı. 2026-10-02
> ölçümü (SEO-1, `docs/audits/dizin-gorunurluk-olcum-2026-10-02.md`) teknik bir engel bulmadı (bot engeli yok,
> Bing ve Google'da dizinli) ve asıl bilgi boşluğunu gösterdi: **her ürünün kendi dizini ve kendi botu var; "Bing'de
> olmak ChatGPT'de olmak değildir"**. Bu bilgi hiçbir yerde yazılı değildi.
> **Sahibi:** GEO-SEO. Güvenlik duvarı/Bot Protection ayarı: ALTYAPI. Sayfa/middleware kusuru: URUN.
> **Son doğrulama:** 2026-10-02 (D1 satırlarının kaynak sayfaları o gün okundu).
> **İlgili:** `yayin-gorunurluk-denetim-standard.md` (yayın günü kabul ölçütleri), `geo-olcum-standard.md` (yapay zekâ
> cevabında marka geçiyor mu), `pazar-olcum-standard.md`, `rehber-yazisi-standard.md`.
> **Tazelik kuralı:** bu tablodaki her satır **tarihlidir**; bir ürünün dizin kaynağı sessizce değişebilir (ChatGPT'nin
> dizini 2024'ten bugüne Bing'den karmaya kaydı). Satır 90 günden eskiyse "doğrulanmadı" sayılır ve yeniden okunur.

Güven sütunu: **B** = ürünün kendi resmi belgesi açıkça söylüyor (okundu) · **Ç** = üçüncü taraf ya da çıkarım, resmi
belge söylemiyor · **U** = kaynağa ulaşılamadı (sayfa 403/404/boş). **Ölçülmedi** = bizim sitemiz için ölçülmedi.

## D1 — Hangi ürün hangi dizinden beslenir, hangi bot gelir

| Ürün | Dizin | Botlar (kullanıcı ajanı → görev) | Bize gereken | Güven | Kaynak (okundu 2026-10-02) |
|---|---|---|---|---|---|
| **Google Arama** (AI Overviews / AI Mode dahil) | Google dizini | `Googlebot` arama. `Google-Extended` yalnız Gemini eğitimi ve grounding kontrolüdür, Arama'ya girişi ve sıralamayı etkilemez | Googlebot ile dizinde olmak; özel işaretleme, `llms.txt` ya da yapay zekâ dosyası **gerekmez** | B | developers.google.com/search/docs/appearance/ai-features (2025-12-10); …/crawling-indexing/google-common-crawlers (2026-07-14) |
| **Gemini** | Google Arama dizini (grounding) | aynı | aynı | B (API grounding); tüketici uygulaması için ayrı belge okunmadı | ai.google.dev/gemini-api/docs/google-search (2026-09-23) |
| **Bing Arama** | Bing dizini | `bingbot` (2019'dan beri Edge/Chromium tabanlı render); `AdIdxBot`, `BingPreview`, `MicrosoftPreview`, `BingVideoPreview` | Bing Webmaster Tools doğrulaması, XML site haritası (doğru `lastmod`), IndexNow, robots'ta bingbot izni | B | blogs.bing.com/webmaster/June-2025/… (2025-06-17); …/July-2025/… (2025-07-31); bot listesi sayfası U |
| **Microsoft Copilot** | Bing dizini | ayrı Copilot botu bulunamadı | Bing'de dizinli olmak | B (Copilot Studio belgesi: "public websites indexed by Bing"); tüketici Copilot için Ç | learn.microsoft.com/…/data-privacy-security-web-search (2026-01-30); Bing AI Performance duyurusu (2026-02-10) |
| **ChatGPT arama** | **Karma:** OpenAI'nin kendi dizini (`OAI-SearchBot`) + üçüncü taraf sağlayıcılar; Bing'in bugünkü payı belirsiz | `OAI-SearchBot` arama sonucunda göstermek için · `GPTBot` eğitim · `ChatGPT-User` kullanıcı isteğiyle gelir, robots kuralları uygulanmayabilir · `OAI-AdsBot` | robots'ta `OAI-SearchBot` izni; OpenAI'nin yayımladığı IP aralıklarına güvenlik duvarında izin; kural değişikliği ~24 saatte işler | Botlar B · **dizin kaynağı Ç** (OpenAI sayfaları 403) | developers.openai.com/api/docs/bots; dizin için ikincil: yoast.com/chatgpt-search (2024-11-12), peec.ai (2026) |
| **Perplexity** | Kendi dizini ve kendi tarayıcısı | `PerplexityBot` arama (eğitimde kullanılmaz, robots geçerli) · `Perplexity-User` kullanıcı isteğiyle gelir, robots'u genelde yok sayar; IP listeleri JSON | robots + güvenlik duvarında `PerplexityBot` izni | Botlar B · kendi dizini Ç | docs.perplexity.ai/guides/bots |
| **Claude (web arama)** | Belgede yazmıyor; üçüncü taraf kaynaklara göre **Brave Search** | `ClaudeBot` eğitim · `Claude-User` kullanıcı isteğiyle · `Claude-SearchBot` arama sonucu kalitesi için dizinleme; robots'a uyar, CAPTCHA aşmaz | robots'ta `Claude-SearchBot` izni; **Brave'de görünürlük (çıkarım)** | Botlar B · **Brave Ç** (Trust Center sayfası U) | support.claude.com/en/articles/8896518 (2026-04-07); techcrunch.com/2025/03/21 (ikincil) |
| **Brave Search** | Tamamen kendi bağımsız dizini; kısmen Web Discovery Project verisi | ayırt edici kullanıcı ajanı **kullanmıyor**; Googlebot'un taramadığı sayfayı Brave botu da taramaz | Googlebot'a açık olmak; yenileme isteği `search.brave.com/submit-url` | B | search.brave.com/help/brave-search-crawler; brave.com/blog/search-independence (2023-04-27) |
| **DuckDuckGo** (DuckAssist) | Büyük oranda Bing + kendi `DuckDuckBot`'u + ortak kaynaklar | `DuckDuckBot/1.1`, robots'a uyar, IP listesi JSON | pratikte Bing'de olmak | Sonuç kaynakları B · DuckAssist Ç | duckduckgo.com/duckduckgo-help-pages/results/sources |
| **Apple** (Siri / Spotlight / Safari) | `Applebot`'un taradığı veri | `Applebot` arama; `Applebot-Extended` yalnız yapay zekâ eğitimini kısıtlar | robots'ta `Applebot` izni; gerekli JS/CSS/XHR engellenmemeli | B | support.apple.com/en-us/119829 |
| **Yandex** | Kendi dizini | `YandexBot` (tam kullanıcı ajanı listesi sayfası 404, U) | Yandex Webmaster (**doğrulandı 31 Ekim 2026**: `public/yandex_<kod>.html` dosya yöntemi, SEO-64; site haritası gönderimi Yandex'in salt okunur arızası yüzünden bekliyor, dizindeki sayfa sayısı ölçülemedi), IndexNow | IndexNow ve JS B · bot listesi U | yandex.com/support/webmaster/en/indexing-options/index-now |

**Okuma:** tablonun tek önemli sonucu şudur — beş ayrı dizin ailesi vardır (Google, Bing, OpenAI'nin karması,
Perplexity'nin kendisi, Brave) ve biri için yapılan iş ötekileri otomatik kapsamaz. Bir yapay zekâ ürününün "VentHub yok"
demesi, o ürünün **kendi** dizininde yokluğu, ya da o cevap için **hiç arama yapmamış** olması demektir
(model aramaya kendi karar verir, sabit bilgide aramadan cevaplar: platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool).

## D2 — Bizim sitemiz için asgari koşullar (her dizin için aynı)

1. **robots.txt:** bota özel kural yok, `User-agent: *` altında `Allow: /`; yalnız `/admin/ /auth/ /account/ /checkout/` kapalı.
   Yeni bir bot grubu eklemek (özellikle `Disallow`) **dizin kararıdır**, yalnız OPS onayıyla.
2. **Sunucu HTML'i:** içerik JavaScript çalışmadan ham HTML'de bulunur. Ölçümde yalnız Google ve Apple JS çalıştırıyor;
   OpenAI/Anthropic/Perplexity belgeleri JS'den söz etmiyor ve tek ölçüm (Vercel/MERJ, 2024-12-17, üçüncü taraf) bu botların
   JS çalıştırmadığını söylüyor. Kategori ve ürün sayfalarında içerik gizli akıtmalı blokta (`<div hidden id="S:0">`) ham
   HTML'de duruyor; basit bir okuyucunun bunu nasıl işlediği **ölçülmedi**.
3. **Güvenlik duvarı / Bot Protection:** yönetilen "AI bots" ya da "Bot Protection" kuralı ZİYARETÇİ botları kesebilir;
   durum her yayın değişikliğinden sonra ve üç ayda bir ALTYAPI tarafından salt okunur ölçülür (ALT-9). **Bizim kendi
   IP'mizden kullanıcı ajanı taklidiyle ölçmek bu soruyu cevaplamaz** (güvenlik duvarı IP'ye bakıyorsa gerçek bot farklı yanıt alır).
4. **Doğrulama ve gönderim:** Google Search Console (hizmet hesabı), Bing Webmaster Tools (08-29'dan beri kurulu), site haritası
   tek adresten (`/sitemap.xml`), IndexNow (D4).
5. **Hata yanıtı doğru:** olmayan adres **404** verir, 500 vermez (kök `.txt` kusuru: URN-15).

## D3 — Ölçüm yöntemi ve sınırları (dürüst)

| Ölçüm | Yöntem | Sınır |
|---|---|---|
| Bot erişimi | kullanıcı ajanı taklidiyle `curl` (6 adres × 17 ajan) | kendi IP'miz; gerçek bot IP'si ölçülmedi → ALT-9 |
| Google'da dizinli mi | Search Console URL Inspection (hizmet hesabı, 87 adres) ve `searchAnalytics` | haritanın kendi "dizine eklenen" sayacı çelişti (0), **kullanılmaz** |
| Bing'de dizinli mi | gerçek tarayıcıda (Playwright) Bing sonuç sayfaları; Bing Webmaster (Supermetrics BW) | `site:` işleci ortamda hiçbir alan adında çalışmadı; curl ile gelen Bing sonuçları **bozuk** (alakasız), yalnız tarayıcı sonucu geçerli; "yaklaşık sonuç sayısı" 33 ile 155.000 arasında oynuyor, **güvenilmez** |
| Google'da konu sıralaması | — | Google sonuç sayfası curl'da boş, tarayıcıda 429 (insan doğrulaması); aşılmadı. Yalnız Search Console verisi |
| Yapay zekâ ürünlerinde görünürlük | Claude Code `WebSearch` aracı (15 sorgu) | arka ucu bilinmiyor; ChatGPT, Perplexity, Claude (Brave), Copilot, Gemini'de aynı soru **ölçülmedi** (`geo-olcum-standard.md`) |

## D4 — IndexNow

- Destekleyenler: Bing, Yandex, Naver, Seznam.cz, Amazon, Yep. **Google listede yok.** Bir motora gönderim diğerlerine paylaşılır.
- Anahtar: 8-128 karakterlik `.txt` dosyası, kökte `alanadi/{anahtar}.txt`; motor dosyayı çekip doğrular.
- Gönderim: tek adres `GET ?url=&key=`, toplu `POST` JSON (en çok 10.000 adres). **200 yalnız "alındı"dır**, dizine girme garantisi
  değildir; 202 doğrulama bekliyor, 403 geçersiz anahtar, 429 sınır.
- Bizde: `scripts/seo/indexnow-bildir.mjs` toplu bildirim betiği (anahtarı ortam değişkeninden okuyor; sabite alınması SEO-3);
  #1459 süzgeci bayrak kapalıyken webhook'tan yeni adres göndermez. Toplu bildirimi **yalnız GEO-SEO tetikler** (yayın günü).
- **Bayrak kapalıyken tek geçerli toplu kip (karar 249 daraltması, 2026-10-03):** `--yalniz-degismeyen`. Betik yalnız bilinen
  değişmeyen TÜRLERİ geçirir (izin listesi, fail-closed: ana sayfa, hakkında, iletişim, ürün seçici, yasal sayfalar, bilgi merkezi;
  yalnız `/tr`); ürün, kategori, marka ağaçları, yeni şema bölümleri ve tanınmayan her adres ATILIR. Kalanın her adresi GET ile
  sınanır (yönlendirme takip edilmez, 200 ve kanonik = kendisi, değilse durur) ve yalnız onlar bildirilir; süzgeçsiz kip kapıdan
  geçemez (K4, karar 164 A). Boş küme ya da kalan > 15 = DUR. Kilit: `indexnowSuzgec.test.ts` (INV-INDEXNOW-SUZGEC-1).
- **Yayın günü kipi (karar 327, 2026-10-09; SEO-27): `--yalniz-yeni <eski-adresler.json>`.** Bildirilecek küme = canlı site haritası −
  yayından ÖNCE `adres-yayin-denetim.mjs` ile alınan taban haritası, yani yalnız ADRESİ DEĞİŞEN TR sayfalar (değişmeyenler
  `--yalniz-degismeyen` ile zaten bildirildi). Bayrak AÇIK olmalı (kapıyı aşmaz). Fail-closed: taban boş/bozuk, yeni harita tabanla hiç
  kesişmiyor, yeni adres yok (taban yayından sonra alınmış), TR dışı adres (Pazar günü yalnız TR), küme > 200 = DUR. Her adres GET ile
  sınanır (yönlendirme takip edilmez, 200, kanonik = kendisi). `--yalniz-degismeyen` ile birlikte kullanılamaz. Kuru koşumun
  `bildirilecek URL (yeni/degisen TR): N` satırı beklenen sayıya eşit olmalı (SEO-26). Kilit: `indexnowBetikKapisi.test.ts`
  (saf mantık + bayrağı açık geçici ağaçta uçtan uca + iki mutasyonlu sabotaj).
  Ölçüm 2026-10-03 (canlıya karşı kuru koşu): sitemap 87 adres, 78 atıldı, 9 kaldı, 9'u 200 ve kanonik. Değişecek 78 adres yayın günü
  adres yayınıyla aynı yayında gider.
- **K4 GEVŞEDİ (karar 376, 2026-10-16; SEO-55).** Bugün canlı olan ve site haritasında listeli adresler, adres şeması bayrağı
  (`ADRES_SEMASI_K3B`) KAPALIYKEN de IndexNow'a gider. Gerekçe: IndexNow "bu sayfa değişti" der; yayında adres değişince eski adres
  308 verir ve arama motorları 308'i izler; K4'ün önlemek istediği Bing'e eski şemayı öğretme maliyeti, "her canlı değişiklikte
  dizinle" ilkesinden küçük görüldü (ölçüm: `docs/audits/geo-dizin-tetigi-olcum-2026-10-16.md`). Kapsam: (1) webhook süzgeci
  `src/lib/seo/indexnow.ts` (URUN, ayrı PR), (2) `scripts/seo/degisen-adres-bildir.mjs` (`K4_GEVSEK = true`). **Değişmeyenler:**
  haritada olmayan ya da 200 vermeyen/kanoniği kendisi olmayan adres hiçbir kipte gitmez; toplu eski betik `indexnow-bildir.mjs`
  kapısı (yukarıdaki iki madde) bu kararla DEĞİŞMEDİ, çünkü o betik haritanın tamamını bir kerede gönderir.
- Kaynak: indexnow.org/documentation, /faq; blogs.bing.com/webmaster/May-2025/… (2025-05-19).

## D5 — llms.txt hükmü

Google resmi yönergesi: "Google Search ignores them" (developers.google.com/search/docs/fundamentals/ai-optimization-guide,
2026-07-10). OpenAI, Anthropic, Perplexity, Apple, Brave ve Bing belgelerinde `llms.txt` geçmiyor; okunduğuna dair **resmi
kanıt yok**. Dosya yine de duruyor (düşük maliyet) ve **yalan söylemez**: sayfa/kategori sayısı ve dil beyanı site haritasıyla
çelişirse canlı kapı KIRMIZI verir (`LLMS-SAYFA`, `LLMS-DIL`, INV-LLMS-GERCEK-1, SEO-6). Dosyanın faydası ölçülmedi; yatırım
buradan yapılmaz.

## D6 — Açık sorular (ölçülmedi, kapatılmadan hüküm verilmez)

| Soru | Neden açık | Kim kapatır |
|---|---|---|
| ChatGPT'nin güncel dizin karışımı | OpenAI yardım sayfaları 403, resmi açıklama okunamadı | GEO-SEO (belge yeniden denenir) |
| Claude'un arama sağlayıcısı | Anthropic doğrulamadı; Trust Center sayfası boş | GEO-SEO |
| Tüketici Copilot'un "Bing'den beslenir" belgesi | yalnız Copilot Studio belgesi okundu | GEO-SEO |
| Gerçek botların sitemizde aldığı yanıt (OAI-SearchBot, PerplexityBot, Claude-SearchBot, bingbot, Applebot) | Vercel günlüğü kullanıcı ajanını vermiyor; güvenlik duvarı yönetilen kuralı API'de okunamadı | ALTYAPI (ALT-9) |
| Bing AI Performance raporu için API | duyuruda yok; "2026'da gelecek" yalnız ikincil kaynakta | GEO-SEO |
| Google AI Overviews / AI Mode'un Türkiye'de açık olup olmadığı | belge okunmadı | GEO-SEO |
| ChatGPT/Perplexity/Claude/Copilot/Gemini'de "VentHub" soruları (arama açık/kapalı) | ölçülmedi | GEO-SEO (`geo-olcum-standard.md`) |
| Gizli akıtmalı blok (`S:0`) basit okuyucuda görünür mü | ölçülmedi | GEO-SEO |

## D7 — Dizin takip defteri: istek atmadan önce karar, istekten sonra kayıt (v0.2, 2026-11-06, Kanban SEO dizin-takip kartı)

**Niçin.** Dizin işlemleri dağınık kayıtlıydı (Google elle istek defteri 4 Kasım'a kadar tek satır, Bing gönderim çıktıları ayrı klasörlerde, Yandex gönderimleri yalnız durum dosyasında). Sonuçları (ölçüldü, 6 Kasım): 5 Kasım Google elle istek sırası kimse görmediği için kaçtı; aynı adres (fan çeşitleri) Yandex'e 4 Kasım'da iki kez gönderildi (panel geçmişi 10:08 ve 21:32); `bing-url-gonder.mjs` çıktı dosyası gün adıyla yazıldığı için aynı günün ikinci gönderimi birincinin kaydını ezdi; "hangi yazı hangi motorda taranmadı" her seferinde baştan ölçüldü. Aynı işin ikinci kez yapılması Google'da günlük kotadan (~10-11 adres), Yandex'te günlük 10 adresten yer yer.

**Kurallar.**

1. **Tek defter.** Depo dışı `hareketler.jsonl` (varsayılan `~/VentHub-Olcum-Arsiv/geo-seo/dizin-takip/`; depo içi yol REDDEDİLİR, repo PUBLIC). Satır: `{tarih, motor, eylem, adres, sonuc?, kaynak?}`; motor `google|bing|yandex|indexnow`, eylem `istek|gonderim|olcum`. Çıktı dosyaları (ör. Bing gönderim JSON'u) kayıt sayılmaz, defter asıldır.
2. **İstekten sonra aynı turda kayıt.** Dış eylem (Google "Dizine eklenmesini iste", Bing `--gonder`, Yandex "Sayfaları yeniden tara", IndexNow) bittiği anda `node scripts/seo/dizin-takip.mjs --kaydet <motor> <eylem> <adres,adres>`; kayıtsız eylem yapılmamış sayılır. Eski kayıtlar `--ice-aktar` ile tek seferde taşınır (çiftlemez); Yandex için kaynak panelin "Gönderilen sayfalar" listesidir (elle okunur, `--tarih` ile).
3. **İstekten önce karar.** `node scripts/seo/dizin-takip.mjs --durum` canlı site haritasından adres ve `lastmod`'u, Google URL Inspection API'den ve Bing GetUrlInfo'dan son tarama tarihini okur, defterle birleştirip her adres×motor için tek karar verir. **Yalnız YAP ya da TEKRAR olan adres×motor'a istek atılır.**
4. **Karar tablosu.**

| Karar | Koşul | İstek? |
|---|---|---|
| TAMAM | son tarama ≥ `lastmod` (IndexNow: bildirim `lastmod` sonrası) | hayır |
| BEKLE | tarama yok/eski AMA `lastmod` sonrası istek var, eşik dolmadı | hayır |
| TEKRAR | aynı durum, eşik doldu (Google 7, Bing 5, Yandex 7 gün) | evet |
| YAP | taranmamış/eski ve `lastmod` sonrası hiç istek yok | evet |
| ATLA | sayfa noindex (ör. İngilizce kategori sayfaları, EN yayını kapalıyken) | hayır, kota boşa gider |
| ESKI | tarama bilgisi API'den gelmeyen motor (Yandex, IndexNow) ve `lastmod` adres bazlı kayıt başlangıcından önce (Yandex 1 Kasım, IndexNow 5 Kasım) | hayır, geçmiş bilinmiyor |
| OLCULEMEDI | durum okunamadı (API hatası, hız sınırı) | hayır, önce yeniden ölç; sessiz sıfır yok |

5. **Eşikler ölçülmüş değil.** 7/5/7 gün başlangıç varsayımıdır; TEKRAR çıkan her adresin sonucu tabloya yazılır ve eşik üç koşu sonra gözden geçirilir. Bing hız sınırı (art arda çok `GetUrlInfo`) ölçüldü: başarısızlar bir kez yavaşça yeniden denenir.
6. **`lastmod` sınırı.** Bazı `lastmod` değerleri yalnız tarihtir (00:00Z); aynı gün içindeki değişiklik ile tarama sırası karar veremez, tarama günü ≥ `lastmod` günü TAMAM sayılır. İçerik gün içinde sonra değişirse yeni `lastmod` yeni karar doğurur.
7. **Kanban.** Kalıcı takip kartı SEO panosundaki "Dizin takip düzeni" kartıdır: her `--durum` koşusunun tablosu karta not yazılır; BLOG yayın bildirimi geldiğinde adres tabloya girer, aynı turda istekler atılır ve kayıt düşülür. Dizin isteği GEO-SEO görevidir, Recep'ten ayrıca onay istenmez; kota gerektiren iş sırası bu tabloya göre kurulur.
8. **Yedek ve sonuç geçmişi (2026-11-08).** `--kaydet` ve `--ice-aktar` her yazımdan sonra defteri `dizin-takip/yedek/hareketler-<gün>.jsonl` olarak kopyalar (aynı gün üzerine yazar); `DIZIN_TAKIP_YEDEK2` verilirse ikinci kopya depo dışı o klasöre de gider. `--durum` çıktısı `--cikti` verilmese de defter klasörüne `dizin-takip-<gün>.json` yazar: işlem geçmişi ile sonuç geçmişi (hangi gün TAMAM oldu) birlikte kalır. Kayıt 2026-11-04'ten başlar; öncesi için yalnız elle istek defterinden taşınan satırlar vardır. Yedekler hâlâ aynı makinededir; başka diske kopya ARAÇ'la bağlanır.
9. **Öncelik sırası (2026-11-08, Recep).** Dizin isteği GEO-SEO listesinde takip ve kontrol ölçümlerinden önce gelir. Sıra: (1) kota yüzünden atılamamış YAP/TEKRAR adresleri (Google kotası dolduysa ertesi gün kota açılışında ilk iş), (2) yeni yayınlanmış yazılar (yayın bildirimi gelince aynı turda), (3) kontrol ve takip ölçümleri. Günün ilk adımı `--durum`; liste bu sıraya dizilir. Onay sorulmaz.
10. **Yalnız-tarih `lastmod` toleransı (2026-11-08, SEO-98).** `lastmod` saatsiz (`2026-11-08`) ya da tam gece yarısı UTC ise gün içi sıra bilinmez; o gün TR saatiyle önceki günün 21:00Z'sinde başlar. Bu yüzden istek/bildirim yalnız-tarih `lastmod`'dan en çok 3 saat önceyse "lastmod sonrası" sayılır (BEKLE/TAMAM). Saatli `lastmod` için tolerans yoktur. 8 Kasım'da 7 Kasım 22:49Z isteğine 8 Kasım `lastmod` yüzünden gereksiz YAP denmesi bunu doğurdu.

## D8 — Ölçüm arşivi: yeni ölçümden önce "daha önce ölçüldü mü", ölçümden sonra kayıt (v0.1, 2026-11-06, Kanban SEO-87)

**Niçin.** 6 Kasım 2026'da iki gün önce yapılmış bir kıyasın (SEO-83) üzerine, o kayıt aranmadığı için yeni plan yazıldı. Ham ölçümler depo dışında yüzlerce dosyada dağınıktı, indeks ve yedek yoktu.

1. **Yer.** Arşiv `~/VentHub-Olcum-Arsiv/geo-seo/` (kullanıcı klasörü altında, depo DIŞI; repo PUBLIC, arama ve Search Console verisi depoya girmez, P6). `C:/tmp` altında arşiv tutulmaz: temizlik işleri orayı siler.
2. **İndeks.** Arşivdeki `INDEKS.md` her klasör ve dosya için bir satır tutar: giriş, kart no, tarih, ne ölçüldü. Yeni klasör açılınca aynı turda indekse satır yazılır; satırsız klasör "ölçülmemiş" sayılır.
3. **Sorgu defteri.** Arşivdeki `olcumler.jsonl` tek defterdir. Satır: `tarih, sorgu, motor (google|bing|yandex|trends|gsc), kart, kaynak` + isteğe bağlı `tur (serp|gsc|trends|diger), sira, sayfaTipi (bilgi|kategori|karma|diger), adres, not`. Depo içi yol reddedilir.
4. **Önce sor.** Yeni SERP, Search Console ya da Trends ölçümünden önce `node scripts/seo/olcum-defteri.mjs --sor "<sorgu>" [--motor ..]` koşulur. Çıktı: ÖLÇÜLDÜ (eşik içinde), ESKİ ÖLÇÜM (yeniden ölçüm gerekçeli) ya da ÖLÇÜLMEDİ (benzer kayıtlı sorgular listelenir). Yalnız `gsc`/`trends` kaydı varsa SERP ölçümü yok diye işaretlenir: sıra ve sayfa tipi bilinmez.
5. **Sonra yaz.** Her ölçümden sonra `--kaydet` (ya da toplu için `--toplu`); aynı gün+sorgu+motor+kart çiftlenmez. Kayıtsız ölçüm yapılmamış sayılır.
6. **Eşik.** 30 gün başlangıç varsayımıdır (SERP bir haftada değişir, ay sonunda güvenilmez); ölçülmemiştir, üç ESKİ kararından sonra gözden geçirilir.
7. **Yedek.** Arşiv yolu hafıza yedek kancasının kapsamına ARAÇ ile bağlanır (ayrı rutin kurulmaz); bağlanana kadar arşivin tek kopyası bu makinededir.
8. **Sınır.** Arşivde ölçüm kaydı vardır, hüküm yoktur: hüküm ilgili Kanban kartındadır; ham dosyaya dayanan sayı kartta "kaynak: <klasör>" ile anılır.

## Ölçüm geçmişi

| Tarih | Ölçüm | Sonuç |
|---|---|---|
| 2026-10-02 | SEO-1 dizin görünürlüğü (bot erişimi, sunucu HTML'i, Bing/Google dizini, konu sorguları, yapay zekâ arama aracı) | `docs/audits/dizin-gorunurluk-olcum-2026-10-02.md` |
| 2026-10-02 | REC-300 yayın öncesi tabanlar (EN ad, Search Console, bağlantı, PSI) | `docs/audits/rec-300-taban-2026-10-02.md` |
| 2026-10-09 | SEO-2 taban yenilemesi, 10-06 yayınından sonra (Search Console, bağlantı, PSI, canlı kapı) | `docs/audits/rec-300-taban-2026-10-09.md` |
