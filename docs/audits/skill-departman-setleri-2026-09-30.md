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
| Listede açıklaması görünmeyen skill'i adıyla çağırma (`Skill(skill="verify-before-done")`), Haiku 200K ve Sonnet 200K, yeni süreç | İkisinde de başarılı: araç çağrısı yapıldı, "Launching skill" döndü |
| Ad çakışması | `supabase` (proje 19K, eklenti 13K) ve `scrape` (kullanıcı 26K, Bright Data 5K); `skills:` alanının hangisini çözdüğü ölçülmedi |

Sonuç: çalışan bir skill'i adıyla çağırabiliyor, ama ne zaman çağıracağını bilmesi gerekiyor. Bu yüzden iki katman var: **ön yükle** (kısa ve kritik, çalışan hiç karar vermeden bilir) ve **adıyla çağır** (ağır ya da nadir, çalışanın görevinde adı geçmeli). Ön yüklemenin çalışanın davranışını gerçekten değiştirip değiştirmediği ölçülmedi, §8'deki ölçüm bunun için.

## 4. Setler

Sütunlar: **Ön yükle** = çalışan tanımının `skills:` alanına girer (toplam KB altta). **Adıyla çağır** = ön yüklenmez, görev metninde adı geçer. **Bekleyen** = şimdilik verilmiyor, nedeni yazılı. Boş satır: o türe skill önerilmiyor.

### ADMIN

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), venthub-architecture (6,5K, y) | 11,9K | — | — |
| Uygulayıcı | i18n-conventions (14,2K), venthub-architecture (6,5K, y), vercel-composition-patterns (4,8K, y) | 25,5K | create-migration (6,3K), vercel-react-best-practices (9,1K, y), ui-ux-pro-max (13,6K) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | — | — |
| Doğrulayıcı | verify-before-done (8,9K, y), web-design-guidelines (4K, y), webapp-testing (3,9K, y), accessibility (14,5K, y) | 31,3K | — | diff-review: REC-514 kapanınca eklenir (ADMIN doğrulayıcı "evet") |

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
| Araştırmacı | codegraph (5,4K), investigate (6K, y) | 11,4K | fallow (16,4K) | — |
| Uygulayıcı | create-migration (6,3K) | 6,3K | — | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | venthub-enterprise-audit: dört denetim skill'i aynı işe talip; yan yana koşum yapılmadan biri seçilmez; venthub-auditor: aynı kıyas; venthub-20-eksen-denetimi: aynı kıyas; venthub-global-rontgen: aynı kıyas; ayrıca bayat yol/araç adları; diff-review: REC-514 kapanınca eklenir |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **fallow** — not: yalnız rapor modunda kullan; fix --yes package.json yazar, kurulum önerisi npm install -g (proje pnpm)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### ARAC

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), investigate (6K) | 11,4K | — | — |
| Uygulayıcı | — | — | mcp-builder (9,1K, y) | wrongstack-kanban: müdür düzeyi: çalışan başka pencereye yazmaz, kartı müdür yönetir (§10.4, belge §6); wrongstack-mailbox-mcp: müdür düzeyi: pencereler arası posta çalışanın işi değil; örnek yapılandırmada --admin ve mcp_use var (§10.4); guard: careful, freeze, guard üçlüsü kıyas bekliyor; careful: aynı kıyas; freeze: aynı kıyas |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### BLOG

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | — | — | — | — |
| Uygulayıcı | — | — | diagram (16K) | — |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **diagram** — UYARI: ./diagrams/ repo köküne yazar, docs/README haritasında yeri yok.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### EDGE

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), investigate (6K, y) | 11,4K | — | — |
| Uygulayıcı | create-migration (6,3K) | 6,3K | supabase (18,8K) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K, y) | 29,0K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | venthub-global-rontgen: bayat yol ve araç adları (src/app/products/[slug] yok, npm run build), edge fonksiyonlarına dair tek madde var; bağımsız doğrulayıcı UYMAZ dedi; diff-review: REC-514 kapanınca eklenir (edge için D11 yanlış alarmı düzelmeli) |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **supabase** — ad çakışması: proje supabase (19K) ile eklenti supabase:supabase (13K); alanın hangisini çözdüğü ölçülmedi · UYARI: statik client örneği PPR'a atıf yapıyor, projede PPR kullanılmıyor.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **supabase-security** — not: migration YAZIM kılavuzu; RLS çürütmesini plan-challenger da kapsıyor, departmanın yetkisine göre değerlendir · UYARI: ön koşulda GEMINI.md, "Kural 25" gibi bayat numara atfı.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### GEO-SEO

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K), search-console (12,5K) | 17,9K | — | — |
| Uygulayıcı | — | — | — | — |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | accessibility (14,5K, y) | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **search-console** — UYARI: OAuth "oob" akışı Google'da kapatılmış olabilir (doğrulanmadı); açıklamadaki Core Web Vitals gövdede yok.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.
- **accessibility** — not: SKILL.md düzeltme akışı tarif ediyor; Doğrulayıcı yalnız ölçer, düzeltmez (§10.3)

### HARITA

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K) | 5,4K | graphify (42,6K) | — |
| Uygulayıcı | — | — | — | document-generate: commit ve push adımı var, sabit Co-Authored-By yazıyor, docs/ harita cetvelini atlıyor; uyarlanmadan verilmez; document-release: commit ve push yapıyor, VERSION ve TODOS.md varsayıyor, CLAUDE.md düzenliyor; uyarlanmadan verilmez |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### I18N

I18N'in rapor dosyası yok; set yalnız SKILL.md okumasına dayanıyor. Departman penceresi açılınca kendi ekini yazacak.

İstisna: plan-challenger — SKILL.md Başlık 5 (i18n paritesi, design token) I18N planlarına uyuyor; eşleme dosyasında I18N için yazılı değildi, doğrulayıcıdan geçmedi.

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y) | 5,4K | — | — |
| Uygulayıcı | i18n-conventions (14,2K, y) | 14,2K | — | — |
| Çürütücü | plan-challenger (14,6K, y) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K, y), i18n-conventions (14,2K, y) | 23,1K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### KATALOG

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K) | 5,4K | — | pdf: K15: PDF doğrudan açılmaz, önce KAYNAK DİZİNİ; verilirse çalışan kural 15'i çiğneyebilir |
| Uygulayıcı | — | — | xlsx (8,5K), supabase (18,8K) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

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
| Araştırmacı | pdf (8,2K) | 8,2K | — | notebook-navigator: ücret sınıfı belirsiz (NotebookLM Google hesabı); ücretli ve belirsiz olanlar sonraya bırakılıyor |
| Uygulayıcı | — | — | — | — |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **pdf** — UYARI: KATALOG kuralı PDF'i doğrudan taramayı yasaklar, önce KAYNAK DİZİNİ.
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### OPS

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y) | 5,4K | — | — |
| Uygulayıcı | — | — | — | to-issues: D2: yerel task.md yazıyor, Linear kaydı açmıyor |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | llm-council: orkestrasyon skill'i; müdür ve ekip lideri kullanır, çalışana verilmez (kural 5); prd-complexity-audit: NotebookLM ikizi ve çok-ajanlı Workflow bağımlılığı; müdür düzeyi |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

Bu bölümdeki skill'lerde dikkat:

- **codegraph** — not: kod tarafı olmayan departmanlarda kısmen uyar (HARITA: yalnız scripts/belge)
- **plan-challenger** — kusur: D7: cetvel olarak emekli CONTEXT.md ve 31 madde diyor, olmayan codegraph_impact aracını anıyor (33 kullanımda işledi) · UYARI: cetvel olarak emekli CONTEXT.md §14'e atıf var.
- **verify-before-done** — kusur: D8: kapsam listesi depoda olmayan testing/debugging/git-flow skill'lerine gönderiyor (zararsız) · UYARI: "Skills in scope" testing/debugging/git-flow adları bu depoda yok.

### SATIS

| Tür | Ön yükle | Toplam | Adıyla çağır | Bekleyen (neden) |
|---|---|---|---|---|
| Araştırmacı | codegraph (5,4K, y), supabase-postgres-best-practices (3,2K, y) | 8,6K | — | — |
| Uygulayıcı | create-migration (6,3K), supabase-postgres-best-practices (3,2K, y) | 9,5K | supabase (18,8K) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | — | — |
| Doğrulayıcı | verify-before-done (8,9K, y), webapp-testing (3,9K) | 12,8K | — | diff-review: REC-514 kapanınca eklenir (SATIS doğrulayıcı listesinde) |

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
| Araştırmacı | venthub-tasarim-dili (11,4K) | 11,4K | browse (29,9K, y) | — |
| Uygulayıcı | typography (7,3K), venthub-tasarim-dili (11,4K) | 18,7K | ui-ux-pro-max (13,6K, y), design-dna (8,3K, y) | — |
| Çürütücü | plan-challenger (14,6K), web-design-guidelines (4K) | 18,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K), accessibility (14,5K), webapp-testing (3,9K, y) | 27,3K | — | — |

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
| Araştırmacı | codegraph (5,4K), investigate (6K, y), venthub-architecture (6,5K, y) | 17,9K | — | — |
| Uygulayıcı | i18n-conventions (14,2K), venthub-tasarim-dili (11,4K), venthub-architecture (6,5K, y) | 32,1K | vercel-composition-patterns (4,8K, y), vercel-react-best-practices (9,1K, y), threejs-webgl-performance (22,4K, y) | — |
| Çürütücü | plan-challenger (14,6K), supabase-security (14,4K) | 29,0K | — | — |
| Doğrulayıcı | verify-before-done (8,9K), accessibility (14,5K), web-design-guidelines (4K, y), webapp-testing (3,9K) | 31,3K | canary (52K, y), benchmark (28,6K, y) | diff-review: REC-514 kapanınca eklenir (URUN doğrulayıcı "evet") |

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
| Araştırmacı | — | — | find-skills (7,4K), task-observer (7,4K, y) | — |
| Uygulayıcı | — | — | skill-creator (32,4K) | skills-creator: D9 kapanınca eklenir (.agent ağacına yazıyor) |
| Çürütücü | plan-challenger (14,6K) | 14,6K | — | — |
| Doğrulayıcı | verify-before-done (8,9K) | 8,9K | — | — |

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
| verify-before-done | Kapsam listesi depoda olmayan üç skill'e (testing, debugging, git-flow) gönderiyor. WrongStack'ten alınınca kapanır. | D8, REC-519 alma adımı |
| skills-creator | Yeni skill'i `.agent/skills` altına yazıyor. | D9, REC-514 kuyruğu |
| Denetim dörtlüsü (venthub-enterprise-audit, venthub-auditor, venthub-20-eksen-denetimi, venthub-global-rontgen) | Aynı işe talip; "aynı iş" yan yana koşumla kanıtlanmadan biri seçilmez. global-rontgen'de ayrıca bayat yol ve araç adları var. | Yan yana koşum (ayrı iş, ALTYAPI ile) |
| careful, freeze, guard | Üçlü aynı kanca alanında; kıyas bekliyor. | ARAÇ ile yan yana koşum |
| document-generate, document-release | Commit ve push yapıyor, CLAUDE.md düzenliyor. HARİTA yazma alanı. | Uyarlama, HARİTA ile |

## 6. WrongStack skill'leri alınınca eklenecekler (henüz sette YOK)

36 skill'in incelemesi bitti (`C:/tmp/venthub-skill-ihtiyac/wrongstack-skill-inceleme.md`), etkin ağaca alma adımı sürüyor. Aşağıdaki yerleşim **öneridir**; skill etkin ağaçta olmadan `skills:` alanına yazılamaz. Ön yükleme bütçesi dolu olan setlere (ADMIN ve URUN doğrulayıcı 31,3K, URUN uygulayıcı 32,1K) eklemek takas ister: ya bir skill "adıyla çağır"a iner ya da yeni skill oraya konur.

| Skill | Önerilen tür | Departmanlar | Karar (incelemeden) |
|---|---|---|---|
| code-review (5,2K) | Doğrulayıcı | ADMIN URUN EDGE ALTYAPI ARAC SATIS I18N KATALOG GEO-SEO | AL |
| bug-hunter (14,0K) | Araştırmacı, Doğrulayıcı | kod departmanları ve YETENEK | UYARLA-AL (araç adı eşlemesi, `any` şiddeti, cascade modu uygulanmaz) |
| chimera (12,5K) | Doğrulayıcı, Çürütücü (ağır) | ADMIN URUN EDGE ALTYAPI SATIS I18N KATALOG ARAC GEO-SEO | UYARLA-AL |
| testing (5,8K) | Uygulayıcı | kod departmanları | AL |
| debugging (6,2K) | Uygulayıcı | kod departmanları | AL |
| codebase-navigation (4,9K) | Araştırmacı | kod okuyan herkes | UYARLA-AL (tireli araç adlarının altçizgiliye eşlenmesi) |
| research-web (14,3K) | Araştırmacı | MEVZUAT BLOG GEO-SEO ALTYAPI KATALOG ARAC YETENEK SATIS | UYARLA-AL (bilgi kaynağı sırası: kaynak dizini web'den önce) |
| typescript-strict (5,3K) | Uygulayıcı | ADMIN EDGE URUN SATIS KATALOG ARAC | AL |
| node-modern (5,2K) | Uygulayıcı | ARAC ALTYAPI KATALOG GEO-SEO HARITA EDGE | AL |
| react-modern (6,5K) | Uygulayıcı | URUN ADMIN TASARIM | AL |
| security-scanner (8,2K) | Doğrulayıcı, Çürütücü | ALTYAPI EDGE ADMIN SATIS ARAC | UYARLA-AL (PEM başlığı örneği commit'ten ÖNCE maskelenir; npm audit → pnpm audit) |
| data-governance (6,4K) | Çürütücü | SATIS ALTYAPI EDGE ADMIN | UYARLA-AL (tek sahip servis ilkesi kural 12'ye çevrilir, KVKK silme/saklama dili eklenir) |
| prompt-engineering (5,6K) | Uygulayıcı (görev metni yazarken) | YETENEK ARAC HARITA OPS | AL |
| observability (4,8K) | Uygulayıcı | EDGE ALTYAPI ADMIN URUN | AL |
| api-design (5,1K) | Uygulayıcı | EDGE SATIS ADMIN | UYARLA-AL (para alanı pricing-standard'a bağlanır; tenant ve HMAC satırları eklenir) |
| design-system, design-critique, design-craft (15,8K) | Uygulayıcı, Doğrulayıcı | TASARIM URUN ADMIN | UYARLA-AL (`design` aracı yok; OKLCH ve HEX örnekleri kural 8'e çevrilir) |
| web-platform-baseline (6,2K) | Araştırmacı | TASARIM URUN ADMIN GEO-SEO I18N | UYARLA-AL |

Müdür ve ekip lideri düzeyinde kalanlar (çalışan setine girmez): multi-agent, refactor-planner, sdd, mnemosyne, wrongstack-kanban, wrongstack-mailbox-mcp. Hiçbir departmana bağlanmayanlar: docker-deploy, plugin-author, audit-log. Alınamayan: auto-review (çalıştıracak ana program yok).

## 7. Üretici girdisi

Makine okuyan kaynak: `docs/audits/skill-departman-setleri-2026-09-30.json`. HARİTA'nın kart üreticisi her `uret: true` satırı için `.claude/agents/<dept>-<tur>.md` dosyasını üretir; `skills:` alanına `onYukle[].ad` girer. Bu belge ile JSON aynı betikten çıktı, elle düzenlenmez; değişiklik betikte yapılır.

- Satır sayısı: 60 (15 departman × 4 tür). Üretilecek ajan dosyası: 50. Ön yüklenecek skill olmayan 10 satırda `uret: false`, dosya üretilmez.
- `adiylaCagir` ve `bekleyen` alanları `skills:` alanına GİRMEZ. `adiylaCagir` çalışanın görev metnine ya da ajan tanımının gövdesine yazılacak (§9 soru 1).
- `kaynak: "yetenek"` = departman raporunda anılmayan, YETENEK'in eklediği skill. Departman bölümünü okurken bunlara özellikle bakacak.
- `adiylaCagir[].uyari` dolu ise ad çakışması var; o ad `skills:` alanına yazılmaz.

## 8. Ölçüm planı: ön yükleme çalışanı gerçekten değiştiriyor mu

Model kararını (toplama Haiku, yargı Sonnet 5.5) besleyecek sayı budur. Yöntem, işi yapmamış bir ölçücüyle:

1. Aynı dört görev metni (biri her tür için), ön yüklemeli ve ön yüklemesiz iki tanımla, Haiku ve Sonnet 5.5 200K'da beşer kez koşulur.
2. Ölçülen: çalışanın ilk beş araç çağrısı içinde ön yüklü skill'in adımlarına uyup uymadığı (görev metnine skill adı yazılmadan), skill'siz koşumun aynı adımı kendiliğinden yapma oranı.
3. Çıktı: tür başına "ön yükleme davranışı değiştirdi / değiştirmedi" sayısı ve jeton maliyeti. Değiştirmediği yerde ön yükleme kaldırılır, yük azalır.
4. Ön yükleme mekaniğinin kendisi (alan geçerli mi, gövde bağlama giriyor mu) ARAÇ'ın mekanik doğrulamasında.

## 9. Açık sorular

1. **Adıyla çağır katmanı nerede yaşayacak?** Önerim: ajan tanımının gövdesinde tek satır ("Gerektiğinde şu skill'leri Skill aracıyla çağır: …"). OPS "gövde boş" demişti; gövde boş kalırsa müdür her görev metnine adı yazmak zorunda. Karar HARİTA ve OPS'ta.
2. **Ad çakışması.** `supabase` ve `scrape` için `skills:` alanının hangisini çözdüğü ölçülmedi. Çözülene kadar ikisi de ön yüklenmiyor.
3. **Mutasyon testi skill'i (yeni, OPS talebi).** Hazır olunca tüm kod departmanlarının Doğrulayıcı setine girecek; ADMIN ve URUN doğrulayıcı setleri zaten dolu, orada takas gerekecek.
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
