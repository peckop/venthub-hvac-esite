# gstack `/plan-eng-review` ile kendi `plan-challenger`'ımız — yan yana ölçüm

**Niçin:** ikisi de "plan uygulanmadan önce incele" işini yapıyor. Hangisinin ne yakaladığı
ölçülmeden, ikisini birden koşturmak maliyet, birini seçmek kumar. Bu dosya **aynı planı** ikisine
birden verip aşama aşama ne olduğunu yazar.

**Ölçüm nesnesi:** REC-340 Faz 1 planı (VentHub arama motorunun onarımı) —
`scratchpad/rec340-faz1-plan.md`, 2026-09-15, URUN şeridi yazdı.
**Ölçen:** URUN şeridi. **Emri veren:** OPS (2026-09-15).

> ⚠**Yanlılık uyarısı, okuyan için:** planı yazan da ölçümü yapan da aynı şerit. Üretici ≠ yargıç
> ilkesi gereği her iki inceleme de **ayrı alt ajanlara** yaptırıldı; ama incelemeleri
> KARŞILAŞTIRAN yine plan sahibi. Bu dosyanın hükmü bu sınırla okunur.

---

## Aşama kaydı (her satır aynı turda yazıldı)

| # | Saat (UTC) | Aşama | Sonuç |
|---|---|---|---|
| 1 | 07:4xZ | Plan yazıldı, dokuz vaka canlı prod DB'de ölçüldü | 9 vakanın 5'i tam aramada 0, 6'sı öneri kutusunda 0 |
| 2 | 07:4xZ | `plan-challenger` (bizim) — iki bağımsız alt ajan başlatıldı | biri DB ekseni (4 iddia), biri kod/kapı ekseni (5 iddia) |
| 3 | 07:5xZ | `/plan-eng-review` (gstack) — preamble koşturuldu | `SKILL_START_PROTO: 1`, sağlıklı; `SESSION_KIND: interactive`, `REPO_MODE: solo` |
| 4 | 07:5xZ | gstack incelemesi alt ajana verildi | **SAPMA, aşağıda** |
| 5 | 07:5xZ | `plan-challenger` DB ekseni bitti | 8 bulgu · 17 SELECT/EXPLAIN · DURUM: CEKINCELI |
| 6 | 08:0xZ | `plan-challenger` kod/kapı ekseni bitti | 12 bulgu · 10 SELECT + depo taraması · DURUM: CEKINCELI |
| 7 | 08:0xZ | `/plan-eng-review` (gstack) bitti | 15 bulgu + test kapsam diyagramı + 10 görev · VERDICT: KOŞULLU |
| 8 | 08:1xZ | Plan v2 → v3 yazıldı, üç incelemenin tamamı işlendi | 6 çürüyen iddia · 7 kök sebep · kapsam 1 adım daraldı, 1 adım eklendi |

### Aşama 4'teki sapma ve gerekçesi

gstack skill'i her bulgu için **ayrı bir `AskUserQuestion`** (düğmeli seçenek listesi) çağırmayı
ZORUNLU kılıyor ("one issue per call", "STOP, do not proceed until the user responds"). Bu, bu
projenin yazılı iletişim kuralıyla doğrudan çelişiyor: Recep'e düğmeli seçenek listesi
gönderilmez, karar maddeleri numaralı düz cümleyle yazılır ve Recep numarayla cevap verir.

Skill'in kendi içinde bu durumun karşılığı var: `SESSION_KIND: spawned` bloğu, alt ajan
oturumlarında soru sormayı YASAKLIYOR ve "önerilen seçeneği kendin seç, seçtiğini raporla"
diyor. İnceleme bu yüzden bir alt ajana verildi — skill'in kendi kuralı içinde kalındı, kural
esnetilmedi.

Aynı turda atlanan diğer kalemler ve niçin:
- **Sürüm yükseltme istemi** (`UPGRADE_AVAILABLE 1.84.1.0 → 1.87.0.0`): iş ortasında araç
  yükseltmek ölçümün altındaki zemini değiştirir. Ayrı kalem.
- **Onboarding/özellik tanıtımı blokları** (sürekli checkpoint, "boil the ocean" tanıtımı,
  ilk-koşum ipucu): işin kendisi değil, aracın kendi tanıtımı.
- **Telemetri ve artifacts-sync:** `TELEMETRY: off`, `ARTIFACTS_SYNC: off` — zaten kapalı.

---

## Karşılaştırma tablosu

| Ölçüt | `plan-challenger` (bizim) | `/plan-eng-review` (gstack) |
|---|---|---|
| Koşan ajan sayısı | 2 (DB ekseni + kod/kapı ekseni) | 1 |
| Bulgu sayısı | 20 (8 + 12) | 15 + test kapsam diyagramı + 10 görev listesi |
| Kanıtla desteklenen | 20/20 (SQL çıktısı ya da dosya:satır) | 15/15 (güven puanlı, alıntı kapısı uygulanmış) |
| Hüküm | ikisi de `CEKINCELI` | `KOŞULLU` |
| İki P0'ı da buldu mu | ✔ ikisi de | ✔ ikisi de |
| Süre | ~7,5 dk (paralel) | ~7,5 dk |
| Token | ~255 bin (ikisi toplam) | ~149 bin |

### İkisinin de yakaladığı (6 kalem — çekirdek)

`unaccent` kurulu değil · üretilmiş sütun cross-tablo veri taşıyamaz · tenant kuralı planda hiç
geçmiyor · kapı sabit sayıya bağlanırsa kırılgan doğar · cetvel sahipliği açık kalemi bloklayıcı ·
arama sonuç sayfası yok ve UI tavanı 20.

**İki P0'ı da ikisi bağımsız buldu.** Yani "biri yeterdi" denebilir — ama yalnız P0'lar için.

### Yalnız `plan-challenger` (11 kalem)

`search_path` tuzağı — canlıda `ERROR 42883` **üretilerek** kanıtlandı · trgm indeksini tetikleyenin
`%` operatörü olduğu, `similarity() > eşik` yazımının indeksi hiç kullanmadığı — `enable_seqscan=off`
altında EXPLAIN ile · doğru eşik fonksiyonunun `word_similarity` olduğu (0,294 ↔ 0,714 farkı) ·
tetiğin 361 webhook POST'u üreteceği · denetim izi tetiğinin sütun listesi · pgvector 4096 boyut
indeks sınırı (Faz 2 model kararını etkiliyor) · **Adım 2'nin tam simülasyonu** (jet fan 0 → 61,
iki vakanın hiç kıpırdamadığı) · vaka 9'un gerçek sebebi · iki RPC'nin farklı ürün evreni ·
RPC imza değişikliğinin drop+create maliyeti · RLS politikalarının bugün sağlam olduğunun ölçümü.

**Ortak yönü:** hepsi **canlı sistemde bir şey koşturarak** bulundu — sorgu, EXPLAIN, hata üretme,
simülasyon. Bu, çürütme kipinin doğal ürünü.

### Yalnız `/plan-eng-review` (12 kalem)

`products.name_i18n` var ve aranmıyor (EN ürün **adı** kör) · `20250919` migration'ının kurduğu üç
indeks canlıda **yok**, hiçbir kapı görmemiş · `getSearchSuggestions` hatayı sessizce sıfır sonuca
çeviriyor ve bu Adım 6'yı baştan zehirliyor · aynı ekranda iki farklı hata politikası ·
`INV-SEARCH-ROUTE-1` zaten var, yani "hiçbir kapı aramayı ölçmüyor" cümlesi yanlış · kapı adı
çakışması (TR/EN iki aile) · trgm indekslerinin **kullanıldığı** (`idx_scan` 1424/121), yani "tam
tablo taraması" hükmünün fazla geniş olduğu · vaka 7'nin regresyon riski · tuş gecikmesinin yedek
yolla pahalılaşacağı · `display_price` korunumu riski · `admin_search_products` yani RPC'nin üç
olduğu · aile sayımının 18 değil 22 olduğu.

Ayrıca **üç şey yapısal olarak ekledi:** kapsam daraltma disiplini (Adım 5'in hiçbir vakayı
kurtarmadığını gösterip Faz 1'den çıkarttı), test kapsamı diyagramı (26 yolun 3'ü ölçülüyor, %12),
ve "çalışan davranışı değiştiren her değişiklik regresyon testi ister" kuralı.

**Ortak yönü:** çoğu **depo kodunu okuyarak** bulundu. Kod okuma + mevcut-varlık envanteri bu
aracın güçlü tarafı.

### Yanlış pozitif

İkisinde de **sıfır**. Her iki taraf da ölçemediklerini ayrı başlıkta topladı ve ihlalle
karıştırmadı (`plan-challenger` 5 + 5 kalem, gstack 7 kalem).

---

## Hüküm

**İkisi de kalır; biri ötekinin yerine geçmez.** Ölçüm bunu açıkça gösteriyor: 35 bulgunun yalnız
6'sı örtüşüyor, yani **%83'ü tek bir araçta yaşıyor.** Birini bıraksaydık planın on bir ya da on
iki kusuru bugün fark edilmezdi.

**İkisi farklı şeyde iyi.** `plan-challenger` canlı sistemde bir şey koşturarak çürütüyor —
EXPLAIN, hata üretme, simülasyon. `/plan-eng-review` depo kodunu okuyup mevcut varlığı envanterliyor
ve kapsamı daraltıyor. İkisi aynı soruyu sormuyor, o yüzden aynı cevabı da vermiyorlar.

**Önerilen kullanım:** migration ya da veri göçü içeren planda **ikisi birden**, paralel. Yalnız kod
değişikliği içeren planda `/plan-eng-review` tek başına yeter. Yalnız veri/DB planında
`plan-challenger` tek başına yeter.

> ⚠**Bu hükmün ölçülmemiş yanı:** `plan-challenger`'a iki eksen ve on soru **ben** yazdım; gstack'e
> yalnız planı verdim. Yani "gstack kod tarafında güçlü" bulgusu kısmen benim brief'imin ürünü
> olabilir. Dürüst karşılaştırma için ikisine de aynı serbest brief verilen ikinci bir tur gerekir.
> Bu tur **yapılmadı** — hüküm bu sınırla okunur.

### gstack'in koşturulmayan kısımları (sapma listesi)

Aşama 4'te yazılan sapmanın dışında, alt ajan şunları da atladı (emirle): dış ses turu (Codex /
çapraz model), test planı artefaktı yazımı, inceleme günlüğü (`gstack-review-log`), telemetri,
öğrenme kaydı. Bunlar aracın **kendi hafızasını** besleyen adımlar; atlandıkları için gstack bu
projede tur tur birikmiyor. Aracı sürekli kullanacaksak bu adımların açılması ayrı bir karardır.
