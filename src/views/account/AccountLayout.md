---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx
skeleton_hash: 169762df22609c8d
entity_hashes:
  func:AccountLayout: 3732e58c82b2882b
  overview: e42f2d8bdcf12925
  style_tokens: cca55516cfe981ad
generated_at: 2026-05-28T22:39:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki hesap yönetim arayüzünün temel yapısını oluşturan React layout bileşenidir. Tek başına bir düzen (layout) sağlama sorumluluğuna sahiptir ve hesap bölümündeki tüm alt sayfaların tutarlı bir şekilde sunulmasını garanti eder.

## Fonksiyon Grupları
### Ana Hesap Düzeni Bileşeni
Hesap bölümündeki tüm sayfaların ortak çerçeve yapısını ve düzenini tanımlayan temel layout bileşenidir.
- AccountLayout

---

## AXIOMS – Mimari Varsayımlar
Bu modül için, fonksiyon imzasından ve modül yapısından çıkarılabilen temel aksiyomlar aşağıdadır. Fonksiyon gövdesine erişim olmadığından, yalnızca imza tabanlı çıkarımlar yapılmıştır.

**[Aksiyom 1]**: Eğer `children` prop'u sağlanmazsa (undefined/null olarak传递 edilir), bileşen yine de hata vermeden render edilmeli ve boş bir hesap düzeni çerçevesi döndürmelidir — çünkü `children` parametresi `?` (opsiyonel) olarak imzalanmıştır.

**[Aksiyom 2]**: Eğer `children` prop'u sağlanırsa, bu değer `React.ReactNode` tipinde olmalıdır. Eğer farklı bir tip (örn: boolean, number)传递 edilirsa, React'ın çalışma zamanı (runtime) davranışı devreye girer ve tip uyumsuzluğu oluşur.

**[Aksiyom 3]**: Eğer React runtime ortamı (React kütüphanesi ve JSX dönüştürücüsü) mevcut değilse, bu bileşen hiç render edilemez; modülün çalışması için React 18+ çalışma zamanı ortamının var olması gerekir.

---

**Not**: Modül içinde herhangi bir sabit, koşul kontrolü, eşik değeri veya iş mantığı (fonksiyon gövdesi) bulunmadığından, alan-spesifik (domain-specific) aksiyon tanımı yapılamamıştır. Bileşen salt bir *wrapper layout* olarak tasarlanmıştır.

---

## FONKSİYON DETAYLARI

### AccountLayout

**Ne yapar**: Kullanıcının hesap yönetim sayfaları için ortak düzen (layout) bileşenidir. Sol tarafta gezinme menüsü (sidebar) ve sağ tarafta sayfa içeriği olmak üzere iki sütunlu bir yapı oluşturur. Tüm hesap alt sayfaları bu düzen içinde render edilir.

**Nasıl yapar**: Bileşen, Next.js'in `useRouter` ve `usePathname` hook'larını kullanarak yönление ve mevcut yol bilgisini alır. `useI18n` ile çok dilli etiketleri, `useAuth` ile oturum durumunu çözer. Üç ana gezinme grubu tanımlar: Özet, Sipariş & Kargo ve Hesap Yönetimi. Geliştirme ortamı dışında oturum açmamış kullanıcıları giriş sayfasına yönlendirir. Mevcut yol ile eşleşen menü öğesini aktif olarak stillendirir.

**Parametreler**:
- `children`: `React.ReactNode` (opsiyonel) — Layout içinde render edilecek alt sayfa bileşenleri. Bu prop, hangi hesap alt sayfasının görüntüleneceğini belirler.

**Dönüş**: `JSX.Element` — Hesap sayfalarının ortak düzenini oluşturan React bileşeni. Sidebar gezinme menüsü ve ana içerik alanını içeren tam sayfa düzenini döndürür.

**Ek Notlar**:

- **NavGroups Yapısı**: Üç gruptan oluşan menü sistemi tanımıştır:
  - *Özet*: Hesap özeti sayfası
  - *Sipariş & Kargo*: Siparişler, Kargo Takibi, İadeler sayfaları
  - *Hesap Yönetimi*: Kişisel Bilgiler, Adreslerim, Fatura Bilgileri, Güvenlik sayfaları

- **Aktif Sayfa Belirleme**: `pathname === tab.to` karşılaştırmasıyla mevcut URL ile eşleşen menü öğesi `bg-primary-navy` arka plan rengi ve beyaz metin ile vurgulanır.

- **Oturum Kontrolü**: `useEffect` hook'u içinde `loading` ve `user` durumuna göre kontrol yapılır. Geliştirme modunda (`NODE_ENV === 'development'`) bu kontrol atlanarak oturum olmadan bile sayfa render edilebilir. Aktif flag ile memory leak önlenir.

- **Responsive Tasarım**: Mobil cihazlarda yatay kaydırılabilir menü, masaüstünde dikey sidebar olarak görüntülenir. `md:` breakpoint'leri ile duyarlı düzen geçişleri sağlanır.

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
- **params**: ({ children }: { children?: React.ReactNode })
- **ic_degiskenler**:
  - `router` — useRouter hook'undan gelen Next.js yönlendirici nesnesi, oturum açılmamış kullanıcıları login sayfasına yönlendirmek için kullanılır
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, navigasyon etiketlerini ve başlıkları çok dilli olarak almak için kullanılır
  - `user` — useAuth hook'undan gelen mevcut kullanıcı nesnesi (null olabilir), oturum durumunu belirler
  - `loading` — useAuth hook'undan gelen boolean, oturum bilgisi yüklenirken true'dur
  - `pathname` — usePathname hook'undan gelen mevcut URL yolu stringi, aktif menü öğesini belirlemek için kullanılır
  - `navGroups` — Hesap düzeninin sol sidebar navigasyon menüsünü oluşturan TabGroup[] dizisi, üç grup (Özet, Sipariş & Kargo, Hesap Yönetimi) içerir
  - `active` — useEffect cleanup fonksiyonu için boolean flag, component unmount olduğunda false yapılarak state güncellemesi engellenir
  - `shouldRender` — Render koşulunu belirleyen boolean, geliştirme modunda true veya user yüklenmiş ve mevcutsa true döner
  - `group` — navGroups.map callback parametresi, mevcut navigasyon grubu nesnesi (label ve items içerir)
  - `gi` — navGroups.map callback parametresi, grubun indeks numarası (number), key olarak kullanılır
  - `tab` — group.items.map callback parametresi, bireysel navigasyon öğesi (to, label, icon içerir)
  - `isActive` — pathname === tab.to karşılaştırması sonucu oluşan boolean, mevcut sayfanın bu tab'a karşılık gelip gelmediğini belirler
- **Dönüş**: JSX (React.ReactNode) — Hesap düzeninin tam sayfa layout'unu döndürür, sol tarafta sticky sidebar (navigasyon menüsü) ve sağ tarafta ana içerik bölgesi (children) içerir; ayrıca useEffect ile oturum kontrolü yan etkisi vardır (geliştirme modu dışında user yoksa login'e yönlendirir)

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