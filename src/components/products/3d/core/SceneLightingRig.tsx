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
      {/* Gerçek-zamanlı (B5 bütçesi): ambient + 1 gölge-veren key directional. */}
      <ambientLight intensity={0.3 * k} />
      <directionalLight position={[8, 14, 8]} intensity={1.35 * k} castShadow shadow-mapSize={1024} />
      {/* IBL — prosedürel stüdyo (512 = keskin metal yansıması; frames={1} → tek-sefer render). */}
      <Environment resolution={512} frames={1}>
        {/* KEY — büyük yumuşak, ön-sağ, hafif SICAK (premium ürün-shot tonu). */}
        <Lightformer form="rect" intensity={2.6 * k} position={[5, 5, 5]} scale={[10, 10, 1]} color="#fff4e6" />
        {/* FILL — SOĞUK, zayıf, ön-sol (gölge yumuşatma + renk-kontrast). */}
        <Lightformer form="rect" intensity={0.85 * k} position={[-6, 3, -2]} scale={[8, 8, 1]} color="#dbeafe" />
        {/* RIM/BACK — arkadan parlak dar şerit: kenar ayrımı = "pahalı" pop (3-nokta'nın eksik ayağı). */}
        <Lightformer form="rect" intensity={3.2 * k} position={[0, 4, -7]} scale={[7, 2.5, 1]} color="#ffffff" />
        {/* TOP — tepe yumuşak çember, genel ortam. */}
        <Lightformer form="circle" intensity={1.1 * k} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>
    </>
  )
}
