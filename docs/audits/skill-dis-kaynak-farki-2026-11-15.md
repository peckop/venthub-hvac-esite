# Dış kaynak farkı ve açık kart ölçümü — 15 Kasım 2026 (YTN-56)

Kart: YTN-56 (YETENEK). İstek: OPS, 15 Kasım. **Hiçbir skill değiştirilmedi**; yalnız fark ve öneri. Skill değişikliği ancak skill-creator ile ve Türkçe tetik sınavıyla yapılır.

## KAYNAK / CETVEL

- Cetvel: `docs/standards/arac-envanteri-standard.md` (dış araç dört kapısı), `docs/audits/skill-kaynak-karsilastirmasi-2026-10-26.md` (YTN-20 hükümleri, agent-skills 13 Ekim durumu).
- Ölçüm: iki salt-okuma okuyucu (Sonnet) + müdür doğrulaması. Doğrulanan: GitHub compare `f3400940…main` = 148 commit, 112 dosya, **21 skill klasörü** (haberdeki 11 sayısı bir alt küme); yerel kaynak satırları `git grep` ile.
- Önceki çalışma: YTN-20 (26 Ekim), YTN-21, YTN-24 ek alımları (#2167), `seo-claude-seo-kullanim-2026-11-03.md`.

## 1. agent-skills (addyosmani, MIT)

Bizde 14 yerel skill bu kaynağa dayanıyor (kaynak SHA'ları `f3400940…` ve `8bfcc1f9…`). Okuyucu dört skill için GÜNCELLE önerdi; müdür doğrulaması ikisini düşürdü.

| Kaynak skill | Yerel karşılık | Değişiklik | Hüküm |
|---|---|---|---|
| spec-driven-development | sdd | "Out of Scope (Deferred)" bölümü ve yayın sonrası "Spec Delta" şablonu; yerelde ikisi de yok (grep boş) | **GÜNCELLE** |
| code-review-and-quality | code-review | bulguyu raporlamadan önce koruma ve testlere karşı doğrula, eski kusuru regresyondan ayır, sıfır bulgu geçerli sonuç; yerelde "sıfır bulgu" yok (grep boş) | **GÜNCELLE** (açıklamadaki tetik cümlesi değişirse sınav gerekir) |
| doubt-driven-development | plan-challenger | "gerekçeyi çıkar, kanıtı çıkarma" cümlesi | GEREK YOK: yerelde zaten var (SKILL.md:189) |
| test-driven-development | testing | çökme ve rollback gerçek sınırda sınanır | GEREK YOK: yerelde zaten var (SKILL.md:222) |
| debugging-and-error-recovery | debugging | açıklamaya tetik cümlesi, `--testPathPattern` düzeltmesi | İZLE |
| constraint-driven-development | diff-review | gitleaks `dir`, `quality-gate.mjs`, "her kapıyı bilinçli ihlalle dene" | İZLE |
| api-and-interface-design | api-design | idempotency 422 gövde biçimi | İZLE (etki küçük) |
| frontend-ui-engineering | react-modern, ui-ux-pro-max | APG deseni, `role="status"` | İZLE |
| browser-testing-with-devtools | qa | font ve yeniden boyutlandırma sonrası ölçüm | İZLE |
| deprecation-and-migration, idea-refine, performance-optimization, shipping-and-launch | database-migrations, office-hours, web-performance, observability | yalnız kod örneği, betik yolu, paket adı, tip düzeltmesi | GEREK YOK |

Bizde karşılığı olmayan ya da "bizdeki kalsın" hükmü taşıyan değişenler (ci-cd-and-automation, code-simplification, context-engineering, documentation-and-adrs, git-workflow-and-versioning, planning-and-task-breakdown, security-and-hardening, source-driven-development): yeni alım adayı yok, skill yükü bütçesi kararı gerekmez. incremental-implementation ve observability'nin kaynakları değişmemiş.

**Öneri:** `sdd` ve `code-review` için iki küçük ek, skill-creator ile, tek PR; bütçe payı 0 bayt (gövde değişikliği oturum yükünü etkilemez, açıklamaya dokunulmazsa). Karar OPS'ta.

## 2. claude-seo (AgriciDaniel, MIT) 2.5.0 → 2.6.2

Bizde dayanan yerler: `seo-olcum` (satır 24, `claude-seo:seo-geo` ajanı), `seo-claude-seo-kullanim-2026-11-03.md`. Release notları (2.5.1, 2.6.0, 2.6.1, 2.6.2) okundu; yeni sayfa kontrolleri ve TLS betikleri Python ortamı ister ve ortam kurulu değil (`doctor` ready:false); güvenlik ve proxy değişiklikleri kullanmadığımız komutlara ait. `seo-geo` gövdesinde dosya düzeyi fark: **ölçülemedi** (yalnız release notları). **Hüküm: İZLE**, yükseltme zorunlu değil; yükseltilirse sonra `scripts/claude-seo doctor` bir kez koşulur ve audit dosyasındaki "2.5.0" satırı güncellenir.

## 3. Açık kartların bugünkü iki hatta uygunluğu

| Kart | Yeni site hattı | OPS-287 | Hüküm |
|---|---|---|---|
| YTN-48 WhatsApp sohbet skill'i | hayır | dolaylı (WhatsApp ikinci dilim) | rafta kalır: OPS-235 donduruyor |
| YTN-41 bağlamlı tetik ölçümü | dolaylı | dolaylı | rafta kalır: gerçek cümle kaynağı yok |
| YTN-47 müdür çekirdeği ölçümü | hayır | hayır | 4 Aralık ölçümü, değişmez |
| YTN-49, YTN-52 | hayır | hayır | iş bitti, kart kapanışı |
| YTN-39 | iptal | iptal | Recep kararı, dokunulmaz |

Hiçbir açık YETENEK kartı iki hatta doğrudan hizmet etmiyor; YETENEK katkısı önceden yapıldı (YTN-24 göç ve yayın bölümleri, YTN-53 ve YTN-55).

### Hat haritası (iş türü → skill)

| Hat | İş türü | Skill |
|---|---|---|
| Yeni site (OPS-180) | göç planı | refactor-planner |
| | şema ve veri göçü | database-migrations, create-migration |
| | RLS ve yetki | supabase-security, supabase |
| | kod göçü | incremental-implementation (+ maestro) |
| | plan çürütme, inceleme | plan-challenger, diff-review |
| | tasarım ölçümü, panel gezinme | venthub-tasarim-dili, panel-gezinme |
| | yayın, geri alma, performans | observability, web-performance |
| OPS-287 ürün asistanı | fikir ve en dar dilim | office-hours |
| | güvenlik ve kapsam çürütme | plan-challenger |
| | model, fiyat, önbellek | claude-api (platform skill'i, depoda yok) |
| | sistem istemi, konu dışı ret | prompt-engineering |
| | KVKK, saklama | data-governance |
| | uç nokta, hata sözleşmesi, istek sınırı | api-design |

**Boşluklar (skill değil ek bölüm düzeyinde):** UnoPIM veri hattı için hiçbir skill'de ifade yok (grep boş); katalog cetveline atıf ya da `database-migrations`'a "dış kaynaktan CSV içe aktarma" bölümü yeter. Müşteriye açık LLM asistanı güvenlik ve kapsam cetveli: skill değil cetvel işi (OPS-287 kartı da böyle diyor); yazılırken `prompt-engineering`'e kısa bir "müşteri yüzü asistan" bölümü eklenebilir. **Ölçülemedi:** ÜRÜN, ALTYAPI ve TASARIM panolarındaki ek kartlar; `prompt-engineering` içinde enjeksiyon ve konu dışı ret bölümü olup olmadığı.
