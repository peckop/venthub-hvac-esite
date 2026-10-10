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
 * çağrılmıyor. 47 KB'lık panoda her kart yazması 48,6 KB döndü.
 *
 * ⛔İKİNCİ DERS (aynı gün, #1437 sonrası): ilk yama yalnız `dist/index.js`'e uygulandı ve bu kapı
 * YEŞİLDİ — ama `.mcp.json`'ın çalıştırdığı `dist/cli.js` callTool'un KENDİ kopyasını taşır,
 * index.js'i yüklemez. Yeni açılışta add_task yine 58 KB döndü. Kapı "yama uygulandı mı" ve
 * "kesici çalışıyor mu"yu ölçüyordu, "sunucunun ÇALIŞTIRDIĞI dosya yamalı mı"yı ölçmüyordu.
 * Bu yüzden kol 4 hedef dosyayı `.mcp.json`'dan OKUR (elle yazılmış yol değil), kol 5 yamadaki
 * ifadenin KENDİSİNİ gerçek kesiciyle koşturur.
 *
 * Genişletme (karar 144, OPS onayı 09-27): okBoard dönen eylemler (add_note, update_task,
 * move_task, assign_task...) kartı döndürmüyordu; özetlenince hangi kartın değiştiği
 * kayboluyordu. Yama artık `args.taskId` kartını özetin yanına koyar.
 */
const KOK = process.cwd()
const ARAC = path.join(KOK, 'tools', 'wrongstack-mcp')
const YAMALAR = path.join(ARAC, 'yamalar')
const KANBAN_YAMASI = path.join(
  YAMALAR,
  fs.readdirSync(YAMALAR).find((d) => /^kanban-mcp-\d+\.\d+\.\d+-ozet-donus\.patch$/.test(d)) ?? 'kanban-mcp-YAMA-YOK.patch',
)
const KURULU = fs.existsSync(path.join(ARAC, 'node_modules', '@wrongstack', 'kanban-mcp', 'dist', 'cli.js'))
const YAMASIZ_SATIR = 'return { content: result, isError: failed };'

const yamalar = fs.readdirSync(YAMALAR).filter((d) => d.endsWith('.patch'))
// Kilitli sürüm package-lock.json'dan okunur (doğrudan bağımlılık olmayan sage gibi paketler de var —
// sage-mcp'nin geçişli bağımlılığı; package.json'da yalnız *-mcp paketleri sabitli).
const kilit = (JSON.parse(fs.readFileSync(path.join(ARAC, 'package-lock.json'), 'utf8')) as { packages: Record<string, { version?: string }> })
  .packages

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
interface Cikti {
  ok: boolean
  message: string
  board?: Pano
  task?: Gorev
}
interface KanbanArac {
  serialize: (output: Cikti, input: { action: string }) => string
}
interface Donus {
  board?: { totalTasks?: number; tasks?: Gorev[] }
  task?: Gorev
  ok?: boolean
}

/** Yamanın eklediği `content:` ifadesi — kol 5 bunu olduğu gibi koşturur. */
function yamaIfadesi(): string {
  const arti = fs
    .readFileSync(KANBAN_YAMASI, 'utf8')
    .split('\n')
    .filter((s) => s.startsWith('+') && !s.startsWith('+++'))
  expect(arti.length, 'yama her hedef dosyada tek satır değiştirmeli').toBeGreaterThan(0)
  const ifadeler = new Set(arti.map((s) => (s.match(/return \{ content: (.*), isError: failed \};/) ?? [])[1]))
  expect(ifadeler.size, 'hedef dosyalardaki yamalı satırlar birbirinin aynısı değil').toBe(1)
  const ifade = [...ifadeler][0]
  expect(ifade, 'yamalı satırda content ifadesi bulunamadı').toBeTruthy()
  return ifade as string
}

describe('INV-WRONGSTACK-KANBAN-YAMA-1 · kanban yazma dönüşü özetlenir', () => {
  it('en az bir yama var ve her yamanın adı kilitli paket sürümüyle aynı', () => {
    expect(yamalar.length, 'yamalar/ boş').toBeGreaterThan(0)
    for (const y of yamalar) {
      const m = y.match(/^([a-z0-9-]+?)-(\d+\.\d+\.\d+)-/)
      expect(m, `yama adı <paket>-<sürüm>-… biçiminde değil: ${y}`).not.toBeNull()
      const [, paket, surum] = m as RegExpMatchArray
      expect(kilit[`node_modules/@wrongstack/${paket}`]?.version, `${y}: kilitli sürüm farklı — yama yeniden ölçülmeli`).toBe(surum)
    }
  })

  it('yama sunucunun çalıştırdığı cli.js dosyasını ve index.js dosyasını birlikte değiştirir', () => {
    const y = fs.readFileSync(KANBAN_YAMASI, 'utf8')
    for (const f of ['cli.js', 'index.js']) {
      expect(y, `yama ${f} dosyasına dokunmuyor`).toContain(`+++ b/tools/wrongstack-mcp/node_modules/@wrongstack/kanban-mcp/dist/${f}`)
    }
    expect(y.split('\n').filter((s) => s.startsWith('-') && s.slice(1).trim() === YAMASIZ_SATIR).length).toBe(2)
    expect(yamaIfadesi()).toContain('kanbanTool.serialize(result, args)')
  })

  it('README kurulumu npm ci ardından yamaları uygular', () => {
    const r = fs.readFileSync(path.join(ARAC, 'README.md'), 'utf8')
    const ci = r.indexOf('npm ci --ignore-scripts')
    const uygula = r.indexOf('core.eol=lf apply "$y"')
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

  /** ⭐Kapının ayırt edici kolu: hedef dosya `.mcp.json`'dan okunur, elle yazılmaz. */
  it.skipIf(!KURULU)('.mcp.json\'ın ÇALIŞTIRDIĞI kanban dosyası yamalı', () => {
    const mcp = JSON.parse(fs.readFileSync(path.join(KOK, '.mcp.json'), 'utf8')) as {
      mcpServers: Record<string, { args?: string[] }>
    }
    const giris = (mcp.mcpServers['wrongstack-kanban']?.args ?? []).find((a) => a.endsWith('.js'))
    expect(giris, '.mcp.json wrongstack-kanban giriş dosyası bulunamadı').toBeTruthy()
    const kaynak = fs.readFileSync(path.join(KOK, giris as string), 'utf8')
    expect(kaynak, `${giris} hâlâ yamasız dönüş satırını taşıyor`).not.toContain(YAMASIZ_SATIR)
    expect(kaynak).toContain(yamaIfadesi())
  })

  /** Ayırt edici çiftler, yamadaki ifadenin kendisiyle ve gerçek kesiciyle. */
  it.skipIf(!KURULU)('yamalı ifade: yazmada özet + etkilenen kart, okumada tam pano, hatada dokunmaz', async () => {
    const { kanbanTool } = (await import(
      pathToFileURL(path.join(ARAC, 'node_modules', '@wrongstack', 'tools', 'dist', 'kanban.js')).href
    )) as { kanbanTool: KanbanArac }
    // Koşturulan metin depodaki KENDİ yama dosyamızdır (dış girdi değil); amaç, sunucuya giren
    // ifadenin aynısını sınamak — kopyasını testte yeniden yazmak ayrışmaya kapı açardı.
    const fabrika = new Function('result', 'args', 'kanbanTool', 'failed', `return (${yamaIfadesi()})`) as (
      result: Cikti,
      args: { action: string; taskId?: string },
      arac: KanbanArac,
      failed: boolean,
    ) => unknown
    const icerik = (result: Cikti, args: { action: string; taskId?: string }, arac: KanbanArac) =>
      fabrika(result, args, arac, false) as Donus
    const columns = ['backlog', 'todo', 'in-progress', 'review', 'done'].map((id) => ({ id, title: id }))
    const tasks: Gorev[] = Array.from({ length: 60 }, (_, i) => ({
      id: `t${i}`,
      columnId: columns[i % 5].id,
      title: `REC-${i} ${'x'.repeat(600)}`,
    }))
    const board: Pano = { id: 'b', title: 'pano', columns, tasks }
    const ham = JSON.stringify({ ok: true, message: 'x', board }).length
    expect(ham).toBeGreaterThan(30_000)
    const boy = (d: Donus) => JSON.stringify(d).length

    // okTask (add_task): kart zaten dönüşte → korunur, pano özetlenir
    const ekle = icerik({ ok: true, message: 'Task added.', board, task: tasks[3] }, { action: 'add_task' }, kanbanTool)
    expect(boy(ekle), 'add_task dönüşü hâlâ tüm panoyu taşıyor').toBeLessThan(3_000)
    expect(ekle.task?.id).toBe('t3')
    expect(ekle.board?.totalTasks).toBe(60)

    // okBoard (add_note): kart dönüşte YOK → yama taskId kartını ekler
    const not = icerik({ ok: true, message: 'Note added.', board }, { action: 'add_note', taskId: 't7' }, kanbanTool)
    expect(boy(not)).toBeLessThan(3_000)
    expect(not.task?.id, 'add_note dönüşünde etkilenen kart yok').toBe('t7')
    expect(not.task?.columnId).toBe('in-progress')

    // taskId panoda yoksa (delete_task sonrası) kart alanı hiç çıkmaz
    const sil = icerik({ ok: true, message: 'Task deleted.', board }, { action: 'delete_task', taskId: 'yok' }, kanbanTool)
    expect(JSON.parse(JSON.stringify(sil))).not.toHaveProperty('task')

    // get_board: okuma eylemi, pano tam kalır
    const oku = icerik({ ok: true, message: 'x', board }, { action: 'get_board' }, kanbanTool)
    expect(boy(oku), 'get_board dönüşü değişti').toBe(ham)

    // hata: dokunulmaz
    const hata = { ok: false, message: 'yok' }
    expect(fabrika(hata, { action: 'add_note' }, kanbanTool, true)).toBe(hata)
  })
})
