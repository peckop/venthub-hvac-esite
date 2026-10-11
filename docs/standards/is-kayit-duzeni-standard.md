# İş-Kayıt Düzeni Standardı

> **Durum:** v2 · 2026-10-01 · Sahip: OPS (v2 metnini HARİTA yazdı, OPS onaylar; plan: `docs/plans/kanban-gecis-plani-2026-10-01.md`)
> **Kaynak:** Recep'in 08-26 ilkeleri + ORION çürütmesi (`C:/tmp/orion-kayit-duzeni-curutme.md`, 7 bölüm)
> + REC-53 triyaj ölçümleri (`docs/audits/registry-triyaj-2026-08-26.md`).
> **v2 (karar 219, Recep 2026-10-01, aynen):** *"bugünden itibaren kanban wrongstack tam kapasite kullanıma
> geçiriliyor her yerdeki kuralları değiştir. şayet beğenirsek linear devre dışı"*. Canlı iş kaydının tek kaynağı
> **Kanban**'dır; **Linear DONUKTUR** (yeni iş kaydı açılmaz, mevcut kayıtlar silinmez/arşivlenmez, okunabilir).
> Deneme **1 hafta (2026-10-08)** sürdü ve **kesinleşti (karar 324, Recep 2026-10-08)**: Linear iş kaydı olarak
> **EMEKLİDİR**; yalnız Design yorum kanalı ve eski kayıt arşivi olarak kalır, hiçbir şey silinmez. Aşağıda "Linear"
> tarihçe ya da arşiv anlamındadır; canlı kural "Kanban"dır.
> **Niçin var:** 2026-08-26'da "açık" görünen 120 kaydın 54'ü ZATEN YAPILMIŞTI, 19'u
> tanımlanamayacak kadar kötü açılmıştı, 5 kimlik çakışıyordu. Sistem geçmişini bilmiyordu;
> aynı iş yeniden öne sürülebiliyordu. Bu cetvel o sınıfı kapatır.

## 1. Katman haritası — hangi soru nereye

| Katman | Rolü | SSOT olduğu alan |
|---|---|---|
| **Kanban** (WrongStack panoları) | Canlı işlerin tek listesi; açılış ve kapanış burada. Ortak "Bekleyenler" panosu + departman başına pano | **Açık/süren iş** — çelişkide Kanban kazanır |
| **Linear** (DONUK, karar 219) | Okunur arşiv: 2026-10-01'e kadar açılan REC-nn kayıtları, Kararlar belgeleri (REC-554'te dosyaya geçer) | **Geçmiş iş ve eski karar** — yeni iş kaydı AÇILMAZ, mevcut kayıt silinmez/arşivlenmez |
| **orion registry** | Donmuş arşiv defteri (görev takibinden 08-26'da emekli) | **Tarihçe** — "bu iş geçmişte var mıydı/ne oldu" sorusunda registry kazanır |
| **git / PR** | Kanıt | Kodun ve kapanış kanıtının kendisi |
| **Pano (C:/tmp/venthub-board)** | Ajanlar arası anlık telsiz; TTL'li | Hiçbir şeyin SSOT'u DEĞİL — iş kaydı tutulamaz |
| **NLM ikizi** | Doğal dilde aranabilir hafıza | "Niçin/hangi karar/hangi desen" soruları |

Katı kurallar (ORION §5, ampirik sınırlarla):
- **Sayım/enümerasyon/"şu an" sorusu ikize SORULMAZ** (RAG eksik liste verir, snapshot bayattır).
  Kapanış kararı asla ikizden doğrulanmaz.
- **Registry gerekçe METNİ tutmaz, gerekçeye İŞARET tutar** (PR/dosya referansı). Kopyalanan
  anlatı bayatlar; işaret bayatlamaz.
- Beşinci bir katman EKLENMEZ (Notion/Jira/ayrı dashboard/ayrı cron servisi — 08-26 araştırma
  raporu: mevcut dört katman + GitHub Actions cron'ları yeterli; yeni katman SSOT'u böler).

**ORION §4'ten sapma, gerekçesiyle (tarihçe, 08-26):** ORION "registry SSOT, Linear ayna" önerdi. Sapıldı
çünkü Recep 08-26'da registry'yi görev takibinden emekli etti; 10-01'den beri canlı iş Kanban'da yaşar
(karar 219), registry'nin otoritesi kapanmış tarihçeyle sınırlıdır. Alan ayrımı yazıldığı için "hangisi doğru"
belirsizliği (ORION'un asıl endişesi) doğmaz.

**Numara biçimi (karar 220 ve ön ekin kısaltılması, Recep 2026-10-01):** `<KISA AD>-<sayı>`; kısa ad departmanın
**sessiz harflerinden** oluşur (Recep: "kod isimleri sessiz harflerden oluşsun, daha kısa olur"). Sayaç pano başına
işler. Numara kartın doğduğu departmanda kalır, devredilince DEĞİŞMEZ. Linear'dan taşınan kart `REC-nn` numarasını
korur. **Kısa ad tablosu yalnız bu belgededir; diğer belgeler bu tabloya atıf yapar, ön eki kopyalamaz:**

| Departman | Kısa ad | Örnek |
|---|---|---|
| OPS | `OPS` | `OPS-4` |
| HARITA | `HRT` | `HRT-2` |
| ARAC | `ARC` | `ARC-5` |
| YETENEK | `YTN` | `YTN-1` |
| URUN | `URN` | `URN-1` |
| ALTYAPI | `ALT` | `ALT-1` |
| ADMIN | `ADM` | `ADM-1` |
| KATALOG | `KTL` | `KTL-1` |
| SEO (GEO-SEO dahil) | `SEO` | `SEO-1` |
| BLOG | `BLG` | `BLG-1` |
| EDGE | `EDG` | `EDG-1` |
| I18N | `DIL` | `DIL-1` |
| MARKA | `MRK` | `MRK-1` |
| MEVZUAT | `MVZ` | `MVZ-1` |
| SATIS | `STS` | `STS-1` |
| TASARIM | `TSR` | `TSR-1` |
| TAKIP (karar 322) | `TKP` | `TKP-1` |

OPS ve SEO zaten üç harf olduğu için aynı kalır; I18N harf-rakam karışık olduğu için `DIL` alır (biçim: 2-4 büyük harf).
Tabloda olmayan departman ilk kartını açmadan önce
OPS'tan kısa ad alır ve OPS bu tabloya satır ekler; kısa ad elle uydurulmaz.

**Design istisnası (karar 219, KALICI: karar 324, 2026-10-08):** "Linear emekli" yalnız İŞ KAYDI içindir.
Claude Design Kanban'a yazamaz (`olcum/erisim-envanteri.md`); karar yorumları Linear PROJE yorumlarında açık kalır
ve sayaç kancası ile `ops-iletisim-protokolu.md` yerinde durur. Design için ayrı bir yol (kartta dosya ya da panoya
yorum) kurulursa bu madde o zaman yeniden yazılır.

## 2. Kart AÇMA şablonu (Kanban)

Zorunlu dört alan — dördü de açılış anında **dürüstçe** doldurulabilir olanlardır
(ORION §2: açılışta zorunlu kanıt alanı uydurma üretir — `required-field-pressures-fabrication`):

1. **Ne** — iş tanımı.
2. **Niçin** — değer cümlesi (satan platforma / SaaS hedefine / ekip verimine katkı).
3. **Kabul ölçütü** — "bittiğini nereden anlayacağız." Kapanışı ölçülebilir kılan asıl alan.
4. **Eleme kaydı** — mükerrer adayları ve eleme gerekçeleri (§3).

`Kanıt-Referans` açılışta ZORUNLU DEĞİL (varsa yazılır); **kapanışta zorunludur** (§4).

Kimlik: kart başlığı numarayla başlar (`HRT-2 · başlık`; numara biçimi ve kısa ad tablosu §1). Linear'dan taşınan kart `REC-nn`
numarasını korur. Taşınan eski registry kayıtları eski kimliği (`Txxx-VH` vb.) gövdede taşır.
Kart gövdesinde KAYNAK/CETVEL bloğu zorunludur (CLAUDE.md kural 1): yöneten cetvel dosya adları, ölçüm tazeliği;
cetvel yoksa açıkça "cetvel yok — yazımı bu işin kapsamında" yazılır. Emirde `YÖNTEM:` satırı bulunur.

## 3. Mükerrer önleme — aramanın EYLEMİ değil SONUCU

"Arandı, yok" satırı BEYANDIR ve beyan 08-26'da iki kez düştü (ORION §1). Kural:

- Kart açan (insan ya da ajan) açmadan önce dört yüzeyde arar: **triyaj/audit belgeleri +
  registry + Kanban panoları + Linear (donuk arşiv, salt okuma)**. Ama karta yazılan şey "aradım" değil, **aday listesi + eleme**dir:
  en yakın adaylar ve her birinin tek-cümle eleme gerekçesi "Eleme kaydı" alanına girer.
- Aday yoksa "aday çıkmadı (aranan kelimeler: ...)" yazılır — aranan kelimeler yazılır ki
  yanlış-kelime hatası sonradan teşhis edilebilsin.
- Bu kapı **BLOKLAMAZ** (aday listesi kesin değildir; bloklayan mükerrer-kapısı ilk
  yanlış-kırmızıda atlatılır — T033). Ölçülen şey atlatma oranıdır: elenen bir adayın
  sonradan mükerrer çıkması arama iyileştirme sinyalidir.
- **Kapı adayı (v2):** kayıt açma komutunun aramayı kendisinin koşup adayları ekrana
  basması (araç arar, insan eler). v1'de disiplin + eleme kaydı; v2'de araç.

## 4. Kayıt KAPAMA kuralları

- **Kanıt-Referans zorunlu:** dosya yolu / commit / PR / ölçüm satırı olmadan "bitti" yazılamaz.
- **Kapanış sebebi kapalı sözlükten** (ORION §3 — serbest metin sayılamaz, sayılamayan
  alan üzerinde kapı kurulamaz):
  `yapildi` · `gereksiz-mukerrer` · `gereksiz-kapsam-disi` · `vazgecildi` ·
  `belirsiz-insana-soruldu` · `kurtarilamaz-kayit`
  Son ikisi meşru hükümlerdir: "anlamadık" canlı işle aynı görünürse bir sonraki triyajda
  yine vekil ölçü (tarih!) icat edilir — REC-53 vetosunun kökü buydu.
- Kapanan iş bir sonraki işi doğuruyorsa (T063 örneği: mekanizma bitti, kanal Recep'te),
  **önce ardıl kayıt açılır, sonra eski kayıt ona işaret ederek kapanır** (ORION §6).
- **Kart yaşam döngüsü (karar 219; karar 187'nin Kanban karşılığı, Recep 2026-10-01).** Kanban'da otomatik
  kapanış YOKTUR: kart **kanıtla, elle** Done'a çekilir (§6.1: tek komut, çıkış koduyla konuşur).
  - Her PR gövdesinin İLK satırı `Kanban: <numara>` olur (`Kanban: HRT-2`; taşınan kart için `Kanban: REC-538`); numara aşağıda gömülü kalırsa
    `node scripts/belge/kart-plan-kapisi.cjs --pr-govde-dosyasi <govde.md>` kırmızı verir (HRT-46; yerelde koşar, CI'da değil).
    Kapı bu satırı kabul eder (ARAÇ, PR 0).
  - **Geçiş penceresi KAPANDI (2026-10-08, karar 324):** kapı yalnız `Kanban:` satırını kabul eder; eski kalıplar
    `Fixes REC-nn` ve `Kayıtsız: <sebep>` ertesi günden beri KIRMIZI verir (`scripts/board/pr-kayit-kapisi.cjs`,
    `ESKI_YOL_SON_GUN`). Kartsız iş yoktur: önce kart açılır.
  - Birden fazla PR'lık iş, her biri tek PR'la biten **alt kartlara** bölünür (karar 187 ilkesi korunur); her PR kendi
    alt kartını taşır, çatı karta doğrudan bağlanmaz. Çatı REC-nn kaydına `Fixes`/`Closes`/`Resolves`
    yazılmaz (Linear'ın GitHub bağı o kaydı birleşmede kapatır; 2026-09-29'da REC-433 çatısı bu riske girdi, birleşmeden önce
    yakalandı).
  - **Çatı kartı alt kart almaz, bağlantılı kart alır.** Çatı = program, plan, kalıcı defter, kapsamı zamanla büyüyen
    iş (REC-425 talimat defteri, REC-345 bağımlılık programı, REC-206 katalog hattı, REC-433 tek plan, REC-400 belge
    kök çözümü). Alt kart yalnız kapsamı baştan bilinen, parçaları bitince iş gerçekten bitmiş sayılacak işlerde
    kullanılır (karar 187, OPS 2026-09-29).
  - **Çok aşamalı işte bütün alt kartlar İŞ BAŞINDA açılır;** kalan iş görünür kalsın diye. (Linear vakası
    2026-09-30: REC-531 kapanınca üstü REC-530 ve onun üstü REC-516 kalan iş varken kendiliğinden Done oldu.
    Kanban'da bu zincir yok; ama tek alt kartı bitti diye çatıyı "bitti" saymak aynı yanılgıdır.)
  - Backlog'da dokunulmayan kart kendiliğinden kapanmaz (Kanban'da bu otomasyon yok): 14 günden bayat kart
    "bakılmadı" listesine düşer (`work-tracking-ssot-standard.md` §8 madde 7); iptal yalnız Recep sözüyle.
  - İstisna yalnız PR gövdesinde açık bir `Kayıtsız: <sebep>` satırıyla; sebepsiz istisna yoktur.
  - Kapı ARAÇ'ta: PR 0 `Kanban:` kabulü + geçiş, PR 2 sadeleştirme (`docs/plans/kanban-gecis-plani-2026-10-01.md`).
  - Niçin (tarihçe): 2026-09-29 ölçümü, son 60 birleşmenin 0'ı `Fixes` taşıyordu; kayıtlar elle kapanmadığı için
    Linear 275 kayda çıktı ve ücretsiz sınırı doldurdu. Kanban'da aynı sınıf yeni bir risk doğurur: kanıtsız Done (§6.1).

## 5. Arşiv ve silme

- **Silme YOK.** Kayıt statüyle kapanır, gövdesi ve tarihi arşivde kalır
  (Recep 08-26: "arşiv olmazsa geçmişimizi kaybediyoruz").
- Registry'ye yazma yalnız CLI/engine yolundan (elle SQL yasak).
- ~~Linear free tavanı (250 arşivlenmemiş kayıt) için periyodik arşivleme rutini OPS'ta.~~ **Kalktı (karar 219):**
  Linear'a yeni iş kaydı girmediği için tavan işlemez; donuk arşivde arşivleme ve silme yapılmaz.
- **[TARİHÇE, karar 219 sonrası bu rutin işlemez; geri alma yolu geçerli kalır]** Tavanı biten işler değil AÇIK kayıtlar doldurur; bekleyen eski iş panoya taşınır (karar 215, Recep
  2026-10-01).** Ölçüm 2026-10-01: arşivsiz 264 kaydın 210'u backlog/todo, yalnız 13'ü bitmişti; bitmişleri
  arşivlemek tavanı açmadı.
  - Ölçüt: durumu Backlog ya da Todo, 14 gündür dokunulmamış, süren bir üst ya da alt kaydı yok.
  - Yol: önce tam içerik yedeği (açıklama + yorumlar), sonra WrongStack kanban panosunda
    ("Linear Bekleyenler (taşınan, karar 215)") REC numarasıyla başlayan kart, en son Linear'da arşiv.
    Kart sayısı ölçülmeden arşive geçilmez.
  - Taşınmaz, Linear'da kalır: Design'ın sürekli açık soru kayıtları, lansman engelleri, sır rotasyonu
    gibi güvenlik kalemleri, Recep'in kararını ya da kapısını bekleyen kayıtlar.
  - Geri alma: Linear'da arşivden çıkarılır (kayıt silinmez), panodaki kart kapatılır. İşin sırası gelince
    bunu OPS yapar; şerit numarayı yazması yeter.
  - Bu, aşağıdaki zaman-vekilli ölçü yasağına **açık istisnadır**: kayıt kapatılmaz ya da iptal edilmez,
    yalnız görünür olduğu yer değişir.
  - İlk koşum 2026-10-01: 100 kayıt taşındı, 9 kayıt bilerek bırakıldı, arşivsiz toplam 264 → 164.
- Toplu kapanış koşumları: önce yedek + kuru koşum + log; "tarihsizlik = ölülük" gibi
  **zaman-vekilli ölçüler YASAK** — bayatlık değişimle ölçülür.

## 6. Şerit reaktivasyon ritüeli

Duraklatılmış bir şerit yeniden açılırken:
1. Dal master'a rebase edilir (yaş ≠ bayatlık; çelişki varsa değişimden ölçülür).
2. İşin Kanban kartı yoksa §2 şablonuyla açılır; varsa durum güncellenir.
3. Triyaj/audit belgelerinde işin geçmişi kontrol edilir (yapılmış kısmı tekrar yapılmaz).
4. Şerit, her PR'ında kendi (alt) kartını `Kanban: <numara>` ile bağlar (karar 219, §4); kartsız iş
   yalnız `Kayıtsız: <sebep>` satırıyla.

**Recep talimat defteri (REC-425) ve ölçüm ekleri:** Recep'in talimatı OPS panosundaki REC-425 kartına not olarak yazılır
(Linear'a yazılmaz). Bir ölçümün "kayda ek" olarak anıldığı yerde ek, ilgili Kanban kartına bağlantı/not olarak girer;
dosyanın kendisi depoda ya da `docs/olcum/` altında durur; public depoya girmemesi gereken veri (sorgu listesi, rakip adı,
ham cevap) depo DIŞINDA kalır ve karta yalnız dosya yolu yazılır.

**Taşınan kartların sütunu (2026-10-01):** Linear'da "sürüyor" görünen kayıtlar `linear-suruyor` etiketiyle To Do'ya
kondu; departman gerçekten üzerinde çalıştığını In Progress'e kendisi alır (sütunun iş sınırı 5).

## 6.1 Kanban tam kullanım (pilot: karar 46, 2026-09-18; tam kullanım: karar 219, 2026-10-01)

**Kapsam (karar 219):** her iş için Kanban'da kart açılır; tüm iş takibi Kanban'dadır, Linear iş kaydı olarak emeklidir (karar 324). Panolar:
ortak "Bekleyenler" panosu + departman başına bir pano. 1 haftalık deneme 2026-10-08'de kesinleşti; pilotun ölçülmüş
tuzakları ve kart kanıt kuralları aşağıda aynen geçerlidir (pilot sırasında Linear yanında koşuyordu; artık yerine geçti).

**Kart biçimi:** başlığın ilk satırı kart numarasıyla başlar (§1: `<KISA AD>-<sayı>`; Linear'dan taşınan kartta
`REC-nn`; numara pano sayacından alınır, uydurulmaz).
Kartın **Done**'a geçmesi için kanıt zorunludur: `gh pr checks <PR>` çıktısı ya da eşdeğeri.
"Bitti", "tamam", "çalışıyor" gibi tek kelimelik özet **reddedilir** (aracın kendi belirsizlik
süzgeci de bunları eliyor — ölçüldü).

**Teslim notu (OPS 2026-10-09, HRT-44):** Done'a geçen her kartta, geçiş gününde yazılmış en az bir dolu not bulunur
(yazar `system` olmayan, en az 10 harf ya da rakam içeren; nokta, boşluk, emoji not değildir). Not teslimin yerini söyler: dosya yolu
ya da PR numarası + iki satır özet; `→`, `KANIT:`, `#<PR no>` ya da commit kısaltması "kanıt izi" sayılır. Ölçü:
`node scripts/board/kart-not-sayimi.cjs` (şerit başına "Done(bugün) N, notsuz M: <no [kısa kimlik]>"; notsuz varsa çıkış 1; eşik **0**;
`--kanit-zorunlu` ile kanıtsız not da eksik sayılır; ölçülemeyen hal çıkış 2, "temiz" sayılmaz).
"Bugün Done oldu" Done'a geçiş anıdır: `completedAt`, yoksa Kanban olay kaydındaki son Done taşıması (`doneAt`; Done kolonundaki arşivli
kartlarda `completedAt` boştur), ikisi de yoksa `sonAnlamli` ve satır "yaklaşık" diye işaretlenir. `sonAnlamli` ilk tercih DEĞİLDİR: eski
karta bugün düşülen not onu bugüne taşır. Betik yalnız Done kolonundaki kartı sayar; hiç Done'a çekilmemiş teslim (kart Backlog'da
kalmış, PR birleşmiş) bu ölçüye girmez; onu `node scripts/board/teslim-kart-koprusu.cjs` ölçer (bugün origin/master'a giren her PR'ın
numarası (`#N`, `PR N` ya da `.../pull/N`; komşu numara anmak sayılmaz: `#17`, `#1786`'yı karşılamaz) ya da tek başına duran en az 7
karakterlik commit kısaltması o gün yazılmış bir kart notunda geçmeli; departman başına "Teslim N, kart notunda geçmeyen M: #PR (kart)";
eşik **0**; ölçülemeyen hal çıkış 2). Dependabot birleştirmeleri (başlığı `chore(deps…):`, `chore(ci…):` ya da `chore(tools…):`;
önekler `.github/dependabot.yml`'deki `commit-message.prefix` değerleridir, test ikisini eşit tutar) teslim sayılmaz: ayrı
"Bot PR" satırında görünür, çıkış kodunu etkilemez (OPS 10-10). İkisi birlikte koşulur; notsuz bulunan teslim sahibine yazılır, OPS'a özet gider.

**Ölçülmüş tuzaklar ve karşılıkları:**

| Tuzak | Ölçüm | Karşılık |
|---|---|---|
| `sync_task_graph` ile içe aktarılan pano **yönetilen değildir** (OPS ölçümü 2026-10-01) | Done kanıtsız geçer | Kart `add_task` ile panoda **doğrudan** açılır; `sync_task_graph`/dışarıdan aktarma ile açılmaz |
| Kanban'ın **insan arayüzü yok** (OPS ölçümü 2026-10-01) | Recep panoyu kendisi göremez; kart durumu yalnız araç çıktısında | Recep'in gözü **ARC-5 sayfasıdır**; Recep'e giden durum tablosu (`recep.md`) kartlardan okunur |
| Doğrulayıcının izin listesi **çok dar** | varsayılan `["pwd","true","false","test"]` | `WRONGSTACK_KANBAN_VERIFIER_COMMANDS=+gh` (yalnız `gh`; `+` ekler, yasak listesi her hâlde üstün) |
| Silme yüzeyi | `--destructive` silme/birleştirme/devretme açar | Pilotta **kapalı**; kayıt yalnız gerekçeyle küçülür |
| Alt süreç `process.env` **kalıtır** | sırlar çocuk sürece geçer | Doğrulayıcı komutları `gh` ile sınırlı; `curl/wget/npm/node` **yasak listesinde**. Yine de bu bir **azaltma**, sıfırlama değil — kart açıklamasına sır yazılmaz |
| Proje kimliği **sürücü harfine duyarlı** | `c:\…` → `7e017f`, `C:\…` → `1088d5` | Pano küçük harfli kökle açılır ve kimlik **ölçülür** |

**Mesaj kutusu (mailbox) pilotun parçası DEĞİL — ölçüm bekliyor:** paket kurulu, ama kayıt
yapılmadı. Sebep: sunucu zorunlu `--actor <id>` istiyor ve `.mcp.json` üç pencerenin paylaştığı
tek dosyadır; sabit bir actor yazılırsa üç pencere aynı kimlikle konuşur ve mesajlar yanlış
pencereye düşer. Kayıt, kimlik ölçümünden sonra ayrı adımdır (`INV-WRONGSTACK-MCP-1` bu
"kayıtlı DEĞİL" hükmünü kolla tutar).

**⭐KART KANIT KOMUTU — TEK KOMUT, BORU YOK (2026-09-21, ölçüldü):** doğrulayıcının güvenlik
kapısı `|` `&&` `||` `;` `>` `<` `` ` `` `$()` içeren komutu **hiç koşmaz**: *"Command contains shell
operators … which are not permitted in the verifier."* Hüküm `needs_human`a düşer ve kart
kapanmaz. İlk gerçek atamada (kart `2e5fb1ce`, OPS'un yazdığı `gh pr view … | grep -qx MERGED`)
tam bu oldu. Kural:
1. Kanıt komutu **tek komuttur**; boru, yönlendirme, zincir yok.
2. Komut **çıkış koduyla** konuşur — çıktının metnine bakan bir `grep` gerekiyorsa komut yanlış
   seçilmiştir.
3. Yazmadan önce **bir olumlu bir olumsuz** örnekte ayırt ediciliği ölçülür.

Standart kalıp — "PR birleşti mi": `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`
(GitHub 204 → çıkış 0; 404 → çıkış 1). Ölçüldü: birleşmiş #1276'da 0, açık #1270'te 1.

**Bedel (2026-09-21, ölçüldü):** her yazma çağrısı panonun **tamamını** geri döndürüyor —
`start_task` 13.171 bayt, `update_check` 13.706, `verify_completion` 18.992 ve 18.048 bayt;
tek kart kapatmak ~64 KB bağlam. Tek `get_task` ~4 KB. Bu, pano değerlendirmesinin en ağır
eksisidir. Toplu giriş MCP aracıyla tek tek DEĞİL, sunucuya stdio üzerinden `add_task` gönderen bir betikle yapılır
(OPS 2026-10-01: 154 kart, hata 0, pencere bağlamına yük binmedi); `create_from_graph`/`sync_task_graph` toplu girişte
KULLANILMAZ (yukarıdaki tuzak: yönetilmeyen pano, kanıtsız Done).

**Denemenin ölçütü (2026-10-08'de değerlendirildi; sonuç karar 324: Linear iş kaydı olarak emekli):** dört ölçü karşılaştırıldı — (a) kart açılmadan kalan iş
sayısı, (b) Done'a kanıtsız geçme denemesi sayısı, (c) Linear'a sızan yeni iş kaydı sayısı (donukluk ihlali), (d) Recep panodan durumu kendi gözüyle görebildi mi (ARC-5 sayfası).
Deneme "iyi hissettirdi" diye sürdürülmez; sayılar OPS'tan Recep'e tek tabloyla gider.

---

## 7. Bu cetvelin kendi kapıları (uygulama sırası)

| Kapı | Soru | Durum |
|---|---|---|
| Ayna-parite | Taşınan her açık registry kaydının Linear kimliği var mı? | ORION kuyruğunda |
| NULL-id | Registry'de id'si boş kayıt var mı? (kök: PK NOT NULL garantisi vermiyor — ORION §7) | ORION kuyruğunda (şema onarımıyla) |
| Sözlük | Kapanış sebebi sözlük dışı mı? | Sözlük sütunuyla birlikte |
