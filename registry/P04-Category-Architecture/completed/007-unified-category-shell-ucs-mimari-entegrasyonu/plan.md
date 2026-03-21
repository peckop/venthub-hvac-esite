# 📋 Implementation Plan: Unified Category Shell (UCS)

## 🏁 Hazırlık
- [ ] Mevcut `CategoryPage.tsx` ve `ProductsPage.tsx` yapılarını analiz et.
- [ ] Ortak UI elemanlarını (Breadcrumb, Filter Sidebar, Hero) belirle.

## 🛠️ Uygulama (UCS Mimarisi)
- [ ] **CategoryMasterView:** Tüm sunumu yönetecek ana konteyneri oluştur.
- [ ] **Adaptive Layout:** `category.level` bilgisine göre sayfa yapısını (Sidebar var/yok, Hero büyük/küçük) otonom değiştiren mantığı kur.
- [ ] **Page Builder Bridge:** `AuthorityRenderer`'ı bu kabuğun ana içerik motoru yap.
- [ ] **Transition Layer:** Sayfa geçişlerine (Framer Motion) yumuşak geçiş efektleri ekle.

## 🧪 Doğrulama
- [ ] Kategori ve Alt Kategori arasında geçiş yaparken "Sayfa Iskeletinin" yerinde kaldığını görsel olarak teyit et.
- [ ] Statü: Gateway verisinin tüm seviyelerde doğru aktığını `pnpm run type-check` ile doğrula.
