// @vitest-environment node
/**
 * INV-YAYINDA-MODEL-10 — ağ kapısının AĞSIZ çekirdeği ve boş-liste davranışı (URN-31).
 * Canlı DB'ye bu testte çıkılmaz; kapının kararı sahte satırlarla ölçülür. Boş listede betik ağa çıkmadan 0 verir.
 */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { agKapisiDegerlendir, beklenenler } from '../yayinda-model-ag-kapisi.mjs'

type Urun = { sku: string; status: string; deleted_at: string | null; family_id: string | null }

const veri = {
  modeller: { 'aile-a': { 'AAA-100': { tr: 'a', en: 'b' }, 'AAA-200': { tr: 'c', en: 'd' } } },
  surumler: { 'AAA-101': { temel: 'AAA-100', tr: 'e', en: 'f' } },
}
const aileler = [{ id: 'f1', slug: 'aile-a' }, { id: 'f2', slug: 'aile-b' }]
const iyiUrunler: Urun[] = [
  { sku: 'AAA-100', status: 'active', deleted_at: null, family_id: 'f1' },
  { sku: 'AAA-200', status: 'active', deleted_at: null, family_id: 'f1' },
  { sku: 'AAA-101', status: 'active', deleted_at: null, family_id: 'f1' },
]
const degistir = (sku: string, yama: Partial<Urun>) => (u: Urun[]): Urun[] => u.map((x) => (x.sku === sku ? { ...x, ...yama } : x))

describe('agKapisiDegerlendir', () => {
  it('beklenenler: modeller + sürümler, sürümün ailesi temelinden', () => {
    expect(beklenenler(veri)).toEqual([
      { sku: 'AAA-100', aile: 'aile-a', surum: false },
      { sku: 'AAA-200', aile: 'aile-a', surum: false },
      { sku: 'AAA-101', aile: 'aile-a', surum: true },
    ])
  })

  it('temiz DB → hata yok', () => {
    expect(agKapisiDegerlendir(veri, iyiUrunler, aileler)).toEqual([])
  })

  it.each([
    ['DB\'de yok', (u: Urun[]) => u.filter((x) => x.sku !== 'AAA-200'), 'DB\'de yok'],
    ['pasif/arşivli', degistir('AAA-200', { status: 'archived' }), 'active değil'],
    ['silinmiş', degistir('AAA-200', { deleted_at: '2026-10-01' }), 'silinmiş'],
    ['yanlış aile', degistir('AAA-200', { family_id: 'f2' }), 'listedeki'],
    ['ailesiz', degistir('AAA-200', { family_id: null }), 'ailesi yok'],
    ['sürüm yanlış ailede', degistir('AAA-101', { family_id: 'f2' }), 'sürüm'],
  ])('%s → KIRMIZI', (_ad, boz, metin) => {
    const hatalar = agKapisiDegerlendir(veri, boz(iyiUrunler), aileler)
    expect(hatalar.length).toBeGreaterThan(0)
    expect(hatalar.join('\n')).toContain(metin)
  })

  it('boş liste → hata yok', () => {
    expect(agKapisiDegerlendir({ modeller: {}, surumler: {} }, [], [])).toEqual([])
  })
})

describe('betik (boş liste: ağsız, çıkış 0)', () => {
  it('gerçek liste boşken ağa çıkmadan TEMİZ (ortam değişkeni olmadan da)', () => {
    const sonuc = spawnSync(process.execPath, [join(process.cwd(), 'scripts/seo/yayinda-model-ag-kapisi.mjs')], {
      encoding: 'utf8',
      env: { PATH: process.env.PATH ?? '' },
    })
    expect(sonuc.status).toBe(0)
    expect(sonuc.stdout).toContain('BOŞ')
  })
})
