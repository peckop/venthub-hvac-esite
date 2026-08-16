---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\overlay\AdminModal.tsx
skeleton_hash: 9db6bbb0108df18a
entity_hashes:
  func:AdminModal: ebb2a2f3d9e5e293
  overview: 23feaff1c2b1fda9
  style_tokens: be0cd721ede72a1e
generated_at: 2026-08-15T18:39:31Z
---

## Genel Bakış

AdminModal,administratif arayüzde modal overlay bileşeni sunan bir React bileşenidir. Başlık, açıklama ve kapatma etiketi gibi yapılandırılabilir özelliklerle,DialogContent içinde modal pencere gösterir. Bileşen, açık/kapalı durumunu kontrol eden ve durum değişikliklerini üst bileşene ileten bir API sunar.

## Fonksiyon Grupları

### Modal Bileşeni
Modal overlay'ın ana React bileşenidir ve Dialog, DialogContent, DialogHeader yapısını render eder.
- AdminModal

### Props Tanımları
Bileşenin alabileceği parametreleri ve opsiyonel değerleri tanımlar.
- open, onOpenChange, title, description, closeLabel, widthClass

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### AdminModal
**Ne yapar**: Bu fonksiyon, bir modal diyalog penceresi render eden bir React bileşenidir. Yönetici arayüzünde farklı işlevler için kullanılan, erişilebilir ve tutarlı bir arayüz sağlar; başlık, açıklama, ana içerik alanı ve opsiyonel bir alt bilgi (footer) bölümünü barındırır.

**Nasıl yapar**: Bileşen, Radix UI kütüphanesinin (`Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, vb.) erişilebilir diyalog yapı taşlarını kullanarak modali oluşturur. `Dialog.Root`, `open` ve `onOpenChange` prop'ları ile dışarıdan kontrol edilen bir durum yönetimi sağlar. Portal (`Dialog.Portal`) yapısı, modal içeriğinin React uygulamasının ana DOM hiyerarşisinden bağımsız olarak, genellikle `<body>` elementinin sonuna eklenerek render edilmesini garantiler. `Dialog.Overlay` sabit bir arka plan perdesi oluşturarak sayfa kaydırmasını kilitler ve odak tuzaklamasını destekler. Bileşen, Radix'in varsayılan olarak `aria-modal` özniteliğini eklemediği için, erişilebilirlik için (`cetvel §4.8/7` referansıyla) bu özniteliği manuel olarak `Dialog.Content` üzerine ekler. Tüm görünüm, Tailwind CSS sınıfları ile stillendirilmiştir.

**Parametreler**:
- `open`: boolean — Diyalog penceresinin açıksa `true`, kapalıysa `false` olduğunu belirtir. Kontrol bileşeni dışarıdan yönetilir.
- `onOpenChange`: `(open: boolean) => void` — Diyalog penceresinin durum değişikliği (açılma/kapanma) gerçekleştiğinde çağrılan geri çağırma fonksiyonudur. Bileşen, durumunu güncellemek için bu fonksiyonu çağırır.
- `title`: string | React.ReactNode — Diyalog penceresinin üst kısmında gösterilecek başlık metnini veya React elemanını temsil eder.
- `description`: string | React.ReactNode — Başlığın hemen altında, daha küçük bir font ile gösterilecek açıklama metnini veya React elemanını temsil eder.
- `closeLabel`: string — Kapatma butonu için erişilebilirlik (aria-label) etiketini tanımlar. Bu metin, görme engelli kullanıcılar tarafından ekran okuyucu ile duyulacaktır.
- `widthClass`: string (Varsayılan: `'w-full max-w-90vw sm:max-w-modal'`) — Modal içeriğinin genişliğini ve maksimum genişliğini kontrol eden Tailwind CSS sınıf(ları)dır. Bu sayede farklı ekran boyutlarına uyumlu genişlik ayarı yapılabilir.
- `footer`: React.ReactNode (Opsiyonel) — Modal penceresinin alt kısmında, genellikle eylem butonlarını (örn. "Kaydet", "İptal") içeren bir bölüm için React elemanıdır. Sağlanmazsa alt bilgi alanı render edilmez.
- `children`: React.ReactNode — Modal penceresinin ana içerik alanını oluşturacak olan React elemanlarıdır.

**Dönüş**: `React.ReactElement` — Oluşturulan modal diyalog yapısını (Radix Dialog bileşenlerini ve Tailwind ile stillendirilmişdiv'leri) içeren bir React elemanı döndürür.

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
- **params**: `open` — Dialog'un açık/kapalı durumunu kontrol eder; `onOpenChange` — Dialog durumu değiştiğinde çağrılan callback; `title` — Modal başlık metni olarak render edilir; `description` — Modal açıklama metni olarak render edilir; `closeLabel` — Kapatma butonunun `aria-label` değeri; `widthClass` — Modal genişlik stilleri, varsayılan `'w-full max-w-90vw sm:max-w-modal'`; `footer` — Opsiyonel footer içeriği, varsa alt kısımda border ile ayrılmış alanda render edilir; `children` — Modal gövde içeriği, scroll edilebilir alanda render edilir
- **ic_degiskenler**: (fonksiyon gövdesinde herhangi bir `const`/`let`/`var` değişken tanımı yoktur; tüm değerler parametrelerden ve import'lardan doğrudan JSX içinde kullanılır)
- **Dönüş**: `React.ReactElement` — `Dialog.Root` ile sarılmış, Portal içinde Overlay + Content yapısını içeren tam modal JSX'i döner; `adminModalContentClass` ve `adminModalScrollAreaClass` import'lu utility sınıfları className'lerde kullanılır; `X` ikonu kapatma butonunda render edilir

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