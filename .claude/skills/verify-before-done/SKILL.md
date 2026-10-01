---
name: verify-before-done
description: "\"Bitti/düzeldi/çalışıyor\" demeden önce projenin kendi kontrolleriyle kanıtla ve neyin doğrulanıp neyin doğrulanmadığını yaz. Tetik: iş bitişi, son özet, \"test ettin mi\", \"merge hazır\". WrongStack 1.0.26 uyarlaması."
category: coordination
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/verify-before-done/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "ARAÇ 2026-09-28 (karar 165 W3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/verify-before-done/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| "project's own checks" | `pnpm type-check`, `pnpm lint`, `pnpm test -- --run`, ilgili `src/__tests__/conformance/*`; PR'da `gh pr checks` |
| verification.run / execution.shell | Bash aracı |
| Kanban "verified" | `kanban_manage` doğrulayıcısı (kural 7) |
| `codebase-targeted-test`, `codebase-impact-analysis` araçları | Yok. Etkilenen test: değişen dosyanın yanındaki / `src/__tests__/conformance/` altındaki ilgili test; çağıranlar: `graphify affected "sembol()"` (parantez şart) ya da `codegraph_explore` |
| "migration applied and rolled back locally" (Public API, schema satırı) | Bizde yerel Supabase yığını (Docker) **yok**, adım uygulanamaz. Yerine: `create-migration` zinciri + `plan-challenger`, prod'a karşı **yalnız okuma** sorgusuyla kanıt; "uygulandı" ancak merge sonrası ve ölçülerek yazılır (kural 13: merge prod'a otomatik yazar) |
| "Clean install from the lockfile" | `pnpm install --frozen-lockfile --offline` (karar 88) |
| UI kanıtı ("rendered at the relevant widths…") | `qa` skill'i (gerçek tarayıcıda gezip kanıt üretir) |
| Gövdedeki "Skills in scope" atıfları (`testing`, `debugging`, `git-flow`) | Bu üçü WrongStack alımının 2. paketiyle depoya geldi; atıflar çalışır |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kimlik** yalnız `tools/wrongstack-mcp/posta-kutusu.cjs` sarmalayıcısından gelir. `.mcp.json`'a `--actor` ya da `${...}` yer tutucusu yazılmaz (genişlemiyor, bütün pencereler aynı kimliğe düşüyor).
2. **Posta alıcısı** daima TAM oturum kimliğidir (36 karakter). 8 haneli kısa kimliğe giden mesaj hata vermeden kaybolur.
3. `--admin` ve `--destructive` bayrakları KAPALI kalır; kaynak metindeki örnek yapılandırmalar bizde uygulanmaz.
4. Kutuya ve karta **sır** (anahtar, parola, token) ve **Recep onayı** yazılmaz. Onay yalnız Recep'in kendi penceresinde verilir. Tek ayrı yol (karar 224): canlı DIŞI işte OPS, Recep'in OPS'ta verdiği evetin sözünü ve saatini OPS panosundaki onay kartına yazar; onayı orada doğrularsın. Canlı iş (migration'lı PR, sır/anahtar/parola, geçmişi silen git, canlı veritabanı yazımı, para harcatan her şey) bunun dışındadır: onay yine yalnız Recep'ten gelir.
5. `*_watch` çağrısı kanıt değildir; durum `mailbox_read` / `kanban_read` ile okunarak doğrulanır.
6. Pano (kanban) Linear'ın YANINDA pilottur. İş emrinin tek kaynağı **Linear**'dır; karttaki bilgi Linear'ı geçersiz kılmaz.
7. "Bitti" doğrulayıcı komutu `gh` ile sınırlıdır ve sır içermez.
8. Kanban yaması `cli.js` + `index.js` dosyalarında (`tools/wrongstack-mcp/yamalar/`). Sürüm yükselince yamanın hâlâ tuttuğu yeniden ölçülür.
9. `mailbox-bridge` kullanılmaz (HTTP köprüsü; bizde kapalı).
10. Ops'a rapor dört alanlı etiketle gider (NE · DURUM · KANIT · KİMDE). Kaynak metindeki `<nextsteps>` biçimi bunun ekidir, yerine geçmez.
11. **İzin bilgisi** (kim neye yetki verdi) pencere mesajından hafızaya ya da durum dosyasına KOPYALANMAZ. Tek kaynak `~/.claude/settings.json`; en fazla "bkz. settings.json autoMode, <tarih>" yazılır.
12. **Pencereler arası mesaj ≤800 karakter.** Mesaj yalnız ADRES (dosya/Linear) + hüküm + istek taşır; ayrıntı dosyada ya da Linear'dadır. Recep'e giden metin bu sınırın DIŞINDADIR (tam cümle kuralı).

---


# Verify Before Done

## Overview

"Done" is a claim the user acts on: they merge, deploy, or stop looking. This
skill makes the claim evidence-based — the change does what was asked, nothing
adjacent broke, and the report says precisely what was checked. It costs
minutes; a false "done" costs the user's trust and often an incident.

## Rules

1. Re-read the request and check the change against every part of it, including
   the easy-to-forget parts: docs, config, migrations, other platforms.
2. Review your own diff before reporting — unintended edits, leftover debug
   code, commented-out code, new TODOs, secrets, files from unrelated work.
3. Run the checks that apply, cheapest first: format and lint, type check,
   targeted tests, the suites for touched packages, build. Use the project's own
   commands from package scripts, Makefile, or CI config.
4. Exercise the behaviour itself when no test covers it: run the command, call
   the endpoint, open the page. A passing unrelated suite is not evidence.
5. Read results instead of trusting exit codes. Zero tests run, skipped suites,
   disabled checks, and cached results are not passes.
6. Fix failures you caused. Show pre-existing failures are pre-existing (they
   fail on the base too) and report them; never weaken a check to get green.
7. Report faithfully: what ran and its outcome, what couldn't be verified and
   why, and known gaps. Never write "should work" in place of checking, and
   never claim a check that didn't run.

## Workflow

1. **Requirements** — list each requested outcome and the evidence for it.
2. **Diff** — `git status` and the full diff; every hunk belongs to the task.
3. **Static checks** — lint, format, type check (the lint and typecheck tools
   where available).
4. **Tests** — targeted first (the codebase-targeted-test tool finds tests
   covering changed symbols), then the suites for touched packages. New
   behaviour has a test.
5. **Behaviour** — run it for real when feasible.
6. **Blast radius** — for changed signatures and contracts, check callers (the
   codebase-impact-analysis tool when indexed) and build the dependents.
7. **Report.**

## Minimum evidence by change type

| Change | Evidence |
|---|---|
| Bug fix | Reproduction fails before and passes after; regression test red then green |
| New feature | Tests for the main path and one error path; the user-facing flow run once |
| Refactor | Existing tests pass without being edited; type check clean |
| Public API, schema, config | Consumers build; migration applied and rolled back locally |
| UI | Rendered at the relevant widths; interactive states work; no console errors |
| Dependency update | Clean install from the lockfile, build, full test suite; breaking changes in the changelog reviewed |
| Docs only | Links and code samples still valid |

## Report

```text
Done: charges now retry with an idempotency key, so a timeout can't double-charge.

Verified
- `pnpm --filter billing test` — 48 passed, including the new retry test (failed before the fix)
- Type check — clean
- `app charge --dry-run` on the fixture order — one charge request with the expected key

Not verified
- End-to-end suite (needs staging credentials)

Notes
- reports.spec.ts fails on main with the same error; unrelated and left untouched.
```

## Anti-patterns

- **"Done — should work"** with nothing run.
- **A filtered, cached, or partial run** reported as the full suite.
- **Editing or skipping a test** to make it pass.
- **A failure buried** in the middle of a long summary.
- **"Pre-existing failure"** claimed without checking the base.
- **Stopping at "it compiles".**

## Before returning

- [ ] Every requested outcome maps to evidence
- [ ] Own diff reviewed; nothing unrelated or left over
- [ ] Applicable checks run with the project's commands, results read
- [ ] Behaviour exercised directly where tests don't cover it
- [ ] Report separates verified, not verified, and pre-existing issues

## Skills in scope

- `testing` — for the tests the evidence needs
- `debugging` — when verification turns up a failure with an unknown cause
- `code-review` — for a self-review pass on a larger diff
- `git-flow` — for committing once the change is verified

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
