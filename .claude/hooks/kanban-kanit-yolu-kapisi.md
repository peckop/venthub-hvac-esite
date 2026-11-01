# kanban-kanit-yolu-kapisi (ARC-93 yol, ARC-78 komut)

**Ne yapar:** Kanban'a kanıt eklenirken (`add_check`, `update_check`) kanıtın doğrulayıcıda KOŞAMAYACAĞINI ekleme anında
yakalar, çağrıyı reddeder ve dört geçerli kanıt biçimini söyler:

- `file_exists` / `file_matches`: dosya yolu mutlak (`C:/...`, `/...`), `~` ile başlayan ya da proje kökünün dışına çıkan
  (`..`) ise reddedilir (ARC-93).
- `command` (`test` türü karışılmaz: gövdesi komut değil, test kalıbıdır): komut doğrulayıcının kendi kurallarına uymuyorsa reddedilir (ARC-78): engel listesindeki komut
  (`node`, `npm`, `pnpm` serbest hâli, `bash`, `curl`, `rm`, ...), izin listesinde olmayan komut (`git`), kabuk işleci
  (`&&`, `||`, `;`, `|`, `>`, `<`, `` ` ``, `$()`), ortam değişkeni açılımı (`$X`, `%X%`), yol içeren çalıştırılabilir,
  `pnpm test:ilgili`, `pnpm vitest`, `test -s`.
- `manual`, `metric` ve başka her çağrı sessiz geçer.

## Geçerli kanıt biçimleri (tek yer: `.claude/skills/wrongstack-kanban/SKILL.md` "Kanıt biçimleri")

1. PR işi: `command` `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge` (birleşmişse 204, değilse 404).
2. Kod işi: `command` `pnpm exec vitest run <proje-göreli test yolu>`.
3. Belge/dosya işi: `file_matches` `{"file":"<proje-göreli yol>","pattern":"..."}` (64 KiB sonrasını görmez).
4. Depo dışı iş (canlı yazım, ayar, Search Console): `manual` kontrol + karta kanıt notu (ölçüm çıktısı, kim onayladı, ne zaman).

## Niçin

**Yol (ARC-93).** `@wrongstack/kanban` `resolveProjectPath` yol mutlak ise kök kontrolünden ÖNCE `null` döner; proje
kökünün içindeki mutlak yol bile reddedilir (`File not found` / `Path escapes the project root`). 1.0.26 ve 1.0.36/37'de
aynı satır; yükseltme çözmez.

**Komut (ARC-78, OPS ölçümü 26 Ekim).** Doğrulayıcı arızalı değil, güvenlik politikası bilerek dar. Komut kart açılırken
kabul edilir, Done anında `verify_completion` reddeder. Kural kaynağı: `@wrongstack/kanban` `validateCommand`,
`parseConstrainedPnpmExec` ve çalıştırma şekilleri (1.1.x). İzin listesi sunucuyla aynı kaynaktan okunur: ortam
değişkeni `WRONGSTACK_KANBAN_VERIFIER_COMMANDS`, yoksa `.mcp.json` `wrongstack-kanban` env'i (bugün `+gh`). Liste
okunamazsa yalnız izin listesi denetlenmez; kesin engeller sürer.

`git` izin listesine EKLENMEZ: doğrulayıcı alt komut süzmez, `git push` ve `git reset` de koşabilir. `gh api` yetiyor.

## Kayıt

`.claude/settings.json` `PreToolUse`, matcher `mcp__wrongstack-kanban__kanban_manage`, komut
`node "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/kanban-kanit-yolu-kapisi.cjs"`. **Not (26 Ekim ölçümü):** ARC-93 kapısı
#1863 ile birleşti ama ayara HİÇ kaydedilmemişti (git geçmişinde kayıt yok); yani ekleme anında hiç çalışmadı. Kayıt
ARC-78 PR'ında yapıldı. Kapı kayıtlı değilken kural yine bu belgededir ama zorlanmaz.

## Test

- `src/__tests__/conformance/kanban-kanit-yolu-kapisi.test.ts` (INV-KANBAN-KANIT-YOLU-1)
- `src/__tests__/conformance/kanban-kanit-komut-kapisi.test.ts` (INV-KANBAN-KANIT-KOMUT-1): geçerli/geçersiz komut
  tablosu, sabotaj (engel listesi boşaltılmış, operatör denetimi kaldırılmış, pnpm kısıtı kaldırılmış kopya) ve SENTINEL:
  paket kuruluysa doğrulayıcının kendi `validateCommand`'ı ile karşılaştırma ve engel listesi eşitliği
  (`VH_KANBAN_PAKET` ile başka kurulum gösterilebilir). Paket sürümü kuralları değiştirirse test kırılır.
