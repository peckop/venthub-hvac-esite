'use client'

import { Environment, Lightformer } from '@react-three/drei'

export type EnvPresetKey = 'product' | 'showcase' | 'nav' | 'authority'

/**
 * A2/C1 — PROSEDÜREL environment: SIFIR dosya/CDN (canlı çökme bir dummy .hdr'dan geldi).
 * drei <Environment> `files` DEĞİL, çocuk <Lightformer> rig → metaller IBL alır (kararmaz), yüklenecek dosya yok.
 * B5 — `frames={1}` statik (her frame yeniden render etmez); gerçek-zamanlı ışık ≤3 (ambient + 1 directional).
 *
 * GÖRSEL v2 (2026-06-17) — "premium ürün-shot" yükseltmesi (merkezi, tüm yüzeyleri kaldırır):
 *   3-NOKTA stüdyo: key (sıcak) + fill (soğuk) + **rim/back** (kenar ayrımı = pahalı pop, eksik ayaktı)
 *   + top. IBL 256→512 (metalde daha keskin yansıma; frames={1} olduğu için tek-sefer, perf bedava).
 *   Lightformer'lar env-map'e bakılır (gerçek-zamanlı ışık DEĞİL) → sayıları B5 bütçesini etkilemez.
 *   NOT: yoğunluk/renk değerleri görsel-ayar ister (Recep'in gözüyle nudge'lanacak).
 */
const RIG_INTENSITY: Record<EnvPresetKey, number> = {
  product: 1,
  showcase: 1.2,
  nav: 0.7,
  authority: 1,
}

export function SceneLightingRig({ env = 'product' }: { env?: EnvPresetKey }) {
  const k = RIG_INTENSITY[env]
  return (
    <>
      {/* Gerçek-zamanlı (B5 bütçesi): ambient + 1 gölge-veren key.
          v4 (2026-06-18) — "yarı aydınlık/yarı gölge" düzeltmesi: tek sert ışık ürünün bir yüzünü
          karanlıkta bırakıyordu. Key YUMUŞATILDI (1.5→1.0) + daha merkezi ([4..]→[2..], yan-tarama azaldı);
          ambient YÜKSELTİLDİ (0.4→0.55) → gölge tarafı dolar. */}
      <ambientLight intensity={0.55 * k} />
      <directionalLight position={[2, 7, 11]} intensity={1.0 * k} castShadow shadow-mapSize={1024} />
      {/* IBL — prosedürel stüdyo (512 = keskin metal yansıması; frames={1} → tek-sefer render). */}
      <Environment resolution={512} frames={1}>
        {/* KEY — ön-sağ, KAMERA tarafından, hafif SICAK (2.8→2.2: fill'e yakınlaştı → yan-kontrast düştü). */}
        <Lightformer form="rect" intensity={2.2 * k} position={[4, 4, 9]} scale={[10, 10, 1]} color="#fff4e6" />
        {/* FILL — ön-sol, SOĞUK (1.2→1.9 GÜÇLENDİ → ürünün sol yarısı artık karanlık kalmıyor, iki yan dengeli). */}
        <Lightformer form="rect" intensity={1.9 * k} position={[-6, 2, 6]} scale={[8, 8, 1]} color="#dbeafe" />
        {/* RIM/BACK — arkadan-üstten HAFİF kenar ışığı (silüet yapmasın diye 3.2→1.5 azaltıldı). */}
        <Lightformer form="rect" intensity={1.5 * k} position={[0, 6, -6]} scale={[6, 2.5, 1]} color="#ffffff" />
        {/* TOP — tepe yumuşak çember, genel ortam. */}
        <Lightformer form="circle" intensity={1.0 * k} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>
    </>
  )
}
