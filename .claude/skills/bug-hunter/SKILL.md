---
name: bug-hunter
description: "Kod tabanında kusur örüntülerini sistematik arar (kaçak, yarış, enjeksiyon, sınır hatası); her bulguyu kırılma girdisi ve sonucuyla yazar. Tetik: \"bug avı\", \"aynı hata başka yerde var mı\", \"kusur tara\", \"güvenlik açığı ara\". WrongStack 1.1.0 uyarlaması."
category: audit
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/bug-hunter/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 2) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/bug-hunter/SKILL.md`, MIT lisansı. Aşağıdaki
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
| `security-ast-scan` aracı (satır ~74-79) | Yok. Sır için `scripts/security/secret-scan.py`; enjeksiyon/ReDoS/`eval` örüntüleri `Grep` ile, bulgu kanıt satırıyla |
| `dead-code-scan` aracı | `pnpm knip` ya da `fallow` (yalnız ADAY; dinamik import ve config ile kayıt görünmez) |
| "Cascade agent" modu (bölüm 3, satır ~261-286) | **Uygulanmaz:** chimera'nın `cascadeOn` çalışma zamanı bizde yok; düzeltme ayrı, onaylı iştir |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kural 3 ile çelişen satırlar (~110, ~167):** kaynak, `any` tipinin ağ sınırında Medium, iç yardımcıda Low sayılacağını söyler. Bizde `src/` altında `any` kullanımı (tür dönüşümüyle de, iki nokta ile de) **her yerde kural 3 ihlalidir**; ağ/DB/ayrıştırılmış girdi sınırında en az **High**.
2. Bulgu tablosundaki "sır" örüntüsü gerçek anahtar bulursa bulgu metnine anahtarın KENDİSİ yazılmaz (public repo): yalnız dosya, satır ve "N karakterlik anahtar" yazılır.
3. Bu skill salt-okuma tarar; düzeltme istenirse ayrı iş olarak, onayla yapılır.

---

# Bug Hunter

Finds real defects in code. In a scan it outputs a prioritized hit list with
file:line references; in a proof-driven round it selects the one candidate it
can prove, and hands it to the proof, fix, and verification discipline.

## Selection card
- Task: Run the WrongStack bug-hunt and cascade workflow.
- Start: Identify the scope and obtain an executable before-proof or review evidence.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Rules

1. Always include a `file:line` you have actually read — verify the line exists;
   never invent, guess, or extrapolate a reference. No line reference = can't be
   fixed.
2. Grep finds candidates; reading finds bugs. No hit becomes a finding until you
   can state the input that triggers it and what breaks.
3. Never scan `node_modules`, build output, or generated code.
4. Don't report style issues as bugs — those are lint findings.
5. Don't inflate severity or pad the report. Twelve confirmed findings beat
   forty maybes, and a clean scan is a valid result.
6. Sort output: critical > high > medium > low.

## Workflow

```
1. Scope:    Accept file/dir globs, explicit paths, a feature, or a symptom
2. Map:      Entry points, callers, and the contract the code must honour
3. Scan:     grep/read across target files, lifecycle and async paths first
4. Confirm:  Open each hit and answer the three questions below
5. Classify: Categorize by type and severity
6. Deliver:  Report (scan modes) or select one candidate (proof-driven mode)
```

### Confirm every candidate

A regex hit is a **place to look**, never a finding. Before any hit becomes a
line in the report, open it and answer three questions:

1. **Is the triggering value actually reachable from a caller, user, or
   environment?** `element.innerHTML = "<b>Loading</b>"` is not XSS.
2. **Is the path reachable?** Dead code, unexported helpers with no callers, and
   branches behind a permanently-false flag are at most Low.
3. **Is it already handled nearby?** A `.catch()` chained further down, a
   validated input, an outer try/catch, a cleanup in the owner's teardown —
   read enough surrounding lines to know.

Also establish **what correct behaviour is and why**: a documented contract, a
caller's requirement, or an established test. A deliberate tradeoff or a
stylistic preference is not a bug, however it looks.

### Start from the index and scanners when they exist

When the codebase index and quality tools are available, let them narrow the
search and grep for the rest:

- the security-ast-scan tool for injection, hardcoded secrets, prototype
  pollution, ReDoS, unsafe eval, and N+1 queries in a file;
- the dead-code-scan tool for unreferenced exports (candidates only — dynamic
  imports and config-driven registration are invisible to it);
- the codebase-incoming-calls tool to confirm a suspicious function is
  reachable and to see how many callers inherit the defect.

Tool output is a candidate list like any grep hit: every finding is read
before it ships.

### Exclude before you scan

`node_modules`, `dist`, `build`, `.next`, `out`, `coverage`, lockfiles,
`*.min.*`, generated clients and protobufs, snapshots (`__snapshots__`),
vendored third-party directories, and `.git`.

**Test files and fixtures are a special case.** Do not scan them for secrets —
mock credentials are expected there. Do still scan them for leaks and unawaited
promises, since those cause real flakiness. When a finding lands in a test file,
say so in the finding.

---

## Severity levels

| Level | Meaning | Action |
|-------|---------|--------|
| **Critical** | Security breach, data loss, crash | Fix immediately |
| **High** | Logic bug, race condition, memory leak | Fix before release |
| **Medium** | Error handling gap, type unsafety | Fix soon |
| **Low** | Minor code smell with a real consequence | Consider fixing |

- **Reachability discounts it.** The same `as any` is Medium at a network
  boundary and Low in an internal helper that only ever receives typed input.
- **Blast radius promotes it.** A bug in one leaf component is what it is; the
  same bug in a shared util imported by forty modules is a level higher.

When torn between two levels, pick the lower one. Over-calling costs the
reader's trust in every other line.

---

## Patterns and report

For scanning patterns, severity-ranked report examples and output shape, [Read the detailed workflow](references/patterns-and-report.md).

## Running modes

- Standalone scan: report confirmed source findings; no production edits.
- Fan-out worker: honor its assigned scope and return evidence to the coordinator.
- Cascade: revalidate the supplied finding before applying its authorized fix.
- Proof-driven /bughunt: one proven root cause, no fan-out, deterministic proof,
  narrow fix and regression verification; follow the round's output contract.

Before operating in a worker, cascade or proof-driven mode, read
[the complete mode protocol](references/running-modes.md).

## Anti-patterns

- **Reporting grep output as findings** — every hit is read before it ships
- **Flagging test fixtures as leaked secrets** — mock credentials belong there
- **Inflating severity** to make the scan look productive
- **Proof-driven: fixing before the proof is red**, or picking the most
  dramatic candidate over the most provable one
- **Proof-driven: re-reporting a prior round's root cause** under a new symptom

## Out of scope (scan modes)

- **Don't fix the bugs you find in the default scan.** Apply fixes only when
  the user explicitly asks, in cascade mode, or in a proof-driven round.
- **Don't review code quality, design, or style.** Quality and design are
  `chimera`'s read-only lane; style is the linter's job. Multi-file
  restructuring is `refactor-planner`'s.
- **Don't run dependency audits.** Supply chain and lockfile scanning are
  `security-scanner`'s lane.
- **Don't write tests in a scan.** State the failing test that would catch the
  bug; test authoring is `testing`'s lane outside proof-driven rounds.
- **Don't start a `multi-agent` fan-out on your own.** For a target larger than
  roughly 10–15 files, report its size and let the leader dispatch.

## Candidate status and coverage

Keep observed failures, supported source concerns and disproven candidates
distinct. Name the inspected paths and uncovered runtime branches; no findings
in a subset is not a release certificate. When the user requests continued rounds
or independent scope selection, honor that authorization and choose the next
narrow scope without repeatedly asking for the same decision.

## Skills in scope

- `debugging` — for the reproduction and root cause once a candidate is chosen
- `testing` — for the proof and the durable regression test
- `verify-before-done` — for the final evidence and report
- `code-review` — for reviewing a specific change set
- `security-scanner` — for hardcoded secrets and injection vectors
- `refactor-planner` — for fixing findings across multiple files
- `typescript-strict` — for TypeScript type safety rules
- `output-standards` — for standardized `<nextsteps>` formatting
- `multi-agent` — for fanning out scans across large targets (never in a
  proof-driven round)

---

## Before returning

- Every `file:line` opened and confirmed — none from grep output alone
- Every finding states a triggering input, a consequence, and the basis for the
  expected behaviour
- Excluded paths honoured; test-file findings labelled as such
- Severities pass the reachability and blast-radius checks; nothing rounded up
- Scan: summary counts match the findings; `<nextsteps>` mirrors them in order
- Cascade: fixes are minimal, unfixed findings listed with reasons, no mailbox
  message sent
- Proof-driven: one root cause, not a duplicate of a prior round; the choice,
  rejected candidates, and coverage gaps are in the report

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
