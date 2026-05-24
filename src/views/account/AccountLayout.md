---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx
skeleton_hash: 169762df22609c8d
generated_at: 2026-05-23T22:35:48Z
---

## Genel Bakış
VentHub HVAC projesinin kullanıcı hesap yönetimi bölümünde kullanılan bu React modülü, hesap alanı altındaki tüm sayfalar için ortak bir paylaşılan düzen sağlar. Sadece kendisine aktarılan içerik bileşenlerini alarak bu içerikleri hesap bölümü için standartlaştırılmış bir arayüz çerçevesi içinde sunar, tüm hesap sayfalarında tutarlı bir kullanıcı deneyimi oluşturulmasına olanak tanır.

## Fonksiyon Grupları
### Ana Hesap Düzeni Yönetimi
Hesap bölümü altındaki tüm sayfaların ortak arayüz altyapısını yöneten tek ana bileşen içerir, aktarılan sayfa içeriklerini standart hesap düzenine dahil ederek ekrana sunulmasını sağlar.
- AccountLayout

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı hesap bölümü düzen (layout) modülünün çalışması, modern React runtime ortamının varlığına, bileşene geçilen prop'ların geçerli formatta olmasına ve modülün kullanıldığı yerlerde doğru şekilde entegre edilmesine bağlıdır.

[Aksiyom 1]: Eğer React 16.8 ve üzeri React runtime ortamı yoksa, AccountLayout bileşeni hiçbir şekilde render edilemez, hesap bölümü uygulamada görüntülenemez.
[Aksiyom 2]: Eğer bileşene geçilen children prop'u (varsa) geçerli React.ReactNode tipinde bir değer değilse, hesap bölümünün içeriği boş görüntülenir veya uygulamada runtime hatası fırlatılır.
[Aksiyom 3]: Eğer AccountLayout bileşeni, onu kullanan rota yapısı veya parent bileşen tarafından doğru şekilde import edilip kullanılmazsa, tüm hesap alt sayfaları yüklenemez, uygulama içerik görüntüleme veya yönlendirme hatası alır.
[Aksiyom 4]: Eğer çalıştığı ortamda React'in DOM'a mount işlemleri için gerektirdiği temel DOM API'leri yoksa, bu layout bileşeni DOM'a eklenemez, hiçbir içeriği kullanıcıya sunulamaz.

---

## FONKSIYON DETAYLARI

### AccountLayout
**Ne yapar**: VentHub HVAC projesinin hesap yönetimi modülündeki tüm alt sayfalar için ortak ana düzen (layout) sağlayan bir React bileşenidir. Hesapla ilgili tüm sayfalarda tutarlı bir yapı sunmak üzere tasarlanmış, içerisine aldığı çocuk bileşenleri sarmalayan ana düzen bileşenidir.
**Nasıl yapar**: Kendisine iletilen içerikleri children prop'u üzerinden alır, bu içerikleri hesap sayfaları için belirlenen ortak standart düzen yapısı içerisinde kullanıma sunmak üzere render eder. Tüm hesap alt sayfalarının aynı temel üs yapıyı kullanmasını sağlayarak kod tekrarının önüne geçer, kullanıcı deneyiminde tutarlılık oluşturur.
**Parametreler**:
- name: children, type: React.ReactNode — Hesap düzeni bileşeninin içerisinde gösterilecek olan alt sayfa içerikleri, React elementleri veya metin gibi tüm render edilebilir değerleri temsil eden opsiyonel bir parametredir. Tanımında opsiyonel olarak işaretlendiği için herhangi bir değer iletilmeden de bileşen kullanılabilir.
**Dönüş**: Orijinal kod tanımında return tipi void veya bilinmiyor olarak belirtilmiştir. Bir React bileşeni olarak çalıştığı için tarayıcı DOM'ına işlenmek üzere ReactNode türünde bir render çıktısı üretir.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx::AccountLayout
- **params**: children?: React.ReactNode
- **ic_degiskenler**:
  - `router` — Next.js yönlendirme işlemleri için useRouter hook'u ile alınan yönlendirici nesnesi
  - `t` — useI18n hook'u ile alınan çok dilli metin çeviri fonksiyonu
  - `user` — useAuth hook'undan dönen oturum açmış kullanıcı nesnesi
  - `loading` — useAuth hook'undan dönen kimlik doğrulama yükleme durumu bayrağı
  - `pathname` — usePathname hook'u ile alınan mevcut aktif sayfa yolu
  - `navGroups` — Hesap sayfası kenar çubuğu menü gruplarını, her grubun etiketini ve alt menü öğelerini içeren TabGroup tipi dizi
  - `shouldRender` — Sayfa içeriğinin render edilip edilmeyeceğini kontrol eden boolean, geliştirme modunda veya kullanıcı doğrulanmışsa true olur
- **Dönüş**: Hesap sayfası ana layoutunu oluşturan JSX.Element (React DOM ağacı)

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx::useEffect cleanup callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `active` — Etkinliğin devam edip etmediğini izleyen bayrak, cleanup fonksiyonu ile false yapılır
  - `process.env.NODE_ENV` — Uygulama çalışma ortamını belirten ortam değişkeni, geliştirme modunda yetkilendirme kontrolünü atlamak için kullanılır
  - `loading` — Üst kapsamdaki kimlik doğrulama yükleme durumu bayrağı
  - `user` — Üst kapsamdaki oturum açmış kullanıcı nesnesi
  - `router` — Üst kapsamdaki Next.js yönlendirici nesnesi
  - `Routes.auth.login()` — Giriş sayfası rotasını döndüren sabit rota yardımcı fonksiyonu
- **Dönüş**: Geliştirme modunda erken return (void), prodüksiyon modunda cleanup fonksiyonu () => { active = false }

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx::navGroups.map iterator callback
- **params**: group: TabGroup, gi: number
- **ic_degiskenler**:
  - `group` — Iterasyon sırasındaki mevcut menü grubu nesnesi
  - `gi` — Menü grubu iterasyon indeksi, React listeleri için key olarak kullanılır
  - `group.label` — Mevcut menü grubunun başlık metni
  - `group.items` — Mevcut menü grubuna ait alt menü öğeleri dizisi
  - `pathname` — Üst kapsamdaki mevcut aktif sayfa yolu
  - `isActive` — Menü öğesinin aktif sayfa ile eşleşip eşleşmediğini belirten boolean
  - `tab` — group.items.map sırasındaki her bir alt menü öğesi nesnesi
  - `tab.to` — Menü öğesinin yönlendireceği rota adresi
  - `tab.icon` — Menü öğesinde gösterilecek ikon JSX'i
  - `tab.label` — Menü öğesinin kullanıcıya görünen metni
- **Dönüş**: Her menü grubu için oluşturulan JSX.Element

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\account\AccountLayout.tsx::group.items.map iterator callback
- **params**: tab: { to: string, label: string, icon: JSX.Element }
- **ic_degiskenler**:
  - `tab` — Iterasyon sırasındaki mevcut alt menü öğesi nesnesi
  - `isActive` — Mevcut menü öğesinin aktif olup olmadığını kontrol eden boolean, pathname ile tab.to eşleştiğinde true olur
  - `pathname` — Üst kapsamdaki mevcut aktif sayfa yolu
  - `tab.to` — Menü öğesinin yönlendireceği rota, Next.js Link bileşeninin href özelliği olarak kullanılır
  - `tab.icon` — Menü öğesinde gösterilecek ikon JSX'i
  - `tab.label` — Menü öğesinin kullanıcıya görünen metni
- **Dönüş**: Her menü öğesi için oluşturulan Next.js Link bileşeni içeren JSX.Element

---

## NODE ID STANDARD

  file: src\views\account\AccountLayout.tsx
  function: src\views\account\AccountLayout.tsx::AccountLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccountLayout