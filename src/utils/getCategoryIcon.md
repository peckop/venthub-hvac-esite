---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\getCategoryIcon.tsx
skeleton_hash: 3ebb541d03aef2e0
entity_hashes:
  func:getCategoryIcon: e7e3d3061db761f5
  overview: c7c53a125873016e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
VentHub HVAC yönetim projesinde kullanılan bu yardımcı modül, kullanıcı arayüzünde farklı kategoriler yanında gösterilecek uygun ikonları sağlamak amacıyla tasarlanmıştır. React tabanlı projede ikon yönetimini merkezileştiren modül, gelen kategori tanımlayıcısına göre eşleşen ikon bileşenini, istenen özelliklere göre düzenleyerek döndürür.

## Fonksiyon Grupları
### Kategori İkonu Eşleştirme ve Sunumu
Modülün tek sorumluluğunu üstlenen bu grup, gelen kategori benzersiz kimliğiyle doğru ikonu eşleştirir ve istenen görünüm ayarlarını ikona uygulayarak kullanıma sunar.
- getCategoryIcon

---

## AXIOMS – Mimari Varsayımlar
Bu modül, verilen kategori slug'ına uygun ikon bileşeni döndürmek üzere tasarlanmıştır, çalışması için girdi parametrelerinin, bağımlılıklarının ve tip tanımlarının doğruluğu zorunludur.

[Aksiyom 1]: Eğer getCategoryIcon fonksiyonuna geçirilen categorySlug parametresi string tipinde değil veya modül içinde tanımlı geçerli kategori listesinde yoksa, kategoriye özel ikon döndürülemez, çalışma zamanı hatası oluşur veya yanlış ikon görüntülenir.
[Aksiyom 2]: Eğer getCategoryIcon fonksiyonuna geçirilen props parametresi IconProps tip tanımına uymuyorsa veya içindeki zorunlu özellikler eksik kalırsa, ikon bileşeni doğru şekilde oluşturulamaz, derleme veya çalışma zamanı hatası oluşur.
[Aksiyom 3]: Eğer modülün içe aktardığı tüm ikon bileşenleri proje derleme sürecinde eksiksiz olarak dahil edilmemişse, getCategoryIcon fonksiyonu çalışmaz ve uygulama çalışma zamanında hata fırlatır.

---

## FONKSİYON DETAYLARI

### getCategoryIcon
**Ne yapar**: VentHub HVAC projesi için kategori bazlı ikon eşleştirmesi yapan React yardımcı fonksiyonudur. Gelen kategori tanımlayıcısına göre ilgili ikon bileşenini seçerek, istenen özelliklerle birlikte kullanıma sunar. Farklı HVAC kategorileri için proje genelinde tutarlı ikon kullanımı sağlamak amacıyla merkezi bir yapı sunar.
**Nasıl yapar**: İçerisinde önceden tanımlanmış kategori slug-ikon eşleşmeleri sözlüğünü kullanır. Gelen categorySlug değerini bu sözlükte arar, eşleşme bulunduğunda ilgili ikon bileşenine iletilen tüm props değerlerini aktararak render eder. Eşleşme bulunamaması durumunda varsayılan genel bir ikon kullanarak kullanıcı deneyiminde kesinti oluşturmaz, beklenmedik hata oluşma riskini tamamen ortadan kaldırır.
**Parametreler**:
- name: categorySlug, type: string — HVAC kategorisinin benzersiz metin tabanlı tanımlayıcısı, hangi ikonun seçileceğini belirleyen anahtar değer olarak kullanılır
- name: props, type: IconProps — İkonun boyutu, rengi, tıklama olayları gibi tüm görsel ve işlevsel niteliklerini barındıran nesne, doğrudan seçilen ikon bileşenine aktarılır
**Dönüş**: Tanımlanmış bir dönüş tipi yoktur, React bileşeni yapısında tasarlanmıştır, doğrudan ilgili ikon bilezenini ekrana render etmek üzere çalışır, ek bir değer döndürmez.

---

## İTHALATLAR (IMPORTS)
- import: react::React

---

## TYPE ALIASES

### IconProps
```typescript
type IconProps = { className?: string; size?: number }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\getCategoryIcon.tsx::getCategoryIcon
- **params**: 
  - `categorySlug: string` — Giriş parametresi, ikon eşleştirmesi yapılacak ürün kategorisinin benzersiz string kodunu taşır
  - `props: IconProps` — Giriş parametresi, ikon bileşenlerine aktarılacak tüm özellikleri içerir, varsayılan değeri boş nesnedir {}
- **ic_degiskenler**: Fonksiyon gövdesinde herhangi bir yerel değişken tanımlanmamış, yalnızca giriş parametreleri kullanılmıştır
- **Dönüş**: categorySlug değerine göre eşleşen React ikon bileşeni, kendisine aktarılan tüm props'lar ile birlikte döndürülür; tüm case'lerde ve varsayılan durumda mutlaka bir JSX elementi döndürülür

---

## NODE ID STANDARD

  file: src\utils\getCategoryIcon.tsx
  function: src\utils\getCategoryIcon.tsx::getCategoryIcon

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategoryIcon

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
- **Yardımcı Sınıflar:** (yok)