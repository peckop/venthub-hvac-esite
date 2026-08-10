---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\applicationUi.tsx
skeleton_hash: 857b9dfeb4799369
entity_hashes:
  func:accentOverlayClass: d8ef037541c09389
  func:iconFor: 8ef77854d85af42b
  overview: bbb9266e1effc225
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulaması genelinde tutarlı bir kullanıcı arayüzü deneyimi sağlamak için temel UI yardımcı fonksiyonlarını merkezi olarak sunar. İkonların boyutlandırılmasına ve vurgu renkleri için CSS sınıflarının dinamik oluşturulmasına ilişkin standart işlevleri içererek, farklı bileşenlerdeki tekrarlanan UI mantığını önler.

## Fonksiyon Grupları
### İkon Yönetim Fonksiyonları
Uygulamadaki standart ikonların, verilen boyut parametresine göre doğru şekilde render edilmesini ve gösterilmesini sağlar.
- iconFor

### Vurgu Rengi Stili Üretim Fonksiyonları
Uygulama temasındaki belirli vurgu renkleri için gerekli CSS sınıflarını, bileşenlerde kullanılacak şekilde dinamik olarak üretir.
- accentOverlayClass

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC uygulamasında ikon gösterimi ve vurgu rengi CSS sınıfı üretimi için merkezi UI yardımcı fonksiyonları sunar.

**[Aksiyom 1]:** Eğer `Svg` objesi (modül sabiti) tanımlı değilse veya içeriği eksikse, `iconFor` fonksiyonu istenen ikonu render edemez ve ikon gösterimi başarısız olur.

**[Aksiyom 2]:** Eğer `icon` parametresi geçerli bir `ApplicationIcon` değeri değilse, `iconFor` fonksiyonu eşleşen SVG kaynağı bulamaz ve ikon gösterilemez.

**[Aksiyom 3]:** Eğer `size` parametresi `iconFor` fonksiyonuna geçirilmezse, ikon için varsayılan bir boyut kullanılacağı varsayılır (değer bilinmiyor — default parametre değeri imzada belirtilmemiş).

**[Aksiyom 4]:** Eğer `accent` parametresi geçerli bir `ApplicationAccent` değeri değilse, `accentOverlayClass` fonksiyonu eşleşen CSS sınıfı üretemez ve vurgu rengi stili uygulanamaz.

**[Aksiyom 5]:** Eğer `accentOverlayClass` fonksiyonu tarafından üretilen CSS sınıf adı, uygulamanın global stil tanımlarında (örn: Tailwind, CSS modülleri) tanımlı değilse, vurgu rengi görsel olarak uygulanmaz.

---

## FONKSİYON DETAYLARI

### iconFor
**Ne yapar**: Verilen `ApplicationIcon`枚ger değerine karşılık gelen SVG vektör grafiğini, belirtilen boyutta oluşturur ve döndürür. Bu fonksiyon, uygulamadaki ikonları standart bir şekilde göstermek için kullanılır.

**Nasıl yapar**: Fonksiyon, `icon` parametresinin değerine göre bir `switch` yapısı kullanır. Her durum, belirli bir ikon adı için ilgili `Svg` modülünden bir bileşeni (`Svg.building`, `Svg.wind` vb.) çağırarak, `size` parametresiyle boyutlandırılmış bir SVG döndürür. Tanınmayan bir ikon gelirse `default` dalında `null` değerini döndürür.

**Parametreler**:
- icon: `ApplicationIcon` — Hangi ikonun gösterileceğini belirten枚ger tipindeki değer (örn. 'building', 'wind').
- size: `number` (Varsayılan: 18) — İkonun piksel cinsinden yüksekliği ve genişliği.

**Dönüş**: `React.ReactElement | null` — Belirtilen boyut ve türde bir SVG React bileşeni veya geçersiz ikon durumunda `null`.

### accentOverlayClass
**Ne yapar**: Verilen `ApplicationAccent`枚ger değerine karşılık gelen, bir arka plan rengi için użylabilecek CSS gradyan sınıf adını döndürür. Bu sınıf adları, bir üzerine bindirme (overlay) efekti oluşturmak için Tailwind CSS stilleri ile kullanılır.

**Nasıl yapar**: Fonksiyon, `accent` parametresinin değerine göre bir `switch` yapısı kullanarak, her vurgu rengi için önceden tanımlanmış bir Tailwind CSS gradyan sınıf dizesini (`'from-secondary-blue/10'` gibi) eşler. Tanınmayan bir renk geldiğinde varsayılan olarak gri tona sahip bir gradyan sınıfını döndürür.

**Parametreler**:
- accent: `ApplicationAccent` — Hangi vurgu renginin gradyanının seçileceğini belirten枚ger tipindeki değer (örn. 'blue', 'navy', 'emerald').

**Dönüş**: `string` — Seçilen renge karşılık gelen, opaklığı ayarlanmış bir Tailwind CSS gradyan başlangıç sınıf adı.

---

## İTHALATLAR (IMPORTS)
- import: ../config/applications::type { ApplicationAccent, ApplicationIcon }
- import: react::React

---

## SABİTLER
- **Svg** (object) — `{
  building: (size: number) => (
    <svg width={size} height={size} viewB...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/applicationUi.tsx::iconFor
- **params**: (icon: ApplicationIcon, size = 18)
- **ic_degiskenler**: Yok
- **Dönüş**: React elementi (Svg objesinden alınan SVG bileşeni) veya null

### [N2_NASIL] AST Pointer: src/utils/applicationUi.tsx::accentOverlayClass
- **params**: (accent: ApplicationAccent)
- **ic_degiskenler**: Yok
- **Dönüş**: string (Tailwind CSS gradient class adı)

---

## NODE ID STANDARD

  file: src\utils\applicationUi.tsx
  function: src\utils\applicationUi.tsx::iconFor
  function: src\utils\applicationUi.tsx::accentOverlayClass

---

## DISA AKTARILANLAR (EXPORTS)
  export: accentOverlayClass
  export: iconFor

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