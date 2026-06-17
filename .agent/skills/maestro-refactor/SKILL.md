---
name: maestro-refactor
description: >-
  Orchestrate a large, DIVISIBLE code change — migrating or transforming many files/pages/modules to ONE
  shared pattern (a kit, hook, component, API, or convention) — as PARALLEL subagent waves with quality
  gates. Use maestro-refactor whenever a task means applying the SAME structural change across many independent
  targets: "migrate the N admin pages to the shared table kit", "move every service onto the new client
  factory", "refactor these 12 modules to the new error API", "convert all forms to the new validation
  pattern", or any audit-then-fix that spans many files. It runs architect subagents to produce
  piece-divided plans, then a pipeline of migrate→judge subagents IN PARALLEL (bounded, no
  network), then the orchestrator (you) centrally verifies (typecheck + lint + test + a11y), fixes, and
  commits per wave. Reach for maestro-refactor the moment you catch yourself about to do many similar migrations
  one-by-one yourself — divide and parallelize instead, even when each one is "hard". DO NOT use for a
  single-file edit, a one-off bug fix, pure read-only scanning, or anything one agent finishes in a couple of steps.
category: orchestration
metadata:
  triggers:
    - parçala böl yönet
    - paralel göç
    - dalga halinde göç
    - migrate N pages
    - çok sayıda dosyayı aynı kalıba taşı
    - orchestrate migration
    - maestro-refactor
---

# maestro-refactor — Paralel Göç ve Kod Düzenleme Orkestrasyonu (parçala böl yönet)

Bir işi tek tek, sırayla, kendin yapma dürtüsü geldiğinde dur. "Zor" demek "solo yap" demek **değildir** —
"iyi parçala, denetimi sıkı tut" demektir. maestro, **çok-hedefli yapısal değişikliği** (N sayfayı ortak
motora, N modülü yeni API'ye…) bir **subagent filosuyla paralel** koşturur; sen orkestratör olarak
plan + doğrulama + birleştirme + commit yaparsın.

> **Çekirdek ilke:** Ajanlar **üretir** (paralel, hızlı, dar odak). Yargıç-ajan + **senin merkezi kapın**
> (typecheck/lint/test/a11y) **kaliteyi korur.** "Tamamlandı" yazısına ASLA güvenme — çıktıyı kendin doğrula.
> Worker subagent = dar/odaklı (az düşünür, çok net brief). Orkestratör = derin (plan + doğrula + sentez).

## Ne zaman kullan / KULLANMA

**Kullan:** aynı yapısal değişikliği **birçok bağımsız hedefe** uygulamak (göç, toplu refactor, kalıba
oturtma, denetle-sonra-düzelt). İşaret: "şunu 14 yerde de yapmam lazım" diye düşünmek.

**KULLANMA:** tek-dosya değişikliği · tek seferlik bug-fix · yalnız OKUMA/tarama (→ CodeGraph) · bir ajanın
birkaç adımda bitirdiği iş · tek, sıkı-bağlı, bölünemez değişiklik.

## Akış — 5 faz

### Faz 0 — Kapsam & triyaj (önce gerçeği oku)
Hedefleri **gerçekten oku** (gerekirse paralel salt-okunur keşif ajanlarıyla). **ÖNCE ölü-kod ele:** her
aday hedef için `CodeGraph callers` / grep ile **sıfır-importer** olanları bul — bunlar göç hedefi DEĞİL,
**ÖLÜ kovasına** gider (taşıma; kullanıcıya sor: sil ya da parket). Sonra kalanları sınıflandır:
**TEMİZ** (kalıba düz oturur → paralelle) · **TASARIM-GEREK** (iş mantığı dolanık → dikkatli/sıralı) ·
**AYKIRI** (kalıba sığmaz / özel arketip → paralel filoya SOKMA, controller tek tek tasarlar) ·
**SIRALI** (altyapıyı evrimleştirir → en son, tek tek).
Nominal skora/sıraya değil **gerçek karmaşıklığa** göre sırala. (Ders: bir dalgada "8 hedef"in 3'ü ölü,
2'si aykırı çıktı — okumadan paralele sokmak boşa iş + bozuk göç olurdu.)

### Faz 1 — Mimar (parça-bölünmüş plan)
Her **zor** hedef için **bir Plan-tipi subagent** → kod YAZMADAN ayrıntılı göç planı: mod kararı, veri/fetch
tasarımı (join/RPC/özel sorgu), her yazmanın denetim-kapısından geçişi, özel UX→hangi slot, **parça-bölünmesi**
(sıralı küçük alt-görevler), riskler. **Kararları SEN kilitlersin** (ajan önerir, sen seçersin). Çıktı
yapısal/öz olsun.

### Faz 2 — Paralel göç + yargıç (Antigravity `invoke_subagent` ile orkestrasyon)
Her bağımsız hedef için bir **göç/refactor subagent'ı** (worker) ve ardından bir **yargıç subagent'ı** (judge) zincir halinde koşar. Antigravity ortamında bu akış şu şekilde yönetilir:
1. **Dinamik Tanımlama ve Paralel Çağrı**: Orkestratör, `define_subagent` ile hedefe veya göreve uygun özel subagent tiplerini (worker ve judge) tanımlar. Ardından, `invoke_subagent` kullanarak tüm worker subagent'ları tek bir paralel dalga (wave) olarak başlatır.
2. **Asenkron Takip ve Reaktif Uyandırma**: Alt ajanlar arka planda çalışırken orkestratör bekleme moduna geçer (UI'da sürekli döngüye girmek veya periyodik durum sorgulamak gerekmez). Bir subagent görevini tamamlayıp mesaj gönderdiğinde veya bir arka plan görevi sonlandığında sistem orkestratörü reaktif olarak uyandırır.
3. **Ardışık Yargı Adımı**: Her bir worker tamamlandığında, orkestratör o worker'ın çıktısını (veya ürettiği diff'i) değerlendirmek üzere bağımsız bir yargıç subagent'ı (`invoke_subagent`) tetikler. Yargıç, hedefe özel kontrat doğrultusunda kodu inceler ve yapılandırılmış bir JSON verdict (hüküm) döndürür.

Göç-ajanı (worker) brifingi **DAR ve sert** olmalı (kaçağı kaynakta keser):
- **ALTIN ÖRNEK göm:** brief'e aynı repodan ÇALIŞAN bir before/after örnek koy (önceden taşınmış bir dosyanın diff'i). Ajan uydurmaz, birebir kopyalar — "ilk seferde doğru"nun en yüksek getirili tek kuralı.
- Sadece KENDİ dosyalarına dokun; ortak altyapıyı / barrel'ları / başka hedefi DEĞİŞTİRME.
- İnternet/araç-dokümanı (context7/web) YOK — her şey repo'da.
- Yasak desen yok (`as any` / `as unknown as` / `@ts-ignore` / `eslint-disable`).
- pnpm/tsc/test KOŞMA (merkezi doğrulama orkestratörde). Yapısal sonuç döndür.

**Yargıç-ajan** çürütücüdür: hedefe özel bir **kontrat** (kalıp kullanımı, yazma-kapısı, i18n parity, a11y, yasak desen, mod doğruluğu, test sadakati) üstünden "neyi YANLIŞ" arar; emin değilse FAIL der.

### Faz 3 — Merkezi doğrulama kapısı (SEN)
Yargıç verdiklerini **oku**, sonra **tüm ağacı KENDİN** geçir: `type-check` + `lint` + `test --run`
(göçü kilitleyen **INV/conformance testi DAHİL** — ratchet'in kendisi) + **`pnpm build`** + a11y(axe).
Yakalanan her şeyi düzelt. Bu fazın varlık sebebi: ajanlar hata üretir; "tamamlandı" yanıltır. Tarihten ders:
tip-hatası (union → Record), a11y heading-atlaması, eksik i18n anahtarı, test-mock eksikliği — hepsi burada
yakalandı. **`build` AYRI bir kapı:** `'use client'` / `next/headers` RSC-sınır hataları SADECE build'de çıkar
(type-check/lint/test geçse bile) — bu oturumda tam bunu yedik.

### Faz 4 — Dalga başına commit
Yalnız o dalganın dosyalarını sahnele (pipeline artefaktlarını/ilgisizleri HARİÇ tut). Conventional commit.
Temiz, geri-alınır dönüm noktası → sonraki dalga buradan dallanır.

## Dalga boyutlandırma
- **TEMİZ** hedefler: 3–4'ü aynı anda paralel (her biri 1 ajan + yargıç).
- **TASARIM-GEREK**: yine ajanla ama **iyi brief'li**, az sayıda; gerekirse parçalara böl.
- **ÖZEL ARKETİP**: ertele (ayrı faz) ya da tek tek.
- **SIRALI/altyapı-evrim** hedef: **en son, tek tek** — kit'i kırarsa geri dönebilesin.
- Dalga sırasında **paylaşılan altyapıyı DONDUR** (yalnız orkestratör dokunur) → ajanlar çakışmaz.

## Akış iskeleti (Antigravity Orchestration Skeleton)

Antigravity ortamında paralel subagent dalgalarını yönetmek ve reaktif uyandırma döngüsünü kurmak için aşağıdaki kodlama/adımlama desenini takip et:

```typescript
// 1. Subagent Tiplerini Tanımla (Gerekirse)
define_subagent({
  name: "migration_worker",
  description: "Bileşenleri DataTableKit formatına taşıyan refactor işçisi",
  system_prompt: "... system prompt ...",
  enable_write_tools: true,
  toolSummary: "Define migration worker subagent",
  toolAction: "Defining subagent"
});

define_subagent({
  name: "migration_judge",
  description: "Göç edilen bileşeni DataTableKit kurallarına göre denetleyen yargıç",
  system_prompt: "... system prompt ...",
  enable_write_tools: false,
  toolSummary: "Define migration judge subagent",
  toolAction: "Defining subagent"
});

// 2. Paralel Worker Ajanlarını Başlat
const targets = ["page1.tsx", "page2.tsx", "page3.tsx"];
const workers = invoke_subagent({
  Subagents: targets.map(file => ({
    TypeName: "migration_worker",
    Role: `${file} Refactorer`,
    Prompt: `Refactor ${file} to use DataTableKit. Before/after example: ...`
  })),
  toolSummary: "Spawn parallel migration workers",
  toolAction: "Invoking subagents"
});
// Her worker için bir conversationId döner.

// 3. Reaktif Bekleme ve Yanıt Toplama
// Sistem, subagent'lardan mesaj geldikçe orkestratörü reaktif olarak uyandıracaktır.
// Gelen mesajlardan worker tamamlanma durumunu ve çıktılarını (JSON veya diff) topla.

// 4. Her Worker Tamamlandığında Yargıç Ajanını Spawn Et
const judges = invoke_subagent({
  Subagents: workers.map(w => ({
    TypeName: "migration_judge",
    Role: `${w.file} Reviewer`,
    Prompt: `Review changes made by worker in ${w.file}. Verdict: ...`
  })),
  toolSummary: "Spawn parallel migration judges",
  toolAction: "Invoking subagents"
});

// 5. Tüm Yargıçlardan Verdict (JSON) Topla
// Verdict formatı: { pass: boolean, issues: string[], classification: "CLEAN" | "FIX" | "CRITICAL" }
// Eğer tüm yargıçlar PASS verirse veya bulunan FIX'ler düzeltilirse:
// -> Faz 3 Merkezî Kapı doğrulamalarına geç (type-check, lint, test, build).
// -> Faz 4 Commit & Push.
```

## Guardrail'ler (acıyla öğrenildi)
- **Kaçak ajanı kaynakta kes:** brief'te internet/context7 YASAK + dosya allowlist + adım-sınırı.
- **Takılma watchdog:** ajanın bittiğini **UI'dan değil, yapısal çıktının (JSON) varlığından** doğrula;
  sert zaman/adım sınırı koy. (Bir ajan 36 dk context7 döngüsüne girip paraleli kilitlemiş, UI yanlış
  "tamamlandı" demişti — gerçekte çıktı yoktu.)
- **Yargıç ≠ güven.** Yargıç çürütür ama **son söz senin merkezi kapın.** İkisi de olmadan birleştirme.
- **Tek doğrulama pası / dalga:** N dosyayı tek `type-check`/`lint`/`test` ile geçir (ajan başına ağır tsc koşturma).
- **Dosya disjoint'liği** paralel güvenliğin temeli: her ajan ayrı dosya kümesi yazsın; ortak dosya = çakışma.
- **Paylaşılan merkezî dosya gerekirse:** worker ona DOKUNMAZ; gideceği kaydı **JSON delta** olarak döndürür,
  orkestratör merkezde birleştirir (dict/registry/allowlist). Worker'lar çakışmaz. (Gerekmiyorsa delta boş —
  ör. her worker yalnız kendi bileşenini düzenliyorsa.)

## Kanıtlanmış örnek (referans)
VentHub admin panelinin **DataTableKit**'e göçü: 9 liste sayfası, kod-okumalı triyajla 4'ü Faz-2'ye ayrıldı;
kalan **7 sayfa 3 dalgada** (Errors → AuditLog+Categories → Movements+ErrorGroups+Returns+Users) bu akışla
göçtü. Yargıç + merkezi kapı her dalgada gerçek hata yakaladı; her dalga tsc 0 · lint 0 · test yeşil · axe 0
ile commit'lendi.
