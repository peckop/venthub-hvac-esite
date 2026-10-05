# Hafıza ve Talimat Yazma Düzeni Standardı (REC-530)

> **Ne yönetir:** kalıcı hafızaya (hafıza dizini, `MEMORY.md`, ortak dersler) ve talimat dosyalarına
> (`CLAUDE.md`, rol kartları) **kim, hangi yola yazabilir**; pencerelerin günlük/durum dosyalarının yeri;
> bu kuralların kancayla nasıl zorlandığı ve zorlanamadığı.
> **Niçin var:** 2026-09-30, 599 dosyalı hafıza dizininde son 24 saatte en az sekiz ayrı pencere yazmıştı ve
> mevcut tek koruma yalnız indeksin kırpılmasını engelliyordu (`hafiza-kancalari-standard.md`, REC-280).
> Kim yazabilir, ne yazılır, aynı bilgi ikinci kez yazıldı mı, hiçbiri denetlenmiyordu. Dizinin %42'si (2,1 MB) pencere
> günlükleriydi ve indeksle aynı yerde duruyordu. Recep: "herkes kafasına göre mi her istediği dosyaya yazacak?"
> **Sahibi:** HARİTA (düzeni kurar, testle teslim eder, kapanır; kancayı ARAÇ kurar; ortak çekirdeğin içeriğini OPS yazar).
> **Kayıt:** REC-530 (çatı), REC-531 (bu cetvel). Model Recep'in onayıyla 2026-09-30 (OPS iletti); teknik kararlar OPS.
> **Son doğrulama:** 2026-09-30 (Claude Code belge sayfaları iki araştırmacı ve işi yapmamış bir doğrulayıcıyla okundu;
> `lane-guard.cjs`, `bash-write-guard.cjs`, `bash-write-audit.cjs`, `precompact-durum-kapisi.cjs`, `board.cjs`
> kodu iki ayrı bağımsız okuyucuyla ve kaynaktan karşılaştırıldı; ARAÇ'ın uygulayıcı okuması 17 kritik madde buldu, v0.4 onları işledi; v0.4'ü okuyan dördüncü bağımsız okuyucu 7 engelleyici buldu, v0.5 onları işledi; v0.5'i doğrulayan beşinci okuyucu 2 engelleyici + 4 orta buldu, v0.6 onları işledi; v0.6'yı doğrulayan 2 engelleyici + 5 orta buldu, v0.7 işledi; v0.7'yi doğrulayan SON okuma (OPS kuralı) 1 engelleyici + 4 orta buldu, v0.8 hepsini işler).
> **Kanca KURULU DEĞİL** (§10); bu cetvel şartnamedir. **Statü: v0.9, uygulamayla doğrulanacak** (OPS kararı 2026-10-01: v0.4, v0.5, v0.6 her turda en az 2 engelleyici (7, 2, 2; v0.7'de 1)
> çıktı; belge kodla sınanmadan sıfıra inmez; kalan sorular §11 "Açık sorular (uygulamada ölçülecek)" başlığında ARAÇ'ın kabul testlerine bağlıdır).
> **Davranış kuralı (Recep, ayakta duran, kancadan bağımsız):** "Ayar dosyasına yazım yalnız ilgili pencerede Recep sözüyle; onay pencereler arası taşınmaz." Kanca izin verse bile söz şartı kalkmaz. *(Karar 224 son hâli, Recep 2026-10-01: canlı dışındaki her onayı Recep yalnız OPS penceresinde verir; ayar/izin/kullanıcı düzeyi dosyada "Recep sözü OPS penceresinde, değişikliği uygulayan OPS"; R9b "kullanıcı settings yalnız OPS ve ARAÇ yazar" hükmü kalır; `fleet-mechanism-standard.md` §17 Kural 4.)*

---

## §1 Katman modeli

| Katman | Ne girer | Yer (hafıza dizinine göre) | Kim yazar | Kim okur |
|---|---|---|---|---|
| **1 Ortak çekirdek** | Şirket geneli sözleşme, Recep'in genel tercihleri, ortak dersler, indeks | `MEMORY.md`, kökteki ortak ders dosyaları, `olcum/**`; repoda talimat dosyaları (§2, R9) | yalnız OPS | herkes, oturum açılışında |
| **1b Öneri kutusu** | "Bunu ortak hafızaya ya da kurala ekleyin" talebi: ne, neden, hangi departman, kanıt | `oneri/<ROL>-<tarih>-<konu>.md` | o ROL'ün penceresi (şeritsiz pencere: `oneri/_sahipsiz-<sid>-<konu>.md`) | OPS kabul ya da reddeder, kabul edileni çekirdeğe kendisi yazar |
| **2 Departman hafızası** | O departmanın kalıcı dersleri, karar gerekçeleri, ölçüm sonuçları | `departman/<ROL>/` (kendi `MEMORY.md`'si ve konu dosyaları) | o ROL'ün penceresi ve OPS | yalnız o departman: `SessionStart` kancası kendi `MEMORY.md`'sini rol kartıyla birlikte enjekte eder (üst sınır §7) |
| **3 Günlük / durum** | Compact sonrası kaldığı yer: dört sabit alan | `gunluk/<ROL>/` (ana indeksten ayrı, indekse girmez); geçmiş günler `gunluk/<ROL>/gecmis/` (§9b) | yalnız o ROL'ün penceresi | aynı pencere, compact kapısı |
| **4 Konu tetiklemeli dersler** | Bir konu açılınca gelen kısa dersler | sage ve konu yönlendirici (REC-448, ARAÇ #1590) | mekanizma | konu algılanınca |
| **5 Arşiv** | Ölü, birleştirilmiş, eski kayıt | `arsiv/` | OPS | hiçbir pencere otomatik okumaz |

`<ROL>` değerleri `docs/roller/` kartlarındaki adlardır: OPS, ARAC, ALTYAPI, HARITA, URUN, ADMIN, KATALOG, GEO-SEO,
BLOG, MARKA, MEVZUAT, SATIS, TASARIM, EDGE, I18N, YETENEK (ASCII, büyük harf; tek kaynak `scripts/belge/rol-karti-uret.cjs`
içindeki `ROLLER`). Pencerenin görünen adını Recep verir (`scripts/board/pencere-adlari.cjs`); görünen ad rol değildir.

**Cetvellerin içeriği** sahibi departmanda kalır (`docs/roller/cetvel-sahipligi.md`); bu cetvel yalnız hafıza ve talimat
katmanlarını yönetir.

---

## §2 Yol → izinli oturum (kural tablosu)

**Değerlendirme sırası ve öncelik:** kural en özel yoldan genele doğru bakılır: önce K0 (kapı dışı), sonra R9 (repo talimat dosyaları,
hafıza yolu değildir), R9b (git dışı ayar dosyaları, hafıza yolu değildir; R9 ile aynı yerde, R9'dan hemen sonra), R6 (durum dosyası kalıbı), R5, R4, R3, R2, R1, R7, en son R8. **Ön süzgeç ve D24d R9b'nin iki kalıbını da kapsar** (R9 sabiti + R9b sabiti). **R10 karar verici değil, EK İZİNDİR** (v0.4, ARAÇ
kararı 1): R10'un koşulu (`gecis_son` tarihi içinde ve yazar tam OPS ya da şeridi HARİTA olan oturum; **tek bayrak `gecis_son`**, `harita_muafiyet_son` yalnız R9 içindir) sağlanıyorsa işlem, aşağıdaki normal kuraldan bağımsız **izinlidir**;
sağlanmıyorsa R10 yok sayılır ve yol normal kuralına (R4, R5, R3…) düşer. Böylece geçiş boyunca URUN kendi `gunluk/URUN/`'unu ve
şeritsiz pencere `gunluk/_sahipsiz/<sid>.md`'yi yazabilir. Normal kurallarda ilk eşleşen kural karar verir; başka kurala düşülmez.
**Dizin ya da `*` hedefi** (örn. `rm -rf gunluk/URUN`, `mv gunluk arsiv/`, `departman/*/x`): **statik önek genişletmesi** (v0.5 algoritma; dosya sistemi
taranmaz): (1) hedefin ilk `*` segmentinden önceki kısım statik önektir; `*` içermeyen dizin hedefi için hedefin kendisi önektir. (2) `*` bir **ROL segmentine** denk geliyorsa
(`departman/*/…`, `gunluk/*/…`) `ROLLER` anahtarlarıyla (ve `gunluk` için `_sahipsiz` ile) genişletilir ve **her genişleme için ayrı karar** verilir; `*` başka yerdeyse
(kökte `*.md` gibi) hedefin bulunduğu dizinin kuralı uygulanır (kökte R1). **`oneri/*` ROL segmenti DEĞİLDİR** (`oneri/` altı `<ROL>-…` dosya adıdır, klasör değil):
`oneri/` altındaki bir `*` dosya adı glob'udur ve R2'nin **en kısıtlı** hâliyle (yalnız kendi önekli dosya) değerlendirilir; temizlik istisnası tek dosya içindir, glob'a geçmez.
**Tanınmayan glob** (`?`, `{a,b}`, `[…]`, kısmi segment `U*`) → hedefin üst dizin kuralının **en kısıtlısı** (karar tahmin edilmez).
**Dizin mi dosya mı:** kütüphane saf kaldığından hedef başına `dizinMi` kancada hesaplanır (hedef varsa `stat`, yoksa sonu `/`, `*` ya da `rm -r`/`-R` bayrağı); `**` kalıbı dizinin kendisini de kapsar
(`gunluk/URUN` hedefi R4'tür). **Bilinmeyen/yeni hedef:** `repoGoreli` ve `dizinMi` var olmayan hedef için de dize olarak hesaplanır (var olan en yakın üst dizin çözülür). (3) Dizin hedefi (`gunluk/URUN`, `gunluk`) altındaki **en kısıtlı kuralı** alır: `gunluk/<ROL>` R4,
`gunluk` kökü her ROL için R4. (4) Toplam karar genişlemelerin **en kötüsüdür** (biri engelse komut engelli). Sonuç: `gunluk/URUN` dizin hedefi R4'e düşer ve R4 OPS dahil kimseye izin vermez;
`departman/*/x.md` silmeyi OPS (tam) için R3 her ROL'de izin verdiğinden **izin** çıkar (başkası için her genişlemede R3 engel); temizlik istisnası (aşağıda) yalnız **tek dosya**
hedefinde geçerlidir, dizin ve `*` hedefinde geçmez. **`$DEĞİŞKEN`, `$(…)` ve ters tırnak** içeren hedef ise genişletilemez: `genisletmeli: true` işaretlenir, **izin + alarm** (§6).

"Şerit" ve "rol" §3'teki çözümden gelir. **"tam"** bir rolün şerit adıyla birebir eşleştiği anlamına gelir (önekle eşleşme
"tam" değildir); OPS yetkisi gerektiren her satır **tam** eşleşme ister.

| No | Yol | Yazabilir | Not |
|---|---|---|---|
| K0 | Araç olmayan yazmalar: kancaların ve betiklerin kendi yazdığı dosyalar (`son-konusma-*.md` Stop kancası, `MEMORY.md.oncesi-*` yedekleri, `.gitignore`, `.git/**`, hafıza yedek commit'i) | kural uygulanmaz | Kanca yazımı araç çağrısı olmadığından kancaya gelmez; bu satır "izinli" sayıldığını yazılı kılar. **Test yok, yalnız belge** (kancaya gelmeyen yazma sınanamaz). Pencerenin kendi `Edit`/`Write` çağrısıyla bu dosyalara yazması R8'e düşer (modelin `cp MEMORY.md MEMORY.md.oncesi-…` yedeği de: yalnız OPS). |
| R6 | **Geçiş süresince** kökteki durum dosyaları: ad `(lane-day\|state\|durum)` içerir ve küçük harfli adın başı, bir ROL adının küçük harfli, `-` çıkarılmış hâli ile **ve ardından `-`** ile başlar (`geoseo-…`, `urun-katalog-lane-day-…` → URUN, `ops-cycle-audit-state.md` → OPS; `aracin-…` ARAC'a düşmez); birden çok ROL uyarsa en uzun önek | o ROL'ün oturumu (**önek yeter**, `tam` aranmaz: R6 OPS'un ortak çekirdeği değil rolün kendi dosyasıdır; `OPS-AUDIT` şeridi `ops-cycle-audit-state.md`'yi yazar) | Geçiş bitince (§9) bu satır kalkar. Kalıba uymayan sahipli dosyalar (eski rol adları `auth-`, `pricing-`, `legal-`, `orion-`, `lane-day-states-index` gibi; `blog-seridi-berati`, `mevzuat-seridi-park`, `urun-lane-charter`, `admin-serit-sahibi` gibi anahtar sözcüksüz rol dosyaları) **R1'de kalır** (yalnız OPS); bunların hangi ROL'e taşınacağı §9 geçiş listesinde yazılır. |
| R5 | `gunluk/_sahipsiz/<session_id>.md` | yalnız o `session_id`'nin oturumu | Dosya adı tam `session_id` (harf duyarsız) ve `.md`; alt klasör ve başka ek yok. Şeridi olmayan pencerenin tek günlük yeri. |
| R4 | `gunluk/<ROL>/**` | o ROL'ün oturumu (alt ajan dahil) | OPS dahil başkası yazmaz, okur. Geçiş taşıması için R10, süresi dolmuş tek dosya temizliği için temizlik istisnası. Bu, `gunluk/_sahipsiz/<sid>.md` için de geçerlidir (R5 "yalnız o `sid`": OPS başka `sid`'in dosyasına **yazamaz**; yalnız temizlik istisnası ve R10 yolu açıktır). |
| R3 | `departman/<ROL>/**` | o ROL'ün oturumu (önekle eşleşme yeter); şeridi OPS olan oturum (tam) | Başka departman yazamaz. |
| R2 | `oneri/**` | dosya adı `<ROL>-` ile başlıyorsa o ROL'ün oturumu; `_sahipsiz-<session_id>-` ile başlıyorsa o oturum | Başkasının öneri dosyasının üzerine yazılmaz. Şeridi olmayan pencere yalnız `_sahipsiz-` adıyla yazar. |
| R1 | `MEMORY.md`, kökteki `*.md` ortak ders dosyaları, `olcum/**` | şeridi OPS olan oturum (**tam**) | Departman yazamaz, R2'ye öneri bırakır. |
| R7 | `arsiv/**` | şeridi OPS olan oturum (**tam**) | Geçiş süresince HARİTA da (R10). |
| R8 | tablo dışı her hafıza yolu (kökteki `.py`, `.json`, `belge-yonetimi-devir/**` dahil; **ROL listesinde olmayan segment**: `gunluk/foo/x.md`, `departman/foo/x.md`, kökte `gunluk/x.md` dahil, D31) | şeridi OPS olan oturum (**tam**) | Sınıflandırılmamış yeni yol açılmaz. `belge-yonetimi-devir/**` HARİTA'nın çalışma klasörüdür; geçiş süresince R10 kapsar, sonra arşive taşınır. |
| R9 | Repoda talimat dosyaları (yalnız aşağıdaki kalıplar; kök yolları git köküne göredir, `AGENTS.md` yalnız depo kökündekidir): `CLAUDE.md`, `.claude/CLAUDE.md`, `AGENTS.md`, `docs/roller/**`, `docs/proje-takip/design/*/CLAUDE.md`. **Kaynak dosyalar da bu kapsamdadır (AÇIK LİSTE, v0.6 ve tek sabit):** `scripts/belge/rol-karti-uret.cjs`, `scripts/belge/cetvel-sahipligi.json` (kart sahiplik verisi; v0.4-v0.5'teki `docs/roller/cetvel-sahipligi.*` kalıbı yanlıştı: orada yalnız üretilmiş `.md` var), ayar dosyası `.claude/hafiza-yazma-ayar.json` | şeridi OPS olan oturum (**tam**); HARİTA, `harita_muafiyet_son` tarihine kadar, **ayar dosyası HARİÇ:** `.claude/hafiza-yazma-ayar.json` yalnız tam OPS yazar (HARİTA muafiyeti ayar dosyasına geçmez; yoksa HARİTA kendi muafiyetini ve `gecis_son`'u uzatabilirdi, "bayrağı OPS yeniler" kararı boşalırdı, v0.6) | Çıktıyı (kartlar) korumak, kaynağı (üretici, sahiplik kaydı, ayar) korumamak bir delik olurdu: HARİTA kapandıktan sonra da üreticiyi düzenleyip kartları değiştirebilirdi. **Sahiplik kaydının gerçek yeri `scripts/belge/cetvel-sahipligi.json`'dur** (`docs/roller/` altında yalnız üretilmiş `cetvel-sahipligi.md` var; v0.4'teki `docs/roller/cetvel-sahipligi.*` yanlıştı). **Bilinçli dışarıda (v0.6, §6'da satırı var):** ARAÇ'ın kanca ve pano kodu R9'a **girmez**: `.claude/hooks/**` (yeni `hafiza-yazma-*` kancası, kütüphanesi ve `bash-write-*`, `protect-config.cjs` dahil), `scripts/board/**` (`board.cjs`, `pencere-adlari.cjs`, `canlilik.cjs`) ve `INV-HAFIZA-YAZMA-1` test dosyası. Gerekçe: kapının kendi kodunu OPS-only yapmak sonraki her ARAÇ düzeltmesini OPS penceresine bağlardı (kapı kendini kilitler) ve `protect-config.cjs` başlığı bu yolun daha önce yanlış-pozitif ürettiğini (kendini koruma kilidinin ters tepmesi) kaydeder; ARAÇ'ın bu dosyalardaki değişikliği PR kapısından (ritüel, OPS birleştirme onayı) geçer. (v0.3'te "R9 kaynak listesi" bu dosyaları da kapsıyordu ve ARAÇ kabul etmişti; v0.6'da dördüncü doğrulayıcının "kapı kendini kilitler" bulgusuyla **daraltıldı** ve OPS'a karar maddesi olarak gitti.) **Sürümlü `.claude/settings.json` R9 DIŞINDADIR (v0.7, OPS kabul):** v0.6'da R9'daydı; ama §10 "Ayar" satırı kanca kaydını ARAÇ'ın yazmasını ister (R9 buna izin vermezdi), HARİTA muafiyeti içinde kaydı silebilirdi ve `protect-config.cjs` başlığı `settings.json` kilidinin "self-lock'un parçası" olduğunu ve kaldırıldığını kaydeder. Koruma PR kapısıdır (§6): ARAÇ şeridindeki kanca ya da ayar-etkili PR, OPS tam diff'i okumadan birleşmez. **Git dışı ayar dosyaları (`.claude/settings.local.json` ve kullanıcı düzeyi `settings.json`) için PR kapısı YOKTUR; onlar R9b'dedir** (aşağıdaki satır). Atıf düzeltmesi: "settings değişikliği OPS kapısıdır" cümlesi `docs/roller/ARAC.md`'dedir (v0.6'da yanlışlıkla CLAUDE.md'ye atfedilmişti). **Ön süzgeç (maliyet) AYRI BİR LİSTE DEĞİLDİR (v0.5):** R9 kalıpları tek bir sabit listedir; ön süzgeç aynı listenin **dize karşılaştırmasıdır** (hedefin dosya adı ya da yol sonu/segmenti kalıbın sabit kısmıyla eşleşiyor mu; git çağrısı yok). Eşleşirse git ortak dizinine bakılır, eşleşmezse R9 işletilmez. Liste ile süzgeç iki ayrı yerde yazılırsa biri eskir (v0.4'te `.claude/hafiza-yazma-ayar.json` ve test dosyası süzgeçten düşmüştü): kütüphane tek sabiti dışa açar, test her kalıbın süzgeçten geçtiğini sınar. **"Repo" tanımı (v0.5):** hedef yolun bulunduğu çalışma ağacının `git rev-parse --git-common-dir` değeri bu deponunkiyle aynıysa hedef R9 kapsamındadır; yani ana ağaç **ve her worktree** (pencereler worktree'de çalışır; worktree'deki `CLAUDE.md` serbest olsaydı R9 anlamsızlaşırdı). Ayar dosyası bunun istisnasıdır: bayrak **ana ağaçtan** okunur (aşağıda). Ek çalışma dizinlerindeki başka depolar ve `~/.claude/CLAUDE.md` bu kuralın konusu değildir. `.claude/skills/**` ve `.agent/skills/**` bu cetvelin kapsamı dışı (YETENEK). `docs/roller/**` yazımı elle değil kart üreticisi üzerindendir (kart testi elle düzenlemeyi kırmızı yapar). |
| R9b | Git dışı ayar dosyaları: `.claude/settings.local.json` (ana ağaçta, gitignored) ve kullanıcı düzeyi `settings.json` (kullanıcı ayar dizini) | tam OPS ya da şeridi ARAC olan oturum; **başka rol, HARİTA muafiyeti dahil, yazamaz** | OPS kararı 2026-10-01: bu dosyalar PR'dan geçmez, "PR kapısı" gerekçesi geçersiz; yine de kanca kaydını başka rolün silmesini engellemek için dar R9. ARAÇ'ın §10 Ayar işi mümkün kalır. Kullanıcı ayar dizini `VENTHUB_CLAUDE_KOK`/ev dizininden türetilir (§4 normalizasyon). **Her durumda davranış kuralı geçerlidir (aşağıda, Recep sözü):** kanca izin verse bile söz şartı kalkmaz. |
| R10 | **EK İZİN** (öncelik: §2 başı): geçiş taşıması: `gunluk/**`, `departman/**`, `arsiv/**`, `belge-yonetimi-devir/**` altına yazma ve silme; kökteki durum dosyalarının ve R1 dosyalarının **silinmesi/taşınması** | şeridi tam OPS olan ya da şeridi HARİTA olan oturum (HARİTA için **önek eşleşmesi yeter**, `HARITA-…` şeritleri dahil; `tam` yalnız OPS için aranır), `gecis_son` tarihine kadar (R9'un `harita_muafiyet_son`'u buraya girmez; kökteki R1 dosyalarının, **`MEMORY.md` dahil**, silinmesi/taşınması bu kapsamdadır, bilinçli) | **Ayar dosyası yoksa ya da `gecis_son` yoksa R10 kapalıdır** (§2 bayraklar); D8, D22 ve D27 satırları bu kapalı durumu sınar, açık durumu D19 sınar. Ayrı bir taşıma listesi yoktur; kapsam yol kalıbıdır, sınır tarihtir. Koşul sağlanmıyorsa R10 yok sayılır, yol normal kuralına düşer. Bash `mv` ve `cp` komutlarının **kaynağı** bugün hedef sayılmıyor (`bash-write-targets.cjs`); kaynak silme kancaya gelmiyorsa açık delik (§6), bu kalemi ARAÇ iş listesi çözer. |

**Tarihli bayraklar** (`harita_muafiyet_son`, `gecis_son`) ayar dosyasında durur: **sabit yol `.claude/hafiza-yazma-ayar.json`, ANA AĞAÇTA**
(git ortak dizininin ebeveyni; worktree kopyasından okunmaz. HARİTA'nın pencereleri `venthub-harita-*` worktree'lerinde açılır ve dosya dalda
olmasa da muafiyet düşmez; kancalar da ana ağaçtan yüklenir). Dosya R9 kapsamındadır. Biçim: ISO tarih (`YYYY-MM-DD`), UTC, "tarihe kadar" dahildir
(o günün 23:59:59 UTC'sine kadar; İstanbul saatiyle ertesi gün 02:59:59). Dosya yok, bozuk ya da alan eksikse muafiyet **yoktur** (fail-closed muafiyet
tarafında). HARİTA yeniden açılırsa bayrağı OPS yeniler; tarih geçince muafiyet kendiliğinden düşer. Testte saat `VENTHUB_SIMDI` ile (ISO,
tam damga ya da tarih) enjekte edilir.

**Temizlik istisnası (v0.4, ARAÇ kararı 2):** yalnız **tek dosya** hedefinde ve yalnız **silme ya da `arsiv/`'e taşıma** işleminde geçerlidir; içerik
yazma değildir (R4 "OPS dahil başkası yazmaz" içerik yazma içindir). Kapsam ve koşul:
- `oneri/**` tek dosya: şeridi OPS (**tam**) olan oturum, **koşulsuz** siler ya da taşır (kabul/red işareti aranmaz; işareti üretmek kancanın işi değildir).
- `gunluk/**` tek dosya (`gunluk/_sahipsiz/**` dahil): yalnız kaynak dosyanın son değişiklik zamanı **14 günden eskiyse** ve (**yazan tam OPS**, bayraktan bağımsız; ya da
  yazan şeridi HARİTA olan oturum **ve** `gecis_son` içindeyse: HARİTA kolu R10'un zaten kapsadığı geçiş taşımasıdır). v0.5'te OPS kolunun da `gecis_son`'a bağlı olduğu
  yazıyordu ve D27b'yle (R10 kapalı, OPS 20 günlük günlüğü siler → izin) çelişiyordu; doğrusu budur. Süresi dolmamış günlük hiçbir pencerece silinip taşınamaz.
  **Günlüğün sahibi (R4, R5) yazar ve ekler, silmez ve taşımaz** (silme yalnız bu istisnayla ve R10 ile; v0.6). Dosyanın yaşı (`mtime`) **kancada** ölçülür ve kütüphaneye
  hedef başına `mtimeGun` olarak verilir (kütüphane saf kalır; hedef yoksa `null`, `null` = süre dolmadı).
- **Çift OPS vetosu temizlik istisnasının OPS kolunu da kapsar** (§3).
- Dizin hedefi ve `*` hedefi bu istisnadan yararlanmaz (§2 başı).

**Şeridi olmayan pencere** hiçbir hafıza yoluna yazamaz; yalnız R2 (`_sahipsiz-` adıyla) ve R5.

---

## §3 Oturum kimliği ve şerit

**Şerit bulma (mevcut kodda bu eşleme YOK, yeni yazılır):** `lane-guard.cjs` ve `bash-write-guard.cjs` yalnız
`board.findConflict()` çağırır (başkasının canlı claim'ine çarpıp çarpmadığı); `session_id` → şerit adı eşlemesi yapmazlar.
Şerit adı, `scripts/board/board.cjs`'in dışa açık `liveClaims()` sonucundan `session_id`'si eşleşen kayıtla bulunur
(canlı = TTL içinde, release edilmemiş; `seritAdi()` dışa açık değildir ve TTL'yi yok sayar, kullanılmaz).

**Şerit adı → rol:** pano şerit adı serbest metindir (`URUN-KATALOG`, `ADMIN-UX`, `OPS-AUDIT`, `ALTYAPI-NLM`; adsız claim
literal `lane` yazar). Çözüm tek yerde yapılır: `scripts/board/pencere-adlari.cjs` içindeki `seritRolu(lane)` (dosya #1592 ile depoda ve
bugün yalnız pencerenin **görünen ad** tablosunu içerir; `seritRolu` ARAÇ'ın ayrı küçük PR'ıdır ve **henüz yoktur**; ayrı ikinci bir tablo
yazılmaz; görünen ad tablosu ile rol çözücüsü ayrı kavramlardır). Sözleşme: büyük harfe çevir ve Türkçe karakterleri ASCII'ye indir; önce tam eşleşme (`GEO-SEO`), yoksa `-` ile
ayrılmış en uzun bilinen önek (soldan); dönüş `{ rol, tam }`; bilinmeyen ya da `lane` → `null`. Rol listesi `ROLLER` anahtarlarından okunur.
**OPS için yalnız tam eşleşme** `tam: true` döner (`OPS-AUDIT` → `tam: false`). **Tek rol çözücü:** `session-board.cjs` bugün rolü `CC_LANE`
ortam değişkeninden ya da ham `lane.toUpperCase()` ile alır; enjeksiyon ve hafıza kancası **aynı** `seritRolu`'yu kullanır, yoksa aynı pencere
bir yerde URUN, öbüründe şeritsiz sayılır (ARAÇ iş listesi, §10). Panoda görülen eski adlar (`QUOTE`, `LAUNCH`, `LEGAL-*`, `RENDER-PLAN`,
`DENEME`, `AUTH-*`, `TEMIZLIK`) `null` döner: bu pencereler departman ve günlük yoluna yazamaz; engel mesajı "hangi ROL'ü alabilirsin" listesini
(`ROLLER` anahtarları) gösterir.

**`lane` ezmesi (ölçüldü, açık kusur):** `claim --globs ...` adsız çağrılırsa `board.cjs` literal `lane` yazar ve `e.lane || prev.lane`
'lane'i doluymuş sayıp **önceki gerçek şerit adını ezer** (`URUN-KATALOG → lane → URUN-KATALOG` panoda görüldü). Kalıcı çözüm `board.cjs`'te
(adsız claim önceki adı korusun; ARAÇ iş listesi). Kusur **üç yerdedir**: `board.cjs` olay birleştirmesi (`e.lane || prev.lane`, ~L183), aynı mantığın ikinci
kullanımı (~L232) ve `claim` komut satırı varsayılanı (`flags.lane || 'lane'`, ~L1221-1223). Düzeltmenin **iki parçası vardır:** adsız claim önceki adı korur **ve**
`lane` değerini boş sayar (`e.lane === 'lane'` ≡ adsız). Sonrasında bile adsız **ilk** claim'in `lane: 'lane'` kaydı ve son 24 saatin olay dosyalarındaki eski `lane` literal'leri panoda
durur; bu yüzden **D10c kanca düzeyinde güvenilir kurulamaz** ve kütüphane testine iner (girdi `{ lane: 'lane', sonBilinenAd }`; `sonBilinenAd` `tumTalepler` ve ham olaydan okunur, süresi
dolan claim'i `liveClaims` zaten düşürür). O zamana kadar çözücü `lane`'i şeritsiz sayar ve engel mesajı pencerenin son bilinen
şerit adını gösterir ("şeridin `OPS-AUDIT`, tam `OPS` değildir").

**`touch` kararı (kesin):** yeni kanca `board.touch()` çağırmaz; canlılığı mevcut `lane-guard.cjs` ve `bash-write-guard.cjs` zaten yazar.
Sonuç: süresi dolmuş claim'in sahibi ilk yazımda o iki kancadan biriyle canlanabilir ve aynı matcher'da çalışan iki kancanın sırası
tanımsızdır; bu yarış **kabul edilir** (kalite ağı). Bu yüzden D10'un "süresi dolmuş → engel" yarısı yalnız kütüphane düzeyinde
(claim listesi parametre) sınanır, kanca düzeyinde sınanmaz.

**Şeritsiz sayılan durumlar:** çözümün `null` döndürdüğü her durum (canlı claim yok, süresi dolmuş claim, `lane`, bilinmeyen ad).
Bu pencere yalnız R2 (`_sahipsiz-`) ve R5'e yazar. Her engellemede kanca şunu gösterir: pencerenin **gerçek `session_id`'si doldurulmuş**
`node scripts/board/board.cjs claim --sid <sid> --lane <ROL> --globs "<depo-göreli dosya örneği>"` (glob, hafıza yolu değil, pencerenin
çalışacağı depo içi yol örneğidir; hafıza yolu depo dışıdır ve pano onu depo-göreli glob diye saklayıp yanlış çarpıştırır), mevcut şerit adını ve
"hangi ROL'ü alacağını rol kartından seç" yönlendirmesini; mesaja OPS örneği konmaz. Şeritli ama yetkisiz pencereye (örn. `OPS-AUDIT`)
mesaj "şerit al" demez, "şeridin `<ad>`, bu yol için `<gereken>` gerekir" der.

**Alt ajan:** ebeveyninin `session_id`'siyle ve `agent_id` alanıyla gelir (ölçüldü); ebeveynin şeridiyle yazar. R4/R5 "pencerenin
kendisi" dediği yerde alt ajan dahildir (alt ajan ile ebeveyn `session_id` üzerinden ayırt edilemez). Engelde mesaj alt ajana "dosyanın
tam içeriğini raporunda döndür, ebeveynin yazsın" der **yalnız claim çakışmasında** (yabancı şeridin dosyası); **kural engelinde** (R2/R3/R4/R5, yani ebeveyn de
aynı ROL olduğu için yazamayacaksa) mesaj "ebeveyn de yazamaz; içeriği `oneri/` altına öneri olarak bırak" der (yanlış yönlendirme olmasın). Mesaj **dosya araçlarında da Bash yolunda da** verilir.
**Ekip üyesi** (agent teams, ayrı `session_id`, claim almamış) şeritsiz sayılır: yalnız R2/R5'e yazar; şerit alırsa normal kurallar işler. Yeni hafıza kancası
`agent_id`'yi kendisi okur; bugünkü `bash-write-guard.cjs` okumaz ve **değiştirilmez**, yeni kancanın kendi mesajı yeter.

**Çift OPS kuralı (OPS kararı 2026-09-30):** aynı anda birden fazla canlı claim `tam: true` OPS ise ortak çekirdeğe yazma
(R1, R3-OPS, R7, R8, R9-OPS, R10'un OPS kolu ve temizlik istisnasının OPS kolu) **her ikisine de** engellenir ve durum satırında alarm çıkar. OPS kimliği bir şerit beyanıdır
(`claim --lane OPS` herkes alabilir, `board.cjs` doğrulamaz); bu, güvenlik değil **kalite ağıdır** (§6). **Çöken pencere düzeltmesi:**
çöken ya da yeniden açılan OPS penceresinin eski claim'i TTL (4 saat) boyunca canlı kalır ve tek meşru yazıcıyı kilitlerdi; bu yüzden
"canlı OPS" sayımı 30 dakikalık sezgiyle değil, **canlılık ölçümüyle** yapılır (REC-524'te birleşen `scripts/board/canlilik.cjs`, `claude agents --json`
ile açık pencereler; hayalet/kapalı pencerenin claim'i sayılmaz; fork ya da `/clear` ile yeni `sid` alan OPS'un eski claim'i kendini kilitlemez).
Bilgi eksikse (canlılık ölçülemedi) sezgi yedek olarak 30 dakikadır (yalnız son atışı 30 dakikadan yeni olanlar sayılır).
**Çağrı koşulu ve maliyet (v0.5):** canlılık ölçümü bir süreç açar (`claude agents --json`, zaman aşımı 8 sn, 30 sn önbellek: `canlilik.cjs`); kanca bunu **her çağrıda** koşmaz.
Yalnız şu üç koşul birlikte sağlanınca çağrılır: hedef OPS yetkisi isteyen bir yol (R1, R3-OPS, R7, R8, R9-OPS, R10-OPS, temizlik-OPS), yazar `tam: true` OPS ve
`liveClaims`'te **en az bir başka** `tam: true` OPS claim'i var. Ölçüm zaman aşımına uğrar ya da hata verirse sezgiye (30 dk) düşülür ve durum satırına
`kural ölçülemedi: canlılık` düşer. Karar kütüphanesine girdi: `canlilik: { olculdu, acikSidler: [...] }` (ölçüm yapıldıysa açık pencerelerin `sid`'leri); kütüphane yalnız bunu okur,
süreç açmaz. Testte `VENTHUB_BOARD_DIR` verilince gerçek `claude` çağrılmaz (`canlilik.cjs` izole pano kuralı); D26'nın canlılık dalını kurmak için `VENTHUB_CANLILIK_HAM=<dosya>` (ham `claude agents` çıktısı) enjekte edilir (§4). **`kapali` durumu alarm DEĞİLDİR (v0.6):** `canlilik.olc()` izole panoda `{ ok:false, kapali:true }` döner;
`board.cjs` bunu alarm saymaz (emsal L467); kanca da saymaz, aksi her D17 koşusunda sahte "kural ölçülemedi: canlılık" çıkardı. Kanca `olc()`'u `onbellekYolu(panoDizini)` ve `benSid` ile çağırır (olmadan 30 sn önbellek çalışmaz). Uzun otonom turda `heartbeat` yalnız
`touch` ile ilerlediği için sezgiyle canlı OPS sayım dışı kalabilirdi; bu, canlılık ölçümünün gerekçesidir. Alarm yalnız `UserPromptSubmit` satırında görünür
(otonom turda görünmez; kabul). Engel mesajı iki claim'in `sid`'lerini ve `node scripts/board/board.cjs release --sid <eski>` komutunu gösterir. Herhangi bir pencerenin `claim --lane OPS` ile OPS'u kilitlemesi
(kilitleme saldırısı) aynı beyan sorununun sonucudur ve kabul edilir (§6).

### Ölçülemedi ≠ şeritsiz (FAIL-OPEN + görünür alarm, OPS kararı 2026-09-30)

Mevcut iki kanca bilinçli fail-open'dır (bu bir koordinasyon kapısıdır; fail-closed pano bozulunca herkesin günlüğünü durdurur).
Ancak `board.readEvents()` hiç istisna atmaz: pano dizini okunamazsa `[]` döner, bozuk satırı atlayıp stderr'e uyarı basar. Bu yüzden
"pano okunamadı" kendiliğinden fail-open'a düşmez, herkes şeritsiz görünüp **engellenir**. Üstelik `readEvents` önce `ensureDir` ile pano
dizinini yaratır ("dizin yok" görünmez) ve bozuk satır uyarısının dönüş değeri yoktur (yalnız stderr). Bu yüzden ölçülemedi durumunu
tanımak için **ARAÇ işi**: `board.durumOku()` (dizin var mı, olay dosyası sayısı, bu `sid`'in dosyası var mı, bozuk satır ve hangi dosyada;
dizini yaratmaz; §10). Kanca ölçülemedi durumunu kendisi tanır ve izin verir. Bozuk satır **yalnız bu `sid`'in kendi dosyasındaysa**
ölçülemedi sayılır; başka oturumların dosyasındaki bozuk satır kimseyi ölçülemedi yapmaz (yoksa bir bozuk satır 24 saat boyunca herkes için
kuralı kapatırdı). Boyut: panoda çoğu dosya yalnız `seen` içeren küçük dosyadır ("dosya var, claim yok" = şeritsiz) ve UUID olmayan `sid`'ler
vardır (`deneme-glob` gibi); ikisi de şeritsiz sınıfındadır.

| Durum | Sınıf | Karar |
|---|---|---|
| Pano dizini yok ya da okunamıyor | ölçülemedi | izin + alarm |
| Pano dizininde hiç olay dosyası yok | ölçülemedi | izin + alarm |
| Bu `sid`'in kendi dosyasında bozuk satır | ölçülemedi | izin + alarm |
| Başka `sid`'in dosyasında bozuk satır | (etkisiz) | normal karar |
| Olay dosyaları var, ama bu `session_id`'nin dosyası yok | şeritsiz (pencere panoya hiç kaydolmamış) | R2/R5 dışı engel |
| Bu `session_id`'nin canlı claim'i yok / süresi dolmuş | şeritsiz | R2/R5 dışı engel |
| stdin bozuk ya da boş; hafıza yolu türetilemedi (§4) | ölçülemedi | izin + alarm |

**Alarm ve olay kaydı (YALNIZ EKLE, v0.4):** kanca pano dizininde **oturum başına ayrı ve günlük** dosyaya bir satır **ekler**
(`hafiza-yazma-alarm.<sid>.<gün>.jsonl`, olay için `hafiza-yazma-olay.<sid>.<gün>.jsonl`; iki dosyanın adı bu biçimdedir, önceki metindeki `hafiza-yazma-olay.jsonl` adı geçersizdir).
Tek paylaşılan dosya olmaz (Windows'ta eşzamanlı ekleme atomik değildir). **Oku-değiştir-yaz yoktur:** aynı `sid`'in paralel araç çağrıları ve alt ajanları aynı dosyayı
eşzamanlı yeniden yazarsa satır kaybolurdu; kanca yalnız satır ekler, eski günün dosyasını **siler** (budama = dosya silme, satır atma değil). Satır: `ts`, `sid`, `sebep`
(olayda ayrıca göreli `yol`, `agent_id`, `arac`); tekilleştirme okuma tarafındadır: aynı `sid`+`sebep` için okuyucu (`board-brief.cjs`) 10 dakikada bir
satır sayar (`sid` yoksa, örn. stdin bozuk, dosya adı `sid-yok`). Durum satırında şunu okuyan kanca **adıyla
belirtilir:** `board-brief.cjs` (pano durum satırını basan mevcut `UserPromptSubmit` kancası) tüm `hafiza-yazma-alarm.*.jsonl` dosyalarının 30 dakikadan
yeni satırlarını okur. Ölçülemedi alarmı ilgili pencerenin ve OPS pencerelerinin durum satırına, çift OPS alarmı iki OPS penceresine düşer
(şeritli diğer pencereler görmez, gürültü olmasın). Her mesajın durum satırına şu düşer:
`HAFIZA YAZMA: kural ölçülemedi: <sebep>` ya da `HAFIZA YAZMA: birden fazla canlı OPS claim'i`. Yalnız günlüğe yazmak yetmez.
Engelleme mesajı stderr'e yazılır ve exit 2 ile modele döner; alarm gibi exit 0 ile verilen bilgi modele `modele-ilet.cjs`
ile iletilir (exit 0'da stderr modele ulaşmaz).

---

## §4 Hafıza dizininin türetilmesi (sabit yol YOK)

Hafıza dizini kancaya gömülmez (depo genel; kullanıcı adı taşıyan yol yazılmaz). Kanca çalışma anında **aday kümesini** türetir:

1. **`autoMemoryDirectory` tanımlıysa** yalnız o dizin hafıza sayılır, öbür adaylar devre dışı kalır (yeni dizin korunur, eski dizin artık
   yüklenen hafıza değildir; D12). Değer yalnız mutlak yol ya da ev dizini kısayoluyla başlayan yol olabilir (Claude Code belgesi:
   memory sayfası; ayar sayfası değer biçimini tutarsız anlatıyor, göreli değer kabul edilmez). Ayar dosyaları, öncelik sırasıyla:
   yerel ayar, proje ayarı, kullanıcı ayarı (aşağıdaki "ayar kaynağı" notuna bak). Bu makinede hiçbirinde tanımlı
   değildir (2026-09-30 ölçüldü). Tanımlıysa durum satırına bilgi düşer: `HAFIZA YAZMA: hafıza dizini ayarla taşınmış`.
2. **Tanımlı değilse üç aday** (hedef yol herhangi birinin altındaysa hafıza yoludur): (a) `transcript_path`'in proje dizinindeki `memory/`
   (varsa); (b) **ana depo dizini:** worktree'de açılan oturumların kendi proje dizininde `memory/` yoktur, hafıza ana deponun proje dizini
   altındadır. Türetimin başlangıç noktası `scripts/belge/belge-tazelik.cjs` içindedir (`hafizaIndeksYolu`: git ortak dizininden ana depo
   yolu, iki harf büyüklüğü adayı denenir) ama **doğrudan kullanılamaz**: `MEMORY.md` dosya yolunu döner (dizin adayı değil, dosya yoksa
   `null`) ve proje dizini adını yalnız sürücü ayracı ile bölü karakterlerini `-`'ye çevirerek üretir; Claude Code'un gerçek adı **her
   alfasayısal olmayan karakteri** `-` yapar (`C:\Users\<ad>\.claude\...` → `C--Users-<ad>--claude-...`; noktalı yolda bu fark yanlış
   aday üretir). Bu yüzden ortak işleve **çıkarılıp genişletilir** (adı **`hafizaDizinAdaylari()`**, dosya `.claude/hooks/lib/hafiza-dizinleri.cjs`; hem kanca hem `board-brief.cjs` hem bekçi hem §9 işlevi bunu çağırır; "kilit testi `:99`'u kırar" cümlesi bekçinin yasak ifadeleri kullanmasına bağlıdır, farklı adla yeni işlev testi kırmaz ama kilit bilinçli güncellenir, §7): dizin adayı döndürür, slug kuralı `[^A-Za-z0-9]` → `-`, testte noktalı yol vardır;
   (c) ortam değişkeni `CLAUDE_CODE_PROJECT_DIR_NAME` tanımlıysa proje dizini adı yerine o (Claude Code belgesi; depoda başka yerde
   kullanılmıyor, kanca yalnız okur).
3. **Yol karşılaştırma kuralı (normalizasyon):** her iki yol `path.resolve` ile çözülür (`..` gider), ters bölüler düz bölüye çevrilir,
   MSYS biçimi (`/c/...`) ve ev dizini kısayolu genişletilir, mümkünse `fs.realpathSync.native` ile bağlantılar çözülür (yoksa hedefin
   var olan en yakın üst dizini çözülür), sürücü harfi dahil **büyük/küçük harf duyarsız** karşılaştırılır (hafıza dizini bu makinede
   küçük harfle, başka proje dizinleri büyük harfle başlar; NTFS duyarsız). Sonra "altında mı" testi yapılır. **Aynı
   harf duyarsızlığı ve tam segment kuralı** ROL segmenti (`departman/urun/`), `<ROL>-` öneki ve `sid` karşılaştırması için de geçerlidir; sondaki
   nokta ya da boşluk ve `::$DATA` gibi NTFS ekleri **eşleşmez** (`<sid>.md.bak`, `<sid>.md.` engellenir). Dosya sistemi çağrıları (`realpath`)
   **kancada** yapılır; karar kütüphanesine zaten normalize edilmiş yol verilir (kütüphane saf kalır).

Aday bulunamazsa §3'teki ölçülemedi kolu işler.

**Test enjeksiyonu:** kanca gerçek kullanıcı ayarlarına ve gerçek hafıza dizinine dokunmadan test edilebilmelidir. Ortam
değişkenleri (mevcut emsaller: `VENTHUB_BOARD_DIR`, `VENTHUB_CLAUDE_KOK`, `VENTHUB_MEMORY_INDEX`; `VENTHUB_MEMORY_INDEX` bir **dosya**dır,
yeni `VENTHUB_MEMORY_DIRS` bir **dizin listesidir**, karıştırılmaz): `VENTHUB_BOARD_DIR` (pano), `VENTHUB_MEMORY_DIRS` (aday listesi, `;` ile),
`VENTHUB_AYAR_KOK` (ayar dosyalarının aranacağı kök: **worktree'de ana ağacın kökü**, çünkü kancalar ana ağaçtan yüklenir ve bayrak dosyası ana ağaçtadır;
worktree'de Claude kendi worktree ayarını okur, kanca ana ağaç ayarını okur, gitignored `settings.local.json` yalnız ana ağaçtadır; bu fark bilinen sınırdır),
`VENTHUB_GIT_ORTAK_DIZIN` (git ortak dizini; `VENTHUB_AYAR_KOK` ile **aynı değildir**: biri ayar/bayrak dosyasının aranacağı ana ağaç kökü, öbürü "bu depo mu" karşılaştırması için ortak dizin; test ikisini de verir),
`VENTHUB_CANLILIK_HAM` (D26 canlılık dalı; ham `claude agents --json` çıktısı dosyası, `canlilik.cjs` mevcut değişkeni), `VENTHUB_SIMDI` (saat, ISO; D18 ve D19 tarihli bayrakları sınar). Kullanıcı ayar dizini için mevcut
emsal `VENTHUB_CLAUDE_KOK` kullanılır (kullanıcı ayarında `autoMemoryDirectory` testi). `BOARD_DIR` `board.cjs` yüklenirken sabitlenir; süreç içi test ortamı
değiştiremez, kanca testi süreç başlatarak (spawn) yapılır.

**`autoMemoryDirectory` ayar kaynağı:** Claude Code memory sayfası (2026-09-30 iki araştırmacıyla okundu): "It is read from any settings scope: user, project,
local, policy, or `--settings`" ve ayar sayfasının kapsam sütunu "Any file". Kanca bu yüzden yerel, proje ve kullanıcı ayar dosyalarının üçünü de okur
(ayrıca yönetilen politika dosyası varsa). Birden çok dosyada farklı değer varsa en yüksek öncelikli olan (yerel > proje > kullanıcı) alınır ve
değerlerin farklı olduğu durum satırında yazılır. **Açık nokta (belge yazımı):** varsayılan konumu memory sayfası proje başına
`~/.claude/projects/<project>/memory/`, ayar sayfası `~/.claude/memory` yazıyor; bu makinede fiili konum memory sayfasıyla uyumludur (ölçüldü) ve
şartname onu esas alır. Proje ayarından gelen değer için ayrıca bir "çalışma alanı güveni" kısıtı olabileceği bir okuyucu notudur, belgeden
doğrulanmadı; ölçülecek.

---

## §5 Eşleştirici ve mimari

- **Yeni kanca yazılır** (bir önceki sürümdeki "mevcut kancalara kural eklenir" cümlesi geri alındı): `findConflict` depo-göreli glob'la
  çalışır (yolu depo köküne göre çevirir), hafıza dizini ise kendi git deposudur ve depo dışıdır; hafıza yolları ona verilmez, çünkü
  anlamsız bir göreli yol üretir. `bash-write-guard.cjs` ayrıca depo dışı hedefleri **bilerek** görmezden gelir (pano ve scratchpad
  yazımı bu kapının konusu değil). Bu yüzden hafıza kuralı ayrı bir kanca dosyasıdır (öneri ad `hafiza-yazma-bekcisi.cjs`) ve karar mantığı
  saf bir kütüphanede durur (`.claude/hooks/lib/hafiza-yazma-kurali.cjs`; test bu kütüphaneyi doğrudan çağırır). **Girdi (v0.4, ARAÇ okuması):**
  `{ arac, hedefler: [{ yol, islem, mtimeGun, repoGoreli, dizinMi, genisletmeli }], cozulemedi, panoDurumu, stdinBozuk, yolTuretilemedi, sid, agent_id, sonBilinenAd,
  claimler: [{ sid, lane, ts, heartbeat }], canlilik: { olculdu, acikSidler }, adaylar, bayraklar, simdi }`; `islem` ∈ `yaz | sil` (**`tasi` ayrı bir işlem DEĞİLDİR**, v0.6: `mv` iki hedeftir, kaynak `sil` ve varış `yaz`; "`arsiv/`'e taşıma" bu ikisinin birlikte izinli olmasıdır; R10, temizlik istisnası ve D27 işleme göre ayrılır);
  `hedefler` çoktur (Bash çok hedeflidir). **Kancada hesaplanıp kütüphaneye verilen alanlar (kütüphane saf, dosya sistemi ve git bilmez):** `mtimeGun` (hedef dosyanın yaşı, gün; yoksa `null`),
  `repoGoreli` (R9 kalıbı için depo-göreli yol; hedef bu deponun hiçbir çalışma ağacında değilse `null`), `sonBilinenAd` (bu `sid`'in panoda son görülen şerit adı; D10c), `canlilik` (§3).
  `panoDurumu` `board.durumOku()` sonucudur (D11); `cozulemedi` Bash çıkarıcısının işaretidir, `genisletmeli` hedef başınadır (`$DEĞİŞKEN`/`$(…)`/ters tırnak, §2).
  **`islem` kaynağı:** dosya araçlarında `Edit`/`Write`/`MultiEdit`/`NotebookEdit` her zaman `yaz`'dır (bu araçlarla silme ya da taşıma yoktur; **temizlik istisnası yalnız Bash yolundadır**).
  Bash'te `islem` komutun **fiilinden** türetilir: `rm`/`unlink`/`rmdir` → `sil`, `mv` → kaynak `sil` + varış `yaz`, `cp` → varış `yaz`, diğer yazma fiilleri `yaz`. Bugünkü `bash-write-targets.cjs` **hedef başına fiil döndürmez** (hedef ve sebep listeleri hizalı değildir; `mv`/`cp` için yalnız son argüman gelir; ölçüldü, v0.5 okuması): bu yüzden
  "hedef başına `islem` + `mv`/`cp` kaynağı" **ARAÇ iş listesinin kabul koşuludur** (§10 kalem 7); o gelene kadar (v0.6 düzeltmesi: v0.5'te "bilinmeyen `yaz` sayılır, en kısıtlı" yazıyordu ve **gevşekti**: sahibin kendi günlüğünü `rm` ile silmesi `yaz` sayılıp R4'ten izin çıkardı) **kanca**
  komut metninde `rm`/`unlink`/`rmdir`/`mv` sözcüğü görürse, çıkarıcının verdiği hedeflerin **her birini hem `sil` hem `yaz` olarak** değerlendirir; biri engelse komut engellidir (en kısıtlı gerçekten).
  Sonuç: Bash yolunda temizlik istisnası kalem 7 gelene kadar **kapalıdır** (sil+yaz birlikte hiçbir istisnaya uymaz) ve D27 Bash ayağı yalnız kütüphane düzeyinde sınanır.
  `genisletmeli` işaretini **kanca kendisi** hesaplar (hedef metninde `$`, `$(` ya da ters tırnak varsa; çıkarıcı hedefi ham döndürüyor, bu ARAÇ'ın sonraki işine bağlı değildir, v0.6). `cozulemedi` bayrağı olan komutta toplam karar: kanca sıfır hedefle kütüphaneyi çağırmaz;
  mevcut `bash-write-guard.cjs` çözülemeyen hedefi zaten engeller, yeni kanca bu kolu tekrarlamaz (D15a) ve yalnız çıkarılabilen hedeflerin kararını verir. **Çıktı:** her hedefin `izin | engel | olculemedi` kararı,
  sebebi ve kuralı; toplam karar hedeflerin **en kötüsüdür** (bir hedef engelse komut engelli).
- **Bash yolu:** hedef çıkarımı mevcut `bash-write-targets.cjs` kütüphanesini kullanır (yeni ayrıştırıcı yazılmaz). Kural
  `depoIcindeMi` süzgecinden **önce**, **ham** hedefler üzerinde çalışır; pano ve scratchpad muafiyeti korunur. Bu kütüphanenin sınırları
  §6'da açık delik olarak yazılıdır (`cd` izlemez, `;`/`&&` ile bölünen komutlarda yorumlayıcı gövdesini kaçırır, PowerShell fiillerini ve
  `git -C` alt komutlarını tanımaz); ayrıştırıcıyı genişletmek ARAÇ iş listesindedir (§10) ve bu şartnamenin kabul koşulu değildir.
- **Çalışma sırası (maliyet, v0.5 düzeltmesi):** kanca her `Edit`/`Write`/`Bash` çağrısında koşar; pano 200'den fazla olay dosyası okuyabilir. Sıra:
  hedef yol çıkar → **iki ucuz ön koşul** (hiçbiri git SÜRECİ ya da pano açmaz): (i) hedef R9 kalıp sabitinin dize karşılaştırmasına uyuyor mu (§2 R9), (ii) hedef **aday kümesinin** altında mı → ikisi de
  **hayırsa hemen çık**; ancak biri evetse pano ve olay kaydı. Gözlem satırı yalnız hafıza-yolu çağrılarında yazılır. **Aday kümesi nasıl ucuz türetilir (v0.6; v0.4-v0.5'in "süreç içi önbellek"
  cümlesi yanlıştı, PreToolUse kancası çağrı başına YENİ süreçtir):** git ortak dizini `git` süreci açılmadan çözülür: `.git` bir **dosyaysa** (worktree) içindeki `gitdir:` satırından çalışma ağacının
  `.git/worktrees/<ad>` dizinine, oradaki `commondir` dosyasından ortak dizine gidilir (üç küçük dosya okuma); `.git` dizinse ortak dizin odur. Sonuç ayrıca **diske** önbelleklenir (pano dizininde
  `hafiza-yazma-aday.<cwd-özeti>.json`, ömrü 10 dakika; ayar dosyası değişince geçersiz) ki her çağrıda üç dosya okuma da yinelenmesin.
- **Araçlar ve alan adı:** `Edit`, `Write`, `MultiEdit`, `NotebookEdit`, `Bash` ve `PowerShell`. Yol alanı `file_path`'tir, `NotebookEdit`'te `notebook_path`,
  `MultiEdit` yükünde `edits[].file_path` da olabilir (belge özeti düşük güvenilirlikli; kanca yükteki **tüm yol alanlarını** tarar: `file_path`, `notebook_path`,
  `edits[].file_path`; bugün yalnız `file_path` okunuyor). Eşleştirici tam adla eşleşir: `Edit|Write` diğerlerini
  tutmaz. Bu, `.claude/settings.json` kaydının (`PreToolUse`, eşleştirici `Edit|Write|MultiEdit|NotebookEdit|Bash|PowerShell`) değişmesi ve
  değişikliğin **ana ağaca** ileri sarılması demektir (kancalar ana ağaçtan yüklenir).
- **Engelleme:** çıkış kodu 2, sebep stderr'e yazılır ve modele döner. Mesaj: hangi kural (R numarası), izinli yol, şerit alma
  komutu ve "ortak çekirdek için `oneri/` altına talep bırak" yönlendirmesi.
- **`permissions.deny` bu iş için yetmez:** deny kuralları oturuma göre ayırt etmez, OPS'u serbest bırakamaz. Doğru anahtar
  `Edit(yol)`'dur (Windows'ta yol POSIX biçimine çevrilir, mutlak yol `//c/...` biçiminde yazılır); Claude Code izin belgesi (permissions.md,
  2026-09-30 okundu): "`Edit` rules apply to all built-in tools that edit files" ve `Write`, `NotebookEdit`, eski `MultiEdit` ile yazılan yol kuralı "kabul edilir ama
  hiç sorgulanmaz", açılışta uyarı verir.
- **Gözlem kaydı:** hafıza yolu çağrılarında (izin ya da engel) pano dizininde **oturum başına ve günlük** `hafiza-yazma-olay.<sid>.<gün>.jsonl` dosyasına
  kısa bir satır **eklenir** (§3 "yalnız ekle"; `ts`, `sid`, `agent_id`, `arac`, `yol` [hafıza dizinine göreli], `yol_sinifi` [R numarası], `karar`); D14 (Claude'un
  kendi otomatik yazımı) buradan okunur ve yolu içeren satır normal yazımı otomatik yazımdan ayırt etmeyi sağlar. 7 günden eski **günün dosyası silinir**.
- **Hangi kanca durum satırını basar:** `board-brief.cjs` (pano durum satırını basan mevcut kanca; `defter-tazelik-satiri` BELGE satırını, `hafiza-sorusu-yonlendirme`
  konu satırını basar ve bu işle ilgisizdir); alarm ve çift OPS satırını yalnız `board-brief.cjs` okur.
- **Hafıza dizini taşınmış bilgisi** (§4 madde 1) kancadan değil `board-brief.cjs`'ten gelir; `board-brief.cjs` §4 türetimini ortak işlevle çağırır (kanca yalnız araç çağrısında koşar, ayarı
  her mesajda okuyamaz).

---

## §6 Sınırlar: tam kilit DEĞİL (sebep belge, OPS kararı)

Bu düzen **kalite ağıdır, güvenlik sınırı değildir.** Bilinen delikler:

| Delik | Sebep | Karşılık |
|---|---|---|
| **OPS kimliği beyandır** | `board.cjs claim --lane X` doğrulamasızdır (`lane: flags.lane \|\| 'lane'`); herkes `OPS` adını alabilir. | Çift OPS alarmı (§3); blok mesajlarında OPS örneği yok; sid listesi gibi güçlü doğrulama şimdilik yok (OPS kararı). |
| **Bash ile dolaylı yazma** | `Edit\|Write` eşleştiricisi Bash'i yakalamaz; Claude Code belgesi Bash'te yalnız tanınan dosya komutlarını (`cat`, `sed`, `tee` gibi, liste kapalı değil) ve yönlendirme hedeflerini denetlediğini, betiklerin ve dolaylı yazmaların yakalanmadığını, tam kilit için işletim sistemi sandbox'ının gerektiğini söyler. | Yeni kanca Bash komut metnindeki hedefi yakalar. **Yalnız tek segmentli** `python -c "...open(p,'w')..."` / `node -e "...writeFileSync..."` gibi yorumlayıcı gövdelerinde mevcut `bash-write-targets.cjs` yazma imzasını görürse hedefi çözemeyip **engeller** (her yola, OPS dahil, fail-closed). **Geçer (açık delik):** `;`, `&&`, `\|` ya da satır sonu içeren komut (çıkarıcı tırnak içinde de böler, gövde parçalanır ve imza kaçar); imza listesinde olmayan yazma biçimleri (`Path.write_text`, `Set-Content`, `perl -pi`); `mv` ve `cp` **kaynağı**; `git -C <hafıza> checkout/reset/clean/rm/stash` (hafıza dizini kendi git deposudur). **Ek geçen biçimler (ARAÇ'ın çalıştırarak ölçtüğü, v0.4):** bitişik yönlendirme `echo x>MEMORY.md`; tırnak içinde `;`/`\|`/`&&` sonrası yönlendirme `echo "a; b" > MEMORY.md`; `&>`, `>\|`; `sed -Ei`, `sed --in-place=.bak`; `<<` içeren komutta yalnız ilk sözcük fiil sayılır (`cat <<EOF \| tee MEMORY.md`); `touch`, `mkdir`, `ln`, `install`, `curl -o`, `wget -O`, `rsync`, `patch`, `git apply`; `cp -t DİZİN`. Ters yönde yanlış pozitif: `echo ">MEMORY.md"` hedef sayılır. Bu biçimlerin çoğu **çıkarıcının genişletilmesiyle** kapanır (ARAÇ sonraki işi); ikinci katman olarak komut metninde aday dizin yolu (harf/bölü normalize) geçiyor ve fiil okuma listesinde değilse **izin + alarm** önerilir. **Mevcut kapı D15a'yı zaten engelliyor:** `bash-write-guard.cjs` çözülemeyen hedefi (yorumlayıcı gövdesinde yazma imzası) `depoIcindeMi` süzgecinden önce her yola engeller; yeni kanca bu kolu **tekrarlamaz** (yalnız çift mesaj üretirdi). |
| **Sonradan yakalama YOK** | `bash-write-audit.cjs` yalnız çalışma ağaçlarının `git status`'ünü tarar; hafıza dizini bir ağaç değildir ve çalışma dizini kullanıcı ayar dizini altındaysa hiç çalışmaz. **Hiçbir mevcut kanca hafızaya betikle yazılanı görmez.** | Açık delik. İstenirse ayrı bir hafıza dizini taraması (dosya değişiklik zamanı ile `hafiza-yazma-olay.<sid>.<gün>.jsonl` dosyalarının karşılaştırması) sonraki iştir. |
| Bash kaza yolları | `cd <hafıza> && echo x > MEMORY.md`: çıkarıcı **`cd`/`pushd` izlemez**, `&&` ile segmentler bağımsızdır, göreli hedef kancanın cwd'sine göre çözülür → **yakalanmaz (açık delik)**. `$DEĞİŞKEN`, ev dizini kısayolu ve `*` içeren hedefler: çıkarıcı bunları işaretlemez, göreli yol gibi çözer. | Ev dizini kısayolu ve MSYS `/c/...` yolları kanca tarafında §4 normalizasyonuyla çözülür (**engel**). `*` içeren hedef kanca tarafında §2 "statik önek genişletmesi" ile karara bağlanır (izin ya da engel; alarm değil). `$DEĞİŞKEN`, `$(…)` ve ters tırnak içeren hedefi **kanca** işaretler (`genisletmeli: true`, hedef metnine bakarak; çıkarıcı bunu yapmaz ve değiştirilmesi gerekmez, §5); işaretli hedef **izin + alarm**, D13d kanca düzeyinde sınanır. `cd` izleme yoktur: açık delik, sonraki iştir. **Kalem 7 öncesi açık delikler (v0.8):** `unlink`/`rmdir` hedefi çıkarıcıdan hiç gelmez (yalnız `rm` üretir) ve `mv`/`cp` kaynağı gelmez; bu yüzden `unlink <hafıza>/MEMORY.md` ve `mv gunluk arsiv/`'in kaynağı kalem 7'ye kadar **geçer**; D27c/D27d yalnız `rm` ve kütüphane düzeyinde sınanır. |
| PowerShell | Ana ortamın kabuğu PowerShell (bu oturumun ortam satırı böyle diyor); `settings.json`'da hiçbir kayıt PowerShell içermiyor ve `Set-Content`, `Out-File`, `Add-Content`, `Copy-Item`, `Move-Item` için hedef çıkaran kod yok (`eylem-defteri.cjs` fiilleri kaydediyor ama hedefe bakmıyor). | Eşleştirici `PowerShell` aracını da kapsar (§5); hedef çıkarımı ARAÇ'ın sonraki işidir; o zamana kadar PowerShell yükünde hedef çıkarılamaz ve kanca **izin verir** (açık delik). Komut metninde aday dizin yolu geçiyorsa **izin + alarm** (`kural ölçülemedi: powershell hedefi`; hedef çıkaramadığı için `cozulemedi` değil, ölçülemedi sınıfı). |
| **ARAÇ'ın kanca ve pano kodu R9 dışıdır (v0.6)** | `.claude/hooks/**`, `scripts/board/**` ve `INV-HAFIZA-YAZMA-1` test dosyası OPS-only değildir; yeni kanca kendini ve komşusunu kilitlemez (`protect-config.cjs` başlığı kendini koruma kilidinin yanlış-pozitif ürettiğini kaydeder). Kanca kodunu değiştiren herhangi bir şerit R9 kapısına takılmaz. | Koruma PR kapısıdır: **ARAÇ şeridindeki kanca ya da ayar-etkili PR, OPS tam diff'i okumadan birleşmez** (OPS şartı, 2026-10-01); kanca/ayar değişikliği OPS'a tam diff gösterilir ve OPS birleştirme onayı verir ("settings değişikliği OPS kapısıdır": `docs/roller/ARAC.md`). R9'dadır: kapının ayar dosyası (`hafiza-yazma-ayar.json`); R9b'dedir: git dışı ayar dosyaları (`settings.local.json`, kullanıcı düzeyi `settings.json`; PR kapısı olmadığından dar R9: yalnız tam OPS ve ARAC). **Kabul edilmiş sınır:** sürümlü `.claude/settings.json`'dan kanca kaydını silmek ve `.claude/hooks/**`'taki kanca dosyasını silmek ya da değiştirmek kapıyı kapatır (PR kapısı + OPS tam diff okuması korur); ARAC/OPS'un git dışı ayara kendi yazımı da kancayla değil davranış kuralıyla (Recep sözü, başlık notu) korunur (kalite ağı, güvenlik sınırı değil). |
| Kancayı kapatma | `disableAllHooks` ve `allowManagedHooksOnly` anahtarları var; kullanıcı ayarındaki kanca başka ayar dosyasından kapatılabilir. | Yönetilen katmana (yönetici hakkıyla) koymak ayrı karardır, bu modelin dışında. |
| Claude'un kendi otomatik hafıza yazımı | Standart `Edit`/`Write` araçlarıyla yapılır; iç yolun kural denetimini atlayıp atlamadığı belgede yazmıyor. | **Denenecek** (D14). Kancadan geçerse şeritli pencerenin "bunu hatırla" isteği R1'e takılır ve mesaj `oneri/` yolunu gösterir; geçmezse `autoMemoryEnabled: false` kararını OPS ve Recep verir. |
| Ölçülemedi | §3 | Durum satırı alarmı |

Bu tabloya "tamam, kilitlendi" yazılmaz; her satır ya denenmiş ya da açık deliktir.

---

## §7 Okuma

Claude Code `MEMORY.md`'nin ilk 200 satırını ya da 25 KB'ını (hangisi önce) her oturum başında yükler; konu dosyalarını istek üzerine okur.
Bu yüzden ortak çekirdek küçük kalır (mevcut yumuşak eşik 160 satır / 20 KB, `hafiza-indeks-bekcisi.cjs`). Departman hafızası Claude'un
yerleşik yoluyla **yüklenmez** (proje başına tek hafıza dizini vardır ve aynı klasörde açılan pencereler onu paylaşır); açılışta
`SessionStart` kancası pencerenin `departman/<ROL>/MEMORY.md` indeksini rol kartıyla birlikte enjekte eder ve enjeksiyonun **üst
sınırı** vardır (öneri 60 satır / 8 KB; aşarsa kesilir ve kesildiği yazılır). `hafiza-indeks-bekcisi.cjs` yalnız dizin adı `memory` olan
`MEMORY.md`'yi tanıdığından kapsamı `departman/*/MEMORY.md`'ye genişletilir ve departman indeksi için eşik enjeksiyon üst sınırıyla **aynıdır**
(60 satır / 8 KB; yoksa bekçiden geçen bir indeks enjeksiyonda sessizce kırpılırdı). **Bu eşik YUMUŞAKTIR** (bekçi uyarır, engellemez; enjeksiyon kırpar);
sert eşik ana indeksin mevcut 200 satır / 25 KB sınırıdır. `src/__tests__/conformance/hafiza-indeks-bekcisi-kilidi.test.ts` bugün bekçi kaynağında
`projeDiziniBul` ve `os.homedir()` kullanımını yasaklıyor (`:99`; kırılacak tek onay budur) ve `exit(2)`'nin tam bir yerde olmasını istiyor (`:84`; bekçiye yeni `exit(2)` eklenmediği, eşik de yumuşak kaldığı
sürece **kırılmaz**; eşik sert olsaydı kırılırdı); ortak aday işlevi `:99`'u kırar. Bu test **bilinçli güncellenir** (yeni ortak işlev serbest; mutlak **kullanıcı yolu** yasağı kalır; testte gerekçe satırı yazılır). Bekçi hedefi bugün
`dirname === 'memory'` ile tanır; departman için `.../departman/<ROL>/MEMORY.md` biçimi ve "katlanmış mı" araması **departman dizininde** yapılır (kökte değil).
Yeni açılan pencerenin claim'i açılışta henüz yoktur:
enjeksiyon `seritRolu` (§3) ile çözülen role göre basar; rol çözülemiyorsa departman hafızasını basmaz ve "şerit al, sonra departman hafızan gelir" der.
Alt klasör `CLAUDE.md`'si yalnız o klasördeki bir dosya
okununca yüklendiği için departman talimatı için güvenilir bir yol değildir.

---

## §8 Deneme senaryoları (her "izin" satırının "engel" eşi vardır)

Kanca kurulunca işi yapmamış bağımsız bir ajan bu tabloyu koşar; sonuç REC-530'a yazılır. D1-D13, D16-D19 ve D20-D34 otomatik testtir
(§10), D14-D15 elle denemedir. **Her satır ayar durumunu ve `simdi`'yi açıkça söyler** ("R10 kapalı", "`gecis_son` içinde"); söylemeyen satır "R10 kapalı"dır. "Şeritli URUN" = canlı claim'i `URUN` olan oturum. Her R kuralının (R1-R10) en az bir izin ve bir engel satırı
vardır; K0 sınanamaz (§2). **Sabotaj listesi:** her kural için "o kuralı `izin`e çeviren mutasyon" testte kırmızı verir (R6, R7, R8 dahil); kural
kaldırılınca hiçbir satırın düşmemesi bir kusurdur.

| No | Senaryo | Beklenen |
|---|---|---|
| D1 | Şeridi OPS (`tam`) olan oturum `MEMORY.md`'ye yazar / şeridi `OPS-AUDIT` olan oturum aynı yola yazar | izin / **engel** (R1, önek tam değil) |
| D2 | Şeritli URUN `MEMORY.md`'ye yazar | **engel** (R1), mesajda `oneri/` yönlendirmesi ve OPS örneği yok |
| D3 | Şeritli URUN kendi `departman/URUN/`'ına / `departman/ALTYAPI/`'na yazar | izin / **engel** (R3) |
| D4 | Şeritli URUN `oneri/URUN-x.md` yazar / `oneri/ALTYAPI-x.md` yazar / şeritsiz pencere `oneri/URUN-x.md` yazar | izin / **engel** (R2) / **engel** |
| D5 | Şeritsiz pencere `oneri/_sahipsiz-<kendi-sid>-x.md` yazar / `oneri/_sahipsiz-<başka-sid>-x.md` yazar | izin / **engel** |
| D6 | Şeritsiz pencere `departman/URUN/` yazar | **engel** + `önce şerit al` komutu |
| D7a | Şeritsiz pencere `gunluk/_sahipsiz/<kendi-sid>.md` / `<başka-sid>.md` yazar | izin / **engel** (R5) |
| D7b | Şeritsiz pencere `gunluk/_sahipsiz/<KENDİ-SID-BÜYÜK-HARF>.md` yazar | izin (harf duyarsız) |
| D7c | Şeritsiz pencere `gunluk/_sahipsiz/../URUN/x.md` yazar | **engel** (çözülünce R4) |
| D7d | Şeritsiz pencere `gunluk/_sahipsiz/<kendi-sid>.md.bak` / `<kendi-sid>.md.` yazar | **engel** (R5 tam ad; `.bak`, sondaki nokta eşleşmez) |
| D8 | **(R10 kapalı: ayar dosyası yok ya da `gecis_son` geçmiş)** Şeritli URUN `gunluk/URUN/`'a / `gunluk/ALTYAPI/`'ya yazar; şeridi OPS olan oturum `gunluk/URUN/`'a yazar | izin / **engel** / **engel** (R4) |
| D9 | Alt ajan (`agent_id` var, ebeveyn URUN) `departman/URUN/`'a / `departman/ALTYAPI/`'ya / `gunluk/URUN/`'a yazar | izin / **engel** / izin; kural engeli (R3) mesajı "ebeveyn de yazamaz; içeriği `oneri/` altına bırak" der, "raporunda döndür, ebeveyn yazsın" yalnız claim çakışmasında söylenir (§3; dosya araçlarında ve Bash'te aynı metin) |
| D10a | **Kütüphane düzeyinde** (claim listesi parametre; kanca düzeyinde sınanmaz, §3 `touch` kararı): süresi dolmuş claim'li pencere `gunluk/URUN/`'a yazar | **engel** (şeritsiz) |
| D10b | Aynı oturum `ALTYAPI` sonra `ALTYAPI-NLM` adıyla claim almış; `departman/ALTYAPI/x.md` / `departman/URUN/x.md` yazar | izin (aynı ROL) / **engel** (farklı ROL) |
| D10c | **Kütüphane testi** (kanca düzeyinde kurulamaz, §3): girdi `{ lane: 'lane', sonBilinenAd: 'URUN-KATALOG' }` ile `departman/URUN/x.md` yazımı | **engel** (`lane` = şeritsiz) ve mesaj son bilinen adı (`URUN-KATALOG`) gösterir |
| D11a | Pano dizini yok / hiç olay dosyası yok | izin + durum satırında `kural ölçülemedi: <sebep>`; testte pano dizini önceden **kanca tarafından** kontrol edilir (`readEvents` dizini yaratır, test dizini kirletmemeli) |
| D11b | Bu `sid`'in kendi dosyasında bozuk satır / başka `sid`'in dosyasında bozuk satır | izin + alarm / normal karar |
| D11c | Olay dosyaları var ama bu sid yok; yalnız `seen` içeren dosya; UUID olmayan `sid` | **engel** (şeritsiz) |
| D12 | `autoMemoryDirectory` başka dizine ayarlı: yeni dizinde `MEMORY.md`'ye şeritli URUN yazar / eski dizindeki `MEMORY.md`'ye yazar | **engel** (yeni dizin korunur) / izin (artık hafıza değil) |
| D13a | `MultiEdit` ile D2'yi tekrarla (aynı `file_path` yükü) | **engel** (R1) |
| D13b | `NotebookEdit` ile hafıza kökünde `x.ipynb` (`notebook_path` yüküyle) yazar | **engel** (R8: `.ipynb` R1 ortak ders dosyası değil, tablo dışı yol) |
| D13c | Bash yönlendirme `> MEMORY.md` (mutlak yol ile), `tee MEMORY.md`, ev dizini kısayolu ve MSYS `/c/...` biçimi | **engel** (R1; dört yol da aynı kural) |
| D13d | **Kanca düzeyi** (`genisletmeli` işaretini kanca hesaplar, §5; v0.7: önceki "çıkarıcı işaretlemediği için yalnız kütüphane testi" notu geri alındı): Bash `$HOME/…/MEMORY.md` hedefi / hafıza kökünde `*.md` hedefi, yazar şeritli URUN | izin + alarm (`genisletmeli`) / **engel** (`*` statik önek genişletmesiyle R1'e düşer; §2) |
| D14 | Claude'un kendi otomatik hafıza yazımı: şeritli URUN pencerede "bunu hatırla" isteği | denenecek; iki dal: kancadan geçer (`hafiza-yazma-olay.<sid>.<gün>.jsonl`'de kayıt var) → R1 engeli ve `oneri/` yönlendirmesi; geçmez (kayıt yok) → `autoMemoryEnabled: false` kararı OPS ve Recep'te |
| D15a | Bash tek segmentli: `python -c "open('MEMORY.md','w').write('x')"` ile hafızaya yazma | **engel, mevcut `bash-write-guard.cjs` kapısından** (yorumlayıcı imzası, çözülemeyen hedef; her yola, OPS dahil); yeni kancanın bu kolu tekrarlamadığı ayrıca doğrulanır (çift mesaj yok) |
| D15b | Bash: `python -c "import os; open('MEMORY.md','w').write('x')"` (imza **ikinci** segmentte kalıyor: `;` ile bölünür), `python -c "open(p,'w').write('x');print(1)"` (imza ilk segmentte: bunun **engel** olduğu ölçüldü, D15a ile aynı), `Path(p).write_text('x')`, `cd <hafıza> && echo x > MEMORY.md`, `git -C <hafıza> checkout .` | ilk komut ve `write_text`, `cd`, `git -C` biçimleri **geçer** (açık delik, §6; hiçbir kanca görmez); ikinci komut **engel** |
| D16a | Worktree'de açılmış şeritli URUN `departman/URUN/`'a yazar | izin (ana depo dizini adayı) |
| D16b | Worktree'de açılmış şeritli URUN `MEMORY.md`'ye / `departman/ALTYAPI/`'na yazar | **engel** (R1 / R3) |
| D17 | Aynı anda iki canlı `tam` OPS claim'i: biri `MEMORY.md`'ye yazar | **engel** (ikisine de) + durum satırında çift OPS alarmı |
| D18 | R9: OPS `CLAUDE.md`'ye yazar / şeritli URUN yazar / HARİTA `harita_muafiyet_son` içinde / sonra yazar | izin / **engel** / izin / **engel** |
| D19a | R10 (**ek izin**): geçiş süresince HARİTA `gunluk/URUN/x.md` yazımı ve `arsiv/x.md` yazımı / `gecis_son` sonrası aynıları | izin (R10 koşulu) / **engel** (R10 yok sayılır; `gunluk/URUN/` R4'e, `arsiv/` R7'ye düşer) |
| D19b | Geçiş süresince şeritli URUN kendi `gunluk/URUN/x.md`'sine / `gunluk/ALTYAPI/x.md`'ye / `arsiv/x.md`'ye yazar | izin (R4, R10 gerekmez) / **engel** (R4) / **engel** (R7) |
| D19c | Geçiş süresince şeritsiz pencere `gunluk/_sahipsiz/<kendi-sid>.md` yazar | izin (R5; R10 karar verici olsaydı bu düşerdi) |
| D19d | **R10 açık** (`gecis_son` içinde): şeridi tam OPS olan oturum `gunluk/URUN/x.md`'ye yazar; **R10 kapalı** (ayar yok): aynı yazım | izin (R10) / **engel** (R4; D8 ile aynı) |
| D20 | R6: şeritli URUN kendi kökteki `urun-lane-day-x.md`'sine / `aracin-x-state.md`'ye (önek `-`'sız) / `altyapi-lane-state-x.md`'ye yazar | izin / **engel** (R1'e düşer) / **engel** (R6 başka ROL) |
| D21 | R6: `urun-katalog-lane-day-x.md` dosyasına şeridi `URUN-KATALOG` olan oturum / şeridi `URUN` olan / şeridi `KATALOG` olan yazar | izin / izin (aynı ROL URUN) / **engel** (en uzun önek URUN, KATALOG değil) |
| D22 | R7 (**R10 kapalı**): şeridi OPS (tam) `arsiv/x.md`'ye yazar / şeridi `OPS-AUDIT` olan / şeritli URUN | izin / **engel** / **engel** |
| D23 | R8: şeridi OPS (tam) hafıza kökünde `x.py`'ye yazar / şeritli URUN aynı yola | izin / **engel** |
| D24a | R9 kaynak dosyaları: şeritli URUN `scripts/belge/rol-karti-uret.cjs`'e / `scripts/belge/cetvel-sahipligi.json`'a / `.claude/hafiza-yazma-ayar.json`'a yazar; `.claude/settings.json`'a ve `.claude/hooks/x.cjs`'e yazar (R9 dışı, §6 kabul edilmiş sınır) | **engel** (ilk üç yol; ön süzgeç üçünü de yakalar) / izin (son ikisi, hafıza kuralının konusu değil) |
| D24b | D24a'nın üç R9 yoluna: OPS (tam) yazar; HARİTA `harita_muafiyet_son` içinde `rol-karti-uret.cjs`'e ve `cetvel-sahipligi.json`'a yazar; HARİTA muafiyet içinde `.claude/hafiza-yazma-ayar.json`'a yazar; HARİTA muafiyet bittikten sonra `rol-karti-uret.cjs`'e yazar | izin / izin / **engel** (ayar dosyası HARİTA muafiyetinden hariç) / **engel** |
| D24d | **Ön süzgeç sınaması (kütüphane testi):** R9 kalıp sabitindeki HER kalıp için örnek bir yol kütüphanenin ön süzgecinden geçer; süzgeçte olmayan bir kalıp varsa test kırmızı | geçer / kırmızı (liste ile süzgeç aynı sabit olduğu için kırılma sabotaj kolunda ölçülür) |
| D33 | §9b: şeritli URUN `gunluk/URUN/gecmis/2026-10-03.md`'ye yazar; ALTYAPI oturumu `gunluk/URUN/gecmis/2026-10-03.md`'ye yazar; tam OPS aynı dosyaya yazar (R10 kapalı) | izin / **engel** (R4) / **engel** (R4; OPS başkasının günlüğüne yazamaz) |
| D34 | §12 (kütüphane düzeyi, §10 "Künye uyarısı" gelince): yazma bekçisi ortak çekirdeğe künyesiz (tarihsiz ya da kaynaksız) yeni satır yazılırken; künyeli satır yazılırken | izin + **uyarı** (engel değil; mesaj "yazıldı + kaynak ekle") / izin, uyarı yok |
| D32 | Ölçülemedi sınıfı: stdin bozuk / boş (yük okunamadı); hafıza yolu türetilemedi (aday kümesi boş) | izin + alarm (`kural ölçülemedi: <sebep>`; §3 tablosunun iki satırının D karşılığı) |
| D24c | **Worktree** (kanca düzeyi, **gerçek git fixture** gerekir: `git worktree add` ile geçici ağaç; kütüphane testi `repoGoreli` verir ama kapsam kararını kanca verir): `…/.claude/worktrees/x/CLAUDE.md`'ye şeritli URUN yazar / OPS (tam) yazar; başka depodaki `CLAUDE.md`'ye OPS yazar | **engel** (aynı git ortak dizini) / izin / izin (R9 kapsamı dışı) |
| D24e | R9b: git dışı ayar dosyası `.claude/settings.local.json`'a ve kullanıcı düzeyi `settings.json`'a yazar: tam OPS / şeridi ARAC / şeridi HARİTA (muafiyet içinde) / şeritli URUN | izin / izin / **engel** / **engel** |
| D25 | Bayrak dosyası yok, bozuk ya da alanı eksik iken HARİTA `CLAUDE.md`'ye yazar | **engel** (muafiyet yok, §2) |
| D26 | Çift OPS (kütüphane girdisi `canlilik: { olculdu, acikSidler }`): (a) `olculdu: true`, biri `acikSidler`'de **yok** (çöken/hayalet), öteki var; (b) `olculdu: false` (zaman aşımı) ve biri son atışı 30 dakikadan eski; (c) `olculdu: true`, ikisi de `acikSidler`'de | (a) çift OPS **değil**, açık olan `MEMORY.md`'ye yazar: izin, alarm yok / (b) aynı: izin + durum satırında `kural ölçülemedi: canlılık` / (c) **engel** (ikisine de) + çift OPS alarmı (D17 ile aynı) |
| D27a | **(R10 kapalı; kütüphane düzeyi, Bash ayağı §10 kalem 7 gelince kancada)** Temizlik (**tek dosya**; taşıma = kaynak `sil` + `arsiv/` varışı `yaz`, iki hedef): OPS (tam) `oneri/x.md`'yi `arsiv/`'e taşır ya da siler / şeritli URUN aynı işlemi yapar | izin (koşulsuz; taşımada iki hedef de izin) / **engel** |
| D27d | **(R10 kapalı; kanca düzeyi, kalem 7 öncesi)** Bash `rm gunluk/URUN/x.md` (hedef `yaz` ve `sil` olarak ikişer kez değerlendirilir): şeritli URUN sahibi kendi dosyasını siler / OPS (tam) 20 günlük dosyayı siler | **engel** (sil kolu R4'te sahibe kapalı; en kısıtlı) / **engel** (kalem 7 öncesi sil+yaz birlikte hiçbir istisnaya uymaz; kalem 7 sonrası D27b ile izin) |
| D27b | **(R10 kapalı; `mtimeGun` girdisiyle)** Temizlik: OPS (tam) `mtimeGun: 20` `gunluk/URUN/x.md`'yi siler / `mtimeGun: 3` olanı siler / `mtimeGun: null` (dosya yok) / şeritli URUN `mtimeGun: 20` olanı siler | izin / **engel** (14 gün dolmadı) / **engel** (süre dolmadı sayılır) / **engel** (yazan tam OPS ya da şeridi HARİTA değil) |
| D27c | **(R10 kapalı; kütüphane düzeyi: kalem 7 öncesi çıkarıcı `mv` için yalnız varış `arsiv/`'i döndürür, kancada bu satırın ikinci hücresi görünmez)** Dizin ve `*` hedefi: OPS (tam) `rm -rf gunluk/URUN` / `mv gunluk arsiv/` (hedefler: `gunluk` dizini `sil`, `arsiv/` `yaz`; kaynak §10 kalem 7 gelince görünür) / OPS (tam) `departman/*/x.md` silme / şeritli URUN `departman/*/x.md` silme | **engel** (R4; dizin hedefinde temizlik istisnası geçmez) / **engel** (`gunluk` kökü her ROL için R4, toplam en kötüsü) / **izin** (v0.5: R3 OPS için her ROL genişlemesinde izin; v0.4'teki "R4" gerekçesi yanlıştı) / **engel** (R3, başka ROL genişlemeleri) |
| D31 | ROL listesinde olmayan segment: şeritli URUN `gunluk/foo/x.md`'ye / `departman/foo/x.md`'ye yazar; tam OPS aynılarına | **engel** (tablo dışı, R8) / izin (R8) |
| D28 | R2: şeritli URUN `oneri/URUN-x.md`'nin üzerine başka ROL'ün oturumu yazar | **engel** (R2 önek) |
| D29 | Alt ajan Bash yolunda `departman/ALTYAPI/`'na yazar (ebeveyn URUN) | **engel** (R3); mesaj "ebeveyn de yazamaz, `oneri/` altına bırak" der (dosya araçlarıyla aynı metin) |
| D30 | Karışık büyük/küçük harfli ROL segmenti: şeritli URUN `departman/urun/x.md` ve `Departman\URUN\x.md` yazar | izin / izin (harf duyarsız; NTFS) |

Ayırt edici olmayan kanca (her şeye izin veren ya da her şeyi engelleyen) her satırın izin/engel çiftinde düşer.

---

## §9 Günlük dosyalarının taşınması ve compact kapısı

Günlük/durum dosyaları bugün hafıza dizininin kökünde durur (`<rol>-lane-day-*.md`, `<rol>-lane-state-*.md`, `<rol>-state-*.md`,
`<rol>-serit-durumu.md`, `ops-cycle-audit-state.md`); 60'ı 2,1 MB'tır. `precompact-durum-kapisi.cjs` onları hafıza dizininin kökünde
`(lane-day|state|durum)` ad kalıbıyla arar ve özyinelemeli tarama yapmaz. Taşımak kapıyı kırar; bu yüzden **kapı değişikliği ve kanca
aynı PR'da** girer (ARAÇ).

**Kapının tüketicileri beş çağrı noktasıdır, birini unutmak compact dönüşünü bozar** (ölçüldü, v0.5 sayımı): (1) `precompact-durum-kapisi.cjs` (compact'ı
durduran kapı); (2) `session-board.cjs` compact dönüşünde `durumDosyasiBul`'u kullanır (dönüşte "durum dosyan şu" enjeksiyonu, ~L374-379); (3)
`son-konusma-dokumu.cjs` `projeDiziniBul` ile `memory/` dizinini çözer ve döküm yazar (~L281-291); (4) `session-board.cjs` compact kolunda **dökümü okur** (~L399-400; (3)'ün yazdığı dosyayı aynı dizinden
okur: yalnız yazma hedefi değişirse "döküm yok" der); (5) `hafiza-sorusu-yonlendirme.cjs` **kendi `projeDiziniBul` kopyasıyla** `memory/olcum/` okur (~L65, L91-96). Hepsi **aynı ortak işlevi** kullanır: `oturumunDosyalari` bugün düz
`readdirSync` yapar (`oturumunDosyalari` dışa açık değildir) ve dosyayı ad kalıbıyla **ya da** içeriğiyle (ilk 600 karakterde `sid`, en az bir `DORT_ALAN`) tanır; yeni işlev `gunluk/*/` ve `gunluk/_sahipsiz/`
altını `sid`'e göre tarar: **tek ve kesin kural (v0.5): kapı panoya bakmaz ve ROL bilmez; `gunluk/*/` altındaki bütün alt klasörlerde ve `gunluk/_sahipsiz/` altında dosya adı ya da (ROL
klasörlerinde) `sid` içeriği ile tarar, geçiş süresince ek olarak kökü tarar** (v0.4'ün "önce `gunluk/<ROL>/`'a bakar" cümlesi geri alındı; ROL bilmek pano gerektirirdi). §4'ün aday kümesi kullanılır. **`_sahipsiz/<sid>.md` eşleşmesi dosya adıyladır**
(`<sid>.md`, harf duyarsız; içerikte frontmatter aranmaz: bugünkü ilk 600 karakter kuralı frontmatter'sız dosyayı yok sayardı). **Dönüş sözleşmesi (v0.4):**
`{ okumaAdaylari: [dizin…], yazmaHedefi: dizin }` (okuma tüm adaylardan; **yazma hedefi ana deponun hafıza dizinidir**; worktree proje dizinlerinin çoğunda `memory/` yoktur (iki dizinde vardır: ölçüldü; aday kümesine girmesi
zararsızdır) ve bu durumda bugün `son-konusma-dokumu.cjs` `writeFileSync` ENOENT'ini Stop'ta sessizce yutuyor, PreCompact'te "döküm BAŞARISIZ" basıyor); durum dosyası bulma bugünkü
dönüşü `{ ad, tam, mt }` **korur ve `sahipsiz` ekler** (`{ ad, tam, mt, sahipsiz }`; `dosya` diye yeni alan yoktur; `session-board.cjs` `d.ad/d.mt/d.tam` okumaya devam eder). `session-board.cjs` compact kolu `sahipsiz: true` dosyayı "DURUM DOSYAN" diye basar ama "şerit al" uyarısıyla birlikte; `oturumunDosyalari` bugün
dışa açık değildir (`module.exports`) ve `durumDosyasiBul` adı kapı testinde kilitlidir (`precompact-durum-kapisi.test.ts`): yeni işlev bu adı korur, test bilinçli
güncellenir. Alt ajanın transcript'i `<proje>/<sid>/subagents/agent-*.jsonl` altında durur; kancaya verilen `transcript_path` bu dosyaysa `path.dirname` yanlış
dizini verir, ortak işlev bunu tanır (proje dizinini `subagents/` üstünden çözer). Worktree'den açılan oturumda `projeDiziniBul` bugün de transcript dizinini verir ve orada `memory/` yoktur (harita-h4, urun-acilis,
harita-bicim'de ölçüldü): kapı **bugün** bu oturumlarda "hiç durum dosyası yok" der; aday kümesi kapıya da uygulanır.
Geçiş süresince kök ve `gunluk/*/` birlikte taranır (yukarıdaki kural; R6 ile aynı kalıp). `gunluk/_sahipsiz/<session_id>.md` kapıda
**"durum var" sayılır**, ama yalnız **uyarı düzeyinde**: şeritsiz pencerenin tek yazma yeri orasıdır ve sayılmasaydı compact'ı hiç geçemezdi
(`VENTHUB_PRECOMPACT_KAPALI=1` dışında); süresi dolan claim'li pencere de aynı yere düşer.

**Geçiş listesi:** hangi kök dosyanın hangi ROL'e taşınacağı (eski rol adları `auth-`→SATIS, `pricing-`, `legal-`, `orion-`, `kademe2-…`,
`t150-…` dahil; sahibi belirsizler R1'de OPS'ta kalır) 600 dosyanın sınıflandırması sırasında tek dosya listesi olarak OPS'a gösterilir (OPS onayı
sonrası taşınır). Taşımayı yapan HARİTA (R10, `gecis_son` içinde).

---

## §9b Durum dosyasının günlük döndürülmesi (v0.9, OPS isteği 2026-10-04)

**Sorun (ölçüldü 2026-10-04):** durum dosyası tek parça büyüyor ve hiç kesilmiyor. Hafıza dizininin kökündeki pencere durum dosyalarının en büyük beşi:
`ops-cycle-audit-state.md` 326 KB, `arac-serit-durumu.md` 324 KB, `altyapi-lane-day-2026-09-09.md` 301 KB, `urun-katalog-lane-day-2026-09-06.md` 282 KB,
`harita-lane-day-2026-09-29.md` 128 KB. Dosya adı ilk günün tarihini taşır, sonraki günler aynı dosyaya eklenir; OPS açılışta dosyanın kırpıldığını bildirdi.

**Kural:**

1. **Canlı dosya iki parçadır.** **DEVİR bloğu dosyanın SONUNDA durur** (OPS kararı 2026-10-04: compact kapısı ve `SessionStart` dosyanın son bloğunu okur, bu yüzden sonda olması işe yarar; döndürme yerini DEĞİŞTİRMEZ): açık ve yarım işler, bekleyen kararlar, sıradaki adımlar; kapının dört alanını (`SON GİRDİ`,
   `AÇIK KUYRUK`, `VERİLEN SÖZLER`, `BEKLEYEN KARARLAR`, bkz. `precompact-durum-kapisi.cjs` `DORT_ALAN`) taşır, en çok 40 satırdır (öneri, ölçülecek),
   her compact öncesi tazelenir, birikmez. Öncesinde **gün blokları**: her biri `## YYYY-AA-GG` başlığıyla, canlı dosyada yalnız **bugün ve dün**.
   DEVİR bloğu olmadan döndürme yapılmaz: açık iş yalnız eski bir günde kalırsa kaybolurdu. Betik bunu zorlar: başlığın BAŞI `## DEVİR` olan blok yoksa ya da dört alan o bloğun İÇİNDE bulunmuyorsa `--yaz` reddedilir (çıkış 3); başlığın başka yerinde geçen "devir" DEVİR sayılmaz.
2. **Döndürme iki adımdır ve kayıpsızdır.** Pencere yeni günün ilk yazımında iki günden eski blokları önce `gunluk/<ROL>/gecmis/<YYYY-AA-GG>.md`
   dosyalarına (gün başına bir dosya, metin AYNEN) yazar, sonra canlı dosyadan çıkarır. İlk adım başarısızsa ikinci adım yapılmaz. Bu **dosya silme
   ya da taşıma değildir**, iki yazma işlemidir; R4'ün "silmez ve taşımaz" cümlesiyle çelişmez.
3. **Okuma.** Açılış ve compact dönüşü yalnız canlı dosyayı okur (DEVİR + bugün + dün). `gecmis/` yalnız "dün ya da geçen hafta ne oldu" sorusunda,
   aranarak okunur; hiçbir kanca onu kendiliğinden yüklemez.
4. **Kapı (ARAÇ'a, §10).** `precompact-durum-kapisi.cjs` ve `session-board.cjs` durum dosyasını `gunluk/<ROL>/*.md` (tek seviye) ve
   `gunluk/_sahipsiz/<sid>.md` içinde arar; `gunluk/<ROL>/gecmis/` **taranmaz**. Sebep (kodda ölçüldü): kapı adayları `mtime`'a göre azalan sıralayıp en
   yenisini seçer; `gecmis/` dosyaları döndürme anında yeni yazıldığından en yeni olur ve kapı onları canlı dosya sanırdı. `gecmis/` dosyalarının başında
   `sid:` ve dört alan da bulunmaz (içerikle eşleşmeyi ikinci kez önler).
5. **Yetki.** `gecmis/`, `gunluk/<ROL>/**` altındadır (R4): yalnız o ROL'ün oturumu yazar; OPS başkasının `gecmis/` dizinine yazamaz (D33). 14 günü geçen
   `gecmis/` dosyasını OPS mevcut temizlik istisnasıyla (tek dosya) `arsiv/`'e taşır.
6. **Geçiş.** Bugünkü büyük dosyalarda gün başlığı yok; ilk döndürmede eski kısım `gecmis/oncesi-<ilk-gün>.md` olarak tek parça taşınır, son blok ve DEVİR
   canlıda kalır. Toplu taşıma yayın haftasında yapılmaz (OPS kararı 2026-10-04); her pencere kendi dosyasını, OPS kendi dosyasını kendisi döndürür.
   Kanca henüz yoktur: kural pencerenin kendi disiplinidir (§10: ARAÇ'ın bekçisi canlı dosya boyutu için uyarı verebilir; eşik ölçülecek, §11).
7. **Standart "Yarım iş" satırı (v0.9 eki, HRT-31, OPS isteği 2026-10-05).** Her rolün durum dosyası güncellemesinde, DEVİR bloğunun içinde ve dosyanın en sonunda tam olarak şu iki biçimden biri durur:
   - `Yarım iş: yok — <kısa>` (örnek: `Yarım iş: yok — HRT-29 ve REC-516 bitti, sırada iş yok`),
   - `Yarım iş: var — <ne>, <ne zaman güvenli>` (örnek: `Yarım iş: var — HRT-28 PR #1699 OPS hükmü bekliyor, hüküm gelene dek güvenli`).

   Sebep: ARAÇ'ın kancası (`baglam-doluluk.cjs`, `yarimIsOku`, ARC-31 madde 2) pencerenin durum dosyasının son 24 KB'ında bu ifadeyi sabit bir kalıpla arar ve kokpitte pencere başına compact hazırlığı satırını kurar; ifade yoksa kokpit `ölçülemedi` gösterir. Kalıp büyük/küçük harf ve Türkçe harf farksızdır (`yarım iş`, `YARIM İŞ`, `yarim is`); ayraç `:`, `=` ya da boşluktur; ardından `yok` ya da `var` gelir, ondan sonra Türkçe harf gelmez (`yoksa` okunmaz). **Ölçüldü 2026-10-05 (gerçek `yarimIsOku` ile):** `Yarım iş: yok`, `Yarım iş: var`, `Yarım iş yok`, `YARIM İŞ: YOK` okunur; `Yarım: HRT-28`, `Yarım işler: var`, `Yarım iş: yoksa` okunmaz (`bilinmiyor`).
   Kurallar:
   - **Son eşleşme geçerlidir.** Kanca dosyanın son 24 KB'ındaki SON `yarım iş yok|var` ifadesini okur; bu yüzden satır **en sondadır** ve her durum güncellemesinde (compact öncesi dahil) DEVİR bloğuyla birlikte tazelenir (blok birikmez, §9b madde 1); satır güncel değilse kokpit yanlış hazırlık gösterir. Satırın altına `yarım iş yok|var` geçen başka bir cümle yazılmaz (kanca onu okurdu).
   - **`yok` derken yarım iş listelenmez; belirsizse `var` yazılır** ("güvenli yön": belirsizlik `yok` dedirmez). `var` derken ne olduğu ve **ne zaman güvenli noktaya geleceği** aynı satırdadır; compact yapılıp yapılmayacağı buna bakılarak kararlaştırılır.
   - Satır ayrıntı yeri değildir: tek satır, en çok iki cümle; ayrıntı DEVİR bloğunun `AÇIK KUYRUK` alanındadır.
   - Bu madde **pencerenin kendi disiplinidir**: kancayı zorlayan bir yazma kapısı henüz yoktur; ARAÇ'ın bekçisi satır eksikse `ölçülemedi` gösterir (kokpit zaten gösteriyor). Rol kartları bunu tek cümleyle hatırlatır (`docs/roller/<ROL>.md`, Çalışma düzeni; ayrıntı `docs/roller/<ROL>-kurallar.md`).
   - **Compact hazırlığı Recep'e yazılır (OPS isteği 2026-10-05).** Recep compact hazırlığı istediğinde (ya da "COMPACT YAKIN" uyarısında) üç maddelik not (durum dosyası güncel mi + saat / yarım iş var mı / hüküm: "Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim") ve iki aşamalı compact cümlesi pencerenin KENDİ penceresinde Recep'e yazılır; OPS'a yalnız tek satır gider ("hazır" ya da "X bitince hazır"). Notu OPS'a yazıp Recep'e yazmamak kuralı çiğner (2026-10-05'te iki departman bunu yaptı, kural rol kartında yoktu). Aynı cümle her rolün kurallar dosyasındadır.

---

## §10 ARAÇ'a devir sözleşmesi

| Kalem | Beklenen |
|---|---|
| Karar kütüphanesi | `.claude/hooks/lib/hafiza-yazma-kurali.cjs` (saf işlev; §2 R1-R10, §3 sınıflar; girdi/çıktı sözleşmesi §5 "Yeni kanca yazılır" maddesinde: `hedefler:[{yol,islem}]`, `cozulemedi`, `genisletmeli`, `panoDurumu`, `claimler`, `adaylar`, `bayraklar`, `simdi`; çıktı hedeflerin en kötüsü; dosya sistemi, `realpath` ve pano kancada) |
| Kanca | `hafiza-yazma-bekcisi.cjs` (PreToolUse); dosya araçları ve Bash tek dosyada; alt ajan mesajı her iki yolda; alarm ve olay kaydı oturum başına (§3, §5); çalışma sırası §5 |
| Ayar | `.claude/settings.json` eşleştirici `Edit\|Write\|MultiEdit\|NotebookEdit\|Bash\|PowerShell` (§5 ile aynı; v0.4 §10'da `PowerShell` eksikti); ana ağaca ileri sarma. Değişikliği ARAÇ yapar, **OPS onaylar** (ARAÇ kartı: "settings değişikliği OPS kapısıdır"); **ayar dosyasına yazım Recep sözüyle ARAÇ'ın KENDİ penceresinde alınır, OPS onayı o sözün yerine geçmez** (başlık notundaki davranış kuralı; "ayar dosyası" = `settings*.json` ve `hafiza-yazma-ayar.json`); dosya yolu okuma `file_path`, `notebook_path` ve `edits[].file_path` (§5 "tüm yol alanlarını tara") |
| Yardımcılar | `seritRolu` (`pencere-adlari.cjs`, ARAÇ #1592 sonrası ayrı küçük PR; `session-board.cjs` aynı işlevi kullanır); ana depo dizini türetimi `belge-tazelik.cjs`'ten ortak işleve (dizin adayı döndürür, slug `[^A-Za-z0-9]`→`-`) |
| **ARAÇ iş listesi (kabul koşulu)** | (1) `board.durumOku()`: dizin var mı, olay dosyası sayısı, bu `sid`'in dosyası var mı, bozuk satır ve hangi dosyada; dizini **yaratmaz** (§3). (2) `board.cjs` adsız `claim`'in önceki şerit adını ezmesi (`lane`) düzeltilir (§3). (3) `session-board.cjs`, `precompact-durum-kapisi.cjs`, `son-konusma-dokumu.cjs`: ortak durum dosyası bulma işlevi (§9), AYNI PR. (4) `hafiza-indeks-bekcisi.cjs` kapsamı `departman/*/MEMORY.md`, eşik 60 satır / 8 KB **yumuşak**, `hafiza-indeks-bekcisi-kilidi.test.ts` bilinçli güncelleme (§7). (5) `seritRolu` (`pencere-adlari.cjs`, §3) ve `session-board.cjs`'in aynı işlevi kullanması (rol çözümü tek yerde). (6) Ayar dosyası `.claude/hafiza-yazma-ayar.json` ana ağaçtan okunur (§2). (7) `bash-write-targets.cjs`: **hedef başına fiil** (`islem`: `sil`/`yaz`; `tasi` yoktur, `mv` = kaynak `sil` + varış `yaz`), `mv`/`cp` **kaynağı** ve **`unlink`/`rmdir` hedefleri** döndürülür (§5; bugün çıkarıcı `rm` dışındaki silme fiillerinin hedefini üretmiyor, ölçüldü; olmadan temizlik istisnası Bash'te sınanamaz). `genisletmeli` işaretini çıkarıcı değil **kanca** hesaplar (§5). **Ekip üyesi** claim'siz = şeritsiz (§3). (2)'nin kapsamı: `lane` ezmesi **üç yerde** ve `e.lane === 'lane'` boş sayılır (§3; v0.4'te (2) ve (5) aynı kalemdi, birleştirildi). **Kapı kalemi (3)** beş çağrı noktasını kapsar (§9): `precompact-durum-kapisi.cjs`, `session-board.cjs` (iki yerde), `son-konusma-dokumu.cjs`, `hafiza-sorusu-yonlendirme.cjs`. **Durum satırı:** `board-brief.cjs` bugün **beş erken çıkış** noktası taşır (~L28 `!sid`, L31, L36, L61 ve L126 sessizlik kuralı, ölçüldü); hafıza alarmı kontrolü **hepsinden ÖNCE** koşar (yalnız sonuncuyu aşmak yetmez: `!sid` ya da `board.cjs` `require` hatası alarmı gizlerdi); alarm yoksa mevcut davranış aynen korunur. |
| **ARAÇ iş listesi (v0.9 eki, kabul koşulu DEĞİL)** | **Geçmiş taraması:** `precompact-durum-kapisi.cjs` ve `session-board.cjs` durum dosyasını yalnız `gunluk/<ROL>/*.md` (tek seviye) ve `gunluk/_sahipsiz/<sid>.md` içinde arar, `gunluk/<ROL>/gecmis/` taranmaz (§9b madde 4; D33'ün kütüphane karşılığı). **Künye uyarısı:** yazma bekçisi (REC-536) ortak çekirdeğe satır ya da yeni konu dosyası yazılırken künye (yazıldı + kaynak) eksikse UYARIR, engellemez (§12; D34). **Boyut uyarısı (isteğe bağlı):** canlı durum dosyası eşiği aşarsa uyarı; eşik ölçülmeden sayı yazılmaz (§11). |
| **ARAÇ iş listesi (sonraki iş, kabul koşulu DEĞİL)** | `bash-write-targets.cjs`: `cd`/`pushd` izleme; tırnak farkındalıklı segment bölme; `git -C` alt komutları (`mv`/`cp` kaynağı ve hedef başına fiil kabul koşuluna taşındı, kalem 7); (`genisletmeli` işareti artık çıkarıcıda değil kancada, §5); PowerShell fiilleri (§6). Bunlar yapılınca §8 D13d/D15b beklentileri "engel"e çevrilir. |
| Test | `src/__tests__/conformance/` altında yeni kapı (öneri `INV-HAFIZA-YAZMA-1`): §8 D1-D13, D16-D32 (D19a-d, D24a-d, D27a-d), her satır izin/engel çiftiyle; **R9 sabit listesi ile ön süzgecin aynı olduğunu sınayan kol (D24d)**; test enjeksiyonu §4 (`VENTHUB_SIMDI` dahil); sabotaj: her kural için "izin'e çevir" mutasyonu → kırmızı |
| Durum satırı | `board-brief.cjs` alarm dosyalarını okur (§3); alarm kaydı ve olay dosyası oturum başına |
| Kapı | §9'daki **beş** çağrı noktası, AYNI PR |
| Envanter | `docs/audits/arac-envanteri-*` satırı (kanca envantere girmeden bitmiş sayılmaz) |
| Deneme | D14 ve D15'i HARİTA'nın bağımsız ajanı koşar; sonucu REC-530'a yazar |

---

## §11 Kapanan ve açık kararlar

**OPS'un 2026-09-30 kararları (işlendi):** fail-open + durum satırı alarmı (§3); şeritsiz pencere yalnız `oneri/` ve
`gunluk/_sahipsiz/<sid>.md` (R2, R5); Bash tam kilit değil (§6); kanca yolu ayardan türetilir, sabit yol yok (§4); OPS kimliği şerit
beyanı, kalite ağı olarak kabul, çift OPS claim'i ikisine de engel (§3); R9 HARİTA kapandıktan sonra `CLAUDE.md`, rol kartları ve kurallar
dosyalarını yalnız OPS yazar (kartlar üretici üzerinden), HARİTA muafiyeti tarihli bayrak, yeniden açılırsa OPS yeniler; şerit adı → rol tablosu
tek yerde (`pencere-adlari.cjs`).

**Açık sorular (uygulamada ölçülecek; ARAÇ'ın kabul testlerine bağlı, OPS kararı 2026-10-01):**
- `commondir` ve `gitdir:` değerleri göreli olabilir; `.git` dosyasının nerede aranacağı (hedef alt dizinde ya da henüz yok) ve disk önbelleğinin anahtarı (hangi ayar dosyalarının `mtime`'ı) kodlanırken ölçülür; `board.cjs`'e dizin yaratmama kuralı D11a ile birlikte sınanır.
- `oneri/URUN-*` ve tanınmayan glob (`?`, `{}`, `[]`, `U*`) için D satırı; `dizinMi` birleşik bayrak (`-rf`) tespiti; `board-brief` `!sid`/parse hatası çıkışında alarm gösterimi.
- R9b (git dışı ayar) hedefinin kullanıcı ayar dizini çözümü ve `ARAC` önek eşleşmesi.
- `skills:` alanındaki çıplak adın eklenti/kullanıcı/proje skill'ini nasıl çözdüğü (üretici PR'ı; belgede "not stated").
**Açık:**
- **Otomatik hafıza yazımı:** D14 sonucuna göre `autoMemoryEnabled: false` (OPS ve Recep).
- **`autoMemoryDirectory` proje ayarı kısıtı:** proje ayarından gelen değerin "çalışma alanı güveni" gibi ek bir kısıta tabi olup olmadığı belgeden
  doğrulanmadı; ilk kanca denemesinde ölçülür (§4).
- **Sandbox / yönetilen katman:** §6'daki kanca kapatma ve Bash delikleri için işletim sistemi düzeyi koruma ayrı karar.
- **Bash sonrası tarama:** hafıza dizini için ayrı sonradan tarama (§6) yapılıp yapılmayacağı.
- **Künye bayatlık eşiği (§12):** `ölçüm` kaynaklı bir kaydın kaç gün sonra "yeniden ölçülmeden güncel olgu gibi sunulamaz" sayılacağı; sayı ölçülmeden yazılmadı.
- **Canlı durum dosyası boyut eşiği (§9b):** DEVİR + iki gün için makul üst sınır (öneri 40 KB); iki haftalık gerçek kullanımdan sonra ölçülür.

---

## §12 Hafızadaki bilginin tarihi ve kaynağı (künye) (v0.9, OPS isteği 2026-10-04)

**Niçin (ölçüldü 2026-10-04):** OPS hafızadaki eski bir tarihi bugünün konuşmasına yapıştırdı ve yazılı bir kural aynı gün çiğnendi. Kök sebep, hafıza
kaydının yazıldığı günü ve nereden geldiğini taşımaması: okuyan, "hafızada böyle yazıyor" ile "bugün böyle oldu"yu ayıramıyor. `MEMORY.md`'nin
125 tekil satırından 77'sinde yılsız `09-12` gibi bir tarih var, 48'inde hiç tarih yok, yapısal bir kaynak etiketi hiçbirinde yok (2026-10-04 sayımı); REC-516 ölçümü (2026-09-30) künyeli konu dosyası sayısını 0/582 buldu. Frontmatter'daki `modified:`
otomatik yazılan son dokunma zamanıdır, bilginin yazıldığı ya da olduğu günü göstermez.

**Kural:**

1. **Yazarken.** Her yeni hafıza kaydı (ortak çekirdek satırı, departman dersi, konu dosyası) iki etiket taşır.
   - **yazıldı:** tam tarih (`2026-10-04`); yılsız `10-04` yeni kayıtta yazılmaz.
   - **kaynak:** `söz` (Recep'in o gün söylediği; özet yazılır, tırnakla alıntı yazılmaz: repo PUBLIC), `ölçüm` (komut, dosya ya da PR ile doğrulandı; kanıt yolu aynı yerde),
     `karar` (karar numarası) ya da `çıkarım` (yazanın yorumu, doğrulanmadı).
   - "Bugün", "dün", "bu hafta", "yarın" gibi göreli zaman hafızaya yazılmaz; yazıldığı günün tarihine çevrilir.
2. **Biçim.** Ortak çekirdek satırında: `- [Başlık](dosya.md) — (2026-10-04, söz) kısa kural`. Konu dosyasında frontmatter `metadata:` altına `yazildi: 2026-10-04` ve
   `kaynak: söz`. Günlük/durum blokta tarih `## YYYY-AA-GG` başlığından gelir; kaynak etiketi (`[söz]`, `[karar]`) yalnız Recep sözü ve karar maddelerinde zorunludur,
   çünkü karışma riski bunlarda var.
3. **Okurken ve anarken.** Hafızadan okunan bilgi konuşmaya "hafızada şöyle yazıyor (<tarih>, <kaynak>): …" kalıbıyla girer. Bugünün sözü ile hafızadaki söz aynı
   cümlede karıştırılmaz. Hafızadaki tarih bugünün ya da son olayın tarihi gibi kullanılmaz. "Şu an" ile ilgili olgu (sayı, durum, kim canlı) hafızadan değil ölçümden
   verilir (sözleşme madde 3, beyan öncesi ölçüm).
4. **Bayatlık.** `ölçüm` kaynaklı kayıt yeniden ölçülmeden güncel olgu gibi sunulmaz; sunulurken yaşı yazılır ("2026-09-25 ölçümü"). Kaç gün sonra bayat sayılacağı
   için sayı yazılmadı (§11 açık soru).
5. **Geriye dönük.** Mevcut dosyalar toplu etiketlenmez; REC-538 geçişinde her dosya taşınırken künye eklenir. Tarih dosyada yoksa `yazildi: bilinmiyor` yazılır;
   `modified:` değeri ya da tahmin tarih olarak yazılmaz. Ayrı bir toplu iş açılmaz.
6. **Zorlama ve sınır.** Bugün kanca yok; §10 "Künye uyarısı" yazma bekçisinin eksik künyede uyarmasını ister (engel değil, D34). Etiketin DOĞRULUĞU denetlenmez
   (yazan "ölçüm" yazıp ölçmemiş olabilir); kural yalnız ayrımı görünür kılar. Sahte `ölçüm` etiketi disiplin sorunudur ve 3. maddedeki "şu an olgusu ölçümden verilir"
   kuralıyla sınırlanır.

---

## Değişiklik kaydı

- 2026-10-04 v0.9 (REC-516/REC-530, OPS isteği; statü: uygulamayla doğrulanacak): iki boşluk kapandı. **§12** hafızadaki bilgiye tarih ve kaynak etiketi (künye), "hafızada
  şöyle yazıyor (tarih)" kalıbı ve bayatlık kuralı; **§9b** durum dosyasının günlük döndürülmesi (DEVİR bloğu dosyanın sonunda + bugün/dün, `gecmis/` kayıpsız iki adım, kapı `gecmis/`'i taramaz; ilk uygulama OPS durum dosyası 2026-10-04: 336.438 → 106.480 bayt, betik `scripts/belge/durum-dondur.py`).
  §1 satır 3, §8 (D33, D34), §10 (v0.9 eki), §11 (iki açık soru) buna göre güncellendi. Başlıktaki "v0.7" bayattı (değişiklik kaydı v0.8'e gelmişti): v0.9 yapıldı.
  Kanca değişmedi; v0.9 bağımsız okuyucudan geçmedi, uygulamayla doğrulanacak.
- 2026-10-05 v0.9 eki (HRT-31, OPS isteği): §9b madde 7, durum dosyasının sonunda standart `Yarım iş: yok|var — ...` satırı (ARAÇ'ın #1702 kancası okuyor; biçim gerçek `yarimIsOku` ile ölçüldü). Rol kartlarına tek cümle, kurallar dosyalarına blok eklendi (`rol-karti-uret.cjs`). Kanca ve yazma kapıları değişmedi.

- 2026-10-01 v0.8 (v0.7 son okuma turu; statü: uygulamayla doğrulanacak): 1 engelleyici + 4 orta + 3 düşük işlendi. §6 "Bash kaza yolları" `genisletmeli`'yi §5/D13d ile hizaladı (kanca işaretler); kalem 7 öncesi `unlink`/`rmdir`/`mv` kaynağı açık delik olarak §6'ya yazıldı;
  R9b öncelik sırasına ve ön süzgeç/D24d kapsamına girdi; §6 R9-dışı satırı R9b'ye atıfla yeniden yazıldı ve atıf `docs/roller/ARAC.md` oldu; §10 Ayar satırı Recep davranış kuralına bağlandı (söz ARAÇ'ın kendi penceresinde, OPS onayı yerine geçmez; "ayar dosyası" = `settings*.json` + `hafiza-yazma-ayar.json`);
  v0.7 kaydına R9b/D24e/§11 Açık sorular/Recep kuralı eklendi (v0.7 maddesi aşağıda, R9b ve Recep kuralı ayrı commit'te geldi); başlık/statü düzeltildi. Kalan: §11'de iki paralel açık-liste (eski "Açık" ve yeni "Açık sorular") kodlama sırasında birleştirilir.
- 2026-10-01 v0.7: v0.6'yı doğrulayan okuyucu 2 engelleyici + 5 orta verdi. **Engelleyici 1:** §10 kalem 7 hâlâ `tasi` diyordu (düzeltildi); `genisletmeli` sahipliği üç yerde farklıydı (kanca hesaplar, §6/§8/§10 hizalandı, D13d kanca düzeyi);
  çıkarıcı `unlink`/`rmdir` hedefi üretmiyor (ölçüldü) → kalem 7'ye girdi. **Engelleyici 2:** `settings.json`/`settings.local.json` R9'dan ÇIKTI (ARAÇ kaydı yazamazdı, HARİTA muafiyeti kaydı silebilirdi, protect-config geçmişi); koruma PR kapısı,
  kabul edilmiş sınır §6'da; atıf `docs/roller/ARAC.md` olarak düzeltildi; OPS şartı eklendi: "ARAÇ şeridindeki kanca/ayar-etkili PR, OPS tam diff okumadan birleşmez". Orta: D24a/D24b yeniden yazıldı, D27c `mv` satırına düzey etiketi.
  Açık düşükler kodlama sırasında: `commondir` göreli çözümleme, disk önbelleği anahtarı, `oneri/URUN-*` ve tanınmayan glob için D satırı, `dizinMi` birleşik bayrak (`-rf`), `board-brief` `!sid` çıkışında alarm.
- 2026-10-01 v0.6: beşinci bağımsız doğrulayıcı v0.5 için 2 engelleyici + 4 orta bulgu verdi; hepsi işlendi (OPS'un "altıncı tur yerine yalnız değişen maddeler doğrulansın" kuralıyla). **Engelleyici 1:** R9 açık listesi hâlâ `docs/roller/cetvel-sahipligi.*`
  diyordu; liste `scripts/belge/cetvel-sahipligi.json` ile düzeltildi ve D24a bunu sınar. **Engelleyici 2:** temizlik istisnasının OPS kolu `gecis_son`'a bağlıydı, D27b ile çelişiyordu; OPS kolu bayraktan bağımsız (HARİTA kolu `gecis_son`'a bağlı); günlük sahibi yazar/ekler, silmez.
  **Orta:** (a) R9 kapsamı ARAÇ'ın kanca/pano kodunu OPS-only yapıyordu (kapı kendini kilitler; `protect-config.cjs` geçmişi): **daraltıldı**, §6'da satırı var, OPS'a karar maddesi olarak gitti; (b) ayar dosyası HARİTA muafiyetinden hariç (kendi bayrağını uzatamaz);
  (c) aday kümesi "süreç içi önbellek" yanlıştı (PreToolUse çağrı başına yeni süreç): `.git` dosyası/`commondir` okuyarak git süreci açmadan çözülür ve diske önbelleklenir; (d) `islem`: `tasi` kaldırıldı (mv = kaynak sil + varış yaz), kalem 7 öncesi bilinmeyen komut `sil+yaz` ikisi birlikte değerlendirilir
  ("bilinmeyen yaz sayılır" gevşekti), `dizinMi` girdisi, `genisletmeli` kancada; (e) `*` algoritması: `oneri/*` ROL segmenti değil (dosya adı glob'u, R2 en kısıtlı), tanınmayan glob en kısıtlı; (f) D32 (stdin bozuk/yol türetilemedi), D24c fixture notu, D24d süzgeç sınaması, D27d; `board-brief` beş erken çıkış,
  `kapali` canlılık alarm değil, ortak aday işlevi adı `hafizaDizinAdaylari()`; R6'da önek yeter (OPS-AUDIT `ops-cycle-audit-state.md`), HARİTA için önek yeter.
- 2026-10-01 v0.5: v0.4'ü okuyan dördüncü bağımsız okuyucu (işi yapmamış, kodu canlı çalıştırdı) 7 engelleyici ve 6 yanlış olgu buldu; hepsi işlendi. **R9:** ön süzgeç artık ayrı liste değil, R9 kalıp sabitinin dize
  karşılaştırması (ayar dosyası ve test dosyası süzgeçten düşüyordu); sahiplik kaydı yolu düzeltildi (`scripts/belge/cetvel-sahipligi.json`, `docs/roller/…json` yoktu); "repo" = aynı git ortak dizinine bağlı **her çalışma ağacı**
  (worktree dahil); ARAÇ'ın genel kanca kodu bilinçli olarak R9 dışında. **Kütüphane girdisi:** hedef başına `mtimeGun`, `repoGoreli`, `genisletmeli`; `sonBilinenAd`; `canlilik`; `islem` türetme kuralı yazıldı ve
  ölçüldü: çıkarıcı hedef başına fiil ve `mv`/`cp` kaynağı döndürmüyor → **ARAÇ kabul koşulu 7**; temizlik istisnası yalnız Bash yolundadır. **`*` hedefi:** statik önek genişletme algoritması yazıldı (ROL segmenti `ROLLER` ile
  genişler, toplam en kötüsü); `$DEĞİŞKEN`/`$(…)` ayrı sınıf (izin + alarm); D27c üçüncü durum "R4" idi, R3 ile **izin** çıkar (düzeltildi). **R10/D8/D27:** tek bayrak `gecis_son` (R10 ve temizlik), `harita_muafiyet_son` yalnız R9;
  her D satırı "R10 kapalı/açık" durumunu söyler; D19d eklendi; çift OPS vetosu R10-OPS ve temizlik-OPS kolunu da kapsar; R5 notu (OPS başka `sid`'in dosyasına yazamaz). **Çift OPS canlılık:** çağrı koşulu (üç koşul),
  zaman aşımı/sezgi yedeği, kütüphane girdisi `canlilik`, test enjeksiyonu `VENTHUB_CANLILIK_HAM`; D26 üç dala bölündü. **§9:** "önce `gunluk/<ROL>/`" cümlesi geri alındı (pano gerektirirdi; kapı `gunluk/*/` ve `_sahipsiz`'i sid'e göre tarar),
  dönüş sözleşmesi bugünkü `{ad, tam, mt}`'yi korur ve `sahipsiz` ekler, kapı tüketicileri **beş çağrı noktası** (iki ek: `session-board.cjs` döküm okuma, `hafiza-sorusu-yonlendirme.cjs` kendi kopyası). **Olgusal düzeltmeler:**
  kilit testinin yalnız `:99` onayı kırılır (`:84` `exit(2)` kırılmaz), `lane` ezmesi düzeltmesinin iki parçası (`e.lane === 'lane'`), ENOENT PreCompact'te yutulmuyor, worktree proje dizinlerinin bazısında `memory/` var, `exit 0 bilgi` olay
  dosyası adı tutarsızlığı. **§10:** matcher'a `PowerShell`, `edits[].file_path`; yinelenen kalem (2)/(5) birleşti; `seritRolu` ve hedef-başına-fiil kalemleri kabul koşuluna girdi; durum satırı sessizlik istisnası; D31 (ROL listesi dışı segment → R8).
  Kodlama sırasında kalan **düşük** maddeler (okuyucu raporu): R2 sil/yaz ayrımı, `exit 0 bilgi` hangi bilgi, `CLAUDE_PROJECT_DIR` ile ana depo çözümünün başlangıç dizini, D13c göreli cwd, slug uzun yol kırpması, alarm dosyası `<gün>` saat dilimi (UTC) ve `sid` sanitizasyonu
  (`board.cjs sessionFile` emsali), `PRUNE_MS` ile olay dosyası sayısı, `cozulemedi` + hafıza hedefi birlikteyse sıra (engel > ölçülemedi > izin), R2'de en uzun önek (`GEO-SEO-…`).
- 2026-09-30 v0.4: ARAÇ'ın uygulayıcı (üçüncü) okuması 17 kritik, 12 düşük madde buldu; ARAÇ'ın 4 sorusuna HARİTA kararları işlendi. **R10 ek izin** (karar verici değil; §2 başı, D19a-c);
  **temizlik istisnası** tanımlandı (`oneri/` koşulsuz OPS, `gunluk/` 14 gün ve yazan OPS/HARİTA-muafiyet, dizin/`*` hedefinde geçmez; D27a-c); **bayrak/ayar ana ağaçtan**, sabit yol
  `.claude/hafiza-yazma-ayar.json`; departman eşiği **yumuşak**, kilit testi bilinçli güncellenir; kütüphane girdisi `hedefler:[{yol,islem}]`, `panoDurumu`, `claimler`; R9 kaynak listesi açık
  ve ön süzgeç eklendi; `lane` ezmesi üç yerde ve D10c kütüphane testine indi; alarm/olay dosyası **yalnız ekle**, günlük ad (`.<gün>.jsonl`); çift OPS `canlilik.cjs` ile; alt ajan kural engelinde
  "ebeveyn de yazamaz"; ekip üyesi şeritsiz; D15a bugün mevcut kapıda engel (yeni kanca tekrarlamaz), D15b'ye birebir komutlar; §6 delik listesi ARAÇ'ın ölçtüğü yazma biçimleriyle genişledi,
  PowerShell eşleştiriciye girdi; ortak durum dosyası `{okumaAdaylari, yazmaHedefi}` ve `_sahipsiz/<sid>.md` dosya adıyla eşleşir; durum satırını `board-brief.cjs` basar.
  Kalan **düşük** maddeler kodlama sırasında çözülür: NTFS ı/İ katlaması, `$HOME`/`%USERPROFILE%`/`/cygdrive/c` genişletmeleri (normalizasyon modülü), `tee MEMORY.md` göreli yol, `MultiEdit` yük şeması,
  `autoMemoryDirectory` okuma kökü, slug uzun-yol kırpması.

- 2026-09-30 v0.1: ilk sürüm (REC-531); bağımsız okuyucu 28 bulgu buldu, kodlanamaz bulundu.
- 2026-09-30 v0.3: ikinci bağımsız okuyucunun 35 bulgusu işlendi (12'si kanca yazımını engelliyordu). Başlıcaları: R10 öncelik sırasına girdi ve kapsamı
  genişledi (`arsiv/**`, kaynak silme, `belge-yonetimi-devir/**`), ayrı taşıma listesi kalktı; R9 kaynak dosyaları da kapsadı (üretici, sahiplik kaydı, ayar,
  `settings.json`); `touch` kararı (çağırmaz, yarış kabul; D10 kütüphane düzeyinde); "ölçülemedi" için `board.durumOku()` ARAÇ işi ve bozuk satır yalnız kendi
  dosyasında sayılır; çöken OPS penceresi sayım dışı; adsız claim'in şerit adını ezmesi (ölçüldü) ARAÇ işi; §4 türetim kodu "hazır" değil "çıkarılıp
  genişletilecek" (slug kuralı, noktalı yol); kapının üç tüketicisi; alarm ve olay dosyası oturum başına; Bash sınırları düzeltildi (`;`/`&&`, `cd`, PowerShell,
  `git -C` açık delik); D7, D10, D11, D13, D15, D16 parçalandı, D20-D30 eklendi (her R kuralının izin/engel çifti). Bu şartname kanca **koduna** başlamak için yeterlidir;
  ARAÇ iş listesinin "kabul koşulu" kalemleri önce ya da birlikte yapılır (§10).
- 2026-09-30 v0.2: 28 bulgunun tamamı işlendi. Başlıcaları: şerit eşlemesi mevcut kodda yok (yeni kanca, ayrı karar kütüphanesi);
  `findConflict` hafıza yollarını işleyemez; `bash-write-guard` depo dışını görmez; `bash-write-audit` hafızayı hiç görmez (sonradan
  yakalama iddiası geri alındı); fail-open için "ölçülemedi ≠ şeritsiz" tablosu; OPS için yalnız tam eşleşme; yol normalizasyonu;
  öncelik sırası; R2 adlandırma; R9/R10 tarihli bayraklar; D1-D19 her kural için izin/engel çiftiyle.
