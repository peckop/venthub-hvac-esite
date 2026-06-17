import { describe, expect, it } from 'vitest'

/**
 * INV-3D-4 (slice) · prosedürel environment / çökme-class lock (kalıcı bekçi) — standart §3 / A2.
 *
 * Dosya/CDN-tabanlı `<Environment files="...">` YASAK: canlı çökme tam olarak bir dummy `.hdr`
 * dosyasından geldi. Merkezi `SceneLightingRig` prosedürel `<Environment>` + `<Lightformer>`
 * (files YOK) kullanır → yüklenecek/bozulacak dosya yok, metaller yine IBL alır (C1). Bu bekçi
 * dosya-Environment'ın geri sızmasını bloklar.
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

// <Environment ... files=...> (prosedürel <Environment> = files YOK → eşleşmez).
const ENV_FILES_RE = /<Environment\s+[^>]*\bfiles\s*=/

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

describe('INV-3D-4 · prosedürel environment (dosya-Environment YASAK)', () => {
  it('hiçbir yerde <Environment files="..."> yok — prosedürel SceneLightingRig zorunlu', () => {
    const offenders: string[] = []
    for (const [key, src] of Object.entries(SOURCES)) {
      if (ENV_FILES_RE.test(stripComments(src))) {
        offenders.push(
          `${key.replace(/^\//, '')}: <Environment files=...> — dosya/HDR bağımlılığı çökme riski (A2). Prosedürel rig kullan.`,
        )
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([])
  })
})
