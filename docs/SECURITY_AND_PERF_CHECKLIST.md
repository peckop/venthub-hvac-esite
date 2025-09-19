# Güvenlik ve Performans Kontrol Listesi

Bu dosya Supabase Advisor çıktıları ve operasyonel düzeltmeler için rehberdir.

## Güvenlik

### Prod Öncesi Güvenlik ve İzleme (Öncelikli)
- Sentry DSN / release / environment env değişkenleri; Edge + Frontend kurulum rehberi
- /healthz Edge Function: DB bağlantısı opsiyonel kontrol; 200/503 durumları
- Slack/Webhook uyarıları: kritik hata veya Edge Function çöküşlerinde bildirim
- CORS sıkılaştırma: ALLOWED_ORIGINS env ile origin whitelist; referer fallback
- Rate limiting: public uçlar için rpm sınırı; HMAC/token uçlar hariç
- Storage policy gözden geçirme: product-images yazma sadece admin/moderator
- SECURITY DEFINER fonksiyonlarda search_path sabit (pg_catalog, public)
- Resend API anahtarı ve e‑posta değişkenleri sadece Edge Functions env’de tutulur (kodda/repoda yok).
- shipping-notification public olsa da admin panelden çağrı yetkili server-to-server üzerinden yapılır (service role). Doğrudan public POST’lar rate‑limit ve doğrulama ile sınırlandırılabilir (ilerleme kalemi).
- LPP (Studio) kapalı; yerine app seviyesinde HIBP k‑Anonymity kontrolü uygulanır (passwordSecurity.ts). Advisor WARN bilinçli.
- Leaked Password Protection (Studio): Supabase Dashboard → Authentication → Password policy altında “Leaked password protection” özelliği varsayılan olarak KAPALI bırakılmıştır.
  - Neden? Bu özellik ücretli olabilir ve proje, eşdeğer korumayı uygulama seviyesinde sağlar.
  - Bizim çözüm: src/utils/passwordSecurity.ts ile HIBP k‑Anonymity (range API) tabanlı özel "compromised password" kontrolü; Register ve Parola Değiştir akışlarına entegredir.
  - Advisor Notu: Supabase Advisor bu özelliğin kapalı olmasını WARN olarak raporlar. Bu uyarı bilinçli olarak kabul edilir.
  - Referans: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Confirm Email: Authentication → Email provider → “Confirm email” açık ve “unverified sign-in” kapalı olmalı.
- Redirect URL’ler: Authentication → URL config → {PROD_ORIGIN}/auth/callback ve {DEV_ORIGIN}/auth/callback ekli olmalı.
- Google OAuth: Authentication → Providers → Google → Client ID/Secret girin. Redirect {ORIGIN}/auth/callback.
- Owner/Superadmin: Kritik işlemler (rol atama, güvenlik ayarları) sadece superadmin tarafından yapılmalı. Uygulandı (20250911_rbac_superadmin.sql).

## Performans

### 2025-09-19 — Uygulananlar
- Fonksiyon güvenliği: Tüm kritik fonksiyonlar için `search_path=pg_catalog, public` sabitlendi (mutable search_path uyarıları giderildi). Örnekler: enforce_role_change, bump_rate_limit, update_updated_at_column, reverse_inventory_batch, set_updated_at, adjust_stock (tüm overload’lar), set_stock (tüm overload’lar), is_admin_user, is_user_admin, get_user_role, update_user_profiles_updated_at, process_order_stock_reduction, set_user_admin_role, increment_error_group_count, jwt_role, _normalize_rls_expr.
- View güvenliği: `reserved_orders`, `inventory_summary`, `admin_users` dahil tüm kritik view’ler `security_invoker=on`. `admin_users` için anon/authenticated rollerinden yetkiler kaldırıldı (REVOKE).
- RLS konsolidasyonu: cart_items, shopping_carts, products, user_profiles, venthub_returns tablolarında aynı rol/aksiyon için tekilleştirme; performans ve okunabilirlik iyileştirildi.
- FK indeksleri: danışmanın işaret ettiği eksik kaplayıcı indeksler garanti altına alındı (idempotent CREATE INDEX IF NOT EXISTS ile).
- Duplicate index: cart_items üzerindeki duplicate unique constraint temizlendi (`cart_items_cart_product_uniq` kaldırıldı; `cart_items_cart_product_unique` korundu). `coupons` üzerindeki `idx_coupons_code` de `coupons_code_key` ile redundant olduğundan kaldırıldı.
- İndeks kullanımı: `pg_stat_user_indexes` ile mini okuma testinde kritik indekslerde `idx_scan>0` doğrulandı. Gerçek trafik geldikçe metrikler artacaktır.
- Advisor (security): Mutable search_path uyarıları temiz; kalan tek uyarı LPP (bilinçli olarak kapalı tutuluyor).

#### İndeks kullanım raporu (okuma güvenli)

```sql path=null start=null
SELECT
  t.relname  AS table_name,
  i.relname  AS index_name,
  s.idx_scan,
  s.idx_tup_read,
  s.idx_tup_fetch
FROM pg_stat_user_indexes s
JOIN pg_class i ON i.oid = s.indexrelid
JOIN pg_class t ON t.oid = s.relid
ORDER BY s.idx_scan, i.relname;
```

#### Kullanım sayısı 0 ve constraint desteklemeyen indeks adayları

```sql path=null start=null
SELECT
  t.relname  AS table_name,
  i.relname  AS index_name,
  s.idx_scan
FROM pg_stat_user_indexes s
JOIN pg_class i ON i.oid = s.indexrelid
JOIN pg_class t ON t.oid = s.relid
LEFT JOIN pg_constraint con ON con.conindid = s.indexrelid
WHERE s.idx_scan = 0
  AND con.oid IS NULL
ORDER BY 1, 2;
```

Not: Yeni projelerde “Unused index” uyarıları doğaldır; gerçek trafikten sonra yeniden değerlendirin.

### 2025-09-16 — Uygulananlar
- FK indeksleri eklendi (kaplayıcı btree):
  - coupons.created_by, order_attachments.created_by, order_notes.user_id
  - venthub_order_items.order_id, venthub_order_items.product_id, venthub_orders.user_id
- Mükerrer indeks kaldırıldı:
  - public.cart_items_cart_product_uniq (cart_items_cart_product_unique bırakıldı)
- RLS initplan düzeltmeleri ve sadeleştirme:
  - cart_items ve shopping_carts: modify_own ALL → INSERT/UPDATE/DELETE ayrıştırıldı; auth.uid() çağrıları (select ...) ile sarıldı
  - user_profiles ve venthub_returns: auth.* çağrıları (select ...) ile sarıldı
- products: admin DML ayrı policy (INSERT/UPDATE/DELETE); SELECT public policy ile yönetiliyor — Advisor “authenticated+SELECT” uyarısı giderildi

Açık kalemler
- Unused index’ler: gerçek trafik toplandıktan sonra kademeli temizlik

## CI: DB Advisor
- Workflow: `.github/workflows/db-advisor.yml`
- Çalışma şekli: GitHub Secrets’taki `SUPABASE_DB_URL` ile `psql` üzerinden salt‑okunur SQL denetimleri çalışır.
- Raporlanan başlıklar (job log’larında group olarak görünür):
  - Unindexed foreign keys
  - Duplicate indexes
  - Unused indexes (idx_scan = 0)
  - Multiple permissive RLS policies (aynı tablo/rol/aksiyon için birden fazla permissive policy)
- Notlar:
  - Adım non‑blocking’tir; uyarıları görünür kılar, pipeline’ı kırmaz.
  - İndeks “unused” olsa bile hemen silmeyin; en az 1–2 hafta gerçek kullanım toplayıp karar verin.
  - Secrets doğru ise job log’larında sorgu çıktıları tablo halinde görünür. Secrets yoksa “notice” ile kibarca atlar.
- Kullanılmayan indeksler (INFO düzeyi): Advisor, “kullanılmadı” olarak işaretlemiş. Üretimde kullanım metrikleri toplanmadan agresif silme önerilmez. Yine de gözden geçirmek için liste:
  - public.cart_items: idx_cart_items_product_id, idx_cart_items_price_list_id
  - public.product_images: idx_product_images_product_id
  - public.product_prices: idx_product_prices_price_list_id
  - public.user_invoice_profiles: idx_user_invoice_profiles_user_id
  - public.venthub_order_items: idx_venthub_order_items_product_id
  - public.venthub_returns: idx_venthub_returns_order_id, idx_venthub_returns_user_id
  - public.categories: idx_categories_parent_id
  - public.client_errors: idx_client_errors_group_id
  - public.error_groups: idx_error_groups_assigned_to
  - public.inventory_movements: idx_inventory_movements_product_id
  - public.payment_transactions: idx_payment_transactions_order_id, idx_payment_transactions_user_id
  - public.products: idx_products_category_id, idx_products_subcategory_id

Öneri: En az 1-2 haftalık gerçek trafiği izleyip index usage istatistiklerine göre tek tek kaldırın. İsteğe bağlı bir SQL script ile (DROP INDEX IF EXISTS ...) kademeli temizlik yapılabilir.

## Test/Lint/Build
- pnpm lint: Geçti.
- pnpm test: Tüm testler geçti (HIBP mocklandı, min 8 kuralı ile uyumlu).
- pnpm run build:ci: Başarılı.

## Notlar
- Tüm migration’lar idempotent yazıldı (IF EXISTS / DO $$ ... END $$ blokları). Mükerrer/çakışan yapıdan kaçınmak için tekrar çalıştırılabilir.

