---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx
skeleton_hash: dc14c1431beef43c
entity_hashes:
  func:HRVCalcPage: f6b36b28ed5f44cd
  func:reset: 16764b441f7bc7b6
  overview: f4b47809b44ad2d8
  style_tokens: 27adff48ed74fee3
generated_at: 2026-08-14T06:44:54Z
---

## Genel Bakış
Bu modül, Isı Geri Kazanımlı Havalandırma (HRV) cihazları için hesaplama işlemlerini sunan React tabanlı bir sayfa bileşenidir. Kullanıcıların HRV sistemiyle ilgili parametreleri girerek hesaplama yapmasını ve sonuçları görüntülemesini sağlar.

## Fonksiyon Grupları

### Ana Sayfa Bileşeni
HRV hesaplayıcı sayfasının tüm kullanıcı arayüzünü, state yönetimini ve hesaplama mantığını barındıran ana bileşendir.
- HRVCalcPage

### Yardımcı İşlevler
Kullanıcının form değerlerini veya hesaplama durumunu başlangıç noktalarına döndirmek için kullanılan destekleyici işlevleri içerir.
- reset

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, verilen fonksiyon gövdeleri temel alınarak türetilebilecek spesifik mimari varsayımlar bulunmamaktadır.

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

### [N1_NASIL] AST Pointer: HRVCalcPage.tsx::recoveryTypeOptions
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: Array of objects with `value`, `label`, `description`, `icon` properties

### [N2_NASIL] AST Pointer: HRVCalcPage.tsx::buildingTypeOptions
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: Array of objects with `value`, `label`, `description` properties

### [N3_NASIL] AST Pointer: HRVCalcPage.tsx::climateZoneOptions
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: Array of objects with `value`, `label`, `description` properties

### [N4_NASIL] AST Pointer: HRVCalcPage.tsx::syncUrlWithState
- **params**: ()
- **ic_degiskenler**:
  - `params` — URLSearchParams nesnesi, URL query string'ini oluşturmak için kullanılır
  - `query` — `params`'ın string karşılığı, URL'ye eklenecek query string
- **Dönüş**: yok (yan etki: `router.replace` ile URL güncellenir)

### [N5_NASIL] AST Pointer: HRVCalcPage.tsx::calculateResults
- **params**: ()
- **ic_degiskenler**:
  - `areaVal` — `area` state'inin parseFloat karşılığı, geçerli bir sayı değilse 0
  - `occVal` — `occupancy` state'inin parseFloat karşılığı, geçerli bir sayı değilse 0
  - `hoursVal` — `operatingHours` state'inin parseFloat karşılığı, geçerli bir sayı değilse 0
  - `sensEff` — `sensibleEfficiency` state'inin parseFloat karşılığı, geçerli bir sayı değilse 0
  - `latEff` — `latentEfficiency` state'inin parseFloat karşılığı, geçerli bir sayı değilse 0
  - `elecCost` — `electricityCost` state'inin parseFloat karşılığı, geçerli bir sayı değilse 0
- **Dönüş**: `calculateHRV` fonksiyonunun dönüş değeri veya geçersiz parametrelerde `null`

### [N6_NASIL] AST Pointer: HRVCalcPage.tsx::resetForm
- **params**: ()
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (yan etki: tüm state'leri varsayılan değerlere sıfırlar)

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