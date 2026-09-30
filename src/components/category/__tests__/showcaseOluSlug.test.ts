import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * REC-434 — CategoryShowcase, veritabanında OLMAYAN alt kategori adreslerine bağlanmaz.
 *
 * NİÇİN: hava perdesi vitrini iki kartı ('elektrikli-isitici', 'ortam-havali') elle yazılmış alt kategori
 * slug'larına bağlıyordu. Bu iki kategori DB'de hiç yok (ölçüm 2026-09-29: hava perdesinin alt kategorisi 0,
 * 8 ürün doğrudan üst kategoride; elektrikli/ortam havalı ayrımı iki AİLE — vortice-h-ad-elektrikli ve
 * vortice-hava-perdesi). Kartlar bugün çizilmiyordu (alt kategorisiz vitrin seri görünümüne düşer), ama
 * alt kategori eklenirse ölü adrese götürürdü. Elle yazılmış slug = veriyle ayrışan slug; kapı yazımı yakalar.
 */
const KAYNAK = fs.readFileSync(
  path.join(process.cwd(), 'src', 'components', 'category', 'CategoryShowcase.tsx'),
  'utf8',
)

describe('REC-434 — vitrin ölü alt kategori slug\'ı içermez', () => {
  it.each(['elektrikli-isitici', 'ortam-havali'])('%s slug literali bileşende yok', (slug) => {
    // Yorum satırları hariç: yalnız kod (tırnaklı literal) sayılır.
    const kod = KAYNAK.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/(?<!:)\/\/.*$/gm, '')
    expect(kod).not.toMatch(new RegExp(`['"\`]${slug}['"\`]`))
  })

  it('Routes.category çağrılarına elle yazılmış ikinci argüman verilmez', () => {
    // İkinci argüman alt kategori slug'ıdır; vitrinde yalnız veriden gelen değişken olabilir.
    const cagrilar = [...KAYNAK.matchAll(/Routes\.category\(([^)]*)\)/g)].map((m) => m[1])
    for (const arg of cagrilar) {
      expect(arg).not.toMatch(/,\s*['"`]/)
    }
  })
})
