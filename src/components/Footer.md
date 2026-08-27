---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\Footer.tsx
skeleton_hash: 9e3c24656b757e33
entity_hashes:
  func:Footer: 1e0192e85e1f6373
  overview: a3368ce4cddcd9ef
  style_tokens: 266d0ec5d4b33045
generated_at: 2026-08-27T13:06:02Z
---

## Genel Bakış
Bu modül, uygulamanın alt kısmında görünecek olan Footer bileşenini tanımlar. Tek bir fonksiyonel bileşen olarak uygulanmış olup, uluslararasılaştırma desteği, kategori verileri ve yönlendirme bilgileriyle birlikte altbilgi içeriğini render eder.

## Fonksiyon Grupları
### Bileşen Tanımı
Footer bileşeninin oluşturulması ve dışa aktarılması sorumluluğundadır. Uluslararasılaştırma hook'u ile çeviri desteği sağlar, kategori context'inden veri çeker ve Next.js Link bileşenini kullanarak yönlendirmeleri yönetir.
- Footer

## Bağımlılıklar
### Dış Bağımlılıklar
- `useCategories` — CategoryContext'ten alınan kategori verileri, footer içindeki kategori listesi ve bölümlerde kaynak olarak kullanılır
- `useI18n` — I18nProvider'dan gelen `t` çeviri fonksiyonu, footer üzerindeki tüm metinlerin uluslararasılaştırılması için kullanılır
- `Routes` — utils/routes modülünden alınan yönlendirme tanımları
- `Link` — Next.js bağlantı bileşeni
- `React` — temel React kütüphanesi

### İç Bağımlılıklar
- `BuildTag` — footer içinde kullanılan alt bileşen

### Mimari Notlar
- Dinamik veya lazy yükleme bilgisi mevcut değil
- `mainCategories` değişkeni `React.useMemo` ile memoize edilmiş olup `parent_id` alanına göre filtrelenmiş kategorileri tutar; bu sayede gereksiz yeniden render'lar önlenir

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
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, footer metinlerini yerelleştirmek için kullanılır
  - `lang` — useI18n hook'undan dönen dil kodu, kategori slug'larının yerelleştirilmesinde kullanılır
  - `Routes` — useLocalizedRoutes hook'undan dönen rotalar objesi; Routes.home(), Routes.products(), Routes.brands(), Routes.about(), Routes.contact(), Routes.destek.home(), Routes.destek.sss(), Routes.destek.iadeDegisim(), Routes.destek.teslimatKargo(), Routes.destek.garantiServis(), Routes.category(), Routes.legal.kvkk(), Routes.legal.mesafeliSatis(), Routes.legal.onBilgilendirme(), Routes.legal.cerez(), Routes.legal.gizlilik(), Routes.legal.kullanimKosullari() metodları Link href'lerinde kullanılır
  - `globalCategories` — useCategories hook'undan destructure edilen kategoriler dizisi (`categories` olarak alınıp `globalCategories` adıyla kullanılır)
  - `mainCategories` — useMemo ile hesaplanan, parent_id'si olmayan üst kategorilerin ilk 8 tanesi; kategori listesi bölümünde .slice(0, 6) ile ilk 6'sı render edilir
  - `FOOTER_ICON_ADDRESS` — adres ikonu, iletişim bilgileri bölümünde kullanılır
  - `FOOTER_ICON_PHONE` — telefon ikonu, iletişim bilgileri bölümünde kullanılır
  - `FOOTER_ICON_MAIL` — e-posta ikonu, iletişim bilgileri bölümünde kullanılır
  - `WEEKDAY_HOURS` — hafta içi çalışma saatleri metni, çalışma saatleri kutusunda kullanılır
  - `SATURDAY_HOURS` — cumartesi çalışma saatleri metni, çalışma saatleri kutusunda kullanılır
  - `HVAC_SUFFIX` — telif hakkı satırında `new Date().getFullYear()` ile birlikte kullanılan son ek metni
- **Dönüş**: React.FC (footer JSX elementi)

### [N2_NASIL] AST Pointer: src/components/Footer.tsx::useMemo callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `c` — globalCategories dizisindeki her bir kategori objesi; `c.parent_id` değeri falsy olanlar filtrelenir
- **Dönüş**: Kategori dizisi (parent_id'si olmayan ilk 8 kategori)

### [N3_NASIL] AST Pointer: src/components/Footer.tsx::map callback
- **params**: `category` — mainCategories.slice(0, 6) dizisindeki her bir kategori objesi
- **ic_degiskenler**:
  - `category.slug` — kategorinin benzersiz slug'ı, li elementinin key prop'u olarak kullanılır
  - `Routes.category()` — kategori sayfasına yönlendiren rota fonksiyonu, href prop'unda kullanılır
  - `getLocalizedCategorySlug(category, lang)` — kategori slug'ının dile göre yerelleştirilmiş hali, Routes.category() parametresi olarak kullanılır
  - `getCategoryDisplayName(category, t)` — kategorinin dile göre görünen adı, Link içeriği olarak kullanılır
  - `lang` — closure'dan gelen dil kodu, getLocalizedCategorySlug fonksiyonuna parametre olarak geçilir
  - `t` — closure'dan gelen çeviri fonksiyonu, getCategoryDisplayName fonksiyonuna parametre olarak geçilir
- **Dönüş**: JSX (li elementi içinde Link bileşeni)

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