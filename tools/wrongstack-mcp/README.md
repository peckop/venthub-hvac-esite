# tools/wrongstack-mcp — çapalı hafıza + kod dizini (kilitli kurulum)

## KAYNAK / ALINAN / BİZDEN / ALINMAYAN

| | |
|---|---|
| **KAYNAK** | WrongStack (Ersin Koç) — `@wrongstack/sage-mcp@1.0.19`, `@wrongstack/codebase-index-mcp@1.0.19`, `@wrongstack/kanban-mcp@1.0.19`, `@wrongstack/mailbox-mcp@1.0.19`, lisans **MIT** (npm `license` alanı; ilk ikisi 2026-09-17, son ikisi 2026-09-18 ölçüldü). |
| **ALINAN** | İki MCP sunucusu olduğu gibi: SAGE hafıza (bilgi dosyaya/sembole çapalı, hedef değişince yeniden doğrulanır) ve kod dizini (arama, paket/dosya/sembol grafiği). |
| **BİZDEN** | Kurulum biçimi (lock commit'li, kurulum betiği kapalı), kod dizininin **salt-okuma** kaydı, kalıcı servis ilanı, uyum testi `INV-WRONGSTACK-MCP-1`. |
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
```

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
   kimlik = mesaj yanlış pencereye düşer. Bu yüzden `--actor ${CLAUDE_CODE_SESSION_ID}` (pencere
   başına), **varsayılansız**: değişken ulaşmazsa yalnız bu sunucu açılmaz; `:-x` varsayılanı ise
   bütün pencereleri sessizce `x` yapardı. `--writable` açık, `--admin` **kapalı**.
   **Ölçülen (sahte kimliklerle gerçek sunucu):** A gönderip kapandı → sonra açılan B okunmamış 1
   gördü (kapalı pencereye mesaj DURUYOR); C'ye giden mesaj B'nin kutusuna düşmedi (B 0, C 1);
   `--project-root .` worktree'den de ana ağacın kutusunu açıyor (tek kutu). **Bilinen bayatlık:**
   kapanan sürecin `agents` kaydı `online:true` kalıyor → canlılık bu listeden OKUNMAZ, pano `who`
   kullanılır. **Pencere içi ölçüm açık:** genişleme + kimliğin MCP sürecine ulaşması + iki pencerenin
   farklı kimlik alması, ana ağaç güncellenip pencereler kapatılıp açıldıktan sonra ölçülür.
   `INV-WRONGSTACK-MCP-1` kaydı ve kimlik biçimini kolla tutar.
9. **Alt süreç `process.env` KALITIR.** Doğrulayıcı komutları bunu miras alır. Azaltma: komut
   kümesi `gh` ile sınırlı ve ağ/paket komutları yasak listesinde. Ama bu bir **azaltmadır**,
   sıfırlama değil — kart açıklamasına ve doğrulayıcı komutuna sır yazılmaz.
