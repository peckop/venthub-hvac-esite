# Brainstorm: 001-infrastructure-lockdown (Next.js 15)

## 🎯 Goal
Next.js 15 geçişi için temel altyapı hazırlıklarını yapmak ve hassas veritabanı/servis katmanlarını `server-only` ile frontend'den tamamen izole etmek.

## 🛡️ Constraints & Risks
- **Risk:** `server-only` eklenen bir dosyanın yanlışlıkla bir Client Component (e.g., `use client`) içinde import edilmesi durumunda build'in patlaması.
- **Risk:** Parametrelerin (`params`) asenkron hale gelmesiyle birlikte, mevcut senkron kodlarda `params.id` gibi erişimlerin `undefined` dönmesi.
- **Kısıt:** Tüm asenkron parametre geçişlerinde Next.js 15 `Promise` tip standartlarına (await) uyulmalı.

## 💡 Options & Recommendation
- **Öneri:** `src/lib/supabase.ts` dosyasına en üst satırdan `import 'server-only'` ekleyerek güvenlik kilidini devreye al. Dinamik rotalarda (`destek/konular`) `params` objesini `await` ederek tip güvenliğini sağla.

## ✅ Acceptance Criteria
- [x] `src/lib/supabase.ts` içinde `server-only` mevcut.
- [x] `app/destek/konular/[slug]/page.tsx` içinde `params` await ediliyor.
- [x] Temel build testi başarıyla tamamlandı.
