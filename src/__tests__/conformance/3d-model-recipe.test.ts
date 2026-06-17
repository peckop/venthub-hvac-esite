import { describe, expect, it } from 'vitest'

/**
 * INV-3D-7 · model-katmanı recipe (kalıcı bekçi) — standart §2 B3/C3 / §3 / §1 (sihirli-metalness).
 *
 * NİÇİN: `3d-wave3-models-brief.md` worker'a leaf model/part dosyalarına recipe'yi (B3 pool · C3
 * paylaşılan materyal) uygulattı — AMA bunu zorlayan test YOKTU. Worker recipe'yi atlasa bile
 * type-check/test/build YİNE geçer (perf/stil deseni, derleme değil) → "yaptım"a güvenmek zorunda
 * kalırdık. (Antigravity'nin doğrudan-master-push olayı tam bu boşluğu gösterdi.) Bu bekçi recipe'yi
 * MAKİNE doğrular:
 *  - **B3/AX-10:** `useFrame` callback'i İÇİNDE `new Vector3/Box3/Matrix4/*Geometry` allocate YASAK
 *    (her frame GC spike) → modül-seviye temp pool (§6.5).
 *  - **C3 / §1 sihirli-metalness:** model/part dosyalarında inline `metalness:/roughness: <sayı>` YASAK
 *    → materyal `useResolveMaterials()` paylaşılan cache'inden (per-ürün sihirli-sayı = tutarsız + bakımsız).
 *
 * Kapsam: `3d/` altı model/part/factory — `materials/` (materyal SSOT) + `core/` (pool/altyapı) HARİÇ
 * (orası tanımlamanın MEŞRU yeri). Ratchet: kalan ihlal KNOWN_*'ta; düzelince stale-guard SİLDİRİR → 0.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/components/products/3d/**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** materials/ (materyal SSOT) + core/ (pool/altyapı) = inline'ın MEŞRU yeri → hariç. */
function inScope(rel: string): boolean {
  return !/\/(materials|core)\//.test(rel) && !/__tests__\/|\.test\./.test(rel)
}

function stripComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/** `useFrame( … )` çağrılarının gövdesini paren-eşleyerek çıkar (callback içi allocate'i izole etmek için). */
function extractUseFrameBodies(src: string): string[] {
  const out: string[] = []
  let idx = 0
  while ((idx = src.indexOf('useFrame(', idx)) !== -1) {
    let depth = 0
    let i = idx + 'useFrame'.length
    const start = i
    for (; i < src.length; i++) {
      const c = src[i]
      if (c === '(') depth++
      else if (c === ')') {
        depth--
        if (depth === 0) break
      }
    }
    out.push(src.slice(start, i))
    idx = i + 1
  }
  return out
}

const NEW_ALLOC = /new\s+(?:THREE\.)?(Vector2|Vector3|Box3|Matrix4|Quaternion|Euler|Color|\w*Geometry)\b/
const MAGIC_PBR = /\b(?:metalness|roughness)\s*:\s*[0-9]/

/**
 * Ratchet — **KAPALI** (2026-06-17): her iki recipe borcu da temizlendi.
 *  - FlexibleDuctModel: useFrame'de per-frame `new TubeGeometry` → tek-seferlik geometri +
 *    yerinde (in-place) vertex-buffer güncelleme (computeBoundingBox/Sphere ile culling-safe).
 *  - DuctFanModel: inline sihirli metalness/roughness → merkezi `ductFanBladeRose` (useFanMaterials SSOT).
 * İki liste de BOŞ = kapı tam kilitli; yeni ihlal anında fail eder. Yeniden DOLDURMA — gerçek
 * regresyonu allowlist'lemek yerine düzelt.
 */
const KNOWN_USEFRAME_ALLOC = new Set<string>([])
const KNOWN_MAGIC_PBR = new Set<string>([])

const FILES: ReadonlyArray<readonly [string, string]> = Object.entries(SOURCES)
  .map(([k, v]) => [k.replace(/^\//, ''), stripComments(v)] as const)
  .filter(([rel]) => inScope(rel))

describe('INV-3D-7 · model-katmanı recipe', () => {
  it('useFrame callback içinde allocate YASAK (B3/AX-10) → modül-seviye temp pool', () => {
    const offenders: string[] = []
    for (const [rel, src] of FILES) {
      if (KNOWN_USEFRAME_ALLOC.has(rel)) continue
      for (const body of extractUseFrameBodies(src)) {
        const m = NEW_ALLOC.exec(body)
        if (m) {
          offenders.push(`${rel}: useFrame içinde \`new ${m[1]}\` — modül-seviye temp pool kullan (§6.5)`)
          break
        }
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([])
  })

  it('model/part dosyalarında inline sihirli metalness/roughness YASAK (C3/§1) → useResolveMaterials', () => {
    const offenders: string[] = []
    for (const [rel, src] of FILES) {
      if (KNOWN_MAGIC_PBR.has(rel)) continue
      if (MAGIC_PBR.test(src)) {
        offenders.push(`${rel}: inline metalness/roughness sayısı — paylaşılan materyal (useResolveMaterials) kullan`)
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([])
  })

  it('stale-guard: allowlist\'teki temizlenmiş dosyaları SİLDİR', () => {
    const stale: string[] = []
    const map = new Map(FILES)
    for (const f of KNOWN_USEFRAME_ALLOC) {
      const src = map.get(f)
      if (src === undefined) {
        stale.push(`${f}: allowlist'te ama dosya YOK — kaldır`)
        continue
      }
      if (!extractUseFrameBodies(src).some((b) => NEW_ALLOC.test(b))) {
        stale.push(`${f}: artık useFrame-alloc yok → KNOWN_USEFRAME_ALLOC'tan SİL`)
      }
    }
    for (const f of KNOWN_MAGIC_PBR) {
      const src = map.get(f)
      if (src === undefined) {
        stale.push(`${f}: allowlist'te ama dosya YOK — kaldır`)
        continue
      }
      if (!MAGIC_PBR.test(src)) {
        stale.push(`${f}: artık magic-PBR yok → KNOWN_MAGIC_PBR'tan SİL`)
      }
    }
    expect(stale, `\n${stale.join('\n')}`).toEqual([])
  })
})
