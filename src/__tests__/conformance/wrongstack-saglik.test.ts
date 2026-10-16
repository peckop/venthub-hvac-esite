// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WRONGSTACK-SAGLIK-1 (ARC-94, OPS 12 Ekim) — yükseltme sonrası "koşan süreç gerçekten yeni sürüm mü" ölçülür
 * ve ölçüm aracı canlıya YAN ETKİ üretmez.
 *
 * ⭐ÖLÇÜLMÜŞ KAZA (12 Ekim 13:07): sürüm okuma betiği worktree'den sunucu açınca sunucu `--project-root`u ANA AĞACA
 * çevirdi, worktree'nin 1.1.0 paketiyle CANLI kökü açtı ve sage.db şemasını yerinde 34 → 47 nesneye göç ettirdi.
 * Bu dosya o yolu kilitler: varsayılan hiçbir sunucu açmaz; `--sunucu` yalnız ana ağaçta (`.git` DİZİN) çalışır.
 *
 * Cetvel: tools/wrongstack-mcp/README.md (yükseltme sırası), docs/audits/wrongstack-1-1-0-gecis-olcumu-2026-10-12.md.
 */
const KOK = process.cwd()
const SAGLIK = path.join(KOK, 'tools', 'wrongstack-mcp', 'saglik.cjs')
const require_ = createRequire(import.meta.url)

type Daemon = { pid: number; paket: string; kok: string | null; surum: string | null; beklenen: string | null; eski: boolean }
const modul = require_(SAGLIK) as {
  daemonPaketi: (komut: string) => { klasor: string; paket: string; kok: string | null } | null
  daemonSurumleri: (
    surecler: { pid: number; komut: string }[],
    beklenen: (paket: string, klasor?: string) => string | null,
    okuSurum?: (klasor: string) => string | null,
  ) => Daemon[]
  anaAgacMi: (kok?: string) => boolean
  beklenenSurum: (arac: string, paket: string, klasor?: string) => string | null
  sunucuSurumu: (
    cli: string,
    kok: string,
    zamanAsimi?: number,
    ek?: string[],
    ortam?: Record<string, string>,
  ) => Promise<{ surum?: string | null; arac?: number | null; hata?: string }>
  SUNUCU_EK: Record<string, string[]>
  mcpOrtami: (ad: string, kok?: string) => Record<string, string>
}

const KOMUTLAR = {
  kanban:
    '"C:\\Program Files\\nodejs\\node.exe" c:\\x\\tools\\wrongstack-mcp\\node_modules\\@wrongstack\\kanban\\dist\\project-server.js --project-root c:\\x',
  sage: '"C:\\Program Files\\nodejs\\node.exe" c:\\x\\tools\\wrongstack-mcp\\node_modules\\@wrongstack\\sage\\dist\\project-server.js --project-root c:\\x',
  tools:
    '"C:\\Program Files\\nodejs\\node.exe" c:\\x\\tools\\wrongstack-mcp\\node_modules\\@wrongstack\\tools\\dist\\codebase-index\\project-server.js --project-root c:\\x',
  core: '"C:\\Program Files\\nodejs\\node.exe" c:\\x\\tools\\wrongstack-mcp\\node_modules\\@wrongstack\\core\\dist\\coordination\\mailbox-project-server.js --project-dir C:\\Users\\y\\.wrongstack\\projects\\p-7e017f',
}

function sahteAgac(opts: { gitDizin: boolean; gitDosya: boolean; surecler: { pid: number; komut: string }[]; kurulu: string }) {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-'))
  const arac = path.join(kok, 'tools', 'wrongstack-mcp')
  fs.mkdirSync(arac, { recursive: true })
  fs.copyFileSync(SAGLIK, path.join(arac, 'saglik.cjs'))
  // kurulum.cjs yerine saplama: gerçek süreç listesi/PowerShell çağrısı olmasın.
  fs.writeFileSync(
    path.join(arac, 'kurulum.cjs'),
    `module.exports = { surecleriOku: () => ${JSON.stringify(opts.surecler)} }\n`,
  )
  for (const p of ['sage-mcp', 'kanban-mcp', 'mailbox-mcp', 'codebase-index-mcp', 'sage', 'kanban', 'tools', 'core']) {
    const d = path.join(arac, 'node_modules', '@wrongstack', p)
    fs.mkdirSync(d, { recursive: true })
    fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({ name: '@wrongstack/' + p, version: opts.kurulu }))
  }
  if (opts.gitDizin) fs.mkdirSync(path.join(kok, '.git'))
  if (opts.gitDosya) fs.writeFileSync(path.join(kok, '.git'), 'gitdir: /baska/yer')
  return { kok, betik: path.join(arac, 'saglik.cjs') }
}

function kos(betik: string, ...args: string[]) {
  const r = spawnSync(process.execPath, [betik, ...args], { encoding: 'utf8', timeout: 30000 })
  return { kod: r.status, cikti: String(r.stdout) + String(r.stderr) }
}

describe('INV-WRONGSTACK-SAGLIK-1 · daemon sürümü ölçülür, ölçüm aracı canlıya yan etki üretmez', () => {
  it('komut satırından paket klasörü, paket adı ve kök çözülür (dört daemon türü)', () => {
    const k = modul.daemonPaketi(KOMUTLAR.kanban)
    expect(k?.paket).toBe('kanban')
    expect(k?.klasor.replace(/\\/g, '/')).toMatch(/c:\/x\/tools\/wrongstack-mcp\/node_modules\/@wrongstack\/kanban$/i)
    expect(k?.kok).toBe('c:/x')
    expect(modul.daemonPaketi(KOMUTLAR.sage)?.paket).toBe('sage')
    expect(modul.daemonPaketi(KOMUTLAR.tools)?.paket).toBe('tools')
    const m = modul.daemonPaketi(KOMUTLAR.core)
    expect(m?.paket, 'mailbox daemon (core paketi, --project-dir) tanınmadı').toBe('core')
    expect(m?.kok).toMatch(/p-7e017f$/)
    expect(modul.daemonPaketi('node tools/wrongstack-mcp/node_modules/@wrongstack/sage-mcp/dist/cli.js --stdio'), 'istemci daemon sayıldı').toBeNull()
  })

  it('⭐ESKİ daemon ayıklanır; sürümü OKUNAMAYAN daemon da ESKİ sayılır (fail-closed)', () => {
    const surecler = [
      { pid: 1, komut: KOMUTLAR.kanban },
      { pid: 2, komut: KOMUTLAR.sage },
      { pid: 3, komut: KOMUTLAR.tools },
      { pid: 4, komut: 'node baska.js' },
    ]
    const okuma: Record<string, string | null> = { kanban: '1.0.26', sage: '1.1.0', tools: null }
    const d = modul.daemonSurumleri(
      surecler,
      () => '1.1.0',
      (klasor) => okuma[path.basename(klasor)] ?? null,
    )
    expect(d.map((x) => [x.pid, x.eski])).toEqual([
      [1, true],
      [2, false],
      [3, true],
    ])
    expect(d.find((x) => x.pid === 3)?.surum).toBeNull()
  })

  it('⭐ARC-176: beklenen sürüm, daemon sarmalayıcının İÇ kopyasını koşuyorsa o sarmalayıcının dependencies kaydıdır (üst düzey hoisted kopya değil)', () => {
    const a = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-b-'))
    const wg = path.join(a, 'node_modules', '@wrongstack')
    fs.mkdirSync(path.join(wg, 'kanban'), { recursive: true })
    fs.writeFileSync(path.join(wg, 'kanban', 'package.json'), JSON.stringify({ version: '1.1.0' }))
    fs.mkdirSync(path.join(wg, 'kanban-mcp'), { recursive: true })
    fs.writeFileSync(
      path.join(wg, 'kanban-mcp', 'package.json'),
      JSON.stringify({ version: '1.1.4', dependencies: { '@wrongstack/kanban': '1.1.2' } }),
    )
    const ic = path.join(wg, 'kanban-mcp', 'node_modules', '@wrongstack', 'kanban')
    expect(modul.beklenenSurum(a, 'kanban', ic)).toBe('1.1.2')
    // üst düzey kopya koşuyorsa üst düzey sürüm beklenir
    expect(modul.beklenenSurum(a, 'kanban', path.join(wg, 'kanban'))).toBe('1.1.0')
    // sarmalayıcı kaydı okunamazsa üst düzeye düşer
    expect(
      modul.beklenenSurum(a, 'kanban', path.join(wg, 'yok-mcp', 'node_modules', '@wrongstack', 'kanban')),
    ).toBe('1.1.0')
  })

  it('anaAgacMi: .git DİZİN ise ana ağaç; DOSYA (worktree) ya da yok ise değil', () => {
    const a = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-a-'))
    fs.mkdirSync(path.join(a, '.git'))
    expect(modul.anaAgacMi(a)).toBe(true)
    const w = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-w-'))
    fs.writeFileSync(path.join(w, '.git'), 'gitdir: /x')
    expect(modul.anaAgacMi(w)).toBe(false)
    expect(modul.anaAgacMi(fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-y-')))).toBe(false)
  })

  it('⭐WORKTREE\'DE --sunucu REDDEDİLİR ve hiçbir sunucu açılmaz (12 Ekim kazasının kilidi)', () => {
    const t = sahteAgac({ gitDizin: false, gitDosya: true, surecler: [], kurulu: '1.1.0' })
    const r = kos(t.betik, '--sunucu')
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/ANA AGACTA/)
    expect(r.cikti, 'sunucu acma denemesi yapildi').not.toMatch(/initialize/)
  })

  it('varsayılan koşum sunucu AÇMAZ; eski daemon varsa HATA, yoksa HAZIR', () => {
    const eski = sahteAgac({
      gitDizin: false,
      gitDosya: true,
      surecler: [{ pid: 7, komut: KOMUTLAR.sage.replace('c:\\x', 'c:\\x') }],
      kurulu: '1.1.0',
    })
    // Sahte süreç komutu mutlak yolu `c:\x` paket klasörüne gider (yok): okunamayan sürüm = ESKİ.
    const r1 = kos(eski.betik)
    expect(r1.kod, r1.cikti).toBe(1)
    expect(r1.cikti).toMatch(/ESKİ/)
    expect(r1.cikti).not.toMatch(/initialize/)

    const bos = sahteAgac({ gitDizin: false, gitDosya: true, surecler: [], kurulu: '1.1.0' })
    const r2 = kos(bos.betik)
    expect(r2.kod, r2.cikti).toBe(0)
    expect(r2.cikti.trim().split('\n').pop()).toBe('HAZIR')
  })
})

/**
 * ARC-108 (12 Ekim 13:55 ölçüldü): mailbox-mcp 1.1.0 `--actor` zorunlu, yoksa çıkış 2; sağlık ölçümü bayrağı vermediği için
 * "sunucu beklenmedik kapandi" diyordu. Sahte sunucu: `--actor` yoksa çıkış 2, varsa initialize + tools/list cevaplar.
 */
describe('INV-WRONGSTACK-SAGLIK-2 · mailbox-mcp --actor ile açılır (ölçüm kusuru kapalı)', () => {
  const sahteCli = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-cli-'))
    const cli = path.join(d, 'cli.js')
    fs.writeFileSync(
      cli,
      [
        "if (!process.argv.includes('--actor')) { process.stderr.write('--project-root and --actor are required\\n'); process.exit(2) }",
        "process.stdin.on('data', (b) => { for (const l of String(b).split('\\n')) { if (!l.trim()) continue; const m = JSON.parse(l)",
        "  if (m.method === 'initialize') process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: m.id, result: { serverInfo: { version: '9.9.9' } } }) + '\\n')",
        "  if (m.method === 'tools/list') process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: m.id, result: { tools: [{}, {}] } }) + '\\n') } })",
      ].join('\n'),
    )
    return { cli, d }
  }

  it('⭐mailbox-mcp için sabit --actor tanımlı; diğer üç sunucuya ek bayrak EKLENMEZ', () => {
    expect(modul.SUNUCU_EK['mailbox-mcp']).toEqual(['--actor', 'wrongstack-saglik'])
    for (const ad of ['sage-mcp', 'kanban-mcp', 'codebase-index-mcp']) expect(modul.SUNUCU_EK[ad], ad).toBeUndefined()
  })

  it('⭐GERÇEK SÜREÇ: --actor ile sürüm ve araç sayısı okunur; bayraksız açış "beklenmedik kapandi" (eski kusur)', async () => {
    const { cli, d } = sahteCli()
    try {
      const iyi = await modul.sunucuSurumu(cli, d, 10_000, modul.SUNUCU_EK['mailbox-mcp'])
      expect(iyi.hata).toBeUndefined()
      expect(iyi.surum).toBe('9.9.9')
      expect(iyi.arac).toBe(2)
      const kotu = await modul.sunucuSurumu(cli, d, 10_000)
      expect(kotu.hata).toMatch(/beklenmedik kapandi/)
    } finally {
      fs.rmSync(d, { recursive: true, force: true })
    }
  })

  it('ana döngü sunucuSurumu çağrısına SUNUCU_EK geçirir (bayrak unutulursa kusur geri gelir)', () => {
    expect(fs.readFileSync(SAGLIK, 'utf8')).toMatch(/sunucuSurumu\([\s\S]{0,200}SUNUCU_EK\[ad\]/)
  })
})

/**
 * ARC-109 (12 Ekim 15:30 ölçüldü): kanban doğrulayıcı izin listesi paylaşılan DAEMON doğarken `process.env`'den okunur;
 * ortamsız açılan ilk istemci daemon'u `+gh`sız doğurur ve bütün pencerelerde `gh` kanıtları reddedilir (13:51-15:30).
 * Sağlık ölçümü sunucuyu açıyorsa `.mcp.json` ortamını AYNEN geçirmeli.
 */
describe('INV-WRONGSTACK-SAGLIK-3 · sunucu `.mcp.json` ortamıyla açılır (daemon izin listesi bozulmaz)', () => {
  const mcpKok = (mcp: unknown) => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-mcp-'))
    fs.writeFileSync(path.join(d, '.mcp.json'), typeof mcp === 'string' ? mcp : JSON.stringify(mcp))
    return d
  }

  it('⭐gerçek .mcp.json: kanban-mcp için +gh ortamı gelir; diğer sunucularda ortam yok', () => {
    expect(modul.mcpOrtami('kanban-mcp', KOK)).toEqual({ WRONGSTACK_KANBAN_VERIFIER_COMMANDS: '+gh' })
    expect(modul.mcpOrtami('sage-mcp', KOK)).toEqual({})
    expect(modul.mcpOrtami('olmayan-mcp', KOK)).toEqual({})
  })

  it('.mcp.json yok ya da bozuksa boş ortam döner, FIRLATMAZ (ölçüm yine koşar)', () => {
    const yok = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-mcp-'))
    const bozuk = mcpKok('{bozuk')
    const baska = mcpKok({ mcpServers: { x: { args: ['baska.js'], env: { A: '1' } } } })
    try {
      for (const k of [yok, bozuk, baska]) expect(modul.mcpOrtami('kanban-mcp', k)).toEqual({})
    } finally {
      for (const k of [yok, bozuk, baska]) fs.rmSync(k, { recursive: true, force: true })
    }
  })

  it('⭐GERÇEK SÜREÇ: ortam sunucuya ULAŞIR (sahte cli ortam değişkeni yoksa çıkış 2)', async () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-saglik-env-'))
    const cli = path.join(d, 'cli.js')
    fs.writeFileSync(
      cli,
      [
        "if (process.env.WRONGSTACK_KANBAN_VERIFIER_COMMANDS !== '+gh') process.exit(2)",
        "process.stdin.on('data', (b) => { for (const l of String(b).split('\\n')) { if (!l.trim()) continue; const m = JSON.parse(l)",
        "  if (m.method === 'initialize') process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: m.id, result: { serverInfo: { version: '9.9.9' } } }) + '\\n')",
        "  if (m.method === 'tools/list') process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: m.id, result: { tools: [] } }) + '\\n') } })",
      ].join('\n'),
    )
    try {
      const iyi = await modul.sunucuSurumu(cli, d, 10_000, [], { WRONGSTACK_KANBAN_VERIFIER_COMMANDS: '+gh' })
      expect(iyi.hata).toBeUndefined()
      expect(iyi.surum).toBe('9.9.9')
      const kotu = await modul.sunucuSurumu(cli, d, 10_000)
      expect(kotu.hata, 'ortamsız açılış kabul edildi').toMatch(/beklenmedik kapandi/)
    } finally {
      fs.rmSync(d, { recursive: true, force: true })
    }
  })

  it('ana döngü sunucuSurumu çağrısına mcpOrtami(ad) geçirir (unutulursa daemon +gh olmadan doğar)', () => {
    expect(fs.readFileSync(SAGLIK, 'utf8')).toMatch(/sunucuSurumu\([\s\S]{0,260}mcpOrtami\(ad\)/)
  })
})
