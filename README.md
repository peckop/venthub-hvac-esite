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

Tarih: 2025-09-07

- **Ana Sayfa Konsolidasyonu**
  - VisualShowcase ve SpotlightList kaldırıldı; ProductFlow tek vitrin (full‑bleed) olarak kaldı.
  - BrandFlow eklendi (iki şeritli marka akışı); Featured/New Products kaldırıldı.
  - TrustSection, ResourcesSection, FAQShortSection konumları kurumsal plana göre netleşti; spacing normalize edildi.
- **Knowledge Hub & Hesaplayıcılar v1**
  - /destek/merkez hub: arama + etiket filtresi; TopicPage i18n.
  - Hesaplayıcı iskeletleri: HRV, Hava Perdesi, Jet Fan, Kanal (rotalar aktif).
- **Deploy**
  - GitHub → Cloudflare Pages otomatik yayın (PR preview’lar açık). Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
- **Bilinen konu**
  - Ana sayfada bazı menü linklerinde ilk tık gecikmesi/bloklanması (overlay/pointer‑events şüphesi). İlgisiz header/mega‑menu değişiklikleri geri alındı.

Önceki çalışmalar (2025-09-02):

- **WhatsApp & SMS Bildirim Sistemi**
  - Twilio entegrasyonu ile WhatsApp Business API ve SMS desteği
  - Otomatik stok uyarı sistemi: eşik değerinin altına düştüğünde bildirim
  - Edge Functions: `notification-service` ve `stock-alert` tamamen hazır
  - Template sistemi ve idempotency koruması mevcut
  - Kurulum rehberi: `docs/WHATSAPP_SETUP_GUIDE.md`
- **Stok Yönetimi**
  - Otomatik stok düşümü: ödeme sonrası idempotent stok güncelleme
  - Ürün bazında düşük stok eşikleri (`low_stock_threshold`)
  - Müşteri UI: "Stokta/Stokta yok" rozeti ve "Stok sor" butonu
  - Admin operasyon sayfası: stok düzenleme ve raporlama
- **Güvenlik / Log Hijyeni**
  - App: `console.log` kaldırıldı/koşullandı; dev-only `debug(...)` (VITE_DEBUG)
  - Edge Function: loglar `IYZICO_DEBUG` ile koşullu; PII maskeleme
  - Kullanılmayan modüller temizlendi
- **CI/CD & Build**
  - Lint politikası: `no-console` etkin, `--max-warnings=0` ile geçiyor
  - Bundle optimizasyonu: %87 küçültme (1,118kB → 145kB)

Önceki çalışmalar için `docs/CHANGELOG.md` dosyasına bakın (2025-08-29 ve öncesi).

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
