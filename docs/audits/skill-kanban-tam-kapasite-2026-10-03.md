# YTN-12 — Kanban'ı tam kapasite kullanmak (2026-10-03)

Emir: OPS (Recep 10-03: "kanban sistemini hâlâ eksik kullanıyoruz"). Üç soru: (a) "önce ara" yalnız mükerrer kartı mı arıyor, (b) skill'in
kullanmadığımız yetenekleri neyi kapatır, (c) yönetilen pano geçişi gerçek panoda ne maliyetle çalışıyor.
Yöntem: gerçek panolardan okuma (YETENEK, SEO, OPS, HARİTA; yazma yok), boyutlar harness'in bildirdiği karakter sayısı ya da saklanan
çıktıdan betikle sayıldı. "≈" gözle okunan değerdir. Kapsam: yalnız YETENEK panosunda yazma (kendi kartım).

## 0. Düzeltme: YETENEK panosu zaten yönetilen

Emirde "panolar yönetilen değil" yazıyor. YETENEK panosu için doğru değil: `board.lifecycle.adopted`, 2026-10-01 09:39, actor YETENEK
(YTN-6 pilotu, OPS kararı). Yönetilmeyen: OPS, HARİTA, SEO, ALTYAPI panoları (kartlarında `lifecycle` alanı yok). Yani (c) için
"geçişi deneme" değil, 46,5 saatlik **canlı pilotun** ölçümü yapılabildi; yeni bir pano açılmadı, `adopt`/`release` çağrılmadı.

## 1. (a) Önce ara — iki ayrı arama

| Soru | Araç | Ölçüm | Kör nokta |
|---|---|---|---|
| Bu iş için kart var mı (açık ya da Done) | `search_tasks` + `includeCompletedTasks` + `includeArchived` | "REC-300" 40 kart döndürdü, Done dahil (OPS 10-03) | Kanban 10-01'de başladı; öncesi yok |
| Bu iş daha önce **yapıldı** mı | `git log --all --grep`, `docs/plans`, `docs/audits`, hafıza (sage), Linear (donuk, yalnız okuma) | 441 adres listesi 09-23'te `docs/plans/rec300-model-adres-listesi-2026-09-23.csv` + `uret.py` olarak depoda; kartla bağlı değildi | Kart aramasında çıkmaz |

Hüküm: asıl kusur araç değil **çağrılmaması**; skill §B.1 yalnız birinciyi söylüyordu. Skill'e ikinci arama ve yazılacak biçim
(`ÖNCEKİ ÇALIŞMA:` satırı) eklendi. HARİTA aynı etiketi kart planı şablonuna HRT-26'da yazıyor; ARAÇ OPS-30'da iş başı komutunu kuruyor
(henüz yok: `scripts/board`, `scripts/hijyen` ve kancalarda aradım, bulunmadı); komut gelince skill'deki elle adımlar onunla değiştirilir.

## 2. (b) Kullanmadığımız yetenekler: hangisi hangi açığı kapatır

| Yetenek | Ne verir | Boyut (ölçüm) | Bizde hangi açığı kapatır | Hüküm |
|---|---|---|---|---|
| `queue_health` | Tek panoda hazır / bayat kiralama / bağımlılıkla bloklu / "aşama uyuşmuyor" teşhisi | ≈ 2 KB | Çöken çalışanın "running" kalan kartı (SEO-1 kiralaması 10-02 12:02'de bitti, 10-03 08:07'de hâlâ running); eksik alan teşhisi (REC-309 kartında `assignee` yok) | **Oturum açılışında bir kez** (`recover_stale` körlemesine çağrı yerine) |
| `workbench` | 12 panoyu tek çağrıda: şimdi / sıradaki / bloklu / **review** + uyarılar | ≈ 9 KB (`limit: 3`) | "Biten iş açık duruyor": review sütununda 3 kart bekliyor (HRT-24, SEO-12, HRT-19); 3 kritik bayat kiralama | **OPS'a** haftalık genel resim; departman penceresine gerekmez |
| `ready_tasks` | Başlatılabilir kartlar | ≈ 8 KB / 3 kart (her sonuçta tam açıklama) | "Sırada ne var" | Pahalı ve **tutarsız**: backlog kartlarını "ready" sayıyor, `queue_health` aynı kartlara `stage_blocked` diyor. `limit: 1` ile, sonucu `queue_health`le doğrula |
| `snapshot` | Pano özeti | **81,5 KB** (YETENEK, 15 kart); kapalı 9 kart 49 KB; `limit` kapalıları kırpmıyor | — | **Kullanma.** Done kartı biriktikçe büyür |
| `events` | Olay günlüğü | **47,9 KB** / 73 olay (`limit: 80`) | Kimin ne zaman ne yaptığı | Sayım için betikle ayrıştır, bağlama okuma; `limit` ≤ 10 |
| `board_history` | Pano düzeyi olaylar | ≈ 1 KB | `adopt`/`release` kim, ne zaman, neden: kapıyı kaldıran çağrı burada görünür | Ucuz; `release_managed_lifecycle` denetimi için |
| `verify_completion` | Kanıt komutunu koşar, rapor yazar | 12-15 KB (10-01 ölçümü) | Yönetilmeyen panoda "Done'dan önce kanıt" (yönetilende `mark_assignment` zaten koşturur) | Yönetilmeyen panoda zorunlu adım; yönetilende gerekmez |
| `dependsOn` / `add_dependency` | Kart sırası | denenmedi | HRT-26: "Sıra: #1663 birleştikten sonra" düz yazıda; araç bilmiyor, `queue_health` bloklu saymıyor | Sıra bağımlılığı kartta `dependsOn` ile yazılsın; **denenmedi**, ilk gerçek vakada ölçülür |
| `get_chain` | Zincir | `Chain not found` (zinciri olmayan kartta) | — | Zincir kurmuyoruz (`set_chain`); kullanılmaz |

Not: tek kartın `get_task`'ı ucuz (Done kartı ≈ 7 KB, kapanış raporu dahil); pano düzeyi okumalar (snapshot, events) şişiyor.

## 3. (c) Yönetilen pano: 46,5 saatlik canlı pilot (YETENEK, 10-01 09:39 → 10-03 08:10)

| Ölçü | Sonuç | Dayanak |
|---|---|---|
| Kart | 15; 9 Done, 3 sırada, 2 aşama-engelli (backlog), 1 eksik-alanlı | `queue_health` |
| Kapanış yolu | Yönetilen kipten sonra Done olan 5 kart (YTN-4, 7, 8, 9, 11): 5'i de `mark_assignment` ile **kendiliğinden**; `move_task` ile 0. Adopt'tan önce 4 kart `move_task` ile kapanmıştı | olay günlüğü (73 olay, betikle sayıldı) |
| Kırmızı kanıtı yakalama | **Vaka olmadı**: 5 kartın 5'inde kanıt ilk koşuda geçti. Kapının kırmızıyı tuttuğu YTN-4 deneme panosunda gösterilmişti, bu pilotta gerçek vakası yok | aynı |
| Ret (REFUSED / INVALID_INPUT) | Panoda kayıt tutulmuyor, sayı yalnız çağıranın sohbetinde. Bilinen: YTN-11 kapanışında 2 ret (kart `backlog`ta başlatılamadı; `review` için kayıtlı sonuç istendi), iki düzeltmeden sonra kapandı. Diğer kartlar **ölçülemedi** | oturum kaydı |
| Kart açma / kapama maliyeti | Yönetilmeyen: `add_task`, `add_check`, `start_task`, `verify_completion`, `move_task` = 5 çağrı. Yönetilen: `add_task`, `add_check`, `assign_task`, `transition_task(todo)`, `start_task`, `mark_assignment` = 6 çağrı. **+1 çağrı**, doğrulama araçtan gelir | skill §B ve YTN-11 kapanışı |
| Bayat kiralama | Pilot panosunda **0** bayat uyarı; tek `task.stale_recovered` olayı 10-01 09:50 (benim elle `recover_stale`im). Yönetilmeyen panolarda aynı anda 6 uyarı (görünen 3'ü kritik: SEO ×2, ALTYAPI ×1; SEO-1 20 saattir "running") | `workbench`, `queue_health` |
| Otomatik kurtarma | YTN-4 sorusu **hâlâ açık**: pilotta kiralamayı aşıp yarıda kalan kart olmadı (YTN-8 ilk-son olay arası 77 dk ama normal kapandı), yani kendiliğinden kurtarma ne tetiklendi ne sınandı | olay günlüğü |
| Kırılan / sürtünen akış | (1) `backlog` kart doğrudan başlatılamaz: önce `todo`, o da `assignee` + açıklama + kanıt ister. (2) `copy_task` ile havuzdan gelen REC-309 `assignee`siz, 2 gündür `todo`da `detail_incomplete`. (3) `update_task status=archived` kartı `done` sütununa taşıyıp `adopt`'ı kilitliyor (YTN-4). (4) `ready_tasks` ile `queue_health` aynı karta farklı hüküm veriyor. (5) 4 kart "rafta" backlog'ta; yönetilen kipte "başlatılabilir" sayılmaz | `queue_health`, kart geçmişleri |
| Yazma cevabı boyutu | YETENEK panosu 59 KB'a ulaştı (15 kart, 9'u kapalı, doğrulama raporlu); yazma çağrıları artık panoyu atlayıp ("Full board (59013 bytes) omitted") kart + sütun sayısı döndürüyor: `add_check`, `assign_task`, `transition_task` her biri ≈ 3 KB (kartın kendisi). Skill §D'deki "küçük panoda yazma tam pano döndürür" eşiği (10-01'de 3-4 kartlık panoda 7 KB) artık geçerli değil: pano büyüdükçe yazma ucuzluyor, okuma (`snapshot`, `events`) pahalanıyor | bu turda 3 yazma çağrısı |
| Bağlam maliyeti | Kapalı kart okuma ≈ 7 KB (rapor dahil); pano düzeyi okuma kapalı kart başına ≈ 5,5 KB (`snapshot` 49 KB / 9 kart). Yönetilen kip Done kartına doğrulama raporu eklediği için bu birikim yönetilmeyen panodan **fazla** | `snapshot` |

## 4. Hüküm (karar OPS'ta)

- **Yönetilen kip "Done = kanıt" kuralını gerçekten tutuyor**: 5/5 kapanış araçtan geçti, yönetilmeyen panolarda aynı sürede 3 kritik bayat kiralama birikti. Bedeli +1 çağrı ve kart başına açıklama + atama + kanıt.
- **Eksik kanıt**: (i) kırmızıyı yakalama vakası pilotta yok; (ii) otomatik kurtarma sınanmadı; (iii) ret sayısı panoda tutulmuyor. 8 Ekim raporu bunları "ölçülemedi" diye yazacak, uydurmayacak.
- **Yönetilen kip "biten iş açık kalıyor" sorununu tek başına çözmez**: kapı kanıtsız kapanışı engeller, kapatmayı unutmayı değil. Bunu `workbench` review sütunu gösterir (şu an 3 kart).
- **Önerim**: pilot 8 Ekim'e kadar sürsün (karar o gün); o güne kadar OPS her genel resimde `workbench` review + uyarı kısmına baksın; `snapshot` kullanılmasın; sıra bağımlılığı `dependsOn` ile yazılıp ilk vakada denensin. Geçiş sırası önerisi: tek sahipli küçük panolar (ARAÇ, HARİTA), sonra OPS havuzları; her panoda önce açık kartlara açıklama + atama + kanıt tamamlanır (OPS panosunda 55 açık kart: toplu iş). `release_managed_lifecycle` geri dönüşü kapıyı tamamen kaldırdığı için çağrılmaz.
