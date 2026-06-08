---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx
skeleton_hash: b523d4075dbe1bad
entity_hashes:
  func:AddToProjectModal: 27f66ff6372a1fa9
  overview: 4ec0a41f38191057
  style_tokens: 49ec4d1f3ff40796
generated_at: 2026-06-08T10:09:31Z
---

## Genel Bakış
Bu modül, bir ürünün projeye eklenmesi için kullanılan modal (açılır pencere) bileşenini tanımlar. Ürün bilgilerini görüntüler ve projeye ekleme işlemini başlatan kullanıcı arayüzünü yönetir.

## Fonksiyon Grupları
### Modal Bileşeni
Bu grup, açılır pencerenin temel yapısını, durumunu ve görünümünü oluşturarak kullanıcı arayüzünü yönetir.
- AddToProjectModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından çıkarılabilecek temel aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `product` parametresi sağlanmazsa, modal içinde ürün bilgisi gösterilemez ve projeye ekleme eylemi eksik çalışır.

[Aksiyom 2]: Eğer `isOpen` parametresi `false` ise, modal görünmez ve kullanıcı arayüzü modalı göstermez.

[Aksiyom 3]: Eğer `onClose` callback fonksiyonu sağlanmazsa, modal kapatılamaz ve kullanıcı pencereyi kapatamaz.

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

### [N1_NASIL] AST Pointer: AddToProjectModal.tsx::AddToProjectModal
- **params**: `{ product, isOpen, onClose }` — `product` eklenecek ürün nesnesi (Product tipinde), `isOpen` modalın açık/kapalı durumu (boolean), `onClose` modalı kapatma callback fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu, `t('common.addToProject')` gibi çağrılarla lokalize metin üretir
  - `projects` — `useProjectLists()` hook'undan gelen mevcut projeler dizisi, kullanıcının projelerini listeler
  - `addProject` — `useProjectLists()` hook'undan gelen fonksiyon, yeni proje oluşturmak için `addProject(newProjectName)` çağrılır
  - `addItemToProject` — `useProjectLists()` hook'undan gelen fonksiyon, bir projeye ürün eklemek için `addItemToProject(projectId, productId)` çağrılır
  - `newProjectName` — useState ile yönetilen string, yeni proje adı input değerini tutar
  - `setNewProjectName` — useState setter, yeni proje adını günceller
  - `isCreating` — useState ile yönetilen boolean, yeni proje oluşturma formunun açık/kapalı durumunu kontrol eder
  - `setIsCreating` — useState setter, oluşturma formunun görünürlüğünü toggler
  - `selectedProjectId` — useState ile yönetilen `string | null`, hangi projeye ekleme yapıldığını takip eder (spinner gösterimi için)
  - `setSelectedProjectId` — useState setter, seçili proje ID'sini günceller
  - `isAdding` — useState ile yönetilen boolean, ekleme işlemi sırasında loading durumunu yönetir
  - `setIsAdding` — useState setter, loading durumunu toggler
  - `handleCreateAndAdd` — async fonksiyon referansı, yeni proje oluşturup ürünü ekler
  - `handleAddToExisting` — async fonksiyon referansı, mevcut projeye ürün ekler
- **Dönüş**: JSX.Element (modal JSX'i) veya `null` (`!isOpen` durumunda)

### [N2_NASIL] AST Pointer: AddToProjectModal.tsx::handleCreateAndAdd
- **params**: yok
- **ic_degiskenler**:
  - `newProjectName` — useState string, oluşturulacak yeni projenin adı; `.trim()` ile boşluk kontrolü yapılır
  - `isAdding` — boolean, `setIsAdding(true)` ile loading başlatılır, `finally` bloğunda `false` yapılır
  - `setIsAdding` — setter, loading durumunu yönetir
  - `addProject` — hook fonksiyonu, `addProject(newProjectName)` ile yeni proje oluşturur, dönen nesnede `project.id` alanı kullanılır
  - `project` — `await addProject(newProjectName)` sonucu dönen proje nesnesi, `.id` alanı ile `addItemToProject`'e geçilir
  - `addItemToProject` — hook fonksiyonu, `addItemToProject(project.id, product.id)` ile ürünü projeye ekler
  - `product` — props'tan gelen Product nesnesi, `.id` alanı ile `addItemToProject`'e geçilir
  - `onClose` — props callback, başarılı ekleme sonrası modalı kapatır
  - `error` — catch bloğu ile yakalanan hata nesnesi, `console.error(error)` ile loglanır
- **Dönüş**: yok (void async)

### [N3_NASIL] AST Pointer: AddToProjectModal.tsx::handleAddToExisting
- **params**: `(projectId: string)` — ürünün eklenecek mevcut projenin ID'si
- **ic_degiskenler**:
  - `projectId` — parametre, hedef projenin string ID'si
  - `setSelectedProjectId` — setter, `setSelectedProjectId(projectId)` ile hangi projede loading olduğunu belirtir
  - `isAdding` — boolean, `setIsAdding(true)` ile loading başlatılır, `finally` bloğunda `false` yapılır
  - `setIsAdding` — setter, loading durumunu yönetir
  - `addItemToProject` — hook fonksiyonu, `addItemToProject(projectId, product.id)` ile ürünü projeye ekler
  - `product` — props'tan gelen Product nesnesi, `.id` alanı ile `addItemToProject`'e geçilir
  - `onClose` — props callback, başarılı ekleme sonrası modalı kapatır
  - `error` — catch bloğu ile yakalanan hata nesnesi, `console.error(error)` ile loglanır
- **Dönüş**: yok (void async)

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