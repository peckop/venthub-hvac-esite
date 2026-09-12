---
name: codegraph
description: "Codebase intelligence via CodeGraph MCP. Use for caller/callee analysis, impact assessment, dependency chain exploration, and symbol search. Trigger for import analysis, 'who uses X', 'what calls Y', impact analysis, or dependency exploration. Do NOT use for database operations, git commands, running tests, or font styling."
category: intelligence
metadata:
  triggers:
    - kim kullanıyor
    - who calls
    - who uses
    - import analizi
    - import zinciri
    - impact analizi
    - bağımlılık zinciri
    - bağımlılık analizi
    - dependency chain
    - caller analysis
    - bu değişiklik neyi etkiler
    - hangi dosyalar etkilenir
    - hangi bileşenler
    - hangi dosyaları
    - kim çağırıyor
    - what depends
    - find all callers
    - symbol search
    - code graph
  inputs:
    - symbol name or file path
  outputs:
    - caller/callee graph
    - impact analysis report
  commands:
    status: "Use codegraph_status MCP tool to check index health"
  prerequisites:
    - codegraph MCP server running
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# CodeGraph — Codebase Intelligence Skill

CodeGraph is a SQLite-backed AST knowledge graph of every symbol, edge, and file in the workspace. Reads are sub-millisecond; the index lags file writes by ~1 second. Consult it **before** writing or editing code — for any structural question ("who calls X", "what breaks if I change Y", "where is Z"), go to CodeGraph **before** grep.

**Tool selection and usage rules are loaded every session via the MCP server's own instructions — follow those.** Default entry point: `codegraph_explore` (one call answers most questions).

## When to Use

- **Pre-refactoring**: Understand what will break before you touch anything
- **Architecture questions**: "How does X work?", "What calls Y?"
- **Import/dependency analysis**: Trace the full dependency chain of any module
- **Dead code detection**: Find components or functions with zero callers
- **Change propagation**: Know which files a modification will ripple through

## When NOT to Use

- Database operations (migrations, queries, RLS policies)
- Git commands (commit, branch, merge)
- Running tests (Vitest, Playwright, Lighthouse)
- Font styling or typography adjustments

---

## Anti-Patterns

- **Do NOT grep first** when looking up a symbol — `codegraph_search` is faster and more accurate (AST-parsed, not text-matched).
- **Do NOT chain `codegraph_search` + `codegraph_node`** to understand an area — ONE `codegraph_explore` returns everything in a single round-trip.
- **Do NOT loop `codegraph_node` over many symbols** — `codegraph_explore` returns them all grouped by file in one call.
- **Do NOT re-verify codegraph results with grep** — they come from a full AST parse and are more accurate than text search.
- **After editing, check the staleness banner** — when a tool response shows "⚠️ Some files referenced below were edited since the last index sync…", read those specific files for accurate content. Trust codegraph for everything else.

---

## AXIOMS

1. **CodeGraph is the first tool for structural queries** — before grep, file-read, or manual search.
2. **`codegraph_explore` is the primary entry point.** Reach for `callers`/`callees`/`impact` only when you need one specific relationship.
3. **Trust AST over text** for structural relationships.
4. **Index freshness matters** — ~1s lag after writes; check the staleness banner, use `codegraph_status` when debugging.
5. **Cross-file resolution is best-effort** — disambiguate overloaded names with `codegraph_node`'s `file`/`line` params.
6. **CodeGraph supplements, not replaces** — tsc, tests, and linters still own correctness.

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
