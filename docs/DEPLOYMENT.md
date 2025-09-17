# CI/CD Deployment Guide

This document explains how our CI (GitHub Actions) and deployments (Cloudflare Pages) are configured, and what environment variables are required.

## Overview
- Code → GitHub → (optional) GitHub Actions run tests/lint/build → Cloudflare Pages builds and deploys `dist/`.
- Database migrations: Supabase migrations are applied by a dedicated GitHub Actions workflow.

### Local preview ports
- Vite dev: http://localhost:5173 (geliştirme, performans skorları düşük olabilir)
- Vite preview: http://localhost:4173 (prod benzeri, Lighthouse ölçümleri için önerilir)

## GitHub Actions
- Migration workflow: `.github/workflows/supabase-migrate.yml` (status badge is in README)
- Required secrets:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_REF`
- Typical trigger: push to `supabase/migrations/*.sql` or main branch (depending on your policy).

(Optional) You can add additional workflows for lint/test/build PR checks and prevent merging when they fail.

## Cloudflare Pages

WhatsApp değişkenini eklemek için:

1) Project → Settings → Environment Variables
2) Add Variable:
   - Name: `VITE_SHOP_WHATSAPP`
   - Value: `905313441813`
   - Environments: Production ve Preview
3) Save & Redeploy (son commit'i yeniden yayınlayın)

- master push sonrası otomatik yayın, gerekirse Pages → Deployments → Retry/Trigger.
- AdminOrdersPage’de yeni bundle’ı görmek için `Ctrl+F5` ile sert yenileyin (Disable cache açık).
- Project: Cloudflare Pages (Static site hosting)
- Build settings:
  - Framework: Vite (static build)
  - Node version: 18+
  - Package manager: pnpm (enable pnpm or use corepack)
  - Build command: `pnpm run build:ci`
  - Output directory: `dist`
- Environment variables (Production + Preview):
  - `VITE_SUPABASE_URL` → `https://<project-ref>.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` → `<anon key>`
  - `VITE_SHOP_WHATSAPP` → Optional WhatsApp phone (e.g., 90XXXXXXXXXX) for “Stok sor” deeplink
- Edge Function env (set in Supabase → Functions → Settings → Env Variables):
- Resend (Kargo E‑postaları) + Branding
    - `RESEND_API_KEY`
    - `EMAIL_FROM` — doğrulanmış gönderen yoksa geçici: `VentHub Test <onboarding@resend.dev>`
    - `EMAIL_TEST_MODE` — başlangıçta true; gerçek gönderime geçtiğinizde false
    - `EMAIL_TEST_TO` — testte alıcı (varsayılan delivered@resend.dev)
    - `SHIP_EMAIL_BCC` — kopya adres(ler)
    - `NOTIFY_DEBUG` — sunucu tarafı güvenli debug
- Branding (opsiyonel)
  - `BRAND_NAME` (örn. VentHub)
  - `BRAND_PRIMARY_COLOR` (örn. #2563eb)
  - `BRAND_LOGO_URL` (doğrulanmış bir logo URL'si; boş bırakılabilir)
- Twilio (ops.):
    - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `TWILIO_PHONE_NUMBER`
  - `RESEND_API_KEY` (Email provider)
  - `EMAIL_FROM` (e.g., `VentHub <info@venthub.com>`)
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `TWILIO_PHONE_NUMBER` (opsiyonel: WhatsApp/SMS)
  - `NOTIFY_DEBUG` (optional: `true` to enable safe debug logs)

Notes:
- Do not commit secrets; always use platform env vars/secrets.
- If you later add server-side endpoints (e.g., Supabase Edge Functions / Workers), document their deploy process separately.

## Self‑host (Own Server) with Coolify
Coolify ile self‑host iki şekilde yapılabilir:

1) Static Site (önerilen, Vite yapısı için):
- Coolify’da yeni “Static Site” oluşturun.
- Build command: `pnpm run build:ci`
- Output directory: `dist`
- Environment variables (Production + Preview):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Node: 18+; pnpm etkin (Coolify yapılandırmasına göre corepack kullanılabilir).

2) Containerize (Nginx veya Caddy ile):
- Dockerfile ile static build alıp Nginx/Caddy üzerinden servis edin. Örnek Dockerfile (ayrıca bkz. `deploy/Dockerfile`):
```dockerfile path=null start=null
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:ci

# Serve stage (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Optional: custom nginx.conf to enable caching/compression
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
- Coolify’da “Dockerfile” seçerek deploy edin; env değişkenlerine ihtiyaç yoktur çünkü build zamanı VITE_* inject edilir.

### Legal/Şirket Bilgileri
- Kurumsal alanlar `src/config/legal.ts` içinde merkezî olarak tutulur. Yayına çıkmadan önce bu dosyayı şirket bilgilerinizle güncelleyin (unvan, adres, vergi, mersis, KVKK e‑posta vb.).

## Local commands (for parity)
- `pnpm exec eslint .` — Lint
- `pnpm test -- --run` — Tests
- `pnpm run build:ci` — Type-check + Vite production build
- `pnpm run preview` — Prod benzeri statik önizleme (4173)

### Lighthouse (Windows PowerShell)
Prod benzeri ölçüm (preview 4173):
```powershell
npx -y lighthouse http://localhost:4173 `
  --preset=desktop `
  --only-categories=performance,accessibility,seo,best-practices `
  --output=json `
  --output-path=./lighthouse-report.json `
  --quiet `
  --chrome-flags="--headless"
```

## Troubleshooting
- Large chunks warning: consider code-splitting via dynamic imports or Rollup `manualChunks`.
- Missing env: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set on Cloudflare for both Preview and Production.
- pnpm not found: enable pnpm in Pages project settings or use `corepack enable && pnpm --version` in a prebuild step.

### Debug logging (safe)
Frontend (Vite):
- Set `VITE_DEBUG=true` to enable dev-only debug logs (printed as `console.warn`).
- These logs avoid PII; still keep disabled in Production unless actively troubleshooting.
- How to set:
  - Local: add to `.env.development` → `VITE_DEBUG=true`
  - Cloudflare Pages (Preview only recommended): Project → Settings → Environment Variables → add `VITE_DEBUG=true`

Edge Function (Supabase):
- Set `IYZICO_DEBUG=true` on the iyzico-payment function to enable additional server-side logs.
- PII is sanitized (email/phone masked, addresses redacted) but prefer enabling only in Sandbox or temporarily in Production.
- How to set:
  - Supabase Dashboard → Functions → `iyzico-payment` → Settings/Config → Environment Variables → add `IYZICO_DEBUG=true` → redeploy function.

### Shipping Webhook (Sandbox Test)
- Endpoint: `https://<PROJECT_REF>.functions.supabase.co/shipping-webhook`
- Auth: Prefer HMAC-SHA256 base64 over raw body in `X-Signature`; optional legacy token `X-Webhook-Token`.
- Optional replay guard headers: `X-Timestamp` (epoch ms or ISO) and `X-Id` (event id). If timestamp is present, ±5 dk tolerans kontrol edilir.
- Test script (Windows PowerShell): `.scripts/send_shipping_webhook.ps1`

Example:
```powershell path=null start=null
$project = "<PROJECT_REF>"
$secret  = "<SHIPPING_WEBHOOK_SECRET>"
$body    = '{"order_id":"<uuid>","carrier":"mock","status":"in_transit","tracking_number":"T123"}'

powershell -ExecutionPolicy Bypass -File .scripts/send_shipping_webhook.ps1 `
  -ProjectRef $project `
  -Secret $secret `
  -BodyJson $body `
  -Carrier mock
```
- Status mapping: created/info_received → paid; in_transit/out_for_delivery → shipped; delivered → delivered; failed/exception/canceled → failed.

