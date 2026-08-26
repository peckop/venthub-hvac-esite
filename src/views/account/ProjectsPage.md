---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\ProjectsPage.tsx
skeleton_hash: cf83fda963028b69
entity_hashes:
  func:ProjectsPage: 4879134b2ae3f1b7
  overview: 7dd57233313041ca
  style_tokens: 0d0814a920eb2bc8
generated_at: 2026-08-25T08:45:53Z
---

## Genel Bakış

Bu modül, kullanıcının hesap/account bölümünde yer alan projeler sayfasını oluşturan bir React bileşenidir. Tek bir bileşen fonksiyonundan oluşur ve `src/views/account` yapısı altında konumlanmıştır.

## Fonksiyon Grupları

### Sayfa Bileşeni
Kullanıcı hesabına ait projelerin görüntülendiği ana sayfa bileşenini tanımlar. Modülde yalnızca bu tek bileşen yer alır; alt bileşenler veya yardımcı fonksiyonlar bu dosya kapsamında tanımlanmamıştır.
- ProjectsPage

## Bağımlılıklar ve Mimari Notlar

- Modül hakkında dış bağımlılıklar, iç alt bileşenler veya lazy/dinamik yükleme bilgisi verilen kaynakta yer almamaktadır.
- Dosya uzantısı `.tsx` olduğundan, JSX tabanlı bir React bileşeni olduğu bilinmektedir; bunun dışında ek çıkarım yapılmamıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmediğinden, bu bileşenin doğru çalışması için hangi koşulların gerekli olduğu belirlenememektedir. Yalnızca `ProjectsPage()` imzası mevcut olup, gövde içeriği bilinmemektedir.

---

## FONKSİYON DETAYLARI

### ProjectsPage
**Ne yapar**: Kullanıcının projelerini listelediği, yeni proje oluşturabildiği, projeleri açıp içindeki ürünleri görüntüleyebildiği, projelerden ürün kaldırabildiği ve projeleri silebildiği ana hesap sayfası bileşenidir. Ürün detay sayfasındaki "Projeye Ekle" modalının hesap tarafı karşılığıdır.

**Nasıl yapar**: `useI18n` hook'u ile uluslararasılaştırma desteğini, `useLocalizedRoutes` ile lokalize edilmiş rota fonksiyonlarını ve `useProjectLists` ile proje listesi verilerini (projects, loading) ve proje yönetim fonksiyonlarını (addProject, removeProject, removeItemFromProject, getProjectItems) alır. `useState` ile beş adet yerel state yönetir: yeni proje adı (newName), oluşturma durumu (creating), açık olan proje ID'si (openId), yüklenmiş proje ürünleri (items - Record<string, LoadedItem[]> yapısında) ve yükleme durumu (itemsLoading). Yükleme durumunda spinner gösterir, proje yoksa boş durum mesajı görüntüler, projeler varsa her birini açılır/kapanır kartlar halinde render eder. Her projenin içinde ürün listesi, ürün görseli, ürün adı, miktar bilgisi ve kaldırma butonu bulunur. Ürünler `Link` bileşeni ile ürün detay sayfasına yönlendirir ve `VentImage` ile görselleri görüntüler.

**Parametreler**:
- Yok (fonksiyon parametre almaz)

**Dönüş**: JSX element döndürür; return tipi kodda açıkça belirtilmemiştir.

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
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; metinleri yerelleştirmek için kullanılır
  - `Routes` — `useLocalizedRoutes()` hook'undan dönen rota nesnesi; `Routes.product(slug, sku)` ile ürün sayfası URL'i üretmek için kullanılır
  - `projects` — `useProjectLists()` hook'undan dönen proje dizisi; kullanıcının tüm projelerini içerir
  - `loading` — `useProjectLists()` hook'undan dönen boolean; projeler yüklenirken true olur
  - `addProject` — `useProjectLists()` hook'undan dönen async fonksiyon; yeni proje oluşturmak için kullanılır
  - `removeProject` — `useProjectLists()` hook'undan dönen async fonksiyon; projeyi silmek için kullanılır
  - `removeItemFromProject` — `useProjectLists()` hook'undan dönen async fonksiyon; projeden ürün kaldırmak için kullanılır
  - `getProjectItems` — `useProjectLists()` hook'undan dönen async fonksiyon; projeye ait ürünleri getirmek için kullanılır
  - `newName` — `useState('')` ile oluşturulan state; yeni proje adı input'unun değerini tutar
  - `setNewName` — `newName` state'inin setter fonksiyonu
  - `creating` — `useState(false)` ile oluşturulan state; proje oluşturma işlemi devam ederken true olur
  - `setCreating` — `creating` state'inin setter fonksiyonu
  - `openId` — `useState<string | null>(null)` ile oluşturunan state; şu an genişletilmiş (açık) projenin ID'sini tutar, yoksa null
  - `setOpenId` — `openId` state'inin setter fonksiyonu
  - `items` — `useState<Record<string, LoadedItem[]>>({})` ile oluşturunan state; her projenin ID'sine karşılık gelen yüklü ürün listesini tutar
  - `setItems` — `items` state'inin setter fonksiyonu; fonksiyonel güncelleme kullanır (prev => ...)
  - `itemsLoading` — `useState<string | null>(null)` ile oluşturunan state; ürünleri yüklemekte olan projenin ID'sini tutar, yoksa null
  - `setItemsLoading` — `itemsLoading` state'inin setter fonksiyonu
  - `handleCreate` — yeni proje oluşturma formunun submit handler'ı; `addProject` çağırır
  - `toggleOpen` — bir projeyi açıp kapatma fonksiyonu; açık projenin ürünlerini `getProjectItems` ile yükler
  - `handleRemoveItem` — projeden tek bir ürün kaldırma fonksiyonu; `removeItemFromProject` çağırır ve local state'i günceller
  - `handleDeleteProject` — projeyi tamamen silme fonksiyonu; onay dialog'u gösterir, `removeProject` çağırır
  - `isOpen` — JSX içinde `map` callback'inde hesaplanan boolean; `openId === p.id` karşılaştırmasıyla mevcut projenin açık olup olmadığını belirler
  - `projectItems` — JSX içinde `map` callback'inde hesaplanan dizi; `items[p.id] ||` ile mevcut projenin ürünlerini alır, yoksa boş dizi döner
  - `p` — `projects.map` callback parametresi; tek bir proje nesnesini temsil eder, `p.id`, `p.name`, `p.description` alanlarına erişilir
  - `item` — `projectItems.map` callback parametresi; tek bir proje ürününü temsil eder, `item.id`, `item.product_id`, `item.quantity`, `item.product` alanlarına erişilir
- **Dönüş**: JSX (React bileşeni) — proje listesini, yeni proje oluşturma formunu ve proje detaylarını render eder

### [N2_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::handleCreate
- **params**:
  - `e` — `React.FormEvent`; form submit olayı nesnesi, `e.preventDefault()` ile varsayılan davranışı engellemek için kullanılır
- **ic_degiskenler**:
  - `newName` — dış scope'dan erişilen state; yeni proje adının mevcut değerini tutar, `.trim()` ile boşlukları temizlenir
  - `creating` — dış scope'dan erişilen state; işlem zaten devam ediyorsa tekrar tetiklenmesini engellemek için kontrol edilir
  - `setCreating` — dış scope'dan erişilen setter; try bloğunda true, finally bloğunda false yapılır
  - `addProject` — dış scope'dan erişilen async fonksiyon; `newName.trim()` argümanıyla çağrılır
  - `setNewName` — dış scope'dan erişilen setter; başarılı oluşturma sonrası boş string'e sıfırlanır
- **Dönüş**: yok (async void) — yan etki olarak proje oluşturur, state günceller

### [N3_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::toggleOpen
- **params**:
  - `projectId` — `string`; açılıp kapatılacak projenin ID'si
- **ic_degiskenler**:
  - `openId` — dış scope'dan erişilen state; `projectId` ile karşılaştırılarak projenin zaten açık olup olmadığı kontrol edilir
  - `setOpenId` — dış scope'dan erişilen setter; proje zaten açıksa null yapılır, değilse `projectId` atanır
  - `setItemsLoading` — dış scope'dan erişilen setter; yükleme başlangıcında `projectId`, bitişinde null yapılır
  - `getProjectItems` — dış scope'dan erişilen async fonksiyon; `projectId` argümanıyla çağrılır, projenin ürünlerini getirir
  - `loaded` — `getProjectItems` fonksiyonunun dönüş değeri; `LoadedItem[]` tipine cast edilerek `setItems` ile state'e kaydedilir
  - `setItems` — dış scope'dan erişilen setter; fonksiyonel güncelleme ile mevcut items nesnesine yeni projenin ürünlerini ekler
- **Dönüş**: yok (async void) — yan etki olarak openId ve items state'lerini günceller

### [N4_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::handleRemoveItem
- **params**:
  - `projectId` — `string`; ürünün kaldırılacağı projenin ID'si
  - `productId` — `string`; kaldırılacak ürünün ID'si
- **ic_degiskenler**:
  - `removeItemFromProject` — dış scope'dan erişilen async fonksiyon; `projectId` ve `productId` argümanlarıyla çağrılır
  - `setItems` — dış scope'dan erişilen setter; fonksiyonel güncelleme ile ilgili projenin ürün listesinden `productId` eşleşen öğe filtrelenerek çıkarılır
- **Dönüş**: yok (async void) — yan etki olarak projeden ürünü kaldırır ve local state'i günceller

### [N5_NASIL] AST Pointer: src/views/account/ProjectsPage.tsx::handleDeleteProject
- **params**:
  - `projectId` — `string`; silinecek projenin ID'si
- **ic_degiskenler**:
  - `t` — dış scope'dan erişilen çeviri fonksiyonu; `t('account.projects.deleteConfirm')` ile onay mesajı alınır
  - `removeProject` — dış scope'dan erişilen async fonksiyon; `projectId` argümanıyla çağrılır
  - `openId` — dış scope'dan erişilen state; silinen proje şu an açıksa kontrol edilir
  - `setOpenId` — dış scope'dan erişilen setter; silinen proje açıksa null yapılır
- **Dönüş**: yok (async void) — yan etki olarak projeyi siler, onay dialog'u gösterir, gerekirse openId sıfırlar

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