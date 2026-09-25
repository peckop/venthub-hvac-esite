// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BELLEK-YOKLAMA-1 · "3 GB üstü tek süreç / boş bellek az" satırı (Ops emri 2026-09-25).
 *
 * Ölçülen vaka: 31,8 GB'ın 0,7 GB'ı boştu, iki tsserver 7,3 GB tutuyordu ve hiçbir yüzey
 * göstermiyordu. Satır EŞİKLİDİR: sağlıklı hâlde susar. Ayırt edici çiftler: eşiğin altı SESSİZ,
 * üstü KONUŞUR; taze önbellek ölçümü söyler, bayat önbellek "ölçülemedi" der.
 */

interface Surec {
  pid: number
  ad: string
  mb: number
  ipucu: string
}
interface Onbellek {
  ts: number
  bosMb: number
  surecler: Surec[]
}
interface Yoklama {
  satir: (ob: Onbellek | null, simdi: number) => string | null
  ipucu: (komut: string) => string
}

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks', 'bellek-yoklama.cjs')
const by = createRequire(import.meta.url)(KANCA) as Yoklama
const SIMDI = Date.parse('2026-09-25T11:30:00Z')
const surec = (mb: number, ipucu = ''): Surec => ({ pid: 1234, ad: 'node', mb, ipucu })

describe('INV-BELLEK-YOKLAMA-1: bellek satırı eşikli ve ayırt edici', () => {
  it('sağlıklı hâlde SESSİZ; 3 GB üstü tek süreçte KONUŞUR ve süreci adıyla söyler', () => {
    const saglikli = { ts: SIMDI - 60_000, bosMb: 8000, surecler: [surec(2900)] }
    expect(by.satir(saglikli, SIMDI)).toBeNull()

    const sisik = { ts: SIMDI - 60_000, bosMb: 8000, surecler: [surec(3551, 'agent-a896 tsserver.js')] }
    const s = by.satir(sisik, SIMDI)
    expect(s).toMatch(/^⚠BELLEK: /)
    expect(s).toMatch(/3,0 GB ustu: node 1234 3,5 GB \(agent-a896 tsserver\.js\)/)
  })

  it('boş bellek 2 GB altındaysa büyük süreç olmasa da KONUŞUR; 2 GB üstünde susar', () => {
    expect(by.satir({ ts: SIMDI, bosMb: 700, surecler: [surec(900)] }, SIMDI)).toMatch(/bos 0,7 GB/)
    expect(by.satir({ ts: SIMDI, bosMb: 2100, surecler: [surec(900)] }, SIMDI)).toBeNull()
  })

  it('bayat önbellek (60 dk üstü) sessiz kalmaz: OLCULEMEDI der; önbellek yoksa satır yok', () => {
    expect(by.satir({ ts: SIMDI - 61 * 60_000, bosMb: 8000, surecler: [] }, SIMDI)).toMatch(/OLCULEMEDI/)
    expect(by.satir(null, SIMDI)).toBeNull()
  })

  it('ipucu kimlik taşımaz: yalnız ağaç adı ve betik adı', () => {
    const k = String.raw`"C:\Program Files\nodejs\node.exe" c:\tmp\vh-altyapi-yan\node_modules\typescript\lib\tsserver.js --x`
    expect(by.ipucu(k)).toBe('vh-altyapi-yan tsserver.js')
    const w = String.raw`node D:\ev\birisi\repo\.claude\worktrees\agent-a89\node_modules\typescript\lib\tsserver.js`
    expect(by.ipucu(w)).toBe('agent-a89 tsserver.js')
    expect(by.ipucu(w)).not.toMatch(/birisi/)
  })

  it('arka plan ölçümü pencere açmaz (windowsHide) ve kaynakta kullanıcı yolu yok', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    expect(kaynak.match(/windowsHide:\s*true/g)?.length ?? 0, 'spawn ve execFileSync ikisi de gizli olmalı').toBeGreaterThanOrEqual(2)
    expect(/[A-Za-z]:[\\/]Users[\\/]/.test(kaynak)).toBe(false)
  })

  it.skipIf(process.platform !== 'win32')(
    'arka plan ölçümü yalnız gerçek oturum kimliğiyle başlar (test girdisi makineyi yormaz)',
    () => {
      const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'bellek-yoklama-'))
      const onbellek = path.join(dizin, 'bellek.json')
      const kos = (sid: string) =>
        spawnSync(process.execPath, [path.resolve(process.cwd(), '.claude', 'hooks', 'defter-tazelik-satiri.cjs')], {
          input: JSON.stringify({ session_id: sid }),
          encoding: 'utf8',
          env: { ...process.env, VENTHUB_BELLEK_ONBELLEK: onbellek },
        })
      kos('test1234')
      expect(fs.existsSync(onbellek + '.kilit'), 'test kimliği arka plan ölçümü başlattı').toBe(false)
      kos('dddddddd-7777-4777-8777-777777777777')
      expect(
        fs.existsSync(onbellek + '.kilit') || fs.existsSync(onbellek),
        'gerçek oturum kimliğinde ölçüm başlamadı — satır hiç tazelenmez',
      ).toBe(true)
    },
    30_000,
  )

  it('defter-tazelik-satiri kancası bloğu çağırıyor (bağlanmamış kanca yoktur)', () => {
    const k = fs.readFileSync(path.resolve(process.cwd(), '.claude', 'hooks', 'defter-tazelik-satiri.cjs'), 'utf8')
    expect(k).toMatch(/require\(path\.join\(__dirname, 'bellek-yoklama\.cjs'\)\)/)
    expect(k).toMatch(/gerekirseTazele\(/)
  })
})
