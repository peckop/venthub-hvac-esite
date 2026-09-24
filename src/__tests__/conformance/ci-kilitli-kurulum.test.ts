/**
 * INV-CI-KILITLI-1 (2026-09-23): CI iş akışları kök dizinde kilitsiz `npm install <paket>` koşamaz.
 *
 * Doğuran olay: db-advisor'da `npm install --no-save pg@8` kök package.json'daki TÜM bağımlılıkları
 * kilitsiz çözdü; supabase-js 2.117.1 yayınından iki dakika sonra bağımlılığı npm'de yoktu (ETARGET) →
 * catalog-integrity ve rls-role-coverage veriyle ilgisiz kırmızı. Yardımcı paketler artık
 * `.github/ci-bagimliliklari/<dizin>/` altında kilitli durur ve `kur.sh` ile kökten bağımsız kurulur.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const WF = path.join(KOK, '.github', 'workflows')
const BAG = path.join(KOK, '.github', 'ci-bagimliliklari')

/** `run:` satırlarından npm install/i çağrılarını çıkarır (yorum satırları hariç). */
function npmKurulumlari(metin: string): string[] {
  return metin
    .split(/\r?\n/)
    .filter((s) => !s.trim().startsWith('#'))
    .filter((s) => /\bnpm\s+(install|i|add)\b/.test(s))
}

describe('INV-CI-KILITLI-1', () => {
  const dosyalar = fs.readdirSync(WF).filter((f) => /\.ya?ml$/.test(f))

  it('kanarya: iş akışları okundu', () => {
    expect(dosyalar.length).toBeGreaterThan(10)
  })

  it('hiçbir iş akışı kökte `npm install <paket>` koşmaz (yalnız --prefix ile izole kurulum)', () => {
    const ihlal: string[] = []
    for (const f of dosyalar) {
      for (const s of npmKurulumlari(fs.readFileSync(path.join(WF, f), 'utf8'))) {
        if (!/--prefix\b/.test(s)) ihlal.push(`${f}: ${s.trim()}`)
      }
    }
    expect(ihlal).toEqual([])
  })

  it('sabotaj: eski kalıp yakalanır', () => {
    expect(npmKurulumlari('        run: npm install --no-save --no-audit pg@8').length).toBe(1)
    expect(npmKurulumlari('      # npm install pg@8 eskiden buydu').length).toBe(0)
  })

  it('her yardımcı dizinde package.json + package-lock.json var ve sürümler tam sabit', () => {
    const dizinler = fs.readdirSync(BAG, { withFileTypes: true }).filter((d) => d.isDirectory())
    expect(dizinler.length).toBeGreaterThanOrEqual(2)
    for (const d of dizinler) {
      const pj = JSON.parse(fs.readFileSync(path.join(BAG, d.name, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>
      }
      expect(fs.existsSync(path.join(BAG, d.name, 'package-lock.json')), `${d.name} kilitsiz`).toBe(true)
      for (const [ad, surum] of Object.entries(pj.dependencies)) {
        expect(surum, `${d.name}/${ad} aralık değil TAM sürüm olmalı`).toMatch(/^\d+\.\d+\.\d+$/)
      }
    }
  })

  it('kur.sh kilitsiz kurulumu reddeder ve npm ci kullanır', () => {
    const kur = fs.readFileSync(path.join(BAG, 'kur.sh'), 'utf8')
    const kod = kur
      .split(/\r?\n/)
      .filter((s) => !s.trim().startsWith('#'))
      .join('\n')
    expect(kod).toMatch(/package-lock\.json yok/)
    expect(kod).toMatch(/npm ci --prefix/)
    expect(kod).not.toMatch(/npm install/)
  })
})
