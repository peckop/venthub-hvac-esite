# Plan: 002-db-migration

## 🎯 Goal
Statik metadata verilerini DB'ye taşımak ve kodu temizlemek.

## 🏗️ Steps
1. **Veri Hazırlama:**
   - `src/config/categoryMetadata.ts` içeriğini SQL formatına dönüştür.
2. **SQL Uygulama:**
   - Supabase üzerinde toplu UPDATE sorgusu çalıştır.
   - Verify: `SELECT metadata FROM categories WHERE slug = 'sessiz-kanal-tipi-fanlar'` sorgusuyla veriyi teyit et.
3. **Kod Entegrasyonu:**
   - `src/app/_components/CategoryPageView.tsx` içinden `STATIC_CATEGORY_METADATA` importunu ve fallback mantığını kaldır.
   - Verify: Kategori sayfalarının hala showcase/series modunda açıldığını kontrol et.
4. **Temizlik:**
   - `src/config/categoryMetadata.ts` dosyasını sil.
   - Verify: `pnpm exec tsc` ile import hatası kalmadığını doğrula.
