# Dizin görünürlüğü ölçümü — 2026-10-02 (SEO-1: "yapay zekâ web'de VentHub yok dedi")

> **Soru:** Recep 2026-09-30'da bir yapay zekâ ürününden "VentHub web'de yok" cevabı aldı. Sebep sitemizde mi, dizinde mi,
> yoksa o ürünün çalışma biçiminde mi?
> **Kim ölçtü:** GEO-SEO, ekip üyeleriyle (bot/Bing/HTML ölçümü, kaynak araştırması, çürütme turu, Search Console).
> **Yöntem sınırı (hepsi için):** ölçümler tek ağ çıkışından (bizim IP'miz); siteye yalnız GET atıldı; hiçbir adres
> Google/Bing/Brave'e gönderilmedi (dış çıkış yok). **Dayanak:** *ölçtüm* · *belgede okudum* · *tahmin*.
> **Ham veri (depo dışı):** `~/venthub-olcum/` ve oturum geçici klasörü; bu belge yalnız özet sayı taşır.
> **Cetvel:** `standards/dizin-sistemleri-standard.md` (hangi ürün hangi dizinden beslenir).

## Hüküm

"Yok dedi"nin teknik bir engelle açıklandığına dair **kanıt bulunmadı**: bot engeli yok, site Bing'de ve Google'da dizinli,
marka sorgusunda Bing'de 1.-2. sırada. En olası açıklama üç nedenin birlikte işlemesi — **payları ölçülmedi, sıralamak tahmin olur:**

1. Marka adı belirsiz ve az aranıyor (Google'da 28 günde "venthub" 23 gösterim; Trends'te "venthub" ve "venthub hvac" 12 ayda boş;
   Bing'de aynı sayfada e-rele.com, venhub.com, eventhub.net, venthub.nz).
2. Konu sorgularında ilk 10'da yok (5 Türkçe sorgunun hiçbirinde); yani asistan arama yapsa bile kaynak olarak bulması zor.
3. Her ürünün dizini farklı: ChatGPT (OAI-SearchBot + karma) ve Claude (büyük olasılıkla Brave) dizinleri **ölçülmedi**;
   "Bing'de olmak ChatGPT'de olmak demek değil". Ayrıca asistan o cevap için hiç arama yapmamış olabilir.

Düzeltilebilir, ölçülmüş kusurlar: kök `.txt` adresleri 500 veriyor (URN-15), llms.txt bayattı (SEO-6, #1646), 4 sayfa Google'da
dizinde değil (aşağıda 5).

## Ölçüm tablosu

| No | Ne ölçtük | Sonuç | Dayanak |
|---|---|---|---|
| 1 | Bot engeli: robots.txt ve 6 adres × 17 kullanıcı ajanı (102 istek) | robots.txt'te bota özel kural yok, `Allow: /`; yalnız `/admin /auth /account /checkout` kapalı. **102/102 istek 200**, 17 gövdenin özeti aynı, engel/challenge belirtisi 0. Gerçek Googlebot-Smartphone siteyi 09-11 ve 10-01'de başarıyla getirmiş (GSC son tarama) | ölçtüm. **Sınır:** kendi IP'miz, UA taklidi; Vercel yönetilen güvenlik duvarı kuralları API'de okunamadı (404 "Seawall Config not found"); Vercel günlüğü bot UA vermiyor → Bing/OpenAI/Perplexity/Anthropic/Apple gerçek bot erişimi **ölçülmedi** (ALT-9) |
| 2 | Sunucu HTML'i (JS'siz) | ana sayfa 1088, makale 2205 kelime; title/description/canonical var; JSON-LD var. Kategori (134) ve ürün (271 kelime) içeriği gizli akıtmalı blokta (`<div hidden id="S:0">`), ham HTML'de duruyor | ölçtüm. Basit okuyucunun bu bloğu nasıl işlediği ölçülmedi |
| 3 | Bing dizini (gerçek tarayıcı, 20+ sorgu) | venthub.com.tr'den **12 ayrı adres** Bing'de (ilk sayımda "14" yazılmıştı, düzeltildi); marka sorgularında ("venthub", "venthub hvac", "venthub.com.tr") 1. ve 2. sıra. `site:` işleci ortamda hiçbir alan adında çalışmadığı için toplam sayı ölçülemedi | ölçtüm |
| 4 | Google dizini (Search Console, hizmet hesabı) | 87 adresin **83'ü dizinde**, 4'ü değil | ölçtüm |
| 5 | Dizinde olmayan 4 adres | frekans konvertörü makalesi (taranmış, eklenmemiş) · `avens-dikdortgen-kanal-radyal` (hiç taranmamış) · `category/yedek-parca-ve-sensorler` ve `vortice-vort-commercial-in-line-rectangular` (Google bilmiyor) | ölçtüm. Çürütme turu: `avens-bvu-ls` Google'da DİZİNDE (son tarama 09-11) — Bing'de kendi başlığıyla çıkmaması Bing'e özgü; makale taranmış ama eklenmemiş. Bing tarafı yeniden ölçülmedi |
| 6 | Konu aramalarında görünürlük (Bing TR, tarayıcı, 5 sorgu) | "frekans konvertörü nedir", "asit dayanıklı fan", "aksiyel sanayi fanı", "hava perdesi", "ısı geri kazanımlı havalandırma": venthub.com.tr **hiçbirinde ilk 10'da yok**; marka eklenince çıkıyor. Google'da 28 günde 447 gösterim/24 tık (SEO-2 tabanı) | ölçtüm |
| 7 | Marka adı belirsizliği | "venthub" sorgusunda e-rele.com (Venthub Terms), venhub.com, eventhub.net, venthub.nz aynı sayfada; "venthub hvac"te GitHub deposu (peckop) 3.-4. sırada; İngilizce (US) "venthub"te venthub.com.tr 4. sırada | ölçtüm |
| 8 | Claude Code `WebSearch` aracı (arka uç bilinmiyor) | 15 serbest sorguda venthub.com.tr **0 kez** çıktı; çıkan GitHub deposu ve PR sayfaları; alan filtreli iki sorgu "No links found" | ölçtüm. Arka ucun Bing/Google/Brave olduğu **bilinmiyor** |
| 9 | Google Trends (Supermetrics, TR) | "venthub", "venthub hvac" 12 ay ve 90 günde boş; "hava perdesi" 52 haftanın 51'inde veri. Düşük hacimde Trends aralığa göre veri veriyor: boş = "ölçülemeyecek kadar az", "hiç aranmıyor" değil | ölçtüm |
| 10 | Hangi yapay zekâ ürünü hangi dizinden besleniyor | `standards/dizin-sistemleri-standard.md` D1 | belgede okudum (resmi belgeler; Claude=Brave ve ChatGPT karışımı üçüncü taraf, **tahmin**) |
| 11 | IndexNow | robots/sitemap/llms/ana HTML'de izi yok; anahtar dosyası adı bilinmediğinden aranamadı. Google IndexNow'u desteklemiyor | ölçtüm (kısmen) + belgede okudum |
| 12 | llms.txt ve sitemap çelişkisi | llms.txt "~190 sayfa, TR/EN hreflang, ~37 kategori, /en aynaları var, Last updated 08-29" diyordu; sitemap 87 adres, hepsi `/tr`, 24 kategori, hreflang yok. Kasıt değil, bayatlık | ölçtüm. Düzeltme: SEO-6 (#1646) |
| 13 | `/en` vitrini | `/en` ve `/en/products` `noindex, follow`; sitemap'te `/en` yok; hreflang yok. **Kasıt:** Recep kararı 2026-09-07 (REC-204: "her zamanda olsun istemiyorum, biz sorunlarımızı çözelim, sonra yayınlansınlar"), bayrak `EN_YAYIN=false`, hreflang'ı kapatan commit 09-29 (#1493). Bing yine de `/en`'i listeliyor (noindex öncesi kayıt olabilir) | ölçtüm + belgede okudum; Bing kaydının sebebi **tahmin** |
| 14 | Var olmayan kök adresler | `/llms-full.txt`, `/ai.txt`, `/humans.txt`, `/ads.txt`, `/security.txt`, `/news-sitemap.xml`, uydurma `/xyz.txt`: **500** (404 olmalı). Günlük: `RangeError: Incorrect locale information provided at new Collator ([lang]/page.js)`. Sebep (kod okuma): `src/middleware.ts:111-114` kök seviyedeki her `.txt`'yi dil yönlendirmesinden muaf tutuyor (REC-127, IndexNow anahtarı için), olmayan ad `[lang]` rotasına dil değeri olarak düşüyor; son halka çıkarım. Kasıt değil. Dizin kaybına yol açtığına dair ölçüm yok | ölçtüm (500, günlük); mekanizma kod okuma + çıkarım. Onarım: URN-15 |
| 15 | Hız (SEO-2) | 87 sayfa kırık 0; PSI mobil performans ort. 0,746 (51 sayfa 75 altı), LCP ortanca 6029 ms | ölçtüm (`rec-300-taban-2026-10-02.md`). Ayrı kart SEO-7, başlamadı |

## Çürütme turu (bağımsız üye, ölçümleri çürütmeye çalıştı)

| Bulgu | Sonuç |
|---|---|
| B1 bot engeli yok | **çürütülemedi**; yönetilen güvenlik duvarı kuralları bu araçla ölçülemedi (sonuç "engel yok" değil, "bu araçla ölçülemiyor"). Googlebot için gerçek kanıt var, diğer botlar için yok |
| B2 makale ve `avens-bvu-ls` dizinde yok | **kısmen çürüdü:** `avens-bvu-ls` Google'da dizinde; makale taranmış ama eklenmemiş. Bing tarafı yeniden ölçülmedi |
| B3 WebSearch siteyi getirmiyor | çürütülemedi (9 yeni sorgu, 0/9) |
| B4 `/en` noindex | **kasıt kanıtı bulundu** (REC-204, bayrak, kapı INV-EN-YAYIN-1); hata değil, karar |
| Ek bulgu | kök `.txt` 500 hatası (ölçüm ekibinin gözünden kaçmıştı) |
| Sitemap sayımı | 87 doğru (bir WebFetch küçük modeli "91" demişti, `curl` sayımı 87) |
| Belge bayatlığı | `docs/plans/rec-300-3e-dilim-plani-2026-09-29.md` satır 75 "/en ve /en/products index" diyor; bugün ikisi de noindex |

## Ölçülemeyenler (dürüst liste)

Google ve Bing için `site:` toplam sayımı · Google'da konu sorgusu sıralaması (curl'da boş, tarayıcıda 429 insan doğrulaması; aşılmadı) ·
DuckDuckGo konu sorguları (3 sorgudan sonra engelledi) · gerçek bot IP'siyle istek ve botların sitemizde aldığı yanıt ·
ChatGPT/Perplexity/Claude/Copilot/Gemini'de aynı marka sorusunun arama açık/kapalıyken cevabı · Bing "yaklaşık sonuç sayısı" (33 ile 155.000
arasında oynuyor, güvenilmez).
