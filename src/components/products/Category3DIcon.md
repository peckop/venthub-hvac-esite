---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\Category3DIcon.tsx
skeleton_hash: bad05a2357385237
entity_hashes:
  func:Category3DIcon: 183e6f04e3301ca0
  overview: 2b291c273e3fc837
  style_tokens: b8d757c80f7b09fe
generated_at: 2026-06-14T22:20:40Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki ürün listeleme ekranlarında her bir kategori için üç boyutlu ve etkileşimli bir ikon göstermek üzere tasarlanmış, yeniden kullanılabilir bir React bileşenidir. Bileşen, gelen kategori tanımlayıcısına ve hover/yerleşim durumuna bağlı olarak dinamik bir 3D render işlemi yapar.

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
**Ne yapar**: Kategori bazlı 3D HVAC ürün modellerini FanRenderer bileşeni üzerinden orbital bir görsel sistem içinde kullanıcılara sergileyen React bileşenidir. Gelen durum prop'larına göre ikonun görsel özelliklerini ve ek etkileşim ipuçlarını dinamik olarak ayarlar, hem masaüstü hem de mobil arayüzlerde tutarlı bir kullanıcı deneyimi sunar. Sadece ilgili kategoriye ait 3D içeriği yükleyerek gereksiz kaynak tüketimini önler, performans odaklı bir yapıya sahiptir.
**Nasıl yapar**: İç mantığında categorySlug parametresini kullanarak yüklenecek 3D modeli eşleştirir, doğru modelin FanRenderer üzerinden işlenmesini sağlar. Hover durumu, önde kart olma ve tıklama ipucu gösterimi gibi koşulları alarak 3D modelin konumunu, ölçekini, opaklığını ve ek olarak gösterilecek ipuçlarının görünürlüğünü dinamik olarak günceller. Orbital sistemin konumlandırma kurallarına göre ikonun 3B alandaki yerini ayarlar, kategori listelerindeki görsel hiyerarşiyi korur.
**Parametreler**:
- categorySlug: string — Kategorinin benzersiz, URL dostu tanımlayıcısıdır, hangi 3D modelin yükleneceğini belirlemek için kullanılır.
- hovered: boolean — Kullanıcının fareyle ikonun üzerine gelip gelmediğini belirten durum değişkenidir, üzerine gelindiğinde tetiklenecek görsel efektleri yönetir.
- isFrontCard: boolean — İkonun bulunduğu kartın kategori listesinde önde, ilk sırada yer alıp almadığını belirten prop'tur, öndeki kartlara özel 3B konumlandırma ve ölçekleme ayarlarını uygular.
- shouldShowTapHint: boolean — Dokunmatik arayüzlerde kullanıcıya ikona tıklayabileceğini hatırlatmak için ipucu gösterilip gösterilmeyeceğini yöneten boolean değişkendir.
**Dönüş**: React.ReactElement — Tüm durum ve kategori ayarları uygulanmış, kullanıcıya sunulmaya hazır 3D kategori ikonunu içeren geçerli bir React elementi döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ./3d/FanRenderer::FanRenderer
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

### [N1_NASIL] AST Pointer: src/components/products/Category3DIcon.tsx::Category3DIcon
- **params**: (`categorySlug`, `hovered`, `isFrontCard`, `shouldShowTapHint`, `shouldShowDragHint`, `hintStage`, `DetailedModel`, `scale=1`, `modelType`, `offsetContext`)
- **ic_degiskenler**:
  - `t` — useI18n hookundan dönen çeviri fonksiyonu, UI metinleri için kullanılır
  - `meshRef` — useRef ile oluşturulan Three.js Group referansı, rotasyon animasyonu için kullanılır
  - `showTapHint` — shouldShowTapHint ve hintStage === 'tap' koşullarının AND mantıksal sonucu, tıklama ipucunun gösterilip gösterilmeyeceğini belirler
- **Dönüş**: JSX elementi (React component) — 3D ikon container'ı, model gösterimi ve UI hint'leri içeren React bileşeni

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