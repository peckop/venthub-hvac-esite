---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategoryCard3D.tsx
skeleton_hash: f17e0737e0e8d2d0
entity_hashes:
  func:CategoryCard3D: b1d42c0fbbe60533
  overview: 2e866ae94b876181
  style_tokens: 72417c9ee963573b
generated_at: 2026-06-14T22:18:53Z
---

## Genel Bakış
`CategoryCard3D`, HVAC ürün kategorilerini üç boyutlu animasyonlu bir kart olarak sunan bir React bileşenidir. Bu bileşen, Category Hub navigasyon arayüzünde kategori isimlerini ve alt kategori sayılarını görsel olarak keşfetmeyi sağlar; üzerine tıklanmasıyla ilgili kategori sayfasına geçiş yapan etkileşimli bir navigasyon deneyimi sunar.

## Fonksiyon Grupları
### Kategori Kartı Bileşeni
Bileşen, gelen kategori verisini ve etkileşim işleyicisini alarak 3D animasyonlu bir arayüze dönüştürmekten ve kullanıcı navigasyonunu tetiklemekten sorumludur.
- CategoryCard3D

---

## AXIOMS – Mimari Varsayımlar
Bu modül için belirli bir fonksiyon gövdesi verilmediği için, yalnızca fonksiyon imzası ve modül sabitlerinden yola çıkarak temel mimari varsayımlar çıkarılabilir.

[Aksiyom 1]: Eğer `category` parametresi sağlanmazsa, bileşen hata fırlatır veya düzgün render edilemez.
[Aksiyom 2]: Eğer `subCategoryCount` parametresi bir sayı (number) değilse, bileşen hata verir veya beklenmeyen davranış gösterir.
[Aksiyom 3]: Eğer `onClick` parametresi çağrılabilir bir fonksiyon (callable) değilse, tıklama olayı çalışmaz veya bileşen hata fırlatır.
[Aks

---

## FONKSİYON DETAYLARI

### CategoryCard3D
**Ne yapar**: 3D animasyonlu bir kategori kartı bileşeni oluşturur ve Category Hub ızgarasında görsel olarak kategori bilgilerini sunar.  

**Nasıl yapar**: Gelen `category`, `subCategoryCount` ve `onClick` proplarını alarak, kartın iç yüzeyine kategori adı ve alt kategori sayısını yerleştirir; kart üzerine gelindiğinde veya tıklandığında 3D dönüş animasyonları tetiklenir ve `onClick` geri çağrısı çalıştırılır.  

**Parametreler**:
- `category`: string — Kartta gösterilecek ana kategori adı.
- `subCategoryCount`: number — Alt kategori sayısını gösteren metin için kullanılan değer.
- `onClick`: () => void — Kart tıklandığında yürütülecek fonksiyon.

**Dönüş**: React.FC&lt;CategoryCard3DProps&gt; — Tanımlı prop tipleriyle tip güvenliği sağlayan bir React fonksiyonel bileşeni.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: ../../utils/categoryHelpers::getCategoryDisplayName
- import: @/types/ui-models::type { Category }
- import: @react-three/fiber::Canvas
- import: lucide-react::ChevronRight
- import: next/dynamic::dynamic
- import: react::React
- import: react::Suspense

---

## INTERFACES

### CategoryCard3DProps
- `category: Category`
- `subCategoryCount: number`
- `onClick?: () => void`

---

## SABİTLER
- **Category3DIcon** (call) — `dynamic(() => import('../products/Category3DIcon'), { ssr: false, loading: ()...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/navigation/CategoryCard3D.tsx::CategoryCard3D

- **params**:
  - `category` — Kategori nesnesi (`Category` tipi), `slug` ve `metadata?.model_type` özellikleri kullanılır
  - `subCategoryCount` — Sayı, alt kategori/seri sayısını temsil eder, çeviride `count` olarak geçer
  - `onClick` — Tıklama callback fonksiyonu, div'in onClick'i ve onKeyDown tetikleyicisi olarak kullanılır

- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan elde edilen çeviri fonksiyonu, `t('products.categoryCard.seriesCount', { count: subCategoryCount })` çağrısıyla seri sayısını yerelleştirir

- **erişilen_ozellikler**:
  - `category.slug` — `Category3DIcon` bileşenine `categorySlug` prop'u olarak verilir
  - `category.metadata?.model_type` — `Category3DIcon` bileşenine `modelType` prop'u olarak verilir
  - `getCategoryDisplayName(category)` — Kategorinin gösterim adını döndürür, `aria-label` ve `<h3>` içeriğinde kullanılır (iki kez çağrılır)

- **Dönüş**: JSX element — 3D Canvas içeren, arka plan katmanı, `Category3DIcon`, çevrilmiş metin ve ChevronRight ikonu barındıran interaktif kart div'i

---

### [N2_NASIL] AST Pointer: components/navigation/CategoryCard3D.tsx::onKeyDown (inline handler)

- **params**:
  - `e` — `KeyboardEvent`, klavye olay nesnesi

- **ic_degiskenler**: (yok)

- **erişilen_ozellikler**:
  - `e.key` — Tuş değerini okur, `'Enter'` ve `' '` (boşluk) ile karşılaştırır
  - `onClick` — Dış kapsamdan kapanan değişken, koşul sağlanırsa ve tanımlıysa tetiklenir
  - `e.preventDefault()` — Varsayılan tarayıcı davranışını engeller (boşluk tuşu sayfa kaydırması vs.)

- **Dönüş**: void — Klavye ile erişilebilirlik sağlar, Enter/Space tuşlarında `onClick` fonksiyonunu çağırır

---

## NODE ID STANDARD

  file: src\components\navigation\CategoryCard3D.tsx
  function: src\components\navigation\CategoryCard3D.tsx::CategoryCard3D

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryCard3D

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-slate-800/40`, `border-slate-700/50`, `group-hover:bg-slate-800/60`, `group-hover:border-sky-500/50`, `group-hover:text-sky-400`, `group-hover:text-white`, `text-lg`, `text-sm`, `text-white`, `text-white/50`, `text-white/70`
- **Layout:** `-z-10`, `absolute`, `backdrop-blur-md`, `flex`, `group-hover:shadow-hvac-3d-glow`, `h-5`, `h-56`, `hover:shadow-2xl`, `hover:shadow-sky-500/20`, `items-center`, `justify-between`, `relative`, `w-5`, `z-10`, `z-20`
- **Varyant/Responsive:** `focus-visible:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-mt-12`, `border`, `cursor-pointer`, `duration-300`, `duration-500`, `ease-hvac-ease`, `focus-visible:ring-2`, `focus-visible:ring-sky-500`, `font-bold`, `group`, `group-hover:translate-x-1`, `hover:scale-105`, `inset-0`, `mb-1`, `outline-none`