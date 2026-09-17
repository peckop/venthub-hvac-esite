# tools/wrongstack-mcp — çapalı hafıza + kod dizini (kilitli kurulum)

## KAYNAK / ALINAN / BİZDEN / ALINMAYAN

| | |
|---|---|
| **KAYNAK** | WrongStack (Ersin Koç) — `@wrongstack/sage-mcp@1.0.19`, `@wrongstack/codebase-index-mcp@1.0.19`, lisans **MIT** (npm `license` alanı, 2026-09-17 ölçüldü). |
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
3. **Veri git dışında.** Hafıza ve dizin `~/.wrongstack/projects/<ad-hash>/` altında. Hafıza yedeği
   kancası bu dizini (yalnız sage veritabanı) kapsamıyor — kullanıcı ayarı, ALTYAPI'nın dosyası değil.
4. **Dizin tazeleme.** Kod dizini salt-okuma kayıtlı; yeniden dizinleme `--writable` ister ve bu
   yüzey bilinçli kapalı. Tazeleme ayrı, elle koşan komut olarak gelecek (REC-345).
5. **Companion `.md` gürültüsü.** Sembollerin çoğu üretilmiş `.md` dosyalarından (OPS: 43 bin sembolün
   28,9 bini). Aramada dil süzgeci kullan.
6. **Bağlam yükü.** Kayıtlı araç sayısı: sage 15, dizin 6 (salt-okuma) — her pencerenin bağlamına biner.
