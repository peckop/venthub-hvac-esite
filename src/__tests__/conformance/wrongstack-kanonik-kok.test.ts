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

/**
 * INV-WRONGSTACK-SURUM-KAPISI-1 (ARC-103, 2026-10-12) — 13:07 kazasının kalıcı kapısı.
 * Sunucu `--project-root`u ana ağaca çevirir; worktree'nin KENDİ paketi (yerel kurulum kazanır) CANLI kökü açar.
 * O paket ana ağaçtakinden yeniyse canlı sage.db şeması yerinde göç eder (34 → 47 nesne, geri alınamaz).
 * Kapı: çalıştırılacak paket dosyası ana ağaçtakiyle aynı dosya değilse sürümler eşit olmalı; okunamıyorsa RET.
 */
const kapi = gerek(path.join(ARAC, 'posta-kutusu.cjs')) as {
  surumKapisi: (cli: string, kokDizin?: string) => { tamam: boolean; sebep?: string; calisan?: string | null; ana?: string | null }
  surumKapisiMetni: (onek: string, k: { sebep?: string }) => string
}

describe('INV-WRONGSTACK-SURUM-KAPISI-1', () => {
  /** Gerçek git ana ağacı + worktree; ikisine de tools/wrongstack-mcp ve sahte `x-mcp` paketi yazılabilir. */
  const kur = () => {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'surumkapi-'))
    const ana = path.join(kok, 'ana')
    const wt = path.join(kok, 'wt')
    fs.mkdirSync(ana)
    git(ana, 'init', '-q', '-b', 'master')
    fs.writeFileSync(path.join(ana, 'a.txt'), 'x')
    git(ana, 'add', 'a.txt')
    git(ana, 'commit', '-q', '-m', 'ilk')
    git(ana, 'worktree', 'add', '-q', '-b', 'wt', wt)
    const arac = (agac: string) => path.join(agac, 'tools', 'wrongstack-mcp')
    const paket = (agac: string, surum: string | null, isaret?: string) => {
      const d = path.join(arac(agac), 'node_modules', '@wrongstack', 'x-mcp')
      fs.mkdirSync(path.join(d, 'dist'), { recursive: true })
      fs.writeFileSync(
        path.join(d, 'dist', 'cli.js'),
        isaret ? `require('node:fs').writeFileSync(${JSON.stringify(isaret)}, 'acildi')\n` : '//\n',
      )
      if (surum !== null) fs.writeFileSync(path.join(d, 'package.json'), JSON.stringify({ name: '@wrongstack/x-mcp', version: surum }))
      return path.join(d, 'dist', 'cli.js')
    }
    const temizle = () => {
      try {
        git(ana, 'worktree', 'remove', '--force', wt)
      } catch {
        // dizin aşağıda silinir
      }
      fs.rmSync(kok, { recursive: true, force: true })
    }
    return { kok, ana, wt, arac, paket, temizle }
  }

  it('⭐FARKLI SÜRÜM → RET: worktree 1.1.0, ana ağaç 1.0.26 (13:07 kazasının birebir vakası); sebep iki sürümü söyler', () => {
    const t = kur()
    try {
      t.paket(t.ana, '1.0.26')
      const cli = t.paket(t.wt, '1.1.0')
      const k = kapi.surumKapisi(cli, t.arac(t.wt))
      expect(k.tamam, 'farklı sürümle canlı köke açmaya İZİN verildi').toBe(false)
      expect(k.calisan).toBe('1.1.0')
      expect(k.ana).toBe('1.0.26')
      expect(k.sebep).toMatch(/1\.1\.0.*1\.0\.26/)
      // ters yön: worktree eski, ana ağaç yeni (daemon sürümü bölünür) — o da RET
      const ters = kur()
      try {
        ters.paket(ters.ana, '1.1.0')
        expect(kapi.surumKapisi(ters.paket(ters.wt, '1.0.26'), ters.arac(ters.wt)).tamam).toBe(false)
      } finally {
        ters.temizle()
      }
    } finally {
      t.temizle()
    }
  })

  it('AYNI SÜRÜM → geçer; worktree içinde kurulum yoksa (cli ana ağacın dosyası) → geçer', () => {
    const t = kur()
    try {
      const anaCli = t.paket(t.ana, '1.1.0')
      expect(kapi.surumKapisi(t.paket(t.wt, '1.1.0'), t.arac(t.wt)).tamam, 'aynı sürümde davranış DEĞİŞMEMELİ').toBe(true)
      expect(kapi.surumKapisi(anaCli, t.arac(t.wt)).tamam, 'ana ağacın kendi dosyası reddedildi').toBe(true)
      expect(kapi.surumKapisi(anaCli, t.arac(t.ana)).tamam).toBe(true)
    } finally {
      t.temizle()
    }
  })

  it('⭐FAIL-CLOSED: sürüm okunamazsa (package.json yok/bozuk, ana ağaçta kurulum yok) RET', () => {
    const t = kur()
    try {
      // çalışacak paketin package.json'ı yok
      t.paket(t.ana, '1.1.0')
      const cli = t.paket(t.wt, null)
      const k1 = kapi.surumKapisi(cli, t.arac(t.wt))
      expect(k1.tamam, 'okunamayan sürüm "aynı" sayıldı').toBe(false)
      expect(k1.sebep).toMatch(/okunamadi/)
      // bozuk JSON
      fs.writeFileSync(path.join(path.dirname(path.dirname(cli)), 'package.json'), '{bozuk')
      expect(kapi.surumKapisi(cli, t.arac(t.wt)).tamam).toBe(false)
      // ana ağaçta kurulum yok, worktree'de var
      fs.rmSync(path.join(t.arac(t.ana), 'node_modules'), { recursive: true, force: true })
      const cli2 = t.paket(t.wt, '1.1.0')
      const k2 = kapi.surumKapisi(cli2, t.arac(t.wt))
      expect(k2.tamam, 'ana ağaç sürümü bilinmezken canlı köke açmaya İZİN verildi').toBe(false)
      expect(k2.sebep).toMatch(/ana agac/)
    } finally {
      t.temizle()
    }
  })

  it('⭐SABOTAJ (gerçek süreç): kanonik-kok.cjs farklı sürümde sunucuyu AÇMAZ (çıkış 1, paket ÇALIŞMAZ); aynı sürümde açar', () => {
    const t = kur()
    try {
      for (const agac of [t.ana, t.wt]) {
        fs.mkdirSync(t.arac(agac), { recursive: true })
        for (const f of ['kanonik-kok.cjs', 'posta-kutusu.cjs']) fs.copyFileSync(path.join(ARAC, f), path.join(t.arac(agac), f))
      }
      const isaret = path.join(t.kok, 'acildi.txt')
      t.paket(t.ana, '1.0.26')
      t.paket(t.wt, '1.1.0', isaret)
      const cli = 'tools/wrongstack-mcp/node_modules/@wrongstack/x-mcp/dist/cli.js'
      const kos = () =>
        spawnSync(process.execPath, [path.join(t.arac(t.wt), 'kanonik-kok.cjs'), cli, '--project-root', '.', '--stdio'], {
          cwd: t.wt,
          encoding: 'utf8',
          timeout: 15_000,
          windowsHide: true,
        })
      const ret = kos()
      expect(ret.status, `stderr: ${ret.stderr}`).toBe(1)
      expect(ret.stderr).toMatch(/SURUM KAPISI RET/)
      expect(ret.stderr, 'çözüm metni yok').toMatch(/node_modules/)
      expect(fs.existsSync(isaret), 'RET verilen paket YİNE DE çalıştı').toBe(false)
      // sürümler eşitlenince aynı komut paketi açar
      t.paket(t.ana, '1.1.0')
      const tamam = kos()
      expect(tamam.status, `stderr: ${tamam.stderr}`).toBe(0)
      expect(fs.existsSync(isaret), 'aynı sürümde paket AÇILMADI').toBe(true)
    } finally {
      t.temizle()
    }
  })

  it('kapı iki giriş noktasında da ÇAĞRILIR ve çıkış 1 verir (kanonik-kok + posta-kutusu); metin çözümü söyler', () => {
    for (const dosya of ['kanonik-kok.cjs', 'posta-kutusu.cjs']) {
      const kaynak = fs.readFileSync(path.join(ARAC, dosya), 'utf8')
      expect(kaynak, `${dosya} sürüm kapısını ÇAĞIRMIYOR — worktree canlı köke farklı sürümle açar`).toMatch(
        /surumKapisi\((cli|argv\[1\])\)/,
      )
      expect(kaynak, `${dosya} RET sonrası çıkmıyor`).toMatch(/surumKapisiMetni\([^)]*\)\)\s*\n\s*process\.exit\(1\)/)
    }
    const m = kapi.surumKapisiMetni('x', { sebep: 'a ≠ b' })
    expect(m).toMatch(/Sunucu ACILMADI/)
    expect(m).toMatch(/cmd \/\/c rmdir/)
  })
})
