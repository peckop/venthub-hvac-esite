# tools/wrongstack-mcp — çapalı hafıza + kod dizini (kilitli kurulum)

## KAYNAK / ALINAN / BİZDEN / ALINMAYAN

| | |
|---|---|
| **KAYNAK** | WrongStack (Ersin Koç) — `@wrongstack/sage-mcp@1.0.26`, `@wrongstack/codebase-index-mcp@1.0.26`, `@wrongstack/kanban-mcp@1.0.26`, `@wrongstack/mailbox-mcp@1.0.26` (09-27 1.0.19'dan yükseltildi), lisans **MIT** (npm `license` alanı; ilk ikisi 2026-09-17, son ikisi 2026-09-18 ölçüldü). |
| **ALINAN** | İki MCP sunucusu olduğu gibi: SAGE hafıza (bilgi dosyaya/sembole çapalı, hedef değişince yeniden doğrulanır) ve kod dizini (arama, paket/dosya/sembol grafiği). |
| **BİZDEN** | Kurulum biçimi (lock commit'li, kurulum betiği kapalı), kod dizininin **salt-okuma** kaydı, kalıcı servis ilanı, uyum testi `INV-WRONGSTACK-MCP-1`. |
| **ALINAN (skill, 09-28)** | `@wrongstack/core` 1.0.26'dan dört skill `.claude/skills/`'e: `verify-before-done`, `multi-agent`, `wrongstack-kanban`, `wrongstack-mailbox-mcp`. Gövde değiştirilmedi; her birinin başına **araç eşlemesi** (kaynaktaki `delegate`/`collab_debug`/`mcp_use`/`kanban` adlarının bizdeki karşılığı ya da YOK) + 12 maddelik **VentHub ek kuralları** eklendi, açıklama ≤300 karaktere yeniden yazıldı. `mailbox-bridge` ve `multi-agent/references/collab-debug.md` ALINMADI (bizde karşılığı yok). Karar 165 W3. |
| **ALINMAYAN** | WrongStack ajan ürünü (Claude Code'un alternatifi), WebUI/CodeMap, kod dizininin `--writable` yüzeyi. CodeGraph **yerinde kalır**; hangisinin kalacağı OPS kıyasıyla belli olacak (REC-345). |

Karar: Recep, OPS penceresi 2026-09-17 ("bence alalım, beklemeyelim") + ALTYAPI penceresinde teyit ("evet kur"). Kayıt: REC-345 Kova C.

## Niçin bu biçim (npx değil)

`npx -y paket@sürüm` yalnız üst paketi sabitler; **25 geçişli bağımlılık** (undici, playwright-core,
web-tree-sitter, @datadog/pprof …) her çözümde yeniden çözülür ve kurulum betikleri çalışır.
Burada `package-lock.json` commit'lidir, kurulum betiği kapalıdır, kurulum yeniden üretilebilir.
2026-09-17 ölçümü: lock'taki 25 paketin **hiçbirinde** kurulum betiği yok (`hasInstallScript`).

## Kurulum

Ana depo kökünde (kısa yol şart — derin Temp yolunda npm 5 dk takıldı, OPS ölçümü):

```bash
cd tools/wrongstack-mcp
npm ci --ignore-scripts
cd ../.. && for y in tools/wrongstack-mcp/yamalar/*.patch; do git -c core.autocrlf=false -c core.eol=lf apply "$y"; done
```

**Yamalar (`yamalar/`) kurulumun parçasıdır.** `npm ci` her koşuda paketi yeniden yazar ve yamayı
siler; bu yüzden ikinci satır atlanmaz. Yama uygulandıktan sonra MCP sunucusu yeniden bağlanana kadar
(`/mcp` → yeniden bağlan ya da pencere kapat-aç) eski kod bellekte koşar. Durum ölçümü (repo kökünden):
`git -c core.autocrlf=false -c core.eol=lf apply --reverse --check <yama>` çıkış 0 = uygulanmış (ya da
`node tools/wrongstack-mcp/kurulum.cjs --denetle`). Kapılar: `INV-WRONGSTACK-KANBAN-YAMA-1`,
`INV-WRONGSTACK-SAGE-YAMA-1`. Yama adı `<paket>-<sürüm>-<konu>.patch`; sürüm kurulu paketle uyuşmazsa
kurulum betiği `HATA` verir (önce kilit dosyasına bakar, hiçbir süreci durdurmadan).
**Bayrakların niçini (2026-09-30 ölçüldü):** düz `git apply` yama uygulanan dosyanın tamamını CRLF'e
çeviriyordu (depo içinde `.gitattributes` `*.js text` + Windows'ta `core.eol=native`; depo dışında sistem
`core.autocrlf=true`) ve geri alınca dosya bayt bayt eski hâle dönmüyordu. `core.autocrlf=false` tek başına
engellemez; `core.eol=lf` engeller. Canlı kanban-mcp `cli.js` bugüne kadar bu yüzden CRLF idi (545 CR).

### Sürüm yükseltme (ana depoda) — pencereler açıkken YAPILMAZ

Arka plan süreçleri (`project-server.js`) pencere kapanınca da ayakta kalır ve paket dosyalarını
açık tutar. Paketin içinde Windows için derlenmiş modül var; süreçler açıkken `npm ci` dosyaları
değiştiremeyebilir, değiştirse bile eski kod bellekte koşar (09-27: makinede 30 WrongStack süreci).
**Tek komut (OPS kararı 09-27):** `node tools/wrongstack-mcp/kurulum.cjs`. Açılış sırası:
1. Bütün Claude pencereleri kapalı.
2. YALNIZ ARAÇ penceresi açılır ve betiği koşar. Betik kendi penceresinin WrongStack sunucularını
   ve daemon'ları durdurur, `npm ci --ignore-scripts` koşar, yamaları uygular, doğrular.
   Başka pencereye ait sunucu görürse hiçbir şeye dokunmadan `HATA` der.
3. Son satır `HAZIR` → ARAÇ penceresi `/mcp` ile WrongStack sunucularını yeniden bağlar.
4. Öteki pencereler açılır.
`--denetle` yalnız doğrular (sürümler, yamalar, `.mcp.json` giriş dosyaları), hiçbir şey değiştirmez.
Kapı: `INV-WRONGSTACK-KURULUM-1` (başka pencere varken hiçbir süreç kapatılmaz).

1.0.19 → 1.0.26 ölçümü (2026-09-27): dört sunucu el sıkıştı. kanban 2 araç (1.0.26 istemci eski
1.0.19 daemon'una bağlanıp okudu), codebase-index 6, sage 15 (sage.db **kopyasında** arama),
mailbox 3. sage.db şeması değişmedi (`user_version` 0, 31 nesne, aynı imza). Yama yeniden üretildi
(satırlar kaydı, içerik aynı).

`pnpm` **kullanılmaz**: ana lockfile'a ve worktree'lerin `node_modules` bağına dokunmaz.
Sunucular `.mcp.json` ile kayıtlıdır; Claude Code proje sunucusunu ilk açılışta onaya sorar.

## Bilinen sınırlar (adıyla)

1. **Kalıcı servis.** MCP süreci bir IPC istemcisidir; SQLite'ın sahibi proje başına **ayrık bir
   daemon**dır (`project-server.js`) ve pencere kapanınca **ayakta kalır**. Bu tasarım gereğidir:
   üç pencere aynı daemon'u paylaşır. `--project-root .` bir worktree'den bile **ana depo** kimliğine
   bağlanır (2026-09-17 ölçüldü). Durdurmak gerekirse (Windows PowerShell):
   `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ? { $_.CommandLine -match 'wrongstack.*project-server' } | % { Stop-Process -Id $_.ProcessId }`
   Oturum sonu kancasına bağlanmadı: bir pencerenin kapanması öteki pencerelerin sunucusunu öldürürdü.
2. **Node sürümü.** `undici@8.10.2` `node >=22.19.0` istiyor; makinede 22.16.0 var (npm EBADENGINE
   uyarısı). Her iki sunucu 22.16'da el sıkışıp araç listesi döndü (ölçüldü); Node yükseltmesi ayrı iş.
3. **Veri iki ayrı yerde (2026-09-17 düzeltildi, önceki satır yanlıştı).** Kod dizini
   `~/.wrongstack/projects/<ad-hash>/codebase-index/` altında. **Sage hafızası ise PROJE DİZİNİNİN
   İÇİNDE**: `.wrongstack/memories/sage.db` (+ wal/shm, `server.json` yerel yetki anahtarı). Depo PUBLIC
   olduğu için `.gitignore`'da `.wrongstack/` satırı var ve INV-WRONGSTACK-MCP-1 bunu ölçer. Gerekçe:
   ikili SQLite dosyası (üç pencere yazar → git'te çakışır, diff okunmaz) · sır taraması ikili dosyanın
   içini göremez (hafızaya düşen sır/müşteri verisi kapıdan geçer) · içerik PR gözünden geçmeden yazılır.
   **Yedeği artık VAR (2026-09-18, #1267):** `node scripts/hijyen/sage-yedek.cjs` — `VACUUM INTO`
   ile WAL dahil tutarlı kopya, git dışı dizine, her koşumda kaynakla doğrulanır. ⚠Düz dosya
   kopyası yedek DEĞİLDİR: ölçüldü, 26 kaydın 20'sini veriyordu.
   **Kimlik harfe duyarlı:** `<ad-hash>` = sha256(`path.resolve(kök)`) ilk 6 hane; `c:\…` (VS Code) →
   `7e017f`, `C:\…` (terminal) → `1088d5`. Kanonik kimlik küçük harfli olandır; sage bundan etkilenmez
   (verisi proje dizininde).
4. **Dizin tazeleme.** Kod dizini salt-okuma kayıtlı; yeniden dizinleme `--writable` ister ve bu
   yüzey bilinçli kapalı. Tazeleme ayrı, elle koşan komut olarak gelecek (REC-345).
5. **Companion `.md` gürültüsü.** Sembollerin çoğu üretilmiş `.md` dosyalarından (OPS: 43 bin sembolün
   28,9 bini). Aramada dil süzgeci kullan.
6. **Bağlam yükü.** Kayıtlı araç sayısı: sage 15, dizin 6 (salt-okuma) — her pencerenin bağlamına biner.
   Kanban eklenince bu sayı artar; pilot değerlendirmesinde **ölçülecek** kalem budur.
7. **Kanban (2026-09-18, karar 46 — pilot).** `--writable` AÇIK, `--destructive` **KAPALI**
   (silme/birleştirme/devretme yüzeyi pilot kapsamında değil). Doğrulayıcının varsayılan izin
   listesi **çok dar** ölçüldü: `["pwd","true","false","test"]` — yani izin genişletilmeden
   "Done = kanıt" kuralı hiçbir gerçek komut koşturamaz. Bu yüzden `.mcp.json`'da
   `WRONGSTACK_KANBAN_VERIFIER_COMMANDS=+gh`. Dilbilgisi ölçüldü: `+x` ekler, `-x` çıkarır, çıplak
   `x` de ekler; `BLOCKED_COMMANDS` (rm, curl, wget, npm/npx/pnpm/yarn/bun, node, kill, diskpart …)
   **her hâlde üstündür** ve `gh` o listede yok. `git` yasak değil — kanban kendi git kanıtını
   doğrudan `spawn("git", …)` ile alıyor.
8. **Mailbox KAYITLI (2026-09-21, karar 54 — pilot).** Sunucu zorunlu `--actor <id>` istiyor;
   `.mcp.json` ise **bütün pencerelerin paylaştığı tek dosya**. Sabit actor = bütün pencereler aynı
   kimlik = mesaj yanlış pencereye düşer. `--writable` açık, `--admin` **kapalı**.
   **⛔İLK DENEME DÜŞTÜ (#1287):** `.mcp.json`'a `--actor ${CLAUDE_CODE_SESSION_ID}` yazıldı; kapat-aç
   sonrası iki pencerede (OPS, ALTYAPI) agentId **düz metin** `${CLAUDE_CODE_SESSION_ID}` geldi —
   değişken GENİŞLEMEDİ ve sunucu yine de AÇILDI ("ulaşmazsa açılmaz" varsayımı yanlıştı).
   **Çare: `posta-kutusu.cjs` sarmalayıcısı.** Kimliği sırayla (1) UUID biçimli
   `CLAUDE_CODE_SESSION_ID`'den, (2) ebeveyn Claude sürecinin `~/.claude/sessions/<ppid>.json`
   dosyasındaki `sessionId`'den alır (ölçüldü: MCP'nin ebeveyni = `CLAUDE_PID`); bulamazsa **çıkış 1**,
   kutu açılmaz. (2) Claude Code'un **iç dosyası**, belgelenmiş arayüz değil — biçimi değişirse kutu
   kapanır, yanlış kimlikle açılmaz. `.mcp.json`'a `--actor`/`${` yazılması INV-WRONGSTACK-MCP-1'de KIRMIZI.
   **Pencere içi ölçüm (2026-09-21, #1288 sonrası kapat-aç) ✔:** OPS ve ALTYAPI tam UUID'lerini aldı,
   kutudan karşılıklı mesaj ulaştı. **Alıcı = TAM oturum numarası** — kısa 8 hane hata vermeden DÜŞER.
   Filtresiz `query` herkesin mesajını listeler ve alıcı denetimi yoktur (başkasının mesajı ack
   edilebiliyor) → kutuya sır ve Recep onayı yazılmaz.
   **⛔İKİ KUTU TUZAĞI (ölçüldü):** kutu deposu kök yolunun karmasından türüyor ve sürücü harfine
   duyarlı — `c:\…` → `~/.wrongstack/projects/venthub-hvac-7e017f` (pencereler), `C:\…` → `…-1088d5`.
   Worktree kökünü sunucu git ile ana ağaca çevirip büyük `C:` veriyor → yine 1088d5. Sarmalayıcı
   (`kanonikKok`) kökü ana ağaca çözüp harfi küçültür. **Terminalden elle kutu sunucusu başlatırken
   kök daima `c:\Users\…\venthub-hvac` (küçük) verilir**, yoksa mesaj pencerenin görmediği kutuya düşer.
   **Açılış sayacı:** `scripts/hijyen/posta-kutusu-sayac.cjs`, SessionStart'ta `session-board.cjs`
   çağırır; okunmamış > 0 ise "📬 KUTUNDA OKUNMAMIS N", ölçülemezse uyarı satırı. Kendi gönderdiğin
   mesaj sayılmaz (ölçüldü).
   **Ölçülen (sahte kimliklerle gerçek sunucu):** A gönderip kapandı → sonra açılan B okunmamış 1
   gördü (kapalı pencereye mesaj DURUYOR); C'ye giden mesaj B'nin kutusuna düşmedi (B 0, C 1);
   `--project-root .` worktree'den de ana ağacın kutusunu açıyor (tek kutu). **Bilinen bayatlık:**
   kapanan sürecin `agents` kaydı `online:true` kalıyor → canlılık bu listeden OKUNMAZ, pano `who`
   kullanılır. **Pencere içi ölçüm açık:** genişleme + kimliğin MCP sürecine ulaşması + iki pencerenin
   farklı kimlik alması, ana ağaç güncellenip pencereler kapatılıp açıldıktan sonra ölçülür.
   `INV-WRONGSTACK-MCP-1` kaydı ve kimlik biçimini kolla tutar.
9. **Kanban yazma dönüşü tüm panoyu taşıyordu → yamalı (2026-09-27, karar 144, REC-391 K1).**
   `kanban-mcp` `callTool` sonucu `{ content: result }` diye olduğu gibi döndürüyor; aracın kendi
   özet kesicisi (`kanbanTool.serialize` → pano okumayan eylemde panoyu {sütun → kart sayısı}
   özetine indirir) MCP yolunda **hiç çağrılmıyor**. 1.0.26'da da aynı satır (ölçüldü). Bedel:
   47 KB'lık panoda her `add_task`/`add_note`/`transition_task` 48,6 KB dönüyordu.
   `yamalar/kanban-mcp-1.0.26-ozet-donus.patch` başarılı sonucu kesiciden geçirir; kesici girintili
   metin döndürdüğü için sonuç `JSON.parse` ile nesneye çevrilir, sunucu sıkı biçimde yazar.
   Yalnız panoyu döndüren eylemlerde (`add_note`, `update_task`, `move_task`, `assign_task`…)
   özet kartı da kaybettirirdi; yama `args.taskId` kartını özetin yanına koyar.
   ⛔**Yama İKİ dosyaya uygulanır: `dist/cli.js` ve `dist/index.js`.** `.mcp.json`'ın çalıştırdığı
   `cli.js`, callTool'un kendi kopyasını taşır ve index.js'i yüklemez. İlk yama (#1437) yalnız
   index.js'e uygulandı, kapı yeşildi, canlıda hiçbir şey değişmedi (09-27 akşam ölçüldü). Kapı artık
   hedef dosyayı `.mcp.json`'dan okur.
   Ölçüm (gerçek pano, yamalı cli.js stdio, 23 kart): `add_task` 58 KB → **1.297** bayt,
   `add_note` → **1.778** bayt (etkilenen kart dahil), `get_board` 58.750 → 58.750 (değişmez).
   Hata sonucu (`ok:false`) kesiciye girmez. Sürüm yükseltilince yama adı ve içeriği yeniden ölçülür;
   kapı sürüm uyuşmazlığında KIRMIZI verir. Yukarı akış kaydı: WrongStack GitHub issue.
10. **Sage alan-terimi çıkarıcısı Türkçe harfleri atıyordu → yamalı (2026-09-30, REC-519 kapsam 4).**
   `@wrongstack/sage` `SageDomainTermExtractor` yalnız ASCII varsayar: `normalizeTerm("Şerit")` → `"erit"`,
   `("çıktı")` → `"kt"`, `("ığış")` → boş anahtar; "İstanbul Şubesi Müdürü" hiç aday olmaz, "ÇıkışKapısı"
   camelCase sayılmaz, Türkçe harfle biten terimin tanım cümlesi bulunmaz (`\b` ASCII-sözcük tanımlıdır).
   `yamalar/sage-1.0.26-domain-terms-turkce.patch` yedi satırı Unicode sınıflarına (`\p{L}` `\p{Lu}` `\p{Ll}`),
   girdiyi ve anahtarı NFC'ye çevirir ve "İ"nin küçük harfinin ürettiği birleşik noktayı (U+0307) siler; İngilizce
   sonuç değişmez (aynı terimler, aynı güven). Tek dosya: `dist/index.js` — `sage-mcp` kendi kopyasını taşımaz,
   `@wrongstack/sage`'i içe aktarır (ölçüldü). ⚠Bugün hiçbir VentHub süreci bu çıkarıcıyı ÇAĞIRMIYOR (`sage-mcp`
   araçlarında yok; yalnız kütüphane dışa aktarımı) — yama, çıkarıcıyı kullanacak iş için hazır tutulur, sunucu
   davranışını şimdi değiştirmez. **Bilinen sınır:** anahtar yerel-bağımsız küçültülür, yani "Işık" → `işık`,
   "ışık" → `ışık` (ayrı anahtar); `toLocaleLowerCase('tr')` İngilizce "INDEX"i bozacağı için kullanılmadı.
   **Ne zaman düşer:** `sage` sürümü 1.0.26'dan kayınca yama uymaz; `kurulum.cjs` sürüm farkını adıyla söyler,
   yama yeni sürümde yeniden üretilir (kaynak satırlar `extractCandidatesFromMessage`, `hasCamelBoundary`,
   `normalizeTerm`) ya da yukarı akış düzeltince silinir. Kapı `INV-WRONGSTACK-SAGE-YAMA-1` (yamasız/yamalı kopya
   karşılaştırması + sunucunun yüklediği dosya).
11. **Alt süreç `process.env` KALITIR.** Doğrulayıcı komutları bunu miras alır. Azaltma: komut
   kümesi `gh` ile sınırlı ve ağ/paket komutları yasak listesinde. Ama bu bir **azaltmadır**,
   sıfırlama değil — kart açıklamasına ve doğrulayıcı komutuna sır yazılmaz.
