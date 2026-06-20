---
name: plan-challenger
description: 'VentHub teknik PLANLARINI (docs/plans/*.md) uygulamadan ÖNCE bağımsız
  red-team denetiminden geçirir: plandaki varsayımları somut koda dayanarak ÇÜRÜTÜR
  (RLS/tenant izolasyon, RSC/use-client sınırı, PPR/Suspense, Edge runtime kısıtları,
  webhook idempotency, migration auto-apply, DI, i18n parity) ve red_team_report.md
  üretir. Tetik: planı çürüt, red team denetle, plan challenge, planı stress-test
  et. Kod integrity check için venthub-auditor, enterprise teslim denetimi için venthub-enterprise-audit,
  git/test/db işlemleri için KULLANMA.'
category: audit
metadata:
  triggers:
  - planı çürüt
  - red team denetle
  - plan challenge
  - planı stress-test et
  - varsayımları çürüt
  - plan red team
  inputs:
  - docs/plans/implementation_plan.md
  outputs:
  - red_team_report.md
---

# Plan Challenger — VentHub Plan Çürütme & Red-Team Denetimi

Bu yetenek, VentHub'da önerilen teknik planların, mimari tasarımların ve özellik/göç planlarının
zayıf noktalarını, **çalışma-zamanı (runtime) risklerini**, platform uyumsuzluklarını ve
multi-tenant veri sızıntısı (data bleeding) gibi açıkları **uygulamadan önce** tespit etmek için
bağımsız ve muhalif bir denetim süreci işletir.

## Kullanım Amacı

VentHub planlarındaki varsayımlar ("RSC içinde useI18n çalışır", "bu sorgu zaten tenant-scoped",
"migration'ı merge etmek prod'a dokunmaz", "lint/tsc geçti = güvenli") çoğunlukla gerçek sistem
kısıtlarıyla çelişir. Bu yetenek "Şeytanın Avukatı" rolünü üstlenerek bu varsayımları **somut koda
dayanarak** çürütür ve daha dayanıklı bir plan oluşturulmasını sağlar. **Rapor üretir; kod yazmaz/silmez.**

> **Altın kural:** Plan varsayımı ile kod çelişirse **KOD KAZANIR.** Hiçbir plan iddiasını
> "doğrudur" kabul etme — `view_file` / `list_dir` / grep / CodeGraph ile yerel kaynaktan doğrula.

## İşletim Adımları

### Adım 1 — Planı ve Kod Tabanını Okuma
1. Hedef planı (`docs/plans/*.md` veya önerilen taslak) detaylıca `view_file` ile incele.
2. Planda adı geçen **dosya, fonksiyon, tablo, RLS politikası, Edge Function ve i18n anahtarlarını**
   yerel kaynaktan doğrula (`view_file`, `list_dir`, grep, CodeGraph `codegraph_explore`/`impact`).
   Plandaki hiçbir varsayımı doğrulamadan geçme. CLAUDE.md'deki **Mutlak Kurallar (31 madde)** ve
   `CONTEXT.md §14` planın uyması gereken cetveldir — plan bunları ihlal ediyor mu, ölç.

### Adım 2 — Zayıf Noktaları Arama ve Zorlama (Red-Teaming)
Planı şu **beş VentHub-özel** başlık altında eleştir. Her başlıkta listelenen tuzaklar sahada
yaşanmış gerçek olaylardır — plan bunlardan birine düşüyorsa **Kritik** işaretle.

**1. RLS / Tenant İzolasyon & Data Bleeding (felaket sınıfı)**
   * Plandaki **her okuma/yazma, Edge API ve Realtime kanalı tenant-scoped mı?** Tek bir scope'suz
     sorgu = tenant'lar arası veri sızıntısı. `tenant_id` filtresi / RLS politikası eksik mi?
   * Yetki kararı **`app_metadata`** üzerinden mi alınıyor? **`raw_user_meta_data` kullanımı yasak**
     (kullanıcı kendi düzenleyebilir → yetki yükseltme). Plan hangisini varsayıyor?
   * `unstable_cache` / `revalidateTag` anahtarları **`lang` VE `tenantId`** içeriyor mu? Eksikse
     bir tenant'ın cache'i diğerine servis edilir.
   * Yeni RLS politikası `auth.uid()` / JWT claim'lerini doğru kaynaktan mı okuyor?

**2. RSC / `'use client'` Sınırı & PPR/Suspense (sessiz prerender çökmesi)**
   * Plan bir Server Component'e (`page.tsx` veya altındaki RSC) **hook** (`useI18n`, `useState`,
     `useSearchParams`, context) ekliyor mu? → `'use client'` gerekir. **tsc/lint/test bunu YAKALAMAZ,
     yalnız `next build` (prerender) patlar.** (Yaşandı: i18n RSC sınır boşluğu.)
   * `useSearchParams` kullanan bileşen `<Suspense fallback={<Skeleton/>}>` ile sarılı mı? Sarılmazsa
     PPR derlemesi çöker / tüm sayfa CSR'a zehirlenir.
   * Ana rotalarda `ssr: false` (dynamic import) var mı? → **yasak.**
   * Plan "lint/tsc geçti → güvenli" diyorsa bu **yanlış**: kapıya **`pnpm build`** dahil edilmiş mi?
     (CI'daki `build:ci` Vercel'in `next build`'ini eşitlemez — typedRoutes ve import-sort farkları.)

**3. Edge Runtime Kısıtları (middleware'de patlar)**
   * Plan `middleware.ts` içinde **DB sorgusu / Supabase çağrısı** yapıyor mu? → Edge'de **yasak**.
     Tenant çözümü header / Edge Config ile olmalı, DB ile değil.
   * Edge'de çalışacak kod Node-only API (fs, crypto native, Buffer'a bağımlı kütüphane) kullanıyor mu?

**4. Webhook HMAC + Replay/Idempotency + Durum Monotonluğu (para/sipariş bütünlüğü)**
   * Webhook (İyzico/Resend/Twilio) **HMAC-SHA256 imza doğrulaması** + **replay guard**
     (timestamp/idempotency anahtarı) içeriyor mu? Eksikse sahte/tekrarlı çağrı riski.
   * Sipariş/iade durum geçişleri **monoton (yalnız ileri)** mı? Terminal→aktif geri-alma engelli mi?
     Plan bir durumu geri sarıyorsa **Kritik**.
   * Admin işlemleri `admin_audit_log`'a yazılıyor mu?

**5. Sessiz Prod Etkisi & Statik-Kapı Kör Noktaları (yapı runtime'ı görmez)**
   * **Migration auto-apply:** Plan `supabase/migrations/*.sql` içeren bir dalı **master'a merge**
     ediyor mu? → `supabase-migrate.yml` **otomatik prod DB'ye uygular.** "Sadece komutla uygula"
     isteniyorsa migration'ı merge ETMEMELİ. Plan bunu ayırt ediyor mu?
   * **DI ihlali:** `lib/services/*` fonksiyonları ilk parametre olarak `supabase: SupabaseClient`
     alıyor mu? Modül-düzeyi statik client importu = ESLint `no-restricted-imports` + AST testi ihlali.
   * **i18n sessiz ham-key:** Yeni anahtar **nokta içeren düz key** (`'table.x'`) mı? `getDictValue`
     **NESTED-ONLY** → ham key render eder. tsc/lint/parity/build YAKALAMAZ, yalnız `keycheck`.
     Plan TR/EN parite (`en: typeof tr`) ve keycheck'i hesaba katıyor mu?
   * **Paylaşılan-primitif runtime instabilitesi:** Plan `useRole`/context gibi paylaşılan hook'tan
     her render **yeni nesne/fonksiyon** döndürüp bir effect-dep'e koyuyor mu? → sonsuz render döngüsü
     (admin donması yaşandı). **Statik kapı (tsc/lint) bunu görmez** → plan bir **runtime smoke**
     (Playwright e2e) kapısı öngörüyor mu?
   * **Design token:** Arbitrary Tailwind değeri (`w-[92vw]`), HEX renk, `PCFSoftShadowMap` var mı?

### Adım 3 — Teknik Çürütme Raporu Hazırlama
Analizleri içeren bir markdown raporu üret. **Her zaman** şu şablona göre oluştur ve `red_team_report.md`
olarak yaz:

```markdown
# Red Team Mimari Denetim Raporu: [Plan Adı]

## 1. Giriş ve Metodoloji
[Denetimin amacı + incelenen dosya/şema/RLS/Edge Function/i18n anahtarlarının kısa özeti]

## 2. Detaylı Teknik Analiz ve Çürütmeler
[Zayıf noktaları kategori bazında detaylandır. Her itirazı dosya yolu, fonksiyon/tablo adı ve
mümkünse satır numarasıyla SOMUT kanıta dayandır.]

### 2.1. [Zayıf Nokta Başlığı]
* **Bulgu:** ...
* **Somut Kanıt:** [filename](file:///c:/Users/alize/venthub-hvac/path/to/file#L123)
* **Hangi Kural:** [CLAUDE.md #N / CONTEXT.md §14 maddesi]
* **Risk Derecesi:** [Kritik / Yüksek / Orta / Düşük]

## 3. Stratejik Öneriler ve Aksiyon Planı
[Çürütülen her zayıf nokta için somut, dayanıklı iyileştirme veya fallback mekanizması öner.
Mümkünse "şu cetvele/INV-* conformance testine bağla" diye kalıcı katman öner — hand-patch değil.]

## 4. Sonuç
[Planın mevcut haliyle uygulanmasının genel risk analizi: PASS / KOŞULLU / BLOK.]
```

## AXIOMS (Kesin Kurallar)

- **A1:** Her itiraz **somut kod/DB/şema kanıtına** dayanmalıdır; havada kalan genel teorik itiraz geçersizdir.
- **A2:** Bağımsızlığı korumak için denetim, planı **yazan ajandan FARKLI** bir subagent (Red Team rolünde)
  ile yapılmalıdır. (Üretici ≠ yargıç.)
- **A3:** Rapordaki kod referansları **tıklanabilir link** (`file:///...#L<satır>`) formatında olmalıdır.
- **A4:** Plan varsayımı kod ile çelişirse **KOD KAZANIR.** İddiayı koddan/CodeGraph'tan doğrulamadan
  "geçerli" sayma.
- **A5:** Statik kapı (tsc/lint/test) bir riski **görmüyorsa**, bunu rapor et ve plana **runtime kapısı**
  (`next build` prerender, Playwright e2e smoke, keycheck) ekletmeyi öner — "yapı runtime davranışını görmez".
