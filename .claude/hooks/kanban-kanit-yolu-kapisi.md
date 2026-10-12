# kanban-kanit-yolu-kapisi (ARC-93)

**Ne yapar:** Kanban'a `file_exists` ya da `file_matches` kanıtı eklenirken (`add_check`, `update_check`) dosya yolu
mutlak (`C:/...`, `/...`), `~` ile başlayan ya da proje kökünün dışına çıkan (`..`) ise çağrıyı reddeder ve üç çalışan
yolu söyler. Göreli yol ve diğer her kontrol tipi sessiz geçer.

## Niçin

WrongStack kanban doğrulayıcısı (`resolveProjectPath`, `@wrongstack/kanban` dist/index.js) yol mutlak ise kök
kontrolünden ÖNCE `null` döner. Yani proje kökünün içindeki mutlak yol bile reddedilir:

| Kanıt tipi | Mutlak yolla görünen hata | Gerçek durum |
|---|---|---|
| `file_exists` | `File not found: <yol>` | dosya diskte var |
| `file_matches` | `Path escapes the project root: <yol>` | dosya kök içinde de olabilir |

Ölçüm 10-11 (ARAÇ): 1.0.26'da satır 6208; 1.0.36 ve 1.0.37 paketlerinde AYNI satır (yükseltme çözmez).
Önceki belirti kayıtları: sage 01M4GRHF… (10-09) ve 01M4JM2Q… (10-10); URN-104'te OPS'a bildirildi.

## Kural (kanıt yolu)

1. Depo içindeki dosya: **repo-göreli** yaz (`docs/audits/x.md`). Kök, MCP sunucusunun `--project-root .` değeridir
   (oturumun çalışma dizini; worktree'de o worktree).
2. Depo dışındaki dosya (`C:/tmp/...`): kanıt kopyasını depo içi `tmp/` altına (gitignored) yaz ve onu göster;
   kalıcı kopya ayrıca tutulur. Olmuyorsa `manual` kontrol yaz ve karta `ls -l` çıktısını not düş.
3. PR/merge kanıtı: `command` tipinde `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`.

## Kayıt

`.claude/settings.json` içine `PreToolUse` altında, matcher `mcp__wrongstack-kanban__kanban_manage`, komut
`node "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/kanban-kanit-yolu-kapisi.cjs"`. Ayar dosyası OPS kapısıdır; kayıt metni
PR gövdesinde. Kapı kayıtlı değilken kural yine bu belgededir ama zorlanmaz.

## Test

`src/__tests__/conformance/kanban-kanit-yolu-kapisi.test.ts` (INV-KANBAN-KANIT-YOLU-1).
