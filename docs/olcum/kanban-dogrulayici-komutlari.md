# Ölçüm defteri: Kanban doğrulayıcı komut kapısı — hangi kanıt komutu geçer (ARC-123)

Sahibi: ARAÇ · Ölçüm: 2026-10-12 · Kaynak: Ürün'ün bulgusu (OPS aktardı): "node, curl ve boru işareti engelli, yalnız gh geçiyor".

**Kural (README ile aynı):** kart kanıtı yazmadan önce bu defter okunur; yeniden ölçüm yalnız paket sürümü değişince.

## Ne ölçüldü

`tools/wrongstack-mcp/node_modules/@wrongstack/kanban/dist/project-server.js` (1.1.0, satır 5095-5357) ile 1.0.26 kopyası (`vh-arac94-olcum/v1.0.26`) kaynak düzeyinde karşılaştırıldı; `verify_completion` canlı kartlarda koşuldu (ARC-117, ARC-79, ARC-32, REC-488, REC-546).

## Komut kanıtı (`command`) kuralı

| Komut sınıfı | Sonuç | Not |
|---|---|---|
| `pwd`, `true`, `false`, `test` | **geçer** | varsayılan izin listesinin tamamı bu dört komut |
| `gh ...` | **geçer** | yalnız `.mcp.json` `WRONGSTACK_KANBAN_VERIFIER_COMMANDS=+gh` ile; env'i taşımayan daemon'da reddedilir (13:51-15:30 olayı) |
| `pnpm exec tsc --noEmit --project <göreli yol>` | **geçer** | kısıtlı biçim, başka bayrak yok |
| `pnpm exec vitest run [--root .] <*.test.* yolları>` | **geçer** | yollar proje göreli ve `.test.` içermeli |
| `node`, `npm`, `npx`, `pnpm` (genel), `curl`, `wget`, `bash`, `sh`, `powershell`, `tar`, `base64` ve 121 komutluk listenin geri kalanı | **engelli** | engel listesi KESİN öncelikli: `+node` ile açılamaz |
| izin listesinde olmayan her komut (`git` dahil: engel listesinde yok ama izin listesinde de yok) | **reddedilir** | "is not in the verifier allowlist" |
| `;`, `&&`, `\|\|`, `\|`, `>`, `<`, backtick, `$()`, `$DEĞİŞKEN`, `%VAR%` | **reddedilir** | komut düzeyinde, boru/zincir yok |

## 1.0.26 ile karşılaştırma

Kural **1.1.0 ile gelmedi**: izin listesi, 121 komutluk engel listesi, kısıtlı `pnpm exec`, kabuk işleci ve ortam değişkeni genişleme kuralları 1.0.26 ile birebir aynı. Yani `node` ve `curl` komut kanıtı 1.0.26'da da geçmiyordu; yükseltme bir şeyi bozmadı.

## Komut dışı kanıt türleri

| Tür | Ne okur | Sınır |
|---|---|---|
| `file_exists` | proje göreli yol | proje kökü dışı yol REDDEDİLİR ("Path escapes the project root"); dışarıdaki dosya `needs_human` olur |
| `file_matches` | proje göreli dosya + desen | dosyanın ilk 64 KB'ı; desen dosya sonundaysa bulunamaz (ARC-109 dersi) |
| `manual` | insan/ajan adımı | `verify_completion` bunu `passed` saymaz, `needs_human` verir |

## Canlı sayfa ya da dosya kanıtı nasıl verilir

Komutla verilemiyorsa üç yol (öncelik sırasıyla):

1. **CI'da koşan test ya da workflow**: ölçüm Actions'ta koşar, kart `gh run view <id> --json conclusion` ya da `gh api repos/<depo>/actions/runs/<id>` ile sonucu okur (`+gh` açık).
2. **Ölçüm dosyası**: betik ölçümü depoda izlenen bir `docs/olcum/...` dosyasına yazar (PR ile), kart `file_matches` ile okur.
3. **`manual` + insan adımı**: kanıt kart notuna yazılır, `needs_human` kalır; yalnız ölçüm çok pahalı ya da canlı oturum gerektiriyorsa.

## Kartı kapatma yolu

- `transition_task` bu panoda **REFUSED** ("Strict Kanban Agent transitions require a managed board"): pano yönetilen değil.
- Çalışan yol: `verify_completion` → `passed` ise `move_task` (`targetColumnId: done`, `author`).
- `move_task` kendisi doğrulama kapısı koymaz; `verify_completion`'ı atlayıp Done yapmak araç düzeyinde mümkündür ve yalnız disiplinle önlenir. ARC-123'ün devamı: `verify passed` olmadan `move_task` atmayan sarmalayıcı (`kanban-toplu.cjs` kapatma kipi).

## Bu defteri değiştiren şeyler

- `@wrongstack/kanban` sürümü değişirse engel listesi ve izin listesi yeniden karşılaştırılır (`DEFAULT_ALLOWED_COMMANDS`, `DEFAULT_BLOCKED_COMMANDS`).
- `.mcp.json` içindeki `WRONGSTACK_KANBAN_VERIFIER_COMMANDS` değişirse `gh` satırı güncellenir.
