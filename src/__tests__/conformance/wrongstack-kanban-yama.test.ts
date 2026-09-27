// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * INV-WRONGSTACK-KANBAN-YAMA-1 · kanban yazma dönüşü tüm panoyu taşımaz (karar 144, REC-391 K1).
 *
 * NİÇİN VAR (2026-09-27, ÖLÇÜLDÜ): `kanban-mcp` `callTool` sonucu `{ content: result }` diye
 * olduğu gibi döndürüyor; aracın kendi özet kesicisi (`kanbanTool.serialize`) MCP yolunda hiç
 * çağrılmıyor. 47 KB'lık panoda her kart yazması 48,6 KB döndü; §6.1 pilotu bu bedelle durdu
 * (09-18'den beri başlatılan 52 kaydın 9'unun kartı vardı). Yama `yamalar/` altında, README
 * kurulumunda uygulanır. Bu kapı üç şeyi tutar:
 *   1. yama adı kilitli sürümle aynı (sürüm yükselince yama sessizce boşa düşmez, KIRMIZI verir)
 *   2. README kurulumu yamayı uygular (npm ci yamayı siler)
 *   3. kurulum varsa (yerel): yama UYGULANMIŞ ve kesici yazmayı küçültür, okumayı değiştirmez
 */
const KOK = process.cwd()
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')
const YAMALAR = path.join(ARAC, 'yamalar')
const KURULU = fs.existsSync(path.join(ARAC, 'node_modules', '@wrongstack', 'kanban-mcp', 'dist', 'index.js'))

const yamalar = fs.readdirSync(YAMALAR).filter((d) => d.endsWith('.patch'))
const deps = (JSON.parse(fs.readFileSync(path.join(ARAC, 'package.json'), 'utf8')) as { dependencies: Record<string, string> })
  .dependencies

interface Gorev {
  id: string
  columnId: string
  title: string
}
interface Pano {
  id: string
  title: string
  columns: { id: string; title: string }[]
  tasks: Gorev[]
}
interface KanbanArac {
  serialize: (output: { ok: boolean; message: string; board: Pano; task: Gorev }, input: { action: string }) => string
}

describe('INV-WRONGSTACK-KANBAN-YAMA-1 · kanban yazma dönüşü özetlenir', () => {
  it('en az bir yama var ve her yamanın adı kilitli paket sürümüyle aynı', () => {
    expect(yamalar.length, 'yamalar/ boş').toBeGreaterThan(0)
    for (const y of yamalar) {
      const m = y.match(/^([a-z0-9-]+?)-(\d+\.\d+\.\d+)-/)
      expect(m, `yama adı <paket>-<sürüm>-… biçiminde değil: ${y}`).not.toBeNull()
      const [, paket, surum] = m as RegExpMatchArray
      expect(deps[`@wrongstack/${paket}`], `${y}: kilitli sürüm farklı — yama yeniden ölçülmeli`).toBe(surum)
    }
  })

  it('kanban yaması başarılı sonucu kesiciden geçirir, hata sonucunu olduğu gibi bırakır', () => {
    const y = fs.readFileSync(path.join(YAMALAR, 'kanban-mcp-1.0.19-ozet-donus.patch'), 'utf8')
    expect(y).toMatch(/^-\s+return \{ content: result, isError: failed \};$/m)
    expect(y).toMatch(/^\+\s+return \{ content: failed \? result : JSON\.parse\(kanbanTool\.serialize\(result, args\)\), isError: failed \};$/m)
    expect(y).toMatch(/^\+\+\+ b\/tools\/wrongstack-mcp\/node_modules\/@wrongstack\/kanban-mcp\/dist\/index\.js$/m)
  })

  it('README kurulumu npm ci ardından yamaları uygular', () => {
    const r = fs.readFileSync(path.join(ARAC, 'README.md'), 'utf8')
    const ci = r.indexOf('npm ci --ignore-scripts')
    const uygula = r.indexOf('git apply "$y"')
    expect(ci, 'kurulum satırı yok').toBeGreaterThan(-1)
    expect(uygula, 'yama uygulama satırı yok').toBeGreaterThan(ci)
  })

  it.skipIf(!KURULU)('kurulumda yama UYGULANMIŞ (npm ci sonrası atlanmamış)', () => {
    for (const y of yamalar) {
      const r = spawnSync('git', ['apply', '--reverse', '--check', path.join('tools', 'wrongstack-mcp', 'yamalar', y)], {
        cwd: KOK,
        encoding: 'utf8',
      })
      expect(r.status, `${y} uygulanmamış — README kurulum adımı: ${r.stderr}`).toBe(0)
    }
  })

  /** Ayırt edici çift: aynı büyük pano, yazma eyleminde KÜÇÜLÜR, okuma eyleminde AYNI kalır. */
  it.skipIf(!KURULU)('kesici yazmada panoyu özetler (≤ 3 KB), get_board çıktısını değiştirmez', async () => {
    const modul = pathToFileURL(path.join(ARAC, 'node_modules', '@wrongstack', 'tools', 'dist', 'kanban.js')).href
    const { kanbanTool } = (await import(modul)) as { kanbanTool: KanbanArac }
    const columns = ['backlog', 'todo', 'in-progress', 'review', 'done'].map((id) => ({ id, title: id }))
    const tasks: Gorev[] = Array.from({ length: 60 }, (_, i) => ({
      id: `t${i}`,
      columnId: columns[i % 5].id,
      title: `REC-${i} ${'x'.repeat(600)}`,
    }))
    const board: Pano = { id: 'b', title: 'pano', columns, tasks }
    const cikti = { ok: true, message: 'Task added.', board, task: tasks[0] }
    const ham = JSON.stringify(cikti).length
    expect(ham).toBeGreaterThan(30_000)

    const yazma = JSON.stringify(JSON.parse(kanbanTool.serialize(cikti, { action: 'add_task' })))
    expect(yazma.length, 'yazma dönüşü hâlâ tüm panoyu taşıyor').toBeLessThan(3_000)
    expect(yazma).toContain('"totalTasks":60')

    const okuma = JSON.stringify(JSON.parse(kanbanTool.serialize(cikti, { action: 'get_board' })))
    expect(okuma.length, 'okuma dönüşü değişti').toBe(ham)
  })
})
