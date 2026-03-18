# Brainstorm: 004-partial-prerendering (PPR)

## 🎯 Goal
Sayfa bazlı statik kabuk (Header, Nav) ile dinamik içerik (Ürün Fiyatı, Stok) ayrımını PPR ile sağlayarak "Instant Loading" deneyimi sunmak.

## 🛡️ Constraints & Risks
- **Risk:** `experimental.ppr` bayrağının açılmasıyla birlikte mevcut Suspense yapılarında oluşabilecek hidratizasyon (hydration) hataları.
- **Risk:** Dinamik içeriklerin (e.g., indirimli fiyat) statik olarak önbelleğe alınması riski.
- **Kısıt:** Next.js 15 Canary/Stable sürümleri arasında PPR implementasyon farkları.

## 💡 Options & Recommendation
- **Öneri:** Ürün detay sayfasında (`src/app/products/[id]/page.tsx`) PPR'ı aktif et. Kritik bileşenleri `Suspense` ile sararak iskelet (skeleton) yapılarını kurgula.

## ✅ Acceptance Criteria
- [ ] Ürün detay sayfasında LCP (Largest Contentful Paint) iyileşmesi.
- [ ] Statik Header'ın anında, dinamik fiyatın bir saniye sonra yüklendiğinin doğrulanması.
