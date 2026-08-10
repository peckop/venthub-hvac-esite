---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\Category3DIcon.tsx
skeleton_hash: 64226a2189957df2
entity_hashes:
  func:Category3DIcon: 80d3b8dc7d8aee4c
  overview: ea7403f0eb8a8cd0
  style_tokens: b8d757c80f7b09fe
generated_at: 2026-06-19T20:47:27Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki ürün listeleme ekranlarında her bir kategori için üç boyutlu ve etkileşimli bir ikon göstermek üzere tasarlanmış, yeniden kullanılabilir bir React bileşenidir. Bileşen, gelen kategori tanımlayıcısına ve hover/yerleşim durumuna bağlı olarak FanRenderer üzerinden dinamik bir 3D model render işlemi yapar. Mimari olarak, performans odaklıdır ve yalnızca ilgili kategorinin 3D içeriğini dinamik olarak yükleyerek gereksiz kaynak tüketimini önler.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve merkezi bileşenidir; gelen parametreleri işleyerek kategoriye özgü 3D ikonun durumuna (üzerine gelme, kart önü/arkası, dokunma ipucu gösterimi) göre nihai görünümü render eder.
- Category3DIcon

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Category3DIcon

**Ne yapar**: Kategori bazlı 3D modelleri ProductModelRenderer bileşeni aracılığıyla orbital sistem içinde sergileyen bir React bileşenidir. Her bir ürün kategorisi için özgün 3D görselleri interaktif olarak sunar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni (`React.FC<Category3DIconProps>` dönüş tipiyle) olarak tanımlanmıştır. `@component` dekoratörü ile bileşen olarak işaretlenmiştir. Bileşen, verilen `categorySlug` parametresine karşılık gelen 3D modeli seçer ve `ProductModelRenderer` üzerinden orbital kamera sistemiyle döndürerek sergiler. `hovered` durumuna göre animasyon ve etkileşim değişimlerini, `isFrontCard` durumuna göre ön yüz kart görünürlüğünü, `shouldShowTapHint` durumuna ise dokunma/ipucu göstergesinin visibility durumunu kontrol eder.

**Parametreler**:
- `categorySlug` — Kategorinin URL dostu tanımlayıcısı; hangi 3D modelin yükleneceğini belirler
- `hovered` — Boolean değer; fare imlecinin bileşen üzerinde olup olmadığını belirtir, etkileşim animasyonlarını tetikler
- `isFrontCard` — Boolean değer; bileşenin ön yüz kart pozisyonunda olup olmadığını belirtir, görünüm ve animasyon davranışını değiştirir
- `shouldShowTapHint` — Boolean değer; mobil cihazlarda dokunma ipucu göstergesinin Görünür olup olmadığını kontrol eder

**Dönüş**: `React.FC<Category3DIconProps>` — Category3DIconProps arabirimine uygun özellikler alan ve JSX döndüren bir React işlevsel bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ./3d/ProductModelRenderer::ProductModelRenderer
- import: ./3d/SmartCenterScale::SmartCenterScale
- import: @/utils/3dModelOffsets::ModelContext
- import: @/utils/3dModelOffsets::getModelPlacement
- import: @react-three/drei::Html
- import: @react-three/fiber::useFrame
- import: lucide-react::ChevronLeft
- import: lucide-react::ChevronRight
- import: lucide-react::MousePointerClick
- import: react::React
- import: react::useRef
- import: three::type { Group }

---

## INTERFACES

### Category3DIconProps
- `categorySlug: string`
- `hovered?: boolean`
- `isFrontCard?: boolean`
- `shouldShowTapHint?: boolean`
- `shouldShowDragHint?: boolean`
- `hintStage?: 'idle' | 'tap' | 'drag' | 'scroll' | 'down' | 'finished'`
- `DetailedModel?: React.ComponentType | null`
- `scale?: number`
- `modelType?: string`
- `offsetContext?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: Category3DIcon.tsx::Category3DIcon
- **params**: (`categorySlug`, `hovered`, `isFrontCard`, `shouldShowTapHint`, `shouldShowDragHint`, `hintStage`, `DetailedModel`, `scale`, `modelType`, `offsetContext`)
- **ic_degiskenler**:
  - `t` — useI18n hook'unun döndürdüğü çeviri fonksiyonu, HTML içindeki metinleri uluslararasılaştırmak için kullanılır (örn. `t('products.category3DIcon.dragHint')`).
  - `meshRef` — useRef ile oluşturulmuş bir referans, Three.js Group nesnesini tutar. useFrame içinde rotation güncellemeleri için kullanılır.
  - `placement` — getModelPlacement fonksiyonuyla hesaplanan konumlandırma bilgisi nesnesi. rotation, position ve scale özelliklerini içerir, SmartCenterScale ve group elemanlarının pozisyonunu belirler.
  - `showTapHint` — shouldShowTapHint ve hintStage === 'tap' koşullarının birleşimiyle hesaplanan mantıksal değer, tıklama ipucunun gösterilip gösterilmeyeceğini belirler.
- **Dönüş**: JSX Elemanı (React.ReactNode) — Category3DIcon bileşeninin render ettiği 3D sahne ve UI hint elemanları.

---

## NODE ID STANDARD

  file: src\components\products\Category3DIcon.tsx
  function: src\components\products\Category3DIcon.tsx::Category3DIcon

---

## DISA AKTARILANLAR (EXPORTS)
  export: Category3DIcon

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-900/80`, `bg-white/90`, `border-primary-navy/20`, `border-white/10`, `text-cyan-400`, `text-primary-navy`, `text-white`, `text-xs`
- **Layout:** `backdrop-blur-sm`, `flex`, `gap-4`, `items-center`, `p-2`, `shadow-lg`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-bounce`, `animate-pulse`, `border`, `font-bold`, `px-4`, `py-2`, `rounded-full`, `rounded-xl`, `tracking-widest`, `uppercase`