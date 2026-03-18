# Brainstorm: 003-gateway-architecture

## 🎯 Goal
800 satırlık `CategoryPage.tsx` monolitini parçalayarak; veri yönetimi (Gateway) ve görselleştirme (View) katmanlarını birbirinden ayırmak.

## 🛡️ Constraints & Risks
- **Risk:** Props drilling. Gateway'den alt View bileşenlerine çok fazla veri (products, loading, filters vb.) geçmesi gerekecek.
- **Risk:** Client-side state senkronizasyonu. Filtrelerin tüm View'larda (Grid, Showcase, Landing) aynı şekilde çalışması lazım.
- **Kısıt:** SEO (JSON-LD) ve Breadcrumb mantığı bozulmamalı, Server Component uyumu gözetilmeli.

## 💡 Options & Recommendation
- **Option 1: Component Composition (Önerilen).** `CategoryPage` bir Gateway gibi davranır, veriyi çeker ve `children` veya seçili `View` bileşenine `initialData` olarak paslar.
- **Option 2: Context API.** Kategori verilerini bir Context içinde tutup alt bileşenlerin oradan okumasını sağlamak. (Filtreler için daha temiz olabilir).
- **Öneri:** `useCategoryGateway` isimli bir custom hook oluşturup veri çekme ve filtreleme mantığını oraya taşımak. UI tarafını ise `CategoryViewDispatcher` gibi bir yapı ile `display_mode`'a göre yönlendirmek.

## ✅ Acceptance Criteria
- [ ] `CategoryPage.tsx` < 150 satır.
- [ ] View bileşenleri (`GridView`, `ShowcaseView`, `LandingView`) bağımsız dosyalar olarak `src/views/category/` altında mevcut.
- [ ] Filtreleme mantığı (`filteredProducts`) tüm görünümlerde tutarlı çalışıyor.
- [ ] Build hatası yok.
