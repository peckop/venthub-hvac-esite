---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\components\admin\overlay\AdminSidePanel.tsx
skeleton_hash: fafed7bb5b970e49
entity_hashes:
  func:AdminSidePanel: d6514db192d36644
  overview: 058e6a8f16b4ade4
  style_tokens: 3e7eafac13f7d94a
generated_at: 2026-08-27T04:12:17Z
---

## Genel Bakış

AdminSidePanel, yönetici arayüzünde kullanılan bir yan panel (overlay) bileşenidir. Yan taraftan açılıp kapanan, başlık, açıklama ve kapat butonu içeren modal benzeri bir UI konteyneridir. İçeriğini `children` prop'u aracılığıyla alır ve esnek bir yapı sunar.

## Fonksiyon Grupları

### Ana Bileşen

Panelin görünürlüğünü, başlık ve açıklama alanlarını, kapat butonunu ve içerik bölgesini yöneten ana UI unsurudur. Dışarıdan verilen `open` durumuna göre açılıp kapanır; kapatma işlemini `onClose` aracılığıyla üst bileşene bildirir.

- AdminSidePanel

## Mimari Varsayımlar

- `open` prop'u `false` olduğunda panel kapalı görünür ve `onClose` çağrılmaz.
- `open` prop'u `true` olduğunda panel açılır; `title` ve `description` prop'ları görünür olarak gösterilir.
- `open` prop'u `true` iken kullanıcı overlay alanına tıklarsa veya ESC tuşuna basarsa `onClose` fonksiyonu çağrılır.
- `title` prop'u verilmemişse panel başlığı boş görünür.
- `description` prop'u verilmemişse açıklama bölümü boş görünür.
- `closeLabel` prop'u verilmemişse varsayılan kapat butonu metni "Kapat" olarak görünür.
- `children` prop'u verilmemişse veya boşsa panel içeriği boş görünür.
- `open` prop'u `true` olduğunda bileşen DOM'da render edilir; `false` olduğunda DOM'dan kaldırılır veya gizlenir.

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdesi verilmediği için yalnızca imzadan çıkarım yapılabilmektedir.

[Aksiyom 1]: Eğer `open` prop'u sağlanmazsa, bileşenin null dönmesi beklenir; çünkü dönüş tipi `React.ReactElement | null` olarak tanımlıdır ve `open` durumu panelin görünürlüğünü kontrol eder.

[Aksiyom 2]: Eğer `onClose` prop'u sağlanmazsa, panel kapatma işlevi çalışmaz; çünkü kapatma işlemi üst bileşene `onClose` callback'i aracılığıyla bildirilir.

[Aksiyom 3]: Eğer `title` prop'u sağlanmazsa, panel başlığı görüntülenmez; çünkü başlık içeriği dışarıdan bu prop aracılığıyla beslenir.

[Aksiyom 4]: Eğer `children` prop'u sağlanmazsa, panel içerik alanı boş görüntülenir; çünkü panelin ana içeriği `children` üzerinden aktarılır.

[Aksiyom 5]: Eğer `description` prop'u sağlanmazsa, açıklama alanı görüntülenmez; çünkü açıklama metni dışarıdan bu prop aracılığıyla beslenir.

[Aksiyom 6]: Eğer `closeLabel` prop'u sağlanmazsa, kapat butonu etiketi görüntülenmez veya varsayılan bir değer kullanılır; ancak fonksiyon gövdesi olmadığından varsayılan davranış bilinmiyor.

---

## FONKSİYON DETAYLARI

### AdminSidePanel

**Ne yapar**: Admin panelinde sağdan açılan, modal benzeri bir yan panel (side panel) bileşenidir. Panel açıkken ekranın sağ tarafını kaplar, başlık ve açıklama metni gösterir, bir kapatma düğmesi barındırır ve çocuklar (children) için kaydırılabilir bir içerik alanı sağlar. Panel kapalıyken veya henüz monte edilmemişken DOM'a hiçbir şey basmaz.

**Nasıl yapar**: Fonksiyon, `open` ve `mounted` durumlarını kontrol ederek render edilip edilmeyeceğine karar verir. `mounted` durumu, bileşenin ilk render'ından sonra `useEffect` ile `true` yapılır; bu, portal'ın yalnızca istemci tarafında (client-side) basılmasını garanti eder. Panel açıldığında, o anki odakta olan öğe `triggerRef`'e kaydedilir ve odak panele taşınır; panel kapandığında ise odak bu tetikleyici öğeye geri döndürülür — bu sayede erişilebilirlik (accessibility) akışı korunur. `onClose` fonksiyonu bir ref üzerinden (`onCloseRef`) takip edilir; bu, `onClose` her render'da değişse bile `Escape` tuşu dinleyicisinin güncel referansı kullanmasını sağlar ve efekt bağımlılıklarının gereksiz yere tetiklenmesini önler. `Escape` tuşuna basıldığında `onCloseRef.current()` çağrılarak panel kapatılır. Panel, `createPortal` ile `document.body`'ye taşınır; bunun nedeni, `position: fixed` bir öğenin dönüştürülmüş (transform) bir ata öğe içinde olması durumunda viewport'a değil o ataya göre konumlanacağıdır — portal ile body'ye taşınarak bu sorunun önüne geçilir. Panel, `role="region"`, `aria-labelledby` ve `aria-describedby` özellikleriyle erişilebilirlik standartlarına uygun şekilde işaretlenmiştir. Kapatma düğmesi, `closeLabel` parametresiyle `aria-label` alır ve bir `X` ikonu içerir.

**Parametreler**:
- `open`: `boolean` — Panelin açık olup olmadığını belirten durum değeri. `false` olduğunda bileşen DOM'a hiçbir şey basmaz.
- `onClose`: `() => void` — Panel kapatıldığında çağrılacak geri çağırma fonksiyonu. Hem kapatma düğmesine tıklamada hem de `Escape` tuşunda tetiklenir.
- `title`: `string` — Panelin üst kısmında `h2` başlık öğesi içinde gösterilen başlık metni. `aria-labelledby` aracılığıyla panelin erişilebilir adını tanımlar.
- `description`: `string` — Başlığın altında `p` öğesi içinde gösterilen açıklama metni. `aria-describedby` aracılığıyla panelin açıklamasını tanımlar.
- `closeLabel`: `string` — Kapatma düğmesinin `aria-label` özelliğine atanan, ekran okuyucular için erişilebilir etiket metni.
- `children`: `React.ReactNode` — Panelin kaydırılabilir içerik alanında render edilecek alt bileşenler.

**Dönüş**: `React.ReactElement | null` — Panel açık ve monte edilmiş durumdaysa `document.body`'ye portal edilmiş bir `React.ReactElement` döndürür; aksi halde `null` döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminModalScrollAreaClass
- import: lucide-react::X
- import: react-dom::createPortal
- import: react::React

---

## INTERFACES

### AdminSidePanelProps
NON-MODAL YAN PANEL — "sadece bakılıyor" yüzeyleri için. Cetvel: docs/standards/admin-design-standard.md §4.1, §4.3 NİÇİN RADIX DIALOG DEĞİL: §4.3'ün tek cümlesi bu bileşenin varlık sebebi: *"Yan panelin ayırt edici özelliği yandan gelmesi değil, MODAL OLUP OLMAMASIDIR. Modal bir drawer, sadece şekl
- `open: boolean`
- `onClose: () => void`
- `title: string`
- `description: string`
- `closeLabel: string`
- `children: React.ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/overlay/AdminSidePanel.tsx::AdminSidePanel
- **params**:
  - `open` — panelin açık olup olmadığını belirten boolean
  - `onClose` — panel kapatıldığında çağrılacak callback fonksiyonu
  - `title` — panel başlık metni
  - `description` — panel açıklama metni
  - `closeLabel` — kapatma butonu için erişilebilirlik etiketi (aria-label)
  - `children` — panel içeriğinde render edilecek React çocuk öğeleri
- **ic_degiskenler**:
  - `panelRef` — `React.useRef<HTMLDivElement>(null)` — panel kök div elementine referans; odak vermek ve erişilebilirlik özellikleri için kullanılır
  - `triggerRef` — `React.useRef<HTMLElement | null>(null)` — panel açılmadan önce odakta olan tetikleyici elemente referans; panel kapandığında odağı geri taşımak için kullanılır
  - `titleId` — `React.useId()` — başlık `<h2>` elementinin `id`'si; panel div'inin `aria-labelledby` değeri olarak atanır
  - `descriptionId` — `React.useId()` — açıklama `<p>` elementinin `id`'si; panel div'inin `aria-describedby` değeri olarak atanır
  - `onCloseRef` — `React.useRef(onClose)` — `onClose` callback'inin güncel referansını tutan ref; efekt bağımlılığında doğrudan `onClose` yerine kullanılarak gereksiz yeniden tetiklenmeyi önler
  - `mounted` — `React.useState(false)` — bileşenin monte edilip edilmediğini takip eden boolean state; portal henüz basılmadan odak taşıma işlemini engellemek için kullanılır
  - `setMounted` — `mounted` state'inin setter fonksiyonu; monte efektinde `true` olarak ayarlanır
  - `handleKeyDown` — ana efekt içinde tanımlanan klavye olayı işleyicisi; `Escape` tuşunda `onCloseRef.current()` çağırarak paneli kapatır
- **Dönüş**: `React.ReactElement | null` — `open` false veya `mounted` false ise `null` döner; aksi halde `createPortal` ile `document.body`'ye portal edilen sabit konumlu (`fixed`) panel JSX'i döner

#### Efektler ve yan etkiler:
1. **onCloseRef güncelleme efekti** — bağımlılık: `[onClose]` — `onClose` her değiştiğinde `onCloseRef.current`'i yeni değere atar
2. **mount tespit efekti** — bağımlılık: `[]` — bileşen ilk monte edildiğinde `setMounted(true)` çağırır
3. **odak ve klavye yönetimi efekti** — bağımlılık: `[open, mounted]` — `open` true ve `mounted` true olduğunda: `document.activeElement`'i `triggerRef.current`'e kaydeder, `panelRef.current`'e odak verir, `keydown` olayını dinler; temizlemede: `keydown` dinleyicisini kaldırır, `triggerRef.current`'e odağı geri taşır, `triggerRef.current`'i sıfırlar

---

## NODE ID STANDARD

  file: src\components\admin\overlay\AdminSidePanel.tsx
  function: src\components\admin\overlay\AdminSidePanel.tsx::AdminSidePanel

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminSidePanel
  export: AdminSidePanelProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `border-admin-border`, `border-b`, `border-l`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-fg`, `text-admin-fg-muted`, `text-base`, `text-sm`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `gap-4`, `h-8`, `inline-flex`, `items-center`, `items-start`, `justify-between`, `justify-center`, `md:p-6`, `min-w-0`, `p-5`, `right-0`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${adminModalScrollAreaClass`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-ring`, `focus-visible:ring-offset-2`, `focus-visible:ring-offset-admin-surface`, `font-semibold`, `inset-y-0`, `leading-6`, `leading-relaxed`, `rounded-admin-sm`, `shrink-0`, `space-y-1`, `transition-colors`