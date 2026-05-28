---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\DuctCalcPage.tsx
skeleton_hash: 834d4aeeba7373bf
entity_hashes:
  func:DuctCalcPage: 531002b319923b38
  func:reset: 16764b441f7bc7b6
  overview: 942800c1e8cf5fbf
  style_tokens: 002582f3ef540f0d
generated_at: 2026-05-28T22:39:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde kanal hesaplama işlemlerini gerçekleştiren React tabanlı bir sayfa bileşenidir. Kullanıcıların HVAC sistemleri için gerekli kanal boyutlarını hesaplayabileceği etkileşimli bir arayüz sunar ve hesaplama sürecinin yönetimini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kanal hesaplama sayfasının tüm arayüzünü ve iş mantığını bir arada yöneten ana React bileşenidir. Kullanıcıdan girdi alır, hesaplama işlemlerini koordine eder ve sonuçları görüntüler.
- DuctCalcPage

### Hesaplama Yardımcı İşlemleri
Kullanıcı tarafından girilen değerlerin ve hesaplama durumunun başlangıç değerlerine dönüştürülmesini sağlayan yardımcı işlevdir. Form alanlarını temizleyerek kullanıcının yeni bir hesaplama yapmasına olanak tanır.
- reset

---

## AXIOMS – Mimari Varsayımlar
DuctCalcPage modülünün doğru çalışması için React bileşeni lifecycle ve form state yönetimi temel varsayımları geçerlidir.

[Aksiyom 1]: Eğer DuctCalcPage bileşeni için hesaplama form alanlarına karşılık gelen state'ler (useState, vb.) tanımlı değilse, kullanıcı veri giremez veya

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

## AST POINTERS

### [N1_NASIL] AST Pointer: DuctCalcPage.tsx::DuctCalcPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hookundan dönen çeviri fonksiyonu
  - `ductTypeOptions` — useMemo ile hesaplanan kanat tipi seçenekleri (circular/rectangular)
  - `materialOptions` — useMemo ile hesaplanan malzeme seçenekleri (galvanized/pvc/flex)
  - `airflow` — hava debisi state değişkeni (varsayılan: '500')
  - `setAirflow` — airflow state'ini güncelleyen setter
  - `ductType` — kanat tipi state değişkeni (DuctType: 'rectangular')
  - `setDuctType` — ductType state'ini güncelleyen setter
  - `diameter` — çap state değişkeni (sadece dairesel kanat için, varsayılan: '200')
  - `setDiameter` — diameter state'ini güncelleyen setter
  - `width` — genişlik state değişkeni (sadece dikdörtgen kanat için, varsayılan: '300')
  - `setWidth` — width state'ini güncelleyen setter
  - `height` — yükseklik state değişkeni (sadece dikdörtgen kanat için, varsayılan: '200')
  - `setHeight` — height state'ini güncelleyen setter
  - `length` — uzunluk state değişkeni (varsayılan: '10')
  - `setLength` — length state'ini güncelleyen setter
  - `material` — malzeme state değişkeni (DuctMaterial: 'galvanized')
  - `setMaterial` — material state'ini güncelleyen setter
  - `result` — useMemo ile hesaplanan kanat hesaplama sonucu (DuctCalcResult veya null)
  - `reset` — formu sıfırlayan fonksiyon
- **Dönüş**: JSX (CalculatorLayout bileşeni)

### [N2_NASIL] AST Pointer: DuctCalcPage.tsx::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setAirflow` — airflow state'ini '500' değerine sıfırlayan setter
  - `setDuctType` — ductType state'ini 'rectangular' değerine sıfırlayan setter
  - `setDiameter` — diameter state'ini '200' değerine sıfırlayan setter
  - `setWidth` — width state'ini '300' değerine sıfırlayan setter
  - `setHeight` — height state'ini '200' değerine sıfırlayan setter
  - `setLength` — length state'ini '10' değerine sıfırlayan setter
  - `setMaterial` — material state'ini 'galvanized' değerine sıfırlayan setter
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: DuctCalcPage.tsx::ductTypeOptions (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hookundan dönen çeviri fonksiyonu (closure tarafından erişiliyor)
  - `Circle` — lucide-react icon bileşeni (dairesel kanat için)
  - `Square` — lucide-react icon bileşeni (dikdörtgen kanat için)
- **Dönüş**: Array<{value: string, label: string, description: string, icon: JSX.Element}>

### [N4_NASIL] AST Pointer: DuctCalcPage.tsx::materialOptions (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hookundan dönen çeviri fonksiyonu (closure tarafından erişiliyor)
- **Dönüş**: Array<{value: string, label: string, description: string}>

### [N5_NASIL] AST Pointer: DuctCalcPage.tsx::result (useMemo callback)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `flow` — airflow state'inin parseFloat ile sayısal karşılığı
  - `len` — length state'inin parseFloat ile sayısal karşılığı
  - `dia` — diameter state'inin parseFloat ile sayısal karşılığı
  - `w` — width state'inin parseFloat ile sayısal karşılığı
  - `h` — height state'inin parseFloat ile sayısal karşılığı
- **Dönüş**: DuctCalcResult nesnesi veya null (hatalı girdi durumunda)

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