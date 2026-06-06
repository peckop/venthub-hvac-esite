---
name: teamwork-director
description: >
  Teamwork-preview prompt hazırlama yöneticisi. Projenin kalite seviyesini
  (project-dna.yaml) okur, kullanıcının geliştirme talebini proje standartlarıyla
  harmanlar ve zenginleştirilmiş prompt oluşturarak takıma delege eder.
  Kullanıcı "takıma iş ver", "teamwork ile geliştir", "sprint başlat",
  "/teamwork-preview" kullanmak istediğinde veya büyük bir geliştirme görevini
  ajan takımına delege etmek istediğinde tetiklenir.
---

# teamwork-director

Teamwork-preview için **birleşik prompt hazırlama yöneticisi**. Bu skill, orijinal teamwork-preview workflow'unu (Steps 1-9) içerir ve üstüne **proje kalite katmanını** (Project DNA) ekler.

---

## ⚠️ Öncelik Kuralı (Priority Directive)

Bu skill, sistemin built-in `/teamwork-preview` talimatlarının **genişletilmiş üst kümesidir** (superset). Her iki talimat birden yüklendiğinde:

1. **Bu skill önceliklidir.** Çakışan talimatlarda bu skill'in versiyonu geçerlidir.
2. **Kritik fark:** Built-in talimat "Minimal Requirements" prensibi uygular. Bu skill ise **"Tier-Appropriate Requirements"** uygular. `project-dna.yaml` dosyasında tier tanımlıysa, Tier-Appropriate Requirements geçerlidir.
3. **Ek adım:** Bu skill, built-in workflow'un 1-9 adımlarından **önce** bir **Step 0 (Project DNA Okuma)** adımı ekler. Bu adım atlanmamalıdır.
4. **Prompt şablonu:** Bu skill'in Step 9'daki genişletilmiş şablonu (PROJECT DNA, QUALITY CONTRACT, CRITICAL RULES bölümleri dahil) kullanılmalıdır.

Eğer `project-dna.yaml` dosyası proje kök dizininde **bulunamazsa** ve kullanıcı oluşturmak istemezse, built-in talimatlar aynen geçerli olur — bu skill sessizce devre dışı kalır.

---

## Ne Zaman Kullanılır

- Kullanıcı `/teamwork-preview` ile çalışmak istediğinde
- "Takıma iş ver", "teamwork ile geliştir", "sprint başlat" dediğinde
- Herhangi bir büyük geliştirme görevini ajan takımına delege etmek istediğinde
- Yeni bir sprint prompt'u hazırlanacağında

## Ne Zaman KULLANILMAZ

- Kullanıcı basit bir düzeltme istiyorsa (tek dosya fix, typo, küçük refactor)
- Kullanıcı sadece araştırma/analiz istiyorsa
- Kullanıcı açıkça skill'siz direkt teamwork kullanmak istiyorsa

---

## Two-Phase Workflow

**(1)** Kullanıcıyla birlikte Steps 0-9 üzerinden iyi yapılandırılmış bir görev prompt'u hazırla,
**(2)** `invoke_subagent` ile `teamwork_preview` multi-agent sistemine delege et.
Her iki faz da zorunludur — hazırlık olmadan delegasyon yapılamaz.

---

## Artifact-Based Workflow

Süreç boyunca bir **prompt draft artifact** (`prompt_draft.md`) yönet.
Bu artifact hem kullanıcıya canlı görüntü hem de adım takipçisi olarak çalışır.
**Hemen oluştur** — aşağıdaki iskeleti kullan:

```markdown
# Teamwork Project Prompt — Draft

> Status: Step 0 — Reading Project DNA
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Tier: [TBD]

[Project description — 1-2 sentences]

Working directory: [TBD]
Integrity mode: [TBD]

## PROJECT DNA
[Auto-filled from project-dna.yaml]

## QUALITY CONTRACT
[Auto-filled based on tier]

## CRITICAL RULES — DO NOT VIOLATE
[Auto-filled from project-dna.yaml boundaries]

## Requirements

### R1. [TBD]

### R2. [TBD]

## Acceptance Criteria

### [TBD]
- [ ] [TBD]

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
```

Her adımdan sonra artifact'i güncelle.

---

## Core Principles (Tier-Aware)

| # | Prensip | Kural | Tier Etkisi |
|---|---------|-------|-------------|
| 1 | **Specify What, Not How** | Gereksinimleri ve kabul kriterlerini tanımla. Kullanıcı istemediği sürece uygulama detayı verme (dosya adları, mimari, algoritmalar, kütüphaneler). | Tüm tier'larda geçerli |
| 2 | **Objective Verification** | Her gereksinim için uygulayıcı ajanın kendi öz değerlendirmesinden bağımsız bir doğrulama mekanizması gerekir. Programmatic doğrulama idealdir; açık rubric'li agent-as-judge kabul edilebilir. | Tüm tier'larda geçerli |
| 3 | **Acceptance Criteria = Guardrails** | Çıtayı kullanıcının gerçek ihtiyaçlarına göre kur. Amaç: kalitesiz işin kendi kendini onaylamasını engellemek. İlk çalıştırma yetersiz kalırsa, kriterleri sıkılaştır ve yeniden çalıştır. | Tüm tier'larda geçerli |
| 4 | **Tier-Appropriate Requirements** | Gereksinim derinliği proje tier'ına göre ayarlanır. Enterprise'da zengin ve detaylı, Prototype'da minimal. Detay için aşağıdaki tabloya bak. | **Tier'a göre değişir** |

### Prensip 4 Detayı — Tier-Appropriate Requirements

| Tier | Davranış |
|------|----------|
| 🏢 **Enterprise** | Gereksinimler ZENGİN olmalı: test zorunluluğu, hata yönetimi, logging, dokümantasyon, tip güvenliği açıkça belirtilmeli. Sadece "çalışsın yeter" yaklaşımı **YASAK**. |
| 💼 **Professional** | Kritik path'ler için detaylı gereksinim, geri kalan için takımın kararına bırak. |
| 🚀 **MVP** | Minimal gereksinim. Sadece kullanıcının önemsediği şeyleri belirt, gerisini takım çıkarsın. |
| 🧪 **Prototype** | Sadece çalışması yeterli. Kısıtlama minimum. |

---

## Workflow

Steps 0-9'u interaktif olarak işle.

**Önceden hazırlanmış prompt varsa:** Steps 0-9'a göre tara, karşılanan adımları atla, eksikleri işle. İyi hazırlanmış prompt'lar bile genellikle doğrulama (Step 5) veya kabul kriteri (Step 6) eksiktir.

**Kullanıcı direkt delegasyona atlamak isterse:** Bir kez geri it — yetersiz belirtilmiş prompt'lar kötü sonuçların ana nedenidir; gereksinimler + kriterler üzerine 5 dakika harcamak ilk çalıştırma kalitesini önemli ölçüde artırır. Israr ederse seçimine saygı göster ama beklentileri sabitle: "Minimal prompt ile ilerliyoruz — sonuçlar daha fazla iterasyon gerektirebilir."

---

### Step 0: Project DNA Okuma (Orijinal Workflow'dan ÖNCE)

> Bu adım bu skill'e özeldir ve orijinal teamwork-preview workflow'unda yoktur.
> Tüm sonraki adımları besleyen temel bilgiyi sağlar.

#### 0a. project-dna.yaml'ı Bul ve Oku

Projenin kök dizininde (working directory) `project-dna.yaml` dosyasını ara.

**Dosya VARSA:**
1. Oku ve aşağıdaki değerleri çek:
   - `project.tier` → Tüm adımlarda tier-aware davranışı belirler
   - `quality.test_baseline` → Step 5 ve 9'da otomatik enjekte edilir
   - `quality.test_command` → Step 5 ve 9'da otomatik enjekte edilir
   - `boundaries.protected_paths` → Step 7 ve 9'da CRITICAL RULES'a eklenir
   - `boundaries.critical_rules` → Step 9'da CRITICAL RULES'a eklenir
   - `stack` → Tier Enterprise ise stack-specific kurallar eklenir
2. Artifact'e `PROJECT DNA` bölümünü doldur
3. `QUALITY CONTRACT` bölümünü tier'a göre `references/tier-quality-matrix.md`'den doldur
4. `CRITICAL RULES` bölümünü boundaries'dan doldur
5. Status'u "Step 1 — Eliciting project idea" yap

**Dosya YOKSA:**
1. Kullanıcıya bildir: "Projenizde `project-dna.yaml` bulunamadı. Oluşturmamı ister misiniz?"
2. Kullanıcı onaylarsa:
   - Projeyi tara: README.md, pyproject.toml, package.json, test dizinleri, mevcut test sayısı
   - Otomatik bir DNA draft'ı oluştur
   - Kullanıcıya göster ve onay al
   - Proje kök dizine kaydet
3. Kullanıcı istemezse: Tier bilgisi olmadan devam et, ama uyar:
   "Tier bilgisi olmadan ilerlenecek — prompt Enterprise kalite standartları içermeyecek."

#### 0b. context.md Referansı (Opsiyonel)

Projenin kök dizininde `context.md` varsa:
- Mimari bağlam için referans al
- Tamamını prompt'a **EKLEME** — sadece mevcut görevle ilgili bölümleri özetle
- Token tasarrufu için özet 500 kelimeyi geçmemeli

---

### Step 1: Elicit the Idea

Sor: Ne geliştirmek istiyorsunuz? Amacı nedir (demo, production, eval, exploration)? Hedef kitle kim?

1-2 cümlede yakala → bu prompt'un açılışı olur.
Artifact'i güncelle: `[Project description]`'ı değiştir, status'u Step 2 yap.

---

### Step 2: Identify Ambiguity

Birden fazla makul yorumu olan noktaları tespit et. Her biri için somut seçenekler sun:

```
Örnek: "Arama motoru yap"

Belirsiz: Veri kaynağı ne?
→ Seçenekler:
  a) Harici web sitelerini tara (risk: anti-bot, rate limiting)
  b) Sağlanan statik veri setini indeksle
  c) Ajan takımının kararına bırak
```

Sadece kapsamı veya doğrulamayı etkileyen kararları sor. Kullanıcı gündeme getirmediği sürece uygulama detaylarını sorma.

Araştırılacak temel boyutlar:

| Boyut | Soru |
|-------|------|
| **Kapsam** | Nihai ürün ne kadar büyük/karmaşık olmalı? |
| **Teknoloji kısıtları** | Kesin kısıtlamalar (sadece Python, harici bağımlılık yok)? |
| **Altyapı** | Ağ erişimi, uzak depolama, job launching gerekiyor mu? |
| **Kalite çıtası** | Cilalı demo mu, proof-of-concept mı? |
| **Bütünlük** | Integrity enforcement ne kadar sıkı olmalı? (bkz. Step 3) |
| **Doğrulama kaynakları** | Mevcut test suite'leri veya script'leri var mı? (bkz. Step 5) |

**Tier doğrulaması (YENİ):**
project-dna.yaml'dan okunan tier'ı kullanıcıya doğrulat:
> "Projeniz **{tier}** seviyesinde tanımlı. Bu görev için de aynı seviye geçerli mi?"

---

### Step 3: Determine Integrity Mode

Integrity enforcement'ın ne kadar sıkı çalışacağını belirle.
Kullanıcıdan "bir mod seç" DEMİYORUZ — bunun yerine **davranışsal sorular** sor:

```
Projeniz üzerinde çalışan ajan takımı için aşağıdaki davranışlardan
hangileri yasaklanmalıdır?

a) Çekirdek mantık için mevcut açık kaynak projelerden kod kopyalama
b) Çekirdek işlevsellik için hazır kütüphane/framework kullanma (ör. Flask, React)
c) Harici script çalıştırma veya diğer araçlara yürütme delege etme
d) Uygulamadan önce beklenen davranışı anlamak için test kaynak kodunu okuma
e) Yukarıdakilerin hiçbiri — takım çalışan herhangi bir yaklaşımı kullanabilir
```

Cevapları moda eşle:
- (e) veya hiçbiri seçilmedi → `integrity_mode: development`
- (a)-(d)'den herhangi biri seçildi ama HEPSİ değil → `integrity_mode: demo`
- (a)-(d) hepsi seçildi → `integrity_mode: benchmark`

Varsayılan: development. project-dna.yaml'da `integrity_mode` zaten tanımlıysa, kullanıcıya göster ve doğrulat.

---

### Step 4: Draft Requirements

2-5 gereksinim bloğu (R1, R2, ...) yaz.

| Kural | Gerekçe |
|-------|---------|
| Her gereksinim: **ne** gerektiği üzerine 1-3 cümle | Kapsamı netleştirir |
| Kullanıcı özellikle istemediği sürece **nasıl** yapılacağına dair ipucu verme (mimari, algoritmalar, dosya yapısı) | Ajan takımının çözüm alanını korur |
| Kullanıcı bir tercih belirtmediyse gereksinim ekleme | Aşırı kısıtlamayı önler |
| "Yetenekli bir mühendis aşırı kısıtlanmış hissetmeli mi?" → evetse kes | Turnusol testi |

**Tier-Specific Otomatik Enjeksiyon (YENİ):**

Tier **Enterprise** ise, kullanıcının gereksinimleri YANISIRA aşağıdakiler otomatik eklenir:

```markdown
### R[N]. Enterprise Kalite Standartları
Bu proje Enterprise seviyesinde geliştirilmektedir. Tüm yeni kod için:
- Yeni public fonksiyonlar type hint / type annotation içermelidir
- Yeni modüller / önemli fonksiyonlar için unit test zorunludur
- Mevcut {test_baseline} test regresyona uğramamalıdır
- Hata yönetimi: uygun exception handling ve logging olmalıdır
- Public API'ler için docstring / JSDoc zorunludur

### R[N+1]. Dokümantasyon Güncellemesi
Tüm geliştirme tamamlandıktan sonra, yapılan değişiklikleri yansıtacak şekilde kök dizindeki ilgili markdown dosyaları güncellenmelidir:
- `README.md` — Yeni mimari yapı, API değişiklikleri, proje yapısı güncellemeleri
- `CHANGELOG.md` — Yapılan tüm değişikliklerin kronolojik kaydı
- Kök dizindeki diğer ilgili `.md` dosyaları (varsa)

**DİKKAT:** `CONTEXT.md` dosyasına DOKUNULMAMALIDIR — bu dosya NotebookLM tarafından yönetilir.

### R[N+2]. Gelecek Geliştirme Önerileri (Kapsam Sınırlı)
Tüm gereksinimler tamamlandıktan sonra, ekip **yalnızca kendi çalıştığı alanda** tespit ettiği iyileştirme fırsatlarını sunmalıdır:
- Dokunduğu dosyalarda gördüğü teknik borç veya iyileştirme fırsatları
- Çözdüğü sorunların doğal devamı olan sonraki adımlar
- Refactoring sırasında keşfettiği performans veya güvenlik riskleri

**KAPSAM SINIRI:** Dokunmadığı alanlarda öneri YAPMAMALIDIR. Projenin mimari aksiyomlarını ve korunan dosyalarını bilmeden yapılan öneriler kabul edilemez.

Bu rapor `RECOMMENDATIONS.md` olarak kök dizine yazılmalıdır.
```

Tier **Professional** ise:

```markdown
### R[N]. Kalite Standartları
Kritik path'ler için unit test zorunludur. Mevcut {test_baseline} test korunmalıdır.
Temel hata yönetimi ve public API dokümantasyonu beklenmektedir.

### R[N+1]. Dokümantasyon Güncellemesi
Geliştirme sonrası `README.md` ve `CHANGELOG.md` güncellenmelidir.
**DİKKAT:** `CONTEXT.md` dosyasına DOKUNULMAMALIDIR.

### R[N+2]. Gelecek Geliştirme Önerileri (Kapsam Sınırlı)
Ekip, **yalnızca çalıştığı alanda** tespit ettiği iyileştirme önerilerini `RECOMMENDATIONS.md` olarak sunmalıdır. Dokunmadığı alanlarda öneri YAPMAMALIDIR.
```

Tier **MVP** veya **Prototype** ise: Otomatik kalite enjeksiyonu YAPILMAZ. Orijinal "Minimal Requirements" prensibi geçerli.

---

### Step 5: Design Verification

> **Bu neden önemli:** Doğrulama bir **zorlama mekanizmasıdır**, kullanıcının hedefinin birebir aynası değil. Amacı, iteratif build→test→debug döngüsünü **zorlayan** objektif bir test hedefi oluşturmaktır. Doğrulama olmadan, ajanlar yarım kalmış işi kendi onaylar ve erken durur.

Her gereksinim için **objektif** bir doğrulama mekanizması tasarla:

| Tür | Ne zaman kullanılır | Örnekler |
|-----|---------------------|----------|
| **Programmatic** (tercih edilen) | Otomasyona uygun | Bot script'leri, referans benchmark'ları, bilinen I/O'lu test suite'leri, metrik script'leri |
| **Agent-as-judge** | Programmatic test zor | Bağımsız ajan + iki yargıcın çoğunlukla hemfikir olacağı kadar somut açık rubric |

**Kullanıcı doğrulama kaynakları:** Kullanıcıya sor:

> Projenin doğruluğunu kontrol edebilecek mevcut test suite'leriniz, script'leriniz, değerlendirme rehberleriniz veya kabul kriterleriniz var mı?

Evet ise, prompt'a bir Verification Resources bölümü olarak ekle.

**Baseline Enjeksiyonu (YENİ):**

project-dna.yaml'da `test_command` ve `test_baseline` varsa otomatik ekle:

```markdown
### Programmatic Verification — Regression Guard
Mevcut test suite: `{test_command}`
Baseline: {test_baseline} tests passing
Bu baseline'ın korunması her gereksinim için programmatic doğrulama olarak dahildir.
```

**Doğrulama anti-pattern'leri:**

| ❌ Pattern | Risk |
|-----------|------|
| Öz değerlendirme | Uygulayıcı ajan kendi işini yargılar |
| Öznel kriterler ("iyi görünüyor") | Yanlışlanamaz |
| Hiç kriter yok | Erken öz onaylama |
| İmkansız yüksek eşikler | Boşa harcanan iterasyonlar |

---

### Step 6: Set Acceptance Criteria

Doğrulama mekanizmalarını somut, kontrol edilebilir kriterlere dönüştür.
Amaca ve tier'a göre kalibre et:

| Amaç + Tier | Çıta |
|-------------|------|
| Production + Enterprise | Tam test coverage, docstring, type safety, zero regression, structured logging |
| Production + Professional | Kritik path coverage, temel dokümantasyon, zero regression |
| Demo + Any | Etkileyici ama zaman bütçesinde ulaşılabilir |
| Eval + Any | Kesin ve tekrarlanabilir — ölçüm ciladan önce gelir |
| Exploration + Any | Gevşek — sadece fizibilite kanıtla |

Yaygın kullanıcı ayarlamaları: "çok kolay" → sıkılaştır; "çok zor" → gevşet veya opsiyonel yap; "çok kısıtlayıcı" → kısıtlayıcı kriterleri kaldır.

---

### Step 7: Infrastructure Constraints

Proje kontrollü altyapı gerektiriyorsa, bir gereksinim ekle:

| İşlem | Neden kontrol et |
|-------|-------------------|
| Uzak dosya I/O (GCS, cloud storage) | Rastgele yollara yazmayı önle |
| Job launching | Pahalı kontrollü job'ları önle |
| Ağ erişimi | Anti-bot korumasına veya istenmeyen servislere çarpmayı önle |

Pattern: "X için sağlanan kontrollü API'yi kullanmalısınız. Mantığı siz yazarsınız; yürütme ortamı harici olarak yönetilir."

Altyapı gerekmiyorsa atla (ör. saf HTML/JS projeleri).

**Protected Paths Enjeksiyonu (YENİ):**

project-dna.yaml'da `protected_paths` varsa otomatik CRITICAL RULES'a ekle:

```markdown
## CRITICAL RULES — DO NOT VIOLATE
Aşağıdaki dosya ve dizinlere DOKUNULMAMALIDIR:
{protected_paths listesi — her biri ayrı satırda}

{critical_rules listesi — her biri ayrı satırda}
```

---

### Step 8: Choose Working Directory

Proje dosyalarının nerede yaşayacağını sor.

project-dna.yaml'da `working_dir` tanımlıysa otomatik doldur ve kullanıcıya sadece doğrulat:
> "Çalışma dizini: `{working_dir}` — doğru mu?"

Tanımlı değilse, varsayılan:
```
~/teamwork_projects/{PROJECT_NAME}
```

Nihai prompt'a üst düzey direktif olarak ekle:
```
Working directory: <path>
```

---

### Step 9: Assemble and Validate

Artifact'in şu yapıda olduğundan emin ol:

```markdown
[1-2 cümle proje açıklaması — kullanıcının geliştirme talebi]

Working directory: {Step 8'den seçilen yol}
Integrity mode: {Step 3 sonucu: development | demo | benchmark}
Project tier: {project-dna.tier}  ← YENİ

## PROJECT DNA
- Project: {project.name}
- Domain: {project.domain}
- Stack: {stack.language} — {stack.frameworks}
- Test baseline: {quality.test_baseline} tests passing
- Test command: `{quality.test_command}`

## QUALITY CONTRACT — {TIER} GRADE
{references/tier-quality-matrix.md'den tier'a uygun bölüm}

## CRITICAL RULES — DO NOT VIOLATE
{boundaries.protected_paths → "Bu dosyalara dokunma" formatında}
{boundaries.critical_rules → her biri ayrı satırda}

## Requirements
### R1. {Kullanıcının asıl geliştirme talebi}
### R2-RN. {Step 4'te oluşturulan gereksinimler}
### R[N]. {Tier-specific kalite standardı gereksinimi — Enterprise/Professional}
### R[N+1]. Dokümantasyon Güncellemesi {Tier Enterprise/Professional ise otomatik}
### R[N+2]. Gelecek Geliştirme Önerileri {Tier Enterprise/Professional ise otomatik}

## Acceptance Criteria
### Functional
- [ ] {Fonksiyonel kriterler}
### Quality
- [ ] {Kalite kriterleri — tier'a göre}
### Regression
- [ ] `{test_command}` çalıştırıldığında ≥ {test_baseline} test geçmeli
### Documentation {Enterprise/Professional ise otomatik}
- [ ] `README.md` güncellenmiş olmalı
- [ ] `CHANGELOG.md` tüm değişiklikleri içermeli
- [ ] `CONTEXT.md` dosyasına dokunulmamış olmalı
### Future Recommendations {Enterprise/Professional ise otomatik}
- [ ] `RECOMMENDATIONS.md` kök dizinde mevcut ve en az 5 somut öneri içermeli
```

**Doğrulama kontrol listesi:**

- [ ] Kullanıcı açıkça istemedikçe uygulama ipuçları yok
- [ ] Her kabul kriteri insan yargısı olmadan objektif olarak kontrol edilebilir
- [ ] Gereksinimler kullanıcı ihtiyaçlarına göre kapsamlandırılmış, ajanın "yapması gereken"e göre değil
- [ ] Altyapı kısıtları neyin kontrol edildiğini ve nedenini açıkça belirtiyor
- [ ] Yetenekli bir mühendis aşırı kısıtlanmış hissetMEZ
- [ ] Bir ajan yarım kalmış bir sonucu önemsizce kendi onaylayaMAZ
- [ ] **YENİ:** project-dna.yaml okunmuş ve PROJECT DNA bölümü dolu
- [ ] **YENİ:** Tier Enterprise ise QUALITY CONTRACT bölümü mevcut
- [ ] **YENİ:** test_baseline Acceptance Criteria'da mevcut
- [ ] **YENİ:** protected_paths CRITICAL RULES'da mevcut
- [ ] **YENİ:** Tier Enterprise/Professional ise Documentation Acceptance Criteria mevcut
- [ ] **YENİ:** Tier Enterprise/Professional ise Future Recommendations Acceptance Criteria mevcut
- [ ] **YENİ:** CONTEXT.md koruması CRITICAL RULES'da belirtilmiş

Nihai prompt'u kullanıcıya sun. Onay iste.
Artifact status'unu ayarla: `Ready for launch — awaiting user approval`.

Onaylandıktan sonra → **Delegation Protocol**'ü uygula (son bölüm).

---

## Anti-Patterns

| ❌ Anti-pattern | Neden |
|----------------|-------|
| Artifact dosya yolunu prompt kaynağı olarak geçme | Artifact başlatmadan sonra değişebilir; her zaman metni kopyala |
| Kullanıcı onayı olmadan teamwork subagent'ı çağırma | Kullanıcı hazırlığı onaylamalı |
| Artifact oluşturmayı atlama | Artifact kullanıcının prompt'a penceresidir |
| İterasyon sırasında draft'ı kaybetme | Kullanıcı Step 9 sonrası değişiklik isterse güncelle ve yeniden sun |
| Varsayılan olarak uygulama ipucu ekleme | Ajan takımının çözüm alanını daraltır. Kullanıcı özellikle kısıtlamak isterse (ör. "Python kullan"), gereksinim olarak ekle ama trade-off'u belirt |
| project-dna.yaml'ı okumadan prompt oluşturmak | Tier bilgisi olmadan kalite kontrol edilemez |
| Tier Enterprise iken "Minimal Requirements" uygulamak | Enterprise projede yetersiz kalır, takım kaliteyi düşürür |
| test_baseline'ı prompt'a eklememek | Takım regresyon kontrolü yapamaz |

---

## Iterate After First Run

Prompt hazırlama iteratiftir. İlk çalıştırma yetersiz kalırsa, kabul kriterlerini sıkılaştır veya daha iyi doğrulama ekle — uygulama ipuçları eklemek yerine bunu tercih et. Güncellenmiş prompt ile yeniden çalıştır.

---

## Delegation Protocol

Kullanıcı onayladığında ("onaylıyorum", "go", "tamam", "launch", "başlat"):

1. `prompt_draft.md`'den tam prompt metnini çıkar.
2. `invoke_subagent` ile `TypeName: teamwork_preview`, `Prompt: tam metin` olarak delege et.
   (`teamwork_preview` subagent listesinde gizlidir ama invoke edilebilir.)

Artifact status'unu ayarla: `Launched`.
