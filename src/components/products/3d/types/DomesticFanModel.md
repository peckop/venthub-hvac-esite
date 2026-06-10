---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\DomesticFanModel.tsx
skeleton_hash: 18dc1a68bf51d789
entity_hashes:
  func:DomesticFanModel: c93fddd365c3092d
  overview: f5e11a1dadb240ae
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:44:14Z
---

## Genel Bakış
Bu modül, 3D ürün görselleştirme sistemi içinde ev tipi tavan fanı modelini temsil eden bir React bileşeni tanımlar. Bileşen, fanın üç boyutlu geometrisini ve malzemelerini oluşturarak UI'da statik veya etkileşimli bir şekilde render edilmesini sağlar.

## Fonksiyon Grupları
### Bileşen Tanımı
Modülün temel ve tek yapı taşını oluşturur; ev tipi fanın 3D modelinin dış görünüşünü ve temel yapısını tanımlayan React fonksiyonel bileşeni içerir.
- DomesticFanModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için belirgin fonksiyon gövdesi (code body) paylaşılmadığından, sadece fonksiyon imzası ve dosya uzantısına dayalı temel mimari varsayımlar çıkarılabilir.

**Genel Varsayım**: `DomesticFanModel()` parametresiz bir React fonksiyonel bileşenidir (.tsx).

---

**[Aksiyom 1]**: Eğer React çalışma ortamı (React runtime / DOM) yoksa, bileşen render edilemez ve hata oluşur.

**[Aksiyom 2]**: Eğer 3D render管kütüphanesi (örn: Three.js, @react-three/fiber) bağımlılığı yoksa veya yüklü değilse, bileşenin 3D model gösterim işlevi çalıştırılamaz.

**[Aksiyom 3]**: Eğer bileşen çağrılmadan önce uygun bir React Context veya Props aracılığıyla gerekli veriler sağlanmamışsa (fonksiyon imzasında parametre tanımlı olmadığından), bileşenin model verilerine erişimi bilinmiyor olur ve varsayılan/boş bir durum gösterir.

---

> **Not**: Fonksiyon gövdesi paylaşılmadığından, iç bileşen bağımlılıkları, eşik değerleri veya kabul kriterleri hakkında kesin çıkarım yapılamamıştır. Daha ayrıntılı aksiyomlar için `DomesticFanModel` fonksiyonunun gövde kodunun (return bloğu, hook çağrıları, import'lar) sağlanması gerekmektedir.

---

## FONKSİYON DETAYLARI

### DomesticFanModel
**Ne yapar**: Bu fonksiyon, ev tipi fanların 3D modelini göstermek için kullanılan bir React fonksiyonel bileşenini tanımlar. Bileşen, ilgili görsel ve etkileşimli öğeleri render ederek kullanıcıya fan modelini sunar.  
**Nasıl yapar**: `DomesticFanModel` fonksiyonu, içeriğinde JSX döndürerek temel yapıyı oluşturur; gerekli stilleri ve dış bağımlılıkları (örneğin model veri veya üçüncü parti görüntüleme kütüphaneleri) kapsam dışından alır ve bunları render sürecinde kullanır. Props almadığı için dışarıdan veri beklemez, sadece statik veya varsayılan bir görüntü sağlar.  
**Parametreler**:  
- Bu fonksiyon hiçbir parametre almaz.  
**Dönüş**: `React.FC` türünde bir fonksiyonel bileşen döndürür; bu bileşen render edildiğinde JSX çıktısı üretir ve React tarafından DOM’a monte edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: DomesticFanModel.tsx::DomesticFanModel
- **params**: (yok)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan elde edilen, modelin farklı parçaları için kullanılacak (fırçalanmış alüminyum, mat siyah, endüstriyel çelik vb.) materyaller nesnesi
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan, JSX'teki `<group>` elemanına referans veren React ref nesnesi
  - `panelSize` — Fansız panelin boyutunu tanımlayan sabit (1.0 birim kare)
  - `panelThickness` — Fansız panelin kalınlığını tanımlayan sabit (0.08 birim)
- **Dönüş**: `React.FC` — 3D banyo fanı modelini (ön panel, ızgara, arka gövde ve markalama) oluşturan React fonksiyonel bileşeni

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DomesticFanModel.tsx
  function: src\components\products\3d\types\DomesticFanModel.tsx::DomesticFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DomesticFanModel

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