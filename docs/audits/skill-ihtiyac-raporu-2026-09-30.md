# Skill ihtiyaç raporu — birleşik (2026-09-30)

**Sahibi:** YETENEK şeridi. **Girdi:** 14 departman raporu (`C:\tmp\venthub-skill-ihtiyac\<ŞERİT>.md`, depoda değil) + YETENEK'in kendi 45 günlük kullanım sayımı + üç kaynak doğrulaması.
**Bu belge bir hüküm dosyasıdır, emir değildir.** "Keşke olsaydı" bölümü FAZ 2'dir, şimdi yapılmaz. İlk dalga ataması (4 skill → rol kartları ve iş emri YÖNTEM satırı) bu rapordan sonra ayrı PR'la yapılır (OPS 2026-09-30: ayrıca onay gerekmiyor).

## KAYNAK / CETVEL
- Yöneten cetveller: `docs/audits/gstack-skill-envanteri-2026-09-15.md` §1b (yan yana koşulmadan "aynı iş" denmez) ve `docs/standards/execution-method-standard.md`. Cetvel eksiği: skill→rol atamasının kendi cetveli yok; yazımı bu işin 3. adımıdır.
- Ölçüm tazeliği: raporlar 2026-09-30 12:45–13:30; transkript sayımı 2026-09-30 (pencere 2026-08-16'dan bugüne, `~/.claude/projects` altındaki 3447 dosya).
- Saymanın sınırı: "Skill aracıyla açılış" yalnız Skill aracı çağrılarını sayar. Alt ajan içindeki kullanım, komut satırından yapılan iş (ör. `notebooklm ask`), SKILL.md'yi dosya olarak okumak ve MCP araçları (ör. CodeGraph) bu sayıda **görünmez**.
- "Şerit sayısı" = adı raporun herhangi bir bölümünde geçen şerit; §4 (kart eleştirisi) dahil olabilir, yani "istedi" ile "andı" ayrımı sayıda yok. Hüküm sütunu ayrımı yapar.

## 1. Kapsam: kimden rapor geldi

| Durum | Şeritler |
|---|---|
| Rapor geldi (14) | OPS, YETENEK, ALTYAPI, HARİTA, ARAÇ, URUN, GEO-SEO, ADMIN, KATALOG, SATIŞ, TASARIM, MEVZUAT, BLOG, EDGE |
| Rapor YOK | **MARKA** (kartı var; panoda canlı şerit yok, OPS'un teyit ettiği 15 pencere arasında değil) |
| Muaf | I18N-eski (OPS: kısa not, gelmedi) |
| Zayıf kanıt | EDGE (son 14 günde iş yok, 35 gün öncesi), TASARIM/MEVZUAT (tek çalışma günü), SATIŞ (09-16→09-25), ADMIN (12 günü ölçülmedi) |

Raporlarda tahmin yoktur; "denenmedi/ölçülmedi" yazan yerler aşağıda aynen "denenmedi" kalır.

## 2. ORTAK — en az iki departman adı geçirdi

"Denendi" = raporda kanıtla "evet" yazan şerit. "Kartta" = bugün hangi rol kartının "Yetenek ve araç" satırında adı geçiyor.

| Skill | Şerit | Denendi | 45g açılış | Kartta | Hüküm |
|---|---|---|---|---|---|
| plan-challenger | 14/14 | ADMIN, KATALOG, SATIŞ, URUN, BLOG, TASARIM (ALTYAPI: yöntemi ajan istemiyle uyguladı, skill'i çağırmadı) | 33 | ALTYAPI, HARİTA, OPS | **ATA** plan, migration, canlı yazım yazan her role. Bulgu kanıtı: KATALOG'da iki tur BLOK, ADMIN'de Faz 0.5'te 1 kritik + 5 yüksek |
| verify-before-done | 12/14 | hiçbiri | **0** | hiçbirinde | **ATA** her role, ama önce bir şerit denesin (aşağı: 3. not) |
| diff-review | 13/14 | ADMIN (çalışmadı) | 11 | ALTYAPI, HARİTA | **KOŞULLU**: kusuru gidermeden yayma (4. bölüm, D1) |
| create-migration | 5/14 (ADMIN, ALTYAPI, EDGE, SATIŞ, URUN) | ADMIN, SATIŞ | 13 | hiçbirinde | **ATA** migration yazan rollere: ADMIN, ALTYAPI, SATIŞ, URUN. SATIŞ #1425 ile skill'e anon REVOKE ve squawk bilgisi ekledi |
| supabase-security | 5/14 (ADMIN, ALTYAPI, KATALOG, SATIŞ, URUN) | hiçbiri | 0 | ALTYAPI | **ATA** DB yetkisi/RLS/maliyet sızıntısına dokunan rollere |
| supabase | 6/14 | KATALOG | 0 | KATALOG | ATA (KATALOG, ADMIN, ALTYAPI); ölçüm sinyali zayıf |
| notebook-navigator | 4/14 (HARİTA, KATALOG, MEVZUAT, OPS) | hiçbiri (KATALOG CLI ile yaptı) | 2 | hiçbirinde | **ATA** "konuşmuş muyduk" kuralı (hafıza sözleşmesi madde 9) her rolün işi |
| tdd | 7/14 | hiçbiri | 0 | hiçbirinde | **KIYAS BEKLİYOR**: kapı yazımında sabotajlı elle yöntemle yan yana koşulmadı |
| codegraph, graphify | 5 ve 4 | hiçbiri | 0 (skill) | ARAC (CodeGraph) | **DOKUNMA**: graphify Recep kararıyla "olduğu gibi", kullanımla ölçülüyor; CodeGraph MCP aracı ayrı sayılır |
| code-review (yerleşik) | 4/14 | hiçbiri | 5 | — | Yerleşik; kart değil YÖNTEM satırı önerilir |
| security-review | 3/14 | hiçbiri | 0 | — | KIYAS BEKLİYOR: `security-reviewer` alt ajanı (ADMIN'de 2 gerçek para hatası buldu) ile skill ayrı şey |
| venthub-tasarim-dili | 3/14 (ADMIN, TASARIM, URUN) | TASARIM kısmen | 0 | MARKA | **DÜZELT sonra ata** (4. bölüm, D3) |
| i18n-conventions | 2/14 (ADMIN, URUN) | hiçbiri | 4 (`/i18n-conventions`) | ADMIN, URUN | ATA (zaten kartta); kullanım kanıtı yok |
| accessibility | 2 (TASARIM, URUN) | hiçbiri | 0 | — | gstack envanteri "DENE #1", 15 günde kullanılmadı; UI işine bağla |
| investigate | 2 (ADMIN, ARAC) | hiçbiri | 0 | — | KIYAS BEKLİYOR: `investigate` ↔ `gstack-investigate` (envanter §9 sıra 2) |
| pdf | 2 (BLOG, MEVZUAT) | hiçbiri | 1 | — | Taranmış PDF için OCR isteniyor; OCR aracı kurulu değil (iki rapor), skill'in OCR yaptığı ölçülmedi |
| professional-communication | 2 (ARAC, OPS) | dolaylı | 0 | — | Recep çıktı stilinin dayanağı; ayrı atama gerekmez |
| webapp-testing | 2 (SATIŞ, URUN) | hiçbiri | 0 | — | Canlı e2e/görsel ölçümde Playwright'ın skill yüzü; denenmedi |
| to-issues | 4 (ALTYAPI, ARAC, HARİTA, OPS) | hiçbiri | 0 | — | **ATAMA — yanlış eşleşme** (4. bölüm, D2) |
| git-commit | 2 (ADMIN, SATIŞ) | hiçbiri | 2 | — | **ATAMA — biçim çelişkisi** (4. bölüm, D4) |

**3. not (verify-before-done):** 12 şerit istiyor, 0 kez açıldı. Skill'in gövdesi 159 satır ve "VentHub ek kuralları"nın 12 maddesinin çoğu WrongStack posta/kanban içerir (ARAÇ 09-28 uyarlaması). Genel "bitti kanıtı" işine yaradığı **denenmedi**. İlk deneme ALTYAPI ya da GEO-SEO'da (ikisi de #1578 gibi "birleşirken son commit yetişmedi" vakasını anlattı) ve sonuç raporlanmalı.

## 3. DEPARTMANA ÖZEL

| Şerit | İş türü → skill (rapordan) | Not |
|---|---|---|
| ADMIN | ekran kusuru → investigate; servis+test → tdd, supabase; panel → ui-ux-pro-max, venthub-tasarim-dili, i18n-conventions | kartta yalnız i18n var; K9 kuralı uygulamayla çelişiyor (kaç dosya ölçülmedi) |
| ALTYAPI | bağımlılık/güvenlik → security-check, fallow; filo → wrongstack-mailbox-mcp (**evet, kullandı**) | security-check global skill, projede yok; 14 günde çağrılmadı |
| ARAÇ | kanca ayarı → update-config; skill eval → skills-creator, skill-creator (kısmen, PR #1433) | wrongstack-kanban/mailbox kartta, bugün kullanılmadı |
| BLOG | önizleme → artifact-design; şema → diagram, artifact-diagramming | "önizleme yayınlandı ama artifact-design yüklenmedi"; 11 şema bekliyor |
| GEO-SEO | render sonrası kural → seo-audit (**Bright Data eklentisi**, deneme 14 gün, ücret ölçülmedi); canlı izleme → canary | search-console: OAuth jetonu ister, biz hizmet hesabıyla giriyoruz; seo-ecommerce: DataForSEO ücretli = para kapısı |
| HARİTA | D7 ölçümü → agy-orchestrate, multi-agent, llm-council, orion-cli | üçünün içeriğini okumadı |
| KATALOG | CSV → xlsx; PDF çıkarım → venthub-catalog-importer | importer **yalnız `.agent` ağacında**, Claude penceresinde listelenmez |
| MEVZUAT | PDF OCR → pdf; araştırma bölme → "multi-agent-research" | o ad `.agent` ağacında (Antigravity); Claude'daki karşılığı `multi-agent`, aynı iş mi ölçülmedi |
| OPS | kapsam ekseni → plan-ceo-review (gstack DENE #9); karar → llm-council; canlı → sentry-debug-issue, supabase-postgres-best-practices | `review` (gstack) istemiş; envanter §6'da ATLA, kıyas yok |
| SATIŞ | e2e → webapp-testing, gstack-qa; belge → document-generate (gstack) | gstack-qa "ham sürüm, çalıştırılmaz" (envanter §5), document-generate ATLA (§6): **atama yok** |
| TASARIM | yazı tipi → typography; kontrast → accessibility, web-design-guidelines; envanter → multi-agent | alt ajan DesignSync'e erişemedi, iki tur kayıp |
| URUN | arayüz → venthub-tasarim-dili, accessibility; yayın sonrası → webapp-testing | "rendering-cache" cetvel, "Playwright" araç: skill değil |
| YETENEK | doğrulama → plan-challenger, verify-before-done; skill yazımı → skills-creator, find-skills | kartım yok |
| EDGE | (35 gün öncesi iş) supabase, create-migration, plan-challenger | **öneri: emekli**, edge işleri ALTYAPI'da |

## 4. Skill'lerin kendi kusurları (raporlarda geçen, kaynağında doğrulanan)

| No | Skill | Bulgu | Doğrulama |
|---|---|---|---|
| D1 | diff-review | `git diff HEAD` çağırıyor; commitlenmiş dalı `master...HEAD` ile taramıyor. Son 14 günün işi hep commitli dal olduğundan tarama boş döner (ADMIN yaşadı). İhlal bulununca yazdırdığı satırlarda ASCII dışı karakter var (`└─`, `Ç`); Windows konsolunda çökme iddiası (URUN/ALTYAPI notu) | **Doğrulandı:** script satır 63 `["git","diff","HEAD"]`, yedek `--cached`. Çökme **çalıştırılarak ölçülmedi** |
| D2 | to-issues | 4 şerit Linear kaydı için öneriyor; SKILL.md yerel `task.md` yazıyor, Linear'a kayıt açmaz | **Doğrulandı** (SKILL.md 3. adım) |
| D3 | venthub-tasarim-dili | §4 emir kalıbı `design_push.py`, kare indirme `design_dl.py` diyor; TASARIM "401, Design'a yazma yolu artık Linear proje yorumu" diyor | Skill metninde iki betik adı var (satır 76, 84); 401 **ölçülmedi** |
| D4 | git-commit | Conventional Commits (`type(scope): ...`) dayatıyor; depo biçimi `ŞERİT (REC-nn): ...` ve PR `Fixes REC-nn` | **Doğrulandı** (son 8 commit biçimi ve SKILL.md) |
| D5 | create-migration | Kartlarda yok; ALTYAPI/ADMIN/SATIŞ/URUN migration yazıyor | HARİTA da aynı boşluğu ölçmüştü |
| D6 | venthub-catalog-importer | Yalnız `.agent/skills` (36 skill); `.claude/skills` (42 skill) içinde yok | **Doğrulandı** (`ls`) |

## 5. Rapor ↔ ölçüm çelişkileri

| Konu | Rapor | Benim ölçümüm | Sonuç |
|---|---|---|---|
| verify-before-done | 12 şerit ister | 45 günde 0 açılış | Tutarlı: kimse denemedi, ihtiyaç iddiası denenmemiş |
| notebook-navigator | OPS: "başka pencerede 5×" | 2 Skill çağrısı | Fark: CLI (`notebooklm ask`) sayıya girmez; ikisi de kanıtsız yön |
| diff-review | ADMIN dışında adı geçen şeritler denemediğini yazıyor | 11 açılış | Kim açtı **ölçülmedi** (alt ajan/oturum ayrımı yok) |
| plan-challenger | ALTYAPI "skill'i çağırmadım" | 33 açılış | Diğer 6 şerit "evet" diyor; ALTYAPI sayıya girmiyor |
| codegraph | 5 şerit "kullanmadım" | 0 Skill açılışı | CodeGraph MCP aracı ayrı; skill ile araç karışıyor |
| gstack DENE listesi (9 skill) | — | accessibility, seo-ecommerce, careful, guard, xlsx, diagram, benchmark, make-pdf, freeze, plan-ceo-review hiç açılmadı | 09-15 "dene" kararı işe bağlanmamış; raporlarda yalnız beşi (accessibility, seo-ecommerce, xlsx, diagram, plan-ceo-review) bir şerit tarafından anıldı |
| Atanmamış ama kullanılan | — | artifact-design 20, claude-api 7, code-review 5, find-skills 4, update-config 3, skills-creator 3, notebooklm-sync 3, plugin-authoring 3 | Kartlara yazılmadan da açılıyorlar: kullanım işe bağlı, kartla değil |

## 6. KEŞKE OLSAYDI — FAZ 2 (şimdi yapılmaz)

Ortak istekler, kaç şeritten geldiği ve türüyle. "Tür": skill mi, betik/kapı mı, araç düzeltmesi mi (skill yazmak çözüm olmayabilir).

| # | İhtiyaç | Şerit | Tür | Bugünkü kayıp (rapordan) |
|---|---|---|---|---|
| F1 | PR paketi: dal + commit gövdesi + PR gövdesi + `Fixes` satırı + merge ritüeli için dal çözücü; `gh pr edit` token kapsamı yüzünden çalışmıyor | ADMIN, ALTYAPI, ARAÇ, GEO-SEO, URUN (5) | betik + araç düzeltmesi | kanca ters tırnaklı gövdeyi reddetti (1 tur); yanlış dal adıyla 1 koşu boşa; ARAÇ: 4 PR × ≈6 elle adım |
| F2 | Konformans kapısı iskeleti (yorum sıyırıcı, depo geneli çakışma ön kontrolü, sabotajla kanıt sırası) | ADMIN, SATIŞ, ARAÇ, HARİTA, URUN | skill adayı (`tdd` ile KIYAS) | ADMIN: kapı tam koşuda 2 kez kırıldı; SATIŞ: kaç tur sürdüğü ölçülmedi |
| F3 | Linear yardımcıları: alt kayıt aç + kapı kurallı gövde; yazmadan önce kayıt durumu (arşivli/kapalı); güvenli toplu arşiv; karar defteri yazıcısı | GEO-SEO, HARİTA, OPS, ALTYAPI | betik | OPS: 204'te başlık okunmadan 22 kayıt önerildi; HARİTA: arşivli kayda yorum, 1 tur |
| F4 | Migration doğrulama: yerelde squawk; gölge DB'de pg_net/Vault/auth.uid; migration sonrası şema tabanı tek komut | SATIŞ, ALTYAPI, ADMIN, URUN | betik/araç | SATIŞ: CI iki kez kırmızı, ≈10 dk/tur; ADMIN: #1512 README satırı unutuldu, CI kırmızı |
| F5 | Yayın sonrası ölçüm: "canlı HTML'de bu öğe var mı", render sonrası DOM, Core Web Vitals | URUN, GEO-SEO | betik | GEO-SEO: 82 kuralın 9'u "ölçülmedi", bekleyici yayın girmeden "girdi" dedi |
| F6 | Yük altında test zaman aşımını gerçek hatadan ayıran adım (bellek-güvenli parçalı koşu) | ADMIN, HARİTA, ARAÇ | betik | ADMIN: bellek %93'te 4 süre aşımı, her biri elle yeniden koşuldu. Bu oturumda da sanal bellek %97 uyarısı geldi |
| F7 | Taranmış PDF için ücretsiz OCR | BLOG, MEVZUAT | araç kurulumu | BLOG: 6 sayfa ≈ 1 saat elle okuma; alt ajan transkripsiyonu 2 yerde yanlış |
| F8 | Pencere adı çözücü / yeni pencere kaydı | ARAÇ, OPS | araç | ARAÇ: 3 mesaj ulaşmadı; OPS: 15 pencereden 7'si görünmedi |
| F9 | Canlı DB ölçüm sorgu kitaplığı (kolon/dizin/politika/hibe/tetik) | ALTYAPI, SATIŞ | betik/skill | ALTYAPI: REC-368'de aynı sorgu 3 kez yazıldı |
| F10 | Çürütme + bağımsız doğrulama ikilisi tek akış; PR onay özeti (diff + kapılar + risk) | ALTYAPI, OPS | skill adayı | ALTYAPI: ≈20 dk/iş; OPS: diff okunmadan onay |
| F11 | Git'te "iş depoda mı" içerik ölçümü; squash sonrası çakışan PR'ı güvenli yeni dala taşıma | EDGE, GEO-SEO | betik | GEO-SEO: ≈30 dk ve PR numarası kaybı |
| F12 | Tek şeride ait: katalog teknik değer doğrulama + canlı yazım paketi (KATALOG); yazı doğrulama hattı, önizleme içerik-farkı (BLOG); mevzuat alıntı doğrulama, değişiklik izleyici, CELEX indirici (MEVZUAT); Design dosyasını tam indirme (TASARIM); Bright Data render-sonrası (GEO-SEO) | tek şerit | çeşitli | KATALOG: 09-24'te canlı yazım Linear'a işlenmedi; TASARIM: ≈1 saat + tam dosya kesik kopyayla ezildi |

**Not:** Yukarıdakilerin çoğu **skill değil betik/kapı/araç düzeltmesi**. Faz 2 talebi olarak "skill yaz" diye kaydedilmeden önce türü ayrılmalı; F2 ve F10 skill adayıdır, F1 F4 F5 F6 betik işidir.

## 7. KART DÜZELTMELERİ

### 7a. Kartı olmayanlar
| Şerit | Durum | Öneri |
|---|---|---|
| YETENEK | kart yok | HARİTA üreticiye ROLLER satırı ekleyecek; içerik bu belgeden |
| MEVZUAT | kart yok | kart yazılırken `docs/standards/mevzuat-kaydi-standard.md` ve M6.1 BLOG iş bölümü bağlanacak (MEVZUAT raporu) |
| SATIŞ | kart yok (eski adı AUTH) | Kural 13, karar 98, migration işlem cümlesi kartta değil, hafıza dosyasında: soğuk açılışta kaybolabilir (SATIŞ raporu) |
| TASARIM | kart yok | Design ↔ site köprüsü; skill'i bayat (D3) |
| EDGE | kart yok | **emekli öner** (OPS ile aynı görüş): panoda şerit yok, edge işleri ALTYAPI'da; kart açılmaz |
| I18N-eski | kart yok | emekli (OPS: muaf) |
| MARKA | kart var, **rapor yok**, canlı pencere yok | kartı doğrulanamadı |

### 7b. Kartın "Yetenek ve araç" satırında skill olmayan ya da yanlış adlar
| Kart | Satırdaki ad | Ne olduğu |
|---|---|---|
| ADMIN | useAdminTable kiti, vitest + axe | kütüphane/araç |
| ALTYAPI | security-check | global skill, projede yok; 14 günde çağrılmadı |
| ARAC | ast-grep | araç; CodeGraph MCP araç/skill karışık |
| BLOG | rehber-yazisi cetveli, kaynak dizini, görsel ihtiyaç listesi | üçü de belge/veri, satırda **hiç skill yok**; kullandığı plan-challenger kartta yok |
| GEO-SEO | Search Console, PageSpeed ölçümü | araç/betik; seo-audit **Bright Data eklentisi** (proje skill'i değil) |
| HARİTA | alt ajan çürütme, docs/README.md haritası | yöntem ve belge |
| KATALOG | kaynak dizini betikleri, csv-import-export cetveli | betik ve cetvel; en işe yarayan plan-challenger kartta yok |
| OPS | board.cjs, Linear, SendMessage, workflow | araç; OPS "kart skill satırı okunmadı" dedi |
| URUN | rendering-cache cetveli, Playwright ölçümü | cetvel ve MCP aracı |

### 7c. Sahiplik ve metin çelişkileri (kart ↔ gerçek)
- **Kanca tasarımı:** HARİTA kartı "kanca TASARIMI HARİTA'dadır" diyor; ARAÇ son 14 günde 46 PR'ın hepsinde tasarım ve yazımı yaptı.
- **ARAÇ kartı iç çelişki:** Yetki "kanca kurulumu", Yasak "settings değişikliği OPS kapısı"; kanca kaydı settings.json'da (#1567'de OPS onayı beklendi).
- **`scripts/board/board.cjs`:** hem ALTYAPI hem ARAÇ kartında; hangisinin kazandığı ölçülmedi.
- **`scripts/db/**`:** KATALOG kartı `scripts/db/product-data/**`, panoda `scripts/db/**` ALTYAPI'da; hangisinin kazandığı ölçülmedi.
- **ALTYAPI Dosyalar** satırında edge fonksiyonları (`healthz`, `iyzico-payment`, `order-paid-webhook`), `_shared/satis_kipi.ts`, `rec368-*` planı yok.
- **URUN Dosyalar** satırında satış kipi (`scripts/kip`, checkout, legal) yok; bu haftanın işinin önemli bölümü.
- **ARAÇ durum dosyası adı:** kart `memory/<rol>-lane-day-<tarih>.md`, gerçek `arac-serit-durumu.md`.
- **BLOG Durum:** "Kapalı (iş dondurma)" ama 09-25'te üç yazı doğrulandı; durum bayat olabilir (OPS'a soruldu).
- **ADMIN K9:** "UI bileşeni ham supabase çekmez" kuralı uygulamayla çelişiyor; kaç dosya ölçülmedi.

### 7d. Kartlarda hiç geçmeyen ama en çok istenen skill'ler
verify-before-done (12 şerit), create-migration (5), notebook-navigator (4), tdd (7). HARİTA'nın 09-30 ölçümüyle aynı boşluk: 42 proje skill'inden yalnız 10'unun adı bir kartta.

## 8. Tek öneri (OPS'a)

İlk dalgada dört skill'i rol kartlarına ve iş emri `YÖNTEM:` satırına bağlayın: **plan-challenger** (plan/migration/canlı yazım yazan her role), **create-migration** (ADMIN, ALTYAPI, SATIŞ, URUN), **notebook-navigator** ("konuşmuş muyduk" soruları, herkes) ve **verify-before-done** (herkes, ama ALTYAPI ya da GEO-SEO ilk denemeyi yapıp sonucu yazsın). **diff-review, to-issues ve git-commit'i bağlamayın:** diff-review önce `master...HEAD` düzeltmesini bekler (D1), to-issues Linear'a yazmaz (D2), git-commit biçimi depo biçimiyle çelişir (D4). Bu düzeltmeler `.claude/skills/**` altında, yani YETENEK'in claim'inde; OPS onayı verirse ayrı PR'la yaparım.
