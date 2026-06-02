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

### 🚨 SECURITY DEFINER Fonksiyon Erişim Kontrolü
Postgres'te `public` şemasında oluşturulan tüm fonksiyonlara varsayılan olarak `EXECUTE` yetkisi `PUBLIC` rolüne verilir. Bu, `anon` ve `authenticated` rollerinin SECURITY DEFINER fonksiyonları çağırabilmesi demektir.

**Kural:** Her SECURITY DEFINER fonksiyon oluşturulduktan sonra:
```sql
-- anon ve public erişimini kaldır
REVOKE EXECUTE ON FUNCTION public.my_function() FROM anon, public;
-- Sadece gerekli rollere ver
GRANT EXECUTE ON FUNCTION public.my_function() TO authenticated;
-- Veya sadece service_role'e ver (admin fonksiyonları için)
GRANT EXECUTE ON FUNCTION public.my_function() TO service_role;
```

**MCP ile doğrulama:** `get_advisors({type: 'security'})` çalıştırarak `anon_security_definer_function_executable` uyarısı olmadığını kontrol edin.

## 🔑 Supabase 2026 Data API Güncellemesi: Altın Üçlü (Golden Triad) Kuralı

Supabase'in 2026 yılındaki Data API (PostgREST / GraphQL) güvenlik güncellemesi uyarınca, `public` şemasında oluşturulan yeni tablolar artık otomatik olarak API rollerine (`anon`, `authenticated`, `service_role`) açık değildir.

Bu nedenle, **bir tablo oluşturulurken aşağıdaki üçlü yapı tek bir ünite olarak ele alınmalı ve sırayla uygulanmalıdır**:

1. **Açık İzinler (GRANT):** API rollerinin tabloya erişebilmesi için yetkiler açıkça verilir. `GRANT` eksikse, Postgres sorguyu RLS politikalarına ulaşmadan `42501 Permission Denied` ile reddeder.
2. **RLS Aktifleştirme (ENABLE RLS):** Satır bazlı güvenlik açılır.
3. **RLS Politikaları (CREATE POLICY):** Kimin hangi satırları görebileceği/değiştirebileceği kurallarla sınırlandırılır.

### Şablon:
```sql
-- 1. ADIM: İzinlerin Verilmesi (GRANT)
GRANT SELECT ON public.my_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.my_table TO authenticated;
GRANT ALL ON public.my_table TO service_role;

-- 2. ADIM: RLS'in Açılması
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- 3. ADIM: RLS Politikalarının Yazılması
CREATE POLICY "my_table_select_policy" ON public.my_table
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
```

## 🔑 Webhook Güvenlik Standartları
- Tüm webhook endpoint'leri (`/api/webhook/supabase` ve Edge Functions) `x-webhook-secret` (HMAC-SHA256) başlığıyla korunmalı ve tekrar oynatma saldırılarına karşı `x-timestamp` kontrolünden geçirilmelidir.

## 🔑 Postgres View RLS Güvenliği (Security Invoker)
- Postgres view'larının RLS kurallarını bypass etmesini önlemek amacıyla, oluşturulan tüm veritabanı görünümlerinde `security_invoker = true` ayarının (Postgres 15+ `ALTER VIEW ... SET (security_invoker = on)`) kullanılması zorunludur. `SECURITY DEFINER` view'lar yetki sızıntısı yarattığından yasaktır.

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

### Doğrulama Adımı (Migration Sonrası)
```bash
# MCP ile TAM güvenlik taraması (CLI'dan daha kapsamlı)
get_advisors({type: 'security'})
get_advisors({type: 'performance'})
```
CLI `supabase db advisors` yetersiz kalabilir — pg_graphql exposure ve SECURITY DEFINER function grants gibi kritik uyarıları SADECE MCP gösterir.

## Rol Hiyerarşisi

| Rol | Yetki |
|-----|-------|
| `superadmin` | Her şey + rol ataması |
| `admin` | Operasyon paneli erişimi |
| `moderator` | Sınırlı admin (stok, iadeler) |
| `user` | Sadece kendi hesabı |
| `anon` | Public okuma |

## ⚠️ İleri Düzey Güvenlik Tuzakları

### JWT & Metadata
- **`user_metadata` YASAK** — JWT yetkilendirme kararlarında `raw_user_meta_data` kullanılamaz (kullanıcı tarafından düzenlenebilir). Her zaman `app_metadata` kullan.
- **RBAC için Auth Hook kullan** — Rol bilgisini JWT'ye enjekte etmek için trigger yerine Custom Access Token Auth Hook tercih edin (resmi yol). Bkz: https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac
- **Token ömrü** — Kullanıcı silmek aktif token'ı geçersiz kılmaz → önce `auth.signOut()` çağır

### RLS İleri Kuralları
- **`TO authenticated` tek başına yetmez** — Bu kimlik doğrulamadır (authn), yetkilendirme (authz) değildir. `USING` ile satır sahipliği kontrolü şart
- **UPDATE politikası: USING + WITH CHECK birlikte zorunlu** — `WITH CHECK` olmadan kullanıcı `user_id`'yi başka birine atayabilir

### Migration'da FK İndeks Kontrolü
Her `REFERENCES` (Foreign Key) tanımında karşılık gelen index'in varlığını doğrula.
