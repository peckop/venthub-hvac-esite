/**
 * INV-WRONGSTACK-KANONIK-KOK-1 (karar 158, 2026-09-27)
 *
 * Kod dizini sunucusu `--project-root` değerini KANONİK köke (küçük sürücü harfi, worktree → ana
 * ağaç) çeviren sarmalayıcı üzerinden açılır; aksi hâlde WrongStack aynı proje için iki ayrı dizin
 * kopyası tutar (ölçüldü: 7e017f / 1088d5). Gerekçe: tools/wrongstack-mcp/kanonik-kok.cjs başlığı.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(process.cwd())
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')
const gerek = createRequire(import.meta.url)
const sar = gerek(path.join(ARAC, 'kanonik-kok.cjs')) as {
  cliDogrula: (v: unknown, cwd?: string) => string | null
  argvKur: (argv0: string, args: string[], cwd?: string) => string[] | null
}
const { kanonikKok } = gerek(path.join(ARAC, 'posta-kutusu.cjs')) as { kanonikKok: (p: string) => string }

const DIZIN_CLI = 'tools/wrongstack-mcp/node_modules/@wrongstack/codebase-index-mcp/dist/cli.js'

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
    // sürücü harfi yalnız Windows'ta var (CI Linux: /home/runner/...)
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
})
