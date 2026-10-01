---
name: mnemosyne
description: "Sage hafızasını düzenli bakıma alır: önce deterministik hygiene ve çıpa doğrulaması, sonra çelişki/tekrar/gürültü incelemesi; silme ve arşiv yalnız öneri olarak dosyalanır. Tetik: \"hafıza bakımı\", \"mnemosyne\", \"hafıza çelişkileri\", \"hafıza temizliği\". WrongStack 1.0.26 uyarlaması."
category: coordination
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/mnemosyne/SKILL.md + instructions/agent-prompt.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 1) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde ve instructions/agent-prompt.md değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/mnemosyne/SKILL.md` ve `instructions/agent-prompt.md`, MIT lisansı.
> Aşağıdaki "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `memory_hygiene`, `memory_verify`, `memory_search`, `memory_update`, `memory_candidates`, `memory_gather_batch`, `remember` | Aynı adlı sage MCP araçları (`mcp__wrongstack-sage__*`) |
| `skill({ name: "mnemosyne", resource: "instructions/agent-prompt.md" })` | `Read` ile `.claude/skills/mnemosyne/instructions/agent-prompt.md` |
| `cron_schedule` / `cron_cancel` | **Yok.** Tekrarlama kurulmaz (karar 53: zamanlayıcı önce Recep'le); bakım yalnız istek üzerine koşar |
| `mail_send(to="*")` / `mailbox` yayını | **Yok.** Rapor OPS'a `SendMessage` ile gider (VentHub ek kural 5) |
| tek atımlık `llm` aracı | Yok; kaynak metnin dediği gibi analiz doğrudan bu oturumda yapılır |
| "Skills in Scope" listesi (`auto-review`, `observability`, `security-scanner`) | `auto-review` bizde yok; `multi-agent`, `verify-before-done` var; gizli bilgi taraması için `scripts/security/secret-scan.py` |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. **Kim koşar:** hafızanın sahibi pencereler (OPS, ARAÇ, HARİTA). Başka departman `memory_update` ya da `memory_hygiene` koşmaz; gördüğü çelişki ve gürültüyü OPS'a **öneri** olarak yollar (hafıza ortak çekirdeğine doğrudan yazılmaz).
2. **⚠"Hygiene silmez" iddiası bizde DOĞRU DEĞİL (kaynak kodla ölçüldü, `sage/dist/index.js:4076, 4486-4487, 4600`):** süresi dolmuş **oturum kapsamlı** (`scope: "session"`) kayıtlar `memory_hygiene` içinde, 7 gün sonra yumuşak silinir (`sessionRetentionDays` varsayılan 7; **araç şemasında yok**, MCP üzerinden değiştirilemez); kuru çalıştırma (dry-run) yok. Bu yüzden kaynaktaki "`deleted` sıfırdan farklıysa hata say" cümlesi bizde geçerli değildir. **Hygiene'den ÖNCE ön adım:** `memory_gather_batch({ statuses: ["active","stale"], limit: 500 })` ile kayıtlardaki `scope: "session"` sayısını yaz. Sıfır değilse hygiene'i koşmadan önce OPS'a "N oturum kapsamlı kayıt, süresi dolanlar silinecek" diye haber ver; sıfırsa devam et. Not: bu kapının çıktısı raporda sayı olarak yer alır.
3. `recordUse` (kullanım sayacı) bu araç yüzeyinde yok; "hiç kullanılmamış" bayrağı bu yüzden tek başına silme/arşiv gerekçesi olmaz.
4. **Silme ve arşiv yalnız öneridir ve kural değişmez:** `memory_delete` çağrılmaz, `status: "deleted"|"archived"` yazılmaz; `memory_candidates({ action: "resolve" })` yalnız **Recep'in kendi sözüyle** koşar. Her öneri satırında desteklenen bir `reason` zorunlu.
5. **Rapor:** OPS'a `SendMessage` ile ≤800 karakter: sayılar (incelenen, tekrar, çıpa doğrulandı, bayat, önerilen) + dosya adresi. Ayrıntılı rapor dosyaya yazılır. Gönderilmeyen yayını "gönderildi" diye yazma.
6. **Yokluk hükmü:** arama sonucunun boş dönmesi "bu bilgi hafızada yok" demek değildir; "şu sorgularla bulunamadı" diye yazılır.

---


# Mnemosyne — SAGE Memory Custodian

## Overview

Mnemosyne is the repeatable memory-curation workflow for any project using
WrongStack SAGE memory. It is not a separate storage engine and does not make
an LLM the source of truth. The runtime tools perform deterministic cleanup and
verification; semantic analysis is a bounded second pass over their results.

WrongStack discovers this bundled skill at boot. Every prompt mode receives its
name and trigger. Eager mode may inject this body directly; progressive mode
loads it through the `skill` tool. The detailed execution prompt is bundled as
`instructions/agent-prompt.md` and should be loaded before a deep review.

## Runtime Contract

Use only surfaces that are actually registered in the current session:

| Surface | Purpose |
|---|---|
| `memory_hygiene` | Deterministic deduplication, anchor verification, stale marking, superseding, and review-candidate creation |
| `memory_verify` | Targeted or full anchor verification |
| `memory_search` | Retrieve related memories for contradiction and duplication checks |
| `memory_update` | Apply non-terminal corrections: text, classification, confidence, relationships, or `stale` status |
| `memory_candidates` | File and inspect non-destructive review proposals; explicit resolution is a separate user-authorized action |
| `skill` | Load this body and `instructions/agent-prompt.md` in progressive mode |
| `cron_schedule` / `cron_cancel` | Optional in-session recurrence when the cron plugin is available |
| `mail_send` / `mailbox` | Optional report delivery when mailbox tools are available |

There is currently no standalone `/mnemosyne` slash command, implicit startup
hook, or `mnemosyne_*` config namespace. Do not claim that one exists. Users can
ask for a “Mnemosyne review”, load it explicitly with `/skill mnemosyne`, or use
the existing `/memory hygiene`, `/memory verify`, and `/memory candidates`
surfaces.

## Workflow

### 1. Deterministic hygiene

Start every cycle with:

```text
memory_hygiene({ verify: true })
```

Capture the returned counts. This phase may deduplicate, mark stale anchors,
supersede obsolete versions, and create review candidates. It must not delete
or archive memories. Treat non-zero `deleted` or `archived` counters as a bug.

Run `memory_verify` separately only when you need a targeted re-check or when
hygiene could not complete verification.

### 2. Bounded semantic review

Search for related active/stale memories and review them in bounded batches.
For the detailed review workflow, load:

```text
skill({ name: "mnemosyne", resource: "instructions/agent-prompt.md" })
```

Evaluate:

1. Contradictions between memories.
2. Duplicate or mergeable facts missed by exact matching.
3. Vague, transient, or low-value entries.
4. Incorrect kind, scope, importance, or confidence.
5. Drift between anchored code and the memory claim.

Do not infer that a missing search result means a memory does not exist. Keep
batch sizes and LLM calls bounded, and leave unchanged memories untouched.

### 3. Apply safe corrections

Direct updates are allowed only for non-terminal corrections:

- Fix inaccurate text when current project evidence is clear.
- Correct kind, scope, importance, or confidence.
- Mark a contradicted or invalid entry `stale`.
- Link superseding/contradicting memories or mark a duplicate `superseded`.

For deletion or archival recommendations, file a proposal:

```text
memory_candidates({
  action: "propose",
  text: "Concise review finding",
  memory_id: "mem_target",
  reason: "Why this memory needs user review",
  suggested_action: "delete" | "archive" | "investigate"
})
```

Never trigger `memory_delete`, never set `status: "deleted"`, and never set
`status: "archived"` as part of an autonomous Mnemosyne cycle. The user owns
the later `memory_candidates({ action: "resolve", ... })` decision.

### 4. Report

Return a concise report containing:

- Trigger (`on_demand` or `cron`).
- Examined, deduplicated, verified, staled, and superseded counts.
- Semantic findings and safe corrections applied.
- Review proposals filed, grouped by suggested action.
- Errors or skipped checks.

Broadcast the report only when a mailbox tool is registered and coordination is
active. Never invent a successful broadcast or scheduled cycle.

## Optional Recurrence

Recurring curation is explicitly opt-in and session-scoped. When
`cron_schedule` is registered, schedule a plain-language action that causes a
future agent turn to run this workflow, for example:

```text
cron_schedule({
  name: "mnemosyne-review",
  intervalMs: 21600000,
  action: "Run the bundled mnemosyne workflow: deterministic hygiene first, then bounded semantic review, propose-only for delete/archive."
})
```

Do not describe this as a persistent daemon: cron jobs belong to the live
runtime and must be inspected or cancelled through the cron tools. If those
tools are absent, run on demand instead.

## Guardrails

- Deterministic checks always precede LLM analysis.
- Destructive and terminal outcomes are proposal-only.
- Permanent and high-importance memories receive extra scrutiny; never bypass
  store protections with `force`.
- A memory that passes review is not rewritten merely to bump timestamps.
- Record evidence for each mutation in the report; every proposal includes its supported `reason`.
- A failed batch does not invalidate successful deterministic results.
- Never advertise commands, config keys, background services, or tools that
  are not present in the live runtime.

## Out of scope

- **Don't delete or archive memories autonomously.** `memory_delete` and `status: "deleted"` / `"archived"` are not part of an autonomous Mnemosyne cycle. File `memory_candidates` proposals and let the user resolve.
- **Don't re-author untouched memories to bump timestamps.** A memory that passes review stays as it is. Bumping timestamps corrupts recency signals and churns the store.
- **Don't skip the deterministic pass.** Hygiene, anchor verification, and supersede/stale marking are run before any LLM analysis. The LLM is a bounded second pass over deterministic results, not a replacement.
- **Don't infer absence from a missing search result.** A search miss is not proof a memory doesn't exist. Report what was searched; let deterministic checks carry the absence claim.
- **Don't claim a successful broadcast or scheduled cycle that didn't run.** If the mailbox or cron tools are absent, say so. Never invent a successful delivery or a scheduled job.
- **Don't describe cron as a persistent daemon.** Cron jobs belong to the live runtime; they must be inspected and cancelled through the cron tools. The skill is session-scoped.
- **Don't bypass store protections with `force`.** Permanent and high-importance memories receive extra scrutiny. Bypassing protections is a bug, not a feature.
- **Don't use it as a generic memory CRUD layer.** Mnemosyne is the curation workflow. Direct memory creation/update without going through the workflow is the wrong lane.

## Before returning

- [ ] `memory_hygiene({ verify: true })` ran first; counts captured
- [ ] Non-zero `deleted` or `archived` counters treated as a bug and reported
- [ ] Bounded semantic review searched related memories, not whole store
- [ ] Direct updates only for non-terminal corrections (text, classification, confidence, `stale`, supersede/contradict links)
- [ ] Deletion or archival recommendations filed as `memory_candidates` proposals, not applied
- [ ] Every proposal includes a supported `reason`
- [ ] Report contains trigger, counts, safe corrections, proposals, errors
- [ ] Broadcast only when mailbox tools are registered and coordination is active
- [ ] No claim of scheduled cycle or broadcast that didn't actually run

## Skills in Scope

- `auto-review` — bounded background-review and reporting patterns.
- `multi-agent` — delegated semantic review when a separate context is useful.
- `observability` — structured cycle reporting without leaking memory content.
- `security-scanner` — identify secrets or sensitive data accidentally stored
  in memory; remediation remains proposal-first.

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
