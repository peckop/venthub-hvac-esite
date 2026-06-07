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
