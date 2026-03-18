# Venthub HVAC E‑Site

[![Supabase Migrate](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml)
[![App Lint](https://github.com/peckop/venthub-hvac-esite/actions/workflows/app-lint.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/app-lint.yml)
[![DB Advisor](https://github.com/peckop/venthub-hvac-esite/actions/workflows/db-advisor.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/db-advisor.yml)

React + TypeScript + Vite tabanlı e‑ticaret uygulaması.

- Yol Haritası ve durum takibi: bkz. docs/ROADMAP.md
- CI/CD ve dağıtım rehberi: bkz. docs/DEPLOYMENT.md

## Ortam Değişkenleri (Vite)

Aşağıdaki değişkenler build sırasında gereklidir:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SHOP_WHATSAPP (opsiyonel, WhatsApp desteği için)

Örnek dosya: `.env.example`. Üretime secret koymayın; dağıtım ortamınızın (Vercel/Netlify/Render/Actions) env yönetimini kullanın.

### WhatsApp Konfigürasyonu (Opsiyonel)
`VITE_SHOP_WHATSAPP` ortam değişkeni ayarlanırsa, WhatsApp desteği otomatik olarak aktif hale gelir:

- **Format**: `905551234567` (ülke kodu + telefon numarası, özel karakter yok)
- **Kullanım Alanları**: 
  - Stokta olmayan ürünlerde "Stok sor" butonu
  - Destek sayfalarında hızlı WhatsApp iletişimi
  - FAQ sayfasında "Bulamadınız mı?" desteği
  - İletişim sayfasında WhatsApp hızlı erişim
- **Fallback**: Değişken ayarlı değilse sistem e-posta iletişime geçer

### Vercel
- Project Settings → Environment Variables
- Name: VITE_SUPABASE_URL, Value: https://<project-ref>.supabase.co
- Name: VITE_SUPABASE_ANON_KEY, Value: <anon key>
- Name: VITE_SHOP_WHATSAPP, Value: 905551234567 (opsiyonel)
- Environments: Production + Preview
- Redeploy

### Netlify
- Site settings → Environment variables → Add variable
- Names: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SHOP_WHATSAPP (opsiyonel)
- Production + Deploy Previews için ekleyip yeniden yayınlayın

### Cloudflare Pages
- Project → Settings → Environment Variables
- Name: VITE_SUPABASE_URL, Value: https://<project-ref>.supabase.co
- Name: VITE_SUPABASE_ANON_KEY, Value: <anon key>
- Name: VITE_SHOP_WHATSAPP, Value: 905551234567 (opsiyonel)
- Node version: 18+ (Pages defaults uygundur)
- Package manager: pnpm (Pages "Enable pnpm" veya corepack)
- Build command: pnpm run build:ci
- Output directory: dist
- Preview ve Production ortamlarına aynı değişkenleri ekleyin

### GitHub Actions ile Build
Workflow içinde VITE_* değişkenleri Secrets üzerinden geçiriyoruz. Secrets ekleyin:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SHOP_WHATSAPP (opsiyonel)

## Supabase Migrations (Otomatik)
- `supabase/migrations/*.sql` push edildiğinde CI, Supabase CLI (v2.39.2) ile otomatik uygular.
- Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` zorunludur.
- GitHub Actions: `.github/workflows/supabase-migrate.yml` tetikleyicileri ve job’ları sizin policy’nize göre düzenlenebilir.

---

## Son Gelişmeler (2025-12-15)

Proje modernizasyonu ve stabilite çalışmaları tamamlandı:

- **CI/CD Pipeline**: Tüm workflow'lar (Lint, Build, Test) yeşil (%100 başarı). `--max-warnings=0` politikası aktif.
- **Supabase Optimizasyonu**:
  - RLS policy'leri `initplan` sorunlarına karşı optimize edildi (`(select auth.uid())` pattern).
  - Performans indeklemesi yapıldı, gereksiz indeksler temizlendi.
- **UI/UX**:
  - Yeni **Category Landing** sayfaları (metadata-driven).
  - Ana sayfa **Hero Carousel** (otomatik kategori geçişi).
  - Hava Perdesi **Seçim Sihirbazı**.

Detaylı değişiklik günlüğü için: [docs/CHANGELOG.md](docs/CHANGELOG.md)

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

---
**Infrastructure Test (2026-03-18):** GitHub Actions & API Secrets verification push.

