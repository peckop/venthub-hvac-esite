# Plan: 018 - Tüm Ana Kategoriler için Series Dönüşümü

## 🛠️ Uygulama Adımları

### Faz 1: Altyapı Hazırlığı 🏗️
1.  **Series Veri Yapısı:** `src/types/products.ts` içinde (varsa) veya Gateway'de `Series` objesini tanımla (Seri adı, görseli, alt ürünler).
2.  **Category Gateway:** Mevcut `useCategoryGateway`'de ürünleri seri bazlı gruplayan bir `groupedProducts` memoize fonksiyonu ekle.

### Faz 2: UI Bileşenleri (Visuals) 🎨
1.  **SeriesCard:** `src/components/products/SeriesCard.tsx` oluştur. Şık bir hover efekti ve teknik özet içeren kart.
2.  **SeriesView:** `src/views/CategoryView.tsx` (veya ilgili view) içinde `displayMode === 'series'` durumunda listeleme yerine bu kartları render eden logic ekle.

### Faz 3: İçerik ve Metadata 📑
1.  **Supabase Sync:** Ana kategorilerin `metadata` alanına `display_mode: "series"` değerini ekleyen bir SQL script'i hazırla veya manuel (UI üzerinden) test et.
2.  **Hero Section:** Her kategori için `category.hero_image` (metadata içinden) okuyan ve şık bir banner gösteren bileşen ekle.

## ✅ Doğrulama Kriterleri
- [ ] Kanal Tipi Fanlar kategorisi açıldığında ürünler yerine "Lineo", "Quiet" gibi seri kartları görünüyor.
- [ ] Seri kartına tıklandığında o serideki ürünlere (filtreli) yönlendiriyor.
- [ ] Hydration hatası (isMounted kontrolü ile) vermiyor.
- [ ] Mobil görünümde seriler tek sütun, desktop'ta 3 sütun.
- [ ] `npm run build` hatasız tamamlanıyor.
