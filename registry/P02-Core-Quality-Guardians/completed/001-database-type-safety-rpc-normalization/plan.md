# Plan: 001 - Database Type Safety & RPC Normalization

## 📋 ADIMLAR

### 1. Hazırlık ve Tip Üretimi
- [ ] Supabase CLI/MCP kullanarak güncel veritabanı tiplerini üret.
- [ ] Hedef dosya: `src/types/database.types.ts`
- [ ] Doğrulama: Dosyanın varlığı ve içeriğinin tablo şemalarıyla uyumu.

### 2. Supabase Client Modernizasyonu
- [ ] `src/lib/supabase.ts` dosyasına `Database` tipini dahil et.
- [ ] `const supabase = createClient<Database>(...)` şeklinde generic tip atamasını yap.

### 3. RPC Çağrılarının Temizlenmesi
- [ ] `fts_search_products` için `as any` kaldır, RPC tipini tanımla.
- [ ] `get_products_enriched` için `as any` kaldır, RPC tipini tanımla.
- [ ] `get_effective_price` için `as any` kaldır, RPC tipini tanımla.

### 4. Admin ve Tablo İşlemleri (CRUD)
- [ ] `supabase.from('...')` çağrılarındaki tüm `as any` dökümlerini temizle.
- [ ] SQL `RPC` çağrılarını `supabase.rpc('...')` formatına (type-safe) çek.

### 5. Doğrulama ve Test
- [ ] `pnpm exec tsc -b tsconfig.build.json` çalıştırarak tip hatalarını kontrol et.
- [ ] `pnpm run lint` ile standartları doğrula.
- [ ] `pnpm run build:ci` ile üretim build'ini test et.

## 🛡️ RİSK YÖNETİMİ
- **Geriye Dönük Uyumluluk:** Mevcut `Product` ve `Category` interface'lerinin `database.types.ts` ile çelişmesi durumunda converter katmanını (`type-converters.ts`) güncelle.
- **RPC Değişiklikleri:** Veritabanındaki RPC fonksiyon imzalarının kodla eşleştiğinden emin ol.
