# Plan: 033-tech-debt-cleanup (Genişletilmiş - Zero-Lint Focus)

## 🎯 Goal
Anayasa Madde 2 (Strict Typing) ve Madde 5 (Zero-Lint) uyarınca projedeki tüm `any` hatalarını temizlemek ve tip güvenliğini (`src/types/db-rows.ts`) restore etmek.

## 🏗️ Steps

### Adım 1: Temel Tip Altyapısının Güncellenmesi
- `supabase gen types` ile `database.types.ts` dosyasını tazeleyerek `view_admin_orders` ve yeni tabloların tiplerini al.
- `src/types/db-rows.ts` içindeki alias'ları (`DbProduct`, `DbOrder`, `DbCategory`) güncel şema ile senkronize et.
- **Verify:** `tsc --noEmit` çalıştırıldığında temel tip tanımlarından kaynaklı hataların giderilmesi.

### Adım 2: Admin & Lojistik Paneli Temizliği (Öncelikli)
- `AdminDashboardPage.tsx` ve `AdminLogisticsPage.tsx` dosyalarındaki `any` kullanımlarını `DbOrder` ve `DbProduct` ile değiştir.
- `CategoryFormModal.tsx` içindeki kategori manipülasyonlarını `Partial<DbCategory>` ile tiple.
- **Verify:** `npm run lint` çıktısında bu 3 dosyanın hata listesinden düşmesi.

### Adım 3: Ürün & Kategori (PDP/PLP) Katmanı Temizliği
- `ProductDetailPage.tsx` ve `ProductDetailPageView.tsx` içindeki devasa `any` bloklarını `DbProduct` ve `DbProductImage` tiplerine dönüştür.
- `CategoryPage.tsx` ve `CategoryLanding.tsx` içindeki dinamik içerik yapılarını `isRecord` guard'ları ile korumaya al.
- `EnhancedNeedsWizard.tsx` (Hava Perdeleri sihirbazı) içindeki sihirbaz mantığını tiple.
- **Verify:** `npm run lint` çıktısında ürün ve kategori dosyalarının temizlenmesi.

### Adım 4: Hooklar, Contextler ve Servis Katmanı
- `supabase.ts` içindeki tüm RPC çağrılarını (`rpc(...)`) asimetrik tip (Input/Output) güvenliğine kavuştur.
- `useCheckoutPayment`, `useCategoryGateway` ve `CartProvider` içindeki "geçiş dönemi" `any` kalıntılarını temizle.
- `type-converters.ts` üzerindeki `unknown as any` dökümlerini kaldır, gerçek `converter` mantığını uygula.
- **Verify:** `npm run lint` çıktısında tüm hook ve servis dosyalarının temizlenmesi.

### Adım 5: Küçük Bileşenler & Yardımcı Fonksiyonlar (Final Sweep)
- `HeroSection`, `KnowledgeBlock`, `SearchOverlay` gibi bileşenlerdeki `any` kullanımlarını temizle.
- `categoryHelpers.ts` ve `engineeringIntelligence.ts` dosyalarını tiple.
- **Verify:** `npm run lint` komutunun "Zero-Lint" (0 error, 0 warning) çıktısı vermesi.

### Adım 6: Final Build & Edge Function Validasyonu
- `pnpm build` komutunu çalıştırarak tüm projenin tip-güvenli olarak derlendiğini doğrula.
- `stock-alert` ve `release-expired-reservations` Edge Function'larını deploy et.
- **Verify:** Build başarılı ve Edge Function'lar `operational`.

## 🧪 Testing & Verification
- Her adım sonrası `npm run lint` ile ilerlemeyi raporla.
- Kritik sayfalarda (Checkout, Admin, PDP) manuel regresyon testi yap.
