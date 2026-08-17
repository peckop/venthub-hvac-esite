# Render Stratejisi Denetimi — SSR/SSG/ISR Tam Envanter + İhtiyaç Analizi

> **Tarih:** 2026-08-16 · **Kapsam:** origin/master @ `d044d183` (69 page.tsx + 4 route.ts + 4 layout +
> sitemap/robots) · **Yöntem:** 8 paralel Opus ölçüm ajanı (rota envanteri · cetvel kıyası · tazeleme
> tetikleri · cache anahtarları · sınır hijyeni · veri çekme · fırsat analizi · doküman drifti) + her
> hattın bulgularını dosya açıp yeniden üreten 8 çapraz-doğrulayıcı. Toplam 16 ajan, 523 araç çağrısı.
> Yeniden üretilemeyen iddia CONFIRMED sayılmadı; 1 bulgu çürütüldü, ~%40'ı şiddet düşürülerek geçti.
> **Cetvel:** `docs/standards/rendering-cache-standard.md` (bu denetimin anayasası; 2026-08-15'te 1044
> fiyat satırının vitrine yansımaması vakasından doğdu).

---

## TL;DR — üç cümle

1. **Vitrinin "Statik + ISR" sözleşmesi bugün kodda ÇALIŞMIYOR:** tek bir satır (`getTenantConfig()`
   içindeki `headers()`) ana sayfa dahil 4 vitrin rotasını her istekte yeniden render edilen dinamik
   rotaya düşürüyor; `await searchParams` (sayfalama) 3 liste rotası için ikinci, bağımsız kaçış.
   `revalidate = 3600`, `generateStaticParams` ve webhook'un `revalidatePath` çağrıları bu rotalarda
   **ölü sermaye**.
2. **Bu kazara-dinamiklik, tazeleme zincirindeki 6 ayrı deliği MASKELİYOR** (TR yolları kanonik EN
   slug'la tazeleniyor; alt-kategori ve sitemap hiç tazelenmiyor; `product_images`/`brands`/`price_lists`
   tablolarının zinciri hiç yok). Sayfalar her istekte tazelendiği için bugün kimse farkı görmüyor —
   **statiği onaran ilk PR, zincirler önceden örülmezse, görselleri ve kategorileri dondurur.**
3. **Onarım sırası bu yüzden ters:** önce zincirleri kur (Dalga-1), sonra statikleştir (Dalga-2),
   sonra ölçerek kilitle (INV genişletmeleri, Dalga-4). PPR kararı (kullanmama) **doğru ve değişmemeli**.

## ⚠️ Lansmanla doğrudan bağ: `product_images`

Görseller yakın zamanda yüklenecek (T069). `product_images` tablosunun **hiçbir tazeleme zinciri yok**
(cetvel §3 tablosunda satırı yok, webhook'ta dalı yok, DB tetiği yok). Bugün rotalar kazara dinamik
olduğu için görseller yüklenince *görünecek* — ama Dalga-2 (statikleştirme) bundan önce yapılırsa
1044-fiyat-satırı vakası görsellerle birebir tekrar eder. **Dalga-1'in içinde `product_images` dalı
zorunlu.**

---

## Bulgu kümeleri (93 ham bulgu → 7 küme; şiddetler doğrulayıcı-sonrası)

### K1 — Vitrin statik değil (HIGH · CONFIRMED · kök: 2 bağımsız mekanizma)

| Mekanizma | Kanıt | Etki |
|---|---|---|
| `getTenantConfig()` → `await headers()` | `src/utils/tenantServer.ts:72`; çağıranlar: `src/app/[lang]/page.tsx:112`, `products/page.tsx:52`, `category/[categorySlug]/page.tsx:166`, `[subCategorySlug]/page.tsx:177` | 4 vitrin rotası istek-başına render. try/catch `DynamicServerError`'ı yutuyor ama rota yine dinamikleşiyor (mutasyon throw'dan önce) — hata gizli, sonuç aynı |
| Sayfa gövdesinde `await searchParams` (`?page=`) | `category/[categorySlug]/page.tsx:142`, `products/page.tsx:50`, `[subCategorySlug]/page.tsx:160` | PPR kapalıyken sayfayı dinamikleştirir; tenant düzeltilse bile bu 3 rota dinamik kalır |

Sonuç: `export const revalidate = 3600` dört rotada ölü; webhook `revalidatePath` çağrılarının
tazeleyeceği prerender çıktısı yok. **Bunu yakalayan hiçbir INV kapısı yok** (ölü-revalidate dedektörü
K7'de). Tek gerçek SSG+ISR rotaları: **PDP, marka-detay (kabuk), about/legal** (aşağıda harita).

### K2 — Webhook yol-üretimi yanlış: TR yüzeyi tazelenmiyor (HIGH · mekanizma birebir doğrulandı)

Webhook'un üç dalı da (`products` :160, `categories` :171, `inventory_movements` :211) kategori yolunu
**kanonik EN slug** ile kuruyor (`categories.slug`); oysa TR sayfası `metadata.slug.tr` ile prerender
ediliyor (kural 7, `getLocalizedCategorySlug`). 26 kategorinin TR yolu (`/tr/category/cati-tipi-fanlar`
gibi) **hiç geçersiz kılınmıyor**; tazelenen `/tr/category/roof-fans` yalnız bir 308 redirect kaynağı.
Ek: `SELECT` yalnız `slug` çekiyor, `metadata` hiç gelmiyor (:156, :207). Ayrıca **iki segmentli
alt-kategori yolu hiçbir dalda tazelenmiyor** (14 `revalidatePath` çağrısının tamamı tek segment) ve
**`sitemap.xml`** (DB'den üretiliyor, `src/app/sitemap.ts:11`) build'de donuyor — ne `revalidate` ne
webhook dalı var. INV-RENDER-2 tetik⇄handler *varlığını* zorluyor, **yolun doğruluğunu denetlemiyor** —
bu yüzden hiçbir kapı görmedi.

### K3 — Zinciri hiç olmayan tablolar (HIGH→MED · maskeli, Dalga-2 sonrası patlar)

`product_images` (yukarıda) · `brands` (PDP + kartlarda `brand_name`, join kanıtı
`20260814_pricing_w4b_display_price.sql:213`) · `price_lists` (`display_price`'ın ikinci girdisi, :32)
· `tenants` bulgusu **ÇÜRÜTÜLDÜ** (React.cache istek-içi tekilleştirmedir, kalıcı önbellek değil —
rota dinamikken her istekte taze okunur; Dalga-2'den sonra yeniden değerlendirilmeli).

### K4 — Ölü/öksüz önbellek aygıtları (MED · tamamı doğrulandı)

- `variantStockTag()` ve `familyTag()` **tüketicisiz**: depoda tam 4 `unstable_cache` var ve hiçbirinin
  `tags` dizisinde bu ikisi yok → `revalidateTag` çağrıları sessiz no-op; üstelik `route.tags.test.ts`
  bu no-op'u sözleşme diye sabitliyor.
- Kategori önbellek anahtarı sorgunun gerçek girdisi `categoryIds`'i içermiyor (`category/.../page.tsx:43`).
- PDP fiyatı anon istemciyle prerender ediliyor, **fiyat SEGMENTİ hiçbir cache anahtarında yok**
  (`lib/data/preload.ts:19`) — bayi/kurumsal NET fiyat statik HTML'de asla doğru olamaz; segmentli fiyat
  bugün istemcide düzeltiliyorsa cetvele yazılmalı, düzeltilmiyorsa bayi fazında bloklayıcı.
- Ölü `React.cache` sarmalayıcı `_getCachedSupabaseData` (tanımlı, çağrılmıyor).
- Global + tenant-scoped çift tag her sitede birlikte: tenant-scoped tazeleme bugün anlamsız (global
  tag her tenant'ın önbelleğini düşürüyor) — tek-tenant'ta zararsız, SaaS fazında düzeltilecek diye
  cetvele not düşülmeli. Kural 12'nin **anahtar** kısmı ise TEMİZ (4/4 sitede lang+tenantId var).

### K5 — Sınır hijyeni (HIGH tek kalem + MED'ler)

- **`tests/smoke/ssr-html.spec.ts` HİÇBİR YERDE KOŞMUYOR** — client/server sınırının tek kapısı
  sessiz-kapalı ([[githooks-shim-model]] sınıfı). CI'a bağlanmalı; rota listesi de 5 yolda donmuş.
- `account/{orders,addresses,invoices}` üçlüsü `ssr:false` (kural 4 ihlali, cetvelin kendisi yazmış);
  admin tarafında da sürüyor. Hesap/admin dinamik kalabilir ama `ssr:false` yerine RSC kabuk + client
  veri deseni gerekli — ayrı, büyük göç dalgası.
- 9 destek/hesaplayıcı sayfası `page.tsx` düzeyinde `'use client'`: statik içerik CSR'a düşmüş,
  `/destek` altında **sıfır sunucu metadata** (SEO kaybı).
- Marka sayfaları: cetvel "Statik+ISR, birincil tazeleme webhook" diyor; gerçekte ürün listesi
  tarayıcıda çekiliyor — **statik HTML'de sıfır ürün** (SEO'da görünmez), ISR beyanı ölü.

### K6 — Veri çekme verimsizlikleri (MED · Dalga-2 ile birlikte ele alınmalı)

Kategori sayfasında 4 seri DB gidiş-dönüşü (biri gereksiz) + önbelleksiz `get_category_counts`;
aynı iki sorgu sunucuda ve istemcide (CategoryContext) birer kez; Suspense sınırları akıtmıyor (tüm
await'ler sınırın üstünde); `getAllFamilySlugs` **96 ailede sessizce kesiliyor** (`family.service.ts:115`,
limit=96, total_count kontrolü yok) → katalog büyüyünce gSP + sitemap sessizce eksik üretir — **katalog
görselleri/aileleri yüklenmeden düzeltilmeli**.

### K7 — Kapı ve doküman kör noktaları (kapatılmazsa bu rapor da çürür)

- INV-RENDER-2: tazelenen **yolun doğruluğu** assert'i yok (K2'yi göremedi) · dal **gövdesini** görmüyor
  (boşaltılmış handler yeşil) · tablo kümesini koddan değil cetvelden okuyor (`product_images` körlüğü
  kendi belgesinde) · migration sıralama modeli #542'deki workflow değişikliğiyle DESENKRON (drop/create
  çiftinde ters sonuç).
- INV-RENDER-1: yasak listesi `CategoryMasterView.tsx`'i kapsamıyor; yalnız `formatCurrency(` metnini
  arıyor (takma-adlı import/ham sayı kör) — [[substring-assert-is-not-a-gate]] ailesi.
- INV-2 (localized-route): yalnız `components/`+`views/` tarıyor; `src/app/api` ve `sitemap.ts` kapsam
  dışı — K2 tam bu boşlukta yaşadı.
- Cetvel §1 rotaların ~yarısını hiçbir sınıfa atamıyor ("her rota birine aittir" kendi kuralıyla
  çelişiyor); marka satırı kodla ters; CONTEXT.md tablo listesinin elle kopyasını taşıyor; bir plan
  dosyası PPR'ı hâlâ canlı kural diye öğretiyor; companion .md'ler §2 ile çelişiyor.

---

## Rota → üretim modu haritası (ölçülmüş, 69 sayfa)

| Sınıf | Rotalar | Mevcut | Olması gereken |
|---|---|---|---|
| A — gerçek SSG+ISR ✅ | PDP `/[lang]/products/[slug]` · marka-detay kabuğu · (about/legal ile 11) | doğru | değişmez — **PDP örnek desen** (gSP × dil, React.cache, Suspense'li useSearchParams) |
| B — "statik" ilan, dinamik ölçüm ⚠️ | `/[lang]` · `/products` · `/category/[c]` · `/category/[c]/[s]` | dinamik-RSC | Dalga-2 ile gerçek SSG+ISR (sayfa-1 statik deseni) |
| C — force-static | 8 legal/about | doğru | gSP eksik 2 dosyaya ekle (LOW) |
| D — RSC kabuk + istemci veri | brands, cart, checkout, auth login/register | örtük | sınıf beyanı cetvele; brands SSR'a (K5) |
| E — sayfa düzeyi `'use client'` | 13 (destek ×9, auth ×3, payment-success) | CSR | destek → RSC + metadata (K5) |
| F/G — force-dynamic hesap+admin | 13 + 20 | bilinçli dinamik | sınıf beyanı cetvele; `ssr:false` üçlüsü göç (ayrı dalga) |

**Temiz çıkanlar (küçümseme):** kural 12 anahtarları 4/4 · kural 5 PDP'de örnek uygulama ·
robots.ts doğru · webhook'un `product_prices`→keşif-tazelememe kararı (PS-042) bilinçli ve belgeli ·
`payment-money-move` yüzeyleri kapsam dışı bırakışı doğru.

---

## Önerilen iş sırası (dalga planı — sıra İÇERİK kadar önemli)

1. **Dalga-1 · Zincir onarımı (statikleştirmeden ÖNCE, ~1 oturum):** webhook'a lokalize-yol yardımcısı
   (`metadata`'yı da SELECT et) + alt-kategori yolları + `/sitemap.xml` + `product_images`/`brands`/
   `price_lists` dalları; `getAllFamilySlugs` 96-tavanı; cetvel §3 tablosuna yeni satırlar.
   *Sahip: webhook dosyası şu an PRICING claim'inde.*
2. **Dalga-2 · Statikleştirme:** `getTenantConfig`'ten `headers()`'ı çıkar (tek-tenant: build sabiti;
   çok-tenant tasarımı zaten A10/EDGE'de) + sayfalamayı sayfa-1-statik desenine al; kabul ölçüsü
   `pnpm build` çıktısında 4 rotanın ○/ISR görünmesi. K6 verimlilikleri (paralel sorgular, önbelleğe
   alma, 96-tavan) bu dalgada.
3. **Dalga-3 · Ölü aygıt temizliği:** variantStockTag/familyTag (tüket ya da söküp cetvele yaz),
   ölü React.cache, categoryIds anahtarı, fiyat-segmenti kararı (bayi fazı öncesi cetvele).
4. **Dalga-4 · Kapı genişletmeleri:** ssr-html spec'i CI'a bağla + rota listesini cetvelden üret ·
   INV-RENDER-2'ye yol-doğruluğu + gövde + koddan-tablo-kümesi + sıralama düzeltmesi · INV-RENDER-1
   kapsam/desen onarımı · **yeni kural: sınıfsız rota yasak** (cetvel §1 ↔ `src/app` diff'i test eder) ·
   **ölü-revalidate dedektörü** (dinamik API kullanan dosyada `export const revalidate` = kırmızı).
5. **Dalga-5 · Sınır göçleri (büyük, ayrı planlanır):** destek sayfaları RSC+metadata · marka SSR ·
   `ssr:false` hesap üçlüsü.

**PPR:** karar değişmiyor — bugünkü dinamiklik "sayfanın bir parçası kullanıcıya özel" olduğundan değil,
iki kazara mekanizmadan. Dalga-2 sonrası ihtiyaç yeniden ölçülür (cetvel §PPR notu güncel).

> İş emirleri: registry **T070** (bu denetim) + Dalga-1/2 için açılacak emirler. Ham bulgu+doğrulama
> çıktısı (93 bulgu, 16 ajan): oturum arşivi `wf_6c5ecf9d-6b9`.
