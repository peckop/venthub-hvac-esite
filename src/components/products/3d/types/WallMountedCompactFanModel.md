---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx
skeleton_hash: 9ce537b49bd29ad0
entity_hashes:
  func:WallMountedCompactFanModel: 500276a0a7bacf11
  overview: 94e8d176bbf632bc
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:51Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin ürün 3D görselleştirme altyapısında kullanılan, duvara monte kompakt fan modellerini renderlayan React bileşenini barındırır. Ürün kataloğunda fan türü ürünlerin 3 boyutlu olarak kullanıcılara sunulması sürecinde temel görev üstlenir.

## Fonksiyon Grupları
### Ana 3D Bileşeni
Modülün tüm sorumluluğunu üstlenen tek grup, duvara monte kompakt fanın 3 boyutlu modelini React uygulaması içinde kullanılabilir hale getirir, ürün sayfalarında doğru şekilde görüntülenmesini sağlar.
- WallMountedCompactFanModel

---

## AXIOMS – Mimari Varsayımlar
Venthub HVAC projesinin 3D ürün bileşenleri kategorisinde yer alan bu TypeScript React bileşeni, duvara monte kompakt fan modelinin 3D olarak görüntülenmesini sağlamak için tasarlanmıştır. Doğru çalışması, proje içindeki tüm ilgili bağımlılıkların, kaynak dosyalarının ve derleme altyapısının erişilebilir olmasına tamamen bağlıdır.

[Aksiyom 1]: Eğer React kütüphanesi proje bağımlılıklarında yüklenmiş ve bu bileşenin erişebileceği şekilde tanımlı değilse, bu TSX bileşeni hiçbir şekilde derlenemez ve çalışmaz.
[Aksiyom 2]: Eğer proje içinde 3D model renderlamak için kullanılan temel 3D altyapısı (Three.js, React Three Fiber vb.) yüklenmemiş ve bu bileşen tarafından erişilebilir değilse, fanın 3D modeli ekrana hiçbir şekilde çizilemez.
[Aksiyom 3]: Eğer bu bileşen tarafından kullanılan duvara monte kompakt fana ait tüm 3D model kaynak dosyaları (geometri, doku vb.) bileşenin erişebildiği dosya yolunda mevcut değilse, model eksik/hatalı renderlanır ya da hiç görüntülenmez.
[Aksiyom 4]: Eğer TypeScript derleyici yapılandırmasında src/components/products/3d/types/ dosya yolu tanımlı ve izin verilen derleme yolları arasına dahil edilmemişse, bu bileşen proje build adımında derlenemez ve hata fırlatır.
[Aksiyom 5]: Eğer bu bileşeni çağıran üst seviye ürün görüntüleme bileşenleri bu 3D modeline gerekli renderlama izinlerini ve bağlam verilerini sağlamıyorsa, fan modeli sadece statik bir şekil olarak kalır, tüm etkileşimli özellikleri devre dışı kalır.

---

## FONKSİYON DETAYLARI

### WallMountedCompactFanModel
**Ne yapar**: Venthub HVAC projesinin ürünler bölümündeki 3D görselleştirme katmanında kullanılmak üzere, duvara monte kompakt vantilatörün 3 boyutlu modelini barındıran bir React fonksiyonel bileşeni sunar. Projenin tip güvenliği standartlarına uygun olarak 3D ürün modelleri ailesinin bir parçası olarak yapılandırılmış, sadece bu spesifik vantilatör modelinin 3B olarak render edilmesini sağlar.
**Nasıl yapar**: TypeScript ile güçlendirilmiş tip güvenliği sunan bir yapı ile, React.FC türünde hazırlanmış bileşeni doğrudan döndüren bir fabrika yapısı sunar. Kaynak kodunun bulunduğu dizin itibarıyla tüm duvara monte kompakt vantilatörlere ait 3B görsel varlıkları ve geometrik tanımları içeren bileşeni projenin diğer bölümlerinin kullanımına sunar, projenin 3D modelleme entegrasyonlarıyla sorunsuz çalışacak şekilde önceden yapılandırılmıştır.
**Parametreler**: Bu fonksiyon herhangi bir giriş parametresi almamaktadır.
**Dönüş**: React.FC türünde bir React fonksiyonel bileşeni döndürür. Bu döndürülen bileşen, uygulama içindeki herhangi bir noktada çağrıldığında, duvara monte kompakt vantilatörün 3D modelini React render süreci kapsamında ilgili ekrana çizmek üzere kullanılır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\types\WallMountedCompactFanModel.tsx::WallMountedCompactFanModel
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `fanRef` — Three.js Group nesnesini referanslayan useRef, pervanenin rotasyonunu güncellemek için kullanılır
  - `useFrame` — @react-three/fiber hook'u, her karede çalışarak fan dönüşünü günceller
  - `plateGeometry` — useMemo ile önbelleğe alınan duvar montaj plakasının ExtrudeGeometry nesnesi
  - `COLORS` — Modelin tüm parçalarının renk kodlarını tutan sabit nesne, PLATE, BLACK_PARTS, BLADE_ORANGE, WIRE_GUARD anahtarları içerir
- **Dönüş**: 3D fan modelini içeren React Three.js group JSX componenti

---

## NODE ID STANDARD

  file: src\components\products\3d\types\WallMountedCompactFanModel.tsx
  function: src\components\products\3d\types\WallMountedCompactFanModel.tsx::WallMountedCompactFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: WallMountedCompactFanModel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)