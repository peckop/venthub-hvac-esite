// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ADRES_SEMASI_K3B } from '@/config/features'

import { ESKI_ADRES_HARITASI } from '../haritaKaynagi'

/**
 * Bayrak ↔ harita kapısı + Edge paketi hijyeni (REC-300 Faz 3 m.4).
 */
describe('ADRES_SEMASI_K3B ↔ eski adres haritası', () => {
  it('bayrak açıksa middleware\'in okuduğu harita null OLAMAZ ve varsayılan kiracıyı taşır', () => {
    // Bayrak açık + harita yok = her eski adres sessizce 404 (config satırları o PR'da silinir).
    if (ADRES_SEMASI_K3B) {
      expect(ESKI_ADRES_HARITASI).not.toBeNull()
      expect(ESKI_ADRES_HARITASI?.kiracilar['d3b07384-d113-495f-a558-8c38634e0000']?.urunSayisi ?? 0).toBeGreaterThan(0)
    } else {
      expect(ESKI_ADRES_HARITASI).toBeNull()
    }
  })
})

describe('Edge paketi: middleware zinciri DB istemcisi çekmez (kural 12, REC-289)', () => {
  const oku = (yol: string) => readFileSync(join(process.cwd(), yol), 'utf8')

  it.each(['src/lib/adres/eslestirici.ts', 'src/lib/adres/haritaKaynagi.ts', 'src/lib/adres/haritaTipi.ts'])(
    '%s supabase ya da üretici içe aktarmaz',
    (dosya) => {
      const kaynak = oku(dosya)
      expect(kaynak).not.toMatch(/from '@supabase\//)
      expect(kaynak).not.toMatch(/from '\.\/haritaUret'|from '\.\/envanter'/)
    }
  )

  it('middleware eşleyiciyi yalnız bayrak koşulunun içinde çağırır', () => {
    const kaynak = oku('src/middleware.ts')
    const cagri = kaynak.indexOf('eskiAdresEsle(')
    const kosul = kaynak.indexOf('if (ADRES_SEMASI_K3B) {')
    expect(kosul).toBeGreaterThan(-1)
    expect(cagri).toBeGreaterThan(kosul)
    expect(kaynak.match(/eskiAdresEsle\(/g)).toHaveLength(1)
  })
})
