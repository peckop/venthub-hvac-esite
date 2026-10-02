# Yayın Görünürlük Denetimi Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** Arama görünürlüğünü etkileyen bir yayından (adres ağacı değişikliği, şablon değişikliği,
> site haritası değişikliği) **önce, yayın günü ve sonra** hangi ölçümün hangi araçla, hangi evrende
> koşulacağı; kabul ölçütleri; kusurun sahibi.
> **Niçin var:** REC-300 adres ağacı tek yayını 442 model adresi doğuruyor, ürün/aile/kategori/marka
> öneklerini değiştiriyor (`docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` §1–§2). Plan §5 Faz 5
> ön koşulları (Search Console tabanı, linkinator + unlighthouse taraması) ve §7 yayın ölçümü yazılıydı ama
> **hangi komutla, hangi evrende, hangi eşikle** koşulacağı yazılı değildi (OPS emri 2026-09-24: "cetvel
> yoksa yazımı bu işin kapsamında").
> **Sahibi:** GEO-SEO (karar 124, 2026-09-25; önceki sahibi BLOG, karar 93). Betikleri kapıya/zamanlamaya bağlama: ALTYAPI. Sayfa
> kusurunun onarımı: URUN. Yönlendirme ve başlık (robots, `next.config`, middleware haritası): ALTYAPI + URUN
> (adres haritası URUN'un REC-300 işidir).
> **İlgili:** `pazar-olcum-standard.md` P2 (Search Console tabanı), `rehber-yazisi-standard.md` R8 (iç
> bağlantı kapısı), `canonical-url-standard.md`, bot kalitesi karnesi (`scripts/seo/bot-karnesi.mjs`).

## Y1 — Araçlar

| Araç | Ne ölçer | Betik | Not |
|---|---|---|---|
| Search Console tabanı | tık, gösterim, sıra; sayfa×gün | `scripts/rehber/gsc-taban.mjs` | çıktı depoya girmez (pazar-olcum P6) |
| Adres denetimi | eski adres → aynı ya da **tek** 308 → 200; haritada yönlendirme 0; model sayısı; canonical kendini gösterir; hreflang tr/en/x-default | `scripts/seo/adres-yayin-denetim.mjs` | TAM liste, örneklem değil; yönlendirme izlenmez |
| Bağlantı taraması | site haritasındaki sayfalardaki site içi bağlantı + ürün görseli: kırık, yönlendirme | `scripts/seo/link-tara.mjs` (linkinator 8.1.0) | `--sitemap-url` + CSV (8.1.0'da JSON raporu site haritası kipinde boş — ölçüldü) |
| Yetim sayfa taraması | site haritasındaki her sayfaya, haritalı başka bir sayfadan ham HTML `<a href>` ile ulaşılıyor mu (JS çalıştırılmaz; `<button>`, `<link>`, script içi adres sayılmaz); gelen bağlantı dağılımı 0 / 1 / 2-3 / 4-10 / 11+ | `scripts/seo/yetim-tara.mjs` (`--taban`, `--cikti`, `--izin`) | çıkış 1 = yetim var, 2 = sayfa/harita alınamadı. Google: "Every page you care about should have a link from at least one other page on your site"; yalnız `<a href>` taranır. REC-472 (REC-471 kabul ölçütü). Ağsız kapı INV-YETIM-1 |
| Canlı tarama kapısı | yayındaki siteyi TEK geçişte ölçer (sitemap + her adresin ham HTML'i + az sayıda ek istek): yetim, title (yok/tekrar/uzun/taslak), meta açıklama (yok/tekrar/kesik/şablon/kısa), `<html lang>` (EN dahil), favicon ve ikon dosyaları, lastmod (bugün/toplu), robots.txt kalıpları + gizli yüzeyler, olmayan adres 404 mü, site içi bağlantı yönlendirmesi, yönlendirme zinciri, JSON-LD geçerliliği/şema uyarıları, changefreq, `llms.txt` beyanı (sayfa/kategori sayısı ve `Languages:` satırı haritayla aynı mı: `LLMS-SAYFA`, `LLMS-DIL`) | `scripts/seo/canli-kapi.mjs` (`--taban`, `--cikti`, `--bilinen <json>`, `--bugun`) | çıkış 0 temiz · 1 yeni KIRMIZI · 2 araç/ağ hatası. `--bilinen {"KOD":"REC-nn"}`: bilinen kırmızı çıkışı 1 yapmaz, yeni kırmızı yapar. Google kural denetimi REC-461 TEK-TABLO kural numaraları kod başına konsol özetinde. REC-502. Ağsız kapı INV-CANLI-KAPI-1 |
| Sayfa kalitesi | Lighthouse SEO / erişilebilirlik / iyi uygulama / performans | **PageSpeed Insights API v5** (Google sunucusunda Lighthouse, mobil; anahtar `PAGESPEED_API_KEY`, karar 127) — `scripts/seo/sayfa-kalite.mjs` (varsayılan `--kip psi`, `--strateji mobile|desktop`; geçici hata 3 deneme; anahtar hiçbir çıktıya yazılmaz) | örnekleme kapalı; ölçüt SEO; performans bilgi (REC-398). Yerel unlighthouse 0.18.1 **yedek**: 2026-09-25'te makinede boş bellek ~1 GB iken üç koşuda "Unable to get browser page" ile düştü (59→24→3 sayfa) |
| Googlebot gözüyle sayfa | URL Inspection API: sayfa başına Googlebot getirme sonucu, robots, dizin kararı, son tarama zamanı (Search Console "tarama istatistikleri" API'de yok — ölçüldü 09-27) | `scripts/seo/gsc-url-denetim.mjs` | kırmızı: getirme başarısız, robots engeli; hiç taranmamış ayrı sayılır. Kota günde 2000. REC-402 |
| Bot kalitesi karnesi | 5 bot kimliği × adres: aynı HTML, title, canonical, hreflang, JSON-LD | `scripts/seo/bot-karnesi.mjs --taban` | ön izleme sitesinde de koşar |

Araçlar **kurulmaz**: sürüm sabitli `npx` ile koşar, `package.json`'a dokunulmaz (kalıcı kurulum kararı
ALTYAPI'da, `bagimlilik-kararlari.md`). Her betik `--taban` alır: canlı, yerel ön izleme ya da dal önizlemesi.

**Ölçüm verisinin yeri:** çalışma kopyası depo dışında sabit klasör `~/venthub-olcum/<an>-<tarih>/`
(oturum geçici klasörü kalıcı yer değildir); kopyanın yolu ilgili Kanban kartına not olarak yazılır (karar 219; dosya depo dışı ve tek makinededir, yedek yeri ayrı karardır; REC-300 / REC-369 eski Linear kayıtlarıdır). PUBLIC
depoya yalnız özet sayı girer.

## Y2 — Ne zaman ne koşulur

| An | Koşu | Evren | Çıktı |
|---|---|---|---|
| **Taban** (yayından önce, canlı) | gsc-taban · adres-yayin-denetim (`--eski` verilmez → bugünkü site haritası `eski-adresler.json` olarak kaydedilir) · link-tara · sayfa-kalite · bot-karnesi | canlı site haritası | Kanban kartına not + depo dışı dosya yolu |
| **Ön izleme** (Faz 4, yerel üretim paketi) | adres-yayin-denetim `--taban <önizleme> --eski <taban listesi + plan §6 tam envanteri> --harita <eski-adres-haritasi.json> --model-beklenen 442 --sayfa-denetimi` · link-tara · bot-karnesi | ön izleme | kusur listesi → sahibine |
| **Yayın günü** (Faz 3-C deploy sonrası) | gsc-taban (son taban) · adres-yayin-denetim (ön izlemeyle aynı bayraklar, canlıya) · link-tara · sayfa-kalite + `--kiyas` | canlı | aynı gün Kanban kartı + OPS |
| **+1, +7, +28 gün** | adres-yayin-denetim · link-tara · gsc-taban (+7 ve +28'de tabanla kıyas) · sayfa-kalite (+7) | canlı | Kanban kartı |
| **Model adresleri yayından +1, +7, +14 gün** (SEO-4, URN-11) | gsc-url-denetim (model adresi örneklemi: son tarama, dizin durumu) · GSC site haritası durumu (gönderilen/dizinlenen, hata) · tarama sıklığının `lastmod` değişiminden bağımsız olup olmadığı | canlı | tek tablo URUN + OPS; tabana (REC-300 taban tablosu) kıyas. Gerekçe: model satırlarının `lastmod`'u `products.updated_at`, 441 aktif modelde 10 gün / 20 dakikaya yayılı (en büyük küme 09-25 09:11Z 166 model); aynı damgayı taşıyan çok adres Google'ın lastmod'u yok saymasına yol açabilir (REC-461/A). Bayrak kapalıyken model satırı haritaya girmez |
| **Her production dağıtımı sonrası + günlük** | canli-kapi (`--bilinen` ile bilinen kırmızılar kart numarasıyla; eski kayıtlarda REC-nn) — workflow ALTYAPI tarafından eklenecek (`workflow_run` + `schedule`, REC-502) | canlı | kırmızı çıkış → ilgili Kanban kartı |

EN_YAYIN kapalıyken `--en-harita-disi-bilincli` verilir: EN alternatifinin haritada olmaması kırmızı değil,
ayrı sayılır (ağaç `noindex`, bilinçli). Bayrak EN_YAYIN açılınca kalkar.

## Y3 — Kabul (yayın günü ve sonrası)

- Eski adres: `AYNI` ya da `TEK-308` (dil öneki olmayan eski adreste tek 307 meşru, plan §4); **ZINCIR 0 ·
  GECICI 0 · YOK 0 · HEDEF-YANLIS 0**.
- Site haritası: her adres doğrudan 200; model adresi sayısı = 442 (plan §1).
- Canonical: her sayfada tek ve kendini gösterir. hreflang: tr + en + x-default (EN bilinçli istisnası hariç).
- Bağlantı taraması: kırık 0 · site içi yönlendirme 0 (plan §7 "kırık 0, zincir 0").
- Yetim sayfa: **0** (site haritasındaki her sayfaya haritalı başka bir sayfadan ham HTML `<a href>` var;
  bilinçli istisna `--izin` ile verilir ve gerekçesi bu cetvelde yazılı olur).
- Canlı kapı: **KIRMIZI 0** (`canli-kapi.mjs`); onarımı henüz gelmemiş kırmızılar yalnız `--bilinen` ile REC numarasıyla
  bilinçli taşınır, her onarım bilinen listesinden çıkarılır.
- `llms.txt`: sayfa/kategori sayısı ve `Languages:` beyanı site haritasıyla **aynı** (`LLMS-SAYFA`, `LLMS-DIL`, INV-LLMS-GERCEK-1;
  EN_YAYIN açılınca dil satırı ve sayılar aynı PR'da güncellenir). Olmayan kök adres (`/ai.txt`, `/llms-full.txt` …) **404** verir, 500 değil (URN-15).
- Sayfa kalitesi: SEO ortalaması tabandan **düşmez**; aynı yolda SEO'su düşen sayfa 0.
- Search Console (+7/+28): "bulunamadı" birikimi 0; tık tabana göre kıyaslanır — geçici düşüş beklenir,
  kalıcı düşüş kusurdur (plan §8).

Kırmızı yayını geri almaz; kusur sahibine aynı gün yazılır (Y4). Geri alma kararı planın §11'indedir.

### Y3.1 Site haritası `lastmod` — gerçek değişiklik ya da hiç (REC-454, 2026-09-30)

- `lastmod` yalnız sayfada görünen verinin **gerçek** değişiklik tarihinden gelir: kategori `categories.updated_at`,
  ürün ailesi = ailenin ve aktif varyantlarının en son `updated_at`'i (`getFamilyLastModified`), rehber yazısı
  `guncellemeTarihi`. Güvenilir kaynağı olmayan satırda (sabit sayfalar, markalar, seri adresi) alan **yazılmaz**.
- Üretim anı (`new Date()`) lastmod olarak YAZILMAZ. Kapı: INV-SITEMAP-LASTMOD-1 (`src/app/__tests__/sitemapLastmod.test.ts`).
- **Niçin (ölçüm, 2026-09-29):** canlı haritada 87 adresin 61'i her gün "bugün" taşıyordu. Google lastmod'u yalnız
  tutarlı biçimde doğruysa kullanır; her şeyi her gün değişmiş ilan eden haritanın tarihlerini yok sayar ve yeni
  sayfanın gerçek tarihi de kaybolur. Aynı gün GSC: 83 dizinli sayfanın 81'ine son uğrama 8–30 gün önce.
  Aile/varyant `updated_at` sütunlarının gerçek değişikliği gösterdiği ölçüldü (2026-09-30: 47 aile, tarihler
  08-27…09-26 arasına yayılmış; toplu günlük yazım bu sütunları oynatmıyor). Toplu bir yazım bu sütunu her gün
  oynatmaya başlarsa kural yine çiğnenmiş olur — o gün kaynak alan yeniden seçilir.

## Y4 — Kusurun sahibi

| Kusur | Sahip |
|---|---|
| sayfa 404/500, eksik canonical/hreflang, kırık görsel, SEO puanı düşen sayfa | URUN |
| eski adres zinciri, yanlış hedef, eksik harita satırı | URUN (adres haritası REC-300) |
| robots, başlık (`X-Robots-Tag`), `next.config` yönlendirmesi, zamanlama/kapı | ALTYAPI |
| gerçek bot erişimi (Vercel Bot Protection / güvenlik duvarı kuralı, bot günlüğü) | ALTYAPI (salt okuma ölçüm, ALT-9) |
| olmayan adresin 500 vermesi (middleware kök `.txt` muafiyeti) | URUN (URN-15; ölçümü GEO-SEO, SEO-5) |
| `llms.txt` beyanı haritayla çelişiyor | GEO-SEO (SEO-6) |
| ölçümün kendisi (betik hatası, yanlış kırmızı) | GEO-SEO |

**Bilinçli istisna (2026-09-25, URUN):** yalnız TR'de yayında olan sayfa (EN karşılığı yok) hreflang basmaz —
`rehber-yazisi-standard.md` R6 "hreflang yalnız iki dil de yayındaysa". Adres denetiminin `SAYFA/HREFLANG`
kırmızısı bu sayfalarda ölçüm hatasıydı; betik artık ayırır (2026-09-27): sayfada **ve** site haritası satırında hiç
alternatif yoksa `ozet.sayfa.tekDil` sayılır, kırmızı değil. Biri alternatif bildirip öteki bildirmiyorsa kırmızı kalır
(ayırt edici çift testte). Tek dilli sayfada canonical denetimi aynen sürer.
**PSI geçici hatası:** `FAILED_DOCUMENT_REQUEST` ilk koşuda 86 sayfanın 6'sında çıktı, aynı sayfalar yeniden
denemede ölçüldü (sayfa curl ile 200, <0,6 sn). Tek deneme hatası kusur sayılmaz; en az iki ayrı yeniden deneme.

## Ölçüm geçmişi

| Tarih | Ölçüm | Sınıf | Sonuç |
|---|---|---|---|
| 2026-09-24 | Taban — adres denetimi (canlı, `--sayfa-denetimi --en-harita-disi-bilincli`) | A | Haritada 87 adres (yalnız TR; EN_YAYIN kapalı) · 87/87 doğrudan 200 · model adresi 0 (yayın öncesi beklenen) · canonical yanlış 0 · hreflang eksik 1 (`/tr/destek/merkez`: tr/en/x-default hiç yok → URUN) · EN bilinçli 86 |
| 2026-09-24 | Taban — sayfa kalitesi (unlighthouse 0.18.1, telefon benzetimi) | A | **KISMİ: 59/87 sayfa** — tarama 35 dk sonra çıkış 0 verdi ama toplu raporu yazmadı; sayfa raporlarından okundu (sarmalayıcı artık bunu yapar ve EKSIK-TARAMA diye kırmızı verir). SEO 1,00 (59/59) · erişilebilirlik 0,957 · iyi uygulama 0,96 · performans 0,637 (bilgi). Yayın öncesi tam tarama yeniden koşulmalı |
| 2026-09-25 | Taban — adres denetimi (canlı, aynı bayraklar) | A | Haritada 90 adres · 90/90 doğrudan 200 · canonical yanlış 0 · hreflang "eksik" 4 = TR-yalnız Bilgi Merkezi sayfaları, bilinçli istisna (Y4 notu). Aynı gün URUN 4 sayfayı yayından kaldırdı → harita 86 |
| 2026-09-25 | Taban — bağlantı taraması (linkinator 8.1.0) | A | 90 sayfa, 780 tekil adres · **kırık 0 · yönlendirme 0** (09-24'ün 3 kırığı #1399'la kapandı). İlk koşuda 62 sayfada `main-app-*.js` 404 = tarama deploy anına denk geldi; ikinci koşu temiz |
| 2026-09-25 | **Taban — sayfa kalitesi, TAM (PSI v5 mobil, Lighthouse 13.5.0)** | A | **86/86 sayfa** (ilk koşu 80 + 6 yeniden deneme). SEO **1,00 (86/86, en düşük 1,00)** · erişilebilirlik 0,954 (en düşük 0,94; n=85) · iyi uygulama 0,960 (n=85) · performans 0,732 (en düşük 0,52; bilgi — REC-398 hız teşhisi ayrı). Yayın sonrası kıyasın tabanı bu satırdır; ham veri depo dışı `venthub-olcum/taban-2026-09-25/psi/` |
| 2026-09-24 | Taban — bağlantı taraması (linkinator 8.1.0) | A | 87 sayfa, 782 tekil adres · site içi yönlendirme 0 · kırık 3: `og-default.jpg` 404 (11 kategori sayfası), `hvac_heat_recovery_7.png` 404 (ana sayfa), `og-image.png` 500 (destek merkezi) → URUN |
