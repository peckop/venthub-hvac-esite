---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategoryCard3D.tsx
skeleton_hash: 7c8c9e731ab9c6ad
entity_hashes:
  func:CategoryCard3D: b1d42c0fbbe60533
  overview: ac6e8bdef42e2eaf
  style_tokens: 72417c9ee963573b
generated_at: 2026-05-28T22:36:12Z
---

## Genel Bakış
`CategoryCard3D` modülü, kategori bilgilerini ve alt kategori sayısını alarak üç boyutlu bir görsel ve animasyonla sunan bir React fonksiyonel bileşenini tanımlar. Kullanıcı etkileşimini `onClick` callback’iyle sağlayarak, kategori kartının navigasyon içinde etkileşimli bir öğe olarak kullanılmasını mümkün kılar.  

## Fonksiyon Grupları
### Ana Bileşen
Bu grup, bileşenin temel render ve etkileşim mantığını içerir.  
- CategoryCard3D  

*(Bu bileşen, aldığı `category`, `subCategoryCount` ve `onClick` prop’larını JSX içinde birleştirir, 3D stil ve animasyonları uygular, ve tıklama olayını tetikler.)*

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

**Aksiyom 1**: Eğer `category` prop’u sağlanmazsa, bileşen kategori bilgisini **undefined** olarak alır ve render sırasında **boş** bir başlık gösterir veya **React** hata uyarısı verir.  

**Aksiyom 2**: Eğer `subCategoryCount` prop’u sağlanmazsa, alt kategori sayısı **undefined** olur ve bileşen bu değeri **görmez**; UI’da alt kategori sayısı kısmı **görünmez** veya **0** olarak gösterilir.  

**Aksiyom 3**: Eğer `onClick` prop’u sağlanmazsa, kartın tıklama olayı **tanımsız** olur; kullanıcı kartı tıkladığında **hiçbir işlem** gerçekleşmez ve **JavaScript** hatası atılmaz.  

**Aksiyom 4**: Eğer `Category3DIcon` (modül sabiti) çağrısı başarısız olursa, 3D ikon **render** edilmez ve kartın görsel bütünlüğü bozulur; bu durumda bileşen **fallback** bir görsel göstermez.  

**Aksiyom 5**: Eğer `category` nesnesi içinde beklenen alanlar (ör. `name`, `id`) eksikse, bileşen bu alanları **undefined** olarak alır ve ilgili UI bölümleri **boş** ya da **hata** mesajı gösterir.  

**Aksiyom 6**: Eğer `subCategoryCount` negatif bir sayı ise, bileşen bu değeri **0** olarak kabul eder veya **negatif** değeri göstermez; UI’da negatif sayı gösterilmez.

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
- **params**: `category`, `subCategoryCount`, `onClick`
- **ic_degiskenler**:
  - `category` — the category object passed to the component; used for display name, slug, and metadata.
  - `subCategoryCount` — number of sub‑categories; displayed in the UI.
  - `onClick` — callback invoked when the card is activated via mouse click or keyboard.
  - `e` — keyboard event object in the `onKeyDown` handler; used to detect `Enter` or space key and to prevent default behavior.
  - `getCategoryDisplayName` — imported helper that returns a human‑readable name for a category; called twice for aria label and heading.
  - `Category3DIcon` — component rendered inside the `<Suspense>` wrapper; receives `categorySlug`, `modelType`, and `scale`.
  - `Canvas` — Three.js canvas component from `@react-three/fiber`; configured with camera, style, GL options, and DPR.
  - `Environment` — lighting preset component from `@react-three/drei`; used to set a city environment.
  - `ambientLight`, `directionalLight`, `pointLight` — Three.js light components added to the scene.
  - `Suspense` — React suspense component that wraps the 3D icon; fallback is `null`.
  - `ChevronRight` — icon component from `lucide-react`; displayed next to the sub‑category count.
  - `category.slug` — accessed to pass as `categorySlug` prop to `Category3DIcon`.
  - `category.metadata?.model_type` — optional chaining to provide the `modelType` prop to `Category3DIcon`.
  - `e.key` — checked to determine if the key pressed is `Enter` or space.
  - `e.preventDefault()` — called to stop the default key action when activating the card via keyboard.
  - `onClick()` — invoked when the card is clicked or activated via keyboard.
- **Dönüş**: `React.FC<CategoryCard3DProps>` – renders a clickable card with a 3D canvas, heading, sub‑category count, and navigation icon; no explicit return value beyond the JSX.

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