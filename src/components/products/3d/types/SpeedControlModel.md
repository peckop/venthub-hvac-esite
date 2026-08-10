---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SpeedControlModel.tsx
skeleton_hash: 2d51358e2337062a
entity_hashes:
  func:SpeedControlModel: 41e64c85f069a205
  overview: 031e0f24314d2b4e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:34Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3B ürün görselleştirme sistemi için hız kontrol ünitesinin dijital modelini tanımlayan bir React Three Fiber bileşenidir. HVAC ekipmanlarının fiziksel özelliklerini (gövde, düğme, göstergeler) ve animasyonlarını (dönme, nabız atma) tek bir merkezi yapı içinde paketleyerek 3B sahnede gerçekçi bir demonstrasyon sunar.

## Fonksiyon Grupları
### Hız Kontrol Ünitesi 3B Modeli
Bu grup, hız kontrol ünitesinin tüm fiziksel geometrisini, malzemelerini ve animasyon mantığını tek bir bileşen olarak tanımlar.
- `SpeedControlModel`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

**Gerekçe:** `SpeedControlModel()` fonksiyonu parametresiz bir çağrı yapısına sahiptir ve fonksiyon gövdesi analiz edilememiştir. Mimari varsayımlar yalnızca fonksiyon gövdesindeki somut mantıksal koşullardan türetilebilir; docstring, yorum satırları veya değişken isimlerinden bilgi çıkarılmaz. Bu nedenle bu modül için herhangi bir aksiyom belirlenememiştir.

---

## FONKSİYON DETAYLARI

### SpeedControlModel

**Ne yapar**: Hız kontrol cihazının (speed controller) interaktif 3B modelini oluşturur. Bu bileşen, HVAC sistemlerinde kullanılan bir hız kontrol ünitesinin Three.js tabanlı görsel temsilini render eder — kutu gövdesi, ön panel, soğutma kanatları, döner düğme (potansiyometre), LED göstergesi ve logo alanını içerir. Düğmenin sürekli dönme animasyonu ve LED'in nabız (pulse) efekti ile gerçekçi bir interaktif 3B deneyim sunar.

**Nasıl yapar**: React Three Fiber (R3F) ekosistemi üzerinde çalışan bir React fonksiyonel bileşenidir. `useResolveMaterials()` hook'u ile malzeme setini (boxMat, matteBlack, brushedAluminum) dış kaynaktan çözer. `useMemo` hook'ları ile geometri ve malzemeleri yalnızca ilk render'da oluşturarak VRAM sızıntılarını ve gereksiz yeniden hesaplamaları önler. `useEffect` hook'u bileşenUnmount olduğunda tüm geometri ve malzeme nesnelerinin `.dispose()` metodunu çağırarak GPU belleklerini temizler. `useFrame` hook'u her kare (frame) render'ında saat referansıyla düğmenin Z ekseni rotasyonunu `Math.sin(time * 2) * 0.5` formülüyle, LED renginin yeşil intensity değerini ise `Math.abs(Math.sin(time * 2))` ile hesaplayarak nabız efekti yaratır — bu sayede bileşen yeniden render edilmeden animasyon sağlanır.

**Parametreler**:

- Bu bileşen herhangi bir prop (dış parametre) almamaktadır. Tüm veri bağımlılıkları iç hook'lar ve React Three Fiber bağlamı üzerinden sağlanır.

**Dönüş**: `JSX.Element` — `<group>` elemanı içinde 3B sahne grafı döndürür. Döndürülen grup, 2.5x2.5x2.5 ölçek faktörü ile [0, 0, 0] konumlandırılmıştır ve şu alt elemanları içerir: Box (gövde), FrontPanel (ön panel), heatl/heatr serili yan soğutma kanatları (3'er adet, sol ve sağ tarafta), knobRef referanslı döner düğme grubu (silindir + çizgi geometrisi), ledRef referanslı LED gösterge (primitive object pattern ile malzeme eklenmiş), ve logo mesh'i.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SpeedControlModel.tsx
  function: src\components\products\3d\types\SpeedControlModel.tsx::SpeedControlModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpeedControlModel

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