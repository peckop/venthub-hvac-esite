import { describe, expect, it } from 'vitest'

/**
 * INV-3D-5 · CSP / dış-origin (kalıcı bekçi) — standart §2 D1 / §3 / CLAUDE.md #9.
 *
 * 3D asset'leri (GLB/GLTF/HDR) bir dış CDN'den yükleniyorsa, o origin `next.config.mjs` CSP
 * `connect-src` whitelist'inde OLMALI — yoksa tarayıcı isteği bloklar → asset yüklenmez →
 * (Suspense/ErrorBoundary dışıysa) çökme. Bu bekçi iki yönü zorlar:
 *  (a) STALE-GUARD: CLAUDE.md #9 zorunlu 3D host'ları (`raw.githubusercontent.com`, `raw.githack.com`)
 *      whitelist'ten DÜŞMESİN — "kaldırma" kuralını kilitler.
 *  (b) DRIFT-CATCH: asset registry / doğrudan loader (`<Environment files>`/`useGLTF`/`useTexture`)
 *      içinde görünen her dış origin connect-src'te OLSUN — yeni CDN bağımlılığı sessizce eklenemesin.
 * tsc/lint/build bunu görmez (CSP = runtime header, statik tip değil) — yalnız bu test yakalar.
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

// next.config.mjs ham içerik (Vite glob — TAM literal yol). `/next.config.*` Orion'un
// `next.config.md` doc'unu da yakalayıp yanlış dosya seçtirir → tam yol şart. node:fs YOK
// (tsconfig moduleResolution:"node" + node: önekini çözemez → tsc patlar; glob deseni tip-güvenli).
const CONFIG_FILES: Record<string, string> = import.meta.glob('/next.config.mjs', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const CONFIG: string = CONFIG_FILES['/next.config.mjs'] ?? ''

/** CLAUDE.md #9 — bu 3D asset CDN'leri connect-src'te KALMALI (GLB/GLTF whitelist'i; kaldırma). */
const REQUIRED_3D_HOSTS = ['raw.githubusercontent.com', 'raw.githack.com']

/** SSOT asset kayıt dosyası — dış origin'in girebileceği iki yerden biri. */
const REGISTRY_KEY = '/src/components/products/3d/core/assetRegistry.ts'

/** Tüm connect-src direktiflerinin (dev+prod olabilir) girdilerini birleştir. */
function getConnectSrc(config: string): string[] {
  const entries = new Set<string>()
  const re = /connect-src\s+([^;]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(config)) !== null) {
    for (const e of m[1].trim().split(/\s+/)) if (e) entries.add(e)
  }
  return [...entries]
}

/** connect-src girdisinden host: 'self'/'none' → null; https://*.x.co → *.x.co; wss://a.b → a.b */
function entryHost(entry: string): string | null {
  if (entry.startsWith("'")) return null
  return entry.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '') || null
}

function cspAllowsHost(host: string, connectSrc: string[]): boolean {
  for (const entry of connectSrc) {
    const h = entryHost(entry)
    if (!h) continue
    if (h === host) return true
    if (h.startsWith('*.') && host.endsWith(h.slice(1))) return true // *.x.co ⊇ a.x.co
  }
  return false
}

function hostOf(url: string): string {
  return url.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '')
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

// Dış 3D origin'in koda girdiği somut yollar (generic `path:` değil → yanlış-pozitif yok).
const REGISTRY_HOST = /path:\s*['"`](https?:\/\/[^'"`]+)['"`]/g
const LOADER_HOST =
  /(?:<Environment\s+files=|useGLTF\(|useTexture\()\s*['"`](https?:\/\/[^'"`]+)['"`]/g

function collectHosts(re: RegExp, src: string): string[] {
  const out: string[] = []
  let m: RegExpExecArray | null
  re.lastIndex = 0
  while ((m = re.exec(src)) !== null) out.push(hostOf(m[1]))
  return out
}

describe('INV-3D-5 · CSP / dış-origin', () => {
  const connectSrc = getConnectSrc(CONFIG)

  it('next.config.mjs CSP connect-src parse edilebilir', () => {
    expect(
      connectSrc.length,
      'connect-src bulunamadı — next.config.mjs CSP formatı değişti mi?',
    ).toBeGreaterThan(0)
  })

  it("CLAUDE.md #9 zorunlu 3D asset host'ları connect-src'te (stale-guard — kaldırma)", () => {
    const missing = REQUIRED_3D_HOSTS.filter((h) => !cspAllowsHost(h, connectSrc))
    expect(
      missing,
      `\nCSP connect-src'ten DÜŞMÜŞ zorunlu 3D host(lar): ${missing.join(', ')} — CLAUDE.md #9 ihlali`,
    ).toEqual([])
  })

  it("3D kodunda görünen her dış origin connect-src whitelist'inde (drift-catch)", () => {
    const offenders: string[] = []
    // (a) asset registry path değerleri (SSOT)
    const registrySrc = SOURCES[REGISTRY_KEY] ?? ''
    for (const host of collectHosts(REGISTRY_HOST, stripComments(registrySrc))) {
      if (!cspAllowsHost(host, connectSrc)) {
        offenders.push(`assetRegistry.ts: '${host}' connect-src'te YOK`)
      }
    }
    // (b) doğrudan loader / Environment çağrıları (tüm 3D kaynak)
    for (const [key, src] of Object.entries(SOURCES)) {
      if (/__tests__\/|\.test\.|\.spec\./.test(key)) continue
      for (const host of collectHosts(LOADER_HOST, stripComments(src))) {
        if (!cspAllowsHost(host, connectSrc)) {
          offenders.push(`${key.replace(/^\//, '')}: '${host}' connect-src'te YOK`)
        }
      }
    }
    expect(offenders, `\n${offenders.join('\n')}`).toEqual([])
  })
})
