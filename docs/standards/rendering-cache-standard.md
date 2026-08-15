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
| `products` | `on_products_change` | var | **aile** PDP yolu + (alan-duyarlı) keşif tag'leri |
| `categories` | `on_categories_change` | var | kategori yolları |
| `inventory_movements` | `on_inventory_movements_change` | var | **aile** PDP yolu + kategori yolu (**keşif'e dokunmaz** — PS-042) |
| `product_families` | `on_product_families_change` | var | aile PDP yolu + keşif tag'leri |
| `product_prices` | `on_product_prices_ins_del` + `on_product_prices_upd` (`WHEN`) | var | **yalnız** o ürünün aile PDP yolu — keşif tag'lerine DOKUNMAZ (PS-042) |

> **PDP AİLE KANONİKTİR** (`/[lang]/products/[family-slug]`). Yol tazelenirken **ürün** slug'ı
> kullanmak sessiz bir kaçaktır: prerender edilmiş yol aile slug'ı olduğu için var olmayan bir
> yol geçersiz kılınır ve sayfa hiç yenilenmez. `products` ve `inventory_movements` dalları tam
> bunu yapıyordu (2026-08-15 denetimi yakaladı); üçü de artık tek yardımcıdan (`familySlugById`)
> çözüyor.
>
> **`revalidateTag` yalnız o tag'i tüketen bir `unstable_cache` varsa iş görür.** `familyTag`'in
> tüketicisi yoktu → çağrı sessiz no-op'tu. PDP verisi `React.cache()` ile sarılı olduğundan
> PDP için etkili olan **`revalidatePath`**'tir.

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
> `create`/`drop` etkilerini **kronolojik** uygulayarak (dosya adındaki tarihe göre; grup grup değil)
> yaşayan durumu hesaplar.
>
> **Baseline ≠ tam şema dökümü.** `2026-08-13_public_schema.sql` kendi başlığında "trigger/RLS
> politikaları DAHİL DEĞİL" diyor ve içinde sıfır `create trigger` var. Bu yüzden "en yeni baseline
> yaşayan durumu tanımlar" varsayımı yanlış olurdu.
>
> **Açık kalem:** ilk üç tetiğin repoda hiçbir migration karşılığı olmaması gerçek bir drift riskidir —
> prod'da elle düşürülseler repo bunu göremez. Bunları idempotent bir migration'la repoya yazmak
> gerekir; migration prod'a otomatik uygulandığı için (CLAUDE.md kural 13) kullanıcı onayı ister.

**Kurulum betikleri de bu sözleşmeye tabidir.** `scripts/webhook_setup.sql`,
`scripts/setup_webhooks.js` ve `scripts/setup_webhooks_cli.js` sıfırdan bir ortamda webhook
altyapısını kurar. 2026-08-15 denetimine kadar **üçü de yalnız ilk üç tetiği kuruyordu** — yani
cetvel doğru, migration doğru, test yeşilken depo, 08-15 hatasını yeni bir ortamda birebir yeniden
kuran bir düğme taşıyordu; üstelik betik sonunda "Setup Completed Successfully" yazıyordu (sahte
başarı). Üçü de tamamlandı ve `INV-RENDER-2`'nin ayrı bir iddiası artık bunları da denetliyor.
**Migration eklerken kurulum betikleri de güncellenir — ikisi ayrı kaynaktır.**

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

**Yan bulgu — kurulum betikleri güvenlik sertleştirmesini geri alıyordu.** Üç betik de
`CREATE OR REPLACE FUNCTION … SECURITY DEFINER` yazıyor ama `SET search_path` yazmıyordu.
`CREATE OR REPLACE` fonksiyonun TÜM özniteliklerini yeniden yazar; `SET` yoksa `proconfig`
**silinir** ve `20260602070000_security_hardening.sql` ile getirilen kilit düşer. Üçüne de
`SET search_path = pg_catalog, public, net` eklendi (prod'daki canlı hâlle aynı).

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
