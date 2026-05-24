---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useNavigationState.ts
skeleton_hash: f3e59739ac20c686
generated_at: 2026-05-23T22:30:19Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin frontend katmanında yer alan özel React hook dosyasıdır, uygulama navigasyon arayüzünün dinamik durumunu yönetmek üzere tasarlanmıştır. Sayfa kaydırma işlemlerine bağlı olarak navigasyon bileşenlerinin görünüm ve davranışını merkezi olarak yöneterek, tüm uygulamada tutarlı gezinme deneyimi sunulmasını sağlar.

## Fonksiyon Grupları
### Ana Navigasyon Durumu Yönetimi
Modülün tek ana sorumluluğunu üstlenen bu grup, giriş olarak alınan sayfa kaydırma durumu bilgisini işleyerek navigasyon arayüzünün ihtiyaç duyduğu tüm durum değerlerini hesaplar ve kullanan bileşenlere sunar.
- useNavigationState

---

## AXIOMS – Mimari Varsayımlar
Bu React özel hook'u olan useNavigationState, yalnızca React runtime ortamında, React hook çağırma kurallarına uygun olarak çağrıldığında ve giriş parametresi olan isScrolled değeri doğru formatta sağlandığında beklenen navigasyon durum yönetimi işlevini tam olarak yerine getirir.

[Aksiyom 1]: Eğer UseNavigationStateOptions nesnesi altındaki isScrolled parametresi boolean tipinde geçerli bir değer olarak sağlanmazsa, hook scroll durumuna bağlı navigasyon mantığını doğru çalıştıramaz, yanlış state üretir.
[Aksiyom 2]: Eğer hook, React hook çağırma kurallarına aykırı olarak koşullu çağrılırsa veya React bileşeni/başka özel React hook'u dışında çağrılırsa, hook'un iç state yönetim altyapısı çalışmaz, uygulama çalışma zamanı hatası alır.
[Aksiyom 3]: Eğer modülün çalıştığı ortamda React runtime ortamı mevcut değilse, hook'un çalışması için gerekli temel React hook bağımlılıkları eksik kalır, modül hiç çalışmaz.

---

## FONKSIYON DETAYLARI

### useNavigationState
**Ne yapar**: Uygulamanın navigasyon elemanlarının UI durumunu yönetir. Yönettiği durum kapsamına menü, kategori merkezi, arama katmanı gibi aktif navigasyon yüzeyleri ve sayfa kaydırma konumuna bağlı görünüm modları dahildir. Aynı anda yalnızca bir ana navigasyon yüzeyinin aktif olmasını garanti eder, yeni bir yüzey açıldığında mevcut tüm diğer açık yüzeyleri otomatik olarak kapatır.
**Nasıl yapar**: İçsel olarak tüm navigasyon yüzeylerinin aktiflik durumlarını tek bir merkez üzerinden izler. Yeni bir yüzeyin aktifleştirilmesi talebi aldığında, mevcut tüm diğer yüzeylerin aktiflik bayraklarını sıfırlayarak tek yüzeyin açık kalmasını sağlar. Gelen konfigürasyon parametresindeki `isScrolled` değerini kullanarak navigasyonun kompakt modda çalışıp çalışmayacağını belirler, tüm yönettiği durumları ve bu durumları değiştirmek için gereken ayarlama callback'lerini tek bir nesne olarak dışarıya sunar.
**Parametreler**:
- name: options, type: UseNavigationStateOptions — Navigasyon durumunu yapılandırmak için kullanılan konfigürasyon nesnesi. İçerisinde sayfanın kaydırılıp kaydırılmadığını belirten `isScrolled` bayrağını barındırır, bu bayrak ile navigasyonun kompakt modda çalışması tetiklenir.
**Dönüş**: Tüm navigasyon yüzeylerinin mevcut durumunu gösteren durum bayraklarını ve tüm bu durumları yönetmek için kullanılan ayarlama callback fonksiyonlarını içeren bir nesne döndürür.

---

## INTERFACES

### UseNavigationStateOptions
- `isScrolled: boolean`

---

## TYPE ALIASES

### NavigationSurface
```typescript
type NavigationSurface = 'none' | 'menu' | 'categoryHub' | 'search'
```

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState
- **params**: [{ isScrolled }: UseNavigationStateOptions]
- **ic_degiskenler**:
  - `activeSurface` — NavigationSurface tipinde, aktif navigasyon yüzeyini takip eden state değişkeni, başlangıç değeri 'none'
  - `setActiveSurface` — activeSurface state'ini güncellemek için kullanılan useState setter fonksiyonu
  - `isUserMenuOpen` — Kullanıcı menüsünün açık olup olmadığını takip eden boolean state değişkeni, başlangıç değeri false
  - `setIsUserMenuOpen` — isUserMenuOpen state'ini güncellemek için kullanılan useState setter fonksiyonu
  - `mode` — NavigationMode tipinde, isScrolled değerine göre 'compact' veya 'expanded' olarak hesaplanan useMemo ile önbelleğe alınan değişken
  - `openMenu` — useCallback ile sarılı, navigasyon menüsünü açan fonksiyon
  - `closeMenu` — useCallback ile sarılı, navigasyon menüsünü kapatan fonksiyon
  - `toggleUserMenu` — useCallback ile sarılı, kullanıcı menüsünün durumunu tersine çeviren fonksiyon
  - `closeUserMenu` — useCallback ile sarılı, kullanıcı menüsünü kapatan fonksiyon
  - `openCategoryHub` — useCallback ile sarılı, kategori merkezini açan fonksiyon
  - `closeCategoryHub` — useCallback ile sarılı, kategori merkezini kapatan fonksiyon
  - `openSearchOverlay` — useCallback ile sarılı, arama arayüzünü açan fonksiyon
  - `closeSearchOverlay` — useCallback ile sarılı, arama arayüzünü kapatan fonksiyon
- **Dönüş**: Tüm state değerleri ve işlem fonksiyonlarını içeren nesne

### [N2_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.openMenu_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsUserMenuOpen` — Üst kapsamdan gelen state setter, kullanıcı menüsünü kapatmak için kullanılır
  - `setActiveSurface` — Üst kapsamdan gelen state setter, aktif navigasyon yüzeyini 'menu' olarak ayarlamak için kullanılır
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.closeMenu_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setActiveSurface` — Üst kapsamdan gelen state setter, mevcut aktif yüzeyi güncellemek için kullanılır
  - `current` — State setter'a geçirilen, mevcut activeSurface değerini tutan parametre
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.toggleUserMenu_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setActiveSurface` — Üst kapsamdan gelen state setter, aktif yüzeyi 'none' olarak ayarlamak için kullanılır
  - `setIsUserMenuOpen` — Üst kapsamdan gelen state setter, mevcut kullanıcı menüsü durumunu tersine çevirmek için kullanılır
  - `current` — State setter'a geçirilen, mevcut isUserMenuOpen değerini tutan parametre
- **Dönüş**: yok

### [N5_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.closeUserMenu_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsUserMenuOpen` — Üst kapsamdan gelen state setter, kullanıcı menüsünü kapatmak için false değeri atanır
- **Dönüş**: yok

### [N6_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.openCategoryHub_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsUserMenuOpen` — Üst kapsamdan gelen state setter, kullanıcı menüsünü kapatmak için kullanılır
  - `setActiveSurface` — Üst kapsamdan gelen state setter, aktif yüzeyi 'categoryHub' olarak ayarlamak için kullanılır
- **Dönüş**: yok

### [N7_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.closeCategoryHub_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setActiveSurface` — Üst kapsamdan gelen state setter, mevcut aktif yüzeyi güncellemek için kullanılır
  - `current` — State setter'a geçirilen, mevcut activeSurface değerini tutan parametre
- **Dönüş**: yok

### [N8_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.openSearchOverlay_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setIsUserMenuOpen` — Üst kapsamdan gelen state setter, kullanıcı menüsünü kapatmak için kullanılır
  - `setActiveSurface` — Üst kapsamdan gelen state setter, aktif yüzeyi 'search' olarak ayarlamak için kullanılır
- **Dönüş**: yok

### [N9_NASIL] AST Pointer: src/hooks/useNavigationState.ts::useNavigationState.closeSearchOverlay_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `setActiveSurface` — Üst kapsamdan gelen state setter, mevcut aktif yüzeyi güncellemek için kullanılır
  - `current` — State setter'a geçirilen, mevcut activeSurface değerini tutan parametre
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\hooks\useNavigationState.ts
  function: src\hooks\useNavigationState.ts::useNavigationState

---

## DISA AKTARILANLAR (EXPORTS)
  export: useNavigationState