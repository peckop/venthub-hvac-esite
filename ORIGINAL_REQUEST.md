# Original User Request

## Initial Request — 2026-06-07T14:30:23+03:00

# Teamwork Project Prompt — Final

> Status: Launched
> Tier: 🏢 Enterprise
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Refactor VentHub HVAC database service layers to use strict Dependency Injection (DI) by accepting the active Supabase client instance as an argument, eliminating module-scope static client imports and resolving client-side "Multiple GoTrueClient instances" console warnings.

Working directory: c:\Users\alize\venthub-hvac
Integrity mode: development
Project tier: enterprise

## PROJECT DNA

- Project: VentHub HVAC — HVAC E-Commerce & Engineering SaaS Platform
- Stack: TypeScript 5.7 — Next.js 15 (App Router), React 19, Supabase (DB + Auth + Realtime + Edge Functions + Storage), TailwindCSS 4, React Three Fiber, Framer Motion, Recharts, Vitest
- Package Manager: pnpm
- Database: 28 tables, 132 RLS policies, 55 RPC functions, 47 indexes, 173 migrations
- Multi-Tenant: Shared DB + RLS strategy, jwt_tenant_id() RPC, tenant_id isolation
- Test baseline: 410 tests passing (0 failures, 2 skipped)
- Test command: `pnpm run test -- --run`

## QUALITY CONTRACT — ENTERPRISE GRADE

### Test & Doğrulama
- Her yeni/değiştirilen fonksiyon için testlerin yeşil kalması zorunludur.
- Mevcut 410 test baseline hiçbir koşulda düşürülemez.
- `pnpm run type-check`, `pnpm run lint`, `pnpm run build` hatasız geçmelidir.

### Tip Güvenliği
- TypeScript strict mode, `any` kullanımı KESİNLİKLE YASAKTIR.
- Tüm refaktör edilen fonksiyonlar tam tip anotasyonlu (`SupabaseClient<Database>`) olmalıdır.

### Dokümantasyon
- Değiştirilen public API fonksiyonlarının JSDoc açıklamaları güncellenmeli veya eklenmelidir.

## CRITICAL RULES — DO NOT VIOLATE

### Dokunulmaz Dosyalar
- `.next/`, `node_modules/`, `.env`, `.env.local`, `.env.production`
- `.agent/` — AI ajan konfigürasyonu
- `supabase/migrations/` — Mevcut migration'lar değiştirilemez
- `CONTEXT.md`, `project-dna.yaml`
- `src/types/database.types.ts` — Supabase CLI ile otomatik üretilir
- `src/lib/hvacCalculations.ts` — Saf metrik motor, tenant-agnostik, DOKUNULMAYACAK
- `src/design-system/tokens.js` — Tasarım token SSOT

### İhlal Edilemez Kurallar
1. Mevcut 410 testin hiçbirisi kırılmamalıdır.
2. TypeScript strict mode korunmalı, `any` yasaktır.
3. RLS izolasyonu ve tenant_id sızdırmazlığı asla ihlal edilmemeli.
4. Servis dosyalarında (`src/lib/services/*.ts`) dosya/modül düzeyinde `supabaseBrowserClient` veya `supabaseStaticClient` statik importu ve default parametre (örn: `supabase = defaultClient`) kullanımı tamamen temizlenmelidir.

## Requirements

### R1. Servis Katmanı Dependency Injection Refactoring
`src/lib/services/` altındaki 7 adet servis dosyasını:
- `address.service.ts`
- `cart.service.ts`
- `category.service.ts`
- `invoice.service.ts`
- `pricing.service.ts`
- `product.service.ts`
- `project.service.ts`
Modül seviyesinde client (`supabaseBrowserClient`, `supabaseStaticClient`) import etmekten ve default parametre atamaktan arındırın. Her bir fonksiyonun ilk parametresi olarak `supabase: SupabaseClient<Database>` zorunlu kılınmalıdır.

### R2. Tüketici Dosyaların (Caller) Güncellenmesi
Bu servisleri çağıran tüm client component, provider (örn: `CartProvider.tsx`, `ProjectProvider.tsx`), custom hook, server component, action ve route handler dosyalarında çağrılar güncellenmelidir:
- Client tarafında context veya bileşenlerde `supabaseBrowserClient` enjekte edilmelidir.
- Server tarafında (Actions, Server Components, Route Handlers) o istek bağlamındaki sunucu client'ı enjekte edilmelidir.

### R3. Test Dosyalarının Güncellenmesi
`src/lib/__tests__/` altındaki ilgili servis testleri (örn. `cart.service.test.ts`) test client'ını explicit geçecek şekilde güncellenmeli ve testlerin tamamının yeşil kalması sağlanmalıdır.

## Acceptance Criteria

### Build & Type Safety
- [ ] `pnpm run type-check` hatasız geçer.
- [ ] `pnpm run lint` hatasız geçer.
- [ ] `pnpm run build` başarıyla tamamlanır.
- [ ] Refaktör edilen dosyalarda `any` tipi bulunmaz.

### Architecture
- [ ] 7 servis dosyasının hiçbirinde modül/dosya seviyesinde statik supabase client import edilmemiştir ve default parametre kullanılmamıştır.
- [ ] Servis fonksiyonları explicit `supabase` parametresi almaktadır.

### Regression
- [ ] `pnpm run test -- --run` çalıştırıldığında ≥ 410 test geçmektedir.

## Verification Protocol
Tüm kabul kriterleri aşağıdaki sırayla doğrulanmalıdır:
1. `pnpm run type-check`
2. `pnpm run lint`
3. `pnpm run test -- --run`
4. Servis dosyalarında grep ile `supabaseBrowserClient` ve `supabaseStaticClient` kontrolü (import edilmemiş olmalı).
5. `pnpm run build`

## Follow-up — 2026-06-07T11:31:15Z

Merhaba Ekip,

Görev gereksinimlerine ve kabul kriterlerine dokümantasyon güncellemeleri eklenmiştir. Lütfen aşağıdaki gereksinimleri (R4) ve kabul kriterlerini (Acceptance Criteria > Documentation) mevcut plânınıza dahil edin:

### R4. Dokümantasyon Güncellemesi
Tüm geliştirme tamamlandıktan sonra, yapılan Dependency Injection mimari değişikliklerini yansıtacak şekilde ilgili markdown dosyaları güncellenmelidir:
- `README.md` — Yeni DI client yapısı, servis mimarisi ve import yolları değişiklikleri.
- `CHANGELOG.md` — Yapılan tüm servis refaktör işlemlerinin kronolojik kaydı.
- `RECOMMENDATIONS.md` — Servis katmanı refaktör süreci sırasında tespit edilen teknik borçlar veya sonraki adımlar için en az 3 somut öneri barındıran rapor.

### Acceptance Criteria > Documentation
- [ ] `README.md` yeni Dependency Injection mimarisini yansıtacak şekilde güncellenmiştir.
- [ ] `CHANGELOG.md` yapılan tüm değişiklikleri içermektedir.
- [ ] `RECOMMENDATIONS.md` kök dizinde mevcut olmalı ve en az 3 somut öneri içermelidir.

### Verification Protocol
1. `pnpm run type-check`
2. `pnpm run lint`
3. `pnpm run test -- --run`
4. Servis dosyalarında grep ile `supabaseBrowserClient` ve `supabaseStaticClient` kontrolü (import edilmemiş olmalı).
5. `README.md` ve `CHANGELOG.md` dosyalarındaki değişiklikleri git diff ile doğrula.
6. `RECOMMENDATIONS.md` dosyasının varlığını ve içerik doluluğunu doğrula.
7. `pnpm run build`

Bu doğrultuda ilerleyelim. Kolay gelsin.

## Follow-up — 2026-06-07T11:32:45Z

Ekip, önemli bir ek kural:

Kök dizindeki `RECOMMENDATIONS.md` dosyasının üzerine KESİNLİKLE yazılmamalıdır! Önceki sürümden kalan mevcut 5 öneri korunmalı ve bu yeni DI (Dependency Injection) refaktör süreci sırasında elde edeceğiniz yeni öneriler bu dosyaya BİRLEŞTİRİLEREK (merge) yeni maddeler olarak eklenmelidir. 

Bu kural hem `R4` gereksinimi hem de kabul kriterleri (Acceptance Criteria > Documentation) için güncellenmiştir. Lütfen plânınızı bu doğrultuda revize edin.

## Follow-up — 2026-06-07T11:34:10Z

Ekip, çok önemli bir ek kural ve düzeltme:

Bu yeni refaktör sonrasında `RECOMMENDATIONS.md` içindeki eski 5 tavsiyeden bazıları geçersiz veya güncelliğini yitirmiş (outdated) hale gelebilir. 

Lütfen:
1. Eski 5 tavsiyenin yeni mimariye ve yaptığınız değişikliklere göre uyumluluğunu/geçerliliğini denetleyin.
2. Gerekirse eski tavsiye maddelerini revize edin, güncelleyin veya eğer bu refaktör ile zaten çözülmüş durumdalar ise bunu dosya üzerinde açıkça belirtin.
3. Yeni elde ettiğiniz tavsiyeleri bu güncellenmiş eski maddelerin altına ekleyerek dosyayı birleştirin (merge).

Bu kural `prompt_draft.md` üzerinde hem gereksinimlere hem de kabul kriterlerine işlenmiştir. Plânınızı buna göre güncel tutun. Kolay gelsin.

## Follow-up — 2026-06-07T13:18:48Z

# Teamwork Project Prompt — Final

> Status: Launched
> Tier: 🏢 Enterprise
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Implement the 8 architectural and security recommendations verified by NotebookLM (the Project Memory Consultant) for VentHub HVAC to optimize serverless connection pooling, reduce Edge middleware latency, enforce cross-environment import guards, and establish clean Client/Server-side Dependency Injection (DI) registries.

Working directory: c:\Users\alize\venthub-hvac
Integrity mode: development
Project tier: enterprise

## PROJECT DNA

- Project: VentHub HVAC — HVAC E-Commerce & Engineering SaaS Platform
- Stack: TypeScript 5.7 — Next.js 15 (App Router), React 19, Supabase (DB + Auth + Realtime + Edge Functions + Storage), TailwindCSS 4, React Three Fiber, Framer Motion, Recharts, Vitest
- Package Manager: pnpm
- Database: 28 tables, 132 RLS policies, 55 RPC functions, 47 indexes, 173 migrations
- Multi-Tenant: Shared DB + RLS strategy, jwt_tenant_id() RPC, tenant_id isolation
- Test baseline: 412 tests passing (0 failures, 2 skipped)
- Test command: `pnpm run test -- --run`

## QUALITY CONTRACT — ENTERPRISE GRADE

### Test & Doğrulama
- Her yeni/değiştirilen fonksiyon için testlerin yeşil kalması zorunludur.
- Mevcut 412 test baseline hiçbir koşulda düşürülemez.
- `pnpm run type-check`, `pnpm run lint`, `pnpm run build` hatasız geçmelidir.

### Tip Güvenliği
- TypeScript strict mode, `any` kullanımı KESİNLİKLE YASAKTIR.
- Tüm refaktör edilen ve yeni yazılan fonksiyonlar ile registry yapıları tam tip anotasyonlu (`SupabaseClient<Database>`) olmalıdır.

## CRITICAL RULES — DO NOT VIOLATE

### Dokunulmaz Dosyalar
- `.next/`, `node_modules/`, `.env` (üzerine yazılmayacak, sadece ekleme yapılacak)
- `.agent/` — AI ajan konfigürasyonu
- `supabase/migrations/` — Mevcut migration'lar değiştirilemez
- `CONTEXT.md`, `project-dna.yaml`
- `src/types/database.types.ts` — Supabase CLI ile otomatik üretilir
- `src/lib/hvacCalculations.ts` — Saf metrik motor, tenant-agnostik, DOKUNULMAYACAK
- `src/design-system/tokens.js` — Tasarım token SSOT

### İhlal Edilemez Kurallar
1. Mevcut 412 testin hiçbirisi kırılmamalıdır.
2. TypeScript strict mode korunmalı, `any` yasaktır.
3. RLS izolasyonu ve tenant_id sızdırmazlığı asla ihlal edilmemeli.
4. Sunucu tarafı registry veya cache yapıları kesinlikle "istek ömrüyle" (request-bound) sınırlı olmalı, global scope'a (`globalThis` vb.) sızmamalıdır.
5. PPR/SSG kullanılan static rotalar için registry yapısı statik client'ı (`createStaticClient`) da desteklemelidir.

## Requirements

### R1. Veritabanı ve Altyapı Entegrasyonu (Rec 1)
- `.env.local` (ve proje bağlantı ayarları) dosyalarındaki Supabase bağlantı dizgisi (connection string) doğrudan DB yerine Supavisor'ın transaction-mode pooler uç noktasına (port `6543`) yönlendirilecek şekilde güncellenmelidir.
- Çerez şifreleme anahtarı (`JWT_CLAIMS_COOKIE_SECRET`) çevre değişkenlerine eklenmelidir.

### R2. Edge Middleware & Yönlendirici İyileştirmeleri (Rec 3 & 5)
- **Çerez/Başlık Replikasyon Standardizasyonu:** `src/utils/router.ts` adında yeni bir yardımcı sınıf/dosya oluşturulmalı ve middleware içindeki yönlendirmelerde çerez kayıplarını önleyen redirect replikasyonu bu standart üzerinden yürütülmelidir.
- **Claims Caching:** Edge Middleware (`src/middleware.ts`) içine, `getClaims()` ile alınan doğrulanmış claims verilerini (rol ve tenant_id) Edge-safe AES-GCM ile şifreleyerek secure HTTP-only bir çereze (`sb-claims-cache`) yazan ve sonraki döngülerde local doğrulamayla TTFB gecikmesini <5ms'ye düşüren cache mekanizması kurulmalıdır.

### R3. Client-Side Dependency Injection (Rec 6)
- Client componentlerin statik/global importlarını engellemek ve izole birim testlerini (mocking) kolaylaştırmak için `src/providers/SupabaseProvider.tsx` context sağlayıcısı ve `useSupabaseClient()` hook'u oluşturulmalıdır.
- Client componentler (örn: `CartProvider.tsx`) istemciyi bu context üzerinden alarak servislere parametre geçecek şekilde güncellenmelidir.

### R4. Server-Side DI Service Registry (Rec 7)
- RSC, Actions ve API rotalarında `supabase` enjeksiyon boilerplate'ini kaldırmak için `src/lib/services/registry.ts` adında istek-kapsamlı (request-bound) çalışan bir `ServiceRegistry` sınıfı oluşturulmalıdır.
- Sınıf, o anki istek bağlamındaki `supabase` client'ı almalı ve servisleri (`ProductService`, `CartService` vb.) bu client ile yapılandırılmış şekilde döndürmelidir.

### R5. Statik Analiz ve Otomasyon Testleri (Rec 2, 4 & 8)
- **ESLint Import Guards:** `.eslintrc.json` (veya ilgili config) içine `no-restricted-imports` kuralları eklenerek tarayıcı ve sunucu istemcilerinin çapraz ortam kirliliği engellenmelidir.
- **AST İmza Denetimi:** `src/lib/__tests__/diSignature.test.ts` yazılmalı, `src/lib/services/` altındaki fonksiyonların ilk parametresinin `supabase: SupabaseClient<Database>` olduğunu AST analiziyle doğrulamalıdır.
- **E2E Adversarial Realtime RLS Testi:** `tests/e2e/realtimeSecurity.test.ts` yazılmalı, Kiracı A'nın WebSocket kanalı üzerinden Kiracı B'nin realtime stok/sipariş bildirimlerini dinleme girişiminin DB RLS seviyesinde kesinlikle reddedildiğini simüle edip doğrulamalıdır.

### R6. Dokümantasyon ve Durum Güncellemesi
- `RECOMMENDATIONS.md` dosyası taranmalı, bu geliştirme kapsamında başarıyla hayata geçirilen maddelerin (örneğin Rec 1, 2, 3, 4, 5, 6, 7, 8) `Status` alanları `[Implemented - Verified]` olarak güncellenmelidir.
- `README.md` dosyası yeni `SupabaseProvider` ve `ServiceRegistry` mimari bileşenlerini ve geliştirici kullanım kılavuzunu içerecek şekilde revize edilmelidir.
- Yapılan tüm altyapı iyileştirmeleri ve eklenen test süitleri `CHANGELOG.md` dosyasına kronolojik olarak işlenmelidir.

## Acceptance Criteria

### Build & Type Safety
- [ ] `pnpm run type-check` hatasız geçer.
- [ ] `pnpm run lint` hatasız geçer.
- [ ] `pnpm run build` başarıyla tamamlanır.
- [ ] Yeni/güncellenen dosyalarda `any` tipi kullanılmamıştır.

### Architecture
- [ ] `.env.local` port `6543` kullanır.
- [ ] `sb-claims-cache` secure çerez yapısı middleware'de aktiftir.
- [ ] `SupabaseProvider` (React Context) ve `ServiceRegistry` (per-request) implemente edilmiştir.
- [ ] ESLint import kuralları cross-environment kirlenmeyi engeller.

### Regression & Testing
- [ ] `pnpm run test -- --run` çalıştırıldığında ≥ 412 test (yeni yazılan AST ve E2E testleri dahil) başarıyla geçer.
- [ ] `diSignature.test.ts` ve `realtimeSecurity.test.ts` testleri yeşildir.

### Documentation
- [ ] `RECOMMENDATIONS.md` dosyasındaki uygulanan maddelerin statüleri `[Implemented]` olarak güncellenmiştir.
- [ ] `README.md` ve `CHANGELOG.md` yapılan mimari değişiklikleri içerecek şekilde güncellenmiştir.

## Verification Protocol
Tüm kabul kriterleri aşağıdaki sırayla doğrulanmalıdır:
1. `pnpm run type-check`
2. `pnpm run lint`
3. `pnpm run test -- --run` (yeni testlerin geçtiği teyit edilir).
4. `README.md`, `CHANGELOG.md` ve `RECOMMENDATIONS.md` dosyalarındaki değişiklikleri git diff ile doğrula.
5. `pnpm run build`

## Follow-up — 2026-06-10T15:00:34+03:00

VentHub HVAC e-ticaret sitesinin Lighthouse performans puanını Desktop 37→85+, Mobile 30→70+ seviyesine çıkarmak. Mevcut 3 kritik metrik (TBT 13,680ms, CLS 0.656, SI 7.9s) düzeltilecek. Plan NLM dijital ikiz tarafından doğrulanmış ve onaylanmıştır.

Working directory: c:\Users\alize\venthub-hvac
Integrity mode: development

## Requirements

### R1. CLS Fix — Footer Layout Shift (0.656 → <0.1)
`src/components/Footer.tsx` bileşenine Tailwind token ile min-height ekle (arbitrary class YASAK — enterprise kuralı). Footer içindeki logo/görsellere explicit width/height attribute ekle. Products grid container'a `content-visibility: auto` + `contain-intrinsic-size` ekle.

### R2. TBT Fix — Three.js Lazy-Load ve Code Splitting (13,680ms → <500ms)
- `src/components/products/CategoryOrbitCarousel.tsx` L10: `OrbitalProductsShowcase` statik import → `next/dynamic` + `ssr: false`
- `src/views/CategoryMasterView.tsx` L9-13: 5 view variant statik import → `next/dynamic`
- `src/components/navigation/StickyHeader.tsx` L30: `React.lazy()` → `next/dynamic` (SearchOverlay, CategoryHubOverlay, MegaMenu)
- Projede mevcut `src/components/LazyInView.tsx` bileşenini 3D Canvas container'lara uygula (YENİ BİLEŞEN YAZMA)
- Below-fold 3D container'lara `.content-auto` sınıfı + `contain-intrinsic-size` ekle
- Her `next/dynamic` bileşenini `<Suspense fallback={<Skeleton />}>` ile sarmala — skeleton boyutları gerçek bileşenle eşleşmeli

### R3. Network Optimizasyonu — HDR ve Polyfill Temizliği
- 6 navigasyon bileşeninden `<Environment preset="city"/>` kaldır → `<ambientLight intensity={0.8} />` + `<directionalLight position={[5,5,5]} intensity={1} />` ile değiştir. Dosyalar: CategoryCard3D.tsx, MegaMenu3DBackground.tsx, CategoryHubOverlay.tsx, CategorySpotlightScene.tsx, InfiniteProductsShowcase.tsx, OrbitalProductsShowcase.tsx
- `Product3DViewer.tsx` için self-hosted düşük çözünürlüklü HDR kullan: `<Environment files="/env/city_256.hdr" />`
- `package.json` browserslist güncelle: `["chrome >= 90", "firefox >= 90", "safari >= 15", "edge >= 90"]` — legacy polyfill'leri kaldır

### R4. Mimari Kurallar (Kırılma Önleme)
- Arbitrary Tailwind class (`min-h-[320px]` gibi) KULLANMA — sadece token: `min-h-80`, `min-h-96`, `min-h-hvac-hero`
- `React.lazy()` KULLANMA — sadece `next/dynamic` (AX-08 kuralı)
- 3D skeleton'larda `PlaceholderWireframe` deseni kullan (AX-09)
- Mevcut `LazyInView` bileşenini kullan, yeni wrapper YAZMA

## Acceptance Criteria

### Build Integrity
- [ ] `npx tsc --noEmit` — 0 hata
- [ ] `npx next build` — başarılı, 0 hata

### Bundle Size
- [ ] `pnpm run analyze` çalıştırıldığında hiçbir chunk 500KB'ı geçmemeli
- [ ] Three.js chunk'ı initial JS payload'ından ayrılmış olmalı (ayrı chunk'ta)

### Performance Metrics (Lighthouse Emülasyon)
- [ ] TBT < 500ms (mevcut: 13,680ms)
- [ ] CLS < 0.1 (mevcut: 0.656)
- [ ] Footer elementi 0 CLS üretmeli
- [ ] Three.js bileşenleri viewport'a girene kadar yüklenmemeli

### Code Quality
- [ ] Projede hiçbir `React.lazy()` kullanımı kalmamalı — hepsi `next/dynamic`
- [ ] `<Environment preset="city"/>` navigasyon bileşenlerinde kalmamalı (sadece Product3DViewer hariç)
- [ ] Arbitrary Tailwind class (`min-h-[...]`, `h-[...]`) eklenmemiş olmalı
- [ ] `OrbitalProductsShowcase` artık `CategoryOrbitCarousel` içinde statik import edilmemeli

### Verification Commands
```bash
# 1. TypeScript
npx tsc --noEmit

# 2. Build
npx next build

# 3. Bundle analiz
pnpm run analyze

# 4. Grep kontrolleri
grep -r "React.lazy" src/ --include="*.tsx" --include="*.ts"    # 0 sonuç olmalı
grep -r "preset=\"city\"" src/components/navigation/ --include="*.tsx"  # 0 sonuç olmalı
grep -rn "import.*OrbitalProductsShowcase" src/components/products/CategoryOrbitCarousel.tsx  # dynamic import olmalı
```

## Follow-up — 2026-06-10T15:01:41+03:00

Kullanıcı talebi doğrultusunda, sprint hedeflerine dokümantasyon güncellemesini de ekliyoruz. Lütfen gereksinimleri ve kabul kriterlerini aşağıdaki şekilde güncelleyip yürütmeye dahil et:

1. Gereksinimlere R5 olarak ekle:
### R5. Dokümantasyon Güncellemesi
Tüm geliştirme tamamlandıktan sonra, yapılan değişiklikleri yansıtacak şekilde kök dizindeki ilgili markdown dosyaları güncellenmelidir:
- `README.md` — Yeni mimari yapı, dynamic import değişiklikleri, 3D optimizasyonları ve proje yapısı güncellemeleri.
- `CHANGELOG.md` — Yapılan tüm değişikliklerin kronolojik kaydı.
**DİKKAT:** `CONTEXT.md` dosyasına DOKUNULMAMALIDIR — bu dosya NotebookLM tarafından yönetilir.

2. Kabul Kriterlerine (Acceptance Criteria) ekle:
### Documentation
- [ ] `README.md` güncellenmiş olmalı
- [ ] `CHANGELOG.md` tüm değişiklikleri içermeli
- [ ] `CONTEXT.md` dosyasına dokunulmamış olmalı

Lütfen bu güncellemeyi orkestratör subagent'a ve tüm ekiplere ilet.

