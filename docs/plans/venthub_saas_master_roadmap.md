# VentHub SaaS Dönüşüm — Master Yol Haritası

> **Oluşturma:** 2026-05-30
> **Durum:** Faz 1 başlatılacak, Faz 2-4 planlanmış
> **Model:** Opus 4.6 (Planlama), Teamwork (Uygulama)

---

## 📌 Proje Kimliği

| Alan | Değer |
|---|---|
| **Ne İnşa Ediyoruz** | HVAC sektörüne özel white-label SaaS e-ticaret platformu (Shopify modeli) |
| **Mevcut Durum** | Tek kiracılı (single-tenant) çalışan HVAC e-ticaret sitesi |
| **Hedef Durum** | Çoklu HVAC şirketine satılabilen multi-tenant SaaS platformu |
| **Repo** | `c:\Users\alize\venthub-hvac` |
| **Branch Stratejisi** | `feature/saas-core` (main'den ayrı, hazır olunca merge) |
| **Deployment** | Vercel (frontend) + Supabase (backend) |
| **Domain** | Henüz yok — Vercel üzerinden deploy |

---

## 🧠 Alınan Kararlar (Değişmemeli)

| Karar | Seçilen | Neden |
|---|---|---|
| Veritabanı stratejisi | **Shared DB + RLS** | Tek şema, tek migration, kolay yönetim |
| Tenant resolution | **Subdomain + Custom Domain** | Profesyonel, Vercel destekli |
| Default tenant | **Mevcut VentHub** | Dışarıdan fark edilmez |
| İlk faz | **Faz 1 — Foundation** | Temelsiz bina yapılmaz |
| Özellik yönetimi | **Feature flags** (JSONB) | Plugin mimarisi Faz 4+ |
| Tema yönetimi | **CSS token override** | Tema editörü Faz 3+ |
| Proje klasörü | **Aynı repo** — branch ile izolasyon | Eşitleme sorunu olmasın |
| HVAC motoru | **Dokunulmayacak** | Fizik kanunları tenant-agnostik |
| JSONB çeviri | **Korunacak** — ilişkisel çeviri tablosu YASAK | Aksiyom 5 |
| Middleware DB sorgusu | **YASAK** — Edge Config / Redis / statik map | Performans |

---

## 📊 NotebookLM Dijital İkiz Bulguları (Özet)

> Detaylı rapor: [venthub-saas-transformation-report.md](file:///C:/Users/alize/.gemini/antigravity/brain/139eb015-e6b7-4de3-8dcb-1015f62c280d/venthub-saas-transformation-report.md)

### Mevcut Altyapı İstatistikleri

| Metrik | Değer |
|---|---|
| Toplam tablo | 26 |
| RLS politikası | 108 |
| RPC fonksiyonu | 52 |
| Edge Function | 26 |
| RBAC rolleri | 7 (super_admin → user) |
| Desteklenen diller | 2 (TR, EN) |
| Ödeme geçidi | İyzico (3D Secure) |
| Para birimi | TRY (hardcoded) |

### Hazır Olan (Dokunulmamalı veya Minimal Değişiklik)

- ✅ CSS Custom Properties (HSL) → white-label için mükemmel
- ✅ `no-arbitrary-value` Tailwind kuralı → tema tutarlılığı garanti
- ✅ HVAC hesaplama motoru → tenant-agnostik
- ✅ Strategy Pattern (ödeme) → tenant bazlı geçit seçimine uygun
- ✅ JSONB veri yapısı → tenant override'lara uygun
- ✅ Edge Functions (26 adet) → tenant context eklenebilir
- ✅ RBAC rol sistemi (7 rol) → genişletilebilir
- ✅ Middleware altyapısı → subdomain resolution eklenebilir

### Güncellenmesi Gereken

- ⚠️ 26 tabloya `tenant_id` kolonu eklenmeli
- ⚠️ 108 RLS politikası tenant-aware yapılmalı
- ⚠️ JWT'ye `tenant_id` custom claim eklenmeli
- ⚠️ Cache key'lere `tenantId` dahil edilmeli
- ⚠️ `formatCurrency` → tenant bazlı para birimi
- ⚠️ Edge Functions'a tenant context eklenmeli

### Sıfırdan Oluşturulması Gereken

- 🆕 `tenants` tablosu
- 🆕 Tenant onboarding
- 🆕 Tenant admin paneli
- 🆕 Billing/Subscription
- 🆕 Feature flags sistemi
- 🆕 Super admin (tüm tenant'ları yöneten) panel

---

## 🗺️ Faz Haritası

### Faz 1: Foundation ← ŞİMDİ YAPILACAK

**Amaç:** Mevcut VentHub aynı çalışır ama artık "default tenant" olarak çalışır. Yeni tenant eklenebilir hale gelir.

**Kapsam:**
1. `tenants` tablosu oluştur (slug, custom_domain, theme, features, config)
2. Tüm tablolara `tenant_id UUID` kolonu ekle (migration)
3. JWT'ye `tenant_id` custom claim ekle
4. `jwt_tenant_id()` RPC fonksiyonu oluştur
5. 108 RLS politikasını güncelle → `tenant_id = jwt_tenant_id()`
6. `middleware.ts` → subdomain + custom domain → tenant resolution
7. Cache key izolasyonu → `['key', lang, tenantId]` formatı
8. Feature flags sistemi → `useTenant()` hook + `features` JSONB
9. Vercel custom domain mapping yapılandırması

**Çıktı:** İkinci bir tenant (örn. Avensair) eklenip test edilebilir.

**Teamwork prompt:** Ayrı dosyada → `prompt_draft.md`

---

### Faz 2: White-Label ← FAZ 1'DEN SONRA

**Amaç:** Her tenant kendi markasıyla görünsün. `www.avensair.com` açıldığında VentHub'ın V harfi bile görünmesin.

**Kapsam:**
1. Tenant tema tablosu detaylandırılması (CSS variable override'ları)
2. `app/[tenantId]/layout.tsx` → dinamik CSS enjeksiyonu
3. Tenant logo/marka görselleri → Supabase Storage tenant bucket'ları
4. Tenant bazlı varsayılan dil + para birimi desteği
5. SEO: tenant subdomain/custom domain hreflang yönetimi
6. Tenant bazlı e-posta şablonları (Resend → tenant branding)
7. Tenant bazlı WhatsApp numarası

**Çıktı:** `www.avensair.com` Avensair renkleri/logosu ile açılır.

---

### Faz 3: Tenant Admin + Billing ← FAZ 2'DEN SONRA

**Amaç:** Tenant kendi işini yönetsin. Sen her şeyi elle yapma.

**Kapsam:**
1. Tenant admin paneli (ürün ekleme, sipariş görme, müşteri yönetimi)
2. Tenant-scope RBAC → `tenant_admin` vs `global_admin` ayrımı
3. Tema editörü (müşteri kendi renklerini/logosunu seçsin)
4. Edge Functions tenant context otomasyonu
5. Tenant bazlı ödeme geçidi yapılandırması (İyzico API key per tenant)
6. Tenant onboarding sihirbazı (kayıt → ilk kurulum → mağaza açılışı)
7. Billing/Subscription sistemi (plan seçimi, fatura, ödeme takibi)
8. Super admin paneli (tüm tenant'ları tek yerden yönet)
9. Çoklu para birimi desteği (`formatCurrency` tenant-aware)

**Çıktı:** Yeni bir HVAC şirketi kendisi kayıt olup mağaza açabilir.

---

### Faz 4: Marketplace + Plugin Mimarisi ← OPSİYONEL / UZUN VADE

**Amaç:** Birden fazla satıcı aynı platformda ürün satabilsin. Üçüncü parti geliştiriciler modül yazabilsin.

**Kapsam:**
1. `vendor_id` → `products` tablosuna FK
2. Sipariş routing (hangi sipariş hangi satıcıya)
3. Komisyon sistemi (platform kesintisi)
4. Payment split (Stripe Connect veya İyzico alt-bayi)
5. Vendor dashboard (satıcı kendi siparişlerini/ürünlerini görsün)
6. Müşteri-satıcı mesajlaşma (Supabase Realtime)
7. Plugin mimarisi (3. parti modüller, eklenti mağazası)
8. Plugin API (geliştiriciler için dökümantasyon)

**Çıktı:** Tam marketplace + eklenti ekosistemi.

---

## ⚠️ Kritik Riskler (Tüm Fazlar İçin)

| Risk | Etki | Önlem |
|---|---|---|
| **Data Bleeding** | Tenant A verileri Tenant B'ye görünür | Cache key'lere `tenantId` ekle, RLS zorunlu |
| **Middleware'de DB sorgusu** | Her istek yavaşlar | Edge Config / Redis / statik map kullan |
| **108 RLS kırılması** | Tüm güvenlik çöker | Atomik migration, test zorunlu |
| **HVAC motoruna dokunma** | Hesaplamalar bozulur | Kural 6: Saf Metrik Motor — DOKUNMA |
| **JSONB → ilişkisel çeviri** | Mimari ihlal | Aksiyom 5: YASAK |
| **Branch merge çatışması** | main ile saas-core çatışır | Düzenli rebase, küçük commit'ler |

---

## 📎 İlgili Dosyalar

| Dosya | İçerik |
|---|---|
| [venthub-saas-analysis.md](file:///C:/Users/alize/.gemini/antigravity/brain/9d338fc9-8af7-4957-909e-f692df35c1a1/venthub-saas-analysis.md) | Opus değerlendirmesi |
| [venthub-saas-transformation-report.md](file:///C:/Users/alize/.gemini/antigravity/brain/139eb015-e6b7-4de3-8dcb-1015f62c280d/venthub-saas-transformation-report.md) | NotebookLM 10 sorgu tam raporu |
| [prompt_draft.md](file:///C:/Users/alize/.gemini/antigravity/brain/9d338fc9-8af7-4957-909e-f692df35c1a1/prompt_draft.md) | Teamwork'e verilecek Faz 1 prompt'u |

---

## 📋 Olgunluk Tablosu

| Özellik | Shopify | VentHub Şu An | Faz 1 Sonrası | Faz 2 | Faz 3 | Faz 4 |
|---|---|---|---|---|---|---|
| Multi-tenant | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Subdomain | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Custom domain | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Feature flags | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| White-label tema | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Tema editörü | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Tenant admin paneli | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Billing/Subscription | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Marketplace | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Plugin mağazası | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
