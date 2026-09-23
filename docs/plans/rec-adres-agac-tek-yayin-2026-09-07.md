# Adres şeması (K3-b) + kategori ağacı (K17) + Casals — TEK YAYIN planı · v5

> **REC-191 → REC-300 · URUN · v1 2026-09-07 · v2 2026-09-22 · v3/v4 2026-09-23**
> **Bu belge PLAN'dır. Kod YOK, migration YOK, prod yazımı YOK.** Uygulama REC-300 emriyle,
> REC-212 (katalog paketi) bittikten sonra ve **Recep ön izleme kapısından** geçerek koşar (karar 68).
> v2 çürütmesi BLOK (11 bulgu, §13) → v3 → v3 çürütmesi BLOK (3 KRİTİK, 4 YÜKSEK, 7 ORTA, 4 DÜŞÜK;
> §12) → **v4**: eski adres çözümü config satırlarından **tek bir eski-adres haritasına** taşındı
> (barındırma sağlayıcısının yönlendirme sınırına dayanmaz — karar 59).

**KAYNAK/CETVEL:**
- **Emir:** REC-300 (kapsam 1–6, KAPILAR, EK 09-12 linkinator + unlighthouse). Plan kaynağı
  REC-191. Yan kayıtlar: REC-331 (39 aile, karar 86), REC-270, REC-289, REC-373, REC-374, REC-367
  (barındırma, karar 59).
- **Kararlar:** SEO ve Yayın **K3-b** · Katalog **K17 + EK** · Vitrin 15A · karar **59** (barındırma
  ERTELENDİ; sıra 1 Cloudflare Workers + OpenNext, 2 DigitalOcean, 3 Vercel Pro; tetik: ödeme/fiyat
  canlıya açılmadan önce ya da kota dağıtımı durdurursa) · karar **60** (dağıtım depolaması temizliği) ·
  **68** (tek yayın, REC-212 sonrası, ön izleme) · **78b** (iki perde dalı pazar kelimesi) · **84**
  (korozyon dalı model adresi `korozyon-dayanimli-asit-fani`) · **86** (2026-09-23: 39 aile adres
  metni Design `seo_slug`'ına geçer; istisna Casals 4 aile K17 + 2 perde ailesi 78b; yayından önce
  GSC taban ölçümü).
- **Recep hükümleri (09-22):** aile adresi `/tr/urun/`'e geçer (R2 kapandı) · ağaç = bugünkü 18 dal +
  K17'nin 4 dalı (R1 kapandı) · 442 model adresini URUN üretir.
- Design-Menü teslimleri (depoda): [adres şeması v3](rec300-design-adres-semasi-v3-2026-09-11.md) ·
  [slug kuralı](rec300-design-slug-uretim-kurali-2026-09-11.md) ·
  [ağaç SQL hazırlığı](rec300-design-kategori-agaci-sql-2026-09-11.md).
- **Ek dosyalar:** [442 model adresi](rec300-model-adres-listesi-2026-09-22.csv) ·
  [üretici](rec300-model-adres-uret.py) · [rakip taraması](rec300-rakip-slug-taramasi-2026-09-22.md).
- Cetveller: `canonical-url-standard.md` · `category-taxonomy-standard.md` · `rendering-cache-standard.md`
  · `vitrin-metni-standard.md` (K10) · `barindirma-standard.md` (taslak, PR #1306) ·
  `slug-localization-2026-08-10.md`. **Adres şeması cetveli YOK** → Faz 0.
- **Ölçüm tazeliği:** canlı DB SELECT + canlı site 2026-09-22/23; çürütme ölçümleri 2026-09-23 (§12).

**YÖNTEM:** şerit (URUN) · plan → plan-challenger (**v4 turu zorunlu**) · her PR `diff-review` ·
migration'lı PR kural 13 · canlı doğrulama `qa` · REC-300 EK: gstack zinciri yan yana, OPS ölçer.

---

## 1. Ne değişiyor — tek cümle

TR önekleri Türkçeleşir (`/tr/kategori/`, `/tr/urun/`, `/tr/markalar/`, `/tr/urunler`), dal adresi iki
seviyeli olur, her model (442) kendi kanonik adresini alır (`…-p-<sku>`), `?sku=` kalkar, 39 aile adres
metni düzelir (karar 86); aynı yayında ağaç 4 dal kazanır, 44 ürün dal değiştirir, 4 aile Casals'a
geçer. EN'de önek değişmez; model adresleri ve iki seviyeli dal EN'de de doğar (EN bugün `EN_YAYIN=
false`: noindex — adresler yine doğru kurulur).

## 2. Hedef şema

| Nesne | TR | EN | Çözüm |
|---|---|---|---|
| Tüm ürünler | `/tr/urunler` | `/en/products` | — |
| Kök | `/tr/kategori/<kök>` | `/en/category/<kök>` | slug çözücü |
| Dal | `/tr/kategori/<kök>/<dal>` | `/en/category/<kök>/<dal>` | iki seviye kanonik, **iki dilde** |
| Aile | `/tr/urun/<aile>` | `/en/products/<aile>` | son `-p-` yok → aile |
| **Model** | `/tr/urun/<slug_tr>-p-<sku>` | `/en/products/<slug_en>-p-<sku>` | son `-p-`'den böl, SKU harf duyarsız |
| Marka | `/tr/markalar/<marka>` | `/en/brands/<marka>` | — |

Kurallar: SKU adreste küçük harf · `-p-` slug metninde geçemez · SKU `P-` ile başlayamaz (D1) · slug
≤ 70 · teknik değer yalnız `technical_specs`'ten · **slug metni yanlışsa 308 doğru slug'a** (O1; yol
bazlı karar, ISR'da güvenle önbelleklenir — bugün `products/[slug]/page.tsx:183` aynısını yapıyor).

**REC-205 dersi, iki dilde:** iki seviyeli adres kanonik olur; tek seviyeli adres **TR'de de EN'de de**
yalnız 308 verir; hiçbir an bir dal iki adresten 200 dönmez (INV-ADRES-TEK-KANONIK-1, dil = tr ve en).

## 3. Bugünkü durum

### 3.1 Canlı ölçüm

| ölçüm | değer | kaynak |
|---|---|---|
| ürün | 442 (441 active); SKU'nun **442'si büyük harfli** (`^[A-Z0-9-]+$` kısıtı) | DB |
| aile / aktif kök / aktif dal | 47 / 6 / 18 (+7 pasif satır) | DB |
| kategorilerde `metadata.slug.tr ≠ slug` | **24/24** (TR adreste EN slug'lı eski adresler de canlı: `/tr/category/fans` → 308) | DB + curl |
| `brands` | 5; casals yok; `products.brand` 53 üründe "AVenS" | DB |
| slug'ı değişmiş ürün (`admin_audit_log`) | 7; **aile tablosu için iz 2026-09-17'den başlıyor** (öncesi bilinmiyor, O6) | DB |
| `next.config` | 13 dilsiz eski kategori kuralı (`/category/<tr>/:path*` → `/category/<en>/:path*`) + 6 ürün kuralı; **bugün 4 hop'luk zincir var**: `/category/fanlar` → `/category/fans/` → `/category/fans` → 307 `/tr/category/fans` → 308 `/tr/category/fanlar` | dosya + curl (K3) |
| admin slug düzenlemesi | `authenticated` rol (`prod_admin_update_opt`, `product_families_admin_write`) | `pg_policies` |
| webhook tazeleme | `familyTag` tüketen `unstable_cache` YOK (no-op, `route.ts:416-420`); `old_record.slug` ve `subcategory_id` kullanılmıyor; IndexNow listesi `revalidatedPaths`'ten | kod (Y3, O5) |
| `/tr/cart` · `/tr/checkout` | 200 — **dokunulmaz** (K1) | curl |

### 3.2 Design farkları
v2 §3.2 F1–F8 geçerli. **R1 kapandı** (bugünkü 18 + 4, Sığınak dal kalır). **78b:** perde dalları
`isiticisiz-hava-perdeleri` · `elektrikli-isiticili-hava-perdeleri`. **Karar 86:** 39 aile `seo_slug`
(tablo: OPS'a 2026-09-23 iletilen liste); 4 Casals ailesi `casals-…` (K17); 2 perde ailesinin
`seo_slug`'ı 78b kelimesiyle düzeltilir (`…-elektrikli-isiticili-hava-perdeleri`,
`…-isiticisiz-hava-perdeleri`).

### 3.3 Ek kusurlar
REC-289 (Edge'de DB) · breadcrumb `İ` (özel ad alanlarında `text-transform` yasağı; `lang` kökü
REC-373) · 7 ailenin EN adı boş (Faz 2 ön koşulu, KATALOG) · dil düşüşü (PR #1329; yeni rotalar aynı
katmandan geçer).

## 4. Mimari karar: eski adresler NEREDE çözülür (v3 K1–K3'ün cevabı)

v3 eski adresleri `next.config` satırlarına yazıyordu. Çürütme üç şey ölçtü: (K1) `has: query sku`
kuralı query'yi hedefe taşır ve kendi hedefinde yeniden eşleşir → döngü; (K2) 884 + 884 satır Vercel'in
**2048 rota** sınırına dayanır, tek desen kuralı ise büyük harfli SKU yüzünden 2 hop yapar; (K3) dilsiz
eski kurallar bugün 4 hop. Ayrıca karar 59 barındırmayı Cloudflare'e taşıyacak — sağlayıcıya özgü bir
sınıra yaslanan tasarım iki kez yazılır.

**v4 kararı — üç katman, her katmanın tek işi:**

| katman | ne çözer | niçin orada |
|---|---|---|
| **1. Eski-adres haritası** (`src/data/generated/eski-adres-haritasi.json`, derleme anında **iki kaynaktan** üretilir: (a) DB, (b) commit'li **eski adres tohum dosyası** `src/data/eski-adres-tohum.json` — DB'de hiç olmamış eski adresler, bkz. §4.1; kiracı anahtarlı) — **middleware** okur | bugün var olan her eski adres: kategori (TR/EN slug'lı, tek/iki seviye), aile (eski slug + karar 86 + Casals), ürün slug'ı, `?sku=`, dilsiz eski adresler | istek başına **tek sözlük araması**, DB sorgusu YOK (kural 12, REC-289 uyumlu); hedef query'siz kurulur → döngü yok (K1); satır sınırı yok (K2); dilsiz adreste dil tespiti + hedef aynı adımda → **tek 307** (K3); Vercel'de de Cloudflare/OpenNext'te de aynı çalışır (karar 59) |
| **2. Takma ad tablosu** (`url_takma_adlari`, DB) — **sayfa** okur | derlemeden SONRA değişen slug'lar (admin düzenlemesi, katalog düzeltmesi) | harita bir sonraki derlemeye kadar bayattır; sayfa "bulunamadı" dalında tabloya bakar → 308 (`dynamicParams` true: istek anında render, sonuç önbelleğe) |
| **3. `next.config`** | yalnız kalıcı, veriden bağımsız desenler: `/tr/brands/*` → `/tr/markalar/*` · `/tr/products` → `/tr/urunler` (**birebir**, `:path*` YOK — joker olursa bütün eski ürün adreslerini middleware'den önce yakalar, D3) · `destek/hesaplayicilar` | birkaç satır; **25 satır silinir** (haritaya taşınır): 13 dilsiz kategori + 6 Lineo çap + 6 ürün kuralı |

**Hazır araç ölçüldü — Vercel Bulk Redirects KULLANILMAZ** (v3 çürütmesi, belge: vercel.com/docs/routing/
redirects/bulk-redirects): (a) *"`source` … does not support query parameters. Vercel ignores any
query parameters"* → `?sku=` (442 × 2) bununla çözülemez; (b) *"not available on the Hobby plan"* —
bugün Hobby'deyiz; (c) karar 59 barındırma sırasını koydu (1 Cloudflare Workers + OpenNext, 2
DigitalOcean, 3 Vercel Pro) → Vercel'e özgü proje ayarı birinci adaya taşınmaz, göçte ikinci kez yazılır. Harita bu üç sınırın hiçbirine takılmaz.

Sıra kuralı: `next.config` redirect'leri middleware'den önce koşar → config'de eski ürün/aile/kategori
deseni **kalmaz**, yoksa harita hiç çalışmaz (v3'ün 2 hop'u buradan doğuyordu).

**Harita boyutu (v4 çürütmesi O5):** bugün geçerli sınır **Vercel Edge middleware kodu gzip sonrası
Hobby 1 MB** (Pro 2 MB); bugünkü middleware 103 kB. Harita **yapısal** tutulur (kartezyen tam adres değil:
`sku → {slug_tr, slug_en}`, `eskiSlug → hedef kimliği`; önek ve dil kodda birleşir) → tahmin ≈ 100 kB
gzip. Faz 3 kapısı gzip sonrası boyutu **1 MB'a karşı** ölçer. Kaçış yolu yok: Node middleware'e geçmek
Vercel'de sınırı kaldırır ama OpenNext/Cloudflare Node middleware'i desteklemiyor (karar 59) → middleware
Edge'de kalır. Cloudflare'de Workers **Paid** (10 MiB) gerekir; Free 3 MiB zaten bugün dolu (REC-367).
Kiracı başına harita tek pakette — çok kiracı açılınca yeniden tasarlanır (cetvele not).

**Taşınabilirlik (karar 59):** Cloudflare Workers + OpenNext'te koşullu aynen çalışır — Edge middleware
destekli, JSON import standart, `cookies`/`headers` dışında Node API yok. Koşul: OpenNext'in önbellek
yakalamasının middleware'den SONRA koştuğu göç sırasında ölçülür. Vercel'de middleware önbellekten önce
koşar (belge: "runs globally before the cache") → `?sku=` statik aile sayfasının önünde yakalanır.

### 4.1 Harita üretimi, bayatlık ve dil (v4 çürütmesi Y1, Y2, Y3, O1, O3)

- **Tohum dosyası (Y1):** DB'de hiç var olmamış ama bugün yönlendirilen eski adresler: 13 dilsiz kategori
  kuralının kaynakları (7'si DB'de hiç yok) + 6 Lineo çap adresi (aile izi 09-17'de başlıyor, Lineo 08-23'te
  kapandı). **Bugün 404'e giden 4 hedef** (`heat-recovery-units`, `air-purifiers`, `flexible-air-ducts`,
  `industrial-ventilation`) için hedef tohumda **en yakın canlı kategoriye** yazılır (ısı geri kazanım →
  `heat-recovery-vmc` kökü; diğer üçü karşılığı olmayan eski kök → `/tr/urunler`), 404 zinciri biter.
- **Derleme fail-closed (Y2):** üretici DB'ye ulaşamazsa ya da ürün sayısı bir önceki haritanın %90'ının
  altındaysa **derleme düşer** — boş haritayla yayın yok (bugünkü `generateStaticParams` gibi `console.warn`
  ile yutulmaz). CI'da DB yok (`build:ci` → `dummy.supabase.co`) → CI commit'li **fikstür** haritayla koşar;
  DB ile birebirlik **zamanlanmış iş** olarak prod DB'ye karşı ölçülür (INV-ADRES-HARITA-1'in DB kolu).
  Çelişki giderildi: **harita commit'lenmez** (derleme çıktısı); **envanter dosyası** (§6, eski → yeni tam
  liste) commit'lenir ve kapı onu okur.
- **Dil (Y3, ölçüldü):** bugünkü `detectLocale` `accept-language` içinde `en` geçiyor mu diye bakıyor;
  Türkçe Chrome'un varsayılanı `tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7` → Türkçe ziyaretçi `/category/fans`'ta
  EN (noindex) sayfaya düşüyor. v5: **slug'ı Türkçe olan dilsiz eski adres deterministik TR'ye 308**
  (içerik zaten Türkçe); slug'ı dilden bağımsız olanlarda `detectLocale` **birincil dili / q değerini**
  esas alır. Bu düzeltme bugünkü davranışı da onarır (ayrı kusur, aynı PR).
- **Joker ve eğik çizgi (O3):** eşleyici birebir anahtar değil **segment öneki** eşler (`/category/fanlar/<x>`
  dahil); sondaki `/` önce normalize edilir (bugün `/tr/category/fans/` 2 hop).
- **Bayat harita (O1):** derlemeden sonra değişen slug'da zincir en çok **2 hop** (harita → eski hedef → sayfa
  308) — cetvele yazılır. Slug değişince tazeleme: webhook dalı Vercel **deploy hook**'unu tetikler (gün
  içinde ≤ 1 yeniden derleme, sıraya alınır) + gecelik derleme yedeği.

## 5. Fazlar

Sıra (çürütme #3): **(A) eski adresleri tanıyan kod → (B) veri → (C) yeni adresin açılışı.**

### Faz 0 — cetvel
`adres-semasi-standard.md`: §2 şeması · §4 üç katman ve sıra kuralı · rezerve kelimeler (+`api`,
`admin`, `_next`) · **hop bütçesi: dil önekli eski adres 1 hop (308), dilsiz eski adres 1 hop (307)** ·
"iki adres aynı anda 200 dönmez" (iki dil) · slug metni yanlış → 308 · dilsiz **yeni** adreste EN
ziyaretçi davranışı (D3: `/kategori/x` → `/en/…` karşılığına, `/en/kategori` 404'e değil) · yayın
kontrol listesi.

### Faz 1-A — takma ad tablosu + onu okuyan kod (migration, kural 13; canlıda görünmez)
1. `url_takma_adlari(tenant_id, tur, dil, eski_slug, hedef_id, sebep, created_at)`,
   `unique(tenant_id, tur, dil, eski_slug)`. **RLS okuma `tenant_id = jwt_tenant_id()`** (mevcut
   kalıp, O4); yazma yalnız tetik.
2. **Tetik fonksiyonu `SECURITY DEFINER` + `SET search_path`** (Y1; emsal `denetim_izi_yaz`) —
   admin `authenticated` rolle slug düzenler, invoker yetkisi RLS'e takılıp UPDATE'i geri alırdı.
   `INSERT … ON CONFLICT (tenant_id, tur, dil, eski_slug) DO UPDATE SET hedef_id, created_at` (Y2:
   A→B→A→B); yeni slug bir takma adla çakışırsa o takma ad **silinir** (canlı slug önceliklidir).
   İzlenen: `products.slug`, `products.sku`, `product_families.slug`, **`categories.slug` +
   `metadata.slug`** (O4: kategori yeniden adlandırması da elle config istemesin).
3. Kısıtlar: `check (sku !~* '(^p-|-p-)')` (D1) · aile ve kategori slug'ında `-p-` yok · tekillik:
   bugünkü küresel `UNIQUE(sku)` ve `uq_products_slug_lower` **kalır** (tek kiracı, kural 12 PARK
   notu); `(tenant_id, …)` sürümü çok kiracılı yapı açılınca — cetvele yazılır (D2).
4. Tohum: 7 ürün (audit) + 4 Casals ailesi + 39 aile (karar 86) **önceden**; evren ayrıca geçmiş site
   haritası dökümleri ve GSC sayfa listesiyle birleştirilir (O6: aile izi 09-17'de başlıyor).
5. Kod: ürün/aile/kategori çözücüsü "bulunamadı" dalında tabloya bakar → 308; kiracı sorguda açıkça
   süzülür.
Gölgede senaryolar (çıkış kodlarıyla): temiz · ikinci koşum · **authenticated admin slug günceller →
takma ad yazılır, UPDATE kalır** · A→B→A→B · iki kiracı.

### Faz 1-B — ağaç + Casals + 39 aile verisi (migration, Recep merge)
1. Casals `brands` + `products.brand` 53 üründe (#8).
2. +4 dal (78b TR slug'ları); `level`/`sort_order` komşudan ölçülerek.
3. 6 aile + 44 ürün taşıma, iki tablo birlikte (cetvel §8).
4. Korozyon dalı adı + `metadata.slug.tr` · `sub.spare-parts` translation_key · 4 Casals ailesi.
5. **39 aile slug'ı** (karar 86; 2 perde ailesi 78b kelimesiyle) — Faz 1-A tetiği eski slug'ları
   takma ada yazar.
6. `products.slug_i18n jsonb` + `get_family_detail` onu döndürür + `pnpm supabase:gen` aynı PR'da.
Kalıp karar 45 (plan bütünlüğü · kiracı tek satır · eski değer doğrulaması · idempotent · gölge).
Faz 1-B ile Faz 3-C arasında yeni slug'lar **bugünkü** `/tr/products/` ve `/tr/category/` rotalarında
yaşar; eski slug'lar takma adla 308 alır. Bu ara dönemde kırık adres yoktur.

### Faz 2 — model slug'ları (veri migration'ı)
Kaynak: URUN listesi (bu dal; REC-212 paketi `slug_tr/en` taşırsa paket kazanır, doğrulayıcı
karşılaştırır). Doğrulayıcı: ≤ 70 · `-p-` yok · rezerve kelime yok · `(tenant, dil, slug)` tekil ·
teknik değer `technical_specs`'te · EN'de Türkçe harf yok · karar 84 (81/81) · 7 eski slug takma adda.
Ön koşul: 7 ailenin EN adı. Bugün: 442/442 tekil, en uzun 70/69.

### Faz 3 — kod (bayrak = derleme sabiti `ADRES_SEMASI_K3B`, canlıda görünmez)
1. **Gerçek rotalar, rewrite yok:** `app/[lang]/kategori/[kok]/[[...dal]]`, `app/[lang]/urun/[slug]`,
   `app/[lang]/urunler`, `app/[lang]/markalar/[slug]` mevcut görünümleri çağırır; `lang !== 'tr'` →
   `notFound()`. EN `category/[categorySlug]/[subCategorySlug]` içerik üreten rotaya döner;
   **EN tek seviyeli dal adresi sayfa katmanında 308** (Y4). Bayrak kapalıyken yeni rotalar 404.
2. **`adresUret(nesne, dil)`** tek SSOT: canonical, hreflang, og:url, JSON-LD, site haritası, kırıntı,
   kart, **IndexNow listesi** (Y3 ek bulgu: iç yollardan değil), arama sonucu.
3. **Model çözücü:** son `-p-` → SKU → model; büyük harf SKU → 308; slug metni yanlış → **308** (O1);
   `-p-` yok → aile; bulunamadı → takma ad → 308; yoksa 404; ağ hatası → unavailable.
4. **Eski-adres haritası üreticisi** (`scripts/` değil `src/data/generated/` + üretim betiği; derleme
   öncesi adım) ve **middleware eşleyicisi**: yol + `?sku=` + dil → tek hedef; dilsiz yolda dil tespiti
   (bugünkü `detectLocale`) ile **tek 307**, dilli yolda **tek 308**; hedefte query yok. 13 dilsiz
   kategori kuralı + 6 ürün kuralı `next.config`'ten silinir.
5. **Eski TR rotaları sayfa katmanında da** (bayrak açıkken; harita kaçırsa ikinci ağ): `/tr/category/*`
   her çözülebilir slug (TR ya da EN biçimli) için ve **`/tr/products/*` her çözülebilir aile/ürün/SKU
   için** doğrudan `adresUret(…,'tr')`'ye 308 (v3 O2 + v4 Y4) — `/tr/products/<x>` hiçbir durumda 200
   dönmez (REC-205). EN `products/[slug]` yeni adreslerin de rotası olduğundan yerinde kalır.
   **Kök değişimi (v4 O6):** dal slug'la bulunur; adresteki kök segmenti dalın bugünkü köküne uymuyorsa
   308 doğru köke (`parent_id` değişince eski `/kategori/<eski-kök>/<dal>` kırılmaz).
   **Pasif kategoriler (v4 O4):** bugün 7 pasif satır canlıda 200 dönüyor (`/tr/category/ticari-havalandirma`
   → 200). Bayrak açıkken pasif kategori → aktif üst köke 308; üstü de pasifse `/tr/urunler`.
6. **UUID yönlendirmesi** middleware'den sayfaya (REC-289).
7. **Yüzeyler:** v3 listesi (LanguageSwitcher, ClientLayout:77, MobilAltSekmeCubugu:128, Seo:52, PDP
   `?sku=` yazıcısı, `public/llms.txt`, ApplicationSolutions 49/55, SearchOverlay 373-374, webhook,
   JSON-LD, config/applications, applicationLinks, Breadcrumb). Kapılar genişler, evrene `public/`.
8. **Arama:** `get_search_suggestions` adres yerine kimlik döndürür (`sku`, `slug_i18n`, `family_slug`,
   `tur`); dönüş tipi değiştiği için **DROP + CREATE aynı işlemde**; tek tüketici `product.service.ts:36`
   aynı PR'da. Eski `url` kolonu Faz 3-C'ye kadar kalır.
9. **Tazeleme** (Y3, O5): model/aile sayfa verisi `unstable_cache(…, { tags: [modelTag(sku, lang,
   tenantId)] })` ile okunur (etiket ancak böyle sayfayı tazeler); webhook `products` + `price_lists` +
   `product_families` dallarına etiket çağrısı; **slug değişince hem `old_record.slug` hem yeni slug'ın
   yolu** (v4 O2: A→B→A geri alındığında A'daki önbellekli 308 döngü yapmasın), **eski ve yeni
   `subcategory_id` dalları da** tazelenir; slug değişimi ayrıca deploy hook'unu kuyruğa alır (§4.1);
   `route.tags.test.ts` genişler. Kural 12: etikette `lang` + `tenantId`. Yeni 308'ler bugünkü
   `Cache-Control: max-age=0, must-revalidate` başlığını korur (v4 D4: tarayıcı 308'i kalıcı önbelleğe
   almasın — EN'de iki seviye → tek seviye yönü tersine dönüyor).
10. **Site haritası** tip başına + 442 model; hreflang; `x-default`; EN kısmı `EN_YAYIN`'a bağlı.
11. **Product JSON-LD** (O7): fiyatlı modelde `offers` **korunur**; fiyatsız modelde tür `Product`
    kalır ama `offers` yerine hiçbir şey uydurulmaz → GSC "geçersiz öğe" riski **ölçülür**
    (Rich Results Test, 3 örnek); sonuç cetvele yazılır, gerekirse fiyatsız modelde yalnız
    `BreadcrumbList` + `ItemPage`.
12. **Sözlük:** "alt kategori", "seri" (TR/EN parite + keycheck).
13. **Önceden üretim** (D4): model sayfalarında `generateStaticParams` **boş**, `dynamicParams` ile
    talep üzerine üretim (derleme 94 → ~1000 sayfaya çıkmasın); aile ve kategori önceden üretilir.
    Derleme süresi Faz 3 kapısında ölçülür.

### Faz 3-C — adres açılışı (tek PR: bayrak `true` + harita + config'ten 19 satırın silinmesi)
Önceki fazlar canlıdayken iner. Tek geri dönüşsüz adım.

### Faz 4 — Recep ön izleme kapısı (karar 68)
Önizleme ya da yerel üretim paketi. Gezinme listesi: menü → her kök → 4 yeni dal (perde dalları pazar
adıyla) → bir Casals ailesi → karar 86'dan iki aile (eski adres → yeni) → korozyon dalından bir model
("asit-fani") → bir model TR + EN → eski adres örnekleri (`/category/fanlar` dilsiz, `/tr/category/fans`
EN slug'lı, iki seviyeli eski dal, aile, `?sku=`, eski ürün slug'ı, VRT-253490106XN eski adresi, büyük
harf SKU) **tek sıçramada** yeni adrese → arama önerisinden tık → EN kırıntıda `İ` yok → `/tr/cart`
200. **"Gördüm, tamam" olmadan Faz 3-C merge edilmez.**

### Faz 5 — yayın
**Ön koşullar:** REC-212 paketi bitti · 7 ailenin EN adı dolu · **GSC taban ölçümü alındı** (karar 86
şartı; erişim ALTYAPI'da) · linkinator + unlighthouse yayın öncesi taraması alındı · Faz 4 onayı.
Sonra: Faz 3-C merge → deploy → yayın ölçümü (§7) → site haritası GSC'ye + IndexNow (K4) → iki hafta
izleme (§8).

## 6. Eski adres envanteri (haritanın içeriği; config satırı değil)

| # | eski | yeni | adet (kaynak başına) | katman |
|---|---|---|---|---|
| 1 | `/tr/category/<kök>` (TR ve EN slug'lı) | `/tr/kategori/<kök>` | 6 × 2 biçim | harita + sayfa (O2) |
| 2 | `/tr/category/<dal>` (TR ve EN slug'lı; 18 + 4 yeni dalın ara dönem adresi) | `/tr/kategori/<kök>/<dal>` | 22 × 2 biçim | harita + sayfa |
| 3 | `/tr/category/<kök>/<dal>` (TR ve EN slug'lı: `/tr/category/fans/duct-fans`) | `/tr/kategori/<kök>/<dal>` | 18 × 2 biçim | harita |
| 4 | **EN** `/en/category/<dal>` (tek seviye) | `/en/category/<kök>/<dal>` | 22 | sayfa (Y4) + harita |
| 5 | dilsiz `/category/<eski-tr>/:yol` (bugünkü 13 kural: 3 aktif kök, 3 dal, 2 pasif kök, 1 pasif dal, 4 ölü hedef) | Türkçe slug → **TR'ye 308**; dilden bağımsız → dile göre tek 307 | 13 × segment öneki | harita + tohum (§4.1) |
| 5b | 6 Lineo çap adresi (`/(tr\|en)/products/vortice-lineo-<çap>-quiet`) | Lineo Quiet ailesinin yeni adresi | 6 × 2 | tohum |
| 5c | 7 pasif kategori (bugün 200) | aktif üst kök ya da `/tr/urunler` | 7 × 2 biçim | sayfa katmanı (Faz 3 m.5) |
| 6 | `/tr/products` | `/tr/urunler` | 1 | config |
| 7 | `/(tr\|en)/products/<aile>` (bugünkü 47; karar 86'nın 39'u + 4 Casals slug değiştirir) | `/tr/urun/<aile-yeni>` · `/en/products/<aile-yeni>` | TR 47 + EN yalnız slug'ı değişen 43 (**eski = yeni olan EN satırı haritaya girmez**, kendine yönlenmesin — v4 O4) | harita |
| 8 | `/(tr\|en)/products/<ürün-slug>` + 7 eski ürün slug'ı | model kanoniği | 442 × 2 + 7 × 2 | harita (+ takma ad) |
| 9 | `?sku=` (TR + EN aile adresi, eski ve yeni önekte) | model kanoniği | 442 × 2 | harita (middleware query'yi **ayrıştırır**: SKU harf duyarsız, `utm_*` gibi ek parametrelere dayanıklı; hedefte query yok — utm'nin düşmesi bilinçli, cetvele yazılır, v4 D2) |
| 10 | `/tr/brands/*` | `/tr/markalar/*` | desen | config |
| — | `/tr/cart` · `/tr/checkout` | dokunulmaz | 0 | — |

v3'teki "korozyon satırı" ikinci kez sayılıyordu (O3): korozyon dalının eski TR slug'ı
(`asit-dayanikli-fanlar`) satır 2'nin içindedir. Tam envanter (her satır, eski → yeni) Faz 3-C PR'ında
commit'lenir; kapı onu okur.

## 7. Kapılar (uygulamayla birlikte)

- **INV-ADRES-SEMASI-1:** iç bağlantılar `adresUret`/`Routes`'tan; `'/category/'`, `'/products/'`,
  `'/brands/'` SSOT dışında 0 (evren `src/**`, `supabase/functions/**`, `public/**`).
- **INV-ADRES-CAKISMA-1:** rezerve kelime · `-p-` · `^p-` · `(tenant, dil, slug)` tekil.
- **INV-ADRES-COZUCU-1:** çözücünün dalları birim testte (model · büyük harf · yanlış slug → 308 ·
  aile · takma ad · UUID · 404 · unavailable).
- **INV-ADRES-HARITA-1:** harita her satırı **tek hop** ve hedef 200; `?sku=` hedefinde query yok;
  hiçbir hedef yine haritada kaynak değil (döngü yok); harita DB ile birebir (üretim tazeliği, CI).
- **INV-ADRES-TEK-KANONIK-1:** bayrak açıkken **tr ve en**: tek seviyeli dal 308, iki seviyeli 200.
- **INV-OZEL-AD-BUYUK-HARF-1:** özel ad elemanlarında `text-transform` yok.
- **Yayın ölçüm betiği** (`docs/audits/rec300-*`): §6 envanterinin her satırı tek hop + hedef 200 ·
  bugünkü 4 hop'luk `/category/fanlar` zinciri **1 hop** · `/tr/cart` + `/tr/checkout` 200 · site
  haritasındaki her adres 200. **REC-300 EK:** linkinator (kırık 0, zincir 0) + unlighthouse (SEO
  ortalaması düşmez) öncesi/sonrası fark tablosu (OPS ölçer).
- `pnpm build` + **tam birim takımı** + keycheck + Playwright smoke (kategori → dal → aile → model, TR
  + EN) + INV-DIL-DUSUSU-1 e2e yeni rotalarda.

## 8. Yayın sonrası (iki hafta)
GSC "bulunamadı" birikimi 0 · eski adres örneklemi tek hop · GSC taban ölçümüne göre tıklama
karşılaştırması (karar 86 şartı) · trafik geçici düşebilir, kalıcı düşüş beklenmez.

## 9. Recep'e giden kararlar
- R1 (ağaç), R2 (aile öneki), **R3 = karar 86** (39 aile) — **kapandı.**
- Açık yapısal soru yok. Kalan Recep adımları kararla değil onayla: Faz 1-A/1-B/2/arama migration'ları
  (kural 13) ve Faz 4 ön izleme.

## 10. Kapsam dışı ve yan bulgular
REC-95 (faset) · REC-374 (`brands.ts`) · REC-373 (`<html lang>` kökü) · breadcrumb JSON-LD hidrasyon ·
`assertNoUuid` 500 · Sığınak'ın köke çıkması · REC-145 belge bölümü · barındırma taşıması (REC-367,
karar 59 — bu plan ona bağımlı değil, §4) · katalog veri şüpheleri (KATALOG'a iletildi).

## 11. Geri alma
İleri düzeltme esastır: harita ve envanter commit'li; yanlış satır düzeltilir, yeniden derlenir. Faz
3-C geri alınırsa yeni adresler 404 olur (dizine girmişse kayıp) → yalnız kitlesel hata hâlinde,
Recep kararıyla. Faz 1-A/1-B/2/3 tek başına geri alınabilir.

## 12a. Bağımsız çürütme v4 (2026-09-23) — **KOŞULLU** → v5 cevapları

Ana fikir ayakta (middleware + derleme anı haritası; Vercel'de middleware önbellekten önce koşar, boyut
sınırına uzak; Cloudflare/OpenNext'te koşullu aynen çalışır). Kapanan: v3 K1, K2, Y1, Y2, O4.

| # | bulgu | derece | v5 cevabı |
|---|---|---|---|
| Y1 | DB'den üretilen harita, DB'de hiç olmamış eski adresleri (13 dilsiz kural kaynağının 7'si, 6 Lineo) kaybeder; 4 hedef bugün 404 | YÜKSEK | §4.1 tohum dosyası; ölü hedefler en yakın canlı adrese; silinen satır 25 |
| Y2 | derlemede DB yoksa davranış tanımsız; CI'da DB yok; §4/§11 çelişkisi | YÜKSEK | §4.1 fail-closed + CI fikstürü + zamanlanmış DB kolu; harita commit'lenmez, envanter commit'lenir |
| Y3 | `detectLocale` Türkçe Chrome'u EN'e yolluyor (ölçüldü) | YÜKSEK | §4.1 Türkçe slug'lı dilsiz adres → TR 308; q değeri ayrıştırma |
| Y4 | `/tr/products/<x>` için sayfa katmanı dalı yok | YÜKSEK | Faz 3 m.5 genişledi |
| O1 | bayat harita 2 hop | ORTA | §4.1 cetvel + deploy hook + gecelik derleme |
| O2 | A→B→A'da önbellekli 308 döngüsü | ORTA | m.9 yeni slug yolu da tazelenir; gölgede HTTP senaryosu |
| O3 | `:path*` joker ve sondaki `/` | ORTA | §4.1 segment öneki + normalizasyon |
| O4 | envanter sayıları (13 kuralın dökümü, 7 pasif kategori, EN özdeş satırlar, iki seviyeli EN slug'lı TR) | ORTA | §6 satır 3, 5, 5b, 5c, 7 |
| O5 | geçerli sınır Vercel Edge gzip 1 MB (Hobby); Node middleware kaçışı OpenNext'te yok | ORTA | §4 boyut paragrafı; harita yapısal |
| O6 | `parent_id` değişince eski iki seviyeli adres | ORTA | m.5 kök uyuşmazlığı → 308 |
| D1–D4 | `metadata.slug` tetik koşulu · `?sku=` ayrıştırma · config birebir · 308 önbellek başlığı | DÜŞÜK | Faz 1-A tetik `WHEN (old.slug IS DISTINCT FROM new.slug OR old.metadata->'slug' IS DISTINCT FROM new.metadata->'slug')`; §6 satır 9; §4 katman 3; m.9 |

**v5 için tur:** Faz 1-A (takma ad tablosu) v5 ile başlayabilir; Faz 3 başlamadan önce §4.1 tasarımına
kısa bir doğrulama turu (özellikle deploy hook tetiği ve fail-closed eşiği) koşulur.

## 12. Bağımsız çürütme v3 (2026-09-23) — **BLOK** → v4 cevapları

| # | bulgu | derece | v4 cevabı |
|---|---|---|---|
| K1 | `has: query sku` query'yi hedefe taşır, hedefte yeniden eşleşir → döngü | KRİTİK | §4: `?sku=` middleware haritasında, hedef query'siz; INV-ADRES-HARITA-1 döngü + query kontrolü |
| K2 | 884+884 config satırı Vercel 2048 rota sınırına dayanır; tek desen büyük harf SKU yüzünden 2 hop | KRİTİK | §4: config'te yalnız 3 desen; harita sınırsız ve sağlayıcıdan bağımsız (karar 59); SKU haritada doğrudan küçük harfli hedefe |
| K3 | bugün 4 hop'luk dilsiz kategori zinciri; K3-b ile 5 | KRİTİK | 13 kural silinir, harita dilsiz yolu tek 307 ile son hedefe götürür; yayın ölçümünde bu zincir 1 hop |
| Y1 | tetik invoker yetkisiyle admin slug düzenlemesini düşürür | YÜKSEK | Faz 1-A m.2 `SECURITY DEFINER` + gölge senaryosu |
| Y2 | A→B→A→B'de unique ihlali | YÜKSEK | `ON CONFLICT DO UPDATE` + canlı slug çakışmasında takma ad silinir |
| Y3 | etiketle tazeleme bugün no-op; IndexNow iç yolları bildirir | YÜKSEK | Faz 3 m.9 `unstable_cache` etiketi; m.2 IndexNow `adresUret`'ten |
| Y4 | EN tek seviyeli dal: REC-205 EN'de tekrar | YÜKSEK | §2 + Faz 3 m.1 + INV iki dil; §6 satır 4 |
| O1 | "200 + canonical" gerekçesi çürük | ORTA | yol bazlı 308 (§2) |
| O2 | `/tr/category/<EN-slug>` eski adresleri yok | ORTA | §6 satır 1–2 iki biçim + Faz 3 m.5 sayfa katmanı |
| O3 | korozyon satırı çift sayım | ORTA | §6 notu |
| O4 | takma ad RLS kiracısız; kategori slug'ı izlenmiyor | ORTA | `jwt_tenant_id()` kalıbı; tetik kategoriyi de izler |
| O5 | webhook eski slug'ı ve eski dalı tazelemiyor | ORTA | Faz 3 m.9 |
| O6 | tohum evreni audit başlangıcıyla sınırlı | ORTA | Faz 1-A m.4 site haritası + GSC ile birleşik |
| O7 | fiyatsız Product JSON-LD geçersiz öğe | ORTA | Faz 3 m.11 ölçüm + cetvel |
| D1 | `P-` ile başlayan SKU yanlış bölünür | DÜŞÜK | check `(^p-\|-p-)` |
| D2 | küresel/kiracılı tekillik belirsiz | DÜŞÜK | Faz 1-A m.3: küresel kalır, cetvele yazılır |
| D3 | dilsiz yeni adres EN ziyaretçide 404 | DÜŞÜK | Faz 0 cetvel + harita dilsiz yeni adresleri de eşler |
| D4 | önceden üretim ~10 kat | DÜŞÜK | Faz 3 m.13 model sayfaları talep üzerine |

Denetçinin doğruladıkları: rota çakışması yok (`urun-secici` ≠ `urun/[slug]`) · config redirect'leri
middleware'den önce koşar · takma ad statik sayfada çalışır (`dynamicParams`) · tetik adlarında çakışma
yok · §6 sayıları DB ile tutuyor (6/18, Casals 53, taşıma 44) · DB'de iç bağlantı taşıyan kolon yok.

## 13. Bağımsız çürütme v2 (2026-09-22) — v3'te cevaplandı, v4'te yerini koruyor

1 rewrite döngüsü → gerçek rotalar · 2 `?sku=` force-static → §4 harita · 3 atomik değil → A/B/C sırası
+ takma ad · 4 webhook → Faz 3 m.9 · 5 yüzey sayımı → m.7 · 6 `slug_i18n` + kısıtlar → Faz 1-A/1-B ·
7 arama dil almıyor → m.8 · 8 `products.brand` → Faz 1-B · 9 dilsiz kural `/tr/`'ye sabit → §4 tek 307 ·
10 `<html lang>` → REC-373 · 11 K3-b çelişkisi → R2 kapandı.

*Yazan: URUN şeridi, v4 2026-09-23. v4 bağımsız çürütme turundan geçmeden Faz 1-A başlamaz.*
