---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx
skeleton_hash: 27a5cddb63942320
entity_hashes:
  func:HRVCalcPage: f6b36b28ed5f44cd
  func:reset: 16764b441f7bc7b6
  overview: f88945634c93d3ea
  style_tokens: 27adff48ed74fee3
generated_at: 2026-05-28T22:39:51Z
---

## Genel Bakış
Bu modül, Isı Geri Kazanımlı Havalandırma (HRV) cihazları için hesaplama işlemlerini sunan React tabanlı bir ön yüz sayfa bileşenidir. Kullanıcıların HRV sistemiyle ilgili teknik hesaplamalar yapmasına olanak tanıyan arayüzü ve temel işlevselliği yönetir.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
HRV hesaplayıcı sayfasının tüm kullanıcı arayüzünü ve temel çalışma mantığını yöneterek, hesaplama sürecini kullanıcıya sunar.
- HRVCalcPage

### Hesaplama Sıfırlama İşlevi
Kullanıcı tarafından girilen değerleri veya hesaplama sürecini varsayılan başlangıç durumuna döndürmek için kullanılan yardımcı işlevi içerir.
- reset

---

## AXIOMS – Mimari Varsayımlar

Bu modül için verilen fonksiyon gövdeleri (implementation bodies) mevcut değildir, bu nedenle fonksiyon gövdesinden çıkarılabilir mimari varsayım bulunamamıştır.

---

**Not:** Sağlanan girdiler yalnızca fonksiyon imzaları (parametresiz) ve önceki dokümantasyondan ibarettir. Fonksiyon gövdeleri paylaşılmadığı için "Eğer ... yoksa, ... olur" formatında doğrulanabilir bir mimari aksiyom üretilememiştir.

Mevcut bilgilerden çıkarılabilecek **gözlemlenebilir yapısal notlar** (aksiyom değil):

| Gözlem | Değerlendirme |
|--------|---------------|
| `HRVCalcPage()` | Parametresiz – bağımsız bir React sayfa bileşeni olduğu varsayılır |
| `reset()` | Parametresiz – durumu sıfırlama işlevi olduğu varsayılır |
| Modül sabitleri | Tanımlı değildir |
| Domain | general (HVAC/HRV domain'inde olduğu dokümantasyonda belirtilmiştir, fakat gövde kodu doğrulanamamıştır) |

---

⚠️ **Mimari hakem değerlendirmesi:** Bu modül için geçerli ve doğrulanabilir aksiyom üretimi için fonksiyon gövdelerinin (implementation code) paylaşılması gerekmektedir. Mevcut durumda yalnızca imza seviyesinde bilgi mevcut olup, модülün içsel davranış kuralları bilinmemektedir.

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

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::recoveryTypeOptions
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: Array<{value: string, label: string, description: string, icon: JSX.Element}> — HRV ve ERV选项larını döndüren dizi; her seçenek value, label (t() ile çeviri), description ve icon (lucide-react bileşeni) içerir

### [N2_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::buildingTypeOptions
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: Array<{value: string, label: string, description: string}> — Bina tiplerini (residential, office, commercial) döndüren dizi; description İngilizce sabit metin olarak verilmiş

### [N3_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::climateZoneOptions
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: Array<{value: string, label: string, description: string}> — İklim bölgelerini (cold, temperate, hot) döndüren dizi; description coğrafi referans bilgisi içerir

### [N4_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::updateURL
- **params**: ()
- **ic_degiskenler**:
  - `params` — URLSearchParams instance'ı; state değerlerini query string'e dönüştürmek için kullanılır
  - `query` — params.toString() sonucu oluşan query string; boşsa veya doluysa pathname ile birleştirilir
- **Kullanılan dış değişkenler**:
  - `recoveryType` — mevcut geri kazanım tipi state'i; 'hrv' dışıysa URL'e eklenir
  - `buildingType` — mevcut bina tipi state'i; 'office' dışıysa URL'e eklenir
  - `climateZone` — mevcut iklim bölgesi state'i; 'temperate' dışıysa URL'e eklenir
  - `area` — alan state'i; '100' dışıysa URL'e eklenir
  - `occupancy` — doluluk state'i; '10' dışıysa URL'e eklenir
  - `operatingHours` — çalışma saati state'i; '10' dışıysa URL'e eklenir
  - `sensibleEfficiency` — sensible verimlilik state'i; '75' dışıysa URL'e eklenir
  - `latentEfficiency` — latent verimlilik state'i; '65' dışıysa URL'e eklenir
  - `electricityCost` — elektrik maliyeti state'i; '3.5' dışıysa URL'e eklenir
  - `router` — next/navigation useRouter hook'u; router.replace() ile URL'i günceller
  - `pathname` — next/navigation usePathname hook'u; mevcut yol bilgisini verir
- **API Çağrıları**: `router.replace()` — URL'i sessizce günceller (scroll: false)
- **Dönüş**: void; state değerlerini URL query parametrelerine senkronize eder

### [N5_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::calculateResults
- **params**: ()
- **ic_degiskenler**:
  - `areaVal` — parseFloat(area) ile parse edilen alan değeri; NaN ise 0 döner; hesaplama parametresi olarak kullanılır
  - `occVal` — parseFloat(occupancy) ile parse edilen doluluk değeri; NaN ise 0 döner; hesaplama parametresi olarak kullanılır
  - `hoursVal` — parseFloat(operatingHours) ile parse edilen çalışma saati; NaN ise 0 döner; hesaplama parametresi olarak kullanılır
  - `sensEff` — parseFloat(sensibleEfficiency) ile parse edilen sensible verimlilik yüzdesi; NaN ise 0 döner
  - `latEff` — parseFloat(latentEfficiency) ile parse edilen latent verimlilik yüzdesi; NaN ise 0 döner
  - `elecCost` — parseFloat(electricityCost) ile parse edilen elektrik maliyeti; NaN ise 0 döner
- **Kullanılan dış değişkenler**:
  - `area` — alan state'i (string)
  - `occupancy` — doluluk state'i (string)
  - `operatingHours` — çalışma saati state'i (string)
  - `sensibleEfficiency` — sensible verimlilik state'i (string)
  - `latentEfficiency` — latent verimlilik state'i (string)
  - `electricityCost` — elektrik maliyeti state'i (string)
  - `recoveryType` — geri kazanım tipi state'i (string)
  - `buildingType` — bina tipi state'i (string)
  - `climateZone` — iklim bölgesi state'i (string)
- **API Çağrıları**: `calculateHRV()` — dışarıdan import edilen hesaplama fonksiyonu; { recoveryType, buildingType, climateZone, area, occupancy, operatingHoursPerDay, sensibleEfficiency, latentEfficiency, electricityCostPerKWh } parametre objesi alır
- **Dönüş**: HRVCalcResult | null; geçersiz parametrelerde (areaVal <= 0 veya occVal < 0 veya hoursVal <= 0 veya sensEff <= 0) null, aksi halde calculateHRV() sonucunu döner

### [N6_NASIL] AST Pointer: src/views/calculators/HRVCalcPage.tsx::reset
- **params**: ()
- **ic_degiskenler**: yok
- **Kullanılan dış değişkenler (tümü state setter'ları)**:
  - `setRecoveryType` — recoveryType state setter'ı; 'hrv' değerine sıfırlanır
  - `setBuildingType` — buildingType state setter'ı; 'office' değerine sıfırlanır
  - `setClimateZone` — climateZone state setter'ı; 'temperate' değerine sıfırlanır
  - `setArea` — area state setter'ı; '100' değerine sıfırlanır
  - `setOccupancy` — occupancy state setter'ı; '10' değerine sıfırlanır
  - `setOperatingHours` — operatingHours state setter'ı; '10' değerine sıfırlanır
  - `setSensibleEfficiency` — sensibleEfficiency state setter'ı; '75' değerine sıfırlanır
  - `setLatentEfficiency` — latentEfficiency state setter'ı; '65' değerine sıfırlanır
  - `setElectricityCost` — electricityCost state setter'ı; '3.5' değerine sıfırlanır
- **Dönüş**: void; tüm form state'lerini varsayılan başlangıç değerlerine sıfırlar

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