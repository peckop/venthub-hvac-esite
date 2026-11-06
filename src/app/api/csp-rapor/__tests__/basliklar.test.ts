// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CSP-RAPOR-1 (yapılandırma kolu) · güvenlik karnesi 2026-11 C1 + C4, OPS-211 · cetvel csp-standard.md §9.
 *
 * Korunan kusur sınıfları:
 *  C1  CSP'nin rapor ucu sessizce düşer (ya da `report-to` adı `Reporting-Endpoints`'teki adla ayrışır):
 *      tarayıcı raporu hiçbir yere göndermez, "sıfır ihlal" ölçümü körlükten gelir.
 *  C1  rapor ucunun rota dosyası silinir ama başlık kalır: her rapor 404 olur.
 *  C4  `poweredByHeader: false` düşer, `X-Powered-By: Next.js` geri gelir.
 *  #9  3D CDN'leri `connect-src`'den düşer (CLAUDE.md kural 9; INV-3D-5'in yanında ikinci göz).
 *
 * ⚠SINIR: burada ölçülen `next.config.mjs` METNİDİR, canlı yanıt başlığı değil. Canlıda doğrulama:
 * `curl -sI https://venthub.com.tr/tr | grep -i "x-powered-by\|reporting-endpoints\|report-only"`.
 */

const KOK = process.cwd()
const CONFIG = fs.readFileSync(path.join(KOK, 'next.config.mjs'), 'utf8')

function cspDegeri(metin: string): string | null {
  const m = metin.match(/key:\s*'Content-Security-Policy(?:-Report-Only)?'[\s\S]{0,400}?value:\s*"([^"]+)"/)
  return m?.[1] ?? null
}

function direktifler(csp: string): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const parca of csp.split(';')) {
    const [ad, ...degerler] = parca.trim().split(/\s+/)
    if (ad) out.set(ad, degerler)
  }
  return out
}

function raporUclari(metin: string): Map<string, string> | null {
  const m = metin.match(/key:\s*'Reporting-Endpoints'[\s\S]{0,200}?value:\s*'([^']+)'/)
  if (!m?.[1]) return null
  const out = new Map<string, string>()
  for (const parca of m[1].split(',')) {
    const e = parca.trim().match(/^([A-Za-z0-9_-]+)="([^"]+)"$/)
    if (e?.[1] && e[2]) out.set(e[1], e[2])
  }
  return out
}

/** `/api/x` → `src/app/api/x/route.ts` var mı. */
function rotaVarMi(yol: string): boolean {
  return fs.existsSync(path.join(KOK, 'src', 'app', ...yol.split('/').filter(Boolean), 'route.ts'))
}

describe('INV-CSP-RAPOR-1: CSP rapor ucu ve başlık hijyeni (next.config.mjs)', () => {
  it('C4: poweredByHeader: false yazılı', () => {
    expect(/^\s*poweredByHeader:\s*false\s*,/m.test(CONFIG), 'poweredByHeader: false yok — X-Powered-By geri gelir').toBe(true)
  })

  it('C1: CSP report-uri taşıyor ve gösterdiği rota dosyası VAR', () => {
    const csp = cspDegeri(CONFIG)
    expect(csp, 'CSP başlığı bulunamadı').not.toBeNull()
    const d = direktifler(csp ?? '')
    const uri = d.get('report-uri')?.[0]
    expect(uri, 'report-uri yok').toBeTruthy()
    expect(uri?.startsWith('/api/'), 'report-uri kendi kökenimizde bir /api yolu olmalı').toBe(true)
    expect(rotaVarMi(uri ?? ''), `${uri} için route.ts yok — her rapor 404 olur`).toBe(true)
  })

  it('C1: report-to adı Reporting-Endpoints başlığında tanımlı ve aynı rotaya gidiyor', () => {
    const d = direktifler(cspDegeri(CONFIG) ?? '')
    const ad = d.get('report-to')?.[0]
    expect(ad, 'report-to yok').toBeTruthy()
    const uclar = raporUclari(CONFIG)
    expect(uclar, 'Reporting-Endpoints başlığı yok — report-to adı hiçbir adrese çözülmez').not.toBeNull()
    const adres = uclar?.get(ad ?? '')
    expect(adres, `report-to "${ad}" Reporting-Endpoints'te tanımlı değil`).toBeTruthy()
    expect(adres).toBe(d.get('report-uri')?.[0])
  })

  it('#9: 3D CDNleri connect-src içinde kalıyor', () => {
    const connect = direktifler(cspDegeri(CONFIG) ?? '').get('connect-src') ?? []
    expect(connect).toContain('https://raw.githubusercontent.com')
    expect(connect).toContain('https://raw.githack.com')
  })

  it('AYIRT EDER: sabotaj fikstürlerinde kollar kırmızı verir', () => {
    // Rapor ucu silinmiş politika
    const sabotajCsp = CONFIG.replace(/; report-uri [^;"]+/, '').replace(/; report-to [^;"]+/, '')
    const d = direktifler(cspDegeri(sabotajCsp) ?? '')
    expect(d.has('report-uri')).toBe(false)
    expect(d.has('report-to')).toBe(false)
    // poweredByHeader satırı silinmiş yapılandırma
    expect(/^\s*poweredByHeader:\s*false\s*,/m.test(CONFIG.replace(/poweredByHeader:\s*false,/, ''))).toBe(false)
    // Ad ayrışması: report-to başka ad gösteriyor
    expect(raporUclari(`key: 'Reporting-Endpoints', value: 'baska="/api/csp-rapor"'`)?.get('csp-ucu')).toBeUndefined()
    // Var olmayan rota
    expect(rotaVarMi('/api/olmayan-uc')).toBe(false)
  })
})
