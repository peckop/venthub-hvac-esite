---
name: git-flow
description: "Git işlemlerinde güvenli akış: açık yolla stage, kanca atlatmama, yıkıcı komuttan önce bakma, paylaşılan geçmişi yeniden yazmama. Tetik: \"commit at\", \"PR aç\", \"dal\", \"rebase\", \"geri al\". WrongStack 1.0.26 uyarlaması."
category: git
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/git-flow/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/git-flow/SKILL.md`, MIT lisansı. Aşağıdaki
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
| Commit mesajı örneği (satır ~56-63: tür önekli, `Refs #123`) | `ŞERİT (REC-nn): ne oldu — niçin (#PR)`; Türkçe, tür öneki (`fix:`) yok. Satır ~65 "en çok 72 karakter, emir kipi" **kaldırılır** (depo konuları 110-140 karakter, Türkçe) |
| PR gövdesi (satır ~101-102) | Gövdede `Kanban: <ÖN EK>-<sayı>` (ör. `Kanban: YTN-4`; Linear'dan taşınan kayıt `Kanban: REC-nn`); yoksa kayıt kapısı kırmızı. Eski `Fixes REC-nn` / `Kayıtsız:` yolları 10-01 gün sonunda kapanır (karar 219/220) |
| **Ana dala geçip `merge --ff-only` yapmak (satır ~104-105)** | **BİZDE YASAK YOL.** Yerine: `node scripts/hijyen/merge-ritueli.cjs <PR> <dal> --agac=<yol> --merge` (kapı eylemi müdürün işi; migration'lı PR yalnız Recep onayıyla) |
| `git stash push` (satır ~85) | **Kullanma.** Stash tüm worktree'ler arasında ORTAKTIR; çok pencereli filoda başka pencerenin stash'i görünür. Yerine **önce WIP commit** |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Değişmeyenler (bizim kurallarımızla aynı yönde): satır ~22 (yalnız istenince commit/push), ~24-26 (açık yol ile stage, toptan `add` yok), ~30-31 (`--no-verify` yok), ~32-37 (yıkıcı komuttan önce bak, paylaşılan geçmişi yeniden yazma).
2. Bitmiş (merge edilmiş) PR'ın dalına yeni commit itilmez: kapalı PR yeni commit almaz; squash-merge'de "iş masterda mı" sorusu SHA ile değil içerikle ölçülür.
3. Worktree silerken önce dışa giden bağlantı (junction/symlink) kaldırılır; özyinelemeli silme başka ağaçları silebilir (CLAUDE.md "Worktree node_modules").

---

# Git Workflow

## Overview

Agents damage repositories in a few repeatable ways: committing files that
belong to someone else, rewriting shared history, destroying uncommitted work,
and bypassing hooks. This skill is the discipline that prevents those, applied
on top of the repository's own conventions.

## Rules

1. Commit, push, or open a pull request only when the user asked for it. Never
   push on your own initiative.
2. Look before you write: check status and both the unstaged and staged diff
   before every commit. Stage explicit paths — never `git add -A` or `git add .`
   in a worktree that may hold someone else's in-progress changes.
3. Follow the repository's conventions. Read recent history and any
   CONTRIBUTING, commitlint, or PR template before choosing a message format or
   branch name.
4. Never bypass hooks or signing (`--no-verify`, `-n`, `--no-gpg-sign`). When a
   hook fails, fix the cause or report it.
5. Inspect before anything destructive — `reset --hard`, `checkout -- <path>`,
   `clean -fd`, `branch -D`, force pushes, rebasing pushed commits. Know what
   would be lost, prefer the non-destructive alternative, and ask when work
   could be lost.
6. Don't rewrite shared history. On a branch others use, add commits or revert.
   On your own pushed branch, `--force-with-lease`, never `--force`.
7. One concern per commit. The message says why; the diff already shows what.

## Before a commit

```bash
git status --short
git diff --stat           # unstaged
git diff --staged         # exactly what will be committed
git log --oneline -15     # the message style to match
```

Confirm the staged list contains only files changed for this task. Lockfiles,
generated files, and formatting churn go in only when they belong to the change.

## Messages

Match the existing style. When the repository has none:

```text
fix(auth): refresh the token before it expires, not after

Requests made in the last 30 s of a token's life failed with 401 and were
retried blindly. Refreshing at 80% of the lifetime removes the window.

Refs #123
```

Subject: imperative, at most 72 characters, no trailing period. Body: the
reason, the trade-off, and anything a reviewer can't see in the diff.

## Conflicts

1. List conflicted files and read both sides before editing.
2. Resolve by intent, not by taking one side wholesale; keep both changes when
   both are valid.
3. Remove every conflict marker, then build and run the relevant tests before
   staging and continuing.
4. When resolving needs a product decision, stop and ask. `git merge --abort` or
   `git rebase --abort` returns to the starting point.

## Recovery

| Situation | Recovery |
|---|---|
| Commit lost after a reset or rebase | `git reflog`, then `git branch rescue <sha>` |
| Committed to the wrong branch (not pushed) | `git branch <new-branch>`, then move the wrong branch back |
| Need to undo a pushed commit | `git revert <sha>` |
| Uncommitted work at risk | `git stash push -m "<reason>"` (add `-u` for untracked files) |
| Find the commit that broke something | `git bisect start <bad> <good>`, then `git bisect run <test command>` |

## Safety table

| Action | Safe? | Do instead |
|---|---|---|
| Force push to a shared branch | ❌ | Revert or add a commit |
| `--force-with-lease` to your own branch | ✅ | — |
| `reset --hard` with uncommitted work | ❌ | Stash or commit first |
| Amend a pushed commit | ❌ | Follow-up commit |
| `git add -A` in a shared worktree | ❌ | Stage explicit paths |
| Skipping hooks | ❌ | Fix what the hook reports |

## Pull requests

- Title in commit-message style. Body: what changed, why, how it was verified,
  and the risks.
- One reviewable concern per pull request; read the full diff yourself first.
- To merge a clean topic branch without a merge commit:
  `git checkout main && git merge --ff-only feature`.

## Anti-patterns

- **"Update stuff" commits** spanning unrelated changes — split them.
- **Committing everything the worktree contains** instead of the task's files.
- **Resolving a conflict by deleting the other side** without reading it.
- **Treating a failing hook as an obstacle** rather than a finding.

## Before returning

- [ ] Commit, push, or PR happened only because the user asked
- [ ] Staged list reviewed; only this task's files are in it
- [ ] Message matches the repository's convention and explains why
- [ ] No hook bypass; no force push to shared history
- [ ] Anything destructive was inspected first and is recoverable

## Skills in scope

- `refactor-planner` — for sequencing a large change into reviewable commits
- `bug-hunter` — for a last pass over the diff before committing
- `output-standards` — for the `<nextsteps>` shape in the final report

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
