# VentHub HVAC — Project Context

> Bu belge, VentHub HVAC projesine ilk kez dahil olan bir geliştiricinin veya AI ajanının projeyi uçtan uca anlaması için hazırlanmış tek kapsamlı referans noktasıdır.

---

## 1. Proje Kimliği

| Alan | Değer |
|------|-------|
| **Proje Adı** | VentHub HVAC |
| **Domain** | İklimlendirme & Havalandırma (HVAC) E-Ticaret |
| **İş Modeli** | B2B/B2C karma satış platformu |
| **Hedef Kitle** | Makine mühendisleri, mimarlar, müteahhitler, tesisat firmaları, son kullanıcılar |
| **Diller** | Türkçe (birincil), İngilizce |
| **Canlı Ortam** | Vercel (frontend), Supabase (backend + DB) |

---

## 2. Vizyon ve Fark

VentHub, sıradan bir e-ticaret sitesi değildir. HVAC sektörüne özel **"Mühendislik & Satış Platformu"** olarak kurgulanmıştır:

- **3D Ürün Görselleştirme:** React Three Fiber ile GLB/GLTF modeller (Jet Fan, HRV, Kanal Tipi Fan, Susturucu)
- **Mühendislik Hesaplayıcıları:** ASHRAE/EN standartlarında hava perdesi, kanal basıncı, HRV ve jet fan hesaplama
- **İhtiyaç Sihirbazı (Needs Wizard):** Kapı ölçüsü, rüzgar, trafik yoğunluğu girerek uygun ürün eşleştirme
- **Bilgi Merkezi (Knowledge Hub):** HVAC konularında teknik makaleler ve rehberler
- **Premium Admin Paneli:** ERP benzeri sipariş/stok/iade/kargo/denetim yönetimi

---

## 3. Teknoloji Yığını

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 15 | App Router, SSR/SSG |
| React | 19 | UI bileşenler |
| TypeScript | 5.x | Tip güvenliği |
| Tailwind CSS | 4.x | Styling |
| React Three Fiber | - | 3D görselleştirme |
| Framer Motion | - | Animasyonlar |
| Sonner | - | Toast bildirimleri |

### Backend
| Teknoloji | Kullanım |
|-----------|----------|
| Supabase Edge Functions | Deno/TypeScript mikroservisler |
| Supabase Auth | Kimlik doğrulama (email + OAuth) |
| Supabase Realtime | WebSocket ile anlık bildirimler |
| Supabase Storage | Dosya/görsel depolama |

### Veritabanı
| Özellik | Detay |
|---------|-------|
| Motor | PostgreSQL (Supabase hosted) |
| Tablolar | 26 |
| RLS Politikaları | 108 |
| RPC Fonksiyonları | 51 |
| İndeksler | 26 |

### Dış Entegrasyonlar
| Servis | Kullanım |
|--------|----------|
| İyzico | Ödeme altyapısı (3D Secure) |
| Resend | Transactional e-posta (sipariş onay, kargo, teslimat) |
| Twilio | WhatsApp/SMS bildirimleri (stok uyarıları) |
| Sentry | Hata izleme ve raporlama |
| Vercel | CI/CD ve hosting |

---

## 4. Proje Yapısı

```
venthub-hvac/
├── src/
│   ├── app/                    # Next.js App Router sayfaları
│   │   ├── admin/              # Admin panel rotaları
│   │   ├── account/            # Kullanıcı hesap rotaları
│   │   ├── calculators/        # Mühendislik hesaplayıcı rotaları
│   │   └── ...                 # Diğer public rotalar
│   ├── components/             # Yeniden kullanılabilir UI bileşenleri
│   │   ├── admin/              # Admin panel bileşenleri
│   │   ├── category/           # Kategori ve ürün listeleme
│   │   ├── checkout/           # Ödeme akışı bileşenleri
│   │   ├── products/           # Ürün detay + 3D modeller
│   │   │   └── 3d/             # Three.js 3D model bileşenleri
│   │   ├── layout/             # Header, Footer, Navigation
│   │   └── ui/                 # Primitif UI bileşenleri (Button, Card, Modal...)
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Çoklu dil desteği (TR/EN sözlükler)
│   ├── lib/                    # İş mantığı servisleri
│   │   └── services/           # API servis katmanı (cart, product, address...)
│   ├── types/                  # TypeScript tip tanımları
│   ├── utils/                  # Yardımcı fonksiyonlar
│   └── views/                  # Sayfa bileşenleri (page views)
│       ├── admin/              # Admin sayfa görünümleri
│       ├── account/            # Hesap sayfa görünümleri
│       ├── calculators/        # Hesaplayıcı sayfa görünümleri
│       ├── category/           # Kategori görünüm modları
│       ├── checkout/           # Checkout adımları
│       ├── knowledge/          # Bilgi merkezi sayfaları
│       ├── legal/              # Hukuki sayfalar (KVKK, gizlilik...)
│       └── support/            # Destek sayfaları (SSS, iade, kargo...)
├── supabase/
│   ├── functions/              # Edge Functions (28 fonksiyon)
│   │   ├── _shared/            # Paylaşılan modüller (notify, sentry, rate_limit)
│   │   ├── iyzico-payment/     # Ödeme başlatma
│   │   ├── iyzico-callback/    # Ödeme callback
│   │   ├── iyzico-refund/      # İade/iade
│   │   ├── shipping-webhook/   # Kargo durumu webhook
│   │   ├── returns-webhook/    # İade kargo webhook
│   │   ├── order-confirmation/ # Sipariş onay e-postası
│   │   ├── delivery-notification/ # Teslimat bildirimi
│   │   └── ...                 # Diğer fonksiyonlar
│   └── migrations/             # PostgreSQL migration dosyaları
├── docs/                       # Üretilmiş dokümantasyon
│   ├── venthub_hvac_master.md  # Frontend master MD (432 dosya)
│   ├── supabase_functions_master.md # Backend master MD (28 dosya)
│   └── database_schema_master.md   # DB şema master MD
├── .agent/                     # AI ajan konfigürasyonu
│   ├── skills/                 # AI yetenekleri (SKILL.md)
│   ├── workflows/              # AI iş akışları
│   └── rules/                  # AI kuralları
└── .cc_docs.yaml               # Corpus Callosum doc pipeline config
```

---

## 5. Veritabanı Ana Tabloları

| Tablo | Amaç |
|-------|------|
| `venthub_orders` | Siparişler (durum, tutar, müşteri, kargo) |
| `venthub_returns` | İade talepleri ve süreç yönetimi |
| `products` | Ürün kataloğu (SKU, fiyat, stok, teknik özellikler) |
| `cart_items` | Sepet verileri |
| `user_profiles` | Kullanıcı profilleri (rol, isim, telefon) |
| `inventory_movements` | Stok giriş/çıkış hareketleri |
| `price_lists` | B2B fiyat listeleri |
| `wizard_selections` | İhtiyaç sihirbazı kullanıcı seçimleri |
| `admin_audit_log` | Admin işlem denetim kaydı |
| `shipping_webhook_events` | Kargo webhook audit log |
| `returns_webhook_events` | İade webhook audit log |
| `order_email_events` | E-posta gönderim audit log |
| `categories` | Ürün kategorileri (hiyerarşik) |
| `addresses` | Kullanıcı adresleri |
| `invoice_profiles` | Fatura profilleri (bireysel/kurumsal) |
| `coupons` | İndirim kuponları |

---

## 6. Kritik İş Akışları

### 6.1 Ödeme Akışı (Checkout → İyzico → Sipariş)
```
Kullanıcı → CheckoutPage → buildPaymentRequest() → iyzico-payment Edge Function
  → İyzico 3D Secure → iyzico-callback Edge Function
  → venthub_orders.status = 'paid'
  → process_order_stock_reduction (PostgreSQL RPC)
  → order-confirmation e-posta (Resend)
```

### 6.2 Kargo Webhook Akışı
```
Kargo Firması → shipping-webhook Edge Function
  → HMAC doğrulama + replay guard
  → normalizePayload() (çoklu kargo formatı)
  → Monoton durum kontrolü: pending → paid → shipped → delivered
  → venthub_orders güncelleme
  → delivered ise → delivery-notification e-posta
```

### 6.3 İade Akışı
```
Müşteri/Admin → iade talebi → venthub_returns.status = 'requested'
Kargo → returns-webhook → HMAC doğrulama
  → Monoton: requested → approved → in_transit → received → refunded
  → received ise → return-status-notification e-posta
  → Stok geri yükleme (orderStatusService)
```

### 6.4 Stok Yönetimi
```
Sipariş onayı → process_order_stock_reduction (atomik RPC)
İade teslim → stok geri yükleme (orderStatusService)
Manuel ayar → inventory_movements + admin_audit_log
Düşük stok → stock-alert → WhatsApp/SMS bildirim (Twilio)
```

---

## 7. Rol Bazlı Erişim (RBAC)

| Rol | Yetki |
|-----|-------|
| `customer` | Ürün görüntüleme, sepet, sipariş, hesap yönetimi |
| `admin` | Sipariş yönetimi, stok, kargo, iade işlemleri |
| `superadmin` | Tüm admin + kullanıcı yönetimi, ayarlar, kupon, audit log |

RBAC `user_profiles.role` alanı + `useRole()` hook + Edge Function auth middleware ile uygulanır. 108 RLS politikası veritabanı seviyesinde güvenliği sağlar.

---

## 8. i18n (Çoklu Dil)

- **Sözlükler:** `src/i18n/dictionaries/tr.ts`, `src/i18n/dictionaries/en.ts`
- **Context:** `I18nProvider` + `useI18n()` hook
- **Tarih/Saat:** `src/i18n/datetime.ts` (locale-aware format)
- **Sayı/Para:** `src/i18n/format.ts` (TRY/USD formatlama)

---

## 9. Admin Paneli Özellikleri

| Sayfa | Özellik |
|-------|---------|
| Dashboard | KPI kartları, satış grafiği, düşük stok alarmı |
| Siparişler | Kanban board (sürükle-bırak), tablo görünümü |
| Envanter | Stok yönetimi, CSV import, QR etiket yazdırma |
| Kargo/Lojistik | Kargo takip, webhook event log |
| İadeler | İade süreç yönetimi, durum takibi |
| Ürünler | Ürün CRUD, kategori yönetimi |
| Kuponlar | İndirim kuponu oluşturma/yönetimi |
| Kullanıcılar | Rol atama, kullanıcı yönetimi |
| Ayarlar | Sistem konfigürasyonu |
| Audit Log | Tüm admin işlem geçmişi |
| Hatalar | Client-side hata izleme (Sentry entegre) |
| Realtime | WebSocket ile anlık sipariş/stok bildirimleri |

---

## 10. Mühendislik Hesaplayıcıları

| Hesaplayıcı | Standart | Modül |
|-------------|----------|-------|
| Hava Perdesi | EN/ASHRAE | `hvacCalculations.ts::calculateAirCurtain` |
| Kanal Basıncı | ASHRAE | `hvacCalculations.ts::calculateDuct` |
| HRV (Isı Geri Kazanım) | EN 308 | `hvacCalculations.ts::calculateHRV` |
| Jet Fan | EN 12101 | `hvacCalculations.ts::calculateJetFan` |

---

## 11. 3D Ürün Modelleri

React Three Fiber ile geliştirilen interaktif 3D modeller:
- **JetFanModel** — Jet fan ekipmanı
- **HRVModel** — Isı geri kazanım cihazı
- **SilentChannelFanModel** — Sessiz kanal tipi fan
- **Silencer** — Susturucu parçası

Performans stratejisi: **Click-to-Load** (lazy loading ile ilk yükleme maliyeti sıfır).

---

## 12. Ortam Değişkenleri (Env)

### Zorunlu
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase proje URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (Edge Functions)

### Ödeme
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` — İyzico API kimlik bilgileri

### Bildirimler
- `RESEND_API_KEY` — E-posta servisi
- `EMAIL_FROM` — Gönderici adresi
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — SMS/WhatsApp
- `TWILIO_WHATSAPP_NUMBER` / `TWILIO_PHONE_NUMBER`

### Kargo
- `SHIPPING_WEBHOOK_SECRET` — HMAC-SHA256 imza doğrulama
- `RETURNS_WEBHOOK_SECRET` — İade webhook imza doğrulama

### Opsiyonel
- `EMAIL_TEST_MODE` / `EMAIL_TEST_TO` — Test modu
- `BRAND_NAME` / `BRAND_PRIMARY_COLOR` / `BRAND_LOGO_URL` — Marka
- `ALLOWED_ORIGINS` — CORS whitelist
- `SENTRY_DSN` — Hata izleme

---

## 13. Dokümantasyon Altyapısı

Proje, **Corpus Callosum (cc)** pipeline ile otonom dokümantasyon üretir:

| Komut | İşlev |
|-------|-------|
| `cc doc all` | Frontend kaynak → MD üretimi |
| `cc doc batch --batch-dir supabase/functions` | Edge Function → MD üretimi |
| `cc doc schema` | DB şema → MD üretimi |
| `cc doc tree --nlm-sync --force-sync` | Master birleştirme + NLM upload |

**NotebookLM Digital Twin:** Tüm master MD'ler NLM'e yüklenerek proje hafızası oluşturulur. Notebook ID: `2aa4fc16-acf6-47c6-90a8-c02fe5bb28f8`

---

## 14. Geliştirme Kuralları

1. **No-Plan-No-Code:** Değişiklik yapmadan önce plan oluştur ve onay al
2. **Tip Güvenliği:** `any` kullanımı yasak, strict TypeScript
3. **RLS-First:** Her tablo mutlaka RLS politikası ile korunmalı
4. **Monoton Durum:** Sipariş/iade durumları sadece ileri gidebilir, geri dönüş engellenir
5. **Audit Trail:** Admin işlemleri `admin_audit_log` tablosuna kaydedilir
6. **HMAC Doğrulama:** Webhook endpoint'leri HMAC-SHA256 ile korunur
7. **i18n-Ready:** Tüm kullanıcıya görünen metinler sözlük dosyalarından gelir
8. **Webhook Replay Guard:** Tüm webhook'lar (iade/kargo) HMAC doğrulamasına ek olarak zaman damgası (`x-timestamp`) veya idempotency koruması içermelidir (Tekrar oynatma saldırılarına karşı)
9. **MVVM & Gateway Prensibi:** UI bileşenleri ham veri çekme (fetch/supabase) mantığından izole edilmeli; veri akışları Gateway hook'larına soyutlanmalıdır

---

*Son güncelleme: 2026-05-25*

