---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategorySpotlightScene.tsx
skeleton_hash: b4baf1a923aef1b1
entity_hashes:
  func:CategorySpotlightScene: a7f8b134dbbbfdd7
  overview: f87b88559127da21
  style_tokens: d4731e166286b701
generated_at: 2026-06-11T16:14:30Z
---

## Genel Bakış
Bu modül, navigasyon sistemi içinde belirli bir kategoriyi öne çıkaran görsel bir vitrin bileşeni olarak görev yapar. Temel sorumluluğu, gelen `categorySlug` değerine göre ilgili kategorinin benzersiz sahne yapısını ve içeriğini kullanıcıya sunmaktır.

## Fonksiyon Grupları
### Bileşen Renderlama
Bu grup, belirli bir kategorinin öne çıkan sahnesinin kullanıcı arayüzünü oluşturmak ve sayfada göstermekten sorumludur.
- CategorySpotlightScene

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon imzası temelinde aşağıdaki mimari varsayımlar belirlenmiştir.

---

[Aksiyom 1]: Eğer `categorySlug` parametresi传递edilmezse, bileşen doğru bir kategori gösterimi yapamaz ve hatalı veya boş bir sahne oluşturulur.

[Aksiyom 2]: Eğer `categorySlug` geçerli bir kategori tanımlayıcısı (slug formatında) içermiyorsa, bileşen ilgili kategoriyi bulamaz ve beklenmeyen bir durum oluşur.

---

**Not:** Bu modül için fonksiyon imzasında belirtilen `categorySlug` parametresi dışında varsayılan değer veya opsiyonel parametre bulunmamaktadır. Bileşenin iç render mantığı, API çağrıları veya hata yönetim mekanizmaları fonksiyon imzasından çıkarılamamıştır.

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

### [N1_NASIL] AST Pointer: CategorySpotlightScene.tsx::CategorySpotlightScene
- **params**: (categorySlug) — Kategori slug'ı, Category3DIcon bileşenine prop olarak geçirilir
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX (React bileşeni) — 3D sahne ve içinde yüzen bir kategori ikonu

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