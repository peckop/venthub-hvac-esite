---
name: wrongstack-kanban
description: "Kanban'da kart açma, havuzdan iş alma, kanıt komutuyla Done ve pano maliyet kuralları; iş takibinin tek kaynağı Kanban, Linear donuk (karar 219). Tetik: kart aç, kanban, Done, iş durumu, bu iş daha önce yapıldı mı, önceki çalışma. WrongStack 1.0.26 uyarlaması."
category: coordination
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/wrongstack-kanban/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "ARAÇ 2026-09-28 (karar 165 W3) araç eşlemesi + ek kurallar; YETENEK 2026-10-01 (YTN-1, karar 219 ve 220) tam kullanım kipi: günlük akış, ölçülmüş tuzaklar, maliyet kuralı, Haiku kuralı; YETENEK 2026-10-03 (YTN-12) önce-ara iki arama + kullanılmayan okuma yetenekleri. Kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/wrongstack-kanban/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `kanban` aracı | MCP `mcp__wrongstack-kanban__kanban_read` / `kanban_manage` / `kanban_watch` |
| Managed board / lease-fenced dispatch | **YETENEK panosu 10-01 09:39'dan beri yönetilen** (YTN-6 pilotu: kapanış `mark_assignment` ile, kapı araçta; ölçüm `docs/audits/skill-kanban-tam-kapasite-2026-10-03.md`). Diğer panolar yönetilmeyen (unmanaged); aşağıdaki "yönetilmeyen" anlatımı onlar içindir: `start_task` cevabı "This board is not in managed lifecycle mode" der (10-01 ölçüldü). Kaynak gövdedeki "managed" zorunlulukları (tek aşama kuralı, lease koruması) burada bağlanmaz; ARAÇ'ın 09-28 ölçümü: `transition_task` reddedilir, `move_task` kullanılır |
| Dönüş boyutu | Her yazma panonun tamamını döndürür; bu bir **pano boyutu** işidir (aşağıda "Maliyet kuralı"). Yama diskte uygulanmıştır ama etkisi 3 kartlık panoda görünmedi (10-01) |
| Linear | **Donuk** (karar 219): yeni kayıt açılmaz, mevcut kayıt silinmez ya da arşivlenmez. Kaynak gövdede ve eski kurallarda "Linear" geçen yerler artık "Kanban" okunur |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kimlik** yalnız `tools/wrongstack-mcp/posta-kutusu.cjs` sarmalayıcısından gelir. `.mcp.json`'a `--actor` ya da `${...}` yer tutucusu yazılmaz (genişlemiyor, bütün pencereler aynı kimliğe düşüyor).
2. **Posta alıcısı** daima TAM oturum kimliğidir (36 karakter). 8 haneli kısa kimliğe giden mesaj hata vermeden kaybolur.
3. `--admin` ve `--destructive` bayrakları KAPALI kalır; kaynak metindeki örnek yapılandırmalar bizde uygulanmaz.
4. Kutuya ve karta **sır** (anahtar, parola, token) ve **Recep onayı** yazılmaz. Onay yalnız Recep'in kendi penceresinde verilir. Tek ayrı yol (karar 224): canlı DIŞI işte OPS, Recep'in OPS'ta verdiği evetin sözünü ve saatini OPS panosundaki onay kartına yazar; onayı orada doğrularsın. Canlı iş (migration'lı PR, sır/anahtar/parola, geçmişi silen git, canlı veritabanı yazımı, para harcatan her şey) bunun dışındadır: onay yine yalnız Recep'ten gelir.
5. `*_watch` çağrısı kanıt değildir; durum `mailbox_read` / `kanban_read` ile okunarak doğrulanır.
6. **Kanban iş emrinin ve iş durumunun tek kaynağıdır** (karar 219, Recep 2026-10-01); Linear donuktur. Deneme 1 hafta (10-08); beğenilirse Linear devre dışı kalır, beğenilmezse bu madde geri alınır. Çelişkide Kanban kazanır.
7. "Bitti" doğrulayıcı komutu `gh` ile sınırlıdır ve sır içermez.
8. Kanban yaması `cli.js` + `index.js` dosyalarında (`tools/wrongstack-mcp/yamalar/`). Sürüm yükselince yamanın hâlâ tuttuğu yeniden ölçülür.
9. `mailbox-bridge` kullanılmaz (HTTP köprüsü; bizde kapalı).
10. Ops'a rapor dört alanlı etiketle gider (NE · DURUM · KANIT · KİMDE). Kaynak metindeki `<nextsteps>` biçimi bunun ekidir, yerine geçmez.
11. **İzin bilgisi** (kim neye yetki verdi) pencere mesajından hafızaya ya da durum dosyasına KOPYALANMAZ. Tek kaynak `~/.claude/settings.json`; en fazla "bkz. settings.json autoMode, <tarih>" yazılır.
12. **Pencereler arası mesaj ≤800 karakter.** Mesaj yalnız ADRES (dosya/Kanban numarası) + hüküm + istek taşır; ayrıntı dosyada ya da Kanban kartındadır. Recep'e giden metin bu sınırın DIŞINDADIR (tam cümle kuralı).

---

## Tam kullanım kipi (karar 219 ve 220; bu bölüm kaynak gövdeden ÖNCE okunur, çelişirse kazanır)

### A. Numara ve panolar

- **Numara:** `<ÖNEK>-<sayı>`; önekler OPS, SEO, ARC, HRT, YTN, URN, ALT, ADM, KTL (sessiz harf, Recep kararı 220 ve sonrası). Sayaç pano başına, numara kartın doğduğu departmanda kalır, devredilince DEĞİŞMEZ. Linear'dan taşınan kart `REC-nn` numarasını korur. **Yeni numarayı betik gelene kadar OPS verir; uydurulmaz.**
- **Başlık** numarayla başlar: `YTN-3 · ...`. Numarasız kart açılmaz.
- **Panolar:** ortak havuz `Linear Bekleyenler (taşınan, karar 215)` (sahibi OPS) ve departman başına `VentHub <DEPARTMAN>`. Pano kimliğini sabit yazma; `kanban_read list_boards` ile oku.
- **PR gövdesi** `Kanban: <numara>` satırı taşır. PR kayıt kapısı çift yollu olana kadar (ARAC-2) `Kayıtsız: <sebep>, Part of REC-nn` satırı da yazılır; kapı yalnız `Kanban:` satırına bakmaz.

### B. Günlük akış

1. **Önce ara: iki ayrı arama, ikisinin de SONUCU yazılır.** Aramanın EYLEMİ değil SONUCU yazılır: "x kart / y dosya buldum, mükerrer yok / var".
   - **(a) Kart var mı:** `kanban_read search_tasks` + `includeCompletedTasks: true` + `includeArchived: true` (biten kartlar da aranır; "REC-300" 40 kart döndürdü, Done dahil, 10-03 ölçüldü). Sorgu iş adı ve numarayla, `limit` küçük (maliyet kuralı D).
   - **(b) İş daha önce YAPILDI mı:** Kanban 10-01'de başladı, öncesi ve kart dışı üretim kart aramasında çıkmaz. Ayrıca koş: `git log --all --grep=<anahtar>`, `docs/plans` ve `docs/audits` altında ad ve içerik taraması, sage hafıza araması, Linear (donuk; 10-01 öncesi işler için yalnız okunur). Vaka (10-03, OPS-30): 441 model adres listesi 09-23'te `docs/plans/rec300-model-adres-listesi-2026-09-23.csv` + `uret.py` olarak depoda vardı; OPS ve URUN aynı gün sıfırdan üretmeye başladı. Kusur araçta değil, aramanın çağrılmamasındaydı.
   - **Yazılacak biçim:** kartın planında ya da ilk notunda `ÖNCEKİ ÇALIŞMA:` satırı = aranan yerler + bulunan dosya/commit/kart ya da "yok" + kullanılan arama ifadesi. Aranan yerler ve ifade olmayan "yok" geçersizdir. Etiketi HARİTA kart planı şablonuna HRT-26'da yazıyor; aynı ifade kullanılır.
   - **Otomatik komut:** ARAÇ OPS-30'da iş başı tek komutu kuruyor (git log + docs + Kanban Done + sage); kurulunca adı buraya yazılır ve elle adımların yerini alır. O zamana kadar (a) ve (b) elle koşulur.
2. **Havuzdan iş alma** (10-01 ölçüldü, REC-309 kartında). Sırası gelen kart `Linear Bekleyenler` havuzundadır; karar OPS'tadır.
   - ⛔**`move_task` + `targetBoardId` panolar arası TAŞIMAZ:** `targetBoardId` yok sayıldı, kart yalnız havuzun kendi sütununda yer değiştirdi (`ok: true` döndü, yanıltıcı). `transfer` eylemi `--destructive` kapısının arkasında kapalıdır.
   - **Doğru yol `copy_task`:** `boardId` = havuz, `taskId` = kart, `targetBoardId` = kendi panon, `targetColumnId: todo`, `preserveOriginTaskIds: true`, `inheritLabels: true`. Yeni kart yeni kimlik alır, `origin` (REC-nn, Linear kimliği) korunur.
   - **Sonra havuzdaki aslını arşivle** (`update_task`, `status: archived`, `note` = yeni kartın kimliği); yoksa aynı iş iki panoda yaşar. Havuz OPS'undur: çekiş ve arşiv notu OPS'a bildirilir.
   - Havuz 159 kartlık olduğundan yazma cevabı tam pano yerine **özet** döner (aşağıda D).
3. **Kartı aç** (`add_task`). Zorunlu alanlar:
   - `title`: numarayla başlar.
   - `description`: **KAYNAK/CETVEL bloğu** (yöneten cetvel dosya adı ya da açıkça "cetvel yok, yazımı bu işin kapsamında") + **`YÖNTEM:` satırı** (şerit / alt ajan / Workflow / elle) + iş ne, neden şimdi.
   - `assignee`: işi yapan departman adı.
   - **Kanıt komutu** (`add_check`, `checkType: command`, `checkNotes` = komut). Kanıtsız kart açılmaz; kanıt komutu açma anında yazılır.
4. **Başla** (`start_task`): `boardId`, `taskId`, `author`, `transitionComment` dördü de zorunlu (10-01 ölçüldü: biri eksikse `INVALID_INPUT`). Cevap bir kiralama (lease) kimliği ve 15 dakikalık bitiş saati (`leaseExpiresAt`) döndürür; bu yönetilmeyen panoda yönetişime bağlı değildir. **Süre dolunca KART DEĞİŞMEZ** (10-01 ölçüldü: YTN-1 bitişten 6 dakika sonra hâlâ `running`, `attempt 1`, kimse almadı, otomatik kurtarma yok). Bu yüzden kiralama süresi "iş sahipliği" kanıtı sayılmaz; sahiplik kartın `assignee` alanı ve notlarıdır. `heartbeat_assignment` çağrısının bu panoda bir etkisi olduğu iddia edilmez.
5. **İlerlerken kanıt biriktir:** `add_note` (düz not), `record_activity` (`activityKind`: decision / attempt / result / blocker / observation), `add_link` (`linkType: pr`, PR adresi). "Bir şey yaptım" sohbette kalmaz, karta yazılır.
6. **Bitir** (YTN-2 kartında 10-01 ölçüldü, iki adım):
   1. `verify_completion` kanıt komutunu gerçekten koşturur; `verdict: passed`, `exitCode`, süre kartın `verificationReport` alanına yazılır (ilk koşuda 886 ms, 12.227 karakter döndü).
   2. `move_task` ile `targetColumnId: done`. **`transition_task` bu panolarda `REFUSED` verir** ("Strict Kanban Agent transitions require a managed board"); denemeye gerek yok.
   - ⛔**`move_task` ile Done'da KAPI YOKTUR (DENEME kartı, 10-01 ölçüldü):** (a) kartta hiç kanıt komutu yokken `move_task` Done'a taşıdı, `status: completed`; (b) kartta koşmamış (`pending`) bir kanıt komutu varken de kart Done'da kaldı; (c) `verify_completion` `PASSED` verdikten sonra bile `transition_task` aynı hatayı verdi (`[REFUSED] Strict Kanban Agent transitions require a managed board`, `managed-policy-invalid`, alan `lifecycle.mode`): sebep karttaki kanıt değil, panonun yönetilen olmamasıdır. Yani bu panolarda kanıt kuralı **araç değil disiplin** işidir.
   - **Sıra bağlayıcıdır: önce `verify_completion`, rapor `passed` değilse `move_task` ile Done'a TAŞIMA.** Kanıtsız ya da `needs_human` kartı Done'a çeken kişi kuralı çiğnemiş olur, araç engellemez. "bitti, tamam, çalışıyor" gibi tek kelimelik özet kanıt değildir. Kapanışta PR numarası ve birleşme kanıtı kartın notunda kalır.
   - Gerçek kapı için araçta `adopt_managed_lifecycle` eylemi var; sonucu YTN-4 (atılabilir pano) ve YTN-6/YTN-12 (YETENEK panosu, canlı pilot) ölçtü; geçiş kararı OPS'undur. Yönetilmeyen panoda Done kapısı disiplindir.
7. **Hata dalları** (kural 14): panoya yazma başarısız olursa söyle ve işe devam et (pano işi izler, iş panoyu beklemez); kanıt komutu kırmızıysa kart Done'a GİTMEZ, `record_activity` ile `blocker` yazılır; doğrulayıcı komutu `needs_human` verirse komutun bu kuralları ihlal edip etmediğine bak (aşağıda C).

### C. Ölçülmüş tuzaklar (kaynak: `docs/standards/is-kayit-duzeni-standard.md` §6.1; her satır sahada ölçüldü)

| Tuzak | Ölçüm | Karşılık |
|---|---|---|
| Pano **yönetilen değildir** (içe aktarılan de, doğrudan açılan da; 10-01 ölçüldü) | `move_task` Done'a kanıtsız ve koşmamış kanıt komutuyla da geçirir; `transition_task` her durumda `REFUSED` | Kapı disiplindir: önce `verify_completion` `passed`, sonra `move_task`. Kart panoda doğrudan açılır, dışarıdan aktarılmaz |
| Doğrulayıcı izin listesi **çok dar** | varsayılan `["pwd","true","false","test"]` | `.mcp.json` env: `WRONGSTACK_KANBAN_VERIFIER_COMMANDS=+gh` (yalnız `gh`; yasak listesi her hâlde üstün). `curl/wget/npm/node` yasak |
| **Tek komut, boru yok** | `\|` `&&` `\|\|` `;` `>` `<` `` ` `` `$()` içeren komut **hiç koşmaz**, hüküm `needs_human`a düşer, kart kapanmaz | Komut çıkış koduyla konuşur; çıktı metnine bakan `grep` gerekiyorsa komut yanlış seçilmiştir. Yazmadan önce bir olumlu bir olumsuz örnekte ayırt ediciliği ölç |
| **Sürücü harfi** duyarlı proje kimliği | `c:\…` ≠ `C:\…` iki ayrı kimlik verir | Pano küçük harfli kökle açılır; kimlik ölçülür |
| Silme yüzeyi | `--destructive` silme/birleştirme/devretme açar | Kapalı kalır; kayıt yalnız gerekçeyle küçülür |
| Alt süreç `process.env` kalıtır | sırlar çocuk sürece geçer | Kart açıklamasına ve kanıt komutuna sır yazılmaz |
| **Yönetilen pano** (`adopt_managed_lifecycle`; atılabilir panoda ölçüldü, rapor `docs/audits/skill-yonetilen-pano-deneyi-2026-10-01.md`) | Kapıyı **araç** zorlar: kanıtsız `move_task` `REFUSED`; `mark_assignment(completed)` kanıtı kendisi koşturur, geçerse Done'a OTOMATİK alır, kırmızıysa kart Review'da bekler ve elle Done da reddedilir | Kart: açıklama + `add_check` + `start_task` (kiralama) + `mark_assignment`. Kırmızı kanıtı "geçti"ye çevirmek ya da kanıtı silmek **yasak** (araç da bunu yazar). Gerçek panoya geçiş kararı OPS'undur |
| **`release_managed_lifecycle` kapıyı tamamen kaldırır** | Geri dönüşten sonra kırmızı kanıtlı kart `move_task` ile Done'a geçti | Gerçek panoda **çağrılmaz** |
| **Kiralama kendiliğinden temizlenmez** (yönetilmeyen pano; yönetilen panoda otomatik kurtarma **ölçülmedi**, pilotta ölçülür) | Süre dolunca kart "running" kalır (2 dk sonra hâlâ); `recover_stale` elle çağrılınca To Do'ya döner, deneme sayısı 1→2 (üst sınır 3) | Çöken çalışanın kartını oturum açılışında `recover_stale` ile kurtar; kendiliğinden toparlanacağını varsayma |
| **Yanlış aşamadaki kart panonun yeniden adopt'unu kilitler** | `update_task status=archived` kartı `done` sütununa taşır; aşaması `todo` kalan kart `adopt_managed_lifecycle`'ı `stage-mismatch` ile REFUSED yaptırdı (10-01) | Deneme panosu tek kullanımlıktır; adopt'tan önce kartların aşaması ile sütunu eşleşmeli |
| **`file_exists` kanıtı proje dışı yolu görmedi** | `C:/tmp/…` ve `C:\tmp\…` ikisinde de "dosya yok" (dosya vardı) | Kanıtı repo içi yola ya da `gh api` kalıbına bağla; sebep ölçülmedi |
| **`verify_completion` zaman aşımı** | 10-01'de iki kez `domainCall timed out`; ikinci denemede koştu | Tekrar güvenli (okuma/çalıştırma); önce `get_task` ile kartın durumuna bak |

**"PR birleşti mi" kanıt kalıbı:** `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge` (GitHub 204 → çıkış 0; 404 → çıkış 1). Birleşmiş PR'da 0, açık PR'da 1 ölçüldü.

### D. Maliyet kuralı

- **Her yazma çağrısı panonun tamamını geri döndürür.** 09-21 ölçümü: bir yazma 13-19 KB, bir kartı kapatmak ~64 KB bağlam. 10-01'de 3-4 kartlık `YETENEK` panosunda `add_check` ve `start_task` ~7 KB, `verify_completion` 12 KB, kartı Done'a `move_task` ile taşımak ~9 KB döndürdü (kart başına `successCriteria` ve `verificationReport` büyüdükçe artar). Küçük panoda maliyet kart sayısı ve kart başına kanıt/rapor büyüdükçe artar. **Büyük panoda (159 kartlık havuz, 183 KB) yazma cevabı tam pano yerine sütun sayıları ve kartın kendisini döndürür** ("Full board … omitted"; 10-01 ölçüldü); asıl pahalı olan küçük panolardır ve `verify_completion` (12-15 KB). **10-03 güncellemesi:** YETENEK panosu 59 KB'a çıkınca yazma cevabı da panoyu atladı (`add_check`, `assign_task`, `transition_task` ≈ 3 KB, kartın kendisi); yani eşik pano boyutuyla kayıyor, pahalı kalan okumalardır (D2).
- **Okuma:** tek kart için `get_task` ucuzdur (~1-4 KB). **`search_tasks` ucuz DEĞİLDİR:** havuzda "skill" aramasında 7 sonuç 20 KB döndürdü (her sonuç `board` + `task` taşır). Aramayı dar sorguyla yap, sonuç sayısını `limit` ile sınırla; tam pano için `get_board` kullanma.
- **Toplu giriş tek çağrıyla:** çok kart açılacaksa `sync_task_graph` (ya da `create_from_graph`) bir kez çağrılır; kart başına `add_task` döngüsü kurulmaz.
- **Toplu yazım alt ajana verilmez:** alt ajan da her yazmada panoyu geri alır ve bağlamı kendi penceresinde yakar. Yazmayı çağıran pencere yapar.

### D2. Kullanılmayan okuma yetenekleri (ölçüldü, YTN-12; tam tablo `docs/audits/skill-kanban-tam-kapasite-2026-10-03.md`)

- **`queue_health`** (≈ 2 KB): oturum açılışında bir kez; bayat kiralama ve eksik alanı (assignee yok, aşama uyuşmuyor) gösterir. `recover_stale`i körlemesine çağırmak yerine önce bunu oku.
- **`workbench`** (≈ 9 KB, `limit: 3`): 12 panonun şimdi/sıradaki/bloklu/**review** + uyarı resmi; genel resim OPS'un işidir, departman penceresi çağırmaz. Review sütunu "bitti ama kapanmadı" kartların listesidir.
- **Kullanma:** `snapshot` (81 KB, `limit` kapalı kartları kırpmıyor), `events` (73 olay 48 KB; `limit` ≤ 10), `get_chain` (zincir kurmuyoruz). `ready_tasks` pahalı ve backlog kartlarını "hazır" sayıyor; `limit: 1` ve sonucu `queue_health`le doğrula.
- **`dependsOn`:** kartın başka işe sırası düz yazıda ("X birleşince") bırakılmaz, `add_dependency` ile yazılır; **denenmedi**, ilk vakada ölçülür.

### E. Haiku işçi

Haiku 200K bağlamında proje skill'lerinin çoğu açıklamasız (yalnız adıyla) listelenir; yönlendirme onu seçemez. Bu yüzden Haiku işçiye kartla ilgili bir iş verirken **skill adı görev metninde açıkça yazılır:** "wrongstack-kanban skill'ini kullan; kartı `<numara>`, kanıt komutu `<komut>`". İşçi kartı yalnız OKUR (`get_task`); açma, başlatma, Done yazımı işçiye verilmez, müdür yapar (§10.4 ve D maddesi). Skill `SKILL_ATAMASI` cetvelinde **her departman müdürünün çekirdeğindedir**, çalışan setlerinde değil (gerekçe: setler belgesi §6 "Müdür çekirdeği").

---


# WrongStack Kanban

## What the board is for

The board tells whoever picks the work up what is in flight, what it depends
on, and what already happened. **It is a record, not a checkpoint.** Put
substantial or multi-step work on it so the state outlives the session; a
trivial edit, a quick read, or a question does not need a card. Resume the
existing card for the same request instead of creating a duplicate.

**The board follows the work; the work does not wait on the board.** If Kanban
persistence fails, say so and keep working — do not stall.

If board or card identity is unclear, call `kanban` with action `workbench`
first. Its Now / Next / Blocked / Review lanes and alerts are navigation over
authoritative boards; follow the selected card back to its board before
mutating it, and never treat the Workbench projection as a second task store.

## Proportional hierarchy

- A genuinely atomic request is **one childless leaf card**. It does not need
  invented children.
- Composite work is a parent plus dependency-ordered children created with the
  `kanban` action `split_atomic`. Only a parent marked `atomic: true` needs
  `childTaskIds`.
- Scale card count to the size of the work. Never let card bookkeeping become
  the task.

## Card detail

What a managed board actually enforces before a card leaves Backlog:

| Field | Required | Why |
|-------|----------|-----|
| `description` | **Yes** | A title alone is not actionable scope |
| `assignee` (or `assignedAgent` / assignment identity) | **Yes** | Work without an owner is untracked |
| `successCriteria` | **Yes** | Acceptance criteria define "done" before work starts |
| `childTaskIds` | Only when `atomic: true` | A composite parent must name its children; a leaf stays childless |

`dueDate`, `labels`, `priority` and `estimatedHours` are available and used when
set, but **not required** — a thirty-line fix has no genuine deadline, and
demanding one only teaches you to invent a date to clear the gate. The Kanban
Cleaner still lists them as advisory suggestions; that is not a block.

Fill what is genuinely known. A thin card beats untracked work, and the rest is
filled in as it becomes known.

## Anti-fake-progress rules

1. **Never claim a task is done in chat without a board mutation.** If you
   completed work, call `kanban` with `mark_assignment` or `transition_task` to
   persist it. A chat-only completion claim is fake progress.
2. **Never mark a task completed without verification.** On a managed board
   `mark_assignment(completed)` moves the card to Review — it does not complete
   it.
3. **Never skip lifecycle stages.** Managed cards move exactly one stage at a
   time. The guard rejects jumps.
4. **Never report work as in progress without a board assignment.** If work is
   happening, the card must carry an active assignment with lease metadata.
5. **Never shrink tracked scope by omission.** Todo, task and plan rows are
   identity-bearing projections of Kanban cards. Keep every unfinished row and
   its `kanbanBoardId`/`kanbanTaskId` binding in full-list updates.

## Dispatch contract

1. **Dispatch is deterministic.** Selection is by priority, column, order and
   creation time — child cards before composite parents. Do not try to
   influence it by shuffling tasks or boards.
2. **Claim before working.** Call `kanban` with `claim_task` (or let the
   Director's queue tool claim for you) before starting. Working an unclaimed
   card means another agent may be working it too.
3. **Heartbeat or lose the lease.** Call `kanban` with `heartbeat_assignment`
   before the lease expires. Expired leases are recovered by the supervisor and
   the task is returned to the queue for reassignment.
4. **Fence your writes.** Pass `expectedLeaseId` on every `mark_assignment` and
   `heartbeat_assignment`. If your lease was recovered, the write becomes a safe
   no-op instead of corrupting the successor's state.

## Completion contract

1. **"Done" means verified.** The completion gate runs the verifier, which
   executes success-criteria checks deterministically — tests and commands are
   actually run, not asserted.
2. **Chat evidence is not board evidence.** Saying "tests pass" verifies
   nothing. The verifier runs the real command and records the result.
3. **File scope is checked.** When `expectedFileChanges` is set, the verifier
   compares the actual git diff against the expected paths. Unexpected changes
   fail the scope check.
4. **Acceptance depends on board policy.** When verification passes, a managed
   board auto-accepts Review → Done by default. A board that sets
   `lifecycle.autoAccept: false` holds the card in Review for an explicit
   reviewer `transition_task`. Either way, a failing or absent verdict never
   reaches Done on its own.

## Every material action produces a board mutation

| Action | Required mutation |
|--------|-------------------|
| Start work | `mark_assignment(running)` — a managed card advances to Running with it |
| Complete work | `mark_assignment(completed)` — a managed card advances to Review |
| Fail work | `mark_assignment(failed)` with `error` |
| Split scope | `split_task` or `split_atomic` |
| Add evidence | `add_note` or `add_link` |
| Change plan | `update_task` or `add_dependency` |
| Tick a criterion | `update_check` with `checkStatus: "passed"` (read ids from `get_task`) |

## Prohibited patterns

| Anti-pattern | Why |
|--------------|-----|
| Creating title-only cards on a managed board | Rejected at creation; no description means no actionable scope |
| Reporting done without board evidence | Fake progress; the board is the shared record |
| Randomizing task selection | Dispatch is deterministic by design |
| Working without a lease | Untracked, and may collide with another agent |
| Omitting unfinished Todo/task/plan rows | Requirement identity and coverage would be lost |
| Inventing subtasks for a leaf card | Recursive decomposition to satisfy process, not the work |

## Out of scope

- **Don't create a card for trivial work.** A quick read, a one-line fix, or a question does not need a card. Resume the existing card for the same request instead of creating a duplicate.
- **Don't claim a task is done in chat without a board mutation.** Chat-only completion is fake progress. Persist via `kanban` actions; the board is the shared record.
- **Don't skip lifecycle stages on a managed board.** Managed cards move exactly one stage at a time. The guard rejects jumps; trying to bypass it is a bug.
- **Don't work an unclaimed card.** Another agent may be working it. Take `claim_task` first (via `kanban`), or let the Director's queue claim for you.
- **Don't lose the lease.** Heartbeat before the lease expires. An expired lease is recovered by the supervisor and the card returns to the queue.
- **Don't fence-less write.** Pass `expectedLeaseId` on every `mark_assignment` and `heartbeat_assignment`. If your lease was recovered, an unfenced write corrupts the successor's state.
- **Don't invent children for a leaf card.** Atomic work is one childless leaf. Recursive decomposition to satisfy process is process for process's sake.
- **Don't try to influence dispatch order.** Selection is deterministic by priority, column, order, and creation time. Shuffling tasks or boards doesn't change it.
- **Don't block on Kanban persistence.** If a board write fails, say so and keep working. The board follows the work; the work does not wait on the board.

## Before returning

- [ ] Substantial work has a card with `description`, `assignee`, and `successCriteria` set
- [ ] Card claimed via `claim_task` (or Director queue) before any work started
- [ ] Lease heartbeated within the lease window
- [ ] Every material action produced a board mutation (no chat-only claims of progress)
- [ ] `mark_assignment` and `heartbeat_assignment` carried `expectedLeaseId`
- [ ] Completion went through the verifier; "Done" means the verifier actually ran
- [ ] Todo/task/plan rows preserve `kanbanBoardId` / `kanbanTaskId` bindings in full-list updates
- [ ] Card count scaled to the size of the work; no invented subtasks

## Related skills

- `sdd` — spec-driven development creates boards from task graphs
- `bug-hunter` — findings can be tracked as cards
- `multi-agent` — parallel dispatch through the Director's queue tool

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
