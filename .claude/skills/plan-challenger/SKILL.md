---
name: plan-challenger
description: >-
  Bir teknik PLAN, PRD, RFC, mimari tasarım ya da "şöyle yapacağız" önerisi ortaya çıktığında — veya
  kullanıcı "planı çürüt", "red team yap", "plan challenge", "stress-test et", "bu plan sağlam mı",
  "uygulamadan önce riskleri/zayıf noktaları bul" dediğinde (açıkça "skill" demese bile) — BU SKILL'İ
  KULLAN. Planı uygulamadan ÖNCE bağımsız bir red-team denetiminden geçirir: plandaki her varsayımı
  somut koda dayanarak çürütür ve kanıta dayalı bir red_team_report.md üretir (kod yazmaz/değiştirmez).
  Beş VentHub-özel başlık: (1) RLS/tenant izolasyonu & data bleeding, (2) RSC/'use client' sınırı &
  PPR/Suspense, (3) Edge runtime kısıtları, (4) webhook HMAC/idempotency & sipariş-iade monotonluğu,
  (5) migration auto-apply & DI & i18n parity & design-token. Sınır: salt kod bütünlüğü/integrity
  taraması → venthub-auditor; enterprise teslim (10/10) denetimi → venthub-enterprise-audit;
  diff/commit incelemesi → diff-review. Bu skill yalnız PLAN-belgesinin uygulama-öncesi red-team'idir.
---

# Plan Challenger — VentHub Plan Çürütme & Red-Team Denetimi

Önerilen teknik planların, mimari tasarımların ve özellik/göç planlarının zayıf noktalarını,
**çalışma-zamanı (runtime) risklerini**, platform uyumsuzluklarını ve multi-tenant veri sızıntısı
(data bleeding) gibi açıkları **uygulamadan önce** yakalamak için bağımsız ve muhalif bir denetim.

## Kullanım Amacı

Planlardaki varsayımlar ("RSC içinde `useI18n` çalışır", "bu sorgu zaten tenant-scoped", "migration'ı
merge etmek prod'a dokunmaz", "lint/tsc geçti = güvenli") çoğunlukla gerçek sistem kısıtlarıyla çelişir.
Bu skill "Şeytanın Avukatı" rolünü üstlenerek bu varsayımları **somut koda dayanarak** çürütür ve daha
dayanıklı bir plan oluşturulmasını sağlar. **Rapor üretir; kod yazmaz/değiştirmez/silmez.**

> **Altın kural (A4):** Plan varsayımı kod ile çelişirse **KOD KAZANIR.** Hiçbir plan iddiasını
> doğrulamadan "doğrudur" sayma — `Read` / `Grep` / `Glob` / `codegraph_explore` ile yerelden teyit et.

## İşletim Adımları

### Adım 1 — Planı ve Kod Tabanını Oku
1. Hedef planı (`docs/plans/*.md` veya verilen taslak) `Read` ile baştan sona oku.
2. Planda adı geçen **dosya, fonksiyon, tablo, RLS politikası, Edge Function ve i18n anahtarlarını**
   yerelden doğrula:
   - Yapısal/etki analizi → `codegraph_explore` (verbatim kaynak) ve `codegraph_impact` (blast radius).
   - Metin/desen arama → `Grep`; dosya keşfi → `Glob`. Tek dosya/satır onayı → `Read`.
   - **Önce CodeGraph** (AST, ~1sn taze, kesin); grep'i sadece CodeGraph'ın kapsamadığı detay için kullan.
3. Planın uyması gereken cetvel = **`CLAUDE.md` Mutlak Kurallar (31 madde)** + `CONTEXT.md §14`. Plan
   bunlardan birini ihlal ediyor mu, ölç.

### Adım 2 — Zayıf Noktaları Zorla (Red-Teaming)
Planı şu **beş VentHub-özel** başlık altında eleştir. Listelenen tuzaklar sahada yaşanmış gerçek
olaylardır — plan bunlardan birine düşüyorsa **Kritik** işaretle.

**1. RLS / Tenant İzolasyon & Data Bleeding (felaket sınıfı)**
- Plandaki **her okuma/yazma, Edge API ve Realtime kanalı tenant-scoped mı?** Tek bir scope'suz sorgu
  = tenant'lar arası sızıntı. `tenant_id` filtresi / RLS politikası eksik mi?
- Yetki kararı **`app_metadata`** üzerinden mi? **`raw_user_meta_data` yasak** (kullanıcı düzenleyebilir
  → yetki yükseltme). Plan hangisini varsayıyor?
- `unstable_cache` / `revalidateTag` anahtarları **`lang` VE `tenantId`** içeriyor mu? Eksikse bir
  tenant'ın cache'i diğerine servis edilir.

**2. RSC / `'use client'` Sınırı & PPR/Suspense (sessiz prerender çökmesi)**
- Plan bir Server Component'e (`page.tsx` veya altındaki RSC) **hook** (`useI18n`, `useState`,
  `useSearchParams`, context) ekliyor mu? → `'use client'` gerekir. **`tsc`/`lint`/`test` bunu YAKALAMAZ,
  yalnız `next build` (prerender) patlar.**
- `useSearchParams` kullanan bileşen `<Suspense fallback={<Skeleton/>}>` ile sarılı mı? Değilse PPR çöker.
- Ana rotalarda `ssr: false` var mı? → **yasak.**
- Plan "lint/tsc geçti → güvenli" diyorsa **yanlış**: kapıya **`pnpm build`** dahil mi? (CI'daki
  `build:ci` Vercel'in `next build`'ini eşitlemez — typedRoutes / import-sort farkları.)

**3. Edge Runtime Kısıtları (middleware'de patlar)**
- Plan `middleware.ts` içinde **DB sorgusu / Supabase çağrısı** yapıyor mu? → Edge'de **yasak**. Tenant
  çözümü header / Edge Config ile olmalı.
- Edge'de çalışacak kod Node-only API'ye (fs, native crypto, Buffer'a bağımlı kütüphane) dokunuyor mu?

**4. Webhook HMAC + Replay/Idempotency + Durum Monotonluğu (para/sipariş bütünlüğü)**
- Webhook (İyzico/Resend/Twilio) **HMAC-SHA256 doğrulaması** + **replay guard** (timestamp/idempotency)
  içeriyor mu?
- Sipariş/iade durum geçişleri **monoton (yalnız ileri)** mı? Terminal→aktif geri-alma engelli mi? Plan
  bir durumu geri sarıyorsa **Kritik**.
- Admin işlemleri `admin_audit_log`'a yazılıyor mu?

**5. Sessiz Prod Etkisi & Statik-Kapı Kör Noktaları (yapı runtime'ı görmez)**
- **Migration auto-apply:** Plan `supabase/migrations/*.sql` içeren bir dalı **master'a merge** ediyor mu?
  → `supabase-migrate.yml` **otomatik prod DB'ye uygular.** "Sadece komutla uygula" isteniyorsa migration
  merge EDİLMEMELİ. Plan bunu ayırt ediyor mu?
- **DI ihlali:** `lib/services/*` fonksiyonları ilk parametre olarak `supabase: SupabaseClient` alıyor mu?
  Modül-düzeyi statik client importu = ESLint `no-restricted-imports` + AST testi ihlali.
- **i18n sessiz ham-key:** Yeni anahtar **nokta içeren düz key** (`'table.x'`) mı? `getDictValue`
  **NESTED-ONLY** → ham key render eder. `tsc`/`lint`/parity/build YAKALAMAZ, yalnız `keycheck`. Plan
  TR/EN parite (`en: typeof tr`) ve keycheck'i hesaba katıyor mu?
- **Paylaşılan-primitif runtime instabilitesi:** Plan `useRole`/context gibi paylaşılan hook'tan her
  render **yeni nesne/fonksiyon** döndürüp bir effect-dep'e koyuyor mu? → sonsuz render döngüsü (admin
  donması yaşandı). **Statik kapı bunu görmez** → plan bir **runtime smoke** (Playwright e2e) öngörüyor mu?
- **Design token:** Arbitrary Tailwind (`w-[92vw]`), HEX renk, `PCFSoftShadowMap` var mı?

### Adım 3 — Kanıta Dayalı Çürütme Raporu Üret
Bulguları **şu şablona** göre `red_team_report.md` olarak yaz:

```markdown
# Red Team Mimari Denetim Raporu: [Plan Adı]

## 1. Giriş ve Metodoloji
[Amaç + incelenen dosya/şema/RLS/Edge Function/i18n anahtarlarının kısa özeti]

## 2. Detaylı Teknik Analiz ve Çürütmeler
### 2.1. [Zayıf Nokta Başlığı]
* **Bulgu:** ...
* **Somut Kanıt:** [orderStatusService.ts:42](src/lib/services/orderStatusService.ts#L42)
* **Hangi Kural:** [CLAUDE.md #N / CONTEXT.md §14 maddesi]
* **Risk Derecesi:** [Kritik / Yüksek / Orta / Düşük]

## 3. Stratejik Öneriler ve Aksiyon Planı
[Her zayıf nokta için somut, dayanıklı düzeltme veya fallback. Mümkünse "şu cetvele / INV-* conformance
testine bağla" diye KALICI katman öner — hand-patch değil.]

## 4. Sonuç
[Genel risk: PASS / KOŞULLU / BLOK]
```

## AXIOMS (Kesin Kurallar)

- **A1 — Kanıt zorunlu:** Her itiraz somut kod/DB/şema kanıtına dayanmalı; havada teorik itiraz geçersiz.
- **A2 — Bağımsız denetçi:** Tarafsızlık için denetimi planı **yazan bağlamdan ayrı** yürüt. Pratikte:
  red-team analizini **`Agent` aracıyla bağımsız bir subagent**'a yaptır (ör. `Explore` salt-okunur ya da
  `general-purpose`), brief'i "bu planı ÇÜRÜT, emin değilsen FAIL de" olsun. Üretici ≠ yargıç.
- **A3 — Tıklanabilir kanıt:** Kod referansları **göreli markdown link** (`[dosya.ts:42](path/dosya.ts#L42)`)
  formatında olmalı — VSCode'da tıklanabilir.
- **A4 — Kod kazanır:** Plan varsayımı kod ile çelişirse koddan/CodeGraph'tan doğrulamadan "geçerli" sayma.
- **A5 — Statik kapı runtime'ı görmez:** Bir riski `tsc`/`lint`/`test` görmüyorsa bunu rapor et ve plana
  **runtime kapısı** (`next build` prerender, Playwright e2e smoke, keycheck) ekletmeyi öner.

## İlgili Skiller (sınır)
- Kod bütünlüğü / mimari integrity taraması → **venthub-auditor**
- Enterprise teslim (10/10) denetimi → **venthub-enterprise-audit**
- Diff/commit yıkıcı-desen incelemesi → **diff-review**
- Yapısal kod sorgusu (kim çağırıyor / blast radius) → **codegraph**

Bu skill yalnız **PLAN-belgesinin uygulama-öncesi red-team'i** içindir.
