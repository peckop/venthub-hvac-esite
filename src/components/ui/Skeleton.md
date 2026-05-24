---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ui\Skeleton.tsx
skeleton_hash: 41c38e19c2e20ef6
generated_at: 2026-05-23T22:27:56Z
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

## FONKSIYON DETAYLARI

### Skeleton
**Ne yapar**: React tabanlı kullanıcı arayüzlerinde içeriklerin yüklenme sürecinde, yüklenecek içeriğin yerini tutan görsel yükleme göstergesi (skeleton) bileşenidir. Kullanıcıya yükleme işleminin aktif olduğunu iletirken, sayfa içeriğinin nihai düzenini önceden temsil ederek ani içerik kaymalarını önler.
**Nasıl yapar**: Temel olarak bir div elementi olarak render edilir, cn utility fonksiyonu kullanılarak varsayılan "animate-pulse" ve "rounded-md" CSS sınıflarını, seçilen varyanta ait özel stilleri ve kullanıcı tarafından iletilen özel sınıfları birleştirir. Tüm iletilen ek propsları doğrudan oluşturulan div elementine aktararak, istenen tüm özelleştirmelerin uygulanmasını sağlar.
**Parametreler**:
- className: string | undefined — Bileşene eklenecek özel CSS sınıflarıdır, isteğe bağlı olarak iletilir. Varsayılan stillere ek olarak uygulanarak bileşenin boyut, renk gibi görsel özellikleri özelleştirilebilir.
- variant: string | undefined — Kullanılacak skeleton görünüm varyantıdır, varsayılan değeri "default" olarak tanımlanmıştır. Önceden tanımlanmış farklı varyant stillerinden birini seçmek için kullanılır.
- ...props: React.HTMLAttributes<HTMLDivElement> — HTML div elementlerine uygulanabilen tüm standart React DOM özellikleri, olay dinleyicileri ve diğer ek parametrelerdir, isteğe bağlı olarak iletilir ve doğrudan render edilen div elementine aktarılır.
**Dönüş**: JSX.Element — Tüm aktarılan ve birleştirilen stillere, özelliklere sahip bir div elementi olarak, React ağacında render edilmek üzere bir JSX öğesi döndürür.

---

## INTERFACES

### SkeletonProps
- `variant?: "light" | "dark" | "default"`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ui\Skeleton.tsx::Skeleton
- **params**: className, variant (varsayılan değer: "default"), ...props — tüm parametreler SkeletonProps türündedir
- **ic_degiskenler**:
  - `variantStyles` - Farklı skeleton görünüm varyantları için Tailwind CSS arka plan renk sınıflarını saklayan nesne; "default", "light", "dark" anahtarlarıyla her varyantın ışık/karanlık mod renk sınıflarını içerir
  - `cn` - @/lib/utils modülünden import edilen, class stringlerini birleştirmek için kullanılan utility fonksiyonu; döndürülen div elementinin className propunu oluşturmak için çağrılır
- **Dönüş**: React JSX div elementi (tüm aktarılan propsları alan, yükleme göstergesi olarak kullanılan skeleton DOM elementi)

---

## NODE ID STANDARD

  file: src\components\ui\Skeleton.tsx
  function: src\components\ui\Skeleton.tsx::Skeleton

---

## DISA AKTARILANLAR (EXPORTS)
  export: Skeleton
  export: SkeletonProps