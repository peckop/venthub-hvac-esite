---
name: web-performance
description: "Web performansı: LCP, INP, CLS ölçümü ve iyileştirme; üretim derlemesinde aynı koşulda önce/sonra, geliştirme sunucusu ölçümü kanıt değil. Tetik: \"LCP\", \"INP\", \"CLS\", \"Core Web Vitals\", \"sayfa yavaş\". WrongStack 1.1.0 uyarlaması."
category: quality
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/web-performance/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-12 (YTN-18, OPS onayı 12 Ekim ilk dalga) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/web-performance/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

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

## Sources

[Web Vitals](https://web.dev/articles/vitals), reviewed 2026-10-09.
Refresh thresholds and measurement tooling before consequential claims.

## Acceptance checks

- Compare the same route and conditions before/after; verify observed user-visible improvement.

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
