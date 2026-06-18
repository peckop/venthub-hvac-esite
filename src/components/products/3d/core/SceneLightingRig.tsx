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
      {/* Gerçek-zamanlı ışık (B5 tavanı ≤3): ambient + KEY + FILL.
          v5 (2026-06-18) — v4 fazla KARANLIKTI: key'i kısıp (1.5→1.0) mat ürünleri IBL'e bırakmak HATAYDI;
          IBL/Lightformer mat boyalı yüzeyi aydınlatmaz (yalnız metal yansıması verir). Düzeltme:
          ambient'i belirgin YÜKSELT (0.55→0.85) + KEY'i geri GÜÇLENDİR (1.0→1.7) + GERÇEK ikinci
          directional FILL ekle (sol-ön) → mat ürünler parlak ve iki yanı dolu (yarı-karanlık biter). */}
      <ambientLight intensity={0.85 * k} />
      {/* KEY — ön-sağ-üst: ana ışık + gölge (form/derinlik). */}
      <directionalLight position={[5, 8, 10]} intensity={1.7 * k} castShadow shadow-mapSize={1024} />
      {/* FILL — sol-ön: gölge yüzünü GERÇEKTEN doldurur (IBL değil, gerçek ışık); gölge yok = ucuz. */}
      <directionalLight position={[-7, 4, 8]} intensity={1.0 * k} />
      {/* IBL — prosedürel stüdyo: yalnız metal yansıması/pop (mat aydınlatma yukarıdaki gerçek ışıklardan). */}
      <Environment resolution={512} frames={1}>
        {/* KEY env — ön-sağ, hafif SICAK. */}
        <Lightformer form="rect" intensity={2.0 * k} position={[5, 4, 9]} scale={[10, 10, 1]} color="#fff4e6" />
        {/* FILL env — ön-sol, SOĞUK. */}
        <Lightformer form="rect" intensity={1.6 * k} position={[-6, 2, 6]} scale={[8, 8, 1]} color="#dbeafe" />
        {/* RIM/BACK — arkadan-üstten HAFİF kenar ışığı. */}
        <Lightformer form="rect" intensity={1.2 * k} position={[0, 6, -6]} scale={[6, 2.5, 1]} color="#ffffff" />
        {/* TOP — tepe yumuşak çember, genel ortam. */}
        <Lightformer form="circle" intensity={1.0 * k} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>
    </>
  )
}
