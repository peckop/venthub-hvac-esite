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
