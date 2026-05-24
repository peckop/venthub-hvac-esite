---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ResourcesSection.tsx
skeleton_hash: 80aff6d26e936cbe
generated_at: 2026-05-23T22:26:57Z
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

## FONKSIYON DETAYLARI

### ResourcesSection
**Ne yapar**: VentHub HVAC projesinin kaynaklar bölümünü oluşturan ana React bileşenidir, kullanıcıların erişmesi gereken tüm proje kaynaklarını tek bir düzenli bölümde toplar ve kullanıcı arayüzünde sunar. Proje içindeki diğer bileşenlerle entegre çalışarak kaynak erişimini kolaylaştıran bir bölümün temel yapısını oluşturur.
**Nasıl yapar**: React.FC türünde bir bileşen olarak tanımlanır, içerdiği ikon ve içerik bileşenlerini bir araya getirerek bölümün tüm kullanıcı arayüzü elementlerini tek bir JSX yapısı olarak hazırlar. Herhangi bir harici yapılandırmaya ihtiyaç duymadan bağımsız olarak render edilebilir şekilde tasarlanmıştır.
**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: React.FC türünde bir React bileşeni döndürür, bu bileşen kaynaklar bölümünün tüm görsel ve işlevsel yapısını ekrana render eder.

---

### BookOpenIcon
**Ne yapar**: Kaynaklar bölümünde eğitim kılavuzları, proje dokümantasyonları veya kitap formatındaki içeriklerin yanında görsel işaretleyici olarak kullanılan, açık kitap şeklinde bir ikon bileşenidir. Kullanıcıların içerik türünü ilk bakışta anlamasını sağlayan görsel bir ipucu görevi görür.
**Nasıl yapar**: Varsayılan boyut ve CSS sınıfı değerlerini alarak ikonun görünümünü dinamik olarak özelleştirir, gelen parametrelere göre boyutunu ve stilini ayarlayarak istenen görsel standardında ikonu ekrana render eder.
**Parametreler**:
- size: number, opsiyonel — İkonun piksel cinsinden boyutunu belirler, varsayılan olarak 20 değeri atanmıştır.
- className: string, opsiyonel — İkona ek olarak uygulanacak özel CSS sınıflarını alır, varsayılan olarak boş string değeri atanmıştır.
**Dönüş**: Dönüş tipi tanımlanmamıştır, JSX tabanlı bir görsel ikon öğesi olarak ekrana render edilmek üzere tasarlanmış bir React bileşenidir.

---

### FileTextIcon
**Ne yapar**: Kaynaklar bölümünde metin dosyaları, teknik raporlar, proje şartnameleri veya metin tabanlı diğer belgelerin yanında görsel işaretleyici olarak kullanılan, metin içeren dosya şeklinde bir ikon bileşenidir. Kullanıcıların içerik türünü hızlıca ayırt etmesini sağlayan görsel bir ipucu sunar.
**Nasıl yapar**: Aldığı boyut ve özel CSS sınıfı parametrelerini kullanarak ikonun görünümünü kullanıcı ihtiyaçlarına göre ayarlar, gelen değerlere göre boyutunu ve stilini düzenleyerek tutarlı bir görsel deneyim sunacak şekilde ikonu ekrana ekler.
**Parametreler**:
- size: number, opsiyonel — İkonun piksel cinsinden genişlik ve yükseklik değerini belirler, varsayılan olarak 20 değeri atanmıştır.
- className: string, opsiyonel — İkona uygulanacak ekstra özel CSS sınıflarını içerir, varsayılan olarak boş string değeri atanmıştır.
**Dönüş**: Dönüş tipi tanımlanmamıştır, görsel bir ikon olarak JSX yapısını render eden bir React bileşenidir.

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