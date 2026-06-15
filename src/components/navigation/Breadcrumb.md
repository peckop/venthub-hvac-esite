---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\navigation\Breadcrumb.tsx
skeleton_hash: 8c92fea85517808a
entity_hashes:
  func:Breadcrumb: 8dc746a161585543
  overview: c3a2c03ed767502e
  style_tokens: 37bda1495ede52cb
generated_at: 2026-06-15T17:03:33Z
---

## Genel Bakış
Breadcrumb bileşeni, kullanıcının uygulama içindeki mevcut konumunu hiyerarşik bir yol olarak gösteren navigasyon yardımcı öğesidir. Etiket ve bağlantı çiftlerinden oluşan bir liste alarak bunları sıralı bir çubuk olarak render eder; son öğe genellikle aktif sayfayı temsil eder ve bağlantısız gösterilir. Bileşen, farklı görsel temalar ve özel stillendirme seçenekleriyle birlikte kullanıma sunulur.

## Fonksiyon Grupları
### Navigasyon Yolu Gösterimi
Bileşenin tek ve temel sorumluluğu, verilen öğe listesini kullanıcı dostu bir breadcrumb çubuğu olarak sunmaktır. Geçerli sayfa yolunu okunabilir ve erişilebilir biçimde kullanıcılara iletir.
- Breadcrumb

---

## AXIOMS – Mimari Varsayımlar
Breadcrumb bileşeni, `items` prop'unun mutlaka sağlanması gerektiğini, `variant` ve `className` prop'larının ise opsiyonel olduğunu varsayar.

- **[Aksiyom 1]**: `items` prop'u sağlanmazsa bileşen boş veya hata veren bir breadcrumb render edilir.
- **[Aksiyom 2]**: `variant` prop'u sağlanmazsa bileşen `'white'` değerini varsayılan olarak kullanır.
- **[Aksiyom 3]**: `className` prop'u sağlanmazsa bileşen boş string değerini varsayılan olarak kullanır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hiyerarşik navigasyon yolunu gösteren bir breadcrumb bileşenidir. Doğru çalışması için aşağıdaki mimari varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `items` boş bir dize veya null/undefined ise, bileşen boş bir breadcrumb olarak render edilir (hiçbir öğe gösterilmez).

[Aksiyom 2]: Eğer `items` geçerli bir dize listesi ise, her öğe en az bir etiket içermeli ve opsiyonel olarak bir bağlantı URL'si içerebilir.

[Aksiyom 3]: Eğer `variant` parametresi geçerli bir değer değilse, bileşen varsayılan olarak `'white'` temasını kullanır.

[Aksiyom 4]: Eğer `className` boş bir dize ise, bileşen varsayılan stillerini uygular ve ek CSS sınıfı eklenmez.

[Aksiyom 5]: Eğer `items` listesinde birden fazla öğe varsa, son öğe aktif sayfayı temsil eder ve bağlantısız (sadece metin) olarak gösterilir.

**NOT:** Bu aksiyomlar fonksiyon imzasından ve mevcut dokümantasyondan çıkarılmıştır. Fonksiyon gövdesindeki gerçek mantık hakkında bilgi bulunmadığından, bazı varsayımlar genel breadcrumb davranışlarına dayanmaktadır.

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

## İTHALATLAR (IMPORTS)
- import: @/config/siteUrl::SITE_URL
- import: @/i18n/I18nProvider::useI18n
- import: @/utils/routes::localizedHref
- import: lucide-react::ChevronRight
- import: lucide-react::Home
- import: next/link::Link
- import: react::React

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