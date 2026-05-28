---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\Category3DIcon.tsx
skeleton_hash: 23bc6c824a67e8aa
entity_hashes:
  func:Category3DIcon: 183e6f04e3301ca0
  overview: 0edc95160e4ce010
  style_tokens: b8d757c80f7b09fe
generated_at: 2026-05-28T22:36:53Z
---

## Genel Bakış
Bu React modülü, VentHub HVAC projesinin ürün bölümünde kullanılan kategori tabanlı 3B ikonları sunmak üzere tasarlanmış yeniden kullanılabilir bir UI bileşenidir. Kategori kimliği, üzerine gelinme durumu, kartın konumu ve dokunma ipucu gereksinimi gibi dinamik parametrelere göre ikonun görünümünü ayarlayarak farklı kullanım senaryolarına uyum sağlar. Ürün kartları üzerindeki kategori görselleştirmelerinin temel yapı taşını oluşturur.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tüm sorumluluğunu üstlenen tek giriş noktasıdır, gelen parametreleri işleyerek uygun 3B ikonun ekrana yansıtılmasını yönetir.
- Category3DIcon

---

## AXIOMS – Mimari Varsayımlar
Bu React bileşeni, HVAC ürünleri kategorileri için 3B görsel ikonlar render etmek üzere tasarlanmıştır, tüm işlev ve görsel doğruluğu parent bileşenden iletilen dört zorunlu prop'un doğru, tip uygun şekilde sağlanmasına bağlıdır, aksi halde kalıcı işlevsel veya görsel arızalar ortaya çıkar.

[Aksiyom 1]: Eğer kategori kimliği tutan `categorySlug` prop'u geçirilmezse, hangi kategoriye ait 3B ikonun yükleneceği belirsizleşir, ikon hiç render edilemez veya yanlış kategori ikonu gösterilir.
[Aksiyom 2]: Eğer ikonun üzerine gelinip gelinmediğini tutan `hovered` boolean prop'u geçirilmezse, fare etkileşimine bağlı çalışması gereken 3B görsel efektler tetiklenemez, bileşenin etkileşim özelliği tamamen devre dışı kalır.
[Aksiyom 3]: Eğer ikonun ön kartta olup olmadığını belirten `isFrontCard` boolean prop'u geçirilmezse, 3B görselin perspektif ve katman sıralaması ayarları yanlış uygulanır, sayfadaki diğer kartlarla görsel uyumsuzluk ve dengesizlik oluşur.
[Aksiyom 4]: Eğer dokunmatik cihazlarda tıklama ipucu gösterilip gösterilmeyeceğini belirten `shouldShowTapHint` boolean prop'u geçirilmezse, mobil kullanıcılar için gerektiğinde tıklama ipucu gösterilemez, kullanıcı deneyimi bozulur.

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

### [N1_NASIL] AST Pointer: src/components/products/Category3DIcon.tsx::Category3DIcon
- **params**: categorySlug, hovered, isFrontCard, shouldShowTapHint, shouldShowDragHint, hintStage, DetailedModel, scale, modelType, offsetContext
- **ic_degiskenler**:
  - `meshRef` — useRef ile oluşturulmuş, 3D sahne içindeki ana grup nesnesini referanslamak için kullanılan ref nesnesi, animasyonlar için kullanılır
  - `showTapHint` — shouldShowTapHint koşulu ve hintStage'in 'tap' olması durumunda true olan, tıklama ipucunun gösterilip gösterilmeyeceğini belirten boolean değişken
- **Dönüş**: İçinde 3D model ve UI ipuçları barındıran Three.js JSX group elementi, React bileşen çıktısı

### [N2_NASIL] AST Pointer: src/components/products/Category3DIcon.tsx::useFrame_animation_callback
- **params**: state
- **ic_degiskenler**:
  - `meshRef.current` — Üst kapsamdaki meshRef referansının mevcut değeri, varlığı kontrol edilerek rotasyon özelliği güncellenir
  - `state.clock.elapsedTime` — useFrame hook'u tarafından sağlanan state nesnesinden alınan, sahne başlangıcından beri geçen toplam süre, animasyonun sinüs hesaplaması için kullanılır
  - `hovered` — Üst kapsamdaki bileşen parametresi, fare ikonun üzerine geldiğinde ek rotasyon hareketi eklemek için kontrol edilir
- **Dönüş**: yok, sadece yan etki olarak 3D grup nesnesinin y eksenindeki rotasyon değerini her karede günceller

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