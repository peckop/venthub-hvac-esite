---
name: sdd
description: "Spesifikasyon odaklı geliştirme: önce ölçülebilir kabul ölçütlü spec, sonra görev grafiği, kritik yol, sonra uygulama. Tetik: \"spec yaz\", \"gereksinim çıkar\", \"görev grafiği\", \"kabul ölçütü\". WrongStack 1.1.0 uyarlaması."
category: planning
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/sdd/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/sdd/SKILL.md`, MIT lisansı. Aşağıdaki
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
| `output-standards` atfı | Bizde yok (1.1.0 paketinde var, alınmadı); atıf yok sayılır. Rapor biçimi: aşağıdaki Bitiş Durumu bloğu ve Recep çıktı stili |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Spec yapısının başına **"0. Cetvel / YÖNTEM"** bölümü eklenir (kural 1): hangi cetvel yönetiyor, iş hangi yöntemle koşacak.
2. Spec veritabanı değişikliği içeriyorsa `create-migration` ve `plan-challenger` ZORUNLU (kural 13).
3. Çekirdek (ölçülebilir kabul ölçütü, gerçek bağımlılık, kritik yol) olduğu gibi alındı.

---

# Spec-Driven Development — WrongStack

## Selection card
- Task: Define acceptance criteria and dependent tasks.
- Start: Identify the requested artifact, repository owner and acceptance criteria.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

For an SDD task, start with a spec proportionate to its scope. The spec is the source of truth — it defines what to build, how to verify it, and what counts as done. SDD uses `/sdd` slash commands to create specs, generate task graphs, and track execution.

## Rules

1. Use SDD for requested specifications or tasks that benefit from explicit acceptance and dependency tracking.
2. Spec must have acceptance criteria — without them, you can't know when it's done.
3. Record real dependencies between tasks, and only real ones — unchained tasks are the ones that can run in parallel.
4. Spec must be specific: "Users authenticate via OAuth2 with PKCE" not "improve auth".
5. For urgent work, keep acceptance and recovery explicit without forcing unnecessary ceremony.
6. When the spec reveals a refactor, apply the refactor-planner skill to sequence it.

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

## Boundaries

Use explicit acceptance for SDD work. Avoid invented dependencies, vague
requirements and implicit goals/schedules. Planning-only work returns the spec;
an implementation request continues into the authorized execution and checks.

## Before returning

- [ ] Spec has observable acceptance criteria with commands or user-journey checks
- [ ] Every requirement is specific enough to be tested, not "improve X"
- [ ] Real dependencies recorded; independent tasks left unchained so they can run in parallel
- [ ] Spec template matches the work type (feature/bugfix/refactor/infra/integration/cli-command)
- [ ] Multi-file refactors use refactor-planner sequencing while preserving task scope
- [ ] Critical path called out; bottlenecks named; parallel groups identified

## Proportional scope and execution

Use a written spec when the task needs it or the user requested the SDD workflow.
A small concrete fix can proceed directly; do not open a planning ceremony solely
to satisfy this skill. Separate planning-only requests from implementation:
when execution is already authorized, continue through the task graph and verify.
Record acceptance behavior, environment boundaries and requirement-to-evidence
links. Commands are valuable checks but not every product criterion is a command.
Do not start goals, eternal mode or scheduled work without the required authorization.

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
