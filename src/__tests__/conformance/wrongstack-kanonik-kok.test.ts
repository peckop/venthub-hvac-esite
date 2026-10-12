/**
 * INV-WRONGSTACK-KANONIK-KOK-1 (karar 158, 2026-09-27)
 *
 * Kod dizini sunucusu `--project-root` değerini KANONİK köke (küçük sürücü harfi, worktree → ana
 * ağaç) çeviren sarmalayıcı üzerinden açılır; aksi hâlde WrongStack aynı proje için iki ayrı dizin
 * kopyası tutar (ölçüldü: 7e017f / 1088d5). Gerekçe: tools/wrongstack-mcp/kanonik-kok.cjs başlığı.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(process.cwd())
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')
const gerek = createRequire(import.meta.url)
const sar = gerek(path.join(ARAC, 'kanonik-kok.cjs')) as {
  cliDogrula: (v: unknown, cwd?: string) => string | null
  argvKur: (argv0: string, args: string[], cwd?: string) => string[] | null
}
const { kanonikKok, paketCli } = gerek(path.join(ARAC, 'posta-kutusu.cjs')) as {
  kanonikKok: (p: string) => string
  paketCli: (paket: string, kokDizin?: string) => string
}

const DIZIN_CLI = 'tools/wrongstack-mcp/node_modules/@wrongstack/codebase-index-mcp/dist/cli.js'
const SAGE_CLI = 'tools/wrongstack-mcp/node_modules/@wrongstack/sage-mcp/dist/cli.js'
const KANBAN_CLI = 'tools/wrongstack-mcp/node_modules/@wrongstack/kanban-mcp/dist/cli.js'

const git = (cwd: string, ...a: string[]) =>
  execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

describe('INV-WRONGSTACK-KANONIK-KOK-1', () => {
  it('yalnız kilitli @wrongstack/<paket>/dist/cli.js kabul edilir; başka dosya ÇALIŞTIRILMAZ', () => {
    expect(sar.cliDogrula(DIZIN_CLI, KOK)).toBe(path.join(ARAC, 'node_modules', '@wrongstack', 'codebase-index-mcp', 'dist', 'cli.js'))
    for (const kotu of [
      'tools/wrongstack-mcp/posta-kutusu.cjs',
      'tools/wrongstack-mcp/node_modules/@wrongstack/codebase-index-mcp/dist/index.js',
      'tools/wrongstack-mcp/node_modules/@wrongstack/../../../../evil/dist/cli.js',
      'tools/wrongstack-mcp/node_modules/baska/dist/cli.js',
      '',
      undefined,
    ]) {
      expect(sar.cliDogrula(kotu, KOK), String(kotu)).toBeNull()
    }
  })

  it('SABOTAJ (gerçek süreç): başka dosya verilince sunucu AÇILMAZ, çıkış 1', () => {
    const r = spawnSync(process.execPath, [path.join(ARAC, 'kanonik-kok.cjs'), 'tools/wrongstack-mcp/posta-kutusu.cjs', '--stdio'], {
      cwd: KOK,
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true,
    })
    expect(r.status).toBe(1)
    expect(r.stderr).toMatch(/sunucu ACILMADI/)
  })

  it('argv: kök kanonikleşir (posta kutusuyla AYNI işlev), diğer bayraklar AYNEN kalır', () => {
    const argv = sar.argvKur('node', [DIZIN_CLI, '--project-root', KOK, '--stdio'], KOK)
    expect(argv).not.toBeNull()
    expect(argv?.slice(2)).toEqual(['--project-root', kanonikKok(KOK), '--stdio'])
    // sürücü harfi yalnız Windows'ta var (CI Linux'ta yol eğik çizgiyle başlar)
    if (process.platform === 'win32') expect(argv?.[3]).toMatch(/^[a-z]:/)
    // ayırt edici çift: büyük harfli kök de AYNI kanoniğe iner
    const buyuk = KOK.replace(/^([a-z]):/, (_, h: string) => h.toUpperCase() + ':')
    expect(sar.argvKur('node', [DIZIN_CLI, '--project-root', buyuk, '--stdio'], KOK)?.[3]).toBe(argv?.[3])
    expect(sar.argvKur('node', ['tools/wrongstack-mcp/posta-kutusu.cjs', '--stdio'], KOK)).toBeNull()
  })

  it('.mcp.json kod dizinini sarmalayıcı üzerinden açar; --writable YOK', () => {
    const mcp = JSON.parse(fs.readFileSync(path.join(KOK, '.mcp.json'), 'utf8')) as {
      mcpServers: Record<string, { command?: string; args?: string[] }>
    }
    const dizin = mcp.mcpServers['wrongstack-codebase-index']
    expect(dizin?.args?.[0], 'kod dizini sarmalayıcısız — ikiz kopya geri gelir').toBe('tools/wrongstack-mcp/kanonik-kok.cjs')
    expect(dizin?.args?.[1]).toBe(DIZIN_CLI)
    expect(dizin?.args).not.toContain('--writable')
  })

  it('⭐ARC-98 sage ve kanban da sarmalayıcıdan açılır; kilitli cli yolu KORUNUR, --writable ve env AYNEN', () => {
    const mcp = JSON.parse(fs.readFileSync(path.join(KOK, '.mcp.json'), 'utf8')) as {
      mcpServers: Record<string, { command?: string; args?: string[]; env?: Record<string, string> }>
    }
    for (const [ad, cli] of [
      ['wrongstack-sage', SAGE_CLI],
      ['wrongstack-kanban', KANBAN_CLI],
    ] as const) {
      const s = mcp.mcpServers[ad]
      expect(s?.args?.[0], `${ad} sarmalayıcısız — worktree'de "Connection closed" geri gelir (ARC-98)`).toBe(
        'tools/wrongstack-mcp/kanonik-kok.cjs',
      )
      expect(s?.args?.[1], `${ad} kilitli cli yolu değişti`).toBe(cli)
      expect(s?.args, `${ad} --project-root yok`).toContain('--project-root')
      expect(s?.args, `${ad} --writable düştü — yazamaz`).toContain('--writable')
      expect(sar.cliDogrula(cli, KOK), `${ad} cli sarmalayıcı doğrulamasından geçmiyor`).not.toBeNull()
    }
    expect(mcp.mcpServers['wrongstack-kanban']?.args, 'kanban --destructive açıldı').not.toContain('--destructive')
    expect(mcp.mcpServers['wrongstack-kanban']?.env?.WRONGSTACK_KANBAN_VERIFIER_COMMANDS).toBe('+gh')
  })

  it('⭐ARC-98 paketCli: yerel kurulum KAZANIR; yoksa ANA AĞACIN kurulumu; hiçbiri yoksa yerel yol', () => {
    // Gerçek git ağacı + worktree: node_modules izlenmez, worktree'de olmaması tam bugünkü vaka.
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'paketcli-'))
    const ana = path.join(kok, 'ana')
    const wt = path.join(kok, 'wt')
    const aracDizin = (agac: string) => path.join(agac, 'tools', 'wrongstack-mcp')
    const cliDosya = (agac: string, paket = 'x-mcp') =>
      path.join(aracDizin(agac), 'node_modules', '@wrongstack', paket, 'dist', 'cli.js')
    const yaz = (f: string) => {
      fs.mkdirSync(path.dirname(f), { recursive: true })
      fs.writeFileSync(f, '//')
    }
    const ayni = (a: string, b: string) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase()
    try {
      fs.mkdirSync(ana)
      git(ana, 'init', '-q', '-b', 'master')
      fs.writeFileSync(path.join(ana, 'a.txt'), 'x')
      git(ana, 'add', 'a.txt')
      git(ana, 'commit', '-q', '-m', 'ilk')
      git(ana, 'worktree', 'add', '-q', '-b', 'wt', wt)

      // (1) kurulum yalnız ana ağaçta → worktree'den ANA AĞACIN cli'si
      yaz(cliDosya(ana))
      expect(ayni(paketCli('x-mcp', aracDizin(wt)), cliDosya(ana)), 'worktree ana ağacın kurulumunu bulmadı').toBe(true)
      // (2) worktree'nin kendi kurulumu varsa o kazanır
      yaz(cliDosya(wt))
      expect(ayni(paketCli('x-mcp', aracDizin(wt)), cliDosya(wt)), 'yerel kurulum ana ağaca yenildi').toBe(true)
      // (3) hiçbir yerde yoksa yerel yol döner: sunucu kendi hatasını versin, başka dosya çalışmasın
      expect(ayni(paketCli('yok-mcp', aracDizin(wt)), cliDosya(wt, 'yok-mcp')), 'bulunamayınca yerel yol dönmedi').toBe(true)
    } finally {
      try {
        git(ana, 'worktree', 'remove', '--force', wt)
      } catch {
        // dizin aşağıda silinir
      }
      fs.rmSync(kok, { recursive: true, force: true })
    }
  })

  it('⭐ARC-98 argvKur: çalıştırılacak dosya DAİMA aynı paketin dist/cli.js dosyasıdır (yerel ya da ana ağaç)', () => {
    for (const [paket, cli] of [
      ['sage-mcp', SAGE_CLI],
      ['kanban-mcp', KANBAN_CLI],
      ['codebase-index-mcp', DIZIN_CLI],
    ] as const) {
      const argv = sar.argvKur('node', [cli, '--project-root', '.', '--stdio'], KOK)
      expect(argv, paket).not.toBeNull()
      const calisan = (argv?.[1] ?? '').split(path.sep).join('/')
      expect(calisan.endsWith(`/@wrongstack/${paket}/dist/cli.js`), `${paket}: ${calisan}`).toBe(true)
      // Sunucuya verilen dosya paketCli'nin seçtiğiyle AYNI: worktree'de kurulum yoksa ana ağacınki (yoksa yerel yol)
      expect(argv?.[1], `${paket}: argvKur paketCli seçimini kullanmıyor`).toBe(paketCli(paket))
      expect(argv?.slice(2), paket).toEqual(['--project-root', kanonikKok('.'), '--stdio'])
    }
  })
})
