# Superpowers Brainstorm: 001-type-unification

## Goal
Sistemdeki `Category` ve `DomainCategory` tiplerini birleştirerek "Source of Truth" karmaşasını bitirmek.

## Constraints
- **Manifesto Uyumu**: Tip mimarisi fiziksel gerçekliğe (veritabanı) ve ticari mantığa (UI modelleri) tam uyumlu olmalı.
- **Strict Typing**: No-any kuralına sadık kalınmalı.

## Known context
- `Category` arayüzü `src/lib/supabase.ts` içinde yer alıyor.
- `DomainCategory` tipi `src/types/ui-models.ts` içinde yer alıyor.

## Risks
- **Dependency Hell**: Çok fazla dosya bu tiplere bağımlı.
- **Field Mismatch**: `Category` ve `DomainCategory` alanlarının tam örtüşmemesi durumunda opsiyonel alanlarla (`?`) güvenlik sağlanmalı.

## Options
- **Option 1**: Manual Migration (Her dosyayı tek tek düzelt).
- **Option 2**: Alias-Based Bridge (Takma ad köprüsü ile kademeli geçiş).

## Recommendation
**Option 2**. `Category` tipini `DomainCategory` için bir alias yapmak, projenin %90'ını dokunmadan modernize eder.

## Acceptance criteria
- [ ] `src/lib/supabase.ts` içindeki `interface Category` kaldırıldı.
- [ ] `DomainCategory` alias olarak atandı.
- [ ] Build (`tsc`) hatasız tamamlandı.
