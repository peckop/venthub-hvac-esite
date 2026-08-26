---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useCategoryViewModel.ts
skeleton_hash: 2a3d750598e1d2ce
entity_hashes:
  func:useCategoryViewModel: f906bfd41f78277c
  overview: 9ffb86ff262e790b
generated_at: 2026-08-24T12:44:12Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kategori yönetimini merkezi olarak kontrol eden bir React hook modülüdür. Kullanıcı arayüzü ile veri katmanı arasında köprü kurarak kategori verilerinin durumunu, iş mantığını ve bileşenlerin kullanabileceği dönüştürülmüş veri yapılarını tutarlı bir arayüzde sunar.

## Fonksiyon Grupları
### Kategori ViewModel Hook'u
Kategori ve ürün verilerinin UI katmanına uygun hale getirilmesi için gerekli durum takibini, veri hazırlama mantığını (örneğin kategori sarmalama ve ürün gruplandırma) ve bu işlevleri dışa açan ana hook yapısıdır.
- useCategoryViewModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### useCategoryViewModel

**Ne yapar**: UI katmanı için tek doğru kaynak (single source of truth) görevi gören gelişmiş bir React ViewModel hook'udur. Ham `DomainCategory` nesnelerini tam teşekküllü `CategoryViewModel` nesnelerine dönüştüren, önbelleğe alınmış (memoized) bir `wrapCategory` fonksiyonu sağlar. Yerelleştirme (localization), metadata yedek değerleri ve görünüm modu çözümleme işlemlerini yönetir.

**Nasıl yapar**: Hook içinde `useI18n()` çağrısı yapılarak `t` (çeviri fonksiyonu) ve `lang` (geçerli dil) değerleri elde edilir. Ardından `useMemo` ile sarılmış `wrapCategory` fonksiyonu oluşturulur; bu fonksiyon `t` veya `lang` değiştiğinde yeniden hesaplanır. `wrapCategory` fonksiyonu çalıştırıldığında önce `mapCategoryWithLocale` ile kategori verisi geçerli dile göre yerelleştirilir. Sonrasında i18n çözümleme adımı uygulanır: `translation_key` (veya yedek olarak `slug`) değeri kullanılarak `common.categoryList.${tKey}` çeviri yolu üzerinden `t` fonksiyonu ile çevrilmiş ad aranır. Çeviri başarısız olursa (yani dönen değer çeviri yoluyla aynıysa veya boşsa) `menu_label` veya `name` alanına düşülür. Pazarlama başlığı (`marketingTitle`) için `marketing_title` alanı varsa kullanılır, yoksa `displayName` değerine düşülür. Görünüm modu (`displayMode`) çözümlemesinde öncelik sırası şöyledir: 1) veritabanı satırındaki `display_mode` sütunu, 2) metadata JSON içindeki `display_mode` alanı (legacy), 3) varsayılan değer `'series'`. `'grid'` değeri eski bir yedek değer olarak `'series'`'e eşlenir; `'showcase'` ve `'landing'` değerleri ise doğrudan kabul edilir.

**Parametreler**: Yok. Bu bir React hook'udur ve dışarıdan parametre almaz.

**Dönüş**: `{ wrapCategory }` — İçinde `wrapCategory` fonksiyonunu barındıran bir nesne döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../i18n/I18nProvider::useI18n
- import: ../lib/type-converters::DomainCategory
- import: ../lib/type-converters::mapCategoryWithLocale
- import: ../types/db-rows::type { DbCategory }
- import: react::useMemo

---

## INTERFACES

### CategoryViewModel
- `id: string`
- `slug: string`
- `displayName: string`
- `marketingTitle: string`
- `description: string`
- `imageUrl: string | null`
- `parentId: string | null`
- `level: number`
- `displayMode: 'showcase' | 'landing' | 'series' | 'grid'`
- `raw: DomainCategory`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useCategoryViewModel.ts::useCategoryViewModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; i18n anahtarlarını çözümlemek için kullanılır
  - `lang` — `useI18n()` hook'undan destructure edilen mevcut dil kodu; `mapCategoryWithLocale` fonksiyonuna iletilir
  - `wrapCategory` — `useMemo` ile sarılmış fonksiyon; `category` parametresini alıp `CategoryViewModel` nesnesine dönüştürür. Bağımlılık dizisi `[t, lang]` olarak tanımlıdır; `t` veya `lang` değiştiğinde yeniden hesaplanır
- **Dönüş**: `{ wrapCategory }` — tek bir `wrapCategory` fonksiyonu içeren nesne

### [N2_NASIL] AST Pointer: src/hooks/useCategoryViewModel.ts::useCategoryViewModel::wrapCategory (useMemo içindeki fonksiyon)
- **params**: `category` — `DomainCategory | null | undefined` tipinde; dönüştürülecek kategori verisi. `null` veya `undefined` ise doğrudan `null` döner
- **ic_degiskenler**:
  - `localizedCategory` — `mapCategoryWithLocale(category as DbCategory, lang)` çağrısının sonucu; mevcut dile göre yerelleştirilmiş kategori nesnesi. `category` parametresi `DbCategory` tipine cast edilerek `lang` ile birlikte iletilir
  - `tKey` — `localizedCategory.translation_key || localizedCategory.slug` ifadesinin sonucu; çeviri anahtarı olarak kullanılır. `translation_key` yoksa `slug` değerine düşülür
  - `translationPath` — `` `common.categoryList.${tKey}` `` template literal; i18n çeviri dosyasındaki tam yol
  - `translatedName` — `t(translationPath)` çağrısının sonucu; çeviri çözümleme sonucu. Çeviri bulunamazsa `translationPath` string'inin kendisi döner
  - `displayName` — görüntülenecek kategori adı. `translatedName` varsa ve `translationPath`'e eşit değilse (çeviri başarılıysa) `translatedName` kullanılır; aksi halde `localizedCategory.menu_label` veya `localizedCategory.name` değerine düşülür
  - `marketingTitle` — pazarlama başlığı. `localizedCategory.marketing_title` varsa onu kullanır; yoksa `displayName` değerine düşülür
  - `meta` — `localizedCategory.metadata` alanı; eğer mevcut ve tipi `object` ise `Record<string, unknown>` olarak cast edilir. Aksi halde boş nesne `{}` atanır
  - `displayMode` — kategori görüntüleme modu. Varsayılan değer `'series'`. `rawDisplayMode` değerine göre güncellenir: `'showcase'` veya `'landing'` ise doğrudan atanır; `'grid'` ise `'series'`'e düşülür (legacy uyumluluk)
  - `rawDisplayMode` — `localizedCategory.display_mode || meta.display_mode` ifadesinin sonucu; ham görüntüleme modu değeri. Önce DB kolonu (`display_mode`), yoksa metadata JSON içindeki `display_mode` alanı kullanılır
- **Dönüş**: `CategoryViewModel | null` — aşağıdaki alanları içeren nesne veya `null`:
  - `id` — `localizedCategory.id`
  - `slug` — `localizedCategory.slug`
  - `displayName` — çözümlenmiş görüntülenecek ad
  - `marketingTitle` — pazarlama başlığı
  - `description` — `localizedCategory.description` veya boş string `''`
  - `imageUrl` — `localizedCategory.image_url`
  - `parentId` — `localizedCategory.parent_id`
  - `level` — `localizedCategory.level` veya `0`
  - `displayMode` — çözümlenmiş görüntüleme modu (`'series'` | `'showcase'` | `'landing'`)
  - `raw` — orijinal `localizedCategory` nesnesi

---

## NODE ID STANDARD

  file: src\hooks\useCategoryViewModel.ts
  function: src\hooks\useCategoryViewModel.ts::useCategoryViewModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryViewModel
  export: useCategoryViewModel