import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

/**
 * INV-WS-BAGLANTI-1 (ARC-128): açılışta WrongStack MCP sunucularının AYARDA devre dışı/tanımsız olduğu söylenir.
 *
 * Olay: 14 Ekim'de OPS penceresinin WrongStack bağlantı sorunu `disabledMcpjsonServers`'tan çıktı ve açılışta hiçbir
 * satır görünmedi. Bu dosya üç durumu (devre dışı, çalışıyor/ayar yok, okunamıyor) hem modülde hem GERÇEK kancanın
 * açılış çıktısında ölçer. Koruma söküldüğünde (modül `disabledMcpjsonServers`'ı okumazsa ya da kanca satırı
 * eklemezse) devre dışı senaryoları kırmızıdır. Not: bağlantı durumunu ölçmez; o iş posta kutusu sayacındadır.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const MODUL = path.join(KOK, 'scripts', 'board', 'wrongstack-baglanti.cjs')
const KANCA = path.join(KOK, '.claude', 'hooks', 'session-board.cjs')
const wb = require_(MODUL) as {
  SUNUCULAR: string[]
  incele: (o: { cwd?: string; kok?: string; home?: string }) => {
    devreDisi: { ad: string; kaynak: string }[]
    tanimsiz: string[]
    okunamayan: { dosya: string; sebep: string }[]
    bakilanDosya: number
  }
  acilisSatiri: (s: ReturnType<typeof wb.incele>) => string
  uyariVar: (s: ReturnType<typeof wb.incele>) => boolean
}

const UUID = '5a1c0128-0000-4000-8000-000000000128'
const temizlenecek: string[] = []

function ortam(opts: { yerel?: unknown; mcp?: unknown | null; kullanici?: unknown; bozukYerel?: boolean } = {}) {
  const tmp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'arc128-'))
  temizlenecek.push(tmp)
  const cwd = path.join(tmp, 'proje')
  const home = path.join(tmp, 'home')
  fs.mkdirSync(path.join(cwd, '.claude'), { recursive: true })
  fs.mkdirSync(path.join(home, '.claude'), { recursive: true })
  const mcp =
    opts.mcp === undefined
      ? { mcpServers: Object.fromEntries(wb.SUNUCULAR.map((a) => [a, { command: 'node' }])) }
      : opts.mcp
  if (mcp !== null) fs.writeFileSync(path.join(cwd, '.mcp.json'), JSON.stringify(mcp))
  if (opts.bozukYerel) fs.writeFileSync(path.join(cwd, '.claude', 'settings.local.json'), '{ bozuk')
  else if (opts.yerel !== undefined) fs.writeFileSync(path.join(cwd, '.claude', 'settings.local.json'), JSON.stringify(opts.yerel))
  if (opts.kullanici !== undefined) fs.writeFileSync(path.join(home, '.claude.json'), JSON.stringify(opts.kullanici))
  return { tmp, cwd, home }
}

afterEach(() => {
  while (temizlenecek.length) fs.rmSync(temizlenecek.pop() as string, { recursive: true, force: true })
})

describe('INV-WS-BAGLANTI-1 · modül', () => {
  it('ayar yok, dört sunucu .mcp.json\'da tanımlı: temiz satır', () => {
    const { cwd, home } = ortam()
    const s = wb.incele({ cwd, kok: cwd, home })
    expect(s.devreDisi).toEqual([])
    expect(s.tanimsiz).toEqual([])
    expect(wb.uyariVar(s)).toBe(false)
    expect(wb.acilisSatiri(s)).toContain('4/4 sunucu tanimli, devre disi yok')
  })

  it('settings.local.json disabledMcpjsonServers içindeki sunucu adıyla ve kaynağıyla söylenir', () => {
    const { cwd, home } = ortam({ yerel: { disabledMcpjsonServers: ['wrongstack-kanban', 'baska-sunucu'] } })
    const s = wb.incele({ cwd, kok: cwd, home })
    expect(s.devreDisi).toEqual([{ ad: 'wrongstack-kanban', kaynak: 'settings.local.json disabledMcpjsonServers' }])
    expect(wb.uyariVar(s)).toBe(true)
    const satir = wb.acilisSatiri(s)
    expect(satir).toContain('WRONGSTACK MCP DEVRE DISI: wrongstack-kanban (settings.local.json disabledMcpjsonServers)')
    expect(satir).not.toContain('baska-sunucu')
  })

  it('~/.claude.json içindeki proje kaydının disabledMcpjsonServers listesi de okunur', () => {
    const o = ortam()
    fs.writeFileSync(
      path.join(o.home, '.claude.json'),
      JSON.stringify({ projects: { [o.cwd.split(path.sep).join('/')]: { disabledMcpjsonServers: ['wrongstack-sage'] } } }),
    )
    const s = wb.incele({ cwd: o.cwd, kok: o.cwd, home: o.home })
    expect(s.devreDisi.map((d) => d.ad)).toEqual(['wrongstack-sage'])
    expect(s.devreDisi[0].kaynak).toContain('.claude.json')
  })

  it('.mcp.json\'da olmayan sunucu TANIMSIZ diye söylenir', () => {
    const { cwd, home } = ortam({ mcp: { mcpServers: { 'wrongstack-kanban': {}, 'wrongstack-sage': {} } } })
    const s = wb.incele({ cwd, kok: cwd, home })
    expect(s.tanimsiz).toEqual(['wrongstack-mailbox', 'wrongstack-codebase-index'])
    expect(wb.acilisSatiri(s)).toContain('TANIMSIZ: wrongstack-mailbox, wrongstack-codebase-index')
  })

  it('okunamayan/bozuk ayar dosyası TEMİZ sayılmaz: OLCULEMEDI', () => {
    const { cwd, home } = ortam({ bozukYerel: true })
    const s = wb.incele({ cwd, kok: cwd, home })
    expect(s.devreDisi).toEqual([])
    expect(s.okunamayan).toHaveLength(1)
    expect(wb.uyariVar(s)).toBe(true)
    expect(wb.acilisSatiri(s)).toContain('OLCULEMEDI')
    expect(wb.acilisSatiri(s)).not.toContain('devre disi yok')
  })
})

describe('INV-WS-BAGLANTI-1 · gerçek kanca', () => {
  function kancaKos(cwd: string, home: string): string {
    const env = { ...process.env, HOME: home, USERPROFILE: home }
    const r = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ session_id: UUID, cwd, source: 'startup', hook_event_name: 'SessionStart' }),
      env,
      encoding: 'utf8',
      windowsHide: true,
      timeout: 90_000,
    })
    expect(r.status, r.stderr).toBe(0)
    const cikti = JSON.parse(r.stdout) as { hookSpecificOutput: { additionalContext: string } }
    return cikti.hookSpecificOutput.additionalContext
  }

  it('devre dışı sunucu olan pencerede açılışta uyarı satırı görünür', () => {
    const { cwd, home } = ortam({ yerel: { disabledMcpjsonServers: ['wrongstack-mailbox'] } })
    const ctx = kancaKos(cwd, home)
    expect(ctx).toContain('WRONGSTACK MCP DEVRE DISI: wrongstack-mailbox (settings.local.json disabledMcpjsonServers)')
  })

  it('devre dışı sunucu yoksa açılışta temiz satır görünür', () => {
    const { cwd, home } = ortam()
    const ctx = kancaKos(cwd, home)
    expect(ctx).toContain('WRONGSTACK MCP: 4/4 sunucu tanimli, devre disi yok')
    expect(ctx).not.toContain('WRONGSTACK MCP DEVRE DISI')
  })
})
