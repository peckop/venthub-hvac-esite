-- @.agent\claude_leak_analysis\source\src\utils\generatedFiles.ts by VentHub-Subagent

# VentHub Sepet Verisi Stratejisi: Supabase (PostgreSQL)

VentHub’ın teknik mimarisi ve kullanıcı deneyimi hedefleri doğrultusunda, sepet verisi için **Supabase (PostgreSQL)** kullanılmasını öneriyorum. HVAC sektörü, ürünlerin yüksek maliyetli olması nedeniyle müşterilerin uzun süre düşündüğü ve farklı cihazlardan (işte masaüstü, yolda mobil) kontrol ettiği bir alandır.

**İnsani Analoji:**
Redis, garsonun aklında tuttuğu anlık bir sipariş gibidir; garsonun vardiyası biterse (oturum kapanırsa) sipariş silinir. Supabase ise mutfaktaki **sipariş fişidir**; masaya kim servis yaparsa yapsın veya ne kadar zaman geçerse geçsin, müşterinin ne istediği kayıt altındadır.

### Goal
Sepet verilerini kalıcı ve cihazlar arası erişilebilir kılarak dönüşüm oranlarını (conversion rates) artırmak.

### Assumptions
- Supabase Auth ve RLS altyapısı kurulu.
- Projede Tip güvenliği (TypeScript) zorunlu.

### Plan
1. **Veritabanı Şeması (Step 0)**
   - Files: `supabase/migrations/20260405_create_cart.sql`
   - Change: `cart_items` tablosunu oluştur. RLS politikalarını `(user_id = auth.uid())` olarak ayarla.
   - Verify: `mcp_supabase_list_tables` ile tabloyu ve RLS durumunu kontrol et.
2. **Next.js 15 Entegrasyonu**
   - Files: `src/lib/actions/cart.ts`
   - Change: `await params` kurallarına uygun Server Action'lar geliştir.
   - Verify: `pnpm run build` ile SSR uyumluluğunu test et.

### Risks & Mitigations
- **Risk:** DB Latency (Gecikme). **Çözüm:** React `useOptimistic` hook'u ile kullanıcıya anında geri bildirim verilir, DB işlemi arka planda tamamlanır.
- **Risk:** Anonim Sepetler. **Çözüm:** Misafir kullanıcı verileri `localStorage`'da tutulur, login anında DB'ye taşınır.

### Rollback Plan
- `supabase db rollback` ile tabloyu kaldır.
- Sepet mantığını tamamen client-side `localStorage` yapısına geri döndür.
