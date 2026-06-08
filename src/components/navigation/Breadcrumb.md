---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\Breadcrumb.tsx
skeleton_hash: 152dc957e572d5cb
entity_hashes:
  func:Breadcrumb: 8dc746a161585543
  overview: 82dedeadab76807c
  style_tokens: 37bda1495ede52cb
generated_at: 2026-06-08T10:08:49Z
---

## Genel Bakış
Breadcrumb bileşeni, kullanıcının uygulama içindeki mevcut konumunu hiyerarşik bir yol olarak gösteren navigasyon yardımcı öğesidir. Etiket ve bağlantı çiftlerinden oluşan bir liste alarak bunları sıralı ve tıklanabilir bir çubuk olarak render eder; son öğe genellikle aktif sayfayı temsil eder ve bağlantısız gösterilir.

## Fonksiyon Grupları
### Navigasyon Yolu Gösterimi
Bileşenin temel sorumluluğu, verilen öğe listesini kullanıcı dostu bir breadcrumb çubuğu olarak sunmaktır. Görsel tema ve ek stillendirme seçenekleriyle birlikte, geçerli sayfa yolunu okunabilir ve erişilebilir biçimde kullanıcılara iletir.
- Breadcrumb

---

## AXIOMS – Mimari Varsayımlar
Breadcrumb bileşeni, `items` prop'unun mutlaka sağlanması gerektiğini, `variant` ve `className` prop'larının ise opsiyonel olduğunu varsayar.

[Aksiyom 1]: Eğer `items` prop'u sağlanmazsa, bileşen gösterilecek navigasyon öğesi olmadığından boş veya hata veren bir breadcrumb render edilir.

[Aksiyom 2]: Eğer `variant` prop'u sağlanmazsa, bileşen `'white'` değerini varsayılan olarak kullanır.

[Aksiyom 3]: Eğer `className` prop'u sağlanmazsa, bileşen boş string (`''`) değerini varsayılan olarak kullanır.

---

## FONKSİYON DETAYLARI

### Breadcrumb

**Ne yapar**: Breadcrumb navigasyon bileşeni, kullanıcının mevcut sayfanın hiyerarşik konumunu görmesini ve üst seviye sayfalara hızlıca erişmesini sağlayan bir gezinme yol göstericisi oluşturur. Bu bileşen, özellikle e-ticaret sitelerinde kategori sayfalarında ve ürün detay sayfalarında kullanıcı deneyimini iyileştirmek için kullanılır.

**Nasıl yapar**: Bileşen, verilen items dizisini sırasıyla işleyerek her bir öğeyi birbirine bağlayan breadcrumb trail (gezinme izi) oluşturur. Son öğe hariç tüm öğeler tıklanabilir linkler olarak render edilirken, son öğe mevcut sayfayı temsil eder ve genellikle link içermeyen statik bir metin olarak gösterilir. Variant ve className parametreleri sayesinde görsel özelleştirme imkanı sunar.

**Parametreler**:
- items: `Array<{ label: string; href?: string }>` — Breadcrumb öğelerini içeren dizi. Her öğe bir `label` (görünen metin) ve opsiyonel bir `href` (yönlendirme adresi) içerir. Son öğe genellikle `href` içermez çünkü kullanıcının bulunduğu sayfayı temsil eder. Örnek: `{ label: 'Ana Sayfa', href: '/' }` veya `{ label: 'Aksiyel Fanlar' }`
- variant: `string` — Bileşenin görsel temasını belirler. Varsayılan değeri `'white'` olup, farklı renk şemaları veya stil varyasyonları için kullanılır. Tema rengine göre arka plan, metin ve border renklerini ayarlar.
- className: `string` — Bileşene ekstra CSS sınıfı eklemek için kullanılır. Varsayılan değeri boş string (`''`) olup, dışarıdan stillendirme veya layout ayarları yapmak için tercih edilir.

**Dönüş**: `React.FC<BreadcrumbProps>` — BreadcrumbProps arayüzüne uygun, render edilebilir bir React fonksiyonel bileşeni döndürür. Oluşturulan JSX yapısı, mobil ve masaüstü ekranlarda uyumlu breadcrumb navigasyonu içeriğini temsil eder.

**Kullanım Örneği**:
```tsx
<Breadcrumb
  items={[
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Fans', href: '/category/fans' },
    { label: 'Aksiyel Fanlar' }
  ]}
/>
```

---

## INTERFACES

### BreadcrumbItem
- `label: string`
- `href?: string`
- `icon?: React.ReactNode`

### BreadcrumbProps
- `items: BreadcrumbItem[]`
- `variant?: 'white' | 'transparent' | 'dark'`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: Breadcrumb.tsx::Breadcrumb
- **params**: (items, variant = 'white', className = '')
- **ic_degiskenler**:
  - `bgClasses` — variant değerine göre arka plan CSS sınıflarını tanımlayan nesne (white, transparent, dark seçenekleri)
  - `textClasses` — variant değerine göre link, mevcut eleman ve ayırıcı renklerini tanımlayan iç içe nesne
  - `styles` — mevcut variant için textClasses nesnesinden seçilen stil nesnesi
  - `jsonLd` — breadcrumb verilerini JSON-LD formatında SEO için yapılandıran nesne
  - `isLast` — maps içindeki her elemanın son eleman olup olmadığını belirleyen boolean (index === items.length - 1)
  - `isFirst` — maps içindeki her elemanın ilk eleman olup olmadığını belirleyen boolean (index === 0)
- **Dönüş**: JSX element (Breadcrumb bileşeni) veya null (items boşsa)

---

## NODE ID STANDARD

  file: src\components\navigation\Breadcrumb.tsx
  function: src\components\navigation\Breadcrumb.tsx::Breadcrumb

---

## DISA AKTARILANLAR (EXPORTS)
  export: Breadcrumb
  export: BreadcrumbItem

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-sm`
- **Layout:** `flex`, `flex-wrap`, `gap-y-1`, `inline`, `items-center`, `max-w-7xl`
- **Varyant/Responsive:** `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${bgClasses[variant]`, `${className`, `${styles.link`, `${styles.separator`, `-mt-0.5`, `lg:px-8`, `mr-1.5`, `mx-2`, `mx-auto`, `px-4`, `py-4`, `shrink-0`, `sm:px-6`, `transition-colors`