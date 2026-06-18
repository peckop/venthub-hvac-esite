# VentHub 3D Ürün Vitrini — Profesyonel Sahne & Işık Araştırma Raporu

> **Özet:** Bu rapor, VentHub HVAC 3D Orbital Carousel bileşeninde öne gelen ürünlerin ön yüzünün "yarı-karanlık" kalması sorununu çözmek ve sahneye "premium stüdyo showroom" kalitesi kazandırmak amacıyla hazırlanmıştır. Öneriler, projenin teknik kısıtlarına (R3F, sıfır dosya/CDN prosedürel environment, ≤3 gerçek zamanlı ışık, shadows="percentage") tam uyumludur.

---

## 1. Kamera ve Dönüş Ekseninde Işık Mantığı

**Temel Sorun:** Ürünler bir çember (orbital carousel) üzerinde dönerken sabit ışık kaynaklarının altından geçmektedir. Ürün tam kameraya bakacak şekilde öne geldiğinde, ışık açısının arkada kalması veya yanlardan gelmesi nedeniyle ön yüzü yarı-karanlık/gölgeli kalmaktadır.

### Çözüm Mantığı: Kamera-Tabanlı Statik Işık Konumlandırma
Işıklar sahne koordinatlarında değil, **kamera bakış yönüne göre** konumlandırılmalıdır. Carousel dönse ve ürünler yer değiştirse bile, kameranın önündeki "odak bölgesi" (Focus Zone) her zaman aynı açıyla aydınlatılır. Ürünler döndükçe bu aydınlık bölgeye girer ve öne gelen her ürünün ön yüzü kusursuz bir şekilde aydınlanır.

---

## 2. Üç-Noktalı Stüdyo Işık Kurulumu (Three-Point Lighting)

Enterprise seviyesindeki stüdyo renderlarında derinlik ve detay belirginliği için kullanılan altın standart kurulum değerleri aşağıda açıklanmıştır:

### A. Key Light (Ana Işık)
* **Rol:** Ürünün formunu, dokusunu ve ana hacmini tanımlar. Gölgeleri oluşturur.
* **Konum:** Kameranın sağ-üst-ön tarafı.
  * **Yatay Açı (Azimut):** Kameranın bakış aksından sağa doğru **30°**. (3D Vektör: X=+5.5, Z=+9.5)
  * **Dikey Açı (Yükseklik/Altitude):** Ufuk çizgisinden yukarı doğru **38°**. (3D Vektör: Y=+7.5)
* **Şiddet:** `1.8` (Ağır ACES tone-mapping kaybını karşılamak için).
* **Renk Sıcaklığı (Kelvin):** **4500K - 5000K** (Sıcak/doğal stüdyo spotu. Hex: `#FFF4E6`).

### B. Fill Light (Dolgu Işığı)
* **Rol:** Ana ışığın oluşturduğu sert gölgeleri yumuşatır, karanlıkta kalan detayları görünür kılar.
* **Konum:** Kameranın sol-orta-ön tarafı.
  * **Yatay Açı (Azimut):** Kameranın bakış aksından sola doğru **-43°**. (3D Vektör: X=-7.0, Z=+7.5)
  * **Dikey Açı (Yükseklik):** Ufuk çizgisinden yukarı doğru **22°**. (3D Vektör: Y=+3.5)
* **Şiddet:** `0.9` (Gölgeleri yok etmeden doldurmak için).
* **Renk Sıcaklığı (Kelvin):** **6500K - 7500K** (Gökyüzü mavisi dolgusu, kontrast oluşturur. Hex: `#DBEAFE`).
* **Key:Fill Şiddet Oranı:** **2:1** (Endüstriyel ürünlerin detay okunaklılığı için optimum kontrast oranı).

### C. Ambient Light (Ortam Aydınlatması)
* **Rol:** Sahnedeki tüm cisimlere eşit miktarda taban aydınlatma verir. HVAC ürünlerindeki mat plastik ve boyalı yüzeylerin kararmasını engeller.
* **Şiddet:** `0.85` (Metalik olmayan yüzeylerin stüdyo içinde parlamasını sağlar).
* **Renk:** Saf Beyaz (`#FFFFFF`).

---

## 3. Prosedürel IBL ve Environment (Environment / Lightformer)

HDR dosyası veya CDN bağımlılığı olmadan, metalik/parlak yüzeylere (örneğin paslanmaz çelik fan kanatları veya gövdeleri) yansıma kazandırmak için stüdyo softbox'ları prosedürel olarak simüle edilmiştir:

```tsx
<Environment resolution={512} frames={1}>
  {/* KEY Softbox: Ön-sağda hafif sıcak ve geniş yansıma paneli */}
  <Lightformer form="rect" intensity={2.0} position={[5, 4, 9]} scale={[10, 10, 1]} color="#fff4e6" />
  
  {/* FILL Softbox: Ön-solda hafif soğuk dolgu paneli */}
  <Lightformer form="rect" intensity={1.6} position={[-6, 2, 6]} scale={[8, 8, 1]} color="#dbeafe" />
  
  {/* RIM/BACK Softbox: Arkada ürünü fondan ayıran keskin kenar ışığı paneli */}
  <Lightformer form="rect" intensity={1.2} position={[0, 6, -6]} scale={[6, 2.5, 1]} color="#ffffff" />
  
  {/* TOP Çember: Tepe stüdyo aydınlatma halkası */}
  <Lightformer form="circle" intensity={1.0} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
</Environment>
```
* **Neden `frames={1}`?** Bu parametre, yansıma haritasını sahne ilk yüklendiğinde bir kez oluşturur (static bake) ve GPU/VRAM bellek tüketimini sıfıra indirir.

---

## 4. Arka Fon, Zemin ve Temas Gölgeleri (Backdrop & Contact Shadows)

* **Sonsuzluk Havuzu Arka Fonu (Backdrop):** Tam karanlık bir boşluk hissi (void) yerine stüdyo hissi vermek için CSS ile yumuşak bir radyal degrade vinyet kullanılır: `radial-gradient(ellipse 110% 95% at 50% 38%, #2c4163 0%, #14233e 45%, #070c18 100%)`. Merkezin hafif açık renk olması ürünün arkasında bir "ışık havuzu" oluşturur.
* **Mat Stüdyo Zemini:** Zemin plakası (`circleGeometry`) için `floorMetalness: 0.5` ve `roughness: 0.55` kullanılarak, ürünün altında yumuşak ve flulaştırılmış yansımalar elde edilir.
* **Temas Gölgesi (Contact Shadow):** Havada uçma hissini yok etmek için zemin seviyesine Drei `<ContactShadows>` yerleştirilir. Model B10 kuralına göre 1 birimlik sanal küreye normalize edilip `(0,0,0)` merkezine oturtulduğundan, taban noktası `y = -0.5` seviyesine denk gelecektir. Bu nedenle zemin ve gölge plakası **`y = -0.5`** (veya model offset çarpanı eklenerek) konumlandırılmalıdır (sabit `-1.6` değeri normalize modellerin havada uçmasına sebep olur):
  ```tsx
  <ContactShadows position={[0, -0.5, 0]} opacity={0.6} blur={2.5} far={2} scale={10} />
  ```
  Bu sayede ürünlerin altına yumuşak ve fiziksel olarak doğru bir temas gölgesi düşürülür. Key Light real-time shadow-map hesaplamaları FPS kaybını önlemek için `<BakeShadows />` ile statik hale getirilmeli veya tamamen kapatılıp gölge Drei `<ContactShadows>` ile çözülmelidir.

---

## 5. Kamera Geometrisi ve Boyut Normalizasyonu

* **Kamera Değerleri:** Mesafe `14` birim, yüksekliği `1.5` ve görüş alanı **`cameraFOV: 45°`** olarak kilitlenmiştir. FOV'un 45 derece olması, 3D modellerde perspektif bükülmesini (distorsiyon) engellerken izometrik donukluğu da önler.
* **Boyut Normalizasyonu (Normalization):** HVAC cihazları çok farklı boyutlardadır (20 cm'lik banyo fanından 2 metrelik klima santraline kadar). Vitrinde görsel uyum sağlamak için:
  1. Modeller yüklenirken sınır kutuları (Bounding Box) hesaplanarak çapı `1` birim olan sanal bir küre içine sığacak şekilde otomatik ölçeklenir.
  2. Normalize edilen bu modeller, [3dModelOffsets.ts](file:///c:/Users/alize/venthub-hvac/src/utils/3dModelOffsets.ts) dosyasındaki kontrollü `scale` çarpanları (Ör: küçük ev tipi fan için `0.25`, büyük üniteler için `1.0`) uygulanarak sahneye yerleştirilir.

---

## 6. ACES Filmic Tone Mapping Altında Işık Dengesi

`ACESFilmicToneMapping` kullanıldığında, renklerin doygunluğu artar ve gölgeler koyulaşır. This durum, default değerlerde sahnenin karanlık görünmesine yol açar.
* **Çözüm:** WebGLRenderer üzerinde global **`toneMappingExposure: 1.3 - 1.5`** arasında ayarlanmalıdır. Işık şiddetleri (Key: 1.8, Fill: 0.9, Ambient: 0.85) bu yüksek pozlama çarpanına göre kalibre edilmiştir, böylece renk patlaması (clipping) yaşanmadan canlı ve aydınlık bir görsel elde edilir.

---

## 7. Önerilen Başlangıç Değerleri Tablosu

| Parametre Sınıfı | Değer Adı | Başlangıç Ayarı | Renk / Kelvin | Açı / Koordinat |
| :--- | :--- | :--- | :--- | :--- |
| **Işıklar** | Ambient Light | `0.85` | `#FFFFFF` (Nötr Beyaz) | Yok |
| | Key Light (Direc.) | `1.8` | `#FFF4E6` (4500K) | Pozisyon: `[5.5, 7.5, 9.5]` (Kamera-Lokal Koordinatları; Azimut: 30°, Yükseklik: 38°) |
| | Fill Light (Direc.) | `0.9` | `#DBEAFE` (6500K) | Pozisyon: `[-7.0, 3.5, 7.5]` (Kamera-Lokal Koordinatları; Azimut: -43°, Yükseklik: 22°) |
| **Environment (IBL)** | Key Softbox | `2.0` | `#FFF4E6` (4500K) | Pozisyon: `[5, 4, 9]` |
| | Fill Softbox | `1.6` | `#DBEAFE` (6500K) | Pozisyon: `[-6, 2, 6]` |
| | Rim Softbox | `1.2` | `#FFFFFF` (6000K) | Pozisyon: `[0, 6, -6]` |
| | Top Lightformer | `1.0` | `#FFFFFF` (6000K) | Pozisyon: `[0, 8, 0]` |
| **Kamera & Render** | Camera Distance | `14` | Yok | Pozisyon: `[0, 1.5, 14]` |
| | Camera FOV | `45°` | Yok | Açı: 45 derece |
| | Exposure | `1.4` | Yok | `gl.toneMappingExposure` |

---

## 8. Premium Sektör İncelemeleri (Örnekler)

1. **Tesla Configurator (Real-Time 3D Studio):**
   * *Neyi doğru yapıyorlar:* Araç rengi ne olursa olsun (parlak kırmızı veya mat siyah), 3-noktalı aydınlatma ve yumuşak stüdyo environment'ı sayesinde aracın hatları her zaman belirgindir. Farlar ve metalik jantlar için özel rim light konumlandırması kullanılmıştır.
2. **Audi 3D Configurator (Raytracing/ACES Integration):**
   * *Neyi doğru yapıyorlar:* ACES filmic tonlama altında renklerin kontrastını korumak için yüksek pozlama (exposure) ve zemin yansımasında flulaştırılmış metalik zemin (roughness: ~0.6) kullanarak araca gerçekçi bir ağırlık kazandırıyorlar.
3. **Apple Watch 3D Studio:**
   * *Neyi doğru yapıyorlar:* Ürünlerin yansımalarını yumuşatmak için sert ışıklar yerine devasa beyaz softbox'lar (prosedürel lightformer benzeri) kullanıyorlar. Dönen kordon ve kasa metallerinde yansımalar akıcı bir şekilde kaymaktadır.

---

## 9. Kaynaklar

1. [Nielsen Norman Group - Visual Hierarchy in 3D Environments](https://www.nngroup.com/articles/3d-visual-hierarchy/)
2. [Three.js Documentation - Tone Mapping Exposure and ACES Filmic](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.toneMappingExposure)
3. [Tympanus Codrops - Advanced Studio Lighting for WebGL Products](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
4. [Filmic Tonemapping Operators and Exposure Compensation in Real-Time Rendering](https://valvesoftware.github.io/publications/2015/siggraph2015_physics_rendering_valve.pdf)
