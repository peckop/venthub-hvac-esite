# Venthub HVAC E‑Site

[![Supabase Migrate](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml)

React + TypeScript + Vite tabanlı e‑ticaret uygulaması.

- Yol Haritası ve durum takibi: bkz. docs/ROADMAP.md
- CI/CD ve dağıtım rehberi: bkz. docs/DEPLOYMENT.md

## Ortam Değişkenleri (Vite)

Aşağıdaki değişkenler build sırasında gereklidir:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Örnek dosya: `.env.example`. Üretime secret koymayın; dağıtım ortamınızın (Vercel/Netlify/Render/Actions) env yönetimini kullanın.

### Vercel
- Project Settings → Environment Variables
- Name: VITE_SUPABASE_URL, Value: https://<project-ref>.supabase.co
- Name: VITE_SUPABASE_ANON_KEY, Value: <anon key>
- Environments: Production + Preview
- Redeploy

### Netlify
- Site settings → Environment variables → Add variable
- Names: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Production + Deploy Previews için ekleyip yeniden yayınlayın

### Cloudflare Pages
- Project → Settings → Environment Variables
- Name: VITE_SUPABASE_URL, Value: https://<project-ref>.supabase.co
- Name: VITE_SUPABASE_ANON_KEY, Value: <anon key>
- Node version: 18+ (Pages defaults uygundur)
- Package manager: pnpm (Pages “Enable pnpm” veya corepack)
- Build command: pnpm run build:ci
- Output directory: dist
- Preview ve Production ortamlarına aynı değişkenleri ekleyin

### GitHub Actions ile Build
Workflow içinde VITE_* değişkenleri Secrets üzerinden geçiriyoruz. Secrets ekleyin:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Supabase Migrations (Otomatik)
- `supabase/migrations/*.sql` push edildiğinde CI, Supabase CLI (v2.39.2) ile otomatik uygular.
- Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` zorunludur.
- GitHub Actions: `.github/workflows/supabase-migrate.yml` tetikleyicileri ve job’ları sizin policy’nize göre düzenlenebilir.

---

## Değişiklik Özeti (Son Çalışmalar)
Bkz. ayrıntılı günlük: `docs/CHANGELOG.md`.

Tarih: 2025-08-28/29

- Cart / Fiyatlandırma
  - Server senkronunda `upsertCartItem` artık hem INSERT hem UPDATE sırasında `unit_price` ve `price_list_id` alanlarını yazar.
  - UI tarafında footer’a yayın sürüm etiketi eklendi (`branch@sha`) — üretimde hangi commit’in çalıştığı netleşti.
- Doğrulama / İzleme
  - Yeni iş akışı: `.github/workflows/verify-cart-items.yml` — son kayıtları kontrol eder, satırlarda `unit_price` null ise FAIL olur; aksi halde PASS.
  - Gecelik çalışma eklendi (cron: 03:00 UTC). İstenirse manuel “Run workflow” ile de tetiklenebilir.
  - Lokal hızlı kontrol: `.scripts/query_cart.ps1` `.env.local` okur; tek komutla `COUNT` ve örnek satırlar (id, qty, `unit_price`, `price_list_id`).
- Veritabanı
  - Migration: `supabase/migrations/20250828_cart_items_timestamps.sql` — `cart_items` tablosuna `created_at`, `updated_at` + trigger eklendi.
  - Daha önce eklenen migration’larla `cart_items.unit_price` ve `cart_items.price_list_id` alanları mevcut.
- CI/CD
  - Cloudflare Pages: deploy workflow’unda `paths` filtresi kaldırıldı → master’a her push’ta otomatik deploy.
  - Build env’leri eklendi: `VITE_CART_SERVER_SYNC=true`, `VITE_COMMIT_SHA`, `VITE_BRANCH`.
  - Supabase migrate workflow’u güçlendirildi:
    - `sslmode=require` zorunlu, bağlantı testi (psql `select 1`) eklendi.
    - `SUPABASE_DB_URL` yoksa `SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF` ile Supabase CLI yoluna otomatik geçiş.

Notlar:
- Lokal gizli bilgiler `.env.local` dosyasında tutulabilir (gitignore’da). CI tarafında gizli bilgiler her zaman GitHub Secrets üzerinden sağlanmalıdır.

## Geliştirme
- pnpm install
- pnpm dev
- pnpm lint
- pnpm test
- pnpm run build:ci

## Lokal migration (psql)
GitHub Actions yerine yerelde migration uygulamak için PowerShell scripti eklenmiştir.

1) Supabase panelinden Database > Connection string (URI) kopyalayın (postgresql:// ile başlar).
2) Aşağıdaki komutu çalıştırın (Windows PowerShell):

```powershell path=null start=null
# Seçenek A: URI'yi env'den okuyarak
$env:SUPABASE_DB_URL="postgresql://postgres:PAROLA@db.tnofewwkwlyjsqgwjjga.supabase.co:5432/postgres"
powershell -ExecutionPolicy Bypass -File .scripts/migrate.ps1

# Seçenek B: Çalıştırınca URI'yi sizden ister
powershell -ExecutionPolicy Bypass -File .scripts/migrate.ps1
```

Notlar:
- psql kurulu olmalıdır (Windows: winget install PostgreSQL.Client).
- URI'yi paneldeki "Copy" ile alın; özel karakter varsa URL-encode gerekebilir.
- pnpm install
- pnpm dev
- pnpm lint
- pnpm test
- pnpm run build:ci
