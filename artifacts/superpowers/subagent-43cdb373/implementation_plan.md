# Implementation Plan: Supabase vs Redis for VentHub Cart Data

### Goal
VentHub sepet verisi yönetimi için en uygun ve sürdürülebilir altyapıyı (Supabase/PostgreSQL) seçmek ve uygulama stratejisini belirlemek.

### Assumptions
- Kullanıcılar hem anonim (guest) hem de kayıtlı (authenticated) olarak sepet oluşturabilir.
- HVAC ürünleri yüksek teknik detay içerir; sepetin kalıcılığı (persistence) dönüşüm oranı için kritiktir.
- Mevcut veritabanında `shopping_carts` ve `cart_items` tabloları mevcuttur.

### Plan

1. **Adım 0: Mevcut Şemanın Doğrulanması**
   - **Files:** Database Schema
   - **Change:** `mcp_supabase_list_tables` ve `mcp_supabase_execute_sql` kullanarak `shopping_carts` ve `cart_items` tablolarının `session_id` ve `user_id` sütunlarını kontrol et.
   - **Verify:** Tablo yapısının anonim-kayıtlı geçişini desteklediğini onayla.

2. **Adım 1: RLS ve Güvenlik Sıkılaştırma**
   - **Files:** Supabase Migration
   - **Change:** Sepet sahipliğini `auth.uid()` ile mühürle. Anonim kullanıcılar için `session_id` bazlı geçici yetki tanımla.
   - **Verify:** Başka bir kullanıcının sepetine erişimin RLS tarafından engellendiğini test et.

3. **Adım 2: Performans İyileştirme (Indexing)**
   - **Files:** Supabase Migration
   - **Change:** `cart_items` tablosunda `user_id` ve `session_id` alanlarına B-tree index ekle.
   - **Verify:** `EXPLAIN ANALYZE` ile sorgu maliyetlerinin düştüğünü gör.

4. **Adım 3: Frontend "Optimistic UI" Entegrasyonu**
   - **Files:** `src/store/cartStore.ts` (veya ilgili componentler)
   - **Change:** Veritabanı yanıtını beklemeden sepeti arayüzde güncelle (React state). Arka planda Supabase ile senkronize et.
   - **Verify:** Network hızını düşürerek (throttling) kullanıcının gecikme hissetmediğini kontrol et.

### Risks & Mitigations
- **Hız:** Postgres, Redis kadar hızlı değildir. **Azaltma:** Optimistic Updates ve Debounce kullanarak kullanıcı tarafında "anında tepki" hissi yaratılacaktır.
- **Yük:** Yoğun trafikte DB sessionları şişebilir. **Azaltma:** Indexleme ve Supabase Edge Functions kullanımıyla yük dengelenecektir.

### Rollback Plan
- Kritik bir hata durumunda mevcut migrationları geri al ve `src/types/db-rows.ts` dosyasını önceki haline döndür.
