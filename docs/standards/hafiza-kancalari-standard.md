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
| `hafiza-enjeksiyonu.cjs` | kanca | istemin konusuna göre en çok 3 sage dersini bağlama koyar; bastığı ID'yi deftere yazar (§8) | UserPromptSubmit | ARAÇ | `…/hafiza-enjeksiyonu.test.ts` (INV-HAFIZA-ENJEKSIYONU-1..12) |
| `hafiza-kullanim-sayaci.cjs` | kanca | defterdeki enjeksiyonları `recordInjection`, transcript atıflarını `recordUse` ile sage'e yazar | Stop (async) | ARAÇ | aynı kapı |
| `sage-hijyen-oturum-sonu.cjs` | kanca | taze doğrulanmış yedek varken `port.hygiene` koşar | SessionEnd | ARAÇ | aynı kapı |
| `scripts/hijyen/hafiza-enjeksiyonu.cjs` · `sage-enjeksiyon-defteri.cjs` | modül | konu/sayaç/hijyen mantığı (port enjekte) · oturum+nesil anahtarlı enjeksiyon defteri | üç kanca + `sage-dosya-dersi` | ARAÇ | aynı kapı |

⚠**AYARA KAYIT RECEP KAPISI:** bu tabloda listelenen bir kanca `.claude/settings.json`'a
bağlanmadıkça **dosya olarak var, tetik olarak ölüdür** (tablodaki kanca sayısı değişir; sayıya
değil bağlantıya bakılır). Akran isteğiyle ayar dosyasına dokunulmaz. Kayıt satırları Recep'e
sunulur; sunulana kadar bu cetveldeki "tetik" kolonu *tasarlanan* tetiği gösterir, *çalışan* değil.
REC-519'un üç kancasının bağlantısı `INV-HAFIZA-ENJEKSIYONU-10` ile ölçülür (settings'ten silinirse kırmızı).

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
gerekirse dizin dosyasına katlanır (indeks **200 satırda ya da ~25.000 baytta**, hangisi önce dolarsa,
sessizce kırpılır; yumuşak eşik 160 satır / 20.000 bayt — aşağıdaki bölüm).

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

1. **Olay, zamanlayıcı değil.** Eski gözcü üçlüsü emekli (REC-328). ⚠**Karar 53
   (2026-09-19):** bu genel bir yasak değildi, dönemsel bir karardı — zamanlayıcı / cron /
   loop gerekiyorsa **önce Recep'le konuşulur**. Burada olay yeterli: yedek, pencerenin kapanışına
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

### §7.6 YEDEK "sage" DEMEK DEĞİL — `.wrongstack/` altındaki HER depo (2026-09-19)

İş kartı panosu açılınca ölçüldü: pano da aynı yerde, aynı biçimde yaşıyor —
`.wrongstack/kanbans/_kanban.sqlite`, **WAL kipli, git DIŞI, yedeksiz**. Ölçüm anında ana dosya
**4 KB**, WAL'ı **148 KB** idi: panonun içeriği pratikte tamamen WAL'daydı ve düz bir kopya
neredeyse boş bir pano verirdi. Ders zaten yazılıydı ("WAL kipli HERHANGİ bir SQLite verisi");
eksik olan, yedeğin o dersi **uygulaması**ydı.

1. **Depo listesi veridir, varsayım değil.** `DEPOLAR` dizisi betiğin içinde yazılıdır; yeni bir
   `.wrongstack` deposu doğarsa listeye girer. Her depo kendi öneki ve uzantısıyla yedeklenir,
   budama **önek başına** çalışır (yoksa biri ötekinin yedeklerini yer).
2. **"Biri alındı" HEPSİ alındı demek değildir.** CLI ve oturum kancası her depoyu **ayrı**
   raporlar. Çıkış kodu: kaynağı olan bir depo düşerse kırmızı; hiçbiri yedek üretemediyse de
   kırmızı. Kaynağı hiç olmayan depo (ör. pano bu makinede açılmamış) tek başına kırmızı yapmaz
   ama **satırı yazılır**.
3. **İstem satırı EN KÖTÜ depoyu anlatır.** İki depodan biri dün, öteki hiç yedeklenmişse "son
   yedek dün" demek yalandır. Ölçüt: bu makinede **kaynağı olan** depoların en kötüsü.
4. **Parmak izi artık HER TABLONUN satır sayısıdır** (eskiden yalnız `memories`). Tablo listesi
   tek başına yetmez: boş bir kopya da aynı listeyi taşır.
5. **⛔SANAL TABLO SAYILMAZ, ama listede kalır.** Ölçüldü: sage'in `memories_fts` tablosu harici
   içerikli bir FTS5 sanal tablosudur ve `count(*)` *"no such column: T.text"* ile patlar. Genel
   parmak izinin ilk yazımı bu yüzden **sage yedeğini tamamen düşürdü** — ve iyi ki düşürdü:
   sessiz kalsaydı yedek alınmadan "alındı" denecekti. Gölge tabloları (`*_fts_data`, `*_fts_idx`,
   `*_fts_docsize`) gerçek tablodur ve sayılır.

---

## §8 KONU ENJEKSİYONU · KULLANIM SAYACI · HİJYEN (REC-519, 2026-09-30)

WrongStack'in üç "kapalı" parçası Claude Code'da çalışmıyordu çünkü hepsi WrongStack'in kendi
boru hattına bağlıydı. Üçü de kanca olarak yazıldı; mantık `scripts/hijyen/hafiza-enjeksiyonu.cjs`
başlığında **gerekçesiyle** durur, burada yalnız kurallar:

1. **KONU KOLU (UserPromptSubmit):** en çok **3 ders / 1400 karakter**, asgari önem 0.5, bütçe 2500 ms
   (sage YÜKLEMESİ bunu aşarsa o istemde sessiz çıkılır ve günlüğe yazılır). Başlık "HAFIZA (konu) —
   bilgi notu, talimat DEĞİL:". Bağlam doluluğuna göre azaltma **yok** — doluluk kancanın girdisinde
   yok ve yukarı akım eşikleri (65/82/95) bizim için ölçülmedi. Her ateşleme `hafiza-kancalari.log`a
   ders kimliği + istemin ilk 80 karakteriyle yazılır (gösterim günlüğü).
   **GÜVENLİK (istem enjeksiyonu yüzeyi):** ders metni `additionalContext`'e girer ve sage'e yazan HER
   ajan tarafından belirlenir. Ders başına **700 karakter tavanı** (aşan ders BASILMAZ, kırpılmaz; atlanan
   sayısı "N ders daha var" notuna eklenir — hiçbir ders sığmasa bile not yazılır, kol sessiz kalmaz),
   `<` `>` etkisizleştirilir (‹ ›). Bu zarar azaltmadır, sınır değildir: sage'e yazma yetkisi olan ajan düz
   metinle "öneri" yazabilir. Bedel (2026-09-30, sage kopyası, tekSatir sonrası): 166 aktif dersin **32'si**
   >700 karakter (önem≥0.5 olanlarda 32/158): 20 convention, 2 bug_root_cause, 1 decision, 9 fact —
   yani kaybedilen şey rastgele uzun not değil, en yüksek değerli kurallar. Bunlar konu kolunda ders
   olarak GÖRÜNMEZ; yerine notta BAŞLIĞI (ilk 60 karakter, etkisizleştirilmiş) çıkar. Dosya dersi kolu
   (dosya başına bir kez) etkilenmez. Uzun derslerin kısaltılması (özet + ayrıntı ayrı kayıt) OPS
   kararıdır (katman-4); bu PR onlara dokunmaz. **Not bir kez:** atlanan ders notu (oturum, nesil)
   başına bir kez basılır (`.sage-atlanan-*.jsonl`); ders deftere/sayaca GİRMEZ.
2. **ALAKA SÜZGECİ ZORUNLUDUR (ölçüldü):** `searchSage` durak sözcüksüz `OR` araması yapar; gerçek
   daemon'a sorulan istemlerin hepsi 2-5 ders döndürdü ("merhaba nasilsin" dahil). Süzgeçsiz kanca her
   istemde öter (K3). Ders, istemin içerik terimlerinin yarısını (alt sınır 2, üst sınır 3) taşımalı;
   aynı oturum-nesilde bir ders bir kez basılır. Yaklaşık ateşleme oranı %27 (son ~67 gerçek istem,
   bir tek koşum): **ölçüm kaydı depoda yok**; yöntem = gerçek istemler × canlı `searchSage` ×
   `ortakTerimSayisi/gerekliOrtakTerim`. Yeniden üretmek için kayıtlı betik yoktur, yazılması gerekir.
3. **KANCA DAEMON BAŞLATMAZ:** `server.json` yok/pid ölü → sessiz çıkış, sage paketi yüklenmez. Port
   `initialize()` ile değil spawn etmeyen `connection.status()` ile açılır (`initialize` daemon'u başlatır).
4. **SAYAÇ STOP'TA, TOPLU:** konu ve dosya dersi kancaları yalnız **deftere** yazar
   (`.sage-enjekte-<oturum24>-<nesil>.jsonl`, yalnız-ekleme); Stop kancası `recordInjection` →
   transcript taraması → `recordUse` yapar ve satırı `sayildi/kullanildi` işaretler. **Doğrudan
   sqlite UPDATE YASAK** (daemon tek-yazar zinciri). **Çift sayma yok — KOŞULLU:** satır işareti tek
   başına yetmez; iki Stop örtüşürse ikisi de "sayılmamış" görür (ölçüldü: iki eşzamanlı çağrıda toplam
   2 kimlik, beklenen 1). Bu yüzden Stop kolu oturum başına kilit dosyası (`wx`) alır, alamazsa sessiz
   çıkar, 60 sn'den bayat kilit düşer. Kilit dışında bir yerde (ör. elle iki süreç) garanti yoktur.
5. **KULLANIM EŞLEŞTİRMESİ:** yukarı akım `InjectionTracker.consumeMatches` kuralı (ID · ilk 80 karakter ·
   belirteç ≥3 ve ≥%50) yerel kopyada, **her asistan yanıtına AYRI** uygulanır (yukarı akım gibi; ilk
   yazımda yanıtlar birleştiriliyordu ve bağımsız ölçümde gerçek transcript'lerde 3-40 ders sahte
   "eşleşiyordu", ayrı ayrı 0 — düzeltildi). İki bilinçli fark: `İ`→`i` + U+0307 silme, Türkçe harf katlama.
   Yanlış-pozitif/negatif oranı **ölçülmedi** (etiket yok); yön kararı: yanlış-negatif pahalı (hijyen
   "hiç kullanılmadı" inceleme adayı üretir), kural sıkılaştırılmadı. Etiketsiz saha ölçümü: 60 gerçek
   asistan mesajı × 166 ders → oran eşiği 0.5'te 0 eşleşme, 0.4'te 2, 0.3'te 12, 0.25'te 63 (gürültü);
   yani kural rastgele eşleşme üretmiyor ama uygulanan dersi de zor yakalıyor — eşik etiketli örneklemle
   yeniden ölçülünce değişir. Transcript yalnız SONU okunur (681 MB).
6. **HİJYEN YALNIZ TAZE YEDEKLE:** SessionEnd kancaları paralel koşar (sıra garantisi yok); hijyen son
   doğrulanmış sage yedeğinin <24 saat olduğunu kendisi ölçer, gerekirse 20 sn'ye kadar bekler,
   yoksa **atlar ve sebebi loga yazar**. "Doğrulanmış" = dosya var DEĞİL: `VACUUM INTO` dosyayı doğrulamadan
   önce yaratır. Ölçüt: boyut>0 + SQLite başlığı + (`son-kosum.log`ta `[sage] ALINDI <ad>` VEYA dosya ≥15 sn
   eski). `purgeDeletedAfterDays` HİÇBİR çağrıda verilmez. Sonuç özeti PANO dizinindeki
   `hafiza-kancalari.log` dosyasına yazılır.
   **OPS 4 hafta kapısı:** `injected_never_used` silme önerileri `ONERI_KAPISI_MS` (2026-10-28) öncesinde
   ÜRETİLMEZ (`archiveUnusedAfterDays: 3650`), kodda sabit tarih. Kapsam: YALNIZ bu kancanın hijyeni;
   ajanın elle koştuğu `memory_hygiene` aynı adayı üretebilir.

Kapı: `src/__tests__/conformance/hafiza-enjeksiyonu.test.ts`. **Sabotaj kaydı** PR #1590 gövdesindedir.
Sabotajsız kolun yeşili kanıt sayılmaz: bağımsız inceleme ilk yazımda 7 kolun sabotajda YEŞİL kaldığını
buldu (penceresi, durak süzgeci, zaman aşımı sarmalayıcısı, çıktı zarfı, spawn'lı port açılışı, dolaylı
purge anahtarı, <4 belirteç koruması); kollar eklendi. Sage paketi kurulu olmadan gerçek kanca kablosunu
ölçmek için testler geçici proje köküne sahte `@wrongstack/sage` modülü ve canlı pid'li `server.json` koyar.

---

## ORTAK HAFIZA İNDEKSİ — İKİ EŞİK, KATLAMA ve ÇOK-YAZAR YARIŞI (REC-280)

`MEMORY.md` her oturumun açılışında yüklenen **ortak** indekstir ve dört şerit aynı dosyaya
kendi satırını ekler. İki ayrı kusuru bu bölüm yönetir; ikisi de 2026-09-07 20:41–20:57Z
arasında **sahada** ölçüldü.

### Kusur 1 — TAŞMA SESSİZDİR

Dosya kırpma sınırını aşınca alt satırlar **sessizce kırpılır**: uyarı yok, hata yok. O gece
dosya 16414 → 16510 bayta çıktı ve en alttaki dersler **hiçbir oturuma yüklenmedi**; kimse
görmedi.

> **DÜZELTME (2026-09-29, HARİTA ölçtü, REC-433 1.9):** gerçek sınır **200 SATIR YA DA ~25.000
> BAYT**, hangisi önce dolarsa. Yukarıdaki "16384 bayt / ölçü bayttır, satır değil" eski
> ölçümdü ve **yanlıştı**: satır sınırı hiç izlenmiyordu. Kırpma modele "Only part of it was
> loaded" notuyla bildirilir, kullanıcıya görünmez.

**İKİ EŞİK, İKİ AD.** Aynı sayıya iki anlam yüklemek, ikisinden birinin sessizce yanlış
olması demektir:

| eşik | değer | ne der |
|---|---|---|
| **yumuşak** | **160 satır / 20.000 bayt** | *"satır EKLEME, önce katla"* — sınıra 40 satır / 5 KB pay var; UYARIR, engellemez |
| **sert** | **200 satır / 25.000 bayt** | *"taşma OLUR"* — yazımın SONUCU sınırı aşıyorsa yazım **ENGELLENİR** (bekçi, çıkış 2); compact kancası ise haber verir (otopsi) |

Sert eşik tek başına yetmezdi (ancak taşma **olduktan sonra** yanar); uyarı tek başına da
yetmedi (filo aynı gün üç kez kırpmayı görmedi). Bu yüzden bekçi (`hafiza-indeks-bekcisi.cjs`)
yazımdan **önce**, yazımın **sonucunu** ölçer:

- **KÜÇÜLTEN yazım HER ZAMAN geçer** (katlama adımı): dosya zaten sınırın üstündeyse ve yazım
  onu küçültüyorsa engellenmez — yoksa şişmiş bir indeksi kimse onaramaz, kapı kilitlenir.
- **Engellenen yazım kaybolmaz:** sebep ve "önce katla" talimatı modele döner, model daha kısa
  yazıp yeniden dener. Oturumun asıl kaydı ayrı durum dosyalarındadır; engel yalnız
  `.../memory/MEMORY.md` indeksine uygulanır.
- **Ölçülen dosya yazılan dosyanın kendisidir** (oturumun proje dizinindeki değil): başka
  projenin indeksinde yalancı "satır siliniyor" uyarısı ve worktree oturumlarındaki kör nokta
  böyle kapandı.
- Bekçinin **kendi hatası** yazımı engellemez (çıkış 0, ama sessiz değil: "BEKCI CALISAMADI").

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

(Güncel durum, 2026-09-29'dan beri: bekçi hedefi **yazılan dosyanın yolundan** türetir, `os.homedir()` kullanmaz;
aşağıdaki transcript/`os.homedir()` anlatımı precompact kapısı içindir.) Hafıza dizini `os.homedir()` + oturumun transcript kanıtından **türetilir**, gövdeye
gömülmez: depo 2026-08-15'ten beri PUBLIC ve kullanıcı adı taşıyan yol kimlik sızdırır
(§24). Türetim `precompact-durum-kapisi.cjs` ile aynı mantığı kullanır ve aynı ölçülmüş
sebeple: worktree'de açılan oturumların kendi proje dizini vardır ve orada `memory/` **yok**;
cwd'ye güvenen bir kapı en çok ihtiyaç duyulan yerde kör olur (2026-08-28 ölçümü).

### Departman indeksi (2026-09-30, HARİTA kararı 4; şartname `hafiza-yazma-duzeni-standard.md` §7)

Bekçi `.../memory/departman/<ROL>/MEMORY.md` dosyalarını da tanır (yalnız bu yol biçimi; harf duyarsız, `..` giderilmiş;
`docs/departman/...`, `departman/<ROL>/alt/MEMORY.md`, konu dosyaları SUSAR). Departman indeksi Claude'un yerleşik yoluyla
yüklenmez, `SessionStart` kancası onu rol kartıyla enjekte eder ve enjeksiyon **60 satır / 8 KB**'ta keser; bekçi aynı sayıyı
**YUMUŞAK** eşik yapar, yoksa bekçiden geçen indeks açılışta görünmeden kırpılırdı.

| | ana `memory/MEMORY.md` | `departman/<ROL>/MEMORY.md` |
|---|---|---|
| yumuşak (UYARIR, engel değil) | 160 satır / 20.000 bayt (`>=`) | 60 satır / 8.000 bayt (**aşılınca** `>`: 60 satır enjeksiyona sığar) |
| sert (ENGELLER, çıkış 2) | 200 satır / 25.000 bayt | **aynı** 200 / 25.000 (engel dalı tektir) |
| katlanmış satır aranan yer | hafıza dizini (`dizin-*.md`) | departmanın kendi dizini (`departman/<ROL>/<konu>.md`) |

Ana `MEMORY.md` davranışı değişmedi (regresyon testi). **Ortak aday işlevi bu değişiklikte YAZILMADI:** bekçi hedefi yazılan
dosyanın yolundan türetir, aday kümesi gerekmez. Kilit testinin `projeDiziniBul` yasağı bu yüzden **bilinçli** gevşetildi
(hazırlık): ad yalnız paylaşılan modülden `require` edilen ortak işlev olarak serbest, kancanın içinde yerel türetim ve
`os.homedir()` yasak; **mutlak kullanıcı yolu yasağı ve `os.homedir()` ile türetilmiş modül sabiti yasağı aynen kalır**
(`.claude/hooks/lib/*hafiza*|*aday*.cjs` yazıldığı gün otomatik kapsanır).

### Kapı

`src/__tests__/conformance/hafiza-indeks-bekcisi-kilidi.test.ts`, yedi kol: `settings.json`'a
bağlı · exit 2 yok + kendi hatasını söyler · mutlak yol yok, dizin türetilir · ⭐**katlanmış
satır sessiz / silinmiş satır uyarır** (ayırt edici çift) · yalnız boşluk farkı uyarı üretmez
· yumuşak eşik üstünde uyarır, altında susar (ikinci ayırt edici çift) · precompact iki eşiği
taşır ve **farklı** şey söyler. Departman genişlemesiyle eklenenler: eşik çifti (59/60 sessiz, 61 uyarı) ·
bayt eşiği · Edit sonucu · sert eşik ortak · ana regresyon · katlama araması departman dizininde · tanıma sınırları ·
harf duyarsız + `..` · fail-open (boş/bozuk/okunamayan) · **mutasyon tablosu** (kancanın kritik satırı bozulunca senaryo
kırmızı) · kullanıcı yolu dedektörlerinin sabotaj testi.
