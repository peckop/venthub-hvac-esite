/**
 * INV-ARAC-WT-ARTIK-1 — tools/worktree-artik-sil.cjs: bağlantılı (junction) kopya silinirken HEDEFE DOKUNULMAZ (karar 88).
 *
 * Regresyon: 19 Ekim 2026, 129 kopyada `git worktree remove --force` node_modules junction'larında takıldı; 09-23'te
 * aynı mekanizma ana deponun node_modules'ünü silmişti. Fikstür: geçici klasörde "kopya" + dışarıdaki "ana" klasöre
 * giden bağlantı; bağlantı kaldırılınca ana klasörün dosyası DURMALI.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
interface Arac {
  tara: (kok: string) => { girdi: number; baglantilar: { yol: string; hedef: string | null; disarida: boolean }[] }
  baglantiKaldir: (p: string) => boolean
  izinliYolMu: (yol: string, ana: string, ev: string) => boolean
}
const a = gerek(path.join(KOK, 'tools', 'worktree-artik-sil.cjs')) as Arac

describe('INV-ARAC-WT-ARTIK-1 · bağlantı kaldırma hedefe dokunmaz', () => {
  let gecici = ''
  let kopya = ''
  let disKlasor = ''
  beforeAll(() => {
    gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-artik-'))
    kopya = path.join(gecici, 'kopya')
    disKlasor = path.join(gecici, 'ana-node-modules')
    fs.mkdirSync(path.join(kopya, 'node_modules'), { recursive: true })
    fs.mkdirSync(path.join(kopya, 'src'), { recursive: true })
    fs.mkdirSync(disKlasor)
    fs.writeFileSync(path.join(disKlasor, 'dokunma.txt'), 'ana depo dosyası')
    fs.writeFileSync(path.join(kopya, 'src', 'a.ts'), 'x')
    fs.mkdirSync(path.join(kopya, 'node_modules', 'ic-paket'))
    // dışa giden bağlantı + kopya içine giden bağlantı
    fs.symlinkSync(disKlasor, path.join(kopya, 'node_modules', 'dis'), 'junction')
    fs.symlinkSync(path.join(kopya, 'node_modules', 'ic-paket'), path.join(kopya, 'node_modules', 'ic'), 'junction')
  })
  afterAll(() => {
    if (gecici) fs.rmSync(gecici, { recursive: true, force: true })
  })

  it('tarama bağlantılara GİRMEZ, dışa ve içe olanı ayırt eder', () => {
    const r = a.tara(kopya)
    expect(r.baglantilar).toHaveLength(2)
    expect(r.baglantilar.filter((b) => b.disarida)).toHaveLength(1)
    expect(r.baglantilar.find((b) => b.disarida)?.yol).toContain('dis')
  })

  it('bağlantıyı kaldırınca hedef klasör ve dosyası DURUR; sonra tarama sıfır bağlantı bulur', () => {
    for (const b of a.tara(kopya).baglantilar) expect(a.baglantiKaldir(b.yol)).toBe(true)
    expect(fs.existsSync(path.join(disKlasor, 'dokunma.txt'))).toBe(true)
    expect(fs.existsSync(path.join(kopya, 'node_modules', 'ic-paket'))).toBe(true)
    expect(a.tara(kopya).baglantilar).toHaveLength(0)
  })

  it('izinli yol kalıbı: C:/tmp, worktrees, vh-wt, venthub-wt-*; ana depo ve rastgele yer reddedilir', () => {
    const ana = path.join(os.tmpdir(), 'anadepo')
    const ev = path.join(os.tmpdir(), 'ev')
    expect(a.izinliYolMu('C:/tmp/vh-x', ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ana, '.claude', 'worktrees', 'x'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'vh-wt', 'x'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'venthub-wt-quote'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'venthub-harita-h3'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'venthub-hvac'), ana, ev)).toBe(false) // ana depo adı
    expect(a.izinliYolMu(ana, ana, ev)).toBe(false)
    expect(a.izinliYolMu(path.join(ana, 'src'), ana, ev)).toBe(false)
    expect(a.izinliYolMu(path.join(ev, 'Documents'), ana, ev)).toBe(false)
    expect(a.izinliYolMu('C:/Windows/x', ana, ev)).toBe(false)
  })
})
