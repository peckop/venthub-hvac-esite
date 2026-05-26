---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\StickyHeader.tsx
skeleton_hash: 01238508f4af3cc3
generated_at: 2026-05-23T22:27:52Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun tüm kullanıcı sayfalarında sabit olarak görünen, dikey kaydırma hareketine göre otomatik olarak gizlenip görünen ana yapışkan başlık (StickyHeader) React bileşenini barındırır. Next.js tabanlı projeye özel olarak, kullanıcı kimlik bilgilerini, alışveriş sepeti verilerini ve gezinme durumunu özel hook'lar üzerinden alarak çalışır, doğrudan bu modülde herhangi bir özel ortam değişkeni kullanılmaz.
Başlık bileşeninin içinde kullanılan arama katmanı, mega menü ve kategori merkezi açılır pencereleri gibi alt bileşenleri de bünyesinde barındırarak tüm başlık işlevselliğini tek bir modülde toplar, tüm veri sorgularını import ettiği kimlik, sepet ve gezinme hook'ları üzerinden platformun arka uç API'lerinden gerçekleştirir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, HVAC projesi için geliştirilmiş, kullanıcı arayüzünde sabit duran başlık (Sticky Header) görevi gören bir React bileşenidir; sadece içerdiği SearchOverlay, MegaMenu ve CategoryHubOverlay alt bileşenlerinin proje içinde erişilebilir, uyumlu ve çalışır durumda olması koşuluyla başarılı şekilde çalışır.

[Aksiyom 1]: Eğer StickyHeader tarafından çağrılan SearchOverlay bileşeni proje içerisinde erişilebilir ve uygun şekilde export edilmiş değilse, modül derleme veya çalışma zamanı hatası alır, başlık bileşeni kullanıcı arayüzünde hiç render edilemez.
[Aksiyom 2]: Eğer StickyHeader tarafından çağrılan MegaMenu bileşeni proje içerisinde erişilebilir ve uygun şekilde export edilmiş değilse, modül derleme veya çalışma zamanı hatası alır, başlık üzerindeki ana gezinti (navigasyon) özelliği tamamen devre dışı kalır.
[Aksiyom 3]: Eğer StickyHeader tarafından çağrılan CategoryHubOverlay bileşeni proje içerisinde erişilebilir ve uygun şekilde export edilmiş değilse, modül derleme veya çalışma zamanı hatası alır, ürün kategorilerine erişim sağlayan başlık özelliği kullanılamaz hale gelir.
[Aksiyom 4]: Eğer çağrılan üç alt bileşen, StickyHeader ile aynı React ortamında çalışabilecek uyumlu bileşenler değilse, StickyHeader bileşeni arayüzde bozuk şekilde görünür, kullanıcı deneyimi tamamen bozulur.

---



---

## INTERFACES

### StickyHeaderProps
- `isScrolled: boolean`

---

## SABİTLER
- **SearchOverlay** (call) — `React.lazy(() => import('./SearchOverlay'))`
- **MegaMenu** (call) — `React.lazy(() => import('./MegaMenu'))`
- **CategoryHubOverlay** (call) — `React.lazy(() => import('./navigation/CategoryHubOverlay'))`
- **StickyHeader** (call) — `React.memo(function StickyHeader({ isScrolled }) {
  const { t, lang } = use...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_son_urunleri_yükle>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `raw` — `window.localStorage`'dan okunan 'recentProducts' anahtarındaki ham JSON metni
  - `setRecentProducts` — Parse edilen son ürün listesini component state'ine kaydetmek için kullanılan state setter fonksiyonu
- **Dönüş**: yok

### [N2_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_kullanici_menusu_dis_klik_listeleyici>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleClickOutside` — Kullanıcı menüsü dışına tıklandığında menüyü kapatan iç callback fonksiyonu
  - `userMenuRef.current` — Kullanıcı menüsü DOM elementine erişmek için kullanılan ref nesnesinin mevcut değeri
  - `closeUserMenu` — Açık olan kullanıcı menüsünü kapatmak için çağrılan state fonksiyonu
  - `event` — Mouse event nesnesi, tıklanan hedefi belirlemek için kullanılır
- **Dönüş**: cleanup fonksiyonu — Component unmount olduğunda mousedown event listener'ını kaldıran fonksiyon

### [N3_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleClickOutside
- **params**: (event: MouseEvent)
- **ic_degiskenler**:
  - `userMenuRef.current` — Kullanıcı menüsü DOM elementine erişmek için kullanılan ref değeri
  - `closeUserMenu` — Menü dışı tıklama durumunda kullanıcı menüsünü kapatmak için çağrılan fonksiyon
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_rol_ceviri>
- **params**: (role: string)
- **ic_degiskenler**:
  - `t` — Uluslararasılaştırma metinlerini çekmek için kullanılan çeviri fonksiyonu
  - Tüm case metinleri: `t('roles.super_admin')`, `t('roles.admin')`, vb. — Gelen rol koduna göre kullanıcıya gösterilecek yerel metinler
- **Dönüş**: string — Kullanıcının rolüne ait çevrilmiş, gösterime hazır metin

### [N5_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_scroll_progress_listeleyici>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `isScrolled` — Sayfanın kaydırılıp kaydırılmadığını kontrol eden boolean state değeri, koşulu başlatmak için kullanılır
  - `ticking` - Scroll olayını throttle etmek için kullanılan bayrak, aynı anda birden fazla hesaplama yapılmasını engeller
  - `handleScroll` - Scroll olayında tetiklenen, kaydırma oranını hesaplayan iç callback fonksiyonu
  - `winScroll` - Sayfanın dikey olarak kaç piksel kaydırıldığını tutan değişken
  - `height` - Sayfanın toplam kaydırılabilir yüksekliğini hesaplayan değişken
  - `scrolled` - Kaydırma yüzdesini tutan değişken, 0-100 arası değer alır
  - `setScrollProgress` - Hesaplanan kaydırma yüzdesini state'e kaydetmek için kullanılan state setter
- **Dönüş**: cleanup fonksiyonu — Component unmount olduğunda scroll event listener'ını kaldıran fonksiyon

### [N6_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_icin_handle_scroll>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ticking` - Scroll hesaplamasının devam edip etmediğini gösteren throttle bayrağı
  - `requestAnimationFrame` - Tarayıcının çizim döngüsüne uygun olarak hesaplama yapmak için kullanılan API
  - `winScroll` - Güncel dikey kaydırma miktarı
  - `height` - Toplam kaydırılabilir sayfa yüksekliği
  - `scrolled` - Hesaplanan kaydırma yüzdesi
  - `setScrollProgress` - Kaydırma yüzdesini state'e kaydeden setter fonksiyonu
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_requestanimationframe_callback>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `winScroll` - Güncel dikey kaydırma miktarı
  - `height` - Toplam kaydırılabilir sayfa yüksekliği
  - `scrolled` - Hesaplanan kaydırma yüzdesi, sıfıra bölünmeyi önleyen kontrol ile hesaplanır
  - `setScrollProgress` - Hesaplanan yüzdeyi state'e kaydeden setter
  - `ticking` - Throttle bayrağını sıfırlayarak bir sonraki scroll olayının hesaplanmasını açan değişken
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_global_klavye_listeleyici>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `handleGlobalKeyDown` - Klavye tuş basma olaylarını yakalayan iç callback fonksiyonu
  - `document.activeElement` - Odaklanmış olan DOM elementini, girdi alanı olup olmadığını kontrol etmek için kullanılır
  - `event` - Klavye olay nesnesi, basılan tuşu ve modifiye tuşlarını okumak için kullanılır
  - `openSearchOverlay` - Kısayol tuşu algılanığında arama arayüzünü açan fonksiyon
- **Dönüş**: cleanup fonksiyonu — Component unmount olduğunda keydown event listener'ını kaldıran fonksiyon

### [N9_NASIL] AST Pointer: src/components/StickyHeader.tsx::handleGlobalKeyDown
- **params**: (event: KeyboardEvent)
- **ic_degiskenler**:
  - `document.activeElement` - Odaklı DOM elementi, girdi alanıysa kısayol tetiklenmesini engellemek için kontrol edilir
  - `event.preventDefault` - Varsayılan tarayıcı davranışını engelleyen fonksiyon, arama açılırken slash tuşunun arama çubuğuna yazılmasını önler
  - `openSearchOverlay` - Geçerli kısayol tuşu girildiğinde arama arayüzünü açan fonksiyon
- **Dönüş**: yok

### [N10_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_kategori_hub_ac>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `trackEvent` - Kategori tıklamasını analiz için kaydeden olay takip fonksiyonu
  - `mode` - Tıklama olayının bağlamını belirten parametre, trackEvent ile birlikte gönderilir
  - `openCategoryHub` - Kategori arayüzünü açan state fonksiyonu
- **Dönüş**: yok

### [N11_NASIL] AST Pointer: src/components/StickyHeader.tsx::<async_cikis_yap>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `signOut` - Kimlik doğrulama servisinin çıkış yapan async fonksiyonu
  - `setManualLogout` - Kullanıcının manuel olarak çıkış yaptığını state'e kaydeden setter
  - `closeUserMenu` - Çıkış sonrası açık olan kullanıcı menüsünü kapatan fonksiyon
  - `router.push` - Next.js yönlendirme fonksiyonu, ana sayfaya yönlendirmek için kullanılır
  - `Routes.home()` - Ana sayfa yolunu döndüren rota helper fonksiyonu
- **Dönüş**: Promise<void>

### [N12_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_sayfa_on_yukle>
- **params**: (itemId: string)
- **ic_degiskenler**:
  - `prefetchProductsPage` - Ürünler sayfasını önyüklemek için çağrılan Next.js prefetch fonksiyonu, sadece itemId 'products' olduğunda tetiklenir
- **Dönüş**: yok

### [N13_NASIL] AST Pointer: src/components/StickyHeader.tsx::<anonim_kullanici_ui_render>
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `user` - Oturum açmış kullanıcı nesnesi, giriş durumu kontrolü için kullanılır
  - `isDevBypass` - Geliştirici modu bayrağı, oturum olmadan arayüzü test etmek için kullanılır
  - `userMenuRef` - Kullanıcı menüsü DOM elementine erişmek için kullanılan ref nesnesi
  - `toggleUserMenu` - Kullanıcı menüsünün açık/kapalı durumunu değiştiren fonksiyon
  - `isUserMenuOpen` - Kullanıcı menüsünün açık olup olmadığını tutan boolean state
  - `finalUserDisplayName` - Kullanıcıya gösterilecek tam isim, menü başlığında kullanılır
  - `finalHasPrivilegedRole` - Kullanıcının yetkili bir role sahip olup olmadığını belirten boolean, rol etiketi göstermek için kullanılır
  - `roleLabel` - Rol kodunu çeviren yardımcı fonksiyon
  - `userRole` - Kullanıcının sistemdeki rol kodu
  - `t` - Uluslararasılaştırma metinlerini çekmek için kullanılan çeviri fonksiyonu
  - `finalIsAdmin` - Kullanıcının admin paneline erişimi olup olmadığını belirten boolean, admin linkini göstermek için kullanılır
  - `handleSignOut` - Çıkış işlemini başlatan fonksiyon
  - Routes nesnesi metotları: `Routes.auth.login()`, `Routes.auth.register()`, `Routes.account.overview()`, `Routes.admin.dashboard()` — Sayfa yollarını döndüren rota helperları
- **Dönüş**: JSX.Element — Kullanıcının oturum durumuna göre giriş butonları veya kullanıcı menüsü arayüzünü döndürür

---

## NODE ID STANDARD

  file: src\components\StickyHeader.tsx

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** `shadow-[0_18px_35px_-20px_rgba(37,99,235,0.7)]`
- **height:** (yok)
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `transition-[opacity,transform]`, `transition-[transform,box-shadow]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-r`, `bg-white/95`, `border-b`, `border-slate-100`, `border-slate-200`, `from-primary-navy`, `text-left`, `text-slate-900`, `text-sm`, `text-steel-gray`, `text-white`, `text-xs`, `to-secondary-blue`
- **Layout:** `-right-2`, `-top-2`, `absolute`, `backdrop-blur-md`, `block`, `flex`, `flex-1`, `from-primary-navy`, `gap-1.5`, `gap-2.5`, `gap-3`, `h-16`, `h-5`, `h-8`, `hidden`
- **Responsive:** `lg:`, `md:`, `sm:`, `xl:` prefix kullanımları
