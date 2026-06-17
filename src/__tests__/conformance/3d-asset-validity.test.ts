import { describe, expect, it } from 'vitest'

/**
 * INV-3D-1 · 3D asset-validity (kalıcı bekçi) — standart §3.
 *
 * CANLI ÇÖKME: `Product3DViewer`'a 42 byte'lık bozuk dummy `city_256.hdr` (FORMAT= yok) konmuştu;
 * parse hatası Suspense/ErrorBoundary'yi atlayıp TÜM sayfayı `Context Lost` ile çökertti.
 * Bu bekçi tam o sınıfı yakalar: (a) public/ altındaki her .hdr/.glb dolu+geçerli mi, (b) kodda
 * referans verilen her yerel 3D asset yolu public/ altında gerçekten var mı. tsc/lint/build bunu
 * görmez (asset parse, statik tip değil) — yalnız bu test yakalar.
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

// public/ altındaki 3D asset'leri ham içerikle yükle (Vite glob — node:fs gerektirmez).
const PUBLIC_3D: Record<string, string> = import.meta.glob('/public/**/*.{hdr,glb,gltf}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const LOCAL_ASSET_REF = /['"](\/[\w./-]+\.(?:hdr|glb|gltf))['"]/g

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

describe('INV-3D-1 · 3D asset-validity', () => {
  it('public/ içindeki her .hdr/.glb dolu + geçerli (42B dummy / placeholder YASAK)', () => {
    const bad: string[] = []
    for (const [key, content] of Object.entries(PUBLIC_3D)) {
      const rel = key.replace(/^\//, '')
      if (content.length < 256) {
        bad.push(`${rel}: ${content.length}B — dummy/placeholder şüphesi (gerçek asset ≫ 1KB)`)
        continue
      }
      if (/\.hdr$/i.test(key) && !content.includes('FORMAT=')) {
        bad.push(`${rel}: geçersiz HDR — 'FORMAT=' başlığı yok (parse edilemez → çökme)`)
      }
    }
    expect(bad, `\n${bad.join('\n')}`).toEqual([])
  })

  it('kodda referans verilen her yerel 3D asset yolu public/ altında VAR', () => {
    const publicPaths = new Set(Object.keys(PUBLIC_3D).map((k) => k.replace(/^\/public/, '')))
    const missing: string[] = []
    for (const [key, src] of Object.entries(SOURCES)) {
      // Test dosyaları fixture/örnek asset yolları taşır (gerçek app referansı değil) → atla.
      if (/__tests__\/|\.test\.|\.spec\./.test(key)) continue
      const clean = stripComments(src)
      let m: RegExpExecArray | null
      LOCAL_ASSET_REF.lastIndex = 0
      while ((m = LOCAL_ASSET_REF.exec(clean)) !== null) {
        if (!publicPaths.has(m[1])) {
          missing.push(`${key.replace(/^\//, '')}: '${m[1]}' public/ altında YOK`)
        }
      }
    }
    expect(missing, `\n${missing.join('\n')}`).toEqual([])
  })
})
