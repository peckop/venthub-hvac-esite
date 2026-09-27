// @vitest-environment node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WRONGSTACK-KURULUM-1 · WrongStack kurulum betiği başka pencereye dokunmaz.
 *
 * Betik süreç kapatır (daemon + kendi penceresinin MCP sunucuları). Başka bir pencerenin sunucusu
 * açıkken hiçbir şeyi kapatmadan DURMALI; aksi hâlde o pencere araçlarını sessizce kaybeder.
 * Canlı koşu yalnız toplu yeniden başlatmada yapılır (09-27: canlı deneme izin sisteminde
 * reddedildi — doğru hüküm); bu yüzden güvenlik burada sınanır.
 */
interface Surec {
  pid: number
  ppid: number
  ad?: string
  komut: string
}
interface Kurulum {
  siniflandir: (s: Surec[], kendiClaude: number | null, kendiPid?: number) => { kendi: Surec[]; yabanci: Surec[]; daemon: Surec[] }
  kendiClaudeBul: (s: Surec[], baslangic?: number) => number | null
  surumFarki: (deps: Record<string, string>, kurulu: (ad: string) => string | null) => string[]
  temizle: (metin: string) => string
}

const BETIK = path.resolve(process.cwd(), 'tools', 'wrongstack-mcp', 'kurulum.cjs')
const k = createRequire(import.meta.url)(BETIK) as Kurulum

const NM = 'C:\\depo\\tools\\wrongstack-mcp\\node_modules\\@wrongstack'
const surecler: Surec[] = [
  { pid: 1, ppid: 0, ad: 'explorer.exe', komut: '' },
  { pid: 10, ppid: 1, ad: 'claude.exe', komut: 'claude' },
  { pid: 20, ppid: 1, ad: 'claude.exe', komut: 'claude' },
  { pid: 11, ppid: 10, ad: 'bash.exe', komut: 'bash' },
  { pid: 12, ppid: 11, ad: 'node.exe', komut: 'node kurulum.cjs' },
  { pid: 13, ppid: 10, ad: 'node.exe', komut: `node ${NM}\\kanban-mcp\\dist\\cli.js --project-root . --stdio` },
  { pid: 14, ppid: 10, ad: 'node.exe', komut: 'node C:\\depo\\tools\\wrongstack-mcp\\posta-kutusu.cjs --stdio' },
  { pid: 21, ppid: 20, ad: 'node.exe', komut: `node ${NM}\\sage-mcp\\dist\\cli.js --project-root . --stdio` },
  { pid: 30, ppid: 1, ad: 'node.exe', komut: `node ${NM}\\sage\\dist\\project-server.js --project-root C:\\depo` },
  { pid: 31, ppid: 10, ad: 'node.exe', komut: 'node C:\\depo\\node_modules\\typescript\\lib\\tsserver.js' },
]

describe('INV-WRONGSTACK-KURULUM-1 · kurulum betiği', () => {
  it('ata zincirinden kendi claude.exe bulunur; zincirde yoksa null (terminalden koşu)', () => {
    expect(k.kendiClaudeBul(surecler, 12)).toBe(10)
    expect(k.kendiClaudeBul(surecler, 31)).toBe(10)
    expect(k.kendiClaudeBul(surecler, 30)).toBeNull()
  })

  it('kendi pencerenin sunucusu KENDİ, öteki pencereninki YABANCI, project-server DAEMON; ilgisiz node sayılmaz', () => {
    const r = k.siniflandir(surecler, 10, 12)
    expect(r.kendi.map((s) => s.pid).sort()).toEqual([13, 14])
    expect(r.yabanci.map((s) => s.pid)).toEqual([21])
    expect(r.daemon.map((s) => s.pid)).toEqual([30])
  })

  it('terminalden koşuda (kendi claude yok) bütün pencere sunucuları YABANCI sayılır', () => {
    const r = k.siniflandir(surecler, null, 12)
    expect(r.kendi).toEqual([])
    expect(r.yabanci.map((s) => s.pid).sort()).toEqual([13, 14, 21])
  })

  it('süreç listesindeki ham kontrol karakteri JSON çözümlemeyi düşürmez (09-27 iki kez düştü)', () => {
    const ham = '[{"ProcessId":5,"ParentProcessId":1,"Name":"x.exe","CommandLine":"a\u0001b\u0007c"}]'
    expect(() => JSON.parse(ham)).toThrow()
    expect(JSON.parse(k.temizle(ham))).toEqual([{ ProcessId: 5, ParentProcessId: 1, Name: 'x.exe', CommandLine: 'a b c' }])
  })

  it('sürüm farkı: eşit → boş; farklı ya da kurulu değil → adıyla', () => {
    const deps = { '@wrongstack/a': '1.0.26', '@wrongstack/b': '1.0.26' }
    expect(k.surumFarki(deps, () => '1.0.26')).toEqual([])
    expect(k.surumFarki(deps, (ad) => (ad.endsWith('a') ? '1.0.19' : null))).toEqual([
      '@wrongstack/a beklenen 1.0.26 kurulu 1.0.19',
      '@wrongstack/b beklenen 1.0.26 kurulu YOK',
    ])
  })

  it('kaynak: YABANCI kontrolü her kill çağrısından ÖNCE gelir; pencere açmaz; kurulum betiği kapalı', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const kur = kaynak.slice(kaynak.indexOf('function kur()'))
    expect(kur.indexOf('if (yabanci.length)')).toBeGreaterThan(-1)
    expect(kur.indexOf('if (yabanci.length)')).toBeLessThan(kur.indexOf('process.kill'))
    expect(kaynak).not.toMatch(/execFileSync\([^)]*\{(?![^}]*windowsHide)[^}]*\}\)/)
    expect(kaynak).toMatch(/'ci', '--ignore-scripts'/)
  })
})
