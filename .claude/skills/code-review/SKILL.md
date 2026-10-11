---
name: code-review
description: "PR, dal, commit aralığı ya da mevcut diff'i doğruluk, güvenlik ve bakım açısından SALT-OKUMA ile inceler. Tetik: \"code review\", \"PR'ı incele\", \"merge'e hazır mı\", \"değişikliklerime bak\". WrongStack 1.0.26 uyarlaması."
category: audit
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/code-review/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/code-review/SKILL.md`, MIT lisansı. Aşağıdaki
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
| Diff tabanı | `python .claude/skills/diff-review/scripts/check_diff_rules.py` (dalın merge-base'ine göre tarar, `--taban <dal>` verilebilir) ve `git diff <taban>...HEAD` |
| `chimera` atfı ("automatic post-session review format") | Bizde otomatik koşma yok; `chimera` talep üzerine çalışır |
| `security-scanner` atfı | Sonraki alım PR'ında gelir; o zamana kadar güvenlik taraması için `security-review` ve `scripts/security/secret-scan.py` |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Salt-okuma: inceleme sırasında dosya düzenlenmez, commit/push yapılmaz.
2. Migration içeren diff'te kural 13 hatırlanır: merge prod'a otomatik yazar; bulgu listesine "migration var, Recep onayı gerekir" satırı yazılır (skill bunu atlamıyor, yalnız sözleşmeyi okutuyor).
3. Bulgu = kırılma girdisi + sonucu; kanıtsız "şüpheli" bulgu olarak değil gözlem olarak yazılır.

---

# Code Review

## Overview

A review finds what the author can't see from inside the change: inputs they
didn't consider, callers the change breaks, security holes, and design that will
be expensive to live with. It is read-only unless the user asks for fixes.

This is the on-demand review of any change set. `chimera` is the automatic
review of files changed during a WrongStack session.

## Rules

1. Pin the change set exactly — `git diff <base>...HEAD` for a branch, the PR
   diff, or staged plus unstaged changes locally — and state the base you
   reviewed against.
2. Learn the intent first: PR description, linked issue, commit messages. Judge
   the change against what it is meant to do.
3. Read changed code in context — the whole function, its callers, and its
   tests — not only the diff hunks.
4. Check the blast radius. For every changed signature, return shape, thrown
   error, default value, or config key, find the callers (the
   codebase-impact-analysis or codebase-incoming-calls tool when the index
   exists, grep otherwise) and confirm they still work.
5. Every finding cites `file:line`, names the input or scenario that breaks and
   the consequence, and proposes a concrete fix. Without a scenario it is a
   question, and should be asked as one.
6. Rank by severity — blocking, should fix, nit — and keep nits few so they
   never bury a blocker.
7. Skip what the formatter and linter already enforce.
8. Say what you verified and what you did not.
9. Stay read-only unless the user asks for fixes.

## What to check, in priority order

1. **Correctness** — conditions and boundaries, null, empty and very large
   inputs, error paths, awaited async work and ordering, concurrency, resource
   cleanup, behaviour on retry.
2. **Contracts** — public API, schema, and config changes; migrations and their
   rollback; callers updated; backwards compatibility.
3. **Security** — validation at trust boundaries, object-level authorization,
   injection (SQL, shell, HTML, paths), secrets, SSRF, sensitive data in logs.
4. **Tests** — something fails without this change; edge and error cases
   covered; assertions on behaviour.
5. **Operability** — errors carry context, logs or metrics where diagnosis will
   need them, timeouts on I/O, a way to turn risky behaviour off.
6. **Maintainability** — an existing helper duplicated (search before accepting
   a new one), naming, dead code, comments that explain why.
7. **Performance** on hot paths — N+1 queries, unbounded loads, blocking I/O on
   request paths.

## Workflow

1. **Scope** the change set and the base.
2. **Intent** from the description, issue, and commits.
3. **Map** the diff: list files, group them by concern, and skim everything once
   before commenting.
4. **Deep read** in the priority order above, with blast-radius checks.
5. **Run what is cheap and allowed** — type check, lint, and the covering tests
   (the codebase-targeted-test tool finds them).
6. **Write** the review.

## Output

```text
## Review — feature/retry-charges against main

**Verdict:** Request changes
Adds automatic retries to card charges; the retry path can double-charge.

### Blocking
1. src/billing/charge.ts:88 — each retry sends a new charge without an idempotency
   key, so a timeout after the provider accepted the first attempt charges twice.
   → Send `idempotencyKey: order.id` on every attempt.

### Should fix
2. src/api/orders.ts:41 — `limit` is not capped; `?limit=100000` loads the whole table.
   → Clamp it to 100.

### Nits
3. src/billing/charge.ts:12 — rename `tmp` to `pendingCharge`.

### Verified
Type check and the billing tests pass. End-to-end suite not run.
```

When nothing blocks, say so plainly. A short approval is a complete review.

## Anti-patterns

- **Reviewing only the hunks** without the surrounding code and callers.
- **Style-only reviews** that miss the bug.
- **Vague comments** — "this looks off", "consider refactoring".
- **Speculation stated as fact.**
- **Redesigning the change** to personal preference.
- **Approving without reading the tests.**

## Before returning

- [ ] Change set and base stated; intent understood
- [ ] Changed code read in context; callers of changed contracts checked
- [ ] Every finding has `file:line`, a breaking scenario, and a fix
- [ ] Severity ranked; nits few and labelled
- [ ] What was and wasn't verified is stated
- [ ] No files modified unless fixes were requested

## Skills in scope

- `security-scanner` — for a deeper pass on security-sensitive changes
- `bug-hunter` — for scanning beyond the diff when a defect pattern repeats
- `testing` — for judging whether the tests prove the change
- `chimera` — for the automatic post-session review format

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
