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
| **Statik + talep-üzerine ISR** | `generateStaticParams()`, `revalidate` yok, tazeleme webhook ile | Vitrin: ana sayfa · kategori · alt kategori · marka · ürün (PDP) · destek konuları | LCP/SEO. Bu sayfalar herkese aynı; istek başına üretmek israf |
| **Tam statik** | `export const dynamic = 'force-static'` | Yasal metinler · hakkımızda · iletişim | İçerik deploy dışında değişmez |
| **Dinamik** | `export const dynamic = 'force-dynamic'` | Admin/** · hesap/** · API rotaları | Kullanıcıya/oturuma özel; önbelleklenirse veri sızar |

**`ssr: false` ana rotalarda YASAK** (CLAUDE.md kural 4). İstemci-tarafı veri gerektiren
parçalar `<Suspense fallback={<Skeleton/>}>` ile akıtılır, sayfanın tamamı CSR'a düşürülmez.

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
| `products` | `on_products_change` | var | ürün yolu + (alan-duyarlı) keşif tag'leri |
| `categories` | `on_categories_change` | var | kategori yolları |
| `inventory_movements` | `on_inventory_movements_change` | var | ürün + kategori yolu (**keşif'e dokunmaz** — PS-042) |
| `product_families` | `on_product_families_change` | var | aile yolu |
| `product_prices` | `on_product_prices_change` | var | **yalnız** o ürünün PDP yolu — keşif tag'lerine DOKUNMAZ (PS-042) |

Tetik fonksiyonu `public.handle_supabase_webhook()` jeneriktir (`TG_TABLE_NAME` ile tabloyu
kendi okur) — yeni tablo eklemek yalnız `create trigger` demektir.

**Kapı:** yukarıdaki tablo, `INV-RENDER-1`'in kapsamına alınmalıdır (dördüncü/beşinci tablo
eklendiğinde test uyarsın).

## 4. Bilinen sınırlar (dürüstçe)

- **Zaman-tabanlı yedek yok.** Hiçbir rotada `export const revalidate` yok; bir webhook kaçarsa
  sayfa **sonsuza dek** eski kalır ve bunu hiçbir şey söylemez. Vitrin rotalarına yedek
  `revalidate` eklenmesi açık kalemdir.
- **PPR kapalı.** `CONTEXT.md` ve CLAUDE.md yığın tablosu "PPR" diyor; `next.config.mjs`'te
  `experimental.ppr` **yok**. Bugün olan şey SSG + Suspense streaming'dir. Ya açılmalı ya
  dokümandan çıkarılmalı — ikisinden biri yalan söylüyor.
- **Webhook URL/secret'ı `handle_supabase_webhook()` gövdesinde literal** (env değil).
  Ortam değiştiğinde fonksiyon elle güncellenmeli.
- **Aile slug'ı her tetikte ayrı SELECT ile çözülüyor** (N+1). Mevcut desen; hacim artarsa
  toplu çözüm gerekir.

---

> v1.0 · 2026-08-15 · Bu cetvelin doğuş sebebi ölçülmüş bir olaydır, teorik bir tercih değil:
> fiyatlar yazıldı, sayfa değişmedi, sebebi görünmedi çünkü kuralı yazan bir yer yoktu.
