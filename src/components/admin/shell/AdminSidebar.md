---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-admin\src\components\admin\shell\AdminSidebar.tsx
skeleton_hash: 2872ee61e5a8e971
entity_hashes:
  func:AdminMobileNav: 45e2662b9e86fcab
  func:AdminSidebar: c4e2cb2739adbf73
  func:NavList: 8231bce5e6ac03eb
  overview: a322d7df5940602e
  style_tokens: febe6b3c011e8575
generated_at: 2026-08-15T11:54:24Z
---

## Genel Bakış

Bu modül, admin panelinin sidebar navigasyon yapısını oluşturur. Masaüstü ve mobil olmak üzere iki farklı navigasyon deneyimi sunar ve kullanıcı izinlerine göre menü öğelerinin görünürlüğünü kontrol eder. Modül, collapsed (daraltılmış) mod, yol tabanlı aktif durum belirleme ve navigasyon yönlendirme gibi temel sidebar davranışlarını yönetir.

## Fonksiyon Grupları

### Paylaşılan Navigasyon Listesi
Ortak navigasyon menü yapısını ve izin kontrolü ile filtrelenmiş menü öğelerini render eder. Hem masaüstü hem mobil sidebar tarafından kullanılan temel bileşendir.
- `NavList`

### Masaüstü Sidebar
Genişletilmiş ve daraltılmış olmak üzere iki durumda çalışan masaüstü navigasyon panelini yönetir. Sayfa yoluna göre aktif menü öğesini belirler.
- `AdminSidebar`

### Mobil Navigasyon
Açılır/kapanır yaprak menü (drawer) formatında mobil navigasyon deneyimini sunar. Dışarıdan kontrol edilen açık/kapalı durumu ile birlikte aynı izin tabanlı menü yapısını kullanır.
- `AdminMobileNav`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, admin paneli navigasyon yapısını (sidebar, mobil navigasyon) ve erişim kontrolünü yönetir. Aşağıdaki mimari varsayımlar fonksiyon imzalarından türetilmiştir.

---

**[Aksiyom 1]:** Eğer `canAccess` fonksiyonu (`(key: string) => boolean`) sağlanmazsa, navigasyon öğelerinin kullanıcı için erişilebilir olup olmadığı belirlenemez ve tüm menü öğeleri ya tamamen görünür ya da tamamen gizli olur.

**[Aksiyom 2]:** Eğer `pathname` (`string`) sağlanmazsa veya geçerli bir rota yolu içermemezse, aktif/sayfada bulunulan navigasyon öğesi vurgulanamaz (highlight edilemez).

**[Aksiyom 3]:** Eğer `collapsed` (`boolean`) `AdminSidebar` bileşenine iletilmezse, sidebar'ın geniş/dar durumu belirsizleşir ve `NavList` bileşeni ikon-only (dar) mı yoksa ikon+etiket (geniş) mı gösterileceğini bilemez.

**[Aksiyom 4]:** Eğer `onNavigate` (`() => void`) `NavList` bileşenine sağlanmazsa, kullanıcı navigasyon öğelerine tıkladığında herhangi bir rota değişikliği tetiklenemez.

**[Aksiyom 5]:** Eğer `open` (`boolean`) ve `onOpenChange` (`(open: boolean) => void`) `AdminMobileNav` bileşenine sağlanmazsa, mobil navigasyon panelinin açılıp kapanması kontrol edilemez — panel ya hep açık ya da hep kapalı kalır.

**[Aksiyom 6]:** Eğer `NAV_ITEM_BASE` sabiti (`binary_expression`) tanımsız veya bozuksa, navigasyon öğelerinin temel yapılandırma şablonu (ortalama: ikon, etiket, rota, izin anahtarı) oluşturulamaz ve menü listesi render edilemez.

---

## FONKSİYON DETAYLARI

### NavList
**Ne yapar**: Yönetim paneli navigasyon menüsünü oluşturarak kullanıcıya yetkili kaynakları gruplanmış ve filtrelenmiş şekilde sunar. Mevcut rotayı belirleyerek aktif ve atalar menü öğelerini görsel olarak vurgular.

**Nasıl yapar**: `useI18n()` hook'u ile çeviri fonksiyonunu alır. `React.useMemo` ile pathname'e göre mevcut kaynağı belirler. `ADMIN_NAV_GROUPS` dizisini iterate ederek her grup için `ADMIN_RESOURCES` içinden `inNav` ve `group` filtresi uygulanır, ardından `canAccess` fonksiyonu ile RBAC katmanı kontrolü yapılır (§2.4 referansı ile). Boş gruplar filtrelenir. `renderItem` fonksiyonu her kaynak için Link bileşeni oluşturur, `aria-current` ve `data-active-ancestor` özellikleri ile erişilebilirlik sağlar. Daraltma durumunda (collapsed) sadece ikon görünür, etiketler `sr-only` sınıfı ile gizlenir.

**Parametreler**:
- pathname: string — Mevcut URL rotası, aktif menü öğesini belirlemek için kullanılır
- collapsed: boolean — Sidebar'ın daraltılıp daraltılmadığını belirler, true olduğunda menü sadece ikonları gösterir
- canAccess: (access: string) => boolean — RBAC kontrolü yapan fonksiyon, kullanıcının belirli bir kaynağa erişim izni olup olmadığını döndürür
- onNavigate: () => void — Menü öğesine tıklandığında çağrılan回调 fonksiyonu, mobilde drawer'ı kapatmak için kullanılır

**Dönüş**: React JSX elementi — Gruplandırılmış ve filtrelenmiş navigasyon listesini içeren div yapısı döndürür

### AdminSidebar
**Ne yapar**: Masaüstü cihazlarda (≥768px) sabit sol navigasyon panelini oluşturur, mobil cihazlarda tamamen gizlidir. Daraltılabilir yapı ile hem tam genişlik hem de dar modda çalışır.

**Nasıl yapar**: `useI18n()` hook'u ile çeviri fonksiyonunu alır. `collapsed` prop'una göre genişlik sınıfını (`w-admin-rail` veya `w-admin-nav`) belirler. Ana container `relative hidden md:block` sınıfları ile sadece masaüstünde görünür hale gelir. İki katmanlı yapı kullanır: akıştaki yer tutucu div (daralan kutu) ve fixed pozisyonlu gerçek navigasyon paneli. `data-state` özelliği ile durum bilgisini taşır. `transition-width` sınıfı ile genişlik değişimlerini animasyonlu yapar. `overflow-y-auto` ile içeriğin taşması durumunda kaydırma çubuğu ekler.

**Parametreler**:
- pathname: string — Mevcut URL rotası, NavList bileşenine iletilir
- collapsed: boolean — Sidebar'ın daraltılıp daraltılmadığını belirler, genişlik ve animasyon sınıflarını etkiler
- canAccess: (access: string) => boolean — RBAC kontrolü yapan fonksiyon, NavList bileşenine iletilir

**Dönüş**: React JSX elementi — Sabit pozisyonlu, daraltılabilir navigasyon paneli döndürür. Masaüstü cihazlarda görünür, mobilde gizlidir.

### AdminMobileNav
**Ne yapar**: Mobil cihazlarda (<768px) overlay drawer yapısında navigasyon menüsünü sunar. Radix Dialog kullanarak erişilebilirlik özelliklerini (focus trap, ESC tuşu, body scroll lock) otomatik sağlar.

**Nasıl yapar**: `Dialog.Root` bileşeni ile kontrol edilen overlay yapısı oluşturur. `Dialog.Portal` içinde `Dialog.Overlay` (siyah yarı saydam backdrop) ve `Dialog.Content` (ana drawer paneli) bulunur. `aria-modal="true"` özelliği elle eklenir (Radix'in otomatik eklemediği belirtilmiş). `Dialog.Title` ve `Dialog.Description` bileşenleri `sr-only` sınıfı ile ekran okuyuculara bilgi verirken görselde gizlidir. NavList bileşenini `collapsed={false}` olarak çağırır, `onNavigate` callback'i drawer'ı kapatmak için `onOpenChange(false)` fonksiyonunu tetikler. `md:hidden` sınıfı ile sadece mobil cihazlarda görünür.

**Parametreler**:
- open: boolean — Drawer'ın açık olup olmadığını kontrol eder
- onOpenChange: (open: boolean) => void — Drawer durumu değiştiğinde çağrılan callback, açma/kapatma işlemlerini yönetir
- pathname: string — Mevcut URL rotası, NavList bileşenine iletilir
- canAccess: (access: string) => boolean — RBAC kontrolü yapan fonksiyon, NavList bileşenine iletilir

**Dönüş**: React JSX elementi — Mobil cihazlar için overlay drawer navigasyon yapısı döndürür. Radix Dialog ile erişilebilirlik özellikleri otomatik olarak sağlanır.

---

## İTHALATLAR (IMPORTS)
- import: ../../../i18n/I18nProvider::useI18n
- import: @radix-ui/react-dialog
- import: next/link::Link
- import: next::type { Route }
- import: react::React

---

## INTERFACES

### NavListProps
- `pathname: string`
- `collapsed: boolean`
- `canAccess: (path: string) => boolean`
- `onNavigate?: () => void`

### AdminSidebarProps
- `pathname: string`
- `collapsed: boolean`
- `canAccess: (path: string) => boolean`

### AdminMobileNavProps
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `pathname: string`
- `canAccess: (path: string) => boolean`

---

## SABİTLER
- **NAV_ITEM_BASE** (binary_expression) — `'group/navitem relative flex items-center gap-3 rounded-admin-sm px-3 h-9 tex...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/admin/shell/AdminSidebar.tsx::NavList
- **params**: (`pathname`: mevcut rota yolu, `collapsed`: sidebar daralmış durum mu, `canAccess`: RBAC erişim kontrol fonksiyonu, `onNavigate`: navigasyon tıklama handler'ı)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çevirme fonksiyonu
  - `current` — pathname'e göre aktif kaynak objesi (React.useMemo ile memoize edilmiş)
  - `groups` — ADMIN_NAV_GROUPS dizisinin canAccess filtresinden geçirilmiş, gruplandırılmış ve boş grupları filtrelenmiş hali (React.useMemo ile memoize edilmiş)
  - `renderItem` — her AdminResource için JSX render fonksiyonu
  - `isCurrent` — resource.key'nin current?.key'e eşit olup olmadığı (mevcut sayfa kontrolü)
  - `isAncestor` — resource'un mevcut sayfanın atası olup olmadığı (görsel vurgu için)
  - `label` — resource.labelKey'in çevirilmiş metni
  - `Icon` — resource.icon bileşeni
- **Dönüş**: JSX (navigasyon listesi)

### [N2_NASIL] AST Pointer: components/admin/shell/AdminSidebar.tsx::AdminSidebar
- **params**: (`pathname`: mevcut rota yolu, `collapsed`: sidebar daralmış durum mu, `canAccess`: RBAC erişim kontrol fonksiyonu)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çevirme fonksiyonu
  - `width` — collapsed durumuna göre genişlik sınıfı ('w-admin-rail' veya 'w-admin-nav')
- **Dönüş**: JSX (masaüstü sidebar)

### [N3_NASIL] AST Pointer: components/admin/shell/AdminSidebar.tsx::AdminMobileNav
- **params**: (`open`: modal açık mı, `onOpenChange`: modal durumu değiştirme handler'ı, `pathname`: mevcut rota yolu, `canAccess`: RBAC erişim kontrol fonksiyonu)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çevirme fonksiyonu
- **Dönüş**: JSX (mobil navigasyon drawer'ı, Radix Dialog ile sarılmış)

---


## MERMAID CALL GRAPH
```mermaid
graph TD
    AdminSidebar_tsx__AdminMobileNav["AdminMobileNav"]
    AdminSidebar_tsx__AdminSidebar["AdminSidebar"]
    AdminSidebar_tsx__NavList["NavList"]
```

## NODE ID STANDARD

  file: src\components\admin\shell\AdminSidebar.tsx
  function: src\components\admin\shell\AdminSidebar.tsx::NavList
  function: src\components\admin\shell\AdminSidebar.tsx::AdminSidebar
  function: src\components\admin\shell\AdminSidebar.tsx::AdminMobileNav

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminMobileNav
  export: AdminMobileNavProps
  export: AdminSidebar
  export: AdminSidebarProps
  export: NavList

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/60`, `bg-surface-deep`, `border-r`, `border-white/10`, `text-white/40`, `text-xs`
- **Layout:** `bottom-0`, `fixed`, `flex`, `flex-col`, `gap-0.5`, `gap-6`, `hidden`, `justify-center`, `left-0`, `md:block`, `md:hidden`, `overflow-y-auto`, `relative`, `top-admin-header`, `w-admin-drawer`
- **Varyant/Responsive:** `:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `${NAV_ITEM_BASE`, `${collapsed`, `${width`, `:`, `NAV_ITEM_ACTIVE`, `NAV_ITEM_ANCESTOR`, `NAV_ITEM_IDLE`, `duration-200`, `ease-linear`, `font-medium`, `inset-0`, `inset-y-0`, `isAncestor`, `isCurrent`