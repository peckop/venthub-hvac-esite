---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-comp\src\components\admin\overlay\AdminModal.tsx
skeleton_hash: 0fbad743f36b478d
entity_hashes:
  func:AdminModal: 6399eab0ba79bc72
  overview: d3635e4ad09f0841
  style_tokens: be0cd721ede72a1e
generated_at: 2026-08-27T04:11:49Z
---

## Genel Bakış

AdminModal, yönetici arayüzünde kullanılan bir modal diyalog bileşenidir. Radix UI'ın Dialog yapı taşlarını temel alarak modal pencere, başlık, açıklama ve kapatma aksiyonu sunar. Bileşen, açık/kapalı durumunu dışarıdan kontrol eden bir API sağlar.

## Fonksiyon Grupları

### Modal Bileşeni
Modal overlay'ın ana render mantığını üstlenir; Dialog.Root, Dialog.Portal, Dialog.Overlay ve Dialog.Content gibi Radix UI yapılarını kullanarak erişilebilir bir diyalog penceresi oluşturur.
- AdminModal

### Props Tanımları
Bileşenin yapılandırılabilir parametrelerini tanımlar: `open` (görünürlük durumu), `onOpenChange` (durum değişiklik bildirimi), `title` (başlık), `description` (açıklama), `closeLabel` (kapatma etiketi), `widthClass` (genişlik sınıfı).
- AdminModalProps

---

## AXIOMS – Mimari Varsayımlar
- [Aksiyom 1]: Modülün dışa açtığı yapı (şema / prop kümesi) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir prop ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve tüketici bileşenler aynı commit'te güncellenmelidir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca imzadan çıkarım yapılabilmektedir. Aşağıdaki varsayımlar imza bilgisine dayanır:

[Aksiyom 1]: Eğer `open` prop'u sağlanmazsa, bileşenin modal'ı gösterip göstermeyeceği bilinmiyor — fonksiyon gövdesindeki varsayılan davranış bilinmemektedir.

[Aksiyom 2]: Eğer `onOpenChange` prop'u sağlanmazsa, modal kapatma işleminin nasıl yürütüleceği bilinmiyor.

[Aksiyom 3]: Eğer `title` prop'u sağlanmazsa, modal başlığının nasıl render edileceği bilinmiyor.

[Aksiyom 4]: Eğer `description` prop'u sağlanmazsa, açıklama alanının nasıl render edileceği bilinmiyor.

[Aksiyom 5]: Eğer `closeLabel` prop'u sağlanmazsa, kapatma butonu etiketinin ne olacağı bilinmiyor.

[Aksiyom 6]: Eğer `widthClass` prop'u sağlanmazsa, modal genişliğinin nasıl belirleneceği bilinmiyor.

**Not:** Fonksiyon gövdesi (implementation) sağlanmadığı için, bu prop'ların zorunlu mu yoksa opsiyonel mi olduğu, hangi alt dökümantasyon bileşenlerinin (Dialog, DialogContent, DialogHeader) kullanıldığı ve bunların nasıl bir araya getirildiği gibi kritik mimari detaylar belirlenememektedir. Daha kesin aksiyomlar için kaynak kodun kendisi gereklidir.

---

## FONKSİYON DETAYLARI

### AdminModal
**Ne yapar**: Admin paneli için erişilebilir bir modal (diyalog) bileşeni oluşturur. Radix UI Dialog altyapısını kullanarak başlık, açıklama, içerik ve opsiyonel alt bilgi (footer) alanlarını yapılandırılmış bir şekilde görüntüler. Modal açılıp kapanma durumunu dışarıdan kontrol eder.

**Nasıl yapar**: Radix UI kütüphanesinin `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description` ve `Dialog.Close` bileşenlerini hiyerarşik şekilde bir araya getirir. `Dialog.Root` ile modalın açık/kapalı durumu ve durum değişikliği yönetimi sağlanır. `Dialog.Portal` ile içerik DOM ağacının kökenine taşınır. `Dialog.Overlay` siyah yarı saydam bir perde oluşturur ve aynı zamanda gövde kaydırma kilidi (body scroll lock) işlevi görür — kod yorumunda bu perdenin çıkarılmaması gerektiği vurgulanmıştır. `Dialog.Content` ana modal kutusunu oluşturur; Radix'in `aria-modal` niteliğini otomatik olarak eklemediği tespit edildiği için bu nitelik elle eklenmiştir. Başlık bölümünde `Dialog.Title` ve `Dialog.Description` ile erişilebilir başlık ve açıklama sunulur. Kapatma butonu `Dialog.Close` ile oluşturulur ve `aria-label` niteliği ile ekran okuyuculara erişilebilirlik sağlanır; buton içinde `X` ikonu `aria-hidden="true"` ile gizlenir. `children` prop'u esnek kaydırılabilir bir alana yerleştirilir. `footer` prop'u verilmişse, üst kenarlıklı bir alt bölümde görüntülenir; verilmemişse bu bölüm hiç render edilmez.

**Parametreler**:
- open: boolean — Modalın açık olup olmadığını belirten durum değişmezi. `true` olduğunda modal görünür hale gelir.
- onOpenChange: (open: boolean) => void — Modalın açık/kapalı durumu değiştiğinde çağrılan geri çağırım fonksiyonu. Kullanıcı overlay'e tıkladığında veya Escape tuşuna bastığında tetiklenir.
- title: string — Modalın başlık metni. `Dialog.Title` bileşeni içinde görüntülenir ve erişilebilirlik için kullanılır.
- description: string — Modalın açıklama metni. `Dialog.Description` bileşeni içinde görüntülenir ve modalın amacını açıklar.
- closeLabel: string — Kapatma butonu için erişilebilirlik etiketi. `Dialog.Close` bileşeninin `aria-label` niteliğine atanır; ekran okuyucuların butonun işlevini anlamasını sağlar.
- widthClass: string — Modal genişliğini belirleyen Tailwind CSS sınıfı. Varsayılan değeri `'w-full max-w-90vw sm:max-w-modal'` olarak atanmıştır; bu sayede mobilde ekranın %90'ı, küçük ekran ve üzeri cihazlarda `max-w-modal` genişliği kullanılır.
- footer: React.ReactNode — Modalın alt kısmında görüntülenecek opsiyonel içerik. Genellikle aksiyon butonları (kaydet, iptal vb.) buraya yerleştirilir. Verilmediğinde alt bölüm hiç oluşturulmaz.
- children: React.ReactNode — Modalın ana içerik alanı. Kaydırılabilir bir alana (`adminModalScrollAreaClass`) yerleştirilir.

**Dönüş**: React.ReactElement — Radix UI Dialog bileşenlerinden oluşan tam yapılandırılmış modal ağacını döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../../utils/adminUi::adminModalContentClass
- import: ../../../utils/adminUi::adminModalScrollAreaClass
- import: @radix-ui/react-dialog
- import: lucide-react::X
- import: react::React

---

## INTERFACES

### AdminModalProps
MODAL ÇALIŞMA YÜZEYİ — elle yazılmış `fixed inset-0` overlay'lerin yerine. Cetvel: docs/standards/admin-design-standard.md §4.2, §4.8, §4.10 NİÇİN VAR (2026-08-15 ölçümü, D13/D14): Admin'de ~26 bağımsız overlay implementasyonu vardı ve ortak sarmalayıcı YOKTU. `OrdersTableBody.tsx`teki üç yüzeyde §4
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `title: string`
- `description: string`
- `closeLabel: string`
- `widthClass?: string`
- `footer?: React.ReactNode`
- `children: React.ReactNode`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/overlay/AdminModal.tsx::AdminModal
- **params**:
  - `open` — diyalogun açık/kapalı durumunu belirten boolean; `Dialog.Root` bileşeninin `open` prop'una aktarılır
  - `onOpenChange` — diyalog durumu değiştiğinde çağırılan callback fonksiyon; `Dialog.Root` bileşeninin `onOpenChange` prop'una aktarılır
  - `title` — diyalog başlık metni; `Dialog.Title` bileşeni içinde render edilir
  - `description` — diyalog açıklama metni; `Dialog.Description` bileşeni içinde render edilir
  - `closeLabel` — kapatma butonunun erişilebilirlik etiketi; `Dialog.Close` bileşeninin `aria-label` prop'una atanır
  - `widthClass` — diyalog içerik kutusunun genişlik CSS sınıfı; varsayılan değer `'w-full max-w-90vw sm:max-w-modal'`; `Dialog.Content` bileşeninin `className`'inde `adminModalContentClass` ile birlikte kullanılır
  - `footer` — diyalog altbilgi alanı içeriği (opsiyonel); varsa alt kenarlıklı bir div içinde render edilir, yoksa null döner
  - `children` — diyalog ana içerik alanı; `adminModalScrollAreaClass` uygulanmış bir div içinde render edilir
- **ic_degiskenler**:
  - (fonksiyon gövdesinde tanımlanmış iç değişken yoktur; tüm veri props'lardan doğrudan JSX'e aktarılır)
- **Dönüş**: `React.ReactElement` — Radix `Dialog.Root` ile sarmalanmış, portal içinde overlay, içerik kutusu (başlık, açıklama, kapatma butonu, children, opsiyonel footer) barındıran bir JSX ağacı döndürür

---

## NODE ID STANDARD

  file: src\components\admin\overlay\AdminModal.tsx
  function: src\components\admin\overlay\AdminModal.tsx::AdminModal

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminModal
  export: AdminModalProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-admin-surface`, `bg-admin-surface-2`, `bg-black/60`, `border-admin-border`, `border-b`, `border-t`, `hover:bg-admin-surface-2`, `hover:text-admin-fg`, `text-admin-fg`, `text-admin-fg-muted`, `text-base`, `text-sm`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-wrap`, `gap-2`, `gap-4`, `h-8`, `inline-flex`, `items-center`, `items-start`, `justify-between`, `justify-center`, `justify-end`, `md:p-6`, `min-w-0`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `${adminModalContentClass`, `${adminModalScrollAreaClass`, `${widthClass`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-admin-ring`, `focus-visible:ring-offset-2`, `focus-visible:ring-offset-admin-surface`, `font-semibold`, `inset-0`, `leading-6`, `leading-relaxed`, `md:px-6`, `px-5`