---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategorySpotlightScene.tsx
skeleton_hash: 17775a239ca2a2c6
entity_hashes:
  func:CategorySpotlightScene: a7f8b134dbbbfdd7
  overview: 21fb58d1bec5fba7
  style_tokens: d4731e166286b701
generated_at: 2026-05-28T22:36:25Z
---

## Genel Bakış
CategorySpotlightScene modülü, navigasyon sisteminde belirli bir kategoriyi öne çıkaran görsel bir sahne bileşenidir. Verilen kategori slug değerine göre ilgili kategorinin içeriğini kullanıcıya sunar.

## Fonksiyon Grupları
### Bileşen Renderlama
Kategori öne çıkarma sahnesinin kullanıcı arayüzünü oluşturmak ve göstermekten sorumludur.
- CategorySpotlightScene

---

## AXIOMS – Mimari Varsayımlar

Bu modül için tanımlanan fonksiyon imzası temelinde aşağıdaki mimari varsayımlar belirlenmiştir.

---

**[Aksiyom 1 – categorySlug Zorunluluğu]:**
Eğer `categorySlug` prop'u çağrıya sağlanmazsa, bileşen `undefined` değer ile çalışır ve kategoriye ilişkin veri getirme/işleme işlemleri hatalı sonuç verebilir.

**[Aksiyom 2 – categorySlug Veri Tipi]:**
Eğer `categorySlug` prop'u bir string (URL-dostu slug formatı) yerine farklı bir tipte (örn: number, object, null) sağlanırsa, bileşenin kategori bilgisini çözümleme mantığı beklenmedik davranış gösterebilir.

**[Aksiyom 3 – Tek Prop Bağımlılığı]:**
Eğer bileşen yalnızca `categorySlug` prop'u ile besleniyorsa, bileşen içeriğinin (başlık, açıklama, görsel vb.) tamamı bu slug üzerinden ilgili kaynaktan (API, store vb.) çözümlenmek zorundadır; aksi halde boş/hatalı sahne render edilir.

---

> **Not:** Fonksiyon gövdesine erişilemediğinden, bileşen içinde gerçekleştirilen veri getirme çağrıları, hata yönetimi veya UI layout kuralları hakkında ek aksiyom üretilememiştir.

---

## FONKSİYON DETAYLARI

### CategorySpotlightScene

**Ne yapar**: CategorySpotlightScene, belirli bir kategorinin öne çıkan spot ışığı sahnesini gösteren bir React fonksiyonel bileşenidir. Bu bileşen, navigasyon yapısı içerisinde yer alır ve belirli bir kategorinin slug değerine göre ilgili kategorinin vitrin/spotlight görünümünü render eder. Kullanıcının belirli bir kategoriye odaklandığında看到mesi gereken görsel ve bağlamsal içeriği sunar.

**Nasıl yapar**: Fonksiyon, gelen categorySlug prop değerini alır ve CategorySpotlightSceneProps tipindeki özellikleri kullanarak ilgili kategorinin spotlight sahnesini oluşturur. Bileşen, kategorinin benzersiz slug tanımlayıcısını kullanarak içeriğin hangi kategoriyi temsil ettiğini belirler ve buna uygun sahne yapısını render eder. Dokümantasyon docstring'i boş bırakılmıştır, bu nedenle iç mantık hakkında ek bilgi mevcut değildir.

**Parametreler**:
- `categorySlug`: string — Kategoriyi temsil eden benzersiz URL dostu tanımlayıcı (slug). Bu değer, hangi kategorinin spotlight sahnesinin gösterileceğini belirlemek için kullanılır.

**Dönüş**: `React.FC<CategorySpotlightSceneProps>` — CategorySpotlightSceneProps tipinde özellikler alan ve React fonksiyonel bileşeni döndüren bir React bileşenidir. Dönüş tipi, bileşenin React functional component yapısında olduğunu ve CategorySpotlightSceneProps arayüzünü kabul ettiğini belirtir.

---

## INTERFACES

### CategorySpotlightSceneProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/CategorySpotlightScene.tsx::CategorySpotlightScene
- **params**: `{ categorySlug }` — render edilecek kategorinin slug değeri; Category3DIcon bileşenine prop olarak iletilir
- **ic_degiskenler**:
  (fonksiyon gövdesinde herhangi bir değişken tanımlanmamıştır; tüm değerler JSX içinde doğrudan inline kullanılmıştır)
- **Dönüş**: JSX — `div.absolute.inset-0.pointer-events-none` sarmalayıcısı içinde Three.js `Canvas` ve sahne elemanları (dört farklı ışık kaynağı, Suspense ile sarılmış Float animasyonu içinde Category3DIcon, otomatik dönen OrbitControls ve city preset'li Environment)
- **Yan etkiler**: 3D sahne otomatik döndürme (`autoRotate` @ 1.8 hız) ve yüzer animasyon (`Float` @ speed 2) içerir; `pointer-events-none` CSS class'ı ile tıklama olaylarını engeller

---

**Inline kullanım detayları (değişken değil, doğrudan JSX içi değerler)**:

- `categorySlug` — props'tan gelen kategori tanımlayıcısı; `Category3DIcon` bileşenine prop olarak aktarılır
- `Canvas camera` — position `[0, 0.15, 2.3]`, fov `40`, dpr `[1, 1.5]`
- `ambientLight` — intensity `2.2`
- `directionalLight` — position `[4, 6, 5]`, intensity `2.8`, color `"#ffffff"`
- `pointLight` — position `[-5, -2, 3]`, intensity `1.8`, color `"#8ec5ff"`
- `spotLight` — position `[0, 5, 0]`, intensity `1.5`, angle `0.5`, penumbra `1`
- `Float` — speed `2`, rotationIntensity `0.2`, floatIntensity `0.45`
- `Category3DIcon` — categorySlug `{categorySlug}`, scale `1.1`
- `OrbitControls` — enableZoom `false`, enablePan `false`, enableRotate `false`, autoRotate `true`, autoRotateSpeed `1.8`
- `Environment` — preset `"city"`
- `Suspense fallback` — `null`

---

## NODE ID STANDARD

  file: src\components\navigation\CategorySpotlightScene.tsx
  function: src\components\navigation\CategorySpotlightScene.tsx::CategorySpotlightScene

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategorySpotlightScene

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** `absolute`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `inset-0`, `pointer-events-none`