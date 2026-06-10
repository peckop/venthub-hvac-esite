---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\Category3DIcon.tsx
skeleton_hash: 511a70b464c7831f
entity_hashes:
  func:Category3DIcon: 183e6f04e3301ca0
  overview: b7e45f97931594a0
  style_tokens: b8d757c80f7b09fe
generated_at: 2026-06-10T09:54:12Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürün bölümünde kategori bazlı 3D ikonları göstermek için kullanılan yeniden kullanılabilir bir React UI bileşenidir. Kategori tipi, üzerine gelme durumu, kart konumu ve dokunma ipucu gereksinimi gibi parametrelerle ikonun görünümünü dinamik olarak ayarlar.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tek ve ana bileşeni olarak tüm sorumluluğu üstlenir, gelen parametrelere göre uygun 3D ikonu render eder.
- Category3DIcon

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kategori bazlı 3D ikon gösterimi için dört parametreye bağlı olarak çalışır.

[Aksiyom 1]: Eğer `categorySlug` parametresi geçerli bir kategori tanımlayıcısı olarak sağlanmazsa, hangi kategori ikonunun gösterileceği belirlenemez ve bileşen anlamlı bir içerik üretemez.

[Aksiyom 2]: Eğer `hovered` parametresi boolean türünde bir değer olarak sağlanmazsa, ikonun üzerine gelinme durumuna bağlı görsel geçiş (hover animasyonu/stili) doğru şekilde hesaplanamaz.

[Aksiyom 3]: Eğer `isFrontCard` parametresi boolean türünde bir değer olarak sağlanmazsa, ikonun kartın ön yüzünde mi yoksa arka yüzünde mi konumlandığı bilinemez ve buna bağlı 3D perspective/rendering kararı verilemez.

[Aksiyom 4]: Eğer `shouldShowTapHint` parametresi boolean türünde bir değer olarak sağlanmazsa, dokunma ipucu göstergesinin görünür olup olmadığı belirlenemez ve kullanıcıya sunulacak etkileşim yönlendirmesi yapılamaz.

[Aksiyom 5]: Eğer fonksiyon imzasında hiç `default değer` tanımlanmamışsa, tüm parametreler调用yan taraf tarafından açıkça sağlanmalıdır; aksi halde `undefined` değerlerle çalışılması gerekir ve bileşen beklenmeyen davranış sergileyebilir.

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
- **params**: `categorySlug` — kategorinin URL dostu adı, FanRenderer'a slugs olarak geçer
- **ic_degiskenler**:
  - `meshRef` — useRef ile oluşturulmuş THREE.Group referansı, 3D sahnedeki grup elemanına erişmek için kullanılır
  - `showTapHint` — shouldShowTapHint ve hintStage === 'tap' koşullarının birleşimi, dokunma ipucunun gösterilip gösterilmeyeceğini belirler
- **Dönüş**: JSX elementi (React.ReactNode) — 3D sahne grubu ve koşullu UI hint bileşenlerini render eder

### [N2_NASIL] AST Pointer: Category3DIcon.tsx::useFrame回调
- **params**: `state` — useFrame'in sağladığı state objesi, state.clock.elapsedTime ile zaman bilgisine erişilir
- **ic_degiskenler**:
  - (parametre içinde değişken yok, doğrudan state.clock.elapsedTime kullanılır)
- **Dönüş**: yok (yan etki: meshRef.current'ın rotation.y değerini değiştirir)

### [N3_NASIL] AST Pointer: Category3DIcon.tsx::FanRenderer Kullanımı
- **params**: (parametre yok, JSX içinde çağrı)
- **ic_degiskenler**:
  - `categorySlug` — props'tan gelen değer, FanRenderer'a `slug` prop'u olarak geçer
  - `modelType` — props'tan gelen değer, FanRenderer'a `modelType` prop'u olarak geçer
- **Dönüş**: yok (yan etki: FanRenderer bileşenini render eder)

### [N4_NASIL] AST Pointer: Category3DIcon.tsx::Html Kullanımı
- **params**: (parametre yok, JSX içinde çağrı)
- **ic_degiskenler**:
  - `isFrontCard` — props'tan gelen boolean, ön kartta olup olmadığınızı kontrol eder
  - `shouldShowDragHint` — props'tan gelen boolean, sürükleme ipucunun gösterilip gösterilmeyeceğini belirler
  - `hintStage` — props'tan gelen string, ipucu aşamasını belirtir ('tap' veya 'drag')
- **Dönüş**: yok (yan etki: 3D sahne üzerine HTML overlay'leri yerleştirir)

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