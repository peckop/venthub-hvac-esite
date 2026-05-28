---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ApplicationCards.tsx
skeleton_hash: 546a8c4566d1ccd8
entity_hashes:
  func:ApplicationCards: 105c8c349085c448
  overview: 73aa0d0a41c7f4d8
  style_tokens: 4a2aa4afe5f4d9fa
generated_at: 2026-05-28T22:37:03Z
---

## Genel Bakış
Bu React tabanlı modül, VentHub HVAC platformunun ürün bölümünde yer alır ve ürünlerin farklı uygulama alanlarını ve kullanım senaryolarını görsel kartlar formatında kullanıcılara sunmakla sorumludur. Modül, yüksek performanslı bir e-ticaret deneyimi için optimize edilmiş bir kart yapısı oluşturarak ürün sunum zenginliğine katkı sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Modülün tüm sorumluluğunu üstlenen, uygulama kartları yapısını oluşturup React ekosistemi için render eden temel bileşeni tanımlar.
- ApplicationCards

---

## AXIOMS – Mimari Varsayımlar

Bu modül, modül düzeyinde tanımlı `applications` dizisine bağımlı olarak çalışan, parametresiz bir React bileşenidir.

**[Aksiyom 1]:** Eğer `applications` sabit dizisi (modül kapsamı) tanımlı veya erişilebilir değilse, bileşen kartları render edemez ve boş/bozuk çıktı üretir.

**[Aksiyom 2]:** Eğer `applications` dizisi boş dizi (`[]`) ise, bileşen herhangi bir uygulama kartı göstermez (sıfır kart render eder).

**[Aksiyom 3]:** Eğer `ApplicationCards` bileşeni React çalışma ortamının dışında (örn. saf Node.js) çağrılırsa, JSX dönüşümü çalışmayacağından bileşen render edilemez.

**[Aksiyom 4]:** Bileşen parametresiz (`()`) olarak tanımlı olduğundan, bileşenin davranışını dışarıdan değiştirecek bir prop mekanizması yoktur;所有 davranış yalnızca modül içi `applications` dizisinin içeriğine bağlıdır.

---

## FONKSİYON DETAYLARI

### ApplicationCards

**Ne yapar**: ApplicationCards, ürünlerin uygulama alanlarını görsel kartlar halinde sergileyen bir React bileşenidir. Ürün Hub'ı bölümünde, ürünlerin hangi uygulama alanlarında kullanılabileceğini kullanıcıya sunar.

**Nasıl yapar**: Next.js'in Image bileşenini kullanarak görselleri optimize eder ve yüksek performanslı bir e-ticaret deneyimi sağlar. Bileşen, uygulama alanı verilerini alarak her birini rafine edilmiş bir yerleşim düzeninde kartlar halinde render eder. Lazy loading ve responsive görsel optimizasyonları sayesinde sayfa yükleme hızını artırır.

**Parametreler**:
Bu bileşen harici parametre almamaktadır (propsless bileşen yapılandırması). Gerekli verileri doğrudan iç state veya context üzerinden elde eder.

**Dönüş**: `React.FC` — ApplicationCards, fonksiyonel bir React bileşenidir ve JSX elemanları (uygulama alanı kartlarından oluşan bir grid/liste yapısı) döndürür. Her kart, bir uygulama alanını temsil eder ve görsel, başlık gibi bilgileri içerir.

---

## INTERFACES

### ApplicationCard
- `id: string`
- `title: string`
- `description: string`
- `icon: React.ReactNode`
- `image: string`
- `href: string`

---

## SABİTLER
- **applications** (array) — `[
    {
        id: 'restoran',
        title: 'Restoran Uygulamaları',
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/ApplicationCards.tsx::ApplicationCards
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `applications` — modül seviyesinde tanımlanmış sabit array, uygulama kartlarının verilerini (id, href, image, title, icon, description) tutar; `applications.map()` ile her uygulama için JSX kartı oluşturulur
- **Dönüş**: JSX `<section>` — 4 sütunlu grid yapısında uygulama kartları gösteren React bileşeni; her kart `Link`, `Image`, `ArrowRight` bileşenlerini ve `app.icon` lucide ikonunu içerir

---

### [N2_NASIL] AST Pointer: src/components/products/ApplicationCards.tsx::map_callback (applications.map içindeki arrow function)
- **params**: `app` — `applications` array'inden gelen tek bir uygulama objesi (id, href, image, title, icon, description alanlarını içerir)
- **ic_degiskenler**:
  - `app.id` — uygulamanın benzersiz tanımlayıcısı; `key` prop'u olarak ve `app.id === 'restoran'` koşulunda `priority` prop'unu belirlemek için kullanılır
  - `app.href` — uygulama detay sayfasının URL'i; `Link` bileşeninin `href` prop'una `import('next').Route` tipine cast edilerek bağlanır
  - `app.image` — uygulama görselinin dosya yolu; `Image` bileşeninin `src` prop'una bağlanır
  - `app.title` — uygulamanın başlık metni; hem `Image` bileşeninin `alt` prop'unda hem de `<h3>` içinde gösterilir
  - `app.icon` — uygulamaya ait lucide React ikon bileşeni; görselin sol üstündeki overlay div içinde render edilir
  - `app.description` — uygulamanın kısa açıklama metni; `line-clamp-2` ile 2 satırla sınırlandırılmış `<p>` içinde gösterilir
- **Dönüş**: JSX `<Link>` bileşeni — görsel, ikon overlay, başlık, açıklama ve "Detayları Gör" butonu içeren tam kart bileşeni

---

## NODE ID STANDARD

  file: src\components\products\ApplicationCards.tsx
  function: src\components\products\ApplicationCards.tsx::ApplicationCards

---

## DISA AKTARILANLAR (EXPORTS)
  export: ApplicationCards

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100`, `bg-white`, `bg-white/90`, `border-gray-100`, `group-hover:text-primary-navy`, `hover:border-primary-navy/20`, `text-base`, `text-gray-500`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-6`, `grid`, `grid-cols-1`, `h-10`, `h-40`, `hover:shadow-xl`, `items-center`, `justify-center`, `left-4`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `duration-300`, `duration-500`, `font-bold`, `font-semibold`, `group`, `group-hover:opacity-100`, `group-hover:scale-105`, `group-hover:scale-110`, `group-hover:translate-x-1`, `leading-relaxed`, `mb-2`, `mb-4`, `mb-6`, `mt-auto`