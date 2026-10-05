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
| **Yandex** | Kendi dizini | `YandexBot` (tam kullanıcı ajanı listesi sayfası 404, U) | Yandex Webmaster, IndexNow | IndexNow ve JS B · bot listesi U | yandex.com/support/webmaster/en/indexing-options/index-now |

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
  Ölçüm 2026-10-03 (canlıya karşı kuru koşu): sitemap 87 adres, 78 atıldı, 9 kaldı, 9'u 200 ve kanonik. Değişecek 78 adres yayın günü
  adres yayınıyla aynı yayında gider.
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

## Ölçüm geçmişi

| Tarih | Ölçüm | Sonuç |
|---|---|---|
| 2026-10-02 | SEO-1 dizin görünürlüğü (bot erişimi, sunucu HTML'i, Bing/Google dizini, konu sorguları, yapay zekâ arama aracı) | `docs/audits/dizin-gorunurluk-olcum-2026-10-02.md` |
| 2026-10-02 | REC-300 yayın öncesi tabanlar (EN ad, Search Console, bağlantı, PSI) | `docs/audits/rec-300-taban-2026-10-02.md` |
