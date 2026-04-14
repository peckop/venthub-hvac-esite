# VentHub HVAC — Enterprise E-Commerce Platform

[![Supabase Migrate](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/supabase-migrate.yml)
[![App Lint](https://github.com/peckop/venthub-hvac-esite/actions/workflows/app-lint.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/app-lint.yml)
[![DB Advisor](https://github.com/peckop/venthub-hvac-esite/actions/workflows/db-advisor.yml/badge.svg)](https://github.com/peckop/venthub-hvac-esite/actions/workflows/db-advisor.yml)

HVAC sektörüne özel, B2B/B2C karma satış mimarisi üzerine kurulu enterprise e-ticaret platformu.

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| **Frontend** | Next.js 15 (App Router) + React 19 |
| **Dil** | TypeScript (Strict Mode) |
| **Stil** | Tailwind CSS v3 |
| **Veritabanı** | Supabase (PostgreSQL) — RLS aktif |
| **Edge Functions** | Supabase Edge Functions (Deno) — 38 aktif |
| **Ödeme** | İyzico (3D Secure, sandbox + prod) |
| **E-posta** | Resend.dev |
| **Paket Yöneticisi** | pnpm |
| **Test** | Vitest + Playwright |
| **CI/CD** | GitHub Actions → Vercel |

---

## Özellikler

- 🛒 **Tam Sipariş Döngüsü** — Sepet → Ödeme (İyzico) → Kargo → Teslimat → İade
- 🏢 **B2B Altyapısı** — `organizations`, `price_lists`, çok katmanlı rol sistemi (super_admin / admin / warehouse / sales / viewer / user)
- 📦 **Stok Yönetimi** — Inventory movements, geri alma (undo), batch operasyonları, düşük stok uyarısı
- 🔍 **Gelişmiş Arama** — Edge Function tabanlı full-text search + HVAC parametrelerine göre filtreleme
- 🧮 **Mühendislik Araçları** — Hava perdesi seçim sihirbazı (fizik formüllü), HRV hesaplayıcı
- 🔔 **Bildirim Sistemi** — Sipariş, kargo, iade için e-posta + webhook
- 🛡️ **Güvenlik** — Rate limiting, idempotency keys, HMAC webhook doğrulama, admin audit log
- 📊 **Hata İzleme** — Client-side error grouping (client_errors + error_groups tabloları)
- 🌍 **i18n** — Dictionary tabanlı Türkçe/İngilizce altyapısı

---

## Mimari

Detaylı mimari: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

```
src/
├── app/           # Next.js App Router — sayfa rotaları
├── views/         # Sayfa içerikleri (Server + Client bileşimi)
├── components/    # Tekrar kullanılabilir UI bileşenleri
│   ├── ui/        # Primitif bileşenler (Button, Dialog...)
│   ├── home/      # Anasayfa bölümleri
│   ├── products/  # Ürün kartları, showcase
│   └── navigation/# Header, menü, kategori navigasyonu
├── lib/           # Servis katmanı (Supabase, RBAC, tip dönüşümleri)
│   └── services/  # address, cart, category, invoice, pricing, product, project
├── hooks/         # Custom React hook'ları
├── types/         # TypeScript tip tanımları (Source of Truth: database.types.ts)
├── i18n/          # Sözlük tabanlı çeviri sistemi
└── utils/         # Yardımcı fonksiyonlar

supabase/
├── functions/     # Edge Functions (38 adet, Deno çalışma ortamı)
└── migrations/    # SQL migration dosyaları (otomatik CI/CD ile uygulanır)
```

---

## Hızlı Başlangıç

### 1. Gereksinimler

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### 2. Kurulum

```bash
pnpm install
cp .env.example .env.local
# .env.local dosyasını doldurun (aşağıya bakın)
pnpm dev
```

Geliştirme sunucusu: http://localhost:3000

### 3. Komutlar

```bash
pnpm dev          # Geliştirme sunucusu
pnpm build        # Üretim derlemesi
pnpm lint         # ESLint 9 Flat Config denetimi
pnpm type-check   # TypeScript tip kontrolü
pnpm test         # Vitest birim testleri
pnpm test:watch   # İzleme modunda test
```

---

## Ortam Değişkenleri

`.env.example` dosyasını kopyalayarak `.env.local` oluşturun:

```bash
cp .env.example .env.local
```

### Zorunlu Değişkenler

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonim (public) anahtar |
| `NEXT_PUBLIC_SITE_URL` | Sitenin tam URL'i (prod: `https://venthub.com`) |

### Ödeme (İyzico)

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_IYZICO_API_KEY` | İyzico API anahtarı |
| `NEXT_PUBLIC_IYZICO_SECRET_KEY` | İyzico gizli anahtar |
| `NEXT_PUBLIC_IYZICO_BASE_URL` | Sandbox: `https://sandbox-api.iyzipay.com` |

### Backend / Edge Functions

| Değişken | Açıklama |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase servis rolü (server-only) |
| `RESEND_API_KEY` | E-posta gönderimi (Resend.dev) |

### Opsiyonel

| Değişken | Açıklama |
|---|---|
| `NEXT_PUBLIC_SHOP_WHATSAPP` | WhatsApp numarası — format: `905XXXXXXXXX` |
| `NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN` | Cloudflare Stream video CDN |

---

## Veritabanı Migrasyonları

### Otomatik (CI/CD)

`supabase/migrations/` altına `.sql` dosyası ekleyip `master`'a push ettiğinizde GitHub Actions otomatik olarak uygular.

Gerekli GitHub Secrets:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

### Manuel (Yerel)

```bash
# Supabase Dashboard > Database > Connection string kopyalayın
$env:SUPABASE_DB_URL="postgresql://postgres:PAROLA@db.<ref>.supabase.co:5432/postgres"
powershell -ExecutionPolicy Bypass -File .scripts/migrate.ps1
```

### TypeScript Tip Üretimi

```bash
pnpm supabase:gen   # src/types/database.types.ts günceller
```

---

## Dağıtım (Vercel)

| Ayar | Değer |
|---|---|
| Framework | Next.js |
| Build komutu | `pnpm run build:ci` |
| Çıkış dizini | `.next` |
| Node sürümü | 18+ |
| Paket yöneticisi | pnpm |

Ortam değişkenlerini Vercel Dashboard → Settings → Environment Variables bölümüne ekleyin. Muvcut deploy durumunu görmek için Vercel Dashboard'unuzu kullanabilirsiniz. Vercel otomatik olarak projenizi build edip yayınlayacaktır.

---

## Proje Durumu

- **İlerleme:** %63 (bkz. [`registry/PULSE.md`](registry/PULSE.md))
- **Aktif görevler:** Visual Page Builder (%90), Kategori Editörü (%85)
- **Değişiklik günlüğü:** [`docs/CHANGELOG.md`](docs/CHANGELOG.md)
- **Dağıtım (Vercel):** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Mimari:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Lisans

Özel kullanım. Tüm hakları saklıdır.
