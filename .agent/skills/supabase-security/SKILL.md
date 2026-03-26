---
name: supabase-security
description: Defines RLS policies, migration patterns, and security best practices for VentHub Supabase. Use when writing SQL, creating policies, or modifying database schema.
---

## 🛫 Prerequisites (Ön Koşul Kontrolü)

Bu skill'i kullanmadan önce aşağıdaki kontrolleri sırayla yap. Herhangi biri başarısızsa, **DURMA** ve kullanıcıya bildir.

1. **Supabase Proje Bağlantısı:**
   - `GEMINI.md` veya `.env.local` dosyasında `NEXT_PUBLIC_SUPABASE_URL` tanımlı mı kontrol et.
   - Boş veya placeholder ise → ❌ DURMA. Kullanıcıdan gerçek proje URL'sini iste.

2. **Migration Dizini:**
   - `supabase/migrations/` klasörünün var olduğunu doğrula.
   - Yoksa → ❌ DURMA. Önce `supabase init` gerekebilir.

3. **Yıkıcı SQL Kontrolü:**
   - Yazacağın SQL içinde `DROP TABLE`, `DROP COLUMN`, `TRUNCATE` varsa → ❌ DURMA.
   - Kullanıcıdan açık onay (`/override`) almadan bu komutları çalıştırma.

# Supabase Security Skill

Bu skill, VentHub'ın Supabase güvenlik standartlarını ve migration yazım kurallarını tanımlar.
Agent olarak veritabanı işlemi yaparken bu kurallara uymalıyım.

## RLS (Row Level Security) Prensipleri

### Temel Kurallar
1. **Tüm tablolarda RLS AÇIK olmalı** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
2. **Public tablolar için SELECT policy var** (ürünler, kategoriler)
3. **Yazma işlemleri (INSERT/UPDATE/DELETE) admin/service_role gerektirir**
4. **Kullanıcı verisi sadece kendi sahibine görünür** (`auth.uid() = user_id`)

### Policy Yazım Şablonu
```sql
-- SELECT: Public okuma (ürünler gibi)
CREATE POLICY "products_select_public"
ON products FOR SELECT
TO public
USING (status = 'active');

-- SELECT: Sadece kendi verisi (siparişler gibi)
CREATE POLICY "orders_select_own"
ON venthub_orders FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- INSERT/UPDATE/DELETE: Admin only
CREATE POLICY "products_admin_modify"
ON products FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('admin', 'superadmin')
  )
);
```

### ⚠️ Kritik Uyarılar
- `auth.uid()` çağrısını `(SELECT auth.uid())` ile sar (initplan optimizasyonu)
- Aynı tablo/rol/aksiyon için birden fazla PERMISSIVE policy yazma (birleştir)
- `SECURITY DEFINER` fonksiyonlarda `search_path = pg_catalog, public` sabitle

## Migration Yazım Standartları

### Dosya Adlandırma
```
YYYYMMDD_kisa_aciklama.sql
Örnek: 20260123_add_inventory_batch_undo.sql
```

### İdempotent Yazım (Tekrar Çalıştırılabilir)
```sql
-- Tablo oluşturma
CREATE TABLE IF NOT EXISTS my_table (...);

-- Kolon ekleme
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'new_column'
  ) THEN
    ALTER TABLE products ADD COLUMN new_column TEXT;
  END IF;
END $$;

-- Index oluşturma
CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

-- Policy oluşturma (önce drop)
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...;
```

## Rol Hiyerarşisi

| Rol | Yetki |
|-----|-------|
| `superadmin` | Her şey + rol ataması |
| `admin` | Operasyon paneli erişimi |
| `moderator` | Sınırlı admin (stok, iadeler) |
| `user` | Sadece kendi hesabı |
| `anon` | Public okuma |

## Karar Ağacı: Policy Nasıl Yazılır?

1. **Tablo public mi?** (products, categories)
   - Evet → `SELECT TO public USING (is_active = true)`
2. **Kullanıcıya özel mi?** (orders, cart)
   - Evet → `USING (user_id = (SELECT auth.uid()))`
3. **Admin işlemi mi?** (stok güncelleme, ürün silme)
   - Evet → Role check with `user_profiles.role`
4. **Hassas veri mi?** (fiyat, maliyet)
   - Evet → RPC ile sar, direkt erişim verme

## Mevcut RLS Dosyaları (Referans)
- `20260101_rls_consolidation.sql` — Ana konsolidasyon
- `20251212_fix_rls_performance.sql` — Performans düzeltmeleri
- `docs/SECURITY_AND_PERF_CHECKLIST.md` — Detaylı kontrol listesi
