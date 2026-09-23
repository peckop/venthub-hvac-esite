# Adres şeması (K3-b) + kategori ağacı (K17) + Casals — TEK YAYIN planı · v3

> **REC-191 → REC-300 · URUN · v1 2026-09-07 · v2 2026-09-22 · v3 2026-09-23**
> **Bu belge PLAN'dır. Kod YOK, migration YOK, prod yazımı YOK.** Uygulama REC-300 emriyle,
> REC-212 (katalog paketi) bittikten sonra ve **Recep ön izleme kapısından** geçerek koşar (karar 68).
> v2'nin bağımsız çürütmesi **BLOK** verdi (11 bulgu, §12); v3 o bulguların her birine bir tasarım
> cevabı verir (§12 tablosunun "v3 cevabı" sütunu) ve Recep'in 09-22/09-23 hükümlerini işler.

**KAYNAK/CETVEL:**
- **Emir:** REC-300 (kapsam 1–6, KAPILAR, EK 09-12 kabul ölçütü: linkinator + unlighthouse). Plan
  kaynağı REC-191. Yan kayıtlar: REC-331 (39 aile `seo_slug`), REC-270 (bulgu 5 döngü), REC-289
  (Edge'de DB), REC-373 (EN `html lang`), REC-374 (`src/data/brands.ts`).
- **Kararlar:** SEO ve Yayın **K3-b** (2026-09-11) · Katalog **K17 + K17 EK** · Vitrin 15A · karar
  **68** (tek yayın, REC-212 sonrası, ön izleme kapısı) · karar **78** (rakip terimleri; 78b iki yeni
  hava perdesi dalının slug'ı) · karar **84** (2026-09-23, korozyon dalı model adresi
  `korozyon-dayanimli-asit-fani`).
- **Recep hükümleri (plan yazımı sırasında):** 09-22 "aile adresi `/tr/urun/`'e **geçer**" (değişmez
  diyen K3-b cümlesi eski bilgi — R2 kapandı) · 09-22 ağaç = **bugünkü 18 dal slug'ı + K17'nin 4 yeni
  dalı** (R1 kapandı; Design'ın 26 dallık tablosu uygulanmaz) · 09-22 442 model adresini URUN üretir.
- Design-Menü teslimleri (2026-09-11, depoda): [adres şeması v3](rec300-design-adres-semasi-v3-2026-09-11.md)
  · [slug üretim kuralı](rec300-design-slug-uretim-kurali-2026-09-11.md) ·
  [kategori ağacı SQL hazırlığı](rec300-design-kategori-agaci-sql-2026-09-11.md).
- **Ek dosyalar (bu dal):** [442 model adresi](rec300-model-adres-listesi-2026-09-22.csv) ·
  [üretici](rec300-model-adres-uret.py) · [rakip taraması](rec300-rakip-slug-taramasi-2026-09-22.md).
- Cetveller: `canonical-url-standard.md` · `category-taxonomy-standard.md` (§4.1, §8, §9) ·
  `rendering-cache-standard.md` · `vitrin-metni-standard.md` (K10 dil kuralı) ·
  `docs/plans/slug-localization-2026-08-10.md`. **Adres şemasının cetveli YOK** →
  `docs/standards/adres-semasi-standard.md` bu işin kapsamında (Faz 0).
- **Ölçüm tazeliği:** canlı DB SELECT + canlı site, 2026-09-22 11:3x–11:5xZ (§3.1); model adres
  listesi 2026-09-23 06:5xZ taze veriyle yeniden üretildi.

**YÖNTEM:** şerit (URUN) · plan → **plan-challenger v3 turu** (zorunlu: adres = SEO, 308 geri
dönüşsüz) · her PR `diff-review` · migration'lı PR kural 13 · canlı doğrulama `qa` · REC-300 EK:
gstack zinciri yan yana, OPS ölçer.

---

## 1. Ne değişiyor — tek cümle

TR yüzeyde önekler Türkçeleşir (`/tr/kategori/`, `/tr/urun/`, `/tr/markalar/`, `/tr/urunler`), dal
adresi iki seviyeli olur, her model (442) kendi kanonik adresini alır (`/tr/urun/<slug>-p-<sku>`),
`?sku=` kalkar; aynı yayında ağaç 4 dal kazanır, 44 ürün dal değiştirir, 4 aile Casals'a geçer.
EN'de önek değişmez, **model adresleri EN'de de doğar** (EN bugün `EN_YAYIN=false`: noindex, site
haritası dışı — adresler yine üretilir, yayın EN açılınca görünür).

## 2. Hedef şema

| Nesne | TR | EN | Çözüm |
|---|---|---|---|
| Tüm ürünler | `/tr/urunler` | `/en/products` | — |
| Kök kategori | `/tr/kategori/<kök>` | `/en/category/<kök>` | slug çözücü (cetvel §4.1) |
| Dal | `/tr/kategori/<kök>/<dal>` | `/en/category/<kök>/<dal>` | **iki seviye kanonik** (§4 Faz 3 madde 1) |
| Aile (seri) | `/tr/urun/<aile-slug>` | `/en/products/<aile-slug>` | son `-p-` yok → aile; **slug metni bugünkü** (REC-331 açık, §8 R3) |
| **Model** | `/tr/urun/<slug_tr>-p-<sku>` | `/en/products/<slug_en>-p-<sku>` | son `-p-`'den böl; sağ = SKU (harf duyarsız), sol serbest |
| Marka | `/tr/markalar/<marka>` | `/en/brands/<marka>` | — |

Kurallar (Design slug kuralı): SKU adreste küçük harf; büyük harfli → 308 küçüğe · `-p-` slug metninde
geçemez · slug ≤ 70 karakter · teknik değer yalnız `technical_specs`'ten.

**⚠ REC-205 dersi:** 2026-09-07'de Google iki seviyeli dal adresimizi "kopya" sayıp eledi; sebep iki
adresin **aynı anda 200 dönmesi** ve iki seviyelinin zayıf (og:url/JSON-LD'siz, 2 satır kırıntı)
olmasıydı. v3'te iki seviyeli adres kanonik olur; **tek seviyeli adres yayın anında yalnız 308 verir,
hiçbir an iki adres birden 200 dönmez** (kapı: §6 INV-ADRES-TEK-KANONIK-1). og:url, JSON-LD ve 5
satırlı kırıntı iki seviyeli rotaya taşınır.

## 3. Bugünkü durum

### 3.1 Canlı ölçüm (2026-09-22) — v2'den aynen, iki güncellemeyle

| ölçüm | değer | nasıl |
|---|---|---|
| ürün (silinmemiş) | **442** (441 active, 1 archived) | DB |
| tekil `lower(sku)` | **442**; hepsi `^[A-Z0-9-]+$`, `-p-` yok | DB |
| ürün slug'ı dolu/tekil | 442/442; aile slug'ıyla çakışan 0 | DB |
| aile | **47**, hepsi ürünlü | DB |
| aktif kök / dal | **6 / 18** → hedef 6 / 22 (+Sığınak köke çıkarsa 7 / 21, §3.2 F6) | DB |
| `brands` | 5; **casals yok** | DB |
| site haritası | kategori 24 · ürün 48 · marka 7 | `sitemap.xml` |
| `/tr/kategori/…` `/tr/urun/…` `/tr/markalar/…` `/tr/urunler` | 404 | curl |
| `/tr/cart` · `/tr/checkout` | 200 — **dokunulmaz** (OPS RED 09-11, K1); yayın ölçümünde yine 200 olmalı | curl |
| elle adres kuran dosya | `/category/` 9 dosya 22 satır · `/products/` 9 · `/brands/` 2 (+ çürütmenin ekledikleri §12 #5) | grep |
| adres üreten DB fonksiyonu | 1: `get_search_suggestions` | `pg_proc` |
| **ürün slug'ı değişmiş ürün** (güncelleme 09-23) | **7** — 5 VRT-CA-IL RECT (09-09) + NIC-11921 (09-22) + **VRT-253490106XN (09-22, karar 75, 4kW→3kW)**; kaynak `admin_audit_log` | SELECT |
| `next.config` elle ürün yönlendirmesi | 6 (hedefi `?sku=`); **VRT-253490106XN'nin eski slug'ı için satır YOK** — bugün aile `?sku=`'ya düşüyor | dosya |

### 3.2 Design dosyalarıyla farklar — v2 §3.2 (F1–F8) geçerli; iki hüküm kapandı

- **F2 / R1 kapandı (Recep 09-22):** 26 dallık Design tablosu uygulanmaz; bugünkü 18 dal slug'ı kalır,
  K17'nin 4 yeni dalı eklenir, **yalnız korozyon dalının TR slug'ı** değişir (K17).
- **F6 Sığınak:** köke çıkıp çıkmadığı Design v3'te kategori, canlıda dal. R1 cevabı "bugünkü ağaç"
  olduğu için **Sığınak dal olarak kalır** (bu yayında köke çıkmaz; ayrı ağaç kararı olursa kendi
  308'iyle gelir).
- **78b:** iki yeni hava perdesi dalının TR slug'ı pazar kelimesini alır:
  `isiticisiz-hava-perdeleri` · `elektrikli-isiticili-hava-perdeleri` (EN: `ambient-air-curtains`,
  `electric-heated-air-curtains`). Dal henüz yok → 308 maliyeti 0.

### 3.3 Planın konusu olan ek kusurlar

- **REC-289 · Edge'de DB sorgusu** (`src/middleware.ts:123-156`): UUID yönlendirmesi sayfa katmanına
  taşınır; middleware'e yeni DB sorgusu eklenmez, mevcut olan kalkar.
- **Breadcrumb `İ`** (REC-300 madde 6): EN kırıntıda CSS `uppercase` + `lang="tr"` → `i`→`İ`. Bu
  yayında düzeltme: **özel ad alanlarına (`ad`, marka, seri, kategori adı) `text-transform` yasak**;
  kapı tüm bileşenleri tarar (§6). `<html lang>` kökten düzeltmesi **REC-373**'te (çürütme #10) —
  `text-transform` yasağı `lang`'dan bağımsız çalışır.
- **AVenS name_en** (REC-300 madde 6): EN adı boş aile **7**. EN model slug'ı ada dayanır → **Faz 2 ön
  koşulu** (KATALOG). Liste bugün boş EN adı için TR addan türetmiyor; EN adı gelince yeniden üretilir.
- **Dil düşüşü** (INV-DIL-DUSUSU-1, PR #1329): EN sayfada TR gövde metni kaldırıldı; yeni rotalar aynı
  `dildekiMetin` / `aileMetniniIndir` / `kategoriMetniniIndir` katmanından geçer.

## 4. Fazlar

Sıra kasıtlı ve **çürütme #3'ün cevabıdır**: (A) eski adresleri tanıyan kod → (B) veri → (C) yeni
adresin açılışı. Her adım tek başına canlıda güvenlidir; adım sırası ters dönerse bir sonraki adım
kırılmaz, yalnız bekler.

### Faz 0 — cetvel (kod yok)
`docs/standards/adres-semasi-standard.md`: §2 şeması · çözüm kuralı · rezerve kelimeler (Design v3 §4
+ `api`, `admin`, `_next`) · **hop bütçesi** (dil önekli adres ≤ 1 hop, dil öneksiz eski adres ≤ 2
hop: middleware 307 dil + 308 hedef) · "iki adres aynı anda 200 dönmez" ilkesi (REC-205) · yayın
kontrol listesi. Kanonik-URL cetveline çapraz bağlantı.

### Faz 1-A — takma ad tablosu + onu okuyan kod (migration + kod, canlıda görünmez)
Çürütme #3 ve #6'nın cevabı: yeniden adlandırma bir **veri olayıdır**, config satırı değil.
1. Migration: `url_takma_adlari(tenant_id, tur, dil, eski_slug, hedef_id, sebep, created_at)`;
   `unique(tenant_id, tur, dil, eski_slug)`; RLS salt okuma (anon SELECT, yazma yalnız servis rolü) ·
   `products`: `unique(tenant_id, lower(sku))` + `check (sku !~* '-p-')` · aile slug'ı için
   `check (slug !~ '-p-')`.
2. Tohum: bugün bilinen eski slug'lar — 7 ürün (`admin_audit_log`'dan, §3.1) + 4 Casals ailesinin eski
   slug'ı (Faz 1-B'de değişecek olanlar, **önceden** yazılır).
3. Tetik: `products.slug` / `product_families.slug` / `products.sku` değişince eski değer takma ad
   tablosuna yazılır (bir daha elle config satırı gerekmez; `admin_audit_log` zaten yazılıyor, kural 11).
4. Kod: ürün/aile çözücüsü "slug bulunamadı" dalında takma ad tablosuna bakar → 308 kanoniğe
   (bugünkü `/products/` rotasında; yeni rotalar Faz 3'te aynı çözücüyü kullanır).
Kapı: gölgede 4 senaryo (temiz · ikinci koşum · iki kiracı · slug güncellemesi tetiği yazıyor mu),
çıkış kodlarıyla (karar 45 kalıbı).

### Faz 1-B — ağaç + Casals verisi (migration, Recep merge, kural 13)
Faz 1-A canlıdayken iner; yeni slug'lar takma ad tablosu sayesinde eski adreste 308 alır.
1. `brands`'a Casals (`tenant_id` dahil) · **`products.brand` metin sütunu 53 üründe** "Casals"
   (çürütme #8).
2. +4 dal (plug-fans, cabinet-fans, ambient-air-curtains, electric-heated-air-curtains; TR slug'lar
   78b); `level` / `sort_order` komşudan ölçülerek.
3. 6 aile + 44 ürün taşıma — iki tablo birlikte (cetvel §8).
4. Korozyon dalı adı + `metadata.slug.tr` · `sub.spare-parts` translation_key · 4 Casals ailesi
   (`brand_id`, ad, slug `casals-…`).
5. `products.slug_i18n jsonb` (boş açılır) + `get_family_detail` onu döndürür + tip üretimi
   (`pnpm supabase:gen`) aynı PR'da (çürütme #6).
Migration kalıbı karar 45: plan bütünlüğü kapısı · kiracı tek satır · her hedef satırın eski değeri
doğrulanır · idempotent · gölgede 4 senaryo.
**⚠ Yeni dallar eski adres şemasıyla doğar** (çürütme #3): Faz 1-B → Faz 3-C arası 4 yeni dal
`/tr/category/<dal>` adresinde yayında olur. Kabul: bu dalların eski adresi de Faz 3-C'de 308 alır
(§5 satır 2, 22 dal).

### Faz 2 — model slug'ları (veri migration'ı, kural 13)
Kaynak: **URUN'un ürettiği liste** (bu dalda, 442 satır, Recep kabulü 09-22) — REC-212 paketi
`slug_tr`/`slug_en` taşırsa paket kazanır, liste doğrulayıcıyla karşılaştırılır. Doğrulayıcı (URUN):
uzunluk ≤ 70 · `-p-` yok · rezerve kelime yok · `(tenant, dil, slug)` tekil · teknik değer
`technical_specs`'te var · EN slug'da Türkçe harf yok · karar 84 (korozyon dalı 81/81) · 7 eski slug
takma adda. Ön koşul: 7 ailenin EN adı (§3.3). Yazım `slug_i18n`'e.
Bugünkü liste ölçümü (2026-09-23): 442/442 TR + EN tekil · en uzun 70/69 · 7 eski slug ·
KELIME>10 82 (Design'ın 10 kelime sınırı tip kelimesini kesmesin diye bilinçli sapma; listede notlu).

### Faz 3 — kod (bayrak = derleme sabiti, canlıda görünmez)
Çürütme #1, #2, #4, #5, #7, #9'un cevabı.

1. **Gerçek rotalar, rewrite YOK** (çürütme #1): `app/[lang]/kategori/[kok]/[[...dal]]`,
   `app/[lang]/urun/[slug]`, `app/[lang]/urunler`, `app/[lang]/markalar/[slug]` klasörleri **mevcut
   görünümleri** (`views/category/*`, `ProductDetailPageView`) çağırır — görünüm kodu kopyalanmaz.
   `lang !== 'tr'` → `notFound()` (EN bu rotaları kullanmaz). EN tarafında `category/[categorySlug]/
   [subCategorySlug]` **içerik üreten** rotaya çevrilir (bugün koşulsuz `permanentRedirect`). Tek seviyeli
   eski rota yalnız 308 verir. Döngü imkânsızdır çünkü hiçbir rota bir diğerine geri yönlendirmez; kapı
   yine ölçer (§6).
2. **Tek adres SSOT** `adresUret(nesne, dil)` (`src/utils/routes.ts` içinde): canonical, hreflang,
   og:url, JSON-LD, site haritası, kırıntı, kart bağlantısı hepsi buradan. Sayfaların kendi `/category/`
   birleştirmesi kalkar (çürütme #1'in ikinci yarısı: `[categorySlug]/page.tsx:129-131,194`).
3. **Model çözücü** (`productRoute.ts` genişler): son `-p-` → SKU (harf duyarsız) → model; SKU büyük
   harf → 308 küçüğe; `-p-` yok → aile; aile/ürün slug'ı bulunamazsa → **takma ad tablosu** → 308;
   yoksa 404; ağ hatası → "unavailable" (bugünkü ayrım korunur). **Slug metni yanlışsa 308 değil 200 +
   doğru canonical** (çürütme #2: sayfa `force-static`, istek başına karar verilemez; Google canonical'ı
   izler).
4. **`?sku=`** (çürütme #2): `next.config` `has: [{ type: 'query', key: 'sku' }]` kuralı →
   `/:lang/urun/:aile` ve `/en/products/:aile` için sku değeri → model adresi. SKU→slug eşlemesi derleme
   anında 442 satırlık üretilmiş dosyadan (`src/data/generated/model-adresleri.json`, Faz 2 verisinden
   betikle); veri değişince yeniden üretim kapısı (§6 INV-ADRES-TAZELIK-1). Eski ürün slug'ı
   (`/tr/products/<ürün-slug>`) aile desen kuralından **önce** ayrı kuralla ele alınır → tek hop.
5. **Dilsiz eski adresler** (çürütme #9): dil eklemesi middleware'in 307'sinde kalır, config hedefi
   `/tr/`'ye sabitlenmez. Bütçe ≤ 2 hop (Faz 0).
6. **UUID yönlendirmesi** middleware'den sayfa çözücüsüne (REC-289).
7. **Yüzeyler** (çürütme #5): v2 listesi + `LanguageSwitcher` (bugün ilk segmenti değiştiriyor →
   `/tr/kategori/` ↔ `/en/category/` eşlemesi gerekir) · `ClientLayout.tsx:77` ·
   `MobilAltSekmeCubugu.tsx:128` · `Seo.tsx:52` · PDP'nin `?sku=` yazıcısı (varyant seçimi artık model
   adresine gider) · `public/llms.txt` · `ApplicationSolutions.tsx` 49/55 · `SearchOverlay.tsx` 373-374.
   Mevcut `localized-route-ssot` + `canonical-url-ssot` kapıları genişler; evrene `public/` girer.
8. **Arama** (çürütme #7): `get_search_suggestions` adres **üretmez**; `sku`, `slug_i18n`,
   `family_slug`, `tur` döndürür, adresi istemci `adresUret` ile kurar → migration (kural 13); imza
   değişimi, eski istemciyle uyum için geçiş: yeni kolonlar **eklenir**, eski `url` kolonu Faz 3-C'ye
   kadar kalır.
9. **Webhook tazeleme** (çürütme #4): iç yollar (`/[lang]/category/…`, `/[lang]/products/…`) korunur,
   yeni rotalar için dal eklenir; **442 model yolu tek tek değil etiketle** (`revalidateTag('product-
   <sku>')` + `lang` + `tenantId`, kural 12); `revalidatePath`'in yeni rotada çalıştığı `next start`
   üstünde ölçülür (çürütme "ölçülmeyen" satırı).
10. **Site haritası** tip başına ayrılır + 442 model; hreflang TR↔EN; `x-default`. EN kısmı
    `EN_YAYIN` sabitine bağlı kalır.
11. **Product JSON-LD** fiyatsız (K1): `sku`, `brand`, `additionalProperty[]`.
12. **Sözlük** (REC-300 terminoloji 09-11): ekranda "alt kategori" ve "seri"; yeni anahtarlar TR/EN
    parite + keycheck.
13. **Bayrak** (çürütme #3): `ADRES_SEMASI_K3B` derleme sabiti (`src/config/features.ts`, mevcut
    `EN_YAYIN` kalıbı). Kapalıyken yeni rotalar 404, eski adresler bugünkü gibi; açıkken eski adresler
    308. Çalışma zamanı bayrağı değildir — açma = sabit değişikliği + deploy.

### Faz 3-C — adres açılışı (tek PR: bayrak `true` + §5 config satırları)
Önceki fazların hepsi canlıdayken iner. Tek geri dönüşsüz adım budur.

### Faz 4 — Recep ön izleme kapısı (karar 68 şartı)
Vercel önizlemesi (Faz 3-C dalı) ya da yerel üretim paketi. Recep'e **gezinme listesi**: menü → her kök
kategori → 4 yeni dal (iki perde dalı pazar adıyla) → bir Casals ailesi → bir korozyon dalı modeli
(adreste "asit-fani") → bir model sayfası TR + EN → eski adres örnekleri (tek seviyeli dal, iki
seviyeli eski dal, aile, `?sku=`, eski ürün slug'ı, 09-22'de değişen VRT-253490106XN'nin eski adresi,
büyük harfli SKU) yeni adrese tek sıçramada gidiyor mu → arama önerisinden bir ürüne tık → EN kırıntıda
`İ` yok → `/tr/cart` 200. **Recep "gördüm, tamam" demeden Faz 3-C merge edilmez.**

### Faz 5 — yayın
Faz 3-C merge → Vercel deploy → yayın ölçümü (§6 son madde) → site haritası GSC'ye + IndexNow (K4) →
iki hafta izleme (§7).

## 5. Yönlendirme tablosu

| # | eski (canlı) | yeni | adet | nerede |
|---|---|---|---|---|
| 1 | `/tr/category/<kök>` | `/tr/kategori/<kök>` | 6 | config |
| 2 | `/tr/category/<dal>` (tek seviye, bugün kanonik) | `/tr/kategori/<kök>/<dal>` | 22 (18 + 4 yeni dalın Faz 1-B–3-C arası adresi) | config (statik eşleme) |
| 3 | `/tr/category/<kök>/<dal>` | `/tr/kategori/<kök>/<dal>` | 18 | config — hedef doğrudan, zincir yok |
| 4 | `/tr/category/korozyon-…` eski TR slug | yeni korozyon adresi | 1 | config |
| 5 | `/tr/products` | `/tr/urunler` | 1 | config |
| 6 | `/tr/products/<aile>` | `/tr/urun/<aile>` | 47 | config (desen; #7'den SONRA) |
| 7 | `/(tr\|en)/products/<ürün-slug>` (442 × 2) | model kanoniği | 884 | config, üretilmiş dosyadan (Vercel sınırı §11) — ya da çözücü |
| 8 | `?sku=` (TR + EN aile) | model kanoniği | 442 × 2 | config `has: query` |
| 9 | 4 Casals ailesinin eski slug'ı | `casals-…` | 4 × 2 dil | **takma ad tablosu** (Faz 1-A) |
| 10 | 7 ürünün eski slug'ı | model kanoniği | 7 × 2 dil | **takma ad tablosu** |
| 11 | `/tr/brands/*` | `/tr/markalar/*` | desen | config |
| 12 | `next.config` 6 elle kural | doğrudan `-p-<sku>` | 6 | config (hedef yeniden yazılır) |
| — | `/tr/cart` · `/tr/checkout` | dokunulmaz | 0 | — |

REC-300 "442 + 33 + 4" sayısıyla fark: kategori tarafı 6 + 22 + 18 + 1 = **47** (33 Design'ın 7+26
ağacıydı, R1 ile düştü); model tarafı TR+EN **884** + `?sku=` 884 (EN_YAYIN kapalı olsa da EN adresler
308 alır, dış bağlantı olabilir). Tam eşleme dosyası (eski → yeni, her satır) Faz 3-C PR'ında
commit'lenir ve kapı testi onu okur.

## 6. Kapılar (uygulamayla birlikte yazılır)

- **INV-ADRES-SEMASI-1:** her iç bağlantı `adresUret`/`Routes`'tan; `'/category/'`, `'/products/'`,
  `'/brands/'` dizesi SSOT dışında 0 (evren: `src/**`, `supabase/functions/**`, `public/**`; test hariç).
- **INV-ADRES-CAKISMA-1:** slug'lar rezerve kelimeyle kesişmez; aile slug'ında `-p-` yok; `(tenant,
  dil, slug)` tekil. Rota listesi dosya sisteminden türetilir.
- **INV-ADRES-COZUCU-1:** çözücünün 10 dalı birim testte (model · büyük harf · yanlış slug metni →
  200 + canonical · yanlış dil · aile · eski ürün slug · takma ad · UUID · yok → 404 · ağ hatası →
  unavailable).
- **INV-ADRES-TEK-KANONIK-1** (REC-205): bayrak açıkken her dal için tek seviyeli adres 308, iki
  seviyeli 200; hiçbir dal iki adresten 200 dönmez. `next start` üstünde.
- **INV-ADRES-TAZELIK-1:** `model-adresleri.json` DB'deki `slug_i18n` + sku ile birebir (CI'da
  tip-drift kalıbı).
- **INV-OZEL-AD-BUYUK-HARF-1** (REC-300 madde 6): özel ad taşıyan elemanlarda `uppercase`/
  `text-transform` sınıfı yok; evren tüm bileşenler.
- **Yayın ölçüm betiği** (`docs/audits/rec300-*`): site haritasındaki her adres 200 · §5 eşleme
  dosyasının her satırı **tek hop** ve doğru hedef · `/tr/cart` + `/tr/checkout` 200 · redirect döngüsü
  yok. **REC-300 EK kabul ölçütü:** yayın öncesi ve sonrası **linkinator** (kırık 0, zincir 0) +
  **unlighthouse** (SEO ortalaması düşmez) fark tablosu, OPS yan yana ölçer.
- `pnpm build` (prerender) + **tam birim takımı** + keycheck + Playwright smoke (kategori → dal → aile
  → model; TR + EN) + INV-DIL-DUSUSU-1 e2e yeni rotalarda da.

## 7. Yayın sonrası (iki hafta)

GSC kapsam raporunda "bulunamadı" birikimi 0 · eski adres örneklemi tek hop · trafik geçici düşebilir,
kalıcı düşüş beklenmez. Asıl risk 24 kategori + 47 aile adresinde (model adresleri bugün site
haritasında yok).

## 8. Recep'e gidecek karar (tek başına, numarası OPS'tan)

- ~~R1 ağaç~~ **kapandı** (09-22: bugünkü 18 + 4). ~~R2 aile adresi~~ **kapandı** (09-22: `/tr/urun/`'e
  geçer).
- **R3 · REC-331 — 39 ailenin adres metni de değişsin mi?** Design'ın `seo_slug`'ı 47 ailenin 39'unda
  bugünkü slug'dan farklı (marka iki kez: `vortice-vortice-bravo-s`; ad yerine dizin adı:
  `vortice-vort-heatmaster-slimroof-smoke`). Önek bu yayında zaten değişiyor; metin de değişecekse
  **aynı yayında** değişmeli, yoksa aileler ikinci kez taşınır. Karar öncesi ölçüm (REC-331): 39
  adresin son 28 gün GSC tıklaması. Plan iki cevaba da hazır: evet → Faz 1-B'ye 39 aile slug'ı +
  takma ad; hayır → `seo_slug` öneri kalır. **Bu karar Faz 1-B migration'ı yazılmadan alınmalı.**

## 9. Kapsam dışı ve yan bulgular

- Nitelik/faset katmanı (REC-95).
- `src/data/brands.ts` DB ile uyumsuz → **REC-374**.
- EN `<html lang>` kökten → **REC-373** (bu yayında `text-transform` yasağı `İ`'yi zaten keser).
- Breadcrumb JSON-LD hidrasyon uyarısı, `assertNoUuid` geliştirme 500'ü — ayrı.
- Sığınak'ın köke çıkması (F6) — ayrı ağaç kararı.
- Belge bölümü (REC-145) — REC-300 kapsamı dışı.
- Katalog veri şüpheleri (79 üründe ad/teknik voltaj farkı, 10 üründe kW) → KATALOG'a iletildi; model
  adresinde ayırt edici değer **üründeki ad** önceliklidir (liste üreticisi yorumu).

## 10. Geri alma

İleri düzeltme esastır: eşleme dosyası commit'li; yanlış satır düzeltilir. Faz 3-C geri alınırsa
(bayrak `false` + config satırları kaldırılır) yeni adresler 404 olur — dizine girmişse kayıp;
bu yüzden **geri alma yalnız kitlesel hata hâlinde, Recep kararıyla**. Faz 1-A/1-B/2/3 tek başına geri
alınabilir (canlı adresi değiştirmezler).

## 11. Neyi ölçmedim

- GSC dizin durumu (R3 ölçümüyle birlikte yapılacak).
- Vercel `redirects` sayı sınırı: §5 satır 7 + 8 config'e girerse ~1800 satır. **Faz 3 başında belgeden
  ölçülür**; sınır aşılıyorsa satır 7 çözücüye (sayfa katmanı) döner, satır 8 `has: query` tek desen
  kuralıyla kalır (442 satır değil, eşleme dosyasından middleware'siz çözüm: aile sayfası sku'yu okuyamaz
  — bu yüzden **ölçüm Faz 3 öncesi zorunlu**).
- `revalidatePath`'in yeni gerçek rotalarda davranışı.
- `supabase-migrate` Action ile Vercel build'in gerçek sırası (Faz 1-A/1-B sıralı olduğu için tasarım
  bu sıraya bağlı değil).

---

## 12. Bağımsız çürütme v2 (plan-challenger, 2026-09-22) — **BLOK** → v3 cevapları

| # | bulgu | derece | v3 cevabı |
|---|---|---|---|
| 1 | rewrite + tek seviyeli koşulsuz `permanentRedirect` → sonsuz 308; sayfalar canonical'ı kendi kuruyor | KRİTİK | Faz 3 m.1–2: gerçek rotalar, rewrite yok; `adresUret` SSOT; INV-ADRES-TEK-KANONIK-1 + döngü ölçümü |
| 2 | `?sku=` `force-static` sayfada 308'lenemez; aile desen kuralı eski ürün slug'ını 2 hop yapıyor | KRİTİK | Faz 3 m.3–4: `has: query sku` config; yanlış slug metni 200 + canonical; eski ürün slug'ı ayrı kural, desenden önce |
| 3 | yayın atomik değil; Casals slug'ı iki sırada da kırılır; bayrak yok | KRİTİK | Faz 1-A takma ad tablosu + tetik → 1-B veri → 3-C açılış; bayrak = derleme sabiti |
| 4 | webhook ISR yolları + 884 model tazeleme dalı yok | YÜKSEK | Faz 3 m.9: iç yollar korunur, model etiketle; `next start` ölçümü |
| 5 | yüzey sayımı eksik | YÜKSEK | Faz 3 m.7 genişletilmiş liste + kapı evrenine `public/` |
| 6 | `slug_i18n` fonksiyon/tip/tekillik; `lower(sku)` ve `-p-` DB'de korunmuyor; SKU düzelince eski adres 404 | YÜKSEK | Faz 1-A m.1 kısıtlar + tetik (sku değişimi takma ada); Faz 1-B m.5 |
| 7 | arama fonksiyonu dil almıyor | YÜKSEK | Faz 3 m.8: fonksiyon adres değil kimlik döndürür |
| 8 | `products.brand` metni 53 üründe | ORTA | Faz 1-B m.1 |
| 9 | dilsiz eski kural hedefi `/tr/`'ye sabit | ORTA | Faz 3 m.5: middleware 307'de kalır, bütçe ≤ 2 hop |
| 10 | `<html lang>` tek satır değil | ORTA | REC-373 (ayrı); `İ` bu yayında `text-transform` yasağıyla |
| 11 | K3-b çelişkisi (aile adresi); `/tr/markalar/` yalnız Design'da; EN_YAYIN kapalı | YÜKSEK | R2 kapandı (Recep 09-22); markalar Design v3 + REC-300 kapsamıyla; EN adresleri üretilir, yayın EN_YAYIN'a bağlı |

**v3 için yeni çürütme turu zorunludur** (özellikle Faz 1-A takma ad tasarımı, Faz 3 m.4 `has: query`
+ Vercel sınırı, gerçek rota + `[lang]` çakışması).

*Yazan: URUN şeridi, v3 2026-09-23.*
