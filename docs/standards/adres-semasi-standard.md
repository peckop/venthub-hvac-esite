# Adres Şeması Standardı (K3-b)

> **Durum:** v0.1 · 2026-09-23 · Şerit: URUN · **Uygulama öncesi cetvel** — şemanın kendisi REC-300 yayınıyla
> canlıya çıkar; bugün canlıda olan kısımlar "CANLI", yayını bekleyenler "HEDEF" diye işaretlidir.
> **Plan:** `docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md` (v5) · **Kararlar:** SEO ve Yayın K3-b, Katalog
> K17, 59, 68, 78b, 84, 86.
> **İlgili cetveller:** `canonical-url-standard.md` (kanonik = yönlendirmesiz tek adres) · `category-taxonomy-standard.md`
> · `rendering-cache-standard.md` · `vitrin-metni-standard.md` K10 (dil) · `barindirma-standard.md`.

## 0. Bu cetvel niçin var

Adres kuralları bugüne dek karar metinlerinde, Design dosyalarında ve plan sürümlerinde dağınık durdu. Plan beş kez
bağımsız çürütmeden geçti ve her tur, yazılı bir kural olmadığı için birinin "zaten öyle" sandığı bir şeyi ölçtü:
config yönlendirmesinin sorgu dizesini taşıyıp döngü yapması, bugün bile 4 sıçramalı bir eski adres zinciri, Türkçe
tarayıcının İngilizce sayfaya gönderilmesi. CLAUDE.md 1. kural: cetvel yoksa iş cetveli yazmayı da kapsar.

## 1. Şema (HEDEF)

| Nesne | TR | EN |
|---|---|---|
| Tüm ürünler | `/tr/urunler` | `/en/products` |
| Kök kategori | `/tr/kategori/<kök>` | `/en/category/<kök>` |
| Dal | `/tr/kategori/<kök>/<dal>` | `/en/category/<kök>/<dal>` |
| Aile (seri) | `/tr/urun/<aile>` | `/en/products/<aile>` |
| Model | `/tr/urun/<slug_tr>-p-<sku>` | `/en/products/<slug_en>-p-<sku>` |
| Marka | `/tr/markalar/<marka>` | `/en/brands/<marka>` |

**A1 — Model çözümü:** yol son `-p-`'den bölünür; sağ taraf SKU'dur (harf duyarsız), sol taraf serbest metindir ve
çözümde **okunmaz**. Bu yüzden: SKU `-p-` içeremez ve `p-` ile başlayamaz; aile ve kategori slug'ı `-p-` içeremez
(DB kısıtları: `products_sku_adres_ayirici_yok`, `product_families_slug_adres_ayirici_yok`,
`categories_slug_adres_ayirici_yok` — PR #1338).

**A2 — Adreste SKU küçük harftir.** Büyük harfli SKU → 308 küçüğe. Sol metin kanoniğe uymuyorsa → **308 kanoniğe**
(yol bazlı karar, önbelleğe güvenle girer; "200 + canonical" YASAK — her uydurma metin ayrı bir 200 sayfa olurdu).

**A3 — Slug metni:** ≤ 70 karakter · teknik değer yalnız `technical_specs`'ten (uydurma sayı yok) · EN slug'da
Türkçe harf yok · kategori slug'ı zenginleşmez (Design slug kuralı §6). Model slug'ları üreticiyle kurulur:
`docs/plans/rec300-model-adres-uret.py`; tip kelimeleri rakip taramasıyla seçilir (karar 78) ve dal başına
kararlarla sabitlenir (karar 84: korozyon dalı `korozyon-dayanimli-asit-fani`).

**A4 — Rezerve kelimeler:** Design v3 §4 listesi + `api`, `admin`, `_next`. Hiçbir kategori/aile/marka slug'ı
bunlarla kesişmez (HEDEF kapı INV-ADRES-CAKISMA-1).

## 2. Tek kanonik (CANLI ilke, REC-205)

**A5 — Bir sayfa hiçbir an iki adresten 200 dönmez.** 2026-09-07'de Google iki seviyeli dal adresimizi "kopya"
sayıp eledi; sebep iki adresin aynı anda 200 dönmesiydi. İki seviyeli dal adresi kanonik olduğunda tek seviyeli
adres **yalnız 308** verir — **TR'de de EN'de de**. Eski önek (`/tr/products/*`, `/tr/category/*`) yeni önek
açıldıktan sonra hiçbir girdide 200 dönmez.

## 3. Eski adresler — üç katman (HEDEF)

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
