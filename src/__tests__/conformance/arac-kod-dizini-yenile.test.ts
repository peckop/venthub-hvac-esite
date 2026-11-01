import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ARAC-KOD-DIZINI-1 · kod dizini tek seferlik yenileme betiği (ARC-196/ARC-208).
 *
 * Gerçek codebase-index-mcp AÇILMAZ (dizine yazmasın): ayrı bir sahte MCP süreci (stdio JSON-RPC) kullanılır.
 * Sabotaj kolları: araç hatası, süreç beklenmedik kapanışı, zaman aşımı → hiçbiri sessiz yeşil vermez.
 */
const req = createRequire(import.meta.url)
const BETIK = path.resolve(__dirname, '../../../tools/wrongstack-mcp/kod-dizini-yenile.cjs')
const M = req(BETIK) as {
  yenile: (p: {
    cli: string
    kok: string
    sureMs?: number
    calistir?: (kok: string, cli: string) => ReturnType<typeof spawn>
  }) => Promise<{
    onceki: { totalSymbols?: number } | null
    sonraki: { totalSymbols?: number } | null
    indeks: { filesIndexed?: number; errors?: unknown[] } | null
    sureMs: number
  }>
  ozet: (s: unknown) => string
  govde: (r: unknown) => unknown
}

/** Sahte MCP: `mod` ortam değişkeniyle davranışı seçilir. */
const SAHTE = `
let sayac = 0
const mod = process.env.SAHTE_MOD || 'iyi'
let tampon = ''
process.stdin.on('data', (d) => {
  tampon += d
  let i
  while ((i = tampon.indexOf('\\n')) >= 0) {
    const m = JSON.parse(tampon.slice(0, i)); tampon = tampon.slice(i + 1)
    if (m.id == null) continue
    const yanit = (result) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: m.id, result }) + '\\n')
    if (m.method === 'initialize') return yanit({ capabilities: {} })
    if (m.method === 'tools/call') {
      if (mod === 'sus') return
      if (mod === 'kapan') process.exit(3)
      const ad = m.params.name
      if (ad === 'codebase_stats') { sayac++; return yanit({ content: [{ type: 'text', text: JSON.stringify({ totalSymbols: sayac === 1 ? 100 : 900, totalFiles: 10, sizeBytes: 1048576, lastIndexed: 1789642878314, byLang: { ts: 100, md: 800 } }) }] }) }
      if (ad === 'codebase_index') {
        if (mod === 'arac-hatasi') return yanit({ isError: true, content: [{ type: 'text', text: 'ENOSPC' }] })
        return yanit({ content: [{ type: 'text', text: JSON.stringify({ filesIndexed: 7, errors: [] }) }] })
      }
    }
  }
})
`

function sahteCalistir(mod: string) {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-kod-dizini-'))
  const dosya = path.join(dizin, 'sahte-mcp.cjs')
  fs.writeFileSync(dosya, SAHTE)
  return {
    dizin,
    calistir: () => spawn(process.execPath, [dosya], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, SAHTE_MOD: mod } }),
  }
}

describe('INV-ARAC-KOD-DIZINI-1 · yenileme akışı (sahte MCP)', () => {
  it('önce stats → index (force YOK) → sonra stats; önce/sonra farkı ve süre döner', async () => {
    const s = sahteCalistir('iyi')
    const r = await M.yenile({ cli: 'x', kok: s.dizin, calistir: s.calistir })
    fs.rmSync(s.dizin, { recursive: true, force: true })
    expect(r.onceki?.totalSymbols).toBe(100)
    expect(r.sonraki?.totalSymbols).toBe(900)
    expect(r.indeks).toEqual({ filesIndexed: 7, errors: [] })
    expect(r.sureMs).toBeGreaterThanOrEqual(0)
  })

  it('SABOTAJ: araç hatası (isError) reddedilir — sessiz yeşil yok', async () => {
    const s = sahteCalistir('arac-hatasi')
    await expect(M.yenile({ cli: 'x', kok: s.dizin, calistir: s.calistir })).rejects.toThrow(/codebase_index.*ENOSPC/)
    fs.rmSync(s.dizin, { recursive: true, force: true })
  })

  it('SABOTAJ: süreç yarıda kapanırsa reddedilir', async () => {
    const s = sahteCalistir('kapan')
    await expect(M.yenile({ cli: 'x', kok: s.dizin, calistir: s.calistir })).rejects.toThrow(/beklenmedik kapandı/)
    fs.rmSync(s.dizin, { recursive: true, force: true })
  })

  it('SABOTAJ: cevap vermeyen süreç zaman aşımıyla reddedilir ve ÖLDÜRÜLÜR', async () => {
    const s = sahteCalistir('sus')
    let surec: ReturnType<typeof spawn> | null = null
    const calistir = () => (surec = s.calistir())
    await expect(M.yenile({ cli: 'x', kok: s.dizin, sureMs: 400, calistir })).rejects.toThrow(/zaman aşımı/)
    await new Promise((r) => setTimeout(r, 300))
    expect(surec!.killed || surec!.exitCode !== null || surec!.signalCode !== null).toBe(true)
    fs.rmSync(s.dizin, { recursive: true, force: true })
  })
})

describe('INV-ARAC-KOD-DIZINI-1 · yardımcılar ve sözleşme', () => {
  it('ozet: sembol/dosya/MB/tarih; boş girdi "ölçülemedi"', () => {
    expect(M.ozet({ totalSymbols: 9, totalFiles: 2, sizeBytes: 2097152, lastIndexed: Date.UTC(2026, 9, 25, 10, 5) })).toBe(
      '9 sembol · 2 dosya · 2.0 MB · son dizinleme 2026-10-25 10:05',
    )
    expect(M.ozet(null)).toBe('ölçülemedi')
  })

  it('govde: JSON metni ayrıştırılır, bozuk/eksik null', () => {
    expect(M.govde({ content: [{ text: '{"a":1}' }] })).toEqual({ a: 1 })
    expect(M.govde({ content: [{ text: 'json degil' }] })).toBeNull()
    expect(M.govde(undefined)).toBeNull()
  })

  it('--kuru süreç açmadan plan yazar ve 0 çıkar', () => {
    const r = req('node:child_process').spawnSync(process.execPath, [BETIK, '--kuru'], { encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect(r.stdout).toContain('--writable')
    expect(r.stdout).toContain('force yok')
  })

  it('kaynak sözleşmesi: force parametresi geçilmez, .mcp.json/ayar dosyasına yazılmaz', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    expect(kaynak).not.toMatch(/force\s*:\s*true/)
    expect(kaynak).not.toMatch(/writeFileSync|appendFileSync|\.mcp\.json['"]\s*,\s*['"]w/)
  })
})
