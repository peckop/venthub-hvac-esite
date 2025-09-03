# Changelog

## 2025-09-03

### İyzico Payment System Critical Fixes
- **Fix: Database schema mismatch** - Added missing columns to `venthub_orders` table:
  - `customer_phone` TEXT
  - `payment_debug` JSONB 
  - `payment_status` (separate from order `status`)
- **Fix: Order items creation** - Fixed `venthub_order_items` table schema and Edge Function:
  - Added required columns: `unit_price`, `total_price`
  - Removed NOT NULL constraints from optional fields
  - Updated Edge Function to populate all required fields
- **Fix: Payment callback function** - Fixed iyzico callback to update correct columns:
  - `payment_status` (paid/failed) for payment state
  - `status` (confirmed/pending) for order state
  - Proper error handling and logging
- **Fix: Stock reduction** - Manual fix for existing orders, automatic for new orders
- **Fix: RLS policies** - Temporarily disabled for debugging, restored with proper structure

### Database Schema Updates
- `venthub_orders` table: Added missing columns for proper payment flow
- `venthub_order_items` table: Fixed schema to match Edge Function expectations  
- Payment flow now works end-to-end: order creation → payment → callback → status update
- **Disaster Recovery Migration:** `20250903_complete_payment_system.sql` - Complete table recreation if needed
- **Incremental Migration:** `20250903_fix_payment_system.sql` - Add missing columns only

### Edge Functions
- `iyzico-payment`: Fixed order items creation with all required fields
- `iyzico-callback`: Fixed to update correct status columns
- Enhanced error logging for better debugging

### Developer Notes
- Payment system now fully functional from order creation to completion
- All database constraints and foreign keys properly configured
- Stock reduction happens automatically on successful payment

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
