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
