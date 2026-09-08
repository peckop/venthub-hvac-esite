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
