---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-rec79\src\lib\hvacCalculations.ts
skeleton_hash: 662b162f0d2fe6bf
entity_hashes:
  func:calculateAirCurtain: a16a461c41fc6be9
  func:calculateArea: 8b777758444530fa
  func:calculateDuct: 86243d6dca6bacc9
  func:calculateEquivalentDiameter: e56f850e3334addf
  func:calculateHRV: 9b72390bd4928f02
  func:calculateJetFan: eef4601c29de0bf2
  func:calculatePressureLoss: 8846ff7c67dcaadf
  func:evaluateVelocity: 538b5514548af489
  func:getAdjustmentFactor: b21921b06f1d9046
  func:getAirflowPerArea: 8071ecf5668a7a91
  func:getAirflowPerPerson: a4e74efbff475df1
  func:getClimateDeltaT: 7bc419eb37384b72
  func:getNozzleVelocityRange: a607011e8302fbea
  func:getRequiredACH: 54161be63c9d2a18
  func:getRoughness: a72ec660ca8796e6
  func:getTargetFloorVelocity: ac55d84b1e23d51e
  func:suggestDimensions: 0e515a416eadfe3b
  overview: 059f0f173a584817
generated_at: 2026-08-27T04:35:32Z
---

## Genel Bakış
Bu modül, ısıtma havalandırma ve iklimlendirme (HVAC) sistemleri için gerekli mühendislik hesaplamalarını merkezileştiren bir araçtır. Hava perdesi, kanal sistemi, ısı geri kazanım ünitesi (HRV) ve jet fan gibi ekipmanlar için boyutlandırma ve performans analizi sağlar. Fiziksel formüller ve mühendislik standartlarını kullanarak proje koşullarına uygun sonuçlar üretir.

## Fonksiyon Grupları
### Ana HVAC Ekipmanı Hesaplama Fonksiyonları
Modülün temel işlevini yerine getiren, tüm alt hesaplamaları birleştirerek farklı HVAC ekipmanları için nihai sonuçları üreten ana hesaplayıcılardır. Girdi olarak projeye özel tüm parametreleri alarak ekipman boyutlandırması ve performans analizini gerçekleştirir.
- calculateAirCurtain, calculateDuct, calculateHRV, calculateJetFan

### Hava Perdesi Hesaplama Yardımcıları
Hava perdesi boyutlandırma ve performans analizi için gerekli ara hesaplamaları yapan yardımcı fonksiyonlardır. Nozul hız aralığı, hedef zemin hızı ve düzeltme faktörleri gibi parametreleri hesaplar.
- getNozzleVelocityRange, getTargetFloorVelocity, getAdjustmentFactor

### Kanal Hesaplama Yardımcıları
Kanal sistemi tasarımında kullanılan fiziksel hesaplamaları gerçekleştiren yardımcı fonksiyonlardır. Malzeme pürüzlülüğü, eşdeğer çap, kesit alanı, basınç kaybı ve hız değerlendirmesi gibi temel mühendislik parametrelerini hesaplar.
- getRoughness, calculateEquivalentDiameter, calculateArea, calculatePressureLoss, evaluateVelocity, suggestDimensions

### HRV Hesaplama Yardımcıları
Isı geri kazanım ünitesi boyutlandırması için gerekli temel parametreleri sağlayan yardımcı fonksiyonlardır. Bina tipine göre kişi başına ve alan başına hava akışını, iklim bölgesine göre sıcaklık farkını hesaplar.
- getAirflowPerPerson, getAirflowPerArea, getClimateDeltaT

### Jet Fan Hesaplama Yardımcıları
Jet fan boyutlandırması için gerekli hava değişim sayısını hesaplayan yardımcı fonksiyondur. Uygulama ve çalışma moduna göre gerekli hava değişim sayısını belirler.
- getRequiredACH

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### getNozzleVelocityRange
**Ne yapar**: Hava perdesinin uygulama türü ve monte edileceği kapının yüksekliğine göre nozül çıkış hızının minimum, maksimum ve hedef değerlerini m/s cinsinden sunar. Tüm değerler klimaglobal.com ve airtecnics.com gibi endüstri kaynaklarındaki standartlara uygun olarak belirlenir. Farklı kullanım alanları için gereken hız aralıklarını standartlaştırarak doğru boyutlandırma için temel değerler sunar.
**Nasıl yapar**: Uygulama türüne ve kapı yüksekliğine göre önceden kaynaklarda tanımlanmış standart hız aralıklarını giriş parametreleriyle eşleştirir. Her kullanım senaryosu için izin verilen hız sınırlarını ve optimum çalışma noktasını tek bir nesne içinde toplayarak kullanıma sunar, hesaplamalarda tutarlılık sağlar.
**Parametreler**:
- application: AirCurtainApplication — Hava perdesinin kullanılacağı uygulama türünü tanımlayan tip değeri, farklı işletmeler veya alanlar için özel standartları tetikler
- doorHeight: number — Hava perdesinin monte edileceği kapının metre cinsinden yüksekliği, ihtiyaç duyulan nozül hızını doğrudan etkileyen boyut değeri
**Dönüş**: { min: number; max: number; target: number } — Sırasıyla minimum izin verilen nozül hızı, maksimum izin verilen nozül hızı ve sürekli çalışma için önerilen hedef nozül hızı, tüm değerler m/s cinsindendir.

### getTargetFloorVelocity
**Ne yapar**: Kullanılan hava perdesi uygulama türüne göre zemin seviyesinde olması gereken hedef hava hızını m/s cinsinden döndürür. Tüm değerler klimaglobal.com kaynaklı endüstri standartlarına uygun olarak belirlenir, hava perdesinin etkinliğini zemin seviyesinde garanti altına almak için gereken eşik değeri sunar.
**Nasıl yapar**: Uygulama özelinde tanımlanmış standart zemin hızı değerlerini giriş olarak alınan uygulama türüyle eşleştirir. Her ortamın ihtiyaç duyduğu zemin hızı farklı olduğundan, ilgili senaryoya uygun olan hedef değeri tek bir sayı olarak iletir, boyutlandırma hesaplarında referans olarak kullanılmasını sağlar.
**Parametreler**:
- application: AirCurtainApplication — Hava perdesinin kullanılacağı işletim ortamı veya kullanım alanını tanımlayan tip değeri, hedef zemin hızını belirleyen temel parametredir
**Dönüş**: number — Zemin seviyesinde ulaşılması gereken hedef hız, m/s cinsindendir.

### getAdjustmentFactor
**Ne yapar**: Hava perdesinin çalıştığı ortamdaki rüzgar koşulları ve mekandaki trafik yoğunluğuna göre, tüm hesaplamalarda kullanılacak düzeltme faktörünü hesaplar. Standart laboratuvar koşullarında yapılan hesaplamaları gerçek dünya kullanım koşullarına uyacak şekilde ayarlamak için kullanılır.
**Nasıl yapar**: Rüzgar gücü ve trafik yoğunluğu seviyelerine göre atanmış çarpımsal düzeltme katsayılarını birleştirerek tek bir genel düzeltme faktörü oluşturur. Her iki çevresel etkenin hesaplamalar üzerindeki etkisini tek bir katsayıda toplar, ana boyutlandırma hesaplarında bu katsayı ile çarpma yapılarak gerçek koşullara uygun sonuçlar elde edilir.
**Parametreler**:
- wind: WindCondition — Hava perdesinin çalışacağı ortamdaki rüzgar koşulunun şiddetini veya sınıfını tanımlayan tip değeri
- traffic: TrafficIntensity — Mekandaki insan veya araç geçiş yoğunluğunu ifade eden, perdenin etkinliğini etkileyen trafik sınıfını tanımlayan tip değeri
**Dönüş**: number — Tüm hesaplamalarda kullanılacak toplam düzeltme faktörü değeri, standart sonuçları gerçek koşullara uyarlamak için kullanılır.

### calculateAirCurtain
**Ne yapar**: Girişte verilen tüm parametreleri kullanarak hava perdesi boyutlandırma hesaplamasını gerçekleştirir. Ana hesaplama formülü CFM = Hız × Çıkış Alanı olarak kullanılır, perdenin ihtiyaç duyduğu tüm teknik değerleri tek bir sonuç nesnesinde toplar.
**Nasıl yapar**: Önce nozül çıkış alanını kapı genişliği ile tipik 50-100mm aralığında olan nozül yüksekliğini çarparak hesaplar. Ardından hesaplanan çıkış alanını nozül çıkış hızı ile çarparak gerekli hava debisini CFM cinsinden çıkarır, tüm ara hesaplamalar ve nihai boyutlandırma sonuçlarını bir araya getirerek sonuç nesnesi olarak sunar.
**Parametreler**:
- input: AirCurtainInput — Hava perdesi hesaplaması için gerekli tüm giriş verilerini, kapı boyutları, uygulama türü, çevresel koşullar gibi tüm parametreleri barındıran tip nesnesi
**Dönüş**: AirCurtainResult — Hesaplanan boyutlandırma sonuçlarını, gerekli hava debisi, çalışma parametreleri gibi tüm çıktıları içeren tip nesnesi.

### getRoughness
**Ne yapar**: Hava kanalının üretildiği malzemeye göre malzemenin pürüzlülük faktörünü mm cinsinden döndürür. Kanal içindeki hava akışının sürtünmeden kaynaklanan etkilerini hesaplamak için temel bir değer sunar, basınç kaybı hesaplarında kullanılır.
**Nasıl yapar**: Farklı kanal malzemeleri için önceden tanımlanmış standart pürüzlülük değerlerini giriş olarak alınan malzeme türüyle eşleştirir. Her malzemenin akışa farklı derecede direnç göstermesi nedeniyle, ilgili malzemeye ait doğru pürüzlülük değerini ileterek basınç kaybı hesaplarının doğruluğunu garanti altına alır.
**Parametreler**:
- material: DuctMaterial — Hava kanalının üretildiği malzeme türünü tanımlayan, metal, plastik gibi seçenekleri içeren tip değeri
**Dönüş**: number — İlgili malzemenin pürüzlülük faktörü, mm cinsindendir ve basınç kaybı hesaplarında kullanılır.

### calculateEquivalentDiameter
**Ne yapar**: Dikdörtgen kesitli hava kanalları için eşdeğer çap değerini hesaplar. Dikdörtgen kanalların daire kesitli kanallarla aynı akış özelliklerine sahip olacak şekilde bir çap değerine dönüştürülmesini sağlar, tek çap parametresiyle tüm standart hesaplamaların kullanılmasına olanak tanır.
**Nasıl yapar**: Deq = (1.30 × (w × h)^0.625) / (w + h)^0.25 formülünü kullanarak giriş olarak alınan kanalın genişlik ve yükseklik değerlerini eşdeğer çapa dönüştürür. Bu endüstri standardı formül ile dikdörtgen kanalların akış özellikleri doğru bir şekilde yuvarlak kanal standartlarına uyarlanır, karmaşık hesapları basitleştirir.
**Parametreler**:
- width: number — Dikdörtgen kanalın metre cinsinden genişliği, eşdeğer çap hesaplamasının temel girdisidir
- height: number — Dikdörtgen kanalın metre cinsinden yüksekliği, genişlik ile birlikte formülde kullanılır
**Dönüş**: number — Hesaplanan eşdeğer çap değeri, tüm standart kanal hesaplamalarında kullanılmak üzere uygun birimlerle sunulur.

### calculateArea
**Ne yapar**: Farklı türdeki hava kanallarının kesit alanını m² cinsinden hesaplar. Kanal içindeki hava hızı, debi gibi parametreleri hesaplamak için gereken temel kesit alan değerini, kanal türüne uygun olarak doğru şekilde hesaplar.
**Nasıl yapar**: Girişte alınan kanal türüne göre uygun alan hesaplama formülünü seçer ve uygular. Dairesel kanallar için sadece çap değerini kullanarak alanı hesaplarken, dikdörtgen kanallar için genişlik ve yükseklik değerlerini kullanır, ilgili kanal türü için zorunlu olmayan parametreleri hesaplamaya dahil etmez, her tür için doğru alan değerini sunar.
**Parametreler**:
- ductType: DuctType — Hesaplama yapılacak kanalın türünü belirten, dairesel, dikdörtgen gibi seçenekleri içeren tip değeri
- diameter?: number — Yalnızca dairesel kanallar için gerekli olan kanalın metre cinsinden çapı, diğer kanal türleri için zorunlu değildir
- width?: number — Dikdörtgen gibi çap kullanmayan kanal türleri için gerekli olan kanalın metre cinsinden genişliği
- height?: number — Yalnızca dikdörtgen kanallar için gerekli olan kanalın metre cinsinden yüksekliği
**Dönüş**: number — Hesaplanan kanal kesit alanı, m² cinsindendir ve tüm akış hesaplarında kullanılır.

### calculatePressureLoss
**Ne yapar**: Bir hava kanalında birim uzunluk başına düşen basınç kaybını Pascal/metre (Pa/m) cinsinden hesaplar. Darcy-Weisbach denklemini kullanır ve sürtünme faktörünü Colebrook-White benzeri bir yaklaşımla belirler.

**Nasıl yapar**: Öncelikle çapı milimetreden metreye dönüştürür ve geçersiz girdileri (sıfır veya negatif değerler) kontrol ederek bu durumda 0 döner. Ardından `roughness` parametresini (mm cinsinden) ve dönüştürülmüş çapı kullanarak bağıl pürüzlülüğü (ε/D, boyutsuz) hesaplar. Reynolds sayısını `reynolds` fonksiyonuyla, sürtünme faktörünü ise `surtunmeFaktoru` fonksiyonuyla elde eder. Son olarak Darcy-Weisbach formülünü uygular: `ΔP/L = f × (ρ × V²) / (2 × D)`. Burada `AIR_DENSITY` sabiti hava yoğunluğunu temsil eder. Düzeltme notu (T145-VH, 2026-08-23): Daha önce sürtünme faktörü pratikte sabit bir değer üretiyordu (`f = 0,02 + pürüzlülük·0,1`); bu düzeltmeyle birlikte Reynolds sayısı ve bağıl pürüzlülüğe bağlı gerçek bir hesaplama yapılmaktadır.

**Parametreler**:
- `velocity`: `number` — Hava hızı, metre/saniye (m/s) cinsinden. Sıfır veya negatif olamaz; bu durumda fonksiyon 0 döner.
- `diameter`: `number` — Kanal çapı, milimetre (mm) cinsinden. Fonksiyon içinde metreye dönüştürülür. Sıfır veya negatif olamaz; bu durumda fonksiyon 0 döner.
- `roughness`: `number` — Kanal yüzey pürüzlülüğü, milimetre (mm) cinsinden. Bağıl pürüzlülük hesabında kullanılmak üzere metreye dönüştürülür.

**Dönüş**: `number` — Birim uzunluk başına basınç kaybı, Pascal/metre (Pa/m) cinsinden. Geçersiz girdilerde 0 değerini döndürür.

### evaluateVelocity
**Ne yapar**: Kanal içindeki veya hava perdesi çıkışındaki hava hızının ASHRAE önerilerine uygunluğunu değerlendirir. Hızın durumunu sınıflandırır ve durumu açıklayan bir mesajla birlikte döndürür, sistemin çalışma koşullarının uygunluğunu kontrol etmeye olanak tanır.
**Nasıl yapar**: Giriş olarak alınan hız değerini ASHRAE standartlarında tanımlanan düşük, optimal, yüksek ve kritik eşik değerleriyle karşılaştırır. Hızın hangi aralıkta kaldığını tespit ederek ilgili durum etiketini atar, kullanıcının sorunu anlamasını sağlayan açıklayıcı bir mesajla birlikte bu değerleri sunar, hızın iyileştirilmesi gereken durumları işaret eder.
**Parametreler**:
- velocity: number — Değerlendirilecek olan m/s cinsinden hava hızı, eşik değerlerle karşılaştırılan temel girdidir
**Dönüş**: { status: 'low' | 'optimal' | 'high' | 'critical'; message: string } — Hızın uygunluk durumunu belirten durum etiketi ve durumu açıklayan kullanıcı dostu mesajı içeren nesne.

### suggestDimensions
**Ne yapar**: İstenen toplam hava debisi ve hedef kanal içi hız değerine uygun olarak kullanılabilecek alternatif standart kanal boyutu önerilerini sunar. Kullanıcının projesinin gereksinimlerine en uygun kanal boyutunu seçmesine yardımcı olur, mühendislik tasarım sürecini hızlandırır.
**Nasıl yapar**: Önce hedef hız ve hava debisi değerlerini kullanarak ihtiyaç duyulan toplam kesit alanını hesaplar. Ardından sektörde yaygın olarak kullanılan standart kanal boyutları arasından bu alana uygun olan birden fazla alternatifi seçer, her bir alternatifi genişlik ve yükseklik değerleriyle sunarak kullanıcının seçim yapmasına olanak tanır, tüm önerilerin hedef hızı sağlayacak şekilde hesaplanmasını garanti eder.
**Parametreler**:
- airflow: number — Kanalda taşınması gereken toplam hava debisi, gerekli kesit alanını hesaplamak için kullanılan girdi
- targetVelocity: number — Kanal içinde olması hedeflenen m/s cinsinden hava hızı, ihtiyaç duyulan alanı belirleyen temel parametre
**Dönüş**: { width: number; height: number }[] - Her bir alternatif kanalın metre cinsinden genişliği ve yüksekliğini içeren nesnelerden oluşan dizi, birden fazla uygulanabilir boyut seçeneği sunar.

### calculateDuct
**Ne yapar**: Verilen kanal parametreleri ile kanal boyutlandırma hesaplaması yapar. Hava hızı, basınç kaybı, eşdeğer çap ve önerilen ebatları hesaplayarak kullanıcının kanal seçimine yönelik öneriler sunar.

**Nasıl yapar**: Hava debisini m³/h'den m³/s'ye çevirir, kanal kesit alanını hesaplayarak hava hızını belirler. Hız durumunu değerlendirir, dairesel kanallarda çapı, dikdörtgen kanallarda eşdeğer çapı kullanarak malzeme pürüzlülüğü ile birlikte basınç kaybını hesaplar. Hız durumuna, malzeme türüne ve basınç kaybı seviyesine göre öneriler üretir.

**Parametreler**:
- `input`: DuctInput — Kanal boyutlandırma hesaplaması için gerekli tüm parametreleri içeren nesne. İçerisinde airflow, ductType, diameter, width, height, length ve material alanları bulunur.

**Dönüş**: DuctResult — velocity (m/s), velocityStatus, velocityMessage, pressureLossPerMeter (Pa/m), totalPressureLoss (Pa), equivalentDiameter (mm), suggestedDimensions ve recommendations alanlarını içeren sonuç nesnesi.

### getAirflowPerPerson
**Ne yapar**: Bina tipine göre kişi başı taze hava ihtiyacı değerini (m³/h·kişi) döndürür. ASHRAE 62.1 standardına dayalı olarak konut, ofis, ticari ve endüstriyel bina tipleri için farklı debi değerleri sağlar.

**Nasıl yapar**: Bina tipine karşılık gelen sabit bir değer döndüren basit bir eşleme (mapping) fonksiyonudur. Her bina tipi için standartlara uygun önceden tanımlı bir hava debisi değeri bulunur ve bu değer hesaplamalarda kullanılmak üzere döndürülür.

**Parametreler**:
- `buildingType`: BuildingType — Hava debisi hesaplanacak bina tipi (residential, office, commercial, industrial).

**Dönüş**: number — Kişi başı taze hava ihtiyacı (m³/h·kişi).

### getAirflowPerArea
**Ne yapar**: Bina tipine göre alan başı havalandırma değerini (m³/h·m²) döndürür. ASHRAE 62.1 standardına göre her bina tipi için metrekare başına düşen hava debisini tanımlar.

**Nasıl yapar**: Bina tipine göre önceden tanımlı sabit bir hava debisi değerini eşleme yoluyla döndürür. Konut, ofis, ticari ve endüstriyel alanlar için farklı metrekare başına düşen havalandırma değerleri mevcuttur.

**Parametreler**:
- `buildingType`: BuildingType — Alan başı havalandırma değerinin hesaplanacağı bina tipi (residential, office, commercial, industrial).

**Dönüş**: number — Alan başı havalandırma miktarı (m³/h·m²).

### getClimateDeltaT
**Ne yapar**: İklim bölgesine göre ortalama ısıtma ve soğutma sıcaklık farklarını (ΔT) döndürür. Soğuk, ılıman ve sıcak bölgeler için farklı sıcaklık farkı değerleri sağlar.

**Nasıl yapar**: İklim bölgesine karşılık gelen nesneyi doğrudan döndüren eşleme tabanlı bir fonksiyondur. Her bölge için ısıtma ve soğutma dönemlerinde beklenen ortalama sıcaklık farkları tanımlıdır ve ısı geri kazanım hesaplamalarında kullanılır.

**Parametreler**:
- `zone`: ClimateZone — Sıcaklık farklarının belirleneceği iklim bölgesi (cold, temperate, hot).

**Dönüş**: { heating: number; cooling: number } — Isıtma ve soğutma dönemleri için sıcaklık farkları (°C).

### calculateHRV
**Ne yapar**: Isı geri kazanım cihazı (HRV/ERV) hesaplaması yapar. Gerekli hava debisini, ısı ve soğutma geri kazanım miktarlarını, yıllık enerji tasarrufunu, maliyet tasarrufunu, CO2 azaltımını ve geri ödeme süresini hesaplar.

**Nasıl yapar**: Kişi başı ve alan başı hava debisi değerlerini (getAirflowPerPerson ve getAirflowPerArea) kullanarak toplam gerekli hava debisini belirler. İklim bölgesine göre sıcaklık farklarını alarak (getClimateDeltaT) ısıtma ve soğutma dönemleri için geri kazanım miktarlarını hesaplar. ERV cihazları için latent verimlilik eklenerek soğutma verimliliği yükseltilir. Yıllık enerji ve maliyet tasarrufu, cihaz kapasitesine göre logaritmik maliyet modeli ile geri ödeme süresi hesaplanır.

**Parametreler**:
- `input`: HRVInput — Isı geri kazanım hesaplaması için tüm parametreleri içeren nesne. recoveryType, buildingType, climateZone, occupancy, area, sensibleEfficiency, latentEfficiency, operatingHoursPerDay ve electricityCostPerKWh alanlarını barındırır.

**Dönüş**: HRVResult — requiredAirflow (m³/h), airflowPerPerson (m³/h·kişi), heatingRecovery (W), coolingRecovery (W), totalEfficiency (%), annualEnergySaving (kWh/yıl), annualCostSaving (₺/yıl), co2Reduction (kg CO₂/yıl), paybackPeriod (yıl) ve recommendations (string[]) alanlarını içeren sonuç nesnesi.

### getRequiredACH
**Ne yapar**: Uygulama türü ve havalandırma moduna göre gerekli hava değişim sayısını (ACH - Air Changes per Hour) döndürür. NFPA 88A ve BS 7346-7 standartlarına dayanır.

**Nasıl yapar**: Havalandırma modunun 'smoke' (duman tahliye) olup olmadığına ve uygulama türünün otopark veya tünel olup olmadığına bağlı olarak önceden tanımlı ACH değerlerini döndürür. Duman tahliye modunda daha yüksek, normal havalandırma modunda daha düşük değerler kullanılır.

**Parametreler**:
- `application`: JetFanApplication — Uygulama türü (parking veya tunnel).
- `mode`: JetFanMode — Havalandırma modu (normal veya smoke).

**Dönüş**: number — Gerekli hava değişim sayısı (ACH).

### calculateJetFan
**Ne yapar**: Otopark veya tünel uygulamaları için jet fan sistemi hesaplaması yapar. Gerekli hacim, hava debisi, ACH, toplam itki kuvveti, fan sayısı ve önerilen fan aralığını hesaplar.

**Nasıl yapar**: Alan boyutlarını kullanarak hacmi hesaplar ve getRequiredACH fonksiyonu ile gerekli ACH değerini belirler. Havalandırma moduna göre hedef hız seçerek (duman tahliyede 2.0 m/s, normalde 1.5 m/s) kütle debisi ve toplam itki kuvvetini hesaplar. Kurulum faktörünü (0.75) uygulayarak standart bir jet fan kapasitesine göre gerekli fan sayısını ve fanlar arası önerilen mesafeyi belirler.

**Parametreler**:
- `input`: JetFanInput — Jet fan hesaplaması için gerekli parametreleri içeren nesne. length, width, height, applicationType ve ventilationMode alanlarını barındırır.

**Dönüş**: JetFanResult — volume (m³), requiredAirflow (m³/h), ach, totalThrust (N), fanCount, recommendedSpacing (m), installationFactor ve recommendations (string[]) alanlarını içeren sonuç nesnesi.

---

## İTHALATLAR (IMPORTS)
- import: ./hvac/ductPressure::reynolds
- import: ./hvac/ductPressure::surtunmeFaktoru

---

## INTERFACES

### AirCurtainInput
- `doorWidth: number`
- `doorHeight: number`
- `application: AirCurtainApplication`
- `windCondition: WindCondition`
- `trafficIntensity: TrafficIntensity`

### AirCurtainResult
- `requiredAirflow: number`
- `nozzleVelocity: number`
- `floorVelocity: number`
- `suggestedPower: number`
- `nozzleWidth: number`
- `nozzleHeight: number`
- `efficiency: 'optimal' | 'acceptable' | 'marginal'`
- `recommendations: string[]`

### DuctInput
- `airflow: number`
- `ductType: DuctType`
- `diameter?: number`
- `width?: number`
- `height?: number`
- `length: number`
- `material: DuctMaterial`

### DuctResult
- `velocity: number`
- `velocityStatus: 'low' | 'optimal' | 'high' | 'critical'`
- `velocityMessage: string`
- `pressureLossPerMeter: number`
- `totalPressureLoss: number`
- `equivalentDiameter?: number`
- `suggestedDimensions: { width: number; height: number }[]`
- `recommendations: string[]`

### HRVInput
- `recoveryType: RecoveryType`
- `buildingType: BuildingType`
- `climateZone: ClimateZone`
- `area: number`
- `occupancy: number`
- `operatingHoursPerDay: number`
- `sensibleEfficiency: number`
- `latentEfficiency: number`
- `electricityCostPerKWh: number`

### HRVResult
- `requiredAirflow: number`
- `airflowPerPerson: number`
- `heatingRecovery: number`
- `coolingRecovery: number`
- `totalEfficiency: number`
- `annualEnergySaving: number`
- `annualCostSaving: number`
- `co2Reduction: number`
- `paybackPeriod: number`
- `recommendations: string[]`

### JetFanInput
- `applicationType: JetFanApplicationType`
- `ventilationMode: JetFanMode`
- `length: number`
- `width: number`
- `height: number`
- `carCapacity: number`
- `trafficFlowPerHour: number`

### JetFanResult
- `volume: number`
- `requiredAirflow: number`
- `ach: number`
- `totalThrust: number`
- `fanCount: number`
- `recommendedSpacing: number`
- `installationFactor: number`
- `recommendations: string[]`

---

## TYPE ALIASES

### AirCurtainApplication
```typescript
type AirCurtainApplication = 'comfort' | 'insect' | 'coldRoom'
```

### WindCondition
```typescript
type WindCondition = 'none' | 'light' | 'moderate' | 'strong'
```

### TrafficIntensity
```typescript
type TrafficIntensity = 'low' | 'medium' | 'high'
```

### DuctType
```typescript
type DuctType = 'circular' | 'rectangular'
```

### DuctMaterial
```typescript
type DuctMaterial = 'galvanized' | 'pvc' | 'flex'
```

### BuildingType
```typescript
type BuildingType = 'residential' | 'office' | 'commercial' | 'industrial'
```

### RecoveryType
```typescript
type RecoveryType = 'hrv' | 'erv'
```

### ClimateZone
```typescript
type ClimateZone = 'cold' | 'temperate' | 'hot'
```

### JetFanApplication
```typescript
type JetFanApplication = 'parking' | 'tunnel'
```

### JetFanApplicationType

### JetFanMode
```typescript
type JetFanMode = 'normal' | 'smoke'
```

---

## SABİTLER
- **TYPICAL_JET_FAN** (object) — `{
    thrust: 25,       // N (tek fan)
    airflow: 3500,    // m³/h
    p...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getNozzleVelocityRange
- **params**: `application` (AirCurtainApplication), `doorHeight` (number)
- **ic_degiskenler**:
  - `baselineHeight` — sabit referans yüksekliği (2.5 metre)
  - `heightFactor` — kapı yüksekliğine göre logaritmik düzeltme katsayısı; `doorHeight` arttıkça çıkış hızı artar
- **Dönüş**: `{ min: number; max: number; target: number }` — application türüne göre nozül çıkış hızı aralığı ve hedef değer (heightFactor ile çarpılmış)

### [N2_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getTargetFloorVelocity
- **params**: `application` (AirCurtainApplication)
- **ic_degiskenler**: (yok)
- **Dönüş**: `number` — application türüne göre hedef zemin hızı (m/s)

### [N3_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getAdjustmentFactor
- **params**: `wind` (WindCondition), `traffic` (TrafficIntensity)
- **ic_degiskenler**:
  - `factor` — rüzgar ve trafik koşullarına göre birikimli düzeltme katsayısı; başlangıç değeri 1.0, switch-case ile çarpılır
- **Dönüş**: `number` — toplam düzeltme katsayısı

### [N4_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculateAirCurtain
- **params**: `input` (AirCurtainInput)
- **ic_degiskenler**:
  - `doorWidth` — input'tan destructure edilen kapı genişliği (m)
  - `doorHeight` — input'tan destructure edilen kapı yüksekliği (m)
  - `application` — input'tan destructure edilen uygulama türü
  - `windCondition` — input'tan destructure edilen rüzgar koşulu
  - `trafficIntensity` — input'tan destructure edilen trafik yoğunluğu
  - `nozzleWidth` — nozül genişliği; kapı genişliğine eşit
  - `nozzleDepth` — sabit nozül derinliği (0.042 m = 42 mm)
  - `nozzleArea` — nozül kesit alanı (m²); `nozzleWidth * nozzleDepth`
  - `velocityRange` — `getNozzleVelocityRange` çağrısından dönen hız aralığı nesnesi
  - `adjustmentFactor` — `getAdjustmentFactor` çağrısından dönen çevresel düzeltme katsayısı
  - `nozzleVelocity` — hedef çıkış hızı; `velocityRange.target * adjustmentFactor`
  - `airflowM3s` — saniyelik hava debisi (m³/s); `nozzleVelocity * nozzleArea`
  - `requiredAirflow` — saatlik gerekli hava debisi (m³/h); `airflowM3s * 3600`, yuvarlanmış
  - `floorVelocity` — zemin hızı tahmini; jet sönümleme formülü ile hesaplanır
  - `targetFloor` — `getTargetFloorVelocity` çağrısından dönen hedef zemin hızı
  - `suggestedPower` — önerilen motor gücü (W); ampirik formül ile hesaplanır
  - `efficiency` — verimlilik durumu; floorVelocity/targetFloor oranına göre belirlenir
  - `recommendations` — koşullara göre öneriler dizisi (doorHeight, windCondition, doorWidth kontrolü)
- **Dönüş**: `AirCurtainResult` — requiredAirflow, nozzleVelocity, floorVelocity, suggestedPower, nozzleWidth, nozzleHeight, efficiency, recommendations alanlarını içerir

### [N5_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getRoughness
- **params**: `material` (DuctMaterial)
- **ic_degiskenler**: (yok)
- **Dönüş**: `number` — material türüne göre pürüzlülük değeri (mm cinsinden)

### [N6_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculateEquivalentDiameter
- **params**: `width` (number), `height` (number)
- **ic_degiskenler**:
  - `w` — genişlik metre cinsinden; `width / 1000`
  - `h` — yükseklik metre cinsinden; `height / 1000`
  - `deq` — eşdeğer çap metre cinsinden; ampirik formül ile hesaplanır
- **Dönüş**: `number` — eşdeğer çap mm cinsinden; `deq * 1000`

### [N7_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculateArea
- **params**: `ductType` (DuctType), `diameter?` (number), `width?` (number), `height?` (number)
- **ic_degiskenler**:
  - `r` — dairesel kanal için yarıçap metre cinsinden; `diameter / 2000`
- **Dönüş**: `number` — kanal kesit alanı (m²); dairesel için πr², dikdörtgen için width×height metre cinsinden, geçersiz durumda 0

### [N8_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculatePressureLoss
- **params**: `velocity` (number), `diameter` (number), `roughness` (number)
- **ic_degiskenler**:
  - `D` — çap metre cinsinden; `diameter / 1000`
  - `bagilPuruzluluk` — bağıl pürüzlülük (boyutsuz); `roughness / 1000 / D`
  - `f` — Darcy sürtünme faktörü; `surtunmeFaktoru(reynolds(velocity, diameter), bagilPuruzluluk)` çağrısı ile elde edilir
- **Dönüş**: `number` — birim uzunluk başına basınç kaybı (Pa/m); D veya velocity sıfıra eşit/negatifse 0 döner

### [N9_NASIL] AST Pointer: src/lib/hvacCalculations.ts::evaluateVelocity
- **params**: `velocity` (number)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ status: 'low' | 'optimal' | 'high' | 'critical'; message: string }` — velocity değerine göre durum ve Türkçe mesaj

### [N10_NASIL] AST Pointer: src/lib/hvacCalculations.ts::suggestDimensions
- **params**: `airflow` (number), `targetVelocity` (number, varsayılan 6)
- **ic_degiskenler**:
  - `Q` — debi m³/s cinsinden; `airflow / 3600`
  - `targetArea` — hedef kesit alanı (m²); `Q / targetVelocity`
  - `suggestions` — önerilen boyutlar dizisi
  - `standardSizes` — standart kanal boyutları dizisi (mm cinsinden: 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000)
  - `w` — döngüdeki standart genişlik değeri
  - `h` — hesaplanan yükseklik (mm); `targetArea * 1000000 / w`
  - `closestH` — standardSizes içindeki en yakın yükseklik değeri
  - `actualArea` — gerçek kesit alanı (m²); `w/1000 * closestH/1000`
  - `actualVelocity` — gerçek hava hızı (m/s); `Q / actualArea`
- **Dönüş**: `{ width: number; height: number }[]` — 4-8 m/s hız aralığında, en fazla 3 adet önerilen boyut çifti (mm cinsinden)

### [N11_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculateDuct
- **params**: `input` (DuctInput)
- **ic_degiskenler**:
  - `airflow` — input'tan destructure edilen hava debisi (m³/h)
  - `ductType` — input'tan destructure edilen kanal tipi
  - `diameter` — input'tan destructure edilen çap (mm)
  - `width` — input'tan destructure edilen genişlik (mm)
  - `height` — input'tan destructure edilen yükseklik (mm)
  - `length` — input'tan destructure edilen kanal uzunluğu (m)
  - `material` — input'tan destructure edilen malzeme türü
  - `Q` — debi m³/s cinsinden; `airflow / 3600`
  - `area` — `calculateArea` çağrısından dönen kanal kesit alanı (m²)
  - `velocity` — hava hızı (m/s); `Q / area`, area sıfırsa 0
  - `velocityStatus` — `evaluateVelocity` çağrısından dönen hız durumu
  - `velocityMessage` — `evaluateVelocity` çağrısından dönen hız mesajı
  - `equivalentDiameter` — eşdeğer çap (mm); dikdörtgen kanal için `calculateEquivalentDiameter` çağrısı ile hesaplanır, daireselde undefined
  - `effectiveDiameter` — basınç kaybı hesabında kullanılan etkin çap (mm)
  - `roughness` — `getRoughness` çağrısından dönen pürüzlülük değeri
  - `pressureLossPerMeter` — `calculatePressureLoss` çağrısından dönen birim basınç kaybı (Pa/m)
  - `totalPressureLoss` — toplam basınç kaybı (Pa); `pressureLossPerMeter * length`
  - `suggestedDimensions` — `suggestDimensions` çağrısından dönen alternatif boyutlar
  - `recommendations` — koşullara göre öneriler dizisi (velocityStatus, material, length, totalPressureLoss kontrolü)
- **Dönüş**: `DuctResult` — velocity, velocityStatus, velocityMessage, pressureLossPerMeter, totalPressureLoss, equivalentDiameter, suggestedDimensions, recommendations alanlarını içerir

### [N12_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getAirflowPerPerson
- **params**: `buildingType` (BuildingType)
- **ic_degiskenler**: (yok)
- **Dönüş**: `number` — buildingType türüne göre kişi başı taze hava debisi (m³/h)

### [N13_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getAirflowPerArea
- **params**: `buildingType` (BuildingType)
- **ic_degiskenler**: (yok)
- **Dönüş**: `number` — buildingType türüne göre alan birimi başına taze hava debisi (m³/h·m²)

### [N14_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getClimateDeltaT
- **params**: `zone` (ClimateZone)
- **ic_degiskenler**: (yok)
- **Dönüş**: `{ heating: number; cooling: number }` — zone türüne göre ısıtma ve soğutma sıcaklık farkları (°C)

### [N15_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculateHRV
- **params**: `input` (HRVInput)
- **ic_degiskenler**:
  - `recoveryType` — input'tan destructure edilen geri kazanım tipi ('hrv' veya 'erv')
  - `buildingType` — input'tan destructure edilen bina tipi
  - `climateZone` — input'tan destructure edilen iklim bölgesi
  - `occupancy` — input'tan destructure edilen kişi sayısı
  - `area` — input'tan destructure edilen alan (m²)
  - `sensibleEfficiency` — input'tan destructure edilen duyulur verimlilik (%)
  - `latentEfficiency` — input'tan destructure edilen gizli verimlilik (%)
  - `operatingHoursPerDay` — input'tan destructure edilen günlük çalışma saati
  - `electricityCostPerKWh` — input'tan destructure edilen elektrik birim fiyatı (₺/kWh)
  - `airflowPerPerson` — `getAirflowPerPerson` çağrısından dönen kişi başı debi (m³/h)
  - `airflowPerArea` — `getAirflowPerArea` çağrısından dönen alan birimi debisi (m³/h·m²)
  - `requiredAirflow` — gerekli hava debisi (m³/h); kişi bazlı ve alan bazlı hesabın maksimumu
  - `deltaT` — `getClimateDeltaT` çağrısından dönen sıcaklık farkları nesnesi
  - `sensEff` — duyulur verimlilik ondalık; `sensibleEfficiency / 100`
  - `latEff` — gizli verimlilik ondalık; `latentEfficiency / 100`
  - `heatingRecovery` — ısıtma geri kazanımı (W); sadece duyulur ısı
  - `coolingEfficiency` — soğutma verimliliği; ERV ise `sensEff + latEff * 0.4`, HRV ise `sensEff`
  - `coolingRecovery` — soğutma geri kazanımı (W)
  - `heatingHours` — yıllık ısıtma çalışma saati; `operatingHoursPerDay * 180`
  - `coolingHours` — yıllık soğutma çalışma saati; `operatingHoursPerDay * 120`
  - `annualEnergySaving` — yıllık enerji tasarrufu (kWh); yuvarlanmış
  - `annualCostSaving` — yıllık maliyet tasarrufu (₺); yuvarlanmış
  - `co2Reduction` — yıllık CO2 azaltımı (kg); yuvarlanmış
  - `baseCost` — sabit temel cihaz maliyeti (10000)
  - `capacityFactor` — kapasiteye bağlı maliyet bileşeni; logaritmik ölçekleme
  - `estimatedDeviceCost` — tahmini toplam cihaz maliyeti (₺)
  - `paybackPeriod` — geri ödeme süresi (yıl); annualCostSaving 100'den küçükse 99 döner
  - `recommendations` — koşullara göre öneriler dizisi (sensibleEfficiency, recoveryType, climateZone, paybackPeriod kontrolü)
- **Dönüş**: `HRVResult` — requiredAirflow, airflowPerPerson, heatingRecovery, coolingRecovery, totalEfficiency, annualEnergySaving, annualCostSaving, co2Reduction, paybackPeriod, recommendations alanlarını içerir

### [N16_NASIL] AST Pointer: src/lib/hvacCalculations.ts::getRequiredACH
- **params**: `application` (JetFanApplication), `mode` (JetFanMode)
- **ic_degiskenler**: (yok)
- **Dönüş**: `number` — mode ve application kombinasyonuna göre gerekli saatlik hava değişim sayısı (ACH)

### [N17_NASIL] AST Pointer: src/lib/hvacCalculations.ts::calculateJetFan
- **params**: `input` (JetFanInput)
- **ic_degiskenler**:
  - `length` — input'tan destructure edilen alan uzunluğu (m)
  - `width` — input'tan destructure edilen alan genişliği (m)
  - `height` — input'tan destructure edilen alan yüksekliği (m)
  - `applicationType` — input'tan destructure edilen uygulama türü
  - `ventilationMode` — input'tan destructure edilen havalandırma modu
  - `volume` — alan hacmi (m³); `length * width * height`
  - `ach` — `getRequiredACH` çağrısından dönen gerekli ACH değeri
  - `requiredAirflow` — gerekli hava debisi (m³/h); `volume * ach`
  - `targetVelocity` — hedef hava hızı (m/s); smoke modunda 2.0, normal modda 1.5
  - `massFlowRate` — kütle akış hızı (kg/s); `AIR_DENSITY * (requiredAirflow / 3600)`
  - `totalThrust` — toplam gerekli itki (N); `massFlowRate * targetVelocity`
  - `installationFactor` — sabit kurulum kayıp faktörü (0.75)
  - `fanCount` — önerilen jet fan sayısı; `ceil((totalThrust / installationFactor) / TYPICAL_JET_FAN.thrust)`
  - `recommendedSpacing` — fanlar arası önerilen mesafe (m); fan sayısına göre hesaplanır
- **Dönüş**: `JetFanResult` — volume, requiredAirflow, ach, totalThrust, fanCount, recommendedSpacing, installationFactor, recommendations alanlarını içerir

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    hvacCalculations_ts__calculateAirCurtain["calculateAirCurtain"]
    hvacCalculations_ts__calculateArea["calculateArea"]
    hvacCalculations_ts__calculateDuct["calculateDuct"]
    hvacCalculations_ts__calculateEquivalentDiameter["calculateEquivalentDiameter"]
    hvacCalculations_ts__calculateHRV["calculateHRV"]
    hvacCalculations_ts__calculateJetFan["calculateJetFan"]
    hvacCalculations_ts__calculatePressureLoss["calculatePressureLoss"]
    hvacCalculations_ts__evaluateVelocity["evaluateVelocity"]
    hvacCalculations_ts__getAdjustmentFactor["getAdjustmentFactor"]
    hvacCalculations_ts__getAirflowPerArea["getAirflowPerArea"]
    hvacCalculations_ts__getAirflowPerPerson["getAirflowPerPerson"]
    hvacCalculations_ts__getClimateDeltaT["getClimateDeltaT"]
    hvacCalculations_ts__getNozzleVelocityRange["getNozzleVelocityRange"]
    hvacCalculations_ts__getRequiredACH["getRequiredACH"]
    hvacCalculations_ts__getRoughness["getRoughness"]
    hvacCalculations_ts__getTargetFloorVelocity["getTargetFloorVelocity"]
    hvacCalculations_ts__suggestDimensions["suggestDimensions"]
    hvacCalculations_ts__calculateDuct --> hvacCalculations_ts__suggestDimensions
    hvacCalculations_ts__calculateDuct --> hvacCalculations_ts__getRoughness
    hvacCalculations_ts__calculateDuct --> hvacCalculations_ts__calculateArea
    hvacCalculations_ts__calculateAirCurtain --> hvacCalculations_ts__getTargetFloorVelocity
    hvacCalculations_ts__calculateDuct --> hvacCalculations_ts__evaluateVelocity
    hvacCalculations_ts__calculateHRV --> hvacCalculations_ts__getClimateDeltaT
    hvacCalculations_ts__calculateJetFan --> hvacCalculations_ts__getRequiredACH
    hvacCalculations_ts__calculateHRV --> hvacCalculations_ts__getAirflowPerPerson
    hvacCalculations_ts__calculateDuct --> hvacCalculations_ts__calculateEquivalentDiameter
    hvacCalculations_ts__calculateAirCurtain --> hvacCalculations_ts__getNozzleVelocityRange
    hvacCalculations_ts__calculateHRV --> hvacCalculations_ts__getAirflowPerArea
    hvacCalculations_ts__calculateAirCurtain --> hvacCalculations_ts__getAdjustmentFactor
    hvacCalculations_ts__calculateDuct --> hvacCalculations_ts__calculatePressureLoss
```

## NODE ID STANDARD

  file: src\lib\hvacCalculations.ts
  function: src\lib\hvacCalculations.ts::getNozzleVelocityRange
  function: src\lib\hvacCalculations.ts::getTargetFloorVelocity
  function: src\lib\hvacCalculations.ts::getAdjustmentFactor
  function: src\lib\hvacCalculations.ts::calculateAirCurtain
  function: src\lib\hvacCalculations.ts::getRoughness
  function: src\lib\hvacCalculations.ts::calculateEquivalentDiameter
  function: src\lib\hvacCalculations.ts::calculateArea
  function: src\lib\hvacCalculations.ts::calculatePressureLoss
  function: src\lib\hvacCalculations.ts::evaluateVelocity
  function: src\lib\hvacCalculations.ts::suggestDimensions
  function: src\lib\hvacCalculations.ts::calculateDuct
  function: src\lib\hvacCalculations.ts::getAirflowPerPerson
  function: src\lib\hvacCalculations.ts::getAirflowPerArea
  function: src\lib\hvacCalculations.ts::getClimateDeltaT
  function: src\lib\hvacCalculations.ts::calculateHRV
  function: src\lib\hvacCalculations.ts::getRequiredACH
  function: src\lib\hvacCalculations.ts::calculateJetFan

---

## DISA AKTARILANLAR (EXPORTS)
  export: AirCurtainApplication
  export: BuildingType
  export: ClimateZone
  export: DuctMaterial
  export: DuctType
  export: HRVInput
  export: HRVResult
  export: JetFanApplication
  export: JetFanApplicationType
  export: JetFanInput
  export: JetFanMode
  export: JetFanResult
  export: RecoveryType
  export: TrafficIntensity
  export: WindCondition
  export: calculateAirCurtain
  export: calculateArea
  export: calculateDuct
  export: calculateEquivalentDiameter
  export: calculateHRV
  export: calculateJetFan
  export: calculatePressureLoss
  export: evaluateVelocity
  export: getAdjustmentFactor
  export: getAirflowPerArea
  export: getAirflowPerPerson
  export: getClimateDeltaT
  export: getNozzleVelocityRange
  export: getRequiredACH
  export: getRoughness
  export: getTargetFloorVelocity
  export: suggestDimensions