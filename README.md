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

## Değişiklik Özeti (Son Çalışmalar)
Bkz. ayrıntılı günlük: `docs/CHANGELOG.md`.

Tarih: 2025-09-19

- Admin Dashboard ve Orders
  - KPI kartları tıklanabilir hale getirildi (Bekleyen İade, Bekleyen Kargo)
  - `admin-orders-latest` fonksiyonu `preset=pendingShipments` desteği ile sunucu tarafı filtre uyguluyor (status ∈ confirmed/processing ve shipped_at IS NULL)
- Envanter: Geri Al (Undo) ve Toplu Geri Al (Batch Undo)
  - Ürün sağ panelinde mini hareket geçmişi (son 5) ve tek hareket için 10 dk içinde geri al
  - `inventory_movements.batch_id` ile CSV import’larına toplu geri al desteği; `reverse_inventory_batch(uuid, int)` RPC eklendi
  - UI: Movements ve Audit Log sayfalarında `?batch=<uuid>` filtresi ve hızlı bağlantılar
- Güvenlik ve Veritabanı
  - Fonksiyonlarda `search_path=pg_catalog, public` sabitlendi (mutable search_path uyarıları giderildi)
  - `reserved_orders`, `inventory_summary`, `admin_users` gibi view’lar `security_invoker=on`; `admin_users` erişimleri (anon/auth) kaldırıldı
  - RLS konsolidasyonu: cart_items, shopping_carts, products, user_profiles, venthub_returns tablolarında aynı rol/aksiyon için tekleştirilmiş politikalar
  - Performans: kritik FK indeksleri eklendi; mükerrer indeksler temizlendi; danışman uyarıları doğrulandı
  - İndeks kullanım ölçümü: pg_stat_user_indexes ile mini yük testinde tüm kritik indeksler için `idx_scan>0` doğrulandı

- i18n & SEO: TR/EN iki dilli yapı son hâline getirildi. Para/tarih saat formatları helper’lar ile (src/i18n/format.ts, src/i18n/datetime.ts), Seo.tsx hreflang (tr-TR, en-US, x-default) ve OG locale dinamik. Dokümantasyon güncellendi (docs/SEO_I18N.md).

Detaylar için `docs/CHANGELOG.md` ve `docs/SECURITY_AND_PERF_CHECKLIST.md` dosyalarına bakın.

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
