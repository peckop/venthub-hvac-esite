---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\account\ProjectsPage.tsx
skeleton_hash: 4029fddd59109e66
entity_hashes:
  func:ProjectsPage: 4879134b2ae3f1b7
  overview: 7dd57233313041ca
  style_tokens: 0d0814a920eb2bc8
generated_at: 2026-08-16T11:31:09Z
---

## Genel Bakış
Bu modül, kullanıcının hesabına ait projeleri listeli olarak görüntülediği ana sayfa bileşenidir. Kullanıcının projelerini sunar, filtreleme ve sıralama gibi temel listeleme özelliklerini sağlar.

## Fonksiyon Grupları
### Ana Sayfa Bileşeni
Kullanıcının proje listesini yükleyen ve ekranda sunan temel React bileşenini barındırır.
- ProjectsPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### ProjectsPage

**Ne yapar**: Kullanıcının proje listelerini görüntülemesini, yeni projeler oluşturmasını, mevcut projelerin detaylarını (ürünleri) açmasını/kapatmasını, projelerden ürün kaldırmasını ve projeleri tamamen silmesini sağlayan React fonksiyonel bileşenidir. Ürün detay sayfasındaki "Projeye Ekle" modalının hesap tarafındaki karşılığı olarak work eder; verileri `ProjectProvider` (Context SSOT'u `ProjectContext.tsx`) üzerinden alır.

**Nasıl yapar**:
- `useI18n()` hook'u ile çoklu dil desteği (çeviri fonksiyonu `t`) sağlar.
- `useLocalizedRoutes()` hook'u ile yerelleştirilmiş rota oluşturma fonksiyonlarını (`Routes.product()`) elde eder.
- `useProjectLists()` hook'u ile proje listesi verilerini (`projects`, `loading`) ve proje yönetim fonksiyonlarını (`addProject`, `removeProject`, `removeItemFromProject`, `getProjectItems`) context'ten çeker.
- `useState` hook'ları ile form girdisi (`newName`), oluşturma durumu (`creating`), açık proje ID'si (`openId`), yüklenmiş öğeler (`items`) ve öğe yükleme durumu (`itemsLoading`) gibi yerel durumları yönetir.
- JSX'te koşullu render mantığı uygular: yükleme durumunda spinner, boş listede boş durum kartı, dolu listede katlanabilir proje kartları ve her kartın altında mởıldığında ürün listesi gösterilir.
- `VentImage`, `Link`, `Loader2`, `FolderKanban`, `ChevronDown`, `ChevronRight`, `Plus`, `Trash2` gibi bileşenleri kullanarak arayüzü oluşturur.

**Parametreler**:
- Bu fonksiyon parametre almaz. React bileşeni olarak props'suz çalışır; tüm bağımlılıklarını React hook'ları üzerinden (context, state) elde eder.

**Dönüş**: `JSX.Element` — Proje yönetim arayüzünü oluşturan React JSX yapısı döndürür. İçerik: başlık alanı, yeni proje oluşturma formu, yükleme göstergesi, boş durum kartı veya katlanabilir proje listesi.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../hooks/useProjectLists::useProjectLists
- import: @/components/ui/VentImage::VentImage
- import: @/i18n/I18nProvider::useI18n
- import: @/lib/images/productImage::resolveProductImageUrl
- import: @/types/ui-models::type { Product, ProjectItem }
- import: lucide-react::ChevronDown
- import: lucide-react::ChevronRight
- import: lucide-react::FolderKanban
- import: lucide-react::Loader2
- import: lucide-react::Plus
- import: lucide-react::Trash2
- import: next/link::Link
- import: react::React
- import: react::useState

---

## TYPE ALIASES

### LoadedItem
```typescript
type LoadedItem = ProjectItem & { product: Product }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::ProjectsPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan çeviri fonksiyonu
  - `Routes` — useLocalizedRoutes hook'undan lokalize rota oluşturucu
  - `projects` — useProjectLists hook'undan proje listesi
  - `loading` — useProjectLists hook'undan yükleme durumu
  - `addProject` — useProjectLists hook'undan proje ekleme fonksiyonu
  - `removeProject` — useProjectLists hook'undan proje silme fonksiyonu
  - `removeItemFromProject` — useProjectLists hook'undan projeden ürün silme fonksiyonu
  - `getProjectItems` — useProjectLists hook'undan proje ürünlerini yükleme fonksiyonu
  - `newName` — useState hook'undan yeni proje adı state'i
  - `setNewName` — newName state'ini güncelleyen setter fonksiyonu
  - `creating` — useState hook'undan proje oluşturma yüklenme durumu
  - `setCreating` — creating state'ini güncelleyen setter fonksiyonu
  - `openId` — useState hook'undan açık proje ID state'i
  - `setOpenId` — openId state'ini güncelleyen setter fonksiyonu
  - `items` — useState hook'undan proje ürünleri state'i (proje ID'lerine göre ürünler)
  - `setItems` — items state'ini güncelleyen setter fonksiyonu
  - `itemsLoading` — useState hook'undan proje ürünleri yükleme durumu
  - `setItemsLoading` — itemsLoading state'ini güncelleyen setter fonksiyonu
- **Dönüş**: JSX (React bileşeni)

### [N2_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::handleCreate
- **params**: `e: React.FormEvent`
- **ic_degiskenler**:
  - `e` — form submit olay nesnesi, preventDefault() ile varsayılan davranışı engellenir
- **Dönüş**: Promise<void> (async fonksiyon, doğrudan değer dönmez, yan etkilerle çalışır)

### [N3_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::toggleOpen
- **params**: `projectId: string`
- **ic_degiskenler**:
  - `projectId` — açılıp kapatılacak projenin ID'si
  - `loaded` — getProjectItems ile yüklenen proje ürünleri dizisi
- **Dönüş**: Promise<void> (async fonksiyon, state güncellemeleri yapar)

### [N4_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::handleRemoveItem
- **params**: `projectId: string`, `productId: string`
- **ic_degiskenler**:
  - `projectId` — ürünün kaldırılacağı projenin ID'si
  - `productId` — projeden kaldırılacak ürünün ID'si
- **Dönüş**: Promise<void> (async fonksiyon, state güncellemeleri yapar)

### [N5_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::handleDeleteProject
- **params**: `projectId: string`
- **ic_degiskenler**:
  - `projectId` — silinecek projenin ID'si
- **Dönüş**: Promise<void> (async fonksiyon, state güncellemeleri yapar)

### [N6_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::projects.map (arrow function)
- **params**: `p: ProjectItem`
- **ic_degiskenler**:
  - `p` — map döngüsündeki mevcut proje nesnesi
  - `isOpen` — bu projenin açık olup olmadığını gösteren boolean
  - `projectItems` — bu projenin ürünleri dizisi, items[p.id] değerinden alınır
- **Dönüş**: JSX (li elementi)

### [N7_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::projectItems.map (arrow function)
- **params**: `item: LoadedItem`
- **ic_degiskenler**:
  - `item` — map döngüsündeki mevcut ürün nesnesi
- **Dönüş**: JSX (li elementi)

---

## NODE ID STANDARD

  file: src\views\account\ProjectsPage.tsx
  function: src\views\account\ProjectsPage.tsx::ProjectsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProjectsPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-100`, `bg-slate-50`, `bg-slate-50/50`, `bg-white`, `border-slate-100`, `border-slate-200`, `border-slate-200/60`, `border-t`, `focus-visible:border-transparent`, `group-hover:text-primary-navy`, `hover:bg-secondary-blue`, `hover:border-red-300`, `hover:text-primary-navy`, `hover:text-red-500`
- **Layout:** `block`, `flex`, `flex-1`, `gap-2`, `gap-3`, `h-10`, `h-14`, `h-5`, `h-6`, `h-8`, `h-9`, `h-full`, `items-center`, `justify-center`, `min-w-0`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `group-hover:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-spin`, `border`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `group`, `italic`, `mb-1`, `mb-4`, `mb-6`