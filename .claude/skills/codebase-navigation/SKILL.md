---
name: codebase-navigation
description: "Kod tabanında gezinme: tanım, çağıran, etki; bizde codebase_* ve codegraph araçları. Tetik: \"nerede tanımlı\", \"kim çağırıyor\", \"etki analizi\"."
category: research
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/codebase-navigation/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/codebase-navigation/SKILL.md`, MIT lisansı. Aşağıdaki
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
| `codebase-index` (dizin kurma / yenileme) | Bizde kayıt **salt-okuma**; kurma/yenileme yapılamaz (kural: önce `graphify query` / `codegraph_explore`, sonra `Grep`) |
| Satır ~110-112 atıfları (`refactor-planner`, `debugging`, `code-review`, `multi-agent`) | Dördü de depoda (WrongStack alımı 1. ve 2. paket) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. CLAUDE.md "Bilgi kaynağı iş akışı": kod yapısı sorusunda önce CodeGraph/graphify; çelişirse kod kazanır.

---

# Codebase Navigation

## Overview

Reading files top to bottom is the slowest way to understand code and the
fastest way to fill the context window. Navigate from structure to detail:
orient, locate, trace, then read only the lines that matter. WrongStack's
codebase index turns most of these steps into a single call; without it, the
same moves work with glob, grep, and ranged reads.

## Rules

1. Orient before diving: project manifests, README / AGENTS / CONTRIBUTING, the
   top-level layout, entry points, and where tests live.
2. Search by meaning when you don't know the name, by name when you do, and by
   exact text for strings, config keys, and error messages.
3. Read skeletons before bodies — signatures, types, and exports carry most of a
   module's contract.
4. Once you know the line, read that range, not the whole file.
5. Trace relationships through the reference graph (callers, callees, imports)
   instead of guessing from file names.
6. Don't conclude absence from one empty search. Retry with another query, a
   wider scope, or exact grep — dynamic registration, string dispatch, and
   generated code are invisible to indexes.
7. Keep a running map of key files, entry points, and traced flows so nothing
   gets read twice.

## Tool ladder

| Need | With the codebase index | Without it |
|---|---|---|
| Architecture at a glance | codebase-repo-map tool (hub files ranked by centrality) | Manifests, top-level directories, entry points |
| Code for a described behaviour | codebase-context tool | grep for domain words; glob for likely file names |
| A symbol by name or kind | codebase-search tool | grep for the declaration |
| A module's contract | codebase-skeleton tool | Read only exports and type definitions |
| Who calls this, what it calls | codebase-incoming-calls and codebase-outgoing-calls tools | grep the name, read the call sites |
| What breaks if it changes | codebase-impact-analysis tool | Callers plus the tests that import it |
| Whether the index is trustworthy | codebase-stats tool; codebase-index tool to build or refresh | — |
| Exact strings and config keys | grep | grep |

## Workflows

### "Where is this handled?"

1. Describe the behaviour to the codebase-context tool (or grep domain words).
2. Read the relevant declaration range of the top result.
3. Confirm with one hop of callers or callees before answering.

### "How does a request flow?"

1. Find the entry: route table, CLI command registry, event or queue handler.
2. Follow outgoing calls one hop at a time and write the chain down:
   handler → service → repository → query.
3. Note where data is validated, transformed, persisted, and where errors are
   handled.

### "Where should my change go?"

1. Find the closest existing feature that does something similar, and mirror its
   structure and naming.
2. Check the impact of every symbol you plan to touch.
3. Find that neighbour's tests; new tests go beside them.

### Index missing or stale

If search returns nothing for code you can see, check index health with the
codebase-stats tool and rebuild with the codebase-index tool, or fall back to
grep. Vendored, generated, and dynamically registered code may never be indexed.

## Reporting what you found

```text
## How order placement works
Entry: src/routes/orders.ts:24 (POST /orders)
Flow: createOrder → OrderService.place (src/services/order.ts:58) → OrderRepo.insert (src/db/orders.ts:31)
Validation: request schema at src/routes/orders.ts:12
Side effects: emits order.placed (src/services/order.ts:90), consumed by src/workers/email.ts:15
Tests: tests/services/order.test.ts
Not traced: whether the email worker retries on failure
```

## Anti-patterns

- **Reading whole large files** to find one function.
- **"Not used" or "doesn't exist"** from a single empty search.
- **Architecture guessed from directory names.**
- **Re-reading the same files** because no map was kept.
- **Recursive tree dumps** of the entire repository.

## Before returning

- [ ] Claims about location and flow cite file:line
- [ ] Absence claims backed by more than one search method
- [ ] Untraced links in a flow labelled as such

## Skills in scope

- `refactor-planner` — when the map feeds a multi-file change
- `debugging` — when navigation is in service of a failure
- `code-review` — for checking the blast radius of a change set
- `multi-agent` — for surveying a very large codebase in parallel

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
