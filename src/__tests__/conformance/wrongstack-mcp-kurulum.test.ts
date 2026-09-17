// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WRONGSTACK-MCP-1 — üçüncü taraf MCP sunucuları KİLİTLİ, BETİKSİZ ve DAR yüzeyle kalır.
 *
 * NİÇİN VAR (REC-345 Kova C, 2026-09-17): WrongStack sage-mcp + codebase-index-mcp her Claude
 * penceresinde çalışan başkasının kodu. `npx -y paket@sürüm` üst paketi sabitler ama 25 geçişli
 * bağımlılığı her çözümde yeniden çözer ve kurulum betiklerini çalıştırır. Kurulum bu yüzden
 * lock commit'li + `npm ci --ignore-scripts`. Bu kapı o kararın geri kaçmasını engeller:
 *   1. sürümler caret/tilde'siz, lock var ve package.json ile aynı sürümü kilitliyor
 *   2. lock'ta kurulum betikli paket YOK (çıkarsa bilinçli karar ister)
 *   3. .mcp.json npx/uzak paket çağırmıyor, yerel kilitli yolu çağırıyor
 *   4. `--writable` YALNIZ sage'de; kod dizini salt-okuma
 *   5. kayıtlı sunucu = envanter satırı (envantersiz araç bitmemiş araçtır)
 */
const KOK = process.cwd()
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')

type Paket = { dependencies?: Record<string, string> }
type Kilit = { packages: Record<string, { version?: string; hasInstallScript?: boolean }> }
type McpSunucu = { command?: string; args?: string[] }
type Mcp = { mcpServers?: Record<string, McpSunucu> }

const json = <T>(p: string): T => JSON.parse(fs.readFileSync(p, 'utf8')) as T

describe('INV-WRONGSTACK-MCP-1 · ucuncu taraf MCP kilitli ve dar', () => {
  const paket = json<Paket>(path.join(ARAC, 'package.json'))
  const deps = paket.dependencies ?? {}

  it('surumler sabit ve lock ayni surumu kilitliyor', () => {
    const adlar = Object.keys(deps)
    expect(adlar.sort(), 'beklenen iki paket degil').toEqual(['@wrongstack/codebase-index-mcp', '@wrongstack/sage-mcp'])
    for (const [ad, surum] of Object.entries(deps)) {
      expect(surum, `${ad} surumu sabit degil (caret/tilde/aralik)`).toMatch(/^\d+\.\d+\.\d+$/)
    }
    const kilitYolu = path.join(ARAC, 'package-lock.json')
    expect(fs.existsSync(kilitYolu), 'package-lock.json YOK — gecisli bagimliliklar kilitsiz').toBe(true)
    const kilit = json<Kilit>(kilitYolu)
    for (const [ad, surum] of Object.entries(deps)) {
      expect(kilit.packages[`node_modules/${ad}`]?.version, `${ad} lock ta farkli surum`).toBe(surum)
    }
  })

  it('lock ta kurulum betikli paket YOK', () => {
    const kilit = json<Kilit>(path.join(ARAC, 'package-lock.json'))
    const betikli = Object.entries(kilit.packages)
      .filter(([ad, p]) => ad !== '' && p.hasInstallScript)
      .map(([ad]) => ad)
    expect(betikli, 'kurulum betikli paket girdi — --ignore-scripts ile calisiyor mu OLC, sonra bilincli karar').toEqual([])
  })

  it('.mcp.json yerel kilitli yolu cagiriyor, npx yok, writable yalniz sage', () => {
    const mcp = json<Mcp>(path.join(KOK, '.mcp.json'))
    const s = mcp.mcpServers ?? {}
    const sage = s['wrongstack-sage']
    const dizin = s['wrongstack-codebase-index']
    expect(sage, 'wrongstack-sage kaydi yok').toBeDefined()
    expect(dizin, 'wrongstack-codebase-index kaydi yok').toBeDefined()
    for (const [ad, sunucu] of [['wrongstack-sage', sage], ['wrongstack-codebase-index', dizin]] as const) {
      const cagri = [sunucu?.command ?? '', ...(sunucu?.args ?? [])].join(' ')
      expect(cagri, `${ad} npx/uzak paket cagiriyor`).not.toMatch(/\bnpx\b|\bpnpm dlx\b|\bbunx\b/)
      expect(cagri, `${ad} kilitli yerel yolu cagirmiyor`).toContain('tools/wrongstack-mcp/node_modules/@wrongstack/')
      expect(cagri, `${ad} mutlak yol tasiyor (kimlik sizintisi)`).not.toMatch(/[A-Za-z]:[\\/]|\/Users\/|\/home\//)
    }
    expect(sage?.args, 'sage --writable degil — hafiza yazamaz').toContain('--writable')
    expect(dizin?.args, 'kod dizini --writable — salt-okuma karari geri kacti').not.toContain('--writable')
  })

  it('envanterde satiri ve README de KAYNAK blogu var', () => {
    const env = fs.readFileSync(path.join(KOK, 'docs', 'audits', 'arac-envanteri-2026-09-07.md'), 'utf8')
    expect(env, 'envanterde tools/wrongstack-mcp satiri yok').toContain('tools/wrongstack-mcp/')
    const oku = fs.readFileSync(path.join(ARAC, 'README.md'), 'utf8')
    for (const b of ['**KAYNAK**', '**ALINAN**', '**BİZDEN**', '**ALINMAYAN**', 'MIT']) {
      expect(oku, `README de ${b} yok`).toContain(b)
    }
  })
})
