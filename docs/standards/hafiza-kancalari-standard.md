# Hafıza Kancaları Standardı (REC-177)

> **Kapsam:** ajanın *hatırlama/kayıt* davranışını mekanikleştiren kancalar — `.claude/hooks/`
> altındaki `eylem-defteri`, `hafiza-sorusu-yonlendirme`, `defter-bayatlik-olcumu`,
> `soguk-okuyucu-sinavi`. Şerit/claim kapıları (`lane-guard`), sır kapıları
> (`sensitive-path-guard`, `sir-basan-kalip`) ve pano kancaları BU CETVELİN DIŞINDA.
> **Sürüm:** v1.0 · 2026-09-07 · sahibi ALTYAPI şeridi.
> **Niçin bu cetvel doğdu:** dört kanca yazıldı ve hiçbirini yöneten cetvel yoktu; kural 1
> gereği "cetvel yok" geçerli ama bedava değil — cetveli yazmak işin parçası.

---

## §1 Bu kancalar niçin var — ölçülmüş kayıp sınıfı

Dördü de aynı kökten doğdu: **hatırlamaya bırakılan adım hatırlanmadı.** Vakalar ölçüldü,
tahmin edilmedi:

| # | ölçülmüş kayıp | tarih | kancanın cevabı |
|---|---|---|---|
| 1 | 20 skill depo dışına taşındı, 40 dk "bulamadım" (git depo dışını görmez) | 09-06 | `eylem-defteri` — taşıma/silme fiillerini JSONL'e yazar |
| 2 | "konuşmuş muyduk" sorusu bağlamdan cevaplandı; aynı gün 3 kez eksik çıktı | 09-04 | `hafiza-sorusu-yonlendirme` — adresi hatırlatır, cevap üretmez |
| 3 | Takip defteri 8 saat bayat kaldı ve yanlış cevap verdi | 09-06 | `defter-bayatlik-olcumu` — yaşı ölçer, uyarır |
| 4 | Kendi notundan ne yaptığını çıkaramama (2 vaka aynı gün) | 09-06 | `soguk-okuyucu-sinavi` — notu bağlamsız okuyan geçirir |

**Ders:** hafıza kaybı bir *bilgi* eksikliği değil, bir *ritüel* eksikliğidir. Ritüel yazıya
(kancaya) dökülmediği sürece "hatırlanan" şeydir ve hatırlanmaz.

---

## §2 Zorunlu kurallar

**K1 — KANCA CEVAP ÜRETMEZ, ADRES VE ÖLÇÜT VERİR.**
Kanca modeli çağırmaz, ağ isteği yapmaz. Sebep iki katlı: (a) her isteme gecikme ve hata
yüzeyi bindirir, (b) yanlış cevap üretme riski taşır — *hatırlatma ucuz, yanlış cevap pahalı.*
Ölçümü ajan yapar. `hafiza-sorusu-yonlendirme` ve `soguk-okuyucu-sinavi` kapılarında bu kural
**bir şeyin olmadığını ölçen** kolla korunur (kaynakta `exec*/spawn/fetch/http` yasak).

**K2 — DIŞ SERVİSE YAZMAYI KANCA TETİKLEMEZ.**
Ölçmek serbest, yazmak insan kapısı. `defter-bayatlik-olcumu` defterin yaşını ölçer ve
`esitle` komutunu **söyler**, koşturmaz (OPS hükmü 2026-09-07, ALTYAPI itirazı üzerine).
Kapı, çalıştırma çağrılarının **argümanlarına** bakar — çıplak kelimeye değil; yoksa kanca
kendi gerekçesini yazamaz.

**K3 — KAPSAM DARLIĞI KASITLIDIR: her turda öten kanca ölmüş kancadır.**
Üç günde görmezden gelinir ve o andan sonra **VAR ama YOK** sayılır. Bu yüzden:
tek kelimelik ipucu kullanılmaz (yalnız çok kelimeli kalıplar) · sınav yalnız iki yüzeyde
istenir (compact dilim kaydının ANLAM kısmı + gün kapanışı notu) · günlük üst sınır **6** ·
aynı dosya için sınav bir kez · uyarıda soğuma penceresi (2 saat).
**Her kapıda hem "ötmeli" hem "ÖTMEMELİ" kolu bulunur** — ikincisi daha kolay kaçar.

**K4 — ÖLÇEMEDİM ≠ TAZE / GEÇTİ.**
Ölçüm başarısızsa kanca susmaz, "OLCULEMEDI" der ve sebebini yazar. Sessizlik, olmayan şeyi
"yok" değil "sorun yok" gibi gösterir; fail-open yüzün en sık hâli budur.

**K5 — ÖLÇÜT ADA DEĞİL GERÇEĞE BAĞLANIR.**
Depo tespiti ad eşlemesiyle değil `.git` arayarak · tazelik dosya damgasıyla değil
`git log origin/master` ile (eşitleme başka worktree'de koşar, ana dizin kopyası güncellenmez;
09-07'de ana dizin damgası 21 saat eskiydi, gerçek eşitleme 18 saat önceydi) · dosya kimliği
basename ile değil **tam yolla** (iki şeridin `state.md`si çarpışır, ikincisi sessizce muaf kalır).
**Ayırt etmeyen ölçüt ölçüm değildir.**

**K6 — TURU BLOKLAMAZ.** Hepsi daima 0 ile çıkar; uyarı stderr/additionalContext'e gider.
Kancanın kendi hatası işi durdurmamalı — ama sessizce yutulmamalı (stderr'e yazılır).

**K7 — ALT-AJAN MODELİ AÇIKÇA YAZILIR.**
Sınav emrinde model **sonnet**. Model boş bırakılırsa pahalı modele düşer (Recep, 09-06).

---

## §3 Soğuk okuyucu sınavı — geçme ölçütü

Not, o anki bağlamı bilen birine yazılır; okuyan (yarınki ben, defter, şerit) o bağlamı
görmez. **Compact sonrası yazan da soğuk okuyucudur.**

1. Bağlamsız bir alt-ajan **yalnız notu** okur (başka girdi verilmez).
2. Dört alanı söyler: **NE** (fiil+nesne) · **DURUM** (YAPILDI/AÇIK/YARIN/ÇÜRÜDÜ, *kelimeyle*)
   · **KANIT** (dosya/PR/saat/yol) · **KİMDE**.
3. Çıkaramadığı alan için "çıkaramadım" der — tahmin etmez.
4. **GEÇMEZ:** bir alan "çıkaramadım" ise, ya da cevap yazanın bildiğiyle uyuşmuyorsa.
   O zaman not yeniden yazılır ve sınav tekrarlanır. **"Ben anlıyorum" kanıt değildir.**
5. Kısaltma ve parantez **durum belirtmez**: "(sabah cetvel)" defterde "yapıldı"ya döndü.

**§3.1 İlk koşumun bulgusu (09-07, bu cetvelin kendi kaydı üzerinde):** sınav, compact dilim
kaydının yedi kalemini doğru çıkardı, ama **HAYIR** verdi: karar kalemleri "Recep'ten bekleniyor"
diyordu, *beklenen cümlenin kendisini* yazmıyordu. Düzeltme kayda işlendi.
**Kural bu vakadan doğdu: karar kaleminde beklenen CEVABIN KENDİSİ yazılır** — "onay bekliyor"
bir durum değil, bir boşluktur.

---

## §4 Envanter (araç, envantere girmeden bitmiş sayılmaz — REC-180 kuralı)

| ad | tür | ne yapar | tetik | sahip | kanıt |
|---|---|---|---|---|---|
| `eylem-defteri.cjs` | kanca | git'in görmediği taşıma/silme fiillerini JSONL'e yazar | PostToolUse | ALTYAPI | `src/__tests__/conformance/eylem-defteri.test.ts` (10 kol) |
| `hafiza-sorusu-yonlendirme.cjs` | kanca | hafıza sorusunu deftere/CodeGraph'e yönlendirir | UserPromptSubmit | ALTYAPI | `…/hafiza-sorusu-yonlendirme.test.ts` (16 kol) |
| `defter-bayatlik-olcumu.cjs` | kanca | takip defterinin yaşını ölçer, eşitlemeyi TETİKLEMEZ | Stop | ALTYAPI | `…/defter-bayatlik-olcumu.test.ts` (7 kol) |
| `soguk-okuyucu-sinavi.cjs` | kanca | iki kayıt yüzeyinde soğuk okuyucu sınavı ister | PostToolUse | ALTYAPI | `…/soguk-okuyucu-sinavi.test.ts` (13 kol) |
| `sage-dosya-dersi.cjs` | kanca | dokunulan dosyaya **çapalı** sage derslerini bağlama koyar | PreToolUse (`Read\|Edit\|Write\|MultiEdit`) | ALTYAPI | `…/sage-dosya-dersi.test.ts` (6 kol) |
| `scripts/hijyen/sage-dosya-dersi.cjs` | modül | puanlama, bütçe, "dosya başına bir kez", compact sıfırlaması | kanca + oturum açılışı | ALTYAPI | aynı kapı |

⚠**AYARA KAYIT RECEP KAPISI:** dördü de `.claude/settings.json`'a bağlanmadıkça **dosya olarak
var, tetik olarak ölüdür.** Akran isteğiyle ayar dosyasına dokunulmaz. Kayıt satırları Recep'e
sunulur; sunulana kadar bu cetveldeki "tetik" kolonu *tasarlanan* tetiği gösterir, *çalışan* değil.

`.md` künyeleri (companion) **üretilmiş artefakttır** — post-commit üretir, elle yazılmaz (AXIOM 3).

---

## §5 Bu cetvelin kendi kapısı

`src/__tests__/conformance/` altındaki dört test dosyası bu cetvelin kollarıdır. Kanca eklenirse
aynı PR'da: (1) gerçek stdin ile koşum kanıtı, (2) "ötmemeli" kolu, (3) §4 envanter satırı,
(4) varsa "bir şeyin olmadığını ölçen" kol. **Koda bakarak sınama kanıt sayılmaz** — dört
kancanın üçünde kusurlar ancak gerçek koşumla çıktı (tilde çözülmemesi, worktree'lerin depo dışı
sayılması, MSYS `/c/` yolunun Windows'ta olmayan yere çözülmesi, basename çarpışması).

## §6 SAGE DOSYA DERSİ — yazılan hafıza OKUNMUYORSA yazılmamıştır (Recep, 2026-09-18)

Recep sordu: *"çapalı hafıza kullanılmıyor mu?"* Dürüst cevap **hayır**dı. Ölçüm: sage
veritabanında 26 kayıt vardı, bir kısmı dosya/dizin çapalı; ama bir dosyaya dokunan hiçbir
pencere onları görmüyordu, çünkü okumak için bir aracı **kasıtlı** çağırmak gerekiyordu ve
kimse çağırmıyordu. Bu, REC-342 dersinin hafıza hâlidir: *bir kapının var olması, kararın
verildiği yerde göründüğü anlamına gelmez.*

### §6.1 Yukarı akım ölçüldü, taklit edilmedi

WrongStack'in kendi ajanı bunu bir ara katmanla yapıyor
(`@wrongstack/sage/middleware/tool-call-memory.js`). Ölçülen varsayılanlar ve bizim seçimimiz:

| Ayar | Yukarı akım | Biz | Not |
|---|---|---|---|
| araç başına ders | 8 | **8** | aynen |
| araç başına karakter | 2800 | **2800** | aynen |
| tekrar bekleme | 0 ms | — | biz süre değil **dosya başına bir kez** sayıyoruz |
| getirme bütçesi | 5000 ms | **800 ms** | kanca her araç çağrısında koşar; 5 sn turu keser |
| asgari önem | 0.5 | **0.5** | aynen — ve **tek süzgeç budur** |
| asgari puan | 0.72 | **yok** | ⬇ölçümle alınmadı |
| çapa gücü | dosya 0.9 · dizin 0.5 | **aynı** | `memory_for_file` gerçek çıktısından alındı |

⭐**BÜTÇE İLK YAZIMDA DARDI VE BU BİR HATAYDI (Recep, 09-18).** İlk sürüm 2 ders / 1024 bayt
ile geldi ve dersi ~300 karakterde **kırpıyordu**. Recep'in hükmü: *"Ersin burada ajanın iyi iş
çıkarmasını sağlıyor. İyi iş çıkarmanın önünde kendimiz sıkıştırma ile engel koyuyorsak bu kabul
edilemez; zaten hata açığa çıkacaksa bu maliyeti daha da yukarı çeker."* Yani **bağlam bütçesi
adına kalite kısılmaz**: sıkıştırma bir tasarruf değil, gizli hata maliyetidir. Dar bütçe
ölçülmemiş bir varsayımdı (her istemde basan pano notuna aşırı tepki; oysa bu kol yalnız **dersi
olan** dosyada ve **dosya başına bir kez** konuşur). Optimizasyon ayrı bir konudur ve **ölçümle**
konuşulur; yukarı akımın varsayılanı zaten optimize sayılır, aksini ispatlamadan daraltılmaz.

⛔**ASGARİ PUAN 0.72 ALINMADI — ÖLÇÜLDÜ, KOPYALANMADI.** O eşik yukarı akımın **bileşik**
puanına aittir (bağlam, ilişki, tazelik dahil). Bizim puanımız yalnız `çapa gücü × önem`; bu
ölçekte dosya çapasının azamisi **0.90**, dizin çapasının azamisi **0.50**. Yani 0.72 eşiği,
önem 1.0 olsa bile **bütün dizin çapalı dersleri sessizce silerdi** — sessiz daralma tam bu
kancanın onardığı kusur sınıfı. Süzgeç `asgari önem`, puan yalnız **sıralama** içindir.
*Ders: bir eşik başka bir ölçekten kopyalanmaz; kopyalanırsa ne sildiği ÖLÇÜLÜR.*

⛔**DERS KIRPILMAZ.** Sığmayan ders **bütün** atlanır ve kaç ders atlandığı `memory_for_file`
adresiyle yazılır (atlanmış iş yeşil değildir). Tek ders tavandan büyükse **yine basılır**:
tek dersi de basmayan bir kol, dersi olan dosyada sessiz kalır ve onardığı kusuru tekrar eder.

⏱**DEĞERLER BİR HAFTA ÖLÇÜLECEK (2026-09-25):** kaç ders basıldı, kaç ders atlandı, bağlam
maliyeti ne. Ölçüm gelmeden değer değişmez; değişirse sebebi modül başlığına yazılır.

Yukarı akımın iki yeteneği bizde **bilerek yok**: bağlamda görünen dersi yeniden basmama
(`containsMemoryText`) ve çeşitlilik seçimi (`selectDiverseMemories`). Dosya başına bir kez
konuşan bir kolda tekrar riski zaten düşüktür; gerekirse ölçümle eklenir.

### §6.2 Zorunlu kurallar

1. **SAGE DERSİ TEK İŞ SÖYLER — YAZARKEN.** Çok işi bir arada anlatan ders okunmaz; bu kural
   dersi **yazana** yöneliktir. Gösteren kol dersi **kırpmaz**: kırpma, uzun dersi kısa ders
   yapmaz, **yanlış** ders yapar. Uzun ders bir yazım kusurudur ve `memory_update` ile
   düzeltilir, gösterimde saklanarak değil.
2. **DOSYA BAŞINA BİR KEZ, COMPACT'TA SIFIRLANIR.** Recep: *"gün içinde defalarca compact
   oluyor."* Compact bağlamı kırpar; kırpılmış bağlamda ders bir daha görünmezse hafıza yine
   okunmamış olur. İşaretler oturum + **nesil** ile anahtarlanır, nesil compact/clear
   dönüşünde artar (oturum açılışından `isaretleriTemizle`).
3. **SESSİZ VE FAIL-OPEN.** Ders yoksa, veritabanı yoksa, ölçüm düşerse **hiçbir şey basılmaz**
   ve çıkış 0'dır. Her araç çağrısında uyarı basan bir kanca üç turda görmezden gelinir.
4. **BÜTÇE SAYIYLA YAZILI.** Duvar saati bütçesi, ders sayısı, karakter ve bayt tavanı modülde
   sabit olarak durur ve kapı onları **değerleriyle** ölçer; yorumda kalan bütçe bütçe değildir.
5. **TANIMADIĞIM ÇAPA TİPİNE PUAN VERİLMEZ** (fail-closed puanlama): yeni bir çapa tipi
   gelirse sessizce yüksek puan almaz, önce buraya yazılır.

### §6.3 Hangi ders nereye yazılır

| Ders | Yer | Niçin |
|---|---|---|
| Belirli bir dosya/dizinle ilgili kusur kökü, tuzak, komut notu | **sage** (çapalı) | dokunulunca görünür; dosya taşınırsa çapa taşınır |
| Recep'in kalıcı sözü, üslup, yetki, iş düzeni | **MEMORY.md + dosya hafızası** | her oturum yüklenir, dosyaya bağlı değil |
| Kararın kendisi (numara, onay, tarih) | **karar defteri (OPS)** | numara tek sahipli; iki yerde numara çakışır |
| Nasıl ölçüldüğü, yan yana sayılar | **`docs/audits/`** | ölçüm kaydı uzundur, derse sığmaz |

Kural: bir ders **iki** yere yazılmaz. sage'e yazılan bir ders MEMORY.md'ye satır eklemez;
gerekirse dizin dosyasına katlanır (indeks 16384 baytta sessizce kırpılır, yumuşak eşik 15800).

---

## §7 SAGE YEDEĞİ — tek depo tek arıza noktasıdır (2026-09-18)

Dersler puanlı tek depoya (`.wrongstack/memories/sage.db`) taşınıyor ve o dosya **git dışıdır**
(bilerek: ikili SQLite üç pencerede çatışır, sır taraması ikiliyi görmez, içerik PR incelemesini
atlar). Sonuç: depoyu kaybetmek dersleri kaybetmektir ve **geri dönüşü yoktur**. Yedeksiz depoya
ders yığmak, yazdığı şeyi koruyamayan bir hafıza kurmaktır.

### §7.1 ⛔CANLI DOSYA KOPYASI YEDEK DEĞİLDİR — ÖLÇÜLDÜ

Veritabanı **WAL** kipindedir: yeni yazımlar `sage.db`ye değil yanındaki `sage.db-wal`a düşer.
`sage.db`yi tek başına kopyalamak bekleyen yazımları **atlar** ve kaybın derecesi duruma göre
değişir — ikisi de sahada ölçüldü:

| Durum | `sage.db` | `-wal` | Düz kopyadan okunan |
|---|---|---|---|
| gerçek depo (09-18 12:20) | 217 KB | 758 KB | **20 kayıt** (gerçek: 26) |
| taze WAL (kapı fikstürü) | — | var | **tablo bile yok** ("no such table") |

Yani en makul görünen yedekleme biçimi altı dersi **sessizce** kaybediyordu ve hiçbir şey
uyarmıyordu. Bu yüzden yedek **`VACUUM INTO`** ile alınır: kaynak salt-okuma açılır, çıktı WAL
dahil tek tutarlı dosyadır.

### §7.2 Zorunlu kurallar

1. **YEDEK DOĞRULANMADAN YEDEK SAYILMAZ.** Her koşum ürettiği dosyayı salt-okuma açar ve
   **kayıt sayısı + aktif sayısı + tablo listesini** kaynakla karşılaştırır. Tutmazsa çıkış
   kırmızıdır ve dosya `.DOGRULANMADI` ile bırakılır (kanıt silinmez, budama ona dokunmaz).
2. **YEDEK GIT'E KONMAZ.** Özel hafıza deposu bile üç pencerenin yazdığı bir git deposudur;
   ikili çatışma birleştirilemez. Hedef git dışı bir dizindir
   (`%LOCALAPPDATA%/venthub-sage-yedek`, ya da `VENTHUB_SAGE_YEDEK_DIZINI`).
3. **KAYNAĞA YAZILMAZ:** her açılış `readOnly: true`. Kapı bunu kaynakta ölçer.
4. **KAYNAK YOKSA "yedek aldım" DENMEZ:** durum `kaynak-yok` yazılır, çıkış 0 (sage kurulu
   olmayan makinede kanca/araç gürültü yapmaz) ama hiçbir dosya üretilmez.
5. **SONSUZ BÜYÜME DE ARIZADIR:** en yeni 14 yedek tutulur.

### §7.3 sage'in kendi sınırları (salt-okuma ölçüm, 2026-09-18)

| Soru | Ölçülen cevap |
|---|---|
| `remember` metin sınırı var mı | **var: 20000 karakter** (`MAX_MEMORY_TEXT_CHARS`), aşınca açık hata. Alt sınır: normalleştirilmiş metin ≥ 4 karakter. MCP şemasında `maxLength` YOK — sınır depoda uygulanır |
| `memory_hygiene`/triage MCP kipinde LLM'li mi | **LLM'siz**: MCP katmanında evaluator hiç bağlanmıyor (kaynakta `llm/evaluator` geçişi 0). Deterministik puan (`vs.total/100`), tekilleştirme, çapa doğrulama, saklama süresi/düşük güven eşiğiyle bayat işaretleme ve inceleme adayları **koşar** |
| LLM'siz neyin ATLANDIĞI | LLM'e bağlı kararlar: `keep_llm_override`, LLM puanıyla güven/önem kalibrasyonu, LLM'in bayat hükmü ve **"önem ≥ 0.9 → insan incelemesi" güvenlik kapısı** (o kapıya ancak LLM hükmüyle varılıyor). Ayrıca hiçbir kipte canlı hafıza **otomatik silinmez** |

### §7.4 ⛔KÖK `cwd` DEĞİL ANA AĞAÇTIR — kural bu cetvelde ZATEN yazılıydı (2026-09-18)

Bu dosyanın "⛔Mutlak yol yazılmaz" bölümü 2026-08-28'de şunu yazmıştı: *"worktree'de açılan
oturumların kendi proje dizini vardır ve orada `memory/` yok; cwd'ye güvenen bir kapı en çok
ihtiyaç duyulan yerde kör olur."* **Aynı sınıfı, aynı cetvelin içinde, üç hafta sonra tekrar
ürettim.** Kuralı yazmak uygulamak değildir; bu yüzden artık kural bir MODÜLE bağlıdır.

Ölçülen arıza (`CLAUDE_PROJECT_DIR || __dirname/../..` ile kök çözümü):

| Tüketici | Worktree'de olan | Görünen |
|---|---|---|
| `sage-yedek.cjs` | `.wrongstack` yok → "sage kurulu degil" | **çıkış 0** — yedek hiç alınmaz, başarılı görünür |
| `sage-dosya-dersi.cjs` | dosyanın ana ağaca göre yolu `..` ile başlar → `goreliYol` null | ders satırı **boş**, sebep hiçbir yere yazılmaz |

Aynı dosya, iki ağaç: ana ağaçta **1751 karakter** ders · worktree'de **0**.

Kurallar:

1. **İKİ AYRI KÖK VARDIR, EŞİTLENMEZ.** `scripts/hijyen/ana-kok.cjs`: `anaKok()` = VERİNİN
   kökü (`git rev-parse --git-common-dir`ın ebeveyni, worktree'den bile ana ağaç);
   `agacKoku()` = DOSYANIN kökü (`--show-toplevel`). Çapa yolları depoya görelidir, bir
   worktree dosyasının doğru yolu ancak KENDİ ağacının kökünden çıkar.
2. **"Bilmiyorum" hâlinin cevabı dosyanın dizini DEĞİL proje köküdür.** Git konuşmazsa ikisi
   de `CLAUDE_PROJECT_DIR`/betik köküne düşer. İlk yazımda `agacKoku` başlangıç dizinine
   düşüyordu; `goreliYol` o zaman `hedef.ts` üretiyor, çapa `src/lib/hedef.ts` olduğu için
   eşleşme yine sessizce kaçıyordu (testte yakalandı).
3. **"Kaynak yok" bir BAŞARI satırı değildir.** CLI artık çıkış 0 vermez, aranan yolu ve
   çözülen ana ağacı yazar. Fail-open KANCANIN özelliğidir, betiğin değil.
4. Kapı: `src/__tests__/conformance/sage-ana-kok.test.ts` — **gerçek** bir git worktree kurar.
   Sahte dizin bu arızayı taklit edemez; arıza tam olarak "aynı deponun iki ayrı dizini"
   durumunda doğar.

### §7.5 Yedek ELLE kalmaz — oturum kapanışına bağlanır (karar 51)

Recep'in sorusu: *"neden elle, avantajı ne, unutulursa ne olacak."* Cevap tek cümle:
**elle = unutulur**, ve unutulan yedek kaybın sessiz hâlidir.

1. **Olay, zamanlayıcı değil.** Gözcü/cron kurulmaz (REC-328); yedek, pencerenin kapanışına
   (`SessionEnd`) binen `.claude/hooks/sage-yedek-oturum-sonu.cjs` ile alınır.
2. **24 saat kuralı.** Son yedek 24 saatten yeniyse koşum atlanır — üç pencere aynı ana ağacı
   paylaşır, her kapanışta kopyalamak aynı veriyi günde onlarca kez yazmaktır.
3. **Sessiz ≠ başarılı.** Her koşum sonucunu (`ALINDI` / `ATLANDI` / hata / bütçe aşımı) yedek
   dizinindeki `son-kosum.log`a yazar. Çıkış DAİMA 0: kanca oturum kapanışını bloklayamaz.
4. **Gecikme karar anında görünür.** `defter-tazelik-satiri.cjs` **eşikli** bir SAGE satırı
   yazar: doğrulanamamış yedek varsa, hiç yedek yoksa ya da son yedek 2 günden eskiyse.
   Komşu satırlar (DEFTER, TABAN) her turda konuşur çünkü sayıları sürekli lazımdır; yedek
   öyle değildir — her şey yolundayken yazılan satır, bağlamdan yer alan boş satırdır.
5. **"Son bakım" ÖLÇÜLMÜYOR, uydurulmuyor.** `memory_hygiene` MCP üzerinden koşuyor ve hiçbir
   damga bırakmıyor; damgasız "14 gündür bakım yok" cümlesi ölçüm değil tahmindir. Bakım
   damgası ayrı ve küçük bir iştir.

---

## ORTAK HAFIZA İNDEKSİ — İKİ EŞİK, KATLAMA ve ÇOK-YAZAR YARIŞI (REC-280)

`MEMORY.md` her oturumun açılışında yüklenen **ortak** indekstir ve dört şerit aynı dosyaya
kendi satırını ekler. İki ayrı kusuru bu bölüm yönetir; ikisi de 2026-09-07 20:41–20:57Z
arasında **sahada** ölçüldü.

### Kusur 1 — TAŞMA SESSİZDİR

Dosya **16384 baytı** aşınca alt satırlar **sessizce kırpılır**: uyarı yok, hata yok. O gece
dosya 16414 → 16510 bayta çıktı ve en alttaki dersler **hiçbir oturuma yüklenmedi**; kimse
görmedi. Ölçü **bayttır, satır değil** — kırpma bayta bakıyor.

**İKİ EŞİK, İKİ AD.** Aynı sayıya iki anlam yüklemek, ikisinden birinin sessizce yanlış
olması demektir:

| eşik | değer | ne der |
|---|---|---|
| **yumuşak** | **15800** | *"satır EKLEME, önce katla"* — taşmaya ~584 bayt var, hâlâ pay var |
| **sert** | **16384** | *"taşma OLDU"* — bu bir haber değil **otopsidir**, alt satırlar gitmiş olabilir |

Sert eşik tek başına yetmezdi: ancak taşma **olduktan sonra** yanar.

### Kusur 2 — KAYIP YAZIM HİÇ GÖRÜNMÜYORDU

Aynı dakikalarda üç şerit ayrı ayrı kısalttı (16199 · 16482 · 14021) ve **son yazan
öncekini ezdi**. KATALOG'un cümlesiyle: *"uyarı kolu taşmayı görür, KAYIP YAZIMI görmez."*

> **HÜKÜM — TEK YAZAR DEĞİL: APPEND + KAYIP-YAZIM DEDEKTÖRÜ.**
>
> Tek yazara (ör. "yalnız OPS katlar, şeritler satırını panoyla bildirir") bağlamak
> **reddedildi**, gerekçesi: dört şerit kendi satırını ekliyor ve o şerit compact'a giriyor —
> indeks satırı bir kuyruğa girer ve compact anında kaybolur. Yani tek yazar, kaybı
> **azaltmaz**, yalnız **yerini değiştirir** ve görünmez kılar.
>
> Yerine: yazma **serbest**, kayıp **görünür**. `hafiza-indeks-bekcisi.cjs` (PreToolUse)
> yazımdan önce diskteki satırlarla yeni içeriği karşılaştırır; bir satır kayboluyorsa ve
> metni hafıza dizininde **hiçbir dosyada** bulunamıyorsa uyarır ve satırı gösterir.
>
> **Kaybı görmeyen bir yasak, görünür bir kayıptan kötüdür.**

### Katlama — kalıcı kural (indeksin küçülme yolu)

Eski ders satırları `dizin-*.md` dosyalarına **bölüm olarak taşınır**; indekste yalnız
**dizin işaretçisi** kalır. Bu, indeksin tek meşru küçülme yoludur — satırı silmek değil,
**taşımak**.

⭐**Bu yüzden dedektörün ölçütü "satır kayboldu mu" DEĞİL.** Katlanmış satır da indeksten
çıkar; ayırt etmeyen bir kol her katlamada yanar ve iki günde mobilyaya döner. Ölçüt:
kaybolan satırın **metni** hafıza dizinindeki başka bir dosyada var mı. Varsa katlanmıştır
(**susar**), yoksa silinmiştir (**uyarır**).

### Karşılaştırma NORMALİZE edilir

Satır eşitliği **ham metinle** ölçülmez: CRLF→LF, kenar boşlukları atılır, iç boşluk
dizileri tek boşluğa indirgenir. Sebep: satır sonundaki tek bir boşluk "kayıp" sanılır ve
kol **her dokunuşta** yalancı uyarı basar. Yalancı uyarı üreten kol görmezden gelinir.
12 karakterden kısa satırlar (tek başına `---`, `-`) ölçüme girmez.

### ⛔Bloklamaz — ve niçin

Bekçi **daima çıkış 0** verir. İki sebep: (1) kanca cetveli hızlı ve çevrimdışı olmayı şart
koşar; (2) hafıza yazımını bloklamak **oturumun kaydını kaybettirir** — `pre-commit`
2026-08-15'te tam bu sebeple uyarı-only yapıldı ve o karar geri alınmıyor.

Bekçi **kendi hatasında da susmaz**: tek satır *"BEKCI CALISAMADI"* basar. Sessiz kalsaydı
ölü ama yeşil olurdu — *"uyarı gelmedi"* ile *"bekçi çalışmadı"* ayırt edilemezdi.

### ⛔Mutlak yol yazılmaz

Hafıza dizini `os.homedir()` + oturumun transcript kanıtından **türetilir**, gövdeye
gömülmez: depo 2026-08-15'ten beri PUBLIC ve kullanıcı adı taşıyan yol kimlik sızdırır
(§24). Türetim `precompact-durum-kapisi.cjs` ile aynı mantığı kullanır ve aynı ölçülmüş
sebeple: worktree'de açılan oturumların kendi proje dizini vardır ve orada `memory/` **yok**;
cwd'ye güvenen bir kapı en çok ihtiyaç duyulan yerde kör olur (2026-08-28 ölçümü).

### Kapı

`src/__tests__/conformance/hafiza-indeks-bekcisi-kilidi.test.ts`, yedi kol: `settings.json`'a
bağlı · exit 2 yok + kendi hatasını söyler · mutlak yol yok, dizin türetilir · ⭐**katlanmış
satır sessiz / silinmiş satır uyarır** (ayırt edici çift) · yalnız boşluk farkı uyarı üretmez
· yumuşak eşik üstünde uyarır, altında susar (ikinci ayırt edici çift) · precompact iki eşiği
taşır ve **farklı** şey söyler.
