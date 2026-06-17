import { describe, expect, it } from 'vitest'

/**
 * INV-3D-2 · tek-Canvas / merkezi config (kalıcı bekçi) — standart §3 / SSOT §1 / A5.
 *
 * Ham `<Canvas>` yalnız merkezi `VentHubCanvas` kabuğunda olmalı. Her bileşenin kendi `<Canvas>`'ı =
 * config drift + tutarsız görsel + (çoklu yüzey) Safari context-limiti çökmesi. Bu bekçi yeni ham
 * `<Canvas>` eklenmesini bloklar.
 *
 * RATCHET: henüz göç etmemiş yüzeyler LEGACY_RAW_CANVAS'ta. Bir yüzey VentHubCanvas'a taşınınca
 * (ham <Canvas> kalkınca) stale-guard onu allowlist'ten SİLMEYE zorlar → liste sıfıra iner.
 * (i18n INV-5 KNOWN_UNRESOLVED deseniyle aynı.)
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const CANVAS_RE = /<Canvas[\s/>]/

/** Tek izinli ham <Canvas> yeri = merkezi kabuk. */
const CANONICAL = 'src/components/products/3d/core/VentHubCanvas.tsx'

/** Wave 2-3'te VentHubCanvas'a taşınacak yüzeyler — göç edince buradan SİLİNECEK. */
const LEGACY_RAW_CANVAS = new Set<string>([
  'src/components/products/OrbitalProductsShowcase.tsx',
  'src/components/products/InfiniteProductsShowcase.tsx',
  'src/components/products/BlueprintCanvas.tsx',
  'src/components/navigation/CategoryHubOverlay.tsx',
  'src/components/navigation/CategoryCard3D.tsx',
  'src/components/navigation/CategorySpotlightScene.tsx',
  'src/components/navigation/MegaMenu3DBackground.tsx',
  'src/components/authority/ThreeDAuthority.tsx',
])

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

function toRel(key: string): string {
  return key.replace(/^\//, '')
}

describe('INV-3D-2 · tek-Canvas / merkezi config', () => {
  it('ham <Canvas> yalnız VentHubCanvas\'ta — allowlist dışı her yerde YASAK', () => {
    const offenders: string[] = []
    for (const [key, src] of Object.entries(SOURCES)) {
      const rel = toRel(key)
      if (rel === CANONICAL || LEGACY_RAW_CANVAS.has(rel)) continue
      if (CANVAS_RE.test(stripComments(src))) {
        offenders.push(`${rel}: ham <Canvas> — <VentHubCanvas> kullan (SSOT §1 / A5)`)
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([])
  })

  it('stale-guard: allowlist\'teki her dosya HÂLÂ ham <Canvas> içerir (göç edilen SİLİNMELİ)', () => {
    const stale: string[] = []
    const present = new Set(Object.keys(SOURCES).map(toRel))
    for (const f of LEGACY_RAW_CANVAS) {
      if (!present.has(f)) {
        stale.push(`${f}: allowlist'te ama dosya YOK — kaldır`)
        continue
      }
      if (!CANVAS_RE.test(stripComments(SOURCES[`/${f}`]))) {
        stale.push(`${f}: artık ham <Canvas> yok (göç edildi) — LEGACY_RAW_CANVAS'tan SİL`)
      }
    }
    expect(stale, `\n${stale.join('\n')}`).toEqual([])
  })
})
