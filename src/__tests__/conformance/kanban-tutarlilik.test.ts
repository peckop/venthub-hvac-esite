// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANBAN-TUTARLILIK-1..4 · Kanban tutarsızlık otomatik onarımı (ARC-125, OPS emri 13 Ekim 2026).
 *
 * ÖLÇÜLEN DERT: kokpit "22 tutarsız kart" gösterdi; 19'u Done'da hafta etiketi eksik, 2'si karar-verildi etiketli
 * Backlog kartıydı, her seferinde elle düzeltildi. Kural + kanca bunu kendiliğinden yapar.
 *
 * ⭐SINIR TESTLERİ ASIL İŞTİR: onarım kart içeriğine, notlara, başka etiketlere dokunmamalı ve Done'dan geri
 * taşımamalı. Yalnız "hafta etiketi ekledi" demek yetmez: eklerken mevcut etiketleri SİLMEDİĞİ ölçülür.
 * SABOTAJ: kural söküldüğünde test kırmızıya döner (PR gövdesindeki tablo).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/board/kanban-tutarlilik.cjs')
const KANCA = path.join(KOK, '.claude/hooks/kanban-tutarlilik-onarimi.cjs')

interface Kart {
  id: string
  title: string
  columnId: string
  status: string
  labels?: string[]
  completedAt?: string
  updatedAt?: string
}
interface Sonuc {
  taranan: number
  tutarsiz: number
  kurallar: Record<string, number>
  ihlalli: { id: string; kurallar: string[] }[]
  onarilan: { id: string; islem: string }[]
  hatalar: string[]
}
interface Betik {
  ihlaller: (t: unknown) => string[]
  plan: (t: Kart, simdi?: Date) => { etiketEkle: string | null; todoyaTasi: boolean; yalnizRapor: string[] }
  isoHafta: (d: Date) => number
  haftaEtiketi: (t: Partial<Kart>, simdi?: Date) => string
  calistir: (p: {
    kartlar: Kart[]
    yaz?: { etiketle: (t: Kart, l: string[]) => Promise<void>; tasi: (t: Kart, k: string, n: string) => Promise<void> }
    simdi?: Date
    kartKimligi?: string
  }) => Promise<Sonuc>
}
interface Kanca {
  onarimGerekli: (g: unknown) => { gerekli: boolean; kartKimligi?: string; panoKimligi?: string; sebep: string }
}

const betik = require_(BETIK) as Betik
const kanca = require_(KANCA) as Kanca

const kart = (o: Partial<Kart>): Kart => ({
  id: 'k1',
  title: 'ARC-9 · Örnek kart',
  columnId: 'done',
  status: 'completed',
  labels: ['karar-219'],
  completedAt: '2026-10-12T09:00:00.000Z',
  ...o,
})

describe('INV-KANBAN-TUTARLILIK-1 · ISO hafta: kokpit hafta modunun takvimiyle aynı', () => {
  it('5-11 Ekim → 41, 12-18 Ekim → 42 (OPS elle düzeltmede aynı aralığı kullandı); yıl sınırı doğru', () => {
    expect(betik.isoHafta(new Date(2026, 9, 5))).toBe(41)
    expect(betik.isoHafta(new Date(2026, 9, 11))).toBe(41)
    expect(betik.isoHafta(new Date(2026, 9, 12))).toBe(42)
    expect(betik.isoHafta(new Date(2026, 9, 18))).toBe(42)
    // 2026-01-01 Perşembe → ISO hafta 1; 2025-12-29 (Pzt) de hafta 1
    expect(betik.isoHafta(new Date(2026, 0, 1))).toBe(1)
    expect(betik.isoHafta(new Date(2025, 11, 29))).toBe(1)
    expect(betik.isoHafta(new Date(2027, 0, 3))).toBe(53)
  })

  it('etiket tamamlanma gününden gelir; completedAt yoksa updatedAt, o da yoksa şimdi', () => {
    expect(betik.haftaEtiketi({ completedAt: '2026-10-07T12:00:00.000Z' })).toBe('hafta-41')
    expect(betik.haftaEtiketi({ updatedAt: '2026-10-14T12:00:00.000Z' })).toBe('hafta-42')
    expect(betik.haftaEtiketi({}, new Date(2026, 9, 20))).toBe('hafta-43')
    expect(betik.haftaEtiketi({ completedAt: 'bozuk', updatedAt: '2026-10-13T08:00:00.000Z' })).toBe('hafta-42')
  })
})

describe('INV-KANBAN-TUTARLILIK-2 · tespit kokpit kuralıyla aynı dört tanım', () => {
  it('her kural ayrı tanınır; temiz ve arşivli kart sayılmaz', () => {
    expect(betik.ihlaller(kart({ labels: ['hafta-42'] }))).toEqual([])
    expect(betik.ihlaller(kart({ labels: [] }))).toEqual(['haftasiz'])
    expect(betik.ihlaller(kart({ labels: ['hafta-42', 'recep-bekliyor'] }))).toEqual(['bitenBekliyor'])
    expect(betik.ihlaller(kart({ labels: ['hafta-42'], title: 'Numarasız başlık' }))).toEqual(['numarasiz'])
    expect(betik.ihlaller(kart({ columnId: 'backlog', status: 'pending', labels: ['karar-verildi'] }))).toEqual(['kararAcik'])
    expect(betik.ihlaller(kart({ labels: [], status: 'archived' }))).toEqual([])
  })

  it('REC-nn ve 2-6 harfli kodlar departman kodudur (kokpit regex\'i)', () => {
    expect(betik.ihlaller(kart({ title: 'REC-488 · Eski kart', labels: ['hafta-41'] }))).toEqual([])
    expect(betik.ihlaller(kart({ title: 'GEO-SEO · ad', labels: ['hafta-41'] }))).toEqual(['numarasiz'])
  })
})

describe('INV-KANBAN-TUTARLILIK-3 · onarım planı SINIRI aşmaz', () => {
  it('haftasız biten kart: yalnız hafta etiketi eklenir, mevcut etiketler KORUNUR', async () => {
    const yazilan: { id: string; etiketler?: string[]; tasindi?: string }[] = []
    const k = kart({ id: 'a', labels: ['karar-219', 'rafta'] })
    const s = await betik.calistir({
      kartlar: [k],
      yaz: {
        etiketle: async (t, l) => void yazilan.push({ id: t.id, etiketler: l }),
        tasi: async (t, kolon) => void yazilan.push({ id: t.id, tasindi: kolon }),
      },
    })
    expect(yazilan).toEqual([{ id: 'a', etiketler: ['karar-219', 'rafta', 'hafta-42'] }])
    expect(s.onarilan).toHaveLength(1)
  })

  it('karar-verildi Backlog kartı To Do\'ya taşınır; etiket EKLENMEZ, başka şeye dokunulmaz', async () => {
    const yazilan: { id: string; etiketler?: string[]; tasindi?: string }[] = []
    const k = kart({ id: 'b', columnId: 'backlog', status: 'pending', labels: ['karar-verildi'], completedAt: undefined })
    await betik.calistir({
      kartlar: [k],
      yaz: {
        etiketle: async (t, l) => void yazilan.push({ id: t.id, etiketler: l }),
        tasi: async (t, kolon) => void yazilan.push({ id: t.id, tasindi: kolon }),
      },
    })
    expect(yazilan).toEqual([{ id: 'b', tasindi: 'todo' }])
  })

  it('YALNIZ RAPOR kalan haller yazılmaz: biten+bekliyor, numarasız, To Do\'daki karar-verildi kart', async () => {
    const yazilan: unknown[] = []
    const s = await betik.calistir({
      kartlar: [
        kart({ id: 'c', labels: ['hafta-42', 'karar-bekliyor'] }),
        kart({ id: 'd', title: 'Numarasız', labels: ['hafta-42'] }),
        kart({ id: 'e', columnId: 'todo', status: 'pending', labels: ['karar-verildi'] }),
      ],
      yaz: { etiketle: async (...a) => void yazilan.push(a), tasi: async (...a) => void yazilan.push(a) },
    })
    expect(yazilan).toEqual([])
    expect(s.tutarsiz).toBe(3)
    expect(s.onarilan).toEqual([])
  })

  it('Done kartı geri TAŞINMAZ; onarım İKİNCİ koşuda iş bulmaz (idempotent)', async () => {
    const cagrilar: string[] = []
    const kartlar = [kart({ id: 'f', labels: [] }), kart({ id: 'g', columnId: 'backlog', status: 'pending', labels: ['karar-verildi'] })]
    const yaz = {
      etiketle: async (t: Kart, l: string[]) => { t.labels = l; cagrilar.push('etiket:' + t.id) },
      tasi: async (t: Kart, k: string) => { t.columnId = k; cagrilar.push('tasi:' + t.id) },
    }
    await betik.calistir({ kartlar, yaz })
    expect(cagrilar.sort()).toEqual(['etiket:f', 'tasi:g'])
    const ikinci = await betik.calistir({ kartlar, yaz })
    expect(ikinci.onarilan).toEqual([])
    expect(cagrilar).toHaveLength(2)
  })

  it('--kart tek kartı onarır, diğerlerine dokunmaz; yazıcı hata verirse hata raporlanır, koşu çökmez', async () => {
    const cagrilar: string[] = []
    const s = await betik.calistir({
      kartlar: [kart({ id: 'x', labels: [] }), kart({ id: 'y', labels: [] })],
      kartKimligi: 'y',
      yaz: { etiketle: async (t) => { cagrilar.push(t.id); throw new Error('sunucu yok') }, tasi: async () => undefined },
    })
    expect(cagrilar).toEqual(['y'])
    expect(s.hatalar[0]).toContain('sunucu yok')
  })
})

describe('INV-KANBAN-TUTARLILIK-4 · kanca yalnız ilgili çağrıda tetiklenir ve asla engellemez', () => {
  const cagri = (ti: Record<string, unknown>, ek: Record<string, unknown> = {}) => ({
    tool_name: 'mcp__wrongstack-kanban__kanban_manage',
    tool_input: { boardId: 'p1', taskId: 'k1', ...ti },
    tool_response: '{"ok":true}',
    ...ek,
  })

  it('Done\'a taşıma ve karar-verildi etiketi tetikler, kart ve pano kimliğini taşır', () => {
    expect(kanca.onarimGerekli(cagri({ action: 'move_task', targetColumnId: 'done' }))).toMatchObject({
      gerekli: true,
      kartKimligi: 'k1',
      panoKimligi: 'p1',
    })
    expect(kanca.onarimGerekli(cagri({ action: 'transition_task', lifecycleStage: 'done' })).gerekli).toBe(true)
    expect(kanca.onarimGerekli(cagri({ action: 'update_task', labels: ['karar-verildi'] })).gerekli).toBe(true)
  })

  it('ilgisiz çağrılar tetiklemez: başka araç, not ekleme, başarısız çağrı, etiket/sütun tetiği yok', () => {
    expect(kanca.onarimGerekli({ tool_name: 'Bash', tool_input: {} }).gerekli).toBe(false)
    expect(kanca.onarimGerekli(cagri({ action: 'add_note', note: 'done' })).gerekli).toBe(false)
    expect(kanca.onarimGerekli(cagri({ action: 'move_task', targetColumnId: 'done' }, { tool_response: '{"ok":false,"error":{}}' })).gerekli).toBe(false)
    expect(kanca.onarimGerekli(cagri({ action: 'move_task', targetColumnId: 'in-progress' })).gerekli).toBe(false)
    expect(kanca.onarimGerekli(cagri({ action: 'move_task', targetColumnId: 'done', taskId: '' })).gerekli).toBe(false)
  })

  it('kanca SÜRECİ: bozuk girdide ve vana açıkken çıkış 0, çıktı yok', () => {
    const kos = (girdi: string, env: Record<string, string> = {}) =>
      spawnSync(process.execPath, [KANCA], { input: girdi, encoding: 'utf8', env: { ...process.env, ...env } })
    const bozuk = kos('{bozuk json')
    expect(bozuk.status).toBe(0)
    expect(bozuk.stdout).toBe('')
    const vana = kos(JSON.stringify(cagri({ action: 'move_task', targetColumnId: 'done' })), { VENTHUB_KANBAN_ONARIM_KAPALI: '1' })
    expect(vana.status).toBe(0)
    expect(vana.stdout).toBe('')
  })
})
