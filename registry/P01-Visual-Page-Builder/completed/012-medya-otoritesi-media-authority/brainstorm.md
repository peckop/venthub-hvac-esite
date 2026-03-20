# 🧠 Brainstorm: P01-012 Medya Otoritesi (Media Authority)

## 🎯 Vizyon
Page Builder'ın görsel gücünü besleyen, medya varlıklarını (Video, 3D, Teknik Çizim) "akıllı nesneler" olarak yöneten merkezi bir otorite altyapısı kurmak.

## 🛠️ Teknik Stratejiler

### 1. Medya Metadata Şeması (JSONB)
Varlıklar sadece bir dosya yolu değil, aşağıdaki metadata setine sahip olmalıdır:
- **Video:** `provider` (Cloudflare/YouTube/S3), `aspect_ratio`, `auto_play`, `loop`, `thumbnail_url`.
- **3D Model (Three.js):** `model_format` (GLB/OBJ), `initial_zoom`, `auto_rotate`, `environment_map`, `hotspots`.
- **Teknik Çizim:** `drawing_type` (CAD/PDF/SVG), `standard` (ISO/TSE), `is_downloadable`.

### 2. Performans ve Optimizasyon
- **Lazy Loading:** Tüm medya bileşenleri `IntersectionObserver` ile sadece görünür olduğunda yüklenecek.
- **Skeleton States:** 3D modeller yüklenirken ağır "loading" ekranları yerine zarif `Skeleton` iskeletleri kullanılacak.
- **CDN Strategy:** Cloudflare Stream ve R2 entegrasyonu için metadata yapıları hazır tutulacak.

### 3. Page Builder Entegrasyonu
- Medya nesneleri, Page Builder'ın (`P01-017`) blok yapısına JSON üzerinden tam uyumlu şekilde akacak.
- Admin panelinde bir medya seçildiğinde, ona uygun ayar seti (Örn: videonun sesli olup olmayacağı) otomatik belirecek.

## ⚠️ Riskler ve Çözümler
- **LCP (Largest Contentful Paint):** Ağır 3D modellerin açılış hızını etkilememesi için "Click-to-Load" veya düşük poligonlu placeholder stratejisi izlenecek.
- **Data Integrity:** Silinen bir medyanın JSONB içinde "hayalet link" bırakmaması için bir audit/cleanup logic planlanmalı.

## 🚀 Başarı Kriterleri
- [ ] Merkezi bir `MediaObject` TypeScript tanımı.
- [ ] 3D modeller için dinamik prop-driven bileşen altyapısı.
- [ ] Teknik çizimler için versiyonlanabilir metadata yapısı.
