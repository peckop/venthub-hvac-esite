# Plan: 013 - State Hydration & Durum Yönetimi

## 📝 Özet
Next.js 15 mimarisindeki SSR/CSR uyumsuzluklarını önlemek için güvenli Hydration (isMounted) hook'ları oluşturulacak ve Kategori/Ürün Gateway'lerindeki state'ler URL ile senkronize edilerek Deep Linking desteklenecek.

## 🛠️ Uygulama Adımları

### Faz 1: Hydration Güvenliği 🛡️
1.  **useIsMounted Hook:** `src/hooks/useIsMounted.ts` oluştur. İlk render'da false dönüp, useEffect içinde true olacak basit bir hydration kalkanı.
2.  **Cart & User Durumu:** `CartProvider` ve `AuthProvider` içerisindeki veya bu verileri kullanan bileşenleri (örn: `StickyHeader` sepet rozeti) `useIsMounted` ile sararak SSR mismatch'leri engelle.

### Faz 2: Kategori URL Senkronizasyonu 🔗
1.  **useCategoryGateway Güncellemesi:** `src/hooks/useCategoryGateway.ts` içindeki `filters` (Zustand/Local state) değişikliklerini `useRouter().replace` ile URL'ye query parameter olarak yaz (`?brand=avens&viewMode=grid`).
2.  **İlk Yükleme:** Kategori sayfası yüklendiğinde, `useSearchParams` okuyarak filtreleri URL'deki duruma (initialState) göre ayarla.

### Faz 3: PDP ve Diğer Durumlar 💾
1.  **PDP Sekmeleri:** `ProductDetailPage`'deki aktif sekme (örn: `#olcuiler`) durumunu URL hash veya query olarak tut.
2.  **Güvenlik Taraması:** Proje genelinde `typeof window !== 'undefined'` ile doğrudan component gövdesinde yapılan hatalı (hydration-breaking) kullanımları `useEffect` içine veya `isMounted` şartına taşı.

## ✅ Doğrulama Kriterleri
- [ ] Tarayıcıda JavaScript kapalıyken (veya ilk yüklemede) hydration hatası (500 Error / console warn) vermiyor.
- [ ] Kategori sayfasında filtre seçilince URL güncelleniyor.
- [ ] Filtreli bir kategori URL'si yeni sekmede açıldığında filtreler aynen uygulanıyor.
- [ ] `npm run lint` ve `npx tsc --noEmit` hatasız tamamlanıyor.
