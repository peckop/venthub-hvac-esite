'use client'

import { Environment, Lightformer } from '@react-three/drei'

export type EnvPresetKey = 'product' | 'showcase' | 'nav' | 'authority'

/**
 * A2/C1 — PROSEDÜREL environment: SIFIR dosya/CDN (canlı çökme bir dummy .hdr'dan geldi).
 * drei <Environment> `files` DEĞİL, çocuk <Lightformer> rig → metaller IBL alır (kararmaz), yüklenecek dosya yok.
 * B5 — `frames={1}` statik (her frame yeniden render etmez); ≤3 ışık-eşdeğeri.
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
      <ambientLight intensity={0.35 * k} />
      <directionalLight position={[10, 15, 10]} intensity={1.2 * k} castShadow shadow-mapSize={1024} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2 * k} position={[5, 5, 5]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1 * k} position={[-5, 3, -5]} scale={[8, 8, 1]} color="#dbeafe" />
        <Lightformer form="circle" intensity={1.5 * k} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>
    </>
  )
}
