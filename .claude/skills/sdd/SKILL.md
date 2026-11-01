---
name: sdd
description: "Spesifikasyon odaklı geliştirme: önce ölçülebilir kabul ölçütlü spec, sonra görev grafiği, kritik yol, sonra uygulama. Tetik: \"spec yaz\", \"gereksinim çıkar\", \"görev grafiği\", \"kabul ölçütü\". WrongStack 1.1.0 uyarlaması."
category: planning
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/sdd/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0 `skills/sdd` (MIT) çekirdeği; addyosmani kaynaklı bölümlerin altında
> kendi kaynak satırı var. VentHub'a uyarlandı, 26 Ekim 2026, YTN-21. "Araç eşlemesi" ve "VentHub ek kuralları" bize aittir.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `codebase-context` / `codebase-search` / `codebase-stats` | `codebase_context` / `codebase_search` / `codebase_stats` (alt çizgi; `mcp__wrongstack-codebase-index__*`) |
| `codebase-repo-map` | `codebase_package_graph` ya da `graphify` |
| `codebase-incoming-calls` / `codebase-outgoing-calls` | `codebase_symbol_graph` ya da `codegraph_explore` |
| `codebase-impact-analysis` | `graphify affected "sembol()"` (**parantez şart**) |
| `/sdd …` komutları, görev yaşam döngüsü, `/goal`, `/autonomy eternal` | Claude Code'da **yok**, gövdeden çıkarıldı. Spec elle `docs/plans/<ad>-<tarih>.md`; görev listesi ve durumları **Kanban kartı / alt kartı** (`tasks/todo.md` gibi yeni dizin açılmaz; kart planı: `docs/standards/kart-plani-standard.md`). Sonsuz döngü karar 53 ile çelişir; yalnız Recep açıkça isterse konuşulur |
| `<nextsteps>` etiketi, `output-standards` atfı | Hiç üretilmez / bizde yok. Rapor biçimi: aşağıdaki Bitiş Durumu bloğu |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Spec yapısının başına **"0. Cetvel / YÖNTEM"** bölümü eklenir (kural 1): hangi cetvel yönetiyor, iş hangi yöntemle koşacak.
2. Spec veritabanı değişikliği içeriyorsa `create-migration` ve `plan-challenger` ZORUNLU (kural 13).
3. Çekirdek (ölçülebilir kabul ölçütü, gerçek bağımlılık, kritik yol) olduğu gibi alındı. Yerelde komut örneği `pnpm test:ilgili` ya da `pnpm exec vitest run <yol>`; tam paket CI'da. Commit yalnız istenince atılır.

---

# Spec-Driven Development

## Selection card
- Task: Define acceptance criteria and dependent tasks.
- Start: Identify the requested artifact, repository owner and acceptance criteria.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

The spec is the source of truth: it defines what to build, how to verify it, and what counts as done. Code without a spec is guessing. Size the spec to the task: a small concrete fix proceeds directly with a two-line acceptance; do not open a planning ceremony solely to satisfy this skill. Write a spec when the change touches several files or modules, an architectural decision is pending, requirements are ambiguous, or the work exceeds about an hour.

## Rules

1. Spec must have observable acceptance criteria (command or user-journey check); without them you cannot know when it is done.
2. Record real dependencies between tasks, and only real ones; unchained tasks can run in parallel.
3. Spec must be specific: "Users authenticate via OAuth2 with PKCE" not "improve auth".
4. For urgent work keep acceptance and recovery explicit without forcing ceremony.
5. When the spec reveals a refactor, apply the `refactor-planner` skill to sequence it.
6. Planning-only requests return the spec; an already authorized implementation request continues into execution and checks. Do not start goals, loops or scheduled work without authorization.

## Gated workflow

SPECIFY → PLAN → TASKS → IMPLEMENT. Do not advance until the current phase is reviewed by the human.

### Phase 0: Scope check (module map)

Skip when the request is one capability. Decompose first when one request bundles several independently testable capabilities (own consumers or data, acceptance criteria that cluster and could ship separately, one part cuttable without rewriting the others). Propose a small capability map before any spec: a table of `Module id | Responsibility | Depends on` plus a build order (e.g. `identity → billing, notifications → reporting`).

- Stable kebab-case module ids, chosen once, never renamed mid-initiative.
- Dependency direction without cycles; two modules that need each other are one module.
- The contract between modules belongs in the provider module's spec.
- The map is gated: the human reviews boundaries, direction and build order before any module spec. Then Specify → Plan → Tasks → Implement per module, in dependency order; specs are named by module id.

Kaynak: addyosmani/agent-skills spec-driven-development @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

### Phase 1: Specify

**Surface assumptions first.** Before writing spec content, list them and ask for correction:

```
VARSAYIMLAR:
1. Web uygulaması (yerel mobil değil)
2. Yetki kararı app_metadata üzerinden (kural 12)
3. Veritabanı Supabase PostgreSQL (mevcut şemaya göre)
→ Yanlışsa şimdi düzelt, yoksa bunlarla ilerliyorum.
```

Never silently fill an ambiguous requirement; assumptions are the most dangerous misunderstanding.

**Six core areas:** Objective (what, why, for whom, what success looks like) · Commands (full executable commands) · Project structure (where code, tests, docs go) · Code style (one real snippet beats three paragraphs) · Testing strategy (framework, location, levels) · Boundaries (Always / Ask first / Never).

**Reframe vague requirements as measurable ones:**

```
İSTEK: "Panel daha hızlı olsun"
ÖLÇÜLEBİLİR: LCP < 2,5 s (üretim derlemesi, aynı koşul) · ilk veri yükü < 500 ms · CLS < 0,1
→ Hedefler doğru mu?
```

If the project already uses another spec format, keep its artifact format; this skill owns the clarification, content and approval gates.

**Stop after writing the spec.** Summarize it, list Open Questions, ask for approval, and END THE TURN. Do not start the plan or code in the same turn; planning starts after approval in a later turn.

Kaynak: addyosmani/agent-skills spec-driven-development @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

### Phase 2: Plan

Components and dependencies, build order, risks and mitigations, what is parallel versus sequential, verification checkpoints. Plan and task list go on the **Kanban card** (not `tasks/plan.md`); the card states which standard governs it.

### Phase 3: Tasks

Each task: completable in one session, explicit acceptance, a verification step, ordered by dependency (not perceived importance), about five files at most. Template: `- [ ] Görev: <ne> · Kabul: <ne doğru olmalı> · Doğrula: <komut ya da elle kontrol> · Dosyalar: <hangileri>`.

### Phase 4: Implement

One task at a time, test-first where it fits (`testing` skill), loading only the spec sections and files each step needs.

## Critical path

The critical path finds:
- **Bottleneck tasks** blocking the most downstream work
- **Parallel groups** that can run concurrently
- **Ready tasks** that can start immediately
- **Execution order** respecting all dependencies

## Keeping the spec alive

Update the spec first when a decision or scope changes, then implement. The spec lives in the repo (`docs/plans/`) next to the code, and the PR body links the section it implements (`Kanban: <ön ek>-<sayı>`).

Kaynak: addyosmani/agent-skills spec-driven-development @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

## Boundaries

Avoid invented dependencies, vague requirements and implicit goals or schedules. A migration inside a task slice is a Recep approval point (kural 13). Kural 14: test and error paths are part of the slice, not a later task.

## Red flags

- Code before any written requirement; "should I just start?" before "done" is defined
- Features not in any spec or card; architecture decisions undocumented
- Spec written and plan or code started in the same turn
- One spec spanning several independently testable capabilities, with no module map approved

## Before returning

- [ ] Spec covers the six areas and has observable, testable acceptance criteria
- [ ] Assumptions were listed and the turn ended after the spec (approval in a later turn)
- [ ] Real dependencies recorded; independent tasks left unchained
- [ ] Multi-capability request: module map approved before module specs
- [ ] Multi-file refactors sequenced with `refactor-planner`
- [ ] Critical path called out; bottlenecks named; parallel groups identified

## Skills in scope

- `refactor-planner` for multi-file refactors · `bug-hunter` for root-cause sections in bugfix specs · `multi-agent` for parallel task groups · `create-migration` and `plan-challenger` for DB changes

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
