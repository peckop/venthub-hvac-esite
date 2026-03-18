# Plan: 001-infrastructure-lockdown (Next.js 15)

## 🏗️ Proposed Changes

### [Component: Security & Infrastructure]
#### [MODIFY] [supabase.ts](src/lib/supabase.ts)
- En üstte `server-only` importu eklenerek bu modülün istemci tarafında kullanılmaması garanti altına alındı.

### [Component: Dynamic Routes]
#### [MODIFY] [page.tsx](src/app/destek/konular/[slug]/page.tsx)
- `params` objesi Next.js 15'e uygun olarak `Promise` tipiyle tanımlandı ve bileşen içinde `await` edilerek kullanıldı.

## ✅ Verification Plan
- [x] `pnpm run build` komutuyla `server-only` ihlali olup olmadığı kontrol edildi.
- [x] `[slug]` rotası üzerinde parametrenin doğru alındığı manuel olarak doğrulandı.
