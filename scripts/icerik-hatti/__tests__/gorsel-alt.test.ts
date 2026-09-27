import { describe, expect, it } from 'vitest'
import { altPlani, turkceMi } from '../gorsel-alt.mjs'

const urunler = [
  { id: 'u1', sku: 'AVE-13055', name: 'SULU BATARYA 28 KW KANAL TİPİ', model_code: null },
  { id: 'u2', sku: 'AVE-NS4012100', name: 'NIMUS 401 T2 4kW', model_code: null },
  { id: 'u3', sku: 'SEA-51251003', name: 'SEAT 25 ATEX', model_code: null },
  { id: 'u5', sku: 'VRT-40321', name: 'Vortice E 304 M ATEX', model_code: '40321' },
]

describe('görsel alt metni çekirdeği (REC-146)', () => {
  it('Türkçe açıklamayı tanır; ondalık virgülü ve dilden bağımsız kalıbı tanımaz', () => {
    expect(turkceMi('AVenS NIMUS santrifuj fan (Casals Storm serisi)')).toBe(true)
    expect(turkceMi('Vortice TIRACAMINO Şömine ve Baca Fanı – 15000 – 1')).toBe(true)
    expect(turkceMi('KENTALFAN 315 T2 1,5kW – AVE-248312106 – 1')).toBe(false)
    expect(turkceMi('SEAT 25 ATEX – SEA-51251003 – 1')).toBe(false)
  })

  it('aile düzeyi Türkçe açıklamayı dilden bağımsız model adına çevirir; sıra sort_order ile', () => {
    const g = [
      { id: 'b', product_id: 'u2', alt: 'AVenS NIMUS santrifuj fan (Casals Storm serisi)', sort_order: 2 },
      { id: 'a', product_id: 'u2', alt: 'AVenS NIMUS santrifuj fan (Casals Storm serisi)', sort_order: 1 },
      { id: 'c', product_id: 'u5', alt: 'Vortice E serisi ATEX ex-proof duvar tipi aksiyel fan', sort_order: 0 },
    ]
    const yeni = altPlani(g, urunler).yazilacak.map(y => [y.id, y.yeni])
    expect(yeni).toEqual([
      ['b', 'NIMUS 401 T2 4kW – AVE-NS4012100 – 2'],
      ['a', 'NIMUS 401 T2 4kW – AVE-NS4012100 – 1'],
      ['c', 'Vortice E 304 M ATEX – 40321 – 1'],
    ])
  })

  it('ürün adı Türkçe ise yazmaz, sayfa koduna (URUN) devreder', () => {
    const p = altPlani([{ id: 'g1', product_id: 'u1', alt: 'SULU BATARYA 28 KW KANAL TİPİ – AVE-13055 – 2', sort_order: 1 }], urunler)
    expect(p.yazilacak).toEqual([])
    expect(p.kodGerekir.map(k => k.sku)).toEqual(['AVE-13055'])
  })

  it('dilden bağımsız alt metne dokunmaz; ürünsüz görsel RED', () => {
    const p = altPlani([
      { id: 'g1', product_id: 'u3', alt: 'SEAT 25 ATEX – SEA-51251003 – 1', sort_order: 0 },
      { id: 'g2', product_id: 'yok', alt: 'kanal tipi fan', sort_order: 0 },
    ], urunler)
    expect(p.dokunulmaz).toBe(1)
    expect(p.red.map(r => r.id)).toEqual(['g2'])
  })
})
