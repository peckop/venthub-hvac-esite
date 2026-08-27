---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\views\calculators\HRVCalcPage.tsx
skeleton_hash: eb3ddc9355b10956
entity_hashes:
  func:HRVCalcPage: f6b36b28ed5f44cd
  func:reset: 16764b441f7bc7b6
  overview: 477df472883f5208
  style_tokens: 27adff48ed74fee3
generated_at: 2026-08-27T04:31:52Z
---

## Genel Bakış
Bu modül, Isı Geri Kazanımlı Havalandırma (HRV) cihazları için bir hesaplama sayfası sunan React tabanlı bir bileşendir. Kullanıcıların HRV sistemiyle ilgili parametreleri girip sonuçları görüntülemesini sağlar ve sayfa durumunu sıfırlama işlevi sunar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
HRV hesaplama sayfasının tüm kullanıcı arayüzünü, state yönetimini ve hesaplama mantığını barındıran ana bileşendir. Bu bileşen, kullanıcı etkileşimlerini yönetir ve hesaplama sonuçlarını görüntüler.
- HRVCalcPage

### Yardımcı İşlevler
Kullanıcının form değerlerini veya hesaplama durumunu başlangıç noktalarına döndürmek için kullanılan destekleyici işlevleri içerir. Bu işlev, ana bileşen içinde çağrılarak sayfanın sıfırlanmasını sağlar.
- reset

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### HRVCalcPage
**Ne yapar**: HRV (Heat Recovery Ventilation - Isı Geri Kazanımlı Havalandırma) hesaplama sayfasını render eden ana React bileşenidir. Bu bileşen, kullanıcıların HVAC hesaplamaları yapabilmesini sağlayan bir sayfa sunar.

**Nasıl yapar**: Fonksiyonel bir React bileşeni olarak tanımlanmıştır. `React.FC` (Functional Component) tipini döndürür ve sayfanın tüm arayüzünü ve hesaplama mantığını yönetir. Bileşen kendi içinde state yönetimini ve kullanıcı etkileşimlerini gerçekleştirilir.

**Parametreler**:
- Parametre almamaktadır (propsless bileşen)

**Dönüş**: `React.FC` — Fonksiyonel React bileşeni döndürür.

### reset
**Ne yapar**: HRVCalcPage sayfasındaki tüm kullanıcı girişlerini, hesaplanmış sonuçları ve sayfanın geçici özel ayarlarını sıfırlayarak sayfayı ilk yüklendiği varsayılan durumuna geri döndürür. Kullanıcıların yeni bir hesaplama yapmak veya hatalı girişleri temizlemek istediklerinde tüm değerleri tek tıkla sıfırlamasını sağlar.
**Nasıl yapar**: HRVCalcPage bileşeni içinde tanımlanan tüm yerel state değişkenlerini orijinal varsayılan değerlerine atar, kullanıcı tarafından doldurulan tüm metin ve sayısal giriş alanlarını boşaltır, daha önce hesaplanan tüm teknik sonuç verilerini temizler. Sayfa üzerindeki hiçbir kalıcı geçici veri kalmayacak şekilde tüm durumu sıfırlar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz, doğrudan sayfa içi durumları değiştirmek üzere çağrılır.
**Dönüş**: void tipindedir, herhangi bir değer döndürmez; sadece sayfa içi state güncellemeleri yaparak arayüzün yeniden render edilmesini tetikler.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useCalculatorUsage::useCalculatorUsage
- import: ../../i18n/I18nProvider::useI18n
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: next/navigation::useSearchParams
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useState

---

## AST POINTERS

### [N1_NASIL] AST Pointer: HRVCalcPage.tsx::HRVCalcPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu; etiket ve açıklamaları yerelleştirmek için kullanılır
  - `recoveryType` — useState ile tutulan durum; ısı geri kazanım tipi ('hrv' veya 'erv')
  - `buildingType` — useState ile tutulan durum; bina tipi ('residential', 'office', 'commercial')
  - `climateZone` — useState ile tutulan durum; iklim bölgesi ('cold', 'temperate', 'hot')
  - `area` — useState ile tutulan durum; alan değeri (metre kare, varsayılan '100')
  - `occupancy` — useState ile tutulan durum; kişi sayısı (varsayılan '10')
  - `operatingHours` — useState ile tutulan durum; çalışma saati (varsayılan '10')
  - `sensibleEfficiency` — useState ile tutulan durum; duyulur verimlilik yüzdesi (varsayılan '75')
  - `latentEfficiency` — useState ile tutulan durum; gizli verimlilik yüzdesi (varsayılan '65')
  - `electricityCost` — useState ile tutulan durum; elektrik birim fiyatı (varsayılan '3.5')
  - `pathname` — usePathname hook'undan gelen mevcut URL yolu
  - `router` — useRouter hook'undan gelen Next.js yönlendirici nesnesi
  - `searchParams` — useSearchParams hook'undan gelen mevcut URL parametreleri
  - `calculateHRV` — HRV hesaplama fonksiyonu; dışarıdan import edilen hesaplama mantığı
  - `useCalculatorUsage` — hesaplama kullanımını izleyen hook
- **Dönüş**: React.FC (JSX elementi)

### [N2_NASIL] AST Pointer: HRVCalcPage.tsx::useMemo_1 (HRV tipi seçenekleri)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n'den gelen çeviri fonksiyonu; 'calculators.hrv.form.hrv', 'calculators.hrv.form.hrvDesc', 'calculators.hrv.form.erv', 'calculators.hrv.form.ervDesc' anahtarlarını çözümlemek için kullanılır
  - `value` — her seçeneğin benzersiz tanımlayıcı değeri ('hrv' veya 'erv')
  - `label` — t() ile çevrilmiş görünen etiket
  - `description` — t() ile çevrilmiş açıklama metni
  - `icon` — ThermometerSun (hrv için) veya Snowflake (erv için) lucide-react ikonu, 24px boyutunda
- **Dönüş**: Array<{value: string, label: string, description: string, icon: JSX.Element}>

### [N3_NASIL] AST Pointer: HRVCalcPage.tsx::useMemo_2 (bina tipi seçenekleri)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n'den gelen çeviri fonksiyonu; 'common.homeLabel', 'calculators.hrv.form.office', 'calculators.hrv.form.commercial' anahtarlarını çözümlemek için kullanılır
  - `value` — her seçeneğin benzersiz tanımlayıcı değeri ('residential', 'office', 'commercial')
  - `label` — t() ile çevrilmiş görünen etiket
  - `description` — sabit İngilizce açıklama metni ('Domestic', 'Workplace', 'Retail/Mall')
- **Dönüş**: Array<{value: string, label: string, description: string}>

### [N4_NASIL] AST Pointer: HRVCalcPage.tsx::useMemo_3 (iklim bölgesi seçenekleri)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n'den gelen çeviri fonksiyonu; 'calculators.hrv.form.cold', 'calculators.hrv.form.temperate', 'calculators.hrv.form.hot' anahtarlarını çözümlemek için kullanılır
  - `value` — her seçeneğin benzersiz tanımlayıcı değeri ('cold', 'temperate', 'hot')
  - `label` — t() ile çevrilmiş görünen etiket
  - `description` — sabit İngilizce açıklama metni ('North/Mountain', 'Central', 'South/Coast')
- **Dönüş**: Array<{value: string, label: string, description: string}>

### [N5_NASIL] AST Pointer: HRVCalcPage.tsx::useEffect_1 (URL senkronizasyonu)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `window` — typeof kontrolü ile SSR ortamında çalışıp çalışmadığını belirler; 'undefined' ise erken dönüş yapar
  - `params` — new URLSearchParams() ile oluşturulan boş parametre nesnesi
  - `recoveryType` — durum değişkeni; 'hrv' değilse URL'ye eklenir
  - `buildingType` — durum değişkeni; 'office' değilse URL'ye eklenir
  - `climateZone` — durum değişkeni; 'temperate' değilse URL'ye eklenir
  - `area` — durum değişkeni; '100' değilse URL'ye eklenir
  - `occupancy` — durum değişkeni; '10' değilse URL'ye eklenir
  - `operatingHours` — durum değişkeni; '10' değilse URL'ye eklenir
  - `sensibleEfficiency` — durum değişkeni; '75' değilse URL'ye eklenir
  - `latentEfficiency` — durum değişkeni; '65' değilse URL'ye eklenir
  - `electricityCost` — durum değişkeni; '3.5' değilse URL'ye eklenir
  - `query` — params.toString() ile oluşturulan URL sorgu dizesi
  - `router` — useRouter'dan gelen nesne; router.replace() ile URL'yi günceller
  - `pathname` — usePathname'dan gelen mevcut yol; sorgu dizesi ile birleştirilir
- **Dönüş**: yok (yan etki: tarayıcı URL'sini scroll:false ile günceller)

### [N6_NASIL] AST Pointer: HRVCalcPage.tsx::useMemo_4 (HRV hesaplama)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `areaVal` — parseFloat(area) sonucu; geçersiz ise 0, alan değeri (metre kare)
  - `occVal` — parseFloat(occupancy) sonucu; geçersiz ise 0, kişi sayısı
  - `hoursVal` — parseFloat(operatingHours) sonucu; geçersiz ise 0, günlük çalışma saati
  - `sensEff` — parseFloat(sensibleEfficiency) sonucu; geçersiz ise 0, duyulur verimlilik yüzdesi
  - `latEff` — parseFloat(latentEfficiency) sonucu; geçersiz ise 0, gizli verimlilik yüzdesi
  - `elecCost` — parseFloat(electricityCost) sonucu; geçersiz ise 0, elektrik birim fiyatı (kWh başına)
  - `recoveryType` — durum değişkeni; ısı geri kazanım tipi
  - `buildingType` — durum değişkeni; bina tipi
  - `climateZone` — durum değişkeni; iklim bölgesi
  - `calculateHRV` — dışarıdan gelen hesaplama fonksiyonu; nesne argümanı alır
- **Dönüş**: areaVal <= 0, occVal < 0, hoursVal <= 0 veya sensEff <= 0 ise null; aksi halde calculateHRV() dönüş değeri

### [N7_NASIL] AST Pointer: HRVCalcPage.tsx::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setRecoveryType` — useState setter; 'hrv' değerine sıfırlar
  - `setBuildingType` — useState setter; 'office' değerine sıfırlar
  - `setClimateZone` — useState setter; 'temperate' değerine sıfırlar
  - `setArea` — useState setter; '100' değerine sıfırlar
  - `setOccupancy` — useState setter; '10' değerine sıfırlar
  - `setOperatingHours` — useState setter; '10' değerine sıfırlar
  - `setSensibleEfficiency` — useState setter; '75' değerine sıfırlar
  - `setLatentEfficiency` — useState setter; '65' değerine sıfırlar
  - `setElectricityCost` — useState setter; '3.5' değerine sıfırlar
- **Dönüş**: yok (yan etki: tüm form durum değişkenlerini varsayılan değerlerine döndürür)

---

## NODE ID STANDARD

  file: src\views\calculators\HRVCalcPage.tsx
  function: src\views\calculators\HRVCalcPage.tsx::HRVCalcPage
  function: src\views\calculators\HRVCalcPage.tsx::reset

---

## DISA AKTARILANLAR (EXPORTS)
  export: HRVCalcPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100`, `bg-primary-navy/10`, `bg-success-green/10`, `bg-white`, `border-light-gray`, `border-success-green/20`, `hover:text-industrial-gray`, `text-center`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`
- **Layout:** `flex`, `flex-col`, `gap-2`, `gap-3`, `gap-4`, `gap-8`, `grid`, `grid-cols-2`, `items-center`, `justify-center`, `lg:grid-cols-2`, `p-2`, `p-4`, `p-6`, `shadow-sm`
- **Varyant/Responsive:** `hover:`, `lg:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-semibold`, `mb-4`, `mb-6`, `mt-4`, `py-12`, `rounded-2xl`, `rounded-full`, `rounded-lg`, `rounded-xl`, `space-y-4`, `space-y-6`, `transition-colors`