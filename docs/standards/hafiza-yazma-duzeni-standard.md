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
> kodu bağımsız bir okuyucuyla ve kaynaktan karşılaştırıldı). **Kanca KURULU DEĞİL** (§10); bu cetvel şartnamedir.

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

**Değerlendirme sırası ve öncelik:** kural en özel yoldan genele doğru bakılır: önce K0 (kapı dışı), sonra R6 (durum dosyası
kalıbı), sonra R5, R4, R3, R2, R1, R7, en son R8. İlk eşleşen kural karar verir; başka kurala düşülmez.

"Şerit" ve "rol" §3'teki çözümden gelir. **"tam"** bir rolün şerit adıyla birebir eşleştiği anlamına gelir (önekle eşleşme
"tam" değildir); OPS yetkisi gerektiren her satır **tam** eşleşme ister.

| No | Yol | Yazabilir | Not |
|---|---|---|---|
| K0 | Araç olmayan yazmalar: kancaların ve betiklerin kendi yazdığı dosyalar (`son-konusma-*.md` Stop kancası, `MEMORY.md.oncesi-*` yedekleri, `.gitignore`, `.git/**`, hafıza yedek commit'i) | kural uygulanmaz | Kanca yazımı araç çağrısı olmadığından kancaya gelmez; bu satır "izinli" sayıldığını yazılı kılar. Pencerenin kendi `Edit`/`Write` çağrısıyla bu dosyalara yazması R8'e düşer. |
| R6 | **Geçiş süresince** kökteki durum dosyaları: ad `(lane-day\|state\|durum)` içerir ve küçük harfli adın başı bir ROL adının küçük harfli, `-` çıkarılmış hâliyle başlar (`geoseo-…`, `urun-katalog-lane-day-…` → URUN, `ops-cycle-audit-state.md` → OPS); birden çok ROL uyarsa en uzun önek | o ROL'ün oturumu | Geçiş bitince (§9) bu satır kalkar, dosyalar `gunluk/<ROL>/`'a taşınmış olur. |
| R5 | `gunluk/_sahipsiz/<session_id>.md` | yalnız o `session_id`'nin oturumu | Dosya adı tam `session_id` (harf duyarsız) ve `.md`; alt klasör ve başka ek yok. Şeridi olmayan pencerenin tek günlük yeri. |
| R4 | `gunluk/<ROL>/**` | o ROL'ün oturumu (alt ajan dahil) | OPS dahil başkası yazmaz, okur. Geçiş taşıması için R10. |
| R3 | `departman/<ROL>/**` | o ROL'ün oturumu (önekle eşleşme yeter); şeridi OPS olan oturum (tam) | Başka departman yazamaz. |
| R2 | `oneri/**` | dosya adı `<ROL>-` ile başlıyorsa o ROL'ün oturumu; `_sahipsiz-<session_id>-` ile başlıyorsa o oturum | Başkasının öneri dosyasının üzerine yazılmaz. Şeridi olmayan pencere yalnız `_sahipsiz-` adıyla yazar. |
| R1 | `MEMORY.md`, kökteki `*.md` ortak ders dosyaları, `olcum/**` | şeridi OPS olan oturum (**tam**) | Departman yazamaz, R2'ye öneri bırakır. |
| R7 | `arsiv/**` | şeridi OPS olan oturum (**tam**) | Geçiş süresince HARİTA da (R10). |
| R8 | tablo dışı her hafıza yolu | şeridi OPS olan oturum (**tam**) | Sınıflandırılmamış yeni yol açılmaz. |
| R9 | Repoda talimat dosyaları: `CLAUDE.md`, `.claude/CLAUDE.md`, `AGENTS.md`, `docs/roller/**`, `docs/proje-takip/design/*/CLAUDE.md` | şeridi OPS olan oturum (**tam**); HARİTA, `harita_muafiyet_son` tarihine kadar | Yalnız bu kalıplar; `.claude/skills/**` ve `.agent/skills/**` bu cetvelin kapsamı dışı (YETENEK). `docs/roller/**` yazımı elle değil kart üreticisi üzerindendir (kart testi elle düzenlemeyi kırmızı yapar). |
| R10 | Geçiş taşıması: `gunluk/<ROL>/**` ve `departman/<ROL>/**` | şeridi OPS ya da HARİTA olan oturum, `gecis_son` tarihine kadar | Yalnız §9'un taşıma listesindeki dosyalar için. |

**Tarihli bayraklar** (`harita_muafiyet_son`, `gecis_son`) kancanın ayar dosyasında durur (yeri ARAÇ'la belirlenir, örnek
öneri `scripts/belge/hafiza-yazma-ayar.json`). HARİTA yeniden açılırsa bayrağı OPS yeniler; tarih geçince muafiyet kendiliğinden düşer.

**Şeridi olmayan pencere** hiçbir hafıza yoluna yazamaz; yalnız R2 (`_sahipsiz-` adıyla) ve R5.

---

## §3 Oturum kimliği ve şerit

**Şerit bulma (mevcut kodda bu eşleme YOK, yeni yazılır):** `lane-guard.cjs` ve `bash-write-guard.cjs` yalnız
`board.findConflict()` çağırır (başkasının canlı claim'ine çarpıp çarpmadığı); `session_id` → şerit adı eşlemesi yapmazlar.
Şerit adı, `scripts/board/board.cjs`'in dışa açık `liveClaims()` sonucundan `session_id`'si eşleşen kayıtla bulunur
(canlı = TTL içinde, release edilmemiş; `seritAdi()` dışa açık değildir ve TTL'yi yok sayar, kullanılmaz).

**Şerit adı → rol:** pano şerit adı serbest metindir (`URUN-KATALOG`, `ADMIN-UX`, `OPS-AUDIT`, `ALTYAPI-NLM`; adsız claim
literal `lane` yazar). Çözüm tek yerde yapılır: `scripts/board/pencere-adlari.cjs` içindeki `seritRolu(lane)` (ARAÇ, ayrı PR;
ayrı ikinci bir tablo yazılmaz). Sözleşme: büyük harfe çevir ve Türkçe karakterleri ASCII'ye indir; önce tam eşleşme
(`GEO-SEO`), yoksa `-` ile ayrılmış en uzun bilinen önek (soldan); dönüş `{ rol, tam }`; bilinmeyen ya da `lane` → `null`.
Rol listesi `ROLLER` anahtarlarından okunur. **OPS için yalnız tam eşleşme** `tam: true` döner (`OPS-AUDIT` → `tam: false`).

**Şeritsiz sayılan durumlar:** çözümün `null` döndürdüğü her durum (canlı claim yok, süresi dolmuş claim, `lane`, bilinmeyen ad).
Bu pencere yalnız R2 (`_sahipsiz-`) ve R5'e yazar. Her engellemede kanca şunu gösterir:
`önce şerit al: node scripts/board/board.cjs claim --sid <sid> --lane <ROL> --globs "<yol>"`; mesaja OPS örneği konmaz.

**Alt ajan:** ebeveyninin `session_id`'siyle ve `agent_id` alanıyla gelir (ölçüldü); ebeveynin şeridiyle yazar. R4/R5 "pencerenin
kendisi" dediği yerde alt ajan dahildir. Engelde mesaj alt ajana "dosyanın tam içeriğini raporunda döndür, ebeveynin yazsın" der;
bu mesaj **dosya araçlarında da Bash yolunda da** verilir (bugün `bash-write-guard.cjs` `agent_id`'yi okumuyor, eklenir).

**Çift OPS kuralı (OPS kararı 2026-09-30):** aynı anda birden fazla canlı claim `tam: true` OPS ise ortak çekirdeğe yazma
(R1, R3-OPS, R7, R8, R9-OPS) **her ikisine de** engellenir ve durum satırında alarm çıkar. OPS kimliği bir şerit beyanıdır
(`claim --lane OPS` herkes alabilir, `board.cjs` doğrulamaz); bu, güvenlik değil **kalite ağıdır** (§6).

### Ölçülemedi ≠ şeritsiz (FAIL-OPEN + görünür alarm, OPS kararı 2026-09-30)

Mevcut iki kanca bilinçli fail-open'dır (bu bir koordinasyon kapısıdır; fail-closed pano bozulunca herkesin günlüğünü durdurur).
Ancak `board.readEvents()` hiç istisna atmaz: pano dizini okunamazsa `[]` döner, bozuk satırı atlayıp stderr'e uyarı basar. Bu yüzden
"pano okunamadı" kendiliğinden fail-open'a düşmez, herkes şeritsiz görünüp **engellenir**. Kanca ölçülemedi durumunu kendisi
tanır ve izin verir:

| Durum | Sınıf | Karar |
|---|---|---|
| Pano dizini yok ya da okunamıyor | ölçülemedi | izin + alarm |
| Pano dizininde hiç olay dosyası yok | ölçülemedi | izin + alarm |
| Okuma sırasında bozuk satır uyarısı üretildi | ölçülemedi | izin + alarm |
| Olay dosyaları var, ama bu `session_id`'nin dosyası yok | şeritsiz (pencere panoya hiç kaydolmamış) | R2/R5 dışı engel |
| Bu `session_id`'nin canlı claim'i yok / süresi dolmuş | şeritsiz | R2/R5 dışı engel |
| stdin bozuk ya da boş; hafıza yolu türetilemedi (§4) | ölçülemedi | izin + alarm |

**Alarm:** kanca pano dizininde `hafiza-yazma-alarm.jsonl` dosyasına bir satır bırakır (`ts`, `sid`, `sebep`); aynı `sid`+`sebep`
10 dakikada bir kez yazılır (tekilleştirme), kayıtlar 30 dakika sonra düşer. Her mesajın durum satırına şu düşer:
`HAFIZA YAZMA: kural ölçülemedi: <sebep>` ya da `HAFIZA YAZMA: birden fazla canlı OPS claim'i`. Yalnız günlüğe yazmak yetmez.
Engelleme mesajı stderr'e yazılır ve exit 2 ile modele döner; alarm gibi exit 0 ile verilen bilgi modele `modele-ilet.cjs`
ile iletilir (exit 0'da stderr modele ulaşmaz).

---

## §4 Hafıza dizininin türetilmesi (sabit yol YOK)

Hafıza dizini kancaya gömülmez (depo genel; kullanıcı adı taşıyan yol yazılmaz). Kanca çalışma anında **aday kümesini** türetir:

1. **`autoMemoryDirectory` tanımlıysa** yalnız o dizin hafıza sayılır, öbür adaylar devre dışı kalır (yeni dizin korunur, eski dizin artık
   yüklenen hafıza değildir; D12). Değer yalnız mutlak yol ya da ev dizini kısayoluyla başlayan yol olabilir (Claude Code belgesi:
   memory sayfası; ayar sayfası değer biçimini tutarsız anlatıyor, göreli değer kabul edilmez). Ayar dosyaları, öncelik sırasıyla:
   yerel proje ayarı, proje ayarı, kullanıcı ayarı. Bu makinede hiçbirinde tanımlı değildir (2026-09-30 ölçüldü). Tanımlıysa durum
   satırına bilgi düşer: `HAFIZA YAZMA: hafıza dizini ayarla taşınmış`.
2. **Tanımlı değilse üç aday** (hedef yol herhangi birinin altındaysa hafıza yoludur): (a) `transcript_path`'in proje dizinindeki `memory/`
   (varsa); (b) **ana depo dizini:** worktree'de açılan oturumların kendi proje dizininde `memory/` yoktur, hafıza ana deponun proje dizini
   altındadır. Türetim kodu `scripts/belge/belge-tazelik.cjs` içinde hazırdır (git ortak dizininden ana depo yolu, sürücü ayracı ve
   bölü karakterleri `-`'ye çevrilerek proje dizini adı, iki harf büyüklüğü adayı denenir); kancada tekrar yazılmaz, ortak işleve çıkarılır;
   (c) ortam değişkeni `CLAUDE_CODE_PROJECT_DIR_NAME` tanımlıysa proje dizini adı yerine o (Claude Code belgesi; depoda başka yerde
   kullanılmıyor, kanca yalnız okur).
3. **Yol karşılaştırma kuralı (normalizasyon):** her iki yol `path.resolve` ile çözülür (`..` gider), ters bölüler düz bölüye çevrilir,
   MSYS biçimi (`/c/...`) ve ev dizini kısayolu genişletilir, mümkünse `fs.realpathSync.native` ile bağlantılar çözülür (yoksa hedefin
   var olan en yakın üst dizini çözülür), sürücü harfi dahil **büyük/küçük harf duyarsız** karşılaştırılır (hafıza dizini bu makinede
   küçük harfle, başka proje dizinleri büyük harfle başlar; NTFS duyarsız). Sonra "altında mı" testi yapılır.

Aday bulunamazsa §3'teki ölçülemedi kolu işler.

**Test enjeksiyonu:** kanca gerçek kullanıcı ayarlarına ve gerçek hafıza dizinine dokunmadan test edilebilmelidir. Ortam
değişkenleri (mevcut emsaller: `VENTHUB_BOARD_DIR`, `VENTHUB_CLAUDE_KOK`, `VENTHUB_MEMORY_INDEX`): `VENTHUB_BOARD_DIR` (pano),
`VENTHUB_MEMORY_DIRS` (aday listesi, `;` ile), `VENTHUB_AYAR_KOK` (ayar dosyalarının aranacağı kök), `VENTHUB_GIT_ORTAK_DIZIN`.

---

## §5 Eşleştirici ve mimari

- **Yeni kanca yazılır** (bir önceki sürümdeki "mevcut kancalara kural eklenir" cümlesi geri alındı): `findConflict` depo-göreli glob'la
  çalışır (yolu depo köküne göre çevirir), hafıza dizini ise kendi git deposudur ve depo dışıdır; hafıza yolları ona verilmez, çünkü
  anlamsız bir göreli yol üretir. `bash-write-guard.cjs` ayrıca depo dışı hedefleri **bilerek** görmezden gelir (pano ve scratchpad
  yazımı bu kapının konusu değil). Bu yüzden hafıza kuralı ayrı bir kanca dosyasıdır (öneri ad `hafiza-yazma-bekcisi.cjs`) ve karar mantığı
  saf bir kütüphanede durur (`.claude/hooks/lib/hafiza-yazma-kurali.cjs`: girdi = araç adı, hedef yol, `session_id`, canlı claim
  listesi, aday kümesi, tarihli bayraklar; çıktı = `izin | engel | olculemedi` ve sebep; test bu kütüphaneyi doğrudan çağırır).
- **Bash yolu:** hedef çıkarımı mevcut `bash-write-targets.cjs` kütüphanesini kullanır (yeni ayrıştırıcı yazılmaz). Kural
  `depoIcindeMi` süzgecinden **önce**, **ham** hedefler üzerinde çalışır; pano ve scratchpad muafiyeti korunur.
- **Araçlar ve alan adı:** `Edit`, `Write`, `MultiEdit`, `NotebookEdit` ve `Bash`. Yol alanı `file_path`'tir, `NotebookEdit`'te `notebook_path`
  (kod `file_path || notebook_path` okur; bugün yalnız `file_path` okunuyor). Eşleştirici tam adla eşleşir: `Edit|Write` diğer ikisini
  tutmaz. Bu, `.claude/settings.json` kaydının (`PreToolUse`, eşleştirici `Edit|Write|MultiEdit|NotebookEdit|Bash`) değişmesi ve
  değişikliğin **ana ağaca** ileri sarılması demektir (kancalar ana ağaçtan yüklenir).
- **Engelleme:** çıkış kodu 2, sebep stderr'e yazılır ve modele döner. Mesaj: hangi kural (R numarası), izinli yol, şerit alma
  komutu ve "ortak çekirdek için `oneri/` altına talep bırak" yönlendirmesi.
- **`permissions.deny` bu iş için yetmez:** deny kuralları oturuma göre ayırt etmez, OPS'u serbest bırakamaz. Doğru anahtar
  `Edit(yol)`'dur (Windows'ta yol POSIX biçimine çevrilir); `Write`, `MultiEdit`, `NotebookEdit` ile yazılan yol kuralı kabul edilir
  ama hiç sorgulanmaz.
- **Gözlem kaydı:** kanca her çağrıda (izin ya da engel) pano dizininde `hafiza-yazma-olay.jsonl` dosyasına kısa bir satır bırakır
  (`ts`, `sid`, `arac`, `yol_sinifi` [R numarası], `karar`); D14 (Claude'un kendi otomatik yazımı) buradan okunur. Kayıtlar 7 gün tutulur.

---

## §6 Sınırlar: tam kilit DEĞİL (sebep belge, OPS kararı)

Bu düzen **kalite ağıdır, güvenlik sınırı değildir.** Bilinen delikler:

| Delik | Sebep | Karşılık |
|---|---|---|
| **OPS kimliği beyandır** | `board.cjs claim --lane X` doğrulamasızdır (`lane: flags.lane \|\| 'lane'`); herkes `OPS` adını alabilir. | Çift OPS alarmı (§3); blok mesajlarında OPS örneği yok; sid listesi gibi güçlü doğrulama şimdilik yok (OPS kararı). |
| **Bash ile dolaylı yazma** | `Edit\|Write` eşleştiricisi Bash'i yakalamaz; Claude Code belgesi Bash'te yalnız tanınan dosya komutlarını (`cat`, `sed`, `tee` gibi, liste kapalı değil) ve yönlendirme hedeflerini denetlediğini, betiklerin ve dolaylı yazmaların yakalanmadığını, tam kilit için işletim sistemi sandbox'ının gerektiğini söyler. | Yeni kanca Bash komut metnindeki hedefi yakalar. `python -c` gibi yorumlayıcı gövdelerinde mevcut `bash-write-targets.cjs` yazma imzasını görürse hedefi çözemeyip **engeller** (her yola, OPS dahil, fail-closed); imzayı tutmayan yazma biçimleri (`Path.write_text` gibi) **geçer**. |
| **Sonradan yakalama YOK** | `bash-write-audit.cjs` yalnız çalışma ağaçlarının `git status`'ünü tarar; hafıza dizini bir ağaç değildir ve çalışma dizini kullanıcı ayar dizini altındaysa hiç çalışmaz. **Hiçbir mevcut kanca hafızaya betikle yazılanı görmez.** | Açık delik. İstenirse ayrı bir hafıza dizini taraması (dosya değişiklik zamanı ile `hafiza-yazma-olay.jsonl` karşılaştırması) sonraki iştir. |
| Bash kaza yolları | `cd <hafıza> && echo x > MEMORY.md` (hedef kancanın cwd'sine göre çözülür), ev dizini kısayolu, `$DEĞİŞKEN` ve MSYS `/c/...` yolları; `depoIcindeMi` yalnız `path.resolve(kök, hedef)` yapar, kısayol ve değişken genişletmez. | Kanca hedefleri §4 normalizasyonuyla çözer; çözülemeyeni engeller (fail-closed yalnız Bash yorumlayıcı gövdesi için, diğerleri izin + alarm). Kalan boşluk açık delik. |
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
`MEMORY.md`'yi tanıdığından kapsamı `departman/*/MEMORY.md`'ye genişletilir. Alt klasör `CLAUDE.md`'si yalnız o klasördeki bir dosya
okununca yüklendiği için departman talimatı için güvenilir bir yol değildir.

---

## §8 Deneme senaryoları (her "izin" satırının "engel" eşi vardır)

Kanca kurulunca işi yapmamış bağımsız bir ajan bu tabloyu koşar; sonuç REC-530'a yazılır. D1-D13 otomatik testtir (§10), D14-D15 elle
denemedir. "Şeritli URUN" = canlı claim'i `URUN` olan oturum.

| No | Senaryo | Beklenen |
|---|---|---|
| D1 | Şeridi OPS (`tam`) olan oturum `MEMORY.md`'ye yazar / şeridi `OPS-AUDIT` olan oturum aynı yola yazar | izin / **engel** (R1, önek tam değil) |
| D2 | Şeritli URUN `MEMORY.md`'ye yazar | **engel** (R1), mesajda `oneri/` yönlendirmesi ve OPS örneği yok |
| D3 | Şeritli URUN kendi `departman/URUN/`'ına / `departman/ALTYAPI/`'na yazar | izin / **engel** (R3) |
| D4 | Şeritli URUN `oneri/URUN-x.md` yazar / `oneri/ALTYAPI-x.md` yazar / şeritsiz pencere `oneri/URUN-x.md` yazar | izin / **engel** (R2) / **engel** |
| D5 | Şeritsiz pencere `oneri/_sahipsiz-<kendi-sid>-x.md` yazar / `oneri/_sahipsiz-<başka-sid>-x.md` yazar | izin / **engel** |
| D6 | Şeritsiz pencere `departman/URUN/` yazar | **engel** + `önce şerit al` komutu |
| D7 | Şeritsiz pencere `gunluk/_sahipsiz/<kendi-sid>.md` / `<başka-sid>.md` yazar (harf büyük/küçük, `..` ve uzantı denemesi dahil) | izin / **engel** (R5) |
| D8 | Şeritli URUN `gunluk/URUN/`'a / `gunluk/ALTYAPI/`'ya yazar; şeridi OPS olan oturum `gunluk/URUN/`'a yazar | izin / **engel** / **engel** (R4) |
| D9 | Alt ajan (`agent_id` var, ebeveyn URUN) `departman/URUN/`'a / `departman/ALTYAPI/`'ya / `gunluk/URUN/`'a yazar | izin / **engel** / izin; engel mesajı "raporunda döndür" der (dosya araçlarında ve Bash'te) |
| D10 | Süresi dolmuş claim'li pencere `gunluk/URUN/`'a yazar; aynı oturum iki farklı şerit adı almış (`ALTYAPI` sonra `ALTYAPI-NLM`) | **engel** (şeritsiz) / izin (öneke göre ALTYAPI) |
| D11 | Pano dizini yok / hiç olay dosyası yok / bozuk satır | izin + durum satırında `kural ölçülemedi: <sebep>`; olay dosyaları var ama bu sid yok → **engel** (şeritsiz) |
| D12 | `autoMemoryDirectory` başka dizine ayarlı: yeni dizinde `MEMORY.md`'ye şeritli URUN yazar / eski dizindeki `MEMORY.md`'ye yazar | **engel** (yeni dizin korunur) / izin (artık hafıza değil) |
| D13 | `MultiEdit` ve `NotebookEdit` (`.ipynb`, `notebook_path` yüküyle) ile D2'yi tekrarla; Bash yönlendirme (`> MEMORY.md`, `tee`, `cd <hafıza> && echo x >`, ev dizini kısayolu, MSYS yolu) ile aynı yol | **engel** (beş yol da aynı kural) |
| D14 | Claude'un kendi otomatik hafıza yazımı: şeritli URUN pencerede "bunu hatırla" isteği | denenecek; iki dal: kancadan geçer (`hafiza-yazma-olay.jsonl`'da kayıt var) → R1 engeli ve `oneri/` yönlendirmesi; geçmez (kayıt yok) → `autoMemoryEnabled: false` kararı OPS ve Recep'te |
| D15 | Bash: `python -c "open(p,'w')…"` / `Path(p).write_text(…)` ile hafızaya yazma | **engel** (yorumlayıcı imzası, çözülemeyen hedef) / **geçer** (açık delik, §6, hiçbir kanca görmez) |
| D16 | Worktree'de açılmış şeritli URUN `departman/URUN/`'a / `MEMORY.md`'ye yazar | izin (ana depo dizini adayı) / **engel** |
| D17 | Aynı anda iki canlı `tam` OPS claim'i: biri `MEMORY.md`'ye yazar | **engel** (ikisine de) + durum satırında çift OPS alarmı |
| D18 | R9: OPS `CLAUDE.md`'ye yazar / şeritli URUN yazar / HARİTA `harita_muafiyet_son` içinde / sonra yazar | izin / **engel** / izin / **engel** |
| D19 | R10: geçiş süresince HARİTA `gunluk/URUN/x.md` taşıması / `gecis_son` sonrası aynısı | izin / **engel** |

Ayırt edici olmayan kanca (her şeye izin veren ya da her şeyi engelleyen) her satırın izin/engel çiftinde düşer.

---

## §9 Günlük dosyalarının taşınması ve compact kapısı

Günlük/durum dosyaları bugün hafıza dizininin kökünde durur (`<rol>-lane-day-*.md`, `<rol>-lane-state-*.md`, `<rol>-state-*.md`,
`<rol>-serit-durumu.md`, `ops-cycle-audit-state.md`); 60'ı 2,1 MB'tır. `precompact-durum-kapisi.cjs` onları hafıza dizininin kökünde
`(lane-day|state|durum)` ad kalıbıyla arar ve özyinelemeli tarama yapmaz. Taşımak kapıyı kırar; bu yüzden **kapı değişikliği ve kanca
aynı PR'da** girer (ARAÇ): kapı önce `gunluk/<ROL>/`'a, bulamazsa geçiş süresince köke bakar (R6 ile aynı kalıp).
`gunluk/_sahipsiz/<session_id>.md` kapıda **"durum var" sayılır**, ama yalnız **uyarı düzeyinde**: şeritsiz pencerenin tek yazma yeri
orasıdır ve sayılmasaydı compact'ı hiç geçemezdi (`VENTHUB_PRECOMPACT_KAPALI=1` dışında). Taşıma dosya listesi OPS onayından sonra,
R10 ile yapılır.

---

## §10 ARAÇ'a devir sözleşmesi

| Kalem | Beklenen |
|---|---|
| Karar kütüphanesi | `.claude/hooks/lib/hafiza-yazma-kurali.cjs` (saf işlev; §2 K0/R1-R10, §3 sınıflar, §4 aday kümesi ve normalizasyon; girdiyi parametre alır, dosya sistemi ve pano kancada) |
| Kanca | `hafiza-yazma-bekcisi.cjs` (PreToolUse); dosya araçları ve Bash tek dosyada; alt ajan mesajı her iki yolda; alarm ve olay kaydı (§3, §5) |
| Ayar | `.claude/settings.json` eşleştirici `Edit\|Write\|MultiEdit\|NotebookEdit\|Bash`; ana ağaca ileri sarma |
| Yardımcılar | `seritRolu` (`pencere-adlari.cjs`, ARAÇ #1592 sonrası); ana depo dizini türetimi `belge-tazelik.cjs`'ten ortak işleve; `bash-write-targets.cjs` yeniden kullanılır |
| Test | `src/__tests__/conformance/` altında yeni kapı (öneri `INV-HAFIZA-YAZMA-1`): §8 D1-D13 ve D16-D19, her satır izin/engel çiftiyle; test enjeksiyonu §4; sabotaj: kuralı kaldır → kırmızı |
| Durum satırı | `UserPromptSubmit` satırı alarm dosyasını okur (§3) |
| Kapı | `precompact-durum-kapisi.cjs` yeni günlük yolu ve `_sahipsiz` uyarı sayımı (§9), AYNI PR |
| Bekçi | `hafiza-indeks-bekcisi.cjs` kapsamı `departman/*/MEMORY.md`; `SessionStart` enjeksiyonu üst sınırı (§7) |
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
- **Sandbox / yönetilen katman:** §6'daki kanca kapatma ve Bash delikleri için işletim sistemi düzeyi koruma ayrı karar.
- **Bash sonrası tarama:** hafıza dizini için ayrı sonradan tarama (§6) yapılıp yapılmayacağı.

---

## Değişiklik kaydı

- 2026-09-30 v0.1: ilk sürüm (REC-531); bağımsız okuyucu 28 bulgu buldu, kodlanamaz bulundu.
- 2026-09-30 v0.2: 28 bulgunun tamamı işlendi. Başlıcaları: şerit eşlemesi mevcut kodda yok (yeni kanca, ayrı karar kütüphanesi);
  `findConflict` hafıza yollarını işleyemez; `bash-write-guard` depo dışını görmez; `bash-write-audit` hafızayı hiç görmez (sonradan
  yakalama iddiası geri alındı); fail-open için "ölçülemedi ≠ şeritsiz" tablosu; OPS için yalnız tam eşleşme; yol normalizasyonu;
  öncelik sırası; R2 adlandırma; R9/R10 tarihli bayraklar; D1-D19 her kural için izin/engel çiftiyle.
