---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx
skeleton_hash: 0278d6c29b5f44ef
entity_hashes:
  func:AccountLayout: d9966002287f3c91
  overview: 29bdf5b29582877d
  style_tokens: cca55516cfe981ad
generated_at: 2026-06-19T20:48:21Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki hesap yönetim arayüzünün temel yapısını oluşturan bir React layout bileşenidir. Hesap bölümündeki tüm alt sayfaların tutarlı bir şekilde sunulmasını sağlamak için çerçeve düzenini (wrapper layout) tanımlar. Bu bileşen, hesap sayfalarını saran ortak bir yapı oluşturarak kullanıcı deneyiminde süreklilik sağlar.

## Fonksiyon Grupları
### Ana Hesap Düzeni Bileşeni
Hesap yönetim arayüzünün temel çerçevesini ve düzenini tanımlayan ana layout bileşenidir. Tüm hesap sayfalarını saran tutarlı bir konteyner yapısı oluşturarak içeriğin sunumunu sağlar.
- AccountLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hesap yönetim arayüzünün layout konteyner bileşenidir ve children opsiyonel olarak kabul eder.

**[Aksiyom 1]:** Eğer `children` prop'u sağlanmamışsa, bileşen yine de hata vermeden render edilmelidir (çünkü `children` opsiyonel `React.ReactNode` tipindedir).

**[Aksiyom 2]:** Eğer `children` sağlanmışsa, bu değer doğrudan layout içinde render edilmelidir (bileşen bir wrapper/container yapısındadır).

---

## FONKSİYON DETAYLARI

### AccountLayout

**Ne yapar**: Kullanıcının hesap sayfaları için genel yerleşim düzenini (layout) sağlayan bir React bileşenidir. Sol tarafta gezinme侧bar menüsünü, sağ tarafta ise sayfa içerik alanını render eder. Oturum kontrolü yaparak yetkisiz kullanıcıları giriş sayfasına yönlendirir. Tüm rota.href'leri ve etkin sekme kontrolü dil-önekli olacak şekilde çalışır.

**Nasıl yapar**:

- `useRouter()`, `usePathname()` — Next.js router ve mevcut pathname bilgisini almak için kullanılır. Router, yetkisiz erişim durumunda kullanıcıyı login sayfasına yönlendirir; pathname ise hangi侧bar链接'ının aktif olduğunu belirlemek için karşılaştırılır.
- `useI18n()` — Çeviri fonksiyonu `t()` sağlar. Sekme etiketleri ve başlıklar bu fonksiyonla lokalize edilir; çeviri bulunamadığında fallback değerleri (`|| '...'`) kullanılır.
- `useLocalizedRoutes()` — Dil-önekli rota üretici proxy nesnesi döndürür. `routes.account.overview()`, `routes.account.orders()` gibi çağrılar SSOT (Single Source of Truth) olarak merkezi rota tanımından lokalize href'ler üretir. Böylece hem侧bar linklerinin `href`'leri hem de aktif-sekme eşleştirmesi tutarlı çalışır.
- `useAuth()` — Mevcut kullanıcı nesnesi (`user`) ve yükleme durumu (`loading`) bilgisini sağlar.
- `React.useEffect` — Bileşen yüklendiğinde, geliştirme modu dışında, kullanıcı giriş yapmamışsa (`!loading && !user`) login sayfasına yönlendirme yapar. `active` flag'i ile bileşen unmount edildiğinde state güncellemesini önler (cleanup fonksiyonu). Geliştirme modunda (`NODE_ENV === 'development'`) bu kontrol tamamen atlanır.
- `shouldRender` değişkeni — Geliştirme modunda `user` null olsa bile render yapılmasını sağlar; üretim modunda ise hem yüklemenin tamamlanmış hem de kullanıcının oturum açmış olmasını şart koşar.
- `navGroups` dizisi — Üç grup halinde侧bar menü yapılandırmasını tanımlar: Özet, Sipariş & Kargo, Hesap Yönetimi. Her grup bir `label` ve `items` dizisi içerir; her item bir `to` (href), `label` (görünen metin) ve `icon` (lucide-react ikonu) barındırır. Aktif sekme belirleme `pathname === tab.to` karşılaştırmasıyla yapılır.
-侧bar`<nav>` yapısı mobilde yatay scroll edilebilir flex, masaüstünde dikey flex olarak render edilir (`flex md:block`). `sticky top-24` ile侧bar'ın kaydırma sırasında sabit kalması sağlanır.

**Parametreler**:

- `children`: `React.ReactNode | undefined` — Layout'un sağ tarafındaki içerik alanında render edilecek olan alt sayfa bileşenleridir. Zorunlu değildir, tanımsız geldiğinde boş alan oluşur.

**Dönüş**: `JSX.Element` — Hesap sayfalarının ortak yerleşim düzenini oluşturan JSX yapısı döndürür.侧bar navigasyon menüsü ve merkezi içerik alanını (`children`) kapsayan bir `<div>` yapısı içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../../hooks/useAuth::useAuth
- import: ../../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../../i18n/I18nProvider::useI18n
- import: next/link::Link
- import: next/navigation::usePathname
- import: next/navigation::useRouter
- import: react::React

---

## TYPE ALIASES

### TabItem
```typescript
type TabItem = { to: string; label: string; icon: React.ReactNode }
```

### TabGroup
```typescript
type TabGroup = { label: string; items: TabItem[] }
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/account/AccountLayout.tsx::AccountLayout
- **params**: `{ children }: { children?: React.ReactNode }`
- **ic_degiskenler**:
  - `router` — `useRouter()` ile elde edilen Next.js router instance'ı; programmatic yönlendirme (router.replace) için kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; localization key'lerine karşılık gelen metinleri döndürür (ör. `t('account.tabs.overview')`)
  - `routes` — `useLocalizedRoutes()` hook'undan dönen dil-önekli route proxy nesnesi; `routes.account.overview()`, `routes.auth.login()` gibi method çağrılari ile localize href'ler üretilir
  - `user` — `useAuth()` hook'undan dönen mevcut oturum kullanıcısı nesnesi; null ise kullanıcı giriş yapmamış demektir
  - `loading` — `useAuth()` hook'undan dönen boolean; oturum durumu henüz yükleniyorsa true değerini alır
  - `pathname` — `usePathname()` ile elde edilen mevcut URL path'i; aktif sekme kontrolünde (`pathname === tab.to`) kullanılır
  - `navGroups` — `TabGroup[]` tipinde dizi; hesap sayfası sidebar navigasyon menüsünü oluşturan grup dizisi (Overview, Sipariş & Kargo, Hesap Yönetimi) — her grup `label` ve `items` (to, label, icon) içerir; `t()` ve `routes.*` methodları ile localize edilmiş href'ler ve çevrilmiş etiketler içerir
  - `shouldRender` — boolean; development modunda veya (`loading` false VE `user` mevcut) ise true — false ise bileşen null döner (yönlendirme beklenir)
- **Dönüş**: JSX layout yapısı — hesap sayfası için sidebar navigasyonu ve `{children}` içeriği içeren responsive layout; development modunda `user` null olsa bile render eder; prod'da kullanıcı yoksa `null` döner (effect içinde yönlendirme tetiklenir)

### [N2_NASIL] AST Pointer: src/views/account/AccountLayout.tsx::useEffect callback (anonymous)
- **params**: `(none)`
- **ic_degiskenler**:
  - `active` — let ile tanımlı boolean (başlangıç: true); cleanup fonksiyonunda false'a set edilerek bileşen unmount olduktan sonra state güncellemesini engeller (race condition koruması)
- **Dönüş**: yok (yan etki: development dışı ortamda kullanıcı yoksa `router.replace(routes.auth.login())` çağrısı ile login sayfasına yönlendirir; cleanup'ta `active` flag'ini false'a set eder)

### [N3_NASIL] AST Pointer: src/views/account/AccountLayout.tsx::navGroups.map callback — group mapper (anonymous)
- **params**: `(group, gi)` — `group`: `TabGroup` tipinde navigasyon grubu nesnesi (label ve items içerir); `gi`: grup indeks numarası (key olarak kullanılır)
- **ic_degiskenler**: (yok — JSX içinde `group.label` ve `group.items` doğrudan erişilir)
- **Dönüş**: JSX — her navigasyon grubu için `<div>` elemanı; grup başlığını (`group.label`) ve altındaki her navigasyon linkini (`group.items.map(...)`) render eder

### [N4_NASIL] AST Pointer: src/views/account/AccountLayout.tsx::group.items.map callback — tab mapper (anonymous)
- **params**: `(tab)` — `tab` nesnesi; `{ to: string, label: string, icon: JSX.Element }` yapısında tek bir navigasyon sekmesi
- **ic_degiskenler**:
  - `isActive` — boolean; `pathname === tab.to` karşılaştırmasıyla belirlenir — mevcut URL tab'ın href'i ile aynıysa true (aktif sekme stilini belirler)
- **Dönüş**: JSX — `<Link>` elemanı; `tab.to` href'ine, `tab.label` metnine, `tab.icon` ikonuna ve `isActive` durumuna göreconditional CSS class'ları ile navigasyon linki render eder

---

## NODE ID STANDARD

  file: src\views\account\AccountLayout.tsx
  function: src\views\account\AccountLayout.tsx::AccountLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountLayout

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-white`, `border-slate-200/60`, `group-hover:text-primary-navy`, `hover:bg-slate-100`, `hover:text-primary-navy`, `md:border-slate-200/60`, `text-2xl`, `text-slate-400`, `text-slate-600`, `text-slate-900`, `text-sm`, `text-white`, `text-xs`
- **Layout:** `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-3`, `gap-8`, `hidden`, `items-center`, `max-w-7xl`, `md:block`, `md:flex-col`, `md:flex-row`, `md:overflow-visible`, `md:p-8`, `md:shadow-sm`
- **Varyant/Responsive:** `:`, `group-hover:`, `hover:`, `lg:`, `md:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `${isActive`, `:`, `border`, `duration-200`, `font-bold`, `font-medium`, `hover:translate-x-0.5`, `lg:px-8`, `mb-2`, `md:border`, `md:shrink`, `md:space-y-0.5`, `mx-auto`, `no-scrollbar`, `px-1`