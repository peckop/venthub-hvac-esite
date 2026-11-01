/**
 * INV-KANIT-DONUSTUR-1 — Açık kartlardaki koşmayacak kanıtlar mekanik olarak manual'a çevrilir; kırmızı kanıt
 * passed YAPILMAZ, Done/arşiv kartlara dokunulmaz (ARC-78).
 *
 * Betik: scripts/board/kanit-donustur.cjs · kural aynı: .claude/hooks/kanban-kanit-yolu-kapisi.cjs
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts', 'board', 'kanit-donustur.cjs')

interface Kontrol {
  id: string
  type: string
  status: string
  description: string
  notes?: string
}
interface Kart {
  id: string
  boardId: string
  title: string
  columnId?: string
  status?: string
  successCriteria?: Kontrol[]
}
interface Yazim {
  boardId: string
  taskId: string
  checkId: string
  checkType: string
  checkNotes: string
  author: string
  checkStatus?: string
}
interface Modul {
  planla: (k: Kart[], ekler: string[] | null) => { taranan: number; acik: number; kontrol: number; donusecek: { checkId: string; durum: string; eskiGovde: string; yeniNot: string }[]; kategori: Record<string, number> }
  uygula: (p: unknown, y: { kontrolGuncelle: (g: Yazim) => Promise<unknown> }) => Promise<{ yazilan: number; hatalar: string[] }>
  kapaliMi: (t: Partial<Kart>) => boolean
  NOT_METNI: string
}
const m = gerek(BETIK) as Modul

const GH = ['+gh']
const kontrol = (id: string, type: string, notes: string, status = 'pending'): Kontrol => ({ id, type, status, description: `açıklama ${id}`, notes })
const kart = (id: string, kontroller: Kontrol[], ek: Partial<Kart> = {}): Kart => ({ id, boardId: 'B1', title: `ARC-${id} iş`, columnId: 'in-progress', status: 'in_progress', successCriteria: kontroller, ...ek })

const KARTLAR: Kart[] = [
  kart('1', [kontrol('c1', 'command', 'git log -1'), kontrol('c2', 'command', 'gh api repos/peckop/venthub-hvac-esite/pulls/1/merge')]),
  kart('2', [kontrol('c3', 'command', 'pnpm test:ilgili', 'failed'), kontrol('c4', 'file_exists', 'C:/tmp/x.md', 'failed')]),
  kart('3', [kontrol('c5', 'file_exists', 'docs/x.md'), kontrol('c6', 'manual', 'git log'), kontrol('c7', 'test', 'src/a.test.ts')]),
  kart('4', [kontrol('c8', 'command', 'node -e 1')], { columnId: 'done', status: 'completed' }),
  kart('5', [kontrol('c9', 'command', 'git log')], { columnId: 'backlog', status: 'archived' }),
  kart('6', [kontrol('c10', 'command', 'gh api x | grep y')]),
]

describe('INV-KANIT-DONUSTUR-1 · plan', () => {
  const p = m.planla(KARTLAR, GH)

  it('yalnız açık kartlardaki geçersiz kanıtlar dönüşür; Done ve arşivli kart sayılmaz', () => {
    expect(p.taranan).toBe(6)
    expect(p.acik).toBe(4)
    expect(p.donusecek.map((d) => d.checkId).sort()).toEqual(['c1', 'c10', 'c3', 'c4'])
  })

  it('geçerli komut, geçerli yol, manual ve test türü olduğu gibi kalır', () => {
    const ids = new Set(p.donusecek.map((d) => d.checkId))
    for (const id of ['c2', 'c5', 'c6', 'c7']) expect(ids.has(id), id).toBe(false)
  })

  it('kırmızı kanıt kırmızı kalır: plan durumu değiştirmez, yeni not eski gövdeyi ve cümleyi taşır', () => {
    const c3 = p.donusecek.find((d) => d.checkId === 'c3')
    expect(c3?.durum).toBe('failed')
    expect(c3?.yeniNot).toContain('pnpm test:ilgili')
    expect(c3?.yeniNot).toContain(m.NOT_METNI)
    expect(p.donusecek.find((d) => d.checkId === 'c4')?.durum).toBe('failed')
  })

  it('kategoriler sayılır (OPS --kuru sayısı)', () => {
    expect(Object.values(p.kategori).reduce((a, b) => a + b, 0)).toBe(4)
  })

  it('kapaliMi: done sütunu, completed ve archived durumları', () => {
    expect(m.kapaliMi({ columnId: 'done' })).toBe(true)
    expect(m.kapaliMi({ status: 'completed' })).toBe(true)
    expect(m.kapaliMi({ status: 'archived' })).toBe(true)
    expect(m.kapaliMi({ columnId: 'in-progress', status: 'in_progress' })).toBe(false)
  })
})

describe('INV-KANIT-DONUSTUR-1 · uygulama', () => {
  it('update_check yalnız tür (manual) ve not gönderir; ASLA durum göndermez; hata sayılır, döngü sürer', async () => {
    const p = m.planla(KARTLAR, GH)
    const gonderilen: Yazim[] = []
    const s = await m.uygula(p, {
      kontrolGuncelle: async (g) => {
        if (g.checkId === 'c3') throw new Error('pano kapalı')
        gonderilen.push(g)
      },
    })
    expect(s.yazilan).toBe(3)
    expect(s.hatalar).toHaveLength(1)
    expect(s.hatalar[0]).toContain('pano kapalı')
    for (const g of gonderilen) {
      expect(g.checkType).toBe('manual')
      expect(g.author).toBe('ARC-78')
      expect(g).not.toHaveProperty('checkStatus') // passed'a çevirme YASAK
    }
  })

  it('SABOTAJ: durum gönderen ya da Done kartı da çeviren bir kopya bu testlerde kırılırdı', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'kanit-donustur-'))
    try {
      // 1) kapaliMi her zaman false → Done/arşiv kartlar da dönüşür
      const degisti = kaynak.replace("return sutun === 'done' || durum === 'completed' || durum === 'archived'", 'return false')
      expect(degisti).not.toBe(kaynak)
      fs.mkdirSync(path.join(gecici, 'scripts', 'board'), { recursive: true })
      fs.mkdirSync(path.join(gecici, '.claude', 'hooks'), { recursive: true })
      fs.copyFileSync(path.join(KOK, '.claude', 'hooks', 'kanban-kanit-yolu-kapisi.cjs'), path.join(gecici, '.claude', 'hooks', 'kanban-kanit-yolu-kapisi.cjs'))
      const f = path.join(gecici, 'scripts', 'board', 'kanit-donustur.cjs')
      fs.writeFileSync(f, degisti)
      const sabotajli = gerek(f) as Modul
      expect(sabotajli.planla(KARTLAR, GH).donusecek.map((d) => d.checkId)).toContain('c8') // Done kartın kanıtı dönüşüyor
      expect(m.planla(KARTLAR, GH).donusecek.map((d) => d.checkId)).not.toContain('c8') // sağlam betik dokunmuyor
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true })
    }
  })
})

describe('INV-KANIT-DONUSTUR-1 · komut satırı', () => {
  it('varsayılan kip KURU: bilinmeyen/uygulama bayrağı yokken yazmaz (çıktı "KURU" der, dönüşüm uygulanmaz)', () => {
    const { argumanlar } = gerek(BETIK) as { argumanlar: (a: string[]) => { uygula: boolean; json: boolean; panolar: string[] } }
    expect(argumanlar([]).uygula).toBe(false)
    expect(argumanlar(['--kuru']).uygula).toBe(false)
    expect(argumanlar(['--uygula']).uygula).toBe(true)
    expect(argumanlar(['--pano', 'P1', '--pano', 'P2', '--json'])).toMatchObject({ panolar: ['P1', 'P2'], json: true, uygula: false })
  })

  it('betik bir süreç olarak yüklenir (söz dizimi sağlam)', () => {
    const r = spawnSync(process.execPath, ['--check', BETIK], { encoding: 'utf8', windowsHide: true })
    expect(r.status).toBe(0)
  })
})
