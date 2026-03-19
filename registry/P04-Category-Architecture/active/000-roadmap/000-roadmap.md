# P04 - Category Architecture Reform

## 🎯 Projenin Amacı
Mevcut parçalı ve karmaşık Kategori/Ürün listeleme mimarisini (Category vs DomainCategory, CategoryShowcase vs CategoryLanding, ProductsPage vs CategoryPage) tek tip, server-side-driven, %100 tip güvenliği olan ve konfigürasyonunu sadece Supabase DB'den alan profesyonel bir Gateway mimarisi etrafında birleştirmek.

## 🛠 Teknik Odak Noktaları
- **Single Source of Truth (Tip):** Sistem genelinde UI tarafında `DomainCategory` ana tür modelidir. `supabase.ts`'teki kirli tipler temizlenmelidir.
- **Single Source of Truth (Config):** Kategori konfigürasyonları (display_mode vb.) `categoryMetadata.ts` yerine direkt olarak `categories.metadata` sütunundan gelmelidir.
- **Gateway Pattern:** 800 satırlık karmaşık `CategoryPage.tsx` yapısı, routing+veri alma işini yapan bir "Gateway" ve gösterimi yapan bağımsız "View" bileşenlerine ayrılmalıdır.
- **Ürün Gösterim Tekliği:** Tüm ürün sayfaları aynı yüksek kaliteli altyapıyı (filtre, kıyaslama, tip) paylaşmalıdır.

## 📈 Başarı Kriterleri (Definitions of Done)
1. Kod tabanında `import { Category } from 'supabase.ts'` kullanımı ya kaldırılmış ya da `DomainCategory` olarak alias edilmiş olmalı.
2. `categoryMetadata.ts` dosyası tamamen silinmiş olmalı ve tüm verileri DB'den gelmeli.
3. Kategori Sayfası en az 3 belirgin React Bileşenine (`Gateway`, `Hero`, `View`) ayrılmış olmalı.
4. `tsc` ve `lint` sorunsuz geçmeli.
