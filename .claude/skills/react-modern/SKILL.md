---
name: react-modern
description: "Modern React 19 yazım kuralları: RSC sınırı, Compiler uyumu, durum ve efekt disiplini. Tetik: \"React bileşeni\", \"useEffect\", \"RSC\"."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/react-modern/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/react-modern/SKILL.md`, MIT lisansı. Aşağıdaki
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
| React Compiler uyumu (satır ~38) | Uyumlu: depoda React 19 + Compiler var |
| Örnek kodlardaki gömülü metinler (satır ~100-102) | **Kopyalanmaz**: kural 7 (kullanıcıya görünen metin sözlükten gelir); skill adımı değil örnektir |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. RSC sınırı kural 4 ile uyumlu: `page.tsx` Server Component; `'use client'` yalnız etkileşimli uç bileşende.
2. Kural 8: Tailwind'de arbitrary değer yasak, token kullan; renk HEX değil CSS custom property (HSL).

---

# Modern React

## Overview

Most React bugs come from the same few places: state that should have been
derived, effects used as event handlers, and data fetching that races. Before
applying any pattern, establish the setup — the React version in package.json,
and whether a framework with Server Components (Next.js App Router, React
Router framework mode) is in play or it is a client-only app (Vite, CRA, Expo).
Several "modern" rules only apply to one of the two.

## Rules

1. Match the setup. Server Components, `'use client'`, and server actions exist
   only in RSC frameworks. In a client-only app, fetch through the project's data
   layer (TanStack Query, SWR, a loader) instead.
2. Derive, don't sync. If a value can be computed from props or state during
   render, compute it; don't mirror it into state with an effect.
3. Effects are for synchronizing with external systems (subscriptions, DOM
   APIs, timers, non-React widgets). User-caused changes belong in event
   handlers.
4. Every effect that subscribes or starts work returns a cleanup, and every
   async effect guards against stale responses (abort or ignore flag).
5. Never mutate state or props; update with new objects and arrays.
6. Keys are stable identities from the data — never array indexes for lists
   that reorder, insert, or delete.
7. Memoize after measuring, or not at all when the React Compiler is enabled.
   `useMemo`/`useCallback` exist for expensive work and referential stability
   a child or effect actually depends on.
8. Follow the framework's file conventions over style preferences — Next.js
   `page.tsx`, `layout.tsx`, and route files require a default export even when
   the codebase otherwise prefers named exports.
9. Accessible by default: semantic elements, labels on inputs, keyboard
   operability, focus management for dialogs.

## Patterns

```tsx
// Derived value — no state, no effect.
function Cart({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return <p>Total: {formatMoney(total)}</p>;
}

// Effect that syncs with an external system, with cleanup.
function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}

// Client-only fetch without a data library: abort stale requests.
function useUser(id: string) {
  const [state, setState] = useState<{ user?: User; error?: Error }>({});
  useEffect(() => {
    const controller = new AbortController();
    fetchUser(id, controller.signal)
      .then((user) => setState({ user }))
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setState({ error });
      });
    return () => controller.abort();
  }, [id]);
  return state;
}
```

```tsx
// RSC frameworks only: server data in a Server Component, interactivity in a leaf.
export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(id); // runs on the server
  return <ProfileHeader user={user} />;
}

// React 19 form action with pending and error state.
'use client';
function RenameForm({ rename }: { rename: (prev: State, data: FormData) => Promise<State> }) {
  const [state, action, pending] = useActionState(rename, { error: null });
  return (
    <form action={action}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required />
      <button type="submit" disabled={pending}>Save</button>
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
```

## React 19 notes

- `ref` is a regular prop for function components; new code doesn't need
  `forwardRef`.
- `use(promise)` suspends on a promise, which must be created outside render
  (passed from a Server Component, or cached) — a promise created during render
  is recreated on every render.
- Actions (`useActionState`, `useFormStatus`, `useOptimistic`) replace most
  hand-rolled pending and error state for forms.

## Debugging re-renders and stale values

| Symptom | Usual cause | Fix |
|---|---|---|
| Effect runs in a loop | Object or function dependency recreated each render | Move it inside the effect, or derive a primitive dependency |
| Handler sees an old value | Closure captured stale state | Functional update `setX((prev) => …)`, or read the latest value inside the effect |
| Input loses focus while typing | Component defined inside another component, or unstable key | Hoist the component; stable keys |
| List items swap state | Index keys on a reordering list | Keys from item identity |
| Hydration mismatch | Rendering time, randomness, or browser-only values on the server | Render those after mount, or pass them from the server |

## Anti-patterns

- **An effect that sets state from props** — derive it, or reset with a `key`.
- **Fetching in an effect without abort or ignore** — responses arrive out of order.
- **`'use client'` at the top of a whole route tree** in an RSC app — it ships
  everything to the browser.
- **Memoizing everything by default** — cost without a measured benefit.
- **Class components or `forwardRef` in new code** on React 19.

## Before returning

- [ ] Setup identified: React version, and RSC framework or client-only
- [ ] No state mirrored from props; effects only sync external systems, with cleanup
- [ ] Async work guarded against stale responses
- [ ] Stable keys; no state or prop mutation
- [ ] Framework file conventions respected
- [ ] Inputs labelled, keyboard path works

## Skills in scope

- `typescript-strict` — for component and hook typing
- `design-system` — for styling against the project's tokens
- `testing` — for behaviour-level component tests

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
