/**
 * INV-ENV-YAZMA-1 — `.env` ailesine Bash ile yeni içerik yazmak Recep'e sorulur (REC-410 S3).
 *
 * Kanca: .claude/hooks/env-yazma-kapisi.cjs · cetvel: docs/standards/izin-kapilari-standard.md §S3.
 * Ölçüm 09-28: `.env` geçen 795 gerçek Bash komutundan 3'ü sorulur, üçü de yeni sır içeriği.
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
interface Kapi {
  incele: (komut: string, cwd: string, ana: string | null) => string | null
}
const k = gerek(path.join(KOK, '.claude', 'hooks', 'env-yazma-kapisi.cjs')) as Kapi
const ANA = 'C:/Users/alize/venthub-hvac'
const WT = 'C:/tmp/vh-arac-2'
const sor = (komut: string, cwd = WT, ana: string | null = ANA) => k.incele(komut, cwd, ana) !== null

describe('INV-ENV-YAZMA-1', () => {
  it('geçer: okuma, .env.example, worktree\'ye aynı adla kopya, worktree kopyasını silme', () => {
    expect(sor('cat .env.local | grep SUPABASE')).toBe(false)
    expect(sor('printf "A=1" > .env.example')).toBe(false)
    expect(sor(`cp ${ANA}/.env ${WT}/.env && cp ${ANA}/.env.local ${WT}/.env.local`)).toBe(false)
    expect(sor(`rm ${WT}/.env ${WT}/.env.local`)).toBe(false)
    expect(sor('git status')).toBe(false)
  })

  it('sorulur: yeni içerik (echo/sed/tee), farklı adla kopya, ana depoda her yazma ve silme', () => {
    expect(sor('echo "SECRET=x" >> .env.local')).toBe(true)
    expect(sor('sed -i "s/A=1/A=2/" .env')).toBe(true)
    expect(sor('tee -a .env.production < yeni.txt')).toBe(true)
    expect(sor(`cp ${ANA}/.env.example ${WT}/.env`)).toBe(true) // şablondan yeni sır dosyası
    expect(sor('cp .env.example .env', ANA)).toBe(true) // ana depoda
    expect(sor('rm .env.local', ANA)).toBe(true) // ana deponun sırrı silinir
    expect(sor('echo K=1 >> ~/.claude/.env.global')).toBe(true)
  })

  it('ana depo çözülemezse her hedef ana depo sayılır (güvenli yön)', () => {
    expect(sor(`rm ${WT}/.env`, WT, null)).toBe(true)
  })

  it('settings.json Bash kancaları arasında kayıtlı', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const bash = (ayar.hooks.PreToolUse as Array<{ matcher: string; hooks: Array<{ command: string }> }>).filter((g) => g.matcher === 'Bash')
    expect(bash.some((g) => g.hooks.some((h) => h.command.includes('env-yazma-kapisi.cjs')))).toBe(true)
  })
})
