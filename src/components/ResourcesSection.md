---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ResourcesSection.tsx
skeleton_hash: 80aff6d26e936cbe
entity_hashes:
  func:BookOpenIcon: 11c8f8aad5a96dfc
  func:FileTextIcon: 039865da3eee4b1d
  func:ResourcesSection: 795ed7bee0f40478
  overview: c1ef1afa06662a8f
  style_tokens: a4977aa0bda0dda5
generated_at: 2026-05-28T22:36:56Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kullanıcı arayüzünde kaynaklar bölümünü oluşturan React bileşenlerini barındırır. Kullanıcılara sunulan kaynakların listelendiği ana bölüm yapısını ve bu bölümde kullanılan özel görsel ikonları tek dosya üzerinden yönetir.

## Fonksiyon Grupları
### Ana Bölüm Bileşeni
Modülün temel işlevini yerine getiren, arayüzdeki kaynaklar bölümünü tüm içeriğiyle birlikte render eden ana React bileşenidir.
- ResourcesSection

### Özel İkon Bileşenleri
Kaynaklar bölümünde kullanılan görsel ikonları, boyut ve stil özelleştirmesine izin veren basit ve yeniden kullanılabilir bileşenler olarak sunar.
- BookOpenIcon, FileTextIcon

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı ResourcesSection bileşeni, içe aktardığı ikon bileşenlerinin erişilebilir ve çalışır durumda olmasını, bulunduğu React uygulama ortamının JSX desteği sunmasını varsayar.

[Aksiyom 1]: Eğer bu bileşen tarafından içe aktarılan BookOpenIcon ve FileTextIcon ikon bileşenleri projeye dahil edilmemiş veya erişilemez durumdaysa, ResourcesSection bileşeni derleme aşamasında hata alır ve uygulama çalışmaz.
[Aksiyom 2]: Eğer bileşenin çalıştığı React ortamı JSX sözdizimini desteklemiyorsa, ResourcesSection bileşeni içeriğini hiçbir şekilde ekrana yazdıramaz.
[Aksiyom 3]: Eğer BookOpenIcon ve FileTextIcon ikon bileşenleri kendilerine geçilen size ve className prop'larını işleyemiyorsa, kaynak bölümündeki ikonlar varsayılan (size=20) boyutta veya istenen stilde görünmez, kullanıcı arayüzü bozulur.

---

## FONKSİYON DETAYLARI

### ResourcesSection
**Ne yapar**: VentHub HVAC projesinin kaynaklar bölümünü oluşturan ana React bileşenidir, kullanıcıların erişmesi gereken tüm proje kaynaklarını tek bir düzenli bölümde toplar ve kullanıcı arayüzünde sunar. Proje içindeki diğer bileşenlerle entegre çalışarak kaynak erişimini kolaylaştıran bir bölümün temel yapısını oluşturur.
**Nasıl yapar**: React.FC türünde bir bileşen olarak tanımlanır, içerdiği ikon ve içerik bileşenlerini bir araya getirerek bölümün tüm kullanıcı arayüzü elementlerini tek bir JSX yapısı olarak hazırlar. Herhangi bir harici yapılandırmaya ihtiyaç duymadan bağımsız olarak render edilebilir şekilde tasarlanmıştır.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: React.FC türünde bir React bileşeni döndürür, bu bileşen kaynaklar bölümünün tüm görsel ve işlevsel yapısını ekrana render eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ResourcesSection.tsx::ResourcesSection
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, arayüz metinlerini kullanıcının dil ayarına göre yükler
  - `items` — Sayfada gösterilecek 3 kaynak öğesini tutan sabit dizi, her öğe title, href, icon alanları içerir
  - `it` — items dizisi üzerinde map ile iterasyon yaparken her bir kaynak öğesini temsil eden değişken, it.title, it.href, it.icon alanları kullanılır
- **Dönüş**: Kaynaklar bölümünü oluşturan React JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ResourcesSection.tsx::BookOpenIcon
- **params**: size?: number, className?: string
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: Açık kitap ikonunu oluşturan SVG JSX elementi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\ResourcesSection.tsx::FileTextIcon
- **params**: size?: number, className?: string
- **ic_degiskenler**: (iç değişken yok)
- **Dönüş**: Metin dosyası ikonunu oluşturan SVG JSX elementi

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    ResourcesSection_tsx__BookOpenIcon["BookOpenIcon"]
    ResourcesSection_tsx__FileTextIcon["FileTextIcon"]
    ResourcesSection_tsx__ResourcesSection["ResourcesSection"]
```

## NODE ID STANDARD

  file: src\components\ResourcesSection.tsx
  function: src\components\ResourcesSection.tsx::ResourcesSection
  function: src\components\ResourcesSection.tsx::BookOpenIcon
  function: src\components\ResourcesSection.tsx::FileTextIcon

---

## DISA AKTARILANLAR (EXPORTS)
  export: BookOpenIcon
  export: FileTextIcon
  export: ResourcesSection

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-br`, `bg-white`, `border-light-gray`, `from-gray-50`, `group-hover:text-primary-navy`, `md:text-3xl`, `text-2xl`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `to-white`
- **Layout:** `flex`, `from-gray-50`, `gap-3`, `gap-4`, `grid`, `grid-cols-1`, `hover:shadow-md`, `items-center`, `items-start`, `justify-between`, `max-w-7xl`, `md:grid-cols-3`, `p-5`
- **Varyant/Responsive:** `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-medium`, `font-semibold`, `group`, `hover:underline`, `lg:px-8`, `mb-6`, `mt-0.5`, `mx-auto`, `px-4`, `py-12`, `rounded-xl`, `sm:px-6`, `transition`