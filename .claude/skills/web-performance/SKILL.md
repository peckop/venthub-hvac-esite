---
name: web-performance
description: "Web performansı: LCP, INP, CLS ölçümü ve iyileştirme; üretim derlemesinde aynı koşulda önce/sonra, geliştirme sunucusu ölçümü kanıt değil. Tetik: \"LCP\", \"INP\", \"CLS\", \"Core Web Vitals\", \"sayfa yavaş\". WrongStack 1.1.0 uyarlaması."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/web-performance/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-12 (YTN-18, OPS onayı 12 Ekim ilk dalga) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/web-performance/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde WrongStack metnidir. addyosmani kaynaklı bölümlerin altında kendi
> kaynak satırı var. VentHub'a uyarlandı, 26 Ekim 2026, YTN-21.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `nextjs-modern` atfı (Skills in scope) | Bizde yok ve **alınmadı** (kaynak "Next 16'yı hedefle" der, bizde 15.5; PPR kullanılmıyor). Yerine `venthub-architecture` ve `docs/standards/rendering-cache-standard.md` |
| `threejs-3d` atfı | Bizde yok. Yerine `threejs-webgl-performance` |
| `motion-design` atfı | Bizde yok; atıf yok sayılır. Animasyon maliyeti için `web-platform-baseline` (Framer Motion kullanılıyor) |
| "Build/run production" | `pnpm build` + `pnpm start` (yerel); canlı ölçüm `venthub.com.tr` (kanonik, www'suz) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Ölçüm üretim derlemesinde ve aynı koşulda yapılır; `pnpm dev` ölçümü kanıt değildir (kaynak kural 1). Sayfanın üretilme biçimi (SSG / talep üzerine ISR; **PPR kullanılmıyor**) `docs/standards/rendering-cache-standard.md` içinde yazılıdır: "yavaş" iddiası önce bu cetvelle okunur.
2. Sunucu gövdesi ile istemci performansı ayrı ölçülür: `useSearchParams` sınırı sayfa köküne konursa sunucu gövdeyi 0 kelime verir (CLAUDE.md kural 5, REC-150 ölçümü); performans düzeltmesi bu sınırı bozmaz.
3. Çekirdek Web Vitals eşikleri (2,5 s / 200 ms / 0,1) kaynağın web.dev referansıdır; Recep'e kendi ölçümünü ve koşulunu yaz, eşik tablosunu bizim sonucumuz diye sunma.
4. Düzeltme kural 8 (design token) ve kural 10 (`.content-auto`, `<Image/>` width/height) ile çelişmez; çelişirse önce kural.
5. Önbellek anahtarı (`unstable_cache`, `revalidateTag`, CDN) `lang` **ve** `tenantId` içerir (kural 12); görüntüleyene bağlı veri anahtarda eksikse bir kullanıcının verisi ötekine gider. Veri değişince hangi yüzeyin tazelendiği `rendering-cache-standard.md` ile okunur.
6. Dev sunucusu ölçümü kanıt değildir: önce/sonra aynı üretim derlemesinde ve aynı koşulda alınır. Yerelde tam test/build koşmaz; `pnpm test:ilgili` ya da `pnpm exec vitest run <yol>`, tam paket CI'da. Veri çekme RSC'de kalır (kural 4); "performans için" istemciye taşıma yapılmaz.
7. Bütçe evrensel sayıyla değil, ürün ve cihaz ihtiyacından ve ölçülmüş tabandan konur (aşağıdaki kural 6); hazır bundle/Lighthouse puanı hedefi kopyalanmaz.

---

# Web Performance

## Selection card
- Task: Measure and improve browser loading and interaction.
- Start: Locate the affected route/component and its runtime/lockfile.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Optimize the measured bottleneck. Current Core Web Vitals are LCP, INP and CLS;
good thresholds are at most 2.5 seconds, 200 milliseconds and 0.1 respectively
at the 75th percentile. Field evidence and local lab runs answer different questions.

## Rules

1. Record route, commit/input state, build mode, device, network, cache and data.
   Development-server measurements are not production performance.
2. Trace the user's critical task before proposing changes. Separate network,
   server, main-thread, layout and rendering delay.
3. Prioritize the LCP resource, input blocking and unexpected layout shifts.
   Do not optimize a Lighthouse score while making the real interaction worse.
4. Compare equivalent conditions with repeated measurements. Report distributions
   and variability rather than a best run or invented percentage.
5. Keep analytics labels bounded and sensitive data out of performance telemetry.
6. Set budgets from product/device needs and an observed baseline. Avoid one
   universal bundle-size or fps mandate.

## Workflow

1. Build/run production and exercise a representative cold/warm user journey.
   Gather browser traces, network waterfall and available field metrics.
2. Identify the largest bottleneck with file/resource/call-stack evidence.
3. Apply a narrow change: resource priority, image sizing, route splitting,
   caching, rendering work or long-task decomposition as indicated.
4. Test the interaction, responsive behavior and accessibility after optimization.
5. Repeat the same measurement and report sample count, conditions, results
   and tradeoffs. Run affected build/tests.

## Where to start measuring

Pick the first measurement from the symptom:

- **First load slow:** bundle size and code splitting; TTFB in the network waterfall (DNS long: preconnect; TCP/TLS long: HTTP/2, edge; server wait long: profile backend, queries, caching); render-blocking CSS/JS.
- **Interaction sluggish:** UI freezes on click: main-thread long tasks (over 50 ms); input lag: re-renders and controlled-input cost; animation jank: layout thrashing, forced reflow.
- **After navigation:** data loading: API times and request waterfalls; client rendering: component render time, N+1 fetches.
- **Backend/API:** one endpoint slow: queries and indexes; all endpoints slow: connection pool, memory, CPU; intermittent: lock contention, GC pauses, external dependencies.

| Symptom | Likely cause | Check |
|---|---|---|
| Slow LCP | large images, render-blocking resources, slow server | waterfall, image sizes |
| High CLS | images without dimensions, late content, font shifts | layout-shift attribution |
| Poor INP | heavy main-thread JS, large DOM updates | long tasks in the trace |

Saha ölçümünde (RUM) `web-vitals` kütüphanesinin ayrıntılı derlemesi `web-vitals/attribution` yolundan gelir. Aynı dosyada hem ana paketten hem bu yoldan `onINP` alınırsa ad çakışır; ayrıntılı olanı takma adla al (`import { onINP as onINPAttribution } from 'web-vitals/attribution'`). İki ölçüm yolu aynı etkileşimi iki kez raporlamasın diye tek yol seçilir.

Kaynak: addyosmani/agent-skills performance-optimization @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)
Kaynak: addyosmani/agent-skills references/performance-checklist.md @8bfcc1f9916f2eea55494d8c1fa7f4bde867dd9e (MIT)

## Backend (Supabase / PostgreSQL)

- **N+1:** one query per row is the commonest backend bottleneck; fetch the relation in the same query (join/embedded select), not in a loop. Lists paginate with a limit and a stable order.
- **Index claims need a plan.** `EXPLAIN ANALYZE` measures, "add an index" guesses. `Seq Scan` where an index was expected, a `rows=` estimate off by an order of magnitude (stale statistics: run `ANALYZE`, do not add an index), or a `Sort` above the scan each call for a different fix. Index for the query shape (equality columns first, then range/sort); a plain index does not help a low-selectivity value, a leading wildcard, or a function on the column (index the expression). Every index taxes writes. Re-run the plan afterwards; an index that did not change it is a revert. Migration is prod (kural 13): index migrations follow `create-migration`.
- **Pool exhaustion:** every endpoint slows at once and sessions sit idle; raising the pool only moves the queue. Serverless: multiplex through the pooler instead of raising `max`.
- **Caching:** cache only what is expensive and read far more than written; state the staleness window and one invalidation strategy; never cache what must be fresh (stock and price at checkout, permissions). Key contents: see ek kural 5.

Kaynak: addyosmani/agent-skills performance-optimization @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

## Keep or revert

A fix is a hypothesis until re-measured with the same command, conditions and sample budget as the baseline (cold versus warm cache measures the cache, not the change). Change one thing at a time. Compare the delta against run-to-run variance: a 3% gain inside ±5% noise is not a gain.

| Result vs. baseline | Action |
|---|---|
| Past the threshold, tests green | Keep; put before/after numbers in the PR |
| Within noise | Revert |
| Worse | Revert |
| Improved but a test went red | Revert |

Neutral is a revert: code you keep, you maintain. Correctness gates the metric; a win that drops needed work (skipped validation, caching fresh-only data, removing a load-bearing `await`) is a regression.

**Attempt ledger.** Reverted work leaves no trace in git, so log every attempt in the Kanban card (or PR description): idea, baseline → result, verdict (kept/reverted), why. Read it before proposing an experiment so a dead idea stays dead.

Kaynak: addyosmani/agent-skills performance-optimization @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

## Sources

[Web Vitals](https://web.dev/articles/vitals), reviewed 2026-10-09.
Refresh thresholds and measurement tooling before consequential claims.

## Acceptance checks

- Compare the same route and conditions before/after; verify observed user-visible improvement.
- [ ] Before and after numbers exist, measured the same way (same command, conditions, production build)
- [ ] The improvement exceeds run-to-run variance, not just the mean
- [ ] Changes that did not beat the baseline were reverted; every attempt is in the ledger
- [ ] The specific bottleneck is identified and addressed; one change measured at a time
- [ ] Core Web Vitals reported with own measurement and condition (ek kural 3)
- [ ] Bundle size has not grown unreviewed; no N+1 in new data fetching
- [ ] Any new index has a before/after plan and a stated write cost; any new cache states its key (`lang`, `tenantId`) and staleness
- [ ] The measured user-facing metric has a budget or field monitor that can detect regression
- [ ] Existing tests still pass; no test was changed, skipped or deleted to get the win

Kaynak: addyosmani/agent-skills performance-optimization @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

## Skills in scope

- observability — field metrics and diagnostics.
- nextjs-modern — framework rendering/caching.
- motion-design — animated interaction cost.
- threejs-3d — canvas and asset profiling.

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
