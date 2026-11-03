# Claude SEO eklentisi: GEO-SEO akışında nerede, ne zaman, hangi şartla (SEO-77, 3 Kasım 2026)

Kaynak: kurulu sürüm 2.5.0 (agricidaniel-claude-seo, MIT) klasörü okundu; `scripts/claude-seo doctor` koşuldu. **Eklentinin hiçbir skill'i çalıştırılmadı**: aşağıdaki her satır okumaya dayanır, "denenmedi" demektir. Kurulum izni: karar 417 / kart OPS-186 (yalnız `claude-seo`, `--scope local`; `/seo setup`, `/seo google setup` ve eklentinin Google dizin komutları `index`, `index-batch` kapsam dışı). Rol kuralı: `docs/roller/GEO-SEO-kurallar.md` "VentHub SEO ek kuralları" eklenti metninden önce okunur, çelişirse onlar kazanır (SSS işaretlemesi konmaz, TR/EN eşlik, kanonik venthub.com.tr).

## 1. Ne zaman aktif olur

- **Elle:** `/seo <komut> <adres>` yazılınca (audit, page, sitemap, schema, technical, content, geo, sxo, hreflang, drift, programmatic ve diğerleri).
- **Modelin kendi seçimiyle:** her skill'in açıklamasında "şunu denince kullan" cümlesi var (örnek: "sitemap", "hreflang", "SEO drift", "AI Overviews"). Konu geçince model skill'i yükleyebilir; skill açıklamaları her pencerenin bağlamına girer (bedel). Bu pencerede **bilerek** çağırma kuralı aşağıdadır.
- **Kendiliğinden (tek şey):** `Edit` ya da `Write` ile bir dosya yazılınca `validate-schema.py` JSON-LD doğrular. Salt okuma, 30 sn zaman aşımı, ayar gerektirmez.
- **Hiçbir arka plan görevi, zamanlayıcı ya da ağ çağrısı kendiliğinden başlamaz.**

## 2. Çalışma durumu (ölçüldü)

`doctor` sonucu: `ready: false`, `browser_ready: false`, `mode: plugin-fallback`. Sebep: yönetilen Python ortamı yok. Eklentinin Python araçları (sayfa çekme `render_page`, ayrıştırma `parse_html`, site haritası keşfi `sitemap_discovery`, PageSpeed, drift veritabanı, Google API) bu ortam olmadan çalışmaz; kurulum `/seo setup` ile yapılır ve karar 417 kapsamı dışındadır. Yani şu an eklentiden alınabilen: skill'lerin **metin akışı** (kontrol listeleri, eşikler, rapor biçimi) + Claude'un kendi WebSearch/WebFetch ve Chrome araçları. Python araçlı kısımlar için ortamın kurulması kararı Recep'in (ARAÇ uygular), ben kurmam.

## 3. Kullanım haritası

| İş | Eklenti aracı | Bizim asıl kapı (önce bu) | Hüküm |
|---|---|---|---|
| Yazı Google'da çıkmıyor (SEO-71 türü) | `seo-sxo`: ilk sayfada hangi sayfa türü çıkıyor, bizimki o türde mi | GSC API/URL denetimi, Bing API, Chrome ile `hl=tr gl=tr pws=0` SERP | **Kullan, ikinci adım.** Dizinde ve 0 gösterim ise sayfa türü uyumuna bakmak için. Skill SERP için WebSearch der; TR sonucu için ölçümü Chrome'la yapıp ona veri veririm (denenmedi) |
| Yeni adres şeması, tür başına site haritası (SEO-76) | `seo-sitemap` (50.000 adres ve 50 MB sınırı, robots.txt'te Sitemap, tür başına bölme), `seo-hreflang` | `adres-yayin-denetim.mjs`, `bot-karnesi.mjs` | **Kullan, kontrol listesi olarak.** Betik denetimini değiştirmez; Python aracı için ortam gerekir |
| Yeni rehber yazısı yayında, R10 ölçümü | `seo-geo` (alıntılanabilirlik, varlık netliği, tarayıcı erişimi), `seo-content` (E-E-A-T, inceltilmiş içerik) | `geo-olcum-standard.md` ölçümü, GSC gösterim/sıra | **Kullan, yalnız öneri üretmek için.** Sayıyı eklentiden almam, uydurma sayı yasağı geçerli; içerik değişikliği BLOG'un |
| Çok sayıda ürün/model adresi (442+, 1000+) | `seo-programmatic` (100+ sayfa uyarı, 500+ sert durdurma) | `programmatic-seo-gate` eklentisi (10-03'te kuruldu, aynı iş) | **İkisini birden kullanma.** Önce programmatic-seo-gate; seo-programmatic yalnız ikinci görüş |
| Başlık/H1/kanonik kayması izleme | `seo-drift` (SQLite, `~/.cache/claude-seo`) | Dizin tetiği (`degisen-adres-bildir.mjs`, SEO-55) aynı taban karşılaştırmasını yapıyor | **Kullanma.** Çakışıyor, ortam kurulumu ister |
| Search Console, Bing, IndexNow, dizin isteği | `seo-google` (kendi kimlik dosyası), eklentinin `index` komutları | `gsc-sayfa-oku.mjs`, `gsc-url-denetim.mjs`, `bing-webmaster-oku.mjs`, `bing-url-gonder.mjs`, `indexnow-bildir.mjs` | **Kullanma.** İzin dışı ve ikinci kimlik açar |
| Tam site denetimi | `seo-audit` (8 alt ajan paralel) | `bot-karnesi.mjs`, `link-tara.mjs`, `sayfa-kalite.mjs` | **Şimdilik kullanma.** Bellek sınırda (sanal bellek %91 uyarısı) ve ortam hazır değil |
| Yapılandırılmış veri | `seo-schema`, kanca | URUN/BLOG alanı | **Kanca zaten çalışıyor.** FAQPage önerirse uygulanmaz (rol kuralı) |
| Geri bağlantı, yerel, harita, e-ticaret, rakip sayfası, görsel üretimi, DataForSEO | ilgili skill'ler | yok | **Kullanma.** Ücretli anahtar, kapsam dışı ya da başka rolün alanı |

## 4. Akış (bu pencere için)

1. Ölçüm her zaman bizim betik ve panellerle başlar; eklenti ölçüm kaynağı değildir.
2. Ölçüm "sayfa kusuru yok, ama çıkmıyor / gösterim yok" derse `seo-sxo` açılır, bulgu karta "eklenti önerisi, denenmedi" etiketiyle yazılır.
3. Site haritası ya da adres şeması işlerinde `seo-sitemap` ve `seo-hreflang` kontrol listesi olarak okunur, kapı yine bizim betiklerdir.
4. Eklentiden gelen her sayı ve iddia kaynağıyla birlikte yazılır; kaynaksız iddia karta girmez.
5. Eklentinin `index`, `index-batch`, `/seo setup`, `/seo google setup` komutları çalıştırılmaz.

## 5. Açık sorular (Recep/OPS)

- Python ortamı (`/seo setup`) kurulsun mu? Kurulursa `seo-sitemap`, `seo-sxo` ve `seo-page` tam çalışır; kurulum karar 417 kapsamı dışında, ARAÇ uygular. Önerim: önce üç denemeyi (SEO-71 sessiz fan için `seo-sxo`, SEO-76 için `seo-sitemap`, bir yeni rehber için `seo-geo`) ortamsız metin akışıyla yap, değer görülürse kurulum sorulur.
- `seo-programmatic` ile `programmatic-seo-gate` aynı işi yapıyor: biri kapatılsın mı? Her ikisinin skill açıklaması her pencerenin bağlamına girer.
