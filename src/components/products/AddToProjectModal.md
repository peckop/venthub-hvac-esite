---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx
skeleton_hash: 587dc4c4140069f6
entity_hashes:
  func:AddToProjectModal: 27f66ff6372a1fa9
  overview: 4e046c22462f1ac6
  style_tokens: 49ec4d1f3ff40796
generated_at: 2026-05-28T22:36:49Z
---

## Genel Bakış
AddToProjectModal, bir ürünün projeye eklenmesi için açılan modal penceresini oluşturur. Kullanıcıya ürün detaylarını gösterir, ekleme işlemi için gerekli alanları sunar ve kapanış olayını yönetir.

## Fonksiyon Grupları
### Modal Yönetimi
Bu grup, modalın açılıp kapanmasını kontrol eder ve kullanıcı etkileşimini yönetir.
- AddToProjectModal

### Ürün Bilgisi Gösterimi
Bu grup, modal içinde gösterilecek ürünün özelliklerini alır ve görsel olarak sunar.
- AddToProjectModal (içerisinde ürün bilgileri render edilir)

### Eylem İşlemleri
Bu grup, kullanıcı tarafından tetiklenen eylemleri (örneğin “Ekle” butonuna basma) işler ve gerekli yan etkileri (örneğin proje listesine ekleme) gerçekleştirir.
- AddToProjectModal (içerisinde ekleme işlemi ve onClose çağrısı yapılır)

---

## AXIOMS – Mimari Varsayımlar
Bu modül, AddToProjectModal bileşeninin doğru çalışması için kendisine iletilen prop'ların geçerli tiplerde ve uygun koşullarda olmasını varsayar.

[Aksiyom 1]: Eğer `isOpen` prop'u geçerli bir boolean (true/false) değilse, modal'ın açılıp kapanma durumu kontrol edilemez, beklenmedik davranışlar (sürekli açık/kapalı kalma) olur.
[Aksiyom 2]: Eğer `onClose` prop'u çağrılabilir bir fonksiyon değilse, modal'ın kapatma işlemi başarısız olur, çalışma zamanı hatası fırlatılabilir veya modal kapanamaz.
[Aksiyom 3]: Eğer `product` prop'u geçerli bir nesne değilse (undefined, null veya geçersiz tip), ürün bilgileri modal'da gösterilemez ve projeye ekleme işlemi başarısız olur.

---

## FONKSİYON DETAYLARI

### AddToProjectModal
**Ne yapar**: `AddToProjectModal` bir React fonksiyonel bileşeni olarak tanımlanmıştır ve bir ürünün projeye eklenmesi sürecini kullanıcı arayüzünde bir modal (açılır pencere) aracılığıyla yönetir. Bileşen, modalın açık/kapalı durumunu kontrol eder ve kapanma eylemini dışarıdan bir geri çağırma fonksiyonuyla bildirir.  

**Nasıl yapar**: Fonksiyon, `product`, `isOpen` ve `onClose` adlı üç prop alır; `isOpen` değeri true olduğunda modalı render eder, `onClose` fonksiyonu kullanıcı modalı kapattığında tetiklenir. İçerik ve etkileşim mantığı, `AddToProjectModalProps` tipine uygun olarak yapılandırılmıştır.  

**Parametreler**:
- `product`: unknown — modal içinde gösterilecek ürün nesnesi.
- `isOpen`: unknown — modalın görünür olup olmadığını belirten boolean benzeri değer.
- `onClose`: unknown — modal kapatıldığında çalıştırılacak geri çağırma fonksiyonu.  

**Dönüş**: `React.FC<AddToProjectModalProps>` — `AddToProjectModalProps` tipinde prop alan bir React fonksiyonel bileşeni.

---

## INTERFACES

### AddToProjectModalProps
- `product: Product`
- `isOpen: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/AddToProjectModal.tsx::AddToProjectModal
- **params**: `{ product, isOpen, onClose }`
- **ic_degiskenler**:
  - `t` — `useI18n()` hookinden gelen çeviri fonksiyonu, UI metinlerini yerelleştirmek için kullanılır.
  - `projects` — `useProjectLists()` hookundan gelen mevcut proje listesi, ekranda gösterilir.
  - `addProject` — `useProjectLists()` hookundan gelen fonksiyon, yeni bir proje oluşturmak için çağrılır.
  - `addItemToProject` — `useProjectLists()` hookundan gelen fonksiyon, bir ürünün belirli bir projeye eklenmesini sağlar.
  - `newProjectName` — `useState('')` ile tanımlanan durum, yeni oluşturulacak projenin adını tutar.
  - `setNewProjectName` — `newProjectName` durumunu güncelleyen set fonksiyonu.
  - `isCreating` — `useState(false)` ile tanımlanan durum, “Yeni Proje Oluştur” formunun gösterilip gösterilmeyeceğini belirler.
  - `setIsCreating` — `isCreating` durumunu güncelleyen set fonksiyonu.
  - `selectedProjectId` — `useState<string | null>(null)` ile tanımlanan durum, listeden seçilen proje kimliğini saklar.
  - `setSelectedProjectId` — `selectedProjectId` durumunu güncelleyen set fonksiyonu.
  - `isAdding` — `useState(false)` ile tanımlanan durum, bir ekleme/oluşturma işlemi devam ederken UI’da loading göstergesi ve buton kilitlemesi için kullanılır.
  - `setIsAdding` — `isAdding` durumunu güncelleyen set fonksiyonu.
  - `handleCreateAndAdd` — async iç fonksiyon; yeni proje oluşturur, ürünü o projeye ekler ve modalı kapatır.
  - `handleAddToExisting` — async iç fonksiyon; seçilen mevcut projeye ürünü ekler ve modalı kapatır.
- **Dönüş**: React element (JSX) – modal UI’sı; `isOpen` false ise `null` döner, aksi takdirde modal içeriği render edilir.

### [N2_NASIL] AST Pointer: src/components/products/AddToProjectModal.tsx::handleCreateAndAdd
- **params**: `()`
- **ic_degiskenler**:
  - `newProjectName` — dış scope’dan gelen durum, yeni projenin adını tutar; boş ise işlem iptal edilir.
  - `setIsAdding` — dış scope’dan gelen set fonksiyonu, işlem süresince loading durumunu aktif eder.
  - `addProject` — dış scope’dan gelen API fonksiyonu, yeni proje oluşturur ve `project` nesnesi döner.
  - `project` — `addProject` çağrısının sonucu, yeni oluşturulan projenin `id` alanını içerir.
  - `addItemToProject` — dış scope’dan gelen API fonksiyonu, ürün (`product.id`) yeni projeye eklenir.
  - `product.id` — dış scope’dan gelen `product` nesnesinin kimliği, ekleme işlemi için gereklidir.
  - `onClose` — dış scope’dan gelen callback, modalı kapatır.
  - `error` — `catch` bloğunda yakalanan hata nesnesi, konsola loglanır.
- **Dönüş**: `void` – yan etkileri: proje oluşturma, ürün ekleme, modal kapama ve UI loading durumunu yönetme.

### [N3_NASIL] AST Pointer: src/components/products/AddToProjectModal.tsx::handleAddToExisting
- **params**: `(projectId: string)`
- **ic_degiskenler**:
  - `projectId` — fonksiyona parametre olarak gelen mevcut projenin kimliği.
  - `setSelectedProjectId` — dış scope’dan gelen set fonksiyonu, seçili proje kimliğini günceller.
  - `setIsAdding` — dış scope’dan gelen set fonksiyonu, işlem süresince loading durumunu aktif eder.
  - `addItemToProject` — dış scope’dan gelen API fonksiyonu, `product.id` ile belirtilen ürünü `projectId`’ye ekler.
  - `product.id` — dış scope’dan gelen `product` nesnesinin kimliği.
  - `onClose` — dış scope’dan gelen callback, modalı kapatır.
  - `error` — `catch` bloğunda yakalanan hata nesnesi, konsola loglanır.
- **Dönüş**: `void` – yan etkileri: ürünün mevcut projeye eklenmesi, modalın kapanması ve UI loading durumunun yönetilmesi.

---

## NODE ID STANDARD

  file: src\components\products\AddToProjectModal.tsx
  function: src\components\products\AddToProjectModal.tsx::AddToProjectModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToProjectModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-light-gray`, `bg-light-gray/30`, `bg-primary-navy`, `bg-slate-900/60`, `bg-white`, `border-b`, `border-dashed`, `border-light-gray`, `border-none`, `focus-visible:border-primary-navy`, `group-hover:text-primary-navy`, `hover:bg-air-blue`, `hover:bg-secondary-blue`, `hover:bg-white/10`, `hover:border-primary-navy`
- **Layout:** `absolute`, `backdrop-blur-sm`, `fixed`, `flex`, `flex-shrink-0`, `h-16`, `h-full`, `items-center`, `items-start`, `justify-between`, `justify-center`, `line-clamp-2`, `max-h-48`, `max-w-md`, `overflow-hidden`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `-translate-y-1/2`, `animate-spin`, `border`, `cursor-default`, `disabled:opacity-50`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/10`, `font-bold`, `font-medium`, `font-semibold`, `group`, `group-hover:translate-x-0.5`, `inset-0`, `italic`, `leading-relaxed`