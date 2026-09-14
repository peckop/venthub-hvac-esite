# Render & Önbellek Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** Hangi sayfanın nasıl üretildiği, hangi verinin nerede gösterildiği ve
> veri değişince neyin tazelendiğinin **tek doğru kaynağı (SSOT)**.
>
> **Neden var?** 2026-08-15'te 1044 fiyat satırı prod'a yazıldı ve **vitrin değişmedi**. Sebep
> tek tek bakınca görünmüyordu: ürün sayfası statik üretiliyor, tazeleme Supabase webhook'una
> bağlı, webhook üç tabloyu dinliyor ve `product_prices` o üçünde yok. Fiyatların sonradan
> görünmesi, alakasız bir PR'ın prod'u yeniden basmasıydı — **tasarım değil tesadüf.**
> Bu cetvel yazılmamıştı; render/önbellek `docs/standards/` altındaki tek boşluktu ve hata
> tam o boşlukta yaşadı.

---

## 1. Rota sınıfları (her rota BİRİNE aittir)

| Sınıf | Nasıl | Nerede | Neden |
|---|---|---|---|
| **Statik + talep-üzerine ISR** | `generateStaticParams()` + **`revalidate = 3600` (yedek)**; birincil tazeleme webhook ile | Vitrin: ana sayfa · kategori · alt kategori · marka · ürün (PDP). *(`destek/konular` statik içerik — yedek eklenmedi)* | LCP/SEO. Bu sayfalar herkese aynı; istek başına üretmek israf |
| **Tam statik** | `export const dynamic = 'force-static'` | Yasal metinler · hakkımızda · iletişim | İçerik deploy dışında değişmez |
| **Dinamik** | `export const dynamic = 'force-dynamic'` | Admin/** · hesap/** · API rotaları | Kullanıcıya/oturuma özel; önbelleklenirse veri sızar |

**`ssr: false` ana rotalarda YASAK** (CLAUDE.md kural 4). İstemci-tarafı veri gerektiren
parçalar `<Suspense fallback={<Skeleton/>}>` ile akıtılır, sayfanın tamamı CSR'a düşürülmez.

### 1.1 Vitrin rotasını SESSİZCE dinamikleştiren iki desen (REC-59, ölçüm 2026-09-08)

Yukarıdaki tablo bir **beyandır**; rota o sınıfa ait olduğunu `revalidate` yazarak ilan eder.
Ama iki desen bu beyanı **hiçbir hata vermeden** geçersiz kılar — sayfa yine istek anında
üretilir, `revalidate` satırı ölü bir cümleye döner ve **hiçbir kapı bunu görmez**:

| desen | niçin dinamikleştirir |
|---|---|
| sayfanın `searchParams` alması | Next 15'te `searchParams` alan sayfa build'de prerender EDİLEMEZ |
| render yolunda `headers()` okunması (ör. tenant çözümü) | build: *"couldn't be rendered statically because it used `headers`"* |

**İkisi VE ilişkisiyle bağlıdır — üç kollu sabotajla ölçüldü (kategori rotası):**

| kol | üretilen HTML |
|---|---|
| taban (ikisi de var) | **0** |
| yalnız `searchParams` kaldırıldı | **0** |
| yalnız `headers()` kaldırıldı | **0** |
| **ikisi birden kaldırıldı** | **46** ✔ |

Yani **birini onarmak hiçbir kazanım vermez.** Bir rotayı statiğe döndüren iş, ikisini birden
kaldırdığını ölçmeden "onarıldı" diyemez.

**⚠BUILD ÇIKTISININ ETİKETİ AYIRT ETMEZ.** `next build` bu rotayı `● (SSG)` işaretliyor ve
46 yolu listeliyordu — diskte **0 HTML** varken. "Static/ISR işaretli mi" ölçütü bu yüzden
yetersizdir; **kabul ölçütü ÜRETİLEN DOSYA SAYISIDIR**:
`find .next/server -path "*category*" -name "*.html" | wc -l`.

**⭐VE MASKE KALKAR:** rota dinamikken her istek taze render edilir, yani **tazeleme webhook'u
bozuk olsa bile kimse fark etmez.** Statiğe geçen her rota için, geçişten SONRA bir veri
değişikliğinin sayfaya gerçekten yansıdığı **canlıda** ölçülür (hiç sorulmamış adres,
`MISS`/`Age 0`). Bu ölçülmeden iş bitmiş sayılmaz — §3'ün tazeleme sözleşmesi ancak o zaman
kanıtlanmış olur.

**Kapı:** `INV-KATEGORI-STATIK-1` (`kategori-rotasi-statik.test.ts`) iki deseni birden bekler
ve AST ile ölçer (metin taraması yorumla tatmin olur — ilk sürümü kendi gerekçe yorumunu ihlal
saydı). Kapının sınırı kendi dosyasında yazılı: kaynak kodu ölçer, `.next` çıktısını değil.

## 2. Fiyat hangi yüzeyde görünür

**Karar (Recep, 2026-08-15): fiyat YALNIZ ürün satış sayfasında (PDP) gösterilir.**

| Yüzey | Fiyat | Not |
|---|---|---|
| PDP (`/[lang]/products/[family-slug]`) + varyant seçici | **EVET** | Tek gösterim yeri |
| Aile/ürün kartları, kategori, keşif, marka, ana sayfa, arama | **HAYIR** | `ProductCard` çağrıları `hidePrice` geçer |
| Sepet · checkout · sipariş özeti | EVET | Satın alma akışının kendisi |
| Admin · hesabım/siparişlerim | EVET | Yetkili görür / kendi siparişi |

**Gerekçe iki yönlü:** ticari karar (kartta fiyat istenmiyor) ve mimari kural aynı yere bakıyor
— `product-schema-standard.md` §2.2 **PS-042**: fiyat/stok verisi keşif önbelleğini
(`products-discovery-${tenantId}`) çökertmemeli. Kart fiyat taşımazsa keşif önbelleği de
taşımaz ve fiyat değişimi keşif'i tazelemek **zorunda kalmaz**.

> **DİKKAT — bu iki kavram AYRIDIR, birleştirilirse satış yolu sessizce kapanır:**
> `quoteMode` = *satın alınabilir mi* (fiyat yoksa sepet kapalı, "Teklif İste") ·
> `hidePrice`/`showPrice` = *gösterilecek mi*. Eskiden `ProductCard`'da tek değişkendi;
> fiyatı gizlemek istemek sepete eklemeyi de kapatıyordu.

**Kapı:** `INV-RENDER-1` (`src/__tests__/conformance/render-price-surface.test.ts`) — yasak
yüzeylerde `formatCurrency` çağrısı ve `hidePrice` geçmeyen `ProductCard` kullanımı kırmızı yanar.

## 3. Tazeleme sözleşmesi

**Statik vitrin sayfasında görünen HER tablonun (a) DB tetiği ve (b) webhook handler dalı
olmalıdır.** Biri eksikse veri değişir, sayfa değişmez — ve bunu hiçbir test görmez.

| Tablo | Tetik | Handler | Ne tazelenir |
|---|---|---|---|
| `products` | `on_products_change` | var | **aile** PDP yolu + (varsa) **ailenin SERİSİ** + (alan-duyarlı) keşif tag'leri |
| `categories` | `on_categories_change` | var | kategori yolları |
| `inventory_movements` | `on_inventory_movements_change` | var | **aile** PDP yolu + (varsa) **ailenin SERİSİ** + kategori yolu (**keşif'e dokunmaz** — PS-042) |
| `product_families` | `on_product_families_change` | var | aile PDP yolu + keşif tag'leri + (bu satır MODEL ise) **üstündeki SERİ** PDP yolu/tag'i |
| `product_prices` | `on_product_prices_ins_del` + `on_product_prices_upd` (`WHEN`) | var | **yalnız** o ürünün aile PDP yolu + (varsa) **ailenin SERİSİ** — keşif tag'lerine DOKUNMAZ (PS-042) |
| `product_images` | `on_product_images_change` | var | **aile** PDP yolu + (varsa) **ailenin SERİSİ** + keşif tag'leri + `/sitemap.xml` — ⚠️ tablo bugün **0 satır**; zincir T069 görsel yüklemesinden ÖNCE yerinde olmalı (sonra kurulursa görseller girer, hiçbir sayfa tazelenmez) |
| `brands` | `on_brands_change` | var | markanın **tüm ailelerinin** PDP yolları + keşif tag'leri |
| `price_lists` | `on_price_lists_change` | var | **tüm** ailelerin PDP yolları — keşif'e DOKUNMAZ (fiyat yalnız PDP'de görünür, `product_prices` ile aynı gerekçe). ⚠️ **FAN-OUT SINIRI:** aile sayısı kadar yol tazelenir (ölçüm 2026-08-17: **32 aile → 64 çağrı**). Birkaç yüz aileye çıkıldığında tag tabanlı çözüme geçilmeli — sınır burada **sayıyla** yazılı ki sessizce yavaşlamasın |

> **PDP AİLE KANONİKTİR** (`/[lang]/products/[family-slug]`). Yol tazelenirken **ürün** slug'ı
> kullanmak sessiz bir kaçaktır: prerender edilmiş yol aile slug'ı olduğu için var olmayan bir
> yol geçersiz kılınır ve sayfa hiç yenilenmez. `products` ve `inventory_movements` dalları tam
> bunu yapıyordu (2026-08-15 denetimi yakaladı); dört dal (`products`/`inventory_movements`/
> `product_prices`/`product_images`) artık tek yardımcıdan (`revalidateFamilyChain`) çözüyor.
>
> **`revalidateTag` yalnız o tag'i tüketen bir `unstable_cache` varsa iş görür.** `familyTag`'in
> tüketicisi yoktu → çağrı sessiz no-op'tu. PDP verisi `React.cache()` ile sarılı olduğundan
> PDP için etkili olan **`revalidatePath`**'tir.
>
> **T138-VH K6 (2026-08-21) — SERİ↔MODEL fan-out.** `product_families.parent_family_id` (`NULL`
> = seri/landing, `NOT NULL` = model/kart+PDP) prod'a girdikten sonra bir MODEL değiştiğinde İKİ
> sayfa bayatlar: modelin kendi PDP'si VE üstündeki SERİ landing'i (seri sayfası model kartını
> basıyor). `route.ts`'teki `walkFamilyChain`/`revalidateFamilyChain` bu zinciri yürür — hiyerarşi
> DB'de tek seviyeli garantilense de (`product_families_single_level_guard` tetiği) route buna
> KÖR, bu yüzden savunma amaçlı `MAX_FAMILY_CHAIN_HOPS` üst sınırı + döngü koruması vardır. Sınır
> aşılırsa SESSİZCE KIRPILMAZ: `console.error` + yanıt gövdesinde `fanoutTruncated: true`.
> Kapı: `route.tags.test.ts` içindeki `K6-a`/`K6-a2`/`K6-b`/`K6-c` testleri (sabotajla kanıtlandı).

Tetik fonksiyonu `public.handle_supabase_webhook()` jeneriktir (`TG_TABLE_NAME` ile tabloyu
kendi okur) — yeni tablo eklemek yalnız `create trigger` demektir.

**Kapı:** `INV-RENDER-2` (`src/__tests__/conformance/render-revalidation-contract.test.ts`) — yukarıdaki
tabloyu **çift yönlü** zorlar: her tablonun yaşayan bir tetiği VE handler dalı olmalı; ayrıca öksüz tetik
(tetik var, handler yok → boşuna HTTP) ve öksüz handler (handler var, tetik yok → **08-15 hatasının imzası**)
ayrı ayrı kırmızı yanar.

> ⚠️ **Yukarıdaki tablo testin GİRDİSİDİR, süsü değil.** `INV-RENDER-2` denetlenecek tablo listesini
> bu markdown tablosunun ilk sütunundan okur (`| \`tablo\` |` satırları). Yani buraya bir satır
> eklemek kapıyı o tablo için anında açar; biçimi bozmak (backtick'i kaldırmak, sütun sırasını
> değiştirmek) ise listeyi boşaltır — bu yüzden ayrı bir iddia "en az 5 tablo okunabildi mi" diye
> bakar. Elle tutulan ikinci bir kopya bilerek YOK: doküman ile test ayrışamasın diye.

> **Tetikler İKİ kaynakta yaşıyor.** İlk üçü (`on_products_change`, `on_categories_change`,
> `on_inventory_movements_change`) hiçbir migration dosyasında geçmez — yalnız
> `supabase/baselines/2026-06-12_public_schema.sql` anlık görüntüsünde tanımlıdır (repo'dan önce elle
> kurulmuşlar). Sonradan eklenenler `supabase/migrations/` altındadır. Kapı ikisini de tarar ve
> `create`/`drop` etkilerini **CI'ın uyguladığı sırayla** işleyerek yaşayan durumu hesaplar.
>
> **Sıra "kronolojik" değil, BAYT sırasıdır** — çünkü `supabase-migrate.yml` şunu yapar:
> `for f in $(ls -1 supabase/migrations/*.sql | sort)`. Depoda 8-haneli (`20250903_*`) ve 14-haneli
> (`20250915152500_*`) adlar yan yana yaşıyor; aynı gün için bu iki biçim bayt sırasında **ters**
> dizilir (`'1'` 0x31 < `'_'` 0x5F). Kapının ilk sürümü tarihe göre normalleştiriyordu ve bu
> sessiz-yeşil üretiyordu: aynı push'ta gelen `20260815_drop` + `20260815120000_recreate` ikilisinde
> test "tetik yaşıyor" derken CI tersini uygular ve prod'da tetik ölür. **Ders: bir kapı, doğru
> sandığı sırayı değil, ortamın uyguladığı sırayı modellemelidir.**
> *Açık kalem:* workflow `LC_ALL` set etmiyor, yani doğruluk runner locale'ine bağlı;
> `LC_ALL=C sort` yazılması EDGE'e bildirildi (`.github/workflows/**` onun şeridi).
>
> **Baseline ≠ tam şema dökümü.** `2026-08-13_public_schema.sql` kendi başlığında "trigger/RLS
> politikaları DAHİL DEĞİL" diyor ve içinde sıfır `create trigger` var. Bu yüzden "en yeni baseline
> yaşayan durumu tanımlar" varsayımı yanlış olurdu.
>
> **Açık kalem:** ilk üç tetiğin repoda hiçbir migration karşılığı olmaması gerçek bir drift riskidir —
> prod'da elle düşürülseler repo bunu göremez. Bunları idempotent bir migration'la repoya yazmak
> gerekir; migration prod'a otomatik uygulandığı için (CLAUDE.md kural 13) kullanıcı onayı ister.

### 3.1 Ana sayfa (`/[lang]`) — yüzeyden tabloya, ölçüm 2026-09-14 (REC-59 adım 2)

Yukarıdaki §3 tablosu **tablo başına** yazılmıştır: bir tablonun tetiği ve handler dalı var mı.
Bu alt bölüm ters yönü kapatır — **bir SAYFANIN gösterdiği her tablo o zincirde var mı.** İkisi
ayrı sorulardır ve 08-15 hatası tam bu boşlukta yaşadı.

Ana sayfanın RSC'si üç şey okur (`src/app/[lang]/page.tsx`, `getCachedHomeData`):

| Ana sayfada görünen | Kaynak | Tetik + handler | Ana sayfa etiketini tazeliyor mu |
|---|---|---|---|
| Kategori ızgarası (ad, açıklama, görsel, slug) | `categories` | `on_categories_change` + handler var | **EVET** — `revalidateTag(HOME_DATA_TAG)` |
| Öne çıkan 12 ürün kartı | `products` | `on_products_change` + handler var | **EVET** — `revalidateTag(HOME_DATA_TAG)`; ayrıca `UPDATE` dalında `homeDataTag(tenantId)` |
| Boş-kategori gizleme sayacı | `get_category_counts()` RPC → `products` + `categories` | üstteki iki tetik | **EVET** (türev; kendi tablosu yok) |

Yani ana sayfanın tazeleme borcu **YOKTUR**; ayrı kayıt açılmadı. `product_prices` dalının ana
sayfa etiketine bilerek dokunmaması kusur değil kuraldır: fiyat yalnız PDP'de görünür (§2), ana
sayfa kartları `hidePrice` geçer.

**⭐ETİKETİN İKİ UCU AYNI KİRACIYI SÖYLEMELİDİR.** Sayfa etiketi `homeDataTag(tenantId)` ile
kurar, webhook ise `tenantId`yi **DB satırından** okur. Sayfa bu değeri eskiden istek
başlığından alıyordu (`getTenantConfig()` → `headers()`); ikisi ayrışsaydı webhook bir etiketi
tazeler, sayfa başka etiketle önbelleklenmiş olurdu — **tazeleme ıskalar ve hata sessizdir.**
Sayfa artık `DEFAULT_TENANT_ID` derleme sabitini kullanıyor; sabitin canlı `tenants` satırıyla
birebir aynı olduğu prod SELECT ile ölçüldü (2026-09-09, tablo TEK satır).

**Sınıf değişimi ve kanıtı.** Ana sayfa `revalidate = 3600` beyan ediyordu ama beyan ÖLÜYDÜ:
canlı ölçüm (2026-09-14, `curl -I`) `/tr` ve `/en` için `Cache-Control: private, no-cache,
no-store` + `X-Vercel-Cache: MISS` verdi — yani §1'deki "statik + ISR" sınıfında görünüp
gerçekte **istek başına** üretiliyordu. Tek sebep `headers()` okumasıydı. Kaldırıldıktan sonra
`pnpm build` rota tablosu `● /[lang]` (`/tr`, `/en`) ve `Revalidate 1h` yazdı.

**Kapı:** `INV-ANASAYFA-STATIK-1`
(`src/__tests__/conformance/anasayfa-rotasi-statik.test.ts`) — `headers()`/`cookies()` çağrısını,
başlık okuyan modülün import'unu ve `searchParams` bağını ayrı ayrı yasaklar; `revalidate`
beyanının ve kiracı-kapsamlı önbellek anahtarı/etiketinin (kural 12) durduğunu ayrıca zorlar.
Sabotajla doğrulandı: eski desen geri konduğunda K2 ve K3 kırmızı yanıyor.

### 3.2 Ürünler listesi (`/[lang]/products`) — ölçüm 2026-09-14 (REC-59 adım 2 ikinci yarı)

Bu rota `revalidate` beyanı bile taşımıyordu ve **iki** sebeple dinamikti (her biri tek başına
yeterli): `getTenantConfig()` → `headers()`, ve gövdedeki `searchParams` (`?page=`).

| Ürünler listesinde görünen | Kaynak | Tetik + handler | Keşif etiketini tazeliyor mu |
|---|---|---|---|
| Aile kartları (47 satır, tek sayfa) | `product_families` + `products` | `on_product_families_change`, `on_products_change` | **EVET** — `revalidateTag(PRODUCTS_DISCOVERY_TAG)` |
| Kategori kapısı ızgarası | `categories` | `on_categories_change` | **EVET** |
| Boş-kategori gizleme sayacı | `get_category_counts()` RPC | üstteki tetikler | **EVET** (türev) |

Ana sayfanın etiketi (`HOME_DATA_TAG`) bilerek KULLANILMIYOR: bir yüzeyin tazelenmesi
ötekini sessizce ısıtır/soğuturdu (PS-042). Keşif yüzeyinin kendi etiketi var.

**Sayfalama kalktı, adres DEĞİŞMEDİ.** `?page=` ve `parsePageParam` kaldırıldı, `PAGE_SIZE`
24 → 72 yükseltildi. Ölçüm (prod SELECT, 2026-09-14): `product_families` = **47** satır, yani
tamamı tek sayfaya sığıyor. Eski `?page=2` adresi **bizim verdiğimiz sinyalde hiç yoktu**
(canlı `sitemap.xml`'de `page=` geçişi 0; üretici `src/app/sitemap.ts` böyle bir adres
yazmıyor). Google'ın kendi keşfiyle dizine almış olması **ölçülmedi** — kanonik adres
konduğu için risk oradan kapanır.

**Boyut (build çıktısı, `gzip -9`, 2026-09-14):** `/tr/products` **111 KB** (ham 488 KB),
`/en/products` 103 KB, 47 ailenin tamamı sayfada. Kabul edilen üst sınır ölçülenin 1,5 katı,
yuvarlanmış: **170 KB**. Karşılaştırma: `/tr/category/fanlar` (34 aile, aynı deseni 09-08'de
almıştı) canlıda 105 KB.

**REC-338 aynı PR'da kapandı:** rotanın `generateMetadata`'sı **hiç yoktu**. Canlı ölçüm
(2026-09-14): `/tr/products` ve `/en/products` HTML'inde `rel="canonical"` **0**, `<title>`
kök layout'un varsayılanı. Artık kendi başlığı (sözlükten, kural 7), kanonik adresi ve
`tr`/`en`/`x-default` hreflang üçlüsü var.

**Kapı:** `INV-URUNLER-STATIK-1` (`src/__tests__/conformance/urunler-rotasi-statik.test.ts`,
9 kol, AST). Sabotajla doğrulandı: eski desen geri konunca K3, K4, K5 ve K7 kırmızı yanıyor.

### 3.3 ⭐ROTA SINIFI İLANI — `force-static` bir üslup tercihi değil, ölçülmüş bir kaldıraç

Statik üretilen bir sayfada, çatıdaki `useSearchParams()` çağıran bileşenler (kök layout'taki
`<Analytics/>`, `ClientLayout` içindeki `NavigationTracker`) HTML'e
`BAILOUT_TO_CLIENT_SIDE_RENDERING` işareti bırakır. **Suspense bu işareti kaldırmaz, KAPSAR**
(`app/layout.tsx`'in kendi notu) — yani "daha çok Suspense" bir çözüm değildir.

Ölçüm (2026-09-14, tek build, 245 üretilmiş HTML):

| Rota | `dynamic = 'force-static'` | HTML'de bailout işareti |
|---|---|---|
| `/[lang]/about` | var | **0** |
| `/[lang]/category/[slug]` | var | **0** |
| `/[lang]` (ilan YOKKEN — 09-14 sabahı) | yok | **2** |
| `/[lang]/brands/[slug]` | yok | **2** |
| `/[lang]` (ilan EKLENDİKTEN sonra) | var | **0** |
| `/[lang]/products` | var | **0** |

Üçüncü satır bir **A/B ölçümüdür**: ana sayfa dosyasına tek satır eklenip aynı build
tekrarlandı ve işaret 2 → 0'a düştü. Değişen başka hiçbir şey yok.

**Ana sayfa ve ürünler rotası artık `about`/kategori ile TEK SINIFTA.** Geriye ilan taşımayan
tek vitrin sınıfı `brands` kaldı (aşağıdaki açık kalem).

> **İlan, ada bildirimini geçersiz kılmaz.** `ANASAYFA_BILINCLI_ADALAR` / `PDP_BILINCLI_ADALAR`
> listeleri **hangi adaların bilinçli olduğunu** söyler; `force-static` ise o adaların işaret
> BIRAKMAMASINI sağlar. İlan altında işaret 0 çıkması, ada bildiriminin yanlış olduğu anlamına
> gelmez — bildirim üst sınır olarak bekçi kalır ve yarın kazara doğacak üçüncü bir ada yine
> kırmızı verir. İkisi birbirinin yerine geçmez.

Ayırt edici değişken bileşenler değil, **sınıf ilanıydı**: `force-static` altında
`useSearchParams()` boş döner ve bailout üretmez. Vitrin sınıfına giren her yeni rota bu
satırı yazar; yazmazsa `admin-smoke` SSR kapısı (`e2e/ssr-html.e2e.ts`) kırmızı verir ve
o kırmızı **kapının tavanı büyütülerek kapatılmaz** — `tests/smoke/ssr-kurallari.ts`'in kendi
notu bunu açıkça yasaklıyor.

> **Açık kalem (marka sayfaları):** `/[lang]/brands/[slug]` hâlâ ilan taşımıyor ve 2 işaret
> üretiyor. Bugün kırmızı vermiyor çünkü o sınıfın kapı kuralı yok. Aynı satırın oraya da
> yazılması ayrı bir iştir; bu değişikliğin kapsamı dışında bırakıldı (kapsam, yetki değil).

### Prod doğrulaması (2026-08-15, `pg_trigger` sorgulandı)

Statik kapı repo SQL'ini denetler; **prod'un gerçekten aynı hâlde olduğu ayrıca ölçülmelidir.** Ölçüm:

| Tablo | Tetik | Etkin | `WHEN` | Fonksiyon `search_path` |
|---|---|---|---|---|
| `products` | `on_products_change` | ✅ | — | `pg_catalog, public, net` |
| `categories` | `on_categories_change` | ✅ | — | ✅ |
| `inventory_movements` | `on_inventory_movements_change` | ✅ | — | ✅ |
| `product_families` | `on_product_families_change` | ✅ | — | ✅ |
| `product_prices` | `on_product_prices_ins_del` | ✅ | — | ✅ |
| `product_prices` | `on_product_prices_upd` | ✅ | **var** | ✅ |

Üç sonuç: (1) §3 tablosu prod ile **birebir** — cetvel gerçeği anlatıyor; (2) 08-15 migration'ı doğru
uygulanmış, ayrık tetikler ve `WHEN` koşulu canlı; (3) `handle_supabase_webhook()` fonksiyonunun
`search_path` kilidi prod'da **duruyor** — yani kurulum betiklerindeki eksik `SET search_path`
teorik değil, çalıştırıldığında bu kilidi gerçekten düşürecek bir regresyondu.

**Kurulum SQL'i TEK KAYNAKTADIR: `scripts/webhook_setup.sql`.** `scripts/setup_webhooks.js` ve
`scripts/setup_webhooks_cli.js` bu dosyayı okuyup yalnız `REPLACE_WITH_ENV_SECRET`'i değiştirir;
kendi SQL kopyalarını **taşımazlar**.

Bu hâline üç turda gelindi ve yol öğreticidir. Başlangıçta aynı SQL üç yerde kopyalıydı ve **üçü de
yalnız ilk üç tetiği kuruyordu** — cetvel doğru, migration doğru, test yeşilken depo, 08-15 hatasını
yeni bir ortamda birebir yeniden kuran bir düğme taşıyordu; üstelik betik sonunda "Setup Completed
Successfully" yazıyordu (sahte başarı). Kopyaları tamamladım. Sonra "hangi kopya çalışıyor" sorusunu
statik olarak cevaplamayı denedim — o da kaçak verdi: tetikleri ölü bir değişkene taşımak, çağrıyı
`if (false)` dalına ya da yoruma almak kapıyı yeşil bırakıyordu. **Erişilebilirlik analizi metin
taramasıyla yapılamaz.** Kalıcı çözüm sorunun kendisini kaldırmak oldu: kopya yoksa "hangi kopya
güncel / hangisi çalışıyor" diye bir soru da yoktur.

**Kapı (`INV-RENDER-2`) bunu iki OLUMLU iddiayla zorlar** — olumsuz bir "kopya yok" iddiası yetmiyordu
(SQL'i başka bir dosyaya taşımak, betiğe başka bir `.sql` okutmak ya da kurulumu tamamen silmek
üçünde de yeşil kalıyordu):
1. `scripts/**` altında webhook tetiği kuran dosya kümesi **tam olarak** `webhook_setup.sql` olmalı.
2. Her kurulum betiği o dosyayı `readFileSync` ile okumalı ve bir yürütme çağrısına beslemeli.

**Migration eklerken kurulum kaynağı da güncellenir — ikisi ayrı kaynaktır.**

**Denetim notu (2026-08-15) — üç pas, beş sessiz-yeşil.** Bu kapının ilk iki sürümü denetimden
geçemedi. Bulunanların hepsi *kanıtlanmış* yanlış-negatiftir (bozma yapılıp test yeşil kaldığı
ölçülmüştür), koda bakarak "doğru görünüyor" demekle hiçbiri bulunamazdı:

| # | Kaçak | Nasıl gizliyordu |
|---|---|---|
| 1 | Keşif-kapısı koşulu (`table === 'a' \|\| table === 'b'`) handler dalı sanılıyordu | Gerçek `product_prices` bloğu silinebiliyordu |
| 2 | SQL düz `;` ile bölünüyordu (dollar-quote yok) | Fonksiyon gövdesinde **metin olarak** geçen `create trigger` gerçek sayılıyordu |
| 3 | Kurulum taraması dosyadaki **metne** bakıyordu | Tetikleri ölü bir `legacySql` değişkenine taşımak yetiyordu — 2'nin JavaScript boyutu |
| 4 | İç içe blok yorumu (`/* … /* … */ … */`, PG §4.1.5) | "Bloğu yorum yaparak kapatma" — en sık devre-dışı bırakma biçimi — görünmezdi |
| 5 | Tarihsiz migration adı | `hotfix_drop_*.sql` en başa sıralanıp `drop`'u hiçbir şeye denk gelmiyordu |

Ayrıca `table === "x"` (çift tırnak) bir öksüz handler'ı kaçırıyordu — repoda `quotes` lint kuralı
ve Prettier yapılandırması yok, yani çift tırnak meşru bir yazım.

**Ders: statik tarayıcının yanlış-negatifi, kapının hiç olmamasından daha kötüdür — çünkü yeşil
ışık güven üretir.** Yeni bir INV-* kapısı, en az bir kez *kendi kaçak senaryosu üretilerek*
çürütülmeden kapı sayılmaz.

**Yan bulgu — kurulum güvenlik sertleştirmesini geri alıyordu.** Betikler
`CREATE OR REPLACE FUNCTION … SECURITY DEFINER` yazıyor ama `SET search_path` yazmıyordu.
`CREATE OR REPLACE` fonksiyonun TÜM özniteliklerini yeniden yazar; `SET` yoksa `proconfig`
**silinir** ve `20260602070000_security_hardening.sql` ile getirilen kilit düşer — prod ölçümü
(yukarıda) o kilidin gerçekten durduğunu gösterdi, yani teorik değil canlı bir regresyondu.
Tek kaynağa `SET search_path = pg_catalog, public, net` eklendi (prod'daki canlı hâlle aynı);
sözdizimi gerçek bir PostgreSQL 17.4 kümesinde koşturularak doğrulandı (`prosecdef=t`,
`proconfig` dolu).

**Yan bulgu 2 — betikler `process.cwd()`'ye bağlıydı.** Repo kökü dışından koşulduklarında
`.env` + `.env.local`'i **yanlış dizine yazdıktan** ve prod DB'ye bağlanıp `CREATE EXTENSION`
çalıştırdıktan *sonra* patlıyorlardı: yan etki, ön koşul doğrulanmadan gerçekleşiyordu. Tüm yollar
artık betiğe göre (`import.meta.url`) çözülüyor ve `cli.js` gizli anahtarı üretmeden önce tek
kaynağın varlığını doğruluyor.

## 4. Bilinen sınırlar (dürüstçe)

- **Toplu fiyat yazımı = satır başına webhook.** Tetikler `FOR EACH ROW`; materialize 1044 satırı
  birden yazar. `UPDATE` tetiğinde `WHEN` koşulu **değişmeyen** satırları eler (asıl gürültü
  kaynağı buydu), ama fiyatların gerçekten hepsi değişirse (kur hareketi) tek tıkla ~1044 webhook
  ateşlenir ve bunlar yalnız ~32 aile yolunu tazeler. İşe yarar ama israf; toplu-değişimi tek
  çağrıya indirmek (statement-level tetik ya da materialize sonrası tek toplu tazeleme) açık kalemdir.
- **PPR hiç açılmadı** (*"kapatıldı" değil — `experimental.ppr` `next.config.mjs`'te hiçbir zaman
  olmadı*). Bugün olan şey SSG + Suspense streaming'dir; kuralın kendisi (Suspense sınırı) aynen
  geçerli, değişen yalnız yanlış adlandırmaydı. **Temizlenen yerler:** `CLAUDE.md` (yığın satırı +
  kural 5 başlığı) · `CONTEXT.md` (yığın tablosu notu + §14 madde 14 başlığı) · `README.md`
  (yığın tablosu + özellik maddesi — PPR'ı *sevk edilmiş özellik* diye pazarlıyordu) ·
  `public/llms.txt` (yeni ajanların onboarding SSOT'u) · `docs/standards/collaboration-protocol.md`
  (kural özeti). **Kalan:** `.claude/skills/venthub-architecture/` + `.agent/` ikizi hâlâ "PPR config"
  tetikleyicisiyle açılıyor ve kasten yok olan bir özelliğin kurulumunu öğretiyor; üretilmiş
  `docs/venthub_hvac_master.md` kopyaları kaynak (README) düzeldiği için sonraki sync'te düşer.
- **Webhook URL/secret'ı `handle_supabase_webhook()` gövdesinde literal** (env değil).
  Ortam değiştiğinde fonksiyon elle güncellenmeli.
- **Aile slug'ı her tetikte ayrı SELECT ile çözülüyor** (N+1). Mevcut desen; hacim artarsa
  toplu çözüm gerekir.

---

> v1.0 · 2026-08-15 · Bu cetvelin doğuş sebebi ölçülmüş bir olaydır, teorik bir tercih değil:
> fiyatlar yazıldı, sayfa değişmedi, sebebi görünmedi çünkü kuralı yazan bir yer yoktu.
