# CLAUDE.md — VentHub HVAC

> Bu dosya her oturumda otomatik yüklenir: **anayasa + harita adresi.** Hikâye ve belge listesi burada durmaz.
> **Hangi soru → hangi belge/araç:** `docs/README.md` (tek giriş haritası). Kural gerekçeleri:
> `docs/standards/claude-md-gerekceler.md`. Belge düzeni: `docs/standards/belge-yonetimi-standard.md`.

## Proje Özeti

HVAC (iklimlendirme/havalandırma) sektörüne özel **e-ticaret platformu**.
**CANLI: `venthub.com.tr`** (kanonik, www'suz; `www` → apex 308; vercel.app = altyapı adresi,
müşteriye verilmez). Faz 1 (Foundation) bitti; Faz 2 (White-Label/multi-tenant) **PARK'ta**
(Recep kararı 2026-08-28, REC-88: öncelik kendi şirket + tek operatör; kural 12 yine geçerli).
Birincil dil Türkçe, ikincil İngilizce.

## Teknoloji Yığını (özet)

- **Next.js 15.5** (App Router, RSC, SSG + talep-üzerine ISR) + **React 19** (React Compiler) — **PPR KULLANILMIYOR**
- **TypeScript 5.7** strict — `any` **yasak** · **Supabase** (PostgreSQL + Auth + Edge Functions + Realtime + Storage), RLS-first
- **React Three Fiber 9** + Drei (3D), **Tailwind 3.4** (design tokens), Framer Motion
- **Vitest** (Testing Library + axe a11y), **Sentry**, **Vercel** hosting · İyzico, Resend, Twilio · paket yöneticisi **pnpm**

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

Karar: Rota mı → `src/app/` · Sayfa görünümü mü → `src/views/` · Tekrar kullanılır UI mı →
`src/components/` · Veri/servis mi → `src/lib/services/` (DI) · Hook mu → `src/hooks/` ·
DB değişikliği mi → `supabase/migrations/` (`YYYYMMDDHHMMSS_description.sql` — damga **14 hane**;
8 haneli biçim INV-MIGRATION-2'de KIRMIZI verir).

## Mutlak Kurallar (ihlal etme)

1. **No-Plan-No-Code:** Değişiklikten önce plan çıkar, onay al. Plan, **kendisini hangi cetvelin
   yönettiğini** söylemeli: ya `docs/standards/` altından bir dosya adı, ya açıkça "cetvel yok".
   "Cetvel yok" geçerli bir cevap ama **bedava değil** — o zaman iş, cetveli yazmayı da kapsar.
   **İş emri de aynı kurala tabidir (2026-08-20):** registry'de açılan her görevin
   açıklamasında zorunlu **KAYNAK/CETVEL bloğu** bulunur — yöneten cetvel dosya adları +
   karne/ölçüm tazeliği; cetvel yoksa açıkça "cetvel yok — yazımı bu işin kapsamında" yazılır.
   Emri açan (orkestratör dahil) önce docs/README haritasına ve ikize "bu konuda mevcut
   cetvel var mı" diye SORAR.
2. **Dependency Injection:** Tüm `src/lib/services/*` fonksiyonları ilk parametre olarak
   `supabase: SupabaseClient<Database>` alır. Modül düzeyinde statik client importu yok.
   (ESLint `no-restricted-imports` + AST testi zorlar.)
3. **Tip güvenliği:** `any` yasak, strict TypeScript.
4. **RSC öncelikli:** `page.tsx` varsayılan Server Component; `'use client'` sadece
   etkileşimli uç bileşenlerde. Ana rotalarda `ssr: false` yasak.
5. **Suspense sınırı:** `useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton/>}>`
   ile sarılmalı (SSR zehirlenmesini engellemek için). **Sınır yalnız o uç bileşeni sarar, sayfayı değil.**
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
14. **Tam iş:** Testi/kapıyı sonraki işe bırakma, hata yollarını (ağ yok, veri boş, yetki yok)
    kodla birlikte yaz, iki çözüm arasındaki fark **yalnız satır sayısıysa** tam olanı seç.
    Kapsam dışı sayılabilecek tek şey gerçekten ilgisiz iştir; o **ayrı kayıt** olarak açılır ve
    numarası raporda geçer. Bu kural kapsam hakkındadır, yetki hakkında değil — hiçbir kapıyı
    (özellikle kural 13'ü) gevşetmez. Cetvel: `docs/standards/execution-method-standard.md` §8.

## Nereye bakılır (davranış kuralı; belge listesi `docs/README.md`'de)

- **Kod yapısı / "ne çağırıyor, neyi etkiler, nerede"** → önce **CodeGraph** (AST grafiği, ~1sn taze). grep'ten önce.
- **"Katalog PDF'inde ne yazıyor"** → **KAYNAK DİZİNİ**, PDF'i AÇMA: `<ingestor>/kaynak-dizini/sayfalar.jsonl`
  (`<ingestor>` = kardeş depo `venthub-pdf-ingestor`). Dizinde yoksa önce dizine eklenir
  (`<ingestor>/scripts/kaynak_dizini/cikar.py`); cetvel `docs/standards/catalog-ingestion-standard.md` §6.3.
- **Kural / niçin / mimari karar** → NotebookLM dijital ikiz (`chat_ask`, ID `235043eb-970f-4a52-9f39-1d02b2621e9c`).
  NLM auth bozulursa `notebooklm login`'i kendin koş; `auth check` kanıt değil, `notebooklm list` ile ölç.
- **Çalışma düzeni:** çok oturumda şerit sahipliği + **worktree izolasyonu**, bir-iş-bir-dal
  (`docs/standards/collaboration-protocol.md`); iş emrinde `YÖNTEM:` satırı — yöntemsiz emir eksik emirdir
  (`docs/standards/execution-method-standard.md`).
- **Vitrin tazeliği:** statik vitrin sayfasında görünen HER tablonun DB tetiği + webhook handler dalı olmalı
  (yoksa veri değişir, sayfa değişmez ve hiçbir test görmez) — `docs/standards/rendering-cache-standard.md`.
- **Çelişirse kod kazanır.** İkiz ve belgeler snapshot'tır, drift edebilir; tazelik her mesajdaki durum satırında.
- `CONTEXT.md` NotebookLM üretimidir — elle yeniden yazma; not/ilave ekleyebilirsin.
- `docs/` kökündeki master MD'ler **üretilmiştir** — elle düzenleme.
- `.claude/skills/` ve `.agent/skills/` **İKİSİ DE AKTİF ve KASITLI** (çift ağaç); birleştirme/silme ÖNERME.

## Notlar (ortam kuralları)

- **Lokal `deno check`:** daima `--node-modules-dir=none` ile koş (`auto` pnpm yerleşimini bozar). CI etkilenmez.
- **Repo PUBLIC (2026-08-15'ten beri):** (1) geçmiş dahil her şey herkese açık — yeni bir sır commit'lenirse
  geri dönüşü YOK, görünürlükten önce betiği koş; (2) **self-hosted runner KULLANMA**; (3) `permissions:` bloğu
  yazıyorsan `contents: read` yine ZORUNLU.
- **Worktree `node_modules` (karar 88):** her worktree **kendi** kurulumunu yapar:
  `pnpm install --frozen-lockfile --offline` (kilit dosyası değişmemeli). Ana depoya **junction/symlink ile
  paylaşım YASAK.** Eski bağlantı varsa önce YALNIZ bağlantı kaldırılır (`cmd //c "rmdir <yol>"`, `/s` YOK),
  ana deponun `.bin`'i doğrulanır. Özyinelemeli silmeyi `silme-baglanti-kapisi` kancası durdurur.
- **Git kancaları:** `pre-commit` **bloklamaz** (uyarı-only, companion var mı bakar); companion üretimi
  `post-commit`te arka planda (log: `.git/orion-doc.log`).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

> **NOT (2026-09-16, Recep kararı):** bu bölüm **aracın yazdığı hâliyle** duruyor ve **hiçbir fiil
> yasak değil** — *"olduğu gibi istiyorum, yasak felan yok, test edeceğiz kullanacağız sonra
> göreceğiz gerçeği."* ALTYAPI'nın önerisi bölümü REC-313 ölçümüne göre daraltmaktı; öneri
> **reddedildi**. O ölçüm (`query` 5 soruda 2 yanlış 2 eksik) **tek koşumluktur, eğilim değildir** —
> kullanımla yeniden ölçülecek. `graphify-out/` üretilmiş artefakttır (`.gitignore`): her makinede
> bir kez `graphify extract . --code-only` koşulur, yoksa kancalar sessiz kalır (fail-open).
> ⚠`affected` **parantez gerektiriyor** (ölçüldü, hiçbir belgede yazılı değil): `productRoute` →
> *"No unique node match"*, `productRoute()` → doğru cevap.
