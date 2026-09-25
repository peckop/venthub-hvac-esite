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

**Durum:** TASLAK. Koşu elle yapılır; zamanlayıcı/cron/loop kararı önce Recep ile konuşulur (karar 53).
Koşu betiği yazılınca G7'deki kapı onu getiren PR'da doğar.

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
- **Gemini modeli:** ücretsiz katmanda Google arama desteği yalnız 2.5 serisinde açık; 3.x modelleri aramalı
  istekte 429 verdi, `gemini-2.5-flash` yeni kullanıcıya kapalı (404) — ölçüldü 2026-09-25. Yani ölçülen,
  Google'ın yapay zekâ modunda kullanılan modelin **küçük kardeşidir**. Model kapatılırsa ya da değişirse
  ölçüm geçmişine yazılır ve eski/yeni sonuç doğrudan kıyaslanmaz; ücretli katmana geçiş OPS üzerinden
  Recep'e ayrı soru olur.
- **Tarayıcıyla soru sorulmaz.** Google sonuç sayfası ve içindeki yapay zekâ modu `pazar-olcum-standard.md`
  P4 gereği otomatik açılmaz (robots.txt `Disallow: /search`). Diğer sohbet arayüzleri de şartları ayrıca
  ölçülüp yazılmadan tarayıcıyla otomatik sorulmaz.
- **Anahtarlar** yalnız kullanıcı ortam değişkenindedir; depoya, Linear'a, posta kutusuna ve günlük dosyasına
  yazılmaz. Varlığı yalnız "var/yok + uzunluk" ile ölçülür.

## G2 — Soru listesi

- **Yer:** Linear kaydına ek (REC-369) + çalışma kopyası `~/venthub-olcum/geo/`. **Depoya girmez**
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
- **Kota:** Gemini ücretsiz aramalı istek günde 500 (paylaşımlı). 50 × (1 + 2 tekrar/10 soru) ≈ 70 istek.

## G4 — Kayıt biçimi

Her cevap bir satır (JSON), `~/venthub-olcum/geo/<tarih>/<motor>.jsonl`:

`soruNo · listeSurum · motor · model · zaman (UTC) · cevapMetni · kaynaklar[] (adres + başlık) · venthubMetinde
(bool) · venthubKaynakta (bool) · venthubSayfalari[] · hata`

- Ham cevap depo dışında kalır. Linear kaydına aylık özet + ham dosya eki gider.
- Depoya yalnız G5'teki **özet oranlar** girer (Ölçüm geçmişi tablosu).

## G5 — Ölçütler

| Ölçüt | Tanım |
|---|---|
| **Görünürlük oranı** | VentHub'ın metinde **ya da** kaynakta geçtiği soru / toplam soru (motor başına) |
| **Kaynak oranı** | VentHub'ın kaynak listesinde olduğu soru / toplam soru |
| **Sayfa dağılımı** | Kaynak gösterilen VentHub sayfaları ve kaç soruda (hangi sayfa türü çalışıyor) |
| **Rakip payı** | Kaynaklarda en sık geçen 10 alan adı — **yalnız Linear'da** (rakip adı depoya girmez) |

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

⚠Bugün bu cetveli zorlayan otomatik kapı yok. Koşu betiği (`scripts/seo/geo-olcum.mjs`, yazılacak) geldiğinde
ağsız kısmı (cevaptan VentHub/kaynak ayıklama, G4 satır biçimi, anahtarın çıktıya yazılmaması) `ci` testine
bağlanır; kapı betiği getiren PR'da doğar.

---

## Ölçüm geçmişi

Kaynak sınıfı: **A** = GEO-SEO'nun kendi ölçümü · **B** = başkasının ölçümü, okundu.

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-25 | Claude, temiz oturum, 1 deneme sorusu (ürün ailesi — satın alma niyeti) | A | Cevap 14 satıcı saydı; **VentHub metinde ve kaynakta yok** |
| 2026-09-25 | Gemini `gemini-2.5-flash-lite` + Google arama, aynı soru | A | 8 kaynak; **VentHub yok** |
| 2026-09-25 | Gemini erişim yolu | A | Anahtar geçerli; aramalı istekte 3.x ve `flash-lite-latest` → 429, `2.5-flash` → 404 (yeni kullanıcıya kapalı), `2.5-flash-lite` → 200 |
