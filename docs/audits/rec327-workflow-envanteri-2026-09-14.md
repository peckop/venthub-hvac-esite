# REC-327 — GitHub Actions Workflow Envanteri ve Jules Workflow Kaldırma (2026-09-14)

> Ölçüm tarihi: 2026-09-14. Ölçen: ALTYAPI şeridi alt-ajanı (worktree
> `agent-aa5d43d33a00cc7c8`, dal `altyapi/rec327-jules-workflow-kaldir`).
> Kaynak: `gh workflow list --all`, `gh run list --workflow=<dosya> --limit 3 --json conclusion,createdAt`,
> `grep -rn jules` (tüm depo), doğrudan dosya okuma. Önceki ölçüm referansı:
> `docs/audits/arac-envanteri-2026-09-07.md` (bu çalışmanın ölçtüğü `disabled_manually`
> durumunu 2026-09-07'de zaten tespit etmişti; burada tazelenip PR'a bağlandı).

## Özet

`.github/workflows/` altında ölçüm anında **31 dosya** vardı. Bunlardan **7'si**
`jules-*.yml` desenine uyuyordu (beklenen sayı doğrulandı). `gh workflow list --all`
GitHub tarafındaki **state** alanını gösterdi: 7'sinin de state'i **`disabled_manually`**
— yani bu workflow'lar GitHub arayüzünden elle kapatılmış, `workflow_dispatch` ile bile
tetiklenemez durumda. Aynı state'te olan `ai-auto-repair.yml` de var ama o dosya
`jules-*.yml` deseni dışında (adı farklı) ve REC-327 kapsamı dışında bırakıldı — **silinmedi**.
(Güncelleme: `ai-auto-repair.yml` REC-333 kapsamında 2026-09-14'te ayrıca ölçülüp
kaldırıldı — bkz. `docs/audits/rec333-ai-auto-repair-2026-09-14.md` ve aşağıdaki tablo satırı.)

Tüm 7 jules workflow'unun geçmiş koşum kaydı var (hiçbiri "hiç koşmamış" değil — hepsi
2026-03 tarihli, GitHub'ın elle kapatılmasından önceki dönemde koşmuş). Silme kararı
"hiç koşmadı" kıstasına değil, **(a) GitHub'da elle devre dışı bırakılmış olması** ve
**(b) depoda hiçbir canlı çağıranın olmaması** ikilisine dayanıyor — aşağıda kanıtlanıyor.

## (a) Kaldırılan jules workflow'ları — 7 dosya

| Dosya | `name:` | Tetikleyici (`on:`) | Son 3 koşum (tarih · sonuç) | Kaldırma kanıtı |
|---|---|---|---|---|
| `jules-a11y.yml` | Jules - A11y | `workflow_dispatch` | 2026-03-07 · success | GitHub state=`disabled_manually`; canlı çağıran yok |
| `jules-dependency-update.yml` | Jules - Dependency Update | `workflow_dispatch` | 2026-03-13 · success | GitHub state=`disabled_manually`; canlı çağıran yok |
| `jules-i18n-sync.yml` | Jules - i18n Sync | `workflow_dispatch` | 2026-03-17 · failure, 2026-03-14 · success, 2026-03-14 · failure | GitHub state=`disabled_manually`; canlı çağıran yok |
| `jules-lint-fix.yml` | Jules - Lint & TS Fixer | `workflow_dispatch` (girdiler: `wave`, `scope`, `additionalInstruction`) | 2026-03-18 · failure, 2026-03-17 · failure, 2026-03-17 · failure | GitHub state=`disabled_manually`; canlı çağıran yok |
| `jules-performance.yml` | Jules - Performance | `workflow_dispatch` | 2026-03-07 · success | GitHub state=`disabled_manually`; canlı çağıran yok |
| `jules-security-audit.yml` | Jules - Security Audit | `workflow_dispatch` | 2026-03-18 · failure, 2026-03-17 · failure, 2026-03-16 · failure | GitHub state=`disabled_manually`; canlı çağıran yok |
| `jules-test-coverage.yml` | Jules - Test Coverage | `workflow_dispatch` | 2026-03-18 · failure, 2026-03-11 · success | GitHub state=`disabled_manually`; canlı çağıran yok |

**Çağıran taraması (adım 3, dört kalıp ayrı ayrı arandı):**
- `workflow_call` deseni: sadece `gemini-*.yml` dosyalarında var (jules ile ilgisiz).
- `uses:` ile başka workflow'tan çağrı: bulunamadı — hiçbir aktif workflow bu 7 dosyayı `uses:` ile çağırmıyor.
- `gh workflow run jules-*.yml` betik referansı: yalnız `.archive/legacy_ciltler/04_operations_and_deployment.md`
  içinde bulundu — bu dosya **arşiv** dizininde, artık çalışmayan tarihsel doküman;
  ayrıca orada anılan `jules-undertaker.yml`, `jules-janitor.yml`, `jules-scribe.yml`
  depoda hiç mevcut değil (uydurma/eski örnekler). **Canlı çağıran sayılmaz.**
- Düz metin referansları (`grep -rn jules --include=*.yml,*.cjs,*.js,*.json,*.md`): geri kalan
  tüm eşleşmeler `.archive/`, `docs/audits/`, `docs/kayitlar_master.md`, `docs/proje-takip/`
  gibi doküman/arşiv dosyalarında — hiçbiri CI/CD akışında bu dosyaları tetiklemiyor.
  `ai-auto-repair.yml` Jules'tan bahsediyor ama `jules-action` çağrısını doğrudan kendi
  içinde yapıyor, bu 7 dosyaya referans vermiyor (ayrı, bağımsız bir workflow).

Sonuç: kaldırılan 7 dosyanın hiçbiri canlı bir yerden çağrılmıyor ve GitHub'da zaten
elle devre dışı. Kaldırma güvenli.

## (b) Kalan tüm workflow'ların envanteri — 24 dosya

| Dosya | Ne yapar | Tetikleyici | Son koşum (tarih · sonuç) |
|---|---|---|---|
| ~~`ai-auto-repair.yml`~~ | **KALDIRILDI (REC-333, 2026-09-14).** CI kırmızı olunca Jules'a otomatik onarım denemesi yaptırdı. Ölçüldü: 2026-03-18'den 2026-09-02'ye dek 19 gerçek koşum (skipped değil), en az 10 "Auto-Repair" PR'ı açıldı, **hiçbiri merge edilmedi** (0/10). `ci.yml`'in `ci-logs` artefaktını üreten adımı bu dosyanın TEK okuyucusuydu — o da kaldırıldı. Detay: `docs/audits/rec333-ai-auto-repair-2026-09-14.md`. | ~~`workflow_run` (CI tamamlanınca)~~ | (kaldırıldı) |
| `auto-label.yml` | PR açılınca/düzenlenince etiket atar | `pull_request` (opened, edited) | 2026-09-14 · success |
| `auto-reviewer.yml` | PR açılınca otomatik reviewer atar | `pull_request` (opened) | 2026-09-14 · success |
| `ci.yml` | Ana CI: lint/type-check/test/build | `pull_request` (push yalnız master) | 2026-09-14 · ölçüm anında çalışıyordu (conclusion boş/in-progress) |
| `db-advisor-fix.yml` | Supabase DB Advisor önerilerini otomatik düzeltmeye çalışır | `workflow_dispatch` | 2025-12-08 · failure |
| `db-advisor.yml` | Supabase DB Advisor taraması | `push` (master), `pull_request` | 2026-09-14 · success |
| `deploy-functions.yml` | Supabase Edge Functions'ı deploy eder | `workflow_dispatch` (girdi: `deploy_all`) | 2026-09-13 · success |
| `e2e-smoke.yml` | Admin + checkout uçtan uca duman testi | `pull_request` (push yalnız master) | 2026-09-14 · success |
| `edge-shared-input-drift.yml` | Edge Functions paylaşılan girdi şemasının sapmasını yakalar | `pull_request` (paths: `supabase/config.toml` vb.) | 2026-09-09 · success |
| `expired-reservations-cron.yml` | Süresi dolan stok rezervasyonlarını günlük temizler | `schedule` (03:15 UTC) | 2026-09-13 · success |
| `gemini-dispatch.yml` | PR yorumlarında Gemini tetikleyicisini yönlendirir | `pull_request_review_comment` (created) | 2026-09-14 · skipped |
| `gemini-invoke.yml` | Gemini çağrısını yürüten reusable workflow | `workflow_call` | Ayrı run kaydı yok — çağıranın (gemini-dispatch/plan-execute) içinde görünür |
| `gemini-plan-execute.yml` | Gemini plan uygulama adımı, reusable | `workflow_call` | 2026-03-18 · failure (en son ayrı görünen kayıt) |
| `gemini-review.yml` | Gemini PR review, reusable | `workflow_call` | Ayrı run kaydı yok — çağıranın içinde görünür |
| `gemini-triage.yml` | Gemini issue/PR triage, reusable | `workflow_call` | 2026-09-13 · success |
| `katalog-sayim.yml` | Katalog ürün sayımını günlük ölçer | `schedule` (06:10 UTC) | 2026-09-13 · success |
| `migration-linter.yml` | INV-MIGRATION-3: migration SQL'ini squawk ile lint'ler | `pull_request` (paths: `supabase/migrations/**.sql`) | 2026-09-14 · success |
| `order-housekeeping-cron.yml` | Sipariş durumu bakımını 30 dakikada bir çalıştırır | `schedule` | 2026-09-14 · success |
| `pr-size-check.yml` | PR diff boyutunu kontrol eder | `pull_request` (opened, synchronize) | 2026-09-13 · success |
| `rls-guard.yml` | Supabase RLS güvenlik alarmı | `pull_request` (opened, synchronize; paths ile sınırlı) | 2026-09-14 · success |
| `skills-gate.yml` | Skill/companion kapısı | `pull_request`, `push` (master) | 2026-09-14 · success |
| `ssr-duman-alarmi.yml` | Prod SSR duman testi, günlük | `schedule` (06:40 UTC) | 2026-09-13 · success |
| `stock-alert-cron.yml` | Stok uyarısını günlük gönderir | `schedule` (06:20 UTC) | 2026-09-13 · success |
| `supabase-migrate.yml` | Master'a migration merge olunca prod DB'ye otomatik uygular (Kural 13) | `push` (master, migration path'leri) | 2026-09-13 · success |

> Not: `gemini-invoke.yml` ve `gemini-review.yml` yalnız `workflow_call` ile tetiklenen
> reusable workflow'lar; `gh run list --workflow=<dosya>` bunlar için doğrudan kayıt
> döndürmüyor çünkü koşumlar çağıran workflow'un (ör. `gemini-dispatch.yml`,
> `gemini-plan-execute.yml`) run kaydı altında görünüyor. Bu "hiç koşmadı" anlamına gelmez —
> ölçülemedi, ayrı satırda belirtildi.

## Kapı sonucu

`pnpm test -- --run src/__tests__/conformance/` sonucu ve Test Files/Tests sayıları
PR gövdesinde ve görev raporunda ayrıca verildi (bu dosyaya tekrar yazılmadı — üretilmiş
rapor değil, elle tutulan envanter burada; kapı sayıları raporun parçası).

## Kapsam notu

Bu envanter yalnız REC-327 kapsamındaki `jules-*.yml` kaldırmasını ve kalan workflow'ların
anlık durumunu kaydeder. `ai-auto-repair.yml` de `disabled_manually` ama adı `jules-*`
desenine uymadığı ve iş emri kapsamı yalnız `jules-*.yml` dosyalarını kapsadığı için
**bu iş emrinde silinmedi** — ayrı kayıt REC-333'e bırakıldı ve orada 2026-09-14'te kaldırıldı.
