# Kanonik Adres Standardı (canonical / hreflang / sitemap)

> **Durum:** v1.0 · 2026-08-17 · Şerit: LEGAL-SEO
> **Bekçi:** `INV-CANONICAL-1` → `src/__tests__/conformance/canonical-url-ssot.test.ts`
> **SSOT:** `src/config/siteUrl.ts` → `SITE_URL`
> **İlgili:** `docs/standards/rendering-cache-standard.md` · CLAUDE.md #7 (i18n/URL)

## 0. Bu cetvel niçin var (ve niçin geç yazıldı)

PR #620 canlı bir kusuru kapattı: ürün sayfası kanonik adresi `window.location.origin`'den
türetiyordu — yani **kanonik adres ziyaretçinin tarayıcısına göre değişiyordu**. Düzeltme ve
`INV-CANONICAL-1` bekçisi indi, **ama cetvel yazılmadı**. CLAUDE.md 1. kural bunu açıkça
yasaklar: *"'cetvel yok' geçerli bir cevap ama bedava değil — o zaman iş, cetveli yazmayı da
kapsar."* Bu dosya o borcu kapatır.

Borç kapatılırken yapılan ölçüm, aynı aileden **ikinci ve daha büyük** bir kusuru ortaya
çıkardı (§4). Cetvelin geç yazılmasının bedeli tam olarak budur: kural yazılmayınca ihlal
görünmez.

## 1. Tek kural

> **Kanonik adres, o sayfanın gerçekten yayınlandığı ve yönlendirmesiz açıldığı tek adrestir;
> `SITE_URL` SSOT'undan üretilir ve sitemap'in o sayfa için bildirdiği adresle BİREBİR aynıdır.**

Üç parçası da denetlenir:
1. **Kaynak:** `SITE_URL` (`src/config/siteUrl.ts`). Tarayıcı host'u (`window.location.*`),
   `VERCEL_URL` veya elle yazılmış sabit **yasak**.
2. **Yönlendirmesiz:** kanonik adres 3xx dönen bir adres olamaz.
3. **Sitemap ile tutarlı:** sitemap'te bildirilen URL ile sayfanın kanoniği çelişemez.

## 2. `SITE_URL` niçin SSOT

`siteUrl.ts` bir merdivendir: `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` →
`VERCEL_URL`. Sıra kasıtlıdır — `VERCEL_URL` **deploy'a özeldir** ve her deploy'da değişir.
2026-08-15 denetiminde bunun canlı bedeli ölçüldü: `robots.txt` her deploy'da başka bir
`Sitemap:` adresi gösteriyordu, hreflang alternatifleri geçici URL üretiyordu ve Mesafeli
Satış Sözleşmesi satıcının sitesi olarak rastgele bir deploy adresi yazıyordu.

Doğrusu `NEXT_PUBLIC_SITE_URL`'i açıkça set etmektir; merdiven yalnız sessiz bozulmayı önleyen
emniyet ağıdır. **Prod'da bu değişkeni set etmek Recep tarafındaki açık kalemdir.**

## 3. Tarayıcı host'u niçin yasak (#620'nin dersi)

`window.location.origin`'den kanonik üretmek üç şeyi aynı anda bozar:
- **SSR'da boş.** İlk render'da host yoktur → kanonik `/products/slug` gibi **host'suz** çıkar.
- **Ziyaretçiye bağlı.** Önizleme adresi, özel alan adı, `www` varyantı — hepsi farklı kanonik.
- **Tarayıcıya özel adres asıl adresi gölgeler.** Arama motoru gördüğü ilk `<link rel=canonical>`
  ile RSC metadata'sının ürettiğini çelişkili bulur.

**Bir sayfada kanonik adres TEK yerden çıkar: RSC `generateMetadata` → `alternates.canonical`.**
İstemci bileşeni (`Seo.tsx`) bir kanonik daha basıyorsa değeri RSC'ninkiyle **birebir** olmak
zorundadır — bugün ürün sayfasında böyledir (ikisi de `SITE_URL`'den, aynı yardımcıyla).

## 4. ✅ KAPANDI — kanonik, sitemap ile çelişiyordu (ölçüm 2026-08-17, düzeltme 2026-08-18)

**T083-VH.** Aşağıdaki kusur bu cetvelin yazılması sırasında ölçüldü ve tek PR'da kapatıldı:
ürün + marka sayfası kanonikleri dil öneki aldı, `alternates.languages` (tr/en/x-default)
eklendi, `ProductDetailPageView` istemci kanoniği `localizedHref` ile hizalandı ve
`INV-CANONICAL-2` bekçisi aynı PR'da indi (sabotaj 5/5 + istemci yüzeyi 3/3).

Kayıt olarak bırakılıyor — kusurun **niçin görünmez** olduğu, tekrar etmemesi için değerlidir:

`src/middleware.ts:86-87`: dil öneki taşımayan her kullanıcı rotası **307 ile**
`/${detectedLocale}${pathname}` adresine yönlendirilir ve hedef dil **`Accept-Language`
başlığına göre** seçilir.

Buna rağmen iki yüzey kanonik adresi **dil öneksiz** üretiyor:

| Yüzey | Kanonik (kusurluyken) | Sitemap'in bildirdiği | hreflang | Bugün |
|---|---|---|---|---|
| Ana sayfa | `/tr`, `/en` | `/tr`, `/en` | vardı ✔ | ✔ |
| Kategori | `/tr/category/…` | `/tr/category/…` | vardı ✔ | ✔ |
| **Ürün** | `/products/<slug>` ✗ | `/tr/products/…` + `/en/products/…` | **yoktu** ✗ | ✅ düzeltildi |
| **Marka** | `/brands/<slug>` ✗ | `/tr/brands/…` + `/en/brands/…` | **yoktu** ✗ | ✅ düzeltildi |

Üç ayrı sonuç doğurur:

1. **Kanonik bir yönlendirmeyi gösteriyor.** `/products/x` 307 ile `/tr/products/x`'e gider.
   Yönlendirme gösteren kanonik zayıf sinyaldir; arama motoru onu yok sayıp hedefe konsolide eder.
2. **Kanonik ziyaretçiye göre değişiyor** — #620'nin kusurunun sunucu tarafındaki hâli.
   Aynı `/products/x` adresi bir ziyaretçide `/tr/…`, diğerinde `/en/…` açar.
3. **En pahalısı: iki dil aynı kanoniği bildiriyor.** `/tr/products/x` ve `/en/products/x`
   sayfalarının ikisi de kanonik olarak `/products/x` diyor → arama motoru bunları **kopya**
   sayar ve bir dili indeksten düşürebilir. hreflang de yok, yani ayırt edecek ikinci sinyal
   de yok. Sitemap doğru olanı bildiriyor, sayfa onu **çürütüyor**.

**Uygulanan çözüm** (kategori sayfasında zaten var olan desen kopyalandı): kanonik
`${SITE_URL}/tr|en${Routes.x(...)}` biçiminde kuruluyor **ve** `alternates.languages`
(tr/en/x-default) veriliyor. `Routes.x` kullanımı kasıtlı: `sitemap.ts` de birebir aynı
ifadeyi kullanır, böylece iki yüzey aynı kaynaktan üretilir ve sessizce ayrışamaz.

**İki süreç dersi bu işten çıktı:**

1. **Bekçi düzeltmeden ÖNCE inmedi.** Kusurun sahibi olan dosya başka bir şeritteyken bekçiyi
   master'a göndermek, kimsenin düzeltemeyeceği bir kırmızı yaratırdı — ve o kırmızı,
   düzeltmek yerine *"testi gevşetelim"* baskısı üretirdi. Bekçi ve düzeltme aynı PR'da indi.
2. **Şerit kapısı Bash ile aşılmadı.** Ürün sayfası I18N-SWEEP'teyken `lane-guard` yazmayı
   blokladı; devir beklendi. Bu arada dokunulabilen parçalar (marka, istemci yüzeyi, bekçi)
   hazırlandı, PR açılmadı. Devir gelince kalan tek dosya bir turda kapandı.

## 5. Bekçinin kapsamı — ölçmediği sınıflar ADIYLA

`INV-CANONICAL-1` altı kural işletir; özü: kanonik üreten her yüzey `SITE_URL` SSOT'unu
**import ederek** kullanmalı ve tarayıcı host'una dokunmamalı.

**Bilinen atlatma yolu ve neden böyle yazıldı:** kural önce `/siteUrl|SITE_URL/` arıyordu.
Sabotajda import silinip yerine `const SITE_URL = 'https://sabit.example'` konunca kapı
**yeşil kaldı** — çünkü isim hâlâ dosyadaydı. Yani kapı, tam olarak yasaklamak istediği
davranışı ödüllendiriyordu. Kural **bağı** arayacak şekilde daraltıldı:
`/from\s+['"][^'"]*config\/siteUrl['"]/`. **Bir ismin dosyada geçmesi hiçbir şey kanıtlamaz.**

**Kapsamaz:** `?sku=` gibi sorgu parametrelerinin kanonikten dışlanması (bugün elle sağlanıyor —
`page.tsx` ve `ProductDetailPageView.tsx` yorumlarında yazılı), çalışma anında kurulan adresler.

**Artık KAPSIYOR — `INV-CANONICAL-2` (dil öneki + hreflang + sitemap paritesi):**
kanonik ↔ sitemap tutarlılığı, hreflang varlığı, ve **istemci kanonik yüzeyi**.

> **İstemci yüzeyi neden ayrı kural (2026-08-18 ölçümü):** `alternates` taraması `<Seo>` ile
> basılan kanoniği **göremez**. Ölçüldü: sekiz dosya `<Seo>` kullanıyor ama yalnız biri açık
> `canonical` geçiyor; kalan **yedisi** (Hakkımızda, İletişim, Markalar, Bilgi Merkezi hub ve
> topic, hesaplayıcılar, marka detayı) `Seo.tsx`'in **varsayılanına** güveniyor. Varsayılan
> bugün doğru — `usePathname()` dil segmentini taşır — ama **korumasızdı**: biri varsayılanı
> dilsiz bir kaynağa çevirseydi yedi yüzey birden sessizce bozulur ve hiçbir test görmezdi.
> Yani burası "temiz" değil **ölçülmemiş**ti; artık ölçülüyor (sabotaj 3/3).

## 6. Kim neye dokunur

| Dosya | Şerit |
|---|---|
| `src/config/siteUrl.ts`, `canonical-*` testleri, bu cetvel, `ProductDetailPageView.tsx` | LEGAL-SEO |
| `src/app/[lang]/products/[slug]/page.tsx` | LEGAL-SEO *(I18N-SWEEP'ten devralındı, T083)* |
| `src/app/[lang]/brands/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/middleware.ts` | LEGAL-SEO |
| `src/components/Seo.tsx` | sahipsiz — istemci kanonik yüzeyi, `INV-CANONICAL-2` koruyor |

Kanonik ile sitemap **tek PR'da** değişir: yarım düzeltilirse çelişki sürer, sadece yeri değişir.

## 7. Değişmez kurallar

- Varyant URL'i kanonik olamaz; `?sku=` kanonike **girmez**, aile slug'ı tek kanonik adrestir.
- Kategori adresinde kanonik = EN slug'ı değil, **görünen dilin** slug'ı
  (`getLocalizedCategorySlug`) — CLAUDE.md #7.
- `robots.txt` ve `sitemap.xml` de `SITE_URL`'den üretilir; elle host yazılmaz.
