---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\CategoryFilters.tsx
skeleton_hash: 287ab9b1b75d703c
entity_hashes:
  func:CategoryFilters: 420d76bf670f1cf8
  func:toggleBrand: 67afbe53ea415719
  overview: e7958b385edc9e41
  style_tokens: 15f8a6328e78c6bf
generated_at: 2026-05-27T11:45:31Z
---

## Genel Bakış
`CategoryFilters` bileşeni, ürün kategorileri, alt‑kategoriler ve marka seçenekleri üzerinden filtreleme arayüzünü sunar. Kullanıcı etkileşimlerini (ör. marka seçimi) yönetmek için yardımcı fonksiyonlar içerir.

## Fonksiyon Grupları
### UI Oluşturma
Bu grup, filtre panelinin görsel yapısını ve ilgili props’ları alarak JSX döndürmekle sorumludur.  
- CategoryFilters

### Etkileşim ve Durum Yönetimi
Kullanıcı eylemlerini yakalar, ilgili filtre durumunu günceller ve UI’nın yeniden render edilmesini tetikler.  
- toggleBrand  

*İlişki:* `CategoryFilters` içinde, marka seçimi olayına yanıt olarak `toggleBrand` çağrılır.

---

## AXIOMS – Mimari Varsayımlar
Bu CategoryFilters React componenti, kategori ve marka bazlı ürün filtreleme arayüzünün sorunsuz çalışması için parent component'ten iletilen tüm zorunlu prop ve fonksiyonların eksiksiz ve doğru şekilde iletilmesine bağlıdır.

[Aksiyom 1]: Eğer component'e iletilen `category` prop'u yoksa, ana kategori bazlı filtreleme arayüzü doğru şekilde başlatılamaz, tüm filtreleme işlemleri geçersiz kalır.
[Aksiyom 2]: Eğer component'e iletilen `parentCategory` prop'u yoksa, kategori hiyerarşisine dayalı ilişkilendirme yapılamaz, alt kategori filtreleri üst kategori ile eşleştirilemez.
[Aksiyom 3]: Eğer component'e iletilen `subCategories` prop'u yoksa, alt kategori seçenekleri kullanıcıya sunulamaz, alt kategoriye özel filtreleme işlemleri gerçekleştirilemez.
[Aksiyom 4]: Eğer component'e iletilen `availableBrands` prop'u yoksa, marka bazlı filtre seçenekleri ekranda gösterilemez, marka seçimi ve filtreleme işlemleri yapılamaz.
[Aksiyom 5]: Eğer marka seçimini yöneten `toggleBrand` fonksiyonu component'e iletilmemişse, kullanıcı marka filtresi ekleme/çıkarma işlemleri yapamaz, filtre state'i hiçbir şekilde güncellenemez.
[Aksiyom 6]: Eğer component'e iletilen mevcut aktif filtreleri tutan `filte` prop'u yoksa, kullanıcının daha önce seçtiği filtreler arayüze yüklenemez, filtre arayüzü varsayılan boş state ile başlatılamaz.

---

## FONKSİYON DETAYLARI

### CategoryFilters
**Ne yapar**: React bileşeni olarak kategori filtreleme arayüzünü oluşturur.  
**Nasıl yapar**: Gelen props (category, parentCategory, subCategories, availableBrands, filte) üzerinden filtre seçeneklerini render eder ve kullanıcı etkileşimlerini yönetir.  
**Parametreler**:
- category: unknown — seçili ana kategori
- parentCategory: unknown — üst kategori bilgisi
- subCategories: unknown — alt kategori listesi
- availableBrands: unknown — kullanılabilir marka listesi
- filte: unknown — filtreleme ile ilgili ek veri (isim hatalı olabilir)  
**Dönüş**: React.FC&lt;CategoryFiltersProps&gt; — bir fonksiyonel React bileşeni

### toggleBrand
**Ne yapar**: Belirtilen markayı filtreleme durumuna ekler veya kaldırır.  
**Nasıl yapar**: Çağrıldığı anda `brand` parametresiyle birlikte bir kapanış (closure) içinde `toggleBrand` fonksiyonunu çalıştırır.  
**Parametreler**:
- brand: string — filtreleme işlemi yapılacak marka adı  
**Dönüş**: Bilinmiyor — fonksiyonun dönüş tipi belirtilmemiştir.

---

## INTERFACES

### CategoryFiltersProps
- `category: DomainCategory`
- `parentCategory?: DomainCategory | null`
- `subCategories: DomainCategory[]`
- `availableBrands: string[]`
- `filters: FilterState`
- `onUpdateFilters: (updates: Partial<FilterState>) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/CategoryFilters.tsx::CategoryFilters
- **params**: `category`, `parentCategory`, `subCategories`, `availableBrands`, `filters`, `onUpdateFilters`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook’den dönen çeviri fonksiyonu, metinleri yerelleştirmek için kullanılır.
  - `lang` — `useI18n()` hook’den dönen dil kodu, para birimi formatlamada (`formatCurrency`) kullanılır.
  - `toggleBrand` — iç fonksiyon, bir markanın seçili olup olmadığını tersine çevirir ve `onUpdateFilters` aracılığıyla filtre durumunu günceller.
- **Dönüş**: React bileşeni JSX döner; yan etkisi yoktur, sadece UI render eder.

### [N2_NASIL] AST Pointer: src/components/category/CategoryFilters.tsx::toggleBrand
- **params**: `brand` (string) — seçilen/çıkartılan marka adı.
- **ic_degiskenler**:
  - `filters` — dışarıdan gelen filtre durumu, `selectedBrands` dizisini içerir.
  - `onUpdateFilters` — dışarıdan gelen callback, filtre durumunu günceller.
- **Dönüş**: `yok` (fonksiyon bir değer döndürmez, sadece `onUpdateFilters` çağrısı yapar).

---

## NODE ID STANDARD

  file: src\components\category\CategoryFilters.tsx
  function: src\components\category\CategoryFilters.tsx::CategoryFilters
  function: src\components\category\CategoryFilters.tsx::toggleBrand

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryFilters

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `accent-primary-ocean`, `bg-slate-50`, `bg-white`, `border-b`, `border-slate-100`, `border-slate-200`, `border-slate-300`, `text-primary-ocean`, `text-slate-300`, `text-slate-400`, `text-slate-500`, `text-slate-600`, `text-slate-900`, `text-sm`, `text-white`
- **Layout:** `absolute`, `block`, `custom-scrollbar`, `flex`, `gap-2`, `gap-3`, `group-hover:text-slate-900`, `h-3`, `h-5`, `items-center`, `justify-between`, `justify-center`, `max-h-48`, `overflow-y-auto`, `p-6`
- **Responsive:** (yok)