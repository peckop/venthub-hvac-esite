---
name: web-platform-baseline
description: "Web platformu temel çizgisi: güncel CSS/HTML/JS özellikleri ve tarayıcı desteği, tarihli doğrulama. Tetik: \"container query\", \"tarayıcı desteği\", \"modern CSS\"."
category: research
metadata:
  kaynak: "WrongStack @wrongstack/core 1.0.26 skills/web-platform-baseline/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-01 (REC-519, WrongStack alımı PR 3) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.0.26, `skills/web-platform-baseline/SKILL.md`, MIT lisansı. Aşağıdaki
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
| `research-web` (SKILL.md ~59, 126) | `research-web` bu alımla depoda; araçları `WebSearch` / `WebFetch` |
| **"Kural 6: referans dosyayı aynı turda düzelt" (SKILL.md ~98-100)** | **Departman ajanı skill dosyasını DÜZENLEYEMEZ**: `.claude/skills/**` YETENEK'in yetkisindedir. Bayat satır görülürse YETENEK'e bildirilir |
| `css.md` ~84, 95, 100: `color-mix(in oklch…)` ve serbest `clamp(…)` | Tailwind sınıfına taşınırsa **kural 8 ihlali** (arbitrary değer; renk HSL custom property) |
| `css.md` ~63-64: `@container` | Tailwind 3.4'te eklenti ister; config'te var mı **ölçülmedi** |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Tazelik: kaynakta `verified: 2026-09-16` (14 gün, 90 gün eşiği içinde); eşik aşılınca içerik yeniden doğrulanmadan hüküm olarak kullanılmaz.

---

# Web Platform Baseline — WrongStack

## Why this exists

Two failure modes, both expensive:

1. **Stale caution** — writing a media-query ladder, a JS resize observer, or a
   z-index hack for something the platform has shipped for years. This is the
   most common source of dated-looking, over-engineered UI code.
2. **Stale confidence** — asserting support for something that is still behind
   a flag, or naming a syntax that changed during standardization.

Model training data guarantees both. This skill is the correction: every fact
lives in a dated reference file, and a fact past its shelf life may not be
asserted without a live check.

## The staleness rule — non-negotiable

Every reference file in this skill starts with a `verified:` date.

```
<!-- verified: 2026-09-16 | sources: MDN, web.dev Baseline, caniuse -->
```

Before you assert any fact from a reference:

| Age of `verified:` | What you may do |
|---|---|
| **≤ 90 days** | State it as current. Cite the file. |
| **> 90 days** | State it as *"as of <date>"*, and verify with `search` / `fetch` before it drives an architectural decision. |
| **> 180 days**, or the fact decides the architecture | Verify first, then answer. Update the reference file with the new date and the corrected fact. |

Never silently "refresh" a fact from memory. A date you cannot evidence is a
guess wearing a date.

**This has already happened once, in this file's own references.** The first
revision of `css.md` and `html.md` was written from model knowledge and stamped
with that day's date without a single live check. A later verification pass found
**7 of 14 tiers wrong** — anchor positioning, `text-box-trim` and `field-sizing`
were marked unavailable months after they had reached Baseline (the "stale
caution" failure, which makes code hand-roll what the platform already does),
while scroll-driven animations, `text-wrap: pretty` and the Popover API were
marked more available than they are (the "stale confidence" failure). So: when
you write a `verified:` date, the check must have happened in that turn, and the
sources must be named on the line. If you cannot verify a row, mark it
`UNVERIFIED` and say so rather than guessing a tier. The same rule applies to anything you remember about
framework defaults (Tailwind, React, the kit stacks) — those live in
`tech-stack` and `research-web`, and rot the same way.

When you do verify, use the primary sources in this order: **MDN** (syntax and
semantics), **web.dev Baseline** (availability tier), **caniuse** (version
detail), the **spec** (when behavior is genuinely contested). Two agreeing
sources minimum, per the `research-web` rules.

## What's in here

Load on demand — do not paste these into a plan wholesale:

Load these with the `skill` tool — `skill({ name: "web-platform-baseline", resource: "references/<file>.md" })`:

- `references/css.md` —
  layout, container queries, `:has()`, subgrid, nesting, `color-mix()`, OKLCH,
  `text-wrap`, cascade layers, scroll-driven animation, `@starting-style`,
  anchor positioning
- `references/html.md` —
  `<dialog>`, popover, `<details>` interop, form controls, `field-sizing`,
  lazy/priority hints, view transitions
- `references/a11y.md` —
  WCAG 2.2 additions, focus appearance, target size, `prefers-*` queries,
  accessible names, live regions

## Rules

1. **Never assert browser support from memory.** Cite a reference file (with
   its date) or verify live.
2. **Prefer the platform.** If CSS or HTML does it natively, a JS dependency is
   a regression. Reach for a library only when the native path is genuinely
   missing a capability the product needs — and say which one.
3. **Progressive enhancement over polyfill.** `@supports`, a sane fallback, and
   the modern path on top. Shipping a polyfill for a Baseline-available feature
   is dead weight.
4. **Availability tier, not a version list.** Say "Baseline widely available"
   or "Baseline newly available (needs a fallback)" — version tables age badly
   and users rarely need them.
5. **When the answer is "it depends on your support target", ask.** Do not
   assume evergreen-only, and do not assume enterprise IE-era constraints.
6. **Correct the file, not just the answer.** If you verify a fact and find the
   reference stale, update it and its `verified:` date in the same turn. A
   correction you don't write down will be re-derived from scratch next week.

## Applying it

The common wins, which the references cover in detail:

| Old reflex | Current platform |
|---|---|
| JS resize observer to restyle a component | container queries |
| Parent-state class toggling in JS | `:has()` |
| Nested grid hacks for alignment across cards | `subgrid` |
| Manual focus-trap library for a modal | `<dialog>` + `showModal()` |
| Positioned dropdown with a JS collision library | popover + anchor positioning |
| `scroll` listener driving an animation | scroll-driven animations |
| SASS just for nesting and variables | native nesting + custom properties |
| Ragged headline hand-fixed with `<br>` | `text-wrap: balance` |
| Hand-mixed hover/disabled color variants | `color-mix()` on the kit token |

Each of these makes the code both shorter and less generated-looking — the
hand-rolled version of a platform feature is itself a tell.

## Skills in scope

- `design-craft` — the composition rules these capabilities serve
- `design-system` — kit tokens; platform features consume tokens, never literals
- `design-critique` — auditing an existing UI against current practice
- `research-web` — the verification workflow when a fact is stale
- `tech-stack` — framework/package version currency (the same rot, different layer)

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
