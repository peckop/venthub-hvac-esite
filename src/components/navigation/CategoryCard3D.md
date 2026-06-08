---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\CategoryCard3D.tsx
skeleton_hash: 5c4932d8c2869a5e
entity_hashes:
  func:CategoryCard3D: b1d42c0fbbe60533
  overview: be950cf7f49cb0f6
  style_tokens: 72417c9ee963573b
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
`CategoryCard3D`, bir kategori adı ve alt kategori sayısını, etkileşimli ve üç boyutlu bir kart olarak görselleştiren bir React bileşenidir. Bileşen, verilen bilgileri stillendirilmiş bir arayüze dönüştürür ve tıklama olayı ile üst düzey navigasyon işlevselliğine katkıda bulunur. Bileşenin davranışı, prop değerlerinin sağlanması veya eksikliği konusunda belirli varsayımlarla tanımlıdır.

## Fonksiyon Grupları
### Bileşen ve Görsel Sunum
Bu grup, bileşenin temel amacını, aldığı verileri nasıl işlediğini ve kullanıcıya nasıl sunulduğunu kapsar.
- CategoryCard3D

---

## AXIOMS – Mimari Varsayımlar
Bu modül, category bilgisini ve alt kategori sayısını kullanarak etkileşimli bir 3D kart görseli sunar.

[Aksiyom 1]: Eğer `onClick` parametresi bir fonksiyon değilse, bileşenin tıklama olayı tetiklenemez ve kullanıcı etkileşimi çalışmaz.

[Aksiyom 2]: Eğer `category` parametresi bir string veya geçerli bir obje değilse, bileşenin içeriği düzgün oluşturulamaz ve render hata ile sonuçlanabilir.

[Aksiyom 3]: Eğer `subCategoryCount` bir sayı (number) tipi değilse, alt kategori sayısı gösterimi anlamsız veya hatalı olur; değeri `undefined` veya `null` ise bileşen bu alanı gizleyebilir (varsayım).

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
- **params**: `category` — Category tipinde nesne; kategori verisini taşır (`.slug` ve `.metadata?.model_type` özellikleri erişilir
  - `subCategoryCount` — number; alt kategori sayısını temsil eder, metin olarak "{subCategoryCount} seri" biçiminde gösterilir
  - `onClick` — () => void; kart tıklandığında çağrılacak geri çağıdırma fonksiyonu; div'in onClick ve onKeyDown içinde tetiklenir
- **ic_degiskenler**:
  - `getCategoryDisplayName(category)` — Category nesnesinden insancıl display adı döndüren yardımcı fonksiyon; aria-label string birleştirme ve h3 içeriği olmak üzere iki kez çağrılır
  - `category.slug` — kategorinin URL dostu tanımlayıcısı; Category3DIcon bileşenine categorySlug prop'u olarak iletilir
  - `category.metadata?.model_type` — opsiyonel metadata nesnesinden 3D model tipini çeker; Category3DIcon bileşenine modelType prop'u olarak iletilir
  - `e` — KeyboardEvent nesnesi; onKeyDown inline handler'ının parametresidir
  - `e.key` — basılan tuşun string temsili; 'Enter' ve ' ' (boşluk) değerlerine karşı kontrol edilir
- **Dönüş**: JSX.Element — tıklanabilir 3D kategori kartı; arka plan blur katmanı, Three.js Canvas içinde 3D ikon, alt kısımda kategori adı ve seri sayısı, sağda ChevronRight ikonu barındırır; onClick çağrıldığında tetiklenir, Enter/Space tuşuyla da erişilebilirlik desteği sağlar

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