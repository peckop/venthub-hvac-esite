# Departman penceresi başına skill dağıtımı (açık / adıyla / kapalı) — 2026-10-26

Kart: YTN-19 (YETENEK panosu). Emir: OPS-181 madde 3 (OPS-124 ve karar 349'un devamı). Yazan: YETENEK.
Uygulayan: OPS (her pencerenin `.claude/settings.local.json` dosyasında `skillOverrides` + `enabledPlugins`). YETENEK
ayar dosyalarına dokunmaz. Makine okunur liste: `skill-departman-dagitimi-2026-10-26.json` (aynı klasör).

## KAYNAK / CETVEL

- Önceki ölçüm (üstüne kuruldu, yeniden yapılmadı): `skill-departman-setleri-2026-09-30.md` + `.json` (çalışan setleri,
  `mudurCekirdegi`), `skill-ihtiyac-raporu-2026-09-30.md`, `skill-calisan-yukleme-olcumu-2026-10-01.md`,
  `skill-wrongstack-1-1-0-tasima-2026-10-12.md` (YTN-18, 12 Ekim ilk dalga altı skill), `skills-dis-tarama-2026-10.md`,
  `skill-yuku-2026-09-12.md`.
- Yöntem cetveli: `docs/standards/execution-method-standard.md`. Ayar anahtarları: OPS-124 (`skillOverrides` değerleri
  `off` / `name-only`; eklenti skill'i `skillOverrides` ile kapanmaz, `enabledPlugins` ile kapanır).
- Tazelik: ölçümler 26 Ekim akşamı; liste skill eklenince ya da departman yeni iş türü alınca bayatlar.

## 1. Blog pilotunun sonucu (13 Ekim'den bu yana)

| Ölçüt | Önceki ölçüm (OPS-124, 13 Ekim) | Bugünkü fark (26 Ekim) |
|---|---|---|
| Blog ayar dosyası | 119 skill kaydı (16 adıyla, 103 kapalı) + 10 eklenti kapalı | Aynı; dosya son değişim 14 Ekim 12:05 (353/355 yedeği de 119 kayıt) |
| Kapalı skill'e erişim denemesi | — | 0 (Blog dökümleri, tekil araç çağrısı) |
| "Unknown skill" türü hata | — | 0 |
| Recep'in "skill görünmüyor" şikâyeti | — | 0 |
| Blog'un Skill çağrıları | 1-13 Ekim: 0 | 13 Ekim sonrası 3 tekil (write-seo-geo-content, rehber-yayin, artifact-design); üçü de açık listede |
| Blog işi | 13 Ekim'e kadar 3 kart Done | 13 Ekim sonrası 7 kart Done (BLG-11, 12, 13, 15, 16, 17, 18), 11 commit |
| Skill listesi yükü (`/context`) | Önce 229 ad, 175 açıklamalı | Sonrası **ölçülmedi** (dökümde `/context` çıktısı yok) |

**Hüküm: zarar görülmedi, kazanç ölçülmedi.** Daraltma Blog'un kullandığı hiçbir skill'e dokunmadı ve iş akmaya devam
etti; ama listenin ne kadar küçüldüğü sayılmadı. Yaygınlaştırmaya engel yok; kazanç ilk uygulanan pencerede `/context`
"Skills" satırıyla önce/sonra ölçülür (OPS, uygulama anında).

Ek ölçüm (bütün müdür pencereleri, 13 Ekim sonrası `Skill` aracı çağrısı, alt ajan dökümleri dahil): Blog 12, Katalog 5
(research-web, artifact-design, built-in-browser), ARAÇ, ALTYAPI, HARİTA, ÜRÜN, GEO-SEO ve OPS **0**. Müdür pencereleri
skill'i neredeyse hiç kendiliğinden çağırmıyor; listenin büyük kısmı her açılışta taşınan yük.

## 2. Kural (bu dağıtım nasıl çıkarıldı)

1. **Açık** (ad + açıklama listede, kendiliğinden tetiklenir): dört ortak çekirdek (`wrongstack-kanban`,
   `wrongstack-mailbox-mcp`, `verify-before-done`, `plan-challenger`) + departmanın 13 Ekim sonrası gerçekten çağırdığı ya
   da rol kartındaki ana işini tetikleyen skill. Kullanılan skill hiçbir zaman kapatılmaz.
2. **Adıyla** (`name-only`: ad görünür, açıklama düşer, adıyla çağrılır): 30 Eylül çalışan setlerindeki her skill
   (ön yükle + adıyla çağır), `mudurCekirdegi` satırları, Blog pilotunun ortak adıyla listesi (codegraph,
   codebase-navigation, notebook-navigator, office-hours, professional-communication, task-observer) ve departmana özel
   nadir işler. Çalışan tanımındaki `skills:` ön yüklemesi adla çalışır (30 Eylül ölçümü: açıklaması görünmeyen skill adla
   çağrılabildi); ama pencere düzeyindeki `off`'un çalışana etkisi **ölçülmedi**, bu yüzden set skill'i `off`'a konmadı.
3. **Kapalı** (`off`): evrenin kalanı. Evren = proje skill'leri (70) + kullanıcı skill'leri (58) = 128 ad (skill adı
   SKILL.md `name:` alanından; klasör adı farklı olabilir: `redesign-skill` → `redesign-existing-projects`).
4. **Blog satırı** 13 Ekim pilot dosyasından aynen okundu; değişiklik önerilmiyor.
5. Eklenti skill'leri bu tablonun dışında: OPS her pencerede Blog'daki 10 eklentilik `enabledPlugins: false` kalıbını
   uygular, departmanın kullandığı eklenti açık kalır (GEO-SEO: searchfit-seo ve programmatic-seo; KATALOG ve Blog:
   artifact-design yerleşiktir, eklenti değildir).

## 3. Dağıtım

| Departman | Açık | Adıyla | Kapalı | Açık liste | Adıyla liste |
|---|---|---|---|---|---|
| ARAÇ | 5 | 25 | 98 | codegraph, plan-challenger, verify-before-done, wrongstack-kanban, wrongstack-mailbox-mcp | agy-orchestrate, bug-hunter, chimera, claude-api, code-review, codebase-navigation, git-commit, git-flow, investigate, maestro, mcp-builder, mnemosyne, multi-agent, mutasyon-testi, notebook-navigator, office-hours, professional-communication, prompt-engineering, refactor-planner, research-web, sdd, security-scanner, skills-creator, task-observer, tech-stack |
| ALTYAPI | 4 | 32 | 92 | plan-challenger, verify-before-done, wrongstack-kanban, wrongstack-mailbox-mcp | agy-orchestrate, bug-hunter, chimera, code-review, codebase-navigation, codegraph, create-migration, data-governance, database-migrations, debugging, fallow, git-commit, git-flow, investigate, maestro, multi-agent, mutasyon-testi, node-modern, notebook-navigator, observability, office-hours, professional-communication, refactor-planner, research-web, sdd, security-check, security-scanner, supabase-security, task-observer, tech-stack, testing, venthub-20-eksen-denetimi |
| HARİTA | 6 | 16 | 106 | codegraph, graphify, plan-challenger, verify-before-done, wrongstack-kanban, wrongstack-mailbox-mcp | agy-orchestrate, codebase-navigation, document-generate, git-commit, git-flow, maestro, multi-agent, notebook-navigator, notebooklm-sync, office-hours, orion-cli, professional-communication, prompt-engineering, refactor-planner, sdd, task-observer |
| ÜRÜN | 7 | 35 | 86 | i18n-conventions, plan-challenger, qa, venthub-tasarim-dili, verify-before-done, wrongstack-kanban, wrongstack-mailbox-mcp | accessibility, benchmark, bug-hunter, canary, chimera, code-review, codebase-navigation, codegraph, debugging, design-review, git-commit, git-flow, investigate, maestro, multi-agent, mutasyon-testi, notebook-navigator, observability, office-hours, professional-communication, react-modern, refactor-planner, sdd, supabase-security, task-observer, testing, threejs-webgl-performance, typescript-strict, venthub-architecture, vercel-composition-patterns, vercel-react-best-practices, web-design-guidelines, web-performance, web-platform-baseline, webapp-testing |
| KATALOG | 6 | 21 | 101 | plan-challenger, research-web, verify-before-done, wrongstack-kanban, wrongstack-mailbox-mcp, xlsx | bug-hunter, chimera, code-review, codebase-navigation, codegraph, docx, git-commit, git-flow, maestro, make-pdf, multi-agent, mutasyon-testi, notebook-navigator, office-hours, pdf, professional-communication, refactor-planner, sdd, supabase, supabase-security, task-observer |
| GEO-SEO | 7 | 20 | 101 | plan-challenger, rehber-yayin, search-console, verify-before-done, write-seo-geo-content, wrongstack-kanban, wrongstack-mailbox-mcp | accessibility, bug-hunter, chimera, code-review, codebase-navigation, codegraph, geo-fundamentals, git-commit, git-flow, multi-agent, notebook-navigator, office-hours, performance, professional-communication, qa, research-web, seo-ecommerce, task-observer, web-performance, web-platform-baseline |
| BLOG (pilot, aynen) | 9 | 16 | 103 | geo-fundamentals, plan-challenger, rehber-yayin, research-web, search-console, verify-before-done, write-seo-geo-content, wrongstack-kanban, wrongstack-mailbox-mcp | code-review, codebase-navigation, codegraph, diagram, git-flow, multi-agent, notebook-navigator, office-hours, pdf, professional-communication, seo-ecommerce, task-observer, typography, venthub-architecture, venthub-tasarim-dili, video-kaynak |
| OPS | 6 | 16 | 106 | office-hours, plan-challenger, venthub-tasarim-dili, verify-before-done, wrongstack-kanban, wrongstack-mailbox-mcp | codebase-navigation, codegraph, git-commit, git-flow, llm-council, multi-agent, notebook-navigator, notebooklm-sync, plan-ceo-review, professional-communication, prompt-engineering, sdd, task-observer, to-prd, venthub-20-eksen-denetimi, video-kaynak |

Kapalı listenin tamamı JSON dosyasında (`departman.<AD>.kapali`); OPS ayar dosyasına oradan yazar.

Departmana özel seçimlerin gerekçesi (önceki ölçümden fark):

- **KATALOG `pdf` adıyla, açık değil:** katalog PDF'i doğrudan açılmaz, önce kaynak dizini (CLAUDE.md, catalog-ingestion
  §6.3); 30 Eylül setinde de "bekleyen"di.
- **ÜRÜN `qa` açık:** canlı sayfa ölçümü filo-ortak kuralı ("görünmüyor" iddiası canlı ölçülmeden taşınmaz).
- **GEO-SEO `rehber-yayin` açık:** 13 Ekim BLG-11 ile müdür çekirdeğine girdi (BLOG, GEO-SEO).
- **HARİTA `graphify` açık:** Recep 16 Eylül kararı ("olduğu gibi", kullanımla ölçülecek); kapatmak o kararı çiğner.
- **`git-commit` her yerde adıyla:** ihtiyaç raporu "biçim çelişkisi" dedi (Co-Authored-By ve kapı adımı); Blog pilotunda
  kapalıydı, burada adıyla bırakıldı.

## 4. Tekrarlar (aynı işe talip skill'ler)

Kural (YETENEK rol kartı): "aynı iş" hükmü yan yana koşum olmadan verilmez. Bu turda koşum yapılmadı (Recep 26 Ekim: derin
denetim yok); karar dağıtımla verildi.

| Grup | Önceki ölçüm | Bu dağıtımda |
|---|---|---|
| venthub-auditor, venthub-enterprise-audit, venthub-global-rontgen, venthub-20-eksen-denetimi | 30 Eylül: dördü "bekleyen", global-rontgen'de bayat yol ve araç adı | Yalnız `venthub-20-eksen-denetimi` adıyla (ALTYAPI, OPS: karne üreten tek skill); diğer üçü **her pencerede kapalı**. Silinmez; yan yana koşum ayrı kart (YETENEK) |
| code-review, chimera, diff-review | diff-review kusurlu (REC-514: işlenmiş dalda boş döner); code-review ve chimera setlerde | code-review ve chimera adıyla (doğrulayıcı / çürütücü setleri); **diff-review her pencerede kapalı** |
| investigate, gstack-investigate | 30 Eylül: kıyas bekliyor | investigate adıyla (ARAÇ, ALTYAPI, ÜRÜN); gstack-investigate kapalı |
| supabase (proje), supabase (eklenti) | Ad çakışması, hangisinin çözüldüğü ölçülmedi | Proje skill'i yalnız KATALOG'da adıyla; eklenti `enabledPlugins` ile kapalı (Blog kalıbı) |

## 5. claude-code-setup önerisi (OPS 26 Ekim girdisi)

| Öneri | Bizde durum | Bu iş için sonuç |
|---|---|---|
| Düzenleme anı lint kancası | Yok; ESLint yalnız CI'da | ARAÇ ARC-214 kartında; skill değil kanca, bu dağıtımı etkilemez |
| Sürüm notu skill'i | `document-release` (gstack) var ama commit/push yapıyor, VERSION ve TODOS.md varsayıyor (30 Eylül: "uyarlanmadan verilmez"); `whats-new` eklentisi Claude Code'un kendi sürüm notunu okur, bizim sürüm notumuzu yazmaz | Skill yok. Hiçbir pencerede açık değil; ihtiyaç bir departmanda ölçülürse YETENEK uyarlama kartı açar (bugün talep eden kart yok) |

## 6. Uygulama sırası ve ölçüm (OPS)

1. OPS her pencerenin `settings.local.json` dosyasını yedekler, `agent` ve `permissions` anahtarlarına dokunmadan
   `skillOverrides` (adıyla + kapalı listeleri) ve Blog kalıbındaki `enabledPlugins` satırlarını yazar.
2. İlk uygulanan pencerede `/context` "Skills" satırı önce/sonra yazılır (Blog pilotunun eksik kalan ölçümü).
3. Pencere yeniden başlatılınca geçerli olur; yeniden başlatma Recep'in pencere düzenine bağlıdır.
4. Bir hafta sonra (2 Kasım) aynı sayım: kapalı skill'e erişim denemesi, "Unknown skill" hatası, şikâyet. Sıfırdan farklıysa
   o skill adıyla'ya alınır.

## 7. Ölçülmeyenler

- Pencere düzeyindeki `off` ayarının o pencerenin açtığı alt ajanların ön yüklemesini etkileyip etkilemediği.
- Daraltmanın bağlam kazancı (jeton); Blog sonrası `/context` yok.
- Masaüstü uygulamasının eşitlediği eklenti skill'lerinin (`anthropic-skills`, `searchfit-seo`, `brightdata-plugin`,
  `design`) `enabledPlugins` ile kapanıp kapanmadığı (OPS-124 çekincesi, değişmedi).
