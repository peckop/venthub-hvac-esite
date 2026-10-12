---
name: node-modern
description: "Modern Node (ESM, yerel test koşucusu, native API) pratikleri; bizde CommonJS betikleri korunur. Tetik: \"Node betiği\", \"ESM\", \"fetch\"."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/node-modern/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi; 1.1.0'a taşındı: YETENEK 2026-10-12 (YTN-18), kaynak gövde 1.1.0 ile yeniden eşitlendi, ek bölümler korundu"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/node-modern/SKILL.md`, MIT lisansı. Aşağıdaki
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
| Node sürümü | `engines.node "24.x"` (package.json) ile uyumlu; yerelde Node 22 olabilir (`assert-node-major` uyarısı bloke etmez) |
| "CommonJS'i yan etki olarak ESM'e çevirme" | Aynen geçerli: `scripts/board/board.cjs` gibi `.cjs` betikler korunur |
| Edge fonksiyonları | Deno'dur; Node'a özgü örnekler onlara uymaz |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Çelişen satır yok; olduğu gibi alındı.

---

# Modern Node.js

## Selection card
- Task: Node runtime APIs, ESM and async cancellation.
- Start: Locate the affected route/component and its runtime/lockfile.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Current Node.js (v26.11.1 as checked 2026-10-09) ships natively what older code pulled from npm:
native TypeScript type stripping (`node file.ts`), native `.env`
loading (`node --env-file`), built-in SQLite (`node:sqlite`), global WebSocket,
`Promise.withResolvers()`, global fetch, `AbortSignal.timeout`, `node:test`, Web Streams,
and `node --run`. Prefer the platform when its semantics fit; do not remove needed capabilities merely to reduce dependency count.

## Rules

1. **Pre-flight: Inspect repo runtime & live Node.js LTS schedule first.** Check `package.json`
   `"engines"`, `.nvmrc`, `.node-version`, and check `node -v` to determine the active engine.
   Check the official Node.js release schedule online to ensure target runtime aligns with
   active LTS or the requested latest stable channel; verify support status from the current release schedule.
2. Match the module system. In an ESM package (`"type": "module"` or `.mjs`)
   write ES `import` statements, with explicit file extensions on relative imports when the
   project compiles with NodeNext. Don't convert a CommonJS package to ESM as a
   side effect of another change.
3. Import built-ins with the `node:` prefix (`node:fs/promises`, `node:path`, `node:sqlite`).
3. Prefer native platform features over npm bloat:
   - Use native `node --env-file=.env` instead of installing `dotenv`.
   - Use native `globalThis.fetch()` instead of `axios` or `node-fetch`.
   - Native WebSocket covers standard clients; verify the required client/server features before replacing ws.
   - Use native `node:sqlite` for local structured caching and data storage.
   - Use native `node:crypto` `randomUUID()` instead of `uuid`.
   - Use `Promise.withResolvers()` instead of hand-rolled deferred promises.
4. Give every operation that can wait a deadline: pass an `AbortSignal` to
   fetch calls, child processes, and timers; combine user cancellation with a
   timeout using `AbortSignal.any`.
5. Handle `ENOENT` by reading inside try/catch and branching on `err.code`;
   checking `access` first is a race (TOCTOU).
6. Never block the event loop in a server or CLI hot path: no `*Sync` fs calls
   or CPU-heavy loops on request paths.
7. Pass arguments to child processes as an array (`execFile`/`spawn`), never by
   interpolating into a shell string.
8. Every promise is awaited, returned, or explicitly handled; let entry points
   report unhandled rejections instead of swallowing them.

## Patterns

```ts
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Deadline plus user cancellation.
export async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const deadline = AbortSignal.timeout(10_000);
  const res = await fetch(url, { signal: signal ? AbortSignal.any([signal, deadline]) : deadline });
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return res.json();
}

// Missing file is an expected outcome, not an exception.
export async function readOptional(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw err;
  }
}

// Atomic replace: readers never observe a half-written file.
export async function writeAtomic(target: string, data: string): Promise<void> {
  const tmp = `${target}.${randomBytes(4).toString('hex')}.tmp`;
  await writeFile(tmp, data);
  await rename(tmp, target);
}

// Cancellable delay — the promise API takes a signal; the global setTimeout does not.
await delay(500, undefined, { signal: AbortSignal.timeout(5_000) });

// Arguments as an array — no shell, no injection.
const { stdout } = await execFileAsync('git', ['log', '--oneline', '-5'], {
  signal: AbortSignal.timeout(15_000),
});

// Partial failure is acceptable: collect every outcome.
const results = await Promise.allSettled(urls.map((url) => getJson(url)));
const failed = results.filter((r) => r.status === 'rejected');
```

In ESM, `__dirname` doesn't exist: use `import.meta.dirname` on current Node, or
`path.dirname(fileURLToPath(import.meta.url))` on older releases.

## Anti-patterns

| Anti-pattern | Why it hurts | Instead |
|---|---|---|
| `fetch(url)` with no signal | Hangs forever on a stalled server | `AbortSignal.timeout()` |
| `exec(\`cmd ${input}\`)` | Shell injection | `execFile` with an argument array |
| `existsSync` then `readFile` | Race between check and use | try/catch on the read |
| `readFileSync` in a request handler | Blocks every other request | `node:fs/promises` |
| Catching an `AbortError` and continuing silently | Hides timeouts and cancellations | Rethrow, or report it as a timeout |
| `writeFile` directly over a config or state file | A crash leaves it truncated | Write to a temp file, then rename |

## Before returning

- [ ] Module system and Node version match what the project declares
- [ ] Built-ins imported with `node:`; no new dependency the platform covers
- [ ] Every network call, child process, and delay is cancellable or bounded
- [ ] Child-process arguments passed as arrays
- [ ] Missing-file and abort cases handled deliberately; no floating promises

## Current runtime and ownership

Latest stable checked 2026-10-09: Node.js 26.11.1 (Current), Bun 1.4.2,
pnpm 12.10.1. Refresh the official release/registry before recommendations.
Current and LTS are different channels; do not label Current as LTS.
Native TypeScript execution strips supported syntax; it does not typecheck or
implement tsconfig path aliases. Verify the real module/resolution contract.
Native WebSocket is a client API; server behavior may require a dependency.
For atomic replacement, use an exclusively created temp file in the same
directory and clean only owned intermediates on failure. Rename is not durability,
cross-filesystem atomicity or concurrency control. Recheck generation after awaits.

## Skills in scope

- `typescript-strict` — for typing Node.js APIs and boundaries
- `security-scanner` — for shell, path, and SSRF exposure in I/O code
- `testing` — for testing async and time-based logic with fake timers

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
