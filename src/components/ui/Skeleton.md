---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\ui\Skeleton.tsx
skeleton_hash: e05306555b5f2c39
entity_hashes:
  func:Skeleton: 547c1486976d9411
  overview: dd78551ca6caccba
  style_tokens: 9afb047eb7d0beac
generated_at: 2026-08-27T08:34:11Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin kullanıcı arayüzü bileşenleri koleksiyonunda yer alan temel bir React bileşeni barındırır. Sayfa içerikleri yüklenirken görsel yer tutucu (loader) olarak kullanılan bu skeleton bileşeni, özelleştirilebilir stil ve varyant desteğiyle tüm proje genelinde tutarlı bir yükleme deneyimi sunar.

## Fonksiyon Grupları
### Ana Yükleme Yer Tutucu Bileşeni
Tüm ekranlarda içerik yükleme süreçlerinde kullanılacak, özelleştirilebilir özelliklere sahip skeleton bileşenini oluşturan tek ana işlevdir. Farklı görsel varyantları, özel sınıf desteği ve ek yapılandırma imkanlarıyla her türlü kullanım senaryosuna uyum sağlar.
- Skeleton

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı UI yükleme iskeleti (Skeleton) bileşeninin doğru görsel ve işlevsel çalışması için çalışma zamanı ortamının, geçerli prop değerlerinin ve stillendirme altyapısının varlığı zorunludur.

[Aksiyom 1]: Eğer React fonksiyonel bileşen çalışma zamanı ortamı yoksa, bu bileşen hiçbir şekilde çalışmaz, sayfada görüntülenemez.
[Aksiyom 2]: Eğer SkeletonProps tipinde tanımlı geçerli CSS sınıfı adı içeren className prop'u iletilmemiş veya geçersiz ise, bileşene özel özel stillendirme uygulanamaz, beklenen yerleşim ve görünüm elde edilemez.
[Aksiyom 3]: Eğer variant prop'u için desteklenen geçerli varyant değerleri tanımlı değilse, "default" dışında istenen herhangi bir özel stil varyantı (şekil, animasyon vb.) uygulanamaz, tüm kullanımlar varsayılan stile düşer.
[Aksiyom 4]: Eğer ...props operatörü ile iletilen standart HTML element özellikleri ilgili DOM elementine aktarılmazsa, bileşene ek özel işlevsellik, erişilebilirlik özelliği veya ek stillendirme eklenemez, standart DOM davranışları bozulur.

---

## FONKSİYON DETAYLARI

### Skeleton
**Ne yapar**: Yükleme (loading) durumlarında içerik yerine gösterilen iskelet placeholder bileşenidir. Kullanıcıya içeriğin henüz yüklenmediğini belirten, animasyonlu gri bir alan oluşturur. Genellikle veri çekilirken veya sayfa yüklenirken geçici içerik olarak kullanılır.

**Nasıl yapar**: Bileşen, aldığı `variant` parametresine göre önceden tanımlı renk stillerinden birini seçer. `variantStyles` nesnesinde üç farklı varyant tanımlıdır: `default` (standart gri tonları), `light` (açık gri tonları) ve `dark` (koyu tonlar). Her varyant, Tailwind CSS'in `dark:` önekini kullanarak koyu mod desteğini içerir. `cn` yardımcı fonksiyonu ile temel sınıflar (`animate-pulse` ile titreşim animasyonu, `rounded-md` ile yuvarlatılmış köşeler), seçilen varyant stili ve isteğe bağlı özel `className` birleştirilerek tek bir className string'i oluşturulur. Kalan tüm props, spread operatörü (`...props`) aracılığıyla doğrudan kök `<div>` elementine aktarılır.

**Parametreler**:
- `className`: `string` — Bileşene ek CSS sınıfları eklemek için kullanılan isteğe bağlı alan. Varsayılan bir değer atanmamıştır; gönderilmezse undefined olarak kalır ve `cn` fonksiyonu tarafından yok sayılır.
- `variant`: `"default" | "light" | "dark"` — İskelet bileşeninin renk temasını belirler. Varsayılan değeri `"default"` olup `bg-gray-200 dark:bg-gray-800` stilini uygular. `"light"` seçeneği `bg-gray-100 dark:bg-gray-700`, `"dark"` seçeneği ise `bg-slate-900 dark:bg-gray-950` kullanır.
- `...props`: `React.HTMLAttributes<HTMLDivElement>` — Kök `<div>` elementine aktarılan tüm standart HTML öznitelikleri ve React olay işleyicileri. `SkeletonProps` tipi üzerinden tanımlanan bu genişletilmiş props, bileşenin esnekliğini artırır.

**Dönüş**: JSX elementi (`<div>`). Bileşen, `animate-pulse` sınıfı ile sürekli titreşim animasyonu uygulanmış bir `<div>` elementi döndürür. Bu div, seçilen varyanta göre arka plan rengine ve yuvarlatılmış köşelere sahiptir.

---

## İTHALATLAR (IMPORTS)
- import: @/lib/utils::cn
- import: react::React

---

## INTERFACES

### SkeletonProps
- `variant?: "light" | "dark" | "default"`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/ui/Skeleton.tsx::Skeleton
- **params**: `className`, `variant` (varsayılan: "default"), `...props` (SkeletonProps tipinde)
- **ic_degiskenler**:
  - `variantStyles` — "default", "light", "dark" anahtarlarına sahip bir nesne; her anahtar için arka plan renk sınıflarını (`bg-gray-200 dark:bg-gray-800`, `bg-gray-100 dark:bg-gray-700`, `bg-slate-900 dark:bg-slate-950`) içerir.
- **Dönüş**: `div` elementi; `className` özelliği `"animate-pulse rounded-md"`, `variantStyles[variant]` ve `className` parametresinin `cn` fonksiyonu ile birleştirilmesiyle oluşturulur, `...props` ile diğer özellikleri yayar.

---

## NODE ID STANDARD

  file: src\components\ui\Skeleton.tsx
  function: src\components\ui\Skeleton.tsx::Skeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: Skeleton
  export: SkeletonProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`, `rounded-md`