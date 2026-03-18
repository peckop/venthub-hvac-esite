# Plan: 001-modernization-roadmap

## Goal
Next.js 15 modernizasyonunu güvenli ve performanslı bir şekilde tamamlamak.

## Plan

1. **Bağımlılık ve Altyapı Hazırlığı**
   - Files: `package.json`
   - Change: `server-only` ekle ve `eslint` bağımlılıklarını doğrula.
   - Verify: `pnpm install` ve `pnpm run dev` kontrolü.

2. **Server-Only Lockdown (Güvenlik Bariyeri)**
   - Files: `src/lib/supabase.ts`, `src/lib/auth-server.ts`
   - Change: `import 'server-only'` ekleyerek sızıntıları engelle.
   - Verify: `pnpm run build` ile sızıntı kontrolü.

3. **Dynamic Route Modernization (Async Params)**
   - Files: `src/app/products/[id]/page.tsx` vb.
   - Change: `params` ve `searchParams` nesnelerini `await` ederek Next.js 15 kuralına uydur.
   - Verify: `pnpm exec tsc -b` ile tip kontrolü.

4. **Action & Form Modernization**
   - Files: `src/components/forms/*`
   - Change: `useActionState` (React 19) entegrasyonu.
   - Verify: Formların fonksiyonel testi.

5. **Performance & PPR Activation**
   - Files: `next.config.js`
   - Change: `experimental.ppr` ayarını aktif et (kademeli).
   - Verify: `Static Indicator` üzerinden sayfa durumlarının teyidi.

## Risks & mitigations
- **Risk:** PPR'ın bazı karmaşık dinamik rotalarda beklenmedik davranışlar sergilemesi.
- **Mitigation:** PPR'ı global yerine dosya bazlı (segment config) devreye al.

## Rollback plan
- Next.js 14 konfigürasyonuna ve asenkron params öncesi `commit`'e geri dön.
