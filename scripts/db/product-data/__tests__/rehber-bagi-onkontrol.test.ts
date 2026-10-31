import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { kesisim, kimlikleriTopla } from '../rehber-bagi-onkontrol.mjs'

// KTL-68: REC-397 yazımı (31 Ekim) kanal tipi fan rehberini 500'e düşürdü; ön-kontrol bu kırılmayı yakalar.
describe('rehber-bagi-onkontrol', () => {
  const ornek = [
    'urunler: [\'vh:aile/a-ailesi\', \'vh:aile/b-ailesi\']',
    'Bkz. [kategori](vh:kategori/duct-fans) ve [model](vh:model/VRT-1)',
  ].join('\n')

  it('aile, kategori ve model kimliklerini satır numarasıyla toplar', () => {
    const b = kimlikleriTopla(ornek)
    expect(b).toEqual([
      { tur: 'aile', slug: 'a-ailesi', satir: 1 },
      { tur: 'aile', slug: 'b-ailesi', satir: 1 },
      { tur: 'kategori', slug: 'duct-fans', satir: 2 },
      { tur: 'model', slug: 'VRT-1', satir: 2 },
    ])
  })

  it('etkilenen aile rehberde geçiyorsa kesişim döner (sabotaj: geçmiyorsa boş)', () => {
    const b = kimlikleriTopla(ornek)
    expect(kesisim(b, { aile: ['b-ailesi'], model: [], kategori: [] })).toHaveLength(1)
    expect(kesisim(b, { aile: ['yok-aile'], model: [], kategori: [] })).toHaveLength(0)
  })

  it('tür karışmaz: aile slug\'ı kategori listesinde aranmaz', () => {
    const b = kimlikleriTopla(ornek)
    expect(kesisim(b, { aile: [], model: [], kategori: ['a-ailesi'] })).toHaveLength(0)
  })

  it('gerçek rehber metni taranabilir ve kimlik içerir', () => {
    const metin = readFileSync(resolve(__dirname, '../../../../src/data/bilgiMerkezi/yazilar.ts'), 'utf8')
    expect(kimlikleriTopla(metin).length).toBeGreaterThan(10)
  })
})
