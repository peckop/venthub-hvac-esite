---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx
skeleton_hash: 6ee6416b7d6a035d
entity_hashes:
  func:DuctCalcPage: 531002b319923b38
  func:reset: 16764b441f7bc7b6
  overview: 1f3bf3c7f06ebe09
  style_tokens: 002582f3ef540f0d
generated_at: 2026-06-19T20:50:07Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kanal (duct) hesaplama işlemlerini yöneten React tabanlı bir sayfa bileşenidir. Kullanıcıların HVAC sistemleri için gerekli kanal boyutlarını hesaplayabileceği etkileşimli bir arayüz sunar ve hesaplama sürecinin yönetimini sağlar. Temel olarak, kullanıcı girdilerini alarak hesaplama yapar ve form alanlarının sıfırlanması gibi yardımcı işlemleri koordine eder.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kanal hesaplama sayfasının tüm arayüzünü ve iş mantığını yöneten ana React bileşenidir. Kullanıcıdan girdi alır, hesaplama işlemlerini koordine eder ve sonuçları görüntüler.
- DuctCalcPage

### Hesaplama Yardımcı İşlemleri
Hesaplama form alanlarının ve kullanıcı girdilerinin başlangıç durumuna sıfırlanmasını sağlayan yardımcı işlevdir. Kullanıcının yeni bir hesaplama sürecine başlaması için formu temizler.
- reset

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesinden türetilebilecek net mimari varsayımlar sınırlıdır; çünkü verilen fonksiyon imzaları (DuctCalcPage() ve reset()) boş veya çok temeldir. Varsayımlar, bu imzaların varlığından ve genel React bileşeni yapısından çıkarımlara dayanır.

[Aksiyom 1]: Eğer DuctCalcPage bileşeni, React tarafından doğru şekilde挂载 (mount) edilmezse, kanal hesaplama arayüzü kullanıcıya gösterilmez.

[Aksiyom 2]: Eğer reset() fonksiyonu çağrılmazsa, bileşen içindeki form alanları veya hesaplama durumu, başlangıç değerlerine sıfırlanmaz.

[Aksiyom 3]: Eğer DuctCalcPage bileşeni içinde state yönetimi (örn. useState) düzgün çalışmıyorsa, kullanıcı girdileri veya hesaplama sonuçları tutarsız kalabilir.

[Aksiyom 4]: Eğer hesaplama mantığı (muhtemelen DuctCalcPage gövdesinde tanımlı) geçerli bir parametre kümesi almazsa (örn. eksik kanal boyutu girdisi), hesaplama sonucu hatalı veya eksik olabilir.

[Aksiyom 5]: Eğer form doğrulama (input validation) fonksiyon gövdesinde uygulanmışsa, geçersiz değerler (örn. negatif kanal genişliği) hesaplamaya sokulmamalıdır; aksi halde hesaplama sonucu geçersiz olur. (Not: Varsayılan değerler verilmediği için, doğrulama kuralları ve eşik değerleri bilinmiyor.)

---

## FONKSİYON DETAYLARI

### DuctCalcPage
**Ne yapar**: VentHub-HVAC projesindeki hesaplayıcılar (calculators) bölümünde yer alan kanal (duct) hesaplama sayfasını render eden React bileşenidir.
**Nasıl yapar**: Fonksiyonun iç mantığı hakkında detaylı bilgi docstring'de sağlanmamıştır. React fonksiyonel bileşeni olarak kanal hesaplama arayüzünü ekrana getirir.
**Parametreler**:
- Parametre belirtilmemiş
**Dönüş**: React.FC — React fonksiyonel bileşeni olarak sayfa içeriğini döndürür.

### reset
**Ne yapar**: Kanal hesaplama sayfasındaki formu veya hesaplama durumunu başlangıç değerlerine sıfırlayan bir fonksiyondur.
**Nasıl yapar**: Fonksiyonun iç mantığı hakkında detaylı bilgi docstring'de sağlanmamıştır. İsminden anlaşılacağı üzere, bir durumu başlangıç noktasına geri getirir.
**Parametreler**:
- Parametre belirtilmemiş
**Dönüş**: void veya bilinmiyor — Fonksiyonun dönüş tipi kesin olarak belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::Circle
- import: lucide-react::RotateCcw
- import: lucide-react::Ruler
- import: lucide-react::Square
- import: lucide-react::Wind
- import: react::React
- import: react::useMemo
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: DuctCalcPage.tsx::DuctCalcPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hookundan gelen çeviri fonksiyonu, tüm metinler için kullanılır
  - `ductTypeOptions` — useMemo ile hesaplanan kanat tipi seçenekleri (circular ve rectangular)
  - `materialOptions` — useMemo ile hesaplanan malzeme seçenekleri (galvanized, pvc, flex)
  - `airflow` — hava debisi değerini tutan state değişkeni
  - `setAirflow` — airflow state'ini güncelleyen setter fonksiyonu
  - `ductType` — seçili kanat tipini tutan state değişkeni (circular veya rectangular)
  - `setDuctType` — ductType state'ini güncelleyen setter fonksiyonu
  - `diameter` — dairesel kanat çapı değerini tutan state değişkeni
  - `setDiameter` — diameter state'ini güncelleyen setter fonksiyonu
  - `width` — dikdörtgen kanat genişliği değerini tutan state değişkeni
  - `setWidth` — width state'ini güncelleyen setter fonksiyonu
  - `height` — dikdörtgen kanat yüksekliği değerini tutan state değişkeni
  - `setHeight` — height state'ini güncelleyen setter fonksiyonu
  - `length` — kanat uzunluğu değerini tutan state değişkeni
  - `setLength` — length state'ini güncelleyen setter fonksiyonu
  - `material` — seçili malzeme tipini tutan state değişkeni
  - `setMaterial` — material state'ini güncelleyen setter fonksiyonu
  - `result` — useMemo ile hesaplanan hesaplama sonucu (null veya obje)
  - `reset` — state'leri başlangıç değerlerine sıfırlayan fonksiyon
- **Dönüş**: React component (JSX)

### [N2_NASIL] AST Pointer: DuctCalcPage.tsx::reset
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: DuctCalcPage.tsx::useMemo_ductTypeOptions
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: dizi (option objeleri)

### [N4_NASIL] AST Pointer: DuctCalcPage.tsx::useMemo_materialOptions
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: dizi (option objeleri)

### [N5_NASIL] AST Pointer: DuctCalcPage.tsx::useMemo_calculation
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `flow` — airflow state'inden parse edilen float, 0 ise fallback 0
  - `len` — length state'inden parse edilen float, 0 ise fallback 0
  - `dia` — diameter state'inden parse edilen float, 0 ise fallback 0
  - `w` — width state'inden parse edilen float, 0 ise fallback 0
  - `h` — height state'inden parse edilen float, 0 ise fallback 0
- **Dönüş**: null veya hesaplama sonucu obje

---

## NODE ID STANDARD

  file: src\views\calculators\DuctCalcPage.tsx
  function: src\views\calculators\DuctCalcPage.tsx::DuctCalcPage
  function: src\views\calculators\DuctCalcPage.tsx::reset

---

## DISA AKTARILANLAR (EXPORTS)
  export: DuctCalcPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100`, `bg-primary-navy/10`, `bg-success-green/10`, `bg-white`, `border-light-gray`, `hover:text-industrial-gray`, `text-center`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`
- **Layout:** `flex`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-2`, `items-center`, `justify-center`, `lg:grid-cols-2`, `p-2`, `p-4`, `p-6`, `shadow-sm`
- **Varyant/Responsive:** `hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `mb-4`, `mb-6`, `py-12`, `rounded-2xl`, `rounded-full`, `rounded-lg`, `space-y-6`, `transition-colors`