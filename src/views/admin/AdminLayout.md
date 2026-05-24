---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\admin\AdminLayout.tsx
skeleton_hash: f9a4b14f366ee150
generated_at: 2026-05-23T22:37:23Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin yönetici (admin) arayüzünün temel düzen yapısını oluşturan bir React bileşeni barındırıyor. Tüm admin sayfalarında ortak olarak kullanılan ana düzeni sağlayarak, her sayfaya ait içerikleri bu ortak düzenin içerisinde sunuyor.

## Fonksiyon Grupları
### Ana Admin Düzen Bileşeni
Yönetici paneli tüm sayfaları için ortak ana düzen yapısını oluşturan tek sorumlu grup, içerik olarak iletilen alt sayfa bileşenlerini bu ortak düzenin içine yerleştirerek çalışır.
- AdminLayout

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı yönetim paneli layout bileşeni, sadece yetkilendirilmiş admin kullanıcılarının eriştiği uygulama içi yönetim rotalarında içerikleri sarmalamak üzere tasarlanmıştır, çalışması için tek aldığı parametre olan children prop'unun geçerli bir React tarafından render edilebilir öğe olması zorunludur.

[Aksiyom 1]: Eğer AdminLayout bileşenine geçerli, React tarafından render edilebilir bir children prop'u iletilmezse, yönetim paneli içerikleri kullanıcıya gösterilemez, boş bir yönetim paneli arayüzü ortaya çıkar.
[Aksiyom 2]: Eğer bu bileşen sadece yetkilendirilmiş admin yetkisine sahip kullanıcıların erişebildiği rotalarda kullanılmazsa, yetkisiz kullanıcıların yönetim paneli arayüzüne erişme riski oluşur.
[Aksiyom 3]: Eğer uygulama rota yönetimi tarafından bu layout kapsamındaki tüm yönetim rotalarına erişim öncesi admin yetki kontrolü gerçekleştirilmezse, modülün erişimi kısıtlamak amacıyla kullanılma gerekliliği tam olarak karşılanamaz.

---

## FONKSIYON DETAYLARI

### AdminLayout
**Ne yapar**: VentHub HVAC projesinin admin paneli için tüm admin sayfalarında ortak olarak kullanılan temel düzen (layout) bileşenidir. Admin arayüzünün paylaşılan iskeletini oluşturur, kendisine iletilen sayfaya özel içerikleri bu düzenin içerisinde render ederek tüm admin sayfaları için tutarlı bir görünüm ve kullanıcı deneyimi sunar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak çalışır, kendisine prop olarak iletilen çocuk içeriklerini kendi sabit düzen yapısının içerisine yerleştirir. Tüm admin rotaları altında değişmeyen ortak arayüz öğelerini kendi bünyesinde barındırarak her admin sayfasında bu öğelerin ayrı ayrı tanımlanmasını gereksiz kılar, kod tekrarını önler.
**Parametreler**:
- name: children, type: React.ReactNode | opsiyonel — AdminLayout tarafından sağlanan ortak düzenin içerisine yerleştirilecek olan, her admin sayfasına özel React tarafından işlenebilen her türlü içerik (bileşen, metin, DOM elementleri vb.)
**Dönüş**: React tarafından DOM'a eklenmeye uygun bir JSX elementi döndürür. Bu dönen değer, admin paneli için tasarlanmış tüm ortak düzen öğelerini ve kendisine iletilen children prop'undaki sayfaya özel içeriği bir arada barındırır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::AdminLayout
- **params**: [`children` — Sayfa içeriğini içeren opsiyonel React düğümü]
- **ic_degiskenler**:
  - `sidebarOpen` — Kenar çubuğunun açık/kapalı durumunu tuten durum değişkeni
  - `setSidebarOpen` — Kenar çubuğu durumunu güncellemek için kullanılan state setter fonksiyonu
  - `pathname` — usePathname hook'undan alınan mevcut uygulama yolu
  - `user` — useAuth hook'undan alınan oturum açmış kullanıcı nesnesi
  - `authLoading` — useAuth hook'undan alınan kimlik doğrulama yükleme durumu bayrağı
  - `role` — useRole hook'undan alınan kullanıcının sistem rolü
  - `canAccess` — useRole hook'undan alınan rotalara erişim iznini kontrol eden fonksiyon
  - `roleLoading` — useRole hook'undan alınan rol yükleme durumu bayrağı
  - `router` — useRouter hook'undan alınan Next.js yönlendirme nesnesi
  - `t` — useI18n hook'undan alınan çok dilli çeviri fonksiyonu
  - `loading` — Kimlik doğrulama ve rol yükleme durumlarının toplam yükleme bayrağı
  - `isEmailAdmin` — Kullanıcının e-posta adresiyle yönetici olup olmadığını kontrol eden sonuç değeri
  - `navGroups` — Yönetici paneli navigasyon menüsü gruplarını ve öğelerini içeren dizi
- **Dönüş**: Tam yönetici paneli düzenini içeren React JSX elementi

### [N2_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `loading` - Üst kapsamdaki toplam yükleme bayrağı
  - `user` - Üst kapsamdaki oturum açmış kullanıcı nesnesi
  - `router` - Üst kapsamdaki Next.js yönlendirme nesnesi
  - `isEmailAdmin` - Üst kapsamdaki e-posta ile yönetici olma durumu
  - `canAccess` - Üst kapsamdaki erişim kontrolü fonksiyonu
  - `pathname` - Üst kapsamdaki mevcut uygulama yolu
  - `role` - Üst kapsamdaki kullanıcı rolü
  - `hasAccess` - Mevcut rotaya erişim iznini tutan geçici kontrol değişkeni
- **Dönüş**: void (erişim kontrollerini çalıştırır, gerektiğinde yönlendirme yapar, erken dönüşlerle akışı sonlandırır)

### [N3_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::navGroups_map_callback
- **params**: [`group` — Navigasyon grubu nesnesi, `gi` — Navigasyon grubu dizin indeksi]
- **ic_degiskenler**:
  - `group.label` — Navigasyon grubunun başlık metni
  - `group.items` — Grup içindeki navigasyon öğelerini içeren dizi
  - `pathname` - Üst kapsamdaki mevcut uygulama yolu
  - `setSidebarOpen` - Üst kapsamdaki kenar çubuğu durumunu güncelleyen fonksiyon
- **Dönüş**: Tek bir navigasyon grubunu içeren React JSX elementi

### [N4_NASIL] AST Pointer: src/views/admin/AdminLayout.tsx::groupItems_map_callback
- **params**: [`item` — Tekil navigasyon öğesi nesnesi]
- **ic_degiskenler**:
  - `item.href` - Navigasyon öğesinin yönlendireceği rota
  - `item.label` - Navigasyon öğesinin görünen başlık metni
  - `item.icon` - Navigasyon öğesinde gösterilecek ikon bileşeni
  - `pathname` - Üst kapsamdaki mevcut uygulama yolu
  - `window.innerWidth` - Tarayıcı penceresinin genişliği (mobil kontrolü için kullanılır)
  - `setSidebarOpen` - Üst kapsamdaki kenar çubuğu durumunu güncelleyen fonksiyon
- **Dönüş**: Tekil navigasyon linkini içeren Next.js Link React JSX elementi

---

## NODE ID STANDARD

  file: src\views\admin\AdminLayout.tsx
  function: src\views\admin\AdminLayout.tsx::AdminLayout

---

## DISA AKTARILANLAR (EXPORTS)
  export: AdminLayout