---
name: sdd
description: "Spesifikasyon odaklı geliştirme: önce ölçülebilir kabul ölçütlü spec, sonra görev grafiği, kritik yol, sonra uygulama. Tetik: \"spec yaz\", \"gereksinim çıkar\", \"görev grafiği\", \"kabul ölçütü\". WrongStack 1.0.26 uyarlaması."
category: planning
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/sdd/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/sdd/SKILL.md`, MIT lisansı. Aşağıdaki
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
| `/sdd …` komutları (satır ~37-58) ve görev yaşam döngüsü komutları | WrongStack ana programının; Claude Code'da **yok**. Spec elle `docs/plans/<ad>-<tarih>.md` olarak yazılır; görev durumları (satır ~91-98) `/sdd` deposunda değil **Kanban alt kartında** tutulur |
| **"Goal & Eternal Mode" bölümü (satır 108-123: `/goal`, `/autonomy eternal`)** | **UYGULANMAZ, çıkarılmış say.** Sebep: bu komutlar Claude Code'da yok (bölüm zaten çalışmaz) ve sonsuz `decide→execute→reflect→sleep` döngüsü karar 53 (zamanlayıcı/döngü önce Recep'le) ile "kuyruk bitince dur" sözüyle çelişir. Yalnız Recep AÇIKÇA isterse konuşulur |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Spec yapısının başına **"0. Cetvel / YÖNTEM"** bölümü eklenir (kural 1): hangi cetvel yönetiyor, iş hangi yöntemle koşacak.
2. Spec veritabanı değişikliği içeriyorsa `create-migration` ve `plan-challenger` ZORUNLU (kural 13).
3. Çekirdek (ölçülebilir kabul ölçütü, gerçek bağımlılık, kritik yol) olduğu gibi alındı.

---

# Spec-Driven Development — WrongStack

## Overview

Every non-trivial change starts with a spec. The spec is the source of truth — it defines what to build, how to verify it, and what counts as done. SDD uses `/sdd` slash commands to create specs, generate task graphs, and track execution.

## Rules

1. Every non-trivial task needs a spec before writing code — you'll rewrite it anyway.
2. Spec must have acceptance criteria — without them, you can't know when it's done.
3. Record real dependencies between tasks, and only real ones — unchained tasks are the ones that can run in parallel.
4. Spec must be specific: "Users authenticate via OAuth2 with PKCE" not "improve auth".
5. Skipping `/sdd` for urgent tasks backfires — the spec is what makes "urgent" possible.
6. When the spec reveals a multi-file refactor, delegate to `refactor-planner` first.

## When to use

- New feature implementation
- Bug fix with complexity
- Refactoring with scope
- Any task requiring more than 1 hour

## The SDD workflow

```
1. /sdd new [title]          → Build spec from questions
2. /sdd tasks <id>           → Generate task graph from spec
3. /sdd graph <id>           → Visualize dependencies
4. /sdd critical <id>        → Find bottlenecks
5. /sdd execute <id>         → Run tasks (or execute manually)
```

## Task lifecycle commands

| Command | What it does |
|---------|--------------|
| `/sdd tasks` | Show task list with progress bar (sorted: in_progress → pending → review → blocked → failed → completed) |
| `/sdd next` | Show next executable task + blockers |
| `/sdd done <N>` | Complete a task (by number or fuzzy title match) |
| `/sdd skip <N>` | Skip a task back to pending |
| `/sdd fail <N>` | Mark a task as failed |
| `/sdd review <N>` | Send a task to review |
| `/sdd edit <N> <text>` | Edit task title (short text) or description (long text) |
| `/sdd undo` | Undo last task completion |
| `/sdd graph` | ASCII task dependency visualization |
| `/sdd critical` | Critical path analysis + bottlenecks |

## Spec templates

| Template | Best for |
|---|---|
| `feature` | New feature development |
| `bugfix` | Bug fix with root cause analysis |
| `refactor` | Code refactoring with goals |
| `infra` | Infrastructure/tooling changes |
| `integration` | External service integration |
| `cli-command` | New CLI commands/slash commands |

## Spec structure

A complete spec has:
1. **Overview** — What problem does this solve?
2. **Requirements** — `[priority] description` format
3. **Architecture** — High-level design (if needed)
4. **API Design** — Endpoints, inputs, outputs (if applicable)
5. **Acceptance Criteria** — How do we know it's done?

### Requirement format

```
[critical] Users can authenticate with OAuth2
[high] Rate limiting: 100 req/min per user  
[medium] Response time < 200ms p95
[low] Support dark mode
```

## Task graph generation

Each requirement generates one or more tasks. Tasks have states:
```
pending → in_progress → review → completed
              ↓
           blocked (waiting on dependencies)
              ↓
           failed
```

## Critical path

The critical path finds:
- **Bottleneck tasks** blocking the most downstream work
- **Parallel groups** that can run concurrently
- **Ready tasks** that can start immediately
- **Execution order** respecting all dependencies

## Goal & Eternal Mode

`/sdd` pairs with `/goal` for autonomous execution:

| Command | What it does |
|---------|--------------|
| `/goal set <text>` | Set an autonomous mission |
| `/goal pause` | Pause at end of current iteration |
| `/goal resume` | Resume a paused goal |
| `/goal journal [N]` | Show recent journal entries |
| `/goal clear` | Clear goal and stop eternal mode |
| `/autonomy eternal` | Run goal loop indefinitely |
| `/autonomy stop` | Stop eternal mode |

**Eternal stage flow:** `decide → execute → reflect → sleep | paused | stopped`
Stage shown in real-time. Pause stops after current iteration completes.

## Anti-patterns

- **Writing code before the spec** — you'll rewrite it anyway
- **Spec that's too vague** — "improve auth" is not a spec, "Users authenticate via OAuth2 with PKCE" is
- **Invented dependencies** — chaining independent tasks serializes work that could run in parallel
- **Spec without acceptance criteria** — how do you know when it's done?
- **Skipping /sdd for urgent tasks** — the spec is what makes "urgent" possible

## Out of scope

- **Don't start coding before the spec exists.** You'll rewrite the code anyway — the spec is what makes the rewrite possible. SDD comes first or the spec is fiction.
- **Don't accept a spec without acceptance criteria.** "Done" must be a checkable state. Without criteria, the task has no formal end and the verifier has nothing to run.
- **Don't write vague requirements.** "Improve auth" is not a requirement; "Users authenticate via OAuth2 with PKCE, sessions expire after 24h" is. If a requirement can't be tested, it's not a requirement.
- **Don't skip `/sdd` because the task is urgent.** Urgency without a spec produces urgency-shaped rework. The spec is what makes "urgent" possible to ship correctly.
- **Don't start a multi-file refactor from SDD.** When the spec reveals a refactor, delegate to `refactor-planner` for the phased plan. SDD defines the goal; refactor-planner sequences the work.
- **Don't execute the task graph yourself unless the user asks.** SDD produces the plan and task graph; an executor (the leader, a subagent, or the user) picks it up.

## Before returning

- [ ] Spec has explicit acceptance criteria the verifier can run as commands
- [ ] Every requirement is specific enough to be tested, not "improve X"
- [ ] Real dependencies recorded; independent tasks left unchained so they can run in parallel
- [ ] Spec template matches the work type (feature/bugfix/refactor/infra/integration/cli-command)
- [ ] Multi-file refactors are routed to `refactor-planner`, not absorbed into SDD tasks
- [ ] Critical path called out; bottlenecks named; parallel groups identified

## Skills in scope

- `refactor-planner` — when the spec reveals a multi-file refactor
- `bug-hunter` — when a bugfix spec needs a root cause analysis section
- `multi-agent` — for executing parallel task groups
- `output-standards` — for standardized `<nextsteps>` formatting

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
