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
> kodu iki ayrı bağımsız okuyucuyla ve kaynaktan karşılaştırıldı; v0.3; ARAÇ'ın uygulayıcı okuması 17 kritik madde buldu, v0.4 onları işler).
> **Kanca KURULU DEĞİL** (§10); bu cetvel şartnamedir.

---

## §1 Katman modeli

| Katman | Ne girer | Yer (hafıza dizinine göre) | Kim yazar | Kim okur |
|---|---|---|---|---|
| **1 Ortak çekirdek** | Şirket geneli sözleşme, Recep'in genel tercihleri, ortak dersler, indeks | `MEMORY.md`, kökteki ortak ders dosyaları, `olcum/**`; repoda talimat dosyaları (§2, R9) | yalnız OPS | herkes, oturum açılışında |
| **1b Öneri kutusu** | "Bunu ortak hafızaya ya da kurala ekleyin" talebi: ne, neden, hangi departman, kanıt | `oneri/<ROL>-<tarih>-<konu>.md` | o ROL'ün penceresi (şeritsiz pencere: `oneri/_sahipsiz-<sid>-<konu>.md`) | OPS kabul ya da reddeder, kabul edileni çekirdeğe kendisi yazar |
| **2 Departman hafızası** | O departmanın kalıcı dersleri, karar gerekçeleri, ölçüm sonuçları | `departman/<ROL>/` (kendi `MEMORY.md`'si ve konu dosyaları) | o ROL'ün penceresi ve OPS | yalnız o departman: `SessionStart` kancası kendi `MEMORY.md`'sini rol kartıyla birlikte enjekte eder (üst sınır §7) |
| **3 Günlük / durum** | Compact sonrası kaldığı yer: dört sabit alan | `gunluk/<ROL>/` (ana indeksten ayrı, indekse girmez) | yalnız o ROL'ün penceresi | aynı pencere, compact kapısı |
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
hafıza yolu değildir), R6 (durum dosyası kalıbı), R5, R4, R3, R2, R1, R7, en son R8. **R10 karar verici değil, EK İZİNDİR** (v0.4, ARAÇ
kararı 1): R10'un koşulu (geçiş süresi içinde, yazar OPS ya da HARİTA-muafiyet) sağlanıyorsa işlem, aşağıdaki normal kuraldan bağımsız **izinlidir**;
sağlanmıyorsa R10 yok sayılır ve yol normal kuralına (R4, R5, R3…) düşer. Böylece geçiş boyunca URUN kendi `gunluk/URUN/`'unu ve
şeritsiz pencere `gunluk/_sahipsiz/<sid>.md`'yi yazabilir. Normal kurallarda ilk eşleşen kural karar verir; başka kurala düşülmez.
**Dizin ya da `*` hedefi** (örn. `rm -rf gunluk/URUN`, `mv gunluk arsiv/`, `departman/*/x`): statik önek genişletmesiyle bakılır (dosya sistemi
taranmaz); altındaki yolların **en kısıtlısının** kuralı uygulanır. `gunluk/URUN` dizin hedefi R4'e düşer ve R4 OPS dahil kimseye izin vermez;
temizlik istisnası (aşağıda) yalnız **tek dosya** hedefinde geçerlidir, dizin hedefinde geçmez.

"Şerit" ve "rol" §3'teki çözümden gelir. **"tam"** bir rolün şerit adıyla birebir eşleştiği anlamına gelir (önekle eşleşme
"tam" değildir); OPS yetkisi gerektiren her satır **tam** eşleşme ister.

| No | Yol | Yazabilir | Not |
|---|---|---|---|
| K0 | Araç olmayan yazmalar: kancaların ve betiklerin kendi yazdığı dosyalar (`son-konusma-*.md` Stop kancası, `MEMORY.md.oncesi-*` yedekleri, `.gitignore`, `.git/**`, hafıza yedek commit'i) | kural uygulanmaz | Kanca yazımı araç çağrısı olmadığından kancaya gelmez; bu satır "izinli" sayıldığını yazılı kılar. **Test yok, yalnız belge** (kancaya gelmeyen yazma sınanamaz). Pencerenin kendi `Edit`/`Write` çağrısıyla bu dosyalara yazması R8'e düşer (modelin `cp MEMORY.md MEMORY.md.oncesi-…` yedeği de: yalnız OPS). |
| R6 | **Geçiş süresince** kökteki durum dosyaları: ad `(lane-day\|state\|durum)` içerir ve küçük harfli adın başı, bir ROL adının küçük harfli, `-` çıkarılmış hâli ile **ve ardından `-`** ile başlar (`geoseo-…`, `urun-katalog-lane-day-…` → URUN, `ops-cycle-audit-state.md` → OPS; `aracin-…` ARAC'a düşmez); birden çok ROL uyarsa en uzun önek | o ROL'ün oturumu | Geçiş bitince (§9) bu satır kalkar. Kalıba uymayan sahipli dosyalar (eski rol adları `auth-`, `pricing-`, `legal-`, `orion-`, `lane-day-states-index` gibi; `blog-seridi-berati`, `mevzuat-seridi-park`, `urun-lane-charter`, `admin-serit-sahibi` gibi anahtar sözcüksüz rol dosyaları) **R1'de kalır** (yalnız OPS); bunların hangi ROL'e taşınacağı §9 geçiş listesinde yazılır. |
| R5 | `gunluk/_sahipsiz/<session_id>.md` | yalnız o `session_id`'nin oturumu | Dosya adı tam `session_id` (harf duyarsız) ve `.md`; alt klasör ve başka ek yok. Şeridi olmayan pencerenin tek günlük yeri. |
| R4 | `gunluk/<ROL>/**` | o ROL'ün oturumu (alt ajan dahil) | OPS dahil başkası yazmaz, okur. Geçiş taşıması için R10. |
| R3 | `departman/<ROL>/**` | o ROL'ün oturumu (önekle eşleşme yeter); şeridi OPS olan oturum (tam) | Başka departman yazamaz. |
| R2 | `oneri/**` | dosya adı `<ROL>-` ile başlıyorsa o ROL'ün oturumu; `_sahipsiz-<session_id>-` ile başlıyorsa o oturum | Başkasının öneri dosyasının üzerine yazılmaz. Şeridi olmayan pencere yalnız `_sahipsiz-` adıyla yazar. |
| R1 | `MEMORY.md`, kökteki `*.md` ortak ders dosyaları, `olcum/**` | şeridi OPS olan oturum (**tam**) | Departman yazamaz, R2'ye öneri bırakır. |
| R7 | `arsiv/**` | şeridi OPS olan oturum (**tam**) | Geçiş süresince HARİTA da (R10). |
| R8 | tablo dışı her hafıza yolu (kökteki `.py`, `.json`, `belge-yonetimi-devir/**` dahil) | şeridi OPS olan oturum (**tam**) | Sınıflandırılmamış yeni yol açılmaz. `belge-yonetimi-devir/**` HARİTA'nın çalışma klasörüdür; geçiş süresince R10 kapsar, sonra arşive taşınır. |
| R9 | Repoda talimat dosyaları (yalnız aşağıdaki kalıplar; kök yolları git köküne göredir, `AGENTS.md` yalnız depo kökündekidir): `CLAUDE.md`, `.claude/CLAUDE.md`, `AGENTS.md`, `docs/roller/**`, `docs/proje-takip/design/*/CLAUDE.md`. **Kaynak dosyalar da bu kapsamdadır (açık liste, v0.4):** `scripts/belge/rol-karti-uret.cjs`, `docs/roller/cetvel-sahipligi.*`, ayar dosyası `.claude/hafiza-yazma-ayar.json`, `.claude/hooks/**/hafiza-yazma-*` (kanca ve `lib/hafiza-yazma-kurali.cjs` kütüphanesi), `INV-HAFIZA-YAZMA-1` test dosyası, `scripts/board/pencere-adlari.cjs`, `scripts/board/board.cjs`, `.claude/settings.json`, `.claude/settings.local.json` | şeridi OPS olan oturum (**tam**); HARİTA, `harita_muafiyet_son` tarihine kadar | Çıktıyı (kartlar) korumak, kaynağı (üretici, sahiplik kaydı, ayar) korumamak bir delik olurdu: HARİTA kapandıktan sonra da üreticiyi düzenleyip kartları değiştirebilirdi. **Ön süzgeç (maliyet):** hedefin dosya adı `CLAUDE.md`, `AGENTS.md`, `settings.json`, `settings.local.json` ya da yolu `roller/` ya da `hooks/` ya da `scripts/belge/` ya da `scripts/board/` segmenti içeriyorsa git kökü bakılır; içermiyorsa R9 hiç işletilmez (her `Edit`/`Write` çağrısında git çağırmamak için). "Repo" bu deponun ana ağacıdır (git ortak dizininin ebeveyni); ek çalışma dizinlerindeki başka depolar ve `~/.claude/CLAUDE.md` bu kuralın konusu değildir. `.claude/skills/**` ve `.agent/skills/**` bu cetvelin kapsamı dışı (YETENEK). `docs/roller/**` yazımı elle değil kart üreticisi üzerindendir (kart testi elle düzenlemeyi kırmızı yapar). |
| R10 | **EK İZİN** (öncelik: §2 başı): geçiş taşıması: `gunluk/**`, `departman/**`, `arsiv/**`, `belge-yonetimi-devir/**` altına yazma ve silme; kökteki durum dosyalarının ve R1 dosyalarının **silinmesi/taşınması** | şeridi OPS ya da HARİTA olan oturum (**tam** ya da HARİTA), `gecis_son` tarihine kadar | Ayrı bir taşıma listesi yoktur; kapsam yol kalıbıdır, sınır tarihtir. Koşul sağlanmıyorsa R10 yok sayılır, yol normal kuralına düşer. Bash `mv` ve `cp` komutlarının **kaynağı** bugün hedef sayılmıyor (`bash-write-targets.cjs`); kaynak silme kancaya gelmiyorsa açık delik (§6), bu kalemi ARAÇ iş listesi çözer. |

**Tarihli bayraklar** (`harita_muafiyet_son`, `gecis_son`) ayar dosyasında durur: **sabit yol `.claude/hafiza-yazma-ayar.json`, ANA AĞAÇTA**
(git ortak dizininin ebeveyni; worktree kopyasından okunmaz. HARİTA'nın pencereleri `venthub-harita-*` worktree'lerinde açılır ve dosya dalda
olmasa da muafiyet düşmez; kancalar da ana ağaçtan yüklenir). Dosya R9 kapsamındadır. Biçim: ISO tarih (`YYYY-MM-DD`), UTC, "tarihe kadar" dahildir
(o günün 23:59:59 UTC'sine kadar; İstanbul saatiyle ertesi gün 02:59:59). Dosya yok, bozuk ya da alan eksikse muafiyet **yoktur** (fail-closed muafiyet
tarafında). HARİTA yeniden açılırsa bayrağı OPS yeniler; tarih geçince muafiyet kendiliğinden düşer. Testte saat `VENTHUB_SIMDI` ile (ISO,
tam damga ya da tarih) enjekte edilir.

**Temizlik istisnası (v0.4, ARAÇ kararı 2):** yalnız **tek dosya** hedefinde ve yalnız **silme ya da `arsiv/`'e taşıma** işleminde geçerlidir; içerik
yazma değildir (R4 "OPS dahil başkası yazmaz" içerik yazma içindir). Kapsam ve koşul:
- `oneri/**` tek dosya: şeridi OPS (**tam**) olan oturum, **koşulsuz** siler ya da taşır (kabul/red işareti aranmaz; işareti üretmek kancanın işi değildir).
- `gunluk/**` tek dosya (`gunluk/_sahipsiz/**` dahil): yalnız kaynak dosyanın son değişiklik zamanı **14 günden eskiyse** ve yazan tam OPS ya da geçerli HARİTA
  muafiyeti ise. Süresi dolmamış günlük hiçbir pencerece silinip taşınamaz (R4).
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
kullanımı (~L232) ve `claim` komut satırı varsayılanı (`flags.lane || 'lane'`, ~L1221-1223). Düzelince `lane` panoya hiç girmez; bu yüzden **D10c kanca
düzeyinde kurulamaz** ve kütüphane testine iner (girdi `{ lane: 'lane', sonBilinenAd }`; `sonBilinenAd` `tumTalepler` ve ham olaydan okunur, süresi
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
(R1, R3-OPS, R7, R8, R9-OPS) **her ikisine de** engellenir ve durum satırında alarm çıkar. OPS kimliği bir şerit beyanıdır
(`claim --lane OPS` herkes alabilir, `board.cjs` doğrulamaz); bu, güvenlik değil **kalite ağıdır** (§6). **Çöken pencere düzeltmesi:**
çöken ya da yeniden açılan OPS penceresinin eski claim'i TTL (4 saat) boyunca canlı kalır ve tek meşru yazıcıyı kilitlerdi; bu yüzden
"canlı OPS" sayımı 30 dakikalık sezgiyle değil, **canlılık ölçümüyle** yapılır (REC-524'te birleşen `scripts/board/canlilik.cjs`, `claude agents --json`
ile açık pencereler; hayalet/kapalı pencerenin claim'i sayılmaz; fork ya da `/clear` ile yeni `sid` alan OPS'un eski claim'i kendini kilitlemez).
Bilgi eksikse (canlılık ölçülemedi) sezgi yedek olarak 30 dakikadır (yalnız son atışı 30 dakikadan yeni olanlar sayılır). Uzun otonom turda `heartbeat` yalnız
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
   aday üretir). Bu yüzden ortak işleve **çıkarılıp genişletilir**: dizin adayı döndürür, slug kuralı `[^A-Za-z0-9]` → `-`, testte noktalı yol vardır;
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
`VENTHUB_GIT_ORTAK_DIZIN`, `VENTHUB_SIMDI` (saat, ISO; D18 ve D19 tarihli bayrakları sınar). `BOARD_DIR` `board.cjs` yüklenirken sabitlenir; süreç içi test ortamı
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
  `{ arac, hedefler: [{ yol, islem }], cozulemedi, genisletmeli, panoDurumu, stdinBozuk, yolTuretilemedi, sid, agent_id, claimler: [{ sid, lane, ts, heartbeat }],
  adaylar, bayraklar, simdi }`; `islem` ∈ `yaz | sil | tasi` (R10, temizlik istisnası ve D27 işleme göre ayrılır); `hedefler` çoktur (Bash çok hedeflidir);
  `panoDurumu` `board.durumOku()` sonucudur (D11); `cozulemedi` ve `genisletmeli` Bash çıkarıcısının işaretleridir. **Çıktı:** her hedefin `izin | engel | olculemedi` kararı,
  sebebi ve kuralı; toplam karar hedeflerin **en kötüsüdür** (bir hedef engelse komut engelli).
- **Bash yolu:** hedef çıkarımı mevcut `bash-write-targets.cjs` kütüphanesini kullanır (yeni ayrıştırıcı yazılmaz). Kural
  `depoIcindeMi` süzgecinden **önce**, **ham** hedefler üzerinde çalışır; pano ve scratchpad muafiyeti korunur. Bu kütüphanenin sınırları
  §6'da açık delik olarak yazılıdır (`cd` izlemez, `;`/`&&` ile bölünen komutlarda yorumlayıcı gövdesini kaçırır, PowerShell fiillerini ve
  `git -C` alt komutlarını tanımaz); ayrıştırıcıyı genişletmek ARAÇ iş listesindedir (§10) ve bu şartnamenin kabul koşulu değildir.
- **Çalışma sırası (maliyet):** kanca her `Edit`/`Write`/`Bash` çağrısında koşar; pano 200'den fazla olay dosyası okuyabilir. Sıra:
  hedef yol çıkar → hafıza yolu mu (yalnız ucuz karşılaştırma) → **hayırsa hemen çık**; ancak evetse pano, `git rev-parse` ve olay kaydı.
  Gözlem satırı yalnız hafıza-yolu çağrılarında yazılır.
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
| **Sonradan yakalama YOK** | `bash-write-audit.cjs` yalnız çalışma ağaçlarının `git status`'ünü tarar; hafıza dizini bir ağaç değildir ve çalışma dizini kullanıcı ayar dizini altındaysa hiç çalışmaz. **Hiçbir mevcut kanca hafızaya betikle yazılanı görmez.** | Açık delik. İstenirse ayrı bir hafıza dizini taraması (dosya değişiklik zamanı ile `hafiza-yazma-olay.jsonl` karşılaştırması) sonraki iştir. |
| Bash kaza yolları | `cd <hafıza> && echo x > MEMORY.md`: çıkarıcı **`cd`/`pushd` izlemez**, `&&` ile segmentler bağımsızdır, göreli hedef kancanın cwd'sine göre çözülür → **yakalanmaz (açık delik)**. `$DEĞİŞKEN`, ev dizini kısayolu ve `*` içeren hedefler: çıkarıcı bunları işaretlemez, göreli yol gibi çözer. | Ev dizini kısayolu ve MSYS `/c/...` yolları kanca tarafında §4 normalizasyonuyla çözülür (**engel**). `$DEĞİŞKEN` ve `*` içeren hedef için çıkarıcıya `genisletmeli: true` işareti eklenir (ARAÇ iş listesi); işaretli hedef **izin + alarm**. `cd` izleme yoktur: açık delik, sonraki iştir. |
| PowerShell | Ana ortamın kabuğu PowerShell (bu oturumun ortam satırı böyle diyor); `settings.json`'da hiçbir kayıt PowerShell içermiyor ve `Set-Content`, `Out-File`, `Add-Content`, `Copy-Item`, `Move-Item` için hedef çıkaran kod yok (`eylem-defteri.cjs` fiilleri kaydediyor ama hedefe bakmıyor). | Eşleştirici `PowerShell` aracını da kapsar (§5); hedef çıkarımı ARAÇ'ın sonraki işidir; o zamana kadar açık delik. |
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
`projeDiziniBul` ve `os.homedir()` kullanımını yasaklıyor ve `exit(2)`'nin tam bir yerde olmasını istiyor; ortak aday işlevi ve `departman/*/MEMORY.md` genişletmesi
bunu kırar. Bu test **bilinçli güncellenir** (yeni ortak işlev serbest; mutlak **kullanıcı yolu** yasağı kalır; testte gerekçe satırı yazılır). Bekçi hedefi bugün
`dirname === 'memory'` ile tanır; departman için `.../departman/<ROL>/MEMORY.md` biçimi ve "katlanmış mı" araması **departman dizininde** yapılır (kökte değil).
Yeni açılan pencerenin claim'i açılışta henüz yoktur:
enjeksiyon `seritRolu` (§3) ile çözülen role göre basar; rol çözülemiyorsa departman hafızasını basmaz ve "şerit al, sonra departman hafızan gelir" der.
Alt klasör `CLAUDE.md`'si yalnız o klasördeki bir dosya
okununca yüklendiği için departman talimatı için güvenilir bir yol değildir.

---

## §8 Deneme senaryoları (her "izin" satırının "engel" eşi vardır)

Kanca kurulunca işi yapmamış bağımsız bir ajan bu tabloyu koşar; sonuç REC-530'a yazılır. D1-D13, D16-D19 ve D20-D30 otomatik testtir
(§10), D14-D15 elle denemedir. "Şeritli URUN" = canlı claim'i `URUN` olan oturum. Her R kuralının (R1-R10) en az bir izin ve bir engel satırı
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
| D8 | Şeritli URUN `gunluk/URUN/`'a / `gunluk/ALTYAPI/`'ya yazar; şeridi OPS olan oturum `gunluk/URUN/`'a yazar | izin / **engel** / **engel** (R4) |
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
| D13d | Bash `$HOME/…/MEMORY.md` ya da `*.md` (genişletmeli hedef) | izin + alarm (`genisletmeli`; çıkarıcı işareti eklenene kadar: geçer, açık delik §6) |
| D14 | Claude'un kendi otomatik hafıza yazımı: şeritli URUN pencerede "bunu hatırla" isteği | denenecek; iki dal: kancadan geçer (`hafiza-yazma-olay.jsonl`'da kayıt var) → R1 engeli ve `oneri/` yönlendirmesi; geçmez (kayıt yok) → `autoMemoryEnabled: false` kararı OPS ve Recep'te |
| D15a | Bash tek segmentli: `python -c "open('MEMORY.md','w').write('x')"` ile hafızaya yazma | **engel, mevcut `bash-write-guard.cjs` kapısından** (yorumlayıcı imzası, çözülemeyen hedef; her yola, OPS dahil); yeni kancanın bu kolu tekrarlamadığı ayrıca doğrulanır (çift mesaj yok) |
| D15b | Bash: `python -c "import os; open('MEMORY.md','w').write('x')"` (imza **ikinci** segmentte kalıyor: `;` ile bölünür), `python -c "open(p,'w').write('x');print(1)"` (imza ilk segmentte: bunun **engel** olduğu ölçüldü, D15a ile aynı), `Path(p).write_text('x')`, `cd <hafıza> && echo x > MEMORY.md`, `git -C <hafıza> checkout .` | ilk komut ve `write_text`, `cd`, `git -C` biçimleri **geçer** (açık delik, §6; hiçbir kanca görmez); ikinci komut **engel** |
| D16a | Worktree'de açılmış şeritli URUN `departman/URUN/`'a yazar | izin (ana depo dizini adayı) |
| D16b | Worktree'de açılmış şeritli URUN `MEMORY.md`'ye / `departman/ALTYAPI/`'na yazar | **engel** (R1 / R3) |
| D17 | Aynı anda iki canlı `tam` OPS claim'i: biri `MEMORY.md`'ye yazar | **engel** (ikisine de) + durum satırında çift OPS alarmı |
| D18 | R9: OPS `CLAUDE.md`'ye yazar / şeritli URUN yazar / HARİTA `harita_muafiyet_son` içinde / sonra yazar | izin / **engel** / izin / **engel** |
| D19a | R10 (**ek izin**): geçiş süresince HARİTA `gunluk/URUN/x.md` yazımı ve `arsiv/x.md` yazımı / `gecis_son` sonrası aynıları | izin (R10 koşulu) / **engel** (R10 yok sayılır; `gunluk/URUN/` R4'e, `arsiv/` R7'ye düşer) |
| D19b | Geçiş süresince şeritli URUN kendi `gunluk/URUN/x.md`'sine / `gunluk/ALTYAPI/x.md`'ye / `arsiv/x.md`'ye yazar | izin (R4, R10 gerekmez) / **engel** (R4) / **engel** (R7) |
| D19c | Geçiş süresince şeritsiz pencere `gunluk/_sahipsiz/<kendi-sid>.md` yazar | izin (R5; R10 karar verici olsaydı bu düşerdi) |
| D20 | R6: şeritli URUN kendi kökteki `urun-lane-day-x.md`'sine / `aracin-x-state.md`'ye (önek `-`'sız) / `altyapi-lane-state-x.md`'ye yazar | izin / **engel** (R1'e düşer) / **engel** (R6 başka ROL) |
| D21 | R6: `urun-katalog-lane-day-x.md` dosyasına şeridi `URUN-KATALOG` olan oturum / şeridi `URUN` olan / şeridi `KATALOG` olan yazar | izin / izin (aynı ROL URUN) / **engel** (en uzun önek URUN, KATALOG değil) |
| D22 | R7: şeridi OPS (tam) `arsiv/x.md`'ye yazar / şeridi `OPS-AUDIT` olan / şeritli URUN (geçiş bayrağı kapalıyken) | izin / **engel** / **engel** |
| D23 | R8: şeridi OPS (tam) hafıza kökünde `x.py`'ye yazar / şeritli URUN aynı yola | izin / **engel** |
| D24 | R9 kaynak dosyaları: şeritli URUN `scripts/belge/rol-karti-uret.cjs`'e / `docs/roller/cetvel-sahipligi.json`'a yazar; OPS (tam) aynılarına; HARİTA `harita_muafiyet_son` içinde / sonra | **engel** / **engel** / izin / izin / **engel** |
| D25 | Bayrak dosyası yok, bozuk ya da alanı eksik iken HARİTA `CLAUDE.md`'ye yazar | **engel** (muafiyet yok, §2) |
| D26 | Çift OPS: biri **canlılık ölçümünde açık pencere olmayan** (çöken/hayalet; ölçüm yoksa son atışı 30 dakikadan eski) claim'i, öteki canlı | çift OPS **değil**, canlı olan `MEMORY.md`'ye yazar: izin; çift OPS alarmı çıkmaz |
| D27a | Temizlik (`islem: sil` ya da `tasi`, **tek dosya**): OPS (tam) `oneri/x.md`'yi `arsiv/`'e taşır ya da siler / şeritli URUN aynı işlemi yapar | izin (koşulsuz) / **engel** |
| D27b | Temizlik: OPS (tam) mtime 20 gün eski `gunluk/URUN/x.md`'yi siler / mtime 3 gün eski olanı siler / şeritli URUN 20 gün eskiyi siler | izin / **engel** (14 gün dolmadı) / **engel** (yazan OPS ya da HARİTA-muafiyet değil) |
| D27c | Temizlik: OPS (tam) `rm -rf gunluk/URUN` / `mv gunluk arsiv/` (dizin hedefi) / `departman/*/x.md` silme | **engel** (en kısıtlı kural R4; dizin ve `*` hedefinde temizlik istisnası geçmez) |
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

**Kapının üç tüketicisi vardır, yalnız birini değiştirmek compact dönüşünü bozar** (ölçüldü): (1) `precompact-durum-kapisi.cjs` (compact'ı
durduran kapı); (2) `session-board.cjs` compact dönüşünde `durumDosyasiBul`'u kullanır (dönüşte "durum dosyan şu" enjeksiyonu); (3)
`son-konusma-dokumu.cjs` `projeDiziniBul` ile `memory/` dizinini çözer. Üçü **aynı ortak işlevi** kullanır: `oturumunDosyalari` bugün düz
`readdirSync` yapar, `sid`'i dosyanın ilk 600 karakterinde arar ve `AD_KALIBI` şart koşar; yeni işlev `gunluk/*/` ve `gunluk/_sahipsiz/`
altını `sid`'e göre tarar (kapıda pano yok, ROL bilmeye gerek kalmaz) ve §4'ün aday kümesini kullanır. **`_sahipsiz/<sid>.md` eşleşmesi dosya adıyladır**
(`<sid>.md`, harf duyarsız; içerikte frontmatter aranmaz: bugünkü ilk 600 karakter kuralı frontmatter'sız dosyayı yok sayardı). **Dönüş sözleşmesi (v0.4):**
`{ okumaAdaylari: [dizin…], yazmaHedefi: dizin }` (okuma tüm adaylardan; **yazma hedefi ana deponun hafıza dizinidir**, worktree'de `memory/` olmadığı için
bugün `son-konusma-dokumu.cjs` `writeFileSync` ENOENT'ini sessizce yutuyor ve worktree pencerelerinde döküm hiç yazılmıyor); durum dosyası bulma `{ dosya, sahipsiz }`
döner. `session-board.cjs` compact kolu `sahipsiz: true` dosyayı "DURUM DOSYAN" diye basar ama "şerit al" uyarısıyla birlikte; `oturumunDosyalari` bugün
dışa açık değildir (`module.exports`) ve `durumDosyasiBul` adı kapı testinde kilitlidir (`precompact-durum-kapisi.test.ts`): yeni işlev bu adı korur, test bilinçli
güncellenir. Alt ajanın transcript'i `<proje>/<sid>/subagents/agent-*.jsonl` altında durur; kancaya verilen `transcript_path` bu dosyaysa `path.dirname` yanlış
dizini verir, ortak işlev bunu tanır (proje dizinini `subagents/` üstünden çözer). Worktree'den açılan oturumda `projeDiziniBul` bugün de transcript dizinini verir ve orada `memory/` yoktur (harita-h4, urun-acilis,
harita-bicim'de ölçüldü): kapı **bugün** bu oturumlarda "hiç durum dosyası yok" der; aday kümesi kapıya da uygulanır.
Kapı önce `gunluk/<ROL>/`'a, bulamazsa geçiş süresince köke bakar (R6 ile aynı kalıp). `gunluk/_sahipsiz/<session_id>.md` kapıda
**"durum var" sayılır**, ama yalnız **uyarı düzeyinde**: şeritsiz pencerenin tek yazma yeri orasıdır ve sayılmasaydı compact'ı hiç geçemezdi
(`VENTHUB_PRECOMPACT_KAPALI=1` dışında); süresi dolan claim'li pencere de aynı yere düşer.

**Geçiş listesi:** hangi kök dosyanın hangi ROL'e taşınacağı (eski rol adları `auth-`→SATIS, `pricing-`, `legal-`, `orion-`, `kademe2-…`,
`t150-…` dahil; sahibi belirsizler R1'de OPS'ta kalır) 600 dosyanın sınıflandırması sırasında tek dosya listesi olarak OPS'a gösterilir (OPS onayı
sonrası taşınır). Taşımayı yapan HARİTA (R10, `gecis_son` içinde).

---

## §10 ARAÇ'a devir sözleşmesi

| Kalem | Beklenen |
|---|---|
| Karar kütüphanesi | `.claude/hooks/lib/hafiza-yazma-kurali.cjs` (saf işlev; §2 R1-R10, §3 sınıflar; girdi/çıktı sözleşmesi §5 "Yeni kanca yazılır" maddesinde: `hedefler:[{yol,islem}]`, `cozulemedi`, `genisletmeli`, `panoDurumu`, `claimler`, `adaylar`, `bayraklar`, `simdi`; çıktı hedeflerin en kötüsü; dosya sistemi, `realpath` ve pano kancada) |
| Kanca | `hafiza-yazma-bekcisi.cjs` (PreToolUse); dosya araçları ve Bash tek dosyada; alt ajan mesajı her iki yolda; alarm ve olay kaydı oturum başına (§3, §5); çalışma sırası §5 |
| Ayar | `.claude/settings.json` eşleştirici `Edit\|Write\|MultiEdit\|NotebookEdit\|Bash`; ana ağaca ileri sarma. Değişikliği ARAÇ yapar, **OPS onaylar** (ARAÇ kartı: "settings değişikliği OPS kapısıdır"); dosya yolu okuma `file_path \|\| notebook_path` |
| Yardımcılar | `seritRolu` (`pencere-adlari.cjs`, ARAÇ #1592 sonrası ayrı küçük PR; `session-board.cjs` aynı işlevi kullanır); ana depo dizini türetimi `belge-tazelik.cjs`'ten ortak işleve (dizin adayı döndürür, slug `[^A-Za-z0-9]`→`-`) |
| **ARAÇ iş listesi (kabul koşulu)** | (1) `board.durumOku()`: dizin var mı, olay dosyası sayısı, bu `sid`'in dosyası var mı, bozuk satır ve hangi dosyada; dizini **yaratmaz** (§3). (2) `board.cjs` adsız `claim`'in önceki şerit adını ezmesi (`lane`) düzeltilir (§3). (3) `session-board.cjs`, `precompact-durum-kapisi.cjs`, `son-konusma-dokumu.cjs`: ortak durum dosyası bulma işlevi (§9), AYNI PR. (4) `hafiza-indeks-bekcisi.cjs` kapsamı `departman/*/MEMORY.md`, eşik 60 satır / 8 KB **yumuşak**, `hafiza-indeks-bekcisi-kilidi.test.ts` bilinçli güncelleme (§7). (5) `lane` ezmesi **üç yerde** (§3). (6) Ayar dosyası `.claude/hafiza-yazma-ayar.json` ana ağaçtan okunur (§2). **Ekip üyesi** claim'siz = şeritsiz (§3). |
| **ARAÇ iş listesi (sonraki iş, kabul koşulu DEĞİL)** | `bash-write-targets.cjs`: `cd`/`pushd` izleme; tırnak farkındalıklı segment bölme; `mv`/`cp` kaynağı; `git -C` alt komutları; `genisletmeli: true` işareti; PowerShell fiilleri (§6). Bunlar yapılınca §8 D13d/D15b beklentileri "engel"e çevrilir. |
| Test | `src/__tests__/conformance/` altında yeni kapı (öneri `INV-HAFIZA-YAZMA-1`): §8 D1-D13, D16-D30, her satır izin/engel çiftiyle; test enjeksiyonu §4 (`VENTHUB_SIMDI` dahil); sabotaj: her kural için "izin'e çevir" mutasyonu → kırmızı |
| Durum satırı | `board-brief.cjs` alarm dosyalarını okur (§3); alarm kaydı ve olay dosyası oturum başına |
| Kapı | §9'daki üç tüketici, AYNI PR |
| Envanter | `docs/audits/arac-envanteri-*` satırı (kanca envantere girmeden bitmiş sayılmaz) |
| Deneme | D14 ve D15'i HARİTA'nın bağımsız ajanı koşar; sonucu REC-530'a yazar |

---

## §11 Kapanan ve açık kararlar

**OPS'un 2026-09-30 kararları (işlendi):** fail-open + durum satırı alarmı (§3); şeritsiz pencere yalnız `oneri/` ve
`gunluk/_sahipsiz/<sid>.md` (R2, R5); Bash tam kilit değil (§6); kanca yolu ayardan türetilir, sabit yol yok (§4); OPS kimliği şerit
beyanı, kalite ağı olarak kabul, çift OPS claim'i ikisine de engel (§3); R9 HARİTA kapandıktan sonra `CLAUDE.md`, rol kartları ve kurallar
dosyalarını yalnız OPS yazar (kartlar üretici üzerinden), HARİTA muafiyeti tarihli bayrak, yeniden açılırsa OPS yeniler; şerit adı → rol tablosu
tek yerde (`pencere-adlari.cjs`).

**Açık:**
- **Otomatik hafıza yazımı:** D14 sonucuna göre `autoMemoryEnabled: false` (OPS ve Recep).
- **`autoMemoryDirectory` proje ayarı kısıtı:** proje ayarından gelen değerin "çalışma alanı güveni" gibi ek bir kısıta tabi olup olmadığı belgeden
  doğrulanmadı; ilk kanca denemesinde ölçülür (§4).
- **Sandbox / yönetilen katman:** §6'daki kanca kapatma ve Bash delikleri için işletim sistemi düzeyi koruma ayrı karar.
- **Bash sonrası tarama:** hafıza dizini için ayrı sonradan tarama (§6) yapılıp yapılmayacağı.

---

## Değişiklik kaydı

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
