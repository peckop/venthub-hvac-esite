/**
 * ADM-6 — ürün CSV içe aktarımında şema doğrulaması ve kategori kimliği kapsamı.
 *
 * NİÇİN: `status` hücresi türe zorlanıyor, `stock_qty` NaN olabiliyordu; `category_id` hücresi
 * hiç denetlenmeden yazıma giriyordu. Kategori listesi bileşene kendi tenant'ının okumasından
 * gelir; listede olmayan bir kimlik (başka tenant'ın kategorisi ya da uydurma değer) ürünü
 * görünmez bir kategoriye bağlardı. Cetvel: csv-import-export-standard.md §1.2.
 */
import { describe, expect, it } from 'vitest'

import { hazirlaUrunSatirlari } from '../csvProductMapping'

const KATEGORI = [{ id: 'c1', name: 'Fanlar', slug: 'fans' }]

describe('hazirlaUrunSatirlari — şema doğrulaması', () => {
  it('geçersiz alanlı satır yazılmaz, satır numarası ve alan adıyla gecersiz listesine düşer', () => {
    const s = hazirlaUrunSatirlari(
      [
        { sku: 'A-1', name: 'Fan', status: 'yayinda' },
        { sku: 'a-2', name: 'Fan' },
        { sku: 'A-3', name: 'Fan', stock_qty: '-1' },
        { sku: 'A-4', name: 'Fan', stock_qty: '3', status: 'draft' },
      ],
      KATEGORI,
      [2, 3, 4, 5],
    )
    expect(s.payloads.map((p) => p.sku)).toEqual(['A-4'])
    expect(s.payloads[0]).toMatchObject({ stock_qty: 3, status: 'draft' })
    expect(s.gecersiz).toEqual([
      { satir: 2, sku: 'A-1', alan: 'status' },
      { satir: 3, sku: 'a-2', alan: 'sku' },
      { satir: 4, sku: 'A-3', alan: 'stock_qty' },
    ])
  })

  it('satır numarası verilmezse başlık sonrası sıra kullanılır', () => {
    const s = hazirlaUrunSatirlari([{ sku: 'A-1', name: 'Fan', status: 'x' }], KATEGORI)
    expect(s.gecersiz).toEqual([{ satir: 2, sku: 'A-1', alan: 'status' }])
  })
})

describe('hazirlaUrunSatirlari — category_id kendi kategori listesiyle sınırlı', () => {
  it('listede olan kimlik yazılır', () => {
    const s = hazirlaUrunSatirlari([{ sku: 'A-1', name: 'Fan', category_id: 'c1' }], KATEGORI)
    expect(s.payloads[0].category_id).toBe('c1')
    expect(s.reddedilen).toEqual([])
  })

  it('listede olmayan kimlik YAZILMAZ, reddedilenlere düşer', () => {
    const s = hazirlaUrunSatirlari(
      [{ sku: 'A-1', name: 'Fan', category_id: '00000000-0000-0000-0000-000000000000' }],
      KATEGORI,
    )
    expect(s.payloads).toEqual([])
    expect(s.reddedilen).toEqual([{ sku: 'A-1', deger: '00000000-0000-0000-0000-000000000000' }])
  })
})
