# Strategy: P03-NEXTGEN-3D-EXPERIENCE

## 1. Vizyon
VentHub e-ticaret deneyimini statik görsellerden kurtarıp, "Web-Rewind" tarzı gerçek zamanlı, akıcı ve interaktif bir 3D dünyasına taşımak. Kullanıcıların HVAC sistemlerini (havalandırma üniteleri, fanlar, boru sistemleri) tarayıcı içinde parçalarına ayırabildiği, teknik detayları 3D katmanlar üzerinden inceleyebildiği bir "Sanal Mühendislik" katmanı oluşturmak.

## 2. Mimari Yaklaşım (Reference: web-rewind.com)
Bu proje kapsamında kullanılacak teknoloji yığını ve metodoloji şudur:
- **Core Engine:** Three.js + React Three Fiber (R3F)
- **Model Optimization:** Draco Compression (Google Draco)
- **Animation System:** GSAP (GreenSock) + R3F ScrollControls
- **Asset Strategy:** Dynamic Chunked Loading (Parçalı Yükleme)
- **Look & Feel:** High-End Post Processing (Bloom, Depth of Field, Tone Mapping)

## 3. Temel Hedefler
- [ ] Ürün detay sayfalarında %100 gerçek zamanlı 3D modelleme.
- [ ] "Exploded View" (Patlatılmış Görünüm) özelliği ile iç aksam inceleme.
- [ ] Havalandırma akış simülasyonlarının 3D ortamda görselleştirilmesi.
- [ ] Düşük internet hızlarında bile Draco sayesinde hızlı yükleme.

## 4. Başarı Kriterleri (Mühür)
- LCP (Largest Contentful Paint) 3 saniyenin altında kalmalı (3D modeller dahil).
- Mobil cihazlarda 60 FPS akıcılık.
- SEO dostu; 3D içeriklerin meta verileriyle arama motorlarına sunulması.
