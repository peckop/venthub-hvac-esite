---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\account\AccountLayout.tsx
skeleton_hash: b182d90c1816c241
entity_hashes:
  func:AccountLayout: d74165b236ff98dd
  overview: ac10e2f6406037ae
  style_tokens: cca55516cfe981ad
generated_at: 2026-08-16T11:28:52Z
---

## Genel Bakış
VentHub projesindeki hesap yönetim arayüzünün temel yapısını oluşturan bir React layout bileşenidir. Bu bileşen, sol tarafta gezinme侧bar menüsünü ve sağ tarafta sayfa içerik alanını sunarak tüm hesap sayfalarına tutarlı bir çerçeve sağlar. Ek olarak, oturum kontrolü yaparak yetkisiz erişimleri login sayfasına yönlendirir ve tüm rota bağlantılarını dil-önekli çalışacak şekilde yönetir.

## Fonksiyon Grupları
### Ana Hesap Düzeni Bileşeni
Hesap yönetim arayüzünün genel yerleşim düzenini, gezinme侧bar'ını ve sayfa içerik alanını tanımlayan ana layout bileşenidir. Oturum durumuna göre erişim kontrolü yapar ve kullanıcıyı uygun sayfaya yönlendirerek uygulama güvenliğini sağlar.
- AccountLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, hesap yönetim arayüzünün çerçeve düzenini (layout wrapper) tanımlayan basit bir sunum bileşenidir. Fonksiyon gövdesinden çıkarılabilecek sınırlı sayıda mimari varsayım mevcuttur.

---

**[Aksiyom 1]:** Eğer `react-router-dom` kütüphanesi (`Link` bileşeni) yoksa, sidebar'daki gezinti linkleri çalışmaz ve kullanıcı hesap alt sayfaları arasında navigasyon yapamaz.

**[Aksiyom 2]:** Eğer `children` prop'u sağlanmazsa bileşen yine de render edilir, ancak ana içerik alanı (`<main>`) boş görünür — bu durum bileşenin **bileşik yapıya (composition) dayalı** olduğunu doğrular.

**[Aksiyom 3]:** Eğer Tailwind CSS yapılandırması (tailwind.config) eksik veya yanlışsa, layout'un tüm görsel düzeni (flex layout, padding, gap, renkler, yükseklik) bozulur; bileşen işlevsel olarak çalışsa bile görsel olarak tutarsız görünür.

**[Aksiyom 4]:** Sidebar'daki gezinti rotaları (`/account/profile`, `/account/orders`, `/account/addresses`) hardcoded olarak tanımlıdır — bu rotaların uygulama içinde tanımlı ve erişilebilir olması gerekir; aksi halde kullanıcılar 404 hatası alır.

---

*Not: Bu bileşen iş mantığı (business logic), state yönetimi veya API çağrısı içermediğinden, fonksiyon gövdesinden üretilebilecek mimari aksiyomlar sınırlıdır. Bileşen tamamen yapısal (structural) ve sunumsal (presentational) bir role sahiptir.*

---

## FONKSİYON DETAYLARI

### AccountLayout
**Ne yapar**: Bu bileşen, kullanıcının hesap sayfaları için ortak bir düzen (layout) sağlar. Kimlik doğrulaması kontrolü yapar, kullanıcı oturum açmamışsa giriş sayfasına yönlendirir, sol tarafta gezinme menüsünü ve sağ tarafta ana içerik alanını oluşturur.

**Nasıl yapar**:
1.  **Hook Kullanımı**: `useRouter`, `useI18n`, `useLocalizedRoutes`, `useAuth` ve `usePathname` hook'larını kullanarak sırasıyla yönlendirme, uluslararasılaştırma, lokalize edilmiş rotalar, kimlik durumu ve geçerli URL yolunu elde eder.
2.  **Oturum Kontrolü**: `useEffect` hook'u içinde, geliştirme modu dışında, kullanıcı oturumu (`user`) yüklenmemiş (`loading` false ve `user` null) ise otomatik olarak giriş sayfasına (`routes.auth.login()`) yönlendirme yapar. Bu yönlendirme bir kez çalışır ve bağımlılık dizisindeki değişikliklere tepki verir.
3.  **Gezinme Menüsü Oluşturma**: `navGroups` adlı bir dizi içinde, hesapsayfası gezinme menüsünün gruplarını ve her gruba ait sekmeleri tanımlar. Her sekmenin URL'si (`to`) `useLocalizedRoutes` proxy'sinden, metinleri ise `useI18n` (`t`) fonksiyonu ile yerelleştirilir. Bu, href'lerin ve aktif-sekme kontrolünün (`pathname === tab.to`) dil-önekli olmasına olanak tanır.
4.  **Aktif Sekme Belirleme**: Mevcut sayfa yolu (`pathname`) ile her sekmenin `to` değeri karşılaştırılarak aktif olan belirlenir ve ilgili stil uygulanır.
5.  **Koşullu Renderlama**: Geliştirme modunda (`process.env.NODE_ENV === 'development'`) kullanıcı null olsa bile bileşen render edilir. Üretim modunda ise kullanıcı yüklenene ve oturum açılana kadar hiçbir şey render edilmez (`null` döner).

**Parametreler**:
-   `children`: `React.ReactNode` — Bu layout bileşeninin içinde render edilecek olan alt sayfa içerikleri. `?` işareti ile opsiyonel olduğu belirtilmiştir.

**Dönüş**: `React.JSX.Element` — Hesap sayfasının düzenini oluşturan JSX yapısı. İçerisinde bir `div` sarmalayıcısı, sol tarafta (`aside`) bir kenar çubuğu (navigate menüsü) ve sağ tarafta (`main`) `children` prop'unun render edileceği bir içerik alanı bulunur. Kenar çubuğunda `navGroups` dizisi kullanılarak gruplandırılmış, ikonlu ve dil-önekli linklerden oluşan bir menü oluşturulur. Tüm metinler `useI18n` ile yerelleştirilmiştir.

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

### [N1_NASIL] AST Pointer: src\views\account\AccountLayout.tsx::AccountLayout
- **params**: (`children`: React.ReactNode | undefined)
- **ic_degiskenler**:
  - `router` — useRouter hook'undan alınan Next.js router nesnesi, programlı yönlendirme için kullanılır
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, dil-önekli metinleri getirir
  - `routes` — useLocalizedRoutes hook'undan alınan yerelleştirilmiş rota proxy nesnesi, SSOT olarak href'leri üretir
  - `user` — useAuth hook'undan alınan mevcut kullanıcı nesnesi (null veya auth verisi)
  - `loading` — useAuth hook'undan alınan boolean, oturum durumu henüz yükleniyorsa true
  - `pathname` — usePathname hook'undan alınan mevcut URL yolu string'i, aktif sekme kontrolünde kullanılır
  - `navGroups` — TabGroup[] türünden dizi, hesap gezinme menüsünü gruplar ve sekmeler halinde tutar
  - `active` — useEffect içindeki boolean, cleanup fonksiyonu için bileşen hala mounted mı kontrolü
  - `shouldRender` — boolean, geliştirme modunda veya kullanıcı giriş yapmışsa true; bileşenin render edilip edilmeyeceğini belirler
- **Dönüş**: React.ReactNode (veya null) — Hesap düzenini gösteren JSX veya koşullu olarak null

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