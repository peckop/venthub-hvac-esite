---
name: refactor-planner
description: "Çok dosyalı yeniden düzenlemeyi aşamalı PLANA çevirir: bağımlılık grafiği, risk puanı, geri alma stratejisi. Plan yazar, UYGULAMAZ. Tetik: \"refactor planla\", \"göç planı\", \"bu değişikliği nasıl böleriz\". WrongStack 1.1.0 uyarlaması."
category: planning
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/refactor-planner/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/refactor-planner/SKILL.md`, MIT lisansı. Aşağıdaki
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
| "Planı uygulayan ajana devret" (satır ~28-31, ~315-316) | Devirden önce **onay adımı** vardır: kural 1 (plan + onay + cetvel). Çıktı şablonuna şu satırlar eklenir: `Cetvel: <docs/standards/... dosyası ya da "cetvel yok">`, `YÖNTEM: <şerit/alt ajan/Workflow/elle>` ve **"onaysız uygulanmaz"** |
| "Phase 3 — blue-green deployment" (satır ~222) | Bizde blue-green yok; Vercel'de **önceki dağıtıma dönüş** vardır |
| "Phase 1 — görev başına bir commit" (satır ~218) | PR başına `ŞERİT (<numara>): ne oldu — niçin (#PR)` + gövdede `Kanban: <ÖN EK>-<sayı>`; faz → alt kart (karar 219/220) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Migration içeren fazda geri alma "revert" DEĞİLDİR:** migration'lı dal master'a girince prod'a OTOMATİK uygulanır (kural 13); geri dönüş = ileri düzeltme migration'ı ve merge yalnız Recep onayıyla. Planın geri alma bölümü bunu yazmak zorundadır.
2. Plan, kendisini yöneten cetveli adıyla söyler ya da "cetvel yok — yazımı bu işin kapsamında" der (kural 1).
3. Planı yazan uygulamaz: uygulayıcı ayrı çalışan/oturumdur (§10.1 Araştırmacı ↔ Uygulayıcı).

---

# Refactor Planner

## Selection card
- Task: Plan behavior-preserving module decomposition.
- Start: Identify the requested artifact, repository owner and acceptance criteria.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Produce a reviewable sequence of changes with preserved contracts, measured
risks and executable checks. Separate behavior-preserving refactoring from
requested behavior changes so their validation is clear.

## Rules

1. Derive dependency and reverse-call edges from source or a current index.
   State arrow direction; include dynamic registration and public consumers.
2. Identify invariants before moving code: identity, error semantics, side
   effects, serialization, lifecycle ownership and module initialization.
3. Estimate risk from evidence: callers, statefulness, concurrency, public API
   and meaningful tests. Missing coverage data is unknown, not an invented score.
4. Characterize unprotected behavior before changing risky paths; raw coverage
   percentages do not prove the important cases are protected.
5. Make each checkpoint buildable and testable. A small refactor can be one
   step; do not force three phases, feature flags or a minimum task duration.
6. Preserve dirty work. Rollback means reversing the owned change or a
   separable commit when authorized, never overwriting a shared checkout.

## Workflow

1. Map scope, closest existing conventions, dependents and tests.
2. Name the problem and observable improvement: reduce coupling, isolate state,
   remove a cycle, clarify an API. Line count alone is not a correctness goal.
3. Analyze cycles as strongly connected components. Break the relevant coupling
   if it blocks the intended change; an unrelated cycle need not halt the work.
4. Sequence the smallest coherent moves. Keep compatibility shims only when
   consumers need them, and give each a removal condition.
5. For each step, record paths, dependencies, preserved contracts, check command,
   exit condition and a rollback that someone else can perform.
6. Return the plan for a planning-only request. When execution is already
   requested, use this plan to implement and verify within the same task.

## Plan shape

| Step | Paths / change | Depends on | Risk evidence | Validation | Rollback |
|---|---|---|---|---|---|
| <step> | <concrete scope> | <real prerequisite> | <callers/state/tests> | <command + assertion> | <owned reversal> |

Mark estimates as ranges with assumptions. Do not invent metrics or require
parallel agents solely because the target contains many files.

## Before returning

- Dependency direction and consumer scope explicit.
- Refactoring and intentional behavior changes distinguished.
- Each checkpoint has a meaningful exit check and rollback.
- Planning-only scope honored; authorized execution not abandoned at the plan.

## Skills in scope

- codebase-navigation — trace dependencies and callers.
- testing — characterization and contract checks.
- code-quality — unused/coupled code assessment.
- git-flow — reviewable commits when requested.

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
