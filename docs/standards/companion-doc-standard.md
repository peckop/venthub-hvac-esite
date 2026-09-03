# Companion Doküman Standardı (cetvel) — v0.1

> **Kapsam:** Kod dosyalarının yanında duran üretilmiş `.md` "companion" dokümanları —
> hangi companion meşrudur, kaynağı gidince ne olur, hangi `.md` companion sayılmaz.
> **Bekçi:** `src/__tests__/conformance/companion-doc-parity.test.ts` (INV-DOC-1).
> **Doğuş sebebi:** T067 kapanışında (2026-08-17) iki yetim companion bulundu —
> `BulkActionToolbar.md` (kaynağı #544'te BulkBar'a birleşti) ve `FanRenderer.md`
> (kaynağı `ProductModelRenderer` olarak yeniden adlandı). İkisi de silinmiş/var olmayan
> bileşenleri anlatıyordu ve **NotebookLM dijital ikizine yüklenme yolundaydı.**

## C0 — Companion nedir, neden önemlidir

Companion = Orion/Corpus-Callosum doküman hattının bir kaynak dosya için ürettiği,
**aynı dizinde aynı adı taşıyan** `.md` dosyası (`Foo.tsx` → `Foo.md`). Üretim
`post-commit` kancasında arka planda olur (log: `.git/orion-doc.log`).

Bu dosyalar yalnız repoda durmaz: master MD'lere derlenip **NotebookLM ikizine** yüklenir
ve mimari sorularının RAG kaynağı olur. Bu yüzden yetim companion "sessiz bayat doküman"
değil, **ikize giden aktif yanlış bilgidir** — var olmayan bir bileşen varmış gibi anlatılır
ve buna dayanan cevaplar üretilir.

## C1 — Kaynağı olmayan companion = İHLAL

`src/`, `supabase/functions/`, `scripts/` altındaki her `X.md` için aynı yolda bir kaynak
dosya bulunmalıdır: `.ts .tsx .js .jsx .mjs .cjs .py .ps1 .sh .sql`.

**Kaynağı silen veya yeniden adlandıran, companion'ını da aynı commit'te siler.** Üretici
hat yalnız EKLER; silmeyi/yeniden adlandırmayı takip etmez — bu boşluk kapıyla kapatıldı.

Ölçüm kaynağı **`git ls-files`**, disk değil (bilinçli): "diskten sildim ama commit etmedim"
durumunda disk taraması yeşil verir, oysa depoda dosya durur ve ikize o gider. Doğru soru
"DEPODA yetim var mı?"dır.

## C2 — Companion SAYILMAYAN `.md` dosyaları

- **Kod kökleri dışındaki her şey:** `docs/**` (elle/NLM üretimi master MD'ler),
  `.agent/**`, `.claude/**` (skill tanımları), kök seviyesi (`CLAUDE.md`, `CONTEXT.md`, …).
  Bunlar kaynak dosyası olmayan bağımsız dokümanlardır.
- **Dizin dokümanları:** `README.md`, `CHANGELOG.md`, `LICENSE.md` — kod köklerinde olsalar
  bile elle yazılmışlardır (ölçüldü: `src/components/authority/README.md`,
  `supabase/baselines/README.md`).

Yeni bir muafiyet gerekirse buraya **ADLA** yazılır ve INV-DOC-1'deki muafiyet ifadesine
aynı adla eklenir. "Şimdilik geç" modu yoktur (fail-open yasağı).

## C3 — Ters yön: niçin ayrı bekçi (v0.1'de kapsam dışıydı)

"Kaynağı var ama companion'ı yok" v0.1'de kapsam **dışıydı** ve gerekçe sağlamdı:
eksik companion bir bilgi **boşluğudur** (ikiz o dosyayı bilmez), yetim companion ise
**yanlış bilgidir** (ikiz olmayan şeyi bilir) — ikincisi zararlı, ilki yalnız eksik.
Ayrıca companion üretimi `post-commit`te asenkron olduğu için "her kaynağın companion'ı
olmalı" kuralı taze commit'lerde **yanlış-kırmızı** üretirdi.

**2026-08-17'de ölçüldü ve gerekçe DOĞRULANDI** (çürütülmedi) — ama aşılabilir çıktı:

| | toplam | 7 günden eski |
|---|---|---|
| companion'ı yok | 36 | **1** |
| companion bayat (kaynaktan eski) | 189 | **34** (34'ü 30 günden de eski) |

Gürültünün tamamı taze pencerede. Yani kuralı uygulanamaz kılan şey kuralın kendisi değil,
**yaş eşiğinin olmamasıydı**. Eşiğin ötesinde kalan dosya artık "henüz üretilmedi" değildir;
34 companion'ın 30 günden eski olması bunu kanıtlıyor — üretilmeyi beklemiyorlar, unutulmuş.

Bu yüzden ters yön ayrı bir bekçiye taşındı: **§C4 + §C5, `INV-DOC-2`**
(`src/__tests__/conformance/companion-parity-coverage.test.ts`).

İlgili ama HENÜZ YOK: `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (§C6, aşağıda).

## C4 — Companion'ı olmayan ESKİ kaynak = SAYILIR, bloklamaz (yaş eşikli)

Kapsamdaki bir kaynak dosyanın son commit'i **7 günden eskiyse** ve companion'ı yoksa
bu bir borçtur. 7 gün ve altı, asenkron üretim penceresi olarak **muaftır**.
Etki: ikiz o dosyayı hiç bilmez, "bu kod nasıl çalışıyor" sorusuna eksik cevap verir.

**Bu borç 2026-09-03'ten beri BLOKLAMAZ; sayılır ve adlarıyla raporlanır** — Recep'in
**2026-08-31** kararıyla companion üretici taşıyıcı KAPALI tutulduğu için (abonelik
maliyeti). Bu, **bilinen ve kabul edilmiş bir eksiktir**: taşıyıcı kapalıyken kapı borcu
**önleyemez**, yalnız cezalandırır.

**Niçin değişti — ölçülmüş vaka (2026-09-03).** `DataTablePagination.tsx` 2026-08-26'da
geldi; 09-03'te 8. gününü doldurdu ve **hiçbir commit atılmadan**, yalnızca takvim
ilerlediği için o gün açık olan **bütün PR'ları** kırmızıya çevirdi. Aynı ölçümde
üretim hattının **28 Ağustos'tan beri ölü** olduğu görüldü (20–28 Ağustos arası 81
companion eklenmiş, sonrasında 1). Yani kapı, kimsenin kapatamayacağı bir borcu
haftada bir filo kilidine dönüştürüyordu.

⚠**Eşik UZATILMADI, bilerek:** 7'yi 30'a çekmek aynı tuzağı **erteler**, kaldırmaz —
30. günde aynı kilit gelir ve o gün sebebi hatırlayan kimse olmaz.
⚠**Kapı SİLİNMEDİ, bilerek:** silinen kapı **kapatılmış borç** sanılır. Kalan biçim
"say, adlarıyla raporla, bloklama"dır; sayı `board.cjs yoklama` çıktısında da görünür.
Sayının **ayırt ettiği** ayrı bir kolla kilitlidir (companion'sız dosya eklenince sayı
artmıyorsa test kırmızı verir) — çünkü bloklamayan bir kolun tek değeri budur.

**C5 BLOKLAMAYA DEVAM EDER** ve bu tutarsızlık değil: bayat companion, ikize *emin
biçimde yanlış* cevap verdirir (§C5) ve çözümü taşıyıcıya bağlı değildir — companion
silinebilir ya da kaynak geri alınabilir. Eksik companion ise yalnız taşıyıcı açılarak
kapanır.

### ⭐HÜKÜM — üretilmiş dosyaya dokunan iş İKİ COMMIT'tir

Kaynağı (ya da üretilmiş bir dosyayı) commit et → **sonra** derle → üretilmiş artefaktları
**ayrı** commit'le. İkisini aynı commit'e koymak tazelik kapısını (`INV-DOC-4b`) **yapısal
olarak** kırmızı yapar: derleme kaynağın **commit'lenmiş** blob SHA'sını yazar, o an yeni
hâl henüz commit'li değildir, manifest bir önceki blob'u kaydeder ve kaynak commit'lenir
commit'lenmez manifest bayat olur. 2026-09-03'te bu bedel **tek günde iki kez** ödendi.

## C5 — Kaynağından ESKİ companion = ihlal (yaş eşikli)

Companion'ın son commit'i kaynağın son commit'inden eskiyse ve kaynak 7 günden eskiyse
ihlaldir. Etki §C4'ten **daha kötüdür**: ikiz dosyanın eski hâlini bilir ve emin biçimde
yanlış cevap verir. Eksik bilgi belirsizlik yaratır, bayat bilgi yanlış güven yaratır.

**Kapsam = `.cc_docs.yaml`'ın kendisi (SSOT).** Bekçi kendi dosya listesini uydurmaz:
`source_dirs` + `extra_masters` eksi `skip_dirs` eksi `skip_files`. Niçin bu şart —
ilk ölçümde `.agent/` altındaki betikler sayılmış ve sonuç 84/211 çıkmıştı; oysa `.agent`
yaml'da `skip_dirs` içinde, yani doküman hattı oraya hiç bakmıyor. **Bekçi üreticiden
farklı kapsam kullanırsa ölçtüğü şey gerçek değildir.**

**Ratchet, sıfır değil.** Mevcut borç (C4=1, C5=34) taban olarak dondurulur: yeni borç
eklenemez, azalınca taban düşürülmelidir (stale-guard bunu zorlar). Niçin tam-kapalı
kurulmadı: bekçi ilk günden kırmızı yanarsa görmezden gelinir — bu depoda yaşandı
(rastgele patlayan `pre-commit` `--no-verify` alışkanlığı doğurdu, T033).

**Ölçüm kaynağı = `git`, disk değil** (§C1 ile aynı gerekçe). Ek ölçüm: 2026-08-17'de
17 companion **diskte güncel ama git'te eskiydi**. Bu ayrışma kendisi bir bulgudur ama
bu bekçinin sorusu değildir; ikize giden şey depo hâlidir.

## C6 — `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (MASTER'DA KAPI YOK — AÇIK PR'DA BEKLİYOR)

Yaml'da listelenen bir kaynağın deftere gerçekten yüklendiği (ve defterde yaml'da
olmayan artık kaynak bulunmadığı) ölçülmelidir. 2026-08-17'de elle yapıldı ve **5 eksik
kaynak** bulundu — yani ikiz, var olduğu sanılan belgeleri hiç görmüyordu.

Kapının doğrudan yazılamamasının sebebi teknik: conformance testleri **ağ kullanamaz**,
defter durumu ise yalnız ağ üzerinden görülür. Bu yüzden iki parçalı:

1. **Üretim (Orion, `orion@fc0aec0` — yapıldı):** sync, yüklemelerden **sonra defteri
   yeniden listeleyip** `docs/nlm_sync_manifest.json` yazar.
2. **Bekçi — KİMLİK HENÜZ VERİLMEDİ, MASTER'DA YOK** (`src/__tests__/conformance/nlm-manifest-parity.test.ts`,
   yalnız PR #640 dalında yazıldı)**:** yaml ile manifest'i karşılaştırır; beş iddia —
   manifest var mı · `olcum_basarili` mı · yaml'daki her kaynak manifest'in beklenen
   listesinde mi (bayat manifest tespiti) · `eksik` boş mu · `fazla` boş mu.
   Gerekçesi ve kimlik hikâyesi bu bölümün sonundaki DÜZELTME notundadır.

**Manifest NİYETİ değil ÖLÇÜMÜ yazar.** Niyet listesinden üretilse, yükleme yarıda kalsa
bile "hepsi yüklendi" derdi — T075'te yakalanan sınıfın aynısı (başarısız işlem denetim
defterine `success` yazıyordu) ve o sınıfın en sinsi tarafı kaydın **kanıt gibi görünmesi**.
Ölçüm yapılamazsa manifest `olcum_basarili: false` + sebep yazar ve karşılaştırma alanlarını
**boş bırakır**; boş listeyi "parite tam" diye okumak yasaktır (Orion tarafında 7 testle kilitli).

**İKİ DURUM AYRIDIR — karıştırılırsa risk yanlış okunur.** `#640` DALINDA kapı bilinçli
KIRMIZI ve bu doğru. **MASTER'DA ise kapı hiç YOK**, ve bu aynı şey değildir: kırmızı kapı
bağırır, **olmayan kapı sessizdir.** Bu maddenin eski hâli "şu an bilinçli kırmızı" diyerek
okuyucuya *"korumamız var, sadece geçmiyor"* izlenimi veriyordu; gerçek durum
*"bu eksende hiçbir koruma koşmuyor"*. Aşağıdaki gerekçe `#640` dalındaki kırmızıyı
açıklar: manifest ancak gerçek bir
`orion tree --nlm-sync` koşumuyla doğar, o komut da **canlı deftere** yazar (eski kaynakları
silip yeniden yükler). Yani **silahlandırma bir yetki kararıdır**, testin işi değil — Recep
onayı bekliyor. Fail-open eklenmedi: "defteri göremedim ama geçtim" diyen bir parite kapısı,
kapının hiç olmamasından kötüdür çünkü yeşil görünür.

⚠ 2026-08-18'de bir **otomatik onarım botu** bu bilinçli kırmızıyı arıza sanıp manifesti
**elle uydurdu** (`olcum_basarili: true`, uydurma zaman damgası, icat edilmiş `source-1…N`
id'leri; PR #643, kapatıldı). Türev kural `collaboration-protocol.md` **K7**'ye yazıldı:
denetim artefaktı **elle yazılmaz** — onu üreten şey ölçümü yapan araç olmalıdır.

### ⭐DÜZELTME (2026-09-03, ölçüldü) — bu bölüm İKİ yanlış iddia taşıyordu

**(1) "yazıldı" master'ı işaret ediyordu; ölçüldü, dosya master'da da çalışma ağacında da
YOK** — yalnız `#640` dalında var, o da 16 gündür açık. Bir cetvelin "yazıldı" demesi
dosyayı var etmez: **"kural yazıldı" ile "koruma çalışıyor" ayrı iddialardır** ve ikincisi
ayrıca ölçülür (aynı sınıf: `uretilmis-artefakt-standard.md` AXIOM 10). Bu yanlış iddianın
yıllanabilmesinin sebebi de kayda değer — **bu satırı hiçbir kapı okumuyordu.**

**(2) Kimlik `INV-DOC-3` idi ve o kimlik BAŞKA bir kapıda CANLI:**
`src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts` içindeki Kapı C, üstelik
`uretilmis-artefakt-standard.md`'nin hüküm tablosunda kayıtlı. **Aynı kimlik iki şeyi
işaret ediyordu.** Bedeli çakışmanın kendisinden büyüktür: *"INV-DOC-3 yeşil"* cümlesinin
hangi kapı için söylendiği belirsizleşir ve **yeşil, var olmayan kapıya mal edilebilir.**
Tazelik kapısının kimliği KORUNUR.

**Kimlik ATANMADI, bilerek.** Var olmayan bir kapıya şimdiden numara vermek, düzelttiğimiz
kusurun küçük hâlini tekrar üretirdi: gerçek bir korumaya karşılık gelmeyen bir ad.
Kolaylık için ölçülen şudur — bugün kullanımdaki kimlikler `INV-DOC-1, 2, 3, 4, 4b, 5, 7`;
**`INV-DOC-6` boştur.** Kimliği `#640`'ı indiren verir, doğrulayarak.

⚠**`#640`'ın PR BAŞLIĞI da çakışan kimliği taşıyor.** İniş anında başlık ve test içindeki
kimlik BİRLİKTE değiştirilmeli; yalnız bu bölümü düzeltmek çakışmayı geri getirir.

**Bu düzeltmeyi yakalayacak kol YAZILMADI, kapsam dışı bırakıldı** (iş emri: silahlandırma
yok). Eksen bellidir ve kayıtlıdır: *cetvelde adı geçen test dosyası depoda gerçekten var
mı.* Bu, `INV-CETVEL-YAPI` kapsamına girer ve REC-120 ile ele alınacaktır — §21 gereği
kabul edilen boşluk **sessiz bırakılmaz**, adıyla yazılır.

## C7 — COMMIT AÇIĞI: üretim çalışıyor, kayıt tutulmuyor (2026-08-18 ölçümü)

Companion borcunun büyük kısmı **üretim açığı değil commit açığı**. T088'in ilk dilimi
yapılırken ölçüldü ve iş emrinin şekli değişti.

**Mekanizma.** Companion üretimi `post-commit` kancasında koşar. Yani üretilen artefakt,
kaynağı değiştiren commit'e **yapısal olarak giremez** — sonraki bir commit'le alınması
gerekir. Bunu kimse düzenli yapmıyor; dal değiştirildikçe de çalışma kopyasından silinip
gidiyor. Sonuç: companion diskte **taze**, git'te **bayat**.

**Ölçüm (varsayım değil).** 2026-08-18'de bir worktree'de 23 companion'ın `generated_at`
damgası `2026-06-19 → 2026-08-18` olmuş hâlde, commit'lenmemiş duruyordu.
`git diff --ignore-all-space` ile bakıldı: **23'ünün 23'ünde gerçek içerik farkı**,
yalnız-satır-sonu **sıfır** — yani bu, #589'da kapatılan companion-churn fantomu **değil**.
Aynı ayrışma 2026-08-17'de de görülmüştü (17 dosya "diskte taze, git'te bayat") ama o zaman
**sebebi adlandırılmamıştı**.

**İki ayrı sınıf, ayrı çözüm:**

| sınıf | durum | çözüm |
|---|---|---|
| **(A)** kaynak yeni | companion diskte taze, commit yok | LLM **değil**, sadece commit |
| **(B)** kaynak eski | companion hem git'te hem diskte bayat | gerçek üretim gerekir |

(A) sınıfı, C4/C5'in 7 günlük penceresi içinde olduğu için **henüz ihlal değildir** — ama
commit'lenmezse bir hafta içinde ihlal olarak **olgunlaşır**. Yani borcu ödemekten önce
**doğmasını engellemek** gerekir.

### Kısa vade: periyodik commit-sweep (ALTYAPI şeridi)

Haftalık bir tarama: üretilmiş ama commit'lenmemiş companion varsa tek PR ile alınır.
Periyot **7 günlük pencereyle uyumlu** seçildi; daha seyrek olursa (A) sınıfı ihlale döner.

### Uzun vade: seçenekler ve maliyetleri

| seçenek | kazanç | maliyet / risk |
|---|---|---|
| `pre-commit`'e taşımak | artefakt aynı commit'e girer | commit süresine LLM gecikmesi biner; 2026-08-15'te tam bu sebeple `post-commit`'e taşınmıştı (bloklayan kanca `--no-verify` alışkanlığı doğurdu, T033) |
| `pre-push` | commit hızı korunur, push'ta yakalanır | push süresi uzar; birden çok commit birikirse hangi commit'e ait olduğu belirsizleşir |
| CI'da üretip commit'lemek | yerel makineden bağımsız | CI'ın repoya yazması gerekir (izin + döngü riski); Vercel/Actions maliyeti |
| **sweep** (seçilen) | mevcut akışı hiç bozmaz | gecikmeli; kaçırılırsa borç birikir → bu yüzden periyodu pencereyle eşlendi |

⚠ **Karar notu:** `pre-commit`'e geri dönmek bu depoda **ölçülmüş bir hatayı tekrarlamak**
olur. `post-commit` seçimi bilinçliydi; sorun kancanın yerinde değil, **artefaktın kayda
geçirilmemesinde**. Uzun vade tercihi bot/CI yapılandırmasına dokunduğu için Recep kararıdır.

## Ölçülmüş taban çizgisi (2026-08-17)

Kod dizinlerinde **668** `.md`; **665** eşli, **2** yetim (temizlendi), **1** muaf.
Temizlik sonrası ihlal listesi **BOŞ** — bu yüzden bekçi ratchet/baseline taşımaz,
muafiyetsiz ve tam kapalı kurulmuştur.

## C8 — BİLEREK DONDURULMUŞ companion: karar yazılmazsa hiçbir ölçüm geri getirmez

> Ölçülmüş vaka (2026-08-27, REC-83). Dört şerit toplam ~40 companion'ı **bilerek** bayat
> bıraktı: üreteç o dosyalarda sembol kaybediyordu ve "bayat ama TAM" sürüm, "taze ama EKSİK"
> olana tercih edildi. Sonra I18N bir yapısal çelişki ölçtü.

### C8.1 Çelişki: "bayat" ile "bilerek dondurulmuş" AYNI görünüyor

Bir tazelik/bayatlık aracına bakıldığında ikisi ayırt edilemez. Bir sonraki bayat-süpürmesi,
dokuz dosyalık onarımı **sessizce geri alacaktı** — hem de onarımı yapanın haberi olmadan.

### C8.2 "Dondurulmuş" bir VERİ özelliği değil, bir KARARDIR — depoda izi yoktur

I18N listelere körlemesine güvenmek istemedi ve kendi dedektörünü yazdı: *"geri alınmış dosya,
master blob'u daha eski bir sürümle birebir olan dosyadır."* **48 dosyada koştu → 0 buldu**, oysa
dondurulmuş olduğu bilinen dosyalar o kümedeydi.

Sebebi ölçüldü: `InventoryTable.md`'nin master'daki son commit'i **06-16**; geri alma zaten var
olan içeriğe denk geldiği için git hiçbir şey kaydetmedi. Yani dosya "bugün donduruldu" değil,
"aylardır eski". Karar hiçbir yere yazılmadığı için **hiçbir bağımsız ölçüm onu bulamaz.**

> Bu maddenin en pahalı cümlesi: *ölçülemeyen şey ölçülmediği için değil, ölçülecek yerde
> durmadığı için ölçülemez.* Kararlar veri bırakmaz; yazılmaları gerekir.

### C8.3 İKİ kayıt birden — ve niçin ikisi de tek başına yetmez

| kayıt | tek başına neden yetmez |
|---|---|
| dosya içi işaret | yeniden üretim dosyayı **ezer**, işaret de silinir → kapı kör kalır. Kaybı ölçen şeyi, tam da kaybın olduğu yerde kaybederdik. |
| ayrı liste | liste ile gerçek **ayrışır**. Ölçüldü: dokuz dosyalık listeyi elle kopyalayan **iki** taraf da birer dosyayı yanlış saydı. |

**Çözüm ikisi birden.** `.companion-dondurulmus.json` "hangi dosyalar dondurulmuş" sorusunun
SSOT'u; dosya içindeki işaret onun insan-görünür yankısı:

```
<!-- ORION-DONDURULMUS: gercek-sembol=<N> · kaynak=<sha> · sebep=<slug> · kayit=<REC-nn> -->
```

Kapı (`INV-DOC-5`) **ikisini karşılaştırır**: listede olan bir dosyada işaret yoksa o dosya
yeniden üretilmiştir → KIRMIZI. İşaret frontmatter'ın **içine** değil hemen ardına konur;
frontmatter üretecin makine alanıdır.

#### C8.3.0 `gercek-sembol` ölçütü (v4) — önceki İKİ ölçüt de yanlıştı, TERS yönlerde

| ölçüt | hata | kanıt |
|---|---|---|
| *"sonu `)` ile bitmeyen `AST Pointer:` başlığı gerçektir"* — **filo çapında benimsenmişti** | **şişirir** | Boşlukla yazılmış sözde başlıkları gerçek sayıyor: `::productsByTab useMemo callback`, `::tabOrder.map callback`; ayrıca parantezle **başlayıp** `}` ile biten isimsiz arrow'lar: `::(d) => { return {...} }`. `FeaturedCommercialBlocks` 4 sanıldı, **gerçekte 1**. |
| *"`::` sonrası düz bir tanımlayıcı olsun"* — ilk düzeltmem | **azaltır** | `ErrorBoundary`'nin 8 sembolünün **6'sı** `ErrorBoundary.render` biçiminde sınıf metodu; hepsi eleniyordu (8→2 gibi sahte bir düşüş). |

**⭐ v4:** `::` sonrası **noktalı tanımlayıcı yolu** olmalı — boşluk yok, parantez yok.
Geçerli: `Foo` · `Foo.bar` · `ErrorBoundary.getDerivedStateFromError` · `_x$`.
Geçersiz: `Foo (useEffect callback)` · `productsByTab useMemo callback` · `(d) => {...}`.

**Ek geçerlilik testi (AUTH'un tezi):** tanımlayıcının kök parçası **bugünkü kaynakta** geçiyor mu?
Sözde semboller kaynakta tanımlayıcı olarak geçmez; bayat semboller de geçmez — tek ölçüm hem
sözdeliği hem yanlışlığı ayıklar, sezgisel desen listesine (`_callback|_mapper|…`) gerek kalmaz.

Ölçüldü: bu düzeltme dokuz kaydın **beşini** değiştirdi (`ActivityHeatmap` 4→2, `BulkBar` 3→2,
`AdminThemeToggle` 2→1, `InventoryTable` 4→2, `FeaturedCommercialBlocks` 4→1).

> **Şişmiş eşik kapıyı GEVŞETİR:** gerçek bir kayıpta bile `sembol ≥ eşik` tutabilir. Yani ölçüt
> hatası yalnızca raporu bozmaz, **kapının kendisini kör eder.**

#### C8.3.1 ⚠ ÇÜRÜTÜLMÜŞ KURAL: "tarihsel en yükseğe geri yükle"

Bu madde ilk hâlinde *"değer master'daki değil TARİHSEL EN YÜKSEK sayıdır"* diyordu. Gerekçe
sağlam görünüyordu: geri-alma tabanı "bugünkü süpürmeden önce"ydi ve o taban daha eski turlarda
kaybedilmiş sembolleri taşımıyor — "geri aldım" ≠ "TAM". **Kural yine de yanlıştı ve ölçümle
çürütüldü.** Zinciri adıyla kaydediyorum, çünkü çürütülmüş bir kural da bilgidir:

| kim | ne dedi | sonuç |
|---|---|---|
| I18N | "tarihsel en yükseğe geri yükle" | önerdi, sonra **kendi geri aldı** |
| AUTH | "kuralın bir sınırı var" + `N commit değişmiş` ölçütü | itiraz **haklı**, ölçütü **vekil** olduğu için kendi geri aldı |
| I18N | doğru ölçüt: tarihsel sürümdeki tanımlayıcı **bugünkü kaynakta** var mı? | ölçüt **kabul edildi** |
| ALTYAPI | iki dosyada kendim ölçtüm | geri yüklemeyi **iptal ettim** |

Ölçüm: `InventoryTable`'ın 6 sembollü sürümünde **4** sembol (`sortIndicator`, `TableRow`,
`groupedRows`, `rows`) bugünkü `.tsx`'te **yok**; `FeaturedCommercialBlocks`'un 5 sembollü
sürümünde **2** sembol (`tabButton`, `productCard`) yok. Eski sürüm o günün kaynağını belgeliyor;
kaynak değiştiyse geri yükleme **bugün olmayan şeyleri anlatan** bir dosya üretir.

> **Eksik companion'dan kötüsü YANLIŞ companion'dır:** okuyan, var olduğu söylenen sembolü arar
> ve bulamaz. Eksiklik "az bilgi"dir; yanlışlık "yanlış yön"dür.

**DOĞRU KURAL:** değer, sembolleri **bugünkü kaynakta hâlâ var olan** en yüksek sayıdır. Ölçüt
sembol varlığıdır; *"kaynak o günden beri N commit değişmiş"* ölçütü **vekildir** — sürüklenme
ölçer, yanlışlık ölçmez. Bu ayrım AUTH'un kendi geri alışından çıktı ve §C8 boyunca geçerlidir.

### C8.4 Koordinasyona bağlı güvenliği, ÖLÇÜME bağlı güvenliğe çevir

Liste bir güvenlik şartıysa, listeyi kaçıran herkes hasar üretir — ve bugün iki taraf da yanlış
saydı. I18N'in tersine çevirmesi doğrudur ve **asıl koruma budur**: süpürme, üretim **öncesi** her
dosyanın gerçek sembol sayısını kaydeder, **sonrasında** tekrar ölçer ve **sembol kaybeden her
dosyayı geri alır**. O zaman liste bir **optimizasyon** olur (boşuna üretim yapmamak), güvenlik
şartı olmaktan çıkar; liste eksikse kimse felaket yaşamaz.

İkisi birlikte savunma katmanıdır: liste + işaret **kararı** korur, öncesi/sonrası ölçüm
**içeriği** korur.

### C8.5 Kaydın kaldırılması

Üreteç o dosyada artık sembol kaybetmiyorsa kayıt **silinir** ve companion yeniden üretilir.
Kaydın gereksiz kalması, düzelmiş bir üretecin önünde kalıcı duvar olur — dondurma bir çözüm
değil, üreteç kusurunun faturasıdır.

### C8.6 Bu maddenin kanıtı

`INV-DOC-5` (`src/__tests__/conformance/companion-dondurulmus.test.ts`) altı kollu: **beşi
fixture** üzerinde (sembol düşüşü · işaretin silinmesi · bozuk işaret · liste-işaret ayrışması ·
yanlış-pozitif yokluğu), **biri** gerçek listeye uygulanır.

Gerçek kolun boş geçmediği **sabotajla** kanıtlandı; her turdan sonra sağlam sürüme dönüş
`sha256` ile doğrulandı ve ön koşul olarak `geçen > 0` arandı:

| sabotaj | düşen kol |
|---|---|
| companion'dan işaret silinsin (yeniden üretim benzetimi) | 1 |
| companion'dan bir sembol silinsin | 1 |
| listedeki sayı yükseltilsin (liste ↔ işaret ayrışması) | 1 |

⚠ Fixture kolları **sabotaja gerek bırakmadan** ayırt edicidir: her biri belirli bir ihlal
sınıfını üretip yakalandığını gösterir. Gerçek kol ise ayrı kanıt ister, çünkü liste bir gün
haklı olarak boşalabilir (üreteç düzelirse kayıtlar silinir) ve o hâlde **hiçbir şey ölçmeden
yeşil** görünürdü — ölçüm aracının kendi körlüğü sınıfı (bkz. `fleet-mechanism-standard.md` §9.6).
