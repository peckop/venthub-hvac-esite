/**
 * INV-TARAYICI-PROFIL-2 — browser-use MCP araçları ve CLI'ı ayrı profil adresi olmadan çalışamaz.
 * Kaynak: .claude/hooks/tarayici-profil-kapisi.cjs (2026-09-23: adressiz çağrı Recep'in varsayılan profiline gider).
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const KANCA = path.resolve(__dirname, '../../../.claude/hooks/tarayici-profil-kapisi.cjs')
const { hukum, browserUseCagrisiMi } = require(KANCA) as {
  hukum: (g: unknown, o: Record<string, string | undefined>) => string | null
  browserUseCagrisiMi: (k: string) => boolean
}

const mcp = { tool_name: 'mcp__plugin_browser-use_browser-use__browser_exec', tool_input: { code: 'print(page_info())' } }
const bash = (command: string) => ({ tool_name: 'Bash', tool_input: { command } })

describe('INV-TARAYICI-PROFIL-2', () => {
  it('MCP araci: ortamda adres yoksa RED', () => {
    expect(hukum(mcp, {})).toMatch(/DURDURULDU/)
  })
  it('MCP araci: ayri profil adresi varsa GECER', () => {
    expect(hukum(mcp, { BU_CDP_URL: 'http://127.0.0.1:9333' })).toBeNull()
  })
  it('MCP araci: 9222 adresi RED', () => {
    expect(hukum(mcp, { BU_CDP_URL: 'http://127.0.0.1:9222' })).toMatch(/9222/)
  })
  it('Bash: adressiz browser-use CLI RED', () => {
    expect(hukum(bash("uvx --python 3.12 browser-use@latest <<'PY'\nprint(1)\nPY"), {})).toMatch(/DURDURULDU/)
    expect(hukum(bash("browser-use <<'PY'\nprint(1)\nPY"), {})).toMatch(/DURDURULDU/)
  })
  it('Bash: komut satirinda adres varsa GECER', () => {
    expect(hukum(bash("BU_NAME=vhprofil BU_CDP_URL=http://127.0.0.1:9333 uvx --python 3.12 browser-use@latest <<'PY'\nprint(1)\nPY"), {})).toBeNull()
  })
  it('Bash: browser-use gecmeyen ya da yalniz arayan komutlar karismaz', () => {
    expect(hukum(bash('ls -la'), {})).toBeNull()
    expect(browserUseCagrisiMi('grep -rn browser-use docs/')).toBe(false)
    expect(browserUseCagrisiMi('git log --grep browser-use')).toBe(false)
  })
  it('baska MCP araci karismaz', () => {
    expect(hukum({ tool_name: 'mcp__plugin_playwright_playwright__browser_navigate', tool_input: {} }, {})).toBeNull()
  })
  it('gercek surec: stdin ile deny JSON uretir, bos stdin karismaz', () => {
    const env = { ...process.env, BU_CDP_URL: '', BU_CDP_WS: '', BU_BROWSER_ID: '' }
    const r = spawnSync(process.execPath, [KANCA], { input: JSON.stringify(mcp), env, encoding: 'utf8' })
    expect(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision).toBe('deny')
    const bos = spawnSync(process.execPath, [KANCA], { input: '', env, encoding: 'utf8' })
    expect(bos.stdout).toBe('')
  })
})
