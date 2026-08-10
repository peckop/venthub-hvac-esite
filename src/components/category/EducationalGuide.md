---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\EducationalGuide.tsx
skeleton_hash: 1be5adad71edb301
entity_hashes:
  func:EducationalGuide: 062bdc9e16ff212e
  overview: b0535ec50facf114
  style_tokens: dfe57f52c58ea755
generated_at: 2026-06-19T20:47:07Z
---

## Genel Bakış
EducationalGuide, belirli bir kategori slug'ı referans alarak dinamik eğitim içeriği sunan bir React bileşenidir. Bileşen, gelen slug parametresine göre ilgili kılavuz materyalini yükler ve render ederek kullanıcıya kategoriye özel bilgilendirici bir arayüz sunar.

## Fonksiyon Grupları
### İçerik Görüntüleme
Bileşenin temel sorumluluğu, bir kategori kimliğine dayalı eğitim içeriğini alıp kullanıcıya sunmaktır.
- EducationalGuide

### Durum Yönetimi ve Hata Fallback'ı
Bileşen, geçersiz veya eksik girdi durumlarında (ör. boş slug, eşleşmeyen kategori) uygun fallback arayüzünü veya hata mesajını yöneterek uygulamanın bozulmasını önler.
- EducationalGuide

### Bileşen Arayüzü
Dışarıdan sadece `categorySlug` prop'u kabul ederek basit ve odaklı bir API sunar.
- EducationalGuide

---

## AXIOMS – Mimari Varsayımlar

Bu modül, `categorySlug` propunun dışarıdan sağlanması gerekliliğine dayanır.

[Aksiyom 1]: Eğer `categorySlug` prop'u çağrılmazsa, bileşen undefined bir değer ile çalışır ve beklenmeyen davranış oluşur.

---

## FONKSİYON DETAYLARI

### EducationalGuide
**Ne yapar**: EducationalGuide bileşeni, verilen `categorySlug` özelliğine göre bir eğitim kılavuzu görüntüler.  
**Nasıl yapar**: Bileşen, `categorySlug` prop'ını alır ve bu slug'u kullanarak ilgili eğitim içeriğini seçer veya render eder; iç mantık docstring'te belirtilmemiş olsa da, slug'a dayalı içerik gösterimini sağlar.  
**Parametreler**:  
- categorySlug: string — Eğitim kılavuzunun hangi kategoriye ait olduğunu belirten slug değeri.  
**Dönüş**: React.FC<EducationalGuideProps> — `categorySlug` prop'ını kabul eden ve JSX döndüren bir React fonksiyon bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::CheckCircle2
- import: lucide-react::Sun
- import: lucide-react::Wind
- import: react::React

---

## INTERFACES

### EducationalGuideProps
- `categorySlug: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: EducationalGuide.tsx::EducationalGuide
- **params**: `(categorySlug)` — kategori slug'ı, hangi kategorinin görüntüleneceğini belirler (örn: 'hava-perde')
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'unun return değerinden destructuring ile alınan çeviri fonksiyonu; JSX içinde `t('category.whichAirCurtain')`, `t('category.airCurtainHelper')`, `t('category.ambientAir')`, `t('category.ambientAirDesc')`, `t('category.ambientPoint1')`, `t('category.ambientPoint2')`, `t('category.ambientPoint3')`, `t('category.electricHeated')`, `t('category.electricHeatedDesc')`, `t('category.electricPoint1')`, `t('category.electricPoint2')`, `t('category.electricPoint3')` çağrılarıyla kullanılır
- **Dönüş**: `null | JSX.Element` — `categorySlug` `'hava-perde'` içermiyorsa `null`, içeriyorsa educational guide JSX'i döner
- **Yan etkiler**: Yok (sunucu tarafı etkisi yok, sadece render)

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