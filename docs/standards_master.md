# STANDARDS MASTER

---
project_name: venthub-hvac
compiled_at: 2026-08-28T08:20:49.152207+00:00
total_compiled_files: 62
source_commit: 4a52a138
source: ['docs/standards', 'docs/reference']
---



---
# FILE: docs\standards\3d-scene-lighting-research.md

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


---
# FILE: docs\standards\3d-showroom-ux-research.md

# VentHub 3D Ürün Vitrini — Bilgi Paneli & UX Araştırma Raporu

> **Özet:** Bu rapor, VentHub HVAC 3D Orbital Carousel bileşeninin salt bir görsel unsurdan ("süs") yüksek dönüşümlü bir B2B/B2C satış aracına dönüştürülmesi amacıyla hazırlanmıştır. Dünyanın önde gelen premium 3D vitrinleri (Apple, Porsche, Tesla) ve HVAC sektörü satın alma tetikleyicileri (buying triggers) analiz edilerek optimum bilgi paneli kurgulanmıştır.

---

## 1. Premium 3D Ürün Vitrinlerinde UX Dinamikleri (Dünya Standartları)

Premium markaların 3D ürün sunumlarındaki en temel felsefe, **"Ürünü Kahraman Yapmak" (Product as the Hero)** ve kullanıcının görsel odaklanmasını dağıtmamaktır. Yapılan UX araştırmaları, 3D sahnelerde bilgi sunumunun şu üç kurala uyması gerektiğini göstermektedir:

* **Kademeli Açıklama (Progressive Disclosure):** Ekranda ilk anda yığınla teknik veri göstermek bilişsel yükü (cognitive load) artırır. Bilgi, kullanıcının ürüne odaklanmasıyla (hover/click) kademeli olarak açılmalıdır.
* **Bağlamsal Etiketler (Hotspots):** Modelin üzerine yerleştirilen küçük, interaktif noktalar (hotspots) sayesinde kullanıcı, ürünü döndürürken ilgilendiği parçaya tıklayıp (örneğin fan kanadı veya filtre hücresi) o parçanın faydasını sahneyi terk etmeden okuyabilmelidir.
* **Görsel Öncelik:** 3D sahnenin en az %60-70'i boş kalmalı, bilgi paneli ürünü asla tamamen kapatmamalıdır.

---

## 2. Önerilen Bilgi Paneli İçeriği ve Hiyerarşisi

Bir ürün orbital sahnenin merkezine (odağına) geldiğinde gösterilecek asgari ve en yüksek dönüşüm getiren veri seti şu öncelik sırasıyla sunulmalıdır:

| Sıra | Alan Adı | UX Amacı | Detay |
|---|---|---|---|
| **1** | **Ürün Adı & Kategori** | Kimlik tanımlama | Okunaklı, büyük tipografi (Ör: *Venta HRV 1500 — Isı Geri Kazanım Cihazı*). |
| **2** | **Kilit Metrik Kartları (2-3 Adet)** | Teknik doğrulama | HVAC mühendisleri ve müteahhitler için "evet/hayır" kriteri olan temel metrikler (Bkz. Bölüm 3). |
| **3** | **Stok & Teslimat Süresi Durumu** | Güven & Aciliyet | B2B satın almada teslim süresi fiyattan daha kritik bir tetikleyicidir (Ör: *Stokta Var / 3 İş Günü*). |
| **4** | **Birincil CTA (Teklif Al / Ekle)** | Dönüşüm (Conversion) | Doğrudan teklif sepetine ekleme veya satın alma yolculuğuna başlama butonu. |
| **5** | **İkincil Eylem (CAD/BOM İndir)** | Mühendislik Kolaylığı | Projeci mühendisler için CAD çizimi (.dwg/.rfa) veya Malzeme Listesi (BOM) indirme linki. |

---

## 3. HVAC / Teknik Ürünlerde "Satın Aldıran" Karar Metrikleri

HVAC alıcıları (müteahhitler, mekanik tasarımcılar ve tesis yöneticileri) rasyonel karar vericilerdir. Deneme-yanılma tasarımları yerine, vitrinde doğrudan şu 4 kritik metriğin gösterilmesi satışı tetikler:

1. **Hava Debisi ($m^3/h$):** Cihazın hacimsel kapasitesidir. Projenin ihtiyacını karşılayıp karşılamayacağını belirleyen ilk parametredir.
2. **Toplam Verim (% / COP):** Isı geri kazanım veya enerji verimlilik oranıdır. İşletme maliyetlerini hesaplayan mühendisler için en önemli dönüşüm tetikleyicisidir.
3. **Ses Güç Seviyesi ($dB(A)$):** Akustik konfordur. Özellikle ofis, konut ve hastane projelerinde cihazın ses seviyesi yasal limitlerle sınırlandırılmıştır.
4. **Elektriksel Güç ($kW$):** Enerji tüketimi ve panoların boyutlandırılması için gerekli elektrik altyapı gereksinimidir.

---

## 4. Yerleşim (Layout) ve Okunabilirlik Kuralları

3D Canvas üzerinde metin okutmak, kontrast kayıpları nedeniyle risklidir. Bu durumu çözmek için **Cam Etkisi (Glassmorphism)** ve **Altın Oran Yerleşimi** kullanılmalıdır:

```
+-------------------------------------------------------------+
|  [Logo]                                         [Menü/Hesap] |
|                                                             |
|   +--------------------------+   +-----------------------+  |
|   |                          |   |                       |  |
|   |                          |   |   BİLGİ PANELİ        |  |
|   |                          |   |  - Cihaz Adı          |  |
|   |     3D ÜRÜN ODAĞI        |   |  - Metrik Kartları    |  |
|   |     (2/3 Genişlik)       |   |  - Teslim Süresi      |  |
|   |                          |   |  - CTA (Teklif Al)    |  |
|   |                          |   |  - [CAD/BOM İndir]    |  |
|   |                          |   |                       |  |
|   +--------------------------+   +-----------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

### Tasarım Kuralları
* **Okunabilirlik (Contrast):** Bilgi paneli arka planında `backdrop-filter: blur(16px)` ve `%40 opacity` içeren koyu cam (dark glassmorphic) kullanılmalıdır. Bu sayede arkada dönen 3D sahne ne renk olursa olsun, metinlerin kontrastı korunur.
* **Geçiş Animasyonu (Camera Tracking):** Ürün odaklandığında kamera, modeli hafifçe sol tarafa kaydırmalı (pan), sağ taraftan ise bilgi paneli yumuşak bir fade-in + slide-up efektiyle belirmelidir. Kamera hareketi ile panelin belirmesi eşzamanlı ve akıcı olmalıdır (lerp speed: `0.1`).
* **Staggered Delay:** Panel içindeki elementler (ad, metrikler, buton) eşzamanlı değil, sırayla (`staggerDelay: 0.08s`) belirmelidir. Bu mikro-animasyon, Apple sunumlarındaki premium hissi yaratır.

---

## 5. Erişilebilirlik (A11y) ve Mobil Davranış

* **Mobil Bottom Sheet:** Mobilde ekran dar olduğu için yan panel düzeni çalışmaz. Mobil cihazlarda bilgi, ekranın altından yukarı doğru kayan bir **Bottom Sheet (Alt Panel)** şeklinde açılmalıdır. Kullanıcı bu paneli aşağı kaydırarak kapatabilmeli, 3D ürünü tam ekran inceleyebilmelidir.
* **Dokunma Sınırları:** Mobil cihazlarda 3D döndürme alanı ile Bottom Sheet etkileşim alanları net ayrılmalıdır. Aksi halde kullanıcı sayfayı kaydırmak isterken yanlışlıkla 3D modeli döndürür (touch collision).
* **Ekran Okuyucu Desteği (Aria-live):** Odaklanan ürün değiştikçe ekran okuyuculara sesli geri bildirim gitmesi için `aria-live="polite"` etiketleri bilgi paneline entegre edilmelidir.

---

## 6. Premium Sektör İncelemeleri (Örnekler)

1. **Apple (Vision Pro / iPhone Showcases):**
   * *Davranış:* Sayfa kaydırıldıkça (scroll) 3D model kendi ekseninde dönerken, teknik detaylar modelin yanındaki boşlukta belirir. Metinler kısa, net ve büyük puntoludur.
   * *Çıkarım:* Teknik özellikler ham tablo olarak değil, interaktif metin-görsel eşleşmesiyle sunulur.
2. **Porsche (Taycan Configurator):**
   * *Davranış:* Ekranın sağ tarafı tamamen dinamik bir seçenek ve bilgi paneline ayrılmıştır. Seçenekler değiştikçe 3D araç anında tepki verir, jantlar veya renk milisaniyeler içinde güncellenir.
   * *Çıkarım:* 3D nesnenin tepki süresi (milisaniye seviyesinde gecikme) güven hissi yaratır.
3. **Bang & Olufsen (3D Audio Showcase):**
   * *Davranış:* Kulaklık veya hoparlörün içine yerleştirilen hotspots (sıcak noktalar) tıklandığında ses dalgalarının yayılımını gösteren küçük 3D animasyonlar oynatılır ve akustik dB verileri şık bir kartta gösterilir.
   * *Çıkarım:* Teknik veriyi görselleştirmek (infografik) düz yazıdan %80 daha etkilidir.

---

## 7. Kaynaklar

1. [Nielsen Norman Group - UX for 3D Product Configurators](https://www.nngroup.com/articles/3d-product-configurators/)
2. [Porsche Elastic Content & Real-Time Web 3D Integration](https://www.mhp.com/en/news-insights/real-time-3d-in-e-commerce)
3. [Shopify 3D & AR Buying Triggers and Conversion Studies](https://www.shopify.com/enterprise/3d-models-ar-ecommerce-conversion)
4. [Tympanus Codrops - Building Interactive 3D Showcases on Web](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
5. [Utsubo - Three.js Best Practices for Commercial Showrooms](https://www.utsubo.com/blog/threejs-best-practices-100-tips)


---
# FILE: docs\standards\3d-webgl-standard.md

# VentHub 3D / WebGL Standardı (Cetvel)

> **Ne bu?** R3F (React Three Fiber) + Three.js tabanlı 3D katmanının **tek doğru kaynak (SSOT)**
> kuralları ve bunların **otomatik bekçileri (conformance kapıları, INV-3D-*)**. Cetvel = kural (insan:
> niçin/ne) · Kapı = zorlayıcı (makine: nasıl-doğru-kalır). "Güzel görünüyor" demez, **ölçer.**
> Oluşturma: 2026-06-16 · Sahibi: Recep · Nasıl-yapılır oyun kitabı → `.claude/skills/threejs-webgl-performance`
>
> **v1.2 (2026-06-18) — Sahne, Işık & Showroom UX entegrasyonu:** Bu sürümde, 3D stüdyo showroom
> kalitesi için belirlenen kamera-tabanlı stüdyo ışık değerleri, prosedürel environment/lightformer şeması
> ve rasyonel HVAC alıcı kararlarını hedefleyen bilgi paneli UX kuralları bu SSOT cetveline entegre edilmiştir.
>
> **Kaynaklar (bu cetvel hafızadan değil bunlardan damıtıldı):** NLM "4. THREE.JS / WEBGPU / AI 3D" defteri
> (three.js docs · @react-three/drei · **WebGPU W3C spec** · MDN) + web: [utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips) ·
> [Codrops efficient three.js](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) ·
> [threedium e-commerce](https://threedium.io/3d-model/web-ecommerce) · [cylindo mobil](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers) · [pmndrs drei `<View>`](http://drei.docs.pmnd.rs/portals/view)
> + W3C WCAG 2.2 ve CIE aydınlatma standartları + Nielsen Norman Group (3D Configurator Heuristics)
> + **ikinci kaynak damıtması:** `world_class_design_standards.md` PART I (gltf-transform CLI · TSL node API · BatchedMesh).
>
> **Eşik kalibrasyonu (dürüstlük notu):** Aşağıdaki sayısal bütçeler (draw call <100, ilk yük <4MB, üçgen
> aralıkları…) sektör best-practice **kural-of-thumb**'larıdır; **bizim asset'lerimizde/cihazlarımızda ölçülmüş
> v1 başlangıç hedefleridir.** `audit/3d-surfaces` denetimi + Lighthouse + INV-3D-6 (`renderer.info`) bunları
> gerçek ölçümle **sertleştirecek** — "kanıtlanmış VentHub gerçeği" değil, ölçülecek hedef olarak oku.

---

## 0. Yönetici İlke

3D, enterprise vitrinin **WOW'u** ama aynı zamanda **en kırılgan katman**. İki mutlak vardır:

1. **ASLA ÇÖKME.** Bir asset 404/bozuk olsa, GPU context kaybolsa, bellek dolsa bile **3D alt-ağacı zarifçe
   düşer, SAYFA çökmez.** (Canlı kanıt: `Product3DViewer`'a konan 42 byte'lık bozuk dummy HDR tüm sayfayı
   `Context Lost` ile çökertti — bu cetvel tam olarak bunu imkânsız kılmak için var.)
2. **Performans bütçeden gelir, sonradan temizlikten değil.** Bütçe tasarım anında konur; "demo güzel oldu,
   sonra optimize ederiz" = anti-pattern. ([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))

Bir kural "önemli + kolay ihlal + gözle zor yakalanır" ise → **kapı (test) ister**, code-review'a bırakılmaz.
**Bu cetvel aynı zamanda showroom + tiny-planet vizyonunun temelidir:** tek Canvas + `<View>` portalları +
prosedürel environment + perf bütçeleri = o deneyimlerin altyapısı. (Tiny-planet'in teknik çekirdeği =
TSL vertex-displacement shader → §6.4.)

---

## 1. SSOT Katmanları (merkezi — tek doğru kaynak)

| Alan | Tek Doğru Kaynak | Niçin |
|---|---|---|
| **Canvas/renderer config** | tek `<VentHubCanvas>` sarmalayıcı (DPR · shadow · frameloop · colorSpace · toneMapping tek yerden) | her bileşenin kendi config'i = drift + tutarsız görsel |
| **Işık & Environment** | kamera-tabanlı 3-nokta ışık ve prosedürel environment rig'i (drei `<Environment>` + `<Lightformer>` + `frames={1}`) | arkada gölge/kararma kalmasını önler; CDN bağımlılığı ve render VRAM yükü sıfırlanır |
| **PBR materyal** | merkezi metalness/roughness **token'ları** | per-ürün sihirli-sayı = tutarsız + bakımsız |
| **Asset** | tek model/asset **registry** (yol + Draco/KTX2 + geçerlilik); **decoder'lar YEREL** (`/public/decoders/…`) | dağınık string path → bozuk/eksik asset (dummy HDR); CDN decoder = CSP + çökme riski |
| **Kamera Geometrisi** | kilitli `cameraFOV: 45°` + mesafe `14` + yükseklik `1.5` | perspektif distorsiyonunu önler ve tüm vitrinde görsel parite sağlar |
| **Boyut Normalizasyonu** | otomatik bounding-box tabanlı `scale` normalizasyonu + `3dModelOffsets.ts` | HVAC ünitelerinin fiziksel boyut farklarını sanal ortamda dengeler |
| **Arayüz Kontrastı** | Glassmorphic arayüz paneli (`backdrop-filter: blur(16px)` + `%40 dark opacity`) | W3C WCAG 2.2 kontrast şartlarını 3D dinamik arka planlar önünde korur |
| **Çoklu yüzey** | **TEK** `<Canvas>` + drei `<View>` (gl.scissor) | çoklu Canvas → context limiti → Safari en eskiyi atar → çökme |

---

## 2. Mutlak Kurallar (ihlal = mimari hata) — *kural · neden · ölçülebilir eşik · kaynak*

### A. Asla-Çökme / Dayanıklılık
- **A1 — Her asset Suspense + ErrorBoundary içinde.** Hata 3D alt-ağacını düşürür, sayfayı değil; fallback UI +
  retry/reset. *(React error boundaries; [MDN/forum](https://discourse.threejs.org/t/context-lost-when-i-route-to-another-page-in-react-three-fiber/61736))*
- **A2 — Kritik render yolunda yüklenip-bozulabilen dosya/CDN bağımlılığı YASAK.** Prosedürel environment tercih
  edilir; dosya zorunluysa **fallback + geçerlilik kontrolü** şart. **Draco/KTX2 decoder wasm'leri de yerel
  barındırılır** (`/public/decoders/`), CDN'den değil. *(dummy HDR çökmesi tam bu ihlaldi.)*
- **A3 — Context-loss kurtarma.** `webglcontextlost`/`webglcontextrestored` dinle + `WEBGL_lose_context.restoreContext()`. Eşik: context kaybı → sayfa **çökmez**, kendini toparlar. *([MDN](https://developer.mozilla.org/docs/Web/API/WEBGL_lose_context/restoreContext))*
- **A4 — `dispose()` zorunlu.** Unmount'ta geometry/material/texture/renderTarget bellekten temizlenir; GLTF için `texture.source.data.close?.()`. **R3F yalnız declaratif (`<boxGeometry/>`) nesneleri otomatik temizler; `<primitive object={...}>` ve `useGLTF` global cache'i ELLE** recursive dispose ister → §6.1. Sık aç/kapa yerine `visible={false}` (VRAM realloc'ı önler). Sızıntı = birikmiş context = kayıp. *(three.js docs · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **A5 — TEK Canvas.** Bir route'ta birden fazla `<Canvas>`/Renderer örneği yasak → çoklu yüzey drei `<View>` ile. *(Safari context limiti; [pmndrs](https://github.com/pmndrs/react-three-fiber/discussions/2457))*
- **A6 — (WebGPU geleceği)** `WebGPURenderer` async init (`await renderer.init()` → §6.4); `pushErrorScope`/`popErrorScope` + `uncapturederror` dinleyici + `GPUDevice.lost` recovery; hatalar "bulaşıcı" (contagious), merkezi yakala. Custom shader → ham GLSL string DEĞİL, **TSL Node Material** (WebGL'e de düşer). *(WebGPU W3C spec · MDN · ikinci-kaynak PART I §1)*

### B. Performans Bütçeleri
- **B1 — Draw call < 100/frame** (e-ticaret 50–100). **> 500 yasak** (güçlü GPU bile zorlanır). Araç seçimi:
  **`InstancedMesh`** = çok sayıda **aynı** geometri (bütün-ya-hiç frustum cull) · **`BatchedMesh`** = **farklı**
  geometriler tek draw call (per-instance frustum cull, pre-allocate `[maxInstance, maxVertex, maxIndex]`) ·
  drei `<Instances>/<Merged>` = declaratif sarmalayıcı · `BufferGeometryUtils.merge` (statik) · texture atlas ·
  vitrin tekstürleri için **drei `<Image>`** (basit texture loader değil; AX-06). Karar matrisi + kod → §6.2.
  Draw call **üçgenden daha kritik.** *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · [threedium](https://threedium.io/3d-model/web-ecommerce) · PART I §2)*
- **B2 — Üçgen bütçesi:** mobil 1–2k · web LOD 5–15k · konfigüratör ≤50k · adaptif 500–50k (cihaza göre); mutlak tavan <1–2M. LOD: drei `<Detailed>` (büyük sahnede +%30-40 FPS), mesafe 0/50/100m. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B3 — `frameloop="demand"` ve Geçiş Animasyonları:** Statik sahnelerde `frameloop="demand"` zorunludur (`invalidate()` ile tetiklenir). Ancak kamera pürüzsüz takip/lerp animasyonları yaparken (`lerp speed: 0.1` vb.), animasyon süresince `frameloop` geçici olarak reaktif şekilde `always` moduna alınmalı veya her karede `invalidate()` tetiklenmeli, animasyon bittiğinde tekrar `demand` moduna dönülmelidir. Tab gizliyse render durur. `useFrame` içinde nesne allocate etmek kesinlikle yasaktır (`new Vector3()` yok, temp nesne havuzu kullanılır). *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B4 — DPR cap: masaüstü 1.0 · mobil 1.5.** Drop'ta `AdaptiveDpr` + `PerformanceMonitor` ile DPR ×0.8. *(Mevcut `Product3DViewer` `dpr={[1,2]}` → mobilde fazla, düşürülecek.)* *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/))*
- **B5 — Gölge & Kamera-Tabanlı Işık:** `shadows="percentage"` (**`PCFSoftShadowMap` YASAK** — CLAUDE.md #9 / AX-02); ≤ **3 gerçek-zamanlı ışık**; statik gölge **bake** (`BakeShadows`/`<ContactShadows>`). **🔧 GÖLGE KAPSAM İSTİSNASI (2026-06-19 uzlaştırma — canlı kanıtla):** ContactShadows **YALNIZ tek-ürün, zemine-oturan yüzeyler** içindir (Product3DViewer; model origin'de, taban `y=-0.5`). **Dönen ORBIT carousel'de ContactShadows KULLANILMAZ** — ürünler halkada HAVADA döner (bir yüzeye değmez); kart-içi temas gölgesi öndeki büyük ürünün alt-yarısını karartıp tutarsız görünür (canlı denendi → kaldırıldı, PR#423). Orbit'te "grounding" = mat zemin plakası + radyal fon degradesi + ışık. **Kamera-relative ışık:** orbit kamerası ~sabit (yalnız nefes genliği) → ERTELENDİ (düşük etki); ön-yüz aydınlatması **frontal key + ACES exposure** ile çözüldü. Shadow map: mobil 512–1024 · masaüstü 1024–2048. *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B6 — Asset boyutu:** ürün başı ≤ 5–10MB · **ilk yük < 4MB**. **Draco** (geometri %80–95) + **KTX2/Basis** (GPU bellek %75–85, yük %40–50). Tekstür power-of-2, ≤4096 (mobil 256–512); texture memory < 100MB/ürün ailesi (tek 4K = 64MB VRAM). Pipeline: `gltf-transform` resize 2048 → UASTC (normal/ORM) → ETC1S (baseColor) → Draco edgebreaker → §6.3. **Decoder'lar yerel** (B6 ⊃ A2). *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · PART I §3)*
- **B7 — Yükleme:** below-fold **lazy** (`IntersectionObserver` / `content-visibility: auto` → `.content-auto`; AX-03); **progressive** (low-res 200–500ms içinde, high-res arka planda); model yüklenirken **PlaceholderWireframe** (CLS önler; AX-09); `useGLTF.preload`. Hedef: ilk render 150ms · 4G < 3s · terk eşiği 3.8s · dokunma gecikmesi < 20ms. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [cylindo](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers))*
- **B8 — Click-to-Load (ilk yük maliyeti = 0).** Ağır GLB modelleri sayfa açılışında **otomatik yüklenmez**; ancak kullanıcı etkileşimiyle (ör. "3D'yi yükle" butonu) indirilir → **LCP korunur**. *(AX-01; `ThreeDAuthority` deseni)*
- **B9 — Raycast hızlandırma.** Etkileşimli (tıklanan/hover) karmaşık mesh → drei `<Bvh>`; basit geometri → `meshBounds`. Ham raycast ana-thread'i kilitler. *(AX-11; drei `<Bvh>`)*
- **B10 — Bounding Box Normalizasyonu:** Farklı boyutlardaki HVAC modellerini vitrinde görsel olarak eşitlemek için yükleme anında modelin sınır kutusu (Bounding Box) hesaplanmalı ve çapı `1` birim olan sanal küreye sığacak şekilde otomatik ölçeklenmelidir. Ayrı ayrı scale çarpanları `3dModelOffsets.ts` üzerinden verilmelidir.

### C. Görsel Kalite / PBR
- **C1 — MeshStandard/MeshPhysical kullanan sahne → IBL/environment ZORUNLU.** Yoksa metalik (yüksek metalness) materyaller ortamdan ışık alamaz, **tamamen kararır.** *(three.js docs · drei `<Environment>`; canlı kanıt: Orbital/Infinite vitrinlerde environment yok → metaller donuk.)*
- **C2 — Color management & ACES Exposure:** sRGB output + ACESFilmic tone mapping; texture `colorSpace` doğru. ACES altında oluşan kararmayı telafi etmek için global **`toneMappingExposure: 1.3 - 1.5`** arasında ayarlanmalıdır. *(WebGPU spec: `getPreferredCanvasFormat` `rgba8unorm`/`bgra8unorm`; three.js Color Management)*
- **C3 — Materyal instance paylaş; shader variant minimize.** Aynı özellikteki tüm nesneler tek materyal referansı. *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **C4 — Üç-Noktalı Stüdyo Işık Konfigürasyonu:**
  * **Key Light:** Şiddet `1.8`, 4500K-5000K sıcak spot (`#FFF4E6`). Konum: `[5.5, 7.5, 9.5]` (Azimut: 30°, Yükseklik: 38°).
  * **Fill Light:** Şiddet `0.9`, 6500K-7500K soğuk dolgu (`#DBEAFE`). Konum: `[-7.0, 3.5, 7.5]` (Azimut: -43°, Yükseklik: 22°).
  * **Ambient Light:** Şiddet `0.85`, `#FFFFFF`.
  * **Key:Fill Şiddet Oranı:** 2:1.
  * **🔧 UYGULANAN (2026-06-19, orbit — gözle ayar):** Yukarıdaki açı/oran değerleri **önerilen başlangıç**tır; orbit'te ÖN-YÜZ önceliğiyle nudge'landı → Key `[3,5,12]`/`1.8` (daha FRONTAL: öne gelen ürünün kameraya bakan yüzü aydınlansın), Fill `[-7,4,9]`/`1.0` (oran ~1.8:1), Ambient `0.85`, **exposure `1.35`** (C2). Kod = SSOT; bu değerler gözle ince-ayar ürünüdür, "yanlış" değil.
- **C5 — Prosedürel Environment (IBL) Şeması:** CDN bağımlılığı olmaksızın yansımaları sağlamak için 4 adet Lightformer (Key, Fill, Rim, Top) rig'i kullanılmalıdır. GPU optimizasyonu için `<Environment>` bileşeninde `frames={1}` set edilmelidir.
- **C6 — Showroom UX & Bilgi Kartları:** 3D aydınlatma ve arayüz bütünüyle rasyonel B2B/B2C alım kararlarını tetiklemelidir:
  * Kademeli Açıklama (Progressive Disclosure) ve interaktif hotspots kullanımı esastır.
  * Bilgi panelinde öncelikli olarak **4 kilit HVAC metriği** gösterilmelidir: Hava Debisi ($m^3/h$), Toplam Verim (% / COP), Ses Güç Seviyesi ($dB(A)$), Elektriksel Güç ($kW$).
  * Panel arka planı metin okunabilirliğini garanti etmek için Glassmorphic (`backdrop-filter: blur(16px)` + `%40 dark opacity`) olmalıdır (W3C WCAG 2.2 uyumlu).
- **C7 — Mobil Arayüz ve Dokunma Sınırları:** Mobilde arayüz dikey kayan bir Bottom Sheet olarak açılmalı; 3D orbital döndürme alanı ile Bottom Sheet gestural alanları çakışmayacak şekilde touch collision sınırları ayrılmalıdır.

### D. Güvenlik
- **D1 — Dış GLTF/GLB/image origin-clean + CORS + HTTPS.** `crossOrigin` etiketi; CSP `connect-src` whitelist (`raw.githubusercontent.com`, `raw.githack.com` — CLAUDE.md #9 / AX-04 ile uyumlu, **kaldırma**). WebGPU origin-clean olmayan kaynakta `SecurityError` fırlatır. *(WebGPU W3C spec §3.9)*
- **D2 — Güvenilmeyen model yükleme yok;** (SaaS) asset yükleme **tenant-scoped.**

### E. SaaS / Multi-tenant
- **E1 — 3D yüzey teması/branding tenant'a göre çözülür;** asset/registry tenant-scoped (data bleeding = felaket, CLAUDE.md #12 ile uyumlu).

### F. React / Next.js Entegrasyonu
- **F1 — Ağır 3D = `next/dynamic` + `ssr:false` + `<Suspense fallback={<Skeleton/>}>`** (React.lazy DEĞİL). Ana rotalarda `ssr:false` CLAUDE.md #4 ile sadece **etkileşimli uç** 3D bileşende. *(AX-08)*
- **F2 — React 19 Compiler:** UI düğümlerini elle `useMemo/useCallback` etme. **İSTİSNA:** Three.js çekirdek nesneleri (`BufferGeometry`, `Material`, matrisler) Compiler tarafından izlenmez → her render'da yeniden yaratılmasın diye **elle memoize ZORUNLU.** *(AX-05)*
- **F3 — R3F/drei ekosistem kilidi.** React yaşam döngüsü dışında ham Three.js DOM manipülasyonu yasak; tüm WebGL/WebGPU R3F + `@react-three/drei` üstüne. *(AX-07 · CLAUDE.md #9)*

---

## 3. Conformance Kapıları — Drift Eksenleri (INV-3D-*)

> **3D testleri i18n gibi tam-statik değil** — bir kısmı **runtime/asset-parse**. Bu "farklı TÜR test" tam da
> kabul ettiğimiz nokta. Her eksen bir bug-sınıfı; kapısı olan **kalıcı kapalı**.

| # | Eksen | SSOT | Kapı (bekçi) | Tür | Durum |
|---|---|---|---|---|---|
| **3D-1** | **Asset-geçerlilik** | asset registry | `3d-asset-validity.test` — her referans `.hdr/.glb` gerçek + geçerli + parse-edilebilir (boş/dummy/404 yakalanır) | statik + dosya-parse | ✅ canlı (`3d-asset-validity.test.ts`) |
| **3D-2** | **Tek-Canvas** | `<VentHubCanvas>` | `3d-single-canvas.test` — bir route ağacında >1 `<Canvas>` yasak | statik kaynak tarama | ✅ **KİLİTLİ** — allowlist boş (#374/#375/#379) |
| **3D-3** | **Dayanıklılık** | A1 | `3d-resilience.test` — asset-yükleyen her 3D bileşen Suspense+ErrorBoundary sarmalı | statik | 🔜 |
| **3D-4** | **Merkezi-config** | SSOT §1 | `3d-central-config.test` — ham `<Canvas>` / ad-hoc `<Environment files>` / sihirli-metalness / **CDN decoder yolu** yasak → paylaşılan sistem | statik | 🟡 kısmen — `3d-procedural-env.test.ts` canlı; tam central-config açık |
| **3D-5** | **CSP/origin** | D1 | `3d-csp.test` — dış 3D origin `next.config.mjs` whitelist'inde | statik config | ✅ canlı (`3d-csp.test.ts` — stale-guard zorunlu host + drift-catch) |
| **3D-6** | **Perf-bütçe** | B1–B6 | `renderer.info` draw-call/triangle bütçe izleme (runtime proxy) — **ödünç eşikleri burada ölçümle kalibre et** | runtime/build | ⚠️ açık borç (zor; başta uyarı) |
| **3D-7** | **Model-recipe** | B3 / C3 / §1 | `3d-model-recipe.test` — model/part'ta `useFrame` içi `new` allocate + inline sihirli `metalness:/roughness:` YASAK (RATCHET) | statik kaynak tarama | ✅ canlı (2 ratchet: FlexibleDuct useFrame-geo · DuctFan magic-PBR = worker'ın atladığı = sonraki punch-list) |

**Açık eksenleri kapatma yöntemi:** ajan **paralel audit** (`audit/3d-surfaces`, mevcut envanter) → merkezi sistem
(`<VentHubCanvas>` + prosedürel environment + yerel decoder) inşası → bileşen göçü → **yeni INV-3D testi** → commit.

---

## 4. DoD — Canlı 3D'de ASLA olmamalı / DAİMA olmalı
- [ ] Hiçbir 3D hatasında (404/bozuk asset, context-loss) **sayfa çökmez** — fallback render eder.
- [ ] Bir route'ta **tek Canvas**; çoklu yüzey `<View>` ile.
- [ ] Metalik materyaller environment'lı (kararmıyor).
- [ ] Draw call < 100 · mobil DPR ≤ 1.5 · ilk yük < 4MB · ≤3 dinamik ışık.
- [ ] Ağır model **click-to-load** (otomatik LCP'yi bozmuyor); decoder'lar **yerel**.
- [ ] Işıklar kameraya bağlı (camera-relative), orbital carousel dönüşlerinde ön yüz kararmıyor.
- [ ] Key:Fill şiddet oranı 2:1 ve Kelvin renk sıcaklıkları stüdyo standartlarında (`#FFF4E6` / `#DBEAFE`).
- [ ] Modeller sınır kutusu (Bounding Box) ile çapı `1` birim olan sanal küreye normalize edilip `3dModelOffsets.ts` ile ölçeklenmiş.
- [ ] Bilgi kartı glassmorphism (blur 16px, opacity %40) ile WCAG 2.2 contrast paritesine uygun.
- [ ] Showroom panelinde 4 temel HVAC metriği (Debi, Verim, Ses, Elektrik Gücü) öncelikli listelenmiş.
- [ ] Mobilde Bottom Sheet kullanılmış, touch gesture çakışmaları engellenmiş.
- [ ] `dispose` temiz (`<primitive>`/`useGLTF` elle) — `renderer.info` üzerinde sızıntı (artan geometries/textures) yok.
- [ ] Dış asset CSP whitelist + CORS + HTTPS; CDN decoder yolu yok.

---

## 5. Mevcut Durum (ajan audit'i tamamlayacak) + İlgili

**Şu anki 3D yüzeyleri (re-audit `2026-06-17` — `docs/audits/3d-surfaces-audit-2026-06-16.md` §0; conformance TEMİZ):**
- ✅ 36 dosya re-audit → **34 temiz**. Dalga 1-6 + 06-17 recipe işleri kapattı:
  - `Product3DViewer` · `ThreeDAuthority` · `OrbitalProductsShowcase` · `InfiniteProductsShowcase` ·
    `CategoryHubOverlay` · `MegaMenu3DBackground` → hepsi `VentHubCanvas` kabuğu (ResilientCanvasBoundary
    ErrorBoundary + prosedürel `SceneLightingRig` Environment) altında → A1/A2/C1/B4/B5 **çözüldü**.
  - Tüm leaf model/parça: useMemo geometri + unmount dispose + paylaşılan materyal (B3/A4/C3 temiz);
    `DomesticFanModel` → InstancedMesh. `CategoryCard3D` · `CategorySpotlightScene` **silinmiş**.
- ⚠️ Kalan: BlueprintCanvas A1 (Suspense — düzeltildi) · CategoryHubOverlay B3 minor (tartışmalı, doğrulanacak).
- ➡️ Conformance bitti; sıradaki 3D ekseni = **görsel/showroom** (tasarım-güdümlü), bu cetvelin §0 WOW + §6.4 tiny-planet vizyonu.

**🔧 v1.2 GÖRSEL/SHOWROOM UYGULAMA DURUMU (2026-06-19 uzlaştırma — GERÇEK koda göre, iddia değil):**
- ✅ **UYGULANDI (teyitli):** ACES exposure `1.35` (C2) · prosedürel env + 4 Lightformer + `frames={1}` (C5) · 3-nokta ışık YAPISI (C4, değerler orbit'e nudge'lı) · boyut normalizasyon `SmartCenterScale` (B10, orbit yolunda) · kamera kilidi FOV45/mesafe14/yükseklik1.5 (config) · arka plan radyal degrade + mat zemin.
- ⬜ **BEKLEYEN:** ürün bilgi paneli (C6) · mobil bottom sheet (C7).
- ⚠️ **İSTİSNA/SAPMA (cetvel buna göre düzeltildi):** orbit'te ContactShadows YOK (§B5 istisnası) · kamera-relative ışık ERTELENDİ (kamera ~sabit).
- 🔒 **ZORLAYICI TEST:** yalnız GÜVENLİK kuralları INV-3D-* ile kilitli (asset-validity/csp/recipe/procedural-env/single-canvas). Yeni GÖRSEL kurallar (exposure/ışık değeri/normalizasyon) **ayarlanabilir** olduğundan rijit teste BAĞLANMAZ — uyum gözle + bu belge ile (değer testi = anti-pattern).
> **Ajanın `parallel-file-audit` skill'i** (39 dosya, `audit-rules.json` deterministik kapısı) tam envanteri +
> merkezîleştirme dalga-roadmap'ini üretecek; sonuç buraya (§5) işlenir + B6/INV-3D-6 sayıları **gerçek asset
> ölçümüyle kalibre edilir.**

**İlgili:** CLAUDE.md Kural #9 (R3F+Drei only · gölge `percentage` · GLB CDN CSP) · `.claude/skills/threejs-webgl-performance` · `i18n-localization-standard.md` (kardeş cetvel deseni) · memory `3d-roadmap-crash-then-standards` · komşu vizyon: 3D showroom (roadmap §1-L) + tiny-planet/curved-world (§6.4 TSL shader).

---

## 6. Uygulama Desenleri (kod ekleri) — "nasıl" katmanı

> Otorite (eşik + kapı) §0–§4'te; burası **referans uygulama**. Bu desenler ikinci kaynağın
> (`world_class_design_standards.md` PART I) damıtmasıdır — **decoder yolları bilinçle yerel-host'a çevrildi**
> (A2/B6: CDN bağımlılığı = çökme + CSP genişletme riski).

### 6.1 Recursive dispose (A4) — `<primitive>` / `useGLTF` için
R3F declaratif nesneleri otomatik temizler; **ham `<primitive>` ve global cache ELLE** ister:
```tsx
export function disposeSceneObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const mat of mats) {
      if (!mat) continue
      for (const key of Object.keys(mat)) {
        const v = (mat as Record<string, unknown>)[key]
        if (v && typeof (v as THREE.Texture).dispose === 'function' && (v as THREE.Texture).isTexture) {
          (v as THREE.Texture).dispose()
        }
      }
      mat.dispose()
    }
  })
}
// useEffect cleanup: return () => disposeSceneObject(modelScene)
// useGLTF.clear(path) yalnız JS cache referansını siler — VRAM için yukarıdaki dispose ŞART.
// Sık aç/kapa yerine: <group visible={isVisible}><primitive .../></group>
```

### 6.2 Draw call (B1) — InstancedMesh vs BatchedMesh
| | `InstancedMesh` | `BatchedMesh` |
|---|---|---|
| Geometri | **aynı** | **farklı** geometriler |
| Frustum cull | bütün-ya-hiç | **per-instance** |
| Kullan | binlerce aynı nesne | farklı ürün parçaları tek draw call |
```tsx
// InstancedMesh: useFrame içinde temp Object3D havuzu (B3/AX-10), her frame setMatrixAt + needsUpdate.
// BatchedMesh: pre-allocate → <batchedMesh args={[maxInstance, maxVertex, maxIndex]} />, addGeometry/addInstance.
// Declaratif kısayol:
import { Instances, Instance } from '@react-three/drei'
<Instances limit={100} castShadow><boxGeometry /><meshStandardMaterial />
  <Instance position={[0,0,0]} /><Instance position={[2,1,-2]} />
</Instances>
// Vitrin tekstürleri (Orbital/Infinite): basit texture loader DEĞİL → drei <Image /> (AX-06).
```

### 6.3 Asset pipeline (B6) — `gltf-transform` + YEREL decoder
```bash
# Sıralı sıkıştırma (KTX-Software/toktx PATH'te olmalı):
gltf-transform resize  in.glb  s1.glb --width 2048 --height 2048
gltf-transform uastc   s1.glb  s2.glb --level 4 --rdo --zstd 18 \
  --slots "{normalTexture,occlusionTexture,metallicRoughnessTexture}"   # yüksek kalite: normal/ORM
gltf-transform etc1s   s2.glb  s3.glb --level 2 --quality 128 --slots "baseColorTexture"  # yüksek sıkıştırma: baseColor
gltf-transform draco   s3.glb  out.glb --method edgebreaker --quantizePosition 14 --quantizeNormal 10
# Tek komut alternatifi: gltf-transform optimize in.glb out.glb --texture-compress ktx2
```
```tsx
// Decoder'lar YEREL (public/), CDN DEĞİL → A2 (çökme) + CSP genişletme riski yok:
const DRACO_PATH = '/decoders/draco/'     // public/decoders/draco/  (gstatic CDN değil)
const KTX2_PATH  = '/decoders/basis/'     // public/decoders/basis/  (jsdelivr CDN değil)
const { scene } = useGLTF(modelUrl, DRACO_PATH, KTX2_PATH)
useGLTF.preload('/models/hvac_fan.glb', DRACO_PATH, KTX2_PATH)
```

### 6.4 WebGPU / TSL (A6) — tiny-planet vertex-displacement çekirdeği
```tsx
// Async renderer init (WebGL2 fallback otomatik):
import * as THREE from 'three/webgpu'
<Canvas gl={async (props) => { const r = new THREE.WebGPURenderer(props); await r.init(); return r }}>
// Custom shader = ham GLSL string DEĞİL → TSL Node Material (WebGPU→WGSL, WebGL→GLSL derler):
import { Fn, positionLocal, time, vec3 } from 'three/tsl'
const waveNode = Fn(() => {                          // tiny-planet/curved-world çekirdeği
  const p = positionLocal
  const wave = p.y.mul(4.0).add(time).sin().mul(0.15)
  return vec3(p.x.add(wave), p.y, p.z)
})
// <meshStandardNodeMaterial positionNode={waveNode()} />
// NOT: TSL içinde JS if/for ÇALIŞMAZ → If/Loop/select() kullan.
```

### 6.5 Object pooling (B3/AX-10) — GC spike önleme
```tsx
// Modül kapsamı: bir kez yarat, frame'lerde yeniden kullan (useFrame içinde new YASAK):
const _tmpVec3 = new THREE.Vector3()
const _tmpBox3 = new THREE.Box3()
export const getMeshBounds = (mesh: THREE.Mesh) => _tmpBox3.setFromObject(mesh)
```

### 6.6 Kamera-Tabanlı Stüdyo Işık Rig'i ve Prosedürel Environment (B5 / C1 / C4 / C5)
```tsx
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, BakeShadows } from '@react-three/drei'
import * as THREE from 'three'

export function SceneLightingRig() {
  const lightGroupRef = useRef<THREE.Group>(null)

  // Işıkların yönünün kamerayla birlikte dönmesini veya kameraya bağlı kalmasını sağlar
  useFrame(({ camera }) => {
    if (lightGroupRef.current) {
      // Işıkları kameranın pozisyonu ve rotasyonuna kilitler (Camera-Relative)
      lightGroupRef.current.position.copy(camera.position)
      lightGroupRef.current.rotation.copy(camera.rotation)
    }
  })

  return (
    <>
      {/* Nötr ortam ışığı */}
      <ambientLight intensity={0.85} color="#ffffff" />

      {/* Kamera eksenine bağlı stüdyo 3-nokta ışıkları */}
      <group ref={lightGroupRef}>
        {/* Key Light (Sağ-Üst-Ön). FPS kaybını önlemek için castShadow=false seçilip
            gölgeler ContactShadows ile verilir ya da castShadow=true ile birlikte BakeShadows kullanılır */}
        <directionalLight
          castShadow
          intensity={1.8}
          position={[5.5, 7.5, 9.5]}
          color="#fff4e6" // 4500K warm hex
          shadow-mapSize={[1024, 1024]}
        />
        {/* Fill Light (Sol-Orta-Ön) */}
        <directionalLight
          intensity={0.9}
          position={[-7.0, 3.5, 7.5]}
          color="#dbeafe" // 6500K cool hex
        />
      </group>

      {/* B10 Bounding Box Normalizasyonu uyarınca zemin ve gölge y = -0.5 seviyesindedir */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.6}
        blur={2.5}
        far={2}
        scale={10}
      />

      {/* Gerçek zamanlı shadow map hesaplamasını dondurur ve tek karede sabitler (bake) */}
      <BakeShadows />

      {/* Prosedürel Environment / IBL (Tek seferlik bake: frames={1}) */}
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={2.0} position={[5, 4, 9]} scale={[10, 10, 1]} color="#fff4e6" />
        <Lightformer form="rect" intensity={1.6} position={[-6, 2, 6]} scale={[8, 8, 1]} color="#dbeafe" />
        <Lightformer form="rect" intensity={1.2} position={[0, 6, -6]} scale={[6, 2.5, 1]} color="#ffffff" />
        <Lightformer form="circle" intensity={1.0} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>
    </>
  )
}
```

### 6.7 Model Boyut Normalizasyonu (B10)
```tsx
import * as THREE from 'three'

export function normalizeModelScale(scene: THREE.Group): number {
  const box = new THREE.Box3().setFromObject(scene)
  const sphere = new THREE.Sphere()
  box.getBoundingSphere(sphere)
  
  const diameter = sphere.radius * 2
  if (diameter === 0) return 1
  
  // Modeli 1 birimlik sanal bir küre içine sığacak şekilde ölçeklendir
  const scaleFactor = 1.0 / diameter
  scene.scale.setScalar(scaleFactor)
  
  // Modeli merkezle (pivot noktasını orta noktaya kaydır)
  const center = new THREE.Vector3()
  box.getCenter(center)
  scene.position.sub(center.multiplyScalar(scaleFactor))
  
  return scaleFactor;
}
```

### 6.8 Glassmorphic Showroom Arayüz Paneli (C6 / C7)
```css
/* Glassmorphism CSS standardı (3D Canvas üstünde yüksek kontrast ve okunabilirlik sağlar) */
.showroom-info-panel {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 380px;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.4); /* Koyu arkaplan + %40 saydamlık */
  backdrop-filter: blur(16px); /* 16px Blur ile W3C kontrast paritesi */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  color: #f8fafc;
  z-index: 10;
  pointer-events: auto; /* Tıklanabilir olmalı */
}

/* Mobilde Bottom Sheet tasarımı */
@media (max-width: 768px) {
  .showroom-info-panel {
    right: 0;
    bottom: 0;
    top: auto;
    transform: none;
    width: 100%;
    border-radius: 20px 20px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(15, 23, 42, 0.65); /* Mobilde daha fazla yansıma kontrastı */
  }
}
```


---
# FILE: docs\standards\SOURCES.md

# Admin Standardı — Kaynak Manifestosu

> `admin-standard.md` cetvelini besleyen otorite kaynaklar + **NotebookLM ikizine nasıl yüklenecekleri.**
> Strateji: bkz. memory `knowledge-infra-pipeline` (kaynak → MD/URL → NLM RAG).

## PDF mi? — Hayır, daha iyisi var

Bu kaynakların çoğunun resmi PDF'i **yok**; ama NLM'e PDF'ten **daha iyi** beslenir:
- **`llms.txt` / `llms-full.txt`** — modern doküman siteleri LLM için tek-dosya özet üretir. NLM'e **URL olarak** direkt eklenir.
- **Repo MD docs** — GitHub'daki `.md` dosyaları (raw URL) doğrudan eklenir.
- **Web sayfası URL'i** — NLM `source_add(type=url)` ile sayfayı kendi indeksler.

→ Yani PDF aramaya gerek yok; URL/MD yeterli ve daha temiz.

---

## A. STANDART kaynakları (cetveli besler — önce bunlar)

| # | Kaynak | Repo / URL | NLM'e en iyi giriş | Ne çıkaracağız |
|---|--------|-----------|--------------------|----------------|
| A1 | **Refine** | `github.com/refinedev/refine` · `refine.dev/docs` | `refine.dev/llms-full.txt` (URL) | access-control `can()`, `useTable`, List/Create/Edit/Show, audit-log/i18n/realtime providers, "what is an admin panel" blog |
| A2 | **Shopify Polaris** | `polaris.shopify.com/patterns` | Pattern sayfa URL'leri (Resource Index, Resource Details, App Settings, Card, Common Actions) | sayfa arketipleri + layout/UX kuralları |
| A3 | **TanStack Table** | `github.com/TanStack/table` | `raw.githubusercontent.com/TanStack/table/main/llms.txt` (URL) | data-table özellik kontratı, client/server kararı |
| A4 🔜 | **Medusa Admin** | `github.com/medusajs/medusa` (`packages/admin`) | repo MD docs + anahtar TSX | gerçek ticari admin React kalıpları (data-table, CRUD, bulk) |
| A5 🔜 | **Saleor Dashboard** | `github.com/saleor/saleor-dashboard` | repo MD docs | ikinci açık-kaynak admin (çapraz doğrulama) |

## B. ARAÇ kaynakları (uygulama fazı — standartla KARIŞTIRMA)

| # | Kaynak | URL | Not |
|---|--------|-----|-----|
| B1 | shadcn/ui | `ui.shadcn.com` | temel framework — zaten stack'te ✓ |
| B2 | shadcn-admin | `github.com/satnaing/shadcn-admin` | Tailwind+Radix admin iskelet referansı |
| B3 | Origin UI / shadcn Blocks | (mevcut `VH_Curated...` dokümanında) | bileşen/blok — standart değil, araç |

---

## Yükleme planı (öneri — onay bekliyor)

1. **A1–A3** (Refine llms, Polaris pattern URL'leri, TanStack llms) → NLM "VentHub Proje Hafizasi" ikizine ekle.
2. İkize ekledikten sonra `admin-standard.md` (bu cetvel) de ikize girsin → RAG ile "X sayfası standarda uyuyor mu?" sorulabilir.
3. A4–A5 (Medusa/Saleor kod) ikinci turda.

> **Not (gürültü kontrolü):** Tüm repoyu değil, yukarıda "ne çıkaracağız" sütunundaki **parçaları** al.
> Kalite > nicelik (NLM kaynak limiti + alaka).


---
# FILE: docs\standards\admin-capabilities.md

# VentHub Admin — Yetenek Kapsamı, Bayi/Enterprise Modülü & Farklılaştırıcılar

> **Bu dosya nedir?** `admin-standard.md` "NASIL kurulur"u anlatır; bu dosya **"NE olmalı"yı** anlatır:
> hangi yetenekler bulunmalı, neyimiz eksik, **bizi ayıran ne**, ve **önce Avensair** için yol haritası.
> İkisi birlikte = VentHub admin'inin tam standardı.
>
> **Çapa kararlar:** Avensair-önce (tek-kiracı, bayi-ağı) → sonra SaaS-hazır. Farklılaşma = domain moat.
> Strateji memory: `avensair-dealer-focus`, `standard-first-strategy`, `venthub-vision`.
>
> ⛔ **SIRALAMA GÜNCELLENDİ (2026-06-17 · SSOT = `docs/DURUM-TAKIP.md`):** Yürütme önceliği artık
> **admin-önce, bayi-son** (enterprise admin shell → yeni admin özellikleri → müşteri-hesap standardı →
> **bayi R1–B2 EN SON**). Bu, `dealer-pivot-decision`'ı tersine çevirir. Bu dosyadaki "önce Avensair / §5
> Avensair-önce yol haritası" **yürütme sırası olarak HÜKÜMSÜZDÜR**; içerik *ne-olmalı yetenek envanteri*
> olarak geçerli kalır.

---

## 1. Yetenek kapsam haritası (NE) — gerçek duruma göre

| Alan | Yetenek | Durum (kanıtlı) |
|---|---|---|
| **Satış** | Siparişler (liste/pano, kargo, not, e-posta log, durum, audit) | ✅ zengin |
| | İadeler (RMA) | ✅ var |
| | Kargo/Lojistik | ✅ var |
| | Refund **aksiyonu** (durum değil işlem) | ⚠️ doğrulanmalı |
| **Katalog** | Ürünler (CRUD, CSV, health) | ✅ var |
| | Kategoriler + Authority içerik | ✅ var (HVAC teknik içerik) |
| | Stok/Envanter (rapor, hareket, QR, rezerv) | ✅ zengin |
| | **Spec-driven katalog** (debi/basınç/ses/filtre yapısal) | ⚠️ kısmi — farklılaştırıcı fırsat (§4) |
| | Kupon | ✅ var; kampanya/price-list yönetim UI ⚠️ yok |
| **Müşteri/B2B** | **Bayi/Dealer yönetimi (enterprise)** | ❌ **yok — kritik (§3)** |
| | Müşteri/CRM kartı, sipariş geçmişi | ❌ ayrı sayfa yok |
| | Proje/BOM → **Teklif → Sipariş hattı** | ⚠️ tohum var (`user_projects`), pipeline yok |
| | Bayiye özel fiyat listesi | ⚠️ veri tohumu var (`priceListId`), yönetim yok |
| **İçerik** | CMS/merchandising (banner, anasayfa) | ⚠️ sınırlı |
| **Operasyon** | Dashboard, audit, hata izleme, webhook, ayarlar | ✅ hepsi var |
| **Erişim** | Admin kullanıcı + roller (RBAC) | ✅ var |
| **SaaS** | Tenant/plan/white-label | ❌ stub — **Avensair için sonra** |

---

## 2. Öncelik çerçevesi — ÖNCE AVENSAIR

> Avensair = Vortice TR distribütörü + **bayi ağı**. Tek-kiracı. Hibrit model (kurulum + bakım).

**"Avensair'e hazır" tanımı (Definition of Done):** Avensair kendi bayi ağını bu panelden
**profesyonelce yönetebiliyor** — bayi tanımla, bayiye özel fiyat ver, bayinin projesini/teklifini
görüp siparişe çevir, bayi performansını izle. Bu olmadan "satışa hazır" değiliz.

**Sonra (talep gelirse) SaaS-hazır:** multi-tenant'ı *bugün kurmuyoruz* ama mimariyi tenant-scoped
yazıyoruz ki sonra açmak refactor değil, anahtar çevirmek olsun (bkz. `admin-standard.md §6.7`).

---

## 3. Bayi/Dealer Enterprise Modülü (en büyük boşluk — Avensair'in kalbi)

**Sade dille:** Bugün "bayi" diye bir şey yok; herkes düz kullanıcı. Bunu enterprise distribütör paneline
taşımak Avensair'in kalbi.

> **Otorite bu dosya DEĞİL** (eski hâli varsayımsaldı). Bayi modülünün:
> - **NE'si** (domain: bayi≠kullanıcı, roller, fiyat, CPQ, deal-registration) → **`dealer-network-standard.md`**
> - **NASIL'ı** (R0→B2 sırası, ORG-TIER fiyat kararı, gerçek DB zemini) → **`dealer-module-blueprint.md`**
>
> Burada tekrar etmiyoruz (drift önlemi). Tüm bayi sayfaları yine `admin-standard.md` kontratına uyar
> (Resource Index + Details + RBAC 3 katman + audit + tenant-scope).

---

## 4. Farklılaştırıcılar — "herkesin yaptığı" DEĞİL, bizi ayıran

> İlke: moat = **kod değil domain** (14 yıl HVAC + ESP IP + teknik otorite). Admin bunu **ifade etmeli**.

> **Tek ev:** Farklılaştırıcı/moat sentezi → **`../VISION.md`** (vizyon/moat) + B2B yansıması
> **`dealer-network-standard.md §13`**. Burada listeyi tekrar tutmuyoruz (drift önlemi).

**Stratejik net (bu dosyanın katkısı):** Avensair'i kazandıran çekirdek = **§3 bayi modülü + spec-driven
katalog + teklif hattı**. ESP/DW172 seçim motoru bir sonraki dalga — kopyalanamaz moat ama Avensair
DoD'si için şart değil.

---

## 4.5 Enterprise admin-platform yetenekleri — dünya standardı, bizde yok/embriyon

> **Kaynak/karar:** Shopify · Stripe · Linear · Vercel · Retool · Medusa · Saleor enterprise admin desenleri
> → NLM ikiz **kapsam-açığı denetimi** → **CodeGraph mevcut-durum doğrulaması** (2026-06-17). Bu bölüm,
> `admin-feature-recommendations-2026-06-17.md`'nin net-new kısmını **tek SSOT** olarak buraya taşır (o dosya
> silindi — mükerrerdi).
> **SINIR:** Bunlar platformu enterprise yapan **ikinci kat** — Avensair DoD P0'ı DEĞİL (o = §3 bayi A1-A4).
> Sıralama: bayi P0 → bunlar. Scope creep panzehiri.

### Grup 1 — HİÇ YOK (CodeGraph-doğrulandı)

| # | Yetenek | Mevcut durum (kanıt) | Neden değerli | Boyut |
|---|---|---|---|---|
| **N1** | Özel rol + granüler izin-matrisi editörü | Roller `src/lib/rbac.ts` kod-sabiti (`ROLE_WRITE_ACCESS`, `ADMIN_ROLES`) — UI/şema yok | Avensair "bu temsilci sadece şunu görsün" diyemez | L |
| **N2** | Uygulama-içi çeviri/lokalizasyon yönetimi | Sadece statik `i18n/dictionaries/admin/{tr,en}.ts` — admin editörü yok | Yeni dil/metin için deploy gerekiyor; i18n'i operasyona açar | M |
| **N3** | Rapor oluşturucu + kayıtlı/zamanlanmış raporlar | Statik dashboard + CSV export var; kullanıcı-tanımlı şablon/zamanlama yok | "Her Pazartesi şu raporu e-postala" = enterprise standart | L |
| **N4** | API anahtarı / PAT yönetimi | Sadece edge-fn iç `apiKey` config; admin yüzeyi/tablosu yok | Entegrasyon + SaaS için şart; üret/iptal/scope + audit | M |

### Grup 2 — EMBRİYON (kodda tohum var → dünya-standardına çıkar; en yüksek kaldıraç)

| # | Yetenek | Mevcut (doğrulandı) | Dünya-standardına ne lazım | Boyut |
|---|---|---|---|---|
| **E1** | Komut paleti (⌘K) + global federe arama | `components/admin/CommandPalette.tsx` (nav+ürün) | Tüm kaynaklarda (sipariş/iade/bayi/SKU) typeahead + aksiyon | M |
| **E2** | Aksiyon-alınabilir bildirim inbox'ı | `AdminRealtimeNotifications` (toast) | Atanabilir/okundu/çözüldü merkezi inbox | M |
| **E3** | Onay / maker-checker iş akışı motoru | sadece deal-reg planı | Eşik-üstü iade/iskonto/cari → çok-seviyeli onay (jenerik) | L |
| **E4** | Kayıt-başı aktivite zaman-tüneli | global `admin_audit_log` | "Bu siparişe ne oldu" birleşik kronoloji (diff+not+durum) | M |
| **E5** | Medya/varlık kütüphanesi (DAM) | storage bucket'lar | Merkezi ara/etiketle/yeniden-kullan görsel yönetimi | M |
| **E6** | Toplu grid editörü | `EditableCell` (tek hücre) | Excel-vari çoklu-satır toplu düzenle/yapıştır | M |
| **E7** | Impersonation / "şu rol/müşteri gözüyle gör" | bayi masquerade (planlı) | Support için genel impersonation modu | M |
| **E8** | Klavye-nav sistemi + kısayollar | ⌘K, `/`, Esc | `g+o`/`g+p` power-user navigasyon haritası | S |
| **E9** | Kayıt-içi dahili not + @bahsetme | sipariş notu | @mention + kayıt-içi işbirliği katmanı | M |
| **E10** | CSV içe-aktarma sihirbazı | `ProductCsvImport` (katı şablon) | Kolon→şema drag-drop eşleme + önizleme | M |

> **Enterprise admin shell (UI/menü modernizasyonu):** **E1 + E2 + E8 + modern sol-nav** = Linear/Vercel/Stripe
> hissi. "Menü sistemini yenilikçi bulmuyorum" derdinin doğrudan karşılığı. Görsel yön = **VENTHUB DESIGN SYSTEM**
> defteri (`a1ca5476-c6c6-42aa-b5b8-3eb565b3f100`). Build edilince her birinin **yapısal kontratı `admin-standard.md`'ye** eklenir (NASIL).

> **Ayrıca bekleyen veri-doğruluk borcu:** AdminDashboardPage `SalesChart` hâlâ **dummy** veri besliyor
> (`src/views/admin/AdminDashboardPage.tsx:60-67`, "to pass build" yorumu) + rota `ssr:false` (kural 4) →
> gerçek `venthub_orders` zaman-serisine bağla.

---

## 5. Avensair-önce yol haritası (sıralı) — ⛔ YÜRÜTME SIRASI HÜKÜMSÜZ (2026-06-17)

> ⛔ **SUPERSEDED (yürütme sırası):** Güncel öncelik **admin-önce, bayi-son** (`docs/DURUM-TAKIP.md`).
> Aşağıdaki numaralı "bayi-önce" sıra **artık geçerli değil** — madde **içerikleri** referans kalır, **sırası** değil.
>
> ⚠️ **Bayi modülü sıralaması `dealer-module-blueprint.md §3`'e tabidir:** B1-B2 (panel/seed) ÖNCESİ
> R0–R5 ONARIM şarttır. Aşağıdaki "bayi modülü" maddesi, blueprint'in onarım-sonra-inşa sırasına göre
> okunmalı — kırık altyapı üstüne inşa olarak değil.

1. **Bayi modülü** → `dealer-module-blueprint.md` R0–B2 (onarım → panel → seed). *(Avensair DoD çekirdeği)*
2. **Spec-driven katalog** (§4): ürün spec'lerini yapısal veriye al → faceted filtre.
3. Mevcut admin'i `admin-standard.md` cetveline göre **standartlaştır** (ortak tablo kiti, RBAC/audit boşlukları).
4. Refund aksiyonu + CMS/merchandising (ikinci dalga).

> Her yeni sayfa `admin-standard.md §8` cetveline uyar.

## 6. SaaS-hazır (sonra — bugün kurma, hazırlığını yap)

- Tüm yeni tablo/sorgu **tenant-scoped** kolon taşısın (boş geçilebilir) → sonra doldurmak kolay.
- Bayi modülü zaten "organizasyon" kavramı getiriyor → multi-tenant'a doğal köprü.
- Avensair sözleşmesinde kapsamı dondur (scope creep panzehiri — `venthub-vision`).

---

*Kaynak: CodeGraph ile doğrulanmış mevcut durum (projects/price-list/invoice tohumları, dealer katmanı yok)
+ `admin-standard.md` yapısal standardı + `venthub-vision` moat. Strateji: `avensair-dealer-focus`.*


---
# FILE: docs\standards\admin-design-standard.md

# VentHub Admin Tasarım & Etkileşim Cetveli

> **SSOT.** Admin panelin **görünüşü, hissi ve yerleşim mekaniği**. `admin-standard.md` "nasıl
> kurulur"u (yapı/davranış) anlatır; bu cetvel **"nasıl görünür ve nasıl davranır"ı** sabitler.
> **Kapsam:** `src/app/admin/**`, `src/views/admin/**`, `src/components/admin/**` + admin'in
> kullandığı paylaşılan kabuk parçaları.
> **Kardeş cetvel:** `storefront-design-standard.md` — kapsamı açıkça *"`src/` eksi admin"*, yani
> admin'i dışarıda bırakıyordu. Bu dosya o boşluğu kapatır.
> v1.0 · 2026-08-15 — kabuk/overlay denetimi + 3 paralel kaynak araştırması sonrası ilk sürüm.
> Zorlama planı: §6 (INV-ADMIN-* testleri + zoom kapısı + mobil viewport projesi).
> v1.1 · 2026-08-16 — §7.3 eklendi: Faz 5 sayfa-başı ölçümü (21 sayfa + kabuk, %69) + sayaç kör noktaları.
> v1.2 · 2026-08-17 — §6.1 eklendi: yeni admin rotasında UI izni ⊆ DB izni ölçüm yükümlülüğü (sessiz-boş sınıfı 3 kez görüldü).

---

## 0. Bu cetvel neye cevap veriyor

Üç somut şikâyet ölçüldü ve kod düzeyinde doğrulandı:

1. *"Sol menü doğru mekanizma ile çalışmıyor"* → §2.4, §2.5
2. *"Ana ekran scroll ile küçültülüp büyütüldüğünde doğru çalışmıyor"* → §2.1, §2.2, §2.3
3. *"Nerede açılır pencere, nerede genişleyen pencere, nerede popup olacak"* → §4

Bir dördüncüsü ölçüm sırasında çıktı: panelin görsel dili kurumsal panel normlarının dışında (§3).

---

## 1. Ölçülen drift (2026-08-15)

| # | Kusur | Kanıt | Çözen bölüm |
|---|---|---|---|
| D1 | **Üç kat iç içe tam-ekran kabuk** — `MainLayout` (`min-h-screen` + 48px bar) > `AdminLayout` (`h-screen` + `overflow-hidden`) > `CategoryBuilderView` (`h-screen`) | `MainLayout.tsx:61-73`, `AdminLayout.tsx:121`, `CategoryBuilderView.tsx:279` | §2.1 |
| D2 | Kalıcı **iki scrollbar**; belge hiç scroll etmiyor; footer hep katlanın altında | D1'in sonucu | §2.1 |
| D3 | Zoom'da içerik kırpılıyor, kaçış scroll'u yok | kök `overflow-hidden` | §2.3 |
| D4 | Sidebar kapanınca **280px ölü sütun** kalıyor; içerik genişlemiyor | `AdminLayout.tsx:153-156` — `lg:relative` + `w-280px` + `-translate-x-full` | §2.4 |
| D5 | Geçiş **animasyonlanmıyor** — `transition-colors` yazılmış, `transform`/`opacity` değişiyor | `AdminLayout.tsx:154` | §2.4 |
| D6 | Kapalı menü **hâlâ Tab'la geziliyor** (`inert` yok) | `AdminLayout.tsx:153-179` | §2.5 |
| D7 | Mobilde **backdrop / ESC / focus-trap / scroll-lock yok** | aynı | §2.5 |
| D8 | Menüde **rol filtresi yok** → yetkisiz link görünüp `AccessDenied` duvarına çarpıyor | `AdminLayout.tsx:92-118` | §2.4 |
| D9 | Aktif vurgu **tam eşitlik** → alt rotalarda menü ölü; `aria-current` yok | `AdminLayout.tsx:167` | §2.6 |
| D10 | 21 rotanın **7'si menüde yok**; breadcrumb yok | rota envanteri | §2.6 |
| D11 | **`<Toaster/>` admin'de mount edilmiyor → 127 `toast.*` çağrısı ölü** | `MainLayout.tsx:61` erken dönüş | §4.6 |
| D12 | **21 `window.confirm` + 7 `alert`**; `ConfirmDialog` bileşeni yok | envanter | §4.7 |
| D13 | **~26 bağımsız overlay implementasyonu**, ortak sarmalayıcı yok | envanter | §4 |
| D14 | 6 modalda ESC handler'ı odaklanamayan `<div>`'e bağlı → **hiç çalışmıyor** | envanter | §4.8 |
| D15 | Overlay katmanında **~%40 ham `z-*`**; tarih popover'ı `z-toast` (9999) ile modalların 99 kat üstünde | `DateRangePicker.tsx:139` vd. | §4.9 |
| D16 | **Her şey `font-black` + `uppercase` + `tracking-widest`** — hiyerarşi yok | `adminUi.ts:3,4,10,11,14,15,17-20,31` | §3.2 |
| D17 | Tablo satırı **~60px** (`px-6 py-5`) — kurumsal norm 32-48px | `adminUi.ts:10,11` | §3.1 |
| D18 | Her kartta **`shadow-[0_0_40px_rgba(0,0,0,0.3)]`** (Y-offset 0 = *glow*) | `adminUi.ts:6` | §3.3 |
| D19 | Köşe dili karışık: `rounded-hvac-*` token'ı ile ham `rounded-xl/2xl` yan yana | `adminUi.ts:7,14,17,23` | §3.5 |
| D20 | `w-3/10` **hiç var olmayan sınıf** → ikinci arka plan blob'u hiç çizilmiyor (ölü kod) | `AdminLayout.tsx:124` | §3.3 |

---

## 2. YERLEŞİM & SCROLL MEKANİĞİ (kabuk)

### 2.1 Scroll sahipliği — **belge scroll eder**

**Kural: kabuk kökü scroll konteyneri OLAMAZ.**

```
✅ DOĞRU                              ❌ YANLIŞ (mevcut)
<div class="min-h-svh">               <div class="h-screen overflow-hidden">
  <header class="sticky top-0">         <header class="h-16 flex-none">
  <div class="flex">                    <div class="flex-1 flex overflow-hidden">
    <aside>…</aside>                      <aside>…</aside>
    <main>{children}</main>               <main class="overflow-y-auto">…</main>
  </div>                                </div>
</div>                                </div>
```

**Gerekçe (Chromium root-scroller explainer):** belge kaydırıcısının yalnızca `documentElement`'e
verilen ayrıcalıkları var ve iç konteyner bunların **hiçbirini** alamaz:

| Yetenek | İç konteynerde |
|---|---|
| Mobil URL çubuğunun gizlenmesi | ✗ (kalıcı ~60-100px alan kaybı) |
| Overscroll glow / rubber-band | ✗ |
| Pull-to-refresh | ✗ |
| Space / PageDown ile sayfa atlama | ✗ (konteyner odaktaysa çalışır) |
| iOS Safari üst-bara dokunup başa dönme | ✗ |
| Döndürmede scroll çıpalama | ✗ |

Ek bedeller:
- **Scroll restoration ölür.** `history.scrollRestoration` **belge** scroll konumunu geri yükler; iç
  konteynerin `scrollTop`'unu değil. Elle `sessionStorage` + `useLayoutEffect` yazmak gerekir.
- **`scroll-behavior: smooth` sessizce çalışmaz.** MDN: kök elemanda tanımlanınca viewport'a uygulanır,
  `body`'den **viewport'a propagate etmez**. Her scroll kutusuna ayrı yazılmak zorunda.
- **`position: sticky` sahibi değişir.** Sticky öğe *"en yakın scroll mekanizmasına yapışır — o ata
  gerçekten kayan ata olmasa bile"*. `overflow-hidden` sarmalayıcı, sticky'yi **hiç kaymayan** bir
  kutuya yapıştırır → başlık hiç hareket etmez. ("Sticky çalışmıyor" hatalarının kökü budur.)
- **WCAG F69** `overflow: hidden`'ı kırpılmanın birebir sebebi olarak adlandırır.

**Sektör teyidi:** Polaris `Frame` (`.Main`'de hiç `overflow` bildirimi yok) ve Carbon UI Shell
(header/side-nav `fixed`, content `margin`) belge scroll'u kullanır. Atlassian'ın yeni
`navigation-system`'i tersini yapar — ama tam kabuk sistemi olarak inşa edip yukarıdaki telafileri
kendisi üstlenir.

**İstisna:** Bir bölge kendi içinde kayabilir (ör. sanal listeli ızgara), ancak:
- kabuk başına **en fazla 1** iç scroll konteyneri,
- **adlandırılmış** ve gerekçesi yorumla yazılmış,
- kendi `scroll-behavior`, `scroll-padding-top`, `overscroll-behavior: contain` ve scroll-restore
  kodunu getirir.

**Tam-ekran çalışma yüzeyleri** (ör. CategoryBuilder) kabuğun **içine** değil, kendi route-group'una
(`(fullscreen)`) alınır. Kabuk içinde ikinci bir tam-ekran kabuk kurmak yasak.

### 2.2 Viewport birimleri — **`svh`**

MDN: **`vh` ≡ `lvh`** — yani `100vh` "dinamik araç çubukları *gizliyken*ki yükseklik" demektir.
Sayfa yüklendiğinde araç çubukları açıktır → `100vh`'lik kutu **daima taşar**.

| Birim | Kullan |
|---|---|
| `svh` | **Kabuğun varsayılanı.** Araç çubuğu açıkken bile kırpmaz; sabit → reflow üretmez. |
| `dvh` | Yalnız tek elemanlı tam-ekran örtüşme (ör. mobil full-screen dialog), gerekçesi yorumda. |
| `lvh` / `vh` | **Kabukta yasak.** Yalnız kasıtlı olarak araç çubuğu altına uzanan dekoratif katman. |

**`dvh` tuzağı (MDN, birebir):** *"using viewport-percentage units based on the dynamic viewport size
can cause the content to resize while a user is scrolling a page. This can lead to degradation of the
user interface and cause a performance hit."* → Kabuk yüksekliğine `dvh` koymak, her scroll'da tüm
kabuğu yeniden düzenler. **"`100vh` yerine `100dvh` yaz" tavsiyesi eksiktir.**

Tailwind `min-h-screen` = `100vh` → **`min-h-svh` kullanılır.** (shadcn/ui Sidebar da `h-svh`/`min-h-svh`
kullanıyor; kaynak kodunda `vh` hiç geçmiyor.) Tarayıcı tabanı: Chrome 108+, Firefox 101+, Safari 15.4+.

### 2.3 Zoom dayanıklılığı — normatif eşikler

Dördü de **Level AA**, biri diğerini karşılamaz:

| SC | Gereksinim (birebir özet) |
|---|---|
| **1.4.10 Reflow** | 320 CSS px genişlikte (≡ **1280px viewport @ %400 zoom**) ve 256 CSS px yükseklikte **iki-yönlü scroll olmadan**, bilgi/işlev kaybı olmadan sunulabilmeli |
| **1.4.4 Resize Text** | Metin **%200**'e kadar büyütülebilmeli, içerik/işlev kaybı olmadan — **ara adımlarda da** |
| **2.4.11 Focus Not Obscured** | Klavye odağı alan bileşen, yazar içeriği tarafından **tamamen gizlenemez** |
| **1.4.12 Text Spacing** | `line-height ≥1.5×`, paragraf `≥2×`, `letter-spacing ≥0.12×`, `word-spacing ≥0.16×` uygulandığında kırpılma/örtüşme olmamalı |

1.4.10'un kritik alt-kuralı: istisna **bölüme** verilir, hücreye değil — *"each cell within a table
would still need to meet this success criterion."* "Admin tablom var, muafım" savunması tabloyu
kurtarır, hücre içeriğini kurtarmaz.

**Yasaklar (her biri adlandırılmış bir failure tekniğine bağlı):**

| # | Yasak | ID |
|---|---|---|
| 1 | Kökte `height:100vh` + `overflow:hidden` | F69 |
| 2 | Sabit px yükseklikli başlık/panel (`h-16`, `height:64px`) | F69 |
| 3 | `vw` tabanlı tipografi (`font-size: 1vw`) | F94 |
| 4 | Metin kapsayıcı boyutunu px ile vermek (`em`/`rem` yerine) | C28 ihlali |
| 5 | %400 zoom'da hâlâ fixed kalan üst bar + yan çubuk + alt aksiyon çubuğu (üçü birden) | C34 |
| 6 | Sticky öğenin klavye odağını örtmesi | **2.4.11 (AA)** |
| 7 | Dar viewport'ta öğeleri eşdeğer erişim vermeden `display:none` | F102 |
| 8 | Sabit satır yüksekliği + `line-height` override'a kapalı düzen | F104 |
| 9 | Filtre/arama input'larının metinle büyümemesi | F80 |
| 10 | Uzun SKU/URL string'lerinin taşması (kırma yok) | C33 ihlali |

**Deterministik zoom kapısı (§6'da otomatize edilir):**
1. 1280×1024 viewport → **%400 zoom** (≡ 320×256 CSS px) → hiçbir yerde **iki-yönlü scroll yok**,
   1280'de görünen her öğeye eşdeğer erişim var.
2. Ayrıca yalnız metin **%200** → hiçbir metin/kontrol clipped/truncated/obscured değil.
3. Ayrıca text-spacing (1.5 / 2 / 0.12 / 0.16) → kırpılma/örtüşme yok.

> **Dürüstlük notu:** 1.4.10 altında `overflow:hidden`'ı doğrudan adlandıran bir failure tekniği
> **yoktur**; `overflow:hidden` yalnız **F69** (1.4.4) altında geçer. 1.4.10'un tek failure'ı **F102**'dir
> ve CSS mekanizmasını adlandırmaz. "F102 = overflow-hidden failure" diye yazmayın.

> ⚠️ **ÖLÇÜM TUZAĞI — zoom kapısını yazacak kişi bunu bilmeli.**
> `html, body { overflow-x: hidden }` yürürlükteyken **`scrollingElement.scrollWidth` yatay taşmayı
> RAPORLAMAZ.** 2026-08-15'te ölçüldü: canlı sayfaya 3000px genişlikte bir öğe enjekte edildi,
> `scrollWidth` **hiç değişmedi** (310px → 310px). Yani kural yerindeyken naif bir
> `scrollWidth > innerWidth` kontrolü **her zaman yeşil yanar** ve kırpılan içeriği göremez.
>
> Doğru yöntem: ölçümden hemen önce `documentElement.style.overflowX = 'visible'` (ve `body` için de)
> uygulayıp yeniden düzen tetiklemek. Bu aynı zamanda *"kuralı kaldırırsam ne olur"* sorusunun
> birebir cevabıdır. Araç: `scripts/a11y/reflow-scan.mjs` — ve o araç, **bilerek taşma enjekte
> edilerek** görebildiği kanıtlandıktan sonra kullanıldı (310px → 3000px).
>
> Genel ders: **tek genişlikte ölçmek yetmez.** Admin'de bildirilen kırpılma 320px'te *görünmüyordu*
> (orada mobil dal devreye girip kurtarıyor); gerçek bant **~768–1100px** idi. Tarama en az
> {320, 768, 1024, 1280} genişliklerinde koşmalı.

### 2.4 Sidebar mekaniği — **gap + fixed deseni**

**D4'ün kökü:** `lg:relative` + genişlik akışta kalırken `-translate-x-full` uygulamak **görsel** bir
transformdur; layout kutusunu küçültmez. `visibility:hidden` de küçültmez (MDN: *"still affects layout
as normal"*). Kutuyu küçülten tek doğru desen:

```
SidebarProvider            display:flex; width:100%; min-height:100svh
│                          --sidebar-width: 16rem   --sidebar-width-icon: 3rem
├─ Sidebar kökü            width: auto        ← AÇIK GENİŞLİK VERİLMEZ
│  │                       data-state = expanded|collapsed
│  │                       data-collapsible = ""|offcanvas|icon
│  ├─ [gap]                position:relative              ← AKIŞTA, YER TUTAR
│  │                       width: var(--sidebar-width)
│  │                       transition: width 200ms linear
│  │                       [collapsible=offcanvas] → width: 0
│  │                       [collapsible=icon]      → width: var(--sidebar-width-icon)
│  └─ [panel]              position:fixed; inset-block:0; height:100svh
│                          ← AKIŞ DIŞI, GENİŞLİĞE KATKISI SIFIR
│                          transition: left,width 200ms linear   ← gap ile AYNI süre+easing
└─ <main>                  flex: 1 1 0%
```

**Değişmezler — biri bozulursa 280px ölü sütun geri gelir:**

1. Yer tutan kutu **akışta**, görünen panel **`fixed`**. İkisi de `fixed` olursa D4 tekrarlanır.
2. **Sidebar kökünün açık genişliği olmamalı** (`width:auto`). Köke `w-64`/`w-280px` yazmak, gap'in
   daralmasını anlamsız kılar — kutu sabit kalır. **En sık yapılan hata budur ve D4 tam olarak budur.**
3. Genişlikler **CSS custom property** (kural 8: `tokens.js`'ten türet, arbitrary değer değil).
4. `data-*` **köke** yazılır; alt parçalar `group-data-[…]` ile okur.
5. Gap ve panel **aynı `duration` + aynı `ease`** — yoksa panel içerikten kopar.
6. JS breakpoint ile CSS breakpoint **aynı sayı**. Ayrışırsa aradaki 1px'te ne panel ne drawer görünür.

> **`grid-template-columns: 0fr → 1fr` alternatifini kullanma.** MDN'in animation-type tanımı
> *"simple list of length, percentage, or calc"* diyor; `fr` bu listede yok → geçiş spesifikasyona
> göre garanti değil.

**Sayısal sözleşme** (kaynak yakınsaması; Carbon 256/48/48 · shadcn 256/48/288/768 · Polaris 240/56/768 ·
Atlassian 320/48 · M3 rail 80-96dp, drawer 360dp):

| Kalem | Değer |
|---|---|
| Üst bar yüksekliği | **56px** (48px de meşru; başka değer yok) |
| Açık sidebar | **16rem = 256px** |
| İkon rayı (rail) | **3rem = 48px** (salt ikon) |
| Mobil drawer | **18rem = 288px** (veya `min(90%, 320px)`) |
| Drawer'a geçiş eşiği | **768px** (JS ve CSS **aynı sayı** olmak zorunda) |
| Ray moduna geçiş (opsiyonel) | 1056–1200px |
| Geçiş süresi | **200ms linear**, gap ve panel için aynı |

**Üç durum zorunlu:** genişletilmiş (256px) · **ikon rayı (48px)** · gizli/drawer (<768px).
Mevcut panelde ray modu **yok** — ikili aç/kapa yetersiz.

**Kalıcılık: cookie, localStorage değil.** `sidebar_state`, `path=/`, 7 gün; RSC layout'ta
`cookies()` ile okunup `defaultOpen`'a geçirilir. Gerekçe: localStorage sunucuda okunamaz → SSR daima
yanlış varsayılanı render eder, ilk boyada menü zıplar.
**VentHub eki (kural 12):** cookie **tenant-scoped** olmalı — düz `path=/` çerezi multi-tenant'ta sızar.

> ⚠️ **shadcn/ui'ı kopyalıyorsan bunları düzelt:** `SidebarTrigger`'da `aria-expanded` ve
> `aria-controls` **yok**; `SidebarMenuButton` `data-active` yazıyor ama `aria-current="page"` yazmıyor.
> `axe` bunları **yakalamaz** (buton adı var, eksik olan *durum*). Ayrıca kısayol `event.key === "b"`
> küçük harf karşılaştırması → Caps Lock'ta çalışmaz ve input içinde de tetiklenir.
> Ek not: güncel shadcn dokümanından `Persisted State` bölümü kaldırılmış — kod cookie'yi hâlâ
> *yazıyor* ama okuma örneği dokümante değil. `cookies().get("sidebar_state")` okumasını **elle ekle**,
> yoksa kalıcılık sessizce çalışmaz.

**Menü içeriği:**
- Öğeler **tek registry'den** (§10.4 S1 — sidebar ve komut paleti aynı kaynağı tüketir).
- **RBAC-filtreli:** `canAccess` false ise öğe **listelenmez** (D8). Görünür link + AccessDenied duvarı
  kabul edilemez.
- Gruplar 6'yı geçerse accordion; geçmiyorsa düz başlık yeterli.
- **Her rota menüden erişilebilir olmalı** ya da bilinçli olarak "yalnız derin bağlantı" işaretlenmeli
  (D10: 7 rota kayıp).

### 2.5 Mobil drawer sözleşmesi

**Kapalıyken zorunlu:**
- Layout kutusu **0'a iner** (§2.4 gap deseni)
- **`inert`** — yalnız `translate` **yasak** (D6)

| Mekanizma | Layout kutusu | Odaklanabilir | A11y ağacı | Animasyon |
|---|---|---|---|---|
| `display:none` | kaldırılır | ✗ | dışında | **yok** |
| `visibility:hidden` | **kalır (ölü boşluk)** | ✗ | dışında | var |
| **`inert`** | kalır | ✗ | dışında | var |
| `-translate-x-full` (mevcut) | kalır | **✓ hâlâ tab'lanır** | **içinde** | var |

`inert` kapsamı (MDN): click ateşlenmez · odaklanamaz · **find-in-page bulamaz** · metin seçilemez ·
a11y ağacından çıkar. Flat-tree torunlarına cascade eder.

**Açıkken zorunlu (WAI-ARIA APG Dialog pattern):**
backdrop · focus trap (Tab döngüsü içeride kapanır) · **ESC ile kapanma** · odağın **tetikleyiciye
dönmesi** · body scroll lock · `role="dialog"` · **`aria-modal="true"`** · `aria-labelledby`/`aria-label` ·
tetikleyicide `aria-expanded` + `aria-controls`.

> ⚠️ **Radix Dialog kullanıyorsan iki tuzak (lokal `@radix-ui/react-dialog@1.1.15` dist'inden doğrulandı):**
> 1. Radix **`aria-modal` basmıyor** — `aria-modal` string'i dist'te hiç geçmiyor. Bunun yerine
>    `aria-hidden` paketinin `hideOthers()`'ını çağırıyor, yani arka plan ekran okuyucudan gizlenir ama
>    **DOM'da hâlâ tab'lanabilirdir**; klavye korumasını tamamen JS focus-trap sağlar. `aria-modal`'ı
>    **elle ekle**. (Native `inert` ikisini birden yapar ve JS gerektirmez.)
> 2. **Body scroll lock `<Dialog.Overlay>` içindedir.** "Backdrop istemiyorum" diye Overlay'i çıkaran
>    bir uyarlama scroll lock'u **sessizce kaybeder**. Overlay asla çıkarılmaz.

CSS tarafı: `overscroll-behavior: contain` (zincirlemeyi keser, bounce'ı korur). Tek başına yetmez —
iOS Safari'de backdrop üzerinde doğrudan kaydırma için `react-remove-scroll` benzeri katman gerekir.

### 2.6 Konum bildirimi: aktif durum, breadcrumb, skip-link

**`aria-current="page"`** (MDN): *"Only mark one element in a set of elements as current."*

Eşleme mantığı (D9'un düzeltmesi):
```
aktif ⟺ pathname === href  ||  pathname.startsWith(href + "/")
```
Kök yol (`/admin`) bu kurala **girmez** — tam eşitlik ister, aksi halde her sayfada eşleşir.
Bir ağaçta **yalnız en derin** eşleşen öğe `aria-current="page"` alır; ataları **görsel olarak**
vurgulanabilir ama `aria-current` **almaz** (MDN'in "only one" kuralı). Ayrım:
ata → `data-active-ancestor`, yaprak → `aria-current="page"`.

`role="tab"` kullanan bir nav'da doğru öznitelik `aria-selected`'dır, `aria-current` değil.

**Breadcrumb:** koşulu **hiyerarşi derinliğidir**, sayfa sayısı değil (APG: *"list of links to the
parent pages of the current page in hierarchical order"*). Sidebar zaten 1. seviyeyi gösterdiği için
breadcrumb **3+ seviyede** zorunlu (ör. `/admin/inventory/settings`), 2 seviyede sidebar + sayfa
başlığı yeterli. Yapı: `<nav aria-label>` + sıralı liste; son öğe `aria-current="page"`.

**Skip-link — atlanmış Level A maddesi.** Kalıcı sidebar, **SC 2.4.1 Bypass Blocks (Level A)**'nın
tarif ettiği "repeated block"tur. Kabuk, sayfa başında ana içeriğe atlama linki sunmak **zorundadır**
(teknik G1 + ARIA11). Polaris bunu `Frame`'in kendisine gömmüş (`skipToContentTarget`). Bu, cetvelde
**kabuğun sorumluluğudur**, sayfaların değil.

### 2.7 Sticky başlık

- `position: sticky` + **daima bir inset property** (`top-0`). MDN: her iki inset `auto` ise sticky
  **`relative` gibi davranır** — sessiz no-op.
- Başlık ile scroll konteyneri arasında **hiçbir `overflow` bildirimi olamaz** (§2.1'deki sahiplenme
  tuzağı).
- `html { scroll-padding-top: var(--header-h) }` — `#hash` çıpasının başlık altında kalmaması için.
  MDN: `scroll-padding` **scroll konteynerine** yazılır, hedefe değil.
- Dar/kısa viewport ve %400 zoom'da `position: static`'e dön (WCAG advisory teknik **C34**).
- Toplam sticky/fixed dikey yükseklik viewport'un **%25**'ini geçmemeli.
  *(Bu sayı W3C'den gelmiyor — bu cetvelin kendi ratchet'idir. W3C sayısal eşik vermiyor, yalnız
  "significantly reduce the available space for reading" diyor.)*

---

## 3. GÖRSEL KOMPOZİSYON

> **Yön kararı (2026-08-15, Recep):** nötr kurumsal panel dili — Linear / Stripe / Vercel hissi.
> Koyu cam + neon + glow estetiğinden çıkılıyor.

### 3.1 Yoğunluk (density)

Kurumsal panelin birinci işi **ekrana veri sığdırmaktır**. Carbon'un kaynak kodundan (v11):

| Kademe | Satır yüksekliği | Hücre dikey padding |
|---|---|---|
| Compact | **32px** | 6-7px |
| **Standart (varsayılan)** | **40px** | 6-7px |
| Rahat | **48px** | — |
| Uzun (2 satırlık içerik) | 64px | 16px |

- Hücre yatay padding **16px**.
- **Başlık satırı = gövde satırıyla aynı yükseklik** (Carbon: *"The column header row should always
  match the row size of the table."*)
- 64px yalnız *"if your data is expected to have 2 lines of content in a single row."*
- Yoğunluk kullanıcı tercihi olarak sunulabilir; varsayılan **standart (40px)**.

❌ Mevcut `px-6 py-5` (~60px) — en gevşek kademenin bile üstünde. **Yasak.**

### 3.2 Tipografi rolleri

| Rol | Boyut | Ağırlık | Satır yüksekliği |
|---|---|---|---|
| Sayfa başlığı (H1) | 24px | 600 | 32px |
| Bölüm başlığı (H2) | 20px | 600 | 28px |
| Kart başlığı (H3) | 16px | 600 | 24px |
| Tablo başlık hücresi | 14px | **600** | 20px |
| **Gövde / tablo hücresi** | **14px** | **400** | **20px** |
| İkincil / caption | 12px | 400 | 16px |
| Etiket (form) | 12–14px | 500 | 16–20px |

**Üç sert kural:**

1. **`font-black` (900) yasak.** İncelenen dört token setinin **hiçbirinde 700'ün üstü ağırlık
   tanımlı değil**: Radix max 700, Polaris max 700, Atlassian max Bold, Carbon "productive" ölçeğinde
   **max 600**. Hiyerarşi ağırlıkla değil **boyut + renk + boşlukla** kurulur.
2. **Gövde metni 400 (regular).** Dördü de böyle. `500/medium` paragraf için değil — Atlassian'ın
   kuralı: medium = *bileşen içi* metin ve *ikon yanındaki* metin (buton etiketi, tab, ikonlu satır).
3. **UPPERCASE bir tipografi rolü değil.** Dört sistemin token setinde `text-transform: uppercase`
   tanımlı **tek bir metin stili yok**. Material 3 all-caps butonu M1 kalıntısı olarak kaldırdı; her
   şey sentence case. İzin verilen tek kullanım: **11–12px "eyebrow" etiketi**, harf aralığı açılmış,
   sayfada **en fazla 1–2 yerde**. Buton, başlık, tablo hücresi, alt-başlıkta **yasak**.

❌ Mevcut `adminUi.ts`: başlık, alt-başlık, tablo başlığı, tablo hücresi, buton, etiket, satır-eylemi —
**hepsi** `font-black` + `uppercase` + `tracking-widest`. Tamamı değişecek.

### 3.3 Yüzey · kenarlık · gölge

**Kart gölgeyle değil KENARLIKLA ayrılır.**

- shadcn nötr paletinde light temada `--card` = `--background` (**aynı renk**); ayrım tamamen
  `--border` 1px hairline. Dark temada kart bir tık açılır + `oklch(1 0 0 / 10%)` kenarlık. **Gölge yok.**
- Atlassian: default surface *"Use with borders for flat cards."* Gölge yalnız iki yerde:
  `surface.raised` (taşınabilir/vurgulu kart) ve `surface.overlay` — ikincisi *"Reserved for a UI that
  sits over another UI, such as modals, dialogs, dropdown menus, floating toolbars."*
- Atlassian scroll gölgesi: *"A border is the default approach for scrolled content… Overflow shadows
  are reserved for experiences where a border might be easily missed."*

**Gölge yalnız şu üç durumda:** (a) DOM akışının üstünde duran katman — popover / dropdown / dialog /
floating toolbar, (b) sürüklenebilir kart, (c) kenarlığın kaybolacağı yerde scroll-overflow göstergesi.

**Her gölgenin Y-offset'i > 0 olmalı.** Polaris'in tam ölçeği referans:
```
shadow-100  0px  1px  0px  0px rgba(26,26,26,0.07)
shadow-200  0px  3px  1px -1px rgba(26,26,26,0.07)
shadow-300  0px  4px  6px -2px rgba(26,26,26,0.20)
shadow-400  0px  8px 16px -4px rgba(26,26,26,0.22)
shadow-500  0px 12px 20px -8px rgba(26,26,26,0.24)
shadow-600  0px 20px 20px -8px rgba(26,26,26,0.28)
```
Hepsi negatif `spread` ile daraltılmış, alfa 0.07–0.28.

❌ **`shadow-[0_0_40px_rgba(0,0,0,0.3)]` yasak.** Y-offset 0 + geniş blur = *glow*, ışık simülasyonu
değil; incelenen dört resmi token setinin hiçbirinde Y-offset'i 0 olan gölge yok. Aynı gerekçeyle
`StatCard`'daki 7× ve `OrdersTableBody`'deki 9× `shadow-[0_0_Npx_...]` de yasak.

❌ **Dekoratif arka plan blob'ları yasak** (`AdminLayout.tsx:122-125`). `blur-120` GPU maliyeti zoom'da
katlanır; ayrıca `w-3/10` diye bir sınıf **yok** — ikinci blob zaten hiç çizilmiyordu (D20).

**Yüzey merdiveni** rol tokenlarıyla kurulur (Radix gray 12-adım haritası referans):
| Adım | Rol |
|---|---|
| 1–2 | Sayfa ve kart arka planları |
| 3–5 | Etkileşimli bileşen arka planı (rest / hover / active) |
| 6–8 | Kenarlıklar ve ayraçlar |
| 9–10 | Solid renkler |
| 11–12 | Metin (11 = ikincil, 12 = birincil) |

### 3.4 Renk rolleri

- **Vurgu rengi yalnız:** birincil buton, link, odak halkası, aktif nav durumu. Yüzey, kart çerçevesi,
  başlık, tablo kenarlığı **vurgu rengi almaz**.
- **Atlassian'ın değiştirilebilirlik testi:** *"You should be able to exchange one accent color for
  another, and the experience would remain unchanged."* → Vurgu rengini başka bir renkle değiştirdiğinde
  **anlam değişiyorsa**, o renk yanlış yerde kullanılmış.
- **Semantik renkler yalnız kendi anlamında:** success = olumlu sonuç · warning = hata *oluşmadan
  önce* uyarı · danger = tehlike/ciddi hata · info = bilgilendirme veya devam eden işlem.
- Ham `slate-*`/`gray-*` **yasak** — tema `darkMode:'selector'` ile CSS değişkeni üzerinden döner,
  ham Tailwind grisi **dönmez** (storefront cetveli §2.2 ile aynı gerekçe).
- HEX yasağı zaten ESLint'te admin-only `error` — korunur.

### 3.5 Köşe yarıçapı

Kurumsal yakınsama: **input/buton/badge 4–8px · kart/panel 8–12px · modal/dialog 12–16px** ·
pill (`9999px`) yalnız badge ve avatar. **20px+ yarıçap hiçbir kurumsal sistemde standart bileşene
atanmamış.**

Mevcut `rounded-hvac-*` ölçeği (6 / 16 / 24 / 32px) storefront için tasarlanmış ve admin'e **fazla
yuvarlak**. Admin için ayrı kademe gerekir:

| Rol | Yeni token | Değer |
|---|---|---|
| Buton / input / chip / badge | `rounded-admin-sm` | 6px |
| Kart / panel | `rounded-admin-md` | 8px |
| Modal / dialog / geniş yüzey | `rounded-admin-lg` | 12px |

Kenarlık kalınlığı: **varsayılan 1px hairline**; 2px yalnız odak/seçili durum.

❌ Ham `rounded-xl/2xl/3xl` yasak (D19).

### 3.6 Boşluk ritmi

**4px atomik ölçek + 8px görsel ritim.** (Kaynak çelişkisi: Polaris/Tailwind/Radix 4px tabanlı,
Atlassian 8px tabanlı ama 2/4/6px alt adımlı, Carbon mini-unit 8px. Birleşim: ölçek 4'ün katı,
bileşenler-arası boşluk 8'in katı.)

Ölçek: `4, 8, 12, 16, 24, 32, 48, 64`.

| Kalem | Değer |
|---|---|
| Sayfa padding (yatay) | 16px (<1056px) → 24px (≥1584px) |
| Kart içi padding | 16px (compact) / 24px (standart) |
| Kartlar arası gap | 16px |
| Bölümler arası | 32px |
| Tablo hücresi | 16px yatay / 6-7px dikey |
| Buton grubu gap | 8px |

Aralık kuralı (Atlassian): 0–8px = kompakt UI içi · 12–24px = bileşen padding'i · 32–80px = sayfa/layout.

❌ Sayfa kökünde `space-y-4/6/8/10/12` karmaşası (5 farklı değer ölçüldü) — **tek değer: 24px (`space-y-6`)**.

### 3.7 İçerik genişliği

- Kabuk **tam genişlik**; içerik **≤1584px** ile sınırlı ve ortalanmış (Carbon 2x Grid maksimumu).
- **Tablo-ağırlıklı sayfa** → 1584px'e kadar tam genişlik. Tabloyu dar kolona sıkıştırmak yatay
  kaydırma üretir; hiçbir kurumsal sistem bunu önermiyor. (Polaris'in `fullWidth` kaçış kapısı.)
- **Form / ayar / metin ağırlıklı sayfa** → dar sütun **~640–720px (≈80ch)**.
  WCAG 1.4.8 (AAA): metin blokları *"no more than 80 characters or glyphs"*. Ayar formlarını tam
  genişliğe yaymak bu tavsiyeye aykırı.
- **Genişlik sınırı tek yerden gelir** — kabuk verir, sayfa tekrar daraltmaz.
  ❌ Mevcut: `max-w-page` (kabuk) + `max-w-page` (InventoryReport, çift) + `max-w-5xl` (InvSettings) +
  `max-w-4xl` (Users) = dört farklı kaynak.

### 3.8 Tema

- Her renk **`:root`'ta rol tokenı** olarak tanımlanır; `.dark` **yalnız token değerlerini** ezer.
  Hiçbir bileşen iki farklı sınıf yazmaz.
- `color-scheme` CSS property'si **bildirilmek zorunda** (form alanları, scrollbar, seçim renkleri
  tarayıcıya devredilir).
- İlk değeri `prefers-color-scheme` belirler; **kullanıcı toggle'ı kazanır** ve tercihi kalıcılaşır.
- Saf beyaz/siyahtan kaçın (web.dev: *"rgb(250, 250, 250) works better"*).
- Veri-yoğun panelde **opak yüzey** tercih edilir (Radix: `panelBackground="solid"` — *"provides an
  unobstructed background for panels, useful for presenting information clearly"*).
  ❌ Mevcut `glass`/`glass-strong` + `backdrop-blur-xl` her kartta — veri okunabilirliğine aykırı.

> ✅ **KARAR VERİLDİ (Recep, 2026-08-15): varsayılan AÇIK tema, koyu birinci sınıf seçenek.**
> Görsel yön *nötr kurumsal* (Linear/Stripe hissi).

#### 3.8.1 Token kümesi (normatif)

Admin renkleri `src/index.css` içinde **`[data-admin-theme]`** kapsamında tanımlıdır; `='dark'` yalnız
değerleri ezer. Bileşen iki farklı sınıf yazmaz, tek token yazar.

**Kapsam bilerek DAR:** değişkenler `:root` altında **değil**. Vitrin koyu tasarlanmıştır ve kendi
cetveli vardır (`storefront-design-standard.md`); `:root`a koymak vitrini de çevirirdi.

| Rol | Token | Kullanım |
|---|---|---|
| Sayfa zemini | `admin-bg` | kabuk arkaplanı |
| Yüzey | `admin-surface` | kart, panel, modal, tablo gövdesi |
| Yüzey +1 | `admin-surface-2` | tablo başlığı, hover, ikincil zemin |
| Yüzey +2 | `admin-surface-3` | seçili satır, vurgulu zemin |
| Kenarlık | `admin-border` / `admin-border-strong` | hairline / hover-vurgu |
| Metin | `admin-fg` | gövde ve başlık |
| Metin (ikincil) | `admin-fg-muted` | etiket, yardım metni — **AA ✓ (~4.9:1)** |
| Metin (üçüncül) | `admin-fg-subtle` | **yalnız büyük metin ve UI sınırı** (~3.6:1) — gövdede YASAK |
| Vurgu | `admin-accent` / `-hover` / `-fg` / `-weak` | birincil buton, link, aktif nav, odak |
| Durum | `admin-danger` / `-warning` / `-success` (+ `-fg`, `-weak`) | yalnız kendi anlamında (§3.4) |
| Odak | `admin-ring` | odak halkası |

Yükseklik: `shadow-admin-sm / -md / -lg / -overlay` (`tokens.js`). **Y-kayması sıfır olan gölge
(`shadow-[0_0_40px…]`) glow'dur, gölge değildir** — ışık kaynağı yoktur ve dört resmi token setinin
hiçbirinde yer almaz; açık zeminde kirli hale bırakır. Yasak.

#### 3.8.2 Tercihin kalıcılığı — çerez, localStorage DEĞİL

Tercih `vh_admin_theme_<tenantId>` çerezinde `<tercih>:<çözülmüş>` biçiminde tutulur ve
`src/app/admin/layout.tsx` içinde **SUNUCUDA** okunup ilk render'a basılır.

localStorage sunucuda okunamaz; tercih sunucuda bilinmezse koyu temayı seçen kullanıcı **her sayfa
yüklemesinde beyaz bir kare** görür. Aynı tuzağa sol menü tercihinde de düşülmüştü (çerez yazılıyor,
hiç okunmuyordu → kalıcılık sessizce çalışmıyordu).

`system` seçeneğinde çözülmüş değeri **istemci çereze geri yazar**: sunucu `prefers-color-scheme`
okuyamaz, dolayısıyla bir sonraki ilk boyamanın doğru gelmesinin başka yolu yoktur. Çerez ayrıca
tenant-scoped (kural 12) ve medya sorgusu canlı dinlenir (kullanıcı OS temasını panel açıkken
değiştirirse "sistem"in anlamı derhal karşılanır).

#### 3.8.3 Ham sınıf → token eşleme tablosu (geçiş kaydı)

2026-08-15 taraması: **951 ham `slate-*`, 219 `text-white`, 475 `font-black`, 539 `uppercase`,
240 `tracking-widest`, 18 glow.** Hiçbiri derleme hatası değildir — `text-white` geçerli bir sınıftır,
tsc/lint/test/build hepsi geçer; hata yalnız **kullanıcıda** ortaya çıkar. Bu yüzden kural statik
taramayla korunur (`INV-ADMIN-THEME-*`).

| Ham | Token | Gerekçe |
|---|---|---|
| `text-white`, `text-white/N` | `text-admin-fg` (renkli zeminde `text-admin-*-fg`) | açık temada zeminle aynı renge gelir, içerik kaybolur |
| `bg-white/1..5` → `bg-admin-surface-2`, `/6..20` → `-3` | | `white/N` yalnız koyu zeminde görünen bir hiledir |
| `glass`, `glass-strong`, `glass-md` | `bg-admin-surface` | yarı saydam koyu katman; ayrıca her kart ayrı kompozisyon katmanı doğurur |
| `text-slate-100..300` / `400-500` / `600-700` | `text-admin-fg` / `-muted` / `-subtle` | |
| `border-white/N`, `border-slate-*`, `ring-white/N` | `border-admin-border` | |
| `bg/text/border-{cyan,sky,blue}-*` | `admin-accent` (+`-weak` alfalıda) | |
| `{rose,red}` → `danger` · `{amber,yellow,orange}` → `warning` · `{emerald,green,teal}` → `success` | | §3.4 |
| `font-black` | `font-semibold` | her şey en kalınsa hiyerarşi yoktur |
| `uppercase`, `tracking-widest/wider/hvac-*` | *(kaldırılır)* | okuma hızını düşürür; TR'de İ/ı sorunları |
| `rounded-hvac-*`, `rounded-xl/2xl/3xl` | `rounded-admin-sm/md/lg` | §3.5 |
| `shadow-sm/md/lg/xl/2xl`, `shadow-[0_0_…]`, `shadow-glow-*` | `shadow-admin-sm/md/lg/overlay` | |
| `focus:` | `focus-visible:` | `focus:` fareyle de halka çizer → geliştirici `outline-none` ile bastırır ve klavye odağını da öldürür |

**`uppercase` için TEK muafiyet:** `src/utils/adminUi.ts` içindeki tablo başlığı ve etiket sabitleri
(ölçülü `tracking-wide` ile). Muafiyet **adla** verilir, desenle değil.

### 3.9 Odak halkası

- **`:focus-visible`** kullanılır, `:focus` değil. `outline: none` **yasak**
  (MDN: *"removing focus styles makes keyboard navigation inaccessible for sighted users"*).
- `outline: 2px solid var(--ring)`; `outline-offset: 2px` (serbest kontroller), `-2px` (tablo hücresi
  gibi sınıra yapışan yerler — Carbon deseni).
- Kontrast: odak göstergesi zemine karşı **≥3:1** (SC 1.4.11, AA).
- Hedef seviye **SC 2.4.13 (AAA)**: en az 2 CSS px kalınlığında çevre **ve** odaklı/odaksız *aynı
  piksellerin* birbirine oranı ≥3:1. (Sık yapılan hata: komşu renge karşı ölçmek.)
- Sticky başlık varsa `scroll-padding-top` **zorunlu** — SC 2.4.11 **AA**, opsiyon değil.

---

## 4. ETKİLEŞİM YÜZEYİ (OVERLAY) TAKSONOMİSİ

> Bu bölüm *"nerede açılır pencere, nerede genişleyen pencere, nerede popup"* sorusunun cevabıdır.

### 4.1 Karar tablosu

| Durum | Yüzey | Kaynak |
|---|---|---|
| Yıkıcı/geri alınamaz eylem onayı | **AlertDialog** (`role="alertdialog"`) | Fluent · APG |
| Kolayca yeniden yaratılabilir kaydın silinmesi | **Onaysız + Geri Al** | Cloudscape |
| Zincirleme/ciddi sonuçlu silme | **Onay + kaynak adını yazdırma** | Cloudscape |
| **<5 girdili** form | **Modal** | **Carbon Forms** |
| **>5 girdili** form | **Non-modal yan panel** | **Carbon Forms** |
| 1–2 alanlı hızlı düzenleme | **Modal** | Gestalt |
| Kayıt **oluşturma** / geniş alan gerektiren form | **Ayrı rota** (veya route-focus-modal) | Polaris · Medusa |
| Çok adımlı akış | **Ayrı rota** | NN/g · Atlassian |
| **Paylaşılabilir URL gerekiyorsa** | **Ayrı rota — modal DEĞİL** | **Gestalt · Primer** |
| Hem link'lenebilir hem overlay | **Intercepting Route** (yumuşak gezinme=overlay, hard-nav=tam sayfa) | **Next.js** |
| Kullanıcı arkadaki içeriğe bakmalı | **Non-modal panel** | Carbon · Cloudscape |
| Tablo satırı seçince hızlı detay/karşılaştırma | **Split panel (non-modal)** | Cloudscape |
| Tam kayıt detayı | **Detay sayfası** — *"A split view should never replace details pages"* | Cloudscape |
| Sayfa içinde yerinde ek bilgi | **Inline expand / disclosure** | Polaris · APG |
| Küçük, ikincil, **odaklanabilir** içerik | **Popover** | Radix · Gestalt |
| Popover 4 kolondan geniş | **Modal** | Carbon |
| İkonun ne yaptığını söylemek | **Tooltip** | Material 3 |
| Kısa, eylem gerektirmeyen başarı bildirimi | **Toast** | Material 3 |
| **Hata / kritik / eylem gerektiren** | **Inline mesaj veya banner — toast DEĞİL** | 5 sistem birden |
| Form alanı hatası | **Alanın yanında inline hata** | NN/g · Polaris |
| Sistem kendiliğinden bildirim üretiyor (kullanıcı tetiklemedi) | **Toast — dialog DEĞİL** | Carbon |
| Tekrarlanan görev | **Ana sayfada yap, overlay açma** | Carbon |

### 4.2 Modal — kullanım ve tavan

**Kullan:** kritik uyarı/hata önleme · akışı sürdürmek için zorunlu bilgi · karmaşık akışı basit adıma
bölme · kullanıcının işini belirgin şekilde azaltan bilgi toplama.

**Kullanma:** mevcut akışla ilgisiz bilgi · yüksek-riskli süreçlerin ortası · modalda bulunmayan ek
kaynak gerektiren karmaşık karar.

**İçerik tavanı (beş sistem hemfikir):**
- Karmaşık form yok, büyük tablo yok, tam sayfa yeniden yaratma yok.
- **"Modal sayfanın alternatifi değildir"** (Carbon). Büyük modal yetmiyorsa → **sayfa**.
- En fazla **2 birincil aksiyon** (Material); Fluent 3'e izin veriyor.
- Modal içinde bilgi gizleyen bileşen (accordion/tab) **kullanma** (Carbon).
- Modal içi form hatası: **modal açık kalır**, hata alanın yanında işaretlenir (Carbon).

**Maliyet gerekçesi (cetvelde savunma olarak kullanılabilir):** *"They cause the users to create and
address an extra goal — to dismiss the dialog."* (NN/g)

### 4.3 "Genişleyen panel" — **non-modal olmak ZORUNDA**

Bu, araştırmanın en önemli düzeltmesi:

> **Yan panelin ayırt edici özelliği yandan gelmesi değil, MODAL OLUP OLMAMASIDIR.**
> Modal bir drawer, sadece şekli değişmiş bir modaldır — bağlam korunmaz.

Kanıt: Atlassian kendi Drawer'ı için *"The drawer component **is a modal dialog**"* ve *"the background
content isn't interactive or focusable, so **don't present people with a task in a drawer if they need
to reference the content** in the UI behind the drawer"* diyor; *"For most applications, use a modal
dialog instead."* Primer aynı: *"Side sheets are still considered as Dialogs."* Polaris ise Sheet'i
**anti-pattern gerekçesiyle** emekliye ayırdı: *"encourages designers to create a new layer on top of
the page instead of improving the existing user interface."*

**Kural:** "Bağlam korunsun" gerekçesiyle panel seçiyorsan panel **non-modal** olmak zorundadır —
arka içerik etkileşimli kalır, ana içerik daralır (Carbon non-modal dialog / Fluent inline drawer /
Material standard side sheet / Cloudscape split panel modeli).
Panel modal olacaksa, onu modal olarak adlandır ve §4.2'nin tavanlarına tabi tut.

Non-modal panel a11y sözleşmesi: `role="region"` + `aria-label`/`aria-labelledby`; açılışta odak
panele girer, kapanışta tetikleyiciye döner (Cloudscape).

Carbon'un kısıtı: non-modal *"for optional or non-critical tasks only. If a user's response or input
is required to progress the workflow, use a modal dialog."*

### 4.4 İç içe overlay

Kaynaklar çelişiyor (Carbon/Atlassian/Fluent/Gestalt: mutlak yasak · Primer: 2'ye kadar serbest ·
Material: full-screen üstüne serbest · APG'nin kendi örneği çok katmanlı · Medusa `StackedFocusModal`
gönderiyor). **VentHub kararı — ayrımı "yasak/serbest" değil, tür ekseninde kur:**

| Kombinasyon | Karar |
|---|---|
| Çalışma yüzeyi üstüne **onay yüzeyi** (AlertDialog) | ✅ İzinli (dört kaynakta meşru) |
| Çalışma yüzeyi üstüne **çalışma yüzeyi** | ❌ Yasak (altı kaynakta yasak) |
| Üç ve daha fazla katman | ❌ Yasak |

İzinli durumda a11y koşulları (Primer): ESC **yalnız üsttekini** kapatır · dışa tıklama **yalnız
üsttekini** kapatır · kapanışta odak alttaki tetikleyiciye döner.

Yan yüzeylerde iç içe geçme **her kaynakta yasak**: popover içinde popover, disclosure içinde
disclosure, aynı anda birden çok overlay drawer.

### 4.5 Popover · Tooltip · HoverCard

Radix'in kendi sınıflandırması (frontmatter'dan):

| Primitive | APG pattern | Not |
|---|---|---|
| Dialog | dialog-modal | `modal` varsayılan **true** |
| AlertDialog | alertdialog | **`modal` prop'u YOK** — hep modal; dışa tıklama yapısal olarak kapalı |
| **Popover** | **dialog-modal** (Dialog ile aynı) | `modal` varsayılan **false**; odak yönetilir |
| Tooltip | tooltip | odak yönetmez |
| **HoverCard** | **yok** | *"Ignored by screen readers"* · *"intended for sighted users only"* |

**Tooltip'e ASLA konmaz** (dört otorite aynı):
- **Etkileşimli öğe** (link/buton) — APG: *"Tooltip widgets do not receive focus. A hover that contains
  focusable elements can be made using a non-modal dialog."* Carbon'un çözümü: **toggletip**.
- **Kritik / görevi tamamlamak için gerekli bilgi** — Material: *"Don't hide critical information
  within tooltips as it's easy to miss. Use an interruptive dialog instead."*
- **Görsel/ikon.**
- **Devre dışı öğe üstünde** — devre dışı öğe etkileşimli değildir.

**WCAG 1.4.13 (AA)** hover/focus ile çıkan tüm içeriğe bağlayıcı üç şart: **Dismissible** (imleci veya
odağı hareket ettirmeden kapatılabilir) · **Hoverable** (imleç içeriğin üstüne gidebilmeli, kaybolmamalı) ·
**Persistent** (tetikleyici kalkana veya kullanıcı kapatana kadar görünür kalır).

**HoverCard kritik yol üstünde kullanılamaz** — a11y ağacının dışındadır.

> ⚠️ **Radix doküman hatası:** `alert-dialog.mdx`, `onOpenAutoFocus`'u *"focus moves to the destructive
> action"* diye tarif ediyor; **kod `cancelRef.current?.focus()` çağırıyor.** Varsayılan **Cancel**'dır
> ve APG'nin *"set focus on the least destructive action"* tavsiyesiyle uyumlu olan budur. Dokümana
> değil koda güven.

### 4.6 Bildirim: toast vs inline

**Toast'a asla konmaz: hata, kritik uyarı, eylem gerektiren mesaj.** Beş sistem + APG hemfikir:

| Kaynak | İfade |
|---|---|
| Polaris | *"Avoid using toast for critical information that merchants need to act on immediately."* |
| Atlassian | *"Never use auto dismiss flags for any critical warning or error messages."* |
| Carbon | *"Don't use notifications that dismiss on a timer for critical or emergency messages."* |
| Fluent | *"Don't use toasts for necessary actions."* |
| Material 3 | *"auto-dismissing snackbars are inaccessible for people with low vision."* |
| APG (Alert) | *"avoid designing alerts that disappear automatically"* (WCAG 2.2.3 atfıyla) |

**Yüzey seçimi:**

| Tür | Ne zaman | Süre |
|---|---|---|
| Inline | Kesintisiz geri bildirim / durum | Çözülene veya kapatılana kadar |
| Toast | Kısa, zaman-bağlı, eylemsiz | Aksiyonsuz otomatik kapanır; **aksiyonlu ASLA otomatik kapanmaz** |
| Banner | Sistem/ürün seviyesi, göreve özgü değil | Kapatılana kadar |
| Callout | Sayfa içeriğinde bağlamsal vurgu | Kalıcı, kapatılamaz |
| Modal | Kritik, dikkat/eylem şart | Kapatılana kadar bloklar |

Süre: **5000ms** varsayılan; **aksiyonlu toast ≥10 000ms veya hiç kapanmaz** (Polaris). Aynı anda
en fazla 1 toast görünür (Material) — istisna gerekçelendirilir.

Uzun/karmaşık formda: üstte özet **banner** + submit'te odağı banner'a taşı + **her alanda inline hata**.

> **D11 bu bölümün ihlalidir:** admin'de `<Toaster/>` mount edilmiyor, 127 çağrı ölü; hatalar `alert()`
> ile veriliyor. §6'da bunu yakalayan kapı tanımlı.

### 4.7 Onay ve geri alma

NN/g'nin gerçek konumu — **"undo > confirm" değil, "ikisi de"**:

> *"Use a confirmation dialog before committing to actions with serious consequences… **Though as
> mentioned, do try your best to offer undo**"* · *"**Do not use confirmation dialogs for routine
> actions.** … if you cry wolf too many times, people will stop paying attention"*

**Kurallar:**
- Onay **yalnız** ciddi/geri alınamaz sonuç için; rutin işlemde **yasak**.
- Buton etiketleri **sonucu özetler**: "Ürünü sil" / "Vazgeç" — **"Evet/Hayır" yasak**.
- **Varsayılan odak yıkıcı olmayan seçenekte** (APG: *"set focus on the least destructive action"*).
- Özellikle tehlikeli işlemde **standart-dışı doğrulama** (kaynak adını yazdırma).
- Geri alma **her hâlükârda** sunulur. Toast içinde sunuluyorsa görünürlük yetersiz kalabilir —
  kritik geri almalar kalıcı yüzeyde de bulunmalı.

**Risk kademeleri (Cloudscape):**

| Risk | Yüzey |
|---|---|
| Kolayca yeniden yaratılabilir, çalışan sisteme etkisiz | Tek tık, onay yok (+ Geri Al) |
| Hızlıca yeniden yaratılamaz | Basit onay |
| Ciddi / geri alınamaz / zincirleme | Onay + kaynak adını yazdırma |

> **D12 bu bölümün ihlalidir:** 21 `window.confirm` + 7 `alert`. Native kutu stilsizdir, i18n'i
> taşımaz, mobilde "bu site tekrar sormasın" ile **kalıcı olarak susturulabilir** → `confirm` `false`
> döner, silme sessizce iptal olur, kullanıcı hiçbir şey görmez. **Yasak.**

### 4.8 A11y sözleşmesi (WAI-ARIA APG — Dialog/Modal)

Her modal yüzey **istisnasız** şunları sağlar:

| # | Gereklilik |
|---|---|
| 1 | Dış içerik **inert** — dışarıyla hiçbir şekilde etkileşilemez |
| 2 | **Focus trap:** Tab son öğeden ilkine, Shift+Tab ilkinden sonuncuya döner |
| 3 | **ESC kapatır** |
| 4 | Açılışta odak **dialog içindeki bir öğeye** taşınır |
| 5 | Kapanışta odak **tetikleyiciye döner** (tetikleyici yoksa mantıklı bir öğeye) |
| 6 | `role="dialog"` (onay yüzeyinde `role="alertdialog"`) |
| 7 | **`aria-modal="true"`** |
| 8 | `aria-labelledby` (görünür başlığa) **veya** `aria-label` |
| 9 | Tab sırasında **görünür bir kapatma butonu** (APG: "strongly recommended") |
| 10 | Body scroll lock |
| 11 | `alertdialog` ise `aria-describedby` **zorunlu** (dialog'da opsiyonel) |

**Açılışta odak nereye (APG'nin dört senaryosu):** genelde ilk odaklanabilir öğe · içerik semantik yapı
(liste/tablo/çok paragraf) içeriyorsa başa `tabindex="-1"` statik öğe koy ve ona odaklan (ve
`aria-describedby`'ı **koyma**) · içerik uzunsa başlığa odaklan · **geri alınamaz son adımda en az
yıkıcı aksiyona** odaklan.

**`aria-modal` tuzağı (APG):** modal olarak işaretlemek, gerçekten modal davranmıyorsa
*"severe negative ramifications"* üretir. Yalnız **hem** kod dışarıyla etkileşimi tamamen engelliyorsa
**hem de** görsel olarak dışarısı örtülüyorsa `aria-modal` yazılır.

**Non-modal ile fark (APG):** ikisi de tab sırasını içeride tutar; tek fark **non-modal'da kullanıcı
dialog'u kapatmadan odağı dışarı çıkarabilir.**

> **D14 bu bölümün ihlalidir:** 6 modalda ESC handler'ı `role="presentation"` backdrop `<div>`'ine
> bağlı; odaklanamayan eleman `keydown` almaz → **ESC hiç çalışmıyor.** Handler document seviyesine
> taşınır veya Radix'in kendi mekanizması kullanılır.

### 4.9 Katman (z-index) ölçeği

**Tek merkezi ölçek; tek tek değiştirilmez.** (Bootstrap: *"We don't encourage customization of these
individual values; should you change one, you likely need to change them all."*)

Mevcut `tokens.js` ölçeği korunur ve iki katman eklenir:

| Katman | Token | Değer |
|---|---|---|
| Yükseltilmiş içerik | `z-raised` | 10 |
| Sticky başlık / toolbar | `z-sticky` | 90 |
| Backdrop | `z-backdrop` *(yeni)* | 95 |
| Modal / drawer / dialog | `z-modal` | 100 |
| **Menü / popover / dropdown / tooltip** | `z-popover` *(yeni)* | 110 |
| Toast | `z-toast` | 9999 |

**İki karar ve gerekçeleri:**

1. **Menü/popover katmanı modal'ın ÜSTÜNDE.** Kaynaklar bölünmüş (Carbon: dropdown 9100 > modal 9000 ·
   Bootstrap/Atlassian: altında). VentHub Carbon'u izler, çünkü stack'imizde Radix menü/popover içeriği
   **`body`'ye portal ediliyor** — mevcut `z-dropdown: 50 < z-modal: 100` ile bir modal içindeki
   dropdown **modalın arkasında** render olur. Carbon'un kod yorumundaki gerekçe birebir geçerli:
   *"Dropdowns that render outside of a Modal should render above a Modal."*
   Bu, mevcut `z-dropdown` (50) token'ının **latent bug** olduğu anlamına gelir.
2. **Toast en üstte.** Bootstrap (1090 > 1055), Atlassian (*"When a modal is active, flags should
   always be visible above the modal"*), MUI (1400 > 1300) hemfikir. Mevcut 9999 zaten doğru.

❌ **Ham `z-30/z-40/z-50` overlay katmanında yasak.** ❌ `z-[9999]` gibi arbitrary değer yasak.
❌ Bir popover'a `z-toast` vermek yasak (D15: `DateRangePicker.tsx:139`).

### 4.10 Dar ekran

- **<600px:** dialog **full-screen** olabilir (Material: *"Full-screen dialogs are for compact
  breakpoints only"*). Girdi alanı içeren dialog'lar dar viewport'ta **full-screen olmalı** (Primer).
- **≥600px:** ortalanmış dialog **zorunlu** — full-screen kullanma.
- Dialog genişliği: min 280px, maks 560px; ekranı doldurmaz. Masaüstünde viewport'a **16px** güvenli
  alan.
- **≥840px:** alt sayfa (bottom sheet) yerine yan panel kullanılabilir.
- Modal bottom sheet **yalnız mobilde**; başlangıç yüksekliği ekranın **%50**'siyle sınırlı.
- Menüler dar ekranda alt sayfaya dönüşebilir — ama **işlevsel eşdeğer olmayan** bileşenler
  takas edilmez (*"Don't arbitrarily swap components that aren't functionally equivalent"*).

---

### 4.11 Portal ve TEMA KAPSAMI — doğru sınıf yeterli değildir

> 2026-08-18'de kullanıcı iki ayrı belirti bildirdi: admin modallerinin **paneli şeffaftı**
> (altındaki tablo satırları modalın içinden görünüyor, etiketlerle çakışıyordu) ve **tema
> menüsünün seçenekleri okunmuyordu** (koyu temada koyu-üstüne-koyu). Ayrı görünüyorlardı;
> sebep **tekti**.

#### Mekanizma

Admin token'ları `src/index.css`'te **`[data-admin-theme]` seçicisi altında** tanımlıdır ve
bu öznitelik `AdminLayout`'un `<div>`lerinde yaşar. Radix `Dialog.Portal` /
`DropdownMenu.Portal` ve `createPortal`, içeriği **`document.body`ye taşır** — yani portal
ağacı, değişkenlerin tanımlı olduğu kapsamın **dışında** kalır.

`hsl(var(--admin-surface))` **tanımsız** bir değişkenle geçersiz bir renge dönüşür; tarayıcı
özelliği hiç uygulamaz ve hesaplanmış değer **şeffafa** düşer. Metinde aynısı olur: renk
uygulanmaz, metin miras alınan renge iner.

**Bu yüzden `class` denetimi bu kusuru göremez.** Sınıflar (`bg-admin-surface`,
`text-admin-fg`) tamamen doğruydu. Yanlış olan, dayandıkları değişkenlerin o ağaçta
tanımsız olmasıydı — yani kusur **kodda değil, kapsamda** yaşıyordu.

#### Kural

**Tema kapsamı `document.body`ye de basılır** (`useAdminThemeBodyScope`), admin yüzeyi
çözülünce geri alınır. Böylece bugünkü ve gelecekteki **her** portal — üçüncü parti olanlar
dahil — token'ları görür.

Reddedilen alternatifler ve niçin:

| Alternatif | Niçin değil |
|---|---|
| Her portal'a `container` prop'u | Her yeni overlay'de tekrar hatırlanması gereken bir disiplin; üçüncü parti portal'ları hiç kapsamaz. Ayrıca içeriği kabuğun içine almak, portal'ın var oluş sebebi olan yığılma bağlamı sorunlarını geri getirir. |
| Özniteliği `<html>`e basmak | `[data-admin-theme] select option` gibi genel kurallar ve `color-scheme` **vitrine sızar**. |
| Değişkenleri `:root`ta tanımlamak | Portal daima AÇIK temayı alır; koyu temada panel açık kalır. Kusurun yerini değiştirir, kaldırmaz. |

#### Zorlama — üç katman, üçü de gerekli

| Katman | Ne ölçer | Sınırı |
|---|---|---|
| `admin-theme-invariants` (statik) | `AdminLayout` kancayı gerçekten **çağırıyor** mu — yetim kanca kapısı | Kapsamı ölçmez |
| `useAdminThemeBodyScope.test.tsx` (jsdom) | Gövdeye basılıyor/güncelleniyor/geri alınıyor mu; **portal içeriğinin tema kapsamı taşıyan bir ATASI var mı** | jsdom `index.css`i uygulamaz → hesaplanmış rengi ölçemez |
| `admin-smoke.e2e.ts` (gerçek tarayıcı) | Açılmış menünün **hesaplanmış** arka planı şeffaf değil | Kimlik bilgisi yoksa **atlanır** (fail-open) — bu yüzden tek başına yeterli sayılmaz |

> Katmanların **hiçbiri tek başına yetmiyor** ve bu tesadüf değil: statik kapı doğru sınıfı
> görüp yeşil der, jsdom rengi hesaplamaz, e2e her koşuda çalışmaz. Bu tabloyu okumadan
> "kapı var" demek, §5'in "ölçülemedi ≠ geçti" ilkesini çiğnemektir.

> **Yan ders (ölçüm hijyeni):** kanca bilerek bozulduğunda iki portal testi **yine yeşil**
> kaldı — çünkü bir önceki test başarısız olup temizliğine ulaşamamış, gövdede bıraktığı
> öznitelik sonraki testleri kurtarmıştı. Kapı, kendi ürettiği kirli durumla sahte-yeşil
> veriyordu. Gövde/`document` gibi **paylaşılan durumu** değiştiren her testte
> `beforeEach` + `afterEach` temizliği zorunludur.

## 5. CETVEL (ölçüm aracı)

Skor = ✓ / 40. Kabuk maddeleri **kabuk başına bir kez**, sayfa maddeleri **sayfa başına** ölçülür.

**Kabuk — yerleşim & scroll (12)**
- [ ] Kök scroll konteyneri **değil**; belge scroll ediyor
- [ ] Kabuk başına en fazla 1 iç scroll konteyneri, adlandırılmış
- [ ] `vh`/`100vh` yok; `svh` kullanılıyor
- [ ] `overflow:hidden` kabuk zincirinde yok
- [ ] %400 zoom (320×256) → iki-yönlü scroll yok
- [ ] %200 metin büyütme → kırpılma yok
- [ ] Sidebar collapse **layout'u gerçekten daraltıyor** (gap+fixed deseni)
- [ ] Üç durum var: genişletilmiş / ikon rayı / drawer
- [ ] Geçiş süresi ve easing gap ve panelde aynı
- [ ] Sidebar durumu **cookie** ile kalıcı (tenant-scoped)
- [ ] Sticky başlıkta inset property var; `scroll-padding-top` tanımlı
- [ ] **Skip-link** var (SC 2.4.1, Level A)

**Kabuk — navigasyon & a11y (6)**
- [ ] Menü **RBAC-filtreli** (yetkisiz link listelenmiyor)
- [ ] Aktif eşleme alt rotaları kapsıyor; **yalnız en derin** öğede `aria-current="page"`
- [ ] Kapalı drawer **`inert`** (yalnız translate değil)
- [ ] Açık drawer: backdrop + focus trap + ESC + odak dönüşü + scroll lock
- [ ] Tetikleyicide `aria-expanded` + `aria-controls`
- [ ] Her rota menüden erişilebilir veya bilinçli olarak "derin bağlantı" işaretli

**Görsel kompozisyon (11)**
- [ ] Tablo satırı ≤48px (varsayılan 40px); başlık = gövde yüksekliği
- [ ] `font-black`/900 **yok**
- [ ] Gövde ve tablo hücresi ağırlığı 400
- [ ] UPPERCASE yalnız eyebrow etiketinde (sayfada ≤2)
- [ ] Kart kenarlıkla ayrılıyor; düz kartta gölge yok
- [ ] Y-offset'i 0 olan gölge (glow) yok
- [ ] Dekoratif blur-blob yok
- [ ] Ham `slate-*`/`gray-*` ve HEX yok
- [ ] Radius admin ölçeğinden (6/8/12px); ham `rounded-xl/2xl/3xl` yok
- [ ] Genişlik sınırı tek kaynaktan (kabuk verir, sayfa daraltmaz)
- [ ] `:focus-visible` halkası ≥2px, ≥3:1; `outline:none` yok

**Overlay (11)**
- [ ] Tüm modal yüzeyler **tek paylaşılan bileşenden** türüyor
- [ ] `window.confirm` / `alert` / `prompt` **yok**
- [ ] Yıkıcı işlemde `role="alertdialog"` + `aria-describedby` + en az yıkıcı seçenekte odak
- [ ] Onay butonları sonucu özetliyor ("Evet/Hayır" değil)
- [ ] Rutin işlemde onay yok
- [ ] >5 girdili form modalda değil
- [ ] Paylaşılabilir URL gereken içerik modalda değil (rota veya intercepting route)
- [ ] "Bağlam korunsun" gerekçeli panel **non-modal**
- [ ] Çalışma yüzeyi üstüne çalışma yüzeyi yığılmıyor
- [ ] Hata/kritik mesaj toast'ta değil; aksiyonlu toast otomatik kapanmıyor
- [ ] z katmanı token'dan; menü/popover modalın üstünde

---

## 6. ZORLAMA KATMANLARI

> Bu projenin kuralı: **kontrol = cetvel + onu zorlayan test.** Cetvelin elle puanlanan kısmı
> "ölçülür ama kilitlenmez" — skor düşerse hiçbir kapı kırmızı yanmaz. Aşağıdakiler kilitleyen ayaktır.

| Kapı | Ne zorlar | Tür |
|---|---|---|
| **INV-ADMIN-SHELL-1** | Admin kabuk zincirinde `h-screen`/`100vh`/`min-h-screen` ve `overflow-hidden` yasağı; kabuk başına ≤1 scroll konteyneri; iç içe tam-ekran kabuk yasağı | statik tarama |
| **INV-ADMIN-SHELL-2** | Sidebar kökünde açık genişlik sınıfı yasağı; gap+fixed deseni; `aria-current`/`aria-expanded`/`aria-controls`/`inert` varlığı; skip-link varlığı | statik + render testi |
| **INV-ADMIN-OVERLAY-1** | `window.confirm`/`alert`/`prompt` **0**; `<Toaster/>`'ın admin ağacında mount edildiğinin ispatı | statik + render testi |
| **INV-ADMIN-OVERLAY-2** | Paylaşılan `Modal`/`ConfirmDialog` dışında `fixed inset-0` overlay yasağı; her dialog'da `role` + `aria-modal` + isim bağı; ESC handler'ının odaklanamayan elemana bağlanma yasağı | statik tarama |
| **INV-ADMIN-OVERLAY-3** | Overlay katmanında ham `z-30/40/50` ve arbitrary `z-[…]` yasağı; token kullanımı | statik tarama |
| **Portal tema kapsamı** | AdminLayout tema kapsamını gövdeye basmalı (yetim kanca kapısı); portal içeriğinin kapsam taşıyan atası olmalı; gerçek tarayıcıda menü arka planı şeffaf olmamalı | statik + jsdom + e2e |
| **INV-ADMIN-SEARCH-1** | Üst-düzey `or()` içinde gömülü kaynağa atıf YASAK (sıfır tolerans); iade yüzeyi view üzerinden okur. Ham kullanıcı metni kuralı burada DEĞİL, INV-FILTER-1'de (duplicate-ruler önlemi) | statik tarama |
| **INV-ADMIN-EXPORT-1** | `components/admin/data-table/` ve `components/admin/overlay/` altında `export default` YASAK; aynı dizinlerden DEFAULT ithal de YASAK (iki kural birbirinin yedeği) | statik tarama |
| **INV-ADMIN-DESIGN-1** (ratchet) | `font-black`, `uppercase`, `shadow-[…]`, ham `rounded-xl/2xl/3xl`, ham `slate-*`/`gray-*` sayaçları — **yeni kod artıramaz**, dalgalar düşürür | ratchet (INV-5/INV-9 deseni) |
| **ESLint kaçağı kapatma** | `tailwindcss/no-arbitrary-value` şu an **yalnız literal `className`'i** görüyor; admin'de 38 arbitrary değer sabit/obje içinde kaçıyor (ölçüldü: o dosyalarda eslint 0 hata veriyor). `settings.tailwindcss.callees` + sabit tarama eklenir | lint |
| **Zoom kapısı** | Playwright: 1280×1024 @ %400 → iki-yönlü scroll yok; %200 metin → kırpılma yok | e2e |
| **Mobil viewport projesi** | Playwright şu an **tek proje** (`Desktop Chrome`) — mobil viewport eklenir; drawer sözleşmesi (backdrop/ESC/focus/inert) test edilir | e2e |
| **axe kapsamı** | 10 sayfada axe-0 var; **12 admin dosyasında hiç test yok — `AdminLayout` dahil**. Kabuk ve kalan sayfalar kapsama alınır | test |

**Kapı ekleme kuralı:** her yeni kapı **bilerek bozularak** FAIL görülür; geçmesi çalıştığını
kanıtlamaz. Muafiyet varsa **adla** yazılır, sessiz geçilmez.

### 6.1 Yeni admin rotası açarken: UI izni ⊆ DB izni (ZORUNLU ÖLÇÜM)

Yeni bir admin rotası ekleyen kişi, rotayı yayına almadan önce **iki rol listesinin kesişimini
ölçer** ve ölçümü PR'a yazar:

1. **UI tarafı** — `src/lib/rbac.ts`'te bu rotaya/varlığa erişim verilen roller.
2. **DB tarafı** — sayfanın okuduğu/yazdığı **her** tablonun RLS politikalarındaki rol dizisi
   (ve varsa çağrılan RPC'nin gövdesindeki rol kapısı).

**Kural: UI'da izin verilen her rol, DB'de de izinli olmalı.** Aksi hâlde kullanıcı menüde
öğeyi görür, sayfayı açar ve **boş bir ekranla** karşılaşır — hiçbir hata düşmez, çünkü RLS
"yetkin yok" demez, **boş küme** döndürür. Ekran "veri yok" der; gerçek "gösteremiyorum"dur.

**Niçin kural: bu sınıf ÜÇ kez görüldü** (hepsi ayrı şeritte, hepsi aynı biçimde):

| # | Yer | UI izni | DB izni | Sonuç |
|---|---|---|---|---|
| 1 | Satınalma (T062) | `warehouse` | RPC'de var, RLS'te **yok** | mal kabul ekranı sessiz-boş |
| 2 | KVKK/DSR (T063) | genişletilmiş | tablo politikası dar | aynı |
| 3 | `pricing_policy` (FX-LOCK) | admin + moderator | super_admin/admin/moderator | ✅ kesişim **ölçüldü**, uyumlu |

Üçüncüsü kusur değil: **ölçüm yapıldığı için** kusur doğmadı. Kuralın istediği tam olarak budur.

**Ölçümün biçimi (PR'da bir satır yeterli):** "UI: `<roller>` · DB(`<tablo>`): `<roller>` → alt küme ✓/✗".
`✗` ise rotayı açmadan önce ya UI listesi daraltılır ya DB politikası genişletilir; **hangisi
doğruysa o** — ve genişletme migration ise Recep onayına gider (kural 13).

> Bu bir *kapı* değil **ölçüm yükümlülüğüdür**: rol dizileri statik taramayla güvenilir
> eşleştirilemiyor (RLS ifadeleri serbest SQL). Ölçmediğimiz şeyi kapı sanmıyoruz — §5'in
> "ölçülemedi ≠ geçti" ilkesi burada da geçerli.

### 6.2 Admin liste araması: KULLANICI METNİ SORGU DEĞİLDİR

> Bu bölüm 2026-08-18'de **cetvel yokluğu ölçülerek** yazıldı. `/admin/returns` araması
> üretimden beri hiç çalışmıyordu ve hiçbir kapı bunu görmedi — çünkü "admin liste araması
> nasıl kurulur" sorusunun yazılı bir cevabı yoktu. Kural 1'in "cetvel yok geçerli ama
> bedava değil" maddesi tam bu boşluğu kapatır.

#### Kural A — üst-düzey `or()` GÖMÜLÜ kaynağa atıfta bulunamaz (sıfır tolerans)

PostgREST'te `or=` argümanı **ana kaynağın** kolonları üzerinde tanımlıdır. Gömülü
(join'lenmiş) bir tabloya `tablo.kolon.ilike.…` diye atıf yapmak ayrıştırılamaz; sorgu
**400** ile düşer. "Kısmen çalışan" hâli yoktur.

Gömülü kaynağa süzmenin yolu ikinci argümandır:

```ts
query.or(orIlikeContains(['name', 'sku'], term), { foreignTable: 'products' })
```

Dikkat: bu süzme **yalnız gömülü kaynağa** uygulanır. Ana tablonun bir kolonuyla (`reason`)
gömülü kaynağın bir kolonunu (`products.name`) **tek bir OR'da** birleştirmek PostgREST'te
ifade EDİLEMEZ. İhtiyaç buysa doğru cevap Kural C'dir.

#### Kural B — kullanıcı metni filtre DİLBİLGİSİNE gömülmez

`or()` argümanı bir dilbilgisidir: `,` koşulu, `.` alan/işleç/değer'i, `()` grubu ayırır.
Kullanıcının yazdığı metin oraya ham girerse terim dilbilgisine karışır — `a,b` yazan admin
koşul sayısını değiştirir ve sorgu düşer.

`src/utils/adminQueryFilters.ts` yardımcıları kullanılır (`orIlikeContains`, `ilikeContains`,
`eqValue`, `orConditions`). `%` ve `_` **bilerek kaçırılmaz**: onlar dilbilgisi değil LIKE
joker karakterleridir, kaçırmak aramanın anlamını sessizce değiştirirdi.

> **Bu kuralın SSOT'u INV-FILTER-1'dir** (EDGE şeridi, T078-VH) — burada tekrarlanmaz.
> Aynı sınıfa iki cetvel koymak (*duplicate ruler*) zamanla sessizce ayrışan iki taban
> çizgisi üretir; OPS-AUDIT kararıyla ratchet tek yerde yaşar. Kural A ise INV-FILTER-1'de
> **yok** ve onun düzelttiği satırları bile yakalar (aşağıda ölçüldü) — ikisi tamamlayıcıdır,
> eş değil.

**Tek kolon aranıyorsa `or()` hiç kullanılmaz:** `query.ilike('search_text', \`%${term}%\`)`
deseni ayrı bir sorgu parametresi olarak taşır ve kullanıcı metni dilbilgisine hiç dokunmaz.

#### Kural C — birden çok tabloya yayılan arama VIEW ile çözülür

Aranan alanlar iki tabloya yayılıyorsa (iadede `reason`, siparişte `customer_name`),
birleştirme **DB tarafında** yapılır: `security_invoker = true` bir view, alanları
`coalesce(...) || ' ' || ...` ile tek bir `search_text` kolonunda birleştirir; arayüz tek
kolon arar.

| | |
|---|---|
| **Örnekler** | `view_admin_orders` (2026-02-25) · `view_admin_returns` (2026-08-18) |
| **`security_invoker` ZORUNLU** | View, çağıranın yetkisiyle çalışır; taban tabloların RLS'i aynen uygulanır. Varsayılan (definer) davranış, müşterinin BAŞKASININ kaydını görmesine yol açar. |
| **JOIN `LEFT` olur** | `INNER` olsaydı RLS ana satırı gizlediği anda çocuk satır da kaybolur ve yetki eksiği "kayıt yok" gibi görünürdü — §6.1'deki sessiz-boş sınıfının aynısı. |
| **Yalnız `SELECT` grant'i** | View bir OKUMA yüzeyidir. Yazma (statü güncelleme, CAS) taban tabloda kalır; view'a yazma grant'i vermek ikinci bir yazma yolu doğururdu. |
| **Bilinen tavan** | Hesaplanmış view kolonuna indeks konamaz; `ILIKE` sıralı okumadır. Darlaşırsa yol: taban tabloda materyalize kolon + `pg_trgm` GIN indeksi (eklenti kurulu). |

#### Kural D — sayfa ve komut paleti AYNI kaynağı okur

Aynı varlık iki yüzeyden aranır: liste sayfası ve komut paleti (`resourceSearchers.ts`).
İkisi ayrı sorgu kurarsa aynı terim için farklı sonuç verebilir ve hangisinin doğru olduğu
ölçülemez. **Tek kaynak = tek cevap.**

> Bu maddenin bedeli ölçüldü: iade araması komut paletinde de kırıktı (aynı Kural A ihlali),
> ama sayfa kırık olduğu için kimse ikisini karşılaştıramamıştı bile.

#### Zorlama

| Kural | Kapı | Sertlik |
|---|---|---|
| A — gömülü atıf | **INV-ADMIN-SEARCH-1** | sıfır tolerans |
| B — ham kullanıcı metni | **INV-FILTER-1** (EDGE) | ratchet, taban adlı |
| C/D — view + tek kaynak | **INV-ADMIN-SEARCH-1** | iade yüzeyinde bağlı |

**Tamamlayıcılık ÖLÇÜLDÜ, iddia değil.** INV-FILTER-1'in ürettiği şu satır kaçış açısından
doğrudur ama gömülü atfı korur, yani sorgu hâlâ 400 döner — üstelik yardımcıyı kullandığı
için **düzelmiş görünür**:

```ts
orIlikeContains(['reason', 'venthub_orders.order_number'], query)
```

Kural A'nın dedektör öz-testi tam bu satırı (ve stok hareketleri karşılığını) **kalıcı vaka**
olarak taşır; yanlış-KIRMIZI vakaları da aynı testtedir, çünkü her şeyi işaretleyen bir
dedektör de "çalışıyor" görünür.

Kapı ayrı sabotajlarla kanıtlandı; her sabotaj **farklı** bir testi düşürür.

Kapının ölçmediği, **adıyla**: sorgu çalıştırılmaz (sonucun doğruluğu ölçülmez); yorum
ayıklama yalnız tam-satır yorumlarını atar (satır-sonu yorumu yanlış-KIRMIZI verebilir,
yanlış-yeşil veremez).

---

### 6.4 Paylaşılan admin bileşeni TEK KAPIDAN girer (2026-08-19, T103-VH)

**Kural:** `src/components/admin/data-table/` ve `src/components/admin/overlay/` altındaki her
bileşen **yalnız NAMED** export edilir. `export default` yasaktır, bu dizinlerden default ithal
de yasaktır. Muafiyet **adla** yazılır; şu an muafiyet yok.

**Niçin — tercih değil, ölçüm.** 2026-08-19 taraması: bu iki dizindeki sekiz bileşenin hepsi hem
named hem default export ediyordu. Sekiz default kapının **altısı hiçbir yerden kullanılmıyordu**
(ölü), kalan ikisi tek çağrı-yerindeydi. Ve `BulkBar` aynı depoda **iki farklı kapıdan** giriyordu:
`AdminLogisticsTableBody` default, diğer yedi dosya named.

İki kapı kendi başına çökme üretmez — ürettiği şey **sessiz ayrışmadır**: yeniden adlandırma yalnız
bir kapıyı takip eder, arama yalnız bir biçimi bulur, ve ölü-kod ölçümleri (knip) ölü kapıyı canlı
sanar. Yani kusur bir yazım tercihi değil, **ölçülebilirliği bozan** bir kusurdur; bu cetvelin geri
kalanı ölçüme dayandığı için buraya aittir.

**Zorlayan kapı:** INV-ADMIN-EXPORT-1 — `src/__tests__/conformance/admin-export-hygiene.test.ts`.

Kapı **üç ayrı sabotajla** kanıtlandı ve her sabotaj **farklı** bir testi düşürdü:

1. `BulkBar.tsx` dosyasına `export default BulkBar` geri kondu → **kural A** kırmızı.
2. `AdminLogisticsTableBody` default ithale döndürüldü → **kural B** kırmızı (kural A yeşilken).
   Bu, iki kuralın birbirinin yedeği olduğunu gösterir: biri diğerini gereksiz kılmaz.
3. Kapsam dizini var olmayan bir adla değiştirilerek tarama **kör edildi** → **stale-guard**
   kırmızı. Bu üçüncüsü olmasa, dizin yeniden adlandırıldığı gün kapı sessizce hiçbir şeyi ölçmez
   olur ve yeşil kalırdı — yani kapı kendi ön koşulunu da doğrular.

**Kapının ölçmediği, adıyla:** hiçbir modül çalıştırılmaz — "named export gerçekten var mı"
sorusunu `tsc` yanıtlar, bu kapı değil. `export * from` yeniden-ihracatı izlenmez (kapsanan
dizinlerde böyle bir kullanım yok, ölçüldü). Yorum ayıklama yalnız tam-satır yorumlarını atar:
satır-sonu yorumundaki örnek kod yanlış-KIRMIZI verebilir, yanlış-yeşil veremez.

---

## 7. RATCHET BASELINE (2026-08-15, admin kapsamı)

INV-ADMIN-DESIGN-1 için başlangıç tavanları — hedef hepsinde **0**:

| Sayaç | Baseline | Not |
|---|---|---|
| `window.confirm` / `confirm(` | **21** (admin 18 + public 3) | hedef 0 |
| `alert(` | **7** | hedef 0 |
| Bağımsız overlay implementasyonu | **~26** (admin 12 + public 14) | hedef: tek kit |
| Mükerrer bulk-bar | **3** | hedef 1 |
| Ham `z-30/40/50` (overlay-kritik) | **~30** | hedef 0 |
| Arbitrary `shadow-[…]` | **≥18** (adminUi 1 + StatCard 7 + OrdersTableBody 9 + AdminToolbar 1) | hedef 0 |
| Arbitrary boyut (`min-w-[1000px]`, `max-w-[120px]`, `min-h-[60px]`, `text-[0.8rem]`) | **4** | token karşılığı **zaten mevcut** |
| Ölü overlay kodu | **~1000 satır** (`InventoryDetailDrawer` + 4 alt bileşen + `InventoryCsvImport` + `InfoTooltip`) | sil veya bağla |
| Testi olmayan admin dosyası | **12** (`AdminLayout` dahil) | hedef 0 |

> Sayaçların kesin regex/glob tanımı INV testlerinin kendisinde yaşar (test = SSOT'un ikinci yarısı);
> buradaki sayılar ilk ölçümün kaydıdır, test yazılırken yeniden ölçülüp sabitlenir.
> Statik tarama tuzakları → `conformance-test-static-scan-gotchas` (import.meta.glob, tam-literal kök
> glob, stale-guard).

### 7.1 YENİDEN ÖLÇÜM — 2026-08-15 akşamı (Faz 5)

114 admin dosyası, **yorumlar ayıklanarak** ölçüldü. Ham `grep` bu depoda yanıltıcıdır: kuralı
*anlatan* yorumlar kuralın kendisini içerir (`window.confirm` yasağını açıklayan yorum,
`window.confirm` araması için bulgu üretir). Conformance testleri de yorum ayıklıyor; ölçüm aynı
yöntemi kullanmazsa iki sayı birbirini tutmaz ve hangisinin doğru olduğu belirsizleşir.

| Sayaç | Baseline | Şimdi | Durum |
|---|---|---|---|
| `window.confirm` / `confirm(` | 21 | **0** | ✅ kapı: INV-ADMIN-OVERLAY-1 |
| `alert(` | 7 | **0** | ✅ |
| Ham `z-*` | ~30 (tavan 57) | **0** | ✅ tavan **0**'a indirildi |
| Arbitrary `shadow-[0_0_…]` (glow) | ≥18 | **0** | ✅ `shadow-admin-*` |
| `font-black` | 475 | **0** | ✅ |
| `uppercase` | 539 | **3** | muaf: QR etiketinin yazdırma CSS'i |
| `tracking-widest` | 240 | **0** | ✅ |
| `glass` / `glass-strong` | çok | **0** | ✅ opak yüzey |
| Ham renk skalası (`slate-*` vb.) | 951 | **1** | muaf: önizleme cihaz çerçevesi |
| `focus:` (non-`focus-visible`) | çok | **0** | ✅ |
| `aria-invalid` | 1 | **31** | form modallarında alan-seviyesi hata |
| `aria-modal` | 8 eksik | **14** | her Dialog'da |
| Ölü overlay kodu | ~1000 satır | **0** | ölü değilmiş — **geri takıldı** (§7.2) |

**İki muafiyet ADLA verilmiştir, desenle değil:**
`InventoryQrLabel.tsx` (yazıcıya giden gerçek CSS, Tailwind sınıfı değil) ve
`CategoryBuilderView.tsx` (önizleme tuvali — admin kromu değil, içinde vitrin render ediliyor).

### 7.2 "Ölü kod" ölü değildi

Baseline'da "~1000 satır ölü overlay kodu — sil veya bağla" yazıyordu. Git arkeolojisi
üçünün de **kalite temizliğinde düşmüş kullanıcı işlevi** olduğunu gösterdi:
`3c7ea6ff` ("total quality purge — 980 to 0 errors") `AdminInventoryPage.tsx`'i **770 satırdan
27'ye** düşürmüş, konteyner buharlaşmış, sunum bileşenleri yetim kalmıştı. Hepsi geri takıldı.

**Cetvel kuralı:** bir bileşen "import edilmiyor" ise bu bir **soru**dur, cevap değil. Silmeden
önce `git log -S "<Ad>" --all -- src` ile eskiden kimin import ettiğine ve o commit'in
"purge/cleanup/lint fix" olup olmadığına bak; sözlükte ya da DB'de o yüzeye ait yetim kalmış
anahtar/kolon varsa işlev gerçekti.

### 7.3 SAYFA SKORLARI — 2026-08-16 (Faz 5: sayfa-başı §5 ölçümü)

21 rota + kabuk, 5 paralel ölçüm ajanı, yorum ayıklamalı. Sayfa başına GÖRSEL 11 + OVERLAY 11
maddesi; uygulanamayan madde **n.a.** sayıldı (✓ değil). Kabuk 18 maddesi bir kez ölçüldü.
Kanıt satırları (dosya:satır) ajan raporlarında; buradaki tablo özet skordur.

**Kabuk: 15/16** (statik ölçülebilir). Tek ✗: **K11** — sticky başlık var ama `scroll-padding-top`
hiçbir yerde tanımlı değil (hash çıpaları 56px başlığın altında kalır). K5/K6 (%400 zoom, %200
metin) statik ölçülemez — §6'daki zoom kapısı hâlâ açık kalem (`reflow-scan.mjs` var ama admin
rotalarına bağlı değil, Playwright tek proje).

| Sayfa | Skor | Sayfa | Skor |
|---|---|---|---|
| /admin (dashboard) | **6/14** | /admin/pricing | 14/20 |
| /admin/orders | **9/22** | /admin/pricing/rules | 15/21 |
| /admin/returns | 14/21 | /admin/pricing/preview | **14/16** ✦ |
| /admin/logistics | 10/15 | /admin/coupons | 12/17 |
| /admin/movements | 8/14 | /admin/settings | 13/19 |
| /admin/products | **10/21** | /admin/users | 13/20 |
| /admin/categories | **10/21** | /admin/audit-logs | 14/16 |
| /admin/categories/…/builder | **17/21** ✦ | /admin/errors | 15/16 |
| /admin/inventory | 16/22 | /admin/error-groups | 16/18 |
| /admin/inventory/report | 12/17 | /admin/webhook-events | 16/17 |
| /admin/inventory/settings | 13/17 | **TOPLAM** | **267/385 (%69)** |

✦ = grubunun en temizi. Desen net: **kit'e göçmüş yüzeyler cetveli tutuyor** (DataTableKit,
ConfirmProvider, AdminPageHeader temiz çıktı); drift kit DIŞI kalan bölgelerde toplanıyor.

**Altı sistematik drift (kök sebep az, yayılım geniş):**

| # | Drift | Yayılım | Kök |
|---|---|---|---|
| S1 | **G3**: gövde/hücre metni `font-semibold`/`font-bold` (cetvel: 400) | 21/21 sayfa | sayfa sayfa; en yoğun tablo hücreleri |
| S2 | **O10**: işlem hataları otomatik kapanan `toast.error`'da | ~15 sayfa | alışkanlık; inline örnek mevcut (inventory/settings, pricing/preview) |
| S3 | **O1**: paylaşılan `AdminModal` dururken 10 yerel `fixed inset-0` modal | products, categories, inventory×2, pricing×3, settings, orders | kalibrasyon dalgası form modallarına girmemiş |
| S4 | **G8**: vitrin tokenlarının admin'e sızması (`primary-navy`, `surface-deep`, `brand-cyan`) + dashboard grafiklerinde ham HEX | ~12 sayfa | grafik bileşenleri + eski form bileşenleri |
| S5 | **G11**: halkasız `outline-none` (ColumnsMenu/ExportMenu/AdminToolbar Switch/ProductFormModal) — klavye odağı görünmez | tablo sayfalarının tümü | 4 paylaşılan bileşen + 2 form modalı |
| S6 | **O6**: >5 girdili form modalda — `PricingRuleFormModal` **15 girdi**, `CategoryFormModal` **14 girdi + Tabs**, OrderFormModal 7+Tabs | 5 modal | O1 ile aynı kök: modal→panel/rota göçü yapılmadı |

**Cetvel kararı bekleyen madde:** `adminCardClass`/`adminTableContainerClass` düz karta
`shadow-admin-sm` basıyor (kit-düzeyi, her sayfaya yayılıyor). §3.3 "düz kartta gölge yok" der;
ya kit düzeltilir ya cetvele "hairline + `shadow-admin-sm` ikilisi meşru taban" istisnası yazılır.
Ölçümde bu madde ✗ sayıldı ama tek kök karardır.

**Adla kayıtlı ESKİ kusurlardan hâlâ açık olanlar:**
- **D15 hâlâ canlı:** `DateRangePicker.tsx:139` popover'da `z-toast` (§4.9'un adıyla yasakladığı
  birebir durum). §7.1 sayacı "ham z-*" aradığı için token'lı-ama-yanlış-katman atamasını görmedi.
  Aynı kör noktada: `ColumnsMenu`/`FacetedFilter` popover'ına `z-modal`, yerel modal overlay'lerine
  `z-backdrop` yerine `z-modal`.
- **G10 çift genişlik kaynağı:** `AdminInventoryReportPage` `max-w-page` (kabukla çift) ve
  `AdminInventorySettingsPage` `max-w-5xl` hâlâ yerinde (§3.7'de adla sayılmıştı).
  `AdminUsersPage` kök `max-w-4xl` ise kalkmış ✓.
- **Tokenlaşmış glow:** `tokens.js` `shadow-admin-categories-glow` = `0 0 8px` (Y-offset 0) —
  sayaç arbitrary `shadow-[…]` aradığı için token'a taşınmış glow'u görmedi. `admin-*-glow`
  ailesi (tokens.js:114-120) G6'nın token-katmanı artığı.

**§7.1 sayaçlarının ölçülen KÖR NOKTALARI (sayaç 0 derken ihlal yaşıyor):**
1. `font-black` sayacı **sınıf** arıyor; dashboard grafikleri (`SalesChart`, `ActivityHeatmap`,
   `AbcPieChart`) `fontWeight: 900/'black'` değerini **inline style** ile basıyor → sayaç 0, gerçek ≥6.
2. "Ham z-*" sayacı token kullanımını doğru sayıyor ama **katman semantiğini** ölçmüyor (D15 örneği).
3. "Arbitrary shadow" sayacı token'a taşınmış 0-offset glow'u görmüyor (categories örneği).
Ders: sayaç sıfırlandığında kural bitmiş sayılmaz — biçim değiştirip token/inline katmana taşınabilir.
(Aynı aile: `substring-assert-is-not-a-gate`.)

**Ölçümün bulduğu cetvel-ÜSTÜ ciddi kusurlar (tasarım değil işlev/tehlike; ilgili şeride):**
- `ReturnsTableBody` tekil durum menüsünden `refunded` = **gerçek para iadesi onaysız tek tık**
  (alertdialog yalnız rejected/cancelled'da; toplu akışta onay var, tekil akış açık).
- `AdminUsersTableBody:499-509` **tekil rol değişikliği onaysız** (super_admin atama/alma dahil;
  alertdialog yalnız toplu değişimde).
- `ProductCsvImport.tsx:176` tamamen elle overlay — role/aria-modal/ESC/odak-tuzağı/scroll-lock **YOK**
  (ölçümdeki en ağır a11y bulgusu).
- `ProductFormModal` şeması `brand`'i zorunlu istiyor ama formda alan yok → yeni ürün kaydı
  muhtemelen hiç valide olamıyor (işlevsel, doğrulanmalı).
- `RecentOrdersTable.tsx:125` var olmayan `/admin/orders/[id]` rotasına link.
- `ErrorsTableBody:201-206` seviye rozeti `bg-admin-danger text-admin-danger` (`-weak` eksik) —
  rozet metni okunmaz; kardeş sayfa error-groups'ta doğrusu var.
- Sessiz hata yüzeyleri: audit/errors `exportCsv` hatası hiçbir yüzeye düşmüyor;
  `AdminInventoryReportPage` veri hatası yalnız `console.error`.
- `InventoryCsvImport`: **"Tümünü geri al"** yalnız 15 sn'de kapanan toast'ta yaşıyor (§4.7:
  kritik geri alma kalıcı yüzeyde de olmalı).
- i18n yan bulguları: `DataTableKit`/`AdminToolbar` sabit Türkçe fallback'ler;
  `CategoryFormModal` sözlüksüz ham Türkçe toast'lar (kural 7).

---

## 8. PROVENANCE

D = resmi/normatif doküman veya kaynak kod · GP = genel iyi pratik (tek otorite spec'lemiyor)

| Kaynak | Ne kanıtladı | Tür |
|---|---|---|
| **WCAG 2.2** SC 1.4.4 / 1.4.10 / 1.4.11 / 1.4.12 / 1.4.13 / 2.4.1 / 2.4.13 | Zoom, reflow (320×256 ≡ 1280@%400), odak örtülmemesi, metin aralığı, hover içeriği, bypass blocks, odak görünümü — **normatif** | **D** |
| WCAG Teknikleri **F69 / F80 / F94 / F102 / F104 / C28 / C33 / C34 / G1 / ARIA11** | `overflow:hidden` = kırpılma sebebi (örnek kodu mevcut kabuğa birebir benziyor); vw-tipografi ihlali; sticky→static reçetesi; skip-link | **D** |
| **WAI-ARIA APG** — Dialog (Modal), Alert Dialog, Alert, Disclosure, Breadcrumb, Tooltip | Tam modal a11y sözleşmesi; açılış/kapanış odak senaryoları; `aria-modal`'ın iki koşulu; tooltip'in odak almaması; breadcrumb tanımı | **D** |
| **MDN** — `length` (viewport birimleri), `position`, `scroll-behavior`, `scroll-padding`, `overscroll-behavior`, `inert`, `visibility`, `aria-current`, `:focus-visible`, `History.scrollRestoration`, `grid-template-columns` | `vh ≡ lvh`; `dvh` performans uyarısı; sticky'nin overflow-ataya yapışması; `body`'den propagate etmeme; `inert` vs `visibility:hidden` farkı; "only one `aria-current`"; `fr` animasyon garantisizliği | **D** |
| **Chromium root-scroller explainer** (bokand) | Belge kaydırıcısının 6 ayrıcalığı; app-shell probleminin birebir tanımı | **D** |
| **web.dev** — viewport-units, prefers-color-scheme | `100vh` taşma problemi; tema deseni; saf beyazdan kaçınma | **D** |
| **IBM Carbon** — data-table SCSS (v11), Forms pattern, Dialog pattern, Modal, Popover, Tooltip, Notification, 2x Grid, color usage, `_z-index.scss`, `_focus-outline.scss`, UI Shell SCSS | Satır yükseklikleri 32/40/48/64px; **<5/>5 girdi eşiği**; "modal sayfanın alternatifi değil"; iç içe modal yasağı; dropdown'ın modal üstünde olma gerekçesi; odak halkası; katman merdiveni; 1584px grid maksimumu; shell 48/256/48px | **D** |
| **Shopify Polaris** — `polaris-tokens` (text/font/space/size/border/shadow/zIndex), `Frame.module.css`, `Page.module.css`, Modal/Sheet/Toast/Banner/Tooltip | Tam tipografi ve boşluk ölçeği; **gölge ölçeğinde Y-offset hiç 0 değil**; Sheet'in anti-pattern gerekçesiyle emekliliği; toast ≥10 000ms; `Frame`'de belge scroll'u + skip-link | **D** (bileşenler DEPRECATED) |
| **Atlassian Design System** — typography, spacing, elevation, color, Modal, Drawer, Popup, Tooltip, Flag; `@atlaskit/navigation-system` dist | Ağırlık kullanım kuralı (regular/medium/bold); "border is the default approach"; **"drawer is a modal dialog"**; iç içe dialog yasağı; tooltip yasakları; katman tablosu; 320/48px | **D** |
| **Material Design 3** (+ androidx token dosyaları, MDC, Flutter) | 600/840/1200/1600dp eşikleri; **600dp full-screen dialog eşiği**; dialog 280–560dp, max 2 aksiyon; nav rail 80/96dp, drawer 360dp; sentence case; elevation modeli | **D** (spec sayfaları SPA; token dosyaları resmî makine-üretimi) |
| **shadcn/ui** — `sidebar.tsx`, `use-mobile.ts`, `sheet.tsx`, manual installation | Nötr OKLCH palet (chroma 0); kart = background aynı renk; **gap+fixed collapse mekanizması**; cookie kalıcılık + SSR gerekçesi; 256/288/48px, 768px, 200ms; `svh` kullanımı; **`aria-expanded`/`aria-current` eksikleri** | **D** |
| **Radix** — Themes tokens; Primitives MDX; **lokal `@radix-ui/react-dialog@1.1.15` + `aria-hidden@1.2.4` dist** | Tip/boşluk/radius ölçekleri, gray 12-adım rol haritası; Popover'ın dialog pattern'i, HoverCard'ın a11y ağacı dışılığı; **`aria-modal` basmıyor**, `hideOthers` (inert değil), **scroll lock Overlay'de**; AlertDialog focus = Cancel (doküman yanlış) | **D** |
| **GitHub Primer** — Dialog guidelines + accessibility | **Deep-link → sayfa** kuralı; 2 iç içe dialog koşullu izin; dar viewport'ta input'lu dialog full-screen; side sheet = dialog | **D** |
| **Microsoft Fluent 2** — Dialog, Drawer, Popover, Tooltip, Toast | AlertDialog kullanım cümlesi; inline vs overlay drawer; "Don't nest dialogs"; drawer 2–3 adım; toast 7s | **D** |
| **AWS Cloudscape** — Delete pattern, Split view, Drawer | **Üç kademeli yıkıcı-onay modeli**; split panel non-modal; "split view should never replace details pages"; non-modal panel odak sözleşmesi | **D** |
| **Pinterest Gestalt** — Modal, OverlayPanel, Popover | *"Any time a separate, designated URL is desired"* → modal kullanma; 1–2 alan eşiği; iç içe modal yasağı | **D** |
| **Next.js** — Intercepting Routes | Paylaşılabilir URL/refresh'te tam sayfa, yumuşak gezinmede overlay; modal'ın 4 faydası | **D** |
| **NN/g** — Fessenden 2017, Nielsen 2018 & 2006, Laubheimer 2015, Whitenton 2015, Flaherty 2024, Wang 2023, Kendrick 2019 | Modal 4 kullan / 3 kullanma kuralı; onay rasyonlama + **"ayrıca undo sun"**; accordion kullan/kullanma; 2 seviyeden fazla disclosure sorunu; toast'ın hata için uygunsuzluğu; tooltip yasakları | **D** (araştırma) |
| Bootstrap 5.3 / MUI z-index ölçekleri | Katman yığını + "hepsini birlikte değiştir"; toast > modal | D (framework) / GP (tasarım otoritesi olarak) |
| Medusa Admin v2 · Saleor Dashboard (kaynak kod) | Route-bağlı overlay arketipleri (`RouteDrawer`=edit / `RouteFocusModal`=create); query-param modeli | **GP** (kod deseni; resmî doküman yok) |
| Alt rota → aktif öğe eşleme; breadcrumb 3+ seviye eşiği; sticky ≤%25 viewport | Mühendislik kararı; sınırı MDN "only one `aria-current`" ve WCAG Understanding çiziyor | **GP** |

**Erişilemeyen kaynaklar (uydurulmadı):** `m3.material.io` doğrudan fetch (SPA/404 — token dosyalarından
telafi edildi) · `polaris.shopify.com` (301, arşiv reposundan telafi) · `atlassian.design/components/*`
canlı sayfaları (client-render, ayna repodan) · `carbondesignsystem.com` v11 canlı (truncate; v10 + GitHub
kaynağından) · Apple HIG Modality (JS zorunlu) · Carbon Side panel usage (404 — sayfa mevcut değil) ·
Carbon `$spacing-01…13` tam tablosu (yalnız `$spacing-05=16px` ve `$spacing-09=48px` çapraz doğrulandı) ·
Polaris `--pg-layout-width-primary-max` sayısal değeri.

**Kaynak çelişkileri ve verilen kararlar:** spacing tabanı (4px vs 8px → 4px atomik + 8px ritim) ·
Carbon satır yükseklikleri v10≠v11 (v11 esas) · iç içe overlay (§4.4'te tür ekseninde çözüldü) ·
yan panel bağlam korur mu (§4.3'te modal/non-modal ayrımıyla çözüldü) · dropdown modal'ın üstünde mi
(§4.9'da Carbon izlendi, gerekçe portal davranışı) · toast süresi (aksiyonlu = otomatik kapanmaz ortak
paydası alındı).

**Yanlış atfedilmemesi gerekenler:** NN/g "undo > confirm" **demiyor** (ikisini de istiyor) ·
Radix, tooltip'in dokunmatikte kullanılmaması / etkileşimli içerik almaması / HoverCard'ın kritik içerik
taşımaması kurallarını **yazmıyor** (bunlar Atlassian/Carbon/Polaris/APG'de) · Polaris iç içe modal
hakkında **hiçbir şey söylemiyor** · Polaris ve Atlassian modal için **alan sayısı eşiği vermiyor**
(sayı yalnız Carbon ve Gestalt'ta) · GOV.UK'in modal hakkında **yayınlanmış duruşu yok**.

---

*Kaynak: 3 paralel araştırma ajanı (kurumsal görsel dil · overlay taksonomisi · kabuk mekaniği),
2026-08-15; birincil kaynak + tasarım sistemi kaynak kodu + lokal `node_modules` doğrulaması.
Ölçülen drift: bu oturumun admin denetimi (§1). Kardeş cetvel: `storefront-design-standard.md`.
Yapısal kontrat: `admin-standard.md` (§8 sayfa cetveli, §10.4 kabuk cetveli).*


---
# FILE: docs\standards\admin-standard.md

# VentHub Admin / Back-Office Standardı

> **Bu dosya nedir?** Gerçek, profesyonel bir e-ticaret admin panelinin **yapısal** standardı —
> "nasıl görünür" değil, **nasıl kurulur**. Dünyanın en iyi ticari admin'lerinin (Shopify, Medusa,
> Saleor) gerçekte nasıl çalıştığından damıtıldı, **VentHub'a uyarlandı**.
>
> **İki işi var:**
> 1. **Kontrat** — yeni veya yeniden yazılan her admin sayfası buna uymak zorunda.
> 2. **Cetvel** — mevcut paneli buna göre ölçmek için (§8 Uygunluk Kontrol Listesi).
>
> **Kaynaklar:** Refine · Shopify Polaris · Medusa Admin · Saleor Dashboard · shadcn-admin (provenance §9).
> Yaşayan doküman — büyür ama her an **kullanılır ve eksiksizdir**. Strateji: memory `standard-first-strategy`.
>
> 🎨 **Kardeş cetvel — `admin-design-standard.md` (v1.0, 2026-08-15):** bu dosya *yapıyı ve davranışı*
> sabitler; **görünüş, his ve yerleşim mekaniği** oraya aittir — kabuk scroll sahipliği ve zoom
> dayanıklılığı (WCAG 1.4.10 / 1.4.4), sidebar collapse mekaniği, yoğunluk / tipografi / yüzey kuralları
> ve **etkileşim yüzeyi (overlay) taksonomisi** ("nerede modal, nerede non-modal panel, nerede ayrı
> rota, nerede popover"). §4.3'teki route-modal kararının kaynaklı gerekçesi ve §10.4'ün kapsamadığı
> yerleşim/a11y maddeleri de oradadır. **İkisi birlikte admin'in tam cetvelidir.**

---

## 0. Sade dille: bir admin paneli neden "gerçek" olur?

Bir admin'i profesyonel yapan şey **güzelliği değil**, her sayfasının **aynı küçük kural setine** uymasıdır.
20 sayfa, 20 farklı şekilde yapılırsa → "derleme/yamalı" hissi (senin panelinin sorunu). Aynı 20 sayfa
**tek bir iskelete** oturursa → tutarlı, öngörülebilir, bakımı kolay = "gerçek."

İncelediğimiz beş otorite kaynağın **hepsi** şu beş kuralda birleşti. Bunlar pazarlık konusu değil:

| # | Kanun | Sade açıklama |
|---|-------|---------------|
| **K1** | **Tek ortak tablo iskeleti** | Her liste sayfası için tabloyu sıfırdan yazma. Tek bir "tablo kiti" yap, her sayfa onu *ayarlayarak* kullansın. |
| **K2** | **Durum URL'de yaşar** | Hangi sayfadasın, neyi sıraladın/filtreledin/aradın — hepsi adres çubuğunda. Böylece link paylaşılabilir, geri tuşu çalışır. |
| **K3** | **Tek yetki kapısı, her yerde** | "Bu kişi bunu yapabilir mi?" kararı tek yerden verilir ve menüde de, butonda da, fonksiyonun içinde de aynı kapı sorulur. **Ama asıl kapı sunucudaki RLS'tir.** |
| **K4** | **Her değişiklik iz bırakır** | Kim, ne zaman, neyi değiştirdi — sunucu tarafında kaydedilir (istemci kaydı güvenilmez). |
| **K5** | **Her sayfa tüm hâllerini ilan eder** | Yükleniyor / boş / hata / "sonuç yok" / yetkisiz — hiçbiri unutulamaz. |

Geri kalan her şey (i18n, a11y, design token, realtime, multi-tenant) bu beşin üstüne oturur. §6'da detay.

---

## 1. Sayfa arketipleri (bilgi mimarisi)

Beş kaynak da hemfikir: bir admin sınırlı sayıda sayfa **tipinden** oluşur. Her rota **birine** oturmalı —
"sistem-dışı" büyümüş sayfa yoktur (VentHub borcu: `AdminInventoryPage`, `AdminWebhookEventsPage`).

1. **Dashboard** — KPI kartları + grafik + son aktivite + uyarı. Giriş ekranı, tek.
   *VentHub'da var:* `StatCard`, `SalesChart`, `AbcPieChart`, `ActivityHeatmap`, `RecentOrdersTable`.
2. **Resource Index (Liste)** — bir kaynağın koleksiyonu; gez/ara/filtrele/sırala/toplu-işlem. **Panelin ~%80'i.** → §3
3. **Resource Details (Detay/CRUD)** — tek kaydı görüntüle/oluştur/düzenle. → §4
4. **Settings** — yapılandırma; hiyerarşik gruplanmış annotasyonlu form. → §5

---

## 2. Ortak tablo iskeleti (K1) — panelin kalbi

**Yakınsama:** Medusa `DataTable`, Saleor `Datagrid`, shadcn-admin `data-table/` kiti — üçü de **tek jenerik kit +
kaynak-başına config**. Sen her admin sayfasında bu mantığı kopyalamışsın; standart bunu **tekilleştirmek**.

### 2.1 Mimari: jenerik kit + feature dilimi (shadcn-admin modeli, VentHub'a uyarlı)

```
src/components/admin/data-table/        ← JENERİK KİT (bir kez yazılır, herkes kullanır)
├─ DataTable.tsx            # useReactTable host'u; tüm state'i kurar
├─ DataTableToolbar.tsx     # arama + faceted filtreler + reset + kolon görünürlüğü
├─ DataTableColumnHeader.tsx# sıralanabilir başlık (asc/desc/gizle + aria-sort)
├─ DataTableFacetedFilter.tsx # Popover + çok-seçim filtre (sayaçlı)
├─ DataTableViewOptions.tsx # kolon göster/gizle menüsü
├─ DataTablePagination.tsx  # sayfa boyutu + ilk/önceki/sonraki/son + "N seçili"
└─ DataTableBulkActions.tsx # seçim varken çıkan toplu-işlem çubuğu

src/features/admin/<entity>/            ← KAYNAK DİLİMİ (sayfa-başına config)
├─ columns.tsx             # ColumnDef<T>[] — kolonların TEK kaynağı (SSOT)
├─ schema.ts               # zod tipi
├─ <Entity>Table.tsx       # jenerik DataTable'ı bu kaynağın config'iyle sarar
└─ dialogs/                # CRUD form modalleri (state context ile yönetilir)
```

> **Not:** VentHub'ın hazır parçaları zaten bunların karşılığı: `ColumnsMenu`≈ViewOptions, `ExportMenu`,
> `BulkActionToolbar`≈BulkActions, `AdminToolbar`≈Toolbar. **İş = bunları tek kite toplayıp her sayfaya
> kopyalamak yerine import ettirmek.** Önerilen `useAdminTable` hook'u bu kitin state motoru olur (§7).

### 2.2 Liste state kontratı (K2 — Refine `useTable` modeli, hepsi onaylıyor)

Her liste sayfası şu state'i sağlamak ZORUNDA; ve hepsi **URL'ye senkron** (Refine `syncWithLocation`,
Saleor URL token'ları, shadcn-admin `use-table-url-state` — üçü de aynı):

- **Pagination:** `currentPage`, `pageSize`, `pageCount`, `total` — **server-side** varsayılan.
- **Sorting:** `sorters: [{field, order:'asc'|'desc'}]` — çok-kolon; başlıktan toggle; `aria-sort` + görsel ok.
- **Filtering:** `filters: [{field, operator, value}]` — faceted (durum/kategori).
- **Arama:** global, **debounced** (≥250ms).
- **URL senkron:** yukarıdakilerin hepsi adres çubuğunda → paylaşılabilir, geri-tuşu doğru, reload-güvenli.

### 2.3 Tablo davranış kontratı (TanStack + shadcn anatomisi)

Bir "tam" tablo şu parçalardan oluşur (hepsi jenerik kitte, bir kez):

| Yetenek | TanStack bağlantısı | VentHub karşılığı |
|---|---|---|
| Sıralama | `getSortedRowModel` + `column.toggleSorting()` | — |
| Filtreleme | `getFilteredRowModel` + `column.setFilterValue()` | — |
| Faceted filtre | `getFacetedRowModel` + `getFacetedUniqueValues` | — |
| Sayfalama | `getPaginationRowModel` | — |
| Row selection | `select` kolonu (header "tümü", satır checkbox) | `BulkActionToolbar` |
| Kolon görünürlüğü | `VisibilityState` + `getCanHide/toggleVisibility` | `ColumnsMenu` ✓ |
| CSV export | — | `ExportMenu` ✓ |
| Row actions | sondaki `actions` kolonu → `row.original` dropdown | — |

**Kritik kural (TanStack):** sort/filter/pagination **aynı tarafta** olmalı (hepsi client ya da hepsi server).
Karıştırma → sadece yüklü veriyi sıralar = sessiz bug.

### 2.4 Toplu işlemler (bulk actions) — Polaris + Saleor + Medusa hemfikir

- Toplu-işlem çubuğu **yalnızca satır seçiliyken** görünür; işlem bitince `clearSelection()`.
- Etiket = **fiil + isim** ("Ürünleri arşivle", "Siparişleri sil") — "Fulfillment: …" gibi prefix yok.
- Shift-tık = aralık seçimi; sayfalar arası "tümünü seç" desteklenir.
- **Her toplu mutasyon RBAC + audit'e tabi** (K3, K4) — VentHub'da bu eksikti, audit'te yakalandı.

### 2.5 Filtreler (Polaris 4-parça yapısı)

Arama alanı → 2-3 "öne çıkan" kısayol filtre + gerisi "Filtre ekle" arkasında → uygulanan filtreler (silinebilir
pill'ler) → **"Tümünü temizle"**. Pill = sadece değer ("Ödendi"), kategori prefix'i yok. Arama etiketi
eylem-odaklı ("Siparişlerde ara"), "metin girin" değil.

### 2.6 Durumlar (K5) — Saleor "üç hâl" kuralı

**Asla atlanamaz:** Yükleniyor (`AdminSkeleton` ✓) · Veri yok (`AdminEmptyState` ✓, tabloyu değil placeholder'ı
göster) · Hata · **Filtre-sıfır** (tablonun kendi "sonuç yok" satırı — *veri yok*'tan farklı şey) · Yetkisiz
(`AccessDenied` ✓). "Veri yok" ile "filtreledin sonuç çıkmadı"yı **karıştırma**.

---

## 3. Resource Index (Liste sayfası) — bileşim sırası

**Polaris yapısı (yukarıdan aşağı):**
1. **Sayfa başlığı** — kaynak adı çoğul ("Ürünler", "Siparişler") + sağ üstte **birincil eylem** ("Yeni ürün";
   oluşturma yoksa hiç koyma).
2. **Toolbar** — arama + filtreler + sıralama (§2).
3. **Tablo** (IndexTable) — satırlar **tıklanabilir → detay sayfasına gider**; sayısal hücreler sağa dayalı;
   başlık seti tanımlar ("50 ürün gösteriliyor").
4. **Sayfalama** — altta; ~50 öğeden sonra zorunlu.

---

## 4. Resource Details (Detay / CRUD) — bölüm bileşimi

**Yakınsama (Medusa `TwoColumnPage` + Saleor `DetailPageLayout` + Polaris iki-kolon):** detay sayfası
**bağımsız bölümlerin (card) bileşimidir**, tek dev form değil.

### 4.1 Yerleşim
- **İki kolon:** ana içerik **sol 2/3** (nesneyi *tanımlayan* bilgi: ad, açıklama, kalemler) + yan **sağ 1/3**
  (durum, metadata, özet, kanal/availability). Mobilde tek kolona iner.
- **Card-bazlı:** benzer içerik tek card'da; card'lar öneme göre sıralı. Her bölüm **kendi başlığı + kendi
  satır-eylemlerini** taşır (self-contained).
- Medusa standardı: her varlıkta **JSON görünümü + Metadata editörü** paneli.

### 4.2 Form + kaydetme (Saleor "Savebar state machine" + Medusa RHF+Zod)
- **Form:** react-hook-form + **Zod** validasyon; hata mesajı alan altında.
- **Sticky Savebar:** Sil (sol) · Vazgeç (→ listeye dön) · Kaydet. Kaydet butonu **`isSaveDisabled`** ile
  kontrollü (dirty/valid değilse pasif). Durum makinesi: default → loading → success/error.
- **Kirli-durum guard'ı:** kaydedilmemiş değişiklikle ayrılırken uyar.
- **Çift-submit engeli** + her sonuç **toast** (sonner).
- Sunucu hataları `__typename`/alan adına göre forma maplenir.

### 4.3 Create/Edit nasıl açılır? — VentHub kararı
İki geçerli kalıp var: (a) **route-modal** (Medusa: URL kaynak, deep-link, geri tuşu kapatır), (b) **context-driven
dialog** (shadcn-admin). VentHub App Router + mevcut `ProductFormModal`/`CategoryFormModal` kullanımıyla uyumlu
olan: **route-modal'a kademeli geçiş** (deep-link + geri-tuşu kazancı). Şimdilik mevcut modal'lar kalır,
yeni sayfalar route-modal kalıbını hedefler.

---

## 5. Settings arketipi (Polaris App Settings Layout)

- Sayfa başlığı (birincil+ikincil eylem) → **dikey istiflenmiş ayar grupları**.
- Her grup = **annotasyonlu iki-kolon satır**: sol = başlık + (gerekirse) kısa açıklama (~2fr), sağ = ilgili form
  alanlarını taşıyan card (~5fr). Gruplar arası ayraç; küçük ekranda tek kolon.
- İlişkili ayarlar **tek card'da** grupla; açıklamayı **sadece gerçekten faydalıysa** ekle (doldurma yapma).
- Settings ayrı bir IA kovasıdır (Medusa: store config, regions, users, **API keys**, …).

---

## 6. Çapraz-kesen zorunluluklar (her sayfada)

### 6.1 RBAC (K3) — tek kapı, iki katman + RLS
Karar **(resource, action)** ikilisiyle (Refine `can({resource, action, params})`; Saleor `RequirePermissions`).
**Aynı kapı** menüyü de, inline butonu da, fonksiyonu da korur.
- **Katman 1 — UI:** yetkisizse buton pasif/gizli (`AccessDenied`, `useRole().canWrite(entity)`).
- **Katman 2 — fonksiyon içi:** `if (!canWrite) return` — buton gizli olsa bile handler korunur.
- **Katman 3 — ASIL KAPI: Sunucu RLS.** İstemci guard'ı kozmetiktir; Refine bile "client kararı güvenilmez"
  diyor. Her yazma yolu Supabase **RLS** ile korunmalı (ikiz `row-level-security.md`). VentHub kuralı: yetki
  `app_metadata`'dan, asla `raw_user_meta_data`.

### 6.2 Audit (K4) — her kritik mutasyon
Her create/update/delete → `logAdminAction(supabase, { table_name, row_pk, action, before, after, comment })`
→ `admin_audit_log`. Before/after farkı tutulur (Refine auditLogProvider: actor + action + before/after).
**Sunucu tarafı kaynak doğrudur** — istemci log'u güvence değildir.

### 6.3 Realtime — liste/detay canlı güncellenir
Refine `liveProvider` modeli: backend `created/updated/deleted` olayında liste auto-refetch.
*VentHub'da var:* `AdminRealtimeNotifications`. **Tenant-scoped** olmalı (§6.7).

### 6.4 Bildirim / Toast — sessizlik yasak
Her eylemin geri bildirimi (sonner). Refine `notificationProvider` + **undoable mutation**: optimistik silme +
N-saniye "geri al" penceresi (önerilen UX iyileştirmesi).

### 6.5 i18n — tüm metin sözlükten
`_t('x') || 'Fallback'` kalıbı **yasak** (anahtar eksikse sözlüğe ekle). Sıralama/filtre etiketleri bile prop,
asla hardcoded (Medusa standardı). VentHub: SSOT `dictionaries/tr.ts`, `en.ts`.

### 6.6 a11y
İkon-butona `aria-label`, input'a `label`, sıralanabilir başlığa `aria-sort`, satır-tıklamasına
`role="button"`+`tabIndex`+`onKeyDown`, her interaktif öğeye `focus-visible` halkası.

### 6.7 Design token & Multi-tenant
- **Token:** ortak `adminUi.ts` sınıfları; arbitrary Tailwind (`min-w-900px`) **yasak**; renk HSL custom property.
- **Multi-tenant (SaaS yönü):** tenant filtresi **merkezi** enjekte edilir (Refine: dataProvider her `getList`'e
  tenant filtresi ekler + accessControl tenant sahipliğini `params`'tan doğrular) — **sayfa sayfa değil**. Tüm
  okuma/yazma/realtime kanalı tenant-scoped (data bleeding = felaket).

---

## 7. VentHub'a özel değer (kopyalama değil — uyarlama)

### 7.1 Mevcut parçaların standarda haritası
Sen aslında parçaların çoğunu kurmuşsun; eksik olan **birleştirme**:

| Standart gereği | VentHub'da durum |
|---|---|
| Ortak tablo kiti | parçalı: `AdminToolbar`, `ColumnsMenu`, `ExportMenu`, `BulkActionToolbar` → **tek kite topla** |
| Liste state motoru | her sayfada kopya → **`useAdminTable` hook'una çıkar** |
| RBAC | `useRole().canWrite` + `src/lib/rbac.ts` ✓ — fonksiyon-içi guard eksikleri kapat |
| Audit | `logAdminAction` + `admin_audit_log` ✓ — eksik mutasyonlara ekle |
| Durumlar | `AdminSkeleton`, `AdminEmptyState`, `AccessDenied` ✓ — her sayfada bağla |
| Realtime | `AdminRealtimeNotifications` ✓ — tenant-scope doğrula |
| Dashboard | `StatCard`/`SalesChart`/`AbcPieChart`/`ActivityHeatmap` ✓ |

### 7.2 `useAdminTable` hook kontratı (önerilen — kitin state motoru)
```ts
useAdminTable<T>({ resource, columns, fetcher }) => {
  rows, total, isLoading, error,
  pagination: { currentPage, pageSize, pageCount, setPage, setPageSize },
  sorting:    { sorters, toggleSort },
  filtering:  { filters, setFilters, query, setQuery /* debounced */ },
  selection:  { selected, toggleRow, clearSelection },
  // hepsi URL'ye senkron
}
```

### 7.3 Uygulama yolu (scope creep'e karşı — memory `standard-first-strategy`)
1. **Altın referans sayfa** seç (en temiz mevcut liste, ör. `AdminCouponsPage`) → standarda %100 uydur.
2. O sayfadan **jenerik kiti + `useAdminTable`'ı çıkar**.
3. Diğer sayfaları **tek tek** kite taşı (her taşımada §8 skoru yükselir).
4. İki "sistem-dışı" sayfayı (`AdminInventoryPage`, `AdminWebhookEventsPage`) kite göre **yeniden yaz**.

### 7.4 HVAC/domain notu
Ürün listesinde HVAC'a özgü kolonlar (debi m³/h, basınç Pa, ses dB, filtre sınıfı) **faceted filter** adayı —
müşteri/admin "şu debinin üstü + şu ses altı" diye süzebilmeli. Standart bunu data-table faceted-filter ile
karşılar; ayrı özel ekran gerekmez.

---

## 8. Uygunluk Kontrol Listesi (CETVEL — ölçüm aracı)

Her admin sayfası için işaretle. **Skor = ✓ / 24.** Bu, "refactor mı rewrite mı" kararını **his değil sayı** yapar
(çoğu sayfa yüksek → hedefli düzelt; her yerde düşük → o zaman rewrite konuşulur).

**Liste sayfası:**
- [ ] Server-side pagination + `total`
- [ ] Çok-kolon sorting + `aria-sort`
- [ ] Faceted filter + "tümünü temizle"
- [ ] Debounced global arama
- [ ] URL senkron (sayfa/sort/filtre/arama)
- [ ] Row selection + bulk action (fiil+isim etiketi)
- [ ] Kolon görünürlüğü
- [ ] CSV export
- [ ] Satır tıklaması → detay
- [ ] 5 durum: skeleton / veri-yok / hata / filtre-sıfır / yetkisiz

**Detay / CRUD:**
- [ ] İki-kolon + bölüm (card) bileşimi
- [ ] Alan validasyonu (Zod)
- [ ] Sticky Savebar + `isSaveDisabled` durum makinesi
- [ ] Kirli-durum guard'ı
- [ ] Çift-submit engeli + toast

**Çapraz (her sayfa):**
- [ ] RBAC Katman 1 (UI guard)
- [ ] RBAC Katman 2 (fonksiyon-içi guard)
- [ ] RBAC Katman 3 (sunucu RLS — yazma yolları)
- [ ] Her mutasyonda `logAdminAction` **+ gerçek kalıcılaştırma** (no-op `fn` + başarı bildirimi = **sahte-success YASAK**)
- [ ] Realtime (tenant-scoped)
- [ ] i18n (fallback yok)
- [ ] a11y (aria-label/label/aria-sort/focus-visible)
- [ ] Design token (arbitrary yok)
- [ ] 4 arketipten birine oturuyor (sistem-dışı değil)

> **Zorlayan testler (INV-*, `src/__tests__/conformance/`):** cetvelin "geriye-denetleyen + geleceği-kilitleyen"
> ayağı. **INV-6 `admin-mutate-real-write`** = sahte-success bekçisi: her `mutateWithAudit` `fn` gövdesi
> gerçek yazma (`.insert/.update/.upsert/.delete/.rpc/.functions.invoke`) ya da awaited servis çağrısı
> içermeli; no-op `Promise.resolve()` = FAIL. (Kontrol = cetvel + onu zorlayan test — `standard-plus-enforcing-test-is-control`.)

---

## 9. Provenance (bu doküman neye dayanıyor)

| Kaynak | Ne kanıtladı |
|---|---|
| **Refine** (`refinedev/refine`, context7) | `useTable` state kontratı, `can()` RBAC, provider modeli (audit/notification/i18n/live/auth), syncWithLocation, multi-tenant merkezi enjeksiyon |
| **Shopify Polaris** (`polaris-react.shopify.com`) | Sayfa arketipleri, Resource Index/Details/Settings yerleşimi, IndexTable + Filters kuralları, bulk-action "fiil+isim" |
| **Medusa Admin** (`medusajs/medusa`) | Jenerik `DataTable` kiti, `TwoColumnPage` + bölüm bileşimi, route-modal CRUD, JSON+Metadata panel, API-key tip ayrımı |
| **Saleor Dashboard** (`saleor/saleor-dashboard`) | `Datagrid` kontratı, Savebar state machine, `RequirePermissions` (tek enum menü+inline), "üç hâl" state kuralı, ListSettings kalıcılık |
| **shadcn-admin** (`satnaing/shadcn-admin`) | Aynı stack'te (Next+Tailwind+Radix) somut dosya anatomisi: jenerik `data-table/` kiti + feature dilimi, URL-state hook |

**Yakınsama notu:** K1–K5 kanunları beş kaynağın **ortak paydası** olduğu için standarttır — tek bir ürünün
tercihi değil, sektörün uzlaşısı.

**İkize yükleme:** Bu doküman + `SOURCES.md`'deki kaynaklar NotebookLM "VentHub Proje Hafizasi" ikizine
eklenince RAG ile "X sayfası standarda uyuyor mu?" sorulabilir.

---

*Kaynak: 5 otorite (Refine/Polaris/Medusa/Saleor/shadcn-admin) paralel araştırma → VentHub mevcut yapısına
uyarlandı. Strateji: memory `standard-first-strategy`, boru hattı `knowledge-infra-pipeline`.*

---

## 10. Admin Shell Standardı (komut paleti + global arama + navigasyon + klavye)

> **Bu bölüm neyi standartlaştırır?** Her admin sayfasının içine oturduğu **kabuğu (shell):** üst-bar, sol-nav,
> komut paleti (⌘K), global arama, klavye sistemi. §1-§8 *sayfaların* standardıydı; **§10 *çerçevenin*.**
> **Kaynaklar:** cmdk/kbar · Linear · Vercel Dashboard · Stripe Dashboard · Raycast · Shopify Polaris (top-bar+nav).
> Yakınsama: dünya-standardı admin'ler arama + komut + navigasyonu **tek klavye-öncelikli kabukta** birleştirir.
> İlgili yetenek açığı: `admin-capabilities.md §4.5` (E1/E2/E8). Bu = onların **NASIL'ı**.

### S-Kanunları (shell — pazarlık konusu değil)

| # | Kanun | Sade açıklama |
|---|---|---|
| **S1** | **Tek kaynak/komut registry (SSOT)** | Nav öğeleri + aranabilir kaynaklar + hızlı aksiyonlar **tek listeden**. Sidebar + komut paleti aynı registry'yi tüketir → **kopya nav listesi yasak.** |
| **S2** | **Komut paleti = federe + klavye-öncelikli** | ⌘K her yerden; **tüm kaynaklarda** arar (sipariş/ürün/iade/bayi…); gruplu sonuç; navigasyon **ve** aksiyon; RBAC-scoped; tenant-safe. |
| **S3** | **Global arama typeahead** | Debounced (≥250ms), ranked, kaynağa göre gruplu; Enter → detaya deep-link; yükleniyor/sonuç/boş/hata durumları ilan edilir. |
| **S4** | **Klavye-öncelikli + tutarlı** | ⌘K (palet), `/` (arama focus), oklar (gez), Enter (seç), Esc (kapat). Power-user kısayolu (`g o`=orders) opsiyonel ama **tutarlı + keşfedilebilir** (palet footer'ında gösterilir). |
| **S5** | **Modern nav kabuğu** | Gruplu + **RBAC-filtreli** sidebar (aktif-durum, collapse, mobil drawer) + üst-bar (arama girişi, bildirim, kullanıcı). Responsive; her sayfa bu kabuğa oturur. |

### 10.1 Komut paleti anatomisi (S2)
- **Giriş:** ⌘/Ctrl+K her admin sayfasından; üst-bar arama kutusu da paleti açar.
- **Federe arama:** erişilebilir + aranabilir kaynakların searcher'ları **paralel** (`Promise.allSettled`); bir kaynak patlarsa diğerleri görünür.
- **Sonuç modeli:** `{ resourceKey, id, title, subtitle?, route }`; kaynağa göre gruplu başlık.
- **Aksiyonlar:** navigasyon + (yetkiye bağlı) hızlı-create ("Yeni ürün"), opsiyonel tema/çıkış.
- **RBAC:** yalnız `canAccess` kaynaklar listelenir/aranır; aksiyon `canWrite`'a bağlı.

### 10.2 Searcher sözleşmesi (S1+S2)
- **DI:** `(supabase, query, limit) => Promise<CommandResult[]>`; modül-düzeyi statik client importu yasak.
- **Mükerrerlik YASAĞI:** var olan servis fonksiyonunu (ör. `adminSearchProducts`) **yeniden kullan**; sıfırdan kopya sorgu yazma.
- **Tenant-safe:** RLS-korumalı client; `service_role` bypass yasak.

### 10.3 Navigasyon kabuğu (S5)
- Sidebar grupları + öğeleri **registry'den** (S1); aktif = route eşleşmesi; RBAC-filtreli.
- Üst-bar: marka + global arama girişi (⌘K ipucu) + bildirim (E2) + kullanıcı menüsü.
- Mobil: drawer; a11y: `<nav>` + `aria-current="page"`; her interaktif öğede focus-visible.

### 10.4 Shell Uygunluk Kontrol Listesi (CETVEL — ölçüm aracı) · Skor = ✓ / 17
- [ ] S1 Tek registry; sidebar + palet aynı kaynaktan (kopya nav yok) **[kbar]**
- [ ] S2 ⌘K her admin sayfasından **açar ve kapatır** **[Linear]**
- [ ] S2 Palet ≥6 kaynakta federe arar (paralel, `allSettled`)
- [ ] S2 Sonuçlar kaynağa göre **gruplu + ranked** **[Stripe]**
- [ ] S2 **Bağlam-duyarlı sıralama** (açıldığı görünüme göre ilgili önce) **[Linear]**
- [ ] S2 Navigasyon **+ aksiyon** (yalnız nav değil) **[Raycast/kbar]**
- [ ] S2 RBAC-scoped (yetkisiz kaynak listelenmez)
- [ ] S2 Tenant-safe searcher (RLS-client, `service_role` yok)
- [ ] S3 Debounced typeahead + 4 durum (yükleniyor/sonuç/boş/hata) **[cmdk]**
- [ ] S3 **Boşken recent/öneri** gösterilir **[Stripe]**
- [ ] S3 Enter → detaya deep-link; (ops.) güç-sözdizimi `is:`/alan:değer **[Stripe]**
- [ ] S4 ⌘K / `/` / ok / Enter / Esc + `?` yardım + (ops.) `g`-önek go-to **[Linear]**
- [ ] S5 Sidebar RBAC-filtreli + aktif-durum (`selected`) **[Polaris]**
- [ ] S5 Üst-bar: arama + bildirim + kullanıcı — **global nav DEĞİL** (nav ayrı) **[Polaris]**
- [ ] S5 Responsive (mobil drawer / `showNavigationToggle`) **[Polaris]**
- [ ] S2 **Minimal yüzey** — iş bitince kapanır, odak görevde **[Raycast]**
- [ ] a11y: palet `combobox`/`aria-activedescendant`, nav `aria-current`, **axe-0** **[cmdk/WAI-ARIA]**

> §6 çapraz-kesen zorunluluklar (DI, i18n-fallback-yok, design token, a11y, tenant-scope) bu kabuğun **da** üstüne oturur. "Refactor mı rewrite mı" yerine burada soru: kabuk bu **17 maddeyi** karşılıyor mu?

### 10.5 Provenance (§10 neye dayanıyor — §9 gibi, gerçek kaynaktan)

| Kaynak | Ne kanıtladı (dokümante / koddan) | Tür |
|---|---|---|
| **cmdk** (pacocoursey/cmdk, Vercel) | Headless composable combobox (`Command/Input/List/Group/Item/Empty`); `filter(value,search,keywords)→skor` sözleşmesi; erişilebilir combobox a11y; `Command.Loading`/async; nested "pages"; açılış kısayolunu KASITLI uygulamaya bırakır | D |
| **kbar** | Veri-merkezli **action registry** (`id/name/shortcut/keywords/section/priority/perform/parent`); `useRegisterActions` ile **async/dinamik kayıt** (`#`→issue, `@`→user); section+Priority sıralama; shortcut dizileri (`g i`); virtualized results | D |
| **Stripe Dashboard** | Federe arama **tipe-göre-gruplu + ranked**; güç-kullanıcı sözdizimi (`is:` / alan:değer / aralık / negasyon), URL-encoded (paylaşılabilir); sidebar grupları (Primary/Shortcuts/Products/Settings); `?` kısayol listesi | D |
| **Shopify Polaris** | **Frame** kabuk iskeleti; **TopBar ≠ global nav** (TopBar = arama + kullanıcı menüsü; global nav AYRI `Navigation`); `Navigation.Section`/`selected`/`showNavigationToggle`; WCAG 2.0 kontrast | D |
| **Linear** | ⌘K **açar VE kapatır**; **bağlam-duyarlı** komut sıralaması (açıldığı görünüme göre); `g`-önek go-to (`g i`/`g p`); `?` yardım | D |
| **Raycast** | Search-then-act tek yüzey; **minimal** — hotkey'le gelir, iş bitince kaybolur; Action Panel (⌘K) | D |
| Combobox/listbox ARIA + boş-state recent/öneri | WAI-ARIA combobox pattern + yaygın palet deseni | GP |

> **D = resmi doküman/koddan doğrulandı · GP = genel-iyi-pratik (tek otorite açık spec'lemiyor).** Araştırma: 2026-06-17, 2 paralel ajan, context7 + GitHub repo + resmi UX dokümanları. Erişilemeyen kaynaklar (Mobbin 403, bazı Linear sayfaları 404) yerine erişilebilen resmi kaynaklardan doğrulandı; üçüncü-taraf shortcut sitelerine dayanılmadı.
>
> **Bu provenance ışığında eklenen/sağlamlaşan yasalar:** TopBar≠global-nav (Polaris) → S5'te netleşti · arama sözdizimi `is:`/alan:değer (Stripe) → S3 güç-kullanıcı maddesi · bağlam-duyarlı sıralama + `g`-önek (Linear) → S2/S4 · minimal-kaybolan yüzey (Raycast) → S2 · action-registry+section/priority (kbar) → S1 · headless combobox+filter sözleşmesi (cmdk) → 10.2.

---

*§10 = **sentez değil, kaynaktan**: cmdk + kbar (kütüphane API/kod) + Stripe/Polaris/Linear/Raycast (resmi UX dokümanı), 2026-06-17 araştırması. Yetenek açığı `admin-capabilities.md §4.5`; uygulama brief'i `docs/plans/admin-shell-e1-command-palette-brief.md` bu cetvele uyar.*


---
# FILE: docs\standards\analytics-standard.md

# Analytics & Ölçüm Standardı — "Ne Ölçülür" Kontratı

> **Bu dosya nedir?** Ölçüm **motoru** zaten kurulu (`src/utils/analytics.ts::trackEvent` → GA4/GTM).
> Bu dosya motoru değil, **kontratı** tanımlar: hangi olaylar, hangi huni, nasıl isimlendirilir, nasıl
> raporlanır. `admin-standard.md` gibi sürekli uyulan bir **cetvel** → `docs/standards/`. Otorite: bu dosya.
> İlgili: [seo-transition-blueprint](../plans/seo-transition-blueprint.md) (Search Console ortak) · `legal/` (KVKK/çerez).

## Mevcut zemin (motor hazır, operasyonel değil)
- `src/utils/analytics.ts::trackEvent(name, params)` → `window.gtag` (GA4) veya `window.dataLayer`
  (GTM)'e olay iletir; servis yoksa **sessizce** geçer, dev'de `console`'a loglar.
- **Eksik:** (1) gerçek GA4/GTM **ID** (env), (2) hangi olay/huni ölçülecek **planı** (bu dosya),
  (3) **Search Console** bağlantısı, (4) **KVKK/çerez onayı** entegrasyonu.

## Karar: araç seti
- **GA4 + Google Tag Manager** — birincil (motor zaten `gtag`/`dataLayer`'a yazıyor; en az sürtünme).
- **Google Search Console** — **zorunlu** (SEO geçişinin #1 ölçüm aracı; bkz. seo-transition-blueprint).
- **Vercel Web Analytics / Speed Insights** — Core Web Vitals için düşük-efor tamamlayıcı (opsiyonel).
- Gizlilik-dostu alternatif (Plausible/Umami) gerekirse değerlendirilir; varsayılan GA4+GTM.

## Olay taksonomisi (e-ticaret hunisi — `snake_case`, sabit param şeması)
| Aşama | Olay | Zorunlu param |
|---|---|---|
| Görüntüleme | `view_item` | item_id, item_name, category, price |
| Liste | `view_item_list` | item_list_id, items[] |
| Sepet | `add_to_cart` / `remove_from_cart` | item_id, quantity, price |
| Checkout | `begin_checkout` | value, currency, items[] |
| **Dönüşüm** | `purchase` | transaction_id, value, currency, items[] |
| Arama | `search` | search_term |
| Mühendislik | `calculator_used` | calculator (jetfan/duct/hrv/aircurtain), inputs_summary |
| Lead | `lead_submit` / `whatsapp_click` | source, context |
| Gezinme | `nav_click` | target, mode |
| İçerik | `case_study_click` | title |

> **Kural:** olay adı boş string olamaz (`analytics.ts` Aksiyom 3 — anlamsız veri birikir). Param
> şeması sabit; yeni olay → bu tabloya eklenir (SSOT).

> **Bu tablo artık bir bekçiye bağlı: `INV-ANALYTICS-1`**
> (`src/__tests__/conformance/analytics-event-taxonomy.test.ts`). Kodda `trackEvent()` ile
> ateşlenen her olay adı bu tabloda **yazılı olmak zorundadır**; tabloda olmayan bir ad eklenirse
> kapı kırmızıya döner. Son iki satır (`nav_click`, `case_study_click`) tam olarak bu yüzden
> eklendi: kodda **zaten** ateşleniyorlardı ve tabloda yoktular — yani tablo, yazıldığı günden
> beri kodun gerisindeydi ve bunu kimse görmüyordu.

### Bugünkü kapsama (ölçüldü 2026-08-19, T021-VH)

Kodda `trackEvent()` çağrı yeri ölçüldüğünde **üçtü** ve tamamı gezinme/içerik olayıydı:
`StickyHeader.tsx` (2) · `CaseStudySection.tsx` (1). Yukarıdaki **ticaret hunisinin on olayının
hiçbiri bağlı değildi** — `purchase` ve `lead_submit` dâhil.

**Güncelleme (aynı gün):** `calculator_used` bağlandı — dört hesaplayıcı sayfası
(`views/calculators/`), paylaşılan `useCalculatorUsage` hook'u üzerinden. Geri sayım
**10 → 9**. Ölçümün doğru olması için önemli bir ayrıntı: hesaplayıcıların girdileri
**varsayılan değerle** doluyor ve sonuç sayfa açılır açılmaz hesaplanıyor; "ilk geçerli
sonuçta ateşle" deseydik olay sayacı **sayfa görüntülemesini** sayardı ve GA4'te "hesaplayıcı
kullanımı" diye okunurdu. Bu yüzden taban çizgisi mount anıdır ve olay, kullanıcı bir girdiyi
gerçekten değiştirip değişim durulunca, mount başına en fazla bir kez gider. Bu davranış
statik kapıyla görülemez, `src/hooks/__tests__/useCalculatorUsage.test.ts` ile ölçülür.

Bunun pratik sonucu GA4 kimliği env'e konulduğu gün ortaya çıkar: ölçüm "açılmış" olur ama GA4'e
yalnızca menü tıklamaları akar, dönüşüm hunisi **boş** görünür. Boş huni "satış yok"tan ayırt
edilemez — ölçüm kurulmuş gibi dururken hiçbir ticari soruya cevap vermez.

Bu yüzden huninin bağlanması, kimliğin girilmesiyle **aynı işin parçasıdır** ve INV-ANALYTICS-1
içindeki `HENUZ_BAGLI_DEGIL` listesi bir geri sayımdır: bir olay koda bağlandığında listeden
düşürülmek **zorundadır**, yoksa kapı kırmızıya döner. Liste kısalır, uzamaz.

> **Şerit sınırı:** huni olaylarının çağrı yerleri sepet/ödeme/ürün yüzeyleridir ve o dosyalar
> başka şeritlerin sahasındadır. Bağlama işi tek bir şeridin kendi başına alacağı iş değildir;
> iş dağılımı OPS-AUDIT'e bırakıldı → `docs/audits/t021-analytics-coverage-2026-08-19.md`.

## Dönüşümler (GA4'te "conversion" işaretlenecek)
- Birincil: `purchase`, `lead_submit` (teklif/iletişim).
- İkincil: `add_to_cart`, `calculator_used` (niyet sinyali), `whatsapp_click`.

## Yapılandırma
- GA4/GTM ID → env (`NEXT_PUBLIC_GA_ID` / GTM container). Hard-code yasak.
- **Consent:** KVKK + çerez onayı **şart** — `CookieConsent` onayı verilmeden analytics olayları
  **ateşlenmez** (consent-mode). Çerez politikası sayfasıyla tutarlı.

### ✅ ÖN KOŞUL KAPANDI — `T020-VH` bitti (PR #524, 2026-08-15)

> Aşağıdaki bölüm **açığın tarihçesidir**, güncel durum değil. Silinmedi çünkü GA açan kişinin
> *neden* bir rıza kapısı olduğunu bilmesi gerekiyor. **Bugünkü durum:** `trackEvent()` gönderim
> öncesi `hasConsent('analytics')` soruyor; GA/GTM script'i yalnız `ConsentGatedAnalytics` içinden
> ve yalnız rıza varsa yükleniyor; rıza kategori bazlı, versiyonlu, geri alınabilir.
> Kalıcı bekçi: `src/__tests__/conformance/legal-consent-analytics.test.ts` (INV-LEGAL-2) —
> kapı sökülürse test kırmızıya döner.

<details>
<summary>Açığın kaydı (2026-08-15 öncesi durum) — tıkla</summary>

Yukarıdaki consent şartının **kodda karşılığı YOKTU**. Ölçüldü (2026-08-15, LAUNCH denetimi):

- `vh_cookie_consent` bayrağını **yalnız bandın kendisi** okuyor (`CookieConsent.tsx:17`), kendini
  gösterip göstermeyeceğine karar vermek için. **Başka hiçbir yer okumuyor** → "Reddet" hiçbir şeyi kapatmıyor.
- `trackEvent()` uygulamada **zaten 3 yerden çağrılıyor**: `StickyHeader.tsx:150`, `StickyHeader.tsx:275`,
  `CaseStudySection.tsx:56`.

Yani sistemin bugün sessiz olmasının tek sebebi **GA ID'nin yokluğu** — güvenlik değil tesadüf.
ID env'e konulduğu **an**, "Reddet" demiş kullanıcı dâhil herkesten olay akmaya başlar; bu hem KVKK
ihlali hem de **bu cetvelin kendi ihlali** olur.

**Bu yüzden GA4 kurulumu (`avensair-teslim-yol-haritasi` madde G) `T020-VH` bitmeden BAŞLAMAZ.**
`T020-VH` kapsamı: kategori bazlı rıza (zorunlu/işlevsel/analitik/pazarlama — bugünkü ikili
kabul-ret yetersiz) · rızayı okuyan tek merkezî gate · reddedilen kategorinin script'inin **hiç
yüklenmemesi** (olay bastırmak yetmez) · rızanın geri alınabilmesi · rıza kaydı (tarih/versiyon, ispat yükü).

İlgili: `docs/audits/canliya-alma-hazirlik-2026-08-15.md` §S6 · PR #512 (Çerez Politikası bugünün
gerçeğini yazıyor: *"Site hâlihazırda analitik/pazarlama çerezi kullanmamaktadır"* — bu cümle
GA açıldığı an YALAN olur, metin de güncellenmeli).

</details>

## Raporlama
- Mevcut sağlayıcının aylık raporunun **eşdeğeri/fazlası**: organik trafik (Search Console), dönüşüm
  hunisi (GA4), en çok gezilen/çıkılan sayfalar, kaynak/medya, cihaz.
- Sıklık: aylık özet + geçiş döneminde (cutover ilk 4-8 hafta) haftalık sıra-takibi.

## DoD (ne zaman "kurulu" sayılır)
- [x] **`T020-VH` rıza kapısı bitti** (ön koşul — bkz. §Yapılandırma). Kanıt: "Reddet" seçili
      tarayıcıda GA/GTM script'i **hiç yüklenmiyor** ve tek bir olay gitmiyor. *(PR #524)*
- [x] **CSP `script-src`'a GA alan adları eklendi** — `www.googletagmanager.com` `script-src`'e,
      `https://*.google-analytics.com` (olay ucu) `connect-src`'e girdi. *(2026-08-17)*
      **Bu madde artık bir bekçiye devredildi:** `INV-CSP-1`
      (`src/__tests__/conformance/csp-origin-coverage.test.ts`), cetvel `docs/standards/csp-standard.md`.
      Sebep: buradaki teşhis doğruydu ("kodu yazan ile CSP'yi enforce'a alan farklı zamanlarda
      çalışır, bağlantı kurulamaz") ama bir **kontrol listesi maddesi** tam olarak o zaman farkına
      dayanamaz — bekçi dayanır. Nitekim bekçinin ilk koşusunda GA dışında **dört origin daha**
      eksik çıktı (`api.pwnedpasswords.com`, `www.youtube.com`, `*.cloudflarestream.com`,
      `fonts.googleapis.com`); hiçbiri bu listede yazmıyordu. CSP'yi **enforce**'a alma kararı
      ayrıdır ve Recep kapısıdır → `csp-standard.md §5`.
- [ ] **Çerez Politikası metni güncellendi** — bugün *"Site hâlihazırda analitik/pazarlama çerezi
      kullanmamaktadır"* diyor (PR #512, o gün doğruydu). GA açıldığı an bu cümle yanlış beyan olur;
      çerez tablosuna `_ga`/`_ga_*` satırları + saklama süreleri girilmeli. Dosyalar:
      `src/views/legal/components/{tr,en}/CookiePolicyContent.tsx`.
- [ ] GA4 + GTM canlı, ID env'de, consent-mode bağlı.
- [ ] Huni olayları (en az view_item → add_to_cart → begin_checkout → purchase) akıyor.
      **Bu madde de bir bekçiye devredildi:** `INV-ANALYTICS-1` içindeki `HENUZ_BAGLI_DEGIL`
      listesi bugün on olayı sayıyor; liste boşaldığında bu kutu işaretlenebilir. Kutuyu listeden
      önce işaretlemek mümkün değil — kapı, listedeki bir olay koda bağlandığı anda düşürülmesini
      **zorunlu** kılar (bkz. §Bugünkü kapsama).
- [ ] Search Console bağlı + sitemap gönderildi.
- [ ] İlk aylık rapor üretilebiliyor.

> **Durum:** İskelet (v1). Motor (`analytics.ts`) hazır; bu kontrat doldukça olaylar koda bağlanır.


---
# FILE: docs\standards\auth-account-standard.md

# Auth & Hesap Standardı (cetvel) — v0.1

> **Kapsam:** Şifre sıfırlama zinciri, auth callback yönlendirmesi, login dönüş-yolu ve
> hata gösterimi, hesap-enumerasyon hijyeni.
> **Bekçi:** `src/__tests__/conformance/auth-reset-chain.test.ts` (INV-AUTH-1).
> **Doğuş sebebi:** T056 (2026-08-16) — reset-password rotası repoda hiç yoktu; şifresini
> unutan kullanıcı linke tıklayıp giriş yapıyor ama şifresini ASLA değiştiremiyordu
> (kalıcı hesap kilidi). Hiçbir kapı görmedi çünkü bu cetvel yazılmamıştı.

## A1 — resetPasswordForEmail daima redirectTo ile

`supabase.auth.resetPasswordForEmail` çağrısı **her zaman** `redirectTo` içerir ve hedef
locale'siz `/auth/callback?next=reset-password`'dur. `redirectTo`'suz çağrı Supabase'in
Site URL'ine düşer; kullanıcı giriş yapmış olur ama yeni-şifre ekranına varamaz.

## A2 — Locale'siz /auth/callback giriş noktası kalıcıdır

Dış dünyadan dönen auth trafiği (Google OAuth, e-posta linkleri) locale'siz
`/auth/callback`'e iner. İki parça birlikte yaşar, **ikisi de tek başına yeterli değildir**:

- `middleware.ts` → `isAuthApi` muafiyeti: bu yol locale enjeksiyonundan muaf tutulur
  (307 locale redirect'i `?code=` PKCE değişimini bozabilir; ayrıca hash tabanlı akışta
  fragment sunucuya hiç ulaşmaz).
- `src/app/auth/callback/route.ts` → query'yi AYNEN koruyarak `/{locale}/auth/callback`'e
  307 yönlendirir. Bu handler olmadan locale'siz yol **404**'tür (sayfa yalnız
  `/[lang]/auth/callback`'te yaşar). Hash fragment'ini tarayıcı yönlendirmede kendisi taşır.

Muafiyeti kaldırmak ya da handler'ı silmek zinciri sessizce koparır — INV-AUTH-1 R3 bloklar.

## A3 — Callback sayfası iki akışı ve hedef ayrımını işler

`AuthCallbackPage`:
- **PKCE** (`?code=`): `exchangeCodeForSession` ile oturuma çevirir (OAuth + redirectTo'lu
  e-posta linkleri buraya düşer; `@supabase/ssr` browser client'ın varsayılanı PKCE'dir).
- **Implicit** (hash token): client init'teki `detectSessionInUrl` işleyene dek kısa bekler.
- **Hedef ayrımı:** `?next=reset-password` veya hash'te `type=recovery` → yeni-şifre ekranı;
  aksi halde anasayfa. Yeni bir dönüş hedefi eklenecekse `next` sözleşmesine eklenir,
  yeni parametre icat edilmez.

## A4 — Kurtarma ekranı: mevcut şifre SORULMAZ, politika tam uygulanır

`/[lang]/auth/reset-password` (`ResetPasswordPage`):
- Kimlik kanıtı e-posta linkinin kurduğu **recovery oturumudur**; mevcut şifre sorulmaz
  (kullanıcı onu bilmiyor — T056'nın kök sebebi `AccountSecurityPage`'in bunu zorunlu tutmasıydı).
- Şifre politikası `RegisterPage` ile **birebir aynıdır**: 4 kural (uzunluk/büyük harf/
  rakam/özel karakter) + HIBP k-Anonymity sızıntı kontrolü.
- Yazma yolu `supabase.auth.updateUser({ password })`'dur.
- Oturum yoksa form değil, "bağlantı geçersiz + yeni bağlantı iste" durumu gösterilir.

## A5 — Login dönüş yolu ve hata gösterimi

- `?redirect=` (uygulama içi linkler) ve `?from=` (middleware guard'ı) **eşdeğer** dönüş
  yoludur; LoginPage ikisini de okur. Yönlendirme `localizedHref` ile yapılır (kural 7).
- `?error=` parametresi kullanıcıya **gösterilir** (inline alert, `role="alert"`);
  `?reason=expired` oturum-doldu mesajına çevrilir. Sessizce yutulan hata parametresi,
  kullanıcının aynı kırık akışı sonsuza dek yeniden denemesi demektir.

## A6 — Hesap enumerasyonu sızdırılmaz

Şifre-sıfırlama isteği sonucu, e-postanın kayıtlı olup olmadığını **ele vermez**:
sağlayıcı hatası ne olursa olsun kullanıcıya tek jenerik mesaj gösterilir
("Sıfırlama isteği gönderilemedi"). "User not found" benzeri dallar yasaktır.

## A7 — Oturum kapatma iki katmanlıdır (v0.3, T060)

`sb-claims-cache` çerezi **httpOnly**'dir — client JS onu silemez ve `resolveUserClaims`
geçerli çerezde Supabase'e hiç sormaz. Bu yüzden çıkış İKİ parçadan oluşur ve ikisi de
zorunludur (bekçi: INV-AUTH-3, `auth-session-security.test.ts`):

1. **Sunucu:** `POST /auth/signout` — oturumu sunucuda kapatır ve
   `clearClaimsCacheCookie` ile claims cache'i temizler.
2. **Client:** `supabase.auth.signOut()` — yerel oturum/state temizliği.

`AuthContext.signOut` sunucu ucunu ÇAĞIRMAK zorundadır; yalnız client signOut,
admin'i çıkıştan sonra cache TTL'i (≤900 sn) boyunca `/admin` kapısından geçirir
(T060'ın kök bulgusu: temizleyicinin tek çağıranı hiç kullanılmayan route'tu —
iki parça tek tek doğruydu, kopukluk aradaki teldeydi). Çerez httpOnly + TTL ≤ 900
kalır; httpOnly'yi gevşetmek çerezi XSS'e açar, TTL'i büyütmek çıkış penceresini büyütür.

## A8 — Rate limit politikası: GoTrue'ya emanet (ölçülmüş)

Login/signup/forgot istekleri `supabase.co`'daki GoTrue uçlarına DOĞRUDAN gider —
uygulama sunucumuzdan/middleware'den **geçmez**. Bu yüzden middleware'de auth
rate-limit katmanı kurulamaz (istekleri hiç görmeyiz); `_shared/rate_limit.ts`
deseni yalnız KENDİ edge fonksiyonlarımız içindir. Yürürlükteki koruma GoTrue'nun
kendi limitleridir (ölçüm 2026-08-16, supabase.com/docs/guides/auth/rate-limits):

- `/auth/v1/token` (login + refresh): IP başına 1800/saat, 30'luk burst — sabit.
- `/auth/v1/verify`: IP başına 360/saat, 30 burst — sabit.
- E-posta gönderen uçlar (`signup`/`recover`): kullanıcı başına 60 sn pencere +
  proje genel e-posta limiti (yerleşik SMTP'de saatlik düşük tavan; custom SMTP'de
  yükseltilebilir — canlıya çıkışta custom SMTP zaten gerekiyor).

Ayarlar Dashboard → Authentication → Rate Limits'te yaşar. **Emanet açık yazılsın:**
bu değerler repodan denetlenemez; değiştiren, bu bölümü günceller.

## A9 — CAPTCHA: v1'de YAPILMAYACAK (karar verildi, 2026-08-16)

Kayıt/giriş/şifre-sıfırlama uçlarında CAPTCHA **yok ve v1'de eklenmeyecek** —
Recep'in kararı. Bu bir "sonra bakarız" değil, **kapanmış karardır**: yeniden
gündeme getirmenin tek meşru tetikleyicisi **gözlenmiş istismardır** (bot kayıt
dalgası, credential-stuffing izi, GoTrue rate-limit'in 429 üretmeye başlaması).
Böyle bir gözlem OLMADAN bu maddeyi tekrar öneri olarak açma.

Gerekçe zinciri: A8'deki GoTrue limitleri yürürlükte (IP-bazlı token/verify
tavanları + e-posta uçlarında kullanıcı-başı pencere), lansman ölçeğinde trafik
düşük, ve CAPTCHA'nın bedeli sıfır değil — üçüncü taraf bağımlılığı, kayıt
hunisinde sürtünme, sağlayıcı anahtarı yönetimi.

**İstismar gözlenirse uygulama notu (o gün lazım olacak):** Supabase Auth'un
yerleşik attestation'ı iki sağlayıcıyı destekler — hCaptcha veya Cloudflare
Turnstile. Turnstile'ı varsayılan öneri olarak sunma: Cloudflare bu projede
kullanılmıyor, yani yeni bir hesap/bağımlılık demek; hCaptcha tek başına kurulabilir.
⚠️ **Sıralama kritik:** Supabase tarafındaki CAPTCHA zorunluluğu, client kodu
`captchaToken` göndermeye hazır OLMADAN açılırsa **tüm kayıt/giriş akışı anında
kilitlenir** — önce kod, sonra dashboard.

Not: HIBP kontrolü ağ hatasında bilerek fail-open'dır (kayıt akışını sızıntı
servisine bağımlı kılmamak için) — bu bilinçli tercih burada kayıt altındadır.

## A10 — tenant_id: user_metadata GÜVENİLMEZ, tasarım kararı

Bugün `signUp` tenant_id'yi `user_metadata`'ya yazar (client-kontrollü alan);
RLS ise `app_metadata` okur (kural 12) → signup'taki tenant seçimi yok sayılır.
Tek-tenant v1'de zararsız (varsayılan tenant), multi-tenant'ta sessiz karışma.
**Tasarım (devredilecek, uygulama bu cetvelin işi değil):** tenant ataması
client iddiasından DEĞİL, sunucunun kendi gözleminden türetilir — ilk oturumda
sunucu tarafı (route handler/edge fn) HOST'tan tenant'ı çözer ve service-role
`auth.admin.updateUserById(..., { app_metadata: { tenant_id } })` ile BİR KEZ
yazar; `user_metadata.tenant_id` yalnız görsel/istatistik amaçlıdır, hiçbir
yetki/RLS kararına girmez. Uygulama EDGE şeridine devredildi (T047/T048 ailesiyle
koordineli; `is_admin_user`'a dokunulmaz — ayrı iş emri).

---

## A11 — Rolün TEK otoritesi: `public.user_profiles.role` (T047, 2026-08-18)

**Değişmez:** bir kullanıcının rolü **yalnızca** `public.user_profiles.role`'dür.
Diğer her yüzey ondan **türer**; hiçbiri bağımsız bir yetki kaynağı değildir.

| Kaynak | Karar | Niçin |
|---|---|---|
| `public.user_profiles.role` | ✅ **TEK OTORİTE** | `trg_enforce_role_change` korur — **INSERT ve UPDATE'te** (v2, 2026-08-26): rol whitelist'i · kendi rolünü değiştirme kilidi · **`super_admin` vermeyi yalnız `super_admin` yapar** · oturumsuz bağlamda ayrıcalıklı rol yalnız `service_role` ile ve **`admin_audit_log`'a iz bırakarak** |
| `claims.user_role` / `claims.app_metadata.user_role` | ✅ **türev** | `custom_access_token_hook` her oturum açmada profilden yazar; kural 12'nin istediği yer |
| Kullanıcı meta rolü (`user_metadata.role`) | ⛔ **YASAK** | Kullanıcı `auth.updateUser({ data })` ile kendisi yazabilir → kendi rolünü yükseltir |
| Kodda sabit e-posta listesi | ⛔ **YASAK** | Depo PUBLIC; rol değişimi deploy gerektirir; liste **kayıtsız** adreslere önceden yetki verir |

**Kapının KAPSAMADIĞI (v2, adıyla — "kapattık" demiyoruz).** `trg_enforce_role_change`
yalnız `super_admin` **vermeyi** kısıtlar: bir `admin`, başkasını **`admin`** yapabilir.
`rbac.ts` `/admin/users` yüzeyini `super_admin`'e kapattığı için ürün kuralı "admin, admin
üretemez" der — **DB hâlâ izin verir.** Ayrıca yetki **düşürme** anında etkili değildir:
`is_admin_user()` önce JWT claim'ini okur, jeton hâlâ `admin` iddia ettiği sürece `true`
döner (çözüm bu tetikte değil, jeton ömrü / oturum sonlandırma kararında).

**Ölçülmüş kusur (bu maddenin doğuş sebebi).** 2026-08-18'de dört kaynak canlı
olarak çelişiyordu: allowlist `super_admin`, profil `admin`, kullanıcı-meta
`super_admin`, hook `admin`. İki somut açık vardı:

1. `is_admin_user()` COALESCE'unun 3. dalı kullanıcı-yazabilir meta alanını
   okuyordu. Sömürülmüyordu çünkü hook `claims.user_role`'ü hep dolduruyor ve
   zincir 1. dalda kısa devre yapıyordu — yani açık **latent**ti.
   **Latent açık, kapalı açık değildir:** hook devre dışı kalırsa dal aynı anda
   canlanır ve hiçbir kapı bunu görmez. `20260818081500_role_source_single_authority.sql`
   dalı kaldırdı.
2. `src/config/admin.ts`'teki liste beş adres taşıyordu; üçünün prod'da **hiç
   hesabı yoktu**. Yani liste mevcut kullanıcılara yetki vermiyor, **henüz kayıt
   olmamış** adreslere önceden yetki veriyordu. Ayrıca `AdminLayout` onu
   `rbac.ts` sayfa matrisini **baypas** etmek için kullanıyordu.

**Sıra kuralı (ihlal edilirse yönetici kilitlenir):** rol kaynağı daraltılırken
**önce VERİ, sonra KOD**. Profil rolü hedeflenen değere yükseltilmeden allowlist
kaldırılırsa, ayrıcalığını o listeden alan yönetici panelinden düşer. Bu sıra
`INV-AUTH-ROLE` R5 tarafından migration metninde zorlanır.

**Bekçi:** `src/__tests__/conformance/auth-role-source.test.ts` — R1 (fonksiyon
gövdesi kullanıcı-meta okumaz) · R2 (kaynak kodda yetki için kullanıcı-meta rolü
okunmaz) · R3 (`admin.ts`'te sabit e-posta yok) · R4 (hook her iki anahtarı da
yazar — R1'in dayanağı) · R5 (migration'da veri adımı fonksiyondan önce).

### AÇIK KARAR — `is_admin_user()` fallback semantiği (E2)

Fonksiyon `SECURITY INVOKER` (varsayılan). JWT'siz bağlamlarda (tetik/betik) son
dal `public.user_profiles` okur; çağıranın o satırı okuma hakkı yoksa **sessizce
`false`** döner. Bugün zararsız görünüyor, ama bir yetki fonksiyonunda sessiz-false
kabul edilemez bir belirsizliktir. **T047 paketine BİLEREK dahil edilmedi:** aynı
PR'da hem bir dalı kaldırıp hem fonksiyonun güven duruşunu (`DEFINER`) değiştirmek,
bir şey bozulduğunda hangisinin sebep olduğunu ölçülemez hale getirir.
Karar açık; ya `SECURITY DEFINER` yapılır ya da "fallback yalnız JWT'siz bağlamda
çalışır" burada bir değişmez olarak sabitlenir.

---

# Bölüm B — Hesap Yüzeyi (taşındı)

v0.2'de burada duran hesap-yüzeyi kuralları (B1–B6) kendi cetveline taşındı:
**`customer-account-standard.md`** (kardeş cetvel; bekçisi INV-AUTH-2). Bu dosya
yalnız AUTH ZİNCİRİNİ (giriş/şifre/callback/oturum, A1–A10) yönetir.

## Kapsam dışı (bilerek)

- `/account/*` middleware guard'ı — ortak mülk, ayrı iş (T056 kapsam dışı bırakıldı).
- CAPTCHA — A9'da v1 için KAPANMIŞ karar (yapılmayacak); yeniden açılışı yalnız
  gözlenmiş istismar tetikler.
- tenant_id app_metadata yazımının uygulaması — A10'da tasarım hazır, EDGE'e devredildi.
- Google OAuth canlı e2e provası — Recep'in canlı ortam provası gerektirir
  (Supabase Dashboard'daki Redirect URL allowlist'i repodan denetlenemez; canlıda
  `https://<domain>/auth/callback` kayıtlı olmalıdır; 2026-08-16'da Recep kaydın
  var olduğunu doğruladı).

## Muafiyetler

Yok. Muafiyet gerekirse buraya **adla** yazılır ve INV-AUTH-1/INV-AUTH-3'te aynı adla sabitlenir.


---
# FILE: docs\standards\canonical-url-standard.md

# Kanonik Adres Standardı (canonical / hreflang / sitemap)

> **Durum:** v1.0 · 2026-08-17 · Şerit: LEGAL-SEO
> **Bekçi:** `INV-CANONICAL-1` → `src/__tests__/conformance/canonical-url-ssot.test.ts`
> **SSOT:** `src/config/siteUrl.ts` → `SITE_URL`
> **İlgili:** `docs/standards/rendering-cache-standard.md` · CLAUDE.md #7 (i18n/URL)

## 0. Bu cetvel niçin var (ve niçin geç yazıldı)

PR #620 canlı bir kusuru kapattı: ürün sayfası kanonik adresi `window.location.origin`'den
türetiyordu — yani **kanonik adres ziyaretçinin tarayıcısına göre değişiyordu**. Düzeltme ve
`INV-CANONICAL-1` bekçisi indi, **ama cetvel yazılmadı**. CLAUDE.md 1. kural bunu açıkça
yasaklar: *"'cetvel yok' geçerli bir cevap ama bedava değil — o zaman iş, cetveli yazmayı da
kapsar."* Bu dosya o borcu kapatır.

Borç kapatılırken yapılan ölçüm, aynı aileden **ikinci ve daha büyük** bir kusuru ortaya
çıkardı (§4). Cetvelin geç yazılmasının bedeli tam olarak budur: kural yazılmayınca ihlal
görünmez.

## 1. Tek kural

> **Kanonik adres, o sayfanın gerçekten yayınlandığı ve yönlendirmesiz açıldığı tek adrestir;
> `SITE_URL` SSOT'undan üretilir ve sitemap'in o sayfa için bildirdiği adresle BİREBİR aynıdır.**

Üç parçası da denetlenir:
1. **Kaynak:** `SITE_URL` (`src/config/siteUrl.ts`). Tarayıcı host'u (`window.location.*`),
   `VERCEL_URL` veya elle yazılmış sabit **yasak**.
2. **Yönlendirmesiz:** kanonik adres 3xx dönen bir adres olamaz.
3. **Sitemap ile tutarlı:** sitemap'te bildirilen URL ile sayfanın kanoniği çelişemez.

## 2. `SITE_URL` niçin SSOT

`siteUrl.ts` bir merdivendir: `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` →
`VERCEL_URL`. Sıra kasıtlıdır — `VERCEL_URL` **deploy'a özeldir** ve her deploy'da değişir.
2026-08-15 denetiminde bunun canlı bedeli ölçüldü: `robots.txt` her deploy'da başka bir
`Sitemap:` adresi gösteriyordu, hreflang alternatifleri geçici URL üretiyordu ve Mesafeli
Satış Sözleşmesi satıcının sitesi olarak rastgele bir deploy adresi yazıyordu.

Doğrusu `NEXT_PUBLIC_SITE_URL`'i açıkça set etmektir; merdiven yalnız sessiz bozulmayı önleyen
emniyet ağıdır. **Prod'da bu değişkeni set etmek Recep tarafındaki açık kalemdir.**

## 3. Tarayıcı host'u niçin yasak (#620'nin dersi)

`window.location.origin`'den kanonik üretmek üç şeyi aynı anda bozar:
- **SSR'da boş.** İlk render'da host yoktur → kanonik `/products/slug` gibi **host'suz** çıkar.
- **Ziyaretçiye bağlı.** Önizleme adresi, özel alan adı, `www` varyantı — hepsi farklı kanonik.
- **Tarayıcıya özel adres asıl adresi gölgeler.** Arama motoru gördüğü ilk `<link rel=canonical>`
  ile RSC metadata'sının ürettiğini çelişkili bulur.

**Bir sayfada kanonik adres TEK yerden çıkar: RSC `generateMetadata` → `alternates.canonical`.**
İstemci bileşeni (`Seo.tsx`) bir kanonik daha basıyorsa değeri RSC'ninkiyle **birebir** olmak
zorundadır — bugün ürün sayfasında böyledir (ikisi de `SITE_URL`'den, aynı yardımcıyla).

## 4. ✅ KAPANDI — kanonik, sitemap ile çelişiyordu (ölçüm 2026-08-17, düzeltme 2026-08-18)

**T083-VH.** Aşağıdaki kusur bu cetvelin yazılması sırasında ölçüldü ve tek PR'da kapatıldı:
ürün + marka sayfası kanonikleri dil öneki aldı, `alternates.languages` (tr/en/x-default)
eklendi, `ProductDetailPageView` istemci kanoniği `localizedHref` ile hizalandı ve
`INV-CANONICAL-2` bekçisi aynı PR'da indi (sabotaj 5/5 + istemci yüzeyi 3/3).

Kayıt olarak bırakılıyor — kusurun **niçin görünmez** olduğu, tekrar etmemesi için değerlidir:

`src/middleware.ts:86-87`: dil öneki taşımayan her kullanıcı rotası **307 ile**
`/${detectedLocale}${pathname}` adresine yönlendirilir ve hedef dil **`Accept-Language`
başlığına göre** seçilir.

Buna rağmen iki yüzey kanonik adresi **dil öneksiz** üretiyor:

| Yüzey | Kanonik (kusurluyken) | Sitemap'in bildirdiği | hreflang | Bugün |
|---|---|---|---|---|
| Ana sayfa | `/tr`, `/en` | `/tr`, `/en` | vardı ✔ | ✔ |
| Kategori | `/tr/category/…` | `/tr/category/…` | vardı ✔ | ✔ |
| **Ürün** | `/products/<slug>` ✗ | `/tr/products/…` + `/en/products/…` | **yoktu** ✗ | ✅ düzeltildi |
| **Marka** | `/brands/<slug>` ✗ | `/tr/brands/…` + `/en/brands/…` | **yoktu** ✗ | ✅ düzeltildi |

Üç ayrı sonuç doğurur:

1. **Kanonik bir yönlendirmeyi gösteriyor.** `/products/x` 307 ile `/tr/products/x`'e gider.
   Yönlendirme gösteren kanonik zayıf sinyaldir; arama motoru onu yok sayıp hedefe konsolide eder.
2. **Kanonik ziyaretçiye göre değişiyor** — #620'nin kusurunun sunucu tarafındaki hâli.
   Aynı `/products/x` adresi bir ziyaretçide `/tr/…`, diğerinde `/en/…` açar.
3. **En pahalısı: iki dil aynı kanoniği bildiriyor.** `/tr/products/x` ve `/en/products/x`
   sayfalarının ikisi de kanonik olarak `/products/x` diyor → arama motoru bunları **kopya**
   sayar ve bir dili indeksten düşürebilir. hreflang de yok, yani ayırt edecek ikinci sinyal
   de yok. Sitemap doğru olanı bildiriyor, sayfa onu **çürütüyor**.

**Uygulanan çözüm** (kategori sayfasında zaten var olan desen kopyalandı): kanonik
`${SITE_URL}/tr|en${Routes.x(...)}` biçiminde kuruluyor **ve** `alternates.languages`
(tr/en/x-default) veriliyor. `Routes.x` kullanımı kasıtlı: `sitemap.ts` de birebir aynı
ifadeyi kullanır, böylece iki yüzey aynı kaynaktan üretilir ve sessizce ayrışamaz.

**İki süreç dersi bu işten çıktı:**

1. **Bekçi düzeltmeden ÖNCE inmedi.** Kusurun sahibi olan dosya başka bir şeritteyken bekçiyi
   master'a göndermek, kimsenin düzeltemeyeceği bir kırmızı yaratırdı — ve o kırmızı,
   düzeltmek yerine *"testi gevşetelim"* baskısı üretirdi. Bekçi ve düzeltme aynı PR'da indi.
2. **Şerit kapısı Bash ile aşılmadı.** Ürün sayfası I18N-SWEEP'teyken `lane-guard` yazmayı
   blokladı; devir beklendi. Bu arada dokunulabilen parçalar (marka, istemci yüzeyi, bekçi)
   hazırlandı, PR açılmadı. Devir gelince kalan tek dosya bir turda kapandı.

## 5. Bekçinin kapsamı — ölçmediği sınıflar ADIYLA

`INV-CANONICAL-1` altı kural işletir; özü: kanonik üreten her yüzey `SITE_URL` SSOT'unu
**import ederek** kullanmalı ve tarayıcı host'una dokunmamalı.

**Bilinen atlatma yolu ve neden böyle yazıldı:** kural önce `/siteUrl|SITE_URL/` arıyordu.
Sabotajda import silinip yerine `const SITE_URL = 'https://sabit.example'` konunca kapı
**yeşil kaldı** — çünkü isim hâlâ dosyadaydı. Yani kapı, tam olarak yasaklamak istediği
davranışı ödüllendiriyordu. Kural **bağı** arayacak şekilde daraltıldı:
`/from\s+['"][^'"]*config\/siteUrl['"]/`. **Bir ismin dosyada geçmesi hiçbir şey kanıtlamaz.**

**Kapsamaz:** `?sku=` gibi sorgu parametrelerinin kanonikten dışlanması (bugün elle sağlanıyor —
`page.tsx` ve `ProductDetailPageView.tsx` yorumlarında yazılı), çalışma anında kurulan adresler.

**Artık KAPSIYOR — `INV-CANONICAL-2` (dil öneki + hreflang + sitemap paritesi):**
kanonik ↔ sitemap tutarlılığı, hreflang varlığı, ve **istemci kanonik yüzeyi**.

> **İstemci yüzeyi neden ayrı kural (2026-08-18 ölçümü):** `alternates` taraması `<Seo>` ile
> basılan kanoniği **göremez**. Ölçüldü: sekiz dosya `<Seo>` kullanıyor ama yalnız biri açık
> `canonical` geçiyor; kalan **yedisi** (Hakkımızda, İletişim, Markalar, Bilgi Merkezi hub ve
> topic, hesaplayıcılar, marka detayı) `Seo.tsx`'in **varsayılanına** güveniyor. Varsayılan
> bugün doğru — `usePathname()` dil segmentini taşır — ama **korumasızdı**: biri varsayılanı
> dilsiz bir kaynağa çevirseydi yedi yüzey birden sessizce bozulur ve hiçbir test görmezdi.
> Yani burası "temiz" değil **ölçülmemiş**ti; artık ölçülüyor (sabotaj 3/3).

## 6. Kim neye dokunur

| Dosya | Şerit |
|---|---|
| `src/config/siteUrl.ts`, `canonical-*` testleri, bu cetvel, `ProductDetailPageView.tsx` | LEGAL-SEO |
| `src/app/[lang]/products/[slug]/page.tsx` | LEGAL-SEO *(I18N-SWEEP'ten devralındı, T083)* |
| `src/app/[lang]/brands/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/middleware.ts` | LEGAL-SEO |
| `src/components/Seo.tsx` | sahipsiz — istemci kanonik yüzeyi, `INV-CANONICAL-2` koruyor |

Kanonik ile sitemap **tek PR'da** değişir: yarım düzeltilirse çelişki sürer, sadece yeri değişir.

## 7. Değişmez kurallar

- Varyant URL'i kanonik olamaz; `?sku=` kanonike **girmez**, aile slug'ı tek kanonik adrestir.
- Kategori adresinde kanonik = EN slug'ı değil, **görünen dilin** slug'ı
  (`getLocalizedCategorySlug`) — CLAUDE.md #7.
- `robots.txt` ve `sitemap.xml` de `SITE_URL`'den üretilir; elle host yazılmaz.


---
# FILE: docs\standards\catalog-depth-standard.md

# Katalog Derinliği Cetveli — sayfa ne zaman açılır

> **Sürüm:** 1.0 · **Tarih:** 2026-08-23 · **Şerit:** URUN · **Görev:** T160-VH
> **Kapsam:** Vitrinde kaç kademe sayfa olur, bir ürün grubu ne zaman ikiye bölünür,
> anlatı hangi kademede elle yazılır. Veri taşıma / aile birleştirme bu cetvelin konusu
> DEĞİLDİR (Recep kapısı); burada yalnız kural ve ölçülmüş durum yazılır.
> **Karar sahibi:** Recep (2026-08-23 onayı). Ölçüm ve yazım: URUN. §2 I18N ile ortak.

## 0. Niçin var — aynı katalog, aynı hafta, iki farklı cevap

Bu cetvel bir tasarım tercihinden değil, **bir çelişkinin ölçülmesinden** doğdu.

**Hava perdeleri** (`air-curtains`): 8 ürün **tek ailede**. Kategori sayfasından dışarı çıkan
ürün bağlantısı **1**; o aile sayfasında 8 varyantın **hepsi** duruyor ve oradan dışarı çıkan
ürün bağlantısı **0**. Müşteri anlatıdan sepete **iki sayfada** varıyor.

**Kanal içi hayalet fanlar** (`inline-duct-fans`): aynı büyüklükteki 12 ürün **altı aileye
bölünmüş**, üstlerinde de doğrudan ürünü olmayan bir şemsiye aile var. **Üç kademe.**
Şemsiye sayfası canlıda HTTP 200 dönüyor, sitemap'te TR+EN duruyor, ama vitrinde hiçbir
yerden bağlantısı yok — kimsenin uğramadığı, arama motorunun gördüğü boş bir sayfa.

İkisi de aynı katalogda. İkisi de aynı hafta kuruldu (2026-08-11 ve 2026-08-21).
**Aynı soruya iki farklı cevap verilmiş olması, kuralın hiç yazılmamış olduğunun kanıtıdır.**

Kusur ne bölmenin kendisinde ne şemsiyenin varlığında: kusur, **kararın ölçütsüz alınmasında**.

## 1. K1 — Derinlik İKİ kademedir

```
Kategori sayfası          → anlatı + seçim (kartlar, karşılaştırma, sihirbaz)
  └─ Aile sayfası         → o serinin TÜM varyantları, tek sayfada
       └─ (ürün adresi)   → satın alma ucu; gezinme hedefi DEĞİL
```

**Üçüncü bir gezinme kademesi açılmaz.** Ürünün kendi adresi vardır ve olmalıdır — arama
motoru ürünleri ancak kendi adresleriyle listeler, müşteri paylaşırken o adrese ihtiyaç duyar.
Ama **vitrinde gezen kimse oraya düşmez**: aile sayfası varyantı yerinde seçtirir.

**Aile sayfası dışarı ürün bağlantısı vermez.** Bu ölçülebilir bir sözleşmedir ve bugün hava
perdesi ailesinde **zaten sağlanmaktadır** (dışarı çıkan ürün bağlantısı: 0). Yani K1 yeni bir
tasarım değil, katalogun **ölçülmüş çoğunluk davranışını** kurala çevirmektir: 38 ailenin
**37'si tek katmanlıdır**; iki katmanlı olan **tek** aile istisnadır.

### K1'in sayısal karşılığı — `VARIANT_PILL_MAX`

"Varyantı yerinde seçtirir" cümlesinin koddaki karşılığı **tek bir sabittir**:
`src/components/products/VariantSelector.tsx` → `VARIANT_PILL_MAX`.

Sabitin **altında** seçici ürünün yanında durur. **Üstünde** seçici gövdeden çıkar,
"N model" düğmesine ve sayfanın altındaki Modeller bölümüne dönüşür — sayfa değişmez
(K1 ihlali değildir) ama varyant artık *yerinde* seçilmez.

**Değer: 12** (Recep kararı, 2026-08-23; öncesi 8). Eski 8, hava perdesi ailesini
(tam 8 varyant) **tesadüfen** kapsıyordu ve o sayfa referans kabul edilmişti; 12'ye
çıkarmak tesadüfü kurala çevirir. Üst sınır serbest değildir: 20+ varyantta hap listesi
okunmaz hâle gelir ve `VARIANT_MATRIX_MIN` matris görünümünü devreye sokar.

Bekçi: `src/__tests__/conformance/variant-selector-threshold.test.ts` (INV-VARIANT-PILL-1)
— sınırın 12'nin altına düşürülmesini ve PDP'nin sabiti atlayıp kendi sayısını yazmasını
engeller. Sabotaj iki yönde kırmızı verir.

### Recep'in netleştirmesi

> **Yeni sayfa yalnız gerçek bir karar noktasında açılır, keyfi olarak değil.**

Müşteri bir yerde "hangisi?" diye duruyorsa orası bir sayfadır. Durmuyorsa — sadece bir sayı
değişiyorsa — orası sayfa değil, **aynı sayfadaki seçicidir**. Dağınıklık bu tek cümleyle
engellenir.

## 2. K2 — Aile ne zaman bölünür: YAZILABİLİRLİK TESTİ

> **Bu bölüm I18N ile ortaktır** (bölme kararı doğrudan çeviri yüküne dönüşür).
> Aşağıdaki ölçüt URUN tarafından yazıldı; I18N'in eksen katkısı §2.3'e eklenecektir.

### 2.1 Ölçüt

Bir alt grup **ayrı aile olur** ancak ve ancak:

> O gruba **iki dilde de** kendine özgü, spec tablosunu tekrarlamayan **bir paragraf**
> yazılabiliyorsa.

Yazılabiliyorsa gerçek bir karar noktasıdır → **ayrı aile**.
Yazılamıyorsa — ya da yazılan paragraf spec'in cümleye dökülmüş hâliyse → **ayrı aile değil**,
aynı sayfada seçici.

### 2.2 Niçin bu ölçüt

Çünkü **paragraf yazılamayan yerde karar da yoktur.** "Lineo 150, Lineo 125'ten daha büyük
çaplıdır" bir paragraf değil, spec satırının cümlesidir; müşteriye hiçbir şey öğretmez ve
kanal çapını zaten bilen kişi o sayıyı tablodan okur. Buna karşılık "hava perdesinde ısıtıcılı
model kapı önü sıcaklık kaybını telafi eder, ısıtıcısız model yalnız hava bariyeri kurar"
gerçek bir karardır — müşteri bunu bilmeden seçemez.

Ölçüt **kasten insan yargısına** dayanır ve makineye devredilmez: "bu ayrım paragraf hak ediyor
mu" sorusunun cevabı üründe değil, **müşterinin kafasındaki soruda** yaşar.

### 2.3 İki dil şartı niçin var

Paragraf **tek dilde** yazılabiliyor ama diğerinde yazılamıyorsa, o ayrım muhtemelen dile özgü
bir alışkanlıktır, ürün gerçeği değil. Ayrıca her ayrı aile **iki çeviri** demektir; ölçüt bu
maliyeti kararın içine koyar.

#### 2.3.1 Test ADA değil PARAGRAFA uygulanır — ölçüldü

> Aile **adının** iki dilde de kulağa doğru gelmesi, ölçütün geçtiği anlamına **gelmez**.

Ölçüm (canlı DB, 2026-08-23, 38 aile): **13 ailenin `name_i18n` değeri TR ve EN'de birebir
aynı dize.** Hepsi saf marka/model adı — `Danfoss VLT HVAC Basic Drive FC 101`,
`Vortice Bravo S`, `Vortice Lineo 100/125/150/200/250/315 Quiet`,
`Vortice Nordik HVLS Hyperblade`, `Vortice VORT Mono / QBK SAL KC Evo / Quadro Evo`.
Hiçbirinde Türkçe harf ya da Türkçe kelime yok.

Bu **kusur değil** — marka adı çevrilmez, tr = en olması doğrudur. Ama sonucu şudur: bu 13
ailede **ad, bölme kararı hakkında sıfır bilgi taşır.** Dize zaten dilden bağımsız olduğu için
"iki dilde de yazılabiliyor" sınaması orada hiçbir şey ölçmez — her zaman geçer. Ölçüt
§2.1'in dediği gibi **paragrafa** uygulanmalıdır; ada uygulanan hâli **boş bir sınavdır**:
hep yeşil yanar, hiçbir bölmeyi engellemez.

Uygulama notu: bir bölme önerisi değerlendirilirken "adı iki dilde de düzgün" cümlesi
gerekçe olarak **kabul edilmez**; iki dilde yazılmış iki paragraf istenir.

#### 2.3.2 "İki çeviri" maliyeti eksik ölçüyor — dört yüzey var

`product_families` tablosunda çeviri taşıyan **dört** alan var (hepsi `jsonb`).
Bugünkü doluluk (38 aile, silinmemiş):

| yüzey | iki dilde dolu |
|---|---|
| `name_i18n` | 38 / 38 |
| `description` | 38 / 38 |
| `meta_title` | **0 / 38** |
| `meta_description` | **0 / 38** |

`meta_title` ve `meta_description` 38 ailenin **hepsinde `NULL`** — boş nesne bile değil,
hiç yazılmamış. Yani her aile bugün *iki çeviri ödenmiş + iki çeviri ödenmemiş* hâlde yaşıyor
ve ödenmeyen taraf SEO yüzeyi. Yeni bir aile açmak, **zaten tamamı ödenmemiş** bir borca bir
kalem daha ekler.

Bu, bölme kararını yasaklamaz; kararın **gerçek fiyatını** görünür kılar. Ölçüt "iki çeviri"
derken kastedilen alt sınırdır, tavan değil.

> **Kapsam sınırı:** `meta_*` alanlarının boş olması I18N şeridinin bulgusu ama ÜRÜN/SEO
> alanının işidir. Burada yalnız **maliyet kalemi olarak** kayda geçiyor.

#### 2.3.3 Her yeni aile, bir karışık-dilli dize daha demektir

Aile adları **tek dizede iki dil** taşır: `Vortice Lineo Quiet Kanal Fanları`. Ölçüm
(2026-08-23): **38 adın 36'sı `i` harfi içeriyor.**

Bunun bedeli `docs/standards/i18n-localization-standard.md` ekseni I'de yazılı ve
`INV-7` kapısıyla korunuyor: veri kaynaklı özel ada CSS `text-transform: uppercase`
uygulanamaz, çünkü `uppercase` **dile duyarlıdır** ve `lang="tr"` altında `Vortice → VORTİCE`
olur. Elemana `lang` vermek de çözmez: dize karışık dilli olduğu için `lang="tr"` markayı,
`lang="en"` Türkçe kelimeleri bozar.

Yani her yeni aile, kasa/harmanlama kurallarının kapsamına giren **bir dize daha** ekler.
Aileyi bölmek bu bedeli çoğaltır; birleştirmek azaltır.

## 3. K3 — Anlatı üç kademelidir

374 ürün ve ~31 kategoriye elde yazılmış anlatı ölçeklenmez. Anlatı **kademelenir**:

| kademe | ne | kime |
|---|---|---|
| **1 — elle yazılmış** | özgün anlatı, görsel, bölümler, karşılaştırma | üst kategoriler (~13) ve gerçek **karar aileleri** |
| **2 — şablon + sözlük anahtarı** | aynı iskelet, verisi sözlükten gelen metin | katalogun kütlesi |
| **3 — spec tablosu + görsel** | anlatı yok; tablo ve görsel yeterlidir | ayrım taşımayan varyantlar |

Kademe 2'nin uygulanabilirliği **kanıtlıdır**: T150'de sessiz fan sihirbazının 82 sözlük
anahtarı TR+EN üretildi; şablon + anahtar yolu ölçekleniyor.

**Kademe seçimi K2'nin sonucudur:** paragraf yazılabiliyorsa kademe 1, yazılamıyorsa 2 ya da 3.
Üç kural tek karara bağlanır.

## 4. Kapı

Cetvelin **makineye devredilebilir** kısmı K1'dir; K2 insan yargısıdır, K3 K2'nin sonucudur.

`scripts/db/checks/catalog-integrity.mjs` → **`family-nested`**: bir ailenin üst ailesi varsa
sayar. K1'in ihlali tam olarak budur — üçüncü gezinme kademesi ancak aile hiyerarşisiyle doğar.

Taban (`catalog-integrity-baseline.json`) **yalnız kısalır**: bugünkü ihlaller gerekçesiyle
affedilmiştir, **yeni ihlal eklenemez**. Yani bugünkü Lineo yapısı kurala aykırı olarak
**kayıtlıdır** ve düzeltilmesi Recep kapısındadır; ama **ikinci bir tanesi doğamaz**.

K2 için makine kapısı **yoktur ve olmamalıdır** — "bu ayrım paragraf hak ediyor mu" sorusu
ölçülemez. Bunun yerine kapı K2'nin **sonucunu** ölçer: paragrafı olmayan bir aile kademe 1
anlatısı taşıyorsa, o anlatı ya yazılmamıştır ya da yazılamayan bir ayrımı anlatmaya
çalışmaktadır.

## 4b. K4 — Görünüm modu veriye bağlıdır, tercihe değil (2026-08-26)

### 4b.1 Niçin bu madde eklendi

Bu cetvel şimdiye kadar **derinliği** yönetiyordu (kaç kademe sayfa olur), **görünüm modunu**
yönetmiyordu (o sayfa neyi listeler). O boşlukta canlı bir müşteri kaybı yaşadı ve **hiçbir
kapı görmedi** — CLAUDE.md kural 1'in tarif ettiği durumun ta kendisi.

**Ölçüm (2026-08-26, prod, tarayıcıda, ana içerik bölgesi sayıldı — footer hariç):**

| adres | mod | alt kategori | aktif ürün | ileriye giden bağlantı |
|---|---|---|---|---|
| `/tr/category/isi-geri-kazanim` | showcase | 0 | 16 | **0** |
| `/tr/category/endustriyel-tavan-vantilatorleri` | showcase | 0 | 7 | **0** |
| `/tr/category/endustriyel-havalandirma` | showcase | 7 | 225 | 7 alt kategori kartı |
| `/tr/category/aksiyel-sanayi-fanlari` | series | 0 | 16 | 1 aile kartı |

Sebep: `CategoryShowcaseView` yalnız `subCategories` alır, `families` **almaz**; showcase'te
sayfalama da kapalıdır. Yani alt kategorisi olmayan bir showcase kategorisi **hiçbir şey**
listelemez. Bileşen bozuk değildi — **veri yokken boşa düşüyordu.** Etkilenen: 27 aktif ürün.

Not: metin taraması bu kusuru göremez. Sözlük dizeleri RSC yüküne serileştiği için her iki
görünüme özgü ibareler **her sayfada** geçer; gösterge iki durumu ayırt etmez. Ölçüm ancak
tarayıcıda **yapısal** olarak (render edilmiş bağlantı sayımı) yapılabilir.

### 4b.2 Kural

> **Bir kategori sayfası, ileriye giden en az bir yol göstermek zorundadır** — ya alt kategori
> kartı, ya aile/ürün kartı. Hiçbir mod, sayfayı çıkışsız bırakmayı meşrulaştırmaz.

Bunun sonucu olarak **görünüm modu tek başına bir tercih değildir; verinin onu taşıyıp
taşımadığıyla birlikte geçerlidir**:

| mod | ne gösterir | veri şartı |
|---|---|---|
| `showcase` | alt kategori kartları + anlatı | **en az 1 alt kategori** |
| `landing` | aile kartları + karar anlatısı | en az 1 aile |
| `series` | aile kartları (teknik) | en az 1 aile |

Şart sağlanmıyorsa mod **düşer**: `showcase` → `series`. Düşme sessiz bir çare değil,
**kuralın kendisidir** — `display_mode` sütunu bir niyet beyanıdır, sayfanın çıkışsız
kalmasına izin veren bir yetki değil.

### 4b.3 Yürürlük noktası ve bekçi

Kuralın koddaki karşılığı tek bir fonksiyondur:
`src/views/CategoryMasterView.tsx` → `etkinGorunumModu(displayMode, altKategoriSayisi)`.

Mod **iki yerde** tüketilir: hangi görünümün çizileceği ve sayfalamanın gösterilip
gösterilmeyeceği. İkisi ayrı hesaplanırsa sessizce ayrışır — bu dosyada zaten bir kez ayrıştı.
Bu yüzden kural **tek kaynak** olarak yazılır ve bekçi bunu da kilitler.

Bekçi: `src/__tests__/conformance/category-view-reach.test.ts` (INV-CATEGORY-REACH-1).
Sabotaj **üç yönde** kırmızı verir: (1) düşme kuralı sökülünce, (2) aşırı düzeltilip her
showcase düşürülünce, (3) sayfalama ham modu yeniden okuyunca.

### 4b.4 Kapsam dışı — ayrı kalemler

- **Boş kategoriler.** `parking-jet-fan` ana kategorisinin 0 alt kategorisi ve 0 ürünü var;
  `hygiene-sanitizer`, `summer-ventilation`, `air-conditioning` de boş. Bu bir **veri**
  kararıdır (gizle / doldur / sil) ve bu cetvelin konusu değildir.
- **Ölü kod.** `CategoryMasterView`'in `switch` `default:` dalı ve `CategoryGridView`
  ulaşılamaz: `useCategoryViewModel` `'grid'` değerini `'series'`e çevirir ve sütunda 0 adet
  `'grid'` vardır. `knip` bunu yakalayamaz çünkü dosya **import ediliyor**.

## 5. Ölçülmüş durum (2026-08-23, canlı DB)

| ölçüm | sonuç |
|---|---|
| toplam aile | **38** |
| tek katmanlı (üst ailesi yok) | **37** |
| iki katmanlı (üst ailesi var) | **6** (hepsi Lineo Quiet çocukları) |
| ebeveyn aile | **1** (`vortice-lineo-quiet`) |
| doğrudan ürünü olmayan aile | **1** (aynı şemsiye) |

Yani **iki kademeli yapı katalogda tek örnektir**, desen değil. 2026-08-21'deki aile
ayrışmasından kalmıştır ve o ayrışma bu cetvelin ölçütünü uygulamamıştır (ölçüt o gün
yazılı değildi).

## 6. Kapsam dışı

- **Lineo'nun birleştirilmesi** (6 çap → tek aile): bu cetvele dayalı **prod veri yazımı**,
  Recep kapısı. Cetvel inince önerilecektir.
- **Şema değişikliği** (aile hiyerarşisinin tablodan kaldırılması): ayrı iş; bugünkü kural
  hiyerarşiyi **kullanmamayı** söyler, sütunu silmeyi değil.
- **Ürün adresinin kaldırılması**: yapılmaz. K1 adresin **var** olmasını, gezinme hedefi
  **olmamasını** söyler.

## 7. İlgili

- `docs/standards/category-taxonomy-standard.md` — kategori ağacı ve slug lokalizasyonu
- `docs/standards/storefront-design-standard.md` — vitrin görsel dili
- `docs/standards/product-selection-wizard-standard.md` — seçim sihirbazları (kuyruğun sonunda)
- `scripts/db/checks/catalog-integrity.mjs` — `family-nested`, `family-empty`, `product-no-subcategory`
- `docs/audits/t140-*` — aile ayrışması ölçümleri


---
# FILE: docs\standards\catalog-ingestion-standard.md

# VentHub Katalog İçe-Alım Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** PDF kataloglardan **hatasız ürün verisi** üretip Supabase'e almanın cetveli.
> Worker (Antigravity CLI, `.agent/skills/venthub-catalog-importer`) **bunu izler**; çıktı = insan-doğrulanabilir
> CSV. "Hatasız" demek, CSV kolonlarının + kategori eşlemesinin + fiyat kuralının **önceden sabit** olması demektir.
>
> **Neden var?** `venthub-pdf-ingestor` (ağır Docling/pydantic hattı) görsel-çıkarım yöntemine **kafa-kafaya kaybetti
> ve EMEKLİ** (12 ürüne 48 dosya, boş kit kodları, 105 kritik jidoka). Diriltilmez. Yöntem = görsel çıkarım + NotebookLM hakem.

---

## 0. Hızlı başlangıç — worker ilk işler (proje: `venthub-pdf-ingestor`)

1. **PDF'leri indir → `avensair.com/kataloglar`** (24 katalog: Vortice broşürleri **+** Avensair fiyat listesi, **hepsi burada**).
   Klasör yapısına yerleştir (§2 workspace tree): spec katalogları `markalar/<marka>/<katalog>/01-input/`,
   fiyat listesi `ticaret/avensair-fiyat-listesi-2026/01-input/`.
   *(Vortice.com orijinalleri **opsiyonel** — yalnız azami spec hassasiyeti gerekirse; Avensair kopyaları sadıktır.)*
2. **Skill HAZIR** — `<ingestor>/.agent/skills/venthub-catalog-importer/` zaten **CSV-akışına güncel** (controller yaptı, standartla birebir). Düzenleme gerekmez; sadece çalıştır.
3. **Pilot ile başla:** TEK katalog (ör. `vortice/konut-fanlari`) + fiyat listesi → 1 CSV → Recep teyit eder. Tuttuysa kalanı batch-batch.

> Tüm kurallar aşağıda (§1–§8) — **tekrar yok.** Kademe 1'de DB'ye **YAZMA** (Kademe 2 = controller).

---

## 1. Çekirdek model: Vortice (üretici) → Avensair (bayi)

| Ne | Kaynak | Defter ID |
|---|---|---|
| **Spec / içerik** (debi, basınç, güç, ses, ölçü, açıklama, görsel) | **Vortice** (üretici, otoriter) | `0e5d2a83-e94f-433a-90e2-4c45b1e3730a` |
| **Ticaret** (ne satıyoruz, TR-KOD, **€ alış**, KDV, kur) | **Avensair** (TR bayi, satış otoritesi) | `e3b18fa3-6310-4067-9873-2deb847d15a8` |

- **Köprü = model kodu** (Vortice `cod. 61121` = Avensair `KOD 61121`). İki kaynağı bu bağlar.
- ⚠ **Kodun biçimi hakkında varsayım YOK.** Kod salt sayısal (`61121`, `11313`), **dört haneli**
  (`1200`, `1355`), alfanümerik (`NS311280`, `NX313290`), **boşluklu** (`ENKEC 155`)
  ya da uzun/karışık (`253080106XN`) olabilir. Kaynakta yazdığı gibi **birebir** kopyalanır; kırpma,
  doldurma, yeniden biçimlendirme yoktur ve **biçimi tuhaf göründü diye satır atlanmaz**.
  (Ölçüldü — T119: yalnız beş haneli kod bekleyen bir çıkarım **74 ürünü** düşürdü, bunların 7'si dört haneliydi.
  Kayıt: `docs/audits/t119-katalog-cikarim-dogrulama-2026-08-20.md`)
- ⚠ **Köprü kaynakta TEKİL DEĞİL — açık karar.** Aynı model kodu birden fazla ürüne ait olabilir
  (ölçüldü: 543 kodun 41'i mükerrer, ~20'si farklı fiyatlı gerçek çakışma; ör. `43151` hem
  VORT QBK SAL KC EVO 315 hem TORRETTE TR-A 315 ATEX). Bu cetvel kodu "köprü" saymaya devam eder,
  ama **tekillik garantisi vermez**. Bileşik anahtara mı geçileceği yoksa çakışmanın kırmızı mı sayılacağı
  **Recep kararı bekliyor**; karar çıkana kadar aktarımda tekillik kısıtına güvenilmez.
- **Mağaza = Avensair'in sattığı küme.** Vortice'de olup Avensair'in satmadığı kalemler (ev tipi yaz vantilatörü,
  mutfak davlumbaz, Ariett/Vort Press, gelişmiş HRV, VMC kanal, Vorticel MPC) **CSV'ye girmez**.
- **Avensair ticari şartları (sabit):** fiyatlar **Euro** · **%20 KDV hariç** · **TCMB Efektif Satış Kuru** · AVenS depo teslim.

---

## 2. İKİ KADEME — çıkarım ↔ yükleme (CSV = DB-agnostik sınır)

Süreç **iki bağımsız kademeye** ayrılır. Aralarındaki **CSV/Excel = sözleşme + tek kaynak gerçeği.**
Bir kademe diğerini bilmez → ayrı ayrı tekrar-koşulur veya değiştirilir.

**KADEME 1 — ÇIKARIM (PDF → CSV).** Ingestor projesi (Python runtime). **DB'ye DOKUNMAZ.**
İstenen seviyeye gelene kadar **tekrar koşulur**; Recep CSV'yi **onaylar/iterasyonlar.** Çıktı = kanonik CSV.
```
PDF → görsel çıkarım + çapraz-sorgu → CSV/Excel → [Recep teyit ↻ iterasyon]
```

**KADEME 2 — YÜKLEME (CSV → DB).** Ayrı çalıştırma, **yalnız onaydan sonra.** DB hedefi = **ADAPTÖR/parametre:**
bugün **Supabase** (MCP / `supabase_writer`), yarın **yerel Postgres** veya başka — **CSV değişmez, yalnız hedef değişir.**
Controller yapar; fiyat + taksonomi modeli **burada** uygulanır (taksonomi+fiyat kilitliyken).
```
Onaylı CSV → loader(--target supabase|local) → DB
```

**Neden böyle:** (a) Kademe 1'i DB'ye hiç dokunmadan defalarca koş; (b) DB hedefini değiştir (Supabase ↔ yerel)
**yeniden çıkarmadan**; (c) CSV insan-okunur + versiyonlanabilir + tek gerçek. Eski skill'in "çıkar→JSON→doğrudan DB"
**füzyonu** bu yüzden ikiye bölünür — kaynak (PDF) ile hedef (DB) birbirine bağlı kalmaz.

### 📁 Workspace klasör yapısı (kırılımlı tree — TEMPLATE, örnek alın)

Klasörler **kaynağa göre** düzenlenir (marka → katalog); CSV'deki `category_slug` ise **hedefe göre**
(Avensair kategorisi). Source ile target **ayrı eksenler** — klasörü Avensair kategorisine göre değil
**markaya/kataloğa** göre kır. Bir katalog = bir klasör → kendi input + output'u izlenir, re-run temiz, batch karışmaz.

```
venthub/                                   # workspace kökü (ingestor projesi içinde)
│
├── markalar/                              # SPEC kaynakları — üretici markaları
│   ├── vortice/
│   │   ├── konut-fanlari/
│   │   │   ├── 01-input/                  # ham PDF (Vortice-Konut-Fanlari.pdf)
│   │   │   ├── 02-work/                   # sayfa PNG'leri + scratch (ara çıktı)
│   │   │   └── 03-output/                 # spec CSV (vortice-konut.csv)
│   │   ├── endustriyel-fan-serisi/        { 01-input · 02-work · 03-output }
│   │   ├── isi-geri-kazanim/              { 01-input · 02-work · 03-output }
│   │   └── hava-perdesi/                  { 01-input · 02-work · 03-output }
│   ├── nicotra-gebhardt/
│   │   └── radyal-fanlar/                 { 01-input · 02-work · 03-output }   # DD/AT/ADH/RDH
│   ├── danfoss/
│   │   └── frekans-konvertorleri/         { 01-input · 02-work · 03-output }   # VLT FC101/FC102
│   └── avens/                             # AVenS kendi üretimi
│       ├── siginak-bvu/                   { 01-input · 02-work · 03-output }
│       ├── hucreli-aspirator/             { 01-input · 02-work · 03-output }
│       └── isi-geri-kazanim/              { 01-input · 02-work · 03-output }
│
├── ticaret/                              # COMMERCE kaynağı — bayi (markalar-üstü, çapraz keser)
│   └── avensair-fiyat-listesi-2026/
│       ├── 01-input/                      # Avensair 2026 fiyat listesi PDF
│       └── 03-output/                     # avensair-fiyat.csv (model_code → KOD + € fiyat)
│
└── _birlesik/                            # MERGE — Kademe 2 (yükleme) girdisi
    └── venthub-products-master.csv        # spec + ticaret, model_code ile birleşmiş, yüklemeye hazır
```
> `{ 01-input · 02-work · 03-output }` = aynı 3 alt-klasör (yer için kısaltıldı).

**Kurallar:** klasör adı kebab-case + **ASCII** (ş/ı/ç/ğ → s/i/c/g); `01/02/03` önekleri pipeline sırasına dizer
(ham→ara→final); `markalar/`=spec · `ticaret/`=Avensair € fiyat · `_birlesik/`=birleşmiş final (`_` öneki en üste sıralar).

---

## 3. CSV şeması (SÖZLEŞME) → **`csv-import-export-standard.md` (FORMAT SSOT)**

> ⚠️ **CSV'nin biçimi bu cetvelde TANIMLANMAZ — tek SSOT `csv-import-export-standard.md`.** Bu dosya *yöntem*
> cetvelidir (kaynak, hakem, kategori-harita, kapılar); CSV'nin kolonları/kodlaması/kalite-kapısı **format
> cetvelinindir.** Mükerrerlik = drift = kontrol kaybı; o yüzden burada şema **tekrarlanmaz**, oraya bakılır.

Worker'ın üreteceği CSV'nin **tam kolon listesi + kodlama (`utf-8-sig`, `;` ayraç) + flat `spec_` mimarisi +
slug kuralı + Jidoka kalite kapısı** → **`csv-import-export-standard.md`**. Özet hatırlatma (otorite orada):

- **Teknik özellikler flat `spec_` kolonları** halinde yazılır (DB'de JSONB; loader Kademe-2'de flat→JSON katlar).
  *(Eski "tek `specs_json` kolonu" önerisi emekli — gerekçe format cetveli §0.)*
- `model_code` = köprü (zorunlu); `purchase_price_eur` = **€ alış, TL gömme yok** (fiyat motoru → `pricing-standard.md`).
- `category_slug`/`subcategory_slug` = **canlı DB slug'ı, birebir** (icat etme; eşleme anahtarı `avensair_section`, bkz format §3).
- `confidence` (`ok`/`conflict`/`missing`) → `ok` dışı = insana işaretli.

---

## 3.1 Seri, BÖLÜM BAŞLIĞINDAN türetilmez (2026-08-27)

> Bu madde bir **yöntem** kuralıdır. `series` kolonunun biçimi/zorunluluğu format cetvelinin işidir
> (`csv-import-export-standard.md`); burada yazan şey, o kolonun **neyden türetileceğidir**.

**Kural.** Seri **ürün adından** türetilir. `avensair_section` (katalog bölüm başlığı) bir
**kategori adayıdır**, seri değildir — `marka + bölüm başlığı` birleştirerek seri üretmek yasaktır.

**Niçin — ölçülmüş hasar (2026-08-27, 28 çıkarım dosyası + fiyat listesi HQ sürümü).**
Çıkarım CSV'lerinde `series` alanı **yoktu** (28 dosyanın 0'ında). İçe alım seriyi bölüm
başlığından uydurdu ve **beş ayrı hata sınıfı** doğdu; hiçbirini hiçbir kapı görmedi:

| # | Hata sınıfı | Somut örnek | Sonuç |
|---|---|---|---|
| 1 | Bölüm başlığı seri sanıldı | "DAVLUMBAZ FANLAR" → *AVenS Davlumbaz Fanları* serisi | **AVenS o ürünü hiç üretmiyor** (fiyat listesi s.36). Uydurulan serinin altında 3 aksesuar kaldı |
| 2 | Alt başlık bölüm sanıldı | s.69'un gerçek bölümü *ISI GERİ KAZANIM CİHAZLARI*; "ELEKTRİKLİ ISITICILAR" onun altındaki iki tablodan biri | Suyla ısıtan sulu batarya, elektrikli ısıtıcı serisine girdi — 8 model yanlış seride |
| 3 | Fiyat listesi sahibi marka sanıldı | AVenS listesindeki satırların tamamı `brand=AVenS` damgalandı, içindeki **Danfoss FC-51** dahil | Danfoss ürünü AVenS markasıyla ve davlumbaz serisinde |
| 4 | Sayfa altı aksesuar tablosu ürün sayıldı | hız anahtarları s.27 **ve** s.36'da tekrar ediyor | Aksesuar, fan serisinin modeli oldu |
| 5 | Aynı ürün hattı iki seride | Lineo, hem *VORT Commercial In-Line* (Ticari) hem *Lineo Quiet* (Konut) altında | Aynı hat **iki ana kategoride** |

Ayrıca **sütun kayması** sessizce geçti: 6 satırda Kcal/h değeri `model_code`, "UYGUN MODEL"
sütunu `name` sanıldı. Bu yakalanabilirdi — o satırların **fiyatları doğru gelmişti**, yani
fiyat üzerinden çapraz doğrulama mümkündü ve yapılmamıştı.

**Kalan borç (görünür kılınıyor, kapatılmış değil):** düzeltme yalnız 4 AVenS CSV'sinde
uygulandı (35/35 satır `series` dolu). **Diğer 24 marka CSV'sinde `series` kolonu hâlâ yok.**

---

## 4. Avensair 27-bölüm → 2-seviye kategori haritası (gruplama rehberi)

> Worker ürünü **Avensair bölümüne** göre gruplar. Nihai slug'lar `category-taxonomy-standard.md` ile kesinleşir;
> aşağısı çalışan eşleme (üst → alt).

| Üst kategori | Avensair bölümleri (no) |
|---|---|
| **Konut Tipi Havalandırma** | 08 Mini Aksiyal · 15 Santrifüj · 16 Çift Yönlü Aksiyel · 18 Duvar/Tavan Radyal |
| **Kanal Tipi Fanlar** | 22 Sessiz Yuvarlak · 24 Yuvarlak · 26 Kanal · 27 Dikdörtgen |
| **Çatı Tipi Fanlar** | 32 Yatay Atışlı · 35 Dikey Atışlı |
| **Endüstriyel Havalandırma** | 28 Hücreli · 29 Şömine-Baca · 30 Aksiyel · 36 Davlumbaz |
| **Radyal / Santrifüj Fanlar** | 41 Santrifüj · 46 Plug · 52–55 Nicotra Gebhardt (DD/AT/ADH/RDH) |
| **Ex-Proof (ATEX) Fanlar** | 38 Ex-Proof · 40 Ex-Proof Çatı |
| **Endüstriyel Tavan + Hava Perdesi** | 62 Nordik HVLS + Air Door · 64 Hava Perdesi |
| **Isı Geri Kazanım (VMC)** | 66 Isı Geri Kazanım |
| **Özel / Kontrol** | 56 Sığınak · 58 Frekans Konvertörü |

⚠️ **"Otopark Jet Fanları" ŞÜPHELİ:** Avensair "JET" = asit-ortam plastik çatı santrifüj fanı (41 altında), otopark jet
fanı DEĞİL. Worker bu serileri 41'e koyar; "otopark jet" diye ayrı kategori AÇMAZ (Vortice Vort Jet-A/R Avensair'de yok).

---

## 5. Çıkarım yöntemi (skill + hakem — tek AI'ya güvenme)

1. **Görsel ajan** Vortice broşürünü GÖZLE okur → o sayfadaki **TÜM** ürünleri eksiksiz çıkarır (enümerasyonda güçlü).
2. **NotebookLM hakem** her ürünü **atıfla** doğrular (kesin tek-değer + citation). Avensair defteri = satılıyor mu + € fiyat.
3. **Çelişki / eksik / tuhaf** → `confidence != ok` → **Recep'e işaretlenir** (CSV'de görünür).
4. **Kör güven YOK:** kanıt — AD900 kumandası, görsel ajan DOĞRU (RVG 1A/12835), NLM YANLIŞ (RVG 2A). Çelişince **ham atıf (katalog) hakem.**

---

## 6. Kapılar (zorunlu — ihlal = satır reddi)

- [ ] **Kategori = Avensair 27-iskelet** (§4); Vortice-şekilli kategori üretme.
- [ ] **Fiyat = € alış** (`purchase_price_eur` + `currency=EUR`); **TL gömme YASAK** (fiyat motoru hesaplar — `pricing-standard.md`).
- [ ] `model_code` her satırda dolu (köprü); boşsa flag.
- [ ] Avensair'in **satmadığı** kalem CSV'ye girmez (Vortice-only düş).
- [ ] `price=0` / eksik spec → satırı atma, `confidence` ile **flag**.
- [ ] **DB yazımı yok** — worker yalnız CSV üretir; Supabase yükleme controller + Recep onayı (dry-run default).

---

## 6.1 Aile↔içerik bütünlüğü kapısı — **INV-CATALOG-1** (v1.2, 2026-08-19)

> **Niçin eklendi:** T099. Müşteri "AVenS Davlumbaz Fanları" sayfasına girdi ve sepetine bir **hız
> anahtarı** düştü — çünkü o ailenin üç üyesinin üçü de aksesuardı, ailede tek bir davlumbaz fanı
> yoktu. Kod doğru davranıyordu (`?sku=` yoksa ilk varyant); yanlış olan **veriydi** ve hiçbir kapı
> onu görmüyordu. Ölçüm: `docs/audits/t099-aile-icerik-uyumu-2026-08-18.md`.

### Ne ölçülür, ne ölçülmez (dürüst sınır)

**ÖLÇÜLMEZ:** "aile adı içeriğine uyuyor mu" — bu bir **yargıdır**. Ne statik tarama ne SQL bunu
karara bağlayabilir. Kapı diye yazılırsa yalnız **sahte yeşil** üretir ve gerçek kusuru gizler.

**ÖLÇÜLÜR (SQL, kesin):**

| Kontrol | Neyi yakalar |
|---|---|
| `dup-name` — aile içinde çakışan ürün adı | Yalnız adı gösteren yüzey (sepet, e-posta, fatura) iki farklı ürünü aynı gösterir |
| `dup-label` — aile içinde çakışan `model_code`/`sku` | Varyant seçim yüzeyi anlamsızlaşır; **bugün 0, korunmalı** |
| `orphan` — ailesiz ürün | Kanonik vitrin adresi olmayan ürün |
| `brand-mix` — aile içinde birden çok (ya da boş) marka | Aile sınırının yanlış çizildiği |

Kapı: `scripts/db/checks/catalog-integrity.mjs` · taban: `catalog-integrity-baseline.json` ·
karar mantığının sınavı: `src/__tests__/conformance/catalog-integrity-gate.test.ts`.

### Cırcır (ratchet) — niçin "sıfır ihlal" istemiyoruz

Bugünkü 21 ihlal grubunun (74 satır) düzeltilmesi **prod yazımıdır → Recep kapısı**. Kapı bu yüzden
bilinen ihlalleri **adıyla ve gerekçesiyle** tabana yazar ve **tabanın dışındaki her yeni ihlalde
KIRMIZI** olur. Böylece sınıf bugünden itibaren geri gelemez; mevcut borç gizlenmez, **sayılır**.

- **Gerekçesiz taban satırı YASAKTIR** — kapı bunu kendi sınavında reddeder.
- **Taban yalnız küçülür.** Bir veri düzeltmesi yapıldığında ilgili taban satırını silmek,
  **o işin parçasıdır**; ayrı bir iş değildir.
- **Bayat taban satırı kırmızı YAPMAZ**, yalnız uyarır. Gerekçe betiğin başlığında: aksi hâlde
  Recep'in bir veri düzeltmesi, konuyla ilgisi olmayan bir şeridin PR'ını kırardı — yani kapı
  kimsenin hatası olmadığı bir anda **yanlış kırmızı** verirdi.
- **Uyar-geç modu YOKTUR.** Yeni ihlal doğrudan kırmızıdır.

### Bağlantı yüzeyi — ölçemeyen kapı YEŞİL DÖNMEZ

CI: `.github/workflows/db-advisor.yml` → iki iş. `catalog-integrity-precheck` **tek** ön-koşulu
ölçer (`SUPABASE_DB_URL`); `catalog-integrity` yalnız o varsa koşar (`needs` + `if`).

| Durum | Ne olur |
|---|---|
| Bağlantı dizesi var | Kapı koşar. Taban dışı yeni ihlalde **KIRMIZI**. |
| Bağlantı dizesi yok (ör. fork PR'ı) | Kapı işi **hiç koşmaz — "skipped"**. Atlanmış iş **başarılı değildir**; kimse onu "ölçüldü" diye okuyamaz. |
| Bağlantı dizesi var ama bağlanılamıyor | Betik çıkış **2** — "ÖLÇÜLEMEDİ", iş **KIRMIZI**. |

> ⚠️ **Bu tasarım bir düzeltmedir.** İlk hâlinde sır yokken betik `exit 0` veriyordu ve
> "ÖLÇÜLEMEDİ" yalnızca bir **etiketti** — iş **yeşil** dönüyordu. Yani kapı, ölçmediği bir şey
> için "geçti" raporluyordu: sessiz fail-open. Bunu dosyanın sahibi (EDGE) yakaladı ve kanıt
> istedi. Kural olarak yazılıyor: **bir kapı ölçemediğinde başarı raporlayamaz** — ya kırmızı olur
> ya hiç koşmaz. `src/__tests__/conformance/catalog-integrity-gate.test.ts` bunu iki iddiayla
> koruyor ve üç sabotajla kırmızı görüldüğü kanıtlandı (üst-dize tuzağı dahil:
> `SUPABASE_CA_CERTX` ilk iddiayı yeşil geçiyordu).

TLS doğrulaması **açıktır**; Supabase kök sertifikası `PGSSLROOTCERT` ile verilir (ölçüldü:
doğrulama açıkken bağlantı `self-signed certificate in certificate chain` ile ölüyor). Doğru
çözüm kökü **vermek**, doğrulamayı kapatmak değil — bağlantı prod DB kimlik bilgisi taşıyor ve
repo **PUBLIC**.

**Kökün tek kaynağı depodur:** `scripts/db/checks/supabase-root-2021-ca.pem`. Sır değildir —
halka açık bir belgedir ve elle yapıştırma adımı gerçek bir kusur üretti (ölçüldü: panoya
1366 baytlık **yanlış** sertifika düşmüştü; gerçek kök 2179 bayt). Rotasyon, bu dosyanın
gözden geçirilebilir bir commit ile değiştirilmesidir. **Sır-üstüne-geçer seçeneği yoktur ve
olmayacaktır:** görünmez bir pano ayarının doğrulanmış dosyayı sessizce ezmesi, tam da
onarılan kusurun geri gelmesi olurdu. Testte iki iddiayla sabitlendi — hiçbir iş
`SUPABASE_CA_CERT` okumaz ve `PGSSLROOTCERT` tam olarak **bir** kez atanır — ve ikisi de
sabotajla kırmızı görüldü.

> **Durum: ÖLÇÜYOR** (mekanizma ilanı kuralı — ilan, ilk gerçek koşumun kanıtına dayanır).
> 2026-08-19 07:38Z, PR #666: kapı prod DB'ye bağlandı ve şu satırı üretti —
> `toplam ihlal 21 | tabanda 21 | YENI 0 | bayat taban satiri 0` → YEŞİL.
> **Recep'ten beklenen bir şey yoktur;** eskiden burada `SUPABASE_CA_CERT` eklemesi isteniyordu,
> o adım **kaldırıldı**. Kökün depoya alınması bu bekleyişi tamamen ortadan kaldırdı.

---

## 6.2 Seri türetme kapısı — **INV-CATALOG-2** (ÖNERİ, 2026-08-27)

> **Durum: ÖNERİ — henüz ÖLÇMÜYOR.** Mekanizma ilanı kuralı gereği "ölçüyor" yazılamaz;
> ilan, ilk gerçek koşumun kanıtına dayanır. Bu bölüm kapının **sözleşmesidir**, ilanı değil.
> §3.1'deki hasar ölçülmüştür; kapı yazılmamıştır.

### Ne ölçülür (satır reddi)

| # | Kontrol | Karar | Neyi yakalar |
|---|---|---|---|
| 1 | `series` boş | **RED** | Alanın hiç gelmemesi. "Kapsam kararı" ile "alan gelmedi" **ayrı** basılır; sessiz atlama yok |
| 2 | `series` değeri `avensair_section` ile birebir eşit | **RED** | Bölüm başlığının seri diye yazılması (§3.1 hata sınıfı 1–2) |
| 3 | `brand`, ürün adından çözülen markayla çelişiyor | **UYARI + insan onayı** | Fiyat listesi sahibinin marka sanılması (§3.1 hata sınıfı 3) |

### Ne ölçülmez — dürüst sınır

Bu kapı **"seri dolu mu"** ve **"seri başlık değil mi"** sorularını cevaplar.
**"Seri doğru mu"** sorusunu CEVAPLAMAZ — o bir yargıdır ve katalog sayfasına bakan insana bağlıdır.
§6.1'in aynı gerekçesi burada da geçerli: ölçülemeyen şeyi kapı diye yazmak yalnız **sahte yeşil**
üretir. Kapının kapsamı, gerçek kapsamından geniş anlatılmasın diye bu paragraf yazıldı.

3. kontrolün **UYARI** olmasının sebebi de bu: marka çözümü ad üzerinden yapılır ve ad her zaman
markayı taşımaz; kesin olmayan bir çıkarımı **RED** yapmak, doğru satırları da düşürürdü.

**Bağlantılı:** `product-schema-standard.md` §11.4 / §11.4.1 (ayırt edicilik + veri borcu) ·
`csv-import-export-standard.md` (`series` kolonunun şemaya eklenmesi **oranın** işi) · §6.1 INV-CATALOG-1.

---

## 7. Provenance / ilişki

Kaynak: çapraz-sorgu (`cross_notebook_query` Vortice-Full + Avensair, 2026-06-19) → Avensair'in 27 gerçek bölümü atıfla.

> ⚠️ **2026-08-17 — YETENEK KAYBI:** ürün değişti (`notebooklm-py`) ve yeni MCP setinde
> **`cross_notebook_query` YOK** (33 aracın hiçbiri çapraz-defter sorgusu yapmıyor).
> Yukarıdaki bulgu geçerli kalır ama **aynı yöntemle tekrar üretilemez**. Geçici yol:
> her defteri `chat_ask` ile ayrı ayrı sorgula, sonuçları elle birleştir.
İlişki: `pricing-standard.md` (€ alış → satış motoru) · `category-taxonomy-standard.md` (2-seviye nihai slug) ·
skill `.agent/skills/venthub-catalog-importer` (çıkarım aracı) · memory `catalog-ingestion-system` · `category-taxonomy-state`.

---

> v1.0 · 2026-06-19 · İlk sürüm. Eksik cetvel boşluğu kapatıldı (skill vardı, cetvel yoktu).
> v1.1 · 2026-08-18 · §6.1 INV-CATALOG-1 (aile↔içerik bütünlüğü, cırcır tabanlı) — T099.
> v1.2 · 2026-08-19 · §6.1 kapı ÖLÇTÜ (07:38Z, PR #666). Kök sertifikanın tek kaynağı depo;
>   `SUPABASE_CA_CERT` sırrı kaldırıldı, sır-üstüne-geçer yolu testle kapatıldı.


---
# FILE: docs\standards\category-taxonomy-standard.md

# Kategori Taksonomisi Cetveli (Category Taxonomy Standard)

> **SSOT.** Ürün kategori iskeleti + yerleşim + gösterim kuralları. Full ürün yüklemesinin OMURGASI.
> Çelişirse kod/DB kazanır; bu cetvel niçin/nasıl'ı sabitler.
> v1.2 · 2026-08-10 — **ingestor fork'u kapatıldı:** §6 kanonik ağaç 11→**12 dal** (`parking-jet-fan` eklendi),
> §6.1 katalog-hattı yeni kategorileri (acid-resistant-fans / frequency-converters / electric-duct-heaters) karara bağlandı.
> (v1.1 · 2026-06-19 — canlı DB ile yeniden doğrulandı; §3'teki yanlış "üste yığılı" önermesi düzeltildi.)

---

## 1. İlke: extensible/plugin iskele (kategori ASLA "boş diye silinmez")

Kategori sistemi **bilinçli olarak genişletilebilir** tasarlandı (admin `CategoryFormModal` ile ekle/düzenle;
`CategoryContext` dinamik yükler; ürün `category_id`/`subcategory_id` ile bağlanır):
- **Boş kategori = gelecekteki ürün için hazır iskele**, hata değil. (air-conditioning, smart-home,
  electric-heating, hygiene = Vortice'in gerçek ürün aileleri, henüz yüklenmedi.)
- ❌ **Boş diye kategori SİLME.** İskele DB'de tam kalır.

## 2. Gösterim kuralı: "doluysa göster" (müşteri) / "hepsi" (admin)

> ⚠️ MEVCUT EKSİK (2026-06-19): `EliteMegaMenu`/`MobileMegaMenu` **tüm üst kategorileri** gösteriyor,
> ürün-sayısı filtresi YOK → 6 boş üst kategori müşteriye boş sayfa olarak görünüyor. KÖTÜ.

- **Müşteri menüsü/nav/anasayfa:** SADECE **ürünü olan** (kendisi veya alt-ağacı dolu) kategoriler.
- **Admin:** hepsini görür/yönetir (boşlar dahil).
- Ürün gelince kategori **kendiliğinden** görünür — manuel iş yok.
- **Uygulama:** `getCategories` ürün sayısı taşımıyor → kategorileri ürün-sayısıyla döndüren view/RPC
  (ör. `categories_with_counts`) + nav'da `count>0` filtresi. (Migration → prod.)

## 3. Yerleşim: tek model + GERÇEK durum (2026-06-19 canlı DB doğrulaması)

- **TEK model:** `products.category_id` = ÜST, `products.subcategory_id` = ALT. Tutarlı uygula.
- **GERÇEK DURUM (359 ürün, canlı Supabase):** ürünler büyük oranda **zaten alt-kategorilere dağılmış**.
  Kesin sınıflandırma:
  - **217** doğru (üst + doğru alt) ✅
  - **67** `category_id` doğrudan bir ALT-kategoriyi gösteriyor (model tutarsızlığı — ürün yine görünür ama yanlış kurguda)
  - **63** üst-var/alt-yok → bunların ~**60'ı meşru** (accessories 48 + summer 12 = alt-kategorisi olmayan yaprak üst), sadece ~3 industrial gerçekten takılı
  - **12** hiç kategorisiz (orphan — hiçbir kategori altında GÖRÜNMEZ, gerçek bug)
- **⛔ DÜZELTME:** *"136 üstte yığılı / altlar boş / oto-motor hiç çalışmadı"* önermesi **YANLIŞTI.**
  O ilk ölçüm yalnız `category_id`'yi saymış, ürünleri alt'a bağlayan `subcategory_id`'yi atlamıştı →
  altları boş sanmış. Veri değişmedi (kullanıcı DB'ye dokunmadı, motor koşmadı); **ölçüm hatalıydı.**
  **Kütle yeniden-dağıtımına GEREK YOK.**
- **Gerçek cleanup (küçük, hedefli):** (a) 12 orphan'a kategori ata · (b) 67 `category_id=alt` kaydını
  normalize et (`category_id`=üst, `subcategory_id`=alt) · (c) ~3 takılı industrial ürününe alt ata.
- `category_mapping_rules` + `fn_auto_categorize_products()` motoru duruyor; **mevcut veride büyük iş yok** —
  asıl faydası **yeni full-load'da** otomatik yerleştirme.

## 4. Dil: KANONİK slug EN, görünen URL dile göre, TR gösterim render'da

> ⭐ **2026-08-10 GÜNCELLEME:** Bu bölümün "yapılacak"ları KAPANDI ve kural genişledi —
> tam SSOT: `docs/plans/slug-localization-2026-08-10.md`.
- **Kanonik kimlik = EN slug** (`categories.slug`; DB/CSV/kod hep bunu konuşur). **Görünen URL dile göre:**
  `metadata.slug={tr,en}` → `/tr/` Türkçe, `/en/` İngilizce slug; yanlış-dil URL'si **308** (PR #457, prod'da).
- Kategori ADI daima `translation_key` + `getCategoryDisplayName` SSOT'undan. **Ham `c.name`/`c.slug` render YASAK**
  (Aksiyom 5: çeviri JSONB `metadata->>lang`).
- ✅ TR sızıntı düzeltildi (PR #456: PDP breadcrumb+özellik, Footer, kategori SEO metadata) ·
  ✅ eksik/bozuk `translation_key`'ler onarıldı (PR #457 migration).

## 5. HRV slug tekilleştir + seed

- `heat-recovery-vmc` BOŞ ama mimari en olgun dal (EN 308 hesaplayıcı + HRVModel 3D + katalog entegrasyonu kurulu).
- Kodda slug `heat-recovery`/`hrv`/`heat-recovery-vmc` farklı geçiyor olabilir → **yükleme öncesi tek değere sabitle.**
- Avensair "Isı Geri Kazanım" grubundan seed et.

## 6. Kanonik ağaç referansı (Vortice ne var × Avensair ne satıyor, TR)

**12 ana dal** (Avensair TR isim tabanı + Vortice ürün-aile derinliği): Konut Havalandırma · Ticari Havalandırma ·
Endüstriyel Havalandırma · Çatı Fanları (yatay/dikey/F400 ayrı) · **Isı Geri Kazanım (boş→doldur)** ·
Hava Perdeleri · Yaz Vantilatörleri · Endüstriyel Tavan Vant. · **Otopark Jet Fanları (`parking-jet-fan`)** ·
Hava Şartlandırma · Aksesuar · (+ az-dolu: hijyen/elektrikli-ısıtma/akıllı-ev = iskele, gelecek).
Tam aile listesi → [[catalog-ingestion-system]] hafıza + NLM Vortice/Avensair defterleri.

> `parking-jet-fan` gerekçesi (ingestor cetvelinden devralındı, 2026-08-10): Vortice VORT JET R / JET-A gibi
> gerçek indüksiyon jet fanları için bağımsız üst dal. Avensair listesinde olmasalar da SaaS vizyonu
> (marka-nötr taksonomi, diğer HVAC markalarının listelemeleri) bu ayrımı zorunlu kılar; fiyatsız girişler
> `confidence=missing` + `purchase_price_eur=NULL` ile aktarılır.

### 6.1 Katalog-hattı kategori kararları (2026-08-10 — CSV normalizasyonu ile kilitli)

Ingestor CSV'lerindeki 230 satırlık slug sapması canlı DB'ye hizalandı; karara bağlanan **yeni** kategoriler
(hepsi EN slug + `translation_key` kuralıyla, DB'de Kademe-2 loader öncesi migration ile açılacak):

| Yeni kategori | Slug (üst/alt) | Kapsam | Gerekçe |
|---|---|---|---|
| Asit-dayanımlı fanlar | `industrial-ventilation` / `acid-resistant-fans` | Seat/Storm/Jet, 81 ürün | 81 ürün tek alt'a (`radyal-fanlar`) yığılmaz; kimyasal/asit ortam = net alıcı niyeti |
| Frekans konvertörleri | `accessories` / `frequency-converters` | Danfoss FC101/FC102, 34 ürün | Fan kontrol cihazı = aksesuar doğası; yeni ana dal gerektirmez |
| Elektrikli kanal ısıtıcıları | `electric-heating` / `electric-duct-heaters` | Avens, 14 ürün | Mevcut `electric-heating` iskeleti tam bu iş için bekliyordu; HRV'ye gömmek yanlış raf |

Mekanik hizalamalar (karar değil): hücreli aspiratör + davlumbaz → `industrial-ventilation/radyal-fanlar`
(Avensair Bölüm 28/36 haritası) · Nicotra → `industrial-ventilation/radyal-fanlar` · banyo fanları →
`banyo-ve-tuvalet-fanlari` · Lineo → `residential-ventilation/kanal-ici-hayalet-fanlar` · sığınak →
`industrial-ventilation/siginak-havalandirma` · HRV/smart-home alt-slug'sız. `tier_c` (yerel icat) → `missing`.

**Slug dili kuralı (teyit):** mevcut TR alt-slug'lar yerinde kalır (301 normalizasyonu ertelendi, ithalatı
bloklamaz); **her YENİ slug İngilizce açılır** + `translation_key` zorunlu (§4).

## 7. AÇIK UYGULAMA GÖREVLERİ (compact sonrası — TAM yap, yarım değil)

1. `categories_with_counts` view/RPC + nav'da boş-gizle filtresi (müşteri). **[gerçek + görünür — #1]**
2. **Veri cleanup (kütle dağıtım DEĞİL — gerekçe §3):** 12 orphan'a kategori ata + 67 `category_id=alt`
   kaydını normalize et + ~3 takılı industrial'a alt ata.
3. **TR/EN gösterimini CANLI sitede DOĞRULA önce:** SSOT `wrapCategory` zaten `translation_key`
   → `common.categoryList.*` çözüyor ve TR sözlük TAM. Yani önceki "slug ile bakıp köprüyü atlıyor"
   teşhisi de şüpheli → ekranı gör, gerçekten sızıyorsa SSOT'u atlayan belirli yüzeyi bul, sonra düzelt.
4. HRV slug (`heat-recovery-vmc` zaten kanonik; `heat-recovery`/`hrv` varyantları kodda kontrol) + seed.
5. Çatı fanlarını yatay/dikey/F400 ayır (taksonomi kararı → ben).
> Sıra: bunlar bitince → full ürün load (catalog-ingestion-standard) güvenle başlar.


---
# FILE: docs\standards\checkout-payment-standard.md

# Checkout & Ödeme Cetveli

> **Durum:** TASLAK v0.1 · 2026-08-17 · Şerit: PRICING-STOK
> **Niçin var:** T080'de ölçüldü ki ödeme ekranı **boş açılıyor** ve bunu hiçbir kapı görmüyor.
> Sebep bir kod hatası değil, **cetvel boşluğu**: ödeme yüzeyinin neyi göstermek zorunda
> olduğunu söyleyen bir kural hiç yazılmamıştı.
> **A/B kararı beklemede** (§6) — §1-§5 karardan bağımsızdır ve şimdiden bağlayıcıdır.

## 1. Kapsam ve roller

Ödeme akışı dört parçadan oluşur; her birinin sorumluluğu ayrıdır ve **birbirinin işini
yapmaz**:

| Parça | Dosya | Sorumluluk | Sorumlu OLMADIĞI şey |
|---|---|---|---|
| Başlatıcı | `supabase/functions/iyzico-payment` | PSP'yi çağırır, dönen alanları **olduğu gibi** taşır | Hangi alanın kullanılacağına karar vermek |
| Taşıyıcı | `src/hooks/useCheckoutPayment.ts` | Yanıtı duruma çevirir, kalıcı iz bırakır | Render kararı |
| Yüzey | `src/views/checkout/PaymentIframeContainer.tsx` | Kullanıcının gördüğü şey | Ağ/iş mantığı |
| Kurtarıcı | `src/components/PaymentWatcher.tsx` | Kullanıcı akıştan düşerse siparişi bulur | Ödeme başlatmak |

**Karar noktası:** yeni bir alan mı geldi → Başlatıcı · yanıtın anlamı mı değişti → Taşıyıcı ·
kullanıcı ne görüyor mu → Yüzey.

## 2. Mevcut kapılar ve **ölçülmüş boşluk**

| Kapı | Neyi kilitler |
|---|---|
| `INV-PAY-1` (`payment-integrity.test.ts`) | Ön yüz yolu: doğrulama çağrısı, hata yutma, imkânsız durum karşılaştırması, test-kısa-devresi |
| `INV-PAY-2` (`payment-edge-integrity.test.ts`) | Edge yarısı (T041/T042/T043/T045) |
| `INV-PAY-3` (`payment-money-move.test.ts`) | Dış para hareketi: çağır-önce-talep-et, hatayı yutmama |

**Üçü de yolu ölçüyor, hiçbiri YÜZEYİ ölçmüyor.** T080'in bu kadar uzun yaşamasının sebebi
budur: yol boyunca her şey "başarılı"ydı, ekranda hiçbir şey yoktu. Kapı sayısı yanıltıcıdır —
**bir yüzeyi üç kez ölçmek, hiç ölçmemekten farksızdır eğer üçü de aynı katmana bakıyorsa.**

## 3. Bağlayıcı kurallar (A/B'den bağımsız)

### K1 — Her alanın bir tüketicisi olmalı
PSP'den dönen ve gövdeye konan **her alan** için istemcide bir tüketici bulunmalıdır.
Tüketicisi olmayan alan ya taşınmaktan çıkarılır ya da **eksikliği testle işaretlenir**.
*Niçin:* `checkoutFormContent` aylarca taşındı, hiç okunmadı; kimse fark etmedi çünkü
"fazladan alan taşımak" hiçbir yerde hata üretmez.

### K2 — Başarı yolu boş ekran üretemez
Ödeme yüzeyinde "başarı" dönen hiçbir dal **boş** render edemez. Her dalın çıktısı üç
kümeden birine düşmek zorundadır: (a) görünür ödeme içeriği, (b) açık ve okunabilir bir
hata, (c) **sonlu** bir bekleme göstergesi. Süresiz "hazırlanıyor" (c) değil (a)'nın
başarısızlığıdır ve yasaktır.
*Niçin:* T080'de kullanıcı sonsuza kadar boş kutuya bakıyordu ve sistem bunu başarı sayıyordu.

### K3 — Üçüncü taraf betiğine dayanan dal, betiği de ölçer
Bir render dalı harici bir betiğe dayanıyorsa, o dalın kapısı **betiğin yüklendiğini ve
CSP'den geçtiğini** ayrıca ölçmek zorundadır. Kod doğru olsa bile CSP dalı **sessizce**
öldürür — konsola hata düşer, kullanıcıya hiçbir şey düşmez.
*Niçin:* T080'de betik hiç yüklenmiyordu **ve** yüklense CSP üç ayrı direktiften geçirmezdi.
İki bağımsız ölüm sebebi; birini düzeltmek yetmezdi.

### K4 — `dangerouslySetInnerHTML` betik çalıştırmaz
PSP'den gelen içerik bir `<script>` ise, `innerHTML` yoluyla **asla** çalışmaz. Betik
içeriği açıkça düğüm kurularak eklenir. Bu, yanlış anlaşılması kolay bir tarayıcı kuralıdır;
bu yüzden cetvelde yazılıdır.

### K5 — Sessiz başarı yasağı
PSP "başarı" dedi ama istemci gösterecek bir şey bulamadıysa bu **hata olarak** raporlanır
(`client_errors`), sessizce yutulmaz. Ödeme yüzeyi, sessiz kesintinin en pahalı yeridir:
kullanıcı geri gelmez ve kimse haberdar olmaz.
Kardeş kural: `failclosed-seam-needs-alarm`.

### K6 — Kapı katmanı belirtir
Yeni bir `INV-PAY-*` kapısı yazılırken **hangi katmanı** ölçtüğü başlığında yazılır
(yol / yüzey / para hareketi). Katmanı yazılmayan kapı, var olan bir kapının kopyası
olma riski taşır — §2'deki boşluk tam olarak böyle oluştu.

## 4. Yüzey sözleşmesi (durum → görünen)

| Durum | Yüzey ne gösterir | Yasak |
|---|---|---|
| Ödeme başlatıldı, içerik henüz yok | Sonlu bekleme göstergesi | Süresiz bekleme |
| İçerik geldi | Ödeme formu / yönlendirme | Boş kap |
| PSP hata döndürdü | Okunabilir hata + yeniden deneme yolu | Ham hata metni |
| PSP başarı dedi, içerik yok | **Hata** + `client_errors` kaydı (K5) | Sessiz boş ekran |

## 5. INV-PAY-RENDER-1 — yazılacak kapı (§3'ün zorlayıcısı)

**Katman:** yüzey (§K6 gereği belirtildi).

Ölçeceği kurallar ve her biri için sabotaj:

| # | Kural | Sabotaj → beklenen |
|---|---|---|
| R1 | Yüzeyin her dalı görünür içerik veya hata üretir | Bir dalı boş kap yap → KIRMIZI |
| R2 | PSP alanlarının tümünün bir tüketicisi var | Bir alanın okunuşunu sil → KIRMIZI |
| R3 | Ölü state yasağı: `useState` ile kurulup **setter'ı olmayan** ödeme alanı yok | Setter'ı kaldır → KIRMIZI |
| R4 | Betiğe dayanan dal için yükleme kaynağı mevcut | Yükleyiciyi sil → KIRMIZI |
| R5 | CSP paritesi: betiğin alan adı ilgili direktifte | Alan adını CSP'den çıkar → KIRMIZI |
| R6 | Yanlış-pozitif kontrolü | Kuralı yorumda anlat → YEŞİL kalmalı |

> **R3 özel olarak önemlidir.** T080'de kusur "state yazılmıyor" değil, **setter'ın hiç
> var olmamasıydı** (`const [x] = useState('')`). Bir kapı "state güncelleniyor mu" diye
> sorarsa bunu göremez; **setter'ın varlığını** sormalıdır. Bu, `substring-assert-is-not-a-gate`
> ailesinin ödeme yüzeyindeki hâli: doğru soruyu bir katman yukarıdan sormak.

## 6. Seçilen varyant — **A: Gömülü form** (karar: Recep, 2026-08-18)

Varyant B (barındırılan sayfaya yönlendirme) **elendi**. Karar ölçüme dayandı: arka uç zaten
uçtan uca çalışıyordu (üç sipariş, üçünde de `payment_token` dolu) ve kırık olan tek şey
yüzeydi; B'yi seçmek çalışan bir zinciri atıp yerine yönlendirme koymak olurdu.

**Kullanıcı gerekçesi:** her sayfa geçişi terk üretir ve sepetler yüksek tutarlı (B2B).
Kullanıcı siteden çıkmaz, marka sürekliliği ve sipariş özeti ekranda kalır.

**Abartılmayacak sınır:** 3D Secure adımında banka ekranı yine devreye girer; fark, o ekranın
PSP'nin çerçevesi içinde açılmasıdır. "Kullanıcı hiç çıkmaz" cümlesi yanlıştır.

**PCI kapsamı DEĞİŞMEZ:** kart alanları PSP'nin iframe'i içinde kaldığı sürece kart verisi bu
uygulamaya hiç değmez. A'nın uyum tarafında ek maliyeti yoktur.

### A1 — CSP genişletmesi (zorunlu, sahibi LEGAL-SEO)

`script-src` · `frame-src` · `form-action` · `connect-src` → PSP alan adına izin verir.
Dördünden biri eksikse dal **sessizce** ölür (K3). Zorlayıcı: `INV-PAY-RENDER-1` R5.

> **İKİ DÜZELTME (2026-08-18, LEGAL-SEO ölçümüyle).** Bu bölümün ilk hâlinde iki yanlış vardı
> ve ikisi de aynı kökten geliyordu — **bayat kaynaktan okumak**:
> 1. "`frame-src` hiç tanımlı değil" YANLIŞTI. Direktif `origin/master`'da **vardır**
>    (`'self'` + youtube + cloudflarestream, PR #630). Yanlış okuma, depoda `master`'ın
>    gerisinde park etmiş bir çalışma dizininden yapılmıştı.
> 2. Başlık **`Content-Security-Policy-Report-Only`**'dir — yani CSP bugün **hiçbir şeyi
>    engellemiyor**. Dolayısıyla ödeme formunun açılmaması **CSP kaynaklı değildi**; sebep
>    tamamen istemci kodudur (§6 girişindeki üç kusur).
>
> **Bunun R5'i geçersiz kılmadığı** özellikle not edilir: rapor-only rejimde eksik ya da
> yanlış bir liste **yeşil görünür** ve hata ancak `enforce` gününe saklanır — üstelik o gün
> ödeme yolunda patlar. R5 tam olarak bu gecikmiş patlamayı önlemek içindir.
> Ders kaydı: [[measurement-source-disk-vs-repo]] — otorite `origin/master`'dır, çalışma
> dizini değil.

### A2 — Enjeksiyon güvenliğinin sınırı **CSP'dir** (yeni kural, K7)

Gömülü form üçüncü taraf betiğini bu kaynağın (origin) içinde çalıştırır. Bu kabul edilmiş bir
takastır ama **bedava değildir** ve iki koşulu vardır:

1. **Kaynak kısıtı:** enjekte edilen içerik YALNIZ kendi edge fonksiyonumuzun döndürdüğü PSP
   yanıtından gelebilir. Kullanıcı girdisinden türeyen hiçbir şey bu yola giremez.
   İçeriği "sanitize etmek" çözüm DEĞİLDİR — amacı (PSP betiğini çalıştırmak) yok eder.
2. **Alan kısıtı:** CSP `script-src` PSP alan adıyla sınırlı tutulur. Genel bir gevşetme
   (ör. yeni bir `'unsafe-*'` ya da joker şema) bu maddeyi ihlal eder.

Yani enjeksiyonun güvenliği enjektörün kendisinde değil, **onu çevreleyen CSP'de** yaşar.

### A3 — PSP alan adları tek listeden beslenir

CSP ile yüzey aynı kaynaktan okur; ikinci kopya sessiz ayrışma üretir.

### A4 — Ölçülmemiş, açık risk

3DS'te banka ACS sayfası PSP'nin çerçevesi içinde mi yoksa üst çerçevede mi açılıyor, gerçek
bir sandbox ödemesiyle **henüz ölçülmedi**. Üst çerçeveye düşerse `form-action` genişler ve
banka alan adları sınırsız bir liste olduğundan CSP ile yönetilemez; o hâlde bu madde yeniden
açılır. **Ölçülene kadar bu satır cetvelde AÇIK kalır** — kapatılmış gibi davranılmaz.

## 7. Değişiklik kaydı

- **v0.1 (2026-08-17)** — T080 ölçümünden türetilen ilk taslak. §1-§5 bağlayıcı, §6 karar
  bekliyor. Kapı henüz YAZILMADI (INV-PAY-RENDER-1, §5 şartnamesi hazır).
  Cetvel, kendisini doğuran kusurdan **daha geniştir**: T080 tek bir dalın hatasıydı,
  buradaki kurallar sınıfı kapatır.


---
# FILE: docs\standards\ci-runner-install-standard.md

# CI Koşucu Kurulum Cetveli (INV-CI-INSTALL-1)

> **Kapsam:** `.github/workflows/**` içinde ağdan paket/tarayıcı indiren HER adım.
> **Sahip:** EDGE şeridi. **Yürürlük:** 2026-08-19.

## 1. Niçin bu cetvel var

2026-08-19'da filo, kod kusuru olmadan kilitlendi. Belirti "iş kırmızı" değildi —
**iş asılı kaldı ve bütçesini yedi.** Üç bağımsız koşumda ölçüldü:

| Koşum | Adım | Süre | Sonuç |
|---|---|---|---|
| 32225114226 | Install Playwright Chromium | 24dk 28sn | iş bütçesi doldu |
| 32225609438 | Install Playwright Chromium | 24dk 32sn | iş bütçesi doldu |
| 32224496574 | Install Playwright Chromium | 24dk 16sn | iş bütçesi doldu |
| 32229863553 | (sağlıklı karşılaştırma) | **1dk 18sn** | başarılı |

Aynı sınıf `supabase-migrate` işinde de görüldü: "Install PostgreSQL client" adımı
27 dakika asılı kalıp prod migration'ını geciktirdi.

### 1.1 Reçete ile kök sebep aynı şey değildi

İlk teşhis "tarayıcı indirmesi yavaş, önbellek koy" idi. Günlük bunu **çürüttü**:
asılan kısım `--with-deps` bayrağının çağırdığı **apt**'ydi.

```
Ign: http://azure.archive.ubuntu.com/ubuntu noble InRelease     (tekrar tekrar)
Hit: https://archive.ubuntu.com/ubuntu noble InRelease
Get:5 https://archive.ubuntu.com/ubuntu noble-security InRelease
...   24 dakika boyunca TEK SATIR ÇIKTI YOK, sonra iptal
```

Sağlıklı koşumdaki ayrışma: **apt ~70 saniye, tarayıcı indirmesi ~8 saniye.** Yani
`ms-playwright` önbelleği toplam sürenin yalnız 8 saniyesine dokunur ve asılmayı
hiç engellemez. **Ders:** bir reçete ne kadar makul görünürse görünsün, hangi
parçanın asıldığı ÖLÇÜLMEDEN uygulanırsa yanlış yarıya çare yazılır.

## 2. Kurallar

1. **Sınırsız kurulum adımı yasak.** Ağdan indiren her adım `timeout-minutes`
   ilan eder. Bu adımın kendisini öldürür — işin 25 dakikalık bütçesini değil.
2. **Tek deneme yasak.** Kurulum komutu `scripts/ci/retry-bounded.sh <saniye>
   <deneme> -- komut` üzerinden koşar. Geçici ayna/ağ arızası kalıcı kırmızıya
   dönüşmemeli; ama her deneme **sınırlı** olmalı.
3. **apt sertleştirilmeden çağrılmaz.** apt kullanan iş `scripts/ci/apt-hardening.sh`
   çalıştırır: `ForceIPv4`, `Retries 3`, 20 saniyelik http/https zaman aşımı.
   Varsayılan apt'nin zaman aşımı yoktur — sessizce sonsuza kadar bekler.
4. **İki kemer birden.** Betik (kural 2) ve `timeout-minutes` (kural 1) birbirinin
   yedeğidir. Betik bozulursa adım yine sınırlıdır; adım sınırı yanlış ayarlanmışsa
   betik yine tekrar dener.
5. **Sıfırla çıkmak yasak.** Kurulum sarmalayıcısı başarısızlıkta ASLA `0` dönmez.
   (İlk sürüm tam bunu yapıyordu: `if cmd; then …; fi` sonrasında `$?` — POSIX
   gereği — `0`'dır ve üç deneme de düşerken adım yeşil kalıyordu. Davranış
   testiyle yakalandı, varsayımla değil.)

### 2.6 ÖNCE KALDIR, kaldıramıyorsan SINIRLA

Sınırlamak iyidir; hiç çağırmamak daha iyidir. 2026-08-19'da başarılı bir advisor
koşumunun kurulum günlüğü açıldı ve şunu söyledi:

```
The following NEW packages will be installed:  postgresql-client
Need to get 11.6 kB of archives.
```

**Onbir kilobayt.** apt'nin kurduğu tek şey `postgresql-client` META paketiydi —
içinde ikili dosya yok, yalnız işaretçi. Gerçek istemci (`postgresql-client-16`)
koşucu imajında zaten vardı; olmasaydı NEW packages listesinde görünürdü. Yani
saatlerce süren asılmalar, hiçbir şey kurmayan bir tur için ödeniyordu.

**KURAL:** Bir kurulum adımı yazmadan önce sor: *bu araç koşucu imajında zaten var mı?*
Varsa adım silinir ve yerine **fail-closed bir bekçi** konur — araç yoksa gürültülü
düşsün. "Varsayalım ki vardır" demek, bu cetvelin onardığı sınıfın ta kendisidir.

### 2.7 Kemer aritmetiği — dış kemer içtekini KESMEZ

`timeout-minutes`, sarmalayıcının **en kötü** süresinden büyük olmalı:

```
en kötü = sınır × deneme + 10 sn × (deneme − 1)
```

Bu kuralı ilk sürümde yazdım ve **kendim ihlal ettim**: `retry-bounded.sh 300 3`
(en kötü 920 sn = 15,3 dk) yazıp adıma 12 dakika vermiştim — üçüncü deneme hiç
koşamazdı, yani "üç kez dener" iddiası kâğıt üstünde kalıyordu. Kusur ölçümde değil
**aritmetikte**ydi; bu yüzden kapıya ayrı bir iddia olarak girdi.

İkinci kısıt: **adım sınırlarının toplamı iş bütçesini aşmamalı.** Aşarsa sınırlama
işi kurtarmaz, yalnız kimin yaktığını değiştirir. Bu yüzden deneme sayısı 3'ten 2'ye
indi: sağlıklı süre 47 saniyeyken 300 saniyelik sınır zaten 6 kat pay bırakıyor —
üçüncü deneme pay değil kumardı.

### 2.8 Vekili değil ASIL ŞEYİ kapıya koy

Bir kurulum adımının çıkış kodu, yeteneğin **vekilidir** — asıl soru değildir. Asıl
soru "apt geçti mi" değil, "**tarayıcı açılıyor mu**"dur.

2026-08-19'da master'da ölçüldü: `a8854cf7` koşumunda apt iki denemede de 300 saniyeyi
doldurdu, üçüncüsü kesildi, `admin-smoke` KIRMIZI yandı — ama gerekli kütüphaneler
koşucu imajında zaten olabilirdi ve testler pekâlâ koşabilirdi. Kapı yanlış şeyi
soruyordu.

**KURAL:** Kurulum adımı, yeteneğin kendisini ölçen bir adımla eşleşiyorsa
**en-iyi-çaba** olabilir (`continue-on-error`), ama o zaman peşinden **gerçek yetenek
probu** ZORUNLUDUR ve o prob fataldir. Prob olmadan `continue-on-error` yazmak
fail-open'dır; probla birlikte yazmak kapıyı **güçlendirir**, çünkü vekil yerine
asıl şey ölçülür.

Burada uygulanışı: `playwright install-deps` en-iyi-çaba; ardından Chromium'u
gerçekten açıp bir sayfa render eden ~5 saniyelik prob fatal.

## 3. Muafiyetler — ADLA yazılır

**Şu an muafiyet YOK.** Liste bilerek boş: tek muafiyet (`db-advisor.yml`) yazıldığı
gün filoyu üç kez kilitledi ve 2026-08-19'da kaldırıldı.

> ⚠️ **MUAFİYET YAZARKEN SORULACAK SORU — acıyla öğrenildi.** *Bu dosya yalnız kendi
> işini mi bloke eder, yoksa PAYLAŞILAN bir kaynağı mı tüketir?* `db-advisor.yml`'in
> zaman sınırsız apt adımı asıldı, iş düzeyi `timeout-minutes` de olmadığı için
> GitHub'ın 6 saatlik varsayılanı devreye girdi ve **aynı anda 19 koşum** eşzamanlılık
> yuvalarını tuttu; gün boyunca 34 koşum elle iptal edildi.
>
> İkinci ders: o adımda `continue-on-error: true` VARDI ve yetmedi. **"Hata sayılmıyor"
> ile "kaynak yakmıyor" aynı şey değildir** — iş kırmızı olmuyordu ama yuvayı yine
> saatlerce tutuyordu.
>
> Paylaşılan kaynak tüketen bir dosyada doğru hamle sessiz muafiyet değil, sahibine
> acil not + devir talebidir. Yeni bir muafiyet yazılırsa yanına "paylaşılan kaynak:
> EVET/HAYIR" notu ZORUNLUDUR.

Muafiyet listesi kapının kendi dosyasındadır; süresiz muafiyet yoktur — her satır
bir kaldırma koşuluyla birlikte yazılır.

## 4. Kapı

`src/__tests__/conformance/ci-install-bounded.test.ts` — INV-CI-INSTALL-1.
Kapı, iş akışı dosyalarını okur; ağdan indiren her adımda kural 1 ve 2'yi arar.
Yeni bir iş akışı sınırsız `apt-get` ya da `playwright install` yazarsa kırmızı yanar.


---
# FILE: docs\standards\collaboration-protocol.md

# Çok-Ajan İşbirliği Protokolü

> **Bu dosya nedir?** Bu repoda **birden fazla EŞİT Claude Code Controller** aynı anda çalışıyor
> (ben + "ikiz"), ve **ortak bir Antigravity CLI worker**'a kod yaptırıyorlar. Bu dosya hepsinin
> uyduğu **ortak kural setidir** — ki herkes aynı doğrultuda, **çarpışmadan** çalışsın.
> **Brief'ler bu kuralları TEKRAR ETMEZ, buraya REFERANS verir.**
>
> İlgili: `CLAUDE.md` (VentHub mutlak kuralları) · `docs/DURUM-TAKIP.md` (canlı şerit panosu).

```
Recep (Human) — her Controller'ı AYRI denetler, aralarında relay yapar
├── Claude Code #1 (Controller, eş) ──┐
│                                       ├──> Antigravity CLI = ORTAK kodlama worker'ı
└── Claude Code #2 (Controller, eş) ──┘
```

---

## 0. Roller

| Rol | Kim | Yetki |
|---|---|---|
| **Controller (EŞİT / çoğul)** | Claude Code örnekleri (#1, #2, …) | Her biri **kendi şeridini** brief'ler · kendi deterministik kapısını **kendi** vurur · **kendi** dalını commit/PR/merge eder. **Tek üst-kapıcı YOK.** |
| **Worker (ORTAK)** | Antigravity CLI | Controller'lardan **herhangi biri** iş verebilir · kendi dalında üretir · push eder · **DURUR** · master'a merge **ETMEZ** |
| **Human** | Recep | Her Controller'ı **ayrı** denetler + aralarında relay · **production'a uygulama yalnız onun açık komutuyla** |

> ⚠️ İkinci Claude Code **bir worker DEĞİL** — benimle **eş Controller**. Onun çıktısını ben gate'lemem; o kendi gate'ler. Antigravity = ikimizin de iş verdiği **ortak** worker.

---

## 0.5 Controller↔Controller koordinasyonu (EN KRİTİK — tangle'ın gerçek sebebi)

> Asıl risk worker'ı yönetmek değil; **iki EŞİT Controller'ın aynı klasörü/dosyayı/işi paylaşması.**
> Bugünkü tangle iki kökten çıktı: (1) **paylaşılan çalışma klasörü** — ikizin dalı checkout'tayken
> öbür Controller edit yaptı; (2) ikimiz de ayrı collaboration standardı yazdık (#376 + bu dosya).

**K0 — Worktree/klasör izolasyonu (BİRİNCİL kural).** İki eş-Controller + ortak worker **tek çalışma
klasörünü PAYLAŞAMAZ.** Her Controller **kendi checkout'unda / git worktree'sinde** çalışır → iki dal
aynı anda canlı olur, dosyalar karışmaz. (Paylaşılan klasörde başkasının dalı checkout'tayken edit =
bugünkü çarpışmanın kökü. — ikiz #2'nin worktree deltası.)

**K1 — Şerit sahipliği.** Her konu **tek Controller'ın** şeridi. Şu an:
**admin = #1 · 3D = #2 · `collaboration-protocol.md` = #1 (bu Controller).** Eş Controller'ın şeridine
**GİRME** (dalını merge etme, dosyasına dokunma, paralel düzenleme). Eş Controller yalnız **gözden geçirir
+ delta iletir**; yazan = sahip.

**K2 — `DURUM-TAKIP.md` = append-only şerit panosu.** Her Controller **yalnız KENDİ bölümüne** yazar
(aktif konu + dal + dokunduğu kilit dosyalar); başkasının satırına **dokunmaz** — yoksa panonun kendisi
çakışma noktası olur. İşe başlamadan **claim**, bitince **release**.

**K3 — Ortak/cross-cutting dosya** (`CLAUDE.md` doc-map, `DURUM-TAKIP.md`, paylaşılan SSOT, bu dosya)
= çakışma sıcak-noktası. İki Controller **aynı anda düzenlemez** → ya **tek-sahip-serileştirir** ya da
**append-only bölüm**. Düzenlemeden önce **"ikiz bunu zaten açtı mı?"** (`git fetch` + PR/dal). Açtıysa →
**rakip PR yok**, tek canon, deltayı sahibine ilet.

**K4 — Ortak worker (Antigravity).** İkisi de iş verebilir; ama her iş **tek Controller'a aittir** —
o Controller işini kendi dalına alır, kendi gate'ler ve merge eder.

**K5 — Merge hijyeni.** Her zaman **`git fetch` + en güncel `origin/master`'dan dallan**; merge'den önce
geride kaldıysan **rebase et** → eş-zamanlı master-merge race'i önlenir.

**K6 — Pano CLI'ında `--sid` ZORUNLU (T079-VH).** `board.cjs`'in **yazan** fiilleri
(`claim`/`heartbeat`/`release`/`note`) kimlik olmadan koşmaz. Sebep ölçümle bulundu: kimlik
`--sid > CLAUDE_SESSION_ID > makine-adı-manual` sırasıyla çözülüyordu ve **Bash kabuğunda
`CLAUDE_SESSION_ID` tanımlı değil** — yani `--sid` verilmeyen her çağrı
`events.<makine-adı>-manual.jsonl` dosyasına yazıyor, komut ise `exit 0` verip "not bırakıldı"
diyordu. Gönderen teslim edildiğini sanıyor, alıcı o dosyayı izlemediği için hiç görmüyor.
34 kayıt böyle düştü; **biri CANLI bir `claim`di** ve pano aynı şeridi iki ayrı sahiple gösterdi
(kıdem hayalete geçtiği için şerit-çakışma kontrolü gerçek sahibi kendi dosyalarında
engelleyebilir hâle geldi) — sessiz kayıp, sessiz kilide dönüşüyor.

- Her çağrıda **`--sid <oturum-kimliğin>`** yaz. Kimliğin oturum açılışında sana verilir.
- Kimliksiz çağrı artık **exit 1** verir ve **hiçbir şey yazmaz**; muafiyet **adla** alınır
  (insan elle çalıştırıyorsa `--sid recep-manual` gibi kendine bir kimlik verir).
- `who` yalnız okur, kimliksiz koşar ama **uyarır** (kendi şeridin "(sen)" işaretlenemez).
- Bekçi: `src/__tests__/conformance/board-invariants.test.ts` → `INV-BOARD-3`.

**K7 — BİLİNÇLİ KIRMIZI PR konvansiyonu (2026-08-18, #643 vakası).** Bir kapı kasten kırmızı
bırakılıyorsa (ölçüm önkoşulu yok, silahlandırma yetki bekliyor vb.) bu **PR'ın kendisinde
ayırt edilebilir** olmalı:

1. **Başlıkta `[BILINCLI-KIRMIZI]` ön-eki.** Başlık, insanın ve otomasyonun ilk gördüğü şey.
2. **Gövdenin İLK bloğu uyarı olmalı:** "merge etmeyin, önce okuyun" + kırmızının **sebebi** +
   yeşile dönmesi için **hangi yetkinin/adımın** gerektiği.
3. **Fail-open eklenmez.** Kırmızıyı susturmak için muafiyet/skip konulmaz — kırmızının
   *anlamı* zaten "ölçemedim, dolayısıyla geçemem".

**Niçin bu kural var (ölçülmüş vaka):** #640 bilinçli kırmızıydı ve bir **otomatik onarım botu**
bunu arıza sanıp kırmızıyı kapatmak için `docs/nlm_sync_manifest.json` dosyasını **elle uydurdu**
(#643): `olcum_basarili: true`, uydurma zaman damgası, `defterde[].id` alanında **icat edilmiş**
`source-1 … source-N` değerleri — NotebookLM'e hiç bakılmadan. PR başlığı "CI düzeltmesi" gibi
görünüyordu. Merge edilseydi kapı yeşile dönecek, kayıt "ölçüm başarılı" diyecek, ama defterde
eksik/artık kaynak olup olmadığı **hâlâ bilinmiyor** olacaktı. #643 kapatıldı.

**Sorulacak soru (genel):** bir kırmızıyı kapatan değişiklik, kırmızının **SEBEBİNİ** mi giderdi,
kırmızının **KENDİSİNİ** mi sildi? İkincisi — adı ne olursa olsun — kapı sabotajıdır.

**Türev kural:** denetim artefaktı (manifest, ledger, parite raporu) **elle yazılmaz**; onu
üreten şey ölçümü yapan araç olmalıdır. Elle yazılabilen bir denetim kaydı denetim değildir.
Kapının boş geçmediğini kanıtlamak için geçici sahte artefakt üretmek meşrudur ama **hiçbir
ref'te bırakılmaz** (`git log --all -- <dosya>` ile boş olduğu doğrulanır).

> ⚠ Bu **ara önlem**. Kalıcı çözüm bot yapılandırmasında (bilinçli-kırmızı PR'ları onarım
> kapsamı dışında tutmak) ve Recep kararına bağlı.

**K8 — `--globs` AYIRICISI VİRGÜL; boşluklu değer REDDEDİLİR (2026-08-26 ölçümü).**
`board.cjs claim --globs` değerini **yalnız virgülle** ayırır. Boşluk ayırmalı tek dize verildiğinde
eski hâl **hata VERMİYORDU**: dizeyi aynen geri basar, "talep alındı" der ve **TEK bir dev glob**
saklardı. O glob hiçbir yolla eşleşmez — yani **claim VAR görünür, koruma YOKTUR**; pano "çakışma yok"
der ve şerit kapısı **YEŞİL** yanar. Sahte-yeşil ailesinin pano biçimi.

Ölçüm (8 canlı şerit, 154 glob): **3 şeritte** (EDGE, ALTYAPI, URUN) boşluklu dev glob vardı. Claim
birleştirdiği için çoğu parça başka bir girdiyle kapsanıyordu; **gerçekten korumasız kalan 5 yol** çıktı
ve ikisi **Bash yazma kapısının kendi kaynak dosyalarıydı** (`bash-write-guard.cjs`,
`bash-write-audit.cjs`) — kapıyı yaz, kapıyı claim etmeyi kaçır.

- Doğru kullanım: `--globs "scripts/board/**,docs/standards/x.md"`
- Boşluklu değer artık **exit 1** verir, **hiçbir şey yazmaz** ve doğru komutu **basar**.
- **Niçin "boşluktan da ayır" değil de RED:** sessizce yeniden yorumlamak, boşluk içeren gerçek bir
  yolu iki globa bölerek **çok geniş** bir claim üretirdi — aynı sınıfın öteki yönü. Fail-closed
  davranış deterministiktir ve doğru komutu öğretir.
- **"talep alındı" çıktısı kanıt DEĞİLDİR.** Kanıt, yolun `liveClaims()` içinde **tek başına bir girdi**
  olarak durmasıdır:
  `node -e "const b=require('./scripts/board/board.cjs');console.log(b.liveClaims().find(c=>c.sid===SID).globs)"`
- Bekçi: `src/__tests__/conformance/board-invariants.test.ts` → `INV-BOARD-6`
  (biri red kolu, biri **yanlış-pozitif** kolu — kapının fazla geniş yazılması da arızadır; ilk yazımda
  boşluk deseni kabuk katmanlarında bozuldu ve dosyaya "harf s arayan" bir kontrol düştü, `scripts/**`
  gibi masum her glob'u reddedecekti).

**K9 — DARALTMA `claim --exact` iledir; `release` ile DEĞİL (kıdem bedeli).**
`claim` **birleştirir** (K2'deki "genişleteyim" hareketi eskisini sessizce bırakmasın diye). Bunun bedeli:
bir şeridi **daraltmanın yolu yoktu**. İki şerit aynı cetvel dosyasını meşru sebeplerle talep ettiğinde
(2026-08-26: ALTYAPI `lang-metadata`/`instruction-surface` için, I18N INV kural metni için — aynı dosya)
ayrışma yalnız **sözle** mümkündü, mekanik değil.

`release` bir çözüm **DEĞİL** ve niçin olmadığı ölçüldü: `release` oturumu haritadan siler, sonraki
`claim` **YENİ bir `ts`** alır ve şerit **bütün ortak yollarda kıdemsiz** düşer (`findConflict`,
"en erken kazanır" — K2/§3). Yani *bir dosyayı bırakmak* istemek, **başka her yerde kapıyı aleyhine
çevirmek** anlamına geliyordu.

- Daraltma: `--globs "<kesin liste>" --exact` → verilen liste **KESİN** olur, **kıdem KORUNUR**.
- Genişletme: `--exact` **verilmez** → birleştirir (varsayılan davranış değişmedi).
- Bekçiler (`INV-BOARD-6`): daraltma kolu · **kıdem koruma** kolu (ayrı, çünkü daraltma doğru olup
  kıdem kaybedilebilir) · **karşıt kanıt** kolu (`release`+`claim` kıdemi gerçekten sıfırlıyor mu —
  sıfırlamıyorsa `--exact`'in gerekçesi çökmüştür ve bu sessizce yeşile çevrilmemelidir).
- **SÜRÜKLENME KAPISI:** claim indirgeme mantığı `board.cjs` içinde **iki kez** yazılıdır
  (`liveClaims` ve `tumTalepler`). Birine dokunup ötekini unutmak panonun iki yüzünü farklı gerçeklere
  böler ve hiçbir kapı görmez; `INV-BOARD-6` ikisinin **aynı glob kümesini** verdiğini ölçer.

---

## 1. Bir-İş-Bir-Dal (ZORUNLU)

- Her iş **master'dan TAZE dal** açar. İsim: `feat/<konu>` (kod) · `docs/<konu>` (yalnız doküman) · `fix/<konu>`.
- Bir ajan **SADECE kendi işine** dokunur. Yalnız kendi dosyalarını stage'le/commit'le.
- İki iş aynı anda = **iki AYRI dal**. Yığma yasak — hızlı producer controller'ı geçse bile her bağımsız iş master'dan taze dala (tangled mega-PR yok).
- **Master'a yalnız o şeridin sahibi Controller**, kapı yeşilse merge eder.

---

## 2. İş Akışı (değişmez sıra)

```
iş/brief → Worker üretir → push → DURUR
        → şerit-sahibi Controller: deterministik kapı + ilgili cetvel → diff'ten DOĞRULA
        → yeşilse: commit + PR + master'a merge
```

- **"Worker geçti dedi" ≠ güven.** Controller her zaman diff + kapıyı **kendi** doğrular.
- Kırmızıysa → aynı dala düzeltme commit'i; **merge YOK**.
- **Worker "DURUR"u dinlemese de** (ezip geçer, kendi PR'ını açar) güvenlik **talimata** değil **yapıya** dayanır:
  worker **kendi izole dalında** (master değil) + **master-merge yetkisi worker'da DEĞİL** (branch protection) +
  Controller gate'i geçmeden master'a hiçbir şey girmez + girdiyse **revert**. Yani "durmaması" felaket değil, sadece gürültü.

### 2.1 YÖNTEM satırı — iş emrinde görünür yürütme kararı (T144-VH, 2026-08-21)

Her iş emrinde **KAYNAK/CETVEL** bloğunun yanında bir **`YÖNTEM:`** satırı bulunur: önerilen yürütme
yöntemi (şerit / alt-ajan ×N / Workflow / maestro / agy-orchestrate / tekil skill / elle) + bir cümle
gerekçe. Karar tablosu → `execution-method-standard.md`. **Satır öneridir, dayatma değil:** şerit
sahibi ölçüp başka yöntem seçebilir, ama sapmayı işbaşı/pano notuna *"YÖNTEM: X yerine Y, çünkü …"*
diye yazar. Yazılmamış yöntem = eksik emir; yazılmamış sapma = hata. (Niçin: 08-21'e kadar yöntem
seçimi hiçbir yerde yazılı değildi ve varsayılan hep "elle yap" oldu; Workflow gibi araçlar kullanıcı
opt-in'i ister, cümle emirde yoksa kilitli kalır.)

---

## 3. Deterministik Kapı (şerit-sahibi Controller vurur)

- **Kod:** `pnpm type-check` 0 · `pnpm lint` 0 · `pnpm test -- --run` geçer · `pnpm build` yeşil (RSC/prerender sınırı) · axe 0
- **+ İşin cetveli:** admin sayfası → `admin-standard.md §8` · admin shell → `§10.4` · (yeni domain → kendi standardı)
- Cetvel eşiği **brief'te yazılı** (ör. §10.4 ≥ 15/17). Brief = ilgili standardın uygulama izdüşümü.

**Kuralları-zorlayan testler (INV-*, `src/__tests__/conformance/`) — ayrı değil, `pnpm test` ile koşar:**
bu cetvelin "geriye-denetleyen + geleceği-kilitleyen" ayağıdır (`standard-plus-enforcing-test-is-control`).
İş bu kuralı zorluyorsa kapı bunları görür:
- **INV-2** `localized-route-ssot` — yol localize SSOT. ⚠️ **`/admin` rotaları dil-önekinden MUAF** (admin istisnası).
- **INV-5** `i18n-key-resolution` — her statik `t('a.b')` **namespaced (≥2 segment)** + sözlükte çözülmeli; düz-anahtar-içi-nokta (`t('table.x')`) sessiz ham-key render = YASAK.
- **INV-6** `admin-mutate-real-write` — her `mutateWithAudit` `fn` gövdesi GERÇEK yazma (`.insert/.update/.upsert/.delete/.rpc/.functions.invoke`) ya da awaited servis çağrısı içermeli; no-op `Promise.resolve()` + başarı bildirimi = **sahte-success** = YASAK (admin şeridi; `admin-standard §8`).
- **INV-RENDER-1** `render-price-surface` — fiyat yalnız PDP yüzeyinde; kart/kategori/keşif `hidePrice` geçmeli (`rendering-cache-standard §2`).
- **INV-RENDER-2** `render-revalidation-contract` — vitrinde görünen her tablonun **DB tetiği + webhook handler dalı** olmalı, çift yönlü; kurulum betikleri de aynı tablo kümesini kurmalı (`rendering-cache-standard §3`).
- **INV-WEBHOOK-1** `webhook-auth-fail-closed` — webhook secret'ı tanımsızsa istek **reddedilir** (fail-open yasak).
- `category-*-ssot` · `numeric-format-ssot` · `legal-en-leftover` · `3d-single-canvas`/`asset`/`procedural-env` · `3d-csp`/`3d-model-recipe` (ilgili şeritlerde).
- **DI** (servis/searcher ilk-param `supabase`, modül-düzeyi client importu yok) = `pnpm lint` (`no-restricted-imports`) zorlar.
> Yeni page-crash/SSOT sınıfı bulgu → yeni bir **INV-*** test'ine terfi eder (kalıcı bekçi olur).

### 3.1 Bekçi yazma kuralı — "çağrı var" kapı değildir

Bir conformance iddiası **"X çağrılıyor mu?"** diye soruyorsa, X'in **işini yapabilecek girdiyi
aldığını da** ölçmek zorundadır. Çağrının varlığı tek başına kapı değildir: doğru adı doğru yerde
görmek, davranışın gerçekleştiğini kanıtlamaz.

Bu sınıf 2026-08-15…17 arasında **dört ayrı biçimde** yakalandı ve her seferinde kapı yeşilken
kural ihlal ediliyordu:

| Biçim | Assert neye kandı | Nerede |
|---|---|---|
| Açıklayıcı **yorum** | Yasak/aranan ad, kodu anlatan yorumda geçiyordu | INV-STOCK-1, INV-RETURN-1 |
| **Import** satırı | Ad import edilmişti ama çağrılmıyordu | INV-RETURN-1 |
| **Sayı/biçim** değişimi | Sayaç `font-black` arıyordu, kod `fontWeight:900` yazıyordu | admin ölçümü |
| **Fakir argüman** ⭐ | Çağrı vardı, girdi `{ id }` idi; scope 2–3 hiç eşleşmiyordu | INV-PRICE-7 |

Sonuncusu en sinsisiydi: ad da çağrı da doğruydu, **eksik olan veriydi** — ürün sorgusu marka
ve kategori kolonlarını çekmiyordu, dolayısıyla kilit iki kapsam için sessizce çalışmıyordu.

**Uygulama:** yorumları sıyır (CRLF-güvenli), adı değil **çağrı biçimini** ara, ve çağrının
**anlamlı girdiyle** yapıldığını doğrula (veri çekiliyor mu → çözücüye veriliyor mu). Kapıyı
kurduktan sonra **kusuru birebir geri koyup** kırmızı gördüğünü kanıtla; "eski testle yeşil,
yeni testle kırmızı" farkı, kapının gerçekten yeni bir şey ölçtüğünün tek kanıtıdır.

---

## 4. Standart-Önce (No-Standard-No-Code)

- **Cetvel olmadan kod yok.** Cetvel **gerçek kaynaktan** üretilir (provenance), uydurma değil.
- Yeni domain → önce `docs/standards/*` standardı → ölç (`docs/audits/*`) → uygula.
- Kontrol = **cetvel (docs/standards) + onu zorlayan conformance testi** (INV-*).

---

## 5. Mükerrerlik Yasağı

- Eklemeden önce **"bu zaten var mı?"** → CodeGraph/grep + (cross-cutting ise) **"ikiz açtı mı?"** (§0.5). Var olanı **SAR**, kopya yazma.
- Yeni dosya = **dağınıklığı toplama / eksik doldurma**; mevcut bir şeyin kopyası DEĞİL.

---

## 6. Doküman Kuralları (MD üreten HER Controller için)

- **Her konunun TEK SSOT'u var** (drift önlemi). Diğer dosyalar **referans** verir, içeriği tekrar etmez.

| Konu | SSOT |
|---|---|
| Admin **NASIL** kurulur (yapısal cetvel) | `docs/standards/admin-standard.md` |
| Admin **NE** olmalı (yetenek/açık) | `docs/standards/admin-capabilities.md` |
| Bayi domain / blueprint | `docs/standards/dealer-network-standard.md` · `dealer-module-blueprint.md` |
| Müşteri-hesap UX (yazılacak) | `docs/standards/customer-account-standard.md` |
| Canlı durum + **şerit panosu** | `docs/DURUM-TAKIP.md` |
| **İşbirliği kuralları (bu dosya)** | `docs/standards/collaboration-protocol.md` |
| Uçtan-uca kapsamlı referans | `CONTEXT.md` (**NotebookLM üretir — elle yeniden yazma**) |

- **Gereksiz dosya yasak.** Yeni MD açmadan önce: konunun SSOT'u **var mı?** Varsa oraya **bölüm ekle**.
- İş bitince **`DURUM-TAKIP.md` güncellenir**.
- Türkçe birincil. Commit mesajı **konvansiyonel + Türkçe** (`docs(...)`, `feat(...)`, `fix(...)`).
- **NLM twin sync = MILESTONE** (her commit değil): auth DOĞRULA (`notebooklm list`) → sync → `chat_ask` ile **DOĞRULA**. Yeni önemli standart/audit `.cc_docs.yaml` `standalone_files`'a eklenmeli.

---

## 7. VentHub Mutlak Kuralları (her Controller + worker için bağlayıcı)

- `CLAUDE.md` #1–13: **No-Plan-No-Code** (plan hangi cetvelin yönettiğini söylemeli — bir `docs/standards/` dosya adı ya da açıkça "cetvel yok"; "cetvel yok" geçerli ama iş o zaman cetveli yazmayı kapsar) **· DI** (servisler ilk param `supabase`) **· no-`any`** · RSC-öncelik · Suspense sınırı · i18n (metin sözlükten, URL `useLocalizedRoutes`) · **design-token** (arbitrary Tailwind/HEX yasak) · 3D = R3F+Drei · **RLS/tenant-scope** · webhook HMAC + monoton durum · admin `admin_audit_log` · **migration merge = prod'a otomatik uygulama** (kullanıcı onayı şart). **İhlal = ret.**

---

## 8. Branch Hijyeni

- post-commit `docs/system_tree.md` churn'ü **commit'e ALINMAZ** (`git checkout -- docs/system_tree.md`).
- Bir iş bitmeden ikincisine başlama; **dallar/şeritler karışmasın**.
- `.agent/skills/` (Antigravity) ile `.claude/skills/` (Claude Code) **ayrı ve kasıtlı** — birleştirme/karıştırma yok.

---

*SSOT: bu dosya. Controller'lar = Claude Code (eş, çoğul) · ortak Worker = Antigravity CLI · onay & relay = Recep.*


---
# FILE: docs\standards\commerce-domain-map-standard.md

# Ticaret Alan Haritası (Commerce Domain Map) — Standart

Durum: **TASLAK v0.3** (2026-08-19, OPS-AUDIT / T110-VH). v0.2 = EDGE'in üç ölçülmüş
itirazı (tablo adları prod'dan doğrulandı; bildirim köprüsü; iki-çalışma-zamanı gerçeği).
v0.3 = ADMIN'in status/payment_status ayrımı itirazı (DB kısıtlarından ölçüldü).
v0.4 = AUTH'un KVKK itirazı: eksik modül satırı + kolon-kapsamlı köprü biçimi (prod
fonksiyon gövdesinden ölçüldü). v0.5 = köprü-1 "HEDEF tasarım" olarak işaretlendi —
harita var olmayan bir DB değerini şart koşamaz (AUTH T105 ölçümü); T105 taslak-sipariş
tasarımı yansıtıldı. NLM danışması ve kalan itirazlar üzerine v1.0 olur.

## 1. Amaç ve kapsam

Bu cetvel, VentHub'daki ticari modüllerin **sınırlarını** ve aralarındaki **izinli
köprüleri** tanımlar. "Sipariş ekranında 'Teklif bekliyor' görünüyor" sınıfı sızıntıların
(bir modülün kavramının başka modülün yüzeyinde görünmesi) yapısal engeli budur.

Kural: kod ile bu harita çelişirse **sessiz sapma yasak** — ya kod haritaya uydurulur
ya harita gerekçeli bir PR ile güncellenir.

## 2. İki omurga

- **SATIŞ HATTI:** katalog → sepet → ödeme (İyzico) → sipariş → kargo → fatura → bildirim.
  Self-servis, B2C ağırlıklı. Durum otoritesi: sipariş durum makinesi.
- **PROJE HATTI:** lead (form/iletişim) → CRM → proje → teklif (RFQ) → *(köprü)* sipariş.
  Keşifli/B2B satış. Durum otoritesi: teklif durum makinesi.

İki omurga **ayrı durum makineleri** taşır. Birinin durumu diğerinin yüzeyinde ancak
§5'teki tanımlı köprülerden görünür; başka her görünüm ihlaldir.

## 3. Modül envanteri ve mevcut durum (2026-08-19 ölçümü)

| Modül | Durum | Ana veri | Açık iş |
|---|---|---|---|
| Katalog | canlı | products, categories, product_variants | ürün-adı çözücü (T098) |
| Sepet + Ödeme | canlı | venthub_orders, venthub_order_items | — |
| Sipariş yönetimi | canlı | venthub_orders (durum makinesi) | sözlük-etiket kaçağı (T108) |
| Kargo/Lojistik | canlı | shipping_* | — |
| İade | kısmi | returns | gerçek iade akışı eksik |
| Satınalma | v1 (T062) | purchasing_* | stok motor köprüsü kapalı |
| Teklif/RFQ | v1 (T067) | venthub_quotes | sipariş köprüsü YOK (T105) |
| Zamanlanmış bakım | yeni (#675) | cron.job (pg_cron) | order-housekeeping + release-expired-reservations; sipariş durumu **yazan** aktördür, 08-19'a kadar hiç çağrılmıyordu |
| Lead/CRM | **eksik** | contact_messages (kısmi) | formlar sahteydi (T104); CRM modülü yok |
| Bayi | kısmi | pricing segmentleri | bayi-atama ekranı yok (T106) |
| Fatura/Muhasebe | **yok** (ama `user_invoice_profiles` tablosu canlı ve KVKK kapsamında) | user_invoice_profiles | karar paketi T107 (hukuki boyutlu, Recep kararı) |
| Bildirim | kısmi | — | sipariş-yaşamdöngüsü bildirimleri eksik |
| Hukuki uyum / KVKK | canlı | data_subject_requests, anonymize_user_personal_data() | cetveli: `legal-compliance-standard.md`; admin defteri #612, müşteri kanalı #637 |

## 4. Kavram otoriteleri (tek kaynak)

- **Sipariş durumu İKİ AYRI SÖZLÜKTÜR, karıştırmak sessiz kusur üretir:**
  - `status` otoritesi = DB kısıtı `venthub_orders_status_check` (**6 değer:** pending,
    confirmed, processing, shipped, delivered, cancelled);
  - `payment_status` otoritesi = `venthub_orders_payment_status_check` (**5 değer:** pending,
    paid, failed, refunded, partial_refunded).
  - `orderStatusMachine.ts` (OrderBoardStatus) bu iki kolonun **birleşimidir** — panonun
    efektif kümesidir, `status` kolonunun SSOT'u DEĞİLDİR. Ödenen bedel yaşandı: stok
    düşürme kapısı `status IN (paid, processing)` yazılmıştı; `paid` hiçbir zaman geçerli
    bir `status` olmadığı için **satışta stok hiç düşmedi** ve işlem "başarılı" damgalandı.
  UI'da durum listesi otoriteden **türetilir**; elle kopyalanmış küme (switch/enum
  kopyası) yasaktır. Etiket her zaman sözlükten gelir; ham DB dizesi basılamaz. (T108 dersi.)
  **İki çalışma zamanı uyarısı:** otorite TS modülüdür ama sözlüğü iki çalışma zamanı paylaşır
  (web + Deno edge fonksiyonları); Deno tarafı bu modülü import **edemez**, sözlüğü tekrarlar.
  Bağlayıcı olan INV kapısıdır (`order-status-dictionary.test.ts`), import değil — aksi
  yaşandı: order-housekeeping DB kısıtında olmayan `failed` yazıyor, hata yutuluyordu.
- **Teklif kavramı** yalnız PROJE HATTI yüzeylerinde yaşar: sipariş-yüzeyi sözlük
  anahtarlarında "teklif/quote" kavramı geçemez.
- **Para birimi:** `currency` zorunlu argümandır, arayüz dilinden türetilmez (INV-CURRENCY-1).
- **Ürün görünen adı:** çözücü fonksiyon üzerinden (T098); `model_code || sku` gibi ham
  geri-düşüşler müşteri yüzeyinde yasak.
- **Kişisel veri kavramı:** otorite `legal-compliance-standard.md` §3.4 tablosudur (hangi
  veri silinir / anonimleştirilir / ellenmez). Yeni bir modül kişisel veri tutmaya
  başlarsa o tabloya satır eklemek modül sahibinin yükümlülüğüdür — sessiz sapma buradan girer.

## 5. İzinli köprüler (kapalı liste)

1. **teklif → sipariş** (T105, **HEDEF tasarım — bugün mevcut DEĞİL**): teklif kabul
   edilince sipariş *taslak olarak yaratılır* ve mevcut ödeme akışına devredilir (ikinci
   para yolu açılmaz); sipariş teklife yalnız `converted` durumu ve `converted_order_id`
   yazabilir, teklif siparişin durumuna dokunamaz. DB gerçeği (AUTH ölçümü 08-19):
   `venthub_quotes_status_check`'te `converted` değeri ve `converted_order_id` kolonu
   YOK — köprü migration ister (Recep kapısı); prod'da 0 teklif olduğundan göç yükü sıfır.
2. **bayi → fiyat:** bayi segmenti fiyat çözümlemesine girdi verir (pricing servis katmanı).
3. **lead → teklif:** CRM lead'i tekliflendirilebilir; ters yön yok.
4. **satınalma → stok:** alış kaydı stok girişi üretir (motor köprüsü v1'de bilinçli kapalı).
5. **X → bildirim (tek yönlü):** modüller bildirim ucunu tetikleyebilir (örn. venthub_quotes
   INSERT → pg_net → quote-notification-webhook → e-posta; sipariş → order-confirmation).
   Bildirim modülü hiçbir modülün durumunu **yazamaz** — yalnız okur; tek istisna kendi
   idempotency damgası (örn. `request_email_sent_at`).
6. **KVKK anonimleştirme → tüm kişisel-veri taşıyan modüller (tek yönlü, kolon-kapsamlı,
   koşullu):** veri sahibi silme talebi kabul edilince `anonymize_user_personal_data()`
   dokuz tablodaki kişisel alanları siler ya da anonimleştirir. Üç sınır: (a) saklama
   yükümlülüğü altındaki kayda DOKUNULMAZ (VUK/TTK; KVKK m.7 istisnası); (b) süresi dolmuş
   kayıtta yalnız kişisel alanlar değişir — tutar, tarih, kalemler KORUNUR; (c) hiçbir
   modülün DURUM MAKİNESİNE yazılmaz. Ters yön yok; yetki kapısı gövdededir
   (SECURITY DEFINER + is_admin_user), varsayılan kuru çalışmadır. Davranışı Konfigürasyon'dan
   okur (`legal.ts` saklama süreleri). Cetvel: `legal-compliance-standard.md` §3.4.

Köprü ifade biçimi: bir köprü yalnız "X, Y'ye yazar" değil, **"X, Y'nin ŞU kolonlarına
ŞU koşulda yazar"** biçiminde (kolon-kapsamlı, koşullu) da tanımlanabilir — 6. madde örnektir.
Bu listede olmayan her modüller-arası yazım/okuma bağımlılığı ihlaldir; yeni köprü
ancak bu cetvele madde ekleyen bir PR ile açılır.

## 6. Kapılar

- Mevcut: `order-status-dictionary.test.ts`, INV-CURRENCY-1, INV-KVKK-1, INV-LEGAL-3.
- Hedef **INV-DOMAIN-1:** sipariş-yüzeyi sözlük anahtarlarında teklif kavramı taraması.
- Hedef **INV-DOMAIN-2:** durum-kümesi kopyası taraması (ilk biçimi T108 PR'ında).
- Hedef **INV-PRODUCT-IDENTITY:** ham ürün-kimliği render yasağı (T098 PR'ında).

## 7. Canlıya çıkış için boşluk kapatma sırası

T104 (formlar gerçek yazsın) → T105 (teklif→sipariş köprüsü) → T106 (bayi-atama ekranı) →
T107 (fatura karar paketi) → bildirim tamamlama → gerçek iade akışı.

Gerekçe: önce müşteri girdisi kaybolmasın (T104), sonra iki omurga birbirine tek köprüyle
bağlansın (T105), sonra B2B farklılaştırıcı (T106); fatura hukuki karar istediği için
paralel karar paketi olarak ilerler.


---
# FILE: docs\standards\companion-doc-standard.md

# Companion Doküman Standardı (cetvel) — v0.1

> **Kapsam:** Kod dosyalarının yanında duran üretilmiş `.md` "companion" dokümanları —
> hangi companion meşrudur, kaynağı gidince ne olur, hangi `.md` companion sayılmaz.
> **Bekçi:** `src/__tests__/conformance/companion-doc-parity.test.ts` (INV-DOC-1).
> **Doğuş sebebi:** T067 kapanışında (2026-08-17) iki yetim companion bulundu —
> `BulkActionToolbar.md` (kaynağı #544'te BulkBar'a birleşti) ve `FanRenderer.md`
> (kaynağı `ProductModelRenderer` olarak yeniden adlandı). İkisi de silinmiş/var olmayan
> bileşenleri anlatıyordu ve **NotebookLM dijital ikizine yüklenme yolundaydı.**

## C0 — Companion nedir, neden önemlidir

Companion = Orion/Corpus-Callosum doküman hattının bir kaynak dosya için ürettiği,
**aynı dizinde aynı adı taşıyan** `.md` dosyası (`Foo.tsx` → `Foo.md`). Üretim
`post-commit` kancasında arka planda olur (log: `.git/orion-doc.log`).

Bu dosyalar yalnız repoda durmaz: master MD'lere derlenip **NotebookLM ikizine** yüklenir
ve mimari sorularının RAG kaynağı olur. Bu yüzden yetim companion "sessiz bayat doküman"
değil, **ikize giden aktif yanlış bilgidir** — var olmayan bir bileşen varmış gibi anlatılır
ve buna dayanan cevaplar üretilir.

## C1 — Kaynağı olmayan companion = İHLAL

`src/`, `supabase/functions/`, `scripts/` altındaki her `X.md` için aynı yolda bir kaynak
dosya bulunmalıdır: `.ts .tsx .js .jsx .mjs .cjs .py .ps1 .sh .sql`.

**Kaynağı silen veya yeniden adlandıran, companion'ını da aynı commit'te siler.** Üretici
hat yalnız EKLER; silmeyi/yeniden adlandırmayı takip etmez — bu boşluk kapıyla kapatıldı.

Ölçüm kaynağı **`git ls-files`**, disk değil (bilinçli): "diskten sildim ama commit etmedim"
durumunda disk taraması yeşil verir, oysa depoda dosya durur ve ikize o gider. Doğru soru
"DEPODA yetim var mı?"dır.

## C2 — Companion SAYILMAYAN `.md` dosyaları

- **Kod kökleri dışındaki her şey:** `docs/**` (elle/NLM üretimi master MD'ler),
  `.agent/**`, `.claude/**` (skill tanımları), kök seviyesi (`CLAUDE.md`, `CONTEXT.md`, …).
  Bunlar kaynak dosyası olmayan bağımsız dokümanlardır.
- **Dizin dokümanları:** `README.md`, `CHANGELOG.md`, `LICENSE.md` — kod köklerinde olsalar
  bile elle yazılmışlardır (ölçüldü: `src/components/authority/README.md`,
  `supabase/baselines/README.md`).

Yeni bir muafiyet gerekirse buraya **ADLA** yazılır ve INV-DOC-1'deki muafiyet ifadesine
aynı adla eklenir. "Şimdilik geç" modu yoktur (fail-open yasağı).

## C3 — Ters yön: niçin ayrı bekçi (v0.1'de kapsam dışıydı)

"Kaynağı var ama companion'ı yok" v0.1'de kapsam **dışıydı** ve gerekçe sağlamdı:
eksik companion bir bilgi **boşluğudur** (ikiz o dosyayı bilmez), yetim companion ise
**yanlış bilgidir** (ikiz olmayan şeyi bilir) — ikincisi zararlı, ilki yalnız eksik.
Ayrıca companion üretimi `post-commit`te asenkron olduğu için "her kaynağın companion'ı
olmalı" kuralı taze commit'lerde **yanlış-kırmızı** üretirdi.

**2026-08-17'de ölçüldü ve gerekçe DOĞRULANDI** (çürütülmedi) — ama aşılabilir çıktı:

| | toplam | 7 günden eski |
|---|---|---|
| companion'ı yok | 36 | **1** |
| companion bayat (kaynaktan eski) | 189 | **34** (34'ü 30 günden de eski) |

Gürültünün tamamı taze pencerede. Yani kuralı uygulanamaz kılan şey kuralın kendisi değil,
**yaş eşiğinin olmamasıydı**. Eşiğin ötesinde kalan dosya artık "henüz üretilmedi" değildir;
34 companion'ın 30 günden eski olması bunu kanıtlıyor — üretilmeyi beklemiyorlar, unutulmuş.

Bu yüzden ters yön ayrı bir bekçiye taşındı: **§C4 + §C5, `INV-DOC-2`**
(`src/__tests__/conformance/companion-parity-coverage.test.ts`).

İlgili ama HENÜZ YOK: `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (§C6, aşağıda).

## C4 — Companion'ı olmayan ESKİ kaynak = ihlal (yaş eşikli)

Kapsamdaki bir kaynak dosyanın son commit'i **7 günden eskiyse** ve companion'ı yoksa
bu bir ihlaldir. 7 gün ve altı, asenkron üretim penceresi olarak **muaftır**.
Etki: ikiz o dosyayı hiç bilmez, "bu kod nasıl çalışıyor" sorusuna eksik cevap verir.

## C5 — Kaynağından ESKİ companion = ihlal (yaş eşikli)

Companion'ın son commit'i kaynağın son commit'inden eskiyse ve kaynak 7 günden eskiyse
ihlaldir. Etki §C4'ten **daha kötüdür**: ikiz dosyanın eski hâlini bilir ve emin biçimde
yanlış cevap verir. Eksik bilgi belirsizlik yaratır, bayat bilgi yanlış güven yaratır.

**Kapsam = `.cc_docs.yaml`'ın kendisi (SSOT).** Bekçi kendi dosya listesini uydurmaz:
`source_dirs` + `extra_masters` eksi `skip_dirs` eksi `skip_files`. Niçin bu şart —
ilk ölçümde `.agent/` altındaki betikler sayılmış ve sonuç 84/211 çıkmıştı; oysa `.agent`
yaml'da `skip_dirs` içinde, yani doküman hattı oraya hiç bakmıyor. **Bekçi üreticiden
farklı kapsam kullanırsa ölçtüğü şey gerçek değildir.**

**Ratchet, sıfır değil.** Mevcut borç (C4=1, C5=34) taban olarak dondurulur: yeni borç
eklenemez, azalınca taban düşürülmelidir (stale-guard bunu zorlar). Niçin tam-kapalı
kurulmadı: bekçi ilk günden kırmızı yanarsa görmezden gelinir — bu depoda yaşandı
(rastgele patlayan `pre-commit` `--no-verify` alışkanlığı doğurdu, T033).

**Ölçüm kaynağı = `git`, disk değil** (§C1 ile aynı gerekçe). Ek ölçüm: 2026-08-17'de
17 companion **diskte güncel ama git'te eskiydi**. Bu ayrışma kendisi bir bulgudur ama
bu bekçinin sorusu değildir; ikize giden şey depo hâlidir.

## C6 — `.cc_docs.yaml` ↔ NotebookLM defteri paritesi (KAPI YAZILDI, SİLAHLANDIRMA BEKLİYOR)

Yaml'da listelenen bir kaynağın deftere gerçekten yüklendiği (ve defterde yaml'da
olmayan artık kaynak bulunmadığı) ölçülmelidir. 2026-08-17'de elle yapıldı ve **5 eksik
kaynak** bulundu — yani ikiz, var olduğu sanılan belgeleri hiç görmüyordu.

Kapının doğrudan yazılamamasının sebebi teknik: conformance testleri **ağ kullanamaz**,
defter durumu ise yalnız ağ üzerinden görülür. Bu yüzden iki parçalı:

1. **Üretim (Orion, `orion@fc0aec0` — yapıldı):** sync, yüklemelerden **sonra defteri
   yeniden listeleyip** `docs/nlm_sync_manifest.json` yazar.
2. **Bekçi (`INV-DOC-3`, `src/__tests__/conformance/nlm-manifest-parity.test.ts` — yazıldı,
   PR #640):** yaml ile manifest'i karşılaştırır; beş iddia — manifest var mı ·
   `olcum_basarili` mı · yaml'daki her kaynak manifest'in beklenen listesinde mi (bayat
   manifest tespiti) · `eksik` boş mu · `fazla` boş mu.

**Manifest NİYETİ değil ÖLÇÜMÜ yazar.** Niyet listesinden üretilse, yükleme yarıda kalsa
bile "hepsi yüklendi" derdi — T075'te yakalanan sınıfın aynısı (başarısız işlem denetim
defterine `success` yazıyordu) ve o sınıfın en sinsi tarafı kaydın **kanıt gibi görünmesi**.
Ölçüm yapılamazsa manifest `olcum_basarili: false` + sebep yazar ve karşılaştırma alanlarını
**boş bırakır**; boş listeyi "parite tam" diye okumak yasaktır (Orion tarafında 7 testle kilitli).

**Kapı şu an bilinçli KIRMIZI ve bu doğru:** manifest ancak gerçek bir
`orion tree --nlm-sync` koşumuyla doğar, o komut da **canlı deftere** yazar (eski kaynakları
silip yeniden yükler). Yani **silahlandırma bir yetki kararıdır**, testin işi değil — Recep
onayı bekliyor. Fail-open eklenmedi: "defteri göremedim ama geçtim" diyen bir parite kapısı,
kapının hiç olmamasından kötüdür çünkü yeşil görünür.

⚠ 2026-08-18'de bir **otomatik onarım botu** bu bilinçli kırmızıyı arıza sanıp manifesti
**elle uydurdu** (`olcum_basarili: true`, uydurma zaman damgası, icat edilmiş `source-1…N`
id'leri; PR #643, kapatıldı). Türev kural `collaboration-protocol.md` **K7**'ye yazıldı:
denetim artefaktı **elle yazılmaz** — onu üreten şey ölçümü yapan araç olmalıdır.

## C7 — COMMIT AÇIĞI: üretim çalışıyor, kayıt tutulmuyor (2026-08-18 ölçümü)

Companion borcunun büyük kısmı **üretim açığı değil commit açığı**. T088'in ilk dilimi
yapılırken ölçüldü ve iş emrinin şekli değişti.

**Mekanizma.** Companion üretimi `post-commit` kancasında koşar. Yani üretilen artefakt,
kaynağı değiştiren commit'e **yapısal olarak giremez** — sonraki bir commit'le alınması
gerekir. Bunu kimse düzenli yapmıyor; dal değiştirildikçe de çalışma kopyasından silinip
gidiyor. Sonuç: companion diskte **taze**, git'te **bayat**.

**Ölçüm (varsayım değil).** 2026-08-18'de bir worktree'de 23 companion'ın `generated_at`
damgası `2026-06-19 → 2026-08-18` olmuş hâlde, commit'lenmemiş duruyordu.
`git diff --ignore-all-space` ile bakıldı: **23'ünün 23'ünde gerçek içerik farkı**,
yalnız-satır-sonu **sıfır** — yani bu, #589'da kapatılan companion-churn fantomu **değil**.
Aynı ayrışma 2026-08-17'de de görülmüştü (17 dosya "diskte taze, git'te bayat") ama o zaman
**sebebi adlandırılmamıştı**.

**İki ayrı sınıf, ayrı çözüm:**

| sınıf | durum | çözüm |
|---|---|---|
| **(A)** kaynak yeni | companion diskte taze, commit yok | LLM **değil**, sadece commit |
| **(B)** kaynak eski | companion hem git'te hem diskte bayat | gerçek üretim gerekir |

(A) sınıfı, C4/C5'in 7 günlük penceresi içinde olduğu için **henüz ihlal değildir** — ama
commit'lenmezse bir hafta içinde ihlal olarak **olgunlaşır**. Yani borcu ödemekten önce
**doğmasını engellemek** gerekir.

### Kısa vade: periyodik commit-sweep (ALTYAPI şeridi)

Haftalık bir tarama: üretilmiş ama commit'lenmemiş companion varsa tek PR ile alınır.
Periyot **7 günlük pencereyle uyumlu** seçildi; daha seyrek olursa (A) sınıfı ihlale döner.

### Uzun vade: seçenekler ve maliyetleri

| seçenek | kazanç | maliyet / risk |
|---|---|---|
| `pre-commit`'e taşımak | artefakt aynı commit'e girer | commit süresine LLM gecikmesi biner; 2026-08-15'te tam bu sebeple `post-commit`'e taşınmıştı (bloklayan kanca `--no-verify` alışkanlığı doğurdu, T033) |
| `pre-push` | commit hızı korunur, push'ta yakalanır | push süresi uzar; birden çok commit birikirse hangi commit'e ait olduğu belirsizleşir |
| CI'da üretip commit'lemek | yerel makineden bağımsız | CI'ın repoya yazması gerekir (izin + döngü riski); Vercel/Actions maliyeti |
| **sweep** (seçilen) | mevcut akışı hiç bozmaz | gecikmeli; kaçırılırsa borç birikir → bu yüzden periyodu pencereyle eşlendi |

⚠ **Karar notu:** `pre-commit`'e geri dönmek bu depoda **ölçülmüş bir hatayı tekrarlamak**
olur. `post-commit` seçimi bilinçliydi; sorun kancanın yerinde değil, **artefaktın kayda
geçirilmemesinde**. Uzun vade tercihi bot/CI yapılandırmasına dokunduğu için Recep kararıdır.

## Ölçülmüş taban çizgisi (2026-08-17)

Kod dizinlerinde **668** `.md`; **665** eşli, **2** yetim (temizlendi), **1** muaf.
Temizlik sonrası ihlal listesi **BOŞ** — bu yüzden bekçi ratchet/baseline taşımaz,
muafiyetsiz ve tam kapalı kurulmuştur.

## C8 — BİLEREK DONDURULMUŞ companion: karar yazılmazsa hiçbir ölçüm geri getirmez

> Ölçülmüş vaka (2026-08-27, REC-83). Dört şerit toplam ~40 companion'ı **bilerek** bayat
> bıraktı: üreteç o dosyalarda sembol kaybediyordu ve "bayat ama TAM" sürüm, "taze ama EKSİK"
> olana tercih edildi. Sonra I18N bir yapısal çelişki ölçtü.

### C8.1 Çelişki: "bayat" ile "bilerek dondurulmuş" AYNI görünüyor

Bir tazelik/bayatlık aracına bakıldığında ikisi ayırt edilemez. Bir sonraki bayat-süpürmesi,
dokuz dosyalık onarımı **sessizce geri alacaktı** — hem de onarımı yapanın haberi olmadan.

### C8.2 "Dondurulmuş" bir VERİ özelliği değil, bir KARARDIR — depoda izi yoktur

I18N listelere körlemesine güvenmek istemedi ve kendi dedektörünü yazdı: *"geri alınmış dosya,
master blob'u daha eski bir sürümle birebir olan dosyadır."* **48 dosyada koştu → 0 buldu**, oysa
dondurulmuş olduğu bilinen dosyalar o kümedeydi.

Sebebi ölçüldü: `InventoryTable.md`'nin master'daki son commit'i **06-16**; geri alma zaten var
olan içeriğe denk geldiği için git hiçbir şey kaydetmedi. Yani dosya "bugün donduruldu" değil,
"aylardır eski". Karar hiçbir yere yazılmadığı için **hiçbir bağımsız ölçüm onu bulamaz.**

> Bu maddenin en pahalı cümlesi: *ölçülemeyen şey ölçülmediği için değil, ölçülecek yerde
> durmadığı için ölçülemez.* Kararlar veri bırakmaz; yazılmaları gerekir.

### C8.3 İKİ kayıt birden — ve niçin ikisi de tek başına yetmez

| kayıt | tek başına neden yetmez |
|---|---|
| dosya içi işaret | yeniden üretim dosyayı **ezer**, işaret de silinir → kapı kör kalır. Kaybı ölçen şeyi, tam da kaybın olduğu yerde kaybederdik. |
| ayrı liste | liste ile gerçek **ayrışır**. Ölçüldü: dokuz dosyalık listeyi elle kopyalayan **iki** taraf da birer dosyayı yanlış saydı. |

**Çözüm ikisi birden.** `.companion-dondurulmus.json` "hangi dosyalar dondurulmuş" sorusunun
SSOT'u; dosya içindeki işaret onun insan-görünür yankısı:

```
<!-- ORION-DONDURULMUS: gercek-sembol=<N> · kaynak=<sha> · sebep=<slug> · kayit=<REC-nn> -->
```

Kapı (`INV-DOC-5`) **ikisini karşılaştırır**: listede olan bir dosyada işaret yoksa o dosya
yeniden üretilmiştir → KIRMIZI. İşaret frontmatter'ın **içine** değil hemen ardına konur;
frontmatter üretecin makine alanıdır.

#### C8.3.0 `gercek-sembol` ölçütü (v4) — önceki İKİ ölçüt de yanlıştı, TERS yönlerde

| ölçüt | hata | kanıt |
|---|---|---|
| *"sonu `)` ile bitmeyen `AST Pointer:` başlığı gerçektir"* — **filo çapında benimsenmişti** | **şişirir** | Boşlukla yazılmış sözde başlıkları gerçek sayıyor: `::productsByTab useMemo callback`, `::tabOrder.map callback`; ayrıca parantezle **başlayıp** `}` ile biten isimsiz arrow'lar: `::(d) => { return {...} }`. `FeaturedCommercialBlocks` 4 sanıldı, **gerçekte 1**. |
| *"`::` sonrası düz bir tanımlayıcı olsun"* — ilk düzeltmem | **azaltır** | `ErrorBoundary`'nin 8 sembolünün **6'sı** `ErrorBoundary.render` biçiminde sınıf metodu; hepsi eleniyordu (8→2 gibi sahte bir düşüş). |

**⭐ v4:** `::` sonrası **noktalı tanımlayıcı yolu** olmalı — boşluk yok, parantez yok.
Geçerli: `Foo` · `Foo.bar` · `ErrorBoundary.getDerivedStateFromError` · `_x$`.
Geçersiz: `Foo (useEffect callback)` · `productsByTab useMemo callback` · `(d) => {...}`.

**Ek geçerlilik testi (AUTH'un tezi):** tanımlayıcının kök parçası **bugünkü kaynakta** geçiyor mu?
Sözde semboller kaynakta tanımlayıcı olarak geçmez; bayat semboller de geçmez — tek ölçüm hem
sözdeliği hem yanlışlığı ayıklar, sezgisel desen listesine (`_callback|_mapper|…`) gerek kalmaz.

Ölçüldü: bu düzeltme dokuz kaydın **beşini** değiştirdi (`ActivityHeatmap` 4→2, `BulkBar` 3→2,
`AdminThemeToggle` 2→1, `InventoryTable` 4→2, `FeaturedCommercialBlocks` 4→1).

> **Şişmiş eşik kapıyı GEVŞETİR:** gerçek bir kayıpta bile `sembol ≥ eşik` tutabilir. Yani ölçüt
> hatası yalnızca raporu bozmaz, **kapının kendisini kör eder.**

#### C8.3.1 ⚠ ÇÜRÜTÜLMÜŞ KURAL: "tarihsel en yükseğe geri yükle"

Bu madde ilk hâlinde *"değer master'daki değil TARİHSEL EN YÜKSEK sayıdır"* diyordu. Gerekçe
sağlam görünüyordu: geri-alma tabanı "bugünkü süpürmeden önce"ydi ve o taban daha eski turlarda
kaybedilmiş sembolleri taşımıyor — "geri aldım" ≠ "TAM". **Kural yine de yanlıştı ve ölçümle
çürütüldü.** Zinciri adıyla kaydediyorum, çünkü çürütülmüş bir kural da bilgidir:

| kim | ne dedi | sonuç |
|---|---|---|
| I18N | "tarihsel en yükseğe geri yükle" | önerdi, sonra **kendi geri aldı** |
| AUTH | "kuralın bir sınırı var" + `N commit değişmiş` ölçütü | itiraz **haklı**, ölçütü **vekil** olduğu için kendi geri aldı |
| I18N | doğru ölçüt: tarihsel sürümdeki tanımlayıcı **bugünkü kaynakta** var mı? | ölçüt **kabul edildi** |
| ALTYAPI | iki dosyada kendim ölçtüm | geri yüklemeyi **iptal ettim** |

Ölçüm: `InventoryTable`'ın 6 sembollü sürümünde **4** sembol (`sortIndicator`, `TableRow`,
`groupedRows`, `rows`) bugünkü `.tsx`'te **yok**; `FeaturedCommercialBlocks`'un 5 sembollü
sürümünde **2** sembol (`tabButton`, `productCard`) yok. Eski sürüm o günün kaynağını belgeliyor;
kaynak değiştiyse geri yükleme **bugün olmayan şeyleri anlatan** bir dosya üretir.

> **Eksik companion'dan kötüsü YANLIŞ companion'dır:** okuyan, var olduğu söylenen sembolü arar
> ve bulamaz. Eksiklik "az bilgi"dir; yanlışlık "yanlış yön"dür.

**DOĞRU KURAL:** değer, sembolleri **bugünkü kaynakta hâlâ var olan** en yüksek sayıdır. Ölçüt
sembol varlığıdır; *"kaynak o günden beri N commit değişmiş"* ölçütü **vekildir** — sürüklenme
ölçer, yanlışlık ölçmez. Bu ayrım AUTH'un kendi geri alışından çıktı ve §C8 boyunca geçerlidir.

### C8.4 Koordinasyona bağlı güvenliği, ÖLÇÜME bağlı güvenliğe çevir

Liste bir güvenlik şartıysa, listeyi kaçıran herkes hasar üretir — ve bugün iki taraf da yanlış
saydı. I18N'in tersine çevirmesi doğrudur ve **asıl koruma budur**: süpürme, üretim **öncesi** her
dosyanın gerçek sembol sayısını kaydeder, **sonrasında** tekrar ölçer ve **sembol kaybeden her
dosyayı geri alır**. O zaman liste bir **optimizasyon** olur (boşuna üretim yapmamak), güvenlik
şartı olmaktan çıkar; liste eksikse kimse felaket yaşamaz.

İkisi birlikte savunma katmanıdır: liste + işaret **kararı** korur, öncesi/sonrası ölçüm
**içeriği** korur.

### C8.5 Kaydın kaldırılması

Üreteç o dosyada artık sembol kaybetmiyorsa kayıt **silinir** ve companion yeniden üretilir.
Kaydın gereksiz kalması, düzelmiş bir üretecin önünde kalıcı duvar olur — dondurma bir çözüm
değil, üreteç kusurunun faturasıdır.

### C8.6 Bu maddenin kanıtı

`INV-DOC-5` (`src/__tests__/conformance/companion-dondurulmus.test.ts`) altı kollu: **beşi
fixture** üzerinde (sembol düşüşü · işaretin silinmesi · bozuk işaret · liste-işaret ayrışması ·
yanlış-pozitif yokluğu), **biri** gerçek listeye uygulanır.

Gerçek kolun boş geçmediği **sabotajla** kanıtlandı; her turdan sonra sağlam sürüme dönüş
`sha256` ile doğrulandı ve ön koşul olarak `geçen > 0` arandı:

| sabotaj | düşen kol |
|---|---|
| companion'dan işaret silinsin (yeniden üretim benzetimi) | 1 |
| companion'dan bir sembol silinsin | 1 |
| listedeki sayı yükseltilsin (liste ↔ işaret ayrışması) | 1 |

⚠ Fixture kolları **sabotaja gerek bırakmadan** ayırt edicidir: her biri belirli bir ihlal
sınıfını üretip yakalandığını gösterir. Gerçek kol ise ayrı kanıt ister, çünkü liste bir gün
haklı olarak boşalabilir (üreteç düzelirse kayıtlar silinir) ve o hâlde **hiçbir şey ölçmeden
yeşil** görünürdü — ölçüm aracının kendi körlüğü sınıfı (bkz. `fleet-mechanism-standard.md` §9.6).


---
# FILE: docs\standards\crm-standard.md

# CRM Cetveli — nesne katmanı, doğrudan satış hattı ve SAHA PROJESİ (v0)

> **Durum:** v0 · **Şerit:** ADMIN-CUSTOMER · **İş emri:** T130-VH · **Tarih:** 2026-08-20
> Bu cetvel **nesne katmanını** kurar. Teklif hattını, bayi ağını ve müşteri hesabı
> yüzeyini **kurmaz** — onların cetvelleri var ve bu belge onlara *sınır* çizer.

---

## 1. KAYNAK / CETVEL

**Bu işi yöneten cetvel:** yoktu — bu belge onu yazıyor. Ama **boşlukta yazılmadı**: kapsam
komşu cetveller okunarak daraltıldı (OPS-AUDIT kapsam kararı, 2026-08-20 10:02) ve
**T134-VH araştırması üzerine kuruldu** (yeni araştırma başlatılmadı).

**Üzerine kurulduğu araştırma — T134-VH (OPS-AUDIT, PR #696):**
`docs/research/t134-acik-kaynak-erp-2026-08-20.md` ·
`docs/research/t134-cpq-proposal-saha-2026-08-20.md` ·
`docs/research/t134-sentez-karar-tablosu-2026-08-20.md`.
Bu cetvel T134'ün **karar-9 ve karar-10**'unu uygular; onları yeniden türetmez.

**İç kaynaklar (okundu, adresli):**

| Kaynak | Ne öğrenildi |
|---|---|
| `supabase/migrations/20260612000000_dealer_layer_baseline.sql:26` | `organizations` = id, name, tier_level, is_active. Adres/vergi/cari **yok**. |
| `...dealer_layer_baseline.sql:74-95` | `user_projects` = id, user_id, name, description; `project_items` = project_id, product_id, quantity, notes. **Rol/muhatap kolonu YOK.** |
| `src/types/database.types.ts` (`user_profiles`) | id, role, full_name, phone, tenant_id, organization_id. CRM alanı **yok**. |
| `supabase/migrations/20260816125346_quotes_v1.sql:33,148,185` | `source_project_id → user_projects(id)`; SELECT = `user_id = auth.uid() OR is_admin_user()`. |
| **canlı DB** (`pg_trigger`) | `trg_enforce_quote_status_transition` → `venthub_quotes` üzerinde **CANLI**. |
| `src/lib/quotes/quoteStatusMachine.ts` | Durum geçiş haritası — kod tarafı SSOT. |
| `docs/standards/quote-standard.md` Q1 | Proje = müşterinin **yaşayan çalışma listesi**; `source_project_id` **yalnız izlenebilirlik**. |
| `docs/standards/commerce-domain-map-standard.md` §2, §3, §5 | İki omurga; "Lead/CRM = **eksik**"; **KAPALI köprü listesi** (köprü 3 = lead → teklif, ters yön yok). |
| `docs/standards/dealer-network-standard.md` §1, §5, §7-9 | Bayi ≠ Kullanıcı; RFQ hattı; Deal Registration; tier/territory — **zaten cetvelli**. |
| `src/lib/rbac.ts:9,30,59-71` · canlı `pg_policy` | Sayfa matrisi `moderator`/`viewer` → `'*'`; RLS moderator'a **yalnız 7 tabloda** SELECT veriyor. |

**Kendi dış araştırmam (T134'ü tamamlar, tekrarlamaz):** dört CRM'in **veri modeli**
gerçekten okundu — Twenty (`packages/twenty-server/src/modules/*/standard-objects/*.workspace-entity.ts`),
EspoCRM (`application/Espo/Modules/Crm/Resources/metadata/entityDefs/*.json`),
Odoo (`addons/crm/models/crm_lead.py`, `crm_stage.py`), Frappe CRM (`crm/fcrm/doctype/*/*.json`).
T134 *teklif/proje davranışına* baktı; bu okuma *nesne modeline* bakar.

---

## 2. KAPSAM

**İÇİNDE:** (a) hesap / kişi / etkileşim **nesne katmanı** · (b) **doğrudan satış hattı** ·
(c) ⭐ **saha projesi** (T134 karar-10).

**DIŞINDA** — sahibi var, dokunulmaz:

| Konu | Sahibi |
|---|---|
| RFQ → Teklif → Sipariş hattı, teklif modeli, revizyon zinciri | `dealer-network-standard.md §5` + `quote-standard.md` (AUTH / T131) |
| Deal Registration, çakışma çözümü | `dealer-network-standard.md §8` |
| Tier / territory / lead auto-assignment | `dealer-network-standard.md §9` |
| Müşterinin kendi hesap yüzeyi | `customer-account-standard.md` (AUTH) |
| Kişisel veri sınıflandırması | `legal-compliance-standard.md §3.4` |

⚠ `dealer-network-standard.md` bugün **sahipsiz-park** (bayi modülü T106 bloklu, Recep kararı).
Bu cetvel ona **dokunmaz**.

---

## 3. ÜÇ NESNE

### 3.1 Hesap — `organizations` genişletilir, yeni tablo AÇILMAZ

Dört CRM'in **dördünde de** bir şirket nesnesi var (Twenty `Company`, Espo `Account`,
Odoo `res.partner.is_company`, Frappe `CRM Organization`). Bizde `organizations` zaten var.

**Kural:** hesap kavramının otoritesi `organizations`'tır. İkinci bir "müşteri" tablosu
açılmaz — açılırsa "bu firma kim" sorusunun iki cevabı olur.

### 3.2 Kişi — bugün YOK, ve `user_profiles` onun yerine geçemez

`user_profiles` **giriş yapabilen kullanıcıdır**. CRM'in kişisi **giriş yapmayabilir**:
şantiye şefi, satın almacı, proje müdürü. İkisini aynı tabloda tutmak, kayıt açmak için
hesap açtırmayı zorunlu kılar — saha gerçeğine aykırı.

**Kural:** kişi ayrı nesnedir; `auth.users` bağı **isteğe bağlıdır** (nullable).

**Kişi ↔ hesap ilişkisi — v1'de 1:N, bilinçli.** Dört sistemden **yalnız EspoCRM** çoka-çok
yapıyor (`AccountContact` join, `role`/`isInactive` kolonlu); Twenty ve Odoo tekil FK,
Frappe dolaylı. Sektör uzlaşmıyor → ucuz olanı seçiyoruz ve **sınırı adıyla yazıyoruz**:
taşeron mühendisin iki firmayla çalışması **modellenemez**. Kapanacaksa join tablosu ile
kapanır, `organization_id` çoğaltılarak değil.

### 3.3 Etkileşim — TEK polimorfik defter

Sektör bölünüyor: Twenty tek polimorfik `TimelineActivity`; Espo ve Frappe kanal başına ayrı
tablo; Odoo karma (`mail.thread` mixin + toplantı için ayrı FK).

**Seçimimiz: tek defter.** Gerekçe: kanallarımız **heterojen ve artıyor** (telefon, WhatsApp,
e-posta, site formu); kanal başına tablo her yeni kanalda migration ister.

⚠ **Mevcut `*_email_events` tabloları bu defter DEĞİLDİR.** `order_email_events`,
`quote_email_events`, `shipping_email_events` "**gönderdik mi**" sorusunu cevaplar —
gönderim defteridir. Etkileşim defteri "**müşteriyle ne oldu**" sorusunu cevaplar. Birini
diğerinin yerine kullanmak `commerce-domain-map §5/5`'i ihlal eder (bildirim modülü hiçbir
modülün durumunu **yazamaz**).

---

## 4. SAHA PROJESİ — T134 karar-10'un uygulaması

**Senaryo (Zorlu Center):** tek iş; işveren, ana yüklenici, alt yüklenici ve kiracı ayrı ayrı
fiyat sorar. Bugün bu dört talep birbirinden **habersiz** dört tekliftir.

**Sektör bu sorunu ÇÖZMEMİŞ — T134 iki bağımsız kaynakla doğruladı:** Dolibarr'da proje
**tek-muhatap kilidi** var (`fk_projet` tekil) ve GitHub #13524 *"Multiple Thirdparty under a
single project… needed by most companies"* yıllardır açık; bid-management tarafında da
standart bulunamadı (Procore modeli "tek ihale sahibi, çoklu bidder", bizim tersimiz).
**Bu yüzden burası bizim özgün cetvel alanımız.**

### 4.1 `user_projects` bu iş için KULLANILAMAZ

`user_projects` = id, user_id, name, description (`dealer_layer_baseline.sql:74-95`) —
**tek sahibi vardır**, RLS'i "kendi satırın" üzerine kuruludur, **rol kolonu yoktur**.
Saha projesi **çok taraflıdır**. `quote-standard.md` Q1 zaten `source_project_id`'yi
"**yalnız izlenebilirlik**" diye sınırlamış; o bağa ikinci bir anlam yüklemek
"PROJE ≠ TEKLİF" ayrımını bulanıklaştırır.

### 4.2 Muhatap rolü

Proje ↔ taraf bağı **rol taşır**: `isveren` · `ana_yuklenici` · `alt_yuklenici` · `kiraci`.
Rol, tarafın **o işteki konumudur** — hesabın tipi değil. Aynı firma bir projede ana
yüklenici, başkasında alt yüklenici olabilir.

> Bu terim VentHub belgelerinde daha önce **hiç geçmiyor** (NLM ikizi ve Orion ikizi
> bağımsız doğruladı). En yakın emsal `dealer-network-standard.md §7` Account Team /
> Opportunity Split'tir ama o **çok-BAYİ** senaryosunu çözer (bir işte birden çok bayiyi
> alacaklandırma), **çok-MUHATAP** senaryosunu değil. Aktarılamaz.

### 4.3 ⭐ Proje bir GÖRÜNÜRLÜK KÖPRÜSÜ DEĞİLDİR

**Ölçüm:** `venthub_quotes` SELECT politikası bugün `user_id = auth.uid() OR is_admin_user()`
(`quotes_v1.sql:148`). "Aynı projedeki taraflar birbirini görsün" biçimindeki her kural bu
politikayı **sessizce genişletir** ve rakip firmaların fiyatlarını birbirine açar.

**Kural (T134 karar-10):** her muhatap **yalnız kendi teklifini** görür, **proje çatısını
asla**. Proje **gruplar, yetki VERMEZ**; çatının tamamını yalnız **satıcı taraf** görür.
Gevşetilmesi `commerce-domain-map-standard.md §5` kapalı köprü listesine **yeni madde ekleyen
bir PR** gerektirir — sessizce yapılamaz.

### 4.4 Aynı projede farklı taraflara farklı fiyat — UYARIR, BLOKLAMAZ

T134 karar-9: satıcı-sistemi tarafında sektör pratiği **bulunamadı**. Bizim kuralımız:
kompozör **uyarır** ("bu projede aynı ürün X'e %n farklı fiyatla teklifte"), **bloklamaz** —
ticari karar kullanıcınındır. Aynı çizgi karar-8 ile tutarlıdır: çakışan canlı teklifte
sistem uyarır, kapatma/iptal **daima** kullanıcıda, otomatik iptal **yok**.

---

## 5. DÖRT TASARIM SORUSU — sektör kanıtlı öneri

| # | Soru | Sektör | Önerimiz |
|---|---|---|---|
| 1 | Lead ayrı tablo mu? | Espo/Frappe **evet**, Odoo **hayır** (`type` alanı, aynı satır), Twenty'de Lead **yok** | **Ayrı tablo değil.** `contact_messages` zaten giriş defteri (T104 onu gerçek yazar hâle getiriyor); CRM'e giren kayıt hesap/kişi olur. Bağlayıcı hüküm karne incelemesinde. |
| 2 | Kişi ↔ hesap çoka-çok mu? | Yalnız Espo evet | **Hayır (v1)** — §3.2, sınır adıyla yazılı. |
| 3 | Etkileşim tek tablo mu? | Twenty tek, Espo/Frappe kanal başına, Odoo karma | **Tek defter** — §3.3. |
| 4 | Pipeline aşaması kod mu veri mi? | Odoo/Frappe **veri** (ayrı tablo), Espo JSON-metadata | ⚠ **MEVCUT KARAR VAR, yeniden yasalaştırmıyoruz.** VentHub'ın seçimi **Dual-Enforcement**: SSOT kodda (`quoteStatusMachine.ts`), aynı grafik DB'de trigger + CHECK ile **ayrıca** zorlanıyor — canlı doğrulandı (`trg_enforce_quote_status_transition`). CRM'in kendi hunisi olacaksa **aynı deseni** izler; aşama **tablosu açmaz**. Kiracı-başı aşama ihtiyacı doğarsa **ayrı karardır** ve migration ister. |

---

## 6. ÇELİŞEN-MEVCUT (ölçüldü)

| # | Bulgu | Kanıt | Geri alma planı |
|---|---|---|---|
| Ç1 | Talep formu veriyi **hiçbir yere yazmıyor**, kullanıcıya "başarılı" diyor | `LeadModal.tsx:54-72`; `contact_messages` `src/`'de referanssız | **T104-VH kapsamında, planı onaylı** — burada yalnız envanter |
| Ç2 | Kişi kavramı yok; `user_profiles` giriş yapan kullanıcı | `database.types.ts` (`user_profiles`) | yeni nesne, migration → **Recep kapısı** |
| Ç3 | Not yalnız siparişe bağlı | `order_notes` (`20250915152500_...sql:54`) | polimorfik nota taşınır |
| Ç4 | `organizations` ticari alan taşımıyor (adres/vergi/cari yok) | `dealer_layer_baseline.sql:26` | kolon ekleme, migration |
| Ç5 | Sayfa matrisi `moderator`/`viewer`'a `'*'` verirken RLS **yalnız 7 tabloda** SELECT veriyor → **sessiz-boş** | `rbac.ts:9,30`; canlı `pg_policy`; guard'lar `rbac.ts:59-71`'de **rota rota elle** | `rbac.ts` **AUTH'un**; drift kapısı teklifi AUTH'ta |
| Ç6 | Deal Registration **belge düzeyinde var, canlıda aktif değil** | `dealer-network-standard.md §8` vs `docs/audits/dealer-data-ground-truth-2026-06-11.md` | bu cetvelin işi değil — envanter |

**Bu cetvelin geri alma planı:** belge kod yolunu değiştirmez → geri alma = dosyayı sil.

---

## 7. BU CETVELİN ÖLÇMEDİĞİ *(adıyla)*

- **Şema önerilmedi.** v0 kavram ve sınır koyar; kolon/tip kararı T131 (teklif) ve T134 sentez
  tablosuyla birlikte verilecek. Migration'lı her adım **Recep kapısıdır**.
- **Kişisel veri satırları yazılmadı.** CRM kişi tutmaya başladığında
  `legal-compliance-standard.md §3.4` tablosuna satır eklemek **bu modülün sahibinin
  yükümlülüğüdür** (`commerce-domain-map §4`). Şema olmadığı için henüz eklenmedi.
- **Paketleme kararının ADRESİ bulunamadı.** NLM ikizi "Satış (CRM yok) / Proje (CRM+CPQ+BOM) /
  Satış+Teknik Servis" paketlemesinin **karara bağlandığını** söylüyor ama **dosya atfı
  vermedi**; depoda da bulamadım. Yani *karar var* iddiası bugün **kaynak-adresli değildir** —
  adresi bulunana kadar bu cetvel paketlemeyi **veri** olarak kullanmaz.
- **Twenty'nin `Opportunity.stage` varsayılanlarının nerede seed edildiği ölçülemedi**
  (GitHub kod araması sıfır sonuç; `workspace-entity.ts` yalnız tip tanımı).
- **Frappe çekirdeğinin (`frappe/frappe`) Dynamic-Link ile gerçek çoka-çok yapıp yapmadığı
  ölçülemedi** — yalnız `frappe/crm` app'i okundu.
- **SuiteCRM incelenmedi.**


---
# FILE: docs\standards\csp-standard.md

# CSP Standardı (Content-Security-Policy)

> **Durum:** v1.0 · 2026-08-17 · Şerit: LEGAL-SEO
> **Bekçi:** `INV-CSP-1` → `src/__tests__/conformance/csp-origin-coverage.test.ts`
> **Kardeş bekçi:** `INV-3D-5` → `src/__tests__/conformance/3d-csp.test.ts` (yalnız `connect-src` + 3D CDN'leri)
> **SSOT:** politika metni `next.config.mjs` `headers()` içinde, TEK yerde.

## 0. Bu cetvel niçin var

`docs/standards/analytics-standard.md` (satır 86-92) şu tuzağı adıyla yazmıştı:

> CSP **uygulanır hâle getirildiği an GA sessizce ölür** — konsolda blok, panelde veri yok,
> sebep görünmez. İkisi farklı zamanlarda farklı kişilerce yapılırsa bağlantı kurulamaz.

Doğru teşhis, ama yanlış araç: bir **kontrol listesi maddesi** zaman farkına dayanmaz. Kodu
yazan kişi altı ay önce gitmiş olur, CSP'yi enforce'a alan kişi o maddeyi hiç görmez. Bu cetvel
aynı bilgiyi **çalışan bir bekçiye** çevirir.

Ölçüm bunu doğruladı: 2026-08-17'de kaynak tarandığında GA/GTM dışında **dört origin daha**
CSP'de eksikti (§6). Hiçbiri bugün görünmüyordu, çünkü politika Report-Only.

## 1. Bugünkü mod: Report-Only (hiçbir şeyi engellemez)

`next.config.mjs` başlığı `Content-Security-Policy-Report-Only`. Tarayıcı ihlalleri **raporlar,
engellemez**. Sonuç: eksik bir origin bugün **hiçbir belirti üretmez**. Bu, CSP'nin en tehlikeli
hâlidir — güvenlik hissi verir, koruma vermez ve eksiklerini gizler.

Buradan çıkan tek kural: **CSP'nin doğruluğu tarayıcıdan değil, bekçiden öğrenilir.**

## 2. Düşmemesi gereken sertleştirme direktifleri (stale-guard)

Aşağıdakiler politikadan **çıkarılamaz** (`INV-CSP-1` kilitler):

| Direktif | Değer | Neyi engeller |
|---|---|---|
| `object-src` | `'none'` | Eski eklenti tabanlı enjeksiyon yüzeyi |
| `frame-ancestors` | `'none'` | Clickjacking (`X-Frame-Options`'ın CSP karşılığı) |
| `base-uri` | `'self'` | `<base>` enjeksiyonuyla tüm göreli URL'lerin kaçırılması |
| `form-action` | `'self'` | Form gönderiminin yabancı sunucuya yönlendirilmesi |

Ayrıca CLAUDE.md #9 gereği 3D asset CDN'leri (`raw.githubusercontent.com`, `raw.githack.com`)
`connect-src`'ten **kaldırılamaz** — bunu `INV-3D-5` kilitler.

## 3. Yeni bir dış origin eklerken (tek kural)

> **Bir dış origin'e bağımlı hâle gelen kod ile o origin'in CSP kaydı AYNI PR'da girer.**

Kullanım sınıfı → direktif eşlemesi:

| Kod'da ne yapıyorsun | Direktif |
|---|---|
| `<Script src="https://…">` / `<script src>` | `script-src` |
| `<iframe src="https://…">` | `frame-src` |
| `fetch('https://…')`, XHR, WebSocket, `sendBeacon` | `connect-src` |
| CSS `@import url('https://…')`, uzak stylesheet | `style-src` |
| Uzak görsel | `img-src` (bugün `https:` geneli açık) |
| Uzak font dosyası | `font-src` (bugün `https:` geneli açık) |

**Geri-düşme (fallback) tuzağı — en pahalısı:** bir direktif politikada **hiç yoksa** tarayıcı
`default-src`'e düşer. `default-src 'self'` altında bu, "yazmayı unutmak" ile "açıkça yasaklamak"ın
**aynı şey** olması demektir. Bu repoda `frame-src` tam olarak böyle eksikti: YouTube ve Cloudflare
Stream gömüleri enforce'a geçildiği gün sessizce boş çerçeveye dönecekti. Bir direktifi
"yazmadım çünkü kısıtlamak istemedim" diye atlamak **tam tersini** yapar.

## 4. Bekçinin kapsamı — ölçmediği sınıflar ADIYLA

`INV-CSP-1` kaynak tarar. Neyi **görmediğini** bilerek yazıyoruz; yoksa "ihlal yok" sonucu
ölçümden değil körlükten gelir:

**Görür:** `src/**` altında literal URL taşıyan `<Script src>` / `<script src>` / `<iframe src>` /
`fetch(...)` / `@import url(...)`.

**Görmez:**
- **Host'u çalışma anında kurulan** çağrılar (`https://${process.env.X}/...`). Bunlar statik
  çözülemez → testteki `DYNAMIC_HOST_DECLARATIONS` listesine **elle** kaydedilir. Liste bir
  muafiyet değil **ratchet'tir**: kayıtsız yeni bir dinamik-host kullanımı testi KIRMIZI yakar,
  kayıtlı host CSP'de aranır, kullanımı kalkan kayıt "ölü kayıt" diye KIRMIZI yakar.
- **Üçüncü-parti script'in kendi alt-istekleri.** GTM yüklendikten sonra
  `*.google-analytics.com`'a olay gönderir; bu istek **kaynakta hiç görünmez**. Bu tür
  origin'ler §6 tablosuna elle girilir.
- `next/image` uzak host'ları — `images.remotePatterns` ile ayrı yönetilir (`img-src` zaten `https:`).
- `supabase/functions/**` — Deno, sunucu tarafı. CSP tarayıcıya bakar.

**Dedektörün kendi körlükleri (ikisi de bu bekçiyi yazarken CANLI yakalandı, ikisi de sabotajla kilitlendi):**
1. **Yorum sıyırıcı URL'i yer.** Naif bir `//`-sıyırıcısı `https://host` içindeki `//`'ı yorum
   başlangıcı sanar ve URL'i `https:`e indirger — yani dedektörün **aradığı şeyi yok eder**. İlk
   sürümde tam olarak bu oldu: tarama SIFIR kullanım buldu. Çözüm `(?<!:)`.
2. **CRLF.** Repo dosyaları CRLF; JS'te `.` satır sonlandırıcı `\r` ile eşleşmez, `/\/\/.*$/`
   hiçbir şey sıyırmaz. Çözüm `[^\r\n]`.

## 5. Enforce'a geçiş — AYRI VE BÜYÜK karar (Recep kapısı)

`Content-Security-Policy-Report-Only` → `Content-Security-Policy` geçişi bir yapılandırma
düzeltmesi **değildir**; koruma modunu değiştirir ve yanlışsa vitrini kırar. Ön koşullar:

1. §6 tablosundaki her origin politikada, `INV-CSP-1` yeşil.
2. Report-Only raporlarında **sıfır ihlal** kanıtlanmış (canlı trafikle, bir sürüm boyu).
3. `'unsafe-inline'` / `'unsafe-eval'` kararı verilmiş. Bugün ikisi de `script-src`'te açık ve
   XSS korumasının çoğunu boşa çıkarır. Bunları kaldırmak nonce/hash altyapısı ister — **ayrı iş**.
4. **Recep onayı.** (CLAUDE.md: geri alınamaz / dışa dönük etkisi olan kararlar.)

`INV-CSP-1` bu geçişi **yasaklamaz**, sessizce olmasını yasaklar: header anahtarı değişirse test
KIRMIZI yanar ve geçişi yapanı bu bölüme bakmaya zorlar.

## 6. Origin sicili (2026-08-17 ölçümü)

| Origin | Direktif | Nereden | Kaynakta görünür mü |
|---|---|---|---|
| `*.supabase.co`, `wss://*.supabase.co` | `connect-src` | Supabase istemcisi | evet |
| `*.vercel-insights.com` | `connect-src` | Vercel Analytics | hayır (SDK) |
| `raw.githubusercontent.com`, `raw.githack.com` | `connect-src` | 3D GLB/GLTF — CLAUDE.md #9 | evet |
| `www.googletagmanager.com` | `script-src` | `ConsentGatedAnalytics.tsx` (GA4 etiketi) | evet |
| `*.google-analytics.com` | `connect-src` | GTM'in olay ucu | **hayır** — elle |
| `api.pwnedpasswords.com` | `connect-src` | `passwordSecurity.ts` sızmış-parola kontrolü | evet |
| `www.youtube.com` | `frame-src` | `VideoAuthority.tsx` YouTube gömüsü | evet |
| `*.cloudflarestream.com` | `frame-src` | `VideoAuthority.tsx` Cloudflare Stream | **dinamik** — kayıtlı |
| `fonts.googleapis.com` | `style-src` | `InventoryQrLabel.tsx` yazdırma etiketi `@import` | evet |
| `*.iyzipay.com` | `script-src`, `frame-src`, `form-action`, `connect-src` | İyzico gömülü ödeme formu (T080) | **hayır** — secret + Edge |

**Bilinen açık kalem (bu cetvelin işi değil, sahibi ADMIN):** `InventoryQrLabel.tsx` bir admin
yazdırma etiketi için Google Fonts'tan `@import` yapıyor. CSP'ye eklendi (çalışsın diye), ama
doğru çözüm muhtemelen etiketi yerel fontla basmak — dış bağımlılık ne kadar azsa CSP o kadar dar
olur. Sahibine bırakıldı.

### 6.1 İyzico — gömülü form (2026-08-18, T080-P2)

Bu cetvelin ilk sürümü İyzico'yu sicile ALMAMIŞTI ve gerekçesi doğruydu: ödeme tam sayfa
yönlendirmeyle gidiyordu, CSP'yi hiç ilgilendirmiyordu. Recep **A = gömülü form** kararını
verince kapı açıldı ve dört yüzey birden doğdu — script yüklenir, iframe açılır, form POST
edilir, XHR atılır. Dördü de politikaya girdi.

**Niçin joker (`*.iyzipay.com`), tek tek host değil:** gerçek taban adres `IYZICO_BASE_URL`
secret'inde yaşıyor (kodda yalnız `sandbox-api.iyzipay.com` yedeği görünür) ve sağlayıcı
sandbox ile prod için ayrı alt alanlar kullanıyor (`sandbox-api`, `api`, `sandbox-static`,
`static`). Tek tek yazmak **yanlış host'a demirlemek** riski taşır ve hata ancak enforce
gününde ödeme yolunda görünür. Joker iki aileyi de kapsar; apex `iyzipay.com`'i **kapsamaz**,
yani hâlâ dar.

**Kilit:** INV-CSP-1 içinde "ödeme sağlayıcı origin dört direktifte de izinli" iddiası. Bu host
taramayla bulunamaz (secret'ten kurulur + Edge fonksiyonunda yaşar — §4'ün iki kör sınıfı),
o yüzden ADIYLA kilitlendi. Dört direktiften biri düşerse kapı, düşen direktifi adıyla
söyleyerek kırmızı yanar; bilerek bozularak kanıtlandı.

**AÇIK RİSK — ölçülmedi (sahibi PRICING):** 3D Secure adımında bankanın ACS sayfası İyzico'nun
kendi iframe'i içinde açılıyorsa bizim `frame-src`'imize yalnız iyzipay yeter. Bazı akışlarda
banka sayfası üst çerçeveye ya da bizim iframe'imize düşebiliyor; o durumda **banka alan
adları** da gerekir — bu sınırsız bir listedir ve CSP ile yönetilemez. PRICING gerçek sandbox
ödemesiyle ölçecek. **Enforce kararı bu ölçüm gelmeden verilmemeli** (§5 ön koşullarına ek).

**Rapor ucu YOK (ölçüm, 2026-08-18):** yapılandırmada ne `report-uri` ne `report-to` var.
Report-Only raporları hiçbir yere gitmiyor, yalnız ziyaretçinin konsoluna düşüyor. Bu doğrudan
§5'in 2. ön koşulunu **ölçülemez** kılar: "sıfır ihlal kanıtlandı" denemez, çünkü ihlalleri
toplayan bir yer yok. Bugün sahip olduğumuz şey koruma değil **sessizlik**. Rapor ucu açmak
koruma modunu DEĞİŞTİRMEZ (risksiz) ve enforce gününe kör gitmeyi önler — Recep kararına
"ENFORCE-GÜNÜ" kaleminin yanına ayrı bir ön adım olarak yazıldı.

## 7. İlgili cetveller

- `docs/standards/analytics-standard.md` — GA/GTM rıza kapısı ve ölçüm; CSP maddesi buraya devreder.
- `CLAUDE.md` #9 (3D CDN whitelist), #11 (güvenlik/webhook), #12 (multi-tenant).
- `docs/standards/storefront-design-standard.md` — vitrin yüzeyleri.


---
# FILE: docs\standards\csv-import-export-standard.md

# VentHub Kanonik CSV İçe/Dışa-Alım Format Standardı (Cetvel) — v1.1

> **SSOT (Single Source of Truth).** Bu belge, VentHub'a içe-alınan / VentHub'dan dışa-alınan ürün
> CSV'sinin **TEK format kontratıdır**: kolonlar, kodlama, slug kuralı, kalite kapısı. Admin panel toplu
> yükleyici **ve** katalog ithalat hattı (Kademe 1 → Kademe 2) **her ikisi de** bunu izler.
>
> **Kapsam ayrımı (mükerrerlik önleme):**
> - *Nasıl çıkarılır* — kaynak (Vortice/Avensair), NotebookLM hakem, 27-bölüm kategori haritası, 2-kademe →
>   **`catalog-ingestion-standard.md`** (YÖNTEM cetveli).
> - *Satış fiyatı nasıl hesaplanır* — € alış → çok-para-birimi/KDV/kâr → **`pricing-standard.md`**.
> - *Kategori iskeleti / slug dili* — **`category-taxonomy-standard.md`**.
> - **Bu dosya yalnız CSV'nin BİÇİMİ.** Yöntem/fiyat/taksonomi kuralı buraya kopyalanmaz; ilgili cetvele link verilir.
>
> v1.1 · 2026-06-20 — venthub-hvac/docs/standards'a **SSOT** olarak taşındı (önce ingestor'da v1.0 idi);
> DB-JSONB ↔ flat-CSV ilişkisi (§0) + slug kuralı (§3) netleştirildi.

---

## 0. Çekirdek ilke — flat CSV (insan denetimi) ↔ JSONB (depolama)

Kafa karışıklığını kökten kesmek için: **iki ayrı katman vardır, ikisi de doğru.**

- **Veritabanı (Supabase):** teknik özellikler **`technical_specs` JSONB** kolonunda tek JSON olarak durur. **DEĞİŞMEZ.**
- **CSV (bu standart):** aynı özellikler **düzleştirilmiş `spec_` kolonları** halinde yazılır — insan Excel'de
  açıp **okuyup denetlesin** diye (ne var / ne eksik / slug doğru mu bir bakışta görünür).
- **Köprü = loader (Kademe 2):** CSV'yi okurken `spec_*` kolonlarını **JSON'a katlar** ve `technical_specs`'e
  yazar. Dışa-alımda tersi: JSON'u flat kolonlara açar.

```
LLM çıkarır → flat CSV  →  [ İNSAN DENETİMİ ]  →  loader flat→JSON katlar → Supabase technical_specs (JSONB)
```

> **Neden flat, JSON-blob değil?** İçe-alım formatı **insan denetimi** içindir; tek hücreye tıkışmış JSON
> okunmaz/denetlenemez (sıralanamaz, eksik değer görünmez). Sektör deseni de budur — Shopify / WooCommerce
> ürün içe-alım CSV'leri tümüyle flat kolondur. JSON yalnız **DB'nin iç temsilidir**, kullanıcının gördüğü
> katman değil. *(Eski "CSV'de tek `specs_json` kolonu" önerisi bu yüzden **emekli** — DB'deki JSON değil,
> CSV'deki blob-kolon fikri emekli.)*

---

## 1. Dosya Biçimi Standartları
* **Encoding (Kodlama):** UTF-8 with BOM (`utf-8-sig`) olmak zorundadır. Bu kodlama, MS Excel'in dosyayı doğrudan açtığında Türkçe karakterleri (ş, ı, ç, ğ, ö, ü) bozmadan gösterebilmesini sağlar.
* **Ayraç (Delimiter):** Noktalı virgül (`;`) karakteridir. Türkçe Windows/Excel yerel ayarlarında ondalık ayırıcı olarak virgül (`,`) kullanıldığından, Excel'in dosyayı doğrudan çift tıklatarak sütunlar halinde açabilmesi için bu ayraç standartlaştırılmıştır.
* **Metin Kaçışları (Escaping):** İçerisinde noktalı virgül veya çift tırnak barındıran metin alanları çift tırnak (`"`) içine alınmalıdır. Metin içindeki çift tırnaklar iki adet çift tırnakla (`""`) kaçırılmalıdır.
* **Satır = ürün:** Tek satır = tek ürün (renk/varyant ayrı satır). Başlık satırı zorunlu.

---

## 2. CSV Kolon Yapısı (Düzleştirilmiş Mimari)

Veritabanında JSONB tutulan teknik özellikler, CSV düzeyinde okunabilirliği artırmak amacıyla **düzleştirilmiş (flat) kolonlar** halinde yazılır. Kolonlar iki ana gruba ayrılır:

### A. Genel Ticari ve Tanımlayıcı Kolonlar
* **`model_code`** (text, **zorunlu**): Üretici model kodu (Örn: `11313`) = Vortice cod. = Avensair KOD. **Köprü alanı.** Boş bırakılamaz.
* **`name`** (text): Ürünün Türkçe arayüz adı (Örn: `Vortice Punto Evo Flexo MEX 100/4" LL 1S Duvar Eksenli Fan`).
* **`brand`** (text): Marka (Örn: `Vortice`, `Danfoss`, `Nicotra Gebhardt`, `AVenS`).
* **`avensair_kod`** (text): Avensair bayi ürün satış kodu.
* **`avensair_section`** (text): Avensair fiyat listesindeki bölüm no+adı (Örn: `08 Mini Aksiyel`). *(Loader'ın stabil kategori anahtarı — bkz §3.)*
* **`category_slug`** (text): Üst kategori URL slug'ı (Örn: `residential-ventilation`). **Canlı DB slug'ı — bkz §3.**
* **`subcategory_slug`** (text): Alt kategori URL slug'ı (Örn: `banyo-ve-tuvalet-fanlari`). **Canlı DB slug'ı — bkz §3.**
* **`purchase_price_eur`** (numeric): Euro cinsinden net **alış** fiyatı (KDV hariç). **TL gömme YOK** — satış fiyatını `pricing-standard.md` motoru hesaplar.
* **`currency`** (text): Para birimi. Daima `EUR`.
* **`description_tr`** (text): Türkçe açıklama metni.
* **`description_en`** (text): İngilizce açıklama metni (deyimsel).
* **`image_url`** (text): Ürün resmi dosya yolu (Örn: `markalar/vortice/konut-fanlari/03-output/images/11313.png`).
* **`src_vortice`** (text): Atıfta bulunulan Vortice katalog sayfası.
* **`src_avensair`** (text): Atıfta bulunulan Avensair fiyat listesi sayfası.
* **`confidence`** (enum): Veri güvenirlik derecesi (`ok`, `conflict`, `missing`). `ok` dışı = **insana işaretli.**

### B. Teknik Özellik Kolonları (`spec_` Önekiyle)
Her teknik özellik kolonu, içe-alım mekanizması tarafından otomatik tanınabilmesi için **`spec_`** önekiyle adlandırılır. Loader, `spec_` ön-ekli tüm kolonları toplayıp `technical_specs` JSONB'ına katlar. Önemli kolonlar:
* **`spec_voltage_v`** (integer): Çalışma voltajı (V).
* **`spec_frequency_hz`** (integer): Frekans (Hz). Varsayılan `50`.
* **`spec_max_absorbed_power_w`** (numeric): Maksimum çekilen güç (W).
* **`spec_absorbed_current_a`** (numeric): Maksimum çekilen akım (A).
* **`spec_max_delivery_m3h`** (numeric): Maksimum debi (m³/h).
* **`spec_max_delivery_ls`** (numeric): Maksimum debi (L/s).
* **`spec_max_static_pressure_pa`** (numeric): Maksimum statik basınç (Pa).
* **`spec_noise_level_db_a`** (numeric): Ses seviyesi dB(A).
* **`spec_rpm_max`** (numeric): Maksimum motor devri.
* **`spec_diameter_mm`** (numeric): Bağlantı çapı (mm).
* **`spec_has_timer`** (boolean): Zaman rölesi var mı? (`TRUE` / `FALSE`).
* **`spec_has_humidistat`** (boolean): Nem sensörü var mı? (`TRUE` / `FALSE`).

> **Kolon kümesi kategoriye göre değişir.** Bir katalog-CSV'si (ör. `vortice-konut.csv`) yalnız o kategorinin
> spec'lerini taşır. Birleşik master (`_birlesik/`) tüm kategorilerin **birleşimini** taşır → bazı hücreler
> boş/NULL olur, bu **normaldir** (seyrek matris). Yeni spec gerektiğinde yeni `spec_` kolonu eklenir; şema kapalı değil.

---

## 3. Slug Kuralı (ithalat eşleşmesi ↔ taksonomi temizliği AYRI)

- **CSV slug = canlı DB slug'ı, BİREBİR.** `category_slug` / `subcategory_slug`, loader'ın `categories`
  tablosunda **eşleştireceği gerçek slug'lardır.** **İcat etme, dil değiştirme, tahmin etme** — DB'de ne ise
  o. (Bugünkü gerçek: üst kategoriler İngilizce; bazı alt kategoriler Türkçe seed edilmiş — ör. `banyo-ve-tuvalet-fanlari`.)
- **Eşleşmenin stabil anahtarı `avensair_section`'dır.** Loader, `avensair_section` → DB slug eşlemesini
  **canlı DB'ye karşı** uygular (kazınan slug'a değil); böylece Avens-sitesi ile VentHub arasındaki dil/ad
  farkları tek yerde (loader) çözülür. Eşleme tablosunun SSOT'u = canlı DB + `catalog-ingestion-standard.md §4`.
- **Slug ≠ görünen isim.** Türkçe gösterim `translation_key` / `metadata.tr`'den gelir (Aksiyom 5: çeviri JSONB).
- **Normalize (Türkçe alt-slug → İngilizce) AYRI bir taksonomi işidir** — 301 redirect'li yapılır, URL/SEO
  kırılmaz. Bu **ithalatı bloklamaz** ve bu standardın kapsamı dışıdır → `category-taxonomy-standard.md §4`.

---

## 4. Kalite Kontrol Cetveli (Jidoka Quality Gate)

Üretilen CSV dosyalarının kalitesini doğrulamak için linter kuralları uygulanır. Hata tolerans ve aksiyon matrisi:

| Hata Kodu | Hata Tanımı | Hata Tipi | Sistem Aksiyonu |
|---|---|---|---|
| **`ERR_MISSING_MODEL_CODE`** | `model_code` veya `avensair_kod` alanı boş. | **Fatal** | Satır CSV'ye eklenmez. İşlem durdurulur ve hata raporlanır. |
| **`ERR_MISSING_PRICE`** | Avensair fiyat listesinde eşleşme var ancak fiyat boş/okunamadı. | **Warning** | Alış fiyatı boş bırakılır (`null`), `confidence` alanı `missing` yapılır. |
| **`ERR_PRICE_ZERO`** | Fiyat listesindeki alış fiyatı 0.00 veya negatif. | **Error** | Fiyat yazılır ancak `confidence` alanı `conflict` yapılır. Recep'in onayına sunulur. |
| **`ERR_MISSING_MANDATORY_SPEC`** | Kategoriye özel zorunlu alanlardan biri boş (§5). | **Warning** | Değer `null` kalır, `confidence` alanı `missing` yapılır. |
| **`ERR_INVALID_TYPE`** | Sayısal alana alfabetik veya bozuk formatta veri girilmesi. | **Error** | Değer temizlenmeye çalışılır ("230 V" → 230). Başarısız olunursa satır `conflict` yapılır. |
| **`ERR_SLUG_NOT_IN_DB`** | `category_slug`/`subcategory_slug` canlı DB'de yok (§3). | **Error** | Satır `conflict`; loader eşleştiremez → insana işaretlenir. |

---

## 5. Kategoriye Özel Zorunlu Teknik Kolonlar

Kategorilere göre aşağıdaki teknik kolonların CSV'de bulunması ve geçerli veri barındırması zorunludur (eksikse `ERR_MISSING_MANDATORY_SPEC`):

* **`residential-ventilation` (Konut Havalandırma):** `spec_voltage_v` · `spec_max_delivery_m3h` · `spec_has_timer`
* **`air-curtains` (Hava Perdeleri):** `spec_voltage_v` · `spec_airflow_speed_max_ms` · `spec_number_of_speeds`
* **`channel-fan` (Kanal Tipi Fanlar):** `spec_voltage_v` · `spec_diameter_mm` · `spec_max_delivery_m3h`
* **`roof-fan` (Çatı Tipi Fanlar):** `spec_voltage_v` · `spec_max_delivery_m3h`

> Yeni kategori eklenince zorunlu-spec listesi burada genişletilir (kategori → zorunlu `spec_` kümesi).

---

## 6. Provenance / İlişki

- **Yöntem cetveli:** `catalog-ingestion-standard.md` (kaynak, hakem, 27-bölüm kategori haritası, 2-kademe, kapılar).
- **Fiyat cetveli:** `pricing-standard.md` (€ alış → çok-para-birimi/KDV/kâr satış motoru).
- **Taksonomi cetveli:** `category-taxonomy-standard.md` (kategori iskeleti, slug dili, normalize kararı).
- **Pilot uyum kanıtı:** `vortice-konut.csv` (4 ürün, Vortice Punto Evo Flexo) bu şemaya **birebir** uyar.
- **memory:** `catalog-ingestion-system` · `pricing-currency-requirements` · `category-taxonomy-state`.

---

> v1.1 · 2026-06-20 · SSOT venthub-hvac. İngestor'daki kopya = türetilmiş (banner'lı), düzenleme burada yapılır.


---
# FILE: docs\standards\customer-account-standard.md

# Müşteri Hesap Yüzeyi Standardı (cetvel) — v0.1

> **Kapsam:** `/account/*` müşteri-hesap yüzeyleri — sayfa anatomisi, favori/proje
> ayrımı, adres alanı SSOT'u, e-posta doğrulama politikası.
> **Kardeş cetvel:** `auth-account-standard.md` (giriş/şifre/callback zinciri).
> **Bekçi:** `src/__tests__/conformance/auth-account-surface.test.ts` (INV-AUTH-2).
> **Doğuş sebebi:** T059 (2026-08-16) — header'ın favoriler butonu var olmayan sayfaya
> gidiyordu (garantili 404); "projeye ekle" modalı kopuk context teli yüzünden sessiz
> no-op'tu; overview'un okuduğu `full_address` alanını hiçbir form yazmıyordu (hep boş
> kart). DURUM-TAKIP'te "EKSİK STANDART" olarak işaretliydi — hata tam o boşlukta yaşadı.

## B1 — Rotası olan her hesap yolunun sayfası olur

`Routes.account.*`'a eklenen her yol için `/src/app/[lang]/account/<yol>/page.tsx`
**aynı PR'da** eklenir. Merkezi rota tanımı UI'da link üretir; sayfasız rota tanımı
"derlenen 404"tür ve hiçbir statik kapı görmez — INV-AUTH-2 R1 tüm listeyi tarar.

## B2 — Hesap sayfası anatomisi

Her `/account/*` liste sayfası dört durumu da tanımlar (FavoritesPage/ProjectsPage
referans desendir):

1. **Başlık bloğu:** ikon + `h2` başlık + bir cümlelik alt metin (sözlükten).
2. **Yükleme:** ortalanmış spinner (`Loader2`) — boş ekran değil.
3. **Boş durum:** ikon + başlık + açıklama + kullanıcıyı İLERİ götüren CTA
   (ör. "Ürünlere Göz At"). Boş liste asla çıplak bırakılmaz — boş durum,
   özelliğin nasıl kullanılacağının öğretildiği yerdir.
4. **Liste:** kart satırları; yıkıcı eylem (sil/çıkar) ikincil görünümde ve
   `aria-label`'lıdır; sayfa içi durum değişimi toast ile onaylanır.

## B3 — Favori ≠ Proje (iki ayrı kavram, birleştirme)

- **Favori** = TEKİL ürün işareti. Kimlik listesi; kalp simgesi; ad/yapı taşımaz.
  **v1 sözleşmesi:** `localStorage['venthub:favorites:v1']`, senkron `storage` +
  `venthub:favorites-changed` olayları; kalp `useFavorites`'e bağlanır, yerel
  `useState` ile favori tutmak yasaktır (yenilemede kaybolur = sahte özellik).
  DB'ye (`user_favorites`) geçiş Recep kararıdır (migration → kural 13); geçişte
  hook arayüzü sabit kalır.
- **Proje** = ADLANDIRILMIŞ ürün listesi (BOM): ad + açıklama + (ürün, adet)
  satırları; DB'de yaşar (`user_projects` + `project_items`), oturum gerektirir.
  Teklife (RFQ) dönüşmeye adaydır — teklif modülü mimarisi için SSOT:
  `quote-standard.md` (T067). Proje context'i TEK yerde yaratılır
  (`contexts/ProjectContext.tsx`); ikinci `createContext` yasaktır — iki ayrı
  nesne tüketiciyi sessizce fallback'e düşürür (T059'da olan buydu).
- Yeni "listeleme" ihtiyacı gelirse önce bu ikisinden birine eşlenir; üçüncü bir
  liste kavramı ancak cetvel güncellenerek açılır.

## B4 — Adres alanı SSOT: `full_address` türetilmiştir

Karar (T059): `full_address` AYRI tutulmuş bir alan DEĞİL, türetilmiş görünümdür.
Adres formu yapısal alanları yazar (`address_line`, `district`, `city`, ...);
`full_address`'i hiçbir form yazmaz. Gösteren her yüzey şu fallback'i uygular:

```
full_address || [address_line, district, city].filter(Boolean).join(', ')
```

(checkout `useCheckoutOrchestrator` da aynı davranışı uygular). Genel kural:
bir yüzeye alan eklerken "bu alanı hangi form yazıyor?" sorusunun cevabı yoksa
fallback zorunludur. `full_address`'i yazan form eklemek bu cetvelin
güncellenmesini gerektirir (çift-kaynak riski).

## B5 — E-posta doğrulama politikası: DASHBOARD'A EMANET

Doğrulama zorunluluğu Supabase GoTrue ayarıdır, kodda kapı YOKTUR — bilinçli:
2026-08-16'da canlıda ölçüldü (`/auth/v1/settings` → `mailer_autoconfirm: false`),
sunucu doğrulanmamış girişi zaten reddediyor; istemci kontrolü ikinci bir yalancı
kapı olurdu. **Bağımlılık açık yazılsın:** bu ayar Dashboard'dan gevşetilirse
(autoconfirm açılırsa) doğrulanmamış hesaplar içeri girer ve kodda hiçbir şey
onları durdurmaz — ayarı değiştiren, bu cetveli ve kapı ihtiyacını yeniden
değerlendirmek zorundadır.

## B6 — Favoriler yüzeyinde fiyat (bilinçli yok)

Favoriler v1 fiyat GÖSTERMEZ. Fiyat yüzeyi eklemek `rendering-cache-standard.md`'nin
fiyat-yüzeyi kurallarına (INV-PRICE ailesi) tabidir; eklenecekse `display_price`
hattından gelir, ham `price` kolonu çekilmez.

## Kapsam dışı (bilerek)

- Misafir checkout — Recep kararı (T059 notunda açık bırakıldı).
- `/account/*` middleware guard'ı — ortak mülk, ayrı iş.
- `user_favorites` DB kalıcılığı — migration, Recep kararı (B3).

## Muafiyetler

Yok. Muafiyet gerekirse buraya **adla** yazılır ve INV-AUTH-2'de aynı adla sabitlenir.


---
# FILE: docs\standards\db-grant-hygiene-standard.md

# Cetvel — VIEW yetki hijyeni (db-grant-hygiene)

> Kapsam: `public` semasindaki **VIEW**'lar. Tablolar bu cetvelin konusu DEGILDIR (§2).
> Zorlayici kapi: `src/__tests__/conformance/db-view-grant-hygiene.test.ts` (INV-VIEW-GRANT-1)
> Kaynak olcum: `docs/audits/t101-view-grant-hygiene-2026-08-19.md` (T101-VH)
> v1.0 · 2026-08-19

## 1. Tek cumlelik kural

`public` semasinda bir view olusturan her migration, **ayni dosyada ve CREATE'ten
SONRA**, o view uzerindeki yetkileri `PUBLIC`, `anon`, `authenticated` ve `service_role`
rollerinden **REVOKE ALL** ile geri almak ve gereken okuma yetkisini **adiyla** yeniden
vermek zorundadir. `GRANT SELECT` tek basina **kapi degildir**.

```sql
CREATE VIEW public.ornek WITH (security_invoker = true) AS ...;

REVOKE ALL ON public.ornek FROM PUBLIC;
REVOKE ALL ON public.ornek FROM anon;
REVOKE ALL ON public.ornek FROM authenticated;
REVOKE ALL ON public.ornek FROM service_role;

GRANT SELECT ON public.ornek TO authenticated;   -- gerekiyorsa
GRANT SELECT ON public.ornek TO service_role;    -- gerekiyorsa
```

## 2. Nicin GRANT tek basina hicbir sey yapmaz

Olculdu (2026-08-19, prod `pg_default_acl`, sema `public`, objtype `r`):

```
anon=arwdDxtm  authenticated=arwdDxtm  service_role=arwdDxtm
```

Sekiz yetkinin tamami (INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES,
TRIGGER, MAINTAIN) **varsayilan ayricalik** olarak tanimlidir. Yani public semasinda
dogan her tablo ve her view bu yetkileri kendiliginden tasir. Migration'a yazilan
`GRANT SELECT ... TO authenticated` satiri, rolun zaten sahip oldugu bir yetkiyi
yeniden vermekten ibarettir: **etkisiz**. Durumu degistirebilen tek ifade `REVOKE`'tur.

Bu, bu depoda bir "sanki" degil, olculmus bir vakadir: `view_admin_returns`
(20260818130000) migration'i "view'a YALNIZ SELECT verilir" diye yazilmis, sonucta
`authenticated` uzerinde sekiz yetki olusmustur.

## 3. Nicin tablo ile view ayni kurala tabi degil

Supabase'in guvenlik modeli tabloda **iki katmanlidir**: yetki genis birakilir, kapi
RLS politikasidir. Bu kasitlidir ve varsayilan ayricaliklar **degistirilmemelidir** —
degistirmek tablolarin tamamini kirar.

VIEW'in **kendi RLS politikasi yoktur**. Bir view'da erisimi belirleyen tek sey
GRANT'tir (`security_invoker` yalnizca ALTTAKI tablonun RLS'ini kimin kimligiyle
degerlendirilecegini soyler; view'in kendisine erisimi kapatmaz). Dolayisiyla:

| Nesne | Kapi | Varsayilan genis yetki |
|---|---|---|
| Tablo | RLS politikasi | kabul edilir (model boyle) |
| View  | **GRANT** | **kabul edilmez** — tek tek geri alinir |

## 3.1 Tablonun kapisi ACIK KALABILIR: politika OKUYAN ROLE yazilmamis olabilir

Yukaridaki tablo "tabloda kapi RLS politikasidir" diyor. Eksik olan sey su: **politika
var olmasi yetmez, OKUYAN ROLU kapsamasi gerekir.** Kapsamiyorsa sorgu hata vermez —
bos doner. Yuzey "kayit yok" gosterir, log temizdir, kimse bakmaz.

**Olculmus vaka (2026-08-20, canli prod).** `client_errors` tablosunda iki politika var:
`merged_client_errors_service_role_select` ve `service_role_only`. **Ikisi de yalniz
`service_role` icin.** `authenticated` icin SELECT'e izin veren tek politika yok — ve
admin hata sayfasi bu tabloyu `authenticated` ile okuyor. Sonuc: **39 gercek hata,
ekranda SIFIR.** Kardes tablo `error_groups` ayni sinifta degil, cunku onun politikasi
`authenticated` + `is_admin_user()`.

Yazma yolu saglikliydi: hata kaydeden uc `service_role` ile yaziyor, yani boru CALISIYOR.
Bozuk olan yalniz **pencere**. Gozlemlenebilirlik yuzeyinde en pahali bicim budur: sistem
"hata yok" der, cunku hatalari GOSTEREMEZ — gormedigi icin degil.

### Kuralin iki kez daraltilmasi (kapi tasarimi icin kritik)

Bu sinifi olcen kural iki kez yanlis kuruldu; ikisi de rakamla curudu:

| Kural | Bulgu | Niçin yanlis |
|---|---|---|
| "RLS acik + GRANT var + politika YOK" | 1 tablo | `client_errors`'i **kacirir** (orada politika VAR, ama yanlis rol icin) |
| "(komut, rol) bazli kapsama yok" | 16 cift | Cogu **dogru tasarim**: `payment_transactions`'ta `authenticated`, `suppliers`/`purchase_orders`'ta `anon` zaten okumamali |
| **"kodda okuyan yuzey VAR + okuyan rolun politikasi YOK"** | **1 bulgu** | dogru: kesisim, gurultuyu sifirlar |

**Cikarim — cetvele giren asil cumle:** politika yoklugu **tek basina kusur degildir**,
cogu zaman guvenli haldir (varsayilan ACL genis, RLS dogru sekilde engeller). Kusur,
**kodun okudugu ile DB'nin izin verdigi ayrildiginda** dogar. Bu yuzden bu soru semaya
tek basina sorulamaz; **kod ile kesistirilmeden sorulursa gurultu uretir ve kapi susturulur.**

### Bekci

`scripts/db/checks/rls-role-coverage.mjs` (INV-RLS-COVERAGE-1) — yonetim yuzeylerinin
`.from()` ile okudugu tablolari cikarir, canli semada `authenticated` icin SELECT'e izin
veren politika olup olmadigina bakar, tabanin disindaki her yeni ihlalde kirmizi olur.
Taban `rls-role-coverage-baseline.json`, her satiri gerekce + kapanis kosulu tasir ve
**yalniz kucululur**. Olcemedigi hallerde (baglanti yok, kod taramasi bosaldi) kapi
**yesil DONMEZ**, cikis 2 verir.

**Kapsam disi ve nicin:** Edge fonksiyonlari `service_role` ile okur, RLS onlari
ilgilendirmez. Vitrin (`anon`) yuzeyleri ayri bir sorudur — oradaki bosluk "veri siziyor
mu"dur, "bos mu gorunuyor" degil; ayni kapiya sikistirilmasi iki soruyu da bulaniklastirir.

## 3.2 Politika VAR ve rolu KAPSIYOR — ama yuklemi hangi aileden?

§3.1 "politika okuyan rolu kapsiyor mu" diye soruyor. Bekci de yalnizca bunu soruyor:
yuklemin **icine bakmaz**. Bu bilincli bir darliktir, ama bir bedeli var ve bedeli burada
yaziyoruz: **ayni "kapsiyor" cevabi, iki farkli mekanizmayi ortuyor.**

**Olculdu (2026-08-20, canli katalog `pg_policies` + `pg_get_functiondef`).** Siniflandirma
**(tablo, komut)** basinadir, tablo basina DEGIL: asagidaki tablo yalnizca **SELECT/ALL**
politikalarini kapsar. Ayni tablonun yazma politikasi baska bir aileden olabilir ve
cogu zaman oyledir (ornek: `products` okuma tarafinda rol yuklemi tasimazken yazma
tarafinda profil JOIN'i kullanir). "Bu tablo A ailesinden" cumlesi **eksiktir**; dogru
cumle "bu tablo SELECT'te A ailesinden"dir.

| Aile | Yuklem nasil karar veriyor | Tablolar (SELECT/ALL) |
|---|---|---|
| **A — JWT iddiasi** | `is_admin_user()`, rolu **token claim**'inden okur | `admin_audit_log`, `data_subject_requests`, `error_groups`, `shipping_email_events`, `user_profiles`, `venthub_orders`, `venthub_quotes`, `venthub_quote_items`, `venthub_returns` |
| **B — profil JOIN** | `is_user_admin(uid)` ya da `EXISTS ... user_profiles`, rolu **her sorguda tablodan** okur | `brands`, `coupons`, `inventory_movements`, `order_notes`, `price_lists`, `pricing_policy`, `purchase_orders`, `site_settings`, `suppliers` |
| **C — yalniz tenant** | rol yuklemi **hic yok**, sadece `tenant_id` | `categories`, `currency_rates`, `inventory_settings`, `product_images`, `products`, `brands` (genel okuma) |

### Olcum yontemi aileye gore secilir

Sahte kimlik takarak olcme yontemi (`request.jwt.claims` doldur + `set local role
authenticated` + satir say) **yalniz A ailesinde gecerlidir**. B ailesinde sahte `uid`'in
`user_profiles`'ta satiri olmadigi icin yuklem **her zaman false** doner: tablo dolu olsa
ve rol dogru olsa bile sonuc 0 satirdir. Yani B ailesindeki her "bu rol hicbir sey
goremiyor" sonucu **olcum degil, yontem artifaktidir**.

Negatif kontrol bu korlugu **gizler**: "admin'de true, moderator'de false" kontrolu
A ailesinden secilirse gecer ve B ailesindeki korluk hakkinda hicbir sey soylemez.
**Kontrol kolu, kor olunan aileden secilmelidir.**

### Iki aile bagimsiz iki otorite DEGILDIR

Her ikisinin de nihai kaynagi ayni kolondur: `user_profiles.role`. Fark **kaynakta degil
zamandadir**, ve mekanizma canli govdelerden okundu:

- `custom_access_token_hook` **token uretilirken** `user_profiles`'tan rolu okuyup claim'e
  basar (profil satiri yoksa `user` damgalar — fail-closed).
- Dolayisiyla **A ailesi rolun token anindaki halini** gorur ve token yenilenene kadar
  **donmus** kalir; **B ailesi her sorguda yeniden** degerlendirir.

**BULGU — davranisla kapatildi (2026-08-20, canli prod, salt-okunur, geri alindi).**
Cikarim once fonksiyon govdelerinden turetildi, sonra **uc kolla** olculdu; ayni kimlik,
yalniz claim ile profil uyusmazligi degistirildi:

| Kol | Durum | A ailesi | B ailesi |
|---|---|---|---|
| S1 | Jeton ESKI-DUSUK rol tasiyor, profil YUKSEK (yukseltme jetona islememis) | `false` | `true` |
| S2 | Jeton ESKI-YUKSEK rol tasiyor, profil desteklemiyor (**dusurme** jetona islememis) | **`true`** | `false` |
| Kontrol | claim ile profil UYUMLU | `true` | `true` |

**Kontrol kolu sarttir:** onsuz "bu iki fonksiyon zaten hep ayrisir" denebilirdi. Uyumluyken
ikisi de ayni cevabi veriyor — demek ki ayrisma fonksiyonlardan degil **uyusmazligin
kendisinden** geliyor.

Iki sonuc:

1. **Bolunmus beyin.** Rol degistiginde A ailesindeki dokuz yuzey eski rolle, B ailesindeki
   dokuz yuzey yeni rolle cevap verir. Ne hata ne uyari cikar; sadece bazi ekranlar dolu,
   bazilari bos gorunur.
2. **Yetki dusurme A ailesinde ANINDA ETKILI DEGILDIR (S2).** Jeton hala `admin` iddia
   ettigi surece `is_admin_user()` **true** donmeye devam eder — profil artik desteklemese
   bile. Yaricapi yukaridaki A listesidir: dokuz tablo.

**Olculmeyen, acikca:** bayat claim'in **ne kadar sure** tasindigi. Jeton TTL'i ve yenileme
davranisi auth servisindedir, DB'den olculemez. Dogru cumle: *pencere VAR ve uzunlugu jeton
yenilenmesine baglidir*; "X dakika" **denemez**.

**Siddet kalibrasyonu:** bugun sistemde rol degistirilecek kullanici yok (`user_profiles` =
2 satir, ikisi de `super_admin`), yani pencere bugun **hic acilmiyor — LATENT**. Faz-2 /
bayi acilisindan once kapatilmalidir. Cozum bu cetvelin isi degildir ve iki secenek de urun
karari ister: jeton omrunu kisaltmak, ya da rol degisiminde oturumu zorla sonlandirmak
(refresh token iptali).

### Uyari — A/B ayriminin kendi onkosulu var

Bu ayrim, "**JWT icinde `user_role` claim'i VAR**" varsayimina dayanir; claim'i basan sey
`custom_access_token_hook`'tur. Hook'un **var oldugu** ve `supabase_auth_admin`'in EXECUTE
yetkisinin bulundugu olculdu — ama bunlar **vekildir, kanit degil**: izin verilmis olup hook
panelde kapali olabilir ve `auth` semasinda bunu gosteren bir yapilandirma tablosu yoktur.
Kesin test gercek bir oturumun jetonuna bakmaktir; **SQL'den dogrulanamaz**.

Hook kapaliysa claim hic basilmaz, `is_admin_user()` ilk daldan gecemez ve **profil aramasina
duser** — yani gercek oturumlarda A ailesi de fiilen B gibi calisir. Bu durumda sahte-claim
ile yapilan her olcum, gercek kullanicinin **hic girmedigi** bir yolu olcmus olur. Bu yuzden
A/B ayrimina dayanan her hukum, hook'un durumunu **olculmemis onkosul** olarak yaninda
tasimalidir.

## 4. Tehlike sinifi: latent yetki

Bugun bir view'a yazilamiyor olmasi, yetkinin zararsiz oldugu anlamina gelmez.
2026-08-19 olcumunde alti view de (a) otomatik guncellenebilir degil, (b) INSTEAD OF
tetigi yok, (c) `security_invoker`, (d) `anon`/`authenticated` NOLOGIN. Bu dortlu
bugun yazmayi imkansiz kilar.

Ama duran yetki, kosul degisince **kendiliginden** is gorur:

- view sadelesir (tek tablo, aggregate yok) -> otomatik guncellenebilir hale gelir,
- birisi INSTEAD OF tetigi ekler -> yazma yolu acilir,
- `security_invoker` bir gun dusurulur -> alt tablonun RLS'i devreden cikar.

Bu adimlarin hicbiri "yetki acmak" gibi gorunmez; kimse bir kapiyi acmaz, zaten acik
duran kapi is gormeye baslar. Bu yuzden yetki, tehlike goruldugunde degil, **view
dogdugunda** kapatilir.

## 5. Ne verilir

- `authenticated` -> yalnizca `SELECT`, ve yalnizca arayuz o view'i **okuyorsa**.
- `service_role`  -> yalnizca `SELECT` (sunucu tarafi okuma).
- `anon`          -> **hicbir sey**. Vitrin bir admin view'ini okumaz; okumasi
  gerekiyorsa o zaten admin view'i degildir.
- `PUBLIC`        -> **hicbir sey**. Gelecekte tanimlanacak roller PUBLIC'ten miras alir.
- INSERT/UPDATE/DELETE -> **view'a asla**. Yazma yolu her zaman tablodur.
  (Istisna gerekiyorsa: INSTEAD OF tetigi + bu cetvele ADIYLA muafiyet satiri.)

## 6. Bugunku sicil (2026-08-19 olcumu, T101 migration'i oncesi)

| View | anon | authenticated | Durum |
|---|---|---|---|
| `admin_users` | 7 yetki (SELECT yok) | 7 yetki (SELECT yok) | fazla |
| `inventory_summary` | 7 yetki (SELECT yok) | 8 yetki | fazla |
| `inventory_velocity` | 7 yetki (SELECT yok) | 8 yetki | fazla |
| `reserved_orders` | — | SELECT | **temiz** |
| `view_admin_orders` | 7 yetki (SELECT yok) | 8 yetki | fazla |
| `view_admin_returns` | — | 8 yetki | fazla |

Hedef durum `supabase/migrations/20260819103000_view_grant_hygiene.sql` ile kurulur;
`admin_users`'in `authenticated` icin SELECT'siz olmasi 20250910 hardening'inin bilincli
karari oldugundan **geri verilmez**.

## 7. Kapinin kapsami ve muafiyet

INV-VIEW-GRANT-1 statik bir kapidir: `supabase/migrations/**.sql` icinde view olusturan
her dosyayi tarar ve §1 desenini arar. Kapinin **goremedigi** iki sey vardir, durustce
yazilir:

1. **Canli DB durumu.** Statik tarama dosyaya bakar, prod'a bakmaz. Canli olcumu
   migration'in kendi dogrulama blogu (§3 adimi) ve elle `pg_class.relacl` sorgusu yapar.
2. **Gecmis dosyalar.** Uygulanmis migration DEGISTIRILEMEZ. Bu yuzden view olusturan
   yedi eski dosya kapida **ADIYLA** muaftir; muafiyet listesi test dosyasinda gerekcesiyle
   durur ve **buyumez** — yeni bir dosya listeye eklenmeden kapiyi gecemez.

Muafiyet listesine dosya eklemek bir karardir, kolaylik degildir: PR'da gorunur ve
gerekce ister.


---
# FILE: docs\standards\dealer-module-blueprint.md

# VentHub Bayi Modülü — Implementasyon Blueprint (Katman 4)

> **Bu dosya nedir?** Senin "biri oturup inşa edebilir mi?" testini geçen **somut build spec'i.**
> Doğrulanmış gerçek zemine (`dealer-data-ground-truth-2026-06-11.md`) oturtuldu, her dilimi **gerçek canlı
> şemaya karşı adversaryal denetlendi** (workflow `wba9ml62h`, 8 ajan). Dört dilim de **"with-fixes" =
> buildable** verdict'i aldı; bu doküman o düzeltmeleri içeride uygulayarak yazıldı.
>
> **Build-ready mi?** ONARIM fazı (R0–R5) **build-ready** — tek bir karara bağlı: **R1 kimlik ekseni** (§2).
> "Avensair-hazır" ancak **B2 (seed)** ile karşılanır; B1 tek başına premium-yüzey (§7).

---

## 1. Doğrulanmış güncel gerçek (audit'ten İLERİ — denetim düzeltmeleri)

Canlı DB, 11 Haziran audit snapshot'ından ileri gitmiş. **"Canlı kazanır"** gereği düzeltmeler:

| Konu | Audit sanıyordu | CANLI gerçek (doğrulandı) |
|---|---|---|
| `price_lists`/`product_prices` tenant_id | yok | **VAR** (NOT NULL, FK tenants, default `d3b07384`) |
| Aynıların RLS'i | anon ifşa açık | **tenant+is_active scoped + admin-gated yazma** — ama **user_type/segment daraltması YOK** |
| `venthub_orders/order_items/cart` tenant_id | bir kısmı yok | **hepsi VAR** |

**Hâlâ bozuk olanlar (plan bunlara odaklı, hepsi canlı-doğrulandı):**
1. `user_profiles.role` CHECK `'dealer'`/`'corporate'`'a izin **vermez** → `pricing.service` `user_type===role` join'i **asla tutmaz** → her ürün flat `products.price`.
2. **İki uyumsuz çözücü** — ve `order-validate` edge fn **load-time SyntaxError ile ÖLÜ** (çift `const cors` L19/L21) + `res._text()` + PostgREST `_limit`/`select=* ` boşluk bug'ları. "Tüm listeler geçer" bile yaşanmıyor; fn hiç yüklenmiyor.
3. **Snapshot bacağı yazılmıyor** — `venthub_order_items`'ta **6** snapshot kolonu (`unit_price/price_list_id/product_name/product_sku/tax_rate/product_snapshot`) var, `iyzico-payment` map'i (L409-419) hiçbirini doldurmuyor.
4. `organizations` tenant_id'siz + sadece "Anyone can view" (yazma yok); `user_projects`/`project_items` tenant_id'siz + ~100-kat iç-içe `auth.uid()` RLS anti-pattern'i.
5. `product_prices` = **0 satır**.
6. `is_user_admin()` → `role IN ('admin','superadmin')` arar ama CHECK `'super_admin'` (alt çizgi) + **app_metadata'dan değil user_profiles'tan** okur (kural 12 gerilimi). **Latent** (her iki canlı kullanıcı `admin`, bugün ateşleniyor; ilk `super_admin` atanınca kırılır).
7. 5 tablo **CREATE TABLE migration'da yok** (VCS-dışı) + drift: `20250829` migration `price_list_id_snapshot` **text** der, canlı **uuid**.

**Sabit kimlikler (seed/migration için):** tenant `d3b07384-d113-495f-a558-8c38634e0000`; org tier 1/2/3 = `b34b027d`/`c1e63fd7`/`cdeced53`; price_list individual/dealer/corporate = `d9d138d8`/`d97fff9d`/`b3a14f1a`; products=359, product_prices=0, user_profiles=2 (ikisi de admin), tenants=1.

---

## 2. Çekirdek karar: ORG-TIER tabanlı **tek fiyat sözleşmesi** + R1 kapısı

**Tek sözleşme:** segment = **`organizations.tier_level`** (role DEĞİL). `role` staff-yetkisi olarak kalır (CLAUDE.md "yetki app_metadata'dan"). Kural: `userTier = org.tier_level` (org yok → 1/individual) → aktif `price_lists` içinden `tier_level === userTier` (veya genel) seç → `product_prices(list)` → bulunamazsa `products.price` flat. **Frontend `pricing.service` ve `order-validate` AYNI kurala iner** → sepet fiyatı = server fiyatı.

> ### ✅ R1 — KARAR VERİLDİ: **(B) organization-tabanlı, B-minimal** (2026-06-12)
> Bayi = **`organizations` satırı (şirket)**; kullanıcı `user_profiles.organization_id` FK'siyle bağlanır.
> Segment çözümü: `user → organization → tier_level → price_list`.
> - **B-minimal (şimdi):** `organization_id` FK'sini etkinleştir (kolon zaten var). Bir kullanıcı bir şirkete
>   bağlı; **birden çok kullanıcı aynı şirketi paylaşabilir** (1 veya çok kişi — ikisi de yürür). `role` CHECK'e
>   **dokunulmaz** (staff-yetkisi olarak kalır).
> - **B-full (sonra, Avensair çok-kullanıcı-rol isteyince):** `dealer_user` üyelik tablosu + şirket-içi roller
>   (Bayi Admini/Kıdemli/Junior) + self-service. **Additive** — şirket entity'si kurulu olduğu için göç yok.
> - Gerekçe: A→şirket sonradan = acı göç; B-minimal→B-full = temiz ekleme. Standart §1 "Bayi≠Kullanıcı" ile uyumlu.

---

## 3. Fazlı sıra: ONARIM (R0–R5) → İNŞA (B1–B2) + faz-başı DoD

> No-Plan-No-Code: her faz öncesi onay. Her fazda: `pnpm type-check` + `pnpm test -- --run` + `get_advisors` temiz + (mutasyon varsa) `admin_audit_log`.

| Faz | İş | Definition of Done (özet) |
|---|---|---|
| **R0** | 5 VCS-dışı tabloyu versiyonla + **drift reconcile** | Idempotent `CREATE TABLE IF NOT EXISTS` (canlıyı **birebir** yansıtan — elle yazma, canlıdan dump). **`price_list_id_snapshot` text→uuid drift'i de reconcile.** Replay sonrası diff = yalnız kasıtlı reconcile. Sıfır veri kaybı. |
| **R1** ⚠️ | Kimlik ekseni (§2 kararı) | Seçilen eksen migration'da CHECK'li; mevcut 2 profil geriye-uyumlu (default individual); değer **app_metadata claim'ine** yansır (RLS okuyabilsin); `supabase:gen`. |
| **R2** | İki çözücüyü tek sözleşmeye indir + ölü edge fn'i **yeniden yaz** | `order-validate`: çift `const cors`, `res._text()`, `_limit`/`select=* ` PostgREST typo'ları, ghost kolon dizileri **hepsi** düzeltilir (yalnız const'u kapatmak fn'i "düzeldi sanılıp" bozuk bırakır). Frontend+edge AYNI girdi→AYNI fiyat. `price_list_id IS NULL` ölü dalı kaldırılır (kolon NOT NULL). |
| **R3** | Cart→order snapshot yazımını bağla | `iyzico-payment` map'e **6** snapshot alanı (`product_snapshot` jsonb dahil) eklenir; `price_list_id_snapshot` = çözücünün seçtiği liste. **Aynı dosyadaki `itemsResp._text()` bug'ı da** düzeltilir. Yeni siparişte 6 kolon dolu (staging insert ile doğrula). Okuma tarafı snapshot-kazanır: **tüm** order-item okuma noktaları (`OrdersPage`, `AdminOrders*`, **`account/OrderDetailPage`**, fatura/e-posta) `snapshot ?? legacy` pattern'ine geçer — hiçbiri atlanmaz. |
| **R4** | `organizations`/`user_projects`/`project_items` tenant_id + RLS onar | 3 tabloya `tenant_id NOT NULL` + FK tenants; backfill **fallback değil GERÇEK tenant id** (`tenants`'tan) + sıra: ADD NULL→UPDATE→FK→SET NOT NULL. `organizations` tenant-scoped admin yazma (price_lists deseni). `user_projects`/`project_items` RLS'i düz `tenant_id=jwt_tenant_id() AND user_id=(SELECT auth.uid())`'e indir (iç-içe yığını sil). Çapraz-tenant okuma testi: başka tenant verisi görünmez. |
| **R5** | Fiyat-listesi **segment daraltması** (RLS) | `price_lists`/`product_prices` SELECT'ine segment koşulu (`account_type`/tier ↔ `user_type` + NULL=genel + `is_user_admin` bypass; anon yalnız genel). Test: individual, dealer listesini **göremez**; admin hepsini. **B2'den ÖNCE** zorunlu — yoksa seed bayi fiyatını anon'a sızdırır. |
| **B1** | Bayi-Org + Fiyat-Atama Admin paneli | `admin-standard.md` cetveline uy (K1 ortak tablo kiti, K2 URL-state, K3 RBAC 3 katman, K4 `logAdminAction`, K5 beş durum). Resource Index+Details, route-modal CRUD, DI (ilk param `supabase`), i18n+token+a11y. §8 skoru **≥20/24**. |
| **B2** | `product_prices` SEED + uçtan-uca bayi siparişi kanıtı | dealer/corporate listelerine **gerçek** fiyat (idempotency: `valid_from` **sabit**, `now()` DEĞİL → `ON CONFLICT(product_id,price_list_id,valid_from) DO NOTHING`). Kanıt: dealer hesabı ürün fiyatını individual'dan **farklı** görür → sepet → order-validate → order_item snapshot'ları doğru. **Bu faz biterse "Avensair-hazır" karşılanır.** |
| **Yan** | `is_user_admin` enum onarımı | `role IN ('admin','superadmin','super_admin')` + app_metadata'dan oku. **Latent** — B1'i bloklamaz ama ilk `super_admin` kullanıcıdan önce kapat. Ayrı küçük PR. |

---

## 4. Premium-yüzey tuzakları (denetimin armağanı — bunlara DÜŞME)

Denetim, "kurulu görünüp çalışmayan" altı şey buldu. Blueprint bunları kapatır; uygulayan **kapatıldığını doğrulamalı:**
1. **Ölü edge çözücü** — `order-validate` çift-const ile yüklenmiyor; sadece görünüyor. (R2)
2. **Ölü null-dalı** — `product_prices.price_list_id NOT NULL` iken iki çözücünün `IS NULL` fallback'i asla satır döndüremez. (R2)
3. **Ölü snapshot** — 6 kolon var, sıfır kod yazıyor/okuyor. (R3)
4. **Ölü fiyat-mantığı** — `pricing.service`'in 100+ satırı staff-role'u segment'e karşı eşlediği için daima boş. (R1+R2)
5. **Seed-önce-RLS sızıntısı** — segment daraltması olmadan seed = bayi fiyatı anon'a açık. (R5 → B2)
6. **now() seed** — `valid_from=now()` `ON CONFLICT`'i tetiklemez → tekrar seed çift satır. (B2 sabit timestamp)
+ **Tek-tenant illüzyonu:** `jwt_tenant_id()` hardcoded fallback'e düşüyor; bugün doğru tenant'a denk geliyor, ikinci tenant'ta data-bleeding. (R4 gerçek-id backfill)

---

## 5. Senin karar vermen gereken açık kararlar

| # | Karar | Öneri | Neye bağlı |
|---|---|---|---|
| **1** ⚠️ | R1 kimlik ekseni: (A) account_type vs (B) organization_id FK | Avensair "bayi=kişi" → A; "bayi=şirket/çok-kullanıcı" → B | **Senin Avensair bilgin** |
| 2 | Çözücü otoritesi: server mi, paylaşılan saf-fonksiyon mu | Server-otoriter + frontend için ortak saf modül | güvenlik |
| 3 | Segment→liste: doğrudan FK mı, tier-türevi mi | MVP: tier-türevi (tek seviye); junction sonra | standart §3 |
| 4 | B1 panel kapsamı: price_list oluşturma dahil mi | MVP: mevcut 3 listeyi kullan, sadece product_prices+atama | hız |
| 5 | İskonto oranları (dealer/corporate %) | **Senin Avensair gerçeğin** (epistemik sınır) | sözleşme |

---

## 6. Build-ready verdict

- **ONARIM (R0–R5): build-ready** — R1 kararını verdiğin an başlanabilir. Migration'lar veri-modelini, kod fazları çözücü+snapshot'ı, RLS fazları izolasyonu kurar; hepsi canlı-doğrulandı.
- **B1 tek başına ≠ Avensair-hazır.** Seed (B2) olmadan panel kurulsa bile bayi indirimi görünmez — bu, kaçındığımız "dışı premium" tuzağının ta kendisi. **"Avensair-hazır" = B2 biter.**
- Sıra kritik: **R1 → R2 → (R3) → R4 → R5 → B1 → B2.** R5, B2'den önce zorunlu (sızıntı).

---

## 7. Provenance

Workflow `wba9ml62h` · 8 ajan (4 tasarla + 4 adversaryal doğrula) · 183 araç çağrısı · ~788K token · her dilim
gerçek canlı şemaya karşı denetlendi, 4/4 "with-fixes". Zemin: `dealer-data-ground-truth-2026-06-11.md`. Standart:
`dealer-network-standard.md`, `admin-standard.md`. Strateji: memory `avensair-dealer-focus`, `standard-first-strategy`.
Tüm "DOĞRULANDI" iddiaları canlı `information_schema`/`pg_policies`/`pg_constraint`/`execute_sql` ile teyitli.


---
# FILE: docs\standards\dealer-network-standard.md

# VentHub B2B Bayi-Ağı Domain Standardı

> **Bu dosya nedir?** `admin-standard.md` jenerik admin'in **NASIL**'ını anlatır. Bu dosya, onun
> kapsamadığı **B2B bayi-ağı domain'inin** standardıdır — "bir distribütör + bayi ağı platformu NE'dir."
> Dört otorite kaynak-domain'inden araştırılarak damıtıldı (provenance §15).
>
> **Epistemik sınır (önemli):** Bu doküman **kanıtlanmış B2B/PRM/CPQ pratiğine** dayanır — Avensair
> hakkında bir iddia DEĞİLDİR. "Bunların ne kadarı Avensair'e uygun, onların gerçeği nedir" → bu bilgi
> sadece kullanıcıdadır; bu standart o gerçeğe göre **budanacak/önceliklenecek**. Bkz. memory `avensair-dealer-focus`.
>
> Bu, `admin-capabilities.md`'nin **varsayıma dayalı** bayi bölümünün yerine geçer (o bölüm araştırma değildi).

---

## 0. Sade dille: bu standart neden ayrı?

Jenerik e-ticaret admin standardı (Shopify/Polaris) "tabloyu, formu, yetkiyi nasıl kurarsın"ı anlatır —
ama "bir **bayi ağını** nasıl yönetirsin"i bilmez. O bambaşka bir domain: B2B commerce + **PRM** (Partner
Relationship Management) + **CPQ** (Configure-Price-Quote). Türkiye'de çoğu firma bunu mail/Excel/genel-CRM
ile yapar; e-ticarete gömülü şeffaf bir bayi-ağı az görülür. İşte bu standart, o az görülen şeyi
**kanıtlanmış temeller üzerine** kurmak için.

---

## 1. Çekirdek model: **Bayi (hesap) ≠ Kullanıcı** (en kritik kavram)

Dört kaynağın da birleştiği temel: alıcı bir *kişi* değil, bir *şirkettir*.

| Varlık | Ne | VentHub karşılığı |
|---|---|---|
| **Bayi (Dealer/Account)** | Satın alan şirket. Self-referential `parent_dealer_id` → hiyerarşi (ulusal→bölge→şube). | ❌ YOK (en büyük eksik) |
| **Bayi Lokasyonu** | Bir bayinin şubeleri; katalog/fiyat/vade lokasyona bağlanabilir. | ❌ yok |
| **Bayi Kullanıcısı** | Bayi adına işlem yapan kişi (çok kişi / bir bayi). Atanmış satış temsilcisi. | bugün `user_projects.user_id` (org'suz) |
| **Bayi Grubu** | Ortak config paylaşan bayiler (fiyat listesi, görünürlük). | ❌ yok |

> **VentHub tohumu:** Projeler bugün tek kullanıcıya bağlı. Standart = araya **bayi-organizasyonu** katmanı
> koymak: `dealer (parent) → dealer_user (roller) → dealer_location`. Hepsi **tenant-scoped**.

## 2. Bayi içi roller & self-service (delege yönetim)

- Bir bayide çok kullanıcı; **bayi kendi kullanıcılarını yönetir** (merchant yükü azalır).
- Standart rol kademeleri: **Bayi Admini** (tam: kullanıcı/onay/satınalma), **Kıdemli Alıcı** (satınalma+onay),
  **Junior Alıcı** (onaya gönderir, doğrudan alamaz). İzinler **rollerden birikir** (OroCommerce ACL).
- Erişim seviyesi taksonomisi: None → Basic (kendi) → Local (birim) → Deep (alt birimler) → Global → System.

## 3. Bayiye özel fiyatlandırma (price list resolution)

- **Price List** = ürün fiyatları + **miktar kademeleri** + para birimi + atama kuralı + priority.
- **Override sırası (düşük→yüksek): Config < Website < Bayi Grubu < Bayi.** Her seviyede *fallback* + *merge*.
- Çözülmüş sonuç **Combined Price List**'e materialize edilir; storefront onu okur.

> **VentHub tohumu:** `priceListId` + `getEffectiveUnitPrice` **zaten var** — eksik olan, fiyat listesini
> **admin'den yönetip tier'a atayan** UI. Tohum doğru, katman eksik.

> ⚠️ **Uygulanan model ≠ bu domain ideali (çelişki değil, kapsam kararı).** Yukarısı PRM/B2B teorisinin
> tam hâli (çok-katman override, per-account). VentHub'ın **faz-1'de inşa ettiği** model
> `dealer-module-blueprint.md §2`'deki **ORG-TIER tek sözleşme**: segment = `organizations.tier_level`
> (role değil), fiyat tier'a göre çözülür. Per-account / çok-katman = ileride additive — bugün kurulmaz.

## 4. Katalog görünürlüğü (gated catalog)

Hangi ürün, hangi bayiye, hangi fiyatla görünür → per-bayi/lokasyon katalog. (Adobe Shared Catalogs,
Shopify Catalogs+Price Lists.) HVAC'ta bayiye-özel net fiyat için kritik.

## 5. Teklif hattı: **RFQ → Teklif → Sipariş** (CPQ)

- **RFQ** (teklif talebi) → **Quote** (temsilci pazarlık eder) → kabul → **Order**'a dönüşür (pazarlıklı fiyat taşınır).
- **Quote modeli:** header → satırlar → **gruplar** (bina/kat/faz) → **bundle** (ana+opsiyon = kit/montaj).
- **8 fiyat alanı** sırayla: List → Regular → Customer → Partner → Net (her indirim aşaması ayrı izlenir).
- **Versiyonlama:** yeni versiyon = yeni kayıt + revizyon geçmişi (edit-in-place değil).
- **Onay kuralı:** marj/iskonto eşiğini aşan teklif çok-seviyeli onaya gider (ad-hoc Excel iskontosu = gelir kaçağı; bunu durdurur).
- **Monoton durum** (sadece ileri) — `CLAUDE.md kural 11` ile birebir.

> **VentHub tohumu:** `user_projects` BOM + "teklif iste" var → bunu **yönetilen pipeline** yap.

## 6. Proje/BOM bazlı teklif (HVAC'a birebir)

Üç bağlı artefakt: **MTO** (metraj, +%5-10 fire) → **BOQ** (malzeme+işçilik, karşılaştırılabilir teklif) →
**BOM** (sadece malzeme, kat/zon/sistem'e paketli, kuruluma hazır).
- **BOM satır şeması:** part_number (katalog SKU), açıklama, miktar, birim, konum/zon designator,
  **hiyerarşi (parent-child / çok-seviyeli montaj)**, maliyet, tedarik süresi.
- **Katalog eşleme:** metraj satırı → senin ürün SKU'na otomatik bağlanır (manuel hata biter).
- Model: `Project ≈ Opportunity + Quote header`; `ProjectLine ≈ Quote/BOM line`.

## 7. **Ortak proje havuzu** & işbirlikli satış (senin vizyonun — isimlendirilmiş)

Senin "ortak proje havuzu" dediğin şeyin kanıtlanmış karşılığı:
- **Shopping/Requisition list** — çok liste / kullanıcı; **paylaşım izin-tabanlı** (erişim seviyesi yükselt →
  aynı birimdekiler birbirinin listesini görür; ayrı share tablosu gerekmez). Listeden Order'a **veya** RFQ'ya.
- **Account Team** — kalıcı; hesaba + cascaded fırsat/teklife erişim verir; paylaşılan **takım rolleri** picklist'i.
- **Opportunity Split** (toplam %100): **revenue/overlay/product split** → bir ortak projede **birden çok bayiyi/temsilciyi** alacaklandırma. (Şeffaflık + adil paylaşım.)

## 8. ⭐ **Deal Registration** — şeffaflık & çakışma çözümü (FARKLILAŞTIRICI)

> Senin #1 derdinin (bayilerin birbirine salça olması, ölçülememesi, şeffaflık) kanıtlanmış, **enforce edilebilir** çözümü.

- **Tanım:** Bayi bir işi/projeyi **kaydeder**; sistem zaman damgasıyla sahipliği mühürler ("first come").
  Onaylanınca, o bayi o hesapta **tek yetkili** olur; diğer bayiler VE firmanın direkt ekibi o işten men edilir.
- **Yaşam döngüsü:** `Gönderildi → (duplicate/çakışma kontrolü) → İncelemede → Onay | Ret → Kazanıldı | Kayıp | Süresi-doldu` (+ Uzatma).
- **Çakışma koruması (asıl mekanizma):** gönderimde **duplicate tespiti** (son-müşteri + ortak ürün eşleşmesi);
  aktif kayıt varken duplicate **onaylanamaz**; tek yetkili sahip; ayrı **partner pipeline** (direkt satış karışamaz).
- **Onay:** kanal yöneticisi, 24-48s SLA; temiz/yüksek-tier işler **auto-approve**; karmaşık olanlar territory/tier/değere göre yönlenir.
- **Süre (exclusivity window):** 90-180 gün; bitmeden kapanmazsa `Expired` → iş serbest kalır ("squatting" önlenir); süresi dolan yeniden gönderemez, yeni kayıt açar.
- **Kayıt verisi:** bayi, son-müşteri, iş adı, ürün(ler), tahmini büyüklük, tip (yeni/upsell), kapanış tarihi, durum, zaman damgaları, ekler.

**Bu, "e-ticaret üzerinden şeffaf bayi ağı" vizyonunun çekirdeğidir.** Kanıtlanmış mekanizma + HVAC/proje bağlamı = kopyalanması zor.

## 9. Kademeler (tier) + Territory / Rules of Engagement

- **Tier (Gümüş/Altın/Platin):** 3-4 ideal; nicel eşik (ciro, sertifika, deal-reg/çeyrek) + nitel. Tier → farklı fiyat listesi, **daha uzun deal-reg exclusivity**, öncelikli lead. Tier = çakışma **tiebreaker**'ı.
- **Çakışma tipleri/çözümleri:** yatay (bayi-bayi)→deal-reg; dikey→account mapping; direkt→PRM↔CRM görünürlüğü.
- **Rules of Engagement** portalda yayınlanır (kim neyi, hangi bölgeye, hangi eşikte satabilir). **Territory** 1:1 → lead/deal auto-assignment.

## 10. Onboarding + Performans skorkartı + Şeffaflık paneli

- **Onboarding:** Başvuru (self-register) → Onay/Aktivasyon → Eğitim/sertifika → ilk-iş desteği. Hedef: 90-gün aktivasyon ≥%60, ilk-işe <30 gün.
- **Skorkart:** Ciro (bayi-kaynaklı ciro, kayıtlı deal sayısı), Engagement (eğitim, portal girişi), Lead (dönüşüm). **Leading** göstergeleri izle, sadece lagging ciroyu değil.
- **Şeffaflık paneli:** bayi kendi deal-reg durumunu, son tarihini, skorunu (akranlara karşı), komisyonunu **canlı** görür → güven → sadakat.

## 11. Cari / Kredi / Vade + Fatura

`credit_account` (limit, bakiye, vade enum: Net 30/60...), `invoice` (durum, vade tarihi, çoklu-ödeme). Tüm cari mutasyonu **audit-log**.

## 12. Satış-temsilcisi "masquerade" / assisted selling

Temsilci **bayi adına** işlem yapar (login as → sipariş ver), **temsilci kimliği siparişte** tutulur (atıf/komisyon). HVAC B2B siparişlerinin çoğu hâlâ temsilci/telefonla gelir → bu şart.

---

## 13. Farklılaştırma sentezi — "herkesin yaptığı" vs "bizim moat"

| Kanıtlanmış (temel — uydurmuyoruz) | Bizim novel sentezimiz (moat) |
|---|---|
| Deal Registration (PRM) | **HVAC e-ticaretine gömülü** deal-reg → şeffaf, ölçülebilir bayi ağı |
| B2B price list / quote / BOM | **Spec-driven HVAC katalog** (debi/basınç/ses/filtre) + proje/BOM eşleme |
| Account teams / shared lists | **Ortak proje havuzu** — mekanik/proje firmaları aynı havuzda, splits ile adil alacak |
| Generic CRM | 14-yıl HVAC otoritesi + (ileride) ESP/DW172 seçim motoru — domain moat |

**Dürüst çizgi:** Yapı taşları kanıtlanmış (bu yüzden sağlam temel). Ayıran şey, bu taşların **HVAC + bayi-ağı + e-ticaret** kombinasyonu — senin sektör bilgin olmadan kurulamaz. Fayda için, hatır için değil.

## 14. Epistemik sınır & sıradaki adım

Bu doküman **domain gerçeği** (araştırma). **Avensair gerçeği değil.** Sıradaki: sen Avensair'i anlat
(bayi ağı pratikte nasıl işliyor, hangi parçalar onlara uyuyor, "amatör" ile neyi kastettin) → bu standardı
Avensair'e **budayıp önceliklendiririz**. Sonra `admin-standard.md §8` cetveliyle inşa.

## 15. Provenance

| Kaynak-domain | Ne verdi |
|---|---|
| **OroCommerce** (doc.oroinc.com) | Customer≠CustomerUser, hiyerarşi, ACL roller, price-list resolution (CPL), RFQ→Quote, shareable shopping lists |
| **Adobe/Magento + Shopify + BigCommerce B2B** | Company account, çok-lokasyon, delege rol (Admin/Senior/Junior), gated catalog, negotiable quote, requisition, approval workflow, kredi/vade, rep masquerade |
| **PRM / Deal Registration** (Salesforce, Oracle PRM, Magentrix, Channeltivity) | Deal registration (yaşam döngüsü, duplicate koruma, expiry), tier, territory/RoE, onboarding, skorkart, şeffaflık paneli |
| **CPQ / Quote-to-Cash + B2B CRM** (Salesforce CPQ, Procore BOM/BOQ) | Quote header→line→group→bundle, 8 fiyat alanı, versiyon, onay eşiği, proje/BOM (MTO→BOQ→BOM), Account/Contact/Opportunity, account teams, splits |

*Yakınsama: "Bayi ≠ kullanıcı", "per-account price list", "RFQ→quote→order", "monoton durum", "deal registration"
birden çok bağımsız kaynakta tekrarlandığı için standarttır — tek ürünün tercihi değil.*


---
# FILE: docs\standards\dependency-integrity-standard.md

# Bağımlılık Bütünlüğü — Cetvel v1.0

> **Kapsam:** kurulu **doğrudan** bağımlılıkların `peerDependencies` beyanları ile kurulu
> sürümler arasındaki tutarlılık. Tek soru: *bir paketin "ben şu sürümle çalışırım" beyanı,
> depoda gerçekten kurulu olanla uyuşuyor mu?*
> **Zorlayan kapı:** `INV-PEER-1` → `src/__tests__/conformance/peer-dependency-integrity.test.ts`
> **İlk yazım:** 2026-08-19 · **Ölçüm sahibi:** ALTYAPI

---

## 1. Niçin bu cetvel var — ölçülmüş boşluk

2026-08-19'da PRICING şeridi yeni bir kapı yazarken bir çatışmaya çarptı ve ölçtü:

| gerçek | ölçüm |
|---|---|
| `react-day-picker@8.10.1` peer olarak `date-fns@^2.28.0 \|\| ^3.0.0` istiyor | paketin kendi manifesti |
| depoda kurulu | `date-fns@4.1.0` |
| bu çatışma ne zamandır var | `date-fns` 3.6 → 4.1 geçişi **2026-03-17**, commit `06e94058` (`git log -L` ile ölçüldü) |
| `react-day-picker` sürümü | ilk commit'ten beri aynı |

Yani çatışma **beş aydır** oradaydı ve **hiçbir kapı görmedi.** Sebep tek cümleyle:

> Depoda hiçbir yer `npm` çağırmıyor. Her şey `pnpm` kullanıyor ve **pnpm peer çatışmasını
> hata saymaz** — yalnızca uyarır. PRICING'in yeni işi `npm` çağıran **ilk** yer olduğu için
> çatışma ilk kez orada patladı.

Bu, projenin en pahalı hata sınıfının bir örneği: **kusur ne kodda ne veride, hiç ölçülmeyen bir
yüzeyde.** Aynı gün ikinci kez görüldü (sertifika ihtiyacı da yeni değildi, yalnızca ilk kez
birinin gerçekten kontrol etmesiydi).

**Bu cetvelin ilk günündeki getirisi:** kapı yazıldığı anda, bilinen tek ihlalin yanında **iki
tane daha** buldu — biri aynı paketin `react` peer'i (aşağıda §5), biri tamamen yeni bir
`@eslint/js` ↔ `eslint` ana sürüm ayrışması. Yani ölçülmeyen yüzeyde bir değil üç kalem vardı.

## 2. Kural

1. Kurulu her doğrudan bağımlılığın her `peerDependencies` satırı, o peer'in **kurulu** sürümüyle
   uyuşmak zorundadır.
2. Uyuşmayan her satır, kapının **muafiyet listesinde ADIYLA** (paket + peer) ve **ölçümüyle**
   yazılı olmak zorundadır. Yazılı olmayan tek bir ihlal kapıyı kırmızı yapar.
3. Zorunlu (isteğe bağlı olmayan) bir peer **hiç kurulu değilse** bu da ihlaldir.
4. İsteğe bağlı (`peerDependenciesMeta.optional`) bir peer **kurulu değilse** doğru durumdur;
   ama **kuruluysa** sürümü yine denetlenir. "İsteğe bağlı", *"yokluğu serbest"* demektir,
   *"yanlış sürümü serbest"* demek değildir.

## 3. Bu kapı niçin `npm` çağırmıyor

`npm install`/`npm ls` peer denetimini kendisi yapar, ama bu depoda çağıran iş **aynı çatışma
yüzünden** `--legacy-peer-deps` vermek zorunda kaldı — ve o bayrak tam da ölçmek istediğimiz şeyi
susturur. Bir ölçüm aracını, ölçmek istediğin şeyi kapatarak kullanmak ölçüm değildir.

Bu yüzden `INV-PEER-1` kurulu ağacı **doğrudan** okur ve aralık karşılaştırmasını kendisi yapar.

### 3.1 Kurulu sürüm nasıl bulunur (üç kez yanlış kırmızı verdikten sonra yazıldı)

Bu bölüm cetvelde duruyor çünkü üç tuzağın üçü de aynı gün **yanlış kırmızı** üretti:

1. **pnpm katı yerleşim kullanır.** Kök `node_modules/` yalnız *beyan edilmiş* paketleri taşır.
   `@testing-library/dom@10.4.1` kurulu olmasına rağmen kökte **yok**; kök taraması onu
   "kurulu değil" sandı. → *Ölçüm aracının okuduğu yer, ölçümün kapsamıdır.*
2. **`createRequire`'a sembolik bağın kendisini vermek yetmez.** Node üst dizinlere yürürken
   `.pnpm` kutusuna hiç girmez ve kökte arayıp bulamaz. `realpathSync` **şart**.
3. **Bazı paketler `package.json`'ı `exports` ile kapatır** (ölçülen örnek: `three`) →
   `ERR_PACKAGE_PATH_NOT_EXPORTED`. Bu hata paketin **yok** olduğunu değil **var** olduğunu
   kanıtlar; ana girdiden yukarı yürüyüp paketin kendi manifesti bulunur.

pnpm'de aynı peer, **isteyen pakete göre farklı sürüme** çözülebilir. Bu yüzden çözümleme
(isteyen, peer) çifti başına yapılır — tek bir küresel "kurulu sürüm" varsayımı yanlıştır.

## 4. Muafiyet rejimi

Muafiyet **ücretsiz değildir**. Kapı üç ayrı testle bunu zorlar:

| test | neyi engeller |
|---|---|
| gerekçe en az 80 karakter **ve** içinde `YYYY-MM-DD` ölçüm tarihi | çıplak muafiyet ("şimdilik geç") |
| her muafiyet **hâlâ gerçek bir ihlali karşılamalı** | **bayat muafiyet** — sorun çözüldükten sonra listede kalıp kapıyı kalıcı olarak kör etmesi |
| ölçüm gerçekten koştu (taranan paket > 20, peer satırı > 50) | **sessiz-boş** tarama: hiçbir şey bulamayan bir bekçi yeşil görünür |

Bayat muafiyet testi bu cetvelin en önemli maddesidir: bir muafiyet, kendisini doğuran ihlal
ortadan kalktığında **silinmeye zorlanır**. Aksi halde muafiyet listesi zamanla kapının kendisini
yer.

## 5. Ölçülemeyen, geçmiş sayılmaz (fail-closed)

Aralık çözücüsü `||` (VEYA) ve boşluk (VE) ayrımını, `^`, `~`, `>=`, `>`, `<`, `<=`, `=`, tam
sürüm ve `*` biçimlerini tanır. Tanımadığı bir jetona rastlarsa (ölçülen örnek: `tailwindcss`
cetvelindeki `insiders` etiketi) sonuç **`olculemedi`** olur ve bu **ayrı bir kırmızıdır**:

- `ihlal` = "ölçtüm, uyuşmuyor"
- `olculemedi` = "bu biçimi okuyamadım"

İkisini aynı kovaya atmak ya da ölçülemeyeni geçmiş saymak bu bekçinin varlık sebebini ortadan
kaldırır. Bir OR dalı okunamıyor ama **başka bir dal karşılıyorsa** sonuç `karsilar`'dır — çözücü
gereksiz yere şikâyet etmez.

## 6. Kapsam sınırı — ADIYLA

Yalnız `package.json`'daki **doğrudan** bağımlılıklar (`dependencies` + `devDependencies`)
taranır. Ölçüldü (2026-08-19): bu **114 peer satırı** eder.

**Geçişli paketlerin peer beyanları bu kapının dışındadır.** Bu bilinçli bir sınırdır, eksiklik
değil: geçişli ağacın peer tutarlılığı pnpm'in çözücüsünün işidir ve depo bunu kilit dosyasıyla
sabitler. Doğrudan bağımlılıklar ise **bizim elimizle** yükseltilir — beş aylık boşluk da tam
orada doğdu.

**Ölçülmeyen kalan:** bu kapı **beyan** uyuşmasını ölçer, **davranış** uyuşmasını ölçmez. Bir
paketin peer beyanı doğru olduğu hâlde çalışma zamanında bozulması mümkündür; tersi de mümkündür
(§7'deki iki muafiyet tam bu durumda). Beyan denetimi, davranış kanıtının yerine geçmez.

## 7. Bugünün muafiyetleri (2026-08-19)

| paket | peer | sınıf |
|---|---|---|
| `react-day-picker@8.10.1` | `date-fns` (kurulu 4.1.0, isteniyor `^2 \|\| ^3`) | **bilinçli borç** — 31 adlandırılmış ithal + 2 locale ölçüldü, **eksik export yok** |
| `react-day-picker@8.10.1` | `react` (kurulu 19.0.0, isteniyor `^16.8 \|\| ^17 \|\| ^18`) | **bilinçli borç** — paket React 19 desteğini hiç beyan etmiyor; admin tarih filtresi çalışıyor ama bu *çökmedi* gözlemi, davranış kanıtı değil |
| `@eslint/js@10.0.1` | `eslint` (kurulu 9.39.4, isteniyor `^10.0.0`) | **iş emri bekleyen taze ayrışma** — `package.json` `@eslint/js`'i tek başına v10'a çıkarmış; doğru onarım iki sürümü aynı ana sürümde hizalamak |

İlk ikisi için v9'a yükseltme kararı **ölçülmüş bir kusur** gerektirir; paketin beyanı tek başına
yetmez (`docs/standards/` genel ilkesi: beyan ≠ ölçüm). Üçüncüsü borç değil, **onarılacak iş**.

## 8. Kapı eklendiğinde kanıt zorunluluğu

Bu cetveli zorlayan test, yazıldığı gün **bilerek bozularak** kanıtlanmıştır: muafiyet listesinden
bir satır çıkarıldığında kapı kırmızı olmalı, bayat bir muafiyet eklendiğinde de kırmızı olmalıdır.
Kanıtlanmamış bir kapı, kapı değildir.


---
# FILE: docs\standards\deploy-build-skip-standard.md

# Dağıtım Atlama Cetveli (Ignored Build Step) — v1.1

> **Kapsam:** Vercel'de hangi değişikliğin build tetikleyeceği.
> **Bekçi:** `src/__tests__/conformance/build-skip-positive-logic.test.ts` (INV-BUILD-SKIP).
> **Betik:** `scripts/vercel-ignore-build.sh`
> **Doğuş sebebi:** T086 — dağıtım tavanının **%47'si israftı** (2026-08-17 ölçümü);
> altı adet salt-Markdown PR'ı tek başına günlük tavanın **%12'sini** yakmıştı. Tavan
> dolunca tüm filo durur, yani bir doküman commit'i kod PR'ının önünü keser.

---

## D1 — Çıkış kodu sezgiye TERSTİR

```
exit 0  →  build ATLANIR   (ignore)
exit 1  →  build ÇALIŞIR   (continue)
```

"Başarı" (0) burada "yapma" demektir. Ters çevirmek **her build'i sessizce atlar** ve
hiçbir kırmızı üretmez — dağıtım "başarılı" görünür, sadece hiçbir şey değişmez.
INV-BUILD-SKIP'in asıl varlık sebebi bu sessiz felaketi imkânsız kılmaktır.

## D2 — POZİTİF mantık, varsayılan "BUILD ET" (DEĞİŞMEZ)

Soru **"hangi değişiklik build'i atlayabilir"** diye kurulmaz. Tersi sorulur:

> **"Bu değişiklik build GEREKTİRİR Mİ?" — bilmiyorsak, GEREKTİRİR.**

Negatif liste ("şunlar tetiklemesin") yazılırsa, listeye eklemeyi unuttuğumuz **her yeni
dosya türü sessizce build'i atlar**. Bu, 2026-08-15 vitrin kazasının kardeşidir: kod/veri
değişti, yüzey değişmedi, hiçbir kapı görmedi. Bu yüzden **tanınmayan her şey build'i
tetikler**; yalnız §D3'te ADIYLA sayılan sınıf atlanır.

## D3 — Build gerektirmeyen sınıf (pozitif liste)

| Desen | Gerekçe |
|---|---|
| `*.md` (her yol) | Ölçüldü (2026-08-18): depoda **hiçbir kod `.md` import etmiyor**, `next.config.mjs`'te MDX/remark yok. Companion doküman üretimi de `.md` yazar — israfın ana kaynağı buydu. |
| `docs/**` | Salt doküman ağacı |
| `.claude/**` · `.agent/**` | Ajan yetenek ağaçları; derlemeye girmez |
| `.github/**` | CI yapılandırması; Vercel çıktısını etkilemez |
| `registry/**` | İş emri kayıtları |
| `LICENSE` | Metin |
| `scripts/board/**` | Şerit panosu araçları. Ölçüldü (2026-08-26): `package.json`, `next.config.mjs`, `vercel.json`, `.github/workflows/*` içinde `scripts/board` geçen **tek bir referans yok**. Pozitif kontrolle doğrulandı — aynı arama `scripts/setup-hooks` için referans **buluyor**. → D3.1 |
| `scripts/hijyen/**` | Ağaç hijyeni araçları (kirli sayacı, ağaç-silme kapısı). Ölçüldü (2026-08-27): aynı arama, aynı dosyalar — `scripts/hijyen` geçen **0 referans**; pozitif kontrol `scripts/setup-hooks` için **1 referans** buluyor, yani arama gerçekten arıyor. Gerekçe `scripts/board/**` ile aynı sınıf. |
| `.githooks/**` | Git kancalarının **kendisi** (kancaları kuran betik değil). Derleme hattıyla dolaylı bağı VAR ama üç ölçülmüş sebeple atlanabilir. → D3.1 |

**Bilerek DIŞARIDA (build tetikler):** `supabase/migrations/**` — build'i doğrudan
etkilemez, ama önizleme dağıtımı migration'ın vitrine yansımasını görmenin **tek**
yoludur ve bu depoda migration merge'i prod'a **otomatik** uygulanır. Ayrıca
`.gitignore`, `package.json`, tüm yapılandırma ve elbette `src/**`.

**Listeye ekleme kuralı:** yeni bir sınıf eklemek isteyen, "bu dosya türü derlemeye
girmiyor" iddiasını **ölçerek** kanıtlar (import taraması + yapılandırma kontrolü) ve
INV-BUILD-SKIP'e o sınıf için bir assert ekler. Gerekçesiz satır eklenmez.

### D3.1 — `scripts/board/**` ve `.githooks/**` (2026-08-26, Ref REC-76)

İki sınıf eklendi. Gerekçeleri **aynı ağırlıkta değil** ve bunu açıkça yazmak gerekiyor:
birincisi temiz, ikincisi **kabul edilmiş bir artık riski** taşıyor.

**`scripts/board/**` — temiz.** Derleme hattında sıfır referans. Ölçüm, aramanın
gerçekten aradığını gösteren bir **pozitif kontrolle** yapıldı: aynı komut
`scripts/setup-hooks` için `package.json:10`'u buluyor. Bulmayan bir arama ile
"referans yok" demek, ölçüm değil sessizliktir.

**`.githooks/**` — bağı VAR, yine de atlanabilir.** `package.json`'da
`"prepare": "node scripts/setup-hooks.mjs"` var ve Vercel `pnpm install` koştuğu için
prepare de koşar. Buna rağmen atlanabilir olmasının üç ölçülmüş sebebi:

1. **Koşan dosya `scripts/setup-hooks.mjs`, `.githooks/**` değil.** O betik kancaları
   *okur*. Betiğin kendisi listede DEĞİL — ona dokunmak build'i tetikler.
2. **`setup-hooks.mjs` fail-safe.** Kancalar bozuk ya da yokken sessizce `exit 0`
   veriyor (kaynakta `catch → process.exit(0)`). Bozuk bir kanca `pnpm install`i
   düşürmüyor.
3. **Dağıtılan çıktıya hiçbir şey yazmıyor** — kancalar `.git/hooks`a kopyalanır.

**ARTIK RİSK ve neden kabul edilebilir:** atlarsak, bir `.githooks` değişikliğinin
Vercel'in install adımını bozup bozmadığını **o dağıtımda öğrenemeyiz**. Bu boşluğu CI
kapatıyor: `.github/workflows/ci.yml`'de **yol filtresi yok** (ölçüldü), yani her PR'da
`pnpm install` zaten koşuyor ve bozuk bir prepare orada kırmızı verir. Atlama, hiçbir
conformance kapısını **körleştirmiyor**. Bu cümle bir varsayım değil, kapının
kaldırılması hâlinde yeniden ölçülmesi gereken bir **ön koşul**: `ci.yml`'e yol filtresi
eklenirse bu satır geçersizleşir.

**KAPSAM DAR TUTULUR — desen yazarken iki tuzak:**

| Yanlış | Niçin tehlikeli |
|---|---|
| `scripts/*` | `scripts/vercel-ignore-build.sh`'ı da atlar — kapı **kendi değişikliğini** doğrulayamaz hâle gelir. `scripts/setup-hooks.mjs` de atlanır ve (2) numaralı gerekçe çöker. |
| `.githooks*` (sondaki `/` düşerse) | `.githooksfake/…` gibi yollar sessizce atlama sınıfına girer. |

INV-BUILD-SKIP bu iki tuzağı **adıyla** ölçer (`scripts/vercel-ignore-build.sh → BUILD`,
`scripts/setup-hooks.mjs → BUILD`, `scripts/boardfake.ts → BUILD`,
`.githooksfake/pre-commit → BUILD`). Sabotaj sınavı **5/5**: kapsamı `scripts/*`'a
genişletmek, eğik çizgiyi düşürmek, eklenen satırı sökmek ve ölçüm aracını körleştirmek
— dördü de kırmızı verdi; bozulmamış hâl yeşil kaldı (sınav vacuous değil).

## D4 — Karşılaştırma tabanı `VERCEL_GIT_PREVIOUS_SHA`, `HEAD^` DEĞİL

Bu değişken **son BAŞARILI dağıtımın** SHA'sıdır — önceki commit değil. Arka arkaya
birkaç commit atlanmışsa `HEAD^` yalnız en son commit'e bakar ve daha önceki, atlanmaması
gereken bir kaynak değişikliğini **göremez** → "kod değişti, deploy olmadı".
Son başarılı dağıtımdan bu yana biriken **tüm** değişiklikler karşılaştırılır.

> Not: `VERCEL_GIT_PREVIOUS_SHA` yalnız Ignored Build Step yapılandırıldığında ortama
> verilir; yoksa (ilk dağıtım) betik **BUILD**'e düşer.

## D5 — Fail-safe: her belirsizlik BUILD'e düşer

| Durum | Karar |
|---|---|
| `git` komutu başarısız | BUILD |
| Taban commit klonda yok (sığ klon / force-push) | BUILD |
| Değişen dosya listesi **BOŞ** | BUILD |

Sonuncusu kritik: boş liste "hiçbir şey değişmedi" değil, **"ölçemedim"** olabilir. Boş
kümede "her dosya güvenli" iddiası **vacuous olarak doğrudur** ve kapıyı sessizce açar.

## D6 — Kapı davranışı ölçer, metni değil

INV-BUILD-SKIP betiği **gerçekten çalıştırır** (fixture dosya listesiyle) ve çıkış kodunu
okur. Betiğin metnine bakan bir test, `case` dallarının gerçekte ne yaptığını göremez.
Kapı ayrıca `sh` hiç çalışmazsa **hata fırlatır** — "ölçemedim ama yeşilim" durumunu
imkânsız kılar.

---

## Kurulum — YAPILDI (2026-08-18, sahada doğrulandı)

Ayar **canlı**. Kaynak: **Vercel dashboard** (repo içi yapılandırma dosyası DEĞİL — bkz. D7).

1. Vercel → proje `venthub-hvac-esite` → **Settings** → **Build and Deployment**
   → doğrudan bağlantı: `/peckops-projects/venthub-hvac-esite/settings/build-and-deployment`
2. **Ignored Build Step** → *Behavior*: **Custom**
3. Komut kutusuna **tam olarak** (sondaki `|| exit 1` ZORUNLU — sebebi §D10):

```
sh scripts/vercel-ignore-build.sh || exit 1
```

4. **Save**.

> **DÜZELTME — cetvel iki kişiyi olmayan bir sayfaya gönderdi.** v1.0'da bu adım
> "Settings → **Git**" yazıyordu; orada **Ignored Build Step diye bir alan yok**.
> Recep sayfayı arattı, bulamadı; doğru yer **Build and Deployment**. Kusurun sınıfı
> ölçülmemiş talimatı ölçülmüş gibi yazmaktı — o bölüm zaten "dashboard erişimi bende
> yok" diye işaretliydi, yani **kendi belirsizliğini taşıyordu ama emir kipiyle konuştu.**
> Ders: erişemediğim bir yüzeyin adımını yazarken **adı değil, adı ARAMANIN yolunu** ver
> (ayarın kendi metnini arat), ya da doğrulanana dek "önerilen" diye işaretle.

## D7 — Ayarın TEK kaynağı: dashboard (yapılandırma dosyası ALTERNATİFTİR, EK DEĞİL)

Aynı ayar iki yerden verilebilir:

| Kaynak | Durum |
|---|---|
| **Vercel dashboard** → Ignored Build Step | ✅ **UYGULANAN** (2026-08-18'den beri canlı) |
| Repo kökünde `vercel.json` / `vercel.ts` → `ignoreCommand` | ⚠️ **ALTERNATİF — kurulu DEĞİL** |

**İkisini birden koymak yasak.** Vercel dokümanına göre yapılandırma dosyasındaki
`ignoreCommand` **dashboard ayarını EZER**. Yani dosyayı ekleyen kişi, farkında olmadan
canlı ayarı devre dışı bırakır ve iki kaynak sessizce çelişir — bu deponun bu hafta
iki kez yaşadığı **çift-cetvel** sınıfının aynısı.

Yapılandırma dosyasına **geçilecekse**: önce dashboard *Behavior*'ı **Automatic**'e
çevir, sonra dosyayı ekle. Sıra tersse hangi kaynağın konuştuğu belirsiz kalır.

### Kurulum sonrası ÖLÇÜM — yapıldı (2026-08-18, PR #664)

Deney: içinde **hiç kod değişikliği olmayan**, salt-Markdown bir PR. Dağıtım günlüğünden
ham satırlar:

```
Running "sh scripts/vercel-ignore-build.sh"
ignore-build: VERCEL_GIT_PREVIOUS_SHA yok (ilk dagitim?) -> BUILD
```

**Üç şey birden öğrenildi:**

1. ✅ **Kurulum çalışıyor.** Betik gerçekten koşuyor — dashboard ayarı canlı.
2. ✅ **Vercel kapısı `success` veriyor**, `pending`'de kalmıyor. Yani korkulan
   "doküman PR'ları merge edilemez hale gelir" senaryosu **gerçekleşmedi** ve
   açık doküman PR'ları için bir tehlike yok.
3. ❌ **Atlama ÖNİZLEME dallarında çalışmadı.** `VERCEL_GIT_PREVIOUS_SHA` boş geldi,
   betik güvenli tarafa düşüp build etti.

> **DÜZELTME (aynı gün, 11:46 master dağıtımı).** Yukarıdaki (3)'ü ilk yazdığımda
> *"atlama HİÇ çalışmadı, T086 sıfır tasarruf sağladı"* demiştim. **Fazla genişti.**
> Master (üretim) dağıtımının günlüğü şunu yazıyor:
>
> ```
> ignore-build: build GEREKTIREN degisiklik: src/__tests__/.../currency-not-from-language.test.ts -> BUILD
> ```
>
> Yani **master'da değişken DOLU geliyor** (o dal için son başarılı dağıtım vardır) ve
> betik gerçek bir taban karşılaştırması yapıp doğru kararı veriyor. Çalışmayan yer
> **önizleme dalları**: bu depoda kural *bir-iş-bir-dal* olduğu için her önizleme bir
> dalın ilk dağıtımıdır ve orada böyle bir taban yoktur.
>
> Doğru ifade: **T086 üretim tarafında çalışıyordu, önizleme tarafında hiç çalışmadı.**
> Tasarrufun asıl beklendiği yer önizlemeler olduğu için pratik kazanç yine küçüktü —
> ama "hiç çalışmadı" demek ölçümden fazlasını iddia etmekti.

**(3) niçin sessizdi:** betik doğru davrandı (bilmiyorsan build et), dolayısıyla
hiçbir kırmızı üretmedi. Kapı da göremezdi — bekçi betiği *dosya-listesi kipinde*
koşturuyordu ve **taban çözümü o yoldan hiç geçmiyordu**, yani kapının kapsamı
dışındaydı. Kusurun sınıfı: **ölçülmemiş premis** — "değişken dolu gelir" varsayımı
hiç sınanmamıştı ve gerekçesi (v1'de yazılıydı) kendi başına doğru olduğu için
inandırıcı görünüyordu. *Doğru gerekçe, ölçülmemiş premis.*

> **Hâlâ açık olan yarım:** *gerçekten atlanan* bir build'de kapının ne rapor ettiği
> ölçülmedi — çünkü atlama bir kez bile gerçekleşmedi. Bu düzeltmeden sonraki ilk
> salt-Markdown PR'ı o yarımı kapatacak; günlükte `taban = ... ortak ata` satırı
> aranacak. Sonuç buraya yazılır.

## D8 — Karşılaştırma tabanı bir ZİNCİRDİR, tek değişken değil

| Sıra | Taban | Koşul |
|---|---|---|
| 1 | `VERCEL_GIT_PREVIOUS_SHA` | Yalnız commit **bu klonda gerçekten varsa** |
| 2 | `git merge-base HEAD origin/<varsayılan dal>` | (1) çözülemezse; ref yoksa **refspec çekmesi** denenir |
| 3 | `git fetch origin <varsayılan dal>` → `FETCH_HEAD` | (2)'nin refspec biçimi reddedilirse |
| — | *(hiçbiri)* | → **BUILD**, ve **her başarısız denemenin SEBEBİ günlüğe yazılır** |

(1) en doğrusudur: son **başarılı** dağıtımdan bu yana biriken tüm değişiklikleri
kapsar. Ama **yeni bir dalın ilk dağıtımında yoktur** ve bu depoda kural
*bir-iş-bir-dal* olduğu için neredeyse her önizleme dağıtımı öyledir.

(2) dalın **tamamını** kapsar; dalın içindeki eski bir kaynak değişikliği de görülür.

**`HEAD^` yasağı sürüyor** ve gerekçesi değişmedi: yalnız son commit'e bakar, arka
arkaya atlanmış commit'lerden sonra daha eski bir kaynak değişikliğini göremez →
"kod değişti, deploy olmadı". Ortak ata bu tuzağa düşmez.

Zincirin **hangi adımının kazandığı günlüğe yazılır**. Bu tesadüfi bir ayrıntı değil:
yukarıdaki kusur tam olarak "hangi dalın çalıştığını göremediğimiz" için sessiz kaldı.

### ⭐D8.1 — ZİNCİRİN 2. ADIMI ÜRETİMDE HİÇ ÇALIŞMADI (2026-08-27, ölçüldü)

Yukarıdaki hüküm "(2) dalın tamamını kapsar" diyor ve **doğru**; ama üretimde o adıma
hiç sıra gelmiyordu. Vercel'in **sığ klonunda `origin/master` yok**, ve betiğin çekme
denemesi `2>/dev/null || true` ile **yutuluyordu** — başarısızlığın sebebi günlüğe hiç
düşmedi. Sonuç: **pozitif sınıf listesi bir kez bile değerlendirilmedi**, salt-`.md`
push'lar dağıtım yaktı ve HOBBY günlük kotası doldu, tren durdu.

**Kanıt — üç ayrı dağıtımın build günlüğü, üçünde de birebir aynı iki satır:**

```
ignore-build: VERCEL_GIT_PREVIOUS_SHA bos (dalin ilk dagitimi) -> ortak ataya dusuyorum
ignore-build: origin/master bu klonda yok -> BUILD
```

`d9f31989` (TEMIZLIK companion) · `f4c5c25f` (ALTYAPI 18 companion) · `304a1785` (I18N varyant).

**KUSURUN SINIFI — doğru davranış yetmez, GÖREBİLMEK gerekir.** Fail-safe'in kendisi
doğruydu: taban çözülemeyince BUILD demek doğru karardır. Kapı da bunu sınıyordu ve
*"origin/master hiç yoksa BUILD"* kolu **yeşildi**. Ama hiçbir kol şunu sormuyordu:
**bu dal üretimde İSTİSNA mı, yoksa TEK yol mu?** Sessiz bir fail-safe, "kapı çalışıyor"
ile "kapı hiç sıra bulamıyor" hallerini ayırt edilemez kılar.

### D8.2 — GERÇEK SEBEP: Vercel klonunda `origin` UZAĞI HİÇ YOK

Görünürlük onarımı **ilk koşumunda** cevabı verdi (dağıtım `5cjXTJWY`, PR #875'in kendi önizlemesi):

```
ignore-build: refspec cekmesi basarisiz -> fatal: 'origin' does not appear to be a git repository
```

Sorun refspec biçimi ya da klon derinliği **değildi**: Vercel'in derleme klonunda uzak
**tanımlı değil**. Yani `origin`'e yapılan hiçbir çekme tutamazdı — hangi refspec'i
denersek deneyelim. On günlük sessizliğin tek cümlelik sebebi budur.

**Çözüm:** uzak yoksa URL ortamdan kurulur —
`https://github.com/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG.git`. Depo **public**
olduğu için kimlik gerekmez. Repo bir gün private olursa çekme başarısız olur ve
fail-safe aynen işler (→ BUILD); yani bu çözüm güvenliği gevşetmez.

Kapı bu yolu **ağsız** koşturur: yerel bir bare depo `origin` olarak bağlanır,
`refs/remotes/origin/master` silinir, betik gerçekten çekmek zorunda kalır.
Sabotajla kanıtlandı — **her iki** çekme denemesi de kapatılınca kol düştü, geri
konunca yeşil. (İlk sabotaj denemem yalnız birinci denemeyi kapatmıştı ve kol yeşil
kaldı; "sabotaj sonuç değiştirmedi" demek yerine sabotajın kendisini ölçtüm, eksik
olan oydu. Sabotaj, sınanan yeteneği GERÇEKTEN kaldırmalıdır.)

### ⚠D8.3 — BİLİNEN BİLİNMEYEN: atlama çalışınca zorunlu `Vercel` check'i ne olur?

**Bu soru bugüne kadar hiç ortaya çıkmadı, çünkü atlama hiç çalışmadı.** D8.1'den sonra
çalışacak — ve o an yeni bir risk doğuyor. TEMİZLİK sordu, ölçmeye çalışıldı:

- `master` dal koruması **zorunlu check** listesi: `["ci", "admin-smoke", "Vercel"]` (ölçüldü, `gh api .../branches/master/protection`).
- Vercel dokümanı `ignoreCommand` exit 0 durumunda dağıtımın **CANCELED**'a geçtiğini yazıyor; **GitHub commit-status'a ne yazıldığını yazmıyor**.
- **ÖNCÜL-ÖLÇÜM: ÖLÇÜLEMEZ** — ne depoda emsal var (atlama hiç koşmadı), ne vendor dokümanında cevap. Tek yol canlı deney.

**RİSK, AÇIKÇA:** atlanan dağıtım zorunlu `Vercel` check'ini asla SUCCESS yapmazsa,
salt-doküman PR'ları **merge edilemez** hale gelir. Bu, bir kilidi başka kilitle
değiştirmek olur — kota duvarı kalkar, check duvarı doğar.

**DENEY VE GERİ ALMA PLANI (D8.1 indikten sonra, merge ETMEDEN önce ölçülür):**

1. Salt-`.md` bir dal açılır, push edilir.
2. Ölçülür: `gh pr checks` → `Vercel` bağlamı SUCCESS mi, yok mu, FAILURE mı;
   ve `gh pr view --json mergeStateStatus`.
3. **SUCCESS ya da check hiç oluşmuyor + merge mümkün** → atlama sağlıklı, devam.
4. **Check takılı kalıyor / FAILURE** → iki seçenek, ikisi de yazılı:
   - `Vercel`i zorunlu listeden çıkarmak **ÖNERİLMEZ** (kapı "vitrin derleniyor mu"yu sorar);
   - onun yerine atlama listesi **daraltılır** ya da atlama tamamen geri alınır
     (`git revert`), kota sorunu Pro planla çözülür.

Bu bölüm, "çözüm işe yaradı" denmeden önce **hangi ölçümün yapılacağını** yazar.
Yazılmayan deney yapılmaz; yapılmayan deneyin yerini varsayım alır.

**HÜKÜM:** taban çözümündeki her başarısız deneme, **adı ve sebebiyle** günlüğe yazılır.
Bir adımın sessizce düşmesi yasaktır. Kapı bunu `taban çözülemediğinde SEBEP günlüğe
yazılır` koluyla zorlar; kol bilerek bozularak kanıtlanmıştır (görünürlük satırları
kaldırılınca kırmızı, geri konunca yeşil).

### Kapı bunu nasıl ölçüyor

INV-BUILD-SKIP artık **gerçek geçici git deposu** kurar (`git init`, commit'ler,
`origin/master`'ı `update-ref` ile yazar — ağ yok) ve betiği o deponun içinde koşturur.
Bilerek bozularak kanıtlandı:

| Sabotaj | Yakalayan assert |
|---|---|
| Zincirin 2. adımını kaldır (v1 davranışı) | *salt-.md dal ATLANIR* → kırmızı |
| `merge-base` yerine `HEAD^` koy | *dalın önceki commit'inde kod varsa BUILD* → kırmızı |

İkincisi önemli: `HEAD^`'i yasaklayan **statik** assert bu sabotajı **yakalamadı**
(sabotaj `git diff HEAD^` değil `git rev-parse HEAD^` yazıyordu). Yakalayan şey
davranış testiydi — metin arayan kapının neyi göremediğinin canlı örneği.

## D10 — Komutun KENDİSİ çuvallayabilir; çıkış kodu sözleşmesi komutta zorlanır

**Kurulan komut (DEĞİŞMEZ):**

```
sh scripts/vercel-ignore-build.sh || exit 1
```

Sondaki `|| exit 1` süs değil, **sözleşmenin zorlanmasıdır**.

**Yaşanmış kusur (2026-08-18, filo çapında):** komut ilk kurulduğunda `|| exit 1` yoktu.
Betik `#660` ile master'a girdiği için **ondan eski tabanlı her dalda dosya yoktu** ve
dağıtım günlüğü şunu yazdı:

```
Running "sh scripts/vercel-ignore-build.sh"
sh: scripts/vercel-ignore-build.sh: No such file or directory
```

`sh` **127** ile çıkar. Vercel bu komuttan yalnız **iki** cevap anlar — `0` atla, `1`
build — ve başka her kodu **dağıtım hatası** sayar. Sonuç: açık 11 PR dalının **10'u**,
kodunda hiçbir kusur olmadan kırmızı verdi.

**Sınıfın adı:** betiğin İÇİNDE çıkış kodu sözleşmesi üç yerde uyarıyla yazılıydı, ama
**komutun kendisinin başarısız olabileceği** hiç hesaba katılmamıştı. Yani sözleşme
korunuyordu — sözleşmeyi çağıran kabuk satırı hariç. *Kapıyı sertleştirirken kapının
kolunu unutmak.*

`|| exit 1` davranışı:

| Betik | Çıkış | Sonuç |
|---|---|---|
| var, "atla" der | 0 | zincir kırılmaz → **ATLA** |
| var, "build" der | 1 | → **BUILD** |
| **yok / patlıyor / sözdizimi hatalı** | 127, 2, … | `\|\|` devreye girer → **BUILD** |

Yani bilinmeyen her hâl güvenli tarafa, yani build'e düşer — betiğin kendi iç tasarımıyla
(D2) aynı yön.

**Bu düzeltmenin alternatifi 10 dalın master alması olurdu:** 10 gönderim, 10 deployment,
ve kotanın bizi o gün zaten iki kez reddettiği bir ortam. Tek satır, sıfır gönderim.

## D9 — Kota reddi bir COMMIT harcar (ölçüldü, tahmin çürüdü)

Bu cetvelin varlık sebebi dağıtım israfı, o yüzden kotanın **gerçek** davranışı buraya yazılır.

**Çürüyen model:** "son dağıtımdan ~20 dk sonra gönderim geçer". Vercel'in kendi
kayıtları bunu reddetti (2026-08-18):

```
06:49 · 06:50 · 06:53 · 06:54 · 06:57 · 07:04 · 07:04   ← 15 dakikada YEDİ dağıtım
...
11:21 geçti (8 dk sonra)   ·   11:33 REDDEDİLDİ (12 dk sonra)
```

Sabit bir aralık bu veriyi açıklayamaz. **Aralık tahminine dayalı plan kurmayın.**

**Asıl operasyonel kural — asimetri buradadır:**

| Olgu | Sonuç |
|---|---|
| Reddedilen deneme **deployment yaratmaz** | Beklemek bedavadır |
| Reddedilen deneme kırmızı bir **commit status** bırakır | Ve o status **depo tarafından yeniden tetiklenemez** |
| Yeni deneme = **yeni commit** | ⇒ **kör tekrar COMMIT harcar** |

Yani "olmadıysa tekrar dene" burada masumca bir davranış değil; her denemenin bedeli
bir commit'tir. Force-push bu depoda yasak olduğu için `--amend` ile kaçamak da yok.

**Bedava prob:** başka bir şeridin açık PR'ında, senin reddinden **sonra** yazılmış bir
`pending`/`success` Vercel status'u ara. Varsa pencere açıktır. Kendi commit'ini
harcamadan ölçmenin bilinen tek yolu budur.

### Geri alma

Ignored Build Step *Behavior*'ı **Automatic**'e çevirmek yeterli; repoda değişiklik
gerekmez. Betik ve bekçi zararsız biçimde durur.

---

## D11 — Kırmızı bir Vercel kapısını uyandıran tek şey PUSH olayıdır

**Ölçüm (ADMIN, 2026-08-19, PR #686):** PR'ı kapatıp yeniden açmak Actions'ı yeniden
koşturur ama **Vercel'i tetiklemez**.

| taraf | kapat-aç sonrası |
|---|---|
| GitHub Actions | `ci`, `admin-smoke`, `advisor`, `catalog-integrity` **yeniden başladı**, hepsi success |
| Vercel | 25 dakika boyunca **hiçbir şey**: dağıtım kaydı sıfır, tek commit status 25 dk önceki **bayat failure** |

**Ayırt edici kanıt** (bu olmadan "kota yine doldu" denirdi ve yanlış olurdu): aynı
dakikalarda **başka bir dal** preview dağıtımı aldı — Vercel canlıydı. Ayrıca Vercel kota
sınırına takıldığında **status yazar**; burada 25 dakika boyunca hiç status yazılmadı.
*"Reddetti"* ile *"olaydan hiç haberi olmadı"* farkı tam buradadır: reddetseydi iz bırakırdı.

**Sonuç:** Vercel **push olayına** bakar, PR'ın açık/kapalı durumuna değil. "Yeni commit
üretmeden tetikle" talimatı Actions için doğru, **Vercel için işlevsizdir — ve işlevsizliği
SESSİZDİR**, çünkü hiçbir şey kırmızı olmaz, sadece hiçbir şey olmaz.

**Çözüm:** ağaç SHA'sı aynı kalan **boş commit** push'lamak. İçerik birebir korunur,
yalnız yeni bir commit nesnesi doğar ve push olayı Vercel'i uyandırır. Bu betik onu
**atlamaz**: değişen dosya listesi boş çıkarsa vacuous-skip koruması (`scripts/vercel-ignore-build.sh`,
"Vacuous-skip koruması" bloğu) *"ölçemedim, atlamıyorum"* deyip BUILD'e düşer.

**Ölçerken:** dağıtım **kaydı** sayısına bak, yalnız status'a değil — bayat status yeni
sonuç gibi görünür.

## D12 — "Bedava prob" DÜZELTİLDİ: yön değil, SIRA belirleyicidir

Yukarıdaki *Bedava prob* paragrafı olduğu gibi bırakılırsa yanıltır; kendi ölçümümle
daraltıyorum.

Paragraf "reddinden sonra yazılmış bir success ara, varsa pencere açıktır" diyor. İki
düzeltme gerekiyor:

1. **Sıra kuralı.** Reddin **öncesindeki** başarı hiçbir şey kanıtlamaz. 2026-08-19 ölçümü:
   `10:14:11Z` başarı → `10:14:22Z` rate-limited → `10:17:57Z` başarı. Aradaki **11 saniye**,
   sınırın kesintili olduğunun bugüne kadarki en dar kanıtı. İlk satıra bakıp "kota akıyor"
   demek yanlış olurdu; hüküm ancak **üçüncü** satırla kurulur.

2. **Probun cevapladığı soru dardır.** "Redden sonra başarı var" = *filo çapında dondurma
   haksız*. **"Benim gönderimim geçer" DEMEZ.** Kesintili sınırda ikisi ayrılmazsa prob
   yeşil ışık sanılır, peş peşe gönderim olur ve sınır yeniden dolar — bu bir kez yaşandı.

**Doğru rejim:** dondurma değil **sıralı-tek-tek gönderim**, her gönderimden sonra hedefin
**kendi kaydından** ölçüm, redde **tekrar yok** (her tekrar bir commit harcar).

İlgili: `docs/standards/measurement-discipline-standard.md` K5.

## D13 — Atlama UCUZ DEĞİLDİR: sınır, dağıtım kaydı yaratılırken işler

Bu cetvel boyunca örtük bir varsayım taşındı: *"nasılsa build atlanıyor, o gönderim
kotaya yük bindirmez."* 2026-08-19'da ölçüldü ve **çürüdü**.

**Kanıt — mümkün olan en temiz biçimi:** `aa257ad1` bir **boş commit**. Ağaç SHA'sı
ebeveyniyle birebir aynı (`d61401ec`), `git diff --name-only` **sıfır** dosya döndürüyor.
Hiçbir içerik kuralı böyle bir commit'i build'e sokamaz; tanımı gereği atlanır.

Buna rağmen:

```
commits/aa257ad1/status → Vercel: failure  2026-08-19T13:20:52Z
                          "Deployment rate limited — retry in 24 hours."
```

**Hüküm:** sınır **dağıtım kaydı yaratılırken** işliyor — Ignored Build Step'ten **önce**.
Atlama, dağıtımın *içinde* verilen bir karardır; sınır ise **kapıda** durur. İkisi aynı
katmanda değil.

**Sonuçları, adıyla:**

1. **`docs/`-only ve `*.md`-only PR'ler ucuz değildir.** Sıralamada tam slot sayılır.
   Bu cetvelin kendi PR'ı da dahil — yazarı olarak muafiyet istemiyorum.
2. **Boş commit ile yeniden-tetik de tam slot harcar.** D11 "kırmızıyı uyandıran tek şey
   push olayıdır" diyor; D13 bunun **fiyatını** ekliyor. Tetik ucuz sanıldığı için kolay
   verilir — 08-19'da bir yeniden-tetik verildikten 2 dakika sonra duvara çarptı.
3. D9 ("kota reddi bir COMMIT harcar") ile birlikte okunur: **reddedilen gönderim de
   maliyetlidir**, yani tekrar denemek maliyeti ikiye katlar, sıfırlamaz.

**Ayırt ederek — ne kanıtlandı, ne kanıtlanmadı:** yukarıdaki, **reddin** atlama
kararından önce geldiğini kanıtlar. **Başarılı** bir atlanan dağıtımın kotadan bir birim
düşüp düşmediğini kanıtlamaz.

2026-08-20 ölçümü bu açık soruyu **daralttı ama kapatmadı**: atlanan iş `deployments`
listesine hiç girmiyor (`9224bc68` → `KAYIT 0`, açıklama `Canceled by Ignored Build
Step`). Buradan "demek ki kotadan düşmüyor" sonucu **çıkarılamaz** — o liste kotanın
sayacı değildir, vekildir. Vekili asıl şeyin yerine koymak bu depoda daha önce yanılttı.
Soru hâlâ açık ve buraya *bilinmiyor* diye yazılır, *ucuz* diye değil.

**Kullanılmayan veri, niçin kullanılmadığı da yazılıyor:** ikinci örnek olarak `37cdc2d9`
(#691) düşünüldü — 13 dosyanın çoğu `.md`. Ama içinde
`src/__tests__/conformance/eol-normalization.test.ts` var, yani **md-only değil** ve
atlama sınıfına hiç girmiyor. Ayırt edici olmayan veri kanıt diye sunulmaz.

### D13.1 — İki ayrı bütçe: derleme dakikası ≠ dağıtım kotası

D13 "atlama ucuz değildir" diyor; bu madde **hangi** bütçeden söz ettiğini söylüyor.
2026-08-20'de filo tam bu boşluğa iki ayrı yönden düştü — biri bendim ("ucuz değil",
bütçe adı verilmeden), biri ADMIN'di ("atlanan iş bedava", `KAYIT 0`'dan türetilerek).
İki ölçüm çarpıştı ve ikisi de daraldı.

**İki bütçe vardır ve atlama yalnız birine dokunur:**

| bütçe | atlama etkisi | neyi sayar |
|---|---|---|
| **Derleme dakikası** | **tasarruf eder** — iş gerçekten derlenmez | değişen içerik |
| **Dağıtım kotası** | **tasarruf ETMEZ** | gönderim sayısı; içerik önemsiz |

**Ayırt edici ölçüm** (aynı gün, iki commit yan yana):

| sha | değişen dosya | KAYIT | status | açıklama |
|---|---|---|---|---|
| `aa257ad1` | **0** (ağaç SHA'sı ebeveyniyle aynı) | 0 | failure | `Deployment rate limited` |
| `9224bc68` | 1 (`docs/`) | 0 | success | `Canceled by Ignored Build Step` |

`aa257ad1` atlama sınıfına `9224bc68`'den **daha kesin** girer — hiç dosya
değiştirmiyor, hiçbir içerik kuralı onu derlemeye sokamaz. Buna rağmen
"atlandı" değil **"reddedildi"** aldı.

**Hüküm: sınır, atlama kararından ÖNCE değerlendirilir.** Atlanacak bir iş bile önce
kotaya çarpar; çarpmazsa atlanır. Dolayısıyla *"atlanan işler kota açısından bedava"*
cümlesi **kurulamaz** — ve `KAYIT 0`'dan hiç türetilemez.

### D13.2 — `KAYIT 0` tek başına yorumlanamaz

`deployments?sha=` uç noktasının boş dönmesi **beş** farklı duruma karşılık gelir.
Taksonomi ADMIN + AUTH ölçümüdür, buraya atıfla alınmıştır:

| status | açıklama | kayıt |
|---|---|---|
| success | `Deployment has completed` | **VAR** |
| success | `Canceled by Ignored Build Step` | yok |
| failure | `Canceled from the Vercel Dashboard` | **VAR** |
| failure | `Deployment rate limited` | yok |
| *status hiç yok* | (Vercel olaydan haberi olmadı) | yok |

Yani `success` görmek **dağıtıldı demek değildir**, ve `KAYIT 0` görmek
**reddedildi demek değildir**. Ayırt eden tek alan **açıklama**dır.

**Kural:** kota/pencere hesaplayan hiçbir ölçüm kayıt sayısını tek çapa olarak
kullanmaz; çapa **commit status + açıklama**dır.

### D13.3 — Ölçüm aracının kendisi sessizce kör olabilir: KISA SHA tuzağı

`deployments?sha=` **kısa SHA kabul etmez ve hata da vermez** — boş dizi döner.
Aynı commit, aynı an, iki ölçüm:

| sorgu | sonuç |
|---|---|
| `deployments?sha=caa1d1c518adb715722b7f67876f983d961083d7` | KAYIT **1** |
| `deployments?sha=caa1d1c5` | KAYIT **0** |
| `commits/caa1d1c5/status` | `success` — **çalışıyor** |

**Asıl tehlike asimetride:** `commits/<sha>/status` kısa SHA'yı sorunsuz kabul eder.
Yani ölçen kişi kısa SHA kullanmaya *alışır* — status ucunda hep çalışır — sonra aynı
alışkanlığı `deployments` ucunda kullanır ve **sessiz sıfır** alır. Sıfırı "dağıtım
yok" diye okur. Hata mesajı yoktur, uyarı yoktur; ölçüm başarılı görünür.

**Zorunlu karşı-önlem:** SHA'yı elle yazma — listeleme API'sinden al (`.[].sha` tam 40
karakter döner). Ve ölçüme **kontrol kolu** koy: bilinen-dağıtılmış bir SHA aynı sorguyla
`KAYIT 1` dönmeli. Dönmüyorsa ölçüm aracın kördür, veri değil.

> Kaynak: pano ölçümleri 2026-08-20 — ADMIN (`6cc7f2d3`) 09:42Z beş-kategorili
> taksonomi ve kontrol kolu tasarımı · AUTH (`99fa366e`) 09:33Z kayıt-doğum zamanı
> ölçümü · EDGE (`4397deef`) 09:36Z başarısız derlemenin hiç kayıt üretmediği ölçümü.
> Kısa-SHA asimetrisi bu cetvelde bağımsız olarak yeniden ölçüldü (yukarıdaki tablo).

**Öz-denetim notu:** bu maddenin ilk yarısını ("docs-only ucuz değil") 08-19'da
ölçüp yayınlamıştım, ama bütçe ayrımını yapmamıştım. ADMIN aynı veriden ters yöne
gitti ("atlanan iş bedava"). İki ölçüm çarpıştı ve **ikisi de daraldı** — doğru
sonuç bu. Sayı ikimizde de doğruydu; eksik olan, sayının **hangi bütçeyi** saydığıydı.
Kardeş ders: `docs/standards/measurement-discipline-standard.md` K13.

## D14 — Atlama garantisi TEMPOYA bağlıdır: üretim tabanı ebeveyn DEĞİL, son TAMAMLANMIŞ üretim dağıtımıdır

D4 "karşılaştırma tabanı `VERCEL_GIT_PREVIOUS_SHA`" der. Bu doğru ama **eksik**: o değişkenin
ne gösterdiği dala göre değişir ve üretimde **zamanla kayar**.

**ÖLÇÜM (2026-08-20, Vercel derleme günlüğü):** master'a inen bir birleştirmede kapı şunu
yazdı — `ignore-build: taban = VERCEL_GIT_PREVIOUS_SHA (59eb9161...)` ve kararı
`package.json -> BUILD` oldu. Oysa o commit'in **kendi** değişikliği yalnız `docs/` altındaydı.

**Mekanizma:** üretimde `VERCEL_GIT_PREVIOUS_SHA`, birleştirmenin ebeveyni değil, **en son
TAMAMLANMIŞ üretim dağıtımının** SHA'sıdır. Birleştirmeler dağıtımlardan hızlı akarsa taban
geride kalır ve fark penceresi genişler:

```
üretim dağıtımı tamamlandı  ->  A            (taban buraya çakılır)
merge 1 (docs)              ->  B
merge 2 (package.json)      ->  C
merge 3 (docs)              ->  D   <- kapı A..D bakar, package.json GÖRÜR, BUILD der
```

`D`'nin sahibi yalnız doküman değiştirmiştir ama derlemeyi **başkasının dosyası** tetikler.

**BAĞIMSIZ İKİNCİ VAKA (PRICING şeridi, aynı gün):** #709 ATLANDI, #705 DERLENDİ.
İkisi de doküman sınıfıydı, aralarında 27 dakika vardı ve **tek değişken tempoydu**.

### Sonuçları

1. **"Doküman değiştirdim, atlanacak" bir GARANTİ DEĞİLDİR** — bir tahmindir ve doğruluğu
   filonun o andaki birleştirme temposuna bağlıdır. Emir yazarken "bu PR derlenmeyecek"
   diye taahhüt etme.
2. **Kapı KUSURLU DEĞİLDİR.** Fail-safe doğru çalışıyor: pencerede build gerektiren bir dosya
   varsa BUILD demek D2/D5'in gereğidir. Yanlış olan, tabanın sabit sanılmasıdır.
3. **Ölçmek istiyorsan tek doğru kaynak derleme günlüğüdür** — kapının bastığı
   `taban = ...` satırı. Commit ebeveyninden hesap yapmak bu penceresi görmez.
4. **Yoğun günlerde atlama oranı DÜŞER.** Kota planlaması bunu hesaba katmalı: sakin günün
   ölçümü yoğun günü tahmin etmez.


---
# FILE: docs\standards\edge-function-security-standard.md

# Edge Function Güvenlik Cetveli (Edge Function Security Standard) — v1.0

> **SSOT.** `supabase/functions/**` altındaki her Deno fonksiyonunun **kimlik doğrulama, yetkilendirme,
> CORS ve deploy** duruşunu sabitler. Fonksiyon *ne yaptığı* burada değil — bu cetvel **kime cevap
> verdiğini** ve **neyi kanıtlaması gerektiğini** tanımlar.
> **Kapsam:** `supabase/functions/**` + `supabase/config.toml` + `.github/workflows/deploy-functions.yml`.
> Sınır: DB tarafı yetki → RLS/`supabase-security` · şema yıkımı → `migration-safety-standard.md`.
> v1.0 · 2026-08-14 — 26 fonksiyonun uçtan uca denetimi ve **4 canlı anonim açığın** kapatılması sonrası ilk sürüm.

---

## 1. Niçin: 26 fonksiyon, 26 farklı güvenlik duruşu

`docs/standards/` altında 19 cetvel vardı; **edge katmanı için hiçbiri yoktu.** Sonuç: her fonksiyon
kendi güvenlik modelini icat etti. 2026-08-14 ölçümü:

| Bulgu | Ölçülen |
|---|---|
| **Canlı anonim açık** (`verify_jwt=false` + gövdede sıfır kontrol) | **4** |
| **Yatay yetki açığı** (`verify_jwt=true` ama rol kontrolü yok) | **2** |
| **`auth.getUser()` argümansız** (edge'de daima 401) | **16** |
| **Elle yazılmış, `Access-Control-Allow-Origin`'i olmayan CORS objesi** | **9** |
| **Yanıltıcı per-fonksiyon `supabase.toml`** (CLI okumaz, no-op) | **6** |
| **`config.toml` ↔ prod çelişkisi** | **3** |
| **Prod'da donmuş sürüm** (CI yalnız 7/26 deploy ediyordu) | **19** |

Dört canlı açığın somut hâli — hepsi kimliksiz `curl` ile erişilebilirdi:

- `admin-order-inspect` v17 → `service_role` ile **tam sipariş satırı** (ad, e-posta, telefon, adres) döndürüyordu.
- `admin-iyzico-reconcile` v20 → bekleyen siparişleri sayıyor **ve ödeme callback'i tetikliyordu** (YAZMA).
- `refund-order-mock` v8 → imzasız `atob(jwt.split('.')[1])` ile **sahte `sub` kabul** → iade + stok iadesi.
- `stock-alert` v13 → toplu **e-posta/SMS** tetiklenebiliyordu.

Sorun tek tek fonksiyonların "dikkatsizliği" değil; **hangi çağıranın hangi kanıtı sunması gerektiği
hiçbir yerde yazılı değildi.** Bu cetvel onu yazar.

---

## 2. Çağıran sınıfları — her kuralın çıkış noktası

Bir fonksiyonun güvenlik duruşu, **kimin çağırdığından** türetilir. Dört sınıf vardır, başka yoktur:

| # | Çağıran | Taşıdığı kanıt | `verify_jwt` | Gövdede zorunlu |
|---|---|---|---|---|
| **a** | Tarayıcı + oturumlu kullanıcı | Kullanıcı JWT'si (`Authorization: Bearer <user jwt>`) | **true** | `getUser(jwt)` + **rol/sahiplik** kontrolü |
| **b** | Sunucu→sunucu (bizim altyapımız) | `Authorization: Bearer <service_role>` | **true** | Anahtarın service_role olduğunun doğrulanması |
| **c** | Harici sistem (ödeme/kargo/iade) | JWT **gönderemez** → HMAC imzası + timestamp | **false** (meşru) | **HMAC + replay guard, fail-closed** |
| **d** | `pg_cron` (DB içi zamanlayıcı) | Hiçbir auth header'ı yok | **false** (meşru) | Yan etkisi idempotent + dışa veri sızdırmaz |

**Fonksiyonun dosya başında, `Deno.serve`'den önce hangi sınıfa ait olduğu yorumla yazılır.**
Sınıfı yazılmamış yeni fonksiyon review'da reddedilir — çünkü sınıf belirlenmeden §3–§6 uygulanamaz.

**Kanonik biçim** (E11/R10 bunu birebir dayatıyor — serbest metin KABUL EDİLMEZ):

```ts
// Çağıran sınıfı: (a) oturumlu admin tarayıcısı — getUser(jwt) + rol kapısı
```

Kural: satır dosyanın **ilk 15 satırı içinde** ve `serve(`/`Deno.serve(` çağrısından **önce** olmalı;
parantez içi tam olarak `a`, `b`, `c` veya `d`. Ardından serbest açıklama gelebilir.
Bugün **26/26 fonksiyonda beyan YOK** — hepsi R10 baseline'ında borç olarak duruyor; yeni fonksiyon
beyansız eklenemez.

---

## 3. Değişmezler (İHLAL ETME)

### 3.1 `verify_jwt` varsayılanı **true** — false yalnız "çağıran JWT gönderemiyorsa"

**KURAL.** Yeni her fonksiyon `verify_jwt = true` ile başlar. `false` yalnız çağıran sınıfı **(c)** veya
**(d)** ise, yani çağıranın teknik olarak JWT üretme imkânı yoksa meşrudur. "Kolay olsun", "test
edemedim", "storefront'tan auth'suz çağrılıyor" gerekçeleri **geçersizdir**.

**Bugün meşru olan tam liste** (bunun dışına çıkmak PR'da gerekçe ister):

| Fonksiyon | Sınıf | Meşruiyet |
|---|---|---|
| `iyzico-callback` | c | Ödeme sağlayıcısı çağırıyor, JWT gönderemez |
| `returns-webhook` | c | Harici kargo/iade sistemi — gövdede HMAC + 5dk replay guard **var** |
| `shipping-webhook`, `shipping-status` | c | Harici kargo sistemi |
| `tcmb-rates-sync` | d | `pg_cron` çağırıyor, hiç auth header'ı yok |

**NEDEN.** `admin-order-inspect`, `admin-iyzico-reconcile`, `refund-order-mock`, `stock-alert` —
dördü de sınıf (a) çağıranı olan uçlardı ama `verify_jwt=false` ile prod'da duruyordu. Gövdede de
kontrol olmadığı için **kimliksiz istek doğrudan `service_role` verisine ulaştı.**

❌ **İHLAL** — sınıf (a) ucunda:
```toml
[functions."admin-order-inspect"]
verify_jwt = false          # "admin paneli kendi kontrol ediyor"
```
✅ **DOĞRU**:
```toml
[functions."admin-order-inspect"]
verify_jwt = true           # sınıf (a) — oturumlu admin tarayıcısı
```

### 3.2 Gövde yetkisi **ZORUNLU** — kimlik ≠ yetki

**KURAL.** `verify_jwt = true` bir yetkilendirme değildir. Admin/ayrıcalıklı her uçta gövde içinde
**rol kontrolü** (veya — yalnız OKUMA/kendi kaydını güncelleme uçlarında — kaynak sahipliği
kontrolü) yapılır ve başarısızlıkta **403** dönülür.

> ⚠️ **Sahiplik alternatifi PARA/STOK hareketinde GEÇERSİZDİR — bkz. §3.10-G.** Bu parantez
> 2026-08-17'ye kadar sınırsızdı ve gerçek bir açık doğurdu: `iyzico-refund` kapısı
> `isAdmin || isOwner` yazıldı (T053-VH, #558) ve cetvele **uygundu** — müşteri kendi JWT'siyle
> tam iade + stok geri-yazımı tetikleyebiliyordu (T071-B1). Kuralın kendisi izin verdiği için
> hiçbir kapı itiraz etmedi; delik koddan önce METİNDEYDİ.

**NEDEN.** `admin-orders-latest` ve `admin-update-shipping` `verify_jwt=true` idi ama gövdede rol
kontrolü yoktu: **oturum açmış herhangi bir müşteri** tüm siparişleri sayfalayabiliyor, hatta herhangi
bir siparişin kargo bilgisini **yazabiliyordu**. `verify_jwt=true` yalnız "geçerli BİR JWT var" der,
"bu kişi YETKİLİ" demez.

❌ **İHLAL**:
```ts
const { data: userRes } = await supabaseUser.auth.getUser(jwt)
if (!userRes?.user) return json({ error: 'unauthorized' }, 401)
// ...ve doğrudan service_role ile TÜM siparişler
```
✅ **DOĞRU** (kanonik desen — `admin-order-inspect` düzeltilmiş hâli):
```ts
const { data: userRes, error: userErr } = await supabaseUser.auth.getUser(jwt)
if (userErr || !userRes?.user) return json({ error: 'unauthorized' }, 401)

const { data: profile, error: profErr } = await supabaseAdmin
  .from('user_profiles').select('role').eq('id', userRes.user.id).maybeSingle()
const userRole = profile?.role as string | undefined
if (profErr || !userRole || !['admin', 'super_admin'].includes(userRole)) {
  return json({ error: 'forbidden' }, 403)
}
```
> ⚠️ **Rol literali DB sözlüğünden gelir.** Bu örnek 2026-08-17'ye kadar `'superadmin'` yazıyordu
> ve **hata buradan yayıldı**: 15 edge fonksiyonu örneği kopyaladı, R8 bekçisi de aynı ölü yazımı
> arıyordu — yani hem kaynak hem kapı yanlışı öğretiyordu. Canlı `user_profiles_role_check` yalnız
> `{super_admin, admin, moderator, warehouse, sales, viewer, user}` kabul eder; `superadmin` bir
> satıra yazılamaz bile, dolayısıyla o dal hiç eşleşmez ve **en yetkili kullanıcı 403 alır**
> (M4). Sözlük dışına çıkmayı artık `INV-EDGE-ROLE-1` imkânsız kılıyor.
- Rol okuması **`supabaseAdmin` (service_role)** ile yapılır — kullanıcı client'ı RLS altında kendi
  profilini görmeyebilir; ama **okunan `id` daima doğrulanmış JWT'den gelir**, istekten değil.
- İstek gövdesinden gelen `user_id` / `role` / `is_admin` alanları **asla** yetki kaynağı olamaz.

> **Sunucu→sunucu (sınıf b) çağıranın kanıtı: sabit-zamanlı ANAHTAR EŞİTLİĞİ — ve bu bir
> eksiklik değil, ölçülmüş bir zorunluluk (T061-VH, 2026-08-17).** "String eşitliği yerine
> kapı-doğrulamalı `role` claim'i okuyalım" fikri makul görünür ama bugün **uygulanamaz**:
> proje yeni API anahtar ailesine geçti (`sb_publishable_…` / `sb_secret_…`) ve bu anahtarlar
> **JWT değil, opak dizelerdir** — içinde okunacak bir `role` claim'i yoktur. Dolayısıyla
> doğru mekanizma eşitliktir; kusur eşitliğin kendisi değil, **erken-çıkışlı** (`===`) ve
> **her uca kopyalanmış** olmasıdır. Kanonik yol: `_shared/caller.ts::resolveCaller`
> (sabit-zamanlı karşılaştırma + tek sorguda rol/tenant + hata sınıflarının ayrımı).
> Anahtar ailesi tekrar JWT'ye dönerse bu not yeniden ölçülmeli.

### 3.3 `getUser(jwt)` — argümansız çağrı **YASAK**

**KURAL.** `auth.getUser()` daima **token açıkça geçirilerek** çağrılır: `auth.getUser(jwt)`.

**NEDEN.** supabase-js v2'de argümansız `getUser()` önce **oturum deposuna** bakar. Edge runtime'da
oturum deposu **yoktur** → `Auth session missing` → istek 401 alır. Global `Authorization` başlığı bu
yolda kullanılmaz. 16 fonksiyonda bu hata vardı; `order-validate`'de sonucu şuydu: **oturum açmış
kullanıcının checkout doğrulaması prod'da 401 alıyordu** — yani hata sadece güvenlik değil, işlevsel.

❌ **İHLAL**:
```ts
const supabaseUser = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
const { data } = await supabaseUser.auth.getUser()      // edge'de DAİMA "Auth session missing"
```
✅ **DOĞRU**:
```ts
const authHeader = req.headers.get('Authorization')
if (!authHeader) return json({ error: 'unauthenticated' }, 401)
const jwt = authHeader.replace(/^Bearer\s+/i, '')
const { data, error } = await supabaseUser.auth.getUser(jwt)
```

**Ek yasak:** JWT'yi **elle çözmek**. `atob(jwt.split('.')[1])` imzayı doğrulamaz — `refund-order-mock`
bu yolla **sahte `sub`** kabul ediyor, iade + stok iadesi yapıyordu. Token doğrulaması yalnız
`auth.getUser(jwt)` ile yapılır.

### 3.4 CORS tek kaynak — elle `cors` objesi **YASAK**

**KURAL.** CORS başlıkları yalnız `_shared/cors.ts` → `getCorsHeaders(req)` ile üretilir.
`OPTIONS` isteği bu başlıklarla 200 döner. Hata cevapları dâhil **her** `Response` bu başlıkları taşır.

**NEDEN.** Bir codemod 9 fonksiyonda `getCorsHeaders` import'unu bırakıp **çağrıyı sildi** ve yerine
elle yazılmış, içinde `Access-Control-Allow-Origin` **bulunmayan** bir obje koydu. Tarayıcıdan çağrılan
her fonksiyon bu hâliyle tamamen kırıktı — ve hiçbir statik kapı bunu görmedi.

❌ **İHLAL**:
```ts
import { getCorsHeaders } from '../_shared/cors.ts'   // import var, çağrı yok
const cors = { 'Access-Control-Allow-Headers': 'authorization, content-type' }  // ACAO YOK
```
✅ **DOĞRU**:
```ts
import { getCorsHeaders } from '../_shared/cors.ts'
Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: cors })
  ...
})
```

### 3.5 Webhook kuralı — HMAC + replay guard, **fail-CLOSED**

**KURAL.** Sınıf (c) fonksiyonlarında `verify_jwt=false` olduğu için **tek kimlik kanıtı gövdededir**:
1. Ham gövde üzerinden **HMAC-SHA256** imza doğrulaması (`x-signature`, sabit-zamanlı karşılaştırma),
2. **Zorunlu** timestamp header'ı + dar pencere (≤5 dk) replay guard,
3. Sır **yoksa** veya imza **yoksa** → **401**. Fonksiyon açılmaz.

**NEDEN.** Sırrın tanımsız olduğu durumda isteği geçiren "değer yoksa uyar-geç" geçiş modu,
`verify_jwt=false` ile birleştiğinde ucu **tam anonim** yapar — bugün kapattığımız 4 açığın mekanik
eşdeğeri. Bu bilinçli bir yasaktır: **yeni bir güvenlik kapısına asla "geçiş modu" konmaz.**

❌ **İHLAL**:
```ts
const secret = Deno.env.get('RETURNS_WEBHOOK_SECRET') || ''
if (!secret) { console.warn('secret yok, atlanıyor'); /* devam */ }   // fail-OPEN
```
✅ **DOĞRU** (`returns-webhook` deseni):
```ts
const secret = Deno.env.get('RETURNS_WEBHOOK_SECRET') || ''
const sign   = req.headers.get('x-signature') || ''
if (!secret || !sign || !(await hmacValid(secret, raw, sign))) {
  return json({ error: 'Invalid signature' }, { status: 401 })
}
const ts = req.headers.get('x-timestamp') || req.headers.get('x-event-time') || ''
if (!ts) return json({ error: 'Missing timestamp header' }, { status: 401 })
if (Math.abs(Date.now() - Date.parse(ts)) > 5 * 60_000) {
  return json({ error: 'Stale or invalid timestamp' }, { status: 401 })
}
```

**Uygulanma durumu (2026-08-15, T025-VH).** `shipping-webhook` aylarca *"başlık varsa uygula"*
ile duruyordu — yani başlığı göndermeyen çağıran için replay guard hiç çalışmıyordu (**fail-OPEN**),
kardeşi `returns-webhook` ise başlığı zaten zorunlu tutuyordu. Asimetri kapatıldı, ikisi de zorunlu.
Kapıyı sıkı kurmanın en ucuz anı buydu: entegre bir kargo sağlayıcısı henüz **yok**, kıracak canlı
çağıran da yok. → **Sağlayıcı bağlanırken `x-timestamp` (veya `x-event-time`) göndermesi
ENTEGRASYON ÖN KOŞULUDUR**; bu, sağlayıcıya iletilecek teknik gerekliliktir, sonradan gevşetilecek
bir kural değil.

Kilit: `tests/e2e/adversarial.test.ts` test 7 — *geçerli imzalı ama timestamp'siz* istek 401 almalı.
Mevcut 5 ve 6 numaralı testler bu hâli **göremiyordu** (5'te imza hiç yok, 6'da timestamp var ama
bayat), fail-open ay boyunca yeşil kaldı. Kilit bilerek-bozularak kanıtlandı: guard geri alınınca
test 7 FAIL etti.

**Adlandırılmış istisna — `SHIPPING_WEBHOOK_TOKEN` (legacy).** `shipping-webhook`, HMAC'e ek olarak
statik bir `x-webhook-token` yolunu da kabul ediyor. Bu yol da **fail-closed**'dır (env tanımlı
değilse hiç açılmaz) ve artık zorunlu replay guard'ın arkasındadır. Yine de HMAC'ten zayıftır:
sır dönmez, gövdeye bağlı değildir. **Gerçek sağlayıcı bağlanınca kaldırılacaktır**; o güne kadar
sandbox/test yolu olarak adıyla kayıtlıdır (`tests/e2e/adversarial.test.ts` bu yolu sınıyor).

### 3.6 `service_role` kuralı

**KURAL.**
- `service_role` anahtarı **istemciye asla** dönmez (cevap gövdesinde, hata mesajında, log'da).
- `service_role` client'ı **kimliği doğrulanmamış bir isteğe cevap üretmekte asla** kullanılmaz.
- Sıra sabittir: **önce kimlik (§3.3) → sonra yetki (§3.2) → ancak sonra `supabaseAdmin`.**

**NEDEN.** `admin-order-inspect` kimlik kontrolünden **önce** `service_role` ile RPC çağırıyordu;
tam sipariş satırı (ad/e-posta/telefon/adres) anonim isteğe döndü. RLS'in bütün koruması `service_role`
ile atlanır — bu yüzden o client'a geçiş noktası, fonksiyonun **güvenlik kapısının çıkışı** olmalıdır.

❌ **İHLAL**: `const admin = createClient(url, serviceRoleKey)` → hemen sorgu → sonuç dön.
✅ **DOĞRU**: 401/403 kapıları geçildikten sonra `supabaseAdmin` kullanılır; hata cevaplarında
anahtar veya ham `resp.text()` içeriği sızdırılmaz.

### 3.7 `config.toml` **tek kaynaktır**

**KURAL.**
- `verify_jwt` yalnız `supabase/config.toml` içinde tanımlanır. **Per-fonksiyon
  `supabase/functions/<ad>/supabase.toml` OLUŞTURMA** — Supabase CLI bu dosyaları **okumaz**.
- Her `[functions."<ad>"]` bloğu **tek satırlık gerekçe yorumu** taşır (çağıran sınıfı + kanıtı).
- Bir değeri değiştirmeden önce **prod'daki gerçek değer doğrulanır**
  (`mcp__supabase__list_edge_functions`). Repo değeri prod'dan **daha gevşekse** deploy **koruma düşürür**.

**NEDEN.** 6 adet per-fonksiyon `supabase.toml` vardı; hepsi no-op ve **yanıltıcıydı**:
`order-housekeeping`'te `false` yazıyordu, prod `true` idi; `shipping-notification`'daki
*"storefront'tan auth'suz çağrılıyor"* yorumu **yanlıştı** (uç sunucu-sunucu çağrılıyor). Hepsi silindi.
Ayrıca `config.toml` ↔ prod arasında **3 çelişki** vardı: `admin-orders-latest` prod'da `true`,
config'te `false` — o hâliyle yapılacak deploy **canlı korumayı kaldıracaktı**.

### 3.8 Deploy disiplini — donmuş sürüm = donmuş açık

**KURAL.**
- `deploy-functions.yml` **`supabase/functions/*` altındaki her fonksiyonu** kapsar; elle tutulan
  kısmi liste yasaktır (kapsam dizin taramasından türetilir).
- Yeni fonksiyon eklendiğinde deploy kapsamına girmesi **otomatik** olmalıdır.
- Fonksiyon değişikliği içeren PR merge edilmeden önce §4 doğrulaması yapılır.

**NEDEN.** CI bugüne dek **26 fonksiyondan yalnız 7'sini** deploy ediyordu; kalan **19'u** prod'da
2025-09 / 2026-03 sürümlerinde donmuştu. "Deploy etmiyoruz, o yüzden güvendeyiz" **yanlıştır**:
donmuş sürüm o günün açığını da dondurur — 4 canlı açığın hepsi donmuş sürümlerdeydi. Repo ≠ prod
sapması hem denetimi yanıltır (kaynağa bakan "düzelmiş" sanır) hem düzeltmeyi engeller.

> **Ters yön aynı derecede tehlikelidir:** repo'daki kod prod'dan **fakirse** (codemod hasarı, §3.4)
> deploy bir **regresyon**dur. Bu yüzden §3.7'nin "önce prod'u doğrula" kuralı deploy için de geçerlidir.

### 3.9 `tenant_id` **doğrulanmış** kimlikten türetilir — AÇIK BORÇ

**KURAL.** Bir isteğin hangi tenant'a ait olduğu, **imzası doğrulanmış** JWT'nin
`app_metadata.tenant_id` alanından okunur. Query string / gövde alanı **yalnız** çağıranın JWT
üretemediği sınıf (c)/(d) uçlarında, ve **yalnız** o ucun kendi imza kontrolünden **sonra** kabul edilir.

**BUGÜNKÜ DURUM: bu kural İHLAL EDİLİYOR** — `_shared/tenant_config.ts:16-39` (`resolveTenantId`):

1. `?tenant_id=` query parametresi **her şeyden önce** okunuyor (satır 19-21) → JWT'yi **ezer**;
2. JWT dalı da payload'ı `atob()` ile **imzasız** çözüyor (satır 29) → sahte payload kabul edilir.

Yani tenant sınırı ikisi de **istekten** geliyor. Tek tenant (`DEFAULT_TENANT_ID`) canlıyken sömürü
etkisi sınırlıdır; **Faz 2 (multi-tenant) açılır açılmaz bu doğrudan data-bleeding'dir** —
CLAUDE.md §12'nin ihlali. Fonksiyonlar `tenant_id`'yi PostgREST filtresine koyduğu için etki
"başka tenant'ın satırını oku/yaz"a kadar gider.

**Neden bu PR'da düzeltilmedi:** doğru düzeltme sırayı çevirmek DEĞİL — `atob` kaldıkça saldırı
query-param'dan sahte-JWT'ye taşınır, kapanmaz. Gerçek çözüm `resolveTenantId`'yi **async** yapıp
`auth.getUser(jwt)` ile doğrulanmış `app_metadata`'dan okumaktır; bu 26 fonksiyonun çağrı yerini
etkiler ve kendi doğrulama turunu hak eder. Yarım düzeltme "kapandı" yanılsaması üretirdi.

**Ratchet durumu:** iki kural da CANLI ve ikisinin de baseline'ında bu dosya adıyla duruyor —
`atob` için **R6**, sıralama için **R11** (`_shared/tenant_config.ts:20`). Yeni bir ihlal FAIL eder;
düzeltme yapılınca **iki baseline satırı da silinmelidir** (stale-guard zaten zorlar).
Göç planı: `docs/plans/tenant-id-hardening-2026-08-15.md` (7 adım, ölçülmüş çağıran envanteriyle).

---

### 3.10 Dış para hareketi — **çağır-önce-talep-et** ve sonlanma durumu SOĞURUCU

> Bu bölüm 2026-08-16'da eklendi. Eklenme sebebi bir boşluktu: cetvel webhook'ları (§3.5)
> ve yetkiyi (§3.2) düzenliyordu ama **para hareketi hakkında tek bir değişmez içermiyordu.**
> Boşluk ücretsiz değildi — `iyzico-refund` iki yıl boyunca başlığında *"Idempotent"* yazarak
> durdu ve idempotent değildi. Hiçbir kapı bunu göremedi çünkü ölçecek kural yazılmamıştı.

**KURAL A — PSP'yi çağırmadan ÖNCE talebi yaz.** Dış bir ödeme sistemine (İyzico) para
hareketi isteği gönderen her fonksiyon, isteği **önce** veritabanındaki bir talep defterine
yazmalı; defterdeki **benzersiz kısıt** çakışırsa PSP'ye **hiç gitmemelidir.**

```
1. talebi YAZ   → unique çakıştı mı? → PSP'ye GİTME, mevcut sonucu döndür
2. PSP'yi çağır
3. sonucu aynı satıra işle
```

*Niçin bu sıra:* tersi (önce çağır, sonra yaz) yazma düştüğünde **para hareketinin hiçbir
izini bırakmaz** — bir sonraki çağrı aynı guard'ı geçip parayı ikinci kez gönderir.
`iyzico-refund`'da tam olarak bu vardı: PSP sonrası `PATCH` boş `catch {}` içindeydi ve
fonksiyon yine `200 {status:'refunded'}` dönüyordu.

**KURAL B — `if (durum === 'X') return` bir idempotency mekanizması DEĞİLDİR.** Okuma ile
yazma arasındaki pencereyi uygulama katmanı kapatamaz; iki eşzamanlı istek aynı okumayı
yapar ve ikisi de geçer. Karşılıklı dışlamayı **veritabanı** yapmalıdır (benzersiz indeks
ya da `FOR UPDATE`). Aynı şekilde **yazılıp hiç okunmayan bir bayrak** koruma değildir —
`manual_refund_applied` tam olarak böyleydi.

**KURAL C — belirsizlik OTOMATİK çözülmez.** Talep `in_flight` kalmışsa "para çıktı mı
bilmiyoruz" demektir. Zaman aşımıyla kendiliğinden serbest bırakmak, kapatılan çift-ödeme
penceresini **en kötü anda** (PSP yavaşken) geri açar. Doğru davranış: **409 + alarm**,
yani insan kararı. Ağ hatasında talep `failed` değil **bilerek `in_flight`** bırakılır:
istek PSP'ye ulaşıp cevabı kaybolmuş olabilir.

**KURAL D — para geçtikten sonra hiçbir hata yutulmaz.** `//` para hareketinden sonraki
kod yolunda boş `catch {}` **yasaktır**. Yutulan her hata, bir sonraki çağrıda ikinci kez
para göndermenin izinsiz kapısıdır. Yazma başarısızsa: 5xx + `raiseRevenueAlarm`.

**KURAL E — dış sistem para/ödeme durumu ilan EDEMEZ.** Bir kargo webhook'u `refunded`
yazamaz; `refunded` PSP kanıtıyla ödeme fonksiyonunun yazdığı bir durumdur. Genel biçim:
**dış sinyalin yazabileceği durum kümesi, iç durum makinesinin izin verdiklerinin ALT
KÜMESİDİR.**

**KURAL F — sonlanma (terminal) durumu SOĞURUCUDUR ve sıralamayla ifade edilmez.** İş akışı
statüleri bir sayı ekseni değil, bir geçiş grafiğidir. `returns-webhook` statüleri
`{requested:0 … rejected:1 … refunded:4, cancelled:4}` diye sıralıyordu; sonuç iki kaçaktı:
`rejected` (sonlanma, rütbe 1) kargo firmasının `in_transit` (2) mesajıyla **canlanıyor**,
`refunded`→`cancelled` ise eşit rütbe olduğu için (`4 < 4` yanlış) **geçiyordu**. Geçişler
açık bir tabloda tutulur; sonlanma durumlarından çıkış **yoktur.**

**KURAL G — para/stok hareketini yalnız AYRICALIKLI ROL tetikleyebilir; sahiplik yetmez.**
Bir kaynağın sahibi olmak onu **okuma** yetkisi verir; o kaynak üzerinden **para iade etme
veya stok geri yazma** yetkisi vermez. Bu kararlar tüccarındır. Bu yüzden §3.2'nin "veya
kaynak sahipliği" alternatifi para/stok hareketi yapan uçlarda **geçersizdir**: kapı
`rol ∈ {admin, super_admin}` biçiminde olmalı, `rol || sahiplik` biçiminde **olmamalıdır**.

*Niçin ayrı bir kural gerekti:* §3.10 A–F para hareketinin **nasıl** yapılacağını (talep
defteri, idempotency, belirsizlik, yutulmayan hata, kim ne yazabilir) düzenliyordu ama
**kimin tetikleyebileceğini** hiç sormuyordu; §3.2 ise sahipliği serbestçe alternatif
sunuyordu. İkisi ayrı ayrı doğruydu, kesişimleri açıktı: `iyzico-refund` kapısı
`isAdmin || isOwner` yazıldı (#558) ve **her iki kurala da uyuyordu** — oysa müşteri kendi
JWT'siyle tam iade + stok geri-yazımı tetikleyebiliyordu (T071-B1, 20-madde v2 raporunun tek
lansman-engeli). `service_role` istemcisi kullanıldığı için RLS de yedek değildi.

Müşterinin meşru yolu **talep açmaktır** (`venthub_returns`), kararı admin verir.
Bu sınır kaldırılacaksa (ör. "otomatik iade" ürün kararı), önce burada yazılır: hangi
koşulda, hangi üst sınıra kadar, hangi kaydı bırakarak.

**Kapılar (CANLI, bilerek-bozularak kanıtlandı):**

| Kural | Kapı | Kanıt |
|---|---|---|
| E, F | `INV-RETURN-1` — `src/__tests__/conformance/returns-webhook-transitions.test.ts` | 2026-08-16: 5 sabotaj KIRMIZI (refunded yazımı · terminal kaçışı · istemcide olmayan geçiş · rank haritasının dönüşü · kapının devre dışı bırakılması) + 1 yanlış-pozitif kontrolü YEŞİL |
| G | `INV-PAY-3` (R4) — aynı dosya | 2026-08-17: PSP çağıran fonksiyonun kapısına sahiplik dalı geri eklendi → KIRMIZI; rol kontrolü silindi → KIRMIZI; yanlış-pozitif kontrolü (sahiplik yalnız OKUMA sorgusunda) YEŞİL |
| A–D | `INV-PAY-3` — `src/__tests__/conformance/payment-money-move.test.ts` | 2026-08-16: 5 sabotaj KIRMIZI (talep defteri atlanarak PSP çağrısı · boş `catch{}`'in dönüşü · emekli `refund-order-mock`'un yeniden DB'ye yazması · 410 yerine 200 · iadenin stoğu doğrudan yazması) + 1 yanlış-pozitif kontrolü YEŞİL |

> ⚠️ `INV-RETURN-1` bir dersi kendi içinde de taşır: ilk sürümü `kaynak.includes('canCarrierTransition')`
> diyordu ve sabotaj turunda **yeşil kaldı** — çağrı silinmiş olmasına rağmen `import` satırı
> ismi hâlâ içeriyordu. Bir ismin dosyada geçmesi çağrıldığı anlamına gelmez; kapı çağrıyı
> (`ad\s*\(`) aramalı ve import satırlarını hariç tutmalıdır.

---

### 3.11 Yapılandırma boşluğu **davranış değiştiremez** — fail-CLOSED, ve görünür

**KURAL.** Bir ortam değişkeni eksik ya da geçersizse doğru cevap *"başka bir şey yap"* değil,
**"yapma"**dır. Özellikle: bir env okuması **mutlak bir http(s) adresine** düşürülemez. Adres
varsayılanı, yapılandırma boşluğunu bir **arıza** olmaktan çıkarıp **sessiz bir davranış
değişikliğine** çevirir — istek başarılı olur, yalnızca yanlış yere gider.

**NİÇİN (2026-08-19 · T100-VH, ölçüldü).** Üç ödeme ucunda birden şu satır vardı:

```
Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com'
```

Hemen alt satırlarda `IYZICO_API_KEY`/`IYZICO_SECRET_KEY` için **fail-CLOSED** kontrol
duruyordu (eksikse `500 CONFIG_ERROR`). Yani **aynı dosyada, aynı yapılandırma ailesi için iki
farklı politika** yaşıyordu: *anahtar* eksikse duruyoruz, *hedef ortam* eksikse sessizce başka
bir ortama gidiyoruz.

Tehlike sıralaması sezgiye aykırıdır ve kuralın çekirdeği budur: **eksik anahtar gürültülüdür**
(istek düşer, biri görür), **eksik adres sessizdir** (istek geçer, yanlış yere gider). Sessiz
olan daha tehlikelidir.

> ⚠️ **ONARIM, ONARDIĞI ŞEYİN ADINI TAŞIYIP KUSURUNU TAŞIMAYA DEVAM EDEBİLİR.**
> `iyzico-callback` içindeki T022-VH yorumu bu tehlikeyi zaten **adıyla** anlatıyordu
> ("prod anahtarları konulduğu an ödeme prod'da başlar ama callback sandbox'a sorar → para
> çekilir, sipariş doğrulanamaz"). O düzeltme sabit-kodlu sandbox'ı env'e taşıdı ama
> **sandbox varsayılanını korudu**. Sınıf kapanmadı, yalnızca **yer değiştirdi** — ve yeni
> yerinde bir daha görülmedi, çünkü üstünde "düzeltildi" etiketi vardı.

**ÜÇ ALT KURAL.**

1. **Fail-closed çözücü.** Kritik adresler `_shared/config_audit.ts::resolveIyzicoBase` gibi
   **varsayılan üretmeyen** bir çözücüden geçer; değer yoksa çağıran uç isteği adıyla düşürür.
2. **Pozitif öz-denetim.** Denetim hata *aramaz*, her kalemin iyi olduğunu **kanıtlamaya**
   çalışır ve kanıtlayamadığını `eksik`/`gecersiz` diye işaretler. Fark pratiktir: hata arayan
   bir denetim hiç okunmamış bir değişken için **sessiz kalır**; kanıt arayan bir denetim onu
   "kanıtlanamadı" diye raporlar.
3. **İLİŞKİ de denetlenir.** En değerli hüküm `tutarsiz`'dir: *üretim sitesi + sandbox ödeme
   ucu*. İki değer de **tek başına geçerli** görünür; kusur değerlerde değil **aralarındaki
   ilişkide** yaşar. Kalemleri tek tek denetleyen hiçbir kapı bunu göremez.

**GÖRÜNÜRLÜK.** Sonuç bir **hükümdür** ve dışarı verilir (`healthz`). Hüküm sır **değeri**
taşımaz; yalnız `ok/eksik/gecersiz/tutarsiz` ve URL'ler için **konak adı** yazılır — konak adı
sır değildir ve teşhisin tamamı ona bağlıdır.

**ÖLÇEMEYEN YEŞİL DÖNEMEZ.** `healthz` eskiden `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` yokken
DB'ye **hiç bakmadan** `200 {ok:true}` dönüyordu: "ölçülemedi" yalnızca bir **etiketti**. Uç artık
üç durum ayırır ve ikisi yeşil değildir: `saglikli` (200) · `bozuk` (503, ölçüldü ve yanlış) ·
`olculemedi` (503, ölçüm yapılamadı). İkisi ayrı tutulur çünkü **onarımları farklıdır** — biri
değeri düzeltmeyi, diğeri ölçüm yolunu onarmayı gerektirir.

**KAPI.** `INV-CONFIG-1` — `src/__tests__/conformance/config-fail-closed.test.ts`.

**AÇIK BORÇ (ölçüldü, çözülmedi).** `healthz`'in repoda **hiçbir çağıranı yok** ve
`verify_jwt = true` olduğu için kimliksiz bir uptime probe'u zaten `401` alır: "izleme ucu"
diye yazılmış ama o işi yapamıyor — yetenek var, çağıran yok (krş. T095). Doğru çözüm bu uca
kapıyı açmak **değildir** (uç artık teşhis içeriği taşıyor); içerik taşımayan ayrı bir canlılık
ucu ya da kimlikli bir izleyici gerekir. **Ürün kararı — Recep'te.**

---

### 3.12 Paylaşılan girdiye dokunan değişiklik, prod'u **master'a karşı ölçmeden** inmez

`supabase/config.toml` ve `supabase/functions/_shared/**` **paylaşılan girdilerdir**: biri
değişince `scripts/edge/select-functions.mjs` **tüm** uçları seçer ve merge 27+ fonksiyonu
yeniden dağıtır. Ölçüldü (2026-08-23, #794'ün dosya listesi seçiciye verildi): **28 fonksiyon
seçildi.**

Toplu yeniden dağıtım, prod'da master'dan **sapmış** bir uç varsa onu **sessizce ezer**.
Bu deponun bu bedeli ödediği kayıtlı: 19 fonksiyon aylarca donmuş kaldı, repoda kapatılmış
dört kimlik-doğrulamasız açık prod'da CANLI kaldı; ters yönde de bir fonksiyonun repo sürümü
prod'dakinden fakirdi ve körlemesine deploy **regresyon** olurdu.

**KURAL:** paylaşılan girdiye dokunan her PR'da CI, prod'u **master'a karşı** ölçer
(`scripts/edge/drift-check.mjs`). Sapma varsa iş **KIRMIZI**, merge durur; bulgu panoya
yazılır ve kararı Recep verir (ezmek mi, önce prod'u incelemek mi).

**Niçin dağıtım işindeki sapma dedektörü YETMEZ.** `deploy-functions.yml` içindeki drift işi
`needs: [deploy]` ile tanımlıdır — prod **zaten ezildikten sonra** koşar. Orada yeşil olması
kaçınılmazdır; ölçtüğü şey *"dağıtım eksiksiz oturdu mu"*, *"önceden sapma var mıydı"* değil.
İkincisi yalnız merge'den **önce** sorulabilir ve cevabı merge'den sonra **artık ölçülemez**.
(2026-08-23'te tam bu yaşandı: #794 merge edildikten sonra istenen sapma ölçümü geçersizleşti;
kurtaran şey 04:53'teki **dağıtımsız** zamanlanmış koşumdu — 27/27, sapma 0 — yani şanstı.)

**Niçin BEYAN değil ÖLÇÜM.** İlk tarif *"PR gövdesinde `DRIFT:` bloğu bulunsun; rapor 24
saatten eskiyse tazele"* idi ve iki kusuru vardı: (1) gövdede bir kelimenin bulunması raporun
okunduğunu da doğru olduğunu da kanıtlamaz — **beyan mekanizma değildir**; (2) *"24 saat"*
**zamanla kayan** bir ölçüdür, aynı kanıt on dakika sonra geçersiz sayılır. Kapı ölçümü PR
anında yaptığı için tazelik sorusu ortadan kalkar.

**İnce nokta — niçin `ref: master`.** `drift-check.mjs` prod'u **çalışma ağacıyla**
karşılaştırır. PR dalında koşarsa PR'ın kendi değişikliği "sapma" görünür ve **yanlış kırmızı**
verir. Bu yüzden checkout PR head'ine değil master'a yapılır: sorulan soru *"prod şu an master
ile aynı mı"* — PR'ın içeriğinden bağımsız.

**Sır yoksa ATLANIR, yeşil DÖNMEZ.** Fork PR'ında `SUPABASE_ACCESS_TOKEN`/`PROJECT_REF`
bulunmaz; ön-yoklama işi kapıyı atlatır ve `::warning` basar. **Atlanmış iş başarılı değildir.**

Uygulama: `.github/workflows/edge-shared-input-drift.yml` · kapı: `INV-EDGE-DRIFT-1`
(bağlanma testi: `src/__tests__/conformance/edge-shared-input-drift.test.ts`).

## 4. Doğrulama — kaynağa bakarak değil, **ÇAĞIRARAK**

**KURAL.** Bir fonksiyonun güvenli olduğu, kodunu okuyarak değil **prod'a istek atarak** kanıtlanır.
Deploy sonrası her fonksiyon için üç çağrı:

```bash
# 1) Kimliksiz istek reddediliyor mu?  Beklenen: 401 (sınıf a/b) · 401 (sınıf c — imza yok)
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$FN_URL" -H 'Content-Type: application/json' -d '{}'

# 2) Geçerli ama YETKİSİZ kullanıcı reddediliyor mu?  Beklenen: 403  (§3.2 yatay yetki)
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$FN_URL" -H "Authorization: Bearer $CUSTOMER_JWT" -d '{}'

# 3) CORS preflight ACAO dönüyor mu?  Beklenen: 200 + Access-Control-Allow-Origin
curl -s -D - -o /dev/null -X OPTIONS "$FN_URL" \
  -H 'Origin: https://venthub-hvac-esite.vercel.app' | grep -i 'access-control-allow-origin'
```

- **200 dönen kimliksiz istek = açık.** Cevabın "boş" olması savunma değildir — `stock-alert` boş
  cevap dönerken e-posta/SMS gönderiyordu; **yan etki cevapta görünmez.**
- Sınıf (d) fonksiyonlarında (1) 200 dönebilir; bu durumda kanıt yükü **idempotentlik + veri
  sızdırmamak**tır ve PR açıklamasında yazılır.
- Statik kapılar bu sınıfı **göremez**: `deno check` tip hatasını yakalar, `verify_jwt=false` +
  boş gövdeyi yakalamaz. Runtime çağrısı zorunludur.

---

## 5. Makine ile denetlenebilir maddeler (conformance testi için liste)

Aşağıdakiler `src/__tests__/conformance/` altında **statik** INV testine dönüşebilir. Testi yazacak
ajan için net kapsam (statik-tarama gotcha'ları → `conformance-test-static-scan-gotchas`:
`import.meta.glob`, tam-literal kök glob, ratchet + stale-guard):

**Durum sütunu = kapı GERÇEKTEN var mı.** Cetvelin master'da olması işin yapıldığı anlamına gelmez;
`CANLI` olanlar `src/__tests__/conformance/edge-security.test.ts` içinde **bilerek-boz-kırmızı-gör**
yöntemiyle kanıtlandı. 2026-08-15: R1/R4/R6 kasten bozuldu (üçü de dosya:satır ile FAIL);
sonra R7/R8/R9/R10/R11 de tek tek bozuldu — R10 hem **yeni-ihlal** hem **bayat-baseline** yönünde
(baseline'dan çıkan bir adı silmeyi de zorluyor). Kanıtsız hiçbir kural CANLI sayılmadı.

| # | Kural | Taranan | FAIL koşulu | Durum |
|---|---|---|---|---|
| **E1** | §3.3 argümansız `getUser()` yasak | `supabase/functions/**/*.ts` | `\.auth\.getUser\(\s*\)` eşleşmesi > 0 | **CANLI — R1** |
| **E2** | §3.3 elle JWT çözme yasak | aynı | `atob(` geçiyor | **CANLI — R6** (baseline: `tenant_config.ts:29`) |
| **E3** | §3.4 CORS tek kaynak | aynı | `getCorsHeaders` **import ediliyor** ama **çağrılmıyor** | **CANLI — R2** |
| **E4** | §3.4 elle cors objesi yasak | aynı | `Access-Control-Allow-` literali `_shared/cors.ts` **dışında** geçiyor | **CANLI — R3** (baseline: `apply-coupon`) |
| **E5** | §3.7 per-fonksiyon toml yasak | `supabase/functions/*/supabase.toml` | dosya sayısı > 0 | **CANLI — R4** |
| **E6** | §3.1 `verify_jwt=false` allow-list | `supabase/config.toml` | `false` olan uçta gövdede kimlik/imza sinyali yok | **CANLI — R5** (baseline: `iyzico-callback`, `shipping-status`; muaf: `tcmb-rates-sync`) |
| **E7** | §3.7 config kapsamı | `config.toml` ↔ `functions/*/` dizinleri | dizini olup `[functions."x"]` bloğu olmayan fonksiyon | **CANLI — R7** (baseline: 26'nın 13'ünde blok yok; `healthz` 2026-08-19'da çıktı) |
| **E14** | §3.11 ortam değiştiren sessiz varsayılan yasak | `supabase/functions/**/*.ts` | `Deno.env.get(...)` sonrası `\|\|`/`??` ile **mutlak http(s) adresi** varsayılanı | **CANLI — INV-CONFIG-1** (2026-08-19 kurulduğunda **bilinçli KIRMIZI**: `iyzico-payment:384`, `iyzico-callback:174`) |
| **E13** | §3.11 ölçemeyen yeşil dönemez | `healthz/index.ts` + `config.toml` | koşulsuz `ok: true`, ya da öz-denetim çağrılmıyor, ya da `healthz` toml'da beyan edilmemiş | **CANLI — INV-CONFIG-1** |
| **E8** | §3.8 deploy kapsamı | `.github/workflows/deploy-functions.yml` | elle sabit fonksiyon listesi içeriyor (dizin taraması değil) | **karşılandı** — liste `scripts/edge/select-functions.mjs` ile türetiliyor; ayrıca `scripts/edge/drift-check.mjs` repo↔prod sapmasını CI'da ölçüyor |
| **E9** | §3.2 admin ucu rol kontrolü | `functions/admin-*/index.ts` | dosyada `'admin'`/`'superadmin'` rol kontrolü yok | **CANLI — R8** (baseline BOŞ — 6/6 admin ucu geçiyor) |
| **E10** | §3.5 webhook fail-closed | `functions/*webhook*/index.ts` | HMAC imza doğrulaması **veya** ZORUNLU timestamp guard'ı yok | **CANLI — R9** (baseline BOŞ — `shipping-webhook` T025-VH ile uyumlu hâle geldi) |
| **E11** | §2 çağıran sınıfı beyanı | `functions/*/index.ts` | ilk 15 satırda ve `serve()`'den önce geçerli beyan yok | **CANLI — R10** (baseline: 26/26 — hiçbirinde beyan yok) |
| **E12-C** | §3.9 `tenant_id` **sıralaması** | tüm edge kaynakları | doğrulanmamış `tenant_id` okuması `getUser()`'dan **önce** (ya da `getUser` hiç yok) | **CANLI — R11-C** (baseline BOŞ, T026-VH ile kapandı) |
| **E12-B** | §3.9 **yapısal kilit** | `_shared/tenant*.ts` | dosya `Request`/`req.`/`headers.get`/`searchParams`/`atob(` içeriyor (yorum dahil) | **CANLI — R11-B** (baseline BOŞ) |
| **E12-D** | §3.9 **sınıf (b) kapısı** | `tenantFromServiceBody` çağıran her dosya | aynı dosyada service_role karşılaştırması yok | **CANLI — R11-D** (baseline BOŞ) |
| **E15** | §3.12 paylaşılan girdi → prod≠master | `supabase/config.toml`, `functions/_shared/**` dokunan PR | `drift-check.mjs` **master checkout'uyla** sapma > 0 | **CANLI — INV-EDGE-DRIFT-1** (2026-08-23; ölçülen süre 27 fn / 11 sn) |

> **E12 niçin üçe bölündü (2026-08-15).** Tek kural sıralamaya bakıyordu ve T026'daki
> gerçek açığı **göremedi**: `_shared/tenant_config.ts` modülü `?tenant_id=` okuyordu,
> çağıran `index.ts`'lerde ise ihlal deseni hiç görünmüyordu — kural yeşildi, açık canlıydı.
> Ders: *dolaylı ihlali sıralama testi yakalayamaz.* **E12-B** sıralamaya değil **yeteneğe**
> bakar (modül isteği adlandıramaz bile) ve bu yüzden üçünün en güçlüsüdür; **E12-D** gövde
> yolunun tek meşru kullanımını (service_role kanıtlanmış) kilitler. Üçü de kasıtlı bozmayla
> kanıtlandı: B'ye yorum içinde `req.headers.get` eklemek, D'de `timingSafeEquals` kapısını
> `true` yapmak — ikisi de FAIL verdi, geri alındı.

> **E12 numarası ÖLÜ — yeniden kullanılamaz (2026-08-20).** `E12` artık *tek başına* bir kural
> değil, **`E12-B/C/D` ailesinin kökü**; ailenin tamamı §3.9'a (tenant_id) bağlıdır ve
> `edge-security.test.ts` başlığındaki eşleme de `R11→E12` der. 2026-08-19'da §3.11 kuralını
> yazarken "sırada boş görünen numara" diye `E12`'yi yeniden kullandım: aynı kimlik iki ayrı
> kuralı gösterir hâle geldi ve **cetvel ile testin eşlemesi birbiriyle çelişti**. Hiçbir kapı
> görmedi — kapılar edge KAYNAĞINI ölçüyordu, cetvelin kendisini ölçen bir kapı yoktu.
> Satır `E14`'e taşındı; **`E12` bilerek boş bırakıldı** ki geçmiş kayıtlar
> (`kapanmis-bulgular.md`, `tenant-id-hardening` planı, test yorumları) doğru şeyi göstermeye
> devam etsin. Bunu tekrarlanamaz kılan kapı: `edge-security.test.ts` içindeki **E-kimlik
> ailesi tutarlılığı** testi — aynı sayısal kökü paylaşan tüm satırlar aynı § bölümüne
> bakmak zorunda.

**Makine ile denetlenemeyenler** (insan/runtime kapısı, §4'e bağlıdır):
`config.toml` ↔ **prod** sürüm çelişkisi (canlı sorgu gerektirir) · gerçek 401/403 davranışı ·
sınıf (d) fonksiyonlarının idempotentliği · CORS'un tarayıcıda gerçekten çalışması.

---

## 6. Karar kayıtları (kısa gerekçe)

- **Varsayılan `true`, istisna adla listelenir (§3.1):** "gerekçesi olan false" serbest bırakılsaydı
  bugünkü 4 açığın hepsi gerekçeli görünüyordu (`# admin paneli kontrol ediyor`). İstisna **isimle**
  sayılabilir olmalı ki E6 testi denetleyebilsin.
- **Gövde yetkisi, `verify_jwt`'ye rağmen zorunlu (§3.2):** platform kapısı kimliği doğrular, yetkiyi
  bilmez — `admin-orders-latest` ve `admin-update-shipping` bunun canlı kanıtıdır.
- **"Geçiş modu" yasağı (§3.5):** eksik sırda uyarıp geçmek kapıyı fail-open yapar; kapı ya vardır
  ya yoktur. Karşı taraf uyamıyorsa bypass değil, guard onun şemasına uyarlanır.
- **`config.toml` tek kaynak, per-fonksiyon toml silindi (§3.7):** okunmayan dosya yalnız yanlış
  bilgi üretir; 6 dosyanın bir kısmı prod'la **ters** değer ve **yanlış** çağıran açıklaması taşıyordu.
- **Doğrulama = çağırmak (§4):** bu turda hiçbir statik kapı (tsc, lint, `deno check`) 4 açığın
  birini bile görmedi; hepsi ilk kimliksiz `curl` ile ortaya çıktı.


---
# FILE: docs\standards\erp-workspace-design-standard.md

# VentHub ERP Çalışma Alanı Tasarım Cetveli

> **SSOT.** İşletmenin bütün modüllerinin (teklif, sipariş, CRM, satın alma, stok, fatura…)
> içinde yaşadığı **tek çalışma alanı kabuğunun** yapısı, ekran dilbilgisi ve görünürlük modeli.
> **Kapsam:** ERP çalışma alanı kabuğu + içindeki modül ekranları.
> **Kardeş cetveller:** `admin-design-standard.md` — görsel dil, overlay taksonomisi, scroll/zoom
> mekaniği. **Bu cetvel onu değiştirmez, üstüne biner:** oradaki her kural burada da geçerlidir;
> burada yalnızca *"ekranlar hangi desende kurulur ve kime görünür"* tanımlanır.
> `storefront-design-standard.md` — kapsamı *"`src/` eksi admin"*, yani burayı kapsamaz.
>
> v0 · 2026-08-20 · İş: **T133-VH** · Şerit: ADMIN-CUSTOMER
> **v0 demek:** yapı ve sözlük sabitlenmiştir, ölçüm sayıları henüz yoktur — bu cetvelin
> ratchet baseline'ı ilk uygulama (teklif kompozörü, T131) inince yazılacak.

---

## 1. KAYNAK / CETVEL

Yeni filo kuralı (#695, `CLAUDE.md` Mutlak Kural 1 genişletmesi): her iş emri ve her cetvel,
kendisini yöneten kaynakları **adıyla** taşır.

### 1.1 İç kaynaklar (emsal ve bağlayıcı)

| Kaynak | Ne için | Tazelik |
|---|---|---|
| `docs/standards/admin-design-standard.md` v1.2 | Görsel dil, yoğunluk, overlay taksonomisi, katman ölçeği, scroll/zoom | 2026-08-17 |
| `src/design-system/tokens.js` | `zIndex`, `maxWidth`, `borderRadius.admin-*`, `boxShadow` — SSOT | canlı |
| `docs/standards/storefront-design-standard.md` | Kardeş kapsam sınırı (admin hariç) | canlı |
| `src/config/admin-resources.ts` | Bugünkü kaynak registry'si (nav + komut paleti + breadcrumb) | canlı |

### 1.2 Dış araştırma (bağlayıcı şart — Recep kararı 08-20)

Üç bağımsız tarama yapıldı; **her iddia kaynak-adreslidir, bulunamayanlar "ölçülemedi" olarak
işaretlidir.** Ham raporlar: `t133-odoo.md`, `t133-frappe.md`, `t133-ticari.md`.

| Sistem | Yöntem | Referans |
|---|---|---|
| **Odoo** | Kod okundu | `odoo/odoo` @ `19.0` |
| **Frappe / ERPNext** | Kod okundu | `frappe/frappe`, `frappe/erpnext` @ `develop` |
| **SAP Fiori · Power Apps · Salesforce** | Resmî dokümantasyon | URL'ler ham raporda; SAP sayfalarının çoğu 403 verdi, o kısımlar işaretli |

---

## 2. TEMEL KARAR — TEK KABUK, ÇOK MODÜL

**Kural 2.1 — Tek çalışma alanı.** İşletme modülleri ayrı ayrı uygulamalar değildir. Hepsi
**tek bir kabuğun** içinde yaşar: aynı navigasyon, aynı breadcrumb, aynı komut paleti, aynı
bildirim yüzeyi, aynı tema kapsamı.

Bu karar dışarıdan doğrulandı:

- **Odoo:** `WebClient` bir kez mount edilir; ekran değişimi `ActionContainer`'ın
  `ACTION_MANAGER:UPDATE` olayıyla bileşen takasıdır — tam sayfa yenilemesi yoktur
  (`addons/web/static/src/webclient/webclient.js`, `.../actions/action_container.js`).
- **Frappe:** Desk tek SPA; `Container.change_to()` DOM düğümlerini gizleyip gösterir, reload yok
  (`frappe/public/js/frappe/views/container.js`, `.../router.js`).

**Kural 2.2 — Ama biz onların mekanizmasını kopyalamıyoruz, ve bu bilinçlidir.**
Odoo ve Frappe istemci-tarafı SPA'dir; ekran takası bir JS bus olayıdır. Bizde kabuk bir
**paylaşılan Next.js layout**'udur ve ekranlar RSC rota parçalarıdır. Yani "tek kabuk" bizde
*"tek `layout.tsx` bütün krom'a sahiptir"* demektir, *"tek JS uygulaması ekran takas eder"*
demek değildir.

**Bu ayrımı yazmamın sebebi var:** SPA action-manager desenini taklit etmek, RSC sınırını
istemciye kaydırır ve `CLAUDE.md` Mutlak Kural 4'ü (RSC öncelikli, `ssr: false` yasak) çiğner.
Dış kaynak *neyi çözdüğünü* gösterir, *nasıl kodlayacağımızı* değil.

**Kural 2.3 — Krom tek yerdedir.** Modül ekranı kendi navigasyonunu, kendi breadcrumb'ını,
kendi toast'ını, kendi tema sarmalayıcısını **kurmaz**. Bunlar kabuğun malıdır. Modül yalnız
kendi içeriğini verir. (Emsal kusur: `admin-design-standard.md` D1 — üç kat iç içe tam-ekran
kabuk; D11 — `<Toaster/>` mount edilmediği için 127 `toast.*` çağrısı ölüydü.)

---

## 3. BEŞ KANONİK EKRAN DESENİ

Yeni bir modül ekranı **bu beşten biridir**. Altıncı bir desen icat etmek serbest değildir;
gerekiyorsa önce bu cetvel değişir.

Desenler üç sistemin kesişiminden çıkarıldı — farklı isimler aynı şeyi anlatıyordu, eşleştirildi:

| # | VentHub deseni | Fiori | Salesforce | Power Apps / Odoo |
|---|---|---|---|---|
| **E1** | **Kayıt Defteri** | List Report | List View | View / list |
| **E2** | **Kayıt Detayı** | Object Page | Record Page | Form / form |
| **E3** | **Çalışma Kuyruğu** | Worklist | *(eşleniği bulunamadı)* | *(ölçülemedi)* |
| **E4** | **Pano** | Overview Page | App/Home Page | Dashboard |
| **E5** | **Kompozör** | *(yok)* | *(en yakını: console workspace)* | *(yok)* |

### E1 — Kayıt Defteri
Bir varlığın filtrelenebilir listesi. **Zorunlu parçalar:** filtre çubuğu, kaydedilmiş görünüm,
sütun yönetimi, satır seçimine bağlı toplu işlem, sayfalama.

*Kaydedilmiş görünüm üç sistemde de var* — Fiori'de "variant management", Salesforce'ta List
View'ın kendisi zaten adlandırılmış bir filtre setidir. Bizde de **birinci sınıf kavram olacak**:
kullanıcı filtresini adlandırıp kaydedebilmeli. Bugün yok (§8/Ç4).

Toplu işlem konumu: **tablo araç çubuğunda**, hiçbir satır seçili değilken **disabled**.

### E2 — Kayıt Detayı
Tek bir iş nesnesi. **Yapı:** üstte kimlik başlığı (ad, durum rozeti, anahtar alanlar) → bölümler
(sections) → altta **kalıcı eylem çubuğu**.

**Sonlandırıcı eylemler ALTTA.** Fiori bunu açıkça böyle kuruyor: footer toolbar "closing or
finalizing actions that impact the whole page" içindir (Save, Post, Approve, Reject); üst başlık
**bilgi** alanıdır, eylem barı değildir. Biz de bu ayrımı alıyoruz — üstte kimlik, altta karar.

### E3 — Çalışma Kuyruğu
İşlenecek maddeler. Kayıt Defteri'nden farkı **amaçtır**: defter *filtreleyerek liste kurmak*
içindir, kuyruk *listedeki neredeyse her maddeyi işlemek* içindir. Fiori bu ayrımı adıyla yapıyor
ve Worklist'i **filtre çubuğu olmayan** sadeleştirilmiş bir List Report olarak kuruyor.

Bizdeki ilk uygulaması: **teklif onay kuyruğu** (LLM/temsilci taslakları insan onayına düşer).

### E4 — Pano
Bir rol veya iş alanı için giriş noktası; kartlardan oluşur ve iş süreçlerine kapı açar.
**Pano bir rapor ekranı değildir** — her kartın bir eylemi ya da bir hedefi olmalıdır.

### E5 — Kompozör *(VentHub'a özgü)*
Karmaşık bir belgeyi (teklif, sipariş, fatura) **bağlamı kaybetmeden** kurmak için.

**Bu deseni dış kaynakta bulamadım ve bunu adıyla yazıyorum.** Fiori'de karşılığı yok; Power
Apps'te yok; en yakın akraba Salesforce'un console workspace/subtab mekanizması ve o da farklı
bir sorunu (çok kayıtlı çalışma) çözüyor. Yani E5 **ödünç değil, bizim tasarımımız** — ve ödünç
olmadığı için ilk uygulamasında (T131) dikkatle ölçülmeli.

**Yerleşim (T131 teklif kompozörü, Recep kararı):**

```
┌──────────────────────────────────────────────────────────────┐
│  DURUM ŞERİDİ · revizyon no · sahip · son değişiklik         │
├────────────┬─────────────────────────────┬───────────────────┤
│ SOL        │ ORTA                        │ SAĞ               │
│ bağlam     │ kalem tablosu               │ canlı önizleme    │
│ müşteri    │ katalog arama +             │ (PDF)             │
│ proje/saha │ katalog-dışı hızlı kayıt    │                   │
│ geçmiş     │                             │                   │
├────────────┴─────────────────────────────┴───────────────────┤
│  EYLEM ÇUBUĞU (altta)  · Taslak kaydet · Onaya gönder        │
└──────────────────────────────────────────────────────────────┘
```

**Kompozör kuralları:**
- Üç sütun da **aynı kaydın** görünümüdür; sağ önizleme ayrı bir "rapor" değil, ortadaki verinin
  canlı çıktısıdır.
- Sol sütun **salt bağlam**: okunur, düzenlenmez. Düzenleme kendi ekranında yapılır.
- Dar ekranda üç sütun **yığılır**, gizlenmez. Önizleme sekmeye düşebilir; bağlam düşemez.
- Eylem çubuğu E2 ile aynı kuraldadır: sonlandırıcı eylemler altta.

---

## 4. GÖRÜNÜRLÜK — PAKET İLE ROL AYRI ŞEYLERDİR

Bu bölüm bu cetvelin en önemli kuralıdır, çünkü ikisini karıştırmak çok kiracılı bir üründe
**veri sızıntısı ya da yanlış faturalama** üretir.

**Kural 4.1 — İki ayrı soru, iki ayrı mekanizma.**

| Soru | Kavram | Kaynak |
|---|---|---|
| Bu modül bu **kiracıda** var mı? | **PAKET** | kiracı yapılandırması |
| Bu kullanıcı bu modülde ne **yapabilir**? | **ROL** | `app_metadata` (Mutlak Kural 12) |

Üç sistem de bu ayrımı yapıyor ve **hiçbiri tek mekanizmaya indirmiyor**:

- **Odoo:** kurulu olmayan modülün menü kaydı **veritabanında yoktur** (`ir_module.py`
  `module_uninstall()` → `_module_data_uninstall`); yetkisiz modülünki **vardır ama sorguda
  filtrelenir** (`ir_ui_menu.py` `_visible_menu_ids()`). Aynı belirti, iki mekanizma.
- **Frappe:** devre dışı modül `get_disabled_modules()` ile **Workspace Manager'a bile** gizlenir;
  yetki ayrı katmandır (`Workspace.is_permitted()`).
- **Salesforce:** **License** üst sınırı, **Profile/Permission Set** o sınır içindeki fiili yetkiyi
  belirler — açıkça ayrı kavramlar.

**Kural 4.2 — Paket dışı modül gizlenmez, YOKTUR.** Menüden saklamak yetmez; rotası, verisi ve
API ucu da kapalı olmalıdır. Gizlemek bir sunum kararıdır, kapatmak bir güvenlik kararıdır.

**Kural 4.3 — Görünürlük kararı SUNUCUDA verilir.** Kabuk, kullanıcının göreceği modül listesini
sunucuda hesaplar ve **hazır** gönderir. İstemciye tam liste gönderip orada filtrelemek yasaktır.

Odoo bunu iki kez yapıyor: menü ağacı `/web/webclient/load_menus`'tan **zaten filtrelenmiş** gelir,
ve yetkisiz alanlar view XML'inden **fiziksel olarak silinir** (`ir_ui_view.py`
`_postprocess_access_rights()`) — CSS ile gizleme değil. Frappe'de karar tamamen Python'dadır;
istemci `frappe.boot`'tan geleni filtresiz render eder.

> **Bugün bizde böyle DEĞİL.** Ölçüm ve geri alma planı §8/Ç1'de.

**Kural 4.4 — UI izni ⊆ DB izni.** `admin-design-standard.md` §6.1 zaten bunu zorunlu kılıyor;
burada tekrarlanır çünkü yeni modüller bu cetvele bakarak açılacak.

---

## 5. DURUM, KİMLİK VE GEZİNME

**Kural 5.1 — Durum şeridi.** Bir iş belgesinin durumu (taslak → onayda → onaylı → …) ekranın
**üstünde**, kimlik başlığının parçası olarak durur. Power Apps süreç çubuğunu (BPF) forma göre
üstte konumlandırıyor; biz de kimliği üstte, kararı altta tutuyoruz.

**Kural 5.2 — Revizyon görünür.** Revizyonlanabilir belgelerde (teklif) revizyon numarası durum
şeridinde okunur. Hangi revizyona bakıldığı hiçbir zaman örtük olmaz.

**Kural 5.3 — Breadcrumb kabuğundur.** Modül kendi breadcrumb'ını çizmez (§2.3).

**Kural 5.4 — Çok bağlamlı çalışma v0'da YOK.** Salesforce'un workspace tab / subtab mekanizması
bu sorunu en açık çözen tasarım ve API düzeyinde dokümante (`lightning:workspaceAPI`); Fiori ve
Power Apps'te eşdeğeri **bulunamadı (ölçülemedi)**. Bizde v0'da sekme yığını **kurulmayacak**:
kompozör (E5) bağlamı tek ekranda tuttuğu için ihtiyaç henüz kanıtlanmadı. Kanıt çıkarsa —
kullanıcı iki teklifi yan yana karşılaştırmak zorunda kalırsa — bu madde yeniden açılır.

---

## 6. TEMA, KATMAN, YOĞUNLUK

Bu başlıklar **`admin-design-standard.md`'ye devredilmiştir**, burada kopyalanmaz:

- Katman ölçeği → `tokens.js` `zIndex` (`sticky` 90 · `modal` 100 · `popover` 110 · `toast` 9999)
- Köşe yarıçapı → `borderRadius.admin-sm|md|lg`
- Yoğunluk, tipografi rolleri, yüzey/gölge → §3
- Overlay taksonomisi (modal · panel · popover) → §4
- **Portal tema kapsamı** → §4.11 — portal'a çıkan yüzeyler tema kapsamının dışında kalır;
  kompozörün sağ önizlemesi ve katalog arama açılırları bu tuzağın tam ortasındadır.

**Tek ek kural (6.1):** kompozörün üç sütunu `maxWidth.page` (1600px) içinde kalır; sütun
genişlikleri ham `w-[..]` ile değil token'la verilir (Mutlak Kural 8).

---

## 7. YENİ MODÜL AÇARKEN — ZORUNLU ADIMLAR

1. Modülün ekranlarını **§3'teki beş desenden** birine oturt. Oturmuyorsa cetveli değiştir.
2. **Paket** kaydını yaz (kiracı bu modülü aldı mı) — **rolden ayrı**.
3. `src/config/admin-resources.ts`'e kaydını ekle; `labelKey` **iki sözlükte de** var olmalı,
   `route` **gerçekten** var olmalı. **Bu artık insan disiplini değil, kapı:**
   `INV-ERP-RESOURCE-1` (`src/__tests__/conformance/admin-erp-resource-registry.test.ts`)
   ikisini de ölçer ve ihlalde kırmızı verir.
4. UI izni ⊆ DB izni ölçümünü yap (`admin-design-standard.md` §6.1).
5. Ekranın **kullanıldığını** kanıtla — render olduğunu değil. (K13: varlık ≠ kullanım.)

---

## 8. ÇELİŞEN-MEVCUT *(zorunlu bölüm — Recep kararı 08-20)*

Bu cetvelin kurallarıyla **çelişen canlı davranışlar**, ölçümüyle ve geri alma planıyla.

### Ç1 — Menü görünürlüğü İSTEMCİDE karar veriliyor · **Kural 4.3 ile çelişir**

**Ölçüm:** `src/components/admin/shell/AdminSidebar.tsx:1` → `'use client'`; satır 63 →
`r.inNav && r.group === group.key && canAccess(r.requiredAccess)`. `ADMIN_RESOURCES` statik
modül olarak import edildiği için **modül listesinin tamamı role bakılmaksızın tarayıcıya iner**;
istemci sadece görüntülemez.

**Ağırlık:** bugün *güvenlik açığı değil* — asıl kapı RLS/DB tarafındadır ve `admin-design-standard.md`
§6.1 bunu zorunlu ölçüm yapmıştır. Ama **paket** kavramı geldiğinde ağırlaşır: "bu kiracı hangi
modülleri satın aldı" bilgisi ticari bilgidir ve her tarayıcıya inmemelidir.

**Geri alma planı:** modül listesi RSC'de hesaplanıp kabuğa prop olarak geçilir; `AdminSidebar`
filtrelemeyi bırakır, verileni çizer. Migration gerekmez. Paket modeli inmeden önce yapılmalı.

### Ç2 — Paket kavramının VERİ MODELİ YOK · **Kural 4.1 ile çelişir**

**Ölçüm:** `src/utils/tenantServer.ts:8-26` → `TenantConfig.features` yalnız üç bayrak taşıyor
(`viewer3d`, `engineeringCalculators`, `pdfExports`) artı serbest `[key: string]: unknown`.
**Modül/paket kaydı yok.** Yani "bu kiracıda CRM var mı" sorusunun bugün cevaplanacağı bir yer
yok; `features` serbest sözlüğüne sıkıştırmak da paket ile bayrağı karıştırır.

**Geri alma planı:** paket, `features` içine gömülmez; ayrı ve adı konmuş bir kavram olarak
tasarlanır. **Migration gerektirir → Recep kapısı.** Bu cetvel v0'da yalnız kuralı koyar,
şemayı önermez — şema T130 (CRM) ve T131 (teklif) veri modelleriyle birlikte kararlaştırılmalı.

### Ç3 — Kaynak registry'sini koruyan kapı YOKTU · **✅ KAPATILDI (bu PR)**

**Ölçüm:** `ADMIN_RESOURCES`'i tüketen yalnız `AdminSidebar.tsx` ve `CommandPalette.tsx`;
`src/__tests__/` altında tüketen **hiçbir dosya yok**. `labelKey`'in sözlükte bulunduğunu ya da
`route`'un gerçek olduğunu ölçen bir test yok.

**Sonuç:** menüye sözlükte karşılığı olmayan bir anahtar konursa ekranda **ham anahtar dizesi**
çizilir ve hiçbir kapı görmez. Bu sınıf 08-19'da T108'de bir kez ödendi (sipariş durum etiketleri
ham DB dizesi basıyordu).

**KAPATILDI — bu cetvelle AYNI PR'da:** `INV-ERP-RESOURCE-1`
(`src/__tests__/conformance/admin-erp-resource-registry.test.ts`). Cetvel ile onu zorlayan test
**tek kontroldür**; ayrı PR'a bölmek cetveli dişsiz bırakırdı.

Kapı üç şey ölçer: (1) her `labelKey` **hem tr hem en** sözlüğünde çözülüyor mu — gerçek çözücü
`getDictValue` ile, ham anahtar dönerse KIRMIZI; (2) her `route` `src/app/admin/**` altında
gerçek bir `page.tsx`'e karşılık geliyor mu; (3) registry ya da rota listesi boşsa KIRMIZI
(sessiz-boş sınıfı — boş liste üzerinde ilk iki test geçerdi).

⚠ **İlk yazımdaki bir netlik hatası düzeltildi:** anahtarların hepsi `admin/menu.{tr,en}.ts`'te
yaşamıyor — ör. `quotes.admin.navLabel` başka bir sözlük ağacından geliyor. Kapı bu yüzden **tam
tr/en sözlüğüne** karşı çözüm yapar, tek bir dosyaya değil.

**Kanıt:** iki kasıtlı sabotaj da KIRMIZI verdi (`labelKey` → var olmayan anahtar;
`route` → `/admin/hayali-rota`). **Şu an yeşil:** 33 kaydın 33'ü, 24 benzersiz rotanın 24'ü.
Kapı bir kusuru değil, bir **seviyeyi** kilitliyor.

**Geri alma planı:** test dosyasını sil — hiçbir üretim kodu ona bağlı değil.

### Ç4 — Kaydedilmiş görünüm kavramı YOK · **E1 ile çelişir**

**Ölçüm:** admin tablolarında filtre durumu URL/bileşen state'inde yaşıyor; adlandırılıp
kaydedilen bir görünüm nesnesi yok. Üç dış sistemin üçünde de var.

**Geri alma planı:** yokluk, yanlışlık değil — E1 bunu **hedef** olarak koyar, borç olarak
işaretlenir. Kapatılması ayrı iş emri ister.

### Ç5 — Müşterinin kabulü KANITSIZ · *(çelişen davranış değil, eksik kanıt)*

**Bu maddeyi AUTH düzeltti ve düzeltme haklı; ilk yazdığım hâli yanlıştı.**

Yanlış yazmıştım: *"müşterinin siteden kendi teklifini kabul edebilmesi yeni modelle çelişiyor."*
**Çelişmiyor.** Recep'in 08-20 kabul-mekanizması kararı site tıklamasını **birincil dijital kanal**
olarak açıkça koruyor: kabul **tek kavramdır**, üç kanalı vardır — site · e-posta beyanı · telefon.

Çelişen şey kabulün **kendisi** değil, kabulün **kanıtsız** olması: bugün yalnız `status` yazılıyor;
damga, IP, kanal, beyan sürümü ve revizyon bağı **hiçbiri tutulmuyor**. Yani "kim, ne zaman, hangi
kanaldan, hangi revizyonu kabul etti" sorusunun canlıda cevabı yok.

**Yön:** mevcut politika geri alınmaz, **sertleştirilir** (AUTH'un quote cetveli §7.2, beş şart).
**Migration'lı → Recep kapısı.** *(Kalem AUTH/T131 kapsamındadır; envanter tam olsun diye burada.)*

**Bu düzeltmenin dersi bu cetvele de yazılıyor:** bir davranışı "çelişiyor" diye işaretlemeden önce
onu **yürüten kararı** okumak gerekir. Ben ekranı ölçüp kararı okumadan hüküm kurdum.

---

## 9. BU CETVELİN ÖLÇMEDİĞİ *(adıyla)*

- **Ratchet baseline yok.** v0 yapı koyar, sayı koymaz. İlk uygulama inince ölçülecek.
- **Performans bütçesi yok.** Kompozörün canlı önizlemesi her tuş vuruşunda PDF üretmemeli,
  ama eşiği burada sayıyla vermiyorum — ölçmeden sayı yazmak uydurmaktır.
- **Mobil sözleşme eksik.** Kompozörün dar ekran davranışı §3/E5'te ilkeyle verildi, kırılma
  noktalarıyla değil.
- **Dış araştırmanın kör noktaları:** Fiori Launchpad'in rol/space görünürlük modeli ve Power
  Apps'in çok-kayıtlı çalışma mekanizması **ölçülemedi** (SAP sayfaları 403 verdi, ham raporda
  liste hâlinde).

---

## 10. PROVENANCE

- **v0 · 2026-08-20 · T133-VH** — ilk sürüm. Üç dış tarama (Odoo kodu, Frappe kodu, ticari
  dokümantasyon) + iç emsal (`admin-design-standard.md` v1.2).
- Karar sahibi: Recep. Kabuk kararı ve kompozör yerleşimi Recep talimatıdır; bu belge onu
  dilbilgisine çevirir.
- İlk uygulaması: **T131** (teklif kompozörü, AUTH şeridi).


---
# FILE: docs\standards\execution-method-standard.md

# Yürütme Yöntemi Cetveli — v1.0 (T144-VH)

> **Bu dosya nedir?** Bir işin **hangi yürütme yöntemiyle** yapılacağına karar verirken bakılan
> tablo: kalıcı şerit mi, şerit içinde alt-ajan mı, Workflow mu, maestro mu, hazır skill mi, düz
> elle mi. Yöntem ≠ iş emri; yöntem, emrin **nasıl** koşacağıdır.
>
> **Neden var?** 2026-08-21 Recep tespiti: *"skill'leri biliyorum diyorsun ama kullanmıyorsun."*
> Ölçüm doğruladı: yöntem seçimi hiçbir yerde yazılı değildi, ajanın o an hatırlamasına
> bırakılmıştı; hatırlanmayınca varsayılan hep "elle yap" oldu. Aynı gün T141 ölçümü üç paralel
> Sonnet ajanıyla 30 dakikada bitti — doğru yöntemdi ama karar emirde değil, aklımdaydı.
> Cetveli olmayan karar, kimsenin göremediği bir boşlukta verilir (CLAUDE.md kural 1).
>
> **Bu cetvel DAYATMAZ, GÖRÜNÜR KILAR.** Zorunlu olan seçimin *kendisi* değil, seçimin
> **yazılması**dır (§3). Ajan işi ölçer, yöntemi kendi seçer; emirdeki satır **öneridir**,
> sahibi gerekçesiyle değiştirebilir. (Recep, 08-21: *"kendileri ölçebilecek; zorunluluk
> sorun yaratır."*)

---

## 1. Yöntemler (araç kutusu)

| Yöntem | Nedir | Ömür / hafıza | Maliyet sınıfı |
|---|---|---|---|
| **Şerit** (kalıcı oturum) | Adlı, sahipli Claude Code oturumu; pano claim + üçlü yedek nabız + kendi cron ofseti | Günler; compact'a dayanır (damga + kalıcı imleç) | YÜKSEK (tam bağlam, insan kararı ister) |
| **Alt-ajan** (`Agent`, çoğunlukla Sonnet) | Şeridin içinden açılan kısa ömürlü ajan; sonucu döner, hafızası yok | Dakikalar; tek görev | DÜŞÜK-ORTA (Sonnet mekanik okuma için) |
| **Workflow** | Deterministik betikle çok ajanı düzenleme: fan-out → çürütme → sentez | Tek koşum | ORTA-YÜKSEK (ajan sayısına göre) |
| **maestro** (skill) | Çok dosyaya **aynı** yapısal değişikliği paralel dalgalarla uygulama + yargıç + merkezi kapı | Tek koşum, çok PR | YÜKSEK ama elle yapmaktan ucuz |
| **agy-orchestrate** (skill) | Antigravity/Gemini filosuyla ucuz geniş tarama; Claude CodeGraph ile doğrular | Tek koşum | DÜŞÜK (Claude kotası yerine Gemini) |
| **Tekil skill** (plan-challenger, diff-review, code-review, 20-eksen, prd-complexity, supabase-security…) | Paketlenmiş tek amaçlı prosedür | Tek koşum | DÜŞÜK-ORTA |
| **Elle** (oturumun kendisi) | Doğrudan okuma/düzenleme | — | En ucuz, en dar |

---

## 2. Karar tablosu (iş tipi → önerilen yöntem)

| İşin şekli | Önerilen | Ne zaman **kullanılmaz** | Çıktı nereye |
|---|---|---|---|
| Günler süren, **sahiplik** isteyen, **prod kapısı** olan iş (migration, veri göçü, bir alanın tüm hattı) | **Şerit** | Bir saatlik iş (şerit kurulumunun sabit maliyeti ~1 saat) · başka şeridin dosyalarında (ikiz şerit açılmaz, §4) | Pano + registry + PR'lar |
| **Salt-okuma ölçüm**, birden çok bağımsız eksen (mekanizma nasıl çalışıyor / kırılma noktaları / envanter) | **Alt-ajan ×N paralel** (Sonnet), yargı şeritte | Tek soru tek dosyadaysa → CodeGraph/elle | `scratchpad` → sahibi doğrulayıp `docs/audits/` |
| **Çok-eksenli denetim** ya da bulgunun **bağımsız çürütülmesi** gerekiyor ("gerçek mi?") | **Workflow** (fan-out + çürütme + sentez) | Kullanıcı açık opt-in vermediyse araç kilitli → emirde **"workflow kullan"** yazmalı | `docs/audits/` |
| Repo çapında **geniş tarama** ("her X'i bul", 50+ dosya) | **agy-orchestrate** (ucuz) → CodeGraph doğrulama | Yargı gerektiren her adım (agy tarar, karar vermez) | `docs/audits/` |
| **Aynı yapısal değişiklik çok hedefe** (24 admin sayfası → ortak kit; 40 bileşen → aynı hook) | **maestro** | Tek dosya · hedefler birbirinden farklı (o zaman şerit içinde sıralı) | Dalga PR'ları |
| **Plan** yazıldı, uygulanmadan önce — özellikle **migration / veri göçü / rota değişikliği** | **plan-challenger** (red-team) | Docs-only plan, geri alınabilir tek PR | `red_team_report.md` → plana "ÇELİŞEN-MEVCUT" |
| **PR diff** incelemesi | **diff-review** / **code-review** | — | PR yorumu |
| **Lansman öncesi / büyük katman değişti** | **venthub-20-eksen-denetimi** (karne) | Tek kusur avı | `docs/audits/` karne |
| "Neyi silebiliriz, vizyona sadık mı" | **prd-complexity-audit** | Bug avı | `docs/audits/` |
| RLS / politika / migration yazımı | **supabase-security** + plan-challenger | — | migration + INV |
| Tek dosya, tek PR, net iş | **Elle** | Dosya sayısı 5'i geçince yukarıdakilerden birine | PR |

**Seçim ilkesi:** önce *şekli* tanı (kaç dosya? salt-okuma mı yazım mı? yargı mı tarama mı? kaç gün?),
sonra tabloya bak. Şüphede: **ölç** (dosya sayısını, hedef sayısını, süreyi) — cetvel tahminle değil
ölçümle kullanılır.

---

## 3. Görünürlük kuralı (tek zorunluluk)

1. **İş emrinde `YÖNTEM:` satırı** — emri yazan (OPS / şerit sahibi) önerilen yöntemi **ve bir
   cümle gerekçeyi** yazar. Yazılmamışsa emir eksiktir. Workflow gerekiyorsa opt-in cümlesi
   ("workflow kullan") bu satırda geçer; böylece araç kilidi açılır.
2. **Sahibi değiştirebilir** — ölçüp başka yöntem seçerse işbaşı/pano notuna *"YÖNTEM: X yerine Y,
   çünkü …"* yazar. Bu sapma hata değildir; **yazılmamış sapma** hatadır.
3. **Ölçüm** — haftalık denetimde *emirdeki yöntem ≠ kullanılan* sayılır; sapmaların gerekçesi
   cetveli **günceller** (cetvel yanlışsa cetvel değişir, ajan zorlanmaz). Standart + ölçen denetim =
   kontrol; yalnız standart = raf.

---

## 4. Şerit sınırları (ölçülmüş dersler)

- **Aynı şeridin ikizi açılmaz.** Pano kilidi oturum bazlıdır; aynı globları iki oturum claim
  ederse iki sahip, karışık kıdem, çarpışan PR (08-17 hayalet-sid vakası). Paralellik ya **ayrık
  dosyalı ikinci şerit** ya **şerit içinde alt-ajan** ile sağlanır.
- **Canlı şerit sayısı insan bant genişliğiyle sınırlıdır.** 08-21 ölçümü: 7 şeritten 5'i BAYAT —
  tek karar mercii 7 pencereye yetişemez. Pratik tavan: **2-3 canlı şerit + şerit içi alt-ajan + lider.**
- **Alt-ajan yargı vermez.** Çıktısı şerit sahibi tarafından örneklenerek doğrulanır; doğrulanmamış
  ajan çıktısı rapora girmez (T141: ajan raporları önce scratchpad, sonra denetlenip audits).
- **Mekanik okuma Sonnet'e, yargı ve sentez şeride** (filo kuralı 08-20).

---

## 5. Bilinen sınırlar (dürüstçe)

- Cetvel, ajanın **hatırlamasına** bağlı kalmasın diye CLAUDE.md'den işaretlenir ve emir şablonuna
  satır olarak girer; yine de ajan satırı boş geçebilir — bunu yalnız haftalık sapma sayımı yakalar.
- Maliyet sınıfları nitel; token ölçümü yapılmadı. İlk dört haftanın pano notlarından nicel tablo
  çıkarılınca v1.1.
- Workflow'un opt-in kilidi araç düzeyindedir; cetvel onu kaldıramaz, yalnız emirde cümleyi
  hatırlatır.

İlgili: `collaboration-protocol.md` §2.1 · `measurement-discipline-standard.md` ·
`session-loop-ritual.md` · CLAUDE.md kural 1 (No-Plan-No-Code: plan hangi cetvelle yönetildiğini söyler —
artık **hangi yöntemle koşacağını da**).


---
# FILE: docs\standards\fleet-mechanism-standard.md

# Filo Mekanizması — Cetvel v1.0

> **Kapsam:** çok-oturumlu filonun **hayatta kalma katmanı** — bir şeridin panoyu duyması,
> düzenli uyanması ve bunların *kanıtlanması*. Tek soru: *bu oturum, kendisine yazılanı
> gerçekten duyuyor mu — ve bunu nereden biliyoruz?*
> **Zorlayan kapı:** `INV-MECH-1` → `src/__tests__/conformance/fleet-mechanism-integrity.test.ts`
> **İlk yazım:** 2026-08-20 · **Ölçüm sahibi:** ALTYAPI · **İş emri:** T115-VH

---

## 1. Niçin bu cetvel var — ölçülmüş vaka, tahmin değil

2026-08-20 sabahı **dört oturum** panoya sağır kaldı. Sağırlığın ayırt edici özelliği şudur ve
bu cetvelin tamamı bu cümlenin üzerine kuruludur:

> **Sağırlık sessizdir.** Hiçbir satır üretmez, hiçbir kapı kırmızı yanmaz, hiçbir hata
> mesajı düşmez. "Bugün pano sakin" gözlemiyle "hiç kimse beni duymuyor" gözlemi **birbirinin
> aynısıdır.**

Bedeli ölçüldü: Recep her oturumu tek tek elle dürtmek zorunda kaldı; adresli iş emirleri
saatlerce alıcısına ulaşmadı; üç şeridin turu boşa döndü.

İkinci vaka daha keskindir ve buraya kasten yazılmıştır:

> Hayatta-kalma katmanını **mekanikleştirmekle görevli şerit** (ALTYAPI), kendi katmanını
> kurmadı. Talimat **dört ayrı kanaldan** ulaşmıştı: pano notu, sıralı emir, yazılı hafıza
> dosyası (`fleet-dies-with-the-app`) ve şeridin kendi raporu. Dördü de davranış üretmedi.
> Kurulum ancak Recep doğrudan sorduğunda gerçekleşti.

Buradan çıkan hüküm:

> **Talimat davranış üretmez; mekanizma üretir.** Yazılı bir ders, açılış adımına
> bağlanmadıkça bilgi verir, davranış vermez.

## 2. Üç katman — ve üçünün de aynı anda ölmesi

| katman | ne yapar | ömrü |
|---|---|---|
| **gözcü** (persistent Monitor) | panoyu tarar, yeni notu bildirime çevirir | oturumla ölür |
| **cron** (CronCreate, ofsetli) | şeridi düzenli uyandırır | oturumla ölür |
| **tur-sonu uyanışı** (ScheduleWakeup) | gözcü ölürse ikinci kanal | tur sonunda **yeniden kurulur** |

**Üçü de aynı oturumun içinde yaşar ve uygulama kapanınca üçü birden ölür.** Yeni oturum
bunları devralmaz. Bu yüzden yeni oturumun **ilk işi** kurulumdur — ve bunu hatırlatmak
insana bırakılmaz (bırakıldı, dört kez başarısız oldu): `SessionStart` kancası hatırlatır,
`UserPromptSubmit` kancası her turda kırmızı satır basar.

**Tek kanal yedeklilik değildir.** Gözcü tek başına ölürse şerit sağır kalır; cron tek başına
kalırsa notlar 20 dakika bekler. Üçü birlikte istenir.

## 3. Kural

1. Her şerit oturumu, ilk turunda üç katmanı kurar ve **kanıtlar**.
2. Kurulum **beyanla** kapanmaz. Geçerli kanıt, `mechanism-setup.cjs prob` çıktısıdır.
3. Cron ofseti **tablodan** okunur (`mechanism-setup.cjs` içindeki `OFSETLER`), hatırdan
   yazılmaz. İki şerit aynı dakikayı paylaşamaz.
4. Gözcü **kalıcı imleç** tutar ve her taramada `sonTarama` damgası basar. Damga basmayan
   gözcü, canlılığı dışarıdan ölçülemediği için **kanıtsız** sayılır.
5. Gözcünün olay akışı **kodda** UTF-8'e zorlanır; konsol kodlamasına güvenilmez.
6. Mekanizma kırmızısı, brifingin **sessizlik kuralına tabi değildir**.

## 4. Ayırt edici test — öz-test değil

`prob` fiili panoya **dış** bir olay yazar ve gözcünün kalıcı imlecinin o olayın **ötesine**
geçmesini bekler. Ayırt ediciliği şuradan gelir:

> Gözcü çalışmıyorsa imleç **asla** ilerlemez. Yani gözlem, mekanizma çalışmasaydı **farklı**
> olurdu.

Olayı yazan süreç gözcüden ayrıdır ve **farklı bir sid** kullanır. Bu bir detay değil,
tasarımın kilit noktasıdır: gözcü kendi notlarını eler, dolayısıyla **"kendine test notu at"**
biçimindeki öz-test, tanım gereği **yanlış negatif** üretir. Her gözcü sahibinin sorması
gereken soru budur: *filtrem, görmem gereken hangi sınıfı tanım gereği dışarıda bırakıyor?*

### 4.1 Testin sınırı — adıyla

`prob` gözcünün panoyu **okuduğunu** kanıtlar; bildirimin **ajana ulaştığını** kanıtlamaz.
Teslimat ayrı bir kanıttır: probun ürettiği jeton bildirimde görülür ve
`dogrula --jeton <jeton>` ile geri yazılır. İkisini tek kanıt saymak, okuma ile duyma
arasındaki farkı siler.

## 5. Ölçülen ile beyan edileni ayırmak (fail-closed)

`dogrula` çıktısı üç sınıf kullanır ve bunları **karıştırmaz**:

| sınıf | anlamı | örnek |
|---|---|---|
| **ÖLÇÜLDÜ** | araç baktı ve gördü | gözcü imlecinin yaşı |
| **BEYAN** | ajan söyledi, disk doğrulayamaz | cron id (tek geçerli ölçüm: `CronList`) |
| **ÖLÇÜLEMEZ** | diskte izi yok | `ScheduleWakeup` |

Kanıtlanmayan katman **çökmüş sayılır** (fail-closed). "Ölçemedim" ile "geçti" aynı kovaya
girerse bekçinin varlık sebebi silinir.

`KANITSIZ` etiketi **"gözcüsü yok" demek değildir**: şeridin kendi izleyicisi olabilir ama
ölçülebilir imleç sözleşmesini yazmıyordur. Fail-closed davranış aynı kalır, ama hüküm doğru
adlandırılır — yanlış hüküm, doğru davranıştan daha uzun yaşar.

## 6. Yoklama — üç eksenli canlılık

`board.cjs yoklama` (eşanlamlı: `rollcall`) filoyu **üç ayrı eksende** ölçer:

| eksen | soru | kaynak |
|---|---|---|
| **ATIS** | oturum yaşıyor mu | pano heartbeat yaşı |
| **GOZCU** | panoyu **duyuyor** mu | imlecin son tarama yaşı |
| **SES** | iş **üretiyor** mu | son notunun yaşı |

Niçin üç eksen — ölçülmüş vaka: bir şeridin atışı **1 dakikalık**, son notu **1642 dakikalık**
ve içeriği `"test"`ti. Atış oturumun *yaşadığını* söyler; *duyduğunu* ya da *ürettiğini*
söylemez. Tek eksenli canlılık bu üç durumu tek kelimeye ("canlı") indirger ve sağırlığı gizler.

`yoklama` **okuyan** bir fiildir, `--sid` istemez: sağırlığı ölçmek isteyen tarafı (orkestratör,
Recep, yeni açılan oturum) tam da ölçüme muhtaç anda kimlik şartıyla dışarıda bırakmak yanlış
olurdu. Yazan fiiller kimliksiz koşmaz; okuyan fiiller koşar.

## 7. Kapsam sınırı — ADIYLA

**Mekanikleştirilen:** duyma (gözcü), uyanma (cron), yedek kanal (wakeup), yoklama, kurulum
metninin üretimi ve kurulumun kanıtı.

**Bilinçli olarak mekanikleştirilMEYEN:** slot verme, kuyruk sırası, çakışma hakemliği.
Bunlar **hüküm katmanıdır** ve orkestratörde kalır. Gerekçe: bu kararlar tempo, risk ve
öncelik tartar; mekanikleştirilirse yanlış kararı hızla ve tekrar tekrar verirler.

**Ölçülmeyen kalan:** `INV-MECH-1` mekanizmanın **yapısını** ölçer, o an **çalıştığını**
ölçmez ve ölçemez — bu bir çalışma zamanı sorusudur, cevabı `prob` ve `yoklama`dadır. Yapı
denetimi, davranış kanıtının yerine geçmez.

## 8. Kapı eklendiğinde kanıt zorunluluğu

Bu cetveli zorlayan her kol **bilerek bozularak** kanıtlanmıştır (2026-08-20):

| sabotaj | sonuç |
|---|---|
| gözcü hiç kurulmadan `dogrula` | KIRMIZI, 3 kalem kanıtlanmadı, çıkış 1 |
| gözcü hiç kurulmadan `prob` | KIRMIZI, imleç dosyası yok, çıkış 1 |
| gözcü canlıyken imleç geçici olarak kaldırıldı, kanca koşuldu | brifingde MEKANİZMA kırmızı satırı belirdi |
| gözcü canlıyken kanca koşuldu | MEKANİZMA satırı **yok** (yanlış pozitif üretmiyor) |
| `dogrula --jeton` uydurma jetonla | KIRMIZI, beklenen ve verilen jeton **adıyla** yazıldı |

Kanıtlanmamış bir kapı, kapı değildir.

## 9. Kanca yazım kuralları — KÖK, KİMLİK ve KOPARILMIŞ SÜREÇ

Bu bölüm 2026-08-27'de yazıldı. Niçin o gün: `bash-write-guard` ve `bash-write-audit`
kancalarının ikisi de **yanlış ağacı ölçüyordu** ve bunu söyleyen tek bir satır cetvel yoktu
(grep ile ölçüldü: `docs/standards/` altında kanca kök çözümünden bahseden hiçbir yer yok).
Kural yazılı olmadığı için iki kanca aynı hatayı bağımsız olarak yaptı — el kitabı
"hatırlanan" değil "yazılan" şey olmalı.

### 9.1 `cwd` KÖK DEĞİLDİR

**Kural: bir kanca çalışma ağacını `girdi.cwd` / `process.cwd()`'den ÇÖZMEZ.**

Ölçüm: bu ortamda Bash cwd'si sessizce **ana çalışma dizinine resetlenir** — araç çıktısının
sonunda `Shell cwd was reset to …` satırı basılır (PRICING ve EDGE bağımsız ölçtü). Şerit
kendi worktree'sinde çalışırken kancaya gelen `cwd` ana depoyu gösterir. Sonuç iki kancada da
aynı oldu: kapı **koştu**, sadece **başka bir ağacı** ölçtü, ve hiçbir test bunu göstermedi.
Ana depoda 5 kirli yol vardı, şeridin ağacında 40+.

Yerine ne kullanılır — **girdinin türüne göre değişir, ve bu tutarsızlık değildir:**

| kancanın girdisi | kök nasıl çözülür | örnek |
|---|---|---|
| **yol verilmiş** (komut metninde hedef var) | her hedefin kökü **kendi git deposundan** sorulur: `git -C <hedefin dizini> rev-parse --show-toplevel` | `bash-write-guard.cjs`, `board.cjs repoRootFor` |
| **yol verilmemiş** ("ne değişti" sorusu) | önce **ağaç kimliği** çözülür: sid → `venthub-sid` dosyaları → ağaç(lar) | `bash-write-audit.cjs` |

İkinci satırda hedef yoktur, dolayısıyla "hedefin deposu" diye bir şey de yoktur; soru
sorulabilmesi için **hangi ağaç** olduğunun önce bilinmesi gerekir.

**VentHub'a ait mi?** `git rev-parse --git-common-dir` ile ölçülür: bütün VentHub
worktree'leri **aynı** ortak dizini paylaşır, başka bir depo (orion, orion-registry,
corpus-callosum) paylaşmaz. Bu ölçüm aynı zamanda korumayı ayakta tutar: pano dizini
(`C:/tmp/venthub-board`), scratchpad ve `/dev/null` bir VentHub deposu içinde değildir, o
yüzden atlanır — **bunları bloklamak panoyu öldürür ve filo birbirini duymaz hâle gelir.**

### 9.2 KİMLİK: `venthub-sid` — ve sid TEKİL DEĞİLDİR

`session-board.cjs` her oturum açılışında sid'i `<absolute-git-dir>/venthub-sid` dosyasına
yazar (worktree-yerel; ortak dizine yazılsa bütün şeritler aynı kimliği okurdu). Kimlikten
ağaca giden okuma iki kaynağı tarar:

- `<ortak>/worktrees/<ad>/venthub-sid` → ağaç = `<ad>/gitdir` içeriğinin dizini
- `<ortak>/venthub-sid` → ağaç = ana depo

**Kural: sid'in tekil olduğunu VARSAYMA.** Ölçüm (2026-08-27): `e033dc3e` **üç** worktree'de
(vh-comp, vh-inv7, vh-rec80), `4397deef` **iki** worktree'de kayıtlıydı; ayrıca ana deponun
kimlik dosyası bir şeridin sid'ini taşıyordu. Belirsizlikte davranış:

1. **Sessizce birini SEÇME.** Seçim, onarmaya çalıştığımız "yanlış ağacı ölçtü ve yeşil
   göründü" arızasını aynen geri getirir.
2. **GÖRÜNÜR uyarı bas** ve **eşleşen bütün ağaçları** denetle.
3. Hiç eşleşme yoksa `cwd`'ye düşmek meşrudur ama **sessiz olamaz**: düşüşün kendisi ve
   sebebi yazılır. "Hiçbir şey bulamadı" ile "hiçbir yere bakmadı" ayırt edilebilir olmalı.

**Ağaç nitelikli anahtar:** aynı bağıl yol iki ağaçta birden kirli olabilir. Kanca durumu
dosyada tutuyorsa anahtar `<ağaç>::<bağıl yol>` olmalı; nitelenmemiş anahtar ikinci ağacı
sessizce "zaten bildirildi" sayar. Anahtar biçimi değişirse eski taban **doğrudan
karşılaştırılmaz** (her yol "yeni" görünür, tek turda onlarca sahte alarm düşer) — taban
yeniden kurulur ve o turda alarmın bastırıldığı **yazılır**.

### 9.3 `git status` ile ölçen kanca `-uall` KULLANIR

Varsayılan `--untracked-files=normal`, **yeni bir dizin** altındaki izlenmeyen dosyaları tek
satırda dizin olarak toplar: `?? zzz-audit-sinavi/`. O satır bir dosya yolu değildir, hiçbir
claim glob'una (`.../**`) uymaz ve kapı **sessizce ötmez**. Yani "başka şeridin ağacına YENİ
dosya eklemek" — en tipik ihlal biçimi — tam da görünmeyen hâldi. Bu kusuru
`INV-BASH-WRITE-2`'nin körlük kolu yakaladı; kapı yazılmadan önce kimse fark etmemişti.

### 9.4 Koparılmış süreç: `windowsHide: true` ZORUNLU

Windows'ta `spawn(..., { detached: true })` ile başlatılan çocuk süreç, `windowsHide`
verilmezse kendi konsolunu alır ve bir `conhost.exe` **penceresi açılıp kapanır**.
`stdio: 'ignore'` bunu **önlemez** — çıktıyı yutar, pencereyi değil.

Ölçülmüş vaka: Recep "her oturum açılışında pencereler yanıp sönüyor" diye bildirdi; o gün
sayılan 18 pencerenin 1'i `session-board.cjs`'in registry senkron süreciydi (kalan 17
Antigravity MCP config'inden geliyordu: `npx` ve çıplak komut adları Windows'ta `.cmd`
kabuğuna çözülür → `cmd.exe` + `conhost.exe`; ayrı olarak onarıldı). **Tam yol ile başlatılan
`node` / `python.exe` süreçleri pencere açmaz** — Claude Code'un kendi MCP config'i böyledir ve
66 node + 22 python sürecinin görünür penceresi yoktu.

### 9.5 Bu bölümün kanıtı

`INV-BASH-WRITE-2` (`src/__tests__/conformance/bash-write-audit-tree.test.ts`) beş kollu ve
her kolu **sabotajla** kanıtlandı; sağlam sürüme dönüş `sha256` ile doğrulandı:

| sabotaj | düşen kol sayısı |
|---|---|
| ağaç yine `cwd`'den çözülsün (eski hâli) | 3 |
| `git status -uall` kaldırılsın | 3 |
| sid belirsizliği sessiz geçilsin | 1 |
| "kimlik çözülemedi" uyarısı susturulsun | 1 |
| taban biçim-geçişi koruması kaldırılsın | 1 |

⚠ Sabotaj ölçümünün **kendisi** ilk turda kördü: `--reporter=basic` (vitest 4'te yok) koşumu
çökertti, hiçbir test koşmadı ve beş sabotaj da "fark edilmedi" göründü. Bu yüzden ölçüm
betiği artık **ön koşul olarak `geçen > 0`** doğruluyor: `düşen = 0` ancak araç gerçekten bir
şey okuduysa kanıttır.

### 9.6 Kanıtın TAŞIYICISI — ölçtüğün olayla aynı akışta mı?

> Ölçülmüş vaka (2026-08-27, T166-VH / INV-HOOKS-2). Bu madde bir tercih değil, **iki gün ve
> dört şeridi** tutan bir yanlış teşhisin bedelinden çıktı.

`githooks-doc-scope.test.ts` CI'da kırmızı, **yerelde aynı girdiyle yeşildi**. Kırmızı, master'ın
`c96977f6` ucunda başladı ve #858 / #856 / #855'i birden bekletti. Üç şerit (ALTYAPI, AUTH, OPS)
kırmızıyı iki gün boyunca **"süzgeç kesiyor"** diye okudu. Süzgeç suçsuzdu.

**Arıza ölçüm aracındaydı:** test, kancanın bitişini kancanın **günlüğünden** (`LOG`) bekliyor,
kanıtı **başka bir dosyadan** (`py.log`) okuyordu. İki dosya, tek bekleyiş — yapısal yarış.

#### Neden fark edilmedi: yanlış ama TUTARLI görünen hikâye

| ne yapıldı | doğru muydu | yine de yanlışa götürdü çünkü |
|---|---|---|
| Ham CI logu okundu, iki `PYCALL` satırı görüldü | Satırlar **gerçekti** | Yarışan bir dosyanın **anlık görüntüsüydü** |
| Hayatta kalanlar/kaybolanlar eşleştirildi | Korelasyon **gerçekti** | Kesilme noktası **yazma sırasıyla hizalı**ydı, o yüzden "gerçek depoda var mı" gibi sahte bir temizlik üretti |

Bu, hata sınıflarının en tehlikelisidir: veri doğru, korelasyon güçlü, hikâye tutarlı — ve
mekanizma yanlış. Çürütülmesi kolay görünmez.

#### Kural

1. **"Alınan değeri oku" YETMEZ.** Ek soru: *bu değerin taşıyıcısı, ölçtüğüm olayla aynı akışta mı?*
   Ayrı dosyaya yazılan kanıt, tek bir bitiş işaretiyle beklenip okunursa sessiz yarış üretir.
2. **Kanıtı kapının kendi akışına bağla.** Onarım eşiği büyütmek DEĞİLDİ: sahte üretici `PYCALL`
   satırını stdout'a basar, kanca onu `>> "$LOG" 2>&1` ile kendi günlüğüne alır. Kanıt ile
   `=== bitti` artık **aynı dosyada, aynı sırada** — yarış imkânsız hâle gelir.
   *Ölçüm:* onarım öncesi kod **4 koşumda kırmızı**, sonrası **2 koşum üst üste yeşil**.
3. **Her kapı SAYI bassın (yokluk kanıtı).** Teşhisi mümkün kılan tek şey süzgece eklenen
   `[doc-scope] GIRDI 10 satir · CIKAN 4 yol` satırı oldu. O satır olmadan **"kapsam sıfır
   döndürdü"** ile **"kanıt okunamadı"** aynı görünüyordu. Sayı yoksa körlük vardır.
4. **Şüphelendiğin mekanizmayı BORUDAN SÖKÜP izole çağır** (AUTH'un ölçümü). Kirli bir boru
   üzerinden akıl yürütmek iki gün yedi; `kapsamda()`'yı dört sabit girdiyle doğrudan çağırmak
   bir tur sürdü ve süzgeci akladı. İzole çağrı + muhasebe satırı = **iki bağımsız yöntemle** aynı
   sonuç; tek yöntem hiçbirini kesinleştirmiyordu.

#### Elenen iki mekanizma (kayda geçer — geri alınmış hipotez de bilgidir)

- *"Kanca gerçek ağaçta varlık/izlenme kontrolü yapıyor"* (AUTH önerdi, **kendisi geri aldı**):
  `doc-scope.cjs` baştan sona okundu, dosyada tek bir `existsSync`/`ls-files`/git çağrısı yok.
- *"stdin boş / EAGAIN"* (ALTYAPI önerdi, **AUTH çürüttü**): dayanağı vitest'in **kırpılmış**
  assertion çıktısıydı; ham logda `py.log` boş değildi. → §9.5'teki "kırpılmış çıktı kanıt
  değildir" maddesiyle aynı kök.

> Yan ürün, ayrıca korunur: süzgeç stdin hatasını `catch` ile yutmuyor ve stdout'a
> `fs.writeSync(1, …)` ile **kısmi yazma ele alınarak** yazıyor. `process.stdout.write` POSIX
> borusunda asenkrondur; süreç boşalmadan çıkarsa kuyruk sessizce uçar. İkisi de "sessizce
> hiçbir şey üretmeyen kanca" sınıfına ait ve #859'da kapatıldı.

#### 9.6.1 Bu maddenin kanıtı

`INV-HOOKS-2`'nin altıncı kolu (`src/__tests__/conformance/githooks-doc-scope.test.ts`) sabotajla
kanıtlandı; her turdan sonra sağlam sürüme dönüş `sha256` ile doğrulandı ve **ön koşul olarak
`geçen > 0`** arandı (sağlam sürüm 6/6 geçiyor):

| sabotaj | düşen kol |
|---|---|
| muhasebe satırı (`GIRDI … CIKAN …`) susturulsun | 1 |
| boş girdide stdout kirletilsin (veri kanalı temiz kalmasın) | 1 |

⚠ Sabotaj aracının **kendisi** ilk turda yarım kaldı: çalışma ağacındaki dosya **CRLF** ile
checkout edilmişti ve düz `\n` içeren çok satırlı arama dizisi hiç eşleşmedi — tek satırlık desen
tutmuşken. Betik bunu `UYGULANAMADI (desen tutmadı)` diye bildirdiği için fark edildi; bildirmeseydi
"iki sabotajdan biri yakalandı" diyen **yanlış bir kanıt** yazılacaktı. Çok satırlı sabotaj deseni
Windows checkout'unda **EOL-bağımsız** (`\r?\n`) olmalıdır. Bu, §9.5'teki "ölçüm aracının kendisi
kör olabilir" dersinin ikinci örneğidir; ölçüm aracı da ölçülür.

## 11. KİMLİK — vekil kanıt ile asıl kanıt (E1-v2)

**Ölçüldü 2026-08-28 (ALTYAPI, kendi ağacında, kendi kapısı bloklayınca).** §9.1 kancanın
**hangi ağacı** ölçtüğünü konu alıyordu. Bu bölüm bir adım öncesini konu alır: **kim olduğunu.**

### 11.1 Olay

`lane-precommit` (E1) kimliği `<git-dir>/venthub-sid` dosyasından okuyordu. Bu dosyayı
SessionStart kancası yazar — ama oturumun **açıldığı** ağaca, **çalıştığı** ağaca değil. Bir
oturum ana dizinde açılıp işini bir worktree'de yaparsa, o worktree'deki kimlik orada **en son
oturum açanın** sid'i olarak kalır.

Sonuç: kapı `vh-altyapi-851` ağacında ALTYAPI'yı "başka şerit" sanıp **kendi claim'indeki**
dosyada bloklad. Dosyada yazan sid `dc2b0b90` — ağacı kuran, çoktan ölmüş bir oturum.

### 11.2 Körlüğün biçimi ve YÖNÜ

Eski dedektör yalnız **"kimlik dosyası YOK"** hâlini arıyordu (o sabah URUN'un ağacında bunu
doğru yakaladı). **"Dosya VAR ama YANLIŞ SAHİBE ait"** hâlini görmüyordu. İki hâl aynı arızayı
doğurur — şerit kontrolü yanlış oturum adına koşar — biri sessizdi.

**Yön önemlidir.** Ölçülen vakada hata *güvenli* yöne düştü: kapı kendi sahibini bloklad, yani
gürültü yaptı. **Ters yön sessizdir:** bayat sid *canlı* bir şeride aitse, o ağaçta çalışan
kişi **onun yetkisiyle** yazar ve kapı hiç ses çıkarmaz. Bu yüzden düzeltme "daha çok blok"
değil, **doğru kimlik + görünür uyarı**dır.

### 11.3 Kural — kanıt sıralaması

| sıra | kaynak | sınıf |
|---|---|---|
| 1 | `CLAUDE_CODE_SESSION_ID` (env) | **ASIL** — commit'i tetikleyen sürecin kendi kimliği |
| 2 | `<git-dir>/venthub-sid` | **VEKİL** — elle/terminalden commit için tek kaynak |

Çelişkide **asıl kazanır**, çelişki **görünür uyarı** olarak basılır ve vekil dosya asıl
kimlikle **onarılır** (yan etki gizli değildir, uyarısı vardır).

### 11.4 Bilinmeyen kimlik FAIL-OPEN geçer — blok değil

Env yoksa ve dosyadaki sid panoda **hiç görülmemişse**, kapı karar vermez: uyarır ve geçirir.
Gerekçe bu dosyanın kendi 2026-08-15 notudur — rastgele/yanlış blok `--no-verify` alışkanlığı
kazandırır ve **gerçek** kapıları da birlikte atlatır. Kapı yanlış oturum adına karar vermektense
sesli biçimde susmalıdır.

### 11.5 ÖLÇEMEDİĞİM ŞEY — adıyla

**"Dosyadaki sid ŞU AN CANLI MI"** sorusu bu kapıda cevaplanmıyor. Denendi ve gösterge
**ayırt etmedi**: 2026-08-28 07:10 ölçümünde canlı dört şeridin heartbeat yaşı 51 dk, aynı anda
**kapalı** TEMIZLIK oturumunun da 51 dk'ydı. Ayırt etmeyen gösterge ölçüm değildir; canlılık
iddiası bu yüzden **kurulmadı**. Ayırt edilebilen daha zayıf ama gerçek ölçüt kullanıldı:
sid panoda hiç görülmüş mü (bayat `dc2b0b90` hiç görülmemişti).

### 11.6 Test biçimi — kaynak metni değil DAVRANIŞ

`e1-kimlik-kontrolu.test.ts` kapının kaynağında dize aramaz; her kol geçici bir git deposu
kurar, gerçek bir staged commit dener ve kapının çıktısını okur. Pano `VENTHUB_BOARD_DIR` ile
izole edilir (testin canlı filo panosuna yazması ölçümü kirletirdi — pytest'in canlı registry'ye
yazdığı vaka kayıtlı).

⭐**İlk yazışımda bu test SAHTE YEŞİL verdi ve sebebi kayda değer:** geçici depoda hiç commit
yoktu, `git rev-parse HEAD` patlıyordu, kapı "git okunamadı" koluna düşüp **hiç koşmadan**
geçiyordu. Beş kol kırmızı yandı ama **negatif kontrol kolları YEŞİL** verdi — çünkü "susuyor"
ile "hiç çalışmıyor" aynı görünür. Düzeltme iki parçalıdır: fikstüre ilk commit eklendi **ve**
bir **MEKANİZMA CANLI** kolu yazıldı — aynı fikstürde başka şeridin claim'i kurulup kapının
**bloklad**ığı ölçülür. **Negatif kontrol, mekanizmanın çalıştığı ayrıca kanıtlanmadan kanıt
değildir.**

### 11.7 Sabotaj kanıtı — ve ARACIN kendi bulduğu üç körlük

| tur | sabotaj | KIRMIZI | kör | ATLANAN |
|---|---|---|---|---|
| 1 | 6 | 3 | **3** | 0 |
| 2 (test sertleştirildikten sonra) | 6 | **6** | 0 | 0 |

⭐**İlk turda kör kalan üç kol, kapının değil TESTİN zayıflığıydı ve üçü de aynı sınıftı — VEKİL
KANIT:**

| sökülen kol | test niçin göremedi | düzeltme |
|---|---|---|
| `bilinmeyen` bayrağı | uyarı **yine basılıyordu**, değişen şey DAVRANIŞTI | çakışan claim kurulup çıkış kodu ölçüldü |
| onarım (`writeFileSync`) | `onar()` yine `true` dönüyor, "ONARILDI" yazılıyordu | kimlik **dosyasının içeriği** okundu |
| fail-open uyarısı | `/fail-open/i` deseni **başka bir mesajda da** geçiyordu | tam cümle deseni + davranış kolu |

Kural olarak yazılıyor: **bir kapının çıktısındaki cümleyi ölçmek, o kapının yaptığı işi ölçmek
değildir.** Mesaj vekil kanıttır; dosyanın yeni hâli, çıkış kodu ve blok kararı asıl kanıttır.
Sabotaj bu ayrımı ücretsiz gösterir — koşulmasaydı 8/8 yeşil bir test üç kolunda kör olarak
depoya inecekti.

### 11.8 ⭐BU BÖLÜM YAZILIRKEN §9.1 TUZAĞINA KENDİM DÜŞTÜM — vaka kaydı

E1-v2'yi yazarken commit komutum **ortak ana dizinde** koştu ve `master` dalına yerel bir commit
attı; `git add -A` yabancı artıkları (`.playwright-mcp/*`, başka şeritlerin companion'ları) da
aldı. Sebep tam olarak §9.1'de yazılı olan şeydi: **kabuk cwd'si sessizce ana çalışma dizinine
resetlenir** — ölçüm için bir kez `cd`'lediğim başka depodan sonra sonraki komutlar 851 ağacında
değil ana dizinde çalıştı.

Zarar ölçüldü ve geri alındı: commit `reset --mixed` ile çözüldü (dosyalar yerinde kaldı),
ana dizin `origin/master`'ın önünde **0 commit**, push edilmemişti. İki şerit dalı (`rec86-faz1`
10 commit, `rec84-denetim-penceresi`) ölçümle doğrulandı, **kayıp yok**.

**Kural — kancalar için yazılmış §9.1, ELLE koşan komutlar için de geçerlidir:** şerit işi yapan
her git/dosya komutu **`git -C <ağaç>` ya da mutlak yol** kullanır; cwd'ye güvenilmez. Ek olarak
**`git add -A` şerit işinde kullanılmaz** — ortak ağaçta yabancı artıkları toplar; dosyalar
adıyla eklenir.


---
# FILE: docs\standards\form-submission-standard.md

# Form Gönderim Cetveli (müşteri yüzü)

> **Kapsam:** Ziyaretçinin/müşterinin doldurup gönderdiği **her** form.
> Admin içi formlar bu cetvelin dışındadır (onlar `admin-design-standard.md`'ye tabidir).
> **SSOT:** bu dosya. Bekçi: `src/__tests__/conformance/form-submission-integrity.test.ts` (INV-FORM-1).

## 0. Niçin bu cetvel yazıldı (ölçüm, 2026-08-19)

Cetvel **yoktu** ve boşlukta iki kusur yaşadı — ikisi de aynı sınıftan:

| dosya | ne yapıyor | sonuç |
|---|---|---|
| `src/components/LeadModal.tsx:53-70` | `setTimeout(1200ms)` → başarı ekranı | ad, e-posta, telefon, firma, şehir, mesaj **ve KVKK rızası** hiçbir yere yazılmıyor |
| `src/views/ContactPage.tsx:46` | yorum: *"Form submission logic using supabase would go here"* | aynı sınıf |

LeadModal ana sayfada canlıdır ve dört tetikleyicisi vardır (`CaseStudySection`,
`ClientLeadButton`, `HomeSinevizyon`, `MagneticCTA`). Yani sitenin en görünür talep
toplama yüzeyi, müşteriye "aldık" derken hiçbir şey almıyordu.

**Sınıfın adı: sahte-başarı.** Kod çalışıyor, ekran doğru, test yeşil, veri yok. Bu cetvel
tam olarak bu boşluğu kapatmak için yazıldı; kural, ekranın kanıta bağlanmasıdır.

## 1. Temel sözleşme — başarı ekranı KANITA bağlıdır

> **Başarı ekranı yalnızca kalıcı kayıt döndüğünde açılır.**

- "Kalıcı kayıt döndü" = yazma çağrısı hatasız sonuçlandı **ve** yazılan satırın kimliği
  (`id`) geri alındı. Dönüşü kullanılmayan yazma, kanıtlanmamış yazmadır.
- **Niçin id şart:** hatasızlık tek başına zayıf kanıttır; geri dönen kimlik, satırın
  gerçekten oluştuğunu gösteren tek pozitif işarettir.
- Zamanlayıcı, animasyon süresi, `Promise.resolve()` ya da iyimser (optimistic) durum
  **başarı kanıtı değildir**.
- Başarı ekranı ile yazma arasında hiçbir koşul bulunmamalıdır: yazma başarılıysa ekran
  açılır, değilse açılmaz. Üçüncü bir dal yoktur.

## 2. Dürüst hata yolu

- Yazma hata verirse kullanıcıya **hata gösterilir**; form açık kalır, girdiler korunur.
- Hata metni sözlükten gelir (`i18n`), TR **ve** EN karşılığı bulunur — ham dize yasaktır.
- Kullanıcıya teknik hata gövdesi (`error.message`) gösterilmez; teşhis kaydı
  `errorReporter`/console'a gider, ekrana yalnız insanca cümle çıkar.
- **Sessiz yutma yasak:** `catch {}` ile hatayı yutup ekranı değiştirmemek, sahte-başarının
  ikinci biçimidir.

## 3. KVKK rızası kayıtla BİRLİKTE saklanır

- Rıza kutusu bir gönderim ön koşuluysa (`consent` zorunlu), rızanın kendisi de **kayıtla
  aynı satırda** saklanır: rıza bayrağı + rıza zamanı.
- Rıza toplayıp saklamamak, rıza almamış olmakla aynı kapıya çıkar — kanıtı yoktur.
- Rıza alanları `legal-compliance-standard.md` ile birlikte okunur.

## 4. Spam asgarî önlemi

Anonim ziyaretçiye açık her form için **en az** şu üçü:

1. Zorunlu alanlar veritabanı tarafında da boş geçilemez (`WITH CHECK` ile).
2. Rıza `true` olmadan satır yazılamaz (yine `WITH CHECK`).
3. Rol yetkileri asgarî: anon rolünün hedef tablo üzerinde **hiçbir** yetkisi olmaz;
   yalnız yazma fonksiyonunu çalıştırma (`EXECUTE`) yetkisi verilir. (Ölçüm 2026-08-19:
   `contact_messages` üzerinde anon'un `DELETE`, `UPDATE`, `TRUNCATE` yetkisi **vardı**;
   tek engel izin veren politikanın bulunmamasıydı. Politika ekleyen kişi `FOR ALL`
   yazsaydı anonim ziyaretçi tabloyu boşaltabilirdi.)

Hız sınırı (aynı IP'den N/dakika) bu cetvelin **kapsamı dışındadır** ve ayrı bir iş olarak
kuyruktadır; yukarıdaki üç madde onun yokluğunda da zorunludur.

## 5. Hangi form hangi tabloya yazar

| form | dosya | tablo | yazan rol |
|---|---|---|---|
| Talep/lead modalı | `src/components/LeadModal.tsx` | `public.contact_messages` (RPC: `submit_contact_message`) | anon + authenticated |
| İletişim sayfası | `src/views/ContactPage.tsx` | `public.contact_messages` (RPC: `submit_contact_message`) | anon + authenticated |
| Teklif talebi (RFQ) | `src/components/quotes/QuoteRequestModal.tsx` | `public.venthub_quotes` (+ `venthub_quote_items`) | authenticated |

Yeni bir müşteri-yüzü form eklenirse **bu tabloya satır eklemek zorunludur**; hedefi
yazılmamış form, sahte-başarının açık davetidir.

## 6. Yazma katmanı

- Yazma **`lib/services/` altındaki bir servisten** yapılır; bileşen doğrudan
  `supabase.from(...)` çağırmaz.
- Servis, projedeki DI kuralına uyar: ilk parametre `supabase: SupabaseClient<Database>`
  (CLAUDE.md §2).
- Var olan desen budur — `QuoteRequestModal` → `createQuoteRequest(supabaseBrowserClient, ...)`.
  Müşteri-yüzü yazma için Edge Function **gerekmez**.
- **Anonim ziyaretçiye açık formlar** tabloya doğrudan yazmaz; `SECURITY DEFINER` bir
  veritabanı fonksiyonundan geçer (`public.submit_contact_message`). Sebebi ölçülmüş bir
  kısıttır: `insert().select()` = `INSERT ... RETURNING` ve `RETURNING`, tablo üzerinde
  `SELECT` yetkisi ister — bunu anon'a vermek ziyaretçiye **başkalarının mesajlarını**
  okutmak olurdu. Fonksiyon hem id döndürür (§1'deki kanıt) hem de anon'u tablodan tümüyle
  uzak tutar.

## 7. Yasak desenler (bekçi bunları arar)

1. `setTimeout` / `setInterval` ardından doğrudan başarı durumu kurmak.
2. "Simulate API call", "would go here" türü, yazma yerine geçen yorum.
3. Başarı durumunu yazma çağrısından **önce** kurmak.
4. Yazma sonucunu (`error`) hiç okumamak.

## 8. Bekçi: INV-FORM-1

Bekçi iki koldan ölçer:

- **Statik:** §7'deki desenler müşteri-yüzü form dosyalarında bulunmaz. Muafiyet ancak
  **adıyla** yazılır ve gerekçesi satırda durur.
- **Davranışsal:** yazma çağrısı hata döndüğünde başarı ekranının **açılmadığı** gösterilir.

Kapı eklendiğinde **bilerek bozulur**: sahte-başarı deseni geri konur, bekçinin kırmızı
verdiği görülür, sonra geri alınır. Yakalamayan bekçi kapı sayılmaz.


---
# FILE: docs\standards\i18n-localization-standard.md

# VentHub i18n / Localization Standardı (Cetvel)

> **Ne bu?** TR/EN çok-dilli ürünün **tek doğru kaynak (SSOT)** kuralları ve bu kuralların
> **otomatik bekçileri (conformance kapıları)**. Cetvel = kural (insan: niçin/ne) · Kapı = zorlayıcı
> (makine: nasıl-doğru-kalır). "Olur" demez, **ölçer.**
> Oluşturma: 2026-06-15 · Sahibi: Recep · Nasıl-yapılır oyun kitabı → `.claude/skills/i18n-conventions`
> + `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md`. Bu dosya **cetvel**, playbook değil.

---

## 0. Yönetici İlke

İngilizce arayüzde Türkçe sızıntı, dilsiz (locale'siz) URL, ya da ham anahtar (`account.x.y`)
= **"profesyonel değil" damgası.** Çeviri/biçim/rota kalitesi *cila* değil **cevher**. Bir kural
"önemli + kolay ihlal + gözle zor yakalanır" ise → **kapı (test) ister**, code-review'a bırakılmaz.

---

## 1. SSOT Katmanları (tek doğru kaynak)

| Alan | Tek Doğru Kaynak | Nereden |
|---|---|---|
| UI metni | `tr.ts` (SSOT) + `en.ts` (sadık çeviri, `en: typeof tr` mühürlü) | `src/i18n/dictionaries/` |
| Çeviri çağrısı | `useI18n().t('ns.key')` | `@/i18n/I18nProvider` |
| **Navigasyon URL'i** | client: `useLocalizedRoutes()` · RSC/paylaşılan: `localizedHref(url, lang)` | `src/hooks/useLocalizedRoutes.ts`, `src/utils/routes.ts` |
| **Entity adı (display)** | `getCategoryDisplayName(cat, t)` (`translation_key`→dict) | `src/utils/categoryHelpers.ts` |
| **DB JSONB çeviri** | `mapCategoryWithLocale(dbCat, lang)` (`metadata[lang]`) | `src/lib/type-converters.ts` |
| **Para** | `formatCurrency(value, lang)` | `@/i18n/format` |
| **Sayı (para-dışı)** | `formatNumber(value, lang)` (adet, hacim m³, hesap sonucu) | `@/i18n/format` |
| **Tarih** | `formatDate(iso, lang)` / `formatDateTime` | `@/i18n/datetime` |
| Rota tabanı (dilsiz authority) | `Routes.x()` — **render'da daima localize edilir** | `src/utils/routes.ts` |

---

## 2. Mutlak Kurallar (ihlal = mimari hata)

1. **Hardcoded string YASAK** — kullanıcıya görünen TÜM metin `t()`'den (izinli semboller hariç, bkz. skill `allowedStrings`).
2. **Manuel `/${lang}/...` YASAK** — URL dil öneki yalnız `useLocalizedRoutes`/`localizedHref` ile. Sabit app-yolu literal'i (`href="/category/..."`) de yasak.
3. **Client'ta ham `Routes` YASAK** — `import { Routes }` tek başına nav render eden bileşende olmaz; `useLocalizedRoutes()` proxy'si ya da `localizedHref` zorunlu. (İstisna: `/admin*` dil-öneki almaz; R3F Canvas context'i geçmez.)
4. **Entity adı SSOT'tan** — `categoryList` sözlüğünü `slug` ile doğrudan indeksleme yasak (slug ≠ `translation_key`); `getCategoryDisplayName` kullan.
5. **DB JSONB çeviri locale-mapper'dan** — `metadata.hero_description` vb. ham okuma yasak; `mapCategoryWithLocale` / `getCategoryDescription` kullan.
6. **Para/sayı/tarih format helper'dan** — ham `Intl.*Format`/`toLocale*String`/elle `₺` birleştirme yasak; `formatCurrency`/`formatNumber`/`formatDate`. (Tek muaf: SSOT'un kendisi — `i18n/format.ts`, `i18n/datetime.ts`.)
7. **Hiyerarşik anahtar** — `section.subsection.key`. Paylaşılan metin → `common`. Çakışan anahtarı körlemesine yeniden-tanımlama.
8. **Hreflang** — self-referencing + reciprocal (A→B ⇒ B→A) + ISO kodları (`en-GB` ✓) + `x-default`. Canonical, locale URL'i ile eşleşir.
9. **Anahtar yapısı: tek-segment düz YA DA gerçek nested** — çözücü `getDictValue` **NESTED-ONLY** (`path.split('.')` + iç içe iner, bulamazsa ham path döner). İçinde-nokta **düz** anahtar (`'table.productCol'`, `'settings.title'`) çözülmez → **ham-key render** (sessiz bug; tsc/lint/parity/build yakalamaz). Yeni anahtar ya `'pageTitle'` (tek-segment) ya `table: { productCol }` (gerçek nested) olmalı; içinde-nokta düz anahtar **YASAK**. Anahtarı doğru namespace'te tanımla (`t('common.share')` çağrılıyorsa `share` gerçekten `common` altında olmalı).

---

## 3. Conformance Kapıları — Drift Eksenleri (ne var ne yok)

> Her eksen = bir bug-sınıfı. Kapısı olan eksen **kalıcı kapalı** (drift sızamaz). Kapısı olmayan = **açık borç**.

| # | Eksen | SSOT | Kapı (bekçi) | Durum |
|---|---|---|---|---|
| A | Entity-adı (display) | `getCategoryDisplayName` | **INV-1** `category-name-ssot.test.ts` | ✅ KAPALI |
| B | Localize-rota | `useLocalizedRoutes`/`localizedHref` | **INV-2** `localized-route-ssot.test.ts` (3 kural: elle önek · sabit app-yolu · ham Routes) | ✅ KAPALI (54 dosya migrate) |
| C | i18n literal → t() | `t()` + `en: typeof tr` | eslint `react/jsx-no-literals` + `test:i18n` parite + `prebuild` | ⚠️ KISMÎ — kapsam-içi kapalı; **admin (~256) + legal (~235) ertelendi** |
| D | Para/sayı/tarih biçimi | `formatCurrency`/`formatNumber`/`formatDate` | **INV-3** `numeric-format-ssot.test.ts` (ham `Intl.*Format` · `toLocale*String` yasak; muaf = SSOT 2 dosya) | ✅ KAPALI (6 saha migrate) |
| E | DB JSONB çeviri (display) | `getCategoryDescription` / `mapCategoryWithLocale` | **INV-4** `category-metadata-i18n-ssot.test.ts` (ham `hero_*` / `technical_summary` okuması yasak) | ✅ KAPALI (`CategoryShowcase` helper'a bağlandı) |
| F | Hreflang/SEO | hreflang seti | — manuel denetim | ⚠️ blueprint var (`seo-transition-blueprint.md`) |
| G | **i18n key-çözünürlük** | `getDictValue` nested-only | **INV-5** `i18n-key-resolution.test.ts` (her statik `t('a.b.c')` sözlükte çözülmeli; içinde-nokta düz anahtar = ham-key render) | ✅ KAPALI (ratchet: 2026-06-16'da 32 debt donduruldu → admin literal batch #364 15'ini çözünce 32→17 sıkıştı; yeni kırılma kırar) |

| H | **Ölü sözlük anahtarı** (ters yön) | sözlükteki her yaprağın bir tüketicisi olmalı | **INV-6** `i18n-dead-key.test.ts` (7 tüketim ekseni: statik · şablon **ayraçsız VE ayraçlı** · `dict.x` erişimi · veri-anahtarı · ata-anahtar · yaprak-adıyla indeksleme) | ✅ KAPALI (ratchet: 2026-08-23'te 431 borç donduruldu → 79'u **canlı çıktı**, gerçek borç **352**; liste yalnız küçülebilir) |

> **G ile H aynı eksen DEĞİL.** G **çağrı → sözlük** yönünü tarar (anahtar çözülüyor mu),
> H **sözlük → çağrı** yönünü (anahtarın tüketicisi var mı). G'nin yakaladığı kusur
> **görünür**dür (ekranda ham anahtar); H'ninki **görünmez** — bu yüzden bugüne kadar kapı
> almadı ve birikti. Ölçüm: `docs/audits/i18n-sozluk-render-denetimi-2026-08-23.md`.
>
> **H'nin en kritik kuralı — önek eşlemesi AYRAÇSIZ olmalı.** Kod anahtarı ayraçsız
> birleştirebiliyor: `` t(`pdp.actions.download${'Catalog'}`) ``. Önek `önek.` diye eşlenirse
> bu anahtarlar ölü sanılır; denetimde tam bu yüzden **10 canlı anahtar** ölü listesine
> düşmüştü. INV-6 o 10 anahtarı **kanarya** olarak tutar: ölü görünüyorlarsa sözlük değil
> **kapının kendisi kördür**.
>
> **H'nin İKİNCİ kritik kuralı — önek eşlemesi HER İKİ şablon biçimini tanımalı.**
> Kod anahtarı iki biçimde kurar: ayraçsız (`önek${x}`) **ve** ayraçlı (`önek.${x}`).
> İlk sürüm yalnız ayraçsızı tanıyordu; `common.categoryList.${tKey}` (`categoryHelpers.ts:32`)
> ve `pdp.specs.${specKey}` eşleşmedi → **79 CANLI anahtar ölü sanılıp borç listesine yazıldı**
> (18 kategori adı + 61 PDP spec etiketi). Bu sınıfın canlılığı **veritabanında** yaşar
> (`categories.translation_key`, ürün spec anahtarları): tam yol kaynakta HİÇ geçmez, dolayısıyla
> anahtar silinseydi INV-5 de görmezdi ve ekranda ham anahtar belirirdi. INV-6 artık
> `KANARYA_AYRACLI` setiyle bu körlüğü de sınar.

| I | **Kasa dönüşümü ile dil** (`text-transform`) | veri kaynaklı özel ad CSS ile büyütülmez | **INV-7** `i18n-uppercase-proper-noun.test.ts` (kapsam + tespit kanaryası, ratchet 21 borç) | ✅ KAPALI (2026-08-23) |
| J | **Locale-siz kasa çevirimi** (JS) | `src/i18n/case.ts` → `localeLower`/`localeUpper` (ekran), `foldForSearch` (arama) | **INV-8** `i18n-locale-case.test.ts` (kullanıcı-metni ifadesine uygulanan `toLowerCase()`/`toUpperCase()`; teknik dize kapsam dışı) | ✅ KAPALI (mandal: 14 dosya / 23 ihlal donduruldu, 6'sı teknik yanlış-pozitif; liste yalnız küçülebilir) |

> **I ekseni — `text-transform: uppercase` DİLE DUYARLIDIR.** Eleman `lang="tr"` mirası
> altındaysa tarayıcı Türkçe kasa uygular ve `i → İ` olur. Türkçe metin için DOĞRU, yabancı
> özel ad için YANLIŞ: **Vortice → VORTİCE**, **Lineo → LİNEO**, **Quiet → QUİET**.
> Kusur 2026-08-23'te canlı vitrinde görüldü (Recep bildirdi, `/tr/products/vortice-lineo-quiet`).
>
> **Çözüm "elemana `lang` ver" DEĞİL — ölçüldü, mümkün değil.** Aile adları **karışık dilde
> tek dize**: `'Vortice Lineo Quiet Kanal Fanları'`. `lang="tr"` markayı bozar (VORTİCE),
> `lang="en"` Türkçe kelimeleri bozar (ENDÜSTRIYEL, EMIŞLI). Canlı ölçüm: `product_families.name`
> 38 adın **36'sı** bu sınıfta, `brands.name` 5 markanın 2'si. Dize tek kolonda yaşadığı için
> parçalanamaz. Tek doğru kural: **veri kaynaklı özel adı CSS ile büyütme.**
>
> **Kapsam dışı (bilerek):** sözlükten gelen STATİK arayüz metnini `uppercase` ile basmak
> serbesttir — o metnin dili sayfanın diliyle zaten aynıdır. Kusur, metnin dili ile elemanın
> dili AYRILDIĞINDA doğar; bu yüzden `t('...')` interpolasyonları elenir.
>
> **Bu eksenin KAPATAMADIĞI komşu kusur:** `src/app/layout.tsx` kökte `<html lang="tr">`'yi
> SABİT yazıyor; `/en/...` sayfaları da `lang="tr"` alıyor. INV-7 kod tarar, bu niteliği
> göremez — ayrı kusur, ayrı sahip (rota/altyapı alanı). Görmediğini gizlemiyoruz.

> **I ile J aynı eksen DEĞİL.** I, **CSS**'in (`text-transform: uppercase`) dile göre farklı
> davranmasıdır — kusur *niteliktedir*, ekranda görünür. J, **JavaScript**'in
> `toLowerCase()`/`toUpperCase()` metotlarının **locale'den bağımsız** olmasıdır: Türkçe'de
> `İ → i̇` (birleşen nokta U+0307) ve `I → i` (`ı` değil) üretirler. J'nin kusuru **sessizdir** —
> kimse hata almaz, arama boş döner.
>
> **J'nin GÖRMEDİĞİ üç şey** (üçü de ayrı iş):
> 1. **Kök `<html lang>` sabit** (`src/app/layout.tsx`) — I ekseninin donmuş 21 yerini asıl
>    açacak olan budur ve **HOLD'dadır** (çoklu-kök layout restructure, ADMIN koordinasyonu bekler).
>    T147a başlık/açıklama/OG-yerelini getirir, `<html lang>`'i **düzeltmez**.
> 2. **`localeCompare` dil parametresiz** — 11 kullanım, 9'unda yok. Bedeli yalnız "yanlış sıra"
>    değil: SSR (Node) ile istemci (tarayıcı) **farklı varsayılan locale** kullanır, yani sıra
>    **hidrasyonda değişebilir**. Müşteriye dokunan dördü ölçüm belgesinde adıyla yazılı.
> 3. **Postgres tarafı** — vitrin araması `get_search_suggestions` / `fts_search_products`
>    RPC'lerine gider ve JS'te kasa çevirmez; doğruluğu DB collation'ı ve Türkçe FTS sözlüğüyle
>    ölçülür, bu kapının konusu **değildir**.
>
> **`toLocaleLowerCase('tr')` KULLANILMAZ:** ICU verisine bağlıdır, ICU'suz (small-icu) bir Node
> çalıştırmasında **sessizce** locale'siz davranışa düşer. `case.ts` eşlemeyi elle yazar.
>
> **Arama aksan duyarsızdır** (`foldForSearch`): "siginak" yazan kullanıcı "Sığınak Fanı"nı bulur.
> Recep onayı 2026-08-23. Eşleşmeyi yalnız **genişletir**. Ekrana basılan metinde KULLANILMAZ.
>
> Ölçüm: `docs/audits/locale-kasa-envanteri-2026-08-23.md`.

**Açık eksenleri kapatma yöntemi:** drift denetimi (ajan) → maestro paralel göç → merkezi kapı (type+lint+test+build) → **yeni INV-x conformance testi** → commit. (B ekseninin yaptığı gibi.)

---


## 4. DoD — Canlı UI'da ASLA görünmemeli

- [ ] Ham anahtar sızıntısı yok (`account.x.y` gibi nokta-yollu metin) — **INV-5 keycheck** otomatik tutar; her statik `t('...')` sözlükte çözülmeli.
- [ ] Çözülmemiş `{{placeholder}}` / `NaN` / `undefined` yok.
- [ ] Dil değişince TÜM metin + tarih/para biçimi güncelleniyor.
- [ ] Dilsiz URL yok (her iç link `/tr|/en` önekli render ediliyor).
- [ ] Hardcoded TR/EN literal yok (izinli semboller hariç).
- [ ] EN deyimsel (`30%` değil `%30` değil; TR=EN sızıntısı yok — sadık-kopya yan etkisi taranmış).

---

## 5. İlgili

- **Playbook (nasıl):** `.claude/skills/i18n-conventions` · toplu göç makinesi `docs/plans/i18n-jsx-literals-cleanup-2026-06-14.md`
- **Kapı kaynak:** `src/__tests__/conformance/` (INV-1 entity-adı · INV-2 localize-rota · INV-3 sayısal/zamansal biçim · INV-4 metadata JSONB-çeviri · INV-5 key-çözünürlük/keycheck)
- **Komşu cetveller:** `admin-standard.md`, `dealer-network-standard.md` · **SEO:** `docs/plans/seo-transition-blueprint.md`
- **CLAUDE.md** Kural #7 (i18n) bu cetvelin özetidir.


---
# FILE: docs\standards\is-kayit-duzeni-standard.md

# İş-Kayıt Düzeni Standardı

> **Durum:** v1 · 2026-08-26 · Sahip: OPS
> **Kaynak:** Recep'in 08-26 ilkeleri + ORION çürütmesi (`C:/tmp/orion-kayit-duzeni-curutme.md`, 7 bölüm)
> + REC-53 triyaj ölçümleri (`docs/audits/registry-triyaj-2026-08-26.md`).
> **Niçin var:** 2026-08-26'da "açık" görünen 120 kaydın 54'ü ZATEN YAPILMIŞTI, 19'u
> tanımlanamayacak kadar kötü açılmıştı, 5 kimlik çakışıyordu. Sistem geçmişini bilmiyordu;
> aynı iş yeniden öne sürülebiliyordu. Bu cetvel o sınıfı kapatır.

## 1. Katman haritası — hangi soru nereye

| Katman | Rolü | SSOT olduğu alan |
|---|---|---|
| **Linear** | Canlı işlerin tek listesi; açılış ve kapanış burada | **Açık/süren iş** — çelişkide Linear kazanır |
| **orion registry** | Donmuş arşiv defteri (görev takibinden 08-26'da emekli) | **Tarihçe** — "bu iş geçmişte var mıydı/ne oldu" sorusunda registry kazanır |
| **git / PR** | Kanıt | Kodun ve kapanış kanıtının kendisi |
| **Pano (C:/tmp/venthub-board)** | Ajanlar arası anlık telsiz; TTL'li | Hiçbir şeyin SSOT'u DEĞİL — iş kaydı tutulamaz |
| **NLM ikizi** | Doğal dilde aranabilir hafıza | "Niçin/hangi karar/hangi desen" soruları |

Katı kurallar (ORION §5, ampirik sınırlarla):
- **Sayım/enümerasyon/"şu an" sorusu ikize SORULMAZ** (RAG eksik liste verir, snapshot bayattır).
  Kapanış kararı asla ikizden doğrulanmaz.
- **Registry gerekçe METNİ tutmaz, gerekçeye İŞARET tutar** (PR/dosya referansı). Kopyalanan
  anlatı bayatlar; işaret bayatlamaz.
- Beşinci bir katman EKLENMEZ (Notion/Jira/ayrı dashboard/ayrı cron servisi — 08-26 araştırma
  raporu: mevcut dört katman + GitHub Actions cron'ları yeterli; yeni katman SSOT'u böler).

**ORION §4'ten sapma, gerekçesiyle:** ORION "registry SSOT, Linear ayna" önerdi. Sapıyoruz
çünkü Recep 08-26'da registry'yi görev takibinden emekli etti — canlı iş artık yalnız
Linear'da yaşar ve orada yönetilir; registry'nin otoritesi kapanmış tarihçeyle sınırlıdır.
Alan ayrımı yazıldığı için "hangisi doğru" belirsizliği (ORION'un asıl endişesi) doğmaz.

## 2. Kayıt AÇMA şablonu (Linear)

Zorunlu dört alan — dördü de açılış anında **dürüstçe** doldurulabilir olanlardır
(ORION §2: açılışta zorunlu kanıt alanı uydurma üretir — `required-field-pressures-fabrication`):

1. **Ne** — iş tanımı.
2. **Niçin** — değer cümlesi (satan platforma / SaaS hedefine / ekip verimine katkı).
3. **Kabul ölçütü** — "bittiğini nereden anlayacağız." Kapanışı ölçülebilir kılan asıl alan.
4. **Eleme kaydı** — mükerrer adayları ve eleme gerekçeleri (§3).

`Kanıt-Referans` açılışta ZORUNLU DEĞİL (varsa yazılır); **kapanışta zorunludur** (§4).

Kimlik: taşınan kayıtlar eski registry kimliğini (`Txxx-VH` vb.) gövdede taşır.
Başlık konvansiyonu: kimlik kodu baştaki köşeli parantezin İÇİNDE (`[ŞERİT · Txxx-VH]`).

## 3. Mükerrer önleme — aramanın EYLEMİ değil SONUCU

"Arandı, yok" satırı BEYANDIR ve beyan 08-26'da iki kez düştü (ORION §1). Kural:

- Kayıt açan (insan ya da ajan) açmadan önce üç yüzeyde arar: **triyaj/audit belgeleri +
  registry + Linear**. Ama kayda yazılan şey "aradım" değil, **aday listesi + eleme**dir:
  en yakın adaylar ve her birinin tek-cümle eleme gerekçesi "Eleme kaydı" alanına girer.
- Aday yoksa "aday çıkmadı (aranan kelimeler: ...)" yazılır — aranan kelimeler yazılır ki
  yanlış-kelime hatası sonradan teşhis edilebilsin.
- Bu kapı **BLOKLAMAZ** (aday listesi kesin değildir; bloklayan mükerrer-kapısı ilk
  yanlış-kırmızıda atlatılır — T033). Ölçülen şey atlatma oranıdır: elenen bir adayın
  sonradan mükerrer çıkması arama iyileştirme sinyalidir.
- **Kapı adayı (v2):** kayıt açma komutunun aramayı kendisinin koşup adayları ekrana
  basması (araç arar, insan eler). v1'de disiplin + eleme kaydı; v2'de araç.

## 4. Kayıt KAPAMA kuralları

- **Kanıt-Referans zorunlu:** dosya yolu / commit / PR / ölçüm satırı olmadan "bitti" yazılamaz.
- **Kapanış sebebi kapalı sözlükten** (ORION §3 — serbest metin sayılamaz, sayılamayan
  alan üzerinde kapı kurulamaz):
  `yapildi` · `gereksiz-mukerrer` · `gereksiz-kapsam-disi` · `vazgecildi` ·
  `belirsiz-insana-soruldu` · `kurtarilamaz-kayit`
  Son ikisi meşru hükümlerdir: "anlamadık" canlı işle aynı görünürse bir sonraki triyajda
  yine vekil ölçü (tarih!) icat edilir — REC-53 vetosunun kökü buydu.
- Kapanan iş bir sonraki işi doğuruyorsa (T063 örneği: mekanizma bitti, kanal Recep'te),
  **önce ardıl kayıt açılır, sonra eski kayıt ona işaret ederek kapanır** (ORION §6).
- PR gövdesinde `Fixes REC-nn` satırı zorunlu — Linear'ın GitHub entegrasyonu durumu
  otomatik akıtır (08-26 araştırması: free planda dahil; ayrı Action gerekmez).

## 5. Arşiv ve silme

- **Silme YOK.** Kayıt statüyle kapanır, gövdesi ve tarihi arşivde kalır
  (Recep 08-26: "arşiv olmazsa geçmişimizi kaybediyoruz").
- Registry'ye yazma yalnız CLI/engine yolundan (elle SQL yasak).
- Linear free tavanı (250 arşivlenmemiş kayıt) için periyodik arşivleme rutini OPS'ta.
- Toplu kapanış koşumları: önce yedek + kuru koşum + log; "tarihsizlik = ölülük" gibi
  **zaman-vekilli ölçüler YASAK** — bayatlık değişimle ölçülür.

## 6. Şerit reaktivasyon ritüeli

Duraklatılmış bir şerit yeniden açılırken:
1. Dal master'a rebase edilir (yaş ≠ bayatlık; çelişki varsa değişimden ölçülür).
2. İşin Linear kaydı yoksa §2 şablonuyla açılır; varsa durum güncellenir.
3. Triyaj/audit belgelerinde işin geçmişi kontrol edilir (yapılmış kısmı tekrar yapılmaz).
4. Şerit, kapanışlarını `Fixes REC-nn` ile Linear'a bağlar.

## 7. Bu cetvelin kendi kapıları (uygulama sırası)

| Kapı | Soru | Durum |
|---|---|---|
| Ayna-parite | Taşınan her açık registry kaydının Linear kimliği var mı? | ORION kuyruğunda |
| NULL-id | Registry'de id'si boş kayıt var mı? (kök: PK NOT NULL garantisi vermiyor — ORION §7) | ORION kuyruğunda (şema onarımıyla) |
| Sözlük | Kapanış sebebi sözlük dışı mı? | Sözlük sütunuyla birlikte |


---
# FILE: docs\standards\legal-compliance-standard.md

# Hukuki Uyum Cetveli

> **Sürüm:** v1.0 · **Yürürlük:** 2026-08-16 · **Sahip:** LEGAL-OPS şeridi
> **Kapsam:** yasal metinler (`src/views/legal/**`), hukuki konfigürasyon (`src/config/legal.ts`),
> fatura hattı, KVKK veri sahibi talepleri.
> **Bekçi:** `src/__tests__/conformance/legal-promise-backing.test.ts` (INV-LEGAL-3)
> **Kardeş cetveller:** INV-LEGAL-1 (onay kapısı) · INV-LEGAL-2 (analitik rızası)

---

## 0) Bu cetvel niçin var

VentHub'ın yasal metinleri, kullanıcıya **taahhüt** verir: "fatura düzenlenir",
"başvurunuz 30 gün içinde sonuçlandırılır", "bedel 14 gün içinde iade edilir".
Bu cümleler pazarlama metni değil, **sözleşme hükmüdür** — ve her biri, arkasında
gerçekten çalışan bir mekanizma olduğunu varsayar.

2026-08-16 operasyon denetimi, bu varsayımın üç yerde tutmadığını ölçtü:

| Metindeki taahhüt | Gerçek |
|---|---|
| "Fatura … düzenlenir" (Mesafeli Satış Sözl. §5) | Hiçbir fatura belgesi üretilmiyor; kodda tek bir entegratör izi yok |
| "Talepleriniz … 30 gün içinde sonuçlandırılır" (KVKK §…) | Başvuru e-postası yer tutucu; talebi alan/kaydeden/süreyi işleten mekanizma yok |
| "iadeniz tamamlandı" (iade e-postası) | Gerçek para iadesi yapılmıyordu — mock çağrılıyordu (T053-VH) |

Üçünün ortak sınıfı şudur: **metin doğru yazılmış, mekanizma hiç yazılmamış.** Hiçbir
test, hiçbir lint, hiçbir derleme bunu göremez — çünkü ortada bozuk kod yoktur, *olmayan*
kod vardır. Bu cetvelin tek işi o boşluğu görünür kılmak ve kapıya bağlamak.

### Çekirdek kural

> **Yasal bir metinde verilen her taahhüdün, kodda veya konfigürasyonda adı konmuş bir
> karşılığı olmalıdır.** Karşılığı yoksa ya taahhüt metinden çıkar, ya mekanizma yazılır.
> Üçüncü bir seçenek — "şimdilik öyle yazalım" — yoktur; bu, tüketiciye yanlış beyandır.

Karşılık üç biçimden biri olabilir ve **hangisi olduğu §1 tablosunda yazılı olmalıdır**:

1. **Kod** — taahhüdü yerine getiren bir fonksiyon/uç/tetikleyici.
2. **Konfigürasyon** — `legal.ts` içindeki doldurulmuş bir alan (yer tutucu değil).
3. **Yazılı manuel prosedür** — insanın işlettiği, bu cetvelde adım adım tarif edilmiş,
   sorumlusu ve süresi belli bir akış. **Sözlü/örtük prosedür karşılık sayılmaz.**

Üçüncü biçim meşrudur ve küçümsenmemelidir: düşük hacimde manuel fatura kesmek hukuken
tamamen geçerlidir. Meşru olmayan, prosedürün **yazılı olmamasıdır** — çünkü yazılı
olmayan prosedür, devredilemez, denetlenemez ve unutulduğunda hiçbir iz bırakmaz.

---

## 1) Taahhüt ↔ mekanizma sicili

Bu tablo cetvelin kalbidir. **Yasal metne yeni bir taahhüt eklenirse buraya satır eklenir.**
INV-LEGAL-3 tabloyu değil, tablonun işaret ettiği konfigürasyon alanlarını denetler; satırın
kendisini eklemek insanın işidir ve PR incelemesinde aranır.

| # | Taahhüt | Metin | Karşılık | Biçim | Durum |
|---|---|---|---|---|---|
| 1 | Zorunlu yasal onaylar alınmadan ödeme başlamaz | Mesafeli Satış Sözl. §4 | `validateLegalConsents` + INV-LEGAL-1 | Kod | ✅ |
| 2 | Analitik/pazarlama çerezleri yalnız açık rızayla | Çerez Politikası | Rıza kapısı + INV-LEGAL-2 | Kod | ✅ |
| 3 | Fatura, beyan edilen bilgilere göre düzenlenir | Mesafeli Satış Sözl. §5 | §2 köprü prosedürü + `order_invoices` defteri (T132-VH, **hedef: bu PR ile geliyor**) + INV-INVOICE-1 | Manuel kesim + kod defter | 🟡 köprü — kesim elle, **kayıt mekanik** |
| 4 | KVKK talepleri 30 gün içinde ücretsiz sonuçlandırılır | KVKK Aydınlatma | §3 prosedürü + `/admin/data-requests` defteri (T063) + veri sahibi kanalı (§3.6) | Kod + Manuel | 🟡 kanal adresi Recep'te |
| 5 | Cayma hâlinde bedel 14 gün içinde iade edilir | Mesafeli Satış Sözl. §7 | `iyzico-refund` (T053-VH) | Kod | 🔴 EDGE-REFUND şeridinde |
| 6 | Teslimat süresi / kargo firması / iade adresi | Sözl. §6, §7 | `legal.ts` alanları | Konfigürasyon | 🔴 yer tutucu |
| 7 | Kişisel veri saklama süreleri | KVKK §…, Gizlilik | `legal.ts` retention* | Konfigürasyon | ✅ |
| 8 | Bireysel faturada alıcı kimliği (TCKN) | — (mevzuat gereği) | `invoiceIdentity.ts` + `invoiceIdentityThreshold` | Kod + Konfig. | ✅ |
| 9 | Analitik/pazarlama etiketi rıza olmadan yüklenmez | Çerez Politikası | `ConsentGatedAnalytics` + `trackEvent` kapısı | Kod | ✅ |
| 10 | Veri sahibi talebi 30 gün içinde sonuçlandırılır | KVKK Aydınlatma | `data_subject_requests` + admin defteri + süre sayacı (INV-KVKK-1) | Kod | ✅ mekanizma · 🟡 adres |
| 11 | Silme talebinde saklama yükümlülüğü olan veri korunur | KVKK m.7 / VUK | `anonymize_user_personal_data()` | Kod | ✅ prod'da canlı (08-17 ölçüldü) |
| 12 | Veri sahibi kendi talebini açabilir ve durumunu izleyebilir | KVKK m.11 / Aydınlatma | `/account/data-requests` + `p_dsr_owner_insert` / `p_dsr_owner_select` (§3.6) | Kod | ✅ prod'da canlı; davranışı ölçüldü (08-19, §3.6 kapanış kanıtı) |

**8 numaralı satırın gerekçesi (karar kaydı).** TCKN başta koşulsuz zorunlu tutuldu; mevzuat
araştırması (2026-08-16) bunun kanunun istediğinden sıkı olduğunu gösterdi. GİB, nihai
tüketici numarasını vermediğinde `11111111111` dolgusunu kabul eder. **Çözüm "kullanıcıya
`11111111111` yazdırmak" DEĞİL**, alanı boş bırakılabilir kılmaktır: dolgu değeri belge
üretiminin işidir, kullanıcı girdisinin değil. Doldurulursa sağlama çalışmaya devam eder.
Ayrıntı ve kademeler → §4.1.

**Durum sözlüğü:** ✅ karşılık var ve çalışıyor · 🟡 karşılık var ama manuel/geçici, bitiş
kriteri tanımlı · 🔴 karşılık YOK — bu satır kırmızıyken **satış açılamaz**.

---

## 2) Fatura hattı

### 2.1 Hukuki zemin

Fatura düzenleme yükümlülüğü **sözleşmeden değil kanundan** doğar (VUK m.229 vd.).
Sözleşme metnini değiştirmek yükümlülüğü ortadan kaldırmaz. Dolayısıyla:

> **Fatura kesilemeyen bir kurulumda B2C satış açılmaz.** Bu, metin düzeltmesiyle
> aşılabilecek bir eksik değildir.

Sözleşmedeki mevcut ifade ("elektronik ortamda … **iletilebilir**") elektronik iletimi
*izin* olarak kurar, taahhüt olarak değil — yani e-arşiv otomasyonu sözleşmeden doğan bir
borç değildir. Yanlış olan kısım, aynı cümlenin ilk yarısıdır: **"Fatura … düzenlenir."**
Bugün düzenlenmiyor.

### 2.2 Ön koşul zinciri (kod işi DEĞİL, sırayla ilerler)

Aşağıdaki zincir tamamlanmadan hiçbir kod işi anlam taşımaz. Her halka bir öncekine bağlıdır:

1. **Mükellefiyet** — şirket kuruluşu / vergi mükellefiyeti tesisi.
2. **Muhasebeci** — beyanname yükümlülüğü için zaten zorunlu; e-arşiv başvurusunu da o yürütür.
3. **e-Arşiv aktivasyonu** — GİB nezdinde, entegratör + muhasebeci eliyle.
4. **Özel entegratör hesabı** — API'si olan bir sağlayıcı (Paraşüt / BizimHesap / eLogo vb.).
   GİB portalı manuel çalışır, API sunmaz; doğrudan entegratörlük ise ayrı ve ağır bir eşiktir.

**3. adım tamamlandığı gün satış hukuken mümkündür** — otomasyon şart değildir. Köprü tam
olarak bu pencereyi tarif eder.

### 2.3 Köprü prosedürü (otomasyon gelene kadar)

Amaç: düşük hacimde, entegratör panelinden **elle** fatura keserek yasal yükümlülüğü
karşılamak ve bu sırada satışı bloke etmemek.

**Tetik:** `venthub_orders.payment_status = 'paid'` olan her yeni sipariş.

**Adımlar:**

1. **Tespit (günde en az bir kez, iş günü).** Ödemesi tamamlanmış ama defterde satırı
   olmayan siparişler `view_admin_uninvoiced_orders` görünümünden okunur
   (**hedef: T132-VH ile geliyor**). Süzme DB tarafındadır ve bu bilinçlidir: "faturalandı
   mı" sorusu istemcide hesaplanırsa sayfalama ile birlikte yanlış cevap verir — o sayfada
   görünmeyen bir fatura satırı yüzünden faturalı sipariş "faturasız" listelenir.
2. **Fatura kimliği kontrolü.** Siparişin `invoice_type` ve `invoice_info` alanları
   dolu ve geçerli mi? Değilse → adım 6.
3. **Kesim.** Entegratör panelinde e-arşiv faturası düzenlenir. Kalemler, birim fiyatlar
   ve toplam **siparişin snapshot alanlarından** okunur — vitrindeki güncel fiyattan değil
   (fiyat değişmiş olabilir; fatura sipariş anındaki bedeli gösterir).
4. **İletim.** Fatura PDF'i müşterinin sipariş e-postasına gönderilir.
5. **Kayıt.** Fatura, `order_invoices` defterine **bir satır** olarak yazılır
   (**hedef: T132-VH ile geliyor**): `invoice_no`, `invoice_date`, `invoice_type` anlık
   görüntüsü ve kesen kullanıcı. **"Faturalandı" bir bayrak değildir** — işaret, defterde
   satırın VARLIĞIDIR; `venthub_orders` üzerine `is_invoiced` benzeri bir kolon eklenmez.

   > **Karar kaydı (2026-08-20, Recep).** Bu maddenin önceki hâli köprü döneminde kaydı
   > `payment_debug` JSON'una yazmayı söylüyordu. O kolonu **ödeme ve iade yolları da**
   > yazar; aynı sınıf bir gün önce T114-VH'de ölçüldü — koruması olmayan bir değer
   > sessizce ezildi. Yasal delil, paylaşılan bir yazıcının kolonunda yaşamaz. Ayrıca
   > JSON'da fatura numarası tekilliği zorlanamaz ve "hangi ödenmiş sipariş faturalanmadı"
   > sorusu indekssiz tarama olur.

   Defterin üç kilidi ve her birinin **nerede durduğu**:

   | Kilit | Nerede | Niçin orada |
   |---|---|---|
   | Fatura numarası tekil | `lower(btrim(invoice_no))` üzerinde UNIQUE indeks | Aynı numaranın iki siparişe yazılması vergi hukukunda ciddi kusurdur; tekillik ham kolonda kurulursa boşluk veya büyük-küçük harf farkıyla delinir |
   | Ödenmemiş siparişe fatura kesilemez | **Tetik** — politikanın `WITH CHECK`'i değil | Politika yalnız kendi yolunu bağlar; tetik **tüm** yolları bağlar: admin ekranı, servis, ileride otomatik kesim ve elle SQL dahil. Defteri hiçbir yol atlayamamalı |
   | Yasal kayıt değiştirilemez | RLS — UPDATE/DELETE politikası **yok** | Düzeltme yolu iptal + yeni satırdır. İptal v1 kapsamı dışındadır ve adıyla dışarıdadır: geldiğinde `cancelled_at` + `cancel_reason` eklenir |

   Bekçi: **INV-INVOICE-1** (`src/__tests__/conformance/invoice-ledger-contract.test.ts`)
   bu üç kilidin ve bu maddenin geri kaymasını engeller.
6. **Eksik kimlik hâli.** Fatura bilgisi eksik/geçersizse müşteriye e-posta ile sorulur;
   yanıt gelene kadar sipariş **kargolanmaz**. (Bu hâlin hiç oluşmaması için §4'teki
   doğrulama zorunludur — köprünün en kırılgan yeri burasıdır.)

**Süre taahhüdü.** Sözleşme metninde faturanın hangi süre içinde iletileceği yazılıdır ve
bu süre `legal.ts → invoiceDeliveryTime` alanından gelir. Köprü döneminde bu süre, manuel
kesimin gerçekçi ritmine göre belirlenir; **metne yazılan süre, prosedürün taşıyabileceğinden
kısa olamaz.**

**İade/iptal.** İade edilen siparişte iade faturası veya iptal işlemi aynı panelden yapılır;
iade e-postası müşteriye gitmeden ÖNCE yapılır (aksi hâlde müşteri elinde geçerli bir
faturayla, iadesi işlenmemiş bir kayıt kalır).

**Bitiş kriteri (köprü ne zaman kapanır).** Aşağıdakilerin üçü birden sağlandığında:
(a) `order_invoices` defteri canlı **ve** `payment_status='paid'` dalından tetiklenen
**otomatik kesim** çalışıyor — defterin tek başına var olması köprüyü kapatmaz, T132 sonrası
kesim hâlâ elle yapılır,
(b) başarısız kesimler için yeniden deneme kuyruğu var ve gözlemlenebilir,
(c) fatura bağlantısı müşteri e-postasında ve hesap sayfasında görünüyor.
Üçü sağlanana kadar §1 tablosundaki 3 numaralı satır 🟡 kalır.

### 2.4 Sözleşme ifadesi kuralı

Sözleşmedeki fatura cümlesi, **o an yürürlükte olan mekanizmayı** anlatmalıdır:

- Köprü döneminde: faturanın düzenlendiğini ve **hangi kanalla, hangi süre içinde**
  iletileceğini söyler. "Anında", "otomatik", "sipariş onayıyla birlikte" gibi
  ifadeler kullanılamaz.
- Otomasyon açıldığında: cümle güncellenir ve §1 tablosundaki biçim `Manuel` → `Kod` olur.

---

## 3) KVKK — veri sahibi talepleri

### 3.1 Mevzuatın gerçekten istediği

KVKK m.11 ve *Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ* şunları ister:

- **İşleyen bir başvuru kanalı** (kayıtlı e-posta, KEP veya ıslak imzalı yazılı başvuru),
- **kimlik tevsiki**,
- **en geç 30 gün** içinde, kural olarak **ücretsiz** yanıt.

**İstemediği:** self-servis "hesabımı sil" düğmesi. Böyle bir düğme iyi bir ürün
davranışıdır ve güven verir, ancak **hukuki zorunluluk değildir** ve yokluğu satışı
engellemez. Bu ayrım önemlidir: aksi hâlde canlıya çıkış, gereksiz yere bir ürün
özelliğinin arkasında bekletilir.

> **Canlıya çıkış engeli:** çalışan kanal + yazılı prosedür.
> **Ürün işi (engel değil):** self-servis silme/anonimleştirme akışı.

### 3.2 Silme talebi ≠ kaydın silinmesi

Bir müşterinin "verilerimi silin" talebi, **sipariş ve fatura kayıtlarını kapsamaz.**
Bu kayıtlar VUK/TTK gereği saklanmak zorundadır ve sitenin kendi metni de bunu
`retentionOrders` süresi boyunca saklayacağını beyan eder. KVKK m.7, saklama yükümlülüğü
bulunan verinin silinmeyeceğini kabul eder.

Doğru davranış:

| Veri | Talep üzerine yapılacak |
|---|---|
| Hesap/profil, adres defteri, pazarlama izinleri, sepet | **Silinir** |
| Sipariş ve fatura kayıtları | **Anonimleştirilir** — kayıt kalır, kişiyle bağı koparılır |
| Destek yazışmaları | Saklama süresi dolduysa silinir, dolmadıysa anonimleştirilir |

Bu yüzden ileride yazılacak "hesabımı sil" akışı, teknik olarak **silme değil
anonimleştirme** akışıdır. Bunu bilmeden yazılmış bir silme düğmesi, ilk kullanımında
mevzuata aykırı bir kayıt imhası üretir.

### 3.3 Başvuru prosedürü

1. **Alım.** Talep, `legal.ts → applicationEmail` adresine veya KEP'e ulaşır. Bu adres
   **gerçekten izlenen** bir kutu olmalıdır; kimsenin bakmadığı bir adres, kanalın hiç
   olmamasından farksızdır.
2. **Kimlik tevsiki.** Başvuru, sistemde kayıtlı e-posta adresinden geldiyse bu yeterlidir;
   gelmediyse kimlik tevsik edici belge istenir. **Doğrulanmamış talebe veri verilmez** —
   yanlış kişiye veri açmak, talebi hiç yanıtlamamaktan daha ağır bir ihlaldir.
3. **Kayıt.** Talep; tarih, talep sahibi, talep türü (öğrenme / düzeltme / silme /
   aktarım / itiraz) ve 30 günlük son tarihle birlikte kaydedilir. Köprü döneminde bu
   kayıt elle tutulur; kalıcı çözümde `data_subject_requests` tablosu.
4. **Yerine getirme.** §3.2 tablosuna göre uygulanır.
5. **Yanıt.** 30 gün dolmadan yazılı yanıt verilir. Reddedilen talepte gerekçe yazılır ve
   Kurul'a şikâyet hakkı hatırlatılır.

**Süre sayacı en geç 30 gündür ve uzatılamaz.** Talep karmaşıksa bile süre işler; bu
yüzden alım kutusunun izlenmesi prosedürün en kritik adımıdır.

### 3.4 Mekanizma — talep defteri ve anonimleştirme

Prosedürün elle işletilmesi meşrudur (§0), ama **süre ve sonuç ispat yükü altındadır**:
"30 gün içinde yanıtladık" demek yetmez, gösterilebilmelidir. Bu yüzden defter koda alındı.

**`data_subject_requests`** — her talep; başvuran adresi, talep türü, alınma anı, **otomatik
30 günlük son tarih**, kimlik tevsik anı, sonuç ve *saklanan veri notu*. Kullanıcı silinirse
talep kaydı `user_id` boşalarak KALIR: sürenin ve sonucun ispatı bizim yükümüzdür.

**`anonymize_user_personal_data(user_id, request_id, dry_run)`** — üç ayrı davranış:

| Veri | Davranış | Gerekçe |
|---|---|---|
| Adres defteri, fatura profilleri, sepet, projeler, sihirbaz kayıtları | **Silinir** | Saklama yükümlülüğü yok |
| Profil (ad, telefon), iletişim mesajları | **Anonimleştirilir** | Kayıt kalır, kişiyle bağı kopar |
| Sipariş/fatura — saklama süresi **dolmamış** | **ELLENMEZ** | VUK/TTK yükümlülüğü; KVKK m.7 istisnası |
| Sipariş/fatura — saklama süresi **dolmuş** | Kişisel alanlar anonimleştirilir; **tutar, tarih ve kalemler korunur** | Muhasebe gerçeği silinmez |

İki tasarım kararı ayrıca yazılıdır:

1. **Varsayılan kuru çalışmadır** (`dry_run = true`). Geri alınamaz bir işlemin yanlışlıkla
   tetiklenmesi, tetiklenmemesinden pahalıdır; çağıran niyetini açıkça belirtmelidir. Kuru
   çalışma gerçek çalışmayla **birebir aynı raporu** üretir — yoksa önizleme işe yaramaz.
2. **Kısmi ret bildirilir.** Saklanan kayıt varsa `retained_data_note` doldurulur ve veri
   sahibine gerekçesiyle yazılır. KVKK'da kısmi ret meşrudur; **sessiz kısmi ret değildir.**

> ⚠️ **Saklama süresi içindeki siparişin kişisel alanları anonimleştirilmez.** Bu, "silme
> talebini yerine getirmedik" demek değildir — kanunun saklamayı emrettiği veriyi silmek
> KVKK'ya uygunluk değil, başka bir ihlaldir. Sınırın tam yeri (faturanın hangi alanı
> belge, hangisi operasyonel veri) **muhasebeci/hukukçu şeridine** aittir; kod bu yüzden
> muhafazakâr davranır ve süre dolmadan sipariş kaydına dokunmaz.

### 3.5 Defterin yüzü — `/admin/data-requests` (T063, 2026-08-17)

Defter tablosu vardı ama **onu besleyen/gösteren arayüz yoktu**: talep kaydı elle SQL
gerektiriyordu ve süre hiçbir yerde görünmüyordu, yani §3.4'ün "süre ve sonuç ispat
yükü altındadır" şartı pratikte karşılanamıyordu. Kurulan ekranın bağlayıcı kuralları
(bekçi: `kvkk-request-ledger.test.ts` · INV-KVKK-1):

1. **Kanal e-postadır, form değil.** Talep `applicationEmail`/KEP'e ulaşır; admin onu
   deftere işler. §3.1'in ayrımı korunur: self-servis "hesabımı sil" düğmesi hukuki
   zorunluluk DEĞİL, ürün işidir — bu ekran onun yerine geçmez, onu **gerektirmez** de.
   ⚠️ Kanalın çalışması `legal.ts → applicationEmail` değerinin **gerçek ve izlenen** bir
   adres olmasına bağlıdır; değer yer tutucu kaldığı sürece 4/10 numaralı satırlar 🟡 kalır.
2. **Süre otoritesi DB'dir.** 30 günlük son tarihi `due_at` DB default'u koyar; UI ve
   servis bunu **yeniden hesaplamaz** (INV-KVKK-1 R2). Gerekçe: istemci saati ile sunucu
   saati ayrışırsa "30 gün içinde yanıtladık" ispatı çürür.
3. **Gecikme görünür olmak zorundadır.** Liste `due_at` artan sıralıdır; gecikmiş talep
   hata rengi + uyarı ikonuyla ayrışır. Süre terminal statüde (`completed`/`rejected`)
   DURUR — sonuçlanmış talep sonsuza dek "gecikmiş" görünmez.
4. **UI izni ⊆ DB izni.** RLS kapısı `is_admin_user()` yalnız `admin`/`super_admin` kabul
   eder; bu yüzden rota rbac'ta o iki role daraltıldı. Aksi hâlde moderator/viewer sayfayı
   açar, RLS satır vermez ve ekran "kayıt yok" der — *yetkisi yok* yerine *veri yok*
   yanılgısı (T062'de warehouse'ta yaşanan sessiz-boş sınıfı).
5. **Sonuçlandırma sessiz olamaz.** `completed`/`rejected` statüsüne geçiş `outcome`
   olmadan REDDEDİLİR (servis katmanında `throw`); saklanan veri varsa
   `retained_data_note` doldurulur (§3.4/2'nin UI karşılığı).
6. **Denetim izinde veri minimizasyonu.** `admin_audit_log` payload'ına başvuranın
   e-postası YAZILMAZ; talep türü, kimlik-tevsik durumu ve son tarih yeterlidir. Kişisel
   veriyi ikinci bir tabloya kopyalamak, KVKK talebini yönetirken KVKK ilkesini çiğnemek olurdu.
7. **Sözlük DB'den gelir.** `request_type`/`status` değerleri migration'daki CHECK
   kısıtının birebir kopyasıdır ve bekçi ikisini karşılaştırır: kodda fazladan değer
   seçilirse prod INSERT'i 400 döner, eksik değer varsa admin gerçek durumu göremez.

> **DÜZELTME (2026-08-19).** Bu bölüm önce *"kapsam dışı (bilinçli): müşteri-tarafı web
> başvuru formu"* diyor ve gerekçeyi iki katmanlı kuruyordu — (a) §3.1'e göre hukuki
> zorunluluk değil, (b) müşteri INSERT'i migration gerektirir, migration Recep kapısıdır.
> **(b) bir kapsam gerekçesi değildi:** işin *kimin onayıyla* gireceğini söylüyordu, *girip
> girmeyeceğini* değil. Bir onay kapısı, kapsam kararı gibi okunmuştu. (a) hâlâ geçerlidir —
> kanal hukuken zorunlu değildir; yine de kuruldu (T063 PR-2, #637) ve bağlayıcı kuralları
> **§3.6**'dadır. **Anonim (hesapsız) başvuru kapsam dışı kalmaya devam eder:** kimlik
> tevsiki §3.6'daki JWT eşitliğine dayanır, oturumu olmayanda böyle bir bağ yoktur; ayrı
> bir e-posta doğrulama akışı ister.

### 3.6 Veri sahibinin kendi kanalı — `/account/data-requests` (T063 PR-2, 2026-08-19)

§3.5 defterin **admin yüzüdür**; bu bölüm **veri sahibinin yüzüdür**. Giriş yapmış kullanıcı
kendi talebini açar ve 30 günlük sayacın nerede olduğunu görür. Kanal §3.1 anlamında hukuki
zorunluluk değildir; şeffaflık ve ispat kolaylığı için kurulmuştur — ve kurulduğu anda
§3.4'ün ispat yükü artık **iki taraftan** görünür hâle gelir.

Mekanizma: `p_dsr_owner_insert` + `p_dsr_owner_select`
(`supabase/migrations/20260817143000_dsr_customer_channel.sql`). Bekçi: INV-KVKK-1
**R6** (politikanın `with check` bloğunda yedi süreç alanının pinli olması + kimlik bağı
+ müşteriye UPDATE politikası yasağı; 10 sabotajla kanıtlı) · **R7** (kimlik tevsiki) ·
**R8** (müşteri yüzeyi defteri değiştirmez).

**Kapsam dışı:** anonim (hesapsız) başvuru — ayrıca e-posta doğrulama akışı ister; bugün
o kişi zorunlu kanalı (e-posta/KEP) kullanır ve admin deftere işler.

**1. İki ayrı kapı vardır ve ikisi de gereklidir.**

| Kapı | Ne yapar | Nerede |
|---|---|---|
| **Satır kapısı** | Kullanıcı yalnız KENDİ satırını görür/yazar | `using (user_id = auth.uid())` · `with check` içindeki kimlik koşulları |
| **Değer kapısı** | Süreç alanları istemci tarafından BELİRLENEMEZ | Aynı politikanın `with check` bloğu |

Değer kapısı yedi alanı DB default'una pinler: `status` · `due_at` · `outcome` ·
`completed_at` · `identity_verified_at` · `handled_by` · `retained_data_note`. Bu liste
keyfi değildir: **sürenin ve sonucun otoritesi DB'dir** (§3.5/2). Pin olmasaydı kullanıcı
kendi talebini `completed` olarak veya uzak bir `due_at` ile açıp 30 günlük yasal süreyi
kaydırabilirdi — yani cetvelin 4 ve 10 numaralı taahhütlerini kendi eliyle çürütebilirdi.

**2. Kimlik tevsiki DB'de zorlanır.** `applicant_email` JWT'deki e-postaya **eşit** olmak
zorundadır. Tebliğ m.5'in "sistemde kayıtlı e-posta" şartının teknik karşılığı budur;
kullanıcı başkasının adına talep açamaz. Buna karşılık `identity_verified_at` damgasını
kullanıcı **yazamaz**: oturum teknik bir doğrulamadır, kimlik tevsiki ise hukuki bir
değerlendirmedir ve admin'e aittir.

**3. UPDATE politikası bilinçli olarak YOKTUR.** Talep açıldıktan sonra veri sahibi onu
değiştiremez — ispat izi korunur. Geri çekmek isterse kanaldan bildirir, admin `rejected` +
`outcome` ile kapatır (§3.5/5). RLS'te politika yoksa işlem reddedilir; bu, "unutulmuş
kural" değil **yazılı bir karardır.**

**4. ⚠️ ÇÜRÜTÜLMÜŞ PREMİS — kolon-GRANT bir kapı DEĞİLDİR.** Bu kanalın ilk yazımı değer
kısıtını `grant insert (applicant_email, request_type, user_id)` ile kurmaya çalışıyordu.
Prod'da ölçüldü (2026-08-18): `authenticated` rolünün bu tabloda **zaten tablo düzeyinde**
INSERT/UPDATE/DELETE yetkisi var (Supabase'in varsayılan `grant all` davranışı) ve
PostgreSQL'de **kolon ayrıcalığı tablo ayrıcalığını daraltmaz, üzerine eklenir.** Yani
kolon grant'ı kâğıt üzerinde bir kapıydı, prod'da hiçbir şey kapatmıyordu.

Tablo grant'ını `revoke` etmek de çözüm değildir: admin de aynı `authenticated` rolünde
çalışır, yetkisini ayrı bir DB rolünden değil `p_dsr_admin_all` politikasından alır. Revoke,
§3.5'te canlıya alınan admin defterini kırardı. **Doğru yer politikanın kendisidir** — kısıt
politika bazlı olduğu için yalnız veri sahibinin yolunu bağlar, admin ayrı politikadan geçer.

> **Genel kural (bu vakadan çıkan):** PostgreSQL'de yazılabilir alan kümesini daraltmak
> isteyen bir tasarım, kısıtı **RLS `with check`** içine koyar. Kolon grant'ı yalnız bir
> **niyet beyanıdır**; tablo grant'ı durduğu sürece kapı değildir. Bir migration "şu alanlar
> yazılamaz" diyorsa, incelemede sorulacak soru şudur: *bunu hangi satır reddediyor?*

**5. Kanal, davranışı ölçülmeden "korumalı" sayılmaz.** Statik kanıt (SQL metni, grant
sorgusu, test sabotajı) burada **ayırt edici değildir**: `with check` hiç çalışmasa da aynı
görünürdü. Kapanış kanıtı, normal kullanıcı oturumuyla denenen ve **reddedilen** bir
INSERT'in ham DB hata satırıdır. Bu ölçüm prod'a yazmadan alınabilir — işlem içinde
`begin … rollback` ile; kabul edilen kol geri alınır, reddedilen kol zaten yazmaz.

**6. Ekranın canlı olması kanalın açık olduğunu göstermez.** UI yarısı master'a merge
edildiği anda dağıtılır; DB yarısı `supabase-migrate` iş akışına bağlıdır ve **ayrı hızda**
ilerler. Politikalar inmeden ekran görünür ama hem listeleme hem gönderme sessizce
reddedilir — *yetkisi yok* yerine *veri yok* yanılgısının ta kendisi (§3.5/4). Bu yüzden §1
sicilinde kanalın satırı, **iki yarı da ölçülene kadar** ✅ olmaz.

#### Kapanış kanıtı — 2026-08-19 (prod, sıfır yazma)

Migration prod'a indi (`_migration_ledger`: `20260817143000_dsr_customer_channel.sql`,
`applied_at 2026-08-19 08:50:10+00`) ve kanalın **davranışı** ölçüldü. Yöntem: dört kol,
her biri `begin … rollback` içinde, `set local role authenticated` + JWT claim'inde
`app_metadata.user_role = customer`.

| Kol | Deneme | Beklenen | Sonuç |
|---|---|---|---|
| A | Geçerli INSERT | Kabul | ✅ `status = received`, `due_at − received_at = 30 days` |
| B | `status = 'completed'` | Ret | `ERROR: 42501: new row violates row-level security policy for table "data_subject_requests"` |
| C | `due_at = now() + 3650 days` | Ret | Aynı 42501 satırı |
| D | Başkasının `user_id` + e-postası | Ret | Aynı 42501 satırı |

**Ayırt edicilik.** Salt ret gözlemi *kanalın kapalı olmasından* ayırt edilemezdi; **kabul
eden kol tam bu yüzden vardır.** Kabulün admin yolundan gelmediği iki ayrı yoldan gösterildi:
(1) aynı claim altında `is_admin_user()` **false** ölçüldü; (2) admin politikası devrede
olsaydı B/C/D de kabul edilirdi (`p_dsr_admin_all`'ın `with check`'i yalnız `is_admin_user()`,
değer kısıtı yok) — reddedildiler. Ölçüm sonrası prod satır sayısı **0**: artık yok.

---

## 4) Fatura verisi kalitesi

Fatura, siparişin `invoice_type` + `invoice_info` alanlarından kesilir. Bu alanlar bozuksa
fatura kesilemez — köprü döneminde bu, siparişin **kargolanamaması** demektir.

### 4.1 TCKN koşulsuz zorunlu DEĞİLDİR — eşiklidir

Bu bölüm 2026-08-16'da **düzeltildi.** İlk yazımı "bireysel faturada TCKN boş bırakılarak
ödeme adımına geçilemez" diyordu; mevzuat araştırması bunun **kanunun istediğinden sıkı**
olduğunu gösterdi. Kural, ölçülmeden yazılmış bir varsayımdı ve dönüşüm maliyeti üretiyordu.

GİB, nihai tüketici numarasını vermek istemediğinde alıcı kimlik alanına **`11111111111`**
yazılmasını kabul eder. Zorunluluk tutara bağlı olarak doğar:

| Fatura tutarı (KDV dahil) | Zorunlu olan |
|---|---|
| ≤ 500 TL | Ad bile yazılmayabilir — "NİHAİ TÜKETİCİ" ibaresi yeterli (515 SN VUK GT) |
| 500 TL – fatura düzenleme haddi | Ad-soyad + adres zorunlu; **TCKN zorunlu değil** |
| Haddin üzeri | Ad-soyad **ve TCKN zorunlu** (509 SN VUK GT, asgari bilgiler) |

**2026 fatura düzenleme haddi: 12.000 TL** (588 SN VUK GT, 31.12.2025 RG; 2025: 9.900 TL).

**Karıştırılmaması gereken ikinci eşik:** 2026'dan itibaren nihai tüketiciye e-arşiv
faturası **tutara bakılmaksızın** zorunludur. Yani "küçük satışta fatura kesmeyiz" diye bir
seçenek yoktur. Yukarıdaki eşik *fatura kesilir mi*nin değil, *alıcı kimliği zorunlu mu*nun
eşiğidir.

**Güven sınırı:** kademelerin varlığı ve `11111111111` uygulaması birden çok bağımsız
kaynakta aynıdır; **eşiğin o yılki tam değeri muhasebeci şeridine aittir** (§2.1). Bu yüzden
değer koda değil `legal.ts → invoiceIdentityThreshold` alanına yazılır — muhasebeci
düzelttiğinde tek satır değişir.

### 4.2 Kurallar

1. **Bireysel — eşikli.** TCKN, sipariş toplamı (KDV dahil) eşiği **aşıyorsa** zorunludur.
   Aşmıyorsa boş bırakılabilir; fatura `11111111111` ile kesilir.
2. **Bireysel — girilmişse geçerli olmalı.** Tutar ne olursa olsun: yanlış numara, boş
   numaradan kötüdür (fatura yanlış kişiye kesilir ve hata sessiz kalır).
3. **Kurumsal — eşikten bağımsız.** VKN + unvan + vergi dairesi her tutarda zorunludur;
   VKN'siz kurumsal fatura hiçbir tutarda kesilemez ve müşteri "kurumsal"ı bilerek seçmiştir.
   **Bireyseldeki gevşeme kurumsala sızmamalıdır.**
4. **Sağlama (checksum).** TCKN ve VKN kendi algoritmalarıyla doğrulanır. Uzunluk kontrolü
   yetmez: `11111111111` on bir hanedir ve eski kontrolden geçiyordu.
5. **Tutar bilinemiyorsa kimlik istenir.** Eşik kararı verilemeyen bir siparişte, eksik
   kimlikli fatura riskini almaktansa sorulur.
6. **Sunucu tarafı.** İstemci doğrulaması kolaylıktır, kapı değildir; aynı kurallar sipariş
   yazılmadan önce sunucuda da uygulanır.

### 4.3 ⚠️ Tuzak — `11111111111` iki farklı şey

`isValidTckn` bu değeri **reddeder** ve bu **müşteri girdisi için doğrudur**: numarayı
doğrudan kişiden istiyoruz, dolgu değerini kullanıcıya yazdırmıyoruz.

Ama aynı değer **GİB'in kendi dolgu değeridir.** Bu doğrulayıcıyı ileride *giden fatura
verisine* uygulayan biri, GİB'in kabul ettiği değeri reddetmiş olur ve fatura üretimi
sebepsiz durur. Fatura kesme yolu yazıldığında bu ayrım korunmalıdır:
**içeri gelen kullanıcı girdisi ≠ dışarı giden belge alanı.**

---

## 5) Bekçi — INV-LEGAL-3

Statik bir test "fatura kesiliyor mu" diye soramaz. Sorabileceği şey şudur: **metin bir
şey vaat ediyorsa, o vaadin dayandığı konfigürasyon gerçekten dolu mu.**

Kurallar:

1. **Yer tutucu yayına çıkamaz.** `legalConfig` içinde `[BUYUK_HARF]` biçiminde kalmış
   bir alan varken `legalReviewCompleted` **true** olamaz.
2. **Metinde geçen alan tanımlı olmalı.** Yasal metinlerde `legalConfig.X` biçiminde
   okunan her `X`, `LegalConfig` tipinde var olmalıdır (yoksa metin `undefined` render eder).
3. **Sicil güncel olmalı.** §1 tablosunda 🔴 durumundaki bir satır varken
   `legalReviewCompleted` true olamaz.
4. **Fatura süresi tutarlılığı.** Sözleşme metni fatura iletim süresinden bahsediyorsa,
   süre `legal.ts` alanından gelmelidir — metne gömülü sabit süre yazılamaz.

Bekçinin kendisi, eklendiği gün **bilerek bozularak** kırmızı görülür; geçmesi çalıştığını
kanıtlamaz.

---

## 6) Değişiklik kuralı

- Yasal metne **yeni bir taahhüt** eklenirse → §1 sicile satır eklenir, karşılığı yazılır.
- Bir mekanizma **kaldırılırsa** → sicildeki satır 🔴 olur ve metin aynı PR'da düzeltilir.
- Köprü prosedürü **bittiğinde** → biçim `Manuel` → `Kod`, durum 🟡 → ✅.
- Bu cetvel, hukukçu görüşünün yerine geçmez. Hukukçu metni değiştirirse **sicil de
  değişir** — metin ile mekanizma arasındaki bağ, metnin kimin yazdığından bağımsızdır.

---

## İlgili

- `docs/audits/operasyon-dongusu-denetimi-2026-08-15.md` §5-6 (kaynak ölçüm)
- `docs/standards/pricing-standard.md` (fatura kalemleri fiyat snapshot'larından okunur)
- `docs/standards/edge-function-security-standard.md` (iade uçları)
- İş emirleri: T055-VH (fatura) · T061-VH (KVKK ops) · T053-VH (gerçek iade)
- `supabase/migrations/20260817143000_dsr_customer_channel.sql` (§3.6 iki kapı; kolon-GRANT çürütmesi dosya başlığında ölçümüyle yazılı)


---
# FILE: docs\standards\measurement-discipline-standard.md

# Ölçüm Disiplini Standardı (Measurement Discipline)

Durum: **v1.1 TASLAK** (2026-08-19, OPS-AUDIT). Kaynak: 2026-08 boyunca yaşanmış ve
panoda/hafızada kanıtlı vakalar. Her kuralın yanında onu doğuran vaka adıyla durur —
kural, vakası unutulunca keyfî görünmesin diye. v1.1 = I18N itirazları: 4.1 vakası
sahibinin anlatımıyla düzeltildi, K5 sıra-kuralıyla genişledi, K7'ye şans-vakası,
yeni K13.

## 1. Amaç ve kapsam

Bu cetvel kod değil **hüküm kurma** davranışını bağlar: bir oturum "X oldu / X yok /
X çalışıyor" demeden önce hangi ölçüm yükümlülüklerini taşır. Tüm oturumlar (insan ve
ajan) için geçerlidir. Davranışsal INV kapısı üretmez; gözcü yazımı hariç (§4) insan
disiplinidir ve ihlali kod incelemesinde adıyla anılır.

## 2. Hüküm kurma kuralları

**K1 — Vekil değil, asıl şey ölçülür.** Kapı, vekilin (kurulum adımının çıkış kodu)
değil asıl yeteneğin sorusunu sormalı. *(Vaka: apt adımı DÜŞTÜĞÜ için iş kırmızı
yanıyordu, oysa asıl soru tarayıcının açılıp açılmadığıydı; kütüphaneler imajda
olsaydı testler pekâlâ koşacaktı — kapı yanlış şeyi soruyordu. #678 Chromium probu.
Aynı olayın ikinci, AYRI dersi — "önce kaldır, kaldıramıyorsan sınırla" — bu cetvelin
değil `ci-runner-install-standard.md` §2.6'nın maddesidir.)*

**K2 — Yokluk, kanıt değildir.** Boş sonuç iki şeyden biridir: iddia yanlış YA DA
sorgu yanlış yere bakıyor. İkisi ayırt edilmeden hüküm kurulmaz. *(Vakalar: "davlumbaz"
araması boş döndü — veri `product_families`'teydi; boş commit-status listesi "bekliyor"
sanıldı — status hiç postlanmamıştı; kapıların hiç başlamaması kırmızı sanılmadı —
merge ref üretilememişti: "eksik kapı kırmızı kapı değildir".)*

**K3 — Araç, ayırt ediciliğini kanıtlamalı; kimliği HİÇ kısaltma.** İki farklı
gerçek durum aynı çıktıyı veriyorsa o ölçüm kördür ve hüküm kuramaz; yeni ölçüm
aracı bilerek-bozulmuş girdiyle KIRMIZI gördüğü kanıtlanmadan güvenilir sayılmaz.
Ve körlük çoğu kez araçta değil ARGÜMANDADIR: kısaltılmış kimlik sessizce yanlış
cevap üretir — biri fazladan eşleşir, diğeri hiç eşleşmez. *(Vakalar:
`deployments?sha=` ucu KISA sha ile çağrılınca dağıtım VAR OLSA BİLE boş liste
döndürüyor, hata vermiyor; tam 40 karakterle üç ayrımın üçünü doğru yapıyor — aynı
sorgu, argümanın biçimine göre kör ya da ayırt edici. Kardeş vaka: panoda 8
karakterlik önek iki oturumla eşleşti, biri fantomdu.)*

**K4 — Eşik, ölçümüyle yazılır.** Zaman/adet eşiği ancak gözlenmiş dağılım cetvele
yazılarak konur; "makul görünen" sayı yasak. Eşiğin kaynağı yazılmazsa sonraki kişi
onu keyfî sanıp oynatır. *(Vaka: dağıtım-kaydı gecikmesi 3 sn – 6 dk 49 sn ölçüldü;
10 dk eşiği = gözlenen en kötünün ~1,5 katı diye yazıldı. Karşıt vaka: kemer
aritmetiği — 3 deneme × 5 dk iç bekleme, 12 dk dış kemerin içine sığmıyordu.)*

**K5 — Platform metinleri model değildir; hüküm ölçümün SIRASIYLA kurulur.**
"Retry in 24 hours" gibi platform mesajları hüküm kaynağı olamaz; sıfırlanma/açılma
ancak ölçümle bilinir. Ve sıra belirleyicidir: reddin ÖNCESİNDEKİ başarı hiçbir şey
kanıtlamaz — "açıldı" hükmü yalnız reddin SONRASINDAKİ başarıyla kurulur. Ayrıca
"redden sonra başarı var" cümlesi yalnızca "filo çapında dondurma haksız" demektir;
"benim gönderimim geçer" DEMEZ — ikisi ayrılmazsa prob yeşil-ışık sanılır, peş peşe
gönderim sınırı yeniden doldurur. *(Vakalar: aynı metin daha önce ertesi sabah erken
açılmayla çürüdü; 10:14:11 success → 10:14:22 rate-limit → 10:17:57 success — 11
saniyelik kesintililik, bugüne kadarki en dar örnek.)*

**K6 — Çıkış kodu haberdir, sonuç değildir.** Bir komutun hatası, işlemin
olmadığının kanıtı değildir; retry etmeden önce hedef durumun kendisi ölçülür.
*(Vaka: `gh pr merge` hata döndürdü ama merge OLMUŞTU — retry ikinci merge olurdu.)*

**K7 — Kritik hüküm iki bağımsız kaynak ister.** Geri alınamaz işlem ya da
filo-genelini bağlayan ilan, tek sorguya dayandırılmaz. Doğru hüküm yanlış kaynaktan
gelirse yine ŞANSTIR — kurtaran şey ikinci bağımsız kaynakla örtüşmedir. *(Vakalar:
f8649378 yokluğu Vercel listesi + ayırt-edici canlılık gözlemiyle kanıtlandı — zayıf
kolu, kısa-sha argümanıyla yapılan GitHub sorgusuydu; #683 ön-koşulü kör biçimde
ölçüldü, hüküm doğru çıktı ama kanıtı ADMIN'in bağımsız READY satırı kurtardı;
#685'in preview kaydını Vercel listesi GÖSTERMEDİ, GitHub deployments gösterdi —
iki otorite aynı olaya farklı cevap verdi: dağıtım-varlığı sorusunda tek kaynak
yetmez.)*

**K8 — Ölçüm bayatlar; kurala dönüşen ölçümün bayatlığı görünmez olur.** Hükümle
eylem arasına başka olay girdiyse (master hareket etti, dosya değişti) ölçüm
tekrarlanır; "az önce bakmıştım" hüküm değildir. Tek gözlemden çıkarılıp KURAL diye
yayılan ölçüm en tehlikelisidir — kural bayatladığında kimse ölçüm olduğunu
hatırlamaz. *(Vakalar: #679 merge'inden önce master iki kez ilerlemişti, PRICING
baştan ölçtü; "preview'lar çalışıyor" cümlesi 10:18'de doğruydu, 10:21'de değildi —
kota HAT'a değil ZAMANA göre davranıyordu, kural diye yayılınca bayatlığı
görünmezleşti.)*

**K9 — Ata-sorusu: doğrusal tarihçede içerme, eşitlik değil.** "Benim değişikliğim
canlıda mı" sorusu, canlı kaydın sha'sının benimkine EŞİT olmasıyla değil, canlı
kaydın benim commit'imi İÇERMESİYLE ölçülür — eşitlik testi hızlı kuyruklarda yanlış
negatif verir. *(Vaka: dört merge dört dakikada indi; sonraki merge'in başarılı
dağıtımı öncekilerin içeriğini taşıdı.)*

**K13 — Varlık ölçümü, kullanım ölçümü değildir.** "X yazıldı mı" ile "X çağrılıyor
mu" iki ayrı sorudur; ilkine yeşil cevap ikincisini gizler. K1'in kardeşi ama ayrı:
K1 yanlış ŞEYİ ölçmeyi, K13 doğru şeyin YARISINI ölçmeyi anlatır. *(Vaka: T098
çözücüsü yazıldı, testleri yeşildi, ama hiçbir yerden ÇAĞRILMIYORDU — vitrin hiç
değişmedi ve hiçbir kapı görmedi; düzeltmede kapıya çağrı-yeri bloğu eklendi.)*

**K10 — Aynı belirti ≠ aynı mekanizma.** Bir belirtinin ("SUCCESS satırı yok") birden
fazla mekanizması olabilir ve tepkileri farklıdır; mekanizma ayırt edilmeden reçete
yazılmaz. *(Vakalar: dağıtım hiç-yaratılmadı → tazele; INACTIVE'e geçildi → içerik
zaten canlı, hiçbir şey yapma; kota reddi GÜRÜLTÜLÜ (commit status'a failure yazar),
atlanma SESSİZ (hiçbir status doğmaz) — aynı "dağıtım yok" belirtisi, üç mekanizma.)*

## 3. Bildirim ve kapsam kuralları

**K11 — Sınır adıyla yazılır.** Ölçülemeyen şey "ölçülemedi" diye, kapsam dışı kalan
yüzey adıyla rapora girer; "temiz" hükmü yalnız ölçülen kapsam için kurulur.
*(Vaka: T111 raporu "canlı veriyle ölçemedim, prod'da 0 iade var" sınırını başa koydu.)*

**K12 — Bir sınıf bir yerde onarılınca, bildiren taraf kendi yüzeyinde arar.**
Kusuru bildirmek muafiyet değildir. *(Vaka: apt-asılması iki kez bildirildi; aynı
sınırsız-timeout riski bildirenin kendi işlerinde duruyordu.)*

## 4. Gözcü yazım şartları (bağlayıcı üçlü)

Her izleme/gözcü mekanizması üç şartı taşır:

1. **Ön-koşulunu doğrular:** veri kaynağı boş/ulaşılamaz dönerse "boşluk yok" değil
   KIRMIZI der. *(Vakalar: jq yokken 1 saat sessiz izleyici; damga-eşikli izleyici —
   "son gördüğüm damgadan büyüğü bas" mantığı, saati GERİYE yazılmış olayı KALICI
   olarak kaçırır; çözüm görülen-kimlik kümesidir.)*
2. **İptal ≠ boşluk:** kaydın varlığı ile sonucu ayrı ölçülür; bilinçli iptal
   (örn. Ignored Build Step) boşluk sayılmaz.
3. **Sessizliği kendisi bozar:** beklenen olay tanımlı sürede gelmezse gözcü sussuz
   kalmaz, "hâlâ yok" bildirir; ve yazıldığı gün bilerek-boz ile KIRMIZI görebildiği
   kanıtlanır. *(Vaka: kayıt hiç doğmazsa sonsuza dek susacak üretim gözcüsü, sahibi
   tarafından yakalanıp düzeltildi.)*

## 5. İlişkili cetveller

`commerce-domain-map-standard.md` (kavram otoriteleri) · `ci-runner-install-standard.md`
(K1/K4 vakalarının CI tarafı) · `deploy-build-skip-standard.md` (iptal ≠ boşluk).


---
# FILE: docs\standards\migration-safety-standard.md

# Migration Güvenlik Standardı — Yıkıcı Şema Değişiklikleri (DROP/RENAME/TYPE)

> **Doğuş sebebi (2026-08-13, F5-B D4 / ultrareview #480):** 8 legacy kolonun DROP'u
> öncesi kod tarafı tam taranmıştı (tip-Omit zorlayıcı, tsc 0) ama iki arama RPC'sinin
> plpgsql gövdesi `p.description` referanslıyordu ve iyzico-payment edge function'ı
> `select=...,image_url` çekiyordu. İkisini de hiçbir mevcut kapı göremedi; bağımsız
> inceleme (ultrareview) merge'den saatler önce yakaladı. Bu cetvel o iki kör noktayı
> **yapısal** olarak kapatır: guard'lar apply anında çalışır, insan disiplinine dayanmaz.

## Neden mevcut kapılar yetmez (iki fiziksel gerçek)

1. **Postgres, plpgsql gövdelerini kolon-bağımlılığı olarak İZLEMEZ.** `LANGUAGE sql`
   fonksiyonlar ve view'lar DROP'u bloklar; plpgsql gövdesi ise opak metindir —
   `ALTER TABLE ... DROP COLUMN` **sessizce geçer**, fonksiyon ilk çağrıda
   `column ... does not exist` ile patlar.
2. **PostgREST, select listesindeki tek bilinmeyen kolonda TÜM sorguyu 400'ler.**
   Edge function'lardaki `?select=a,b,c` string'i tsc için opaktır; çağıran taraf
   çoğu zaman `if (res.ok)` ile sessizce boş veriye düşer.

## KURAL: Yıkıcı migration = Preflight (4 süpürme) + Guard şablonu

### Preflight — migration YAZILMADAN önce (LLM/geliştirici cetveli)

| # | Süpürme | Araç | Ne arar |
|---|---------|------|---------|
| 1 | **TS kaynak** | tip-Omit zorlayıcı (`db-rows.ts`'te `Omit<Row, DroppedCols>`) + `pnpm type-check` | Kolonun tüm TS okuyucuları derlenemez olur — kalan çağıran varsa tsc gösterir |
| 2 | **DB-içi kod** | canlı SQL (aşağıdaki sorgu) — ikiz/doküman DEĞİL, `pg_proc` gerçeği | Fonksiyon gövdeleri + view'lar + trigger fonksiyonlarında referans |
| 3 | **Edge function'lar** | `INV-8` conformance testi (`edge-select-columns.test.ts`) + elle grep | REST `select=` ve `.select('...')` string'lerinde kolon adı |
| 4 | **Veri** | apply-anı guard (şablonda) | Silinecek kolonlarda korunması gereken veri kalmadığının kanıtı |

**Süpürme 2 sorgusu** (kolon adlarını düzenleyip Supabase'de çalıştır):

```sql
select p.proname, l.lanname
from pg_proc p
join pg_language l on l.oid = p.prolang
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosrc ~* '\m(KOLON1|KOLON2)\M';
-- + view'lar:
select viewname from pg_views
where schemaname = 'public' and definition ~* '\m(KOLON1|KOLON2)\M';
```

> Metinsel eşleşme başka tablonun aynı adlı kolonunda yanlış-pozitif verebilir —
> listeyi gözden geçir; yanlış-pozitif, sessiz kırılmadan DAİMA iyidir. Bulunan her
> fonksiyon, **aynı migration içinde DROP'tan ÖNCE** `create or replace` ile
> yeni şemaya geçirilir (örnek: `20260812_f5b_d4_drop_legacy_columns.sql` §1b).

### Guard şablonu — migration'ın İÇİNE (apply anında kendini doğrular)

```sql
begin;

-- A) Ön-guard: veri gerçekten taşınmış/boş mu? (sayıya döküp raise et)
do $$
declare v_bad int;
begin
  select count(*) into v_bad from public.TABLO
   where KOLON is not null; -- projeye göre daralt
  if v_bad <> 0 then
    raise exception 'DROP iptal: % satirda korunmasi gereken veri var', v_bad;
  end if;
end $$;

-- B) Ön-guard: DB-içi kod hâlâ referanslıyor mu? (plpgsql sessiz-DROP kilidi)
do $$
declare v_refs text;
begin
  select string_agg(p.proname, ', ') into v_refs
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prosrc ~* '\m(KOLON1|KOLON2)\M';
  if v_refs is not null then
    raise exception 'DROP iptal: fonksiyon govdeleri hala referansliyor: %', v_refs;
  end if;
end $$;

-- C) (Gerekliyse) bağımlı fonksiyonları yeni şemaya geçir: create or replace ...

-- D) Yıkıcı değişiklik: alter table ... drop column ...

-- E) Son-guard: kritik RPC'leri GERÇEKTEN ÇAĞIR (varlık kontrolü yetmez —
--    plpgsql kolonları çağrı anında çözer, sessiz kırığı yalnız çağrı yakalar)
do $$
declare v int;
begin
  select count(*) into v from public.KRITIK_RPC('ornek', 5, 0, null);
  if v < 1 then raise exception 'KRITIK_RPC bozuk: % sonuc', v; end if;
end $$;

commit;
```

## KURAL: her migration ATOMİK uygulanır (INV-MIGRATION-1)

Yıkıcılıktan bağımsız, **her** migration için geçerli. Yarım uygulanmış bir migration,
yanlış uygulanmış bir migration'dan daha kötüdür: DB tutarsız kalır, ledger'a yazılmaz ve
bir sonraki koşu **baştan dener** — yani yarım uygulama ikinci kez yaşanır.

Çalıştırıcı (`supabase-migrate.yml`) iki biçim tanır, üçüncüsü yoktur:

| Biçim | Dosyada | Çalıştırıcı ne yapar |
|---|---|---|
| **(a) kendi işlemini yönetir** | `BEGIN;` … `COMMIT;` | olduğu gibi koşar (`psql -f`) |
| **(b) işlem denetimi yok** | ne `BEGIN` ne `COMMIT` | `psql --single-transaction` ile **sarar** |

**Biçim (a) niçin körü körüne sarılmaz:** bazı ifadeler bir transaction bloğunun içinde
**çalışamaz** — `CREATE INDEX CONCURRENTLY`, `DROP INDEX CONCURRENTLY`, `VACUUM`,
`ALTER SYSTEM`. Yazar bunları bilinçli olarak `COMMIT;`'ten **sonra** bırakır.
Kanonik örnek: `20260402000000_security_and_performance_hardening.sql`
(`BEGIN@7` … `COMMIT@95`, ardından `CREATE INDEX CONCURRENTLY@103-112`).

**Bekçi:** `src/__tests__/conformance/migration-atomicity.test.ts` üç şeyi PR anında
denetler — (1) `BEGIN`/`COMMIT` sayıları dengeli, (2) işlem-dışı ifade `BEGIN…COMMIT`
**arasında** değil, (3) işlem-dışı ifade taşıyan dosya `BEGIN/COMMIT`'siz **değil**
(öyleyse çalıştırıcı sarar ve PostgreSQL reddeder).

> Niçin PR anında: bu hata sınıfı yerelde **görünmez**. `tsc`/`lint`/`deno check` SQL
> metnini yorumlamaz. Tek diğer görülme anı prod deploy'udur ve orada iş işten geçmiştir
> (CLAUDE.md kural 13: merge = prod'a otomatik apply). Bekçi üç ihlal tipi de **bilerek
> yaratılarak** kanıtlandı; üçü de FAIL verdi, dosyalar silindi.

## Kapsam ve sınırlar

- Bu cetvel **yıkıcı** değişiklikler içindir: `DROP COLUMN/TABLE/FUNCTION`,
  `RENAME`, kolon tipi daraltma. Salt-ekleyici (ADDITIVE) migration'lar için
  guard B/E zorunlu değildir (A tavsiye edilir).
- Migration merge = prod'a otomatik apply (CLAUDE.md §13) — guard'ların değeri tam
  da budur: kırmızı durursa DROP hiç çalışmaz, prod bozulmadan workflow FAIL verir.
- İlgili kalıcı bekçiler: `INV-MIGRATION-1` (işlem sınırı, yukarıda) · `INV-8 edge-select-columns` (şema↔edge sınırı) ·
  `pr-size-check` büyük-dosya guard'ı (çalışma-ağacı hijyeni).


---
# FILE: docs\standards\mockup-gelisim-hatti-standardi.md

# Mockup Geliştirme Hattı Standardı

**Sahip:** OPS-AUDIT · **Kaynak karar:** Recep, 2026-08-25 ("bir geliştirme hattı lazım bize:
ne vardı, ne eklendi, ne konulmadı — hem süreci takip ederiz hem canlı için formatı belirlemiş oluruz")
**Doğuran kusur (ölçüldü):** v3'te ses/varyant/teknik-tablo sessizce düştü; v4'te Lineo ürün
kimliği uydurma "VH KF" adlarıyla değişti ve sepete-ekle düğmesi durumla etiket değiştirdiği
için "kaldırılmış" algısı yarattı. Üçü de aynı sınıf: **sürümler arası sessiz kayıp.**

## 1. Sürüm Defteri (zorunlu)

Her mockup yayını bir sürüm defteri satırı taşır: **özellik envanteri** biçiminde
`ÖZELLİK → YENİ / VAR / DEĞİŞTİ(gerekçe) / DÜŞTÜ(gerekçe + onay)`.

- Defter iki yerde yaşar: (a) mockup sayfasının altında görünür blok (Recep süreci sayfadan
  izler), (b) ilgili Linear kaydında (kalıcı iz).
- **Hiçbir özellik sessizce düşmez.** Düşürme ancak gerekçe + Recep onayı ile olur; "yalın
  konsept kanıtı" gibi amaç daraltmaları bile defterde "DÜŞTÜ (bilinçli, geri gelecek)" satırı ister.
- Yeni sürüm çizilirken önceki sürümün envanteri **ölçülerek** (dosyadan grep/inceleme,
  hatırdan DEĞİL) devralınır — kayıp iddiası da, tamlık iddiası da ölçümle yapılır.

## 2. Yayın öncesi kapılar (her sürümde)

1. **Syntax:** betikler `new Function` ile derlenir (akıllı-tırnak sınıfı ölümleri yakalar).
2. **Referans bütünlüğü:** her `getElementById` kimliği sayfada mevcut olmalı.
3. **Tema:** üç durum (açık / koyu / sistem) token düzeyinde tanımlı.
4. **Gerçek ürün kimliği:** model adları katalogdan (ör. Vortice Lineo Q); uydurma model adı
   YASAK. Değerler katalogtan değilse rozette açıkça "temsilî" yazar.
5. **Standart rozeti:** her hesap bloğu dayandığı standardı gösterir (EN 16798-1, ISO 5801,
   ISO 27327-1...); kaynağı olmayan sabit ekranda görünmez.
6. **Kalıcı eylemler sabit görünür:** sepete ekle / teklife çevir gibi ana eylemler durumla
   ETİKET değiştirmez; kilitli durum ipucu metni + görsel kilitle anlatılır.

## 3. Süreç döngüsü

fikir → taslak → **Recep turu** → geri bildirim envantere işlenir → v+1.
Recep'in her geri bildirim kalemi ya uygulanır ya da gerekçeli "yapılmadı" satırı alır —
açık uçlu kalem bırakılmaz (her girdiye kapanış).

## 4. Canlıya geçiş

Onaylanan son sürümün envanteri = canlı sayfanın **kabul listesi** (format sözleşmesi).
Canlı uygulama PR'ı bu listeyi referans verir; listedeki her özellik ya canlıda vardır ya da
gerekçeli sapma satırı taşır. Böylece mockup hattı, tasarımdan canlıya ölçülebilir tek çizgidir.

## Ek: v1→v5 envanteri (ilk uygulama, 2026-08-25 ölçümü)

| Sürüm | Yeni | Düşen/Kusur |
|---|---|---|
| v1 Konuşan Ürün Sayfası | Lineo Q kimliği, oda yeterlilik hesabı, varyantlar, teknik özellikler | — |
| v2 Canlı Ürün Sayfası | mekan kartları, ihtiyaç çizgisi, devir/fan kanunları, hüküm kutusu, ses dinleme | — |
| v3 Tek Şablon | kompakt grup seçici, iki giriş yolu, standart rozetleri, hükümlü sepet, kapı modülü | DÜŞTÜ (kusur): ses, varyant, teknik tablo |
| v4 | ses A/B, varyant, teknik tablo geri; kişi başı taze hava; perde pro derinliği | KUSUR: Lineo→"VH KF" kimlik kaybı; sepete-ekle etiketi durumla değişti |
| v5 | Lineo kimliği geri; ana eylemler sabit; sürüm defteri sayfada | — |


---
# FILE: docs\standards\multi-session-coordination-standard.md

# Çok-Oturumlu Koordinasyon Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** Birden çok Claude Code controller oturumu aynı repoda paralel
> çalışırken **kimin ne yaptığını bilen, akışı bozmayan** bağlantı modelinin cetveli.
>
> **Neden var?** 2026-08-14'te aynı gün üç ayrı durum kaydı bayatladı: şerit panosu
> (1 gün), Orion registry (18 iş emri / **0 tamamlanan**, oysa 7 PR + 4 prod migration
> sevk edilmişti), ~270 companion `.md`. Ortak kök: **hatırlamaya bağlı adım.** Ayrıca
> eş-controller'ın ne yaptığını öğrenmenin tek yolu `git status` çekmekti ve aramızdaki
> mesajları Recep taşıyordu — insan mesaj-otobüsü, akışın kırıldığı yer.

---

## 1. İki ayrı ihtiyaç, iki ayrı depo (karıştırma)

| İhtiyaç | Depo | Ömür | Neden ayrı |
|---|---|---|---|
| **Anlık koordinasyon** — "şu an kim neye dokunuyor?" | `C:/tmp/venthub-board/events.<sid>.jsonl` | TTL'li (4sa), süpürülebilir | Anlık olmalı; git'e yazılan kayıt commit/push/pull'a bağlıdır = **merge zamanlı**, aynı saatteki çakışmayı yapısal olarak göremez |
| **Kalıcı iş durumu** — "T001-VH nerede?" | Orion registry (`~/.orion/registry.db`) | Kalıcı | Yeni bir oturum açıldığında ne yapacağını buradan öğrenir; pano TTL'li olduğu için bu soruyu cevaplayamaz |

**Karıştırmanın bedeli:** panoyu kalıcı durum deposu yaparsan şişer ve bayatlar; kalıcı
durumu anlık kanal yaparsan geç kalır. `docs/DURUM-TAKIP.md` üçüncü bir şeydir: **anlatı/tarih**
(bkz. `work-tracking-ssot-standard.md`).

## 2. Katmanlar

**K0 · Git — sert güvenlik (dokunulmaz).** Dal-başına-iş + PR. Üstteki her şey *tavsiye*
niteliğindedir; master'ın sessizce bozulmasını engelleyen tek şey git'tir.

**K1 · Kira (lease), kilit DEĞİL.** Oturum bir şeridi talep eder; talep **kalp atışıyla**
tazelenir ve TTL dolunca kendiliğinden düşer. Kilit olsaydı ölü bir oturum (compact, çökme,
pencere kapatma) şeridi sonsuza dek bloke ederdi. Ajan oturumları ölür — model bunu varsayar.

**K2 · Yol rezervasyonu.** Çakışma iş emrinde değil **dosyada** olur. Talep bir glob kümesi
taşır. Aynı yolu iki oturum talep ederse **en erken timestamp kazanır**: kıdemli oturum
yazmaya devam eder, **geç gelen** bloklanır. Bu simetrik değildir ve olmamalıdır — "her
çakışanı blokla" demek iki oturumu birden durdurmak, yani katmanın kendisini kesinti
kaynağına çevirmektir.

**Şeritler DAR talep edilir.** `src/**` gibi kök-geniş glob, aynı ağacın ilgisiz bir
köşesinde çalışan oturumu da bloklar (yanlış-pozitif). Doğrusu dokunduğun alt ağaçlar:
`src/lib/services/pricing*` · `src/views/admin/*Pricing*`. Kök-geniş glob yalnız gerçekten
tüm ağacı yeniden yazan bir göç için meşrudur ve o zaman da geçicidir.

**Genişletme birleştirir, daraltma `release` ister.** İkinci bir `claim` globları **birleştirir**
ve ilk talebin kıdemini korur; eskisini sessizce bırakmaz. Şeridi daraltmak/devretmek için
önce `release`.

**Worktree'ler ayrı değildir.** Yol repo köküne göre çözülür (`git rev-parse --show-toplevel`,
`cwd` değil — bu oturumlarda birden çok çalışma dizini var ve `EnterWorktree` cwd'yi
değiştirir). Bu bilinçlidir: aynı **dosyayı** iki dalda düzenlemek gelecekteki merge
çakışmasıdır, katmanın görevi tam olarak onu erken göstermektir.

**K3 · Olay günlüğü (append-only).** Kimse kimsenin satırını düzenlemez → çakışması tanım
gereği imkânsız. Her oturum **yalnız kendi dosyasına** yazar (`events.<sid>.jsonl`), okuma
hepsinin birleşimidir; böylece eşzamanlı append'in satır karıştırma riski de yoktur.

## 3. Yazma anı zorunlu ritüele bağlanır (hatırlama yok)

| An | Ne olur | Neden hatırlanmaya gerek yok |
|---|---|---|
| Oturum açılışı | `SessionStart` kancası kimliği + şeridi + pano özetini **bağlama enjekte eder** | Ajan zaten "neredeyiz" diye bakmak zorunda; kimliğini tahmin etmez, **okur** |
| Her kullanıcı turu | `UserPromptSubmit` kancası **sessiz** brifing basar (yalnız söyleyecek şey varsa) **ve kirayı yeniler** | Bağlamı kirletmeden farkındalık; Recep mesaj taşımaz. Kalp atışını elle beklemek, bu cetvelin teşhis ettiği "hatırlamaya bağlı adım"ı katmanın merkezine geri koyardı |
| **Her yazmada** | `PreToolUse` kancası **kirayı yeniler** | Atış yalnız kullanıcı turuna bağlıyken, uzun **otonom** çalışmada hiç atış olmaz ve oturum KENDİ şeridini kaybeder. Ölçüldü: 5 saatlik bir koşuda üç oturumun **üçü de** düştü. Yazıyorsan yaşıyorsundur |
| Oturum kapanışı | `SessionEnd` kancası şeridi **bırakır** | TTL (4sa) yalnız çökme/kapatma için emniyet ağıdır; düzgün kapanışta sıradaki oturum beklemez |
| Yazmadan önce | `PreToolUse` kancası başka oturumun şeridine yazmayı **reddeder** | Talimat değil **yapı** — protokolü unutmak mümkün değil |
| PR merge | `post-merge` kancası commit künyelerinden registry'yi günceller | Kanca zaten doc üretimi için koşuyor |

**Künye sözleşmesi** — commit gövdesine tek satır:

```
Work-Order: T001-VH progress=70
Work-Order: T011-VH status=completed
```

`status` ∈ `backlog · open · active · blocked · completed`. Değerler mutlaktır (artırılmaz),
senkron **idempotent**tir: aynı commit iki kez işlense sonuç aynıdır.

## 4. Bilinçli tasarım kararları

**Fail-OPEN (bilinçli sapma).** VentHub kuralı "yeni kapıya geçiş modu koyma" der; o kural
**güvenlik** kapıları içindir. Bu bir **koordinasyon** kapısı: pano okunamazsa fail-closed
olmak üç oturumu birden durdurur — kendi kendine kesinti. Pano bozulduğunda yazma serbest
kalır, son emniyet git'tir. **Sessiz değildir:** okunamayan dizin, açılamayan dosya ve
**bozuk satır** ayrı ayrı `stderr`'e düşer — tek bozuk satır bir şeridin korumasını
düşürebilir, sessizce yutulmaz.

**Kilit değil kalite ağı.** Ajan `Bash` ile kapıyı aşabilir, kullanıcı dosyayı elle
düzenleyebilir. Amaç kazara çakışmayı **yazım anında** yüzeye çıkarmak.

**Oturum kimliği uydurulmaz.** Claude Code kalıcı bir UUID verir ve kancaya `stdin` ile
geçirir. Compact'ten sağ çıkar (bağlam sıfırlansa da `SessionStart` yeniden koşar).

**Alt-ajanlar ebeveynin kimliğiyle koşar (ÖLÇÜLDÜ).** `PreToolUse` girdisinde alt-ajanın
`session_id`'si ebeveynininkiyle **aynıdır**; ayrıca `agent_id` + `agent_type` gelir. Yani
alt-ajan, kendisini başlatan oturumun şerit haklarını olduğu gibi devralır. Bundan çıkan iki
sonuç: (1) "alt-ajanlar bloklanıyor" gözlemi **kimlik sorunu değildir** — gerçekten yabancı bir
şerit vardır (ya da kira TTL'den düşmüştür); (2) bir alt-ajan yabancı şeride yazmak zorunda
kalırsa doğru çıkış **yazmak değil raporlamaktır**: içeriği raporunda döndürür, ebeveyn kendi
kapısından geçirip yazar. `Bash` ile kapıyı aşmak yasak ([[worker-direct-push-incident]] deseni).

**Şerit ADI etikettir, talep OTURUM başınadır.** Aynı adı iki oturum kullanabilir (ör. oturum
yeniden başlatıldığında eskisi TTL dolana dek görünür). Pano bunu birleştirmez, **çakışma olarak
işaretler** — çünkü aynı adı taşıyan iki canlı talep birbirini bloklayabilir.

### 4.1 Not adresleme (INV-BOARD-2)

**KARAR: `--to <şerit>` gönderim anında o şeridi tutan OTURUMA çözülür, role değil; çözülmüş sid
kalıcı yazılır.** Bugünkü modelde şerit = oturum olduğu için bu doğrudur; rol-tabanlı teslim
istenirse değişecek yer bu cümledir, kod değil.

Sonuçları:
- **Hedef gönderimde doğrulanır.** Ne oturum ne şerit olan bir hedef **yazılmaz**, komut `exit 1`
  verir ve geçerli hedefleri listeler. Teslim edilemez bir notu "bırakıldı" diye bildirmek
  fail-open'dır ve en pahalı biçimidir: gönderen işini bitmiş sayar.
- **Kısaltma serbesttir** (`--to <8-hane>`), tam sid'e çözülür; belirsizse `exit 1`.
- **`herkes`/`hepsi`/`tümü`/`all`/`everyone`/`*` = broadcast.** Bunlar hedef DEĞİL, "hedef yok"
  demenin insan biçimidir.
- **Şerit adı değişse veya bırakılsa da not teslim edilebilir kalır** — çünkü diske sid yazılmıştır.

> **Niçin bu kadar ayrıntı:** 2026-08-16'da ölçüldü — **110 notun 49'u (%45) hiç teslim edilmedi**
> (`herkes` 37 · `ALL` 1 · 8-hane kısaltma 10 · geçersiz ad 1) ve komut her seferinde
> "not bırakıldı" bastı. Kaybolanların arasında üç şeridi birden bloklayan bir bulgu vardı.
> Aynı gün üç şerit adı da değişti (`PRICING`→`PRICING-STOK`, `EDGE`→`EDGE-REFUND`,
> `ADMIN-UX`→`ADMIN-OPS`), yani okuma anında ada bakan eski çözüm ikinci kez kırılacaktı.
> İş emri `T064-VH`; bekçi `src/__tests__/conformance/board-invariants.test.ts` (INV-BOARD-2).
> **Geriye dönük teslim YOK:** eski notlar katı filtreden geçmeye devam eder, sahipleri yeniden
> gönderir — append-only günlük geriye dönük yeniden yorumlanmaz.

## 5. Kullanım

```bash
node scripts/board/board.cjs claim --sid <oturum> --lane PRICING --globs "src/**,docs/standards/pricing-*.md"
node scripts/board/board.cjs who --sid <oturum>
node scripts/board/board.cjs note --sid <oturum> --to EDGE "views/ bana lazım, INV-9 alma"
node scripts/board/board.cjs release --sid <oturum>
node scripts/board/registry-sync.cjs --dry            # künyeleri raporla, yazma
```

## 6. Bilinen sınırlar (dürüstçe)

- **Tek makine varsayar.** Bir oturum bulutta koşarsa taşıma katmanı değişmeli (o durumda
  registry sqlite doğru yer olur).
- **Anlamsal çakışmayı görmez.** İki şerit farklı dosyalarda aynı kavramı bozarsa pano susar;
  onu conformance testleri yakalar (INV-*).
- **Kiralamaya ZORLAYAMAZ.** Kiralamadan çalışan oturum görünmez kalır — ama `SessionStart`
  ona şeridinin talep edilmediğini söyler. Kaçış yolu var, sessiz değil.
- **Git son hakem.** Pano çakışmayı önler, doğruluğu garanti etmez.
- **`post-merge` kancası repoda DEĞİL** (`.git/hooks/` versiyonlanmaz). Aynı makinedeki
  worktree'ler `.git/hooks`'u paylaştığı için üç oturum da kapsanır; ama **yeni bir klonda
  ya da ikinci bir makinede registry senkronu hiç çalışmaz** — kancayı elle bağlamak gerekir.
- **Glob granülerliği anlamsal değil.** Aynı glob'a giren ama birbiriyle ilgisiz dosyalar da
  bloklanır; çözüm dar şerit talep etmektir (§K2), kodun akıllanması değil.
- **Notlar en fazla 5 ve bir kez teslim edilir** (`seen` işareti). Kalıcı iletişim kanalı
  değildir; kalıcı olması gereken şey PR gövdesine ya da dokümana yazılır.
- **Pano kendini budar:** 24 saatten eski oturum dosyaları hiç okunmaz (maliyet sınırı).
  Silmek gerekirse `C:/tmp/venthub-board/` elle süpürülebilir.

---

> v1.0 · 2026-08-14 · İki controller tasarımının birleşimi. Eş-controller'dan gelen üç fikir
> aynen alındı: `SessionStart` ile kimlik enjeksiyonu · `PreToolUse` ile **yazmadan önce**
> engelleme (commit anında değil) · her turda kısa brifing. Bu oturumdan eklenenler:
> anlık/kalıcı depo ayrımı · oturum-başına ayrı dosya (append çekişmesi yok) · brifingin
> sessizlik kuralı · künye + `post-merge` ile registry'nin kendi kendine güncellenmesi.


---
# FILE: docs\standards\notification-standard.md

# Bildirim Cetveli — Notification Standard v1.0

> **KAYNAK/CETVEL**
> - **Bu belge bir CETVELDİR.** Yazılma sebebi: T118-VH (teslim e-postası müşteriye iki kez
>   gitti, PR #706) kapatılırken sorulan "bu sınıf başka nerede yaşıyor" sorusunun cevabı
>   ölçüldü ve **cetvel yoktu**. CLAUDE.md Mutlak Kural 1 gereği cetveli yazmak işin kapsamına
>   dahildir.
> - **Üst cetveller:** `docs/standards/edge-function-security-standard.md` (uç güvenliği),
>   `docs/standards/rendering-cache-standard.md` (veri değişince ne tazelenir),
>   `docs/standards/i18n-localization-standard.md` (kullanıcıya görünen metin).
>   Bu belge onların yerine geçmez; **bildirim gönderimi** eksenini ekler.
> - **Ölçüm tabanı:** `origin/master` = `57e82a4d` (2026-08-20) + canlı Postgres
>   (`information_schema.columns`, aynı gün sorgulandı). Ana çalışma dizini ÖLÇÜM KAYNAĞI
>   DEĞİLDİR — bugün `2df35323`'te bayat kaldığı görüldü.
> - **Dış kaynaklar:** aşağıda §B10.

## Kapsam

Bu cetvel, **VentHub'ın müşteriye veya operasyona kendiliğinden gönderdiği her mesajı**
yönetir: e-posta, SMS, WhatsApp, panoya düşen operasyon uyarısı. Kanal fark etmez;
kural gönderimin **tetiklenme ve tekrarlanma** biçimi üzerinedir.

Kapsam dışı: kullanıcının kendi bastığı butonla anında aldığı yanıt (ör. form gönderimi
sonrası ekranda çıkan onay), ve `console`/Sentry kayıtları.

## B1 — Bildirim, "yan etki"dir; en az sipariş kadar ciddiye alınır

Bir bildirim gönderildikten sonra **geri alınamaz**. Müşterinin gelen kutusuna düşen ikinci
"siparişiniz teslim edildi" e-postası, veritabanındaki bir satırı düzeltir gibi düzeltilemez.
Bu yüzden bildirim, sipariş durumu gibi **monoton** ve **tekil** olmak zorundadır:

- **Monoton:** aynı olay için bildirim yalnız ileri yönde üretilir; geri sarılmaz.
- **Tekil:** aynı (sipariş, olay) çifti için müşteriye **bir** mesaj gider.

Bu iki şart, aşağıdaki B3'ün tamamının gerekçesidir.

## B2 — Bugünkü yüzey (ÖLÇÜLDÜ, tahmin değil)

### B2.1 — Uçlar ve ÇAĞRI BİÇİMLERİ

`supabase/functions/` altında bildirim üreten yedi uç var. Kritik nokta: **hepsi aynı biçimde
çağrılmıyor**, ve envanteri tek biçime kurmak yanlış hükme yol açar (bugün yaşandı: yalnız
`functions.invoke(` taranınca `order-confirmation` görünmedi ve "ödeme onay e-postası yok"
diye yanlış hüküm kuruldu).

| Uç | Çağıran | Çağrı biçimi |
|---|---|---|
| `order-confirmation` | `iyzico-callback/index.ts:327` | sunucu→sunucu düz `fetch` |
| `delivery-notification` | `src/lib/orderStatusService.ts:193`, `shipping-webhook` | istemci `invoke` + uç |
| `shipping-notification` | `admin-update-shipping/index.ts` | sunucu→sunucu |
| `return-status-notification` | `src/views/admin/ReturnsTableBody.tsx:518,694`, `returns-webhook` | istemci `invoke` + uç |
| `notification-service` | `src/views/admin/quotes/QuotesTableBody.tsx:346`, `stock-alert` | istemci `invoke` + uç |
| `quote-notification-webhook` | DB tetiği (`20260817200000_quote_request_notification.sql`) | veritabanı tetiği |
| `stock-alert` | `.github/workflows/stock-alert-cron.yml` | cron |

**Kural B2.1:** bir bildirim yeteneğinin var olup olmadığı sorulduğunda, envanter **beş çağrı
biçiminin beşini de** taramak zorundadır: istemci `invoke` · sunucu→sunucu `fetch` ·
veritabanı tetiği · webhook · cron. Tek biçimli taramanın sıfırı, yokluğun kanıtı değildir.

#### B2.1.b — DEVREDEN UÇLAR (ikinci sınıf)

Yukarıdaki tablo **e-postayı kendisi gönderen** uçları sayar. Ama gönderimi başka bir uca
**devreden** uçlar da vardır: kullanıcının gözünden bildirimi başlatan şey onlardır, ve
sağlayıcı adına (`api.resend.com`) bakan bir ölçü onları **göremez**.

Ölçüm (2026-08-23, 28 ucun tamamı okundu): **6 doğrudan gönderici + 6 devreden.**

| Devreden uç | Tetiklediği gönderici | Nasıl |
|---|---|---|
| `admin-update-shipping` | `shipping-notification` | sunucu→sunucu `fetch` |
| `iyzico-callback` | `order-confirmation` | sunucu→sunucu `fetch` |
| `order-paid-webhook` | `order-confirmation` | sunucu→sunucu `fetch` |
| `returns-webhook` | `return-status-notification` | sunucu→sunucu `fetch` |
| `shipping-webhook` | `delivery-notification` | sunucu→sunucu `fetch` |
| `stock-alert` | `notification-service` | sunucu→sunucu `fetch` |

`iyzico-payment` de `functions/v1` çağırır ama hedefi `order-validate`'tir — bildirim akışı
değildir, **kapsam dışıdır**.

> **Zincir vardır, tek adım varsaymayın.** `stock-alert` hem devreden hem hedeftir:
> `iyzico-callback` → `stock-alert` → `notification-service`. Bu yüzden kural ve kapı
> **geçişli** çalışır — bir gönderici uca kaç adımda ulaşıldığı fark etmez.

**Kural B2.1.b:** bir gönderici ucu — doğrudan ya da zincirleme — tetikleyen her uç, bu
cetvelde **adıyla** geçmek zorundadır. Kapsam sağlayıcı adına değil **davranışa** bağlıdır:
ölçü "Resend'i çağırıyor mu" değil, "bir bildirim akışını başlatıyor mu" sorusudur.

> **Bilinen sınır (dürüstçe):** bu kural çağrı grafiğini **kaynak metinden** okur ve hedef
> adının sabit metin olmasına dayanır. Bugün 28 ucun hepsinde öyledir
> (`` `${supabaseUrl}/functions/v1/order-confirmation` `` — birleşen kısım yalnız önek).
> Hedef adı değişkenden üretilirse tarama körleşir; bu yüzden `INV-NOTIFY-1` böyle bir
> çağrıyı **kırmızı** sayar (§B8.1). Körlüğü sessizce yaşamak seçenek değildir.

### B2.2 — Defterler: üç tane var, ÜÇÜ AYNI SORUYU CEVAPLAMIYOR

| Defter | Başarısızlık satır bırakır mı | `tenant_id` | Gönderimden ÖNCE okunuyor mu |
|---|---|---|---|
| `order_email_events` | **EVET** (v1.1: `status` + `error`) | **YOK** (canlı DB, 08-20 · v1.1'de de yok) | uç HAYIR · **tetik EVET** |
| `shipping_email_events` | **HAYIR** (yalnız başarı) | VAR | **HAYIR** |
| `quote_email_events` | **EVET** (`status in ('sent','failed')` + `error`) | ölçülmedi | **EVET** (damga üzerinden) |

Uç bazında ölçüm (`origin/master` = `57e82a4d`):

| Uç | Deftere yazar | Göndermeden önce OKUR |
|---|---|---|
| `order-confirmation` | `order_email_events` (satır 208) | **hayır** |
| `shipping-notification` | `shipping_email_events` (satır 393) | **hayır** |
| `delivery-notification` | `shipping_email_events` (satır 162) | **hayır** |
| `quote-notification-webhook` | `quote_email_events` | **evet** (satır 107 + 118) |

İki ayrı kusur sınıfı çıkıyor:

1. **Defter yazılıyor ama okunmuyor.** Dört uçtan üçünde "bunu zaten yolladık mı" sorusunu
   soran kimse yok. Defterin varlığı korumanın varlığı DEĞİLDİR.
2. **Defter sınırları bildirim türüyle uyuşmuyor.** `delivery-notification` (teslim) kendi
   kaydını **kargo** defterine yazıyor. Yani "teslim e-postası kaç kez gitti" sorusu bugün
   ancak `subject` metnine bakarak cevaplanabiliyor — tür kolonu yok.

### B2.3 — Sipariş durumu × bildirim kapsamı

Otorite `venthub_orders_status_check` (altı değer; `paid`/`refunded` **sipariş durumu değildir**,
bkz. `docs/standards/pricing-standard.md` ve ilgili ölçüm).

| `status` | Bildirim | Uç |
|---|---|---|
| `pending` | yok | — |
| `confirmed` | **var** | `order-confirmation` (`iyzico-callback:327`, yalnız `if (paid)` dalı) |
| `processing` | yok | — |
| `shipped` | **var** | `shipping-notification` (`admin-update-shipping`) |
| `delivered` | **var** | `delivery-notification` (`orderStatusService.ts:193`) |
| `cancelled` | yok | — |

Altı durumun üçünde bildirim var. **Boşluk bir kusur değil, bir KARARDIR** — ve karar
verilmemiştir. Kural: yeni bir sipariş durumu eklendiğinde bu tabloya satır eklemek ve
"bildirim yok" seçeneğini **açıkça yazmak** zorunludur (§B8 kapısı bunu ölçer).

## B3 — MÜKERRERLİK KORUMASI (bu cetvelin çekirdeği)

### B3.1 — İki katman ZORUNLU, biri diğerinin yerine geçmez

Her bildirim gönderimi **iki** bağımsız korumaya sahip olmalıdır:

**Katman 1 — Sağlayıcı anahtarı (ucuz, anlık).**
Resend, `Idempotency-Key` başlığını destekler; aynı anahtarla gelen ikinci istek yeni e-posta
üretmez. **Sınırı:** anahtar **24 saat** sonra düşer, en fazla 256 karakter olabilir; aynı
anahtar farklı gövdeyle gelirse `409 invalid_idempotent_request`, eşzamanlı ikinci istek
gelirse `409 concurrent_idempotent_requests` döner (kaynak §B10-1).

**Katman 2 — Kendi damgamız (kalıcı).**
24 saat, bir siparişin ömrü için kısadır: kargo webhook'u iki gün sonra yeniden "delivered"
gönderirse Katman 1 artık koruma vermez. Bu yüzden **veritabanında** kalıcı bir damga
şarttır ve **gönderimden önce OKUNMALIDIR**.

**Referans uygulama proje içinde zaten var:** `quote-notification-webhook`. Damga kolonu
`venthub_quotes.request_email_sent_at`; uç satır 107'de okur, 118'de doluysa **gönderimden
vazgeçer**, 172'de başarıdan sonra damgayı basar. Yeni bildirim yazan herkes bu üçlüyü
kopyalar.

> **Katman 1 tek başına yeterli DEĞİLDİR** (24 saat), **Katman 2 tek başına yeterli
> DEĞİLDİR** (uç iki kez eşzamanlı çağrılırsa ikisi de damgayı boş görür ve ikisi de gönderir).
> İkisi birlikte hem yarışı hem gecikmiş tekrarı kapatır.

### B3.2 — Anahtar biçimi

Anahtar **olayın kimliğidir**, isteğin değil:

```
<bildirim-turu>/<varlik-id>[/<ayirt-edici>]
```

- `siparis-onay/9f2c…` — sipariş başına bir kez
- `teslim/9f2c…` — sipariş başına bir kez
- `kargo/9f2c…/TR12345` — takip numarası değişirse yeni bildirim MEŞRUDUR, anahtar da değişir

Yasak: zaman damgası, rastgele değer, `crypto.randomUUID()` — bunlar her çağrıda değişir ve
anahtarı **hiçbir şeyi korumayan** bir süse çevirir.

### B3.3 — Damga başarıdan SONRA, defter her iki hâlde de yazılır

- **Damga** yalnız gönderim başarılı olduktan sonra basılır (başarısızlıkta basılırsa müşteri
  hiç e-posta almaz ve tekrar denenmez — sessiz kayıp).
- **Defter** hem başarıda hem başarısızlıkta satır bırakır. `quote_email_events`'in
  `status`/`error` kolonları doğru modeldir; `order_email_events` ve `shipping_email_events`
  bugün yalnız başarıyı yazdığı için **"gitmedi" sorusunu cevaplayamıyor** (bu tespit projenin
  kendi migration yorumunda da yazılı: `20260817200000_quote_request_notification.sql:28-32`).

## B4 — Sessizlik yasağı

Bildirim gönderimi **best-effort** olabilir — statüyü geri almaz, siparişi iptal etmez. Ama
**görünmez olamaz**. Bugün ölçülen üç sessizlik noktası:

1. `iyzico-callback:337` — `catch { /* ignore */ }`. Ödeme onay e-postası hiç gitmese kimse
   bilmez.
2. `orderStatusService.ts` — `catch {}` (yorum: "yutulur — bildirim hatası statüyü geri almaz").
   Gerekçe doğru, **sonucu eksik**: yutulan hata hiçbir yere yazılmıyor.
3. `order-confirmation:207` — defter yazımı da `try/catch` içinde ve gönderimden SONRA.
   Yani gönderim başarılı, defter yazımı başarısız olursa kayıt hiç doğmaz.

**Kural:** yutulan her bildirim hatası **en az bir** kalıcı ize dönüşür — defter satırı
(`status='failed'` + `error`) ya da Sentry. "Yutuldu ve kayboldu" kabul edilmez.
İlgili: `docs/standards/edge-function-security-standard.md` (fail-closed dikiş yerleri).

## B5 — Kiracı kapsamı

CLAUDE.md Mutlak Kural 12: her okuma/yazma tenant-scoped. Bildirim defterleri buna dahildir.

**ÖLÇÜLDÜ (canlı DB, 2026-08-20):** `shipping_email_events`'te `tenant_id` **VAR**;
`order_email_events`'te **YOK**. Üstelik `iyzico-callback:329` çağrı gövdesinde `tenant_id`
gönderiyor, `order-confirmation` ise deftere yazarken bu alanı **düşürüyor** (satır 211'deki
gövdede yok). Yani bilgi elde var, kaydedilmiyor.

**Kural:** her bildirim defteri `tenant_id` taşır ve gönderen uç onu yazar. Kiracı sınırı
olmayan bir defter, çok-kiracılı kurulumda "bu müşteriye ne gönderdik" sorusunu cevaplayamaz.

## B6 — Dil ve içerik

- Müşteriye giden her metin **sözlükten** gelir; uç içinde gömülü Türkçe/İngilizce dize
  yazılmaz (CLAUDE.md Kural 7). Bugün `order-confirmation` konu ve gövdeyi **gömülü Türkçe**
  üretiyor (satır 167 ve 176-183) — cetvele göre ihlal, onarımı ayrı iş.
- Bildirim dili **siparişin dilinden** türetilir, gönderim anındaki arayüz dilinden değil.
- Para birimi asla dilden türetilmez (INV-CURRENCY-1, `src/i18n/format.ts`).

## B7 — ÇELİŞEN-MEVCUT

Bu cetvel yazılırken bulunan, **cetvelle çelişen mevcut durum** — hiçbiri bu PR'da
onarılmıyor, hepsi ayrı iş emri ister:

| # | Çelişki | Yer | Sahip şerit |
|---|---|---|---|
| 1 | ~~`order-confirmation` mükerrerlik koruması olmadan gönderiyor~~ → **`#711` ile çözüldü** (DB damgası + UNIQUE); uç hâlâ kendi başına çağrılırsa korumasız | `order-confirmation/index.ts` | EDGE |
| 2 | `shipping-notification` ve `delivery-notification` de deftere yazıp okumuyor | aynı klasör | EDGE |
| 3 | `shipping_idempotency` tablosu **yalnız yazılıyor, hiç okunmuyor** — adı "idempotency" olan tablo sıfır idempotency veriyor (`admin-update-shipping:287-298`, dosyada başka geçiş yok) | EDGE | EDGE |
| 4 | `order_email_events`'te `tenant_id` yok | canlı DB + migration | EDGE/ALTYAPI |
| 5 | ~~`order_email_events` başarısızlığı yazmıyor~~ → **`#711` ile çözüldü** (`status`/`error`/`kind`). `shipping_email_events` için **hâlâ geçerli** | canlı DB | EDGE |
| 6 | `order-confirmation` metinleri gömülü Türkçe | satır 167, 176-183 | kural I18N · **dosya EDGE** |
| 7 | `delivery-notification` kaydını kargo defterine yazıyor | satır 162 | EDGE |

**Sahiplik notu:** 6 numaralı kalemin *kuralı* I18N'e (sözlük + CLAUDE.md Kural 7), *dosyası*
EDGE'e aittir (`supabase/functions/**` EDGE'in şerit talebinde). Onarım tek şeritte bitmez;
sözlük anahtarlarını I18N verir, uca EDGE işler. Bunu ayrı yazıyorum çünkü tabloda tek bir
şerit adı yazmak işi yanlış adrese yollar.

**Not:** 3 numaralı bulgu bu cetvelin kapsamının dışında (kargo yazma işlemi, bildirim değil)
ama **aynı sınıfın** en keskin örneği olduğu için buraya yazıldı: defterin adı korumayı
kanıtlamaz, **okunduğu yer** kanıtlar.

## B8 — Kapılar

**Kapı ilkesi (CLAUDE.md + `docs/standards/collaboration-protocol.md`):** yeni kapı mevcut
ihlalle AÇILMAZ. §B7'deki yedi çelişki bugün canlıdır; bu yüzden bu sürümde **mükerrerlik
kapısı yazılmıyor** — kapı, EDGE onarımı indikten sonra gelecek (§B9-3). Bugün açılan iki
kapı, bugün YEŞİL olan ve gelecekteki sessiz genişlemeyi durduran kapılardır.

### B8.1 — INV-NOTIFY-1 · envanter bütünlüğü

`supabase/functions/**` altında e-posta sağlayıcısına gönderim yapan (`api.resend.com`) her uç,
bu cetvelin **§B2.1 tablosunda** adıyla geçmek zorundadır.

**Yakaladığı kusur:** yeni bir bildirim ucu eklenir, cetvele işlenmez, ve "bildirimlerimiz
neler" sorusunun cevabı sessizce eksilir. Bugünkü kusur bunun ta kendisiydi:
`order-confirmation` hiçbir cetvelde yazılı olmadığı için var olduğu hâlde "yok" sanıldı.

**İkinci kol — DEVREDEN uçlar (2026-08-23 eklendi).** Kapının ilk sürümü kapsamı
**sağlayıcı adına** bağlıyordu; gönderimi başka bir uca devreden bir uç bu ölçüye görünmez
oluyordu. Kapı haklı olarak susuyordu ama cetvel "hepsi burada" diyordu — ve değildi.
Ölçüldüğünde boşluk tek vaka değil, **sistemin yarısı** çıktı (6 gönderici, 6 devreden).
İkinci kol §B2.1.b kuralını zorlar: bir gönderici ucu **geçişli olarak** tetikleyen her uç
cetvelde adıyla geçmelidir. Bulgu EDGE'den geldi (`order-paid-webhook`), ölçüm I18N'de.

**Üçüncü kol — körlüğün alarmı.** İkinci kol hedef adını kaynak metinden okur. Hedef
değişkenden üretilirse tarama **sessizce** körleşir; o yüzden dinamik `functions/v1` çağrısı
kapıyı **kırmızı** yapar. Bugün böyle bir çağrı yok (28 ucun tamamı ölçüldü) — kol, ileriye
dönük bir alarmdır: kural kör kalacaksa bunu haber vererek kalsın.

**İki taraflı kanarya:** ikinci kol, devreden uç sayısı **sıfıra düşerse de** kırmızı olur.
Sıfır, "devreden kalmadı" değil "tarama bozuldu" demektir (geçişli kapanış çöktü ya da çağrı
biçimi değişti). Kanaryasız bir tarama, hiçbir şey bulamadığı için değil **hiçbir yere
bakmadığı** için yeşil olabilir.

### B8.2 — INV-NOTIFY-2 · durum kapsam tablosu tam olmalı

`venthub_orders.status` CHECK sözlüğündeki **her değer** §B2.3 tablosunda bir satıra sahip
olmalıdır ("yok" yazmak geçerli cevaptır, satırın olmaması değildir).

**Yakaladığı kusur:** yeni sipariş durumu eklenir, bildirim kararı hiç verilmez; kimse fark
etmez çünkü "karar verilmedi" ile "bildirim yok" ayırt edilemez hâle gelir.

### B8.3 — Kapsam kanaryası

Her iki kapı da, taramasının gerçekten dosya gördüğünü kanıtlayan bir kanarya taşır (ölçülen
uç sayısı > 0, ölçülen durum sayısı >= 6). Kanarya olmadan bir tarama, hiçbir şey bulamadığı
için değil **hiçbir yere bakmadığı** için yeşil olabilir.

## B9 — ÖLÇÜLEMEDİ (dürüst boşluklar)

1. **`quote_email_events`'te `tenant_id` var mı** — canlı sorguya bu tablo dahil edilmedi;
   şema dosyasında da yok. **Ölçülmedi**, varsayılmadı.
2. **Gerçek mükerrer gönderim vakası yaşandı mı** — Resend tarafındaki gönderim geçmişi bu
   oturumdan sorgulanamadı. Kusur **yapısal olarak** kanıtlı (koruma yok), **vaka olarak**
   ölçülmedi.
3. **SMS/WhatsApp kanalı** — `src/utils/whatsapp.ts` kullanıcıyı WhatsApp'a yönlendiren bir
   bağlantı üretir; bu bir **bildirim gönderimi değildir**. Twilio üzerinden kendiliğinden
   giden bir mesaj bu taramada bulunamadı; kanalın canlı olup olmadığı **ölçülmedi**.

## B10 — Kaynaklar

1. **Resend — Idempotency Keys.** `Idempotency-Key` başlığı, 24 saat ömür, 256 karakter
   sınırı, `409 invalid_idempotent_request` / `409 concurrent_idempotent_requests` davranışı.
   <https://resend.com/docs/dashboard/emails/idempotency-keys> ·
   <https://resend.com/docs/api-reference/emails/send-email>
2. **Medusa — Notification modülü veri modeli** (kod düzeyinde okundu):
   `idempotency_key: model.text().unique().nullable()`, `status` (varsayılan `PENDING`),
   `original_notification_id`, `trigger_type`. Yani olgun bir e-ticaret çekirdeği
   idempotency anahtarını **modelin kendisine** koyuyor, çağıran koda bırakmıyor.
   `medusajs/medusa` · `packages/modules/notification/src/models/notification.ts`
3. **Proje içi referans uygulama:** `supabase/migrations/20260817200000_quote_request_notification.sql`
   (damga + başarısızlık yazan defter) ve `supabase/functions/quote-notification-webhook/index.ts`
   (satır 107 oku · 118 vazgeç · 172 damgala).

## B11 — v1.1 kaydı: cetvel kendi konusunda BİR COMMIT BAYAT doğdu

v1.0'ın ölçüm tabanı `57e82a4d` idi. Cetvel `d61f5295` olarak master'a indi — ve **bir önceki
commit** `d542a1d2` (`#711`, EDGE) tam da bu cetvelin çekirdek konusunu değiştirmişti.
Yani belge, yayımlandığı anda kendi ana iddiasında güncelliğini yitirmişti.

**`#711` ne getirdi** (canlı DB'den doğrulandı, migration prod'a inmiş):

| Ne | Nerede |
|---|---|
| `venthub_orders.paid_at` — **olgu** damgası | `20260820140000_order_paid_notification.sql:52` |
| `venthub_orders.paid_email_sent_at` — **idempotans** damgası | aynı dosya, satır 55 |
| `order_email_events.status` · `.error` · `.kind` | satır 88-94 |
| `uq_order_email_events_sent_once` — kalıcı UNIQUE | satır 150 |
| `trg_stamp_order_paid_at` · `trg_notify_order_paid` (pg_net) | satır 172, 238 |

Bu, §B3'ün **ilk uygulamasıdır**: veriye bağlı tetik + göndermeden önce okunan kalıcı damga.
EDGE'in getirdiği ve v1.0'da yalnız ima edilen ayrım şudur ve buraya adıyla alınıyor:

> **Olgu damgası ile idempotans damgası AYNI ŞEY DEĞİLDİR.** `paid_at` "bu sipariş ödendi"
> der; `paid_email_sent_at` "bunun e-postası gitti" der. Tek kolona ikisini birden yükleyen
> tasarım, e-posta başarısız olduğunda ya olguyu yalanlar ya da tekrarı açar.

### Bundan çıkan cetvel kuralı

**Bir cetvelin ölçüm tabanı, yayımlandığı andaki master OLMAK ZORUNDA DEĞİLDİR — ama tabanı
YAZILI olmak ve yayımdan önce SON KEZ kontrol edilmek zorundadır.** Bu belge tabanını yazmıştı
(§KAYNAK/CETVEL), o yüzden bayatlık *görünür* oldu ve bir saat içinde düzeltilebildi. Tabanı
yazmayan bir cetvel aynı durumda sessizce yanlış kalırdı.

**Hâlâ geçerli olanlar** (v1.1'de yeniden ölçüldü): `order_email_events`'te `tenant_id` **yok**
(§B5) · `shipping_idempotency` yalnız yazılıyor, hiç okunmuyor (§B7-3) · `delivery-notification`
kaydını kargo defterine yazıyor (§B7-7) · `shipping_email_events` başarısızlığı yazmıyor.

---

**Sürüm:** v1.1 · 2026-08-20, **iddiaları 2026-08-22'de yeniden ölçüldü** ·
ölçüm tabanı `origin/master` = `ea316814` + canlı Postgres.

> **Niçin yeniden ölçüldü:** bu düzeltme iki gün gönderilmeden bekledi. "İki gün önce
> doğruydu" bugün doğru olduğunu göstermez — belgenin kendi §B11'i tam da bunu anlatıyor.
> Canlı DB'den 08-22'de doğrulandı: `order_email_events` → `status`/`error`/`kind` **var**,
> `tenant_id` **hâlâ yok**; `uq_order_email_events_sent_once` **var**; `venthub_orders` →
> `paid_at` ve `paid_email_sent_at` **var**. §B5'teki kiracı boşluğu ve §B7'deki kalemler
> **aynen geçerli**.
(v1.0 tabanı `57e82a4d` idi ve **kendi konusunda bir commit bayat doğdu** — bkz. §B11.)


---
# FILE: docs\standards\pano-orion-koprusu-standardi.md

# Pano ↔ Orion Köprüsü Cetveli (RFC-1)

> **Karar:** AYRI TUT + KÖPRÜLE — 2026-08-23, Recep onayı.
> RFC-1 süreci: OPS önerisi → 3 şerit görüşü (I18N, AUTH, ORION — üçü de ölçümlü) → oybirliği → onay.
> Bu cetvel, panonun ve Orion'un **niçin birleştirilmediğini** ve köprünün **nasıl kurulacağını** yönetir.

## 1. Tez ve gerekçe

**Pano** (C:/tmp/venthub-board, append-only JSONL) = filonun **sinir sistemi**: claim/nabız/not,
saniyeler-saatler ömürlü, sıfır bağımlılık. **Orion** (registry, CLI+MCP) = **arşiv + kokpit**:
görev/faz/karar, günler-aylar ömürlü, sorgulanabilir.

Birleştirilmez, çünkü (hepsi 2026-08-23'te ölçüldü):

1. **Canlılık rehin verilmez.** Oturum ölümlerinde/MCP çöküşlerinde ayakta kalan tek katman
   pano oldu; aynı gün Orion MCP bayat çalışma-ağacı koşuyordu (commit'siz `_MIGRATIONS`
   satırı canlı registry'ye düştü — ölçüldü). Koordinasyon hattı, koordine ettiği her şeyden
   **aptal ve sağlam** olmalı; AUTH formülü: *"koordine ettiği şeyden daha az hareketli parça."*
2. **Eşzamanlılık modeli farklı.** Pano oturum-başına append-only dosya = 7 eşzamanlı yazar
   çatışmasız; Orion tek SQLite dosyası = kilit/yarış riski.
3. **Bayatlık kanıtı:** Orion'da venthub-hvac'ın son görev güncellemesi 08-18'de kalmıştı;
   o 5 günde filo 5 büyük işi prod'a soktu. Pano=an, Orion=tarih ayrımı gözlemseldir.

**Dürüst maliyet (I18N):** ayrılık kaydı parçalar — bir günün işi pano + hafıza + docs/audits'te
yaşar. Bu faturayı köprü öder; ödemiyorsa köprü eksiktir.

## 2. Köprü — üç faz

### Faz 0 — Pano sertleştirme (önkoşul; sahip: ALTYAPI)
- **sid-RET:** `--sid` UUID biçiminde değilse yazma **REDDEDİLİR** (uyarı değil). Hayalet
  `events.<çöp>.jsonl` sınıfı kapanır. Köprü yalnız canlı claim listesindeki sid'leri kabul eder;
  ret sayısı görünür tutulur (sessiz düşürme = yeni sahte-yeşil sınıfı).
- **PARK durumu:** claim'e `park + gerekçe + açan merci`. Park ≠ sahipsiz; pano bugün ikisini
  ayırt edemiyor ve bu bilgi kaybı değil **yanlış bilgi** üretiyor.
- **Rotasyon/limit:** events dosyalarına günlük rotasyon (biri ~600KB ölçüldü). MEMORY.md dersi:
  limit sessizce ısırır ve **önce en taze kayıt** görünmez olur. Köprü yazmadan önce limiti ölçer.
- **Claim-DELTA:** claim değişimi (kim, hangi glob, ne zaman, aldı/bıraktı) **olay** olarak
  yazılır. Union-blob gerçek sanılmaz; kısmi-release arşiv seviyesinde bedavaya gelir.

### Faz 1 — TEK YÖN: pano → Orion (sahip: ORION; K2 sonrası)
- **Taşıyıcı:** oturum-DIŞI cron, **stabil kurulu kopyadan** (K2). MCP değil — MCP çalışma
  ağacını koşar; senkronun kod sürümü şeride göre değişemez. Oturum-bağlı cron da değil —
  oturum ölümünde taşıyıcı ölür (ölçüldü) ve bu arıza değil tasarımdır.
- **Okuma:** pano **JSONL dosyalarından** okunur; `who` insan-çıktısı **asla kazınmaz**
  (köşeli-parantez ayrıştırma körlüğü üç biçimde ölçüldü). Kapsam: son N gün.
- **Taşınan olaylar** (bugün "git arkeolojisi gerektiren" sınıf): claim-delta ·
  merge-indi (PR → SHA + dokunulan globlar) · kapı-kırmızı (hangi kapı, hangi commit) ·
  öncül-düzeltmesi / karar geri alma · GO kayıtları (kim, neye, hangi kapsamla).

### Faz 2 — Ters yön: Orion → pano (Faz 1 ölçüt tuttuktan sonra)

⭐**Önkoşul ZAMAN DEĞİL SAYIDIR.** Eski metin "bir hafta sorunsuz koştuktan sonra"
diyordu; bu, `kapi-tasarim-standardi.md` §12'nin yasakladığı zamana dayalı eşiktir —
makine kapalı kalırsa hafta dolar ama hiçbir şey ölçülmemiş olur.

**Faz 2'yi açan ölçüt — arka arkaya 30 taşıyıcı koşumu, üçü birden:**

1. **Çökme 0.** Her koşum çıkış kodu 0 ile bitmeli.
2. **Yanlış hayalet reddi 0.** `hayalet_sidler` listesindeki HER sid'in pano
   geçmişinin TAMAMINDA sıfır `claim`'i olmalı. Liste boş olmak zorunda DEĞİL —
   gerçek hayaletler reddedilmeye devam eder.
3. **Korunum kimliği her koşumda tutmalı:**
   `yazilan + mukerrer + reddedilen_hayalet + kapsam_disi_tur == okunan`
   Okunan her olay tam olarak bir kovaya düşer; eşitlik kırılırsa bir olay
   **sessizce düşmüş** demektir.
- **Yalnız dört olay:** görev BLOCKED (+bloke eden) · kapı açıldı/kapandı · faz tamamlandı
  (sıradaki hazır) · karar `active` oldu.
- **Ölçüt (ORION):** *"Bu olayı görmeyen bir şerit yanlış iş yapar mı? Hayırsa panoya düşmez."*
  `task created/updated/completed` panoya düşmez — günde onlarca olur, kimsenin o anki kararını
  değiştirmez, panonun sıfır-bağımlılık özelliğini yer.
- İki yön açıkken **çatışma çözümü:** "şu an kim sahip" için PANO otorite; "ne oldu" için
  ORION otorite. Çelişirse canlı karar panoya, tarih Orion'a göre yazılır.

## 3. Bilgi katmanları (aynı mimarinin parçası)

| Bilgi | Evi | Ömür |
|---|---|---|
| Anlık koordinasyon (claim/nabız/not/kuyruk) | **Pano** | saniyeler–saatler |
| İş kaydı (görev/faz/karar/ilerleme) | **Orion** | günler–aylar |
| Kalıcı dersler (feedback/kural) | hafıza dosyaları + MEMORY.md indeksi | kalıcı |
| Oturum/compact durumu | şerit-başı `*-state.md` + `lane-day-states-index.md` | oturumlar arası |

Compact hazırlığı MEMORY.md'ye **durum yazmaz** (24KB kırpma vakası: en taze girdiler
sessizce düşer). Hafızaya yazan, girdi saymaz **bayt ölçer**.

## 4. Sınavlar (köprü kodu yazılırken zorunlu)

1. **Ayakta-kalma:** Orion süreci öldürülür → pano yazma/okuma etkilenmez (KIRMIZI olursa
   köprü bağımlılık sızdırmış demektir).
2. **Hayalet-ret:** canlı olmayan sid'li olay köprüye verilir → REDDEDİLİR ve ret sayacı artar.
3. **Kazıma yasağı:** köprü kaynağında `who` çıktısı ayrıştırma yok; `[lang]` içeren glob'lu
   claim birebir taşınır (pozitif kontrol: bilinen glob çıktıda AYNEN var).
4. **Gürültü kapağı:** Faz 2'de dört olay dışında hiçbir Orion olayı panoya düşmez
   (sabotaj: task-completed yayını eklenir → sınav KIRMIZI).

## 4.5 Nöbetçi — oturum-dışı sessizlik dedektörü (AUTH fikri, 2026-08-23)

**Yapısal boşluk (üç şeritte aynı gün ölçüldü):** üçlü mekanizmanın üç ayağı da oturuma
bağlı; oturum ölünce üçü birden gider ve **"oturumun kendisi öldü" olayını görebilen hiçbir
katman yok** — bugün bunu sistem değil Recep fark etti.

**Çözüm — iki adım, ucuz olan önce:**
- **Adım 1 (NÖBETÇİ):** Windows Görev Zamanlayıcı'ya bağlı, diske kayıtlı küçük betik.
  YALNIZ ÖLÇER ve HABER VERİR: panoyu okur, "X şeridi N dakikadır atış yapmıyor VE claim'i
  PARK değil" gerçeğini panoya yazar / Recep'e bildirir. Oturum başlatmaz, kota yakmaz,
  geri alınamaz hiçbir şey yapmaz. **Önkoşul: Faz 0'ın PARK durumu** — nöbetçi "sessiz ama
  park" ile "sessiz ve sahipsiz"i ancak pano bu durumu taşıyorsa ayırt eder.
- **Adım 2 (UYANDIRICI, varsayılan KAPALI):** başsız oturum başlatma (`claude -p`).
  **Doğrulanmamış varsayım** — kurulmadan önce bir kez gerçekten koşulup kanıtlanır;
  ayrıca dışarıdan oturum başlatmak görünmez kota yakar → **yalnız Recep açıkça isterse.**
- **Nöbetçinin kendi canlılık kanıtı:** kendi nabzını panoya yazar; N dakikadır yazmıyorsa
  o da sinyaldir ("her şey öldüğünde çalışan" bileşen sessizce ölürse kimse fark etmez).

## 5. Uygulama sırası

T011 (faz kapısı, ORION) → **K2** (MCP stabil kopya + restart, OPS) → venthub roadmap
kurulumu (OPS) → **Faz 0** (ALTYAPI uyanınca; Faz 1'i BLOKLAMAZ — köprü hayalet-sid'e karşı
kendi sınavıyla korunur, Bölüm 4/2) ∥ **Faz 1 köprü** (ORION iş emri) → **Nöbetçi Adım 1**
(Faz 0'ın PARK durumu indikten sonra; sahip ALTYAPI/OPS) → 30 koşumluk ölçüt → **Faz 2**.

Not: Faz 0 "önkoşul"dur ama sıkı-sıralı değil: sid-RET/rotasyon Faz 1 ile paralel inebilir;
yalnız **PARK durumu, Nöbetçi'nin** ve **Faz 2'nin** sert önkoşuludur.

## 6. Bağlama kovaları: iki kolun gerekçesi (2026-08-25 kararı, PR orion#36)

K3 korunumu **beş not-kovası** üzerinden tutar:
`islenen_not = baglanan + kismi + belirsiz + referanssiz + cozunmeyen`
ve ayrıca **referans düzeyinde** ayrı bir korunum vardır:
`islenen_referans = baglanan_ref + cozunmeyen_ref + belirsiz_ref`
(not düzeyi tutarken referans düzeyi kırılabilir; tek kimlik iki düzeyi ölçemez).

İki kolun gerekçesi AYRI AYRI yazılır — biri diğerinden türetilemez:

- **Belirsizlik kolu (değişmedi):** bir referans 2+ adaya çözünüyorsa o notun HİÇBİR
  referansı bağlanmaz. Gerekçe K1'dir: iki adaydan birini seçmek tahmini olgu üretir;
  tek ve kendinden emin eşleşme de yanlış olabilir ("belirsiz olanı bağlama" kuralı
  "yanlış olanı bağlama"yı garanti etmez — kapı tasarım ilkesi). Ölçülen bedel hedefe
  bağlıdır: Linear'da kimlikler tekil olduğundan 2026-08-25 ölçümünde `belirsiz_ref = 0`
  (bedel şimdilik sıfır); registry'de çarpışma var (T017-OR onarımı sonrası yeniden ölçülür).
- **Çözünmezlik kolu (2026-08-25'te değişti):** sıfır aday belirsizlik DEĞİL, yokluktur.
  Kısmen çözünen notun tamamını düşürmek hiçbir tahmini önlemez, yalnız geçerli bağı
  kaybettirir. Ölçülen bedel: 109 aday notun 71'i (%65), 129 eşleşen referansın 88'i (%68)
  düşüyordu. Karar: çözünen referansların bağı KURULUR, not **kısmi** kovasına girer;
  çözünmeyen referansları `cozunmeyen_ref` sayacında görünür kalır.

Kanıt yükümlülükleri (bu bölüm değiştirilirken de geçerli):
- Pozitif kontrol **sentetik olamaz** — canlı panodan birebir alıntı bir karma-referanslı
  not kullanılır (2026-08-25'te 71 gerçek örnek vardı).
- Sabotaj seti en az: kısmi kovayı öldür → kırmızı; belirsiz referansı bağla → kırmızı.
- **Etkisiz sabotaj ≠ kör kapı:** 0 kırmızı veren sabotajın önce kendisi ölçülür
  (değişiklik gerçekten davranış değiştiriyor mu); ikisi aynı görünür ve karıştırılırsa
  sağlam kapı "kör" diye raporlanır (2026-08-25 S6 vakası).
- Ders (2026-08-25): eski davranışın %68'lik bedelini HİÇBİR test korumuyordu — mevcut
  testlerin tüm notları tek referanslıydı. Kova önceliği değişen her PR, karma-referans
  vakası içeren en az bir test taşımak zorundadır.

## 7. İçe almanın zamanlanması ve canlılığı (2026-08-26, T016-OR)

1. **Zamanlama:** Faz 1 içe alması oturumdan BAĞIMSIZ koşar (Windows Görev Zamanlayıcı,
   görev adı `OrionBoardSync`, kadans 15 dk, pencere `--days 3`). Oturum-bağlı hiçbir
   mekanizma (cron, kanca, açılış ritüeli) bu işi karşılamaz: oturum ölünce ölür.
   Kod STABİL KOPYADAN koşar (`PYTHONPATH=orion-stable`), çalışma ağacından DEĞİL.
2. **Canlılık ölçümünün kaynağı:** içe almanın sağlığı `MAX(ingested_at)` ile ölçülür —
   yani VERİNİN GERÇEKTEN TAŞINDIĞI. Görevin kayıtlı olması (`Get-ScheduledTask`) yalnızca
   yapılandırıldığını, son koşum sonucu (`LastTaskResult`) yalnızca sürecin koştuğunu
   gösterir; ikisi de "veri taşındı" demek değildir (yanlış kök yoluyla çıkış 0 mümkündür).
   Bu ikisi, alarm kırmızı yanınca NİÇİN sorusunu cevaplayan TEŞHİS girdileridir; alarmın
   kaynağı olamazlar.
3. **Eşik:** bayatlık eşiği kadansın en az ÜÇ KATI olur (bugün 45 dk). Tek atlanan koşum
   alarm değildir; üç ardışık kayıp desendir. Her titremede öten alarm okunmaz hale gelir
   ve okunmayan alarm, olmayan alarmla aynı şeydir.
4. **Hiç koşmamış = BAYAT:** içe alma hiç olmamışsa durum BAYAT'tır, "bilinmiyor" DEĞİL.
   Boş duruma "ölçülemedi, geçelim" demek, bu maddenin doğduğu arızanın ta kendisidir
   (taşıyıcı 3 gün kurulmadan kaldı ve hiçbir şey kırmızı yanmadı).
5. **İki ayrı kapı, iki ayrı gerekçe — birleştirilmez:**
   (a) BAYATLIK ALARMI içe almanın sessizce durmasını yakalar; gerekçesi "durmuş içe alma
   ile taşınacak şey olmaması dışarıdan AYNI görünür".
   (b) RUNBOOK KONFORMANSI, bir belgenin "kuruldu/koşuyor" DEDİĞİ mekanizmanın sistemde
   karşılığı olmasını şart koşar; gerekçesi doc-committed-not-work-done. Belge "kurulmadı"
   diyorsa konformans TUTAR ve o vakayı yalnız (a) yakalar. Tek gerekçeyle iki kol kurmak,
   kör bir kapıyı sağlam sanmaktır.
6. **Park fişi kuralı:** bir iş birinin onayına park ediliyorsa fişin SAHİBİ ve TARİHİ
   yazılır. Sahipsiz ve tarihsiz park edilen iş park edilmiş değil KAYBEDİLMİŞTİR
   (ölçüldü: kayıt "Recep onayına" bırakıldı, kimse sormadı, 3 gün kimse fark etmedi).
7. **Kabul ölçütü:** bu madde, bilerek bayatlatılarak KIRMIZI verdirilebilen bir alarm
   İSTER; alarmı olmayan bir alarm sessizce hep-yeşildir. (Uygulama: `orion board health`,
   5 sabotajla kanıtlı, 2026-08-26. UTC tuzağı: `ingested_at` UTC ve damgasız — yerel
   saatle karşılaştıran alarm eksi yaş hesaplar ve sonsuza dek yeşil kalır; eksi yaş
   sıfıra yuvarlanmaz, KUSUR olarak işaretlenir.)


---
# FILE: docs\standards\payment-ledger-standard.md

# Ödeme Defteri Cetveli (`payment_transactions`)

> **Durum:** v1.0 · 2026-08-23 · Şerit: PRICING-STOK
> **Niçin var:** T116'da ölçüldü ki `payment_transactions` şeması **var** ama hiçbir şey ona
> **yazmıyor**, ve defter sözlüğü **iadeyi temsil edemiyor** — oysa iade akışı canlı.
> Eksik olan kod değil, **defterin ne olduğunu söyleyen kural**. Bu dosya onu yazar.
> **Eksen kararı Recep'indir** (2026-08-23): defter **PSP olay ekseninde** tutulur.

## KAYNAK / CETVEL

| | |
|---|---|
| **Komşu cetveller** | `checkout-payment-standard.md` (ödeme **yüzeyi** — defteri kapsamıyor, ölçüldü: dosyada `payment_transactions` hiç geçmiyor) · `pricing-standard.md §4.1` (çoklu-para satış sözleşmesi) |
| **Ölçüm kaydı** | `docs/plans/t116-odeme-defteri-tasarim-2026-08-20.md` (#709, canlıda) |
| **Karar** | Recep, 2026-08-23 17:58 — OPS-AUDIT üzerinden iletildi. Dört kalem: eksen · para birimi şeması · silme davranışı · migration onayı |
| **Bu cetvelin kapsamadığı** | Ödeme **yüzeyi** (→ checkout-payment) · fiyat **hesabı** (→ pricing) · iade **iş akışı** (→ returns/refund cetveli) |

## 1. Defter nedir, ne değildir

**Defter, sağlayıcının (PSP) ne dediğinin değişmez kaydıdır.** Sipariş durumu bu kayıttan
**türetilir**; tersi değil.

| | Defter (`payment_transactions`) | Sipariş (`venthub_orders.payment_status`) |
|---|---|---|
| Ne tutar | **Olay** — PSP ne dedi, ne zaman dedi | **Özet** — paranın bugünkü durumu |
| Kaç satır | Ödeme başına **çok** satır | Sipariş başına **tek** alan |
| Değişir mi | **Hayır** — yeni olay eklenir | Evet — son olaydan türetilir |
| Otorite | **Evet**, para hareketi için | Hayır, türetilmiş görünüm |

Bu ayrım, `siparis-durumu ≠ odeme-durumu` ayrımının bir katman aşağısıdır: orada *sipariş
durumu ≠ ödeme durumu* vardı; burada **ödeme durumu ≠ ödeme OLAYI** ayrımı yapılır.

⚠ **"Başarı" bir yorumdur, "tahsil edildi" bir olgudur.** Mevcut sözlükteki `success` bu yüzden
terk edilir: İyzico akışında **otorizasyon** ve **tahsilat** ayrı adımlardır ve tek bir `success`
ikisini birbirine karıştırır — mutabakat o noktada imkânsızlaşır.

## 2. Defter sözlüğü (PSP olay ekseni) ve siparişe eşlemesi

| Defter olayı | Anlamı | Siparişe etkisi (`payment_status`) |
|---|---|---|
| `authorized` | Tutar bloke edildi, **tahsil edilmedi** | değişmez (`pending`) |
| `captured` | **Tahsil edildi** | → `paid` |
| `failed` | PSP reddetti | → `failed` |
| `voided` | Otorizasyon iptal, tahsilat **yok** | → `failed` |
| `refunded` | **Tam** iade | → `refunded` |
| `partial_refunded` | **Kısmi** iade | → `partial_refunded` |

**Eşleme tek yönlüdür:** defterden siparişe. Sipariş durumunu elle yazan hiçbir yol, defterde
karşılığı olan bir olay üretmeden `paid`/`refunded` yazamaz.

⚠ **Bu kural bugün SAĞLANMIYOR ve bunu ölçtüm.** Canlıda `trg_sync_payment_status_ins/upd`
tetikleyicisi var: `status = 'confirmed'` olduğunda ve `payment_status` boş/`pending` ise
`payment_status := 'paid'` yazıyor. Yani **ikinci bir otorite** var — sipariş yaşam döngüsü —
ve defterden haberi yok. Tetikleyici kötü niyetli değil: dolu bir değeri **asla ezmiyor**
(T114-VH'de kısmi iadeyi yutan kusur tam buydu). Ama "sevkiyat onaylandı" ile "para tahsil
edildi" **aynı şey değildir**; birinden ötekini türetmek, defterin varlık sebebini ortadan
kaldırır. Karar ve sırası §6'da (adım 3): yazıcı inince bu tetikleyicinin **kapsamı daraltılır**
ya da kaldırılır — ikisi de migration, ikisi de Recep kapısı. Bu satır olmadan cetvel,
sağlanmayan bir şeyi sağlanmış gibi okuturdu.

### 2.1 Terk edilen sözlük ve karşılığı

Canlı CHECK kısıtı bugün `pending · success · failed · cancelled` diyor. Karşılıkları:

| Eski | Yeni | Not |
|---|---|---|
| `pending` | *(satır yok)* | Bekleyen bir olay, **olay değildir**. Defter yalnız **olmuş** şeyi yazar; beklemek siparişin durumudur |
| `success` | `captured` | Otorizasyon/tahsilat ayrımı için |
| `failed` | `failed` | aynı |
| `cancelled` | `voided` | PSP terimiyle hizalanır |
| — | `refunded`, `partial_refunded` | **eksikti**: iade akışı canlıyken defter iadeyi temsil edemiyordu |

## 3. Değişmezler

1. **Append-only.** Defter satırı **güncellenmez**; yeni olay yeni satırdır. Satır güncelleniyorsa
   o defter değil, durum tablosudur.
2. **Monotonluk.** `CLAUDE.md §11` sipariş/iade durumlarının yalnız ileri gitmesini şart koşar.
   Defter zaten geri gitmez — **eklenir**. Türetilen `payment_status` monotonluğu bozacaksa
   olay yine yazılır, **türetme reddedilir ve alarm üretir** (sessiz düşmez).
3. **Para birimi taşınır, türetilmez.** `currency` her satırda **açıkça yazılır**;
   `DEFAULT 'TRY'` **kaldırılır**. Gerekçe: varsayılan bir değer, çağıranın para birimini
   yazmayı unutmasını **sessiz** hâle getirir ve çoklu-para satış sözleşmesini bozar
   (T094'te aynı kusur arayüz katmanında yaşandı).
4. **Silinmez.** `order_id` FK'si **`ON DELETE RESTRICT`**tir. Sipariş silinince para hareketi
   kaydı **yok olmaz** — defterin varlık sebebi tam olarak "kayıt kalsın"dır.
5. **Tekil olay.** Aynı PSP olayı iki kez işlenirse **iki satır olmaz**: `transaction_id` UNIQUE
   kısıtı korunur ve yazıcı `ON CONFLICT DO NOTHING` ile idempotenttir. Webhook'lar tekrar
   gönderir; defter bunu tolere etmek zorundadır.

## 4. Yazıcı kim

**Bugün hiç kimse** — ölçüldü (2026-08-23, canlı): `payment_transactions` **0 satır**,
`venthub_orders` 5 satır (hepsi `pending`), `order_refund_events` 0 satır. Kod tarafında
`payment_transactions` adı `supabase/functions/**` altında **hiç geçmiyor**.

> ⚠ **Ölçüm yöntemi adıyla:** bu sayılar ayrıcalıklı bağlantıdan alındı
> (`current_user=postgres`, `rolbypassrls=TRUE`). Yani "veri var mı" sorusunun cevabıdır;
> "bir kullanıcı bunu görebilir mi" sorusunun **değil**.

Cetvel, yazıcıyı **ada bağlar**: ödeme sonucunu PSP'den ilk öğrenen uç, defteri yazmakla
yükümlüdür (`iyzico-callback` ve iade tarafında `iyzico-refund`). "Sonra bir yerden yazarız"
kabul edilmez — defteri yazmayan bir ödeme yolu, parayı **kanıtsız** hareket ettiriyor demektir.

**Geriye dönük doldurma YOK.** Mevcut 5 siparişin PSP yanıtları elde değil (Edge logları 24
saatlik pencereyi aştı). Uydurma kayıt, defterin amacını baştan bozar.

## 5. Kapı — ve niçin bu PR'da değil

Bir cetvel, onu zorlayan bir test olmadan **yalnız metindir**. Bu cetvelin kapısı
`INV-LEDGER-1` olacaktır: **§2'deki sözlük ile canlı CHECK kısıtı birebir aynı olmalı.**

Bu kapı **bilerek bu PR'da değil**, migration PR'ındadır. Gerekçe ölçülmüştür: canlı kısıt
bugün hâlâ eski sözlüğü (`success`/`cancelled`) taşıyor. Kapıyı şimdi eklemek iki kötü
seçenekten birini üretirdi — ya **bilinçli kırmızı** (master'ı kırar), ya da kısıtı okumayan
**boş bir test** (yeşil ama hiçbir şey ölçmüyor). İkisi de kabul edilmez; kapı, zorladığı
gerçek aynı anda inmelidir.

## 6. Uygulama sırası (Recep kararı, OPS sıralaması)

> ⚠ **Bu bölüm 2026-08-23 akşamı ÖLÇÜMLE yeniden yazıldı.** İlk hâli "migration + yazıcı
> **aynı PR**'da insin" diyordu ve bu **yetmiyor** — gerekçesi hemen aşağıda. Cetvelin
> kendisiyle çelişmemesi için sıra iki adıma bölündü.

### 6.0 Neden aynı PR yetmiyor — ÖLÇÜLDÜ

`master`'a bir push, **iki ayrı iş akışını PARALEL** tetikler ve aralarında **sıra garantisi yoktur**:

| İş akışı | Neyi canlıya taşır | Tetikleyici |
|---|---|---|
| `supabase-migrate.yml` | DB şeması | `supabase/migrations/**.sql` yolu |
| `deploy-functions.yml` | Edge Function kodu | değişen fonksiyonlar |

Yani "aynı PR" yalnız **niyeti** birleştirir, **canlıya iniş ânını** birleştirmez. Arada bir
pencere vardır ve `venthub_orders.currency` için **iki yön de kırıyor**:

- **migration önce inerse** → eski fonksiyon `currency` göndermez → `NOT NULL` ihlali → sipariş oluşturma **500**.
- **fonksiyon önce inerse** → kolon henüz yoktur → PostgREST "column does not exist" → yine **500**.

Üçüncü ölçüm tuzağı kapatıyor: `iyzico-payment/index.ts`'te zaten bir şema-sapması yakalama kolu
**var** (satır ~502–520), ama regexi **yalnız** `shipping_method` ile eşleşiyor — `currency`
hatasında **devreye girmez**, sert 500 döner. Bu, kodun varlığına değil **regexin kapsamına**
bakılarak doğrulandı.

> **KURAL (bu cetvelin dışına da geçerlidir):** migration ile onu tüketen kod **aynı PR'da olsa
> bile**, şema değişikliği **yazıcıya geriye uyumlu** olmak zorundadır — *genişlet, sonra daralt*
> (expand-contract). "Aynı PR" bir dağıtım garantisi değildir.

### 6.1 Adımlar

1. **Bu cetvel** (docs, migration yok) — *inmiş durumda* (#795, merge `98bc08ba`).
2. **ADIM-1 — genişlet** (migration + yazıcı + kapı, tek PR, **merge = Recep**):
   - `venthub_orders.currency text NOT NULL **DEFAULT 'TRY'**` — varsayılan **bilerek** var:
     eski yazıcı da yeni yazıcı da çalışır, pencere kapanır.
   - `iyzico-payment` `orderData`'sı `currency`'yi **açıkça** gönderir.
   - Şema-sapması kolunun regexi `currency`'yi de kapsar (yalnız ADIM-1 penceresi için; ADIM-2'de kaldırılır).
   - **Sözlük CHECK genişletme** (§2) + **`CASCADE → RESTRICT`**. İkisi de burada, çünkü
     `payment_transactions` **0 satır** ve kod tabanında **hiç yazıcısı yok** (ölçüldü) —
     geriye uyumluluk sorunu üretmiyorlar.
   - **`INV-LEDGER-1` kapısı** burada iner: §5'in kuralı "kapı, zorladığı gerçek aynı anda
     inmelidir" der; sözlük kısıtı bu adımda indiği için kapısı da bu adımda olmalıdır.
     Kapı **statiktir**: §2 tablosu ile migration SQL'indeki CHECK listesi birebir eşitlenir
     (canlı DB'ye sormaz → CI'da deterministik).
3. **ADIM-2 — daralt** (ayrı PR, **merge = Recep**). Yalnızca ADIM-1'in **her iki tarafının da
   canlı olduğu ÖLÇÜLDÜKTEN** sonra:
   - `DEFAULT 'TRY'` düşürülür — `venthub_orders.currency`, `payment_transactions.currency`
     **ve** `venthub_order_items.display_currency` (sessiz varsayılan **üç** kolonda).
   - Şema-sapması kolunun `currency` dalı kaldırılır (geçici koltuk değneğiydi).
4. **Yazıcı**: `iyzico-callback` ve `iyzico-refund` defteri yazar; `payment_status` türetilir.
   **Aynı adımda** `trg_sync_payment_status_*` tetikleyicisinin kapsamı daraltılır ya da kaldırılır
   (§7 #8) — ikinci otorite ayakta kalırken defter otorite olamaz.

### 6.2 ADIM-2 ne zaman güvenli — KANIT TANIMI

"Bir süre geçti" kanıt değildir. ADIM-2 ancak şu **üçü birden** ölçüldüğünde açılır:

1. ADIM-1 merge commit'inde **`supabase-migrate.yml` ve `deploy-functions.yml` iş akışlarının
   İKİSİ de `success`** (biri `skipped` ise bu şart **sağlanmamıştır**).
2. **Canlı fonksiyon sürümü** ADIM-1'i içeriyor — prod'daki `iyzico-payment` sürüm numarası
   deploy sonrası **artmış** olmalı (repo ile prod sapma işi bunu zaten ölçüyor).
3. **Kolon canlıda var**: `venthub_orders.currency` DB'de sorgulanarak doğrulanır.

⚠ `venthub_order_items.display_currency` ve `payment_transactions.currency` bu üç şarta
**bağlı değildir** — orada varsayılanı düşürmek tek başına güvenlidir (ilkinde yazıcı zaten
`display_currency: 'TRY'` gönderiyor, satır 674; ikincisinde **yazıcı yok**). ADIM-2'de
birlikte inmelerinin tek sebebi, üç kolonun **aynı sınıf** olması ve tek yerde bitmesidir.

## 7. ÇELİŞEN-MEVCUT

| # | Çelişen şey | Nerede | Çözüm |
|---|---|---|---|
| 1 | `payment_transactions.status` CHECK'i `success`/`cancelled` diyor, §2 `captured`/`voided` diyor | Canlı kısıt | Migration (adım 2). O ana kadar **cetvel ile DB çelişir** ve bu bilerek yazılıdır |
| 2 | `currency DEFAULT 'TRY'` — **iki** kolonda | `payment_transactions.currency` (`text`), `venthub_order_items.display_currency` (`char(3)`) | Varsayılan kalkar. #709'da tek kolon sanılmıştı; ölçünce iki çıktı |
| 3 | `venthub_orders`'ta para birimi kolonu **YOK** | Canlı şema | Eklenir (adım 2). Bugün sipariş toplamının birimi **hiçbir yerde yazılı değil** — satır düzeyinde var, sipariş düzeyinde yok |
| 4 | `ON DELETE CASCADE` para hareketi kaydını siler | `payment_transactions_order_id_fkey` | `RESTRICT` |
| 5 | `updated_at` kolonu append-only ilkesine aykırı sinyal veriyor | Canlı şema | Kolon kalacaksa **gerekçesi yazılmalı**; defter satırı güncellenmez |
| 6 | `admin-iyzico-reconcile` mutabakatı **türetilmiş özete** karşı yapıyor | Edge fonksiyonu | Defter dolunca asıl kaynak defter olmalı |
| 7 | `checkout-payment-standard.md` ödeme cetveli sayılıyor ama defteri kapsamıyor | Komşu cetvel | Bu dosya o boşluğu doldurur; komşuya çapraz atıf eklenmeli |
| 8 | ⭐ **İkinci otorite:** `trg_sync_payment_status_ins/upd` tetikleyicisi `status='confirmed'` görünce `payment_status='paid'` yazıyor — defterden bağımsız | Canlı tetikleyici (ölçüldü) | §2'nin "tek yönlü eşleme" kuralı bugün sağlanmıyor. Yazıcı inince kapsam daraltılır ya da kaldırılır → **migration, Recep kapısı**. Dolu değeri ezmediği için (T114) bugün **veri kaybı üretmiyor**; ürettiği şey **kanıtsız `paid`** |

## 8. Ölçülen, karara bağlanmamış

- **`order_id` NULLABLE.** Ön-otorizasyon ya da sipariş oluşmadan başlayan bir akış varsa
  nullable doğrudur; yoksa yetim satır riskidir. Defter **0 satır** olduğu için davranışsal
  kanıt yok. Kararı, yazıcı inerken **ödeme akışının gerçek sırası ölçülerek** verilecek:
  sipariş mi önce oluşuyor, ödeme kaydı mı?


---
# FILE: docs\standards\pricing-standard.md

# VentHub Fiyatlandırma Standardı (Cetvel) — v1.1

> **Bu dosya nedir?** "Bir satış sitesinde fiyat nasıl kurulur?" sorusunun **karar veren cetveli.**
> Alış fiyatı + satıcı kârı; **üründe / markada / kategoride farklılaşan** marj; çoklu-para-birimi (USD/EUR/TRY)
> al-sat + ayarlanabilir parite + çapraz çevrim; KDV'li/KDV'siz satış — hepsi **admin-konfigüre.**
> Dünya-standardı e-ticaret platformlarının (Odoo, SAP, Salesforce CPQ, Magento, Shopify, BigCommerce)
> mekanikleri araştırılıp VentHub'ın **canlı şemasına** ve bayi yol haritasına (`dealer-module-blueprint.md`
> R0–R5→B1–B2) oturtuldu.
>
> **Neden var?** Bugün fiyat **amatör**: `product_prices` = 0 satır, çözücü bozuk (staff-rolünü segmente
> bağlıyor → her ürün düz `products.price`), currency/kur/KDV/kâr alanı yok. Bu cetvel, full ürün
> yüklemesinden **önce** kurulması gereken omurgayı tanımlar.
>
> ### ⚠️ v1.1 (2026-08-14) — çürüyen varsayım: "elimizde alış maliyeti var"
>
> v1.0 boyunca `products.purchase_price` **alış maliyeti** sanıldı. Kaynak doğrulandı: alan,
> **AVenS Ürün Fiyat Kataloğu 2026.1**'den geliyor — yani Avensair'in **müşteriye satış / liste**
> fiyatı (EUR, KDV hariç, depo teslim, *"TCMB Efektif Satış Kuru geçerlidir"*). Recep'in beyanı
> (2026-08-14): *"elimde alış fiyatları yok; o fiyatlar liste fiyatları yani iskontosuz; ben sonra
> o fiyatlardan iskonto alacağım."*
>
> **Sonuçlar (bu sürümün omurgası):**
> 1. Bugün sistemde **maliyet yok, LİSTE var** → §2 iki tabana bölündü (liste ≠ maliyet).
> 2. Liste EUR çapalı ve kur her gün değişiyor → `cost_in_base` **donmuş değil, türetilmiş**tir;
>    tazeleme sözleşmesi §8'de.
> 3. Geçiş kurulumu: **global kural = maliyet+marj %0** → vitrin fiyatı = katalog fiyatı + KDV.
>    Gerçek marj, gerçek alış maliyeti geldiğinde (**T010 satınalma**) anlam kazanır.
> 4. Maliyet-tabanlı her koruma (zarar eşiği, marj kelepçesi) bugün **ölçüsüzdür** — T010'a bağlıdır.

---

## 1. Temel model — üç katman (karıştırma)

Fiyat tek bir sayı değil, **üç katmanın** üst üste binmesidir. Hangi katmanda olduğunu bilmeden tartışma çıkmaz.

| # | Katman | Ne yapar | "Standart/sabit" mi? | Durum |
|---|---|---|---|---|
| **1** | **Maliyet-artı marj motoru** | Alış (orijinal para) × kur × (1+marj) [+KDV] → **liste/base satış fiyatı**. Marj ürün/marka/kategori/global önceliğiyle çözülür. | Otomatik (kur bile elle ezilebilir) | **YOK — bu cetvelle kurulacak** |
| **2** | **Segment overlay** (fiyat listesi) | Perakende/bayi/kurumsal **tier**'a göre farklı fiyat/iskonto. Mevcut `price_lists`/`product_prices`. | Admin kurar, kademeli | **VAR ama bozuk** → R0–R5 onarır |
| **3** | **Teklif (CPQ)** | B2B pazarlıklı satış: RFQ→Teklif→Sipariş, 8 fiyat kademesi, onay eşiği. | **Hayır — teklif başına karar** | YOK (dealer §5'te spec'li, gelecek faz) |

**Altın kural:** Fiyat **TÜRETİLİR, elle yazılmaz.** Maliyet-artı ürünlerde satış fiyatı motorun çıktısıdır;
saklanan değer bir **materialize cache**'tir (maliyet/kur/marj/KDV değişince yeniden hesaplanır). Bu, bugünkü
düz `products.price` (elle-yazılı tek TL) modelinin **tam tersi** ve Magento/Shopify/BigCommerce/Woo'nun
amatör tarafından ayrıldığımız nokta — onlarda maliyet pasif bir rapor alanı, fiyat elle yazılır.

---

## 2. Fiyat tabanı — İKİ ayrı taban (v1.1'de bölündü)

Motorun beslendiği taban tek değildir. **Liste fiyatı ile alış maliyeti aynı alan olamaz** — v1.0'ın
tek-alan varsayımı bugünkü sessiz yanlışın kaynağıydı.

| Taban | Nedir | Kur rolü | Bugünkü durum |
|---|---|---|---|
| **A · Liste fiyatı** (`list`) | Tedarikçinin/üreticinin **yayınlanmış satış fiyatı**, iskontosuz. Bizim iskontomuz da müşteri iskontosu da bunun üstünden konuşulur. | **Canlı** gösterim kuru — liste EUR çapalıysa TL her gün türetilir, DONMAZ | **VAR** — `products.purchase_price` + `purchase_currency` fiilen bunu taşıyor (AVenS Katalog 2026.1) |
| **B · Alış maliyeti** (`cost`) | Fiilen ödenen tutar = liste − alınan iskonto zinciri (ör. %30+%10). | **Donmuş** tedarik kuru — alış anında snapshot'lanır, sonradan oynamaz | **YOK** — satınalma modülü (**T010**) ile gelecek |

- **Bugünkü geçiş (dürüst kayıt):** `cost_in_base` alanı adı gereği maliyet der, **fiilen liste fiyatının
  TL karşılığını** taşır ve `refreshCostInBase` tarafından güncel TCMB kuruyla **her tazelemede yeniden
  hesaplanır**. Bu bilinçlidir (liste EUR çapalı); v1.0'ın "donmuş TL maliyet" ifadesi **geçersizdir**.
- **T010 geldiğinde:** `list_price_original`/`list_currency` (canlı kur) ile `purchase_cost`/
  `purchase_rate_to_base` (alış-anı snapshot) **ayrı alanlara** ayrılır; `cost_in_base` yalnız B tabanını
  taşır ve o zaman gerçekten donar. Bu ayrım yapılmadan marj/zarar korumaları ölçüsüzdür.
- **İki kur rolü asla birleşmez** (§4): *tedarik kuru* (alış→TL maliyet, alışta snapshot) ile *gösterim kuru*
  (TL base→USD/EUR vitrin, canlı) **farklı sayılardır.** ⚠️ **Bilinen sapma:** bugün `currency_rates` tek
  satır kümesiyle her iki rolü de besliyor (rol ayrımı kolonu yok) — T010 ile `rate_role` eklenecek.

---

## 3. Marj kuralı motoru + ÖNCELİK merdiveni ⭐ (cetvelin kalbi)

Senin sorunun cevabı: **"marj üründe/grupta/markada nasıl farklılaşır?"** → tek bir kural motoru + en-özel-kazanır merdiveni.

### 3.1 Öncelik (specificity) merdiveni — en özel kazanır
Bir ürüne birden çok kural uyduğunda **en özel olan kazanır, ilk eşleşmede durur** (Odoo `applied_on` +
SAP `Exclusive` stop-at-first-hit deseni):

```
scope 0  ürün varyantı     (en özel)
scope 1  ürün
scope 2  MARKA              ← HVAC için birinci sınıf (Vortice vb.); incumbent'lerde yok
scope 3  kategori/grup      (hiyerarşik — alt kategorilere CASCADE eder)
scope 4  global varsayılan  (en genel)
```

**Sıralama anahtarı:** `scope ASC, (dealer-kitabı önce), min_quantity DESC, priority DESC, id DESC` → ilk satır kazanır.

### 3.2 Bu merdiven "üründe/markada/kategoride farklılaşma"yı bedavaya çözer
- **"X kategorisindeki tüm ürünler %35 marj"** = TEK kural `{scope:3, category_id:X, margin_pct:35}`. Alt
  kategorilere materialized-path ile cascade eder. Ürün başına satır gerekmez.
- **"Y markası %40"** = TEK kural `{scope:2, brand_id:Y, margin_pct:40}`. X kategorisinde + Y markasında bir
  ürün → **marka (scope 2) kategoriyi (scope 3) yener** → otomatik %40.
- **Ürüne özel override** = `{scope:1, product_id:P, margin_pct:28}` → hem markayı hem kategoriyi yener,
  onlara dokunmadan. Silinince anında marka/kategori kuralına geri-cascade.
- **Admin UX:** ürün başına **etkin** marjı gösteren bir matris + hangi kuralın kazandığı rozeti
  ("kategori varsayılanı %35" vs "ürün override %28") → admin cascade'i görür, satır-içi ezer. Incumbent'lerin
  düz per-SKU editöründen ayıran enterprise fark budur.

### 3.3 Hesap modu (Odoo `compute_price`/`base` + Salesforce method)
Kural başına: `method ∈ {cost_plus, fixed, percent_off_list}`, `base ∈ {cost, list_price, parent_book}`,
`margin_pct` (cost-plus markup), `surcharge` (sabit ek), `fixed_price`, marj tavanı/tabanı (`min/max_margin`).

---

## 4. Para birimi + parite (çoklu-para, çapraz, ayarlanabilir)

- **Base (operasyon/muhasebe) para birimi = TRY.** Fatura, KDV, tahsilat TL; muhasebe gerçeği TL.
- **İki ayrı kur rolü (birleştirme):**
  1. **Tedarik kuru** (alış→TL maliyet): alış kaydedildiğinde **TCMB Efektif Satış** snapshot'lanır, donar.
     (Avensair fiyat listesi EUR'u **TCMB Efektif Satış Kuru** ile faturalar → maliyet bu kurla TL'ye sabitlenmeli;
     "Döviz Satış" DEĞİL — efektif=fiziki/banknot satış, Avensair'in ticari konvansiyonu.)
  2. **Gösterim kuru** (TL base→USD/EUR vitrin): canlı TCMB + admin **spread** (marka payı), yuvarlamadan önce.
- **Çapraz işlem** (EUR alış → TL veya USD satış): EUR maliyet → ×tedarik_kuru → TL maliyet → ×(1+marj) → TL net
  → vitrin için TL→USD canlı çevrim. **Marj TEK para biriminde (TL) bir kez hesaplanır** — EUR'da ve TL'de iki
  kere hesaplanırsa iki farklı cevap çıkar.
- **Kur kaynağı = TCMB** (`https://www.tcmb.gov.tr/kurlar/today.xml`): hafta sonu/tatil **404** döner → **son
  kuru taşı** (sıfırlama/hata yok); iş günü kuru **~15:30 sonrası** yayınlanır → cron 15:30 sonrası.
- **`currency_rates` tablosu append-only:** `(base_ccy, quote_ccy, rate, spread_pct, source, effective_date,
  fetched_at)`. **Elle ezme = yeni satır** (`source='manual'`, daha yüksek öncelik) — yerinde mutasyon YOK
  (denetim izi korunur). Bu, "ayarlanabilir parite" gereksinimini denetlenebilir kılar.
- **Sipariş anında kur DONDURULUR:** order satırına kullanılan **kur skaler olarak kopyalanır** (FK değil) →
  geçmiş sipariş toplamları sonradan kaymaz. (Tarihsel-kur yöntemi, evrensel muhasebe standardı.)

### 4.1 Çoklu-para birimi satış sözleşmesi (v1.1)

- **İşlem para birimi daima TRY.** Tahsilat (İyzico), fatura, KDV, iade TL üzerindendir. EUR/USD gösterimi
  **yalnız vitrin bilgilendirmesidir**; etikette bu açıkça belirtilir.
- **Sipariş satırı kur snapshot'ı ZORUNLU:** `display_currency` + `display_rate` + `rate_effective_date`
  sipariş kalemine kopyalanır. §13'teki snapshot listesi bu nedenle **6 → 9 alana** çıkarıldı.
  ✅ **W2b-2'de kapandı** (`20260815210000_pricing_w2b2_order_item_snapshots.sql`): üç alan eklendi,
  9 alanın 8'i **NOT NULL**'a çekildi (`price_list_id_snapshot` bilerek nullable — fiyat bir listeden
  değil kuraldan/tekliften gelebilir), bekçisi **INV-PRICE-3**.
  > **Niçin o gün yapıldı:** tablo o an BOŞTU (0 satır, 2026-08-15'te ölçüldü), yani geri-doldurma
  > gerekmedi ve kolonlar NOT NULL'a çekilebildi. İlk gerçek sipariş girdikten sonra aynı sertleştirme
  > migration + backfill + kesinti işine dönerdi. Zamanlama tesadüf değil, pencere buydu.
- ⚠️ Bu alanlar şu an **TRY/1.0/sipariş tarihi** ile yazılıyor: gösterim para birimi seçimi henüz
  hiçbir yüzeyde yok (W5). Alanların erken açılmasının sebebi, W5 geldiğinde geçmiş siparişlerin
  her kur hareketinde yeniden değerlenmesini önlemek.
- **İade daima orijinal TL tutarından** hesaplanır (gösterim para birimi iadeyi belirlemez).
- ⚠️ **Bilinen sapma (v1.1):** `spread_pct` üç yerde duruyor (`currency_rates.spread_pct`,
  `site_settings.pricing.display_spread_pct`, admin panelinde salt-okunur kart) ama **hiçbir hesaba girmiyor**
  — gösterim çevrimi ham `net / rate`. Ya uygulanır ya cetvelden düşer; "duran ama işlemeyen ayar" kabul edilemez.

---

## 5. KDV (%20) — net sakla, çift mod

- **Tek gerçek = NET (KDV-hariç) fiyat.** Marj net üzerine, KDV netin üstüne biner; net tek rate-stabil ve
  iade-edilebilir figür. Gross'tan net türetmek (`gross/1.20`) her okumada yuvarlama kaybı doğurur.
- Formüller (faktör 1.20): `gross = net × 1.20` · `net = gross / 1.20` · `kdv = net × 0.20`.
- **Sıra: maliyet → +marj → NET → +KDV → GROSS.** KDV asla marj hesabına girmez (devlete pass-through, gelir değil).
- **Çift mod (B2C vs B2B):**
  - **B2C (tüketici):** **KDV-dahil (gross)** göster (Türk perakende konvansiyonu + yasal "etiket = ödenecek").
  - **B2B (bayi/Avensair):** **KDV-hariç (net)** göster; KDV faturada **ayrı satır** (Türk yasası: ticari
    faturada KDV tutarı ayrı gösterilmek zorunda; e-Fatura/e-Arşiv XML toplamlarıyla **birebir** uyuşmalı).
  - Tek `display_tax_mode = inclusive|exclusive` bayrağı aynı saklanan net üzerinden audience'a göre render eder.
- **KDV ORANININ SSOT'u = ürün** (v1.1 kararı). Canlı şemada `products.tax_rate numeric NOT NULL DEFAULT 20.00`
  ve `products.is_taxable boolean NOT NULL DEFAULT true` **zaten var**; motor ise oranı `pricing_rule.vat_rate_pct`
  üzerinden okuyordu → **iki rakip KDV kaynağı**. Kural:
  1. Oran **üründen** okunur (`is_taxable = false` → KDV yok, gross = net).
  2. `pricing_rule.vat_rate_pct` **yalnız bilinçli override**tir; `NULL` = "üründen oku" (varsayılan).
  3. Tek oran varsayımı (%20) yasaktır: Türkiye'de %1/%10/%20 dilimleri var; bazı HVAC kalemleri %10 olabilir.
  - Zorlayan test: **INV-PRICE-5** (§14).

---

## 6. Yuvarlama (per-currency, en SON)

- **Para ondalık-kesin (`numeric`) saklanır; float (`real`/`double precision`) YASAK** — 0.1 binary'de temsil
  edilemez, hata birikir. Uygulanan biçim: DB'de `numeric(14,4)` (kur için `numeric(18,6)`), hesapta tek
  yuvarlama sınırı. *(v1.1 düzeltmesi: v1.0 "tamsayı-minor ×100 sakla" diyordu — ne şema ne kod böyleydi;
  cetvel hiçbir yerde geçerli olmayan bir kural yazıyordu. Tamsayı-minor göçü istenirse ayrı iş emri olur,
  "zaten kural" gibi davranılamaz.)* Precision ISO 4217'den (minor-unit exponent) türetilir, 2 sabitlenmez.
- **En son, her para sınırında bir kez yuvarla** (round-half-up). Tam precision'ı zincir boyunca taşı, yalnız
  saklanan/gösterilen para değerine inerken yuvarla.
- **Charm/yuvarlama per-kategori/per-tenant POLİTİKA** (global sabit değil): premium ürün yuvarlak (₺100),
  perakende `,90`/`,95`. Tüm maliyet/marj/iskonto matematiğinden **sonra** uygulanır.
- **e-Fatura mutabakatı:** `gross = net + yuvarlanmış_KDV` (gross'u bağımsız yuvarlama, yoksa net+kdv≠gross →
  XML reddi). Satır-bazında yuvarla, sonra topla; tolerans dokümante et.

---

## 7. Hesaplama hattı (kesin sıra — tek doğru)

```
1. purchase_price (EUR, minor int)                         [saklı, kesin]
2. × tedarik_kuru (EUR→TRY, snapshot, yüksek precision)    → cost_in_base (TL, yuvarlama YOK)
3. × (1 + margin_pct)   [marj kuralı motoru §3'ten]        → net_sale_base (TL, tam precision)
4. YUVARLA #1 → net_unit (TL kuruş)   [+ ops. charm snap]  ← ilk para sınırı
5. kdv = YUVARLA(net_unit × 0.20)  ;  gross = net_unit + kdv   (gross yeniden yuvarlanmaz)
6. Vitrin (USD/EUR): zaten-yuvarlanmış base'i çevir:
     net_present = YUVARLA(net_unit × gösterim_kuru × (1+spread))
7. Fatura toplamı = Σ yuvarlanmış satır net + Σ KDV + Σ gross.
```
TL faturası **yasal otorite**; USD/EUR açıkça "tahmini" gösterim.

---

## 8. Segment overlay — mevcut `price_lists`/`product_prices` (R0–R5 onarır)

- **Bu katman ZATEN VAR ama bozuk.** `price_lists` (3 satır, `user_type` segment) + `product_prices`
  (**0 satır**) + `organizations.tier_level`. Çözücü (= `getEffectivePriceInfo`/`getEffectiveUnitPrice` @
  `src/lib/services/pricing.service.ts`, DI-uyumlu) `user_profiles.role`'u (staff-yetkisi) segmente bağlıyor →
  asla tutmuyor → düz `products.price`. (Motor VAR; sale_price/discount_percentage/effective-dating dahil —
  yeniden yazma, tier_level'a çevir + §3–5 katmanlarını ekle.)
- **Doğru sözleşme:** segment = `organizations.tier_level` (role DEĞİL). `user → organization → tier_level →
  price_list → product_prices` → bulunamazsa maliyet-artı motor çıktısı (§3). (Karar: dealer-blueprint §2, B-minimal.)
- **`product_prices` = motor çıktısının materialize cache'i:** `(product, price_list, currency)` başına net+gross.
  Motor yazar, çözücü okur. Boş tablonun anlamı buydu — seed (B2) bu cache'i doldurur.

### 8.1 Cache sözleşmesi (v1.1 — seed'den ÖNCE uyulması zorunlu)

1. **Tekil anahtar para birimini İÇERİR:** `(product_id, price_list_id, currency, valid_from)`.
   ⚠️ Canlı indeks v1.1 öncesi `currency`'siz kuruldu (`product_prices_unique`) → aynı ürünün EUR ve TRY
   satırı fiziksel olarak yan yana duramıyordu. "Ürün/grup bazında para birimi" gereksiniminin ön koşulu budur;
   **tablo boşken düzeltilir**, dolduktan sonra göç acılıdır.
2. **Elle-ezme dokunulmazdır:** `is_derived = false` satırlar **motor tarafından ASLA üzerine yazılmaz/silinmez**.
   Materialize yalnız `is_derived = true` satırları tazeler. (Fiyat dondurmanın taşıyıcısı bu bayraktır — §8.2.)
3. **Tazelik sözleşmesi:** cache satırı `computed_at` taşır. TCMB senkronundan sonra zincir
   `refreshCostInBase → etkilenen ürünler için materialize` otomatik koşar; **elle tetiklemeye bırakılmaz**
   (bırakılırsa vitrin her gün dünkü kuru gösterir ve kimse fark etmez). N saatten bayat satır admin panelinde uyarı üretir.
4. **Cache adet-boyutsuzdur:** materialize `quantity = 1` ile koşar. Bu nedenle `min_quantity > 1` kuralı
   **sepet/checkout runtime `resolvePrice` yolunu çağırana kadar YAZILMAMALIDIR** — bugün girilirse hiçbir
   yüzeyde görünmez (sessiz ölü kural).

### 8.2 Fiyat kilidi (dondurma) — v1.1

Kur oynasa da fiyatın sabit kalması **birinci sınıf gereksinimdir** (Recep, 2026-08-14), yalnız gösterim
numarası değil:

- **Kilit = kapsam bazlı politika** (ürün / marka / kategori / global — §3 merdiveniyle aynı özgüllük sırası).
- Kilitli kapsam **hem `refreshCostInBase` hem materialize tarafından ATLANIR.** Yalnız gösterimi dondurup
  maliyet tazelemesini serbest bırakmak yetmez: ertesi gün marj kelepçesi fiyatı yine oynatır.
- Kilit kaydı **kimin, ne zaman, hangi kurdan** dondurduğunu taşır (`frozen_at`, `frozen_by`, `fx_frozen_rate`);
  kilit açma `admin_audit_log`'a yazılır.
- Uygulama biçimleri: (a) `method='fixed'` kural — hesaplanan fiyatı tek tıkla sabit kurala çevirir;
  (b) `is_derived=false` elle-ezme satırı — tek üründe nokta atışı.

✅ **W5'te CANLI** (`20260816120000_pricing_w5_policy_fx_lock.sql`, bekçi **INV-PRICE-7**):
`pricing_policy.fx_lock` + künye kolonları; kilit **zincirin iki halkasında da** uygulanıyor
(`refreshCostInBase` ve `materializePrices`, ayrı `skippedFxLocked` sayaçlarıyla).

> **En özel kazanır, kilidin VARLIĞI değil DEĞERİ belirler.** Daha özel bir `fx_lock=false`
> politikası, daha genel bir kilidi bozar — "global kilit ama şu ürün hariç" ifade edilebilmeli.
> Bu en kolay yanlış uygulanacak kural (`policies.some(p => p.fx_lock)` yazmak yeterli), o yüzden
> INV-PRICE-7'de ayrı bir davranış testi var.
>
> **Sessiz atlama yasak.** Dondurma bir KARARdır: "kur değişti ama 40 ürün güncellenmedi" panelde
> görünmezse "bu fiyat neden değişmedi" sorusu cevapsız kalır. İki özet de `skippedFxLocked` taşır.
>
> **Kilit künyesiz olamaz** — DB CHECK'i `fx_lock=true` iken `fx_frozen_rate` zorunlu kılar.

⏳ **Henüz yok:** kilit açma/kapama admin yüzeyi ve `admin_audit_log` kaydı (yüzey ADMIN
şeridinde). Bugün politika satırı yalnız DB'den girilebilir.

#### 8.2.1 Admin yüzeyi sözleşmesi (PRICING kararı, 2026-08-17)

Yüzeyi ADMIN şeridi yazar; **semantik burada tanımlıdır** ve UI ondan türetilir. Üç soru
ADMIN-CUSTOMER tarafından soruldu; cevapları bağlayıcıdır.

**[A] `fx_frozen_rate` ELLE GİRİLMEZ — UI kilit anındaki kuru ENSTANTANE alır.**
Kilit bir *zaman* kararıdır ("bu andaki kur sabitlensin"), fiyat pazarlığı değil. Elle
giriş yanlış-kur riskini ve denetlenemez bir serbestliği içeri sokar; sözleşmeli özel kur
ayrı bir özelliktir (v2) ve `fx_lock` ile karıştırılmamalıdır.

> **Kaynak sorgusu motorunkiyle BİREBİR aynı olmak zorundadır** — aksi hâlde kilit,
> motorun kullandığından *farklı* bir sayıya kilitler ve fiyat "kilitliyken" bile oynar.
> ✅ **2026-08-17'de YAPIYA ÇEVRİLDİ:** artık "dikkatli kopyala" talimatı yok — kur
> seçimi tek fonksiyondadır: `src/lib/services/fxRate.service.ts` →
> `resolveFxRate(supabase, quoteCcy, today)`. Motor, `resolvePrice` ve admin yüzeyi
> **üçü de onu çağırır**; bekçi **INV-PRICE-8** kopya sayısını 1'de tutar.
> Aşağıdaki sözleşme o fonksiyonun davranışıdır.
>
> Motorun seçimi (`pricingMaterialize.service.ts`, ölçüldü 2026-08-17):
> `currency_rates` → `base_ccy='TRY'` **(filtre ŞART)** + `quote_ccy=<ccy>` +
> `effective_date <= bugün(İstanbul)`, sıralama `effective_date DESC, fetched_at DESC`,
> `limit 1`, alan **`rate`**. **`spread_pct` OKUNMAZ** — UI da okumamalıdır.
> Enstantane alınan değer `fx_frozen_rate`'e yazılır; o anki `effective_date` künyeye not
> düşülür (`note` alanı yeterli, yeni kolon gerekmez).

**[B] Yüzey ham satırları değil ETKİN KİLİDİ gösterir** — ve mantığı yeniden yazmaz.
Merdiven "en özel kazanır" ilkesiyle çalışır ve **daha özel bir `fx_lock=false`, daha genel
bir kilidi bozar** (§8.3). Ham liste bu yüzden yanıltıcıdır: admin global kilit koyar, tek
ürünün oynadığını görür, sebebini bulamaz. Yüzey bir ürün/kapsam için
`resolveFxLockWithPolicies` (toplu: `resolveFxLocks`) **çağırarak** etkin sonucu gösterir ve
`FxLockDecision`'daki `policyId` + `scope` ile **hangi satırın kazandığını** yazar
("etkin: ürün düzeyi politika #… → kilit YOK").

> İkisi de `pricingPolicy.service.ts`'ten **zaten export edilmiştir**; ayrıca açmak
> gerekmez. Merdiveni UI'da tekrarlamak **INV-PRICE-7'nin tek-merdiven kuralını ihlal
> eder** (ikinci `switch (scope)` yasaktır) — yani kopya kapıdan geçmez.

**[C] `skippedFxLocked` sayacı yüzeyde GÖSTERİLİR.** Kilidi görünür kılan tek geri bildirim
odur: "son hesaplamada N ürün kilit yüzünden atlandı". Ayrıca sessiz-arıza kontrolüdür —
aktif kilit varken sayaç sürekli 0 ise kilit uygulanmıyor demektir.

**Migration gerekmez:** izin modeli bugün tutarlı (ADMIN-CUSTOMER ölçümü, 2026-08-17):
`pricing_policy` RLS = `super_admin|admin|moderator` + tenant-scoped; rbac'ta `pricing`
yazma izni admin+moderator → **UI izni ⊆ DB izni**. Satınalmada yaşanan "yetkisi var ama
verisi yok" tuzağı (purchasing-standard §8.1) burada YOK.

**W5 ile çakışma yok:** W5 TAMAMLANDI (`20260816120000_pricing_w5_policy_fx_lock.sql`
prod'da; `pricing_policy` tablosunu zaten o yarattı). Yüzey çalışması beklemez.

**[D] ÇOK PARA BİRİMLİ KAPSAMDA KİLİT ENGELLENİR** (ADMIN-CUSTOMER sorusu, 2026-08-17).

Kilit marka/kategori/global kapsamda birden çok para birimli ürünü kapsayabilir; tek bir
`fx_frozen_rate` o kapsamı **temsil edemez**. Kural:

1. Kilit kaydedilirken kapsamdaki ürünlerin `distinct purchase_currency` kümesi hesaplanır.
2. **Tek** para birimi → o para biriminin kuru `resolveFxRate` ile enstantane alınır.
3. **Birden çok** → kayıt **REDDEDİLİR**; admin'e kapsamı daraltması söylenir.

> **Niçin "uyar ama kaydet" değil.** `fx_frozen_rate` motorda hesaba **girmez** — ölçüldü
> (2026-08-17): `materialize` yalnız `locked` bayrağını okuyup ürünü atlar, `frozenRate`
> sadece `pricingPolicy.service` içinde taşınır. Yani alan **provenanstır**: "bu fiyat neden
> güncellenmedi" sorusunun tek cevabı. Provenans alanına kapsamı temsil etmeyen bir sayı
> yazmak, hesabı bozmaz ama **denetim kaydını yalanlar** — hesap hatasından daha sinsi,
> çünkü hiçbir yerde tutarsızlık üretmez, sadece geriye dönük soruyu cevapsız bırakır.
> "Baskın para biriminin kuru + not" alternatifi bu yüzden reddedildi: bulanık provenans,
> provenans değildir. Ayrıca uyarıp kaydetmek fail-open desenidir (yeni kapıya "uyar-geç"
> modu konmaz).
>
> **Bugün kimseyi bloklamaz:** ölçüm (ADMIN-CUSTOMER, 2026-08-17) 374 ürünün tamamının
> `purchase_currency = EUR` olduğunu, `pricing_policy`'nin 0 satır taşıdığını gösteriyor.
> Yani global kilit bugün tek para birimlidir ve kural sessizce geçer; koruma ilk USD
> ürün girildiği gün devreye girer.

**v1.1 yolu (migration → Recep paketi):** kapsam çok para birimliyken de kilitlenebilmesi
isteniyorsa doğru çözüm "bir sayı seç" değil, `pricing_policy`'ye **`quote_ccy` kolonu**
eklemektir — kilit satırı para birimi başına bir kayıt olur, merdiven aynen çalışır.
Bu, kolonu tüketicisiyle birlikte açma ilkesine de uyar (§8.3 kapsam kararı).

#### 8.2.2 `base_ccy` bütünlüğü — kalan DB adımı (PLAN, Recep paketinde)

Çözücü artık `base_ccy='TRY'` filtresini uyguluyor, yani **okuma tarafı güvende**. Ama
tablonun kendisi hâlâ TRY-dışı tabanlı satır kabul ediyor: `currency_rates.base_ccy`
üzerinde CHECK **yok** ve `source='manual'` serbest. Bugün zarar üretmiyor (2026-08-17
ölçümü: 6 satırın hepsi `base_ccy='TRY'`) — ama bu, kusurun *yokluğu* değil, verinin
şimdilik uyumlu olması.

**Planlanan (migration → kural 13, Recep onayı):**
1. `alter table public.currency_rates add constraint currency_rates_base_try check (base_ccy = 'TRY')`
   — v1'de motor yalnız TRY tabanlı çalışıyor; çoklu-taban gerçek bir ihtiyaç olduğunda
   kısıt gevşetilir ve **çözücü ile birlikte** tasarlanır.
2. Uygulamadan önce `select distinct base_ccy from currency_rates` ile **yeniden ölçüm**
   (bugünkü 6 satır ölçümü uygulama gününde bayat olabilir).
3. Kısıt eklenince `tcmb-rates-sync` yazma yolunun hâlâ geçtiği doğrulanır (pozitif çapa).

> Bu adım okuma kusurunu kapatmaz — **onu kod zaten kapattı**. Kısıtın işi, ileride
> yanlış tabanlı bir satırın tabloya *girmesini* engellemek.

### 8.3 Politika katmanı — kural ≠ politika (v1.1)

`pricing_rule` **nasıl hesaplanacağını** taşır; "bu markanın fiyatları EUR gösterilsin", "bu tedarikçi
kur değişiminden etkilenmesin", "bu kapsamda minimum marj %X" gibi **ayarlar** kuralın işi değildir.
Bunlar için aynı özgüllük merdivenini kullanan ikinci bir katman tanımlanır:

```
pricing_policy(scope, target_id, display_currency, fx_lock, min_margin_pct, ...)
```

- Merdiven §3.1 ile birebir aynıdır (en özel kazanır) — ikinci bir öncelik mantığı icat edilmez.
  ✅ **W5'te uygulandı ve KİLİTLENDİ:** hedef eşleşmesi tek bir fonksiyonda
  (`scopeMatchesProduct`, `pricing.service.ts`); hem `ruleMatchesProduct` hem politika çözücü
  onu çağırır. INV-PRICE-7 politika servisinin kendi `switch (x.scope)` bloğunu yazmasını
  **yasaklar** — iki kopya, bir gün ayrışacak iki mantıktır.

> **W5 KAPSAM KARARI — tablo bilerek DAR açıldı.** Yukarıdaki imzada `display_currency` ve
> `min_margin_pct` var; canlı tabloda **yok**, yalnız `fx_lock` ve künyesi var. Sebep: onları
> okuyan tüketici henüz yazılmadı. Bu depoda tam o hata tekrarlıyor — `venthub_order_items`
> snapshot kolonları bir yıl boş durdu (W2b-2) çünkü "kolon eklemek" ile "sözleşme kurmak"
> aynı sanıldı. **Alan, tüketicisiyle birlikte gelir.**
- **Tedarikçi boyutu:** şemada tedarikçi tablosu YOK (`products.supplier_name` serbest metinden ibaret).
  Tedarikçi-bazlı politika **T010 satınalma** ile gelir; o zamana kadar marka kapsamı vekildir.
- **Marka boyutu kırılgan:** `products.brand` TEXT, `pricing_rule.brand_id` ise `brands(id)` FK'si — köprü
  **isim eşleşmesi** üzerinden kuruluyor. İsim/boşluk/harf farkı = marka kuralı **sessizce eşleşmez**.
  `products.brand_id` FK'si marka-bazlı ayarların ön koşuludur; o gelene kadar materialize raporu
  "markası köprülenemeyen ürün" sayacını **göstermek zorundadır**.
- **RLS segment daraltması (R5, B2'den ÖNCE zorunlu):** `price_lists`/`product_prices` SELECT'ine segment
  koşulu; yoksa bayi fiyatı anon'a sızar.

---

## 9. Teklif (CPQ) katmanı — referans, gelecek faz

Asıl B2B satış burada (`dealer-network-standard.md §5/§6`): **RFQ → Teklif (temsilci pazarlık) → Sipariş.**
8 fiyat kademesi (Liste→Normal→Müşteri→Partner→Net), **onay eşiği** (marj/iskonto sınırını aşan teklif çok-seviyeli
onaya), monoton durum, proje/BOM (MTO→BOQ→BOM). **DB'de teklif tablosu YOK** → ayrı faz. Bu cetvelin katman 1–2'si
teklifin **girdi fiyatını** üretir; teklif onları pazarlıkla ezer.

---

## 10. Veri modeli (öneri — canlıya additive)

```sql
-- Maliyet (para-birimi-spesifik, zaman-versiyonlu). products genişletilir veya ayrı tablo:
ALTER TABLE products ADD COLUMN purchase_currency char(3);          -- 'EUR'|'USD'|'TRY'
ALTER TABLE products ADD COLUMN purchase_rate_to_base numeric(18,6);-- alışta snapshot TCMB
ALTER TABLE products ADD COLUMN cost_in_base numeric(14,4);         -- türetilmiş, donmuş TL
-- (margin_pct ürün-bazlı override pricing_rule scope:1 ile; products'a koyma — motor SSOT)

-- Marj kuralı motoru (Odoo pricelist.item + scope specificity + SAP exclusive)
CREATE TABLE pricing_rule (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL,
  price_book_id uuid NULL,           -- NULL=base kitap; dolu=bayi/segment overlay
  scope smallint NOT NULL,           -- 0 varyant 1 ürün 2 marka 3 kategori 4 global
  product_id uuid NULL, brand_id uuid NULL, category_id uuid NULL,
  method text NOT NULL,              -- 'cost_plus'|'fixed'|'percent_off_list'
  base text NOT NULL,                -- 'cost'|'list_price'|'parent_book'
  margin_pct numeric, surcharge numeric, fixed_price numeric,
  vat_rate_pct numeric DEFAULT 20, price_is_vat_inclusive boolean DEFAULT false,
  min_margin_abs numeric NULL, max_margin_abs numeric NULL,
  round_to numeric NULL, charm_ending numeric NULL,
  min_quantity numeric DEFAULT 1, priority int DEFAULT 0, is_exclusive boolean DEFAULT true,
  currency char(3) NULL,             -- NULL=tüm para birimleri
  valid_from date, valid_to date, updated_at timestamptz, updated_by uuid
);

-- Parite (append-only; elle ezme = yeni yüksek-öncelik satır)
CREATE TABLE currency_rates (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL,
  base_ccy char(3) DEFAULT 'TRY', quote_ccy char(3) NOT NULL,
  rate numeric(18,6) NOT NULL, spread_pct numeric DEFAULT 0,
  source text NOT NULL,              -- 'tcmb'|'manual'
  effective_date date NOT NULL, fetched_at timestamptz
);

-- Mevcut: price_lists (segment kitabı) + product_prices (materialize cache) — R0–R5 onarır, yeni kolon:
ALTER TABLE product_prices ADD COLUMN currency char(3) DEFAULT 'TRY';
ALTER TABLE product_prices ADD COLUMN net_price numeric, ADD COLUMN gross_price numeric, ADD COLUMN is_derived boolean DEFAULT true;
```
**Sabit kimlikler (blueprint §1):** tenant `d3b07384-…`; price_list individual/dealer/corporate `d9d138d8`/`d97fff9d`/`b3a14f1a`.

---

## 11. Çözümleme algoritması (deterministik, izlenebilir)

```
resolvePrice(supabase, product, qty, currency, userCtx):
  book = pickPriceBook(userCtx.tier_level)            # bayi kitabı varsa, yoksa base
  cost = lookupCost(product, currency)                # para-spesifik alış→TL maliyet
  rules = pricing_rule.where(tenant, book IN [book,BASE], currency IN [currency,NULL],
                             min_quantity<=qty, today IN [valid_from,valid_to], matchesScope(product))
  rules.sort(scope ASC, bookRank ASC, min_quantity DESC, priority DESC, id DESC)
  chosen = first exclusive match                      # SAP stop-at-first-hit
  p = computeBase(chosen, cost) + surcharge           # cost_plus: cost*(1+margin/100)
  p = clampMargin(p, cost, min/max_margin)
  (net, gross) = applyVat(p, vat_rate, inclusive?)
  return roundPerCurrency(net/gross, currency, round_to, charm)   # EN SON
# matchesScope: kategori → ürün.kategori veya path STARTSWITH (alt-cascade); marka → ürün.brand; vb.
```
**İzlenebilirlik zorunlu:** "hangi kural neden kazandı" trace'i (admin debug + güven).

---

## 12. Admin panel (B1 — `admin-standard.md` K1–K5'e uyar)

- **Ayarlar:** para birimleri, parite (oto TCMB + elle ezme + spread), KDV oranı + dahil/hariç modu, varsayılan
  yuvarlama/charm politikası.
- **Marj kuralları:** scope (ürün/marka/kategori/global) bazlı kural CRUD + **etkin-marj matris önizleme**.
- **Ürün başına:** alış + para birimi + (ops.) marj override + her para biriminde **canlı hesaplanan satış** önizleme.
- **K1–K5 zorunlu:** jenerik table-kit (K1), URL-state (K2), RBAC 3-katman + sunucu RLS (K3),
  `logAdminAction` gerçek-yazma (K4), 5 durum (K5). §8 skoru ≥20/24.

---

## 13. Zorunlu kurallar (CLAUDE.md + standartlar)

| Kural | Kaynak |
|---|---|
| `lib/services/*` ilk param `supabase: SupabaseClient<Database>` (DI) | CLAUDE.md §2 |
| `any` yasak, strict TS | §3 |
| Tüm okuma/yazma **tenant-scoped** (`tenant_id = jwt_tenant_id()`) | §12 |
| Yetki/segment **app_metadata**'dan (asla `user_profiles.role`/`raw_user_meta_data`) | §12 |
| Sipariş satırında **9 snapshot alanı** yazılır (unit/list_id/name/sku/tax_rate/product jsonb **+ display_currency/display_rate/rate_effective_date**). 8'i DB'de NOT NULL; **`price_list_id_snapshot` bilerek nullable** — fiyat bir listeden değil kuraldan/tekliften gelebilir, o durumda liste kimliği YOKTUR. Kodun alanı **yazması** yine zorunlu, değerin dolu olması değil | blueprint §R3 + §4.1 |
| Idempotent seed: sabit `valid_from` + `ON CONFLICT DO NOTHING` | blueprint §B2 |
| Materialize **`is_derived=false` satırı ezmez** (elle-ezme/dondurma dokunulmaz) | §8.1 |
| KDV oranı **üründen** (`products.tax_rate`/`is_taxable`); kural alanı yalnız override | §5 |
| Cache tekil anahtarı **currency içerir** | §8.1 |
| Fiyat kilidi kapsamı `refreshCostInBase` + materialize tarafından **atlanır** | §8.2 |
| Sipariş/teklif durumu **monoton** | §11 |
| Marj/iskonto eşiği aşımı → çok-seviyeli onay | dealer §5 |

---

## 14. Enforcement (cetvel + onu zorlayan test)

Standart-artı-zorlayan-test = kontrol. **Durum dürüstlüğü (v1.1):** cetvel "kilitli" dediği için kilitli
sanılan iki test aslında YOKTU. Gerçek durum:

| Test | Ne kilitler | Durum |
|---|---|---|
| **INV-PRICE-1** | `products.price` hiçbir müşteri-yüzeyi kod yolunda **doğrudan** okunmaz | 🛡️ **KAPI VAR, AYRI TESTE GEREK YOK** (2026-08-17 ölçüldü) — (a) `DomainProduct = Omit<DbProduct, …\|'price'>` yani `product.price` erişimini **derleyici** engelliyor; (b) fiyatın *gösterilmesini* **INV-RENDER-1** tutuyor (`formatCurrency` + `hidePrice`). Derleyicinin göremediği dar yüzey (select-string / yıldız-seçim / raw sorgu) aynı gün tarandı: **temiz**. Ayrı bir test yazmak mevcut iki kapıyla mükerrer olurdu — bilinçli yazılmadı. ⚠️ Eski not ("çözücü hâlâ fallback ediyor") **BAYATTI**: `pricing.service.ts` W4b'de fallback'i kaldırmış. |
| **INV-PRICE-2** | Çözücü segment için `user_profiles.role` okumaz (yalnız `app_metadata`) | ✅ VAR (`pricing-segment-source.test.ts`, ratchet 0, edge dahil) |
| **INV-PRICE-3** | Sipariş-item yazan her yol **9 snapshot alanını** doldurur (no-op = FAIL) | ✅ VAR (`pricing-order-snapshot-contract.test.ts`, W2b-2) — üç yönlü bağ: cetvel §13 ↔ migration NOT NULL ↔ yazma yolu. **Asıl fail-closed katman DB kısıtıdır** (8 alan NOT NULL); test onun da yerinde durduğunu doğrular |
| **INV-PRICE-4** | Para float saklanmaz; `currency_rates` append-only (UPDATE/DELETE policy yok) | ✅ VAR (`pricing-money-append-only.test.ts`) |
| **INV-PRICE-5** | KDV oranı üründen okunur; kuralda sabit oran varsayımı yok | ⏳ **YAZILMADI, gerekçeli** (2026-08-17 ölçüldü) — sabit KDV oranı araması (`0.20`, `1.2`, `KDV_RATE`, `TAX_RATE=`) `src/lib`+`src/app`+`src/views` genelinde **boş döndü**: kural bugün ihlal edilmiyor. Drift riski düşük çünkü oran **tek kaynaktan** (ürün alanı) okunuyor ve sipariş satırında `tax_rate_snapshot` ile zaten donduruluyor (W2b-2). Öncelik listesinde daha az korunan kalemler var; §5 kararı geldiğinde yeniden değerlendirilir. |
| **INV-PRICE-6** | Cache anahtarı currency içerir; `product_prices`'a yalnız materialize servisi yazar; `is_derived` ayrımı korunur | ✅ VAR (`pricing-cache-invariants.test.ts`) |
| **INV-PRICE-7** | Fiyat kilidi zincirin **iki halkasında** da uygulanır (`refreshCostInBase` + materialize, `skippedFxLocked` sayaçlı); merdiven **tek** fonksiyondadır (politika kendi `switch (scope)`'unu yazamaz); kilit **künyesiz** olamaz (DB CHECK) | ✅ VAR (`pricing-fx-lock-contract.test.ts`, W5) — davranış + yapı + şema üç katman; 6 merdiven senaryosu gerçekten koşturulur, iki bacaktan bilerek bozulup KIRMIZI görüldü |
| **INV-PRICE-8** | "Bugün geçerli kur hangisi?" sorusunun kopya sayısı **1**: yalnız `fxRate.service.resolveFxRate` seçer; motor + `resolvePrice` + admin yüzeyi onu **çağırır**; çözücü `base_ccy=TRY` filtresini uygular | ✅ VAR (`pricing-fx-rate-single-resolver.test.ts`, 2026-08-17) — kusurun kendisi (filtresiz ikinci kopya) sabotajla geri konup KIRMIZI görüldü; ayrıca filtre silme ve üçüncü okuyucu doğurma sabotajları |

> **Kural:** bu tabloda ❌ olan bir maddeyi "kilitli" varsayarak karar verme. Cetvelin kendisi de denetlenir.

### 14.1 INV-PRICE-3'ün bilinen sınırları (kapsamı dürüstçe yaz)

Bir kapının neyi **görmediğini** yazmamak, onu olduğundan güçlü göstermektir.

- **Eş-konumluluk şartı.** Tarayıcı statiktir: 9 alan adını, `insert`/POST'un yapıldığı **aynı
  dosyada** arar. Satır kurucusunu paylaşılan bir modüle taşımak (ör.
  `_shared/orderItemSnapshot.ts`) sözleşmeyi bozmaz — **ama testi kırar.** Böyle bir refactor
  meşrudur; doğru hamle önce tarayıcıyı yeni yapıya uyarlamaktır, alanları geri kopyalamak değil.
  Bu uyarı testin hata mesajına da gömülüdür (yanlış teşhis, sessiz-yeşilden hızlı güven kaybettirir).
- **Migration bacağı metinseldir.** Test tek bir migration dosyasının içeriğine bakar, **canlı
  şemaya değil**. Sonraki bir migration NOT NULL'ı düşürürse test bunu görmez.
- **Tarama kapsamı** `src/**` + `supabase/functions/**`. `scripts/**` dışarıdadır (bugün orada
  sipariş kalemi yazan yok).
- **Kasıtlı atlatma kapsam dışı** (tehdit modeli: drift dedektörü). Tablo adı bir sabite alınırsa
  (`.from(TABLE)`) yeni yol görünmez olur. Asıl fail-closed katman DB'deki NOT NULL kısıtlarıdır.
- ~~**`rate_effective_date` UTC tarihidir**~~ ✅ **W5'te KAPANDI.** `iyzico-payment` artık
  `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' })` ile **İstanbul günü** yazıyor.
  Eskiden TSİ 00:00–03:00 arası verilen sipariş bir önceki günü yazardı; `currency_rates`
  kayıtları TCMB işiyle İstanbul gününe göre düştüğü için bu, siparişi bir gün eski kura
  bağlar ve fark **kimseye görünmezdi**. ⚠️ DB varsayılanı (`current_date`) hâlâ sunucu/UTC
  günüdür — kod değeri **daima açıkça gönderdiği** için pratikte devreye girmez, ama başka bir
  yazar eklenirse aynı kaymayı geri getirir.
- **Okuma tarafı yarım.** Yalnız `account/OrderDetailPage` snapshot kolonlarına geçti;
  `views/OrdersPage.tsx`, `views/admin/OrdersTableBody.tsx`, `components/admin/orders/OrderFormModal.tsx`
  hâlâ `product_name`/`price_at_time` okuyor. Bugün kırılmaz (aynı INSERT ikisini de aynı kaynaktan
  yazar) ama blueprint §R3 "hiçbiri atlanmaz" diyor — ADMIN-UX şeridine devredildi.

---

## 15. Build sırası (R0–R5 ile entegre — Recep "önce temel onarım" seçti)

```
F0  Maliyet+parite temeli: products kolonları + currency_rates + TCMB günlük job (cron 15:30, 404-carry)
F1  Marj motoru: pricing_rule tablosu + resolvePrice() (DI, app_metadata) + materialize → product_prices
    ↳ bu, blueprint R2 (çözücü yeniden-yaz) ile aynı yere iner; ölü order-validate + çift-const + _text() onarılır
R0–R5 (blueprint): tablo versiyonla / kimlik (org-tier) / çözücü tek sözleşme / sipariş snapshot / tenant RLS / segment RLS
F2  Admin paneli (B1): ayarlar + marj matris + ürün fiyat önizleme (K1–K5)
F3  Seed (B2): product_prices'ı motorla doldur (idempotent); 29 borç-ürünü modele oturt (€ alış)
F4  Eski 359 ürünü modele geçir (alış+para+marj-kural); düz products.price emekli
F5  (Gelecek) Teklif/CPQ hattı: quotes/quote_items, RFQ→Teklif→Sipariş, 8 kademe, onay eşiği
```

---

## 16. Provenance

Araştırma: 3 paralel ajan — (1) cross-platform cost-plus mimarisi (Odoo `product_pricelist_item` formül motoru +
`applied_on` merdiveni, SAP condition-technique/Exclusive stop-at-first-hit, Salesforce CPQ `PricingMethod=Cost`,
Magento/Shopify/BigCommerce/Woo "native cost-plus YOK" boşluğu), (2) çoklu-para + KDV (base-TRY, iki kur rolü,
TCMB today.xml, net-sakla, e-Fatura yuvarlama), (3) VentHub canlı yer-gerçeği (`pricing.service.ts`,
`order-validate`/`iyzico-payment` bug'ları, `price_lists`/`product_prices`/`organizations` şema, R0–R5 roadmap,
admin K1–K5). Zemin: `dealer-network-standard.md`, `dealer-module-blueprint.md`, `admin-standard.md`,
memory `pricing-currency-requirements`. Kaynaklar ajan çıktılarında atıflı (Odoo 17 source, SAP Learning,
Salesforce Help, Adobe/Shopify/BigCommerce docs, TCMB, PwC Türkiye KDV, ISO 4217).

---

> v1.0 · 2026-06-19 · İlk sürüm (araştırma + sentez). Değişiklikte sürüm yükselt + provenance güncelle.
>
> v1.1 · 2026-08-14 · **Çürüyen varsayım düzeltmesi + esneklik maddeleri.** Kaynak: (a) veri doğrulaması —
> `purchase_price`'ın kaynağı AVenS Ürün Fiyat Kataloğu 2026.1 (liste fiyatı, alış değil); (b) Recep'in
> gereksinim beyanı (ürün/grup bazında para birimi · kur değişimine kapatma/dondurma · marka ve tedarikçi
> bazında ayar); (c) cetvel↔canlı-şema↔motor sapma denetimi (opus). Değişenler: §2 iki tabana bölündü ·
> §4.1 çoklu-para satış sözleşmesi + spread sapması · §5 KDV SSOT = ürün · §6 minor-int kuralı gerçeğe
> çekildi · §8.1 cache sözleşmesi · §8.2 fiyat kilidi · §8.3 politika katmanı · §13 snapshot 6→9 alan ·
> §14 test durum tablosu (dürüstlük). Açık borçlar cetvelde ⚠️ ile işaretli.


---
# FILE: docs\standards\product-image-standard.md

# Ürün Görseli Standardı — v0.2

> Durum: **v0.2 — 2026-08-21 günü 339/374 ürünlük dokuz koşumla ÖLÇÜLMÜŞ.** v0.1 (pilot) maddeleri korunur;
> §8-§11 o günün kararlarından ve tuzaklarından gelir (kanıt: `docs/audits/t139-urun-gorseli-pilotu-2026-08-21.md`
> ve `docs/audits/t139-gun-sonu-raporu-2026-08-21.md`). Hayali madde yoktur.
> Kardeş cetveller: rendering-cache-standard (tazeleme),
> product-schema-standard (şema SSOT), storefront-design-standard (VentImage/CLS/alt),
> catalog-ingestion-standard (edinme hattı).

## 1. Tek kaynak (SSOT)

- Ürün görselinin tek kaynağı **`product_images`** tablosudur: `product_id`, `tenant_id`
  (ZORUNLU — kural 12), `path`, `alt`, `sort_order`.
- `sort_order = 0` = kapak. Sıralar boşluk içerebilir (ölü-link atlaması); tüketiciler sıraya
  değil `order by sort_order`'a dayanır.
- `path` **bucket-öneksiz** saklanır (`<tenant_id>/<product_id>/<sıra>.webp`); URL üretimi
  yalnız `src/lib/images/productImage.ts` resolver'ındadır. `image_url` alanları MİRAS'tır,
  yeni yüzey `image_url`'e bağlanamaz.

## 2. Depo ve biçim

- Bucket: `product-images` (public). Path şeması: `<tenant_id>/<product_id>/<sıra>.webp`.
- **Tek varyant** webp: kalite 82, genişlik tavanı 1600px, büyütme yok. Boyut varyantı
  ÜRETİLMEZ — küçük boylar Supabase transform / next-image katmanının işidir (aşırı
  mühendislik tuzağı, OPS şart-2).
- Şeffaflık (alpha) KORUNUR; arka plan basılmaz. (Pilot vakası: şeffaf görsel üç farklı
  görüntüleyicide üç farklı zeminle göründü — dosya değil zemin farkıydı.)

## 3. Kaynaktan edinme (üretici sitesi)

- İstekler **SIRALI**, aralık ≥ 1.5sn, paralel indirme YOK, dürüst User-Agent (OPS şart-1).
- Ürün eşlemesi: sayfa URL son parçası = `products.model_code`; dosya adındaki `_<kod>_`
  deseni filtre olarak kullanılır (aksesuar görselleri elenir — Matele vakası).
- HTML gerçekleri hesaba katılır: göreli URL + ters-bölü ayraç normalize edilir.
- **Kaynakta görsel yok** → uydurma/zorlama YOK, ürün fail-visible listeye (61181 vakası;
  zorunlu-alan-uydurma basıncı bilinen sınıftır).
- **Ölü link (404)** → tek görsel hatası koşuyu öldürmez; manifest'e adıyla yazılır.

## 4. Alt metin

- Pilot kararı: **dil-nötr** şablon `"<ürün adı> – <kod> – <sıra>"` (OPS şart-3).
- i18n-alt (TR/EN) tasarımı AÇIK SORU — karar verilmeden `alt` kolonuna dil-özel metin
  yazılamaz.

## 5. Tazeleme zinciri (rendering-cache-standard'a bağ)

- `product_images` INSERT/UPDATE/DELETE → `on_product_images_change` tetiği →
  `handle_supabase_webhook` → route dalı: aile PDP yolları (tr+en) + keşif/home tag +
  sitemap. Zincir 2026-08-21'de İLK kez gerçek veriyle kanıtlandı.
- Yükleme yapan süreç zincire GÜVENMEK yerine ÖLÇER: `net._http_response`'ta taze 200 +
  canlı sayfada yeni path referansı.

## 6. Yetki ve yazım kapısı

- Toplu/betik yazımı **service_role** iledir ve **Recep kapısıdır** (prod yazımı; envanter +
  geri-alma zorunlu — OPS şart-4: yazılan her nesne+satır envanter dosyasına işlenir,
  `--rollback` tek komutla geri alır).
- `product_images`'ta bugün INSERT/DELETE politikası YOK → admin-UI yüklemesi (T069) için
  **politika-önce-ekran**: ekran işi politika migration'ı (Recep kapısı) inmeden başlayamaz.

## 7. Kapı önerileri (henüz yazılmadı — sıradaki iş)

- **INV-IMG-1 (statik):** scripts/media betikleri şartları ihlal edemez — paralel indirme
  deseni, boyut-varyant üretimi, bucket-önekli path yazımı kırmızıdır.
- **INV-IMG-2 (davranışsal, sabotajla kanıtlanacak):** `product_images`'a satır ekleyen test
  akışı üç yüzeyin (keşif RPC + get_family_detail + admin sorgusu) yeni satırı gördüğünü
  doğrular.

## 8. İçerik kuralı — hangi fotoğraf bir ürüne bağlanabilir (Recep, 2026-08-21)

Üç kural, öncelik sırasıyla; hepsi `product_images` satırının kaynağını izlenebilir kılar
(manifest `source_url` alanına kaynak URL + karar notu yazılır):

1. **Ürünün KENDİ fotoğrafı varsa yüklenir, yoksa yüklenmez.** Vekil foto YOK: "benzer
   ürün", "aynı boyut başka seri" bağlanmaz (HEATMASTER≠KENTALFAN vakası — motor/boyut
   kodları birebirdi, ürün sınıfı farklıydı; bağlanmadan soruya düşürüldü, doğru çıktı).
2. **Üretici-aynı-foto istisnası, KAYNAKTA doğrulanır:** üretici/kaynak site bir türevde
   (ATEX, seri üyesi) aynı fotoğrafı kullanıyorsa o türeve de bağlanabilir — ama bu
   "sitede o türevin sayfası VAR ve aynı görseli taşıyor" ölçümüyle kanıtlanır (SEAT ATEX:
   Recep siteyi inceledi; KENTALFAN: Casals fanware 14/14 varyant tek seri fotoğrafı;
   Nicotra DD/RDH: aynı seri fotoğrafı). Ölçülmeden "muhtemelen aynıdır" BAĞLANMAZ.
3. **Recep URL-ile-bağlama yetkisi:** Recep bir ürün için kaynak URL verirse o fotoğraf
   bağlanır (danfoss.com resmi sayfaları FC-101/102/51 → kapak; DD 7/7 150W → 2 DD SKU).
   Kapak tercihi Recep'in ("danfossun kendisi kapak olsun"); karar `source_url`'de kalır.

**Diyagram-kapak:** kaynakta yalnız teknik çizim/performans eğrisi varsa kapak diyagram
olarak BİLİNÇLİ bırakılır ("boş karttan iyi"), ürün listesi rapora yazılır (16 Vortice
ürünü: VORT-E ATEX 14 + 15274 + 43157). Eğri yerine ölçülü çizimin öne alınması gelecek
iyileştirme adayıdır.

## 9. Fail-visible listesi politikası

- Eşleşmeyen ürün **sessizce atlanmaz**: manifest `unmatched[]`'e `sku + name + reason`
  ile yazılır, koşum sonunda ekrana dökülür, Recep'e **adıyla** raporlanır.
- Çok-adaylı eşleme (token-altkümesi birden fazla kartı tutuyorsa) = fail-visible, tahmin
  YOK. Tek aday + model-tanımlayıcı birebir = eşleşme.
- Sipariş kodu iki kaynakta farklı yazılabilir (61090P/6N090P, 1↔N) → eşleme KOD'a değil
  model tanımlayıcısına (boyut+watt+faz+kutup+hız) yapılır; kod rapora yazılır.
- Kalan liste "yapılamadı" değil "kaynak işareti bekliyor" sınıfıdır; Recep kaynak
  gösterince `url-fill-manifest.mjs` ile aynı kalıpla kapanır.

## 10. Keşif dersleri (ölçülmüş, tekrar yaşanmasın)

- **Aramada-yok ≠ sitede-yok.** Site araması sorgu başına sonucu SINIRLAYABİLİR
  (avensair: 3 DD yalnız "DD 10"/"DD 12" sorgusunda çıktı) ve bazı terimlerde BOŞ
  dönebilir (hız/kentalfan/plug/isitici). Keşif tek genel sorguya bırakılmaz.
- **Statik HTML tam liste DEĞİLDİR:** "Daha Fazla" butonlu listelemede ürünler JS ile
  gelir. avensair ucu: aynı kategori URL'sine `?offset=9,18,…&_token=<sayfadaki token>`
  GET → JSON `{products:[kart-html], end}`; kartlardaki `title` eşleme için altındır.
- **Doğrudan-URL yoklaması + içerik kapısı:** slug tahminiyle sayfa çekilir; site olmayan
  slug'a da soft-200 dönebilir → ürün görseli (carousel `thumbnail fancybox` img sayısı)
  ayırt eder. **Kontrol kolu zorunlu:** bilinen-olmayan bir slug'la kapının 0 döndüğü
  gösterilir.
- Üst kategori sayfaları alt-kategori KARTI döndürür (duman-egzoz → aksiyal-duman-egzost);
  alt kategoriler ayrıca taranır.
- Vortice: geçerli-kategori+kod HER kodu çözümlüyor (EOL dahil), `_<kod>_` içerik kapısı
  şart; hayalet kodlar (16076-79) 200 döner ama içerik taşımaz.
- Shopify mağazalar: `products.json?limit=250` yapılandırılmış; ad eşlemesi yeter.
- Üretici fotoğraflarında gömülü ibare olabilir ("non-contractual photo", SEAT) — LEGAL
  bilgi kalemi olarak kayda geçer, bağlamayı engellemez (karar Recep'te).

## 11. Marka → kaynak haritası (2026-08-21 itibarıyla)

| Marka | Kaynak | Durum |
|---|---|---|
| Vortice | vortice.com (kod→URL, `_<kod>_` kapısı) | 161/173 |
| SEAT | seat-ventilation.fr (Shopify) + ATEX istisnası | 80/81 (XRM açık) |
| Nicotra Gebhardt | avensair.com/nicotra-gebhardt (+ DD fill Recep) | 35/35 |
| AVenS | avensair.com kategorileri + Daha-Fazla ucu; KENTALFAN = **Casals** fanware | 29/51 |
| Danfoss | avensair DanfossFrekansInventorleri + danfoss.com resmi (kapak) | 34/34 |

Betikler `scripts/media/` (tümü resume'lu, envanterli, `--rollback`'li). Kalan 35 ürün ve
sınıfları gün-sonu raporundadır.


---
# FILE: docs\standards\product-schema-standard.md

# VentHub Ürün Veritabanı Şeması Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** "Ürün veritabanı şeması ve ilişkileri nasıl tasarlanmalıdır?" sorusunun **karar veren tek doğruluk kaynağı (SSOT).**
> Ürün ekosisteminin (product_families, products, categories, pricing, technical_specs) veritabanı şeması kuralları bu belgede tanımlanmıştır. Herhangi bir çelişki durumunda bu cetvel kazanır.
>
> **Dünya Referansları:** [Medusa.js v2](https://docs.medusajs.com), [Shopify Admin API](https://shopify.dev/docs/api/admin-graphql), [Saleor EAV](https://docs.saleor.io), [SAP Commerce (Hybris) Europe1](https://help.sap.com), [Odoo Pricelists](https://www.odoo.com/documentation/17.0/applications/sales/sales/products_prices/prices/pricing.html).

---

## 1. İlkeler (Aksiyomlar)

*   **Aksiyom 1: Aile-Varyant Ayrımı (Split-Model):** Basit veya varyasyonlu tüm ürünler parent-child ilişkisiyle modellenir. Parent genel özellikleri ve çevirileri tutarken, child envanter ve fiziksel özellikleri tutar. (Referans: Odoo `product.template` -> `product.product`, SAP `Product` -> `VariantProduct` [PS-014], [PS-040]).
*   **Aksiyom 2: Tenant İzolasyonu ve Sızdırmazlık:** SaaS modelinde her veri satırı ve Storage dosyası doğrulanabilir bir tenant kimliğine (`tenant_id`) bağlı olmalıdır. RLS politikaları, tenant sınırı dışına veri sızmasını veritabanı motoru düzeyinde engeller. (Referans: Citus Data Multi-Tenant Architecture [PS-001], [PS-020]).
*   **Aksiyom 3: Sıfır-EAV JSONB Yapısı:** Dinamik teknik özellikler (debi, basınç, voltaj vb.) için performans düşüren EAV (Entity-Attribute-Value) tabloları yerine, PostgreSQL'in native `jsonb_path_ops` indeksli JSONB alanı kullanılmalıdır. (Referans: Medusa v2 `metadata` JSONB [PS-033], [PS-034]).
*   **Aksiyom 4: JSONB i18n İzolasyonu (Aksiyom 5 Paritesi):** Çeviri verileri ilişkisel veritabanı JOIN maliyetlerinden kaçınmak için `i18n-localization-standard.md` Aksiyom 5'e uygun olarak JSONB nesneleri (`technical_specs.metadata->lang`) içinde saklanmalıdır. İlişkisel çeviri tabloları yasaktır. (Referans: Medusa v2 localized JSON [PS-016]).
*   **Aksiyom 5: SEO Link ve URL Kararlılığı:** Ürün URL yapısı kategorilerden ve varyant parametrelerinden bağımsız olarak düz (flat) ve değişmez olmalıdır. Arama motorları için varyantlar tek bir parent URL altında canonicalize edilmelidir. (Referans: Shopify Canonical URL [PS-039], [PS-043]).

---

## 2. Tablo Yapısı Kuralları

### 2.1 Ürün Ailesi (`product_families`) — Parent
Kataloğun temel şablonunu oluşturur. Varyasyonu olmayan ürünler dahil tüm sistem bu tabloda bir kayda sahip olmalıdır.
*   **Saklanan Alanlar:** `id` (UUID), `tenant_id`, `name`, `slug`, `brand_id` (normalizasyon zorunludur, serbest metin yasaktır [PS-030]), `description`, `is_description_manual` [PS-006], `created_at`, `updated_at`, `deleted_at`.
*   **Açıklama Kalite Kuralı (Description Quality - [PS-006]):** Ürün açıklamalarının (`description`) kategori trigger'larından veya statik şablonlardan otomatik üretilmiş sahte içerik (`"{product_name} - Smart category mapping"` gibi) barındırması kesinlikle yasaktır. Otomatik şablon üretimi kullanılacaksa, teknik parametreler (örn: `technical_specs` içinden debi vb.) dinamik olarak enjekte edilmeli ve her açıklama en az 50 karakter uzunluğunda olmalıdır.
*   **Manuel Kilit Mekanizması:** Tabloda `is_description_manual BOOLEAN DEFAULT false` kolonu bulunmalı, insan eliyle yapılan güncellemelerde bu alan `true` set edilerek otomatik şablon güncellemelerine karşı kilitlenmelidir.
*   **Sayfalama Sınırları (Pagination - [PS-040]):** Ürün listeleme ve arama API'lerinde sayfalama (pagination) düz varyant satırları (`products`) yerine strictly parent `product_families` üzerinden yapılmalıdır. Bu, frontend'deki seri gruplamalarında sayfa başına kart sayısının düzensizleşmesini (PS-040) ve kümülatif düzen kaymasını (CLS) engeller.

### 2.2 Ürün Varyantı (`products` / `product_variants`) — Child
Satışa konu olan somut SKU'dur. Stok ve lojistik bu tablodaki kayıtlarla yönetilir.
*   **Saklanan Alanlar:** `id` (UUID), `tenant_id`, `family_id` (FK -> `product_families`), `sku`, `model_code` [PS-028], `barcode`, `purchase_price` [PS-011], `purchase_currency` [PS-010], `status` (active, draft, archived), `technical_specs` (JSONB), `weight_kg`, `width_mm`, `height_mm`, `depth_mm` [PS-013].
*   **Over-fetching Önleme (Over-fetching - [PS-041]):** Liste sayfaları API response'larında varyantların tüm teknik detayları ve `technical_specs` JSONB kolonu çekilmemei (over-fetching engellenmeli), bu veriler yalnızca Ürün Detay Sayfası (PDP) seviyesinde lazy-load edilmelidir. Liste kartları için parent düzeyinde `min_price` ve `featured_image` gibi agregasyon verileri döndürülmelidir.
*   **Önbellek Sınırları (Cache Isolation - [PS-042]):** Sık değişen stok ve fiyat güncellemelerinin, statik ürün ailesi keşif önbelleğini (`products-discovery-${tenantId}`) çökertmesini (cache thrashing) engellemek için, yapısal ürün katalog verileri ile stok/fiyat verilerinin önbellek etiketleri (`variant-stock-${variantId}`) birbirinden izole edilmeli, stok hareketleri keşif önbelleğini tetiklememelidir.


### 2.3 Kategori Hiyerarşisi (`categories`)
Kategoriler sınırsız derinlikte hiyerarşiyi destekleyen rekürsif self-referential `parent_id` yapısında olmalıdır [PS-038].
*   **Silme Politikası:** Bir üst kategori silindiğinde alt kategorileri silinmemei (`ON DELETE RESTRICT` [PS-037]), ürünlerin kategori referansı boşa düşürülmemelidir.
*   **Seviye Kontrolü:** Kategori seviyeleri (`level`) parent-child zincirine göre veritabanı triggerı veya check constraint ile otomatik doğrulanmalıdır [PS-036].

### 2.4 Fiyat Listeleri (`product_prices` + `price_lists`)
`pricing-standard.md` ile uyumlu olarak fiyatlar doğrudan products tablosunda değil, segment ve miktar kırılımlarını destekleyen alt tablolarda tutulmalıdır [PS-015].
*   **İlişkiler:** `price_lists` (B2B tier, organizasyon eşleşmesi) -> `product_prices` (fiyat satırı).
*   **Alanlar:** `price_amount`, `currency` (ISO), `min_quantity` (kademeli B2B fiyatları için) [PS-015].

### 2.5 Ürün Görselleri (`product_images` & Storage)
Ürün görsel takibinde çift başlılık (hem products.image_url hem de product_images tablosunun kullanılması) yasaktır [PS-022].
*   Tüm görseller `product_images` tablosunda `(product_id, storage_path, sort_order)` ilişkisiyle tutulmalıdır.
*   Görsellerin fiziki dosyaları Supabase Storage üzerinde `product-images/[tenant_id]/[file_path]` path kuralına göre izole edilmelidir.

### 2.6 Teknik Özellikler (`technical_specs` JSONB)
HVAC parametreleri (debi, statik basınç vb.) JSONB formatında saklanır. 
*   **Bütünlük:** Her bir teknik anahtar (key) tip kontrolünden geçirilmeli, boş veya tutarsız anahtar adlandırmalarından (`air_flow` vs `airflow_capacity`) kaçınılmalıdır [PS-033], [PS-034].

---

## 3. Kolon Zorunlulukları

Her tablo için minimum zorunlu kolon setleri ve nullability kuralları:

| Tablo | Kolon | Tip | Özellik | Gerekçe |
| :--- | :--- | :--- | :--- | :--- |
| **Tüm Tablolar** | `tenant_id` | `uuid` | `NOT NULL`, `DEFAULT (SELECT public.jwt_tenant_id())` | SaaS izolasyon güvencesi [PS-001]. |
| **product_families** | `slug` | `text` | `NOT NULL`, `UNIQUE` | URL çözümü ve SEO stabilitesi [PS-031]. |
| **product_families** | `is_description_manual` | `boolean` | `NOT NULL`, `DEFAULT false` | Açıklama kalite trigger kilidi [PS-006]. |
| **products** | `sku` | `text` | `NOT NULL`, `UNIQUE`, `CHECK (sku ~ '^[A-Z0-9-]+$')` | Standartlaştırılmış B2B envanter kodu [PS-035]. |
| **products** | `purchase_price` | `numeric(12,4)`| `NOT NULL`, `DEFAULT 0.0000` | Cost-plus fiyat hesaplamasının doğruluğu [PS-011]. |
| **products** | `purchase_currency`| `varchar(3)` | `NOT NULL`, `DEFAULT 'TRY'` | Kur çevrimlerinin taban para birimi [PS-010]. |
| **categories** | `parent_id` | `uuid` | `NULLABLE`, `ON DELETE RESTRICT` | Ağaç yapısının bütünlüğü, yetim kategori oluşumunu engelleme [PS-037]. |

---

## 4. FK ve CASCADE Kuralları

İlişkisel bütünlük ve kazara veri kaybı risklerini (data loss) engellemek için şu kurallar geçerlidir:
*   **Denetim İzi Koruması:** `inventory_movements` tablosunun `product_id` ilişkisinde `ON DELETE CASCADE` kullanımı yasaktır [PS-005]. Ürün silindiğinde envanter hareket geçmişi silinmemeli, yerine `ON DELETE RESTRICT` veya yumuşak silme (soft delete) kullanılmalıdır.
*   **Katalog Güvenliği:** `categories.parent_id` ilişkisi `ON DELETE RESTRICT` olmalıdır [PS-037]. Bir kategori silinmeden önce alt kategorileri başka bir düğüme taşınmalı veya silinmelidir.
*   **Bayi ve Fiyat Güvenliği:** Fiyat listeleri (`price_lists`) silindiğinde tarihsel sipariş snaphot'ları etkilenmemeli, ödeme ve sipariş kayıtları kendi içlerinde donmuş fiyat snapshot'ları (`product_price_snapshot`) barındırmalıdır [PS-045].

---

## 5. Tenant İzolasyonu (SaaS)

*   **İndeksleme:** `tenant_id` kolonu üzerinde `B-Tree` indeks tanımlanması zorunludur.
*   **RLS Politika Şablonu:** Row Level Security (RLS) politikalarında helper fonksiyon çağrıları, her satır için fonksiyonun tekrar çalışmasını engellemek üzere bir scalar alt sorgu (scalar subquery / InitPlan) ile sarmalanmalıdır [PS-020].

```sql
-- Doğru RLS Politika Yapısı (InitPlan kullanan)
CREATE POLICY product_tenant_isolation_policy ON public.products
  FOR ALL
  TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()));
```

---

## 6. i18n (Çok Dil)

*   **İlişkisel Tablo Yasaktır:** Çeviriler için `product_translations` gibi ek tablolar açılmayacaktır.
*   **JSONB i18n Deseni:** Ürün tanımı, pazarlama metinleri ve teknik özellikler dil anahtarlarına bölünmüş JSONB alanlarında tutulmalıdır.
```json
{
  "name": {
    "tr": "Punto Mex Aksiyel Fan",
    "en": "Punto Mex Axial Fan"
  },
  "technical_specs": {
    "airflow_capacity": {
      "value": 90,
      "unit": "m³/h"
    }
  }
}
```

---

## 7. SEO ve URL Yapısı

*   **Flat URL Yönlendirmesi:** Ürün sayfası URL'si kategori yollarını içermemeli, doğrudan `/products/[family-slug]` formatında olmalıdır. Bu, URL stabilitesini korur [PS-039].
*   **Canonical URL Kuralı:** Varyant sayfaları (Örn: `/products/punto-mex?size=100`) her zaman ana aile sayfasına (`/products/punto-mex`) canonical etiketi ile bağlanmalıdır [PS-043].
*   **JSON-LD Schema Yapısı:** Ürün detay sayfalarında `ProductGroup` structured data standardı uygulanmalıdır. JSON-LD içinde veritabanı UUID'leri sızdırılmamalı, public URI slug'ları kullanılmalı ve `"isPartOf": { "@id": "${site_url}/#website" }` ilişkisi bulunmalıdır.

---

## 8. Trigger ve Audit Kuralları

*   **Zaman Damgaları:** Ürünler (`products`) ve ürün aileleri (`product_families`) tablolarında `updated_at` kolonunu güncelleyen standard `BEFORE UPDATE` triggerı bulunması zorunludur [PS-002].
*   **Yumuşak Silme (Soft Delete):** Ürün silme işlemleri fiziki delete yerine `deleted_at timestamp` kolonu güncellenerek soft delete olarak yapılmalıdır [PS-012].
*   **Sitemap ve Keşif:** Sitemap üreticileri ve statik sayfa oluşturucular (SSG) sadece `deleted_at IS NULL` olan ve canonical ana sayfaları listeleyecek şekilde yapılandırılmalıdır [PS-043].

---

## 9. İndeksleme Stratejisi

*   **JSONB Sorgu İndeksi:** `technical_specs` kolonu üzerinde containment (`@>`) sorgularını hızlandırmak için standard GIN indeksi yerine %30-50 daha az yer kaplayan ve daha hızlı yazılan `jsonb_path_ops` GIN indeksi kurulmalıdır [PS-034].
```sql
CREATE INDEX idx_products_tech_specs_path ON public.products USING gin (technical_specs jsonb_path_ops);
```
*   **Metin Arama İndeksi:** Türkçe full-text search için JSONB cast içeren FTS indeksleri kurulmalı, ancak arama fonksiyonlarının döndürdüğü kolon listesi (Örn: `is_fuzzy_match`) ile TypeScript tipleri (`database.types.ts`) tam uyumlu olmalıdır.

---

## 10. Güvenlik

*   **SECURITY INVOKER Varsayımı:** RLS politikalarında ve kullanıcı sorgularında tetiklenen tüm yardımcı veritabanı fonksiyonları (örn: `jwt_tenant_id`), yetki yükseltme açıklarını (privilege escalation) engellemek için `SECURITY INVOKER` olarak tanımlanmalıdır [PS-003], [PS-004].
*   **Constraint Uyumsuzlukları:** Güvenlik rolleri veritabanı constraint kuralları ile 100% eşleşmelidir. Örneğin `user_profiles_role_check` tablosu `'super_admin'` (alt çizgili) kuralını korurken, yardımcı fonksiyonlar `'superadmin'` (alt çizgisiz) araması yapmamalıdır; bu durum admin yetkilendirmesini tamamen kilitler [PS-046].
*   **Edge Function CORS Standardizasyonu ([PS-044]):** Deno Edge Function'larda tekil dosyada çift CORS bildiriminden kaynaklanan syntax/derleme hatalarını (PS-044) ve kod tekrarlarını engellemek için, CORS tanımları `supabase/functions/_shared/cors.ts` altında merkezi bir middleware (`withCors` yüksek dereceli fonksiyonu) veya tekil `getCorsHeaders(req)` helper'ı ile yönetilmelidir. Her handler içinde yerel olarak `const cors = ...` veya `const corsHeaders = ...` redeklare edilmesi yasaktır.
*   **Storage Bucket İzolasyonu:** storage.objects RLS kuralları dosya yolunun ilk klasörünü regex ile UUID formatında doğrulamalı ve aktif tenant ile eşleştirmelidir.
```sql
CREATE POLICY storage_tenant_isolation ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND split_part(name, '/', 1)::uuid = (SELECT public.jwt_tenant_id()));
```

---

## 11. Ürün KİMLİĞİ — müşteriye hangi ad gösterilir

> **Bekçi:** `src/__tests__/conformance/product-identity-resolver.test.ts` (INV-PRODUCT-IDENTITY)
> **Çözücü:** `src/utils/productHelpers.ts` — `getProductDisplayName` / `getProductModelLabel`

### 11.1 Kanonik kimlik = `products.name`

Müşteri **aynı ürünün iki farklı adını görmemeli**. Ölçüm (2026-08-19, prod, 374 ürün):
**374/374 üründe `products.name` aile adından FARKLI.** Ürün detay sayfası yalnız aile
adını yazdığı için müşteri satın aldığı şeyin adını **ilk kez sepette** görüyordu.

Kanonik kimlik satın alınan satırın adıdır: `products.name`. Sipariş kalemi anlık
görüntüsü, e-posta ve fatura zaten bunu yazar.

**Aile adı + model birleştirilerek ÜÇÜNCÜ bir ad üretilmez.** Bu, anlık görüntü
yazarını (Edge fonksiyonu) ve katalog verisini de değiştirmeyi gerektirir; kimlik
bütünlüğü için yanlış yöndür. Aile adı **seri etiketi** olarak ayrıca gösterilebilir.

### 11.2 Beş yüzey TEK çözücüden beslenir

| Yüzey | Ne gösterir |
|---|---|
| Ürün detay (PDP) | `getProductDisplayName` + seri etiketi olarak aile adı |
| Sepet | aynı çözücü |
| Sipariş özeti / hesap | `product_name_snapshot` (yazıldığı an çözücüyle aynı değer) |
| E-posta | aynı snapshot |
| Yönetim listeleri | aynı çözücü |

Yüzeyin kendi başına ad kurması (`family.name`, `sku`, birleştirme) **yasaktır** —
kuralın kaç yerde yaşadığını saymadan "düzelttim" demek bu depoda tekrar eden hatadır.

### 11.3 ⚠️ HAM SKU MÜŞTERİYE GÖSTERİLMEZ (bugün "çalışıyor" görünen kural)

Yüzeyde `model_code || sku` biçiminde bir yedek vardı. Ölçüm: **374/374 üründe
`model_code` DOLU, sıfırında boş** — yani o yedek **bugün hiç çalışmıyor**.

Bu, kuralı gereksiz yapmaz; **tam tersine** tehlikeli yapan şeydir. Katalog hattına
`model_code`'suz tek bir ürün girdiği an müşteri iç kod (`NIC-11942` gibi) görür ve
hiçbir kapı bunu görmez. **Latent bir açık, kapalı bir açık değildir** — aynı hafta
kapatılan `is_admin_user` içindeki ulaşılamaz `user_metadata` dalıyla aynı sınıf.

Kural: `model_code` yoksa **etiket hiç gösterilmez**. `sku`'ya düşmek yasaktır.

### 11.4 Ayırt edicilik neden ada bırakılamaz

Ölçüm: **74 satırda ad, aile içinde başka bir üyeyle çakışıyor.** Yani ad tek başına
"hangi modeli aldım" sorusunu cevaplamıyor; `model_code` etiketi süs değil, kimliğin
parçasıdır.

### 11.4.1 Veri tarafı borcu (açık)

Bu cetvel yüzeyi bağlar; **veriyi bağlamaz.** `products.model_code` bugün 374/374 dolu
ama bunu zorlayan bir kısıt YOK. Doğru kalıcı çözüm katalog alımında zorunlu alan
(`catalog-ingestion-standard.md`) ya da DB kısıtıdır. Sahibi: katalog hattı (PRICING).
Bu madde, kuralın **ölçülemez tarafını** adıyla yazar — kapının kapsamını abartmamak için.

## 11.5 MODEL KATMANI — seri / model / varyant (T138-VH, Recep onayi 2026-08-21)

`product_families` iki rol tasir; ayrim **`parent_family_id`** kolonundadir:

| parent_family_id | Rol | Vitrin karsiligi | Ornek |
|---|---|---|---|
| NULL | **SERI** | landing sayfasi (tanitim + model kartlari + karsilastirma tablosu) | Lineo Quiet |
| NOT NULL | **MODEL** | vitrin KARTI + urun sayfasi (fiyat, spec, sepet) | Lineo 100 Quiet |

**Varyant** ayri satir DEGILDIR-kart degildir: `products` satiridir ve model sayfasi icinde
`?sku=` ile secilir (standart/ES, faz, ATEX). Kural degismedi (Aksiyom-3 Sifir-EAV).

Kurallar:
1. **Hiyerarsi TEK SEVIYE**: seri -> model. Modelin altina model asilamaz (DB trigger
   `product_families_single_level`), satir kendi ebeveyni olamaz (check constraint).
2. **Kart = satin alinan birim = MODEL.** Piyasa olcumu (avensair, seat-ventilation.fr,
   vortice.com, danfoss.com): alici kapasiteyi arar ("JET 20"), seriyi degil.
3. **Model turetme SALT ADLA yapilamaz.** Bazi ailelerde varyant ekseni adda degil kodda
   (M4/T4 faz-kutup) veya `technical_specs`'tedir. Kural: **cap/debi degisiyorsa MODEL,
   faz/guc/donanim degisiyorsa VARYANT**; her aile icin dry-run raporu insan onayina sunulur.
   (Olcum 2026-08-21: salt-ad kurali 374 urunu 276 aileye bolerek "kart=urun"e dejenere etti.)
4. **1:1 aileler mesrudur**: Nicotra/Danfoss/aksiyel gibi yerlerde model = SKU olabilir;
   kaynak siteler de boyle gosterir. Orada seri landing tasiyici gorevi gorur.
5. **Eski seri slug'i KORUNUR** — seri satiri silinmez, landing olur (aksi halde eski URL
   404 verir; olculdu, T141 ajan-2 K1/K3). Varyant slug'lari 308 ile MODEL sayfasina gider.
6. **SEO kapisi:** her model sayfasinin OZGUN aciklamasi olmali; varyant ayri sayfa degil
   (`?sku=` + canonical = model sayfasi, INV-CANONICAL-2).

Veri gecisi: `scripts/db/product-data/t138-model-split.mjs` (dry-run varsayilan, envanterli,
geri alinabilir) + plan `docs/plans/t138-model-katmani-plani-2026-08-21.md`.

## 11.6 BİRİM SÖZLEŞMESİ — `technical_specs` (T140-VH, 2026-08-21)

**Kural: alan adı birimi TAAHHÜT eder.** `technical_specs` anahtarı bir SI birim soneki
taşıyorsa (`_w`, `_v`, `_a`, `_hz`, `_pa`, `_kg`, `_mm`, `_m3h`, `_ls`, `_pct`, `_c`),
o alandaki değer **o birimde ve sayı olarak** yazılır.

- ❌ Aynı alanda **çift birim yasak** (kW ile W, m³/h ile L/s). Birim dönüşümü **yükleme
  anında** yapılır; okuma tarafı dönüşüm varsayamaz.
- ❌ Birim **metne gömülmez**: `"380 V"` değil `380`. Metne gömülü değer sıralanamaz,
  filtrelenemez, karşılaştırılamaz.
- ❌ Bir alan **iki bilgi taşımaz**: gerilimle fazı aynı alana koymak (`"three-phase 400V"`)
  ikisini de kullanılamaz hâle getirir; faz AYRI alandır.
- Birim soneki olmayan anahtar (`motor_type`, `ip_rating`, `atex_marking`…) serbest metindir
  ve bu maddenin kapsamı dışındadır.

**Niçin bu kadar sert:** ölçüm (2026-08-21) `max_absorbed_power_w` alanının SEAT'te 0,06–7,5
(kW), Vortice'te 4–10230 (W) değer taşıdığını gösterdi. Yanlış birim **boş alandan
tehlikelidir**: boş alan görünür, yanlış birim *dolu ve makul* görünür. Karşılaştırma,
sıralama, filtreleme ve hesaplayıcı yüzeylerinin hepsi bu alanda yanlış sonuç verir ve
**hiçbiri kırmızı vermez**.

**Bekçi:** `scripts/db/checks/catalog-integrity.mjs` → `spec-unit` (alan adının ima ettiği
birimle bağdaşmayan değer) ve `spec-type` (birimli alanda metin). Circir kuralı geçerlidir:
bilinen ihlaller `catalog-integrity-baseline.json`'da **gerekçeli** durur, taban yalnız
küçülür; taban dışındaki her yeni ihlal kırmızıdır.

**⚠️ Kural yazmadan önce ölç — iki yanlış-kırmızı adayı elendi:**
`blade_diameter_mm` 3000–7000 **gerçek** veridir (NORDIK HVLS tavan fanları 3–7 **metre**
kanatlı), `frequency_hz = 0` ise 5 V'luk DC cihazlarda (BRA.VO S1–S4) anlamlıdır. "Şüpheli
büyük/küçük sayı" biçiminde genel bir eşik kuralı bu 11 doğru satırı kırmızı yapardı.
Bu yüzden kapsam **kesin olarak ölçülebilen** iki sınıfla sınırlı tutuldu.

## 11.7 SEMANTİK SÖZLEŞMESİ — alan adı neyi ölçtüğünü de söyler (T140-VH, 2026-08-21)

§11.6 alan adının **birimini** bağlar. Bu madde **neyi ölçtüğünü** bağlar. İkisi ayrı
sözleşmedir ve ikincisi olmadan birincisi yetmez: doğru birimde ama **yanlış büyüklüğü**
ölçen bir değer de "dolu ama yanlış"tır.

**Nereden çıktı (ölçüm, 2026-08-21):** SEAT teknik föylerinde debi/basınç değerleri devir
başına **nominal bir çalışma noktası**dır — fan eğrisi üzerinde bir nokta, serbest hava
maksimumu değil. Bu değeri `max_delivery_m3h` alanına yazmak, birim hatasını kapatırken
**semantik hata** üretirdi.

### Ön ek → anlam

| Ön ek / son ek | Anlamı | Örnek |
|---|---|---|
| `max_…` | Üreticinin verdiği çalışma aralığının **üst** sınırı (serbest hava / kapalı kanal ucu) | `max_delivery_m3h` |
| `min_…` | Aynı aralığın **alt** sınırı. Kaynak aralık veriyorsa **çift olarak** yazılır | `min_delivery_m3h` |
| `nominal_…` | Eğri üzerinde **belirli bir çalışma noktası** (devir + karşı basınç ile tanımlı) | `nominal_delivery_m3h` |
| ölçüt son eki | Aynı büyüklüğün birden çok ölçütü varsa ölçüt **ADA girer** | `noise_lpa_3m_db` |

- ❌ Aralığı **tek alana** sıkıştırmak yasak: `min_`/`max_` çifti yazılır. Yalnız üst değeri
  yazıp aralık olduğunu gizlemek, kullanıcıya "bu fan hep bu debiyi verir" der.
- ❌ Nominal noktayı `max_` alanına yazmak yasak.
- ❌ Ölçütü ada koymadan dB yazmak yasak (aşağıya bak).

### Ses: ölçüt ADA girer

Kaynaklar iki ayrı büyüklük veriyor: **LpA** (belirli mesafede ses *basıncı*) ve **LwA**
(ses *gücü*). Aralarında tipik olarak 15–20 dB fark var. Ölçüm: mevcut `noise_level_db_a`
alanı Vortice'te 142 kayıtta dolu ve 25–79,5 aralığında (ortalama 50,5) — bu **LpA** ile
uyumlu, ama alan adı bunu **söylemiyor**. SEAT'e LwA yazsaydık aynı alanda iki farklı
büyüklük bulunurdu ve karşılaştırma sessizce anlamsızlaşırdı.

**Kural:** yeni yazımlarda ölçüt ada girer — `noise_lpa_3m_db`. Mesafe de ada girer, çünkü
ses basıncı mesafeye bağlıdır. Eski `noise_level_db_a` alanı **legacy**'dir; taşınana kadar
"ölçütü belirsiz" sayılır ve yeni marka verisi oraya yazılmaz.

### Gerilim: bir alan bir bilgi

Yıldız-üçgen motorlar kaynakta `400/690` gibi **çift gerilim** taşır. Bu tek bir sayı alanına
sığmaz ve `"400/690"` yazmak §11.6'yı ihlal eder.

**Kural:** `voltage_v` = **çalışma gerilimi** (tek sayı, ör. `400`) · `wiring` = bağlantı
tipi (`'star-delta'`, `'direct'`) · `voltage_alt_v` = varsa ikinci gerilim (`690`) ·
`phase` = `1` veya `3`. Faz bilgisi **asla** gerilim alanına gömülmez.

**Bekçi:** §11.6'nın `spec-type` değişmezi metne gömülü değeri zaten yakalıyor; `min_`/`max_`
çiftinin tutarlılığı (`min ≤ max`) ve `nominal_` değerinin aralık içinde kalması, veri
yazımı yapan betiğin ön koşuludur (`scripts/db/product-data/*`), tek tek satırda doğrulanır.

## 12. Referanslar

1.  **Medusa.js v2 Pricing & Attribute Architecture:** [medusajs.com/docs/modules/pricing](https://docs.medusajs.com) (Multi-currency PriceSets and Rule Engines).
2.  **Shopify Admin API Product/Variant Option Limits:** [shopify.dev/docs/api/admin-graphql/latest/queries/product](https://shopify.dev/docs/api/admin-graphql) (Standardization of selected options).
3.  **Saleor Typed Dynamic Attributes EAV Model:** [saleor.io/docs/developer/attributes](https://docs.saleor.io) (Django strict attributes structure).
4.  **SAP Commerce Cloud (Hybris) Europe1 Price Engine:** [help.sap.com/hybris-europe1-pricing](https://help.sap.com) (Specificity priority ladder and user price groups).
5.  **Odoo Pricelist Margin Formulas:** [odoo.com/documentation/applications/sales](https://www.odoo.com) (Cost-plus margin matrix calculation).
6.  **Google Search Central - Product Variants Guidelines:** [google.com/search/docs/appearance/structured-data/product-variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants) (Duplicate content mitigation).
7.  **Schema.org ProductGroup Standard Specs:** [schema.org/ProductGroup](https://schema.org/ProductGroup) (Parent-child variant markup structure).
8.  **Supabase Edge Functions CORS Documentation:** [supabase.com/docs/guides/functions/cors](https://supabase.com/docs/guides/functions/cors) (Centralized CORS handling and dynamic origin validation).



---
# FILE: docs\standards\purchasing-standard.md

# Satınalma Standardı (Purchasing) — v1.0

> Sahip şerit: **PRICING-STOK** · İş: **T062-VH** · Tarih: 2026-08-16
> Karar çerçevesi Recep onaylı (OPS-AUDIT aracılığıyla, pano notu 2026-08-16).
> Bu cetvel, satınalma modülünün (tedarikçi → sipariş → mal kabul → maliyet kaydı)
> **neyin nasıl inşa edileceğini ve neyin BİLEREK yapılmayacağını** tanımlar.
> Uygulama dalgaları: D2 migration · D3 servis · D4 admin UI · D5 bekçi (INV-PURCH-1).

## 1. Amaç ve kapsam

**v1 kapsamı:** tedarikçi kartları · satınalma siparişi (PO) yaşam döngüsü · mal kabul
(goods receipt) ve stok girişi · satır bazında alış maliyeti **kanıtı** · ürüne
"son alış maliyeti" yansıması · admin UI.

**v1 kapsam DIŞI (bilerek):** tedarikçi portalı · otomatik yeniden-sipariş · çoklu depo ·
teklif (QUOTE/T009) kesişimi · **fiyat motoru köprüsü** (→ §5.4, en kritik dışlama).

## 2. Varlık modeli

Dört yeni tablo (kesin şema D2 migration'ında; burada sözleşme düzeyi):

| Tablo | Rol | Çekirdek alanlar |
|---|---|---|
| `suppliers` | Tedarikçi kartı | name, tax_no, contact, currency (varsayılan alış ccy), is_active, tenant_id |
| `purchase_orders` | PO başlığı | supplier_id, status (§3), currency, expected_at, note, created_by, tenant_id |
| `purchase_order_items` | PO satırı | po_id, product_id, qty_ordered, qty_received (türev), **unit_cost + currency SNAPSHOT** (§5.1), tax_rate |
| `goods_receipts` | Mal kabul başlığı | po_id, document_no, received_by, received_at, note, tenant_id |

- Mevcut `products.supplier_name` (serbest metin) v1'de **kalır**; `suppliers` kartına
  zorunlu FK göçü v2 işi. Yeni PO'lar daima `supplier_id` ile açılır.
- Mal kabulün **satır kanıtı ayrı tablo değildir**: kanıt `inventory_movements`
  satırıdır (§4) — T052'de sipariş tarafında kurulan ilkenin simetriği.

## 3. PO durum makinesi

Tek kaynak (SSOT): `src/lib/purchasing/poStatusMachine.ts` —
`src/lib/admin/returnStatusMachine.ts` ile aynı şekil (geçiş haritası + `allowedNextStatuses`,
bilinmeyen statü → boş dizi = kilitli). CLAUDE.md kural 11: **monoton, yalnız ileri**.

```
draft ──→ ordered ──→ partially_received ──→ received ──→ closed
  │           │                │
  └→ cancelled┘                └──────────────→ closed   (kısa kapama, §3.1)
```

| Kaynak | İzinli hedefler | Not |
|---|---|---|
| `draft` | ordered, cancelled | |
| `ordered` | partially_received, received, cancelled | received/partial **türevdir** (§3.2) |
| `partially_received` | received, closed | **cancelled YASAK** — mal kısmen girdi; geri alma iade/düzeltme akışıdır, statü geri sarma değil |
| `received` | closed | |
| `closed`, `cancelled` | — | terminal, soğurucu |

- **3.1 Kısa kapama:** `partially_received → closed` = kalan miktarın gelmeyeceğinin kabulü.
  Gerekçe notu zorunlu; kalan miktar hiçbir stok/maliyet izi bırakmaz.
- **3.2 Türev statüler:** `partially_received` ve `received` elle SEÇİLMEZ; mal kabul
  RPC'si (§4) satır miktarlarından türetir (`sum(qty_received)` vs `sum(qty_ordered)`).
  Elle yapılabilen geçişler yalnız: draft→ordered, →cancelled, →closed.
- DB tarafı: `status` CHECK constraint'i sözlükle birebir; bekçi (§10/R1) modül haritası ↔
  CHECK listesi paritesini doğrular. (T052 dersi: RPC kapısı CHECK'te olmayan
  `'paid'` bekliyordu ve stok hiç düşmedi — sözlük İKİ yerde ayrı yaşayamaz.)

## 4. Mal kabul = kanıt satırı

İlke (T052 ile simetrik): **stok girişi ancak `inventory_movements` kanıt satırıyla var olur.**

- Yazma yolu TEK: `process_goods_receipt(...)` RPC (SECURITY DEFINER; auth kapısı
  `adjust_stock` ailesiyle aynı desen). Tek transaction'da: movement satırları
  (`reason='purchase_receipt'`, `delta>0`) + `goods_receipts` başlığı + PO satır
  `qty_received` güncellemesi + statü türetme + `products.stock_qty` + §5.3 yansıması.
- `inventory_movements`'a D2'de eklenen alanlar: `unit_cost numeric`, `unit_cost_currency char(3)`,
  `goods_receipt_id uuid FK`. Üçü de **NULLABLE** + koşullu CHECK:
  `reason='purchase_receipt'` ⇒ üçü de NOT NULL. Böylece mevcut satırlara backfill
  GEREKMEZ; yeni satır türü kendi zorunluluğunu taşır. (0-sipariş penceresi başka
  fırsatlar için D2'de yine değerlendirilir — karar çerçevesi md.3.)
- **Aşırı kabul yasak:** RPC, satır başına `qty_received + yeni ≤ qty_ordered` doğrular;
  aşan istek `success=false` döndürür (kısmi başarı YOK — ya hepsi ya hiçbiri).
- **İdempotens:** `goods_receipts (po_id, document_no)` UNIQUE — aynı irsaliye iki kez
  işlenemez. Ayrıca miktar tavanı (yukarıda) hesap-bazlı ikinci kilittir.
- **Restore matematiğiyle uyum (ölçüldü):** `process_order_stock_restore` düşüm/geri-ekleme
  hesabını `order_id` kapsamında yapar; `purchase_receipt` satırları `order_id IS NULL`
  taşır — iki hesap kesişmez. `purchase_receipt` HİÇBİR restore/iade sözlüğüne girmez.
- Zarf kuralı: RPC gövdesi `{success, ...}` döndürür; çağıran **`success === true`** kontrol
  eder — HTTP 200'e güvenmek yasak (T052 dersi).

## 5. Fiyat ve maliyet ilkeleri (Recep-onaylı çerçeve)

### 5.1 PO satırı maliyetini SNAPSHOT'lar
Sipariş anındaki `unit_cost + currency (+tax_rate)` PO satırına yazılır ve **orada kalır** —
tedarikçi/ürün verisi sonradan değişse de satır tarihi gerçeği söyler. (W2b-2'de sipariş
satırına kurulan ilkenin alış tarafı.) Mal kabul, maliyeti PO satırından okur; kabul anında
farklı maliyet girildiyse (fatura farkı) movement satırındaki `unit_cost` gerçek değeri taşır.

### 5.2 `products.purchase_price`'a ÜZERİNE YAZMA YOK
O alan **katalog liste fiyatıdır** ve fiyat motorunun (`refreshCostInBase` →
`cost_in_base` → materialize) **CANLI girdisidir**. Satınalma modülü bu alana ve
`purchase_currency`/`purchase_rate_to_base`'e **hiçbir koşulda yazmaz**. Bekçi R3 bunu doğrular.

### 5.3 Gerçek alış maliyeti YENİ alanlarla yansır
D2, `products`'a ekler: `last_purchase_cost numeric NULL` · `last_purchase_currency char(3) NULL` ·
`last_purchased_at timestamptz NULL`. Yalnız `process_goods_receipt` yazar (son kabul kazanır).
Bunlar **rapor/görünürlük** alanlarıdır — motor zinciri bunları OKUMAZ (v1).

### 5.4 Motor köprüsü v1'de KAPALI (bilerek, yazılı)
Mal kabul **hiçbir yolla** `refreshCostInBase` / `materializePrices` zincirini tetiklemez;
satınalma verisi hiçbir vitrin/render yüzeyini etkilemez. Bu yüzden v1'de
`rendering-cache-standard` kaydı da gerekmez — etkilenen statik yüzey YOKTUR.

**Niçin kapalı:** "motor hangi maliyeti kullanır" sorusu ayrı, bilinçli bir politika
adımıdır. Kapı açılırsa mal-kabul, W5 fx-lock kilidini delebilir ve render zinciri
tetiksiz kalabilir — bugün zararsız görünen köprü, yeni yazar eklenince silahlanır
(T052/#556 dersi). Kapalılık bekçi R4 ile **assert edilir**, varsayılmaz.

**Açılış şartları (v2 — HEPSİ birlikte, tek tasarım):**
1. `pricing_policy`'ye `cost_source` (ör. `catalog | last_purchase`) benzeri açık ayar;
2. fx_lock ile etkileşimin tanımı (kilitli kapsamda maliyet güncellemesi ne yapar?);
3. `rendering-cache-standard`'a tetik + webhook dalı kaydı (hangi yüzey, ne tazelenir);
4. INV-PRICE-7 ve INV-PURCH-1'in birlikte güncellenmesi;
5. bu cetvelin §5.4'ünün yeniden yazılması + Recep onayı.

## 6. Yetki, RLS, denetim

- Dört tablo da **tenant-scoped** RLS; admin politika deseni `pricing_rule` ile aynı,
  rol dizisi `array['super_admin','admin','moderator']` (ölü yazım `superadmin` YASAK).
  Yetki kararı `app_metadata` üzerinden (kural 12).
- `process_goods_receipt` auth kapısı `adjust_stock` ailesiyle aynı; `revoke ... from anon`
  açıkça yazılır (varsayılan-grant tuzağı — #559 dersi).
- PO onayı/iptali/kısa kapama ve mal kabul `admin_audit_log`'a yazılır (kural 11).
- Client'tan PO/receipt tablolarına **doğrudan yazma yok**: durum geçişleri servis + RPC
  üzerinden; bekçi R2 client-side doğrudan insert'i tarar.

## 7. Servis katmanı (D3)

- `src/lib/services/purchasing.service.ts` — kural 2 (DI): ilk parametre
  `supabase: SupabaseClient<Database>`. `diSignature` testi dizin-türevli olduğundan dosya
  doğduğu an kapsamdadır.
- Saf yardımcılar (statü türetme, miktar doğrulama) DI'sız export edilebilir →
  `PURE_HELPERS_EXEMPT` listesine ADLA eklenir.
- Maliyet yansıması (§5.3) servis içinde **ayrı, adlandırılmış adımdır** — mal kabulle aynı
  transaction'da ama kodda ayrı fonksiyon; v2 köprü tasarımı bu dikişten yapılır.

## 8. Admin UI (D4)

- Dosyalar: `src/app/admin/purchasing/**` + `src/views/admin/purchasing/**` +
  `src/components/admin/purchasing/**` + `src/i18n/dictionaries/admin/purchasing.{tr,en}.ts`.
  Oyma 2026-08-16'da ADMIN-CUSTOMER'dan ALINDI; üç koşulu bağlayıcı: mevcut admin sözlük
  dosyalarına dokunma · aggregator kaydı TR+EN'e BİRLİKTE · çözücü NESTED-ONLY.
- `admin-standard` K1–K5 + DataTableKit deseni geçerli; statü butonları
  `allowedNextStatuses`'tan ÜRETİLİR (elle buton listesi yasak — returnStatusMachine deseni).
- Tüm metin sözlükten (kural 7); tutar gösterimi PO para birimiyle, TRY'ye çevrim YOK
  (çevrim = motor işi, köprü kapalı).

### 8.1 UI izni, DB izninin ötesine geçemez — `warehouse` v1'de YOK

**Kural:** bir role admin sayfası/yazma izni verilebilmesi için, o sayfanın okuduğu
tabloların **RLS SELECT politikası da o rolü içermek zorundadır.** Aksi hâlde kullanıcı
sayfayı açar, RLS boş küme döner, ekranda "kayıt yok" yazar ve **hiçbir hata düşmez** —
yetki eksiği boş veriye benzer. Bekçi R6 bu paritenin kalıcı kapısıdır.

**Ölçülen durum (2026-08-16, prod):** `process_goods_receipt` RPC kapısı `warehouse`'u
kabul eder (`adjust_stock` ailesinin deseni), ama `purchase_orders`/`purchase_order_items`/
`goods_receipts` RLS SELECT'i yalnız `super_admin|admin|moderator`'a açıktır
(`pricing_policy` deseni — maliyet hassas). İki desen çarpıştı; D4'te `warehouse`'a
verilen sayfa+yazma izni bu yüzden **geri alındı**. Bugün gerçek bir warehouse kullanıcısı
yok, yani kusur zarar üretmeden kapandı — ama "kapı açıkken göç etmemiş yol" sınıfına
girmeden kapatıldı.

**Warehouse mal kabulünü açma şartları (v1.1, HEPSİ birlikte):**
1. Fiyat/maliyet kolonu taşımayan bir görünüm (ör. `purchase_orders_ops_v`) + o görünüme
   `warehouse` SELECT — maliyet gizli kalır, iş görünür olur;
2. UI'ın o görünümü okuması (tabloyu değil) ve maliyet alanlarını hiç istememesi;
3. `rbac`'a `warehouse` girişlerinin geri eklenmesi — R6 paritesi bu üçüyle sağlanır;
4. migration gerektirir → kural 13, Recep kapısı.

## 9. Migration disiplini (D2)

- Kural 13: migration'lı PR yalnız Recep onayıyla merge. Damga = **gerçek saat** 14 hane
  (`YYYYMMDDHHMMSS_`); uygulanmış migration'ın adı KİMLİKTİR, yeniden adlandırılmaz.
- `_migration_ledger` bayt-sırası: yeni dosya adları mevcut uygulanmışların ardına düşmeli.
- D2 içeriği: 4 tablo + `inventory_movements` 3 kolon + koşullu CHECK + `products` 3 kolon +
  RPC + RLS + grant/revoke + `admin_audit_log` bağları. Backfill kararı (0-sipariş
  penceresi dahil) migration yorumunda ÖLÇÜMLE gerekçelenir.

## 10. Bekçi: INV-PURCH-1 (D5)

`src/__tests__/conformance/purchasing-machine-and-evidence.test.ts`. Kurallar:

| # | Kural | Şekil |
|---|---|---|
| R1 | Durum sözlüğü TEK: `poStatusMachine` haritası ↔ son-tanımlayan migration'daki CHECK listesi birebir; ikinci `TRANSITIONS` haritası yasak | parity + yapısal tarama |
| R2 | Stok girişi kanıtsız olamaz: mal kabul yazan her yol `process_goods_receipt` RPC'sini **çağırır** (`rpc('process_goods_receipt'` veya `/rest/v1/rpc/process_goods_receipt`); client kodunda `purchase_orders`/`goods_receipts`/`inventory_movements`'a doğrudan insert yasak | **çağrı-bazlı**, yorum sıyırmalı |
| R3 | `purchasing*` dosyaları `purchase_price`/`purchase_currency`/`purchase_rate_to_base`'e YAZMAZ | update/insert alan taraması |
| R4 | **Mal kabul motor zincirini ÇAĞIRMAZ**: `purchasing*` içinde `refreshCostInBase`/`materializePrices` çağrısı yok | **ayrı assert, çağrı-bazlı** (karar çerçevesi md.2) |
| R5 | RPC zarfı: çağıranlar `success` alanını kontrol eder | desen taraması |
| R6 | **UI izni ⊆ DB izni**: `canWrite(rol,'purchasing')` doğru olan her rol, `purchase_orders_admin_select` politikasının rol dizisinde de olmalı (§8.1) | `canWrite` **çağrılır** (matris regex'le okunmaz) + son-tanımlayan politikadan rol dizisi |

**Durum (2026-08-16): CANLI.** 9 test; 7 kuralın tamamı bilerek-bozarak kanıtlandı
(sahte geçiş haritası · doğrudan `goods_receipts` insert'i · zarfsız RPC çağrısı ·
`purchase_price:` yazımı · `refreshCostInBase()` çağrısı · modüle sahte statü ·
RPC adını sakatlama · R6 İKİ YÖNDEN: warehouse'a yazma izni geri ekleme **ve** RLS rol
dizisini daraltma — dokuzu da KIRMIZI gördü, restore sonrası yeşil). Parser sağlığı
sentetik pozitif/negatif çiftiyle ölçülür (gerçek ihlalin varlığına bağlı değil);
yorum sıyırma CRLF-güvenli (`[^\r\n]*`); eager glob'lar e2e'nin geçici
`*.compiled.<rastgele>.ts` dosyalarını `!` deseniyle dışlar (#571).

Teknik zorunluluklar (bu oturumun dersleri): yorum sıyırma **CRLF-güvenli** (`[^\r\n]`,
`.` değil) · assert kendi dokümanı/yorumuyla TATMİN OLMAZ · her kural **bilerek-boz**
kanıtıyla gelir (R1: haritaya sahte geçiş ekle; R2: RPC çağrısını doğrudan insert'le
değiştir; R3: purchase_price'a update yaz; R4: servise materializePrices çağrısı ekle —
dördü de KIRMIZI görülmeden PR açılmaz).

## 11. Karar günlüğü

| Tarih | Karar | Kaynak |
|---|---|---|
| 2026-08-16 | `purchase_price` = katalog liste fiyatı, satınalma DOKUNMAZ; gerçek maliyet PO satırı + `last_purchase_*` | Recep (OPS-AUDIT çerçevesi md.1) |
| 2026-08-16 | Motor köprüsü v1 KAPALI; açılış = §5.4 beş şart birlikte | Recep (çerçeve md.2) |
| 2026-08-16 | Backfill/NOT NULL kararları D2'de, 0-sipariş penceresi göz önünde | Recep (çerçeve md.3) |
| 2026-08-16 | `partially_received → cancelled` yasak; kısa kapama `closed` | Bu cetvel (§3.1) |

## 12. Açık sorular (v2 adayları)

- `products.supplier_name` → `supplier_id` FK göçü (veri temizliği ister).
- Fatura/irsaliye belge eşleştirme (T055 fatura hattıyla kesişim).
- Ağırlıklı ortalama maliyet vs son-alış (şu an: yalnız son-alış, raporlama amaçlı).
- Motor köprüsü (§5.4) — en büyük v2 kalemi.

## 13. DB sertleştirme M5–M8 — PLAN (uygulanmadı, Recep dalga onayı bekliyor)

> **Durum: yalnız PLAN.** İki madde de migration gerektirir (kural 13). OPS-AUDIT ataması
> 2026-08-17: "quote modülündeki doğru DB-desenini purchasing'e uygula; şimdi yalnız planı
> çıkar." Uygulama, Recep dalga onayından sonra ayrı bir PR'dır.

**Niçin var:** v1'de satınalmanın iki güvencesi yalnız **uygulama katmanında** duruyor.
Cetvel §3 "monoton" diyor, §5.1 "snapshot" diyor — ama veritabanı ikisini de zorlamıyor.
Doğrudan SQL erişimi olan bir yol (yeni bir servis, bir script, ileride gevşetilecek bir RLS)
her ikisini de sessizce delebilir. Teklif modülü aynı iki güvenceyi DB'de kuruyor; desen
zaten evde, purchasing ona hizalanmalı.

### 13.1 M5 — Kolon düzeyi grant (şu an YOK)

**Ölçüm (2026-08-17, prod):**

| Tablo | `authenticated` INSERT / UPDATE kolon sayısı |
|---|---|
| `venthub_quote_items` (doğru desen) | **6 / 3** — INSERT'te fiyat kolonları YOK; UPDATE yalnız `unit_price, currency, valid_until` |
| `purchase_order_items` | **10 / 10** — hepsi açık |
| `purchase_orders` | 11 / 11 · `goods_receipts` 8 / 8 · `suppliers` 13 / 13 |

Bugün zarar üretmiyor çünkü RLS satır düzeyinde zaten admin rolleriyle sınırlı. Ama RLS
**tek hat**; §8.1'de yazdığımız v1.1 adımı (warehouse'a görünüm üzerinden SELECT) bu hattı
bilerek gevşetiyor. Kolon grant'ı ikinci hattır ve tam o senaryoda çalışır.

**Planlanan kısıtlar** (`revoke` + dar `grant`, `authenticated` için):

| Kolon | Karar | Gerekçe |
|---|---|---|
| `purchase_order_items.qty_received` | UPDATE **çekilir** | Yalnız `process_goods_receipt` yazar (SECURITY DEFINER → grant'tan etkilenmez). Elle yazım kanıt satırını atlatır (§4). |
| `purchase_order_items.unit_cost`, `.currency` | UPDATE **çekilir** (INSERT kalır) | Sipariş anı SNAPSHOT'ıdır (§5.1); doğduktan sonra değişmemeli. Fatura farkı mal kabulde `inventory_movements.unit_cost`'a yazılır, satıra geri yazılmaz. |
| `products.last_purchase_cost/currency/purchased_at` | UPDATE **çekilir** | Yalnız RPC yazar (§5.3). |
| `purchase_orders.status` | UPDATE **kalır** | Servis elle geçiş yapar; sınırı M6 tetiği koyar. |

### 13.2 M6 — Durum geçiş tetiği (şu an YOK)

**Ölçüm (2026-08-17, prod):** `venthub_quotes`'ta `trg_enforce_quote_status_transition` var;
`purchase_orders`'ta durum tetiği **yok** — yalnız CHECK var, o da "hangi değerler geçerli"yi
söyler, "hangi geçiş geçerli"yi değil. Yani `received → draft` geri sarma DB'de mümkün ve
CLAUDE.md kural 11'in (monotonluk) satınalma tarafında DB karşılığı yok.

**Planlanan:** `enforce_po_status_transition()` + `purchase_orders` BEFORE UPDATE tetiği —
`enforce_quote_status_transition` ile birebir aynı şekil (aynı statü → geç; izinli geçiş →
geç; aksi → `raise exception ... errcode 'P0001'`). Harita `poStatusMachine` ile birebir:

```
draft → ordered, cancelled          ordered → partially_received, received, cancelled
partially_received → received, closed   received → closed      closed, cancelled → (yok)
```

**Kapsam dışı (bilinçli):** "türev statüler yalnız RPC'den" kuralının DB'de zorlanması.
Bunun için tetiğin çağıran bağlamını ayırt etmesi gerekir (`set_config` bayrağı); quote
deseninde de yok, INV-PURCH-1/R1b + servis kapısı bugün yeterli. Ayrı öneri olarak durur.

### 13.3 Bekçi eklentileri (INV-PURCH-1)

| # | Kural | Şekil |
|---|---|---|
| R7 | `purchase_order_items` UPDATE grant'ında `unit_cost`/`currency`/`qty_received` **bulunmaz**; `products` UPDATE grant'ında `last_purchase_*` bulunmaz | son-tanımlayan migration'daki `revoke/grant` ifadelerinden kolon kümesi çıkarılır |
| R8 | DB tetiği ↔ modül haritası paritesi: `enforce_po_status_transition` gövdesindeki geçiş çiftleri `poStatusMachine` ile **birebir** | R1a'nın tetik ikizi; `PO_STATUSES` gibi harita da modülden import edilir, tetik gövdesi migration'dan ayrıştırılır |

### 13.4 Sabotaj listesi (uygulama PR'ında koşulacak — hepsi KIRMIZI görmeli)

1. Tetik gövdesine sahte geçiş ekle (`received → draft`) → R8 parite kırmızı.
2. Modül haritasına sahte geçiş ekle, tetiği bırak → R8 kırmızı (**iki yönlü**, tek yön yetmez).
3. Tetiği `drop trigger` ile kaldır → R8 "tetik yok" kırmızı.
4. `unit_cost`'a UPDATE grant'ını geri ver → R7 kırmızı.
5. `qty_received`'e UPDATE grant'ını geri ver → R7 kırmızı.
6. **Canlı davranış** (migration uygulandıktan sonra, prod'da tek seferlik): geçersiz geçiş
   denemesi `P0001` almalı; RPC üzerinden meşru mal kabul ise **çalışmaya devam etmeli**
   (pozitif çapa — her şeyi reddeden bir tetik de "yeşil" görünür).

### 13.7 M8 — kalem-bazlı düşme idempotensi (kısmi düşüş maskeleniyor)

**Ölçüm (prod fonksiyon gövdesinden, 2026-08-17).** `process_order_stock_reduction`
kalem kalem çalışır: stoğu yeten kalem düşer ve `order_sale` hareketi yazılır, yetmeyen
`failed_products`'a eklenir. Yani **kısmi düşüş gerçekleşir ve kalıcıdır.** Ama
idempotens kapısı **sipariş bazlıdır**:

```sql
if exists (select 1 from inventory_movements
           where (order_id = v_order_uuid or batch_id = v_order_uuid)
             and reason = 'order_sale')
then return jsonb_build_object('success', true,
                               'message', 'Stock already reduced for this order', ...);
```

**Kusur senaryosu:** 3 kalemli sipariş — A ve B stoklu, C stoksuz.

| Adım | Olan | Dönen |
|---|---|---|
| 1. çağrı | A ve B düşer (hareket yazılır), C düşemez | `success=false`, `failed=[C]` → alarm (doğru) |
| 2. çağrı (retry / elle) | **hiçbir şey yapılmaz** — kapı "bu siparişte hareket var" der | `success=**true**`, `processed_count=0` |

Yani C **hiç düşmez** ve ikinci çağrı bunu **başarı olarak raporlar**. Kısmi düşüş
kalıcı olarak yarım kalır, üstelik maskelenir — ilk çağrının dürüst `success=false`'ı
ikinci çağrıyla silinir. Bu, "kısmi başarı = başarı sanılır" ailesinin DB tarafındaki
üyesi (T052'de callback tarafını kapatmıştık, RPC tarafı açık kalmış).

**Planlanan düzeltme:** idempotens kontrolü kaleme iner. Sipariş-bazlı erken çıkış
kaldırılır; döngü içinde her kalem için:

```sql
if exists (select 1 from inventory_movements
           where (order_id = v_order_uuid or batch_id = v_order_uuid)
             and product_id = v_item.product_id
             and reason = 'order_sale')
then v_skipped_already := v_skipped_already + 1; continue;
end if;
```

**Zarf da düzelir** (bugün "0 işlendi ama başarılı" belirsizdir):
`processed_count` (bu çağrıda düşen) · `skipped_already` (zaten düşülmüş) ·
`failed_products` (hâlâ düşemeyen) · `success = (failed boş)`. Böylece ikinci çağrı
C'yi gerçekten dener: stok gelmişse düşer ve `success=true` **hak edilmiş** olur;
gelmemişse `success=false` kalır ve alarm sürer.

**Bekçi (INV-STOCK-1'e eklenecek kural):** son-tanımlayan migration'da
`process_order_stock_reduction` gövdesindeki `order_sale` idempotens kontrolü
`product_id` koşulu **taşımalı**. Sipariş-bazlı erken çıkış deseni yasak.
*Sabotaj:* kalem koşulunu sil → KIRMIZI; erken çıkışı geri koy → KIRMIZI.
*Pozitif çapa:* meşru tam düşüş hâlâ tek çağrıda tamamlanmalı.

**Etki bugün:** prod'da 0 sipariş var, yani geçmiş veri düzeltmesi gerekmiyor; ama
kusur canlıya çıktığı ilk stoksuz-kalem siparişinde tetiklenir.

### 13.6 M7 — `search_path` illüzyonu (aynı pakette düzeltilecek)

**Bulgu LEGAL'den, prod'da KENDİM DOĞRULADIM (2026-08-17).** Yazdığım yedi fonksiyon
(`adjust_stock` ×2, `set_stock` ×2, `process_goods_receipt`,
`process_order_stock_reduction`, `process_order_stock_restore`) şu satırı taşıyor:

```sql
set search_path = 'pg_catalog, public'   -- ❌ TEK TIRNAK: tek bir isim
```

`pg_proc.proconfig` bunu `search_path="pg_catalog, public"` olarak saklıyor — yani
**"pg_catalog, public" adında tek bir şema**. Böyle bir şema yok, dolayısıyla arama
yolu fiilen boş.

**Davranış ölçümü (transaction + rollback, prod'a yan etki yok):**

| Ayar | Geçici tablo YOKken | Oturumda `CREATE TEMP TABLE products` VARken |
|---|---|---|
| `"pg_catalog, public"` (bugünkü 7 fn) | **NULL** — çözülmez | **geçici tabloyu bulur** ⚠️ |
| `public` | `public.products` | **geçici tabloyu bulur** ⚠️ |
| `public, pg_temp` | `public.products` | **`public.products`** ✅ |

> **İlk taslakta yanıldım, ölçüm düzeltti.** "`pg_temp` ASLA yazılmaz" diye yazmıştım;
> OPS-AUDIT itiraz etti ve haklı çıktı. PostgreSQL'de `pg_temp` search_path'te **açıkça
> listelenmezse relation aramasında ÖRTÜK OLARAK İLK** sıradadır. Yani `public` tek başına
> yazıldığında çağıran, kendi oturumunda `CREATE TEMP TABLE products` yapıp SECURITY DEFINER
> fonksiyonuna **gölge tablo yedirebilir**. `pg_temp`'i açıkça SONA yazmak örtük-ilk kuralını
> devre dışı bırakır — resmî güvenli biçim budur.
>
> Aynı ölçüm bugünkü kusuru da ağırlaştırıyor: bozuk tırnaklı ayar yalnız "hiçbir şey
> yapmıyor" değil, **aktif olarak savunmasız** — arama yolu boş olduğu için niteliksiz bir
> referans doğrudan geçici tabloya düşer.

**Neden bugün patlamıyor:** yedi fonksiyonun gövdesi de her nesneyi `public.` ile tam
niteliyor. Yani satır *koruma sağlıyor* sanılıyor ama **hiçbir şey yapmıyor** — gövdeye
eklenecek ilk niteliksiz referans anında patlar. Bu bir "illüzyon-sertleştirme": en
tehlikeli hâli, çünkü denetimde ✅ gibi okunur.

#### Cetvel kuralı — tek doğru desen (yeni fonksiyonlar bunu kopyalasın)

```sql
set search_path = public, pg_temp     -- ✅ tırnaksız liste; pg_temp EN SONDA
```

- **`pg_temp` MUTLAKA ve EN SONDA yazılır.** Yazılmazsa relation aramasında örtük olarak
  **ilk** sıraya geçer ve çağıranın geçici tablosu uygulama tablosunu gölgeler (yukarıdaki
  ölçüm). Açıkça sona yazmak bu davranışı kapatır.
- **`pg_catalog` AÇIKÇA YAZILMAZ.** Yazılmazsa örtük olarak *ilk* aranır; yazılırsa
  yazıldığı sıraya düşer. Bu yüzden `public, pg_catalog` **yanlıştır** — `public`'te
  aynı adlı bir nesne varsa çekirdek fonksiyonun önüne geçer.
- Ek şema gerekiyorsa `public` ile `pg_temp` **arasına** girer
  (ör. webhook fonksiyonu: `set search_path = public, net, vault, pg_temp`).
- `search_path = ''` (tam niteleme zorunlu) daha katı bir alternatiftir ama **gerekmiyor**:
  ölçüldü, `public` şemasında `anon`/`authenticated`/`service_role` için **CREATE yetkisi
  YOK**, yani `public` üzerinden gölgeleme mümkün değil.

#### Planlanan düzeltme (migration — M5/M6 ile AYNI pakette)

Yedi fonksiyon `create or replace` ile yeniden tanımlanır; **tek değişiklik `set` satırı**,
gövdeler aynen korunur. Sonrasında `proconfig` prod'dan yeniden okunur; **beklenen tek değer**
`{"search_path=public, pg_temp"}`'tir — yani yukarıdaki tek doğru desenin ta kendisi.
`{search_path=public}` (pg_temp'siz) bir okuma **KABUL DEĞİLDİR**: gövde tam nitelikli olsa bile
çağıranın geçici tablosu örtük-ilk kuralıyla öne geçebilir (§13.6 ölçüm tablosu, 2. sütun).
Ardından mal kabul + stok düşme yolları bir kez çalıştırılıp **pozitif çapa** alınır.

> **Depo geneli (ölçüldü):** 28 SECURITY DEFINER fonksiyonunda **7 ayrı desen** var.
> 7'si bu bozuk biçimde (benim — M7 kapatır); **6'sı `public, pg_temp` yani ZATEN DOĞRU**
> (ilk taslakta yanlışlıkla riskli demiştim, düzeltildi); 3'ü `public, pg_catalog`
> (`pg_temp` yok → gölgelenebilir, ayrıca sıra ters). Şeridim dışındakiler OPS-AUDIT'e
> iletildi. Bu cetvel yalnız kendi fonksiyonlarımı bağlar ama **doğru örnek** olarak durur.

### 13.5 Uygulama notları

- Tek migration yeterli (maddeler aynı fonksiyon/tablo kümesini ilgilendiriyor, aynı işlemde).
- **M7 de aynı migration'a girer** — yedi fonksiyon başka türlü yeniden tanımlanmasa bile
  `set` satırı için yeniden tanım gerekir; ayrı migration açmak ledger'ı gereksiz şişirir.
- Damga gerçek saat 14 hane; ledger bayt-sırasının arkasına düşmeli (§9).
- **Sıra önemli:** önce tetik, sonra grant kısıtı. Ters sırada, grant çekilirken servis
  yazma yolu kısa süre kısıtlı ama kuralsız kalır.
- Mevcut veriye dokunulmaz: prod'da 0 PO var (modül yeni), yani geriye dönük geçiş
  ihlali riski yok — bu pencere de W2b-2'deki gibi bir kolaylık, uygulamadan önce
  **yeniden ölçülmeli** (0 olmayabilir).


---
# FILE: docs\standards\quote-standard.md

# Teklif Modülü Standardı — v2 (ERP semantiği)

> **KAYNAK/CETVEL**
> - `docs/standards/quote-standard.md` v0.1 (Q1–Q8 + QD ertelemeleri) — bu dosyanın öncülü
> - `docs/standards/dealer-network-standard.md` §5 (RFQ→Quote→Order, versiyonlama, onay eşiği)
> - `docs/standards/legal-compliance-standard.md` §3.6 (iki-kapı deseni: satır + değer kapısı)
> - `docs/standards/commerce-domain-map-standard.md` §5 (izinli köprüler)
> - T134-VH dış kaynak araştırması (Odoo/ERPNext/Dolibarr/Metasfresh/Axelor + PandaDoc/Proposify/DocuSign/SF-CPQ + deal-registration) — 12 maddelik otonom/config/kullanıcı karar tablosu
> - Recep kararları 2026-08-20 (ERP semantiği · hibrit kabul · eşik · müşteri portalı · pasif ürün · V1.1 köprü · V2 LLM kuyruğu)
>
> **Cetvel durumu:** v0.1 CANLI ve bu belge onu **değiştirir**; v0.1'in Q1/Q3/Q5 çekirdeği korunur,
> Q2/Q4/Q6/Q8 yeniden yazılır. Karne tazeliği: veri modeli ve RLS **2026-08-20'de prod'dan ölçüldü**.
>
> **Bekçi:** INV-QUOTE-1 (mevcut, `quote-machine-ssot.test.ts`) → **INV-QUOTE-2** ile genişler (§15).
>
> **Durum:** v2 TASARIM — uygulama Recep onayına bağlı. Şema değişikliği **tek migration** (§16).

## 0) v1 nereye çarptı, v2 niçin var

v0.1 bir **RFQ** cetveliydi: teklifi müşteri ister, admin fiyatlar. Recep'in 2026-08-20
kararıyla model **ERP semantiğine** döndü: **teklifi satıcı hazırlar.** Bu, tek bir alan
eklemesi değil; giriş noktasını, durum makinesini, RLS'i ve müşteri yüzünü birlikte değiştirir.

Aşağıdaki §1 bu değişimin **bugünkü canlı davranışla nerede çeliştiğini** ölçümle sayar —
çünkü bu cetvelin en pahalı hatası, "yazdık sanmak" olur.

## 1) ÇELİŞEN-MEVCUT — bugün canlı olan ve v2 ile çelişen her şey (ölçüldü)

Tümü 2026-08-20'de **prod şemasından / prod politikalarından / master kodundan** okundu.
"Ölçemedim" işaretleri korunmuştur.

| # | Bugün canlı olan | Ölçüm | v2 kararı | Çelişkinin sınıfı |
|---|---|---|---|---|
| Ç1 | **Admin bir teklif OLUŞTURAMAZ** | `venthub_quotes` üzerinde INSERT politikası tek: `quotes_insert_own_requested` (`user_id = auth.uid()` **ve** `status='requested'`). Admin INSERT politikası **YOK** | Satıcı `draft` teklif açar | **Yapısal imkânsızlık** — eksik yetenek, bozuk yetenek değil |
| Ç2 | **Admin bir kalem EKLEYEMEZ** | `quote_items_insert_own_requested` aynı desende; admin için yalnız UPDATE var | Satıcı kalem ekler/çıkarır | Yapısal imkânsızlık |
| Ç3 | Giriş kapıları yalnız müşteri | `venthub_quotes_source_check` = `pdp \| cart \| project` — satıcı-başlatmalı kaynak **yok** | `admin` kaynağı eklenir | Kısıt, yeni akışı reddeder |
| Ç4 | Durum makinesi 5 durumlu, `draft` yok | `venthub_quotes_status_check` = requested/quoted/accepted/rejected/expired; tetik `enforce_quote_status_transition` aynı haritayı zorlar | §4'teki genişletilmiş makine | Cetvel + tetik + kısıt üçü birden |
| Ç5 | **Revizyon kavramı yok** | `venthub_quotes` kolonları: id, user_id, source, source_project_id, status, tenant_id, created_at, updated_at, request_email_sent_at. `revision_no` / `amended_from` **yok** | Amend zinciri (§5) | Eksik veri modeli |
| Ç6 | **Kabul kanıtı tutulmuyor** | Kabul yalnız `status='accepted'` yazımıdır; damga/IP/kanal/beyan-sürümü kolonu yok | Kanıt seti zorunlu (§7) | Hukuki ispat boşluğu |
| Ç7 | **Süre başlıkta değil, KALEMDE** | `venthub_quote_items.valid_until` (nullable); `venthub_quotes`'ta süre kolonu yok | Süre belge düzeyine taşınır | Yanlış katman |
| Ç8 | Başlıkta **toplam ve para birimi yok** | Toplam kolonu yok; `currency` kalem düzeyinde ve nullable | Başlıkta para birimi zorunlu | INV-CURRENCY-1 ile gerilim |
| Ç9 | Otomatik expiry **yok** | Cetvel Q2 "v1'de otomatik cron yok" diyor; ölçüm doğruluyor | Çift kapı (§6) | Bilinçli boşluk, artık kapanıyor |
| Ç10 | Q6: "Talebiniz alındı" e-postası **bilinçli YOK** | Oysa `request_email_sent_at` kolonu **CANLI** (T068 ile geldi) | Q6 bayat; iletim §12'de yeniden yazılır | **Cetvel gerçeğin gerisinde** |
| Ç11 | Q8: PDF **kapsam dışı** | — | PDF + iletim zorunlu (§12) | Kapsam kararı değişti |
| Ç12 | Müşteri kabul politikası dar | `quotes_update_customer_decision`: `quoted` → `accepted\|rejected`, sahip. Revizyon bağı, süre kontrolü, beyan sürümü **yok** | Politika **geri alınmaz, sertleştirilir** (§7) | Kapı var ama değer kapısı yok |
| Ç13 | Katalog-dışı kalem = serbest metin | `venthub_quote_items.product_id` **nullable**, FK `ON DELETE SET NULL` | Katalog-dışı kalem = **pasif ürün kaydı** (§3.2) | Model değişikliği |
| Ç14 | Modül üretimde **hiç kullanılmadı** | `venthub_quotes` **0 satır**, `venthub_quote_items` **0 satır** (08-19 ve 08-20 ölçümü) | Göç yükü sıfır — şema serbestçe düzeltilir | Fırsat, kusur değil |

**Ç1+Ç2 birlikte okunmalı:** bugün satıcı-hazırlamalı teklif **UI eksikliği değil, RLS
düzeyinde imkânsızlık**. "Admin ekranı yazalım" demek yetmez; politika gelmeden ekran
sessizce boş döner — bu deponun tekrar eden *yetkisi yok yerine veri yok* sınıfı.

**Ç10 ayrıca bir ders:** cetvel, kendi kapsam-dışı ilanını canlı koda karşı denetlemiyordu.
v2 bu yüzden §14'teki her kesimi **ölçülebilir bitiş kriteriyle** yazar.

## 2) Kavram katmanı — Satış Projesi, Teklif, Muhatap

v0.1 iki kavram tanıyordu: **Proje** (müşterinin yaşayan listesi) ve **Teklif** (dondurulmuş
ticari nesne). Q1 aynen korunur. v2 **üçüncü** bir kavram ekler ve bunun sebebi ölçülmüş bir
**endüstri boşluğudur**.

**Satış Projesi (saha)** — bir inşaat/tesis işi. Birden çok **muhatap** aynı saha için ayrı
ayrı teklif ister: işveren, ana yüklenici, alt yüklenici, kiracı. T134 araştırması iki
bağımsız kaynakla ölçtü: bu senaryonun yerleşik desteği **hiçbir ürün ailesinde yok**
(Dolibarr'da proje tek-muhatap kilidi; talep #13524 yıllardır açık, "most companies need it").
Procore hattında da baskın model "tek ihale sahibi, çoklu bidder" — bizim ihtiyacımızın tersi.

Bu yüzden Satış Projesi **VentHub'ın özgün cetvel alanıdır** ve şu kurallarla tanımlanır:

1. **Satış Projesi ≠ `user_projects`.** `user_projects` müşterinin kendi BOM listesidir
   (Q1). Satış Projesi **satıcı tarafının** sahayı temsil eden CRM nesnesidir. İkisi
   karıştırılmaz; bağ kurulacaksa yönü satıcıdan müşteriye doğrudur ve izlenebilirliktir.
2. **Muhatap rolü zorunludur.** Bir teklif bir Satış Projesine bağlanıyorsa muhatabın rolü
   (`isveren` / `ana_yuklenici` / `alt_yuklenici` / `kiraci`) yazılır. Rolsüz bağ kurulamaz —
   çünkü çakışma uyarısı (§9) ve fiyat tutarlılığı bu role dayanır.
3. **⭐ ÇATI GÖRÜNMEZ.** Her muhatap **yalnız kendi teklifini** görür; Satış Projesinin
   varlığını, diğer muhatapları, onların fiyatlarını **asla** göremez. Bu bir yüzey kararı
   değil **RLS şartıdır** — sızması ticari felakettir (aynı sahada rakip tarafların fiyatı).
4. Satış Projesi **isteğe bağlıdır.** Projesiz tek seferlik teklif tam yetkili bir tekliftir;
   proje bağı yalnız çoklu-taraf senaryosunu ve çakışma uyarısını açar.

> **Sınır — bu cetvelin yazmadığı:** Satış Projesi nesnesinin CRM tarafındaki tam alan seti
> (aşama, tahmini bütçe, sorumlu temsilci) **T130 CRM tasarımının işidir**. Burada yalnız
> teklifle kesişen üç şey bağlanır: kimlik, muhatap rolü, RLS izolasyonu.

## 2.5) Muhatap kimliği — **hesapsız teklif OLUR, kimliksiz teklif OLMAZ**

Recep kararı (08-20), iki cümlede ve bu cetvelin en sert ayrımlarından biri:

1. *"Müşterinin teklif sürecinde olabilmesi için cari/iletişim/isim bilgileri sistemde girili
   olmalı — kimliksiz birine teklif iletilemez."*
2. *"Kişinin teklifini ONAYLAYABİLMESİ veya TAKİP EDEBİLMESİ için sisteme KAYIT olması gerekir."*

Buradan **iki ayrı eksen** çıkar ve karıştırılmaları v1'in en pahalı hatası olurdu:

| Eksen | Şart | Niçin |
|---|---|---|
| **Kimlik** (teklifin var olabilmesi) | isim + e-posta + telefon **zorunlu** | Kime teklif verildiği belgede yazmalı; ERP'de muhatapsız belge yoktur |
| **Hesap** (teklifin onaylanabilmesi/takip edilebilmesi) | `user_id` dolu | Kabul hukuki bir eylemdir (§7.1); kimin kabul ettiği kimliklenmiş bir oturuma bağlanmalı |

**Sonuç — prospect (hesapsız cari) teklifi:**

- `venthub_quotes.user_id` **NULLABLE** olur. Satıcı, hesabı olmayan bir muhatap için teklif
  hazırlayıp e-postayla iletebilir. Bu **RFQ yolunun tersi** bir giriştir ve §4'teki `draft`
  girişinin doğal genişlemesidir.
- İletilen jeton-linki **yalnız GÖRÜNTÜLEMEdir**: PDF/özet açılır, **kabul aksiyonu taşımaz**.
  Kabul etmek isteyen kayıt olur; **aynı e-posta** ile açılan hesap teklifle eşleşir (`user_id`
  dolar), ondan sonra §7.2'nin değer kapısından geçerek kabul edebilir.
- ⭐ **Kapı DB'dedir, ekranda değil.** `user_id IS NULL` iken durum makinesi **onay yönüne
  geçemez**: `quoted → accepted` ve `accepted → converted` geçişleri `enforce_quote_status_transition`
  içinde reddedilir. Jeton-linkinden kabul düğmesini kaldırmak bir yüzey kararıdır ve **tek
  başına sayılmaz** — bu belgenin §6'da yazdığı "üçüncü kapı" kuralının aynısı.

> **Bu kilit bir bulgunun kökten panzehiridir.** T134 ölçümünde şunu kanıtlamıştım: §3.3 ile
> admin INSERT politikası açıldığında, giriş-durumu kilidi olmasa admin bir belgeyi doğrudan
> `converted` yazabilirdi (R8 onu `draft` ile kapatır). `user_id` kilidi ikinci ve bağımsız
> bir kapıdır: belge doğru durumdan başlasa bile, **muhatabı hesapsızken** kabul/dönüşüm
> yönüne yürüyemez.

**Eşleşme kuralı — e-posta tekilliği.** Hesap açılışında teklifle eşleşme `contact_email`
üzerinden yapılır ve **tenant kapsamında** çalışır. Eşleşme **otomatik doldurma değil,
sahiplenmedir**: `user_id` bir kez dolar, geri alınmaz (satıcı iptali ayrı eksendir).

**Sınır — bu cetvelin yazmadığı:** cari kartın CRM tarafındaki tam alan seti (vergi no, adres,
ödeme koşulu) **T130'un işidir**. Burada yalnız teklifin var olabilmesi için gereken üçlü
bağlanır: isim, e-posta, telefon.

## 3) Veri modeli v2

### 3.1 Başlık (`venthub_quotes`) — eklenecek alanlar

| Alan | Tip | Niçin | Kaynak |
|---|---|---|---|
| `quote_no` | text, benzersiz | Belge numarası; PDF ve müşteri iletişimi ondan konuşur | ERP normu |
| `revision_no` | int, NOT NULL, default 1 | Amend zinciri (§5) | ERPNext amend |
| `amended_from` | uuid → `venthub_quotes(id)` | Bir önceki revizyon | ERPNext amend |
| `root_quote_id` | uuid → `venthub_quotes(id)` | Zincir başı; portalda gruplama | türetildi |
| `superseded_by` | uuid → `venthub_quotes(id)` | Yerine geçen revizyon; **NULL = güncel** | türetildi |
| `valid_until` | timestamptz | Belge düzeyinde süre (Ç7) | Odoo/PandaDoc |
| `currency` | char(3), **NULLABLE** (şart tetikte) | Para birimi **türetilmez** | INV-CURRENCY-1 |
| `total_amount` | numeric | Belge toplamı (kalemlerden türetilir, snapshot'lanır) | fatura hattı |
| `user_id` | uuid → `auth.users`, **NULLABLE** | Hesapsız (prospect) muhatap; hesap açılınca dolar (§2.5) | Recep 08-20 |
| `contact_name` · `contact_email` · `contact_phone` | text, **NOT NULL** | Kimlik üçlüsü; kimliksiz teklif olmaz (§2.5) | Recep 08-20 |
| `sales_project_id` | uuid, nullable | Satış Projesi bağı (§2) | özgün |
| `party_role` | text, nullable | Muhatap rolü; proje bağı varsa NOT NULL | özgün |
| `sent_at` | timestamptz | İletim damgası (§12) | — |
| `accepted_at` · `accept_channel` · `accept_ip` · `accept_declaration_version` · `accept_evidence_ref` · `accept_recorded_by` · `accepted_revision_no` | — | Kabul kanıt seti (§7) | Dolibarr alan seti |
| `accept_confirmed_at` · `accept_confirmed_by` | — | Eşik aşıldığında satıcı teyidi (§7.3) | SF CPQ / ERPNext Authorization Rule |
| `cancelled_at` · `cancel_reason` | — | Satıcı iptali | — |
| `converted_order_id` | uuid → `venthub_orders(id)`, **UNIQUE** | Köprü (§10); tekillik şema kısıtıyla | T105 ölçümü |

### 3.2 Kalem (`venthub_quote_items`) ve **katalog-dışı kalem**

Recep kararı: katalog-dışı kalem **serbest metin değil, pasif ürün kaydıdır.**

**Ölçüm — bunun için yeni kolon GEREKMİYOR:** `products.status` bugün zaten
`active | draft | archived` değerlerini taşıyor ve **varsayılanı `draft`**. Vitrin sorguları
`product.service.ts` içinde altı yerde `status='active'` ile süzüyor. Yani "vitrine çıkmayan
ürün" **bugün mevcut bir yetenektir**; kompozördeki *hızlı pasif ürün kaydı* eylemi
`status='draft'` bir `products` satırı yaratır, kalem ona bağlanır.

Bunun üç sonucu var:
1. `venthub_quote_items.product_id` artık **NOT NULL** olabilir — her kalemin gerçek bir
   ürün kimliği olur.
2. **T105'in sert engeli çözülür.** Köprü raporunda "serbest-metin kalem sipariş kalemine
   dönüşemez, çünkü `venthub_order_items.product_id` NOT NULL" demiştim ve dönüşümü
   bloklamayı önermiştim. Pasif ürün kararı o engeli **ortadan kaldırır**; blok kuralına
   artık gerek yoktur.
3. ⚠ **Yeni tehlike, adıyla:** vitrin süzmesi tek bir kapıda değil, **sorgu başına**
   tekrarlanıyor (altı yer). Pasif ürünler çoğaldıkça, süzmeyi unutan yeni bir sorgu
   katalog-dışı kalemleri vitrine sızdırır. Bunu §15/R7 ölçer.

Kalem tarafına eklenecekler: `line_no` (sıra), `discount_rate`, `tax_rate`, `line_total`,
ve `group_label` (bina/kat/faz — dealer-network §5'in grup kavramı). Bundle/kit **v2 kapsamı
dışıdır** (§14).

### 3.3 RLS — v2 şartları

- **Ç1/Ç2 kapanır:** `venthub_quotes` ve `venthub_quote_items` için **admin INSERT**
  politikası gelir; admin yalnız `status='draft'` ile açabilir (giriş durumu kilidi).
- Müşteri INSERT politikası **korunur** (`requested`) — RFQ girişi yaşamaya devam eder (§4).
- Müşteri kabul politikası **geri alınmaz, sertleştirilir** (§7.2).
- **Satış Projesi izolasyonu:** muhatap yalnız kendi tekliflerini görür. `sales_project_id`
  üzerinden JOIN ile "aynı projedeki diğer teklifler" **müşteri yüzüne asla açılmaz**.
- **Prospect kapsamı (§2.5):** `user_id IS NULL` olan teklif **hiçbir müşteri politikasında**
  görünmez — sahiplik yüklemi (`user_id = auth.uid()`) NULL ile eşleşmez, bu yüzden hesapsız
  belge yalnız satıcı yüzünde yaşar. Jeton-linki bir RLS yolu **değildir**: belgeyi sunucu
  tarafında, yalnız okuma amaçlı üretir (§12) ve kabul aksiyonu taşımaz.
- Tüm politikalar `tenant_id = jwt_tenant_id()` kapsamında kalır (v0.1 Q3, T057 dersi).

## 4) Durum makinesi v2

```
GİRİŞLER
  (satıcı)   → draft
  (müşteri)  → requested            [RFQ yolu korunur]

GEÇİŞLER
  requested  → draft | rejected
  draft      → quoted | cancelled
  quoted     → accepted | rejected | expired | superseded | cancelled
  accepted   → converted

SOĞURUCU TERMİNALLER
  rejected · expired · cancelled · superseded · converted
```

**İki giriş durumu vardır ve bu bilinçlidir.** `draft` satıcının başlattığı ERP yoludur;
`requested` müşterinin vitrinden başlattığı RFQ yoludur ve **canlıdır** (PDP/sepet CTA'sı
sevk edilmiş durumda). RFQ'yu kaldırmak yeni bir çelişki üretirdi; onun yerine `requested`
artık bir **gelen kutusu** durumudur: satıcı talebi alır, `draft`'a çekip teklifi hazırlar.

**Adlandırma kararı — `quoted` korunuyor, `sent` eklenmiyor.** "Fiyatlandı ama iletilmedi"
hâli artık `draft`'tır; `quoted` = **fiyatlandı VE müşteriye iletildi**. Reddedilen alternatif
`draft → sent → …` üçlemesiydi: canlı `quotes_update_customer_decision` politikası, SSOT
haritası ve INV-QUOTE-1 bekçisi `quoted` üzerine kurulu; yeniden adlandırmanın karşılığında
kazanılan tek şey terim güzelliği olurdu. `sent_at` damgası zaten iletim anını taşır.

**`superseded` niçin ayrı bir terminal:** revizyon yayımlandığında eski revizyon ne
reddedilmiştir ne süresi dolmuştur — **yerine geçilmiştir**. Bunu `rejected`'a katlamak
müşteri portalındaki geçmişi yalan söyler hâle getirirdi (§8).

**⭐ MUHATAP KİLİDİ (§2.5) — geçiş haritasının üstünde ikinci bir şart.** `user_id IS NULL`
iken `quoted → accepted` ve `accepted → converted` geçişleri **reddedilir**. Kilit
`enforce_quote_status_transition` içindedir; ekranda kabul düğmesini gizlemek üçüncü kapıdır
ve tek başına sayılmaz (§6 ile aynı gerekçe). Harita diğer yönlerde hesapsız belge için
**açık kalır**: satıcı hesapsız muhataba teklif hazırlar, iletir, gerekirse iptal eder —
yalnız **kabul ve dönüşüm** hesap ister.

**SSOT değişmez:** `src/lib/quotes/quoteStatusMachine.ts` tek kaynaktır; DB tetiği
`enforce_quote_status_transition` aynı haritanın aynasıdır (INV-QUOTE-1 R1–R3 aynen geçerli,
yalnız harita büyür).

## 5) Revizyon — amend zinciri

**Seçilen desen: ERPNext amend zinciri.** Revizyon = **yeni kayıt** + önceki revizyona bağ.
Edit-in-place YOK (dealer-network §5 ile birebir).

Kurallar:

1. Revizyon açıldığında yeni satır: `revision_no = önceki + 1`, `amended_from = önceki.id`,
   `root_quote_id` zincir başı olarak taşınır.
2. Yeni revizyon **yayımlandığında** (`draft → quoted`) önceki revizyon
   `superseded` olur ve `superseded_by` yeni kaydı gösterir. Bu **tek işlemde** olur;
   yarım kalırsa iki canlı revizyon oluşur — bu §15/R4'ün ölçtüğü hâldir.
3. **Yalnız güncel revizyon kabul edilebilir** (`superseded_by is null`). Recep'in kararı
   bunu açıkça söylüyor: rev-2 yayındayken rev-1 kabul edilemez. Kapı **DB'dedir**, UI'da değil.
4. **⭐ Proje ve muhatap bağı KORUNUR.** Bu madde bir anti-örnekten yazıldı: Dolibarr'ın
   `createFromClone` yolu yeni belgeyi bağımsız üretir ve **proje bağını sıfırlar**. Aynı
   hatayı yapan bir revizyon, çoklu-taraf senaryosunda muhatabı kaybeder.
5. **Eski revizyon linki ölmez.** T134 bu davranışı sektörde **ölçemedi** — yani burada
   taklit edecek bir norm yok, kararı biz veriyoruz: eski revizyonun linki *"bu teklifin
   yeni sürümü var"* sayfasına düşer, eski PDF portalda **arşiv olarak görünür kalır**.
   Gerekçe: müşteri neyi kabul ettiğini/etmediğini geriye dönük görebilmelidir (§8).

## 6) Süre ve expiry — çift kapı

T134 ölçümü: üç ERP'den **yalnız ERPNext'te gerçek otomatik expiry var** (günlük cron);
Odoo'da `is_expired` sadece görsel bayrak, Dolibarr'da yıllardır açık talep. Proposify'ın
**lazy expiry** fikri (erişim anında) ikinci bir kapı olarak değerlidir.

**Karar: ikisi birden.**

- **Kapı 1 — cron.** Zamanlanmış bakım modülü (`pg_cron`, canlı) günlük koşar:
  `status='quoted'` ve `valid_until < now()` olan teklifleri `expired` yapar.
- **Kapı 2 — erişim/kabul anı.** Kabul yolunun **`with check`** ifadesi `valid_until >= now()`
  şartını taşır. Yani cron gecikse, düşse, hiç koşmasa bile **süresi geçmiş teklif kabul
  edilemez** — reddi DB verir, arayüz değil.

Kapı 2 niçin şart: kapı 1 tek başına, "cron koştu mu" sorusunu ticari bir garantiye çevirir.
Bu deponun bugüne kadarki en pahalı sınıfı tam olarak budur (iş akışı sessizce koşmaz ve
kimse kırmızı görmez). Arayüzdeki kapalı düğme **üçüncü** bir kapıdır ve tek başına sayılmaz.

**Süre değeri:** global varsayılan (config) + **teklif başına override** (T134/12).
`valid_until`, `draft → quoted` geçişinde **NOT NULL** olmak zorundadır — süresiz teklif
yayımlanamaz.

## 7) Kabul — tek kavram, üç kanal, zorunlu kanıt

### 7.1 Üç kanal

Kabul **tek bir kavramdır**; değişen yalnız kanaldır ve her kanal kendi kanıtını taşır.

| Kanal | Kim işler | Zorunlu kanıt |
|---|---|---|
| **site** (birincil dijital) | Müşteri, oturumla | beyan metni + `accept_ip` + `accept_declaration_version` + kabul edilen `revision_no` + damga |
| **e-posta beyanı** | Admin işler | `accept_evidence_ref` (ekli dosya/mesaj referansı) + `accept_recorded_by` |
| **telefon** | Admin işler | `accept_evidence_ref` (not/kayıt referansı) + `accept_recorded_by` |

**⭐ Üç kanalın ortak ön şartı: `user_id` DOLU olmalıdır (§2.5).** E-posta ve telefon
kanallarında kabulü admin işler, ama **kimin adına** işlediği hesaplı bir muhataba bağlanır;
hesapsız muhatabın kabulü hiçbir kanaldan kaydedilemez. Admin bu durumda önce muhatabı
hesaba bağlar (aynı e-posta ile davet), sonra kabulü işler. Bu, kanal sayısını değil
**kanıt zincirinin kime bağlandığını** korur.

**Site kanalı için beyan metni:** *"teklifi ve satış şartlarını kabul ediyorum."* Bu bir
checkbox/clickwrap'tir ve T134'ün hukuki bulgusuna göre **çizilmiş imzayla eşdeğer
bağlayıcılıktadır** (ESIGN/UETA; Meyer v. Uber 2017). Üç koşul cetvele bağlanır: şartlar
kabul eyleminden **önce** gösterilir, kabul eylemi **belirsiz olmaz** (tek amaçlı düğme),
ve **kayıt tutulur** (kanıt seti). Çizim imza **gerekmez** — bu, kanıtlı bir sadeleştirmedir.

### 7.2 Değer kapısı — mevcut politika sertleştirilir, geri alınmaz

Canlı `quotes_update_customer_decision` politikası (`quoted` → `accepted|rejected`, sahip)
**korunur** ve `with check` bloğu şu şartlarla genişletilir:

- `superseded_by is null` — yalnız güncel revizyon (§5/3)
- `valid_until >= now()` — süre kapısı (§6, kapı 2)
- `accept_channel = 'site'` ve `accept_ip`, `accept_declaration_version` **NOT NULL**
- `accept_recorded_by is null` — müşteri, admin-işlenmiş bir kabulü kendi adına yazamaz
- `accepted_revision_no = revision_no` — hangi revizyonun kabul edildiği belgeye pinlenir

Bu, `legal-compliance-standard.md` §3.6'daki **iki-kapı** deseninin birebir uygulamasıdır:
satır kapısı sahipliği, değer kapısı süreç alanlarını bağlar. O bölümün ölçülmüş dersi burada
da geçerlidir: **kolon-GRANT bir kapı değildir**, kısıt politikanın `with check` bloğuna yazılır.

### 7.2.1 Kalem tablosunun korunması — **tek bacaklı ve o bacak artık kapılı** (T164-VH)

Yukarıdaki §7.2 **başlık** tablosunu bağlar. **Kalem** tablosu (`venthub_quote_items`)
farklı bir mekanizmayla korunur ve bu fark yazılmazsa sessizce kaybolur.

**Ölçüm (canlı prod, 2026-08-27):** `authenticated` rolünün kalem tablosundaki UPDATE
kolon yetkisi **8 kolondur** ve içinde `unit_price, currency, discount_rate, tax_rate,
line_total` **vardır**. Grant'in geniş olması **zorunludur**: admin de `authenticated`'tır,
yani kolon yetkisi admin'e ve müşteriye aynı anda verilir (bkz. migration §8 yorumu).

O hâlde müşterinin bugün teklif tutarını değiştirememesinin **tek** sebebi şudur:

> Kalem tablosunda UPDATE politikası yalnızca `quote_items_update_admin`'dir ve
> `is_admin_user()` şartı taşır. Admin şartı taşımayan UPDATE politikası sayısı **0**.

**DEĞİŞMEZ:** `venthub_quote_items` **asla** müşterinin sağlayabileceği bir UPDATE
politikası kazanmayacak.

Bu değişmez daha önce hiçbir kapı tarafından tutulmuyordu. Biri "müşteri kendi
`requested` kalemlerini düzeltebilsin" diye bir politika eklerse fiyat kolonları **aynı
anda** yazılabilir olur — grant katmanı zaten açıktır ve §7.2'nin `with check` deseni
burada **işe yaramaz**, çünkü eski değere referans veremez.

**Niçin mevcut R5 yetmez:** R5 *koddaki* fiyat-kolonu yazımını yasaklar; buradaki tehlike
kod değil **politika eklenmesi**. Farklı yüzey, farklı kapı.

**Çözüm grant'i daraltmak DEĞİLDİR** (bilinçli kapsam dışı): daraltmak admin fiyat
girişini kırar. Mesele grant değil politika disiplinidir.

**Bekçi:** `src/__tests__/conformance/quote-items-policy-guard.test.ts` — bütün
migration'lar okunur (seçim **ada değil içeriğe** bağlı, R2'nin T134 dersi), `create` ve
`alter policy` blokları çıkarılır, `for update`/`for all` olan her blokta `is_admin_user()`
aranır. SQL yorumları CRLF-güvenli sıyrılır: `-- is_admin_user()` yazan bir yorum kapıyı
yeşil tutardı. Ayrıca **boş evren koruması** vardır — hiç politika bulunamazsa bu "ihlal
yok" değil "ölçüm yok" demektir ve bekçi yeşile kaçmaz, kırmızı verir.

**Kanıt (sabotaj, üç kol):** admin şartsız politika → **kırmızı** · aynı politikaya şart
eklendi → admin kolu **yeşil** (kabul kolu; ret gözlemi tek başına kanıt değildir) ·
şart yalnız **yorumda** → **kırmızı kaldı**.

**Bu bekçinin ölçmediği (adıyla):** politikanın *çalıştığını* değil, *yazıldığını* ölçer.
Davranışsal kanıt gerçek JWT bağlamı ister; ayrıcalıklı bağlantı §15'in dediği gibi
yanlış yeşil üretir.

### 7.2.2 INSERT tarafı — korunan şey admin tekeli değil, **durum sınırı** (INV-QUOTE-3)

§7.2.1 UPDATE yüzeyini kapattı. **INSERT yüzeyi ayrı bir yüzeydir ve aynı reçete burada
YANLIŞ olurdu:** müşterinin `'requested'` teklif açması ve kendi `'requested'` teklifine
kalem eklemesi **meşrudur** (v1'den beri canlı). "INSERT eden her politika admin şartı
taşısın" deseydik bugünkü doğru politikaları kırmızıya düşürürdük.

**Korunan değişmez:** teklif tablolarına INSERT eden her politika **ya `is_admin_user()`
şartı taşır, ya da yazdığı/bağlandığı teklifin durumunu `'requested'` değerine çiviler.**

**Niçin bu sınır (canlı ölçüm, 2026-08-27 — Kol A ile DÜZELTİLDİ):** `'draft'` admin'in
teklifi yazdığı, **fiyatın oluştuğu** durumdur. `authenticated` rolünün INSERT kolon
yetkisi `venthub_quotes`'ta **7**, `venthub_quote_items`'ta **8** kolondur — **ama
`status` o 7'nin içinde, `unit_price`/`currency` de o 8'in içinde DEĞİLDİR.** Yani
bugün hiçbir `authenticated` istemci ne `'draft'` yazabilir ne fiyat; admin de
`authenticated` olduğu için **admin de yazamaz**.

> **Öz-düzeltme (yazan: AUTH).** Bu paragrafın ilk hâli "grant zaten `authenticated`'a
> açık, daraltmak çözüm değildir" diyordu. O cümle **kolon sayısını sayıp hangi kolonlar
> olduğunu ölçmemişti**; agrega sayı, ters gideni gizlemişti. Doğrusu yukarıdadır.

**Tehlike kalkmadı, ERTELENDİ — bekçinin varlık sebebi tam olarak budur.** Bugün müşteriyi
`'draft'`ten ayıran şey politikanın çivisi değil, grant'ın darlığıdır. Ama E5 Kompozör'ün
admin ekranı **tam da bu grant'ın genişletilmesini** gerektirecek (Kol A ölçtü: admin
bugün draft teklif açamıyor, çünkü `status` yetkisi yok). Grant genişlediği an, müşteriyi
`'draft'`ten ayıran **tek** katman politikanın gövdesindeki `status = 'requested'`
çivisi olacaktır. Koruma, geçici bir grant darlığına değil **politikaya** yaslanmalıdır;
grant daraltmak da çözüm değildir çünkü admin de `authenticated`'tır.

**Bekçi:** `src/__tests__/conformance/quote-insert-policy-guard.test.ts`. Bütün
migration'ları okur, seçimi **ada değil içeriğe** göre yapar (yeniden adlandırma
atlatamaz), `create` **ve** `alter` yakalar (şart gevşetmek de tehlikelidir), `for`
yazılmamış politikayı PostgreSQL varsayılanı `ALL` sayar, SQL yorumlarını CRLF-güvenli
sıyırır ve **boş evren koruması** taşır.

**Kanıt (sabotaj, üç kol):** ne admin ne çivi taşıyan politika → **kırmızı** · aynı
politikaya `is_admin_user()` eklendi → şart kolu **yeşil** (kabul kolu; ret gözlemi tek
başına kanıt değildir) · şart yalnız **yorumda** → **kırmızı kaldı**.

**Bu bekçinin ölçmediği (adıyla, iki kalem):** (1) politikanın canlıda *etkin* olduğunu
değil, *yazıldığını* ölçer — davranışsal kanıt §15 ve `begin … rollback` kolundadır.
(2) Şartların konjonksiyon içinde olduğunu ispatlamaz: `status = 'requested'` bir `or`
dalında dursaydı çivi işlevi görmez ama bekçi yeşil kalırdı. **Bu boşluğun bekçisi
ratchet'tir** — politika adı kümesi sabitlenmiştir, yeni ya da yeniden adlandırılmış her
politika kırmızı yakar ve insan gözden geçirmesini zorlar. Sessizce eklenemez.

**Ayrıca ölçüldü (2026-08-27):** admin INSERT politikaları `#844` ile canlıya indi, ancak
bugün **sıfır çağıranı** vardır — depoda admin `'draft'` teklif üreten kod yolu yoktur
(tek INSERT yolu `quoteService.ts` `createQuoteRequest`, o da müşteri yoludur). Kapı
açıktır, geçen henüz yoktur; geçişi E5 Kompozör (REC-54 Kalem 2) yazacaktır.

**Kol A — DAVRANIŞSAL kanıt (2026-08-27, `begin … rollback`, prod'a kalıcı yazma **0**;
koşum öncesi/sonrası satır sayımı `venthub_quotes` 0→0, `venthub_quote_items` 0→0):**

| kol | beklenen | gözlenen | reddi YAPAN katman |
|---|---|---|---|
| müşteri kendi `'requested'` teklifini açar | KABUL | kabul edildi | — |
| kendi teklifine **fiyatsız** kalem | KABUL | kabul edildi | — |
| **aynı** kalem + `unit_price` | RED | `42501` | **GRANT** (fiyat kolonu yetkisi yok) |
| başka müşteri → gerçek teklife kalem | RED | `42501` | **RLS** |
| admin → `'requested'` teklife kalem | RED | `42501` | **RLS** (politika `'draft'` ister) |
| sahte tenant claim'i + gerçek tenant satırı | RED | `42501` | **RLS** |
| başkası adına teklif | RED | `42501` | **RLS** |
| **admin `'draft'` teklif açar** | KABUL bekleniyordu | `42501` | **GRANT** — ⚠ politika **ulaşılamaz** |

Son satır bu koşumun asıl bulgusudur: `quotes_insert_admin_draft` ve
`quote_items_insert_admin` **canlıdır ama hiçbir `authenticated` istemci onlara
ulaşamaz.** E5 Kompozör bugünkü hâliyle PostgREST üzerinden ne draft teklif açabilir ne
fiyat yazabilir; ya service_role'lü bir Edge Function yolu seçilecek ya da grant
genişletilecektir. Bu bir **karar** kalemidir (REC-54 Kalem 2).

**Ön koşullar AYIRT EDİCİ kuruldu — yoksa sekiz kolun sekizi de sahte yeşil olurdu:**
(a) rol `authenticated`, `rolsuper`/`rolbypassrls` **false** ölçüldü; bağlantının kendi
rolü `postgres`'tir ve tabloların **sahibidir**, `relforcerowsecurity` de `false` —
yani rol değiştirilmeseydi RLS **hiç** değerlendirilmezdi. (b) `request.jwt.claims`
**gerçekten okunuyor**: bunu ölçmek için bilerek **var olmayan** bir tenant verildi, çünkü
depodaki tek tenant `jwt_tenant_id()`'nin sessiz fallback değerinin **ta kendisidir** ve
"tenant eşleşti" gözlemi claim hiç okunmasa da aynı çıkardı. (c) `42501`'ler **mesajdan**
ayrıştırıldı: `row-level security policy` ≠ `permission denied for table`; ayrıştırılmasaydı
grant reddi RLS kanıtı sanılırdı.

⚠ **`is_admin_user()` gövdesinin ilk satırı `service_role`'de koşulsuz `TRUE` döner.**
Bu doğrulamayı ayrıcalıklı bir bağlantıda koşmak sekiz kolu da yeşil gösterir ve **hiçbir
şey ölçmez**. Aynı sınıftan iki tuzak daha koşum sırasında yakalandı ve betik düzeltildi:
`venthub_quotes.source` bir CHECK kısıtına (`pdp|cart|project`) tabidir ve
`user_id` **`auth.users`'a FK taşır** — sentetik kimlikle kurulan "kabul" kolları
RLS'e hiç gelmeden `23514`/`23503` ile düşer ve bu, RLS reddi sanılabilirdi.

### 7.3 Eşik — mekanizma otonom, değer config

T134/4: hiçbir üründe insan-tanımsız eşik yok; mekanizma platform sabiti, değer admin config.
Recep kararı bununla birebir örtüşüyor ve bir adım ileri gidiyor: **opt-in ve müşteri-bazlı**.

- Global varsayılan: açık/kapalı + tutar eşiği.
- Müşteri başına override değişkenleri.
- Eşik aşılırsa **site kabulü tek başına yetmez**: `accept_confirmed_at` / `accept_confirmed_by`
  ile **satıcı teyidi ikinci anahtardır**. Teyit yoksa geçiş `quoted` durumunda bekler.
- Bu ayrı bir durum **değildir** (durum patlaması yaratmamak için) — aynı durumda bekleyen bir
  onay alanıdır. Onay kuyruğu ekranı bu alanı okur.
## 8) Müşteri Teklif Portalı — "Tekliflerim"

Teklif iletilen **her** müşteri, kendi tekliflerini **korumalı girişle geçmişe dönük** izler.

- **Giriş:** mevcut hesap oturumu. E-postadaki teklif linki, oturum yoksa **hesap girişine
  düşer** (dönüş yoluyla) — v0.1 Q4'ün login şartı korunur, misafir kabul yok.
- **Yüzey:** `views/account` altında yeni bir alan; SaaS **Proje paketi bayrağına** bağlanır.
- **İçerik:** durumlar · **revizyon geçmişi** (arşiv PDF'ler dahil, §5/5) · güncel PDF ·
  kabul/red eylemleri (yalnız güncel revizyonda ve süre içindeyse etkin).
- **⭐ İzolasyon:** portal **yalnız o muhatabın tekliflerini** gösterir. Satış Projesi çatısı,
  diğer muhataplar ve onların fiyatları **hiçbir koşulda** görünmez (§2/3). Bu bir filtre
  tercihi değil, RLS şartıdır.

**Render/önbellek (v0.1 Q5'in devamı):** portal client-fetch `force-dynamic` yüzeydir; teklif
verisi hiçbir statik/ISR yüzeyde görünmez, dolayısıyla `rendering-cache-standard.md`'nin
tetik + revalidate şartı **bu modüle uygulanmaz.** Sınır şartı aynen taşınır: teklif verisi bir
gün statik bir yüzeye çıkarsa, o PR aynı gün DB tetiği + revalidate dalını getirmek zorundadır.
## 8.5) Ekran yerleşimi — E5 Kompozör (T133 bağı)

> **Kaynak:** `erp-workspace-design-standard.md` v0 (T133-VH, commit `44def9e8`, 318 satır).
> Bu belge yazıldığında o cetvel **henüz gönderilmemişti**; kararlar ADMIN'in 08-20 08:50
> panosundan alındı ve dosya indiğinde birebir aynısı okunacak. Dosya inince bu bölümün
> kaynağı **dosya adına** çevrilir.

Teklif kompozörü, T133'ün beş kanonik ekran deseninden **E5 (Kompozör)**'dür ve teklif modülü
o desenin **ilk uygulamasıdır**. ADMIN bunu adıyla işaretledi: E5 ödünç bir desen değil —
Fiori'de ve Power Apps'te karşılığı yok, en yakın akraba (Salesforce console workspace) başka
bir sorunu çözüyor. **Ödünç olmadığı için ilk uygulamasında şablona güvenilmez, davranış ölçülür.**

**Yerleşim (Recep kararı, T133'te sabit):**

| Bölge | İçerik |
|---|---|
| üst | durum şeridi · revizyon no · sahip · son değişiklik |
| sol | bağlam: müşteri / proje-saha / geçmiş — **salt okunur** |
| orta | kalem tablosu: katalog arama + katalog-dışı **hızlı pasif ürün kaydı** (§3.2) |
| sağ | **canlı PDF önizleme** |
| alt | eylem çubuğu: Taslak kaydet · Onaya gönder |

**Dört kural (T133'ten, teklif yüzeyine bağlanmış hâli):**

1. **Sonlandırıcı eylemler altta.** Üst şerit bilgi alanıdır, eylem barı değildir: üstte kimlik,
   altta karar. Yayımlama (`draft → quoted`) alt çubuktan yapılır.
2. **Sol sütun salt bağlamdır.** Müşteri/proje kaydı kompozörden düzenlenmez — iki farklı
   nesneyi aynı anda yazmak kaydetme semantiğini bozar.
3. **Sağ sütun ayrı bir rapor değildir.** Canlı PDF önizleme ortadaki verinin çıktısıdır;
   *"Önizleme üret"* düğmesi **olmaz**, önizleme veriyle aynı anda yaşar.
4. **Dar ekranda üç sütun yığılır, gizlenmez.** Önizleme sekmeye düşebilir; **bağlam düşemez** —
   bağlamı gizlemek kompozörün varlık sebebini siler.

⚠ **Tuzak — portal tema kapsamı.** Sağ önizleme ve katalog arama açılırları portala çıkıyorsa
`admin-design-standard.md` §4.11'in tema kapsamı **dışında** kalır; 2026-08-19'da #659'da tam bu
yaşandı (modal şeffaf, menü okunmaz). Önizlemeyi portal'a çıkarmadan önce o bölüm okunur.

**Çok-bağlamlı çalışma (iki teklifi yan yana) v0'da YOKTUR** — ihtiyaç henüz kanıtlanmadı.
Kompozör bağlamı tek ekranda tuttuğu için madde kapalıdır; kullanıcı iki teklifi karşılaştırmak
zorunda kalırsa **kanıtı bu modül üretir** ve madde yeniden açılır.

> **T133'ün C5 envanter maddesine cevap (kapsam bende):** ADMIN, "müşterinin siteden kendi
> teklifini kabul edebilmesi yeni modelle çelişiyor" diye işaretledi. **Çelişmiyor** — Recep'in
> 08-20 kabul kararı site-tıklamasını *birincil dijital kanal* olarak açıkça korur (§7.1).
> Çelişen şey kabulün kendisi değil, kabulün **kanıtsız** olmasıydı; §7.2 onu kapatıyor.
> Migration'lı olduğu ve Recep kapısı olduğu tespiti ise doğrudur (§16).
## 9) Çakışma ve fiyat tutarlılığı — UYAR, bloklama

T134/8 ve /9: üç ERP'nin **hiçbiri** çakışan teklifi engellemiyor ya da uyarmıyor; deal
registration dünyasında desen "varsayılan otonom kural + istisnada **insan hakemliği**".
Aynı projede farklı taraflara farklı fiyat uyarısı için satıcı-tarafı pratiği **ölçülemedi**.

**Karar:**

- Aynı Satış Projesinde **canlı başka teklif** varsa kompozör **uyarır**. Uyarı otonomdur.
- Aynı projede aynı ürün **farklı fiyatla** teklif edilmişse kompozör farkı **yüzdeyle** gösterir.
- **Otomatik iptal, otomatik kilit, otomatik fiyat eşitleme YOKTUR.** Kapatma/iptal/devam
  kararı **daima kullanıcıdadır**. Ticari karar sistemin değil satıcınındır.
- Aynı projeye **çoklu teklif serbesttir** (T134/7); kazanan işareti kullanıcıda (SF'in Primary
  deseninin karşılığı), sistem bloklamaz.

> Bu bölüm bilerek **muhafazakâr**: sektörde karşılığı olmayan otonom bir kural icat etmek,
> ilk yanlış iptalde ticari zarar üretir. Uyarı ucuz, yanlış otomasyon pahalıdır.
## 10) Köprü — kabul → TASLAK sipariş (V1.1)

`commerce-domain-map-standard.md` §5'in **1 numaralı köprüsü** budur ve sınırları oradan gelir.

- Kabul edilen teklif **checkout'suz bir TASLAK sipariş** doğurur. Kupon yok; ödeme anlaşmayla
  ilerler (Recep kararı).
- **Yön tektir:** sipariş teklife yalnız `converted` durumunu ve `converted_order_id` alanını
  yazar. Teklif, siparişin durumuna **hiçbir şey** yazamaz. İki durum makinesi ayrı kalır.
- **Fiyat otoritesi TEKLİFTİR.** Kabul anındaki kalem fiyatı sipariş kalemine snapshot'lanır;
  fiyat listesinden **yeniden çözülmez**. Aksi hâlde müşteri kabul ettiğinden başka bir tutar
  görür — anlaşmanın kendisi bozulur.
- **Dönüşüm bir kezdir.** Garanti şema kısıtından gelir: `converted_order_id` UNIQUE +
  `accepted` → `converted` monoton geçiş.
- **Adres/fatura bilgisi teklifte YOKTUR** (T105 ölçümü: `venthub_orders.shipping_address` ve
  `billing_address` NOT NULL, teklifte karşılıkları yok). Köprü bunları **uydurmaz**; taslak
  sipariş bu alanlar tamamlanana kadar sevk edilemez.
- **İkinci para yolu açılmaz** — bu köprünün en önemli güvenlik özelliğidir.

> **T105'ten değişen:** o raporda `product_id` NULL kalemler için dönüşümü bloklamayı
> önermiştim. §3.2'deki **pasif ürün** kararı o engeli ortadan kaldırdı; blok kuralı v2'de
> **yoktur**.
## 11) V2 — LLM taslak hazırlar, insan onaylar

- LLM (VISION danışman hattı) bir teklif **taslağı** hazırlayabilir.
- **⭐ LLM müşteriye doğrudan fiyat İLETEMEZ.** Taslak **onay kuyruğuna** düşer; iletim yalnız
  insan onayından sonra olur. Bu bir ürün tercihi değil, ticari güvenlik kuralıdır.
- Onay kuyruğu **ayrı bir ekrandır** (T133 kabuğunun Onay Kuyruğu kanonik deseni). Temsilci
  taslakları da aynı kuyruğa düşer.
- Kuyruk kararı `admin_audit_log` kaydı üretir: kim, hangi taslağı, hangi gerekçeyle onayladı.
## 12) PDF ve iletim

- Yayımlama (`draft` → `quoted`) **PDF üretir** ve `sent_at` damgasını yazar. PDF revizyona
  aittir; her revizyonun kendi PDF'i portalda arşiv olarak kalır (§5/5).
- İletim e-posta iledir; link **hesap girişine** düşer (§8).
- **Q6 yeniden yazıldı.** v0.1 "talebiniz alındı" e-postasını bilinçli boşluk sayıyordu; oysa
  `request_email_sent_at` kolonu canlı (Ç10). v2'de iletim yönleri: admin → müşteri (teklif
  hazır / güncellendi / süre yaklaşıyor) ve sistem → müşteri (talep alındı).
- **Kabul bildirimi ZORUNLUDUR.** Dolibarr'ın bilinen kusuru (#20204: imza sonrası bildirim
  bazı sürümlerde gitmiyor) bu maddeyi doğurdu — kabul gerçekleşir ama satıcı haberdar olmaz.
  §15/R6 bunu ölçer.
- Bildirim **best-effort** kalır: e-posta hatası statüyü geri almaz (iade deseniyle aynı). R6
  bildirimin **çağrıldığını** ölçer, teslim edildiğini değil.
## 13) Otonom / Config / Kullanıcı haritası

T134 sentez tablosunun bu modüle düşen hâli. Kural: **sektörde tam-otonom kritik karar yok;
biz de icat etmiyoruz.**

| Karar | Konum | Cetvel |
|---|---|---|
| Süre değeri | CONFIG (global varsayılan + teklif başına override) | §6 |
| Süre dolunca davranış | OTONOM (cron) + OTONOM (erişim/kabul anı kapısı) | §6 |
| Kabul kimlik seviyesi | Taban OTONOM (login zorunlu) · eşik üstü CONFIG | §7 |
| Kabul kanıt seti | OTONOM (her kabulde otomatik yazılır) | §7.1 |
| Onay eşiği | Mekanizma OTONOM, değer CONFIG + müşteri-bazlı override | §7.3 |
| Revizyon modeli | OTONOM (amend zinciri; yalnız güncel kabul edilebilir) | §5 |
| Eski revizyon linki | OTONOM (yeni sürüm sayfasına yönlenir, arşiv görünür) | §5/5 |
| Projeye çoklu teklif | SERBEST; kazanan işareti KULLANICI | §9 |
| Çakışan teklif tepkisi | OTONOM uyarı + KULLANICI kararı (otomatik iptal YOK) | §9 |
| Aynı projede farklı fiyat | OTONOM uyarı, blok YOK | §9 |
| Çoklu-taraf-tek-proje | OTONOM izolasyon (RLS) | §2 |
| Kabul → sipariş | CONFIG (varsayılan: taslak sipariş doğar, sevke insan onayı) | §10 |
| LLM taslağı | İNSAN ONAYI zorunlu, otomatik iletim YOK | §11 |

**Referans uygulama:** ERPNext'in iki deseni (günlük expiry cron + Authorization Rule config
katmanı) mimarimize en yakın olanıdır; §6 ve §7.3 bilerek onlara benzer.
## 14) Kapsam dışı (v2) — bilinçli kesimler, **bitiş kriteriyle**

v0.1'in Q8 kesimleri gerekçesizdi ve bir tanesi (Ç10) canlı kodun gerisinde kaldı. v2'de her
kesim **ölçülebilir bir bitiş kriteriyle** yazılır:

| Kesim | Niçin | Bitiş kriteri (bu sağlanınca kesim düşer) |
|---|---|---|
| Bundle / kit (ana + opsiyon) | Kalem modeli önce düz çalışsın | dealer-network §5'in bundle kavramı ayrı iş emrine bağlandığında |
| 8 basamaklı fiyat merdiveni (List→Net) | Bayi hattı **PARK** (Recep 08-20) | Bayi hattı parktan çıktığında |
| Misafir (hesapsız) teklif | Kabul kanıtı oturuma dayanıyor (§7) | Ayrı bir kimlik doğrulama akışı tasarlandığında |
| Çok-seviyeli onay zinciri | v2'de tek seviye yeter (§7.3) | Eşik iki kademeye çıktığında |
| ~~Ekran yerleşimi~~ **DÜŞTÜ** | T133 v0 yazıldı (`44def9e8`) | §8.5 eklendi; T133 dosyası inince kaynak dosya adına çevrilir |
| E-imza (çizim) | Clickwrap hukuken eşdeğer (§7.1) | Karşı taraf sözleşmesi çizim imza şart koşarsa |

**Bu tablo bir söz senedidir:** bir kesimin bitiş kriteri sağlandığı hâlde cetvel
güncellenmemişse, bu Ç10 sınıfının tekrarıdır ve kod incelemesinde adıyla anılır.
## 15) Bekçi sözleşmesi — INV-QUOTE-2

INV-QUOTE-1'in R1–R6 kuralları **aynen geçerlidir** (SSOT tekliği, UI/DB simetrisi, soğurucu
terminaller, sahiplik+tenant, fiyat kolonlarına müşteri yazamaz, rota↔sayfa). v2 şunları ekler:

| # | Kural | Sebep |
|---|---|---|
| R7 | Vitrine ürün getiren her sorgu `status='active'` süzmesini taşır | §3.2 — pasif ürün sızıntısı; süzme bugün **sorgu başına** tekrarlanıyor (6 yer, ölçüldü), tek kapı yok |
| R8 | `quotes` INSERT politikalarında admin yolu **yalnız** `status='draft'` kabul eder | §4 — giriş durumu kilidi; admin `quoted` bir belgeyi doğrudan var edemez |
| R9 | Müşteri kabul politikasının `with check` bloğu §7.2'nin **beş şartını** taşır | §7.2 — değer kapısı; biri düşerse kabul kanıtsız/eski revizyonda/süresi geçmiş olabilir |
| R10 | `draft → quoted` geçişinde `valid_until` ve `currency` NOT NULL | §6, §8 — süresiz/para birimsiz belge yayımlanamaz |
| R11 | Yayımlanan revizyon, öncekini **aynı işlemde** `superseded` yapar; iki canlı revizyon oluşamaz | §5/2 |
| R12 | Kabul, `superseded_by is null` olan kayıtta gerçekleşir | §5/3 — rev-2 yayındayken rev-1 kabul edilemez |
| R13 | Kabul gerçekleştiğinde bildirim ucu **çağrılır** | §12 — Dolibarr #20204 sınıfı |
| R14 | Müşteri yüzü sorgularında `sales_project_id` üzerinden **başka muhatabın** teklifi görünmez | §2/3 — çoklu-taraf izolasyonu; ihlali ticari felaket |

| R15 | `user_id IS NULL` iken `accepted` ve `converted` yönüne geçiş **DB tarafından** reddedilir | §2.5 — muhatap kilidi; ekran kapısı sayılmaz |
| R16 | `contact_name`/`contact_email`/`contact_phone` NOT NULL; kimliksiz teklif satırı oluşamaz | §2.5 — kimlik ekseni |
| R17 | Hesapsız teklif hiçbir müşteri SELECT politikasından dönmez | §3.3 — sahiplik yüklemi NULL ile eşleşmemeli |

**⚠ R9'un İKİ ŞARTI HENÜZ POLİTİKADA DEĞİL — adıyla, gizlenmeden (2026-08-26).**
`accept_ip` ve `accept_declaration_version` NOT NULL şartı `quotes_update_customer_decision`
politikasına **yazılmadı**. Gerekçe ölçüldü, tercih değil: bu iki alanı yazabilecek tek
taraf istemcidir (kolon-grant `authenticated`'a verilir), ve **istemciden gelen IP kanıt
değil BEYANdır**. Şartı koymak kanıt üretmez; istemciyi değer uydurmaya zorlar ve ortaya
*kanıt gibi görünen* bir alan çıkarır — bu, hiç alan olmamasından daha tehlikelidir.
Doğru çözüm **sunucu tarafında damgalayan bir kabul ucu**dur (RPC/Edge) ve o **ayrı bir
kalemdir**. O uç inene kadar R9 üç şartla koşar (`superseded_by is null`,
`valid_until >= now()`, `accept_recorded_by is null` + kanal/revizyon pini) ve bu satır
eksiğin **bitiş kriteridir**: sunucu damgalı uç indiği gün iki şart politikaya girer ve
bu paragraf silinir.

**⚠ §3.1 `currency` hücresi ile R10 arasındaki fark bilinçlidir.** Kolon NULLABLE'dır;
NOT NULL şartı `draft → quoted` geçişinde tetiktedir. Kolon düzeyinde NOT NULL, DEFAULT
gerektirirdi ve DEFAULT bir **türetmedir** — INV-CURRENCY-1'in yasakladığı şey. DEFAULT'suz
NOT NULL ise canlı RFQ yazma yolunu kırardı (ölçüldü: `quoteService.ts` currency göndermiyor).

**Ölçüm biçimi zorunlu:** kurallar **etki** ölçer, metin değil. R9/R12 için ayırt edici kol
şarttır — yalnız ret gözlemi "kanal kapalı" hâlinden ayırt edilemez; **kabul eden bir kol**
da denenmelidir. R15 için kabul eden kol: `user_id` dolduruldu → AYNI geçiş **geçmeli**;
yalnız ret gözlemi "tetik hiç çalışmıyor" hâlinden ayırt edilemez. R17 için: hesap bağlanınca
AYNI belge müşteri sorgusundan **dönmeli**. Yöntem (KVKK §3.6 kapanış kanıtının yöntemi: `begin … rollback`, prod'a sıfır yazma).

Bekçinin kendisi **bilerek bozularak** kırmızı gösterilir; geçmesi çalıştığını kanıtlamaz.
Yorum sıyırma `[^\r\n]` ile yapılır (CRLF fantomu, T017 dersi).
## 16) Migration planı — TEK migration, Recep kapısı

**Dar `converted` migration'ı İPTAL** (Recep 08-20). Şema değişikliği v2 tasarımı onaylandıktan
sonra **tek bir migration** olarak iner:

1. `venthub_quotes_status_check` → §4'ün genişletilmiş kümesi
2. `enforce_quote_status_transition` → §4 haritasının aynası
3. Başlık alanları (§3.1) — revizyon, süre, para birimi/toplam, kabul kanıt seti, proje/muhatap, köprü
4. Kalem alanları (§3.2) + `product_id` NOT NULL'a çekilir
5. RLS: admin INSERT politikaları (Ç1/Ç2), müşteri kabul politikasının sertleştirilmesi (§7.2),
   Satış Projesi izolasyonu (§2/3)
6. Expiry cron işi (§6, kapı 1) — ⚠ **AYRI ONAYLA KURULUR, bu migration'ın parçası
   DEĞİLDİR.** Karar OPS/AUTH 2026-08-26: cron kurulduğu an **periyodik prod yazımı**
   başlar; bu, tek seferlik bir şema değişikliğinden farklı bir risk sınıfıdır ve
   kendi Recep onayını hak eder. Şemayı kuran migration cron'suz iner; §6'nın
   **kapı 2'si** (kabul anındaki `valid_until >= now()` şartı) zaten tetikte ve
   politikada olduğu için süresi geçmiş teklif cron hiç koşmasa bile kabul edilemez
7. **Muhatap kimliği (§2.5):** `user_id` NULLABLE'a çekilir; `contact_name`/`contact_email`/
   `contact_phone` NOT NULL eklenir; muhatap kilidi `enforce_quote_status_transition` içine yazılır

⚠ **NOT NULL kısıtı MEVCUT satırlarda da koşar.** Bugün `venthub_quotes` 0 satır olduğu için
bedeli sıfır; modül kullanılmaya başladıktan sonra aynı kısıt geriye dönük ihlal üretir. Kısıt
eklenmeden önce canlı DB'de ihlal sayısı **merge öncesi** ölçülür.

**Bugünkü şema — ölçüldü (2026-08-23, canlı `information_schema.columns`):** `venthub_quotes.user_id`
şu an **NOT NULL**. Yani §2.5 kilidi bir ekleme değil, önce bir **gevşetmedir** (`drop not null`)
ve ardından gelen kilit tetikte kurulur. Sıra tersine çevrilirse hesapsız belge hiç oluşamaz.

**Göç riski SIFIR — ölçüldü:** `venthub_quotes` 0 satır, `venthub_quote_items` 0 satır. **Yeniden ölçüldü 2026-08-23: hâlâ 0/0** (bu iddia
zamanla bayatlar; kısıt eklenmeden önce tekrar ölçülür). Bu,
şemayı bugün doğru kurmak için elimizdeki en ucuz penceredir; modül kullanılmaya başladıktan
sonra aynı değişikliklerin bedeli veri göçüyle birlikte artar.

⚠ **Migration merge edildiği an prod'a uygulanır** (CLAUDE.md kural 13). Bu PR yalnız
**tasarımdır**; migration ayrı PR'dır ve merge kararı **yalnız Recep'e** aittir.

---

## İlişkili cetveller

`commerce-domain-map-standard.md` (§5 köprü-1) · `dealer-network-standard.md` (§5 CPQ hattı) ·
`legal-compliance-standard.md` (§3.6 iki-kapı deseni) · `pricing-standard.md` (fiyat otoritesi) ·
`erp-workspace-design-standard.md` (T133 — ekran yerleşimi buraya bağlanacak) ·
`measurement-discipline-standard.md` (K1–K13; bu belgedeki her ölçüm o kurallara tabidir).


---
# FILE: docs\standards\rendering-cache-standard.md

# Render & Önbellek Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** Hangi sayfanın nasıl üretildiği, hangi verinin nerede gösterildiği ve
> veri değişince neyin tazelendiğinin **tek doğru kaynağı (SSOT)**.
>
> **Neden var?** 2026-08-15'te 1044 fiyat satırı prod'a yazıldı ve **vitrin değişmedi**. Sebep
> tek tek bakınca görünmüyordu: ürün sayfası statik üretiliyor, tazeleme Supabase webhook'una
> bağlı, webhook üç tabloyu dinliyor ve `product_prices` o üçünde yok. Fiyatların sonradan
> görünmesi, alakasız bir PR'ın prod'u yeniden basmasıydı — **tasarım değil tesadüf.**
> Bu cetvel yazılmamıştı; render/önbellek `docs/standards/` altındaki tek boşluktu ve hata
> tam o boşlukta yaşadı.

---

## 1. Rota sınıfları (her rota BİRİNE aittir)

| Sınıf | Nasıl | Nerede | Neden |
|---|---|---|---|
| **Statik + talep-üzerine ISR** | `generateStaticParams()` + **`revalidate = 3600` (yedek)**; birincil tazeleme webhook ile | Vitrin: ana sayfa · kategori · alt kategori · marka · ürün (PDP). *(`destek/konular` statik içerik — yedek eklenmedi)* | LCP/SEO. Bu sayfalar herkese aynı; istek başına üretmek israf |
| **Tam statik** | `export const dynamic = 'force-static'` | Yasal metinler · hakkımızda · iletişim | İçerik deploy dışında değişmez |
| **Dinamik** | `export const dynamic = 'force-dynamic'` | Admin/** · hesap/** · API rotaları | Kullanıcıya/oturuma özel; önbelleklenirse veri sızar |

**`ssr: false` ana rotalarda YASAK** (CLAUDE.md kural 4). İstemci-tarafı veri gerektiren
parçalar `<Suspense fallback={<Skeleton/>}>` ile akıtılır, sayfanın tamamı CSR'a düşürülmez.

## 2. Fiyat hangi yüzeyde görünür

**Karar (Recep, 2026-08-15): fiyat YALNIZ ürün satış sayfasında (PDP) gösterilir.**

| Yüzey | Fiyat | Not |
|---|---|---|
| PDP (`/[lang]/products/[family-slug]`) + varyant seçici | **EVET** | Tek gösterim yeri |
| Aile/ürün kartları, kategori, keşif, marka, ana sayfa, arama | **HAYIR** | `ProductCard` çağrıları `hidePrice` geçer |
| Sepet · checkout · sipariş özeti | EVET | Satın alma akışının kendisi |
| Admin · hesabım/siparişlerim | EVET | Yetkili görür / kendi siparişi |

**Gerekçe iki yönlü:** ticari karar (kartta fiyat istenmiyor) ve mimari kural aynı yere bakıyor
— `product-schema-standard.md` §2.2 **PS-042**: fiyat/stok verisi keşif önbelleğini
(`products-discovery-${tenantId}`) çökertmemeli. Kart fiyat taşımazsa keşif önbelleği de
taşımaz ve fiyat değişimi keşif'i tazelemek **zorunda kalmaz**.

> **DİKKAT — bu iki kavram AYRIDIR, birleştirilirse satış yolu sessizce kapanır:**
> `quoteMode` = *satın alınabilir mi* (fiyat yoksa sepet kapalı, "Teklif İste") ·
> `hidePrice`/`showPrice` = *gösterilecek mi*. Eskiden `ProductCard`'da tek değişkendi;
> fiyatı gizlemek istemek sepete eklemeyi de kapatıyordu.

**Kapı:** `INV-RENDER-1` (`src/__tests__/conformance/render-price-surface.test.ts`) — yasak
yüzeylerde `formatCurrency` çağrısı ve `hidePrice` geçmeyen `ProductCard` kullanımı kırmızı yanar.

## 3. Tazeleme sözleşmesi

**Statik vitrin sayfasında görünen HER tablonun (a) DB tetiği ve (b) webhook handler dalı
olmalıdır.** Biri eksikse veri değişir, sayfa değişmez — ve bunu hiçbir test görmez.

| Tablo | Tetik | Handler | Ne tazelenir |
|---|---|---|---|
| `products` | `on_products_change` | var | **aile** PDP yolu + (varsa) **ailenin SERİSİ** + (alan-duyarlı) keşif tag'leri |
| `categories` | `on_categories_change` | var | kategori yolları |
| `inventory_movements` | `on_inventory_movements_change` | var | **aile** PDP yolu + (varsa) **ailenin SERİSİ** + kategori yolu (**keşif'e dokunmaz** — PS-042) |
| `product_families` | `on_product_families_change` | var | aile PDP yolu + keşif tag'leri + (bu satır MODEL ise) **üstündeki SERİ** PDP yolu/tag'i |
| `product_prices` | `on_product_prices_ins_del` + `on_product_prices_upd` (`WHEN`) | var | **yalnız** o ürünün aile PDP yolu + (varsa) **ailenin SERİSİ** — keşif tag'lerine DOKUNMAZ (PS-042) |
| `product_images` | `on_product_images_change` | var | **aile** PDP yolu + (varsa) **ailenin SERİSİ** + keşif tag'leri + `/sitemap.xml` — ⚠️ tablo bugün **0 satır**; zincir T069 görsel yüklemesinden ÖNCE yerinde olmalı (sonra kurulursa görseller girer, hiçbir sayfa tazelenmez) |
| `brands` | `on_brands_change` | var | markanın **tüm ailelerinin** PDP yolları + keşif tag'leri |
| `price_lists` | `on_price_lists_change` | var | **tüm** ailelerin PDP yolları — keşif'e DOKUNMAZ (fiyat yalnız PDP'de görünür, `product_prices` ile aynı gerekçe). ⚠️ **FAN-OUT SINIRI:** aile sayısı kadar yol tazelenir (ölçüm 2026-08-17: **32 aile → 64 çağrı**). Birkaç yüz aileye çıkıldığında tag tabanlı çözüme geçilmeli — sınır burada **sayıyla** yazılı ki sessizce yavaşlamasın |

> **PDP AİLE KANONİKTİR** (`/[lang]/products/[family-slug]`). Yol tazelenirken **ürün** slug'ı
> kullanmak sessiz bir kaçaktır: prerender edilmiş yol aile slug'ı olduğu için var olmayan bir
> yol geçersiz kılınır ve sayfa hiç yenilenmez. `products` ve `inventory_movements` dalları tam
> bunu yapıyordu (2026-08-15 denetimi yakaladı); dört dal (`products`/`inventory_movements`/
> `product_prices`/`product_images`) artık tek yardımcıdan (`revalidateFamilyChain`) çözüyor.
>
> **`revalidateTag` yalnız o tag'i tüketen bir `unstable_cache` varsa iş görür.** `familyTag`'in
> tüketicisi yoktu → çağrı sessiz no-op'tu. PDP verisi `React.cache()` ile sarılı olduğundan
> PDP için etkili olan **`revalidatePath`**'tir.
>
> **T138-VH K6 (2026-08-21) — SERİ↔MODEL fan-out.** `product_families.parent_family_id` (`NULL`
> = seri/landing, `NOT NULL` = model/kart+PDP) prod'a girdikten sonra bir MODEL değiştiğinde İKİ
> sayfa bayatlar: modelin kendi PDP'si VE üstündeki SERİ landing'i (seri sayfası model kartını
> basıyor). `route.ts`'teki `walkFamilyChain`/`revalidateFamilyChain` bu zinciri yürür — hiyerarşi
> DB'de tek seviyeli garantilense de (`product_families_single_level_guard` tetiği) route buna
> KÖR, bu yüzden savunma amaçlı `MAX_FAMILY_CHAIN_HOPS` üst sınırı + döngü koruması vardır. Sınır
> aşılırsa SESSİZCE KIRPILMAZ: `console.error` + yanıt gövdesinde `fanoutTruncated: true`.
> Kapı: `route.tags.test.ts` içindeki `K6-a`/`K6-a2`/`K6-b`/`K6-c` testleri (sabotajla kanıtlandı).

Tetik fonksiyonu `public.handle_supabase_webhook()` jeneriktir (`TG_TABLE_NAME` ile tabloyu
kendi okur) — yeni tablo eklemek yalnız `create trigger` demektir.

**Kapı:** `INV-RENDER-2` (`src/__tests__/conformance/render-revalidation-contract.test.ts`) — yukarıdaki
tabloyu **çift yönlü** zorlar: her tablonun yaşayan bir tetiği VE handler dalı olmalı; ayrıca öksüz tetik
(tetik var, handler yok → boşuna HTTP) ve öksüz handler (handler var, tetik yok → **08-15 hatasının imzası**)
ayrı ayrı kırmızı yanar.

> ⚠️ **Yukarıdaki tablo testin GİRDİSİDİR, süsü değil.** `INV-RENDER-2` denetlenecek tablo listesini
> bu markdown tablosunun ilk sütunundan okur (`| \`tablo\` |` satırları). Yani buraya bir satır
> eklemek kapıyı o tablo için anında açar; biçimi bozmak (backtick'i kaldırmak, sütun sırasını
> değiştirmek) ise listeyi boşaltır — bu yüzden ayrı bir iddia "en az 5 tablo okunabildi mi" diye
> bakar. Elle tutulan ikinci bir kopya bilerek YOK: doküman ile test ayrışamasın diye.

> **Tetikler İKİ kaynakta yaşıyor.** İlk üçü (`on_products_change`, `on_categories_change`,
> `on_inventory_movements_change`) hiçbir migration dosyasında geçmez — yalnız
> `supabase/baselines/2026-06-12_public_schema.sql` anlık görüntüsünde tanımlıdır (repo'dan önce elle
> kurulmuşlar). Sonradan eklenenler `supabase/migrations/` altındadır. Kapı ikisini de tarar ve
> `create`/`drop` etkilerini **CI'ın uyguladığı sırayla** işleyerek yaşayan durumu hesaplar.
>
> **Sıra "kronolojik" değil, BAYT sırasıdır** — çünkü `supabase-migrate.yml` şunu yapar:
> `for f in $(ls -1 supabase/migrations/*.sql | sort)`. Depoda 8-haneli (`20250903_*`) ve 14-haneli
> (`20250915152500_*`) adlar yan yana yaşıyor; aynı gün için bu iki biçim bayt sırasında **ters**
> dizilir (`'1'` 0x31 < `'_'` 0x5F). Kapının ilk sürümü tarihe göre normalleştiriyordu ve bu
> sessiz-yeşil üretiyordu: aynı push'ta gelen `20260815_drop` + `20260815120000_recreate` ikilisinde
> test "tetik yaşıyor" derken CI tersini uygular ve prod'da tetik ölür. **Ders: bir kapı, doğru
> sandığı sırayı değil, ortamın uyguladığı sırayı modellemelidir.**
> *Açık kalem:* workflow `LC_ALL` set etmiyor, yani doğruluk runner locale'ine bağlı;
> `LC_ALL=C sort` yazılması EDGE'e bildirildi (`.github/workflows/**` onun şeridi).
>
> **Baseline ≠ tam şema dökümü.** `2026-08-13_public_schema.sql` kendi başlığında "trigger/RLS
> politikaları DAHİL DEĞİL" diyor ve içinde sıfır `create trigger` var. Bu yüzden "en yeni baseline
> yaşayan durumu tanımlar" varsayımı yanlış olurdu.
>
> **Açık kalem:** ilk üç tetiğin repoda hiçbir migration karşılığı olmaması gerçek bir drift riskidir —
> prod'da elle düşürülseler repo bunu göremez. Bunları idempotent bir migration'la repoya yazmak
> gerekir; migration prod'a otomatik uygulandığı için (CLAUDE.md kural 13) kullanıcı onayı ister.

### Prod doğrulaması (2026-08-15, `pg_trigger` sorgulandı)

Statik kapı repo SQL'ini denetler; **prod'un gerçekten aynı hâlde olduğu ayrıca ölçülmelidir.** Ölçüm:

| Tablo | Tetik | Etkin | `WHEN` | Fonksiyon `search_path` |
|---|---|---|---|---|
| `products` | `on_products_change` | ✅ | — | `pg_catalog, public, net` |
| `categories` | `on_categories_change` | ✅ | — | ✅ |
| `inventory_movements` | `on_inventory_movements_change` | ✅ | — | ✅ |
| `product_families` | `on_product_families_change` | ✅ | — | ✅ |
| `product_prices` | `on_product_prices_ins_del` | ✅ | — | ✅ |
| `product_prices` | `on_product_prices_upd` | ✅ | **var** | ✅ |

Üç sonuç: (1) §3 tablosu prod ile **birebir** — cetvel gerçeği anlatıyor; (2) 08-15 migration'ı doğru
uygulanmış, ayrık tetikler ve `WHEN` koşulu canlı; (3) `handle_supabase_webhook()` fonksiyonunun
`search_path` kilidi prod'da **duruyor** — yani kurulum betiklerindeki eksik `SET search_path`
teorik değil, çalıştırıldığında bu kilidi gerçekten düşürecek bir regresyondu.

**Kurulum SQL'i TEK KAYNAKTADIR: `scripts/webhook_setup.sql`.** `scripts/setup_webhooks.js` ve
`scripts/setup_webhooks_cli.js` bu dosyayı okuyup yalnız `REPLACE_WITH_ENV_SECRET`'i değiştirir;
kendi SQL kopyalarını **taşımazlar**.

Bu hâline üç turda gelindi ve yol öğreticidir. Başlangıçta aynı SQL üç yerde kopyalıydı ve **üçü de
yalnız ilk üç tetiği kuruyordu** — cetvel doğru, migration doğru, test yeşilken depo, 08-15 hatasını
yeni bir ortamda birebir yeniden kuran bir düğme taşıyordu; üstelik betik sonunda "Setup Completed
Successfully" yazıyordu (sahte başarı). Kopyaları tamamladım. Sonra "hangi kopya çalışıyor" sorusunu
statik olarak cevaplamayı denedim — o da kaçak verdi: tetikleri ölü bir değişkene taşımak, çağrıyı
`if (false)` dalına ya da yoruma almak kapıyı yeşil bırakıyordu. **Erişilebilirlik analizi metin
taramasıyla yapılamaz.** Kalıcı çözüm sorunun kendisini kaldırmak oldu: kopya yoksa "hangi kopya
güncel / hangisi çalışıyor" diye bir soru da yoktur.

**Kapı (`INV-RENDER-2`) bunu iki OLUMLU iddiayla zorlar** — olumsuz bir "kopya yok" iddiası yetmiyordu
(SQL'i başka bir dosyaya taşımak, betiğe başka bir `.sql` okutmak ya da kurulumu tamamen silmek
üçünde de yeşil kalıyordu):
1. `scripts/**` altında webhook tetiği kuran dosya kümesi **tam olarak** `webhook_setup.sql` olmalı.
2. Her kurulum betiği o dosyayı `readFileSync` ile okumalı ve bir yürütme çağrısına beslemeli.

**Migration eklerken kurulum kaynağı da güncellenir — ikisi ayrı kaynaktır.**

**Denetim notu (2026-08-15) — üç pas, beş sessiz-yeşil.** Bu kapının ilk iki sürümü denetimden
geçemedi. Bulunanların hepsi *kanıtlanmış* yanlış-negatiftir (bozma yapılıp test yeşil kaldığı
ölçülmüştür), koda bakarak "doğru görünüyor" demekle hiçbiri bulunamazdı:

| # | Kaçak | Nasıl gizliyordu |
|---|---|---|
| 1 | Keşif-kapısı koşulu (`table === 'a' \|\| table === 'b'`) handler dalı sanılıyordu | Gerçek `product_prices` bloğu silinebiliyordu |
| 2 | SQL düz `;` ile bölünüyordu (dollar-quote yok) | Fonksiyon gövdesinde **metin olarak** geçen `create trigger` gerçek sayılıyordu |
| 3 | Kurulum taraması dosyadaki **metne** bakıyordu | Tetikleri ölü bir `legacySql` değişkenine taşımak yetiyordu — 2'nin JavaScript boyutu |
| 4 | İç içe blok yorumu (`/* … /* … */ … */`, PG §4.1.5) | "Bloğu yorum yaparak kapatma" — en sık devre-dışı bırakma biçimi — görünmezdi |
| 5 | Tarihsiz migration adı | `hotfix_drop_*.sql` en başa sıralanıp `drop`'u hiçbir şeye denk gelmiyordu |

Ayrıca `table === "x"` (çift tırnak) bir öksüz handler'ı kaçırıyordu — repoda `quotes` lint kuralı
ve Prettier yapılandırması yok, yani çift tırnak meşru bir yazım.

**Ders: statik tarayıcının yanlış-negatifi, kapının hiç olmamasından daha kötüdür — çünkü yeşil
ışık güven üretir.** Yeni bir INV-* kapısı, en az bir kez *kendi kaçak senaryosu üretilerek*
çürütülmeden kapı sayılmaz.

**Yan bulgu — kurulum güvenlik sertleştirmesini geri alıyordu.** Betikler
`CREATE OR REPLACE FUNCTION … SECURITY DEFINER` yazıyor ama `SET search_path` yazmıyordu.
`CREATE OR REPLACE` fonksiyonun TÜM özniteliklerini yeniden yazar; `SET` yoksa `proconfig`
**silinir** ve `20260602070000_security_hardening.sql` ile getirilen kilit düşer — prod ölçümü
(yukarıda) o kilidin gerçekten durduğunu gösterdi, yani teorik değil canlı bir regresyondu.
Tek kaynağa `SET search_path = pg_catalog, public, net` eklendi (prod'daki canlı hâlle aynı);
sözdizimi gerçek bir PostgreSQL 17.4 kümesinde koşturularak doğrulandı (`prosecdef=t`,
`proconfig` dolu).

**Yan bulgu 2 — betikler `process.cwd()`'ye bağlıydı.** Repo kökü dışından koşulduklarında
`.env` + `.env.local`'i **yanlış dizine yazdıktan** ve prod DB'ye bağlanıp `CREATE EXTENSION`
çalıştırdıktan *sonra* patlıyorlardı: yan etki, ön koşul doğrulanmadan gerçekleşiyordu. Tüm yollar
artık betiğe göre (`import.meta.url`) çözülüyor ve `cli.js` gizli anahtarı üretmeden önce tek
kaynağın varlığını doğruluyor.

## 4. Bilinen sınırlar (dürüstçe)

- **Toplu fiyat yazımı = satır başına webhook.** Tetikler `FOR EACH ROW`; materialize 1044 satırı
  birden yazar. `UPDATE` tetiğinde `WHEN` koşulu **değişmeyen** satırları eler (asıl gürültü
  kaynağı buydu), ama fiyatların gerçekten hepsi değişirse (kur hareketi) tek tıkla ~1044 webhook
  ateşlenir ve bunlar yalnız ~32 aile yolunu tazeler. İşe yarar ama israf; toplu-değişimi tek
  çağrıya indirmek (statement-level tetik ya da materialize sonrası tek toplu tazeleme) açık kalemdir.
- **PPR hiç açılmadı** (*"kapatıldı" değil — `experimental.ppr` `next.config.mjs`'te hiçbir zaman
  olmadı*). Bugün olan şey SSG + Suspense streaming'dir; kuralın kendisi (Suspense sınırı) aynen
  geçerli, değişen yalnız yanlış adlandırmaydı. **Temizlenen yerler:** `CLAUDE.md` (yığın satırı +
  kural 5 başlığı) · `CONTEXT.md` (yığın tablosu notu + §14 madde 14 başlığı) · `README.md`
  (yığın tablosu + özellik maddesi — PPR'ı *sevk edilmiş özellik* diye pazarlıyordu) ·
  `public/llms.txt` (yeni ajanların onboarding SSOT'u) · `docs/standards/collaboration-protocol.md`
  (kural özeti). **Kalan:** `.claude/skills/venthub-architecture/` + `.agent/` ikizi hâlâ "PPR config"
  tetikleyicisiyle açılıyor ve kasten yok olan bir özelliğin kurulumunu öğretiyor; üretilmiş
  `docs/venthub_hvac_master.md` kopyaları kaynak (README) düzeldiği için sonraki sync'te düşer.
- **Webhook URL/secret'ı `handle_supabase_webhook()` gövdesinde literal** (env değil).
  Ortam değiştiğinde fonksiyon elle güncellenmeli.
- **Aile slug'ı her tetikte ayrı SELECT ile çözülüyor** (N+1). Mevcut desen; hacim artarsa
  toplu çözüm gerekir.

---

> v1.0 · 2026-08-15 · Bu cetvelin doğuş sebebi ölçülmüş bir olaydır, teorik bir tercih değil:
> fiyatlar yazıldı, sayfa değişmedi, sebebi görünmedi çünkü kuralı yazan bir yer yoktu.


---
# FILE: docs\standards\runtime-version-alignment-standard.md

# Çalışma Zamanı Sürüm Hizalaması — Cetvel v1.0

> **Kapsam:** Node.js **ana sürümü**. Tek soru: *kapıların ölçtüğü çalışma zamanı, siteyi
> gerçekten derleyip servis eden çalışma zamanı mı?*
> **Zorlayan kapı:** `INV-NODE-1` → `src/__tests__/conformance/runtime-version-alignment.test.ts`
> **İlk yazım:** 2026-08-18 (T092-VH) · **Ölçüm sahibi:** ALTYAPI

---

## 1. Niçin bu cetvel var — ölçülmüş boşluk

2026-08-18'de üç yüzey ölçüldü ve **ikisi ayrışmıştı**:

| yüzey | okunan değer | kaynak |
|---|---|---|
| Vercel — derleyen ve servis eden | `nodeVersion: "24.x"` | Vercel Projects API (`get_project`) |
| CI / kapılar | `node-version: '22'` (4 yerde) | `ci.yml:115`, `deploy-functions.yml:80` ve `:224`, `e2e-smoke.yml:83` |
| Geliştirici makinesi | `v22.16.0` | `node --version` |
| `package.json > engines` | **YOK** | ölçüldü |
| `.node-version` | **YOK** | ölçüldü |

Yani `ci`, `admin-smoke` ve `type-check` **Node 22'de** yeşil oluyordu; prod **Node 24'te**
derleniyordu. Bu, projenin en pahalı hata sınıfıdır: **kapının görmediği boşluk.** Ana sürüme
özgü bir davranış farkı CI'da yeşil görünüp prod'da patlar — ya da tersi, prod'da çalışan bir
şey kapıda kırmızı verir ve sahte-kırmızı avına saat harcanır.

Bu projede riski taşıyan somut yüzeyler:

- **Intl / ICU** — para ve tarih biçimlemesi. Fiyat vitrini ve i18n doğrudan etkilenir; ICU
  sürümü Node ana sürümüyle gelir.
- **undici / `fetch`** — Edge API çağrıları, webhook istemcileri.
- **`require(esm)` davranışı** — 22 ile 24 arasında değişti; karışık modül grafiği olan
  betikler farklı davranır.

## 2. SSOT: `package.json` > `engines.node`

**Tek doğru kaynak `package.json` içindeki `engines.node` alanıdır** ve biçimi `24.x`'tir.

Bu keyfi bir seçim değil, ölçülmüş bir platform davranışı: Vercel dokümanı
(`vercel.com/docs/functions/runtimes/node-js/node-js-versions`) bu alan için açıkça
*"This setting overrides any version selected in project settings"* diyor. Sonuç:

> `engines.node` yazıldığı anda prod sürümü **panodan depoya** taşınır.

Bu, cetvelin en önemli maddesidir. Pano ayarı bir kapının **göremediği** yüzeydir: kimse
farkında olmadan değiştirir, hiçbir test bilmez. `engines` ile aynı değer sürüm kontrolüne
girer, kod incelemesinden geçer ve `INV-NODE-1` tarafından ölçülür.

**Aralık yazmak yasak.** `>=24` teknik olarak geçerli görünür ama hangi ana sürümün koştuğunu
okuyana söylemez. Biçim `<MAJOR>.x` olarak kilitlidir ve kapı bunu ADIYLA doğrular.

## 3. Üç yüzey, tek değer

| yüzey | nerede yazılı | kim okur |
|---|---|---|
| **prod / build** | `package.json` → `engines.node` = `24.x` | Vercel (pano ayarını ezer) |
| **kapılar** | `.github/workflows/*.yml` → `node-version: '24'` | `actions/setup-node` |
| **lokal** | `.node-version` = `24` | `fnm`, `nvm`, `volta`, Vercel CLI |

`INV-NODE-1` üçünün **ana sürümünün** eşit olduğunu ölçer. Yama sürümü serbesttir (24.3 ile
24.9 arasındaki fark bu cetvelin konusu değil); ayrışma **ana sürümde** tehlikelidir.

## 4. Niçin 24 — ve niçin 26 değil

`nodejs/Release` `schedule.json` 2026-08-18'de okundu:

| sürüm | durum | EOL |
|---|---|---|
| v22 | **maintenance** (2025-10-21'den beri; yalnız güvenlik/kritik yama) | 2027-04-30 |
| **v24** | **Aktif LTS** (2025-10-28'den beri) ← **hedef** | 2028-04-30 |
| v26 | **henüz LTS DEĞİL** — LTS 2026-10-28'de | 2029-04-30 |

Yani Node 22 bugün bir **güvenlik** sorunu değil (20 aylık desteği var); sorun **ayrışmanın
kendisi**. Ve en yeniyi kovalamak da yanlış olurdu: 26 LTS olmadan üretim çalışma zamanı
seçilmez. Hedef, prod'un zaten koştuğu ve aktif LTS olan **24**'tür.

## 5. Ana sürümü değiştirme usulü

Bu bir "sürüm güncellemesi" değil, **bilinçli bir karar**dır. Sırayla:

1. **Ölç:** `nodejs/Release` `schedule.json` — hedef sürüm *Aktif LTS* mi? Değilse dur.
2. **Tek PR'da üç yüzeyi birlikte değiştir:** `engines.node`, `.node-version`, tüm workflow
   pinleri. Kapı zaten üçünü birden ölçtüğü için yarım geçiş kırmızı verir — bu kasıtlıdır.
3. `INV-NODE-1` içindeki `BEKLENEN_MAJOR` sabitini güncelle. Bu sabit bir **fren**dir: kapı
   kendi hedefini dosyalardan türetmez, yoksa "hepsi tutarlı biçimde YANLIŞ" durumu sessizce
   geçerdi.
4. **Kanıt CI'dır:** yeni ana sürümde `ci` + `admin-smoke` + Vercel preview yeşil olmalı.
   Lokalde ölçmek yeterli DEĞİL — lokal, tanımı gereği üçüncü yüzeydir.
5. Cetveldeki tabloları ve tarihleri güncelle.

## 6. Bilinen sınır — dürüstçe

- **Pano ayarı hâlâ orada.** `engines` onu ezer, ama pano değerini bu kapı **okuyamaz** (repo
  dışı yüzey). Ezme davranışına güveniyoruz; kanıtı Vercel dokümanı ve preview build'in
  kendisi. Ezmenin bir gün değişmesi bu cetvelin varsayımını çürütür — o gün yeniden ölçülür.
- **Lokal makine gecikebilir.** `pnpm install` `engines` uyuşmazlığında **kırılmaz** (ölçüldü:
  2026-08-18, `engine-strict` ayarlı değil, `pnpm install` çıkış kodu 0 — yalnız uyarır). Bu
  kasıtlı bir yumuşaklıktır: filoyu gün ortasında bloke etmemek için. Ama lokal 22'de kalırken
  kapılar 24'te koşuyorsa, **lokal ölçüm prod kanıtı değildir** — o dönemde kanıt CI'dır.
- **Prod ana sürümü, platform yüzeylerinden OKUNAMIYOR — 2026-08-19'da üç yüzey tek tek denendi:**
  Vercel build günlüğü Node sürümünü hiç yazmıyor · dağıtım kaydında `nodeVersion` alanı yok
  (`lambdaRuntimeStats` yalnız `{"nodejs":5}` diyor, sürüm değil) · `/api/health` `process.version`
  yayınlamıyor. Bu yüzden "prod 24'te koşuyor" iddiası bir dönem **ölçüme değil belgeye** dayandı.
  Boşluk `scripts/assert-node-major.mjs` ile kapatıldı: derleme sırasında sürümü **günlüğe basar**
  (pozitif satır) ve ayrışmada derlemeyi **düşürür**. Reddedilen alternatif: sürümü bir uç noktadan
  yayınlamak — kalıcı bir public bilgi-sizdirma yüzeyi, tek seferlik bir doğrulama için fazla bedel.
- **Betik `prebuild` DEĞİL, `build` betiğinin İÇİNE zincirlenmiştir.** Ölçüldü: depoda `.npmrc` yok,
  dolayısıyla pnpm'in `enable-pre-post-scripts` ayarı varsayılan `false` — `prebuild` yazmak **hiç
  koşmayan** bir bekçi yazmak olurdu. `INV-NODE-1` bu çağrının `scripts.build` içinde kalmasını ölçer.
- **Ölçülen şey BUILD çalışma zamanıdır, lambda çalışma zamanı DEĞİL.** İkisinin aynı ana sürüm
  olduğunu **varsayıyoruz**; bu varsayım ölçülmedi ve burada adıyla durur. Lambda tarafını ölçmenin
  bilinen tek yolu çalışma zamanı sürümünü dışarıya yayınlamaktır ve o bedel kabul edilmedi.
- **Lokal muafiyet ADIYLA:** `assert-node-major.mjs` yalnız `VERCEL` veya `CI` ortamında **katı**dır
  (çıkış 1); geliştirici makinesinde **uyarır ve geçer**. Gerekçe §6'nın ilk maddesiyle aynı: filoyu
  gün ortasında bloke etmemek. Muafiyet **yalnız lokaldedir**; CI ve Vercel'de muafiyet yoktur.
  Hedef türetilemiyorsa (`engines.node` yok/bozuk) betik **lokalde de** düşer — *ölçemedim ≠ geçtim*.
- **`pnpm` ana sürümü bu cetvelin konusu değil.** Workflow'lardaki `pnpm/action-setup version: 10`
  ile lokal pnpm ayrı bir hizalama kalemidir; karıştırılmasın.

## 7. Kapı ne ölçer, ne ölçmez

**Ölçer:** `engines.node` var mı ve `<MAJOR>.x` biçiminde mi · `.node-version` aynı major mu ·
tüm workflow pinleri hedef major mu · her `setup-node` adımı **kendi** sürümünü beyan ediyor mu
(beyan etmeyen adım action'ın sessiz varsayılanına düşer) · ölçüm gerçekten yapıldı mı
(workflow dizini boş gelirse kapı **susmaz**, kırmızı verir — *ölçemedim ≠ geçtim*).

**Ölçmez:** Vercel pano değeri (repo dışı) · geliştirici makinesinin gerçek `node --version`'ı
(kapı CI'da koşar, orada zaten pin geçerlidir) · yama sürümü farkları.

**Pin sayısı bilerek sabitlenmedi.** "Tam 4 pin olmalı" demek, yeni workflow ekleyen şeridi
ilgisiz bir kırmızıyla cezalandırırdı. Kapı yerine *her* `setup-node` adımının pinli ve hedef
majorda olduğunu ölçer — kapsam büyüyünce kapı kendiliğinden büyür.


---
# FILE: docs\standards\session-loop-ritual.md

# Oturum Açılış Ritüeli — Loop Komutları (SSOT)

> **Ne zaman:** Bilgisayar/oturumlar yeniden açıldığında. Loop zincirleri (ScheduleWakeup) ve
> gözcüler oturum-içi yaşar — kapanışta ölürler. Pano/registry/PR'lar ise kalıcıdır; hiçbir iş
> kaybolmaz, yalnız "motorlar" durur. Bu dosya motorları yeniden çalıştırmanın tek kaynağıdır.
>
> **Ritüel (3 adım):** (1) Tüm pencereleri aç. (2) Bu dosyayı aç. (3) Her pencereye aşağıdaki
> İLGİLİ komutu yapıştır — OPS-AUDIT penceresine KOMUT-A, diğer HERKESE KOMUT-B (aynı metin).
>
> Oturum→rol eşlemesi panodadır (`node scripts/board/board.cjs who`); şerit adları akışkandır,
> komut metni şerit adı İÇERMEZ — şerit, atanan işle gelir.

---

## KOMUT-A — Orkestratör (yalnız OPS-AUDIT penceresi, `cb0467f1`)

```
/loop Orkestratör turu: (1) panoyu ve bana adresli notları oku, gerekeni işle/yönlendir;
(2) açık PR'ların check durumunu ölç — kendi şeridimdeki migration'sız yeşil PR'ı merge et,
başka oturumun canlı PR'ına ve migration'lı PR'a ASLA dokunma; (3) oturum/filo canlılığı
ölç — "koptu" hükmü ÇİFT sinyal ister (nabız VE not sessizliği); ana dizinin master'da
park olduğunu kontrol et; boş oturumları ve tamamlanan şeritleri tespit edip Recep'e raporla;
(4) registry ve hafızayı güncel tut; (5) Recep kararı gereken şeyleri biriktir, tek toplu
mesajda sor. Migration / prod yazımı / geri-alınamaz işlem = her zaman Recep kapısı.
Recep'e cevap her zaman mesajın EN BAŞINDA, tur raporundan ayrı; her girdisine açık kapanış.
İlk turda: gelen-kutusu gözcüsünü yeniden kur (notlar GÖNDERENİN events dosyasına yazılır).
```

## KOMUT-B — İşçi (diğer TÜM pencereler, tek ortak metin)

```
/loop İşçi turu: (1) Panodan bana adresli notları oku — OPS-AUDIT'ten (cb0467f1) gelen atama
birincil talimattır; notlar GÖNDERENİN events dosyasına yazılır, kendi dosyana bakma; şerit
adım son atanan işten gelir, panodan doğrula. (2) Elimdeki işi sürdür: ölç → plan → uygula →
kapılar → PR; migration'lı PR'ı YALNIZ Recep merge eder; kendi şeridimdeki migration'sız
yeşil PR'ı kendim alırım. (3) Durum değişince (bitti/tıkandı/PR açıldı/kuyruğum boş)
OPS-AUDIT'e adresli not bırak; Recep kararı gereken şeyi kendim çözmem, OPS-AUDIT'e iletirim.
(4) DEMİR KURALLAR: ana çalışma dizinine DOKUNMA (iş = kendi worktree'm) · pano notunda
backtick YOK · monitor kurarken kullandığım aracın VARLIĞINI önce doğrula (jq bu makinede
YOK) · Recep'le konuştuğum HER turun sonunda — istisnasız — loop'u (ScheduleWakeup) yeniden
kur, yoksa zincir sessizce ölür. İşim varken sık (5-10dk), boşken seyrek (30dk) tur atarım.
```

---

## Her iki komuttan SONRA: YEDEK CRON (zorunlu adım)

Dinamik zincir (`ScheduleWakeup`) **tek noktadan** kopabiliyor: Recep araya girdiğinde tur
biter ve zincir yeniden kurulmazsa oturum sessizce uyur. Bu yüzden komutu yapıştırdıktan
sonra her oturum **ikinci bir kanal** kurar:

```
CronCreate ile 30 dakikalık recurring iş: prompt = o pencerenin KOMUT-A/KOMUT-B metni
```

- **Dakika 0/30 SEÇME** (ör. `23,53 * * * *`). Herkesin `0/30` seçmesi filoyu aynı ana
  yığıyor; ayrıca kendi turlarımız da üst üste gelir.
- Cron **yalnız yedektir**: birincil kanal `ScheduleWakeup`. Cron tetiklerse tur kısa tutulur
  ve dinamik zincir **yeniden kurulur**.
- Cron **oturum ömürlüdür** (diske yazılmaz, Claude kapanınca gider) ve **7 günde** kendini
  siler. Yani sabah pencere yenilendiğinde bu adım da yeniden yapılır.
- Kurduktan sonra **iş kimliğini panoya bildir** — "kurdum" demek yetmez, kanıt iş kimliğidir.

> Bu adımı **insan hatırlatmaz**: `board-brief` kancası, şerit talep etmemiş taze bir oturuma
> `LOOP:` satırıyla bunu kendisi söyler (T085-VH, bekçi `INV-BOARD-5`). Şerit alınınca satır
> kendiliğinden susar — sessizlik kuralı korunur.

## Notlar

- **Gece kesintisiz otonomi** isteniyorsa bu ritüel yetmez (makine kapanınca durur) →
  `/schedule` ile bulut rutini ayrı kurulur (Recep kararı).
- Bu dosya SSOT'tur: komut metni değişecekse ÖNCE burada değişir, sonra pencerelere girilir.
- Kaynak kararlar: `docs/standards/collaboration-protocol.md` (şerit sahipliği, tek-giriş
  kuralı, ana-dizin parkı) · memory `autonomy-ladder-and-loop` (tasarım gerekçesi).


---
# FILE: docs\standards\settled-work-standard.md

# Çözüldü (Settled) Standardı — v1.0

> **Bu dosya nedir?** Bir işin ne zaman "çözüldü" sayılacağının ve sonradan bakan bir ajanın onu
> **yeniden ölçmeden** ne zaman doğru kabul edebileceğinin kuralı.
>
> **Neden var?** (Recep, 2026-08-22) "İleride geriye dönük bakıldığında, bir çalışma yapılmış ve
> eksiksizse, o ajanın bunu istisnasız doğru kabul etmesini nasıl sağlarız? Olmazsa mükerrer
> tekrarlar olur." Aynı gün canlı kanıt: ÜRÜN'ün "ağırlık sapması" diye taşıdığı açık kalem
> ölçülünce ne DB'de ne kaynakta çıktı — **hatırdan yazılmış** bir kalemdi; bir geçersizlik-şartına
> bağlı olmasaydı biri onu "düzeltmeye" çalışıp saatler yakardı.

## 0. Gerilim: iki ders çarpışıyor

- **"Tamamlanma kanıtlanır, varsayılmaz"** (completion-proven-not-assumed) → düz bir "BİTTİ" notuna
  güvenme.
- **"Ölçümü kodlayan yorum bayatlar"** (comment-encoding-a-measurement-goes-stale) → "bugün 32 aile"
  yazan bir not yarın yanlış olur.

Uzlaşma: **Güven bedava değildir; güveni bir mekanizma taşır.** Düz "bitti" kaydına güvenilmez;
kendini yeniden kanıtlayan bir **kapı** ya da açık bir **geçersizlik-şartı** taşıyan kayda güvenilir.

## 1. İki meşru "çözüldü" biçimi

### A) BEKÇİLİ çözüldü (tercih edilen)
İş, kendini her CI'da **saniyeler içinde yeniden kanıtlayan** bir teste (INV / conformance /
integrity-check) bağlıdır. Örnek: SEAT birim sözleşmesi → `catalog-integrity` spec-unit değişmezi.

- **Sonradan bakan ajan işi ELLE ÖLÇMEZ. Yeşil kapıya bakar, geçer.** Kapı ölçümün kendisidir;
  biri bozarsa kırmızı olur.
- Kapı varken elle yeniden ölçmek **yasaktır** (mükerrer emek + kapıyla çelişme riski).
- Kapı, "artık buna dönme" demenin **tek meşru yolu**dur — hem insanı hem ajanı geri bakmaktan kurtaran şey odur.

### B) ŞARTLI çözüldü (kapı kurulamayan bir-kerelik işler için)
Her iş testle korunamaz (bir defalık ölçüm, dış-kaynak kararı). Bunlar deftere yazılır ama düz
"BİTTİ" değil — **geçersizlik-şartıyla**:

```
ÇÖZÜLDÜ: <ne kanıtlandı> · KANIT: <ölçüm/dosya:satır/PR> · TARİH: <YYYY-MM-DD>
GEÇERSİZ OLUR EĞER: <bu koşul oluşursa yeniden ölçülür>
```

- Sonradan bakan ajan tek şeye bakar: **geçersizlik-şartı oluştu mu?** Oluşmadıysa güvenir, elle
  ölçmez. Oluştuysa yeniden ölçer.
- Şartı bayatlatan **zaman değil, öncüllerin değişmesidir** (Recep 08-22: "sadece zaman geçti =
  bayat değil; elektrik kesintisi gibi düşün"). Şart, zaman değil **değişim** cümlesidir.
- Örnek (08-22, gerçek):
  - `ÇÖZÜLDÜ: pilot migration prod'da (kolon/tetik/check/indeks 1/1/1/1, sabotajla kanıtlı).
    GEÇERSİZ OLUR EĞER: product_families şeması değişirse.`
  - STORM 18 ağırlığı BİLE BİLE buraya KONMADI — o kalem "çözüldü" DEĞİL, hâlâ açık (prod-GO
    bekliyor). İlk yazdığım şart ("OEM föyü repoya girerse geçersiz") daha baştan yanlıştı; bkz §5.

## 2. GEÇERSİZ ÖNCÜL — üçüncü sonuç (kritik)
Bir kalem sonradan ölçülünce **dayanağı bulunamıyorsa** (hatırdan yazılmış, korpusta yok), o kalem
"çözüldü" DEĞİL, **"geçersiz öncül"** olarak kapatılır ve farkı işaretlenir — ki aynı tuzağa
düşülmesin. Bu bir başarısızlık değil, dürüstlüktür. (Kaynak: 08-22 ağırlık-sapması kalemi.)

## 2.1 AÇIK kalemler de öncül taşır (ÜRÜN önerisi, 08-22)
Bu cetvel yalnız "çözüldü"yü değil **"açık"**ı da kapsar. Bir kalem `open` taşınıyor olsa bile,
**üzerine iş başlamadan önce** öncülünün ölçüm dayanağı sorulur:

- Kalem, öncülünü (kaç ürün, hangi değer, nerede) taşıyan bir **ölçüm referansı** (DB sorgusu /
  `dosya:satır` / katalog s.N) içeriyor mu?
- İçermiyorsa (hatırdan yazılmış) → **iş başlamadan ölç.** Aksi halde geçersiz bir öncül üzerine
  saatler harcanır — "düzeltme" diye var olmayan bir şey aranır.

Aynı gün iki canlı örnek, ikisi de açık kalemdi ve ölçülünce dayanaksız çıktı:
`23,7↔37,8 ağırlık sapması` (37,8 ne DB'de ne 74-CSV korpusunda var) · `Danfoss 17 ürün`
(doğrusu **34**: FC-101 17 + FC-102 17). Kural: **açık kalem = ölçülmüş öncül + kanıt; yoksa önce ölç.**

## 3. Registry bağı (uygulama)
Bir iş `completed` durumuna geçerken **ya bekçisini (A) ya geçersizlik-şartını (B)** kaydına yazmak
ZORUNLUDUR. İkisi de yoksa `completed` sayılmaz — `open` kalır ya da "kanıtsız-tamam" olarak işaretlenir.
Bu, "doküman commit'lendi ≠ iş bitti" (doc-committed-not-work-done) dersinin registry karşılığıdır.

## 4. Sonradan bakan ajanın kuralı (özet karar akışı)
```
Bir kalem "çözüldü" görünüyor mu?
 ├─ Bekçisi (INV/gate) var mı?  → EVET: yeşilse GÜVEN, elle ölçme. Kırmızıysa o kırmızı senin işin.
 ├─ Geçersizlik-şartı var mı?   → EVET: şart oluşmadıysa GÜVEN. Oluştuysa yeniden ölç.
 └─ İkisi de yok (düz "bitti")  → GÜVENME. Ölç ve çözüldüyse bu cetvele göre yeniden kaydet.
```

## 5. Bilinen sınırlar
- Bekçi kurmak maliyetlidir; her kalem hak etmez. Küçük/nadir kalemler için (B) yeterli.
- Geçersizlik-şartı **iyi yazılmalı** — çok darsa yanlış-güven, çok genişse hiç güvenilmez. Şart,
  ölçülebilir bir olguya bağlanır ("X tablosuna satır eklenirse", "kademe-2 tekrar koşarsa").
- **Kapanış şartının kendisi de yanlış yazılabilir** (ÜRÜN, 08-22). STORM 18 örneği: şart "OEM föyü
  repoya girerse geçersiz" yazıldı; oysa föy zaten repodaydı (`seat-content-manifest.json:140`, doğru
  değer 70.4/77 kg) → şart **daha baştan karşılanmıştı**, kalem "çözüldü" değil hâlâ AÇIK. Kural:
  kapanış şartını yazarken önkoşulun **şu an** karşılanıp karşılanmadığını da ölç.
- Bu cetvel "çözüldü mü" sorusunu yönetir; "doğru mu" sorusunu değil — doğruluğu (A)'daki kapı ya da
  (B)'deki kanıt taşır.

İlgili: [[completion-proven-not-assumed]] · [[comment-encoding-a-measurement-goes-stale]] ·
[[standard-plus-enforcing-test-is-control]] · [[work-tracking-ssot-model]] ·
`measurement-discipline-standard.md` · `execution-method-standard.md`


---
# FILE: docs\standards\spec-axis-standard.md

# Spec Ekseni Cetveli — `products.technical_specs`

> **Sürüm:** 1.0 · **Tarih:** 2026-08-23 · **Şerit:** URUN · **Görev:** T158-VH
> **Kapsam:** `products.technical_specs` içindeki her alanın **ne taşıdığı** ve
> **hangi koşulda ölçüldüğü**. Veri taşıma / şema değişikliği bu cetvelin konusu DEĞİLDİR
> (ikisi de Recep kapısı); burada yalnız kural ve ölçülmüş durum yazılır.

## 0. Niçin var — iki yanılgı, aynı gün

Bu cetvel bir denetimden değil, **iki kez yanılmaktan** doğdu.

**Birinci yanılgı (sabah).** "Aynı fiziksel büyüklük markaya göre farklı anahtar adıyla
yazılıyor" diye ölçtüm: güç Danfoss'ta `rated_power_w`, diğerlerinde `max_absorbed_power_w`;
ses Vortice'te `noise_level_db_a`, SEAT'te `noise_lpa_3m_db`. Çözüm olarak "kavram → kanonik
anahtar eşlemesi" önerdim — yani alanları **birleştirmeyi**.

**Bu öneri zararlıydı.** Daha derin ölçüm gösterdi ki:

- `noise_lpa_3m_db` **3 metrede** ölçülmüş ses basıncıdır (SEAT, 45–77 dB).
  `noise_level_db_a` mesafe beyan etmez (Vortice, 25–79,5 dB). Birleştirilirse **ölçüm
  mesafesi bilgisi yok olur** ve geri getirilemez.
- `rated_power_w` **frekans konvertörünün** anma gücüdür (Danfoss, 34 ürün,
  `frequency-converters` kategorisi). Fan değil, sürücü. Fanın çektiği güçle aynı sütuna
  konamaz.
- `nominal_delivery_m3h` ile `max_delivery_m3h` farklı **çalışma noktasıdır**; SEAT ikisini
  de kullanır (66 ürün nominal, 21 ürün max).

**İkinci yanılgı (öğleden sonra).** Birinci yanılgıyı, aynı gün yazdığım seçim sihirbazının
okuma katmanına da gömmüştüm (`wizard.service.ts` içinde `sesDbA: ['noise_level_db_a',
'noise_lpa_3m_db']`). Sessiz fan kategorisinde tek marka olduğu için zarar görünmüyordu; başka
bir kategoriye bağlandığı gün **yanlış "en sessiz" önerisi** üretecekti. Düzeltildi (T150 4/4).

**Çıkan ders:** alanlar farklı adlarda çünkü **gerçekten farklı şeyler**. Kusur onların
varlığı değil; bir yüzeyin bunları **aynı eksendeymiş gibi** kullanabilmesi.

## 1. Üç kural

### K1 — Alan adı BİRİMİ taahhüt eder; değer yalnız SAYI taşır

Adı `_w`, `_mm`, `_m3h`, `_pa`, `_a`, `_v`, `_kg`, `_c`, `_l`, `_hz` ile biten bir alanın
değeri **çıplak sayı** olmalıdır. Birim ada yazılıdır, değerde tekrarlanmaz.

Bunun ihlali "boş alan"dan tehlikelidir: alan **dolu ve makul görünür**, ama sayısal her işlem
(karşılaştırma, sıralama, filtre, hesap) o satırı sessizce **veri yok** sayar.

İlgili: `field-name-commits-to-a-unit` — aynı ailenin birim tarafı (aynı alanda marka başına
farklı birim: kW ↔ W).

### K2 — Alan adı EKSENİ taahhüt eder

Eksen = **hangi büyüklük** + **hangi koşulda**. Koşul, adın içinde yaşamalıdır:

| koşul türü | örnek | ne söyler |
|---|---|---|
| ölçüm mesafesi | `noise_lpa_3m_db` | 3 metrede ses basıncı |
| çalışma noktası | `max_delivery_m3h` · `nominal_delivery_m3h` · `min_delivery_m3h` | serbest üfleme / anma / alt sınır |
| ürün rolü | `rated_power_w` (sürücü) ↔ `max_absorbed_power_w` (fan) | hangi cihazın gücü |

Koşulu belirsiz bir ad (`noise_level_db_a` — mesafe yok) **kıyas için zayıftır**; yeni alan
açılırken koşul ada yazılır.

### K3 — Kıyas yalnız AYNI eksende yapılır

Bir filtre, sıralama, "en iyi/en sessiz" seçimi ya da hesap motoru, yalnız **aynı ekseni**
taşıyan değerleri yan yana koyabilir. Farklı eksen söz konusuysa üç seçenek vardır ve
**dördüncüsü yoktur**:

1. **Dönüştür** — dönüşüm fiziksel olarak tanımlıysa (m³/h ↔ L/s gibi) ve dönüşüm yazılıysa.
2. **Ayrı taşı** — iki ekseni iki alan olarak tut, kullanıcıya hangisi olduğunu söyle.
3. **Bilmiyorum de** — değeri `null` bırak; o ürün o boyutta öne çıkmaz ama **elenmez**.

**Sessizce birleştirmek yasaktır.** Yanlış sıralamaktansa bilmediğini söylemek doğrudur.

## 2. Ölçülmüş durum (2026-08-23, canlı DB, 374 aktif ürün)

### 2.1 K1 ihlalleri — değerin içinde birim

| alan | marka | ürün | örnek | sonuç |
|---|---|---|---|---|
| `max_delivery_m3h` | Nicotra Gebhardt | **35 / 35** | `"10500 m³/h"` | markanın **tamamı** sayısal debi kıyasına giremez |
| `voltage_v` | SEAT | 3 | `"220 V"` | — |
| `operating_temperature_c` | Vortice | 3 | `"5 - 32"` | aralık; tek sayı değil, ayrı eksen |

**En ağırı Nicotra:** 35 ürünün 35'inde debi alanı **dolu**, sayısal olan **0**. Yani bu marka
bugün hiçbir sayısal debi yüzeyinde görünemez — ve alan dolu olduğu için doluluk raporlarında
"tamam" görünür. Doluluk sayımı bu kusuru **gizler**.

### 2.2 Aynı büyüklüğün farklı eksenleri (ihlal DEĞİL — beyan edilmesi gereken)

| büyüklük | eksenler (ürün sayısı) |
|---|---|
| debi | `max_delivery_m3h` 242 · `nominal_delivery_m3h` 89 · `min_delivery_m3h` 21 · `max_delivery_ls` 180 |
| basınç | `max_static_pressure_pa` 160 · `nominal_static_pressure_pa` 78 · `min_static_pressure_pa` 15 |
| ses | `noise_level_db_a` 142 (Vortice) · `noise_lpa_3m_db` 66 (SEAT) |
| güç | `max_absorbed_power_w` 279 · `rated_power_w` 33 (sürücü) · `heating_power_w` 8 · `optional_heater_power_w` 3 · `heating_capacity_kw` 4 |
| gerilim | `voltage_v` 274 · `min_voltage_v` / `max_voltage_v` 33 · `voltage_alt_v` 7 |
| akım | `absorbed_current_a` 163 · `rated_output_current_a` 33 · `max_current_a` 2 |
| koruma | `ip_rating` 209 · `enclosure_class` 33 |
| gövde ölçüsü | `size_a/b/c/d_mm` (Vortice) · `width/height/length_mm` (AVenS) · `connection_width/height_mm` |

**Dikkat — birim ayrışması:** `heating_power_w` (W) ile `heating_capacity_kw` (kW) aynı
kavramı iki birimde taşır. İkisi bin kat farklıdır; aynı sütuna konursa hata sessizdir.

### 2.3 Eğri alanları (şekil ekseni)

`pq_curve` (145 ürün) `[[Q,P],…]` biçiminde **JSON string**; `thermal_efficiency_curve` (13)
ve `discharge_velocity_curve` (8) ise nesne dizisi (`{"airflow_m3h":…, "efficiency_pct":…}`).
Aynı tabloda **üç farklı şekil**. Okuyan taraf şekli varsaymaz, tanır ve tanıyamadığında
uydurmaz (bkz. `ductFanSelection.parsePQCurve`).

## 3. Yeni marka / yeni kaynak bağlanırken

İlk soru "hangi alanlar geldi" **değildir**. Sırasıyla:

1. Bu kaynağın her alanı **hangi büyüklüğü hangi koşulda** ölçüyor? (katalogda yazılıdır)
2. Bizde aynı eksende bir alan **var mı**? Varsa aynı adı kullan.
3. Yoksa **koşulu ada yazarak** yeni alan aç — mevcut bir alana "yakın olduğu için" yazma.
4. Değerler çıplak sayı mı? Değilse ingestion'da **birimi ayır**, değere gömme (K1).
5. Ürün **rolü** aynı mı? (fan ↔ sürücü ↔ ısıtıcı) Farklıysa alan da farklıdır.

## 4. Kapı

K1'i bekçileyen kural `scripts/db/checks/catalog-integrity.mjs` içindeki **`spec-type`**'tır:
adı sayısal birim eki taşıyan bir alanda sayısal olmayan değer bulursa alan|marka bazında sayar.

> **Düzeltme (2026-08-23).** Bu bölümün ilk sürümü "kapı henüz yazılmadı, `spec-value-not-numeric`
> adında yeni bir kural gerekiyor" diyordu. **Yanlıştı** — betik ölçülmeden, hatırdan yazılmıştı.
> `spec-type` zaten vardı ve Nicotra'nın 35 kaydı tabanda gerekçesiyle affedilmişti bile. Gerçek
> boşluk kuralın yokluğu değil, **kapsamının darlığı**ydı: sonek listesi dokuz kalemdi
> (`v|m3h|w|pa|kg|mm|a|ls|pct`) ve K1'in listesiyle örtüşmüyordu. (memory:
> `scope-written-from-memory-not-measured`)

**Kapsam ölçülerek genişletildi.** Canlı DB'deki 34 ayrı anahtar soneki tek tek elden geçirildi;
birim olanlar eklendi (`_c`, `_l`, `_ms`, `_hz`, `_db`, `_kw`, `_24h`), birim olmayanlar
(`_type`, `_class`, `_sensor`, `_curve`, `_rating`, `_code`, `_model`, `_size`, `_max`, …) kasten
dışarıda bırakıldı — ikincisini eklemek kapıyı gürültüye boğar ve gürültülü kapı kapatılır.
Genişletmenin ölçülen bedeli **tek yeni sınıf**: `operating_temperature_c` (Vortice, 3 kayıt,
`"5 - 32"`); yani dokuzdan on altı soneğe çıkmak **sıfır yanlış kırmızı** üretti.

**Kapsamın kendisinin de bir kapısı var:** `src/__tests__/conformance/spec-axis-gate.test.ts`
(INV-SPEC-AXIS-1). Sonek listesini betikten **okur** (kopyalamaz) ve iki yönlü kanaryayla sınar:
birim eki taşıyan ad yakalanmalı, taşımayan ad yakalanmamalı. Tek yönlü kanarya listeyi `.*`
yaparak da geçilirdi. Sınav sabotajla doğrulandı: eski dar desen kanaryada **8 ad kaçırıyor**.

Taban (`catalog-integrity-baseline.json`) **yalnız kısalır**: bugünkü ihlaller gerekçesiyle
affedilmiştir, **yeni ihlal eklenemez**. K2 ve K3 bugün için insan kuralıdır — makine kapısı
ancak alanlar eksen etiketiyle beyan edilirse mümkün olur, o da şema işidir (Recep kapısı).

## 5. İlgili

- `docs/standards/product-schema-standard.md` — alan kümesinin kendisi
- `docs/standards/catalog-ingestion-standard.md` — kaynaktan yazım hattı
- `src/lib/services/wizard.service.ts` — K3'ün kodda uygulanmış hâli (eksen karıştırmaz)
- `src/lib/hvac/ductPressure.ts` — dış kaynağa (fluids) karşı doğrulama deseni


---
# FILE: docs\standards\storefront-design-standard.md

# Storefront Tasarım Cetveli (Storefront Design Standard)

> **SSOT.** Müşteri-yüzü storefront'un görsel KOMPOZİSYON kuralları. Token *değerleri* burada değil —
> değer SSOT'u `src/design-system/tokens.js` (boyut/gölge/süre) + `src/index.css` (renk CSS değişkenleri,
> HSL). Bu cetvel o değerlerin **nasıl birleştirileceğini** sabitler; değer çakışırsa token SSOT kazanır.
> **Kapsam:** `src/` eksi admin (→ `admin-standard.md`), eksi 3D sahne (→ `3d-webgl-standard.md`).
> v1.0 · 2026-08-13 — hava-perdeleri onarımı (#486/#487) + drift ölçümü sonrası ilk sürüm.
> Zorlama planı: §4 (INV-9 ratchet → screenshot taraması → PageKit). Bkz. `standard-plus-enforcing-test-is-control` deseni.

---

## 1. Niçin: token VAR, kompozisyon YOK

Design-token altyapısı kurulu (tokens.js + CSS değişkenleri + "arbitrary yasak" kuralı), ama hiçbir
kural iki sayfanın **aynı dili konuşmasını** zorlamıyor. Ölçüm (2026-08-13, admin hariç `src/`):

| Eksen | Ölçülen drift |
|---|---|
| Konteyner | `max-w-7xl` **49×** vs token `max-w-page` **36×** — iki farklı sayfa genişliği (1280 vs 1600px) |
| Gri | **ÜÇ aile:** ham `slate-*` **1116×** + token `steel/industrial-gray` **592×** + ham `gray-*` **252×** |
| Yarıçap | ham `rounded-2xl/3xl` **194×** vs token `rounded-hvac-*` **50×** — token 1'e 4 kaybediyor |
| Vurgu | `navy` 373× / `cyan` 177× / ham `blue-*` 90× / ham `indigo-*` 15× |
| Ağırlık | `font-black` 150× vs `font-extralight` 22× — rol tanımı yok |
| Ritim | 7 farklı `py-*` bölüm değeri aktif (8→32) — bölüm ölçeği yok |

Sorun standart *yokluğu* değil; token **değer** tanımlıyor, **kompozisyon** tanımlanmamış + hiçbir
kapı zorlamıyor. Bu cetvel kompozisyonu tanımlar; §4 kapıları zorlar.

---

## 2. Değişmezler (İHLAL ETME)

### 2.1 Konteyner: tek sayfa genişliği

- **Kanonik dış konteyner = `max-w-page`** (100rem/1600px) + `mx-auto` + kenar boşluğu
  (`px-4 sm:px-6 lg:px-8` deseni). Her üst-seviye bölüm aynı konteynerde hizalanır.
- Okuma kolonu (uzun metin) = `max-w-content` (900px) veya `max-w-prose` (65ch). Modal = `max-w-modal`.
- ❌ `max-w-7xl` (ve diğer ham `max-w-*xl`) **yeni kodda yasak** — LEGACY, ratchet ile eritilecek.
  *Gerekçe (karar):* token zaten `page`'i tanımlıyor; iki genişliğin karışımı bitişik sayfalarda
  görünür hiza kırığı yaratıyor. 1600px geniş vitrin (3D/hero) için bilinçli seçimdi — korunuyor.

### 2.2 Gri: TEK aile = tema-farkındalı token

- Ham Tailwind grileri (`slate-*`, `gray-*`, `zinc-*`, `neutral-*`) **yeni kodda yasak.**
  *Gerekçe (karar):* tema `darkMode: 'selector'` + CSS değişkeni ile dönüyor (`index.css` light/dark
  blokları aynı değişkeni yeniden tanımlar); ham `slate-600` temayla **dönmez** → dark-mode kırığı.
  Üstelik üç ailenin ton eğrileri farklı (slate mavi-gri, gray nötr) → yan yana kirli görünüm.
- **Rol → token eşlemesi:**

| Rol | Token |
|---|---|
| Başlık / güçlü metin | `text-industrial-gray` |
| Gövde / ikincil metin | `text-steel-gray` |
| Soluk / caption | `text-steel-gray/70` (alpha modifier) |
| Açık yüzey / ayraç | `light-gray`, `clean-white` |
| Koyu yüzey katmanları | `surface-deep → darker → darkest / midnight / navy / navy-mid` |

- Yüzey derinliği `surface-*` merdiveniyle kurulur; keyfî `bg-slate-900/xx` katmanlama yasak.

### 2.3 Vurgu hiyerarşisi

- **Birincil marka = `primary-navy`** · etkileşim/ikincil = `secondary-blue` · enerji/glow = `brand-cyan`.
- Semantik sabitler: `success-green` / `warning-orange` / `italian-red` (Vortice) / `vortice-green` —
  yalnız kendi anlamında.
- ❌ Ham `blue-*`, `indigo-*`, `cyan-*`, `sky-*` yeni kodda yasak; ❌ HEX renk yasak
  (CLAUDE.md kural 8 — CSS custom property HSL).

### 2.4 Köşe yarıçapı: `rounded-hvac-*` skalası

| Rol | Token |
|---|---|
| Buton / input / chip | `rounded-hvac-sm` (6px) |
| Kart | `rounded-hvac-md` (16px) |
| Panel / bölüm bloğu | `rounded-hvac-lg` (24px) |
| Hero / modal / büyük yüzey | `rounded-hvac-xl` (32px) ve üstü |

- ❌ Ham `rounded-xl/2xl/3xl` yeni kodda yasak — LEGACY, ratchet.

### 2.5 Tipografi rolleri (ağırlık disiplini)

| Rol | Kural |
|---|---|
| Display (hero başlık) | `text-display` + `font-black` + sıkı tracking — `font-black` **yalnız burada** |
| H1 / H2 | `font-bold` |
| H3 / kart başlığı | `font-semibold` |
| Gövde | `font-normal` |
| Eyebrow / teknik etiket | `uppercase` + `tracking-hvac-*` + `font-medium` |
| Display alt-başlık | `font-extralight`/`font-light` — **yalnız display eşliğinde** |

- Satır yüksekliği token'dan (`leading-hvac-*`); gövde satır uzunluğu ≤ `max-w-prose`.

### 2.6 Dikey ritim: üç bölüm rolü

- **Kompakt** = `py-12` · **Standart** = `py-16 md:py-24` · **Hero/vitrin** = `py-24 md:py-32`.
- Ara/keyfî değer (`py-14`, `py-[72px]` vb.) yasak. PageKit `<Section>` geldiğinde bu üçlü prop olur
  (`density="compact|standard|hero"`); o güne dek sınıflar elle bu üçlüden seçilir.

### 2.7 Görsel kuralları (VentImage dersi — #486/#487)

- Ham `<img>` **yasak**; storefront görseli `<VentImage>` ile (istisna gerekçeli `next/image`).
- **Foto** (ürün/lifestyle/ambiyans) = `object-cover` — kırpılabilir içerik.
- **Metin/etiket taşıyan teknik diyagram** = `object-contain` + sabit oranlı konteyner
  (`aspect-4/3` vb.) — kırpma metni keser, `cover` YASAK. (Hava-perdeleri dersi: diyagramın
  sağ yarısı kırpılmıştı.)
- `fill` modunda parent `relative` + boyutlu olmalı; `fill`'siz modda `width`/`height` **zorunlu** (CLS, kural 10).
- `sizes` gerçek yerleşime göre verilir (varsayılana bırakma).
- **Dış hotlink YASAK:** görsel kaynağı = Supabase Storage veya `/public`. DB `image_url` alanları
  üçüncü-taraf URL taşıyamaz (ölü Unsplash URL dersi). 3D GLB CDN whitelist'i AYRI ve korunur (kural 9).
- `fallbackType` bağlama göre doğru seçilir (`product`/`category`/`brand`) — hepsine `generic` verme.

### 2.8 Gölge / elevasyon

- Katman derinliği `elevation-1..5` merdiveni; marka gölgeleri `hvac-*`/`glow-*` token'ları.
- ❌ Yeni serbest `shadow-[...]` yasak (kural 8'in uzantısı); yeni ihtiyaç → tokens.js'e ekle.

### 2.9 Erişilebilirlik ve performans (mevcut kuralların teyidi)

- Odak: `focus-visible:` (hover-only affordance yasak) · metin kontrastı AA.
- Below-the-fold ağır bölümlere `.content-auto` · her görselde boyut (CLS) · animasyon süre/easing
  yalnız token'dan (`duration-hvac-*`, `ease-hvac-*`).

---

## 3. Serbestlik alanları (cetvel BUNLARA karışmaz)

Cetvel sayfanın **dilini** sabitler, **hikâyesini** değil. Sayfa başına serbest:

- Hero art-direction (görsel, kompozisyon, 3D sahne, gradient kurgusu — renkler §2.2/§2.3'ten olmak kaydıyla)
- Bölüm sayısı, sırası, anlatı kurgusu; grid/split/asimetrik yerleşim seçimi
- İllüstrasyon, ikonografi, mikro-animasyon (süreler token'dan)
- Kategoriye özel vurgu yoğunluğu (ör. endüstriyel sayfada koyu `surface-*` ağırlığı)

Kural: serbestlik **token değerleriyle** kurulur; serbestlik alanı hiçbir zaman §2'yi delme izni değildir.

---

## 4. Zorlama katmanları (yol haritası)

1. ✅ **INV-9 stil-conformance testi (ratchet) — 2026-08-18'de YAZILDI ve CANLI**
   (`src/__tests__/conformance/storefront-style-ratchet.test.ts`; 7 ratchet + 2 sert kapı +
   bayatlık kilidi + vacuous-pass koruması; 10 sabotajla kanıtlandı). Ayrıntı → §5.
   Özgün tarif: §5 baseline sayımları; yeni kod sayacı **artıramaz**,
   göç dalgaları düşürür (i18n INV-5 ratchet deseni). Statik tarama gotcha'ları →
   `conformance-test-static-scan-gotchas` (import.meta.glob, tam-literal kök glob, stale-guard).
2. **Rota × breakpoint screenshot taraması (Playwright):** storefront rotaları × {mobil/tablet/desktop}
   görüntü envanteri → başlangıç görsel skoru + regresyon yakalama (statik kapıların göremediği
   kırpma/CLS/hiza sınıfı için; hava-perdeleri hatalarının hiçbirini statik kapı görmemişti).
3. **PageKit primitifleri + maestro göçü:** `Section` / `SectionHeader` / `FigureImage` —
   cetvel kuralları primitife gömülür (admin kit deseninin storefront'a uygulanışı), sayfalar
   maestro dalgalarıyla göçer. **Sıra: fiyat motorundan SONRA** (Recep önceliklendirmesi).

---

## 5. Ratchet baseline (admin hariç `src/`) — **CANLI: `INV-9`**

**Kapı yazıldı ve CANLI:** `src/__tests__/conformance/storefront-style-ratchet.test.ts`.
Tavanların **otoritesi artık testtir**, bu tablo değil — aşağısı okunabilir bir özettir.

| Sayaç (LEGACY desen) | 08-13 | **08-18 tavan** | Tür |
|---|---|---|---|
| `max-w-7xl` | 49 | **49** | ratchet |
| Ham gri (`slate-*` + `gray-*`) | 1396 | **1508** | ratchet |
| Ham `rounded-xl/2xl/3xl` | 378 | **391** | ratchet |
| Ham vurgu (`blue-*` + `indigo-*`) | 143 | **148** | ratchet |
| Display dışı `font-black` | 150 | **133** | ratchet |
| Keyfî `shadow-[...]` | — | **3** | ratchet |
| Keyfî `w/h/text/gap-[...]` | — | **6** | ratchet |
| Ham `<img>` | 0 | **0** | 🔒 sert kapı |
| Keyfî `p*-[...]` | 0 | **0** | 🔒 sert kapı |

> ⚠️ **08-13 sütunu ÜÇ satırda düzeltildi (2026-08-18).** Önceki tablo `rounded` için
> "194+", `blue` için 90 diyordu; aynı regex o commit'te koşulunca gerçek sayılar **378**
> ve **125** çıktı — yani baseline'ın kendisi yarım sayılmıştı. Sonuç: 08-18 ölçümü ilk
> bakışta "desen iki katına çıktı" gibi göründü, oysa gerçek sapma **~+132**. **Ders:**
> ölçüm YÖNTEMİ yazılmamış bir baseline, sonraki ölçümü yanlış alarma çevirir. Bu yüzden
> her sayacın regex'i ve kapsamı artık testin İÇİNDE yaşıyor (test = SSOT'un ikinci yarısı).

**Tavanlar niçin 08-13'e değil BUGÜNE sabitlendi:** geriye çekmek kapıyı doğuştan kırmızı
yapardı; kırmızı doğan kapı ya devre dışı bırakılır ya görmezden gelinir (bu depoda
`eslint` `warn` seviyesinin başına gelen tam buydu — fail-open). Ratchet geçmişi
cezalandırmaz, **geleceği kapatır**; sapmanın kaydı yukarıdaki tabloda duruyor.

**Bayatlık kilidi:** sayaç tavanın altına düşerse test **kırmızı yanar** ve tavanı
indirmeni ister. Bu bir regresyon değil ödüldür — ratchet ancak tek yönlü sıkışırsa
ratchet'tir, yoksa göç dalgasının kazandığı zemin sessizce geri verilebilir.

### 5.1 ÖLÇÜLEMEZ-STATİK (kapı bunları görmez — adıyla işaretli)

Statik tarama şu kuralları **yapısal olarak** göremez; "kapı yeşil" bunların uyulduğu
anlamına **gelmez**:

| Kural | Niçin statik ölçülemez | Nereye devredildi |
|---|---|---|
| §2.6 bölüm dikey ritmi (`py-12/16/24/32`) | İzinli-set dışı 365 isabetin değerleri `py-1/2/3` — buton/rozet dolgusu, bölüm dolgusu değil. Bir elemanın "bölüm" rolünde olduğu className'den bilinemez. Ham sayıyı ratchet yapmak 365 yanlış-KIRMIZI üretirdi. | §4.3 PageKit `<Section density>` primitifi (yapısal zorlama). Statik zorlanabilen dar dilim — keyfî `p*-[...]` — kapıya **alındı**. |
| §2.7 `object-cover` / `object-contain` ayrımı | Doğru seçim görselin **foto mu teknik diyagram mı** olduğuna bağlı; bu semantik bilgi kodda yok. (Hava-perdeleri kırpma hatası tam bu sınıftı.) | §4.2 Playwright görsel katmanı |
| §2.3 vurgu hiyerarşisi · §2.5 rol eşleşmesi · §2.1 konteynerin bağlamda doğruluğu | Hepsi "bu eleman hangi rolde" sorusunu gerektirir | §4.2 + kod incelemesi |
| Kırpma / CLS / hiza / görsel regresyon | Statik kapı bu sınıfı hiç göremez | §4.2 Playwright |

---

## 6. Karar kayıtları (kısa gerekçe)

- **Konteyner = `max-w-page` (7xl değil):** token SSOT'ta bilinçli tanımlı (1600px geniş vitrin);
  iki genişlik karışımı ölçülen en görünür hiza kırığı.
- **Gri = token ailesi (slate değil, çoğunlukta olmasına rağmen):** tek tema-farkındalı aday —
  ham Tailwind grisi dark-mode selector'da dönmüyor; çoğunluğu seçmek tema kırığını kanonikleştirirdi.
- **Yarıçap/gölge/süre = mevcut `hvac-*`/`elevation-*` token'ları:** yeni skala icat edilmedi;
  cetvel var olan token'a rol atar (standart-önce, yeniden-yazma değil).
- **Görsel kuralı primitifte zorlanır (sayfada değil):** sayfa-seviyesi fix'in yetmediği
  VentImage kırpma dersi — kural paylaşılan primitife gömülmeli (→ FigureImage/PageKit).


---
# FILE: docs\standards\storefront-reflow-standard.md

# Vitrin Reflow Cetveli — WCAG 2.2 SC 1.4.10 (v1.0, 2026-08-16, T050-VH)

> Sahip: EDGE-OPS şeridi. Kapı: `e2e/reflow.e2e.ts` (INV-REFLOW-1, `admin-smoke`
> zorunlu kontrolünün parçası — `pnpm exec playwright test` tüm spec'leri toplar).
> Teşhis aracı: `scripts/a11y/reflow-scan.mjs` (ADMIN şeridinde; elle koşulur,
> ağaçta inen kök-kanıtlı ölçüm yapar). İkisi aynı taşma tanımını kullanır.

## Kural

**R1.** Vitrin sayfaları **320 CSS px** genişlikte (≡ 1280px viewport @ %400 zoom)
yatay kaydırma **gerektirmeden** sunulur. Ölçü: `scrollingElement.scrollWidth -
innerWidth ≤ 1px` (sub-pixel payı).

**R2.** 320 tek başına yetmez: dar ekranda düzen mobil dala geçip kurtulur; ölçülen
kırılmalar ~768–1100px bandındaydı (masaüstü dalı devrede, alan dar). Kapı
**320 / 768 / 1024 / 1280** genişliklerinin tamamında ölçer.

**R3. Kırpma çözüm değildir.** `html`/`body` üzerinde `overflow-x: hidden|clip`
YASAK (b6a2e14d'de kaldırıldı): taşmayı kullanıcıdan gizler ama içerik erişilmez
kalır — ihlal sürer; `clip` ayrıca ölçüm aracını körleştirir. Taşma kökünden
düzeltilir (suçlu elemanı `reflow-scan.mjs` ile kanıtla, aday listesiyle yetinme —
atası `overflow:hidden` olan aday belge taşmasına katkı vermez, #540 dersi).

## Ölçüm geçerliliği (kapının kendisi için — üçü de zorunlu)

**M1. Uygulama-gerçekliği:** ölçümden önce sayfanın uygulamaya ait olduğu doğrulanır
(`html[lang]` + site iskeleti). Yaşandı: Vercel deployment-protection sayfası ölçüldü,
8 rota "tertemiz" çıktı — yanlış hedef, sessiz hep-yeşil.

**M2. Enstrüman kanıtı:** her sayfa+genişlikte gerçek ölçümden önce kasıtlı 5000px
taşma enjekte edilir; araç onu göremezse test KIRMIZI (ölçülemedi ≠ geçti). Yaşandı:
`overflow-x: clip` altında `scrollWidth` taşmayı asla raporlayamaz.

**M3. Kapıyı bilerek boz:** kapıya dokunan her değişiklikte sabotaj kanıtı sunulur
(taşma ekle → kırmızı; geri al → yeşil). Kapsamın kendisi kanıt değildir. Sabotaj turunda
her aşama, sunucunun O build'i servis ettiğini imzayla kanıtlamalı — v1 turu bunu yapmadığı
için baştan sona BAYAT artefaktı ölçtü ve üç farklı sabotaj aynı sonucu verdi.

**M4. Mobil emülasyonda viewport YENİDEN BOYUTLANDIRILMAZ.** Ölçüldü: Pixel 7 emülasyonunda
`setViewportSize(1024)` sonrası kasıtlı 5000px enstrüman yalnız **904px** ölçülüyor (mobil
`<meta viewport>` + shrink-to-fit düzeni ölçekliyor) → belge taşması masaüstündeki anlamını
yitiriyor. Mobilde ölçüm CİHAZIN KENDİ genişliğinde yapılır (Pixel 7 → 412px, sentinel
3352px görülüyor). Genişlik taraması masaüstü projesinin işidir.

## Kapının kanıt defteri (2026-08-16, T050-VH)

Her iddianın ateşlendiği gerçek koşul — "kapsam" değil, tetiklenmiş kanıt:

| İddia | Tetikleyen | Sonuç |
|---|---|---|
| R1 taşma | `body { min-width: 2000px }` | 5 KIRMIZI · "belge 1680px yatay taşıyor" |
| R3 kırpma (html) | `html { overflow-x: hidden }` · `html { overflow-x: clip }` | 5 KIRMIZI · "taşmayı GİZLER" |
| R3 kırpma (body) | `body { overflow-x: clip }` | 5 KIRMIZI · "taşmayı GİZLER" |
| M2 enstrüman | mobil emülasyon + viewport resize (GERÇEK koşul) | 5 KIRMIZI · "ÖLÇÜLEMEDİ (904px)" |
| Kontrol grubu | tertemiz kaynak | 10 YEŞİL (masaüstü 5 + mobil 5) |

Not: `body { overflow-x: clip }` enstrümanı KÖRLEŞTİRMEZ (belge `documentElement` üzerinden
ölçülür); kırpma yasağı ile enstrüman körlüğü ayrı koşullarla kanıtlanır.

## Kapsam ve bilinçli sınırlar

- Rotalar: `/tr, /tr/products, /tr/cart, /tr/support, /tr/hakkimizda` (kritik vitrin).
  Yeni kritik vitrin rotası açan, kapının `ROUTES` listesine ekler.
- **Mobil hat:** `mobile-storefront` projesi (Pixel 7 emülasyonu) bu kapıyı bir de
  dokunma/mobil-UA altında koşar. **Checkout hunisi mobil projede DEĞİL** — gerçek login
  ister, parolası CI secret'ı (`E2E_ADMIN_PASSWORD`), yani yerelde doğrulanamıyor.
  Doğrulanmamış bir spec'i zorunlu kontrole sokmak, kırmızıda herkesin merge'ini bloklar.
  Bu adlı ve tarihli bir eksiktir (2026-08-16): mobil huni, kimlik bilgisiyle
  doğrulanabildiği anda eklenir.
- **Admin** kapsam dışı: mobil/dar tasarımı henüz yok (ADMIN Faz-5 ölçümünde kayıtlı
  açık). Kapıya koymak regresyon değil eksik-özellik kırmızısı üretir ve kapı sökülür.
  Admin dar-ekran tasarımı geldiğinde bu muafiyet KALDIRILIR (muafiyet = adlı, süreli).

## Değişiklik günlüğü

- v1.0 (2026-08-16, T050-VH): ilk sürüm — #540'ta elle bulunan taşma sınıfı kalıcı
  kapıya bağlandı; mobil viewport hattı açıldı.


---
# FILE: docs\standards\subagent-delegation-standard.md

# Alt-Ajan Devri Cetveli (Subagent Delegation Standard)

> **Bu cetvel şu soruyu cevaplar:** bir işi kendim mi yapayım, alt-ajana mı devredeyim;
> devredeceksem kaç tanesine, hangi modelle, neyi yasaklayarak ve sonucu neye göre kabul ederek?
>
> Kapsam: Claude Code oturumlarının açtığı alt-ajanlar (Agent aracı). Oturumlar-arası
> koordinasyon (eş-Controller / şerit sahipliği / pano) bu cetvelin konusu **değildir** —
> o `collaboration-protocol.md` içindedir.
>
> Durum: v1.0 · 2026-08-22 · ÜRÜN şeridi · dayanak: aşağıdaki her kural yaşanmış bir olaydan damıtıldı.

---

## 1. Önce karar: devretmeli mi?

Alt-ajan **bedava değildir**. Maliyeti üç kalemdir: görev tarifini yazma emeği, sonucu
doğrulama emeği, ve yanlış sonucun sessizce kabul edilme riski. Devir, ancak bu üçünün
toplamı işi kendin yapmaktan **ucuzsa** kârlıdır.

**Devret** — iş şu üç özellikten en az ikisini taşıyorsa:
- **Geniş tarama:** cevap çok sayıda dosya/kayıt/sayfa arasına dağılmış, sen yalnız sonucu istiyorsun.
- **Bağımsız:** başka bir işin çıktısını beklemiyor, başka işin girdisini bozmuyor.
- **Doğrulanabilir:** sonucun doğru olup olmadığını, ajanın anlatısına bakmadan, kendi
  ölçtüğün bir sayı/dosya/HTTP cevabı ile sınayabiliyorsun.

**Devretme** — şu durumlarda kendin yap:
- **Tek dosyada tek gerçek** aranıyor (nerede olduğunu zaten biliyorsun) → doğrudan oku.
- İş **karar** üretiyor, veri değil. Karar senin ve kullanıcının; ajan karar veremez.
- İş **geri alınamaz** bir eylem içeriyor (§3).
- Sonucu doğrulamanın maliyeti işi yapmanın maliyetine yakın. O zaman devir yalnız
  **risk taşımış** olur, iş azaltmaz.

---

## 2. Karar tablosu: iş türü → araç

| İş türü | Araç | Model | Paralel? |
|---|---|---|---|
| "Ne çağırıyor / neyi etkiler / nerede tanımlı" | **CodeGraph** (ajan değil) | — | — |
| "Bu kural neden böyle / mimari karar" | **NotebookLM ikizi** veya `CONTEXT.md` | — | — |
| Bilinen dosyada bilinen sembol | Doğrudan `Read` | — | — |
| Geniş kod taraması, konum bulma | `Explore` ajanı | Sonnet | Evet |
| Belge/PDF/web'den veri çıkarma, katalog eşleme | `general-purpose` | **Sonnet** | Evet |
| Salt-okuma DB denetimi, hipotez ölçme | `general-purpose` | **Sonnet** | Evet |
| Kod yazma + test koşturma | **Kendin** (veya TEK ajan) | — | **HAYIR** (§4) |
| Prod veri yazımı, migration, PR merge | **Kendin, kullanıcı GO'su ile** | — | — |

**Mekanik okuma Sonnet'e gider.** Föy okuma, tablo çıkarma, kod tarama, sayım — bunlar
muhakeme değil, dikkat işidir; daha büyük model buna harcanmaz.

---

## 3. Alt-ajana MUTLAK YASAKLAR

Her görev tarifine **kelimesi kelimesine** yazılır. Yazılmamış yasak, yasak değildir:
ajan varsayılan olarak yardımsever davranır ve boşluğu doldurur.

1. **Veritabanına yazma YASAK.** Yalnız `SELECT`/`GET`. `--apply`, `PATCH`, `INSERT`,
   `UPDATE` hiçbir koşulda yok.
   *Niçin:* bir alt-ajan bir kez kendiliğinden prod'a yazdı. Okuma ile yazma **ayrı**
   yetkidir; ajanın eline yalnız okuma verilir.
2. **PR açma YASAK.** Ajan dal push edebilir; PR'ı açan ve merge eden oturumdur.
   *Niçin:* PR bir beyandır — "bu iş bitti, incelenebilir". Beyanı, sonucu doğrulayan taraf verir.
3. **Değer uydurma YASAK.** Bulunamayan veri **boş bırakılır** ve "KAYNAK YOK" yazılır.
   *Niçin:* zorunlu görünen bir alan uydurmaya basınç uygular; bir kez boş hücreler ardışık
   sayılarla dolduruldu ve dördü kaynakta hiç yoktu.
4. **Geri alınamaz kabuk komutu YASAK** (`push --force`, `reset --hard`, dosya silme,
   dağıtım tetikleme).
5. **Kapsam dışı dosyaya dokunma YASAK.** Ajanın yazabileceği yollar tarifte **adıyla** sayılır.
6. **Sistem değişikliği YASAK.** Paket kurulumu (`winget install`, `npm i -g`, `pip install`,
   `apt`, `brew`), PATH değişikliği, servis/daemon başlatma, global yapılandırma yazımı.
   İhtiyaç duyduğu araç yoksa ajan bunu **rapor eder, kurmaz.**
   *Niçin:* 2026-08-22'de bir ajan PDF sayfalarını görüntüye çevirmek için `winget` ile
   poppler kurdu. Araç zararsızdı ve iş doğru çıktı — ama karar bana ait değildi ve ben
   ancak iş bittikten sonra öğrendim. Sistem değişikliği **oturumdan uzun yaşar**: ajan
   biter, kurulum kalır. Devrin sınırı ajanın ömrüyle bitmeli.

   **Yasak olan kurulumun kendisi değil, izinsiz kurulumdur.** Kapı iki kademelidir
   (kullanıcı onayı 2026-08-22):
   - **Düşük riskli, geri alınabilir, yerel** araç (PDF aracı, geliştirme bağımlılığı) →
     **lider onayı yeterlidir.** Ajan "şu lazım, kurayım mı?" diye sorar; lider onaylar,
     kayda geçirir ve kullanıcıya **bildirir** (görünürlük onayın parçasıdır).
   - **Geri alınamaz / prod veri yazımı / migration / silme / güvenlik-hassas** →
     **yalnız kullanıcı.** Bu kademe devredilemez.
   - **Emin değilsen üst kademeyi say.** Varsayılan sıkı taraftır.

---

## 4. Paralellik kuralı: çakışma yüzeyine göre

Paralelliğin sınırı model değil, **paylaşılan yazılabilir yüzeydir**.

- **Salt-okuma ajanları:** serbestçe paralel. Ortak yüzey yok, çakışma yok.
- **Aynı worktree'de dosya yazan ajanlar:** **paralel çalıştırılmaz.** Aynı çalışma
  ağacında ikinci bir ajanın `checkout`'u, birincinin commit'lenmemiş işini yer.
  Ya tek ajan, ya her birine ayrı worktree izolasyonu.
- **Kod yazan iş + kod okuyan iş:** aynı anda olur, yazan **tek** olduğu sürece.

Pratik dizilim: **okuma işlerini fan-out et, yazma işini kendinde tut.** Bu, kazancın
büyük kısmını çakışma riski almadan verir.

---

## 5. Görev tarifi şablonu

Zayıf tarif, zayıf sonucun **asıl** sebebidir; ajanın yeteneği değil. Bir tarifte şu altı
blok bulunur:

1. **Rol ve mod:** "SALT-OKUMA araştırma ajanısın."
2. **Mutlak yasaklar:** §3'ten ilgili maddeler, kelimesi kelimesine.
3. **Bağlam ve cetvel:** hangi kural dosyası geçerli — **yolu ver, özetini de ver.**
   Ajan dosyayı okumazsa diye özet; okursa diye yol.
4. **Eşleme/karar kuralı:** belirsizlik nasıl çözülecek. Örn: *"Ada göre eşleme YAPMA;
   referans kodu ↔ `model_code` birebir eşleşmesi kur. Eşleşmeyeni EŞLEŞMEDİ diye ayır."*
   *Niçin:* eşleme kuralı verilmezse ajan en yakın benzerliği seçer ve bunu bulgu diye sunar.
5. **Ölçülecek şey, hipotez biçiminde:** "H1 … H4; her birine DOĞRULANDI / ÇÜRÜTÜLDÜ /
   ÖLÇEMEDİM ver." Serbest "araştır" tarifi anlatı üretir, ölçüm üretmez.
6. **Çıktı şeması:** başlıklar tek tek sayılır — envanter, kaynak (URL/yol), eşleme tablosu,
   **eşleşmeyenler**, çelişkiler, risk notu.

**"ÖLÇEMEDİM" seçeneğini daima tarifte sun.** Sunulmazsa ajan boşluğu tahminle doldurur ve
tahmin, ölçümden ayırt edilemez biçimde raporlanır.

---

## 6. Sonucu kabul etme kuralı

Ajanın raporu **iddiadır, kanıt değildir.** Kabul etmeden önce:

- **Bir örneği kendin ölç.** Rapordaki bir satırı seç, kaynağına git. Tutmuyorsa raporun
  tamamı şüphelidir — çünkü aynı yöntem tüm satırları üretti.
- **Sayıyı değil mekanizmayı iste.** "26 kayıt düzeltilebilir" bir sayıdır; hangi kaynağın
  hangi satırının bunu söylediği mekanizmadır. Sayı doğrulanamaz, mekanizma doğrulanır.
- **Negatif kanıta bak.** "Eşleşmeyenler" bölümü boşsa bu iyi haber değil, **şüphe**
  sebebidir: gerçek veride her zaman artık kalır.
- **Ajanın hatasını peşinen kabul etme, peşinen reddetme de.** Ajan bir keresinde benim
  verdiğim zayıf eşleme kuralını kendiliğinden daha sağlamıyla değiştirdi ve haklıydı.
- **Yalnız çıktıyı değil, ajanın NE YAPTIĞINI da denetle.** Rapor "şu değeri buldum" der;
  o değeri bulmak için makinede ne değiştirdiğini söylemeyebilir. Sistem durumunu
  (kurulu paket, yeni dosya, değişen yapılandırma) ayrıca ölç — özellikle ajan bir
  aracın eksik olduğundan söz ediyorsa.
- **Fiziksel/mantıksal tutarlılığı ücretsiz bir kapı olarak kullan.** Sayılar monoton mu,
  büyüklükler makul mü, birimler birbirini tutuyor mu — bu kontrol kaynağa gitmeden
  yapılır ve uydurma değerlerin çoğunu tek başına eler.

---

## 7. Kendi teşhisini çürüt

Buraya kadarki bölümler ajanın çıktısını denetlemeyi anlatıyor. Bu bölüm **kendi
çıktını** denetlemeyi anlatıyor ve daha önemlidir: ajanın hatasını yakalamak için zaten
şüpheci bakıyorsun, kendi teşhisine bakmıyorsun.

**Damıtıldığı olay (2026-08-22):** "Ürün sayfasının etiketleri koda gömülü bir haritadan
geliyor" diye teşhis koydum ve kullanıcıya ilettim. Yanlıştı — sayfa zaten sözlükten okuyan
doğru katmanı kullanıyordu, koda gömülü harita başka bir yüzeye (PDF üretimi) gidiyordu.
Hatayı ben bulmadım; başka bir şerit ölçüp düzeltti. **Tek şerit olsaydım yanlış teşhis
işe dönüşecekti.**

Beni yanıltan üç adım, sırayla:
1. Dosyayı arama ile buldum, içindeki fonksiyonu gördüm, **çağıranın onu kullandığını
   varsaydım** — çağrı zincirini okumadım.
2. Canlı sayfada o dizeyi **aradım ve bulamadım.** Yani teşhisi çürüten bir ölçüm elime
   geçti.
3. O ölçümü "araç kör olabilir" diye **geçtim** ve teşhisi değiştirmedim.

Üçüncüsü asıl hatadır. Araç gerçekten kör olabilir — ama körlük iddiası, teşhisi ayakta
tutmanın bedava yolu değildir: **körlüğü ayrıca kanıtlaman gerekir.**

### Uygulama

- **Teşhis ≠ ölçüm.** "Şu dosyada şu fonksiyon var" bir ölçümdür. "Sayfa onu kullanıyor"
  bir teşhistir ve ayrı ölçüm ister (çağrı zinciri, import, canlı çıktı).
- **Çürüten ölçüm gelirse teşhis değişir.** Aracı suçlamadan önce aracın kör olduğunu
  kanıtla; kanıtlayamıyorsan ölçüm haklıdır.
- **"Ölçtüm" ile "ölçebildim" ayrıdır.** Aracın göremediği yeri **adıyla** yaz:
  *"curl sunucu HTML'ini görür; varyant seçimi tarayıcıda olduğu için bu soruya kördür."*
  Bunu yazmayan bir ölçüm, cevabı "sorun yok" sanılır.
- **Çürütücü ajan koş.** Şu üç eşikte, kendi işini **yıkmakla görevli** bir ajan aç:
  (a) prod yazımından önce, (b) plan sunmadan önce, (c) kullanıcıya teşhis iletmeden önce.
  Tarifi doğrulama değil **çürütme** olmalı: iddiaları tek tek say, her birine
  ÇÜRÜTÜLDÜ / AYAKTA / ÖLÇEMEDİM dedirt, ve **"emin değilsen plan sahibinin aleyhine
  karar ver"** de. "Planı gözden geçir" diyen bir tarif, onay üretir.
- **"Bulamadım" ile "yok" ayrıdır.** Çürütücünün "ÖLÇEMEDİM"i bir başarı raporu değil,
  açık bir risktir; kullanıcıya öyle taşınır.
- Çok şeritli çalışmada başka bir şeridin seni düzeltmesi **şans**tır, mekanizma değil.
  Mekanizma, kendi kurduğun çürütmedir.

## 8. Devredilemez olanlar

Şunlar hiçbir koşulda alt-ajana geçmez:

- **Kullanıcı kapısı gerektiren her şey:** prod veri yazımı, migration merge, geri alınamaz eylem.
- **Kapsam kararı:** neyin yapılıp neyin bırakılacağı.
- **Sıra kararının kullanıcıya sunulması.**
- **Engellenmiş işin başkasına yaptırılması.** Bir izin/kapı seni durdurduysa çözüm
  yapılandırmayı düzeltmektir; işi engellenmemiş bir tarafa devretmek **izin aklamasıdır**.

---

## 9. Bu cetvelin kapısı

Bu cetvel bir **süreç** cetvelidir; kodu değil davranışı yönetir, bu yüzden onu zorlayan
otomatik test **yoktur** ve olmaması bilinçlidir. Uygulanmasının tek ölçüsü, devredilen her
işin §5 şablonuna ve §6 kabul kuralına göre denetlenebilmesidir. Bir devir bu cetvele
uymuyorsa, sonucu **ölçülmemiş** sayılır.


---
# FILE: docs\standards\uretilmis-artefakt-standard.md

# Üretilmiş Artefakt Standardı

> **Kapsam:** boru hattının ÜRETTİĞİ her dosya — master `.md`'ler, küme
> master'ları, companion `.md`'ler, artefakt manifesti.
> **Niçin ayrı cetvel:** kural companion'a özel değil. Aynı kusur 2026-08-26'da
> hem companion'larda hem master'larda ölçüldü.
> **SSOT:** bu dosya. Kapılar: `src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts`
> (INV-DOC-3, INV-DOC-4) ve yerel `orion doc durum` (Kapı B).

## AXIOM 1 — Üretilen artefakt, depoya girene kadar ÜRETİLMEMİŞ sayılır

Diskte duran bir dosya hiçbir soruya cevap vermez: CI onu göremez, ikiz onu
bilmez, ekip arkadaşı onu bulamaz. "Ürettim" ile "teslim ettim" ayrı fiillerdir.

**Niçin bu aksiyom var (ölçülmüş olay, 2026-08-26):**
PR #821 `.cc_docs.yaml`'a iki küme master'ı tanımladı — 40 satırlık ayar. Üretilen
dosyalar geçici bir worktree'de doğdu, dijital ikize oradan yüklendi, worktree
silinince yerel kopyalar öldü. Depoda hiç görünmediler. **Kusuru bir kapı değil,
kullanıcı fark etti** ("bu yeni master dosyalarını göremedim"). Ölçüldü: dosyalar
depoya ancak `de0b4a52` ile, sorudan **sonra** girdi.

Aynı sınıf companion'larda da yaşıyordu: `post-commit` kancası diske yazar,
C4/C5 kapıları `git log` okur; arada kalan dosyayı hiçbir şey saymaz.

## AXIOM 2 — Tarif ile ürün AYNI PR'da yolculuk eder

Bir PR artefaktın **nasıl üretileceğini** değiştiriyorsa (`.cc_docs.yaml` kapsamı,
derleyici davranışı, kaynak dosyalar), o PR **üretilmiş hâlini de taşımak
zorundadır**.

### ⭐İŞ AKIŞI BEDELİ — AÇIKÇA KABUL EDİLDİ

Bu kural bir bedel getirir ve bedel **yazılı olmalıdır**:

> `docs/standards/`, `docs/reference/`, `docs/audits/`, `docs/plans/` veya
> `supabase/functions/` altına dokunan **her PR**, aynı PR'da `orion doc build`
> çıktısını da taşır.

Pratikte iki komut:

```
orion doc build
git add docs/*_master.md docs/artefakt_manifest.json
```

**Niçin bedeli yazıyoruz:** yazılmayan bedel, kırmızıyı atlatma alışkanlığı
doğurur. Bu depo o filmi gördü — rastgele patlayan `pre-commit`, tüm filoda
`--no-verify` alışkanlığı doğurdu (T033). Bu yüzden **her kırmızı mesaj,
koşulacak tam komutu basar**: ne yapacağını söylemeyen kapı atlatılmayı davet
eder.

## AXIOM 3 — Üretilen dosya ELLE düzenlenmez

Üretilen artefakt bir **çıktıdır**, kaynak değildir. Elle yapılan düzeltme bir
sonraki derlemede sessizce silinir ve arada geçen sürede ikiz yanlış bilgiyi
doğru sanar.

Düzeltme kaynağa yapılır, sonra yeniden üretilir.

Kapı A bu ihlali `icerik_sha256` ile yakalar (aşağıda).

## AXIOM 4 — Ölçülemedi, GEÇTİ demek değildir

Manifest yoksa, git geçmişi sığsa, kaynak kümesi boşsa — kapı **kırmızı** yanar.
"Ölçemedim, o hâlde geçtim" (fail-open) bu depoda yasaktır: ölçülemeyen bir kapı,
geçen bir kapı değil **YOK olan** bir kapıdır.

Bu, boş listeyi "sorun yok" diye okumayı da kapsar. Boş kaynak kümesi bir ölçüm
değil, ölçümün **yokluğudur**.

## AXIOM 5 — Worktree yasak değildir; GÖRÜNMEZLİĞİ yasaktır

Worktree normal iş akışımızdır (çok-şeritli çalışmanın izolasyon aracı). T020
kazasının kökü worktree kullanmak değil, **çıktının o ağaçta kalıp kimseye
görünmeden ölmesiydi**.

Bu yüzden:
- Manifest, derlemenin hangi ağaçta yapıldığını (`calisma_agaci`) kaydeder.
- Worktree'de koşan derleme, sonunda **açık uyarı** basar: *"çıktılar &lt;yol&gt;
  içine yazıldı; commit etmezsen ağaç silindiğinde bu dosyalar da ölür."*
- Depo içi kapılar (A ve C) PR üzerinde CI'da koşar; ölçtükleri şey **birleşme
  hedefinin geçmişidir** ve koşumun hangi ağaçta yapıldığından bağımsızdır.

## AXIOM 6 — Yıkıcı adım, onarıcı adımın yapılabilirliği ölçülmeden koşmaz

Senkron **önce siler sonra yükler**. Yükleme kaynağı yoksa defter boşalır.

2026-08-26'da tam bu oldu: çalışma ağacı koşum ortasında yok oldu, silme adımı
83 kaynağı sildi, yükleme adımı hiçbir dosya bulamadı, defter 96 → 13'e düştü.

Tetikleyici (ağacın silinmesi) tesadüfiydi; **kusur sıradaydı**. Aynı sonuç disk
dolsa, izin düşse, yol yanlış verilse de olurdu. Bu yüzden kapı "worktree var mı"
diye değil, **"yüklenecek her şey ELDE mi"** diye sorar.

---

## Kapılar — üç ayrı soru

| Kapı | Nerede | Soru | Kimlik |
|---|---|---|---|
| **A — Tazelik** | venthub CI | Depodaki artefakt manifestteki özetle eşleşiyor mu? | INV-DOC-4 |
| **B — Ayrışma** | yerel `pre-push` | Diskte üretilmiş ama depoya girmemiş artefakt var mı? | `orion doc durum` |
| **C — Tarif↔Ürün** | venthub CI | yaml'ın ilan ettiği artefakt depoda var mı? | INV-DOC-3 |

### ⭐Niçin B yerelde, A ve C CI'da

**CI geliştiricinin diskini GÖREMEZ.** "Üretildi ama commit'lenmedi" durumu tanım
gereği yalnız yerel makinede vardır — PR'a giren şey zaten commit'lenmiştir. O
soruyu CI'da sormak, hiç kırmızı yanmayacak bir kapı kurmak olurdu; yani
dekoratif kapı.

Tersi de doğru: "depodaki artefakt kaynağıyla tutarlı mı" sorusunu yerelde sormak
yetmez, çünkü kimse koşmayı unutabilir. O yüzden A ve C zorunlu CI kapısıdır.

### ⭐Niçin B `pre-push`, `pre-commit` değil

Companion üretimi `post-commit`te **asenkrondur**. `pre-commit`te sormak, henüz
üretilmemiş dosyayı "eksik" sayar → yanlış-kırmızı. `pre-push` anında üretim
çoktan oturmuştur.

Kurulum: `orion doc install-push-hook`. Kurulum `core.hooksPath`'e **saygı duyar**
— ayar varsa git `.git/hooks`'a hiç bakmaz ve oraya yazılan kanca hiç koşmaz;
kapı var sanılır, yoktur.

### Kapı A'nın iki ayağı ve niçin ikisi de gerekli

1. **İçerik özeti** (`icerik_sha256`) — ürün elle bozuldu mu?
2. **Kaynak değişimi** — kaynak, derlemeden sonra değişti mi?

Ata-soy/kaynak-değişimi ayağı, kaynak **hiç değişmeden** ürünün bozulduğu vakayı
göremez. Özet ayağı ucuzdur ve o körü kapatır. Birini diğerinin yerine koymak
kör nokta bırakır.

### ⭐Satır sonu SİNYAL DEĞİL GÜRÜLTÜDÜR

Üretim Windows'ta olur ve metin modu yazımı dosyayı CRLF yapar; `core.autocrlf=true`
commit'te LF'e çevirir; CI Linux'ta LF iner.

Ham bayt özeti karşılaştırılsaydı **kapı daha kurulmadan kalıcı kırmızı olurdu** —
yani artefaktın içeriğini değil **taşıma katmanını** ölçerdi. Kalıcı kırmızı kapı
görmezden gelinir.

Bu yüzden **her iki uç da** (orion üretici tarafı ve venthub kapı tarafı)
özet almadan önce CRLF → LF normalizasyonu yapar. İki uç aynı soruyu sormazsa
karşılaştırma anlamsızdır.

Normalizasyon kapıyı zayıflatmaz: tek karakterlik gerçek fark hâlâ özeti
değiştirir.

---

## Kapı tasarımı — bu işte öğrenilen üç ders

### 1. Bir kapı ÜÇ ayrı soru sorar

| Soru | Aleti |
|---|---|
| Fonksiyon doğru mu? | birim test |
| DOĞRU YERDE mi? | AST — yıkıcı çağrıya göre konum |
| ULAŞILABİLİR mi? | AST — saran koşul sabit değil ve ölçüme bakıyor |

Üçüncüsü sabotajla doğdu: `if _eksikler:` → `if False:` yapıldığında yükseltme
kaynakta duruyordu, sırası doğruydu, ve AST kapısı **yeşil yandı**. Kapı "yazılı
mı" diye bakıyordu, "koşulur mu" diye değil.

### 2. Karar vermek ile kararı DIŞARI VEREBİLMEK ayrı sorulardır

`orion doc durum` komutunun FAIL dalında `sys` import edilmemişti: kapı doğru
ölçüyor, doğru karar veriyor, ve tam kırmızı yanacağı anda çöküyordu. Test yine
de yeşildi çünkü `CliRunner` **çöken bir komutu da** `exit_code=1` sayar.

Çıkış kodu da kapının bir parçasıdır; testi `SystemExit`'i **adıyla** sormalıdır.

### 3. Kapının en sık karşılaşacağı durum, testin en az temsil ettiği durum olabilir

`git status --porcelain` çıktısına `.strip()` uygulamak **ilk satırın baştaki
boşluğunu** yiyor; değiştirilmiş-izlenen dosya (" M yol") bir karakter kayıp
hiçbir şeyle eşleşmiyordu. Bütün birim testler yeşildi çünkü hepsi **izlenmeyen**
dosya kullanıyordu ("?? yol" boşlukla başlamaz).

Sentetik girdi gerçek çıktıyı taklit etmiyorsa test yeşil yalan söyler.

### ⭐Yeşil kalan sabotaj "kapı kör" demek DEĞİLDİR

Sebebi **ayrıca** ölçülür. 2026-08-26'da üç yeşil sabotajın:
- ikisi **etkisizdi** (biri ölü koddu ve kaldırıldı),
- biri **testin kendi körlüğüydü** (yukarıdaki `CliRunner` vakası).

Ölü kodu "önlem" diye bırakmak, okuyana **var olmayan bir koruma** vaat eder.

---

## İhlal hâlinde ne yapılır

| Kırmızı | Anlamı | Çözüm |
|---|---|---|
| INV-DOC-3 | yaml ürünü ilan ediyor, ürün depoda yok | `orion doc build` + `git add <artefaktlar>` |
| INV-DOC-4 özet uyuşmuyor | ürün elle bozuldu **ya da** manifest bayat | kaynağı düzelt → `orion doc build` |
| INV-DOC-4 manifest yok | ölçüm yapılamıyor | `orion doc build` + `git add docs/artefakt_manifest.json` |
| Kapı B (yerel) | üretildi, commit'lenmedi | kırmızının bastığı `git add` komutu |

**Tabanı yükselterek susturmak YASAKTIR.** Kırmızıyı susturmak için eşik
büyütmek, kapıyı sökmektir.

---

İlgili: `companion-doc-standard.md` (C4/C5 — eksik ve bayat companion) ·
`measurement-discipline-standard.md` · `collaboration-protocol.md` ·
tasarım kaydı: orion `docs/t021-artefakt-tazelik-kapisi-tasarim.md` (PR #42)


---
# FILE: docs\standards\work-tracking-ssot-standard.md

# VentHub — İş-Takibi & Dokümantasyon SSOT Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** *"Bir iş / karar / durum bilgisi NEREDE yaşar ve mükerrerlik nasıl önlenir?"* sorusunun
> karar veren cetveli. Amaç: aynı bilgi iki yerde **elle** tutulmasın — yoksa drift olur, takip ölür, işler
> birbirine girer.
> **Kaynak:** 2026-06-20 tasarım oturumu — lokal twin + iki NLM defteri (Orion + Orion Registry) + **canlı CLI
> doğrulaması** + `orion-registry` kaynak doğrulaması. Strateji memory: `documents-are-the-decision`,
> `orion-consolidation-parity`, `doc-committed-not-work-done`.

---

## 1. Sorun — neden bu cetvel var
Aynı "ne yapılacak / neredeyiz" bilgisi şu yüzeylere dağılabilir: `DURUM-TAKIP.md` · Orion registry (task/decision) ·
standart/plan docs · `CHANGELOG`/git · agent-memory. **İki+ yüzey aynı bilgiyi elle tutarsa → drift → takip imkânsız.**

## 2. Çekirdek kural — her bilgi TEK yerde yaşar, ötekiler İŞARET eder (kopyalamaz)

| Bilgi türü | SSOT (tek yer) | Ötekiler ne yapar |
|---|---|---|
| Ne + niçin yapılacak (**detay**) | standart/plan/`VISION.md` | registry task **link verir**, detayı kopyalamaz |
| **Neredeyiz** (lane/durum anlatısı) | **`DURUM-TAKIP.md`** (insan-SSOT) | registry id'lerine referans; paralel status-listesi TUTMAZ |
| Yapısal work-order (id/status/priority) | **Orion registry** (`tasks`) | `session recall`/`orion_durum` canlı okur |
| Mimari/stratejik **karar** | Orion registry (`decisions`) + bu tür docs | registry kaydı + doküman, biri ötekine link |
| Biten iş geçmişi | `CHANGELOG` + git | registry'de `completed` işaretlenir, anlatı değil |
| Claude cross-session ders | agent-memory (`.claude/.../memory`) | docs/registry'yi tekrarlamaz, ince pointer |

> **Demir kural:** Yeni doküman/satır yazmadan önce sor — *"Bu bilgi başka yerde zaten SSOT mu?"* Evetse **link ver,
> kopyalama.** Registry entry = **ince kulp** (`id + başlık + status + link`), detayı taşımaz. Bir work-order'ın
> **status'ü TEK yerde** güncellenir.

## 3. Mevcut model — **Model A (hibrit)** [ŞİMDİ]
- **Registry `tasks` = yapısal work-order + status SSOT** → `session recall` / `orion_durum` canlı gösterir (KURULU, çalışıyor).
- **`DURUM-TAKIP.md` = insan anlatısı / lane / gerekçe**, registry **id-referansı** taşır; paralel yetkili status-listesi tutmaz.
- **Detay = plan/standart doc** · **biten = CHANGELOG/git** · **ders = memory.**
- → Her work-order tek yerde (registry); anlatı tek yerde (DURUM-TAKIP); detay tek yerde (doc). **Mükerrerlik yok.**

## 4. Hedef model — **Model B (DB-First, MD generated)** [HEDEF]
- **registry = tam SSOT; `DURUM-TAKIP.md` DB'den OTOMATİK üretilir** (KIBridge / db→md). Elle-bakım biter, drift kökten ölür.
- Bu Orion'un kendi **AXIOM-1 (DB-First / MD-as-Output)** doktrini — bizim tercihimiz değil, mimari doğru son-durak.
- ⛔ **ENGEL:** KIBridge **hiçbir yerde kurulu değil** (bkz §5) → **net-new inşa** gerekir.

## 5. Orion altyapı paritesi (kanıt — 2026-06-20 canlı doğrulama)
3 proje (orion-registry + cortex + corpus-callosum) **tek `orion` çatısına** birleşti ("%100 değil, ihtiyacı çözecek kadar"; `cc` CLI → `orion` CLI).

- **✅ KURULU + bizim kullandığımız:** registry (task/idea/decision) · `session recall/seal/summary/diff/timeline` · `orion_durum`/`orion_twin` · doc-pipeline + NLM twin · memory · code/alignment (drift/blast) · safety (autonomy L0-L3/andon/audit).
- **❌ TAŞINMADI (bilinçli kesim — biz kullanmıyoruz):** ACEE orchestrate/DAG executor · scope_police · kaizen · department_manager · Voltran REST servis (kod var, entry-point yok).
- **❌ KIBridge (work-state→MD) — KAYNAK-DOĞRULAMALI KESİN:** ne `orion-registry`'de (referans; `class KIBridge`/`reassemble_markdown` grep BOŞ, son commit 2026-06-12 = donmuş) ne birleşik `orion`'da var. **Hiçbir yerde kurulmamış**; her ikisinde backlog. *(NLM "Orion" defteri "kurulu" dedi = halüsinasyon; "Orion Registry" defteri "backlog" = doğru → çelişince kaynağa bak.)*

## 6. Aşamalı yol haritası
| Aşama | İş | Durum |
|---|---|---|
| **1** | Registry temizliği (kontaminasyon→orion) + 3 çöken komut (C1/C2/C3) + I1/I3/G1/G4/D1-D2 | ✅ **BİTTİ** (worker commit `5a04725` + kullanıcı MCP restart; canlı doğrulandı). Kalan tek kozmetik: G3 (decision/idea list escape) → worker'da |
| **2** | Gerçek work-order setini temiz `venthub-hvac` registry'sine gir (Model A) | ⬜ **SIRADAKİ** — bu set aynı zamanda **KIBridge'in spec'i** olur |
| **3** | Session hook'ları: start=durum (recall) · end=seal (checkpoint+öğrenim) | ⬜ |
| **(sonra)** | **KIBridge net-new inşa** (worker görevi) → Model B'ye tam geçiş | ⬜ |

## 7. KIBridge spec yönü (gelecek worker görevi — net-new ama sıfırdan değil)
- **Girdi:** registry `tasks`/`decisions` + git durumu + son checkpoint.
- **Çıktı:** `DURUM-TAKIP.md`-şekilli MD (kesin kontrat **Aşama 2'de** registry doldurulunca netleşir — "standart-önce: önce cetvel, sonra jeneratör").
- **Mevcut yapı taşları:** `session recall` zaten yapısal durum render ediyor · `_update_capability_map` MD'yi otomatik yazıyor · doc-pipeline (`migrator/parser.reassemble_markdown`) MD reassemble ediyor.
- **Robustluk şartı:** KIBridge sonrası bile `DURUM-TAKIP.md` git-diff'li + twin-sync'li **fallback** kalır (registry tek-sepete-yumurta değil).


---
# FILE: docs\reference\vortice_catalogs.md

# Vortice Ürün Katalogları Dizini (Vortice Product Catalogs Directory)

Bu doküman, Vortice HVAC ürün gruplarına ait tüm PDF kataloglarının NotebookLM defterlerinden ve yerel diskten derlenmiş güncel ve tekil (mükerrersiz) dizinidir. 

Kataloglar, projedeki ürün şemalarına ve kategorilerine göre gruplandırılmış, orijinal indirme bağlantıları (URL) ve yerel disk eşleşmeleri (`public/images/vortice/`) eklenmiştir.

---

## 📂 Kategorilere Göre Katalog Listesi

### 1. Hava Perdeleri (Air Curtains)
*Yerel diskte mevcut olan ve test ettiğimiz hava perdesi kataloğudur.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **Air Door Range** | (Manuel Yükleme) | `public/images/vortice/Doc_Pubblicita_Air_Door_Range_189461.pdf` | 🟢 İndirildi |

---

### 2. Ticari Havalandırma (Commercial Ventilation)
*Büyük ticari alanlar, kanal tipi mixed-flow fanlar ve plenum kutulu fanlar.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **CA Radon Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_CA_RADON_178112.pdf) | - | 🔴 Bulut |
| **Commercial Ventilation CA-IL Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Commercial_Ventilation_CA-IL_Range_132323.pdf) | `public/images/vortice/Doc_Pubblicita_Commercial_Ventilation_CA-IL_Range_132323.pdf` | 🟢 İndirildi |
| **In-Line Fans Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_In-Line_Fans_Range_191875.pdf) | - | 🔴 Bulut |
| **Lineo Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Lineo_Range_187069.pdf) | `public/images/vortice/Doc_Pubblicita_Lineo_Range_187069.pdf` | 🟢 İndirildi |
| **NRG Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_NRG_Range_178104.pdf) | - | 🔴 Bulut |
| **Vort QBK HE Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Vort_QBK_HE_Range_177688.pdf) | `public/images/vortice/Doc_Pubblicita_Vort_QBK_HE_Range_177688.pdf` | 🟢 İndirildi |
| **Vort QBK SAL-KC EVO** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Vort_QBK_SAL-KC_EVO_190829.pdf) | - | 🔴 Bulut |

---

### 3. Konut Tipi Havalandırma (Residential Ventilation)
*Banyo, mutfak ve evsel egzoz fanları ile CO2 kontrol kitleri.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **Kit Vario CO2** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Kit_Vario_CO2_177674.pdf) | - | 🔴 Bulut |
| **Residential Ventilation 2024** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Residential_Ventilation2024_186926.pdf) | `public/images/vortice/Doc_Pubblicita_Residential_Ventilation2024_186926.pdf` | 🟢 İndirildi |
| **Residential Ventilation Vort Quadro Evo** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_179649.pdf) | `public/images/vortice/Doc_Pubblicita_Residential_ventilation_vort_quadro_evo_179649.pdf` | 🟢 İndirildi |

---

### 4. Endüstriyel Havalandırma (Industrial Ventilation)
*Çatı tipi fanlar ve ATEX/patlama korumalı endüstriyel fanlar.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **E-ATEX Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_E-ATEX_Range_187721.pdf) | - | 🔴 Bulut |
| **Roof Fans Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Roof_Fans_189882.pdf) | `public/images/vortice/Doc_Pubblicita_Roof_Fans_189882.pdf` | 🟢 İndirildi |

---

### 5. Isı Geri Kazanım ve VMC (CMV & Heat Recovery)
*Isı geri kazanım üniteleri, merkezi havalandırma sistemleri ve VMC aksesuarları.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **MEV IoT Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_MEV_IoT_188510.pdf) | - | 🔴 Bulut |
| **Vort HR W-ALL 100 DF** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_VORT_HR_W-ALL_100_DF_190393.pdf) | - | 🔴 Bulut |
| **Vort Mono Range WiFi** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_VORT_MONO_RANGE_WiFi_189860.pdf) | - | 🔴 Bulut |
| **Vort NRG Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_VORT_NRG_185893.pdf) | - | 🔴 Bulut |
| **Vort Invisible Mini Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Vort_Invisible_Mini_Range_188513.pdf) | - | 🔴 Bulut |
| **Vort Sanikit** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Vort_Sanikit_177671.pdf) | - | 🔴 Bulut |
| **Why Ventilate** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Why_Ventilate_172062.pdf) | - | 🔴 Bulut |

---

### 6. Yaz Havalandırması / Tavan Fanları (Summer Ventilation)
*Tavan pervaneleri, Gordon masaüstü vantilatörleri ve Nordik Air Design premium serisi.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **Gordon Evo Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Gordon_Evo_189883.pdf) | - | 🔴 Bulut |
| **Summer Ventilation 2025** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Summer_Ventilation_2025_190392.pdf) | - | 🔴 Bulut |
| **Summer Ventilation Nordik Air Design** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Summer_ventilation_NORDIK_AIR_DESIGN_148101.pdf) | `public/images/vortice/Doc_Pubblicita_Summer_ventilation_NORDIK_AIR_DESIGN_148101.pdf` | 🟢 İndirildi |

---

### 7. Hava İşleme ve Nem Alma (Air Treatment)
*Ev tipi/endüstriyel nem alma cihazları, hava temizleyiciler ve hijyenizasyon üniteleri.*

| Katalog Adı | Orijinal İndirme Bağlantısı (URL) | Yerel Dosya Yolu | Durum |
| :--- | :--- | :--- | :---: |
| **Air Treatment Solution** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Air_Treatment_Solution_174989.pdf) | - | 🔴 Bulut |
| **Deumido Evo Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Deumido_Evo_Range_177678.pdf) | - | 🔴 Bulut |
| **New Air Purifiers and Sanitisers** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_New_Air_Purifiers_and_Sanitisers_177677.pdf) | - | 🔴 Bulut |
| **Vort Ariasalus** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Vort_Ariasalus_177676.pdf) | - | 🔴 Bulut |
| **Vortronic Range** | [İndir](https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_Vortronic_Range_177675.pdf) | - | 🔴 Bulut |

---

## 🛠️ Otonom İndirme ve İşleme Protokolü

Yeni bir bulut kataloğunu yerel diske indirip işleme sırasına almak için aşağıdaki PowerShell komutunu `venthub-pdf-ingestor` dizininde çalıştırabilirsiniz:

```powershell
# Örnek: CA Radon kataloğunu indirme ve işleme
$url = "https://www.vortice.com/media2/Export/Inglese/Doc_Pubblicita_CA_RADON_178112.pdf"
$dest = "c:\Users\alize\venthub-hvac\public\images\vortice\Doc_Pubblicita_CA_RADON_178112.pdf"

# 1. Dosyayı indir
Invoke-WebRequest -Uri $url -OutFile $dest

# 2. Görsel Ajan Triaj & İşleme Hattını Başlat
.venv\Scripts\python.exe scripts/ingest_single.py $dest --category-slug channel-fan
```


---
# FILE: docs\reference\supabase\auth-hooks.md

---
id: 'auth-hooks'
title: 'Auth Hooks'
subtitle: 'Use HTTP or Postgres Functions to customize your authentication flow'
---

## What is a hook

A hook is an endpoint that allows you to alter the default Supabase Auth flow at specific execution points. Developers can use hooks to add custom behavior that's not supported natively.

Hooks help you:

- Track the origin of user signups by adding metadata
- Improve security by adding additional checks to password and multi-factor authentication
- Support legacy systems by integrating with identity credentials from external authentication systems
- Add additional custom claims to your JWT
- Send authentication emails or SMS messages through a custom provider

The following hooks are available:

| Hook                                                                                     | Available on Plan    |
| ---------------------------------------------------------------------------------------- | -------------------- |
| [Before User Created](/docs/guides/auth/auth-hooks/before-user-created-hook)             | Free, Pro            |
| [Custom Access Token](/docs/guides/auth/auth-hooks/custom-access-token-hook)             | Free, Pro            |
| [Send SMS](/docs/guides/auth/auth-hooks/send-sms-hook)                                   | Free, Pro            |
| [Send Email](/docs/guides/auth/auth-hooks/send-email-hook)                               | Free, Pro            |
| [MFA Verification Attempt](/docs/guides/auth/auth-hooks/mfa-verification-hook)           | Teams and Enterprise |
| [Password Verification Attempt](/docs/guides/auth/auth-hooks/password-verification-hook) | Teams and Enterprise |

Supabase supports 2 ways to [configure a hook](/dashboard/project/_/auth/hooks) in your project:

<Tabs
  scrollable
  size="small"
  type="underlined"
  defaultActiveId="postgres-function"
>
<TabPanel id="postgres-function" label="Postgres Function">

A [Postgres function](/docs/guides/database/functions) can be configured as a hook. The function should take in a single argument -- the event of type JSONB -- and return a JSONB object. Since the Postgres function runs on your database, the request does not leave your project's instance.

</TabPanel>
<TabPanel id="http" label="HTTP Endpoint">

An HTTP Hook is an endpoint which takes in a JSON event payload and returns a JSON response. You can use any HTTP endpoint as a Hook, including an endpoint in your application. The easiest way to create an HTTP hook is to create a [Supabase Edge Function](/docs/guides/functions/quickstart).

</TabPanel>
</Tabs>

## Security model

Sign the payload and grant permissions selectively in order to guard the integrity of the payload.

<Tabs
  scrollable
  size="small"
  type="underlined"
  defaultActiveId="sql"
  queryGroup="language"
>
<TabPanel id="sql" label="SQL">

When you configure a Postgres function as a hook, Supabase will automatically apply the following grants to the function for these reasons:

- Allow the `supabase_auth_admin` role to execute the function. The `supabase_auth_admin` role is the Postgres role that is used by Supabase Auth to make requests to your database.
- Revoke permissions from other roles (e.g. `anon`, `authenticated`, `public`) to ensure the function is not accessible by Supabase Data APIs.

```sql
-- Grant access to function to supabase_auth_admin
grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

-- Grant access to schema to supabase_auth_admin
grant usage on schema public to supabase_auth_admin;

-- Revoke function permissions from authenticated, anon and public
revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;
```

You will need to alter your row-level security (RLS) policies to allow the `supabase_auth_admin` role to access tables that you have RLS policies on. You can read more about RLS policies [here](/docs/guides/database/postgres/row-level-security).

Alternatively, you can create your Postgres function via the dashboard with the `security definer` tag. The `security definer` tag specifies that the function is to be executed with the privileges of the user that owns it.

Currently, functions created via the dashboard take on the `postgres` role. Read more about the `security definer` tag [in our database guide](/docs/guides/database/functions#security-definer-vs-invoker)

</TabPanel>
<TabPanel id="http" label="HTTP">

HTTP Hooks in Supabase follow the [Standard Webhooks Specification](https://www.standardwebhooks.com/), which is a set of guidelines aligning how hooks are implemented. The specification attaches three security headers to guarantee the integrity of the payload:

- `webhook-id`: the unique webhook identifier described in the preceding sections.
- `webhook-timestamp`: integer UNIX timestamp (seconds since epoch).
- `webhook-signature`: the signatures of this webhook. This is generated from body of the hook.

When the request is made to the HTTP hook, you should use the [Standard Webhooks libraries](https://github.com/standard-webhooks/standard-webhooks/tree/main/libraries) to verify these headers.

When an HTTP hook is created, the secret generated should be of the `v1,whsec_<base64-secret>` format:

- `v1` denotes the version of the hook
- `whsec_` signifies that the secret is symmetric
- `<base64-secret>` implies a Standard Base64 encoded secret which can contain the characters `+`, `/` and `=`

The secret is used to verify the payload received in your hook. Create an entry in your `.env.local` file to store the `<standard-base64-secret>` portion of the secret for each hook that you have. For example:

```ini
SEND_SMS_HOOK_SECRETS=v1,whsec_<base64-secret>
```

There field is expressed in plural rather than singular as there are plans to allow for asymmetric signing and multiple hook secrets for ease of secret rotation. For instance: `<standard-base-64-secret>|<another-standard-base-64-secret>`.

Use the secret in conjunction with the Standard Webhooks package to verify the payload before processing it:

```jsx
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

Deno.serve(async (req) => {
  const payload = await req.text()
  const hookSecret = Deno.env.get('SEND_SMS_HOOK_SECRETS').replace('v1,whsec_', '')
  // Extract headers and security specific fields
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)
  const data = wh.verify(payload, headers)

  // Payload data is verified, continue with business logic here
  // ...
})
```

</TabPanel>
</Tabs>

## Using Hooks

### Developing

Let us develop a Hook locally and then deploy it to the cloud. As a recap, here’s a list of available Hooks

| Hook                          | Suggested Function Name         | When it is called                                  | What it Does                                                                                              |
| ----------------------------- | ------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Send SMS                      | `send_sms`                      | Each time an SMS is sent                           | Allows you to customize message content and SMS Provider                                                  |
| Send Email                    | `send_email`                    | Each time an Email is sent                         | Allows you to customize message content and Email Provider                                                |
| Custom Access Token           | `custom_access_token`           | Each time a new JWT is created                     | Returns the claims you wish to be present in the JWT.                                                     |
| MFA Verification Attempt      | `mfa_verification_attempt`      | Each time a user tries to verify an MFA factor.    | Returns a decision on whether to reject the attempt and future ones, or to allow the user to keep trying. |
| Password Verification Attempt | `password_verification_attempt` | Each time a user tries to sign in with a password. | Return a decision whether to allow the user to reject the attempt, or to allow the user to keep trying.   |

Edit `config.toml` to set up the Auth Hook locally.

<Tabs
  scrollable
  size="small"
  type="underlined"
  defaultActiveId="sql"
  queryGroup="language"
>
<TabPanel id="sql" label="SQL">
Modify the `auth.hook.<hook_name>` field and set `uri` to a value of `pg-functions://postgres/<schema>/<function_name>`

```
[auth.hook.<hook_name>]
enabled = true
uri = "pg-functions://...."

```

You need to assign additional permissions so that Supabase Auth can access the hook as well as the tables it interacts with.

The `supabase_auth_admin` role does not have permissions to the `public` schema. You need to grant the role permission to execute your hook:

```sql
grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

```

You also need to grant usage to `supabase_auth_admin`:

```sql
grant usage on schema public to supabase_auth_admin;

```

Also revoke permissions from the `authenticated` and `anon` roles to ensure the function is not accessible by Supabase Serverless APIs.

```sql
revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon;

```

For security, we recommend against the use the `security definer` tag. The `security definer` tag specifies that the function is to be executed with the privileges of the user that owns it. When a function is created via the Supabase dashboard with the tag, it will have the extensive permissions of the `postgres` role which make it easier for undesirable actions to occur.

We recommend that you do not use any tag and explicitly grant permissions to `supabase_auth_admin` as described above.

Read more about `security definer` tag [in our database guide](/docs/guides/database/functions#security-definer-vs-invoker).

Once done, save your Auth Hook as a migration in order to version the Auth Hook and share it with other team members. Run [`supabase migration new`](/docs/reference/cli/supabase-migration-new) to create a migration.

<Admonition type="caution">

If you're using the Supabase SQL Editor, there's an issue when using the `?` (_Does the string exist as a top-level key within the JSON value?_) operator. Use a direct connection to the database if you need to use it when defining a function.

</Admonition>

Here is an example hook signature:

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  -- Insert variables here
begin
  -- Insert logic here
  return event;
end;
$$;

```

You can visit `SQL Editor > Templates` for hook templates.

</TabPanel>
<TabPanel id="http" label="HTTP">
Modify the `auth.hook.<hook_name>` field and set `uri` to a valid HTTP URI. For example, the `send_sms` hook would take the following fields:

```toml
[auth.hook.send_sms]
enabled = true
uri = "http://host.docker.internal:54321/functions/v1/send_sms"
# Comma separated list of secrets
secrets = "env(SEND_SMS_HOOK_SECRETS)"
```

<Admonition type="note">

`host.docker.internal` is a special DNS name used in Docker to allow a container to access the host machine's network. This allows the Auth container to reach your HTTP function, no matter if it's a Supabase Edge Function or a custom endpoint.

</Admonition>

Fill in the Hook Secret in `supabase/functions/.env`

```ini
SEND_SMS_HOOK_SECRETS='v1,whsec_<base64-secret>'
```

Start the function locally:

```bash
supabase functions serve send-sms --no-verify-jwt
```

Disable JWT verification via the `--no-verify-jwt` to accommodate hooks which are run before a JWT is issued. Payload authenticity is instead protected via the appended security headers associated with the Standard Webhooks Standard.

Note that payloads are sent uncompressed in order to accurately track Content Length. In addition, there is a 20KB payload limit to guard against payload stuffing attacks.

</TabPanel>
</Tabs>

### Deploying

In the dashboard, navigate to [`Authentication > Hooks`](/dashboard/project/_/auth/hooks) and select the appropriate function type (SQL or HTTP) from the dropdown menu.

### Error handling

You should return an error when facing a runtime error. Runtime errors are specific to your application and arise from specific business rules rather than programmer errors.

Runtime errors could happen when:

- The user does not have appropriate permissions
- The event payload received does not have required claims.
- The user has performed an action which violates a business rule.
- The email or phone provider used in the webhook returned an error.

<Tabs
  scrollable
  size="small"
  type="underlined"
  defaultActiveId="sql"
  queryGroup="language"
>
<TabPanel id="sql" label="SQL">

The error is a JSON object and has the following properties:

- `error` An object that contains information about the error.
  - `http_code` A number indicating the HTTP code to be returned. If not set, the code is HTTP 500 Internal Server Error.
  - `message` A message to be returned in the HTTP response. Required.

Here's an example:

```json
{
  "error": {
    "http_code": 429,
    "message": "You can only verify a factor once every 10 seconds."
  }
}
```

Errors returned from a Postgres Hook are not retry-able. When an error is returned, the error is propagated from the hook to Supabase Auth and translated into an HTTP error which is returned to your application. Supabase Auth will only take into account the error and disregard the rest of the payload.

</TabPanel>

<TabPanel id="http" label="HTTP">
Hooks return status codes based on the nature of the response. These status codes help determine the next steps in the processing flow:

| HTTP Status Code | Description                                                   | Example Usage                                  |
| ---------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| 200, 202, 204    | Valid response, proceed                                       | Successful processing of the request           |
| 403, 400         | Treated as Internal Server Errors and return a 500 Error Code | Malformed requests or insufficient permissions |
| 429, 503         | Retry-able errors                                             | Temporary server overload or maintenance       |

<Admonition type="note">

`204` Status is not supported by the following hooks which require a response body:

- [Custom Access Token](/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [MFA Verification Attempt](/docs/guides/auth/auth-hooks/mfa-verification-hook)
- [Password Verification Attempt](/docs/guides/auth/auth-hooks/password-verification-hook)

</Admonition>

Errors are responses which contain status codes 400 and above. On a retry-able error, such as an error with a `429` or `503` status code, HTTP Hooks will attempt up to three retries with a back-off of two seconds. We have a time budget of 5s for the entire webhook invocation, including retry requests.

Here's a sample HTTP retry schedule:

| Time Since Start (HH:MM:SS) | Event                 | Notes                                                                            |
| --------------------------- | --------------------- | -------------------------------------------------------------------------------- |
| 00:00:00                    | Initial Attempt       | Initial invocation begins.                                                       |
| 00:00:02                    | Initial Attempt Fails | Initial invocation returns `429` or `503` with non-empty `retry-after` header.   |
| 00:00:04                    | Retry Start #1        | After 2 sec delay, first retry begins.                                           |
| 00:00:05                    | Retry Timeout #1      | First retry times out, exceeded 5 second budget and invocation returns an error. |

Return a retry-able error by attaching a appropriate status code (`429`, `503`) and a non-empty `retry-after` header

<Admonition type="note">

`Retry-After` Supabase Auth does not fully support the `Retry-After` header as described in RFC7231, we only check if it is a non-empty value such as `true` or `10`. Setting this to your preferred value is fine as a future update may address this.

</Admonition>

```jsx
return new Response(
  JSON.stringify({
    error: `Failed to process the request: ${error}`,
  }),
  { status: 429, headers: { 'Content-Type': 'application/json', 'retry-after': 'true' } }
)
```

Note that all responses, including error responses, need a `Content-Type` of `application/json` - not specifying the appropriate `Content-Type` will result in the function returning an error response. Supabase Auth will in turn return an Internal Server Error.

</TabPanel>
</Tabs>

Outside of runtime errors, both HTTP Hooks and Postgres Hooks return timeout errors. Postgres Hooks have <SharedData data="config">auth.hook_timeouts.postgres_hooks</SharedData> seconds to complete processing while HTTP Hooks should complete in <SharedData data="config">auth.hook_timeouts.http_hooks</SharedData> seconds. Both HTTP Hooks and Postgres Hooks are run in a transaction do limit the duration of execution to avoid delays in authentication process.

## Available Hooks

Each Hook description contains an example JSON Schema which you can use in conjunction with [JSON Schema Faker](https://json-schema-faker.js.org/) in order to generate a mock payload. For HTTP Hooks, you can also use [the Standard Webhooks Testing Tool](https://www.standardwebhooks.com/simulate) to simulate a request.

<div className="grid md:grid-cols-12 gap-4 not-prose">
  <div className="col-span-4">
    <Link href="/guides/auth/auth-hooks/custom-access-token-hook" passHref>
      <GlassPanel title="Custom Access Token">
        Customize the access token issued by Supabase Auth
      </GlassPanel>
    </Link>
  </div>
  <div className="col-span-4">
    <Link href="/guides/auth/auth-hooks/send-sms-hook" passHref>
      <GlassPanel title="Send SMS">
        Use a custom SMS provider to send authentication messages
      </GlassPanel>
    </Link>
  </div>
  <div className="col-span-4">
    <Link href="/guides/auth/auth-hooks/send-email-hook" passHref>
      <GlassPanel title="Send Email">
        Use a custom email provider to send authentication messages
      </GlassPanel>
    </Link>
  </div>
  <div className="col-span-4">
    <Link href="/guides/auth/auth-hooks/mfa-verification-hook" passHref>
      <GlassPanel title="MFA Verification">
        Add additional checks to the MFA verification flow
      </GlassPanel>
    </Link>
  </div>
  <div className="col-span-4">
    <Link href="/guides/auth/auth-hooks/password-verification-hook" passHref>
      <GlassPanel title="Password verification">
        Add additional checks to the password verification flow
      </GlassPanel>
    </Link>
  </div>
</div>


---
# FILE: docs\reference\supabase\custom-claims-and-role-based-access-control-rbac.md

---
id: 'custom-claims-and-role-based-access-control-rbac'
title: 'Custom Claims & Role-based Access Control (RBAC)'
description: 'Use Auth Hooks to add custom claims for managing role-based access control.'
---

Custom Claims are special attributes attached to a user that you can use to control access to portions of your application. For example:

```json
{
  "user_role": "admin",
  "plan": "TRIAL",
  "user_level": 100,
  "group_name": "Super Guild!",
  "joined_on": "2022-05-20T14:28:18.217Z",
  "group_manager": false,
  "items": ["toothpick", "string", "ring"]
}
```

To implement Role-Based Access Control (RBAC) with `custom claims`, use a [Custom Access Token Auth Hook](/docs/guides/auth/auth-hooks#hook-custom-access-token). This hook runs before a token is issued. You can use it to add additional claims to the user's JWT.

This guide uses the [Slack Clone example](https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone) to demonstrate how to add a `user_role` claim and use it in your [Row Level Security (RLS) policies](/docs/guides/database/postgres/row-level-security).

## Create a table to track user roles and permissions

In this example, you will implement two user roles with specific permissions:

- `moderator`: A moderator can delete all messages but not channels.
- `admin`: An admin can delete all messages and channels.

```sql supabase/migrations/init.sql
-- Custom types
create type public.app_permission as enum ('channels.delete', 'messages.delete');
create type public.app_role as enum ('admin', 'moderator');

-- USER ROLES
create table public.user_roles (
  id        bigint generated by default as identity primary key,
  user_id   uuid references auth.users on delete cascade not null,
  role      app_role not null,
  unique (user_id, role)
);
comment on table public.user_roles is 'Application roles for each user.';

-- ROLE PERMISSIONS
create table public.role_permissions (
  id           bigint generated by default as identity primary key,
  role         app_role not null,
  permission   app_permission not null,
  unique (role, permission)
);
comment on table public.role_permissions is 'Application permissions for each role.';
```

<Admonition type="note">

For the [full schema](https://github.com/supabase/supabase/blob/master/examples/slack-clone/nextjs-slack-clone/README.md), see the example application on [GitHub](https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone).

</Admonition>

You can now manage your roles and permissions in SQL. For example, to add the mentioned roles and permissions from above, run:

```sql supabase/seed.sql
insert into public.role_permissions (role, permission)
values
  ('admin', 'channels.delete'),
  ('admin', 'messages.delete'),
  ('moderator', 'messages.delete');
```

## Create Auth Hook to apply user role

The [Custom Access Token Auth Hook](/docs/guides/auth/auth-hooks#hook-custom-access-token) runs before a token is issued. You can use it to edit the JWT.

<Tabs
  scrollable
  size="small"
  type="underlined"
  defaultActiveId="plpgsql"
  queryGroup="language"
>
<TabPanel id="plpgsql" label="PL/pgSQL (best performance)">

```sql supabase/migrations/auth_hook.sql
-- Create the auth hook function
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role public.app_role;
  begin
    -- Fetch the user role in the user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    if user_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;

grant all
  on table public.user_roles
to supabase_auth_admin;

revoke all
  on table public.user_roles
  from authenticated, anon, public;

create policy "Allow auth admin to read user roles" ON public.user_roles
as permissive for select
to supabase_auth_admin
using (true);
```

</TabPanel>
</Tabs>

### Enable the hook

In the dashboard, navigate to [`Authentication > Hooks (Beta)`](/dashboard/project/_/auth/hooks) and select the appropriate Postgres function from the dropdown menu.

When developing locally, follow the [local development](/docs/guides/auth/auth-hooks#local-development) instructions.

<Admonition type="note">

To learn more about Auth Hooks, see the [Auth Hooks docs](/docs/guides/auth/auth-hooks).

</Admonition>

## Accessing custom claims in RLS policies

To utilize Role-Based Access Control (RBAC) in Row Level Security (RLS) policies, create an `authorize` method that reads the user's role from their JWT and checks the role's permissions:

```sql supabase/migrations/init.sql
create or replace function public.authorize(
  requested_permission app_permission
)
returns boolean as $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it to reduce number of calls
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';
```

<Admonition type="note">

You can read more about using functions in RLS policies in the [RLS guide](/docs/guides/database/postgres/row-level-security#using-functions).

</Admonition>

You can then use the `authorize` method within your RLS policies. For example, to enable the desired delete access, you would add the following policies:

```sql
create policy "Allow authorized delete access" on public.channels for delete to authenticated using ( (SELECT authorize('channels.delete')) );
create policy "Allow authorized delete access" on public.messages for delete to authenticated using ( (SELECT authorize('messages.delete')) );
```

## Accessing custom claims in your application

The auth hook will only modify the access token JWT but not the auth response. Therefore, to access the custom claims in your application, e.g. your browser client, or server-side middleware, you will need to decode the `access_token` JWT on the auth session.

In a JavaScript client application you can for example use the [`jwt-decode` package](https://www.npmjs.com/package/jwt-decode):

```js
import { jwtDecode } from 'jwt-decode'

const { subscription: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    const jwt = jwtDecode(session.access_token)
    const userRole = jwt.user_role
  }
})
```

For server-side logic you can use packages like [`express-jwt`](https://github.com/auth0/express-jwt), [`koa-jwt`](https://github.com/stiang/koa-jwt), [`PyJWT`](https://github.com/jpadilla/pyjwt), [dart_jsonwebtoken](https://pub.dev/packages/dart_jsonwebtoken), [Microsoft.AspNetCore.Authentication.JwtBearer](https://www.nuget.org/packages/Microsoft.AspNetCore.Authentication.JwtBearer), etc.

## Conclusion

You now have a robust system in place to manage user roles and permissions within your database that automatically propagates to Supabase Auth.

## More resources

- [Auth Hooks](/docs/guides/auth/auth-hooks)
- [Row Level Security](/docs/guides/database/postgres/row-level-security)
- [RLS Functions](/docs/guides/database/postgres/row-level-security#using-functions)
- [Next.js Slack Clone Example](https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone)


---
# FILE: docs\reference\supabase\realtime-authorization.md

---
id: 'authorization'
title: 'Realtime Authorization'
description: 'Authorization for Supabase Realtime'
sidebar_label: 'Authorization'
---

You can control client access to Realtime [Broadcast](/docs/guides/realtime/broadcast) and [Presence](/docs/guides/realtime/presence) by adding Row Level Security policies to the `realtime.messages` table. Each RLS policy can map to a specific action a client can take:

- Control which clients can broadcast to a Channel
- Control which clients can receive broadcasts from a Channel
- Control which clients can publish their presence to a Channel
- Control which clients can receive messages about the presence of other clients

<Admonition type="note">

To enforce private channels you need to disable the 'Allow public access' setting in [Realtime Settings](/dashboard/project/_/realtime/settings)

</Admonition>
## How it works

Realtime uses the `messages` table in your database's `realtime` schema to generate access policies for your clients when they connect to a Channel topic.

By creating RLS policies on the `realtime.messages` table you can control the access users have to a Channel topic, and features within a Channel topic.

The validation is done when the user connects. When their WebSocket connection is established and a Channel topic is joined, their permissions are calculated based on:

- The RLS policies on the `realtime.messages` table
- The user information sent as part of their [Auth JWT](/docs/guides/auth/jwts)
- The request headers
- The Channel topic the user is trying to connect to

When Realtime generates a policy for a client it performs a query on the `realtime.messages` table and then rolls it back. Realtime does not store any messages in your `realtime.messages` table.

Using Realtime Authorization involves two steps:

- In your database, create RLS policies on the `realtime.messages`
- In your client, instantiate the Realtime Channel with the `config` option `private: true`

<Admonition type="caution">

Increased RLS complexity can impact database performance and connection time, leading to higher connection latency and decreased join rates.

</Admonition>

## Accessing request information

### `realtime.topic`

You can use the `realtime.topic` helper function when writing RLS policies. It returns the Channel topic the user is attempting to connect to.

```sql
create policy "authenticated can read all messages on topic"
on "realtime"."messages"
for select
to authenticated
using (
  (select realtime.topic()) = 'room-1'
);
```

### JWT claims

The user claims can be accessed using the `current_setting` function. The claims are available as a JSON object in the `request.jwt.claims` setting.

```sql
create policy "authenticated with supabase.io email can read all"
on "realtime"."messages"
for select
to authenticated
using (
  -- Only users with the email claim ending with @supabase.io
  (((current_setting('request.jwt.claims'))::json ->> 'email') ~~ '%@supabase.io')
);
```

## Examples

The following examples use this schema:

```sql
create table public.rooms (
    id bigint generated by default as identity primary key,
    topic text not null unique
);

GRANT SELECT ON public.rooms TO anon;

alter table public.rooms enable row level security;

create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text NOT NULL,

  primary key (id)
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

alter table public.profiles enable row level security;

create table public.rooms_users (
  user_id uuid references auth.users (id),
  room_topic text references public.rooms (topic),
  created_at timestamptz default current_timestamp
);

GRANT SELECT ON public.rooms_users TO authenticated;

alter table public.rooms_users enable row level security;

create policy "authenticated can read own room memberships"
on public.rooms_users
for select
to authenticated
using ((select auth.uid()) = user_id);
```

### Broadcast

The `extension` field on the `realtime.messages` table records the message type. For Broadcast messages, the value of `realtime.messages.extension` is `broadcast`. You can check for this in your RLS policies.

#### Allow a user to join (and read) a Broadcast topic

To join a Broadcast Channel, a user must have at least one read or write permission on the Channel topic.

Here, we allow reads (`select`s) for users who are linked to the requested topic within the relationship table `public.room_users`:

```sql
create policy "authenticated can receive broadcast"
on "realtime"."messages"
for select
to authenticated
using (
exists (
    select
      user_id
    from
      rooms_users
    where
      user_id = (select auth.uid())
      and room_topic = (select realtime.topic())
      and realtime.messages.extension in ('broadcast')
  )
);
```

Then, to join a topic with RLS enabled, instantiate the Channel with the `private` option set to `true`.

<Tabs
  scrollable
  size="small"
  type="underlined"
  defaultActiveId="js"
  queryGroup="language"
>
  <TabPanel id="js" label="JavaScript">
    ```javascript
    import { createClient } from '@supabase/supabase-js'
    const supabase = createClient('your_project_url', 'your_supabase_api_key')

    // ---cut---
    const channel = supabase.channel('room-1', {
      config: { private: true },
    })

    channel
      .on('broadcast', { event: 'test' }, (payload) => console.log(payload))
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected!')
        } else {
          console.error(err)
        }
      })
    ```

  </TabPanel>
  <$Show if="sdk:dart">
  <TabPanel id="dart" label="Dart">
    ```dart
    final channel = supabase.channel(
      'room-1',
      opts: const RealtimeChannelConfig(private: true),
    );

    channel
        .onBroadcast(event: 'test', callback: (payload) => print(payload))
        .subscribe((status, err) {
      if (status == RealtimeSubscribeStatus.subscribed) {
        print('Connected!');
      } else {
        print(err);
      }
    });
    ```

  </TabPanel>
  </$Show>
  <$Show if="sdk:swift">
  <TabPanel id="swift" label="Swift">
    ```swift
    let channel = supabase.channel("room-1") {
      $0.isPrivate = true
    }

    Task {
      for await payload in channel.broadcastStream(event: "test") {
        print(payload)
      }
    }

    await channel.subscribe()
    print("Connected!")
    ```

  </TabPanel>
  </$Show>
  <$Show if="sdk:kotlin">
  <TabPanel id="kotlin" label="Kotlin">
    ```kotlin
    val channel = supabase.channel("room-1") {
        isPrivate = true
    }
    channel.broadcastFlow<MyPayload>(event = "test").onEach {
        println(it)
    }.launchIn(scope) // launch in your coroutine scope
    channel.subscribe(blockUntilSubscribed = true)
    println("Connected!")
    ```

  </TabPanel>
  </$Show>
  <$Show if="sdk:python">
  <TabPanel id="python" label="Python">
    ```py
    channel = realtime.channel(
      "room-1", {"config": {"private": True}}
    )

    await channel.on_broadcast(
      "test", callback=lambda payload: print(payload)
    ).subscribe(
      lambda state, err: (
        print("Connected")
        if state == RealtimeSubscribeStates.SUBSCRIBED
        else print(err)
      )
    )
    ```

  </TabPanel>
  </$Show>
</Tabs>

#### Allow a user to send a Broadcast message

To authorize sending Broadcast messages, create a policy for `insert` where the value of `realtime.messages.extension` is `broadcast`.

Here, we allow writes (sends) for users who are linked to the requested topic within the relationship table `public.room_users`:

```sql
create policy "authenticated can send broadcast on topic"
on "realtime"."messages"
for insert
to authenticated
with check (
  exists (
    select
      user_id
    from
      rooms_users
    where
      user_id = (select auth.uid())
      and room_topic = (select realtime.topic())
      and realtime.messages.extension in ('broadcast')
  )
);
```

### Presence

The `extension` field on the `realtime.messages` table records the message type. For Presence messages, the value of `realtime.messages.extension` is `presence`. You can check for this in your RLS policies.

#### Allow users to listen to Presence messages on a Channel

Create a policy for `select` on `realtime.messages` where `realtime.messages.extension` is `presence`.

```sql
create policy "authenticated can listen to presence in topic"
on "realtime"."messages"
for select
to authenticated
using (
  exists (
    select
      user_id
    from
      rooms_users
    where
      user_id = (select auth.uid())
      and room_topic = (select realtime.topic())
      and realtime.messages.extension in ('presence')
  )
);
```

#### Allow users to send Presence messages on a channel

To update the Presence status for a user create a policy for `insert` on `realtime.messages` where the value of `realtime.messages.extension` is `presence`.

```sql
create policy "authenticated can track presence on topic"
on "realtime"."messages"
for insert
to authenticated
with check (
  exists (
    select
      user_id
    from
      rooms_users
    where
      user_id = (select auth.uid())
      and room_topic = (select realtime.topic())
      and realtime.messages.extension in ('presence')
  )
);
```

### Presence and Broadcast

Authorize both Presence and Broadcast by including both extensions in the `where` filter.

#### Broadcast and Presence read

Authorize Presence and Broadcast read in one RLS policy.

```sql
create policy "authenticated can listen to broadcast and presence on topic"
on "realtime"."messages"
for select
to authenticated
using (
  exists (
    select
      user_id
    from
      rooms_users
    where
      user_id = (select auth.uid())
      and room_topic = (select realtime.topic())
      and realtime.messages.extension in ('broadcast', 'presence')
  )
);
```

#### Broadcast and Presence write

Authorize Presence and Broadcast write in one RLS policy.

```sql
create policy "authenticated can send broadcast and presence on topic"
on "realtime"."messages"
for insert
to authenticated
with check (
  exists (
    select
      user_id
    from
      rooms_users
    where
      user_id = (select auth.uid())
      and room_topic = (select realtime.topic())
      and realtime.messages.extension in ('broadcast', 'presence')
  )
);
```

## Interaction with Postgres Changes

When using Postgres Changes on tables with RLS, database records are sent only to clients who are allowed to read them based on your RLS policies.

Private and public channels can subscribe to Postgres Changes.

## Updating RLS policies

Client access policies are cached for the duration of the connection. Your database is not queried for every Channel message.

Realtime updates the access policy cache for a client based on your RLS policies when:

- A client connects to Realtime and subscribes to a Channel
- A new JWT is sent to Realtime from a client via the [`access_token` message](/docs/guides/realtime/protocol#access-token)

If a new JWT is never received on the Channel, the client will be disconnected when the JWT expires.

Make sure to keep the JWT expiration window short.


---
# FILE: docs\reference\supabase\row-level-security.md

---
id: 'row-level-security'
title: 'Row Level Security'
description: 'Secure your data using Postgres Row Level Security.'
subtitle: 'Secure your data using Postgres Row Level Security.'
---

When you need granular authorization rules, nothing beats Postgres's [Row Level Security (RLS)](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

## Row Level Security in Supabase

<Admonition type="danger">

Supabase allows convenient and secure data access from the browser, as long as you enable RLS.

RLS _must_ always be enabled on any tables stored in an exposed schema. By default, this is the `public` schema.

RLS is enabled by default on tables created with the Table Editor in the dashboard. If you create one in raw SQL or with the SQL editor, remember to enable RLS yourself and grant only the permissions each Postgres role needs.

```sql
GRANT SELECT ON <schema_name>.<table_name> TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON <schema_name>.<table_name> TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON <schema_name>.<table_name> TO service_role;

alter table <schema_name>.<table_name>
enable row level security;
```

</Admonition>

RLS is incredibly powerful and flexible, allowing you to write complex SQL rules that fit your unique business needs. RLS can be combined with [Supabase Auth](/docs/guides/auth) for end-to-end user security from the browser to the database.

RLS is a Postgres primitive and can provide "[defense in depth](<https://en.wikipedia.org/wiki/Defense_in_depth_(computing)>)" to protect your data from malicious actors even when accessed through third-party tooling.

## Policies

[Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html) are Postgres's rule engine. Policies are easy to understand once you get the hang of them. Each policy is attached to a table, and the policy is executed every time a table is accessed.

You can just think of them as adding a `WHERE` clause to every query. For example a policy like this ...

```sql
create policy "Individuals can view their own todos."
on todos for select
using ( (select auth.uid()) = user_id );
```

.. would translate to this whenever a user tries to select from the todos table:

```sql
select *
from todos
where auth.uid() = todos.user_id;
-- Policy is implicitly added.
```

## Enabling Row Level Security

You can enable RLS for any table using the `enable row level security` clause:

```sql
alter table "table_name" enable row level security;
```

Once you have enabled RLS, no data will be accessible via the [API](/docs/guides/api) when using a publishable key, until you create policies.

## Auto-enable RLS for new tables

If you want RLS enabled automatically for new tables, you can create an event trigger that runs after table creation. This uses a Postgres [event trigger](/docs/guides/database/postgres/event-triggers) to call `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on each newly created table.

```sql
CREATE OR REPLACE FUNCTION rls_auto_enable()
RETURNS EVENT_TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS ensure_rls;
CREATE EVENT TRIGGER ensure_rls
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
EXECUTE FUNCTION rls_auto_enable();
```

Note that this applies to tables created after the trigger is installed. Existing tables still need RLS enabled manually.

<Admonition type="caution" title="`auth.uid()` Returns `null` When Unauthenticated">

When a request is made without an authenticated user (e.g., no access token is provided or the session has expired), `auth.uid()` returns `null`.

This means that a policy like:

```sql
USING (auth.uid() = user_id)
```

will silently fail for unauthenticated users, because:

```sql
null = user_id
```

is always false in SQL.

To avoid confusion and make your intention clear, we recommend explicitly checking for authentication:

```sql
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
```

</Admonition>

## Authenticated and unauthenticated roles

Supabase maps every request to one of the roles:

- `anon`: an unauthenticated request (the user is not logged in)
- `authenticated`: an authenticated request (the user is logged in)

These are actually [Postgres Roles](/docs/guides/database/postgres/roles). You can use these roles within your Policies using the `TO` clause:

```sql
create policy "Profiles are viewable by everyone"
on profiles for select
to authenticated, anon
using ( true );

-- OR

create policy "Public profiles are viewable only by authenticated users"
on profiles for select
to authenticated
using ( true );
```

<Admonition type="note" title="Anonymous user vs the anon key">

Using the `anon` Postgres role is different from an [anonymous user](/docs/guides/auth/auth-anonymous) in Supabase Auth. An anonymous user assumes the `authenticated` role to access the database and can be differentiated from a permanent user by checking the `is_anonymous` claim in the JWT.

</Admonition>

## Creating policies

Policies are SQL logic that you attach to a Postgres table. You can attach as many policies as you want to each table.

Supabase provides some [helpers](#helper-functions) that simplify RLS if you're using Supabase Auth. We'll use these helpers to illustrate some basic policies:

### SELECT policies

You can specify select policies with the `using` clause.

Let's say you have a table called `profiles` in the public schema and you want to enable read access to everyone.

```sql
-- 1. Create table
create table profiles (
  id uuid primary key,
  user_id uuid references auth.users,
  avatar_url text
);

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Create Policy
create policy "Public profiles are visible to everyone."
on profiles for select
to anon         -- the Postgres Role (recommended)
using ( true ); -- the actual Policy
```

Alternatively, if you only wanted users to be able to see their own profiles:

```sql
create policy "User can see their own profile only."
on profiles
for select using ( (select auth.uid()) = user_id );
```

### INSERT policies

You can specify insert policies with the `with check` clause. The `with check` expression ensures that any new row data adheres to the policy constraints.

Let's say you have a table called `profiles` in the public schema and you only want users to be able to create a profile for themselves. In that case, we want to check their User ID matches the value that they are trying to insert:

```sql
-- 1. Create table
create table profiles (
  id uuid primary key,
  user_id uuid references auth.users,
  avatar_url text
);

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Create Policy
create policy "Users can create a profile."
on profiles for insert
to authenticated                          -- the Postgres Role (recommended)
with check ( (select auth.uid()) = user_id );      -- the actual Policy
```

### UPDATE policies

You can specify update policies by combining both the `using` and `with check` expressions.

The `using` clause represents the condition that must be true for the update to be allowed, and `with check` clause ensures that the updates made adhere to the policy constraints.

Let's say you have a table called `profiles` in the public schema and you only want users to be able to update their own profile.

You can create a policy where the `using` clause checks if the user owns the profile being updated. And the `with check` clause ensures that, in the resultant row, users do not change the `user_id` to a value that is not equal to their User ID, maintaining that the modified profile still meets the ownership condition.

```sql
-- 1. Create table
create table profiles (
  id uuid primary key,
  user_id uuid references auth.users,
  avatar_url text
);

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Create Policy
create policy "Users can update their own profile."
on profiles for update
to authenticated                    -- the Postgres Role (recommended)
using ( (select auth.uid()) = user_id )       -- checks if the existing row complies with the policy expression
with check ( (select auth.uid()) = user_id ); -- checks if the new row complies with the policy expression
```

If no `with check` expression is defined, then the `using` expression will be used both to determine which rows are visible (normal USING case) and which new rows will be allowed to be added (WITH CHECK case).

<Admonition type="caution">

To perform an `UPDATE` operation, a corresponding [`SELECT` policy](#select-policies) is required. Without a `SELECT` policy, the `UPDATE` operation will not work as expected.

</Admonition>

### DELETE policies

You can specify delete policies with the `using` clause.

Let's say you have a table called `profiles` in the public schema and you only want users to be able to delete their own profile:

```sql
-- 1. Create table
create table profiles (
  id uuid primary key,
  user_id uuid references auth.users,
  avatar_url text
);

-- 2. Enable RLS
alter table profiles enable row level security;

-- 3. Create Policy
create policy "Users can delete a profile."
on profiles for delete
to authenticated                     -- the Postgres Role (recommended)
using ( (select auth.uid()) = user_id );      -- the actual Policy
```

### Views

Views bypass RLS by default because they are usually created with the `postgres` user. This is a feature of Postgres, which automatically creates views with `security definer`.

In Postgres 15 and above, you can make a view obey the RLS policies of the underlying tables when invoked by `anon` and `authenticated` roles by setting `security_invoker = true`.

```sql
create view <VIEW_NAME>
with(security_invoker = true)
as select <QUERY>
```

In older versions of Postgres, protect your views by revoking access from the `anon` and `authenticated` roles, or by putting them in an unexposed schema.

## Helper functions

Supabase provides some helper functions that make it easier to write Policies.

### `auth.uid()`

Returns the ID of the user making the request.

### `auth.jwt()`

<Admonition type="caution">

Not all information present in the JWT should be used in RLS policies. For instance, creating an RLS policy that relies on the `user_metadata` claim can create security issues in your application as this information can be modified by authenticated end users.

</Admonition>

Returns the JWT of the user making the request. Anything that you store in the user's `raw_app_meta_data` column or the `raw_user_meta_data` column will be accessible using this function. It's important to know the distinction between these two:

- `raw_user_meta_data` - can be updated by the authenticated user using the `supabase.auth.update()` function. It is not a good place to store authorization data.
- `raw_app_meta_data` - cannot be updated by the user, so it's a good place to store authorization data.

The `auth.jwt()` function is extremely versatile. For example, if you store some team data inside `app_metadata`, you can use it to determine whether a particular user belongs to a team. For example, if this was an array of IDs:

```sql
create policy "User is in team"
on my_table
to authenticated
using ( team_id in (select auth.jwt() -> 'app_metadata' -> 'teams'));
```

<Admonition type="caution">

Keep in mind that a JWT is not always "fresh". In the example above, even if you remove a user from a team and update the `app_metadata` field, that will not be reflected using `auth.jwt()` until the user's JWT is refreshed.

Also, if you are using Cookies for Auth, then you must be mindful of the JWT size. Some browsers are limited to 4096 bytes for each cookie, and so the total size of your JWT should be small enough to fit inside this limitation.

</Admonition>

### MFA

The `auth.jwt()` function can be used to check for [Multi-Factor Authentication](/docs/guides/auth/auth-mfa#enforce-rules-for-mfa-logins). For example, you could restrict a user from updating their profile unless they have at least 2 levels of authentication (Assurance Level 2):

```sql
create policy "Restrict updates."
on profiles
as restrictive
for update
to authenticated using (
  (select auth.jwt()->>'aal') = 'aal2'
);
```

## Bypassing Row Level Security

Supabase provides special "Service" keys, which can be used to bypass RLS. These should never be used in the browser or exposed to customers, but they are useful for administrative tasks.

<Admonition type="note">

Supabase will adhere to the RLS policy of the signed-in user, even if the client library is initialized with a Service Key.

</Admonition>

You can also create new [Postgres Roles](/docs/guides/database/postgres/roles) which can bypass Row Level Security using the "bypass RLS" privilege:

```sql
alter role "role_name" with bypassrls;
```

This can be useful for system-level access. You should _never_ share login credentials for any Postgres Role with this privilege.

## RLS performance recommendations

Every authorization system has an impact on performance. While row level security is powerful, the performance impact is important to keep in mind. This is especially true for queries that scan every row in a table - like many `select` operations, including those using limit, offset, and ordering.

Based on a series of [tests](https://github.com/GaryAustin1/RLS-Performance), we have a few recommendations for RLS:

### Add indexes

Make sure you've added [indexes](/docs/guides/database/postgres/indexes) on any columns used within the Policies which are not already indexed (or primary keys). For a Policy like this:

```sql
create policy "rls_test_select" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

You can add an index like:

```sql
create index userid
on test_table
using btree (user_id);
```

#### Benchmarks

| Test                                                                                          | Before (ms) | After (ms) | % Improvement | Change                                                                                                   |
| --------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| [test1-indexed](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test1-indexed) | 171         | < 0.1      | 99.94%        | <details className="cursor-pointer">Before:<br/>No index<br/><br/>After:<br/>`user_id` indexed</details> |

### Call functions with `select`

You can use `select` statement to improve policies that use functions. For example, instead of this:

```sql
create policy "rls_test_select" on test_table
to authenticated
using ( auth.uid() = user_id );
```

You can do:

```sql
create policy "rls_test_select" on test_table
to authenticated
using ( (select auth.uid()) = user_id );
```

This method works well for JWT functions like `auth.uid()` and `auth.jwt()` as well as `security definer` Functions. Wrapping the function causes an `initPlan` to be run by the Postgres optimizer, which allows it to "cache" the results per-statement, rather than calling the function on each row.

<Admonition type="caution">

You can only use this technique if the results of the query or function do not change based on the row data.

</Admonition>

#### Benchmarks

| Test                                                                                                                              | Before (ms) | After (ms) | % Improvement | Change                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [test2a-wrappedSQL-uid](<https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test2a-wrappedSQL-uid()>)                 | 179         | 9          | 94.97%        | <details className="cursor-pointer">Before:<br/>`auth.uid() = user_id` <br/><br/>After:<br/> `(select auth.uid()) = user_id`</details>                                    |
| [test2b-wrappedSQL-isadmin](<https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test2b-wrappedSQL-isadmin()>)         | 11,000      | 7          | 99.94%        | <details className="cursor-pointer">Before:<br/>`is_admin()` _table join_<br/><br/>After:<br/>`(select is_admin())` _table join_</details>                                |
| [test2c-wrappedSQL-two-functions](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test2c-wrappedSQL-two-functions) | 11,000      | 10         | 99.91%        | <details className="cursor-pointer">Before:<br/>`is_admin() OR auth.uid() = user_id`<br/><br/>After:<br/>`(select is_admin()) OR (select auth.uid() = user_id)`</details> |
| [test2d-wrappedSQL-sd-fun](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test2d-wrappedSQL-sd-fun)               | 178,000     | 12         | 99.993%       | <details className="cursor-pointer">Before:<br/>`has_role() = role` <br/><br/>After:<br/>(select has_role()) = role</details>                                             |
| [test2e-wrappedSQL-sd-fun-array](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test2e-wrappedSQL-sd-fun-array)   | 173000      | 16         | 99.991%       | <details className="cursor-pointer">Before:<br/>`team_id=any(user_teams())` <br/><br/>After:<br/>team_id=any(array(select user_teams()))</details>                        |

### Add filters to every query

Policies are "implicit where clauses," so it's common to run `select` statements without any filters. This is a bad pattern for performance. Instead of doing this (JS client example):

{/* prettier-ignore */}
```js
const { data } = supabase
  .from('table')
  .select()
```

You should always add a filter:

{/* prettier-ignore */}
```js
const { data } = supabase
  .from('table')
  .select()
  .eq('user_id', userId)
```

Even though this duplicates the contents of the Policy, Postgres can use the filter to construct a better query plan.

#### Benchmarks

| Test                                                                                              | Before (ms) | After (ms) | % Improvement | Change                                                                                                                                 |
| ------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [test3-addfilter](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test3-addfilter) | 171         | 9          | 94.74%        | <details className="cursor-pointer">Before:<br/>`auth.uid() = user_id`<br/><br/>After:<br/>add `.eq` or `where` on `user_id`</details> |

### Use security definer functions

A "security definer" function runs using the same role that _created_ the function. This means that if you create a role with a superuser (like `postgres`), then that function will have `bypassrls` privileges. For example, if you had a policy like this:

```sql
create policy "rls_test_select" on test_table
to authenticated
using (
  exists (
    select 1 from roles_table
    where (select auth.uid()) = user_id and role = 'good_role'
  )
);
```

We can instead create a `security definer` function which can scan `roles_table` without any RLS penalties:

```sql
create function private.has_good_role()
returns boolean
language plpgsql
security definer -- will run as the creator
as $$
begin
  return exists (
    select 1 from roles_table
    where (select auth.uid()) = user_id and role = 'good_role'
  );
end;
$$;

-- Update our policy to use this function:
create policy "rls_test_select"
on test_table
to authenticated
using ( (select private.has_good_role()) );
```

<Admonition type="caution">

Security-definer functions should never be created in a schema in the "Exposed schemas" inside your [API settings](/dashboard/project/_/settings/api)`.

</Admonition>

### Minimize joins

You can often rewrite your Policies to avoid joins between the source and the target table. Instead, try to organize your policy to fetch all the relevant data from the target table into an array or set, then you can use an `IN` or `ANY` operation in your filter.

For example, this is an example of a slow policy which joins the source `test_table` to the target `team_user`:

```sql
create policy "rls_test_select" on test_table
to authenticated
using (
  (select auth.uid()) in (
    select user_id
    from team_user
    where team_user.team_id = team_id -- joins to the source "test_table.team_id"
  )
);
```

We can rewrite this to avoid this join, and instead select the filter criteria into a set:

```sql
create policy "rls_test_select" on test_table
to authenticated
using (
  team_id in (
    select team_id
    from team_user
    where user_id = (select auth.uid()) -- no join
  )
);
```

In this case you can also consider [using a `security definer` function](#use-security-definer-functions) to bypass RLS on the join table:

<Admonition type="note">

If the list exceeds 1000 items, a different approach may be needed or you may need to analyze the approach to ensure that the performance is acceptable.

</Admonition>

#### Benchmarks

| Test                                                                                                | Before (ms) | After (ms) | % Improvement | Change                                                                                                                                            |
| --------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [test5-fixed-join](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test5-fixed-join) | 9,000       | 20         | 99.78%        | <details className="cursor-pointer">Before:<br/>`auth.uid()` in table join on col<br/><br/>After:<br/>col in table join on `auth.uid()`</details> |

### Specify roles in your policies

Always use the Role of inside your policies, specified by the `TO` operator. For example, instead of this query:

```sql
create policy "rls_test_select" on rls_test
using ( auth.uid() = user_id );
```

Use:

```sql
create policy "rls_test_select" on rls_test
to authenticated
using ( (select auth.uid()) = user_id );
```

This prevents the policy `( (select auth.uid()) = user_id )` from running for any `anon` users, since the execution stops at the `to authenticated` step.

#### Benchmarks

| Test                                                                                          | Before (ms) | After (ms) | % Improvement | Change                                                                                                                           |
| --------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [test6-To-role](https://github.com/GaryAustin1/RLS-Performance/tree/main/tests/test6-To-role) | 170         | < 0.1      | 99.78%        | <details className="cursor-pointer">Before:<br/>No `TO` policy<br/><br/>After:<br/>`TO authenticated` (anon accessing)</details> |

## More resources

- [Testing your database](/docs/guides/database/testing)
- [RLS Guide and Best Practices](https://github.com/orgs/supabase/discussions/14576)
- Community repo on testing RLS using [pgTAP and dbdev](https://github.com/usebasejump/supabase-test-helpers/tree/main)
