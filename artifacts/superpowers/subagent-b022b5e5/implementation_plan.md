/** @.agent\claude_leak_analysis\source\src\utils\generatedFiles.ts by VentHub-Subagent - DO NOT EDIT MANUALLY **/

# VentHub Cache Stratejisi Uygulama Planı (Redis vs Supabase)

### Goal
Veri erişim gecikmesini (latency) minimize etmek ve veritabanı yükünü azaltmak için hibrit bir önbellekleme mekanizması kurmak.

### Assumptions
- Birincil veritabanı Supabase (PostgreSQL).
- Deployment Cloudflare/Vercel üzerinde (Serverless ortam).
- Ürün katalog verileri seyrek, sepet ve oturum verileri sık değişiyor.

### Plan

1. **Performans Denetimi (SQL Analizi)**
   - Files: `supabase/migrations/`
   - Change: Mevcut ağır sorgular için `EXPLAIN ANALYZE` çalıştırarak darboğazları belirle.
   - Verify: `mcp_supabase_execute_sql` ile milisaniye bazlı rapor al.

2. **Next.js 15 Native Caching (Katman 1)**
   - Files: `src/lib/api/products.ts`, `src/lib/api/categories.ts`
   - Change: `unstable_cache` kullanarak ürün listelerini ve kategorileri etiketle (tags).
   - Verify: Sayfa yenilemelerinde Supabase Dashboard "API Usage" kısmında düşüş gözlemle.

3. **Upstash Redis Entegrasyonu (Katman 2 - Ephemeral Veri)**
   - Files: `src/lib/redis.ts`, `middleware.ts`
   - Change: Rate-limiting ve geçici sepet verileri için Upstash Redis bağlantısını kur.
   - Verify: `pnpm test src/lib/redis.test.ts` ile bağlantı ve hız testi yap.

4. **Cache Invalidation (Geçersiz Kılma) Mekanizması**
   - Files: `src/app/api/revalidate/route.ts`
   - Change: Supabase Webhook'larını dinleyen bir revalidate endpoint'i oluştur.
   - Verify: Veritabanında bir ürün güncellendiğinde önbelleğin temizlendiğini manuel kontrol et.

### Risks & Mitigations
- **Risk:** Cache Inconsistency (Eski veri görünmesi).
- **Mitigation:** On-demand revalidation (etiket bazlı) kullanarak sadece değişen veriyi temizle.
- **Risk:** Redis maliyet artışı.
- **Mitigation:** Sadece yüksek frekanslı (volatile) verileri Redis'te tut, katalog verilerini Next.js belleğinde sakla.

### Rollback Plan
- Cache katmanlarını devre dışı bırakmak için bir `.env` bayrağı (`ENABLE_CACHE=false`) tanımla ve doğrudan Supabase sorgularına dön.
