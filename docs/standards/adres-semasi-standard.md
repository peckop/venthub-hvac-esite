# Adres Şeması Standardı (K3-b)

> **Durum:** v0.3 (tek önek) · 2026-11-09 · Şerit: URUN · **Uygulama öncesi cetvel** — şemanın kendisi REC-300 yayınıyla
> canlıya çıkar; bugün canlıda olan kısımlar "CANLI", yayını bekleyenler "HEDEF" diye işaretlidir.
> **v0.3 (URN-159):** yeni sitenin şeması §1A'dır (2 Kasım tek önek kararı: `/tr/urunler`, `/tr/uygulama-alanlari`,
> `/tr/rehber`; EN `products`, `applications`, `guides`; kaynak Design `adres.json` "kural" bloğu, DESIGN-MENU
> 2026-11-02). §1 eski sitenin (Next 15, K3-b/B-1) şemasıdır: bayraklar (`ADRES_SEMASI_K3B`, `EN_YAYIN`) kapalıdır,
> yeni siteye geçişte bu adresler **eski adres** olur (§3). A5–A11 iki şema için de geçerlidir.
> **v0.2:** alt kategori (dal) adresi TEK seviyedir (SEO-35 B-1, karar belgesi sürüm 5, 2026-10-10); v0.1'deki iki
> seviyeli dal adresi kalktı.
> **Plan:** `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` (v5) · **Kararlar:** SEO ve Yayın K3-b, Katalog
> K17, 59, 68, 78b, 84, 86.
> **İlgili cetveller:** `canonical-url-standard.md` (kanonik = yönlendirmesiz tek adres) · `category-taxonomy-standard.md`
> · `rendering-cache-standard.md` · `vitrin-metni-standard.md` K10 (dil) · `barindirma-standard.md`.

## 0. Bu cetvel niçin var

Adres kuralları bugüne dek karar metinlerinde, Design dosyalarında ve plan sürümlerinde dağınık durdu. Plan beş kez
bağımsız çürütmeden geçti ve her tur, yazılı bir kural olmadığı için birinin "zaten öyle" sandığı bir şeyi ölçtü:
config yönlendirmesinin sorgu dizesini taşıyıp döngü yapması, bugün bile 4 sıçramalı bir eski adres zinciri, Türkçe
tarayıcının İngilizce sayfaya gönderilmesi. CLAUDE.md 1. kural: cetvel yoksa iş cetveli yazmayı da kapsar.

## 1. Şema — eski site (K3-b, B-1) (HEDEF; bayrakla kapalı)

Eski sitenin hedef şemasıdır; yeni sitede kullanılmaz, geçişte kaynak (eski adres) tarafına geçer. Yeni site: §1A.

| Nesne | TR | EN |
|---|---|---|
| Tüm ürünler | `/tr/urunler` | `/en/products` |
| Kök kategori | `/tr/kategori/<kök>` | `/en/category/<kök>` |
| Dal (alt kategori) | `/tr/kategori/<alt-slug>` | `/en/category/<alt-slug>` |
| Aile (seri) | `/tr/urun/<aile>` | `/en/products/<aile>` |
| Model | `/tr/urun/<slug_tr>-p-<sku>` | `/en/products/<slug_en>-p-<sku>` |
| Marka | `/tr/markalar/<marka>` | `/en/brands/<marka>` |

**Dal adresi (B-1):** kök de dal da TEK segmenttir; adreste üst kategori YOKTUR. Üst-alt ilişkisi adresten
çıkarılmaz, `parent_id`'den okunur (örn. site haritası `kategoriArgumanlari` ile üst slug'ı veriden alır). İç içe
`/tr/kategori/<kök>/<dal>`, `/en/category/<kök>/<dal>` ve bugünkü `/tr/category/<kök>/<dal>` adresleri içerik çizmez:
yalnız TEK 308 ile dalın tek segmentli adresine gider. EN yayını kapalıyken (`EN_YAYIN`) bütün `/en/` sayfaları
noindex'tir ve site haritasında yoktur; alt kategori bunun dışında noindex DEĞİLDİR (`robots` yalnız pasif kategoride yazılır).

**A1 — Model çözümü:** yol son `-p-`'den bölünür; sağ taraf SKU'dur (harf duyarsız), sol taraf serbest metindir ve
çözümde **okunmaz**. Bu yüzden: SKU `-p-` içeremez ve `p-` ile başlayamaz; aile ve kategori slug'ı `-p-` içeremez
(DB kısıtları: `products_sku_adres_ayirici_yok`, `product_families_slug_adres_ayirici_yok`,
`categories_slug_adres_ayirici_yok` — PR #1338).

**A2 — Adreste SKU küçük harftir.** Büyük harfli SKU → 308 küçüğe. Sol metin kanoniğe uymuyorsa → **308 kanoniğe**
(yol bazlı karar, önbelleğe güvenle girer; "200 + canonical" YASAK — her uydurma metin ayrı bir 200 sayfa olurdu).

**A3 — Slug metni:** ≤ 70 karakter · teknik değer yalnız `technical_specs`'ten (uydurma sayı yok) · EN slug'da
Türkçe harf yok · kategori slug'ı zenginleşmez (Design slug kuralı §6). Model slug'ları üreticiyle kurulur:
`docs/plans/rec300-model-adres-uret.py`; tip kelimeleri rakip taramasıyla seçilir (karar 78) ve dal başına
kararlarla sabitlenir (karar 84: korozyon dalı `korozyon-dayanimli-asit-fani`;
**yerine geçti: karar 287 = B (2026-10-05):** korozyon dalı adı "Korozyona ve Aside Dayanımlı Fanlar", TR adresi
`korozyona-ve-aside-dayanimli-fanlar` · **karar 288 = B (2026-10-05):** radyal dalı adı "Radyal (Santrifüj) Fanlar",
adres `radyal-fanlar` değişmedi).

**A4 — Rezerve kelimeler:** Design v3 §4 listesi + `api`, `admin`, `_next`. Hiçbir kategori/aile/marka slug'ı
bunlarla kesişmez (HEDEF kapı INV-ADRES-CAKISMA-1).

## 1A. Şema — yeni site, tek önek (HEDEF; 2 Kasım kararı)

İki kök vardır: **Ürünler** (`/tr/urunler` ↔ `/en/products`) ve **Uygulama alanları** (`/tr/uygulama-alanlari` ↔
`/en/applications`). Ürünle ilgili her sayfa `urunler/` altında, düz (tek segment) adres alır; slug aranan ifadedir.
Kaynak: Design Venthub New `assets/veri/adres.json`, 9 Kasım okuma (kural bloğu ve damga; kural Design'ındır, bu cetvel ona uyar;
sayım 6 Kasım kopyasından: kategori 32, aile sayfası 17, seri 104, model 1206,
mekân 9, bina 5, marka 7, rehber 5, sabit 20).

| Nesne | TR | EN |
|---|---|---|
| Ürünler (kök) | `/tr/urunler` | `/en/products` |
| Kategori (grup, tür, grup-tür) | `/tr/urunler/<slug>` | `/en/products/<slug>` |
| Aile sayfası (2+ seri) | `/tr/urunler/<marka>-<aile>-serisi` | `/en/products/<marka>-<aile>-range` |
| Seri | `/tr/urunler/<marka>-<seri>` (temel seri dahil hiçbir seri ek almaz; tek serili ürün de); sitede ayrı seri sayfası olan her EC serisi ayrı adres (`<seri>-es`) | aynı slug, `/en/products/…` |
| Model | `/tr/urunler/<slug>-p-<sku>` | `/en/products/<slug>-p-<sku>` |
| Uygulama alanları (kök) | `/tr/uygulama-alanlari` | `/en/applications` |
| Mekân | `/tr/uygulama-alanlari/<mekan>-havalandirmasi` | `/en/applications/<mekan>-ventilation` |
| Bina | `/tr/uygulama-alanlari/<bina>-havalandirmasi` | `/en/applications/<bina-en>-ventilation` (örnek: `residential-ventilation`) |
| Rehber (liste) | `/tr/rehber` | `/en/guides` |
| Rehber yazısı | `/tr/rehber/<slug>` | `/en/guides/<slug>` (EN slug kararı bekleyen yazıda EN sayfa çizilmez) |
| Marka (liste) | `/tr/markalar` | `/en/brands` |
| Marka | `/tr/markalar/<marka>` | `/en/brands/<marka>` |

**A12 — Çakışma yalnız aynı önek içinde denetlenir:** `urunler/` içinde kategori ↔ seri ↔ aile (model `-p-` ile
ayrıktır); `uygulama-alanlari/` içinde mekân ↔ bina. Benzersizlik anahtarı `(dil, yol)`'dur. Denetim `adres.json`
üretiminde otomatik koşar; kapı adı ALTYAPI'dadır (INV-ADRES-CAKISMA-1 yeni önek için yeniden yazılır).

**A13 — Seri adresi yalnız katalog kimliğiyle kurulur** (`/tr/urunler/<seri-id>`; DB ya da katalog-grup kimliği).
İçerik kısa kimliği (punto, lineo gibi) adreste kullanılmaz.

**A14 — Marka sayfası ürün adresi üretmez.** Marka sayfası serileri kart ve bağlantı olarak gösterir; ürün adresi tektir
(`urunler/` altı). "Marka + tür" adresi yoktur. Marka içi süzgeç `#` parçasındadır: "Tüm <marka> ürünleri" →
`/tr/urunler#marka=<marka>` (`?marka=` kullanılmaz, ayrı canonical yoktur).

**A15 — Sabit sayfalar** (`belgeler`, `hesapla`, `destek`, `iletisim`, `hakkimizda`, `teklif-listesi`,
`teklif-iste`, `karsilastir`, `hesap`, `arama`, `site-haritasi`, 9 yasal sayfa; 6 Kasım kopyada 20 kayıt) `/tr/<ad>` ↔ `/en/<ad-en>` düz adres
alır; yasal sayfalar `/tr/yasal/<ad>` ↔ `/en/legal/<ad-en>` altındadır. `teklif-listesi`, `teklif-iste`, `karsilastir`,
`hesap` ve `arama` noindex'tir. Teklif onay sayfası (7 Kasım) `/tr/teklif/{no}` ↔ `/en/quote/{no}`'dur: noindex, site
haritasında yok; `teklif` ve `quote` bu yüzden rezervdedir. 404 ve hata sayfası adres almaz; sepet satış kipinde açılır, şimdilik yoktur.
Eski adı bilinen sabitler yönlenir: `/tr/bilgi-merkezi` → `/tr/rehber`, `/tr/nasil-teklif-alinir` → `/tr/destek`,
`/tr/sss` → `/tr/destek#sss` (EN: `/en/knowledge-hub` → `/en/guides`, `/en/how-to-get-a-quote` → `/en/support`,
`/en/faq` → `/en/support#faq`).

**A4 (yeni site) — Rezerve kelimeler:** `adres.json` "rezerve" listesi (9 Kasım okumada 42 kelime: `urunler`, `products`,
`uygulama-alanlari`, `applications`, `rehber`, `guides`, `markalar`, `brands`, `destek`, `support`, `iletisim`, `contact`,
`hakkimizda`, `about`, `teklif`, `quote`, `sepet`, `cart`, `hesap`, `account`, `arama`, `search`, `yasal`, `legal` ve çevirileri; tam liste
`adres.json`). Hiçbir kategori, aile, seri, mekân, bina ya da rehber slug'ı bunlarla kesişmez. `api`, `admin`, `_next`
teknik rezervi eski kuraldan sürer (A4, §1; `adres.json` listesinde yoktur). `bilgi-merkezi` ↔ `knowledge-hub`,
`nasil-teklif-alinir`, `sss` ↔ `faq` rezervde kalır ve A15'teki gibi yönlenir.

**Site haritası bölümleri:** `sitemap-kategori.xml`, `sitemap-aile.xml`, `sitemap-seri.xml`, `sitemap-model.xml`,
`sitemap-uygulama.xml`.

**A1–A3 yeni şemada:** A1 (model çözümü, son `-p-`) ve A2 (SKU küçük harf, uymayan metin → 308) aynen geçerlidir; A3'ün
"slug ≤ 70" ve "teknik değer yalnız `technical_specs`'ten" kuralları da geçerlidir. Kategori slug'ının "zenginleşmez"
kuralı ise yeni şemada Design kararıyla yeniden yazıldı (slug = aranan ifade, DESIGN-MENU 2026-11-02); ayrıntı `adres.json`'dadır.

## 2. Tek kanonik (CANLI ilke, REC-205)

**A5 — Bir sayfa hiçbir an iki adresten 200 dönmez.** 2026-09-07'de Google iki seviyeli dal adresimizi "kopya"
sayıp eledi; sebep iki adresin aynı anda 200 dönmesiydi. B-1 kararıyla dalın kanonik adresi TEK seviyelidir
(`/tr/kategori/<alt-slug>`, `/en/category/<alt-slug>`); iç içe `<kök>/<dal>` adresi **yalnız 308** verir —
**TR'de de EN'de de**, tek sıçramayla. Eski önek (`/tr/products/*`, `/tr/category/*`) yeni önek açıldıktan sonra
hiçbir girdide 200 dönmez.

## 3. Eski adresler — üç katman (HEDEF)

Yeni siteye geçişte **eski adres** iki gruptur: (a) bugün canlı olan eski site adresleri (`/tr/products/<aile>`,
`/tr/category/<ad>`, `/tr/brands/…`, `/tr/bilgi-merkezi/…`, `?sku=` ile aile sayfaları); (b) §1'deki hedef şemanın
adresleri (yayına çıkmadıysa gerekmez). Hedef her zaman §1A'dır; tek sıçrama (A9). Eşleştirme tablosu URN-157'dedir
(geçişe bağlı); tablo bu cetvele değil `adres.json` üretimine dayanır. Üç katman eski sitede nasıl çalışıyorsa orada kalır;
yeni kurulumda hangisinin taşınacağı OPS-180 kararıdır.

| Katman | Ne çözer | Kural |
|---|---|---|
| **1. Eski-adres haritası** (middleware, derleme anında üretilir) | yayın anında var olan her eski adres, `?sku=`, dilsiz eski adresler | istek başına tek sözlük araması, **DB sorgusu yok** (kural 12); hedefte sorgu dizesi yok; iki kaynak: DB + commit'li tohum dosyası (DB'de hiç olmamış eski adresler) |
| **2. Takma ad tablosu** `url_takma_adlari` (sayfa katmanı) | derlemeden SONRA değişen slug'lar | tetik yeniden adlandırma anında yazar; sayfa "bulunamadı" dalında okur → 308 |
| **3. `next.config`** | veriden bağımsız birkaç desen | eski ürün/aile/kategori deseni **YASAK** (config middleware'den önce koşar; desen haritayı devre dışı bırakır ve 2 hop doğurur) |

**A6 — Sağlayıcıya özgü yönlendirme özelliği kullanılmaz** (karar 59: barındırma Cloudflare'e taşınabilir).
Vercel Bulk Redirects bu yüzden ve sorgu dizesini desteklemediği için kullanılmaz.

**A7 — Harita derlemesi fail-closed:** DB'ye ulaşılamazsa ya da ürün sayısı önceki haritanın %90'ının altındaysa
derleme düşer. Boş haritayla yayın yok. Harita gzip sonrası **1 MB**'ı (Vercel Edge Hobby) aşamaz; yapısal tutulur.

**A8 — Yeniden adlandırma bir veri olayıdır.** Slug/SKU değişikliği için elle config satırı yazılmaz; takma ad
tetiği kaydeder. Tetik `SECURITY DEFINER`'dır (admin `authenticated` rolle düzenler), fail-closed'dur (takma ad
yazılamazsa yeniden adlandırma da olmaz). Canlı slug her zaman takma addan önce gelir.

## 4. Sıçrama bütçesi

**A9** — Dil önekli eski adres: **1 sıçrama** (308). Dil öneksiz eski adres: **1 sıçrama** (307, dil değişken
olduğu için kalıcı değil; Türkçe slug'lı dilsiz eski adres içerik Türkçe olduğu için **TR'ye 308**). Harita bayatken
(derleme sonrası değişen slug) en çok **2**. Sondaki `/` önce normalize edilir.

## 5. Dil tespiti (CANLI, PR #1336)

**A10** — Dil öneksiz adreste hedef dil: `NEXT_LOCALE` çerezi → yoksa `Accept-Language` **öncelik sırasıyla**
(q ağırlığı; eşitlikte önce gelen; `q=0` seçilmez) → yoksa `tr`. Başlıkta `en` harflerinin geçmesi dil tercihi
DEĞİLDİR (Türkçe Chrome `tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7` gönderir). Kapı: INV-DIL-TESPITI-1
(`src/test/dil-tespiti.test.ts`).

## 6. Önbellek ve tazeleme

**A11** — Model/aile sayfa verisi etiketle önbelleklenir (`unstable_cache` + `modelTag(sku, lang, tenantId)`);
etiketi tüketen önbellek yoksa `revalidateTag` no-op'tur (bugünkü `familyTag` gibi). Slug değişince **eski ve
yeni** slug'ın yolu ile eski ve yeni dal tazelenir. IndexNow'a iç yol değil `adresUret` çıktısı bildirilir.
308 yanıtları `max-age=0, must-revalidate` taşır (tarayıcı kalıcı önbelleğe almasın).

## 7. Kapılar

| Kapı | Durum |
|---|---|
| INV-DIL-TESPITI-1 — Accept-Language öncelik sırası | CANLI (`src/test/dil-tespiti.test.ts`) |
| INV-DIL-DUSUSU-1 — EN sayfada TR gövde metni yok | CANLI (`src/test/dil-dususu-yok.test.ts`, `e2e/dil-dususu.e2e.ts`) |
| Takma ad tablosu gölge senaryoları (10) | PR #1338 (Recep onayı bekler) |
| INV-ADRES-SEMASI-1 — iç bağlantı yalnız `adresUret`/`Routes` | HEDEF |
| INV-ADRES-CAKISMA-1 — rezerve kelime, `-p-`, tekillik | HEDEF (DB kısmı #1338) |
| INV-ADRES-COZUCU-1 — çözücü dalları | HEDEF |
| INV-ADRES-HARITA-1 — her satır tek hop, hedef 200, döngü yok, DB ile birebir | HEDEF |
| INV-ADRES-TEK-KANONIK-1 — tr ve en | HEDEF |
| INV-OZEL-AD-BUYUK-HARF-1 — özel adda `text-transform` yok | HEDEF |

## 8. Yayın kontrol listesi (Faz 5 ön koşulları)

REC-212 katalog paketi bitti · 7 ailenin EN adı dolu · GSC taban ölçümü alındı (karar 86) · linkinator + unlighthouse
yayın öncesi taraması · Recep ön izleme onayı (karar 68) · §7'deki HEDEF kapıların hepsi yeşil · eski adres
envanteri (eski → yeni, her satır) commit'li.
