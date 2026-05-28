---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\EducationalGuide.tsx
skeleton_hash: 7e846c4ac4505192
entity_hashes:
  func:EducationalGuide: 062bdc9e16ff212e
  overview: 6548521c92a45ec1
  style_tokens: dfe57f52c58ea755
generated_at: 2026-05-28T22:35:45Z
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

## FONKSİYON DETAYLARI

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

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-blue-50`, `bg-gray-50`, `bg-orange-50`, `bg-white`, `border-gray-100`, `border-y`, `hover:border-orange-500/50`, `hover:border-secondary-blue/50`, `text-2xl`, `text-center`, `text-gray-600`, `text-gray-700`, `text-green-500`, `text-industrial-gray`, `text-orange-500`
- **Layout:** `absolute`, `flex`, `flex-shrink-0`, `gap-8`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `max-w-4xl`, `max-w-7xl`, `md:grid-cols-2`, `min-h-12`, `overflow-hidden`, `p-3`, `p-4`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `group`, `group-hover:opacity-20`, `lg:px-8`, `mb-10`, `mb-2`, `mb-6`, `mr-2`, `mt-0.5`, `mx-auto`, `opacity-10`, `px-4`, `py-12`, `rounded-lg`