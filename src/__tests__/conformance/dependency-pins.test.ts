import { describe, expect, it } from 'vitest'

/**
 * INV-DEP-1 · Bağımlılık sürüm-pini conformance (kalıcı bekçi).
 *
 * İki ayrı yüzeyde aynı hata sınıfı var: **sürümü zamana bırakmak.**
 *
 *   1. `package.json` → `"latest"` / `"*"` / boş aralık.
 *      pnpm-lock.yaml bunu bir süre maskeler, ama lockfile yenilendiği ilk anda
 *      (yeni bağımlılık, `pnpm update`, temiz kurulum, Vercel'in kendi çözümlemesi)
 *      sürüm sessizce atlar. Ölçüldü: `@supabase/ssr` ve `@supabase/supabase-js`
 *      `"latest"` yazıyordu (2026-08-15) — yani hangi sürümle build aldığımızı
 *      söyleyen tek yer lockfile'dı ve o da her yenilemede farklı cevap verebilirdi.
 *
 *   2. `supabase/functions/**` → CDN importunda pinsiz `@2` veya sürümsüz import.
 *      Edge'de lockfile YOK. `esm.sh/@supabase/supabase-js@2` deploy ANINDA
 *      çözülür, yani aynı kaynak iki farklı zamanda iki farklı runtime üretir.
 *      Ölçüldü (T028): 16 fn @2.45.4, 5 fn @2.39.3, 5 fn PİNSİZ @2 → tek sürüme indirildi.
 *
 * Neden test: ikisi de **tek seferlik düzeltmeyle kapanmaz.** Bir sonraki
 * `pnpm add`, bir sonraki yeni edge fonksiyonu aynı deseni geri getirir ve
 * tsc/lint/build hiçbiri şikâyet etmez — çünkü teknik olarak geçerli girdiler.
 * Kural yazılı olmadan düzeltme kalıcı değildir.
 *
 * Kapsam dışı (bilinçli, sessiz cap değil): `catalog:`/`workspace:`/`link:`/`file:`
 * protokolleri (sürüm aralığı değil), `devDependencies` içindeki `latest` de
 * kapsama DAHİL — dev araç sürümünün kayması da build'i kırar (ör. tsc, vite).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const PKG_FILES: Record<string, string> = import.meta.glob('/package.json', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const EDGE_SOURCES: Record<string, string> = import.meta.glob(
  '/supabase/functions/**/*.ts',
  { query: '?raw', import: 'default', eager: true },
)

/** Sürüm aralığı sayılmayan protokoller — pin kuralı bunlara uygulanmaz. */
const NON_RANGE_PROTOCOLS = /^(workspace|catalog|link|file|npm|github|git\+|https?):/

/** Zamana bırakılmış aralıklar: sürümü çözümleme ANINDA belirlenir. */
const FLOATING = new Set(['latest', '*', '', 'x', 'X', 'next', 'canary'])

function isFloating(range: string): boolean {
  const v = range.trim()
  if (NON_RANGE_PROTOCOLS.test(v)) return false
  if (FLOATING.has(v)) return true
  // ">=2.0.0" gibi üst sınırsız aralıklar da zamana bağlıdır.
  if (/^>=?\s*\d/.test(v)) return true
  return false
}

describe('INV-DEP-1 · bağımlılık sürümleri zamana bırakılmaz', () => {
  const pkgPath = Object.keys(PKG_FILES)[0]
  const pkgRaw = pkgPath ? PKG_FILES[pkgPath] : undefined

  it('package.json okunabiliyor (glob boşalırsa burada patlar)', () => {
    expect(pkgRaw, 'package.json glob ile okunamadı — testin kendisi kör').toBeTruthy()
  })

  it('hiçbir bağımlılık "latest"/"*"/üst-sınırsız aralık kullanmaz', () => {
    const pkg = JSON.parse(pkgRaw as string) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      optionalDependencies?: Record<string, string>
    }

    const offenders: string[] = []
    for (const field of ['dependencies', 'devDependencies', 'optionalDependencies'] as const) {
      const block = pkg[field]
      if (!block) continue
      for (const [name, range] of Object.entries(block)) {
        if (isFloating(range)) offenders.push(`${field}.${name} = "${range}"`)
      }
    }

    expect(
      offenders,
      `Sürümü zamana bırakılmış bağımlılık(lar):\n  ${offenders.join('\n  ')}\n\n` +
        'Somut bir aralık yaz (ör. "^2.112.3"). "latest" lockfile yenilendiği ilk anda\n' +
        'sessizce sürüm atlar; hangi sürümle build aldığımızı söyleyen tek yer kalmaz.',
    ).toEqual([])
  })

  it('edge CDN importları tam sürüm taşır (edge\'de lockfile YOK)', () => {
    const offenders: string[] = []
    // esm.sh / deno.land / jsr / skypack — paket@SÜRÜM biçimi
    const cdnImport = /from\s+['"`](https:\/\/(?:esm\.sh|cdn\.skypack\.dev|deno\.land\/x)\/[^'"`]+)['"`]/g

    for (const [file, src] of Object.entries(EDGE_SOURCES)) {
      for (const m of src.matchAll(cdnImport)) {
        const url = m[1]
        // Sürüm damgası: "@" + rakamla başlayan ve en az bir nokta içeren parça (@2.45.4).
        // "@2" (tek rakam, noktasız) PİNSİZ sayılır — deploy anında çözülür.
        const hasFullVersion = /@\d+\.\d+\.\d+/.test(url) || /@v\d+\.\d+\.\d+/.test(url)
        if (!hasFullVersion) offenders.push(`${file}: ${url}`)
      }
    }

    expect(
      offenders,
      `Pinsiz edge CDN importu:\n  ${offenders.join('\n  ')}\n\n` +
        'Edge\'de lockfile yok — "@2" deploy ANINDA çözülür, aynı kaynak farklı\n' +
        'zamanlarda farklı runtime üretir. Tam sürüm yaz (ör. @2.45.4).',
    ).toEqual([])
  })

  it('kendi kendini doğrular: sahte girdilerde ihlali GERÇEKTEN görür', () => {
    // Dedektör körleşirse (regex bozulur, glob boşalır) yukarıdaki iki test
    // sessizce yeşile döner. Bu test sentetik örneklerle bunu engeller.
    expect(isFloating('latest')).toBe(true)
    expect(isFloating('*')).toBe(true)
    expect(isFloating('>=2.0.0')).toBe(true)
    expect(isFloating('^2.112.3')).toBe(false)
    expect(isFloating('2.45.4')).toBe(false)
    expect(isFloating('workspace:*')).toBe(false)

    const pinsiz = `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`
    const pinli = `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'`
    const re = /@\d+\.\d+\.\d+/
    expect(re.test(pinsiz)).toBe(false)
    expect(re.test(pinli)).toBe(true)

    expect(Object.keys(EDGE_SOURCES).length).toBeGreaterThan(20)
  })
})
