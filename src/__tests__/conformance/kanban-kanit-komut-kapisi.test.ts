/**
 * INV-KANBAN-KANIT-KOMUT-1 — Kanban'a doğrulayıcıda KOŞMAYACAK komut kanıtı eklenemez (ARC-78).
 *
 * Kanca: .claude/hooks/kanban-kanit-yolu-kapisi.cjs · kural: .claude/hooks/kanban-kanit-yolu-kapisi.md
 * Kök sebep (OPS ölçtü 26 Ekim): doğrulayıcı güvenlik politikası bilerek dar; git, node, pnpm test:ilgili, boru,
 * mutlak yol Done anında reddedilir ama kart açılırken kabul ediliyordu.
 *
 * SENTINEL: paket kurulu görünüyorsa doğrulayıcının KENDİ validateCommand'ı ile karşılaştırılır; paket sürümü
 * kuralları değiştirirse bu test kırılır (kopya ayrışmasın).
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'kanban-kanit-yolu-kapisi.cjs')

interface Kapi {
  incele: (girdi: unknown, ekler?: string[] | null) => string | null
  komutSorunu: (komut: string, ekler: string[] | null) => string | null
  izinEkleriniOku: (env: Record<string, string | undefined>, kok: string) => string[] | null
}
const k = gerek(KANCA) as Kapi

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const GH = ['+gh'] // .mcp.json'daki canlı ayar
const cagri = (girdi: Record<string, unknown>) => ({ tool_name: ARAC, tool_input: girdi })
const komutKaniti = (komut: string, tip = 'command', eylem = 'add_check') =>
  k.incele(cagri({ action: eylem, checkType: tip, checkNotes: komut }), GH)

const GECERLI = [
  'gh api repos/peckop/venthub-hvac-esite/pulls/2079/merge',
  'pnpm exec vitest run src/__tests__/conformance/kanca-pencere-kilidi.test.ts',
  'pnpm exec vitest run --root . src/a.test.ts src/b.test.tsx',
  'pnpm exec tsc --noEmit --project tsconfig.json',
  'test -f docs/audits/x.md',
  'test -d docs',
  'pwd',
  'true',
]
const GECERSIZ: [string, string][] = [
  ['git log -1 --format=%h', 'izin listesinde yok'],
  ['node -e "console.log(1)"', 'ENGELLİ'],
  ['node scripts/board/board.cjs who', 'ENGELLİ'],
  ['pnpm test:ilgili', 'pnpm doğrulayıcıda engelli'],
  ['pnpm vitest src/a.test.ts --run', 'pnpm doğrulayıcıda engelli'],
  ['pnpm exec eslint src', 'yalnız yerel tsc ve vitest'],
  ['pnpm exec vitest run src/a.ts', '*.test.*'],
  ['pnpm exec vitest src/a.test.ts', '`run` alt komutu'],
  ['pnpm exec vitest run /abs/a.test.ts', '*.test.*'],
  ['pnpm exec vitest run ../a.test.ts', '*.test.*'],
  ['gh api repos/x/y/pulls/1/merge && echo ok', 'kabuk işleci'],
  ['gh api repos/x/y | grep merged', 'kabuk işleci'],
  ['gh api repos/x/y > cikti.txt', 'kabuk işleci'],
  ['gh pr view $(git rev-parse HEAD)', 'kabuk işleci'],
  ['gh api $TOKEN', 'ortam değişkeni'],
  ['gh api %TEMP%', 'ortam değişkeni'],
  ['curl https://example.com', 'ENGELLİ'],
  ['bash -c true', 'ENGELLİ'],
  ['rm -rf tmp', 'ENGELLİ'],
  ['C:/tools/gh.exe api x', 'çıplak ad'],
  ['./gh api x', 'çıplak ad'],
  ['test -s dosya.txt', '`test -s` desteklenmez'],
  ['test -f C:/tmp/x.txt', 'proje-göreli'],
  ['test -f ../x.txt', 'proje-göreli'],
  ['pwd -P', 'tek başına'],
  ['gh api "x', 'kapatılmamış tırnak'],
  ['gh api x\ngit push', 'satır sonu'],
]

describe('INV-KANBAN-KANIT-KOMUT-1 · geçerli ve geçersiz komut kanıtı', () => {
  it('doğrulayıcıda koşan dört biçim ve yardımcı komutlar geçer', () => {
    for (const c of GECERLI) expect(komutKaniti(c), c).toBeNull()
  })

  it('koşmayacak komutlar reddedilir ve sebep söylenir', () => {
    for (const [c, sebep] of GECERSIZ) {
      const m = komutKaniti(c)
      expect(m, c).not.toBeNull()
      expect(m, c).toContain(sebep)
    }
  })

  it('ret metni dört geçerli biçimi önerir', () => {
    const m = komutKaniti('git log -1') ?? ''
    for (const parca of ['gh api repos/peckop', 'pnpm exec vitest run', 'file_matches', 'checkType manual', 'KOŞMAZ']) {
      expect(m, parca).toContain(parca)
    }
  })

  it('update_check aynı kuralla denetlenir; test (kalıp eklentisi), manual, metric karışılmaz', () => {
    expect(komutKaniti('src/__tests__/a.test.ts', 'test')).toBeNull() // `test` türü komut değil, test kalıbı (TestPlugin)
    expect(komutKaniti('git log', 'command', 'update_check')).not.toBeNull()
    expect(komutKaniti('git log', 'manual')).toBeNull()
    expect(komutKaniti('git log', 'metric')).toBeNull()
    expect(k.incele(cagri({ action: 'add_note', checkType: 'command', checkNotes: 'git log' }), GH)).toBeNull()
    expect(k.incele(cagri({ action: 'add_check', checkType: 'command', checkNotes: '' }), GH)).toBeNull()
  })

  it('komut checkNotes yoksa checkDescription\'dan okunur', () => {
    expect(k.incele(cagri({ action: 'add_check', checkType: 'command', checkDescription: 'git log' }), GH)).not.toBeNull()
    expect(k.incele(cagri({ action: 'add_check', checkType: 'command', checkDescription: 'gh api x' }), GH)).toBeNull()
  })

  it('izin listesi bilinmiyorsa (null) izin denetlenmez ama kesin engeller sürer; liste "gh" yoksa gh reddedilir', () => {
    expect(k.komutSorunu('git log', null)).toBeNull() // liste bilinmiyor: git engel listesinde değil, geçer
    expect(k.komutSorunu('node x.js', null)).not.toBeNull()
    expect(k.komutSorunu('gh api x', null)).toBeNull()
    expect(k.komutSorunu('gh api x', [])).toContain('izin listesinde yok')
    expect(k.komutSorunu('git log', ['+git'])).toBeNull() // listeye eklenirse geçer (biz EKLEMEYİZ; kural böyle)
    expect(k.komutSorunu('gh api x', ['+gh', '-gh'])).toContain('izin listesinde yok')
  })
})

describe('INV-KANBAN-KANIT-KOMUT-1 · izin listesi sunucuyla aynı kaynaktan', () => {
  it('ortam değişkeni önce, yoksa .mcp.json wrongstack-kanban env, yoksa boş, dosya yoksa null', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'kanit-komut-'))
    try {
      expect(k.izinEkleriniOku({ WRONGSTACK_KANBAN_VERIFIER_COMMANDS: '+gh, +tsc' }, gecici)).toEqual(['+gh', '+tsc'])
      expect(k.izinEkleriniOku({}, gecici)).toBeNull() // .mcp.json yok
      fs.writeFileSync(
        path.join(gecici, '.mcp.json'),
        JSON.stringify({ mcpServers: { 'wrongstack-kanban': { env: { WRONGSTACK_KANBAN_VERIFIER_COMMANDS: '+gh' } } } }),
      )
      expect(k.izinEkleriniOku({}, gecici)).toEqual(['+gh'])
      fs.writeFileSync(path.join(gecici, '.mcp.json'), JSON.stringify({ mcpServers: { 'wrongstack-kanban': {} } }))
      expect(k.izinEkleriniOku({}, gecici)).toEqual([])
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true })
    }
  })

  it('depodaki .mcp.json bugün yalnız gh ekliyor (git/node/pnpm EKLENMEZ)', () => {
    const ekler = k.izinEkleriniOku({}, KOK)
    expect(ekler).toEqual(['+gh'])
  })
})

describe('INV-KANBAN-KANIT-KOMUT-1 · gerçek kanca süreci', () => {
  const kos = (girdi: unknown) =>
    spawnSync(process.execPath, [KANCA], { input: JSON.stringify(girdi), encoding: 'utf8', windowsHide: true, timeout: 15_000, env: { ...process.env, CLAUDE_PROJECT_DIR: KOK, WRONGSTACK_KANBAN_VERIFIER_COMMANDS: '' } })

  it('git komutunda deny JSON, geçerli komutta sessiz çıkış 0', () => {
    const kotu = kos(cagri({ action: 'add_check', checkType: 'command', checkNotes: 'git log -1' }))
    expect(kotu.status).toBe(0)
    const c = JSON.parse(kotu.stdout) as { hookSpecificOutput: { permissionDecision: string; permissionDecisionReason: string } }
    expect(c.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(c.hookSpecificOutput.permissionDecisionReason).toContain('ARC-78')
    expect(kos(cagri({ action: 'add_check', checkType: 'command', checkNotes: 'gh api repos/peckop/venthub-hvac-esite/pulls/1/merge' }))).toMatchObject({ status: 0, stdout: '' })
    expect(kos(cagri({ action: 'add_check', checkType: 'manual', checkNotes: 'git log' }))).toMatchObject({ status: 0, stdout: '' })
  })
})

describe('INV-KANBAN-KANIT-KOMUT-1 · SABOTAJ: kapı gevşerse test kırılır', () => {
  it('engel listesi boşaltılmış / operatör denetimi kaldırılmış kopya git-dışı reddi geçirir', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'kanit-sabotaj-'))
    try {
      const kaynak = fs.readFileSync(KANCA, 'utf8')
      const sabotaj = (ad: string, degis: (s: string) => string) => {
        const degisti = degis(kaynak)
        expect(degisti, ad).not.toBe(kaynak)
        const f = path.join(gecici, `${ad}.cjs`)
        fs.writeFileSync(f, degisti)
        return gerek(f) as Kapi
      }
      // 1) node artık engelli değil
      const s1 = sabotaj('engel', (s) => s.replace("'deno', 'node',", "'deno',"))
      expect(s1.komutSorunu('node -e 1', GH)).toContain('izin listesinde yok') // liste yakalar ama engel sebebi kayboldu
      expect(k.komutSorunu('node -e 1', GH)).toContain('ENGELLİ') // sağlam kapı engel sebebiyle reddeder
      // 2) boru denetimi kaldırılmış
      const s2 = sabotaj('operator', (s) => s.replace('if (SHELL_OPERATOR_RE.test(hedef)) return', 'if (false) return'))
      expect(s2.komutSorunu('gh api x | grep y', GH)).toBeNull() // sabotajlı kapı boruyu geçirir
      expect(k.komutSorunu('gh api x | grep y', GH)).not.toBeNull()
      // 3) pnpm kısıtı kaldırılmış
      const s3 = sabotaj('pnpm', (s) => s.replace("if (taban === 'pnpm') return pnpmSorunu(tokens)", ''))
      expect(s3.komutSorunu('pnpm test:ilgili', GH)).not.toContain('pnpm doğrulayıcıda engelli')
      expect(k.komutSorunu('pnpm test:ilgili', GH)).toContain('pnpm doğrulayıcıda engelli')
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true })
    }
  })
})

// ── SENTINEL: doğrulayıcının kendi kurallarıyla karşılaştırma (paket kuruluysa) ──
// VH_KANBAN_PAKET: paketi başka bir kurulumdan göstermek için (worktree'de tools/wrongstack-mcp/node_modules yoksa).
const PAKET =
  process.env.VH_KANBAN_PAKET ||
  path.join(KOK, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'kanban-mcp', 'node_modules', '@wrongstack', 'kanban', 'dist', 'index.js')
const PAKET_VAR = fs.existsSync(PAKET)

describe.skipIf(!PAKET_VAR)('INV-KANBAN-KANIT-KOMUT-1 · sentinel: doğrulayıcının kendi validateCommand\'ı', () => {
  it('doğrulayıcının REDDETTİĞİ hiçbir şeyi kapı geçirmez; geçerli biçimlerde ikisi de kabul eder', async () => {
    const paket = (await import(pathToFileURL(PAKET).href)) as {
      validateCommand: (komut: string, cfg: unknown) => string | null
      DEFAULT_BLOCKED_COMMANDS: string[]
      DEFAULT_ALLOWED_COMMANDS: string[]
    }
    // Engel listesi paketten ALINIR: kopyamız (ENGELLI) paketle aynı olmalı.
    const kendi = (gerek(KANCA) as { ENGELLI: string[] }).ENGELLI
    expect([...kendi].sort()).toEqual([...paket.DEFAULT_BLOCKED_COMMANDS].sort())
    expect([...paket.DEFAULT_ALLOWED_COMMANDS].sort()).toEqual(['false', 'pwd', 'test', 'true'])
    const cfg = { allow: new Set([...paket.DEFAULT_ALLOWED_COMMANDS, 'gh']), block: new Set(paket.DEFAULT_BLOCKED_COMMANDS) }
    for (const c of GECERLI) {
      expect(paket.validateCommand(c, cfg), `doğrulayıcı: ${c}`).toBeNull()
      expect(k.komutSorunu(c, GH), `kapı: ${c}`).toBeNull()
    }
    for (const [c] of GECERSIZ) {
      if (paket.validateCommand(c, cfg) !== null) {
        expect(k.komutSorunu(c, GH), `doğrulayıcı reddediyor, kapı geçirmemeli: ${c}`).not.toBeNull()
      }
    }
  })
})
