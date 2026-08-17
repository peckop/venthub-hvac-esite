---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\account\FavoritesPage.tsx
skeleton_hash: 48bc261e0df88e59
entity_hashes:
  func:FavoritesPage: fd78e64fc30bb081
  overview: 29f1a2f0d8384179
  style_tokens: 35f0e9524ef543ee
generated_at: 2026-08-16T11:30:13Z
---

## Genel Bakış
Bu modül, kullanıcı hesabının favori sayfasını oluşturan bir React bileşenidir. Favoriye eklenmiş ürünlerin listelenmesini, filtrelenmesini veya management (yönetim) işlemlerini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Sayfanın tamamını render eden ve tüm iş mantığını (veri çekme, durum yönetimi, olay işleyiciler) barındıran üst düzey React bileşeni.
- FavoritesPage, bu sayfanın tek ve ana bileşenidir. Sayfaya özgü tüm alt bileşenleri (örneğin, ürün kartı listesi, filtre paneli, yükleme durumu) kendi içinde barındırır veya yönetir.

### Bağımlılıklar
Bileşen, veri çekmek ve temel altyapı hizmetlerini kullanmak için dış modüllere bağlıdır.
- **Veri Kaynakları**: Kullanıcının favori ürünlerini çekmek için bir API servisi veya store (örn: Redux, Zustand) kullanır.
- **Alt Bileşenler**: Sayfa içinde tekrar kullanılabilir bileşenleri (örn: `ProductCard`, `EmptyState`, `Loader`) içe aktarır.
- **Kütüphaneler**: Stil (CSS) araçları veya UI kütüphanesi (örn: Material UI, Ant Design) gibi dış bağımlılıkları olabilir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### FavoritesPage
**Ne yapar**: Kullanıcının favori ürünlerini看到 gösteren bir React bileşenidir. Bileşen, kullanıcının favorilerini localStorage'dan alır, bu ID'lere karşılık gelen ürün verilerini Supabase veritabanından çeker ve bir listeler. Bileşen; yükleme durumu, boş durum ve ürün listesi olmak üzere üç farklı arayüz durumunu yönetir.

**Nasıl yapar**: Bileşen, `useFavorites` hook'u ile `favorites` (ID dizisi) ve `removeFavorite` (kaldırma fonksiyonu) değerlerini alır. `useEffect` içinde, `favorites` dizisi değiştiğinde asenkron bir `load` fonksiyonu çalışır. Bu fonksiyon, `favorites` dizisindeki ID'leri kullanarak Supabase'den `VARIANT_LIST_COLUMNS` ile tanımlı sütunları seçer. Gelen ham veri (`DbProduct`), `mapDatabaseProductToDomain` ile domain modeline dönüştürülür. Orijinal localStorage sırasını korumak için, products dizisi `favorites` dizisindeki sıraya göre sıralanır. `useEffect`'in temizlik fonksiyonu (`cancelled` flag'i) ile bileşen unmount edildiğinde veya bağımlılıklar değiştiğinde istek iptal edilir. Render kısmında, `loading` durumuna göre bir yükleyici, `products` dizisinin boşluğuna göre bir boş durum mesajı ve aramabutonu, doluysa ürün listesi gösterilir. Her ürün satırında ürün resmi, adı, markası, SKU'su ve bir kaldırma butonu bulunur.

**Parametreler**:
- `useI18n()` hook'u: `t` fonksiyonunu döndürür — Bileşen içindeki tüm metinlerin uluslararasılaştırılması için kullanılır (örn: `t('account.favorites.title')`).
- `useLocalizedRoutes()` hook'u: `Routes` nesnesini döndürür — Ürün detay sayfasına (`Routes.product`) ve ürün listesi sayfasına (`Routes.products`) yönlendirme için URL'ler üretir.
- `useFavorites()` hook'u: `{ favorites: string[], removeFavorite: (id: string) => void }` — `favorites`, favori ürün ID'lerinin dizisidir (localStorage'dan okunur). `removeFavorite`, belirtilen ID'yi favorilerden kaldıran fonksiyondur.

**Dönüş**: `JSX.Element`. Bileşen, farklı durumlara göre farklı JSX yapıları döndürür: `loading` durumunda `Loader2` animasyonu, `products` boşsa boş durum kartı (`Heart` ikonu, başlık, açıklama ve "Ürünlere Göz At" butonu), doluysa `products` dizisini haritalayan bir `<ul>` listesi. Her listedeki `<li>` elemanı, ürün resmi (VentImage), ürün bilgileri (ad, marka, SKU) ve kaldırma butonu (Trash2 ikonlu) içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useFavorites::useFavorites
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: @/components/ui/VentImage::VentImage
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/lib/services/product.columns::VARIANT_LIST_COLUMNS
- import: @/lib/supabase/client::supabaseBrowserClient
- import: @/lib/type-converters::mapDatabaseProductToDomain
- import: @/types/db-rows::type { DbProduct }
- import: @/types/ui-models::type { Product }
- import: lucide-react::Heart
- import: lucide-react::Loader2
- import: lucide-react::Trash2
- import: next/link::Link
- import: react::React
- import: react::useEffect
- import: react::useState
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::FavoritesPage
- **params**: ()
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu
  - `Routes` — useLocalizedRoutes hook'undan gelen lokalize rota nesnesi
  - `favorites` — useFavorites hook'undan gelen favori ürün ID'leri dizisi
  - `removeFavorite` — useFavorites hook'undan gelen favori kaldırma fonksiyonu
  - `products` — useState ile tutulan favori ürünlerin domain nesneleri dizisi (başlangıç: [])
  - `loading` — useState ile tutulan yükleme durumu bayrağı (başlangıç: true)
- **Dönüş**: JSX element (favori ürünler sayfası)

### [N2_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::useEffect callback (arrow function)
- **params**: ()
- **ic_degiskenler**:
  - `cancelled` — asenkron yükleme iptal durumunu takip eden boolean (başlangıç: false)
  - `load` — iç içe tanımlanmış asenkron yükleme fonksiyonu
- **Dönüş**: cleanup fonksiyonu () => { cancelled = true }

### [N3_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::load (iç içe asenkron fonksiyon)
- **params**: ()
- **ic_degiskenler**:
  - `favorites.length === 0` kontrolü ile products ve loading güncellenir
  - `data` — supabaseBrowserClient.from('products').select().in() sorgusundan gelen ham veri
  - `error` — supabase sorgusundan gelen hata nesnesi
  - `rows` — data'nın DbProduct[] veya null olarak cast edilmesi, null ise boş dizi
  - `mapped` — rows.map(mapDatabaseProductToDomain) ile domain nesnelerine dönüştürülen ürünler
  - `order` — favorites dizisi ile Map oluşturularak ürün sırasını tutan harita (key: id, value: index)
  - `e` — catch bloğundaki hata nesnesi
- **Dönüş**: yok (state güncellemeleri: setProducts, setLoading)

### [N4_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::products.map callback (arrow function)
- **params**: `p` — Product tipinde tek bir ürün nesnesi
- **ic_degiskenler**:
  - `p.id` — ürünün benzersiz tanımlayıcısı (key olarak kullanılır)
  - `p.slug` — ürünün URL parçası (Routes.product için kullanılır)
  - `p.sku` — ürünün SKU kodu (Routes.product için kullanılır)
  - `p.name` — ürün adı (VentImage alt ve link metni için kullanılır)
  - `p.brand` — ürün markası (opsiyonel, varsa gösterilir)
  - `removeFavorite` — useFavorites hook'undan gelen favori kaldırma fonksiyonu (button onClick için kullanılır)
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu (button aria-label ve title için kullanılır)
  - `Routes` — useLocalizedRoutes hook'undan gelen lokalize rota nesnesi (Link href için kullanılır)
- **Dönüş**: JSX element (<li> list item)

---

## NODE ID STANDARD

  file: src\views\account\FavoritesPage.tsx
  function: src\views\account\FavoritesPage.tsx::FavoritesPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: FavoritesPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-100`, `bg-slate-50`, `bg-white`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `group-hover:text-primary-navy`, `hover:bg-secondary-blue`, `hover:border-red-300`, `hover:text-red-500`, `text-2xl`, `text-center`, `text-lg`, `text-primary-navy`
- **Layout:** `block`, `flex`, `flex-1`, `gap-2`, `gap-4`, `grid`, `grid-cols-1`, `h-14`, `h-16`, `h-6`, `h-9`, `h-full`, `hover:shadow-md`, `inline-block`, `items-center`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `font-bold`, `font-semibold`, `group`, `mb-1`, `mb-4`, `mb-6`, `mb-8`, `mt-0.5`, `mt-1`, `mx-auto`, `object-contain`, `px-6`, `py-16`