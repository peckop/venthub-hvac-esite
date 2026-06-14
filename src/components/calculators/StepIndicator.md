---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\StepIndicator.tsx
skeleton_hash: 36265045b33ab050
entity_hashes:
  func:StepIndicator: 203f6e11e7ae2ca6
  overview: a00e439886770189
  style_tokens: a71e92d8d5570ada
generated_at: 2026-06-14T19:44:11Z
---

## Genel Bakış
`StepIndicator`, çok adımlı işlem akışlarında kullanıcının mevcut konumunu görsel olarak takip etmesini sağlayan bir React bileşenidir. Adım listesini, aktif adımı ve tıklama callback'ini alarak interaktif bir navigasyon arayüzü sunar. Hesaplayıcı (calculator) modüllerinde adım bazlı formlarda kullanıcı deneyimini iyileştirmek için kullanılır.

## Fonksiyon Grupları
### Görsel Adım Gösterimi
Adım dizisini alarak her bir adım için daire, etiket ve bağlantı çizgileri oluşturur; aktif, tamamlanmış ve bekleyen adımları farklı görsel stillerle ayrıştırarak ilerleme durumunu net biçimde sunar.
- StepIndicator

### Etkileşim Yönetimi
Kullanıcı bir adıma tıkladığında dışarıdan gelen callback fonksiyonunu tetikleyerek adım geçiş mantığını üst katmana aktarır; bileşen kendi durumunu yönetmez, sadece etkileşim olaylarını iletir.
- StepIndicator (onStepClick çağrısı)

---

## AXIOMS – Mimari Varsayımlar

**[Aksiyom 1]:** `steps` prop'u boş veya tanımsız ise bileşen hiçbir şey render etmez, çıkış boş kalır.

**[Aksiyom 2]:** `currentStep` geçerli indeks aralığı (0 ≤ currentStep < steps.length) dışındaysa aktif adım gösterimi tutarsız olur.

**[Aksiyom 3]:** `onStepClick` bir fonksiyon olarak sağlanması zorunludur; aksi halde tıklama işleminde çalışma zamanı hatası oluşur.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (implementasyon) verilmemiştir; sadece fonksiyon imzası mevcuttur. Dolayısıyla doğru çalışması için gerekli mimari varsayımlar çıkarılamamaktadır.

**Mevcut bilgiler (sadece imzadan):**
- Fonksiyon `steps`, `currentStep` ve `onStepClick` parametreleri alır.
- `React.FC<StepIndicatorProps>` tipinde bir bileşen döner.

**Bilinmeyenler (imzadan belirlenemeyen):**
- `steps` dizisinin beklenen iç yapısı ve minimum eleman sayısı
- `currentStep` için geçerli aralık (örn. `0 <= currentStep < steps.length` koşulu olup olmadığı)
- `steps` boş diziyken davranışı
- `currentStep` negatif veya `steps.length`'e eşit/büyük olduğunda davranışı
- `onStepClick` callback'inin hangi argümanlarla çağrıldığı

Bu koşullar fonksiyon gövdesi incelendiğinde aksiyom olarak tanımlanabilir.

---

## FONKSİYON DETAYLARI

### StepIndicator
**Ne yapar**: Wizard veya çok adımlı formlarda kullanıcıya hangi adımda bulunduğunu, tamamlanan adımları ve gelecek adımları gösteren bir adım göstergesi bileşeni render eder.  
**Nasıl yapar**: `steps` dizisini iterate ederek her adım için bir öğe oluşturur; `currentStep` değeri ile aktif adımı belirleyerek stil ve sınıf uygular, tamamlanan adımlara farklı bir görünüm verir. Kullanıcı bir adım üzerine tıkladığında `onStepClick` fonksiyonu çağrılır ve tıklanan adımın indeksi iletilir.  
**Parametreler**:  
- steps: Step[] — Gösterilecek adımların listesi; her öğe genellikle `label` ve isteğe bağlı `status` gibi alanları içerir.  
- currentStep: number — Şu anda aktif olan adımın sıfır tabanlı indeksi.  
- onStepClick: (index: number) => void — Bir adım tıklandığında çağrılan geri çağırım fonksiyonu; tıklanan adımın indeksi parametre olarak geçirilir.  
**Dönüş**: React.FC<StepIndicatorProps> — Bileşenin kendisi; adım göstergesini DOM’a ekleyen bir fonksiyonel React bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::Check
- import: react::React

---

## INTERFACES

### Step
- `id: number`
- `label: string`
- `description?: string`

### StepIndicatorProps
- `steps: Step[]`
- `currentStep: number`
- `onStepClick?: (stepId: number) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/calculators/StepIndicator.tsx::StepIndicator
- **params**: (`steps`, `currentStep`, `onStepClick`)
  - `steps` — adım nesneleri dizisi; her eleman `id`, `label`, `description` alanlarına sahiptir
  - `currentStep` — mevcut aktif adımın id'si (sayısal)
  - `onStepClick` — tıklanabilir adımlarda çağrılan geri çağırma fonksiyonu; opsiyonel
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan elde edilen çeviri fonksiyonu; mobil görünümde `calculators.stepIndicator.progress` anahtarıyla ilerleme metni üretir (`current` ve `total` parametreleri ile)
- **Dönüş**: JSX — masaüstü için adım daireleri + birleştirici çizgilerden oluşan yatay navigasyon; mobil için ilerleme çubuğu ve mevcut adım etiketi

### [N2_NASIL] AST Pointer: src/components/calculators/StepIndicator.tsx::(step, index) map callback
- **params**: (`step`, `index`)
  - `step` — `steps` dizisindeki tek bir adım nesnesi; `id`, `label`, `description` alanlarına sahiptir
  - `index` — elemanın dizideki konumu; `steps.length - 1` ile karşılaştırılarak son adımda birleştirici çizginin gizlenmesi sağlanır
- **ic_degiskenler**:
  - `isCompleted` — `step.id < currentStep` — adımın tamamlanıp tamamlanmadığını belirler; tamamlandıysa `bg-success-green text-white` stili ve `<Check size={18} />` ikonu gösterilir
  - `isActive` — `step.id === currentStep` — adımın aktif olup olmadığını belirler; aktifse `bg-primary-navy text-white ring-4 ring-primary-navy/20` stili uygulanır
  - `isClickable` — `onStepClick && step.id <= currentStep` — adımın tıklanabilir olup olmadığını belirler; tıklanabilirse `cursor-pointer` ve `hover:scale-110` efektleri aktif olur; `onClick` handler'ı `onStepClick(step.id)` çağrısı ile tetiklenir
- **Dönüş**: JSX — `<React.Fragment key={step.id}>` içinde adım daire butonu ve (son adım değilse) `width: isCompleted ? '100%' : '0%'` koşullu animasyonlu birleştirici çizgi

---

## NODE ID STANDARD

  file: src\components\calculators\StepIndicator.tsx
  function: src\components\calculators\StepIndicator.tsx::StepIndicator

---

## DISA AKTARILANLAR (EXPORTS)
  export: StepIndicator

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-200`, `bg-primary-navy`, `bg-success-green`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-steel-gray/70`, `text-white`, `text-xs`
- **Layout:** `absolute`, `flex`, `flex-1`, `flex-col`, `h-0.5`, `h-10`, `h-2`, `h-full`, `hidden`, `items-center`, `justify-between`, `justify-center`, `left-0`, `lg:block`, `md:flex`
- **Varyant/Responsive:** `:`, `hover:`, `lg:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${isActive`, `${isClickable`, `${isCompleted`, `:`, `cursor-default`, `cursor-pointer`, `duration-300`, `duration-500`, `font-medium`, `font-semibold`, `group`, `hover:scale-110`, `inset-y-0`, `isActive`, `mb-2`