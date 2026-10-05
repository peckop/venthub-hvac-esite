/**
 * INV-KOPUK-1 — kopuk (detached) süreçler ekranda pencere açmaz (REC-415, Recep 09-29).
 *
 * Ölçüm: `detached: true` çocuk konsolsuzdur; içinden çalışan git/powershell yeni konsol alır ve
 * Windows Terminal'de `git.exe` başlıklı pencere açılır. Aynı çocuk betik `detached` başlatılınca
 * 3/3 koşumda pencere çıktı, `scripts/board/kopuk-baslat.cjs` ile 3/3 koşumda çıkmadı.
 * Kapı üç şeyi kilitler: sarmalayıcı `windowsHide` ekler, gerçek kopuk çocuk ön yüklemeyi alır,
 * kodda `detached: true` yalnız başlatıcıda geçer.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const GIZLI = path.join(KOK, 'scripts', 'board', 'gizli-konsol.cjs')
const BASLATICI = path.join(KOK, 'scripts', 'board', 'kopuk-baslat.cjs')

interface Gizli {
  secenekleriTamamla: (args: unknown[]) => unknown[]
}
interface Baslatici {
  kopukBaslat: (betik: string, args?: string[], opts?: Record<string, unknown>) => { pid?: number }
  GIZLI_KONSOL: string
}
const gz = gerek(GIZLI) as Gizli
const bs = gerek(BASLATICI) as Baslatici

describe('INV-KOPUK-1 · seçenek tamamlama', () => {
  it('seçenek yoksa sona ekler', () => {
    expect(gz.secenekleriTamamla(['git'])).toEqual(['git', { windowsHide: true }])
    expect(gz.secenekleriTamamla(['git', ['status']])).toEqual(['git', ['status'], { windowsHide: true }])
  })

  it('var olan seçeneği korur ve windowsHide ekler', () => {
    expect(gz.secenekleriTamamla(['git', ['status'], { cwd: 'x' }])).toEqual(['git', ['status'], { cwd: 'x', windowsHide: true }])
  })

  it('çağıran windowsHide değerini açıkça verdiyse DOKUNULMAZ', () => {
    expect(gz.secenekleriTamamla(['git', { windowsHide: false }])).toEqual(['git', { windowsHide: false }])
  })

  it('geri çağırım varsa seçenek onun ÖNÜNE girer', () => {
    const cb = () => undefined
    expect(gz.secenekleriTamamla(['git', cb])).toEqual(['git', { windowsHide: true }, cb])
    expect(gz.secenekleriTamamla(['git', ['a'], cb])).toEqual(['git', ['a'], { windowsHide: true }, cb])
  })
})

describe('INV-KOPUK-1 · child_process sarmalayıcısı', () => {
  it('ön yükleme altı çağrının hepsine windowsHide ekler (özgün işlevler taklit edilerek, pencere açmadan)', () => {
    const betik = `
      const cp = require('child_process'); const kayit = [];
      for (const ad of ['spawn','spawnSync','execFile','execFileSync','exec','execSync']) cp[ad] = (...a) => { kayit.push([ad, a[a.length - 1]]); return 0 };
      require(${JSON.stringify(GIZLI)});
      cp.spawn('a'); cp.spawnSync('a', ['b']); cp.execFile('a', ['b'], () => {}); cp.execFileSync('git', ['x'], { cwd: '.' }); cp.exec('a'); cp.execSync('a');
      cp.execSync('a', { windowsHide: false });
      console.log(JSON.stringify(kayit));
    `
    const r = spawnSync(process.execPath, ['-e', betik], { encoding: 'utf8' })
    expect(r.status).toBe(0)
    const kayit = JSON.parse(r.stdout) as Array<[string, Record<string, unknown> | null]>
    const bicim = kayit.map(([ad, son]) => [ad, son && (son as Record<string, unknown>).windowsHide])
    expect(bicim).toEqual([
      ['spawn', true], ['spawnSync', true], ['execFile', null], ['execFileSync', true], ['exec', true], ['execSync', true], ['execSync', false],
    ])
  })
})

describe('INV-KOPUK-1 · gerçek kopuk çocuk', () => {
  it('kopukBaslat çocuğu ön yüklemeyi alır ve ebeveyn çıktıktan sonra da işini bitirir', async () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kopuk-'))
    const isaret = path.join(dizin, 'isaret.json')
    const cocuk = path.join(dizin, 'cocuk.cjs')
    fs.writeFileSync(
      cocuk,
      `const cp = require('child_process'); const g = cp.spawnSync;\n` +
        `require('fs').writeFileSync(${JSON.stringify(isaret)}, JSON.stringify({ onYukleme: cp.__vhGizliKonsol === true, secenekler: process.env.NODE_OPTIONS }))\n`,
    )
    try {
      const c = bs.kopukBaslat(cocuk)
      expect(typeof c.pid).toBe('number')
      const bitis = Date.now() + 10000
      while (!fs.existsSync(isaret) && Date.now() < bitis) await new Promise((r) => setTimeout(r, 100))
      expect(fs.existsSync(isaret)).toBe(true)
      const sonuc = JSON.parse(fs.readFileSync(isaret, 'utf8')) as { onYukleme: boolean; secenekler: string }
      expect(sonuc.onYukleme).toBe(true)
      expect(sonuc.secenekler).toContain(bs.GIZLI_KONSOL)
    } finally {
      fs.rmSync(dizin, { recursive: true, force: true })
    }
  })
})

/** Yorum satırı olmayan satırlarda `detached: true` arar. */
function kopukKullananlar(kok: string): string[] {
  const bulunan: string[] = []
  const gez = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue
      const p = path.join(d, e.name)
      if (e.isDirectory()) gez(p)
      else if (/\.(cjs|mjs|js)$/.test(e.name)) {
        fs.readFileSync(p, 'utf8')
          .split(/\r?\n/)
          .forEach((satir, i) => {
            const t = satir.trim()
            if (t.startsWith('*') || t.startsWith('//') || t.startsWith('/*')) return
            if (/detached\s*:\s*true/.test(t)) bulunan.push(`${path.relative(KOK, p).replace(/\\/g, '/')}:${i + 1}`)
          })
      }
    }
  }
  for (const alt of ['.claude/hooks', 'scripts', '.githooks']) {
    const d = path.join(kok, alt)
    if (fs.existsSync(d)) gez(d)
  }
  return bulunan
}

describe('INV-KOPUK-1 · kodda detached: true yalnız başlatıcıda', () => {
  it('kanca ve betiklerde başka yerde `detached: true` yok (kopukBaslat kullan)', () => {
    const fazla = kopukKullananlar(KOK).filter((s) => !s.startsWith('scripts/board/kopuk-baslat.cjs:'))
    expect(fazla).toEqual([])
  })

  it('eski çağrı yerleri ve WRONGSTACK satırı (ARC-24) başlatıcıya bağlı', () => {
    for (const dosya of ['session-board.cjs', 'belge-satiri.cjs', 'bellek-yoklama.cjs', 'wrongstack-satiri.cjs']) {
      const kaynak = fs.readFileSync(path.join(KOK, '.claude', 'hooks', dosya), 'utf8')
      expect(kaynak, dosya).toContain('kopukBaslat')
    }
  })
})
