---
description: 3D Üretim Bandı (Multi-Agent) Workflow
---

# 🚀 3D Üretim Bandı Workflow (Agentic Factory)

Bu workflow, bir ürünün referans görüntüsünden başlayarak modüler, etkileşimli ve CAD kalitesinde bir 3D model üretmek için tasarlanmıştır.

## 🛠️ Süreç Adımları

### 1. Vizyon Analizi (Blueprint Oluşturma)
// turbo
1. Verilen resimleri `gemini-vision` veya benzeri bir analiz aracıyla incele.
2. Ürünü şu bileşenlere ayır:
    - **Mechanical:** Ana gövde, flanşlar, şasi.
    - **Rotor:** Pervane, motor, hareketli aksam.
    - **Detail:** Elektrik kutusu, vidalar, etiketler, ayaklar.
3. `/src/components/products/3d/factory/blueprints/[slug]-blueprint.json` dosyasını oluştur. (Koordinatlar, materyaller ve hiyerarşi burada tanımlanmalıdır).

### 2. Paralel Parça Üretimi (Multi-Ajan Tetikleme)
1. Blueprint'teki her bir "Part" için `spawn_subagent` aracını kullan.
2. Her ajana şu görevi ver:
    - "React-Three-Fiber kullanarak `[0,0,0]` merkezli modüler bir parça kodla."
    - "Materyalleri `useFanMaterials` hook'undan çek."
    - "Sonucu `/src/components/products/3d/factory/parts/[PartName].tsx` olarak kaydet."

### 3. Montaj (Assembler Phase)
1. Alt ajanlardan gelen dosyaları doğrula.
2. `src/components/products/3d/factory/Assembler.tsx` (veya modele özel bileşen) kullanarak parçaları Blueprint koordinatlarına göre birleştir.
3. `FanRenderer.tsx` içine yeni modeli kaydet.

### 4. Son Kontrol & Entegrasyon
1. `pnpm run lint` ve `typecheck` yap.
2. `Product3DViewer` üzerinde modeli test et.

## 💡 İpuçları
- Her parça bağımsız (Isolated) olmalıdır.
- Karmaşık animasyonlar `Rotor` grubunda tanımlanmalıdır.
- Materyal birliği için mutlaka `../materials/useFanMaterials` kullanılmalıdır.
