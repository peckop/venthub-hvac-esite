# 🛰️ Medya Otoritesi (Media Authority) - P01-012

Bu dizin, VentHub projesi genelindeki zengin medya içeriklerinin (Video, 3D, Teknik Çizim) standartlaştırılmış render motorlarını içerir.

## 🛠️ Bileşenler

### 1. `VideoAuthority`
- **Kullanım:** Cloudflare Stream ve YouTube videolarını tek tip arayüzle sunar.
- **Performans:** Lazy loading ve thumbnail desteği içerir.
- **Şema:** `VideoMetadata`

### 2. `ThreeDAuthority`
- **Kullanım:** GLB/GLTF formatındaki 3D modelleri interaktif olarak sergiler.
- **Performans:** "Click-to-Load" stratejisi ile ilk yükleme maliyetini sıfıra indirir.
- **Şema:** `ThreeDMetadata`

### 3. `TechnicalDrawingAuthority`
- **Kullanım:** CAD, PDF ve SVG çizimlerini versiyon takibiyle listeler.
- **Şema:** `TechnicalDrawingMetadata`

## 📊 Page Builder Entegrasyon Örneği (JSON)

Page Builder (`P01-017`) üzerinden gönderilecek olan `authority_content` alanı aşağıdaki yapıda olmalıdır:

```json
{
  "media_block": {
    "type": "3d",
    "metadata": {
      "modelId": "vortice-lineo-100",
      "format": "glb",
      "modelUrl": "/models/lineo-100.glb",
      "config": {
        "initialZoom": 6,
        "autoRotate": true,
        "environment": "industrial"
      },
      "hotspots": [
        { "position": [1, 2, 0], "label": "Motor", "description": "Yüksek verimli EC motor." }
      ]
    }
  },
  "video_block": {
    "type": "video",
    "metadata": {
      "id": "youtube_video_id",
      "provider": "youtube",
      "title": "Ürün Tanıtımı",
      "aspectRatio": "16:9",
      "options": { "autoPlay": false, "muted": true }
    }
  }
}
```

---
*Bu otorite katmanı, görsel zenginlik ve performans dengesini korumak için mühürlenmiştir.*
