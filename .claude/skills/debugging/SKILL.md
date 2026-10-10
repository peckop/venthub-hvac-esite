---
name: debugging
description: "Nedeni bilinmeyen bozukluk (kırmızı test, çökme, yanlış çıktı, regresyon): kök sebebi bul, tek değişiklik yap, regresyon testi kırmızıdan yeşile. Tetik: \"neden bozuk\", \"stack trace\", \"dün çalışıyordu\", \"hata ayıkla\". WrongStack 1.0.26 uyarlaması."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/debugging/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/debugging/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `codebase-context` / `codebase-search` / `codebase-stats` | `codebase_context` / `codebase_search` / `codebase_stats` (tire yerine alt çizgi; `mcp__wrongstack-codebase-index__*`) |
| `codebase-repo-map` | `codebase_package_graph` ya da `graphify` |
| `codebase-incoming-calls` / `codebase-outgoing-calls` | `codebase_symbol_graph` ya da `codegraph_explore` |
| `codebase-impact-analysis` | `graphify affected "sembol()"` (**parantez şart**: parantezsiz "No unique node match" verir) |
| `codebase-targeted-test`, `codebase-skeleton` | Yok. Kapsayan testi değişen dosyanın yanında / `src/__tests__/` altında elle bul; iskelet için aralıklı `Read` |
| `<nextsteps>` etiketi | **Hiç üretilmez.** Bizde ayrıştırıcı yok; Recep'e rapor akan cümledir |
| `investigate` skill'i ile ilişki | `investigate` yalnız TEŞHİS eder; `debugging` düzeltmeyi ve regresyon testini de kapsar. İkisi birlikte kullanılırsa `investigate`'in **"arıza anında CANLIYA sorgu yasak"** kuralı kazanır |
| `git bisect` | Kullanılabilir; ayrı worktree'de koş (ortak ağaçta başkasının işini bozma); `git-flow` skill'i bu alımla gelir |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Canlı veritabanına, ödeme sağlayıcısına ya da gerçek müşteri verisine "hata ayıklamak için" yazma/deneme yapılmaz; yalnız okuma ve yerel/yalıtılmış kanıt.
2. Düzeltmenin kanıtı: düzeltmeden ÖNCE kırmızı, SONRA yeşil çıktı (`verify-before-done`).

---

# Debugging

## Overview

Debugging is a search for the first point where reality diverges from
expectation. It goes fast when every step narrows the search with evidence, and
slowly when it guesses and patches symptoms. The deliverable is a fix at the
cause, a test that fails without it, and an explanation that accounts for every
observation.

This skill starts from an observed failure. Scanning code for defects nobody has
reported yet is `bug-hunter`.

## Rules

1. Reproduce before fixing. Get a command, test, or input that shows the failure
   on demand. If that isn't possible yet, the first job is making it
   reproducible — logs, inputs, environment — not changing code.
2. Read the whole error. The top of a stack trace is where the failure surfaced;
   the cause is often further down: a `Caused by`, the first frame in project
   code, or the earliest error in the log.
3. Form a hypothesis that explains every symptom, then run the cheapest
   experiment that could prove it wrong.
4. Change one thing at a time, and keep a short log of what was tried and what
   it showed.
5. Fix the cause, not the symptom. Swallowing the error, widening a type, adding
   a retry, or special-casing the failing input is only right when that really is
   the correct behaviour.
6. Prove the fix: the reproduction passes, a regression test fails without the
   fix, and neighbouring tests still pass.
7. Remove temporary instrumentation before finishing.
8. After three disproven hypotheses, step back. Re-check the assumptions — right
   file, right build, right branch, right environment — or bisect.

## Workflow

1. **Capture** the exact error text, command, input, environment, and what
   changed recently (history, dependency bumps, configuration).
2. **Reproduce** with the smallest command that fails — ideally one test.
3. **Localize**:
   - follow the stack trace to the first project frame and read it;
   - trace a wrong value backwards to where it first became wrong;
   - with the codebase index, the codebase-incoming-calls and
     codebase-outgoing-calls tools show how the failing code is reached, and
     codebase-context finds code from a description of the behaviour;
   - if it used to work, bisect with the reproduction as the test;
   - if the search space is large, halve it: add a checkpoint in the middle, or
     disable half of the suspects.
4. **Explain** the cause in one or two sentences that cover every symptom,
   including "why only sometimes" and "why only here".
5. **Fix** at the cause with a minimal diff.
6. **Verify**: the reproduction passes; the regression test goes red then green;
   covering tests (the codebase-targeted-test tool finds them) and the type
   checker pass.

## First moves by symptom

| Symptom | First moves |
|---|---|
| Exception with a stack trace | First project frame; the values at that frame; where a null or undefined came from |
| Wrong output, no error | Trace the value back; check intermediate values; compare against a known-good input |
| It used to work | History of the touched files; `git bisect run <reproduction command>` |
| Only in CI or on one machine | Diff the environment: runtime and dependency versions, env vars, OS path case, line endings, timezone, locale, parallelism |
| Intermittent | Races, shared state, timers, test order, retries hiding errors; run it many times, alone, and shuffled |
| Hang | Unresolved promise, deadlock, missing timeout, waiting on stdin; take a stack dump or log progress at each boundary |
| Slower than before | Profile before and after; don't guess |
| Build or type error | Read the full error chain; fix the value or the declaration at its source |

## Instrumentation

- Prefer a focused test or a debugger over prints scattered across files.
- Tag temporary logs with a unique marker so every one is found and removed, and
  log values with their types, not "got here".
- Never add logging that writes secrets or personal data.

## Report

```text
## Root cause
The retry wrapper reuses the AbortSignal from the first attempt; once it times
out, every retry is aborted immediately, so the job fails after 30 s instead of
retrying for 2 min.

## Evidence
- `pnpm test retry.test.ts -t "retries after timeout"` failed with AbortError before the fix
- src/net/retry.ts:41 passes `options.signal` to every attempt

## Fix
src/net/retry.ts:41 — create a fresh timeout signal per attempt, combined with the caller's signal.

## Verification
- Regression test red before, green after
- net package tests and type check pass
```

## Anti-patterns

- **Shotgun edits** — changing several things until the error disappears.
- **"Fixed" without reproducing** — the failure may simply not have occurred this run.
- **Catching and ignoring** the exception.
- **Sleeps and retries** for an intermittent failure whose cause is unknown.
- **Blaming the framework, compiler, or cache** before ruling out the project's
  own code — and clearing caches only when evidence points there.
- **Naming a cause from the error message alone** without reading the code.

## Before returning

- [ ] Failure reproduced, or it is stated plainly why it couldn't be
- [ ] Root cause stated, consistent with every symptom
- [ ] Fix at the cause; no swallowed errors or special-casing
- [ ] Regression test seen red, then green; related suites pass
- [ ] Temporary instrumentation removed

## Skills in scope

- `testing` — for the regression test that pins the fix
- `bug-hunter` — for scanning nearby code for the same defect pattern
- `verify-before-done` — for the final proof before reporting
- `git-flow` — for bisecting and for committing the fix

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
