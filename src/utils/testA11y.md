---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\testA11y.tsx
skeleton_hash: b4d0b31ea211e1da
generated_at: 2026-05-23T22:34:18Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin utility araçları arasında yer alır ve kullanıcı arayüzü elemanlarının erişilebilirlik (a11y) standartlarına uygunluğunu otomatik olarak test etmek için tasarlanmıştır. Proje test süreçlerinde entegre edilerek hem React tabanlı UI bileşenleri hem de native HTML DOM elementleri üzerinde erişilebilirlik denetimleri gerçekleştirir.

## Fonksiyon Grupları
### Ana Erişilebilirlik Test İşlevi
Modülün tüm sorumluluğunu üstlenen, girdi olarak alınan herhangi bir React bileşeni ya da HTML elementi üzerinde tüm erişilebilirlik testlerini koordine edip sonuçlandıran asenkron ana işlevdir.
- testA11y

---

## AXIOMS – Mimari Varsayımlar
Bu modül, UI bileşenlerinin erişilebilirlik (a11y) uygunluğunu test etmek için tasarlanmıştır, çalışması için DOM desteği olan bir çalışma ortamına ve gerekli üçüncü parti bağımlılıkların projeye dahil edilmiş olması zorunludur.

[Aksiyom 1]: Eğer fonksiyona geçirilen `ui` parametresi ne ReactElement ne de HTMLElement türünde değilse, erişilebilirlik testi çalışmaz ve tür uyumsuzluğu hatası oluşur.
[Aksiyom 2]: Eğer React kütüphanesi modülün çalıştığı ortamda yüklü değilse, ReactElement tipi tanınmaz ve tür kontrolü başarısız olur.
[Aksiyom 3]: Eğer modülün çalıştığı ortam DOM ağacını desteklemiyorsa, HTMLElement tipi üzerinden işlem yapılamaz ve test çalışmaz.
[Aksiyom 4]: Eğer erişilebilirlik testlerini gerçekleştiren üçüncü parti a11y kütüphanesi proje bağımlılıklarında mevcut değilse, modül import edilemez ve hiçbir şekilde çalıştırılamaz.

---

## FONKSIYON DETAYLARI

### testA11y
**Ne yapar**: React tabanlı projelerdeki kullanıcı arayüzü öğelerinin WCAG erişilebilirlik standartlarına uygunluğunu denetleyen bir test yardımcı fonksiyonudur. Saha denetimi yani dinamik erişilebilirlik incelemesi yapan bu fonksiyon, test senaryolarında kullanılarak yazılımın erişilebilirlik gereksinimlerini karşılayıp karşılamadığını doğrulamak amacıyla tasarlanmıştır. Girdi olarak aldığı herhangi bir React öğesi veya HTML DOM öğesi üzerinde otomatik erişilebilirlik taraması gerçekleştirir.
**Nasıl yapar**: Öncelikle aldığı girdi öğesinin durumuna göre işlem akışını yönlendirir; eğer henüz DOM ortamına monte edilmemiş bir ReactElement ise bu öğeyi JSDOM tabanlı bir sanal DOM konteynırına monte eder. Eğer zaten render edilmiş bir HTMLElement almışsa doğrudan bu öğe üzerinde işlem yapar. Ardından hazırlanan konteynır üzerinde erişilebilirlik kütüphanesi axe-core'u çalıştırarak tüm olası standart ihlallerini toplar, analiz sonuçlarını standart formatta döndürür.
**Parametreler**:
- ui: ReactElement | HTMLElement — Erişilebilirlik incelemesi yapılacak olan kullanıcı arayüzü öğesidir. Henüz DOM'a eklenmemiş bir React bileşeni (ReactElement) ya da daha önceden render edilerek DOM'da yer alan bir HTML DOM öğesi (HTMLElement) olarak fonksiyona gönderilebilir.
**Dönüş**: axe-core analizinin sonuçlarını içeren asenkron olarak çözülen bir söz nesnesi döndürür. Bu sonuç nesnesi, test ortamlarında `expect(results).toHaveNoViolations()` gibi doğrulama ifadeleriyle doğrudan kullanılarak herhangi bir erişilebilirlik ihlali olup olmadığı kontrol edilebilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\testA11y.tsx::testA11y
- **params**: ui: ReactElement | HTMLElement
- **ic_degiskenler**:
  - `container` — Giriş parametresi ui zaten HTMLElement türündeyse doğrudan atanan, değilse @testing-library/react'in render fonksiyonu ile React elemanı renderlandıktan sonra elde edilen DOM kapsayıcısı; erişilebilirlik testi için axe fonksiyonuna iletilmek üzere kullanılır
- **Dönüş**: axe(container) çağrısından dönen promise'ın çözülmesiyle elde edilen erişilebilirlik test sonuçları

---

## NODE ID STANDARD

  file: src\utils\testA11y.tsx
  function: src\utils\testA11y.tsx::testA11y

---

## DISA AKTARILANLAR (EXPORTS)
  export: testA11y