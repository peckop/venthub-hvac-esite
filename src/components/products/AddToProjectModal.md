---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\AddToProjectModal.tsx
skeleton_hash: d7b9006a963b7d28
entity_hashes:
  func:AddToProjectModal: 27f66ff6372a1fa9
  overview: 4cc7e676daf152dc
  style_tokens: 49ec4d1f3ff40796
generated_at: 2026-06-06T21:55:02Z
---

## Genel Bakış
Bu modül, bir ürünün projeye eklenmesi için kullanılan modal bileşenini tanımlar. Ürün bilgilerini görüntüler, ekleme işlemini başlatır ve pencerenin kontrolünü sağlar.

## Fonksiyon Grupları
### Modal Bileşeni
Bu grup, açılır pencerenin temel yapısını, durumunu ve görünümünü oluşturarak kullanıcı arayüzünü yönetir.
- AddToProjectModal

### Ürün Entegrasyonu
Bu grup, ilgili ürün verilerini modal içerisine entegre eder ve projeye ekleme eylemi için gerekli mantığı yürütür.
- AddToProjectModal

---

## AXIOMS – Mimari Varsayımlar

Bu modül için yalnızca fonksiyon imzasından çıkarılabilecek temel aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `product` parametresi sağlanmazsa veya geçerli bir ürün nesnesi içermiyorsa, modal içinde ürün bilgileri gösterilemez ve bileşen hata verebilir.

[Aksiyom 2]: Eğer `isOpen` parametresi `false` veya truthy bir değer olarak ayarlanmazsa, modal açılmaz ve kullanıcı eyleme geçemez.

[Aksiyom 3]: Eğer `onClose` callback fonksiyonu sağlanmazsa, modal kapatma eylemi (X butonu, backdrop tıklama) çalıştığında bileşen hata verebilir veya modal kapanamaz.

[Aksiyom 4]: Eğer `isOpen` `true` iken `onClose` çağrıldığında state güncellenmezse, modal kapanmaz ve açık kalır.

[Aksiyom 5]: Eğer `product` nesnesi gerekli alanları (örn: ürün adı, görsel, fiyat — değerler bilinmiyor) içermiyorsa, modal içinde eksik veya hatalı veri gösterimi oluşur.

---

**Not:** Fonksiyon gövdesi (React hook'ları, JSX yapısı, state yönetimi) paylaşılmadığından, bileşen içi state mantığına (örn: `useState`, `useEffect` kullanımı) ilişkin aksiyomlar **bilinmiyor** olarak değerlendirilmiştir.

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
- **params**: (`product: Product`, `isOpen: boolean`, `onClose: () => void`)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, UI metinleri için kullanılır
  - `projects` — useProjectLists hook'undan dönen mevcut projeler listesi
  - `addProject` — useProjectLists hook'undan dönen yeni proje oluşturma fonksiyonu
  - `addItemToProject` — useProjectLists hook'undan dönen projeye ürün ekleme fonksiyonu
  - `newProjectName` — useState ile oluşturulan string state, yeni proje adını tutar
  - `isCreating` — useState ile oluşturulan boolean state, yeni proje oluşturma modunun açık olup olmadığını belirtir
  - `selectedProjectId` — useState ile oluşturulan string|null state, seçilen projenin ID'sini tutar
  - `isAdding` — useState ile oluşturulan boolean state, ürün ekleme işleminin devam edip etmediğini belirtir
  - `handleCreateAndAdd` — yeni proje oluşturup ürünü ekleyen async fonksiyon
  - `handleAddToExisting` — mevcut projeye ürün ekleyen async fonksiyon
- **Dönüş**: JSX (React elemanı) veya null (isOpen false ise)

### [N2_NASIL] AST Pointer: src/components/products/AddToProjectModal.tsx::handleCreateAndAdd
- **params**: (yok)
- **ic_degiskenler**:
  - `project` — addProject fonksiyonunun promise'ından dönen newly created proje nesnesi
  - `error` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: Promise<void> (yan etkiler: yeni proje oluşturur, ürünü ekler, modalı kapatır)

### [N3_NASIL] AST Pointer: src/components/products/AddToProjectModal.tsx::handleAddToExisting
- **params**: (`projectId: string`)
- **ic_degiskenler**:
  - `error` — try-catch bloğunda yakalanan hata nesnesi
- **Dönüş**: Promise<void> (yan etkiler: ürünü seçili projeye ekler, modalı kapatır)

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