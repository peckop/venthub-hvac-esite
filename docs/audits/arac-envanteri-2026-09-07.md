# Araç Envanteri — 2026-09-07

> Kayıt: REC-180 · Şerit: OPS · Ölçüm: 2026-09-07, ağaç origin/master a248e0689 · Yöntem: 5 sonnet
> tarama + 1 opus çürütme (curutme.md) · Bu belge cetvelin (`docs/standards/arac-envanteri-standard.md`)
> **ilk envanteridir**; sonraki üretim `scripts/hijyen/arac-envanteri.cjs` (REC-185) — o betik
> koşana kadar bu belge elle derlenmiştir ve AXIOM 1 gereği bu haliyle "var" sayılır.

---

## 1 · Recep tek sayfası

| Tür | Toplam | KAL | ÖLÜ DOĞRULANDI | KARANTİNA | ÖLÇÜLEMEDİ |
|---|---|---|---|---|---|
| hook (`.claude/hooks/*.cjs`) | 14 | 14 | 0 | 0 | 0 |
| betik (`scripts/**`) | 119 | 66 | 52 | 1 (ek, aşağıda) | 1 |
| skill (satır = ad×ağaç) | 64 | 40 | — | 0 | — (24 ENVANTER-DIŞI) |
| githook (`.githooks/*`) | 5 | 5 | 0 | 0 | 0 |
| ci (`.github/workflows/*.yml`) | 29 | 20 | 9 | 0 | 0 (+1 GitHub-hayalet, ayrı) |
| cetvel (`docs/standards/*.md`) | 67 | 48 | — | — | — (19 KAL-KAPISIZ) |

**Düzeltmeler / önemli sapmalar:**
- **"27 dosya" hook değil:** `.claude/hooks/` içindeki 27 dosyanın **14'ü** gerçek kanca (`.cjs`,
  settings.json'a bağlı veya kütüphane), **13'ü** companion `.md` açıklama dosyası — cetvel §1
  gereği companion **araç değildir, envantere girmez**. "27 kanca" denirse evren yanlıştır.
- **Sahip dağılımı AXIOM 2 sonrası:** betiklerde ham tarama ALTYAPI 29 · OPS 10 · URUN 3 ·
  URUN-KATALOG 6 · **SAHİPSİZ 71** bulmuştu. AXIOM 2 ("sahipsiz araç yoktur") uygulanınca 71 satır
  **OPS**'a yazılır (her birine en yakın şerit "devir adayı" notuyla) → nihai: ALTYAPI 29 ·
  **OPS 81** (10 asıl + 71 devir-adaylı) · URUN 3 · URUN-KATALOG 6. Cetvellerde aynı mekanik: 57
  sahipsiz satır OPS'a yazıldı (nihai OPS 59, ALTYAPI 5, URUN 3).
- **CI'da `disabled_manually` olanlar (8):** `jules-a11y.yml`, `jules-dependency-update.yml`,
  `jules-i18n-sync.yml`, `jules-lint-fix.yml`, `jules-performance.yml`, `jules-security-audit.yml`,
  `jules-test-coverage.yml`, `ai-auto-repair.yml` — GitHub tarafında elle KAPATILMIŞ, `workflow_dispatch`
  bile çalışmaz. Sonnet `ai-auto-repair.yml`'i "skipped" görüp KAL saymıştı; çürütme bunu düzeltti
  (bağlı olduğu `workflow_run` tetiği kapalı workflow'da boş kayıt üretir, bu "çalışıyor" değildir).
- **En önemli 3 bulgu:**
  1. **`scripts/generate/generate-sitemap.mjs` — ÖLÜ + TEHLİKELİ.** Halefi `src/app/sitemap.ts`
     zaten üretimde; bu betik hem ölü hem yanlış kod içeriyor (curutme notu). Bu PR'da
     `scripts/archive/`'e taşınarak **KARANTİNA**ya alındı — silme yine Recep kapısı.
  2. **"no tests" fail-open ana dizin sınıfı:** `scripts/db/checks/` altındaki beş `.py` betik
     (`check_category_id`, `check_product_fields`, `check_rls`, `simulate_frontend`, ve komşu
     `audit_checks.js`/`check_auth_functions.js`) çağıransız — ama ikisi (`check_product_fields.py`,
     `simulate_frontend.py`) **bugün** REC-178 sayfalama onarımının gündeminde anıldı; silme kararı
     OPS/KATALOG'a sorulmadan verilmemeli (ÖLÜ DOĞRULANDI ama "uyarılı").
  3. **`ai-auto-repair.yml` kapalı, kimse fark etmemiş:** CI kırmızıya düştüğünde otomatik onarım
     denemesi olacağı varsayılıyordu; GitHub'da `disabled_manually` — mekanizma aylardır çalışmıyor
     ve bunu hiçbir kapı yakalamadı (bu envanterin varlık nedeni tam burada).

**Ölü doğrulanan liste** (aşağıdaki Bölüm 3 tablosunda `OLU-DOGRULANDI` satırları, 52 betik + 9 CI
= 61 kalem) **Recep'in silme kapısına gider**; karantina eylemi OPS'a aittir (AXIOM 3).

---

## 2 · Sonnet'in kaçırdığı kanallar (curutme.md'den aynen — REC-185 kapı betiğine girdi)

Sonnet'in çağıran taraması **tek bir dosya-adı grep'ini dar bir dosya kümesinde** koştu
(`package.json`, `.github/workflows`, `.githooks`, `.claude/hooks`, `docs/standards`,
`docs/recep-komut-rehberi.md`, `scripts/**`) ve bu yüzden altı sınıfı topluca kaçırdı:

1. **Yetenek ağaçları** — `.claude/skills/*/SKILL.md`, `.agent/skills/*/SKILL.md` ve
   `.agent/plugins/*/manifest.yaml`; bunlar betiği yalnız *anmakla* kalmayıp `fs.existsSync` /
   `pathlib.exists()` ile **varlık kapısı** kuruyor (`admin-i18n-merger.cjs`, `skills-creator.py`).
2. **Konformans testleri ve okudukları veri dosyaları** — `src/__tests__/conformance/*.test.ts` ile
   `docs/{mutlak-yol,artefakt-ilan}-istisnalari.json` ve `docs/proje-takip/yol-haritasi.json`; betik
   ADI kapının veri satırı (`secret-scan.py`, `update_schema_master.py`, `tier-c-temizlik.mjs`,
   `agac-silme-kapisi.cjs`).
3. **Betiğin ürettiği çıktı belgesi** — `docs/audits/*.md` başlığındaki "Üreten: …" satırı
   (`rbac-ui-db-parity.mjs`, `matris-sutun-doluluk.mjs`).
4. **Kardeş durum/yapılandırma dosyaları** (`kirli-sayac-taban.json` vb.) ve `.gitignore`'daki
   çıktı satırları — çıktısı bilerek commit edilmeyen araçlarda "çıktı yok" ölüm sanıldı
   (`companion-borc.cjs`).
5. **Filo panosu `C:/tmp/venthub-board/*.jsonl`** — tek gerçek koşum-izi kaydı
   (`agac-artik-envanteri.cjs`, `nlm_selective_upload.py`, `db-durum-olc.mjs`, `identity-fix.mjs`
   — dördü de son üç günde koşmuş/onarılmış).
6. **CI'da iki ayrı körlük:** `gh workflow list --all`'un **state** sütunu hiç okunmadı (7 jules +
   `ai-auto-repair` `disabled_manually`); ve `uses: './.github/workflows/…'` grep'i **tırnaksız**
   desenle yazıldığı için 0 eşleşme verdi — dört Gemini reusable workflow'unun çağıranı
   `gemini-dispatch.yml`'de duruyorken "çağıran yok" sanıldı ve günlük koşan `gemini-review` ölü
   ilan edildi.

**Sonuç:** kapı betiği (REC-185, `scripts/hijyen/arac-envanteri.cjs`) bu altı kanalı **taramak
zorunda**; yalnız `package.json`/CI/`.githooks`/`.claude/hooks`/`docs/standards` grep'i tek-göz
hatasını tekrarlar.

---

## 3 · Tür başına tablolar

### 3.1 · hook — `.claude/hooks/*.cjs` (14 araç; 13 companion `.md` HARİÇ, aşağıda not)

| yol | tur | ne_yapar | sahip | tetik | kanıt | kapı | durum |
|---|---|---|---|---|---|---|---|
| `.claude/hooks/accumulate-edits.cjs` | hook | PostToolUse: bu turda düzenlenen JS/TS yollarını geçici birikim dosyasına ekler | ALTYAPI | `hook:PostToolUse Edit\|Write\|MultiEdit` | bağlı (özel iz dosyası gerekmiyor) | yok | KAL |
| `.claude/hooks/bash-write-audit.cjs` | hook | PostToolUse: Bash yazma hedeflerini denetler ("dikiş yeri alarmı") | ALTYAPI | `hook:PostToolUse Bash` | `C:/tmp/venthub-board/.bash-audit-*.json`, 2026-09-07 | bash-write-audit-merge-muafiyeti/-tree/-uretilmis-sinifi.test.ts | KAL |
| `.claude/hooks/bash-write-guard.cjs` | hook | PreToolUse: Bash yazma kapısı (lane-guard + protect-config'in Bash karşılığı) | ALTYAPI | `hook:PreToolUse Bash` | bağlı | bash-write-guard-muafiyet.test.ts, sir-basan-kalip.test.ts | KAL |
| `.claude/hooks/bash-write-targets.cjs` | hook (kütüphane) | Bash komutundan yazma hedeflerini çıkaran saf fonksiyon | ALTYAPI | `require()` ← bash-write-guard.cjs:87 | dolaylı | bash-write-gate.test.ts | KAL |
| `.claude/hooks/board-brief.cjs` | hook | UserPromptSubmit: sessiz pano brifingi + kira yenileme | ALTYAPI | `hook:UserPromptSubmit *` | bağlı | board-invariants.test.ts, fleet-mechanism-integrity.test.ts | KAL |
| `.claude/hooks/board-release.cjs` | hook | SessionEnd: şeridi bırak (kira serbest bırakma) | ALTYAPI | `hook:SessionEnd *` | bağlı | yok | KAL |
| `.claude/hooks/lane-guard.cjs` | hook | PreToolUse: şerit koruması (çok-oturumlu çakışma engeli) | ALTYAPI | `hook:PreToolUse Edit\|Write\|MultiEdit` | bağlı | yok | KAL |
| `.claude/hooks/precompact-durum-kapisi.cjs` | hook | PreCompact: durum kapısı (REC-86 Faz 1) | ALTYAPI | `hook:PreCompact *`; ayrıca `require()` ← session-board.cjs:176 | bağlı | precompact-durum-kapisi.test.ts | KAL |
| `.claude/hooks/protect-config.cjs` | hook | PreToolUse: kalite ağı (config-protection + içerik taraması) | ALTYAPI | `hook:PreToolUse Edit\|Write\|MultiEdit` | bağlı | auth-role-source.test.ts, stock-restore-evidence.test.ts (dolaylı) | KAL |
| `.claude/hooks/sensitive-path-guard.cjs` | hook | PreToolUse: iki hassas yol sınıfını korur | ALTYAPI | `hook:PreToolUse Edit\|Write\|MultiEdit` | bağlı | yok | KAL |
| `.claude/hooks/session-board.cjs` | hook | SessionStart: oturum kimliği + pano durumu bağlamı enjekte eder | ALTYAPI | `hook:SessionStart *` | `.git/venthub-sid`, 2026-09-07 | bash-write-audit-tree, companion-defter, fleet-mechanism-integrity, precompact-durum-kapisi.test.ts | KAL |
| `.claude/hooks/sir-basan-kalip.cjs` | hook (kütüphane) | Bir Bash komutunun SIR değerini basıp basmadığını ölçen saf fonksiyon | ALTYAPI | `require()` ← bash-write-guard.cjs:67 | dolaylı | sir-basan-kalip.test.ts | KAL |
| `.claude/hooks/son-soz-gate.cjs` | hook | Stop kapısı: turda kullanıcı mesajı varsa SON SÖZ kullanıcıya mı yazılmış | ALTYAPI | `hook:Stop *` | bağlı | yok | KAL |
| `.claude/hooks/verify-on-stop.cjs` | hook | Stop (async): JS/TS düzenlendiyse eslint --fix + tsc doğrulaması | ALTYAPI | `hook:Stop *` (async, timeout 120) | `.cwd-ayrisma-sayaci.json`, 2026-09-07 | board-invariants.test.ts | KAL |
| `.claude/hooks/defter-bayatlik-olcumu.cjs` | hook | Stop hook — PROJE TAKİP DEFTERİ BAYATLIK ÖLÇÜMÜ (yalnız ÖLÇER ve UYARIR). | OPS | .claude/settings.json, docs/standards/hafiza-kancalari-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/defter-bayatlik-olcumu.test.ts | YENI |
| `.claude/hooks/eylem-defteri.cjs` | hook | PostToolUse hook — EYLEM DEFTERİ (git'in GÖRMEDİĞİ taşıma/silmeleri kaydeder). | OPS | .claude/settings.json, docs/standards/hafiza-kancalari-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/eylem-defteri.test.ts | YENI |
| `.claude/hooks/hafiza-sorusu-yonlendirme.cjs` | hook | UserPromptSubmit hook — HAFIZA SORUSU YÖNLENDİRME. | OPS | .claude/settings.json, docs/standards/hafiza-kancalari-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/hafiza-sorusu-yonlendirme.test.ts | YENI |
| `.claude/hooks/soguk-okuyucu-sinavi.cjs` | hook | PostToolUse hook — SOĞUK OKUYUCU SINAVI ÇAĞRISI (yalnız HATIRLATIR, sınavı ajan koşar). | OPS | docs/standards/hafiza-kancalari-standard.md, src/__tests__/conformance/soguk-okuyucu-sinavi.test.ts (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/soguk-okuyucu-sinavi.test.ts | YENI |

**Not (companion, envanter dışı — cetvel §1):** `accumulate-edits.md`, `bash-write-audit.md`,
`bash-write-guard.md`, `bash-write-targets.md`, `board-brief.md`, `board-release.md`,
`lane-guard.md`, `precompact-durum-kapisi.md`, `protect-config.md`, `sensitive-path-guard.md`,
`session-board.md`, `son-soz-gate.md`, `verify-on-stop.md` (13 dosya) — her biri yukarıdaki
kancanın açıklama dokümanı, kod tarafından `require` edilmez, çalıştırılabilir değildir. Standart
madde 1 gereği araç sayılmaz.

### 3.2 · betik — `scripts/**` (119 araç)

> Durum sütunu **curutme.md'nin nihai hükmüyle** yazıldı (bkz. §1 tekli aşama: OLU-ADAY→ikinci göz).
> Sahip sütununda ham tarama SAHİPSİZ bulduysa AXIOM 2 gereği **OPS** yazılıp yanına "devir adayı"
> notu eklendi; ALTYAPI/OPS/URUN/URUN-KATALOG ile ilk taramada zaten etiketliyse değiştirilmedi.

| yol | ne_yapar | sahip | tetik | kanıt | kapı | durum |
|---|---|---|---|---|---|---|
| `scripts/a11y/reflow-scan.mjs` | WCAG 2.2 SC 1.4.10 Reflow ölçüm aracı (320px, tek-yön scroll) | OPS *(devir adayı: ALTYAPI)* | `docs/standards/{admin-design,storefront-reflow}-standard.md` | cetvel referansı | yok | KAL |
| `scripts/admin-i18n-merger.cjs` | (docstring yok) i18n admin birleştirme | OPS *(devir adayı: ALTYAPI)* | `.agent/skills/maestro-combine/SKILL.md:23`, `manifest.yaml:37` `validate:` | skill validate adımı canlı | yok | KAL |
| `scripts/apply-stock-fix.mjs` | Stok düzeltmesi uygular (kök scripts/'ten bir üst) | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | pano 2026-08-27 yalnız companion listesi, koşum değil | yok | OLU-DOGRULANDI |
| `scripts/assert-node-major.mjs` | INV-NODE-1 3. yüzey: derlemenin GERÇEK Node ana sürümünü ölçer | OPS *(devir adayı: ALTYAPI)* | `docs/standards/runtime-version-alignment-standard.md`, `package.json` | 2026-08-19 | yok | KAL |
| `scripts/board/board.cjs` | Çok-oturumlu controller panosu | ALTYAPI | `.githooks/lib/{companion-defter,doc-scope}.cjs` | 2026-09-05 | yok | KAL |
| `scripts/board/gozcu.cjs` | Filo gözcüsü (pano izleyicisi) | ALTYAPI | `scripts/board/{board,mechanism-setup}.cjs` | 2026-08-24 | yok | KAL |
| `scripts/board/izin-reddi-gunlugu.cjs` | İzin-reddi olay günlüğü (filo-görünür ret sayacı) | ALTYAPI | `docs/standards/fleet-mechanism-standard.md` | 2026-08-31 | yok | KAL |
| `scripts/board/kimlik.cjs` | "Bu commit'i hangi oturum yapıyor" TEK cevap | ALTYAPI | `.claude/hooks/{bash-write-audit,session-board}.cjs` | 2026-08-31 | yok | KAL |
| `scripts/board/lane-precommit.cjs` | Pre-commit 2. katman şerit kapısı (E1) | ALTYAPI | `.githooks/pre-commit`, `.claude/hooks/bash-write-audit.cjs` | 2026-08-31 | yok | KAL |
| `scripts/board/mechanism-setup.cjs` | Mekanik otonomi kurulumu/doğrulaması (T115-VH) | ALTYAPI | `.claude/hooks/{board-brief,session-board}.cjs` | 2026-09-06 | yok | KAL |
| `scripts/board/registry-autosync.cjs` | Registry oto-senkronu (oturum açılışı, arka plan) | ALTYAPI | `.claude/hooks/session-board.cjs` | 2026-08-15 | yok | KAL |
| `scripts/board/registry-sync.cjs` | Orion registry senkronu — kalıcı iş durumu | ALTYAPI | `.githooks/post-merge`, `docs/standards/multi-session-coordination-standard.md` | 2026-08-15 | yok | KAL |
| `scripts/ci/apt-hardening.sh` | Koşucuda apt'yi sınırlı sürede başarısız olmaya zorlar | ALTYAPI | `.github/workflows/e2e-smoke.yml` | 2026-08-19 | yok | KAL |
| `scripts/ci/retry-bounded.sh` | Bir komutu zaman sınırıyla çalıştırır, düşerse tekrar dener | ALTYAPI | `.github/workflows/e2e-smoke.yml` | 2026-08-19 | yok | KAL |
| `scripts/clean_root.ps1` | Kök temizliği (REC-102, kullanıcı ev dizini sabitliği kaldırıldı) | OPS *(devir adayı: ALTYAPI)* | `docs/standards/fleet-mechanism-standard.md` | 2026-09-01 | yok | KAL |
| `scripts/compile_skills.py` | Skill derleme (git kökü türetimi) | OPS | `docs/standards/uretilmis-artefakt-standard.md`, `scripts/skills-creator.py` | 2026-06-10 | yok | KAL |
| `scripts/db/audit_checks.js` | (docstring yok) DB denetim kontrolleri | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | pano 2026-08-20 yalnız anılıyor | yok | OLU-DOGRULANDI |
| `scripts/db/check_auth_functions.js` | (docstring yok) auth fonksiyon kontrolü | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme (depo+dal+pano+orion) | yok | OLU-DOGRULANDI |
| `scripts/db/checks/anon-yazma-nobetcisi.mjs` | INV-ANON-YAZMA-1 nöbetçisi (anon role yeni yazma politikası) | ALTYAPI | `.github/workflows/db-advisor.yml` | 2026-09-04 | INV-ANON-YAZMA-1 | KAL |
| `scripts/db/checks/catalog-integrity.mjs` | Katalog bütünlüğü kapısı (T099) | ALTYAPI | `.github/workflows/db-advisor.yml`, `docs/standards/catalog-depth-standard.md` | 2026-08-23 | catalog-integrity-gate.test.ts | KAL |
| `scripts/db/checks/check_category_id.py` | Hava Perdesi ürünlerinin kategori ID'sini kontrol eder | ALTYAPI | `cagiran-yok` | 0 eşleşme (yalnız eski ikili yedek) | yok | OLU-DOGRULANDI |
| `scripts/db/checks/check_product_fields.py` | Aktif ürünlerin alan bütünlüğünü kontrol eder | ALTYAPI | `cagiran-yok` | pano 2026-09-06T18:39Z: REC-178 sayfalama onarım hedef listesinde anıldı | yok | **OLU-DOGRULANDI (uyarılı — silmeden önce OPS/KATALOG'a sor)** |
| `scripts/db/checks/check_rls.py` | RLS durumunu admin/anon anahtarla test eder | ALTYAPI | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/checks/rbac-ui-db-parity.mjs` | RBAC UI↔DB parite raporu (rapor, kapı değil) | ALTYAPI | `cagiran-yok` (çıktı üzerinden dolaylı) | `docs/audits/t134-rbac-ui-db-parity-2026-08-20.md:3` "Üreten:"; pano 2026-09-06T14:57:26Z | yok | KAL |
| `scripts/db/checks/rls-politika-sarma.mjs` | INV-RLS-SARMA-1: RLS politika ifadesinde iç içe `(SELECT auth.uid())` sarması var mı (REC-216) | ALTYAPI | `.github/workflows/db-advisor.yml` (`rls-role-coverage` işinde adım) | kapı testi 11/11, 2026-09-07 | rls-politika-sarma.test.ts | KAL |
| `scripts/db/checks/rls-role-coverage.mjs` | INV-RLS-COVERAGE-1: kodun okuduğu ile DB'nin izin verdiği ayrışması | ALTYAPI | `.github/workflows/db-advisor.yml`, `docs/standards/db-grant-hygiene-standard.md` | 2026-08-20 | INV-RLS-COVERAGE-1 | KAL |
| `scripts/db/checks/simulate_frontend.py` | Kategori akışını frontend gibi simüle eder | ALTYAPI | `cagiran-yok` | pano 2026-09-06T14:57Z: `.limit(10)` örneği incelendi, koşulmadı | yok | **OLU-DOGRULANDI (uyarılı)** |
| `scripts/db/migrations/apply-metadata-update.js` | (docstring yok) metadata güncelleme migration'ı | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/apply-performance-fixes.js` | (docstring yok) performans düzeltmesi migration'ı | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/apply-sql-via-rpc.mjs` | (docstring yok) RPC üzerinden SQL uygulama | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/apply_linter_warnings_fix.js` | Linter uyarı düzeltmesi (.env manuel okuma) | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/apply_security_hardening.js` | Güvenlik sertleştirme migration'ı | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | yalnız kardeş companion adı çakışması | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/apply_security_hardening_null_fix.js` | Güvenlik sertleştirme null düzeltmesi | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | yalnız kendi companion'ı | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/compile_functions_master.py` | Fonksiyon master dokümanı derler | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme (üretim zinciri REC-132 ile kesildi) | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/compile_hvac_master.py` | HVAC master dokümanı derler | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/fix-advisor-issues.js` | (docstring yok) advisor bulgu düzeltmesi | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/force-migrate.js` | IPv4 zorlayarak migration uygular | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | yalnız sır-taraması haritasında anılıyor (`venthub-haritasi.md:46`) | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/migrate-db.js` | Bağlantı dizesini standart formattan kurar, migration uygular | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | aynı harita satırı | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/nlm_selective_upload.py` | Seçici NLM defter yükleme | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` (elle) | pano 2026-09-03T16:46-16:48Z (REC-132): "üretim-sonra-yükle akışının tek tüketicisi" | yok | KAL |
| `scripts/db/migrations/run-direct-migration.cjs` | (docstring yok) doğrudan migration çalıştırma | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | yalnız denetim belgesi + pano ad-çakışması notu | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/run-migration-robustly.mjs` | .env manuel parse (CRLF uyumlu) ile migration | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/run-rls-migration.js` | (docstring yok) RLS migration çalıştırma | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/run_saas_migrations.cjs` | SaaS (multi-tenant) migration çalıştırma | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme; Faz 2 PARK'ta | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/run_single_docs.py` | Tek doküman migration derlemesi | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/db/migrations/update_schema_master.py` | Şema master dokümanının frontmatter'ını günceller | OPS *(devir adayı: ALTYAPI)* | `elle` (`orion doc schema` yanında) | `docs/artefakt-ilan-istisnalari.json:10` → `uretilmis-artefakt-ilan-kapsami.test.ts` okuyor | uretilmis-artefakt-ilan-kapsami.test.ts | KAL |
| `scripts/db/product-data/content-write.mjs` | Genel içerik yazımı (`technical_specs`, marka-bağımsız) | URUN-KATALOG | `family-description-write.mjs`, `identity-fix.mjs` | 2026-08-22 | yok | KAL |
| `scripts/db/product-data/family-description-write.mjs` | Aile açıklaması yazımı (`product_families.description`) | URUN-KATALOG | `cagiran-yok` (kendisi `content-write.mjs`'i çağırır, ters yön) | 0 koşum izi | yok | OLU-DOGRULANDI |
| `scripts/db/product-data/identity-fix.mjs` | T148-VH kimlik düzeltmesi (sku/model_code/name/slug) | URUN-KATALOG | `elle` | `docs/plans/urun-kimlik-duzeltme-2026-08-22.md:96`; pano 2026-09-07T06:48Z (bugün, REC-178 hedefi) | yok | KAL |
| `scripts/db/product-data/seat-content-write.mjs` | T140-VH SEAT içerik yazımı, varsayılan DRY-RUN | URUN-KATALOG | `scripts/db/product-data/content-write.mjs` | 2026-08-22 | yok | KAL |
| `scripts/db/product-data/t138-model-split.mjs` | T138-VH model katmanı ayrıştırma, varsayılan DRY-RUN | URUN-KATALOG | `docs/standards/product-schema-standard.md` | 2026-08-23 | yok | KAL |
| `scripts/db/verify_security_hardening.js` | Güvenlik sertleştirme doğrulaması | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/docs/sync_supabase_docs.cjs` | (docstring yok) Supabase doküman senkronu | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/edge/drift-check.mjs` | Repo≠prod sapma dedektörü (edge functions) | ALTYAPI | `.github/workflows/{deploy-functions,edge-shared-input-drift}.yml` | 2026-08-15 | yok | KAL |
| `scripts/edge/select-functions.mjs` | Değişen dosyalardan deploy edilecek edge fonksiyonlarını seçer | ALTYAPI | `.github/workflows/{deploy-functions,edge-shared-input-drift}.yml` | 2026-08-15 | yok | KAL |
| `scripts/expand-all-evals.py` | Manifest'teki tüm skill'ler için eval genişletir | OPS | `cagiran-yok` | 0 eşleşme (skill ağaçları dahil) | yok | OLU-DOGRULANDI |
| `scripts/generate/generate-meta.mjs` | Sondaki slash'ı temizleyip meta üretir | ALTYAPI | `cagiran-yok` | 0 eşleşme; App Router metadata API yerini aldı | yok | OLU-DOGRULANDI |
| `scripts/generate/generate-sitemap.mjs` | Statik sitemap üretir (halefi `src/app/sitemap.ts`) | ALTYAPI | `cagiran-yok` | pano 2026-09-07T07:00:51Z: "ÖLÜ + TEHLİKELİ, karantina = scripts/archive/" | yok | KAYIP (onceki: KARANTINA (bu PR ile `scripts/archive/`'e taşındı — bkz. §4)) |
| `scripts/generate/generate-next-routes.js` | ⚠Çalışmıyor — hatalı import'lar, Pre-App-Router hedef düzeni | ALTYAPI | `docs/standards/fleet-mechanism-standard.md` (anılıyor, silme adayı notuyla) | 2026-09-01 | yok | KAL *(not: REC-102 "silme adayı" dedi, henüz silinmedi/karantinada değil)* |
| `scripts/health-check.ps1` | Lint + Type Check koşumu | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/hijyen/agac-artik-envanteri.cjs` | Çalışma ağacı artık envanteri (REC-142 DoD4) | ALTYAPI | `cagiran-yok` (elle) | pano 2026-09-05T06:48:22Z: "ENVANTER ÇIKTI …366 üretilmiş" | yok | KAL |
| `scripts/hijyen/agac-silme-kapisi.cjs` | Worktree silme kapısı (REC-84 Kol-4) | ALTYAPI | `cagiran-yok` (test fikstürü + vercel-ignore-build glob) | build-skip-positive-logic.test.ts:128, `vercel-ignore-build.sh:257`, pano 2026-09-04T11:53Z | build-skip-positive-logic.test.ts | KAL |
| `scripts/hijyen/artefakt-bayatlik-sayim.cjs` | Artefakt bayatlık sayımı (donmuş mod tek kaynağı, REC-132 D1) | ALTYAPI | `docs/standards/uretilmis-artefakt-standard.md`, `scripts/board/board.cjs` | 2026-09-05 | uretilmis-artefakt-tazeligi.test.ts | KAL |
| `scripts/hijyen/companion-borc.cjs` | Companion borç listesi (uyku kipi defterdarı, REC-142) | ALTYAPI | `elle` | `docs/standards/companion-doc-standard.md:511` iş-emri kaynağı; çıktı bilerek commit edilmiyor | yok | KAL |
| `scripts/hijyen/companion-sayim.cjs` | Companion sayımı — tek kaynak (§26) | ALTYAPI | `scripts/board/board.cjs`, `scripts/hijyen/companion-borc.cjs` | 2026-09-05 | yok | KAL |
| `scripts/hijyen/kirli-sayac.cjs` | VS Code kaynak-denetimi rozetinin CLI karşılığı (REC-84 Kol-4) | ALTYAPI | `elle --taban-yaz` | `kirli-sayac-taban.json:5`, `vercel-ignore-build.sh:257`, `deploy-build-skip-standard.md:45` | yok | KAL |
| `scripts/hijyen/kume-master-tazeligi.cjs` | Küme master tazelik paritesi — INV-DOC-3 v2 (REC-144) | ALTYAPI | `docs/standards/companion-doc-standard.md` | 2026-09-05 | INV-DOC-3 | KAL |
| `scripts/hijyen/merge-ritueli.cjs` | Merge ritüeli — beş maddelik self-merge ölçümü (REC-131) | ALTYAPI | `docs/standards/fleet-mechanism-standard.md` | 2026-09-06 | yok | KAL |
| `scripts/hijyen/taban-tazele.cjs` | Dal ağacını origin/master ile hizalar | ALTYAPI | `docs/standards/{fleet-mechanism,uretilmis-artefakt}-standard.md` | 2026-09-01 | yok | KAL |
| `scripts/hijyen/tasiyici-anahtari.cjs` | Companion taşıyıcı anahtarı — tek okuma noktası (REC-142) | ALTYAPI | `.githooks/{post-commit,post-merge}` | 2026-09-05 | yok | KAL |
| `scripts/icerik-hatti/aile-metni-yaz.mjs` | Aile metni yazıcı — REC-146 Adım 3, varsayılan kuru koşum | URUN-KATALOG | `elle` | 0 çağıran/0 koşum izi; DB'ye yazar, dosya artefaktı bırakmaz | yok | **OLCULEMEDI** *(1 günlük, aktif şeritte, elle prod-yazan araç — mevcut ölçütlerle ayrım yapılamıyor, sahibine sorulmalı)* |
| `scripts/icerik-hatti/db-durum-olc.mjs` | DB durum ölçümü — salt okuma | URUN-KATALOG | `elle` | pano 2026-09-06T18:39Z/18:49Z: fail-open bulundu ve kapatıldı | yok | KAL |
| `scripts/icerik-hatti/kanit-tablosu.py` | Kanıt tablosu + kanıtsız değer mandalı (REC-163 Adım 2) | URUN-KATALOG | `scripts/icerik-hatti/toplu-sunum.py` | `origin/urun-katalog/calisma` 2026-09-06, `icerik-hatti-kanit-daraltma-2026-09-06.md:115`; pano 2026-09-07T06:42Z | yok | KAL |
| `scripts/icerik-hatti/taslak-kaynak-kapisi.py` | İçerik taslağı kaynak doğrulama kapısı | URUN-KATALOG | `scripts/icerik-hatti/toplu-sunum.py` | 2026-09-06 | kendisi kapı | KAL |
| `scripts/icerik-hatti/tier-c-temizlik.mjs` | REC-155 B: iç-not içeren açıklamaları temizler | URUN-KATALOG | `elle` | `docs/proje-takip/yol-haritasi.json:570` (YH-32 beklenen dosya) → `yol_haritasi_dogrula.py` kapısı | yol_haritasi_dogrula.py (dolaylı) | KAL |
| `scripts/icerik-hatti/toplu-sunum.py` | Toplu sunum üretici (REC-146 Adım 2b, K7.8) | URUN-KATALOG | `scripts/icerik-hatti/aile-metni-yaz.mjs` | 2026-09-06 | yok | KAL |
| `scripts/kademe2-load/load.mjs` | Kademe-2 CSV→DB loader (deterministik, LLM yok) | URUN-KATALOG *(devir adayı, orijinal SAHİPSİZ)* | `docs/standards/fleet-mechanism-standard.md` | 2026-09-01 | yok | KAL |
| `scripts/katalog/katalog-sayim.mjs` | Katalog sayımı — tek kaynak (REC-136) | URUN-KATALOG | `.github/workflows/katalog-sayim.yml`, `docs/standards/katalog-sayim-standard.md` | 2026-09-03 | yok | KAL |
| `scripts/katalog/matris-sutun-doluluk.mjs` | Matris sütun doluluk ölçümü (REC-141 / URUN kalem 5) | URUN-KATALOG | `elle` | `docs/audits/matris-sutun-doluluk-2026-09-05.md` (2 gün taze); `design/menu/github.md:46`; pano 2026-09-06T14:58Z | yok | KAL |
| `scripts/media/avens-kentalfan-fill-manifest.mjs` | KENTALFAN eki manifesti (Casals plug fan serisi) | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu (`t139-gun-sonu-raporu-2026-08-21.md:85`), yetki **EXPIRED**; pano 2026-09-07T07:02Z karantina önerisi | yok | OLU-DOGRULANDI |
| `scripts/media/avensair-avens-run.mjs` | AVenS kategori keşfi + eşleme + indirme + webp | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | `t139-gun-sonu-raporu-2026-08-21.md:84`, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/avensair-nicotra-run.mjs` | NICOTRA görselleri keşif+eşleme+indirme+webp | URUN-KATALOG *(devir adayı)* | `cagiran-yok` (upload-pilot-images.mjs onu çağırıyor ama o zincir de kapandı) | `t139-urun-gorseli-pilotu-2026-08-21.md:142`, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/build-olcek-manifest.mjs` | T139-ÖLÇEK url-haritası + DB birleştirme manifesti | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | 0 eşleşme; ölçek koşumu hiç açılmadı | yok | OLU-DOGRULANDI |
| `scripts/media/danfoss-fc101-run.mjs` | DANFOSS FC-101 görsel eki | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/danfoss-fc102-fill-manifest.mjs` | DANFOSS FC-102 görsel eki | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/nicotra-dd-fill-manifest.mjs` | Nicotra DD eki (2 SKU) | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/seat-atex-manifest.mjs` | SEAT ATEX görsel eki | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/seat-image-run.mjs` | SEAT-FAZ2 görselleri eşleme+indirme+webp | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/upload-pilot-images.mjs` | T139-VH Adım-4: pilot webp'leri bucket'a yükler (PROD YAZAR) | URUN-KATALOG *(devir adayı)* | `scripts/media/{avensair-nicotra-run,seat-atex-manifest}.mjs` | 2026-08-21 | yok | KAL *(uyarı: çağırdığı iki betik de ÖLÜ DOĞRULANDI — zincir çürüdü, tek başına yeniden ölçülmeli)* |
| `scripts/media/url-fill-manifest.mjs` | Genel URL-dolgu ("URL ile bağlama yetkisi" kalıbı) | URUN-KATALOG *(devir adayı)* | `docs/standards/product-image-standard.md` | 2026-08-21 | yok | KAL |
| `scripts/media/vortice-crawl-map.mjs` | Vortice kategori ağacı → model_code haritası (prod'a yazmaz) | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/vortice-image-pilot.mjs` | Vortice ürün görseli pilotu | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/media/vortice-probe-missing.mjs` | Kategori ağacında bulunamayan kodları doğrudan yoklar | URUN-KATALOG *(devir adayı)* | `cagiran-yok` | koştu, yetki EXPIRED | yok | OLU-DOGRULANDI |
| `scripts/migrate-skills-to-v2.py` | Skill v2 göçü (git kökü türetimi) | OPS | `cagiran-yok` | 0 eşleşme; göç tamamlandı | yok | OLU-DOGRULANDI |
| `scripts/nlm/acilis_kapisi.py` | Açılış kapısı — gün kapanışı damgasını okur (YH-47) | OPS | `docs/standards/proje-takip-defteri-standard.md`, `scripts/nlm/gun_kapanisi.py` | 2026-09-06 | yok | KAL |
| `scripts/nlm/gun_kapanisi.py` | Gün kapanışı — tek komut (YH-47) | OPS | `docs/standards/proje-takip-defteri-standard.md`, `scripts/nlm/acilis_kapisi.py` | 2026-09-06 | yok | KAL |
| `scripts/nlm/hafiza_sinavi.py` | Hafıza sınavı — belgeler için kapı (v1.1) | OPS | `docs/standards/proje-takip-defteri-standard.md` | 2026-09-05 | kendisi kapı | KAL |
| `scripts/nlm/kararlar_disa_aktar.py` | Linear "Kararlar" belgelerinin depo aynası | OPS | `scripts/nlm/gun_kapanisi.py` | 2026-09-06 | yok | KAL |
| `scripts/nlm/konusma_gunlugu.py` | Konuşma günlüğü — gün bazlı, sır süzgeçli özet | OPS | `docs/standards/proje-takip-defteri-standard.md` | 2026-09-06 | yok | KAL |
| `scripts/nlm/linear_disa_aktar.py` | Linear → "şantiye durumu" dışa aktarımı | OPS | `scripts/nlm/gun_kapanisi.py` | 2026-09-06 | yok | KAL |
| `scripts/nlm/pano_disa_aktar.py` | Pano (telsiz) notlarını NLM defteri için Markdown'a çevirir | OPS | `scripts/nlm/{gun_kapanisi,konusma_gunlugu}.py` | 2026-09-06 | yok | KAL |
| `scripts/nlm/proje_takip_sync.py` | Proje Takip defteri eşitleyicisi | OPS | `docs/standards/proje-takip-defteri-standard.md` | 2026-09-06 | yok | KAL |
| `scripts/nlm/yol_haritasi_ayna.py` | Yol haritası → Linear aynası (sır süzgeçli) | OPS | `scripts/nlm/gun_kapanisi.py` | 2026-09-06 | yok | KAL |
| `scripts/nlm/yol_haritasi_dogrula.py` | Yol haritası doğrulayıcı — planın test dosyası (v1) | OPS | `docs/standards/proje-takip-defteri-standard.md` | 2026-09-06 | kendisi kapı | KAL |
| `scripts/security/secret-scan.py` | Sır taraması (18 imza, geçmiş dahil tüm depo) | OPS *(devir adayı: ALTYAPI)* | `elle` | `docs/mutlak-yol-istisnalari.json:71` → `mutlak-yol-sizintisi.test.ts` okuyor; CLAUDE.md görünürlük öncesi zorunlu | mutlak-yol-sizintisi.test.ts | KAL |
| `scripts/seo/indexnow-bildir.mjs` | IndexNow toplu bildirim (tek seferlik, REC-127) | URUN | `cagiran-yok` | 0 çağıran/0 pano izi; görev tamamlandı (GSC+sitemap OK) | yok | OLU-DOGRULANDI |
| `scripts/setup-hooks.mjs` | `.githooks/`i git'e bağlar (`pnpm install` sonrası `prepare`) | OPS *(devir adayı: ALTYAPI)* | `.githooks/README.md`, `docs/standards/deploy-build-skip-standard.md` | 2026-08-15 | yok | KAL |
| `scripts/setup_webhooks.js` | Webhook kurulum yardımcısı (.env parse) | OPS *(devir adayı: ALTYAPI)* | `docs/standards/rendering-cache-standard.md`, `scripts/setup_webhooks_cli.js` | 2026-08-15 | yok | KAL |
| `scripts/setup_webhooks_cli.js` | Webhook kurulum CLI'ı (.env parse) | OPS *(devir adayı: ALTYAPI)* | `docs/standards/rendering-cache-standard.md`, `scripts/setup_webhooks.js` | 2026-08-15 | yok | KAL |
| `scripts/skills-creator.py` | Yeni skill oluşturma (name/description/category) | OPS | `elle` | `.claude/skills/skills-creator/SKILL.md:25,67`, `.agent/skills/…`, `manifest.yaml:162` `validate:` | skill validate adımı canlı | KAL |
| `scripts/skills-evaluator.py` | Skill eval koşucusu | OPS | `scripts/skills-creator.py`, `package.json → skills:verify` | 2026-06-10 | yok | KAL |
| `scripts/skills-orchestrator.py` | Skill orkestrasyonu (docstring yok) | OPS | `cagiran-yok` (0 gerçek çağıran; yalnız ölü companion çağrı grafiğinde `skills-router.py`'nin "çağıranı") | 0 eşleşme | yok | **OLU-DOGRULANDI (zincir uyarısı)** *(kendisini çağıran skills-router.py de aynı turda yeniden ölçülmeli)* |
| `scripts/skills-router.py` | Skill yönlendirme | OPS | `scripts/skills-orchestrator.py` (çağıranı ÖLÜ DOĞRULANDI — bkz. yukarı) | 2026-06-08 | yok | KAL *(uyarı: tek çağıranı ölü doğrulandı, ikinci turda yeniden ölç)* |
| `scripts/tools/deploy_iyzico.ps1` | İyzico deploy betiği | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/tools/extract_brands.py` | Marka çıkarımı (docstring yok) | OPS *(devir adayı: URUN-KATALOG)* | `cagiran-yok` | pano 2026-09-07T07:02Z: karantina önerisi OPS'a, silme Recep kapısı | yok | OLU-DOGRULANDI |
| `scripts/tools/extract_pdf.py` | PDF çıkarımı (docstring yok) | OPS *(devir adayı: URUN-KATALOG)* | `cagiran-yok` | 0 eşleşme; PDF hattı `venthub-pdf-ingestor`'a taşındı | yok | OLU-DOGRULANDI |
| `scripts/tools/fix_aria_labels.py` | ARIA label eşlemesi (ikon→etiket) | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme; tek-seferlik codemod | yok | OLU-DOGRULANDI |
| `scripts/tools/fix_literal_newlines.ps1` | Literal `\n`'i gerçek newline'a çevirir | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme; tek-seferlik codemod | yok | OLU-DOGRULANDI |
| `scripts/tools/migrate_images.py` | `<img>` → `VentImage` göçü | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme; göç tamamlandı | yok | OLU-DOGRULANDI |
| `scripts/tools/replace_http.py` | http→https değiştirme taraması | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme; tek-seferlik codemod | yok | OLU-DOGRULANDI |
| `scripts/vercel-ignore-build.sh` | T086 Vercel "Ignored Build Step" — build gerektirmeyen değişiklikleri atlar | OPS *(devir adayı: ALTYAPI)* | `docs/standards/deploy-build-skip-standard.md` | 2026-08-27 | build-skip-positive-logic.test.ts | KAL |
| `scripts/archive/generate-sitemap.mjs` | scripts/generate-sitemap.mjs | OPS | docs/proje-takip/linear/is-dagilimi-2026-09-07.json, docs/proje-takip/linear/is-dagilimi-2026-09-07.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | KAYIP (onceki: YENI) |
| `scripts/db/migrations/apply_wizard_migration.ts` | (aciklama satiri yok — elle yazilmali) | OPS | cagiran-yok (betik taramasi; anma: docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/distribute_products_smart.ts` | Manual .env parser | OPS | cagiran-yok (betik taramasi; anma: registry/P04-Category-Architecture/completed/016-i18n-tam-kilitleme-ve-slug-konsolidasyonu/plan.json) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/fix_category_name.ts` | Load credentials dynamically from environment | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/fix_product_categories_client.ts` | Manual .env parser | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/fix_products_select.ts` | (aciklama satiri yok — elle yazilmali) | OPS | cagiran-yok (betik taramasi; anma: docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/restore_categories.ts` | SİLİNEN KATEGORİLERİ GERİ YÜKLE | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/run-direct-migration.ts` | (aciklama satiri yok — elle yazilmali) | OPS | cagiran-yok (betik taramasi; anma: docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/run-migration.ts` | Migration dosyasını oku | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/run_category_migration.ts` | Service role key gerekli - anon key ile silme yapılamayabilir | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/run_migration_remote.ts` | Capture notices | OPS | cagiran-yok (betik taramasi; anma: docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/db/migrations/run_migration_via_db_url.ts` | Use provided pooler format from .env or fallback to provided working string | OPS | cagiran-yok (betik taramasi; anma: docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/hijyen/arac-envanteri.cjs` | Envanteri fs'ten üretir ve INV-ARAC-1..3 kapısını koşar (REC-185) | ALTYAPI | `elle` + `src/__tests__/conformance/arac-envanteri.test.ts` | kapı testi 17/17, 2026-09-07 | arac-envanteri.test.ts | KAL |
| `scripts/icerik-hatti/_kaynak.py` | -*- coding: utf-8 -*- | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/_veri.mjs` | ORTAK VERI ERISIMI (JS) — 1000 satir tavanina karsi sayfalama + veri-tamligi kapisi. | OPS | scripts/db/product-data/identity-fix.mjs, scripts/media/avens-kentalfan-fill-manifest.mjs (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/_veri.py` | -*- coding: utf-8 -*- | OPS | cagiran-yok (betik taramasi; anma: docs/audits/icerik-hatti-1000-satir-tavani-filo-notu-2026-09-06.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/aile-kaynak-cikar.py` | -*- coding: utf-8 -*- | OPS | docs/standards/catalog-ingestion-standard.md, scripts/icerik-hatti/kanit-tablosu.py (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/faz4-etiket-duzelt.py` | -*- coding: utf-8 -*- | OPS | scripts/icerik-hatti/faz4-teknik-yukle.py (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/faz4-teknik-yukle.py` | -*- coding: utf-8 -*- | OPS | cagiran-yok (betik taramasi; anma: docs/audits/icerik-hatti-faz4-hazirlik-2026-09-07.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/fiyatsiz-ayrim.py` | -*- coding: utf-8 -*- | OPS | scripts/icerik-hatti/_veri.mjs, scripts/icerik-hatti/_veri.py (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/teknik_bosluk.py` | -*- coding: utf-8 -*- | OPS | scripts/icerik-hatti/_kaynak.py (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/urun-veri-cek.mjs` | URUN VERI CEKME — kanit tablosunun girdisi (REC-163). | OPS | scripts/icerik-hatti/aile-kaynak-cikar.py (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/nlm/santiye.py` | Olcut updatedAt DEGIL "sonAnlamli" (son yorum / PR eki / baslama / bitis / acilis): etiket, toplu bakim, betik dokunusu yasi TAZELEMEZ. | OPS | docs/standards/work-tracking-ssot-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/birim-gomulu-duzelt.mjs` | BİRİM-GÖMÜLÜ HÜCRE DÜZELTİCİSİ — REC-190 | OPS | cagiran-yok (betik taramasi; anma: docs/audits/icerik-hatti-birim-olcek-kusurlari-2026-09-07.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/kategori-metni-yaz.mjs` | KATEGORİ REHBER PARAGRAFLARINI CANLIYA YAZAR — REC-146 madde 3 / REC-161 yolu. | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/kayip-urun-aile-bagla.mjs` | KAYIP ÜRÜN AKTARIMI — İKİNCİ YARI: AİLE BAĞI + KATEGORİ ONARIMI (REC-226) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/kayip-urun-aktar.mjs` | KAYIP ÜRÜN AKTARIMI — REC-226 | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/kip/satis-kipine-gec.mjs` | Satış kipi geçiş betiği — TEK KOMUTLA aç/kapat, yedekli, geri alınabilir (REC-168). | OPS | docs/standards/satis-kipi-gecis-standard.md, src/__tests__/conformance/build-skip-positive-logic.test.ts (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/build-skip-positive-logic.test.ts, src/__tests__/conformance/satis-kipi-anahtari.test.ts | YENI |
| `scripts/icerik-hatti/katalog-disa-aktar.mjs` | TAŞINABİLİR KATALOG — DIŞA AKTARICI (REC-212) | OPS | cagiran-yok (betik taramasi; anma: docs/audits/icerik-hatti-tasinabilir-katalog-2026-09-07.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/katalog-geri-yukle.mjs` | TAŞINABİLİR KATALOG — GERİ YÜKLEYİCİ (REC-212, ikinci yarı) | OPS | cagiran-yok (betik taramasi; anma: docs/audits/icerik-hatti-tasinabilir-katalog-2026-09-07.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/katalog-karnesi.mjs` | KATALOG KARNESİ — hattın dokuz satırı, TEK komutla (KOL 6 ilk çıktısı) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| `scripts/icerik-hatti/uydurma-kod-bosalt.mjs` | UYDURMA `model_code` BOŞALTICISI — REC-226 (kaynak kanıtına dayalı) | URUN-KATALOG | elle (kuru koşum varsayılan; `--yaz` + `CANLI_YAZIM_ONAYI`) | PR #1109 (üç yönlü sabotaj koşuldu) | kendi ön koşul kapısı içinde (üç yüzeyde `sku` yedeği varsa yazmaz) | KAYIP (onceki: KAL) |
| `scripts/icerik-hatti/kimlik-kurali.mjs` | ÜRÜN KİMLİK KURALI — TEK KAYNAK (REC-226 / REC-272 / REC-275) | URUN-KATALOG | import edilir (kural tek kaynak; kademe2-load + icerik-hatti kullanir) | PR #1109 · 442 urunde cakisma 0 olculdu | cagiranin on kosul kapisi | KAL |
| `scripts/icerik-hatti/uydurma-kimlik-tek-kural.mjs` | UYDURMA KİMLİĞİ TEK KURALA GETİRİR — REC-226 / REC-272 / REC-275 | URUN-KATALOG | elle (kuru kosum varsayilan; --yaz + CANLI_YAZIM_ONAYI) | PR #1109 · uc yonlu sabotaj | iki on kosul kapisi (sku yedegi + benzersizlik) | KAL |
| `scripts/icerik-hatti/kimlik-kurali-kapisi.mjs` | KİMLİK KURALI KAPISI — INV-KIMLIK-TEK-KURAL-1 (REC-275) | URUN-KATALOG | elle / CI (ALTYAPI'dan baglanmasi istenecek) | PR #1109 · iki yonlu sabotaj: ardisik-sayi uydurma ve kodsuz-satir dusurme KIRMIZI verdirdi | INV-KIMLIK-TEK-KURAL-1 (kendisi kapi) | KAL |
| `scripts/nlm/linear_arsiv.py` | Linear GraphQL: kim / say / arsivle <no...> / arsivle done / arsivle canceled — Done kayitlar 7 gun sonra arsiv (250 sinir); LINEAR_API_KEY ortamdan | OPS | insan (OPS rutin, haftalik) | 2026-09-08 · PR #1118 | yok (cetvel: work-tracking-ssot-standard, arsiv rutini) | KAL-KAPISIZ |

### 3.3 · skill (39 tekil ad, 64 satır ağaç-bazlı)

| # | Ad | Ağaç | ne_yapar | sahip (manifest kategorisi) | tetik | kanıt (son değişiklik · manifest) | kapı | durum |
|---|---|---|---|---|---|---|---|---|
| 1 | ui-ux-pro-max | .claude | UI/UX renk·Tailwind·HSL öneri | guards | `skill:ui-ux-pro-max` | 2026-08-11 · manifest yok (.claude kapsam dışı) | 09-05 §3 KAL kararı | KAL |
| 2 | ui-ux-pro-max | .agent | (aynı) | guards | `skill:ui-ux-pro-max` | 2026-09-01 · manifest evet | manifest kaydı | KAL |
| 3 | typography | .claude | font/okunabilirlik/tip ölçeği | guards | `skill:typography` | 2026-08-11 · manifest yok | 09-05 §3 | KAL |
| 4 | typography | .agent | (aynı) | guards | `skill:typography` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 5 | web-design-guidelines | .claude | a11y/Web Interface Guidelines denetimi | guards | `skill:web-design-guidelines` | 2026-06-11 · manifest yok | 09-05 §3 | KAL |
| 6 | web-design-guidelines | .agent | (aynı) | guards | `skill:web-design-guidelines` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 7 | threejs-webgl-performance | .claude | R3F/Three.js draw-call·gölge·Lighthouse | guards | `skill:threejs-webgl-performance` | 2026-06-18 · manifest yok | 09-05 §3 | KAL |
| 8 | threejs-webgl-performance | .agent | (aynı) | guards | `skill:threejs-webgl-performance` | 2026-06-18 · manifest evet | manifest kaydı | KAL |
| 9 | vercel-composition-patterns | .claude | compound component/context deseni | guards | `skill:vercel-composition-patterns` | 2026-06-11 · manifest yok | 09-05 §3 | KAL |
| 10 | vercel-composition-patterns | .agent | (aynı) | guards | `skill:vercel-composition-patterns` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 11 | venthub-architecture | .claude | RSC/App Router/render-cache kuralları | guards | `skill:venthub-architecture` | 2026-08-18 · manifest yok | 09-05 §3 | KAL |
| 12 | venthub-architecture | .agent | (aynı) | guards | `skill:venthub-architecture` | 2026-08-18 · manifest evet | manifest kaydı | KAL |
| 13 | codegraph | .claude | CodeGraph MCP caller/callee/impact | intelligence | `skill:codegraph` | 2026-08-11 · manifest yok | yok | ENVANTER-DISI |
| 14 | codegraph | .agent | (aynı) | intelligence | `skill:codegraph` | 2026-06-11 · manifest evet | manifest kaydı | KAL |
| 15 | diff-review | .claude | git diff yıkıcı/tehlikeli örüntü tespiti | audit | `skill:diff-review` | 2026-08-25 · manifest yok | yok | ENVANTER-DISI |
| 16 | diff-review | .agent | (aynı) | audit | `skill:diff-review` | 2026-08-25 · manifest evet | manifest kaydı | KAL |
| 17 | fallow | .claude | JS/TS dead-code/duplication/complexity | audit | `skill:fallow` | 2026-08-18 · manifest yok | yok | ENVANTER-DISI |
| 18 | fallow | .agent | (aynı) | audit | `skill:fallow` | 2026-08-18 · manifest evet | manifest kaydı | KAL |
| 19 | find-skills | .claude | skill arama/keşif/kurulum | intelligence | `skill:find-skills` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 20 | find-skills | .agent | (aynı) | intelligence | `skill:find-skills` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 21 | git-commit | .claude | conventional commit üretimi/staging | utils | `skill:git-commit` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 22 | git-commit | .agent | (aynı) | utils | `skill:git-commit` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 23 | i18n-conventions | .claude | TR/EN sözlük/JSX literal göçü kuralları | guards | `skill:i18n-conventions` | 2026-06-16 · manifest yok | yok | ENVANTER-DISI |
| 24 | i18n-conventions | .agent | (aynı) | guards | `skill:i18n-conventions` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 25 | notebook-navigator | .claude | NLM ikizinde kavramsal/RAG sorgu | intelligence | `skill:notebook-navigator` | 2026-08-25 · manifest yok | yok | ENVANTER-DISI |
| 26 | notebook-navigator | .agent | (aynı) | intelligence | `skill:notebook-navigator` | 2026-08-25 · manifest evet | manifest kaydı | KAL |
| 27 | notebooklm-sync | .claude | .md dosyalarını NLM defterine senkronize | intelligence | `skill:notebooklm-sync` | 2026-08-25 · manifest yok | yok | ENVANTER-DISI |
| 28 | notebooklm-sync | .agent | (aynı) | intelligence | `skill:notebooklm-sync` | 2026-08-17 · manifest evet | manifest kaydı | KAL |
| 29 | orion-cli | .claude | Orion CLI doküman pipeline komutları | intelligence | `skill:orion-cli` | 2026-08-17 · manifest yok | yok | ENVANTER-DISI |
| 30 | orion-cli | .agent | (aynı) | intelligence | `skill:orion-cli` | 2026-08-17 · manifest evet | manifest kaydı | KAL |
| 31 | plan-challenger | .claude | plan/PRD uygulama-öncesi red-team çürütme | audit | `skill:plan-challenger` | 2026-08-18 · manifest yok | yok | ENVANTER-DISI |
| 32 | plan-challenger | .agent | (aynı) | audit | `skill:plan-challenger` | 2026-08-18 · manifest evet | manifest kaydı | KAL |
| 33 | skills-creator | .claude | yeni skill oluşturma/manifest derleme | orchestration | `skill:skills-creator` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 34 | skills-creator | .agent | (aynı) | orchestration | `skill:skills-creator` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 35 | supabase-security | .claude | RLS policy/migration/middleware kuralı | guards | `skill:supabase-security` | 2026-08-13 · manifest yok | yok | ENVANTER-DISI |
| 36 | supabase-security | .agent | (aynı) | guards | `skill:supabase-security` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 37 | supabase | .claude | Supabase client/servis/db query kuralı | guards | `skill:supabase` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 38 | supabase | .agent | (aynı) | guards | `skill:supabase` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 39 | to-issues | .claude | plan/PRD'yi issue'lara böler | utils | `skill:to-issues` | 2026-08-11 · manifest yok | yok | ENVANTER-DISI |
| 40 | to-issues | .agent | (aynı) | utils | `skill:to-issues` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 41 | to-prd | .claude | konuşma transkriptini PRD'ye çevirir | utils | `skill:to-prd` | 2026-08-11 · manifest yok | yok | ENVANTER-DISI |
| 42 | to-prd | .agent | (aynı) | utils | `skill:to-prd` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 43 | venthub-auditor | .claude | pre-commit/bütünlük denetimi | audit | `skill:venthub-auditor` | 2026-08-27 · manifest yok | yok | ENVANTER-DISI |
| 44 | venthub-auditor | .agent | (aynı) | audit | `skill:venthub-auditor` | 2026-08-25 · manifest evet | manifest kaydı | KAL |
| 45 | venthub-enterprise-audit | .claude | L1-L12 "10/10 onay" teslim denetimi | audit | `skill:venthub-enterprise-audit` | 2026-08-11 · manifest yok | yok | ENVANTER-DISI |
| 46 | venthub-enterprise-audit | .agent | (aynı) | audit | `skill:venthub-enterprise-audit` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 47 | venthub-global-rontgen | .claude | proje-geneli fiziki radar/rontgen taraması | audit | `skill:venthub-global-rontgen` | 2026-08-27 · manifest yok | yok | ENVANTER-DISI |
| 48 | venthub-global-rontgen | .agent | (aynı) | audit | `skill:venthub-global-rontgen` | 2026-08-18 · manifest evet | manifest kaydı | KAL |
| 49 | vercel-react-best-practices | .claude | React/Next.js performans/waterfall kuralları | guards | `skill:vercel-react-best-practices` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 50 | vercel-react-best-practices | .agent | (aynı) | guards | `skill:vercel-react-best-practices` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 51 | agy-orchestrate | .claude | Antigravity CLI'a geniş taramayı delege eder | orchestration | `skill:agy-orchestrate` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 52 | create-migration | .claude | güvenli Supabase migration oluşturma akışı | OPS *(sahipsiz — kategori/manifest yok)* | `skill:create-migration` | 2026-08-26 · manifest yok | yok | ENVANTER-DISI |
| 53 | maestro | .claude | bölünebilir büyük kod değişikliğini paralel dalga olarak orkestre eder | orchestration | `skill:maestro` | 2026-08-27 · manifest yok | yok | ENVANTER-DISI |
| 54 | prd-complexity-audit | .claude | kod tabanını vizyon/PRD'ye karşı denetler | intelligence | `skill:prd-complexity-audit` | 2026-08-11 · manifest yok | yok | ENVANTER-DISI |
| 55 | venthub-20-eksen-denetimi | .claude | 20 eksende kalite/güvenlik karnesi üretir | OPS *(sahipsiz — kategori/manifest yok)* | `skill:venthub-20-eksen-denetimi` | 2026-08-15 · manifest yok | yok | ENVANTER-DISI |
| 56 | multi-agent-research | .agent | worker-judge çok-ajanlı kod araştırması | orchestration | `skill:multi-agent-research` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 57 | parallel-file-audit | .agent | kör alt-ajanlarla paralel dosya denetimi | orchestration | `skill:parallel-file-audit` | 2026-06-16 · manifest evet | manifest kaydı | KAL |
| 58 | teamwork-director | .agent | teamwork-preview prompt hazırlama/delegasyon | orchestration | `skill:teamwork-director` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 59 | lighthouse-performance-guard | .agent | Lighthouse/web-vitals regresyon denetimi | audit | `skill:lighthouse-performance-guard` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 60 | performance-alignment | .agent | NLM ile çok-turlu performans hizalama planı | audit | `skill:performance-alignment` | 2026-08-17 · manifest evet | manifest kaydı | KAL |
| 61 | venthub-catalog-importer | .agent | HVAC katalog PDF içe alma/doğrulama | audit | `skill:venthub-catalog-importer` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 62 | maestro-combine | .agent | çakışmasız paralel merge (JSON delta) | orchestration | `skill:maestro-combine` | 2026-06-17 · manifest evet | manifest kaydı | KAL |
| 63 | maestro-feature | .agent | worker-judge çok-ajan özellik geliştirme | orchestration | `skill:maestro-feature` | 2026-08-18 · manifest evet | manifest kaydı | KAL |
| 64 | maestro-refactor | .agent | bölünebilir büyük değişikliği paralel dalga | orchestration | `skill:maestro-refactor` | 2026-06-17 · manifest evet | manifest kaydı | KAL |
| 65 | venthub-tasarim-dili | .agent | (SKILL.md ozetinden elle) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| 66 | venthub-tasarim-dili | .claude | (SKILL.md ozetinden elle) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |

**Not:** ENVANTER-DIŞI = `.claude` ağacındaki satır ne `venthub-core` manifest'inde (yalnız `.agent`
yollarını kapsar) ne 09-05 dış envanterinin §3 istisnasında geçiyor. Bu "yanlış" anlamına gelmez —
CLAUDE.md iki ağacı (`.claude/skills`, `.agent/skills`) kasıtlı paralel tanımlıyor; manifest yalnız
`venthub-core` plugin'inin `.agent` tarafını kaydediyor. `create-migration` ve
`venthub-20-eksen-denetimi` ayrıca **sahipsiz** (ne manifest kategorisi ne `SKILL.md category:`
alanı) → AXIOM 2 gereği OPS'a yazıldı.

### 3.4 · githook — `.githooks/*` (5 araç)

| yol | ne_yapar | sahip | tetik | kanıt | kapı | durum |
|---|---|---|---|---|---|---|
| `.githooks/pre-commit` | Companion `.md` yoksa UYARI (bloklamaz) + `lane-precommit.cjs` ile şerit kapısı (BLOKLAR) | ALTYAPI | `githook:pre-commit` (shim `.git/hooks/pre-commit`) | 2026-09-05 (532fe30df) | githooks-integrity.test.ts, githooks-doc-scope.test.ts | KAL |
| `.githooks/post-commit` | Arka planda companion üretimi (`orion doc tree/batch`) + başarısızlık defteri | ALTYAPI | `githook:post-commit` (shim) | 2026-09-05; `.git/orion-doc.log` son gerçek üretim 2026-09-03 | githooks-integrity.test.ts | KAL *(üretim tarafı UYKU KİPİNDE — REC-142, taşıyıcı anahtarı kapalı)* |
| `.githooks/post-merge` | `doc-scope.cjs` süzgeciyle `orion doc single/schema/batch/tree` + arka planda `registry-sync.cjs` | ALTYAPI | `githook:post-merge` (shim) | 2026-09-05; `.git/orion-postmerge.log` son 2 satır "UYKU KIPI" (2026-09-06) | githooks-integrity.test.ts | KAL *(üretim tarafı UYKU KİPİNDE)* |
| `.githooks/lib/doc-scope.cjs` | Companion kapsam süzgecinin TEK uygulaması (SSOT `.cc_docs.yaml`) | ALTYAPI | `require()` ← pre-commit YOK, post-commit + post-merge EVET | — | githooks-doc-scope.test.ts (INV-HOOKS-2) | KAL |
| `.githooks/lib/companion-defter.cjs` | Companion üretim başarısızlıklarını görünür deftere yazar (REC-67) | ALTYAPI | `require()` ← post-commit | — | companion-defter.test.ts | KAL |

**Not:** `.githooks/README.md` (SSOT gerekçe dokümanı) ve `src/__tests__/conformance/{githooks-integrity,githooks-doc-scope,hook-referential-stability}.test.ts` yukarıdaki satırların doküman/kapı bileşenidir, ayrı araç sayılmadı.

### 3.5 · ci — `.github/workflows/*.yml` (29 araç)

| dosya | ne_yapar | sahip | tetik | kanıt | kapı | durum |
|---|---|---|---|---|---|---|
| `ci.yml` | Ana test/lint/build hattı | ALTYAPI | `ci:pull_request,push(master)` | 2026-09-06T20:44:38Z success | pnpm test/lint/build | KAL |
| `e2e-smoke.yml` | Playwright/E2E duman testi (admin+checkout) | ALTYAPI | `ci:pull_request,push(master)` | 2026-09-06T20:44:38Z success | Playwright | KAL |
| `pr-size-check.yml` | PR boyut kontrolü | ALTYAPI | `ci:pull_request(opened,synchronize)` | 2026-09-06T20:44:38Z success | inline github-script | KAL |
| `auto-label.yml` | PR otomatik etiketleme | ALTYAPI | `ci:pull_request(opened,edited)` | 2026-09-06T20:44:38Z success | inline | KAL |
| `auto-reviewer.yml` | Otomatik reviewer ataması | ALTYAPI | `ci:pull_request(opened)` | 2026-09-06T20:44:38Z success | inline | KAL |
| `db-advisor.yml` | Supabase RLS/rol/katalog bütünlük kontrolleri | ALTYAPI | `ci:push(master),pull_request` | 2026-09-06T20:44:38Z success | anon-yazma-nobetcisi/catalog-integrity/rls-role-coverage.mjs | KAL |
| `deploy-functions.yml` | Edge fonksiyonlarını deploy eder | ALTYAPI | `ci:workflow_dispatch,push(master,path)` | 2026-09-06T09:11:33Z success | drift-check/select-functions.mjs | KAL |
| `edge-shared-input-drift.yml` | Edge paylaşılan girdi sapma kapısı | ALTYAPI | `ci:pull_request(path)` | 2026-09-06T06:37:33Z success | drift-check/select-functions.mjs | KAL |
| `expired-reservations-cron.yml` | Süresi dolan rezervasyonları temizler | ALTYAPI *(devir adayı: OPS)* | `ci:schedule(03:15 UTC),workflow_dispatch` | 2026-09-06T07:54:35Z success | inline curl | KAL |
| `order-housekeeping-cron.yml` | Sipariş mutabakatı (iyzico-callback) | ALTYAPI *(devir adayı: OPS)* | `ci:schedule(*/30),workflow_dispatch` | 2026-09-07T05:43:33Z success | inline curl | KAL |
| `stock-alert-cron.yml` | Stok uyarısı Edge Function tetikleyici | ALTYAPI *(devir adayı: URUN-KATALOG)* | `ci:schedule(06:20 UTC),workflow_dispatch` | 2026-09-06T10:59:40Z success | inline curl | KAL |
| `katalog-sayim.yml` | Katalog satır/ürün sayımı | URUN-KATALOG | `ci:schedule(06:10 UTC),workflow_dispatch` | 2026-09-06T10:51:24Z success | scripts/katalog/katalog-sayim.mjs | KAL |
| `ssr-duman-alarmi.yml` | Prod SSR render canlılık duman testi | ALTYAPI | `ci:schedule(06:40 UTC),deployment_status,workflow_dispatch` | 2026-09-06T20:42:57Z skipped | pnpm test:ssr-smoke | KAL |
| `rls-guard.yml` | Migration PR'larında RLS regresyon denetimi | ALTYAPI | `ci:pull_request(path:supabase/migrations/**)` | 2026-09-06T05:04:06Z success | inline github-script | KAL |
| `supabase-migrate.yml` | Master'a merge olan migration'ı prod DB'ye otomatik uygular (Kural 13) | ALTYAPI | `ci:push(master,path),workflow_dispatch` | 2026-09-06T05:13:30Z success | Supabase CLI | KAL |
| `gemini-dispatch.yml` | PR olaylarını Gemini iş akışlarına yönlendirir | ALTYAPI | `ci:pull_request(opened),pull_request_review(_comment)` | 2026-09-06T20:45:40Z skipped | invoke/plan-execute/review/triage çağırır | KAL |
| `gemini-review.yml` | Gemini kod review adımı | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:132` | 60 dispatch koşumunun 24 başarılısında `review::success`, en yeni 2026-09-06T20:44:38Z | reusable workflow | **KAL** *(sonnet'in "2026-03-18 failure/ÖLÜ ADAY" hükmü YANLIŞTI — düzeltildi)* |
| `gemini-invoke.yml` | Gemini'yi PR bağlamında çalıştırır | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:160` | 24 başarılı dispatch koşumunda `invoke::skipped` (bağlı, tetik `@gemini` yorumu hiç gerçekleşmedi) | reusable workflow | KAL *(bağlı, uykuda)* |
| `gemini-plan-execute.yml` | Gemini plan/uygulama adımı | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:174` | aynı ölçüm, `plan-execute::skipped` ×24 | reusable workflow | KAL *(bağlı, uykuda)* |
| `gemini-triage.yml` | Gemini triage adımı | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:146` | aynı ölçüm, `triage::skipped` ×24 | reusable workflow | KAL *(bağlı, uykuda)* |
| `db-advisor-fix.yml` | DB advisor bulgularını otomatik düzeltme | ALTYAPI | `ci:workflow_dispatch` (tek satır) | son koşum 2025-12-08T07:41:35Z failure (9 ay); `gh workflow list --all` state `active` | — | OLU-DOGRULANDI |
| `jules-a11y.yml` | A11y denetimi (Jules AI) | ALTYAPI | `ci:workflow_dispatch` | `gh workflow list --all` state **disabled_manually** | — | OLU-DOGRULANDI |
| `jules-dependency-update.yml` | Bağımlılık güncelleme önerisi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | OLU-DOGRULANDI |
| `jules-i18n-sync.yml` | TR/EN sözlük paritesi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | OLU-DOGRULANDI |
| `jules-lint-fix.yml` | Lint/TS otomatik düzeltme dalgası (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | OLU-DOGRULANDI |
| `jules-performance.yml` | Performans denetimi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | OLU-DOGRULANDI |
| `jules-security-audit.yml` | Güvenlik denetimi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | OLU-DOGRULANDI |
| `jules-test-coverage.yml` | Test kapsam artırma (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | OLU-DOGRULANDI |
| `ai-auto-repair.yml` | CI kırmızıysa otomatik onarım denemesi (Jules) | ALTYAPI | `ci:workflow_run(CI tamamlanınca)` | `gh workflow list --all` state **disabled_manually**; sonnet "skipped" gördü, KAL sandı — **YANLIŞ** | — | **OLU-DOGRULANDI** *(sonnet'in KAL hükmü çürütüldü)* |

**Envanter dışı ek bulgu (29'a dahil değil):** `tmp-lf-fix.yml` — `gh workflow list --all` bunu
`active` listeliyor, ama `.github/workflows/` dizininde YOK ve `git log --all` boş dönüyor.
GitHub tarafında bayat/hayalet bir kayıt; repo tarafı hiç izlemedi. Durum: **ÖLÇÜLEMEDİ (GitHub
tarafı hayalet)** — OPS'un GitHub Actions ayarlarından elle temizlemesi gerekir (repo commit'i
gerektirmez).

### 3.6 · cetvel — `docs/standards/*.md` (67 araç)

> Kapı sütunu cetveller.md'deki kapı aynen taşındı. Durum: KAPILI→**KAL**, HARİTADA-KAPISIZ ve
> YETİM→**KAL-KAPISIZ** (AXIOM 3 madde 3: kapısı yok ama var — kapı borcu). Sahip: sahipsiz
> satırlar AXIOM 2 gereği OPS'a yazıldı, devir adayı eklendi.

| dosya | ne_yapar | sahip | tetik | kanıt | kapı | durum |
|---|---|---|---|---|---|---|
| 3d-scene-lighting-research | 3D vitrin sahne/ışık araştırma raporu | OPS *(devir adayı: URUN)* | haritada değil | 2026-06-18 | yok | KAL-KAPISIZ |
| 3d-showroom-ux-research | 3D vitrin bilgi paneli/UX araştırma raporu | OPS *(devir adayı: URUN)* | haritada değil | 2026-06-18 | yok | KAL-KAPISIZ |
| 3d-webgl-standard | 3D/WebGL standardı | OPS *(devir adayı: URUN)* | haritada değil | 2026-06-19 | yok | KAL-KAPISIZ |
| SOURCES | Admin standardı kaynak manifestosu | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-06-12 | yok (yanlış-pozitif elendi) | KAL-KAPISIZ |
| admin-capabilities | Admin yetenek kapsamı, bayi/enterprise modülü | OPS *(devir adayı: ALTYAPI)* | haritada | yok | yok | KAL-KAPISIZ |
| admin-design-standard | Admin tasarım & etkileşim cetveli | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-19 | admin-export-hygiene.test.ts (9 INV) | KAL |
| admin-standard | Admin/Back-Office standardı | OPS *(devir adayı: ALTYAPI)* | haritada | 2026-08-15 | admin-erp-resource-registry.test.ts | KAL |
| aile-metni-sayisal-standard | Aile metninde sayısal değer cetveli | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-09-06 | aile-metni-sayisal-deger.test.ts | KAL |
| analytics-standard | "Ne ölçülür" analytics kontratı | OPS *(devir adayı: ALTYAPI)* | haritada | 2026-08-19 | analytics-event-taxonomy.test.ts (3 INV) | KAL |
| auth-account-standard | Auth & hesap standardı | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-26 | auth-reset-chain.test.ts (3 INV) | KAL |
| canonical-url-standard | Kanonik adres standardı (canonical/hreflang/sitemap) | OPS *(devir adayı: URUN)* | haritada değil | 2026-08-18 | canonical-lang-segment.test.ts (2 INV) | KAL |
| catalog-depth-standard | Katalog derinliği — sayfa ne zaman açılır | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-08-28 | catalog-integrity-gate.test.ts (3 INV) | KAL |
| catalog-ingestion-standard | Katalog içe-alım standardı v1.0 | OPS *(devir adayı: URUN-KATALOG)* | haritada | 2026-09-06 | catalog-integrity-gate.test.ts (2 INV) | KAL |
| category-taxonomy-standard | Kategori taksonomisi cetveli | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-08-10 | yok | KAL-KAPISIZ |
| checkout-payment-standard | Checkout & ödeme cetveli | ALTYAPI | haritada değil | 2026-09-05 | payment-render-surface.test.ts (4 INV) | KAL |
| ci-runner-install-standard | CI koşucu kurulum cetveli (INV-CI-INSTALL-1) | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-19 | ci-install-bounded.test.ts | KAL |
| collaboration-protocol | Çok-ajan işbirliği protokolü | OPS | haritada değil | 2026-08-27 | board-invariants.test.ts (8 INV) | KAL |
| commerce-domain-map-standard | Ticaret alan haritası standardı | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-19 | currency-not-from-language.test.ts (5 INV) | KAL |
| companion-doc-standard | Companion doküman standardı v0.1 | ALTYAPI | haritada değil | 2026-09-05 | companion-doc-parity.test.ts (6 INV) | KAL |
| crm-standard | CRM cetveli — nesne katmanı, SAHA PROJESİ (v0) | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-20 | yok | KAL-KAPISIZ |
| csp-standard | CSP standardı | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-19 | csp-origin-coverage.test.ts (2 INV) | KAL |
| csv-import-export-standard | Kanonik CSV içe/dışa-alım format standardı v1.1 | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-06-20 | admin-csv-import-mapping.test.ts | KAL |
| customer-account-standard | Müşteri hesap yüzeyi standardı v0.1 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-16 | auth-account-surface.test.ts | KAL |
| db-grant-hygiene-standard | VIEW yetki hijyeni cetveli | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-20 | db-view-grant-hygiene.test.ts (2 INV) | KAL |
| dealer-module-blueprint | Bayi modülü implementasyon blueprint (Katman 4) | OPS *(devir adayı: ALTYAPI)* | haritada | 2026-06-12 | yok | KAL-KAPISIZ |
| dealer-network-standard | B2B bayi-ağı domain standardı | OPS *(devir adayı: ALTYAPI)* | haritada | 2026-06-12 | yok | KAL-KAPISIZ |
| dependency-integrity-standard | Bağımlılık bütünlüğü cetveli v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-19 | peer-dependency-integrity.test.ts | KAL |
| deploy-build-skip-standard | Dağıtım atlama cetveli (Ignored Build Step) v1.1 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-09-03 | build-skip-positive-logic.test.ts | KAL |
| document-numbering-standard | Belge numaralandırma cetveli | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-09-06 | eposta-sablon-alanlari.test.ts | KAL |
| edge-function-security-standard | Edge function güvenlik cetveli v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-24 | config-fail-closed.test.ts (5 INV) | KAL |
| email-template-standard | E-posta şablonu cetveli v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-09-06 | eposta-sablon-alanlari.test.ts (2 INV) | KAL |
| erp-workspace-design-standard | ERP çalışma alanı tasarım cetveli | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-20 | admin-erp-resource-registry.test.ts | KAL |
| execution-method-standard | Yürütme yöntemi cetveli v1.0 (T144-VH) | ALTYAPI | haritada değil | 2026-08-21 | `.claude/hooks/board-brief.cjs` (isim geçiyor) | KAL |
| fleet-mechanism-standard | Filo mekanizması cetveli v1.0 | ALTYAPI | haritada değil | 2026-09-06 | bash-write-audit-tree.test.ts (10 INV) | KAL |
| form-submission-standard | Form gönderim cetveli (müşteri yüzü) | OPS *(devir adayı: URUN)* | haritada değil | 2026-08-23 | form-submission-standard.test.ts | KAL |
| i18n-localization-standard | i18n/localization standardı | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-23 | i18n-locale-case.test.ts | KAL |
| i18n-ters-yon-standard | i18n ters yön standardı (TR yüzeyde EN metin) | URUN | haritada değil | 2026-09-01 | i18n-ters-yon.test.ts (3 INV) | KAL |
| is-kayit-duzeni-standard | İş-kayıt düzeni standardı | OPS | haritada değil | 2026-08-26 | yok | KAL-KAPISIZ |
| katalog-sayim-standard | Katalog sayımı standardı | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-09-03 | yok | KAL-KAPISIZ |
| legal-compliance-standard | Hukuki uyum cetveli | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-20 | invoice-ledger-contract.test.ts (5 INV) | KAL |
| marka-token-eslemesi-standard | Marka kılavuzu → kod token eşlemesi standardı | OPS *(devir adayı: URUN)* | haritada değil | 2026-09-06 | marka-palet-tokenlari.test.ts (2 INV) | KAL |
| matris-gorunum-standard | Matris görünüm standardı — sütun seçimi | OPS *(devir adayı: URUN)* | haritada değil | 2026-09-03 | yok | KAL-KAPISIZ |
| measurement-discipline-standard | Ölçüm disiplini standardı | OPS | haritada değil | 2026-08-19 | yok | KAL-KAPISIZ |
| migration-safety-standard | Migration güvenlik standardı (DROP/RENAME/TYPE) | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-15 | edge-select-columns.test.ts (yorumda) | KAL |
| mockup-gelisim-hatti-standardi | Mockup geliştirme hattı standardı | OPS *(devir adayı: URUN)* | haritada değil | 2026-08-25 | yok | KAL-KAPISIZ |
| multi-session-coordination-standard | Çok-oturumlu koordinasyon standardı v1.0 | OPS | haritada | 2026-08-16 | board-invariants.test.ts | KAL |
| notification-standard | Bildirim cetveli v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-23 | notification-standard.test.ts (3 INV) | KAL |
| pano-orion-koprusu-standardi | Pano ↔ Orion köprüsü cetveli (RFC-1) | OPS | haritada değil | 2026-08-26 | yok | KAL-KAPISIZ |
| payment-ledger-standard | Ödeme defteri cetveli | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-24 | payment-ledger-vocabulary.test.ts | KAL |
| pricing-standard | Fiyatlandırma standardı v1.1 | OPS *(devir adayı: URUN-KATALOG)* | haritada | 2026-08-18 | admin-fx-lock-crud.test.ts (9 INV) | KAL |
| product-image-standard | Ürün görseli standardı v0.2 | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-08-21 | yok | KAL-KAPISIZ |
| product-schema-standard | Ürün veritabanı şeması standardı v1.0 | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-08-23 | product-identity-resolver.test.ts | KAL |
| proje-takip-defteri-standard | Proje takip defteri cetveli v1.0 | OPS | haritada değil | 2026-09-06 | board-invariants.test.ts | KAL |
| purchasing-standard | Satınalma standardı v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-18 | purchasing-machine-and-evidence.test.ts (3 INV) | KAL |
| quote-standard | Teklif modülü standardı v2 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-09-06 | quote-insert-policy-guard.test.ts (4 INV) | KAL |
| rendering-cache-standard | Render & önbellek standardı v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada | 2026-08-21 | instruction-surface-ppr.test.ts (2 INV) | KAL |
| runtime-version-alignment-standard | Çalışma zamanı sürüm hizalaması v1.0 | OPS *(devir adayı: ALTYAPI)* | haritada değil | 2026-08-19 | runtime-version-alignment.test.ts | KAL |
| session-loop-ritual | Oturum açılış ritüeli — loop komutları (SSOT) | OPS | haritada değil | 2026-08-18 | board-invariants.test.ts | KAL |
| settled-work-standard | Çözüldü (Settled) standardı v1.0 | OPS | haritada değil | 2026-08-22 | yok | KAL-KAPISIZ |
| spec-axis-standard | Spec ekseni cetveli (`products.technical_specs`) | OPS *(devir adayı: URUN-KATALOG)* | haritada değil | 2026-08-23 | spec-axis-gate.test.ts | KAL |
| storefront-design-standard | Storefront tasarım cetveli | OPS *(devir adayı: URUN)* | haritada değil | 2026-09-05 | storefront-style-ratchet.test.ts | KAL |
| storefront-reflow-standard | Vitrin reflow cetveli — WCAG 2.2 SC 1.4.10 v1.0 (T050-VH) | URUN | haritada değil | 2026-08-30 | kart-yukleme-onceligi.test.ts (4 INV) | KAL |
| subagent-delegation-standard | Alt-ajan devri cetveli | OPS | haritada | 2026-08-22 | yok | KAL-KAPISIZ |
| tasarim-yetenek-standard | Tasarım yetenek (skill) kullanım cetveli v0.1 (taslak) | OPS | haritada | 2026-09-06 | yok | KAL-KAPISIZ |
| uretilmis-artefakt-standard | Üretilmiş artefakt standardı | ALTYAPI | haritada değil | 2026-09-05 | uretilmis-artefakt-tazeligi.test.ts (5 INV) | KAL |
| vaat-butunlugu-standard | Vaat bütünlüğü standardı — vitrin neyi vaat edebilir | URUN | haritada değil | 2026-09-06 | uc-boyut-musteri-yuzeyi.test.ts (5 INV) | KAL |
| work-tracking-ssot-standard | İş-takibi & dokümantasyon SSOT standardı [ESKİ, tarihçe] | OPS | haritada değil | 2026-09-06 | kume-master-tazeligi.test.ts | KAL |
| arac-envanteri-standard | Araç Envanteri Standardı (v1.0 — 2026-09-07) | OPS | docs/README.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| satis-kipi-gecis-standard | Satış Kipi Geçiş Cetveli — v1.0 | OPS | cagiran-yok (betik taramasi; anma: docs/plans/rec168-migration-taslagi-2026-09-06.md) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| hafiza-kancalari-standard | Hafıza Kancaları Standardı (REC-177) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | yok | YENI |

---

## 4 · Özel satırlar

- **`scripts/generate/generate-sitemap.mjs`** — durum **KARANTİNA**. Bu PR ile `scripts/archive/`
  altına taşındı (halefi `src/app/sitemap.ts` üretimde çalışıyor). Tehlike notu: betik hem ölü
  hem de içeriğinde hatalı kod barındırıyor (curutme.md, pano 2026-09-07T07:00:51Z bağımsız
  teyit) — geri getirilmemeli, silme kararı Recep kapısına gidecek (AXIOM 3).
- **`.claude/worktrees/agent-a91c11837d4004440`** (dal: `worktree-agent-a91c11837d4004440`) —
  bayat alt-ajan worktree'si; vitest test dosyalarını ana ağaçla çiftliyor (test koşucusunu
  yavaşlatıyor/çift saydırabiliyor). Bu araç envanterinin kapsamında bir "araç" değil (hook/
  betik/skill/githook/ci/cetvel sınıflarının hiçbirine girmiyor) → **envanter dışı artık, silme
  adayı (OPS ölçüp siler)**. Silmeden önce canlılık kontrolü yapılmalı (hafıza:
  silmeden-once-canlilik-ve-taze-dal).
- **`tmp-lf-fix.yml`** — bkz. §3.5 son not: GitHub Actions tarafında `active` görünen ama repoda
  hiç var olmamış hayalet kayıt; 29'luk dosya sayımına dahil değildir, OPS'un GitHub ayarlarından
  temizlemesi gerekir.

---

## 5 · Sonnet'in kaçırdığı kanallar

(Bkz. Bölüm 2 — aynen curutme.md'den taşındı, REC-185 kapı betiğine girdi olarak tekrar
vurgulanmıştır.)

---

## 6 · Sayım

| Tür | Toplam | KAL | KAL-KAPISIZ | OLU-DOGRULANDI | KARANTINA | OLCULEMEDI | ENVANTER-DISI |
|---|---|---|---|---|---|---|---|
| hook (`.claude/hooks/*.cjs`) | 14 | 14 | — | 0 | 0 | 0 | — |
| betik (`scripts/**`) | 119 | 66 | — | 52 | 1 | 1 (+2 uyarılı OLU-DOGRULANDI) | — |
| skill (satır) | 64 | 40 | — | — | — | — | 24 |
| githook (`.githooks/*`) | 5 | 5 | — | 0 | 0 | 0 | — |
| ci (`.github/workflows/*.yml`) | 29 | 20 | — | 9 | 0 | 0 (+1 GitHub-hayalet ayrı) | — |
| cetvel (`docs/standards/*.md`) | 67 | 48 | 19 | — | — | — | — |
| **TOPLAM (satır)** | **298** | **193** | **19** | **61** | **1** | **1** | **24** |

**Ek toplamlar:** companion `.md` (hook, envanter dışı) 13 · skill tekil ad 39 (satır 64) ·
GitHub-hayalet CI 1 (`tmp-lf-fix.yml`, 29'a dahil değil) · özel-durum envanter-dışı nesne 1
(`.claude/worktrees/agent-a91c11837d4004440`).
