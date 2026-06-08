---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\parts\GreenClamps.tsx
skeleton_hash: c0acb58013af37d2
entity_hashes:
  func:GreenClamps: 957b30489f158a33
  overview: 56ea2345484e125a
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, 3D ürün görselleştirme sistemindeki yeşil tutamak (Green Clamps) parçasını temsil eden bir React bileşenidir. Bileşen, tutamakların seçimi, izolasyonu, gizlenmesi, tıklama etkileşimi ve patlama animasyonu gibi görsel ve etkileşimsel özellikleri yönetir.

## Fonksiyon Grupları
### Ana Bileşen
Bileşen, yeşil tutamakların görsel görünümünü ve kullanıcı etkileşimlerini sağlayan tek işlevi içerir.
- GreenClamps (props ile yapılandırılarak render edilir)

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer isSelected prop'ı boolean değilse, komponentin seçili durumu doğru render edilmez.
[Aksiyom 2]: Eğer isIsolated prop'ı boolean değilse, izolasyon durumu görselleştirilemez.
[Aksiyom 3]: Eğer isHidden prop'ı boolean değilse, gizleme mantığı çalışmaz.
[Aksiyom 4]: Eğer onClick prop'ı bir fonksiyon değilse, tıklama olayı işlenmez ve hata oluşabilir.
[Aksiyom 5]: Eğer explode prop'ı eksikse, komponentin patlama efekti uygulanamaz.

---

## FONKSİYON DETAYLARI

### GreenClamps
**Ne yapar**: GreenClamps komponenti, yeşil klemenslerin görsel temsili sağlar ve seçime, izolasyonuna, gizlenmesine ve tıklama olayına yanıt verir.  
**Nasıl yapar**: Prop olarak gelen bayraklarla sınıf ve stil uygulayarak, `onClick` handler'ını tetikleyerek ve `explode` değeriyle konum ofseti hesaplayarak JSX döndürür.  
**Parametreler**:
- isSelected: boolean — Klemensin seçili olup olmadığını gösterir.  
- isIsolated: boolean — Klemensin izole edilip edilmediğini gösterir.  
- isHidden: boolean — Klemensin gizli olup olmadığını gösterir.  
- onClick: function — Klemens üzerine tıklandığında çağrılacak olay işleyici.  
- explode: number (varsayılan değer belirtilmemiş) — Klemensin patlama efekti için uzaklık/ofset değeri.  
**Dönüş**: React.FC<GreenClampsProps> — JSX elementi döndüren fonksiyonel React bileşeni.

---

## INTERFACES

### GreenClampsProps
- `isSelected?: boolean`
- `isIsolated?: boolean`
- `isHidden?: boolean`
- `onClick?: () => void`
- `explode?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/factory/parts/GreenClamps.tsx::GreenClamps
- **params**: isSelected, isIsolated, isHidden, onClick, explode = 0
- **ic_degiskenler**:
  - `materials` — result of useFanMaterials hook providing safetyOrange and vorticeGreen material objects.
  - `clampMaterial` — selected material based on isSelected; safetyOrange if true else vorticeGreen.
- **Dönüş**: JSX element (<group> with meshes) or null

### [N2_NASIL] AST Pointer: src/components/products/3d/factory/parts/GreenClamps.tsx::onClick handler
- **params**: e
- **ic_degiskenler**: (yok)
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\products\3d\factory\parts\GreenClamps.tsx
  function: src\components\products\3d\factory\parts\GreenClamps.tsx::GreenClamps

---

## DISA AKTARILANLAR (EXPORTS)
  export: GreenClamps

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