# Brainstorm: 013 - State Hydration & Durum Yönetimi

## 🎯 Hedef
Next.js 15 App Router mimarisinde, Server-Side Rendering (SSR) ile Client-Side Rendering (CSR) arasındaki geçişlerde yaşanan "Hydration Mismatch" (kavrama uyumsuzluğu) hatalarını gidermek. Ayrıca, kullanıcıların kategori filtreleri ve ürün seçimleri gibi durumlarını URL ile senkronize ederek "Kaldığın Yerden Devam Et" (deep linking) deneyimini mükemmelleştirmek.

## 🚀 Geliştirme Alanları

### 1. Kategori Filtrelerinin URL Senkronizasyonu (URL-State Sync)
- **Problem:** Kullanıcı bir kategoride fiyat filtresi uygulayıp sayfayı yenilediğinde veya linki başkasına attığında filtreler sıfırlanıyor. Zustand/Context state'i URL'ye yansımıyor.
- **Çözüm:** `useCategoryGateway` içindeki `filters` state'ini `next/navigation`'dan `useRouter`, `usePathname` ve `useSearchParams` kullanarak URL'ye bağla. Örn: `?priceMin=100&brands=avens`
- **Hydration Safe:** Next.js 15 asenkron searchParams kurallarına uygun olarak URL'den okunan değerleri güvenli şekilde hydrate et.

### 2. Hydration Mismatch Koruması (SSR vs Client)
- **Problem:** `window.localStorage` veya tarayıcıya özgü API'ler ilk render'da (SSR) çalışmadığı için sunucuda üretilen HTML ile istemcideki React ağacı farklılaşıyor ve hydration hatasına neden oluyor.
- **Çözüm:** 
  - `useHydration` veya `isMounted` hook'u oluştur. Tarayıcıya özgü (localStorage, session vb.) verilere bağlı render edilen bileşenleri (örn: Sepet ikonu, Kullanıcı Menüsü, Dil Seçimi) ilk render'da sunucu ile aynı bırakıp, mount olduktan sonra güncelle.
  - Varsa `typeof window !== 'undefined'` kontrollerini güvenli state tabanlı hydrate desenlerine çevir.

### 3. Teknik Hesaplayıcı (Calculator) Durum Koruma
- **Problem:** Hesaplayıcılarda girilen veriler sayfa değiştiğinde kayboluyor.
- **Çözüm:** Hesaplayıcı state'lerini URL veya SessionStorage'da tutarak, sayfaya geri dönüldüğünde hesaplamanın kalmasını sağla (Kaldığın yerden devam et).

## 🛠️ Teknik Yaklaşım
- Zustand kullanılıyorsa `persist` middleware'ine (storage) güvenli hydration sarmalayıcıları (hasHydrated) ekle.
- `useCategoryGateway` ve `useProductGateway` dosyalarında URL senkronizasyonu için `nuqs` kütüphanesi veya yerleşik Next.js `useSearchParams` hook'larını kullan.
