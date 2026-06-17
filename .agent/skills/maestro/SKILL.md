---
name: maestro
description: >-
  Orchestrate a large, DIVISIBLE code change — migrating or transforming many files/pages/modules to ONE
  shared pattern (a kit, hook, component, API, or convention) — as PARALLEL subagent waves with quality
  gates. Use maestro whenever a task means applying the SAME structural change across many independent
  targets: "migrate the N admin pages to the shared table kit", "move every service onto the new client
  factory", "refactor these 12 modules to the new error API", "convert all forms to the new validation
  pattern", or any audit-then-fix that spans many files. It runs architect subagents to produce
  piece-divided plans, then a pipeline of migrate→judge subagents IN PARALLEL (bounded, no
  network), then the orchestrator (you) centrally verifies (typecheck + lint + test + a11y), fixes, and
  commits per wave. Reach for maestro the moment you catch yourself about to do many similar migrations
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
---

> # ⚠️ UYARLAMA NOTU — Antigravity (BU LLM, ÖNCE BUNU OKU)
> Bu skill **Claude Code'un `Workflow` aracı** için yazıldı. **Faz 2**'deki `Workflow` / `pipeline()` /
> `agent()` / `parallel()` ve "## Workflow iskeleti"ndeki `.js` örnek **Antigravity'de YOK.**
>
> **Uyarlaman gereken TEK şey = "çalıştırma motoru":** Faz 2'yi kendi subagent mekanizmanla yeniden yaz —
> `invoke_subagent` ile **paralel worker spawn** → her worker bitince **ayrı bir judge subagent spawn** →
> yapısal JSON (verdict) topla. ".js iskeleti" tam olarak bunun Claude karşılığı; onu Antigravity primitifine çevir.
>
> **GERİSİ aynen geçerli (tool-agnostik), DEĞİŞTİRME:** Faz 0 triyaj · Faz 1 mimar-plan · worker→**YARGIÇ**
> deseni · Faz 3 merkezî kapı (typecheck/lint/test/build/axe) · Faz 4 dalga-commit · guardrail'ler · dalga boyutlandırma.
> **Çekirdek felsefe DEĞİŞMEZ:** worker ÜRETİR (dar/sert brief) → yargıç ÇÜRÜTÜR → merkezî kapı KORUR.
> "tamamlandı" yazısına ASLA güvenme; çıktıyı deterministik doğrula.

# maestro — Paralel Göç Orkestrasyonu (parçala böl yönet)

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

### Faz 2 — Paralel göç + yargıç (çalıştırma motoru: Antigravity için `invoke_subagent`)
Her hedef için **göç-ajanı → yargıç-ajanı** zinciri **paralel** koşar. (Claude'da `Workflow.pipeline()`;
Antigravity'de `invoke_subagent` ile paralel worker + ayrı judge spawn — UYARLAMA NOTU'na bak.)
Göç-ajanı brifingi **DAR ve sert** olmalı (kaçağı kaynakta keser):
- **ALTIN ÖRNEK göm:** brief'e aynı repodan ÇALIŞAN bir before/after örnek koy (önceden taşınmış bir
  dosyanın diff'i). Ajan uydurmaz, birebir kopyalar — "ilk seferde doğru"nun en yüksek getirili tek kuralı.
- Sadece KENDİ dosyalarına dokun; ortak altyapıyı / barrel'ları / başka hedefi DEĞİŞTİRME.
- İnternet/araç-dokümanı (context7/web) YOK — her şey repo'da.
- Yasak desen yok (`as any` / `as unknown as` / `@ts-ignore` / `eslint-disable`).
- pnpm/tsc/test KOŞMA (merkezi doğrulama orkestratörde). Yapısal sonuç döndür.
**Yargıç-ajan** çürütücüdür: hedefe özel bir **kontrat** (kalıp kullanımı, yazma-kapısı, i18n parity, a11y,
yasak desen, mod doğruluğu, test sadakati) üstünden "neyi YANLIŞ" arar; emin değilse FAIL der.

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

## Akış iskeleti (kavramsal — motoru Antigravity primitifine çevir)
Her hedef göç→yargıç'tan **bağımsız** akar (bariyer yok). Brief'leri kilitli plandan kur. Kavramsal şema:

```
HER hedef için PARALEL:
  1) worker  = invoke_subagent(göç_brief[hedef])      → { filesWritten, mode, selfChecks } (yapısal JSON)
  2) judge   = invoke_subagent(yargıç_brief[hedef, workerÇıktısı]) → { pass, issues[], severity }
TÜMÜ bitince: verdiktleri topla → Faz 3 merkezî kapı → düzelt → Faz 4 commit
```
> (Claude karşılığı `Workflow.pipeline(migrate, judge)` idi; aynı mantık, farklı primitif.)

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
