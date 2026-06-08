---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\Category3DIcon.tsx
skeleton_hash: 26b109acd1c22ca6
entity_hashes:
  func:Category3DIcon: 183e6f04e3301ca0
  overview: fc3c14abd899ae11
  style_tokens: b8d757c80f7b09fe
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu React modülü, VentHub HVAC projesinin ürün bölümünde kullanılan kategori tabanlı 3B ikonları sunmak üzere tasarlanmış yeniden kullanılabilir bir UI bileşenidir. Kategori kimliği, üzerine gelinme durumu, kartın konumu ve dokunma ipucu gereksinimi gibi dinamik parametrelere göre ikonun görünümünü ayarlayarak farklı kullanım senaryolarına uyum sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tüm sorumluluğunu üstlenen tek giriş noktasıdır, gelen parametreleri işleyerek uygun 3B ikonun ekrana yansıtılmasını yönetir.
- Category3DIcon

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kategori bazlı 3D ikon gösterimi için dört parametreye bağımlıdır; geçerli değerler sağlanmadığında bileşen doğru görsel sonucu üretemez.

[Aksiyom 1]: Eğer `categorySlug` parametresi sağlanmazsa veya geçerli bir kategori tanımlayıcısı içermiyorsa, bileşen hangi 3D ikonu render edeceğini bilemez ve uygun görsel çıktı üretilemez.

[Aksiyom 2]: Eğer `hovered` parametresi sağlanmazsa, bileşen üzerine gelme durumunu bilemez ve ikonun hover durumuna ait görsel geçiş (animasyon, renk değişimi vb.) tetiklenemez.

[Aksiyom 3]: Eğer `isFrontCard` parametresi sağlanmazsa, bileşen kartın konumsal bağlamını (ön/arka) bilemez ve buna göre konumlandırma veya perspektif ayarlaması yapılamaz.

[Aksiyom 4]: Eğer `shouldShowTapHint` parametresi sağlanmazsa, bileşen dokunma ipucunun gösterilip gösterilmeyeceğine karar veremez ve ipucu bileşeni gereksiz veya eksik_render edilebilir.

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
- **params**: (categorySlug, hovered, isFrontCard, shouldShowTapHint, shouldShowDragHint, hintStage, DetailedModel, scale, modelType, offsetContext)
- **ic_degiskenler**:
    - `meshRef` — useRef ile oluşturulan THREE.Group referansı, 3D modelin rotasyonunu kontrol etmek için kullanılır
    - `showTapHint` — shouldShowTapHint ve hintStage koşullarına göre tap hintinin gösterilip gösterilmeyeceğini belirleyen boolean değer
- **Dönüş**: React.Group JSX elementi (3D model ve UI hint'lerini içeren container)

### [N2_NASIL] AST Pointer: Category3DIcon.tsx::useFrame callback
- **params**: (state) — useFrame hook'unun sağladığı frame state nesnesi
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: meshRef.current.rotation.y'yi günceller)

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