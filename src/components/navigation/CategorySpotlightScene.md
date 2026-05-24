---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategorySpotlightScene.tsx
skeleton_hash: 17775a239ca2a2c6
generated_at: 2026-05-23T22:14:27Z
---

## Genel Bakış
Bu modül, bir kategori öne çıkarma sahnesini gösteren bir React bileşenidir. Kategori bilgilerini alarak görsel ve metinsel içeriği düzenler, kullanıcıya ilgili kategoriyi vurgulamak için gerekli düzeni sağlar.

## Fonksiyon Grupları
### Bileşen Renderlama
Kullanıcı arayüzünde kategori öne çıkarma sahnesini oluşturmak ve güncellemekten sorumludur.
- CategorySpotlightScene

---

## AXIOMS – Mimari Varsayımlar
CategorySpotlightScene componentunun doğru çalışabilmesi için categorySlug propunun sağlanması gerekir.

[Aksiyom 1]: Eğer categorySlug prop'u sağlanmazsa, component içinde categorySlug tanımsız olur ve kullanımda hata oluşabilir.

---

## FONKSIYON DETAYLARI

### CategorySpotlightScene
**Ne yapar**: CategorySpotlightScene adlı fonksiyon, bir React fonksiyonel bileşeni tanımlar ve verilen `categorySlug` özelliğine göre bir kategori öne çıkarma sahnesini render eder.  
**Nasıl yapar**: Fonksiyon, parametre olarak gelen nesneden `categorySlug` değerini destructuring ile alır ve bu değeri iç bileşenlerde veya veri çekme mantığında kullanarak ilgili kategoriye ait içeriği gösteren JSX döndürür.  
**Parametreler**:
- categorySlug: string — Hangi kategorinin öne çıkarılacağını belirten slug (kısa, URL‑dostu) değeri.  
**Dönüş**: React.FC<CategorySpotlightSceneProps> — `categorySlug` özelliğini kabul eden ve JSX döndüren bir React fonksiyonel bileşeni.

---

## INTERFACES

### CategorySpotlightSceneProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/navigation/CategorySpotlightScene.tsx::CategorySpotlightScene
- **params**: categorySlug
- **ic_degiskenler**: yok
- **Dönüş**: JSX element (React.FC)

---

## NODE ID STANDARD

  file: src\components\navigation\CategorySpotlightScene.tsx
  function: src\components\navigation\CategorySpotlightScene.tsx::CategorySpotlightScene

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategorySpotlightScene