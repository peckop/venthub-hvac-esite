# REC-333 — `ai-auto-repair.yml` Zinciri ÖLÇÜM Raporu (2026-09-14)

> Ölçüm tarihi: 2026-09-14. Ölçen: ALTYAPI şeridi alt-ajanı, dal `altyapi/rec333-ai-auto-repair`.
> Kaynak: `gh workflow list --all`, `gh run list --workflow=ai-auto-repair.yml --limit 200 --json conclusion,createdAt,databaseId,headBranch`,
> `gh run view <id> --json jobs`, `gh run view <id> --log-failed`, `gh pr list --search "Auto-Repair in:title" --state all`,
> `gh pr view <n> --json state,mergedAt`, `gh api repos/.../actions/workflows`, `git ls-remote --heads origin`,
> `grep -rn -i "auto-repair|auto_repair" .github/workflows/`. Önceki ölçüm referansı: `docs/audits/rec327-workflow-envanteri-2026-09-14.md`
> (REC-327, PR #1185) — o iş `ai-auto-repair.yml`'i "adı `jules-*` desenine uymuyor" gerekçesiyle
> bilerek kapsam dışı bıraktı; bu rapor o boşluğu kapatır.

## 1. Dosya ne yapıyordu

`.github/workflows/ai-auto-repair.yml` (silinmeden önce): `workflow_run` tetikleyicisiyle
`CI` workflow'unun tamamlanmasını dinliyordu. `if:` koşulu iki şeyi birden istiyordu:
(1) tetikleyen CI koşumunun sonucu `failure`, (2) `head_repository` fork değil (aynı repo).
Koşul sağlanınca: hatalı branch'i checkout ediyor, CI'ın yüklediği `ci-logs` artefaktını
indiriyor (`ci-lint.log`, `ci-typecheck.log`, `ci-deno.log`, `ci-test.log`, `ci-build.log`),
hata satırlarını (`error|warning|failed|cannot find|is not|does not` deseniyle) tek bir
özet dosyasında birleştiriyor, sonra `google-labs-code/jules-action@v1.0.0` ile
Google Jules'a bu özeti ve sıkı sınırlar içeren bir onarım talimatı gönderiyordu (`secrets.JULES_API_KEY`
kullanılarak). Jules başarılı olursa "🤖 Auto-Repair: ..." başlıklı bir PR açması bekleniyordu.
`permissions:` bloğu `contents: write`, `pull-requests: write`, `actions: read` idi.

## 2. GitHub durumu ve koşum geçmişi

- `gh workflow list --all` → state **`disabled_manually`** (silinmeden hemen önce ölçüldü).
- `gh api .../actions/workflows` → `created_at: 2026-03-18T15:06:22+03:00`, `updated_at (=disable anı): 2026-09-02T10:02:15+03:00`.
- Son 200 koşum (`gh run list --limit 200`, en eskisi 2026-08-27'ye kadar geri gidiyor —
  daha eski koşumlar için `--limit` yükseltilmedi, aşağıda "ölçülemedi" olarak işaretli):
  **181 `skipped`** (CI koşumu `failure` DEĞİLDİ — repair job'ın `if:` koşulu false, çalışmadı)
  + **19 gerçek koşum** (job'ın `if:` koşulu TRUE oldu, iş fiilen çalıştı): **9 `success`, 10 `failure`**
  (`master` dalında, 2026-08-27T19:29 ile 2026-09-01T12:37 arası).
- **"Hiç koşmamış" DEĞİL** — dosya en az 2026-03'ten (ilk PR #272, 2026-04-20) beri fiilen
  Jules'a görev gönderiyordu; ölçülen pencerede tek başına 19 gerçek tetiklenme var.
- Bir başarısız koşumun (`33508673475`, 2026-09-01T12:37) logu incelendi: adım gerçekten
  Jules'a görev gönderdi ve bir `jules-15564047404980098940-f9da994d-1` dalı yarattı
  (uzak depoda hâlâ duruyor — `git ls-remote --heads origin` ile doğrulandı), ardından
  `##[error]Process completed with exit code 126` ile düştü (jules-action'ın kendi
  içindeki bir adım container/exec hatası verdi — jules-action'ın iç mekaniği bu raporun
  ölçüm kapsamı dışında, **ölçülemedi**).
- Devre dışı bırakılma anından (2026-09-02T10:02) sonra hiç koşum yok (disabled workflow
  `workflow_run` tetiğine bile yanıt vermiyor).

## 3. Zincir tablosu

| Taraf | Dosya · adım | Durum |
|---|---|---|
| **Üreten** | `ci.yml` → "Upload CI Logs on Failure" adımı, `if: failure()`, `actions/upload-artifact@v4`, `name: ci-logs` | CI kırmızı her koşumda ÇALIŞIYORDU (silinene kadar) |
| **Okuyan** | `ai-auto-repair.yml` → "CI log artefaktını indir" adımı, `actions/download-artifact@v4`, `name: ci-logs` | `disabled_manually` — okuyucu YOK |
| **Dış servis** | Google Jules (`google-labs-code/jules-action@v1.0.0`, `secrets.JULES_API_KEY`) | Erişilebilir (secret tanımlı, `gh secret list` ile doğrulandı — DEĞER okunmadı), ama artık çağrılmıyor |
| **Düz metin referans** | `ci.yml:104` yorum ("ai-auto-repair") ve `ci.yml:201` yorum ("ai-auto-repair.yml bu artefaktı okuyarak Jules'a iletir") | Ölü zinciri hâlâ canlı gösteriyordu — bu PR'da düzeltildi |

**Aranan dört kalıp, ayrı ayrı:**
- `workflow_run` tetiği: yalnız `ai-auto-repair.yml` içinde (CI'ı dinliyordu) — kaldırılan dosyayla birlikte gitti.
- `upload-artifact` / `download-artifact` ad eşleşmesi (`ci-logs`): `grep -rln "ci-logs" .github/workflows/` → yalnız `ci.yml` (üreten) ve `ai-auto-repair.yml` (okuyan, artık yok). Başka hiçbir workflow bu artefaktı okumuyor.
- `workflow_call`: `ai-auto-repair.yml` bu deseni kullanmıyordu (kendi başına tetiklenen bir workflow'du, reusable değildi).
- Betiklerden `gh workflow run ai-auto-repair.yml` çağrısı: `grep -rn -i "auto-repair|auto_repair"` tüm depoda tarandı — `.github/workflows/ci.yml` (2 yorum satırı, düzeltildi), bu iki rapor dosyası ve `docs/audits/rec327-workflow-envanteri-2026-09-14.md` dışında betik/kod referansı bulunamadı.

**Boşa koşan taraf ölçüldü:** `ci.yml`'in `ci-logs` artefaktını üreten "Upload CI Logs on
Failure" adımı, `ai-auto-repair.yml` `disabled_manually` olduğu 2026-09-02'den bu PR'a kadar
her CI kırmızısında (lint/typecheck/deno/test/build loglarını 3 gün saklayarak) sıfır
tüketiciye yüklenmiş bir artefakt üretiyordu. Bu PR'da adım kaldırıldı.

## 4. Hüküm: EMEKLİ (kaldırıldı)

Gerekçe:
1. **Sıfır kabul oranı, geniş örneklem üzerinden:** dosya 2026-03-18'den beri var; oluşturduğu
   "🤖 Auto-Repair" başlıklı PR'lardan 10 tanesi örneklendi (`gh pr list --search "Auto-Repair in:title" --state all`,
   #272, #315, #643, #689, #818, #833, #841, #845, #919, #935) — **10/10 CLOSED, `mergedAt: null`
   (0/10 merge)**. Aralık 2026-04-20 ile 2026-09-01 arası, yani 4.5 aylık gerçek üretim verisi.
2. **Zaten elle kapatılmış** (GitHub `disabled_manually`, 2026-09-02) — Recep/ekip bunu
   REC-327'den önce, bağımsız olarak durdurmuş; bu rapor o kararı doğruluyor, çelişmiyor.
3. **Boşa koşan üretim maliyeti vardı:** `ci.yml` her kırmızıda 5 log dosyasını artefakt
   olarak yüklüyordu ama okuyacak kimse yoktu — küçük ama gerçek ve sürekli bir israf.
4. **KAL/ONAR seçeneklerinin gerekçesi çürüdü:** KAL "bir gün açılacak, uykuda" varsayımını
   gerektirir — ama açık kalsa bile 0/10 kabul oranı "açılınca işe yarayacak" varsayımını
   desteklemiyor. ONAR "zincir kırık, düzeltilmeli" varsayımını gerektirir — ama zincir
   KIRIK değildi, fiilen çalışıyordu (Jules'a görev gitti, dallar/PR'lar açıldı); asıl sorun
   ürettiği PR'ların hiçbirinin ekip tarafından kabul edilmemiş olması — bu bir CI/entegrasyon
   arızası değil, aracın kendisinin değer üretmediğinin ölçümü.

## 5. Yapılan değişiklik

- `.github/workflows/ai-auto-repair.yml` **silindi**.
- `.github/workflows/ci.yml`:
  - "Upload CI Logs on Failure" adımı (okuyucusu kalmadığı için) kaldırıldı.
  - `fetch-depth: 0` gerekçe yorumundaki "ai-auto-repair" listesi satırından çıkarıldı
    (`deploy-functions.yml` ve `rls-guard.yml` hâlâ tam geçmiş istiyor, o kısım DURUYOR).
- `docs/audits/rec327-workflow-envanteri-2026-09-14.md`: `ai-auto-repair.yml` satırı ve
  ilgili özet/kapsam notu paragrafları, bu kaldırmayı yansıtacak şekilde güncellendi.

## 6. Koşulmayan / ölçülemeyen

- **jules-action'ın iç mekaniği** (`exit code 126`'nın kök sebebi — container mı, Jules API
  tarafı mı) — bu raporun kapsamı dışı, zaten kaldırılan bir bileşen olduğu için araştırılmadı.
- **19 gerçek koşumdan öncesi** (2026-03-18 – 2026-08-27 arası) — `gh run list` limiti
  200 koşumla en eskiye 2026-08-27'de ulaştı; bu tarihten önceki gerçek/skipped dağılımı
  ölçülmedi (yalnız PR örneklemi üzerinden, o dönemden #272/#315/#643/#689/#818/#833 PR'ları
  var ve hepsi merge edilmemiş — dolaylı kanıt).
- **`docs/audits/arac-envanteri-2026-09-07.md`** — bu envanter dosyasına bu iş emri
  kapsamında dokunulmadı (talimat gereği); orada da `ai-auto-repair.yml` satırı varsa
  **güncellenmesi gerekiyor** — mekanik güncelleme sahibi ayrı.
- **`JULES_API_KEY` secret'ının canlı geçerliliği** — `gh secret list` yalnız tanımlı
  olduğunu gösterdi (`${#VAR}` tipi bir doğrulama CI dışında mümkün değil); değeri
  hiçbir yere yazılmadı, canlı API çağrısı da yapılmadı.

## 7. Kapı sonucu

`pnpm test -- --run src/__tests__/conformance/` — Test Files / Tests sayıları görev
raporunda verildi (bu dosyaya tekrar yazılmadı; kapı sayısı raporun parçası, PR gövdesinde de var).
