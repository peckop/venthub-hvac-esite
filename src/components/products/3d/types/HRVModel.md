---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\HRVModel.tsx
skeleton_hash: 70636daa783b970e
entity_hashes:
  func:HRVModel: 2813a37fd256fdd7
  overview: ca8ffe7ca3ce1f94
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:46:25Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin ürün gösterimleri için kullanılan 3D görselleştirme katmanında yer alır. Modül, ısı geri kazanım ventilatörleri (HRV) cihazlarının 3B ortamda doğru şekilde render edilmesini sağlayan temel React bileşenini barındırır.

## Fonksiyon Grupları
### Ana 3B HRV Model Bileşeni
HRV cihazlarının 3D sahnede görsel olarak sunulmasını üstlenen tek bir bileşeni içerir.
- HRVModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### HRVModel

**Ne yapar**: Hava akışı animasyonlu, fiziksel tabanlı bir Isı Geri Kazanım Ünitesi (HRV) 3D modelini React Three Fiber sahnesinde render eder. Taze hava (mavi) ve atık hava (kırmızı) partiküllerinin cihaz üzerinden geçişini sürekli animasyonla simüle eder.

**Nasıl yapar**: `useFanMaterials` hook'u ile malzemeleri (RAL7035 gri, mat siyah) alır. İki ayrı `useRef` ile taze ve atık hava partiküllerini tutar. `useFrame` içinde her karede delta süresine bağlı olarak partiküllerin x ekseninde hareketini günceller: taze hava partikülleri sağa (+x) doğru hareket ederken 0.45 sınırını aştığında -0.45'e sarılır; atık hava partikülleri sola (-x) doğru hareket ederken -0.45 alt sınırını aştığında 0.45'e sarılır. Bu sonsuz döngü, havanın sürekli akışını görsel olarak simüle eder. JSX dönüşünde ana gövde kutusu, dört silindirik bağlantı flanşı, kontrol ünitesi/filtre kapağı detayı ve iki animasyonlu hava akışı grubu oluşturulur.

**Parametreler**:
Bu fonksiyon parametre almaz. Sıfır argümanlı bir React fonksiyonel bileşenidir.

**Dönüş**: `JSX.Element` — 3D sahne içinde yer alacak bir `<group>` elemanı döndürür. Grup `[1.2, 1.2, 1.2]` ölçekli olup şu alt elemanları içerir:
- Ana gövde: 1.2 × 1.3 × 0.65 boyutlarında kutu geometri, RAL7035 gri malzeme
- Bağlantı flanşları: 4 adet silindirik geometri (yarıçap 0.09, yükseklik 0.18, 12 segment), mat siyah malzeme, üst yüzeyde dört köşeye konumlandırılmış
- Kontrol ünitesi / filtre kapağı: 0.35 × 0.18 × 0.02 boyutlarında ince kutu, mat siyah malzeme
- Taze hava partikülleri: 3 adet mavi (#3b82f6) şeffaf küp, `freshRef` ile referanslı, z = 0.12 düzleminde animasyonlu
- Atık hava partikülleri: 3 adet kırmızı (#ef4444) şeffaf küp, `staleRef` ile referanslı, z = -0.12 düzleminde animasyonlu

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::HRVModel
- **params**: (parametre yok)
- **ic_degiskenler**:
    * `materials` — useFanMaterials() hook'undan dönen materyal nesnesi, 3D modellere farklı yüzey materyallerini (ral7035, matteBlack) uygulamak için kullanılır
    * `freshRef` — useRef ile oluşturulan React ref nesnesi, taze hava partiküllerini (mavi küreler) içeren Three.js Group nesnesine referans verir, animasyonda child'ların pozisyonunu güncellemek için kullanılır
    * `staleRef` — useRef ile oluşturulan React ref nesnesi, atık hava partiküllerini (kırmızı küreler) içeren Three.js Group nesnesine referans verir, animasyonda child'ların pozisyonunu güncellemek için kullanılır
- **Dönüş**: JSX (React Three Fiber bileşeni) — [1.2, 1.2, 1.2] ölçeğinde bir group döner; içinde ana gövde (boxGeometry), 4 flanş (cylinderGeometry), kontrol ünitesi detayı ve animasyonlu hava akışı partikülleri (sphereGeometry) içerir
- **Yan Etkileri**: useFrame hook'u her frame'de çağrılır, freshRef ve staleRef ile referans verilen group'ların children elemanlarının position.x değerlerini delta zamanına göre artırır/azaltır (hava akışı animasyonu)

---

## NODE ID STANDARD

  file: src\components\products\3d\types\HRVModel.tsx
  function: src\components\products\3d\types\HRVModel.tsx::HRVModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: HRVModel

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