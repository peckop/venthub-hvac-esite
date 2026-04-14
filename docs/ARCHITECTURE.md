# VentHub — Mimari Dokümantasyonu

> **Son güncelleme:** 2026-04-14  
> **Versiyon:** Next.js 15 / Supabase Edge Functions v2

---

## 1. Genel Mimari

VentHub, **Server-First** bir mimariyle inşa edilmiştir. Temel ilke: veri sunucuda hazırlanır, istemciye HTML olarak gelir; istemci sadece etkileşim için JavaScript çalıştırır.

```
┌──────────────────────────────────────────────────┐
│                CLOUDFLARE CDN                    │
│     (Statik varlıklar, kenar önbellek)           │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│             NEXT.JS 15 (APP ROUTER)              │
│                                                  │
│  Server Components (RSC)                         │
│    ├── Sayfa rotaları (src/app/)                 │
│    ├── Supabase'den SSR veri çekimi              │
│    └── HTML olarak istemciye gönderim            │
│                                                  │
│  Client Components ('use client')               │
│    ├── Etkileşimli filtreler, form'lar           │
│    ├── ScrollObserver (IntersectionObserver)     │
│    └── Sepet, ödeme akışı                       │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│          SUPABASE (BaaS Katmanı)                 │
│                                                  │
│  PostgreSQL (31 tablo, tümü RLS aktif)           │
│  Edge Functions (38 adet, Deno çalışma ortamı)  │
│  Auth (JWT tabanlı, kullanıcı oturumları)        │
│  Storage (ürün görselleri, belgeler)             │
└──────────────────────────────────────────────────┘
```

---

## 2. Veri Akışı

### Server-Side Rendering (SSR) — Tercih Edilen Yol

```
[Kullanıcı isteği]
      │
      ▼
[Next.js page.tsx — Server Component]
      │
      ├──► Supabase query (ürünler, kategoriler)
      │         │
      │         ▼
      │    [type-converters.ts]
      │    DB Row → DomainCategory / Product
      │         │
      │         ▼
      └──► Props olarak View bileşenine geç
                │
                ▼
         [View Component]
         HTML hazır → istemciye gönder
```

### Client-Side (Sadece İnteraktif Durumlar İçin)

```
[Kullanıcı filtre değiştirir]
      │
      ▼
[Client Component — useState/useEffect]
      │
      ├──► URL parametresi güncellenir
      │
      └──► Edge Function çağrısı (advanced-search / search-products)
                │
                ▼
         [Yeni sonuçlar client'ta render]
```

---

## 3. Klasör Yapısı

```
venthub-hvac/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Anasayfa (SSR)
│   │   ├── category/[slug]/    # Kategori sayfaları (SSR)
│   │   ├── products/           # Ürün listesi (force-dynamic)
│   │   ├── admin/              # Yönetici paneli
│   │   ├── account/            # Kullanıcı hesabı
│   │   ├── checkout/           # Ödeme akışı
│   │   └── auth/               # Giriş / Kayıt
│   │
│   ├── views/                  # Sayfa içerikleri (SSR + Client karışımı)
│   │   ├── HomePage.tsx
│   │   ├── CategoryMasterView.tsx   # Slot mimarisi merkezi
│   │   └── ProductsDiscoveryView.tsx
│   │
│   ├── components/
│   │   ├── ui/                 # Primitif bileşenler
│   │   ├── home/               # Anasayfa bölümleri
│   │   ├── products/           # Ürün kartları, showcase
│   │   └── navigation/         # Header, MegaMenu
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Ana Supabase istemcisi + servis fonksiyonları
│   │   ├── type-converters.ts  # DB Row → Domain Model dönüşümleri
│   │   ├── rbac.ts             # Rol tabanlı erişim kontrolü
│   │   ├── audit.ts            # Admin işlem kaydı
│   │   └── services/
│   │       ├── cart.service.ts
│   │       ├── product.service.ts
│   │       ├── category.service.ts
│   │       ├── pricing.service.ts
│   │       ├── address.service.ts
│   │       ├── invoice.service.ts
│   │       └── project.service.ts
│   │
│   ├── hooks/                  # Custom React hook'ları
│   ├── types/
│   │   ├── database.types.ts   # Supabase'den üretilen tipler (Source of Truth)
│   │   └── db-rows.ts          # Tip takma adları (alias)
│   ├── i18n/
│   │   └── dictionaries/tr.ts  # Türkçe sözlük (birincil dil)
│   └── utils/
│       └── routes.ts           # Merkezi rota tanımları
│
├── supabase/
│   ├── functions/              # 38 Edge Function (Deno)
│   └── migrations/             # SQL migration dosyaları
│
├── docs/                       # Proje dokümantasyonu
├── registry/                   # Otonom görev yönetim sistemi (Orion)
└── .agent/                     # AI ajan yapılandırması
```

---

## 4. Veritabanı Şeması

### Temel Tablolar

| Tablo | Satır | Açıklama |
|---|---|---|
| `products` | 335 | HVAC ürünleri — teknik specs (JSONB), stok, fiyat |
| `categories` | 25 | Hiyerarşik kategori ağacı (parent_id + level) |
| `venthub_orders` | 24 | Siparişler — İyzico entegrasyonu, kargo takip |
| `venthub_order_items` | 3 | Sipariş kalemleri + ürün snapshot |
| `venthub_returns` | 6 | İade yönetimi (requested → refunded lifecycle) |
| `user_profiles` | 2 | Kullanıcı profili + rol (super_admin/admin/warehouse/sales/viewer/user) |
| `organizations` | 3 | B2B kurumsal müşteri altyapısı |
| `price_lists` | 3 | Fiyat listeleri (bireysel / kurumsal / bayi) |
| `shopping_carts` | 2 | Aktif sepetler |
| `cart_items` | 1 | Sepet kalemleri |
| `inventory_movements` | 20 | Stok hareketi kaydı (geri alma + batch desteği) |
| `admin_audit_log` | 57 | Admin işlem denetim kaydı |
| `client_errors` | 39 | Tarayıcı hatası izleme |
| `error_groups` | 11 | Hata gruplama (signature bazlı) |
| `wizard_selections` | 3 | Hava perdesi seçim sihirbazı kayıtları |
| `coupons` | 1 | Kupon sistemi |
| `rate_limits` | 5 | API rate limiting |

> **Tümü RLS aktif.** Her tablo okuma/yazma için `auth.uid()` veya rol bazlı policy kullanır.

### İlişki Diyagramı (Temel)

```
auth.users ──── user_profiles ──── organizations
                    │
                    └──── user_addresses
                    └──── user_invoice_profiles

products ──── categories (parent_id → kendisi)
   │──── product_images
   │──── product_prices ──── price_lists
   └──── venthub_order_items ──── venthub_orders ──── payment_transactions
                                       │──── venthub_returns
                                       │──── inventory_movements
                                       └──── order_email_events
```

---

## 5. Edge Functions (38 Aktif)

### Ödeme Döngüsü

| Function | Versiyon | JWT | Açıklama |
|---|---|---|---|
| `iyzico-payment` | v233 | ✅ | 3DSecure ödeme başlatma |
| `iyzico-callback` | v163 | ❌ | İyzico geri dönüş webhook |
| `iyzico-refund` | v10 | ✅ | İade işlemi |
| `admin-iyzico-reconcile` | v18 | ❌ | Ödeme uzlaştırma |

### Sipariş Yönetimi

| Function | Versiyon | JWT | Açıklama |
|---|---|---|---|
| `order-validate` | v110 | ✅ | Sipariş doğrulama, stok rezervasyonu |
| `order-confirmation` | v6 | ❌ | Onay e-postası gönderimi |
| `order-housekeeping` | v10 | ✅ | Süresi dolmuş siparişleri temizle |
| `admin-update-order` | v16 | ❌ | Admin sipariş güncelleme |
| `admin-order-inspect` | v15 | ❌ | Admin sipariş detayı |
| `admin-orders-latest` | v14 | ✅ | Son siparişler listesi |

### Kargo

| Function | Versiyon | JWT | Açıklama |
|---|---|---|---|
| `shipping-webhook` | v105 | ❌ | Kargo sağlayıcı webhook |
| `shipping-status` | v105 | ❌ | Kargo durumu sorgulama |
| `shipping-notification` | v19 | ❌ | Kargo e-postası |
| `admin-update-shipping` | v12 | ✅ | Admin kargo güncelleme |
| `delivery-notification` | v5 | ✅ | Teslimat bildirimi |
| `returns-webhook` | v7 | ❌ | İade kargo webhook |
| `return-status-notification` | v7 | ❌ | İade durum bildirimi |

### Arama & Ürün

| Function | Versiyon | JWT | Açıklama |
|---|---|---|---|
| `search-products` | v27 | ✅ | Temel ürün arama |
| `advanced-search` | v30 | ✅ | Parametre bazlı HVAC araması |
| `dynamic-categories` | v34 | ✅ | Dinamik kategori yükleme |
| `hvac-calculator` | v27 | ✅ | Hava perdesi fizik hesabı |
| `public-api` | v35 | ✅ | Genel ürün API'si |

### Diğer

| Function | Versiyon | JWT | Açıklama |
|---|---|---|---|
| `log-client-error` | v74 | ✅ | Tarayıcı hata kaydı |
| `stock-alert` | v11 | ❌ | Düşük stok uyarısı |
| `apply-coupon` | v6 | ✅ | Kupon uygulama |
| `admin-create-coupon` | v6 | ✅ | Admin kupon oluşturma |
| `release-expired-reservations` | v2 | ❌ | Süresi dolmuş stok rezervasyonlarını serbest bırak |
| `notification-service` | v10 | ✅ | Merkezi bildirim servisi |
| `healthz` | v3 | ✅ | Sağlık kontrolü |

---

## 6. Güvenlik Mimarisi

### RLS (Row Level Security)

Tüm tablolarda aktif. Temel pattern'ler:

```sql
-- Herkese açık veri (ürünler, kategoriler)
CREATE POLICY "select_public" ON products FOR SELECT TO public USING (status = 'active');

-- Sadece kendi verisi
CREATE POLICY "select_own" ON user_addresses FOR SELECT
  USING (user_id = (SELECT auth.uid()));   -- initplan optimizasyonu: SELECT içinde

-- Sadece admin/super_admin yazabilir
CREATE POLICY "admin_write" ON products FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );
```

### Rate Limiting

`rate_limits` tablosu + Edge Function seviyesinde bucket bazlı sınır.

### Webhook Doğrulama

`shipping-webhook` ve `returns-webhook` — HMAC body hash ile tekrar saldırısı koruması (`shipping_webhook_events.body_hash`).

### Idempotency

`shipping_idempotency` tablosu — aynı kargo güncellemesinin iki kez işlenmesini engeller.

---

## 7. Kategori Mimarisi (Slot Sistemi)

Detaylı vizyon: [`architectural_vision_brainstorm.md`](../architectural_vision_brainstorm.md)

### Mevcut Durum

`CategoryMasterView` bir orkestratör görevi görür: `categories.metadata.display_mode` alanına göre hangi View bileşeninin render edileceğine karar verir.

```
displayMode === 'showcase'   → CategoryShowcaseView
displayMode === 'landing'    → CategoryLandingView
displayMode === 'series'     → CategorySeriesView
displayMode === 'grid'       → CategoryGridView
(varsayılan)                 → ProductsDiscoveryView
```

### Slot Kontratı

Her View bileşeni aynı `SlotProps` interface'ini alır:

```typescript
interface SlotProps {
  category: DomainCategory | null
  parentCategory: DomainCategory | null
  subCategories: DomainCategory[]
  products: Product[]
  displayName: string
  marketingTitle: string
}
```

---

## 8. Animasyon Mimarisi

Framer Motion yerine **Vanilla CSS + IntersectionObserver** tercih edilmiştir (Bundle boyutu ve Hydration gecikmesi nedeniyle).

### Nasıl Çalışır

1. Bileşen `data-observe="fade-up"` attribute'u ile işaretlenir
2. `ScrollObserver` (tek merkez) IntersectionObserver ile izler
3. Element görünür olduğunda `data-in-view="true"` attribute'u eklenir
4. Tailwind `data-[in-view=true]:opacity-100` varyantı CSS geçişini tetikler

```tsx
// Bileşen tarafı (değişmez)
<div
  data-observe="fade-up"
  className="opacity-0 translate-y-4 data-[in-view=true]:opacity-100 data-[in-view=true]:translate-y-0 transition-[opacity,transform] duration-700"
>
  ...
</div>
```

---

## 9. i18n Sistemi

Dictionary tabanlı, sunucu taraflı çeviri sistemi.

```typescript
// src/i18n/dictionaries/tr.ts — tek kaynak (primary)
export const tr = {
  home: { hero: { ... }, applicationSolutions: { ... } },
  products: { ... },
  checkout: { ... }
}

// Bileşende kullanım
const t = dictionary.applicationSolutions
<h2>{t.title}</h2>
```

**Kural:** TSX dosyalarına hiçbir zaman hard-coded Türkçe/İngilizce metin eklenmez.

---

## 10. Enterprise Gap (Bilinen Eksikler)

| Alan | Sorun | Öncelik |
|---|---|---|
| B2B Fiyatlandırma | `product_prices` boş. `price_lists` var ama bağlantı kurulmamış | 🔥 Kritik |
| Gelişmiş Arama UI | `advanced-search` edge function hazır (v30) ama frontend yok | 🔥 Kritik |
| Error Boundary | Client hata izleme var (39 kayıt) ama kullanıcıya görünen fallback UI yok | 🔥 High |
| SSR Kategori | Bazı kategori sayfaları hâlâ client-side fetch kullanıyor | ⚡ Medium |
| 3D Deneyim | `three-setup.ts` hazır ama P03 backlog'da başlanmamış | ➖ Low |
