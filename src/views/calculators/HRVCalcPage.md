---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx
skeleton_hash: 27a5cddb63942320
generated_at: 2026-05-23T22:39:27Z
---

## Genel Bakış
Venthub HVAC projesinde yer alan bu modül, Isı Geri Kazanımlı Havalandırma (HRV) sistemleri için özel hesaplama arayüzünü sunan React tabanlı bir sayfa bileşenidir. Kullanıcıların HRV ile ilgili teknik hesaplamalar yapmasına olanak tanır, hesaplama sürecini yönetmek için temel işlemleri destekler.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
HRV hesaplayıcı sayfasının tüm kullanıcı arayüzünü ve temel çalışma mantığını yönetir, sayfanın doğru şekilde kullanıcıya sunulmasını sağlar.
- HRVCalcPage

### Hesaplama Yönetim Fonksiyonları
Kullanıcı tarafından girilen değerleri veya aktif hesaplama sürecini ilk varsayılan haline döndürmek için kullanılan yardımcı işlevi barındırır.
- reset

---

## AXIOMS – Mimari Varsayımlar
Bu modül, HVAC sistemleri bünyesindeki Isı Geri Kazanım Havalandırma (HRV) cihazları için hesaplama işlemlerini sunan React tabanlı bir ön yüz sayfa bileşenidir, çalışması için projenin React çalışma zamanı, state yönetimi altyapısı ve gerekli iç bağımlılıkların erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer proje genelinde tanımlı React çalışma zamanı modül tarafından erişilebilir değilse, HRVCalcPage bileşeni hiçbir zaman render edilemez ve uygulama çalışma zamanında kritik hata fırlatır.
[Aksiyom 2]: Eğer reset() fonksiyonunun bağlı olduğu uygulama yerel state yönetimi altyapısı mevcut değilse, hesaplayıcıdaki kullanıcı girdileri ve hesaplanmış sonuçlar sıfırlanamaz, sıfırlama işlevi tam olarak çalışmaz.
[Aksiyom 3]: Eğer HRV hesaplama mantığını içeren harici hesaplama motoru veya servisi bu modülden erişilebilir durumda değilse, kullanıcı girdileri üzerinden geçerli sistem değerleri üretilemez.
[Aksiyom 4]: Eğer uygulama içindeki yönlendirme (routing) sistemi tarafından bu sayfaya erişim izni tanımlanmamışsa, hiçbir kullanıcı bu hesaplayıcı sayfasına ulaşamaz.
[Aksiyom 5]: Eğer modülün kullanması gereken temel UI bileşenleri proje içindeki kaynaklardan yüklenemiyorsa, hesaplayıcı arayüzü kullanıcıya eksik veya tamamen işlevsiz olarak sunulur.

---

## FONKSIYON DETAYLARI

### HRVCalcPage
**Ne yapar**: Venthub HVAC projesinin Isı Geri Kazanım Ventilatörü (HRV) hesaplamalarını sunduğu ana sayfa bileşenidir. Kullanıcıların HRV sistemleri için gerekli teknik hesaplamaları yapabileceği, giriş yapabileceği ve sonuçları görüntüleyebileceği tam bir arayüzü son kullanıcıya sunar.
**Nasıl yapar**: React tabanlı fonksiyonel bir bileşen olarak, sayfa içindeki hesaplama araçlarını, giriş bileşenlerini ve sonuç gösterim modüllerini tek bir sayfa çatısı altında birleştirir. Sayfa içi durum yönetimini ve bileşenler arası veri akışını destekleyen yapıda çalışarak tüm hesaplama iş akışının sorunsuz işletilmesini sağlar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz, bağımsız bir React sayfa bileşeni olarak çalışır.
**Dönüş**: React.FC tipindedir, yani sayfanın tüm arayüz yapısını ve işlevselliğini barındıran React bileşenini döndürür. Bu döndürülen bileşen uygulama DOM'ına eklenerek son kullanıcıya görüntülenir.

### reset
**Ne yapar**: HRVCalcPage sayfasındaki tüm kullanıcı girişlerini, hesaplanmış sonuçları ve sayfanın geçici özel ayarlarını sıfırlayarak sayfayı ilk yüklendiği varsayılan durumuna geri döndürür. Kullanıcıların yeni bir hesaplama yapmak veya hatalı girişleri temizlemek istediklerinde tüm değerleri tek tıkla sıfırlamasını sağlar.
**Nasıl yapar**: HRVCalcPage bileşeni içinde tanımlanan tüm yerel state değişkenlerini orijinal varsayılan değerlerine atar, kullanıcı tarafından doldurulan tüm metin ve sayısal giriş alanlarını boşaltır, daha önce hesaplanan tüm teknik sonuç verilerini temizler. Sayfa üzerindeki hiçbir kalıcı geçici veri kalmayacak şekilde tüm durumu sıfırlar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz, doğrudan sayfa içi durumları değiştirmek üzere çağrılır.
**Dönüş**: void tipindedir, herhangi bir değer döndürmez; sadece sayfa içi state güncellemeleri yaparak arayüzün yeniden render edilmesini tetikler.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx::getRecoveryTypeOptions
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu, form etiketlerini çevirmek için kullanılır
  - `ThermometerSun` — Lucide ikonu, HRV seçeneği için gösterilir
  - `Snowflake` — Lucide ikonu, ERV seçeneği için gösterilir
- **Dönüş**: {value: string, label: string, description: string, icon: JSX.Element}[] tipinde 2 elemanlı seçenek dizisi

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx::getBuildingTypeOptions
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu, form etiketlerini çevirmek için kullanılır
- **Dönüş**: {value: string, label: string, description: string}[] tipinde 3 elemanlı bina tipi seçenek dizisi

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx::getClimateZoneOptions
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — i18n çeviri fonksiyonu, form etiketlerini çevirmek için kullanılır
- **Dönüş**: {value: string, label: string, description: string}[] tipinde 3 elemanlı iklim bölgesi seçenek dizisi

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx::updateUrlQuery
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `typeof window` — Tarayıcı ortamı kontrolü için kullanılır, sunucu tarafında çalışmayı engeller
  - `params` — URLSearchParams nesnesi, sorgu parametrelerini toplamak ve işlemek için kullanılır
  - `recoveryType` — Formdaki ısı geri kazanım sistemi tipi, varsayılan hrv değilse URL'ye eklenir
  - `buildingType` — Formdaki bina tipi, varsayılan ofis değilse URL'ye eklenir
  - `climateZone` — Formdaki iklim bölgesi, varsayılan temperate değilse URL'ye eklenir
  - `area` — Formdaki bina alanı değeri, varsayılan 100 değilse URL'ye eklenir
  - `occupancy` — Formdaki kişi kapasitesi değeri, varsayılan 10 değilse URL'ye eklenir
  - `operatingHours` — Formdaki günlük çalışma saati, varsayılan 10 değilse URL'ye eklenir
  - `sensibleEfficiency` — Formdaki duyarlı verim oranı, varsayılan 75 değilse URL'ye eklenir
  - `latentEfficiency` — Formdaki gizli verim oranı, varsayılan 65 değilse URL'ye eklenir
  - `electricityCost` — Formdaki kWh başına elektrik maliyeti, varsayılan 3.5 değilse URL'ye eklenir
  - `query` — Stringleştirilmiş URL sorgu parametreleri
  - `router` — Next.js useRouter hook'u ile alınan router nesnesi, URL'yi güncellemek için kullanılır
  - `pathname` — Next.js usePathname hook'u ile alınan mevcut sayfa yolu, URL güncellemede kullanılır
- **Dönüş**: Tarayıcı ortamı yoksa erken dönüş, aksi takdirde yan etki olarak URL'yi günceller, dönüş değeri yok

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx::computeHrvResults
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `areaVal` — Formdaki string alan değerini sayıya çevirir, hata durumunda 0 atanır
  - `occVal` — Formdaki string kişi kapasitesini sayıya çevirir, hata durumunda 0 atanır
  - `hoursVal` — Formdaki string çalışma saati değerini sayıya çevirir, hata durumunda 0 atanır
  - `sensEff` — Formdaki string duyarlı verim değerini sayıya çevirir, hata durumunda 0 atanır
  - `latEff` — Formdaki string gizli verim değerini sayıya çevirir, hata durumunda 0 atanır
  - `elecCost` — Formdaki string elektrik maliyeti değerini sayıya çevirir, hata durumunda 0 atanır
  - `recoveryType` — Isı geri kazanım sistemi tipi, hesaplama fonksiyonuna aktarılır
  - `buildingType` — Bina tipi, hesaplama fonksiyonuna aktarılır
  - `climateZone` — İklim bölgesi, hesaplama fonksiyonuna aktarılır
  - `calculateHRV` — Ana HRV hesaplama fonksiyonu, işlenmiş parametrelerle çağrılır
- **Dönüş**: Giriş değerleri geçersizse null, geçerliyse calculateHRV fonksiyonunun dönüş değeri

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\calculators\HRVCalcPage.tsx::reset
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setRecoveryType` — State setter'ı, geri kazanım tipi state'ini varsayılan 'hrv' değerine sıfırlar
  - `setBuildingType` — State setter'ı, bina tipi state'ini varsayılan 'office' değerine sıfırlar
  - `setClimateZone` — State setter'ı, iklim bölgesi state'ini varsayılan 'temperate' değerine sıfırlar
  - `setArea` — State setter'ı, alan state'ini varsayılan '100' değerine sıfırlar
  - `setOccupancy` — State setter'ı, kişi kapasitesi state'ini varsayılan '10' değerine sıfırlar
  - `setOperatingHours` — State setter'ı, çalışma saati state'ini varsayılan '10' değerine sıfırlar
  - `setSensibleEfficiency` — State setter'ı, duyarlı verim state'ini varsayılan '75' değerine sıfırlar
  - `setLatentEfficiency` — State setter'ı, gizli verim state'ini varsayılan '65' değerine sıfırlar
  - `setElectricityCost` — State setter'ı, elektrik maliyeti state'ini varsayılan '3.5' değerine sıfırlar
- **Dönüş**: yok, tüm form state'lerini varsayılan değerlere sıfırlayan yan etki üretir

---

## NODE ID STANDARD

  file: src\views\calculators\HRVCalcPage.tsx
  function: src\views\calculators\HRVCalcPage.tsx::HRVCalcPage
  function: src\views\calculators\HRVCalcPage.tsx::reset

---

## DISA AKTARILANLAR (EXPORTS)
  export: HRVCalcPage