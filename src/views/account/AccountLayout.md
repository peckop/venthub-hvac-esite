---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx
skeleton_hash: e4c1bf353b1ae29d
entity_hashes:
  func:AccountLayout: 3732e58c82b2882b
  overview: 9ee83d10d025d2f2
  style_tokens: cca55516cfe981ad
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki hesap yönetim arayüzünün temel yapısını oluşturan React layout bileşenidir. Hesap bölümündeki tüm alt sayfaların tutarlı bir şekilde sunulmasını sağlayan çerçeve düzenini (wrapper layout) tanımlar.

## Fonksiyon Grupları
### Ana Hesap Düzeni Bileşeni
Hesap bölümündeki tüm sayfaların ortak çerçeve yapısını ve düzenini tanımlayan temel layout bileşenidir. İsteğe bağlı olarak içeriğe sahip olabilir ve hesap sayfalarını saran bir konteyner görevi görür.
- AccountLayout

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC projesindeki hesap yönetim arayüzünün temel yapısını oluşturan bir React layout (düzen) bileşeni olan `AccountLayout`'ı tanımlar. Fonksiyon gövdesi verilmediği için, aksiyomlar fonksiyon imzası ve eski dokümanın genel bakış açıklaması referans alınarak üretilmiştir.

**Aksiyom 1:** Eğer `AccountLayout` bileşeni, `children` prop'u ile çağrılmazsa, hesap yönetim sayfalarının içeriği render edilemez.

**Aksiyom 2:** Eğer `AccountLayout` bileşeni, hesap bölümündeki bir alt sayfa (örn: profil, şifre değiştirme) tarafından kullanılmazsa, sayfa tutarlı bir çerçeve düzeni içinde sunulamaz.

**Aksiyom 3:** Eğer `AccountLayout` bileşeni, React ortamında doğru bir layout konteyneri olarak uygulanmazsa, hesap arayüzünün farklı sayfaları arasında görsel ve yapısal tutarlılık sağlanamaz.

**Aksiyom 4:** Eğer `AccountLayout` bileşeni, `children` olarak geçilen React düğümlerini (`React.ReactNode`) doğru şekilde işleyip render etmezse, iç sayfa içerikleri ekranda görüntülenemez.

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

### [N1_NASIL] AST Pointer: `src\views\account\AccountLayout.tsx`::AccountLayout
- **params**: `{ children }` — React.ReactNode tipinde opsiyonel children prop'u, hesap sayfalarının ana içerik alanını oluşturur
- **ic_degiskenler**:
  - `router` — Next.js useRouter hook'undan dönen router nesnesi, sayfa yönlendirmeleri için kullanılır
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, çok dilli metinleri döndürür
  - `user` — useAuth hook'undan dönen mevcut kullanıcı nesnesi, kimlik doğrulama durumunu gösterir
  - `loading` — useAuth hook'undan dönen boolean, kimlik doğrulama yüklenme durumunu gösterir
  - `pathname` — usePathname hook'undan dönen mevcut URL yolu, aktif navigasyon belirlemek için kullanılır
  - `navGroups` — TabGroup[] tipinde dizi, hesap sayfası navigasyon menüsünü tanımlar (3 grup: Özet, Sipariş & Kargo, Hesap Yönetimi)
  - `active` — React.useEffect içindeki boolean, effect temizleme işlemini kontrol eder
  - `shouldRender` — boolean, component'in render edilip edilmeyeceğini belirler (development modu veya kimlik doğrulama durumuna göre)
- **Dönüş**: JSX element — hesap sayfası düzenini döndürür (sidebar navigasyon ve ana içerik alanı)

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