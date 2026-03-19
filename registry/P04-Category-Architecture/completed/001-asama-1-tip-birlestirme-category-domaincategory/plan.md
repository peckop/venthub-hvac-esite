# Superpowers Plan: 001-type-unification

## Goal
`Category` tipini `DomainCategory` ile otonom olarak birleştirme.

## Assumptions
- `DomainCategory`, `Category`'nin tüm işlevlerini kapsıyor.
- Mevcut bileşenler `Category` ismine bağımlı.

## Plan
1. **Tip Köprüsü Kurulumu**
   - Files: `src/lib/supabase.ts`
   - Change: `interface Category` silinir. `DomainCategory` import edilip `export type Category = DomainCategory` tanımlanır.
   - Verify: `pnpm exec tsc` (lokal dosya bazlı kontrol).

2. **Kırılma Analizi & Fix**
   - Files: `src/types/ui-models.ts`, `src/lib/type-converters.ts`
   - Change: Eğer `DomainCategory` içinde eksik alan varsa `Category`'den taşınır.
   - Verify: `pnpm exec tsc -b tsconfig.build.json`

3. **Nihai Mühür (Commit-Ready)**
   - Files: `src/lib/supabase.ts`
   - Change: Code cleanup & Lint formatting.
   - Verify: `pnpm run lint`

## Risks & mitigations
- **Risk**: Veritabanı ham verisi ile UI tipi çakışabilir.
- **Mitigation**: `type-converters.ts` katmanındaki `toDomainCategory` fonksiyonu tüm ham verileri sanitize ederek geçirecek.

## Rollback plan
- `git checkout src/lib/supabase.ts` komutu ile değişiklik geri alınabilir.
