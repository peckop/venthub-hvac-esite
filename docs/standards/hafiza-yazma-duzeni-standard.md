# Hafıza ve Talimat Yazma Düzeni Standardı (REC-530)

> **Ne yönetir:** kalıcı hafızaya (hafıza dizini, `MEMORY.md`, ortak dersler) ve talimat dosyalarına
> (`CLAUDE.md`, rol kartları) **kim, hangi yola yazabilir**; pencerelerin günlük/durum dosyalarının yeri;
> bu kuralların kancayla nasıl zorlandığı ve zorlanamadığı.
> **Niçin var:** 2026-09-30, 599 dosyalı hafıza dizininde son 24 saatte en az sekiz ayrı pencere yazmıştı ve
> mevcut tek koruma yalnız indeksin kırpılmasını engelliyordu (`hafiza-kancalari-standard.md`, REC-280).
> Kim yazabilir, ne yazılır, aynı bilgi ikinci kez yazıldı mı, hiçbiri denetlenmiyordu. Dizinin %42'si (2,1 MB) pencere
> günlükleriydi ve indeksle aynı yerde duruyordu. Recep: "herkes kafasına göre mi her istediği dosyaya yazacak?"
> **Sahibi:** HARİTA (düzeni kurar, testle teslim eder; kancaları ARAÇ kurar, ortak çekirdeğin içeriğini OPS onaylar).
> **Kayıt:** REC-530 (çatı), REC-531 (bu cetvel). Model Recep'in onayıyla 2026-09-30 (OPS iletti); teknik kararlar OPS.
> **Son doğrulama:** 2026-09-30 (Claude Code belge sayfaları iki araştırmacı ve işi yapmamış bağımsız bir doğrulayıcıyla
> okundu; `lane-guard.cjs` ve `bash-write-guard.cjs` kodu okundu). Kanca kuralları henüz KURULU DEĞİL (§10).

---

## §1 Katman modeli

| Katman | Ne girer | Yer (hafıza dizinine göre) | Kim yazar | Kim okur |
|---|---|---|---|---|
| **1 Ortak çekirdek** | Şirket geneli sözleşme, Recep'in genel tercihleri, ortak dersler, indeks | `MEMORY.md` ve kökteki ortak ders dosyaları; repoda `CLAUDE.md`, `.claude/CLAUDE.md` | yalnız OPS onaylı yazar (§2) | herkes, oturum açılışında |
| **1b Öneri kutusu** | "Bunu ortak hafızaya ya da kurala ekleyin" talebi: ne, neden, hangi departman, kanıt | `oneri/<ROL>-<tarih>-<konu>.md` | her pencere | OPS kabul ya da reddeder, kabul edileni çekirdeğe kendisi yazar |
| **2 Departman hafızası** | O departmanın kalıcı dersleri, karar gerekçeleri, ölçüm sonuçları | `departman/<ROL>/` (kendi `MEMORY.md`'si ve konu dosyaları) | yalnız o departmanın penceresi (ve OPS) | yalnız o departman; açılışta kendi indeksi rol kartıyla birlikte gelir |
| **3 Günlük / durum** | Compact sonrası kaldığı yer: dört sabit alan | `gunluk/<ROL>/` (ana indeksten ayrı, indekse girmez) | yalnız pencerenin kendisi | aynı pencere, compact kapısı |
| **4 Konu tetiklemeli dersler** | Bir konu açılınca gelen kısa dersler | sage ve konu yönlendirici (REC-448, ARAÇ #1590) | mekanizma | konu algılanınca |
| **5 Arşiv** | Ölü, birleştirilmiş, eski kayıt | `arsiv/` | OPS (geçişte HARİTA) | hiçbir pencere otomatik okumaz |

`<ROL>` değerleri `docs/roller/` kartlarındaki adlardır: OPS, ARAC, ALTYAPI, HARITA, URUN, ADMIN, KATALOG, GEO-SEO,
BLOG, MARKA, MEVZUAT, SATIS, TASARIM, EDGE, I18N, YETENEK (ASCII, büyük harf).

**Cetvellerin içeriği** sahibi departmanda kalır (`docs/roller/cetvel-sahipligi.md`); bu cetvel yalnız hafıza ve talimat
katmanlarını yönetir. **Pencerenin kendi durum dosyası** her zaman pencerenin kendisi tarafından yazılır (§2, R6).

---

## §2 Yol → izinli oturum (kural tablosu)

"Şerit" = `session_id`'nin pano kaydındaki canlı claim'inin şerit adı (§3). Alt ajan ebeveyninin `session_id`'siyle koşar
(ölçüldü) ve aynı şeridin yetkisini taşır.

| No | Yol (hafıza dizini altında) | Yazabilir | Not |
|---|---|---|---|
| R1 | `MEMORY.md`, kökteki `*.md` ortak ders dosyaları, `olcum/**` | şeridi OPS olan oturum | departman yazamaz, R2'ye öneri bırakır |
| R2 | `oneri/**` | her oturum (şeritli ya da şeritsiz) | tek serbest ortak yol |
| R3 | `departman/<ROL>/**` | şeridi `<ROL>` olan oturum; şeridi OPS olan oturum | başka departman yazamaz |
| R4 | `gunluk/<ROL>/**` | şeridi `<ROL>` olan oturum | OPS dahil başkası yazmaz, okur |
| R5 | `gunluk/_sahipsiz/<sid>.md` | yalnız o `session_id`'nin oturumu (yol kendi kimliğini taşımalı) | şeridi olmayan pencerenin tek yazma yeri |
| R6 | pencerenin kendi durum dosyası (geçiş süresince kökteki `<rol>-lane-day-*.md`, `<rol>-serit-durumu.md`) | o şeridin oturumu | geçiş bitince R4'e taşınır ve bu satır kalkar |
| R7 | `arsiv/**` | şeridi OPS olan oturum; geçiş süresince HARİTA | |
| R8 | tablo dışı her yol | şeridi OPS olan oturum | sınıflandırılmamış yeni yol açılmaz |
| R9 | repoda talimat dosyaları: `CLAUDE.md`, `.claude/CLAUDE.md`, `AGENTS.md`, `docs/roller/**` | şeridi OPS ya da HARİTA olan oturum | HARİTA süreli: işini bitirip kapanınca yalnız OPS (OPS kararı bekliyor, §11) |

Kural şeridi olmayan pencereyi **hiçbir hafıza yoluna** yazdırmaz; yalnız R2 ve R5.

---

## §3 Oturum kimliği ve şerit

- Kancaya her çağrıda `session_id` gelir; şerit adı pano API'sinden canlı claim'e bakılarak bulunur
  (`scripts/board/board.cjs`; `lane-guard.cjs` ve `bash-write-guard.cjs` aynı eşlemeyi bugün kullanır).
- **OPS kimliği** "pano claim'i OPS olan oturum"dur; `session_id` kancaya sabit yazılmaz (oturum yenilenince
  değişir).
- **Alt ajan** kancaya ebeveyninin `session_id`'siyle ve `agent_id` alanıyla gelir; aynı şeridin yetkisiyle yazar.
  Engelde mesaj alt ajana "dosyanın tam içeriğini raporunda döndür, ebeveynin yazsın" der.
- **Şeridi olmayan pencere** (claim yok ya da süresi dolmuş) R2 ve R5 dışında yazamaz. Her engellemede kanca şunu
  gösterir: `önce şerit al: node scripts/board/board.cjs claim --sid <sid> --lane <ad> --globs "<yol>"`.

### Hata durumu: FAIL-OPEN + görünür alarm (OPS kararı 2026-09-30)

Pano okunamazsa, stdin bozuksa ya da hafıza yolu türetilemezse kanca **izin verir** (mevcut iki kancayla aynı bilinçli
sapma: bu bir koordinasyon kapısıdır; fail-closed pano bozulunca herkesin günlüğünü durdurur). Sessiz değildir: kanca bir
alarm kaydı bırakır ve **her mesajın durum satırına** şu düşer: `HAFIZA YAZMA: kural ölçülemedi: <sebep>`. Yalnız
günlüğe yazmak yetmez; Recep ve pencereler durum satırında görür.

---

## §4 Hafıza dizininin türetilmesi (sabit yol YOK)

Hafıza dizini kancaya gömülmez. Depo genel olduğundan kullanıcı adı taşıyan yol yazılmaz. Kanca "hafıza yolu" adaylarını
çalışma anında türetir ve hedef yol **adaylardan herhangi birinin altındaysa** hafıza yolu sayar:

1. **Ayar:** `autoMemoryDirectory` (kullanıcı, proje, yerel ya da politika ayarlarından herhangi birinde tanımlıysa).
   Bu makinede bugün tanımlı değildir; başka bir katmandan tanımlanırsa dizin taşınır ve sabit yollu kanca sessizce
   delinirdi (belgede ayarın her ayar katmanından okunduğu yazıyor).
2. **Transcript dizini:** `transcript_path`'in bulunduğu proje dizinindeki `memory/` (varsa).
3. **Ana depo dizini:** worktree'de açılan oturumların kendi proje dizinlerinde `memory/` yoktur; hafıza ana deponun
   dizini altındadır (`precompact-durum-kapisi.cjs`, 2026-08-28 ölçümü). Ana depo yolu `git`'in ortak dizininden
   türetilir. Ortam değişkeni `CLAUDE_CODE_PROJECT_DIR_NAME` proje adını değiştirebilir; o da hesaba katılır.

Aday bulunamazsa §3'teki fail-open ve alarm işler. Deneme tablosunda (§8) ayarı değiştirilmiş bir senaryo bulunur.

---

## §5 Eşleştirici ve engelleme

- **Araçlar:** `Edit`, `Write`, `MultiEdit`, `NotebookEdit` (hepsi listelenir: belgeye göre eşleştirici tam adla
  eşleşir, `Edit|Write` diğer ikisini tutmaz; `NotebookEdit`'te yol alanı `notebook_path`, diğerlerinde `file_path`) ve
  `Bash` (mevcut `bash-write-guard.cjs`).
- **Engelleme:** çıkış kodu 2, sebep stderr'e yazılır ve modele döner. Mesaj: hangi kural (R numarası), izinli
  yol, şerit alma komutu (§3) ve "ortak çekirdek için `oneri/` altına talep bırak" yönlendirmesi.
- **Yeni kanca yazılmaz.** Kural, `session_id` → şerit eşlemesini zaten yapan `lane-guard.cjs` ve `bash-write-guard.cjs`
  dosyalarına eklenir (Recep/OPS onayı: kanca değişikliği OPS kapısıdır).
- **`permissions.deny` bu iş için yetmez:** deny kuralları oturuma göre ayırt etmez, OPS'u serbest bırakamaz. Doğru
  anahtar `Edit(yol)`'dur; `Write`, `MultiEdit`, `NotebookEdit` ile yazılan yol kuralı kabul edilir ama hiç sorgulanmaz.

---

## §6 Sınırlar: tam kilit DEĞİL (sebep belge, OPS kararı)

Bu düzen **kalite ağıdır, güvenlik sınırı değildir.** Bilinen delikler:

| Delik | Sebep (belge) | Karşılık |
|---|---|---|
| Bash ile dolaylı yazma | `Edit\|Write` eşleştiricisi Bash'i yakalamaz; permissions kuralları yalnız tanınan dosya komutlarını (`cat`, `sed`, `tee` gibi) ve yönlendirme hedeflerini görür; Python/Node betiği, `bash -c`, `/bin/rm` geçer. Belge tam kilit için işletim sistemi sandbox'ını önerir. | `bash-write-guard.cjs` komut metnindeki hedefi yakalar; kalanını `bash-write-audit.cjs` **sonradan** alarmla yakalar. Sandbox bu modelin dışındadır. |
| Kancayı kapatma | `disableAllHooks` ve `allowManagedHooksOnly` anahtarları var; kullanıcı ayarındaki kanca başka ayar dosyasından kapatılabilir. | Yönetilen katmana (yönetici hakkıyla) koymak ayrı karardır, bu modelin dışında. |
| Claude'un kendi otomatik hafıza yazımı | Standart `Edit`/`Write` araçlarıyla yapılır; iç yolun kural denetimini atlayıp atlamadığı belgede **yazmıyor**. | **Denenecek** (§8, D14). Kancadan geçmezse `autoMemoryEnabled: false` kararını OPS ve Recep verir. |
| Kanca yolu ölçülemezse | §3 fail-open | Durum satırı alarmı |

Bu tabloya "tamam, kilitlendi" yazılmaz; her satır ya denenmiş ya da açık deliktir.

---

## §7 Okuma

Claude Code `MEMORY.md`'nin ilk 200 satırını ya da 25 KB'ını (hangisi önce) her oturum başında yükler; konu
dosyalarını istek üzerine okur. Bu yüzden ortak çekirdek küçük kalır (mevcut yumuşak eşik 160 satır / 20 KB,
`hafiza-indeks-bekcisi.cjs`). Departman hafızası Claude'un yerleşik yoluyla **yüklenmez** (proje başına tek hafıza dizini
vardır ve aynı klasörde açılan pencereler onu paylaşır); açılışta `SessionStart` kancası pencerenin kendi
`departman/<ROL>/MEMORY.md` indeksini rol kartıyla birlikte enjekte eder. Alt klasör `CLAUDE.md`'si yalnız o klasördeki bir
dosya okununca yüklendiği için departman talimatı için güvenilir bir yol değildir.

---

## §8 Deneme senaryoları (her "izin" satırının "blok" eşi vardır)

Kanca kurulunca bağımsız bir ajan bu tabloyu koşar; işi yapmamış olmalıdır. Sonuç REC-530'a yazılır.

| No | Senaryo | Beklenen |
|---|---|---|
| D1 | Şeridi OPS olan oturum `MEMORY.md`'ye yazar | izin |
| D2 | Şeridi URUN olan oturum `MEMORY.md`'ye yazar | **blok** (R1), mesajda `oneri/` yönlendirmesi |
| D3 | URUN kendi `departman/URUN/` klasörüne yazar | izin |
| D4 | URUN `departman/ALTYAPI/` klasörüne yazar | **blok** (R3) |
| D5 | URUN `oneri/URUN-...md` yazar | izin |
| D6 | Şeridi olmayan oturum `departman/URUN/` yazar | **blok** + `önce şerit al` komutu |
| D7 | Şeridi olmayan oturum `gunluk/_sahipsiz/<kendi-sid>.md` yazar | izin |
| D8 | Şeridi olmayan oturum `gunluk/_sahipsiz/<başka-sid>.md` yazar | **blok** (R5) |
| D9 | URUN kendi `gunluk/URUN/` günlüğüne yazar / ALTYAPI'nınkine yazar | izin / **blok** (R4) |
| D10 | Alt ajan (`agent_id` var, ebeveyn URUN) `departman/URUN/`'a / `departman/ALTYAPI/`'ya yazar | izin / **blok** |
| D11 | Pano okunamıyor (bozuk claim dosyası) | izin + durum satırında `kural ölçülemedi` alarmı |
| D12 | `autoMemoryDirectory` başka dizine ayarlı; o dizinde MEMORY.md'ye URUN yazar / eski dizine yazar | **blok** (yeni dizin korunur) / izin (artık hafıza değil) |
| D13 | `MultiEdit` ve `NotebookEdit` ile D2'yi tekrarla | **blok** (dört araç da aynı kural) |
| D14 | Claude'un kendi otomatik hafıza yazımı (şeridi URUN pencerede "bunu hatırla" isteği) | denenecek: kancadan geçiyor mu, sonuç kaydedilir |
| D15 | Bash yönlendirme (`> memory/MEMORY.md`, `tee`) ve `python -c` ile aynı yola yazma | yönlendirme **blok**; `python -c` geçer ve `bash-write-audit` sonradan alarm verir (§6 açık delik, beklenen) |
| D16 | Worktree'de açılmış URUN oturumu `departman/URUN/`'a yazar | izin (üçüncü aday: ana depo dizini) |

Ayırt edici olmayan kanca (her şeye izin veren ya da her şeyi engelleyen) D2/D3 ve D5/D6 çiftlerinden birinde düşer.

---

## §9 Günlük dosyalarının taşınması ve compact kapısı

Günlük/durum dosyaları bugün hafıza dizininin kökünde durur (`<rol>-lane-day-*.md`, `<rol>-serit-durumu.md`,
`ops-cycle-audit-state.md`); 60'ı 2,1 MB'tır. `precompact-durum-kapisi.cjs` onları hafıza dizininin kökünde
`(lane-day|state|durum)` ad kalıbıyla arar. Taşımak kapıyı kırar; bu yüzden **kapı değişikliği ve kanca kuralı aynı PR'da**
girer (ARAÇ): kapı önce `gunluk/<ROL>/`'a, bulamazsa geçiş süresince köke bakar. `gunluk/_sahipsiz/` kapıda **sayılmaz**
(şeridi olmayan pencerenin dosyası şerit durumu değildir). Taşıma dosya listesi OPS onayından sonra yapılır.

---

## §10 ARAÇ'a devir sözleşmesi

| Kalem | Beklenen |
|---|---|
| Kural | §2 tablosu R1-R9 `lane-guard.cjs` ve `bash-write-guard.cjs` içinde; adaylar §4; fail-open ve alarm §3 |
| Test | `src/__tests__/conformance/` altında yeni kapı (öneri adı `INV-HAFIZA-YAZMA-1`), §8'in D1-D13 satırları ayırt edici çiftlerle; sabotaj: kuralı kaldır → kırmızı |
| Durum satırı | Alarm kaydını okuyan `UserPromptSubmit` satırı: `HAFIZA YAZMA: kural ölçülemedi: <sebep>` |
| Kapı | `precompact-durum-kapisi.cjs` yeni günlük yolu (§9), AYNI PR |
| Envanter | `docs/audits/arac-envanteri-*` satırı (kanca envantere girmeden bitmiş sayılmaz) |
| Deneme | D14 ve D15'i HARİTA'nın bağımsız ajanı koşar; sonucu REC-530'a yazar |

---

## §11 Açık kararlar (OPS)

- **R9 HARİTA süresi:** HARİTA kapandıktan sonra `CLAUDE.md` ve rol kartlarını yalnız OPS yazar mı, yoksa bir "sistem
  kurucusu" şeridi mi açılır?
- **Otomatik hafıza:** D14 sonucuna göre `autoMemoryEnabled: false` (OPS ve Recep).
- **Sandbox / yönetilen katman:** §6'daki iki delik için işletim sistemi düzeyi koruma ayrı karar.

---

## Değişiklik kaydı

- 2026-09-30 v0.1: ilk sürüm (REC-531). Model taslağı `hafiza-model-taslak-HARITA` (kısa ömürlü) bu cetvele taşındı.
