# 3D Decoder WASM'leri (YEREL barındırma)

Bu dizin Draco (geometri) ve KTX2/Basis (texture) **decoder wasm** dosyalarını **yerel** barındırır —
CDN'den (gstatic/jsdelivr) DEĞİL.

**Neden yerel?** `docs/standards/3d-webgl-standard.md` A2/B6:
- Kritik render yolunda CDN bağımlılığı = çökme riski (ağ/CSP).
- Yerel = CSP `connect-src` genişletmesi gerekmez, ağ-kesintisinde çökmez.

## Beklenen yapı (GLB göçünden ÖNCE doldurulur)
```
public/decoders/draco/    # draco_decoder.wasm + draco_decoder.js (three.js examples/jsm/libs/draco/)
public/decoders/basis/    # basis_transcoder.wasm + basis_transcoder.js (three.js examples/jsm/libs/basis/)
```

`src/components/products/3d/core/assetRegistry.ts` → `DRACO_DECODER_PATH='/decoders/draco/'`, `KTX2_DECODER_PATH='/decoders/basis/'`.

> **ŞU AN:** Tüm 3D modeller prosedürel (GLB yok) → decoder henüz yüklenmiyor. İlk GLB asset eklenmeden
> ÖNCE bu wasm'ler buraya konmalı; yoksa Draco/KTX2 sessizce kırılır (INV-3D-1 ile yakalanır).
