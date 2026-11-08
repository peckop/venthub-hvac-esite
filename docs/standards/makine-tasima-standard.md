# Makine Taşıma ve Düzenli Yedek — Cetvel v1.0

> **Kapsam:** bu Windows makinesinden (şirket dizüstüsü) başka bir Windows makineye geçiş ve geçişe kadar günlük yedek. Tek kitap, üç betik.
> **Betikler:** `scripts/tasima/paketle.cjs` (eski makine) · `scripts/tasima/kur.cjs` (yeni makine) · `scripts/tasima/dogrula.cjs` (iki makine). Ortak kod `cekirdek.cjs`, `envanter.cjs`, `git.cjs`.
> **Zorlayan kapı:** `INV-TASIMA-1` → `src/__tests__/conformance/makine-tasima.test.ts` (yol dönüşümü, tar bütünlüğü, sha256 sabotajı, git bundle gidiş dönüşü, parola kanalı yok, hedef git deposunda olamaz).
> **Sahibi:** ALTYAPI · **Kayıt:** Kanban: ALT-165 · **İlk yazım:** 2026-11-06
> **Son ölçüm:** 2026-11-06 (Claude Design zip yedekleri §2.4 ve §3: 2026-11-08)
> **Son doğrulama:** 2026-11-07 — GERÇEK paketleme provası yapıldı (sahibin parolasıyla, Drive'a 2,5 GB) ve paket bu makinede yalıtılmış bir köke kuruldu; sırlar parolayla açıldı. Gerçek yeni makinede kurulum henüz KOŞULMADI (§9).

## 0. Kaynak ve cetvel

- **Kayıt:** Kanban ALT-165. Günlük yedek görevi: OPS-240 (görev izni). UnoPim yedeği: REC-357 §7 (`unopim-yedek.cjs`).
- **Karar (sahip, 6 Kasım 2026):** taşıma paketi ve düzenli yedek yeri Google Drive masaüstü eşitleme klasörüdür (bu makinede `<Drive>\VentHub-Tasima`; yeni makinede yol farklı olabilir, betikler parametre alır). Sırlar yalnız `gpg --symmetric --cipher-algo AES256` ile, sahibin kendi yazdığı parolayla şifreli parçaya girer.
- **Karar (sahip, 6 Kasım 2026):** lisanslı ticari programlar yeni makinede olmayacak ve satın alınmayacak (§6 D grubu).
- **Bu işi yöneten başka cetvel yoktur;** komşu cetveller: `execution-method-standard.md` §10.4 (kapı eylemleri), `depoya-giremeyecek-veri-standard.md` (paket depoya girmez: hedef git deposunda olamaz), `edge-function-security-standard.md` (sır kopyası sayımı: bir sır her kopyasıyla ayrı sayılır).
- **Sahip kapıları (ajan karar vermez):** gpg parolası (sahip yazar, betik görmez), eski makinede bizim verinin silinmesi (§8), sırların döndürülmesi (§9), Drive hesabı.

## 1. Üç komut, tek akış

| Adım | Makine | Komut | Ne yapar |
|---|---|---|---|
| 1 | eski | `node scripts/tasima/dogrula.cjs --cikti <Drive>\VentHub-Tasima\dogrula-eski.json` | sayımları ölçer (kanban, sage, posta, hafıza, kanca, araç) |
| 2 | eski | `node scripts/tasima/paketle.cjs --hedef <Drive>\VentHub-Tasima` | KURU KOŞUM: ne alınır, boyut, sığar mı. Hiçbir şey yazmaz |
| 3 | eski | `node scripts/tasima/paketle.cjs --gercek --hedef <Drive>\VentHub-Tasima` | paketi yazar; sırlar için gpg parola penceresi açılır |
| 4 | yeni | `node <Drive>\VentHub-Tasima\tasima-<damga>\arac\kur.cjs --kaynak <Drive>\VentHub-Tasima` | KURU KOŞUM: plan, çakışma, yol dönüşümü |
| 5 | yeni | aynı komut + `--gercek` | depoları klonlar, parçaları açar, yolları yeniden yazar, sırları açar |
| 6 | yeni | `node scripts/tasima/dogrula.cjs --karsilastir <Drive>\VentHub-Tasima\dogrula-eski.json` | kayıp varsa çıkış ≠ 0 |

Paket klasörü `tasima-<damga>/` (damga UTC, ör. `20261106T143015Z`):

```
icindekiler.json        her dosya: göreli yol, bayt, sha256, kaynak mutlak yol, kategori (EN SON yazılır; yoksa paket yarımdır)
ayar-<damga>.tar        parça başına düz tar (hafiza, wrongstack, db, ingestor, arsiv, gorsel, [transkript])
sirlar-<damga>.tar.gpg  sırlar, gpg simetrik AES256 (düz hâli diske hiç yazılmaz, bellekten gpg'ye gider)
git/                    <depo>-<damga>.bundle, <depo>-refs-<damga>.txt, <depo>-durum-<damga>.txt (git status --porcelain)
arac/                   scripts/tasima kopyası (yeni makinede depo daha yok; kur buradan koşar)
OKU-BENI.txt
```

Çıkış kodları: `0` tamam · `1` kırmızı (zorunlu öğe yok, okunamayan dosya, bütünlük hatası, çakışma) · `2` kullanım hatası. Tanımsız bayrak hata verir.

## 2. Envanter (6 Kasım 2026 ölçümü)

Envanterin makine okunur kaynağı `scripts/tasima/envanter.cjs`; tablo onun özetidir. **İkisi ayrışırsa dosya kazanır, tablo düzeltilir.** Boyutlar `paketle.cjs` kuru koşumundandır (6 Kasım), dışarıdakiler eski makinede `du` ile ölçülmüştür.

### 2.1 Pakete girenler

| Parça | Ne | Yer (`~` = ev dizini, `<depo>` = ana depo) | Ölçüm (6 Kasım) | Not |
|---|---|---|---|---|
| ayar | `settings.json`, `settings.local.json`, `.claude.json`, `CLAUDE.md`, `hafiza-commit.sh` | `~/.claude/`, `~/.claude.json` | 1230 dosya, 16,6 MB (parçanın tamamı) | yol dönüşümü uygulanır (§5) |
| ayar | `agent-memory/`, `scheduled-tasks/`, `zamanli/`, `hooks/` (kişisel; şu an YOK), `commands/`, `output-styles/` | `~/.claude/` | | `zamanli/drive-yedek.cmd` içindeki yollar dönüşür |
| ayar | `skills/` (özel olanlar) | `~/.claude/skills` | 803 dosya, 12,9 MB | `skills/gstack` (1,2 GB; git klonu + node_modules) HARİÇ: yeniden kurulur. 4 bağ (performance, professional-communication, security-check, tdd) taşınmaz; hedefleri `~/.agents` (1,4 MB) pakete girer, bağlar elle kurulur (§5.8) |
| ayar | `recep-sozu-defteri*.jsonl`, `recep-sozu-imlec/` | `~/.claude/` | 1,3 MB | |
| ayar | Claude Desktop: `claude_desktop_config.json`, `config.json`, `side-session-notes/` | `%APPDATA%\Claude\` | 1,1 MB | tarayıcı önbellekleri, `vm_bundles` taşınmaz |
| hafiza | her `~/.claude/projects/*/memory` (44 klasör, 1506 md; `.git` DAHİL) | `~/.claude/projects/` | 7586 dosya, 355 MB | ana klasörün uzağı `venthub-ops-hafiza`; md dışı dosyalar için de tek kopya budur. Klasör adı yoldan türer: kur yeniden adlandırır |
| wrongstack | kanban + sage (`.wrongstack/kanbans`, `memories`) | `<depo>/.wrongstack` | 4 dosya (`_kanban.sqlite`, `sage.db`, 2 küçük json); posta ile birlikte parça 11 dosya, ≈ 21 MB (ana dosya boyutu; anlık görüntü WAL'ı da içerir) | SQLite: `VACUUM INTO` anlık görüntü, kaynakla satır sayımı karşılaştırılır |
| wrongstack | posta kutuları | `~/.wrongstack/projects/*/_mailbox.sqlite` | 0,3 MB | aynı yöntem. `codebase-index` (171 MB), `logs`, `diagnostics`, `ipc-endpoint.secret`, `*server.json` taşınmaz (yeniden üretilir) |
| db | corpus-callosum `.cc/*.db`, `.orion/*.db` | `~/corpus-callosum` | şu an 0 (dosya YOK) | var olursa SQLite anlık görüntü |
| ingestor | izsiz/ignore'lu veri: `kaynak-dizini/gorseller`, `egriler.jsonl`, `egri-profilleri.json`, `staging/` | `~/venthub-pdf-ingestor` | 228 dosya, 29,8 MB | |
| arsiv | `VentHub-Olcum-Arsiv`, `blog-calisma`, `mevzuat-calisma` | `~/` | 2641 dosya, 285 MB | |
| gorsel | `VentHub-Gorsel-Arsiv` | `~/` | 6335 dosya, 1,2 GB | ayrı parça: yeniden denenirse yalnız o tekrar yazılır |
| git | uzakta olmayan iş: bundle + `refs` + `durum` | 7 depo (§2.3) | bundle ≈ 462 MB (üst sınır tahmini) | |
| sirlar | §2.2 | | 33 dosya, 31 KB | gpg ile şifreli |
| UnoPim | günlük `.vhenc` yeterli | `<Drive>\VentHub-Tasima\pim\` | | compose klasörü `.vhenc` içinde; `yedek.key` sır parçasında |

**Toplam tahmini paket: 2,4 GB** (tar 1,9 GB + bundle 462 MB + başlık payı). Hedefte boş yer iki ölçümde 46,2 GB ve 34,9 GB (Drive'ın bildirdiği boş yer oynuyor); ikisinde de "sığar mı: EVET". (İlk tahmin "tam kopya ≈ 51 GB, Drive boşu ≈ 50 GB" idi; fark, yeniden üretilebilenlerin pakete alınmamasından gelir: §2.4. Seçmeli paket şarttı, ölçü bunu doğruladı.)

### 2.2 Sırlar (yalnız şifreli parçaya)

`<depo>/.env`, `<depo>/.env.local` · `~/.claude/.credentials.json`, `.env.global`, `gsc-anahtar.json`, `gsc-oauth-client.json`, `bing-webmaster-anahtar.txt`, `.byteplus_key` · `~/.secrets/` · `~/.ssh/` · `~/.mcp-auth/` · `<tmp>/pim-anahtar/yedek.key`, `<tmp>/pim-unopim/.env`, `<tmp>/pim-unopim/.sirlar/` · `~/corpus-callosum/.env`, `.cc/.env.keys`, `.orion/.env.keys` · `~/orion-registry/.env` · `~/venthub-pdf-ingestor/.env`.

Ölçümde 33 dosya bulundu; `corpus-callosum/.cc/.env.keys` ve `.orion/.env.keys` bu makinede YOK (kuru koşum "YOK" yazar, hata saymaz).

⚠ **`~/.secrets/` Windows DPAPI ile sarılı XML'dir.** DPAPI anahtarı kullanıcı hesabına ve makineye bağlıdır; yeni makinede **açılmayabilir**. Dosyalar pakette durur ama değerleri yeniden girmeye hazır olun (içeriği ölçülmedi, hangi araç okuyor bilinmiyor).

### 2.3 Git: uzakta olmayan iş

| Depo | İleri commit | Stash | Kirli dosya | Bundle |
|---|---|---|---|---|
| venthub-hvac | 346 | 83 | 2 | evet (≈ 412 MB), 1715 yerel dal |
| venthub-pdf-ingestor | 0 | 0 | 11 | hayır (uzakla özdeş) |
| orion | 0 | 0 | 4 | hayır |
| orion-registry | 1 | 1 | 3 | evet (2,2 MB) |
| orion-cortex | 11 | 0 | 3 | evet (1,4 MB) |
| corpus-callosum | 2 | 0 | 1 | evet (44,5 MB) |
| mods | 44 | 0 | 0 | evet (1,6 MB) |

- Bundle `git bundle create --all`: tüm dallar, etiketler, uzak izleme dalları ve **stash'ler**. Stash'ler reflog'da durur, `--all` yalnız en üstteki `refs/stash`i alır; bu yüzden her stash geçici `refs/tasima-stash/NNNN` ref'ine bağlanır, bundle alınır, ref'ler HER DURUMDA silinir (testte sınanır: kaynak depoda ref değişmez).
- Bundle gerekir mi: ileri commit > 0, stash > 0 ya da uzağı olmayan depo. Gerekmeyen depoda bile `refs` dosyası (dal adı → commit) pakete girer; kur, klondaki commit'e işaret eden yerel dal adlarını oradan kurar.
- **Kirli çalışma ağaçları yalnız raporlanır** (`git status --porcelain` çıktısı `durum` dosyasında ve kuru koşumda). Paket onları taşımaz. Taşıma günü önce commit edin ya da `git stash push -u` yapın (stash bundle'a girer).
- Kök dışında ~/ altında 20'den fazla git deposu daha var (ör. `eticaret`, `MCP_Tools`, `engineering_calculator`); envantere girmediler (VentHub dışı, ölçülmedi). Gerekiyorsa `scripts/tasima/envanter.cjs` içindeki `GIT_DEPOLARI` listesine eklenir.

### 2.4 Pakete GİRMEYENLER (yeniden üretilir ya da gerekmez)

| Ne | Boyut (ölçüm) | Nasıl geri gelir |
|---|---|---|
| `~/.claude/plugins` | 6,5 GB | Claude Code açılışında eklentiler yeniden kurulur (`enabledPlugins` ayarı taşındı) |
| `~/.cache` | 16 GB | araçlar yeniden doldurur |
| pnpm store | | `pnpm install --frozen-lockfile --prefer-offline` |
| CodeGraph, graphify dizinleri | | `graphify extract . --code-only`; CodeGraph dizini MCP ilk açılışta kurulur (komut ölçülmedi) |
| Claude Desktop `vm_bundles`, önbellek | | yeniden indirilir |
| `~/.claude/projects` konuşma dökümleri | 15 GB | **isteğe bağlı** `--transkriptler` bayrağı (Drive'a sığmaz; harici disk). Almazsanız Claude Code'da eski oturum listesi (`/resume`) boş başlar |
| `~/.wrongstack/projects/*/codebase-index` | 171 MB | yeniden indekslenir |
| `skills/gstack` | 1,2 GB | yeniden klonlanır/kurulur |
| node_modules, `.next`, `__pycache__` | | her pakette hariç |
| worktree kayıtları (`.git/worktrees`, `.claude/worktrees/*`) | | ana depo klonlanınca YOK; gereken worktree'ler `git worktree add` ile yeniden açılır (dallar bundle'da) |
| Claude Design proje zip yedekleri (OPS-228 taşıması, son tarih 14 Aralık 2026) | 8 Kasım 2026 ölçümü, `~/Downloads`: `VentHub Design System.zip` 82,7 MB (8 Kasım); `Venthub New.zip` ve `Venthub New (1..15).zip` 16 dosya, 1.267,9 MB (25 Ekim–7 Kasım; en büyükleri (14) 225,0 MB ve (15) 229,8 MB) | Asıl kopya taşımadan sonra claude.ai Artifacts'te durur; zip ikinci kopyadır. **Tek kalıcı yer: `<Drive>\VentHub-Tasima\design\`** (Drive eşitlemesi makineden bağımsız tutar, pakete girmez, yeni makinede Drive ile gelir). Yeni taşıma zip'i inince Downloads'tan bu klasöre kopyalanır, boyut ve sha256 karşılaştırılır. **Uygulandı (sahip kararı, OPS-228, 8 Kasım 2026):** `design\` altında `VentHub Design System.zip` (82.747.281 B) ve `Venthub New (15).zip` (229.815.467 B), boyut ve sha256 birebir (OPS ölçümü; boyutlar ALTYAPI'ce yeniden ölçüldü). Eski 15 dışa aktarım (`Venthub New.zip`, `(1)`–`(14)`) Geri Dönüşüm Kutusu'na gönderildi. İki zip Downloads'ta da duruyor; önizleme betiği son zip'i oradan okur, bu yüzden Downloads'taki kopya çalışma kopyasıdır, Drive'daki kalıcı kopyadır. `venthub-hvac-platform*.zip` ve `venthub-hvac.zip` (4 dosya, 80,8 MB, Ağustos 2025) Design yedeği değildir, bu satırın dışındadır |

### 2.5 Yol kırılması (ölçüldü)

`~/.claude/projects` klasör adları yoldan türer (harf/rakam dışı her karakter `-`; ör. `C--...`; sürücü harfi bazı klasörlerde küçük `c--`). Ev dizini önekiyle sayıldı (6 Kasım): `settings.json` içinde 30 (21 JSON kaçışlı, 8 düz bölü, 1 MSYS), `.claude.json` içinde 43 (6 kaçışlı, 37 düz bölü), `settings.local.json` içinde 5 (2 düz bölü, 2 MSYS, 1 klasör adı). Ayrıca `tmp` kökünü gösteren yollar var (`settings.json` 9, `.claude.json` 1). Beş yazılış görüldü: ham ters bölü, JSON kaçışlı (`\\`), düz bölü, MSYS (`/c/...`) ve klasör adı; kur hepsini birlikte dönüştürür. `OrionBoardSync` zamanlanmış görevi mutlak yol taşır. Çözüm: §5 adım 4.

## 3. Düzenli yedek (ZATEN KURULU)

Burada yeniden yazılmadı; referans:

| Ne | Değer |
|---|---|
| Windows görevi | `VentHub-Drive-Yedek`, her gün 21:00, etkileşimli oturumda (`cmd.exe /c "~\.claude\zamanli\drive-yedek.cmd"`) |
| Kanban + sage + posta kutuları | `scripts/hijyen/sage-yedek.cjs` → `<Drive>\VentHub-Tasima\yedek\`. `VACUUM INTO` + kaynakla sayım. Saklama: sage ve posta son 14 sürüm; kanban en yeni 24 + son 30 günün her günü için en yeni kopya (`DEPOLAR` sabiti) |
| UnoPim | `scripts/pim/unopim-yedek.cjs al` → `yedek.key` ile şifreli `.vhenc` → `<Drive>\VentHub-Tasima\pim\`, son 3 sürüm |
| Günlük | `<Drive>\VentHub-Tasima\yedek\gorev-gunlugu.txt` (her adımın çıkış kodu) |
| Claude Design zip'leri | betik YOK: her proje taşımasında indirilen zip elle `<Drive>\VentHub-Tasima\design\` altına kopyalanır, boyut ve sha256 karşılaştırılır (§2.4 satırı; 8 Kasım 2026'da 2 zip, 312,6 MB). Asıl kopya claude.ai Artifacts'tedir |
| Düz UnoPim klasörü | `~/VentHub-PIM-Yedek` (yerelde kalır; `drive-yedek.cmd` son 6'yı tutar, dosyadaki yorum 3 diyor: ikisi ayrışıyor, niyet ölçülmedi) |

**Geri yükleme komutları** (yedek dizini `VENTHUB_SAGE_YEDEK_DIZINI=<Drive>\VentHub-Tasima\yedek`):

```
node scripts/hijyen/sage-yedek.cjs --liste
node scripts/hijyen/sage-yedek.cjs --geri kanban [dosya] --kok <depo kökü> [--evet]
node scripts/hijyen/sage-yedek.cjs --geri sage   [dosya] --kok <depo kökü> [--evet]
node scripts/hijyen/sage-yedek.cjs --geri posta-<proje> [dosya] --posta-koku <~/.wrongstack/projects> [--evet]
```

`--evet` yoksa yalnız plan yazılır. Pencerelerdeki MCP süreçleri (kanban, sage, posta) çalışırken geri yükleme REDDEDİLİR; eski dosyalar `.oncesi-<damga>` olarak kalır.

UnoPim:

```
UNOPIM_YEDEK_ANAHTAR=<yedek.key yolu> node scripts/pim/unopim-yedek.cjs coz <Drive>\VentHub-Tasima\pim\<paket>.vhenc <hedef-kök>
UNOPIM_YEDEK_DIZIN=<hedef-kök> node scripts/pim/unopim-yedek.cjs dene [yedek-klasörü]
```

`dene`, yedeği AYRI bir compose projesine (`pim-geri`, port 8001) kurar, ürün/kategori sayısını yedek anındaki sayıyla ve giriş sayfasını 200 ile karşılaştırır, sonra yalnız `pim-geri`'yi siler. Asıl kuruluma dokunmaz (REC-357 §7 ölçümü: 12/12 ürün, 53 sn). Asıl kurulum için `coz`'dan çıkan `compose.yaml`, `.env`, `sirlar/` `<tmp>/pim-unopim` altına konur ve `dene` işlevindeki adımlar aynen `pim-unopim` proje adı ve gerçek port/birim adlarıyla uygulanır; bu adım henüz canlı yeni makinede koşulmadı (§9).

## 4. Taşıma günü — ESKİ makine

1. **Taze yedek.** Kirli depoları commit/push edin ya da stash'leyin (§2.3). `schtasks /run /tn VentHub-Drive-Yedek` (ya da §3 komutları): kanban/sage/posta ve UnoPim yedekleri tazelenir. `<Drive>\VentHub-Tasima\yedek\gorev-gunlugu.txt` son satırlarında çıkış kodu 0 aranır.
2. **Claude pencerelerini kapatın** ve paketleme bitene kadar iş yapmayın (okuma-yalnız çalışır, kapatmak zorunlu değil; amaç sayımların sabit kalması).
3. `node scripts/tasima/dogrula.cjs --cikti <Drive>\VentHub-Tasima\dogrula-eski.json`
4. `node scripts/tasima/paketle.cjs --hedef <Drive>\VentHub-Tasima` (kuru) → toplam, "SIĞAR MI: EVET", `KIRMIZI` satırı yok.
5. `node scripts/tasima/paketle.cjs --gercek --hedef <Drive>\VentHub-Tasima` → gpg penceresi **iki kez** parola sorar (parolayı sahibi yazar; parola yöneticisine de kaydedin). Sır parçası işin BAŞINDA şifrelenir; sonra parçalar, SQLite anlık görüntüleri, bundle'lar yazılır. Çıktı sonunda `PAKET TAMAM`.
6. Drive eşitlemesinin bitmesini bekleyin (Drive simgesi güncel). Paket klasörünü yeni makinede çevrimdışı kullanıma açın (§5.3).
7. İsteğe bağlı: `--transkriptler` ile konuşma dökümleri (15 GB; Drive'a sığmaz, harici disk hedefi verilir).

Hedef bir git deposunun içindeyse paketle REDDEDER (paket sır taşır, depo PUBLIC).

## 5. Taşıma günü — YENİ makine

1. Windows güncellemesi, kullanıcı hesabı. `C:\tmp` klasörünü açın (UnoPim, kısa yol, `git` uzun yol sorunları için). `git config --global core.longpaths true`.
2. **Araçlar** (§6 A grubu sırasıyla; her satırın `--version` doğrulaması orada). Önce Git, GitHub CLI, Node: `kur` bunlarla çalışır.
3. **Google Drive masaüstü** kurulumu, aynı hesapla giriş. `VentHub-Tasima` klasörünü "çevrimdışı kullanılabilir" yapın (akış kipinde kur dosyaları okurken indirir, yavaşlar). Yeni makinede Drive yolu farklıysa not alın: `drive-yedek.cmd` içindeki eski Drive yolu için `--yol-esle "<eski Drive yolu>=<yeni Drive yolu>"` verilir (§5.6).
4. **GitHub girişi:** `gh auth login` ve `gh auth setup-git` (özel depolar klonlanacak; kur klonu bu girişle yapar).
5. **Claude Desktop ve Claude Code kurulumu, AÇMADAN ve GİRİŞ YAPMADAN.** İlk açılış kendi `.claude.json` ve `settings.json`ını üretir; kur bunları `--uzerine-yaz` ile alır ve yeni makinenin kendi dosyasını `<dosya>.mevcut-oncesi-tasima` olarak saklar.
6. **Kur — önce kuru koşum:** `node <Drive>\VentHub-Tasima\tasima-<damga>\arac\kur.cjs --kaynak <Drive>\VentHub-Tasima` (plan, çakışma, yol dönüşümü listesi). Sonra `--gercek` (gerekirse `--uzerine-yaz`, `--ev`, `--tmp-kok`, `--appdata`, `--ana-depo`, `--yol-esle eski=yeni`). Kur sırayla:
   1. `icindekiler.json` biçim kapısı (eksik alan = durur), her parçanın ve bundle'ın **sha256**'sı. Tek bayt tutmazsa hiçbir şey yazılmadan durur.
   2. Çakışma kontrolü: var olan dosya içerikçe farklıysa `--uzerine-yaz` olmadan durur; aynı içerikli dosyaya dokunulmaz.
   3. **Git:** her depo için `git clone` (uzak adres varsa uzaktan, yoksa bundle'dan), sonra bundle'dan dallar/etiketler/stash'ler. Hedef doluysa o depo atlanır ve kırmızı yazılır. Aynı ada sahip ayrışmış yerel dal `refs/heads/tasima/<ad>` olarak kurulur. Stash'ler eskiden yeniye `git stash store` ile geri konur.
   4. **Parçalar:** her dosya açılırken sha256 doğrulanır; `icindekiler.json`'da olmayan dosya arşivden çıkarsa durur. Arşiv yolu `..`, mutlak yol, sürücü harfi, `:` ya da ters bölü içeremez (tar-slip). `~/.claude/projects/<slug>` klasörleri **yeni ev slug'ı ile yeniden adlandırılarak** açılır (sürücü harfi büyük/küçük ve iç içe adlar dahil).
   5. **Yol yeniden yazımı:** `.claude.json`, `.claude/settings.json`, `settings.local.json`, Claude Desktop yapılandırması, `zamanli/*.cmd`, `hafiza-commit.sh`, `scheduled-tasks/**` içindeki eski ev/tmp/appdata/depo yolu yenisiyle değişir (beş yazılışın hepsi; ad sınırı: `...\ali-yedek` ve `...\ali2` değişmez). Önce `<dosya>.oncesi-tasima` yedeği alınır; JSON dosyası JSON kalmazsa YAZILMAZ. Yazılmayan ama eski yol içeren yapılandırma dosyaları "ELLE BAKILACAK" olarak listelenir (anlatı dosyaları bilerek dönüşmez).
   6. **Sırlar:** `gpg --decrypt` (parolayı sahibi yazar) → bellekte açılır → her dosya sha256 ile doğrulanır → çakışma önceden bulunur → `0600` ile yazılır. Eski yol içeren sır dosyaları yalnız adıyla listelenir (değer yazılmaz).
7. **Depo içinde:** `pnpm install --frozen-lockfile --prefer-offline` (`prepare` betiği git kancalarını `.git/hooks` altına kurar; `core.hooksPath` AYARLANMAZ, bkz. `scripts/setup-hooks.mjs` başlığı; `postinstall` tam `type-check` koşar, uzun sürebilir) · `graphify extract . --code-only`.
8. **Bağlar:** `~/.claude/skills` altındaki dört bağ elle kurulur (yönetici ya da geliştirici modu gerekir): `mklink /D "<ev>\.claude\skills\tdd" "<ev>\.agents\skills\tdd"` (aynısı `performance`, `professional-communication`, `security-check` için). Ölçülmedi: yeni makinede bağ yetkisi.
9. **Docker + UnoPim:** Docker Desktop (WSL2) → `unopim-yedek.cjs coz` + `dene` (§3). Asıl kurulum için §3 sonundaki not.
10. **Zamanlanmış görevleri yeniden kurun** (görev izni gerekir: OPS-240 izni yeni makinede de gerekir, sahip onayıyla):
    - `VentHub-Drive-Yedek`: `schtasks /create /tn VentHub-Drive-Yedek /sc daily /st 21:00 /tr "cmd.exe /c \"%USERPROFILE%\.claude\zamanli\drive-yedek.cmd\""` (ölçülen: etkileşimli oturum). Önce `drive-yedek.cmd` içindeki Drive yolunun doğru olduğunu açın ve bir kez elle koşun.
    - `OrionBoardSync`: ölçülen tanım: 15 dakikada bir, `conhost.exe --headless <ev>\orion\scripts\board_sync.cmd`, gizli, pilde başlamaz, en çok 30 dk. Komut: `schtasks /create /tn OrionBoardSync /sc minute /mo 15 /tr "conhost.exe --headless %USERPROFILE%\orion\scripts\board_sync.cmd"`; "gizli/pilde başlama" ayarları Görev Zamanlayıcı'dan elle (yeni makinede koşulmadı).
11. **Girişler** (taşınan dosyalar bir kısmını kapsar, hepsi yeniden doğrulanır): GitHub (`gh auth status`), Supabase (`supabase login`), Google/GSC (`gsc-oauth-client.json` taşındı; tarayıcı oturumu yeni), Vercel (`vercel login`), Linear (yalnız arşiv/okuma; MCP yetkilendirmesi), Claude (uygulamada giriş), MCP OAuth'lar (`~/.mcp-auth` taşındı; sunucu tarafı yetki geçersizse `/mcp` ile yeniden).
12. **Doğrulama:** `node scripts/tasima/dogrula.cjs --karsilastir <Drive>\VentHub-Tasima\dogrula-eski.json` — kayıp = KIRMIZI, çıkış 1; sürüm farkı UYARI; ayarlarda eski yol kalması KIRMIZI.

`dogrula` kuralı: veri sayıları **yeni ≥ eski** olmalıdır (kayıp kırmızı; yeni makinede iş yapıldıkça sayı artar, artış uyarıdır). `--siki` tam eşitlik ister. Kanca betik dosyası eksikse (`settings.json` komutlarında başvurulan 61 betik, 6 Kasım: 0 eksik) kırmızıdır. Eksik araç kırmızı, farklı sürüm uyarı.

## 6. Kurulum listesi (yeni makine)

Sürüm sabitleme istisnadır, gerekçesiz pin yok: **Node 24.x** `package.json > engines` gereğidir (winget'te `OpenJS.NodeJS.LTS` kimliği artık 26.x verir; sürümsüz KURMAYIN). Diğerleri güncel kurulur, `dogrula` farkı uyarı olarak yazar. Kimlikler 6 Kasım 2026'da `winget show --id <kimlik> --exact` ile doğrulandı; "(elle)" yazanlar winget/scoop'ta bulunamadı.

PowerShell'de scoop: `Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression`.

### A. Geliştirme (zorunlu)

| Araç | Eski makine | Kurulum | Doğrulama |
|---|---|---|---|
| Git | 2.49.0 | `winget install --id Git.Git -e` | `git --version` |
| GitHub CLI | 2.97.0 | `winget install --id GitHub.cli -e` | `gh --version` |
| Node.js | 24.22.1 | `winget install --id OpenJS.NodeJS.LTS -e --version 24.22.1` | `node --version` (v24.x) |
| pnpm | 10.15.0 | `npm install -g pnpm@10.15.0` | `pnpm --version` |
| Python 3.11 | 3.11.9 | `winget install --id Python.Python.3.11 -e --version 3.11.9` | `py -3.11 --version` |
| Python 3.13 | 3.13.5 | `winget install --id Python.Python.3.13 -e --version 3.13.5` | `py -3.13 --version` |
| Miniconda3 (isteğe bağlı) | | `winget install --id Anaconda.Miniconda3 -e` | `conda --version` |
| uv (graphify için) | | `winget install --id astral-sh.uv -e` | `uv --version` |
| Bun | 1.4.2 | `scoop install bun` | `bun --version` |
| Deno | 2.9.5 | `scoop install deno` | `deno --version` |
| Supabase CLI | 2.114.0 | `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` · `scoop install supabase` | `supabase --version` |
| PostgreSQL 17 istemcisi | 17.4 | `scoop bucket add versions` · `scoop install versions/postgresql17` (ana scoop deposu artık 18 verir) | `psql --version` |
| Docker Desktop | 4.97 | `winget install --id Docker.DockerDesktop -e` (WSL2, yeniden başlatma) | `docker --version` |
| Microsoft OpenJDK 21 | 21 | `winget install --id Microsoft.OpenJDK.21 -e` | `java -version` |
| VS Build Tools 2019 (better-sqlite3 vb. yerel modüller) | 2019 | `winget install --id Microsoft.VisualStudio.2019.BuildTools -e --override "--quiet --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"` (override dizgisi ölçülmedi) | `pnpm install` sonrası yerel modül derlemesi; ya da `vswhere -products *` |
| 7-Zip | | `scoop install 7zip` | `7z` (ilk satır sürümü yazar) |
| FFmpeg | 8.1 | `winget install --id Gyan.FFmpeg -e` | `ffmpeg -version` |
| Poppler | 25.07 | `winget install --id oschwartz10612.Poppler -e` | `pdftotext -v` |
| Google Chrome | | `winget install --id Google.Chrome -e` | tarayıcı açılır |
| Google Drive masaüstü | | `winget install --id Google.GoogleDrive -e` | Drive simgesi, oturum |
| Claude Desktop | | `winget install --id Anthropic.Claude -e` | uygulama açılır (kurulumdan sonra §5.5 uyarısı) |
| Claude Code | 2.1.296 | `winget install --id Anthropic.ClaudeCode -e` | `claude --version` |

### B. npm global ve diğer

`npm install -g @colbymchenry/codegraph @ast-grep/cli @alibaba-group/open-code-review @playwright/mcp @supabase/mcp-server-supabase @modelcontextprotocol/server-github @modelcontextprotocol/server-memory @modelcontextprotocol/server-sequential-thinking @testsprite/testsprite-mcp mcp-remote vercel typescript typescript-language-server better-sqlite3 serve http-server @smithery/cli @nestjs/cli` → doğrulama `npm ls -g --depth=0`. `better-sqlite3` yerel derleme ister (VS Build Tools). `kiro-spec-validation` yerel bağdır, **taşınmaz**. `graphify`: `uv tool install graphifyy` → `graphify --version` (ölçülen 0.9.62).

Ölçümde global olarak ayrıca görüldü, listede YOK, gereksinimi ölçülmedi (projede yerel bağımlılık): `@mimo-ai/cli`, `9router`, `autoprefixer`, `claudex`, `postcss`, `tailwindcss`, `undici`.

### C. Editör/IDE

| Araç | Kurulum |
|---|---|
| VS Code | `winget install --id Microsoft.VisualStudioCode -e` |
| Cursor | `winget install --id Anysphere.Cursor -e` |
| Antigravity IDE (agy) | `winget install --id Google.Antigravity -e` |

### D. Mühendislik ve ofis

**KURULMAZ (karar: lisanslı ticari programlar yeni makinede olmayacak, satın alınmayacak; şirket makinesinde kalır):** SOLIDWORKS 2024 ve 3DEXPERIENCE, AutoCAD LT 2015, TekyazXpert, Microsoft 365, Adobe Acrobat, ESET, FortiClient (ESET ve FortiClient şirket güvenlik/VPN araçlarıdır).

**Kurulacak ücretsizler:**

| Araç | Kurulum | Not |
|---|---|---|
| Blender | `winget install --id BlenderFoundation.Blender -e` | eski makinede 5.1, winget güncel verir |
| nanoCAD 5 | (elle) nanocad.com | winget'te bulunamadı; ücretsiz sürüm olup olmadığı ölçülmedi, ücretsizse kurulur |
| DWG TrueView (ücretsiz görüntüleyici) | `winget install --id Autodesk.DWGTrueView.2027 -e` | eski makinede 2026 |
| Zoom | `winget install --id Zoom.Zoom -e` | |
| TeamViewer (isteğe bağlı) | `winget install --id TeamViewer.TeamViewer -e` | |
| AnyViewer (isteğe bağlı) | `winget install --id XPDP1L1HQ6TBT5 --source msstore` | |

**Açık kaynak karşılıklar (öneri; kurulum sahibin kararı):**

| İhtiyaç | Karşılık | Kurulum |
|---|---|---|
| CAD | FreeCAD | `winget install --id FreeCAD.FreeCAD -e` |
| DWG | LibreCAD, ODA File Converter | `winget install --id LibreCAD.LibreCAD -e` · `winget install --id ODA.ODAFileConverter -e` |
| Ofis | LibreOffice | `winget install --id TheDocumentFoundation.LibreOffice -e` |
| CFD/ağ | ParaView | `winget install --id Kitware.ParaView -e` |
| CFD/ağ | OpenFOAM, Salome | (elle) winget'te resmi paket yok (OpenFOAM için yalnız eski `blueCFD-Core` 2020.1 görüldü; Salome araması boş). Windows'ta OpenFOAM için WSL2 yolu yaygındır, ölçülmedi |
| PDF | SumatraPDF | `winget install --id SumatraPDF.SumatraPDF -e` |

## 7. Betik başvurusu

```
paketle.cjs  [--gercek] [--hedef <klasör>] [--parcalar ayar,hafiza,wrongstack,db,ingestor,arsiv,gorsel,sirlar,git]
             [--transkriptler] [--ev <yol>] [--tmp-kok <yol>] [--appdata <yol>] [--ana-depo <yol>] [--gpg <yol>] [--json <dosya>]
kur.cjs      --kaynak <klasör> [--gercek] [--uzerine-yaz] [--parcalar ...] [--git-atla]
             [--ev <yol>] [--tmp-kok <yol>] [--appdata <yol>] [--ana-depo <yol>] [--yol-esle eski=yeni]… [--gpg <yol>]
dogrula.cjs  [--cikti <json>] [--karsilastir <eski.json>] [--eski-ev <yol>] [--ev <yol>] [--ana-depo <yol>] [--siki]
```

- Kökler: `ev` = `os.homedir()`, `tmp` = sürücü kökü + `\tmp`, `appdata` = `%APPDATA%`, `depo` = ana depo (`ana-kok.cjs`). Kodda kullanıcı adı ya da sabit yol yok (kapı kaynağı tarar).
- **gpg:** `gpg --symmetric --cipher-algo AES256` (+ SHA512, parola türetme yinelemesi azami). Betik parolayı ASLA argüman, ortam değişkeni ya da dosya olarak almaz, yazmaz, loglamaz; gpg'ye toplu kip de verilmez (pinentry penceresi parolayı sahibinden ister). `--no-symkey-cache`: parola gpg-agent'ta tutulmaz. Dosyanın şifreli AES256 gpg paketi olduğu, **parola gerekmeden** OpenPGP başlığından doğrulanır (`gpg --list-packets` kullanılmaz: simetrik dosyada parola penceresi açar, 6 Kasım'da ölçüldü). gpg yolu sırayla: `--gpg`, `TASIMA_GPG`, `PATH`, Git for Windows `usr\bin\gpg.exe`.
- Düz sır tar'ı diske YAZILMAZ: bellekte kurulur (tavan 64 MB), gpg'ye boruyla gider; testte kaynak taranır.
- Sır parçasındaki dosya listesi (yol, boyut, sha256) şifreli parçanın İÇİNDEDİR (`_sirlar-icindekiler.json`); açık `icindekiler.json` sır dosyalarının sha256'sını taşımaz (okunamayan sır dosyası olursa yalnız adı `atlanan` listesinde görünür).
- Dosya gibi yazılan her çıktı önce `.tmp` adıyla yazılır, tamamlanınca adına döner; `icindekiler.json` en son yazılır.
- Dosya okunurken kilitliyse (başlık yazılmadan) atlanır ve `atlanan` listesine yazılır, paket KIRMIZI biter; okunurken küçülürse (başlıktan sonra) parça iptal edilir.
- Arşiv biçimi POSIX pax (ustar + `x` başlığı): GNU tar ve bsdtar okur (testte `tar -tf` ile ölçülür). Dosyalar sıkıştırılmaz.

## 8. Şirket makinesinden ayrılırken

**Bizim verinin eski makinede silinmesi sahip kararıdır; bu belge silme adımı yazmaz.** Yalnız ne nerede kalır:

| Yerde kalan | Konum |
|---|---|
| Depolar ve çalışma ağaçları | `~/venthub-hvac`, `~/venthub-pdf-ingestor`, `~/orion*`, `~/corpus-callosum`, `~/mods` (+ `.claude/worktrees`) |
| Yalnız-yerel veri | `.wrongstack` (kanban, sage, posta), arşivler (`VentHub-*`, `blog-calisma`, `mevzuat-calisma`) |
| Ayar ve hafıza | `~/.claude*`, `%APPDATA%\Claude`, hafıza deposu |
| Sır kopyaları | §2.2'deki her dosya, Windows kimlik/DPAPI deposu, tarayıcı oturumları, `gh`/`supabase`/`vercel` oturumları |
| Yedekler | `~/VentHub-PIM-Yedek` (düz), `<tmp>` altındaki UnoPim ve `yedek.key`, Drive'ın yerel önbelleği |
| Zamanlanmış görevler | `VentHub-Drive-Yedek`, `OrionBoardSync` (silinmezse eski makinede çalışmaya devam eder ve Drive'a yazar) |

Silmeden önce sahibe yazılacaklar: paket doğrulandı mı (§5.12), sırlar yeni makinede çalışıyor mu, sır döndürmesi (§9) yapıldı mı.

## 9. Bilinen riskler ve ölçülemeyenler

- **Taşıma provası (2026-11-07, bu makine, yalıtılmış kök).** Gerçek paketleme sahibin parolasıyla koştu: 7 parça, 18.933 dosya, sırlar AES256 doğrulandı, yaklaşık 3 dakika. Paketten kur: 7 parça sha256 tuttu, sırlar parolayla açıldı (33 dosya), git depoları bundle ve stash'leriyle kuruldu (venthub-hvac 83/83 stash). Provada çıkan ve düzeltilen üç kusur: (1) gpg (MSYS) argümandaki kesme işaretini siliyordu, `Drive'ım` yolu `Driveım` oldu; artık gpg'ye yol verilmez, stdin ve stdout kullanılır. (2) ingestor klonu 260 karakter sınırına takıldı (221 karakterlik yol + 44 karakterlik kök); klon artık `core.longpaths=true` ile alınıyor ve hata metninin sonu raporlanıyor. (3) Prova kökü `C:\tmp` altına kurulunca yol yazımı doğrulaması çevrilmiş yolu da eski yol saydı; `kur` artık eski bir kökün içine düşen yeni kökü baştan reddediyor. **Prova kökü eski köklerin DIŞINDA olmalı** (ör. `C:\tasima-prova`). Ölçülmedi: gerçek yeni makinede kurulum, Drive eşitleme süresi.
- **DPAPI sırları** (§2.2): yeni makinede açılmayabilir.
- **51 GB > 50 GB** kaygısı seçmeli paketle kalktı (2,4 GB tahmin); `--transkriptler` (15 GB) Drive'a sığmaz.
- **`~/.claude/projects` yol türevi:** kur yeniden adlandırır; `/resume` listesi transkript almadıkça boş başlar.
- **Sır kopyaları:** bir sır her kopyasıyla ayrı sayılır (ortam değişkeni, MCP, CI secret, `.env`, CLI oturumu). Taşıma sonrası sırların döndürülmesi sahip kararıdır; eski makinedeki kopyalar şirketin makinesinde kalır.
- **`.claude.json` içindeki hesap alanları** taşınır; Claude hesabı değişecekse giriş sonrası dosya kontrol edilir (ölçülmedi).
- **Dosya kilitleri:** Claude/MCP süreçleri dosyaları açık tutabilir; paketle okuma-yalnız çalışır, SQLite için tutarlı anlık görüntü alır; kilitli düz dosya "okunamadı" olarak KIRMIZI bildirilir.
- **Envanter dışı:** `~/claude-plugins` (9 KB, git değil), `~/` altındaki öteki projeler (§2.3); `.claude/blog-calisma` (28 KB) alınmadı.
- **`drive-yedek.cmd` içindeki Drive yolu** yeni makinede farklı olabilir: `--yol-esle` ile dönüştürülür ya da dosya elle düzeltilir.
- **Windows ACL:** `~/.ssh` anahtarlarının izinleri tar ile taşınmaz (Windows mod bitlerini yok sayar); OpenSSH izin hatası verirse `icacls "<ev>\.ssh" /inheritance:r /grant:r "%USERNAME%:F"`.
- **Uzun yol:** Windows 260 karakter sınırı; `git config --global core.longpaths true` ve `C:\tmp` gibi kısa kökler (§5.1).
- **Bundle büyüklüğü tahmini** kaba üst sınırdır (`git count-objects` toplamı); gerçek boyut paketle çıktısında yazar.

## 10. Tazelik

Bu belge taşıma günü **yeniden yazılmaz**; ölçüm komutları koşulur, fark doğru yere işlenir:

| Ne değişmiş olabilir | Ölçüm komutu | Fark nereye işlenir |
|---|---|---|
| Hangi dosyalar, ne kadar | `node scripts/tasima/paketle.cjs --hedef <Drive>\VentHub-Tasima` (kuru) | önce `scripts/tasima/envanter.cjs`, sonra §2 tablosu ve "Son ölçüm" tarihi |
| Git: ileri/stash/kirli | aynı kuru koşum "GİT DEPOSU" tablosu | §2.3 tablosu |
| Kanban/sage/posta/hafıza sayıları, araç sürümleri | `node scripts/tasima/dogrula.cjs` | karşılaştırma çıktısı yeterlidir; belgeye sayı yazılmaz (§5.12 karşılaştırma tazedir) |
| Boş yer | kuru koşum "SIĞAR MI" satırı | §2.1 toplam satırı |
| Zamanlanmış görevler | `schtasks /query /tn VentHub-Drive-Yedek /v /fo list` · `schtasks /query /tn OrionBoardSync /xml` | §3 ve §5.10 |
| Kurulum kimlikleri | `winget show --id <kimlik> --exact` | §6 tabloları |
| Günlük yedek sağlıklı mı | `<Drive>\VentHub-Tasima\yedek\gorev-gunlugu.txt` son satırları, `sage-yedek.cjs --liste` | §3 |

Kural: envanter dosyası ile tablo ayrışırsa dosya doğrudur; yeni bir yalnız-yerel veri kalemi bulunursa **önce `envanter.cjs`'e, sonra bu tabloya** eklenir ve kapı (`INV-TASIMA-1`) koşulur. "Son ölçüm" tarihi yalnız ölçüm koşulunca değişir.
