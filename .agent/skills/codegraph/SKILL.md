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

## Overview

CodeGraph is a SQLite-backed knowledge graph that indexes every symbol, edge, and file in the workspace. It provides sub-millisecond read access to structural relationships (callers, callees, dependencies, impact) that would otherwise require expensive grep + file-read loops. Use CodeGraph **before** writing or editing code to understand blast radius, dependency chains, and symbol locations.

### When to Use

- **Pre-refactoring**: Understand what will break before you touch anything
- **Architecture questions**: "How does X work?", "What calls Y?"
- **Import/dependency analysis**: Trace the full dependency chain of any module
- **Dead code detection**: Find components or functions with zero callers
- **Change propagation**: Know which files a modification will ripple through

### When NOT to Use

- Database operations (migrations, queries, RLS policies)
- Git commands (commit, branch, merge)
- Running tests (Vitest, Playwright, Lighthouse)
- Font styling or typography adjustments

---

## Available Tools

All tools are called via the `codegraph` MCP server using `call_mcp_tool`.

| Tool | Description | Key Parameters | When to Use |
|------|-------------|----------------|-------------|
| `codegraph_explore` | **PRIMARY** — Returns verbatim source of relevant symbols grouped by file. Usually the ONLY call needed. | `query` (natural language or symbol names), `maxFiles` (default 12) | Almost any question: "how does X work", architecture, bugs, surveying an area |
| `codegraph_search` | Quick symbol search by name. Returns locations only (no code). | `query`, `kind` (function/method/class/interface/type/variable/route/component), `limit` | Finding a symbol's location before deeper analysis |
| `codegraph_callers` | Lists all functions/components that call a given symbol. | `symbol`, `limit` (default 20) | "Who calls this?", "Who imports this?" |
| `codegraph_callees` | Lists all functions/components that a given symbol calls. | `symbol`, `limit` (default 20) | "What does this function depend on?" |
| `codegraph_impact` | Lists symbols affected by changing a given symbol. Traverses dependency levels. | `symbol`, `depth` (default 2) | Pre-refactor blast radius analysis |
| `codegraph_node` | Full detail for ONE symbol — location, signature, callers/callees trail, optional verbatim body. Handles overloaded names. | `symbol`, `includeCode` (default false), `file`, `line` | When `codegraph_explore` trimmed a body you need, or disambiguating overloaded names |
| `codegraph_files` | Indexed file tree with language + symbol counts. Faster than glob for project layout. | `path`, `pattern`, `format` (tree/flat/grouped), `maxDepth` | Understanding project structure, filtering by directory or glob |
| `codegraph_status` | Index health check: file counts, node counts, edge counts. | `projectPath` | Debugging index freshness issues |

### Example MCP Call

```
call_mcp_tool(
  ServerName: "codegraph",
  ToolName: "codegraph_callers",
  Arguments: { "symbol": "OrbitalProductsShowcase" }
)
```

---

## Use Cases

### 1. Pre-Refactoring Impact Analysis

Before renaming, moving, or restructuring a symbol, understand the full blast radius:

```
Step 1: codegraph_impact → symbol: "Footer", depth: 3
Step 2: Review all affected symbols and files
Step 3: Plan migration path based on dependency graph
```

### 2. Finding All Consumers of a Component

Discover every place a React component or hook is imported and used:

```
Step 1: codegraph_callers → symbol: "useCategories"
Step 2: Review caller locations and usage patterns
```

### 3. Understanding Import / Dependency Chains

Trace the full dependency chain of any module or page:

```
Step 1: codegraph_explore → query: "products page data flow CategoryMasterView"
Step 2: Follow the callee chain for deeper understanding
```

### 4. Dead Code Detection

Find components, functions, or hooks with zero callers:

```
Step 1: codegraph_files → path: "src/components", pattern: "*.tsx"
Step 2: For each symbol, codegraph_callers → check for 0 results
Step 3: Flag unreferenced symbols as potential dead code
```

### 5. Change Propagation Analysis

Understand the ripple effect of modifying a shared utility:

```
Step 1: codegraph_impact → symbol: "cn", depth: 2
Step 2: Group affected files by feature area
Step 3: Create a scoped test plan covering all impacted areas
```

---

## Workflow Examples

### "Who imports OrbitalProductsShowcase?"

```
Tool:   codegraph_callers
Args:   { "symbol": "OrbitalProductsShowcase" }
Result: List of all files and functions that reference this component
```

### "What will break if I change Footer.tsx?"

```
Tool:   codegraph_impact
Args:   { "symbol": "Footer", "depth": 3 }
Result: Full dependency tree of symbols affected by changes to Footer
```

### "Find all THREE.js usage"

```
Tool:   codegraph_search
Args:   { "query": "THREE", "limit": 20 }
Result: All symbols referencing THREE.js with their locations and kinds
```

### "Show dependency chain for the products page"

```
Tool:   codegraph_explore
Args:   { "query": "products page route CategoryMasterView data fetching" }
Result: Verbatim source of relevant symbols grouped by file, showing the full data flow
```

### "What does the useCategories hook depend on?"

```
Tool:   codegraph_callees
Args:   { "symbol": "useCategories" }
Result: All functions, services, and APIs that useCategories calls internally
```

### "Show me the project structure under src/components"

```
Tool:   codegraph_files
Args:   { "path": "src/components", "format": "tree", "maxDepth": 3 }
Result: Hierarchical file tree with language tags and symbol counts
```

---

## Common Tool Chains

| Goal | Chain |
|------|-------|
| Flow / "how does X reach Y" | ONE `codegraph_explore` with symbol names spanning the flow |
| Onboarding / understanding an area | ONE `codegraph_explore` (follow up with `codegraph_node` if needed) |
| Refactor planning | `codegraph_search` → `codegraph_callers` → `codegraph_impact` |
| Debugging a regression | `codegraph_callers` of suspected symbol; widen with `codegraph_impact` |
| Project layout overview | `codegraph_files` with desired format and depth |

---

## Integration with Other Skills

### multi-agent-research

CodeGraph answers structural code queries (callers, callees, dependency chains) that research subagents would otherwise need grep + read loops to resolve. Use `codegraph_explore` as the primary source for code structure questions in research workflows.

### diff-review

Before committing, use `codegraph_impact` on each modified symbol to verify the blast radius matches expectations. Combines well with the diff-review skill's pre-commit checks.

### venthub-auditor

CodeGraph's caller analysis enables dead-code detection at the symbol level. The auditor can flag components with zero callers as candidates for removal, complementing the auditor's integrity checks.

### fallow

CodeGraph provides symbol-level dependency data that complements Fallow's module-level analysis. Use CodeGraph for fine-grained "who calls this function" queries and Fallow for broader unused-dependency and circular-dependency detection.

---

## Anti-Patterns

- **Do NOT grep first** when looking up a symbol — `codegraph_search` is faster and more accurate (AST-parsed, not text-matched).
- **Do NOT chain `codegraph_search` + `codegraph_node`** to understand an area — ONE `codegraph_explore` returns everything in a single round-trip.
- **Do NOT loop `codegraph_node` over many symbols** — `codegraph_explore` returns them all grouped by file in one call.
- **Do NOT re-verify codegraph results with grep** — they come from a full AST parse and are more accurate than text search.
- **After editing, check the staleness banner** — when a tool response shows "⚠️ Some files referenced below were edited since the last index sync…", read those specific files for accurate content. Trust codegraph for everything else.

---

## AXIOMS

1. **CodeGraph is always the first tool for structural queries.** Before using grep, file-read, or manual search, check if CodeGraph can answer the question directly.
2. **`codegraph_explore` is the primary entry point.** Start with explore for any "how does X work" or "what is X" question. Only reach for specialized tools (`callers`, `callees`, `impact`) when you need a specific relationship.
3. **Trust AST over text.** CodeGraph's index is built from full AST parsing. Its results are more reliable than regex-based search for structural relationships.
4. **Index freshness matters.** The index lags file writes by ~1 second. After edits, check the staleness banner and use `codegraph_status` if debugging freshness.
5. **Cross-file resolution is best-effort.** Ambiguous calls may return multiple candidates. Use the `file` and `line` parameters on `codegraph_node` to disambiguate.
6. **CodeGraph supplements, not replaces.** TypeScript compiler, test suites, and linters still own correctness validation. CodeGraph provides structural context they don't have.
