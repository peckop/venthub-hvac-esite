# BRIEF: Ürün Veritabanı Şeması Standardı (Cetvel) Oluşturma

> **Bu brief nedir?** Flash model'e verilecek iş talimatı.
> **Çıktı:** `docs/standards/product-schema-standard.md`
> **Kural:** Uydurmak YASAK. Her kural bir dünya referansına veya mevcut proje kararına dayanmalı.

---

## 1. OKUMASI GEREKEN DOSYALAR (sırasıyla)

### 1.1 Format referansları (cetvelin nasıl yazılacağını öğrenmek için)
Bu dosyalar aynı formatta yazılmış mevcut standartlardır. Yeni cetvel de bu yapıyı takip etmeli:

| Dosya | Neden oku |
|---|---|
| `docs/standards/pricing-standard.md` | **Ana format referansı** — dünya kaynakları nasıl cite edilir, aksiyomlar nasıl yazılır, şema önerileri nasıl verilir |
| `docs/standards/admin-standard.md` | Kapı (gate) kuralları formatı, K1-K8 yapısı |
| `docs/standards/category-taxonomy-standard.md` | Kategori yapısı kuralları — ürün cetveli bununla çelişmemeli |
| `docs/standards/catalog-ingestion-standard.md` | CSV→DB hattı — ürün cetveli bununla tutarlı olmalı |
| `docs/standards/i18n-localization-standard.md` | Çeviri aksiyomları — özellikle Aksiyom 5 (JSONB i18n, ilişkisel tablo yasak) |

### 1.2 Tespit raporu (hangi kurallar gerektiğini anlamak için)
| Dosya | Neden oku |
|---|---|
| `docs/audits/product-schema-ground-truth-2026-06-21.md` | **46 kanıtlı bulgu** — her bulgu bir veya daha fazla standart kuralına dönüşmeli |

### 1.3 Mevcut mimari planlar (çözüm önerilerini anlamak için)
| Dosya | Neden oku |
|---|---|
| `docs/plans/hvac_relations_migration_plan.md` | Family-variant ayrımı 4 fazlı plan — cetvel bu planla tutarlı olmalı |

### 1.4 Canlı şema referansı
| Dosya | Neden oku |
|---|---|
| `docs/database_schema_master.md` | 38 tablonun fiziksel yapısı — mevcut durumu anlamak için |

---

## 2. ARAŞTIRILACAK DÜNYA KAYNAKLARI

**Supabase'e özgü değil, e-ticaret veritabanı şema tasarımı dünya standartları araştırılmalı.**
NotebookLM (`context7-live` veya `search_web`) üzerinden şu kaynaklar araştırılmalı:

### 2.1 E-ticaret PIM/Commerce şema referansları
| Kaynak | Ne araştırılacak |
|---|---|
| **Medusa.js** (open-source) | `product`, `product_variant`, `product_category`, `product_collection` tablo yapısı. Multi-currency. |
| **Saleor** (open-source GraphQL) | `Product`, `ProductVariant`, `ProductType`, `Attribute` şeması. Flexible attribute system. |
| **Shopify Admin API** | Product → Variant → Option hiyerarşisi. Metafield yapısı. Multi-location inventory. |
| **SAP Commerce Cloud (Hybris)** | `Product`, `VariantProduct`, `ClassificationAttribute` modeli. Enterprise catalog yapısı. |
| **Odoo** | `product.template` → `product.product` ayrımı. Multi-company (tenant) izolasyonu. |

### 2.2 PostgreSQL / Supabase multi-tenant patterns
| Kaynak | Ne araştırılacak |
|---|---|
| **Supabase official docs** | Row Level Security best practices, `tenant_id` pattern |
| **PostgreSQL JSONB patterns** | GIN index stratejileri, JSONB vs EAV karşılaştırması |
| **Citus Data (multi-tenant)** | Tenant isolation patterns, sharding-aware FK design |

### 2.3 SEO ve URL yapısı
| Kaynak | Ne araştırılacak |
|---|---|
| **Google Search Central** | Canonical URL, `rel=canonical`, varyant sayfaları duplicate content |
| **Schema.org** | `Product`, `ProductGroup`, `offers` structured data |

---

## 3. CETVELİN BÖLÜM YAPISI

```markdown
# VentHub Ürün Veritabanı Şeması Standardı (Cetvel) — v1.0

> SSOT. Ürün ekosisteminin (products, categories, variants, pricing) veritabanı
> şeması kuralları. Çelişirse bu cetvel kazanır.
> Dünya referansları: [kaynak listesi]

---

## 1. İlkeler (Aksiyomlar)
   - Aksiyom 1: ... (her biri bir dünya referansına dayanmalı)
   - ...

## 2. Tablo Yapısı Kuralları
   ### 2.1 Ürün Ailesi (product_families) — Parent
   ### 2.2 Ürün Varyantı (products / product_variants) — Child
   ### 2.3 Kategori Hiyerarşisi (categories)
   ### 2.4 Fiyat Listeleri (product_prices + price_lists)
   ### 2.5 Ürün Görselleri (product_images)
   ### 2.6 Teknik Özellikler (technical_specs JSONB)

## 3. Kolon Zorunlulukları (her tablo için MIN kolon seti)
   - Hangi kolonlar NOT NULL, hangisi DEFAULT, hangisi nullable

## 4. FK ve CASCADE Kuralları
   - Hangi ilişki CASCADE, hangisi RESTRICT, hangisi SET NULL — neden

## 5. Tenant İzolasyonu (SaaS)
   - tenant_id pattern, RLS policy şablonları

## 6. i18n (Çok Dil)
   - JSONB i18n pattern (Aksiyom 5 referansı)

## 7. SEO ve URL Yapısı
   - Canonical URL kuralları, breadcrumb-URL tutarlılığı

## 8. Trigger ve Audit Kuralları
   - updated_at, soft delete, audit trail

## 9. İndeksleme Stratejisi
   - GIN (JSONB), B-tree, trigram — hangi kolon ne index alır

## 10. Güvenlik
   - SECURITY DEFINER kısıtlamaları, RLS policy pattern

## 11. Referanslar
   - Tüm dünya kaynakları linkli listesi
```

---

## 4. KURALLAR (YAPMAMASI GEREKENLER)

| # | Kural |
|---|---|
| **K1** | **Uydurmak YASAK.** Her aksiyom/kural bir dünya referansına (Shopify, Medusa, SAP vb.) veya mevcut proje kararına (`pricing-standard.md` §X gibi) dayanmalı. Kaynak gösterilemeyen kural yazılmaz. |
| **K2** | **Mevcut standartlarla çelişmek YASAK.** Özellikle `i18n-localization-standard.md` Aksiyom 5 (JSONB i18n) ve `pricing-standard.md` (cost-plus motor) ile tutarlı olmalı. |
| **K3** | **Tespit raporunu kopyalama.** Bu bir "ne bulduk" dokümanı değil, "nasıl olmalı" dokümanı. Bulguları kural olarak damıt, PS kodlarını referans olarak ver. |
| **K4** | **Migration SQL yazma.** Cetvel kural koyar, uygulama planı ayrı yazılır. |
| **K5** | **Mevcut çalışan yapıyı gereksiz yere değiştirme önerme.** Örneğin `technical_specs` JSONB zaten çalışıyor — EAV'ye geçiş önerme. |
| **K6** | **`hvac_relations_migration_plan.md` ile çelişme.** Family-variant ayrımı zaten planlanmış — cetvel bunu desteklemeli, alternatif sunmamalı. |

---

## 5. 46 BULGUDAN DAMITILACAK KURAL HARİTASI

| Bulgu Grubu | Damıtılacak Kural |
|---|---|
| PS-001, PS-020 (tenant_id yok) | → §5 Tenant İzolasyonu aksiyomları |
| PS-002, PS-025 (trigger eksik/duplicate) | → §8 Trigger kuralları |
| PS-003, PS-004 (SECURITY DEFINER) | → §10 Güvenlik kuralları |
| PS-005, PS-037 (CASCADE riskleri) | → §4 FK/CASCADE kuralları |
| PS-006 (sahte description) | → §2 Kolon kalite kuralları |
| PS-010, PS-011, PS-015 (fiyat yapısı) | → §2.4 Fiyat tablosu kuralları (pricing-standard referansı) |
| PS-012 (soft delete yok) | → §8 Audit kuralları |
| PS-013 (10 enterprise kolon eksik) | → §3 Kolon zorunlulukları |
| PS-014 (10 destekleyici tablo eksik) | → §2 Tablo yapısı kuralları |
| PS-016 (i18n sıfır) | → §6 i18n kuralları (Aksiyom 5 referansı) |
| PS-022 (ikili görsel sistemi) | → §2.5 Görsel kuralları |
| PS-034 (JSONB key tutarsızlığı) | → §2.6 + §9 JSONB indeksleme |
| PS-036 (level bozuk) | → §2.3 Kategori kuralları |
| PS-038 (2-seviye limit) | → §2.3 + §7 URL kuralları |
| PS-039, PS-043 (URL/SEO) | → §7 SEO kuralları |
| PS-040-042 (pagination/cache) | → §2.1-2.2 Family-variant kuralları |
| PS-044 (edge function hataları) | → §10 Güvenlik (kod katmanı) |
| PS-046 (rol eşleşme hatası) | → §10 Güvenlik (constraint tutarlılığı) |

---

## 6. NLM'NİN ÖNERDİĞİ 4 EK ARAŞTIRMA ALANI

Bu 4 alan standarda dahil edilmeli:

1. **Çok para birimli kur matrisi** — `currency_rates` tablosu şeması, TCMB kur cache
2. **Storage bucket RLS** — ürün görselleri tenant sızıntısı engelleme
3. **JSONB GIN indeksleme** — `technical_specs` sorgu performansı
4. **B2B organizasyon-tier-fiyat ilişkisi** — organizations → tier_level → price_list zinciri

---

## 7. ÇIKTI

- **Dosya:** `docs/standards/product-schema-standard.md`
- **Format:** Diğer cetveller gibi Markdown, Türkçe
- **Uzunluk:** 200-400 satır arası (pricing-standard referans: ~180 satır)
- **Commit mesajı:** `docs(standard): product-schema-standard v1.0 — urun veritabani sema cetveli`
