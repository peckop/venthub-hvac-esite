# 🚀 CİLT 4: ALTYAPI, DAĞITIM VE EMNİYET PROTOKOLLERİ (OPERATIONS & DEPLOY)

Bu kitap, VentHub platformunun Vercel ve Supabase altyapı yönetimini, CI/CD adımlarını, veritabanı göçlerini (migrations), Supabase Advisor emniyet/güvenlik önlemlerini ve otonom ordunun Gece Vardiyası (Night Shift) yönetim yönergelerini içerir.

---

# CI/CD Dağıtım Rehberi

Bu belge, GitHub Actions ve **Vercel** yapılandırmasını, gerekli ortam değişkenlerini ve dağıtım adımlarını açıklar.

---

## Genel Akış

```
Kod → GitHub → GitHub Actions (lint/type-check) → Vercel (build + deploy, otomatik)
                      │
                      └──► Supabase Migration Workflow (otomatik)
```

---

## Yerel Geliştirme

```bash
pnpm dev      # http://localhost:3000 (Next.js dev server)
pnpm build    # Üretim derlemesi (.next/)
pnpm start    # Üretim sunucusu (build sonrası)
pnpm preview  # Prod benzeri test (build + start)
```

---

## GitHub Actions

### Gerekli Secrets

| Secret | Açıklama |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI erişim tokeni |
| `SUPABASE_PROJECT_REF` | Supabase proje referans ID'si |
| `NEXT_PUBLIC_SUPABASE_URL` | Build zamanı ortam değişkeni |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build zamanı ortam değişkeni |

### Aktif Workflow'lar

| Workflow | Tetikleyici | İş |
|---|---|---|
| `supabase-migrate.yml` | `supabase/migrations/*.sql` push | Otomatik migration |
| `app-lint.yml` | PR + push | ESLint 9 Flat Config |
| `db-advisor.yml` | Zamanlanmış | Supabase güvenlik/performans önerileri |

---

## Vercel (Birincil Deploy Platformu)

Vercel, Next.js projesini otomatik olarak tanır — ek `vercel.json` gerekmez.

### Build Ayarları (Otomatik Algılanan)

| Ayar | Değer |
|---|---|
| Framework | Next.js (otomatik) |
| Build komutu | `pnpm run build:ci` |
| Çıkış dizini | `.next` (otomatik) |
| Node sürümü | 18+ |
| Paket yöneticisi | pnpm |

### Ortam Değişkenleri

Vercel Dashboard → Project → Settings → Environment Variables bölümüne ekleyin.  
Her değişken için **Production**, **Preview**, **Development** ortamlarını seçin.

**Frontend (Build zamanı):**

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonim anahtar |
| `NEXT_PUBLIC_SITE_URL` | Sitenin tam adresi (ör. `https://venthub.com`) |
| `NEXT_PUBLIC_IYZICO_API_KEY` | İyzico API anahtarı |
| `NEXT_PUBLIC_IYZICO_SECRET_KEY` | İyzico gizli anahtar |
| `NEXT_PUBLIC_IYZICO_BASE_URL` | `https://sandbox-api.iyzipay.com` (sandbox) |
| `NEXT_PUBLIC_SHOP_WHATSAPP` | Opsiyonel — format: `905XXXXXXXXX` |
| `NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN` | Opsiyonel — Cloudflare Stream CDN |

**Supabase Edge Functions (Supabase Dashboard → Functions → Env Variables):**

| Değişken | Açıklama |
|---|---|
| `RESEND_API_KEY` | E-posta gönderimi |
| `EMAIL_FROM` | Doğrulanmış gönderen (ör. `VentHub <info@venthub.com>`) |
| `EMAIL_TEST_MODE` | `true` → test modu, gerçek gönderim yok |
| `EMAIL_TEST_TO` | Test modunda alıcı |
| `SHIP_EMAIL_BCC` | Kargo e-postasına BCC |
| `NOTIFY_DEBUG` | `true` → sunucu taraflı debug logları |
| `TWILIO_ACCOUNT_SID` | Opsiyonel — WhatsApp/SMS |
| `TWILIO_AUTH_TOKEN` | Opsiyonel |
| `TWILIO_WHATSAPP_NUMBER` | Opsiyonel — format: `whatsapp:+90XXXXXXXXXX` |
| `IYZICO_DEBUG` | `true` → ödeme fonksiyonu debug modu |
| `BRAND_NAME` | Opsiyonel — e-posta markalaması |
| `BRAND_PRIMARY_COLOR` | Opsiyonel — hex renk (ör. `#2563eb`) |
| `BRAND_LOGO_URL` | Opsiyonel — logo URL'i |

---

## Self-Host (Coolify)

### Seçenek A: Node.js Server (Önerilen — Next.js için)

```bash
# Build komutu
pnpm run build:ci

# Start komutu
pnpm start

# Port: 3000
```

Coolify'da "Node.js" uygulaması olarak tanımlayın. Ortam değişkenlerini `NEXT_PUBLIC_` prefix'iyle ekleyin.

### Seçenek B: Docker ile Containerize

```dockerfile
# Build aşaması
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:ci

# Çalışma aşaması (Next.js standalone)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Not:** `next.config.js` dosyasında `output: 'standalone'` aktif olmalıdır.

---

## Yasal / Kurumsal Bilgiler

`src/config/legal.ts` — şirket unvanı, adres, vergi numarası, MERSIS, KVKK e-postası. Yayına çıkmadan önce güncelleyin.

---

## Lokal Komutlar

```bash
pnpm exec eslint .      # ESLint denetimi
pnpm type-check         # TypeScript tip kontrolü
pnpm test -- --run      # Vitest birim testleri
pnpm run build:ci       # Üretim derlemesi
```

---

## Trouble­shooting

### Eksik ortam değişkeni
`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` hem Production hem Preview'da tanımlı olmalıdır.

### pnpm bulunamadı
Cloudflare Pages projesinde `Settings → Build → Package manager: pnpm` seçili olmalı veya build komutuna `corepack enable && pnpm install && pnpm build:ci` ekleyin.

### Hydration hatası
`"use client"` direktifini içeren bileşenlerin `window`/`document` erişimini `useEffect` içinde kapsülleyin.

---

## Lighthouse Ölçümü (Windows PowerShell)

```powershell
# Önce build + start çalıştırın (port 3000)
pnpm build && pnpm start

# Sonra ölçüm:
npx -y lighthouse http://localhost:3000 `
  --preset=desktop `
  --only-categories=performance,accessibility,seo,best-practices `
  --output=json `
  --output-path=./lh-report.json `
  --quiet `
  --chrome-flags="--headless"
```

---

## Shipping Webhook Test

```
Endpoint: https://<PROJECT_REF>.functions.supabase.co/shipping-webhook
Auth: HMAC-SHA256 (X-Signature header)
Replay guard: X-Timestamp (±5 dk tolerans) + X-Id
```

```powershell
$project = "<PROJECT_REF>"
$secret  = "<SHIPPING_WEBHOOK_SECRET>"
$body    = '{"order_id":"<uuid>","carrier":"mock","status":"in_transit","tracking_number":"T123"}'

powershell -ExecutionPolicy Bypass -File .scripts/send_shipping_webhook.ps1 `
  -ProjectRef $project `
  -Secret $secret `
  -BodyJson $body `
  -Carrier mock
```

**Durum Eşleşmeleri:**
`created/info_received` → paid | `in_transit/out_for_delivery` → shipped | `delivered` → delivered | `failed/exception/canceled` → failed


---

# Güvenlik ve Performans Kontrol Listesi
> **Status: ✅ ACTIVE & VERIFIED (Jan 2026)**
> Güvenlik politikaları ve performans iyileştirmeleri bu belgeye uygun olarak uygulanmıştır.


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

### DB Advisor Playbook
- Debug çıktıları (eklendi):
  - Identity & Env: current_database(), current_user, version()
  - cart_items index/constraint dökümü ve normalize duplicate kontrolü
  - Gerekirse diğer tablolar için de aynı debug kalıbı genişletilebilir
- Otomatik düzeltmeler (Fix workflow): `.github/workflows/db-advisor-fix.yml`
  - search_path sabitleme (SECURITY DEFINER fonksiyonlar)
  - FK kaplayıcı indeksler (idempotent)
  - Duplicate index/constraint cleanup (cart_items)
  - RLS konsolidasyonu (cart_items, shopping_carts; gerekirse user_profiles, venthub_returns ek adımlar)
- Bilinçli istisna: Leaked Password Protection (LPP) WARN — uygulama içi HIBP kontrolü kullanılıyor (bu uyarı kabul edilir)

- Kullanılmayan indeksler (INFO düzeyi): Advisor, “kullanılmadı” olarak işaretler. Üretimde kullanım metrikleri toplanmadan agresif silme önerilmez. Yine de gözden geçirmek için liste:
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



---

# 🌙 VentHub Night Shift Protocol (Gece Vardiyası Rehberi)

Ajanları toplu olarak veya sırayla sahaya sürmek istediğinde ezberlemene gerek yok. Bu dosya senin otonom ordunu yönetme el kitabındır. 

Sıralama mantığı **"Bina Tadilatı"** (Yıkım -> İskelet -> İnce İşçilik -> Ruhsat) analojisine dayanır. Manuel çalıştırmak için aşağıdaki komutları sırasıyla terminale kopyala yapıştır yapabilirsin. Her bir adımın bir öncekinin açtığı PR (Pull Request) tamamlandıktan (veya merge edildikten) sonra çalıştırılması tavsiye edilir.

---

### FAZ 1: Hafriyat ve Yıkım (Kaba Temizlik)
Çöpleri, kullanılmayan kodları ve borçları temizlemeden binayı boyamayız.

1. **⚰️ Üst Düzey Temizlik (Undertaker):**
   *Açıklama: Kullanılmayan fonksiyonları, importları ve atıl dosyaları siler.*
   ```bash
   gh workflow run jules-undertaker.yml
   ```

2. **🧹 Teknik Borç (Janitor):**
   *Açıklama: TODO, FIXME ve HACK notlarını bularak kökünden çözer.*
   ```bash
   gh workflow run jules-janitor.yml
   ```

---

### FAZ 2: Taşıyıcı Kolonlar (Güvenlik ve Mimari)
Kod temizlendikten sonra güvenliği kilitleyip tipleri çelik gibi sağlamlaştırmalıyız.

3. **💉 Tip Güvenliği (Surgeon):**
   *Açıklama: Kod içindeki "any" ve tip kaçamaklarını kapatır.*
   ```bash
   gh workflow run jules-lint-fix.yml
   ```

4. **🛡️ Güvenlik ve RLS (Sentinel):**
   *Açıklama: Supabase veritabanı politikalarını ve backend açıklarını kapatır.*
   ```bash
   gh workflow run jules-security-audit.yml
   ```

---

### FAZ 3: İnce İşçilik (Optimizasyon & UX)
İskelet sağlam. Artık performans darboğazlarını çözüp, arayüzü güzelleştirme zamanı.

5. **⚡ Performans (Bolt):**
   *Açıklama: React render sorunlarını ve yavaş DB sorgularını hızlandırır.*
   ```bash
   gh workflow run jules-performance.yml
   ```

6. **🌍 Çeviri ve Metinler (Consul):**
   *Açıklama: Uygulamadaki çıplak metinleri useI18n dil dosyalarına bağlar.*
   ```bash
   gh workflow run jules-i18n-sync.yml
   ```

7. **🎨 UX & Erişim (Palette):**
   *Açıklama: Görme engelliler için etiketlemeleri (ARIA) ve arayüz kontrastını düzeltir.*
   ```bash
   gh workflow run jules-a11y.yml
   ```

---

### FAZ 4: Ruhsat ve Kullanım Kılavuzu (Kalite Güvence)
Kod optimize edildiğine göre, artık mühür vurup belgeleyebiliriz. Cila burada atılır.

8. **📚 Dokümantasyon (Scribe):**
   *Açıklama: Karmaşık fonksiyonlara detaylı JSDoc/TSDoc yorumları yazar.*
   ```bash
   gh workflow run jules-scribe.yml
   ```

9. **🧪 Test Mühendisi (Darwin):**
   *Açıklama: Artık değişmeyecek kodlara unit test (Vitest) yazar.*
   ```bash
   gh workflow run jules-test-coverage.yml
   ```

---
**💡 İpucu:** Spesifik bir sorunu anlık çözmek istersen (sıraya uymadan) herhangi birini tekil olarak tetikleyebilirsin. Yukarıdaki sıra sadece "Sistem Çapında Genel Yenileme" yapılacaksa izlenmelidir.