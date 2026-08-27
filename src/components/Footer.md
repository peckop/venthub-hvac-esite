---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\Footer.tsx
skeleton_hash: b13b185bbf96a807
entity_hashes:
  func:Footer: 1e0192e85e1f6373
  overview: a3368ce4cddcd9ef
  style_tokens: 266d0ec5d4b33045
generated_at: 2026-08-27T07:54:41Z
---

## Genel Bakış
Bu modül, uygulamanın altbilgi (footer) bölümünü oluşturan React fonksiyonel bileşenini tanımlar. Bileşen, çeviri desteğiyle birlikte telif hakkı metni, kategori bağlantıları ve diğer altbilgi öğelerini render eder. Kategori verisini `CategoryContext`'ten, metinleri ise `I18nProvider`'dan alır.

## Fonksiyon Grupları
### Bileşen Tanımı
Uygulamanın altbilgi bölümünü render etmekten sorumludur. `useCategories` ve `useI18n` hook'larından aldığı verileri kullanarak, `mainCategories` gibi memoize edilmiş türev veriler üretir ve bunları JSX içinde sayfa düzenine dönüştürür.
- Footer

## Bağımlılıklar
**Dış Bağımlılıklar:**
- `CategoryContext` — `useCategories` hook'u aracılığıyla global kategori listesini sağlar.
- `I18nProvider` — `useI18n` hook'u aracılığıyla çeviri fonksiyonu `t` nesnesini sağlar.
- `Routes` — Sayfa yönlendirme bağlantıları için kullanılır.
- `BuildTag` — Yapı bilgisi etiketi olarak altbilgiye eklenir.
- `Link` (next/link) — Next.js bağlantı bileşeni olarak kullanılır.
- `React` — Temel React bağımlılığı.

**Dinamik/Lazy Yüklenen Modül:**
Bilgi yok — mevcut kaynakta bu tür bir yükleme stratejisine dair bir işaret bulunmuyor.

## Mimari Notlar
- Modül tek bir fonksiyonel bileşenden oluşur; sunum katmanında yer alan basit bir UI bileşenidir.
- `mainCategories` değişkeni `React.useMemo` ile memoize edilmiştir; bu, üst bileşenin her render'ında kategori listesinin yeniden hesaplanmasını önler.
- Çeviri ve kategori verisi doğrudan context hook'larından çekilir; bileşen kendi başına veri üretmez veya depolamaz.

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
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; metinleri anahtarla çağırmak için kullanılır
  - `lang` — `useI18n()` hook'undan dönen geçerli dil kodu; `getLocalizedCategorySlug` fonksiyonuna iletilir
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rotalar objesi; `Routes.home()`, `Routes.products()`, `Routes.brands()`, `Routes.about()`, `Routes.contact()`, `Routes.destek.home()`, `Routes.destek.sss()`, `Routes.destek.iadeDegisim()`, `Routes.destek.teslimatKargo()`, `Routes.destek.garantiServis()`, `Routes.category()`, `Routes.legal.kvkk()`, `Routes.legal.mesafeliSatis()`, `Routes.legal.onBilgilendirme()`, `Routes.legal.cerez()`, `Routes.legal.gizlilik()`, `Routes.legal.kullanimKosullari()` metotları çağrılarak Link bileşenlerinin href'leri oluşturulur
  - `globalCategories` — `useCategories()` hook'undan destructure edilen kategori dizisi; `mainCategories` hesaplamasında filtrelenmek üzere kullanılır
  - `mainCategories` — `React.useMemo` ile hesaplanan, `globalCategories` dizisinden `parent_id` değeri olmayan kategorilerin ilk 8 tanesi; kategori bölümünde `.slice(0, 6)` ile altı tanesi listelenir
  - `FOOTER_ICON_ADDRESS` — adres ikonu JSX'i; iletişim bölümünde adres satırının solunda gösterilir
  - `FOOTER_ICON_PHONE` — telefon ikonu JSX'i; iletişim bölümünde telefon satırının solunda gösterilir
  - `FOOTER_ICON_MAIL` — e-posta ikonu JSX'i; iletişim bölümünde e-posta satırının solunda gösterilir
  - `WEEKDAY_HOURS` — hafta içi çalışma saatleri metni; çalışma saatleri kutusunda gösterilir
  - `SATURDAY_HOURS` — cumartesi çalışma saatleri metni; çalışma saatleri kutusunda gösterilir
  - `HVAC_SUFFIX` — alt bilgi bandında telif hakkı satırında marka adından sonra eklenen sonek metin
- **Dönüş**: JSX — `<footer>` elementi; şirket bilgisi, hızlı bağlantılar, kategoriler, iletişim bilgileri ve alt bilgi bandı içeren responsive footer düzeni

### [N2_NASIL] AST Pointer: src/components/Footer.tsx::useMemo callback
- **params**: (parametre yok; `globalCategories` dış kapsamdan erişilir)
- **ic_degiskenler**:
  - `c` — `.filter()` callback parametresi; her bir kategori nesnesini temsil eder, `c.parent_id` değeri falsy olanlar (ana kategoriler) tutulur
- **Dönüş**: Dizi — `parent_id` değeri olmayan kategorilerin en fazla 8 tanesi

### [N3_NASIL] AST Pointer: src/components/Footer.tsx::map callback (kategoriler)
- **params**:
  - `category` — dizideki tek bir kategori nesnesi; `category.slug` anahtar olarak, `getLocalizedCategorySlug(category, lang)` ile yerelleştirilmiş slug, `getCategoryDisplayName(category, t)` ile görünen ad elde edilir
- **ic_degiskenler**: (yok; `category` doğrudan JSX'te kullanılır)
- **Dönüş**: JSX — `<li>` elementi içinde `<Link>` bileşeni; `Routes.category()` ile kategori sayfasına yönlendirme sağlar

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