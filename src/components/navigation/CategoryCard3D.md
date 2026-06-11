---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategoryCard3D.tsx
skeleton_hash: 715a52126b64af3e
entity_hashes:
  func:CategoryCard3D: b1d42c0fbbe60533
  overview: 67a2b49d67dea5de
  style_tokens: 72417c9ee963573b
generated_at: 2026-06-11T16:13:47Z
---

## Genel Bakış
`CategoryCard3D`,HVAC ürün kategorilerini üç boyutlu animasyonlu bir kart olarak sunan React bileşenidir. Kullanıcılar bu kartlar aracılığıyla kategori isimlerini ve alt kategori sayılarını görsel olarak keşfedebilir, üzerine tıklayarak ilgili kategori sayfasına geçiş yapabilir. Bileşen, modern bir navigasyon deneyimi için 3D dönüş efektleri ve etkileşimli hover durumları sağlar.

## Fonksiyon Grupları

### Kategori Kartı Bileşeni
Tek bileşen, kategori verisini alıp 3D animasyonlu bir kart arayüzüne dönüştürmekten sorumludur. Tıklama ve hover etkileşimlerini yöneterek navigasyon akışını destekler.
- CategoryCard3D

---

## AXIOMS – Mimari Varsayımlar

[Genel varsayım]: CategoryCard3D bileşeni, category prop'u ile gelen bir nesnenin name alanını ve subCategoryCount prop'u ile gelen sayıyı 3D bir kart olarak görselleştirmek için tasarlanmıştır.

[Aksiyom 1]: Eğer category prop'u verilmemişse veya category.name alanı yoksa, bileşen category adını gösteren metin alanı boş veya tanımsız olur.

[Aksiyom 2]: Eğer subCategoryCount prop'u verilmemişse, bileşen "0" sayısını (veya varsayılan olarak tanımlanmışsa onu) alt kategori sayısı olarak görüntüler.

[Aksiyom 3]: Eğer onClick prop'u verilmemişse veya fonksiyon değilse, bileşen tıklama olayına tepki vermez.

[Aksiyom 4]: Eğer Category3DIcon sabit fonksiyonu çağrılamazsa veya geçerli bir React elemanı döndürmezse, kartın sol tarafında icon alanı boş kalır.

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

### [N1_NASIL] AST Pointer: src/components/navigation/CategoryCard3D.tsx::CategoryCard3D
- **params**: `{ category, subCategoryCount, onClick }` — category: Category nesnesi (slug ve metadata alanları içerir), subCategoryCount: number (kaç alt seri olduğunu belirtir), onClick: (() => void) | undefined (tıklama callback fonksiyonu)
- **ic_degiskenler**:
  - `getCategoryDisplayName(category)` — categoryHelpers'dan gelen yardımcı fonksiyon, kategorinin gösterilecek adını üretir (JSX'te iki kez çağrılır: aria-label ve h3 içeriği)
  - `category.slug` — Category3DIcon'a iletilen kategori slug değeri
  - `category.metadata?.model_type` — Category3DIcon'a iletilen 3D model türü, opsiyonel
  - `e` — onKeyDown inline handler parametresi, KeyboardEvent; `e.key` tuş değerini tutar, `e.preventDefault()` ile varsayılan davranışı engeller
- **Dönüş**: JSX elementi — `div` (role="button") içinde 3D Canvas area (Three.js Canvas + Category3DIcon) ve metin içeriği (kategori adı + seri sayısı + chevron ikonu) barındıran kart yapısı. return ile doğrudan JSX döndürür.

---

### [N2_NASIL] AST Pointer: src/components/navigation/CategoryCard3D.tsx::(e) => { ... } (onKeyDown handler)
- **params**: `e` — KeyboardEvent, tuş basma olayını temsil eder
- **ic_degiskenler**:
  - `e.key` — basılan tuşun değeri; `'Enter'` veya `' '` (boşluk) kontrol edilir
  - `onClick` — üst kapsamdan closure ile erişilen prop; tuşa basıldığında ve tanımlıysa çağrılır
- **Dönüş**: yok (void) — `e.preventDefault()` ile varsayılan scroll/eti对抗 engellenir, ardından `onClick()` çağrılır; yan etki olarak üst bileşenin tıklama mantığı tetiklenir

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