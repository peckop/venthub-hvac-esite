# Departman × çalışan türü skill setleri (SKILL_ATAMASI taslağı, 2026-09-30)

Kimin için: HARİTA'nın çalışan tanımı üreticisi (girdi) ve OPS (onay). Yazan: YETENEK. Bu belge hüküm değil öneridir: her departman kendi bölümünü okuyup "bu set işime yarar mı" diye cevaplayacak.

## 1. Bu belge ne

Müdür modelinde (execution-method-standard §10) bir departman penceresi işi dört tür çalışana böler: Araştırmacı, Uygulayıcı, Çürütücü, Doğrulayıcı. Çalışanlar küçük pencereli modellerle (Haiku, Sonnet 200K) açılıyor ve ölçtüğümüz kadarıyla orada skill listesi kırpılıyor: adı görünüyor, açıklaması görünmüyor. Bu belge her departman ve her çalışan türü için hangi skill'lerin çalışanın tanımına doğrudan yüklenmesini (ön yükleme) önerdiğimi, hangilerinin gerektiğinde adıyla çağrılmasını önerdiğimi ve hangilerinin neden bekletildiğini yazar.

## 2. Nasıl seçtim (kurallar)

1. **Ücretsiz sınıf.** Yalnız SKILL.md'si okunup ücretsiz çıkanlar girdi. Ücretli ve belirsiz olanlar (Bright Data, Codex, Sentry, NotebookLM) sonraya bırakıldı.
2. **Ön yükleme sınırı.** Bir sette en çok 8 skill ve toplam 35 KB. Ön yükleme skill gövdesini çalışanın bağlamına koyar; 35 KB kabaca 9 bin jeton, 200K pencerenin yüzde 4,5'u (bayt/4 tahmini, jeton olarak ölçülmedi). Tek başına 20 KB'ı aşan skill ön yüklenmez.
3. **Ağır denetim skill'leri yalnız Doğrulayıcı ve Çürütücü türünde.** Uygulayıcıya ve Araştırmacıya yalnız işini kısa yoldan anlatan skill'ler girer.
4. **Kapı eylemi yapan skill çalışana verilmez.** ship, land-and-deploy, git-commit, qa, gstack-qa kendi commit'ini ya da birleştirmesini yapar; §10.4'e göre birleştirme, canlıya yazma ve ayar müdürün işi.
5. **Orkestrasyon skill'leri çalışana verilmez.** multi-agent, maestro, llm-council, agy-orchestrate çalışanı yöneten müdürün ve ekip liderinin aracı; çalışan tek parça iş yapar.
6. **Bilinen kusuru olan skill'de kusur yazılır.** Kusuru işi yanıltacak olanlar (diff-review: işlenmiş dalda boş dönüyor) set dışında bekler; zararsız olanlar (plan-challenger, verify-before-done atıfları) sette kalır, kusur satırda yazılı.
7. **Aynı işe talip skill'lerden biri yan yana koşum olmadan seçilmez.** Dört denetim skill'i, careful/freeze/guard üçlüsü "bekleyen" tablosunda durur.
8. **Kaynak işareti.** Skill adının yanındaki "y" harfi: departman kendi raporunda o skill'i anmadı, ben SKILL.md okumasından ekledim. İşaretsiz olanı departman kendisi andı.

## 3. Bu belgenin dayandığı ölçümler

| Ölçüm | Sonuç |
|---|---|
| Listede açıklamasız skill, 1M pencere (`claude-sonnet-5-5[1m]`, bütçe ayarı 0,02) | 0 / 138 |
| Aynı ölçüm, Haiku 4.5 (200K) | 103 / 138 açıklamasız (proje skill'lerinin 30 / 42'si) |
| Aynı ölçüm, Sonnet 5.5 200K | 113 / 138 açıklamasız (proje skill'lerinin 37 / 42'si) |
| ⭐KESİN sayım, 10-01 (oturum dökümündeki `skill_listing` eki satır satır; `scripts/hijyen/skill-listesi-say.cjs`; yukarıdaki üç satır modelin kendi sayımıydı) | Haiku 4.5 (200K): 159 skill, 128 açıklamasız, **proje 32 / 45 açıklamasız (%71)**. Sonnet 5.5 düz ve [1m]: 159 skill, 3 açıklamasız, **proje 0 / 45 açıklamasız** |
| Listede açıklaması görünmeyen skill'i adıyla çağırma (`Skill(skill="verify-before-done")`), Haiku 200K ve Sonnet 200K, yeni süreç | İkisinde de başarılı: araç çağrısı yapıldı, "Launching skill" döndü |
| Ad çakışması | `supabase` (proje 19K, eklenti 13K) ve `scrape` (kullanıcı 26K, Bright Data 5K); `skills:` alanının hangisini çözdüğü ölçülmedi |

Sonuç: çalışan bir skill'i adıyla çağırabiliyor, ama ne zaman çağıracağını bilmesi gerekiyor. Bu yüzden iki katman var: **ön yükle** (kısa ve kritik, çalışan hiç karar vermeden bilir) ve **adıyla çağır** (ağır ya da nadir, çalışanın görevinde adı geçmeli). Ön yüklemenin çalışanın davranışını gerçekten değiştirip değiştirmediği ölçülmedi, §8'deki ölçüm bunun için.

**Kural (OPS hükmü, 10-01): Haiku (200K) çalışana skill'e bağlı iş verilmez; verilecekse skill adı müdürün görev metninde AÇIKÇA yazılır ya da `skills:` ile ön yüklenir.** Sonnet çalışanlarda proje skill'leri tam görünür.

## 4. Setler

Sütunlar: **Ön yükle** = çalışan tanımının `skills:` alanına girer (toplam KB altta). **Adıyla çağır** = ön yüklenmez, görev metninde adı geçer. **Bekleyen** = şimdilik verilmiyor, nedeni yazılı. Boş satır: o türe skill önerilmiyor.

### ADMIN

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), venthub-architecture (6,5K, y) | 11,9K | codebase-navigation (8,2K, y), web-platform-baseline (9,8K, y) | — |
| Uygulayıcı | i18n-conventions (14,2K), venthub-architecture (6,5K, y), vercel-composition-patterns (4,8K, y) | 25,5K | create-migration (6,3K), vercel-react-best-practices (9,1K, y), ui-ux-pro-max (13,6K), testing (9,5K, y), debugging (9,8K, y), react-modern (9,8K, y), typescript-strict (8,5K, y), observability (7,9K, y), api-design (8,7K, y) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | chimera (16,9K, y), bug-hunter (18K, y), security-scanner (12,7K, y), data-governance (10K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K, y), web-design-guidelines (4K, y), webapp-testing (3,9K, y), accessibility (14,5K, y) | 32,7K | code-review (9K, y) | diff-review: REC-514 kapanınca eklenir (ADMIN doğrulayıcı "evet") |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **vercel-react-best-practices** — UYARI: server-cache-lru (istekler-arası önbellek) kural 12 tenant+lang anahtar şartıyla çelişebilir.
- **ui-ux-pro-max** — UYARI: jenerik stil reçetesi, ikinci bir design-system/MASTER.md kaynağı açar.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.
- **web-design-guidelines** — UYARI: her incelemede GitHub raw URL'den uzak kural metni çeker.
- **webapp-testing** — UYARI: örnekler npm run dev; VentHub pnpm kullanır.
- **accessibility** — not: SKILL.md düzeltme akışı tarif ediyor; Doğrulayıcı yalnız ölçer, düzeltmez (§10.3)

### ALTYAPI

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K), investigate (6K, y) | 11,4K | fallow (16,4K), research-web (18,2K, y), codebase-navigation (8,2K, y) | — |
| Uygulayıcı | create-migration (6,3K), testing (9,5K, y) | 15,8K | debugging (9,8K, y), node-modern (8,5K, y), observability (7,9K, y) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | chimera (16,9K, y), bug-hunter (18K, y), security-scanner (12,7K, y), data-governance (10K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K), code-review (9K, y) | 19,3K | — | venthub-enterprise-audit: dört denetim skill'i aynı işe talip; yan yana koşum yapılmadan biri seçilmez; venthub-auditor: aynı kıyas; venthub-20-eksen-denetimi: aynı kıyas; venthub-global-rontgen: aynı kıyas; ayrıca bayat yol/araç adları; diff-review: REC-514 kapanınca eklenir |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **fallow** — not: yalnız rapor modunda kullan; fix --yes package.json yazar, kurulum önerisi npm install -g (proje pnpm)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### ARAC

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), investigate (6K) | 11,4K | research-web (18,2K, y), codebase-navigation (8,2K, y) | — |
| Uygulayıcı | — | — | mcp-builder (9,1K, y) | wrongstack-kanban: müdür düzeyi: çalışan başka pencereye yazmaz, kartı müdür yönetir (§10.4, belge §6); wrongstack-mailbox-mcp: müdür düzeyi: pencereler arası posta çalışanın işi değil; örnek yapılandırmada --admin ve mcp_use var (§10.4); guard: careful, freeze, guard üçlüsü kıyas bekliyor; careful: aynı kıyas; freeze: aynı kıyas |
| Çürütücü | plan-challenger (14,6K), chimera (16,9K, y) | 31,5K | bug-hunter (18K, y), security-scanner (12,7K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K), code-review (9K, y) | 19,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### BLOG

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | research-web (18,2K, y) | 18,2K | — | — |
| Uygulayıcı | — | — | diagram (16K) | — |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (10,3K) | 10,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **diagram** — UYARI: ./diagrams/ repo köküne yazar, docs/README haritasında yeri yok.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### EDGE

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), investigate (6K, y) | 11,4K | codebase-navigation (8,2K, y) | — |
| Uygulayıcı | create-migration (6,3K), testing (9,5K, y) | 15,8K | supabase (18,8K), debugging (9,8K, y), typescript-strict (8,5K, y), node-modern (8,5K, y), observability (7,9K, y), api-design (8,7K, y) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K, y) | 29,0K | chimera (16,9K, y), bug-hunter (18K, y), security-scanner (12,7K, y), data-governance (10K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K), code-review (9K, y) | 19,3K | — | venthub-global-rontgen: bayat yol ve araç adları (src/app/products/[slug] yok, npm run build), edge fonksiyonlarına dair tek madde var; bağımsız doğrulayıcı UYMAZ dedi; diff-review: REC-514 kapanınca eklenir (edge için D11 yanlış alarmı düzelmeli) |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **supabase** — ad çakışması: proje supabase (19K) ile eklenti supabase:supabase (13K); alanın hangisini çözdüğü ölçülmedi · UYARI: statik client örneği PPR'a atıf yapıyor, projede PPR kullanılmıyor.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### GEO-SEO

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K), search-console (12,5K) | 17,9K | research-web (18,2K, y), web-platform-baseline (9,8K, y) | — |
| Uygulayıcı | — | — | — | — |
| Çürütücü | plan-challenger (14,6K), chimera (16,9K, y) | 31,5K | bug-hunter (18K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K), code-review (9K, y) | 19,3K | accessibility (14,5K, y) | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **search-console** — UYARI: OAuth "oob" akışı Google'da kapatılmış olabilir (doğrulanmadı); açıklamadaki Core Web Vitals gövdede yok.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.
- **accessibility** — not: SKILL.md düzeltme akışı tarif ediyor; Doğrulayıcı yalnız ölçer, düzeltmez (§10.3)

### HARITA

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K) | 5,4K | graphify (43,1K), codebase-navigation (8,2K, y) | — |
| Uygulayıcı | — | — | — | document-generate: commit ve push adımı var, sabit Co-Authored-By yazıyor, docs/ harita cetvelini atlıyor; uyarlanmadan verilmez; document-release: commit ve push yapıyor, VERSION ve TODOS.md varsayıyor, CLAUDE.md düzenliyor; uyarlanmadan verilmez |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (10,3K) | 10,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### I18N

I18N'in rapor dosyası yok; set yalnız SKILL.md okumasına dayanıyor. Departman penceresi açılınca kendi ekini yazacak.

İstisna: plan-challenger — SKILL.md Başlık 5 (i18n paritesi, design token) I18N planlarına uyuyor; eşleme dosyasında I18N için yazılı değildi, doğrulayıcıdan geçmedi.

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y) | 5,4K | codebase-navigation (8,2K, y), web-platform-baseline (9,8K, y) | — |
| Uygulayıcı | i18n-conventions (14,2K, y), testing (9,5K, y) | 23,7K | debugging (9,8K, y) | — |
| Çürütücü | plan-challenger (14,6K, y), chimera (16,9K, y) | 31,5K | bug-hunter (18K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K, y), i18n-conventions (14,2K, y), code-review (9K, y) | 33,5K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### KATALOG

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K) | 5,4K | research-web (18,2K, y), codebase-navigation (8,2K, y) | pdf: K15: PDF doğrudan açılmaz, önce KAYNAK DİZİNİ; verilirse çalışan kural 15'i çiğneyebilir |
| Uygulayıcı | — | — | xlsx (8,5K), supabase (18,8K) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | chimera (16,9K, y), bug-hunter (18K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K), code-review (9K, y) | 19,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **xlsx** — not: açıklaması database pipeline ve tek başına betik için tetiklenmesin diyor; teslimatın elektronik tablo olduğu işlerde kullan
- **supabase** — ad çakışması: proje supabase (19K) ile eklenti supabase:supabase (13K); alanın hangisini çözdüğü ölçülmedi · UYARI: statik client örneği PPR'a atıf yapıyor, projede PPR kullanılmıyor.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### MEVZUAT

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | pdf (8,2K), research-web (18,2K, y) | 26,4K | — | notebook-navigator: ücret sınıfı belirsiz (NotebookLM Google hesabı); ücretli ve belirsiz olanlar sonraya bırakılıyor |
| Uygulayıcı | — | — | — | — |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (10,3K) | 10,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **pdf** — UYARI: KATALOG kuralı PDF'i doğrudan taramayı yasaklar, önce KAYNAK DİZİNİ.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### OPS

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y) | 5,4K | codebase-navigation (8,2K, y) | — |
| Uygulayıcı | — | — | — | to-issues: D2: yerel task.md yazıyor, Linear kaydı açmıyor |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | llm-council: orkestrasyon skill'i; müdür ve ekip lideri kullanır, çalışana verilmez (kural 5); prd-complexity-audit: NotebookLM ikizi ve çok-ajanlı Workflow bağımlılığı; müdür düzeyi |
| Doğrulayıcı | verify-before-done (10,3K) | 10,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### SATIS

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y) | 5,4K | research-web (18,2K, y), codebase-navigation (8,2K, y) | supabase-postgres-best-practices: supabase eklentisi bu makinede etkin değil, skill çözülmüyor (YTN-8, 10-01); projeye alınırsa ya da eklenti açılırsa eklenir |
| Uygulayıcı | create-migration (6,3K), testing (9,5K, y) | 15,8K | supabase (18,8K), debugging (9,8K, y), typescript-strict (8,5K, y), api-design (8,7K, y) | supabase-postgres-best-practices: aynı neden (YTN-8, 10-01) |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | chimera (16,9K, y), bug-hunter (18K, y), security-scanner (12,7K, y), data-governance (10K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K, y), webapp-testing (3,9K), code-review (9K, y) | 23,2K | — | diff-review: REC-514 kapanınca eklenir (SATIS doğrulayıcı listesinde) |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **supabase** — ad çakışması: proje supabase (19K) ile eklenti supabase:supabase (13K); alanın hangisini çözdüğü ölçülmedi · UYARI: statik client örneği PPR'a atıf yapıyor, projede PPR kullanılmıyor.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.
- **webapp-testing** — UYARI: örnekler npm run dev; VentHub pnpm kullanır.

### TASARIM

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | venthub-tasarim-dili (11,4K) | 11,4K | browse (29,9K, y), web-platform-baseline (9,8K, y) | — |
| Uygulayıcı | typography (7,3K), venthub-tasarim-dili (11,4K), react-modern (9,8K, y) | 28,5K | ui-ux-pro-max (13,6K, y), design-dna (8,3K, y) | — |
| Çürütücü | plan-challenger (14,6K), web-design-guidelines (4K) | 18,6K | — | — |
| Doğrulayıcı | verify-before-done (10,3K), accessibility (14,5K), webapp-testing (3,9K, y) | 28,7K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **browse** — UYARI: Windows'ta Aside yok, bun ile yerel tarayıcı derlemesi ister; ~/.gstack telemetri.
- **ui-ux-pro-max** — UYARI: jenerik stil reçetesi, ikinci bir design-system/MASTER.md kaynağı açar.
- **design-dna** — UYARI: üretim aşaması serbest HEX/CSS HTML yazar, kural 8 ile çelişir.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **web-design-guidelines** — UYARI: her incelemede GitHub raw URL'den uzak kural metni çeker.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.
- **accessibility** — not: SKILL.md düzeltme akışı tarif ediyor; Doğrulayıcı yalnız ölçer, düzeltmez (§10.3)
- **webapp-testing** — UYARI: örnekler npm run dev; VentHub pnpm kullanır.

### URUN

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K), investigate (6K, y), venthub-architecture (6,5K, y) | 17,9K | codebase-navigation (8,2K, y), web-platform-baseline (9,8K, y) | — |
| Uygulayıcı | i18n-conventions (14,2K), venthub-tasarim-dili (11,4K), venthub-architecture (6,5K, y) | 32,1K | vercel-composition-patterns (4,8K, y), vercel-react-best-practices (9,1K, y), threejs-webgl-performance (22,4K, y), testing (9,5K, y), debugging (9,8K, y), react-modern (9,8K, y), typescript-strict (8,5K, y), observability (7,9K, y) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | chimera (16,9K, y), bug-hunter (18K, y) | — |
| Doğrulayıcı | verify-before-done (10,3K), accessibility (14,5K), web-design-guidelines (4K, y), webapp-testing (3,9K) | 32,7K | canary (52K, y), benchmark (28,6K, y), code-review (9K, y) | diff-review: REC-514 kapanınca eklenir (URUN doğrulayıcı "evet") |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **vercel-react-best-practices** — UYARI: server-cache-lru (istekler-arası önbellek) kural 12 tenant+lang anahtar şartıyla çelişebilir.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.
- **accessibility** — not: SKILL.md düzeltme akışı tarif ediyor; Doğrulayıcı yalnız ölçer, düzeltmez (§10.3)
- **web-design-guidelines** — UYARI: her incelemede GitHub raw URL'den uzak kural metni çeker.
- **webapp-testing** — UYARI: örnekler npm run dev; VentHub pnpm kullanır.
- **canary** — UYARI: raporları repo içi .gstack/canary-reports'a yazar.
- **benchmark** — UYARI: raporu repo içi .gstack/benchmark-reports'a yazar, kendi telemetrisi var.

### YETENEK

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | — | — | find-skills (7,4K), task-observer (7,4K, y), research-web (18,2K, y) | — |
| Uygulayıcı | — | — | skill-creator (32,4K) | skills-creator: D9 kapanınca eklenir (.agent ağacına yazıyor) |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (10,3K) | 10,3K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **find-skills** — UYARI: "npx skills add -g -y" onaysız global kurulum önerir.
- **task-observer** — UYARI: kendi durum katmanı (docs/skill-gozlemleri/, son-inceleme.txt) getirir; "OPS-AUDIT şeridi" adı bayat.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

## 5. Bekleyenler ve bilinen kusurlar

| Skill | Kusur ya da engel | Kapanış yolu |
|---|---|---|
| diff-review | Yalnız çalışma ağacındaki `git diff HEAD`'e bakıyor; işlenmiş dalda boş dönüyor. `.md`, `.json`, `.yml` dosyalarını hiç taramıyor. Edge fonksiyonlarındaki meşru `SUPABASE_SERVICE_ROLE_KEY` kullanımını engelleyici hata sayıyor. SKILL.md'deki `useSearchParams` kuralı betikte yok. | REC-514 (D1, D10, D11), sabotaj testiyle kanıtlı düzeltme |
| plan-challenger | Cetvel olarak emekli CONTEXT.md ve "31 madde" diyor; olmayan `codegraph_impact` aracını anıyor. 45 günde 33 kez kullanıldı ve işledi. | D7, REC-514 kuyruğu, ayrı PR |
| verify-before-done | Kapsam listesi depoda olmayan üç skill'e (testing, debugging, git-flow) gönderiyor. **KAPANDI (WrongStack alımı 2. paket: testing, debugging, git-flow depoya geldi).** | D8, REC-519 alma adımı |
| skills-creator | Yeni skill'i `.agent/skills` altına yazıyor. | D9, REC-514 kuyruğu |
| Denetim dörtlüsü (venthub-enterprise-audit, venthub-auditor, venthub-20-eksen-denetimi, venthub-global-rontgen) | Aynı işe talip; "aynı iş" yan yana koşumla kanıtlanmadan biri seçilmez. global-rontgen'de ayrıca bayat yol ve araç adları var. | Yan yana koşum (ayrı iş, ALTYAPI ile) |
| careful, freeze, guard | Üçlü aynı kanca alanında; kıyas bekliyor. | ARAÇ ile yan yana koşum |
| document-generate, document-release | Commit ve push yapıyor, CLAUDE.md düzenliyor. HARİTA yazma alanı. | Uyarlama, HARİTA ile |

## 6. WrongStack skill'lerinin bağlanması (YTN-11, 2026-10-03)

Ölçüm (OPS, 10-03): 10-01'de alınan 15 WrongStack skill'inden 14'ü hiçbir çalışan tanımında yoktu (yalnız verify-before-done 15 tanımda); son 10 günde oturum dökümlerinde Skill çağrısı verify-before-done 3, code-review 1, kalan 13 skill 0. Kök: bu belgenin setleri skill'ler gelmeden ÖNCE yazılmıştı, eski §6 yalnız öneri tablosuydu ve hiçbir mekanik onu sete çevirmedi. PR 3'ün dokuz skill'i (security-scanner, typescript-strict, codebase-navigation, react-modern, data-governance, api-design, observability, node-modern, web-platform-baseline) aynı sebeple bağsızdı; onlar da burada. Boyutlar diskteki SKILL.md'dir (eski tablodaki tahminler küçüktü; uyarlama ekleriyle code-review 9,0K, bug-hunter 18,0K oldu).

**Karar kuralı:** ön yükleme her açılışta çalışanın bağlamına girer, bu yüzden yalnız o türün hemen her işinde lazım olan ve setin 35 KB bütçesine sığan skill ön yüklenir; koşullu ya da sığmayan skill çalışan tanımının gövdesindeki "adıyla çağır" satırına girer. Müdür düzeyi skill çalışana verilmez (set kuralları 4 ve 5, §10.4). Hangisinin gerçekten kullanıldığı 8 Ekim denemesinde ölçülür (§8.1); kullanılmayan çıkarılır.

### 6.1 Çalışan setlerine girenler (15 skill)

| Skill | Tür | Ön yükle (departman) | Adıyla çağır (departman) | Neden |
|---|---|---|---|---|
| code-review (9,0K) | Doğrulayıcı | ALTYAPI, ARAC, EDGE, GEO-SEO, I18N, KATALOG, SATIS | ADMIN, URUN | Bağımsız ikinci okuma (diff, doğruluk, güvenlik); verify-before-done iddiaları ölçer, code-review kodu okur. ADMIN ve URUN setleri 31 KB dolu, orada adıyla çağır. |
| chimera (16,9K) | Çürütücü | ARAC, GEO-SEO, I18N | ADMIN, ALTYAPI, EDGE, KATALOG, SATIS, URUN | Değişikliği şiddet sıralı hata raporuna çevirir (plan-challenger planı, chimera diff'i çürütür). Çürütücü setleri supabase-security ile dolu olan altı departmanda adıyla çağır. |
| bug-hunter (18,0K) | Çürütücü | — | ADMIN, ALTYAPI, ARAC, EDGE, GEO-SEO, I18N, KATALOG, SATIS, URUN | 18,0K: plan-challenger ile birlikte 35 KB bütçeye ancak sığıyor ve her çürütme kusur avı değil; hepsinde adıyla çağır. |
| security-scanner (12,7K) | Çürütücü | — | ADMIN, ALTYAPI, ARAC, EDGE, SATIS | Sır, enjeksiyon, bağımlılık açığı taraması; koşullu iş, çürütücü setleri dolu: adıyla çağır. |
| data-governance (10,0K) | Çürütücü | — | ADMIN, ALTYAPI, EDGE, SATIS | KVKK, saklama, RLS sahipliği; yalnız veri dokunan işte: adıyla çağır. |
| testing (9,5K) | Uygulayıcı | ALTYAPI, EDGE, I18N, SATIS | ADMIN, URUN | Her kod değişikliğinde (önce kırmızı, eşik düşürme ve skip yasak): odası olan dört departmanda ön yükle, ADMIN ve URUN dolu: adıyla çağır. |
| debugging (9,8K) | Uygulayıcı | — | ADMIN, ALTYAPI, EDGE, I18N, SATIS, URUN | Yalnız "nedeni bilinmeyen bozukluk" işinde, her görevde değil: adıyla çağır. |
| react-modern (9,8K) | Uygulayıcı | TASARIM | ADMIN, URUN | TASARIM uygulayıcı React yazar ve odası var: ön yükle; URUN ve ADMIN dolu: adıyla çağır. |
| typescript-strict (8,5K) | Uygulayıcı | — | ADMIN, EDGE, SATIS, URUN | Depo zaten `any` yasağı ve tip kapısıyla korunuyor; tip hatası işinde adıyla çağır. |
| node-modern (8,5K) | Uygulayıcı | — | ALTYAPI, EDGE | Betik/CJS işinde; bizde CommonJS korunur: adıyla çağır. |
| observability (7,9K) | Uygulayıcı | — | ADMIN, ALTYAPI, EDGE, URUN | Log, Sentry, izleme işi koşullu: adıyla çağır. |
| api-design (8,7K) | Uygulayıcı | — | ADMIN, EDGE, SATIS | Yeni endpoint ve hata sözleşmesi işi koşullu: adıyla çağır. |
| research-web (18,2K) | Araştırmacı | BLOG, MEVZUAT | ALTYAPI, ARAC, GEO-SEO, KATALOG, SATIS, YETENEK | 18,2K (20K sınırına yakın). MEVZUAT ve BLOG'da işin kendisi web araştırması: ön yükle (BLOG araştırmacısı bu yüzden yeni dosya). Diğerlerinde adıyla çağır. |
| codebase-navigation (8,2K) | Araştırmacı | — | ADMIN, ALTYAPI, ARAC, EDGE, HARITA, I18N, KATALOG, OPS, SATIS, URUN | codegraph skill'i zaten ön yüklü ve aynı işe talip; yan yana koşum olmadan ön yüklenmez (set kuralı 7): adıyla çağır. |
| web-platform-baseline (9,8K) | Araştırmacı | — | ADMIN, GEO-SEO, I18N, TASARIM, URUN | Tarayıcı desteği ve modern CSS sorusu koşullu: adıyla çağır. |

`verify-before-done` değişmedi: 15 doğrulayıcı tanımında ön yüklü; "depoda olmayan üç skill'e gönderiyor" kusuru kapandı (testing, debugging, git-flow depoda).

### 6.2 Müdür çekirdeği (çalışan tanımına girmez)

Bunlar departman penceresinin (müdürün) kendi aracıdır; `Skill` aracıyla adıyla çağrılır, `.claude/agents` tanımlarına yazılmaz. Liste makine okur: JSON `mudurCekirdegi` alanı. **`skill-bagli.test.ts` her `.claude/skills` klasörünün ya bir sette ya bu listede olmasını ister**; yeni skill gelince bağsız kalamaz.

| Skill | Departman müdürleri | Ne için |
|---|---|---|
| wrongstack-kanban (24,9K) | HEPSİ (15 departman) | Kart açma, havuzdan iş alma, kanıt komutuyla Done müdürün işi (karar 219); çalışan başka pencereye yazmaz (§10.4). |
| wrongstack-mailbox-mcp (10,5K) | HEPSİ (15 departman) | Kapalı pencereye mesaj müdürün işi; açık pencereye SendMessage. Örnek yapılandırmada --admin ve mcp_use var (§10.4). |
| multi-agent (19,9K) | HEPSİ (15 departman) | İşi çalışanlara bölme, görev metni, sonuç birleştirme: çalışanı yöneten müdürün aracı (set kuralı 5). |
| prompt-engineering (9,4K) | YETENEK, ARAC, HARITA, OPS | Görev metni, ajan tanımı ve skill açıklaması yazarken; çalışan metin yazmaz, müdür yazar. |
| git-flow (9,7K) | HEPSİ (15 departman) | Commit, PR, rebase, geri alma: kapı eylemi müdürün (set kuralı 4); çalışan commit atmaz. |
| refactor-planner (17,1K) | ADMIN, ALTYAPI, ARAC, EDGE, HARITA, I18N, KATALOG, SATIS, URUN | Çok dosyalı yeniden düzenleme planı (plan yazar, uygulamaz): müdür planlar, uygulayıcı dar dosya kümesini yazar. |
| sdd (10,8K) | ADMIN, ALTYAPI, ARAC, EDGE, HARITA, I18N, KATALOG, SATIS, URUN, OPS | Spec ve görev grafiği: planlama müdür düzeyinde; çalışana hazır kabul ölçütüyle bölünmüş iş gider. |
| mnemosyne (13,7K) | ARAC | Sage hafıza bakımı (ARC-23): silme/arşiv yalnız öneri olarak dosyalanır; bakımı ARAÇ müdürü başlatır, sonucu OPS onaylar. |
| maestro (12,8K) | ADMIN, ALTYAPI, ARAC, EDGE, HARITA, I18N, KATALOG, SATIS, URUN | Bölünebilir büyük değişiklik dalgaları: orkestrasyon, ekip lideri düzeyi (set kuralı 5). |
| agy-orchestrate (12,9K) | ALTYAPI, ARAC, HARITA | Geniş tarama için agy filosu: orkestrasyon, ekip lideri düzeyi (set kuralı 5). |
| git-commit (5,0K) | HEPSİ (15 departman) | Commit atar: kapı eylemi (set kuralı 4). |
| qa (12,6K) | URUN, ADMIN, TASARIM, GEO-SEO | Gerçek tarayıcıda gezip hata düzeltir ve commit atar: kapı eylemi (set kuralı 4). |
| mutasyon-testi (11,8K) | ADMIN, ALTYAPI, ARAC, EDGE, I18N, KATALOG, SATIS, URUN | Mutasyon doğrulayıcısı yazma istisnasıdır (§10.3) ve doğrulayıcı tanımında Write kapalı; ayrı çalışan türü kararına kadar müdür adıyla çağırır (§9 soru 3). |
| notebooklm-sync (11,5K) | HARITA, OPS | Milestone/manuel senkron; NotebookLM kimlik doğrulama gerektirir. |
| orion-cli (9,7K) | HARITA | Doküman hattı komutları (tree, şema üretimi). |
| office-hours (11,4K) | OPS | Fikir/özellik önerisi plandan önce: karar öncesi tartışma, çalışan işi değil. |
| to-prd (3,0K) | OPS | Konuşmayı PRD’ye çevirir: müdür/OPS düzeyi. |
| video-kaynak (4,8K) | OPS | Video bulup NotebookLM’e kaynak ekler: seçimi Recep yapar, çalışan işi değil. |

Hiçbir departmana bağlanmayanlar (eski not): docker-deploy, plugin-author, audit-log (bu depoda skill klasörü yok); alınamayan: auto-review (çalıştıracak ana program yok).

## 7. Üretici girdisi

Makine okuyan kaynak: `docs/audits/skill-departman-setleri-2026-09-30.json`. HARİTA'nın kart üreticisi her `uret: true` satırı için `.claude/agents/<dept>-<tur>.md` dosyasını üretir; `skills:` alanına `onYukle[].ad` girer. Bu belge ile JSON aynı betikten çıktı, elle düzenlenmez; değişiklik betikte yapılır.

- Satır sayısı: 60 (15 departman × 4 tür). Üretilecek ajan dosyası: 51 (YTN-11 ile 50 → 51: BLOG araştırmacısı research-web ile eklendi). Ön yüklenecek skill olmayan satırlarda `uret: false`, dosya üretilmez. JSON ayrıca `mudurCekirdegi` listesini taşır (§6.2); üretici onu okumaz, `skill-bagli.test.ts` okur.
- `adiylaCagir` ve `bekleyen` alanları `skills:` alanına GİRMEZ. `adiylaCagir` çalışanın görev metnine ya da ajan tanımının gövdesine yazılacak (§9 soru 1).
- `kaynak: "yetenek"` = departman raporunda anılmayan, YETENEK'in eklediği skill. Departman bölümünü okurken bunlara özellikle bakacak.
- `adiylaCagir[].uyari` dolu ise ad çakışması var; o ad `skills:` alanına yazılmaz.

## 8. Ölçüm planı: ön yükleme çalışanı gerçekten değiştiriyor mu

> **Mekanik kısım ÖLÇÜLDÜ (YTN-8, 2026-10-01): `docs/audits/skill-calisan-yukleme-olcumu-2026-10-01.md`.** Aşağıdaki plan "davranışı değiştiriyor mu" kısmı içindir; o hâlâ koşulmadı.

Model kararını (toplama Haiku, yargı Sonnet 5.5) besleyecek sayı budur. Yöntem, işi yapmamış bir ölçücüyle:

1. Aynı dört görev metni (biri her tür için), ön yüklemeli ve ön yüklemesiz iki tanımla, Haiku ve Sonnet 5.5 200K'da beşer kez koşulur.
2. Ölçülen: çalışanın ilk beş araç çağrısı içinde ön yüklü skill'in adımlarına uyup uymadığı (görev metnine skill adı yazılmadan), skill'siz koşumun aynı adımı kendiliğinden yapma oranı.
3. Çıktı: tür başına "ön yükleme davranışı değiştirdi / değiştirmedi" sayısı ve jeton maliyeti. Değiştirmediği yerde ön yükleme kaldırılır, yük azalır.
4. Ön yükleme mekaniğinin kendisi (alan geçerli mi, gövde bağlama giriyor mu) ARAÇ'ın mekanik doğrulamasında.

## 9. Açık sorular

1. **Adıyla çağır katmanı nerede yaşayacak?** Önerim: ajan tanımının gövdesinde tek satır ("Gerektiğinde şu skill'leri Skill aracıyla çağır: …"). OPS "gövde boş" demişti; gövde boş kalırsa müdür her görev metnine adı yazmak zorunda. Karar HARİTA ve OPS'ta.
2. **Ad çakışması.** ÖLÇÜLDÜ (YTN-8, 10-01): aynı ad kullanıcı ve proje düzeyinde varsa `skills:` **kullanıcı düzeyinin** gövdesini yükler (kanarya `scrape`: gelen metin kullanıcı düzeyindeki gstack skill'iydi). `supabase` için proje/eklenti çakışması eklenti etkin olmadığından ölçülemedi. Çözülene kadar ikisi de ön yüklenmiyor; bugün projenin hiçbir skill adı kullanıcı düzeyiyle çakışmıyor.
3. **Mutasyon testi skill'i (REC-535, depoda).** Doğrulayıcının yazma istisnasıdır (§10.3) ama doğrulayıcı tanımlarında `disallowedTools: Edit, Write` var; ayrı bir "mutasyon doğrulayıcısı" türü ya da istisna kararı verilene kadar `mudurCekirdegi` listesinde, müdür adıyla çağırır (YTN-11).
4. **Çalışan modeli.** Bu tasarım 200K çalışan için kurulu. Model Recep'le konuşuluyor; Haiku'da ön yüklemenin işe yaradığı §8 ölçümüyle görülecek.
5. **Departman doğrulaması.** Her departman kendi bölümünü okuyup "işime yarar mı, yarıyorsa neden anmadım" diye cevaplayacak (SORU-neden-onermedin.md). Cevaplar setleri ve skill açıklamalarını düzeltir.

## 10. Doğrulama kaydı

Bu belge yazıldıktan sonra işi yapmamış bağımsız bir doğrulayıcıya (salt-okuma) verildi; SKILL.md dosyalarını kendisi açıp ölçtü. Sonuç: **32 iddia doğrulandı, 4 çelişti, 0 desteksiz, 0 ölçülemedi**; uyum hükmü 14 yerleşimde 6 UYAR, 6 KISMEN, 2 UYMAZ. Beş kusur iddiasının (§5) beşi doğru çıktı; 12 boyut ve 6 toplam sayısı doğru çıktı; ad çakışması yalnız `supabase` ve `scrape`, ikisi de ön yüklemede yok.

Çelişen dört kalem ve yapılan düzeltme:

- **llm-council** OPS Çürütücü setinde "adıyla çağır" idi; kural 5'e aykırı (orkestrasyon çalışana verilmez). Bekleyene alındı.
- **wrongstack-kanban ve wrongstack-mailbox-mcp** ARAÇ Uygulayıcı setinde ön yüklemeydi; §6 ve §10.4 ile çelişiyor (çalışan başka pencereye yazmaz). Bekleyene alındı, ARAÇ Uygulayıcı'nın ön yüklemesi boşaldı.
- **fallow** ALTYAPI Uygulayıcı setinde ön yüklemeydi; category audit, `fix --yes` package.json yazıyor. Araştırmacı setinde "adıyla çağır"a taşındı, rapor modu notuyla.
- **prd-complexity-audit** OPS Çürütücü setinde "adıyla çağır" idi; NotebookLM ikizi ve çok-ajanlı Workflow'a bağlı. Bekleyene alındı.

"Kısmen" ve "uymaz" hükümlerinin işlenişi: EDGE Doğrulayıcı venthub-global-rontgen (bayat yollar) bekleyene; KATALOG Uygulayıcı xlsx (açıklaması pipeline betikleri için tetiklenmesin diyor) ön yüklemeden "adıyla çağır"a; accessibility, supabase-security, codegraph ve fallow için ilgili bölümlerde "dikkat" notu.
