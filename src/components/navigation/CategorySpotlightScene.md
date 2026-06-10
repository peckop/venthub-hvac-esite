---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategorySpotlightScene.tsx
skeleton_hash: ec6f8e94c84b4af3
entity_hashes:
  func:CategorySpotlightScene: a7f8b134dbbbfdd7
  overview: 21fb58d1bec5fba7
  style_tokens: d4731e166286b701
generated_at: 2026-06-10T09:12:03Z
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