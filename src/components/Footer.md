---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-altyapi\src\components\Footer.tsx
skeleton_hash: 27f9b1bbde2c4c97
entity_hashes:
  func:Footer: 1e0192e85e1f6373
  overview: a3368ce4cddcd9ef
  style_tokens: 266d0ec5d4b33045
generated_at: 2026-08-18T07:05:55Z
---

## Genel Bakış
Bu modül, uygulamanın altbilgi (footer) bölümünü render eden tek bir React fonksiyonel bileşeni tanımlar. Bileşen, kategori navigasyonu, çeviri desteği ve telif hakkı bilgilerini içeren bir altbilgi yapısı sunar. Next.js Link bileşeni ve verschiedene context hook'ları kullanarak dinamik bir yapı oluşturulmuştur.

## Fonksiyon Grupları
### Bileşen Tanımı
Footer bileşeninin tanımlanması ve dışa aktarılması sorumluluğundadır. Tek bir işlevsel bileşen olarak modülün tüm sorumluluğunu üstlenir.
- Footer

---

## Mimari Notlar

**Dış Bağımlılıklar:**
- `CategoryContext` — Kategori verilerini sağlayan context
- `I18nProvider` — Çoklu dil desteği için çeviri fonksiyonu
- `Routes` — Uygulama içi rota tanımları
- `BuildTag` — Sürüm veya yapı bilgisi gösterimi

**Dahili Veri Akışı:**
- `useI18n` hook'u ile çeviri fonksiyonu (`t`) alınır
- `useCategories` hook'u ile tüm kategoriler yüklenir
- Kategoriler `React.useMemo` ile filtrelenerek `mainCategories` elde edilir (performans optimizasyonu)

**Mimari Önemi:**
Düşük karmaşıklığa sahip, izole bir presentasyon bileşenidir. Herhangi bir state yönetimi veya karmaşık iş mantığı içermez; sadece veriyi alıp görsel olarak sunar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### Footer
**Ne yapar**: Uygulamanın altbilgi (footer) bölümünü render eden bir React fonksiyonel bileşeni tanımlar.  
**Nasıl yapar**: Fonksiyon içindeki JSX döndürerek, genellikle telif hakkı metni, sosyal medya linkleri ve diğer altbilgi öğelerini içerir; bu JSX, React tarafından DOM'a monte edilerek görüntülenir.  
**Parametreler**: Yok  
**Dönüş**: React.FC türünde bir fonksiyonel bileşen; bu bileşen render edildiğinde footer JSX'ini döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../contexts/CategoryContext::useCategories
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../utils/categoryHelpers::getCategoryDisplayName
- import: ../utils/categoryHelpers::getLocalizedCategorySlug
- import: ./BuildTag::BuildTag
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/Footer.tsx::Footer
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu; tüm UI metinlerini lokalize eder (ör. `t('header.brandName')`)
  - `lang` — useI18n hook'undan dönen aktif dil kodu (ör. `'tr'`, `'en'`); `getLocalizedCategorySlug`'a geçirilir
  - `Routes` — useLocalizedRoutes hook'undan dönen lokalize rota üretici nesne; `Routes.home()`, `Routes.products()`, `Routes.brands()`, `Routes.about()`, `Routes.contact()`, `Routes.destek.home()`, `Routes.destek.sss()`, `Routes.destek.iadeDegisim()`, `Routes.destek.teslimatKargo()`, `Routes.destek.garantiServis()`, `Routes.category(slug)`, `Routes.legal.kvkk()`, `Routes.legal.mesafeliSatis()`, `Routes.legal.onBilgilendirme()`, `Routes.legal.cerez()`, `Routes.legal.gizlilik()`, `Routes.legal.kullanimKosulları()` methodlarıyla kullanılır
  - `globalCategories` — useCategories hook'undan dönen tüm kategoriler dizisi; useMemo callback'ine bağımlılık olarak verilir
  - `mainCategories` — `globalCategories` içinden `parent_id`'si olmayan ilk 8 kategoriyi içeren `React.useMemo` ile memoize edilmiş dizi; Categories bölümünde ve `slice(0, 6)` ile alt kategori listesinde kullanılır
  - `new Date().getFullYear()` — JS Date nesnesi ile mevcut yılın alınması; telif hakkı satırında kullanılır
- **Referans verilen dış sabitler**: `FOOTER_ICON_ADDRESS`, `FOOTER_ICON_PHONE`, `FOOTER_ICON_MAIL`, `WEEKDAY_HOURS`, `SATURDAY_HOURS`, `HVAC_SUFFIX` — fonksiyon gövdesinde JSX içinde doğrudan referans verilen, dışarıdan import edilmiş sabit değerler
- **Dönüş**: JSX (`<footer>` elemanı — site alt bilgi bölümünü render eden React bileşeni)

### [N2_NASIL] AST Pointer: src/components/Footer.tsx::Footer/useMemo-callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - (yok — `globalCategories` dışarıdan闭包 ile erişilir)
- **Dönüş**: `Array` — `globalCategories` dizisi içinden `!c.parent_id` filtresi uygulanmış, ilk 8 elemana `slice(0, 8)` ile kırpılmış kategori alt kümesi

### [N3_NASIL] AST Pointer: src/components/Footer.tsx::Footer/map-callback
- **params**: `category` — `mainCategories.slice(0, 6)` dizisi üzerinde `.map()` ile iterasyon sırasında alınan tek bir kategori nesnesi; `category.slug` ve `category.parent_id` alanlarına erişilir
- **ic_degiskenler**:
  - (yok — `Routes`, `lang`, `t` dışarıdan闭包 ile erişilir)
- **Dönüş**: JSX (`<li>` elemanı — tek bir kategori için lokalize edilmiş slug ile link içeren liste öğesi; `getLocalizedCategorySlug(category, lang)` ve `getCategoryDisplayName(category, t)` yardımcı fonksiyonları çağrılarak URL ve display adı üretilir)

---

## NODE ID STANDARD

  file: src\components\Footer.tsx
  function: src\components\Footer.tsx::Footer

---

## DISA AKTARILANLAR (EXPORTS)
  export: Footer

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-industrial-gray`, `bg-primary-navy`, `bg-white/5`, `border-steel-gray`, `border-t`, `hover:text-secondary-blue`, `hover:text-white`, `selection:bg-white/20`, `selection:text-white`, `text-gray-300`, `text-lg`, `text-secondary-blue`, `text-sm`, `text-white`, `text-xl`
- **Layout:** `flex`, `flex-col`, `flex-shrink-0`, `flex-wrap`, `gap-8`, `gap-x-6`, `gap-y-2`, `grid`, `grid-cols-1`, `items-center`, `items-start`, `justify-between`, `justify-center`, `lg:grid-cols-4`, `max-w-7xl`
- **Varyant/Responsive:** `hover:`, `lg:`, `md:`, `selection:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `font-bold`, `font-medium`, `font-semibold`, `leading-relaxed`, `lg:px-8`, `mb-2`, `mb-4`, `md:space-y-0`, `mt-1`, `mt-4`, `mx-auto`, `px-4`, `py-12`, `py-6`, `rounded-lg`