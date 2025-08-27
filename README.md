# Venthub HVAC E‑Site

[![Supabase Migrate](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml)

React + TypeScript + Vite tabanlı e‑ticaret uygulaması.

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

### GitHub Actions ile Build
Workflow içinde VITE_* değişkenleri Secrets üzerinden geçiriyoruz. Secrets ekleyin:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Supabase Migrations (Otomatik)
- `supabase/migrations/*.sql` push edildiğinde CI, Supabase CLI (v2.39.2) ile otomatik uygular.
- Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` zorunludur.

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
