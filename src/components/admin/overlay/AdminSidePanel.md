---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\overlay\AdminSidePanel.tsx
skeleton_hash: eee238a120b5f948
entity_hashes:
  func:AdminSidePanel: 4fa559e400b39235
  overview: 6fbb13f20fc2cbd1
  style_tokens: 3e7eafac13f7d94a
generated_at: 2026-08-15T18:39:59Z
---

## Genel Bakış

AdminSidePanel, yöneticilik arayüzünde kullanılan kapalı panel (overlay) bileşenidir. Yan taraftan açılan, başlık, açıklama ve özelleştirilebilir kapat butonu içeren modal benzeri bir UI konteyneridir. İçeriğini `children` üzerinden alarak esnek bir yapı sunar.

## Fonksiyon Grupları

### Ana Bileşen

Bileşen, panelin görünürlüğünü ve içeriğini yöneten ana UI unsurudur. Dışarıdan verilen `open` durumuna göre açılıp kapanır, kapatma işlemini üst bileşene bildirir.

- `AdminSidePanel` — Props aracılığıyla panel durumunu, başlığını ve içerik alanını kontrol eden kapsayıcı bileşen.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir overlay tabanlı admin yan panelidir ve aşağıdaki mimari varsayımlara dayanır:

[Aksiyom 1]: Eğer `open` prop'u `false` ise, modal kapalı görünür ve `onClose` çağrılmaz.
[Aksiyom 2]: Eğer `open` prop'u `true` ise, modal açılır ve `title` ve `description` prop'ları görünür olarak gösterilir.
[Aksiyom 3]: Eğer `open` prop'u `true` iken kullanıcı modal arka planına (overlay) tıklarsa veya ESC tuşuna basarsa, `onClose` fonksiyonu çağrılmalıdır.
[Aksiyom 4]: Eğer `title` prop'u verilmemişse, panel başlığı boş görünür.
[Aksiyom 5]: Eğer `description` prop'u verilmemişse, açıklama bölümü boş görünür.
[Aksiyom 6]: Eğer `closeLabel` prop'u verilmemişse, varsayılan kapatma butonu metni "Kapat" olarak görünür.
[Aksiyom 7]: Eğer `children` prop'u verilmemişse veya boşsa, panel içeriği boş görünür.
[Aksiyom 8]: Bu modal bileşeni, `open` prop'u `true` olduğunda DOM'da render edilmelidir; `false` olduğunda DOM'dan kaldırılmalı veya gizlenmelidir.
[Aksiyom 9]: `onClose` fonksiyonu her zaman çağrılabilir olmalıdır; bileşen kapatma işlemi sonrası bu callback'i tetikler.
[Aksiyom 10]: Bu bileşen bir React functional component olarak tanımlıdır ve `React.ReactElement | null` döndürür.
[Aksiyom 11]: Modal açıldığında (`open: true`), arka plan overlay'i karanlık yarı saydam olmalı ve modal content'i ön planda görünmelidir.
[Aksiyom 12]: `title` ve `closeLabel` metinleri strings olmalıdır; sayısal veya diğer tipler verilirse bileşen hata verebilir veya garip davranabilir.

---

## FONKSİYON DETAYLARI

### AdminSidePanel
**Ne yapar**: Bu bileşen, bir yönetici arayüzünde sağ taraftan açılan bir yan paneli temsil eder. İçerik girişi veya detay gösterimi için kullanılır ve portal ile document.body üzerine render edilerek CSS sorunlarını önler.

**Nasıl yapar**: `open` prop'unu kontrol ederek panelin görünürlüğünü yönetir. Panel ilk kez açıldığında, daha önce odaklanan elementi (`triggerRef`) saklar ve Escape tuşu ile kapatıldığında veya kapatma butonuna basıldığında odak eski konumuna geri döner. Portal kullanımı, panelin transform içeren bir atadan etkilenmesini engeller. `mounted` state'i, portal'ın DOM'a başarıyla eklenip eklenmediğini takip ederek ilk açılışta odak taşıma işlemini güvenli hale getirir.

**Parametreler**:
- open: boolean — Panelin açılıp açılmadığını kontrol eden boolean değer. true olduğunda panel gösterilir.
- onClose: () => void — Panel kapatıldığında çağrılacak callback fonksiyonu. Escape tuşu veya kapatma butonu ile tetiklenir.
- title: string — Panelin üst kısmında görünecek başlık metni.
- description: string — Başlığın altında görünecek açıklama veya alt başlık metni.
- closeLabel: string — Kapatma butonu için aria-label değeri, erişilebilirlik sağlar.
- children: React.ReactNode — Panelin içeriğinde render edilecek React elementleri veya bileşenleri.

**Dönüş**: React.ReactElement | null — Panel açıksa ve monte edildiyse, portal ile document.body üzerine render edilmiş React elementini döndürür. Aksi takdirde null döndürerek hiçbir şey render etmez.

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

- **params**: `open` (boolean — panelin açık/kapalı durumunu kontrol eder), `onClose` (callback fonksiyon — panel kapatma isteği tetiklendiğinde çağrılır), `title` (string — panel başlık metni), `description` (string — panel açıklama metni), `closeLabel` (string — kapat butonunun aria-label değeri), `children` (ReactNode — panel içeriğine yerleştirilecek alt bileşenler)
- **ic_degiskenler**:
  - `panelRef` — panel `<div>` elementine verilen React ref; odak yönetimi (focus/focus restoration) için kullanılır, `panelRef.current?.focus()` ile odak panel üzerine taşınır
  - `triggerRef` — panel açılmadan önce odakta olan elementi (trigger) saklayan ref; panel kapatıldığında `triggerRef.current?.focus()` ile odak geri döndürülür, temizlikte `null`'a atanır
  - `titleId` — `React.useId()` ile oluşturulan benzersiz ID; panel `<div>`'ine `aria-labelledby`, `<h2>` elementine `id` olarak bağlanır (erişilebilirlik)
  - `descriptionId` — `React.useId()` ile oluşturulan benzersiz ID; panel `<div>`'ine `aria-describedby`, `<p>` elementine `id` olarak bağlanır (erişilebilirlik)
  - `onCloseRef` — `onClose` callback'ini ref içinde saklayan değişken; effect içindeki `handleKeyDown` kapanışı gibi asenkron/sürekli çalışan callback'lerde stale closure sorununu engeller, `onClose` her render'da değişse bile güncel değere erişilir
  - `mounted` — `React.useState<boolean>(false)` state'i; bileşenin portal ile `document.body`'ye mounted olup olmadığını takip eder, `true` olduğunda portal DOM'a basılır ve ilk render'da `panelRef`'in boş olma sorunu önüne geçilir
  - `setMounted` — `mounted` state'ini `true`'ya ayarlayan setter; birinci `useEffect`'te (`[]` bağımlılık) çağrılır, mount sonrası tetiklenir
  - `handleKeyDown` — `document` level `keydown` event handler'ı; `Escape` tuşuna basıldığında `onCloseRef.current()` çağrısıyla paneli kapatır, cleanup'ta `removeEventListener` ile kaldırılır
- **Dönüş**: `createPortal(...)` ile `document.body`'ye taşınsan JSX (panel markup'u) veya `!open || !mounted` koşulunda `null` — `React.ReactElement | null`

**Yan etkiler:**
- `useEffect(open/mounted)` — panel açıldığında `document`'e `keydown` listener ekler, kapatıldığında kaldırır; odak yönetimi yapar (trigger elementi kaydeder, panele taşır, kapatınca geri döndürür)
- `useEffect(onClose)` — `onCloseRef.current`'u her render'da güncel tutar
- `useEffect([])` — mount'ta `setMounted(true)` çağırarak portal'ın DOM'a basılmasını tetikler
- `createPortal(content, document.body)` — JSX'i React component tree'si dışına, doğrudan `document.body`'ye basar (modal overlay pattern)

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