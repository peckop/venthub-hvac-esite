/**
 * INV-SILME-BAGLANTI-1 (karar 88, 2026-09-23 olayı): özyinelemeli silme, silinen klasörün DIŞINI gösteren bir
 * bağlantıdan (junction/symlink) geçemez. 09-23'te `git worktree remove` bir worktree'nin node_modules
 * junction'ından geçip ana deponun node_modules'unu sildi. Kapı gerçek junction'la sınanır (sahte değil).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const KANCA = path.resolve(__dirname, '../../../.claude/hooks/silme-baglanti-kapisi.cjs')
const { silmeHedefleri } = require(KANCA) as { silmeHedefleri: (k: string) => { yol: string; bicim: string }[] }

let kok = ''
let hedef = ''
let agac = ''
let temiz = ''

function kos(komut: string) {
  const r = spawnSync(process.execPath, [KANCA], { input: JSON.stringify({ tool_input: { command: komut }, cwd: kok }), encoding: 'utf8' })
  return r.stdout.includes('"deny"') ? 'deny' : 'izin'
}

beforeAll(() => {
  kok = fs.mkdtempSync(path.join(os.tmpdir(), 'silme-kapisi-'))
  hedef = path.join(kok, 'ana-node_modules')
  fs.mkdirSync(path.join(hedef, '.bin'), { recursive: true })
  fs.writeFileSync(path.join(hedef, '.bin', 'vitest'), 'x')
  agac = path.join(kok, 'worktree')
  fs.mkdirSync(agac)
  fs.symlinkSync(hedef, path.join(agac, 'node_modules'), 'junction')
  // yalnız İÇ bağlantısı olan klasör (pnpm deseni) → tehlikesiz
  temiz = path.join(kok, 'temiz')
  fs.mkdirSync(path.join(temiz, '.pnpm', 'paket'), { recursive: true })
  fs.symlinkSync(path.join(temiz, '.pnpm', 'paket'), path.join(temiz, 'paket'), 'junction')
})

afterAll(() => {
  // önce bağlantılar (kendi kapımızın öğrettiği sıra), sonra klasör
  for (const b of [path.join(agac, 'node_modules'), path.join(temiz, 'paket')]) {
    try { fs.unlinkSync(b) } catch { try { fs.rmdirSync(b) } catch { /* yok */ } }
  }
  fs.rmSync(kok, { recursive: true, force: true })
})

describe('INV-SILME-BAGLANTI-1', () => {
  it('ayrıştırıcı dört silme biçimini ve iç içe cmd/powershell komutunu tanır', () => {
    expect(silmeHedefleri('git -C /c/x worktree remove /c/tmp/a').map((h) => h.yol)).toEqual(['/c/tmp/a'])
    expect(silmeHedefleri('rm -rf a b').map((h) => h.yol)).toEqual(['a', 'b'])
    expect(silmeHedefleri('cmd //c "rmdir /s /q C:\\tmp\\a"').map((h) => h.bicim)).toEqual(['rmdir /s'])
    expect(silmeHedefleri('powershell -Command "Remove-Item -Recurse -Force -Path C:\\tmp\\a"').map((h) => h.yol)).toEqual(['C:\\tmp\\a'])
    expect(silmeHedefleri('rm a.txt')).toEqual([])
    expect(silmeHedefleri('cmd //c "rmdir C:\\tmp\\a\\node_modules"')).toEqual([])
  })

  it('dışa giden junction içeren klasörü dört biçimde de DURDURUR (09-23 olayı)', () => {
    expect(kos(`git worktree remove "${agac}"`)).toBe('deny')
    expect(kos(`rm -rf "${agac}"`)).toBe('deny')
    expect(kos(`cmd //c "rmdir /s /q ${agac}"`)).toBe('deny')
    expect(kos(`powershell -Command "Remove-Item -Recurse -Force ${agac}"`)).toBe('deny')
    // bağlantının kendisini özyinelemeli silmek de durur
    expect(kos(`rm -rf "${path.join(agac, 'node_modules')}"`)).toBe('deny')
  })

  it('izin: bağlantıyı yalnız kaldıran özyinelemesiz rmdir; yalnız İÇ bağlantılı klasör; olmayan yol', () => {
    expect(kos(`cmd //c "rmdir ${path.join(agac, 'node_modules')}"`)).toBe('izin')
    expect(kos(`rm -rf "${temiz}"`)).toBe('izin')
    expect(kos(`rm -rf "${path.join(kok, 'yok')}"`)).toBe('izin')
    expect(fs.existsSync(path.join(hedef, '.bin', 'vitest'))).toBe(true) // kapı hiçbir şey silmedi
  })
})
