---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\account\AccountLayout.tsx
skeleton_hash: 9f2e77cc37fa3add
entity_hashes:
  func:AccountLayout: a90ed56764b85b28
  overview: c9fc556dd386a0a0
  style_tokens: cca55516cfe981ad
generated_at: 2026-08-27T06:50:17Z
---

## Genel Bakış
AccountLayout, hesap (account) ile ilgili sayfalar için bir düzen (layout) bileşenidir. Alt bileşenlerini (children) sararak sayfalara ortak bir yapı sağlar. Modül tek bir dışa aktarılan bileşenden oluşur ve bağımsız bir yapı sunar.

## Fonksiyon Grupları

### Ana Layout Bileşeni
Hesap sayfalarının üstünde yer alan ortak düzeni tanımlar ve kendisine aktarılan alt bileşenleri bu düzen içinde görüntüler.
- AccountLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Not:** Yalnızca fonksiyon imzası (`AccountLayout({ children }: { children?: React.ReactNode })`) verilmiştir; fonksiyon gövdesi sağlanmadığından, gövdeden türetilecek mimari varsayım üretilememektedir.

---

## FONKSİYON DETAYLARI

### AccountLayout
**Ne yapar**: Kullanıcı hesap sayfaları için ortak düzen (layout) sağlayan bir React fonksiyonel bileşenidir. Sol tarafta navigasyon menüsü (sidebar), sağ tarafta ise alt bileşenlerin (`children`) render edildiği bir içerik alanı oluşturur. Oturum açılmamış kullanıcıları giriş sayfasına yönlendirir.

**Nasıl yapar**: Beş adet React hook kullanarak uygulama durumunu alır: `useRouter` ile Next.js yönlendirme nesnesini, `useI18n` ile uluslararasılaştırma fonksiyonunu (`t`), `useLocalizedRoutes` ile dil-önekli rota tanımlarını, `useAuth` ile kullanıcı bilgisini (`user`) ve yükleme durumunu (`loading`), `usePathname` ile mevcut URL yolunu elde eder. `navGroups` adında bir dizi oluşturur; bu dizi, her biri bir `label` ve `items` dizisi içeren nesnelerden oluşur. Her `item` nesnesi bir rota (`to`), etiket (`label`) ve ikon (`icon`) içerir. Rota değerleri `routes` proxy nesnesinden çağrılır; bu sayede href'ler dil-önekli olur ve aktif sekme kontrolü (`pathname === tab.to`) dil-önekli pathname ile eşleştirilir. `useEffect` içinde, geliştirme ortamı dışında (`process.env.NODE_ENV !== 'development'`) kullanıcı oturum açmamışsa (`!loading && !user`) giriş sayfasına `router.replace` ile yönlendirme yapılır; cleanup fonksiyonu ile `active` bayrağı kapatılır. `shouldRender` değişkeni geliştirme modunda her zaman `true` olur; diğer ortamlarda yükleme tamamlanmış ve kullanıcı mevcut ise `true` döner. `shouldRender` `false` ise bileşen `null` döner. Aksi halde, mobilde yatay kaydırılabilir, masaüstünde dikey bir sidebar ve esnek genişlikte bir içerik alanı render eder. Sidebar içinde her navigasyon grubu başlık ve linkler olarak listelenir; mevcut pathname ile eşleşen link aktif stil ile vurgulanır.

**Parametreler**:
- children: `React.ReactNode` — Bileşenin içerik alanında render edilecek alt bileşenler. Opsiyoneldir; belirtilmezse içerik alanı boş kalır.

**Dönüş**: Belirtilmemiş. Bileşen, `shouldRender` `false` olduğunda `null`, aksi halde JSX yapısı döndürür. Kesin dönüş tipi kaynakta tanımlanmamıştır.

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
- **params**: `children` — React.ReactNode tipinde, opsiyonel; layout bileşeninin içeriğini temsil eder
- **ic_degiskenler**:
  - `router` — `useRouter()` hook'undan dönen Next.js router nesnesi; sayfa yönlendirmelerinde kullanılır
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; metinlerin yerelleştirilmesinde kullanılır
  - `routes` — `useLocalizedRoutes()` hook'undan dönen localize edilmiş rotalar proxy nesnesi; dil-önekli URL'lerin oluşturulmasında kullanılır
  - `user` — `useAuth()` hook'undan dönen kullanıcı bilgisi; oturum durumunun kontrolünde kullanılır
  - `loading` — `useAuth()` hook'undan dönen yükleme durumu; auth işleminin tamamlanıp tamamlanmadığını belirtir
  - `pathname` — `usePathname()` hook'undan dönen mevcut URL yolu; aktif sekme kontrolünde kullanılır
  - `navGroups` — TabGroup tipinde dizi; sidebar navigasyon yapısını tanımlar, her grup `label` ve `items` alanlarından oluşur
  - `shouldRender` — boolean; geliştirme modunda veya kullanıcı oturum açmışsa true, aksi halde false; bileşenin render edilip edilmeyeceğini belirler
  - `active` — useEffect içinde tanımlanan boolean bayrak; bileşen unmount olduğunda false yapılır, yönlendirme işleminin iptalinde kullanılır
  - `group` — navGroups.map callback'indeki her bir TabGroup nesnesi; `label` ve `items` alanlarına erişilir
  - `gi` — navGroups.map callback'indeki grup indeksi; key prop'u olarak kullanılır
  - `tab` — group.items.map callback'indeki her bir sekme nesnesi; `to`, `label`, `icon` alanlarına erişilir
  - `isActive` — boolean; `pathname === tab.to` karşılaştırmasıyla belirlenir; sekmenin aktif olup olmadığını belirler, CSS sınıflarının seçiminde kullanılır
- **Dönüş**: JSX elementi (React.ReactNode); sidebar ve main content alanını içeren layout yapısı, `shouldRender` false ise null döner

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