# addyosmani/agent-skills ↔ bizim skill'ler: skill skill hüküm — 2026-10-26

Kart: YTN-20 (YETENEK panosu). Emir: OPS-183, karar 415. Yazan: YETENEK. **Hiçbir skill kurulmadı**, paket çalıştırılmadı.

## KAYNAK / CETVEL

- Karşılaştırılan kaynak: `github.com/addyosmani/agent-skills`, lisans **MIT** (repo düzeyinde doğrulandı; dosya başı lisans başlıkları okunmadı), `main` son commit 13 Ekim 2026 (plugin 0.6.13). `skills/` altında **25** skill, hepsinde `SKILL.md`.
- Okuma: 25 `SKILL.md` Haiku araştırmacıyla **baştan sona** okundu (24 satır özeti + dört öncelikli skill'in ayrı özeti). Alt klasör dosyaları (`references/`, `examples.md`, `idea-refine.sh`) ve repo kökündeki `agents/ commands/ hooks/ evals/` **okunmadı**.
- gstack: yeniden okunmadı; `gstack-skill-envanteri-2026-09-15.md` hükümleri kullanıldı (ilk ~60 satır sınırlı okuma; orada yazılı sınır geçerli).
- Önceki çalışma: addyosmani daha önce taranmadı (`rec352-dis-pratik-2026-09-16.md` §5 `supabase/agent-skills` deposudur, başka depo; `skills-dis-tarama-2026-10.md` onvoyage-ai, vudovn, jmagly ve mohitagw15856 depolarını taradı). Bizim skill karşılıkları ad ve tanım satırından eşlendi; **yan yana koşum yapılmadı**, "örtüşme" tahminidir (gstack envanterinin kıyas ölçütü: aynı iş iddiası yan yana koşumla kanıtlanır).
- Departman bağlantıları: `skill-departman-dagitimi-2026-10-26.md` (YTN-19, PR #2082) tablosu.

## 1. Sonuç

| Hüküm | Adet | Skill'ler |
|---|---|---|
| AL (olduğu gibi) | 0 | — |
| UYARLA | 2 | deprecation-and-migration, shipping-and-launch |
| BİZDEKİ KALSIN | 15 | idea-refine, interview-me, spec-driven-development, debugging-and-error-recovery, code-review-and-quality, constraint-driven-development, browser-testing-with-devtools, api-and-interface-design, frontend-ui-engineering, observability-and-instrumentation, performance-optimization, security-and-hardening, source-driven-development, test-driven-development, doubt-driven-development: bizde karşılığı var; yan yana koşum yapılmadan bizimki değiştirilmez, addyosmani'ninki eklenmez |
| GEREK YOK | 8 | using-agent-skills, planning-and-task-breakdown, incremental-implementation, documentation-and-adrs, code-simplification, context-engineering, ci-cd-and-automation, git-workflow-and-versioning (kurallarla çelişenler tabloda notlu) |

Toplam 0 + 2 + 15 + 8 = 25. Aşağıdaki skill skill tablo esastır.

## 2. Skill skill hüküm

Sütunlar: ad · bizdeki karşılığı (örtüşme tahmini) · hüküm · neden. Satır sayıları `SKILL.md`.

| # | Skill (satır) | Bizdeki karşılığı | Hüküm | Neden (tek cümle) |
|---|---|---|---|---|
| 1 | using-agent-skills (192) | yok; CLAUDE.md "Tek Giriş Haritası" ve skill listesi (kavramsal) | GEREK YOK | "Dokunma" ilkesi kural 14 (tam iş) ile gerilir; yönlendirme işini harita ve YÖNTEM satırı yapıyor. |
| 2 | idea-refine (193) | office-hours (yüksek) | BİZDEKİ KALSIN | Aynı "fikir değer mi" işi; bizimki tasarım notu üretir ve kartsız plan yazmaz. |
| 3 | interview-me (235) | office-hours (orta) | BİZDEKİ KALSIN | Tek soru ve tahmin döngüsü Recep'in karar-sorusu kalıbı (filo-ortak) olarak zaten yazılı. |
| 4 | spec-driven-development (259) | sdd (yüksek) | BİZDEKİ KALSIN | Kapı sırası aynı; `tasks/todo.md` varsayılanı Kanban'la çakışır. |
| 5 | planning-and-task-breakdown (257) | to-issues (yanlış eşleşme), wrongstack-kanban + `kart-plani-standard.md` | GEREK YOK | Görev listesi Kanban kartıdır ve kart planı cetveli (K1) bunu zorunlu kılar. |
| 6 | incremental-implementation (249) | board claim (şerit) ve planlama, doğrudan skill yok | GEREK YOK | Her dilimde commit ister; bizde commit yalnız istenince, kapsam şerit ve kart kanıtıyla yönetilir. |
| 7 | debugging-and-error-recovery (300) | debugging (yüksek), investigate (yüksek) | BİZDEKİ KALSIN | Aynı akış; bizde teşhis (investigate) ve düzeltme (debugging) ayrı skill. |
| 8 | **deprecation-and-migration (247)** | database-migrations (expand/backfill/validate/contract: yüksek); kod sökme ve tüketici sayımı için karşılık yok | **UYARLA** | Eski sistemi söküp geçirme (tüketici sayımı, advisory/compulsory, strangler, kullanım sıfırlanınca silme) bizde yazılı değil ve OPS-180 yeni site geçişinin tam işi. |
| 9 | documentation-and-adrs (297) | yok; `docs/standards` cetvelleri + karar defteri + `docs/README` | GEREK YOK | ADR konumu (`docs/decisions/`) bizim cetvel ve karar düzenimizle karışır; `docs/` kökü üretilmiş. |
| 10 | code-review-and-quality (398) | code-review (yüksek), diff-review, chimera | BİZDEKİ KALSIN | Filo kuralı önce yerleşik `/code-review`; etiket sistemi (Critical/Nit) bizde istenirse code-review'a eklenir. |
| 11 | code-simplification (331) | yerleşik `/simplify` (yüksek) | GEREK YOK | Filo-ortak "önce yerleşik" der; Chesterton çiti fikri `/simplify`'ın üstüne ayrı skill gerektirmez. |
| 12 | constraint-driven-development (311) | mutasyon-testi (orta), venthub-20-eksen-denetimi (düşük-orta) | BİZDEKİ KALSIN | Çok araç kurar (gitleaks, osv, Lighthouse) ve CLAUDE.md'ye satır ekler; ratchet ve "çıta gevşetme diffte yakalanır" fikri ARAÇ kancası olarak değerlendirilir (bkz. §4). |
| 13 | context-engineering (353) | yok; filo-ortak COMPACT kuralları ve durum dosyası | GEREK YOK | Hiyerarşi, %75 budama ve oturum yeniden başlatma bizde COMPACT YAKIN kuralı ve durum dosyasıyla zaten uygulanıyor. |
| 14 | browser-testing-with-devtools (317) | qa (orta-yüksek) | BİZDEKİ KALSIN | `npx -y chrome-devtools-mcp@latest` ağdan kurar ve `--autoConnect` gerçek profile bağlanır; tarayıcı kuralımız (HRT-61) uygulama içi tarayıcı ya da claude-in-chrome der. |
| 15 | ci-cd-and-automation (390) | yok (CI kuralları CLAUDE.md + ALTYAPI cetvelleri) | GEREK YOK | Örnekleri npm/Vercel token/GitHub Actions; public repo, self-hosted runner yasağı ve `supabase-migrate.yml` akışımızla uyuşmaz. |
| 16 | api-and-interface-design (367) | api-design (yüksek) | BİZDEKİ KALSIN | Idempotency-Key üç sonuç ve hata biçimi aynı kapsamda; ödeme alanı `pricing-standard`'a bağlı kalır. |
| 17 | frontend-ui-engineering (340) | ui-ux-pro-max, web-design-guidelines, react-modern, venthub-tasarim-dili (orta) | BİZDEKİ KALSIN | React Query/Zustand örnekleri RSC + Supabase mimarisine uymaz; token ve `focus-visible` kuralları bizde yazılı. |
| 18 | git-workflow-and-versioning (355) | git-flow, git-commit (yüksek) | GEREK YOK | "Erken commit" kuralımızla çelişir, `git reset --hard` save-point'i yıkıcı komut kuralına (git-flow) ters; worktree kısmı CLAUDE.md'de var. |
| 19 | observability-and-instrumentation (238) | observability (yüksek) | BİZDEKİ KALSIN | "Giriş noktası alanı" (cron, webhook, Edge) fikri observability skill'ine ek madde olarak değerlendirilebilir, ayrı skill gerekmez. |
| 20 | performance-optimization (267) | web-performance (yüksek) | BİZDEKİ KALSIN | Cache anahtarında tenant+lang şartı kural 12 olarak zaten yazılı; "nötr değişiklik geri alınır" disiplini rendering-cache cetveline not edilebilir. |
| 21 | security-and-hardening (216) | security-scanner (yüksek), supabase-security, payments-webhooks, `security-reviewer` ajanı | BİZDEKİ KALSIN | STRIDE ve sınır katmanları var, ama ödeme/auth/RLS/webhook için ayrı ajanımız ve skill'lerimiz bu işi yapıyor. |
| 22 | **shipping-and-launch (336)** | yok genel şablon; yayına özel `docs/plans/yayin-gunu-runbook-2026-10-11.md` (19 Ekim yayını) | **UYARLA** | Runbook tek yayına özel; kademeli yayın + hata eşiği tablosu + rollback şablonu + hata bütçesi kapısı yeni site yayını (OPS-180) için genel bir şablon olarak eksik. |
| 23 | source-driven-development (216) | research-web (orta-yüksek), tech-stack (orta) | BİZDEKİ KALSIN | Sürüm doğrulama ve "UNVERIFIED" etiketi research-web ve tech-stack kapsamında; ağ çağrısı yapar, ek skill gerektirmez. |
| 24 | test-driven-development (398) | testing (yüksek), mutasyon-testi | BİZDEKİ KALSIN | Tam paket koşusu ister; bizde yerelde yalnız `pnpm test:ilgili`, tam paket CI'da (filo-ortak). |
| 25 | doubt-driven-development (özet ayrı) | `*-curutucu` alt ajanları, plan-challenger, llm-council (orta-yüksek) | BİZDEKİ KALSIN | Taze bağlamlı çürütme, çürütücü alt ajanın tarifidir; CLAIM / ARTIFACT / CONTRACT ayrımı ve 3 tur sınırı ajan görev metnine fikir olarak eklenebilir (§4). |

## 3. UYARLA çıkanlar: hangi departman listesine girer

Departman listeleri `skill-departman-dagitimi-2026-10-26.md` (YTN-19) tablosundan. **Kurulum yok;** uyarlama ayrı kartla ve ayrı PR'la (`.claude/skills/**` değişikliği), OPS onayıyla.

| Skill | Uyarlanacak parça | Hangi listeye | Hangi kademede |
|---|---|---|---|
| deprecation-and-migration | Tüketici sayımı, advisory/compulsory kararı, strangler/adapter/flag, "kullanım sıfır olmadan silme"; şema kısmı database-migrations'a atıf (çift kaynak olmaz). Uyarlamada: `tested down` şartı kural 13 ile birlikte karara bağlanır (prod'a otomatik giden migration'da geri alma yolu). | ALTYAPI, OPS (OPS-180 geçişi sürerken); gerekirse URUN | **Adıyla** (YTN-19'da bu skill henüz yok; eklenince ALTYAPI ve OPS'un "adıyla" listesine girer) |
| shipping-and-launch | Kontrol listesi iskeleti, kademeli yayın eşik tablosu (hata 2x, p95 +%50 ise geri al), rollback planı şablonu, hata bütçesi kapısı. Vercel/flag varsayımları bizim runbook ve `ADRES_SEMASI_K3B` bayrak pratiğine göre yeniden yazılır. | ALTYAPI, OPS | **Adıyla** |

Bayatlama: yeni site yayınının takvimi belli olunca (OPS-180) uyarlama kartı açılır; o zamana kadar bu iki satır öneridir.

## 4. Skill olmayan fikirler (kart önerisi, bu PR'a girmez)

- **Çıta gevşetme tespiti** (constraint-driven-development): diffte test silme, eşik düşürme, suppression ekleme yakalansın. Bizde bu kapıların hangisinin bugün kancayla mevcut olduğu **ölçülmedi**; ARAÇ'a tek mesajla sorulur, mevcut kapı varsa kart açılmaz.
- **Çürütücü görev metni** (doubt-driven-development): iddia verilmeden yalnız ARTIFACT + CONTRACT, bulgu sınıflandırması (yanlış okuma / geçerli / ödünleşim / gürültü), en çok 3 tur. HARİTA'nın ajan tanımı üreticisine (`*-curutucu`) madde olarak önerilir.
- **Giriş noktası alanı** (observability): cron/webhook/Edge log alanı; observability skill'ine tek madde.

## 5. Ölçülmeyenler

- Bizim skill gövdeleri bu turda açılmadı; "bizdeki karşılık" ve örtüşme tahminleri **ad ve tanım satırına** dayanır. "Yüksek örtüşme" yan yana koşumla kanıtlanmadı; bu yüzden hiçbir bizim skill'in **yerine** addyosmani konmadı, yalnız eksik olan iki alan UYARLA'ya girdi.
- Hiçbir addyosmani skill'i çalıştırılmadı; "işe yarar/yaramaz" yargısı yok, yalnız metin uyumu.
- Repo kökündeki `hooks/`, `agents/`, `evals/` ve skill alt klasör dosyaları okunmadı.
- addyosmani'nin yönergeleri model talimatı olarak yazılmıştır; bu belgedeki alıntılar özet, talimat değil. Kurulacak olursa güvenlik ve lisans taraması ayrı onaydır (`skills-dis-tarama` kuralı).
