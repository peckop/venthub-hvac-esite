---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\EducationalGuide.tsx
skeleton_hash: 7e846c4ac4505192
generated_at: 2026-05-23T21:57:57Z
---

## Genel Bakış
EducationalGuide, belirli bir kategori slug'ına göre eğitim içeriğini gösteren bir React bileşenidir. Bu bileşen, kategori bazlı öğretici materyalleri dinamik olarak yükleyip kullanıcıya sunar.

## Fonksiyon Grupları
### Bileşen Tanımı
Bileşenin ana yapısını ve dışarıdan gelen veriyi işleyen fonksiyondur.
- EducationalGuide

---

## AXIOMS – Mimari Varsayımlar
Bu modül, `categorySlug` propunun mevcut ve geçerli bir string olduğu varsayımına dayanır.

[Aksiyom 1]: Eğer `categorySlug` prop'u sağlanmazsa, component undefined hatasıyla render edilmeye çalışır ve UI bozulur.  
[Aksiyom 2]: Eğer `categorySlug` boş bir string ise, component herhangi bir eğitim içeriği göstermez ve boş bir alan render eder.  
[Aksiyom 3]: Eğer `categorySlug` mevcut bir kategori ile eşleşmezse, component veri bulunamadı durumunu gösterir (fallback mesajı veya yükleme hatası).

---

## FONKSIYON DETAYLARI

### EducationalGuide
**Ne yapar**: EducationalGuide bileşeni, verilen `categorySlug` özelliğine göre bir eğitim kılavuzu görüntüler.  
**Nasıl yapar**: Bileşen, `categorySlug` prop'ını alır ve bu slug'u kullanarak ilgili eğitim içeriğini seçer veya render eder; iç mantık docstring'te belirtilmemiş olsa da, slug'a dayalı içerik gösterimini sağlar.  
**Parametreler**:  
- categorySlug: string — Eğitim kılavuzunun hangi kategoriye ait olduğunu belirten slug değeri.  
**Dönüş**: React.FC<EducationalGuideProps> — `categorySlug` prop'ını kabul eden ve JSX döndüren bir React fonksiyon bileşeni.

---

## INTERFACES

### EducationalGuideProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/EducationalGuide.tsx::EducationalGuide
- **params**: (categorySlug)
- **ic_degiskenler**: 
  - `t` — translation function obtained from `useI18n()` hook, used to retrieve localized strings for UI labels and descriptions
- **Dönüş**: JSX.Element | null (returns null when categorySlug does not contain 'hava-perde', otherwise returns the JSX element representing the guide)

---

## NODE ID STANDARD

  file: src\components\category\EducationalGuide.tsx
  function: src\components\category\EducationalGuide.tsx::EducationalGuide

---

## DISA AKTARILANLAR (EXPORTS)
  export: EducationalGuide