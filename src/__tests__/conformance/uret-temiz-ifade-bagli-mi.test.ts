/**
 * HRT-122 (OPS-256 2. dalga): scripts/belge/uret-temiz.cjs ve scripts/belge/ifade-bagli-mi.cjs.
 * uret-temiz yalnız satır sonu farkını geri almalı, gerçek farka ve üretilen dizinlerin dışına dokunmamalı;
 * ifade-bagli-mi bağlı ifadeyi bulmalı, bağsızı bulmamalı, hedef dosyanın kendisini saymamalı.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '..', '..', '..')
const req = createRequire(import.meta.url)
const temiz = req(path.join(KOK, 'scripts', 'belge', 'uret-temiz.cjs')) as {
  degisenYollar: (s: string) => string[]
  uretilenMi: (y: string) => boolean
  siniflandir: (y: string[], f: (y: string) => boolean) => { gercek: string[]; gurultu: string[]; disarida: string[] }
  calistir: (agac: string, sadeceAyikla: boolean) => { gercek: string[]; gurultu: string[]; disarida: string[] }
}
const bagli = req(path.join(KOK, 'scripts', 'belge', 'ifade-bagli-mi.cjs')) as {
  parcalar: (s: string) => string[]
  ara: (agac: string, ifadeler: string[], haric?: string) => Array<{ ifade: string; vurgular: Array<{ dosya: string; satir: number }> }>
}

describe('uret-temiz: saf kısımlar', () => {
  it('degisenYollar izlenmeyen dosyayı saymaz, değişeni sayar', () => {
    const cikti = ' M docs/roller/A.md\nM  .claude/agents/b.md\n?? yeni.txt\n'
    expect(temiz.degisenYollar(cikti)).toEqual(['docs/roller/A.md', '.claude/agents/b.md'])
  })

  it('siniflandir: gerçek farklı kalır, yalnız satır sonu olan gürültü, üretilen dizin dışı dokunulmaz', () => {
    const r = temiz.siniflandir(['docs/roller/A.md', 'docs/roller/B.md', 'scripts/belge/x.cjs'], (y) => y.endsWith('A.md'))
    expect(r).toEqual({ gercek: ['docs/roller/A.md'], gurultu: ['docs/roller/B.md'], disarida: ['scripts/belge/x.cjs'] })
    expect(temiz.uretilenMi('docs/roller-baska/x.md')).toBe(false)
  })
})

describe('uret-temiz: gerçek git deposunda', () => {
  let dizin = ''
  const git = (...a: string[]) => execFileSync('git', ['-C', dizin, '-c', 'core.autocrlf=false', '-c', 'user.email=t@t', '-c', 'user.name=t', ...a], { encoding: 'utf8' })

  beforeAll(() => {
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'uret-temiz-'))
    git('init', '-q')
    fs.mkdirSync(path.join(dizin, 'docs', 'roller'), { recursive: true })
    fs.mkdirSync(path.join(dizin, 'scripts'), { recursive: true })
    fs.writeFileSync(path.join(dizin, 'docs', 'roller', 'gurultu.md'), 'a\r\nb\r\n')
    fs.writeFileSync(path.join(dizin, 'docs', 'roller', 'gercek.md'), 'a\r\nb\r\n')
    fs.writeFileSync(path.join(dizin, 'scripts', 'disari.txt'), 'x\r\ny\r\n')
    git('add', '-A')
    git('commit', '-q', '-m', 'ilk')
    // gürültü: aynı içerik LF; gerçek: içerik değişti; dışarıda: üretilen dizin dışı
    fs.writeFileSync(path.join(dizin, 'docs', 'roller', 'gurultu.md'), 'a\nb\n')
    fs.writeFileSync(path.join(dizin, 'docs', 'roller', 'gercek.md'), 'a\nDEGISTI\n')
    fs.writeFileSync(path.join(dizin, 'scripts', 'disari.txt'), 'x\ny\nz\n')
  })

  afterAll(() => {
    try { fs.rmSync(dizin, { recursive: true, force: true }) } catch { /* temizlik en iyi çaba */ }
  })

  it('yalnız satır sonu farkını geri alır; gerçek farka ve dışarıdaki dosyaya dokunmaz', () => {
    const r = temiz.calistir(dizin, true)
    expect(r.gurultu).toEqual(['docs/roller/gurultu.md'])
    expect(r.gercek).toEqual(['docs/roller/gercek.md'])
    expect(r.disarida).toEqual([])
    expect(fs.readFileSync(path.join(dizin, 'docs', 'roller', 'gurultu.md'), 'utf8')).toBe('a\r\nb\r\n')
    expect(fs.readFileSync(path.join(dizin, 'docs', 'roller', 'gercek.md'), 'utf8')).toBe('a\nDEGISTI\n')
    expect(fs.readFileSync(path.join(dizin, 'scripts', 'disari.txt'), 'utf8')).toBe('x\ny\nz\n')
  })
})

describe('ifade-bagli-mi', () => {
  let dizin = ''
  beforeAll(() => {
    dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'ifade-bagli-'))
    fs.mkdirSync(path.join(dizin, 'src', '__tests__'), { recursive: true })
    fs.mkdirSync(path.join(dizin, 'scripts', 'belge'), { recursive: true })
    fs.writeFileSync(path.join(dizin, 'src', '__tests__', 'a.test.ts'), "expect(x).toContain('bayt ölçülür')\r\nbaska\r\n")
    fs.writeFileSync(path.join(dizin, 'scripts', 'belge', 'hedef.cjs'), "const m = 'hedefte geçen bayt ölçülür'\n")
  })
  afterAll(() => {
    try { fs.rmSync(dizin, { recursive: true, force: true }) } catch { /* en iyi çaba */ }
  })

  it('bağlı ifadeyi dosya:satır ile bulur (CRLF normalize), bağsızı bulmaz', () => {
    const [bagliSonuc, bagsiz] = bagli.ara(dizin, ['bayt ölçülür', 'hiç geçmeyen ifade'])
    expect(bagliSonuc.vurgular.map((v) => `${v.dosya}:${v.satir}`)).toContain('src/__tests__/a.test.ts:1')
    expect(bagsiz.vurgular).toEqual([])
  })

  it('hedef dosyanın kendisi sayılmaz', () => {
    const [r] = bagli.ara(dizin, ['hedefte geçen bayt'], 'scripts/belge/hedef.cjs')
    expect(r.vurgular).toEqual([])
  })

  it('parcalar kısa parçaları eler, noktalama ile böler', () => {
    expect(bagli.parcalar('- Kısa; çok uzun bir parça burada geçer, ve bir tane daha uzun parça')).toEqual(['çok uzun bir parça burada geçer', 've bir tane daha uzun parça'])
  })
})
