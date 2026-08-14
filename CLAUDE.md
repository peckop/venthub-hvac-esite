# CLAUDE.md — VentHub HVAC

> Bu dosya her oturumda otomatik yüklenir. **Kısa ve yüksek sinyalli** tutulur.
> Kapsamlı referans için → **`CONTEXT.md`** (NotebookLM üretir, elle yeniden yazma).
> Milestone/DI detayı → `PROJECT.md` · Üretilmiş master MD'ler → `docs/`

## Proje Özeti

HVAC (iklimlendirme/havalandırma) sektörüne özel **e-ticaret platformu**, şu an
**multi-tenant SaaS**'a dönüşüyor (Shopify modeli). Faz 1 (Foundation) bitti,
Faz 2 (White-Label) sırada. Birincil dil Türkçe, ikincil İngilizce.

## Teknoloji Yığını (özet)

- **Next.js 15.5** (App Router, RSC, PPR) + **React 19** (React Compiler)
- **TypeScript 5.7** strict — `any` **yasak**
- **Supabase** (PostgreSQL + Auth + Edge Functions + Realtime + Storage), RLS-first
- **React Three Fiber 9** + Drei (3D), **Tailwind 3.4** (design tokens), Framer Motion
- **Vitest** (Testing Library + axe a11y), **Sentry**, **Vercel** hosting
- Entegrasyonlar: İyzico (ödeme), Resend (e-posta), Twilio (SMS/WhatsApp)
- Paket yöneticisi: **pnpm**

## Komutlar

```bash
pnpm dev            # geliştirme sunucusu (Next.js)
pnpm build          # production build
pnpm test           # Vitest (watch)
pnpm test -- --run  # tek sefer
pnpm lint           # ESLint
pnpm type-check     # tsc --noEmit
pnpm knip           # kullanılmayan kod/bağımlılık
pnpm supabase:gen   # DB tiplerini src/types/database.types.ts'e üret
```

## Dizin Yapısı & "Yeni dosya nereye?"

```
src/
├── app/         # Next.js App Router rotaları (/[lang]/...) — page.tsx = RSC
├── views/       # Sayfa görünümleri (admin/, account/, calculators/, category/, checkout/, knowledge/, legal/, support/)
├── components/  # Yeniden kullanılabilir UI (products/3d/ = Three.js, admin/, ui/, navigation/...)
├── lib/         # İş mantığı; lib/services/ = DI'lı servis katmanı, lib/supabase/ = client fabrikaları
├── hooks/       # Custom hooks (useCart, useRole, useLocalizedRoutes...)
├── i18n/        # TR/EN sözlükler (SSOT: dictionaries/tr.ts, en.ts)
├── design-system/ # tokens.js (SSOT: spacing/shadow/timing/z-index)
├── types/ · utils/ · contexts/ · config/ · providers/
supabase/
├── functions/   # Edge Functions (Deno/TS) · migrations/ # PostgreSQL migration'ları
```

Karar: Rota mı → `app/` · Sayfa görünümü mü → `views/` · Tekrar kullanılır UI mı →
`components/` · Veri/servis mi → `lib/services/` (DI) · Hook mu → `hooks/` ·
DB değişikliği mi → `supabase/migrations/` (`YYYYMMDD_description.sql`).

## Mutlak Kurallar (ihlal etme)

1. **No-Plan-No-Code:** Değişiklikten önce plan çıkar, onay al.
2. **Dependency Injection:** Tüm `lib/services/*` fonksiyonları ilk parametre olarak
   `supabase: SupabaseClient<Database>` alır. Modül düzeyinde statik client importu yok.
   (ESLint `no-restricted-imports` + AST testi zorlar.)
3. **Tip güvenliği:** `any` yasak, strict TypeScript.
4. **RSC öncelikli:** `page.tsx` varsayılan Server Component; `'use client'` sadece
   etkileşimli uç bileşenlerde. Ana rotalarda `ssr: false` yasak.
5. **PPR/Suspense:** `useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton/>}>`
   ile sarılmalı (SSR zehirlenmesini engellemek için).
6. **React.cache():** RSC ağacında tekrarlanabilen Supabase sorguları `React.cache()` ile tekilleştirilir.
7. **i18n:** Kullanıcıya görünen metin sözlükten gelir; URL'ler `useLocalizedRoutes`
   ile (manuel `/tr/` ekleme yasak); DB çevirileri JSONB (`metadata->>lang`).
   **Kategori slug:** kanonik = EN (`categories.slug`); görünen URL dile göre `metadata.slug={tr,en}`
   (`getLocalizedCategorySlug`); kategori ADI daima `getCategoryDisplayName` — ham `c.name`/`c.slug`
   render YASAK. (SSOT: `docs/plans/slug-localization-2026-08-10.md`)
8. **Design token:** Arbitrary Tailwind değeri yasak (`w-[92vw]` vb.) — `tokens.js` kullan.
   Renkler HEX değil CSS custom property (HSL). A11y için `focus-visible:` kullan.
9. **3D:** Sadece R3F + Drei (saf Three.js DOM yasak); gölge `'percentage'`
   (`PCFSoftShadowMap` yasak); GLB/GLTF CDN'leri `next.config.mjs` CSP `connect-src`
   whitelist'inde (`raw.githubusercontent.com`, `raw.githack.com`) — kaldırma.
10. **Performans:** Below-the-fold ağır bileşenlerde `.content-auto` (content-visibility); `<Image/>` width/height zorunlu (CLS).
11. **Güvenlik/Webhook:** Webhook'lar HMAC-SHA256 + replay guard (timestamp/idempotency).
    Sipariş/iade durumları **monoton** (sadece ileri). Admin işlemleri `admin_audit_log`.
12. **SaaS / Multi-tenant:** Tüm okuma/yazma, Edge API ve Realtime kanalları **tenant-scoped**
    (data bleeding = felaket). Yetki kararları `app_metadata` üzerinden (asla `raw_user_meta_data`).
    `unstable_cache`/`revalidateTag` anahtarlarına `lang` **ve** `tenantId` dahil.
    `middleware.ts` Edge'de DB sorgusu **yasak** (header/Edge Config ile tenant resolution).

13. **Migration = prod:** migration içeren dal master'a merge edilince `supabase-migrate.yml`
    prod DB'ye **OTOMATİK uygular**. Migration'lı PR'ı yalnız kullanıcı onayıyla merge et; "sadece
    komutla uygulanacaksa" migration'ı merge ETME.

> Kuralların tam listesi (31 madde, detaylı gerekçeli) → `CONTEXT.md §14`.

## Doküman Haritası

- `CONTEXT.md` — uçtan uca kapsamlı referans (mimari, DB, akışlar, kurallar). **İlk buraya bak.**
- `docs/README.md` — doküman sistemi haritası ("hangi soru → hangi dosya"). `docs/standards/` = cetveller (admin/bayi standartları, blueprint), `docs/audits/` = ölçümler, `docs/plans/` = roadmap.
- `docs/standards/collaboration-protocol.md` — **çok-ajan işbirliği kuralları** (eş-Controller=Claude Code ikizleri / ortak Worker=Antigravity CLI; controller↔controller şerit sahipliği + **worktree izolasyonu**; bir-iş-bir-dal; deterministik kapı; doküman SSOT). · `docs/DURUM-TAKIP.md` — canlı "neredeyiz" + **şerit panosu**.
- `PROJECT.md` — DI & güvenlik milestone kayıtları + arayüz kontratları.
- `RECOMMENDATIONS.md` · `CHANGELOG.md` — durum ve değişiklik geçmişi.
- **Katalog→ticaret hattı SSOT:** `docs/plans/catalog-commerce-pipeline-master-2026-06-20.md` (uçtan-uca pano)
  + `docs/standards/{catalog-ingestion,csv-import-export,pricing,product-schema,category-taxonomy}-standard.md`.
  Veri deposu: `C:/Users/alize/venthub-pdf-ingestor` (CSV'ler). NLM auth bozulursa → memory `nlm-auth-issue`
  (Gemini Notebook rebrand; çözüm `nlm login --clear`, paket `notebooklm-mcp-cli` ≥0.9.8).
- `docs/` (kök) — **üretilmiş** master MD'ler (frontend, edge functions, DB şema) — elle düzenleme.
- `.claude/skills/` = Claude Code yetenekleri · `.agent/skills/` = Antigravity/worker yetenekleri — **İKİSİ DE AKTİF ve KASITLI** (çift ağaç); birleştirme/silme ÖNERME.

## Bilgi Kaynağı İş Akışı (üç katman)

- **Kod yapısı / "ne çağırıyor, neyi etkiler, nerede" sorusu** → önce **CodeGraph** (AST grafiği,
  ~1sn taze, kesin). grep'ten önce buna bak.
- **Kural / niçin / mimari karar / SaaS plan sorusu** → **NotebookLM dijital ikiz** (`notebook_query`,
  ID `235043eb-970f-4a52-9f39-1d02b2621e9c`) veya `CONTEXT.md`.
- **Çelişirse kod kazanır.** NLM ikizi snapshot'tır, drift edebilir (ör. tablo sayısı); kod
  yapısı için daima CodeGraph/gerçek kaynağı doğrula. CLAUDE.md = her oturum yüklü çekirdek katman.

## Notlar

- **Lokal `deno check`:** daima `--node-modules-dir=none` ile koş — `auto` pnpm node_modules
  yerleşimini BOZAR (build "Module not found" ile patlar; onarım `pnpm install`). CI etkilenmez.
- **Repo PRIVATE:** workflow'da `permissions:` bloğu yazıyorsan `contents: read` ZORUNLU —
  yoksa checkout "Repository not found" verir (varsayılan izinler düşer).

- **CONTEXT.md NotebookLM tarafından üretilir** — "iyileştirme" adına yeniden yazma; not/ilave ekleyebilirsin.
- Dokümantasyon, Corpus Callosum / Orion CLI ile `*.md` master dosyalarına çevrilip
  NotebookLM "VentHub Proje Hafızası" defterine (dijital ikiz) yüklenir.
