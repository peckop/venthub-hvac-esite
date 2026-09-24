# Araç Envanteri — 2026-09-07

> Kayıt: REC-180 · Şerit: OPS · Ölçüm: 2026-09-07, ağaç origin/master a248e0689 · Yöntem: 5 sonnet
> tarama + 1 opus çürütme (curutme.md) · Bu belge cetvelin (`docs/standards/arac-envanteri-standard.md`)
> **ilk envanteridir**; sonraki üretim `scripts/hijyen/arac-envanteri.cjs` (REC-185) — o betik
> koşana kadar bu belge elle derlenmiştir ve AXIOM 1 gereği bu haliyle "var" sayılır.

## 0 · ⚠AXIOM 3'ÜN SINIRI — üretilen satırın `durum` sütunu insan metni TUTMAZ

**Ölçüldü 2026-09-14 (REC-333 / #1188, ve #1185'te sessizce kaybedilmişti):** AXIOM 3
"üretilen dosya elle düzenlenmez, yalnız insan hükmü kolonları elle yazılır" der. Bu izin
**YENİ eklenen satırlar** içindir. Üreticinin **KAYIP** işaretlediği bir satırın `durum`
sütunu **üreticinin malıdır**, insanın değil: konformansın `YAZMA KIPI IDEMPOTENT` kolu
kendi içinde `--yaz` koşar ve o sütunu kanonik hâline **geri yazar.**

#1185'te o sütuna elle yazdığım hüküm **commit'ten önce silinmişti** ve ben Recep'e
"yazdım" demiştim; master'da olmadığını sonradan ölçtüm. Ders: **hüküm ÜRETİLMEYEN yere
yazılır** — anlatı satırına, denetim belgesine, PR gövdesine. Üretilen tabloya yazılan
hüküm sessizce kaybolur ve kaybı hiçbir kapı söylemez.

## 0.1 · ⚠BELGENİN GÖVDESİ DE ÖLÇÜLÜR — üç kol içeriyi ölçüyordu, kimse belgeye bakmıyordu

**Ölçüldü 2026-09-14:** #1185 bu belgenin **birinci satırına** yedi tablo parçası yazdı ve
`# Araç Envanteri` başlığını o satırın sonuna itti; satır **1968 bayta** çıktı. `INV-ARAC-1..3`
üç kolu da **17/17 yeşil** kaldı, çünkü hepsi `### 3.x` bölümlerinin **içini** ölçüyordu.

Üretici bunu yapamaz (satırı daima başlık genişliğine tamamlar, hücre sayısı yetmezse satıra
dokunmaz, yazma indeksleri ayrıştırılmış tablo aralığından gelir) — yani bu bir **elle
düzenleme kazası**ydı. Yeni kol `BELGE YAPISI SAGLAM` iki şey arar: ilk satır başlık mı, ve
her `|` öbeğinin ikinci satırı ayraç mı. Gerçek arızada kırmızı, onarımdan sonra yeşil
olduğu **ölçülerek** doğrulandı.

→ Aynı cümle `docs/standards/arac-envanteri-standard.md` AXIOM 3 bölümüne **yazıldı**
(2026-09-14, OPS onaylı: dosya panoda kimsede değildi, bu PR süresince ALTYAPI claim'ine alındı).

## 0.2 · §3.3'teki 13 kalemin KAL hükmü NEYE dayanıyor

13 yetenek kaleminin 26 satırında (her kalem `.claude` + `.agent` ağacında) `kanıt` hücresine
**tetiklenebilirlik sınavı** damgası elle yazıldı. Tam tablo, sınavın beş sınırı, düzeltilen
maliyet tabanı ve kaybolan üç alt-ajan raporunun kaydı:
**`docs/audits/rec314-tetiklenebilirlik-sinavi-2026-09-14.md`**.

Kısaca: 13 kalemin 13'ü de tetiklendi (parti 1 6/6, parti 2 20/20, `without` kolu her yerde 0).
Üçü "hiç çağrılmamış" listesindeydi ve **sökme sırasının başındaydı** — atıl liste bir sökme
listesi olarak kullanılsaydı çalışan üç araç silinecekti. ⚠Altı vakada koşum
`max turns (4)` ile bittiği için **"tetikleniyor" kanıtlı, "işi bitiriyor" ölçülmedi.**

⚠Bu satırların insan kolonlarının gerçekten insanın olduğu **ölçüldü**: elle yazımdan sonra
`--yaz` koşuldu ve fark **0 bayt** çıktı, `INV-ARAC-1..3` 19/19 yeşil. Yani bölüm 0'daki sınır
yalnız KAYIP satırının durum sütunu içindir; mevcut satırın kanıt/kapı/durum hücreleri değil.

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
- **CI'da `disabled_manually` olanlar (8 — 2026-09-14'te SEKİZİ DE SİLİNDİ: yedisi REC-327 / #1185, `ai-auto-repair.yml` ise REC-333 / #1188 ile):** `jules-a11y.yml`, `jules-dependency-update.yml`,
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
| `.claude/hooks/board-release.cjs` | hook | SessionEnd: şeridi bırak (kira serbest bırakma) | ALTYAPI | `hook:SessionEnd *` | bağlı | kanca-board-release.test.ts | KAL |
| `.claude/hooks/lane-guard.cjs` | hook | PreToolUse: şerit koruması (çok-oturumlu çakışma engeli) | ALTYAPI | `hook:PreToolUse Edit\|Write\|MultiEdit` | bağlı | kanca-lane-guard.test.ts | KAL |
| `.claude/hooks/precompact-durum-kapisi.cjs` | hook | PreCompact: durum kapısı (REC-86 Faz 1) | ALTYAPI | `hook:PreCompact *`; ayrıca `require()` ← session-board.cjs:176 | bağlı | precompact-durum-kapisi.test.ts | KAL |
| `.claude/hooks/protect-config.cjs` | hook | PreToolUse: kalite ağı (config-protection + içerik taraması) | ALTYAPI | `hook:PreToolUse Edit\|Write\|MultiEdit` | bağlı | kanca-protect-config.test.ts | KAL |
| `.claude/hooks/sensitive-path-guard.cjs` | hook | PreToolUse: iki hassas yol sınıfını korur | ALTYAPI | `hook:PreToolUse Edit\|Write\|MultiEdit` | bağlı | kanca-sensitive-path-guard.test.ts | KAL |
| `.claude/hooks/session-board.cjs` | hook | SessionStart: oturum kimliği + pano durumu bağlamı enjekte eder | ALTYAPI | `hook:SessionStart *` | `.git/venthub-sid`, 2026-09-07 | bash-write-audit-tree, companion-defter, fleet-mechanism-integrity, precompact-durum-kapisi.test.ts | KAL |
| `.claude/hooks/sir-basan-kalip.cjs` | hook (kütüphane) | Bir Bash komutunun SIR değerini basıp basmadığını ölçen saf fonksiyon | ALTYAPI | `require()` ← bash-write-guard.cjs:67 | dolaylı | sir-basan-kalip.test.ts | KAL |
| `.claude/hooks/son-soz-gate.cjs` | hook | Stop kapısı: turda kullanıcı mesajı varsa SON SÖZ kullanıcıya mı yazılmış | ALTYAPI | `hook:Stop *` | bağlı | kanca-son-soz-gate.test.ts | KAL |
| `.claude/hooks/verify-on-stop.cjs` | hook | Stop (async): JS/TS düzenlendiyse eslint --fix + tsc doğrulaması | ALTYAPI | `hook:Stop *` (async, timeout 120) | `.cwd-ayrisma-sayaci.json`, 2026-09-07 | board-invariants.test.ts | KAL |
| `.claude/hooks/defter-bayatlik-olcumu.cjs` | hook | Stop hook — PROJE TAKİP DEFTERİ BAYATLIK ÖLÇÜMÜ (yalnız ÖLÇER ve UYARIR). | OPS | .claude/settings.json, docs/standards/hafiza-kancalari-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/defter-bayatlik-olcumu.test.ts | YENI |
| `.claude/hooks/defter-tazelik-satiri.cjs` | hook | UserPromptSubmit — defter tazelik satırı: son eşitleme yaşı + değişen demet (önbellekten) + Kararlar kopyası yaşı; eşik aşılınca ⚠, ölçemezse sebep yazar | ALTYAPI | `hook:UserPromptSubmit *` (timeout 10) | 2026-09-15, elle koşturuldu: `⚠DEFTER: son esitleme 2026-09-08 (7 gun) · olc 14 degisen/22 · Kararlar kopyasi 3 gun`; süre 266-298 ms (çıplak node açılışı ~187 ms) | src/\_\_tests\_\_/conformance/kanca-defter-tazelik.test.ts (11 kol, iki yön + ölçemedi + bayat önbellek) | KAL |
| `.claude/hooks/eylem-defteri.cjs` | hook | PostToolUse hook — EYLEM DEFTERİ (git'in GÖRMEDİĞİ taşıma/silmeleri kaydeder). | OPS | .claude/settings.json, docs/standards/hafiza-kancalari-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/eylem-defteri.test.ts | YENI |
| `.claude/hooks/hafiza-sorusu-yonlendirme.cjs` | hook | UserPromptSubmit hook — HAFIZA SORUSU YÖNLENDİRME. | OPS | .claude/settings.json, docs/standards/hafiza-kancalari-standard.md (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/hafiza-sorusu-yonlendirme.test.ts | YENI |
| `.claude/hooks/soguk-okuyucu-sinavi.cjs` | hook | PostToolUse hook — SOĞUK OKUYUCU SINAVI ÇAĞRISI (yalnız HATIRLATIR, sınavı ajan koşar). | OPS | docs/standards/hafiza-kancalari-standard.md, src/__tests__/conformance/soguk-okuyucu-sinavi.test.ts (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/soguk-okuyucu-sinavi.test.ts | YENI |
| `.claude/hooks/hafiza-indeks-bekcisi.cjs` | hook | HAFIZA İNDEKSİ BEKÇİSİ (REC-280), iki kol: (A) `MEMORY.md` **yumuşak eşik 15800** — satır eklemeden önce katla; (B) ⭐**kayıp yazım dedektörü** — kaybolan satır `dizin-*.md`'ye katlanmamışsa uyarır. ⛔BLOKLAMAZ, daima çıkış 0; ağ/LLM/DB yok. Mutlak yol YAZMAZ (§24), dizin `os.homedir()`+transcript'ten türer. | ALTYAPI | `.claude/settings.json` PreToolUse `Edit\|Write\|MultiEdit` — yazımdan ÖNCE | fikstürle 7 koşum 2026-09-08: katlanmış satır **SESSİZ** · silinmiş satır **UYARI** (satır gösterildi) · yalnız boşluk farkı SESSİZ · 15917 baytta uyarı, eşik altında sessiz · MEMORY.md dışı hedef sessiz · proje dizini çözülemeyince "ATLANDI" satırı + çıkış 0 | `hafiza-indeks-bekcisi-kilidi` konformans kolları (7) | KAL |
| `.claude/hooks/sage-yedek-oturum-sonu.cjs` | hook | SessionEnd — pencere kapanırken sage yedeğini alır; son yedek 24 saatten yeniyse ATLAR, sonucu (alındı/atlandı/hata) yedek dizinindeki `son-kosum.log`a yazar, çıkış DAİMA 0. Kök ana ağaçtan çözülür. | ALTYAPI | scripts/hijyen/sage-yedek.cjs, scripts/hijyen/ana-kok.cjs | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/sage-yedek.test.ts (⭐OTURUM SONU KANCASI kolu) | KULLANIMDA (ayara kayit Recep onayi 2026-09-18, karar 51) |
| `.claude/hooks/sage-dosya-dersi.cjs` | hook | PreToolUse (`Read\|Edit\|Write\|MultiEdit`) — dokunulan dosyaya ÇAPALI sage derslerini bağlama koyar; dosya başına bir kez, compact'ta sıfırlanır, sessiz + fail-open. | ALTYAPI | .claude/hooks/session-board.cjs, .claude/settings.json, scripts/hijyen/sage-dosya-dersi.cjs (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/sage-dosya-dersi.test.ts (6 kol, gercek SQLite depo) | KULLANIMDA (ayara kayıt Recep kapısı — merge onayına bağlı) |
| `.claude/hooks/silme-baglanti-kapisi.cjs` | hook | silme-baglanti-kapisi — PreToolUse (Bash) bekçisi (karar 88, 2026-09-23). Özyinelemeli silme (`git worktree remove`, `rm -r`, `rmdir /s`, `Remove-Item -Recurse`) hedefinde klasörün DIŞINI gösteren junction/symlink varsa DENY + güvenli yol; iç bağlantılar (pnpm) serbest; 60 000 girdi tavanı aşılırsa DENY. 09-23 olayı: worktree junction'ından geçilip ana deponun node_modules'u silindi | ALTYAPI | .claude/settings.json PreToolUse Bash | 2026-09-23 gerçek ağaçta: ops-rec179 (→ ana depo node_modules) DENY, vh-a154 izin | INV-SILME-BAGLANTI-1 (`silme-baglanti-kapisi.test.ts`, gerçek junction'la 4 biçim + 3 izin kolu) | KAL |

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
| `scripts/board/gozcu.cjs` | Filo gözcüsü (pano izleyicisi) | ALTYAPI | ⛔KURULMAZ — filo `SendMessage` ile çalışır (REC-328) | 2026-09-14 (son koşum; kapatıldığı gün) | yok | **EMEKLİ** — Recep 2026-09-14 (REC-328); dosya duruyor, oturumlarda kurulmaz |
| `scripts/board/izin-reddi-gunlugu.cjs` | İzin-reddi olay günlüğü (filo-görünür ret sayacı) | ALTYAPI | `docs/standards/fleet-mechanism-standard.md` | 2026-08-31 | yok | KAL |
| `scripts/board/kimlik.cjs` | "Bu commit'i hangi oturum yapıyor" TEK cevap | ALTYAPI | `.claude/hooks/{bash-write-audit,session-board}.cjs` | 2026-08-31 | yok | KAL |
| `scripts/board/lane-precommit.cjs` | Pre-commit 2. katman şerit kapısı (E1) | ALTYAPI | `.githooks/pre-commit`, `.claude/hooks/bash-write-audit.cjs` | 2026-08-31 | yok | KAL |
| `scripts/board/mechanism-setup.cjs` | Mekanik otonomi kurulumu/doğrulaması (T115-VH) | ALTYAPI | ⛔ÇAĞIRAN YOK — kanca atıfları REC-328 ile kaldırıldı | 2026-09-14 (son koşum; emeklilik günü) | `INV-MECH-1` (artık TERSİNİ zorlar: kanca bu betiğe yollamaz) | **EMEKLİ** — Recep 2026-09-14 (REC-328) |
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
| `scripts/db/product-data/identity-fix.mjs` | T148-VH kimlik düzeltmesi (sku/model_code/name/slug) | URUN-KATALOG | `elle` | `docs/plans/urun-kimlik-duzeltme-2026-08-22.md:96`; 2026-09-22 NIC-11921 (DD) canlı yazım + VRT-253490106XN (karar 75) kuru koşum | `__tests__/identity-fix-kurallar.test.ts` (Ö4) | KAL |
| `scripts/db/product-data/identity-fix-kurallar.mjs` | identity-fix Ö4 manifest kuralları (ağsız, testli modül) | URUN-KATALOG | `identity-fix.mjs` | 2026-09-22 | `__tests__/identity-fix-kurallar.test.ts` | AKTIF |
| `scripts/db/product-data/__tests__/identity-fix-kurallar.test.ts` | identity-fix Ö4: harfli model_code + küçük harf slug, önek, katalog kodu, depodaki manifestler | URUN-KATALOG | vitest (her PR) | 2026-09-22 (4/4) | kendisi | AKTIF |
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
| `scripts/icerik-hatti/uretici-fark-tablosu.mjs` | Üretici ↔ bizim veri fark tablosu (karar 71c, REC-370) — salt okuma, alıntı dizinde doğrulanır | URUN-KATALOG | `elle` (girdi `urun-veri-cek.mjs`) | 2026-09-22 ilk koşum: 69 ürün / 138 satır, `icerik-hatti-uretici-fark-tablosu-2026-09-22.csv` | `__tests__/uretici-fark-tablosu.test.ts` | KAL |
| `scripts/icerik-hatti/taslak-kaynak-kapisi.py` | İçerik taslağı kaynak doğrulama kapısı | URUN-KATALOG | `scripts/icerik-hatti/toplu-sunum.py` | 2026-09-06 | kendisi kapı | KAL |
| `scripts/icerik-hatti/tier-c-temizlik.mjs` | REC-155 B: iç-not içeren açıklamaları temizler | URUN-KATALOG | `elle` | `docs/proje-takip/yol-haritasi.json:570` (YH-32 beklenen dosya) → `yol_haritasi_dogrula.py` kapısı | yol_haritasi_dogrula.py (dolaylı) | KAL |
| `scripts/icerik-hatti/toplu-sunum.py` | Toplu sunum üretici (REC-146 Adım 2b, K7.8) | URUN-KATALOG | `scripts/icerik-hatti/aile-metni-yaz.mjs` | 2026-09-06 | yok | KAL |
| `scripts/kademe2-load/load.mjs` | Kademe-2 CSV→DB loader (deterministik, LLM yok) | URUN-KATALOG *(devir adayı, orijinal SAHİPSİZ)* | `docs/standards/fleet-mechanism-standard.md` | 2026-09-01 | `__tests__/planla.test.ts` | KAL |
| `scripts/kademe2-load/planla.mjs` | Kademe-2 yükleyicisinin SAF planlama katmanı (REC-209: en büyük yazıcının sınavı). | URUN-KATALOG | `scripts/kademe2-load/load.mjs` (import) | 2026-09-24 (kuru koşum raporu refaktör öncesiyle birebir) | `__tests__/planla.test.ts` | AKTIF |
| `scripts/kademe2-load/__tests__/planla.test.ts` | REC-209 · Kademe-2 yükleyicisinin sınavı — en çok satır yazan araç, ilk kez sınanıyor. | URUN-KATALOG | vitest (`pnpm test`) | 2026-09-24 (14/14; sabotaj 3/3 KIRMIZI: mevcut ürün güncellemesi, APPLY hata kapısı silme, SKU çakışma kontrolü silme) | kendisi test | AKTIF |
| `scripts/icerik-hatti/gorsel-sozlesme.mjs` | GÖRSEL SÖZLEŞMESİ — product_images'ın product-image-standard §1-§2'ye uyumu (REC-209, §7 veri kapısı); saf | URUN-KATALOG | `scripts/icerik-hatti/katalog-karnesi.mjs` (import; `--kapi`) | 2026-09-24 (1146 satır · ihlal 0 · foto.webp 97/97 · görselsiz aktif 12) | `__tests__/gorsel-sozlesme.test.ts` | AKTIF |
| `scripts/icerik-hatti/__tests__/gorsel-sozlesme.test.ts` | REC-209 · product-image-standard §7 — görsel kapıları (veri kapısı + INV-IMG-1 statik) | URUN-KATALOG | vitest (`pnpm test`) | 2026-09-24 (6/6; sabotaj kolları: varyant, büyütme, paralel fetch, önekli path, foto.webp mandalı) | kendisi test | AKTIF |
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
| `scripts/setup-hooks.mjs` | `.githooks/`i git'e bağlar (`pnpm install` sonrası `prepare`) | ALTYAPI *(2026-09-22 OPS devretti, .githooks sahipliğiyle birlikte)* | `.githooks/README.md`, `docs/standards/deploy-build-skip-standard.md` | 2026-08-15 | yok | KAL |
| `scripts/setup_webhooks.js` | Webhook kurulum yardımcısı (.env parse) | OPS *(devir adayı: ALTYAPI)* | `docs/standards/rendering-cache-standard.md`, `scripts/setup_webhooks_cli.js` | 2026-08-15 | yok | KAL |
| `scripts/setup_webhooks_cli.js` | Webhook kurulum CLI'ı (.env parse) | OPS *(devir adayı: ALTYAPI)* | `docs/standards/rendering-cache-standard.md`, `scripts/setup_webhooks.js` | 2026-08-15 | yok | KAL |
| `scripts/skills-creator.py` | Yeni skill oluşturma (name/description/category) | OPS | `elle` | `.claude/skills/skills-creator/SKILL.md:25,67`, `.agent/skills/…`, `manifest.yaml:162` `validate:` | skill validate adımı canlı | KAL |
| `scripts/skills-evaluator.py` | Skill eval koşucusu | OPS | `scripts/skills-creator.py`, `package.json → skills:verify` | 2026-06-10 | yok | KAL |
| `scripts/skills-orchestrator.py` | Skill orkestrasyonu (docstring yok) | OPS | `cagiran-yok` (0 gerçek çağıran; yalnız ölü companion çağrı grafiğinde `skills-router.py`'nin "çağıranı") | 0 eşleşme | yok | **OLU-DOGRULANDI (zincir uyarısı)** *(kendisini çağıran skills-router.py de aynı turda yeniden ölçülmeli)* |
| `scripts/skills-router.py` | Skill yönlendirme | OPS | `scripts/skills-orchestrator.py` (çağıranı ÖLÜ DOĞRULANDI — bkz. yukarı) | 2026-06-08 | yok | KAL *(uyarı: tek çağıranı ölü doğrulandı, ikinci turda yeniden ölç)* |
| `scripts/tools/deploy_iyzico.ps1` | İyzico deploy betiği | OPS *(devir adayı: ALTYAPI)* | `cagiran-yok` | 0 eşleşme | yok | OLU-DOGRULANDI |
| `scripts/tools/extract_brands.py` | Marka tahmini RAPORU — adla markayı karşılaştırır, YAZMAZ (yazma yolu 2026-09-23 kaldırıldı: koşsaydı 173 ürünü "AVenS" yapacaktı) | URUN-KATALOG | `cagiran-yok` · elle | 2026-09-23 (mantık SQL'de taklit edildi, yazma yok) | `scripts/icerik-hatti/__tests__/fiyat-bosluk.test.ts` (yazmaz kapısı + sabotaj) | OLU-DOGRULANDI (silme Recep kapısı) |
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
| `scripts/icerik-hatti/katalog-karnesi.mjs` | KATALOG KARNESİ — hattın dokuz satırı, TEK komutla (KOL 6 ilk çıktısı) | URUN-KATALOG | elle (`--json`, `--fiyat-bosluk=<csv>`); salt okur | 2026-09-23 (442 ürün · fiyatsız 94: LİSTEDE VAR 68 · HİÇBİR YERDE YOK 26) | `__tests__/fiyat-bosluk.test.ts` (yazmaz kapısı) | AKTIF |
| `scripts/icerik-hatti/uydurma-kod-bosalt.mjs` | UYDURMA `model_code` BOŞALTICISI — REC-226 (kaynak kanıtına dayalı) | URUN-KATALOG | elle (kuru koşum varsayılan; `--yaz` + `CANLI_YAZIM_ONAYI`) | PR #1109 (üç yönlü sabotaj koşuldu) | kendi ön koşul kapısı içinde (üç yüzeyde `sku` yedeği varsa yazmaz) | KAYIP (onceki: KAL) |
| `scripts/icerik-hatti/kimlik-kurali.mjs` | ÜRÜN KİMLİK KURALI — TEK KAYNAK (REC-226 / REC-272 / REC-275) | URUN-KATALOG | import edilir (kural tek kaynak; kademe2-load + icerik-hatti kullanir) | PR #1109 · 442 urunde cakisma 0 olculdu | cagiranin on kosul kapisi | KAL |
| `scripts/icerik-hatti/uydurma-kimlik-tek-kural.mjs` | UYDURMA KİMLİĞİ TEK KURALA GETİRİR — REC-226 / REC-272 / REC-275 | URUN-KATALOG | elle (kuru kosum varsayilan; --yaz + CANLI_YAZIM_ONAYI) | PR #1109 · uc yonlu sabotaj | iki on kosul kapisi (sku yedegi + benzersizlik) | KAL |
| `scripts/icerik-hatti/kimlik-kurali-kapisi.mjs` | KİMLİK KURALI KAPISI — INV-KIMLIK-TEK-KURAL-1 (REC-275) | URUN-KATALOG | elle / CI (ALTYAPI'dan baglanmasi istenecek) | PR #1109 · iki yonlu sabotaj: ardisik-sayi uydurma ve kodsuz-satir dusurme KIRMIZI verdirdi | INV-KIMLIK-TEK-KURAL-1 (kendisi kapi) | KAL |
| `scripts/nlm/linear_arsiv.py` | Linear GraphQL: kim / say / arsivle <no...> / arsivle done / arsivle canceled — Done kayitlar 7 gun sonra arsiv (250 sinir); LINEAR_API_KEY ortamdan | OPS | insan (OPS rutin, haftalik) | 2026-09-08 · PR #1118 | yok (cetvel: work-tracking-ssot-standard, arsiv rutini) | KAL-KAPISIZ |
| `scripts/media/gorsel-envanteri.mjs` | GÖRSEL ENVANTERİ — mükerrer görseller + "yeni fotoğraf gerekli" listesi (REC-282 / REC-284) | URUN-KATALOG | elle (SALT OKUMA; `--yaz` kolu BİLEREK YOK — envanterden çıkacak düzeltme Recep kapısı) | 2026-09-08 koşuldu: 442 ürün · 1042 görsel · 898 hash · 3 kategori-aşan grup · 103 görselsiz ürün; rapor `docs/audits/icerik-hatti-gorsel-envanteri-2026-09-08.{md,json}` | `__tests__/gorsel-mukerrer.test.ts` (REC-282 kapısı `--kapi`, 2026-09-24) | AKTIF |
| `scripts/media/gorsel-mukerrer.mjs` | MÜKERRER GÖRSEL — saf çekirdek + kapı (REC-282): kategori aşan byte-eşit paylaşım KIRMIZI, bilinen istisna donmuş | URUN-KATALOG | `scripts/media/gorsel-envanteri.mjs` (import; `--kapi`) | 2026-09-24 (132 grup · 3 kategori aşımı = bilinen istisna · kapı YEŞİL) | `__tests__/gorsel-mukerrer.test.ts` | AKTIF |
| `scripts/media/__tests__/gorsel-mukerrer.test.ts` | REC-282 · mükerrer görsel kapısı sınavı | URUN-KATALOG | vitest (`pnpm test`) | 2026-09-24 (5/5; sabotaj: istisnadan çıkarılan grup KIRMIZI, yayılma KIRMIZI) | kendisi test | AKTIF |
| `scripts/db/checks/tip-drift.mjs` | INV-TIP-DRIFT-1 — `src/types/database.types.ts` CANLI ŞEMAYLA SENKRON MU (REC-121). Ölçüt ŞEMA YÜZEYİ (tablo/görünüm/kolon/fonksiyon/enum/bileşik); biçim ve CLI sürüm farkı sessiz. | ALTYAPI | **CI — `db-advisor.yml`, AYRI iş** (`tip-drift` + `tip-drift-precheck`). ⭐Kardeşlerden farklı: sır `SUPABASE_ACCESS_TOKEN`, `pg` sürücüsü ve kök sertifika YOK — betik DB'ye bağlanmaz, Supabase API'sinden tip üretir. | kapı koşumu 2026-09-08: 62 tablo/786 kolon iki tarafta = çıkış 0 YEŞİL · aynı gün `--tip-dosyasi` fikstürüyle bayat tipe karşı **çıkış 1**, iki yön de adıyla basıldı (3 eksik + 3 fazla) — iki yönlü | INV-TIP-DRIFT-1 (kendisi kapı) · düzeneği `tip-drift-kapisi` konformans kolları (6 kol: CI çağırıyor · doğru sır · yanlış sır/pg kopyalanmamış · atlanmış iş uyarır · artefakta yazmaz · fail-closed) | KAL |
| `scripts/db/checks/aile-kategori-tutarlilik.mjs` | INV-AILE-KATEGORI-1 — ürünün kategorisi ile AİLESİNİN kategorisi AYRIŞMASIN (REC-290). Vitrin ürün değil AİLE listeler; ayrışma = veri doğru, vitrin sessizce yanlış. SALT OKUR. | ALTYAPI | CI — `db-advisor.yml` `catalog-integrity` işine adım olarak bağlı (kardeşiyle aynı sır + kök sertifika); `--fikstur` ile ağsız da koşar | canlı koşum 2026-09-08: ürün 442 · ailesi olan 442 · aktif aile 47 · evren 442 · **ihlal 0** (KATALOG'un 11'lik onarımı sonrası). İki yönlü: ters sorgu 442 örtüşen sayıyor → ölçüt kör değil. Fikstür üç kol: temiz→0, ihlal→1, evren 0→**2** | INV-AILE-KATEGORI-1 (kendisi kapı) · düzeneği `ssr`-benzeri konformans kolu ile kilitli | KAL |
| `scripts/hijyen/commit-oncesi-uyarilar.cjs` | COMMIT ÖNCESİ İKİ UYARI (REC-267): (1) yeni betik araç envanterinde ilan edilmemiş → betik adı + koşulacak komut yazılır, (2) şerit önekli dal ANA REPO ağacında. ⛔BLOKLAMAZ, daima çıkış 0; ağ/LLM/DB yok. | ALTYAPI | `.githooks/pre-commit` — şerit kapısından ÖNCE (bloklayan çıktının ardındaki uyarı okunmaz), `|| true` ile | 2026-09-08: kol 1 kendi betiğimde yandı (adı + komut basıldı) · kol 2 ana repo ağacında GERÇEK hâli yakaladı (`urun/rec286-kapi-siniri` ana repoda duruyordu) · maliyet 5 koşum **264-300 ms** | uyarı-only, kapı DEĞİL — düzeneği `commit-oncesi-uyarilar-kilidi` konformans kolları ölçer | KAL |
| `scripts/db/checks/denetim-izi-tetik-kapisi.mjs` | INV-DENETIM-IZI-1 — denetim tetiği CANLI DB'de duruyor mu, HÂLÂ fail-closed mı, ve `products` kolon süzgeci yerinde mi (REC-292). ⭐Metin taraması yetmez: bu depoda migration dosyası "prod'da hangi tetik var" sorusunda YETKİLİ KAYNAK DEĞİL (`on_products_change` migration'larda yok, `scripts/webhook_setup.sql` ile kurulmuş). SALT OKUR. | ALTYAPI | CI — `db-advisor.yml` `rls-role-coverage` işine adım olarak bağlı (kardeşleriyle aynı sır + kök sertifika; yeni iş adı açmak açık PR'ları kilitler, gerekçesi o işte yazılı); `--fixture` ile ağsız da koşar | fikstür 6 kol, hepsi beklendiği gibi: tam→0 ihlal · `site_settings` tetiği silinmiş→**TETIK-YOK** · gövdeye `exception when` girmiş→**FAIL-OPEN** · süzgeç kalkmış→**SUZGEC-YOK** · süzgeçten `price` çıkmış→**SUZGEC-DAR** · webhook tetikleri sayıma girmiyor (7). ⛔Canlı koşum HENÜZ YOK: ölçeceği tetikler migration Recep kapısından geçmeden var olmayacak — kapı ile migration AYNI PR'da iner | INV-DENETIM-IZI-1 (kendisi kapı) · düzeneği `denetim-izi-kapisi.test.ts` 21 kolu ile kilitli | YENI |
| `scripts/db/checks/lib/denetim-izi-hukum.mjs` | REC-292 denetim izi kapısının **SAF HÜKÜM KATMANI** (`degerlendir` + `KAPSAM` + zorunlu kolonlar). ⛔İçinde shebang · yan etki · ağ · dosya sistemi · `process.exit` YOK; yalnız veri alır, hüküm döndürür. Niçin ayrı dosya: CLI betiği shebang taşıyor ve `vite-node` shebang'ı sökerken satır sonunu LF varsayıyor — CRLF'li ağaçlarda kalan `\r` `SyntaxError` veriyor ve kapının **ayırt edici altı kolu** sessizce düşüyordu (KATALOG üç ağaçta ölçtü, 2026-09-09). Ayrım hem o sınıfı hem de "import edince kapı kendini koşuyor" kusurunu kaldırır. | **ALTYAPI** | CLI betiği (`denetim-izi-tetik-kapisi.mjs`) **statik import** ile buradan besleniyor; konformans testi de aynı modülü kullanır — CLI ve test AYNI kaynak | `kapi-import-guvenligi.test.ts` + `denetim-izi-kapisi.test.ts` birlikte **31/31 geçti** (2026-09-09 ~10:1xZ, LF'li ağaç). ⚠CRLF'li ağaçta doğrulama URUN/KATALOG'da — kusur benim ağacımda GÖRÜNMÜYOR | INV-KAPI-IMPORT-1 (shebang yok · `\r` yok · `main()` koşulsuz çağrılmaz) · INV-DENETIM-IZI-1 | **AKTIF** |
| `scripts/icerik-hatti/katalog-paket-uret.mjs` | TAŞINABİLİR KATALOG — İNSAN-OKUR PAKET ÜRETİCİ (REC-212 F1, adım 1-2) | URUN-KATALOG | elle (`--hedef=<paket>`), `katalog-disa-aktar.mjs`'ten SONRA | 2026-09-09: koştu, 7 CSV/8088 satır + 1146 görsel üretti, başarısız 0 | yok | AKTİF |
| `scripts/icerik-hatti/paket-belgeler-uret.mjs` | PAKET BELGE TABLOSU — belgeler.csv (REC-212 F1 eki, OPS emri 2026-09-09 12:02Z) | URUN-KATALOG | elle kosulur (paket uretimi sonrasi) | 2026-09-09 (60 belge / 65 satir) | yok | AKTIF |
| `scripts/icerik-hatti/kaynak-eslemesi.mjs` | ADIM 3 — KAYNAK EŞLEMESİ: her teknik değer ↔ kaynak dizini (REC-212 F1, OPS emri 12:13Z) | URUN-KATALOG | elle kosulur (paket uretimi sonrasi, adim 3) | 2026-09-09 (5168 deger, VAR 2205, tesadduf tabani 355) | yok | AKTIF |
| `scripts/icerik-hatti/paket-karnesi.mjs` | KATALOG KARNESİ — EVREN = PAKET (OPS hükmü 2026-09-09 12:32Z, Recep kararı K13) | URUN-KATALOG | elle kosulur (karne istendiginde) | 2026-09-09 (8 eksen, genel %57) | yok | AKTIF |
| `scripts/icerik-hatti/defter-sorgu.mjs` | DEFTER SORGUSU — aile × alan soruları, ham cevaplar jsonl'e (OPS emri 2026-09-10 06:37Z) | URUN-KATALOG | elle kosulur (aile aile, seri — CLI kotali) | 2026-09-10 (3 aile pilot) | yok | AKTIF |
| `scripts/icerik-hatti/defter-tablo-uret.mjs` | DEFTER TABLO ÜRETİMİ — aile başına kaynak-kısıtlı data-table (OPS kararı 2026-09-10 07:05Z) | URUN-KATALOG | elle kosulur (aile aile, kota gozetilir) | 2026-09-10 (yayim baslamadi; 'ready' kaynak kapisi eklendi) | yok | AKTIF |
| `scripts/skills-eval-run.mjs` | SKILL YÖNLENDİRME SINAVINI KOŞAR (REC-303). | ALTYAPI | .github/workflows/skills-gate.yml, package.json (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/skills-eval-puanlama.test.ts (saf cekirdek) | KAL |
| `scripts/skills-eval/lib.mjs` | SKILL YÖNLENDİRME SINAVI — SAF ÇEKİRDEK (ağ yok, dosya yazımı yok). | ALTYAPI | scripts/skills-eval-run.mjs, src/__tests__/conformance/skills-eval-puanlama.test.ts (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/skills-eval-puanlama.test.ts | KAL |
| `scripts/hijyen/skill-bitis-blogu.mjs` | ORTAK BİTİŞ BLOĞUNU 71 SKILL.md'ye GEÇİRİR (REC-305). | ALTYAPI | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/skill-bitis-blogu.test.ts | KAL |
| `scripts/skills-eval-convert.mjs` | evals.json → YERLEŞİK eval vaka ağacı dönüştürücüsü (REC-319 adım 2b). | ALTYAPI | .gitignore (betik taramasi) | 2026-09-13 (pilot: 18 vaka uretildi, 36 kosum kosuldu) | testi YOK — cikti .gitignore da, kapi kosamaz; KANIT pilot kosumu (docs/audits/rec319-yerlesik-skill-araclari-2026-09-13.md bolum 7-8) | KAL |
| `scripts/board/linear-okundu.cjs` | Linear yorum sayacinin esik damgasini "simdi"ye ceker (`--goster`, `--geri`) | OPS *(yazan: ALTYAPI)* | ELLE kosulur, yorumlari okuyan kisi tarafindan; sayac satiri komutu kendi ciktisinda gosterir | 2026-09-14 yazildi ve kosuldu (kabul sinavi: okundu+geri gidis-donus) | INV-MECH-1 (sira ve sessizlik kolu) | KAL |
| `scripts/board/linear-yeni-yorum.cjs` | Linear PROJE yorumlarinda okunmamis Design notlarini sayar, tek satir uretir; GOZCU DEGIL kanca | OPS *(yazan: ALTYAPI)* | `.claude/hooks/board-brief.cjs` her turda cagiriyor (tek GraphQL sorgusu, 60 sn onbellek, 3 sn zaman asimi) | 2026-09-14 canli kosuldu: 20 yeni yorum, 1,05 sn (onbellekten 0,29 sn) | INV-MECH-1 (sira + sessizlik + `!linear` kolu) | KAL |
| `scripts/db/checks/arama-davranisi.mjs` | INV-SEARCH-BEHAVIOR-1 — arama DAVRANIŞI kapısı (Katman B, canlı): on vakayı gerçek RPC üzerinden ölçer, ölçüt biçimleri oran/sıfır-değil/aynı-küme/marka-var/tam-SKU (sabit sayı YOK), hassasiyet tavanı %40, bilinen kırmızılar adıyla ilan edilir ve mandal İKİ YÖNLÜ (ilanlı vaka geçmeye başlarsa KIRMIZI) | ALTYAPI | `.github/workflows/db-advisor.yml` → `catalog-integrity` işine ADIM olarak bağlı, `db-gate-precheck.outputs.ready == 'true'` koşuluyla (yeni iş adı AÇILMADI: açık PR'ları "beklenen kontrol gelmedi"de kilitler) | 2026-09-15, REC-340 Faz 1 Adım 1. Prod'da salt-okuma ölçüldü (Supabase MCP): on vakanın **altısı** kırmızı (2,3,4,5,9,10), dördü geçiyor (1→47, 6→9, 7→1 doğru SKU, 8→52); aktif ürün 441, hiçbir vaka %40 tavanını aşmıyor. Betik sırsız koşturuldu → çıkış 0 + "OLCULEMEDI" + "ATLANMIS IS YESIL DEGILDIR" (konformans kolu bunu DAVRANIŞLA ölçüyor) | `src/__tests__/conformance/arama-davranisi.test.ts` (INV-SEARCH-BEHAVIOR-1 Katman A, 15 kol) | KAL |
| `scripts/db/golge-kur.mjs` | GÖLGE VERİTABANI KURUCUSU — tek komutla geçerli test ortamı: mevcut Docker konteynerinin İÇİNDE ayrı bir DB açar, önsöz → en yeni TAM taban → tabandan sonraki migration'lar → (`--migration`) uygular ve **sadakati SAYARAK** doğrular. `postgres` DB'sine dokunmaz, `initdb`/port GEREKMEZ. ⛔`supabase db reset` İÇERMEZ (o komut aynı kümedeki AKRANIN gölgesini siliyor — 2026-09-16'da yaşandı). ⛔VAR OLAN DB EZİLMEZ: ad çakışırsa çıkış 3 ile DURUR. ⭐`--dusur` = YALNIZ kendi DB sini düşürür (küme sıfırlayan komutun YERİNE; küme altyapısı adlarını reddeder, çıkış 2). Çıkış 0=hazır · 1=sadakat TUTMADI · 2=ÖLÇEMEDİ · 3=ad çakıştı | ALTYAPI (Recep 2026-09-16: "geçerli test ortamı için her türlü izni veririm") | `docs/audits/sema-graf-uretici-2026-09-16.md` yanı sıra kendi başlığı; çağıran yok (elle koşulur) | 2026-09-16 yazıldı ve KOŞULDU: tablo 55 · **politika 163** · fonksiyon 67 · tetik 48 · indeks 199 — politika/fonksiyon/tetik/indeks CANLIYLA BİREBİR. Ad çakışma kolu AKRANIN DB'sini korudu (çıkış 3, dokunulmadı) | **INV-GOLGE-1** `src/__tests__/conformance/golge-kurucu.test.ts` 13 kol — SÖZLEŞME ölçer (yıkıcı komutun yokluğu İKİ biçimde, akran koruması, ad allowlist, çıkış kodları, eşikler, taşınabilirlik). ⚠İlk hâli KÖRDÜ: yalnız kabuk dizgesini arıyordu, argv dizisi biçimini görmüyordu; negatif sınamada yakalandı ve iki biçim de ölçülür oldu (ikisi de KIRMIZI verdirildi); sadakat eşikleri betiğin İÇİNDE (boş gölgeyi reddeder: tablo≥50, politika≥100, fonksiyon≥40, tetik≥20, indeks≥100) | KAL |
| `scripts/db/sema-graf-uret.mjs` | ŞEMA GRAF ÜRETİCİSİ (aşama 1: tablolar + yabancı anahtarlar) — veritabanının KENDİ KATALOĞUNDAN graphify node-link biçiminde graf üretir. Metin taraması YOK, `pg_class`/`pg_constraint` okunur. Çıktı `graphify-out/db-graph.json` (üretilmiş, gitignore), `graphify merge-graphs` ile kod grafiğine eklenir. Düğümler `db_` ad alanında (ghost-duplicate riski). Çıkış 0=üretildi/atlandı · 1=parite TUTMADI · 2=ÖLÇEMEDİ | ALTYAPI (Recep istedi 2026-09-16: "supabase tarafının bir haritası lazım, codegraph gibi bir şey") | `src/__tests__/conformance/sema-graf-uretici.test.ts` (INV-SEMA-GRAF-1, 12 kol) + `docs/audits/sema-graf-uretici-2026-09-16.md` | 2026-09-16 yazıldı ve KOŞULDU: yerel yığında tablo 18=18 · fk 13=13 parite TUTTU, kapsam dışı 6 fk ADIYLA raporlandı; `merge-graphs` ile birleşti (+18 düğüm/+13 kenar) ve `explain` veritabanı sorusuna cevap verdi (8 ilişki, yönlü) | INV-SEMA-GRAF-1 — sır/TLS/taşınabilirlik/çıkış kodu/çıktı biçimi ölçülür; **graf DOĞRULUĞU ölçülmez** (o canlı koşum ister, sınır kapının başlığında yazılı) | KAL |
| `scripts/hijyen/ana-agac-tazelik.cjs` | ANA AĞAÇ TAZELİĞİ — pencerelerin yüklediği ayarların DEPODAKİ hâlle aynı olup olmadığını ölçer; güvenliyse (master · izlenen dosya temiz · fazladan commit yok) yalnız ff-only ileri sarar (REC-345, karar 44) | ALTYAPI | `.claude/hooks/session-board.cjs` (açılış satırı) + `scripts/hijyen/merge-ritueli.cjs` (ayar yoluna değen merge sonrası) · cetvel `docs/standards/fleet-mechanism-standard.md` §20.2 | 2026-09-17 yazıldı; aynı gün ana ağaç 50 → 0 geride elle eşitlendi (ölçüm kaynağı) | `src/__tests__/conformance/ana-agac-tazelik.test.ts` (INV-ANA-AGAC-TAZE-1, 9 kol, geçici gerçek git depoları) | KAL |
| `scripts/hijyen/sage-dosya-dersi.cjs` | SAGE DOSYA DERSİ modülü — çapa puanlaması (dosya 0.9 / dizin 0.5, ölçüldü), bütçe (8 ders · 2800 karakter · 800 ms — yukarı akım varsayılanı, ders KIRPILMAZ), "dosya başına bir kez" işaretleri ve compact nesli. | ALTYAPI | .claude/hooks/sage-dosya-dersi.cjs, .claude/hooks/session-board.cjs (betik taramasi) | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/sage-dosya-dersi.test.ts (6 kol) | KULLANIMDA |
| `scripts/hijyen/sage-yedek.cjs` | WRONGSTACK YEDEĞİ — `.wrongstack/` altındaki HER depo (sage hafızası + iş kartı panosu) `VACUUM INTO` ile, WAL dahil tutarlı; her koşumda TÜM tabloların satır sayıları kaynakla karşılaştırılır, uyuşmazsa `.DOGRULANMADI`. Sanal (FTS5) tablo sayılmaz ama listede kalır. Budama önek başına, en yeni 14. Kaynak bulunamazsa çıkış 0 DEĞİL. | ALTYAPI | elle + `.claude/hooks/sage-yedek-oturum-sonu.cjs`, cron/gözcü YOK — REC-328 | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/sage-yedek.test.ts (8 kol; asıl kol WAL tuzağını her koşumda üretir) | KULLANIMDA |
| `scripts/hijyen/ana-kok.cjs` | ANA AĞAÇ KÖKÜ — `anaKok()` verinin kökünü (ana ağaç, `git --git-common-dir`), `agacKoku()` dosyanın kendi ağacının kökünü verir. Sage verisi yalnız ana ağaçta yaşar; worktree'de eski kök çözümü yedeği sessizce atlıyor ve dersi boş döndürüyordu (2026-09-18 ölçüldü). | ALTYAPI | scripts/hijyen/sage-yedek.cjs, .claude/hooks/sage-dosya-dersi.cjs | olculemedi (repo disi izler taranmadi) | src/__tests__/conformance/sage-ana-kok.test.ts (4 kol; GERÇEK git worktree kurar) | KULLANIMDA |
| `scripts/hijyen/bagimlilik-denetimi.cjs` | BAĞIMLILIK DENETİMİ — karar 52. Üretim ağacındaki her yüksek/kritik kayıt `bagimlilik-kararlari.md` §7'de kabul edilmiş mi, her kabul gerçek bir kayda karşılık geliyor mu (iki yönlü). Çıkış 0 temiz · 1 yeni/bayat · 2 ÖLÇÜLEMEDİ (fail-closed) | ALTYAPI | `.github/workflows/bagimlilik-denetimi.yml` (CI: kilit dosyası değişince + haftalık) · cetvel §11 | 2026-09-21 yazıldı; gerçek audit çıktısında 11/11 kabul, çıkış 0 | `bagimlilik-denetimi.test.ts` (INV-DEP-DENETIM-1) — dört durum gerçek alt süreçle koşulur ve çıkış kodu ölçülür | KAL |
| `scripts/hijyen/kanban-toplu.cjs` | KANBAN TOPLU GİRİŞ — iş kartı panosuna bir sırayı TEK KOŞUMDA yazar; kanban sunucusunu stdio ile sürer, bağlama yalnız özet düşer. Kipler: `<sira.json>` yaz · `--kuru` doğrula · `--pano <id>` kart başına tek satır · `--degerlendir <id>` bölünebilirlik hükmünü yeniden hesapla. Borulu komutu ve ölçütsüz kartı YAZMAZ | ALTYAPI | elle (şerit sırasını panoya girerken) · is-kayit-duzeni pilot bölümü | 2026-09-21: 11 kart / 38 çağrı — sunucu 983.776 bayt döndürdü, bağlama ~150 bayt girdi. Yeniden değerlendirme 13 kart / 514.614 bayt | `kanban-toplu.test.ts` (INV-KANBAN-TOPLU-1) — kabuk işleci ve ölçütsüz kart reddi | KAL |
| `scripts/hijyen/pnpm-overrides.cjs` | PNPM OVERRIDES — tek okuma noktası: `pnpm-workspace.yaml` → `overrides:` bloğunu ayrıştırır ve `package.json`'da eski `pnpm.overrides` alanının kalıp kalmadığını söyler (pnpm 11 / Dependabot o alanı okumaz) | ALTYAPI | `bagimlilik-karar-kaydi.test.ts` (INV-DEP-KARAR-1) · `bagimlilik-denetimi.test.ts` (INV-DEP-DENETIM-1) · cetvel §4.1 | 2026-09-21 yazıldı; taşıma sonrası kilit dosyası içerikte birebir aynı, 22 override okundu | INV-DEP-KARAR-1 — blok var, ayrıştırılamayan satır 0, eski yer BOŞ (sabotajla doğrulandı) | KAL |
| `scripts/hafiza/sage-sozcuk-sirasi.mjs` | REC-363 SON ÖLÇÜM (1/2) — sage'in GERÇEK sözcük aramasının sırasını ölçer: 500 hafıza metnini AYRI geçici bir sage köküne (`C:/tmp/rec363-sage`) yükler, 10 soruyu `memory_search` ile sorar, sırayı `sage-fts.json`'a yazar. Projenin sage'ine YAZMAZ. Koşum sonrası geçici daemon durdurulur ve kök silinir (başlıkta yazılı) | ALTYAPI | elle (ölçüm) | 2026-09-22 koşuldu: sage sözcük ilk-10 7/8 → belge §7 | — (tek seferlik ölçüm) | KAL (ölçüm) |
| `scripts/hafiza/sage-rrf-olcum.mjs` | REC-363 SON ÖLÇÜM (2/2) — `sage-fts.json` + yerel e5 gömmesini RRF ile birleştirip aynı sınavı puanlar | ALTYAPI | elle (ölçüm) | 2026-09-22 koşuldu: RRF ilk-10 7/8 = sage tek başına 7/8, ilk-1 4→1 → KURULMADI (karar 57, belge §7) | — (tek seferlik ölçüm) | KAL (ölçüm) |
| `scripts/hafiza/gomme-kiyasi.mjs` | REC-363 ÖLÇÜM ARACI — aynı 20 ders + 10 soruyla anlamca arama taşıyıcılarını (yerel ONNX, NVIDIA, başsız Haiku, hibrit) doğruluk · gecikme · bedel · 3 tur tutarlılıkla kıyaslar. Depo bağımlılığı değil: `@huggingface/transformers` ayrı boş dizine kurulur; `HAFIZA_KOK` + `NVIDIA_API_KEY` ortamdan, sır basılmaz | ALTYAPI | elle (ölçüm) | 2026-09-22 koşuldu → `docs/audits/rec363-gomme-kiyasi-2026-09-22.md` (hibrit 24/24, C1 yerel ilk-10 24/24); başsız `claude -p`'nin sade bayrak zorunluluğu burada ölçüldü | — (tek seferlik ölçüm; sonuç belgede) | KAL (ölçüm) |
| `scripts/pim/unopim-kopru.cjs` | PIM PİLOTU §3.3 (REC-357) — AKTARIM KÖPRÜSÜ: UnoPim'i SALT-OKUMA anahtarıyla okur, `technical_specs`'e geri çevirir (`specsCevir`, türetilen alanlar dahil), yerel `pim_golge.pim_onizleme.urun`a yalnız değişeni yazar, gölge `products` ile farkı listeler. Hedef DB adı SABİT (`pim_golge`), `arama_golge`'ye ve canlıya yazmaz | ALTYAPI | elle (pilot) | 2026-09-22 koşuldu: 12 ürün, fark 0, ikinci koşum 0; IP44→IP45 değişikliği tek satır farkla taşındı, geri alındı | INV-PIM-UNOPIM-1 §3.3 kolu — geri çeviri + yazma sınırı (sabotajla doğrulandı: hedef ortamdan okununca KIRMIZI) | KAL (PİLOT) |
| `scripts/pim/unopim.cjs` | PIM PİLOTU §3.2 (REC-357) — gölge aile → UnoPim: `birim` (m³/h ekler), `aile` (grup + 23 öznitelik + aile), `csv` (gölge JSON → içe alım CSV'si), `dogrula` (her hücre API'den geri okunur). İçe alımın kendisi yanındaki `unopim-ice-al.php` (konteyner içinde www-data ile). Hepsi idempotent; sır `UNOPIM_SIR_DOSYASI`'ndan, basılmaz | ALTYAPI | elle (pilot) | 2026-09-22 yazıldı ve koşuldu: vortice-lineo-quiet 12 ürün, 300 hücre, fark 0; UnoPim 3.1.1'in `_value/_unit` doğrulama hatası ölçüldü ve atlandı | INV-PIM-UNOPIM-1 (`pim-unopim-csv.test.ts`) — ölçülen iki red (sütun biçimi, zorunlu boş sütunlar) kilitli | KAL (PİLOT) |
| `scripts/hijyen/posta-kutusu-sayac.cjs` | POSTA KUTUSU SAYACI (karar 54) — açılışta kutu sunucusunu oturumun kimliğiyle kısa süre açıp `unread` sorar; 0 → sessiz, > 0 → "📬 KUTUNDA OKUNMAMIS N", ölçülemezse uyarı (temiz sayılmaz). Kök `kanonikKok` ile pencerelerin kutusuna sabit | ALTYAPI | `.claude/hooks/session-board.cjs` (SessionStart) | 2026-09-21 yazıldı; ~0,8–1,2 sn, üst sınır 5 sn; başka kimlikten gelen mesaj 1 sayıldı, pencere aracı da 1 gördü; kendi gönderdiğin sayılmaz | INV-WRONGSTACK-MCP-1 — sayaç kolu + kanonik kök kolu (sabotajla doğrulandı: harf küçültme kaldırılınca KIRMIZI) | KAL |
| `scripts/icerik-hatti/urun-aciklama-duzelt.mjs` | ÜRÜN AÇIKLAMASINDA TEK KELİME DÜZELTMESİ — `description_i18n` (REC-212, 2026-09-10) | URUN-KATALOG | elle kosulur (Recep tikiyla — karar 65 bekleniyor) | 2026-09-10 (kuru kosum 3 urun x 2 dil) | yok | AKTIF |
| `scripts/icerik-hatti/__tests__/paket-sozlesme.test.ts` | REC-212 · paket kolon sözleşmesi + CSV katmanı round-trip kapısı + geri yükleyici yolu. | URUN-KATALOG | vitest (her PR) | 2026-09-22 (15/15) | kendisi | AKTIF |
| `scripts/icerik-hatti/__tests__/uretici-fark-tablosu.test.ts` | Karar 71c · üretici ↔ bizim veri fark tablosu: hüküm kuralı, uydurma satır yok, fiyat sızmaz, ÖLÇÜLEMEDİ yolu | URUN-KATALOG | vitest (her PR) | 2026-09-22 (3/3) | kendisi | AKTIF |
| `scripts/icerik-hatti/paket-csv-dogrula.mjs` | TAŞINABİLİR KATALOG — CSV KATMANI ROUND-TRIP KAPISI (REC-212, karar 66) | URUN-KATALOG | elle kosulur, paket uretiminden sonra (K3-b yayin sarti) | 2026-09-22 (442 urun · 17522 hucre · fark 0) | scripts/icerik-hatti/__tests__/paket-sozlesme.test.ts | AKTIF |
| `scripts/icerik-hatti/paket-sozlesme.mjs` | TAŞINABİLİR KATALOG PAKETİ — KOLON SÖZLEŞMESİ (REC-212, sözleşme v1'in açılan 8 kolonu) | URUN-KATALOG | modul: katalog-paket-uret · kaynak-eslemesi · paket-csv-dogrula | 2026-09-22 | scripts/icerik-hatti/__tests__/paket-sozlesme.test.ts | AKTIF |
| `scripts/hijyen/kapali-dal-push.cjs` | KAPALI DALA PUSH BEKÇİSİ — `.githooks/pre-push` çağırır (INV-KAPALI-DAL-1) | ALTYAPI | `.githooks/pre-push` | 2026-09-22 | kapali-dal-push.test.ts | KAL |
| `scripts/pim/unopim-yedek.cjs` | REC-357 §7 — UnoPim YEDEK AL + GERİ KURMA DENEMESİ (karar 36 şartı: yedeksiz faz 2 adımı başlamaz). `al` (pg_dump + storage birimi = APP_KEY dahil + compose/.env/sırlar → AES-256-GCM şifreli `.vhenc`), `coz`, `dene` (ayrı `pim-geri` projesine kurar, sayı + giriş + anahtar kaynağı kontrolü, yalnız onu siler) | ALTYAPI | elle — karar 82: her toplu PIM düzenlemesinden ÖNCE; 442 ürün yüklenince günlük otomatik | 2026-09-23 koşuldu: yedek 2–4 sn, şifreli tur (al→coz→dene) 48 sn 12/12; sabotaj (anahtarsız yedek, yanlış anahtar, anahtar yedek içinde) üçü de KIRMIZI | INV-PIM-YEDEK-1 (`pim-unopim-yedek.test.ts`) | KAL |
| `scripts/icerik-hatti/__tests__/aile-metni-yaz.test.ts` | REC-146 · aile metni yazıcısı uçtan uca, sahte PostgREST (`+` kodlama, yarış, kümeler, 0 PATCH) | URUN-KATALOG | vitest (her PR) | 2026-09-23 (8/8; kodlama sabotajında 3 düşer) | kendisi | AKTIF |
| `scripts/icerik-hatti/__tests__/en-jeton-kapisi.test.ts` | REC-146 · TR ↔ EN jeton kapısı: eşdeğerlik tablosunun her kuralına sabotaj | URUN-KATALOG | vitest (her PR) | 2026-09-23 (8/8) | kendisi | AKTIF |
| `scripts/icerik-hatti/__tests__/taslak-kaynak-kapisi.test.ts` | REC-146 · taslak kaynak kapısı: dizinden okur, PDF açmaz, akım/90% jetonu, evren kapısı | URUN-KATALOG | vitest (her PR) | 2026-09-23 (4/4) | kendisi | AKTIF |
| `scripts/icerik-hatti/__tests__/toplu-sunum-k70.test.ts` | REC-146 · toplu sunum karar 70 kipi: sunum = yük, kırmızı aile tabloya girmez | URUN-KATALOG | vitest (her PR) | 2026-09-23 (2/2) | kendisi | AKTIF |
| `scripts/icerik-hatti/aile-metni-kurallar.mjs` | Aile metni yazıcısının saf kuralları (küme kapısı, yazım planı, atomik PATCH yolu) | URUN-KATALOG | `aile-metni-yaz.mjs` | 2026-09-23 | `__tests__/aile-metni-yaz.test.ts` | AKTIF |
| `scripts/icerik-hatti/en-jeton-kapisi.py` | TR ↔ EN jeton eşitliği kapısı (sayı dile göre, birim/faz eşdeğerliği) — karar 70 | URUN-KATALOG | `toplu-sunum.py --k70` | 2026-09-23 | `__tests__/en-jeton-kapisi.test.ts` | AKTIF |
| `scripts/icerik-hatti/__tests__/rec172-cikarim.test.ts` | REC-172 · deterministik okuyucu: model adı eşleme, 14/5 T2 föysüz, bölüm etiketiyle okuma, kol 2 ayrışma sabotajları, bayt-eşitlik | URUN-KATALOG | vitest (her PR) | 2026-09-23 (7/7) | kendisi | AKTIF |
| `scripts/icerik-hatti/__tests__/faz4-teknik-yukle.test.ts` | REC-172 · yükleyici `--girdi` sahte PostgREST: yalnız NULL'a yazım, `+` kodlama, yarışta tek yeniden deneme, iki anahtar, geri okuma | URUN-KATALOG | vitest (her PR) | 2026-09-23 (9/9; quote kaldırılınca 3 düşer) | kendisi | AKTIF |
| `scripts/icerik-hatti/__tests__/teknik-duzelt.test.ts` | Teknik düzeltici sahte PostgREST: değiştir+sil gövdesi, `onceki` hepsi-ya-hiç (tip birebir), zaten-hedefte, yarışta tek yeniden deneme (taze specs), beyansız alan → çıkış 2, iki anahtar | URUN-KATALOG | vitest (her PR) | 2026-09-23 (7/7; quote kaldırılınca 4 düşer) | kendisi | AKTIF |
| `scripts/icerik-hatti/teknik-duzelt.py` | DOLU `technical_specs`'te anahtar düzeyinde düzeltme (`--duzeltme` JSON: degistir/sil/onceki); önkoşul hepsi-ya-hiç, koşullu atomik PATCH, iki anahtar, yedek, geri okuma | URUN-KATALOG | `elle` ← `duzeltmeler/*.json` (ilk: atex-zone-k11a-jet-storm, 13 ürün girdi kapısından geçti) | 2026-09-23 (yalnız sahte PostgREST; canlıya koşulmadı) | `__tests__/teknik-duzelt.test.ts` | AKTIF |
| `scripts/icerik-hatti/fark-hassasiyet.mjs` | Fark kıyası kaynağın BASILI ondalık hassasiyetinde (saf; cetvel "Türetilen değer") | URUN-KATALOG | `uretici-fark-tablosu.mjs` | 2026-09-23 | `__tests__/uretici-fark-tablosu.test.ts` | AKTIF |
| `scripts/icerik-hatti/fiyat-kaynak-esle.mjs` | Paket fiyatının kaynak eşlemesi — kdv · kaynak_fiyat_eur · fiyat_kaynak_sayfa, kaynak dizininden (saf; REC-212) | URUN-KATALOG | `katalog-paket-uret.mjs` (dizin yoksa durur; `--fiyat-kaynaksiz`) | 2026-09-23 (348 ürün: 343 bulundu · 5 yok · DB'den farklı 2; iki koşum bayt-eşit) | `__tests__/fiyat-kaynak-esle.test.ts` | AKTIF |
| `scripts/icerik-hatti/rec172-cikarim.py` | REC-172 karar 76: NIMUS/NIMAX/Enkelfan/CMS ATEX teknik verisini kaynak dizininden deterministik okur; tablolu kaynakta kol 2 (düz metin ↔ tablo), alıntı yeniden arama | URUN-KATALOG | `elle` → çıktısı `faz4-teknik-yukle.py --girdi` | 2026-09-23 ilk koşum: 49 ürün · 490 satır (alıntı 430 · koşullu 50 · türetildi 10), iki koşum bayt-eşit | yok (salt okuma) | AKTIF |
| `scripts/icerik-hatti/karar70-hazirla.mjs` | Karar 70 hazırlık: canlıdan (salt okuma) kip ayrımı, onaylı↔canlı TR md5, plan.json + onaylı TR taslakları | URUN-KATALOG | `elle` | 2026-09-23 ilk koşum: en 17 · b 8 (jet değişti) · 2 K7.10 dışarıda | yok (salt okuma; çıktısı ingestor 2d06af1) | AKTIF |
| `scripts/gsc/gsc-token.cjs` | Google Search Console erişim jetonu — HİZMET HESABI ile (süresi dolmayan kalıcı yol). Anahtar `GSC_SA_ANAHTAR` (depo dışı; depo içindeyse reddeder), stdout'a yalnız 1 saatlik jeton; `--dene <site>` erişimi ölçer. OAuth "Testing" kipinin 7 günlük yenileme jetonunun yerine | ALTYAPI | elle — OPS REC-369 taban ölçümü + search-console skill'i (`Authorization: Bearer $(node scripts/gsc/gsc-token.cjs)`) | 2026-09-23 koşuldu: venthub-gsc@venthub-507309 → sc-domain:venthub.com.tr siteRestrictedUser | INV-GSC-TOKEN-1 (`gsc-token.test.ts`) | KAL |
| `scripts/icerik-hatti/__tests__/fiyat-kaynak-esle.test.ts` | REC-212 · paket `fiyatlar.csv` kaynak kolonları (kdv · kaynak_fiyat_eur · fiyat_kaynak_sayfa). | URUN-KATALOG | vitest (`pnpm test`) | 2026-09-23 (13/13) | kendisi test | AKTIF |
| `scripts/icerik-hatti/__tests__/fiyat-bosluk.test.ts` | REC-209 C · fiyat boşluk raporu. Ağa, DB'ye, diske çıkmaz. ⛔ Fiyatlar UYDURMA. | URUN-KATALOG | vitest (`pnpm test`) | 2026-09-23 (4/4, sabotaj yönü dahil) | kendisi test | AKTIF |
| `scripts/icerik-hatti/fiyat-bosluk.mjs` | FİYAT BOŞLUK RAPORU — saf çekirdek (REC-209 C). Katalog hattı fiyat YAZMAZ (Recep kararı | URUN-KATALOG | `katalog-karnesi.mjs` | 2026-09-23 | `__tests__/fiyat-bosluk.test.ts` | AKTIF |
| `scripts/seo/bot-karnesi.mjs` | BOT KALİTESİ KARNESİ — canlı sitenin her sayfa türünü arama motoru ve yapay zekâ botu gözüyle ölçer (durum, bot başına kelime, title, canonical, hreflang düşüşü, JSON-LD, robots, site haritası; bilinçli kararlar ayrı) | BLOG (kapıya bağlama ALTYAPI) | elle: `node scripts/seo/bot-karnesi.mjs --cikti <dizin>`; Linear REC-369 F1b | 2026-09-24 ilk iki koşum: 45 adres, 32 sorunlu (REC-369 karne yorumu) | yok — ALTYAPI kapıya bağlayacak (OPS emri F1b) | KAL-KAPISIZ |
| `scripts/rehber/__tests__/alinti-dogrula.test.ts` | INV-REHBER-ALINTI-1 · alıntı doğrulamanın saf yardımcıları (R2.3): bayat alıntı bulunur ama INCELE, yol değişikliği INCELE, uydurma alıntı KALDI; ağa çıkmaz | BLOG | vitest (`pnpm test`) | 2026-09-24 (37/37 iki dosya birlikte) | kendisi test | AKTIF |
| `scripts/rehber/__tests__/rehber-denetim.test.ts` | INV-REHBER-DENETIM-1 · rehber yazısı ağsız denetimi (R5.1 3b, R4, R8.1): her kol temiz örneği bilerek bozar (sabotaj), temiz örnek hiçbir kolda kırmızı vermez | BLOG | vitest (`pnpm test`) | 2026-09-24 (37/37 iki dosya birlikte) | kendisi test | AKTIF |
| `scripts/rehber/alinti-dogrula.mjs` | ALINTI DOĞRULAMA — ham kaynaktan (curl eşdeğeri, özetleyici araç yok): yönlendirme zinciri, son güncelleme, sha256, normalize alıntı araması, bayatlık/yol değişikliği → INCELE. ⚠AĞA ÇIKAR, CI'da koşmaz | BLOG | elle: `node scripts/rehber/alinti-dogrula.mjs <kaynaklar.json> [--dizin …] [--cikti …]` (rehber cetveli R5.1 3c) | 2026-09-24 canlı: cetvelin 5 Google alıntısı → GECTI 2 · INCELE 3 (bayat SSS alıntısı yol değişikliğiyle yakalandı) · KALDI 0 | `__tests__/alinti-dogrula.test.ts` (saf kısım) | AKTIF |
| `scripts/rehber/rehber-denetim.mjs` | REHBER YAZISI DENETİMİ — ağsız çekirdek: atıf ↔ kaynak listesi, numarasız iddia (gövde/tablo/ön bilgi), vaat/fiyat/iç not (K2'nin JS karşılığı)/rakip, olumsuz ve mevzuat cümlesi iddia tablosunda | BLOG (CI'a bağlama ALTYAPI) | `__tests__/rehber-denetim.test.ts`; ilk yazıda elle | 2026-09-24 yazıldı; kendi testi Kaynaklar-sonrası açığı yakaladı, onarıldı | kapı: vitest `ci` işi (`pnpm test`, varsayılan include) — INV-REHBER-DENETIM-1 + INV-REHBER-ALINTI-1; ⚠`vitest.config.ts` include'u daraltılırsa bu testler SESSİZCE düşer (ALTYAPI ölçümü 2026-09-24) | AKTIF |

### 3.3 · skill (39 tekil ad, 64 satır ağaç-bazlı)

| # | Ad | Ağaç | ne_yapar | sahip (manifest kategorisi) | tetik | kanıt (son değişiklik · manifest) | kapı | durum |
|---|---|---|---|---|---|---|---|---|
| 1 | ui-ux-pro-max | .claude | UI/UX renk·Tailwind·HSL öneri | guards | `skill:ui-ux-pro-max` | 2026-08-11 · manifest yok (.claude kapsam dışı) · sınav 2026-09-14 REC-314 p1: 2/2 geçti, without 0 | 09-05 §3 KAL kararı | KAL |
| 2 | ui-ux-pro-max | .agent | (aynı) | guards | `skill:ui-ux-pro-max` | 2026-09-01 · manifest evet · sınav 2026-09-14 REC-314 p1: 2/2 geçti, without 0 | manifest kaydı | KAL |
| 3 | typography | .claude | font/okunabilirlik/tip ölçeği | guards | `skill:typography` | 2026-08-11 · manifest yok | 09-05 §3 | KAL |
| 4 | typography | .agent | (aynı) | guards | `skill:typography` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 5 | web-design-guidelines | .claude | a11y/Web Interface Guidelines denetimi | guards | `skill:web-design-guidelines` | 2026-06-11 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | 09-05 §3 | KAL |
| 6 | web-design-guidelines | .agent | (aynı) | guards | `skill:web-design-guidelines` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 7 | threejs-webgl-performance | .claude | R3F/Three.js draw-call·gölge·Lighthouse | guards | `skill:threejs-webgl-performance` | 2026-06-18 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | 09-05 §3 | KAL |
| 8 | threejs-webgl-performance | .agent | (aynı) | guards | `skill:threejs-webgl-performance` | 2026-06-18 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 9 | vercel-composition-patterns | .claude | compound component/context deseni | guards | `skill:vercel-composition-patterns` | 2026-06-11 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | 09-05 §3 | KAL |
| 10 | vercel-composition-patterns | .agent | (aynı) | guards | `skill:vercel-composition-patterns` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 11 | venthub-architecture | .claude | RSC/App Router/render-cache kuralları | guards | `skill:venthub-architecture` | 2026-08-18 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | 09-05 §3 | KAL |
| 12 | venthub-architecture | .agent | (aynı) | guards | `skill:venthub-architecture` | 2026-08-18 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
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
| 35 | supabase-security | .claude | RLS policy/migration/middleware kuralı | guards | `skill:supabase-security` | 2026-08-13 · manifest yok · sınav 2026-09-14 REC-314 p1: 2/2 geçti, without 0 | yok | ENVANTER-DISI |
| 36 | supabase-security | .agent | (aynı) | guards | `skill:supabase-security` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p1: 2/2 geçti, without 0 | manifest kaydı | KAL |
| 37 | supabase | .claude | Supabase client/servis/db query kuralı | guards | `skill:supabase` | 2026-06-11 · manifest yok | yok | ENVANTER-DISI |
| 38 | supabase | .agent | (aynı) | guards | `skill:supabase` | 2026-06-10 · manifest evet | manifest kaydı | KAL |
| 39 | to-issues | .claude | plan/PRD'yi issue'lara böler | utils | `skill:to-issues` | 2026-08-11 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | ENVANTER-DISI |
| 40 | to-issues | .agent | (aynı) | utils | `skill:to-issues` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 41 | to-prd | .claude | konuşma transkriptini PRD'ye çevirir | utils | `skill:to-prd` | 2026-08-11 · manifest yok · sınav 2026-09-14 REC-314 p1: 2/2 geçti, without 0 | yok | ENVANTER-DISI |
| 42 | to-prd | .agent | (aynı) | utils | `skill:to-prd` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p1: 2/2 geçti, without 0 | manifest kaydı | KAL |
| 43 | venthub-auditor | .claude | pre-commit/bütünlük denetimi | audit | `skill:venthub-auditor` | 2026-08-27 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | ENVANTER-DISI |
| 44 | venthub-auditor | .agent | (aynı) | audit | `skill:venthub-auditor` | 2026-08-25 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 45 | venthub-enterprise-audit | .claude | L1-L12 "10/10 onay" teslim denetimi | audit | `skill:venthub-enterprise-audit` | 2026-08-11 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | ENVANTER-DISI |
| 46 | venthub-enterprise-audit | .agent | (aynı) | audit | `skill:venthub-enterprise-audit` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 47 | venthub-global-rontgen | .claude | proje-geneli fiziki radar/rontgen taraması | audit | `skill:venthub-global-rontgen` | 2026-08-27 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | ENVANTER-DISI |
| 48 | venthub-global-rontgen | .agent | (aynı) | audit | `skill:venthub-global-rontgen` | 2026-08-18 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
| 49 | vercel-react-best-practices | .claude | React/Next.js performans/waterfall kuralları | guards | `skill:vercel-react-best-practices` | 2026-06-11 · manifest yok · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | ENVANTER-DISI |
| 50 | vercel-react-best-practices | .agent | (aynı) | guards | `skill:vercel-react-best-practices` | 2026-06-10 · manifest evet · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | manifest kaydı | KAL |
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
| 65 | venthub-tasarim-dili | .agent | (SKILL.md ozetinden elle) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | YENI |
| 66 | venthub-tasarim-dili | .claude | (SKILL.md ozetinden elle) | OPS | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) · sınav 2026-09-14 REC-314 p2: 2/2, with 1.00 / without 0.00 | yok | YENI |
| 67 | office-hours | .claude | fikir sorgusu: plandan ONCE alti zorlayici soru + oncul curutme + 2-3 yol -> docs/plans tasarim notu; kod/emir yazmaz (gstack uyarlamasi, PR #1116) | OPS | insan (/office-hours) | 2026-09-08 · PR #1116 | yok (cetvel: execution-method-standard karar tablosu) | KAL-KAPISIZ |
| 68 | qa | .claude | Playwright+Chromium ile gercek tarayici denetimi: gez -> kanit -> atomik fix(qa) -> yeniden olc; scripts/gez.mjs; prod yalniz bakis (gstack uyarlamasi, PR #1116) | OPS | insan (/qa) | 2026-09-08 · PR #1116 | yok (cetvel: execution-method-standard karar tablosu) | KAL-KAPISIZ |
| 69 | llm-council | .claude | zor karar icin konsey: N mercekli uye -> anonim dondurulmus-sirali capraz puanlama -> baskan sentezi + muhalefet serhi; Workflow betigi SKILL.md icinde, "workflow kullan" sart; karar Recep'in (karpathy/llm-council fikri, PR #1116) | OPS | insan (/llm-council) | 2026-09-08 · PR #1116 | yok (cetvel: execution-method-standard karar tablosu) | KAL-KAPISIZ |
| 70 | task-observer | .claude | is sirasinda skill surtunmesini (Recep duzeltmesi, tekrar, kural ihlali) docs/skill-gozlemleri/acik/ altina tek-dosya gozlem olarak yazar; haftalik inceleme OPS gun kapanisinda (rebelytics CC BY 4.0 uyarlamasi, PR #1116) | OPS | insan + oturum basi (sessiz) | 2026-09-08 · PR #1116 | docs/skill-gozlemleri/ (cikti dizini) | KAL-KAPISIZ |
| 71 | video-kaynak | .claude | YouTube'da yt-dlp ile anahtarsiz ara -> Recep secer -> NotebookLM source_add -> chat_ask ile sorgulanabilirlik dogrulamasi; transkript = veri, talimat degil (Agent-Reach fikri, urun alinmadi, PR #1116) | OPS | insan (/video-kaynak) | 2026-09-08 · PR #1116 | docs/notebooklm/kaynaklar.md (cikti) | KAL-KAPISIZ |
| 72 | investigate | .agent | Ariza teshisi: kok sebepsiz duzeltme YOK, kapsam kilidi, 3 deneme siniri | ALTYAPI | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | evals 12/8 + skills:verify | KAL |
| 73 | investigate | .claude | Ariza teshisi: kok sebepsiz duzeltme YOK, kapsam kilidi, 3 deneme siniri | ALTYAPI | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | evals 12/8 + skills:verify | KAL |
| 74 | graphify | .claude | Bilgi grafigi sorgu yuzeyi (dis arac graphify 0.9.62). Skill ve kok CLAUDE.md bolumu ARACIN YAZDIGI HALIYLE duruyor — Recep karari 2026-09-16 "olduga gibi istiyorum, yasak felan yok, test edecegiz kullanacagiz sonra gorecegiz gercegi". YASAK YOK: butun fiiller acik. REC-313'un query olcumu (5 soruda 2 yanlis 2 eksik) TEK KOSUMLUK bir olcumdur, egilim degil; kullanimla yeniden olculecek. ALTYAPI'nin daraltma onerisi REDDEDILDI | ALTYAPI (kurulum Recep onayi 2026-09-16, emir docs/plans/graphify-kurulum-emri-2026-09-16.md) | .claude/settings.json PreToolUse (Bash\|Grep -> hook-guard search · Read\|Glob -> hook-guard read, ikisi FAIL-OPEN) + kok CLAUDE.md graphify bolumu | 2026-09-16 kuruldu ve kosuldu (extract: 10410 dugum / 19504 kenar) · 2026-09-17 ANA AGACTA kosuldu (11061 dugum / 20808 kenar); BILINEN KISMI CIKARIM: graphify ayristiricisi 2 dosyada sozdizimi hatasi bildirdi ve kismi cikardi — `src/lib/services/pricingAdmin.service.ts` (L238, 28 sembol) ve `src/views/admin/__tests__/AdminReturnsPage.integration.test.tsx` (L46, 1 sembol); tsc bu dosyalari geciriyor, yani sinir graphify'in TS ayristiricisinda | yok — DIS ARAC, bitis blogu tasimaz; §4'te sinirlari ve celiskisi adiyla yazili | KAL-KAPISIZ |

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
| `.githooks/pre-push` | Birleşmiş ve açık PR'ı olmayan dala push'u REDDEDER (INV-KAPALI-DAL-1; #1305 dersi) | ALTYAPI | `githook:pre-push` (shim `.git/hooks/pre-push`) | 2026-09-22 (gerçek gh ile #1306 dalına push → RED ölçüldü) | kapali-dal-push.test.ts | KAL |

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
| `gemini-dispatch.yml` | PR olaylarını Gemini iş akışlarına yönlendirir | ALTYAPI | `ci:pull_request(opened),pull_request_review(_comment)` | 2026-09-06T20:45:40Z skipped | invoke/plan-execute/review/triage çağırır | KAYIP (onceki: KAL) |
| `gemini-review.yml` | Gemini kod review adımı | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:132` | 60 dispatch koşumunun 24 başarılısında `review::success`, en yeni 2026-09-06T20:44:38Z | reusable workflow | KAYIP (onceki: KAL (sonnet'in "2026-03-18 failure/ÖLÜ ADAY" hükmü YANLIŞTI — düzeltildi)) |
| `gemini-invoke.yml` | Gemini'yi PR bağlamında çalıştırır | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:160` | 24 başarılı dispatch koşumunda `invoke::skipped` (bağlı, tetik `@gemini` yorumu hiç gerçekleşmedi) | reusable workflow | KAYIP (onceki: KAL (bağlı, uykuda)) |
| `gemini-plan-execute.yml` | Gemini plan/uygulama adımı | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:174` | aynı ölçüm, `plan-execute::skipped` ×24 | reusable workflow | KAYIP (onceki: KAL (bağlı, uykuda)) |
| `gemini-triage.yml` | Gemini triage adımı | ALTYAPI | `ci:workflow_call` ← `gemini-dispatch.yml:146` | aynı ölçüm, `triage::skipped` ×24 | reusable workflow | KAYIP (onceki: KAL (bağlı, uykuda)) |
| `db-advisor-fix.yml` | DB advisor bulgularını otomatik düzeltme | ALTYAPI | `ci:workflow_dispatch` (tek satır) | son koşum 2025-12-08T07:41:35Z failure (9 ay); `gh workflow list --all` state `active` | — | OLU-DOGRULANDI |
| `jules-a11y.yml` | A11y denetimi (Jules AI) | ALTYAPI | `ci:workflow_dispatch` | `gh workflow list --all` state **disabled_manually** | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `jules-dependency-update.yml` | Bağımlılık güncelleme önerisi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `jules-i18n-sync.yml` | TR/EN sözlük paritesi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `jules-lint-fix.yml` | Lint/TS otomatik düzeltme dalgası (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `jules-performance.yml` | Performans denetimi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `jules-security-audit.yml` | Güvenlik denetimi (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `jules-test-coverage.yml` | Test kapsam artırma (Jules) | ALTYAPI | `ci:workflow_dispatch` | state disabled_manually | — | KAYIP (onceki: OLU-DOGRULANDI) |
| `ai-auto-repair.yml` | CI kırmızıysa otomatik onarım denemesi (Jules) | ALTYAPI | `ci:workflow_run(CI tamamlanınca)` | `gh workflow list --all` state **disabled_manually**; sonnet "skipped" gördü, KAL sandı — **YANLIŞ** | — | KAYIP (onceki: OLU-DOGRULANDI (sonnet'in KAL hükmü çürütüldü)) |
| `skills-gate.yml` | SKILL KAPISI — sayaç her PR'da (ücretsiz), yönlendirme sınavı yalnız skill değişince (ücretli). | ALTYAPI | cagiran-yok (betik taramasi) | olculemedi (repo disi izler taranmadi) | kendisi kapi | KAL |
| `migration-linter.yml` | INV-MIGRATION-3 — migration linter PR kapısı (squawk) | ALTYAPI | .squawk.toml (betik taramasi) | olculemedi (repo disi izler taranmadi) | kendisi kapi — SABOTAJ KANITLI (2026-09-13: sabotaj dosyasi 5 kol, cikis 123 = KIRMIZI; geri alinca 0 dosya = yesil) | KAL |
| `sema-tabani-uret.yml` | prod şemasının GERÇEK `--schema-only` dökümünü alır (salt-okuma), boş dökümü reddeder, artefakt bırakır | ALTYAPI | `elle` (`workflow_dispatch`; push/schedule BİLEREK yok — prod'a bağlanan iş akışı insan kararıyla koşar) | yok — 2026-09-15'te yazıldı, henüz koşmadı | `src/__tests__/conformance/sema-tabani-is-akisi.test.ts` (INV-SEMA-TABAN-1, 10 kol + sabotaj) | KAL |
| `bagimlilik-denetimi.yml` | Bağımlılık denetimi — karar 52. Kilit dosyası / package.json / kabul listesi değişince ve haftada bir (pazartesi 04:17 UTC) denetim betiğini koşar; `pnpm install` YOK | ALTYAPI | GitHub Actions (PR + master push `paths` süzgeçli, `schedule`, `workflow_dispatch`) · cetvel §11 | 2026-09-21 yazıldı; ilk CI koşusu bu PR'da | `bagimlilik-denetimi.test.ts` — `contents: read`, install yokluğu, kilit dosyası ve haftalık tetik varlığı | KAL |

**Envanter dışı ek bulgu (29'a dahil değil):** `tmp-lf-fix.yml` — `gh workflow list --all` bunu
`active` listeliyor, ama `.github/workflows/` dizininde YOK ve `git log --all` boş dönüyor.
GitHub tarafında bayat/hayalet bir kayıt; repo tarafı hiç izlemedi. Durum: **ÖLÇÜLEMEDİ (GitHub
tarafı hayalet)** — OPS'un GitHub Actions ayarlarından elle temizlemesi gerekir (repo commit'i
gerektirmez).

### 3.6 · cetvel — `docs/standards/*.md` (68 araç)

> Kapı sütunu cetveller.md'deki kapı aynen taşındı. Durum: KAPILI→**KAL**, HARİTADA-KAPISIZ ve
> YETİM→**KAL-KAPISIZ** (AXIOM 3 madde 3: kapısı yok ama var — kapı borcu). Sahip: sahipsiz
> satırlar AXIOM 2 gereği OPS'a yazıldı, devir adayı eklendi.

| dosya | ne_yapar | sahip | tetik | kanıt | kapı | durum |
|---|---|---|---|---|---|---|
| arama-standard | Sitedeki ürün aramasının cetveli: aranan alan ve satır kümesi (SSOT), sorgu normalizasyonu, eşleştirme semantiği, tenant/yetki sınırı, iki katmanlı kapı, on iki maddelik asgari vaka kümesi, tazeleme ve migration kuralları | URUN | REC-340 Faz 1 | 2026-09-15, REC-340 Faz 1. ⭐Satır URUN'un hükmüyle ALTYAPI tarafından yazıldı: dosya ALTYAPI claim'inde, URUN kapıya takıldı, AŞMADI, değişikliği geri alıp hükmü mesajla verdi. Ve satır bu PR'da duruyor çünkü KUPLAJ ölçüldü — envanter DİSKLE karşılaştırılır, satır ile dosya AYNI AĞAÇTA olmak zorunda (ayrı PR denendi: envanter 77 / disk 76, beş kol kırmızı) | `INV-SEARCH-*` — **HENÜZ YAZILMADI**, Faz 1 Adım 1'in konusu (kapı sütunu boş bırakılmadı: boşluk kapı varmış gibi okunur) | KAL-KAPISIZ |
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
| urun-yapisal-veri-standard | VentHub Ürün Yapısal Verisi Standardı (Cetvel) — v1.0 | URUN | src/__tests__/conformance/jsonld-urungrubu-gorsel.test.ts (INV-URUNGRUBU-GORSEL-1) | olculemedi (repo disi izler taranmadi) | yok | YENI |
| kategori-adlandirma-standard | Kategori Adlandırma Cetveli — hangi alan NEREDE kazanır | URUN | docs/README.md (soru→otorite tablosu) | 2026-09-09 (§4 açık karar KAPANDI: `marketing_title` emekli, Recep) | kategori-adi-tek-kaynak.test.ts (INV-KATEGORI-ADI-1) — **KISMEN**: zincirin 1. adımını ve sözlüksüz çağrıyı ölçer, sıranın kendisini ölçmez | KAL |
| denetim-izi-standard | Cetvel — Denetim izi bütünlüğü: hangi veri yazımı denetim izine düşmek ZORUNDA, nasıl ölçülür, kim neyi üstlenir (REC-292). Yazma yüzeyi evreni (7 kalem, ikisi dosya DEĞİL), fail-closed hükmü + ispat yükü, tetiğin GÖRMEDİĞİ yollar (TRUNCATE / sahip rolü), dört yasak. | ALTYAPI | `docs/plans/rec292-denetim-izi-2026-09-09.md` · kapı `scripts/db/checks/denetim-izi-tetik-kapisi.mjs` · `CLAUDE.md` kural 11'in tek yazılı karşılığı | 2026-09-09 prod ölçümüyle yazıldı: yazan 14 betiğin 0'ı denetim yazıyor · 09-08'de hiçbir tablodan satır yok · `site_settings`'te `tenant_id` YOK · `exec` RPC YOK · TRUNCATE yetkisi `anon`'a kadar açık | `denetim-izi-kapisi.test.ts` — cetvelin fail-closed hükmünü, TRUNCATE kapsam-dışı beyanını, geriye-dönük-üretim yasağını ve tenant borcunu ADIYLA arar (cetvel sessizleşirse KIRMIZI) | YENI |
| bagimlilik-guvenlik-yukseltme-standard | Bağımlılık Güvenlik Yükseltme Cetveli | ALTYAPI | `pnpm audit --prod` işleri (REC-323 ve halefleri) | 2026-09-13 · REC-323 (yazıldığı iş) | yok — kapı borcu | KAL-KAPISIZ |
| ledger-ve-olu-migration-standard | Ledger ve Ölü Migration Dosyası Cetveli — prod a hic uygulanmamis migration dosyasi ne olur | ALTYAPI | REC-321 silme migration yorumu (20260914090000) + supabase-migrate.yml parite adimi + REC-322 karsilikli EK | 2026-09-14 yazildi (REC-321, Recep karari SECENEK 1) | INV-MIGRATION-3 (parite adimi) | KAL |
| rls-yetki-karari-standard | RLS Yetki Kararı Cetveli — bir politika "bu kullanıcı yönetici mi" sorusunu nereden okur | ALTYAPI | INV-AUTH-ROLE-2 kapisi (src/__tests__/conformance/rls-yetki-karari.test.ts) + REC-322 migration yorumu + borc ilani docs/rls-yetki-karari-borc-ilani.json | 2026-09-14 yazildi (REC-322) | INV-AUTH-ROLE-2 | KAL |
| hukum-kaynak-standard | Hüküm-Kaynak Cetveli — Recep'e giden her hüküm cümlesi kaynağını taşır; üç kaynak sınıfı (A kendi ölçümüm · B belgeden okudum · C bilmiyorum) karıştırılamaz, ve geri alınan hüküm karneye yazılır | URUN (yazan) — kural FİLO GENELİ, üç şeridi de bağlar | atıf YOK (ölçüldü 2026-09-16: depoda hiçbir dosya bu cetveli anmıyor) — cetvel bunu §3.1'de KENDİSİ ilan ediyor: "Otomatik kapı YOK, bugün bir alışkanlık sözleşmesidir" | 2026-09-16 yazıldı — doğuran olay aynı oturumda dört yanlış hüküm; Recep kararı 27 KABUL ("ölçüm olmalı evet"), kararı 26 RED (karar yetkisi şeride devredilmedi, ispata bağlandı) | yok — **ALTYAPI BORCU, cetvel §3.2 adıyla yazıyor:** §2'nin kapıya bağlanması `.claude/hooks/**` şeridindedir, kolu ALTYAPI yazar | KAL-KAPISIZ |
| vitrin-metni-standard | Vitrin Metni Standardı — müşterinin gördüğü ürün/aile metnine ne girer, ne girmez: iç editör notunun ölçülmüş sekiz biçimi ve kapı deseni (K2), biçim işareti nottan ayrıdır (K3), bilgi yoksa blok anahtarı hiç yazılmaz (K4), ürün bilgisi ile kaynak eksikliği ayrımı (K5), doğrulanmamış teknik değer vitrine girmez (K6), her blok kendi anahtarında durur (K7), çok parçalı veri onarımı migration'ının yöntemi (K9) | URUN | `docs/README.md` (soru→dosya haritası) + `supabase/migrations/20260918062422_aile_blok_notu_temizligi.sql` (guard deseni K2'den alındı, üç guard K8'de yazılı) | 2026-09-18 yazıldı (REC-206 / karar 45). Doğuran olay: karar 42'de bir editör notu 11 gün canlı vitrinde kaldı ve cetvel yazılmadı; 45'te aynı deseni taşıyan 38 aile / 274 blok parçası ölçüldü. Cetvel o ölçümün kuralı | migration guard 3a/3b/3c (aynı PR, `20260918062422`) — **ek kol ALTYAPI BORCU, cetvel K8'de adıyla yazıyor:** yazma anındaki KAPI 5 (`scripts/icerik-hatti/aile-metni-yaz.mjs`) o şeridin dosyasıdır | KAL |
| bagimlilik-kararlari | Bağımlılık Sürüm Kararları — KAYIT: sabit pinlenmiş her bağımlılığın ve her `pnpm.overrides` girdisinin aralığı + gerekçesi. Belge değil, bir kapının VERİSİ | ALTYAPI | `src/__tests__/conformance/bagimlilik-karar-kaydi.test.ts` (INV-DEP-KARAR-1) dosyayı doğrudan okur · `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` §10 | 2026-09-19 yazıldı (REC-359, Recep ilkesi "izi olmalı takip edilebilmeli tetiklenebilmeli"). Evren o gün ölçüldü: 8 sabit pin + 22 override = 30 satır, 20'si BORÇ (react dörtlüsü ilk gün KARAR yazılmıştı, gerekçe çıkarım çıktı → BORÇ'a alındı). §6'da `pnpm outdated` ölçümü (63 eskiyen / 28 ana sürüm geride) | INV-DEP-KARAR-1 — sürüm değişip gerekçe güncellenmezse KIRMIZI; sabotajla doğrulandı (sürüm değişikliği ve kayıtsız yeni pin gerçek depoda denendi) | KAL |
| barindirma-standard | Barındırma Cetveli — v0.1 TASLAK (REC-367; sağlayıcı karar 59 bekliyor) | ALTYAPI | docs/README.md, Linear REC-367 | 2026-09-22 | yok | KAL |
| rehber-yazisi-standard | Rehber Yazısı Standardı — v0.3 TASLAK (REC-369, karar 62/92/93): bilgi yazısının konu seçimi (R1), kaynak hiyerarşisi ve görünür atıf (R2), kalıp (R3), yasaklar (R4), ajan doğrulaması + Recep'e özet sunum (R5), yer ve teknik şartlar (R6; yer Recep kararı bekliyor), yayın sonrası ölçüm (R7) | BLOG | `docs/README.md` (soru→dosya haritası), Linear REC-369 | 2026-09-24 yazıldı (F2). Doğuran olay: rakip bilgi yazısı 3 günde birinci sayfa; VentHub'da bilgi yazısı yok, Search Console'da bilgi sorgusu 2 gösterim | yok — R8 kapıları ilk yazı yayından önce kurulacak (cetvel "bugün hiçbir kapı yok" diye kendisi yazıyor) | KAL-KAPISIZ |
| pazar-olcum-standard | Pazar ve Arama Görünürlüğü Ölçüm Standardı — v0.1 TASLAK (REC-369, karar 93): sekiz ölçüm kolu (P1), varsayılan ücretsiz (P0), Search Console kuralları (P2), arama hacmi yalnız resmî API (P3), rakip sonuç sayfası otomatik izlenmez — şartlara aykırı (P4), haftalık takip biçimi (P5), depoya girmeyen veri (P6) | BLOG | `docs/README.md` (soru→dosya haritası), Linear REC-369 | 2026-09-24 yazıldı; Recep'in ücretli kaynağı reddi ve SERP şartları ölçümüyle doğdu | yok — haftalık koşu betikleşince ağsız kısmı `ci`'ye bağlanır (P7) | KAL-KAPISIZ |

---

## 4 · Özel satırlar

- **UnoPim PIM yığını (depo DIŞI: `C:/tmp/pim-unopim/`, compose projesi `pim-unopim`)** — durum **PİLOT**
  (REC-357, karar 35/36), sahip ALTYAPI. **Kalıcı servis ilanı:** 7 konteyner (`unopim` 3.1.1, queue,
  scheduler, postgres 16, redis 7.2, elasticsearch 8.17, mailpit) `restart: unless-stopped` — makine
  açılınca Docker ile birlikte kalkar. Portlar yalnız 127.0.0.1 (8000 yönetim, 8025 posta). Sırlar
  `C:/tmp/pim-unopim/.sirlar/` (git dışı). **Durdurma:** `cd C:/tmp/pim-unopim && docker compose -p
  pim-unopim down` (hacimler kalır). Lisans MIT. Plan + ölçüm: `docs/plans/rec357-katalog-pim-cozumu.md`.
  Karar 36 "hayır" çıkarsa `down -v` + dizin silinir. **API kullanıcısı (2026-09-22):** Entegrasyonlar'daki
  akışla `venthub-kopru` anahtarı (izin tipi `all`, pilot) — dört sır `.sirlar/api-anahtari.json`; §3.3
  köprüsü için yalnız okuma yetkili ayrı anahtar açılacak. Kurulum/aktarım betiği `scripts/pim/unopim.cjs`.

- **`tools/wrongstack-mcp/` — `wrongstack-sage` (çapalı hafıza) + `wrongstack-codebase-index`
  (kod dizini), MCP, `.mcp.json` ile proje kapsamında kayıtlı** — durum **KAL (PİLOT)**, sahip
  ALTYAPI. 2026-09-17 Recep onayı (OPS penceresi + ALTYAPI teyidi "evet kur"), kayıt REC-345 Kova C.
  Altı sınıfın hiçbirine girmiyor (MCP sunucusu) → bu bölümde. Kurulum lock commit'li,
  `npm ci --ignore-scripts`; kod dizini **salt-okuma**, `--writable` yalnız sage. Proje başına ayrık
  daemon pencere kapanınca ayakta kalır (**kalıcı servis ilanı**, durdurma yolu README'de). CodeGraph
  yerinde kalır; hangisinin kalacağı OPS'un 10 soruluk kıyasıyla. Kapı: `INV-WRONGSTACK-MCP-1`.
  **Bilinen uyumsuzluk, çalışıyor:** `undici@8.10.2` `node >=22.19.0` istiyor, makinede 22.16.0
  (ölçüldü: iki sunucu da el sıkışıp araç listesi döndü); Node yükseltmesi ayrı iş, şimdi değil.
  **Veri yeri (2026-09-17 düzeltildi, önceki satır yanlıştı):** sage verisi PROJE DİZİNİNDE
  (`.wrongstack/memories/sage.db` + `server.json` yerel yetki anahtarı) ve **git DIŞI tutulur**:
  `.gitignore` `.wrongstack/` (her derinlik) + INV-WRONGSTACK-MCP-1 kolu. Gerekçe: (1) ikili SQLite,
  üç pencere her yazımda değiştirir → git'te çakışır/şişer, diff okunmaz; (2) sır taraması ikili
  dosyanın içini göremez → hafızaya düşen sır/müşteri verisi kapıdan görünmeden geçer; (3) içerik
  PR gözünden geçmeden yazılır. Kod dizini `~/.wrongstack/projects/<ad-hash>/codebase-index/`;
  kimlik sürücü harfine duyarlı, kanonik `venthub-hvac-7e017f` (küçük `c:`), `1088d5` (büyük `C:`)
  yetim. **Açık ön şart:** sage.db hafıza yedeğine girmiyor — `memory_for_file` kancası PR'ından
  ÖNCE kapanır (REC-345 İŞ 5).
  **`wrongstack-mailbox` (2026-09-21, karar 54 — PİLOT):** pencereler arası kalıcı mesaj kutusu.
  `--writable`, `--admin` kapalı. Sahte kimliklerle ölçüldü: kapalı alıcıya mesaj duruyor, yanlış
  alıcıya düşmüyor. İlk kayıttaki `${CLAUDE_CODE_SESSION_ID}` pencerede GENİŞLEMEDİ (bütün pencereler
  aynı düz metin kimlik) → kimlik artık **`tools/wrongstack-mcp/posta-kutusu.cjs`** sarmalayıcısında
  çözülür (ortam değişkeni ya da ebeveyn oturum dosyası; yoksa kutu açılmaz). Ayrıntı README madde 8.
  Sarmalayıcı kökü de **kanonikleştirir** (ana ağaç + küçük sürücü harfi): `C:`/worktree ile açılan
  süreç ayrı bir kutuya (`…-1088d5`) düşüyordu, ölçüldü.
  Açılış sayacı: `scripts/hijyen/posta-kutusu-sayac.cjs` (betik tablosunda satırı var).

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
- **`graphify` 0.9.62** (`uv tool install "graphifyy[sql]"`) — **ARTIK KURULU, ENVANTER-DIŞI
  DEĞİL.** 2026-09-16'da Recep onayıyla projeye bağlandı (emir: `docs/plans/graphify-kurulum-emri-2026-09-16.md`,
  #1214). Aracın kendisi hâlâ dış araç (kullanıcı kapsamında, altı sınıfın hiçbirine girmiyor) ama
  **skill'i depoya girdi** → `.claude/skills/graphify/` satırı §3.3'te.
  **Bağlı adım (REC-313 hükmü, geçerli):** codegraph bayatlık uyarısı verdiğinde ya da
  paylaşılan-primitif riski ölçülecekken ikinci bağımsız kol — yalnız üç komut
  (`affected <ad>()`, `god-nodes`, `diagnose multigraph`). `query` **KULLANILMAZ** (5 soruda
  2 yanlış 2 eksik, sessiz yanlış üretir).
  ⚠**KURULUMUN YAZDIĞI METİN BU HÜKÜMLE ÇELİŞİYOR** (ölçüldü 2026-09-16): araç kök `CLAUDE.md`'ye
  *"For codebase questions, first run `graphify query`"* diye **on satır** yazdı. Yani bizim
  ölçtüğümüz "query kullanılmaz" kararının **tersini** öneriyor. Kalem açık, düzeltme Recep'in
  onayına bağlı (CLAUDE.md onun cetveli).
  ⚠**`affected` PARANTEZ GEREKTİRİYOR** (URUN ölçtü, hiçbir belgede yazılı değil):
  `productRoute` → *"No unique node match"*, `productRoute()` → doğru cevap.
  ⭐**SQL KÖRLÜĞÜ KAPANDI, KISMEN** (2026-09-16 ölçümü): `tree-sitter-sql` eksik olduğu için
  araç **251 `.sql` dosyasını hiç görmüyordu** (REC-313'ün "252 SQL dosyası görülmedi" bulgusunun
  sebebi buydu — kalıcı bir sınır değil, **eksik bağımlılık**). `uv tool install "graphifyy[sql]"`
  ile kapatıldı; grafik 9.122 → **10.410 düğüm**, 18.010 → **19.504 kenar**; 250 SQL dosyasından
  758 içerik düğümü. **AMA TAM DEĞİL:** taze tabandan **39 tablo** görüyor (canlıda 66) ve
  **163 politikanın 1'i**. Yani veritabanı haritası ihtiyacını **karşılamıyor**; o ihtiyacın
  karşılığı `docs/database_schema_master.md` + `supabase/baselines/2026-09-15_public_schema.sql`.
  **Son kullanım:** 2026-09-16 (kurulum + SQL ölçümü).
  **Kanıt:** `docs/audits/rec313-graphify-deneme-2026-09-13.md` (ilk ölçüm) ·
  `docs/plans/graphify-kurulum-emri-2026-09-16.md` (emir) · bu satır (kurulum ölçümü).
  Çıktı dizini `graphify-out/` üretilmiş artefakttır, `.gitignore`'da — **her makinede bir kez**
  `graphify extract . --code-only` koşulur, yoksa kancalar sessiz kalır (fail-open).
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
