# 📋 Plan: P01-012 Medya Otoritesi (Media Authority)

Bu plan, zengin medya içeriklerinin (Video, 3D, Teknik Çizim) Page Builder mimarisine entegrasyonunu kapsar.

## ✅ Alt Görevler
- [x] `src/types/media.types.ts` merkezi medya tiplemeleri oluşturuldu.
- [x] `VideoAuthority` bileşeni (Cloudflare/YouTube destekli) geliştirildi.
- [x] `ThreeDAuthority` bileşeni (Prop-driven Three.js viewer) geliştirildi.
- [x] `TechnicalDrawingAuthority` galeri bileşeni oluşturuldu.
- [x] Medya bileşenleri `PageShell` ve `Tasarım Sistemi` ile uyumlu hale getirildi.

## 🚀 Uygulama Adımları

### Step 1: Media Schema Definition
- **Action:** `MediaObject`, `VideoMetadata`, `ThreeDMetadata` interface'lerini tanımla.
- **Verify:** `npx tsc --noEmit` ile tip kontrolünün hatasız tamamlanması.

### Step 2: Authority Media Components
- **Action:** Mevcut `ImageGallery` ve `BlueprintCanvas` gibi yapıları "Authority" standartlarına refaktör et veya yeni merkezi bileşenler oluştur.
- **Verify:** Bileşenlerin sadece metadata JSON objesi alarak doğru render edilmesi.

### Step 3: Performance & Lazy Loading
- **Action:** `framer-motion` ve `IntersectionObserver` kullanarak medya bileşenlerine giriş animasyonları ve lazy-load ekle.
- **Verify:** Sayfa yüklenirken medya bileşenlerinin ağ (network) trafiğini sadece görünür olduklarında tetiklemesi.

### Step 4: Documentation & Storybook (Mock)
- **Action:** Admin panelinde medya ekleme/düzenleme JSON şemasını dökümante et.
- **Verify:** Page Builder için geçerli bir JSON örneğinin başarıyla render edilmesi.
