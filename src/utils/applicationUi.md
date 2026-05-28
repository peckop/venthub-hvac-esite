---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx
skeleton_hash: 7e0879c26b026cb4
generated_at: 2026-05-23T22:33:37Z
---

## Genel Bakış
Bu utils modülü, VentHub HVAC projesinin uygulama genelinde tutarlı kullanıcı arayüzü deneyimi sunmak için gerekli ortak UI yardımcı fonksiyonlarını barındırır. Uygulamada kullanılan ikon ve vurgu renklerinin standart hale getirilmiş şekilde kullanılmasını sağlayarak, farklı bileşenlerde tekrarlanan UI mantığını tek merkezde toplar.

## Fonksiyon Grupları
### İkon Yönetim Fonksiyonları
Uygulamada tanımlı standart ikonları, istenen boyuta göre uygun şekilde sunmak için kullanılan fonksiyonu içerir. Farklı ekran ve bileşenlerde aynı ikonların tutarlı biçimde gösterilmesini sağlar.
- iconFor

### Vurgu Rengi Stili Üretim Fonksiyonları
Uygulamada kullanılan özel vurgu renkleri için gerekli CSS sınıflarını dinamik olarak oluşturan fonksiyonu barındırır. Tema renklerinin uygulama genelinde tutarlı uygulanmasını kolaylaştırır.
- accentOverlayClass

---

## AXIOMS – Mimari Varsayımlar
Bu modül, uygulama kullanıcı arayüzü için ikon bileşenleri ve vurgu renk katmanı CSS sınıfları üretmek üzere tasarlanmıştır, çalışması için tanımlı girdi tipleri ve eksiksiz Svg ikon kaynağına bağlıdır.

[Aksiyom 1]: Eğer ApplicationIcon tipi/Enum'ı proje genelinde tanımlı değilse, iconFor fonksiyonu geçersiz ikon girdileri alarak beklenmedik çıktılar üretir, arayüzde ikonlar hiçbir şekilde görünmez.
[Aksiyom 2]: Eğer ApplicationAccent tipi/Enum'ı proje genelinde tanımlı değilse, accentOverlayClass fonksiyonu geçersiz vurgu değeri alarak çalışmaz, arayüzde tüm vurgu stili bozuklukları oluşur.
[Aksiyom 3]: Eğer modül sabiti olarak tanımlanan Svg nesnesi, tüm geçerli ApplicationIcon değerlerine karşılık gelen render edilebilir bileşenleri içermiyorsa, iconFor fonksiyonu eksik ikon hatası döndürür, kullanıcı arayüzünde boşluklar veya hata simgeleri görünür.
[Aksiyom 4]: Eğer iconFor fonksiyonuna gönderilen size parametresi geçerli bir CSS boyut standardına uymayan bir değer ise, ikonlar doğru boyutta render edilemez, arayüz elemanları diziliminde genel bozulmalar meydana gelir.
[Aksiyom 5]: Eğer accentOverlayClass fonksiyonuna gönderilen accent parametresi tanımlı tüm ApplicationAccent değerlerinden biri değilse, fonksiyon geçersiz CSS sınıfı üretir, hiçbir vurgu efekti arayüze uygulanamaz.

---

## FONKSIYON DETAYLARI

### iconFor
**Ne yapar**: Uygulama arayüzünde kullanılacak standart ikonların doğru tür ve boyutta görüntülenmesini sağlamak üzere ilgili ikon varlığını eşleyen bir kullanıcı arayüzü yardımcı fonksiyonudur. Proje içindeki tüm ikon kullanımlarında merkezi olarak ikon atamalarını yönetmek, tutarsız ikon kullanımlarını önlemek için tasarlanmıştır.
**Nasıl yapar**: Gelen ikon kimliği ve boyut parametrelerini sisteme kayıtlı mevcut ikon varlıklarıyla karşılaştırır, belirtilen boyut ayarlarına göre ikonun ekrana uygun şekilde render edilmesi için gerekli yapılandırmayı oluşturur. Tüm bileşenlerde tek tip ikon standardı sağlayarak arayüz tutarlılığını korur.
**Parametreler**:
- name: icon, type: ApplicationIcon — Uygulamada tanımlı tüm standart ikon tiplerini kapsayan ApplicationIcon tipinden bir değer, eşleştirme işleminin yapılacağı hedef ikonu temsil eder.
- name: size, type: Belirtilmemiş — İkonun ekranda görüntüleneceği boyut değerini taşıyan parametre, ikonun boyutlandırma ayarlarını belirlemek için kullanılır.
**Dönüş**: Dönüş tipi tanımlanmamıştır, ikon bileşenini işlemek üzere dahili olarak kullanılan yardımcı bir fonksiyondur.

### accentOverlayClass
**Ne yapar**: Uygulama arayüzündeki vurgu (accent) katmanlarının doğru renk stiline sahip olmasını sağlamak üzere gelen vurgu rengi değerine uygun CSS sınıfını eşleyen bir kullanıcı arayüzü stil yardımcı fonksiyonudur. Tüm vurgu katmanlarında renk standartlaşmasını sağlamak için merkezi olarak tüm bileşenlerde kullanılır.
**Nasıl yapar**: Gelen vurgu rengi kimliğini proje içinde tanımlı mevcut stil sınıflarıyla eşleştirir, eşleşen geçerli CSS sınıfını ilgili arayüz öğesine uygulanmak üzere sunar. Farklı sayfalarda veya bileşenlerde aynı vurgu renklerinin tutarlı bir şekilde kullanılmasını garanti eder.
**Parametreler**:
- name: accent, type: ApplicationAccent — Uygulamada tanımlı tüm standart vurgu renklerini kapsayan ApplicationAccent tipinden bir değer, eşleştirme işleminin yapılacağı hedef vurgu rengini temsil eder.
**Dönüş**: Dönüş tipi tanımlanmamıştır, stil sınıfını ilgili arayüz öğesine uygulamak üzere dahili olarak kullanılan yardımcı bir fonksiyondur.

---

## SABİTLER
- **Svg** (object) — `{
  building: (size: number) => (
    <svg width={size} height={size} viewB...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx::Svg.building
- **params**: (size: number)
- **ic_degiskenler**:
  - `size` — Bina ikonlu SVG'in genişlik ve yükseklik değerini belirleyen parametre, <svg> etiketinin width ve height özniteliklerine atanır
- **Dönüş**: JSX SVG elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx::Svg.wind
- **params**: (size: number)
- **ic_degiskenler**:
  - `size` — Rüzgar ikonlu SVG'in genişlik ve yükseklik değerini belirleyen parametre, <svg> etiketinin width ve height özniteliklerine atanır
- **Dönüş**: JSX SVG elementi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx::Svg.layers
- **params**: (size: number)
- **ic_degiskenler**:
  - `size` — Katmanlar ikonlu SVG'in genişlik ve yükseklik değerini belirleyen parametre, <svg> etiketinin width ve height özniteliklerine atanır
- **Dönüş**: JSX SVG elementi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx::Svg.factory
- **params**: (size: number)
- **ic_degiskenler**:
  - `size` — Fabrika ikonlu SVG'in genişlik ve yükseklik değerini belirleyen parametre, <svg> etiketinin width ve height özniteliklerine atanır
- **Dönüş**: JSX SVG elementi

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx::iconFor
- **params**: (icon: ApplicationIcon, size = 18)
- **ic_degiskenler**:
  - `icon` — Döndürülecek ikon türünü belirten ApplicationIcon tipinde değer, switch bloğunda eşleştirme yapılır
  - `size` — İkonun boyutunu ayarlayan, varsayılan değeri 18 olan sayısal parametre, seçilen SVG fonksiyonuna iletilir
  - `Svg.building` — Bina ikonu üreten fonksiyon, 'building' icon değeriyle çağrılır
  - `Svg.wind` — Rüzgar ikonu üreten fonksiyon, 'wind' icon değeriyle çağrılır
  - `Svg.layers` — Katmanlar ikonu üreten fonksiyon, 'layers' icon değeriyle çağrılır
  - `Svg.factory` — Fabrika ikonu üreten fonksiyon, 'factory' icon değeriyle çağrılır
- **Dönüş**: İkon JSX SVG elementi veya geçersiz icon durumunda null

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx::accentOverlayClass
- **params**: (accent: ApplicationAccent)
- **ic_degiskenler**:
  - `accent` — Döndürülecek renk sınıfını belirten ApplicationAccent tipinde değer, switch bloğunda eşleştirme yapılır
- **Dönüş**: Tailwind CSS gradyan başlangıç sınıfı string'i

---

## NODE ID STANDARD

  file: src\utils\applicationUi.tsx
  function: src\utils\applicationUi.tsx::iconFor
  function: src\utils\applicationUi.tsx::accentOverlayClass

---

## DISA AKTARILANLAR (EXPORTS)
  export: accentOverlayClass
  export: iconFor