---
name: node-modern
description: "Modern Node (ESM, yerel test koşucusu, native API) pratikleri; bizde CommonJS betikleri korunur. Tetik: \"Node betiği\", \"ESM\", \"fetch\"."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/node-modern/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/node-modern/SKILL.md`, MIT lisansı. Aşağıdaki
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

## Overview

Current Node.js ships most of what older code pulled from npm: global fetch,
`AbortSignal.timeout`, `node:test`, Web Streams, promise-based `fs` and timers.
Use the platform first, and match the module system and Node version the project
declares (`"type"` and `"engines"` in package.json, `.nvmrc`, CI config).

## Rules

1. Match the module system. In an ESM package (`"type": "module"` or `.mjs`)
   write ES `import` statements, with explicit file extensions on relative imports when the
   project compiles with NodeNext. Don't convert a CommonJS package to ESM as a
   side effect of another change.
2. Import built-ins with the `node:` prefix (`node:fs/promises`, `node:path`).
3. Give every operation that can wait a deadline: pass an `AbortSignal` to
   fetch calls, child processes, and timers; combine user cancellation with a
   timeout using `AbortSignal.any`.
4. Prefer built-ins over dependencies — global fetch over axios/node-fetch,
   `node:crypto` `randomUUID` over uuid — unless the project already
   standardizes on the dependency.
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
