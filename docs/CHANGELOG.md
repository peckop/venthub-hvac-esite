# Changelog

## 2025-08-28/29

### Cart / Pricing
- Fix: `upsertCartItem` hem INSERT hem UPDATE sırasında `unit_price` ve `price_list_id` yazar.
- UI: Footer’a build etiketi eklendi (`branch@sha`).

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
