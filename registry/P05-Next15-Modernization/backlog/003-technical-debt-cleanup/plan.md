# Plan: Technical Debt Cleanup & Type Safety

## 🎯 Goal
Next.js 15 stabilite ve tip güvenliği restorasyonu.

## 🏗️ Steps

1. **Envanter Çıkarma**: 
   - `grep -r "as any" src/` komutu ile tüm geçici çözümleri listele.
   - `grep -r "server-only" src/` kontrolü yap.

2. **Kritik Bileşen Refactor**: 
   - `src/components/navigation/SearchOverlay.tsx` (İkon tipleri)
   - `src/views/TopicPage.tsx` (React 19 Props)
   - `src/actions/auth.ts` (Server Action tipleri)

3. **Global Tip Güncellemesi**:
   - `src/types/db-rows.ts` içindeki eksik alias'ları tamamla.

4. **Doğrulama (Verify)**:
   - `pnpm run lint:ci`
   - `pnpm exec tsc -b tsconfig.build.json`
