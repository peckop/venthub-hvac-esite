# Pazar ve Arama Görünürlüğü Ölçüm Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** VentHub'ın aramada ve pazarda nasıl göründüğünün hangi kaynaktan, hangi sıklıkla,
> hangi kuralla ölçüldüğü; haftalık takibin biçimi; hangi verinin depoya giremeyeceği.
> **Niçin var:** Recep (2026-09-23): "SEO ve GEO'da kendi çalışmamızla zirve; kim hangi ürünü arıyor
> ölçülsün." Ölçüm düzeni REC-369'da sekiz kol olarak yazıldı ama cetveli yoktu. 2026-09-24'te iki ölçüm
> düzeni değiştirdi: ücretli kaynak (DataForSEO) Recep kararıyla masadan kalktı; rakip sonuç sayfasını
> tarayıcıyla izlemenin Google şartlarına aykırı olduğu ölçüldü (P4).
> **Sahibi:** BLOG şeridi (karar 93: yazı + arama görünürlüğü; pazar ölçüm kolları). Araç kurulumu
> ALTYAPI'da. Recep'ten yalnız hesap, ödeme ve kimlik gibi tek seferlik adımlar istenir; Recep panellere
> elle girip iş yapmaz.
> **Kayıt:** REC-369. **İlgili cetveller:** `rehber-yazisi-standard.md` (R1 konu seçimi, R7 yazı ölçümü) ·
> `analytics-standard.md` (site içi olay ölçümü, GA4) · `hukum-kaynak-standard.md` (A/B/C kaynak sınıfı).

**Durum:** TASLAK. Haftalık koşunun zamanlayıcısı kurulmadı: zamanlayıcı/cron/loop kararı önce Recep ile
konuşulur (karar 53). O güne kadar haftalık koşu BLOG tarafından elle yapılır.

---

## P0 — Varsayılan ücretsizdir

Her kol önce ücretsiz ve resmî yolla kurulur. Ücretsiz yolun veremediği bir şey **ölçülürse** ve iş için
gerçekten gerekliyse, ayrı gerekçeyle OPS üzerinden Recep'e sorulur (Recep, 2026-09-24: "ücretsiz
yapılabiliyorsa neden ücret ödeyelim").

## P1 — Kollar

| Kol | Soru | Kaynak | Durum 2026-09-24 | Sahip |
|---|---|---|---|---|
| 1 | Google'da hangi aramada görünüyoruz, sıra, tık | Search Console API (hizmet hesabı, `scripts/gsc/gsc-token.cjs`) | ÇALIŞIYOR; veri 2026-08-28'de başlıyor | BLOG |
| 2 | Aylık arama hacmi | Google Ads API anahtar kelime servisi | Recep adımı bekliyor (P3) | BLOG ölçer · ALTYAPI kurar · Recep hesap |
| 3 | Mevsim ve il bazında ilgi | Google Trends web arayüzü (elle) | Resmî API alpha bekleme listesinde | BLOG |
| 4 | Rakip ve arama sonuç sayfası | Search Console'da kendi sıramız + arada bir elle bakış | Otomatik izleme YASAK (P4) | BLOG |
| 5 | Yapay zekâ cevaplarında VentHub geçiyor mu | Aylık sabit soru listesi | Yok; ölçüm yolunun şartlara uygunluğu ayrıca ölçülecek | BLOG |
| 6 | Sitede ne aranıp bulunamıyor | Sonuçsuz arama günlüğü (karar 87) | URUN kuruyor | URUN kurar · BLOG okur |
| 7 | Hangi ürüne teklif isteniyor | Teklif kayıtları (DB) | Veri var, rapor yok | BLOG |
| 8 | Ziyaretçi sitede ne yaptı | GA4 (`analytics-standard.md`) | Canlıda kimlik tanımlı mı ölçülmedi | ALTYAPI |

## P2 — Search Console kuralları (kol 1)

- **Veri gecikmesi:** Google'a göre veri normalde 2–3 günde gelir, son 2 günün verisi ön veridir
  (support.google.com/webmasters/answer/10083653). Haftalık koşu bu yüzden son 3 günü dışarıda bırakan
  7 günlük pencereyle yapılır.
- **Anonim sorgular görünmez:** Google, iki üç aylık sürede birkaç düzine kişiden azının yaptığı sorguları
  göstermez (search/blog/2022/10/performance-data-deep-dive). Bizde gösterimlerin yarısı, tıkların dörtte
  üçü bu yüzden sorgu satırında görünmüyor (F1 ölçümü, 2026-09-24).
- **İzlenen sorgu yalnız görünen sorgulardan seçilir.** Asıl izleme birimi **sayfa**dır (yazı adresi,
  kategori, ürün): sayfa bazındaki gösterim ve tık anonim sorguları da içerir.
- **Satır sınırı:** istek başına en çok 25.000 satır; site ve arama türü başına günde 50.000 satır.
- **Bilgi talebi Search Console'da görünmez:** site o konuda yazı yayımlamadıkça bilgi aramasında
  gösterilmez; konu seçimi dış kaynağa da dayanır (`rehber-yazisi-standard.md` R1.1).

## P3 — Arama hacmi (kol 2): yalnız resmî API

- Ads paneli (Anahtar Kelime Planlayıcı) **ajan tarafından tarayıcıyla kullanılmaz.** Google Advertising
  Program Terms: *"use any automated means or form of scraping or data extraction to access, query or
  otherwise collect Google advertising-related information from any Property except as expressly
  permitted by Google"*.
- Planlayıcının temel özellikleri **fatura bilgisi girilmeden açılmaz**: *"You must complete your account
  setup by entering your billing information to access basic features like 'Get ideas for new keywords'."*
  (support.google.com/google-ads/answer/7337243). Kampanyasız hesap açılabilir (answer/6366720).
- Resmî yol Google Ads API'dir. Geliştirici jetonları **2026-09-09'da kaldırıldı**, erişim Google Cloud
  projesine bağlıdır; planlama servisi "Basic" erişim ister, Basic için marka doğrulaması ön koşuldur
  (developers.google.com/google-ads/api/docs/api-policy/developer-token ve /access-levels, 2026-09-23).
- Hacim **yuvarlanmış** sayıdır (*"Your search volume statistics are rounded."*, answer/3022575); kesin
  sayı gibi raporlanmaz, aralık ya da "yaklaşık" diye yazılır.

## P4 — Rakip sonuç sayfası (kol 4): otomatik izleme yok

- Google Hizmet Şartları otomatik erişimi makine kurallarına aykırıysa yasaklar: *"using automated means
  to access content from any of our services in violation of the machine-readable instructions on our web
  pages (for example, robots.txt files that disallow crawling…)"* (policies.google.com/terms);
  google.com/robots.txt `User-agent: *` grubunda `Disallow: /search`. Hacim küçüklüğü bu kuralı
  değiştirmez.
- Resmî alternatif Custom Search JSON API yeni müşteriye kapalıdır (*"closed to new customers"*,
  2027-01-01'de tümden kapanıyor).
- Bu yüzden rakip izleme: Search Console'da **kendi** sıramız + insanın arada bir elle bakışı. Otomatik
  tarama önerisi karar olarak Recep'e götürülmez; şartlara aykırı iş karar değildir.
- Google arama önerisi ucu (`suggestqueries.google.com`) için robots.txt yok (404, ölçüldü); düşük hacimde
  konu keşfinde kullanılır, hacim vermez.

## P5 — Haftalık takip (her pazartesi)

Tasarım, Recep'in gösterdiği haftalık SEO şablonundan alındı (rerun.build weekly-seo-diagnostic, 2026-09-24);
platform ve ücretli veri kaynağı alınmadı.

| Bölüm | İçerik | Kural |
|---|---|---|
| 1. Ne değişti | İzlenen **10 sayfa** ve **en çok 10 görünür sorgu**: gösterim, tık, ortalama sıra; önceki haftaya göre fark | Önce değişim, sonra öneri |
| 2. Geçen haftanın önerisi | Önerilen 3 adımın her biri yapıldı mı, sonucu ne | Yapılmadıysa sebebi tek cümle |
| 3. Sonraki 3 adım | Tam 3 öneri, her biri kimin işi (BLOG / URUN / ALTYAPI) | Üçten fazla yazılmaz |
| 4. Geçmiş | Haftalık anlık görüntü, zaman serisi olarak saklanır | "Şu an" değil "zaman içinde ne değişti" birinci sınıf veri |

- **Salt okur, salt önerir.** Rapor siteyi değiştirmez; öneri ilgili şeride iş olarak gider.
- **Dil:** sade Türkçe; Recep'e OPS üzerinden kısa özet, ayrıntı Linear'da.
- **İzlenen 10 sayfa:** yayındaki rehber yazıları önce, sonra F1 kümelerinin karşılığı olan kategori ve ürün
  sayfaları. Liste Linear'da tutulur; değişiklik gerekçesiyle yazılır.
- **Saklama:** sorgu ve sayfa verisi PUBLIC depoya girmez (P6). Kalıcı saklama yeri (özel tablo ya da
  Linear eki) ilk koşuda ölçülüp bu satıra yazılır.

## P6 — Depoya girmeyen veri

Depo PUBLIC'tir. Şunlar depoya **girmez**, yalnız Linear kaydına ve özel depolamaya girer: arama sorgusu
listeleri, izlenen anahtar kelimeler, rakip adları ve adresleri, hacim verileri, yazı taslakları. Depoya
yalnız özet sayılar ve yöntem girer.

## P7 — Kapılar

⚠Bugün bu cetveli zorlayan otomatik kapı yok. Haftalık koşu betikleşince (Search Console çekimi + fark
hesabı) betiğin ağsız kısmı `ci` testine bağlanır (`rehber-yazisi-standard.md` R8.1 emsali: her kapı onu
getiren PR'da doğar). Bot kalitesi karnesi (`scripts/seo/bot-karnesi.mjs`) bu cetvelin teknik kolu olarak
yayındaki yazı adreslerinde haftada bir koşar.

---

## Ölçüm geçmişi

Kaynak sınıfı: **A** = BLOG'un kendi ölçümü · **B** = başkasının ölçümü, okundu.

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-24 | Search Console tabanı (F1) | A | Veri 2026-08-28'de başlıyor; 25 günde 34 tık · 448 gösterim · ort. sıra 28,0; sorgu satırında görünen gösterim %50 |
| 2026-09-24 | Ücretsiz kaynak sınırları (Sonnet araştırması, kritik iddialar BLOG ham curl ile) | A | SERP tarayıcı izleme şartlara aykırı; Custom Search yeni müşteriye kapalı; Trends API alpha |
| 2026-09-24 | Google Ads (Sonnet araştırması, 4 iddia BLOG doğruladı) | A | Planlayıcı fatura bilgisi ister; panel otomasyonu şartlara aykırı; geliştirici jetonu 2026-09-09'da kaldırıldı |
| 2026-09-24 | Kök adres ve x-default (REC-127) | A | `/` → 308 → `/tr` (bingbot ve Googlebot); `/tr`'de x-default mevcut — kayıttaki kusurlar kapalı |
