---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx
skeleton_hash: 834d4aeeba7373bf
generated_at: 2026-05-23T22:39:31Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde yer alan kanal (duct) hesaplama işlemlerini sunan React tabanlı bir ön yüz sayfa bileşenidir. Kullanıcıların HVAC sistemleri için gerekli kanal boyutları ve ilgili mühendislik hesaplamalarını yapabileceği arayüzü yönetir, hesaplama sürecinde ihtiyaç duyulan temel işlevleri barındırır.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kanal hesaplama sayfasının tüm arayüzünü ve temel çalışma mantığını yöneten ana React bileşenidir, sayfanın tüm işlevlerini bir araya getirerek kullanıcıya sunar.
- DuctCalcPage

### Hesaplama İşlem Yönetimi
Kullanıcı tarafından doldurulan hesaplama formu ve girilen tüm değerleri sıfırlayarak işlemin baştan başlatılmasını sağlayan yardımcı işlevi barındırır.
- reset

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı HVAC kanal hesaplama sayfası modülünün doğru çalışması, ana VentHub uygulamasının çalışma zamanı, rota yapısı ve hesaplama bağımlılıklarının sorunsuz erişilebilir olmasına bağlıdır.

[Aksiyom 1]: Eğer ana uygulamanın rota yapısında DuctCalcPage için tanımlı erişim yolu yoksa, kullanıcı bu hesaplama sayfasına hiç erişemez, yönlendirme hatası alır.
[Aksiyom 2]: Eğer bu modülün kullanması gereken, kendi dosyasında tanımlı olmayan kanal hesaplama mantığına sahip dahili/harici hesaplayıcı modüller proje içinde erişilebilir durumda değilse, sayfa üzerinden hiçbir geçerli hesaplama sonuç üretilmez.
[Aksiyom 3]: Eğer reset() fonksiyonunun eriştiği sayfa içi durum yönetimi nesneleri (girdi ve sonuç state'leri) mevcut değilse, sıfırlama işlemi çalışmaz, kullanıcı eski hesaplama verileriyle karşılaşır.
[Aksiyom 4]: Eğer ana uygulamanın React çalışma zamanı bu bileşeni uygulamaya bağlayamazsa, sayfa hiç render edilmez, kullanıcı arayüzünde yükleme hatası görüntülenir.

---

## FONKSIYON DETAYLARI

### DuctCalcPage
**Ne yapar**: VentHub HVAC projesinin kanal hesaplama (DuctCalc) sayfasını oluşturan ana React bileşenidir. Kullanıcıların HVAC sistemleri için kanal boyutları, basınç kayıpları ve ilgili hesaplamaları yapabileceği özel arayüzü ekrana sunar, sayfanın tüm işlevsel ve görsel yapısını yönetir.
**Nasıl yapar**: Projenin `src/views/calculators` dizininde TypeScript ile yazılmış bir React fonksiyonel bileşeni olarak çalışır. Sayfa içindeki hesaplama formlarını, girdi alanlarını, sonuç göstergelerini ve kullanıcı etkileşimlerini yönetmek için gerekli state yapılarını, yerel fonksiyonları ve UI kütüphanesi elemanlarını entegre ederek arayüzü render eder. Uygulamanın rotalandırma sistemi tarafından çağrıldığında tam teşekküllü hesaplama sayfasını kullanıcıya sunar.
**Parametreler**: Bu bileşen herhangi bir harici parametre almaz, kendi sayfa özelinde tanımlı mantık ve state yapıları ile bağımsız olarak çalışır.
**Dönüş**: React.FC tipinde bir React bileşeni döndürür, bu döndürülen bileşen uygulama içinde ilgili rotada görüntülenmek üzere kullanılır.

### reset
**Ne yapar**: DuctCalcPage sayfasındaki tüm kullanıcı girdilerini, hesaplanmış sonuçları ve sayfanın mevcut durumunu varsayılan başlangıç değerlerine döndüren yerel yardımcı fonksiyondur. Kullanıcıların sıfırdan yeni bir hesaplama başlatabilmesi için mevcut oturumdaki tüm geçici verileri temizler.
**Nasıl yapar**: Sadece içinde tanımlı olduğu DuctCalcPage bileşeninin yerel state ve form değerlerine erişerek, tüm girdi alanlarını, hesaplama sonuçlarını ve seçili parametreleri önceden tanımlı başlangıç değerlerine atar. Sayfanın arayüzünü otomatik olarak güncelleyerek sıfırlanmış durumu kullanıcıya anında yansıtır, herhangi bir kalıcı veri deposuyla etkileşim kurmaz.
**Parametreler**: Bu fonksiyon herhangi bir harici parametre almaz, sadece içinde bulunduğu DuctCalcPage sayfasının yerel durumunu yönetir.
**Dönüş**: Herhangi bir değer döndürmez, işlemini tamamladıktan sonra yalnızca sayfanın arayüzünü güncelleyerek sıfırlanmış durumu kullanıcıya sunar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx::DuctCalcPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm arayüz metinlerini yerelleştirmek için kullanılır
  - `ductTypeOptions` — useMemo ile önbelleğe alınan kanal tipi seçenekleri, radyo grubu bileşeninde kullanılır
  - `materialOptions` — useMemo ile önbelleğe alınan kanal malzemesi seçenekleri, radyo grubu bileşeninde kullanılır
  - `airflow` — Form state'indeki hava akışı string değeri, giriş alanı ile yönetilir
  - `setAirflow` — airflow state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `ductType` — Kanal tipi state değeri, DuctType tipinde 'rectangular' veya 'circular' değerlerini tutar
  - `setDuctType` — ductType state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `diameter` — Dairesel kanal çapı string state değeri, giriş alanı ile yönetilir
  - `setDiameter` — diameter state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `width` — Dikdörtgen kanal genişliği string state değeri, giriş alanı ile yönetilir
  - `setWidth` — width state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `height` — Dikdörtgen kanal yüksekliği string state değeri, giriş alanı ile yönetilir
  - `setHeight` — height state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `length` — Kanal uzunluğu string state değeri, giriş alanı ile yönetilir
  - `setLength` — length state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `material` — Kanal malzemesi state değeri, DuctMaterial tipinde kullanılan malzeme bilgisini tutar
  - `setMaterial` — material state'ini güncellemek için kullanılan React state setter fonksiyonu
  - `result` — useMemo ile hesaplanan gerçek zamanlı kanal hesaplama sonucu, sonuç ekranında kullanılır
  - `reset` — Formu varsayılan değerlere sıfırlamak için tanımlanan yerel fonksiyon
- **Dönüş**: React.FC JSX elementi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx::ductTypeOptions_useMemo_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — Üst kapsamdaki çeviri fonksiyonu, kanal tipi etiket ve açıklamalarını çevirmek için kullanılır
  - `Circle` — lucide-react'ten import edilen dairesel ikon, dairesel kanal seçeneği için kullanılır
  - `Square` — lucide-react'ten import edilen kare ikon, dikdörtgen kanal seçeneği için kullanılır
- **Dönüş**: 2 elemanlı kanal tipi seçenek objesi dizisi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx::materialOptions_useMemo_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — Üst kapsamdaki çeviri fonksiyonu, malzeme etiketlerini çevirmek için kullanılır
- **Dönüş**: 3 elemanlı kanal malzemesi seçenek objesi dizisi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx::result_useMemo_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `airflow` — Üst kapsamdaki form hava akışı string değeri, hesaplamada kullanılmak üzere sayıya dönüştürülür
  - `length` — Üst kapsamdaki form kanal uzunluğu string değeri, hesaplamada kullanılmak üzere sayıya dönüştürülür
  - `diameter` — Üst kapsamdaki form kanal çapı string değeri, hesaplamada kullanılmak üzere sayıya dönüştürülür
  - `width` — Üst kapsamdaki form kanal genişliği string değeri, hesaplamada kullanılmak üzere sayıya dönüştürülür
  - `height` — Üst kapsamdaki form kanal yüksekliği string değeri, hesaplamada kullanılmak üzere sayıya dönüştürülür
  - `ductType` — Üst kapsamdaki form kanal tipi değeri, hangi boyutların kullanılacağını belirlemek için kullanılır
  - `material` — Üst kapsamdaki form kanal malzemesi değeri, hesaplama fonksiyonuna gönderilir
  - `flow` — parseFloat ile sayıya çevrilmiş hava akışı değeri, geçersiz girişlerde 0 varsayılanı ile hesaplamada kullanılır
  - `len` — parseFloat ile sayıya çevrilmiş kanal uzunluğu değeri, geçersiz girişlerde 0 varsayılanı ile hesaplamada kullanılır
  - `dia` — parseFloat ile sayıya çevrilmiş kanal çapı değeri, geçersiz girişlerde 0 varsayılanı ile hesaplamada kullanılır
  - `w` — parseFloat ile sayıya çevrilmiş kanal genişliği değeri, geçersiz girişlerde 0 varsayılanı ile hesaplamada kullanılır
  - `h` — parseFloat ile sayıya çevrilmiş kanal yüksekliği değeri, geçersiz girişlerde 0 varsayılanı ile hesaplamada kullanılır
  - `calculateDuct` — Kanal hesaplamasını yapan harici fonksiyon, tüm parametreleri alarak sonuç döndürür
- **Dönüş**: Hesaplama sonucu obje veya geçersiz girişlerde null

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setAirflow` — Üst kapsamdaki hava akışı state setter'ı, değeri '500' varsayılanına ayarlar
  - `setDuctType` — Üst kapsamdaki kanal tipi state setter'ı, değeri 'rectangular' varsayılanına ayarlar
  - `setDiameter` — Üst kapsamdaki çap state setter'ı, değeri '200' varsayılanına ayarlar
  - `setWidth` — Üst kapsamdaki genişlik state setter'ı, değeri '300' varsayılanına ayarlar
  - `setHeight` — Üst kapsamdaki yükseklik state setter'ı, değeri '200' varsayılanına ayarlar
  - `setLength` — Üst kapsamdaki uzunluk state setter'ı, değeri '10' varsayılanına ayarlar
  - `setMaterial` — Üst kapsamdaki malzeme state setter'ı, değeri 'galvanized' varsayılanına ayarlar
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\views\calculators\DuctCalcPage.tsx
  function: src\views\calculators\DuctCalcPage.tsx::DuctCalcPage
  function: src\views\calculators\DuctCalcPage.tsx::reset

---

## DISA AKTARILANLAR (EXPORTS)
  export: DuctCalcPage