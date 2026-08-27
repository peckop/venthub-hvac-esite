---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\shell\AdminSidebar.tsx
skeleton_hash: 0e76a93ffca52c2f
entity_hashes:
  func:AdminMobileNav: 2796687b9805241d
  func:AdminSidebar: 56939624b9898a40
  func:NavList: 26f7e965010c847c
  overview: a33b54ba73b627ed
  style_tokens: bc5af71be1a20afb
generated_at: 2026-08-27T08:23:56Z
---

## Genel Bakış

Bu modül, admin panelinin yan menü (sidebar) navigasyonunu yönetir. Masaüstü ve mobil olmak üzere iki farklı görünüm sunar ve kullanıcının yetkilerine göre erişilebilir menü öğelerini filtreler. `NavList` bileşeni her iki görünümde de ortak navigasyon listesini render eder.

## Fonksiyon Grupları

### Navigasyon Listesi
Ortak navigasyon öğelerini listeleyen ve kullanıcı etkileşimlerini üst bileşene ileten yardımcı bileşendir. Masaüstü ve mobil görünümler bu bileşeni ortak olarak kullanır.
- NavList

### Ana Görünüm Bileşenleri
Admin panelinin masaüstü sidebar'ını ve mobil navigasyon menüsünü oluşturan üst düzey bileşenlerdir. Her ikisi de mevcut sayfa yolunu (`pathname`), yetki durumunu (`canAccess`) alır; mobil bileşen ayrıca menü açıklık durumunu (`open`) ve değişim yardımcısını (`onOpenChange`) parametre olarak kabul eder.
- AdminSidebar, AdminMobileNav

---

## AXIOMS – Mimari Varsayımlar

Fonksiyon gövdeleri verilmediğinden, yalnızca imzalardan çıkarılabilecek sınırlı varsayımlar mevcuttur.

[Aksiyom 1]: Eğer `pathname` prop'u sağlanmazsa, `NavList`, `AdminSidebar` ve `AdminMobileNav` bileşenlerinin hangi rotada olduğunu belirleyemez; navigasyon vurgulama (active state) davranışı tanımsız kalır.

[Aksiyom 2]: Eğer `canAccess` prop'u sağlanmazsa, `NavList`, `AdminSidebar` ve `AdminMobileNav` bileşenlerinin erişim kontrolü yapılamaz; hangi menü öğelerinin gösterileceği belirlenemez.

[Aksiyom 3]: Eğer `collapsed` prop'u sağlanmazsa, `NavList` ve `AdminSidebar` bileşenlerinin daraltılmış/genişletilmiş durumu bilinemez; görünüm davranışı tanımsız kalır.

[Aksiyom 4]: Eğer `onNavigate` prop'u sağlanmazsa, `NavList` bileşeni tıklama olaylarını üst bileşene iletemez; navigasyon tetiklenemez.

[Aksiyom 5]: Eğer `open` prop'u sağlanmazsa, `AdminMobileNav` bileşeninin açık/kapalı durumu bilinemez; mobil menü görünürlüğü tanımsız kalır.

[Aksiyom 6]: Eğer `onOpenChange` prop'u sağlanmazsa, `AdminMobileNav` bileşeni açık/kapalı durum değişikliğini üst bileşene bildiremez; mobil menü kapatılamaz.

[Aksiyom 7]: `NAV_ITEM_BASE` sabiti tanımlı değilse, menü öğelerinin temel stil/özellik ataması yapılamaz; görünüm davranışı tanımsız kalır.

---

## FONKSİYON DETAYLARI

### NavList
**Ne yapar**: Admin panelinin navigasyon menüsünü oluşturan bileşendir. RBAC (Role-Based Access Control) yetkilendirme kontrolü uygulayarak, kullanıcının erişim yetkisi olmayan kaynakları listeden tamamen gizler. Görünür bir link gösterip ardından AccessDenied ekranı sunma yaklaşımı reddedilmiştir (kaynakta §2.4 / denetim bulgusu D8 olarak belirtilmiştir).

**Nasıl yapar**: `useI18n` kancasıyla uluslararasılaştırma desteği alır. `React.useMemo` ile mevcut rotayı (`pathname`) hesaplar ve `ADMIN_NAV_GROUPS` dizisindeki her grubu, `ADMIN_RESOURCES` filtresinden geçirir. Filtreleme kriterleri: kaynağın `inNav` özelliği true olmalı, grubun `key` değeri eşleşmeli ve `canAccess` fonksiyonu o kaynağın `requiredAccess` değeriyle çağrıldığında true dönmelidir. Hiç öğesi kalmayan gruplar da listeden çıkarılır. `renderItem` fonksiyonu her kaynak için bir `<li>` içinde `<Link>` oluşturur; mevcut rota eşleşiyorsa `aria-current="page"` atanır, ata kaynaklar için `data-active-ancestor="true"` atanır (MDN yönergesine göre yalnız yaprak öğe `aria-current` alır, ata sadece görsel vurgu alır). `collapsed` durumuna göre ikon-only görünüm veya etiketli görünüm sağlanır; CSS sınıf isimleri (`NAV_ITEM_BASE`, `NAV_ITEM_ACTIVE`, `NAV_ITEM_ANCESTOR`, `NAV_ITEM_IDLE`) kaynak kodda tanımlı sabitlerdir.

**Parametreler**:
- pathname: string — Mevcut URL yolu; hangi kaynağın aktif olduğunu belirlemek için kullanılır.
- collapsed: boolean — Kenar çubuğunun daraltılmış durumda olup olmadığını belirtir; true olduğunda yalnız ikonlar gösterilir, etiketler `sr-only` sınıfıyla gizlenir.
- canAccess: (access: string) => boolean — RBAC yetki kontrol fonksiyonu; verilen erişim anahtarına sahip olup olmadığını boolean olarak döndürür.
- onNavigate: () => void — Navigasyon linklerine tıklandığında çağrılan geri çağırım fonksiyonu.

**Dönüş**: Belirtilmemiş. React bileşeni olduğundan JSX ağacı üretir.

### AdminSidebar
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

### AdminMobileNav
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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

### [N1_NASIL] AST Pointer: src/components/admin/shell/AdminSidebar.tsx::NavList
- **params**: `pathname` (string — mevcut URL yolu), `collapsed` (boolean — sidebar daraltılmış mı), `canAccess` (fonksiyon — RBAC erişim kontrolü), `onNavigate` (fonksiyon — tıklama callback'i, opsiyonel)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `resource.labelKey` ve `group.labelKey` anahtarlarını yerel metne çevirir
  - `current` — `React.useMemo` ile hesaplanan, `findCurrentResource(pathname)` çağrısının sonucu; mevcut rotaya karşılık gelen `AdminResource` nesnesi (veya `undefined`)
  - `groups` — `React.useMemo` ile hesaplanan dizi; `ADMIN_NAV_GROUPS` elemanlarını `ADMIN_RESOURCES` ile birleştirip `canAccess(r.requiredAccess)` ile yetkisiz kaynakları eler, boş grupları da `filter` ile düşürür
  - `renderItem` — `(resource: AdminResource) => JSX.Element` fonksiyonu; tek bir navigasyon öğesini `<li>` içinde `<Link>` olarak render eder
  - `isCurrent` — `current?.key === resource.key` karşılaştırması; öğenin mevcut rota olup olmadığını belirler, `aria-current="page"` attribute'u buna bağlıdır
  - `isAncestor` — `!isCurrent && isResourceActive(resource, pathname)` koşulu; üst kategori öğesinin aktif olup olmadığını belirler, `data-active-ancestor` attribute'u buna bağlıdır
  - `label` — `t(resource.labelKey)` sonucu; öğenin görünen metni, `title` attribute'unda ve `<span>` içinde kullanılır
  - `Icon` — `resource.icon` bileşeni; 18px boyutunda ikon render eder
- **Dönüş**: JSX.Element — `div` içinde `groups` dizisini `.map` ile dolaşarak her grup için başlık (`<h3>`, collapsed değilse) ve öğe listesi (`<ul>`) render eder

### [N2_NASIL] AST Pointer: src/components/admin/shell/AdminSidebar.tsx::AdminSidebar
- **params**: `pathname` (string — mevcut URL yolu), `collapsed` (boolean — sidebar daraltılmış mı), `canAccess` (fonksiyon — RBAC erişim kontrolü)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `aria-label` için `'admin.a11y.mainNavigation'` anahtarını çevirir
  - `width` — collapsed durumuna göre `'w-admin-rail'` (dar) veya `'w-admin-nav'` (geniş) CSS sınıfı; hem akıştaki yer tutucu `<div>` hem de görünen `<nav>` üzerinde kullanılır
- **Dönüş**: JSX.Element — `relative hidden md:block` sınıfına sahip kök `<div>` içinde iki çocuk: akıştaki genişlik yer tutucusu (`aria-hidden` div) ve `fixed` konumlu `<nav>` bileşeni (içinde `NavList` render edilir)

### [N3_NASIL] AST Pointer: src/components/admin/shell/AdminSidebar.tsx::AdminMobileNav
- **params**: `open` (boolean — diyalog açık mı), `onOpenChange` (fonksiyon — diyalog açık/kapalı durumu değişim callback'i), `pathname` (string — mevcut URL yolu), `canAccess` (fonksiyon — RBAC erişim kontrolü)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `Dialog.Title` ve `Dialog.Description` içinde `'admin.a11y.mainNavigation'` anahtarını çevirir
- **Dönüş**: JSX.Element — Radix `Dialog.Root` ile mobil navigasyon diyalogu render eder; `Dialog.Portal` içinde overlay (`bg-black/60`), content paneli (`w-admin-drawer`, `aria-modal="true"` manuel eklenmiş) ve `NavList` (`collapsed={false}`, `onNavigate={() => onOpenChange(false)}`) bulunur

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
- **Renkler:** `bg-admin-bg`, `bg-black/60`, `border-admin-border`, `border-r`, `text-admin-fg-muted`, `text-xs`
- **Layout:** `bottom-0`, `fixed`, `flex`, `flex-col`, `gap-0.5`, `gap-6`, `hidden`, `justify-center`, `left-0`, `md:block`, `md:hidden`, `overflow-y-auto`, `relative`, `top-admin-header`, `w-admin-drawer`
- **Varyant/Responsive:** `:`, `md:` önekleri
- **Yardımcı Sınıflar:** `$`, `${NAV_ITEM_BASE`, `${collapsed`, `${width`, `:`, `NAV_ITEM_ACTIVE`, `NAV_ITEM_ANCESTOR`, `NAV_ITEM_IDLE`, `duration-200`, `ease-linear`, `font-medium`, `inset-0`, `inset-y-0`, `isAncestor`, `isCurrent`