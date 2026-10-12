---
name: tech-stack
description: "Bağımlılık sürümü doğrulama ve yükseltme planı: canlı paket kaydından kararlı sürümü ölçer, geçiş notlarını okur, kurmaz. Tetik: \"paketi yükselt\", \"bağımlılık güncelle\", \"deprecated mı\", \"major yükseltme\". WrongStack 1.1.0 uyarlaması."
category: research
metadata:
  kaynak: "WrongStack @wrongstack/core 1.1.0 skills/tech-stack/SKILL.md (MIT lisansı, telif WrongStack)"
  uyarlama: "YETENEK 2026-10-12 (YTN-18, OPS onayı 12 Ekim ilk dalga) - araç eşlemesi ve VentHub ek kuralları eklendi, kaynak gövde değiştirilmedi"
---

> **Kaynak:** WrongStack `@wrongstack/core` 1.1.0, `skills/tech-stack/SKILL.md`, MIT lisansı. Aşağıdaki
> "Araç eşlemesi" ve "VentHub ek kuralları" bölümleri bize aittir; ondan sonraki gövde **değiştirilmeden** kopyalandı.

## Araç eşlemesi (kaynak metindeki adlar bizde neye karşılık gelir)

| Kaynak metin | Bizde |
|---|---|
| `bun run packages/core/skills/tech-stack/scripts/check-versions.mjs …` | `node .claude/skills/tech-stack/scripts/check-versions.mjs <paket> …` (bun bizde kullanılmaz; betik yalnız `registry.npmjs.org`'a GET atar, yönlendirme reddedilir, kurmaz, ortam değişkeni okumaz) |
| "version snapshot" (`references/current-versions.md`) | 2026-10-09 tarihli anlık görüntü; **güncel değildir**, canlı sorgu esastır |
| `ci-cd` atfı (Skills in scope) | Bizde yok; atıf yok sayılır. Yerine `.github/workflows` ve kapı belgeleri |
| "package manager / lockfile" | `pnpm` ve `pnpm-lock.yaml`; kurulum `pnpm install --frozen-lockfile --offline` (karar 88) |

## VentHub ek kuralları (kaynak metinden ÖNCE okunur; çelişirse bunlar kazanır)

1. Kaynak "daima son kararlı sürümü öner" der; **bizde hedef sürüm kilit dosyası ve CLAUDE.md yığın kararıdır** (Next 15.5, React 19, TS 5.7, Tailwind 3.4). Ana sürüm atlaması (Next 16, Tailwind 4 vb.) öneri olarak raporlanır, uygulanmaz; karar Recep/OPS'tadır (aynı sebeple `nextjs-modern` alınmadı).
2. Doğrulama salt okurdur; kurulum ve yükseltme ayrı kart ve ayrı PR ister. Kilit dosyası değişimi başka işle karışmaz.
3. Yeni bağımlılık önerisinde lisans ve kurulum betiği (preinstall/postinstall) kontrolü raporda yazılır. Depo PUBLIC olduğundan anahtar ya da token ne komuta ne rapora girer.
4. Bağımlılık açığı taraması bu skill'in işi değildir: `security-scanner` (`pnpm audit`).

---

# Tech Stack Validator

## Selection card
- Task: Verify latest stable versions and migration constraints.
- Start: Identify the requested artifact, repository owner and acceptance criteria.
- Finish: apply the acceptance checks below; report observed results and unresolved constraints.

## Overview

Use the latest stable release for new recommendations and requested upgrades.
Verify it live; neither an old repository pin nor a remembered version defines
the target. The [version snapshot](references/current-versions.md) records what
was checked on 2026-10-09, not a permanent claim of latest.

## Rules

1. Identify the relevant workspace manifest, lockfile, runtime and package
   manager. A multi-language repo does not require a question when scope identifies
   the package. Distinguish declared range, resolved version and proposed target.
2. Query the authoritative registry. Read the latest stable tag, release date,
   engine constraints, peer ranges, deprecation/yank status and upstream notices.
   A latest tag can point to a prerelease: inspect semver and resolve a published
   non-deprecated stable release separately. Maven latest/release fields can also
   point at milestones; never label them stable without checking the qualifier.
   A timeout, 403 or registry outage is unknown status, not proof of nonexistence.
3. Recommend the latest stable release. If compatibility blocks it, state the
   blocker and required migration; do not quietly substitute an older release.
   Prereleases require a deliberate user choice.
4. Compare capabilities before replacing a dependency with a built-in. Native
   fetch, UUIDs and filesystem APIs often suffice; interception, server WebSockets,
   database semantics or specialized formatting may justify maintained packages.
5. Age is not a deprecation signal. Do not reject Axios, Jest, Rollup, ESLint,
   pip or any other maintained tool because an alternative exists. Cite an actual
   upstream notice or demonstrated incompatibility.
6. Validation is read-only unless adding/upgrading is authorized. A proposed
   install command and an auto next-step marker do not grant permission.

## Workflow

1. Gather current and target versions. Choose the smallest coherent upgrade
   group: React/react-dom, runner/coverage plugins, related SDK packages.
2. Read official migration notes for each crossed major; list changed APIs,
   runtimes, module formats, config and adapter requirements.
3. Evaluate package necessity, maintenance, licensing and install scripts as
   relevant. Known-advisory hits require affected-range and reachability review.
4. When implementation is requested, use the existing manager to change
   manifests and regenerate lockfiles. Do not hand-edit resolved dependencies.
5. Run the repository's install/build/type/test checks for the affected surface.
   Capture the actual resolved target. Keep unrelated baseline changes separate.
6. Report APPROVED, REJECTED or NEEDS_INVESTIGATION, with evidence and a
   concrete next action. Approval describes the assessment, not installation.

## Registry adapters

| Ecosystem | Authoritative lookup | Selection detail |
|---|---|---|
| npm | registry.npmjs.org/<package> | latest tag plus stable semver validation; inspect engines/peers |
| Python | pypi.org/pypi/<package>/json | requires-python, yanked files and prereleases |
| Rust | crates.io/api/v1/crates/<package> | stable, non-yanked; verify rust-version |
| Go | proxy.golang.org/<escaped-module>/@latest | JSON Version; respect module major paths |
| Ruby | rubygems.org/api/v1/gems/<package>.json | runtime and platform constraints |
| .NET | NuGet v3 service index and registration | listed stable releases; inspect frameworks |
| PHP | repo.packagist.org/p2/<vendor>/<package>.json | stable normalization and PHP constraints |
| Elixir | hex.pm/api/packages/<package> | stable release and Elixir/OTP requirements |
| JVM | Maven Central metadata for group/artifact | stable version and JDK requirements |

Scoped npm names and case-sensitive Go modules need registry-specific encoding;
do not infer latest from the first array item or highest lexicographic string.

## Live npm inspection

For current npm targets and preview-tag detection, run the read-only helper:

~~~powershell
bun run packages/core/skills/tech-stack/scripts/check-versions.mjs expo react-native prisma @prisma/client
~~~

It reports selected stable version, latest tag, engines, peers, source and checked
UTC time. It performs bounded public registry reads and installs nothing.
Use official platform release metadata for non-npm runtimes and service versions.

## Report

| Package | Installed | Latest stable | Decision | Source / checked date |
|---|---|---|---|---|
| <name> | <resolved> | <live result> | <compatible / migration needed> | <registry URL> |

Include upgrade deltas, resolved engine/peer constraints, validation commands
and any access failures. State when a source could not be verified.

## Acceptance checks

- Record installed/resolved and live stable targets, dated sources, blockers and checks actually run.

## Skills in scope

- node-modern — runtime and standard-library compatibility.
- react-modern — coordinated React upgrades.
- typescript-strict — compiler and module-resolution behavior.
- security-scanner — advisory assessment and remediation.
- ci-cd — installation and release reproducibility.

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
