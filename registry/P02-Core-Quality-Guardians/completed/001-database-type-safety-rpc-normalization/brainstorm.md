# Brainstorm: 001 - Database Type Safety & RPC Normalization

## 🔍 MEVCUT SORUNLAR (AUDIT ANALİZİ)
1. **`src/lib/supabase.ts` (MAJOR):**
   - Neredeyse tüm `RPC` çağrıları `(supabase.rpc as any)` şeklinde dökülmüş.
   - `get_products_enriched`, `get_search_suggestions`, `fts_search_products` gibi fonksiyonlar dönen veri tipi belirsiz.
   - `supabase.from('...')` çağrılarında Generic tip eksikliği (`createClient<Database>`).
2. **Genel `any` Kullanımı:**
   - `items={items as any}` (CheckoutPage) gibi UI katmanına kadar sızmış "any" virüsleri.
   - Veritabanından gelen verilerin UI modellerine (Product, Category) dönüşümünde (Converter) tip kaybı.

## 🧠 ÇÖZÜM STRATEJİSİ (BRAINSTORMING)
1. **Şema Üretimi:** `mcp_supabase_generate_typescript_types` kullanılarak `src/types/database.types.ts` dosyası güncellenecek.
2. **Client Entegrasyonu:** `src/lib/supabase.ts` içindeki `supabase` client'ına `<Database>` Generic tipi eklenecek.
3. **RPC Normalizasyonu:** RPC fonksiyonları için `Database['public']['Functions']` üzerinden tip tanımları yapılacak.
4. **Dinamik Casting:** `as any` yerine `as Database['public']['Tables']['...']['Row']` kullanımı zorunlu hale getirilecek.

## 🎯 HEDEF
- `supabase.ts` dosyasında sıfır `any`.
- Tüm veritabanı etkileşimlerinde IntelliSense desteği.
- `database.types.ts`'in tek "Doğruluk Kaynağı" olması.
