import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-MALIYET-YAZICI-1 · Faz 3'e kadar `product_costs`'a kod DOĞRUDAN yazmaz (REC-140 plan v3 §4 Faz 1 "yazıcı kuralı").
 *
 * NİÇİN: geçiş döneminde tek yön var — products → senkron tetik → product_costs. Kod product_costs'a doğrudan
 * yazarsa, products'taki eski değer bir sonraki güncellemede tetikle onun üstüne yazar (bayat üzerine yazma,
 * challenger 2.3). Veritabanı zaten zorluyor (authenticated'ın yalnız SELECT yetkisi var); bu kapı ikinci katman:
 * hata canlıda "permission denied" ile değil, PR'da adıyla görünsün.
 *
 * ÖMÜR: Faz 3 migration'ı yazımı açtığında bu kapı KALDIRILMAZ, tersine çevrilir (yazıcılar product_costs'a geçer).
 */

const KOK = path.resolve(__dirname, '../../..')
const YASAK_FIIL = /\.(insert|update|upsert|delete)\s*\(/

/** Kaynakta `from('product_costs')` zincirinde yazma fiili arar; yorumlar dışarıda. */
function yazimlar(kaynak: string): string[] {
  const govde = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const out: string[] = []
  const re = /\.from\(\s*['"`]product_costs['"`]\s*\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(govde))) {
    const zincir = govde.slice(m.index, m.index + 400).split(/;\s*\n|\n\s*\n/)[0] ?? ''
    if (YASAK_FIIL.test(zincir)) out.push(zincir.slice(0, 120).replace(/\s+/g, ' '))
  }
  return out
}

function kaynaklar(dizin: string): string[] {
  const out: string[] = []
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, g.name)
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name === '__tests__') continue
      out.push(...kaynaklar(p))
    } else if (/\.(ts|tsx|mjs|js)$/.test(g.name) && !/\.(test|spec)\./.test(g.name)) {
      out.push(p)
    }
  }
  return out
}

describe('INV-MALIYET-YAZICI-1 · product_costs yazıcı kuralı (Faz 3\'e kadar)', () => {
  const dosyalar = kaynaklar(path.join(KOK, 'src'))

  it('evren boş değil', () => {
    expect(dosyalar.length).toBeGreaterThan(200)
  })

  it('src/ altında product_costs\'a doğrudan insert/update/upsert/delete YOK', () => {
    const ihlal = dosyalar.flatMap((f) => yazimlar(fs.readFileSync(f, 'utf8')).map((z) => `${path.relative(KOK, f)} :: ${z}`))
    expect(ihlal, 'Faz 3\'e kadar yazımlar products üzerinden gider (senkron tetik taşır)').toEqual([])
  })

  it('SABOTAJ: yazan zincir yakalanır, okuyan ve yorumdaki geçmez', () => {
    expect(yazimlar(`await supabase.from('product_costs').update({ purchase_price: 1 }).eq('product_id', id)`)).toHaveLength(1)
    expect(yazimlar(`await db\n  .from("product_costs")\n  .upsert(row)`)).toHaveLength(1)
    expect(yazimlar(`await supabase.from('product_costs').select('purchase_price').eq('product_id', id)`)).toHaveLength(0)
    expect(yazimlar(`// supabase.from('product_costs').delete()`)).toHaveLength(0)
    expect(yazimlar(`await supabase.from('products').update({ purchase_price: 1 })`)).toHaveLength(0)
  })
})
