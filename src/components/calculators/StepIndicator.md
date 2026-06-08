---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\calculators\StepIndicator.tsx
skeleton_hash: a5a084e8cd54b648
entity_hashes:
  func:StepIndicator: 203f6e11e7ae2ca6
  overview: 4bdcabdf1533e7e3
  style_tokens: a71e92d8d5570ada
generated_at: 2026-06-08T10:08:47Z
---

## Genel Bakış
`StepIndicator`, çok adımlı bir işlem akışında kullanıcının hangi adımda olduğunu görsel olarak gösterir ve adımlara tıklama ile geçiş yapmasını sağlayan bir React bileşenidir. Gelen `steps` dizisi, `currentStep` ve `onStepClick` callback’i ile dinamik ve etkileşimli bir adım göstergesi sunar.

## Fonksiyon Grupları
### Görsel Oluşturma ve Render
Bu grup, `steps` listesini alarak her adım için daire, etiket ve bağlantı çizgileri gibi UI elemanlarını oluşturur; `currentStep` değerine göre aktif, tamamlanmış ve bekleyen adımları farklı stillerle ayırarak kullanıcıya mevcut ilerlemeyi net bir şekilde gösterir.
- StepIndicator

### Etkileşim ve Durum Yönetimi
Kullanıcı bir adıma tıkladığında `onStepClick` callback’ini tetikleyerek dışarıdaki mantığın (örnek: sayfa yönlendirme, adım güncelleme) çalışmasını sağlar; bu sayede bileşen sadece görüntüleme yapmaz, aynı zamanda navigasyonu da yönetir.
- StepIndicator (callback çağrısı)

---

## AXIOMS – Mimari Varsayımlar
StepIndicator bileşeni, steps, currentStep ve onStepClick prop'larının belirli koşulları sağladığı sürece beklendiği şekilde çalışır.

[Aksiyom 1]: Eğer steps prop'u tanımlı değilse veya boş bir dizi ise, bileşen hiçbir adım öğesi render etmez ve görsel çıktı boş olur.  
[Aksiyom 2]: Eğer currentStep prop'u bir sayı değilse veya steps dizisinin geçerli indeks aralığı (0 ≤ currentStep < steps.length) dışındaysa, aktif adım gösterimi hatalı olur ve UI tutarsızlığı ortaya çıkar.  
[Aksiyom 3]: Eğer onStepClick prop'u bir fonksiyon değilse, bir adıma tıklandığında çalışma zamanı hatası (örneğin "onStepClick is not a function") oluşur ve etkileşim kesilir.

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
- **params**: steps, currentStep, onStepClick
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/calculators/StepIndicator.tsx::(anonymous map callback)
- **params**: step, index
- **ic_degiskenler**: 
  - `isCompleted` — step.id < currentStep koşulunu sağlayıp sağlamadığını gösteren boolean (adım tamamlandı mı)
  - `isActive` — step.id === currentStep koşulunu sağlayıp sağlamadığını gösteren boolean (şu anda aktif adım)
  - `isClickable` — onStepClick fonksiyonunun varlığı ve step.id ≤ currentStep koşulunu sağlayıp sağlamadığını gösteren boolean (adım tıklanabilir mi)
- **Dönüş**: JSX.Element

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