# CI/CD Dağıtım Rehberi

Bu belge, GitHub Actions ve Cloudflare Pages yapılandırmasını, gerekli ortam değişkenlerini ve dağıtım adımlarını açıklar.

---

## Genel Akış

```
Kod → GitHub → GitHub Actions (lint/test/type-check) → Cloudflare Pages (build + deploy)
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

## Cloudflare Pages

### Build Ayarları

| Ayar | Değer |
|---|---|
| Framework | Next.js |
| Build komutu | `pnpm run build:ci` |
| Çıkış dizini | `.next` |
| Node sürümü | 18+ |
| Paket yöneticisi | pnpm (`corepack enable` veya Pages ayarlarından etkinleştir) |

### Ortam Değişkenleri (Production + Preview)

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
