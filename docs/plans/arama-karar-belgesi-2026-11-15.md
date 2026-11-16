# Site içi arama: karar belgesi (URN-165, 15 Kasım 2026)

**Soru:** hedef gerçekten iyi arama sonucu. pgroonga yeterli mi, anlamsal/karma arama ya da harici motor gerekir mi?
**Kısa cevap:** çekirdek olarak pgroonga **denenen üç motor arasında en iyisi ve yeterli** (altın küme/yargıç yok, 32 sorgu elle okundu). Kalan kusurların **iki sınıfı** var: (a) veri/sözlük boşlukları: kategori önerisi (URN-139), niyet/eş anlamlı sözlüğü, ürün adının kod olması; (b) **pgroonga'nın kendi tolerans/sıralama davranışı**: "kanal tipi fann" → ilk sonuçlar SULU BATARYA, "125 mm fan" → E 254 (254 mm), "nikotra" 35, "vortis" 174, "fanlar" 350 sonuç. (b) sözlükle kapanmaz; basamak 22 doğrulama ve sıralama kuralının ayarı gerekir (Yol A kapsamında, ölçülerek). Önerim **Yol A (şimdi)**, **Yol B (yalnızca A'dan sonra ölçüp karar, koşullu)**; **Yol C önerilmez**. **Koşul:** A'nın "yeterli" sayılması, canlı gecikme kuyruğunun (2-3 sn) ayrı iyileştirmeyle düşmesine bağlı (§1); düşmezse karar yeniden açılır.
**Cetvel:** `arama-standard.md` (K5.4, K6.4c, K6.7), `arac-envanteri-standard.md` (dış araç dört kapı). Deneme yerelde, canlıya yazılmadı; canlıda yalnız salt-okuma sorgu.

## 1. Ölçülenler (kanıt)

| Konu | Ölçüm (15 Kasım) |
|---|---|
| pgvector | **kurulu değil** (`vector` 0.8.0 kurulabilir, `installed_version` boş); `unaccent` de kurulu değil; pgroonga 3.2.5 kurulu |
| "kasals" 53 sonuç | **Kusur değil.** `arama_marka_es('kasals')` = casals; katalogda Casals markası ve 53 aktif ürünü var; 53 sonucun hepsi basamak 21 (marka düzeltmesi). K6.4c'deki "kasals → 0" örneği eskidi (marka sonradan girdi). Cetvel örneği güncellenecek, `fleksiva` → 0 hâlâ doğru |
| URN-139 kökü | `get_search_suggestions` kategori kolu `arama_normalize(ad) LIKE '%hava%perdesi%'`; kategori adı "Hava Perdeleri" → "perdesi" tutmuyor. Ek toleransı yok. Ürün kolu tutuyor ("Air Door AD …" 4 ürün) |
| Canlı gecikme (Altyapı, kısmi, 81 sıcak ölçüm) | medyan ~180 ms, p90 ~660 ms, uzun kuyruk 2,7–3,3 sn ("jet fan", "vortis"); tek soğuk ölçüm 1,0 sn. Karar 59'daki 10,9 sn (22 Eylül) bugün görülmüyor. **Tam sonuç Altyapı'da (soğuk turlar sürüyor); gelince bu satır güncellenir** |
| Harici motorlar (ALT-192, 27 sorgu) | varsayılan Meili/Typesense Türkçe ek çözümü yok: "fan jet", "duvar tipi aspiratör", "125 mm fan", "VRT-17160" (tam 1) ve büyük İ vakalarında pgroonga'dan kötü; önek genişletmesi yalnız "fan jet"i düzeltti. Yerelde ~5-7 ms, ~92-96 MiB. Meili'nin tek kazancı gecikme |

## 2. Anlamsal arama denemesi (yerel, depo dışı)
Aynı 27 sorgu + 5 niyet cümlesi; 431 ürün; model `multilingual-e5-small` ve `-base` (ONNX q8, node içinde, sunucu yok). **Ölçüldü** (betik çıktısı): 431 belge gömme small 8,3 sn / base 20,9 sn; sorgu gömme ort. 4 / 9 ms; modelin ilk yüklenmesi (indirme dahil) 140 / 325 sn, yalnız ilk kez.

| Sınıf | Bulgu |
|---|---|
| Anlamsal kolun **yardım ettiği** (modele bağlı) | "kanal fanı": small CA IL Rect kanal fanlarını getiriyor, **base** Lineo/CA-RM/Quadro karışık; "sessiz banyo havalandırması" (pgroonga 0): **yalnız small** BRA.VO banyo fanlarını getiriyor, base HRW/BVU getiriyor (BRA.VO yok); "kanal tipi fann"/"kanal tipi fan": anlamsal kol CA IL kanal fanlarını getiriyor, pgroonga SULU BATARYA/AVENS. "hava perdesi": pgroonga zaten 8 sonuç (Air Door AD) veriyor, anlamsalın "H ailesi üstte"si yalnız sıra farkı, yardım kanıtı değil |
| Anlamsal kolun **zarar verdiği** | "fleksiva" ve "zzzqqq" (olmaması gereken sonuç üretir; skorlar small 0,79–0,89, base 0,75–0,87 aralığına sıkışıyor, "yok" diyemiyor, iki modelde de); "VRT-17160" small'da ilk 5 alakasız, base'de ilk sonuç Lineo 100 (yakın); "otopark duman tahliye": small DEUMIDO/HEATMASTER (alakasız), base ATEX aksiyel fanlar (yön olarak makul olabilir, ürün doğrulaması yapılmadı) |
| Small / base | **Yön karışık, "base üstün değil" denemez:** base bazı vakada daha iyi ("125 mm fan" Lineo 125, "VRT-17160" yakın), bazısında daha kötü (sessiz banyo, "duvar tipi aspiratör"). İkisinde de ortak sınır: ürün adının kod olması (VRT-65196, BVU 1000-230W); anlam taşıyan metin kategori + açıklama + aile adı |
| Karma (RRF k=60) | "VRT-17160"ta pgroonga ilk sonucu korur ama **sırayı bozduğu vakalar var**: "vortis" (rrf ilk VORT QBK, pgroonga ilk farklı), "kanal fanı" (small), "nikotra" (iki modelde pgroonga dışı ürünler öne çıkıyor), "aksyel" (base). Güvenli kullanım: yalnız pgroonga **< 3 sonuç** döndüğünde ya da ayrı "benzer ürünler" bloğunda; eşik ve "yok" kararı ayrıca ölçülmeli |

**Sınırlama (dürüst):** değerlendirme 32 sorguda ilk 5 sonucu elle okumakla yapıldı (yargıç yok, altın küme yok, ürün doğrulaması yok); sonuçlar eğilimdir, doğruluk yüzdesi değildir. Anlamsal sınıflandırma modele bağımlıdır (yukarıda model adıyla). Büyük model (bge-m3) bellek %92 olduğu için denenmedi. Ham çıktı: depo dışı `C:/tmp/urn165-anlamsal/` (betik `deney.mjs`, yeniden üretilebilir).

## 3. Yollar

| | **A: pgroonga + sözlük/öneri düzeltmesi** (önerilen) | **B: A + pgvector karma (koşullu)** | **C: Meilisearch / Typesense** |
|---|---|---|---|
| Alaka | Mevcut kalite korunur; URN-139 + eş anlamlı sözlüğü ("kanal fanı", "hava perdesi" → kategori ailesi, "davlumbaz motoru") boşlukları kapatır; hepsi ölçülebilir kural | Ek kazanç yalnız niyet cümlelerinde ("sessiz banyo"), %'si ölçülmedi; kesin sorguda zarar riski (yukarıda), eşikle azaltılır | Varsayılan ayarla pgroonga'dan **kötü** (ALT-192); Türkçe ek/İ çözümü kuralla yeniden yazılmalı, yani aynı işi ikinci motorda tekrar yapmak |
| Gecikme | bugünkü: medyan ~180 ms; kuyruk (2-3 sn) ayrı iyileştirme konusu (indeks/ısınma) | + gömme çağrısı: yerel ONNX 4–9 ms (Edge'de çalışır mı **ölçülmedi**); dış API çağrısı +100–400 ms **tahmin**, ölçülmedi | ~5-7 ms yerelde; canlıda ağ + senkron kuyruğu |
| Maliyet | 0 ek altyapı; 1-2 migration (kural 13, Recep onayı) | pgvector eklentisi (K5.4: kendi migration'ı); 431 ürün için gömme maliyeti ihmal edilir (API ya da yerel); sorgu gömme dış API'ye gidiyorsa KVKK/sorgu metni notu | ek sunucu/konteyner (~100 MiB) + ürün/stok/fiyat değişince indeks eşitleme + ikinci hesap/anahtar |
| Bakım | cetvel + `arama-davranisi.mjs` kapısı mevcut | embedding sütunu tazeleme tetiği (kural: `rendering-cache-standard` ürün değişince), model sürümü sabitleme | ikinci doğruluk kaynağı; senkron kayması "veri değişir, arama değişmez" sınıfı hata |
| Olgunluk (GitHub, 15 Kasım) | pgroonga 762★ (PostgreSQL lisansı, son commit 13 Kas); Supabase ile hazır | pgvector 23,7k★ (PostgreSQL lisansı, 14 Kas); Supabase resmî hybrid-search/RRF rehberi var; `text-embeddings-inference` 5,1k★ Apache-2.0; `FlagEmbedding` 12,3k★ MIT | Meilisearch 59,9k★ (12 Kas); Typesense 27,1k★ GPL-3.0 (13 Kas) |
| Risk | düşük | orta: eşik ayarı, "olmayanı üretme" | yüksek: alaka gerilemesi + eşitleme |

Notlar: pgroonga resmî belgelerinde pgvector ile birlikte tek sorguda kullanım tarifi yok; ayrı iki sorgu + RRF birleştirme gerekir (kendi çıkarımım). Supabase'in yerleşik `gte-small` modeli İngilizce; Türkçe için `multilingual-e5` ya da dış API. TR-MTEB (EMNLP 2025) kıyasına göre multilingual-e5 ailesi Türkçede güçlü genel seçim, bge-m3 rakip; text-embedding-3-small'ın Türkçe sayısına ulaşılamadı.

## 3a. Design Venthub New arama davranışı = hedef davranış (OPS girdisi, 15 Kasım)
Kaynak: Design'ın 6 Kasım tarihli yerel kopyası (`templates/_kart/katalog.js`, `VHKatalog.ara`/`araCekirdek`; `arama-es-anlam.json` TR 41 / EN 36; `arama-sayfa.json`). **Tazelik canlı Design ile doğrulanmadı** (OPS/Tasarım DesignSync ile okuyacak). Bu bir davranış prototipidir: tarayıcıda, katalog anlık görüntüsü (1.164 ürün, 721 KB) üzerinde, motorsuz; RPC, RLS ve canlı fiyat/stok yok. Canlı veri 431 aktif ürün; iki sayı aynı katalog değil, kıyas davranış içindir.

| # | Design davranışı | A: pgroonga + RPC | B: + anlamsal | C: Meili/Typesense |
|---|---|---|---|---|
| D1 | Normalleştirme, çoğul/iyelik eki atma, dolgu sözcüğü (tipi/ve/ile) | Var (K5.1-K5.2a, bigram ek toleransı); dolgu listesi eklenir | A ile aynı | Kuralla yeniden yazılır (ALT-192: varsayılan eksik) |
| D2 | Puan sırası: tam → baştan → her sorgu sözcüğü ad sözcüğünün başı → içinde; eşitte kısa ad, alfabe | Kısmen (`arama_ad_isabeti`); dört kademe `ORDER BY`'a eklenir | A ile aynı | Ranking kuralı özelleştirilir |
| D3 | Gruplu sonuç (ürün grubu, tür, seri, model, marka, sayfa) + "doğrudan git" | **RPC genişler**: kategori kolu ek toleranslı (URN-139), seri=aile, sayfa tablosu; "doğrudan git" kuralı sunucuda | A ile aynı | Çoklu indeks (kategori/marka/ürün); senkron gerekir |
| D4 | Eş anlam yalnız veriden (`esit/eski/yazim/genis/ihtiyac`, hedef `kok/dal/marka/aile`) | `arama_es_anlam` tablosu (veri, kodda liste yok); admin düzenler | **"ihtiyac" tipini anlamsal yapma**: e5 "otopark duman tahliye"de yanlış verdi; elle veri güvenilir | Synonyms yerleşik, hedef türleri yok |
| D5 | Sonuçsuzsa "Bunu mu demek istediniz" (Levenshtein, KORU listesi), sonra sözcük bırakarak gevşetme + uyarı | `levenshtein` kurulu; öneri satırı üretilir | A ile aynı | Typo yerleşik, "Bunu mu" yok |
| D6 | Sayısal süzgeç (Ø, mm, IP, ATEX), "<model> için <tür>" | `fts_search_products(p_filters jsonb)` var; sorgu ayrıştırma RPC ya da API katmanında | A ile aynı | Filtre alanı indekse eklenmeli (ALT-192'de teknik alan yoktu) |
| D7 | SKU/model kodu | Var ("VRT-17160" tam 1) | Zarar riski (§2) | ALT-192: tam 1 olmalı vakada zayıf |
| D8 | Son aramalar / son bakılanlar | İstemci, motordan bağımsız | aynı | aynı |

**Design ↔ `arama-standard.md` çelişkileri (ayrı satır; karar Recep/OPS):**
1. **Çıktı biçimi:** Y1 cetveli "4 ürün + 2 kategori + 2 marka" diyor; Design **grup/tür/seri/model** hiyerarşisi + doğrudan git. Cetvel Y1 güncellenmeli (Design hedef olduğu için).
2. **Yazım hatası:** cetvel K6.4b/K6.4c **sessizce düzeltir ve sonuç döndürür** (marka sözlüğü, basamak 21); Design **önce sonuçsuzsa sorar** ("Bunu mu…"). İkisi birlikte olabilir (sessiz düzeltme + "X için gösteriliyor"), ama hangisinin varsayılan olduğu karar ister.
3. **Gevşetme:** cetvel basamak 3 uyarısız çoğunu eşler; Design uyarı gösterir ("q2 için gösteriliyor"). Uyarı cetvele eklenmeli.
4. **Veri kaynağı:** Design tarayıcıdaki anlık görüntü; cetvel §7 (K7.1 `SECURITY INVOKER`, tenant, kural 12) ve `rendering-cache-standard` (veri değişir, arama değişmez hatası). **Ürün sitesine geçince prototip JS'i olduğu gibi taşınamaz**: tüm katalog istemciye iner (721 KB senkron XHR), fiyat/stok bayatlar, tenant sınırı yok. Ölçek: 1.164 üründe ~19 ms, 10 katında ~200 ms (OPS ölçümü); RPC'ye taşımak şart.
5. **Eş anlam yeri:** Design verisi dosyada (JSON); canlıda tablo + admin ekranı ve DB tetiği gerekir (cetvel §11 tazeleme).

**Siteye geçince (Recep sorusu) ne olur:** Design'ın JS kuralları **şartname** olur (D1-D8 + vaka listesi `arama-davranisi.mjs` kümesine eklenir), motor A (pgroonga RPC) olur; Design'ın veri dosyaları (`arama-es-anlam`, `arama-sayfa`) canlıda tablolara taşınır. Bu ayrıntılar B ya da C seçilse de aynı kalır; motor kararı davranışı değiştirmez, yalnız uygulama maliyetini.

## 4. Ortak katman (ürün seçim asistanı, OPS-287)
Asistanın asıl ihtiyacı **yapılandırılmış özellik süzgeci** (debi, basınç, çap, ses; `technical_specs`), anlamsal benzerlik değil. Ortak katman olacaksa: tek `product_search_index` + (B seçilirse) opsiyonel embedding sütunu; ikisi aynı `arama_indeksi_tazele` tetiğinden beslenir. Bugün için ortak kod gerektirmez; B uygulanırsa asistan "benzer ürün" için aynı sütunu kullanır.

## 5. Önerilen sıra
1. **A (bu hafta, bende):** URN-139 kategori önerisi (ek toleranslı eşleşme; tokenizer seçimi K6.7'den bağımsız, "iki sütun iki indeks" ayrımı bozulmaz), eş anlamlı/niyet tablosu, **(b) sınıfı için pgroonga tolerans/sıralama ayarı** ("kanal tipi fann", "125 mm fan", "nikotra", "vortis" 174): önce vaka kapısına kırmızı vaka olarak eklenir, sonra ayarlanır; `arama-davranisi.mjs` kümesine marka vakası **veriye bağlı yazılmaz**: "kasals → Casals markası katalogdaysa ≥1 ve hepsi o marka, değilse 0" (bugün 53 ürün, hepsi Casals; 53/53 ölçüldü) ve `fleksiva` (0); K6.4c örneği ve **K5.4 metni** (bugün: pgroonga kurulu, vector kurulabilir, unaccent kurulu değil) güncellenir; migration varsa Recep onayı.
2. **A sonrası ölçüm:** aynı 27+5 sorgu ve Recep'in gerçek arama günlüğü (`arama günlüğü` §10) ile "sıfır sonuç / ilk sonuç yanlış" oranı; **boşluk hâlâ doğal dil cümlelerindeyse** B'yi koşullu (yalnız n<3) deneriz.
3. **Gecikme kuyruğu (2-3 sn, "jet fan", "vortis") ayrı kart olarak açılır** (Altyapı soğuk turları bitince): A'nın "yeterli" hükmü bu kuyruğun indeks/ısınma ile düşmesine bağlıdır. **C** açılmaz; yalnız kuyruk pgroonga ile çözülemezse yeniden bakılır.

**Not:** 431 ürün canlı bugünkü aktif katalog; REC-340 ölçümünün 442'si 16 Eylül tarihli (fark katalog değişimi). Gecikme satırı "kısmi" (81 sıcak, 1 soğuk ölçüm): "10,9 sn bugün görülmüyor" cümlesi **sıcak tur için** doğrudur, soğuk tur sonucu gelmeden kesin değildir. Çürütücü (urun-curutucu) bulguları 2, 3, 4, 7 işlendi; doğrulama notu: alt ajan canlı veriyi yeniden ölçemedi, "kasals 53/53 Casals" benim canlı sorgumdur.

**Açık/ölçülmedi:** (3) B2B/HVAC sitelerinin arama davranışı bu belgede **yok** (ayrı ölçüm gerekir); Altyapı'nın soğuk gecikme turları; Edge'de ONNX çalıştırma; bge-m3; gerçek arama günlüğü.

## 6. Kurumsal çözümler: yerel OpenSearch denemesi (URN-170, 16 Kasım 2026)

**Soru:** pgroonga yerine ya da yanında OpenSearch gibi bir motor, bizim 27 sorgumuzda daha iyi ilk sonuç veriyor mu?
**Cevap:** hayır. Aynı 431 aktif ürün, aynı 27 sorgu: OpenSearch 2.17.1 (Türkçe analizör: apostrophe, tr_lower, asciifolding, tr_stemmer; katmanlar and, bulanık, gevşek) sonuç sayısında 27 sorgunun 21'inde pgroonga ile aynı çıktı; kalan 6'sında sapma var ve **ilk sonuç kalitesi pgroonga'dan iyi değil, dört vakada kötü**:
- "125 mm fan": pgroonga 36 sonuç, ilk **Lineo 125** (doğru); OpenSearch 14 sonuç, ilk **E 304 M ATEX** (yanlış çap).
- "kasals": pgroonga 53 (hepsi Casals); OpenSearch bulanık katmanda 73, ilk sonuç **SULU BATARYA** (ilgisiz).
- "duvar tipi aspiratör": pgroonga 40; OpenSearch gevşek katmana düşüp 161 döndürdü (kesinlik kaybı).
- "aspiratr": pgroonga 25, OpenSearch 38; "vortis" ve "nikotra" sayıları aynı (174 ve 35), ilk sonuçlar farklı ve OpenSearch'inki aranan marka ürünü değil.

Sıfır sonuç vakaları ("fleksiva", "zzzqqq") iki motorda da 0. OpenSearch'in kazandığı bir vaka yok.

**Ölçüm koşulu ve sınırı.** Yerel tek konteyner, 1 GB sınır, 512 MB heap; 431 belge yüklemesi 312 ms; sorgular 10-97 ms (ağsız, küçük veri: canlı gecikmeyle **kıyaslanamaz**, kanıt sayılmaz). Konteyner bellek tavanına yakın çalıştı (972 MiB / 1 GiB). Kıyas betiği depo dışı (C:/tmp/urn170/opensearch-kiyas.cjs), ham çıktı opensearch-sonuc.json. Alan ağırlığı, eşanlamlı ve sayısal süzgeç ayarı yapılmadan "kutudan çıktığı gibi" koşuldu; ince ayarla sonuç değişebilir.

**Maliyet tarafı (ölçülen).** Ek hizmet: ayrı süreç ve en az 1 GB bellek, indeks senkronu (arama_indeksi_tazele tetiği ayrıca kurulmalı), tenant kapsamı (mutlak kural 12) uygulama katmanında yeniden yazılmalı. pgroonga veritabanı içinde, RLS ve tenant kapsamıyla birlikte geliyor.

**Dış hizmetler (Algolia, Typesense, Meilisearch, Elastic bulut) için fiyat ve özellik karşılaştırması bu belgede YOK:** resmî fiyat ve özellik sayfalarından doğrulanmadığı için yazılmadı. Dış araç kararı dört kapılıdır (arac-envanteri-standard.md); ihtiyaç kapısı bugün kapalı, çünkü §1'deki kusurların iki sınıfı da motor değişimiyle değil sözlük ve tolerans ayarıyla kapanıyor.

**Öneri:** Yol A kalır (pgroonga + sözlük + tolerans ayarı). Motor değişikliği için gerekçe yok; doğal dil cümleleri ölçülürse B (anlamsal) koşullu yeniden açılır. OpenSearch'e geçilecekse önce aynı 27 vakaya ağırlık ve eşanlamlı ayarı yapılıp yeniden ölçülmeli.

### 6.1 Resmî sayfa ölçümü: ücretli ve açık kaynak seçenekler (16 Kasım 2026)

**Yöntem ve çekince.** Araştırmacı ajan 19 resmî adresi okudu; sayfa özetleyen küçük model kullanıldığı için tek koşumdur. Üç çelişkili kalem ham sayfa metniyle ikinci kez ölçüldü (aşağıda işaretli). Hiçbir satıcı 431 ürün ve düşük trafik için aylık tutarı sayfada hesaplamıyor; (b) sütunu yalnız sayfada yazan başlangıç rakamıdır, bizim için hesaplanmış tutar değildir. "Ölçülmedi" = sayfada yok ya da sayfa açılmadı; tahmin yazılmadı.

| Ürün | Ücretsiz katman | Aylık rakam (sayfada yazan) | Türkçe | Vektör/anlamsal | Lisans / kendi sunucu | Kaynak |
|---|---|---|---|---|---|---|
| Algolia | Grow: 0 $/ay, 10K arama/ay, 50K kayıt (ham sayfada yalnız 50K görüldü; ajanın okuduğu "100K" doğrulanamadı) | Elevate özel fiyat | ölçülmedi | NeuralSearch (anahtar kelime + anlamsal) | SaaS | algolia.com/pricing |
| Elastic Cloud | yok, deneme var | rakam yok | ölçülmedi (doküman 404) | var (vektör) | SaaS | elastic.co/pricing |
| Doofinder | yok, deneme | Basic 49 $ (yıllık 44 $), Pro 149 $, Advanced 349 $ (ham sayfada $49/$44/$149/$349 görüldü; ajanın "149 €" ifadesi Pro'ya ait olabilir) | dil listesinde yok | "anlamsal" ifadesi yok; AI Guided Search | SaaS | doofinder.com/en/pricing |
| Klevu (Athos) | yok | "fiyat iste" | yazmıyor | hibrit arama | SaaS | athoscommerce.com/pricing |
| Coveo | yok, deneme | "fiyat iste" | yazmıyor | AI arama | SaaS | coveo.com/en/pricing |
| Bloomreach | yok | genel fiyat yok; küçük markalar için yıllık en az 60 bin $ (sayfa ifadesi) | yazmıyor | AI arama | SaaS | bloomreach.com/en/pricing |
| Typesense | ücretsiz küme var (sınır yazmıyor) | ölçülmedi | yazmıyor | dolaylı (embedding) | sayfada lisans yok | cloud.typesense.org |
| Meilisearch | Cloud 14 gün deneme, kalıcı ücretsiz yok | XS yaklaşık 20 $/ay (başlangıç; bölgeye göre 14,88 $ görüldü) | **EVET, doküman tablosunda Turkish (noktalı/noktasız i özel işleme); ham sayfada doğrulandı** | evet (tam metin + vektör + hibrit) | MIT | meilisearch.com/pricing, /docs/learn/resources/language |
| OpenSearch | yönetilen için ölçülmedi | ölçülmedi | ölçülmedi (yerelde analizörle çalıştı, §6) | ölçülmedi | Apache 2.0 | opensearch.org/faq |
| Elasticsearch | ölçülmedi | ölçülmedi | ölçülmedi | var | ELv2 ve SSPL; güncel lisans listesi doğrulanamadı | elastic.co |
| Vespa | çekirdek ücretsiz; bulut deneme kredisi | saatlik vCPU/bellek/disk; aylık ölçülmedi | ölçülmedi | evet (vektör, sözcük, hibrit) | Apache 2.0 (çekirdek) | vespa.ai/pricing |
| Qdrant | ücretsiz tek düğüm 1 GB RAM / 4 GB disk | kullanıma bağlı | ölçülmedi | yalnız vektör | sayfada yok | qdrant.tech/pricing |
| Weaviate | Sandbox ücretsiz (100K nesne, 1 GB) | Flex 45 $/ay, Premium 400 $/ay'dan | ölçülmedi | evet, hibrit | sayfada yok | weaviate.io/pricing |
| ParadeDB | topluluk sürümü kendi sunucuda ücretsiz | bulut özel önizleme | ölçülmedi | kısmi (beta) | AGPL-3.0 | paradedb.com/pricing |

**Okuma (objektif).** Bu 14 satırda Türkçe desteği resmî sayfada açıkça yazan tek ürün Meilisearch'tir; gerisi ya yazmıyor ya ölçülmedi, bu "desteklemiyor" demek değildir. Meilisearch'in daha önce yerelde ölçülmüş kıyası (URN-165) ve bu bölümün OpenSearch kıyası aynı sonuca varıyor: ek motor, mevcut pgroonga'nın ilk sonuç kalitesini geçtiğini göstermedi. Ücretli hizmetlerin 431 ürün için gerçek tutarı satış görüşmesi gerektiriyor; bugün bu görüşme yapılmadı.

**Kendi model eğitimi (ince ayar).** Hazır embedding modeli etiketsiz kullanılır; ince ayar sizin sorgu-ürün çiftlerinizle yeniden eğitimdir. Birincil kaynakta tipik örnek sayısı rakamı **bulunamadı: ölçülmedi**. Bu sitede gerçek arama trafiği bugün neredeyse sıfır olduğundan ince ayar için gereken sorgu-tıklama günlüğü yoktur; önce eş anlamlı tablosu ve tolerans ayarı (Yol A), veri birikince ince ayar değerlendirilir.
