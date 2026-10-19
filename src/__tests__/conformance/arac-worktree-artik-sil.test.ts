/**
 * INV-ARAC-WT-ARTIK-1 — tools/worktree-artik-sil.cjs: bağlantılı (junction) kopya silinirken HEDEFE DOKUNULMAZ (karar 88).
 *
 * Regresyon: 19 Ekim 2026, 129 kopyada `git worktree remove --force` node_modules junction'larında takıldı; 09-23'te
 * aynı mekanizma ana deponun node_modules'ünü silmişti. Fikstür: geçici klasörde "kopya" + dışarıdaki "ana" klasöre
 * giden bağlantı; bağlantı kaldırılınca ana klasörün dosyası DURMALI.
 */
import { spawnSync } from 'node:child_process'
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
  gitDosyasiKontrol: (yol: string) => { ok: boolean; sebep: string; artik?: boolean }
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

  it.skipIf(process.platform !== 'win32')('izinli yol kalıbı: C:/tmp yalnız Windows yolu', () => {
    const ana = path.join(os.tmpdir(), 'anadepo')
    const ev = path.join(os.tmpdir(), 'ev')
    expect(a.izinliYolMu('C:/tmp/vh-x', ana, ev)).toBe(true)
    expect(a.izinliYolMu('C:/tmp/../Windows/x', ana, ev)).toBe(false) // .. ile kaçış
    expect(a.izinliYolMu('C:/Windows/x', ana, ev)).toBe(false)
  })

  it('izinli yol kalıbı: worktrees, vh-wt, venthub-wt-*, venthub-harita-*; ana depo, kardeş depolar ve rastgele yer reddedilir', () => {
    const ana = path.join(os.tmpdir(), 'anadepo')
    const ev = path.join(os.tmpdir(), 'ev')
    expect(a.izinliYolMu(path.join(ana, '.claude', 'worktrees', 'x'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'vh-wt', 'x'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'venthub-wt-quote'), ana, ev)).toBe(true)
    expect(a.izinliYolMu(path.join(ev, 'venthub-harita-h3'), ana, ev)).toBe(true)
    // açık liste dışı: ana depo, onun kardeşleri, ingestor ve diğer venthub-* klasörleri
    for (const ad of ['venthub-hvac', 'venthub-hvac-esite', 'venthub-hvac-platform', 'venthub-pdf-ingestor', 'venthub-pdf-git-disi', 'venthub-new', 'venthub-media', 'venthub-wt', 'venthub-harita']) {
      expect(a.izinliYolMu(path.join(ev, ad), ana, ev), ad).toBe(false)
    }
    expect(a.izinliYolMu(path.join(ev, 'VENTHUB-HVAC'), ana, ev)).toBe(false) // harf farkı
    expect(a.izinliYolMu(path.join(ev, 'venthub-wt-x', '..', 'venthub-pdf-ingestor'), ana, ev)).toBe(false) // .. ile kaçış
    expect(a.izinliYolMu(ana, ana, ev)).toBe(false)
    expect(a.izinliYolMu(path.join(ana, 'node_modules'), ana, ev)).toBe(false)
    expect(a.izinliYolMu(path.join(ana, 'src'), ana, ev)).toBe(false)
    expect(a.izinliYolMu(path.join(ev, 'Documents'), ana, ev)).toBe(false)
  })

  it('.git denetimi: dizin (gerçek depo), satırsız ve hedefi hâlâ var olan reddedilir; .git hiç yoksa artık klasör kabul', () => {
    const k = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-gitk-'))
    try {
      const yok = path.join(k, 'yok')
      fs.mkdirSync(yok)
      const yr = a.gitDosyasiKontrol(yok)
      expect(yr.ok).toBe(true) // .git yok = git worktree remove artığı (19 Ekim ölçümü: 22'nin 20'si)
      expect(yr.artik).toBe(true)

      const dizin = path.join(k, 'depo')
      fs.mkdirSync(path.join(dizin, '.git'), { recursive: true }) // gerçek depo (ingestor gibi)
      const dr = a.gitDosyasiKontrol(dizin)
      expect(dr.ok).toBe(false)
      expect(dr.sebep).toMatch(/DİZİN/)

      const satirsiz = path.join(k, 'satirsiz')
      fs.mkdirSync(satirsiz)
      fs.writeFileSync(path.join(satirsiz, '.git'), 'bozuk')
      expect(a.gitDosyasiKontrol(satirsiz).ok).toBe(false)

      const hedefVar = path.join(k, 'hedefvar')
      fs.mkdirSync(hedefVar)
      fs.writeFileSync(path.join(hedefVar, '.git'), `gitdir: ${k}`) // hedef (k) var
      expect(a.gitDosyasiKontrol(hedefVar).ok).toBe(false)

      const tamam = path.join(k, 'tamam')
      fs.mkdirSync(tamam)
      fs.writeFileSync(path.join(tamam, '.git'), `gitdir: ${path.join(k, 'silinmis-kayit')}`) // hedef yok
      expect(a.gitDosyasiKontrol(tamam).ok).toBe(true)
    } finally {
      fs.rmSync(k, { recursive: true, force: true })
    }
  })
})

describe('INV-ARAC-WT-ARTIK-2 · node_modules kendisi bağlantıysa hedefe girilmez; --gercek tek başına durur', () => {
  it('node_modules → ana depo bağlantısı: tek bağlantı döner, kaldırınca ana klasör ve altındaki dosya DURUR', () => {
    const g = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-nmb-'))
    try {
      const ana = path.join(g, 'ana-node-modules')
      fs.mkdirSync(path.join(ana, '.bin'), { recursive: true })
      fs.mkdirSync(path.join(ana, '.pnpm', 'paket'), { recursive: true })
      fs.writeFileSync(path.join(ana, '.bin', 'vitest'), 'ana .bin')
      fs.writeFileSync(path.join(ana, '.pnpm', 'paket', 'i.js'), 'x')
      const kopya = path.join(g, 'kopya')
      fs.mkdirSync(kopya)
      fs.symlinkSync(ana, path.join(kopya, 'node_modules'), 'junction')
      const r = a.tara(kopya)
      expect(r.baglantilar).toHaveLength(1) // hedefin içine GİRİLMEDİ
      expect(r.baglantilar[0].disarida).toBe(true)
      expect(a.baglantiKaldir(r.baglantilar[0].yol)).toBe(true)
      expect(fs.existsSync(path.join(ana, '.bin', 'vitest'))).toBe(true)
      expect(fs.existsSync(path.join(ana, '.pnpm', 'paket', 'i.js'))).toBe(true)
      expect(a.tara(kopya).baglantilar).toHaveLength(0)
    } finally {
      fs.rmSync(g, { recursive: true, force: true })
    }
  })

  it('derin iç içe bağlantılar (.pnpm altında) bulunur', () => {
    const g = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-derin-'))
    try {
      const kopya = path.join(g, 'kopya')
      const derin = path.join(kopya, 'node_modules', '.pnpm', 'a@1', 'node_modules')
      fs.mkdirSync(derin, { recursive: true })
      const ic = path.join(kopya, 'node_modules', '.pnpm', 'b@1')
      fs.mkdirSync(ic)
      fs.symlinkSync(ic, path.join(derin, 'b'), 'junction')
      const r = a.tara(kopya)
      expect(r.baglantilar).toHaveLength(1)
      expect(r.baglantilar[0].yol).toContain(path.join('a@1', 'node_modules', 'b'))
      expect(r.baglantilar[0].disarida).toBe(false)
    } finally {
      fs.rmSync(g, { recursive: true, force: true })
    }
  })

  it.each([['worktree-artik-sil.cjs'], ['worktree-temizle.cjs']])('%s: --gercek tek başına çıkış 2 verir, kuru koşuma DÜŞMEZ', (betik) => {
    const t = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-gercek-'))
    try {
      const liste = path.join(t, 'l.json')
      fs.writeFileSync(liste, '[]')
      const r = spawnSync(process.execPath, [path.join(KOK, 'tools', betik), '--liste', liste, '--gercek'], { encoding: 'utf8', timeout: 30000 })
      expect(r.status).toBe(2)
      expect(`${r.stdout}${r.stderr}`).toMatch(/geri-alinamaz-onayladim/)
    } finally {
      fs.rmSync(t, { recursive: true, force: true })
    }
  })
})
