# Arama Cetveli (`arama-standard.md`)

> **Bu cetvel neyi yönetir:** müşterinin sitede bir şey araması — ne aranır, nasıl normalize
> edilir, ne bulunur, ne sırayla gösterilir, hangi yüzeyde görünür ve hangi kapı ölçer.
>
> **Niçin var:** 2026-09-15'te ölçüldü — dokuz gerçek aramanın **beşi tam sıfır** dönüyordu ve
> **hiçbir kapı bunu görmüyordu**. 76 cetvelin hiçbiri aramayı yönetmiyordu. Arama, hata yapmanın
> serbest olduğu tek yüzeydi. Bu dosya o boşluğu kapatır.
>
> **Sahibi:** URUN şeridi. (Ölçüm: `docs/standards/*.md` ekleyen commit'lerin şerit öneki —
> URUN 11, ALTYAPI 6, OPS 3; konu sahibi kendi cetvelini yazar, claim dizin değil **dosya**
> düzeyindedir. OPS teyit etti 2026-09-15.)
>
> **İlgili cetveller:** `product-schema-standard.md` (aranan alanların kaynağı) ·
> `category-taxonomy-standard.md` (kategori adı/slug SSOT) · `denetim-izi-standard.md` ·
> `rendering-cache-standard.md` (yalnız arama **sayfası** için — overlay için değil, §2).

---

## 1. Kapsam ve yüzeyler

Sitede arama **üç** yüzeyde yaşar. Üçü de bu cetvele tabidir.

| # | Yüzey | Nerede | RPC | Bugünkü tavan |
|---|---|---|---|---|
| Y1 | Öneri kutusu | `SearchOverlay`, yazarken | `get_search_suggestions` | 4 ürün + 2 kategori + 2 marka |
| Y2 | Tam arama listesi | `SearchOverlay`, Enter | `fts_search_products` | 20 satır (istemcide) |
| Y3 | Arama sonuç sayfası | **henüz yok**, Recep kararı 2026-09-15 ile açılacak | Y2 ile aynı gövde | sayfalama |

**Dördüncü bir RPC daha var:** `admin_search_products`. Admin yüzeyi müşteri aramasından ayrı bir
sorundur ve **bu cetvelin kapsamı dışındadır** — ama var olduğu burada yazılıdır ki "iki RPC"
diye sayılmasın.

**K1.1** — Yeni bir arama yüzeyi eklenirse bu tabloya satır eklenir. Tabloda olmayan yüzey
kapısızdır ve kapısız yüzey sessizce bozulur.

## 2. Hangi cetvel neyi yönetir (yanlış atıf yapılmasın)

**K2.1** — Y1 ve Y2 **istemci tarafı** yüzeylerdir (`SearchOverlay`, `ssr: false`). Bunlar statik
vitrinde görünmez, bu yüzden `rendering-cache-standard.md`'nin *"statik vitrinde görünen her
tablonun DB tetiği + webhook handler dalı olmalı"* kuralı **bunlara uygulanmaz.**

**K2.2** — Y3 (arama sonuç sayfası) bir rotadır ve `rendering-cache-standard.md`'ye **tabidir**:
rota sınıfını ilan eder, önbellek anahtarı `lang` ve `tenantId` içerir.

*(Niçin bu ayrım yazılı: REC-340 Faz 1 planının ilk sürümü overlay'i sayfa sanıp yanlış cetvele
atıf yaptı. Atıf yanlışsa kural da yanlış yere uygulanır.)*

## 3. Aranan ALAN kümesi (SSOT)

**K3.1** — Bir ürün şu alanların birleşiminden aranır. Liste burada tutulur; kodda ikinci bir
liste tutulmaz.

| Alan | Kaynak | Diller | Ağırlık |
|---|---|---|---|
| Ürün adı | `products.name` | — | **A** |
| Ürün adı (çeviri) | `products.name_i18n` | TR + EN | **A** |
| Model kodu | `products.model_code` | — | **B** |
| SKU | `products.sku` | — | **B** |
| Marka | `products.brand` | — | **B** |
| **Aile adı** | `product_families.name` + `name_i18n` | TR + EN | **C** |
| **Üst kategori adı** | `categories.name` (üzerinden `products.category_id`) | TR | **D** |
| **ALT kategori adı** | `categories.name` (üzerinden `products.subcategory_id`) | TR | **D** |
| Açıklama | `products.description_i18n` | **TR + EN** | **D** |
| Teknik özellikler | `products.technical_specs` | — | **D** |

**K3.1a — AĞIRLIK ZORUNLU, SÜS DEĞİL (2026-09-16 ölçümü).** Kategori adı gövdeye girince tek
kelimelik genel sorgular çok geniş sonuç döndürüyor: `fan` eski gövdede 157/441 (%36), yeni
gövdede **360/441 (%81,6)**. Sayıyı kısmak yanlış olurdu — 441 aktif ürünün çoğu gerçekten fan,
yani 360 **doğru cevap**. Doğru çözüm sayı değil **sıralama**: `setweight` ile adında geçen ürün,
yalnız kategorisinde geçenden önce gelir (`ts_rank` varsayılan dizisi `{D,C,B,A}={0,1 · 0,2 ·
0,4 · 1,0}`). Ağırlıksız bir gövde bu cetvele uymaz.

**K3.1b — ALT KATEGORİ (2026-09-16'da eklendi, plan bunu kaçırıyordu).** `products` tablosunda
kategori bağı **iki** alanda: `category_id` (üst) **ve** `subcategory_id` (alt). 442 üründen
**434'ü** alt kategorili, 18 alt kategori kullanımda. Ölçülen kazanç: `asit dayanımlı fan`
0 → **80**, `banyo` 4 → **40**. Alt kategori olmadan bu iki sorgu onarımdan sonra **da** sıfır
dönerdi. En kalabalık alt kategoriler: Santrifüj/Radyal 133 · Asit Dayanımlı 80 · Kanal Tipi 43
· Banyo-Tuvalet 40 · Frekans Konvertörlü 35.

**K3.1c — "ÜST KATEGORİ" AYRI JOIN İSTEMEZ (ölçüldü).** Alt kategorili 434 ürünün **434'ünde**
`subcategory.parent_id = products.category_id`. Yani `category_id` zaten üst kategoridir; ayrıca
parent zinciri yürümek aynı adı iki kez saymak olur. Bu eşitlik bozulursa (üç seviyeli ağaç
gelirse) gövde üreticisi güncellenir — kapı kolu bu eşitliği ölçer.

**⛔K3.1d — SINIR: KATEGORİ ADININ İNGİLİZCESİ VERİTABANINDA YOK (ölçüldü, 2026-09-16).**
`categories` tablosunda `name_i18n` sütunu **yok**; `metadata` yalnız `slug`, `hide_price`,
`description_i18n` taşıyor (31/31 satırda `name`/`name_en` anahtarı **0**). İngilizce kategori adı
`translation_key` üzerinden **kod sözlüğünden** (`common.categoryList.*`) çözülüyor
(`getCategoryDisplayName`). Sonuç: **EN kullanıcı kategori adıyla arama yapamaz.** Aile adının
İngilizcesi gövdede **var** (`product_families.name_i18n`), o yüzden EN tarafı tamamen kör değil.
Bu sınırın kapatılması = kategori adı çevirisini DB'ye taşımak; **ayrı iştir**, bu cetvelin
kapsamında değildir ama burada adıyla yazılıdır ki "unutulmuş" sanılmasın.

**⭐K3.1e — SIRA KURALI AÇIK SÜTUNLARLA KURULUR, `ts_rank` TEK BAŞINA DEĞİL (2026-09-17 ölçümü).**
K3.1a'daki ağırlık dizisi **tek kelimede** "adında geçen önce" sonucunu verir, **çok kelimede
vermez**: `ts_rank` AND sorgusunda kelime puanlarını birleştirir, bir kelimenin düşük ağırlığı
diğerinin A'sını ezer. Canlı vaka: `jet fan` 61 ürün (40 SEAT + 21 JET). JET ürününde `jet` adda
(A), `fan` yalnız teknik metinde (D) → **0,30**; SEAT ürününde iki kelime de aile adında (C,
"SEAT Storm Jet … Fanlar") → **0,51**. İlk 20'nin **20'si SEAT** çıktı; adında JET yazan ürün
listeye hiç girmedi. Eski öneri kutusu JET'i yalnız alfabetik şansla (J < S) başa koyuyordu.
Kural: iki yüzeyde de sıra **basamak ↑ · ad isabeti ↓ · `ts_rank` ↓ · ad ↑**. *Ad isabeti*
(`arama_ad_isabeti`) = normalize edilmiş sorgu köklerinden kaçının normalize edilmiş ürün adında
(ad + TR/EN çeviri, K3.1'in A alanları) bulunduğu. **İki taraf da `arama_normalize`'dan geçer:**
geçmezse doğru yazılmış Türkçe sorgu sessizce kaybeder (`ısı` kökü `ıs`, büyük harfli addaki
`ISI` ise `is` olur; normalizesiz ölçümde `ısı geri kazanım` ad isabeti 1, `isi geri kazanim` 3 —
bağımsız çürütücü ölçtü). Gölge ölçümü (442 ürün, 22 vaka, anon rolüyle): sıra değişen yalnız
`jet fan`/`fan jet` (ilk 20'de adda geçen 0 → 20) ve `ısı geri kazanım` (ilk 3 AVenS); sonuç
**kümeleri** canlıyla aynı, iki yüzeyin ilk ürünü **22/22 eşit**. `rank` sütununun anlamı
değişmedi (`ts_rank − basamak/100`); sıra açık sütunlarla kurulur, istemci `rank`'e göre
sıralamaz (ölçüldü).

**K3.2** — Kalın satırlar (aile, üst kategori, alt kategori) **zorunludur ve sebebi ölçülmüştür.** Ürün adlarımız teknik künye
biçimindedir (`JET 20 · 1400 d/dk · 0,18 kW · 220V`); "fan", "aspiratör" gibi kelimeler ürün adında
değil **kategorisinde** yaşar. 2026-09-15 ölçümü: 441 aktif üründen ad+açıklama gövdesinde "fan"
geçen 66, ama "fan" 10 kategori ve 22 aile adında var. Bu yüzden `jet fan` sorgusu bugün
matematiksel olarak imkânsız — hiçbir tek üründe iki kelime bir arada yok.

**K3.3** — Bu tabloya alan eklemek **kapıya kol eklemeyi kapsar** (kural 14). Kapısız alan,
sessizce aranmamaya başlayabilir ve kimse görmez.

## 4. Aranan SATIR kümesi (SSOT)

**K4.1** — Her arama yüzeyi **aynı** satır evrenini görür:
`status = 'active'` **VE** `deleted_at IS NULL` **VE** tenant sınırı (§7).

**K4.2** — İki yüzeyin farklı evren görmesi kusurdur, tasarım değildir. *(2026-09-15 ölçümü:
`get_search_suggestions` `deleted_at IS NULL` süzüyor, `fts_search_products` süzmüyor. Bugünkü
etkisi sıfır çünkü yumuşak silinmiş aktif ürün yok — ama kural bugünkü veriye değil, kuralın
kendisine dayanır.)*

## 5. Sorgu normalizasyonu

**K5.1 — Aksan/Türkçe karakter körlüğü yasaktır.** `havalandirma` ile `havalandırma` **aynı**
sonucu vermelidir. Kullanıcının klavye alışkanlığı arama sonucunu belirlememelidir.

**K5.2 — Küçültme iki biçimde yapılır.** Türkçe yerel ayarında büyük `I` noktasız `ı` olur; bu
yüzden tek biçimli küçültme metinleri kaçırır. *(Aynı körlük 2026-09-15'te vaat kapısında sahada
görüldü: ekrandaki "AI-powered" metni `ai-powered` terimiyle hiç eşleşmiyordu. Aynı hata ödeme
kapısında da vardı — "Installment" ve "PCI DSS" görünmüyordu.)*

**⛔K5.2a — BÜYÜK "İ" `lower()`'dan ÖNCE indirilir (2026-09-17 ölçümü).** Postgres `lower('İ')`
tek harf değil **`i` + birleşik nokta (U+0307)** üretir; ardından gelen `translate` onu yakalamaz.
`arama_normalize('GERİ')` 5 karakter çıkıyordu. Etki: `ISI GERİ KAZANIM` 3 ürün (küçük harfle 20),
`İNLİNE` **0** (`inline` 24); aynı ifade tetikte olduğu için 28 satırın arama metninde de nokta
kalmıştı. Doğrusu: `translate(p,'İ','i')` → `lower` → Türkçe `translate` → `replace(…, chr(775), '')`.
Guard `arama_normalize('ISI GERİ KAZANIM İNLİNE') = 'isi geri kazanim inline'` eşitliğini ve
tabloda U+0307 kalmadığını ölçer; ziyaretçi rolüyle büyük/küçük yazım aynı sayıyı vermelidir.

**K5.3 — Normalizasyon fonksiyonları ŞEMA-NİTELİKLİ çağrılır.** Arama RPC'leri
`SET search_path TO 'pg_catalog','public'` ile koşuyor; `pg_trgm` ve `unaccent` ise `extensions`
şemasında. Niteliksiz çağrı **çalışma anında** `ERROR 42883: function does not exist` verir ve
migration `CREATE OR REPLACE` aşamasında **hiç uyarmaz** (plpgsql gövdesi geç bağlanır).
Bu yüzden: `extensions.unaccent(...)`, `operator(extensions.%)` biçiminde yazılır.

**K5.3a — OPERATÖR SINIFI da şema-niteliklidir** (2026-09-16'da ölçüldü, kural bu satırla
genişledi): `gin_trgm_ops` ve `gist_trgm_ops` `pg_opclass`'ta **`extensions`** şemasında duruyor.
`CREATE INDEX ... USING gin (x gin_trgm_ops)` niteliksiz yazıldığında yalnız o anki `search_path`
uygun olduğu için çalışır — migration bağlamında bu **kırılgan bir varsayımdır.** Doğrusu:
`USING gin (x extensions.gin_trgm_ops)`. *(K5.3 yalnız fonksiyondan söz ediyordu; kusur sınıfı
aynı ama fonksiyon kuralını okuyan biri indeks satırını gözden kaçırır.)*

**K5.4 — Eklenti kurulumu ayrı bir kalemdir.** `unaccent`, `vector`, `pgroonga`, `fuzzystrmatch`
2026-09-15 itibarıyla **kurulu değildir** (yalnız kurulabilir durumda). `pg_available_extensions`
tablosundaki `default_version` "kurulu sürüm" **değildir**; kurulu olan `installed_version`'dır.
Her `CREATE EXTENSION` kendi migration'ıdır ve kural 13 kapsamındadır.

## 6. Eşleştirme semantiği

**K6.1 — Çok kelimeli sorgu, kelime sırasına bağlı olmamalıdır.** `jet fan` ile `fan jet` **aynı
kümeyi** döndürür.

**K6.2 — Katı "hepsi eşleşmeli" davranışı tek başına yeterli değildir.** `plainto_tsquery` ve
`websearch_to_tsquery` ikisi de boşluğu **VE** olarak yorumlar (2026-09-15'te ölçüldü — "websearch
kullanınca VEYA gelir" **yanlıştır**). Terimler ayrı ayrı değerlendirilir ve hepsi eşleşen üste
sıralanır.

**K6.3 — Sıralı alt-dize eşleştirmesi tek dal olarak bırakılmaz.** `ILIKE '%a%b%'` biçimi
kelimelerin metinde **o sırada** geçmesini şart koşar. Bu, K6.1'i tek başına ihlal eder.

**K6.4 — Yazım hatası toleransı zorunludur.** `vortis` yazan kullanıcı `Vortice` ürünlerini
bulmalıdır. İki ölçülmüş tuzak:
- Trigram indeksini tetikleyen **`%` operatörüdür**; `similarity(...) > eşik` yazımı indeksi
  **hiç kullanmaz** (2026-09-15, `enable_seqscan=off` altında EXPLAIN ile).
- Uzun metinde doğru fonksiyon `word_similarity`'dir:
  `similarity('Vortice Vort Penta','vortis')` = 0,294 ama `word_similarity` aynı çiftte **0,714**.
  Yanlış fonksiyonla ölçülen eşik yanlış eşiktir.

**K6.5 — Eşik tahminle değil ölçümle belirlenir** ve hangi fonksiyonun eşiği olduğu yazılır.

**K6.6 — Yazım hatası yedeği hassasiyeti düşürür; tavanı vardır.** Bkz. K8.4.

**⛔K6.4a — TRIGRAM YAZIM HATASI İÇİN YANLIŞ ARAÇTIR.** *(2026-09-16, 442 ürünle ölçüldü —
K6.4'ün trigram önerisini ÇÜRÜTÜR; K6.4 oradaki iki tuzak için doğru kalır ama araç seçimi
yanlıştı.)* Eşikli trigram bazı hatayı affeder bazısını affetmez: `vortis`/`santrifuj`/`aspiratr`
geçerken `nikotra`/`plug fen`/`kanal tipi fann` düşüyordu. Eşiksiz sıralama **daha kötüdür**:
`"kanal tipi fann"` → *"12 kW Elektrikli Isıtıcı"*, `"zzzqqq"` → Vortice ürünleri.
**Doğru ölçüt harf mesafesidir** (`levenshtein`), üç-harf parçacığı benzerliği değil.

**⭐K6.4b — ADAY ÜRET + DOĞRULA.** Yazım hatası dalı tek araçla kurulmaz: hızlı bir indeks
(pgroonga `fuzzy_search`) **aday** üretir, harf mesafesi bu adayları **doğrular**. Doğrulama iki
kural taşır ve ikisi de ölçülmüştür:
- **İlk üç harf tutmalıdır.** `vortis`→`vortice` tutar (meşru), `kasals`→`kanal` tutmaz. Bu şart
  olmadan `"kasals"` araması **224 alakasız kanal ürünü** döndürüyordu.
- **Gövde kelimesi sorgu uzunluğuna kırpılır.** Türkçe eki mesafeyi şişirir:
  `aspiratr` ↔ `aspiratorler` mesafe **4**, kırpınca **1**.

**K6.4c — Yazım hatası düzeltmesi önce MARKA sözlüğüne bakar, sözlük SABİT DEĞİLDİR.** Marka
kelimeleri `brands` tablosundan türetilir; yeni marka eklenince düzeltme kendiliğinden kapsar.
Katalogda **olmayan** bir marka arandığında doğru davranış **boş dönmektir** (ölçüldü: `kasals`,
`fleksiva` → 0).

**⭐K6.7 — TOKENIZER SEÇİMİ TÜRKÇE İÇİN YAPILANDIRMA DEĞİL, DOĞRULUK MESELESİDİR.**
pgroonga'nın varsayılan tokenizer'ı alfabetik dizileri **kelime bazlı** işler; Türkçe sondan
eklemeli olduğu için `"fanlar"` tek token olur ve `"fan"` araması onu **bulamaz**. Ölçüldü
(442 ürün): varsayılanla `jet`+`fan` kesişimi **0**, `TokenBigramSplitSymbolAlphaDigit` ile
**61** — sıralı taramayla birebir.
⚠**Aynı indeks ek toleransı ile yazım hatası toleransını BİRLİKTE veremez:** ek toleranslı
indekste `fuzzy_search` bigram'lar üzerinde çalışır ve anlamsızlaşır (`vortis` mesafe 2 →
**442/442**). Bu yüzden **iki sütun, iki indeks** gerekir: aynı metin, iki tokenizer.

## 7. Tenant ve yetki (kural 12)

**K7.1** — Arama RPC'leri **`SECURITY INVOKER`** kalır (`prosecdef = false`). Bugün üçü de öyle ve
RLS uygulanıyor; `products.tenant_id` mevcut, `prod_public_read_opt` politikası
`tenant_id = (SELECT jwt_tenant_id())` diyor. Performans gerekçesiyle `SECURITY DEFINER`'a geçmek
**tenant filtresini tümüyle kaldırır** — bu kural 12 ihlalidir.

**K7.2** — Arama metnini üreten/tazeleyen fonksiyon **tenant sınırını aşan JOIN yapamaz**
(`WHERE c.tenant_id = p.tenant_id`). Bu fonksiyon `SECURITY DEFINER` yazılırsa (tetiklerde yaygın
bir alışkanlık) başka tenant'ın kategori adını **kalıcı olarak** ürün satırına gömer — geri
alınamayan bir sızıntı sınıfıdır.

**K7.3** — Faz 2 (multi-tenant) PARK'ta olması bu kuralları askıya **almaz**.

## 8. Kapı: INV-SEARCH-* ailesi

**K8.1 — Kapı iki katmanlıdır.**
- **Katman A (her PR'da):** sorgu kurucusunun semantiği saf fonksiyon olarak, fikstürle. Canlı DB
  gerekmez. *(Gerekçe: CI'daki vitest `https://dummy.supabase.co` ile koşuyor — canlı DB'ye bakan
  bir test orada sessizce yanlış ölçer.)*
- **Katman B (canlı):** `db-advisor.yml` içinde, `db-gate-precheck.outputs.ready` koşuluna bağlı,
  psql ile RPC'leri gerçekten çağırır. Emsal: `catalog-integrity` / INV-CATALOG-1 — **"ATLANMIS IS
  YESIL DEGILDIR"** uyarısı dahil.

**K8.2 — Kapı adı mevcut aileyle hizalanır.** Depoda `INV-SEARCH-ROUTE-1` var
(`search-route-ssot.test.ts`, aramanın dil-güvenli gezinme tarafını ölçüyor). Aynı alanda biri
Türkçe biri İngilizce iki kapı ailesi taşınmaz.

**K8.3 — İddialar sabit sayıya bağlanmaz.** Katalog şeridi her gün ürün ekliyor; `= 47` diyen bir
kapı ilk ürün eklemede kırmızı yanar ve kimse ona güvenmez. İddia biçimleri: **oran**,
**sıfır-değil**, **adıyla bilinen bir ürünün varlığı**, **sıralamadaki yeri**. Kesin sayı yalnız
SKU vakasında anlamlıdır.

**K8.4 — Kapı hem alt hem ÜST sınır ölçer.** Arama düzeltmesi sıfır-sonuç sorununu
**alakasız-sonuç** sorununa çevirebilir. *(Ölçüm: aile+kategori adı gövdeye girince `jet fan`
0 → 61'e çıkıyor, yani "Fan" kategorisindeki her şey sorguya karışma riski taşıyor.)* Hiçbir vaka
aktif ürünlerin **%40'ından fazlasını** döndürmemelidir.

**K8.4a — Marka vakasında tavan MARKANIN aktif ürün sayısıdır, %40 değil (2026-09-17, ALTYAPI
önerisi, ölçüldü).** Bir marka kataloğun büyük payını tutabilir: `vortis` 184 sonuç = aktif
ürünlerin **%41,6'sı**, genel tavan bu vakayı yanlışlıkla kırmızı yapar. Oysa 184'ün 184'ü
Vortice ve Vortice'in aktif ürün sayısı tam 184. Marka ölçütlü vakada iki iddia birlikte kurulur:
**sonuç ≤ o markanın aktif ürün sayısı** ve **marka dışı sonuç = 0**. Canlı ölçüm: vortis
184/184 · nikotra 35/35 · avnes 106/106 · danfos 35/35, dördünde de marka dışı 0.

**K8.5 — Bugün çalışan davranış regresyon testine bağlanır.** `VRT-17160` gibi tam SKU araması
bugün **kusursuz** çalışıyor (tam 1 sonuç); yazım hatası yedeği eklenince benzer SKU'larla
kirlenebilir. Çalışan bir davranışı değiştiren her değişiklik regresyon kolu ister; bu tartışmaya
kapalıdır.

**K8.6 — Kapı, aranan alanın TAZELİĞİNİ de ölçer.** Aile adı değişince arama metni tazelendi mi —
ölçülmeyen tazeleme ilanı bedavaya yazılmış olur.

**K8.7 — İndeksin VARLIĞI ölçülür.** *(Niçin: `20250919_fts_search_products.sql` beş indeks
yaratıyor; canlıda yalnız ikisi var. Migration ya geri alındı ya hiç uygulanmadı ve hiçbir kapı
görmedi. "Uygulandı" ile "işe yaradı" arasındaki fark burada yaşıyor.)*

**K8.8 — Fiyat korunumu ölçülür.** Arama sonucu `display_price(p)` döndürür, ham `products.price`
değil (INV-PRICE-1). Ortak gövdeye geçişte kaybolma riski gerçektir.

### Asgari vaka kümesi

Aşağıdaki vakalar **taban**dır; genişletilebilir, daraltılamaz.

| # | Sorgu | Neyi ölçer | İddia biçimi |
|---|---|---|---|
| 1 | `havalandırma` | temel eşleşme | `> 0` |
| 2 | `havalandirma` | Türkçe karakter körlüğü (K5.1) | vaka 1'in **≥ %90'ı** |
| 3 | `jet fan` | gövdede aile/kategori adı (K3.2) | `> 0` |
| 4 | `fan jet` | kelime sırası bağımsızlığı (K6.1) | vaka 3 ile **aynı küme** |
| 5 | `vortis` | yazım hatası toleransı (K6.4) | markası `Vortice` olan **≥ 1** |
| 6 | `ısı geri kazanım` | çok kelimeli tamlama (K6.2) | `> 0` |
| 7 | `VRT-17160` | kesinlik **regresyonu** (K8.5) | **tam 1**, ilk satır o SKU |
| 8 | `kanal tipi fan` | üç kelime + kategori | `> 0` |
| 9 | `duvar tipi aspiratör` | dört kelime, ad'da geçmeyen terim | `> 0` |
| 10 | `ISI GERI KAZANIM` | büyük harf + noktasız (K5.2) | vaka 6 ile aynı küme |
| 11 | — (her vaka) | hassasiyet tavanı (K8.4) | aktif ürünlerin **≤ %40'ı** |
| 12 | — (Y1 ↔ Y2) | iki yüzey aynı gövde (K4.1) | **aynı ilk ürün** |
| 13 | `jet fan` | ad isabeti sırası (K3.1e) | ilk satırın ad isabeti = kümedeki **en yüksek** ad isabeti (ada göre değil davranışa göre; katalog "Jet …" adlı başka ürün eklese de kırılmaz) |
| 15 | `ISI GERİ KAZANIM`, `İNLİNE` | büyük İ (K5.2a) | küçük harfli yazımla **aynı sayı** |
| 14 | `vortis` | marka tavanı (K8.4a) | ≤ Vortice aktif ürün sayısı, marka dışı **0** |

## 9. Hata yolları (kural 14)

**K9.1 — Hata, "sıfır sonuç" olarak gösterilemez.** *(2026-09-15 ölçümü: `getSearchSuggestions`
hata dalında `console.error` + `return []` yapıyor. Yani RPC çökse bile kullanıcı "sonuç yok"
görüyor.)* İki ayrı durum, iki ayrı ekran: **bulunamadı** ayrı, **arama çalışmadı** ayrı.

**K9.2 — Aynı ekranda iki hata politikası olamaz.** Bugün tam arama yolu kullanıcıya hata
gösteriyor, öneri yolu yalnız konsola yazıyor.

**K9.3 — Arama günlüğünün ön şartı K9.1'dir.** Hata sessizce sıfıra dönüştüğü sürece günlük
hatayı "sıfır sonuç" diye kaydeder; günlük yalan söyler ve "düzeldi mi" sorusu ölçülemez kalır.

## 10. Arama günlüğü

**K10.1** — Sıfır sonuç dönen her sorgu kaydedilir. Bu, "arama düzeldi mi" sorusunun **tek**
ölçülebilir cevabıdır.

**K10.2** — Günlük yazma yüzeyi anonim kullanıcıya açıktır; RLS ve kötüye kullanım sınırı
(oran sınırı, uzunluk tavanı) yazılmadan açılmaz.

**K10.3** — Günlük olmadan kullanıcı davranışı hakkında **ölçüm gibi cümle kurulmaz.** *(Niçin:
REC-340 planının ilk sürümü "müşterinin yarısı sıfır sonuç görüyor" diyordu; bu bir çıkarımdı,
ölçüm değil.)*

## 11. Tazeleme

**K11.1 — Türetilmiş arama metni, kaynak veri değişince tazelenir.** Kaynaklar: ürünün kendi
alanları, aile adı, kategori adı, kategori ağacındaki yer.

**K11.2 — Kaynağa göre İKİ yol.** Ürünün kendi alanı değişince **anında** tazelenir (arama
tazeliği gecikmesin, etkilenen satır bir tane). Aile ya da kategori adı değişince **kuyruğa**
yazılır ve toplu iş koşar. *(Ölçüm: en kalabalık alt kategoride 133, en kalabalık üst kategoride
361 ürün var; bunu tetiğin içinde satır satır yapmak yazma işlemini uzatır ve kilit süresini
şişirir.)*

**K11.3 — Aile/kategori tetikleri koşulludur:** `WHEN (OLD.name IS DISTINCT FROM NEW.name)`.
Adı değişmeyen güncelleme (sıra numarası, meta alanı) tazeleme tetiklemez. Ürün tetiği ise
`UPDATE OF <alan listesi>` ile sınırlıdır; stok ve fiyat değişikliği gövdeyi etkilemez.

**K11.4 — Tazeleme `products` tablosuna YAZMAZ.** *(2026-09-16 ölçümü, bu satır yapı kararını
değiştirdi.)* `products` üzerinde iki koşulsuz tetik var: `products_set_updated_at` (BEFORE UPDATE,
`updated_at := now()`) ve `on_products_change` (AFTER INSERT/UPDATE/DELETE → Vault'tan sır okur +
`net.http_post`). Türetilmiş metni `products`'ta tutmak, her tazelemede vitrin önbelleğini boşuna
tazelemek ve 442 webhook POST'u üretmek demekti. Planın çözümü "toplu yazmada tetiği atla" idi;
o da her tazelemede `ALTER TABLE ... DISABLE TRIGGER`, yani ACCESS EXCLUSIVE kilit ve o pencerede
**gerçek** ürün değişikliklerinin webhook kaybı demektir. **Doğrusu: gövde ayrı tabloda tutulur**
(`product_search_index`), `products`'a hiç yazılmaz ve bu tetiklerin hiçbiri uyanmaz.

**K11.5 — Türetilmiş arama metninin yazımı `admin_audit_log`'a girmez.** Denetim izini üreten
**kaynak** değişikliktir (kategori/aile adı) ve o zaten `denetim_izi_categories` /
`denetim_izi_product_families` ile kayıtlıdır. *(Bu bir karardır ve burada yazılıdır — "hatırlanan"
değil.)*

## 12. Yapı kısıtları (uygulayan kişi için)

**K12.1 — Arama metni sütunu ÜRETİLMİŞ SÜTUN (`GENERATED ALWAYS AS`) olamaz.** PostgreSQL'de
üretilmiş sütun ifadesi yalnız **aynı satırın** sütunlarına bakabilir; alt sorgu ve başka tabloya
başvuru yasaktır. Aile adı `product_families`'te, kategori adı `categories`'tedir.

**K12.1a — Gövde `products` tablosunda DEĞİL, ayrı tabloda tutulur** (`product_search_index`,
`product_id` birincil anahtar + `ON DELETE CASCADE`). Gerekçe K11.4'te ölçülmüştür. İki alan
taşır: `search_body text` (ILIKE ve trigram benzerliği için ham metin — `technical_specs`
**girmez**, JSON anahtar adları benzerlik skorunu bozar ve indeksi şişirir) ve
`search_document tsvector` (ağırlıklı, K3.1a). Ölçülen boyut: gövde ortalama 307, en uzun 694
karakter.

**K12.1b — Yeni tabloda yetki AÇIKÇA daraltılır.** Bu veritabanında `pg_default_acl`, public
şemasındaki her yeni tabloya `anon`/`authenticated` için `arwdDxtm` (INSERT/SELECT/UPDATE/DELETE/
TRUNCATE/REFERENCES/TRIGGER) veriyor — ölçüldü. RLS yazmayı zaten reddeder, ama arama indeksinde
tek katmana güvenilmez: içeriği zehirlenirse kullanıcıya **yanlış ürün** gösterilir. Bu yüzden
`REVOKE ALL` + `GRANT SELECT` yazılır ve kuyruk tablosunda okuma da kapatılır.

**⛔K12.1c — TÜREV sütun da ÜRETİLMİŞ SÜTUN OLARAK EKLENMEZ (mevcut tabloda).** *(2026-09-16'da
bu madde "türev sütun üretilmiş olmalıdır" diyordu; 2026-09-17'de INV-MIGRATION-3 (squawk)
kırmızısıyla ÇÜRÜDÜ.)* Dolu bir tabloya üretilmiş sütun eklemek tabloyu **baştan yazar** ve
ACCESS EXCLUSIVE kilit tutar — squawk `adding-field-with-default`. Doğru yol yardım belgesindeki
yoldur (`.github/migration-linter-yardim.md`): **NULL'a izin veren sütun + mevcut satırları
doldurma + `BEFORE INSERT OR UPDATE OF <kaynak>` tetiği.** Tetik fonksiyonundan `EXECUTE` geri
alınır (K12.1b). Küçük tablo gerekçesiyle kural susturulmaz.

**K12.1d — pgroonga indeksi `CONCURRENTLY` kurulur, fonksiyonlar indeksten SONRA değişir.**
pgroonga `create index concurrently`'yi destekler (gölgede ölçüldü, `indisvalid = true`).
CONCURRENTLY işlem içinde koşamaz; dosya kendi `begin;/commit;`ini yazar ve indeksi iki işlemin
**arasında** kurar. Yeni gövde `&\`` script sözdizimini kullanır ve o **yalnız indeks taramasında**
çalışır — fonksiyonlar indeksten önce değişirse arada gelen canlı aramalar hata verir.
Yarıda kalan CONCURRENTLY geçersiz indeks bırakır ve `if not exists` onu atlar: bu yüzden önce
geçersiz indeks düşürülür, guard da `indisvalid`'i ölçer.

**⛔K12.5 — pgroonga indeksi o sütundaki `LIKE` SORGULARINI DA ELE GEÇİRİR.** Bir sütuna
pgroonga indeksi kurulduğunda mevcut `LIKE '%...%'` sorguları da indeksten cevaplanır ve
**yanlış tokenizer ile yanlış sonuç verirler.** Ölçüldü: sıralı tarama 61 satır dönerken
indeksli aynı sorgu **0** döndü; doğru tokenizer'la ikisi birebir aynı oldu. Bu yüzden pgroonga
eklenen her sütun için, o sütunu okuyan **mevcut** sorgular da yeniden ölçülür — indeks eklemek
burada "yalnız hızlandırma" değildir, **sonuç değiştirebilir.**

**K12.2 — `unaccent` GEREKMEDİ; kalem ölçümle DÜŞTÜ.** *(2026-09-16)* `translate(lower(x),
'ıİşŞğĞüÜöÖçÇâîû','iisSgGuUoOcCaiu')` hem aksan körlüğünü hem Türkçe küçültmeyi çözüyor ve
IMMUTABLE olduğu için üretilmiş sütunda doğrudan kullanılabiliyor. Bu ölçüm bir migration
kalemini ve bir onay adımını tamamen düşürdü. *(Eklenti yine de kurulursa eski uyarı geçerlidir:
`unaccent` STABLE'dır, indeks ifadesinde IMMUTABLE sarmalayıcı ister.)*

**K12.3 — RPC imzası (`RETURNS TABLE`) değiştirilmez.** İmza değişikliği `drop` + `create`
gerektirir; `drop` mevcut `GRANT`'leri de götürür ve arama anonim kullanıcıda **sessizce ölür**.
Ortak gövde paylaşmak imza birleştirmek demek değildir.

**K12.4 — Dönüş tipi daraltılmaz.** `family_slug` ve `cover_image_path` arama sonucunun ürüne
gidebilmesi ve kapak görselini gösterebilmesi için gereklidir.

## 13. Migration kuralları

**K13.1** — Arama migration'ları kural 13 kapsamındadır: master'a merge = prod DB'ye **otomatik**
uygulama. Migration'lı PR yalnız Recep'in açık onayıyla merge edilir; şerit kendi merge etmez.

**K13.2 — Her migration guard bloğu taşır ve guard DAVRANIŞ ölçer.** Fonksiyon tanımının metnini
okumak yetmez: fonksiyon **çağrılır** ve çıktısına bakılır. *(Özellikle K5.3'teki `search_path`
tuzağı yalnız çalışma anında görünür — tanım metni temiz görünür.)*

**K13.3 — Guard yetkiyi de doğrular.** `has_function_privilege('anon', ...)` — "değişmedi"
varsayımı ölçüm değildir.

**⭐K13.4 — ARAMA MIGRATION'I KONTROL LİSTESİ.** *(2026-09-16: tek bir migration'da İKİ kusur
bırakıldı, ikisinin de emsali depoda yazılıydı. Kapıya bağlı tek madde yakalandı, kapısız
dördünden ikisi kaçtı. Bu liste hatırlanmaz, **okunur.**)* Arama migration'ı açılmadan önce
her madde tek tek işaretlenir:

1. **`lock_timeout` + `statement_timeout` yazıldı mı** ve süre **ölçülerek mi** seçildi?
   (Emsalden kopyalanan süre gerekçe değildir; koşum süresi ölçülür, pay yazılır.)
2. **Yeni fonksiyonlardan `EXECUTE` açıkça geri alındı mı?** `pg_default_acl` bu veritabanında
   her yeni fonksiyona `EXECUTE to PUBLIC` verir. Dışa açık uçlar **tek tek** `GRANT` edilir.
3. **Yeni tablolarda `REVOKE ALL` + hedefli `GRANT` yazıldı mı?** (K12.1b)
4. **`pnpm supabase:gen` koşturuldu mu?** Yeni tablo/sütun tip dosyasına yansımazsa filo-geniş
   `INV-TIP-DRIFT-1` kırmızısı doğar.
   ⚠**Sıra inceliği:** `supabase:gen` **canlıdan** üretir, yani migration merge olmadan yeni
   sütunları göremez. Bu yüzden tip tazelemesi aynı PR'a **konamaz**; merge'den hemen sonra
   ayrı ve küçük bir PR olarak gelir. Bu borç, migration PR'ının gövdesinde **adıyla yazılır**
   — yoksa kapı ertesi gün başkasının PR'ında kırmızı yanar.
5. **Opclass, operatör ve fonksiyonlar şema-nitelikli mi** ya da `search_path`'e `extensions`
   eklendi mi? (K5.3, K5.3a — tanım metni temiz görünür, yalnız çalışma anında patlar.)
6. **Guard davranış ölçüyor mu**, sabit sayı kullanıyor mu (K8.3 ihlali), **boş veritabanında
   `NOTICE` ile atlıyor mu**?
7. **Migration gölgede koşturuldu mu**, ve **ikinci kez** koşturulunca hatasız geçiyor mu?
8. **Bu sütunu okuyan MEVCUT sorgular yeniden ölçüldü mü?** (K12.5 — indeks eklemek sonuç
   değiştirebilir.)
9. **⛔Yetki ZİYARETÇİ rolüyle mi doğrulandı?** Guard ve canlı ölçüm dış ucu `set local role anon`
   (ya da anon anahtarıyla REST) üzerinden **çağırır**. *(2026-09-17: dış uçlar SECURITY INVOKER;
   yardımcılardan EXECUTE geri alınınca ziyaretçi 42501 aldı ve canlı arama ~1 saat boş döndü.
   Guard, "canlı ölçüm" ve arama kapısı üçü de `postgres` rolüyle koştuğu için hiçbiri görmedi —
   doğru sayı, yanlış kişi. `has_function_privilege` tek başına yetmez: çağrı zincirindeki her
   fonksiyonu tek tek saymak gerekir, çağrı bunu kendiliğinden yapar.)* Giriş yapmış müşteri
   senaryosu `display_price`'a dokunuyorsa `user_role` iddialı JWT ile kurulur (iddiasız jeton
   bugün ayrı bir kusurla 54001 veriyor, REC-355).
10. **Sıra da ölçüldü mü, yalnız sayı değil?** Sonuç kümesi doğru olup ilk 20 yanlış olabilir
    (K3.1e). Arayüz kaç satır gösteriyorsa guard o kadarının içeriğine bakar.

## 14. İstemci ön hazırlığı (ilk arama)

Bu bölüm veritabanını değil **tarayıcıyı** yönetir: arama penceresi açılmadan önce ne hazırlanır.
Kapı: **INV-ARAMA-ONHAZIRLIK-1** (`src/components/__tests__/aramaOnHazirlik.test.ts`). Uygulama:
`src/components/aramaOnHazirlik.ts`.

**K14.1 — İlk aramanın iki geç parçası vardır, ikisi de önceden iner.** Arama penceresi
`dynamic(..., { ssr: false })` ile ilk tıklamada iner; arama servisi ise pencerenin içinde ilk
aramada ayrıca iner. İkisi birlikte ~15 kB (gzip, 2026-09-22 üretim paketinde ölçüldü). Sayfa
yüklendikten sonra **boşta** (`requestIdleCallback`, yoksa 2 sn) ve kullanıcı arama kutusuna
**yöneldiğinde** (fare üstünde / odak / dokunuş) indirilir.

**K14.2 — Ön yükleme, tıklamanın indirdiği modülle AYNI belirteci kullanır.** Belirteç ayrışırsa
ön yükleme başka bir dosyayı ısıtır, ilk tıklama yine soğuk kalır ve hiçbir ölçüm bunu göstermez.
Kapının (a) kolu bunu tutar; SearchOverlay'deki geç yükleme yolu değişirse kapı kırmızı yanar.

**K14.3 — Veritabanı bağlantısı yalnız YÖNELİMDE açılır, boşta açılmaz.** Tarayıcı kullanılmayan
ön bağlantıyı kısa sürede kapatır; sayfa yüklenirken açılan bağlantı arama anına kalmaz.
`preconnect` kaynağı `NEXT_PUBLIC_SUPABASE_URL`'nin kökenidir, havuz `anonymous`'tır (supabase-js
kimlik bilgisi taşımayan CORS isteği yapar; yanlış havuza açılan bağlantı kullanılmaz).

**K14.4 — Ön hazırlık hiçbir yolu kırmaz.** Veritabanına istek ÜRETMEZ. İndirme düşerse bayrak geri
alınır, bir sonraki yönelim yeniden dener; tıklama zaten kendi indirmesini yapar.

**K14.5 — Bu bölüm aralıklı sunucu gecikmesini ÇÖZMEZ.** 2026-09-22 ölçümünde (temiz tarayıcı ×6)
ikinci aramada da 1,6 sn'lik bir uç görüldü — o anda istemci tarafı tamamen ısınmıştı. Aralıklı
uzun bekleme sunucu/veritabanı tarafındadır; ayrı ölçülür, bu bölümün başarı ölçütü değildir.

---

## Ek: bu cetvelin kendi ölçüm tabanı

Bu dosyadaki her sayı 2026-09-15'te canlı prod veritabanında (`SELECT`) ölçüldü ve üç bağımsız
inceleme tarafından doğrulandı (`plan-challenger` DB ekseni + kod/kapı ekseni, gstack
`/plan-eng-review`). Ölçüm dökümü: REC-340 yorumları · yan yana inceleme:
`docs/audits/gstack-yan-yana-2026-09-15.md`.

**Ölçülmemiş olup burada belge bilgisine dayanan tek kalem K12.2'dir** (unaccent volatilitesi) ve
bu açıkça yazılmıştır. Eklenti kurulduğunda ölçülür ve bu satır güncellenir.
