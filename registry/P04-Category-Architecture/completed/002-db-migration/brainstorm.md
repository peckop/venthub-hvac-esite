# Brainstorm: 002-db-migration

## 🎯 Goal
`src/config/categoryMetadata.ts` dosyasındaki statik verileri veritabanındaki `categories.metadata` sütununa taşımak ve kodun bu verilere dinamik olarak erişmesini sağlamak.

## 🛡️ Constraints & Risks
- **Risk:** SQL injection riskini önlemek için `mcp_supabase_execute_sql` kullanırken verileri düzgün escape etmek gerekir.
- **Risk:** Mevcut veritabanında `metadata` sütununun tipi `jsonb` olmalıdır.
- **Kısıt:** Bazı kategorilerin `slug` değerleri kodda ve DB'de farklı olabilir (Örn: `hava-temizleyiciler-anti-viral-urunler` vs `hava-temizleyiciler`).

## 💡 Options & Recommendation
- **Öneri:** SQL sorgularını `UPDATE public.categories SET metadata = metadata || '[JSON_DATA]'::jsonb WHERE slug = '[SLUG]'` şeklinde hazırlayarak mevcut metadata varsa koruyup üzerine ekleme (shallow merge) yapmak en güvenlisidir.
- **Öneri:** Göç tamamlandıktan sonra `CategoryPage.tsx` içindeki `STATIC_CATEGORY_METADATA` referanslarını tamamen kaldırıp `category.metadata` kullanımını zorunlu kılmak.

## ✅ Acceptance Criteria
- Tüm statik veriler DB'ye başarıyla aktarıldı.
- `CategoryPage.tsx` artık `categoryMetadata.ts` dosyasına ihtiyaç duymadan aynı görünümleri sağlıyor.
- `pnpm build` hatasız tamamlanıyor.
