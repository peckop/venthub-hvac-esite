# Red Team Denetim Raporu: `rehber-yazisi-standard.md` v0.1 (REC-369 F2)

> **Denetlenen:** [rehber-yazisi-standard.md](../standards/rehber-yazisi-standard.md) (dal `blog/rec369-rehber-cetveli`, worktree `C:/tmp/vh-blog-rec369`).
> **Denetçi:** bağımsız alt ajan (plan-challenger A2), cetveli yazan bağlamdan ayrı. Kod yazılmadı, yalnız bu dosya yazıldı.
> **Tarih:** 2026-09-24. **Yöntem:** kod ve cetvel okuması + üç Google belgesinin canlı çekimi (WebFetch) + K2 deseninin rehber türünde sabotaj ölçümü (Node). Linear yorumları ve Search Console verisi elimde **yok**; onlara dayanan sayılar `ÖLÇÜLEMEDİ` damgası taşır.
> **Kısa hüküm:** **BLOK** (cetvelin çekirdek vaadi olan "uydurma atıf = kırmızı", R5'in bugünkü yazımıyla garanti edilmiyor; ayrıntı §4). Cetvel zaten TASLAK ve kendi Durum satırı yayını kilitliyor; bu rapor v0.2 için zorunlu düzeltmeleri adıyla sayar.

---

## 0. DÖRT SORU tablosu (bölüm × S1–S4)

Sabit satır (her S4'ün altında aynen geçerli; tabloda tekrar yazılmadı, aşağıda bir kez konur):

> **Kural 13 — migration içeren dal master'a merge edilince prod DB'ye otomatik uygulanır; yalnız kullanıcı onayıyla merge. Kural 14 — testi/kapıyı sonraki işe bırakmak adımı tamamlamaz; hata yolları aynı adımın kapsamındadır.**

| Bölüm | S1 gerekli mi (sayı) | S2 zaten var mı | S3 kaç yol test ediliyor | S4 neyi bozabilir (canlı ÖNCE / SONRA) | Hüküm |
|---|---|---|---|---|---|
| **R0 Kapsam** | Gerekli: bugün rehber türünü yöneten cetvel **0** (vitrin-metni ürün/aile metnini, destek sayfaları sözlükten). Kapsam tablosu 3 satır, 3'ü de ayrı cetvele bağlanmış. | Kısmen: K2/K4.1/K10 [vitrin-metni-standard.md](../standards/vitrin-metni-standard.md)'de var; R0 "aynen uygulanır" diyor. **K2 deseni rehber türünde ölçülmedi** → yanlış pozitif ölçüldü (B8: 8 örnekte 6 kırmızı, ≥3'ü meşru). | 0 → ⚠SINANMIYOR (kapsam beyanına kapı olmaz; K2'nin rehberde kapısı R8'de "YOK") | Dokunmuyor. ÖNCE: rehber yazısı yok. SONRA: aynı. | **DARALT** — "aynen" yerine "K2'nin şu kolları hariç" (B8) |
| **R1 Konu seçimi** | Gerekli: F1 ölçümü bilgi niyetli sorgu **2 gösterim** (cetvel L50, kaynak Linear — ÖLÇÜLEMEDİ); dış kaynak zorunluluğu bu boşluğu kapatıyor. 5 ölçüt (a–e), her biri ayrı kaynağa bağlı. | Yok: konu seçimi cetveli `docs/standards/`'ta yok (ölçüldü: `ls docs/standards` — `arama-standard.md` site içi arama). `scripts/gsc/gsc-token.cjs` **var** ✓. | 0 → ⚠SINANMIYOR (ölçüt tablosu elle, betik yok) | Dokunmuyor. (d) satırı "dört hesaplayıcı" → kodla **doğru** (4 rota: kanal/hrv/hava-perdesi/jet-fan). | **KALSIN** |
| **R2 Kaynak** | Gerekli: karar 62 "kaynak zorunlu, uydurma atıf kırmızı". Kaynak sınıfı 4 + kaynak-olmayan 4. | Kısmen: §6.3/§6.5 kaynak dizini kuralı [catalog-ingestion-standard.md](../standards/catalog-ingestion-standard.md#L310) **var** ve doğru atıflı. Web kaynağı için (link rot, paywall, erişim tarihi) emsal **yok**. | 0 → ⚠SINANMIYOR (R8'deki "kaynak bütünlüğü" yalnız numara eşleşmesi; adresin açıldığını ölçen kapı yok) | Dokunmuyor. **Çelişki:** R2.1/3 "hakemli yayın" sınıfı ile R5.2 "açılamayan kaynak = 0" — hakemli makale çoğunlukla paywall (B2). | **DARALT** — erişim sınıfı alanı ekle (B2) |
| **R3 Yazı kalıbı** | Gerekli: rakip ölçümüne dayalı (2.561 kelime / 15 H2 / 8 SSS / 17 kaynak — Linear, ÖLÇÜLEMEDİ). "Kelime sayısı hedef değil" doğru sınır. | Yok. Fiyat kuralı §2 [rendering-cache-standard.md](../standards/rendering-cache-standard.md#L64)'e doğru bağlı; kapısı INV-RENDER-1 `import.meta.glob` ile `src/**` tarar ([render-price-surface.test.ts:28](../../src/__tests__/conformance/render-price-surface.test.ts#L28)) → yeni rota **otomatik kapsanır** ✓. | 1 (INV-RENDER-1, fiyat) — kalıbın diğer 9 satırı SINANMIYOR | Dokunmuyor. Hesaplayıcı bağlantısı: hesaplayıcı adresleri site haritasında **bilerek yok** (K17, [sitemap.ts:68](../../src/app/sitemap.ts#L68)); yazıdan iç bağlantı vermek o kararla çelişmez ama K17 sahibi (URUN) bilmeli. | **KALSIN** |
| **R4 Yasaklar** | Gerekli: 8 madde; 1'i Google spam politikasına (alıntı birebir doğrulandı ✓), 5'i (K2/K4.1) ölçülmüş vakalara dayanıyor. | K2, K4.1 var. 8 maddenin **6'sı kapısız** (B9 tablosu). | 8 maddede **1 kapı** (K2, o da "YOK" durumunda) → ⚠SINANMIYOR ×7 | Dokunmuyor. R4.8 "depo PUBLIC, taslak girmez" doğru; ama `pre-commit` uyarı-only (CLAUDE.md Notlar) → kapı yok. | **KALSIN + kapı listesi** (B9) |
| **R5 Doğrulama** | Gerekli: K4.1 vakası (vitrin-metni L162-183: kural yazıldığı gün 5 parça aynı kusuru taşıdı, **ikinci bağımsız göz** yakaladı). Ama akış ikinci gözü **yazarın iddia tablosuna** bağlıyor (B1). | Emsal var: K9.7 "sabotaj kolu — kapı kör değil" [vitrin-metni-standard.md:293](../standards/vitrin-metni-standard.md#L293). R5'te **yok**. | 0 → ⚠SINANMIYOR; R5.2 "DESTEKSİZ=0" ayırt edici değil (kör doğrulayıcı da 0 üretir) | Dokunmuyor. | **DARALT/GÜÇLENDİR** — bağımsız iddia çıkarımı + tuzak N/N (B1) |
| **R6 Yer ve teknik** | Gerekli: sayfa/tablo yok; 9 şart. Article/BreadcrumbList alıntısı birebir ✓; FAQ alıntısı ✓ (kısaltılmış, anlam aynı). | Kısmen: `buildBreadcrumbJsonLd` **var** ([jsonld.ts:310](../../src/lib/seo/jsonld.ts#L310)); Article üreticisi yok. `Routes.destek.konular` **var** ([routes.ts:155](../../src/utils/routes.ts#L155)), `bilgi-merkezi` yok. Markdown ayrıştırıcı **yok** (package.json'da yalnız `isomorphic-dompurify`; `AuthorityRenderer` `'use client'`). `adres-semasi-standard.md` **YOK** (B10). | Mevcut kapılardan otomatik devralınan: INV-RENDER-1 (fiyat), INV-CANONICAL-1/2 (kanonik), INV-EN-YAYIN-1 (site haritası dil). Yeni rota için **0**: SSR bailout listesi ([ssr-kurallari.ts:543-647](../../tests/smoke/ssr-kurallari.ts#L543)) `/tr`, `/tr/products`, `/tr/brands`; INV-DIL-DUSUSU-1 e2e yalnız ürün/kategori. → ⚠SINANMIYOR (aynı HTML, taslak görünmezliği, tazeleme yönü) | **ÖNCE:** `/tr/destek/konular/*` 4 slug × 2 dil = 8 statik sayfa ([page.tsx:6-13](../../src/app/[lang]/destek/konular/[slug]/page.tsx#L6)), hub 3 kart gösterir, site haritasında **0**'ı var; `/en/**` `noindex` (`EN_YAYIN=false`, [layout.tsx:61](../../src/app/[lang]/layout.tsx#L61)). **SONRA (A):** 8 sayfa yönlendirilir — cetvel "8 kalıcı yönlendirme" diyor ama "3 konu" sayıyor (B3: `air-curtain` yetim kalır → 404). Tazeleme: yeni tablo §3'e girmezse yazı değişir sayfa değişmez; handler sitemap'i tazelemezse 6 saat bayat ([sitemap.ts:23](../../src/app/sitemap.ts#L23), [route.ts:560](../../src/app/api/webhook/supabase/route.ts#L560)). | **DARALT + AYRI KAYIT** — tazeleme/önizleme/EN/rota sınıfı satırları (B4–B7), markdown bağımlılığı bagimlilik-kararlari kapısına (B12) |
| **R7 Ölçüm** | Gerekli: F5 dört hafta. Taban 25 gün / 448 gösterim (ÖLÇÜLEMEDİ; 08-28→09-21 = 25 gün, GSC gecikmesiyle tutarlı). "Sayısal hedef yazılmadı" gerekçeli ✓. | Yok (search-console skill var, ölçüm betiği yok). | 0 → ⚠SINANMIYOR | Dokunmuyor. Kaynak tazeliği (link rot) R7'de **yok** (B2). | **KALSIN + link kontrolü** |
| **R8 Kapılar** | Gerekli: 6 kapı, 5'i "YOK". Dürüst. | "Tazeleme" satırı mevcut kapıya bağlı ✓ ama kapının okuma biçimi yanlış anlaşılabilir (B5). | 6 kapıda 1 mevcut (INV-RENDER-2), o da yalnız tetik↔handler bağını ölçer. | Zamanlama: "ilk yazı yayından önce" — kural 14/§8.1 "aynı PR'da" der (B11). | **DARALT** — "yayından önce" → "o parçayı getiren PR'da" |
| **R9 Ritim** | Öneri, karar Recep'te. Haftada 1 × 4 hafta = 4 yazı → R7 tabanı. | Yok. | 0 (öneri; kapı gerekmez) | Dokunmuyor. R4.1 "toplu üretim yok" ile tutarlı; ancak "toplu"nun sayısal sınırı yok (B9). | **KALSIN** |
| **Ölçüm geçmişi** | Gerekli (cetvel geleneği). | — | — | "Google belgeleri" satırı **3/3 doğrulandı** (canlı çekim, bu rapor §2.10). Diğer 4 satır Linear'a bağlı → ÖLÇÜLEMEDİ. | **KALSIN** |

**S3 toplamı:** 10 bölüm, **2** mevcut otomatik kapı (INV-RENDER-1 glob ile, INV-RENDER-2 tablo satırı gelince), **8** bölüm SINANMIYOR. Cetvel bunu R8 başında dürüstçe yazıyor; damga plan metnine zaten taşınmış sayılır, ama **hangi kapının hangi PR'da** doğacağı yazılmalı (B11).

---

## 1. Giriş ve metodoloji

**Amaç:** cetvelin (a) uydurma atfı gerçekten yakalayıp yakalamadığı, (b) R6 teknik şartlarının bugünkü kodla ve kurallarla (12/13/14, K10, §3) uyumu, (c) R4 yasaklarının kapısızlığı, (d) cetvelin kendi sayı ve alıntılarının kaynağına sadakati, (e) CLAUDE.md kuralları açısından çürütülmesi.

**Okunan kaynaklar:** hedef cetvel; `vitrin-metni`, `rendering-cache`, `catalog-ingestion` §6.3–6.5, `canonical-url`, `execution-method` cetvelleri; CLAUDE.md; `src/app/[lang]/destek/konular/[slug]/page.tsx`, `destek/merkez/page.tsx`, `views/knowledge/{HubPage,TopicPage}.tsx`, `src/app/sitemap.ts`, `src/lib/seo/jsonld.ts`, `src/components/Seo.tsx`, `src/config/features.ts`, `src/utils/routes.ts`, `src/app/api/webhook/supabase/route.ts`, `src/__tests__/conformance/{render-revalidation-contract,render-price-surface,en-yayin-anahtari,rls-*,anon-yazma-nobetcisi}.test.ts`, `tests/smoke/ssr-kurallari.ts`, `supabase/baselines/2026-06-12_public_schema.sql` (`jwt_tenant_id`), `supabase/migrations/20260811_f2_split_model_schema.sql` (RLS deseni), `src/i18n/dictionaries/tr.ts` (`knowledge.topics`), `package.json`.

**Canlı ölçümler:** üç Google belgesi WebFetch ile çekildi (spam-policies, faqpage, article). K2 deseni Node ile 8 rehber-türü cümleye karşı koşuldu.

**Ölçemediklerim (adıyla):** Search Console rakamları, arama önerisi sayıları, rakip yazı ölçümü, Linear REC-369 yorumları. Bunlar için "yanlış" demiyorum; "ÖLÇÜLEMEDİ" diyorum.

---

## 2. Detaylı analiz ve çürütmeler

### 2.1 (B1) R5 doğrulama akışı uydurma atfı yakalamayı GARANTİ ETMİYOR — evren yazarın tablosu, sabotaj kolu yok — **Kritik**

* **Bulgu:** Doğrulayıcı "her iddia için DOĞRULANDI/DESTEKSİZ/ÇELİŞİYOR" veriyor ([rehber-yazisi-standard.md:151](../standards/rehber-yazisi-standard.md#L151)) ama iddia evreni **yazımı yapan BLOG'un çıkardığı iddia tablosu** ([:150](../standards/rehber-yazisi-standard.md#L150)). İddia tablosuna girmeyen cümle **hiç doğrulanmaz**; yazar bir sayıyı/olumsuz iddiayı tabloya almayı unutursa (ya da bilinçli dışarıda bırakırsa) akış yeşil biter. Bu, tam olarak K4.1'in ölçülmüş körlüğüdür: *"cümlenin bir yarısı doğrulanıp diğer yarısı gözden kaçabilir"* ([vitrin-metni-standard.md:158](../standards/vitrin-metni-standard.md#L158)). Cetvel "her iddianın ayrı doğrulanması"nı yazıyor ([:156](../standards/rehber-yazisi-standard.md#L156)) ama bunu **tabloya bakan** doğrulayıcıdan istiyor; tablo eksikse kural boşa düşer.
* **İkinci kör nokta — kabul ölçütü ayırt edici değil:** R5.2 "DESTEKSİZ = 0 · ÇELİŞİYOR = 0 · açılamayan kaynak = 0" ([:162](../standards/rehber-yazisi-standard.md#L162)). Hiçbir kaynağı açmayan, her satıra DOĞRULANDI yazan bir doğrulayıcı da bu ölçütü **birebir karşılar**. Aynı depoda emsal var ve tersini yapıyor: K9.7 *"guard'ın yakalaması gereken bir not kurulup kırmızı yandığının kanıtlanması (sabotaj kolu — kapı kör değil)"* ([vitrin-metni-standard.md:295](../standards/vitrin-metni-standard.md#L295)); ayrıca §6.3 kanıt daraltma sabotajı (*"kasten yanlış kaynak … satırların yalnız %63'ünü düşürdü"*, [catalog-ingestion-standard.md](../standards/catalog-ingestion-standard.md#L430)). R5'te sabotaj kolu **yok**.
* **Üçüncü kör nokta — aynı kaynağı aynı yanlış okuma:** araştırma ajanı ve doğrulayıcı aynı `sayfalar.jsonl` satırını okur; satırdaki tablo hücresi yanlış sütuna kaymışsa (§6.3 "sayı sayfada model adı olarak da geçebilir: `HF/S 315` ↔ `315 mm`") ikisi de aynı yanlışı "doğrular". R5 birim/bağlam kontrolünü sayıyor ([:155](../standards/rehber-yazisi-standard.md#L155)) ama "aynı satırda birden çok aday değer varsa DESTEKSİZ" gibi bir kural yok.
* **Hangi kural:** karar 62 ("uydurma atıf = kırmızı"), vitrin-metni K4.1 + K9.7 emsali, execution-method §8.1 (kapı aynı işte), plan-challenger A5 (statik kapı runtime'ı görmez → burada "tablo-kapısı metni görmez").
* **Risk:** **Kritik** — cetvelin var oluş sebebi bu; bugünkü yazımıyla "doğrulandı" raporu ölçülemez bir iddia.

### 2.2 (B2) Link rot, paywall, erişilemeyen kaynak ve müşteriye görünen PDF adresi — **Yüksek**

* **Bulgu 1 — müşteriye verilen adres ≠ doğrulanan nesne.** R2.3: kaynak dizini atfı müşteriye "üretici belgesinin adı ve sayfasıyla" görünür, *"üreticinin herkese açık PDF adresi varsa verilir"* ([:97-99](../standards/rehber-yazisi-standard.md#L97)). Doğrulayıcı §6.3/§6.5 gereği **PDF'i açmaz**, `sayfalar.jsonl` satırını (hash'li yerel kopya) okur. Üreticinin sitesindeki PDF **başka bir sürüm** olabilir (§6.3 "DEGISMIS" sınıfı tam bunu tanımlıyor). Müşteri "s. 12"ye bakar, sayıyı bulamaz: müşteriye görünen atıf **doğrulanmamış** bir adrestir. Cetvel bunu yazmıyor.
* **Bulgu 2 — paywall ile R2.1/3 ↔ R5.2 çelişkisi.** R2.1 sınıf 3 "hakemli yayın" kaynak sayılıyor; R5.2 "açılamayan kaynak = 0". Hakemli makalelerin çoğu paywall'dır → ya sınıf 3 fiilen kullanılamaz ya da doğrulayıcı özet (abstract) okuyup "açtım" der ve gövde sayısı özetle doğrulanmaz. Cetvel ücretli **standart** için kural yazmış ([:84-85](../standards/rehber-yazisi-standard.md#L84)), ücretli **makale** için yazmamış.
* **Bulgu 3 — yayından sonra kaynak değişir/kaybolur.** R2.3 "erişim tarihi" yazdırıyor (doğru), ama R7 yalnız Search Console ölçer; yayından sonra kaynağın hâlâ açıldığını ve aynı ifadeyi taşıdığını ölçen hiçbir adım yok. Cetvelin kendi kuralı R2.2 "açılmamış kaynak atıf alamaz" — yayından 6 ay sonra ölü bağlantı, müşteriye görünen ama artık açılmayan bir atıftır.
* **Hangi kural:** R2.2'nin kendisi; catalog-ingestion §6.3 tazelik sınıfları (DEGISMIS/ARTIK); CLAUDE.md 14 (hata yolu: "kaynak yok" dalı yazılmamış).
* **Risk:** **Yüksek**.

### 2.3 (B3) Olgusal hata: "3 destek konusu" — sözlükte **4** konu anahtarı var, 8 statik sayfa üretiliyor — **Yüksek**

* **Bulgu:** Cetvel *"Bugün 3 destek konusu site haritasında yok (URUN ölçümü)"* ([:188](../standards/rehber-yazisi-standard.md#L188)) ve A seçeneği için *"8 kalıcı yönlendirme"* ([:176](../standards/rehber-yazisi-standard.md#L176)) diyor. Kod: `generateStaticParams` konuları **`Object.keys(tr.knowledge.topics)`**'tan üretir ([page.tsx:7](../../src/app/[lang]/destek/konular/[slug]/page.tsx#L7)); `tr.knowledge.topics` **4** anahtar taşır: `air-curtain` ("Hava Perdesi Seçimi"), `jet-fan`, `hrv`, `hava-perdesi` ("Hava Perdesi") ([tr.ts:331-357](../../src/i18n/dictionaries/tr.ts#L331)). Yani canlıda **4 konu × 2 dil = 8** statik sayfa var; hub yalnız 3'ünü listeler (`TOPIC_SLUGS = ['hava-perdesi','jet-fan','hrv']`, [HubPage.tsx:15](../../src/views/knowledge/HubPage.tsx#L15)). `air-curtain` hub'dan erişilmeyen ama var olan ve (hesaplayıcı gibi) dışarıdan bağlantı almış olabilecek bir sayfadır. "8 yönlendirme" ya 4 konu × 2 dil (hub yok) ya 3 konu × 2 + hub × 2 (`air-curtain` yok) — cetvel hangisi olduğunu söylemiyor; iki okumada da bir sayfa yönlendirmesiz kalır.
* **Hangi kural:** execution-method §6.1 *"isim listesi ölçüm değildir — ölçüt keskin, evren yanlış"*; CLAUDE.md 1 (plan olguya dayanır).
* **Risk:** **Yüksek** — yer kararı A'nın yönlendirme sayısı Recep'e yanlış gidiyor; uygulamada `air-curtain` 404'e düşer (REC-300 Faz 1-A "404 değil 308" kuralı ihlali).

### 2.4 (B4) "Ziyaretçi ve bot aynı HTML" şartı — rota sınıfı ilanı yok, SSR kapısı yeni rotayı görmüyor — **Yüksek**

* **Bulgu:** Bugünkü konu sayfası `'use client'` görünüm + istemci `<Seo>` ile çalışıyor ([TopicPage.tsx:1](../../src/views/knowledge/TopicPage.tsx#L1), [:63](../../src/views/knowledge/TopicPage.tsx#L63)); `page.tsx`'te `generateMetadata` yok. Cetvel R6 "sayfa sunucuda üretilir" diyor ama **rota sınıfını** yazmıyor. rendering-cache §3.3: *"Vitrin sınıfına giren her yeni rota bu satırı (`force-static`) yazar; yazmazsa `admin-smoke` SSR kapısı kırmızı verir"* ([rendering-cache-standard.md:263](../standards/rendering-cache-standard.md#L263)). O kapının rota listesi bugün `/tr`, `/tr/products`, `/tr/brands` ([ssr-kurallari.ts:543-647](../../tests/smoke/ssr-kurallari.ts#L543)); `destek/konular` yok → yeni rota için "aynı HTML" iddiası **SINANMIYOR**. Ayrıca §1.1'in iki sessiz dinamikleştirici deseni (`searchParams`, `headers()`) cetvelde anılmıyor; "önizleme" için bir `?preview=` parametresi eklenirse rota sessizce dinamikleşir ([rendering-cache-standard.md:26-47](../standards/rendering-cache-standard.md#L26)).
* **Hangi kural:** CLAUDE.md 4 (RSC öncelikli), rendering-cache §1.1/§3.3, plan-challenger A5.
* **Risk:** **Yüksek**.

### 2.5 (B5) Tazeleme zinciri yarım: §3 tablosuna satır yetmez — site haritası dalı, ters yön (yüzey→tablo) ve alt başlık tuzağı — **Yüksek**

* **Bulgu 1 — kapının okuma sınırı:** INV-RENDER-2 tabloyu `## 3.` başlığından **ilk `### ` alt başlığına kadar** okur ([render-revalidation-contract.test.ts:349-359](../../src/__tests__/conformance/render-revalidation-contract.test.ts#L349)). Satır §3.1/3.2'ye yazılırsa kapı **görmez**. Cetvel "§3 tablosuna satır" diyor, "ana tablo, alt başlıktan önce" demiyor. Kapı ayrıca **yalnız** tetik↔handler bağını ölçer; yazı sayfasının hangi tabloları okuduğunu değil (testin kendi yorumu: *"'Vitrinde görünen tablo' kümesi KODDAN türetilmiyor"*, [:44-45](../../src/__tests__/conformance/render-revalidation-contract.test.ts#L44)).
* **Bulgu 2 — site haritası tazelemesi:** `revalidatePath('/sitemap.xml')` yalnız `products/categories/product_families/product_images` dallarında ([route.ts:560](../../src/app/api/webhook/supabase/route.ts#L560)); sitemap yedek süresi **6 saat** ([sitemap.ts:23](../../src/app/sitemap.ts#L23)). Yeni yazı tablosunun handler dalı sitemap'i tazelemezse R6'nın "site haritasında her yayındaki yazı; lastmod = güncelleme" şartı 6 saate kadar yalan söyler; INV-RENDER-2 bunu **görmez** (yalnız dalın varlığını ölçer).
* **Bulgu 3 — ters yön:** R3 iç bağlantı "ilgili ürün aileleri (kart)" → yazı sayfası `product_families` okur; aile adı/görseli değişince **yazı sayfası** tazelenmeli. Bu, §3.1'in "bir SAYFANIN gösterdiği her tablo o zincirde var mı" sorusudur ([rendering-cache-standard.md:163](../standards/rendering-cache-standard.md#L163)); cetvel yalnız "tablonun tetiği" yönünü yazıyor. Aynı şekilde URUN'un "kategoriden yazıya" bağlantısı kategori sayfasını yeni tabloya bağlar → yazı değişince kategori yolu da tazelenmeli.
* **Hangi kural:** rendering-cache §3 ("biri eksikse veri değişir, sayfa değişmez — hiçbir test görmez"), CLAUDE.md kural 1 gerekçesi (08-15 vakası).
* **Risk:** **Yüksek**.

### 2.6 (B6) RLS/tenant, yazma yetkisi, önbellek anahtarı ve ÖNİZLEME — R6'da dört boşluk — **Yüksek**

* **Bulgu 1 — okuma deseni doğru ama eksik yazılmış:** anon için `jwt_tenant_id()` claim yoksa **varsayılan kiracıyı** döner ([2026-06-12_public_schema.sql:1212](../../supabase/baselines/2026-06-12_public_schema.sql#L1212)); mevcut desen `tenant_id = jwt_tenant_id() and deleted_at is null` ([20260811_f2_split_model_schema.sql:82-83](../../supabase/migrations/20260811_f2_split_model_schema.sql#L82)). Yazı için politika `… and status = 'published'` olmalı; cetvel "yalnız yayında olanı okur" diyor ama **yazma politikasını hiç yazmıyor**: kim yazar (admin UI? BLOG betiği service_role ile?), hangi rol kararıyla? Mevcut desen `user_profiles.role` ([:86-90](../../supabase/migrations/20260811_f2_split_model_schema.sql#L86)); CLAUDE.md 12 "yetki kararı `app_metadata`" der ve INV-AUTH-ROLE-2 bunu ölçer. Cetvel bu kararı URUN'a bırakıyor ama şart tablosuna yazmıyor.
* **Bulgu 2 — önbellek anahtarı:** CLAUDE.md 12: `unstable_cache`/`revalidateTag` anahtarlarına **lang ve tenantId**. Cetvelde bu cümle **yok**; §3.1 dersi (*"etiketin iki ucu aynı kiracıyı söylemelidir"*, [rendering-cache-standard.md:179](../standards/rendering-cache-standard.md#L179)) tekrar yaşanabilir.
* **Bulgu 3 — ÖNİZLEME mekanizması yok:** R5.3 Recep'e "önizleme bağlantısı" gidiyor ([:169](../standards/rehber-yazisi-standard.md#L169)). Anon taslağı okuyamıyorsa Recep taslağı **nasıl görür?** Vercel dal önizlemeleri kapatıldı (commit `db8ee7565`, INV-VERCEL-DAL-1). Tanımlı yol yoksa fiilî çözüm "yayınla, bak, geri al" olur → R4.8 ihlali (metin yayından önce herkese açık) ve arama motoru taslağı dizine alır. Önizleme rotası ayrıca `force-dynamic` + `noindex` + admin oturumu ister; `<Seo noIndex>` var ([Seo.tsx:60](../../src/components/Seo.tsx#L60)) ama RSC metadata'da `robots` ayrıca yazılmalı.
* **Bulgu 4 — "RLS testi (anon rolüyle)" hangi düzenekte?** `supabase/tests` boş; DB'ye bağlanan tek yinelenen nöbetçi INV-ANON-YAZMA-1 (`scripts/db/checks/*.mjs`, CI'da; [anon-yazma-nobetcisi.test.ts](../../src/__tests__/conformance/anon-yazma-nobetcisi.test.ts)). Cetvel "RLS testi" diyor, hangi düzeneğe bağlanacağını söylemiyor → kapı kurulunca "elle prosedür" kovasına düşme riski (vitrin-metni K8 "Canlı ölçüm: kod karşılığı YOK" emsali).
* **Hangi kural:** CLAUDE.md 12 (tenant-scoped, app_metadata, cache anahtarı), R4.8, canonical-url §1.
* **Risk:** **Yüksek** (önizleme boşluğu Kritik'e yakın: taslağı yayınlatır).

### 2.7 (B7) i18n K10 / EN_YAYIN: "EN yoksa EN sayfa yoktur" mevcut kalıpla çelişiyor, kapı yok — **Orta**

* **Bulgu:** Mevcut kalıp her slug için **koşulsuz** `tr` + `en` üretir ([page.tsx:9-12](../../src/app/[lang]/destek/konular/[slug]/page.tsx#L9)) ve `dynamicParams = false`; site haritası statik rotalarda `alternates.languages` tr/en'i **koşulsuz** yazar ([sitemap.ts:84-89](../../src/app/sitemap.ts#L84)). Cetvel "hreflang yalnız iki dil de varsa" diyor ([:189](../standards/rehber-yazisi-standard.md#L189)) — doğru — ama bunu üreten kod deseni depoda yok; `EN_YAYIN=false` iken `/en/**` zaten `noindex` ([layout.tsx:61](../../src/app/[lang]/layout.tsx#L61)) ve cetvel `EN_YAYIN`'ı **hiç anmıyor**. Kapı tarafı: INV-DIL-DUSUSU-1 e2e yalnız ürün ve kategori sayfalarını ölçer ([vitrin-metni-standard.md:231](../standards/vitrin-metni-standard.md#L231)); INV-EN-YAYIN-1 site haritası/noindex'i ölçer ama yazı başına dil kümesini değil.
* **Hangi kural:** CLAUDE.md 7, vitrin-metni K10, canonical-url §6 ("kanonik ile sitemap tek PR'da değişir").
* **Risk:** **Orta**.

### 2.8 (B8) K2 deseni rehber türünde ÖLÇÜLDÜ: 8 örnek cümlede 6 kırmızı, en az 3'ü meşru — **Orta**

* **Bulgu:** R0 K2'yi "aynen", R5.2 ve R8 "K2 deseni gövde + SSS + kaynak listesinde 0" diyor. Desen ([vitrin-metni-standard.md:56-66](../standards/vitrin-metni-standard.md#L56)) **vitrin bloğu** için tasarlandı. Sabotaj ölçümü (Node, bu denetim):

  | # | Rehber cümlesi | Desen | Meşru mu |
  |---|---|---|---|
  | 1 | "…proje hesabı yetkili mühendis tarafından **doğrulanmalıdır**." (R3 teknik sorumluluk notu) | KIRMIZI | **meşru** |
  | 2 | "Kaynaklar: [1] ASHRAE …, **kaynak başlığı**: Air Curtains, s. 12." | KIRMIZI | **meşru** (R2.3 liste sütunu) |
  | 3 | "Üretici kataloğu … ses seviyesini **vermez**" | KIRMIZI | R4.5 zaten yasak — doğru kırmızı |
  | 4 | "…EN 13141-7 **tabloda yer almaz**" | KIRMIZI | yarı (bağlama göre) |
  | 5 | "**> \*\*Not:\*\*** Hava perdesi kapı yüksekliği 3 m üstünde…" | KIRMIZI | **meşru** (K3/K5 emsali: dolu blockquote ürün bilgisi) |
  | 6 | "**Bkz. yukarı**daki kıyas tablosu." | KIRMIZI | **meşru** (rehberde iç gönderme normal) |
  | 7 | "Hava perdesi nedir? … cihazdır [1]." | geçti | — |
  | 8 | "Debi 2.500 m³/h … (Vortice, AIR DOOR kataloğu, s. 12)." | geçti | — |

  Teknik sorumluluk notu "sözlükten" geliyor (R3) — gövde dışıysa 1. satır kaçar; ama "Kaynaklar" listesi R5.2'de açıkça taranıyor → 2. satır kesin yanlış kırmızı. Vitrin-metni'nin kendi uyarısı burada da geçerli: *"`\>\s*\*` kolu geniştir … yarın yazılacak her meşru `> **…**` bloğu … yanlış kırmızı verecek"* ([:93-98](../standards/vitrin-metni-standard.md#L93)).
* **Hangi kural:** vitrin-metni K2/K3/K5 (desenin sınırı adıyla yazılı), execution-method §6.1.
* **Risk:** **Orta** — kapı kurulursa ilk yazıda yanlış kırmızı → "gevşetelim" baskısı (canonical-url §4 ders 1).

### 2.9 (B9) R4 ↔ R8: sekiz yasağın altısı kapısız — **Orta**

| R4 | Kapısı var mı | Yoksa neden | Önerilen kapı |
|---|---|---|---|
| 1 Toplu üretim yok | **Yok** | R9 "öneri"; sayısal tavan yok | Yayın tablosunda haftalık `published_at` sayısı ≤ N (N Recep kararı, başlangıç 2) — SQL/CI kolu; ayrıca her yazı için doğrulama kaydı FK zorunlu (kayıtsız yazı yayınlanamaz — R8 "Doğrulama kaydı" kapısına bağlanır) |
| 2 Garanti/üstünlük vaadi | **Yok** | — | Kelime deseni (`en iyi|%100|kesin çözüm|garantili|rakipsiz`) yazma-anı kapısı; muaf liste yok |
| 3 Rakip adı/kötüleme | **Yok** | — | Rakip ad listesi (Linear'da, PUBLIC depoda değil) ile yazma-anı taraması; R4.8 ile tutarlı |
| 4 Taslak/editör notu | K2 (R8 "YOK") | kurulmamış | B8'e göre daraltılmış desen |
| 5 Olumsuz iddia | **Yok** (yalnız R5 ajan) | otomatik ayırt zor | İddia tablosunda `olumsuz=true` sütunu; olumsuz iddia için `alinti` boşsa DESTEKSİZ — betik kolu |
| 6 Mevzuat hükmü | **Yok** | — | "zorunlu|yasak|mecburi|yönetmelik" geçen cümle → kaynak sınıfı 2 (resmî) + yürürlük tarihi alanı dolu — betik kolu |
| 7 Kişi/proje adı | **Yok** | — | Özel ad deseni zayıf; en azından teklif/sipariş no ve müşteri tablo eşleşmesi taraması |
| 8 Yayından önce depoya girmez | **Yok** (`pre-commit` uyarı-only) | — | `docs/**` ve `scripts/**` altında taslak dosya deseni (`*-taslak*`, `iddia-tablosu*`) yasak — INV kapısı |

* **Hangi kural:** CLAUDE.md 14, execution-method §8.1.
* **Risk:** **Orta** (toplu).

### 2.10 (B10) Cetvelin kendi sayı ve alıntıları — ne doğrulandı, ne çelişiyor — **Orta**

| İddia | Ölçüm | Sonuç |
|---|---|---|
| Spam politikası alıntısı (R4.1) | WebFetch, canlı | **Birebir** ✓ (tanım + 1. madde) |
| Article türleri alıntısı (R6) | WebFetch | **Birebir** ✓; `TechArticle` belgede geçmiyor ✓ |
| Article "önerilen alanlar" (R6) | WebFetch | Google listesi: `author, author.name, author.url, dateModified, datePublished, headline, image` — cetvel `author.name`/`author.url`'i **yazmıyor** (eksik, yanlış değil) |
| FAQ alıntısı (R6) | WebFetch | Belgede *"the feature is only shown for well-known, authoritative government and health websites"* (14 Eyl 2023 notu). Cetvel baş kısmı kırpmış, anlam aynı; "2023'ten beri" ✓ |
| "dört hesaplayıcı" (R1.2-d) | `ls src/app/[lang]/destek/hesaplayicilar` | **4** ✓ |
| "3 destek konusu site haritasında yok" (R6) | tr.ts + page.tsx + sitemap.ts | **✗ 4 konu, 8 sayfa**, hiçbiri haritada değil (B3) |
| `adres-semasi-standard.md` (üst not + R6) | `ls docs/standards` | **✗ DOSYA YOK** — yalnız [rec-adres-agac-tek-yayin-2026-09-07.md:159](../plans/rec-adres-agac-tek-yayin-2026-09-07.md#L159) plan belgesinde gelecek ad olarak geçiyor. Var olmayan cetvele atıf (CLAUDE.md 1: cetvel adı gerçek dosya olmalı) |
| `scripts/gsc/gsc-token.cjs` | `ls` | var ✓ |
| `scripts/icerik-hatti/**` (ad notu) | `ls` | var ✓ |
| Rakip 2.561 kelime / 17 kaynak; TR rakipler 433–1.565, 0 kaynak | Linear OPS yorumu | ÖLÇÜLEMEDİ; kaynak adı var (kayıt + tarih) ama rakip adresi R4.3 gereği yazılmamış → **yeniden ölçülemez** (iç kayıtta adres olmalı) |
| GSC 25 gün / 34 tık / 448 gösterim / bilgi niyetli 2 | Linear BLOG F1 | ÖLÇÜLEMEDİ; 08-28→09-21 = 25 gün, GSC gecikmesiyle **tutarlı** |
| 16 tohum → 93 öneri; ilk altı 16+13+11+9+8+8=65 | aritmetik | tutarlı (65 ≤ 93) |
| "rakibin bota ayrı sayfa vermesi" (R6) | — | ÖLÇÜLEMEDİ, kaynak yok → R2.2'ye göre bu cümle **kaynaksız iddia** |

* **K4.1 dersi uygulaması:** cetvel "kaynaksız sayı yok" diyor; kendi sayılarının çoğu Linear yorumuna bağlı (kabul edilebilir iç atıf), **ikisi** kodla çelişiyor/yok (3 konu, adres-semasi), **biri** kaynaksız (bot'a ayrı sayfa).
* **Risk:** **Orta**.

### 2.11 (B11) Kapı zamanlaması kural 14 ile çelişiyor — **Orta**

* **Bulgu:** R8: *"Aşağıdakiler ilk yazı yayından önce kurulur"* ([:206](../standards/rehber-yazisi-standard.md#L206)). Tablo/migration PR'ı (URUN) ile "taslak görünmezliği RLS testi" aynı PR'da doğmazsa, migration prod'a **uygulanmış** (kural 13) ama anon-taslak kapısı yok demektir; execution-method §8.1: *"davranışı ölçen kol aynı dalda doğar"*. "Yayından önce" ifadesi kapıyı bir sonraki işe bırakmaya izin veriyor.
* **Hangi kural:** CLAUDE.md 13, 14; execution-method §8.1.
* **Risk:** **Orta**.

### 2.12 (B12) Markdown render: depoda ayrıştırıcı yok → yeni bağımlılık, cetvel anmıyor — **Düşük**

* **Bulgu:** R6 "gövde markdown; sunucuda, izin listeli etiketlerle render". `package.json`'da markdown ayrıştırıcı **yok** (react-markdown/remark/marked/markdown-it: 0 eşleşme; yalnız `isomorphic-dompurify`, [package.json:56](../../package.json#L56)). `AuthorityRenderer` `'use client'` ([AuthorityRenderer.tsx:1](../../src/components/authority/AuthorityRenderer.tsx#L1)) → sunucu şartına uymaz, yeniden kullanılamaz. Yeni bağımlılık `bagimlilik-kararlari.md` tablosu + kapısı ister ([bagimlilik-kararlari.md:6](../standards/bagimlilik-kararlari.md#L6)). Kod-sahibi URUN olsa da cetvel "izin listesi"ni **kimin, nerede** tanımlayacağını yazmalı (link `rel=nofollow`? dış kaynak bağlantıları R2.3 gereği çıkacak — `target`/`rel` politikası).
* **Risk:** **Düşük**.

### 2.13 (B13) R5.1 doğrulayıcı model seçimi gerekçesiz — **Düşük**

* **Bulgu:** "Fable 5.1 alt ajan" ([:151](../standards/rehber-yazisi-standard.md#L151)). execution-method §5.2: çürütme → *"opus ya da sonnet ×N oy; ölçmeden yükseltmek maliyet, ölçmeden düşürmek risk"* ([execution-method-standard.md:150](../standards/execution-method-standard.md#L150)). Model açık yazılmış (§5.1 ✓) ama gerekçe yok. Rapor: ilk iki yazıda sonnet×2 ile Fable'ı **yan yana** koşturup kaçırma ölçmek (sahiplik-olcut-degildir dersi: yan yana kanıt).
* **Risk:** **Düşük**.

### 2.14 (B14) CLAUDE.md kuralları — özet kontrol

| Kural | Durum |
|---|---|
| 1 Cetvel adı | Cetvel kendini adlandırıyor ✓; **var olmayan** `adres-semasi-standard.md`'ye atıf ✗ (B10) |
| 7 i18n / `useLocalizedRoutes` | `Routes.destek.konular` var; A seçeneği `bilgi-merkezi` için Routes girişi gerekir — cetvel yazmıyor (küçük). K10 → B7 |
| 8 Design token | Cetvel sayfa tasarımı yazmıyor — N/A |
| 12 Tenant / app_metadata / cache anahtarı | `tenant_id` ✓; cache anahtarı **yok**, yazma politikası **yok**, önizleme **yok** (B6) |
| 13 Migration | R6 son satırda ✓ |
| 14 Tam iş | R8 zamanlaması ✗ (B11); R2 "kaynak yok/paywall" hata yolu ✗ (B2) |

---

## 3. Öneriler (bulgu → cetvelde somut değişiklik → kalıcı kapı)

**B1 (Kritik) — R5'i iki eksende güçlendir.**
- R5.1 adım 3'ü şöyle yaz: *"Doğrulayıcı iddia tablosunu ALMAZ; metni okuyup KENDİ iddia listesini çıkarır (her sayı, birim, oran, olumsuz iddia, mevzuat hükmü = ayrı satır). Sonra yazarın tablosuyla birleştirir: yazarın tablosunda olmayan iddia = KAPSAM EKSİĞİ, ayrı sayılır ve 0 olmadan tur geçmez."*
- R5.2'ye **tuzak kolu**: *"BLOG her doğrulama turuna en az 3 tuzak (uydurma sayı / var olmayan sayfa numarası / kaynağın söylemediği olumsuz iddia) ekler ve listesini Linear'a yazar. Doğrulayıcı 3/3 yakalamazsa tur geçersizdir; tuzaklar yayın öncesi çıkarılır ve çıkarıldığı md5 ile kanıtlanır."* (K9.7 emsali.)
- Aynı-kaynak-aynı-yanlış için: *"Kaynak dizini satırında aranan sayı birden çok hücrede/bağlamda geçiyorsa (§6.3 'tek adaylı' değilse) DESTEKSİZ yazılır; alıntı hücre yolu ile verilir."*
- Kalıcı kapı: `scripts/rehber/dogrulama-kaydi-kontrol.mjs` — doğrulama kaydı JSON'unda `tuzak_sayisi ≥ 3`, `tuzak_yakalanan == tuzak_sayisi`, `kapsam_eksigi == 0`, `desteksiz == 0` olmadan `status='verified'` yazılamaz (R8 "Doğrulama kaydı" satırı bu dört kolla).

**B2 (Yüksek) — kaynak erişim sınıfı ve tazelik.**
- R2.1'e sütun: *erişim = AÇIK / ÖZET / KAPALI*. Kural: *"KAPALI ve ÖZET kaynaktan sayı alınmaz; yalnız ad ve kapsam anılır (ücretli standartla aynı kural)."*
- R2.3: *"Müşteriye verilen adres, doğrulayıcının açtığı adrestir. Üretici PDF'i için: dizindeki hash ile üreticinin canlı PDF'inin hash'i aynıysa adres verilir; değilse yalnız belge adı + sayfa yazılır ve 'kataloğun 20XX sürümü' ibaresi eklenir."* İç kayda web kaynağı için arşiv anlık görüntüsü (web.archive.org) adresi.
- R7'ye satır: *"Her güncellemede ve en geç 6 ayda bir kaynak listesi betikle açılır (HTTP 200 + atfedilen ifade metinde); ölü/değişmiş kaynak → yazı 'gözden geçiriliyor' durumuna, atıf kalkar."* Kapı: `scripts/rehber/kaynak-tazelik.mjs`, CI haftalık.

**B3 (Yüksek) — evreni düzelt.** R6'daki cümle: *"Bugün `tr.knowledge.topics` 4 anahtar (air-curtain, jet-fan, hrv, hava-perdesi) → 4 × 2 dil = 8 statik sayfa; hub 3'ünü listeler; hiçbiri site haritasında yok."* A seçeneğinin yönlendirme sayısı **10** (8 konu sayfası + 2 hub) ya da `air-curtain` → `hava-perdesi` birleştirme kararıyla 8+2. REC-300 Faz 1-A kuralı (404 değil 308) buraya atıfla yazılır.

**B4 (Yüksek) — rota sınıfı ilanı.** R6 şart tablosuna satır: *"Rota `export const dynamic = 'force-static'` + `generateStaticParams` + RSC `generateMetadata` (title/description/canonical/robots) ilan eder; `searchParams` ve `headers()` okumaz (§1.1). `tests/smoke/ssr-kurallari.ts` yol listesine yazı rotası eklenir (bailout işareti 0)."* Görünüm bileşeni RSC; yalnız etkileşimli uçlar (`'use client'`) — mevcut `TopicPage` **yeniden kullanılmaz**.

**B5 (Yüksek) — tazeleme satırını üçe böl.** R6: *"(a) `rendering-cache-standard.md` §3 ANA tablosuna (ilk `###` alt başlığından önce) `| \`rehber_yazilari\` |` satırı; (b) handler dalı `revalidatePath('/sitemap.xml')` çağırır — cetvel §3 tablosuna 'Ne tazelenir' sütununda yazılır; (c) §3.x tarzı yüzey→tablo tablosu: yazı sayfası `product_families` ve `categories` okuyorsa o tetiklerin dalı yazı yolunu/etiketini de tazeler; kategori sayfası yazıyı listeliyorsa yazı tetiği kategori yolunu tazeler."* Kapı: INV-RENDER-2'ye "sitemap dalı" kolu eklenmesi **ayrı kayıt** (ALTYAPI/URUN) — numarası rapora yazılır.

**B6 (Yüksek) — R6'ya dört satır.**
1. *"Okuma politikası: `tenant_id = jwt_tenant_id() and status = 'published' and deleted_at is null` (anon + authenticated). Yazma politikası: yalnız admin, karar `app_metadata` üzerinden (INV-AUTH-ROLE-2 deseni), `user_profiles.role` ile DEĞİL."*
2. *"Önbellek: yazı verisi `unstable_cache` ile sarılıyorsa anahtar ve etiket `lang` + `tenantId` içerir (`rehberTag(tenantId, lang, slug)`); webhook aynı yardımcıyla etiket üretir (§3.1 'iki uç aynı kiracı')."*
3. *"ÖNİZLEME: `/[lang]/admin/rehber/[id]/onizleme` — `force-dynamic`, `robots: noindex`, admin oturumu zorunlu; taslak yalnız buradan görünür. Vercel dal önizlemesi KAPALI (INV-VERCEL-DAL-1); 'yayınla-bak-geri al' YASAK (R4.8)."*
4. *"Taslak görünmezliği kapısı `scripts/db/checks/` altında INV-ANON-YAZMA-1 düzeneğine bağlanır (anon ile `select` → taslak 0 satır; sabotaj: politikayı düşür → kırmızı)."*

**B7 (Orta) — dil kümesi.** R6: *"`generateStaticParams` yazı başına dil kümesini DB'den okur (`body_en` boşsa `/en/...` üretilmez, `dynamicParams=false` → 404); hreflang ve sitemap `alternates` yalnız iki dil varsa; `EN_YAYIN` bayrağı site haritası/noindex için aynen geçerli (INV-EN-YAYIN-1). INV-DIL-DUSUSU-1 e2e'ye yazı rotası eklenir."*

**B8 (Orta) — K2'yi rehber için daralt.** R0'daki "aynen" → *"K2 biçim 1, 2, 4, 7, 8 ve 'kaynakta/katalogda + eksiklik fiili' kalıpları aynen; `doğrulanmalı`, `kaynak başlığı`, `\>\s*\*`, `[Bb]kz\. yukarı` kolları rehber gövdesinde UYGULANMAZ (ölçüldü: 8 örnekte 3 meşru cümle kırmızı). Kapı kurulmadan önce ilk yazı üzerinde yanlış pozitif sayısı ölçülür ve bu tabloya yazılır."*

**B9 (Orta) — R8 tablosuna 6 satır** (2.9 tablosundaki kapılar; her biri sahip + PR adıyla).

**B10 (Orta) — sayılar.** `adres-semasi-standard.md` atfını *"(yazılacak; bugün yok — REC-300 planı L159)"* diye işaretle ya da kaldır. "Rakibin bota ayrı sayfa vermesi" cümlesine kaynak (ölçüm yöntemi: UA değiştirerek iki çekim, fark) ya da sil. Article önerilen alanlara `author.name`, `author.url` ekle. Rakip yazı adresi Linear iç kaydında dursun (PUBLIC'e değil) ki ölçüm yinelenebilsin.

**B11 (Orta) — zamanlama.** R8 başlığı: *"Her kapı, ölçtüğü parçayı getiren PR'da doğar (kural 14): RLS testi migration PR'ında; doğrulama kaydı kapısı yazıcı betik PR'ında; JSON-LD/sitemap testi rota PR'ında."*

**B12 (Düşük)** — R6'ya: *"Markdown ayrıştırıcı yeni bağımlılıktır → `bagimlilik-kararlari.md` satırı + gerekçe; izin listesi (`h2,h3,p,ul,ol,li,table,thead,tbody,tr,th,td,a[href,rel=nofollow noopener],strong,em,sup`) cetvelde yazılı; sanitize sunucuda."*

**B13 (Düşük)** — R5.1'e gerekçe satırı ve ilk iki yazıda yan yana ölçüm (Fable vs sonnet×2), sonucu Ölçüm geçmişine.

---

## 4. Sonuç

**Genel hüküm: BLOK** — cetvel v0.1 hâliyle uygulamaya (F3/F4) geçmemeli.

Gerekçe, önem sırasıyla: (1) **B1** — karar 62'nin tek sert şartı "uydurma atıf = kırmızı", ama R5 doğrulayıcıyı yazarın tablosuna bağlıyor ve kabul ölçütü kör doğrulayıcıyı da geçirir; sabotaj kolu yok. (2) **B6** — önizleme mekanizması yokken "Recep önizlemeye bakıp onaylar" akışı taslağı yayına zorlar; yazma politikası ve cache anahtarı kural 12'de sessiz. (3) **B3/B10** — cetvel kendi olgusal iddialarında iki yerde kodla çelişiyor (4 konu, var olmayan cetvel dosyası). (4) **B4/B5** — "aynı HTML" ve "tazeleme" şartları bugünkü kapı sınırlarıyla sınanmıyor; §3 alt başlık tuzağı ve sitemap dalı yazılmamış.

**PASS'e dönüşme şartı (v0.2):** B1, B3, B4, B5, B6 düzeltmeleri cetvele işlenir; B2, B7, B8, B9, B11 için en az cümle düzeyi değişiklik + kapı sahibi/PR adı yazılır; B10 sayıları düzeltilir. Bu yapıldığında hüküm **KOŞULLU** olur (koşul: R8 kapılarının ilgili PR'larda gerçekten inmesi, ilk yazıda B8 yanlış pozitif ölçümü ve B13 yan yana model ölçümü).

**Bu raporun sınırı (adıyla):** Search Console, arama önerisi ve rakip ölçümleri Linear'da; doğrulanmadı, "yanlış" da denmedi. Google alıntıları canlı çekimle 3/3 doğrulandı. K2 ölçümü 8 örnek cümleyle yapıldı — küçük örneklem, eğilim gösterir, sayı vermez (kucuk-orneklem dersi); kapı kurulmadan gerçek yazı üzerinde yinelenir.
