---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\category\NeedsAnalysisWizard.tsx
skeleton_hash: efd340c374ff7881
entity_hashes:
  func:NeedsAnalysisWizard: 21824b9940ba2474
  func:handleSelection: be5cfa5ce36fcdb3
  overview: 61691ddf4217f489
  style_tokens: 4b1fcd41d2094d58
generated_at: 2026-06-14T20:59:46Z
---

## Genel Bakış
NeedsAnalysisWizard, kullanıcıların ihtiyaç analizi sürecini interaktif bir şekilde tamamlamasını sağlayan bir React bileşenidir. Sihirbaz formatında adım adım ilerleyerek kullanıcının tercihlerini toplar ve `onFilterChange` geri çağrısı aracılığıyla üst bileşene aktarır.

## Fonksiyon Grupları
### Bileşen Tanımı
Sihirbazın yapısını, durum yönetimini ve render mantığını tanımlayan ana bileşen grubudur.
- NeedsAnalysisWizard

### Seçim İşleyici
Kullanıcı etkileşimlerini yakalayarak seçilen değerleri işleyen ve filtre değişikliklerini tetikleyen yardımcı fonksiyon grubudur.
- handleSelection

---

## AXIOMS – Mimari Varsayımlar

Bu modül, kullanıcı ihtiyaç analizi seçimlerini yöneten bir React bileşenidir ve üst bileşene seçim değişikliklerini iletmek için geri çağrım tabanlı bir mimari kullanır.

**[Aksiyom 1]**: Eğer `onFilterChange` callback'i bileşene sağlanmazsa, kullanıcı seçimleri üst bileşene iletilemez ve filtre değişiklikleri dinlenemez olur.

**[Aksiyom 2]**: Eğer `handleSelection` fonksiyonu `key` parametresi olarak string olmayan bir değer alırsa, filtre anahtarı tanımsız olacağından seçim işlenemez.

**[Aksiyom 3]**: Eğer `handleSelection` fonksiyonu `value` parametresi olarak `string` veya `number` dışındaki bir türde değer alırsa, filtre değeri beklenmeyen formatta olacağından üst bileşene geçersiz veri iletilir.

---

## FONKSİYON DETAYLARI

### NeedsAnalysisWizard
**Ne yapar**: Kullanıcının ihtiyaç analizi sürecini adım adım yönlendiren bir sihirbaz bileşeni render eder.  
**Nasıl yapar**: `onFilterChange` geri çağrısını prop olarak alır ve iç durumunu yöneterek her adımda kullanıcı girdilerini toplar; filtreden veya seçeneklerden bir değişiklik olduğunda bu geri çağrüyü tetikler.  
**Parametreler**:  
- onFilterChange: function — Kullanıcı tarafından yapılan filtremeler veya seçenek değişiklikleri olduğunda dışarıya bildirmek için çağrılan geri çağırım fonksiyonu  
**Dönüş**: `React.FC<NeedsAnalysisWizardProps>` türünde bir React fonksiyon bileşeni; JSX döndürerek arayüzü oluşturur.

### handleSelection
**Ne yapar**: Kullanıcının bir öğe seçtiğinde ilgili anahtar‑değer çiftini işleyerek bileşenin durumunu günceller.  
**Nasıl yapar**: `key` parametresi ile hangi alanın güncelleneceğini belirler, `value` parametresi ise seçilen değeri alır; ardından bu bilgiyi yerel state veya context üzerinden günceller ve gerekirse diğer işlemleri tetikler.  
**Parametreler**:  
- key: string — Güncellenecek state veya context alanının adı  
- value: string | number — Seçilen öğenin değeri; metin veya sayı olabilir  
**Dönüş**: Fonksiyon bir değer döndürmez; dönüş tipi `void` (veya `undefined`) olarak kabul edilir.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: lucide-react::Filter
- import: lucide-react::Ruler
- import: lucide-react::Settings
- import: lucide-react::ThermometerSun
- import: react::React
- import: react::useState

---

## INTERFACES

### NeedsAnalysisWizardProps
- `onFilterChange: (filters: { maxHeight?: number; heating?: string; type?: string }) => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/category/NeedsAnalysisWizard.tsx::NeedsAnalysisWizard
- **params**: `({ onFilterChange })` — filtreleme değişikliklerini üst bileşene ileten callback fonksiyonu
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, UI metinlerini çevirmek için kullanılır
  - `step` — wizard'ın mevcut adımını tutar (1, 2 veya 3)
  - `setStep` — step durumunu güncellemek için setter fonksiyonu
  - `selections` — kullanıcının seçimlerini tutan obje: maxHeight, heating, type alanlarını içerir
  - `setSelections` — selections durumunu güncellemek için setter fonksiyonu
  - `isOpen` — wizard'ın açık olup olmadığını tutan boolean flag
  - `setIsOpen` — isOpen durumunu güncellemek için setter fonksiyonu
  - `handleSelection` — inner function, seçim yapıldığında çağrılır
- **Dönüş**: JSX — iki farklı durum döner: isOpen=false ise başlangıç butonu, isOpen=true ise wizard içeriği

### [N2_NASIL] AST Pointer: src/components/category/NeedsAnalysisWizard.tsx::handleSelection
- **params**: `(key: string, value: string | number)` — hangi parametrenin seçildiğini ve değerini alır
- **ic_degiskenler**:
  - `valStr` — value parametresinin string versiyonu, selections objesine eklenmek için hazırlanır
  - `newSelections` — mevcut selections objesini kopyalayıp yeni değeri ekleyen güncellenmiş obje
- **Dönüş**: yok — sadece state güncellemeleri ve yan etkileri vardır (setSelections, setStep, onFilterChange, setIsOpen çağrıları)

---

## NODE ID STANDARD

  file: src\components\category\NeedsAnalysisWizard.tsx
  function: src\components\category\NeedsAnalysisWizard.tsx::NeedsAnalysisWizard
  function: src\components\category\NeedsAnalysisWizard.tsx::handleSelection

---

## DISA AKTARILANLAR (EXPORTS)
  export: NeedsAnalysisWizard

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-white`, `bg-white/20`, `border-2`, `border-primary-navy/10`, `from-primary-navy`, `hover:bg-blue-50`, `hover:bg-orange-50`, `hover:border-blue-500`, `hover:border-orange-500`, `hover:border-secondary-blue`, `hover:text-gray-600`, `text-blue-100`, `text-gray-400`, `text-gray-500`
- **Layout:** `flex`, `from-primary-navy`, `gap-3`, `grid`, `grid-cols-1`, `grid-cols-2`, `items-center`, `justify-between`, `md:grid-cols-2`, `md:grid-cols-3`, `md:grid-cols-4`, `md:w-auto`, `p-2`, `p-6`, `shadow-lg`
- **Varyant/Responsive:** `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `animate-fadeIn`, `border`, `focus-ring`, `font-bold`, `font-medium`, `hover:scale-105`, `mb-2`, `mb-6`, `ml-4`, `mt-6`, `px-3`, `px-4`, `px-6`, `py-1`, `py-3`