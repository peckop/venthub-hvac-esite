# REC-313 — graphify denemesi (2026-09-13, ALTYAPI)

> Emir: REC-313 (OPS, 2026-09-12; Recep onayı REC-311 Faz 1). Bu belge ÖLÇÜM raporudur;
> her sayı bu makinede bu tarihte koşulmuştur. Ölçülmeyen kalem "ölçülmedi" yazar.
> Hüküm §7'de, Recep'e giden kararlar §8'de.

## 0. Kaynak doğrulaması (emirdeki KAYNAK/CETVEL bloğu sınandı)

Emir, paket adının `graphifyy` (çift y) olduğunu ve diğerlerinin sahte olduğunu söylüyordu.
Kurulumdan ÖNCE ölçüldü:

| İddia | Ölçüm | Sonuç |
|---|---|---|
| PyPI paketi `graphifyy` | `pypi.org/pypi/graphifyy/json` → HTTP 200, sürüm **0.9.61**, 229 yayın | DOĞRU |
| Depo `Graphify-Labs/graphify` | paketin üç `project_urls` alanı da o depoyu gösteriyor | DOĞRU |
| 117k★ | GitHub API: **116.380** yıldız, 11.370 fork | DOĞRU |
| Apache-2 | `spdx_id: Apache-2.0` | DOĞRU |
| Python | `language: Python`, `requires_python >=3.10` | DOĞRU |
| Canlı proje | son push 2026-09-12, 1.325 açık konu, arşivlenmemiş | DOĞRU |

Paket adı tipo-taklidi (typosquat) değil: PyPI kaydı doğrudan o depoya bağlı.

**Kurulum:** `uv tool install graphifyy` → **8,1 sn**, iki çalıştırılabilir
(`graphify`, `graphify-mcp`). uv zaten kuruluydu (0.8.4).

### Telemetri

Emir "telemetri varsa KAPALI" diyordu. Ölçüm:

- Pakette `posthog`/`analytics`/`mixpanel`/`segment` izi **yok**.
- `requests.post` / `urllib.request.urlopen` / `httpx.` çağrısı yapan **tek dosya yok**.
- Tek kayıt mekanizması `querylog.py` (80 satır): **yerel dosyaya** yazar ve
  varsayılan KAPALI (`GRAPHIFY_QUERY_LOG_ENABLE=1` ile açılır). Kodun kendi yorumu:
  *"no-telemetry posture, so it is OFF unless explicitly enabled"*.
- Yine de her koşumda `GRAPHIFY_QUERY_LOG_DISABLE=1` verildi (geri-uyum anahtarı, kazanır).

⛔**Bu ölçümün sınırı:** kaynak kodu tarandı, **ağ trafiği dinlenmedi**. "Dışa veri gitmiyor"
kanıtı statik okumadır, paket yakalama değildir.

## 1. Adım A — yalnız KOD, LLM'siz

`graphify extract . --code-only`, dal `altyapi/rec313-graphify-denemesi`, temiz ağaç,
commit `56385a7a0`.

**LLM'siz olduğu KANITLANDI, beyan edilmedi:** sanal ortamda `openai`/`anthropic`/`google`/
`httpx`/`requests` kütüphanelerinin **hiçbiri kurulu değil**, ve yedi API anahtarının
(`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`,
`DEEPSEEK_API_KEY`, `MOONSHOT_API_KEY`, `KIMI_API_KEY`) **uzunluğu 0**. Yani bu adım
para harcayamazdı. (Anahtarlar uzunlukla ölçüldü; varsayılan-değer kalıbı DEĞERİ basar.)

| Ölçüm | Değer |
|---|---|
| Süre | **56,3 sn** (16 işçi paralel AST) |
| Sınıflandırılan dosya | 1846 kod · 0 belge · 0 makale · 0 görsel |
| Düğüm | **9.002** |
| Kenar | **17.885** (hiper-kenar 0) |
| Topluluk | 723 |
| `graph.json` | **10.181.569 bayt** (9,7 MB) |
| Toplam çıktı dizini | **15 MB** (`graph.json` + `manifest.json` + `.graphify_analysis.json` + `cache/`) |
| Kenar kökeni | `_origin: ast` → **17.885 / 17.885** (LLM payı SIFIR) |
| **EXTRACTED / INFERRED** | **17.684 / 201** → %98,9 kesin, %1,1 çıkarım |
| Güven puanı | 1,0 → 17.684 · 0,85 → 198 · 0,8 → 3 |

Kenar türleri: `contains` 6.917 · `imports_from` 3.832 · `imports` 3.305 · `calls` 2.709 ·
`rationale_for` 278 · `method` 261 · `indirect_call` 198 · `references` 177 (+6 tür).

`diagnose multigraph`: kayıp uç 0, sarkan uç 0, öz-döngü 0, birebir yinelenen kenar 0,
aynı-uçlu çökme 0. Yani **kenar kaybı yok** — 17.885 kenar 17.885 ayrık uç çiftine karşılık geliyor.

### İki ölçülmüş kusur

1. ⛔**252 `.sql` dosyası grafiğe HİÇBİR ŞEY katmadı.** Aracın kendi uyarısı:
   *"a dependency is missing: tree_sitter_sql not installed"*. Çözümü ek paket
   (`graphifyy[sql]`). Bizim için bu küçük bir eksik değil: `supabase/migrations/**`
   tam olarak o 252 dosyanın içinde ve prod şemamızın tek yazılı kaynağı orası.
   **Bu hâliyle graphify migration'larımıza kördür.**
2. 2 dosya söz dizimi hatasıyla kısmen çıkarıldı: `pricingAdmin.service.ts`
   (L238'den itibaren, 28 sembol alındı) ve `AdminReturnsPage.integration.test.tsx`
   (L46, 1 sembol). ⚠Bu dosyalar `tsc` ile DERLENİYOR — yani hata bizde değil,
   graphify'ın TypeScript ayrıştırıcısında. Sessiz kısmi çıkarma, grafiğe güvenen
   bir cevabın eksik olmasına yol açar ve araç bunu satır satır söylemiyor, özet uyarı veriyor.

Ek not: araç 3 dosyayı "muhtemelen hassas" diye **atladı** (`.env.example.notifications`,
`supabase-root-2021-ca.pem`, `tokens.md`) ve 122 dosyayı sınıflandıramadı. Atlama davranışı
doğru yönde; ölçüldü, sorun çıkarmadı.

### codegraph 1.6.0 ile yan yana

| | codegraph 1.6.0 | graphify 0.9.61 |
|---|---:|---:|
| Dosya | 1.339 (indeksli) | 1.846 (sınıflandırılan kod) |
| Düğüm | **14.997** | 9.002 |
| Kenar | **28.349** | 17.885 |
| Tazelik | ~1 sn (dosya izleyici) | 56 sn (tam koşum) |
| Yön | **yönlü** | ⛔`directed: false` — **yönsüz** |
| SQL | kapsıyor | ⛔252 dosya boş geçti |

⚠**Bu tablo "codegraph 1,7 kat zengin" DEMEK DEĞİLDİR — evrenler aynı değil.** graphify
`.archive/`, `registry/_legacy/`, Python betikleri ve `package.json` gibi dosyaları da
düğümleştiriyor; codegraph'ın 1.339'u ise kendi indeks kapsamı. İki sayıyı aynı cetvelle
karşılaştırmak için tek bir dizinde koşmak gerekir; **o ölçüm YAPILMADI.**

`directed: false` kalemi ise cetvelden bağımsız gerçek bir fark: `diagnose`
`post_build_graph_type: Graph` diyor. Kenar kayıtları yön bilgisini taşıyor (source/target
ayrı), ama grafiğin kendisi yönsüz kurulmuş. "Kim çağırıyor" ile "neyi çağırıyor"
ayrımı gezinti yönünden değil, komut seçiminden geliyor (§2'de ölçüldü).

## 2. Adım B — beş soru, iki araç, aynı metin

⚠**EMİRDEN SAPMA (kayıt kazandı):** OPS'in compact sonrası mesajı "aynı 3 soru" diyordu,
Linear kaydındaki B maddesi **beş adlandırılmış soru** listeliyor. Kayıt SSOT olduğu için
beşi koşuldu.

`graphify query` beş soruda, her biri tek koşum:

| # | Soru | Süre | Çıktı | Hüküm |
|---|---|---:|---:|---|
| 1 | productRoute 308 zinciri | 1.257 ms | 462 kelime | **EKSİK** |
| 2 | fiyat hangi yüzeyde görünür | 1.429 ms | 476 kelime | **YANLIŞ** |
| 3 | K3-b adres kuralı nerede yazılı | 1.412 ms | 418 kelime | **YANLIŞ** |
| 4 | `Routes.product` kimler çağırıyor | 1.272 ms | 316 kelime | **YANLIŞ** |
| 5 | `getCategoryDisplayName` değişirse ne bozulur | 1.211 ms | 450 kelime | **EKSİK** |

Beşi de ~1,3 sn ve ~2.000 token bütçesi içinde. **Hız tartışmasız; isabet değil.**

**Neden yanlış — kök sebep tek:** `query` başlangıç düğümlerini kelime eşlemesiyle seçiyor
ve Türkçe docstring'lere de çarpıyor. Ölçülmüş örnekler:

- Soru 4, `['routes', 'PRODUCT']` ile başladı: `routes` → `scripts/generate/generate-next-routes.js:L21`
  içindeki bir yerel değişken, `PRODUCT` → `pricing.resolve.test.ts:L84` içindeki bir test sabiti.
  Dönen 21 düğüm tamamen **fiyatlandırma servisinin içi**. Gerçek `Routes` nesnesi
  (`src/utils/routes.ts`) cevapta **hiç yok**.
  Yer gerçeği: `grep -rln "productRoute|Routes\.product" src/` → **39 dosya**. Kesişim ~0.
- Soru 5, doğru düğümle başladı (`getCategoryDisplayName()`) ama ikinci başlangıç düğümü
  `registry/_legacy/manage_registry.py:L484`'teki *"Disk Dostu Pulse: Sadece içerik değişirse yazar."*
  docstring'i oldu. 257 düğüm bulundu, **73'ü gösterildi, 184'ü kesildi.**
- Soru 2, `FIYAT` kelimesini `scripts/skills-eval-run.mjs:L35`'teki bir sabitle eşledi.
- Soru 3 bir BELGE sorusu: `--code-only` grafikte belge yok, dolayısıyla cevaplanamazdı.
  Araç bunu "bilmiyorum" diye söylemiyor, alakasız 133 düğüm döküyor. **Sessiz yanlış,
  bizim en sevmediğimiz sınıf.**

Dördü beşi de "TRUNCATED: showing X of Y nodes" uyarısı verdi — yani araç kestiğini söylüyor,
bu dürüst. Ama kesilen kısımda cevap olabileceğini de söylüyor.

### Aynı sorular doğru komutla: `affected`

`query` bu iş için yanlış komut. Emirdeki soru 4 ve 5 "ters gezinti" soruları ve aracın
bunun için ayrı bir komutu var. Aynı sorular `affected --depth 3` ile:

| Giriş | Süre | Sonuç |
|---|---:|---|
| `productRoute` | 708 ms | *"No unique node match"* — çıplak ad tutmuyor |
| `productRoute()` | 703 ms | **DOĞRU**: `Page() [calls] page.tsx:L156`, `products/[slug]/page.tsx [imports] L30`, `productRoute.test.ts [imports] L23` |
| `getCategoryDisplayName()` | 697 ms | **DOĞRU**: 60 etkilenen düğüm, `ProductDetailBody() page.tsx:L489`, `generateMetadata() L122`, `Page() L201` … |

Yani araç doğru cevabı **veriyor**, `query` onu bulamıyor. `affected` 0,7 sn'de
dosya:satır düzeyinde gerçek çağıran listesi üretiyor ve parantez gerektiriyor
(`ad` değil `ad()`) — bu kullanım bilgisi hiçbir yerde yazılı değil, ölçümle bulundu.

### codegraph tarafı, aynı iki soru

**Soru 1 (308 zinciri):** codegraph tek çağrıda `resolveProductRoute`'un **birebir kaynağını**
döndürdü ve zincirin dört adımı kodun kendi yorumunda yazılı: aile+aktif varyant → PDP ·
varyantsız aile → seri landing (200) · varyant slug'ı → kanonik aile adresine **308** ·
hiçbiri → gerçek 404. Ayrıca `unavailable`'ın 404 OLMADIĞI gerekçesi de geldi
("geçici arıza SEO'da kalıcı hasara dönüşürdü"). **Tam ve doğru.**

**Soru 5:** codegraph 4 doğrudan çağıranı adlandırdı ve `getCategoryDisplayName`'in
birebir kaynağını verdi — içinde 2026-09-01'de canlıda ölçülmüş kusurun kaydı duruyor
(`t` atlanırsa sözlük adımı hiç çalışmaz, İngilizce sayfada Türkçe ad basar; kapı
`INV-KATEGORI-ADI-1`). **"Ne bozulur" sorusunun cevabı buydu** ve graphify'ın 60 düğümlük
listesinde bu bilgi yok, olamaz da: graphify kaynak metni döndürmüyor, düğüm adı döndürüyor.

| Eksen | Kazanan | Ölçüm |
|---|---|---|
| Hız | **graphify** | 0,7–1,4 sn · codegraph çağrısı belirgin şekilde ağır |
| Token maliyeti | **graphify** | ~2.000 token tavanı · codegraph tek çağrıda binlerce satır kaynak döktü |
| "Kim çağırıyor" | **berabere** | ikisi de doğru; graphify `affected()` ile, codegraph doğrudan |
| "Ne bozulur / niçin böyle" | **codegraph** | birebir kaynak + yorum; graphify'da kaynak metni YOK |
| Doğal dilli soru | **codegraph** | graphify `query` 5'te 2 yanlış, 2 eksik |
| Belge sorusu | **ikisi de HAYIR** | graphify `--code-only` belgeyi almadı; codegraph kod indeksi |
| Kendi bayatlığını söyleme | **codegraph** | "edited Xms ago, pending sync" uyarısı verdi; graphify sessiz |

⭐**Ölçümün açığa çıkardığı asıl şey:** bu iki araç aynı işi iki kalitede yapmıyor,
**farklı iki işi** yapıyor. codegraph "bu kod ne yapıyor ve niçin" sorusunun aracı
(kaynak + gerekçe). graphify "bu sembol nereye dokunuyor" sorusunun aracı (ucuz, geniş,
metinsiz). Birinin cevabı diğerinin yerine geçmiyor.

### graphify'ın bizde karşılığı OLMAYAN çıktıları

Bunlar codegraph ile karşılaştırılamaz, çünkü bizde yok:

- `god-nodes` — mimari merkezleri sıralıyor, **0,8 sn**, LLM'siz. Ölçülen ilk sekiz:
  `useI18n()` **476 kenar** · `react` 443 · `vitest` 366 · `lucide-react` 165 ·
  `useLocalizedRoutes()` **126** · `supabaseBrowserClient` 77 · `@supabase/supabase-js` 76 ·
  `Database` 74. ⭐İlk iki *kendi* sembolümüz tam da paylaşılan-primitif kuralımızın
  konusu olan ikisi — bu liste bedava bir risk haritası.
- 723 topluluk kümelenmesi (Louvain benzeri), `graph.html`, Obsidian/GraphML/Neo4j/SVG dışa aktarma.
- `--postgres DSN` ile canlı şemadan tablo/görünüm/fonksiyon/FK çıkarma. ⛔**Denenmedi ve
  denenmemeli**: prod DB'ye bağlanır, bizde prod okuma/yazma Recep kapısıdır.
- Çapraz-depo birleşik grafik (`global add`, `merge-graphs`).

## 3. `graph.html` — Recep'e gösterilecek görsel

Üretildi: `graphify-out/graph.html`, **497.603 bayt**, 866 ms.
9.002 düğüm 1.500 sınırını aştığı için araç kendiliğinden **topluluk özeti** görünümüne
düştü: 723 topluluk düğümü, 1.191 topluluklar-arası kenar.

⛔**Ama şu hâliyle bir insana neredeyse hiçbir şey anlatmıyor:** toplulukların
**723'ünün 723'ü adsız** ("Community 0", "Community 1", …). Ölçüldü: `grep -o "Community [0-9]*"`
→ 723 ayrık etiket, ve `graphify-out/` içinde etiket dosyası yok. Topluluk adlandırma
**LLM ister** (`label` / `cluster-only --backend=…`) ve o adım Adım C'nin parçası.

Yani görsel harita, belge geçişi kararı verilmeden Recep'e "bak ne güzel" diye
gösterilebilecek bir şey değil. Adsız 723 baloncuk.

## 4. Adım C — belge geçişi MALİYETİ (tahmin; KOŞULMADI)

Kapsam emirde sabit: yalnız `docs/standards/` + `docs/proje-takip/linear/`.
PDF ve `venthub-pdf-ingestor` **geçilmez** (K15).

**Ölçülen evren:** 85 markdown dosyası, **1.604.480 bayt**, 202.036 kelime.
(`docs/standards` 73 dosya / 1.372.320 bayt · `docs/proje-takip/linear` 12 dosya / 232.160 bayt.)

**Türetilen tahmin** (ölçüm değil, ikisi de açıkça tahmin):

| Kalem | Alt sınır | Üst sınır | Dayanak |
|---|---:|---:|---|
| Girdi token | ~401.000 | ~535.000 | bayt/4 ve bayt/3 (Türkçe diakritik token'ı şişirir) |
| Anlamsal parça | 7 | 9 | `--token-budget` varsayılanı 60.000/parça |
| Topluluk adlandırma çağrısı | 8 | 8 | 723 topluluk ÷ `--batch-size` 100 |
| **Toplam model çağrısı** | **15** | **17** | ikisinin toplamı |

**Arka uç:** API anahtarı yok (yedisi de uzunluk 0), LLM kütüphanesi kurulu değil, ama
`claude` CLI PATH'te (`/c/Users/alize/.local/bin/claude`) ve araçta `claude-cli` arka ucu
var. Yani bu iş **abonelik kotasından** gider, fatura üretmez — 09-13'teki yerleşik sınav
ölçümüyle aynı sınıf. `claude-cli` seçildiğinde eşzamanlılık zorla 1'e düşüyor, yani
15–17 çağrı **sırayla** koşar.

⚠**USD rakamı vermiyorum ve bu bilinçli.** Elimdeki tek gerçek referans bugünkü sınavın
36 ajan koşumu için ürettiği 5,76 USD eşdeğeriydi; o koşumlar çok turlu ajanlardı,
buradaki 15–17 çağrı ise tek turlu özetleme. İkisini oranlamak yanlış bir sayı üretir.
Söyleyebileceğim ölçülmüş şey: **400–535 bin girdi token, 15–17 sıralı çağrı, abonelikten.**

⛔KOŞULMADI. Karar Recep'in.

## 5. Kurulum ne ekliyor — ÖLÇÜLDÜ, KOŞULMADI

Emir "`graphify install --project` kanca/komut eklerse NE eklediğini yaz" diyordu.

**Komut izin katmanı tarafından REDDEDİLDİ** ("Unauthorized Persistence"). Reddi kılık
değiştirip tekrar denemedim. Yerine kurulu paketin kaynağı okundu
(`install.py:653`, salt-okuma) ve `--project` bayrağının gerçekten var olduğu görüldü —
`--help` metni onu yazmıyor, `_print_install_usage()` yazıyor. Yaptıkları:

1. `.claude/skills/graphify/SKILL.md` + `references/` kopyalanır.
2. ⛔**`.claude/CLAUDE.md`'ye "always-on" blok EKLENİR.** Metni kodda sabit
   (`_skill_registration`): bir `# graphify` başlığı, skill yolu, ve şu cümle —
   *"When the user types `/graphify`, use the installed graphify skill or instructions
   before doing anything else."* `_register_always_on_block` dosyayı okur, içinde
   "graphify" yoksa **sonuna yazar**.
3. `--strict` bayrağı ayrı bir davranış getiriyor, kendi yardım metniyle:
   *"block the first raw file read per session until one …"* — yani oturumun ilk ham
   dosya okumasını **engelleyen** bir kapı.

⛔**BU ADIMI YAPMADIM, üç sebeple:** (a) izin katmanı reddetti; (b) CLAUDE.md'ye yazmak
benim yetkimde değil ve bir akranın emri bunu onay yapmaz; (c) `--strict`'in ne
engellediği ölçülmeden kurulmamalı. Karar Recep'in (§8).

## 6. Bu raporun kendi sınırları

- codegraph ile graphify **aynı dosya evreninde koşulmadı** → düğüm/kenar oranı
  karşılaştırması kaba.
- codegraph tarafında **iki** `codegraph_explore` çağrısı kullanıldı (araç bu proje için
  2 çağrı bütçesi bildiriyor); beş sorunun ikisi codegraph'a soruldu, üçü sorulmadı —
  ikisi belge sorusuydu, biri (soru 4) yer gerçeğiyle `grep` ile karşılandı.
- `query` için **token bütçesi varsayılanda** bırakıldı (2.000). `--budget` yükseltilse
  kesilme azalırdı; o koşum yapılmadı.
- SQL eki (`graphifyy[sql]`) kurulmadı → 252 dosyalı boşluğun kapanıp kapanmadığı ölçülmedi.
- Telemetri yargısı statik kod okumasıdır, **ağ dinlemesi değildir**.
- Belge geçişi ve topluluk adlandırma **koşulmadı**; §4'teki her sayı tahmindir.

## 7. HÜKÜM — UYARLA, ve codegraph'ın YANINA

Sayıyla: graphify beş sorunun ikisini yanlış, ikisini eksik cevapladı; doğru komutla
(`affected`) aynı iki soruyu 0,7 sn'de doğru cevapladı; 252 SQL dosyasını hiç görmedi;
kurulumu bir CLAUDE.md'ye kalıcı blok yazıyor. Buna karşılık 56 saniyede, sıfır model
çağrısıyla, %98,9'u kesin çıkarma olan 17.885 kenarlık bir grafik üretti ve bizde
karşılığı olmayan üç çıktı verdi (`god-nodes`, topluluk kümelenmesi, dışa aktarma hattı).

**BIRAK değil** — ölçüm ücretsiz değeri gösterdi. **AL da değil** — mevcut hâliyle
kurulması CLAUDE.md'ye dokunuyor ve `query` sessiz yanlış üretiyor.

**Önerilen benimseme, üç kalemle sınırlı:**

1. `affected <ad>()` — ikinci, bağımsız "nereye dokunur" görüşü. Ucuz (0,7 sn, ~300 kelime),
   ve codegraph'ın bayatlık uyarısı verdiği anda ikinci kol olarak değerlidir.
2. `god-nodes` — paylaşılan-primitif riskinin ölçülmüş listesi. Şu an elimizde bunun
   karşılığı yok ve liste ilk denemede iki gerçek merkezi gösterdi.
3. `diagnose multigraph` — grafik sağlığı; kendi grafik üreten işlerimizde kalıp olarak yararlı.

**Benimsenmemesi önerilen:** `query` (sessiz yanlış üretiyor — 5'te 2), `install`
(CLAUDE.md'ye yazıyor), `--strict` (dosya okumayı engelliyor), `--postgres` (prod DB).

**Kararsız bırakılan:** belge geçişi ve topluluk adlandırma — §4'teki bedel karşısında
değeri henüz ölçülmedi. Bir defalık deneme, 723 topluluğu adlandırıp `graph.html`'i
gerçekten okunur yaparak bu soruyu kapatabilir.

**codegraph'ın yerine mi, yanına mı: YANINA.** Sebebi tercih değil ölçüm — codegraph
birebir kaynak ve gerekçe döndürüyor, graphify düğüm adı döndürüyor. "Ne bozulur"
sorusunun cevabı kaynak metnin içindeydi ve graphify'ın çıktısında o metin hiç yok.

## 8. Recep'e giden karar (tek soru)

graphify'ın kurulum adımı `.claude/CLAUDE.md`'ye kalıcı bir blok yazıyor ve bir bayrağı
oturumun ilk dosya okumasını engelliyor. Ben bunu yapmadım. Üç seçenek var ve **önerim
ikincisi**:

1. Skill'i kurmak (CLAUDE.md'ye blok yazılır, `/graphify` komutu gelir).
2. **Skill'i KURMAMAK, aracı üç komutla elle kullanmak** (`affected`, `god-nodes`,
   `diagnose`) — CLAUDE.md'ye dokunulmaz, kazanç kalır. **Önerim bu.**
3. Aracı tamamen bırakmak.

Ayrıca §4'teki belge geçişi (400–535 bin token, 15–17 sıralı çağrı, abonelikten) için
"bir defalık koş" ya da "şimdilik hayır" kararı bekliyor.

İlgili: REC-313 · REC-311 · REC-314
