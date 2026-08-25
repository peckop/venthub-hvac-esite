---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\FavoritesPage.tsx
skeleton_hash: ebfd9f300e0a3cf3
entity_hashes:
  func:FavoritesPage: fd78e64fc30bb081
  overview: 29f1a2f0d8384179
  style_tokens: 35f0e9524ef543ee
generated_at: 2026-08-25T08:45:40Z
---

## Genel Bakış

Bu modül, kullanıcının favori öğelerini görüntülediği hesap sayfası bileşenini içerir. Tek bir bileşen fonksiyonundan oluşan modül, `src/views/account` yapısı altında konumlanmıştır ve kullanıcıya özel bir görünüm sunar.

## Fonksiyon Grupları

### Sayfa Bileşeni

Modülün tek bileşeni olan `FavoritesPage`, kullanıcının favori içeriklerinin listelendiği sayfa arayüzünü oluşturur.

- FavoritesPage

## Notlar

Modülde yalnızca tek bir bileşen fonksiyonu tanımlıdır. Dahili yardımcı fonksiyon, alt bileşen veya dışa aktarılan ek birim bulunmamaktadır. Dış bağımlılıklar ve alt bileşen kullanımı hakkında verilen kaynakta ek bilgi yer almamaktadır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** `FavoritesPage` fonksiyonunun gövdesi sağlanmadığından, doğru çalışması için hangi koşulların gerekli olduğu belirlenememektedir. Fonksiyon gövdesi olmadan bağımlılıklar, eşik değerleri, kabul kriterleri veya çalışma koşulları hakkında çıkarım yapılamaz.

---

## FONKSİYON DETAYLARI

### FavoritesPage

**Ne yapar**: Kullanıcının favori ürünlerini görüntüleyen sayfa bileşenidir. Favori ürün kimliklerini localStorage'dan alır, ürünlerin detaylarını veritabanından çeker ve kullanıcıya sunar. Favori listesi boşsa bilgilendirici bir boş durum ekranı gösterir; ürünler varsa bunları kartlar halinde listeler ve her karttan ürünün kaldırılmasına olanak tanır.

**Nasıl yapar**: Bileşen önce `useI18n` ile uluslararasılaştırma fonksiyonunu, `useLocalizedRoutes` ile yerelleştirilmiş rota fonksiyonlarını ve `useFavorites` ile favori kimlik listesini (`favorites`) ile favori kaldırma fonksiyonunu (`removeFavorite`) alır. `products` ve `loading` durumları `useState` ile yönetilir. `useEffect` içinde asenkron bir `load` fonksiyonu tanımlanmıştır; bu fonksiyon `favorites` dizisi boşsa ürün listesini temizler ve yüklemeyi sonlandırır, aksi halde `supabaseBrowserClient` üzerinden `products` tablosundan `VARIANT_LIST_COLUMNS` ile tanımlı sütunları `favorites` kimliklerine göre sorgular. Gelen veri `mapDatabaseProductToDomain` ile etki alanına dönüştürülür, ardından localStorage'daki favori sırasını korumak için `favorites` dizisindeki indekslerden oluşan bir `Map` ile sıralama yapılır. Yükleme sırasında `Loader2` animasyonu, ürünler boşken `Heart` ikonlu boş durum kartı ve `Link` ile ürünlere göz atma butonu, ürünler varken ise her ürün için görsel, isim, marka, SKU ve `Trash2` ikonlu kaldırma butonu içeren kartlar render edilir. Bileşen, `useEffect` temizleme fonksiyonu ile asenkron işlemin iptal edilmesini (`cancelled` bayrağı) sağlayarak bileşen kaldırıldığında durum güncellemesini engeller.

**Parametreler**: Bu fonksiyon parametre almaz; bir React bileşeni olarak propssız çalışır.

**Dönüş**: JSX elementi döndürür. Yüklenme durumuna, ürün sayısına ve hata durumuna göre koşullu olarak farklı arayüz durumları render eder: yükleme göstergesi, boş favori ekranı veya favori ürün kartlarının bulunduğu ızgara liste.

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
- **params**: yok
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; metinleri yerelleştirmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen rota fonksiyonları nesnesi; `Routes.products()` ve `Routes.product()` ile URL üretmek için kullanılır
  - `favorites` — `useFavorites()` hook'undan gelen favori ürün ID'lerinin dizisi; Supabase sorgusunda `.in('id', favorites)` filtresi olarak kullanılır
  - `removeFavorite` — `useFavorites()` hook'undan gelen favori çıkarma fonksiyonu; `removeFavorite(p.id)` ile bir ürünü favorilerden kaldırmak için kullanılır
  - `products` — `useState<Product[]>([])` ile tutulan, Supabase'den çekilen ve domaine dönüştürülen ürün listesi
  - `setProducts` — `products` state'ini güncelleyen setter fonksiyonu; boş dizi veya `mapped` dizisi ile çağrılır
  - `loading` — `useState(true)` ile tutulan yükleme durumu boolean'ı; true iken spinner gösterilir
  - `setLoading` — `loading` state'ini güncelleyen setter fonksiyonu; yükleme başlangıcında true, bitişinde false yapılır
  - `cancelled` — useEffect cleanup fonksiyonu tarafından true yapılan boolean flag; bileşen unmount edildiğinde state güncellemesini engeller
  - `load` — useEffect içinde tanımlanan async fonksiyon; favori ID'leri için Supabase'den ürün çeker, domaine dönüştürür, sıralar ve state'e yazar
  - `data` — `supabaseBrowserClient.from('products').select(VARIANT_LIST_COLUMNS).in('id', favorites)` sorgusundan dönen veri; `DbProduct[] | null` tipindedir
  - `error` — Supabase sorgusundan dönen hata nesnesi; varsa throw ile fırlatılır
  - `rows` — `(data as DbProduct[] | null) ?? []` ifadesiyle null-safe hale getirilen veritabanı ürün dizisi
  - `mapped` — `rows.map(mapDatabaseProductToDomain)` ile veritabanı ürünlerinin domaine dönüştürülmüş hali
  - `order` — `new Map(favorites.map((id, i) => [id, i]))` ile oluşturulan Map; her favori ID'nin sırasını tutar, `mapped.sort()` içinde kullanılır
  - `e` — catch bloğunda yakalanan hata nesnesi; `console.error` ile loglanır
  - `p` — `products.map(p => ...)` içindeki her bir Product nesnesi; `p.id`, `p.slug`, `p.sku`, `p.name`, `p.brand` alanlarına erişilir
- **Dönüş**: JSX element (React bileşeni) — yükleme durumunda spinner, boş durumda boş mesaj ve keşfet butonu, dolu durumda ürün kartları listesi render eder

### [N2_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::useEffect callback (anonim)
- **params**: yok (useEffect callback'i, parametre almaz)
- **ic_degiskenler**:
  - `cancelled` — bileşen unmount edildiğinde `true` yapılan boolean flag; cleanup fonksiyonu tarafından set edilir
  - `load` — async fonksiyon tanımı; çağrılır ve sonuç Promise'i beklenmez (fire-and-forget)
- **Dönüş**: cleanup fonksiyonu — `return () => { cancelled = true }` ile bileşen unmount edildiğinde `cancelled` flag'ini true yapar

### [N3_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::load
- **params**: yok
- **ic_degiskenler**:
  - `cancelled` — dış scope'dan erişilen boolean flag; `if (cancelled) return` ile bileşen unmount sonrası işlemi durdurur
  - `data` — `supabaseBrowserClient.from('products').select(VARIANT_LIST_COLUMNS).in('id', favorites)` sorgusundan dönen veri; destructuring ile alınır
  - `error` — aynı Supabase sorgusundan dönen hata nesnesi; destructuring ile alınır, varsa `throw error` ile fırlatılır
  - `rows` — `(data as DbProduct[] | null) ?? []` ifadesiyle null-safe hale getirilen `DbProduct[]` tipinde veritabanı ürün dizisi
  - `mapped` — `rows.map(mapDatabaseProductToDomain)` ile veritabanı ürünlerinin domaine dönüştürülmüş `Product[]` dizisi
  - `order` — `new Map(favorites.map((id, i) => [id, i]))` ile oluşturulan `Map<string, number>`; her favori ID'nin dizideki indeksini tutar, localStorage sırasını korumak için `mapped.sort()` içinde kullanılır
  - `e` — catch bloğunda yakalanan hata; `console.error('Favorites load error:', e)` ile loglanır ve `toast.error(t('account.favorites.loadError'))` ile kullanıcıya bildirilir
- **Dönüş**: yok (Promise<void>) — yan etki olarak `setProducts(mapped)` ve `setLoading(false)` çağrıları yapar

### [N4_NASIL] AST Pointer: src/views/account/FavoritesPage.tsx::products.map callback (p => ...)
- **params**: `p` — Product tipinde ürün nesnesi
- **ic_degiskenler**:
  - `p.id` — ürünün benzersiz kimliği; `key` prop'u ve `removeFavorite(p.id)` çağrısında kullanılır
  - `p.slug` — ürünün URL-friendly adı; `Routes.product(p.slug || '', p.sku)` Link href'inde kullanılır, boşsa boş string gönderilir
  - `p.sku` — stok kodu; `Routes.product(p.slug || '', p.sku)` Link href'inde ve ürün kartı içinde gösterilir
  - `p.name` — ürün adı; `VentImage` alt prop'unda ve ürün kartı başlığında gösterilir
  - `p.brand` — marka adı; varsa ürün kartı içinde gösterilir (`{p.brand}`)
- **Dönüş**: JSX element (li) — ürün görseli, adı, markası, SKU'su ve favorilerden çıkarma butonu içeren kart bileşeni

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