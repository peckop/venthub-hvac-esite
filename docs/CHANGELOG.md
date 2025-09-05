# Changelog

## 2025-09-05 (Admin UI Standardizasyonu)
- Yeni: Ortak AdminToolbar bileşeni (arama, select, chip grubu, toggle, Temizle, sayaç, sticky yüzey, focus ring)
- Düzen: 2 satır (üst: arama/select/aksiyonlar, alt: chip’ler); 48px kontrol yüksekliği; shrink-0 sağ blok, nowrap metinler
- Movements: Toolbar entegrasyonu + Dışa Aktar (CSV) dropdown
- Orders: Toolbar entegrasyonu + Durum select + Tarih aralığı alanları + Dışa Aktar (CSV, Excel .xls) dropdown
- Returns: Toolbar entegrasyonu + çoklu durum chip’leri
- Users: Toolbar ile arama standardizasyonu
- Görsel uyum: Tüm toolbar’larda bg-gray-50 + border ile ayrı panel hissi; “Grupla” gibi checkbox’lar Radix Switch’e geçirildi

## 2025-09-05 (Homepage Enhancements)
- Add VisualShowcase (parallax + canvas particles + play/pause + keyboard/swipe)
- Add ProductFlow (three-lane product image marquee; clickable brand cards fallback; reduced-motion static grid)
- Add TrustSection (KVKK, iyzico, Returns; remove Cloudflare card)
- Add FAQShortSection and integrate ResourcesSection
- HomePage: place VisualShowcase + ProductFlow above Applications; keep product teasers lower
- Navigation/Analytics: nav_click (Products/Categories) and category_click (MegaMenu/ProductsPage popular categories)
- ProductsPage: dynamic breadcrumb (Discover/All/Search), analytics on popular categories
- main.tsx: disable scroll restoration for refresh (scroll to top)
- Remove CaseStudySection from HomePage

(See docs/HOMEPAGE_ENHANCEMENTS.md for details and backlog.)

### 2025-09-05 Evening Updates
- Increase 3D tilt intensity (18°) with shine + dynamic shadow; enable on (hover:hover & pointer:fine) devices; respect reduced-motion.
- Switch Hero spotlight to screen-blend lighting; imleci doğru takip eder, dalga estetigini bozmaz.
- VisualShowcase: hover’da autoplay durdurma kaldırıldı; parallax/canvas touch ve küçük ekranlarda devre dışı.
- Mobile: Tilt dokunmatik cihazlarda kapalı; BentoGrid video katmanı dokunmatik cihazlarda render edilmez.
- TrustSection: 3 kart gridi lg:grid-cols-3 ile ortalandı; görseller object-center ile sola kayma düzeltildi.

## 2025-09-01

### Security / Logging Hygiene
- Remove unused `supabase/functions/iyzico-payment/iyzico-real.ts` that contained hardcoded sandbox credentials (replaced with safe stub)
- Edge Function (`iyzico-payment/index.ts`): gate info logs behind `IYZICO_DEBUG=true` and sanitize PII (mask email/phone; redact addresses)
- App (frontend): replace/remove `console.log` calls; add dev-only `debug(...)` helper gated by `VITE_DEBUG` that logs via `console.warn`
- Analytics fallback logs now use `console.warn`; PaymentSuccess/AuthContext stray logs removed

### Lint / CI
- Enforce `no-console` in app code (allow `warn` and `error`)
- Fix minor TS warnings in Checkout debug helper (use `unknown` types, safe `import.meta` typing)
- `npm run lint` passes with `--max-warnings=0`

### Developer Notes
- To see debug logs locally: set `VITE_DEBUG=true` in your `.env.development`
- To see edge logs in production/sandbox: set `IYZICO_DEBUG=true` in the function environment

## 2025-08-29

### Cart Synchronization Fixes
- **Fix: Payment success cart clearing** - PaymentSuccessPage now aggressively clears all cart localStorage data on payment success
- **Fix: Guest cart priority** - Guest cart items are now prioritized over old server cart items when user logs in
- **Fix: Server cart clearing** - Server cart is completely cleared when guest cart exists during login to prevent old items from reappearing
- **Fix: Logout owner clearing** - Cart owner is cleared from localStorage on logout, marking cart as guest cart
- **Improvement: clearCart function** - Enhanced to properly clear all localStorage keys and dispatch cross-tab sync events
- **Add: localStorage constants** - Added proper constants for cart localStorage keys for better maintainability

### Cart Behavior Summary
- ✅ Guest users can add items to cart (stored in localStorage)
- ✅ Guest cart is preserved and prioritized when user logs in
- ✅ Payment completion completely clears cart across all tabs
- ✅ User logout clears ownership, enabling fresh guest cart experience
- ✅ No more old server cart items mixing with new guest items

## 2025-08-28

### Cart / Pricing
- Fix: `upsertCartItem` hem INSERT hem UPDATE sırasında `unit_price` ve `price_list_id` yazar.
- UI: Footer'a build etiketi eklendi (`branch@sha`).

### Verify / Monitoring
- Yeni: `.github/workflows/verify-cart-items.yml`
  - `unit_price` null bulunduğunda FAIL eder, aksi halde PASS.
  - Manuel tetiklenebilir; ayrıca cron (03:00 UTC) ile gecelik çalışır.
- Script: `.scripts/query_cart.ps1` — `.env.local` → env → repo fallback sırası ile config okur; tek komutta özet verir.

### Database
- Migration: `20250828_cart_items_timestamps.sql` — `created_at`, `updated_at` ve update trigger’ı eklendi.
- Daha önceki migration’lar: `cart_items_add_unit_price.sql` ve `cart_items_add_price_list_id.sql` (idempotent).

### CI/CD
- Cloudflare Pages
  - Deploy tetikleyici: `paths` filtresi kaldırıldı → master’a her push’ta otomatik deploy.
  - Build env: `VITE_CART_SERVER_SYNC=true`, `VITE_COMMIT_SHA`, `VITE_BRANCH`.
- Supabase Migrate
  - `sslmode=require` zorunluluğu ve psql bağlantı testi eklendi.
  - `SUPABASE_DB_URL` yoksa `SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF` ile Supabase CLI fallback.

### Notlar
- Secrets: CI için GitHub Secrets kullanın; yerelde `.env.local` kullanabilirsiniz (repo’ya commit etmeyin).
- `Verify Cart Items` job’ı PASS ise son getirilen satırlarda `unit_price` alanı boştur değildir; `price_list_id` özel liste için UUID, global fiyat için null olabilir.
