# REC-108 — Aile adı dil zinciri (planı)

**Şerit:** URUN · **Tarih:** 2026-09-01 · **Durum:** PLAN — uygulanmadı, merge edilmedi.

**KAYNAK/CETVEL (CLAUDE.md kural 1):**

- `docs/standards/product-schema-standard.md` — MODEL/AİLE katmanı sözleşmesi
- `docs/standards/rendering-cache-standard.md` — hangi yüzey nasıl üretilir, veri değişince ne tazelenir
- `CLAUDE.md` kural 7 (i18n), kural 13 (migration = prod)
- ⭐**Cetvel boşluğu:** "DB'den gelen METİN hangi dilde çözülür" sorusunun tek bir cetveli YOK.
  Kategori adı için kural var (`getCategoryDisplayName`, slug-localization planı); AİLE ve
  VARYANT adı için yok. Bu planın kapsamı cetveli yazmayı da içerir → §6.
- **Tazelik:** aşağıdaki bütün sayılar 2026-09-01'de ölçüldü.

---

## 1) Olgu — ölçülmüş, hipotez değil

Recep'in ekran görüntüsünde İngilizce ürün sayfasının kırıntı yolu şuydu:
`HOME › AIR TREATMENT › ELECTRIC DUCT HEATERS › AVENS ELEKTRIKLI KANAL ISITICILARI`.
İlk üç basamak İngilizce, dördüncü Türkçe. Dördüncü basamak **aile adı**.

Kök (kaynak okunarak):

- `supabase/migrations/20260814_pricing_w4b_display_price.sql` içinde `get_family_detail`
  **satır 8**'de `p_lang`'ı çözüyor (`case when p_lang in ('tr','en') ...`) ve AÇIKLAMA
  için kullanıyor. **Satır 13: `'name', f.name`** — ham kolon, dil dalı YOK.
  Varyant adı da aynı: **satır 32 `'name', p.name`**.
- `product_families.name_i18n` kolonu `20260823120000` + `20260823130000` ile
  oluşturuldu ve DOLDURULDU: **40 aileden 31'i dolu**.
- Buna karşılık: RPC'lerde `name_i18n` referansı **0**, `src/` içinde okuyan kod **0**
  (yalnız üretilmiş `src/types/database.types.ts`'te tip olarak var).

⭐**Sınıf:** "iş bitti != iş erişilebilir". DB ayağı inmiş, istemci hiç bağlanmamış.
Hiçbir kapı bunu görmedi çünkü her kapı TEK KATMANA bakıyor; kusur katmanlar ARASINDA.

**İçerik durumu (REC-109 ile örtüşür, ayrı iş):** 40 ailenin 9'unda EN ad YOK,
1'inde YANLIŞ (`vortice-vort-industrial-ventilation-roof`: EN adı ürünün değil katalog
bölüm yolunun adı). Bu plan **tesisatı** kurar; içerik REC-109'un işi.
⭐Tesisat içeriksiz de değerlidir: 31 aile bugün doğru adı gösterebilir hâle gelir.

## 2) Evren — aile adı hangi yüzeylerden çıkıyor (TAM sayım)

Yalnız `get_family_detail`'a bakmak "ölçüt keskin ama evren yanlış" tuzağıdır. Sayım:

**A. RPC yolu (SQL değişikliği gerektirebilir)**

| RPC | Son tanım | Ne gösteriyor | Faz 1 gömmesi mümkün mü |
|---|---|---|---|
| `get_family_detail` | `20260814_pricing_w4b...:152` | PDP — **AİLE adı** | ✅ `family.id` döner |
| `get_product_families_enriched` | `20260814_pricing_w4b...:89` | listeler / kategori — **AİLE adı** | ✅ `id` döner |
| `fts_search_products` | `20260814_search_fts_family_slug.sql:24` | arama sonucu — **ÜRÜN adı** | ❌ kapsam dışı, aşağı bak |
| `get_search_suggestions` | `20260826220000...:58` | arama kutusu — **ÜRÜN/KATEGORİ/MARKA adı** | ❌ kapsam dışı, aşağı bak |

⭐**BU TABLONUN İLK HÂLİ YANLIŞTI — plan-challenger düzeltti.** Dört satıra da "evet, `id`
döndürüyor" yazmıştım; bunu ÖLÇMEDEN, desenden çıkarmıştım. Ölçünce:

- `fts_search_products` `returns table(id uuid, name text, sku, brand, price, rank,
  family_slug, cover_image_path)` — buradaki `id` **ÜRÜN** id'si, `name` **ÜRÜN** adı.
  Aile adı hiç dönmüyor (`family_slug` var, ad yok). Ürün adının `name_i18n` kolonu
  **hiç yok** → bu yüzey Faz 1 ile ÇÖZÜLEMEZ, REC-110'a aittir.
- `get_search_suggestions` `returns table(type, label, url, metadata)` — `label`
  **sunucuda kurulmuş hazır metin** (`p.name`, `c.name`, `p.brand`). Gömülecek bir id
  yok; fonksiyonun **`p_lang` parametresi bile yok**, yani hiçbir şeyi yerelleştiremez.

Ders: "aynı ailedeki fonksiyonlar aynı şeyi döndürür" bir varsayımdır, ölçüm değil.

**B. Doğrudan tablo yolu (PostgREST `.select` — MIGRATION YOK)**

- `src/lib/services/family.service.ts:212,227` — `getSeriesLanding` (seri + modeller)
- `src/lib/services/family.service.ts:317,330`
- `src/lib/data/preload.ts:55`
- `src/lib/services/wizard.service.ts:112`
- (`src/app/api/webhook/supabase/route.ts` — okuma değil tazeleme; kapsam dışı)

⭐B kolunda değişiklik `.select('id,name,...')` listesine `name_i18n` eklemekten ibarettir.

## 3) İki seçenek ve NİÇİN A DEĞİL C

**Seçenek A — RPC'ler dili kendi çözsün** (`'name', coalesce(f.name_i18n->>lang, f.name)`).

**Seçenek C — RPC'ler değişmesin; ad, `id` üzerinden TEK EK SORGUYLA gömülsün** ve dil
TypeScript'te tek giriş noktasında çözülsün.

C'yi öneriyorum. Gerekçeler ölçülmüş:

1. ⭐**`get_product_families_enriched` bir `returns table(...)` fonksiyonu.** PostgreSQL
   `create or replace` ile dönüş tipini DEĞİŞTİRMEZ ("cannot change return type of
   existing function") — önce `drop function` gerekir. Drop, bağımlıları da düşürür.
   Yani A, göründüğünden çok daha pahalı ve geri alması zor bir işlem.
2. ⭐**Yeniden tanımlama alan düşürme riski taşır.** `get_family_detail` bugüne dek İKİ
   kez yeniden tanımlandı (`20260812` → `20260814`). Üçüncü tanım, önceki migration'ın
   eklediği HER alanı elle taşımak zorunda. `FamilyDetail` arayüzündeki kendi yorumumuz
   bunu zaten uyarıyor: *"alan taşınmazsa PDP fiyatının KDV durumu hakkında hiçbir bilgi
   kalmaz (regresyon)"* (`price_tax_included`). Bir dil dalı için 70 satırlık fonksiyonu
   yeniden yazmak, kazandığından fazlasını riske atar.
3. **Desen zaten depoda ve aynı gerekçeyle yazılmış.** `getFamilyDetail` satır 119-142
   kategori SATIRLARINI tam bu şekilde gömüyor; yorumu birebir şunu diyor: *"RPC yalnız
   id döndürüyor; satırlar burada tek ek sorguyla gömülür."* C, yeni bir desen icat
   etmiyor — var olanı ikinci bir alana uyguluyor.
4. **Migration yok → prod DB'ye dokunmuyor → şerit kendi başına indirebilir.** A, kural
   13 gereği Recep onayı + otomatik prod uygulaması demek.

**C'nin DÜRÜST SINIRI (gizlenmiyor):** C **gösterimi** düzeltir, **arama eşleşmesini**
düzeltmez. `get_product_families_enriched` filtreyi sunucuda kuruyor
(`f.name ilike '%' || q || '%'`) — İngilizce bir terim Türkçe aile adıyla eşleşmez ve C
bunu değiştiremez. Arama eşleşmesi Faz 2'dir ve migration ister.

## 4) Faz 1 — migration YOK (bu planın uygulanacak kısmı)

1. **Tek giriş noktası:** `src/lib/i18n/familyName.ts` →
   `familyName(family: { name: string; name_i18n?: unknown }, lang: string): string`.
   Kural: `name_i18n[lang]` doluysa o, değilse `name`. Boş dize dolu SAYILMAZ.
   (Kategori tarafındaki `getCategoryDisplayName` ile aynı felsefe; ikisi kardeş.)
2. **B kolu:** dört `.select` listesine `name_i18n` eklenir.
3. **A kolu (yalnız `get_family_detail` + `get_product_families_enriched`):** RPC
   dönüşünden sonra, dönen `id` kümesi için `product_families`'tan `id,name_i18n` tek
   sorguyla çekilir ve `Map` ile gömülür — `getFamilyDetail`'ın kategori deseninin birebir
   aynısı. Hiç id yoksa hiç sorgu atılmaz.
   ⭐**B2 kısıtı:** servis katmanı `name_i18n`'i yalnız TAŞIR, ÇÖZMEZ. Çözüm render
   anında olur; böylece `unstable_cache` içeriği dilden bağımsız kalır ve
   `getFamiliesEnriched` imzası değişmez.
4. **Render:** PDP başlık/H1, kırıntı yolu 4. basamağı, JSON-LD `name`, liste kartları,
   seri landing model kartları — hepsi `familyName()` çağırır.
   ⭐**Arama yüzeyleri KAPSAM DIŞI** (B1): orada basılan şey ürün adıdır, aile adı değil.
5. **Kapı `INV-AILE-ADI-1`** (`src/__tests__/conformance/aile-adi-tek-kaynak.test.ts`):
   - ⭐**AST** ile ölçülür, metin taraması DEĞİL. (Bu sınıf 2026-09-01'de dört kez
     yaşandı: `readFileSync(...).includes(...)` kendi açıklama yorumumu bulguya saydı.)
   - Kol 1: vitrin ağacında `family.name` ham render YASAK — çözüm `familyName()`.
   - Kol 2: `familyName` çağıran her yer `lang` bildirir (atlanamaz).
   - Kol 3: aile adı döndüren her servis `name_i18n` alanını taşır (`.select`
     listesinde ya da gömme adımında) — yoksa tek giriş noktası boşa çalışır.
   - Kol 4: ⭐**BOŞLUK MUHAFIZI** — ölçülen çağrı sayısı > 0. Kol 1-3 yeşil ama sayım
     sıfırsa kapı sahte-yeşildir.
   - Kol 5: ⭐**İKİ YÖNLÜ** — `name_i18n.en` DOLU kurguda EN adın döndüğü, BOŞ kurguda
     TR ada düşüldüğü AYRI AYRI doğrulanır. Tek yönlü kol, fallback'i sessizce her şeye
     uygulayan bir hatayı göremez.
6. **Sabotaj testi:** kapı yazıldıktan sonra DEĞİL, **birleştirilmiş son kod üzerinde**
   koşulur. (2026-09-01 dersi: aynı PR render'ı veri-güdümlü yaptı, kapının topladığı
   çağrı biçimi değişti, sabotaj yeşil geçti.)
7. **Canlı ölçüm (merge kanıt değil):** EN ürün sayfalarında kırıntı yolunun 4. basamağı
   + `<h1>` + JSON-LD `name` sayımı. Taban merge ÖNCESİ alınır, sonra tekrar sayılır.
   Betiğe "0 adres çekildi = ÖLÇÜM GEÇERSİZ" kolu konur.

## 5) Faz 2 — MIGRATION (ayrı iş, Recep onayı ŞART, bu planla merge EDİLMEZ)

Kapsam: **arama eşleşmesinin** iki dilde çalışması. (Arama sonuçlarının GÖSTERİMİ değil —
o REC-110'dur; B1'e bak.)

- `get_product_families_enriched` filtresine `f.name_i18n->>lang` dalı; ve/veya
  `fts_search_products` sözlüğüne EN ad eklenmesi.
- ⭐`returns table(...)` dönüş tipi değişecekse `drop function` gerekir; bağımlı nesneler
  önce sayılmalı (`pg_depend`). Dönüş tipi değişmiyorsa `create or replace` yeter —
  hangisi olduğu **ölçülmeden** migration yazılmaz.
- Yeniden tanımda `price_tax_included`, `display_price`, `cover_image_path`,
  `total_count` alanlarının TAŞINDIĞI satır satır doğrulanır.
- Merge = prod'a otomatik uygulama (kural 13). Onay Recep'ten, sunumu OPS yapar.

**REC-110 ile ilişki:** varyant adı için `products.name_i18n` kolonu **YOK** (ölçüldü:
`ERROR 42703 column p.name_i18n does not exist`). Yani varyant adı Faz 1 ile ÇÖZÜLEMEZ;
o ayrı bir şema işidir (REC-110) ve orada C seçeneği yoktur — gömülecek veri yoktur.

## 6) Cetvel borcu (kural 1 gereği bu işin kapsamında)

`docs/standards/db-metin-dil-cozumu-standard.md` yazılacak: DB'den gelen HER metnin
(kategori adı, aile adı, varyant adı, açıklama, meta) dilinin nerede çözüldüğü, hangi alan
biçiminin (JSONB `{tr,en}` vs `metadata->>lang` vs `name_i18n`) kullanıldığı, ve "yeni bir
DB metni eklerken hangi kapı bunu görür" sorusunun cevabı. Bugünkü kusur tam bu cetvelin
yokluğunda yaşadı: kolon açıldı, dolduruldu, kimse bağlamadı, hiçbir kapı sormadı.

## 6.5) PLAN-CHALLENGER BULGULARI (2026-09-01, planın kendi üzerinde koşuldu)

**Yöntem sapması — yazıyorum:** cetvel (A2) çürütmenin BAĞIMSIZ bir alt-ajana
yaptırılmasını ister (üretici ≠ yargıç). Bu oturumun ayarı alt-ajan çağırmayı kullanıcı
istemedikçe yasaklıyor ve akran isteği kullanıcı izni yerine geçmez. Bu yüzden çürütme
oturum içinde koşuldu; **bağımsızlık ayağı EKSİK**, Recep isterse ayrıca koşulmalı.
Aşağıdaki dört bulgu buna rağmen planı maddeten değiştirdi.

**B1 (KRİTİK — kabul edildi, plan değişti).** §2 tablosunun ilk hâli dört RPC için de
"`id` döndürüyor" diyordu; ikisi yanlıştı. Arama yüzeyleri AİLE adı değil ÜRÜN adı
basıyor, ve `products.name_i18n` kolonu YOK. Faz 1'in kapsamı daraldı: **PDP + listeler +
seri landing**. Arama, REC-108'in işi değil.

**B2 (YÜKSEK — plana kısıt olarak eklendi).** "Dil TypeScript'te çözülür" cümlesi iki
türlü okunabiliyordu ve biri tehlikeliydi. `src/app/[lang]/category/[categorySlug]/page.tsx`
liste verisini `unstable_cache` içinde tutuyor; anahtar `['category-families', lang,
tenantId, categoryId, page]` — `lang` ZATEN anahtarda (kural 12 ihlali yok). Ama önbelleğe
GİREN veri bugün dilden bağımsız. Çözümü servis içine koyarsak önbellek içeriği dile
bağımlı hale gelir ve `getFamiliesEnriched` imzası `lang` almak zorunda kalır.
⭐**Kısıt:** servis katmanı `name_i18n`'i yalnız **TAŞIR**; dil çözümü **render anında**
`familyName()` ile yapılır. Böylece önbellek dilden bağımsız kalır, tek anahtar iki dile
hizmet eder ve imza değişmez.

**B3 (ORTA — dürüst sınır olarak yazıldı).** `getSeriesLanding` model listesini
`.order('name')` ile sunucuda sıralıyor. Faz 1 sonrası EN sayfada adlar İngilizce görünür
ama **sıralama Türkçe ada göre** kalır. Kusur değil, bilinen sınır; düzeltmesi ya istemci
sıralaması ya Faz 2.

**B4 (YÜKSEK — YENİ KUSUR, REC-108'in dışında).** `get_search_suggestions` öneri
etiketini `c.name::text AS label` ile kuruyor — **ham kategori adı**, yani REC-103'te
kapattığım kusurun beşinci yüzeyi. Fonksiyonun `p_lang` parametresi yok, yerelleştirmesi
fiziken mümkün değil. ⭐Bugün yazdığım `INV-KATEGORI-ADI-1` kapısı bunu GÖREMEZ: kapı
TypeScript kaynağını AST ile tarıyor, bu kusur ise SQL'de yaşıyor. "Her kapı tek katmana
bakar, kusur katmanlar arasında yaşar" sınıfının aynı gün içindeki üçüncü örneği.
Arama kutusunda EN dilde Türkçe kategori adı görünüyor. **Ayrı iş emri gerekir** —
migration ister (fonksiyona `p_lang` eklenmesi = imza değişikliği = `drop` + `create`).

**Doğrulanan (itiraz düştü):** aile değişiminde tazeleme yolu SAĞLAM. Tetik
`on_product_families_change` kolon listesi olmadan `after insert or delete or update`
kuruluyor, yani `name_i18n` yazımı da tetikler; webhook dalı hem `/tr/products/<slug>`
hem `/en/products/<slug>` yolunu `revalidatePath` ile tazeliyor, seri zinciri de
yürünüyor, liste sayfaları `PRODUCTS_DISCOVERY_TAG` ile bayatlanıyor. REC-109 içeriği
yazıldığında vitrin sessiz kalmaz. (Bu tam olarak 2026-08-15'te 1044 fiyat satırının
düştüğü tuzaktı; bu yolda kapalı.)

## 7) Riskler

| Risk | Neden gerçek | Karşılık |
|---|---|---|
| Ek sorgu maliyeti | PDP başına 1 sorgu daha | Sayfalar SSG/ISR — maliyet build'de, istekte değil; kategori gömme zaten aynısını yapıyor |
| 9 ailede EN ad yok | fallback TR ada düşer | Kusur DEĞİL, mevcut davranış; REC-109 içeriği getirince kendiliğinden düzelir |
| Fallback'in sessizce her şeyi TR yapması | tek yönlü kapı bunu görmez | Kol 5 (iki yönlü) |
| Arama hâlâ tek dilde | C'nin dürüst sınırı | §3'te yazıldı, Faz 2'ye devredildi |
| `name_i18n` boş dize | "dolu" sanılır | `familyName` boş dizeyi dolu saymaz (§4.1) |
| Gömme adımı unutulan bir RPC | o yüzey sessizce TR kalır | Kol 3 + §2'deki TAM sayım listesi |
