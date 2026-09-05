# Üretilmiş Artefakt Standardı

> **Kapsam:** boru hattının ÜRETTİĞİ her dosya — master `.md`'ler, küme
> master'ları, companion `.md`'ler, artefakt manifesti.
> **Niçin ayrı cetvel:** kural companion'a özel değil. Aynı kusur 2026-08-26'da
> hem companion'larda hem master'larda ölçüldü.
> **SSOT:** bu dosya. Kapılar: `src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts`
> (INV-DOC-3, INV-DOC-4) ve yerel `orion doc durum` (Kapı B).

## AXIOM 1 — Üretilen artefakt, depoya girene kadar ÜRETİLMEMİŞ sayılır

Diskte duran bir dosya hiçbir soruya cevap vermez: CI onu göremez, ikiz onu
bilmez, ekip arkadaşı onu bulamaz. "Ürettim" ile "teslim ettim" ayrı fiillerdir.

**Niçin bu aksiyom var (ölçülmüş olay, 2026-08-26):**
PR #821 `.cc_docs.yaml`'a iki küme master'ı tanımladı — 40 satırlık ayar. Üretilen
dosyalar geçici bir worktree'de doğdu, dijital ikize oradan yüklendi, worktree
silinince yerel kopyalar öldü. Depoda hiç görünmediler. **Kusuru bir kapı değil,
kullanıcı fark etti** ("bu yeni master dosyalarını göremedim"). Ölçüldü: dosyalar
depoya ancak `de0b4a52` ile, sorudan **sonra** girdi.

Aynı sınıf companion'larda da yaşıyordu: `post-commit` kancası diske yazar,
C4/C5 kapıları `git log` okur; arada kalan dosyayı hiçbir şey saymaz.

## AXIOM 2 — Tarif ile ürün AYNI PR'da yolculuk eder

Bir PR artefaktın **nasıl üretileceğini** değiştiriyorsa (`.cc_docs.yaml` kapsamı,
derleyici davranışı, kaynak dosyalar), o PR **üretilmiş hâlini de taşımak
zorundadır**.

### ⭐İŞ AKIŞI BEDELİ — AÇIKÇA KABUL EDİLDİ

Bu kural bir bedel getirir ve bedel **yazılı olmalıdır**:

> `docs/standards/`, `docs/reference/`, `docs/audits/`, `docs/plans/` veya
> `supabase/functions/` altına dokunan **her PR**, aynı PR'da `orion doc build`
> çıktısını da taşır.

Pratikte iki komut:

```
orion doc build
git add docs/*_master.md docs/artefakt_manifest.json
```

**Niçin bedeli yazıyoruz:** yazılmayan bedel, kırmızıyı atlatma alışkanlığı
doğurur. Bu depo o filmi gördü — rastgele patlayan `pre-commit`, tüm filoda
`--no-verify` alışkanlığı doğurdu (T033). Bu yüzden **her kırmızı mesaj,
koşulacak tam komutu basar**: ne yapacağını söylemeyen kapı atlatılmayı davet
eder.

## AXIOM 3 — Üretilen dosya ELLE düzenlenmez

Üretilen artefakt bir **çıktıdır**, kaynak değildir. Elle yapılan düzeltme bir
sonraki derlemede sessizce silinir ve arada geçen sürede ikiz yanlış bilgiyi
doğru sanar.

Düzeltme kaynağa yapılır, sonra yeniden üretilir.

Kapı A bu ihlali `icerik_sha256` ile yakalar (aşağıda).

## AXIOM 4 — Ölçülemedi, GEÇTİ demek değildir

Manifest yoksa, git geçmişi sığsa, kaynak kümesi boşsa — kapı **kırmızı** yanar.
"Ölçemedim, o hâlde geçtim" (fail-open) bu depoda yasaktır: ölçülemeyen bir kapı,
geçen bir kapı değil **YOK olan** bir kapıdır.

Bu, boş listeyi "sorun yok" diye okumayı da kapsar. Boş kaynak kümesi bir ölçüm
değil, ölçümün **yokluğudur**.

## AXIOM 5 — Worktree yasak değildir; GÖRÜNMEZLİĞİ yasaktır

Worktree normal iş akışımızdır (çok-şeritli çalışmanın izolasyon aracı). T020
kazasının kökü worktree kullanmak değil, **çıktının o ağaçta kalıp kimseye
görünmeden ölmesiydi**.

Bu yüzden:
- Manifest, derlemenin hangi ağaçta yapıldığını (`calisma_agaci`) kaydeder.
- Worktree'de koşan derleme, sonunda **açık uyarı** basar: *"çıktılar &lt;yol&gt;
  içine yazıldı; commit etmezsen ağaç silindiğinde bu dosyalar da ölür."*
- Depo içi kapılar (A ve C) PR üzerinde CI'da koşar; ölçtükleri şey **birleşme
  hedefinin geçmişidir** ve koşumun hangi ağaçta yapıldığından bağımsızdır.

⭐**Bir ağacın emekliye ayrılabilir olduğunu ölçen ölçüt ayrı bir cetvelde yazılıdır:**
`fleet-mechanism-standard.md` **§30** — kayıp ölçütü `rev-list --count origin/<dal>..HEAD
== 0`'dır; dal adının uzakta bulunması (`ls-remote`) işin yedeklendiğini **söylemez**.

## AXIOM 6 — Yıkıcı adım, onarıcı adımın yapılabilirliği ölçülmeden koşmaz

Senkron **önce siler sonra yükler**. Yükleme kaynağı yoksa defter boşalır.

2026-08-26'da tam bu oldu: çalışma ağacı koşum ortasında yok oldu, silme adımı
83 kaynağı sildi, yükleme adımı hiçbir dosya bulamadı, defter 96 → 13'e düştü.

Tetikleyici (ağacın silinmesi) tesadüfiydi; **kusur sıradaydı**. Aynı sonuç disk
dolsa, izin düşse, yol yanlış verilse de olurdu. Bu yüzden kapı "worktree var mı"
diye değil, **"yüklenecek her şey ELDE mi"** diye sorar.

---

## Kapılar — üç ayrı soru

| Kapı | Nerede | Soru | Kimlik |
|---|---|---|---|
| **A — Tazelik** | venthub CI | Depodaki artefakt manifestteki özetle eşleşiyor mu? | INV-DOC-4 |
| **B — Ayrışma** | yerel `pre-push` | Diskte üretilmiş ama depoya girmemiş artefakt var mı? | `orion doc durum` |
| **C — Tarif↔Ürün** | venthub CI | yaml'ın ilan ettiği artefakt depoda var mı? | INV-DOC-3 |

### ⭐Niçin B yerelde, A ve C CI'da

**CI geliştiricinin diskini GÖREMEZ.** "Üretildi ama commit'lenmedi" durumu tanım
gereği yalnız yerel makinede vardır — PR'a giren şey zaten commit'lenmiştir. O
soruyu CI'da sormak, hiç kırmızı yanmayacak bir kapı kurmak olurdu; yani
dekoratif kapı.

Tersi de doğru: "depodaki artefakt kaynağıyla tutarlı mı" sorusunu yerelde sormak
yetmez, çünkü kimse koşmayı unutabilir. O yüzden A ve C zorunlu CI kapısıdır.

### ⭐Niçin B `pre-push`, `pre-commit` değil

Companion üretimi `post-commit`te **asenkrondur**. `pre-commit`te sormak, henüz
üretilmemiş dosyayı "eksik" sayar → yanlış-kırmızı. `pre-push` anında üretim
çoktan oturmuştur.

Kurulum: `orion doc install-push-hook`. Kurulum `core.hooksPath`'e **saygı duyar**
— ayar varsa git `.git/hooks`'a hiç bakmaz ve oraya yazılan kanca hiç koşmaz;
kapı var sanılır, yoktur.

### Kapı A'nın iki ayağı ve niçin ikisi de gerekli

1. **İçerik özeti** (`icerik_sha256`) — ürün elle bozuldu mu?
2. **Kaynak değişimi** — kaynak, derlemeden sonra değişti mi?

Ata-soy/kaynak-değişimi ayağı, kaynak **hiç değişmeden** ürünün bozulduğu vakayı
göremez. Özet ayağı ucuzdur ve o körü kapatır. Birini diğerinin yerine koymak
kör nokta bırakır.

### ⭐Satır sonu SİNYAL DEĞİL GÜRÜLTÜDÜR

Üretim Windows'ta olur ve metin modu yazımı dosyayı CRLF yapar; `core.autocrlf=true`
commit'te LF'e çevirir; CI Linux'ta LF iner.

Ham bayt özeti karşılaştırılsaydı **kapı daha kurulmadan kalıcı kırmızı olurdu** —
yani artefaktın içeriğini değil **taşıma katmanını** ölçerdi. Kalıcı kırmızı kapı
görmezden gelinir.

Bu yüzden **her iki uç da** (orion üretici tarafı ve venthub kapı tarafı)
özet almadan önce CRLF → LF normalizasyonu yapar. İki uç aynı soruyu sormazsa
karşılaştırma anlamsızdır.

Normalizasyon kapıyı zayıflatmaz: tek karakterlik gerçek fark hâlâ özeti
değiştirir.

### ⭐ÇİFT-CR FANTOMU — `checkout` kirliliği TEMİZLEMEZ, ÜRETİR

**Ölçülmüş vaka (2026-08-30, `.archive/legacy_superpowers_artifacts/`, 40 dosya).**
Bir taban tazelemesi bu dosyalar yüzünden bloklandı. `git checkout -- <yol>` koşuldu:
33 dosya temizlendi, **7'si inatla kirli kaldı**. Ardından `git stash push` denendi —
o da temizlemedi.

**Mekanizma.** Bu blob'lar **indekste zaten CRLF** tutuyor (`git ls-files --eol` →
`i/crlf`), `.gitattributes` ise `text eol=crlf` diyor. Checkout, LF→CRLF dönüşümünü
depodaki `\r\n`'ye **bir kez daha** uyguluyor ve çalışma kopyasında `\r\r\n` oluşuyor.
Yani:

> **`git checkout` ve `git stash` bu dosyalarda kirliliği temizlemez — ÜRETİR.**
> İkisi de checkout yapar; her deneme fantomu yeniden doğurur. Döngü kendiliğinden
> kapanmaz.

Bu, stash yığınındaki onlarca *"eol fantomu / .archive churn"* kaydının tek ortak
sebebidir: her şerit aynı duvara çarpıp parkediyor, kimse mekanizmayı yazmıyor.

**Ayırt edici ölçütler** (sırayla, ucuzdan pahalıya):

| soru | ölçüt | fantom cevabı |
|---|---|---|
| içerik farkı var mı | `git diff -w --numstat` | **boş** (0 satır) |
| ham fark ne | `git diff --numstat` | simetrik (+N −N) |
| indeks/çalışma satır sonu | `git ls-files --eol` | `i/crlf` + `attr/text eol=crlf` |
| çalışma kopyasında çift CR | `grep -c $'\r\r'` | **> 0** |

**REÇETE — tek adımda, araya başka git komutu sokmadan:**

```sh
git -C <agac> checkout origin/master -- <yol>/ && git -C <agac> commit -m "..."
```

⚠ **`&&` şart:** araya giren bir `git merge` denemesi **indeksi geri alır** ve
`checkout`la sahnelenen düzeltme sessizce kaybolur (ölçüldü: commit *"no changes added
to commit"* dedi, ağaç yine 40 kirli döndü). İki ayrı çağrı = iki ayrı sonuç.

`origin/master`'ın sürümü alınır çünkü master bu blob'ları **renormalize etmiştir**
(ölçüldü: 7/7 blob farklı). Bu bir `--theirs` refleksi **değildir** — dosya sınıfı
önce doğrulanır: içerik farkı `-w` ile sıfır olduğu için kaybedilecek yazılmış içerik
yoktur. Kaynak dosyada aynı refleks bu depoda **104 satır cetvel kaybettirdi**.

---

## ⭐ÖLÇÜM ARACININ KENDİSİ ÖLÇÜLÜR

Bir kapı yanlış ölçerse kırmızı verir ve fark edilir. **Ölçüm aracı yanlış ölçerse
YEŞİL verir** — ve hüküm, ölçülmemiş bir şey üzerine kurulur. Bu depoda aynı tuzağa
2026-08-30'da tek oturumda **iki kez**, filoda o hafta **üç kez** düşüldü.

### Ölçülmüş vaka — MSYS yol dönüşümü

Git Bash, argümanda `/` gördüğünde onu Windows yoluna çevirir. `git rev-parse
origin/master:docs/x.md` çağrısı kabuktan geçerken
`origin\master;docs\x.md`'ye dönüşür:

1. **Birinci düşüş — sahte FARKLI.** Komut hata verdi, çıktı olarak dönüşmüş dizeyi
   bastı; karşılaştırma "7/7 blob FARKLI" dedi. Hüküm tersine dönmüştü.
2. **İkinci düşüş — sahte AYNI (daha tehlikeli).** `MSYS_NO_PATHCONV=1` ile dönüşüm
   kapatıldı; bu sefer `-C /c/tmp/...` **çözülemedi**, iki komut da hata verip **boş
   dize** döndürdü ve `boş == boş` karşılaştırması **"AYNI"** çıktı. Yani düzeltme
   girişimi, hatayı *yeşile* çevirdi.

### Kural

- **Sıfır, eşitlik ve boş küme önce ARAÇ KUSURU şüphesiyle karşılanır.** "Fark yok"
  ile "ölçemedim" aynı görünür; ayıran şey ölçümün kendisine konan kontroldür.
- **Karşılaştırmadan önce iki tarafın da DOLU olduğu doğrulanır.** Boş==boş bir hüküm
  değildir. (Aynı sınıf: boş evrende koşan bir kapı — `grep` 0 döndürdüğünde önce
  "aranan şey bu ağaçta var mıydı" sorulur.)
- **Yol/ref taşıyan git çağrıları kabuktan geçirilmez:** `node execFileSync` ile
  argüman dizisi olarak verilir. Kabuk yorumu yok, dönüşüm yok.
- **Çelişki, aracın itirafıdır.** Blob kimliği "aynı" derken satır sayımı 0 diyorsa,
  ikisinden biri değil **ölçüm** bozuktur; çelişkiye güvenilir, tarafa değil.

```js
// Yol/ref tasiyan olcum — kabuk YOK
const { execFileSync } = require('child_process')
const sha = (ref, yol) =>
  execFileSync('git', ['-C', AGAC, 'rev-parse', `${ref}:${yol}`], { encoding: 'utf8' }).trim()
```

---

## Kapı tasarımı — bu işte öğrenilen üç ders

### 1. Bir kapı ÜÇ ayrı soru sorar

| Soru | Aleti |
|---|---|
| Fonksiyon doğru mu? | birim test |
| DOĞRU YERDE mi? | AST — yıkıcı çağrıya göre konum |
| ULAŞILABİLİR mi? | AST — saran koşul sabit değil ve ölçüme bakıyor |

Üçüncüsü sabotajla doğdu: `if _eksikler:` → `if False:` yapıldığında yükseltme
kaynakta duruyordu, sırası doğruydu, ve AST kapısı **yeşil yandı**. Kapı "yazılı
mı" diye bakıyordu, "koşulur mu" diye değil.

### 2. Karar vermek ile kararı DIŞARI VEREBİLMEK ayrı sorulardır

`orion doc durum` komutunun FAIL dalında `sys` import edilmemişti: kapı doğru
ölçüyor, doğru karar veriyor, ve tam kırmızı yanacağı anda çöküyordu. Test yine
de yeşildi çünkü `CliRunner` **çöken bir komutu da** `exit_code=1` sayar.

Çıkış kodu da kapının bir parçasıdır; testi `SystemExit`'i **adıyla** sormalıdır.

### 3. Kapının en sık karşılaşacağı durum, testin en az temsil ettiği durum olabilir

`git status --porcelain` çıktısına `.strip()` uygulamak **ilk satırın baştaki
boşluğunu** yiyor; değiştirilmiş-izlenen dosya (" M yol") bir karakter kayıp
hiçbir şeyle eşleşmiyordu. Bütün birim testler yeşildi çünkü hepsi **izlenmeyen**
dosya kullanıyordu ("?? yol" boşlukla başlamaz).

Sentetik girdi gerçek çıktıyı taklit etmiyorsa test yeşil yalan söyler.

### ⭐Yeşil kalan sabotaj "kapı kör" demek DEĞİLDİR

Sebebi **ayrıca** ölçülür. 2026-08-26'da üç yeşil sabotajın:
- ikisi **etkisizdi** (biri ölü koddu ve kaldırıldı),
- biri **testin kendi körlüğüydü** (yukarıdaki `CliRunner` vakası).

Ölü kodu "önlem" diye bırakmak, okuyana **var olmayan bir koruma** vaat eder.

### ⭐Karşı yön: yeşil kalan sabotaj GERÇEKTEN körlükse, sebebi genellikle SINIRDIR

**Ölçülmüş vaka (2026-08-31, `catalog-integrity-gate`).** Kapının hızı şüpheliydi
(0,995 sn) ve sabotaj ritüeli koşuldu. Sonuç: kapı **boş değildi** — karar mantığını
(taban farkı, çıkış kodları) fikstürle gerçekten ölçüyordu. Ama **bir kolu kördü** ve
körlüğün sebebi mantık değil **dilim sınırıydı**.

Kol, betikteki bir kuralın gövdesini `id: '<kural>'` başlangıcından **elle yazılmış başka
bir kural adına** kadar kesiyordu. Araya üçüncü bir kural girmişti: blok **3848 bayt ve
İKİ kural** içeriyordu, aranan dize orada **iki kez** geçiyordu — biri komşu kuraldan.
İki sabotaj da yeşil geçti:

| sabotaj | sonuç | niçin |
|---|---|---|
| alt sorguya `and false` eklendi (sayım daima 0) | ⚠**yeşil** | dize yerinde; ölçüt **varlık** ölçüyordu, **anlam** değil |
| alt sorgu tamamen silindi (`0::int as cocuk`) | ⚠**yeşil** | dize **komşu kuraldan** geliyordu |

İkinci hâl daha kötüsüdür: o kol, komşu kural var olduğu sürece **kırmızı olamazdı**.
Sabotajın bozduğu şey ise kozmetik değildi — kural "çocuğu olan aile" ile "ölü kabuk"u
ayırt etmeyi bırakıyordu; cetvelin kendi notuna göre bu ayrım 2026-08-23'te **yanlış bir
silme kararı üretmiş ve son anda durdurulmuştu.**

**Üç kural çıktı:**

1. **Kaynak tarayan bir kolun bloğu HESAPLANIR, elle yazılmaz.** Sınır "sıradaki kural"
   olmalı; elle yazılmış sınır, araya yeni bir kural eklendiği anda sessizce bozulur ve
   bozulduğunu hiçbir şey söylemez.
2. **Ölçüt VARLIK değil ŞEKİL olmalı.** `toContain('<dize>')` bir ifadenin *bulunduğunu*
   söyler, *ne yaptığını* söylemez. İfadenin tam şekli sabitlenirse `and false` sınıfı da
   yakalanır.
3. **Yasağı koyan kol, kendi metnine takılmamalı.** Bu vakada yasak iki kez kendi
   dosyasını yakaladı: önce vacuous-guard örneğine, sonra açıklama yorumuna. Örnek
   parçalı kurulur, prose'a düz yazılmaz.

⚠ **Adıyla kalan sınır:** kaynak taraması SQL **semantiğini** hiçbir şekilde doğrulamaz.
Kuralların gerçek davranışı yalnız **canlı DB'ye bakan CI işi** tarafından ölçülür; hızlı
yol (fikstür) bilerek yalnız karar mantığını kapsar. Bu bir eksik değil, **kapsam
sınırıdır** — ama yazılı olmadıkça "kapı bu kuralı ölçüyor" sanılır.

---

## İhlal hâlinde ne yapılır

| Kırmızı | Anlamı | Çözüm |
|---|---|---|
| INV-DOC-3 | yaml ürünü ilan ediyor, ürün depoda yok | `orion doc build` + `git add <artefaktlar>` |
| INV-DOC-4 özet uyuşmuyor | ürün elle bozuldu **ya da** manifest bayat | kaynağı düzelt → `orion doc build` |
| INV-DOC-4 manifest yok | ölçüm yapılamıyor | `orion doc build` + `git add docs/artefakt_manifest.json` |
| Kapı B (yerel) | üretildi, commit'lenmedi | kırmızının bastığı `git add` komutu |

**Tabanı yükselterek susturmak YASAKTIR.** Kırmızıyı susturmak için eşik
büyütmek, kapıyı sökmektir.

---

İlgili: `companion-doc-standard.md` (C4/C5 — eksik ve bayat companion) ·
`measurement-discipline-standard.md` · `collaboration-protocol.md` ·
tasarım kaydı: orion `docs/t021-artefakt-tazelik-kapisi-tasarim.md` (PR #42)

## AXIOM 7 — Kaynak ile artefakt AYNI dosya olabilir; o zaman build TEK TURDA kapanmaz

**Ölçüldü 2026-08-28 (ALTYAPI, REC-86 dalı).** `docs/system_tree.md` hem
`.cc_docs.yaml`'ın ürettiği bir **artefakt**, hem de `kayitlar_master.md`'nin
derlendiği **kaynak** kümesinin bir üyesi. Tek geçişli build şu sırayı izler:

1. `kayitlar_master.md` derlenir — o an diskteki (yani **eski**) `system_tree.md`
   okunur ve sha'sı manifeste yazılır,
2. `system_tree.md` yeniden üretilir — sha'sı **değişir**.

Sonuç: manifest yazıldığı anda `kayitlar_master`'ın kaynak kaydı bayattır ve
INV-DOC-4b kırmızı yanar. Bu bir hata değil, **çift rolün kaçınılmaz sonucudur**.

**Kural:** çift rollü bir dosya varsa `doc build` **iki tur** koşulur ve
**aralarında commit edilir** (kapı HEAD'i okur, diski değil):

```
orion doc build --force-sync && git add docs/ && git commit
orion doc build --force-sync && git add docs/ && git commit
```

⭐**Bu iki turu ELLE hatırlamak zorunda kalmayın — taban tazelerken tek komut vardır:**

```
node scripts/hijyen/taban-tazele.cjs --agac <ağaç>
```

`origin/master` merge'ini, ilan edilmiş artefaktlardaki çakışmanın çözümünü, **AXIOM 7'nin
iki turunu** ve INV-DOC-4b'yi aynı komutta koşar. Gerekçesi ve reddedilen alternatifi
(`.gitattributes merge=ours` — INV-DOC-4b'nin damga kör noktası yüzünden **sessiz** geri alma
üretiyor) `fleet-mechanism-standard.md §22`'de ölçümüyle yazılıdır. Kural: **merge sessizce
çözülüyorsa, ikinci turu hatırlatan şey bir insan değil bir mekanizma olmalıdır.**

**Yakınsama ölçülmüştür, varsayılmamıştır:** ikinci turda `system_tree.md`
değişmedi (`git diff --stat` boş) — yani damga alanı her koşumda yeniden
yazılmıyor, döngü ikinci turda duruyor. Üçüncü tur GEREKMEZ. Yeni bir çift
rollü dosya eklenirse bu ölçüm **tekrarlanır**; "iki tur yeter" bu depodaki
bugünkü kümenin ölçümüdür, evrensel bir yasa değildir.

### Bu aksiyomun doğurduğu iki ölçüm kuralı

**(a) Ölçümün ZAMANI ölçümün parçasıdır.** Aynı gün manifesti "855 kaynak
kaydı, uyuşmaz 0" diye ölçüp temiz ilan ettim; ölçüm **commit'ten önce**
koştuğu için `system_tree.md`'nin yeni hali diskteydi ama HEAD'de yoktu.
Kapı HEAD'i okur. Bir kapının ölçütünü taklit eden her ölçüm, kapının
okuduğu **aynı anı** okumalıdır.

**(b) `generated_at`'in geriye gitmesi tek başına regresyon kanıtı DEĞİLDİR.**
Aynı imza iki zıt sebepten doğar: bayat tabanda build (regresyon) ya da
dalda kalmış, master'a hiç inmemiş bir companion halinin düzeltilmesi.
Ayırt eden ölçüt imza değil, **kaynağın üç hâli**: dosyanın `HEAD`,
`origin/master` ve disk değeri. Üçü de yeni değeri söylüyorsa geri gidiş
**düzeltmedir**.

### Manifestteki iki özet TÜRÜ karıştırılmaz

`artefakt_manifest.json` iki farklı özet tutar ve karşılaştırmadan önce
hangisine bakıldığı **doğrulanır**:

| alan | tür | uzunluk |
|---|---|---|
| `artefaktlar[].icerik_sha256` | SHA-256 (CRLF→LF normalize, HEAD blob'undan) | 64 hex |
| `artefaktlar[].kaynak.dosyalar[yol]` | **git blob SHA-1** | 40 hex |

İkisini aynı sütunda karşılaştırmak, hiçbiri tutmayan sahte bir bilmece
üretir — bu depoda bir gün kaybettirdi. **Bedava ayırt edici: hex uzunluğu.**

---

## AXIOM 8 — Üretecin KAPSAM SÜZGECİ isim tabanlıysa, her ekleme bir KESİNTİDİR

`.cc_docs.yaml → skip_dirs` bir "yok sayılacaklar listesi" gibi okunuyor. Değil.
`corpus_callosum/cli/docs_tree.py:57` süzgeci `d not in _all_skip` biçiminde uygular:
**isim tabanlı, her derinlikte, kök-sabitleme yok.** Yani listeye yazılan her ad, aynı
adı taşıyan **gerçek kaynak dizinini de** ağaçtan siler. Ekleme bedavaya benziyor;
değil.

### Ölçülmüş vaka (REC-84 · 2026-08-30)

`docs/system_tree.md`'de kök `cache/` ve `.agents/` görünüyordu. Teşhis "skip_dirs
kaçağı" oldu ve ikisi de listeye eklendi. Sızıntı dizinleri **fiilen yaratılıp** üç kol
tek tek koşulduğunda hüküm çürüdü:

| `skip_dirs` | `.agents` ağaçta | kök `cache/` | `src/lib/cache/tags.ts` |
|---|---|---|---|
| taban (ikisi de yok) | 0 | **1** | 1 |
| `+ .agents` | 0 | 1 | 1 |
| `+ .agents, cache` | 0 | 0 | **0** ⚠ |

İki bağımsız sonuç çıktı:

1. **`.agents` ETKİSİZDİ.** Yürüteç nokta-dizinleri zaten atlıyor (`docs_tree.py:56`,
   `not d.startswith('.')`). Listede olsun olmasın sonuç 0. Yani "kök sebebi kapattık"
   denen değişikliğin yarısı hiçbir şey yapmıyordu — ve **yeşil çıktı bunu gizledi**,
   çünkü çıktı zaten temizdi.
2. **`cache` ZARARLIYDI.** Kozmetik bir kök satırını sildi, karşılığında companion'ı olan
   gerçek bir modülü (`src/lib/cache/tags.ts`) ikizin kaynağından **yok etti**.
   `system_tree.md`, `kayitlar_master.md`'nin kaynağıdır: kayıp doğrudan dijital ikize
   geçer, hiçbir kapı kırmızı vermez.

### Kural

- **Bir adı `skip_dirs`'e eklemeden önce, o adı taşıyan BAŞKA dizin var mı diye ölçülür.**
  Ölçüt: `find <repo> -type d -name '<ad>'`. Birden fazla eşleşme varsa ekleme yapılmaz.
- **Süzgeç değişikliği A/B ile kanıtlanır:** sızıntı dizini fiilen yaratılır, kol tek
  değişkenle koşulur, negatif kontrol alınır. "Çıktı temiz" tek başına kanıt değildir —
  çıktının sızıntı dizini yokken de temiz olacağını unutma (boş evren, sahte yeşil).
- **Kök-sabitli sızıntının bu depoda karşılığı YOKTUR.** `source_dirs: [src, .]` kökü de
  tarar; isim tabanlı listeyle kökü hedefleyip alt ağacı korumak imkânsızdır. Gerçek
  çözüm üreteç tarafında kök-sabitli girdi desteğidir (`/cache` gibi) — **ORION kalemi**,
  bu depoda kapatılamaz. O gelene kadar kök artığı KABUL EDİLİR: kozmetik bir satır,
  gerçek bir modülün kaybından ucuzdur.

**Genel ders:** bir süzgece ekleme yapmak, "gürültüyü azaltmak" değil **görüş alanını
daraltmak**tır. Daraltmanın neyi kestiğini ölçmeden yapılan her ekleme, kaybı sessiz
kılan bir kapıdır.

---

## AXIOM 9 — İLAN EDİLMEMİŞ artefaktın tazeliği ÖLÇÜLEMEZ; ölçülemeyen bayatlık "taze" değildir

### Ölçülmüş boşluk (2026-08-31, REC-84)

Kapı A tek yönü soruyordu: *"ilan edilen her artefakt depoda **İZLENEN** bir dosya mı?"*
Ters yönü **hiç kimse sormuyordu**: *"depodaki üretilmiş bir dosya **ilan edilmiş** mi?"*

Sonuç sessiz bir kör nokta. `docs/artefakt_manifest.json` **üretilmiş** bir dosyadır
(`orion doc build` yazar) ve yalnız **kendi derlediği** dört artefaktı sayar. Başka
üreteçlerin ürettiği artefaktlar manifestte hiç görünmez — görünmedikleri için
bayatlıkları **ölçülemez**. AXIOM 4 gereği bu "taze" sayılamaz.

Ölçüm **üç** gerçek kalem buldu:

| dosya | üreteç | damga |
|---|---|---|
| `docs/database_schema_master.md` | `orion doc schema` | `compiled_at` |
| `docs/system_tree.md` | `orion doc tree` | `compiled_at` + "otonom olarak derlenmiştir" |
| `docs/venthub_skills_master.md` | `scripts/compile_skills.py` | "Generated automatically from" |

⚠ `docs/system_tree.md` ayrıca **AXIOM 7 vakası**: manifest onu `kaynak.dosyalar` içinde
**KAYNAK** olarak tanıyor, **ÜRÜN** olarak tanımıyor. Çift rollü dosya ilan kapsamında
**yarım** görünüyor.

### "Manifeste elle ekle" ÇÖZÜM DEĞİLDİR

Manifest üretilmiş bir dosyadır: elle satır eklemek **AXIOM 3** ihlalidir ve bir sonraki
derlemede silinir. Gerçek çözüm üreteç tarafındadır (ilan mekanizmasının `orion doc build`
hattı dışındaki artefaktları da kapsaması) — **ORION kalemi**, bu depoda kapatılamaz.

### Bu depoda kapatılabilen: BOŞLUĞU GÖRÜNÜR ve SINIRLI kılmak

- **Kapı:** `src/__tests__/conformance/uretilmis-artefakt-ilan-kapsami.test.ts` (INV-DOC-7).
  Üretim damgası taşıyan her izlenen `docs/**.md` ya manifestte ilan edilmiş olacak ya da
  gerekçeli bir istisna kaydında duracak.
- **Kayıt:** `docs/artefakt-ilan-istisnalari.json` — her kalem için üreteç, damga, **niçin
  ilan edilemiyor**, hangi tarafta kapanacak, sahibi ve iş kaydı. Alanlar zorunlu; gerekçe
  40 karakterden kısa olamaz — **muafiyet gerekçesiz verilmez.**
- Kayıt **bayatlamaz**: her satır HEAD'de var olan ve **hâlâ damgalı** bir dosyayı
  göstermek zorunda. Ayrıca bir dosya hem ilan edilmiş hem istisna **olamaz** (çelişki kolu).
- Böylece boşluk **kapanmaz ama SESSİZ BÜYÜMEZ**: yeni bir ilan-dışı artefakt kırmızı verir.

### Ölçüt niçin DAMGA, niçin BAŞLIK BÖLGESİNDE — iki ölçülmüş yanlış-pozitif

- **İsim-tabanlı olsaydı** (AXIOM 8): `docs/design_system_config.md` elle tutulan bir
  aynadır (üreteci **yok**), isimden "üretilmiş" sanılırdı.
- **Gövdede aransaydı**: `docs/standards/product-schema-standard.md` yanlış-pozitif verdi —
  orada *"otomatik üretilmiş"* ifadesi **ürün açıklamalarını** anlatıyor, dosyanın kendisini
  değil. Bu yüzden damga yalnız ilk 40 satırda aranır ve ifadeler **üretece özgüdür**.

⚠ **ADIYLA ARTIK RİSK:** damgasız üretilen bir dosya bu kapıdan **görünmez**. Risk
teorik değil, **örneği var**: `docs/venthub_hvac_master.md` ilan edilmiş olduğu hâlde
hiçbir damga taşımıyor — ilan edilmemiş olsaydı kapı onu **yakalamazdı**. İsim ölçütüne
dönmek bu riski azaltmaz, yukarıdaki iki yanlış-pozitifi geri getirir.


## AXIOM 10 — Damgasız ve kimliksiz ARAÇ ÖNBELLEĞİ, iki kapının da evreni DIŞINDADIR; kendi kapısı olmadan "yeşil" sayılamaz

**Ölçülmüş vaka (2026-09-01, REC-102):** `supabase/.temp` altında **8 takipli** dosya.
`.gitignore`'da hiç kural yoktu; `cli-latest` geçmişte **10 kez** değişmişti; dört dosya
canlı altyapı sürümünü (postgres/gotrue/rest/storage) public repoda ilan ediyordu.
Kimlik bilgisi yoktu. Ve **iki kapı da yeşildi.**

### Niçin iki kapı da görmedi — evren sorusu

- **INV-DOC-7** ölçütü **damgadır** (AXIOM 8: isim değil damga). Araç önbelleği damga
  taşımaz. Ölçüldü: sekiz dosyanın hiçbirinde yok.
- **INV-MUTLAK-YOL-1** ölçütü **kimlik yoludur**. Ölçüldü: sıfır.

Bu bir ölçüt kusuru değildir; iki ölçüt de kendi sorusuna doğru cevap veriyordu. Kusur,
**bu sınıfın hiçbir ölçütün sorusuna girmemesiydi.** "Kapı yeşil" cümlesi yalnız kapının
evreni içinde anlamlıdır; evrenin dışındaki bir dosya için o cümle **boştur**.

### Hüküm — yeni sınıf, yeni soru; mevcut kola sıkıştırılmaz

Damgasız + kimliksiz araç önbelleği **üçüncü bir sınıftır** ve kendi değişmezini alır:
**INV-ARAC-ONBELLEGI-1** (`uretilmis-artefakt-ilan-kapsami.test.ts`). Onu INV-MUTLAK-YOL-1'e
eklemek cazipti — aynı mekanik (`git rm --cached` + nüks kolu) — ama o kapının adı
"kimlik sızıntısı" der; kimlik yolu sıfır olan bir dosyayı oraya koymak, **kapının adı
ile ölçtüğü şeyi ayırmak** olurdu (bkz. `fleet-mechanism-standard.md` §23 "gösterge
doğruydu, adı yanlıştı"). Sınıf doğruyken ev yanlış olabilir; ikisi ayrı ayrı ölçülür.

### Hüküm — "kural yazıldı" ile "koruma çalışıyor" ayrı iddialardır

`.pyc` vakasında `.gitignore` kuralı **zaten vardı** (satır 83) ve dokuz dosyayı hiç
korumamıştı: dosyalar kural konmadan **önce** commit edilmişti ve git yalnız **takipsiz**
dosyayı yok sayar. İlan dosyası yine de "kural eklensin" öneriyordu — hiçbir kapı
tarafından okunmadığı için o yanlış sessizce yaşadı.

Bu yüzden INV-ARAC-ONBELLEGI-1 kuralı **metinde aramaz**, `git check-ignore` ile
**çalıştırır**: kural yanlış dizinde, yanlış biçimde ya da yorum satırında kalmışsa metin
araması yeşil, bu ölçüm kırmızı verir. Nüks iki taraftan kapanır — index tarafını kol,
takipsiz tarafı çalıştığı ölçülmüş `.gitignore` tutar.

### Hüküm — tekil describe'ın KENDİ boş-evren koruması olur

"Takipli önbellek YOK" iddiası, `git ls-files` bir sebeple boş dönerse de yeşildir — kapı
kırılınca "geçti" der. INV-MUTLAK-YOL-1'de bu tehlike yoktu, çünkü **kardeş kollar**
("ölü muafiyet", "mandal geri kaçmaz") boş evrende düşer (ölçüldü). Kardeşi olmayan her
"X yoktur" kolu kendi vacuous-guard'ını taşır (INV-DOC-7 ile aynı desen: *"boş evrende
koşan kapı ölçüm değildir"*).

### Bu aksiyomun ölçüm disiplini

Bu sınıfı kapatmadan önce **ölçülmesi zorunlu** olan şey: **CI bu dosyaları okuyor mu?**
Burada project-ref `secrets`'ten geliyor ve prod migration `psql` + `SUPABASE_DB_URL`
kullanıyordu — yani silmek güvenliydi. **Aynı ölçüm ters çıksaydı** (ör. `project-ref`
migration hattında okunuyor olsaydı) bu "temizlik", prod'a yazan hattı sessizce kırardı.
Silmenin bedeli, kimin okuduğuna bağlıdır; okuyanı ölçmeden silinmez (AXIOM 6'nın
akrabası: yıkıcı adım, onarıcı adımın yapılabilirliği ölçülmeden koşmaz).

---

## AXIOM 11 — KAPIYI DONDURMAK, ÖLÇÜMÜ SUSTURMAK DEĞİLDİR (REC-132 · D1)

### Karar ve ölçülmüş gerekçe

Üretilmiş toplamalar (`docs/*_master.md` + `artefakt_manifest.json`) her şeridin PR'ında yol
alıyordu. Ölçüm (2026-09-03/04, tek şerit): **yedi** taban tazelemesi, her biri tam bir CI
koşumu. İki PR'da (`#962`, `#965`) kapılar **hiç doğmadı**, çünkü çakışık PR'ın birleşme ref'i
üretilemiyor — yani bu sınıf yalnız zaman yakmıyor, **sahte yeşil** de üretiyor. Aynı gün
`#966` (URUN) ve `#967` (ALTYAPI) de aynı sebeple DIRTY'ye düştü.

**Recep/OPS kararı (2026-09-04): üretim DONDURULUR.** `INV-DOC-4b`'nin parity kolu
**bloklamaktan SAYIMA** döner.

### HÜKÜM

1. **Eşik uzatılmaz, kapı silinmez.** Ölçüm her koşuda yapılır ve sayı basılır; yalnız çıkış
   kodunu düşürmez. Bir kapıyı kapatmak ölçümü susturmak değildir (§21).
2. **Sayı TEK KAYNAKTAN gelir:** `scripts/hijyen/artefakt-bayatlik-sayim.cjs`. Kol ve pano
   onun **tüketicisidir**; kol ayrıca kendi **bağımsız** hesabıyla çapraz doğrular — paylaşılan
   tek uygulama iki yönde birden yanılabilir.
3. **Görünürlük zorunlu:** sayı `board.cjs yoklama` çıktısında yaşar. Hiçbir yere yazılmayan
   bir "kabul edilmiş boşluk" sessizleşir.
4. ⭐**DONDURULAN KOL ADIYLA YAZILIR.** Dondurulan **tek** kol
   `uretilmis-artefakt-tazeligi.test.ts` içindeki *"⭐derlemeye giren her kaynak, manifestteki
   blob SHA ile AYNI"* kolunun **bloklama** davranışıdır. Şunlar **BLOKLAMAYA DEVAM EDER:**
   - `INV-DOC-4b`'nin diğer iki kolu (izlenmeyen kaynak · vacuous-guard),
   - **AXIOM 3 kolu** — `INV-DOC-4` içindeki *"⭐depodaki artefaktın içeriği manifestteki
     özetle AYNI"*. **Üretilmiş dosyayı elle düzenlemek hâlâ KIRMIZIDIR** ve bu, üretilmiş
     dosya diskte kalmaya devam ettiği için daha da önemlidir.
   - `INV-DOC-3` ve `INV-DOC-7`.
5. ⭐**ELLE TAZELEMENİN DURMA ÖLÇÜTÜ "DIFF BOŞ" DEĞİL, KAPININ YEŞİLİDİR.** Bu zincir byte
   düzeyinde sabit noktaya **hiç ulaşmaz**: `compiled_at` ve `source_commit` her koşumda
   değişir. "Fark kalmayana kadar üret" diyen bir ritüel sonsuz döner. (URUN 2026-09-04'te
   bedelini ödedi.)

### ⚠BU HÜKMÜN İLK HÂLİ YANLIŞTI — plan-challenger düzeltti, kayda geçiyor

İlk plan *"`INV-DOC-4b`'nin iki kolu var: parity ve elle-düzenleme"* diyordu. Bağımsız bir
plan-challenger ölçtü: **üç** kolu var ve **üçü de kaynak tarafında**; elle-düzenleme kolu
başka bir değişmezin (`INV-DOC-4`) içinde. Yani "şu kapıyı dondur" emri hangi kolu
dondurduğunu söylemiyordu ve vacuous-guard kolu da dondurulursa kapı **sessizce boşalırdı**.

**Ders:** bir kapıyı dondurma emri, dondurulan kolu **`it` adıyla** göstermek zorundadır.
"Kapıyı dondur" bir emir değil, bir belirsizliktir.

### ⚠REDDEDİLEN YARIM ÇÖZÜM — ve niçin reddedildi

Aynı işin ilk hâli iki dosyayı (`standards_master.md`, `kayitlar_master.md`) **takipten
düşürmeyi** de içeriyordu (2,18 MB). **Ölçümle düştü:** `origin/master` son 40 commit'inde
beş üretilmiş dosyadan birine dokunan **35/40 (%87,5)**; o iki dosya çıktıktan sonra kalan üç
dosyaya dokunan da **35/40 (%87,5)**. **Fark SIFIR** — çakışma yüzeyi hiç daralmıyor, çünkü
`artefakt_manifest.json` ve `venthub_hvac_master.md` zaten aynı commit'lerde değişiyor.

Bedeli ise ölçüldü: `INV-DOC-3` ve `INV-DOC-4` kırmızı olur; `artefakt-ilan-istisnalari.json`
kaçış yolu *"istisna kaydı BAYATLAMAZ"* kolunu anında kırmızı yapar; yeşile dönmenin tek
dürüst yolu manifesti **yeniden üretmektir** (manifest üretilmiş bir dosyadır — elle satır
silmek AXIOM 3 ihlali), yani iş şeridin sınırını aşar.

**Hüküm:** takipten düşürme bu işten **düştü**. İstenirse ayrı iş olarak açılır ve gerekçesi
**"depo boyutu"** yazılır — *"çakışmayı çözüyor"* diye açılamaz, çünkü çözmüyor.

⚠**Yazılı tuzak:** `.cc_docs.yaml`'ın `skip_files` satırındaki o iki ad **KALIR**. Silinirse
`source_dirs: [src, "."]` süpürmesi 2,2 MB'ı `venthub_hvac_master.md`'nin içine **emer**.

### Kapsam sınırı — bu maddede YAPILMAYAN

**Üretimin kancalardan çıkarılması (D2) bu maddenin kapsamında DEĞİLDİR.** Ölçüldü:
`orion doc build`in tek çağıranı `scripts/hijyen/taban-tazele.cjs` (satır 203) —
`.githooks/post-commit`/`post-merge` bu dört master'ı üretmiyor, `lane-precommit.cjs` ise bu
dosyaları ne üretiyor ne okuyor. D2 ayrı bir PR'da, `taban-tazele`nin kendi kollarıyla
birlikte yapılır. **Bu madde tek başına yeterlidir:** kapı artık bloklamadığı için üretim
yapılmasa da kırmızı doğmaz.
