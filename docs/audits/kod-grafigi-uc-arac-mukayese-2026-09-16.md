# Kod grafiği araçları — ÜÇ ARAÇ MUKAYESESİ (codegraph · graphify · codebase-memory-mcp)

**Tarih:** 2026-09-16 · **Şerit:** URUN · **Soran:** Recep
**Cetvel:** `docs/standards/hukum-kaynak-standard.md` — her sayı **A sınıfı** (bugün ölçüldü,
GitHub/npm API'sinden; REC-313'ten aktarılan sayılar ayrıca **B** diye işaretli)
**Ölçüm anı:** 2026-09-16 · **Kaynak:** `gh api repos/<r>`, `npm view`, `api.npmjs.org`

---

## 0 · CEVAP, ÖNCE

**Üçü de aynı amaca hizmet ediyor: KOD grafiği.** Üçü de fonksiyon/çağrı/import ilişkilerini
indeksleyip "ne neyi çağırıyor, değişirse ne bozulur" sorusuna cevap veriyor.

⛔**Üçü de veritabanını görmüyor.** Recep'in istediği Supabase haritası **hiçbiri** tarafından
karşılanmıyor — bu ayrı bir iş ve ALTYAPI'da.

**Birlikte çalışabilirler mi: teknik olarak EVET, pratikte ÇAKIŞMA var** — §4.

⚠**"Aynı iş" hükmü bu belgenin hükmü DEĞİL.** Üçünün de kod grafiği olduğu bir **envanter**
bilgisidir. Hangisinin daha iyi bulduğu ancak **yan yana koşumla** ölçülür ve o ölçüm
**yapılmadı** → [[sahiplik-olcut-degildir]].

---

## 1 · SAYILAR — bugün ölçüldü

| Ölçüt | **codegraph** | **graphify** | **codebase-memory-mcp** |
|---|---:|---:|---:|
| Depo | `colbymchenry/codegraph` | `Graphify-Labs/graphify` | `DeusData/codebase-memory-mcp` |
| **Yıldız** | 71.076 | **118.141** | 43.460 |
| Fork | 4.565 | **11.418** | 3.537 |
| İzleyen (watcher) | 169 | **401** | 175 |
| Dil | C | Python | C |
| Lisans | MIT | Apache-2.0 | MIT |
| Açılış | 2026-01-18 | 2026-04-03 | **2026-02-24** |
| Son değişiklik | **bugün 07:51** | dün 17:58 | bugün 02:32 |
| Açık konu | 508 | **1.346** | 590 |
| Depo boyutu | 22 MB | 16 MB | **282 MB** |
| Son 30 gün commit | 100+ | 100+ | 100+ |
| npm indirme (hafta) | **70.850** | — (PyPI) | — |
| Arşivlenmiş | hayır | hayır | hayır |

**Üçü de canlı ve hızlı gelişiyor.** Üçünde de son 30 günde 100'den fazla commit var (sayaç
tavanı 100, gerçek sayı daha yüksek olabilir — ölçümün sınırı).

⚠**Yıldız sayısı kalite ölçütü DEĞİLDİR.** Üçü de 2026'da açılmış ve üçü de çok hızlı yıldız
toplamış; bu popülerliği gösterir, isabeti göstermez. REC-313'te graphify'ın `query` komutu
118 bin yıldıza rağmen beş soruda **sıfır** isabet etti.

**Açık konu / yıldız oranı** (bakım yükü göstergesi, kesin değil): codegraph %0,7 ·
graphify %1,1 · cbm %1,4.

---

## 2 · NE SUNUYORLAR

| | codegraph | graphify | codebase-memory-mcp |
|---|---|---|---|
| Çalışma biçimi | **MCP sunucusu** | **CLI** (+ skill/kanca kurulumu) | **MCP sunucusu** (+ geniş kanca) |
| Bizdeki durum | **KURULU, çalışıyor** | kurulu, **çağrılmıyor** | **YOK** |
| Araç/komut sayısı | 8 | 5+ | 15 |
| Araçlar | `explore` `search` `node` `callers` `callees` `impact` `files` `status` | `extract` `query` `affected` `god-nodes` `diagnose` `explain` `path` | `index_repository` `search_graph` `trace_path` `detect_changes` `query_graph` (Cypher) `get_architecture` `get_code_snippet` `search_code` `manage_adr` `ingest_traces` … |
| Anlamsal arama | yok | yok | **var** (gömülü `nomic-embed-code`, 768d int8) |
| Dil sayısı | — (ölçülmedi) | 30+ | 158-162 (iddia) |
| Model çağrısı / API anahtarı | gerektirmiyor | gerektirmiyor (`--code-only`) | gerektirmiyor |
| Veri nerede | yerel | yerel (`graphify-out/`) | yerel (`~/.cache/…`, SQLite) |
| SQL / DB şeması | **görmüyor** | **görmüyor** (B: 252 SQL dosyasını hiç görmedi) | **görmüyor** (kendi belgesi söylüyor) |

---

## 3 · ÖLÇÜLMÜŞ DAVRANIŞ FARKLARI

### 3.1 · codegraph — birebir kaynak döndürüyor

REC-313 (B sınıfı): codegraph `resolveProductRoute`'un **birebir kaynağını** döndürdü ve cevap
kodun kendi yorumunda yazılıydı. graphify aynı soruda **düğüm adı** döndürdü, o metin çıktısında
**hiç yoktu**. Hüküm: *"codegraph'ın yerine değil YANINA."*

⭐**Ama bugün ölçülen bir şey daha var:** URUN 2026-09-16'da **beş** yanlış hüküm verdi ve
**hiçbirinde codegraph'a danışmadı.** Yani kurulu ve çalışan araç, yetenek eksikliğinden değil
**çağrılmadığı için** işe yaramadı → [[arac-atil-kalmaz-kullanim-yeri-yazilir]].

### 3.2 · graphify — komut seçimi isabeti belirliyor

B sınıfı (REC-313, tek koşum): `query` beş soruda **0 isabet** (3 yanlış, 2 eksik) — başlangıç
düğümünü kelime eşlemesiyle seçiyor ve Türkçe yorumlara çarpıyor. **Aynı araç** `affected` ile
aynı soruları **0,7 sn'de DOĞRU** cevapladı. Yani araç değil **komut** yanlıştı.

⚠`affected` **parantez** gerektiriyor (`productRoute` → *"No unique node match"*,
`productRoute()` → doğru). Hiçbir belgede yazılı değil, ölçümle bulundu.

### 3.3 · codebase-memory-mcp — kanca kapsamı en geniş, ama ASLA bloklamıyor

Bugün kaynak kodundan okundu (`src/cli/hook_augment.c`):

Kanca olayları: `SessionStart` · `SubagentStart` · `UserPromptSubmit` · `PreCompact` ·
`PostCompaction` · `TaskStart` · `TaskResume` · `pre_llm_call` · `PreToolUse` (Grep/Glob/Bash) ·
`PostToolUse` (Read).

⭐**Kodun kendi cümlesi:** *"this NEVER blocks a tool call. Every error, timeout, missing
project, or short/odd pattern path results in exit 0 with NO stdout output."* ve
*"The hook cannot deny a tool."* Yalnız `additionalContext` ile bilgi ekliyor.

**Bu, graphify'ın `--strict`'inden yapısal olarak daha güvenli:** `--strict` bir okumayı
`permissionDecision: deny` ile **reddedebiliyor** (oturumda bir kez); cbm'nin kancası
reddetme yetkisine **hiç sahip değil.**

⛔**ÖLÇEMEDİĞİM İKİ ŞEY — adıyla:** (1) kurulumun **tam olarak hangi** ayar dosyalarına yazdığı;
`agent_clients.c` ve `agent_profiles.c`'de Claude'a özgü yol **yok**, yazma mantığı başka bir
dosyada. (2) **Yedek alıp almadığı.** İkisi de bilinmiyor; program indirilmeden ölçülemez.
*Graphify'da tam bu noktada iki kez yanlış hüküm verildi (karne madde 4 ve 5) — tekrarlanmadı.*

---

## 4 · BİRLİKTE ÇALIŞIR MI

**Teknik olarak evet** — üçü ayrı isim alanında, çakışan araç adı yok.

**Ama iki gerçek çakışma var:**

**4.1 · Kanca çakışması.** graphify `Bash|Grep` ve `Read|Glob` olaylarına kanca kuruyor;
codebase-memory-mcp **aynı olaylara** (`PreToolUse` Grep/Glob/Bash + `PostToolUse` Read) kendi
kancasını kuruyor. İkisi birlikte kurulursa **her arama ve her dosya okumasında iki araç**
devreye girer. İkisi de fail-open, yani kilitlenme olmaz — ama her çağrıya iki kez ek metin
girer ve bağlam şişer.

**4.2 · Aynı soruya üç cevap.** Üçü de "ne neyi çağırıyor" sorusunu cevaplıyor. Üçü birden
kuruluysa aynı soru üç kez cevaplanır ve hangisine güvenileceği **yazılı bir kural olmadan**
belirsiz kalır. Bugün zaten yaşadığımız sorun bu: kurulu araç çağrılmıyor.

**Öneri:** ikisi birden değil. Sıra şu olmalı — (a) graphify kurulumu koş ve **kullan**
(Recep onayladı, ALTYAPI'da), (b) `affected` ↔ `codegraph_impact` **yan yana** koş ve say,
(c) ancak o ölçümden sonra üçüncü araç tartışılsın. Aksi hâlde bir dördüncü atıl araç eklenir.

---

## 5 · BU MUKAYESENİN SINIRLARI (adıyla)

1. **Yan yana koşum YAPILMADI.** Bu belge envanter ve kaynak-kodu okumasıdır; hangisinin daha
   çok/doğru bulgu verdiği **ölçülmedi.** "Aynı iş" ve "daha iyi" hükümleri bu belgede YOK.
2. **graphify davranış sayıları B sınıfı** (REC-313, 2026-09-13, başka şerit, tek koşum).
   Bu makinede yeniden ölçülmedi.
3. **codebase-memory-mcp hiç koşturulmadı.** Program indirilmedi; tüm bilgi depo + kaynak kodu
   okumasıdır. Performans iddiaları (Linux çekirdeği 3 dakikada, sorgular <1 ms, %99 daha az
   token) **kendi beyanları** — doğrulanmadı.
4. **"Telemetri yok" iddiaları statik okumadır**, ağ trafiği hiçbirinde dinlenmedi.
5. **Commit sayaçları 100'de tavanlı.** "100+" gerçek sayı değil, alt sınır.
6. **codegraph'ın dil sayısı ölçülmedi** — tabloda boş bırakıldı, tahmin yazılmadı.

---

## 6 · DERİN ÖLÇÜM (aynı gün, 12 ajanlı koşum, 6 eksen + 6 bağımsız çürütme)

**Yöntem:** Workflow — altı eksen paralel tarandı, her bulguyu **reddetmeye çalışan** ayrı bir
ajan denetledi. 12 ajan · 0 hata · 31 dk · 532 araç çağrısı. Beş bulgu çürütmeden geçti,
**bir bulgunun gerekçesi düzeltildi.**

### 6.1 · Eksen sonuçları

| Eksen | Önde | Ölçülen fark |
|---|---|---|
| **SQL / Postgres** | **graphify** | tek araçta canlı DB introspection VAR |
| Boyut anatomisi | cbm | ama boyut **paketleme**, yetenek değil (aşağıda) |
| Olgunluk / bakım | cbm | CI iş akışı **3 vs 22**, sanitizer **0 vs 5** |
| Gerçek yetenek | cbm | graphify daha **GENİŞ**, cbm daha **DERİN** |
| Kurulum ayak izi | cbm | cbm **repoya hiç dokunmuyor** |
| Bizim yığına uyum | cbm | (gerekçesi düzeltildi, §6.5) |

### 6.2 · ⭐SQL — İKİ İDDİA DA KISMEN YANLIŞTI, sebebi TEK SATIR

İki çelişen iddia vardı: URUN *"graphify SQL görmüyor"* · ALTYAPI *"Supabase
haritalandırması yapılabiliyor"*.

**Sebep `pyproject.toml:87`:** `tree-sitter-sql` graphify'ın **temel bağımlılığı değil**,
isteğe bağlı bir ekstra. Kurulmazsa `extractors/sql.py:284-286` boş sonuç döndürüyor ve
**koşum BAŞARILI bitiyor** — yalnız stderr'e uyarı düşüyor (`extract.py:6572-6607`).
⚠`README.md:342` ise `.sql`'i temel gramerler arasında, **ekstra işareti koymadan** listeliyor.
**Tuzak tam burada:** REC-313'ün *"252 dosyayı hiç görmedi"* ölçümü **doğruydu**, ama sebebi
kalıcı bir yetenek sınırı değil **kurulmamış bir pakettir.**

**graphify'ın `.sql` ayrıştırıcısı 720 satır** (`extractors/sql.py`) ve **tipli kenar**
üretiyor: tablo · view · fonksiyon · trigger · index düğümleri; `references` (FK) ·
`indexes` · `triggers` · `reads_from` kenarları. `--postgres DSN` ile **canlı DB'den** şema
çıkarıyor ve **salt okuma zorunlu**: `pg_introspect.py:31`
`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE`.

⛔**Üç sınır, hepsi ölçüldü:** (1) **RLS / `CREATE POLICY` HİÇ YOK** — açık dert
`Graphify-Labs/graphify#3401`, 2026-09-07'den beri **OPEN**. (2) **SÜTUN DÜĞÜMÜ YOK**; canlı DB
yolu tabloyu `CREATE TABLE x (id INT)` **saplaması** olarak yazıyor, yani sütunu uyduruyor.
(3) `pg_policy` / `pg_trigger` / `pg_index` sorgusu hiç yok.

⭐**AJAN YENİ BİR HATA ÖLÇTÜ (fikstürle koştu):** PostgreSQL trigger'ında tablo bağı **yanlış**
kuruluyor. `sql.py:474-481` `keyword_for`'dan sonraki referansı tablo sayıyor; PG sözdiziminde
(`... ON public.orders FOR EACH ROW EXECUTE FUNCTION public.bump_order()`) bu **fonksiyonun**
üstüne düşüyor. Koşum `trg_orders -triggers-> public_bump_order` verdi, `public.orders` trigger
kenarını **hiç almadı**. Kod Firebird/T-SQL'in `CREATE TRIGGER x FOR <tablo>` kalıbına yazılmış.

**cbm tarafı:** `.sql`'i **kutudan çıktığı gibi** görüyor (`src/discover/language.c:263`), grameri
ikiliğe gömülü (`vendored/grammars/sql/parser.c`, 41,6 MB). ⭐**SÜTUNLAR `Field` düğümü oluyor**
(`lang_specs.c:690`) — graphify'da karşılığı yok. Üstüne **dbt** desteği var
(`extract_dbt.c`, `{{ ref() }}` köken izi). **Eksikleri:** FK kenarı yok · trigger/index/policy
dağıtımı yok · **canlı DB bağlantısı hiç yok** (`libpq`/`PQconnectdb` aramaları 0).

⚠**BENİM BİR ALINTIM KAYNAKTA DOĞRULANMADI:** *"cbm README'si SQL şemalarını indekslemiyor
diyor"* demiştim. Ajan aradı: `README.md:835` SQL'i **"Good (75-89%)"** çözünürlük kuşağında
listeliyor, `README.md:779` desteklenen diller satırında `sql` geçiyor, ve SQL'i **dışlayan bir
cümle bulunamadı.** → karne maddesi.

### 6.3 · Boyut — 54 KAT fark PAKETLEMEDEN geliyor, ÖLÇÜLDÜ

Ajan **aynı 30 grameri** iki paketlemede yan yana ölçtü:

| | cbm (üretilmiş ham `parser.c`) | graphify (PyPI wheel) | oran |
|---|---:|---:|---:|
| 30 gramerin toplamı | **425,69 MB** | **7,899 MB** | **54×** |
| `sql` | 39,70 MB | 0,363 MB | 109× |
| `fortran` | 34,71 MB | 0,391 MB | 89× |
| `cpp` | 24,69 MB | 0,301 MB | 82× |

⭐**Recep'in sorusunun cevabı:** boyut **gelişmişlik göstergesi değil**, paketleme tercihidir.
cbm grameri üretilmiş C kaynağı olarak deposunda tutuyor, graphify aynısını paketten çekiyor.
(Ajanın kendi sınırı: birinci-parti kod yalnız **bayt** olarak ölçüldü — cbm 33,43 MB `.c/.h`
vs graphify 3,03 MB `.py`; C Python'dan kalabalık yazıldığı için bu 11 kat **mantık hacmini
bilinmeyen bir çarpanla abartıyor.**)

### 6.4 · Olgunluk — cbm önde, ama testte graphify önde

| Ölçüt | graphify | cbm |
|---|---:|---:|
| Test dosyası | **283** | 256 |
| Test/kaynak bayt oranı | **1,20** | 0,87 |
| CI iş akışı / job | 3 / 3 | **22 / 12** |
| Sanitizer bacağı | 0 | **5** (ASan/UBSan/MSan/LSan/TSan) |
| **Bloklayan** güvenlik kapısı | **0** | **3** |
| SHA-pinli action | 0 | **hepsi** |
| İmzalı release | yok | **18** (cosign) |

⚠graphify'ın `bandit` ve `pip-audit` adımları `ci.yml`'de açıkça `continue-on-error: true` —
yani **bloklamıyor**. Bizim kendi doktrinimizle (fail-closed) çelişiyor.
**İkisinde de satır kapsamı ölçülemedi:** hiçbirinin CI'ında kapsam adımı yok.

### 6.5 · Çürütülen bulgu — hüküm kaldı, GEREKÇE düştü

Uyum ekseninde *"cbm `path_alias.h` ile `@/*` takma adını çözüyor"* bir **ayırt edici** olarak
yazılmıştı. Çürütücü ajan reddetti: **graphify da çözüyor ve daha genişini yapıyor**
(`extractors/resolution.py:95-174` — `extends` zinciri, JSONC, `baseUrl`, en-yakın-ata).
⭐**Paylaşılan yetenek kıyasta GEÇMEZ.** Windows ekseni ise birebir doğrulandı: graphify'ın üç
iş akışı da yalnız `ubuntu-latest`; cbm `windows-latest` + `windows-11-arm` koşuyor.

### 6.6 · ⛔EN ÖNEMLİ SINIR — HİÇBİR ARAÇ KOŞTURULMADI

Altı eksenin **altısı** da aynı sınırı kendi ağzıyla yazdı: görev kuralı kurulumu yasakladığı
için **tüm ölçüm kaynak kodu okumasıdır.** cbm bu makinede kurulu bile değil.

Dolayısıyla **ölçülmeyenler:** iki aracın VentHub üzerinde ürettiği grafiğin **doğruluğu ve
recall'ı** · sorgu gecikmesi · kurulumun diskte **önce/sonra diff'i** · ve **isabet** —
yani aynı soruya hangisinin doğru cevap verdiği.

⭐**Bu yüzden "cbm 4-1 önde" bir KURULUM ve BAKIM hükmüdür, İSABET hükmü değildir.** İsabeti
ancak yan yana koşum ölçer ve o koşum yapılmadı. graphify'ın `query` komutu 118 bin yıldıza
ve bu tablodaki iyi sayılara rağmen beş soruda **sıfır** isabet etmişti — bu tablo o dersi
çürütmüyor, tekrarlıyor.

İlgili: REC-313 · REC-310
