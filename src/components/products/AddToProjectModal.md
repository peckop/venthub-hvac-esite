---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\AddToProjectModal.tsx
skeleton_hash: b11da9deda146340
entity_hashes:
  func:AddToProjectModal: 27f66ff6372a1fa9
  overview: 4748a8891c472352
  style_tokens: 49ec4d1f3ff40796
generated_at: 2026-08-27T07:28:39Z
---

## Genel Bakış
Bu modül, bir ürünün projeye eklenmesi sürecini yöneten bir modal (açılır pencere) bileşeni tanımlar. Ürün bilgilerini görüntüler ve kullanıcıya projeye ekleme işlemini başlatma arayüzü sunar. Bileşen, modalın açık/kapalı durumunu dışarıdan kontrol eder ve kapanma eylemini bir geri çağırma fonksiyonuyla bildirir.

## Fonksiyon Grupları
### Modal Bileşeni
Bu grup, ürünün projeye eklenmesi için kullanılan modal arayüzünün temel yapısını, durum yönetimini ve görünümünü oluşturur. Ürün bilgisi sağlanmadığında modal içinde ürün gösterilemez; `isOpen` değeri false olduğunda modal görünmez; `onClose` sağlanmadığında kullanıcı modalı kapatamaz.
- AddToProjectModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından çıkarılabilecek temel aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `product` parametresi sağlanmazsa, modal içinde ürün bilgisi gösterilemez ve projeye ekleme eylemi eksik çalışır.

[Aksiyom 2]: Eğer `isOpen` parametresi sağlanmazsa, modal'ın açık mı kapalı mı olduğu belirlenemez ve bileşen doğru şekilde render edilemez.

[Aksiyom 3]: Eğer `onClose` parametresi sağlanmazsa, kullanıcı modal'ı kapatamaz ve bileşen kapanış işlemini gerçekleştiremez.

[Aksiyom 4]: Fonksiyon gövdesi verilmediğinden, modal'ın projeye ekleme işlemini nasıl başlattığı, hangi API çağrısını yaptığı veya hata durumlarını nasıl yönettiği bilinmiyor.

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

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useProjectLists::useProjectLists
- import: @/components/ui/VentImage::VentImage
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/types/ui-models::type { Product }
- import: framer-motion::motion
- import: lucide-react::ChevronRight
- import: lucide-react::FolderPlus
- import: lucide-react::Loader2
- import: lucide-react::Plus
- import: lucide-react::X
- import: react::React
- import: react::useState

---

## INTERFACES

### AddToProjectModalProps
- `product: Product`
- `isOpen: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AddToProjectModal.tsx::AddToProjectModal
- **params**: `{ product, isOpen, onClose }`
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; modal başlığı, buton etiketleri, yer tutucu metinler ve ipucu metni için kullanılır
  - `projects` — `useProjectLists()` hook'undan dönen mevcut projeler dizisi; mevcut projeler listesinde `.map()` ile dönülür, `.length` ile boş olup olmadığı kontrol edilir
  - `addProject` — `useProjectLists()` hook'undan dönen async fonksiyon; `handleCreateAndAdd` içinde yeni proje oluşturmak için `await addProject(newProjectName)` şeklinde çağrılır
  - `addItemToProject` — `useProjectLists()` hook'undan dönen async fonksiyon; hem `handleCreateAndAdd` hem `handleAddToExisting` içinde projeye ürün eklemek için `await addItemToProject(projectId, product.id)` şeklinde çağrılır
  - `newProjectName` — `useState('')` ile tanımlanan string state; yeni proje adı giriş alanının değerini tutar, `handleCreateAndAdd` içinde `trim()` ile boşluk kontrolü yapılır
  - `setNewProjectName` — `newProjectName` state'ini güncelleyen setter fonksiyonu; input onChange olayında `e.target.value` ile çağrılır
  - `isCreating` — `useState(false)` ile tanımlanan boolean state; yeni proje oluşturma formunun görünürlüğünü kontrol eder, `false` iken "Yeni proje oluştur" butonu, `true` iken input alanı gösterilir
  - `setIsCreating` — `isCreating` state'ini güncelleyen setter fonksiyonu; "Yeni proje oluştur" butonuna tıklanınca `true`, "İptal" butonuna tıklanınca `false` yapılır
  - `selectedProjectId` — `useState<string | null>(null)` ile tanımlanan state; mevcut projeler listesinde hangi projenin ekleme işleminde olduğunu belirtir, `handleAddToExisting` içinde `projectId` ile güncellenir
  - `setSelectedProjectId` — `selectedProjectId` state'ini güncelleyen setter fonksiyonu; `handleAddToExisting` fonksiyonunun başında çağrılır
  - `isAdding` — `useState(false)` ile tanımlanan boolean state; ekleme işleminin devam edip etmediğini belirtir, butonların `disabled` durumunu ve yükleme göstergesini kontrol eder
  - `setIsAdding` — `isAdding` state'ini güncelleyen setter fonksiyonu; `handleCreateAndAdd` ve `handleAddToExisting` içinde try bloğu başında `true`, finally bloğunda `false` yapılır
  - `handleCreateAndAdd` — yeni proje oluşturup ürünü ekleyen async fonksiyon; `newProjectName.trim()` boşsa erken dönüş yapar, `addProject` ile proje oluşturur, `addItemToProject` ile ürünü ekler, başarılı olursa `onClose()` çağrılır
  - `handleAddToExisting` — mevcut projeye ürün ekleyen async fonksiyon; parametre olarak `projectId` alır, `addItemToProject` ile ürünü ekler, başarılı olursa `onClose()` çağrılır
- **Dönüş**: JSX elementi — `isOpen` `false` ise `null` döner, aksi halde modal bileşenini render eder

### [N2_NASIL] AST Pointer: AddToProjectModal.tsx::handleCreateAndAdd
- **params**: yok
- **ic_degiskenler**:
  - `project` — `await addProject(newProjectName)` sonucu dönen proje nesnesi; `.id` özelliği `addItemToProject(project.id, product.id)` çağrısında kullanılır
  - `error` — `catch` bloğunda yakalanan hata nesnesi; `console.error(error)` ile konsola yazdırılır
- **Dönüş**: yok (async void) — yan etki olarak proje oluşturur, ürünü ekler ve `onClose()` çağrısıyla modalı kapatır

### [N3_NASIL] AST Pointer: AddToProjectModal.tsx::handleAddToExisting
- **params**: `projectId: string`
- **ic_degiskenler**:
  - `error` — `catch` bloğunda yakalanan hata nesnesi; `console.error(error)` ile konsola yazdırılır
- **Dönüş**: yok (async void) — yan etki olarak ürünü mevcut projeye ekler ve `onClose()` çağrısıyla modalı kapatır

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