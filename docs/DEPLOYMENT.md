# CI/CD Deployment Guide

This document explains how our CI (GitHub Actions) and deployments (Cloudflare Pages) are configured, and what environment variables are required.

## Overview
- Code → GitHub → (optional) GitHub Actions run tests/lint/build → Cloudflare Pages builds and deploys `dist/`.
- Database migrations: Supabase migrations are applied by a dedicated GitHub Actions workflow.

## GitHub Actions
- Migration workflow: `.github/workflows/supabase-migrate.yml` (status badge is in README)
- Required secrets:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_REF`
- Typical trigger: push to `supabase/migrations/*.sql` or main branch (depending on your policy).

(Optional) You can add additional workflows for lint/test/build PR checks and prevent merging when they fail.

## Cloudflare Pages
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

## Troubleshooting
- Large chunks warning: consider code-splitting via dynamic imports or Rollup `manualChunks`.
- Missing env: ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set on Cloudflare for both Preview and Production.
- pnpm not found: enable pnpm in Pages project settings or use `corepack enable && pnpm --version` in a prebuild step.

