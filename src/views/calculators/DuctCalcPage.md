---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\calculators\DuctCalcPage.tsx
skeleton_hash: a7b7a90699bfdb59
entity_hashes:
  func:DuctCalcPage: 531002b319923b38
  func:reset: 16764b441f7bc7b6
  overview: baef5b6e42c8ff64
  style_tokens: 002582f3ef540f0d
generated_at: 2026-08-27T07:32:38Z
---

## Genel Bakış

DuctCalcPage modülü, kanal (duct) hesaplamalarının yapıldığı bir sayfa bileşenidir. Kullanıcıya kanal boyutlandırma ve ilgili hesaplamaları gerçekleştirmek için arayüz sunar. Bileşen, bir sıfırlama fonksiyonu ile form durumunu başlangıç değerlerine döndürme yeteneği içerir.

## Fonksiyon Grupları

### Ana Bileşen
Sayfanın tamamını oluşturan ve kullanıcı arayüzünü render eden ana React bileşenidir. Kanal hesaplama ile ilgili tüm form elemanlarını, sonuç gösterimlerini ve kullanıcı etkileşimlerini yönetir.
- DuctCalcPage

### Durum Sıfırlama
Form alanlarını ve hesaplama sonuçlarını başlangıç durumuna döndüren fonksiyondur. Kullanıcının mevcut girdileri temizleyerek yeni bir hesaplamaya başlamasını sağlar.
- reset

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdeleri sağlanmadığından, gövde tabanlı mimari varsayımlar üretilememektedir. Yalnızca `DuctCalcPage` ve `reset` fonksiyon imzaları mevcut olup, bu imzalardan davranışsal çıkarım yapılmaz.

---

## FONKSİYON DETAYLARI

### DuctCalcPage
**Ne yapar**: Bu fonksiyon bir React fonksiyonel bileşeni tanımlar. Bileşenin dönüş tipi `React.FC` olarak belirtilmiştir, bu da bir React fonksiyonel bileşen döndürdüğünü gösterir. Fonksiyonun adı ve bulunduğu dosya yolu (`calculators/DuctCalcPage.tsx`) bir kanal (duct) hesaplama sayfası bileşeni olduğunu ima etmektedir ancak bu çıkarım dosya adından yapılmaktadır; fonksiyonun kendisi hakkında sağlanan docstring bilgisi bulunmamaktadır.

**Nasıl yapar**: Fonksiyonun iç mantığı hakkında sağlanan herhangi bir docstring veya açıklama bilgisi bulunmamaktadır. Dolayısıyla nasıl çalıştığı bilinmemektedir.

**Parametreler**:
- Fonksiyonun herhangi bir parametre alıp almadığı bilinmemektedir; sağlanan bilgide parametre tanımı yer almamaktadır.

**Dönüş**: `React.FC` — React fonksiyonel bileşen tipi döndürür.

### reset
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCalculatorUsage::useCalculatorUsage
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

### [N1_NASIL] AST Pointer: src/views/calculators/DuctCalcPage.tsx::DuctCalcPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; tüm metin etiketlerinde, açıklamalarda ve tooltip'lerde kullanılır
  - `ductTypeOptions` — `useMemo` ile `t` bağımlılığıyla hesaplanan dizi; dairesel (`circular`) ve dikdörtgen (`rectangular`) kanal şekli seçeneklerini içerir, her elemanda `value`, `label`, `description`, `icon` alanları vardır
  - `materialOptions` — `useMemo` ile `t` bağımlılığıyla hesaplanan dizi; galvaniz (`galvanized`), PVC (`pvc`) ve esnek (`flex`) malzeme seçeneklerini içerir, her elemanda `value`, `label`, `description` alanları vardır
  - `airflow` — `useState('500')` ile oluşturulan form state; hava debisi değerini metin olarak tutar
  - `setAirflow` — `airflow` state'ini güncelleyen setter fonksiyonu
  - `ductType` — `useState<DuctType>('rectangular')` ile oluşturulan form state; seçili kanal şeklini tutar (`'circular'` veya `'rectangular'`)
  - `setDuctType` — `ductType` state'ini güncelleyen setter fonksiyonu
  - `diameter` — `useState('200')` ile oluşturulan form state; dairesel kanal çapını milimetre cinsinden metin olarak tutar
  - `setDiameter` — `diameter` state'ini güncelleyen setter fonksiyonu
  - `width` — `useState('300')` ile oluşturulan form state; dikdörtgen kanal genişliğini milimetre cinsinden metin olarak tutar
  - `setWidth` — `width` state'ini güncelleyen setter fonksiyonu
  - `height` — `useState('200')` ile oluşturulan form state; dikdörtgen kanal yüksekliğini milimetre cinsinden metin olarak tutar
  - `setHeight` — `height` state'ini güncelleyen setter fonksiyonu
  - `length` — `useState('10')` ile oluşturulan form state; kanal uzunluğunu metre cinsinden metin olarak tutar
  - `setLength` — `length` state'ini güncelleyen setter fonksiyonu
  - `material` — `useState<DuctMaterial>('galvanized')` ile oluşturulan form state; seçili kanal malzemesini tutar
  - `setMaterial` — `material` state'ini güncelleyen setter fonksiyonu
  - `result` — `useMemo` ile `airflow`, `ductType`, `diameter`, `width`, `height`, `length`, `material` bağımlılıklarıyla hesaplanan hesaplama sonucu; geçersiz girdilerde `null`, aksi halde `calculateDuct` fonksiyonunun dönüşüdür
  - `reset` — form state'lerini varsayılan değerlere sıfırlayan fonksiyon (`airflow='500'`, `ductType='rectangular'`, `diameter='200'`, `width='300'`, `height='200'`, `length='10'`, `material='galvanized'`)
- **Dönüş**: JSX — `CalculatorLayout` bileşeni içinde form girdileri ve sonuç gösterimini içeren iki sütunlu ızgara düzeni

### [N2_NASIL] AST Pointer: src/views/calculators/DuctCalcPage.tsx::useMemo (ductTypeOptions)
- **params**: (parametre yok — useMemo callback'i)
- **ic_degiskenler**:
  - `t` — kapsamdan erişilen çeviri fonksiyonu; `calculators.duct.form.round`, `calculators.duct.form.roundDesc`, `calculators.duct.form.rectangular`, `calculators.duct.form.rectangularDesc` anahtarlarıyla etiket ve açıklamaları çeker
- **Dönüş**: Dizi — iki elemanlı; birinci eleman `value: 'circular'`, ikinci eleman `value: 'rectangular'`; her elemanda `label`, `description`, `icon` (`<Circle size={24} />` veya `<Square size={24} />`) alanları bulunur

### [N3_NASIL] AST Pointer: src/views/calculators/DuctCalcPage.tsx::useMemo (materialOptions)
- **params**: (parametre yok — useMemo callback'i)
- **ic_degiskenler**:
  - `t` — kapsamdan erişilen çeviri fonksiyonu; `calculators.duct.form.steel`, `calculators.duct.form.pvc`, `calculators.duct.form.flex` anahtarlarıyla etiketleri çeker
- **Dönüş**: Dizi — üç elemanlı; `value: 'galvanized'` (açıklama: `'Standart'`), `value: 'pvc'` (açıklama: `'Low Friction'`), `value: 'flex'` (açıklama: `'Flexible'`); her elemanda `value`, `label`, `description` alanları bulunur

### [N4_NASIL] AST Pointer: src/views/calculators/DuctCalcPage.tsx::useMemo (result)
- **params**: (parametre yok — useMemo callback'i)
- **ic_degiskenler**:
  - `flow` — `parseFloat(airflow)` sonucu; geçersiz parse durumunda `0` olur; hava debisi sayısal değeri
  - `len` — `parseFloat(length)` sonucu; geçersiz parse durumunda `0` olur; kanal uzunluğu sayısal değeri
  - `dia` — `parseFloat(diameter)` sonucu; geçersiz parse durumunda `0` olur; dairesel kanal çapı sayısal değeri
  - `w` — `parseFloat(width)` sonucu; geçersiz parse durumunda `0` olur; dikdörtgen kanal genişliği sayısal değeri
  - `h` — `parseFloat(height)` sonucu; geçersiz parse durumunda `0` olur; dikdörtgen kanal yüksekliği sayısal değeri
  - `airflow` — kapsamdan erişilen form state; hava debisi metin değeri
  - `length` — kapsamdan erişilen form state; kanal uzunluğu metin değeri
  - `diameter` — kapsamdan erişilen form state; dairesel kanal çapı metin değeri
  - `width` — kapsamdan erişilen form state; dikdörtgen kanal genişliği metin değeri
  - `height` — kapsamdan erişilen form state; dikdörtgen kanal yüksekliği metin değeri
  - `ductType` — kapsamdan erişilen form state; `'circular'` veya `'rectangular'`
  - `material` — kapsamdan erişilen form state; malzeme türü
- **Dönüş**: `null` — `flow <= 0` veya `len <= 0` olduğunda; `ductType === 'circular'` ve `dia <= 0` olduğunda; `ductType === 'rectangular'` ve (`w <= 0` veya `h <= 0`) olduğunda. Aksi halde `calculateDuct` fonksiyonuna `{ airflow: flow, ductType, diameter, width, height, length: len, material }` argümanlarıyla yapılan çağrının dönüşü. `diameter` yalnızca `ductType === 'circular'` iken `dia`, diğer durumda `undefined` gönderilir; `width` ve `height` yalnızca `ductType === 'rectangular'` iken `w`/`h`, diğer durumda `undefined` gönderilir.

### [N5_NASIL] AST Pointer: src/views/calculators/DuctCalcPage.tsx::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setAirflow` — kapsamdan erişilen setter; `'500'` değerine sıfırlar
  - `setDuctType` — kapsamdan erişilen setter; `'rectangular'` değerine sıfırlar
  - `setDiameter` — kapsamdan erişilen setter; `'200'` değerine sıfırlar
  - `setWidth` — kapsamdan erişilen setter; `'300'` değerine sıfırlar
  - `setHeight` — kapsamdan erişilen setter; `'200'` değerine sıfırlar
  - `setLength` — kapsamdan erişilen setter; `'10'` değerine sıfırlar
  - `setMaterial` — kapsamdan erişilen setter; `'galvanized'` değerine sıfırlar
- **Dönüş**: yok — tüm form state'lerini başlangıç varsayılan değerlerine geri döndüren yan etkili fonksiyon

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