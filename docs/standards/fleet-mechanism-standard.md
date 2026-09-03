# Filo Mekanizması — Cetvel v1.0

> **Kapsam:** çok-oturumlu filonun **hayatta kalma katmanı** — bir şeridin panoyu duyması,
> düzenli uyanması ve bunların *kanıtlanması*. Tek soru: *bu oturum, kendisine yazılanı
> gerçekten duyuyor mu — ve bunu nereden biliyoruz?*
> **Zorlayan kapı:** `INV-MECH-1` → `src/__tests__/conformance/fleet-mechanism-integrity.test.ts`
> **İlk yazım:** 2026-08-20 · **Ölçüm sahibi:** ALTYAPI · **İş emri:** T115-VH

---

## 1. Niçin bu cetvel var — ölçülmüş vaka, tahmin değil

2026-08-20 sabahı **dört oturum** panoya sağır kaldı. Sağırlığın ayırt edici özelliği şudur ve
bu cetvelin tamamı bu cümlenin üzerine kuruludur:

> **Sağırlık sessizdir.** Hiçbir satır üretmez, hiçbir kapı kırmızı yanmaz, hiçbir hata
> mesajı düşmez. "Bugün pano sakin" gözlemiyle "hiç kimse beni duymuyor" gözlemi **birbirinin
> aynısıdır.**

Bedeli ölçüldü: Recep her oturumu tek tek elle dürtmek zorunda kaldı; adresli iş emirleri
saatlerce alıcısına ulaşmadı; üç şeridin turu boşa döndü.

İkinci vaka daha keskindir ve buraya kasten yazılmıştır:

> Hayatta-kalma katmanını **mekanikleştirmekle görevli şerit** (ALTYAPI), kendi katmanını
> kurmadı. Talimat **dört ayrı kanaldan** ulaşmıştı: pano notu, sıralı emir, yazılı hafıza
> dosyası (`fleet-dies-with-the-app`) ve şeridin kendi raporu. Dördü de davranış üretmedi.
> Kurulum ancak Recep doğrudan sorduğunda gerçekleşti.

Buradan çıkan hüküm:

> **Talimat davranış üretmez; mekanizma üretir.** Yazılı bir ders, açılış adımına
> bağlanmadıkça bilgi verir, davranış vermez.

## 2. Üç katman — ve üçünün de aynı anda ölmesi

| katman | ne yapar | ömrü |
|---|---|---|
| **gözcü** (persistent Monitor) | panoyu tarar, yeni notu bildirime çevirir | oturumla ölür |
| **cron** (CronCreate, ofsetli) | şeridi düzenli uyandırır | oturumla ölür |
| **tur-sonu uyanışı** (ScheduleWakeup) | gözcü ölürse ikinci kanal | tur sonunda **yeniden kurulur** |

**Üçü de aynı oturumun içinde yaşar ve uygulama kapanınca üçü birden ölür.** Yeni oturum
bunları devralmaz. Bu yüzden yeni oturumun **ilk işi** kurulumdur — ve bunu hatırlatmak
insana bırakılmaz (bırakıldı, dört kez başarısız oldu): `SessionStart` kancası hatırlatır,
`UserPromptSubmit` kancası her turda kırmızı satır basar.

**Tek kanal yedeklilik değildir.** Gözcü tek başına ölürse şerit sağır kalır; cron tek başına
kalırsa notlar 20 dakika bekler. Üçü birlikte istenir.

## 3. Kural

1. Her şerit oturumu, ilk turunda üç katmanı kurar ve **kanıtlar**.
2. Kurulum **beyanla** kapanmaz. Geçerli kanıt, `mechanism-setup.cjs prob` çıktısıdır.
3. Cron ofseti **tablodan** okunur (`mechanism-setup.cjs` içindeki `OFSETLER`), hatırdan
   yazılmaz. İki şerit aynı dakikayı paylaşamaz.
4. Gözcü **kalıcı imleç** tutar ve her taramada `sonTarama` damgası basar. Damga basmayan
   gözcü, canlılığı dışarıdan ölçülemediği için **kanıtsız** sayılır.
5. Gözcünün olay akışı **kodda** UTF-8'e zorlanır; konsol kodlamasına güvenilmez.
6. Mekanizma kırmızısı, brifingin **sessizlik kuralına tabi değildir**.

## 4. Ayırt edici test — öz-test değil

`prob` fiili panoya **dış** bir olay yazar ve gözcünün kalıcı imlecinin o olayın **ötesine**
geçmesini bekler. Ayırt ediciliği şuradan gelir:

> Gözcü çalışmıyorsa imleç **asla** ilerlemez. Yani gözlem, mekanizma çalışmasaydı **farklı**
> olurdu.

Olayı yazan süreç gözcüden ayrıdır ve **farklı bir sid** kullanır. Bu bir detay değil,
tasarımın kilit noktasıdır: gözcü kendi notlarını eler, dolayısıyla **"kendine test notu at"**
biçimindeki öz-test, tanım gereği **yanlış negatif** üretir. Her gözcü sahibinin sorması
gereken soru budur: *filtrem, görmem gereken hangi sınıfı tanım gereği dışarıda bırakıyor?*

### 4.1 Testin sınırı — adıyla

`prob` gözcünün panoyu **okuduğunu** kanıtlar; bildirimin **ajana ulaştığını** kanıtlamaz.
Teslimat ayrı bir kanıttır: probun ürettiği jeton bildirimde görülür ve
`dogrula --jeton <jeton>` ile geri yazılır. İkisini tek kanıt saymak, okuma ile duyma
arasındaki farkı siler.

## 5. Ölçülen ile beyan edileni ayırmak (fail-closed)

`dogrula` çıktısı üç sınıf kullanır ve bunları **karıştırmaz**:

| sınıf | anlamı | örnek |
|---|---|---|
| **ÖLÇÜLDÜ** | araç baktı ve gördü | gözcü imlecinin yaşı |
| **BEYAN** | ajan söyledi, disk doğrulayamaz | cron id (tek geçerli ölçüm: `CronList`) |
| **ÖLÇÜLEMEZ** | diskte izi yok | `ScheduleWakeup` |

Kanıtlanmayan katman **çökmüş sayılır** (fail-closed). "Ölçemedim" ile "geçti" aynı kovaya
girerse bekçinin varlık sebebi silinir.

`KANITSIZ` etiketi **"gözcüsü yok" demek değildir**: şeridin kendi izleyicisi olabilir ama
ölçülebilir imleç sözleşmesini yazmıyordur. Fail-closed davranış aynı kalır, ama hüküm doğru
adlandırılır — yanlış hüküm, doğru davranıştan daha uzun yaşar.

## 6. Yoklama — üç eksenli canlılık

`board.cjs yoklama` (eşanlamlı: `rollcall`) filoyu **üç ayrı eksende** ölçer:

| eksen | soru | kaynak |
|---|---|---|
| **ATIS** | oturum yaşıyor mu | pano heartbeat yaşı |
| **GOZCU** | panoyu **duyuyor** mu | imlecin son tarama yaşı |
| **SES** | iş **üretiyor** mu | son notunun yaşı |

Niçin üç eksen — ölçülmüş vaka: bir şeridin atışı **1 dakikalık**, son notu **1642 dakikalık**
ve içeriği `"test"`ti. Atış oturumun *yaşadığını* söyler; *duyduğunu* ya da *ürettiğini*
söylemez. Tek eksenli canlılık bu üç durumu tek kelimeye ("canlı") indirger ve sağırlığı gizler.

`yoklama` **okuyan** bir fiildir, `--sid` istemez: sağırlığı ölçmek isteyen tarafı (orkestratör,
Recep, yeni açılan oturum) tam da ölçüme muhtaç anda kimlik şartıyla dışarıda bırakmak yanlış
olurdu. Yazan fiiller kimliksiz koşmaz; okuyan fiiller koşar.

## 7. Kapsam sınırı — ADIYLA

**Mekanikleştirilen:** duyma (gözcü), uyanma (cron), yedek kanal (wakeup), yoklama, kurulum
metninin üretimi ve kurulumun kanıtı.

**Bilinçli olarak mekanikleştirilMEYEN:** slot verme, kuyruk sırası, çakışma hakemliği.
Bunlar **hüküm katmanıdır** ve orkestratörde kalır. Gerekçe: bu kararlar tempo, risk ve
öncelik tartar; mekanikleştirilirse yanlış kararı hızla ve tekrar tekrar verirler.

**Ölçülmeyen kalan:** `INV-MECH-1` mekanizmanın **yapısını** ölçer, o an **çalıştığını**
ölçmez ve ölçemez — bu bir çalışma zamanı sorusudur, cevabı `prob` ve `yoklama`dadır. Yapı
denetimi, davranış kanıtının yerine geçmez.

## 8. Kapı eklendiğinde kanıt zorunluluğu

Bu cetveli zorlayan her kol **bilerek bozularak** kanıtlanmıştır (2026-08-20):

| sabotaj | sonuç |
|---|---|
| gözcü hiç kurulmadan `dogrula` | KIRMIZI, 3 kalem kanıtlanmadı, çıkış 1 |
| gözcü hiç kurulmadan `prob` | KIRMIZI, imleç dosyası yok, çıkış 1 |
| gözcü canlıyken imleç geçici olarak kaldırıldı, kanca koşuldu | brifingde MEKANİZMA kırmızı satırı belirdi |
| gözcü canlıyken kanca koşuldu | MEKANİZMA satırı **yok** (yanlış pozitif üretmiyor) |
| `dogrula --jeton` uydurma jetonla | KIRMIZI, beklenen ve verilen jeton **adıyla** yazıldı |

Kanıtlanmamış bir kapı, kapı değildir.

## 9. Kanca yazım kuralları — KÖK, KİMLİK ve KOPARILMIŞ SÜREÇ

Bu bölüm 2026-08-27'de yazıldı. Niçin o gün: `bash-write-guard` ve `bash-write-audit`
kancalarının ikisi de **yanlış ağacı ölçüyordu** ve bunu söyleyen tek bir satır cetvel yoktu
(grep ile ölçüldü: `docs/standards/` altında kanca kök çözümünden bahseden hiçbir yer yok).
Kural yazılı olmadığı için iki kanca aynı hatayı bağımsız olarak yaptı — el kitabı
"hatırlanan" değil "yazılan" şey olmalı.

### 9.1 `cwd` KÖK DEĞİLDİR

**Kural: bir kanca çalışma ağacını `girdi.cwd` / `process.cwd()`'den ÇÖZMEZ.**

Ölçüm: bu ortamda Bash cwd'si sessizce **ana çalışma dizinine resetlenir** — araç çıktısının
sonunda `Shell cwd was reset to …` satırı basılır (PRICING ve EDGE bağımsız ölçtü). Şerit
kendi worktree'sinde çalışırken kancaya gelen `cwd` ana depoyu gösterir. Sonuç iki kancada da
aynı oldu: kapı **koştu**, sadece **başka bir ağacı** ölçtü, ve hiçbir test bunu göstermedi.
Ana depoda 5 kirli yol vardı, şeridin ağacında 40+.

Yerine ne kullanılır — **girdinin türüne göre değişir, ve bu tutarsızlık değildir:**

| kancanın girdisi | kök nasıl çözülür | örnek |
|---|---|---|
| **yol verilmiş** (komut metninde hedef var) | her hedefin kökü **kendi git deposundan** sorulur: `git -C <hedefin dizini> rev-parse --show-toplevel` | `bash-write-guard.cjs`, `board.cjs repoRootFor` |
| **yol verilmemiş** ("ne değişti" sorusu) | önce **ağaç kimliği** çözülür: sid → `venthub-sid` dosyaları → ağaç(lar) | `bash-write-audit.cjs` |

İkinci satırda hedef yoktur, dolayısıyla "hedefin deposu" diye bir şey de yoktur; soru
sorulabilmesi için **hangi ağaç** olduğunun önce bilinmesi gerekir.

**VentHub'a ait mi?** `git rev-parse --git-common-dir` ile ölçülür: bütün VentHub
worktree'leri **aynı** ortak dizini paylaşır, başka bir depo (orion, orion-registry,
corpus-callosum) paylaşmaz. Bu ölçüm aynı zamanda korumayı ayakta tutar: pano dizini
(`C:/tmp/venthub-board`), scratchpad ve `/dev/null` bir VentHub deposu içinde değildir, o
yüzden atlanır — **bunları bloklamak panoyu öldürür ve filo birbirini duymaz hâle gelir.**

### 9.2 KİMLİK: `venthub-sid` — ve sid TEKİL DEĞİLDİR

`session-board.cjs` her oturum açılışında sid'i `<absolute-git-dir>/venthub-sid` dosyasına
yazar (worktree-yerel; ortak dizine yazılsa bütün şeritler aynı kimliği okurdu). Kimlikten
ağaca giden okuma iki kaynağı tarar:

- `<ortak>/worktrees/<ad>/venthub-sid` → ağaç = `<ad>/gitdir` içeriğinin dizini
- `<ortak>/venthub-sid` → ağaç = ana depo

**Kural: sid'in tekil olduğunu VARSAYMA.** Ölçüm (2026-08-27): `e033dc3e` **üç** worktree'de
(vh-comp, vh-inv7, vh-rec80), `4397deef` **iki** worktree'de kayıtlıydı; ayrıca ana deponun
kimlik dosyası bir şeridin sid'ini taşıyordu. Belirsizlikte davranış:

1. **Sessizce birini SEÇME.** Seçim, onarmaya çalıştığımız "yanlış ağacı ölçtü ve yeşil
   göründü" arızasını aynen geri getirir.
2. **GÖRÜNÜR uyarı bas** ve **eşleşen bütün ağaçları** denetle.
3. Hiç eşleşme yoksa `cwd`'ye düşmek meşrudur ama **sessiz olamaz**: düşüşün kendisi ve
   sebebi yazılır. "Hiçbir şey bulamadı" ile "hiçbir yere bakmadı" ayırt edilebilir olmalı.

**Ağaç nitelikli anahtar:** aynı bağıl yol iki ağaçta birden kirli olabilir. Kanca durumu
dosyada tutuyorsa anahtar `<ağaç>::<bağıl yol>` olmalı; nitelenmemiş anahtar ikinci ağacı
sessizce "zaten bildirildi" sayar. Anahtar biçimi değişirse eski taban **doğrudan
karşılaştırılmaz** (her yol "yeni" görünür, tek turda onlarca sahte alarm düşer) — taban
yeniden kurulur ve o turda alarmın bastırıldığı **yazılır**.

### 9.3 `git status` ile ölçen kanca `-uall` KULLANIR

Varsayılan `--untracked-files=normal`, **yeni bir dizin** altındaki izlenmeyen dosyaları tek
satırda dizin olarak toplar: `?? zzz-audit-sinavi/`. O satır bir dosya yolu değildir, hiçbir
claim glob'una (`.../**`) uymaz ve kapı **sessizce ötmez**. Yani "başka şeridin ağacına YENİ
dosya eklemek" — en tipik ihlal biçimi — tam da görünmeyen hâldi. Bu kusuru
`INV-BASH-WRITE-2`'nin körlük kolu yakaladı; kapı yazılmadan önce kimse fark etmemişti.

### 9.4 Koparılmış süreç: `windowsHide: true` ZORUNLU

Windows'ta `spawn(..., { detached: true })` ile başlatılan çocuk süreç, `windowsHide`
verilmezse kendi konsolunu alır ve bir `conhost.exe` **penceresi açılıp kapanır**.
`stdio: 'ignore'` bunu **önlemez** — çıktıyı yutar, pencereyi değil.

Ölçülmüş vaka: Recep "her oturum açılışında pencereler yanıp sönüyor" diye bildirdi; o gün
sayılan 18 pencerenin 1'i `session-board.cjs`'in registry senkron süreciydi (kalan 17
Antigravity MCP config'inden geliyordu: `npx` ve çıplak komut adları Windows'ta `.cmd`
kabuğuna çözülür → `cmd.exe` + `conhost.exe`; ayrı olarak onarıldı). **Tam yol ile başlatılan
`node` / `python.exe` süreçleri pencere açmaz** — Claude Code'un kendi MCP config'i böyledir ve
66 node + 22 python sürecinin görünür penceresi yoktu.

### 9.5 Bu bölümün kanıtı

`INV-BASH-WRITE-2` (`src/__tests__/conformance/bash-write-audit-tree.test.ts`) beş kollu ve
her kolu **sabotajla** kanıtlandı; sağlam sürüme dönüş `sha256` ile doğrulandı:

| sabotaj | düşen kol sayısı |
|---|---|
| ağaç yine `cwd`'den çözülsün (eski hâli) | 3 |
| `git status -uall` kaldırılsın | 3 |
| sid belirsizliği sessiz geçilsin | 1 |
| "kimlik çözülemedi" uyarısı susturulsun | 1 |
| taban biçim-geçişi koruması kaldırılsın | 1 |

⚠ Sabotaj ölçümünün **kendisi** ilk turda kördü: `--reporter=basic` (vitest 4'te yok) koşumu
çökertti, hiçbir test koşmadı ve beş sabotaj da "fark edilmedi" göründü. Bu yüzden ölçüm
betiği artık **ön koşul olarak `geçen > 0`** doğruluyor: `düşen = 0` ancak araç gerçekten bir
şey okuduysa kanıttır.

### 9.6 Kanıtın TAŞIYICISI — ölçtüğün olayla aynı akışta mı?

> Ölçülmüş vaka (2026-08-27, T166-VH / INV-HOOKS-2). Bu madde bir tercih değil, **iki gün ve
> dört şeridi** tutan bir yanlış teşhisin bedelinden çıktı.

`githooks-doc-scope.test.ts` CI'da kırmızı, **yerelde aynı girdiyle yeşildi**. Kırmızı, master'ın
`c96977f6` ucunda başladı ve #858 / #856 / #855'i birden bekletti. Üç şerit (ALTYAPI, AUTH, OPS)
kırmızıyı iki gün boyunca **"süzgeç kesiyor"** diye okudu. Süzgeç suçsuzdu.

**Arıza ölçüm aracındaydı:** test, kancanın bitişini kancanın **günlüğünden** (`LOG`) bekliyor,
kanıtı **başka bir dosyadan** (`py.log`) okuyordu. İki dosya, tek bekleyiş — yapısal yarış.

#### Neden fark edilmedi: yanlış ama TUTARLI görünen hikâye

| ne yapıldı | doğru muydu | yine de yanlışa götürdü çünkü |
|---|---|---|
| Ham CI logu okundu, iki `PYCALL` satırı görüldü | Satırlar **gerçekti** | Yarışan bir dosyanın **anlık görüntüsüydü** |
| Hayatta kalanlar/kaybolanlar eşleştirildi | Korelasyon **gerçekti** | Kesilme noktası **yazma sırasıyla hizalı**ydı, o yüzden "gerçek depoda var mı" gibi sahte bir temizlik üretti |

Bu, hata sınıflarının en tehlikelisidir: veri doğru, korelasyon güçlü, hikâye tutarlı — ve
mekanizma yanlış. Çürütülmesi kolay görünmez.

#### Kural

1. **"Alınan değeri oku" YETMEZ.** Ek soru: *bu değerin taşıyıcısı, ölçtüğüm olayla aynı akışta mı?*
   Ayrı dosyaya yazılan kanıt, tek bir bitiş işaretiyle beklenip okunursa sessiz yarış üretir.
2. **Kanıtı kapının kendi akışına bağla.** Onarım eşiği büyütmek DEĞİLDİ: sahte üretici `PYCALL`
   satırını stdout'a basar, kanca onu `>> "$LOG" 2>&1` ile kendi günlüğüne alır. Kanıt ile
   `=== bitti` artık **aynı dosyada, aynı sırada** — yarış imkânsız hâle gelir.
   *Ölçüm:* onarım öncesi kod **4 koşumda kırmızı**, sonrası **2 koşum üst üste yeşil**.
3. **Her kapı SAYI bassın (yokluk kanıtı).** Teşhisi mümkün kılan tek şey süzgece eklenen
   `[doc-scope] GIRDI 10 satir · CIKAN 4 yol` satırı oldu. O satır olmadan **"kapsam sıfır
   döndürdü"** ile **"kanıt okunamadı"** aynı görünüyordu. Sayı yoksa körlük vardır.
4. **Şüphelendiğin mekanizmayı BORUDAN SÖKÜP izole çağır** (AUTH'un ölçümü). Kirli bir boru
   üzerinden akıl yürütmek iki gün yedi; `kapsamda()`'yı dört sabit girdiyle doğrudan çağırmak
   bir tur sürdü ve süzgeci akladı. İzole çağrı + muhasebe satırı = **iki bağımsız yöntemle** aynı
   sonuç; tek yöntem hiçbirini kesinleştirmiyordu.

#### Elenen iki mekanizma (kayda geçer — geri alınmış hipotez de bilgidir)

- *"Kanca gerçek ağaçta varlık/izlenme kontrolü yapıyor"* (AUTH önerdi, **kendisi geri aldı**):
  `doc-scope.cjs` baştan sona okundu, dosyada tek bir `existsSync`/`ls-files`/git çağrısı yok.
- *"stdin boş / EAGAIN"* (ALTYAPI önerdi, **AUTH çürüttü**): dayanağı vitest'in **kırpılmış**
  assertion çıktısıydı; ham logda `py.log` boş değildi. → §9.5'teki "kırpılmış çıktı kanıt
  değildir" maddesiyle aynı kök.

> Yan ürün, ayrıca korunur: süzgeç stdin hatasını `catch` ile yutmuyor ve stdout'a
> `fs.writeSync(1, …)` ile **kısmi yazma ele alınarak** yazıyor. `process.stdout.write` POSIX
> borusunda asenkrondur; süreç boşalmadan çıkarsa kuyruk sessizce uçar. İkisi de "sessizce
> hiçbir şey üretmeyen kanca" sınıfına ait ve #859'da kapatıldı.

#### 9.6.1 Bu maddenin kanıtı

`INV-HOOKS-2`'nin altıncı kolu (`src/__tests__/conformance/githooks-doc-scope.test.ts`) sabotajla
kanıtlandı; her turdan sonra sağlam sürüme dönüş `sha256` ile doğrulandı ve **ön koşul olarak
`geçen > 0`** arandı (sağlam sürüm 6/6 geçiyor):

| sabotaj | düşen kol |
|---|---|
| muhasebe satırı (`GIRDI … CIKAN …`) susturulsun | 1 |
| boş girdide stdout kirletilsin (veri kanalı temiz kalmasın) | 1 |

⚠ Sabotaj aracının **kendisi** ilk turda yarım kaldı: çalışma ağacındaki dosya **CRLF** ile
checkout edilmişti ve düz `\n` içeren çok satırlı arama dizisi hiç eşleşmedi — tek satırlık desen
tutmuşken. Betik bunu `UYGULANAMADI (desen tutmadı)` diye bildirdiği için fark edildi; bildirmeseydi
"iki sabotajdan biri yakalandı" diyen **yanlış bir kanıt** yazılacaktı. Çok satırlı sabotaj deseni
Windows checkout'unda **EOL-bağımsız** (`\r?\n`) olmalıdır. Bu, §9.5'teki "ölçüm aracının kendisi
kör olabilir" dersinin ikinci örneğidir; ölçüm aracı da ölçülür.

---

## 10. Compact dayanıklılığı — 4 sabit alan + PreCompact kapısı

**Niçin var — ölçülmüş vakalar, tahmin değil.**
2026-08-27: compact dönüşünde durum dosyası okunmadı; gün boyu bedel ödendi.
2026-08-28: kullanıcının geçiş anında yazdığı mesaj yutuldu — 3 tur kayıp + güven hasarı.
Aynı gün ölçüldü ki bu makinede **PreCompact kancası hiçbir ayar katmanında tanımlı değildi**
(proje/kullanıcı/local `settings.json` + 11 eklenti `hooks.json` → 0 eşleşme; negatif kontrol
olarak aynı tarama `SessionStart` için 153 dosya buldu). Yani compact dayanıklılığımız
tamamen ajan disiplinine dayanıyordu: kural yazılıydı, **mekanizma yoktu**. Bu bölüm o
boşluğu kapatır ve §4'ün "öz-test değil, ayırt edici test" ilkesini compact'e uygular.

### 10.1 Durum dosyası — DÖRT SABİT ALAN (zorunlu)

Her oturumun bir durum dosyası vardır; adı `lane-day` / `state` / `durum` kalıbını taşır ve
frontmatter'ında `metadata.originSessionId` oturum kimliğini tutar. Compact bloğu şu dördünü
**adıyla** içerir:

| alan | cevapladığı soru |
|---|---|
| **SON GİRDİ** | kullanıcıdan bana en son ne ulaştı |
| **AÇIK KUYRUK** | sırada ne var, hangi sırayla |
| **VERİLEN SÖZLER** | kime ne taahhüt ettim |
| **BEKLEYEN KARARLAR** | kimde hangi karar bekliyor |

Dördü de **ölçülebilir olsun diye** sabittir: alan adları serbest bırakılırsa "tutarsızlık"
bir yargı olur, oysa alanın varlığı bir ölçümdür. Kapı bu dördünü arar.

### 10.2 Eşikler — SAYIYLA yazılı

| eşik | değer | ölçüm tabanı |
|---|---|---|
| durum dosyası bayatlık | **60 dakika** | 2026-08-28: aktif beş şeridin dosyaları 1/9/17/27/35/39/46 dk yaşındaydı; bir sonraki değer 356 dk (kapanmış gün). 60, en eski aktif dosyaya pay bırakır ve kapanmış günü ayırt eder. 30 seçilseydi o gün AUTH yanlış alarm alırdı. |
| `MEMORY.md` boyut | **16384 bayt** | indeks ~24.4KB'de okunamaz oluyor, 27.5KB'de sessizce kırpıldığı gözlendi. Ölçü **bayt**, satır değil — kırpma bayta bakar. |

Eşikler koddan **export edilir** ve conformance testi cetveldeki sayıyla eşleştiğini ölçer;
sihirli sayı bırakmak, sonraki değiştirenin neyi neden değiştirdiğini bilememesi demektir.

### 10.3 Kapının davranışı — ne bloklar, ne uyarır

**BLOKLAR (exit 2):** oturumun hiç durum dosyası yok. Bu halde compact = kesin kayıp.
**UYARIR (exit 0):** dosya bayat · dört alandan biri eksik · `MEMORY.md` eşiği aşıldı.
Bayatlık **asla bloklamaz**: compact'i engellemek, kaybettirdiğinden fazlasını maliyet
yazabilir. Kilitlenmeye karşı kaçış valfi `VENTHUB_PRECOMPACT_KAPALI=1` ve valfin kendisi
testlidir — kaçış yolu ölçülemiyorsa kaçış yolu yoktur.

### 10.4 Dönüş ayağı — SessionStart(compact)

`SessionStart` kancası `source === 'compact'` kolunda durum dosyasının **son bloğunu**
bağlama enjekte eder. Gerekçe: "dönüşte durum dosyanı oku" demek ile **okutmak** aynı şey
değil; 08-27 vakasında kural yazılıydı ve yine okunmadı. Tüm dosya değil son blok basılır —
kırpılmış bağlamı yeniden doldurmak çözüm değildir.

### 10.5 Bilinen sınır — ÖLÇÜLMEMİŞ, kapı buna güvenmez

Platform belgesi `exit 2` için "blocking error, stderr fed back to Claude" diyor; ancak
**PreCompact'ta compact'i gerçekten iptal ettiği bu makinede ölçülmedi** — compact'i kullanıcı
tetikler, ajan tetikleyemez, yani bu ölçüm ajan tarafından yapılamaz (ÖNCÜL-ÖLÇÜM hükmünün
"ÖLÇÜLEMEZ" kutusu; bir seçim değil, bir özellik). Bu yüzden kapı o davranışa **güvenmeyecek**
biçimde tasarlandı: blok çalışmasa bile stderr Claude'a beslenir ve uyarı görünür. İlk gerçek
compact'te davranış ölçülüp bu madde güncellenecek — güncellenene kadar burada "iddia" olarak
durur, "kanıt" olarak değil.

### 10.6 Kanıt zorunluluğu (§8'in bu bölüme uygulanışı)

Kapı `src/__tests__/conformance/precompact-durum-kapisi.test.ts` ile sekiz koldan ölçülür.
Kolların **bağlılık** ayağı ayrıca zorunludur: kanca dosyasının var olması yetmez, `settings.json`
içinde `PreCompact` olayına bağlı olduğu ölçülür — bu depoda "yazıldı ama bağlanmadı" ölçülmüş
bir sınıftır ve yalnız o kol yakalar. Sabotaj tablosu:

| sabotaj | düşen kol |
|---|---|
| `settings.json` bağlaması sökülsün | bağlılık |
| blok kolu sökülsün (durum dosyası yokken sessizce geçsin) | blok |
| ad filtresi sökülsün (her dosya durum dosyası sayılsın) | ayırt edicilik |
| `require.main` koruması sökülsün | modül |
| güvenlik valfi sökülsün | valf |
| bayatlık eşiği değiştirilsin | eşik |

⚠ Bu tablonun **ilk turu yanlış hedefi vurdu** ve bunu kaydetmek şart: "ad kalıbı katmanı"
sabotajı yeşil kaldı ve ilk okuyuşta **kör nokta** sanıldı. Ölçünce **fazlalık** olduğu
görüldü — gerçek ders dosyaları dört alandan sıfırını taşıyor, yani içerik katmanına hiç
girmiyorlar ve sabotaj davranışı değiştirmiyordu. Aynı ölçüm ikinci bir kusuru açtı: içerik
katmanının eşiği 2'ydi ve **gerçek durum dosyalarını da dışlıyordu** (onlar da yalnız bir alan
tutuyor), yani katman ölüydü. §9.5'in dersi burada üçüncü kez doğrulandı: sabotajın
**çıktısını** değil **eşdeğerliğini** ölç; yeşil kalan sabotaj kapıyı değil ölçüm aracını
suçlayabilir.

**ÖLÇÜM SONUCU (2026-08-28, taze koşum):** `6 sabotaj | KIRMIZI 6 | kör 0 | ATLANAN 0`.
Ön koşul 8/8 yeşil, onarım sonrası 8/8 yeşil, sha doğrulandı. Yani tablodaki altı kolun
altısı da gerçekten yük taşıyor — hiçbiri süs değil.

⚠ **ÖLÇÜM ARACININ KENDİ KUSURU, §9.5'in dördüncü örneği.** Bu tablonun ilk koşumu YARIM
kaldı: betik çalışırken durduruldu ve `onar()` adımı hiç çalışmadı — depoda sabotaj artığı
kaldı (`require.main` koruması sökülü). Yani yarım sabotaj yalnızca kanıt üretmemekle
kalmaz, **depoyu bozuk bırakır** ve bir sonraki koşum "kapı zaten kırmızı" diyerek durur.
İki onarım yapıldı: (1) sabotaj döngüsü `try/finally` içine alındı, artık kesilme/exception
fark etmeksizin dosyalar asıl haline döner ve sha doğrulanır; (2) test koşumu `npx` yerine
doğrudan `node node_modules/vitest/vitest.mjs` çağırır — ölçüldü, `npx` bir koşumu 60 sn'nin
üstüne çıkarıyordu ve ilk turun zaman aşımına uğramasının sebebi testler değil bu overhead'di.
Kural: **yarım sabotaj kanıt değildir; kanıt tablosu ancak ATLANAN 0 ile birlikte okunur.**

## 11. KİMLİK — vekil kanıt ile asıl kanıt (E1-v2)

**Ölçüldü 2026-08-28 (ALTYAPI, kendi ağacında, kendi kapısı bloklayınca).** §9.1 kancanın
**hangi ağacı** ölçtüğünü konu alıyordu. Bu bölüm bir adım öncesini konu alır: **kim olduğunu.**

### 11.1 Olay

`lane-precommit` (E1) kimliği `<git-dir>/venthub-sid` dosyasından okuyordu. Bu dosyayı
SessionStart kancası yazar — ama oturumun **açıldığı** ağaca, **çalıştığı** ağaca değil. Bir
oturum ana dizinde açılıp işini bir worktree'de yaparsa, o worktree'deki kimlik orada **en son
oturum açanın** sid'i olarak kalır.

Sonuç: kapı `vh-altyapi-851` ağacında ALTYAPI'yı "başka şerit" sanıp **kendi claim'indeki**
dosyada bloklad. Dosyada yazan sid `dc2b0b90` — ağacı kuran, çoktan ölmüş bir oturum.

### 11.2 Körlüğün biçimi ve YÖNÜ

Eski dedektör yalnız **"kimlik dosyası YOK"** hâlini arıyordu (o sabah URUN'un ağacında bunu
doğru yakaladı). **"Dosya VAR ama YANLIŞ SAHİBE ait"** hâlini görmüyordu. İki hâl aynı arızayı
doğurur — şerit kontrolü yanlış oturum adına koşar — biri sessizdi.

**Yön önemlidir.** Ölçülen vakada hata *güvenli* yöne düştü: kapı kendi sahibini bloklad, yani
gürültü yaptı. **Ters yön sessizdir:** bayat sid *canlı* bir şeride aitse, o ağaçta çalışan
kişi **onun yetkisiyle** yazar ve kapı hiç ses çıkarmaz. Bu yüzden düzeltme "daha çok blok"
değil, **doğru kimlik + görünür uyarı**dır.

### 11.3 Kural — kanıt sıralaması

| sıra | kaynak | sınıf |
|---|---|---|
| 1 | `CLAUDE_CODE_SESSION_ID` (env) | **ASIL** — commit'i tetikleyen sürecin kendi kimliği |
| 2 | `<git-dir>/venthub-sid` | **VEKİL** — elle/terminalden commit için tek kaynak |

Çelişkide **asıl kazanır**, çelişki **görünür uyarı** olarak basılır ve vekil dosya asıl
kimlikle **onarılır** (yan etki gizli değildir, uyarısı vardır).

### 11.4 Bilinmeyen kimlik UYARIR ama kontrolü ATLAMAZ

Env yoksa ve dosyadaki sid panoda **hiç görülmemişse**, kapı bunu **söyler** ve şerit
kontrolünü **yine de koşturur**.

⛔**İLK YAZIMDA BURASI FAIL-OPEN'DI VE YANLIŞTI — kusuru CI buldu, yerel takım bulamadı.**
Gerekçem "yanlış blok `--no-verify` alışkanlığı kazandırır" idi ve **yanlış blok üretilebileceği
varsayımına** dayanıyordu. Varsayım ölçümle çöküyor:

> Panoda hiç görülmemiş bir sid, panoya hiç **claim yazmamış** demektir (claim bir olaydır ve
> olayı yazan sid'i tanınır yapar). Claim yazmamış bir kimlik **hiçbir yolun sahibi değildir.**
> Dolayısıyla çatışma kontrolü onun adına koşulduğunda **yalnızca başka bir şeridin
> claim'indeki yolda** blok üretebilir — yani tam da bloklanması gereken hâlde.
> **Bu kolda yanlış blok yapısal olarak imkânsızdır.**

Eski hâli gerçek bir delikti: kimliği tanınmayan her oturum, başka şeridin dosyalarını
serbestçe commit'leyebiliyordu. §12.2'nin "muafiyet fail-closed olmalı" ilkesi burada da
geçerlidir: **bilmemek, başkasının dosyası üzerinde yetki vermez.**

### 11.4.1 Niçin yerel takım göremedi — ÖLÇÜM EVRENİ tuzağı

Yerelde `CLAUDE_CODE_SESSION_ID` ortamda **dolu**dur; kapı env kolunu koşar ve bu dala **hiç
girilmez**. CI'da o değişken yoktur, dosya kolu koşar ve kusur ortaya çıkar. `lane-precommit-merge`
fikstürü ortamdan yalnız eski adı (`CLAUDE_SESSION_ID`) eliyordu; yeni ad sızıyor ve
**geliştiricinin kendi kimliği fikstürün kimliğini eziyordu.**

**Kural:** kimlik taşıyan **her** değişken fikstürde elenir. Bir test neyi ölçeceğine kendisi
karar verir; koşturan makinenin ortamına bırakmaz. Yerel yeşil, ürünü değil **ortamı**
ölçüyorsa yeşil değildir.

Bu, §9.5'in "bir kolu test etmek için o kola GİRDİRMEK gerekir" dersinin üçüncü örneğidir —
ilk ikisi sabotajla bulunmuştu, bu üçüncüsünü **CI** buldu.

### 11.5 ÖLÇEMEDİĞİM ŞEY — adıyla

**"Dosyadaki sid ŞU AN CANLI MI"** sorusu bu kapıda cevaplanmıyor. Denendi ve gösterge
**ayırt etmedi**: 2026-08-28 07:10 ölçümünde canlı dört şeridin heartbeat yaşı 51 dk, aynı anda
**kapalı** TEMIZLIK oturumunun da 51 dk'ydı. Ayırt etmeyen gösterge ölçüm değildir; canlılık
iddiası bu yüzden **kurulmadı**. Ayırt edilebilen daha zayıf ama gerçek ölçüt kullanıldı:
sid panoda hiç görülmüş mü (bayat `dc2b0b90` hiç görülmemişti).

### 11.6 Test biçimi — kaynak metni değil DAVRANIŞ

`e1-kimlik-kontrolu.test.ts` kapının kaynağında dize aramaz; her kol geçici bir git deposu
kurar, gerçek bir staged commit dener ve kapının çıktısını okur. Pano `VENTHUB_BOARD_DIR` ile
izole edilir (testin canlı filo panosuna yazması ölçümü kirletirdi — pytest'in canlı registry'ye
yazdığı vaka kayıtlı).

⭐**İlk yazışımda bu test SAHTE YEŞİL verdi ve sebebi kayda değer:** geçici depoda hiç commit
yoktu, `git rev-parse HEAD` patlıyordu, kapı "git okunamadı" koluna düşüp **hiç koşmadan**
geçiyordu. Beş kol kırmızı yandı ama **negatif kontrol kolları YEŞİL** verdi — çünkü "susuyor"
ile "hiç çalışmıyor" aynı görünür. Düzeltme iki parçalıdır: fikstüre ilk commit eklendi **ve**
bir **MEKANİZMA CANLI** kolu yazıldı — aynı fikstürde başka şeridin claim'i kurulup kapının
**bloklad**ığı ölçülür. **Negatif kontrol, mekanizmanın çalıştığı ayrıca kanıtlanmadan kanıt
değildir.**

### 11.7 Sabotaj kanıtı — ve ARACIN kendi bulduğu üç körlük

| tur | sabotaj | KIRMIZI | kör | ATLANAN |
|---|---|---|---|---|
| 1 | 6 | 3 | **3** | 0 |
| 2 (test sertleştirildikten sonra) | 6 | **6** | 0 | 0 |

⭐**İlk turda kör kalan üç kol, kapının değil TESTİN zayıflığıydı ve üçü de aynı sınıftı — VEKİL
KANIT:**

| sökülen kol | test niçin göremedi | düzeltme |
|---|---|---|
| `bilinmeyen` bayrağı | uyarı **yine basılıyordu**, değişen şey DAVRANIŞTI | çakışan claim kurulup çıkış kodu ölçüldü |
| onarım (`writeFileSync`) | `onar()` yine `true` dönüyor, "ONARILDI" yazılıyordu | kimlik **dosyasının içeriği** okundu |
| fail-open uyarısı | `/fail-open/i` deseni **başka bir mesajda da** geçiyordu | tam cümle deseni + davranış kolu |

Kural olarak yazılıyor: **bir kapının çıktısındaki cümleyi ölçmek, o kapının yaptığı işi ölçmek
değildir.** Mesaj vekil kanıttır; dosyanın yeni hâli, çıkış kodu ve blok kararı asıl kanıttır.
Sabotaj bu ayrımı ücretsiz gösterir — koşulmasaydı 8/8 yeşil bir test üç kolunda kör olarak
depoya inecekti.

### 11.8 ⭐BU BÖLÜM YAZILIRKEN §9.1 TUZAĞINA KENDİM DÜŞTÜM — vaka kaydı

E1-v2'yi yazarken commit komutum **ortak ana dizinde** koştu ve `master` dalına yerel bir commit
attı; `git add -A` yabancı artıkları (`.playwright-mcp/*`, başka şeritlerin companion'ları) da
aldı. Sebep tam olarak §9.1'de yazılı olan şeydi: **kabuk cwd'si sessizce ana çalışma dizinine
resetlenir** — ölçüm için bir kez `cd`'lediğim başka depodan sonra sonraki komutlar 851 ağacında
değil ana dizinde çalıştı.

Zarar ölçüldü ve geri alındı: commit `reset --mixed` ile çözüldü (dosyalar yerinde kaldı),
ana dizin `origin/master`'ın önünde **0 commit**, push edilmemişti. İki şerit dalı (`rec86-faz1`
10 commit, `rec84-denetim-penceresi`) ölçümle doğrulandı, **kayıp yok**.

**Kural — kancalar için yazılmış §9.1, ELLE koşan komutlar için de geçerlidir:** şerit işi yapan
her git/dosya komutu **`git -C <ağaç>` ya da mutlak yol** kullanır; cwd'ye güvenilmez. Ek olarak
**`git add -A` şerit işinde kullanılmaz** — ortak ağaçta yabancı artıkları toplar; dosyalar
adıyla eklenir.

### 11.9 ⭐104 SATIR CETVEL BİR MERGE'DE SESSİZCE SİLİNDİ — vaka kaydı

**Ölçüldü 2026-08-28.** Bu bölüm (§11, 104 satır) `f1705535` ile yazıldı ve bir sonraki taban
tazeleme merge'inde (`b119049b`) **tamamen düştü.** Sebep: çakışan dosyalara ayrım yapmadan
"master tarafını al" (`--theirs`) refleksi uygulandı. Refleks **üretilmiş** dosyalar için
doğrudur; `fleet-mechanism-standard.md` bir **kaynak** dosyadır ve orada aynı komut
**içerik silmektir**.

**Niçin fark edilmedi:** hiçbir kapı kırmızı yanmadı. Testler yeşildi (cetvel metnini test
etmiyorlar), artefakt kapısı yeşildi (yeniden üretim master'ın metnini yaydı), PR açıldı ve
**dokümantasyonsuz** hâliyle inmeye hazırdı. Kayıp sessizdi — §1'deki "sağırlık sessizdir"
ilkesinin doküman tarafındaki karşılığı.

**Ayırt edici ölçüt (bundan sonra zorunlu):** dalın commit'lerinin dokunduğu her dosya için
`git diff --name-only origin/master...HEAD` çıktısında o dosya **var mı?** Yoksa, dalın o
dosyaya kattığı içerik **net olarak sıfırlanmış** demektir. Üretilmiş dosyalarda bu normaldir
(yeniden üretilirler); **kaynak dosyada KAYIPTIR.**

```bash
# taban tazeleme merge'inden SONRA koşulur
git log origin/master..HEAD --no-merges --name-only --format= | sort -u | while read f; do
  git diff --name-only origin/master...HEAD | grep -qx "$f" || echo "KAYIP ADAYI: $f"
done
```

**Kural:** çakışan dosya **önce sınıflandırılır** (üretilmiş mi kaynak mı), sonra reçete
seçilir; ve taban tazeleme merge'inden sonra yukarıdaki kayıp taraması koşulur. "Kapılar yeşil"
bir merge'in içerik silmediğini **kanıtlamaz** — hiçbir kapı silinen paragrafı ölçmüyor.

### 11.9.1 Kuralın konsolide hâli — dört ajan, aynı ölçütün dört ayrı kusuru

Bu kural bir günde filoya yayıldı ve **iki turda kendi kendini keskinleştirdi**. Nihai metin:

| katman | ne yapılır | niçin |
|---|---|---|
| **1 — ÖN KOŞUL** | `git log --merges origin/master..HEAD` ile dalda taban-tazeleme merge'i **var mı** ölç | merge yoksa tarama tanım gereği boş döner; o "temiz" **kanıt değildir**. Beyan: *"tarama uygulanamaz — merge yok"* |
| **2 — TARAMA** | aday listesi (yukarıdaki betik) | çıktı **zaten blob düzeyindedir** (`git diff` blob karşılaştırır); aday çıkmaması asıl kanıttır, **üstüne dize/satır/`cat-file` tekrarı YAPILMAZ** |
| **3 — ADAY ÇIKARSA** | sırayla iki soru: (a) üretilmiş mi kaynak mı (b) kaynaksa içerik master'a **başka bir PR ile** inmiş mi | "net katkı sıfır" hem **kayıp** hem **zaten-inmiş** olabilir; ayırt eden blob değil **TARİH** |
| **4 — HÜKÜM aracı** | aday için **blob kimliği** (`git rev-parse <dal>:<yol>` = `origin/master:<yol>`) | "net katkı sıfır" tespitini içerik düzeyinde teyit eder; **FARKLI çıkması tek başına kayıp demek değildir** (bayat tabanlı dal doğal olarak farklı verir) |

⛔**"Dal indi, o yüzden tarama uygulanamaz" YANLIŞTIR — ölçüldü (ÜRÜN, 2026-08-28).** Squash
merge master'da **farklı bir SHA** üretir; dalın kendi commit'leri hâlâ "master'da yok" sayılır,
dolayısıyla `origin/master..HEAD` **boş dönmez ve tarama koşar.** ÜRÜN kendi inmiş dalında
koşturdu (11 commit, 3 merge) ve aday üretti; AUTH aynı düzeltmeyi kendi raporuna uyguladı.
Taramayı uygulanamaz yapan tek şey **1. katmandır** (merge yokluğu), inmiş olmak değil.

⚠**Üç nokta ile iki nokta aynı soruyu sormaz** (ÜRÜN'ün teknik notu): `origin/master...HEAD`
*"dalın katkısı ne"* diye sorar, *"şu an farklı mı"* diye değil. Bu yüzden tarama sonucu ile
blob karşılaştırması **çelişkili görünebilir** ve çelişki bir hata değil, iki farklı sorunun
iki farklı cevabıdır.

**Niçin bu tablo bu kadar uzun sürdü:** dört şerit aynı gün aynı tuzağın **dört ayrı yüzüne**
düştü ve dördü de kendini düzeltti — dize işareti (ÜRÜN), satır sayısı (AUTH), dosya varlığı
(I18N), ve "merge yok ama temiz dedim" (ALTYAPI). İlk üçü *vekil kanıt* sınıfıydı: **eşit
görünüp farklı olabilir.** Dördüncüsü farklı bir sınıftı: **ölçüt doğru, evren boştu.**
Hiçbiri tek başına tabloyu göremezdi.

### 11.9.2 ⚠SINIFLANDIRICININ KENDİSİ YANILIR — manifestte ad aramak YETMEZ

Çakışan dosyayı "üretilmiş mi kaynak mı" diye ayırmak için **manifest içinde adını aramak
YANLIŞTIR** ve tam da tehlikeli yönde yanılır: manifest **hem ürünü hem kaynaklarını** kaydeder.
Ölçüldü (2026-08-28): ham dize araması `docs/standards/fleet-mechanism-standard.md` için
"ÜRETİLMİŞ" dedi — yani *"`--theirs` güvenli"* dedi — oysa o bir **kaynak** dosyadır ve §11.9'daki
104 satırlık kayıp **tam olarak bu yanlış sınıflandırmanın sonucudur.**

**Doğru ölçüt — manifestin yapısı:**

| soru | nerede bakılır |
|---|---|
| ÜRETİLMİŞ mi | `artefaktlar[].ad` listesinde (bu depoda **4 kalem**) + `artefakt_manifest.json`'un kendisi |
| KAYNAK mı | `artefaktlar[].kaynak.dosyalar` anahtarlarında |
| **HEM ÜRÜN HEM KAYNAK** mı | ikisinde birden → **AXIOM 7**, iki tur build |

```bash
# dogru siniflandirici (dize aramasi DEGIL, yapiya bakar)
git diff --name-only --diff-filter=U | node -e "…artefaktlar[].ad vs kaynak.dosyalar…"
```

Ders, §5'in bu bölüme uygulanışıdır: **sınıf atayan bir ölçüt, "kendine ne diyor" sorusunu da
geçmek zorundadır.** Aynı ailenin ikinci örneği: `artefakt_manifest.json` kendi kaydını tutmaz,
bu yüzden naif ölçüt onu da yanlış sınıflar.

## 12. GERİ ALMA MUAFİYETİ — bir kapının önerdiği düzeltme öteki kapıdan geçmeli

**Ölçüldü 2026-08-28.** §11 kimliği konu alıyordu; bu bölüm kapılar arası bir çelişkiyi.

### 12.1 Olay — "düzeltme yolu kapalı alarm"

`bash-write-audit` doğru bir dikiş-yeri alarmı verdi (build, başka şeritlerin companion'larını
yeniden üretmişti) ve çözümünü de yazdı: *"değişikliği geri al — `git checkout -- <yol>`"*.
Geri almaya kalkıldığında `bash-write-guard` **bloklad**: *"başka bir oturumun şeridinde"*.

**Bir kapının ÖNERDİĞİ düzeltmeyi öteki kapı yasaklıyordu.** Sebep: guard "yazma"yı görür,
NİYETİ görmez — geri alma da bir yazmadır.

**Kural olarak yazılıyor:** bir alarm yazan kapı, önerdiği düzeltmenin **kendi kapılarından
geçtiğini ölçmek zorundadır.** Düzeltme yolu kapalı bir alarm, alarm olmaktan çıkar; kullanıcıyı
ya çaresiz bırakır ya `--no-verify` alışkanlığına iter.

### 12.2 Muafiyetin sınırları — dar, çok şartlı, sesli

| şart | niçin |
|---|---|
| komutun **TÜM** hedefleri geri-alma sebepli (`every`, `some` DEĞİL) | karışık komut (`checkout -- x && echo >> x`) muafiyet almaz: tek yabancı yazma bütün komutu kapatır |
| ağaç **izole worktree** olacak | ana depoda `checkout` başkasının **commit'siz ara işini sessizce siler** (bu depo o dersi 2026-08-20'de yaşadı) |
| ölçülemezse muafiyet **AÇILMAZ** (fail-closed) | kapının kendisi fail-open olabilir; bir *muafiyet* asla — ölçüm hatası kapıyı delerdi |
| muafiyet **sesli** | sessiz muafiyet ile kapının hiç koşmaması aynı görünür |
| `git restore --staged` / `-S` **kapsam dışı** | index'i değiştirir, HEAD'e döndürme değildir |

### 12.3 Ana depo / worktree ölçütü — sabit yol GÖMÜLMEZ

Ölçüt: git-dir ile git-common-dir aynı ise ana depo.

⚠**HİPOTEZ ÖLÇÜMLE ÇÜRÜDÜ ve tam tehlikeli yönde:** ana depoda `--git-common-dir` **GÖRELİ**
(".git") döner, git-dir ise mutlaktır. Düz karşılaştırma ana dizin için "worktree" der ve
muafiyeti **tam yasak olduğu yerde** açardı. İki taraf da toplevel'e göre mutlaklaştırılır ve
üç ağaçta doğrulandı (ana=EVET, iki worktree=hayır). Kod yazmadan ölçüldüğü için kaçtı.

⚠**Ayrıca ölçüldü: bu kapının "ana dizin bloğu" HİÇ YOKTU.** Filo tasarım kararı onu
"korunacak mevcut koruma" sanıyordu; guard ana depo/worktree ayrımını hiç yapmıyordu. Var
sanılan koruma, olmayan korumadan tehlikelidir — **"aynen kalsın" denen her koruma ölçülür.**

### 12.4 Sabotaj kanıtı

| tur | sabotaj | KIRMIZI | kör | ATLANAN |
|---|---|---|---|---|
| 1 | 6 | 5 | **1** | 0 |
| 2 (test sertleştirildikten sonra) | 6 | **6** | 0 | 0 |

Kör kalan kol **fail-closed** koluydu: `catch` dalını "muafiyet açılır" yapınca test yeşil
kalıyordu — çünkü fikstürde ölçüm **hep başarılıydı** ve o dala hiç girilmiyordu. Düzeltme:
`PATH` boşaltılarak `git` çalıştırılamaz hâle getirildi. **Bir kolu test etmek için o kola
GİRDİRMEK gerekir; kolun varlığını okumak onu ölçmek değildir.**

### 12.5 İKİNCİ MUAFİYET — birleştirme (`bash-write-audit`)

**Ölçüldü 2026-08-28; aynı gün ÜÇ kez ötdü** (ALTYAPI kendi ağacında 7 dosya, AUTH iki kez,
URUN bir kez). `git merge origin/master` başka şeritlerin master'a inmiş dosyalarını çalışma
ağacına getirir; denetim "sonuca bakar" ve bunları bu şeridin yazdığı iş sanar.

⭐**Asıl zarar stderr değil PANO:** alarmın bir kolu ilgisiz şerit sahibine otomatik
*"senin dosyanı değiştirdim"* notu düşürür. Yani yanlış alarm yalnız beni değil, **hiç ilgisi
olmayan bir şeridi** meşgul eder. URUN bu notu bağımsız olarak "bu ihlal değil, merge'in
kendisi" diye teşhis etti — teşhis doğruydu ve kancanın kendisi yanlış etiketliyordu.

**Sınıf:** aynı olguya iki kapının zıt hüküm vermesi. `lane-precommit.cjs` bu muafiyeti
ZATEN taşıyordu (`MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REVERT_HEAD`), `bash-write-audit.cjs`
taşımıyordu. §12.1'in kardeşi: normal iş akışını ihlal sayan alarm, birkaç gün içinde
görmezden gelinir ve **gerçek sinyal onunla birlikte ölür.**

| şart | niçin |
|---|---|
| hâl **ağaç başına** ölçülür (`rev-parse --absolute-git-dir`) | çok ağaçlı denetimde bir ağacın merge'i ötekini muaf yapmamalı |
| ölçülemezse muafiyet **AÇILMAZ** (fail-closed) | §12.2 ile aynı ilke: kapı fail-open olabilir, muafiyet asla |
| muafiyet **sesli** — hâl + muaf tutulan yol **SAYISI** basılır | sessiz muafiyet ile kancanın hiç koşmaması aynı görünür |
| kapsam **dar**: yalnız o turun yeni yolları | merge commit'lenince hâl biter, yollar zaten temizlenir — kalıcı kör nokta yok |

**Sabotaj kanıtı:** 6 sabotaj · KIRMIZI **5** · kör **0** · ATLANAN **0** · bilinen sınır **1**.

⚠**BİLİNEN SINIR, "kör nokta" DEĞİL — ve niçin ayırdığımız önemli:** fail-closed kolu bu
fikstürde **girdirilemiyor**. §12.2'deki "PATH'i boşalt" tekniği burada işlemez, çünkü sıra
farklı: `git` ölürse `git status` da başarısız olur ve denetim daha yukarıda `okunanAgac === 0`
ile sessizce çıkar — yani birleştirme ölçümüne **hiç gelinmez**. Kol kodda savunma olarak
duruyor, testte ve burada adıyla yazılı, ama **kanıtlanmadı**. "Ölçemedim" ile "geçti" ayrı
şeylerdir; sabotaj tablosunda ayrı sütunda durmasının sebebi budur.

⚠**"Master tarafını al" reçetesi YALNIZ ÜRETİLMİŞ dosya için geçerlidir.** Aynı gün bu
cetvelin kendisi çakıştı (bir taraf §10, öteki §12) ve orada doğru çözüm **iki tarafı da
tutmak**tı. Reçeteyi ayrım yapmadan uygulamak, çakışmayı çözerken içerik silmektir; çakışan
dosyanın **üretilmiş mi kaynak mı** olduğu önce ölçülür (`docs/artefakt_manifest.json`
içinde mi?), sonra reçete seçilir.

---

## 13. AĞIR-SINIF TEST EŞİĞİ — ve adı konmuş artık risk

**Ölçüldü 2026-08-30.** Filo aynı makinede paralel çalışırken iki conformance testi kırmızı
verdi (`eol-normalization`, `build-skip-positive-logic`). İkisi de **assertion değil ZAMAN
AŞIMI**ydı. ÜRÜN aynı olguyu bağımsız olarak, farklı ağaç ve dalda ölçtü — teşhis iki
kaynaktan doğrulandı.

### 13.1 Ölçüm — sınıf iki değil ON

Alt süreç doğuran 16 conformance testinin tamamı boş makinede, ardışık ölçüldü:

| test | boş gövde | alt süreç | 20 sn bütçesinin |
|---|---|---|---|
| `build-skip-positive-logic` | **9,27 sn** | 7 | %46 |
| `githooks-doc-scope` | **8,38 sn** | 14 | %42 |
| `bash-write-audit-tree` | 5,96 sn | 10 | %30 |
| `e1-kimlik-kontrolu` | 5,05 sn | 6 | %25 |
| `board-invariants` | 2,17 sn | 8 | %11 |
| `precompact-durum-kapisi` | 1,79 sn | 3 | %9 |
| `eol-normalization` | 1,47 sn | 2 | %7 |
| `lane-precommit-merge` | 1,28 sn | 9 | %6 |
| `companion-dondurulmus` | 1,15 sn | 2 | %6 |
| `catalog-integrity-gate` | 0,995 sn | 3 | %5 |

Kalan altısı 0,3 sn'nin altında ve rahat.

⭐**Hükmü değiştiren oran:** `eol-normalization` boşta **1,47 sn**, yük altında **39,9 sn** —
**~27×**. Bu çarpan tabloya uygulanınca boşta ~0,8 sn'yi geçen **her** test 20 sn'yi aşar.
Yani risk kümesi iki değil **on**. "İki gözlem + on dört bilinmez" hâli böyle kapandı.

⭐**Ve daha keskin bir ayrım:** `build-skip` boş makinede bile bütçenin **%46'sını** yiyordu.
O test yük olmadan da kenardaydı. **Yük onu yaratmadı, GÖRÜNÜR KILDI.**

### 13.2 Kural — global eşiğe DOKUNULMAZ

Eşik **test dosyası başına** yazılır (`vi.setConfig({ testTimeout: 60_000 })`), global
`vitest.config.ts` değeri **20 sn olarak kalır**. Gerekçe: 122 testin hepsi için eşiği
büyütmek, gerçekten **asılmış** bir testin sinyalini de kör eder.

Her eşiğin yanında **o dosyanın ölçülmüş boş-gövde değeri** ve 27× notu yazılıdır — ileride
60 sn'yi aşan bir kırmızıyı gören kişi, bunun *gerçek* bir aşım olduğunu ve varsayımın
nereden geldiğini okuyabilsin.

**Mekanizma ayırt edici testle kanıtlandı, beyanla değil:** 25 sn uyuyan bir sınav testi,
`setConfig` **varken** yeşil (çıkış 0), **sökülünce** kırmızı (`Test timed out in 20000ms`,
çıkış 1). "Eşiği yazdım" cümlesi, eşiğin uygulandığının kanıtı değildir.

### 13.3 ⚠ADI KONMUŞ ARTIK RİSK — kabul edildi

**Aşırı yük altında `build-skip-positive-logic` 60 sn'yi de aşabilir** (9,27 × 27 ≈ 241 sn).
Bu risk **bilinerek kabul edilmiştir**: eşiği 240 sn'ye çekmek "hiç kırmızı olmayan" bir kapı
üretir ve asılma sinyalini tamamen kör eder. Kör kapı, kırılgan kapıdan kötüdür.

⚠**Ölçülmeyen, adıyla:** 27× çarpanı **tek gözlemden** gelir (`eol`). `build-skip`'in gerçek
amplifiye süresi **ölçülmedi** — 20 sn'de kesildi. Tablo bu varsayımla okunur.

⚠**Kapsam dışı bırakılan, adıyla:** `catalog-integrity-gate` (0,995 sn) eşiğin hemen altında
ve bu şeridin claim'inde değil — dokunulmadı. Bir sonraki yük dalgasında ilk aday odur.

---

## 14. `board.cjs` BAYRAK SEMANTİĞİ — tekrarlanan bayrak sessizce ezmez

### Ölçülmüş vaka (2026-08-30)

CLI ayrıştırıcısı `flags[name] = rest[i + 1]` yazıyordu. `--globs "A/**" --globs "B/**"`
çağrısında ikinci değer birinciyi eziyor, claim **yalnız `B/**` ile** kaydediliyordu.
Komut `exit 0` verip *"talep alındı"* diyordu — yani **kayıp, başarı gibi görünüyordu.**

**Niçin ciddi:** claim eksik kaydolunca şerit, talep ettiğini sandığı yolları
**korumuyor**. Başka bir şerit o yollara girdiğinde kapı çakışmayı **göremiyor** — sessiz
kayıp doğrudan şerit izolasyonunu deliyor. Kapının varlık sebebi tam da bu.

⚠**Filo notu yön olarak yanlıştı:** panoda *"yalnız İLKİ kaydediliyor"* yazıyordu; ölçüm
**SON kazandığını** gösterdi. Kayıp aynı, teşhis değil. Ölçülmemiş teşhis, ölçülmüş
kusurdan daha hızlı yayılıyor — nakledilen teşhis, ölçülene kadar **hipotezdir**.

### Kural — iki ayrı davranış, bilerek

| bayrak | tekrarlanırsa | niçin |
|---|---|---|
| `--globs` | **BİRİKİR** (birleşim) | ayırıcı zaten virgül; tekrarın tek anlamlı yorumu birleşimdir |
| `--sid`, `--lane`, `--to`, `--text` | **HATA (exit 1)** | "hangisini kastettin"in doğru cevabı yok; sessizce birini seçmek ezmenin başka adıdır |

- **Birleştirme GÖRÜNÜR olur:** kaç yol okunduğu `stderr`'e yazılır. Sessiz birleştirme de
  sessiz ezme kadar okunaksızdır — okuyan neyin kaydedildiğini görmeli.
- **Ret GÖRÜNÜR olur:** hata mesajı hem bayrağı hem **iki değeri birden** yazar; okuyan
  hangisinin düştüğünü bilmeden karar veremez.

### Kapı ve ayırt ediciliği

`src/__tests__/conformance/board-globs-tekrarlanan-bayrak.test.ts` — 5 kol. Kollar
**birbirinin yerine geçmez**, çünkü tek kol yanıltır:

- *tekrar birikiyor* kolu — asıl hüküm.
- *virgüllü tek değer* **gerileme kolu** — onarım eski sözdizimini bozarsa, yalnız birinci
  kol yeşilken bu fark edilmezdi.
- *tekrarlanan `--sid` reddediliyor* kolu — birikmenin her bayrağa yayılmadığını kanıtlar.
- *birleştirme görünür* kolu — sessizliği kusur sayar.
- *ön koşul* kolu — `board.cjs` gerçekten koşuyor mu (ölçülemedi ≠ geçti).

**Sabotajla kanıtlandı:** birikme satırı eski ezici hâline (`flags[name] = deger`)
çevrildiğinde **tam 2 kol kırmızı** (birikme + görünürlük), diğer 3 kol yeşil kaldı,
`FULL_EXIT=1`. Yani kapı doğru şeyi ayırt ediyor, toptan yeşil/kırmızı vermiyor.

### ⭐"İNDİ ≠ ÇALIŞIYOR" — bu onarımda da yaşandı ve kapatıldı

PR merge edildikten **sonra** ölçüldü: ana dizin 6 commit gerideydi ve **koşan kopya hâlâ
kusurluydu** — `--globs "PPP/**" --globs "QQQ/**"` çağrısı ana dizinde yine
`talep alındı: CANLI → QQQ/**` veriyordu (`grep -c BIRIKEN_FLAGS` → **0**, master'da 2).
Yani onarım merge edilmişti ama **filo için canlı değildi**; şeritler claim yaparken hâlâ
yol kaybediyordu.

Kancalar ve pano aracı **ana dizinden** yüklenir. Bu yüzden bir mekanizma onarımının
kapanış kanıtı merge değil, **çalışan kopyada ölçüm**dür:

| katman | ölçüt | bu vakada |
|---|---|---|
| merge | `mergeCommit` | `52d671df` |
| içerik (master) | kaynakta dize sayımı | `BIRIKEN_FLAGS` = 2 |
| **çalışan kopya** | ana dizinde `HEAD` + dize sayımı | 0 geride, = 2 |
| **davranış (canlı)** | izole panoda gerçek çağrı | `talep alındı: KENDI → PPP/**, QQQ/**` |

⚠ Son iki satır **akran beyanıyla kapatılmaz.** Ana dizini tazeleyen taraf sonucu
bildirse bile ölçüm yeniden yapılır — kapanışı yazan, ölçen olmalıdır.

⚠ Davranış ölçümü **izole panoda** (`VENTHUB_BOARD_DIR=<geçici dizin>`) koşulur; sınav
çağrısı canlı panoya sahte claim yazmamalıdır.

---

## 15. ÜRETİLMİŞ ARTEFAKT İHLALİ ≠ DİKİŞ YERİ İHLALİ

### Ölçülmüş vaka (2026-08-30)

`bash-write-audit` tek gün içinde **üç ayrı turda** öttü ve üçünde de bulduğu şey aynıydı:
`post-commit` üretecinin arka planda yazdığı companion `.md`'ler
(`bash-write-audit.md`, `lane-precommit.md`, `AboutPage.md`, `board.md`,
`CategoryLandingView.md`, `OdemeKapaliBilgi.md`). Hiçbiri elle yazılmadı, hiçbiri bir
şeridin işine dokunmadı. Buna rağmen kanca *"başka şeridin dosyasına SEN yazdın"* deyip
`exit 2` ile döndü **ve karşı şeride pano notu düştü**.

**Niçin bu bir kusur:** yanlış alarm bedavaya gelmez. Sürekli öten kapı görmezden gelinir
— **gürültü, kapıyı KÖR ETMENİN yavaş yoludur.** Kancanın kendi baş yorumu bunu zaten
söylüyordu (*"alarm üç gün içinde görmezden gelinirdi"*); kusur, aynı hükmün üreteç
çıktısına uygulanmamış olmasıydı.

### Sınıflandırma YAPISALDIR — ad araması değil

| ölçüt | üretilmiş sayılır |
|---|---|
| `artefakt_manifest.json` → `artefaktlar[].ad` | evet |
| manifestin kendisi | evet |
| `X.md` + yanında aynı adlı **kaynak** dosya (`.ts/.tsx/.js/.jsx/.cjs/.mjs/.py`) | evet (companion) |
| kardeş kaynağı olmayan `.md` | **hayır** — elle yazılmış belgedir, korunur |

⚠ `kaynak.dosyalar`'a **BAKILMAZ**. Orası kaynak listesidir; oraya bakan bir süzgeç
kaynağı "üretilmiş" sanar. Bu depoda tam bu hata **104 satır cetvel** kaybettirdi
(`uretilmis-artefakt-standard.md`, AXIOM 8).

### Davranış

- Üretilmiş olanlar **görünür kalır** (`DUSUK SIDDET` + gerekçe) ama **bloklamaz** ve
  **panoya not göndermez.** Not, karşı şeridin dikkatini ister; üreteç çıktısı için o
  dikkat boşa harcanır. *"Sustu"* ile *"böyle sınıflandırdı"* ayırt edilebilir kalmalı —
  **sessiz muafiyet, sessiz ezme kadar kötüdür.**
- Gerçek ihlal varsa davranış **aynen** eskisi gibi: `exit 2` + pano notu.
- **FAIL-CLOSED:** sınıf ölçülemezse (manifest okunamadı, `statSync` patladı) ihlal
  **gerçek** sayılır ve ölçülemezlik **basılır**. *"Ölçemedim"* ile *"üretilmiş"* aynı
  kefeye konmaz (§5).

⚠ **Kabul edilen artık risk, adıyla:** başka bir şeridin companion'ını **elle**
düzenlemek artık bloklanmaz, yalnız düşük şiddetle raporlanır. Bilerek: companion
üretilmiş dosyadır (AXIOM 3 elle düzenlemeyi zaten yasaklar) ve bir sonraki üretimde
ezilir — yarıçapı sınırlıdır. Gürültünün bedeli ise sınırsızdı.

### Kapı ve ayırt ediciliği

`src/__tests__/conformance/bash-write-audit-uretilmis-sinifi.test.ts` — 6 kol. Asıl ölçüt
mesaj değil **panoya düşen not sayısı**; fikstür manifestinde `kaynak.dosyalar` **kasten**
doldurulur ki süzgecin oraya bakmadığı ölçülsün.

1. **mekanizma canlı** (gerçek dosya → `exit 2` + not 1) — susma kollarını anlamlı kılan kol.
2. companion susar (`exit 0`, not 0, `DUSUK SIDDET` görünür).
3. manifestte ürün olan dosya susar.
4. ⭐**karışık** (gerçek + üretilmiş) → `exit 2` ve not sayısı **tam 1**.
5. **süzgeç dar**: kardeş kaynağı olmayan `.md` gerçek sayılır.
6. **fail-closed**: manifest okunamayınca companion bile gerçek sayılır + `OLCULEMEDI` basılır.

**Sabotajla kanıtlandı:** sınıflandırma devre dışı bırakıldığında **tam 3 kol kırmızı**
(companion · manifest-ürün · karışık), gerçek-ihlal davranışını ölçen 3 kol yeşil kaldı,
`FULL_EXIT=1`.

---

## 16. MEKANİZMA PR'I İNDİĞİNDE ANA DİZİN TAZELENİR — merge'in ayrılmaz parçası

### Niçin kural oldu: aynı boşluk BİR GÜNDE İKİ KEZ

§14'te *"İNDİ ≠ ÇALIŞIYOR"* bir vaka olarak yazılmıştı. Aynı gün **ikinci kez** yaşandı:

| PR | master'da | ana dizinde koşan kopya |
|---|---|---|
| `#903` (`board.cjs` bayrak onarımı) | `BIRIKEN_FLAGS` = 2 | **0** — claim hâlâ yol kaybediyordu |
| `#906` (`bash-write-audit` sınıfı) | `uretilmisSinifi` = 1 | **0** — yanlış alarm sürüyordu |

İki vakada da PR yeşildi, merge edilmişti, içerik master'daydı. Ve **filo eski kodu
koşmaya devam etti.** İkincisinde gürültü bir başka şeride (URUN) dört yanlış pano notu
düşürdü.

Tekrar eden bir arıza artık vaka değil, **sahipsiz adımdır**: kancalar ve pano aracı ana
dizinden yüklenir, ama ana dizini tazelemek kimsenin görevi değildi — o yüzden unutuluyordu.

### Kural

**Mekanizma dosyalarına dokunan bir PR** (`scripts/board/**`, `.claude/hooks/**`,
`.githooks/**`) master'a indiğinde:

1. Merge'i duyuran taraf **OPS'a bildirir**.
2. **OPS aynı turda ana dizini `ff-pull` eder.** Kirli dosyalar **yalnız companion** ise
   `stash → pull → drop`; **companion olmayan tek bir kirli dosya varsa tazeleme
   YAPILMAZ**, önce sahibi bulunur (ana dizinde başkasının işi olabilir).
3. **Tek satır içerik kanıtı basılır:** değişen dosyada ayırt edici bir sembolün grep
   sayımı (ör. `grep -c 'function uretilmisSinifi' .claude/hooks/bash-write-audit.cjs` → 1).
4. Bu adım atlanırsa olay **"İNDİ ≠ ÇALIŞIYOR" vakası** sayılır ve §14'teki dört katmanlı
   kapanış tablosu doldurulmadan PR kapatılmaz.

⚠ **Kanıtı ölçen, kapanışı yazan olmalıdır** (§14). Ana dizini OPS tazelese bile, PR'ı
kapatan şerit ölçümü **kendisi yeniden koşar**. Bu iki vakada da öyle yapıldı.

### Niçin OTOMATİK değil — reddedilen seçenek, gerekçesiyle

Merge sonrası ana dizini kendiliğinden tazeleyen bir adım düşünüldü ve **reddedildi**:
ana dizin **paylaşılan** bir ağaçtır ve içinde başka bir oturumun commit'lenmemiş işi
olabilir. Otomatik bir `pull`/`stash`, tam da bu cetvelin başka yerlerinde yazılı olan
*"ortak ağaçta commit'siz iş uçar"* sınıfını üretir. İnsan onaylı ritüel, sessiz
otomasyona **bilerek** tercih edildi: kaybın bedeli, unutmanın bedelinden büyüktür.

---

## 17. ADRES KEŞFEDİLEBİLİRLİĞİ — "sid çözüldü" ≠ "doğru alıcı"

### Üç ölçülmüş vaka, hepsi 24 saat içinde

| # | ne oldu | sonuç |
|---|---|---|
| 1 | URUN'ün REC-95 iş emri notu metninde *"OPS'a"* diyordu, sid olarak `ac03ce11` (ALTYAPI) yazılmıştı | **OPS'a hiç ulaşmadı** |
| 2 | OPS bir notu `venthub-hvac-6b`'ye (ALTYAPI) yazdı, URUN sandı — notun başında *"bu adres URUN penceresiyse"* yazıyordu | yanlış şeride düştü |
| 3 | #909 için **prod migration GO'su** yine ALTYAPI'ya düştü | onay taşıyan mesaj kayboldu |

Üçünde de araç **başarı** döndürdü. Hiçbirinde hata oluşmadı.

### İki ayrı kök sebep — ve ikisi ayrı ayrı kapanır

**(a) Adres KEŞFEDİLEMİYORDU.** OPS panoda claim tutmuyordu; sid'i panodan bulunamıyor,
**ezberden** yazılıyordu. Ezber bayatladı.
→ **Kapandı (2026-08-30):** OPS panoda `cb0467f1 → docs/DURUM-TAKIP.md` olarak görünüyor.
Gerekçe: **yazılı adres listesi bayatlar, canlı pano kaydı bayatlayamaz — kendini
tazeler.** Bu yüzden "adres listesi tut" seçeneği reddedildi.

**(b) Oturum ADLARI makine dönüşünde DEĞİŞİYOR — ve mesaj-adres uzayı pano-sid uzayından
AYRIDIR.** Ölçüldü: `venthub-hvac-b3` (URUN) **ulaşılamaz** hâle geldi, aynı anda pano
claim'i `4a8eaf9c` **tazeydi**. Yani biri tazelenirken öteki bayatlayabilir.

> **HÜKÜM:** Pano claim'i taze olsa bile **mesaj adresi ayrı bir uzaydır; ikisi AYRI AYRI
> doğrulanır.** Panoda gördüğün canlılık, gönderdiğin mesajın ulaştığını göstermez.

### Kural

1. **Makine dönüşü sonrası İLK `SendMessage`'tan ÖNCE `ListAgents` ZORUNLU.**
2. ⭐**`ListAgents` YETMEZ — ad↔şerit eşleşmesi İŞBAŞI NOTUNDAN teyit edilir.** Bu
   maddenin kaynağı bir öz-düzeltmedir: OPS `ListAgents` koşmuştu ama hangi adın hangi
   şerit olduğunu **varsaydı** ve yine yanlış şeride yazdı. Kuralın eksik yarısı buydu.
3. **Adres yanlışsa içerik AKTARILMAZ.** Geri alınamaz sınıfta (migration = prod yazımı)
   akran aktarımı onay yerine **geçmez**; yanlış adrese düşen bir GO, düştüğü şerit
   tarafından **taşınmaz** — yalnız *"teslimat kayboldu, kendi kanalından al"* denir.
   (Vaka 3 böyle kapatıldı.)

### Aracın yanıltan çıktısı — ve ailesi

`not birakildi → oturum ac03ce11 (kisaltmadan cozuldu)`

Bu satırın doğruladığı **tek** şey *"bu sid'i çözdüm"*dür. *"Bu sid OPS'tur"* kısmını
gönderen **varsaydı**; araç onu hiç doğrulamadı.

> **Başarılı teslimat, DOĞRU ALICI kanıtı değildir.**

Aynı ailenin bu depoda ölçülmüş öbür üyeleri:

- `exit 0` + *"talep alındı"* derken `--globs`'un sessizce düşmesi (§14).
- `is_active = true`'yu **görünürlük** kanıtı sanmak (canlı menüde 0 link, sitemap'te 0 kayıt).
- `"status": "SUCCESS"` derken gövdede `Başarılı: 0, Başarısız: 1` (companion üreteci).

Ortak biçim: **araç başarı döndürür, biz aracın doğrulamadığı bir cümleyi ona söyletiriz.**

**UYGULANDI (2026-08-31, aynı gün):** `note` çıktısı artık alıcının şerit adını basıyor —
`not bırakıldı → OPS [cb0467f1]`. Şerit bilinmiyorsa `şerit?` yazılır, sessiz geçilmez.
Kapı: `board-hedef-serit-adi.test.ts` (INV-BOARD-9), gerileme kolu eski biçimi yakalar.

---

## 18. İZİN-REDDİ OLAY GÜNLÜĞÜ — dalgalı ret bir şeridi SESSİZCE durdurur

### Ölçülmüş vaka (2026-08-31)

Bir sabahta üç **normalde serbest** eylem reddedildi — `CronCreate`, `gh pr merge`,
`npx vitest` — ve aynı komut **ikinci denemede geçti**. Yani ayar sorunu değil, **dalgalı
ret**. Asıl zarar sessizlikti: reddedilen `CronCreate` yüzünden bir şeridin mekanizma
üçlüsünün **cron ayağı hiç kurulamadı** ve bu yalnız o şeridin transkriptinde kaldı.

### ⭐İlk ölçüt YANLIŞ EVRENİ ölçtü — günlüğün tasarım gerekçesi budur

İlk denemede metin tarandı: `Permission to use ... has been denied`.

| ölçüt | bulduğu | kaçırdığı |
|---|---|---|
| metin taraması | **109 kayıt, hepsi `Bash`** | ⚠ aranan `CronCreate` reddini **tamamen** |

Sebep: o sınıfın metni bambaşka — `denied by the Claude Code auto mode classifier`. Metin
ölçütüyle kurulacak bir günlük **kör kapı** olurdu: sayı üretir, aranan sınıfı kaçırır.

**Doğru ölçüt YAPISALDIR:** transkript kaydında amaca özel bir alan var — **`toolDenialKind`**.
Metin eşleşmesi gerekmez, `settings.json`'a dokunmak gerekmez (izin/ayar sınırına hiç
girilmez).

### Dört tür AYNI ŞEY DEĞİLDİR

| tür | ne demek | anomali sayısına girer mi |
|---|---|---|
| `user-rejected` | **İNSAN** reddetti — bir KARAR, arıza değil | **hayır** |
| `permission-rule` | yazılı kural reddetti — beklenen davranış | **hayır** |
| `automode-blocked` | ⭐sınıflandırıcı reddetti — anomali adayı | **evet** |
| `automode-unavailable` | sınıflandırıcı ulaşılamadı — altyapı | **evet** |

İnsan kararını anomaliye katmak, günlüğü her gün öten bir alarma çevirir ve doğrudan
§15'in *"gürültü kapıyı körleştirmenin yavaş yoludur"* sınıfına düşer.

**Ölçülen dağılım (tüm geçmiş, 455 ret):** `permission-rule` 241 · `automode-blocked` 181 ·
`user-rejected` 27 · `automode-unavailable` 6 → **anomali adayı 187**.
Araç: `Bash` 144 · `Edit` 23 · `ScheduleWakeup` 11 · `SendMessage` 4 · `Agent` 2 ·
`CronCreate` 1 · `Monitor` 1.

### Araç adı ret kaydında YOKTUR

Ret kaydı yalnız sınıflandırıcının metnini taşır. Araç adı `sourceToolAssistantUUID`
üzerinden **çağıran assistant kaydına** gidilip `tool_use` bloğundan çözülür; assistant
kaydı retten önce geldiği için **tek ileri geçiş** yeter. Çözülemezse `?` yazılır,
**uydurulmaz**. (Doğrulandı: o sabahın dört reddi bu yolla `CronCreate` + 3× `Bash` çıktı —
şeridin beyanıyla birebir.)

### Kural — ritüel + mekanizma

1. **Normalde serbest bir iş reddedilirse: bir kez AYNEN yeniden dene.** Geçerse iş devam
   eder; kayıt zaten transkriptte durur.
2. **İkinci ret panoya gider** — ve özellikle *mekanizma kuran* bir eylem (Monitor, cron,
   claim) reddedildiyse **eksik kalan katman adıyla** bildirilir. Sessiz eksik mekanizma,
   şeridi sağır bırakır.
3. **Ölçüm:** `node scripts/board/izin-reddi-gunlugu.cjs olc [--gun ...|--tum]` (salt
   okuma) · `... bildir --sid X [--esik N]` (eşik aşılırsa panoya).
4. Kapı: `izin-reddi-gunlugu.test.ts` (INV-BOARD-10) — 8 kol; `user-rejected` ve
   `permission-rule`'ün anomali **sayılmadığını** ayrı ayrı kanıtlar.

### Adıyla yazılan iki sınır

⚠ **"Sonra geçti" BU KAYNAKTAN BİLİNEMEZ.** Transkript yalnız reddi kaydeder. Bu yüzden
tekrar deseni (aynı oturum + aynı araç, 10 dk içinde ≥2 ret) **ayrı** raporlanır ve
*"geçti"* diye **yorumlanmaz**. Günlük, kaynağın söylemediği bir şeyi söylemez.

⚠ **Transkripte yazılmayan ret görünmez.** Bu kapı bir örnekleme değil, kaydın kendisidir;
kayıt yoksa ölçüm de yoktur — *"ölçemedim ≠ olmadı"*.

### ⭐Bu işin kendi içinden çıkan ders

Ölçüm sırasında bir ara sonuç *"bugün bende 3 ret var"* dedi ve neredeyse doğru bir
beyanı **düzeltmek** üzereydim. Yapısal alanla bakınca o 3'ün, o gün **ret hakkında
yazdığım kendi metinlerime** takılan yanlış-pozitif olduğu çıktı; gerçek sayı 0'dı.
*"Ölçüm aracının kendisi ölçülür"* (`uretilmis-artefakt-standard.md`) kuralının canlı
örneği: **bozuk bir ölçüm, doğru bir beyanı bozmaya da yeter.**

---

## 19. KİMLİK "AÇILIŞ" KAYDIDIR, "SAHİPLİK" DEĞİL — ortak ağaç kimliksizdir

### Ölçülmüş kusur (2026-08-31)

`session-board.cjs` oturum kimliğini `<absolute-git-dir>/venthub-sid`e yazar. §9 bu dosyayı
"bu ağaç kimin şeridinde" sorusunun cevabı olarak kullanıyordu. İki şey ölçüldü:

1. **Kimlik, oturumun AÇILDIĞI ağacı işaretler; ÇALIŞTIĞI ağacı DEĞİL — ve hiç tazelenmez.**
   ALTYAPI bütün günü `vh-altyapi-scrubber`da çalıştı; o ağaçta kimlik dosyası **hiç yoktu**
   (worktree oturum ortasında yaratıldı, orada `SessionStart` hiç koşmadı). Kimlik dört
   **başka** ağacı işaretliyordu → denetim alakasız dört ağacı okudu, çalışılan ağacı okumadı.

2. **Ana dizinin kimliği YARIŞ hâlindedir.** Ana çalışma dizininde `--absolute-git-dir` ile
   `--git-common-dir` **aynı** yeri gösterir, ve üç şerit de ana dizinde açılıp resume olur.
   Kazananı **sıra** belirler: 30 Ağustos'ta ölü bir oturumun sid'iydi (`974d15cb`),
   31 Ağustos 10:30'da başka bir şeridin. Yani paylaşılan ağacın "sahibi" rastgeleydi.

⭐**"Ölü sid" özel bir hâl değildi, yarışın o anki sonucuydu.** İlk teşhis ("ana dizinde ölü
kimlik var") bir gün sonra ölçüldüğünde **değişmişti** — ve teşhisi zayıflatmadı, keskinleştirdi.

### Bedeli: aynı gün iki olay

| olay | mekanizma |
|---|---|
| ALTYAPI'nın ana dizindeki commit'siz işini **kendi denetçisi görmedi** | kimliği orada değildi; iş §16'nın `stash → pull → drop` adımıyla silinmeye bir adım kalmıştı |
| OPS'un denetçisi ana dizini **kazara** denetledi | kimliği hiçbir ağaçta bulamayıp cwd'ye düştü; alarmın zemini tasarım değil **yedek koldu** |

⚠ **Ölü/yabancı kimlik, kimliksizlikten KÖTÜDÜR:** okuyucuların fail-open kolunu **kapatır**,
denetim "sahibi var" sanıp hayalete atfeder.

### HÜKÜM

1. **Ortak/ana ağaca kimlik YAZILMAZ.** Ölçüt yapısaldır: `absolute-git-dir === git-common-dir`.
   Yazmayı kesen mekanizma **orada duran eski kaydı da siler** — yoksa kusur elle bir temizlik
   adımına bağlı kalır ("belge indi, iş bitmedi" sınıfı). `kimlik.onar()` da ortak ağaca yazmaz.
2. **Denetlenen ağaç kümesi bir BİRLEŞİMDİR:** kimlik ağaçları ∪ {cwd'nin ağacı} ∪ {ortak ana ağaç}.
   Süperküme olduğu için **kimse kör kalmaz**; hiçbir yere kimlik yazmadığı için **kimse
   başkasının kimliğini çalmaz**.
3. **Ortak ana ağaç KOŞULSUZ denetlenir** — Bash cwd'si oraya sessizce resetlenir (§9), ağaç
   paylaşılır, ve kimlik o ağaç için doğru cevabı **hiç veremez**.
4. **Ortak ağaçtaki kir ŞERİT İHLALİ GİBİ RAPORLANMAZ:** cümle atıf iddia etmez (*"SAHİBİ
   ÖLÇÜLMEDİ"*), `exit 2` ile **bloklamaz**, ama **sessiz de kalmaz** — oradaki commit'siz iş
   kimin olursa olsun kayıp riskidir.
5. **Bu kol claim'den BAĞIMSIZDIR.** §16'nın ön koşulu daha geniştir: *"companion olmayan tek
   kirli dosya varsa tazeleme yapılmaz"* — hiç kimsenin glob'una girmeyen dosya da onu tetikler.
   Böylece bu kol, §16'nın **yalnız tazeleme anında** ölçülen ön koşulunu **sürekli ölçülür**
   hâle getirir: yeni bir kural değil, var olan kuralın gözü.
6. **Üretilmiş artefaktlar dışarıdadır** (fail-closed: sınıf ölçülemezse **bildirilir**).
   Ortak ağaçta `post-commit` üreteci durmadan companion `.md` yazar; onları bildirmek kapıyı
   üç günde kör eder.
7. **E1 bloklanmaz** — ölçüldü: `kimlik.cjs` ASIL kanıtı `CLAUDE_CODE_SESSION_ID` env'inden alır
   (dosya yalnız **vekil**), ve o env Claude Code kabuğunda **doludur**. Ortak ağaçta kimlik
   "yok" olur, E1 fail-open + **görünür** uyarı verir — yanlış şerit adına karar vermekten iyidir.
8. ⭐**ORTAK-ANA BASKINDIR — `cwd` ve kimlik onu BASTIRAMAZ.** Bir ağaç ortak ana ağaçsa, kümeye
   başka kaynaklarla da girmiş olsa bile **ortak** sayılır. Madde 1–4'ün zorunlu sonucu: ana
   dizin hiçbir şeridin değilse, orada `cwd` bulunması **resetin artığıdır** (§9) ve kimlik
   bulunması **yarışın kazananıdır** — ikisi de "kim yazdı" sorusunu cevaplamaz.

### ⚠Madde 8, ÖLÇÜLMÜŞ BİR ÖLÜ DOĞUMUN DÜZELTMESİDİR

İlk uygulama ölçütü *"kaynak sayısı === 1 **ve** ortak-ana"* idi. Aynı gün ölçüldü ve
**kol fiilen hiç devreye girmiyordu**: Bash cwd'si ana dizine resetlendiği için ortak ağaç
neredeyse her turda `cwd` kaynağıyla **da** kümeye giriyor → sayı 2 → ayrı muamele kapalı.
Yani *"SAHİBİ ÖLÇÜLMEDİ"* raporu ve bloklamama davranışı **yazıldığı gün ölü doğmuştu**.

Kanıt kod okumasından değil **canlı taban dosyasından** geldi: ortak ağaç denetleniyordu ve
5 yol tabana girmişti, ama `cwd` orada olduğu için geçerli olan kol dikiş-yeri koluydu.

⚠**Kabul edilen bedel, adıyla:** ortak ağaçtaki GERÇEK bir şerit ihlali artık `exit 2` ile
bloklamaz. Bilerek: atfedemediğimiz bir kir için Bash'i durdurmak **yanlış hüküm** verir ve
alarmı körleştirir; yaptırım yolu kapalı değil — `lane-precommit` (E1) commit anında hâlâ
bloklar. Ortak ağaçta kaybedilen şey bloklama değil, **yanlış adrese yazılmış** bloklamadır.

⭐**DERS:** *"kolu yazdım ve kapı yeşil"* onun **çalıştığı** anlamına gelmez. Bir kolun devreye
girip girmediği, kapının değil **canlı çalışma verisinin** (burada: taban dosyası) sorusudur.
Ölü doğan kol, hiç yazılmamış koldan daha tehlikelidir: kayıt "korunuyor" der.

### Kapı

`e1-kimlik-kontrolu.test.ts` (10 kol) + `bash-write-audit-tree.test.ts` (13 kol).
**Altı sabotaj, altısı kırmızı** (her biri kurulduğu + sözdiziminin geçerli kaldığı
doğrulanarak): ortak-ana ağaç kümeye eklenmez · cwd ağacı eklenmez · ortak kolu claim'e
bağlanır · companion süzgeci sökülür · `onar()` koruması sökülür · `bagliWorktreeMi` alt-dize
aramasına döndürülür.

### ⭐Bu işin kendi içinden çıkan iki ders

1. **Yeni kapı eklemeden önce "bu olguyu ölçen katman ZATEN VAR MI" sorulur.** Bu iş sırasında
   bu soru **iki kez** atlandı: (a) `kimlik.cjs` (E1-v2) env'i asıl kanıt sayan çözümü 08-28'de
   zaten yazmıştı ama `bash-write-audit.cjs` ona **hiç bağlanmamıştı** — yeni mekanizma icat
   etmek yerine mevcut zincire bağlanmak doğru hamleydi. (b) "Genişleyen küme için yeni ağaç
   soğurma katmanı" yazıldı; **kapı üç koldan kırmızı verdi ve haklıydı** — katman hem bozuktu
   (taban `yollar: []` olabilir, o zaman *her şey* soğurulur) hem de **gereksizdi**: eski kirin
   doğru sınıflandırmasını **pencere ayrımı** zaten yapıyordu. Söküldü.
2. **Hiçbir kolun okumadığı taban alanı EKLENMEZ.** Soğurma katmanıyla gelen `agaclar` alanı
   geri alındı; okunmayan bir alan ileride "mekanizma var sanılan" ölü kayda dönüşür.

**Madde 8 kapısı:** iki sabotaj, ikisi kırmızı (sözdizimi geçerli kaldığı doğrulanarak) —
eski ölçüt geri konur (`size === 1`) → 3 kol kırmızı · `ortak-ana` etiketi hiç eklenmez →
5 kol kırmızı. Ayrıca **absans kanıtı biçim değiştirdi, zayıflamadı**: "KİMLİK YOK" kolunun
`exit 2` ölçütü ortak ağaç için geçersizleşti, yerine *"kirli dosya ADIYLA raporlanmış"*
kondu; `exit 2` biçimindeki kanıt ortak **olmayan** ağaç için ayrı bir kolda korunuyor.
---

## 20. ÇAKIŞIK PR'A HİÇ KAPI KOŞMAZ — ve ekranda "bekliyor"dan ayırt edilemez

### Ölçülmüş kusur (2026-08-31, İKİ bağımsız vaka)

| vaka | ölçüm |
|---|---|
| **#917** (URUN) | 07:29'da açıldı, **09:50'ye kadar 2 sa 21 dk sıfır** Actions koşumu (iki damgayla ölçüldü); yalnız Vercel kolları düştü |
| **#920** (ALTYAPI) | açılış + `close/reopen` + **iki** `push` (=synchronize) → **üç tetikleyici olayda sıfır** koşum |

Aynı saatlerde **başka dallarda** `pull_request` koşumları normal düştü; `actions/permissions`
`enabled=true`, workflow'lar `active`, kuyruk **0**. Yani Actions sağlıklıydı — sorun **dala özel**.

### Zincir — tek adımda çıkan teşhis

```
PR cakisik  ->  mergeable_state = dirty  VE  merge_commit_sha = NULL
            ->  GitHub refs/pull/<N>/merge referansini URETMIYOR
            ->  merge-ref'i checkout eden pull_request iskaklari HIC PLANLANMIYOR
            ->  rollup'ta yalniz Vercel gorunur; GH Actions kollari HIC YOK
```

**AYIRT EDİCİ TEST (ikisi de koştu):** `workflow_dispatch` ile aynı workflow elle tetiklenir.
Actions çalışıyorsa koşum başlar **ama** `Checkout` adımında düşer — ve hata mekanizmayı adıyla
söyler:

```
fatal: couldn't find remote ref refs/pull/920/merge     (uc deneme, ikisi de ayni)
```

**Karşı-kanıt hipotezi destekliyor:** aynı gün çakışık olan başka bir PR'ın **11 koşumu vardı** —
çünkü o **yeşil doğmuştu**, çakışma **sonra** oluştu; koşumlar çakışmadan önce planlanmıştı.
Yani belirleyici olan "şu an çakışık mı" değil, **"doğduğunda çakışık mıydı"**.

### ⚠NİÇİN TEHLİKELİ — sessizliğin en pahalı biçimi

Boş bir rollup **yeşil değildir**, ama ekranda yeşilden ayırt edilemez: *"kapılar henüz gelmedi"*
ile *"kapılar KOŞAMAZ"* aynı görünür. Bu hâlde self-merge yapan biri **sıfır kapıyla** merge eder.
Şeritlerin self-merge yetkisi (2026-08-23) tam olarak "kapılar yeşil" ön koşuluna dayanıyordu.

### HÜKÜM

1. **"Kapılar koşmuyor" gözlemi görüldüğünde İLK ölçülecek şey `mergeable` /
   `mergeStateStatus`tur.** Teşhis oradan tek adımda çıkar (URUN'un önerisi, iki vakada doğrulandı).
2. **Self-merge ön koşulu İKİ AYRI ölçüm:**
   - (a) **yapısal:** `mergeable_state != dirty` **ve** `merge_commit_sha != null`
   - (b) **varlık:** **en az bir GH Actions kolu görüldü** — Vercel kolları tek başına YETMEZ
   Destekleyici gösterge: *PR açılışından bu yana X dk geçti ve hiç Actions kolu görünmedi.*
   Süre önemlidir çünkü "henüz başlamadı" açıklamasını çürüten şey **uzunluktur** (2 sa 21 dk).
3. **Reçete (iki vakada da çalıştı):** `origin/master` merge → çakışan **üretilmiş artefaktları
   MASTER sürümüyle** kapat (elle birleştirme AXIOM 3 ihlali) → merge commit → `orion doc build
   --force-sync` → **iki tarafı pozitif sayımla** doğrula → commit → push. Ardından
   `merge_commit_sha` hesaplanır ve koşumlar **saniyeler içinde** başlar (25 sn / ~1 dk ölçüldü).
4. **`workflow_dispatch` bir ÇÖZÜM DEĞİL, TEŞHİS ARACIDIR.** Merge-ref yokken zaten `Checkout`ta
   düşer; ayrıca `ci` adına eşlenen bir dispatch koşumu branch protection'ı **açar** (ci.yml'in
   kendi notu) — yani onu "kapıyı geçmek" için kullanmak sıfır kapıyla merge etmenin kapısıdır.

### Taban-tazeleme sürtünmesinin gerekçesi YÜKSELDİ

Bu kalem daha önce "her rebase'de üretilmiş artefakt çakışıyor, can sıkıcı" diye kayıtlıydı.
Ölçüm gerekçeyi değiştiriyor: sürtünme **kozmetik değil KAPI KAYBI**. Çakışık kalan bir dal
yalnız zahmet üretmiyor, o dalın **bütün kapılarını sessizce kapatıyor**.

### ⭐Dört ders, adıyla

1. **"Bunu ben mi bozdum" açıklaması da bir HİPOTEZDİR** ve tekrar üretilebilirlikle sınanır.
   URUN ilk kırmızıdan sonra *"sebep benim yaptığım yarış — koşum sürerken PR'ı kapatıp açtım"*
   dedi ve bunu Recep'e iletti; **ikinci koşum hiçbir şeye dokunmadan aynı hatayı verdi** ve
   açıklamayı çürüttü. Kendi kusuruna atlamak da ölçülmemiş teşhistir.
2. **"Yerel test yeşil" ÜRETİM DERLEMESİ için kanıt değildir.** Aynı gün yerel **952/952** yeşilken
   Vercel derlemesi kırmızı verdi: yeni bir test kolundaki çıplak `require()`
   (`@typescript-eslint/no-require-imports`) — çünkü `pnpm run build` lint'i `src/` üzerinde
   **koşar**. `tsc --noEmit` **temizdi** (kod 0): tip kapısı bu sınıfı **görmez**, ayırt eden
   yalnız lint. `vitest` modülü **çalıştırır**, lint kaynağı **denetler** — iki ayrı ölçüt.
   Push öncesi kontrol listesine `eslint` girer.
3. ⭐**Ritüelin ÖLÇÜM KAYNAĞI adıyla yazılır: `merge_commit_sha` REST'ten okunur.**
   Yukarıdaki reçete "merge-ref var mı" diye sormayı söylüyordu ama **nereden** okunacağını
   söylemiyordu; boşluk gerçek: `gh pr view --json mergeCommit` **AÇIK bir PR'da HER ZAMAN
   `null` döner**. O alana bakan biri her açık PR'ı "çakışık" sanır ve ritüel ayırt etmeyi
   bırakır. Geçerli tek ölçüm **REST**: `gh api repos/{owner}/{repo}/pulls/{n}` →
   `merge_commit_sha` + `mergeable_state`. (Ayırt etmeyen gösterge ölçüm değildir.)
4. ⭐**Ortak ağaca dokunan git komutu `-C <yol>` ile yazılır — istisnasız.**
   §19 kimlik düzeyinde "ortak ana baskındır" diyor; bunun **komut düzeyi** karşılığı budur.
   Ölçülmüş bedel: bir şerit oturumunun kabuğu sessizce ana dizine resetlendi ve `rebase`
   **ana dizinde master'a** koştu. `cwd`'ye güvenen her komut bu kazayı bekliyor demektir;
   `-C` yazmak bir üslup tercihi değil, kazanın önündeki tek engel.

---

## 21. KABUL EDİLMİŞ EKSİK SESSİZ OLAMAZ — companion üreteci vakası (REC-67)

### Karar önce yazılır: taşıyıcı KAPALI, bu Recep'in kararı

Companion üreteci **2026-08-28**'de durdu. Alternatif taşıyıcı (Haiku, `ORION_TASIYICI=cli`)
**hazır ve testli**, **yeni API anahtarı gerektirmiyor** — ama `claude` CLI üzerinden Recep'in
**aboneliğini** harcıyor ve kodun kendi notu kararı ona veriyor
(`scripts/companion_supurme.py`: *"VARSAYILAN KAPALI: haiku Recep'in aboneliğini harcar, açma
kararı ONUN"*). Kendisine maliyetle birlikte sunuldu (dosya başına 4 LLM pası; birikmiş 59 dosya
≈ 236 çağrı; sonrası kaynak-dosyalı commit başına ≈ 4) ve **"kapalı kalsın"** dedi.

⭐**Sonuç: companion bayatlığı ARIZA DEĞİL, KABUL EDİLMİŞ EKSİK.** Bir peer'ın *"Haiku denemesi
kararlıydı"* aktarımı onay yerine **konmadı** — akran aktarımı onay değildir, hele abonelik
harcayan bir kararda. (08-25 tarihli *"Haiku ile deneyeceğiz bu kesin"* kaydı bu kararla
**geçersizleşti**; eski satır kanıt sayılmaz.)

### Kök sebep (doğrudan kanıt: `doc batch` elle koşuldu)

```
[KEYPOOL] TASIYICI YOK — ANAHTAR HAVUZU BOS
  baglam : son gecerli anahtar 401/403 nedeniyle elendi
  uc     : https://token-plan-sgp.xiaomimimo.com/v1   model: mimo-v2.5-pro
Basarili: 0, Basarisiz: 1        (companion md mtime DEGISMEDI)
```
Aracın kendi cümlesi: *"Bu bir kapasite ya da kalite sorunu DEĞİL: yapılandırma sorunu."*

**Kırılma günü ölçüldü:** companion bayatlığı, kaynağın değiştiği güne göre — 08-27'ye kadar
**%0**, sonra **%69 / %100 / %64 / %65**.

⚠**"865 çiftin 806'sı taze (%93)" RAKAMI ÜRETECİN ÇALIŞTIĞININ KANITI DEĞİLDİR.** Bayatların
`.md` commit mesajları *"T165-VH Faz A: 135 companion"*, *"163 companion tazelendi"* — yani
**toplu elle kampanyalar**; ölçüm günündeki "taze"lerin bir kısmı da elle koşulan `doc build`.
Doğru cümle: **üreteç 08-28'den beri koşmuyor, tazeliği kampanyalar taşıyordu.** Bir oranın
yüksek olması, onu üreten mekanizmanın çalıştığını göstermez.

### ⭐ÜÇ BAĞIMSIZ GÖRÜNÜRLÜK KUSURU — "niçin üç gün fark edilmedi"in cevabı

| # | kusur | sonucu |
|---|---|---|
| 1 | `doc batch` **çıkış kodu 0** döner ve `"status": "SUCCESS"` basar, aynı çıktıda `Basarisiz: 1` yazarken | çağıran, çıkış kodundan arızayı **göremez** |
| 2 | `orion-doc.log` her commit'te **sıfırlanıyordu** (`: > log`) | başarısız commit'in kanıtı **bir sonraki commit** tarafından yok edilir |
| 3 | ⭐bu iş için **yazılmış** defter + *"N. commit"* sayacı yalnız `run_hook` yolunda; `post-commit` **`batch`** çağırıyor | koruma **hiç koşmadı** — defter dosyası hiçbir ağaçta yoktu |

**(3) BU SINIFIN DÖRDÜNCÜ VAKASIDIR** (hepsi 2026-08-31): `kimlik.cjs`'in `bash-write-audit`'e
bağlanmamış olması · soğurma katmanının gereksiz yazılması · ortak-ana kolunun ölü doğması ·
ve bu. **Sınıfın adı: "mekanizma var, çağrı yoluna bağlanmamış."** Ortak deseni: bir geçiş
yapılır (`run-hook` → `batch`, `size===1` → baskınlık, eski kol → yeni kol) ve **koruma eski
yolda kalır**. Karşı-tedbir: her geçişte *"bu yolda koşan koruma neydi, yeni yola taşındı mı"*
sorulur; ve koruma **kaynağı taranarak değil KOŞTURULARAK** doğrulanır (aşağıdaki derse bkz.).

### HÜKÜM

1. **Kabul edilmiş bir eksiğin tek şartı GÖRÜNÜR olmasıdır.** "Arıza değil, karar" demek onu
   sessizleştirme yetkisi vermez.
2. **Başarısızlık ÇIKIŞ KODUNDAN değil ÇIKTIDAN sınıflanır** — çağırdığımız araç dürüst bir
   çıkış kodu vermiyorsa, ölçüt onun **metnidir**. Sınıflandırma **FAIL-CLOSED**: boş çıktı ve
   tanınmayan çıktı **başarı sayılmaz** (`olculemedi`).
3. **Kanıt logu KIRPILMAZ.** Her koşum başlıkla eklenir; dosya son 400 satıra budanır.
   Kırpılan log, bir sonraki commit'i olayın tanığı değil **katili** yapar.
4. **Kalıcı defter eklemeli tutulur** (`orion-belgesiz.jsonl`, `{ts, dosya, sebep}`) ve
   **orion'un şemasıyla aynıdır, bilerek**: farklı bir ad seçmek, orion'un ölü yolu bir gün
   canlanırsa sayacı ikiye bölerdi.
5. **Sayaç OTURUM AÇILIŞINDA yüzeye çıkar.** Kaydı `post-commit` yazar ama o **arka planda
   koşan bir alt kabuk** — çıktısı pratikte görülmez (ölçüldü: üç gün görülmedi). Bir ajana
   gerçekten ulaşan kanal SessionStart'tır.
6. **Sayı değil EĞİLİM izlenir.** Sayaç durmadan büyüyorsa kabul edilmiş eksik **büyüyen borca**
   dönüşmüştür ve karar **yeniden Recep'e** gider. Hiçbir oturum taşıyıcıyı kendi başına açmaz.

### Kapı

`companion-defter.test.ts` (11 kol) — yarısı SINIFLANDIRMA, yarısı **BAĞLANMIŞLIK**.
**Yedi sabotaj, yedisi kırmızı** (her biri kurulduğu **ve** sözdiziminin geçerli kaldığı
doğrulanarak; bir tur ilk denemede sözdizimini bozdu ve **kanıt sayılmadı**, geçerli hâliyle
yeniden koşuldu): sınıflandırma fail-open olur · boş çıktı başarı sayılır · log yine kırpılır ·
defter çağrılmaz (ölü yol) · sayaç enjekte edilmez · bozuk satır sessizce yutulur ·
`main()` koruması sökülür.

### ⭐Bu işin kendi içinden çıkan ders: METİN TARAMASI SABOTAJI YEŞİL GEÇTİ

`session-board` kolunun ilk hâli kancanın **kaynağında** `/COMPANION BELGESIZ/` arıyordu.
Sabotaj dizeyi ölü bir ifadenin içine taşıdı ve **kol yeşil kaldı**: metin duruyordu, davranış
yoktu. Kol **kancayı koşturacak** biçimde yeniden yazıldı (geçici depo + geçici pano + defterli
git dizini; üretilen `additionalContext` ölçülür).

⭐**Ve o davranış kolu, aynı turda GERÇEK bir sözleşme bugu yakaladı** — üstelik benim yeni
yazdığım kodda: `companion-defter.cjs` içinde `main()` koşulsuz çağrılıyordu, dolayısıyla
`session-board` modülü `require` edince `main()` de koştu ve **stdout'a** yazdı; SessionStart
kancasının `{hookSpecificOutput:…}` JSON sözleşmesi bozuldu ve **bağlam enjeksiyonu bütünüyle
kaybolacaktı**, sessizce. Onarım: `if (require.main === module) main()`.

**Ders iki cümle:** kaynak tarayan bir kol **varlık** ölçer, **davranış** ölçmez — ve
sözleşme bozan hatalar tam olarak davranış katmanında yaşar. Kütüphane olarak `require`
edilebilen her betik **yan etkisiz** olmalıdır.

### ⭐Kardeş vaka (URUN, 2026-09-01): KENDİ REFAKTÖRÜN KENDİ KAPINI KÖR EDEBİLİR

Aynı sınıf, başka şeritte, aynı gün. URUN'un yeni vaat-bütünlüğü kapısının **ilk sürümü
sabotajda YEŞİL kaldı**. Sebep kolun zayıflığı değildi: **aynı PR'daki bir refaktör**
literal dizeleri `t(değişken)` çağrısına çevirdi, ve kapının toplayıcısı dizeyi **çağrıdan**
okuduğu için görecek bir şey kalmadı. Düzeltme: toplayıcı dizeyi çağrıdan değil **dosyadan**
alır.

**Hüküm:** bir kapı, koruduğu kodun **kendi PR'ındaki değişimine** karşı da ölçülür. Kapıyı
ve onun koruduğu kodu aynı PR'da değiştiriyorsan, sabotajı **refaktör sonrası** hale karşı
kur — refaktör öncesi hale karşı kurulmuş sabotaj, artık var olmayan bir kodu sınar.
Ve daha genel olarak: **sabotaj testi bir ritüel değil, kör-nokta bulucudur**; yeşil kalan
her sabotaj ya kapıda ya da fikstürde adı konması gereken bir boşluk gösterir (bu belgede
aynı gün üç kez: metin taraması, koşulmayan dal, fikstürün üretmediği biçim varyantı).

### Adıyla bırakılan iki kalem (bu şeritte DEĞİL)

Aşağıdakiler ORION deposunda ve bu şeridin ölçülmüş claim'i dışında; sahibine iletildi:
1. `doc batch` **çıkış kodu dürüstsüzlüğü** — 0 döner ve `SUCCESS` basar, `Basarisiz > 0` iken.
   Her çağıran bundan yanılır; venthub tarafındaki çözüm bir **etrafından dolaşmadır**, kök fix değil.
2. `orion-belgesiz.jsonl` defteri ve sayacı **yalnız `run_hook`**'ta (`doc.py:654, 777`),
   `batch` gövdesinde sıfır referans — koruma **ölü yolda**.

---

## 22. ÜRETİLMİŞ ARTEFAKT ÇAKIŞMASI: TEK KOMUT, SESSİZ ÇÖZÜM YOK (`taban-tazele.cjs`)

### Ölçülmüş sürtünme (2026-08-31 / 09-01)

`origin/master` son 20 commit'i sayıldı: **16'sı** ilan edilmiş bir üretilmiş artefakta
dokunuyor (4 master `.md` + `docs/artefakt_manifest.json`). Geride kalmış bir dalın taban
tazelemesinde çakışma olasılığı pratikte **%80** ve çakışan dosyaların **%100'ü** artefakt.
§20 ile birleşince bedel kozmetik değil: çakışık kalan dal **bütün kapılarını** kaybediyor.
⚠Ölçüt düzeltmesi: "son 100 commit'te kaç kez" metriği **oran değil** (`-n 100` bir sınırdır);
dayanak alınan sağlam sayı **16/20**.

### ⛔`.gitattributes merge=ours` REDDEDİLDİ — gerekçe adıyla yazılıdır

Bu, akla ilk gelen çözüm ve **denendi** (git 2.49.0, izole depo): sürücü tanımlıyken çakışma
yok/dalın sürümü alınır, sürücü tanımsızken bugünkü davranışın aynısı (zararsız geri düşüş).
Yine de reddedildi:

1. ⭐**INV-DOC-4b'nin KÖR NOKTASI ölçüldü.** `merge=ours` master'ın yeni artefakt içeriğini
   sessizce atar. Kapı bunu çoğu halde kırmızı yapar (kaynak blob SHA ↔ manifest kaydı) **ama**
   master'ın artefaktı yalnız **DAMGA** yüzünden değiştiyse kaynak SHA'ları eşleşmeye devam eder
   → kapı **YEŞİL** kalır ve geri alma görünmez. Zararı küçük, **sessizliği** kabul edilemez.
2. **Sürücü `.git/config`'te yaşar, commit EDİLEMEZ** → GitHub tarafı onu hiç koşmaz. Yani
   §20'nin "çakışık PR'a hiç kapı koşmaz" problemini **çözmez**; yalnız yerel merge'i kolaylaştırır.
3. Kalan tek koruma INV-DOC-4b olurdu — **tek katmanlı** koruma, ve unutulan adım tam da
   AXIOM 7'nin ikinci turu. Gelecekte A'yı isteyen bu üç maddeyi çürütmek zorundadır.

### HÜKÜM

1. **Taban tazeleme TEK KOMUTTUR:** `node scripts/hijyen/taban-tazele.cjs --agac <ağaç>`.
   Merge + ilan edilmiş artefaktlarda çözüm + **AXIOM 7 ikinci turu** + INV-DOC-4b aynı
   komutun içindedir. Unutulacak adım bırakılmaz; "adımı hatırla" bir mekanizma değildir.
2. **İlan listesi MANİFESTTEN okunur.** Gömülü liste manifest büyüdüğünde sessizce eksik kalır
   ve ilan dışı bir yolu "artefakt" sayarak otomatik çözer. Manifest kaydında `yol` alanı
   **zorunlu**; `ad`'dan yol türetmek (`'docs/' + ad`) yasak (alan adı birimini taahhüt eder).
3. **İLAN DIŞI tek bir yolda bile çakışma varsa DURULUR**, merge yarım bırakılır, karar insana
   kalır. "Çoğu artefakttı" gerekçesiyle devam etmek sessiz kaybın kapısıdır.
4. **Yeniden üretim yalnız ilan edilmiş artefaktları commit'ler.** Başka bir yol değiştiyse
   raporlanır, commit **edilmez** — şerit claim'inin dışına izinsiz çıkılmaz.
5. **ÇIKIŞ KODU DÜRÜSTTÜR:** `0` yalnız merge + üretim + kapı üçü de tamamsa. Kapı koşmadıysa
   `1`, üretim/kapı başarısızsa `3`. Ölçülemeyen adım **"geçti" sayılmaz**.
6. **Ağaç kirliyse hiç başlanmaz** (merge kirli ağaçta iş kaybettirir) — **tek istisna
   `docs/artefakt-ilan-istisnalari.json`'un İLAN ETTİĞİ yollardır.** Gerekçe ölçüldü:
   `post-commit` her commit'ten **sonra** `docs/system_tree.md`'yi yeniden üretir ve damgası
   değiştiği için ağaç sürekli kirli kalır — yani "temiz ağaç" önkoşulu **kendi kancamız
   yüzünden** asla sağlanmaz ve araç hiç başlamaz. Tolere edilen liste **gömülü değil ilan
   dosyasından** okunur (liste değişince araç kendiliğinden hizalanır) ve ilan dosyası
   okunamaz/bozuksa **hiçbir şey tolere edilmez** — fail-closed. Bu yollar üretim turunda da
   commit **edilmez**, "beklenen istisna" diye ayrıca raporlanır.
   ⭐**Tolere etmek YETMEZ — git'in kendisi de reddeder.** İlk sürüm bu yolları yalnız
   **kendi** önkoşulunda tolere ediyordu; git yine de *"Your local changes to the following
   files would be overwritten by merge"* diyip merge'i reddetti. Yani kendi kapımı açıp
   **git'in kapısını görmemişim** — bir önkoşulu kaldırmak, aynı şeyi kontrol eden ikinci bir
   mekanizmayı kaldırmaz. Doğrusu: merge'den önce tolere edilen yolların yerel değişikliği
   `git checkout --` ile **atılır** (tanım gereği üretilmiş ve yeniden üretilebilir, içerik
   kaybı yok) ve **sessizce değil** — ne atıldığı tek tek basılır.
7. ⭐**YARDIM BAYRAĞI YAN ETKİSİZDİR.** `--help` / `-h`, hiçbir git komutu koşturmadan yardımı
   basar ve çıkar. Kusur sahada bulundu (URUN, 2026-09-01): ilk sürüm `--help` verildiğinde
   yardım basmak yerine **doğrudan merge'i koşuyordu**. Bu, "`require` edilen betik yan
   etkisiz olmalı" ilkesinin **bayrak hâli**: kullanıcıya *"bu ne yapıyor"* diye sorma imkânı
   tanıyan bir bayrak, sormanın bedeli olarak işi yapıyorsa soru sorulamaz hâle gelir — ve
   soruyu soran kişi genellikle tam da işin yapılmasını istemeyen kişidir.

### Kapı

`src/__tests__/conformance/taban-tazele.test.ts` — **24 kol**, çoğu **gerçek depoda gerçek
merge** koşturur (metin taraması değil davranış). Sabotaj turu: **11 sabotaj, 11'i de doğru
sebeple kırmızı**; her biri "hedef dize tek kez bulundu + sözdizimi geçerli + hedeflenen kol
düştü" üçlüsüyle geçerli sayıldı. Kollar **iki ortamda** ayrı ayrı yeşil ölçüldü: orion kurulu
olan (yerel) ve orion **kurulu olmayan** (CI taklidi) — aşağıdaki 4. ders bunun niçin
gerektiğini anlatıyor. Tolerans kolu **ayırt edici çift** olarak kuruldu: aynı kirlilik, ilan
edilmişken geçer, ilan edilmemişken **durdurur** — tek fark ilan dosyasının varlığı.

### ⭐Bu işin kendi içinden çıkan dört ders

1. ⭐**Sabotaj YEŞİL geçtiyse ilk soru "kapı kör mü" DEĞİL, "o dal koşuldu mu"dur.**
   Çıkış kodunu bozan sabotaj fark edilmedi. Sebep kapının körlüğü değildi: fikstür
   deposunda `doc build` **başarıyla koşuyordu**, dolayısıyla "üretim başarısız" dalına hiç
   girilmiyordu. Ölçülmeyen dal, yazılmamış dal kadar korumasızdır — çözüm kolu güçlendirmek
   değil, **başarısızlığı üretilebilir kılmak** oldu (`TABAN_TAZELE_PYTHON` adı konmuş dikişi).
2. ⭐**Windows'ta `npx`'i `execFileSync` ile çağırmak komutu HİÇ koşmaz.** `npx` bir `.cmd`
   sarmalayıcısıdır; kabuk olmadan çalıştırılamaz, çıktısı boş gelir ve sonuç **"kapı kırmızı"**
   diye okunur. Bir tur boyunca taban çizgisini kırmızı sandım; ayırt eden ölçüt çıktının
   **boş** olmasıydı. Doğrusu yorumlayıcıyı doğrudan çağırmak:
   `node node_modules/vitest/vitest.mjs`. (MSYS yol çevirisiyle aynı sınıf: araç sessizce
   yanlış cevap üretiyor ve ölçüm yaptığını sanırsın.)
   ⭐**Aynı sınıfın ikinci vakası, aynı gün: `jq` bu makinede KURULU DEĞİL.** PR kapılarını
   izlemek için kurduğum gözcü `jq` kullanıyordu; her çağrı sessizce başarısız oldu, döngü 45
   dakika boyunca hiçbir şey basmadan uyudu ve "çıktı üretmeden bitti" diye kapandı. Yani
   **izlediğimi sandığım şey hiç izlenmiyordu.** Ölçüldü: depoda `jq` yalnız iki CI
   workflow'unda geçiyor (koşucuda kurulu, sorun yok); **yerel** betiklerin hiçbirinde yok —
   yani risk kalıcı bir kusur değil, **o anda yazılan geçici betiklerde**. Hüküm: yerelde
   koşacak bir ölçüm betiği yazarken kullandığın aracın **varlığını ölç** (`command -v`), ya
   da `node`/`awk` gibi zaten kanıtlanmış olanla yaz. Sessiz gözcü, gözcü yokluğundan daha
   kötüdür: yokluğu bilirsin, sessizliği bilmezsin.
   ⭐**`gh` sorgularında boru-`jq` yerine `gh`'nin KENDİ `--jq` bayrağını kullan** (URUN'un
   eklemesi, bu oturumda `gh api --jq` ile ölçüldü: jq kurulu olmadan **çalışıyor**, çünkü
   `gh` jq'yu içinde taşır). Yani doğru cevap "jq kullanma" değil, "**dış** jq'ya bağlanma".
3. ⭐**FİKSTÜR YEŞİLDİ, GERÇEK AĞAÇ BUGU BULDU: `git status --porcelain` çıktısı
   `trim()` EDİLEMEZ.** Porcelain satırı **sütun duyarlıdır** (`XY<boşluk><yol>`), ve trim
   **ilk satırın baştaki boşluğunu** yer: ` M docs/x` → `M docs/x` → `slice(3)` → `ocs/x`.
   Sonuç sessiz: yol ilan listesiyle hiçbir zaman eşleşmiyor, değişen artefakt **fark
   edilmiyor ve commit edilmiyor**. 17 kol yeşilken bu kusur duruyordu — çünkü fikstürdeki
   satırlar hep `??` ile başlıyordu (üç karakter, boşluksuz) ve kol asla ` M` biçimini
   görmüyordu. **Ders:** fikstür bir biçimin YALNIZ BİR varyantını üretiyorsa, o biçimin
   diğer varyantı test edilmemiştir; ve otomasyonu **gerçek ağaçta bir kez koşturmak**
   fikstürün göremediğini gösterir. Kusur bulunduktan sonra hem saf ayrıştırma kolu hem
   davranış kolu eklendi ve sabotajla (trim'i geri koymak) düşürüldüğü ölçüldü.
   ⚠Not: bu kolu yazarken **ölçütü de bir kez yanlış kurdum** — `not.toMatch(/ocs\/...)`
   doğru çıktıda da düşer, çünkü `docs/...` o dizeyi içerir. Doğru ölçüt satır başına
   bağlıdır (`/^\s*ocs\//m`). Ayırt etmeyen ölçüt, ölçüm değildir.
4. ⭐⭐**ÖNKOŞULU ORTAMA BAĞLI BIRAKAN KOL, O ORTAMDA BAŞKA BİR ŞEYİ ÖLÇER.** "Kapı koşmadıysa
   çıkış 1'dir" kolu yerelde 18/18 yeşilken **CI'da düştü**: `expected 3 to be 1`. Sebep kolun
   yanlışlığı değil, **sessiz bir önkoşuldu** — kol "derleme başarılı olur" varsayıyordu,
   yerelde orion kurulu olduğu için bu doğruydu, **koşucuda orion yok** olduğu için orada
   derleme başarısız oluyor ve kod 3 dönüyordu. Yani aynı kol iki ortamda **iki farklı şeyi**
   ölçüyordu ve hangisini ölçtüğü hiçbir yerde yazılı değildi.
   **Hüküm:** bir kolun ölçtüğü dal, kolun kendisi tarafından **üretilebilir** olmalıdır; dış
   kuruluma bağlı bırakılamaz. Onarım: derleme komutunun tamamı ezilebilir bir dikişe alındı
   (`TABAN_TAZELE_BUILD_CMD`, JSON dizi, geçersizse fail-closed hata basar) ve iki dal da
   deterministik hale getirildi — "başarılı derleme" hiçbir şey yapmayan bir çağrıya, "başarısız
   derleme" var olmayan bir çalıştırılabilire sabitlendi. Sonuç iki ortamda **ayrı ayrı**
   ölçüldü. Bu, 2. dersin kardeşi: orada fikstür biçimin bir varyantını üretmiyordu, burada
   **ortam** dalın birini üretmiyordu; ikisinde de eksik olan şey **üretilebilirlik**.


---

## 23. YEDEKLİLİK SAYIYLA DEĞİL **TÜRLE** ÖLÇÜLÜR — ve "duyuyor" sütunu duymayı ölçmüyordu

**Ölçülmüş vaka (2026-09-01, ALTYAPI, 62 dakika kayıp):** compact sonrası şerit boşta kaldı,
hiçbir bildirim ulaşmadı, **Recep uyandırdı**. Aynı anda `yoklama` çıktısı şeridi
`GOZCU CANLI` gösteriyordu ve bu etiket **yanlış değildi** — gözcü imleci gerçekten 14 saniye
öncesine aitti. Uyandıktan iki dakika sonra gözcü, prob jetonunu (`PROB-ac03-H1XPZJ`) konuşmaya
**gerçekten teslim etti**. Yani şerit sağır değildi ve pano da yalan söylemiyordu.

O halde 62 dakika neden geçti? Katmanların **türü** yüzünden:

| katman | durumu | **konuşmayı başlatabilir mi?** |
|---|---|---|
| gözcü (Monitor) | canlı, tarıyor, teslim ediyor | **HAYIR** — panoya biri yazmadıkça susar |
| akran mesajı | kanal sağlam | **HAYIR** — akran meşguldü, kimse yazmadı |
| `ScheduleWakeup` | kurulu değil | (yalnız `/loop` dinamik modunda var) |
| cron (`fafdbf68`, `9,29,49`) | `CronList`'te **kayıtlı** | **EVET — ama dört yuva geçti, sıfır teslimat** |

#### CRON: KAYITLI ≠ TESLİM EDİYOR — iki oturumda ölçüldü

İlk teşhiste "cron boştaki oturuma teslim etmiyor olabilir" diye bir hipotez kurulmuştu. Aynı
gün **iki bağımsız ölçüm** onu çürüttü:

| oturum | yuva | oturumun hâli | teslimat |
|---|---|---|---|
| ALTYAPI (`fafdbf68`) | 14:09 | **AKTİF** (konformans koşuyordu) | **0** |
| OPS/lider (`f6f6dfe5`) | 14:19 | **AKTİF** (akran mesajı işliyordu) | **0** |

Her iki şeritte cron **gün boyu** hiç tetiklenmedi ve `CronList` ikisini de "kayıtlı" göstermeye
devam etti. **HÜKÜM: cron kendiliğinden-başlayan katman olarak GÜVENİLEMEZ.** Kayıt, teslimatın
kanıtı değildir; diskten görülemeyen bir katman ölçülemez ve **ölçülemeyen katman yedeklilik
sayılmaz**. `mechanism-setup.cjs dogrula` bunu baştan doğru adlandırıyordu
(`CRON: BEYAN — bu bir ÖLÇÜM DEĞİLDİR`); kusur cetvelde değil, o beyanı yedeklilik sayan
tarafta oldu.

Arızanın kökü (tur-arasına sıkışma mı, baştan bozukluk mu) **operasyonel olarak ikincildir**:
her iki hâlde de sonuç aynı — kendiliğinden uyanmayı cron'a bağlayan bir şerit, sessizce durur.
Bu yüzden HÜKÜM 2 (akran katmanı) opsiyonel bir konfor değil, **tek kalan** aktif katmandır.
Karşılıklı sözleşme yazıya geçti: parka giren şerit lidere tek satır bırakır ("parka giriyorum,
beklediğim koşul: X"); lider o koşulu her turunun kontrol listesine alır.

### HÜKÜM 1 — tepkisel katman sessizliği kıramaz

"Üçlü yedeklilik" sandığımız şey **1 aktif + 2 tepkisel** katmandı. Tepkisel katman, kimsenin
yol açmadığı bir sessizliği **tanım gereği** kıramaz: sessizlik zaten "kimse yazmıyor" hâlinin
adıdır. Tek aktif katman sessizce düştüğünde geriye hiçbir şey kalmaz ve pano bunu **yeşil**
gösterir, çünkü kalan iki katman gerçekten sağlamdır.

**Yedeklilik sayılırken katman sayısı değil, kaç tanesinin konuşmayı BAŞLATABİLDİĞİ sorulur.**
Ofsetli üç cron zamanlama çakışmasına karşı korur; **ortak-kipli** arızaya karşı korumaz.
Compact tam olarak ortak-kipli olaydır: tek seferde bütün oturum-bağlı katmanları aynı anda
etkiler.

### HÜKÜM 2 — tek gerçekten bağımsız aktif katman BAŞKA BİR OTURUMDUR

Bir oturumun kendi içindeki her katman aynı oturum çalışma zamanına bağlıdır. Bağımsızlık ancak
**süreç sınırının dışında** başlar. Bu yüzden liderin park-gözetimi kuralı "yedek konfor
katmanı" değil, **yapısal olarak birincil** katmandır: parka giren şerit, dönüşünü bir akranın
dürtmesine bağlamalıdır. Parka girerken bırakılan tek satır ("şu koşul olunca beni uyandır")
mekanizmanın kendisidir; sözlü niyet değildir.

### HÜKÜM 3 — imleç TARAMAYI kanıtlar, DUYMAYI kanıtlamaz

`gozcuDurumu()` imleç tazeliğini ölçüp sütuna `GOZCU = panoyu DUYUYOR mu` yazıyordu. İmleci
**gözcü süreci** yazar; o süreç compact'i bir OS süreci olarak sağ atlatır. Ölen şey bildirimin
**konuşmaya teslimi**dir ve imleçte bunun izi yoktur. İki kavram bugün tesadüfen aynı yönde
yeşildi; ayrı yönde olduğu gün sütun **sahte yeşil** verir.

Hakkını vermek gerekir: `mechanism-setup.cjs dogrula` bu sınırı zaten dürüstçe yazıyordu
(`CRON: BEYAN — bu bir ÖLÇÜM DEĞİLDİR`). **Kusur cetvelde değil, yoklama sütununun adındaydı.**

Onarım: sütun **ikiye** ayrıldı — `TARAMA` (imleç yaşı, diskten ölçülür) ve `TESLIM`
(son **doğrulanmış konuşma-teslimi**nin yaşı, `dogrula --jeton` başarıyla eşleştiğinde diske
yazılır). Bir kavramı ölçen sütun, öteki kavramın adını taşımaz.

### HÜKÜM 4 — ayırt eden sayı eşiğe bağlanmadıkça hüküm değildir

O satırda ayırt eden sayı **zaten vardı**: `SES 64dk`. Kimse onu bir eşikle karşılaştırmadığı
için alarma dönüşmedi. Recep'in gece-koordinatörü için istediği sessizlik-dedektörü tam budur:
sayıyı basmak yetmez, **hükme bağlamak** gerekir. Eşikler aşağıda **makine-okunur** biçimde
yaşar; `board.cjs` onları buradan okur, **koda gömmez** — ve okuyamazsa fail-closed davranır
(eşik okunamadı = alarm, sessiz varsayılan YOK).

<!-- ESIKLER-BASLANGIC (makine okur: scripts/board/board.cjs — bicimi bozma) -->
- `SES_ESIK_DK: 45`
- `TESLIM_ESIK_DK: 120`
- `TARAMA_ESIK_TUR: 3`
<!-- ESIKLER-BITIS -->

`SES_ESIK_DK` neden 45: bir şerit normal çalışırken pano notu aralığı 10-30 dakikadır (ölçülen
gün: ALTYAPI üç PR boyunca düzenli not bıraktı). 45 dakika, yoğun tek bir işi bölmeyecek kadar
geniş, kaybı bir sonraki cron turunda yakalayacak kadar dar. `TESLIM_ESIK_DK` 120: teslimat
kanıtı her turda değil, **park/compact/resume geçişlerinde** yenilenir; iki saat bir çalışma
bloğunu kapsar.

### HÜKÜM 5 — eşik değiştirmek cetveli değiştirmektir

Yukarıdaki blok SSOT'tur. Eşiği koda gömen ya da çağrı satırında ezen bir değişiklik, hükmü
görünmez kılar; `board-invariants` bunu kol olarak tutar (blok silinirse ya da biçimi bozulursa
yoklama alarm verir, sessizce varsayılana düşmez).

### SABOTAJ TURU — 8/8 kırmızı, ama ilk turda 2 kol "yeşil geçti" ve **ikisi ayrı sınıftı**

Onarım 54 kol yeşille bitmişti; sekiz sabotajın ikisi ilk turda hiçbir kolu düşürmedi. İkisinin
teşhisi **farklı** çıktı ve karışmamaları önemli:

1. **S1 — ölçüt dardı (kapı kusuru).** Eski adı (`gozcuDurumu`) yasaklayan kol
   `/gozcuDurumu\s*[(,]/` ile yazılmıştı; sabotaj `gozcuDurumu: taramaDurumu,` diye bir
   **takma ad** ekledi ve iki nokta o karakter sınıfında olmadığı için kol görmedi. Dizeyi
   çıplak aramak da mümkün değildi: eski ad, kendisini yasaklayan **gerekçe metninde** kasten
   geçiyor. Doğru çözüm ikisinin arasından geçer: **yorumları soy, sonra ara.** Hüküm: bir adı
   yasaklayan kol, o adın *anlatıldığı* yer ile *kullanıldığı* yeri ayırmak zorundadır.
2. **S6 — sabotaj geçersizdi (kapı kusuru DEĞİL).** "Damga yoksa 0 dön" sabotajı, yalnızca
   *durum dosyası var ama damga yok* dalını değiştiriyordu; o günkü fikstür durum dosyasını
   **hiç yazmıyordu** (dosya yok → `catch` → `KANITSIZ`), yani sabotajın dokunduğu dal test
   tarafından **hiç koşulmuyordu**. Bu dal ise gerçektir ve tam olarak tehlikeli olandır:
   `prob` durum dosyasını **damgasız** yazar, `dogrula` çalışana kadar dosya VAR ve damga YOK.
   Eksik olan sabotaj değil **koldu**; eklendi.

Bu ikisi bugünün en pahalı ayrımını tekrar ediyor: **"sabotaj yeşil geçti" tek başına bir teşhis
değildir.** İki ayrı şeye işaret edebilir — kapı kör olabilir *ya da* sabotaj hiç dokunmamış
olabilir. Ayırt eden soru: *sabotajın değiştirdiği satır, testin koştuğu yolda mı?* Sormadan
"kapı kör" demek, sağlam bir kapıyı gevşetmeye götürür.

Üçüncü küçük kayıt: sabotaj betiğinin **kendi** beklenti dizesi de bir kez yanlıştı — `ESKİ`
(noktalı İ) yazan mesajı `ESKI` (ASCII I) diye aradı ve "yanlış kol düştü" verdi. Bugünün
**üçüncü** Türkçe İ/ı vakası (`KIMLIK`/`KİMLİK`, `DIŞ`/`dış`). Hüküm aynı kalıyor: sıfır/ıskalayan
sonuç **önce ölçütü** suçlar. Sabotaj betiği de bir ölçüm aracıdır ve kendi doğruluğu ölçülmemiş
bir araçtır — beklentiyi kolun **kimliğine** (test adına) bağlamak, mesaj metnine bağlamaktan
dayanıklıdır.

### DERSİN GENEL SINIFI

Bu, "kırpılmış çıktı kanıt değildir" ve "ayırt etmeyen gösterge ölçüm değildir" derslerinin
kardeşidir, ama yeni bir eksende: **gösterge doğruydu, adı yanlıştı.** Sütun gerçek bir şeyi
doğru ölçüyor, fakat okuyucuya **başka bir şeyi** vaat ediyordu. Bir ölçümün adı, ölçtüğü şeyin
sınırını taşımak zorundadır — çünkü paneli okuyan, ölçümün kodunu okumaz.

---

## 24. KİMLİK SIZDIRAN MUTLAK YOL — ve envanteri kapıdan AYRI ölçmenin bedeli (REC-102)

Depo **2026-08-15'ten beri PUBLIC**. Envanter (2026-09-01, salt-okuma): takipli **951 dosya /
2091 satır** mutlak yol taşıyor. Sızan şey kullanıcı adı + 25 ayrı iç dizin adı; **sır YOK**.

> ⓘ Bu bölümün hükümleri NUMARASIZ, betimsel başlıklarla yazıldı (§21/§22 biçimi). Sebebi
> ölçülmüş bir kapı kusuru: `INV-CETVEL-YAPI` `### HÜKÜM N` başlıklarını **dosya çapında**
> tekil sanıyor (§23 zaten HÜKÜM 1-5 kullandığı için §24 çakıştı), bölüm-kapsamlı `24.1`
> biçimine geçince de "`HÜKÜM24` ana bölümü yok" diye ikinci bir kol yandı. Üstelik `⭐` ile
> başlayan başlıkları HİÇ görmüyor — yani aynı dosyada bir kısım başlık ölçülüyor, bir kısmı
> sessizce atlanıyor. İki kapsam kusuru OPS'e bildirildi (kapı bu şeridin claim'inde DEĞİL).
> Numarasız başlık burada bir kaçamak değil: hüküm numarası zaten bölümün İÇİNDE anlamlıydı ve
> betimsel başlık atıf yapmayı kolaylaştırıyor.

### SIZINTI İKİNCİ SIRADA — birinci sırada TAŞINABİLİRLİK kusuru var

Ölçümün sürprizi buydu. Mutlak yol taşıyan **canlı kod**, sadece "ad sızdırmıyor" — **sessizce
tek bir makineye bağlı** demektir. Bulunan dört dosyanın hepsi bu sınıftaydı:

| dosya | ne yapıyordu |
|---|---|
| `registry/orion_bridge.py` | engine dizini sabit; başka makinede köprü **ImportError** ile ölür → Linear yansıması durur ve hata "modül yok" gibi görünür |
| `scripts/kademe2-load/load.mjs` | CSV kökü + `.env` yedeği sabit |
| `scripts/clean_root.ps1` | **yıkıcı** (`Remove-Item`) ve DAİMA ana dizini siliyordu — şerit ağacından koşan biri "kendi kökümü temizliyorum" sanıp ANA dizinden dosya silerdi |
| `scripts/generate/generate-next-routes.js` | zaten koşamıyordu (geçersiz modül adları), 0 atıf |

Onarım deseni: **ortam değişkeniyle ezilebilir + akıllı varsayılan**, davranış bu makinede
DEĞİŞMEZ (ölçüldü: köprü aktif, `registry_core` yüklendi, yollar `resolve()` sonrası birebir eşit).

### ⭐"REPO KÖKÜNÜN KARDEŞİ" TÜRETMESİ WORKTREE'DEN KIRILIR

İlk akla gelen düzeltme `registry/../../orion-registry` idi. **Ölçüldü: yok.** Şerit ağaçları
geçici dizin altında yaşadığı için o türetme oradan çözülmez ve köprü **sessizce** ölürdü —
yani sabit yolu kaldıran "düzeltme", yerine daha sinsi bir kırılma koyacaktı.
`Path.home()` / `os.homedir()` üç şeyi birden verir: bu makinede AYNI yol, worktree'den de
çözülür, ve kullanıcı adı **koddan** çıkar. Sıra: **açık ortam değişkeni → ev dizini → repo
kardeşi**, ve hiçbiri yoksa **denenen adayları sayarak** hata ver (tek yol basan hata mesajı,
yerleşim sorununu "yanlış yol yazılmış" gibi gösterip teşhisi saatlere yayıyordu).

### ⭐ENVANTERİ KAPIDAN AYRI ÖLÇÜT İLE ÇIKARMAK, İKİ ÖLÇÜT ARASINDA SESSİZ FARK BIRAKIR

Envanteri elle yazılmış `git grep` ile çıkardım, kapıyı sonra AYRI bir düzenli ifadeyle yazdım.
Kapının kendi **taban koşusu** farkı gösterdi:
- envanter yalnız **büyük harfli** sürücü harfini arıyordu → **iki canlı betik kaçtı** (küçük
  harfli sürücü harfiyle yazılmışlardı),
- envanter yalnız Windows biçimini arıyordu → POSIX ev-dizini biçimleri kaçtı,
- sonuç: "2 gerçek kod kusuru" diye rapor ettim, **gerçek 4**; prose sayısı 323 sanılıyordu, **480**.

**Hüküm: ilan dosyasındaki sayı, KAPININ ölçütüyle üretilmelidir.** İki ölçüt tek konuyu
ölçüyorsa biri mutlaka bayatlar — ve bayatlayan taraf genellikle raporu yazan taraftır.

### KAPSAM DIŞI BIRAKMAK BİR KARARDIR ve bedava değildir

Kapı üç katmanlı, gerekçeleri `docs/mutlak-yol-istisnalari.json` içinde **makine-okunur**:
1. **KOD/KONFİG → SIKI.** Yeni kalem = KIRMIZI. 9 ilan edilmiş muafiyet (8 tarihsel kalıntı +
   CI koşucusunun ev dizinini anan bir yorum — o koşucunun genel hesabı, kimlik değil).
2. **PROSE (.md) → MANDAL** (480, artmama şartı). Temizlik 215 dosyalık bir commit demekti:
   açık PR'ların hepsini tabanlamaya zorlar (§23 manifest dersi) ve **geçmiş zaten public
   olduğu için yayılmışı geri ALMAZ**. Bedeli var, karşılığı yok. Mandalın kendi kolu var:
   sayı çok düşerse "sınırı da indir" der, yoksa kazanılan alan sessizce geri verilir.
3. **companion `source_path:` + `.archive/` → KAPSAM DIŞI**, üreteç ORION tarafında (AXIOM 3:
   üretilmiş dosya elle düzeltilmez) ve sayı **normal işte artar** — mandala bağlanırsa günlük
   işi bloklar.

### ⭐YENİ DOSYA, COMMIT EDİLENE KADAR BU KAPIYA GÖRÜNMEZ

Kapı `git ls-files` okur — yani **takipli** dosyalara bakar. Sonuç: kapıyı yeni yazdığınız
dosyalarla birlikte koşarsanız **iyimser** bir yeşil alırsınız; o dosyalar henüz index'te
olmadığı için ölçüm evrenine girmemiştir. Bu tam olarak yaşandı: kapı 9/9 yeşilken, commit'ten
hemen sonra **iki kendi dosyamı** yakaladı (ilan dosyası ve kapının kendi test dosyası, ikisi de
açıklama metninde literal bir ev-dizini yolu barındırıyordu).
**Hüküm: takipli-dosya okuyan her kapı, COMMIT SONRASI bir kez daha koşturulur.** Bu, "tazelik
kapısı commit'lenmiş durumu okur" dersinin aynısıdır ve iki kez öğrenilmesi bunun sinsi
olduğunu gösteriyor: yeşil ekran, ölçülmemiş dosyalarla da yeşildir.

### ⭐KAPININ GÖREMEDİĞİ KALEM YAZILIR (kabul edilmiş eksik sessiz olamaz, §21)

Kapı metin okur ve NUL içeren dosyayı atlar. **Takipli 9 `.pyc`'nin 4'ü kimlik yolunu bytecode
içine gömüyor** — Python derleyici kaynak yolunu saklar, dolayısıyla `.py` temizlense bile yol
`.pyc` içinde yaşar. Bu kalem kapının **ölçüt evreni dışındadır** ve ilan dosyasında
`kapinin_goremedigi_kalem` alanında adıyla duruyor. İkinci kusur: bytecode zaten takipte
olmamalı (üretilmiş artefakt, her koşuda değişir — bu envanteri çıkarırken benim python
koşmam bile bir `.pyc`'yi kirletti).

### SABOTAJ TURU — 8/8, ama iki tur sürdü ve ikisi de ÖLÇÜT kusuruydu

- **S3 kör geçti**: `Path.home()` varlığını arayan kol, sabotaj o satırı sildiği hâlde yeşil
  kaldı — çünkü ad **açıklama metninde** de geçiyor. Yorum-soyucu yazdım, **yine** geçmedi.
  Kök sebep: **JavaScript'te `.` karakteri `\r`'yi KAPSAMAZ** (satır sonlandırıcı sayılır), bu
  yüzden CRLF'li bir dosyada `#.*$` deseni `$`'a hiç ULAŞAMAZ ve yorum soyulmadan kalır.
  Kardeş test (`fleet-mechanism-integrity`) bu tuzağa düşmüyor çünkü **okurken** CRLF'i
  normalize ediyor. Çözüm: `split(/\r?\n/)`.
  ⚠Ve bir öz-eleştiri: aynı soruyu `$`'sız desenle sorduğumda **doğru cevap gelmişti** ve bu
  farkı bir kez göz ardı ettim. "İki ölçüm zıt sonuç veriyorsa **farkı önce oku**."
- **S4 geçersizdi**: gerekçe dizesinin yalnız BAŞINI değiştiriyordum, kalan uzun metin yerinde
  kalıyordu → gerekçe hâlâ eşiğin üstündeydi, sabotaj **hiçbir şey yapmadı**.
- **Ve tezgâhın kendi kusuru**: rapor okunamadığında `dusen: []` dönüyordu ve bu "hiç kol
  düşmedi" ile **aynı görünüyordu** — yani geçerli bir sabotaj "KAPI KÖR" diye raporlanabilirdi.
  `okundu` bayrağı eklendi; okunamayan koşu artık **"ÖLÇÜLEMEDİ"**dir, "yeşil geçti" değildir.
  Sessizliği başarı sayan her araç, ölçmesi gereken arızada susar.

---

## 25. FİKSTÜR, BİÇİMİN SAHADA KULLANILAN VARYANTINI ÜRETMİYORSA KOL BOŞ KOŞAR

**Ölçülmüş vaka (2026-09-01):** `precompact-durum-kapisi.cjs` **günde iki kez** yanlış alarm
verdi ("EKSIK ALAN: son girdi, verilen sozler") — oysa alanlar dosyada VARDI. Kapının
konformans takımı **10/10 yeşildi**. URUN bildirdi, ALTYAPI ölçtü.

### Kök sebep — Türkçe İ, iki katmanlı bir tuzak

`DORT_ALAN` desenleri ASCII yazılıydı (`son girdi` / `SON GIRDI`), şeritlerin başlıkları ise
Türkçe: **`SON GİRDİ`**.

1. JavaScript'in `/i` bayrağı **noktalı İ'yi i'ye KATLAMAZ** (`u` bayrağıyla da katlamaz).
2. Ve asıl tuzak: `'SON GİRDİ'.toLowerCase()` düz `'son girdi'` **DEĞİL**,
   **`'son gi̇rdi̇'`** verir — `i` + **BİRLEŞİK NOKTA** (U+0307). Yani "küçük harfe çevir"
   **tek başına çözmez**; birleşik işaretlerin de atılması gerekir.

Çözüm: `normalize('NFD')` → birleşik işaretleri (U+0300–U+036F) at → noktasız `ı`'yı elle eşle
→ küçült. Böylece `İ→i`, `ş→s`, `ğ→g`, `ö→o`, `ü→u`, `ç→c`, `ı→i`. Desenler **sade ASCII**
kalabilir — çünkü desen başına iki varyant yazmak zorunda kalmak, varyantlardan birini
unutmanın ta kendisiydi.

### ⭐HÜKÜM — kolun yeşilliği, fikstürün ürettiği biçim kadardır

Kapının bütün fikstürleri ASCII başlık üretiyordu. Yani kol vardı, ama **ölçtüğü şey sahada
yoktu**. Bu, §22'deki "ölçülmeyen dal, yazılmamış dal kadar korumasızdır" dersinin biçim
eksenindeki kardeşidir: orada bir KOD DALI hiç koşulmuyordu, burada bir VERİ BİÇİMİ hiç
üretilmiyordu. **Fikstür, sahada gerçekten yazılan biçimi üretmek zorundadır** — özellikle
dile bağlı biçimlerde.

### ⭐"YEŞİL GÖRDÜM" ≠ "ÖLÇÜT ÇALIŞIYOR"

Bu kapı **benim kendi durum dosyamda YEŞİLDİ** ve bu beni yanılttı. Sebebi ölçünce çıktı:
eski bloklarımda ASCII `SON GIRDI` başlığı vardı, yani kapı bende **tesadüfen** geçiyordu.
Bir kapının kendi dosyanızda yeşil olması, ölçütün doğru olduğunun kanıtı değildir; yalnızca
sizin verinizin o ölçüte uyduğunun kanıtıdır.

### AYIRT EDİCİ ÇİFT — URUN'un doğru itirazı

URUN yalnız kusuru değil, kolun nasıl yazılması gerektiğini de söyledi: *"alanı gerçekten
silinmiş örnekte KIRMIZI, dolu dosyada YEŞİL vermeli; şu an yalnız kırmızı veriyor, yani dolu
ile boşu AYIRT ETMİYOR."* Tek yönlü kol yetmez — **her hâlde yeşil veren bir kapı da
"Türkçe başlık tanınır" kolunu geçer**. Bu yüzden onarım iki kolla geldi: Türkçe dolu dosya
YEŞİL, Türkçe dosyadan bir alan gerçekten silinince UYARIR. Sabotaj **5/5**.

### KATLAMA İŞLEVİ DIŞA AÇILIR

`asciiKatla` export edilir ve test **onu** çağırır. Test kendi katlamasını yazsaydı iki ölçüt
ayrışır, biri bayatlar ve yanlış alarm sessizce geri gelirdi — bu, "kancalar ölçütü
kopyalamak zorunda kalırsa ölçüt ikiye ayrılır" hükmünün (§23) aynısıdır.

### GÜNÜN SINIFI: BUGÜN DÖRDÜNCÜ TÜRKÇE İ/ı VAKASI

Sırasıyla: `KIMLIK`/`KİMLİK` · `DIŞ`/`dış` · sabotaj betiğinin `ESKI`/`ESKİ` beklentisi · ve
bu — **bir KAPININ İÇİNDE, bütün şeritleri etkileyerek**. İlk üçü ölçüm sırasında görülüp
düzeltildi; bu dördüncüsü **günde iki kez sahada** öttü ve testler yeşil kaldı.
**Hüküm: Türkçe metinle çalışan her eşleştirme ASCII-katlanmış metne karşı koşar.**
Ve yanlış alarm ucuz değildir: **yanlış alarm veren kapı, bir süre sonra okunmayan kapıdır.**


---

## 26. KULLANICIYA GÖRÜNEN METİN, ÖLÇÜTÜN ADINI TEKRAR ETMEZ — ONDAN ÜRETİLİR

**Ölçülmüş vaka (2026-09-01/02):** §23 ile yoklamanın ekseni `GOZCU` → `TARAMA` oldu ve
dördüncü eksen `TESLIM` eklendi. Başlık güncellendi; **`--help` geride kaldı** ve günlerce
*"UC EKSENLI … GOZCU=duyuyor"* dedi — hem **sayı** hem **ad** yanlıştı. Eski adı yasaklayan
konformans kolu bunu görmedi: kol bir **tanımlayıcı** (`gozcuDurumu`) arıyordu, help içindeki
`GOZCU=duyuyor` ise bir **dize literali**.

Bu, §23'ün *"gösterge doğruydu, adı yanlıştı"* sınıfının bir adım ilerisi: burada göstergenin
adı da doğruydu, **adı ANLATAN METİN** bayattı.

### ⭐HÜKÜM — ad üç yerde tekrar ediyorsa üç yerde ayrışır

Eksen adları açıklama yorumunda, başlık dizesinde ve help metninde ayrı ayrı yazılıydı; tek
kaynak yoktu. Tek satırı yamamak kaymayı **geri getirirdi**. Doğru onarım kaymayı
**imkânsız** kılar: tek `EKSENLER` listesi, başlık ve help ondan üretilir, ve bir kol
**üretildiğini** ölçer. Yasak metne de genişletilir — `yorumsuz` kaynakta `GOZCU=` ve elle
yazılmış eksen sayısı aranır, çünkü adın **anlatıldığı** yorum serbest, **kullanıldığı** yer
değildir.

### ⭐ÖLÇÜT, ÖLÇTÜĞÜ TABLOYU REFERANS OLARAK KULLANAMAZ (tautoloji)

İlk yazımda kol, beklenen sayı sözcüğünü `board.SAYI_SOZU`'ndan okuyordu. Sabotaj tabloyu
bozdu (`4: 'UC'`) ve **kol yeşil kaldı**: bozulan tablo hem ölçülen hem referanstı, ikisi
birlikte kaydı. Doğru kurulum, beklenen değerin **testin içinde bağımsız** durmasıdır.
Bu, ölçüm disiplininin genel biçimidir: *bir şeyi kendisiyle karşılaştırmak ölçüm değildir.*

### ⭐LİSTE BEYAN, SATIR GERÇEK — ve ters yön ayrıca ölçülür

`EKSENLER`den `TESLIM` silindiğinde her şey **tutarlı** kaldı: liste üç, sayı `UC`, adların
hepsi satırda. Çünkü kol yalnız *"listedeki her ad basılıyor mu"* diyordu — **liste ⊆ satır**.
Kayma tam ters yönde olur: bir eksen listeden düşer, kalanlar hâlâ basılır, kol yeşil kalır ve
**ölçülen bir sağırlık boyutu sessizce ölçülmez olur.** Bu yüzden beklenen eksen **kümesi** de
bağımsız durur. Yeni eksen eklemek o satırı güncellemeyi gerektirir; bu sürtünme **kasıtlıdır**
— eksen kümesi §23'te hükme bağlı bir karardır, sessizce değişmemeli.

### ⭐SABOTAJ TEZGÂHININ KENDİ BEKLENTİSİ DE BİR ÖLÇÜTTÜR

S3 düzeltildikten sonra tezgâh onu *"YANLIS KOL"* diye raporladı: kapı **doğru sebeple**
kırmızıydı, tezgâhın beklenti deseni yeni kolun adını kapsamıyordu. Yani sabotaj raporu da
yanlış olabilir — *"yeşil geçti"* ile *"beklediğim kol düşmedi"* ayrı sonuçlardır ve ikisi
ayrı ayrı okunur.

### Fikstür, ölçülecek durumu ÜRETMEK zorunda (§25'in bu işteki tekrarı)

Başlığı ölçen ilk kol kırmızı verdi: **boş panoda** `yoklama()` erken dönüyor
(*"panoda talep yok"*) ve **başlığı hiç basmıyor**. Kol var olmayan bir metni arıyordu.
Başlık ancak en az bir şerit varken üretilir; fikstür onu üretmek zorundadır.


---

## 27. BEDELSİZ HATA KAPI DOĞURMAZ — ve ölçüm tarafında kapı yoktu

**Ölçülmüş vaka (2026-09-01/02, DÖRT kez: URUN 3 + ALTYAPI 1):** kabuk sessizce birincil
çalışma dizinine kaydı; `node scripts/board/board.cjs claim` ANA DİZİNDEKİ kopyayı koştu.
**Üç vakada zarar SIFIRDI** — ana dizin temizdi, komutlar no-op düştü, ölçümler doğru çıktı.

### ⭐HÜKÜM — zarar sıfır olduğu için kapı doğmadı; sıfır zarar bir muafiyet değildir

Yazma tarafını `bash-write-guard` koruyordu; **ölçüm tarafı korumasızdı.** Dört vakanın
hiçbiri bir kapıya dönüşmedi ve sebep basit: **hiçbiri bir bedel ödetmedi.** İki ajan ilk
vakalardan sonra "dikkatli olacağım" dedi; üçüncü ve dördüncü yine oldu.
**Dikkat bir mekanizma değildir.** Bir hatanın sizi yanıltmaması, bir dahakine
yanıltacağının işaretini de vermez — ve tam bu yüzden bedelsiz hata en uzun yaşayandır.

### ⭐HÜKÜM — beyan KÖK değil KOŞAN DOSYA olur

İlk tasarım *"ölçüm betiği kullandığı KÖKÜ bassın"* idi. **Ölçünce yetersiz çıktı:**
o vakada yanlış ağacın VERİSİ ölçülmedi (pano paylaşımlıdır, veri doğruydu); zarar
**bayat sürümün koşmasıydı** ve **bayat sürüm de doğru kökü basar.**

Ve keskini: ölçüldü, ana dizin `origin/master`'dan **0 GERİDE** iken iki `board.cjs`
kopyası **FARKLIYDI**. Yani *"ağaç güncel"* ile *"aynı araç koşuyor"* **ayrı iddialardır**;
tazelik sorusu bayat-araç riskini ölçmez. Ayırt eden şey **koşan dosyanın kimliğidir**
(`__filename`).

### HÜKÜM — beyan YAZAN fiillere konur, okuyanlara KONMAZ

Okuyan fiillerin (`yoklama`/`who`) çıktısı insan tarafından taranır; gürültü onları okunmaz
kılar ve **okunmayan kapı kapı değildir** (§25: yanlış alarm veren kapı, bir süre sonra
okunmayan kapıdır). Durum DEĞİŞTİREN fiil ise nereden koştuğunu söylemek zorundadır.
Beyan **stderr'e** yazılır: stdout'u ayrıştıran kancalar beklenmedik satırla karşılaşmasın.

### HÜKÜM — beyan TEK ortak noktada durur, fiil başına eklenmez

Fiil başına eklenirse biri unutulur ve o fiil sessizce yanlış ağaçtan koşar. Kol da fiil
listesini **modülün kendi dışa açtığı kümeden** okur; kendi listesini yazsaydı iki ölçüt
ayrışır ve yeni bir yazan fiil eklendiğinde kol sessizce eksik ölçerdi (§26'nın tek-kaynak
hükmünün bu işteki biçimi).

### Bu bölümün kolları ve sabotajı

`INV-BOARD-KONUM-1`, 4 kol: yazan fiillerin **hepsi** beyan eder · beyan edilen yol
**gerçekten koşan dosya** (beklenen yol testte `require.resolve` ile **bağımsız** çözülür —
§26'nın tautoloji dersi) · **okuyan fiiller beyan ETMEZ** (ayırt edici çift) · beyan
**stderr'e** gider. Sabotaj **4/4**: beyan kaldırılır · sabit literal basar · stdout'a
yazılır · okuyan fiillere de basar.

---

## 28. BEYAN YETMEZ — AYRIŞMA TUR BAŞINA ÖLÇÜLÜR (uyarı + sayım, kapı DEĞİL)

**Ölçülmüş vaka sayısı: ALTI** (2026-09-01…04; URUN 4 + ALTYAPI 2). Kabuk sessizce
paylaşılan **ANA dizine** kaydı ve şerit işi orada koştu. **Beşinde zarar SIFIRDI.**

§27 bu sınıfın ilk yarısını kapatmıştı: yazan fiil **koştuğu dosyayı beyan eder**. Altıncı
vaka o kapının **sınırını** gösterdi.

### ⭐HÜKÜM — tehlike ölçüm komutunda değil, ARADAKİ masum yardımcı komutta

URUN ölçtü: `node scripts/board/board.cjs` **göreli** yolla çağrılınca, bulunduğun
dizindeki kopya koşar ve **kabuğun cwd'sini oraya çeker**. Sonraki komutlar sessizce
yanlış ağaçta çalışır. Yani **komut başına beyan yetmez** — beyan eden komut doğru koşar,
**ondan sonraki** komut kayar. Bu yüzden durum **tur başına** ölçülür: tur-sonu kancası
oturumun dizini ile şerit ağacını karşılaştırır.

### ⭐HÜKÜM — kuralı İNSANA değil KOMUTA göm

URUN'un aynı vakadan çıkardığı ders, hükmün en kullanışlı hâli: *"beyan hatırlanması
gereken bir şey, `git -C` hatırlanmaması gereken bir şey."* **Kanonik biçim:** komutlarda
**mutlak yol**, git için **daima `git -C <ağaç>`**. Bir kural ancak hatırlanmayı
gerektirmediğinde mekanizmadır.

Aynı vakanın dürüstlük notu da kayda geçti: bu kural URUN'un hafızasında **zaten yazılıydı**;
eksik olan bilgi değil **uygulamaydı**. Kapının değeri tam burasıdır — *bilinen ama
uygulanmayan* kuralı araç hatırlatır.

### ⭐HÜKÜM — KAPI DEĞİL, UYARI + SAYIM (Recep onaylı)

Altı vakanın **beşinde** zarar sıfır olduğu için bloklamak **gürültü** üretir; gürültülü
kapı bir süre sonra **okunmayan** kapıdır (§25). Ama uyarı tek başına da yetmez, çünkü
**bedelsiz hata en uzun yaşayandır** (§27) — bu yüzden **sayaç** tutulur ve uyarı
*"N. kayıtlı vaka"* der. Sayaç, zararsız tekrarların da bir maliyeti olduğunu görünür kılar:
sınıfın kapı kazanmasını *o gün ne kadar can yaktığına* bırakmaz.

### ⭐HÜKÜM — ayırt edici ölçüt `--git-dir` ≠ `--git-common-dir`

Bağlı bir worktree'de bu ikisi **farklıdır** (`<ana>/.git/worktrees/<ad>` ve `<ana>/.git`);
ana worktree'de **aynıdır**. **Kök eşitliği bu ayrımı YAPAMAZ:** `--show-toplevel` her iki
hâlde de bir kök döndürür ve iki ayrı worktree'nin kökleri de farklıdır — yani kök
karşılaştırması *"iki ayrı worktree"* ile *"worktree vs ana dizin"* arasında ayrım yapmaz.
Aranan ayrım ikincisidir, çünkü tehlikeli olan **paylaşılan** ağaçta çalışmaktır.
Sabit yol listesi yazılmaz: konum git'in kendi durumundan okunur, yoksa ölçüt makineye
bağlanır ve başka makinede sessizce yanlış cevap verir.

### İKİ KOŞUL BİRLİKTE — ana dizinde olmak tek başına ihlal değildir

Uyarı ancak **(a)** dizin ana worktree **ve (b)** oturumun canlı bir şerit talebi varsa
verilir. Talebi olmayan bir oturumun ana dizinde olması olağandır; tek koşulla uyarmak
yanlış alarm üretirdi.

### Bu bölümün kolları ve sınırı

`INV-BOARD-KONUM-2`, 4 kol: `agacKonumu` worktree ile ana dizini **ayırt eder** ·
ölçülemeyince **sebep yazar** (sessiz "temiz" dönmez) · yazan fiil **ayrışmada uyarır,
ayrışma yokken uyarmaz** (ayırt edici çift) · tur-sonu kancası **ana dizin + talep**
birleşiminde uyarır ve **sayar**, diğer iki hâlde sessiz kalır (iki ayırt edici karşı-kol).

⚠**KAPSAM SINIRI, adıyla:** yeni bir Stop kancası **kaydedilmedi**; ölçüm zaten kayıtlı olan
kancaya eklendi. Sebep: yeni kanca kaydı `.claude/settings.json` düzenlemek demektir, yani
**config** — ve bu iş akran iletisiyle geldi. **Config'e akran sözüyle dokunulmaz.**
